// Servidor local simples para os testes.
// Uso: node tests/serve.mjs <alvo> <porta>
//   legacy  -> a cópia intocada da 1.7.8.1 (legacy/index.html e legacy/sw.js); o resto vem de public/ ou da raiz
//   dist    -> o build final (pasta dist/)
// Com GS_HOOK=1, injeta na versão antiga o gancho de teste window.__gs (só na resposta, o arquivo não muda).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { legacyHook } from './legacy-hook.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = process.argv[2] || 'legacy';
const port = +(process.argv[3] || 4173);
const hook = process.env.GS_HOOK === '1';

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.wav': 'audio/wav', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2' };

const dirs = target === 'dist' ? [path.join(ROOT, 'dist')] : [path.join(ROOT, 'legacy'), path.join(ROOT, 'public'), ROOT];

function find(rel) {
  for (const d of dirs) {
    const f = path.join(d, rel);
    if (!f.startsWith(d)) return null;
    try { if (fs.statSync(f).isFile()) return f } catch (e) {}
  }
  return null;
}

http.createServer((req, res) => {
  let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const f = find(rel);
  if (!f) { res.writeHead(404); res.end('404'); return }
  let body = fs.readFileSync(f);
  const ext = path.extname(f);
  if (hook && target === 'legacy' && ext === '.html' && path.basename(f) === 'index.html') body = Buffer.from(legacyHook(body.toString('utf8')));
  res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  res.end(body);
}).listen(port, '0.0.0.0', () => console.log(`G-STUDIO (${target}${hook ? ', com gancho de teste' : ''}) em http://localhost:${port}/`));
