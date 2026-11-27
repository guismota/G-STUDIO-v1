import { DUBDIV, bpm, ctx, filt, out, playing, rxDiv, tT0 } from '../app/all.js';
// ---------- Remix FX: filtro de DJ, gater, downsampler, reverse/scratch/tape stop e um efeito XY à escolha ----------
const RXA={n:null,tape:null}; // nós de áudio do Remix FX (o estado da tela, como posição dos pads e da janela, fica em ui/remix.js)
function rxCurve(bits){const n=1024,c=new Float32Array(n),st=Math.pow(2,bits);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.round(x*st)/st}return c}
function rxEnsure(){
  if(!ctx||RXA.n)return;const N=RXA.n={},t=ctx.currentTime;
  N.in=ctx.createGain();N.lp=ctx.createBiquadFilter();N.lp.type='lowpass';N.lp.frequency.value=20000;N.lp.Q.value=.7;
  N.hp=ctx.createBiquadFilter();N.hp.type='highpass';N.hp.frequency.value=20;N.hp.Q.value=.7;
  N.gate=ctx.createGain();N.cDry=ctx.createGain();N.cWet=ctx.createGain();N.cWet.gain.value=0;N.pit=rxPitchNode();
  N.eIn=ctx.createGain();N.eDry=ctx.createGain();N.eWet=ctx.createGain();N.eWet.gain.value=0;N.live=ctx.createGain();N.tape=ctx.createGain();N.out=ctx.createGain();
  N.in.connect(N.lp);N.lp.connect(N.hp);N.hp.connect(N.gate);N.gate.connect(N.cDry);N.gate.connect(N.pit.input);N.pit.output.connect(N.cWet);
  N.cDry.connect(N.eIn);N.cWet.connect(N.eIn);N.eIn.connect(N.eDry);N.eDry.connect(N.live);N.eWet.connect(N.live);N.live.connect(N.out);N.tape.connect(N.out);
  try{filt.disconnect(out)}catch(e){}filt.connect(N.in);N.out.connect(out);
  // memória curta do que está tocando (para reverse, scratch e tape stop)
  const sr=ctx.sampleRate,len=Math.round(sr*4);N.rb={L:new Float32Array(len),R:new Float32Array(len),i:0,len};
  const sp=N.sp=(ctx.createScriptProcessor||ctx.createJavaScriptNode).call(ctx,2048,2,2);const z=ctx.createGain();z.gain.value=0;
  sp.onaudioprocess=e=>{const a=e.inputBuffer.getChannelData(0),b=e.inputBuffer.numberOfChannels>1?e.inputBuffer.getChannelData(1):a,rb=N.rb;for(let k=0;k<a.length;k++){rb.L[rb.i]=a[k];rb.R[rb.i]=b[k];rb.i=(rb.i+1)%rb.len}};
  N.spz=z;z.connect(ctx.destination);rxCap(true);
  rxBuildEff();
}
function rxCap(on){const N=RXA.n;if(!N||!N.sp)return;try{N.live.disconnect(N.sp)}catch(e){}try{N.sp.disconnect()}catch(e){}if(on){N.live.connect(N.sp);N.sp.connect(N.spz)}}
function rxLast(sec){const N=RXA.n,rb=N.rb,n=Math.min(rb.len,Math.max(64,Math.round(sec*ctx.sampleRate))),buf=ctx.createBuffer(2,n,ctx.sampleRate),L=buf.getChannelData(0),Rr=buf.getChannelData(1);
  let st=(rb.i-n+rb.len)%rb.len;for(let k=0;k<n;k++){L[k]=rb.L[st];Rr[k]=rb.R[st];st=(st+1)%rb.len}return buf}
// ---- filtro de DJ (pad da esquerda): esquerda = passa-baixa, direita = passa-alta, altura = ressonância
function rxFilter(x,y,on){const N=RXA.n;if(!N)return;const t=ctx.currentTime,q=.7+y*14;
  if(!on||Math.abs(x-.5)<.02){N.lp.frequency.setTargetAtTime(20000,t,.04);N.hp.frequency.setTargetAtTime(20,t,.04);N.lp.Q.setTargetAtTime(.7,t,.04);N.hp.Q.setTargetAtTime(.7,t,.04);return}
  if(x<.5){N.lp.frequency.setTargetAtTime(60*Math.pow(20000/60,x/.5),t,.02);N.lp.Q.setTargetAtTime(q,t,.02);N.hp.frequency.setTargetAtTime(20,t,.02);N.hp.Q.setTargetAtTime(.7,t,.02)}
  else{N.hp.frequency.setTargetAtTime(20*Math.pow(9000/20,(x-.5)/.5),t,.02);N.hp.Q.setTargetAtTime(q,t,.02);N.lp.frequency.setTargetAtTime(20000,t,.02);N.lp.Q.setTargetAtTime(.7,t,.02)}}
// ---- gater (slider da esquerda): corta o som no tempo
function rxGate(v,on){const N=RXA.n;if(!N)return;const t=ctx.currentTime;
  if(!on){if(N.gOsc){try{N.gOsc.stop()}catch(e){}N.gOsc.disconnect();N.gOsc=null}N.gate.gain.cancelScheduledValues(t);N.gate.gain.setTargetAtTime(1,t,.01);return null}
  const dv=rxDiv()[Math.min(3,Math.floor(v*4))],f=bpm/60*dv;
  if(!N.gOsc||N.gDv!==dv){if(N.gOsc){try{N.gOsc.stop()}catch(e){}N.gOsc.disconnect()}
    const o=ctx.createOscillator(),g=ctx.createGain(),sh=ctx.createWaveShaper();o.type='square';o.frequency.value=f;const c=new Float32Array(256);for(let i=0;i<256;i++)c[i]=i<128?-1:0;sh.curve=c;
    o.connect(sh);sh.connect(N.gate.gain);N.gate.gain.cancelScheduledValues(t);N.gate.gain.setValueAtTime(1,t);
    const per=1/f,st=playing?Math.max(t+.005,tT0+Math.ceil((t+.005-tT0)/per)*per):t+.005;o.start(st);N.gOsc=o;N.gDv=dv}
  return '1/'+(dv*4)}
// ---- downsampler (slider da direita): som de bits reduzidos
function rxPitchNode(){const sr=ctx.sampleRate,BT=.1,FT=.05,L1=Math.round(BT*sr),L2=Math.round((BT-2*FT)*sr),L=L1+L2;
  const mk=f=>{const b=ctx.createBuffer(1,L,sr),d=b.getChannelData(0);for(let i=0;i<L;i++)d[i]=i<L1?f(i):0;return b};
  const fadeL=FT*sr,fade=mk(i=>i<fadeL?Math.sqrt(i/fadeL):i>=L1-fadeL?Math.sqrt(1-(i-(L1-fadeL))/fadeL):1),down=mk(i=>i/L1),up=mk(i=>(L1-i)/L);
  const P={input:ctx.createGain(),output:ctx.createGain()},src=b=>{const s=ctx.createBufferSource();s.buffer=b;s.loop=true;return s};
  P.m=[src(down),src(down),src(up),src(up)];P.mg=P.m.map(()=>ctx.createGain());P.mg[2].gain.value=P.mg[3].gain.value=0;
  P.md=[ctx.createGain(),ctx.createGain()];P.d=[ctx.createDelay(1),ctx.createDelay(1)];P.f=[src(fade),src(fade)];P.x=[ctx.createGain(),ctx.createGain()];
  P.m.forEach((m,i)=>{m.connect(P.mg[i]);P.mg[i].connect(P.md[i%2])});P.md.forEach((g,i)=>g.connect(P.d[i].delayTime));
  P.x.forEach((x,i)=>{x.gain.value=0;P.f[i].connect(x.gain);P.input.connect(P.d[i]);P.d[i].connect(x);x.connect(P.output)});
  const t=ctx.currentTime+.05,t2=t+BT-FT;P.m[0].start(t);P.m[2].start(t);P.f[0].start(t);P.m[1].start(t2);P.m[3].start(t2);P.f[1].start(t2);
  P.set=semi=>{const r=Math.pow(2,semi/12),up=r>=1,mult=up?(r-1)/.5:(1-r)/.5,tt=ctx.currentTime;
    P.mg[0].gain.setValueAtTime(up?0:1,tt);P.mg[1].gain.setValueAtTime(up?0:1,tt);P.mg[2].gain.setValueAtTime(up?1:0,tt);P.mg[3].gain.setValueAtTime(up?1:0,tt);
    P.md.forEach(g=>g.gain.setTargetAtTime(.5*BT*Math.min(2,mult),tt,.01))};
  P.set(0);return P}
// ---- pitch (slider da direita): meio = tom original, em cima até +12, embaixo até -12 semitons
function rxPitch(v,on){const N=RXA.n;if(!N)return;const t=ctx.currentTime;
  if(!on){N.cWet.gain.setTargetAtTime(0,t,.015);N.cDry.gain.setTargetAtTime(1,t,.015);return null}
  const st=Math.round((v-.5)*24);N.pit.set(st);
  if(st===0){N.cWet.gain.setTargetAtTime(0,t,.015);N.cDry.gain.setTargetAtTime(1,t,.015)}else{N.cWet.gain.setTargetAtTime(1,t,.01);N.cDry.gain.setTargetAtTime(0,t,.01)}
  return (st>0?'+':'')+st+' st'}
// ---- efeito do pad da direita
function rxBuildEff(){const N=RXA.n;if(!N||N.eff)return;
  // eco de dub: atraso com fita (oscila de leve), filtros e saturação dentro da realimentação; tocar joga o som no eco, soltar deixa o rabo sumir
  const E={};E.in=ctx.createGain();E.send=ctx.createGain();E.send.gain.value=0;E.dl=ctx.createDelay(4);E.dl.delayTime.value=60/bpm*.75;
  E.hp=ctx.createBiquadFilter();E.hp.type='highpass';E.hp.frequency.value=260;E.lp=ctx.createBiquadFilter();E.lp.type='lowpass';E.lp.frequency.value=2600;E.lp.Q.value=.9;
  E.sat=ctx.createWaveShaper();const c=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/511.5-1;c[i]=Math.tanh(x*1.6)/Math.tanh(1.6)}E.sat.curve=c;
  E.fb=ctx.createGain();E.fb.gain.value=0;E.out=ctx.createGain();E.out.gain.value=.9;
  E.wob=ctx.createOscillator();E.wob.frequency.value=.35;E.wg=ctx.createGain();E.wg.gain.value=.0012;E.wob.connect(E.wg);E.wg.connect(E.dl.delayTime);E.wob.start();
  N.eIn.connect(E.in);E.in.connect(E.send);E.send.connect(E.dl);E.dl.connect(E.hp);E.hp.connect(E.lp);E.lp.connect(E.sat);E.sat.connect(E.fb);E.fb.connect(E.dl);E.sat.connect(E.out);E.out.connect(N.eWet);
  N.eWet.gain.value=1;N.eDry.gain.value=1;N.eff=E}
function rxDubKill(){const N=RXA.n;if(!N||!N.eff)return;const E=N.eff,t=ctx.currentTime;E.send.gain.setTargetAtTime(0,t,.01);E.fb.gain.setTargetAtTime(0,t,.03)}
function rxEff(x,y,on,first){const N=RXA.n;if(!N)return '';rxBuildEff();const E=N.eff,t=ctx.currentTime,beat=60/bpm;
  if(!on){E.send.gain.setTargetAtTime(0,t,.03);return ''}
  const i=Math.min(DUBDIV.length-1,Math.floor(x*DUBDIV.length));E.dl.delayTime.setTargetAtTime(beat*DUBDIV[i][0],t,first?.005:.12);
  const fb=.3+y*.68;E.fb.gain.setTargetAtTime(fb,t,.03);E.lp.frequency.setTargetAtTime(3400-y*1900,t,.05);E.send.gain.setTargetAtTime(1,t,.008);
  return DUBDIV[i][1]+' · '+Math.round(fb*100)+'%'}
function rxIR(sec){const sr=ctx.sampleRate,n=Math.round(sr*sec),b=ctx.createBuffer(2,n,sr);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.6)}return b}
// ---- reverse, scratch e tape stop: tocam a memória curta por cima do som ao vivo
function rxTape(a,on){const N=RXA.n;if(!N)return;const t=ctx.currentTime,beat=60/bpm;
  if(N.tsrc){const s0=N.tsrc,g0=N.tg;g0.gain.setTargetAtTime(0,t,.02);setTimeout(()=>{try{s0.stop()}catch(e){}s0.disconnect();if(N.tlfo){try{N.tlfo.stop()}catch(e){}N.tlfo=null}},120);N.tsrc=null}
  if(!on){N.live.gain.cancelScheduledValues(t);N.live.gain.setTargetAtTime(1,t,a==='stop'?.06:.015);RXA.tape=null;return}
  RXA.tape=a;const src=ctx.createBufferSource(),g=ctx.createGain();N.tsrc=src;N.tg=g;src.connect(g);g.connect(N.tape);g.gain.value=1;
  if(a==='rev'){const b=rxLast(Math.min(3.5,beat*2));for(let c=0;c<2;c++)b.getChannelData(c).reverse();src.buffer=b;src.loop=true}
  else if(a==='scr'){const ch=rxLast(beat/2),n=ch.length,b=ctx.createBuffer(2,n*2,ctx.sampleRate);for(let c=0;c<2;c++){const s=ch.getChannelData(c),d=b.getChannelData(c);d.set(s,0);for(let i=0;i<n;i++)d[n+i]=s[n-1-i]}
    src.buffer=b;src.loop=true;const l=N.tlfo=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=bpm/60*2;lg.gain.value=.55;l.connect(lg);lg.connect(src.playbackRate);src.playbackRate.value=1.05;l.start()}
  else{const D=2.2,b=rxLast(D*.5+.05);src.buffer=b;src.playbackRate.setValueAtTime(1,t);src.playbackRate.linearRampToValueAtTime(.015,t+D);g.gain.setValueAtTime(1,t+D*.82);g.gain.linearRampToValueAtTime(0,t+D+.05)}
  N.live.gain.cancelScheduledValues(t);N.live.gain.setTargetAtTime(0,t,.008);src.start(t)}
export { RXA, rxCap, rxDubKill, rxEff, rxEnsure, rxFilter, rxGate, rxPitch, rxTape };
