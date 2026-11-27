// Controles que mexem no som (Remix FX; depois efeitos e mixer): com o controle acionado PELA TELA, toca o House no
// padrão 1 por 4 compassos e mede o volume médio (RMS), o volume só dos agudos (acima de 4 kHz) e o pico da saída final. A versão nova tem que soar igual à
// 1.7.8.1: diferença de no máximo 0,25 dB no volume médio, 0,5 dB nos agudos e 0,03 no pico (escala do medidor), além da variação natural
// medida em 3 rodadas da 1.7.8.1. Roda mudo e em 48 kHz, como os outros testes de áudio.
import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepare, gs, isMainView, browserOf, BASELINE } from './helpers';

const RUNS = BASELINE ? 3 : 1, SEED = 20261127, BARS = 4;
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'baseline', 'controls');
type Run = { masterRms: number; master: number; masterRaw: number; hfRms?: number };

// cada cenário: o que fazer na tela antes de tocar (o controle fica acionado durante toda a medição)
const box = async (page: Page, sel: string) => { const b = await page.locator(sel).boundingBox(); if (!b) throw new Error('sem ' + sel); return b };
const SCEN: Record<string, (page: Page) => Promise<void>> = {
  'sem controle': async () => {},
  'remix filtro grave': async page => { const b = await box(page, '#rxF .rxs'); await page.mouse.move(b.x + b.width * .15, b.y + b.height * .6); await page.mouse.down() },
  'remix filtro agudo': async page => { const b = await box(page, '#rxF .rxs'); await page.mouse.move(b.x + b.width * .85, b.y + b.height * .3); await page.mouse.down() },
  'remix eco': async page => { const b = await box(page, '#rxE .rxs'); await page.mouse.move(b.x + b.width * .55, b.y + b.height * .35); await page.mouse.down() },
  'remix gater': async page => { const b = await box(page, '#rxG .rxst'); await page.mouse.move(b.x + b.width / 2, b.y + b.height * .3); await page.mouse.down() },
  'remix pitch': async page => { const b = await box(page, '#rxD .rxst'); await page.mouse.move(b.x + b.width / 2, b.y + b.height * .2); await page.mouse.down() },
  // One Shots (o botão está escondido na 1.7.8.1; a janela abre pelo próprio botão): toca o som logo antes de começar
  'oneshot buzina': page => oneShot(page, 0),
  'oneshot riser': page => oneShot(page, 6),
  'oneshot crash': page => oneShot(page, 7),
  // efeitos ligados pela barra (sem linha escolhida, valem para a música toda)
  'fx reverb': page => fxOn(page, 'Rev'),
  'fx delay': page => fxOn(page, 'Dly'),
  'fx echo': page => fxOn(page, 'Ech'),
  'fx distorcao': page => fxOn(page, 'Dist'),
  'fx filtro': page => fxOn(page, 'Flt'),
  // mixer e andamento
  'mixer mute kick': page => laneBtn(page, 0, '.mute'),
  'mixer solo kick': page => laneBtn(page, 0, '.solo'),
  'andamento +6': async page => { for (let i = 0; i < 6; i++) await page.keyboard.press('+') },
};
async function laneBtn(page: Page, lane: number, sel: string) {
  const b = await page.locator('#session .lane').nth(lane).locator(sel).boundingBox(); if (!b) throw new Error('sem ' + sel);
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.mouse.up();
}
async function fxOn(page: Page, tag: string) {
  await page.getByRole('button', { name: tag, exact: true }).click();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: 'Ligar ou desligar o efeito' }).click();
  await page.waitForTimeout(300);
}
// na tela inicial, sem entrar num gênero: só a prévia ou a audição tocando, medida pela saída final
const HOME: Record<string, { act: (page: Page) => Promise<void>; sec: number }> = {
  'previa house': { sec: 4, act: async page => { await page.locator('#hero .hprev').click() } },
  'audicao instrumento': { sec: 3, act: page => audition(page, 'Instrumentos dos gêneros') },
  // na 1.7.8.1, a primeira audição de um som gravado logo ao abrir o app não toca ("Som indisponível"): os sons só são
  // preparados depois que o áudio é liberado. Então toca uma vez, espera e mede a segunda.
  'audicao gravado': { sec: 5, act: async page => { await audition(page, 'Gravados do G-STUDIO'); await page.waitForTimeout(2500); await audition(page, 'Gravados do G-STUDIO', false) } },
};
async function audition(page: Page, section: string, open = true) {
  if (open) { await page.locator('#expOpen').click(); await page.waitForTimeout(1500) }
  const h = page.locator('#explore .xsec', { hasText: section }).first();
  await h.waitFor({ state: 'visible' });
  const b = await h.evaluateHandle(el => { let n = el.nextElementSibling; while (n && !n.classList.contains('xrow')) n = n.nextElementSibling; return n!.querySelector('.xplay') });
  await (b as any).click();
}
async function oneShot(page: Page, i: number) {
  await page.evaluate(() => (document.querySelector('#osBtn') as HTMLElement).click());
  await page.waitForTimeout(400);
  const b = await box(page, `.ospad[data-i="${i}"]`);
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.mouse.up();
}

for (const name of [...Object.keys(SCEN), ...Object.keys(HOME)]) {
  test(`controle: ${name}`, async ({ page }, info) => {
    test.skip(!isMainView(info), 'roda no tamanho principal');
    test.setTimeout(300_000);
    await prepare(page, info);
    const tile = page.locator('.htile[data-ch="CH01"]');
    const once = async (): Promise<Run> => {
      // cada rodada começa sem efeitos salvos da rodada anterior
      await page.goto('/__vazio');
      await page.evaluate(() => localStorage.removeItem('gstudio_fx'));
      await page.goto('/');
      await tile.waitFor({ state: 'visible' });
      await page.waitForTimeout(1500);
      await page.evaluate(n => (window as any).__gsSeed(n), SEED);
      if (HOME[name]) { await HOME[name].act(page); return gs<Run>(page, 'measureIdle', HOME[name].sec) }
      await tile.click({ force: true });
      await page.waitForFunction(() => document.body.classList.contains('in-session'));
      await page.waitForTimeout(6000);
      if (name.startsWith('remix')) { await page.locator('#rmxBtn').click(); await page.waitForTimeout(800) }
      await page.evaluate(n => (window as any).__gsSeed(n), SEED + 7);
      await SCEN[name](page);
      // nos One Shots, o transporte roda sem nenhum loop (slot vazio) e só o som avulso é medido
      const r = name.startsWith('oneshot') ? await gs<Run>(page, 'measure', 99, 2) : await gs<Run>(page, 'measure', 0, BARS);
      await page.mouse.up();
      return r;
    };
    const runs: Run[] = [];
    for (let i = 0; i < RUNS; i++) runs.push(await once());
    const b = browserOf(info), file = path.join(dir, b, name.replace(/\s+/g, '-') + '.json');
    if (BASELINE) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, JSON.stringify(runs.map(r => ({ masterRms: r.masterRms, hfRms: r.hfRms, master: r.master, masterRaw: r.masterRaw })), null, 1));
      return;
    }
    const ref = JSON.parse(fs.readFileSync(file, 'utf8')) as Run[];
    const db = (x: number) => 20 * Math.log10(Math.max(x, 1e-9));
    // a audição de som gravado é um som curto numa janela de 5 s: o volume médio depende de quando ele começa (na própria
    // 1.7.8.1 varia 2,7 dB entre rodadas); ali o que garante o som certo é o pico, e o volume médio tem folga de 3 dB
    const rmsTol = name === 'audicao gravado' ? 3 : .25;
    const rmsLo = Math.min(...ref.map(r => db(r.masterRms))) - rmsTol, rmsHi = Math.max(...ref.map(r => db(r.masterRms))) + rmsTol;
    const pkLo = Math.min(...ref.map(r => r.master)) - .03, pkHi = Math.max(...ref.map(r => r.master)) + .03;
    const check = (v: Run) => {
      const p: string[] = [];
      if (db(v.masterRms) < rmsLo || db(v.masterRms) > rmsHi) p.push(`volume médio ${db(v.masterRms).toFixed(2)} dB fora de ${rmsLo.toFixed(2)}..${rmsHi.toFixed(2)}`);
      if (v.master < pkLo || v.master > pkHi) p.push(`pico ${v.master.toFixed(3)} fora de ${pkLo.toFixed(3)}..${pkHi.toFixed(3)}`);
      // volume só dos agudos (acima de 4 kHz): mostra filtro, eco e reverb que quase não mudam o volume médio. No gater, o
      // corte começa antes do transporte e a fase do corte em relação aos pratos varia; ali vale só o volume médio e o pico
      if (ref[0].hfRms != null && v.hfRms != null && name !== 'remix gater') {
        const hLo = Math.min(...ref.map(r => db(r.hfRms!))) - .5, hHi = Math.max(...ref.map(r => db(r.hfRms!))) + .5;
        if (db(v.hfRms) < hLo || db(v.hfRms) > hHi) p.push(`agudos ${db(v.hfRms).toFixed(2)} dB fora de ${hLo.toFixed(2)}..${hHi.toFixed(2)}`);
      }
      return p;
    };
    // alguns controles são acionados antes de o transporte começar, e o resultado varia alguns milissegundos: se sair da
    // faixa, mede de novo (até 3 vezes no total) e só reprova se ficar fora em todas
    let problems = check(runs[0]);
    for (let a = 1; a < 3 && problems.length; a++) { const again = check(await once()); problems = again.length ? problems.concat(['nova medição: ' + again.join('; ')]) : [] }
    expect(problems, problems.join('\n')).toEqual([]);
  });
}
