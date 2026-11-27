// Zero erros no console: percorre o app como um usuário (tela inicial, prévia, todos os gêneros tocando,
// Remix FX, Tamanho, editor, piano roll, efeitos, projetos, Ajustes, Explorar, Criar novo) e não pode aparecer
// nenhum erro no console nem erro de página.
import { test, expect } from '@playwright/test';
import { prepare, gs, isMainView, watchConsole } from './helpers';

const GENRES = ['house', 'deep', 'acid', 'techno', 'acidtechno', 'funk', 'solomun', 'dnb', 'vice', 'cumbia', 'afro'];

test('nenhum erro no console', async ({ page }, info) => {
  test.skip(!isMainView(info), 'roda no tamanho principal');
  test.setTimeout(240_000);
  const errors = watchConsole(page);
  const esc = async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(400) };
  await prepare(page, info);
  await page.goto('/');
  await page.locator('#hero').waitFor({ state: 'visible' });
  await page.waitForTimeout(1500);

  // prévia do destaque
  await page.locator('#hero .hprev').click();
  await page.waitForTimeout(2500);
  await page.locator('#hero .hprev').click();
  await page.waitForTimeout(500);

  // Ajustes, projetos e Explorar na tela inicial
  await page.locator('#cfgOpen').click(); await page.waitForTimeout(500); await esc();
  await page.locator('#projOpen').click(); await page.waitForTimeout(500); await esc();
  await page.locator('#expOpen').click(); await page.waitForTimeout(1000); await esc();

  // entra pelo card e toca cada gênero
  await page.locator('.htile[data-ch="CH01"]').click();
  await page.waitForFunction(() => document.body.classList.contains('in-session'));
  await page.waitForTimeout(1500);
  for (const g of GENRES) {
    await gs(page, 'enterGenre', g);
    await page.waitForTimeout(400);
    await gs(page, 'playSlot', 2);
    await page.waitForTimeout(1500);
    await gs(page, 'stop');
  }

  // na sessão do House: efeitos, Remix FX, Tamanho, editor e piano roll, com som tocando
  await gs(page, 'enterGenre', 'house');
  await page.waitForTimeout(500);
  await page.locator('#play').click();
  await page.waitForTimeout(800);
  for (const tag of ['Dly', 'Ech', 'Dist', 'Flt', 'Rev']) { await page.getByRole('button', { name: tag, exact: true }).click(); await page.waitForTimeout(200) }
  await page.locator('#rmxBtn').click();
  await page.waitForTimeout(800);
  const pads = page.locator('#rxF, #rxE, #rxG, #rxD');
  for (let i = 0; i < await pads.count(); i++) {
    const b = await pads.nth(i).boundingBox();
    if (!b) continue;
    await page.mouse.move(b.x + b.width * 0.2, b.y + b.height * 0.3); await page.mouse.down();
    await page.mouse.move(b.x + b.width * 0.8, b.y + b.height * 0.7, { steps: 8 }); await page.waitForTimeout(500); await page.mouse.up();
  }
  await page.locator('#rmxBtn').click();
  await page.waitForTimeout(500);
  await page.locator('#sizeBtn').click(); await page.waitForTimeout(400); await page.locator('#sizeBtn').click();
  await gs(page, 'openClipEditor', 'kick', 0); await page.waitForTimeout(800); await esc();
  await gs(page, 'openClipEditor', 'bass', 0); await page.waitForTimeout(800);
  await page.keyboard.press('a'); await page.waitForTimeout(150); await page.keyboard.press('s'); await page.waitForTimeout(300);
  await esc();
  await page.locator('#play').click();
  await page.waitForTimeout(500);

  // Criar novo e volta para o início
  await gs(page, 'novoEnter');
  await page.waitForTimeout(800);
  await gs(page, 'goHome');
  await page.waitForTimeout(1500);

  expect(errors, errors.join('\n')).toEqual([]);
});
