// Mapa de dependências entre os pedaços do app (src/app/parts.json): quem declara cada nome do escopo principal,
// quem usa, se o uso acontece ao carregar (fora de função) ou só depois (dentro de função), e quais nomes recebem
// valor fora do arquivo onde foram declarados. Serve para planejar a conversão em módulos de verdade.
// Uso: node tools/deps.mjs [--json saida.json]
import fs from 'node:fs';
import { parse } from '@babel/parser';
import traverseMod from '@babel/traverse';
const traverse = traverseMod.default || traverseMod;

const parts = JSON.parse(fs.readFileSync('src/app/parts.json', 'utf8'));
const texts = parts.map(p => fs.readFileSync(p, 'utf8'));
const code = '(()=>{\n' + texts.join('') + '})();\n';
const starts = []; { let ln = 2; for (const t of texts) { starts.push(ln); ln += t.split('\n').length - 1 } }
const partOf = line => { let k = 0; while (k + 1 < starts.length && starts[k + 1] <= line) k++; return k };

const ast = parse(code, { sourceType: 'module' });
let top = null;
traverse(ast, { ArrowFunctionExpression(p) { if (!top) { top = p; p.stop() } } });
const scope = top.scope;

const decl = {}; // nome -> { part, kind, mutable }
for (const [name, b] of Object.entries(scope.bindings)) {
  decl[name] = { part: partOf(b.identifier.loc.start.line), kind: b.kind, assignedIn: new Set(b.constantViolations.map(v => partOf(v.node.loc.start.line))) };
}
const refs = []; // { from, to, name, load }
for (const [name, b] of Object.entries(scope.bindings)) {
  for (const r of b.referencePaths) {
    const fn = r.getFunctionParent();
    const load = !fn || fn.node === top.node; // uso direto no carregamento
    refs.push({ from: partOf(r.node.loc.start.line), to: decl[name].part, name, load });
  }
}

const fwd = refs.filter(r => r.to > r.from), fwdLoad = fwd.filter(r => r.load);
const mutable = Object.entries(decl).filter(([, d]) => d.kind === 'let' || d.kind === 'var' ? d.assignedIn.size > 0 : false);
const crossAssign = Object.entries(decl).filter(([, d]) => [...d.assignedIn].some(p => p !== d.part));
console.log(`nomes no escopo principal: ${Object.keys(decl).length}`);
console.log(`usos entre arquivos: ${refs.filter(r => r.from !== r.to).length}`);
console.log(`usos de algo definido MAIS ADIANTE: ${fwd.length} (${new Set(fwd.map(r => r.name)).size} nomes), sendo ${fwdLoad.length} no carregamento`);
if (fwdLoad.length) console.log('  no carregamento: ' + [...new Set(fwdLoad.map(r => `${r.name} (${parts[r.from]} -> ${parts[r.to]})`))].join('\n  '));
console.log(`variáveis que mudam de valor: ${mutable.length}`);
console.log(`variáveis que recebem valor fora do arquivo onde nascem: ${crossAssign.length}`);
for (const [n, d] of crossAssign) console.log(`  ${n} (${parts[d.part]}) recebe valor em: ${[...d.assignedIn].filter(p => p !== d.part).map(p => parts[p]).join(', ')}`);
const byKind = {}; for (const d of Object.values(decl)) byKind[d.kind] = (byKind[d.kind] || 0) + 1;
console.log('tipos de declaração:', JSON.stringify(byKind));
const out = process.argv.indexOf('--json');
if (out > 0) fs.writeFileSync(process.argv[out + 1], JSON.stringify({ parts, decl: Object.fromEntries(Object.entries(decl).map(([n, d]) => [n, { ...d, assignedIn: [...d.assignedIn] }])), refs }, null, 0));
