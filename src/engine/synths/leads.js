// ----- leads -----
function pluck(t,m,dur,o,v,L){
  L=L||{};dur=Math.max(dur,.1);const x=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();
  x.type=L.wave||'square';x.frequency.value=m2f(m);f.type='lowpass';f.Q.value=L.q||1;f.frequency.setValueAtTime(L.cut||4000,t);f.frequency.exponentialRampToValueAtTime(600,t+.15);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.13*v,t+.003);g.gain.exponentialRampToValueAtTime(.001,t+dur+.1);x.connect(f).connect(g).connect(o);x.start(t);x.stop(t+dur+.15)}
function leadFM(t,m,dur,o,v){
  const fq=m2f(m),car=ctx.createOscillator(),mod=ctx.createOscillator(),mg=ctx.createGain(),g=ctx.createGain(),d=Math.max(dur,.4);
  car.frequency.value=fq;mod.frequency.value=fq*3.5;mg.gain.setValueAtTime(fq*4,t);mg.gain.exponentialRampToValueAtTime(fq*.05,t+.8);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.13*v,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+d+.8);
  mod.connect(mg);mg.connect(car.frequency);car.connect(g);g.connect(o);car.start(t);mod.start(t);car.stop(t+d+.9);mod.stop(t+d+.9)}
function leadSaw(t,m,dur,o,v){
  const f=ctx.createBiquadFilter(),g=ctx.createGain(),d=Math.max(dur,.1);f.type='lowpass';f.frequency.value=3500;f.Q.value=2;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.07*v,t+.012);g.gain.setTargetAtTime(.0001,t+d,.08);
  [-14,0,14].forEach(dt=>{const x=ctx.createOscillator();x.type='sawtooth';x.frequency.value=m2f(m);x.detune.value=dt;x.connect(f);x.start(t);x.stop(t+d+.5)});
  f.connect(g).connect(o)}
function leadWhistle(t,m,dur,o,v){
  const d=Math.max(dur,.12),x=ctx.createOscillator(),l=ctx.createOscillator(),lg=ctx.createGain(),g=ctx.createGain();
  x.type='sine';x.frequency.value=m2f(m);l.frequency.value=5.5;lg.gain.value=18;l.connect(lg);lg.connect(x.detune);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.16*v,t+.03);g.gain.setTargetAtTime(.0001,t+d,.06);
  x.connect(g);g.connect(o);x.start(t);l.start(t);x.stop(t+d+.4);l.stop(t+d+.4)}
function leadSiren(t,m,dur,o,v){
  const d=Math.max(dur,.2),x=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain(),fq=m2f(m);
  x.type='sawtooth';x.frequency.setValueAtTime(fq,t);x.frequency.exponentialRampToValueAtTime(fq*2,t+d*.5);x.frequency.exponentialRampToValueAtTime(fq,t+d);
  f.type='lowpass';f.frequency.value=2600;f.Q.value=3;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.06*v,t+.02);g.gain.setTargetAtTime(.0001,t+d,.05);
  x.connect(f).connect(g).connect(o);x.start(t);x.stop(t+d+.3)}
function leadMetal(t,m,dur,o,v){ // riff metálico: FM com razão quebrada + serra filtrada
  const fq=m2f(m),d=Math.max(dur,.12),car=ctx.createOscillator(),mod=ctx.createOscillator(),mg=ctx.createGain(),g=ctx.createGain(),sw=ctx.createOscillator(),sf=ctx.createBiquadFilter(),sg=ctx.createGain();
  car.frequency.value=fq;mod.frequency.value=fq*1.41;mg.gain.setValueAtTime(fq*3.2,t);mg.gain.exponentialRampToValueAtTime(fq*.4,t+.35);mod.connect(mg);mg.connect(car.frequency);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.11*v,t+.004);g.gain.setTargetAtTime(.0001,t+d,.09);car.connect(g);
  sw.type='sawtooth';sw.frequency.value=fq;sw.detune.value=6;sf.type='lowpass';sf.Q.value=3;sf.frequency.setValueAtTime(3200,t);sf.frequency.exponentialRampToValueAtTime(900,t+.25);
  sg.gain.setValueAtTime(.0001,t);sg.gain.linearRampToValueAtTime(.045*v,t+.006);sg.gain.setTargetAtTime(.0001,t+d,.07);sw.connect(sf);sf.connect(sg);sg.connect(o);g.connect(o);
  [car,mod,sw].forEach(x=>{x.start(t);x.stop(t+d+.6)})}
function tuim(t,m,dur,o,v){ // o "tuim" do mandelão: blip agudo que cai de afinação
  v=v||1;const f=m2f(m),x=ctx.createOscillator(),x2=ctx.createOscillator(),g=ctx.createGain(),bp=ctx.createBiquadFilter(),d=Math.max(dur,.06);
  x.type='sine';x2.type='triangle';x.frequency.setValueAtTime(f*2.4,t);x.frequency.exponentialRampToValueAtTime(f,t+.045);x2.frequency.setValueAtTime(f*4.8,t);x2.frequency.exponentialRampToValueAtTime(f*2,t+.045);
  bp.type='peaking';bp.frequency.value=f*2;bp.gain.value=6;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.26*v,t+.003);g.gain.exponentialRampToValueAtTime(.0005,t+d+.09);
  const g2=ctx.createGain();g2.gain.value=.25;x.connect(g);x2.connect(g2);g2.connect(g);g.connect(bp);bp.connect(o);x.start(t);x2.start(t);x.stop(t+d+.12);x2.stop(t+d+.12)}
function bolha(t,m,dur,o,v){ // beat bolha: bolinha d'água que sobe e estoura
  v=v||1;const f=m2f(m),x=ctx.createOscillator(),y=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter(),d=Math.max(dur,.05);
  x.type='sine';y.type='sine';x.frequency.setValueAtTime(f*.55,t);x.frequency.exponentialRampToValueAtTime(f*1.04,t+.035);x.frequency.exponentialRampToValueAtTime(f,t+.09);
  y.frequency.setValueAtTime(f*.56,t+.012);y.frequency.exponentialRampToValueAtTime(f*1.05,t+.05);y.detune.value=9;
  lp.type='lowpass';lp.frequency.value=3200;lp.Q.value=4;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.2*v,t+.006);g.gain.exponentialRampToValueAtTime(.0005,t+d+.16);
  const gy=ctx.createGain();gy.gain.value=.45;x.connect(g);y.connect(gy);gy.connect(g);g.connect(lp);lp.connect(o);x.start(t);y.start(t+.012);x.stop(t+d+.2);y.stop(t+d+.2)}
function leadAgudo(t,m,dur,o,v){ // agudo da bruxaria: chiado distorcido e nervoso
  const f=m2f(m),d=Math.max(dur,.08),a=ctx.createOscillator(),b=ctx.createOscillator(),l=ctx.createOscillator(),lg=ctx.createGain(),ws=ctx.createWaveShaper(),hp=ctx.createBiquadFilter(),bp=ctx.createBiquadFilter(),g=ctx.createGain();
  a.type='square';b.type='sawtooth';a.frequency.value=f;b.frequency.value=f;a.detune.value=-22;b.detune.value=22;l.frequency.value=7;lg.gain.value=28;l.connect(lg);lg.connect(a.detune);lg.connect(b.detune);
  ws.curve=softCurve(9);hp.type='highpass';hp.frequency.value=700;bp.type='peaking';bp.frequency.value=f*2;bp.Q.value=3;bp.gain.value=8;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.045*v,t+.005);g.gain.setValueAtTime(.045*v,t+d);g.gain.exponentialRampToValueAtTime(.0001,t+d+.07);
  a.connect(ws);b.connect(ws);ws.connect(hp);hp.connect(bp);bp.connect(g);g.connect(o);[a,b,l].forEach(x=>{x.start(t);x.stop(t+d+.1)})}
// kalimba: lâmina metálica curta (fundamental + parcial inarmônico) com clique
function kalimba(t,m,dur,o,v){
  const f=m2f(m),d=Math.min(1.4,Math.max(.35,dur*3)),g=ctx.createGain(),g2=ctx.createGain(),g3=ctx.createGain();
  const x1=ctx.createOscillator(),x2=ctx.createOscillator(),x3=ctx.createOscillator();
  x1.type='sine';x1.frequency.value=f;x2.type='sine';x2.frequency.value=f*5.93;x3.type='sine';x3.frequency.value=f*2.01;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.42*v,t+.004);g.gain.exponentialRampToValueAtTime(.0008,t+d);
  g2.gain.setValueAtTime(.2*v,t);g2.gain.exponentialRampToValueAtTime(.0005,t+.12);
  g3.gain.setValueAtTime(.07*v,t);g3.gain.exponentialRampToValueAtTime(.0005,t+.4);
  x1.connect(g);x2.connect(g2);x3.connect(g3);g.connect(o);g2.connect(o);g3.connect(o);
  [x1,x2,x3].forEach(x=>{x.start(t);x.stop(t+d+.05)});
  const n=noise(t,.02),hp=ctx.createBiquadFilter(),ng=ctx.createGain();hp.type='highpass';hp.frequency.value=3000;ng.gain.setValueAtTime(.05*v,t);ng.gain.exponentialRampToValueAtTime(.0005,t+.015);n.connect(hp);hp.connect(ng);ng.connect(o);
}
// voz em coro: duas serras com formantes de "ô" e vibrato que entra devagar
function leadVox(t,m,dur,o,v){
  const f=m2f(m),d=Math.max(.12,dur),rel=.2;
  const s1=ctx.createOscillator(),s2=ctx.createOscillator();s1.type='sawtooth';s2.type='sawtooth';s1.frequency.value=f;s2.frequency.value=f;s2.detune.value=9;
  const vib=ctx.createOscillator(),vg=ctx.createGain();vib.frequency.value=5.2;vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(f*.012,t+Math.min(.35,d));vib.connect(vg);vg.connect(s1.frequency);vg.connect(s2.frequency);
  const mx=ctx.createGain();mx.gain.value=.5;s1.connect(mx);s2.connect(mx);
  const fo=ctx.createGain();
  [[420,6,1.6],[800,8,.9],[2600,10,.35],[3300,12,.15]].forEach(([fr,q,a])=>{const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=fr;bp.Q.value=q;const ga=ctx.createGain();ga.gain.value=a;mx.connect(bp);bp.connect(ga);ga.connect(fo)});
  const env=ctx.createGain();env.gain.setValueAtTime(.0001,t);env.gain.linearRampToValueAtTime(.9*v,t+.05);env.gain.setValueAtTime(.9*v,t+d);env.gain.exponentialRampToValueAtTime(.0005,t+d+rel);
  fo.connect(env);env.connect(o);
  const n=noise(t,d+rel),nb=ctx.createBiquadFilter(),ng=ctx.createGain();nb.type='bandpass';nb.frequency.value=2600;nb.Q.value=1;ng.gain.value=.03*v;n.connect(nb);nb.connect(ng);ng.connect(env);
  [s1,s2,vib].forEach(x=>{x.start(t);x.stop(t+d+rel+.05)});
}
// vocal picado de house: fonte com "pregas" (serra + pulso), vogais por formantes, consoante no ataque e um eco no tempo
const VOWELS={a:[800,1150,2900],o:[470,850,2700],e:[420,1900,2600],i:[300,2250,3000],u:[350,700,2500]};
function vocalChop(t,m,dur,o,v,shout){
  const d=Math.max(.07,Math.min(dur,1.2)),f=m2f(m),step=Math.round(t/(60/bpm/4)),vk=shout?'e':['a','o','e','a','i','o'][((step%6)+6)%6],F=VOWELS[vk],F2=shout?VOWELS.i:F;
  const s1=ctx.createOscillator(),s2=ctx.createOscillator();s1.type='sawtooth';s2.type='square';
  [s1,s2].forEach((s,j)=>{const st=shout?f*1.19:f*.94;s.frequency.setValueAtTime(st,t);s.frequency.exponentialRampToValueAtTime(f,t+.045);if(shout)s.frequency.exponentialRampToValueAtTime(f*.84,t+d);if(j)s.detune.value=6});
  const vib=ctx.createOscillator(),vg=ctx.createGain();vib.frequency.value=5.6;vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(f*.014,t+Math.min(.4,d));vib.connect(vg);vg.connect(s1.frequency);vg.connect(s2.frequency);
  const mx=ctx.createGain();mx.gain.value=.42;s1.connect(mx);const sq=ctx.createGain();sq.gain.value=.35;s2.connect(sq);sq.connect(mx);
  const fo=ctx.createGain();
  F.forEach((fr,k)=>{const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.setValueAtTime(fr,t);bp.frequency.linearRampToValueAtTime(F2[k],t+d);bp.Q.value=[7,11,13][k];const ga=ctx.createGain();ga.gain.value=[1.5,.9,.45][k];mx.connect(bp);bp.connect(ga);ga.connect(fo)});
  const air=noise(t,d+.1),ab=ctx.createBiquadFilter(),ag=ctx.createGain();ab.type='bandpass';ab.frequency.value=F[1];ab.Q.value=3;ag.gain.value=.05;air.connect(ab);ab.connect(ag);ag.connect(fo);
  const hs=ctx.createBiquadFilter();hs.type='highshelf';hs.frequency.value=2800;hs.gain.value=5;const ws=ctx.createWaveShaper();ws.curve=softCurve(1.6);
  const env=ctx.createGain(),lv=(shout?1.05:.95)*v;env.gain.setValueAtTime(.0001,t);env.gain.linearRampToValueAtTime(lv,t+.006);env.gain.setTargetAtTime(lv*.72,t+.02,.08);env.gain.setValueAtTime(lv*.7,t+d);env.gain.exponentialRampToValueAtTime(.0005,t+d+.07);
  fo.connect(hs);hs.connect(ws);ws.connect(env);env.connect(o);
  // consoante: "h"/"t" curtinho no começo
  const c=noise(t,.03),cb=ctx.createBiquadFilter(),cg=ctx.createGain();cb.type='highpass';cb.frequency.value=shout?1800:3500;cg.gain.setValueAtTime((shout?.35:.18)*v,t);cg.gain.exponentialRampToValueAtTime(.001,t+(shout?.05:.018));c.connect(cb);cb.connect(cg);cg.connect(o);
  // eco de 3/16 jogado para trás
  const dl=ctx.createDelay(1.5),fb=ctx.createGain(),dlp=ctx.createBiquadFilter(),dg=ctx.createGain();dl.delayTime.value=60/bpm*.75;fb.gain.value=.32;dlp.type='lowpass';dlp.frequency.value=3200;dg.gain.value=.3;
  env.connect(dl);dl.connect(dlp);dlp.connect(fb);fb.connect(dl);dlp.connect(dg);dg.connect(o);
  setTimeout(()=>{try{env.disconnect(dl);fb.disconnect()}catch(e){}},(t-ctx.currentTime+d+2.5)*1000);
  [s1,s2,vib].forEach(x=>{x.start(t);x.stop(t+d+.12)});
}
function lead(t,m,dur,o,v,syn,bend){
  v=v||1;const L=snd().lead,type=syn||L.type;
  if(type==='cumbia')return leadCumbia(t,m,dur,o,v,bend);
  if(type==='acordeon')return leadAcordeon(t,m,dur,o,v);
  if(type==='flauta')return leadFlauta(t,m,dur,o,v,bend);
  if(type==='vox')return leadVox(t,m,dur,o,v);
  if(type==='chop')return vocalChop(t,m,dur,o,v);
  if(type==='vchop')return vchop(t,m,dur,o,v);
  if(type==='go')return vchop(t,m,dur,o,v,'go');
  if(type==='hey')return vocalChop(t,m,dur,o,v,true);
  if(type==='fm')return leadFM(t,m,dur,o,v);
  if(type==='saw')return leadSaw(t,m,dur,o,v);
  if(type==='whistle')return leadWhistle(t,m,dur,o,v);
  if(type==='siren')return leadSiren(t,m,dur,o,v);
  if(type==='metal')return leadMetal(t,m,dur,o,v);
  if(type==='agudo')return leadAgudo(t,m,dur,o,v);
  if(type==='tuim')return tuim(t,m,dur,o,v);
  if(type==='bolha')return bolha(t,m,dur,o,v);
  return pluck(t,m,dur,o,v,type==='pluck'&&L.type!=='pluck'?{wave:'triangle',q:2,cut:3500}:L);
}
function sweep(t,dur,o){const n=noise(t,dur+.1),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='bandpass';f.Q.value=3;f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(7000,t+dur);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.25,t+dur);g.gain.linearRampToValueAtTime(.0001,t+dur+.08);n.connect(f).connect(g).connect(o)}
function metClick(t,acc){
  const x=ctx.createOscillator(),g=ctx.createGain();x.frequency.value=acc?1760:1100;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(acc?.5:.3,t+.002);g.gain.exponentialRampToValueAtTime(.0001,t+.05);
  x.connect(g);g.connect(fin);x.start(t);x.stop(t+.06)}


