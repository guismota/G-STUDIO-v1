// [Ferramenta da modularização, já usada: funciona só no estado do código daquela etapa (veja o git log).]
// Ferramenta de uso único (fase 2a da modularização): corta o index.html da 1.7.8.1 (legacy/index.html) em
// arquivos, sem redigitar nada.
//  - index.html: só a estrutura da página, o script de compatibilidade ES5 inline e a chamada do app
//  - src/styles/*.css: o CSS em arquivos numerados, na MESMA ordem de hoje (uma regra de baixo corrige outra de cima)
//  - src/**: o código do app em pedaços, cada um no lugar onde vai morar; src/app/parts.json guarda a ordem
// No fim, junta tudo de volta e confere que sai exatamente o index.html antigo, byte a byte.
// Uso: node tools/split-legacy.mjs
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'legacy/index.html';
const html = fs.readFileSync(SRC, 'utf8');
const L = html.split('\n');
const idx = (pred, from = 0) => { for (let i = from; i < L.length; i++) if (pred(L[i], i)) return i; throw new Error('não achei: ' + pred) };

// ---- blocos do arquivo
const styleOpen = idx(l => l === '<style>'), styleClose = idx(l => l === '</style>', styleOpen);
const mainOpen = idx((l, i) => l === '<script>' && L[i + 1] === '(()=>{', styleClose);
const mainClose = idx(l => l === '</script>', mainOpen);
if (L[mainClose - 1] !== '})();') throw new Error('fim do bloco principal inesperado');
const bodyFrom = mainOpen + 2, bodyTo = mainClose - 2; // linhas do código, sem o (()=>{ e o })();

// ---- código: pedaços pela divisão de seções que já existe no código
const JS = [
  ['src/app/core/prelude.js', null],
  ['src/genres/notation.js', '// ---------- Dados musicais'],
  ['src/genres/styles.js', 'const STYLES={'],
  ['src/state/session.js', "let style='house';"],
  ['src/engine/context.js', '// ---------- Áudio ----------'],
  ['src/engine/voices.js', '// ---------- Limpeza de vozes'],
  ['src/engine/mixer.js', '// cadeia de cada linha'],
  ['src/engine/samples.js', '// ----- amostras gravadas'],
  ['src/engine/synths/drums.js', '// ----- bateria -----'],
  ['src/engine/synths/cumbia.js', '// ----- cumbia:'],
  ['src/engine/synths/house909.js', '// ----- bateria estilo 909'],
  ['src/engine/synths/bass.js', '// ----- baixos -----'],
  ['src/engine/synths/chords.js', '// ----- acordes -----'],
  ['src/engine/synths/leads.js', '// ----- leads -----'],
  ['src/engine/synths/sub-pads-arps-fx.js', '// ----- sidechain'],
  ['src/engine/play-lane.js', '// ----- tocar uma linha'],
  ['src/engine/scheduler.js', '// ---------- Relógio'],
  ['src/ui/scenes.js', '// ---------- Cenas'],
  ['src/ui/editor.js', '// ---------- Editor de loops'],
  ['src/ui/knobs.js', '// ---------- Knobs'],
  ['src/ui/session.js', '// ---------- Interface'],
  ['src/ui/free.js', '// ---------- Tela livre'],
  ['src/engine/fx.js', '// ---------- Efeitos (plugins)'],
  ['src/ui/fx-plugins.js', '// --- interface do plugin'],
  ['src/ui/xpad.js', '// ---------- X-Pad'],
  ['src/ui/fx-bar.js', '// ---------- Efeitos na barra'],
  ['src/ui/oneshots.js', '// ---------- One Shots'],
  ['src/state/projects.js', '// ---------- Projetos'],
  ['src/state/backup.js', '// ---------- Backup'],
  ['src/ui/settings.js', '// ---------- Configurações'],
  ['src/input/keyboard.js', '// ---------- Aparelho, instalação'],
  ['src/state/history.js', '// ---------- Desfazer / refazer'],
  ['src/engine/remix.js', '// ---------- Remix FX'],
  ['src/ui/remix.js', '// ---- interface'],
  ['src/engine/recorder.js', '// ---------- Gravação'],
  ['src/ui/meters.js', '// ---------- Medidores'],
  ['src/ui/home.js', '// ---------- Boas-vindas, início'],
  ['src/ui/covers.js', '// ---------- Capas tipográficas'],
  ['src/ui/visuals.js', '// desenha um quadro do visual do canal'],
  ['src/ui/home-build.js', 'function buildHome(){'],
  ['src/engine/preview.js', '// ----- prévia de cada gênero'],
  ['src/ui/navigation.js', '// troca de página'],
  ['src/ui/terms.js', '// ---------- Termos de Uso'],
  ['src/ui/onboarding.js', '// ---------- primeira vez'],
  ['src/ui/piano-roll.js', '// ---------- Piano roll'],
  ['src/ui/transport.js', 'function setBpm(v){'],
  ['src/ui/render.js', "let lastMsg='',lastPos='';"],
  ['src/ui/explore.js', '// ===================== EXPLORAR'],
  ['src/ui/novo.js', '// ---------- Criar novo: estado'],
  ['src/state/library.js', '// ---------- buffers'],
  ['src/engine/mic.js', '// ---------- gravação pelo microfone'],
  ['src/ui/explore-view.js', '// ---------- interface do Explorar'],
  ['src/ui/tour.js', '// ===================== TOUR RÁPIDO'],
  ['src/app/start.js', 'buildScenes();'],
];
const starts = [];
let at = bodyFrom;
for (const [file, marker] of JS) {
  const s = marker == null ? bodyFrom : idx((l, i) => i >= at && i <= bodyTo && l.startsWith(marker), at);
  if (marker != null && s <= at && starts.length) throw new Error('marcador fora de ordem: ' + marker);
  starts.push(s); at = s + 1;
}
const jsParts = JS.map(([file], k) => ({ file, from: starts[k], to: (k + 1 < JS.length ? starts[k + 1] : bodyTo + 1) - 1 }));

// ---- CSS: corta em comentários de seção no nível de fora (fora de chaves), juntando seções pequenas
const cssFrom = styleOpen + 1, cssTo = styleClose - 1;
const depthAt = []; // profundidade de chaves no começo de cada linha
{ let d = 0, inC = false, inS = null;
  for (let i = cssFrom; i <= cssTo; i++) {
    depthAt[i] = (inC || inS) ? -1 : d;
    const s = L[i];
    for (let k = 0; k < s.length; k++) {
      const c = s[k], n = s[k + 1];
      if (inC) { if (c === '*' && n === '/') { inC = false; k++ } continue }
      if (inS) { if (c === '\\') { k++; continue } if (c === inS) inS = null; continue }
      if (c === '/' && n === '*') { inC = true; k++; continue }
      if (c === '"' || c === "'") { inS = c; continue }
      if (c === '{') d++; else if (c === '}') d--;
    }
  }
}
const slug = s => s.replace(/^\/\*\s*/, '').replace(/\*\/.*$/, '').replace(/=+/g, '').trim().toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'secao';
let cuts = [cssFrom];
for (let i = cssFrom + 1; i <= cssTo; i++) if (depthAt[i] === 0 && /^\/\*/.test(L[i])) cuts.push(i);
const MIN = 30; // seções menores que isso entram na anterior
const merged = [cuts[0]];
for (let k = 1; k < cuts.length; k++) { const next = k + 1 < cuts.length ? cuts[k + 1] : cssTo + 1; if (cuts[k] - merged[merged.length - 1] >= MIN || next - cuts[k] >= MIN * 3) merged.push(cuts[k]) }
const cssParts = merged.map((s, k) => {
  const to = (k + 1 < merged.length ? merged[k + 1] : cssTo + 1) - 1;
  const name = k === 0 ? 'base' : slug(L[s]);
  return { file: `src/styles/${String(k + 1).padStart(2, '0')}-${name}.css`, from: s, to };
});

// ---- escreve
const lines = (a, b) => L.slice(a, b + 1).join('\n') + '\n';
const write = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s) };
for (const p of jsParts) write(p.file, lines(p.from, p.to));
for (const p of cssParts) write(p.file, lines(p.from, p.to));
write('src/app/parts.json', JSON.stringify(jsParts.map(p => p.file), null, 1) + '\n');
write('src/styles/index.css', '/* CSS do G-STUDIO, na ordem original: a ordem importa (uma regra de baixo corrige outra de cima) */\n' +
  cssParts.map(p => `@import './${path.basename(p.file)}';`).join('\n') + '\n');
const fontsLink = idx(l => l.startsWith('<link href="https://fonts.googleapis.com/css2'));
if (fontsLink !== styleOpen - 1) throw new Error('fontes não estão logo antes do <style>');
const out = [
  ...L.slice(0, styleOpen),
  '<link rel="stylesheet" href="/src/styles/index.css">',
  ...L.slice(styleClose + 1, mainOpen),
  '<script type="module" src="/src/main.js"></script>',
  ...L.slice(mainClose + 1),
].join('\n');
write('index.html', out);

// ---- confere: junta tudo de volta e tem que dar o original, byte a byte
const rd = f => fs.readFileSync(f, 'utf8');
const css = cssParts.map(p => rd(p.file)).join(''), js = jsParts.map(p => rd(p.file)).join('');
const back = rd('index.html').split('\n');
const iCss = back.indexOf('<link rel="stylesheet" href="/src/styles/index.css">'), iJs = back.indexOf('<script type="module" src="/src/main.js"></script>');
const rebuilt = [...back.slice(0, iCss), '<style>', css.replace(/\n$/, ''), '</style>', ...back.slice(iCss + 1, iJs),
  '<script>', '(()=>{', js.replace(/\n$/, ''), '})();', '</script>', ...back.slice(iJs + 1)].join('\n');
if (rebuilt !== html) { let i = 0; while (rebuilt[i] === html[i]) i++; console.log('diferença na posição', i, JSON.stringify(html.slice(i - 80, i + 80)), '\n---\n', JSON.stringify(rebuilt.slice(i - 80, i + 80)), rebuilt.length, html.length); throw new Error('a reconstrução NÃO bate com o original') }
console.log(`ok: ${jsParts.length} arquivos de código, ${cssParts.length} de CSS; juntando tudo de volta dá o original byte a byte`);
for (const p of jsParts) console.log(String(p.to - p.from + 1).padStart(5), p.file);
for (const p of cssParts) console.log(String(p.to - p.from + 1).padStart(5), p.file);
