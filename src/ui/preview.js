import { late } from '../app/late.js';
import { $, CHN, GENRES, STYLES, engine, enterGenre, pageWipe } from '../app/all.js';
late({get prevOn(){return prevOn},set prevOn(v){prevOn=v}});
// ---------- botões de prévia da tela inicial e entrada nos canais (o som da prévia fica no motor: engine/preview.js) ----------
// uma prévia de cada vez: o motor avisa (preview.state) quando ela termina sozinha
let pvDoneId=null,pvDoneFn=null;
function previewPlay(cmd,onDone){pvDoneId=cmd.id;pvDoneFn=onDone||null;engine.send(cmd)}
engine.on('preview.state',e=>{if(!e.playing&&e.id===pvDoneId){const f=pvDoneFn;pvDoneId=pvDoneFn=null;f&&f()}});
const PREVIEW={};let prevOn=null;
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPreview()});
GENRES.forEach(g=>{if(STYLES[g.k])PREVIEW[g.k]=b=>{previewPlay({type:'preview.start',id:g.k,genre:g.k},()=>{if(prevOn&&prevOn.b===b){b.classList.remove('playing');prevOn=null}});return()=>engine.send({type:'preview.stop'})}});
function homeToast(m){let t=$('#htoast');if(!t){t=document.createElement('div');t.id='htoast';$('#home').appendChild(t)}
  t.textContent=m;t.classList.remove('show');void t.offsetWidth;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2200)}
function stopPreview(){if(!prevOn)return;prevOn.b.classList.remove('playing');if(prevOn.stop)prevOn.stop();prevOn=null}
function togglePreview(b,k){
  const was=prevOn&&prevOn.b===b;stopPreview();if(was)return;
  if(!PREVIEW[k]){b.classList.add('playing');prevOn={b};setTimeout(()=>{if(prevOn&&prevOn.b===b)stopPreview()},1400);homeToast('Prévia no forno. Já já sai');return}
  engine.send({type:'audio.unlock'});b.classList.add('playing');prevOn={b};prevOn.stop=PREVIEW[k](b);
}
let tuning=false;
function tuneInX(b,fn,w,sk){if(tuning)return;tuning=true;stopPreview();engine.send({type:'audio.unlock'});engine.send({type:'sting.play',genre:sk||'novo'});b&&b.classList.add('tune');pageWipe(w||{c:'#EDEDED',ch:b&&b.querySelector('.ch')?b.querySelector('.ch').textContent:'',nm:'Criar <em>novo</em>',art:true},()=>{b&&b.classList.remove('tune');tuning=false;fn()})}
function tuneIn(b,k){
  if(tuning)return;tuning=true;stopPreview();engine.send({type:'audio.unlock'});engine.send({type:'sting.play',genre:k});
  b.classList.add('tune');
  const G=GENRES.find(g=>g.k===k),art=!!(G&&G.artist),afro=!!(G&&G.theme==='afro'),vice=!!(G&&G.theme==='vice'),cum=!!(G&&G.theme==='cumbia');
  pageWipe({c:cum?'#FF4B1F':vice?'#FF5E8A':afro?'#FF6B2C':art?'#B026FF':'#FFE600',ink:cum?'#111':art?'#fff':'#000',ch:CHN(GENRES.indexOf(G)),nm:art?(G.html?G.html.replace(/<\/?span>/g,''):'After<em>party</em>'):STYLES[k].name,art,cls:cum?'cumbia':vice?'vice':''},()=>{b.classList.remove('tune');tuning=false;enterGenre(k)});
}
export { PREVIEW, prevOn, previewPlay, stopPreview, togglePreview, tuneIn, tuneInX };
