// Controles que mexem no som (Remix FX; depois efeitos e mixer): com o controle acionado PELA TELA, toca o House no
// padrão 1 por 4 compassos e mede o volume médio (RMS) e o pico da saída final. A versão nova tem que soar igual à
// 1.7.8.1: diferença de no máximo 0,5 dB no volume médio e 0,03 no pico (escala do medidor), além da variação natural
// medida em 3 rodadas da 1.7.8.1. Roda mudo e em 48 kHz, como os outros testes de áudio.
import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepare, gs, isMainView, browserOf, BASELINE } from './helpers';

const RUNS = BASELINE ? 3 : 1, SEED = 20261127, BARS = 4;
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'baseline', 'controls');
type Run = { masterRms: number; master: number; masterRaw: number };

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
};
async function oneShot(page: Page, i: number) {
  await page.evaluate(() => (document.querySelector('#osBtn') as HTMLElement).click());
  await page.waitForTimeout(400);
  const b = await box(page, `.ospad[data-i="${i}"]`);
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.mouse.up();
}

for (const name of Object.keys(SCEN)) {
  test(`controle: ${name}`, async ({ page }, info) => {
    test.skip(!isMainView(info), 'roda no tamanho principal');
    test.setTimeout(300_000);
    await prepare(page, info);
    const tile = page.locator('.htile[data-ch="CH01"]');
    const once = async (): Promise<Run> => {
      await page.goto('/');
      await tile.waitFor({ state: 'visible' });
      await page.waitForTimeout(1500);
      await page.evaluate(n => (window as any).__gsSeed(n), SEED);
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
      fs.writeFileSync(file, JSON.stringify(runs.map(r => ({ masterRms: r.masterRms, master: r.master, masterRaw: r.masterRaw })), null, 1));
      return;
    }
    const ref = JSON.parse(fs.readFileSync(file, 'utf8')) as Run[];
    const db = (x: number) => 20 * Math.log10(Math.max(x, 1e-9));
    const rmsLo = Math.min(...ref.map(r => db(r.masterRms))) - .5, rmsHi = Math.max(...ref.map(r => db(r.masterRms))) + .5;
    const pkLo = Math.min(...ref.map(r => r.master)) - .03, pkHi = Math.max(...ref.map(r => r.master)) + .03;
    const v = runs[0], problems: string[] = [];
    if (db(v.masterRms) < rmsLo || db(v.masterRms) > rmsHi) problems.push(`volume médio ${db(v.masterRms).toFixed(2)} dB fora de ${rmsLo.toFixed(2)}..${rmsHi.toFixed(2)}`);
    if (v.master < pkLo || v.master > pkHi) problems.push(`pico ${v.master.toFixed(3)} fora de ${pkLo.toFixed(3)}..${pkHi.toFixed(3)}`);
    expect(problems, problems.join('\n')).toEqual([]);
  });
}
