# Testes do G-STUDIO

Os testes comparam a versão nova com a 1.7.8.1, guardada intocada em `legacy/`. Para quem usa o app, nada pode mudar.

Os navegadores de teste rodam **mudos** (nada sai pelos alto-falantes; o som é gerado e medido dentro do app) e com o áudio fixo em **48 kHz**, a taxa do iPad, para as medições não dependerem do aparelho de som ligado no Mac.

## Comandos

| Comando | O que faz |
|---|---|
| `npm test` | Monta o build final e o build de teste e roda todos os testes contra a versão nova, comparando com a 1.7.8.1. |
| `npm run test:legacy` | Roda os testes contra a própria 1.7.8.1 (para conferir a régua). |
| `npm run test:baseline` | Gera a referência a partir da 1.7.8.1: capturas de tela e níveis de áudio (3 rodadas). |
| `npm run test:fixtures` | Gera de novo os dados salvos de referência (projeto, gênero criado, som importado e backup) na 1.7.8.1. Só é preciso uma vez. |
| `npm run levels:report` | Resumo dos níveis: variação entre rodadas, clipagem, faixas mudas e faixas no topo do medidor. |
| `npm run serve:legacy` | Abre a 1.7.8.1 em http://localhost:4173/ para conferir no navegador. |

## O que cada teste confere

- `screens.spec.ts`: 17 telas (início, destaque, cards, os 11 gêneros, Remix FX, Tamanho, sequenciador, piano roll, Ajustes, termos, texto dos termos, boas-vindas e compatibilidade bloqueada) nos 3 tamanhos de iPad e em 1440x900, em Chromium e WebKit. O sorteio é fixo e o relógio da página fica parado, para as capturas saírem idênticas. Tolerância: só serrilhado de borda (no máximo 0,1% dos pontos).
- `audio-levels.spec.ts`: para cada gênero e cada um dos 4 padrões, toca todas as linhas por 4 compassos, com o app recém-aberto, e mede o pico de cada faixa no mesmo ponto e na mesma escala do medidor do app (0 a 1). Nenhuma faixa com padrão pode ficar muda; a versão nova não pode clipar onde a 1.7.8.1 não clipa (ela já clipa no Acid House, padrão 3); e cada faixa tem que cair dentro da faixa medida na 1.7.8.1 (3 rodadas), com folga de 0,03. Se uma faixa sair, o padrão é medido de novo até 3 vezes.
- `controls.spec.ts`: controles que mexem no som, acionados pela tela (Remix FX: filtro grave e agudo, eco, gater e pitch; efeitos da barra: reverb, delay, echo, distorção e filtro; One Shots: buzina, riser e crash; na tela inicial: prévia do destaque e audição de instrumento e de som gravado no Explorar). Mede o volume médio, o volume só dos agudos e o pico da saída final; a versão nova tem que ficar a no máximo 0,25 dB (volume médio), 0,5 dB (agudos) e 0,03 (pico) da 1.7.8.1.
- `flows.spec.ts`: fluxos com arquivos: gravar a saída (contagem, gravar, parar e baixar o WAV), importar um som no Explorar (tem que entrar igual ao da 1.7.8.1) e gravar pelo microfone simulado e salvar em Meus sons (só no Chromium).
- `console.spec.ts`: percorre o app inteiro com som tocando e não pode aparecer nenhum erro no console.
- `data.spec.ts`: o projeto, o gênero criado e o som importado feitos na 1.7.8.1 (`fixtures/dados-1.7.8.1.json`) abrem iguais, e o backup exportado por ela (`fixtures/backup-1.7.8.1.json`) restaura igual, tanto em "Juntar" quanto em "Substituir tudo".
- `offline.spec.ts`: depois de abrir com internet, o app abre, carrega as 5 fontes e toca sem internet.

## Onde ficam as referências

- `baseline/screens/`: capturas da 1.7.8.1. Não vão para o git, porque são grandes e podem ser geradas de novo a qualquer momento com `npm run test:baseline`, já que a 1.7.8.1 está em `legacy/`.
- `baseline/levels/` e `baseline/controls/`: níveis medidos na 1.7.8.1 (um arquivo por gênero, ou por controle, e por navegador). Vão para o git.
- `fixtures/`: dados salvos de referência. Vão para o git.

## Gancho de teste `window.__gs`

Os testes enxergam o estado interno do app por `window.__gs`.
- Na 1.7.8.1, o servidor de teste (`serve.mjs`) insere o gancho de `legacy-hook.mjs` só no que envia ao navegador; o arquivo continua intocado.
- Na versão nova, o gancho existe só em desenvolvimento e teste, nunca no build final. Ele precisa oferecer exatamente esta interface:

| Função | Para quê |
|---|---|
| `version` | versão do app |
| `genres()`, `genreName(k)` | lista de gêneros |
| `state()` | tela, gênero, tocando, BPM e estado de cada linha |
| `hasPat(linha, i)` | se a linha tem padrão no slot i |
| `levels()` | valores atuais dos medidores |
| `playSlot(i)`, `stop()` | toca todas as linhas no padrão i e para |
| `measure(i, compassos)` | mede os picos tocando o padrão i (usado no teste de níveis) |
| `enterGenre(k)`, `goHome()`, `openClipEditor(linha, i)` | navegação |
| `setBpm`, `setLane`, `setUserPat`, `setScene`, `setFx`, `novoEnter`, `novoAddInst`, `novoAddLib`, `enterUgen` | montar os dados do teste de dados salvos |
| `snapshot()`, `projects()`, `ugen()`, `lib()`, `idbKeys()` | ler os dados para comparar |
| `voices()`, `audioTime()` | limpeza de vozes e relógio do áudio |
