// Dados dos gêneros: padrões, sons, card da tela inicial, paleta, capa e símbolo de cada gênero têm que sair iguais aos
// da 1.7.8.1 (com a mesma ordem). A referência fica em tests/fixtures/generos-1.7.8.1.json (gerada com GS_BASELINE=1).
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { prepare, gs, isMainView, BASELINE, TARGET } from './helpers';

const FIX = 'tests/fixtures/generos-1.7.8.1.json';

test('dados dos gêneros iguais aos da 1.7.8.1', async ({ page, browserName }, info) => {
  test.skip(!isMainView(info) || browserName !== 'chromium', 'confere os dados uma vez');
  await prepare(page, info);
  await page.goto('/');
  await page.waitForFunction(() => !!(window as any).__gs);
  const data = await gs<any>(page, 'genreData');
  if (BASELINE && TARGET === 'legacy') { fs.writeFileSync(FIX, JSON.stringify(data)); return }
  const ref = JSON.parse(fs.readFileSync(FIX, 'utf8'));
  expect(data.styleOrder).toEqual(ref.styleOrder);
  expect(data.genres.map((g: any) => g.k)).toEqual(ref.genres.map((g: any) => g.k));
  expect(JSON.stringify(data)).toBe(JSON.stringify(ref));
});
