import type { Command, CommandType, EngineEvent, EventType } from './protocol.ts';
import { LATE } from '../app/late.js';
// Porta de entrada do motor de áudio em JavaScript: a implementação de referência do protocolo
// (src/engine/protocol.ts). As telas falam com o motor só por aqui:
//   engine.send({ type: 'remix.filter', x, y, on })   manda um comando
//   engine.on('transport.state', fn)                   escuta um evento
// Os comandos são atendidos na mesma hora: no iPad, o áudio só é liberado se o pedido chegar dentro do próprio toque.
// Observação: neste motor em JavaScript, a tela e o motor ainda compartilham alguns objetos na memória (as linhas, os
// ajustes CFG e os knobs K), então alguns comandos só repetem o que a tela já gravou. Os comandos levam os dados mesmo
// assim, porque o motor em C++ vai guardar a sua própria cópia. Os efeitos já têm cópia separada (FXE).
import { ALL, AUD, CFG, K, MET, MIC, REC, RXA, UBUF, applyGain, applySolo, audStop, auditionHit, auditionNote, auditionSample, clipTap, ctx, emitClips, ensureGain, fireOneShot, fxApply, genreSting, initAudio, micPlay, micSave, micStart, micStop, noteOff, noteOn, novoBpmChanged, osVolume, previewStart, previewStop, previewVolume, recCancel, recCountIn, recFileById, recStop, routeAll, rxCap, rxDubKill, rxEff, rxEnsure, rxFilter, rxGate, rxPitch, rxTape, sampleLoad, sceneLaunch, setBpmDelay, setFilter, setLimit, setMaster, setMono, startTransport, stopAll, stopLaneSrc, stopTransport } from '../app/all.js';
// cada comando do protocolo tem o seu tratamento aqui: se faltar algum (ou sobrar algum que não existe no protocolo),
// o TypeScript acusa (npm run typecheck)
type Handlers = { [T in CommandType]: (c: Extract<Command, { type: T }>) => void };
const H: Handlers = {
  'audio.unlock': () => initAudio(),
  // Remix FX: os nós de áudio só são montados quando o painel abre ou um controle é ligado
  'remix.open': () => { initAudio(); rxEnsure(); rxCap(true) },
  'remix.close': () => rxCap(false),
  'remix.reset': () => { if (RXA.n) { rxFilter(.5, 0, false); rxDubKill(); rxGate(0, false); rxPitch(.5, false); rxTape(null, false) } },
  'remix.filter': c => { if (c.on) rxEnsure(); rxFilter(c.x, c.y, c.on) },
  'remix.echo': c => { if (c.on) rxEnsure(); rxEff(c.x, c.y, c.on, c.first) },
  'remix.gate': c => { if (c.on) rxEnsure(); rxGate(c.value, c.on) },
  'remix.pitch': c => { if (c.on) rxEnsure(); rxPitch(c.value, c.on) },
  'remix.tape': c => { if (c.on) rxEnsure(); rxTape(c.action, c.on) },
  // One Shots
  'oneshot.fire': c => { const inMs = fireOneShot(c.index, c.quantize, c.volume); emit({ type: 'oneshot.hit', index: c.index, inMs }) },
  'oneshot.volume': c => osVolume(c.value),
  // prévia da tela inicial, da biblioteca e dos gêneros do usuário
  'preview.start': c => previewStart(c),
  'preview.stop': () => previewStop(),
  'preview.volume': c => previewVolume(c.value),
  'sting.play': c => genreSting(c.genre),
  // gravação da saída
  'rec.start': () => recCountIn(),
  'rec.stop': () => recStop(),
  'rec.cancel': () => recCancel(),
  'rec.discard': () => { REC.wav = null; REC.m4a = null },
  // microfone
  'mic.start': () => micStart(),
  'mic.stop': () => micStop(),
  'mic.clear': () => { MIC.buf = null },
  'mic.save': c => micSave(c),
  'mic.play': () => micPlay(),
  'mic.stopPlay': () => { const s = AUD.src; if (AUD.token === 'rec' && s) { try { s.stop() } catch (e) {} AUD.src = null; AUD.token = null } },
  // sons do usuário
  'sample.load': c => sampleLoad(c),
  'sample.forget': c => { delete UBUF[c.id] },
  'sample.audition': c => { audStop(); auditionSample(c) },
  'sample.stopAudition': () => audStop(),
  // efeitos: a cópia do estado que é do motor
  'fx.sync': c => fxApply(c),
  'fx.set': c => fxApply(c),
  // transporte, clipes e cenas
  'transport.play': c => startTransport(c.countIn, c.at),
  'transport.stop': c => stopTransport(c.keep),
  'transport.metronome': c => { MET.on = !!c.on },
  'clip.tap': c => clipTap(c.lane, c.slot),
  'clip.stopAll': () => stopAll(),
  'clips.set': c => { const L = ALL(); for (const k in c.lanes) { const l = L.find((x: any) => x.key === k); if (l) l.active = c.lanes[k] } emitClips() },
  'clip.preview': c => { const l = ALL().find((x: any) => x.key === c.lane); if (l) l.preview = c.pattern || null }, // loop em edição toca no lugar do ativo
  'scene.launch': c => sceneLaunch(c),
  // mixer, master, andamento e ajustes
  'mixer.volume': c => { const l = laneOf(c.lane); if (l) { l.vol = c.value; applyGain(l) } },
  'mixer.mute': c => { const l = laneOf(c.lane); if (l) { l.muted = !!c.on; applyGain(l) } },
  'mixer.solo': c => { const l = laneOf(c.lane); if (l) { l.solo = !!c.on; applySolo() } },
  'master.volume': c => { K.mv = c.value; setMaster() },
  'master.filter': c => { K.fv = c.value; setFilter() },
  'master.pump': c => { K.sc = c.value },
  'transport.bpm': c => { LATE.bpm = c.bpm; setBpmDelay(); if (c.novo) novoBpmChanged() },
  'settings.set': c => { Object.assign(CFG, c.cfg); setLimit(); setMono() },
  // linhas, gênero e loops do usuário
  'lanes.sync': () => { if (ctx) { ALL().forEach(ensureGain); routeAll() } },
  'lanes.view': () => {}, // linhas na tela atual (o motor em JavaScript usa a mesma lista da tela)
  'lane.remove': c => { const l = laneOf(c.lane); if (!l) return; if (c.stopSource) stopLaneSrc(l);
    if (c.reset) { l.active = -1; l.queued = null; if (l.gain) { try { l.gain.disconnect() } catch (e) {} try { l.post && l.post.disconnect() } catch (e) {} l.gain = null } }
    else if (l.gain) { try { l.gain.disconnect() } catch (e) {} try { l.post.disconnect() } catch (e) {} } },
  'lane.stopSource': c => { const l = laneOf(c.lane); if (l) stopLaneSrc(l) },
  'genre.set': c => { LATE.style = c.genre },
  'patterns.set': () => {}, // loops do usuário (o motor em JavaScript lê a mesma memória da tela)
  // audição nos editores e notas do piano roll
  'drum.play': c => auditionHit(c.lane, c.row || 0, c.velocity),
  'note.play': c => auditionNote(c.lane, c.note, c.velocity),
  'note.on': c => noteOn(c),
  'note.off': c => noteOff(c),
};
const laneOf = (key: string) => ALL().find((x: any) => x.key === key);
const listeners = new Map<string, Set<(e: any) => void>>();
function send(cmd: Command) {
  const h = H[cmd.type] as (c: Command) => void;
  if (!h) throw new Error('G-STUDIO: o motor não conhece o comando ' + cmd.type);
  h(cmd);
}
// pedido que espera resposta: manda o comando com um código e devolve (Promise) o evento de resposta com o mesmo código
let reqN = 0;
function request(cmd: Command, replyType: EventType): Promise<any> {
  const token = 'q' + (++reqN);
  return new Promise(res => { const off = on(replyType, (e: any) => { if (e.token === token) { off(); res(e) } }); send({ ...cmd, token } as Command) });
}
// arquivos gerados pelo motor (gravações): no app nativo serão arquivos no disco
function file(id: string): Blob | null { return recFileById(id) }
function on<T extends EventType>(type: T, fn: (e: Extract<EngineEvent, { type: T }>) => void) {
  if (!listeners.has(type)) listeners.set(type, new Set());
  listeners.get(type)!.add(fn);
  return () => listeners.get(type)!.delete(fn);
}
// usado pelo código do motor para avisar as telas
function emit(evt: EngineEvent) { const s = listeners.get(evt.type); if (s) for (const fn of s) fn(evt) }
const engine = { send, on, request, file };
export { emit, engine };
