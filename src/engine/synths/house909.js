// ----- bateria estilo 909 (house e acid) -----
function kick909(t,o,v,K){
  const x=ctx.createOscillator(),g=ctx.createGain(),ws=ctx.createWaveShaper(),gg=ctx.createGain(),f1=K.f1||50;
  x.type='sine';x.frequency.setValueAtTime(K.f0||235,t);x.frequency.exponentialRampToValueAtTime(f1*1.7,t+.014);x.frequency.exponentialRampToValueAtTime(f1,t+(K.sweep||.09));
  g.gain.setValueAtTime(v,t);g.gain.setTargetAtTime(.0001,t+.03,(K.dec||.45)/3.6);
  ws.curve=softCurve(K.drive||1.7);gg.gain.value=.92;x.connect(g);g.connect(ws);ws.connect(gg);gg.connect(o);x.start(t);x.stop(t+(K.dec||.45)*1.5+.05);
  const cl=K.click==null?.7:K.click;
  if(cl){const n=noise(t,.012),hp=ctx.createBiquadFilter(),ng=ctx.createGain();hp.type='highpass';hp.frequency.value=3200;ng.gain.setValueAtTime(.55*cl*v,t);ng.gain.exponentialRampToValueAtTime(.001,t+.007);n.connect(hp).connect(ng).connect(o);
    const k=ctx.createOscillator(),kg=ctx.createGain();k.type='triangle';k.frequency.setValueAtTime(1900,t);k.frequency.exponentialRampToValueAtTime(600,t+.006);kg.gain.setValueAtTime(.3*cl*v,t);kg.gain.exponentialRampToValueAtTime(.001,t+.008);k.connect(kg).connect(o);k.start(t);k.stop(t+.012)}
}
function metal909(t,o,dur,lv,tune,bp,hp,crush){
  const f=ctx.createBiquadFilter(),h=ctx.createBiquadFilter(),g=ctx.createGain(),pre=ctx.createGain();f.type='bandpass';f.frequency.value=bp;f.Q.value=.7;h.type='highpass';h.frequency.value=hp;pre.gain.value=.5;
  [205.3,304.4,369.6,522.7,540,800].forEach(fr=>{const x=ctx.createOscillator();x.type='square';x.frequency.value=fr*tune;x.connect(pre);x.start(t);x.stop(t+dur+.05)});
  if(crush){const ws=ctx.createWaveShaper();ws.curve=crushCurve();pre.connect(ws);ws.connect(f)}else pre.connect(f);
  f.connect(h);h.connect(g);g.connect(o);return g;
}
function hat909(t,o,open,v,H){
  const dec=open?(H.odec||.32):(H.dec||.05),g=metal909(t,o,dec,1,H.tune||1.55,10500,7200,true);
  g.gain.setValueAtTime((open?.42:.5)*v,t);if(open){g.gain.setValueAtTime(.32*v,t+.012);g.gain.exponentialRampToValueAtTime(.0008,t+dec)}else g.gain.exponentialRampToValueAtTime(.0008,t+dec);
  const n=noise(t,dec+.03),hp=ctx.createBiquadFilter(),ng=ctx.createGain();hp.type='highpass';hp.frequency.value=8000;ng.gain.setValueAtTime((open?.16:.2)*v,t);ng.gain.exponentialRampToValueAtTime(.0008,t+dec*.8);n.connect(hp).connect(ng).connect(o);
}
function ride909(t,o,v){
  const dur=1.1,g=metal909(t,o,dur,1,2.35,8200,5200,true);
  g.gain.setValueAtTime(.3*v,t);g.gain.exponentialRampToValueAtTime(.13*v,t+.05);g.gain.exponentialRampToValueAtTime(.0005,t+dur);
  const p=ctx.createOscillator(),pg=ctx.createGain();p.type='triangle';p.frequency.value=4150;pg.gain.setValueAtTime(.06*v,t);pg.gain.exponentialRampToValueAtTime(.0005,t+.35);p.connect(pg).connect(o);p.start(t);p.stop(t+.4);
}
function rim909(t,o,v){
  [[500,.35],[1720,.22]].forEach(([fr,a])=>{const x=ctx.createOscillator(),g=ctx.createGain();x.type='triangle';x.frequency.value=fr;g.gain.setValueAtTime(a*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.028);x.connect(g).connect(o);x.start(t);x.stop(t+.04)});
  const n=noise(t,.02),hp=ctx.createBiquadFilter(),g=ctx.createGain();hp.type='highpass';hp.frequency.value=4000;g.gain.setValueAtTime(.15*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.012);n.connect(hp).connect(g).connect(o);
}
// baixo borrachudo de tech house (Stussy, Bibi): serra filtrada + seno, leve "boing" no ataque
function bassRubber(t,m,dur,o,v,B){
  const d=Math.min(Math.max(dur,.06),.5),fq=m2f(m),a=ctx.createOscillator(),s=ctx.createOscillator(),f=ctx.createBiquadFilter(),ws=ctx.createWaveShaper(),sg=ctx.createGain(),g=ctx.createGain();
  a.type='sawtooth';s.type='sine';[a,s].forEach(x=>{x.frequency.setValueAtTime(fq*1.06,t);x.frequency.exponentialRampToValueAtTime(fq,t+.03)});
  f.type='lowpass';f.Q.value=B.q||7;f.frequency.setValueAtTime(B.cut||900,t);f.frequency.exponentialRampToValueAtTime(150,t+.11);
  ws.curve=softCurve(B.drive||2);sg.gain.value=.8;a.connect(f);f.connect(ws);s.connect(sg);sg.connect(ws);ws.connect(g);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.4*v,t+.003);g.gain.setTargetAtTime(.0001,t+d,.025);g.connect(o);
  a.start(t);s.start(t);a.stop(t+d+.2);s.stop(t+d+.2)}
// vocal picado com voz de verdade: fatias do sample "let's go" afinadas na nota (estilo chops de house)
const VSLICE=[[0,.2],[.27,.13],[.49,.14],[.63,.09],[.71,.17],[1.03,.19]];
function vchop(t,m,dur,o,v,mode){
  const b=SMP.letsgo;if(!b){return vocalChop(t,m,dur,o,v,mode==='go')}
  const s=ctx.createBufferSource(),g=ctx.createGain(),hp=ctx.createBiquadFilter(),pk=ctx.createBiquadFilter();s.buffer=b;
  let off,len,rate;
  if(mode==='go'){off=.71;len=.52;rate=Math.pow(2,(m-67)/12)}
  else{const step=Math.round(t/(60/bpm/4)),sl=VSLICE[((step%5)+5)%5];off=sl[0];len=sl[1];rate=Math.pow(2,(m-62)/12)}
  s.playbackRate.setValueAtTime(rate,t);
  const real=len/rate,d=Math.min(real,Math.max(.06,dur*1.1));
  hp.type='highpass';hp.frequency.value=180;pk.type='peaking';pk.frequency.value=3000;pk.gain.value=4;pk.Q.value=.8;
  const lv=(mode==='go'?1.5:1.3)*v;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(lv,t+.004);g.gain.setValueAtTime(lv,t+Math.max(.01,d-.03));g.gain.linearRampToValueAtTime(.0001,t+d);
  s.connect(hp);hp.connect(pk);pk.connect(g);g.connect(o);s.start(t,off);s.stop(t+d+.02);
  // eco de 3/16
  const dl=ctx.createDelay(1.5),fb=ctx.createGain(),lp=ctx.createBiquadFilter(),dg=ctx.createGain();dl.delayTime.value=60/bpm*.75;fb.gain.value=.3;lp.type='lowpass';lp.frequency.value=3500;dg.gain.value=.32;
  g.connect(dl);dl.connect(lp);lp.connect(fb);fb.connect(dl);lp.connect(dg);dg.connect(o);
  setTimeout(()=>{try{g.disconnect(dl);fb.disconnect()}catch(e){}},(t-ctx.currentTime+d+2.4)*1000);
}
// baixo redondo e curto de minimal/tech house (Stussy, Mochakk): seno + harmônico leve, mergulho de afinação no ataque
function bassStussy(t,m,dur,o,v,B){
  const d=Math.min(Math.max(dur,.06),.45),fq=m2f(m),x=ctx.createOscillator(),h=ctx.createOscillator(),hg=ctx.createGain(),lp=ctx.createBiquadFilter(),ws=ctx.createWaveShaper(),g=ctx.createGain();
  x.type='sine';h.type='triangle';[x,h].forEach((o2,k)=>{const f=fq*(k?2:1);o2.frequency.setValueAtTime(f*1.03,t);o2.frequency.exponentialRampToValueAtTime(f,t+.025)});
  hg.gain.setValueAtTime(.45,t);hg.gain.exponentialRampToValueAtTime(.14,t+.12);
  lp.type='lowpass';lp.frequency.setValueAtTime(B.cut||900,t);lp.frequency.exponentialRampToValueAtTime(320,t+.1);lp.Q.value=1.2;ws.curve=softCurve(B.drive||1.4);
  x.connect(lp);h.connect(hg);hg.connect(lp);lp.connect(ws);ws.connect(g);
  const lv=.62*v;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(lv,t+.004);g.gain.setTargetAtTime(lv*.55,t+.02,.07);g.gain.setTargetAtTime(.0001,t+d,.022);g.connect(o);
  const k=noise(t,.012),kb=ctx.createBiquadFilter(),kg=ctx.createGain();kb.type='bandpass';kb.frequency.value=1200;kg.gain.setValueAtTime(.05*v,t);kg.gain.exponentialRampToValueAtTime(.001,t+.01);k.connect(kb).connect(kg).connect(o);
  x.start(t);h.start(t);x.stop(t+d+.15);h.stop(t+d+.15)}
// órgão do Korg M1 (o de "Show Me Love"): brilhante, com estalo e queda rápida para o sustain
function m1Voice(t,fq,dur,out,lv,parts){
  const g=ctx.createGain();parts.forEach(([h,a])=>{const x=ctx.createOscillator(),xg=ctx.createGain();x.frequency.value=fq*h;xg.gain.setValueAtTime(a,t);if(h>1)xg.gain.setTargetAtTime(a*.4,t+.006,.05);x.connect(xg);xg.connect(g);x.start(t);x.stop(t+dur+.2)});
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(lv,t+.003);g.gain.setTargetAtTime(lv*.6,t+.01,.06);g.gain.setTargetAtTime(.0001,t+dur,.03);g.connect(out);
}
function chordSuper(t,notes,dur,o){ // stab de rave: várias serras desafinadas
  const d=Math.max(dur,.1),out=ctx.createGain(),lp=ctx.createBiquadFilter();lp.type='lowpass';lp.Q.value=1.5;lp.frequency.setValueAtTime(5200,t);lp.frequency.exponentialRampToValueAtTime(1800,t+.25);out.gain.value=.05/Math.sqrt(notes.length);
  notes.forEach(n=>[-18,-9,0,9,18].forEach(dt=>{const x=ctx.createOscillator();x.type='sawtooth';x.frequency.value=m2f(n);x.detune.value=dt;x.connect(out);x.start(t);x.stop(t+d+.3)}));
  const g=ctx.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(1,t+.005);g.gain.setTargetAtTime(.7,t+.02,.1);g.gain.setTargetAtTime(.0001,t+d,.06);out.connect(lp);lp.connect(g);g.connect(o)}
function chordM1(t,notes,dur,o){
  const out=ctx.createGain(),lp=ctx.createBiquadFilter(),ws=ctx.createWaveShaper();lp.type='lowpass';lp.frequency.value=5200;ws.curve=softCurve(1.3);out.gain.value=.14/Math.sqrt(notes.length);
  notes.forEach(n=>m1Voice(t,m2f(n),Math.max(dur,.08),out,1,[[1,1],[2,.75],[3,.5],[4,.36],[6,.2],[8,.14]]));
  out.connect(lp);lp.connect(ws);ws.connect(o);
  const c=noise(t,.012),cb=ctx.createBiquadFilter(),cg=ctx.createGain();cb.type='bandpass';cb.frequency.value=3000;cg.gain.setValueAtTime(.05,t);cg.gain.exponentialRampToValueAtTime(.001,t+.01);c.connect(cb).connect(cg).connect(o);
}
// baixo de órgão tipo M1 (house clássico): parciais com ataque estalado
function bassOrgan(t,m,dur,o,v,B){
  const d=Math.max(dur,.08),fq=m2f(m),g=ctx.createGain(),lp=ctx.createBiquadFilter(),ws=ctx.createWaveShaper();lp.type='lowpass';lp.frequency.value=B.cut||2600;ws.curve=softCurve(1.3);
  m1Voice(t,fq,d,lp,1,[[1,1],[2,.75],[3,.45],[4,.3],[6,.15]]);
  g.gain.value=.42*v;lp.connect(ws);ws.connect(g);g.connect(o);
  const n=noise(t,.01),bp=ctx.createBiquadFilter(),ng=ctx.createGain();bp.type='bandpass';bp.frequency.value=2400;ng.gain.setValueAtTime(.06*v,t);ng.gain.exponentialRampToValueAtTime(.001,t+.008);n.connect(bp).connect(ng).connect(o);
}
