import { LATE } from '../app/late.js';
import { $, CFG, FX, FXKEYS, LASTK, MAIN, REC, RL, SC, STYLES, bpm, buildHome, chord, closeFx, closeOs, closeRmx, closeRoll, ctx, enterNovo, histPush, initAudio, kick, lead, maybeTour, noise, noiseBuf, out, playing, powerOnHome, recStop, reduceMotion, saveNovo, screen, setScreen, setStyle, stopTransport, szClose, undoReset } from '../app/all.js';
// troca de página: uma faixa na cor do canal atravessa a tela
function pageWipe(o,mid){
  const w=$('#wipe');if(reduceMotion()||!w){mid();return}
  w.style.setProperty('--wc',o.c);w.style.setProperty('--wi',o.ink||'#000');
  w.querySelector('.wch').textContent=o.ch||'';w.querySelector('.wnm').innerHTML=o.nm||'';
  clearTimeout(w._t1);clearTimeout(w._t2);w.className='on in'+(o.art?' art':'')+(o.cls?' '+o.cls:'');
  w._t1=setTimeout(()=>{try{mid()}finally{w.className='on out'+(o.art?' art':'')+(o.cls?' '+o.cls:'');w._t2=setTimeout(()=>{w.className=''},340)}},330);
}
// som ao entrar num canal: subida de fita e um golpe do próprio gênero (kick + acorde)
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
function enterGenre(k){
  if(k==='novo'){enterNovo();return}
  try{localStorage.setItem(LASTK,k)}catch(e){}histPush(k);
  if(screen==='novo'){saveNovo();LATE.screen='main';LATE.cols=MAIN;LATE.scenes=SC.main}document.body.classList.remove('novo','ugen');
  initAudio();setStyle(k);
  document.body.classList.add('in-session');
  const d=document.querySelector('.dev');d.classList.remove('enter');void d.offsetWidth;d.classList.add('enter');
  setScreen(screen);
  setTimeout(()=>{if(typeof maybeTour==='function')maybeTour('sess')},900);
}
function goHome(){
  if(RL.open)closeRoll();
  if(playing)stopTransport();
  if(screen==='novo'){saveNovo();LATE.screen='main';LATE.cols=MAIN;LATE.scenes=SC.main}document.body.classList.remove('novo','ugen');
  FXKEYS.forEach(k=>{if(FX[k].win.open)closeFx(k)});closeOs();if(REC.on)recStop();
  document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'));
  const d=document.querySelector('.dev');
  const done=()=>{d.classList.remove('crtoff');document.body.classList.remove('in-session','th-art','th-afro','th-vice','th-cumbia');buildHome();powerOnHome()};
  if(reduceMotion()||!document.body.classList.contains('in-session'))return done();
  pageWipe({c:'#FFE600',ch:'G-STUDIO',nm:'Início'},()=>{done();const h=$('#home');h.scrollTop=0});
}
// desfazer: entrar num gênero zera o histórico (estava em state/history.js; fica junto da função que modifica)
{const eg=enterGenre;enterGenre=function(){const r=eg.apply(this,arguments);undoReset();return r}}
// voltar ao início fecha o Remix FX e o Tamanho (estava em ui/remix.js; fica junto da função que modifica)
{const gh=goHome;goHome=function(){closeRmx();szClose();return gh.apply(this,arguments)}}
$('#homeBtn').addEventListener('click',goHome);
buildHome();

export { enterGenre, genreSting, goHome, pageWipe };
