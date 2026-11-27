// Build final (dist/): o gancho de teste não pode ir para o site, e o service worker tem que ter a versão do
// package.json e todos os arquivos do app para funcionar offline.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { TARGET, isMainView } from './helpers';

test('build final sem gancho de teste e com service worker completo', async ({ browserName }, info) => {
  test.skip(TARGET !== 'build' || !isMainView(info) || browserName !== 'chromium', 'confere os arquivos do build uma vez');
  const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).appVersion;
  const assets = fs.readdirSync('dist/assets');
  for (const f of assets.filter(f => f.endsWith('.js'))) expect(fs.readFileSync(`dist/assets/${f}`, 'utf8'), `gancho de teste em ${f}`).not.toContain('__gs');
  expect(fs.readFileSync('dist/assets/' + assets.find(f => f.endsWith('.js')), 'utf8')).toContain(version);
  const sw = fs.readFileSync('dist/sw.js', 'utf8');
  expect(sw).toContain(`"gstudio-v${version}"`);
  for (const f of assets) expect(sw, `service worker sem ${f}`).toContain(`"./assets/${f}"`);
  for (const f of ['./', './index.html', './manifest.webmanifest', './logo-180.png', './logo-192.png', './logo-512.png', './logo.svg', './favicon-64.png'])
    expect(sw).toContain(`"${f}"`);
  for (const f of fs.readdirSync('public/smp').filter(f => f.endsWith('.wav'))) expect(sw).toContain(`"./smp/${f}"`);
  // caminhos relativos (o site fica em /G-STUDIO-v1/)
  const html = fs.readFileSync('dist/index.html', 'utf8');
  expect(html).not.toMatch(/(src|href)="\/(?!\/)/);
  // o script de compatibilidade continua inline, clássico e antes do app
  const compat = html.indexOf('// compatibilidade do aparelho (ES5 de propósito');
  expect(compat).toBeGreaterThan(0);
  expect(html.lastIndexOf('<script>', compat)).toBeGreaterThan(html.indexOf('<body>'));
});
