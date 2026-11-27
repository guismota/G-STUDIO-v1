// ---------- Entrada de controles: as ações do usuário ----------
// Toques nos pads e nas cenas, botões principais, atalhos de teclado, o Musical Typing do piano roll e, no futuro, MIDI
// (veja input/midi.js) chamam estas ações; elas geram os comandos do protocolo (engine.send) ou abrem telas. Assim, um
// controlador MIDI vai disparar exatamente o mesmo que um toque na tela.
import { $, RL, RX, bpm, closeRmx, cols, doRedo, doUndo, editMode, engine, flash, getPat, launchScene, openCfg, openKb, openProjList, openProjSave, openRmx, openSceneEditor, padTap, playing, rlNoteOff, rlNoteOn, scenes, setBpm } from '../app/all.js';
const ACT={
  // transporte e clipes
  'transport.toggle':()=>{ // botão tocar/parar e barra de espaço
  engine.send({type:'audio.unlock'});
  if(playing){engine.send({type:'transport.stop',keep:true});return}
  if(!cols.length){flash('Chama um instrumento primeiro');return}
  if(cols.some(c=>c.active>=0&&getPat(c,c.active))){engine.send({type:'transport.play'});return} // volta com os loops que estavam tocando
  if(scenes[0]){launchScene(0);return}
  engine.send({type:'clips.set',lanes:{[cols[0].key]:0}});engine.send({type:'transport.play'});
  },
  'clip.pad':(ci,pi)=>padTap(ci,pi), // toque num pad: no modo editar (ou pad vazio) abre o editor; senão solta o loop
  'clip.stopAll':()=>engine.send({type:'clip.stopAll'}),
  // atalho 0: "clica" no botão Parar. Na 1.7.8.1 isso não faz nada, porque o botão só reage ao toque (achado registrado,
  // não corrigido)
  'clip.stopAllKey':()=>{const s=$('#stopall');if(s)s.click();else engine.send({type:'clip.stopAll'})},
  'scene.pad':i=>{if(editMode||!scenes[i])openSceneEditor(i);else launchScene(i)}, // toque no botão da cena
  'scene.launch':i=>launchScene(i),
  'bpm.nudge':d=>setBpm(bpm+d),
  // linhas: mute e solo da linha escolhida (os mesmos botões da tela)
  'lane.solo':li=>{const c=cols[li];if(c&&c.padEls&&c.padEls[0]){const sb=c.padEls[0].parentElement.querySelector('.solo');if(sb)sb.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));return true}},
  'lane.mute':li=>{const c=cols[li];if(c&&c.padEls&&c.padEls[0]){const mb=c.padEls[0].parentElement.querySelector('.mute');if(mb)mb.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));return true}},
  // notas ao vivo no piano roll (teclado da tela, Musical Typing e, no futuro, teclado MIDI)
  'note.on':(m,id,v)=>{if(!RL.keys[id]){engine.send({type:'audio.unlock'});rlNoteOn(m,id,v)}},
  'note.off':id=>rlNoteOff(id),
  // botões e telas
  'rec.toggle':()=>$('#recBtn').click(),
  'edit.toggle':()=>$('#editTog').click(),
  'remix.toggle':()=>RX.open?closeRmx():openRmx(),
  'home':()=>$('#homeBtn').click(),
  'home.hero':()=>{const g=$('#hero .hgo');if(g)g.click()},
  'home.preview':()=>{const p=$('#hero .hprev');if(p)p.click()},
  'home.channel':n=>{const t=document.querySelector('.htile[data-ch="CH0'+n+'"]');if(t){t.click();return true}},
  'home.new':()=>$('#hxNew').click(),
  'home.explore':()=>$('#expOpen').click(),
  'app.settings':()=>openCfg(),
  'app.shortcuts':()=>openKb(),
  'projects.open':()=>openProjList(),
  'project.save':()=>openProjSave(),
  'undo':()=>doUndo(),
  'redo':()=>doRedo(),
};
function act(name,...args){const f=ACT[name];if(!f)throw new Error('G-STUDIO: ação desconhecida '+name);return f(...args)}
export { act };
