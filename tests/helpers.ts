import { expect, type Page, type TestInfo } from '@playwright/test';

export const TARGET = process.env.GS_TARGET || 'legacy';
export const BASELINE = process.env.GS_BASELINE === '1';
export const T0 = new Date('2026-11-25T12:00:00-03:00');

// a referência e as comparações rodam no tamanho principal do iPad; as capturas rodam nos 4 tamanhos
export const isMainView = (info: TestInfo) => info.project.name.endsWith('1180x820');
export const browserOf = (info: TestInfo) => info.project.name.split('-')[0];

type Seed = { onboarded?: boolean; terms?: boolean; tours?: boolean; iphone?: boolean; extra?: Record<string, string> };

// Prepara a página antes do app carregar: sorteio fixo (Math.random repetível), iPad com toque e o que já foi
// "visto" no primeiro acesso. Nada disso muda o app, só o navegador de teste.
export async function prepare(page: Page, info: TestInfo, seed: Seed = {}) {
  const s = { onboarded: true, terms: true, tours: true, ...seed };
  await page.addInitScript(({ s, ipad }) => {
    let a = 0x9e3779b9;
    (window as any).__gsSeed = (n: number) => { a = n };
    Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 };
    if (ipad || s.iphone) Object.defineProperty(Navigator.prototype, 'maxTouchPoints', { get: () => 5 });
    if (s.iphone) Object.defineProperty(Navigator.prototype, 'platform', { get: () => 'iPhone' });
    if (sessionStorage.getItem('gs_seeded')) return; // só na primeira carga: recarregar não apaga o que o app salvou
    sessionStorage.setItem('gs_seeded', '1');
    if (s.onboarded) localStorage.setItem('gstudio_onboarded', '1');
    if (s.terms) localStorage.setItem('gstudio_terms', JSON.stringify({ v: '1.0', at: 1764082800000 }));
    if (s.tours) { localStorage.setItem('gstudio_tour_home', '1'); localStorage.setItem('gstudio_tour_sess', '1') }
    for (const k in s.extra || {}) localStorage.setItem(k, s.extra![k]);
  }, { s, ipad: !!info.project.metadata.ipad });
}

// Abre o app com o relógio da página parado: animações e desenhos em canvas só andam quando o teste manda.
export async function openFrozen(page: Page, info: TestInfo, seed: Seed = {}) {
  await prepare(page, info, seed);
  await page.clock.install({ time: T0 });
  await page.clock.pauseAt(new Date(T0.getTime() + 10));
  await page.goto('/');
  await fontsReady(page);
  await page.clock.runFor(3000); // abertura (1 s), some (1,5 s) e liga a tela inicial
  await fontsReady(page);
  await page.clock.runFor(1000);
}

export async function fontsReady(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(['400 100px "Rubik Mono One"', '900 100px "Rubik"', '800 100px "Big Shoulders Display"', '700 100px "Archivo"', '400 40px "Instrument Serif"']
      .map(f => document.fonts.load(f).catch(() => null)));
  });
}

export async function gs<T = unknown>(page: Page, fn: string, ...args: unknown[]): Promise<T> {
  return page.evaluate(({ fn, args }) => (window as any).__gs[fn](...args), { fn, args }) as Promise<T>;
}

export async function shot(page: Page, name: string, target?: ReturnType<Page['locator']>) {
  await (target ? expect(target).toHaveScreenshot(name) : expect(page).toHaveScreenshot(name));
}

// coleta erros do console e da página
export function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) });
  page.on('pageerror', e => errors.push('erro na página: ' + e.message));
  return errors;
}
