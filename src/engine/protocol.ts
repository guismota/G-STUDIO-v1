// Protocolo entre as telas e o motor de áudio do G-STUDIO.
//
// As telas nunca mexem no áudio diretamente: só mandam COMANDOS ao motor e recebem EVENTOS dele. Tudo é JSON simples,
// porque este mesmo protocolo vai ligar as telas (HTML/CSS/JS no WebView do JUCE) ao motor em C++. O motor em
// JavaScript (src/engine/) é a implementação de referência; os testes de níveis vão comparar o motor em C++ com ele.
//
// Regras:
//  - comando: { type: 'area.acao', ...dados } — não devolve resposta; o que a tela precisa saber chega por evento;
//  - evento: { type: 'area.acao', ...dados };
//  - linhas são identificadas pela chave (lane: 'kick', 'bass', 'n3'...), padrões pelo slot (0 a 3: do gênero; 4 a 7: do usuário);
//  - valores contínuos (volume, posição nos pads) vão de 0 a 1;
//  - sons e gravações não viajam dentro do JSON: vão por um código (id) e o arquivo é lido pelo outro lado
//    (engine.file(id) devolve um arquivo gerado pelo motor, como a gravação; no app nativo será um arquivo no disco);
//  - pedido que espera resposta leva um código (token) e a resposta chega num evento com o mesmo token
//    (engine.request(comando, tipoDaResposta) faz isso e devolve a resposta).
// Para mudar o protocolo: acrescente aqui, suba PROTOCOL_VERSION e implemente nos dois lados.

export const PROTOCOL_VERSION = 1;

export type LaneKey = string;
export type Slot = number;

// ---------------------------------------------------------------- comandos (tela -> motor)
export type Command =
  // áudio: o primeiro toque do usuário libera o áudio (no iPad, precisa chegar ao motor dentro do próprio toque)
  | { type: 'audio.unlock' }
  // transporte
  | { type: 'transport.play'; countIn?: boolean; at?: number }
  | { type: 'transport.stop'; keep?: boolean } // keep: pausa mantendo os loops escolhidos para voltar de onde estava
  | { type: 'transport.toggle' } // botão tocar/parar (volta com os loops que estavam tocando, ou solta a cena 1)
  | { type: 'transport.bpm'; bpm: number }
  | { type: 'transport.metronome'; on: boolean }
  // clipes e cenas
  | { type: 'clip.tap'; lane: LaneKey; slot: Slot } // solta (ou tira) o loop no tempo certo
  | { type: 'clip.stopAll' } // parar tudo no fim do compasso
  | { type: 'scene.launch'; index: number }
  // mixer
  | { type: 'mixer.volume'; lane: LaneKey; value: number }
  | { type: 'mixer.mute'; lane: LaneKey; on: boolean }
  | { type: 'mixer.solo'; lane: LaneKey; on: boolean }
  | { type: 'master.volume'; value: number }
  | { type: 'master.pump'; value: number } // sidechain: quanto o resto abaixa a cada kick
  // efeitos de linha e da master (reverb, delay, echo, distorção, filtro)
  | { type: 'fx.set'; fx: 'rev' | 'dly' | 'ech' | 'dst' | 'flt'; on?: boolean; style?: number; params?: Record<string, number>; links?: LaneKey[]; master?: boolean; mode?: 'knob' | 'xpad' }
  | { type: 'fx.refresh' } // reaplica todos os efeitos (depois de abrir projeto, desfazer etc.)
  // Remix FX (só ligado enquanto o painel está aberto)
  | { type: 'remix.open' }
  | { type: 'remix.close' }
  | { type: 'remix.filter'; x: number; y: number; on: boolean } // pad da esquerda: x<0,5 passa-baixa, x>0,5 passa-alta, y ressonância
  | { type: 'remix.gate'; value: number; on: boolean } // slider da esquerda: corte no tempo (1/4 a 1/32)
  | { type: 'remix.pitch'; value: number; on: boolean } // slider da direita: -12 a +12 semitons (0,5 = tom original)
  | { type: 'remix.echo'; x: number; y: number; on: boolean; first?: boolean } // pad da direita: dub echo (x tempo, y feedback)
  | { type: 'remix.reset' } // zera tudo (ao fechar o painel ou no botão de zerar)
  | { type: 'remix.tape'; action: 'rev' | 'scr' | 'stop' | null; on: boolean } // reverse, scratch e tape stop
  // sons avulsos
  | { type: 'oneshot.fire'; index: number; quantize?: boolean; volume: number } // quantize: espera o próximo 1/16 se estiver tocando
  | { type: 'oneshot.volume'; value: number }
  | { type: 'note.play'; lane: LaneKey; note: number; velocity?: number; duration?: number } // audição e Musical Typing
  | { type: 'drum.play'; lane: LaneKey; row?: number; velocity?: number } // audição no sequenciador
  // prévia da tela inicial e som de entrada no canal
  // id: quem pediu (volta no evento preview.state); plan: o que toca em cada compasso ({linha: slot}); lanes: linhas de
  // um gênero criado pelo usuário (def = como foi salvo, pats = os 4 loops, mix = volume e mute)
  | { type: 'preview.start'; id: string; genre: string; plan?: Record<LaneKey, Slot>[]; bars?: number; end?: boolean; volume?: number; bpm?: number;
      lanes?: { def: Record<string, unknown>; nvk: { root: number; mode: string; auto: boolean }; pats: unknown[]; mix: { vol: number; muted: boolean } | null }[] }
  | { type: 'preview.stop' }
  | { type: 'preview.volume'; value: number } // volume das prévias (Ajustes)
  | { type: 'sting.play'; genre: string } // som ao entrar num canal (desligado hoje)
  // gravação da saída (com contagem de 3 tempos)
  | { type: 'rec.start' }
  | { type: 'rec.stop' }
  | { type: 'rec.cancel' } // durante a contagem
  | { type: 'rec.discard' }
  // microfone (Explorar > Gravar)
  | { type: 'mic.start' }
  | { type: 'mic.stop' }
  | { type: 'mic.clear' }
  | { type: 'mic.save'; id: string; token?: string } // resposta: mic.saved
  | { type: 'mic.play' }
  | { type: 'mic.stopPlay' }
  // sons do usuário (o arquivo fica guardado com esse id; o motor abre, prepara e toca)
  | { type: 'sample.load'; id: string; token?: string } // resposta: sample.loaded
  | { type: 'sample.forget'; id: string }
  | { type: 'sample.audition'; id: string; kind: string; token: string }
  | { type: 'sample.stopAudition' };

// ---------------------------------------------------------------- eventos (motor -> tela)
export type EngineEvent =
  | { type: 'transport.state'; playing: boolean }
  | { type: 'transport.step'; bar: number; step: number } // quando o som chega na caixa (para o visor e as luzes)
  | { type: 'clips'; lanes: Record<LaneKey, { active: Slot; queued: Slot | null }> }
  | { type: 'scene.fired'; index: number } // a cena entrou de fato (para a animação)
  | { type: 'oneshot.hit'; index: number; inMs: number } // daqui a quanto o som do One Shot entra (para piscar o pad)
  | { type: 'meters'; master: [number, number]; clip: boolean; lanes: Record<LaneKey, number>; spectrum: number[] }
  | { type: 'preview.state'; id: string; playing: boolean } // a prévia pedida com esse id terminou sozinha
  | { type: 'rec.state'; on: boolean; count: number; t0: number } // count: contagem antes de gravar (3, 2, 1; 0 = gravando)
  | { type: 'rec.done'; seconds: number; mime: string; wav: { id: string; size: number } | null; m4a: { id: string; size: number } | null }
  | { type: 'mic.state'; on: boolean }
  | { type: 'mic.level'; value: number; t0: number }
  | { type: 'mic.done'; ok: boolean; seconds?: number } // ok=false: não captou som
  | { type: 'mic.saved'; token: string; ok: boolean; duration?: number; size?: number }
  | { type: 'sample.loaded'; token: string; id: string; ok: boolean; duration: number }
  | { type: 'sample.audition'; token: string; ok: false } // o som não está disponível
  | { type: 'sample.auditionEnded'; token: string }
  | { type: 'notice'; text: string; kind?: 'toast' }; // aviso para o usuário (kind toast: balão da biblioteca)

export type CommandType = Command['type'];
export type EventType = EngineEvent['type'];
