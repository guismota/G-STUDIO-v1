// Porta de entrada do motor de áudio em JavaScript: a implementação de referência do protocolo
// (src/engine/protocol.ts). As telas falam com o motor só por aqui:
//   engine.send({ type: 'remix.filter', x, y, on })   manda um comando
//   engine.on('transport.state', fn)                   escuta um evento
// Os comandos são atendidos na mesma hora: no iPad, o áudio só é liberado se o pedido chegar dentro do próprio toque.
import { RXA, fireOneShot, initAudio, osVolume, rxCap, rxDubKill, rxEff, rxEnsure, rxFilter, rxGate, rxPitch, rxTape } from '../app/all.js';
const H = {
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
};
const listeners = new Map();
function send(cmd) {
  const h = H[cmd.type];
  if (!h) throw new Error('G-STUDIO: o motor não conhece o comando ' + cmd.type);
  h(cmd);
}
function on(type, fn) {
  if (!listeners.has(type)) listeners.set(type, new Set());
  listeners.get(type).add(fn);
  return () => listeners.get(type).delete(fn);
}
// usado pelo código do motor para avisar as telas
function emit(evt) { const s = listeners.get(evt.type); if (s) for (const fn of s) fn(evt) }
const engine = { send, on };
export { engine };
