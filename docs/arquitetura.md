# Arquitetura do G-STUDIO (a partir da 1.7.8.2)

O app é feito de duas partes que só conversam por mensagens: as **telas** (HTML, CSS e JavaScript) e o **motor de áudio**. Hoje o motor é em JavaScript (Web Audio); no app nativo ele será em C++ (JUCE 8), e as telas continuam as mesmas, dentro do WebView.

## Pastas

| Pasta | O que tem |
|---|---|
| `index.html` | Estrutura da página e o script de compatibilidade ES5 (inline, roda antes de tudo, até em navegador antigo). |
| `src/main.js` | Ponto de entrada: carrega `src/app/all.js`. |
| `src/app/` | `all.js` (índice de todos os módulos, na ordem de carregamento), `late.js` (ponte para atribuições entre arquivos, da transição) e `core/` (utilidades e estado compartilhado). |
| `src/engine/` | O motor: `protocol.ts` (o contrato), `index.ts` (a porta de entrada), contexto de áudio, limpeza de vozes, relógio, sintetizadores, amostras, efeitos, Remix FX, One Shots, prévia, gravação, microfone, notas e laço de quadros (posição e medidores). |
| `src/genres/` | Um arquivo por gênero (`house.js`, `cumbia.js`...): andamento, tom, cenas, sons, loops, card, paleta, capa e símbolo. `notation.js` é a "linguagem" para escrever os loops; `styles.js` só monta a lista. |
| `src/ui/` | As telas: início, capas, sessão, cenas, editores, piano roll, efeitos, Remix FX, One Shots, Ajustes, Explorar, Criar novo, termos, boas-vindas, tour. |
| `src/input/` | Entrada de controles: `actions.js` (as ações do usuário), atalhos de teclado, Musical Typing e `midi.js` (plano do MIDI, ainda não implementado). |
| `src/state/` | Dados salvos: projetos, backup, biblioteca, desfazer. As chaves do localStorage e o IndexedDB são os mesmos de sempre. |
| `src/shared/` | Tabelas e contas sem áudio usadas pelos dois lados (padrões, efeitos, Remix FX). |
| `src/styles/` | O CSS, em arquivos numerados na ordem original (a ordem importa). |
| `public/` | Ícones, manifest e amostras `.wav` (com `smp/CREDITOS.txt`). |
| `legacy/` | A 1.7.8.1 intocada, usada como referência pelos testes. |
| `tests/` | Testes Playwright (veja `tests/README.md`). |
| `tools/` | Ferramentas: `fix-imports.mjs` (manutenção dos imports) e as ferramentas, já usadas, que fizeram a modularização. |

## O protocolo (src/engine/protocol.ts)

- **Comandos** (tela → motor), em JSON: `{ type: 'clip.tap', lane: 'kick', slot: 2 }`, `{ type: 'fx.set', ... }`, `{ type: 'note.on', ... }`.
- **Eventos** (motor → tela): `{ type: 'transport.step', step, bar }`, `{ type: 'meters', ... }`, `{ type: 'clips', ... }`.
- Pedido com resposta leva um código (`token`) e a resposta chega num evento com o mesmo código (`engine.request`).
- Arquivos (gravações, sons) não vão dentro do JSON: vão por um código (`id`).
- No código das telas: `engine.send(comando)` e `engine.on('evento', função)`. As telas não usam nenhuma função nem variável do motor.
- `src/engine/index.ts` trata cada comando; o TypeScript confere que nenhum comando do protocolo ficou sem tratamento (`npm run typecheck`).
- Os comandos são atendidos na mesma hora: no iPad, o áudio só é liberado se o pedido chegar dentro do próprio toque.

### O que muda com o motor em C++

- A ponte troca: em vez do motor em JavaScript, `engine.send` manda a mensagem para o C++ pelo WebView do JUCE, e os eventos voltam pelo mesmo caminho.
- Neste motor em JavaScript, a tela e o motor ainda compartilham alguns objetos na memória (as linhas, os ajustes `CFG`, os knobs `K`, o andamento e o estado do transporte). Por isso os comandos já levam todos os dados e a tela atualiza o que mostra a partir dos eventos: o motor em C++ vai guardar a sua própria cópia, e as telas não precisam mudar. Os efeitos já têm cópia separada no motor (`FXE`).
- Os testes de níveis e de controles vão servir para comparar o motor em C++ com o motor em JavaScript, que é a referência.

## Como rodar

- `npm run dev`: servidor de desenvolvimento (abre também no iPad pela rede Wi-Fi).
- `npm run build`: build final em `dist/`.
- `npm test`: checagem de tipos, build e todos os testes, comparando com a 1.7.8.1.
- A versão fica só em `package.json` (`appVersion`); o build grava no app e no nome do cache do service worker.
