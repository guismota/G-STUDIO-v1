// [Ferramenta da modularização, já usada: funciona só no estado do código daquela etapa (veja o git log).]
// Separa os dados de cada gênero, que estavam espalhados (padrões e sons em genres/styles.js; card, paleta e símbolo em
// ui/home.js; capa em ui/covers.js), num arquivo por gênero: src/genres/<gênero>.js. Copia os trechos exatos do código,
// sem redigitar. Os arquivos antigos passam a montar as listas a partir dos arquivos dos gêneros, na mesma ordem.
// Uso: node tools/split-genres.mjs
import fs from 'node:fs';
import { parse } from '@babel/parser';

const rd = f => fs.readFileSync(f, 'utf8');
const P = code => parse(code, { sourceType: 'module', errorRecovery: true });
function findConst(ast, name) {
  for (const n of ast.program.body) if (n.type === 'VariableDeclaration') for (const d of n.declarations) if (d.id.name === name) return { decl: n, init: d.init };
  throw new Error('não achei ' + name);
}
const keyOf = p => p.key.type === 'Identifier' ? p.key.name : p.key.value;
const props = (code, obj) => Object.fromEntries(obj.properties.map(p => [keyOf(p), { text: code.slice(p.value.start, p.value.end), lead: (p.leadingComments || []).map(c => code.slice(c.start, c.end)) }]));

// ---- leitura
const stylesCode = rd('src/genres/styles.js'), homeCode = rd('src/ui/home.js'), coversCode = rd('src/ui/covers.js'), notationCode = rd('src/genres/notation.js');
const sAst = P(stylesCode), hAst = P(homeCode), cAst = P(coversCode);
const ST = findConst(sAst, 'STYLES'), styles = props(stylesCode, ST.init);
const order = ST.init.properties.map(keyOf);
const GE = findConst(hAst, 'GENRES');
const genres = Object.fromEntries(GE.init.elements.map(e => [e.properties.find(p => keyOf(p) === 'k').value.value, homeCode.slice(e.start, e.end)]));
const chOrder = GE.init.elements.map(e => e.properties.find(p => keyOf(p) === 'k').value.value);
const GS = findConst(hAst, 'GSYM'), gsym = props(homeCode, GS.init), gsymOrder = GS.init.properties.map(keyOf);
const HP = findConst(hAst, 'HPAL'), hpal = props(homeCode, HP.init), hpalOrder = HP.init.properties.map(keyOf);
const CO = findConst(cAst, 'COVER'), cover = props(coversCode, CO.init), coverOrder = CO.init.properties.map(keyOf);
// auxiliares só da cumbia (estavam em notation.js)
const cA = notationCode.indexOf('// cumbia: tudo sobre'), cB = notationCode.indexOf('\n', notationCode.indexOf('function CUMA(')) + 1;
if (cA < 0 || cB <= cA) throw new Error('auxiliares da cumbia não encontrados');
const cumbiaHelpers = notationCode.slice(cA, cB);

const varName = k => 'g' + k[0].toUpperCase() + k.slice(1);
for (const k of order) if (!genres[k] || !hpal[k] || !cover[k]) throw new Error('faltam dados do gênero ' + k);

// ---- um arquivo por gênero
for (const k of order) {
  const s = styles[k], name = /name:'([^']*)'/.exec(s.text)[1], ch = 'CH' + String(chOrder.indexOf(k) + 1).padStart(2, '0');
  const lines = [
    `// ${name} (${ch}): tudo o que define o gênero, num lugar só.`,
    '//   style   = andamento, tom, nomes das linhas, cenas prontas, sons (snd) e os 4 loops de cada linha (p)',
    '//   home    = card da tela inicial (cor, descrição, imagem)',
    '//   palette = cores do visual animado',
    '//   cover   = capa tipográfica',
    '//   symbol  = símbolo do card (SVG)' + (gsym[k] ? '' : ' (este gênero não tem)'),
  ];
  if (k === 'cumbia') lines.push(cumbiaHelpers.replace(/\n$/, ''));
  lines.push(...s.lead);
  lines.push(`const ${varName(k)}={`, ` style:${s.text},`, ` home:${genres[k]},`, ` palette:${hpal[k].text},`, ` cover:${cover[k].text},`, ` symbol:${gsym[k] ? gsym[k].text : 'null'}`, '};', '');
  fs.writeFileSync(`src/genres/${k}.js`, lines.join('\n'));
}

// ---- os arquivos antigos montam as listas
const sub = (code, node, text) => code.slice(0, node.start) + text + code.slice(node.end);
fs.writeFileSync('src/genres/notation.js', notationCode.slice(0, cA) + notationCode.slice(cB));
let st = sub(stylesCode, ST.decl, `// os dados de cada gênero ficam em src/genres/<gênero>.js; aqui só a ordem interna dos gêneros\nconst STYLES={${order.map(k => `${k}:${varName(k)}.style`).join(',')}};`);
// tira comentários de gênero que ficaram soltos antes de STYLES (foram para o arquivo do gênero)
fs.writeFileSync('src/genres/styles.js', st);
// home.js e covers.js: de baixo para cima, para as posições não mudarem
const hRep = [[GE.decl, `// card de cada gênero na tela inicial, na ordem dos canais (CH01...); os dados ficam em src/genres/<gênero>.js\nconst GENRES=[${chOrder.map(k => varName(k) + '.home').join(',')}];`],
  [GS.decl, `const GSYM={${gsymOrder.map(k => `'${k}':${varName(k)}.symbol`).join(',')}};`],
  [HP.decl, `const HPAL={${hpalOrder.map(k => `${k}:${varName(k)}.palette`).join(',')}};`]].sort((a, b) => b[0].start - a[0].start);
let h = homeCode; for (const [n, t] of hRep) h = sub(h, n, t);
fs.writeFileSync('src/ui/home.js', h);
fs.writeFileSync('src/ui/covers.js', sub(coversCode, CO.decl, `const COVER={${coverOrder.map(k => `${k}:${varName(k)}.cover`).join(',')}};`));
// índice: os arquivos dos gêneros carregam logo antes de styles.js
let all = rd('src/app/all.js');
all = all.replace("export * from '../genres/styles.js';\n", order.map(k => `export * from '../genres/${k}.js';`).join('\n') + "\nexport * from '../genres/styles.js';\n");
fs.writeFileSync('src/app/all.js', all);
console.log(`ok: ${order.length} gêneros em src/genres/ (ordem interna: ${order.join(', ')}; canais: ${chOrder.join(', ')})`);
