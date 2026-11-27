// ---------- Gravação: botão REC e janela para salvar (a captura do som fica no motor: engine/recorder.js) ----------
import { $, CFG, STYLES, closeModal, curProj, engine, flash, fmtDate, style, two, xToast } from '../app/all.js';
const RECU={on:false,cnt:0,t0:0,uiT:null,done:null}; // espelho do que o motor avisa
const recWav=()=>RECU.done&&RECU.done.wav?engine.file(RECU.done.wav.id):null;
const recM4a=()=>RECU.done&&RECU.done.m4a?engine.file(RECU.done.m4a.id):null;
engine.on('rec.state',e=>{const was=RECU.on;RECU.on=e.on;RECU.cnt=e.count;RECU.t0=e.t0;updRecUI();
  if(e.on&&!was){clearInterval(RECU.uiT);RECU.uiT=setInterval(updRecUI,250)}else if(!e.on)clearInterval(RECU.uiT)});
engine.on('rec.done',e=>{RECU.done=e;openRecDone()});
// avisos do motor: balão da biblioteca (kind toast) ou o aviso normal do app
engine.on('notice',e=>{if(e.kind==='toast')xToast(e.text);else flash(e.text)});
const fmtT=s=>Math.floor(s/60)+':'+two(Math.floor(s%60));
function updRecUI(){
  const b=$('#recBtn');b.classList.toggle('rec',RECU.on&&!RECU.cnt);b.classList.toggle('cnt',!!RECU.cnt);
  b.querySelector('.rtime').textContent=RECU.cnt?String(RECU.cnt):RECU.on?fmtT(Math.max(0,performance.now()-RECU.t0)/1000):'Rec';
}
const recPref=()=>CFG.rec==='wav'?(recWav()||recM4a()):(recM4a()||recWav());
const recExt=()=>(RECU.done&&RECU.done.mime||'').includes('webm')?'webm':'m4a';
const recFile=(blob,ext)=>new File([blob],(($('#rdName').value||'G-STUDIO').trim().replace(/[\\/:*?"<>|]+/g,'-')||'G-STUDIO')+'.'+ext,{type:blob.type});
function dl(blob,ext){const f=recFile(blob,ext),u=URL.createObjectURL(f),a=document.createElement('a');a.href=u;a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000)}
function openRecDone(){
  const REC={wav:recWav(),m4a:recM4a()};
  if(!REC.wav&&!REC.m4a){flash('Nada gravado');return}
  const secs=RECU.done.seconds,mb=x=>(x.size/1048576).toFixed(1)+' MB';
  $('#rdName').value='G-STUDIO '+(curProj()?curProj().name:STYLES[style].name)+' '+fmtDate(Date.now()).replace(/[/:]/g,'-');
  $('#rdInfo').textContent=fmtT(secs)+(REC.wav?' · WAV '+mb(REC.wav):'')+(REC.m4a?' · '+recExt().toUpperCase()+' '+mb(REC.m4a):'');
  $('#rdM4a').style.display=REC.m4a?'':'none';$('#rdM4a').textContent='Baixar '+recExt().toUpperCase();
  $('#rdWav').style.display=REC.wav?'':'none';
  const sh=recPref(),canSh=!!(navigator.canShare&&sh&&navigator.canShare({files:[recFile(sh,sh===REC.m4a?recExt():'wav')]}));
  $('#rdShare').style.display=canSh?'':'none';
  $('#recDone').classList.add('open');
}
$('#recBtn').onclick=()=>engine.send({type:RECU.cnt?'rec.cancel':RECU.on?'rec.stop':'rec.start'});
$('#rdWav').onclick=()=>{if(recWav())dl(recWav(),'wav')};
$('#rdM4a').onclick=()=>{if(recM4a())dl(recM4a(),recExt())};
$('#rdShare').onclick=async()=>{const b=recPref(),f=recFile(b,b===recM4a()?recExt():'wav');try{await navigator.share({files:[f],title:f.name})}catch(e){}};
$('#rdClose').onclick=()=>closeModal('recDone');
$('#rdDiscard').onclick=()=>{engine.send({type:'rec.discard'});RECU.done=null;closeModal('recDone');flash('Gravação descartada')};

export { RECU };
