import { ctx, noiseBuf } from '../app/all.js';
// ----- amostras gravadas (CC0, domínio público) com síntese como reserva -----
const SMP={},SMPRAW={},SMPF={conga_hi:215.3,conga_mid:163.5,conga_lo:137.9};
const SMPN=['conga_hi','conga_mid','conga_lo','clap909','palma','hat_c','hat_o','ride','crash','letsgo','bongo_hi','bongo_lo','logdrum'];
SMPN.forEach(n=>{try{fetch('smp/'+n+'.wav').then(r=>r.ok?r.arrayBuffer():null).then(b=>{if(b){SMPRAW[n]=b;smpDecode()}}).catch(()=>{})}catch(e){}});
function smpDecode(){if(!ctx)return;for(const n in SMPRAW){const b=SMPRAW[n];delete SMPRAW[n];try{const ok=x=>{SMP[n]=x},p=ctx.decodeAudioData(b,ok,()=>{});if(p&&p.catch)p.catch(()=>{})}catch(e){}}}
function smp(n,t,o,v,rate,dur){const b=SMP[n];if(!b)return false;const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=b;if(rate)s.playbackRate.setValueAtTime(rate,t);g.gain.setValueAtTime(v,t);
  if(dur){g.gain.setValueAtTime(v,t+dur*.7);g.gain.linearRampToValueAtTime(.0001,t+dur)}s.connect(g).connect(o);s.start(t);if(dur)s.stop(t+dur+.02);return true}
function noise(t,dur){const s=ctx.createBufferSource();s.buffer=noiseBuf;s.loop=true;s.start(t,Math.random());s.stop(t+dur);return s}
const SOFT={};
function softCurve(k){if(SOFT[k])return SOFT[k];const n=1024,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(k*x)/Math.tanh(k)}return SOFT[k]=c}
function env(g,t,peak,att,dec){g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(peak,t+att);g.gain.exponentialRampToValueAtTime(.0001,t+att+dec)}

export { SMP, SMPF, env, noise, smp, smpDecode, softCurve };
