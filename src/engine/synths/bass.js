// ----- baixos -----
function acid303(t,m,dur,o,v,slide,pm,B){
  const acc=v>1.05,gate=slide?Math.max(dur,.08)+.03:Math.min(Math.max(dur,.06),.35);
  const a=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain(),fq=m2f(m+12);
  a.type='sawtooth';
  if(slide&&pm){a.frequency.setValueAtTime(m2f(pm+12),t);a.frequency.exponentialRampToValueAtTime(fq,t+.06)}else a.frequency.value=fq;
  const sw=B.sweep?(.35+1.15*(.5-.5*Math.cos(2*Math.PI*(((t/(240/bpm))%16)/16)))):1;
  f.type='lowpass';f.Q.value=(acc?18:13)*(B.q||1);
  f.frequency.setValueAtTime(Math.min(14000,(acc?5200:2600)*(B.f||1)*sw),t);f.frequency.exponentialRampToValueAtTime(220+120*sw,t+(acc?.22:.16)*(.8+.4*sw));
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(acc?.62:.42,t+.006);g.gain.setTargetAtTime(.0001,t+gate,.03);
  a.connect(f);
  if(B.drive){const ws=ctx.createWaveShaper(),gg=ctx.createGain();ws.curve=softCurve(3);gg.gain.value=.7;f.connect(ws);ws.connect(gg);gg.connect(g)}else f.connect(g);
  g.connect(o);a.start(t);a.stop(t+gate+.3)}
function bass808(t,m,dur,o,v,B,slide,pm){
  B=B||{};const d=Math.max(dur,.15),f=m2f(m),x=ctx.createOscillator(),h=ctx.createOscillator(),g=ctx.createGain(),gh=ctx.createGain();
  x.type='sine';h.type='triangle';
  if(slide&&pm!=null){const f0=m2f(pm);x.frequency.setValueAtTime(f0,t);x.frequency.exponentialRampToValueAtTime(f,t+.09);h.frequency.setValueAtTime(f0*2,t);h.frequency.exponentialRampToValueAtTime(f*2,t+.09)}
  else{x.frequency.setValueAtTime(f*1.5,t);x.frequency.exponentialRampToValueAtTime(f,t+.05);h.frequency.setValueAtTime(f*3,t);h.frequency.exponentialRampToValueAtTime(f*2,t+.05)}
  gh.gain.value=.22;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.62*v,t+.006);g.gain.setTargetAtTime(.0001,t+d,.09);
  x.connect(g);h.connect(gh);gh.connect(g);
  if(B.drive){const ws=ctx.createWaveShaper(),lp=ctx.createBiquadFilter(),og=ctx.createGain();ws.curve=softCurve(B.drive);lp.type='lowpass';lp.frequency.value=B.cut||2600;og.gain.value=.78;g.connect(ws);ws.connect(lp);lp.connect(og);og.connect(o)}
  else g.connect(o);
  x.start(t);h.start(t);x.stop(t+d+.7);h.stop(t+d+.7)}
function bassRound(t,m,dur,o,v,B){
  const d=Math.max(dur,.08),a=ctx.createOscillator(),b=ctx.createOscillator(),gb=ctx.createGain(),f=ctx.createBiquadFilter(),g=ctx.createGain();
  a.type='sine';a.frequency.value=m2f(m);b.type='triangle';b.frequency.value=m2f(m)*2;gb.gain.value=.25;
  f.type='lowpass';f.frequency.value=B.cut||700;f.Q.value=1;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.62*v,t+.008);g.gain.setTargetAtTime(.38*v,t+.04,.12);g.gain.setTargetAtTime(.0001,t+d,.06);
  a.connect(f);b.connect(gb);gb.connect(f);f.connect(g);g.connect(o);a.start(t);b.start(t);a.stop(t+d+.4);b.stop(t+d+.4)}
function bassPluck(t,m,dur,o,v,B){
  const d=Math.min(Math.max(dur,.06),.4),a=ctx.createOscillator(),s=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();
  a.type='sawtooth';a.frequency.value=m2f(m);s.type='square';s.frequency.value=m2f(m)/2;
  f.type='lowpass';f.Q.value=5;f.frequency.setValueAtTime((B.cut||1400)*1.8,t);f.frequency.exponentialRampToValueAtTime(140,t+.09);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.5*v,t+.004);g.gain.setTargetAtTime(.0001,t+d,.03);
  a.connect(f);s.connect(f);f.connect(g);g.connect(o);a.start(t);s.start(t);a.stop(t+d+.25);s.stop(t+d+.25)}
function bassSolo(t,m,dur,o,v,B){ // baixo rolado e funkeado: duas serras + sub, filtro com envelope
  const d=Math.max(dur,.06),fq=m2f(m),a=ctx.createOscillator(),b=ctx.createOscillator(),sb=ctx.createOscillator(),sg=ctx.createGain(),f=ctx.createBiquadFilter(),ws=ctx.createWaveShaper(),g=ctx.createGain();
  a.type='sawtooth';b.type='sawtooth';a.frequency.value=fq;b.frequency.value=fq;a.detune.value=-7;b.detune.value=7;sb.type='sine';sb.frequency.value=fq;sg.gain.value=.9;
  f.type='lowpass';f.Q.value=B.q||4;f.frequency.setValueAtTime((B.cut||1700)*(v>1.05?1.5:1),t);f.frequency.exponentialRampToValueAtTime(240,t+.13+d*.2);ws.curve=softCurve(1.6);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.42*v,t+.004);g.gain.setTargetAtTime(.0001,t+d,.035);
  a.connect(f);b.connect(f);f.connect(ws);ws.connect(g);sb.connect(sg);sg.connect(g);g.connect(o);[a,b,sb].forEach(x=>{x.start(t);x.stop(t+d+.3)})}
function bassSaw(t,m,dur,o,v,B){
  const d=Math.max(dur,.06),a=ctx.createOscillator(),b=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();
  a.type='sawtooth';a.frequency.value=m2f(m);b.type='sine';b.frequency.value=m2f(m);
  f.type='lowpass';f.Q.value=B.q||6;f.frequency.setValueAtTime(B.cut||1200,t);f.frequency.exponentialRampToValueAtTime(180,t+.15);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.5*v,t+.008);g.gain.setTargetAtTime(.0001,t+d,.04);
  a.connect(f);b.connect(f);f.connect(g).connect(o);a.start(t);b.start(t);a.stop(t+d+.3);b.stop(t+d+.3)}
// reese: três serras desafinadas com filtro lento; wobble: LFO no tempo; growl: formante "falando" (neuro)
// o grave fundo fica para a linha Sub: aqui um passa-alta tira o embolo e evita clipar
function bassReese(t,m,dur,o,v,B,wob){
  const d=Math.max(dur,.08),f=m2f(m),g=ctx.createGain(),lp=ctx.createBiquadFilter(),hp=ctx.createBiquadFilter(),ws=ctx.createWaveShaper(),pre=ctx.createGain();
  const xs=[-14,0,13].map(dt=>{const x=ctx.createOscillator();x.type='sawtooth';x.frequency.value=f;x.detune.value=dt;x.connect(pre);return x});
  pre.gain.value=wob===3?.55:.3;ws.curve=softCurve(B.drive||1.8);hp.type='highpass';hp.frequency.value=wob===1?55:70;hp.Q.value=.7;
  lp.type=wob===3?'bandpass':'lowpass';lp.Q.value=wob===3?4.5:wob?6:3;
  const base=(B.cut||850)*(wob===3?1.1:wob?.55:1);lp.frequency.setValueAtTime(base,t);
  const lfo=ctx.createOscillator(),lg=ctx.createGain();
  if(wob===3){lfo.type='triangle';lfo.frequency.value=bpm/60*4;lg.gain.value=base*.7}
  else if(wob){lfo.type=wob===2?'triangle':'sine';lfo.frequency.value=bpm/60*(wob===2?1:2);lg.gain.value=base*1.4}
  else{lfo.type='sine';lfo.frequency.value=.35;lg.gain.value=base*.45}
  lfo.connect(lg);lg.connect(lp.frequency);
  pre.connect(ws);ws.connect(hp);hp.connect(lp);lp.connect(g);
  const lv=.3*v*(wob===3?4.2:1);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(lv,t+.01);g.gain.setValueAtTime(lv,t+d);g.gain.exponentialRampToValueAtTime(.0001,t+d+.07);
  g.connect(o);
  xs.concat([lfo]).forEach(x=>{x.start(t);x.stop(t+d+.1)});
}
// quebrada: acento = caixa estalada e suja, normal = caixa curta, fantasma = tique
var CRUSH=null;function crushCurve(){if(CRUSH)return CRUSH;const n=2048,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.round(x*12)/12}return CRUSH=c}
function breakHit(t,o,v){
  v=v||1;const out2=ctx.createGain(),ws=ctx.createWaveShaper();ws.curve=crushCurve();out2.gain.value=.9;ws.connect(out2);out2.connect(o);
  if(v>=1.1){
    const n=noise(t,.22),bp=ctx.createBiquadFilter(),g=ctx.createGain();bp.type='bandpass';bp.frequency.value=2300;bp.Q.value=.7;g.gain.setValueAtTime(.7,t);g.gain.exponentialRampToValueAtTime(.002,t+.2);n.connect(bp);bp.connect(g);g.connect(ws);
    const x=ctx.createOscillator(),xg=ctx.createGain();x.type='triangle';x.frequency.setValueAtTime(230,t);x.frequency.exponentialRampToValueAtTime(160,t+.06);xg.gain.setValueAtTime(.55,t);xg.gain.exponentialRampToValueAtTime(.002,t+.1);x.connect(xg);xg.connect(ws);x.start(t);x.stop(t+.12);
  }else if(v>=.9){
    const n=noise(t,.1),hp=ctx.createBiquadFilter(),g=ctx.createGain();hp.type='highpass';hp.frequency.value=1800;g.gain.setValueAtTime(.4,t);g.gain.exponentialRampToValueAtTime(.002,t+.08);n.connect(hp);hp.connect(g);g.connect(ws);
  }else{
    const n=noise(t,.05),hp=ctx.createBiquadFilter(),g=ctx.createGain();hp.type='highpass';hp.frequency.value=6500;g.gain.setValueAtTime(.22,t);g.gain.exponentialRampToValueAtTime(.002,t+.035);n.connect(hp);hp.connect(g);g.connect(o);
  }
}
// bleep: blip curto e metálico (dnb escuro / neuro), tocado pelas linhas de tom
function bleep(t,f0,o,v){const x=ctx.createOscillator(),bp=ctx.createBiquadFilter(),g=ctx.createGain();x.type='square';x.frequency.setValueAtTime(f0*4,t);x.frequency.exponentialRampToValueAtTime(f0*2,t+.03);
  bp.type='bandpass';bp.frequency.value=f0*4;bp.Q.value=6;g.gain.setValueAtTime(.32*(v||1),t);g.gain.exponentialRampToValueAtTime(.001,t+.09);x.connect(bp);bp.connect(g);g.connect(o);x.start(t);x.stop(t+.1)}
// chiado de vinil: estalos esparsos e chiado abafado
var VINYL=null;function vinylBuf(){if(VINYL)return VINYL;const sr=ctx.sampleRate,n=sr*4,b=ctx.createBuffer(1,n,sr),d=b.getChannelData(0);let lp=0;
  for(let i=0;i<n;i++){lp=lp*.92+(Math.random()*2-1)*.08;d[i]=lp*.5;if(Math.random()<.0004){const a=(Math.random()*.9+.1)*(Math.random()<.5?-1:1);for(let k=0;k<40&&i+k<n;k++)d[i+k]+=a*Math.exp(-k/6)}}return VINYL=b}
function vinylPad(t,notes,dur,o){const d=Math.max(dur,.25),s1=ctx.createBufferSource(),g=ctx.createGain(),hp=ctx.createBiquadFilter();s1.buffer=vinylBuf();s1.loop=true;hp.type='highpass';hp.frequency.value=700;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.32,t+.3);g.gain.setValueAtTime(.32,t+d);g.gain.linearRampToValueAtTime(.0001,t+d+.4);s1.connect(hp);hp.connect(g);g.connect(o);s1.start(t,Math.random()*3);s1.stop(t+d+.45)}
function bass(t,m,dur,o,v,slide,c,syn){
  v=v||1;const B=snd().bass;
  switch(syn||B.type){
    case 'reese':return bassReese(t,m,dur,o,v,B,0);
    case 'wobble':return bassReese(t,m,dur,o,v,B,1);
    case 'wobble2':return bassReese(t,m,dur,o,v,B,2);
    case 'growl':return bassReese(t,m,dur,o,v,B,3);
    case '303':return acid303(t,m,dur,o,v,slide,c&&c.lastM,B);
    case '808':return bass808(t,m,dur,o,v,B,slide,c&&c.lastM);
    case 'round':return bassRound(t,m,dur,o,v,B);
    case 'organ':return bassOrgan(t,m,dur,o,v,B);
    case 'rubber':return bassRubber(t,m,dur,o,v,B);
    case 'stussy':return bassStussy(t,m,dur,o,v,B);
    case 'pluck':return bassPluck(t,m,dur,o,v,B);
    case 'solo':return bassSolo(t,m,dur,o,v,B);
    case 'elec':return bassElec(t,m,dur,o,v,B);
    default:return bassSaw(t,m,dur,o,v,B);
  }
}

