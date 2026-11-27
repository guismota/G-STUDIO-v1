// ----- acordes -----
function chordStab(t,notes,dur,o,C){
  const f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='lowpass';f.Q.value=C.q||1;
  f.frequency.setValueAtTime(3200,t);f.frequency.exponentialRampToValueAtTime(700,t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.06,t+.01);g.gain.setTargetAtTime(.0001,t+dur,.05);
  notes.forEach(n=>[-8,8].forEach(dt=>{const x=ctx.createOscillator();x.type=C.wave||'sawtooth';x.frequency.value=m2f(n);x.detune.value=dt;x.connect(f);x.start(t);x.stop(t+dur+.4)}));
  f.connect(g).connect(o)}
function chordPad(t,notes,dur,o){
  const f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='lowpass';f.Q.value=1;
  f.frequency.setValueAtTime(700,t);f.frequency.linearRampToValueAtTime(1800,t+dur*.6);
  const att=Math.min(.8,dur/2);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.06,t+att);g.gain.setTargetAtTime(.0001,t+dur,.25);
  notes.forEach(n=>[-8,8].forEach(dt=>{const x=ctx.createOscillator();x.type='sawtooth';x.frequency.value=m2f(n);x.detune.value=dt;x.connect(f);x.start(t);x.stop(t+dur+1.5)}));
  f.connect(g).connect(o)}
function chordFM(t,notes,dur,o,piano){ // piano de house ou teclado tipo Rhodes
  const out=ctx.createGain(),lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=piano?6000:3500;out.gain.value=.16/Math.sqrt(notes.length);
  const rel=piano?1.4:Math.max(dur,.3);
  notes.forEach(n=>{
    const fq=m2f(n),car=ctx.createOscillator(),mod=ctx.createOscillator(),mg=ctx.createGain(),g=ctx.createGain();
    car.frequency.value=fq;mod.frequency.value=fq*(piano?1:1);
    mg.gain.setValueAtTime(fq*(piano?3.5:1.6),t);mg.gain.exponentialRampToValueAtTime(fq*.15,t+(piano?.45:1.1));
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(1,t+.004);
    if(piano)g.gain.exponentialRampToValueAtTime(.0001,t+rel);else{g.gain.setTargetAtTime(.45,t+.02,.4);g.gain.setTargetAtTime(.0001,t+dur,.12)}
    mod.connect(mg);mg.connect(car.frequency);car.connect(g);g.connect(lp);
    car.start(t);mod.start(t);car.stop(t+rel+.6);mod.stop(t+rel+.6);
  });
  lp.connect(out);out.connect(o)}
function chordOrgan(t,notes,dur,o){
  const out=ctx.createGain();out.gain.value=.09/Math.sqrt(notes.length);
  notes.forEach(n=>{const fq=m2f(n),g=ctx.createGain();
    [[1,1],[2,.5],[3,.3],[4,.15]].forEach(([h,a])=>{const x=ctx.createOscillator(),xg=ctx.createGain();x.frequency.value=fq*h;xg.gain.value=a;x.connect(xg);xg.connect(g);x.start(t);x.stop(t+dur+.3)});
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(1,t+.004);g.gain.setTargetAtTime(.55,t+.01,.08);g.gain.setTargetAtTime(.0001,t+dur,.04);g.connect(out)});
  out.connect(o)}
function chordBrass(t,notes,dur,o){
  const f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='lowpass';f.Q.value=2;
  f.frequency.setValueAtTime(400,t);f.frequency.exponentialRampToValueAtTime(2800,t+.06);f.frequency.exponentialRampToValueAtTime(1600,t+.25);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.07,t+.018);g.gain.setTargetAtTime(.0001,t+dur,.05);
  notes.forEach(n=>[-6,6].forEach(dt=>{const x=ctx.createOscillator();x.type='sawtooth';x.frequency.value=m2f(n);x.detune.value=dt;x.connect(f);x.start(t);x.stop(t+dur+.4)}));
  f.connect(g).connect(o)}
function chordDub(t,notes,dur,o){
  const beat=60/bpm,hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=180;hp.connect(o);
  [0,1,2,3].forEach(r=>{const tt=t+r*beat*.75,f=ctx.createBiquadFilter(),g=ctx.createGain(),lv=.075*Math.pow(.55,r);
    f.type='lowpass';f.Q.value=3;f.frequency.setValueAtTime(1500*Math.pow(.68,r),tt);f.frequency.exponentialRampToValueAtTime(380,tt+.18);
    g.gain.setValueAtTime(.0001,tt);g.gain.linearRampToValueAtTime(lv,tt+.006);g.gain.exponentialRampToValueAtTime(.0001,tt+.26);
    notes.forEach(n=>[-7,7].forEach(dt=>{const x=ctx.createOscillator();x.type='sawtooth';x.frequency.value=m2f(n);x.detune.value=dt;x.connect(f);x.start(tt);x.stop(tt+.3)}));
    f.connect(g);g.connect(hp)})}
function chord(t,notes,dur,o,syn){
  dur=Math.max(dur,.08);const C=snd().chord,type=syn||C.type;
  if(type==='pad')return chordPad(t,notes,dur,o);
  if(type==='piano')return chordFM(t,notes,dur,o,true);
  if(type==='keys')return chordFM(t,notes,dur,o,false);
  if(type==='organ')return chordOrgan(t,notes,dur,o);
  if(type==='brass')return chordBrass(t,notes,dur,o);
  if(type==='dub')return chordDub(t,notes,dur,o);
  if(type==='m1')return chordM1(t,notes,dur,o);
  if(type==='super')return chordSuper(t,notes,dur,o);
  if(type==='aco')return chordAco(t,notes,dur,o);
  return chordStab(t,notes,dur,o,C);
}

