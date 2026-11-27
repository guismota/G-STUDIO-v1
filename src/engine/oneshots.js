// ---------- One Shots: os 8 sons de efeito e o disparo (na hora ou no próximo 1/16) ----------
// A janela, os nomes e as cores dos pads ficam na tela (ui/oneshots.js); aqui só o som.
import { bpm, ctx, fxHit, inVoice, initAudio, mix, noise, playing, smp, softCurve, tT0 } from '../app/all.js';
function osHorn(t,o){ // buzina de festa: três toques
  [[0,.11],[.15,.09],[.28,.55]].forEach(([d,l])=>{
    const g=ctx.createGain(),f=ctx.createBiquadFilter(),ws=ctx.createWaveShaper();f.type='bandpass';f.frequency.value=1400;f.Q.value=.7;ws.curve=softCurve(2);
    g.gain.setValueAtTime(.0001,t+d);g.gain.linearRampToValueAtTime(.16,t+d+.012);g.gain.setValueAtTime(.16,t+d+l);g.gain.exponentialRampToValueAtTime(.0001,t+d+l+.08);
    [415,554,698].forEach((fr,i)=>{const x=ctx.createOscillator();x.type='sawtooth';x.frequency.setValueAtTime(fr*1.02,t+d);x.frequency.exponentialRampToValueAtTime(fr*(d>.2?.94:1),t+d+l);x.detune.value=(i-1)*9;x.connect(ws);x.start(t+d);x.stop(t+d+l+.1)});
    ws.connect(f);f.connect(g);g.connect(o)});
}
function osSiren(t,o){ // sirene de dub
  const x=ctx.createOscillator(),l=ctx.createOscillator(),lg=ctx.createGain(),f=ctx.createBiquadFilter(),g=ctx.createGain(),d=1.8;
  x.type='square';x.frequency.value=620;l.type='triangle';l.frequency.setValueAtTime(2.5,t);l.frequency.linearRampToValueAtTime(7,t+d);lg.gain.value=320;l.connect(lg);lg.connect(x.frequency);
  f.type='lowpass';f.frequency.value=2800;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.08,t+.04);g.gain.setValueAtTime(.08,t+d-.3);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  x.connect(f);f.connect(g);g.connect(o);x.start(t);l.start(t);x.stop(t+d+.05);l.stop(t+d+.05)}
function osLaser(t,o){ // pew pew
  [0,.13].forEach(d=>{const x=ctx.createOscillator(),g=ctx.createGain();x.type='sawtooth';x.frequency.setValueAtTime(3200,t+d);x.frequency.exponentialRampToValueAtTime(120,t+d+.22);
    g.gain.setValueAtTime(.12,t+d);g.gain.exponentialRampToValueAtTime(.0001,t+d+.24);x.connect(g);g.connect(o);x.start(t+d);x.stop(t+d+.26)})}
function osRewind(t,o){ // volta a fita
  const x=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain(),n=noise(t,.95),nf=ctx.createBiquadFilter(),ng=ctx.createGain();
  x.type='sawtooth';x.frequency.setValueAtTime(180,t);x.frequency.exponentialRampToValueAtTime(1400,t+.3);x.frequency.exponentialRampToValueAtTime(60,t+.9);
  f.type='bandpass';f.frequency.setValueAtTime(600,t);f.frequency.exponentialRampToValueAtTime(3000,t+.3);f.frequency.exponentialRampToValueAtTime(200,t+.9);f.Q.value=1.5;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.14,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+.92);x.connect(f);f.connect(g);g.connect(o);x.start(t);x.stop(t+.95);
  nf.type='highpass';nf.frequency.value=2500;ng.gain.setValueAtTime(.08,t);ng.gain.exponentialRampToValueAtTime(.0001,t+.9);n.connect(nf);nf.connect(ng);ng.connect(o)}
function osHey(t,o){ // grito "hey" de galera
  const sum=ctx.createGain(),g=ctx.createGain(),d=.32;
  [[600,500,.9,7],[1800,2200,.5,9],[2600,2900,.25,10]].forEach(([a,b,gn,q])=>{const bp=ctx.createBiquadFilter(),bg=ctx.createGain();bp.type='bandpass';bp.Q.value=q;bp.frequency.setValueAtTime(a,t);bp.frequency.linearRampToValueAtTime(b,t+d);bg.gain.value=gn*3;sum.connect(bp);bp.connect(bg);bg.connect(g)});
  [0,1,2,3].forEach(i=>{const x=ctx.createOscillator(),f0=[205,230,190,260][i];x.type='sawtooth';x.frequency.setValueAtTime(f0,t+i*.008);x.frequency.linearRampToValueAtTime(f0*.82,t+d);x.connect(sum);x.start(t+i*.008);x.stop(t+d+.05)});
  const h=noise(t,.06),hf=ctx.createBiquadFilter(),hg=ctx.createGain();hf.type='highpass';hf.frequency.value=1800;hg.gain.setValueAtTime(.15,t);hg.gain.exponentialRampToValueAtTime(.0001,t+.06);h.connect(hf);hf.connect(hg);hg.connect(o);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.18,t+.03);g.gain.setValueAtTime(.18,t+d-.1);g.gain.exponentialRampToValueAtTime(.0001,t+d);g.connect(o)}
function osCrash(t,o){
  const n=noise(t,2.4),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='highpass';f.frequency.value=4200;g.gain.setValueAtTime(.32,t);g.gain.exponentialRampToValueAtTime(.0001,t+2.3);n.connect(f);f.connect(g);g.connect(o);
  const mf=ctx.createBiquadFilter(),mg=ctx.createGain();mf.type='highpass';mf.frequency.value=6000;mg.gain.setValueAtTime(.05,t);mg.gain.exponentialRampToValueAtTime(.0001,t+1.4);
  [340,515,733,1012].forEach(fr=>{const x=ctx.createOscillator();x.type='square';x.frequency.value=fr;x.connect(mf);x.start(t);x.stop(t+1.5)});mf.connect(mg);mg.connect(o)}
const OSFX=[osHorn,osSiren,osLaser,(t,o)=>fxHit(t,3,2,o,1),
 osRewind,(t,o)=>{if(!smp('letsgo',t,o,1))osHey(t,o)},(t,o)=>fxHit(t,1,60/bpm*4,o,1),(t,o)=>{if(!smp('crash',t,o,.8))osCrash(t,o)}];
const OSA={g:null}; // saída dos One Shots, direto na mesa
function osOut(vol){if(!OSA.g){OSA.g=ctx.createGain();OSA.g.connect(mix)}OSA.g.gain.value=vol*1.2;return OSA.g}
function osVolume(vol){if(OSA.g)OSA.g.gain.value=vol*1.2}
// dispara o som i; devolve em quantos ms ele entra (para a tela piscar o pad na hora certa)
function fireOneShot(i,q,vol){
  initAudio();const now=ctx.currentTime;let t=now+.005;
  if(q&&playing){const sd=60/bpm/4,n=Math.ceil((now+.01-tT0)/sd);t=Math.max(t,tT0+n*sd)} // espera o próximo 1/16
  const oo=osOut(vol);inVoice(OSFX[i],null,[t,oo]);
  return Math.max(0,(t-now)*1000);
}
export { fireOneShot, osVolume };
