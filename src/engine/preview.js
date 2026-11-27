import { LATE, late } from '../app/late.js';
import { $, CFG, CHN, DEF_SCENES, GENRES, STYLES, TYPES, bpm, ctx, enterGenre, fxHit, genreSting, getPat, initAudio, kick, makeIR, out, pageWipe, playCol, stopLaneSrc } from '../app/all.js';
late({get prevOn(){return prevOn},set prevOn(v){prevOn=v}});
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
const PREVIEW={};let prevOn=null;
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPreview()});
GENRES.forEach(g=>{if(STYLES[g.k])PREVIEW[g.k]=b=>{pvStart(g.k,()=>{if(prevOn&&prevOn.b===b){b.classList.remove('playing');prevOn=null}});return()=>pvStop(false)}});
function homeToast(m){let t=$('#htoast');if(!t){t=document.createElement('div');t.id='htoast';$('#home').appendChild(t)}
  t.textContent=m;t.classList.remove('show');void t.offsetWidth;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2200)}
function stopPreview(){if(!prevOn)return;prevOn.b.classList.remove('playing');if(prevOn.stop)prevOn.stop();prevOn=null}
function togglePreview(b,k){
  const was=prevOn&&prevOn.b===b;stopPreview();if(was)return;
  if(!PREVIEW[k]){b.classList.add('playing');prevOn={b};setTimeout(()=>{if(prevOn&&prevOn.b===b)stopPreview()},1400);homeToast('Prévia no forno. Já já sai');return}
  initAudio();b.classList.add('playing');prevOn={b};prevOn.stop=PREVIEW[k](b);
}
let tuning=false;
function tuneInX(b,fn,w,sk){if(tuning)return;tuning=true;stopPreview();initAudio();genreSting(sk||'novo');b&&b.classList.add('tune');pageWipe(w||{c:'#EDEDED',ch:b&&b.querySelector('.ch')?b.querySelector('.ch').textContent:'',nm:'Criar <em>novo</em>',art:true},()=>{b&&b.classList.remove('tune');tuning=false;fn()})}
function tuneIn(b,k){
  if(tuning)return;tuning=true;stopPreview();initAudio();genreSting(k);
  b.classList.add('tune');
  const G=GENRES.find(g=>g.k===k),art=!!(G&&G.artist),afro=!!(G&&G.theme==='afro'),vice=!!(G&&G.theme==='vice'),cum=!!(G&&G.theme==='cumbia');
  pageWipe({c:cum?'#FF4B1F':vice?'#FF5E8A':afro?'#FF6B2C':art?'#B026FF':'#FFE600',ink:cum?'#111':art?'#fff':'#000',ch:CHN(GENRES.indexOf(G)),nm:art?(G.html?G.html.replace(/<\/?span>/g,''):'After<em>party</em>'):STYLES[k].name,art,cls:cum?'cumbia':vice?'vice':''},()=>{b.classList.remove('tune');tuning=false;enterGenre(k)});
}
export { PREVIEW, PV, prevOn, pvDuck, pvStart, pvStop, stopPreview, togglePreview, tuneIn, tuneInX };
