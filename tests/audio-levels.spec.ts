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
    const measureFresh = async (slot: number) => {
      await page.goto('/');
      await tile.waitFor({ state: 'visible' });
      await page.waitForTimeout(1500);
      await page.evaluate(n => (window as any).__gsSeed(n), SEED);
      await tile.click({ force: true }); // entra pelo card, como o usuário: o toque libera o áudio
      await page.waitForFunction(k => document.body.classList.contains('in-session') && (window as any).__gs.state().style === k, g);
      await page.waitForTimeout(2500); // som de entrada termina e as amostras .wav terminam de decodificar
      await page.evaluate(n => (window as any).__gsSeed(n), SEED + slot);
      return gs<Run>(page, 'measure', slot, BARS);
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
    // comparação com a referência (só na versão nova)
    if (!BASELINE) {
      const ref = JSON.parse(fs.readFileSync(file, 'utf8')).slots as Record<string, Run[]>;
      for (const slot in result) {
        const run = result[slot][0];
        // clipagem: pico real da saída final (ou a luz do app). Onde a 1.7.8.1 já clipava (Acid House, padrão 3),
        // a versão nova não pode clipar mais que ela (folga de 0,5 dB); em qualquer outro lugar não pode clipar.
        const refMax = Math.max(...ref[slot].map(x => x.masterRaw));
        if (run.masterRaw >= CLIP || run.clip) {
          if (refMax < CLIP) problems.push(`padrão ${+slot + 1}: clipou (pico da saída ${run.masterRaw.toFixed(3)}); na 1.7.8.1 não clipava`);
          else if (20 * Math.log10(run.masterRaw / refMax) > 0.5) problems.push(`padrão ${+slot + 1}: clipou mais que na 1.7.8.1 (${run.masterRaw.toFixed(3)} contra ${refMax.toFixed(3)})`);
        }
        for (const k of new Set([...Object.keys(run.lanes), ...ref[slot].flatMap(x => Object.keys(x.lanes))])) {
          const vals = ref[slot].map(x => x.lanes[k] || 0), lo = Math.min(...vals) - TOL, hi = Math.max(...vals) + TOL, v = run.lanes[k] || 0;
          if (v < lo || v > hi) problems.push(`padrão ${+slot + 1}, faixa ${k}: ${v.toFixed(3)} fora de ${lo.toFixed(3)}..${hi.toFixed(3)}`);
        }
      }
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });
}
