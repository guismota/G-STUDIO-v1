import { ctx, m2f, noise, softCurve } from '../../app/all.js';
// ----- cumbia: güiro, campana, timbales, baixo elétrico, teclado solo, acordeão, flauta e guitarra -----
// güiro: ruído passando por um "pente" (AM em dente de serra) que acelera durante a raspada. X = raspada longa, x/o = curta
function guiro(t,o,v){
  v=v||1;const long=v>1.01,d=long?.15:.045,n=noise(t,d+.04),bp=ctx.createBiquadFilter(),hp=ctx.createBiquadFilter(),am=ctx.createGain(),lf=ctx.createOscillator(),dp=ctx.createGain(),g=ctx.createGain();
  bp.type='bandpass';bp.frequency.value=3600;bp.Q.value=1.6;hp.type='highpass';hp.frequency.value=1800;
  lf.type='sawtooth';lf.frequency.setValueAtTime(long?62:120,t);lf.frequency.linearRampToValueAtTime(long?105:140,t+d);am.gain.value=.5;dp.gain.value=.5;lf.connect(dp);dp.connect(am.gain);
  const lv=(long?.62:.46)*Math.min(v,1.2);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(lv,t+(long?.03:.006));g.gain.setValueAtTime(lv*(long?.9:.8),t+d*.8);g.gain.exponentialRampToValueAtTime(.0005,t+d+.02);
  n.connect(bp);bp.connect(hp);hp.connect(am);am.connect(g);g.connect(o);lf.start(t);lf.stop(t+d+.05)}
// campana (cencerro de mão): dois quadrados inarmônicos num passa-banda, ataque seco. X = boca do sino, x normal, o abafada
function campana(t,o,v){
  v=v||1;const acc=v>1.01,d=v<.75?.08:acc?.3:.2,f=ctx.createBiquadFilter(),hp=ctx.createBiquadFilter(),g=ctx.createGain();
  f.type='bandpass';f.frequency.value=1650;f.Q.value=1.3;hp.type='highpass';hp.frequency.value=520;
  [612,904].forEach(fr=>{const x=ctx.createOscillator();x.type='square';x.frequency.value=fr;x.connect(f);x.start(t);x.stop(t+d+.03)});
  const lv=.3*Math.min(v,1.2);g.gain.setValueAtTime(lv,t);g.gain.exponentialRampToValueAtTime(lv*.35,t+.03);g.gain.exponentialRampToValueAtTime(.0005,t+d);
  f.connect(hp);hp.connect(g);g.connect(o);
  const n=noise(t,.014),nb=ctx.createBiquadFilter(),ng=ctx.createGain();nb.type='bandpass';nb.frequency.value=4200;nb.Q.value=1;ng.gain.setValueAtTime(.12*v,t);ng.gain.exponentialRampToValueAtTime(.001,t+.01);n.connect(nb);nb.connect(ng);ng.connect(o)}
// timbales: X = macho com aro (agudo, aberto), x = hembra (mais grave), o = paila (baqueta no casco)
function timbal(t,o,v){
  v=v||1;
  if(v<.75){const x=ctx.createOscillator(),xg=ctx.createGain();x.type='triangle';x.frequency.setValueAtTime(2300,t);x.frequency.exponentialRampToValueAtTime(1700,t+.02);
    xg.gain.setValueAtTime(.4,t);xg.gain.exponentialRampToValueAtTime(.001,t+.03);x.connect(xg);xg.connect(o);x.start(t);x.stop(t+.04);
    const n=noise(t,.03),nb=ctx.createBiquadFilter(),ng=ctx.createGain();nb.type='bandpass';nb.frequency.value=3400;nb.Q.value=2;ng.gain.setValueAtTime(.6,t);ng.gain.exponentialRampToValueAtTime(.001,t+.022);n.connect(nb);nb.connect(ng);ng.connect(o);return}
  const hi=v>1.01,f0=hi?560:410,d=hi?.42:.34,lv=.44;
  [[1,1],[1.48,.45],[2.12,.22]].forEach(([r,a])=>{const x=ctx.createOscillator(),g=ctx.createGain();x.type='sine';x.frequency.setValueAtTime(f0*r*1.12,t);x.frequency.exponentialRampToValueAtTime(f0*r,t+.025);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(lv*a,t+.002);g.gain.exponentialRampToValueAtTime(.0005,t+d*(1-.25*(r-1)));x.connect(g);g.connect(o);x.start(t);x.stop(t+d+.05)});
  const n=noise(t,.08),nb=ctx.createBiquadFilter(),ng=ctx.createGain();nb.type='bandpass';nb.frequency.value=hi?4200:3000;nb.Q.value=.9;ng.gain.setValueAtTime(hi?.5:.32,t);ng.gain.exponentialRampToValueAtTime(.001,t+(hi?.06:.04));n.connect(nb);nb.connect(ng);ng.connect(o);
  if(hi){const r=ctx.createOscillator(),rg=ctx.createGain();r.type='square';r.frequency.value=f0*3.1;rg.gain.setValueAtTime(.05,t);rg.gain.exponentialRampToValueAtTime(.0005,t+.12);r.connect(rg);rg.connect(o);r.start(t);r.stop(t+.13)}}
// baixo elétrico de dedo: serra + seno, filtro que fecha rápido, um pouco de saturação e o toque do dedo
function bassElec(t,m,dur,o,v,B){
  const d=Math.max(dur,.08),fq=m2f(m),c=B.cut||900,a=ctx.createOscillator(),s=ctx.createOscillator(),sg=ctx.createGain(),f=ctx.createBiquadFilter(),ws=ctx.createWaveShaper(),g=ctx.createGain();
  a.type='sawtooth';a.frequency.value=fq;s.type='sine';s.frequency.value=fq;sg.gain.value=B.sub==null?1.1:B.sub;
  f.type='lowpass';f.Q.value=1.2;f.frequency.setValueAtTime(c*2.2,t);f.frequency.exponentialRampToValueAtTime(c,t+.05);f.frequency.exponentialRampToValueAtTime(320,t+.05+d);ws.curve=softCurve(1.5);
  const lv=.4*v;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(lv,t+.005);g.gain.setTargetAtTime(lv*.6,t+.02,.12);g.gain.setTargetAtTime(.0001,t+d,.045);
  a.connect(f);s.connect(sg);sg.connect(f);f.connect(ws);ws.connect(g);g.connect(o);
  const n=noise(t,.012),nb=ctx.createBiquadFilter(),ng=ctx.createGain();nb.type='bandpass';nb.frequency.value=1500;nb.Q.value=1;ng.gain.setValueAtTime(.05*v,t);ng.gain.exponentialRampToValueAtTime(.001,t+.01);n.connect(nb);nb.connect(ng);ng.connect(o);
  [a,s].forEach(x=>{x.start(t);x.stop(t+d+.35)})}
// teclado solo da cumbia: quadrada + serra brilhantes (e uma oitava acima bem baixa), vibrato que entra devagar
// e a mão na rodinha: 1 = bend (começa um tom abaixo e sobe), 2 = mordente (vizinha de cima e volta), 3 = caída no fim da nota
function leadCumbia(t,m,dur,o,v,bend){
  const AM=[9,11,0,2,4,5,7],nb=AM.includes((m+1)%12)?1:2,ur=Math.pow(2,nb/12);
  const fq=m2f(m),d=Math.max(dur,.07),lp=ctx.createBiquadFilter(),pk=ctx.createBiquadFilter(),ws=ctx.createWaveShaper(),g=ctx.createGain(),l=ctx.createOscillator(),lg=ctx.createGain();
  lp.type='lowpass';lp.frequency.value=5200;lp.Q.value=2;pk.type='peaking';pk.frequency.value=2400;pk.Q.value=1;pk.gain.value=4;ws.curve=softCurve(1.4);
  l.frequency.value=6.3;lg.gain.setValueAtTime(0,t);if(d>.22){lg.gain.linearRampToValueAtTime(0,t+.13);lg.gain.linearRampToValueAtTime(32,t+Math.min(d,.5)+.13)}l.connect(lg);
  const xs=[['square',1,0,1],['sawtooth',1,7,.8],['square',2,-4,.22]].map(([w,k,dt,a])=>{const x=ctx.createOscillator(),xg=ctx.createGain();x.type=w;x.detune.value=dt;
    const f1=fq*k;if(bend===1){x.frequency.setValueAtTime(f1*.8909,t);x.frequency.setTargetAtTime(f1,t+.015,.035)}
    else if(bend===2){x.frequency.setValueAtTime(f1,t);x.frequency.setValueAtTime(f1*ur,t+.05);x.frequency.setValueAtTime(f1,t+.1)}
    else{x.frequency.setValueAtTime(f1*.985,t);x.frequency.exponentialRampToValueAtTime(f1,t+.018)}
    if(bend===3&&d>.2){x.frequency.setValueAtTime(f1,t+d-.12);x.frequency.exponentialRampToValueAtTime(f1*.75,t+d+.06)}
    lg.connect(x.detune);xg.gain.value=a;x.connect(xg);xg.connect(lp);return x});
  const lv=.3*v;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(lv,t+.003);g.gain.setTargetAtTime(lv*.82,t+.01,.1);g.gain.setTargetAtTime(.0001,t+d,.05);
  lp.connect(pk);pk.connect(ws);ws.connect(g);g.connect(o);xs.concat([l]).forEach(x=>{x.start(t);x.stop(t+d+.4)})}
// acordeão: três palhetas em serra (musette: uma afinada, uma acima e uma abaixo, o batimento dá o tremolo) + uma oitava abaixo; o fole sobe em 25 ms
function acoVoice(t,fq,d,dst,lv){
  const g=ctx.createGain();
  [[0,1,'sawtooth'],[13,.8,'sawtooth'],[-13,.8,'sawtooth'],[-1200,.35,'square']].forEach(([dt,a,w])=>{const x=ctx.createOscillator(),xg=ctx.createGain();x.type=w;x.frequency.value=fq;x.detune.value=dt;xg.gain.value=a;x.connect(xg);xg.connect(g);x.start(t);x.stop(t+d+.2)});
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(lv,t+.025);g.gain.setTargetAtTime(lv*.85,t+.03,.15);g.gain.setTargetAtTime(.0001,t+d,.035);g.connect(dst)}
function acoBus(o){const pk=ctx.createBiquadFilter(),lp=ctx.createBiquadFilter(),hp=ctx.createBiquadFilter();pk.type='peaking';pk.frequency.value=1250;pk.Q.value=1.1;pk.gain.value=6;lp.type='lowpass';lp.frequency.value=4200;lp.Q.value=.7;hp.type='highpass';hp.frequency.value=180;pk.connect(lp);lp.connect(hp);hp.connect(o);return pk}
function leadAcordeon(t,m,dur,o,v){acoVoice(t,m2f(m),Math.max(dur,.08),acoBus(o),.13*v)}
function chordAco(t,notes,dur,o){const b=acoBus(o),lv=.045/Math.sqrt(notes.length);notes.forEach(n=>acoVoice(t,m2f(n),Math.max(dur,.08),b,lv))}
// flauta de teclado: seno + um pouco de 2º harmônico, sopro filtrado e vibrato largo que entra depois do ataque
function leadFlauta(t,m,dur,o,v,bend){
  const fq=m2f(m),d=Math.max(dur,.1),x=ctx.createOscillator(),y=ctx.createOscillator(),yg=ctx.createGain(),l=ctx.createOscillator(),lg=ctx.createGain(),g=ctx.createGain();
  x.type='sine';y.type='triangle';yg.gain.value=.18;
  [[x,1],[y,2]].forEach(([z,k])=>{if(bend===1){z.frequency.setValueAtTime(fq*k*.8909,t);z.frequency.setTargetAtTime(fq*k,t+.02,.05)}else z.frequency.value=fq*k});
  l.frequency.value=5.4;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(0,t+.12);lg.gain.linearRampToValueAtTime(28,t+Math.min(d,.5)+.12);l.connect(lg);lg.connect(x.detune);lg.connect(y.detune);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.17*v,t+.04);g.gain.setTargetAtTime(.0001,t+d,.07);
  x.connect(g);y.connect(yg);yg.connect(g);g.connect(o);
  const n=noise(t,d+.3),nb=ctx.createBiquadFilter(),ng=ctx.createGain();nb.type='bandpass';nb.frequency.value=Math.min(9000,fq*2.2);nb.Q.value=1.4;ng.gain.setValueAtTime(.0001,t);ng.gain.linearRampToValueAtTime(.05*v,t+.03);ng.gain.setTargetAtTime(.012*v,t+.06,.1);ng.gain.setTargetAtTime(.0001,t+d,.05);n.connect(nb);nb.connect(ng);ng.connect(o);
  [x,y,l].forEach(z=>{z.start(t);z.stop(t+d+.4)})}
// guitarra (requinto): corda de nylon beliscada, filtro fechando e um realce de corpo
function guitarra(t,m,dur,o,v){
  const fq=m2f(m),d=Math.min(1.1,Math.max(.25,dur*2.5)),a=ctx.createOscillator(),b=ctx.createOscillator(),bg=ctx.createGain(),f=ctx.createBiquadFilter(),bd=ctx.createBiquadFilter(),g=ctx.createGain();
  a.type='sawtooth';b.type='triangle';a.frequency.value=fq;b.frequency.value=fq;b.detune.value=4;bg.gain.value=1.4;
  f.type='lowpass';f.Q.value=2;f.frequency.setValueAtTime(Math.min(9000,fq*9),t);f.frequency.exponentialRampToValueAtTime(Math.max(300,fq*1.5),t+.18);
  bd.type='peaking';bd.frequency.value=220;bd.Q.value=1.4;bd.gain.value=4;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.16*v,t+.002);g.gain.exponentialRampToValueAtTime(.0005,t+d);
  a.connect(f);b.connect(bg);bg.connect(f);f.connect(bd);bd.connect(g);g.connect(o);[a,b].forEach(x=>{x.start(t);x.stop(t+d+.05)})}

export { bassElec, campana, chordAco, guiro, guitarra, leadAcordeon, leadCumbia, leadFlauta, timbal };
