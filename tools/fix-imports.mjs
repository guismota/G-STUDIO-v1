// Manutenção dos módulos do app: acerta as linhas de import (do índice src/app/all.js) e de export de cada arquivo
// listado no índice, a partir do que o código de fato usa e oferece. Rode depois de mover código entre arquivos.
// Também acusa: nome usado que nenhum módulo oferece, nome oferecido por dois módulos, e variável de outro arquivo
// recebendo valor sem passar pela ponte LATE.
// Uso: node tools/fix-imports.mjs            (corrige os arquivos)
//      node tools/fix-imports.mjs --check    (só confere; sai com erro se algo estiver fora do lugar)
import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@babel/parser';
import traverseMod from '@babel/traverse';
const traverse = traverseMod.default || traverseMod;

const CHECK = process.argv.includes('--check');
const ALL = 'src/app/all.js';
const files = [...fs.readFileSync(ALL, 'utf8').matchAll(/^export \* from '([^']+)';$/gm)].map(m => path.join(path.dirname(ALL), m[1]));
const extra = ['src/debug.js']; // importa do índice, mas não está nele
const GLOBALS = new Set(['window', 'document', 'navigator', 'location', 'localStorage', 'sessionStorage', 'indexedDB', 'performance', 'console', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'requestAnimationFrame', 'cancelAnimationFrame', 'matchMedia', 'getComputedStyle', 'innerWidth', 'innerHeight', 'devicePixelRatio', 'history', 'caches', 'fetch', 'Math', 'JSON', 'Date', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Promise', 'Map', 'Set', 'WeakMap', 'Symbol', 'Error', 'TypeError', 'RegExp', 'Float32Array', 'Uint8Array', 'Int16Array', 'ArrayBuffer', 'DataView', 'Blob', 'File', 'FileReader', 'URL', 'Image', 'Audio', 'AudioContext', 'OfflineAudioContext', 'MediaRecorder', 'IntersectionObserver', 'ResizeObserver', 'PointerEvent', 'KeyboardEvent', 'CustomEvent', 'Event', 'HTMLElement', 'Element', 'Node', 'CSS', 'alert', 'confirm', 'prompt', 'isFinite', 'isNaN', 'parseInt', 'parseFloat', 'encodeURIComponent', 'decodeURIComponent', 'btoa', 'atob', 'undefined', 'NaN', 'Infinity', 'arguments', 'globalThis', 'screen', 'GSC', 'gsCompatUI', '__APP_VERSION__', 'structuredClone', 'queueMicrotask', 'TextEncoder', 'TextDecoder', 'crypto', 'Intl', 'Reflect', 'Proxy', 'BigInt', 'escape', 'unescape', 'scrollTo', 'getSelection', 'open', 'close', 'print', 'focus', 'blur']);

const info = {};
for (const f of [...files, ...extra]) {
  const code = fs.readFileSync(f, 'utf8');
  // a linha de import do índice sai antes da análise (ela é refeita no fim)
  const ast = parse(code.replace(/^import \{[^}]*\} from '(\.\.?\/)+(app\/)?all\.js';$/m, ''), { sourceType: 'module', errorRecovery: true, plugins: f.endsWith('.ts') ? ['typescript'] : [] }); // tolera export de nome que saiu do arquivo (é justamente o que vamos corrigir)
  const declared = new Set(), free = new Set(), assignedImports = [];
  let prog = null;
  traverse(ast, { Program(p) { prog = p; p.stop() } });
  for (const [n, b] of Object.entries(prog.scope.bindings)) if (b.kind !== 'module') declared.add(n);
  traverse(ast, {
    ReferencedIdentifier(p) { const n = p.node.name; if (p.parentPath.isExportSpecifier()) return; const b = p.scope.getBinding(n); if (!b || b.kind === 'module') free.add(n) },
    AssignmentExpression(p) { const l = p.node.left; if (l.type === 'Identifier') { const b = p.scope.getBinding(l.name); if (!b || b.kind === 'module') assignedImports.push(l.name) } },
    UpdateExpression(p) { const a = p.node.argument; if (a.type === 'Identifier') { const b = p.scope.getBinding(a.name); if (!b || b.kind === 'module') assignedImports.push(a.name) } },
  });
  info[f] = { code, declared, free, assignedImports };
}
const owner = {}, problems = [];
// um nome pode existir num arquivo do motor e também num de tela: a versão do motor é PRIVADA dele (lê a cópia do
// estado que é do motor) e nunca é oferecida às telas; as telas e os outros arquivos usam a versão de fora do motor
const isEngine = f => f.startsWith('src/engine/');
const privateIn = {}; // arquivo do motor -> nomes privados
for (const f of files) for (const n of info[f].declared) {
  const o = owner[n];
  if (!o) { owner[n] = f; continue }
  if (isEngine(o) && !isEngine(f)) { (privateIn[o] = privateIn[o] || new Set()).add(n); owner[n] = f }
  else if (!isEngine(o) && isEngine(f)) (privateIn[f] = privateIn[f] || new Set()).add(n);
  else problems.push(`"${n}" declarado em ${o} e em ${f}`);
}
const used = {}; // nome -> arquivos que usam de fora
for (const f of [...files, ...extra]) {
  for (const n of info[f].free) {
    if (n === 'LATE' || n === 'late' || n === 'engine' && false) continue;
    if (owner[n] && owner[n] !== f) (used[n] = used[n] || new Set()).add(f);
    else if (!owner[n] && !GLOBALS.has(n) && !(n in globalThis)) problems.push(`"${n}" usado em ${f} e não declarado em nenhum módulo`);
  }
  for (const n of info[f].assignedImports) if (n !== 'LATE') problems.push(`"${n}" recebe valor em ${f}, mas é de outro arquivo: use LATE.${n}`);
}
if (problems.length) { console.log('PROBLEMAS (nada foi gravado):\n  ' + problems.join('\n  ')); process.exit(1) }
const rel = (from, to) => { let r = path.relative(path.dirname(from), to).split(path.sep).join('/'); return r.startsWith('.') ? r : './' + r };
let changed = 0;
for (const f of [...files, ...extra]) {
  const imps = [...info[f].free].filter(n => owner[n] && owner[n] !== f).sort();
  const exps = files.includes(f) ? [...info[f].declared].filter(n => used[n] && owner[n] === f).sort() : [];
  let lines = info[f].code.split('\n');
  const iImp = lines.findIndex(l => /^import \{[^}]*\} from '(\.\.?\/)+(app\/)?all\.js';$/.test(l));
  const newImp = imps.length ? `import { ${imps.join(', ')} } from '${rel(f, ALL)}';` : null;
  if (iImp >= 0) { if (newImp) lines[iImp] = newImp; else lines.splice(iImp, 1) }
  else if (newImp) { let at = 0; while (at < lines.length && /^(\/\/|import )/.test(lines[at])) at++; lines.splice(at, 0, newImp) }
  // ponte LATE: import só quando o arquivo usa
  {
    const body = lines.filter(l => !/^import \{[^}]*\} from '[^']*late\.js';$/.test(l)).join('\n');
    const need = ['LATE', 'late'].filter(n => n === 'LATE' ? /\bLATE\./.test(body) : /^late\(/m.test(body));
    const iL = lines.findIndex(l => /^import \{[^}]*\} from '[^']*late\.js';$/.test(l));
    const newL = need.length && f !== 'src/app/late.js' ? `import { ${need.join(', ')} } from '${rel(f, 'src/app/late.js')}';` : null;
    if (iL >= 0) { if (newL) lines[iL] = newL; else lines.splice(iL, 1) }
    else if (newL) lines.unshift(newL);
  }
  const iExp = lines.findIndex(l => /^export \{[^}]*\};$/.test(l));
  const newExp = exps.length ? `export { ${exps.join(', ')} };` : null;
  if (iExp >= 0) { if (newExp) lines[iExp] = newExp; else lines.splice(iExp, 1) }
  else if (newExp) { if (lines[lines.length - 1] === '') lines.splice(lines.length - 1, 0, newExp); else lines.push(newExp) }
  const out = lines.join('\n');
  if (out !== info[f].code) { changed++; if (!CHECK) fs.writeFileSync(f, out); else problems.push(`import/export desatualizado em ${f}`) }
}
if (problems.length) { console.log('PROBLEMAS:\n  ' + problems.join('\n  ')); process.exit(1) }
console.log(CHECK ? 'ok: imports e exports em ordem' : `ok: ${changed} arquivo(s) acertado(s)`);
