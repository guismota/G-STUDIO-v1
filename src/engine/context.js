import { LATE } from '../app/late.js';
import { ALL, CFG, K, MA, buildFxAudio, buildMaster, ctx, duck, ensureGain, filt, fin, mix, noiseBuf, out, setFilter, setMono, setupMeters, smpDecode, voiceInit } from '../app/all.js';
// ---------- Áudio ----------
function initAudio(){
  if(ctx){ctx.resume&&ctx.resume();return}
  LATE.ctx=new (window.AudioContext||window.webkitAudioContext)();voiceInit();
  const comp=LATE.CMP=ctx.createDynamicsCompressor();comp.threshold.value=-10;comp.knee.value=6;comp.ratio.value=20;comp.attack.value=.002;comp.release.value=.15;LATE.fin=ctx.createGain();fin.gain.value=.9;comp.connect(fin);fin.connect(ctx.destination);setupMeters();
  LATE.out=ctx.createGain();out.gain.value=K.mv;out.connect(CFG.limit?comp:fin);setMono();
  LATE.filt=ctx.createBiquadFilter();filt.type='lowpass';filt.Q.value=3;setFilter();
  LATE.mix=ctx.createGain();MA.sum=ctx.createGain();MA.sum.connect(filt);filt.connect(out);
  LATE.duck=ctx.createGain();duck.connect(mix);
  buildFxAudio();buildMaster();
  ALL().forEach(ensureGain);
  smpDecode();
  LATE.noiseBuf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);
  const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  ctx.resume&&ctx.resume();
  const b=ctx.createBuffer(1,1,22050),s=ctx.createBufferSource();s.buffer=b;s.connect(ctx.destination);s.start(0);
}
export { initAudio };
