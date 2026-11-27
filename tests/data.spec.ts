// Dados salvos: um projeto, um gênero criado e um som importado, feitos de verdade na 1.7.8.1, têm que abrir
// iguais na versão nova. O backup .json exportado pela 1.7.8.1 também tem que restaurar igual.
// Os dados de referência ficam em tests/fixtures (gerados uma vez com: npm run test:fixtures).
import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import { prepare, openFrozen, gs, shot, isMainView, fontsReady, TARGET, T0 } from './helpers';

const FIX = 'tests/fixtures/dados-1.7.8.1.json';
const BKF = 'tests/fixtures/backup-1.7.8.1.json';
const MAKE = process.env.GS_MAKE_FIXTURES === '1';

type Fixture = {
  storage: Record<string, string>; idb: [string, string][];
  expected: { projects: any[]; ugen: any[]; lib: any; idbKeys: [string, number][]; snapProject: any; snapGenre: any };
};

const dumpStorage = (page: Page) => page.evaluate(() => {
  const o: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i)!; if (k.startsWith('gstudio_') || k.startsWith('looppads_')) o[k] = localStorage.getItem(k)! }
  return o;
});
const dumpIdb = (page: Page) => page.evaluate(() => new Promise<[string, string][]>((res, rej) => {
  const r = indexedDB.open('gstudio', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('files');
  r.onerror = () => rej(r.error);
  r.onsuccess = () => {
    const out: [string, string][] = [], tx = r.result.transaction('files', 'readonly'), cur = tx.objectStore('files').openCursor();
    cur.onsuccess = () => { const c = cur.result; if (c) { const u = new Uint8Array(c.value as ArrayBuffer); let s = ''; for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); out.push([String(c.key), btoa(s)]); c.continue() } };
    tx.oncomplete = () => { r.result.close(); res(out.sort()) };
  };
}));

// grava os dados no navegador antes de o app abrir (numa página vazia do mesmo endereço)
async function seedData(page: Page, f: Fixture) {
  await page.goto('/__vazio');
  await page.evaluate(({ storage, idb }) => new Promise<void>((res, rej) => {
    localStorage.clear();
    for (const k in storage) localStorage.setItem(k, storage[k]);
    const r = indexedDB.open('gstudio', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('files');
    r.onerror = () => rej(r.error);
    r.onsuccess = () => {
      const tx = r.result.transaction('files', 'readwrite');
      for (const [k, b] of idb) { const s = atob(b), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); tx.objectStore('files').put(u.buffer, k) }
      tx.oncomplete = () => { r.result.close(); res() };
      tx.onerror = () => rej(tx.error);
    };
  }), { storage: f.storage, idb: f.idb });
}

const loadFix = (): Fixture => JSON.parse(fs.readFileSync(FIX, 'utf8'));

test.describe('dados salvos', () => {
  test('criar dados de referência na 1.7.8.1', async ({ page, browserName }, info) => {
    test.skip(!MAKE || TARGET !== 'legacy' || !isMainView(info) || browserName !== 'chromium', 'só ao gerar os dados de referência');
    await prepare(page, info);
    await page.goto('/');
    await page.locator('.htile[data-ch="CH01"]').waitFor({ state: 'visible' });
    await page.waitForTimeout(1500);
    await page.locator('.htile[data-ch="CH01"]').click();
    await page.waitForFunction(() => document.body.classList.contains('in-session'));
    await page.waitForTimeout(2000);

    // um som importado pelo usuário (vai para o IndexedDB)
    await page.setInputFiles('#xFile', 'tests/fixtures/som-usuario.wav');
    await page.waitForFunction(() => (window as any).__gs.lib().items.length === 1);
    const libId = (await gs<any>(page, 'lib')).items[0].id;

    // um projeto com mudanças em andamento, volume, mute, loop próprio, cena e efeito
    await gs(page, 'enterGenre', 'deep');
    await page.waitForTimeout(1000);
    await gs(page, 'setBpm', 121);
    await gs(page, 'setLane', 'bass', { vol: 0.6 });
    await gs(page, 'setLane', 'hat', { muted: true });
    await gs(page, 'setUserPat', 'kick', 0, { name: 'Meu kick', len: 16, data: [0, 4, 8, 12, [14, 0.5]] });
    await gs(page, 'setScene', 4, { kick: 4, hat: 1, bass: 2 });
    await gs(page, 'setFx', 'dly', true, { mix: 0.35 });
    await page.locator('#saveBtn').click();
    await page.locator('#psName').fill('Projeto teste');
    await page.locator('#psSave').click();
    await page.waitForFunction(() => (window as any).__gs.projects().length === 1);

    // um gênero criado no Criar novo, com dois instrumentos de gêneros diferentes e o som importado
    await gs(page, 'novoEnter');
    await page.waitForTimeout(800);
    await gs(page, 'novoAddInst', 'kick', 'Kick', 'house');
    await gs(page, 'novoAddInst', 'bass', 'Bass', 'techno');
    await gs(page, 'novoAddLib', libId);
    const keys = (await gs<any>(page, 'state')).lanes.map((l: any) => l.key);
    await gs(page, 'setUserPat', keys[0], 0, { name: 'Batida', len: 16, data: [0, 6, 8, 14] });
    await page.locator('#saveBtn').click(); // no Criar novo, o disquete abre um menu
    await page.locator('#xMenu button', { hasText: 'Salvar como gênero' }).click();
    await page.locator('#ugName').fill('Meu Gênero');
    await page.locator('#ugDesc').fill('Feito no teste');
    await page.locator('#ugOk').click();
    await page.waitForFunction(() => (window as any).__gs.ugen().length === 1);

    // reabre o app e registra como os dados abrem na 1.7.8.1
    await page.reload();
    await page.locator('#projOpen').waitFor({ state: 'visible' });
    await page.waitForTimeout(1500);
    const storage = await dumpStorage(page), idb = await dumpIdb(page);
    const projects = await gs<any[]>(page, 'projects'), ugen = await gs<any[]>(page, 'ugen'), lib = await gs(page, 'lib'), idbKeys = await gs<[string, number][]>(page, 'idbKeys');
    await page.locator('#projOpen').click();
    await page.locator('.prow [data-a="open"]').first().click();
    await page.waitForTimeout(1500);
    const snapProject = await gs(page, 'snapshot');
    await gs(page, 'enterUgen', ugen[0].id);
    await page.waitForTimeout(1500);
    const snapGenre = await gs(page, 'snapshot');
    fs.writeFileSync(FIX, JSON.stringify({ storage, idb, expected: { projects, ugen, lib, idbKeys, snapProject, snapGenre } }, null, 1));

    // backup exportado pelo próprio app (Ajustes > Exportar backup)
    await gs(page, 'goHome');
    await page.waitForTimeout(1500);
    await page.locator('#cfgOpen').click();
    await page.locator('#cfgBkE').click(); // Ajustes > Dados > Backup > Exportar
    const btn = page.locator('#bkFoot button.pri');
    await btn.waitFor({ state: 'visible' });
    const [dl] = await Promise.all([page.waitForEvent('download'), btn.click()]);
    await dl.saveAs(BKF);
  });

  test('projeto, gênero criado e som importado abrem iguais', async ({ page }, info) => {
    test.skip(MAKE || !isMainView(info), 'roda no tamanho principal');
    const f = loadFix();
    await prepare(page, info);
    await seedData(page, f);
    await page.clock.install({ time: T0 });
    await page.clock.pauseAt(new Date(T0.getTime() + 10));
    await page.goto('/');
    await fontsReady(page);
    await page.clock.runFor(4000);

    expect(await gs(page, 'projects')).toEqual(f.expected.projects);
    expect(await gs(page, 'ugen')).toEqual(f.expected.ugen);
    expect(await gs(page, 'lib')).toEqual(f.expected.lib);
    expect(await gs(page, 'idbKeys')).toEqual(f.expected.idbKeys);

    await page.locator('#projOpen').click();
    await page.clock.runFor(500);
    await page.locator('.prow [data-a="open"]').first().click();
    await page.clock.runFor(1500);
    expect(await gs(page, 'snapshot')).toEqual(f.expected.snapProject);
    await shot(page, 'dados-projeto.png');

    await gs(page, 'enterUgen', f.expected.ugen[0].id);
    await page.clock.runFor(1500);
    await page.waitForTimeout(800); // o som importado é lido do IndexedDB
    await page.clock.runFor(200);
    expect(await gs(page, 'snapshot')).toEqual(f.expected.snapGenre);
    await shot(page, 'dados-genero.png');
  });

  for (const mode of ['Substituir tudo', 'Juntar']) {
    test(`backup da 1.7.8.1 restaura igual (${mode})`, async ({ page }, info) => {
      test.skip(MAKE || !isMainView(info), 'roda no tamanho principal');
      const f = loadFix();
      await prepare(page, info);
      await page.goto('/');
      await page.locator('#cfgOpen').waitFor({ state: 'visible' });
      await page.waitForTimeout(1500);
      await page.locator('#cfgOpen').click();
      await page.setInputFiles('#bkFile', BKF);
      if (mode === 'Substituir tudo') {
        await page.locator('#bkRep').click();
        await expect(page.locator('#bkRep')).toHaveClass(/armed/); // o app pede confirmação: "Certeza? Apaga tudo"
        await page.locator('#bkRep').click();
      } else await page.locator('#bkFoot button', { hasText: mode }).click();
      await page.waitForEvent('load', { timeout: 15_000 });
      await page.locator('#projOpen').waitFor({ state: 'visible' });
      await page.waitForTimeout(1000);
      expect(await gs(page, 'projects')).toEqual(f.expected.projects);
      expect(await gs(page, 'ugen')).toEqual(f.expected.ugen);
      expect(await gs(page, 'lib')).toEqual(f.expected.lib);
      expect(await gs(page, 'idbKeys')).toEqual(f.expected.idbKeys);
    });
  }
});
