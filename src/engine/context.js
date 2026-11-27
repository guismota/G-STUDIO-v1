// ---------- Áudio ----------
function initAudio(){
  if(ctx){ctx.resume&&ctx.resume();return}
  ctx=new (window.AudioContext||window.webkitAudioContext)();voiceInit();
  const comp=CMP=ctx.createDynamicsCompressor();comp.threshold.value=-10;comp.knee.value=6;comp.ratio.value=20;comp.attack.value=.002;comp.release.value=.15;fin=ctx.createGain();fin.gain.value=.9;comp.connect(fin);fin.connect(ctx.destination);setupMeters();
  out=ctx.createGain();out.gain.value=K.mv;out.connect(CFG.limit?comp:fin);setMono();
  filt=ctx.createBiquadFilter();filt.type='lowpass';filt.Q.value=3;setFilter();
  mix=ctx.createGain();MA.sum=ctx.createGain();MA.sum.connect(filt);filt.connect(out);
  duck=ctx.createGain();duck.connect(mix);
  buildFxAudio();buildMaster();
  ALL().forEach(ensureGain);
  smpDecode();
  noiseBuf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);
  const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  ctx.resume&&ctx.resume();
  const b=ctx.createBuffer(1,1,22050),s=ctx.createBufferSource();s.buffer=b;s.connect(ctx.destination);s.start(0);
}
