// ----- sidechain: o resto da música abaixa a cada kick -----
function duckAt(t,v){
  if(!duck||K.sc<.02)return;
  const depth=Math.min(.92,K.sc*.9*Math.min(1,v)),rel=60/bpm*.16,g=duck.gain;
  g.setTargetAtTime(1-depth,t,.003);g.setTargetAtTime(1,t+.025,rel);
}
// ----- sub grave -----
function subBass(t,m,dur,o,v){
  v=v||1;const S=snd().sub||{},d=Math.max(dur,.08),rel=S.rel||.07,fq=m2f(m),x=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();
  x.type=S.type==='tri'?'triangle':'sine';
  if(S.type==='808'){x.frequency.setValueAtTime(fq*1.6,t);x.frequency.exponentialRampToValueAtTime(fq,t+.045)}else x.frequency.value=fq;
  const lv=.5*v*(S.lvl||1);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(lv,t+.008);g.gain.setValueAtTime(lv,t+d);g.gain.exponentialRampToValueAtTime(.0001,t+d+rel);
  lp.type='lowpass';lp.frequency.value=S.cut||240;
  let n=x;if(S.drive){const ws=ctx.createWaveShaper(),dg=ctx.createGain();ws.curve=softCurve(S.drive);dg.gain.value=.8;x.connect(ws);ws.connect(dg);n=dg}
  n.connect(lp);lp.connect(g);g.connect(o);x.start(t);x.stop(t+d+rel+.05)}
// ----- pads e cordas -----
function padSynth(t,notes,dur,o,syn){
  if((syn||(snd().pad||{}).type)==='vinyl'){vinylPad(t,notes,dur,o);syn='dark'}
  const P=snd().pad||{},type=syn||P.type||'warm',d=Math.max(dur,.25),n=notes.length||1;
  const f=ctx.createBiquadFilter(),g=ctx.createGain(),sum=ctx.createGain();sum.gain.value=1/Math.sqrt(n);f.type='lowpass';
  let att=.35,rel=.9,lvl=.085,waves=['sawtooth','sawtooth'],det=[-9,9],vib=0;
  if(type==='strings'){att=.22;rel=.6;f.frequency.value=3600;f.Q.value=.4;waves=['sawtooth','sawtooth','sawtooth'];det=[-13,0,13];vib=7;lvl=.075}
  else if(type==='warm'){att=.5;rel=1.1;waves=['sawtooth','triangle'];det=[-7,7];f.frequency.setValueAtTime(650,t);f.frequency.linearRampToValueAtTime(1700,t+d*.7)}
  else if(type==='dark'){att=.9;rel=1.4;waves=['square','sawtooth'];det=[-11,11];f.frequency.setValueAtTime(500,t);f.frequency.linearRampToValueAtTime(1100,t+d);f.Q.value=4;lvl=.075}
  else if(type==='swell'){att=Math.max(.3,d*.85);rel=.35;det=[-10,10];f.frequency.setValueAtTime(250,t);f.frequency.exponentialRampToValueAtTime(5200,t+att);f.Q.value=2}
  else if(type==='air'){att=Math.min(1.2,d*.5);rel=1.2;waves=['triangle'];det=[-5,5];f.frequency.value=1300;lvl=.06;
    const n=noise(t,d+2.6),nf=ctx.createBiquadFilter(),ng=ctx.createGain();nf.type='bandpass';nf.frequency.setValueAtTime(3000,t);nf.frequency.linearRampToValueAtTime(7000,t+d);nf.Q.value=.6;
    ng.gain.setValueAtTime(.0001,t);ng.gain.linearRampToValueAtTime(.035,t+att);ng.gain.setValueAtTime(.035,t+d);ng.gain.setTargetAtTime(.0001,t+d,.4);n.connect(nf);nf.connect(ng);ng.connect(o)}
  else if(type==='choir'){att=.4;rel=1;waves=['sawtooth'];det=[-6,6];vib=5;f.frequency.value=4200;lvl=.12}
  att=Math.min(att,type==='swell'?att:d*.7);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(lvl,t+att);g.gain.setValueAtTime(lvl,t+Math.max(att,d));g.gain.setTargetAtTime(.0001,t+Math.max(att,d),rel/3);
  const end=t+Math.max(att,d)+rel*2.2;let lfo=null,lg=null;
  if(vib){lfo=ctx.createOscillator();lg=ctx.createGain();lfo.frequency.value=4.8;lg.gain.value=vib;lfo.connect(lg);lfo.start(t);lfo.stop(end)}
  let dest=sum;
  if(type==='choir'){ // formantes de "aah"
    dest=ctx.createGain();[[800,.9,6],[1150,.45,8],[2800,.16,10]].forEach(([fr,gn,q])=>{const b=ctx.createBiquadFilter(),bg=ctx.createGain();b.type='bandpass';b.frequency.value=fr;b.Q.value=q;bg.gain.value=gn*2.2;dest.connect(b);b.connect(bg);bg.connect(sum)});
  }
  notes.forEach(m=>det.forEach((dt,i)=>{const x=ctx.createOscillator();x.type=waves[i%waves.length];x.frequency.value=m2f(m);x.detune.value=dt;if(lg)lg.connect(x.detune);x.connect(dest);x.start(t);x.stop(end)}));
  sum.connect(f);f.connect(g);g.connect(o)}
// ----- arpejos -----
function arpSynth(t,m,dur,o,v,syn,bend){
  v=v||1;const A=snd().arp||{},type=syn||A.type||'pluck',d=Math.max(dur,.05);
  if(type==='guitarra')return guitarra(t,m,d,o,v);
  if(type==='flauta')return leadFlauta(t,m,d,o,v*.85,bend);
  if(type==='acid')return acid303(t,m-12,dur,o,v*.55,0,null,{q:A.q||1,f:A.f||1.1,sweep:A.sweep});
  if(type==='bell')return leadFM(t,m,Math.min(d,.2),o,v*.6);
  if(type==='bolha')return bolha(t,m,d,o,v);
  if(type==='kalimba')return kalimba(t,m,d,o,v);
  if(type==='piano'){const pg=ctx.createGain();pg.gain.value=1.9*v;pg.connect(o);chordFM(t,[m],Math.max(d,.15),pg,true);setTimeout(()=>{try{pg.disconnect()}catch(e){}},(t-ctx.currentTime+2)*1000);return}
  if(type==='tuim')return tuim(t,m,d,o,v*.8);
  const x=ctx.createOscillator(),x2=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain(),sq=type==='square';
  x.type=sq?'square':'sawtooth';x2.type=x.type;x.frequency.value=m2f(m);x2.frequency.value=m2f(m);x2.detune.value=sq?-7:10;
  f.type='lowpass';f.Q.value=sq?5:7;f.frequency.setValueAtTime(sq?2800:(A.cut||5500),t);f.frequency.exponentialRampToValueAtTime(380,t+.1+d*.35);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.085*v,t+.002);g.gain.exponentialRampToValueAtTime(.0005,t+d+.14);
  x.connect(f);x2.connect(f);f.connect(g);g.connect(o);x.start(t);x2.start(t);x.stop(t+d+.2);x2.stop(t+d+.2)}
// ----- efeitos de transição -----
function fxHit(t,code,len,o,v){
  v=v||1;len=Math.max(.3,len);
  if(code===5){ // sirene de polícia passando: dois tons que sobem e descem, chegando e indo embora
    const d=Math.min(len,60/bpm*8),x=ctx.createOscillator(),x2=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain(),lfo=ctx.createOscillator(),lg=ctx.createGain();
    x.type='triangle';x2.type='square';x.frequency.value=950;x2.frequency.value=950;lfo.type='triangle';lfo.frequency.value=1.6;lg.gain.value=380;lfo.connect(lg);lg.connect(x.frequency);lg.connect(x2.frequency);
    const g2=ctx.createGain();g2.gain.value=.25;x2.connect(g2);g2.connect(f);x.connect(f);f.type='bandpass';f.frequency.value=1200;f.Q.value=.9;
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.2*v,t+d*.45);g.gain.exponentialRampToValueAtTime(.0001,t+d);f.connect(g);g.connect(o);
    x.frequency.setValueAtTime(950,t);x.detune.setValueAtTime(60,t);x.detune.linearRampToValueAtTime(-90,t+d);
    [x,x2,lfo].forEach(z=>{z.start(t);z.stop(t+d+.05)});return}
  if(code===1){ // riser: ruído e serra subindo até a virada
    const n=noise(t,len+.1),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='bandpass';f.Q.value=2.2;f.frequency.setValueAtTime(220,t);f.frequency.exponentialRampToValueAtTime(9500,t+len);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.32*v,t+len);g.gain.linearRampToValueAtTime(.0001,t+len+.05);n.connect(f).connect(g).connect(o);
    const x=ctx.createOscillator(),xf=ctx.createBiquadFilter(),xg=ctx.createGain();x.type='sawtooth';x.frequency.setValueAtTime(90,t);x.frequency.exponentialRampToValueAtTime(1100,t+len);xf.type='highpass';xf.frequency.value=250;
    xg.gain.setValueAtTime(.0001,t);xg.gain.exponentialRampToValueAtTime(.045*v,t+len);xg.gain.linearRampToValueAtTime(.0001,t+len+.04);x.connect(xf).connect(xg).connect(o);x.start(t);x.stop(t+len+.1);return}
  if(code===2){ // downlifter: desce e some
    const L=Math.min(len,3.5),n=noise(t,L+.1),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='bandpass';f.Q.value=2;f.frequency.setValueAtTime(9000,t);f.frequency.exponentialRampToValueAtTime(180,t+L);
    g.gain.setValueAtTime(.3*v,t);g.gain.exponentialRampToValueAtTime(.0001,t+L);n.connect(f).connect(g).connect(o);return}
  if(code===3){ // impacto: boom grave com cauda
    const x=ctx.createOscillator(),g=ctx.createGain();x.frequency.setValueAtTime(110,t);x.frequency.exponentialRampToValueAtTime(28,t+1.2);
    g.gain.setValueAtTime(.75*v,t);g.gain.exponentialRampToValueAtTime(.0001,t+1.8);x.connect(g).connect(o);x.start(t);x.stop(t+1.9);
    const n=noise(t,1.6),f=ctx.createBiquadFilter(),g2=ctx.createGain();f.type='lowpass';f.frequency.setValueAtTime(5000,t);f.frequency.exponentialRampToValueAtTime(300,t+1.4);
    g2.gain.setValueAtTime(.32*v,t);g2.gain.exponentialRampToValueAtTime(.0001,t+1.5);n.connect(f).connect(g2).connect(o);return}
  // reverse: prato ao contrário crescendo até a virada
  const L=Math.min(len,60/bpm*4),n=noise(t+len-L,L+.05),f=ctx.createBiquadFilter(),g=ctx.createGain(),s0=t+len-L;f.type='highpass';f.frequency.value=4500;
  g.gain.setValueAtTime(.0001,s0);g.gain.exponentialRampToValueAtTime(.38*v,t+len);g.gain.linearRampToValueAtTime(.0001,t+len+.03);n.connect(f).connect(g).connect(o)}

