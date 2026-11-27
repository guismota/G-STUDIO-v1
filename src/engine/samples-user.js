// ---------- sons do usuário e amostras no motor: decodificar, guardar em memória e tocar ----------
// (os arquivos ficam no IndexedDB; a lista da biblioteca fica na tela, em state/library.js)
import { SMP, bpm, ctx, emit, idbGet, out } from '../app/all.js';
var UBUF={},UPEND={};
let OAC=null; // contexto só para decodificar antes de o áudio ser liberado
// ---------- buffers ----------
function decodeAB(ab){return new Promise((res,rej)=>{
  const c=ctx||(OAC=OAC||new (window.OfflineAudioContext||window.webkitOfflineAudioContext)(1,1,44100));
  try{const p=c.decodeAudioData(ab,res,e=>rej(e||new Error('decode')));if(p&&p.catch)p.catch(rej)}catch(e){rej(e)}})}
function getBuf(id){if(!id)return null;if(id.startsWith('c:'))return SMP[id.slice(2)]||null;if(UBUF[id])return UBUF[id];loadBuf(id);return null}
function loadBuf(id){
  if(!id||!id.startsWith('u:')||UBUF[id]||UPEND[id])return UPEND[id]||Promise.resolve(UBUF[id]||null);
  return UPEND[id]=idbGet(id).then(ab=>ab?decodeAB(ab.slice(0)):null).then(b=>{if(b)UBUF[id]=b;delete UPEND[id];return b}).catch(()=>{delete UPEND[id];return null});
}
// ---------- tocar lanes de amostra no Criar novo ----------
function smpHit(c,t,o,v){const b=getBuf(c.smp);if(!b)return;
  if(c.hsrc){try{c.hsrcG.gain.setTargetAtTime(0,t,.008);c.hsrc.stop(t+.06)}catch(e){}}
  const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=b;g.gain.value=.9*(v||1);s.connect(g);g.connect(o);s.start(t);c.hsrc=s;c.hsrcG=g}
function loopStep(c,t){
  if(c.lsrc&&t<c.lend-.03)return;
  const b=getBuf(c.smp);if(!b)return;
  const rate=bpm/(c.lbpm||bpm),len=(c.bars||1)*240/bpm;
  const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=b;s.playbackRate.value=rate;g.gain.value=.9;s.connect(g);g.connect(c.gain);
  s.start(t);s.stop(t+len+.02);c.lsrc=s;c.lsrcG=g;c.lend=t+len;c.lrate=rate;
}
function stopLaneSrc(c,at){const t=at||(ctx?ctx.currentTime:0);
  if(c.lsrc){try{c.lsrcG.gain.setTargetAtTime(0,t,.01);c.lsrc.stop(t+.08)}catch(e){}c.lsrc=null;c.lend=0}
  if(c.hsrc&&!at){try{c.hsrc.stop(t+.02)}catch(e){}c.hsrc=null}}
// audição na biblioteca (som gravado, importado ou a gravação do microfone): uma de cada vez
const AUD={src:null,g:null,tm:0,token:null};
function audStop(){const a=AUD;if(!a.src)return;clearTimeout(a.tm);try{a.g.gain.setTargetAtTime(0,ctx.currentTime,.02);a.src.stop(ctx.currentTime+.1)}catch(e){}AUD.src=null;AUD.token=null}
function auditionSample(c){
  const go=b=>{if(!b){emit({type:'sample.audition',token:c.token,ok:false});return}
    const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=b;g.gain.value=.9;s.connect(g);g.connect(out);
    if(c.kind==='loop'){s.loop=true;s.loopEnd=b.duration}
    const t=ctx.currentTime+.02;s.start(t);const lim=c.kind==='loop'?Math.min(16,Math.max(b.duration*2,4)):Math.min(b.duration+.05,12);s.stop(t+lim);
    AUD.src=s;AUD.g=g;AUD.token=c.token;AUD.tm=setTimeout(()=>{if(AUD.src===s){AUD.src=null;emit({type:'sample.auditionEnded',token:c.token})}},lim*1000+80)};
  const b=getBuf(c.id);if(b)go(b);else loadBuf(c.id).then(go);
}
// prepara um som que a tela acabou de guardar (importar): devolve se abriu e a duração
function sampleLoad(c){loadBuf(c.id).then(b=>emit({type:'sample.loaded',token:c.token,id:c.id,ok:!!b,duration:b?b.duration:0}))}
export { AUD, UBUF, audStop, auditionSample, loadBuf, loopStep, sampleLoad, smpHit, stopLaneSrc };
