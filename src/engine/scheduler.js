import { LATE } from '../app/late.js';
import { ALL, CFG, MET, NOVO, PQ, STYLES, bar, barOff, bpm, cols, ctx, editMode, emit, flash, getPat, inVoice, initAudio, metClick, nbOf, nextTime, openClipEditor, playCol, playing, pm2, pmN, screen, step, stopLaneSrc, style, timer, uiQ } from '../app/all.js';
// ---------- Relógio ----------
function applyQueues(free){
  cols.forEach(c=>{
    if(c.queued===null)return;
    const cp=c.active>=0?getPat(c,c.active):null,np=c.queued>=0?getPat(c,c.queued):null;
    const nb=Math.max(cp?nbOf(cp):1,np?nbOf(np):1);
    if(!free&&nb>1&&pmN(bar-barOff,nb)!==0)return;
    c.active=c.queued;c.queued=null;
  });
}
function qHit(st,mb){const L=CFG.launch;return L==='beat'?true:L==='2bar'?(st===0&&pm2(mb)===0):st===0}
function qSteps(){const L=CFG.launch,s=step;if(L==='beat')return (4-s%4)%4;let n=(16-s)%16;if(L==='2bar'){const mb=bar-barOff+(s>0?1:0);if(pm2(mb)===1)n+=16}return n}
function tick(){
  while(nextTime<ctx.currentTime+.18){
    const sd=60/bpm/4,mb=bar-barOff;
    if((MET.on||mb<0)&&step%4===0)inVoice(metClick,null,[nextTime,step===0]);
    if(mb>=0){
      if(step%4===0&&qHit(step,mb))applyQueues(CFG.launch==='beat');
      if(step===0){if(screen==='novo')NOVO.forEach(c=>{if(c.lsrc&&c.active<0)stopLaneSrc(c,nextTime)})}
      if(step%4===0&&cols.some(c=>c.active>=0))PQ.push({t:nextTime,v:.4});
      const sw=(step%2===1&&CFG.swing)?(STYLES[style].swing||0)*sd:0;
      cols.forEach(c=>playCol(c,step,nextTime+sw));
    }
    uiQ.push({t:nextTime,s:step,b:mb});
    LATE.nextTime+=sd;LATE.step++;if(step===16){LATE.step=0;LATE.bar++}
  }
}
function startTransport(countIn,at){
  LATE.step=0;LATE.bar=0;LATE.barOff=countIn?1:0;LATE.nextTime=at&&at>ctx.currentTime+.03?at:ctx.currentTime+.06;LATE.tT0=nextTime;LATE.playing=true;ALL().forEach(c=>{c.lastM=null});
  clearInterval(timer);LATE.timer=setInterval(tick,25);tick();emit({type:'transport.state',playing:true});
}
// pausa (keep=true): para o relógio mas mantém os loops escolhidos para voltar de onde estava; sem keep, zera tudo
function stopTransport(keep){
  clearInterval(timer);LATE.playing=false;if(typeof NOVO!=='undefined'&&NOVO)NOVO.forEach(c=>stopLaneSrc(c));uiQ.length=0;PQ.length=0;LATE.cur=-1;LATE.curBar=0;
  if(keep)ALL().forEach(c=>{if(c.queued!==null){c.active=c.queued;c.queued=null}c.preview=null});
  else{LATE.sceneOn=-1;ALL().forEach(c=>{c.active=-1;c.queued=null;c.preview=null})}
  emit({type:'transport.state',playing:false});
}
function tap(ci,pi){
  initAudio();LATE.sceneOn=-1;
  const c=cols[ci];
  if(!playing){c.active=pi;c.queued=null;startTransport();return}
  const target=c.queued!==null?c.queued:c.active;
  const nt=target===pi?-1:pi;
  c.queued=(nt===c.active)?null:nt;
}
function padTap(ci,pi){
  const pat=getPat(cols[ci],pi);
  if(cols[ci].kind==='loop'&&(editMode||!pat)){flash(pat?'Loop de áudio toca inteiro':'Loops de áudio usam só o primeiro pad');return}
  if(editMode||!pat){openClipEditor(ci,pi);return}
  tap(ci,pi);
}
function stopAll(){if(!playing){LATE.sceneOn=-1;cols.forEach(c=>{c.active=-1;c.queued=null});return}cols.forEach(c=>{c.queued=(c.active===-1)?null:-1})}

export { padTap, qSteps, startTransport, stopAll, stopTransport };
