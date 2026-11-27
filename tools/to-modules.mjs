// [Ferramenta da modularização, já usada: funciona só no estado do código daquela etapa (veja o git log).]
// Fase 2b: transforma os pedaços do app (src/app/parts.json), que o build juntava num bloco só, em módulos
// JavaScript de verdade, mexendo o mínimo possível no código.
//
// Como a ordem de carregamento continua exatamente a mesma:
//  - src/app/all.js é um índice que reexporta todos os módulos NA ORDEM ORIGINAL, e src/main.js só importa o índice;
//  - cada módulo importa do índice os nomes de outros arquivos que usa (e nunca direto de outro módulo). Assim o
//    navegador carrega os módulos na ordem do índice, e, como em todo módulo JavaScript, as funções de todos os
//    arquivos já existem antes de qualquer um rodar (igual ao script antigo, onde toda função existia desde o início).
// O que muda no código:
//  - uma linha de import no topo e uma de export no fim de cada arquivo;
//  - quando um arquivo dá valor a uma variável de OUTRO arquivo (por exemplo playing=true no relógio), a atribuição
//    passa pela ponte LATE (LATE.playing=true), que o arquivo dono registra no seu começo com late(...).
// O gancho de teste (tests/legacy-hook.mjs) vira src/debug.js, que só entra em desenvolvimento e teste.
// Uso: node tools/to-modules.mjs
import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@babel/parser';
import traverseMod from '@babel/traverse';
import MagicString from 'magic-string';
import { HOOK } from '../tests/legacy-hook.mjs';
const traverse = traverseMod.default || traverseMod;

const parts = JSON.parse(fs.readFileSync('src/app/parts.json', 'utf8'));
const DEBUG = 'src/debug.js', ALL = 'src/app/all.js', LATEF = 'src/app/late.js';
const files = [...parts, DEBUG];
const texts = parts.map(p => fs.readFileSync(p, 'utf8')).concat([HOOK.replace(/^\n/, '')]);
const offsets = []; let code = '(()=>{\n'; for (const t of texts) { offsets.push(code.length); code += t } code += '})();\n';
const partAt = pos => { let k = 0; while (k + 1 < offsets.length && offsets[k + 1] <= pos) k++; return k };

const ast = parse(code, { sourceType: 'module' });
let top = null;
traverse(ast, { ArrowFunctionExpression(p) { if (!top) { top = p; p.stop() } } });
const S = top.scope;
for (const n of ['LATE', 'late']) { let clash = false; traverse(ast, { Scopable(p) { if (p.scope.hasOwnBinding(n)) clash = true } }); if (clash) throw new Error('nome reservado já usado no código: ' + n) }

const owner = {};
for (const [name, b] of Object.entries(S.bindings)) owner[name] = partAt(b.identifier.start);
const ms = texts.map(t => new MagicString(t));
const importsOf = files.map(() => new Set());
const exportsOf = files.map(() => new Set());
const lateOf = files.map(() => new Set()); // nomes que outros arquivos atribuem: o dono registra get/set
const local = (k, pos) => pos - offsets[k];

for (const [name, b] of Object.entries(S.bindings)) {
  const o = owner[name];
  for (const r of b.referencePaths) {
    const k = partAt(r.node.start);
    if (k === o) continue;
    importsOf[k].add(name); exportsOf[o].add(name);
  }
  for (const v of b.constantViolations) {
    const k = partAt(v.node.start);
    if (k === o) continue;
    let id = null;
    if (v.isAssignmentExpression() && v.node.left.type === 'Identifier') id = v.node.left;
    else if (v.isUpdateExpression() && v.node.argument.type === 'Identifier') id = v.node.argument;
    else throw new Error(`atribuição de forma inesperada a ${name} em ${files[k]}`);
    ms[k].overwrite(local(k, id.start), local(k, id.end), `LATE.${name}`);
    lateOf[o].add(name); exportsOf[o].add(name);
  }
}

const rel = (from, to) => { let r = path.relative(path.dirname(from), to).split(path.sep).join('/'); return r.startsWith('.') ? r : './' + r };
for (let k = 0; k < files.length; k++) {
  const f = files[k], head = [], tail = [];
  const usesLate = /\bLATE\./.test(ms[k].toString()), registers = lateOf[k].size > 0;
  if (usesLate || registers) head.push(`import { ${['LATE', registers ? 'late' : ''].filter(Boolean).join(', ')} } from '${rel(f, LATEF)}';`);
  if (importsOf[k].size) head.push(`import { ${[...importsOf[k]].sort().join(', ')} } from '${rel(f, ALL)}';`);
  if (registers) head.push(`late({${[...lateOf[k]].sort().map(n => `get ${n}(){return ${n}},set ${n}(v){${n}=v}`).join(',')}});`);
  if (exportsOf[k].size) tail.push(`export { ${[...exportsOf[k]].sort().join(', ')} };`);
  if (head.length) ms[k].prepend(head.join('\n') + '\n');
  if (tail.length) ms[k].append(tail.join('\n') + '\n');
  fs.writeFileSync(f, (f === DEBUG ? '// Gancho de teste window.__gs: só existe em desenvolvimento e teste, nunca no build final (veja tests/README.md).\n' : '') + ms[k].toString());
}

fs.writeFileSync(LATEF, `// Ponte para quando um arquivo dá valor a uma variável que mora em OUTRO arquivo (etapa de transição da
// modularização): um módulo não pode mudar diretamente a variável importada de outro, então a atribuição vira
// LATE.nome = valor, e o arquivo dono registra o nome no seu começo com late({ get nome(){...}, set nome(v){...} }).
export const LATE = {};
export const late = o => {
  for (const k of Object.keys(o)) if (Object.prototype.hasOwnProperty.call(LATE, k)) throw new Error('LATE.' + k + ' recebeu valor antes de o arquivo dono carregar');
  Object.defineProperties(LATE, Object.getOwnPropertyDescriptors(o));
};
`);
fs.writeFileSync(ALL, `// Índice de todos os módulos do app, NA ORDEM ORIGINAL de carregamento (a ordem importa).
// Os módulos importam daqui os nomes de outros arquivos; assim o navegador carrega cada arquivo na ordem desta lista,
// e as funções de todos já existem antes de qualquer um rodar, como no script único da 1.7.8.1.
${parts.map(p => `export * from '${rel(ALL, p)}';`).join('\n')}
`);
fs.writeFileSync('src/main.js', `// Ponto de entrada do G-STUDIO.
import './app/all.js'; // todos os módulos do app, na ordem original
import 'virtual:gstudio-debug'; // gancho de teste window.__gs (só em desenvolvimento e teste)
`);
const nImp = importsOf.reduce((a, s) => a + s.size, 0), nLate = lateOf.reduce((a, s) => a + s.size, 0);
const nAssign = [...ms.entries()].reduce((a, [, m]) => a + (m.toString().match(/\bLATE\.\w+/g) || []).length, 0);
console.log(`ok: ${files.length} módulos; ${nImp} importações de nomes; ${nLate} variáveis com ponte LATE (${nAssign} usos)`);
