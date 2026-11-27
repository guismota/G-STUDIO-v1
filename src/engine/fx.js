import { ALL, DLYST, ECHB, REVST, bpm, ctx, ensureGain, mix, softCurve } from '../app/all.js';
// ---------- Efeitos (plugins) ----------
// efeito ativo: ligado no botão ou segurado no X-Pad
const fxActive=k=>FXE[k].on||FXE[k].xt;
const fxOn=(k,c)=>fxActive(k)&&!FXE[k].master&&FXE[k].links.includes(c.key);
// na master: escolhido no Link, ou X-Pad tocado sem nenhum instrumento ligado
const mastOn=k=>fxActive(k)&&(FXE[k].master||(FXE[k].xt&&!FXE[k].links.length));
const toneHz=v=>600*Math.pow(20,v);

// cópia do estado dos efeitos que é do MOTOR: a tela manda tudo em fx.sync e cada mudança em fx.set
const FXE={};
function fxApply(c){
  if(c.type==='fx.sync'){Object.keys(c.fx).forEach(k=>{FXE[k]=JSON.parse(JSON.stringify(c.fx[k]))});
    if(!ctx)return;
    if(c.rebuild==='project'){ALL().forEach(ensureGain);updRevIR();updRev();buildDelayInner();updDly();updEch();ALL().forEach(l=>{if(l.gain)makeShaper(l)});if(MA.sh)MA.sh.curve=dstCurve();routeAll()}
    else if(c.rebuild==='undo'){ALL().forEach(ensureGain);updRev();updDly();updEch();updFltLfo();routeAll()}
    return}
  const k=c.fx;FXE[k]=Object.assign(FXE[k]||{},JSON.parse(JSON.stringify(c.state)));
  switch(c.action){
    case 'param':applyFx(k,c.param);break;                   // um parâmetro (knob, X-Pad)
    case 'power':applyFx(k);routeAll();break;                // ligado/desligado, X-Pad tocado ou solto
    case 'route':routeAll();break;                           // ligações com as linhas, master
    case 'routeLane':{const l=ALL().find(x=>x.key===c.lane);if(l)routeLane(l);break}
    case 'xbeat':updDly();break;                             // divisão do delay escolhida no X-Pad
    case 'style':if(ctx){if(k==='rev'){updRevIR();updRev()}else if(k==='dly'){buildDelayInner();updDly()}
      else if(k==='dst'){ALL().forEach(l=>{if(l.gain)makeShaper(l)});if(MA.sh)MA.sh.curve=dstCurve();routeAll()}
      else if(k==='ech')updEch();else routeAll()}break;
  }
}
// --- áudio: reverb e delay são "sends"; distorção é inserida em cada linha
const FXA={rev:{},dly:{},ech:{},flt:{}};
const MA={};
const DST_PRE=[12,30,8],DST_OUT=[.6,.4,.55];
const revLen=()=>REVST[FXE.rev.style].t*(.35+FXE.rev.p.decay*1.3);
const dlyTime=()=>Math.min(1.9,(FXE.dly.xb||DLYST[FXE.dly.style].b)*60/bpm);
const echIdx=()=>Math.round(FXE.ech.p.beat*(ECHB.length-1));
const echTime=()=>Math.min(3.9,ECHB[echIdx()]*60/bpm);
const DCACHE={};
function dstCurve(){
  const s=FXE.dst.style;if(DCACHE[s])return DCACHE[s];
  const n=2048,c=new Float32Array(n);
  for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=s===0?Math.tanh(2.5*x)/Math.tanh(2.5):(s===1?Math.max(-1,Math.min(.85,x*3)):Math.round(x*5)/5)}
  return DCACHE[s]=c;
}
function buildFxAudio(){
  FXA.flt.lfo=ctx.createOscillator();FXA.flt.depth=ctx.createGain();FXA.flt.depth.gain.value=0;FXA.flt.lfo.connect(FXA.flt.depth);FXA.flt.lfo.start();updFltLfo();
  const R=FXA.rev;
  R.in=ctx.createGain();R.pre=ctx.createDelay(.5);R.tone=ctx.createBiquadFilter();R.tone.type='lowpass';R.ret=ctx.createGain();R.ret.gain.value=0;
  R.in.connect(R.pre);R.tone.connect(R.ret);R.ret.connect(MA.sum);R.conv=null;
  updRevIR();updRev();
  const D=FXA.dly;
  D.in=ctx.createGain();D.out=ctx.createGain();D.ret=ctx.createGain();D.ret.gain.value=0;
  D.out.connect(D.ret);D.ret.connect(MA.sum);D.nodes=[];D.times=[];
  buildDelayInner();updDly();
  buildEcho();
}
// echo de DJ: repetições no tempo que vão escurecendo
function buildEcho(){
  const E=FXA.ech;
  E.in=ctx.createGain();E.d=ctx.createDelay(4);E.hp=ctx.createBiquadFilter();E.hp.type='highpass';E.lp=ctx.createBiquadFilter();E.lp.type='lowpass';
  E.sat=ctx.createWaveShaper();E.fb=ctx.createGain();E.fb.gain.value=0;E.out=ctx.createGain();E.ret=ctx.createGain();E.ret.gain.value=0;
  E.wob=ctx.createOscillator();E.wg=ctx.createGain();E.wg.gain.value=0;E.wob.frequency.value=.55;E.wob.connect(E.wg);E.wg.connect(E.d.delayTime);E.wob.start();
  E.sp=ctx.createConvolver();E.sp.buffer=makeIR(1.4,.3);E.spg=ctx.createGain();E.spg.gain.value=0;
  E.in.connect(E.d);E.d.connect(E.hp);E.hp.connect(E.lp);E.lp.connect(E.sat);E.sat.connect(E.out);E.out.connect(E.fb);E.fb.connect(E.d);
  E.out.connect(E.ret);E.out.connect(E.spg);E.spg.connect(E.sp);E.sp.connect(E.ret);E.ret.connect(MA.sum);
  updEch();
}
function updEch(){
  const E=FXA.ech,F=FXE.ech;if(!ctx||!E.d)return;const t=ctx.currentTime,st=F.style;
  E.d.delayTime.setTargetAtTime(echTime(),t,.03);
  E.hp.frequency.setTargetAtTime(st===1?380:140,t,.02);E.lp.frequency.setTargetAtTime(st===1?2300:st===2?4200:6500,t,.02);
  E.sat.curve=st===1?softCurve(2):null;E.wg.gain.setTargetAtTime(st===1?.0018:0,t,.05);E.spg.gain.setTargetAtTime(st===2?.6:0,t,.05);
  E.fb.gain.setTargetAtTime(Math.min(.93,F.p.fb*.97),t,.02);
  E.ret.gain.setTargetAtTime(fxActive('ech')?F.p.mix*1.25:0,t,fxActive('ech')?.03:.9);
}
function buildMaster(){
  MA.dDry=ctx.createGain();MA.dPre=ctx.createGain();MA.sh=ctx.createWaveShaper();MA.sh.curve=dstCurve();MA.dTone=ctx.createBiquadFilter();MA.dTone.type='lowpass';MA.dWet=ctx.createGain();MA.dWet.gain.value=0;
  MA.mid=ctx.createGain();MA.fDry=ctx.createGain();MA.flt=ctx.createBiquadFilter();MA.fWet=ctx.createGain();MA.fWet.gain.value=0;MA.tap=ctx.createGain();
  mix.connect(MA.dDry);MA.dDry.connect(MA.mid);mix.connect(MA.dPre);MA.dPre.connect(MA.sh);MA.sh.connect(MA.dTone);MA.dTone.connect(MA.dWet);MA.dWet.connect(MA.mid);
  MA.mid.connect(MA.fDry);MA.fDry.connect(MA.tap);MA.mid.connect(MA.flt);MA.flt.connect(MA.fWet);MA.fWet.connect(MA.tap);
  FXA.flt.depth.connect(MA.flt.detune);MA.tap.connect(MA.sum);
  MA.sRev=ctx.createGain();MA.sDly=ctx.createGain();MA.sEch=ctx.createGain();[MA.sRev,MA.sDly,MA.sEch].forEach(g=>{g.gain.value=0;MA.tap.connect(g)});
  MA.sRev.connect(FXA.rev.in);MA.sDly.connect(FXA.dly.in);MA.sEch.connect(FXA.ech.in);
  routeMaster();
}
function routeMaster(){
  if(!ctx||!MA.mid)return;
  const t=ctx.currentTime,D=FXE.dst,on=mastOn('dst');
  MA.dPre.gain.setTargetAtTime(1+D.p.drive*DST_PRE[D.style],t,.02);MA.dTone.frequency.setTargetAtTime(toneHz(D.p.tone),t,.02);
  MA.dDry.gain.setTargetAtTime(on?1-D.p.mix:1,t,.02);MA.dWet.gain.setTargetAtTime(on?D.p.mix*DST_OUT[D.style]:0,t,.02);
  const Fl=FXE.flt,fo=mastOn('flt');
  MA.flt.type=FLT_TYPE[Fl.style];MA.flt.frequency.setTargetAtTime(fltHz(),t,.02);MA.flt.Q.setTargetAtTime(fltQ(),t,.02);
  MA.fDry.gain.setTargetAtTime(fo?0:1,t,.02);MA.fWet.gain.setTargetAtTime(fo?(Fl.style===2?1.8:1):0,t,.02);
  MA.sRev.gain.setTargetAtTime(mastOn('rev')?1:0,t,.02);MA.sDly.gain.setTargetAtTime(mastOn('dly')?1:0,t,.02);MA.sEch.gain.setTargetAtTime(mastOn('ech')?1:0,t,.02);
}
function makeIR(len,damp){
  const sr=ctx.sampleRate,n=Math.max(64,Math.floor(sr*len)),b=ctx.createBuffer(2,n,sr),fade=Math.min(n,Math.floor(sr*.004));
  for(let ch=0;ch<2;ch++){
    const d=b.getChannelData(ch);let y=0;
    for(let i=0;i<n;i++){
      const p=i/n,x=(Math.random()*2-1)*Math.exp(-6.9*p);
      y+=(x-y)*Math.max(.04,1-damp*(.2+.8*p));
      d[i]=i<fade?y*i/fade:y;
    }
  }
  return b;
}
function updRevIR(){
  if(!ctx)return;
  const R=FXA.rev,cv=ctx.createConvolver();
  cv.buffer=makeIR(revLen(),REVST[FXE.rev.style].damp);
  R.pre.connect(cv);cv.connect(R.tone);
  const old=R.conv;R.conv=cv;
  if(old)setTimeout(()=>{try{R.pre.disconnect(old)}catch(e){}try{old.disconnect()}catch(e){}},60);
}
let irT=null;
function updRevIRSoon(){clearTimeout(irT);irT=setTimeout(updRevIR,140)}
function updRev(){
  if(!ctx)return;const R=FXA.rev,F=FXE.rev,t=ctx.currentTime;
  R.pre.delayTime.setTargetAtTime(REVST[F.style].pre,t,.02);
  R.tone.frequency.setTargetAtTime(toneHz(F.p.tone),t,.02);
  R.ret.gain.setTargetAtTime(fxActive('rev')?F.p.mix*5:0,t,fxActive('rev')?.03:.45);
}
function panNode(v){if(ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=v;return p}return ctx.createGain()}
function buildDelayInner(){
  const D=FXA.dly,st=DLYST[FXE.dly.style],t=dlyTime(),N=[];
  D.nodes.forEach(n=>{try{if(n.stop)n.stop()}catch(e){}try{n.disconnect()}catch(e){}});
  try{D.in.disconnect()}catch(e){}
  const add=n=>{N.push(n);return n};
  const lp=add(ctx.createBiquadFilter());lp.type='lowpass';
  const fb=add(ctx.createGain());fb.gain.value=0;
  if(st.pp){
    const dL=add(ctx.createDelay(2)),dR=add(ctx.createDelay(2)),pL=add(panNode(-.9)),pR=add(panNode(.9));
    dL.delayTime.value=t;dR.delayTime.value=t;
    D.in.connect(dL);dL.connect(pL);pL.connect(D.out);
    dL.connect(dR);dR.connect(lp);lp.connect(pR);pR.connect(D.out);
    lp.connect(fb);fb.connect(dL);
    D.times=[dL,dR];
  }else{
    const d=add(ctx.createDelay(2));d.delayTime.value=t;
    D.in.connect(d);d.connect(lp);lp.connect(D.out);lp.connect(fb);fb.connect(d);
    D.times=[d];
    if(st.tape){
      const o=add(ctx.createOscillator()),og=add(ctx.createGain());
      o.frequency.value=.7;og.gain.value=.0025;o.connect(og);og.connect(d.delayTime);o.start();
    }
  }
  D.nodes=N;D.lp=lp;D.fb=fb;
}
function updDly(){
  if(!ctx)return;const D=FXA.dly,F=FXE.dly,t=ctx.currentTime;
  D.fb.gain.setTargetAtTime(Math.min(.88,F.p.fb*.9),t,.02);
  D.lp.frequency.setTargetAtTime(toneHz(F.p.tone)*(DLYST[F.style].tape?.35:1),t,.02);
  D.ret.gain.setTargetAtTime(fxActive('dly')?F.p.mix*1.1:0,t,fxActive('dly')?.03:.7);
  const dt=dlyTime();D.times.forEach(d=>d.delayTime.setTargetAtTime(dt,t,.03));
}
function makeShaper(c){
  if(c.shaper){try{c.dPre.disconnect()}catch(e){}try{c.shaper.disconnect()}catch(e){}}
  c.shaper=ctx.createWaveShaper();c.shaper.curve=dstCurve();c.shaper.oversample=FXE.dst.style===2?'none':'2x';
  c.dPre.connect(c.shaper);c.shaper.connect(c.dTone);
}
function routeLane(c){
  if(!ctx||!c.gain)return;
  const t=ctx.currentTime,D=FXE.dst,on=fxOn('dst',c);
  c.dPre.gain.setTargetAtTime(1+D.p.drive*DST_PRE[D.style],t,.02);
  c.dTone.frequency.setTargetAtTime(toneHz(D.p.tone),t,.02);
  c.dDry.gain.setTargetAtTime(on?1-D.p.mix:1,t,.02);
  c.dWet.gain.setTargetAtTime(on?D.p.mix*DST_OUT[D.style]:0,t,.02);
  const Fl=FXE.flt,fo=fxOn('flt',c);
  c.flt.type=FLT_TYPE[Fl.style];c.flt.frequency.setTargetAtTime(fltHz(),t,.02);c.flt.Q.setTargetAtTime(fltQ(),t,.02);
  c.fDry.gain.setTargetAtTime(fo?0:1,t,.02);c.fWet.gain.setTargetAtTime(fo?(Fl.style===2?1.8:1):0,t,.02);
  c.sRev.gain.setTargetAtTime(fxOn('rev',c)?1:0,t,.02);
  c.sDly.gain.setTargetAtTime(fxOn('dly',c)?1:0,t,.02);
  c.sEch.gain.setTargetAtTime(fxOn('ech',c)?1:0,t,.02);
}
const routeAll=()=>{ALL().forEach(routeLane);routeMaster()};
function applyFx(k,param){
  if(ctx){
    if(k==='rev'){if(param==='decay')updRevIRSoon();updRev()}
    else if(k==='dly')updDly();
    else if(k==='ech')updEch();
    else{if(k==='flt')updFltLfo();routeAll()}
  }
}
// filtro: corte por estilo, ressonância e LFO no tempo da música
const FLT_TYPE=['lowpass','highpass','bandpass'];
function fltHz(){const F=FXE.flt,v=F.p.cut;return F.style===0?60*Math.pow(300,v):F.style===1?20*Math.pow(400,v):150*Math.pow(40,v)}
function fltQ(){const F=FXE.flt;return F.style===2?1+F.p.res*9:.7+F.p.res*14}
function updFltLfo(){if(!ctx||!FXA.flt.lfo)return;const t=ctx.currentTime;FXA.flt.lfo.frequency.setTargetAtTime(bpm/120,t,.05);FXA.flt.depth.gain.setTargetAtTime(fxActive('flt')?FXE.flt.p.lfo*2400:0,t,.05)}

export { FXA, MA, buildFxAudio, buildMaster, fxApply, makeIR, makeShaper, routeAll, routeLane, updDly, updEch, updFltLfo };
