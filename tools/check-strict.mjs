// [Ferramenta da modularização, já usada: funciona só no estado do código daquela etapa (veja o git log).]
// Confere se o código do app roda igual em "modo estrito" (módulos JavaScript são sempre estritos; o script antigo
// não era). Procura o que muda de comportamento:
//  - sintaxe proibida no modo estrito (o analisador acusa ao ler como módulo)
//  - variável usada sem ser declarada recebendo valor (no modo antigo virava global; no estrito dá erro)
//  - função declarada dentro de um bloco { } e usada fora dele (no estrito ela fica presa ao bloco)
//  - uso de this solto, arguments.callee, delete de variável
// Uso: node tools/check-strict.mjs
import fs from 'node:fs';
import { parse } from '@babel/parser';
import traverseMod from '@babel/traverse';
const traverse = traverseMod.default || traverseMod;

const parts = JSON.parse(fs.readFileSync('src/app/parts.json', 'utf8'));
const code = '(()=>{\n' + parts.map(p => fs.readFileSync(p, 'utf8')).join('') + '})();\n';
const problems = [];
let ast;
try { ast = parse(code, { sourceType: 'module', errorRecovery: true }) } catch (e) { console.error('erro de leitura no modo estrito:', e.message); process.exit(1) }
for (const e of ast.errors || []) problems.push('sintaxe (estrito): ' + e.message);

const lineOf = n => { const ln = n.loc.start.line - 1; let acc = 1; for (const p of parts) { const c = fs.readFileSync(p, 'utf8').split('\n').length - 1; if (ln < acc + c) return `${p}:${ln - acc + 1}`; acc += c } return '?' };
const KNOWN_GLOBALS = new Set(Object.getOwnPropertyNames(globalThis).concat(['window', 'document', 'navigator', 'location', 'localStorage', 'sessionStorage', 'indexedDB', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame', 'matchMedia', 'getComputedStyle', 'innerWidth', 'innerHeight', 'devicePixelRatio', 'screen', 'history', 'caches', 'MediaRecorder', 'AudioContext', 'OfflineAudioContext', 'Blob', 'File', 'FileReader', 'Image', 'IntersectionObserver', 'ResizeObserver', 'PointerEvent', 'KeyboardEvent', 'CustomEvent', 'Event', 'HTMLElement', 'Element', 'Node', 'DOMParser', 'XMLSerializer', 'alert', 'confirm', 'prompt', 'open', 'scrollTo', 'getSelection', 'CSS', 'Audio', '__APP_VERSION__', 'GSC', 'gsCompatUI']));

traverse(ast, {
  AssignmentExpression(p) {
    const l = p.node.left;
    if (l.type === 'Identifier' && !p.scope.hasBinding(l.name)) problems.push(`atribuição a variável não declarada "${l.name}" em ${lineOf(l)}`);
  },
  UpdateExpression(p) {
    const a = p.node.argument;
    if (a.type === 'Identifier' && !p.scope.hasBinding(a.name)) problems.push(`++/-- em variável não declarada "${a.name}" em ${lineOf(a)}`);
  },
  FunctionDeclaration(p) {
    const parent = p.parentPath;
    if (parent.isBlockStatement() && !parent.parentPath.isFunction() && !parent.parentPath.isProgram()) {
      const name = p.node.id.name, block = parent.node;
      const outside = p.scope.parent.getBinding(name);
      // usos fora do bloco: referências cujo caminho não está dentro do bloco
      const binding = p.parentPath.scope.getBinding(name);
      const refs = binding ? binding.referencePaths : [];
      const leaks = refs.filter(r => !r.findParent(x => x.node === block));
      if (leaks.length || outside) problems.push(`função "${name}" declarada dentro de bloco e usada fora dele em ${lineOf(p.node)}`);
    }
  },
  ThisExpression(p) {
    const fn = p.getFunctionParent();
    if (!fn || (fn.isArrowFunctionExpression() && !fn.findParent(x => x.isFunction() && !x.isArrowFunctionExpression()))) problems.push(`this solto em ${lineOf(p.node)}`);
  },
  MemberExpression(p) {
    if (p.node.object.type === 'Identifier' && p.node.object.name === 'arguments' && p.node.property.name === 'callee') problems.push(`arguments.callee em ${lineOf(p.node)}`);
  },
  UnaryExpression(p) {
    if (p.node.operator === 'delete' && p.node.argument.type === 'Identifier') problems.push(`delete de variável em ${lineOf(p.node)}`);
  },
});

// nomes usados sem declaração (só leitura): servem para revisar globais do navegador
const free = new Set();
traverse(ast, { ReferencedIdentifier(p) { const n = p.node.name; if (!p.scope.hasBinding(n) && !KNOWN_GLOBALS.has(n)) free.add(n) } });

if (problems.length) { console.log('PROBLEMAS:\n  ' + problems.join('\n  ')); }
else console.log('ok: nada no código muda de comportamento no modo estrito');
console.log('nomes globais usados que não estão na lista conhecida (só para revisão):', [...free].sort().join(', ') || 'nenhum');
process.exit(problems.length ? 1 : 0);
