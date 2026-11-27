import { LATE } from '../app/late.js';
import { $, FX, ICON, K, NV, STYLES, VZ, bpm, cols, editMode, flash, getPat, initAudio, launchScene, makeKnob, novoBpmChanged, playing, refreshPads, scenes, screen, setBpmDelay, setFilter, setMaster, startTransport, stopTransport, updPlugLcd } from '../app/all.js';
function setBpm(v){LATE.bpm=Math.max(70,Math.min(180,Math.round(v)));$('#bpmv').textContent=bpm;setBpmDelay();if(FX.ech.el)updPlugLcd('ech');if(FX.dly.el)updPlugLcd('dly');if(screen==='novo'){NV.bpm=bpm;novoBpmChanged()}}
function setStyle(k){
  LATE.style=k;setBpm(STYLES[k].bpm);
  document.body.classList.toggle('th-art',!!STYLES[k].artist);document.body.classList.toggle('th-afro',STYLES[k].theme==='afro');document.body.classList.toggle('th-vice',STYLES[k].theme==='vice');document.body.classList.toggle('th-cumbia',STYLES[k].theme==='cumbia');VZ.sg=null;
  K.sc=STYLES[k].snd.sc!=null?STYLES[k].snd.sc:.5;if(kPump)kPump.set(K.sc);
  document.querySelectorAll('#styleSeg button').forEach(b=>b.classList.toggle('on',b.dataset.k===k));
  refreshPads();LATE.lastKey='';
}

$('#editIco').innerHTML=ICON.edit;
$('#editTog').onclick=()=>{
  LATE.editMode=!editMode;$('#editTog').classList.toggle('on',editMode);
  document.body.classList.toggle('editing',editMode);
};
$('#play').addEventListener('click',()=>{
  initAudio();
  if(playing){stopTransport(true);return}
  if(!cols.length){flash('Chama um instrumento primeiro');return}
  if(cols.some(c=>c.active>=0&&getPat(c,c.active))){startTransport();return} // volta com os loops que estavam tocando
  if(scenes[0]){launchScene(0);return}
  cols[0].active=0;startTransport();
});
$('#bm').onclick=()=>setBpm(bpm-1);
$('#bp').onclick=()=>setBpm(bpm+1);
(()=>{ // arrastar o BPM no display
  const el=$('#lcdBpm');let drag=false,sy=0,sb=0;
  el.addEventListener('pointerdown',e=>{e.preventDefault();drag=true;sy=e.clientY;sb=bpm;try{el.setPointerCapture(e.pointerId)}catch(_){}});
  el.addEventListener('pointermove',e=>{if(drag)setBpm(sb+(sy-e.clientY)/5)});
  const end=()=>{drag=false};el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
})();
var kPump=makeKnob($('#kPump'),{v:K.sc,label:'Pump',onChange:v=>{K.sc=v}});
var kFiltK=makeKnob($('#kFilt'),{v:K.fv,label:'Filtro',onChange:v=>{K.fv=v;setFilter()}});
var kMstK=makeKnob($('#kMst'),{v:K.mv,label:'Master',onChange:v=>{K.mv=v;setMaster()}});

export { kFiltK, kMstK, kPump, setBpm, setStyle };
