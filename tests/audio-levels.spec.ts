// Níveis de áudio: para cada gênero e cada um dos 4 padrões, toca todas as linhas no mesmo padrão durante
// 4 compassos (de 5,5 s a 9,6 s, conforme o andamento: assim o loop inteiro entra na medição) e mede o pico de
// cada faixa no mesmo ponto e na mesma escala dos medidores do próprio app (0 a 1).
// Regras: nenhuma faixa com padrão pode ficar muda; a versão nova não pode clipar onde a 1.7.8.1 não clipa; e
// cada faixa tem que ficar a no máximo 0,03 da faixa de valores medida na 1.7.8.1.
// Na referência (GS_BASELINE=1) cada padrão é medido 3 vezes, para conhecer a variação natural. Cada medição
// começa com o app recém-aberto.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepare, gs, isMainView, browserOf, BASELINE } from './helpers';

const ORDER = ['house', 'deep', 'acid', 'techno', 'acidtechno', 'funk', 'dnb', 'solomun', 'afro', 'vice', 'cumbia']; // ordem dos canais CH01..CH11
const RUNS = BASELINE ? 3 : 1;
const TOL = 0.03;
const CLIP = 0.999; // pico da saída final a partir do qual o som clipa (o mesmo limite da luz do app)
const BARS = 4;
const SEED = 20261127;
const dir = (b: string) => path.join(path.dirname(fileURLToPath(import.meta.url)), 'baseline', 'levels', b);

type Run = { on: string[]; lanes: Record<string, number>; raw: Record<string, number>; lv: Record<string, number>; master: number; masterRaw: number; clip: boolean; seconds: number };

test.describe.configure({ mode: 'parallel' });

for (const g of ORDER) {
  test(`níveis ${g}`, async ({ page }, info) => {
    test.skip(!isMainView(info), 'níveis rodam só no tamanho principal');
    test.setTimeout(600_000);
    await prepare(page, info);
    const tile = page.locator(`.htile[data-ch="CH${String(ORDER.indexOf(g) + 1).padStart(2, '0')}"]`);

    // cada medição começa do zero (app recém-aberto, mesmo sorteio, sem rabo de som da medição anterior),
    // para a versão nova e a 1.7.8.1 serem medidas exatamente nas mesmas condições
    const measureFresh = async (slot: number): Promise<Run> => {
      for (let attempt = 1; ; attempt++) {
        await page.goto('/');
        await tile.waitFor({ state: 'visible' });
        await page.waitForTimeout(1500);
        await page.evaluate(n => (window as any).__gsSeed(n), SEED);
        await tile.click({ force: true }); // entra pelo card, como o usuário: o toque libera o áudio
        // com várias páginas abertas, o navegador de teste às vezes perde o clique: recarrega e tenta de novo
        const entered = await page.waitForFunction(k => document.body.classList.contains('in-session') && (window as any).__gs.state().style === k, g, { timeout: 10_000 }).then(() => true, () => false);
        if (!entered) { if (attempt < 3) continue; throw new Error('não entrou no gênero ' + g) }
        await page.waitForTimeout(+(process.env.GS_LEVELS_WAIT || 6000)); // som de entrada termina e as amostras .wav terminam de decodificar (com menos
        // tempo, a 1.7.8.1 às vezes ainda toca o prato sintetizado de reserva, e a medição varia)
        await page.evaluate(n => (window as any).__gsSeed(n), SEED + slot);
        return gs<Run>(page, 'measure', slot, BARS);
      }
    };

    const result: Record<string, Run[]> = {};
    for (let slot = 0; slot < 4; slot++) {
      result[slot] = [];
      for (let r = 0; r < RUNS; r++) result[slot].push(await measureFresh(slot));
    }

    const b = browserOf(info);
    const file = path.join(dir(b), `${g}.json`);
    if (BASELINE) {
      fs.mkdirSync(dir(b), { recursive: true });
      fs.writeFileSync(file, JSON.stringify({ genre: g, runs: RUNS, bars: BARS, slots: result }, null, 1));
    }

    // regra que vale para qualquer versão: nenhuma faixa com padrão pode ficar muda
    const problems: string[] = [];
    for (const slot in result) for (const run of result[slot])
      for (const k of run.on) if (!(run.lanes[k] > 0)) problems.push(`padrão ${+slot + 1}: faixa ${k} muda`);
    // comparação com a referência (só na versão nova). Algumas faixas variam sozinhas até na 1.7.8.1 (pratos e
    // efeitos do Ocean Drive e do Deep House); então, se uma faixa sair da faixa esperada, o padrão é medido de novo
    // (até 3 vezes no total, sempre com o app recém-aberto) e ela só reprova se ficar fora em todas.
    if (!BASELINE) {
      const ref = JSON.parse(fs.readFileSync(file, 'utf8')).slots as Record<string, Run[]>;
      for (const slot in result) {
        const rs = ref[slot], refMax = Math.max(...rs.map(x => x.masterRaw));
        const keys = [...new Set([...Object.keys(result[slot][0].lanes), ...rs.flatMap(x => Object.keys(x.lanes))])];
        const range = (k: string) => { const vals = rs.map(x => x.lanes[k] || 0); return [Math.min(...vals) - TOL, Math.max(...vals) + TOL] };
        const outOf = (run: Run) => keys.filter(k => { const [lo, hi] = range(k), v = run.lanes[k] || 0; return v < lo || v > hi });
        // clipagem: pico real da saída final (ou a luz do app). Onde a 1.7.8.1 já clipava (Acid House, padrão 3),
        // a versão nova não pode clipar mais que ela (folga de 0,5 dB); em qualquer outro lugar não pode clipar.
        const clipErr = (run: Run) => run.masterRaw >= CLIP || run.clip
          ? (refMax < CLIP ? `clipou (pico da saída ${run.masterRaw.toFixed(3)}); na 1.7.8.1 não clipava`
            : 20 * Math.log10(run.masterRaw / refMax) > 0.5 ? `clipou mais que na 1.7.8.1 (${run.masterRaw.toFixed(3)} contra ${refMax.toFixed(3)})` : '')
          : '';
        let pending = outOf(result[slot][0]);
        while (pending.length && result[slot].length < 3) {
          const again = await measureFresh(+slot);
          result[slot].push(again);
          const still = outOf(again);
          pending = pending.filter(k => still.includes(k));
        }
        for (const run of result[slot]) { const c = clipErr(run); if (c) problems.push(`padrão ${+slot + 1}: ${c}`) }
        for (const k of pending) {
          const [lo, hi] = range(k);
          problems.push(`padrão ${+slot + 1}, faixa ${k}: ${result[slot].map(r => (r.lanes[k] || 0).toFixed(3)).join(' / ')} fora de ${lo.toFixed(3)}..${hi.toFixed(3)}`);
        }
      }
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });
}
