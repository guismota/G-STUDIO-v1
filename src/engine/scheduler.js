import { LATE } from '../app/late.js';
import { ALL, CFG, MET, NOVO, PQ, STYLES, bar, barOff, bpm, cols, ctx, emit, getPat, inVoice, initAudio, metClick, nbOf, nextTime, playCol, playing, pm2, pmN, sceneOn, screen, step, stopLaneSrc, style, timer, uiQ } from '../app/all.js';
// ---------- Relógio ----------
function applyQueues(free){
  let ch=false;
  cols.forEach(c=>{
    if(c.queued===null)return;
    const cp=c.active>=0?getPat(c,c.active):null,np=c.queued>=0?getPat(c,c.queued):null;
    const nb=Math.max(cp?nbOf(cp):1,np?nbOf(np):1);
    if(!free&&nb>1&&pmN(bar-barOff,nb)!==0)return;
    c.active=c.queued;c.queued=null;ch=true;
  });
  if(ch)emitClips();
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
  emitClips();
  emit({type:'transport.state',playing:false});
}
function clipTap(lane,pi){ // solta (ou tira) o loop no tempo certo
  initAudio();LATE.sceneOn=-1;
  const c=cols.find(x=>x.key===lane);if(!c)return;
  if(!playing){c.active=pi;c.queued=null;startTransport();emitClips();return}
  const target=c.queued!==null?c.queued:c.active;
  const nt=target===pi?-1:pi;
  c.queued=(nt===c.active)?null:nt;emitClips();
}
function stopAll(){if(!playing){LATE.sceneOn=-1;cols.forEach(c=>{c.active=-1;c.queued=null});emitClips();return}cols.forEach(c=>{c.queued=(c.active===-1)?null:-1});emitClips()}
// solta uma cena: a tela manda o slot de cada linha (-1 = desligada); quando a cena entra de fato, avisa (scene.fired)
function sceneLaunch(c){
  initAudio();LATE.sceneOn=c.index;
  const slot=l=>{const v=c.lanes[l.key];return Number.isInteger(v)?v:-1};
  if(!playing){cols.forEach(l=>{l.active=slot(l);l.queued=null});startTransport();emitClips();emit({type:'scene.fired',index:c.index});return}
  cols.forEach(l=>{const v=slot(l);l.queued=(v===l.active)?null:v});emitClips();
  const sd=60/bpm/4,tb=nextTime+qSteps()*sd,dl=Math.max(0,(tb-ctx.currentTime+(ctx.outputLatency||0))*1000);
  clearTimeout(sceneLaunch._t);sceneLaunch._t=setTimeout(()=>{if(sceneOn===c.index&&playing)emit({type:'scene.fired',index:c.index})},dl);
}
// o que está tocando e na fila em cada linha, e a cena ativa
function emitClips(){const o={};ALL().forEach(c=>{o[c.key]={active:c.active,queued:c.queued}});emit({type:'clips',scene:sceneOn,lanes:o})}


export { clipTap, emitClips, sceneLaunch, startTransport, stopAll, stopTransport };
