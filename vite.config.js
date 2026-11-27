// Build do G-STUDIO (Vite).
//   npm run dev         servidor de desenvolvimento (também na rede Wi-Fi, para abrir no iPad)
//   npm run build       build final em dist/ (o que vai para o site)
//   npm run build:test  build de teste em dist-test/ (igual ao final, mais o gancho de teste window.__gs)
import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { HOOK } from './tests/legacy-hook.mjs';

// a versão fica num lugar só: package.json, campo appVersion (formato x.y.z.w)
const VERSION = JSON.parse(fs.readFileSync('package.json', 'utf8')).appVersion;
if (!/^\d+\.\d+\.\d+(\.\d+)?$/.test(VERSION)) throw new Error('appVersion inválida no package.json: ' + VERSION);

const APP_ID = 'virtual:gstudio-app', APP_RID = '\0gstudio-app';
const partsList = () => JSON.parse(fs.readFileSync('src/app/parts.json', 'utf8'));

// arquivos de public/ que o service worker guarda para o modo offline (os mesmos de antes da modularização)
const SW_PUBLIC = /^(manifest\.webmanifest|logo-\d+\.png|logo\.svg|favicon-64\.png|smp\/[^/]+\.wav)$/;
const walk = (d, base = d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name), base) : [path.relative(base, path.join(d, e.name)).split(path.sep).join('/')]);

function gstudio(mode) {
  const withHook = mode === 'development' || mode === 'test'; // o gancho de teste nunca entra no build final
  return {
    name: 'gstudio',
    resolveId(id) { if (id === APP_ID) return APP_RID },
    // junta os pedaços do app num bloco só, na ordem original (etapa de transição)
    load(id) {
      if (id !== APP_RID) return;
      let code = '(()=>{\n';
      for (const p of partsList()) { this.addWatchFile(path.resolve(p)); code += fs.readFileSync(p, 'utf8') }
      if (withHook) code += HOOK;
      return code + '})();\n';
    },
    configureServer(server) {
      const abs = new Set(partsList().map(p => path.resolve(p)));
      server.watcher.on('change', f => {
        if (!abs.has(path.resolve(f))) return;
        const m = server.moduleGraph.getModuleById(APP_RID);
        if (m) server.moduleGraph.invalidateModule(m);
        server.ws.send({ type: 'full-reload' });
      });
      // em desenvolvimento não há cache offline: este service worker só se desinstala
      server.middlewares.use('/sw.js', (req, res) => {
        res.setHeader('Content-Type', 'text/javascript');
        res.end("self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(self.registration.unregister()));");
      });
    },
    // service worker do build: o modelo src/sw.template.js com a versão e a lista de arquivos
    generateBundle(_, bundle) {
      const files = ['./', './index.html',
        ...walk('public').filter(f => SW_PUBLIC.test(f)).sort().map(f => './' + f),
        ...Object.keys(bundle).filter(f => f.startsWith('assets/')).sort().map(f => './' + f)];
      const sw = fs.readFileSync('src/sw.template.js', 'utf8')
        .replace('__CACHE__', JSON.stringify('gstudio-v' + VERSION))
        .replace('__CORE__', JSON.stringify(files));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: sw });
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: './', // caminhos relativos: o site fica em /G-STUDIO-v1/, não na raiz do domínio
  define: { __APP_VERSION__: JSON.stringify(VERSION) },
  plugins: [gstudio(mode)],
  build: {
    outDir: mode === 'test' ? 'dist-test' : 'dist',
    emptyOutDir: true,
    target: 'es2020', // nunca exige navegador mais novo que o da 1.7.8.1 (a tela de compatibilidade testa ?. e ??)
    cssMinify: false, // o CSS sai como está: a ordem e as regras não mudam
    modulePreload: { polyfill: false },
  },
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4175 },
}));
