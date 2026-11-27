// Fluxos completos que envolvem o motor e arquivos: gravar a saída, importar um som e gravar pelo microfone.
// Rodam igual na 1.7.8.1 e na versão nova (mudos, como os outros testes).
import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import { prepare, gs, isMainView } from './helpers';

async function enterHouse(page: Page) {
  await page.goto('/');
  const tile = page.locator('.htile[data-ch="CH01"]');
  await tile.waitFor({ state: 'visible' });
  await page.waitForTimeout(1500);
  await tile.click({ force: true });
  await page.waitForFunction(() => document.body.classList.contains('in-session'));
  await page.waitForTimeout(1500);
}

test('gravação da saída: contagem, gravar, parar e baixar o WAV', async ({ page }, info) => {
  test.skip(!isMainView(info), 'roda no tamanho principal');
  await prepare(page, info);
  await enterHouse(page);
  await page.locator('#recBtn').click(); // contagem de 3 tempos e grava (o relógio entra junto)
  await expect(page.locator('#recBtn')).toHaveClass(/cnt/);
  await page.waitForTimeout(5000);
  await expect(page.locator('#recBtn')).toHaveClass(/rec/);
  await page.locator('#recBtn').click(); // para
  await expect(page.locator('#recDone')).toHaveClass(/open/);
  await expect(page.locator('#rdInfo')).toContainText('WAV');
  await expect(page.locator('#recBtn .rtime')).toHaveText('Rec');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#rdWav').click()]);
  const f = await dl.path();
  const size = fs.statSync(f!).size;
  expect(size, 'WAV com uns 3 s de som').toBeGreaterThan(400_000);
  expect(fs.readFileSync(f!).subarray(0, 4).toString()).toBe('RIFF');
});

test('importar um som no Explorar', async ({ page }, info) => {
  test.skip(!isMainView(info), 'roda no tamanho principal');
  const fix = JSON.parse(fs.readFileSync('tests/fixtures/dados-1.7.8.1.json', 'utf8'));
  const ref = fix.expected.lib.items[0]; // o mesmo arquivo importado na 1.7.8.1
  await prepare(page, info);
  await page.goto('/');
  await page.locator('#expOpen').waitFor({ state: 'visible' });
  await page.waitForTimeout(1500);
  await page.locator('#expOpen').click();
  await page.waitForTimeout(1500);
  await page.setInputFiles('#xFile', 'tests/fixtures/som-usuario.wav');
  await page.waitForFunction(() => (window as any).__gs.lib().items.length === 1);
  const it = (await gs<any>(page, 'lib')).items[0];
  const pick = (o: any) => ({ name: o.name, cat: o.cat, kind: o.kind, bpm: o.bpm, bars: o.bars, dur: o.dur, size: o.size });
  expect(pick(it)).toEqual(pick(ref));
  expect((await gs<[string, number][]>(page, 'idbKeys')).map(x => x[0])).toEqual([it.id]);
});

test('gravar pelo microfone e salvar em Meus sons', async ({ page, browserName }, info) => {
  test.skip(!isMainView(info) || browserName !== 'chromium', 'microfone simulado só no Chromium');
  await page.context().grantPermissions(['microphone']);
  await prepare(page, info);
  await page.goto('/');
  await page.locator('#expOpen').waitFor({ state: 'visible' });
  await page.waitForTimeout(1500);
  await page.locator('#expOpen').click();
  await page.waitForTimeout(1500);
  await page.locator('#xRecBtn').click();
  await expect(page.locator('#xRec')).toHaveClass(/open/);
  await page.locator('#xRecGo').click();
  await expect(page.locator('#xRec')).toHaveClass(/rec/);
  await page.waitForTimeout(1500);
  await page.locator('#xRecGo').click();
  await expect(page.locator('#xRecT')).toContainText('Pronto:');
  await expect(page.locator('#xRecGo')).toHaveText('Gravar de novo');
  await page.locator('#xRecSave').click();
  await page.waitForFunction(() => (window as any).__gs.lib().items.length === 1);
  const it = (await gs<any>(page, 'lib')).items[0];
  expect([it.name, it.rec, it.kind]).toEqual(['Gravação 1', true, 'oneshot']);
  expect(it.dur).toBeGreaterThan(.5);
  await expect(page.locator('#xRec')).not.toHaveClass(/open/);
});
