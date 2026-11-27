// ---------- MIDI (ainda não implementado) ----------
// Plano: um controlador MIDI vai acionar as mesmas ações da tela (input/actions.js), por exemplo:
//   nota num teclado MIDI        -> act('note.on', nota, id, força) e act('note.off', id) no piano roll
//   grade de pads (lançar clipes) -> act('clip.pad', linha, slot) e act('scene.launch', cena)
//   botões play/stop/rec         -> act('transport.toggle'), act('rec.toggle')
//   knobs e faders (CC)           -> comandos mixer.volume, master.volume, fx.set do protocolo
// No app nativo (JUCE), o MIDI chega direto ao motor em C++, com menos atraso, e o motor avisa a tela por eventos; no
// navegador, a Web MIDI API chamaria estas mesmas ações.
