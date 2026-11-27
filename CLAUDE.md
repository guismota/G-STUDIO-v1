# G-STUDIO: regras do projeto

App de loops musicais (estilo live set). Hoje roda como PWA no iPad e no computador, publicado no GitHub Pages em https://guismota.github.io/G-STUDIO-v1/ (em uso por testadores: não pode quebrar).

## Produto e arquitetura
- O G-STUDIO é um app próprio e profissional para baixar e usar sozinho, não um plugin. Prioridade atual: Mac e iPad. Windows e tablets Android depois.
- Destino técnico: app nativo com JUCE 8, com motor de áudio, MIDI e hospedagem de plugins (AUv3, VST3, AU) em C++, e telas em HTML/CSS/JS no WebView do JUCE.
- As telas nunca acessam o áudio diretamente; tudo passa pelo protocolo de comandos e eventos em `src/engine/protocol.ts`.
- Objetivos que guiam as decisões: não travar em sessões longas, MIDI completo, plugins da comunidade no futuro e uso profissional.
- iPhone e celulares Android são incompatíveis (tela de bloqueio).

## Comunicação
- Responder em português, tom sério, sem emojis. Explicar de forma simples; o dono do projeto não é programador.
- Em caso de dúvida, perguntar antes de fazer.
- Antes de mudanças grandes de design ou de fontes, perguntar e oferecer pelo menos 3 opções para escolha.
- Antes de tarefas grandes, apresentar o plano e esperar aprovação.

## Versões e publicação
- Versões internas no formato x.y.z.w (ex.: 1.7.8.1). Cada entrega sobe o 4º número.
- Quando o 4º número passaria de 9, a versão vira x.y.(z+1) (ex.: depois de 1.7.8.9 vem 1.7.9), e essa versão é publicada no GitHub.
- Também publicar quando o dono pedir. Fora isso, só commit local.
- Nunca fazer push na `main` sem autorização.

## Conteúdo e direitos
- Nenhum nome de artista visível no app.
- Descrições dos gêneros sem nomes protegidos por direitos autorais (jogos, marcas, festas etc.).
- Samples novos só com licença que permita distribuí-los dentro de um app (CC0 ou contrato de cessão), sempre registrando a origem em `public/smp/CREDITOS.txt`.

## Design (estado atual, a preservar)
- Capas tipográficas desenhadas em canvas, com grão. O asterisco amarelo (Helvetica Bold, girado 30°) aparece só nas capas dos gêneros PRO.
- Na tela inicial, os botões +, som (prévia) e seta são redondos; os cards dos gêneros são quadrados (cantos de 6px).

## Qualidade
- Depois de mexer em sons, rodar o teste de níveis: nada pode clipar e nenhuma faixa pode ficar muda.
- Conferir no tamanho de iPad e de Mac antes de entregar.
- Rodar todos os testes antes de cada commit.

## Como rodar
- `npm run dev`: servidor de desenvolvimento (também abre no iPad pela rede Wi-Fi).
- `npm run build`: build final em `dist/` (o que vai para o site).
- `npm test`: monta o build e roda todos os testes contra a 1.7.8.1 (`legacy/`). Detalhes em `tests/README.md`.
- A versão fica só em `package.json` (`appVersion`); o build grava no app (`APPV`) e no nome do cache do service worker.

## Partes delicadas (não podem quebrar)
1. Tela de compatibilidade: o primeiro `<script>` do `index.html` é ES5 de propósito e fica inline, antes de tudo. Não pode virar módulo nem passar pelo Vite/TypeScript. Ele depende dos elementos `#onb`, `#obCompat`, `#obGo`, `#obNote` e `#welcome` já existirem no HTML acima dele.
2. Motor de áudio: agendador `tick()` com lookahead de 0,18 s e `setInterval` de 25 ms; limpeza de vozes (`inVoice` / `VB` / `voiceInit`) tem que funcionar exatamente igual; o Remix FX usa um ScriptProcessor conectado só enquanto o painel está aberto; cuidado com nomes repetidos e uso antes da inicialização.
3. Dados salvos: chaves `gstudio_*` e `looppads_*` do `localStorage` e o banco IndexedDB `gstudio` (loja `files`, com os sons importados e gravados). Nomes e formatos não mudam. Backup e restauração em .json continuam compatíveis nos dois sentidos.
4. PWA: manifest, ícones, service worker e offline, sempre com caminhos relativos (o site fica em /G-STUDIO-v1/).
5. iPad (Safari): desbloqueio do áudio no primeiro toque (o comando tem que chegar ao motor dentro do próprio toque), tela sem rolagem livre, layouts em 1180x820, 1024x768 e 1366x1024.
6. Fontes do Google Fonts (Archivo, Big Shoulders Display, Rubik Mono One, Rubik 900, Instrument Serif) e a função `monoFix`.
