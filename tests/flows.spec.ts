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

test('tocando: visor, pads, medidores e luzes andam; parado, voltam', async ({ page }, info) => {
  test.skip(!isMainView(info), 'roda no tamanho principal');
  await prepare(page, info);
  await enterHouse(page);
  await page.locator('#play').click();
  await expect(page.locator('#play')).toHaveClass(/on/);
  await page.waitForTimeout(2500);
  await expect(page.locator('#lcdPos')).not.toHaveText('1.1.1');
  const insets = await page.evaluate(() => {
    const top = (el: Element | null) => { const m = /inset\(([\d.]+)%/.exec((el as HTMLElement | null)?.style.clipPath || ''); return m ? +m[1] : 100 };
    return { master: top(document.querySelector('#mL')), lanes: [...document.querySelectorAll('#session .lane')].map(l => top(l.querySelector('[style*="clip-path"]'))) };
  });
  expect(insets.master, 'medidor da saída subiu').toBeLessThan(60);
  expect(insets.lanes.filter(v => v < 90).length, 'medidores das linhas subiram').toBeGreaterThan(3);
  expect(await page.locator('#session .clip.play').count(), 'pads tocando acesos').toBeGreaterThan(3);
  await page.locator('#play').click();
  await expect(page.locator('#play')).not.toHaveClass(/on/);
  await expect(page.locator('#lcdPos')).toHaveText('1.1.1');
});

test('pads, fila, cena e parar tudo pela tela', async ({ page }, info) => {
  test.skip(!isMainView(info), 'roda no tamanho principal');
  await prepare(page, info);
  await enterHouse(page);
  const pad = (lane: number, slot: number) => page.locator('#session .lane').nth(lane).locator('.clip').nth(slot);
  const press = async (loc: ReturnType<typeof pad>) => { const b = await loc.boundingBox(); await page.mouse.move(b!.x + b!.width / 2, b!.y + b!.height / 2); await page.mouse.down(); await page.mouse.up() };
  await press(pad(0, 0)); // kick, loop 1: começa a tocar
  await expect(page.locator('#play')).toHaveClass(/on/);
  await expect(pad(0, 0)).toHaveClass(/play/);
  await press(pad(3, 1)); // hi-hat, loop 2: vai para a fila e entra no próximo compasso
  await expect(pad(3, 1)).toHaveClass(/\bq\b/);
  await expect(pad(3, 1)).toHaveClass(/play/, { timeout: 4000 });
  const scene3 = page.locator('#scenes .sc').nth(2);
  await press(scene3); // cena 3 entra no próximo compasso
  await expect(scene3).toHaveClass(/\bon\b/, { timeout: 4000 });
  await expect(pad(0, 0)).not.toHaveClass(/play/, { timeout: 4000 });
  // parar tudo no fim do compasso, pelo botão Parar (na 1.7.8.1 o atalho 0 não funciona: ele "clica" no botão, mas o
  // botão só reage ao toque)
  await press(page.locator('#stopall'));
  await expect(page.locator('#session .clip.play')).toHaveCount(0, { timeout: 4000 });
  await page.locator('#play').click();
  await expect(page.locator('#play')).not.toHaveClass(/on/);
});
