// ---------- Musical Typing: o teclado do computador toca notas no piano roll (igual ao Logic) ----------
// A S D F G H J K L Ç ~ = teclas brancas; W E T Y U O P = pretas; Z X = oitava; C V = velocidade; Espaço toca; R grava
import { $, CFG, MT_CODES, RL, act, nName, typing } from '../app/all.js';
function rlKeys(e){
  if(!RL.open||!CFG.keys||typing(e)||e.metaKey||e.ctrlKey||e.altKey)return;
  if(document.querySelector('.modal.open,.xdlg.open'))return;
  const down=e.type==='keydown',i=MT_CODES.indexOf(e.code);
  if(i>=0){e.preventDefault();e.stopPropagation();if(e.repeat)return;const m=RL.base+i,id='k'+e.code;
    if(down)act('note.on',m,id,RL.vel/100);else act('note.off',id);return}
  if(!down)return;
  const k=e.code;
  if(k==='KeyZ'){e.preventDefault();e.stopPropagation();$('#rlOctDn').click();return}
  if(k==='KeyX'){e.preventDefault();e.stopPropagation();$('#rlOctUp').click();return}
  if(k==='KeyC'||k==='KeyV'){e.preventDefault();e.stopPropagation();RL.vel=Math.max(1,Math.min(127,RL.vel+(k==='KeyV'?16:-16)));const r=$('#rlMt');if(r)r.textContent='Oitava '+nName(RL.base)+' · Vel '+RL.vel;return}
  if(k==='Space'){e.preventDefault();e.stopPropagation();if(!e.repeat)$('#rlPlay').click();return}
  if(k==='KeyR'){e.preventDefault();e.stopPropagation();if(!e.repeat)$('#rlRec').click();return}
}
document.addEventListener('keydown',rlKeys,true);document.addEventListener('keyup',rlKeys,true);
