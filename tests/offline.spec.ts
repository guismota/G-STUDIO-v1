// Funcionamento offline: depois de abrir o app com internet, o service worker guarda tudo e o app tem que
// abrir, mostrar os gêneros com as fontes certas e tocar (inclusive as amostras .wav) sem internet.
import { test, expect } from '@playwright/test';
import { prepare, gs, isMainView, watchConsole } from './helpers';

test.use({ serviceWorkers: 'allow' });
// o service worker do WebKit no navegador de teste às vezes demora a guardar as fontes (acontece igual na 1.7.8.1):
// o teste pode repetir até 2 vezes
test.describe.configure({ retries: 2 });
const FONTS = ['400 20px "Rubik Mono One"', '900 20px "Rubik"', '800 20px "Big Shoulders Display"', '700 20px "Archivo"', '400 20px "Instrument Serif"'];

test('abre e toca sem internet', async ({ page, context }, info) => {
  test.skip(!isMainView(info), 'roda no tamanho principal');
  test.setTimeout(180_000);
  await prepare(page, info);
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); // a partir daqui a página passa pelo service worker
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.locator('#hero').waitFor({ state: 'visible' });
  await page.waitForTimeout(2500); // fontes e amostras passam pelo service worker e ficam guardadas
  await page.reload();
  await page.locator('#hero').waitFor({ state: 'visible' });
  await page.evaluate(F => Promise.all(F.map(f => document.fonts.load(f))), FONTS); // baixa as 5 fontes (umas só aparecem na sessão)
  // o service worker guarda em segundo plano: espera os arquivos de fonte baixados estarem de fato no cache
  await page.waitForFunction(async () => {
    const got = performance.getEntriesByType('resource').map(e => e.name).filter(n => n.includes('fonts.gstatic.com'));
    if (!got.length) return false;
    const urls = new Set<string>();
    for (const k of await caches.keys()) for (const r of await (await caches.open(k)).keys()) urls.add(r.url);
    return got.every(u => urls.has(u));
  }, null, { timeout: 20_000, polling: 250 });
  await page.waitForTimeout(500);

  await context.setOffline(true);
  const errors = watchConsole(page);
  await page.reload();
  await page.locator('.htile[data-ch="CH01"]').waitFor({ state: 'visible' });
  await page.waitForTimeout(2000);
  expect(await page.evaluate(() => (window as any).__gs.version), 'app carregou sem internet').toBeTruthy();
  const fonts = await page.evaluate(F => Promise.all(F.map(f => document.fonts.load(f).then(l => l.length > 0 && l.every(x => x.status === 'loaded'), () => false))), FONTS);
  expect(fonts, 'as 5 fontes carregam sem internet').toEqual(FONTS.map(() => true));

  await page.locator('.htile[data-ch="CH01"]').click();
  await page.waitForFunction(() => document.body.classList.contains('in-session'));
  await page.waitForTimeout(2500);
  const run = await gs<{ on: string[]; lanes: Record<string, number> }>(page, 'measure', 0, 2);
  const mute = run.on.filter(k => !(run.lanes[k] > 0));
  expect(mute, 'faixas mudas sem internet').toEqual([]);
  // as amostras gravadas (.wav) também têm que tocar: o House usa palmas e pratos gravados
  const smp = await page.evaluate(() => fetch('smp/hat_c.wav').then(r => r.ok).catch(() => false));
  expect(smp, 'amostra .wav vem do cache').toBe(true);
  // sem internet o WebKit avisa que não conseguiu se pré-conectar ao Google Fonts (tags <link rel="preconnect">):
  // é aviso de rede do navegador, não erro do app; qualquer outro erro reprova
  const real = errors.filter(e => !/^Failed to preconnect to https:\/\/fonts\.(googleapis|gstatic)\.com/.test(e));
  expect(real, real.join('\n')).toEqual([]);
  await context.setOffline(false);
});
