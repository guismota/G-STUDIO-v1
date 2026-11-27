// ----- bateria -----
function kick(t,o,v){
  const K=snd().kick;v=(v||1)*(K.lvl||1);if(K.type==='909')return kick909(t,o,v,K);const x=ctx.createOscillator(),g=ctx.createGain();
  x.frequency.setValueAtTime(K.f0,t);x.frequency.exponentialRampToValueAtTime(K.f1,t+(K.sweep||.12));
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+K.dec);x.connect(g);
  if(K.drive){const ws=ctx.createWaveShaper(),gg=ctx.createGain();ws.curve=softCurve(K.drive);gg.gain.value=.85;g.connect(ws);ws.connect(gg);gg.connect(o)}else g.connect(o);
  x.start(t);x.stop(t+K.dec+.05);
  if(K.knock!==0){const kx=ctx.createOscillator(),kg=ctx.createGain();kx.type='triangle';kx.frequency.setValueAtTime(K.f0*1.8,t);kx.frequency.exponentialRampToValueAtTime(K.f0*.7,t+.03);kg.gain.setValueAtTime(.35*v*(K.knock||1),t);kg.gain.exponentialRampToValueAtTime(.001,t+.035);kx.connect(kg);kg.connect(o);kx.start(t);kx.stop(t+.05)}
  if(K.tail){const sx=ctx.createOscillator(),sg=ctx.createGain();sx.frequency.value=K.f1;sg.gain.setValueAtTime(.0001,t);sg.gain.linearRampToValueAtTime(.35*K.tail*v,t+.03);sg.gain.exponentialRampToValueAtTime(.0001,t+K.dec*1.6);sx.connect(sg);sg.connect(o);sx.start(t);sx.stop(t+K.dec*1.7)}
  if(K.click){const n=noise(t,.03),f=ctx.createBiquadFilter(),g2=ctx.createGain();f.type='highpass';f.frequency.value=2500;g2.gain.setValueAtTime(.4*K.click*v,t);g2.gain.exponentialRampToValueAtTime(.001,t+.012);n.connect(f).connect(g2).connect(o)}
  if(K.rumble){ // cauda grave distorcida típica do techno
    const r=ctx.createOscillator(),ws=ctx.createWaveShaper(),lp=ctx.createBiquadFilter(),rg=ctx.createGain(),dur=K.rumbleDec||.4;
    r.frequency.setValueAtTime(K.f1*1.15,t+.04);r.frequency.exponentialRampToValueAtTime(K.f1*.9,t+.04+dur);ws.curve=softCurve(4);lp.type='lowpass';lp.frequency.value=170;lp.Q.value=2;
    rg.gain.setValueAtTime(.0001,t);rg.gain.linearRampToValueAtTime(.32*K.rumble*v,t+.07);rg.gain.exponentialRampToValueAtTime(.0001,t+.07+dur);
    r.connect(ws);ws.connect(lp);lp.connect(rg);rg.connect(o);r.start(t+.04);r.stop(t+.12+dur);
  }
}
function clapOnly(t,o,v){
  v=v||1;if(snd().clap.alt==='break')return breakHit(t,o,v);if(snd().clap.smp&&smp(snd().clap.smp,t,o,.8*v*(snd().clap.sv||1)))return;const c=snd().clap,f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='bandpass';f.frequency.value=c.f;f.Q.value=1;
  const n=noise(t,c.dec+.1),k=c.spread||3;g.gain.setValueAtTime(.0001,t);
  for(let i=0;i<k;i++){const d=i*.011;g.gain.setValueAtTime(.8*v,t+d);g.gain.exponentialRampToValueAtTime(.15*v,t+d+.009)}
  g.gain.setValueAtTime(.7*v,t+k*.011);g.gain.exponentialRampToValueAtTime(.001,t+c.dec);
  n.connect(f).connect(g).connect(o);
  const n2=noise(t+.01,c.dec*2.2),f2=ctx.createBiquadFilter(),g2=ctx.createGain();f2.type='bandpass';f2.frequency.value=c.f*1.6;f2.Q.value=.7; // cauda de sala
  g2.gain.setValueAtTime(.0001,t+.01);g2.gain.linearRampToValueAtTime(.12*v,t+.03);g2.gain.exponentialRampToValueAtTime(.0005,t+.01+c.dec*2.2);n2.connect(f2).connect(g2).connect(o)}
function snap(t,o,v){ // estalo de dedo / rim curto
  const n=noise(t,.12),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='bandpass';f.frequency.value=2300;f.Q.value=1.3;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.55*v,t+.002);g.gain.exponentialRampToValueAtTime(.002,t+.09);n.connect(f).connect(g).connect(o);
  const x=ctx.createOscillator(),xg=ctx.createGain();x.frequency.setValueAtTime(1800,t);x.frequency.exponentialRampToValueAtTime(900,t+.015);xg.gain.setValueAtTime(.18*v,t);xg.gain.exponentialRampToValueAtTime(.001,t+.02);x.connect(xg).connect(o);x.start(t);x.stop(t+.03);
  const n2=noise(t+.008,.3),f2=ctx.createBiquadFilter(),g2=ctx.createGain();f2.type='bandpass';f2.frequency.value=3400;f2.Q.value=.6;g2.gain.setValueAtTime(.0001,t+.008);g2.gain.linearRampToValueAtTime(.07*v,t+.02);g2.gain.exponentialRampToValueAtTime(.0005,t+.3);n2.connect(f2).connect(g2).connect(o)}
function snare(t,o,v){
  if(snd().snare.alt==='snap')return snap(t,o,v||1);
  const S=snd().snare;v=(v||1)*(S.lvl||1);const x=ctx.createOscillator(),g=ctx.createGain();x.type='triangle';x.frequency.setValueAtTime(S.tone,t);x.frequency.exponentialRampToValueAtTime(S.tone*.62,t+.08);
  g.gain.setValueAtTime(.55*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.14);x.connect(g).connect(o);x.start(t);x.stop(t+.16);
  const x2=ctx.createOscillator(),gx=ctx.createGain();x2.type='sine';x2.frequency.setValueAtTime(S.tone*1.75,t);x2.frequency.exponentialRampToValueAtTime(S.tone*1.2,t+.05);gx.gain.setValueAtTime(.25*v,t);gx.gain.exponentialRampToValueAtTime(.001,t+.07);x2.connect(gx).connect(o);x2.start(t);x2.stop(t+.09);
  const n=noise(t,S.dec+.05),f=ctx.createBiquadFilter(),g2=ctx.createGain();f.type='highpass';f.frequency.value=S.hp;g2.gain.setValueAtTime(.55*v,t);g2.gain.exponentialRampToValueAtTime(.001,t+S.dec);n.connect(f).connect(g2).connect(o)}
function tom(t,fr,o,v){v=v||1;const T=snd().tom,f0=(T.map&&T.map[fr])||fr*T.mult;if(T.alt==='bleep')return bleep(t,f0,o,v);if(T.smp){const n=fr>=180?'conga_hi':fr>=130?'conga_mid':'conga_lo';if(smp(n,t,o,.95*v*(T.sv||1),f0/SMPF[n]))return}const x=ctx.createOscillator(),g=ctx.createGain();x.frequency.setValueAtTime(f0*1.6,t);x.frequency.exponentialRampToValueAtTime(f0,t+.09);g.gain.setValueAtTime(.9*v*(T.lvl||1),t);g.gain.exponentialRampToValueAtTime(.001,t+T.dec);x.connect(g).connect(o);x.start(t);x.stop(t+T.dec+.03)}
function hat(t,o,open,v){
  v=v||1;const H=snd().hat,dec=open?H.odec:H.dec;if(H.type==='909')return hat909(t,o,open,v,H);if(H.type==='guiro')return open?campana(t,o,v):guiro(t,o,v);
  if(open&&H.ride&&H.rsmp&&smp('ride',t,o,.42*v,0,Math.max(.4,dec*1.6)))return;
  if(!open&&H.smp&&smp(H.smp,t,o,.5*v*(H.sv||1),0,H.sdur||.25))return;
  if(open&&H.osmp&&!H.ride&&smp(H.osmp,t,o,.42*v*(H.sv||1),0,Math.max(.15,dec*1.4)))return;
  if(open&&H.ride){ // prato de condução: metálico e longo
    const f=ctx.createBiquadFilter(),hp=ctx.createBiquadFilter(),g=ctx.createGain();f.type='bandpass';f.frequency.value=7800;f.Q.value=.9;hp.type='highpass';hp.frequency.value=4200;
    g.gain.setValueAtTime(.075*v,t);g.gain.exponentialRampToValueAtTime(.03*v,t+.06);g.gain.exponentialRampToValueAtTime(.0005,t+dec);
    [300.5,450.3,610.7,787.1,1023.4,1340.2].forEach(fr=>{const x=ctx.createOscillator();x.type='square';x.frequency.value=fr;x.connect(f);x.start(t);x.stop(t+dec+.05)});
    f.connect(hp);hp.connect(g);g.connect(o);
    const n=noise(t,.5),nf=ctx.createBiquadFilter(),ng=ctx.createGain();nf.type='highpass';nf.frequency.value=9000;ng.gain.setValueAtTime(.05*v,t);ng.gain.exponentialRampToValueAtTime(.0005,t+.45);n.connect(nf).connect(ng).connect(o);return}
  if(H.metal){
    const f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='highpass';f.frequency.value=7000;
    g.gain.setValueAtTime(.1*v,t);g.gain.exponentialRampToValueAtTime(.001,t+dec);
    [205.3,304.4,369.6,522.7,540,800].forEach(fr=>{const x=ctx.createOscillator();x.type='square';x.frequency.value=fr;x.connect(f);x.start(t);x.stop(t+dec+.02)});
    f.connect(g).connect(o);return;
  }
  const n=noise(t,dec+.05),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='highpass';f.frequency.value=H.hp||7500;g.gain.setValueAtTime((open?.22:.2)*v,t);g.gain.exponentialRampToValueAtTime(.001,t+dec);n.connect(f).connect(g).connect(o)}
function perc(t,o,v,syn){
  v=v||1;let type=syn||snd().perc.type;
  if(type&&type.startsWith('smp:')){const n=type.slice(4);if(smp(n,t,o,.75*v,{logdrum:1.06,bongo_hi:.953}[n]||1))return;type=n==='logdrum'?'clave':'rim'}
  if(type==='shaker'){const n=noise(t,.1),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='bandpass';f.frequency.value=6500;f.Q.value=.8;env(g,t,.32*v,.006,.06);n.connect(f).connect(g).connect(o);return}
  if(type==='cowbell'){const f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='bandpass';f.frequency.value=900;f.Q.value=2;g.gain.setValueAtTime(.3*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.25);
    [540,800].forEach(fr=>{const x=ctx.createOscillator();x.type='square';x.frequency.value=fr;x.connect(f);x.start(t);x.stop(t+.27)});f.connect(g).connect(o);return}
  if(type==='ride909')return ride909(t,o,v);
  if(type==='timbal')return timbal(t,o,v);
  if(type==='guiro')return guiro(t,o,v);
  if(type==='campana')return campana(t,o,v);
  if(type==='rim909')return rim909(t,o,v);
  if(type==='tuim')return tuim(t,72,.12,o,v); // Dó, no tom do funk
  if(type==='rattle'){[0,.017,.034].forEach((d,i)=>{const n=noise(t+d,.03),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='bandpass';f.frequency.value=5200+i*600;f.Q.value=2.5;g.gain.setValueAtTime(.28*v*(1-i*.28),t+d);g.gain.exponentialRampToValueAtTime(.001,t+d+.025);n.connect(f).connect(g).connect(o)});return}
  if(type==='clave'){const x=ctx.createOscillator(),g=ctx.createGain();x.frequency.value=2500;g.gain.setValueAtTime(.35*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.05);x.connect(g).connect(o);x.start(t);x.stop(t+.06);return}
  const x=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();x.type='square';x.frequency.value=1100;f.type='bandpass';f.frequency.value=2000;f.Q.value=4;g.gain.setValueAtTime(.5*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.04);x.connect(f).connect(g).connect(o);x.start(t);x.stop(t+.06)}

