import { LATE } from '../app/late.js';
import { $, FX, FXKEYS, LASTK, MAIN, RECU, RL, SC, buildHome, closeFx, closeOs, closeRmx, closeRoll, engine, enterNovo, histPush, initAudio, maybeTour, playing, powerOnHome, reduceMotion, saveNovo, screen, setScreen, setStyle, stopTransport, szClose, undoReset } from '../app/all.js';
// troca de página: uma faixa na cor do canal atravessa a tela
function pageWipe(o,mid){
  const w=$('#wipe');if(reduceMotion()||!w){mid();return}
  w.style.setProperty('--wc',o.c);w.style.setProperty('--wi',o.ink||'#000');
  w.querySelector('.wch').textContent=o.ch||'';w.querySelector('.wnm').innerHTML=o.nm||'';
  clearTimeout(w._t1);clearTimeout(w._t2);w.className='on in'+(o.art?' art':'')+(o.cls?' '+o.cls:'');
  w._t1=setTimeout(()=>{try{mid()}finally{w.className='on out'+(o.art?' art':'')+(o.cls?' '+o.cls:'');w._t2=setTimeout(()=>{w.className=''},340)}},330);
}
// som ao entrar num canal: subida de fita e um golpe do próprio gênero (kick + acorde)
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
  FXKEYS.forEach(k=>{if(FX[k].win.open)closeFx(k)});closeOs();if(RECU.on)engine.send({type:'rec.stop'});
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

export { enterGenre, goHome, pageWipe };
