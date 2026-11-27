// Capturas de tela: cada tela principal nos 3 tamanhos de iPad e no Mac (1440x900), em Chromium e WebKit.
// A referência é gerada a partir da 1.7.8.1 (npm run test:baseline) e a versão nova tem que sair igual.
import { test, expect } from '@playwright/test';
import { openFrozen, gs, shot } from './helpers';

const GENRES = ['house', 'deep', 'acid', 'techno', 'acidtechno', 'funk', 'solomun', 'dnb', 'vice', 'cumbia', 'afro'];
const UA_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

test.describe('tela inicial', () => {
  test('início, destaque e cards', async ({ page }, info) => {
    await openFrozen(page, info);
    await shot(page, 'inicio.png');
    await shot(page, 'destaque.png', page.locator('#hero'));
    await shot(page, 'cards-classicos.png', page.locator('.hrow').nth(0));
    await shot(page, 'cards-pro.png', page.locator('.hrow').nth(1));
  });

  test('ajustes', async ({ page }, info) => {
    await openFrozen(page, info);
    await page.locator('#cfgOpen').click();
    await page.clock.runFor(800);
    await shot(page, 'ajustes.png');
  });
});

test.describe('sessão', () => {
  for (const g of GENRES) {
    test(`gênero ${g}`, async ({ page }, info) => {
      await openFrozen(page, info);
      await gs(page, 'enterGenre', g);
      await page.clock.runFor(1500);
      await shot(page, `sessao-${g}.png`);
    });
  }

  test('remix fx, tamanho, sequenciador e piano roll', async ({ page }, info) => {
    await openFrozen(page, info);
    await gs(page, 'enterGenre', 'house');
    await page.clock.runFor(1500);

    await page.locator('#rmxBtn').click();
    await page.clock.runFor(800);
    await shot(page, 'remix-fx.png');
    await page.locator('#rmxBtn').click();
    await page.clock.runFor(800);

    await page.locator('#sizeBtn').click();
    await page.clock.runFor(600);
    await shot(page, 'tamanho.png');
    await page.keyboard.press('Escape');
    await page.mouse.click(5, info.project.use.viewport!.height - 5);
    await page.clock.runFor(600);

    await gs(page, 'openClipEditor', 'kick', 0);
    await page.clock.runFor(800);
    await shot(page, 'sequenciador.png');
    await page.keyboard.press('Escape');
    await page.clock.runFor(800);

    await gs(page, 'openClipEditor', 'bass', 0);
    await page.clock.runFor(1200);
    await shot(page, 'piano-roll.png');
  });
});

test.describe('primeiro acesso', () => {
  test('termos de uso', async ({ page }, info) => {
    await openFrozen(page, info, { terms: false, onboarded: false });
    await expect(page.locator('#terms')).toHaveClass(/show/);
    await shot(page, 'termos.png');
    await page.locator('#terms [data-doc="terms"]').click();
    await page.clock.runFor(600);
    await shot(page, 'termos-texto.png');
  });

  test('boas-vindas', async ({ page }, info) => {
    await openFrozen(page, info, { onboarded: false });
    await expect(page.locator('#onb')).toHaveClass(/show/);
    await shot(page, 'boas-vindas.png');
  });
});

test.describe('aparelho incompatível', () => {
  test.use({ userAgent: UA_IPHONE });
  test('tela de compatibilidade bloqueada', async ({ page }, info) => {
    await openFrozen(page, info, { onboarded: false, iphone: true });
    await expect(page.locator('#onb')).toHaveClass(/bloq/);
    await shot(page, 'compat-bloqueada.png');
  });
});
