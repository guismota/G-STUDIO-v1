import { LATE, late } from '../app/late.js';
import { ALL, bpm, ctx, mix, softCurve } from '../app/all.js';
late({get saveFx(){return saveFx},set saveFx(v){saveFx=v}});
// ---------- Efeitos (plugins) ----------
const FXDEF={
 rev:{name:'Reverb',tag:'Rev',styles:['Room','Hall','Plate'],big:{k:'mix',l:'Mix'},small:[{k:'decay',l:'Decay'},{k:'tone',l:'Tone'}],def:{mix:.35,decay:.5,tone:.6}},
 dly:{name:'Delay',tag:'Dly',styles:['Eco','Ping-pong','Tape'],big:{k:'mix',l:'Mix'},small:[{k:'fb',l:'Feedback'},{k:'tone',l:'Tone'}],def:{mix:.35,fb:.4,tone:.6}},
 ech:{name:'Echo',tag:'Ech',styles:['Beat','Dub','Space'],big:{k:'mix',l:'Mix'},small:[{k:'beat',l:'Beat'},{k:'fb',l:'Feedback'}],def:{mix:.5,beat:.6,fb:.55}},
 dst:{name:'Distorção',tag:'Dist',styles:['Drive','Fuzz','Crush'],big:{k:'drive',l:'Drive'},small:[{k:'tone',l:'Tone'},{k:'mix',l:'Mix'}],def:{drive:.4,tone:.6,mix:1}},
 flt:{name:'Filter',tag:'Flt',styles:['Low-pass','High-pass','Band-pass'],big:{k:'cut',l:'Cutoff'},small:[{k:'res',l:'Resonance'},{k:'lfo',l:'LFO'}],def:{cut:.6,res:.25,lfo:0}}
};
const FXKEYS=Object.keys(FXDEF);
const FX={};
(function loadFx(){
  let j=null;try{j=JSON.parse(localStorage.getItem('gstudio_fx'))}catch(e){}
  FXKEYS.forEach(k=>{
    const d=FXDEF[k],s=(j&&typeof j[k]==='object'&&j[k])||{},w=(s.win&&typeof s.win==='object')?s.win:{};
    const p=Object.assign({},d.def);
    if(s.p&&typeof s.p==='object')Object.keys(p).forEach(n=>{const v=+s.p[n];if(Number.isFinite(v)&&v>=0&&v<=1)p[n]=v});
    const num=v=>Number.isFinite(+v)&&v!==null?+v:null;
    FX[k]={on:s.on!==false,style:[0,1,2].includes(s.style)?s.style:0,p,
      links:Array.isArray(s.links)?s.links.filter(x=>typeof x==='string'):[],master:!!s.master,mode:s.mode==='xpad'?'xpad':'knob',xt:false,xb:null,
      win:{open:false,x:num(w.x),y:num(w.y),w:num(w.w)},el:null,lnk:false};
  });
})();
let fxSaveT=null;
function saveFx(){
  clearTimeout(fxSaveT);
  fxSaveT=setTimeout(()=>{
    const o={};FXKEYS.forEach(k=>{const F=FX[k];o[k]={on:F.on,style:F.style,p:F.p,links:F.links,master:F.master,mode:F.mode,win:{x:F.win.x,y:F.win.y,w:F.win.w}}});
    try{localStorage.setItem('gstudio_fx',JSON.stringify(o))}catch(e){}
  },250);
}
// efeito ativo: ligado no botão ou segurado no X-Pad
const fxActive=k=>FX[k].on||FX[k].xt;
const fxOn=(k,c)=>fxActive(k)&&!FX[k].master&&FX[k].links.includes(c.key);
// na master: escolhido no Link, ou X-Pad tocado sem nenhum instrumento ligado
const mastOn=k=>fxActive(k)&&(FX[k].master||(FX[k].xt&&!FX[k].links.length));
const toneHz=v=>600*Math.pow(20,v);

// --- áudio: reverb e delay são "sends"; distorção é inserida em cada linha
const FXA={rev:{},dly:{},ech:{},flt:{}};
const MA={};
const REVST=[{t:1,pre:.006,damp:.55},{t:2.6,pre:.022,damp:.35},{t:1.8,pre:.001,damp:.12}];
const DLYST=[{b:.75,lbl:'1/8 pontuado'},{b:.5,pp:true,lbl:'1/8 ping-pong'},{b:1,tape:true,lbl:'1/4 fita'}];
const DST_PRE=[12,30,8],DST_OUT=[.6,.4,.55];
const revLen=()=>REVST[FX.rev.style].t*(.35+FX.rev.p.decay*1.3);
const dlyTime=()=>Math.min(1.9,(FX.dly.xb||DLYST[FX.dly.style].b)*60/bpm);
const ECHB=[.125,.25,.5,.75,1,2],ECHL=['1/8','1/4','1/2','3/4','1','2'];
const echIdx=()=>Math.round(FX.ech.p.beat*(ECHB.length-1));
const echTime=()=>Math.min(3.9,ECHB[echIdx()]*60/bpm);
const DCACHE={};
function dstCurve(){
  const s=FX.dst.style;if(DCACHE[s])return DCACHE[s];
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
  const E=FXA.ech,F=FX.ech;if(!ctx||!E.d)return;const t=ctx.currentTime,st=F.style;
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
  const t=ctx.currentTime,D=FX.dst,on=mastOn('dst');
  MA.dPre.gain.setTargetAtTime(1+D.p.drive*DST_PRE[D.style],t,.02);MA.dTone.frequency.setTargetAtTime(toneHz(D.p.tone),t,.02);
  MA.dDry.gain.setTargetAtTime(on?1-D.p.mix:1,t,.02);MA.dWet.gain.setTargetAtTime(on?D.p.mix*DST_OUT[D.style]:0,t,.02);
  const Fl=FX.flt,fo=mastOn('flt');
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
  cv.buffer=makeIR(revLen(),REVST[FX.rev.style].damp);
  R.pre.connect(cv);cv.connect(R.tone);
  const old=R.conv;R.conv=cv;
  if(old)setTimeout(()=>{try{R.pre.disconnect(old)}catch(e){}try{old.disconnect()}catch(e){}},60);
}
let irT=null;
function updRevIRSoon(){clearTimeout(irT);irT=setTimeout(updRevIR,140)}
function updRev(){
  if(!ctx)return;const R=FXA.rev,F=FX.rev,t=ctx.currentTime;
  R.pre.delayTime.setTargetAtTime(REVST[F.style].pre,t,.02);
  R.tone.frequency.setTargetAtTime(toneHz(F.p.tone),t,.02);
  R.ret.gain.setTargetAtTime(fxActive('rev')?F.p.mix*5:0,t,fxActive('rev')?.03:.45);
}
function panNode(v){if(ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=v;return p}return ctx.createGain()}
function buildDelayInner(){
  const D=FXA.dly,st=DLYST[FX.dly.style],t=dlyTime(),N=[];
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
  if(!ctx)return;const D=FXA.dly,F=FX.dly,t=ctx.currentTime;
  D.fb.gain.setTargetAtTime(Math.min(.88,F.p.fb*.9),t,.02);
  D.lp.frequency.setTargetAtTime(toneHz(F.p.tone)*(DLYST[F.style].tape?.35:1),t,.02);
  D.ret.gain.setTargetAtTime(fxActive('dly')?F.p.mix*1.1:0,t,fxActive('dly')?.03:.7);
  const dt=dlyTime();D.times.forEach(d=>d.delayTime.setTargetAtTime(dt,t,.03));
}
function makeShaper(c){
  if(c.shaper){try{c.dPre.disconnect()}catch(e){}try{c.shaper.disconnect()}catch(e){}}
  c.shaper=ctx.createWaveShaper();c.shaper.curve=dstCurve();c.shaper.oversample=FX.dst.style===2?'none':'2x';
  c.dPre.connect(c.shaper);c.shaper.connect(c.dTone);
}
function routeLane(c){
  if(!ctx||!c.gain)return;
  const t=ctx.currentTime,D=FX.dst,on=fxOn('dst',c);
  c.dPre.gain.setTargetAtTime(1+D.p.drive*DST_PRE[D.style],t,.02);
  c.dTone.frequency.setTargetAtTime(toneHz(D.p.tone),t,.02);
  c.dDry.gain.setTargetAtTime(on?1-D.p.mix:1,t,.02);
  c.dWet.gain.setTargetAtTime(on?D.p.mix*DST_OUT[D.style]:0,t,.02);
  const Fl=FX.flt,fo=fxOn('flt',c);
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
function fltHz(){const F=FX.flt,v=F.p.cut;return F.style===0?60*Math.pow(300,v):F.style===1?20*Math.pow(400,v):150*Math.pow(40,v)}
function fltQ(){const F=FX.flt;return F.style===2?1+F.p.res*9:.7+F.p.res*14}
const fmtHz=h=>h<1000?Math.round(h)+' Hz':(h/1000).toFixed(1)+' kHz';
function updFltLfo(){if(!ctx||!FXA.flt.lfo)return;const t=ctx.currentTime;FXA.flt.lfo.frequency.setTargetAtTime(bpm/120,t,.05);FXA.flt.depth.gain.setTargetAtTime(fxActive('flt')?FX.flt.p.lfo*2400:0,t,.05)}

export { DLYST, ECHB, ECHL, FX, FXA, FXDEF, FXKEYS, MA, applyFx, buildDelayInner, buildFxAudio, buildMaster, dlyTime, dstCurve, echIdx, echTime, fltHz, fmtHz, fxActive, fxOn, makeIR, makeShaper, revLen, routeAll, routeLane, saveFx, updDly, updEch, updFltLfo, updRev, updRevIR };
