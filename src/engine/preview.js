import { LATE } from '../app/late.js';
import { CFG, DEF_SCENES, STYLES, TYPES, bpm, chord, ctx, emit, fin, fxHit, getPat, initAudio, kick, lead, loadBuf, makeIR, noise, noiseBuf, novoLane, out, playCol, stopLaneSrc } from '../app/all.js';
// ----- prévia de cada gênero: 8 compassos com os próprios loops do gênero (sem One Shots) -----
// partes de 2 compassos: intro -> groove -> break (riser) -> pico (impacto), depois um golpe final
const PV_SECTIONS=[0,1,3,2];
const PV={vol:.6,k:null,timer:null,next:0,step:0,bar:0,lanes:null,out:null,dk:null,bpm0:0,endAt:0,done:null};
function pvDuck(t,v){if(!PV.dk)return;const sc=STYLES[PV.k].snd.sc!=null?STYLES[PV.k].snd.sc:.5,g=PV.dk.gain,depth=Math.min(.92,sc*.9*Math.min(1,v));
  g.setTargetAtTime(1-depth,t,.003);g.setTargetAtTime(1,t+.025,60/bpm*.16)}
function pvSection(i){const G=STYLES[PV.k]&&STYLES[PV.k].scenes;if(G)return Object.assign({},G[i]);const sc=DEF_SCENES[PV_SECTIONS[i]],r=Object.assign({},sc);if(i===3)r.fx=1;return r}
function pvTick(){
  const S=STYLES[PV.k];
  if(PV.endAt){if(ctx.currentTime>PV.endAt)pvStop(true);return}
  while(PV.next<ctx.currentTime+.12&&PV.timer){
    const sd=60/bpm/4,t=PV.next,sw=(PV.step%2===1&&CFG.swing)?(S.swing||0)*sd:0;
    if(PV.bar>=PV.bars){ // golpe final, cauda e fim
      const L=PV.lanes,g=PV.out.gain;
      if(PV.endHit){kick(t,L.kick.gain,1);pvDuck(t,1);fxHit(t,3,2.4,L.fx.gain,1);g.setValueAtTime(PV.vol,t+.5);g.linearRampToValueAtTime(.0001,t+2.6);PV.endAt=t+2.7}
      else{g.setValueAtTime(PV.vol,t);g.linearRampToValueAtTime(.0001,t+.5);PV.endAt=t+.6}
      return;
    }
    const sec=PV.plan?PV.plan(PV.bar):pvSection(PV.bar>>1),pos=(PV.bar%4)*16+PV.step;
    for(const k in sec){let c,pat;if(PV.cl){c=PV.cl[k];pat=c?getPat(c,sec[k]):null}else{pat=S.p[k]&&S.p[k][sec[k]];c=PV.lanes[k]}if(pat&&c)playCol(c,PV.step,t+sw,{pat,pos})}
    PV.next+=sd;PV.step++;if(PV.step===16){PV.step=0;PV.bar++}
  }
}
function pvStart(k,onDone,opt){
  pvStop(false);initAudio();opt=opt||{};
  PV.plan=opt.plan||null;PV.bars=opt.bars||8;PV.endHit=opt.end!==false;PV.base=opt.vol||.6;PV.vol=Math.max(.0001,PV.base*CFG.pvol);
  PV.k=k;PV.done=onDone;PV.bpm0=bpm;LATE.bpm=opt.bpm||STYLES[k].bpm;PV.cl=null;
  PV.out=ctx.createGain();PV.out.gain.value=.0001;PV.out.connect(out);
  const rv=ctx.createConvolver();rv.buffer=makeIR(1.6,.35);const rg=ctx.createGain();rg.gain.value=.16;rv.connect(rg);rg.connect(PV.out);
  PV.dk=ctx.createGain();PV.dk.connect(PV.out);PV.dk.connect(rv);
  PV.lanes={};Object.keys(TYPES).forEach(t=>{const T=TYPES[t],g=ctx.createGain();g.gain.value=T.vol;g.connect(t==='kick'?PV.out:PV.dk);
    PV.lanes[t]={key:t,type:t,kind:T.kind||'drum',gain:g,vol:T.vol,lastM:null,muted:false}});
  if(opt.custom){PV.cl={};opt.custom.forEach(c=>{const g=ctx.createGain();g.gain.value=c.muted?0:c.vol;g.connect(c.type==='kick'?PV.out:PV.dk);c.gain=g;PV.cl[c.key]=c})}
  const t0=ctx.currentTime+.08;PV.out.gain.setValueAtTime(.0001,ctx.currentTime);PV.out.gain.linearRampToValueAtTime(PV.vol,t0+.02);
  PV.next=t0;PV.step=0;PV.bar=0;PV.endAt=0;PV.timer=setInterval(pvTick,25);pvTick();
}
function pvStop(natural){
  if(!PV.timer&&!PV.k)return;
  clearInterval(PV.timer);PV.timer=null;
  if(PV.out&&ctx){const o=PV.out,n=ctx.currentTime;try{o.gain.cancelScheduledValues(n);o.gain.setValueAtTime(o.gain.value,n);o.gain.linearRampToValueAtTime(.0001,n+.25)}catch(e){}setTimeout(()=>{try{o.disconnect()}catch(e){}},600)}
  if(PV.bpm0){LATE.bpm=PV.bpm0;PV.bpm0=0}
  if(PV.cl)Object.values(PV.cl).forEach(c=>stopLaneSrc(c));PV.k=null;PV.out=null;PV.dk=null;PV.lanes=null;PV.cl=null;
  const d=PV.done;PV.done=null;if(natural&&d)d();
}
// prévia pedida pela tela (protocolo preview.start): o roteiro vem como dados (o que toca em cada compasso) e as
// linhas de um gênero do usuário vêm descritas; os sons gravados dessas linhas são carregados antes de começar
let pvTok=0; // preview.stop cancela a prévia que ainda está carregando sons
function previewStart(c){
  const tok=pvTok,opt={};
  if(c.plan)opt.plan=b=>c.plan[b];if(c.bars)opt.bars=c.bars;if(c.end===false)opt.end=false;if(c.volume)opt.vol=c.volume;if(c.bpm)opt.bpm=c.bpm;
  const done=()=>emit({type:'preview.state',id:c.id,playing:false});
  if(!c.lanes){pvStart(c.genre,done,opt);return}
  initAudio();
  const lanes=c.lanes.map(d=>{const l=novoLane(d.def);l.nvk=d.nvk;l.upats=d.pats;if(d.mix){l.vol=+d.mix.vol;l.muted=!!d.mix.muted}return l});
  Promise.all(lanes.filter(l=>l.smp).map(l=>loadBuf(l.smp))).then(()=>{if(tok!==pvTok)return;opt.custom=lanes;pvStart(c.genre,done,opt)});
}
function previewStop(){pvTok++;pvStop(false)}
function previewVolume(v){if(PV.out&&PV.timer)PV.out.gain.value=Math.max(.0001,(PV.base||.6)*v)}
// som ao entrar num canal (desligado desde a 1.7.x: a função sai logo na primeira linha)
function genreSting(k){
  return; // sem som nas animações de entrada
  if(!CFG.sting||!ctx||!noiseBuf)return;
  const g=STYLES[k]&&!STYLES[k].novo?k:'house',S=STYLES[g],t=ctx.currentTime+.02,o=ctx.createGain();o.gain.value=.5;o.connect(out);
  const n=noise(t,.34),f=ctx.createBiquadFilter(),ng=ctx.createGain();f.type='bandpass';f.Q.value=2.2;
  f.frequency.setValueAtTime(320,t);f.frequency.exponentialRampToValueAtTime(7500,t+.3);
  ng.gain.setValueAtTime(.0001,t);ng.gain.exponentialRampToValueAtTime(.32,t+.27);ng.gain.linearRampToValueAtTime(.0001,t+.31);n.connect(f);f.connect(ng);ng.connect(o);
  const th=t+.32,b0=bpm;LATE.bpm=S.bpm;LATE.LSND=S.snd;
  try{kick(th,o,1);
    const cp=(S.p.chord||[]).find(Boolean);let ch=null;
    if(cp&&Array.isArray(cp.data)){const n0=cp.data.find(x=>Array.isArray(x)&&Array.isArray(x[1]));if(n0)ch=n0[1]}
    if(k==='novo'){[0,4,7,12].forEach((iv,j)=>lead(th+j*.07,69+iv,.12,o,.6))}
    else if(ch)chord(th,ch,.34,o,cp.syn);
  }catch(e){}finally{LATE.LSND=null;LATE.bpm=b0}
  setTimeout(()=>{try{o.disconnect()}catch(e){}},3000);
}
// chiado de TV na tela inicial (sem uso hoje)
function staticBurst(){
  if(!ctx||!noiseBuf)return;const t=ctx.currentTime,n=noise(t,.4),f=ctx.createBiquadFilter(),g=ctx.createGain();
  f.type='bandpass';f.frequency.value=3200;f.Q.value=.6;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.09,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.38);
  n.connect(f);f.connect(g);g.connect(fin);
}
export { PV, genreSting, previewStart, previewStop, previewVolume, pvDuck };
