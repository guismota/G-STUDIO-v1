import { defineConfig } from '@playwright/test';

// Qual versão os testes abrem:
//   legacy -> a cópia intocada da 1.7.8.1 (referência)
//   build  -> o build de teste da versão nova (dist-test/, gerado por npm run build:test)
const TARGET = process.env.GS_TARGET || 'legacy';
const PORT = TARGET === 'legacy' ? 4173 : 4174;

// iPad real (iPadOS 13+) se apresenta como Mac com tela de toque; o app reconhece o iPad assim.
const UA_SAFARI = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
const UA_CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const VIEWS = [
  { name: 'ipad-1180x820', width: 1180, height: 820, ipad: true },
  { name: 'ipad-1024x768', width: 1024, height: 768, ipad: true },
  { name: 'ipad-1366x1024', width: 1366, height: 1024, ipad: true },
  { name: 'mac-1440x900', width: 1440, height: 900, ipad: false },
];
const BROWSERS = ['chromium', 'webkit'] as const;

export default defineConfig({
  testDir: 'tests',
  snapshotPathTemplate: '{testDir}/baseline/screens/{projectName}/{arg}{ext}',
  timeout: 120_000,
  fullyParallel: true,
  workers: 4,
  reporter: [['list']],
  expect: {
    // tolerância mínima: só serrilhado de borda (cor parecida e no máximo 0,1% dos pontos)
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', scale: 'device', threshold: 0.2, maxDiffPixelRatio: 0.001 },
  },
  use: {
    baseURL: `http://localhost:${PORT}/`,
    deviceScaleFactor: 2,
    serviceWorkers: 'block',
    actionTimeout: 15_000,
    launchOptions: {},
  },
  projects: BROWSERS.flatMap(b => VIEWS.map(v => ({
    name: `${b}-${v.name}`,
    use: {
      browserName: b,
      viewport: { width: v.width, height: v.height },
      hasTouch: v.ipad,
      userAgent: v.ipad || b === 'webkit' ? UA_SAFARI : UA_CHROME,
      ...(b === 'chromium' ? { launchOptions: { args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio'] } } : {}),
    },
    metadata: { ipad: v.ipad },
  }))),
  webServer: {
    command: TARGET === 'legacy' ? `GS_HOOK=1 node tests/serve.mjs legacy ${PORT}` : `node tests/serve.mjs build ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: true,
  },
});
