import { $, ICON, engine, fxFront, makeKnob } from '../app/all.js';
// ---------- One Shots: 8 sons de efeito para disparar na hora ----------
const OSDEF=[
 {n:'Air Horn',c:'#FFA63D'},{n:'Siren',c:'#FF6A3D'},{n:'Laser',c:'#C8FF3D'},{n:'Boom',c:'#6C8BFF'},
 {n:'Rewind',c:'#5CFF8A'},{n:'Let\'s Go',c:'#FF3DAE'},{n:'Riser',c:'#FFA63D'},{n:'Crash',c:'#C8FF3D'}]; // o som de cada um fica no motor (engine/oneshots.js)
const OS=(()=>{let j=null;try{j=JSON.parse(localStorage.getItem('gstudio_os'))}catch(e){}j=j||{};const w=j.win||{},num=v=>Number.isFinite(+v)&&v!==null?+v:null;
  return {vol:Number.isFinite(+j.vol)?+j.vol:.8,q:!!j.q,win:{open:false,x:num(w.x),y:num(w.y),w:num(w.w)},el:null}})();
function saveOs(){try{localStorage.setItem('gstudio_os',JSON.stringify({vol:OS.vol,q:OS.q,win:{x:OS.win.x,y:OS.win.y,w:OS.win.w}}))}catch(e){}}
function fireOs(i,pad){
  engine.send({type:'oneshot.fire',index:i,quantize:OS.q,volume:OS.vol});
}
// o motor avisa quando o som entra (na hora ou no próximo 1/16) e o pad pisca nesse momento
engine.on('oneshot.hit',e=>{const pad=OS.el&&OS.el.querySelector('.ospad[data-i="'+e.index+'"]');if(pad){setTimeout(()=>{pad.classList.remove('hit');void pad.offsetWidth;pad.classList.add('hit')},e.inMs)}});
const OS_MIN=300,osMax=()=>Math.max(OS_MIN,Math.min(620,Math.round(window.innerWidth*.6)));
function buildOs(){
  const el=document.createElement('div');el.className='plug oswin';el.id='plug-os';
  el.innerHTML='<div class="ph"><span class="osic"></span><div class="pt"><b>One Shots</b><small>G-STUDIO SAMPLER</small></div><button class="px" aria-label="Fechar">'+ICON.x+'</button></div>'+
   '<div class="pbody"><div class="ospads">'+OSDEF.map((d,i)=>'<button class="ospad" data-i="'+i+'" style="--c:'+d.c+'"><span class="osn">'+String(i+1).padStart(2,'0')+'</span><b>'+d.n+'</b><i></i></button>').join('')+'</div>'+
   '<div class="osbar"><div class="rocker small osq"><button data-q="0">Na hora</button><button data-q="1">No tempo</button></div><div class="osvol"></div></div>'+
   '<small class="ossoon">Em breve: grave e use seus próprios sons</small></div><div class="pgrip" aria-label="Redimensionar"></div>';
  document.body.appendChild(el);OS.el=el;
  el.addEventListener('pointerdown',()=>fxFront(el),true);
  el.querySelector('.px').onclick=closeOs;
  el.querySelectorAll('.ospad').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();fireOs(+b.dataset.i,b)}));
  el.querySelectorAll('.osq button').forEach(b=>b.onclick=()=>{OS.q=b.dataset.q==='1';updOsUI();saveOs()});
  makeKnob(el.querySelector('.osvol'),{v:OS.vol,label:'Volume',small:true,onChange:v=>{OS.vol=v;engine.send({type:'oneshot.volume',value:v});saveOs()}});
  const ph=el.querySelector('.ph');let mv=null;
  ph.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;e.preventDefault();mv={x:e.clientX,y:e.clientY,l:el.offsetLeft,t:el.offsetTop};try{ph.setPointerCapture(e.pointerId)}catch(_){}});
  ph.addEventListener('pointermove',e=>{if(!mv)return;OS.win.x=Math.max(4,Math.min(window.innerWidth-el.offsetWidth-4,mv.l+e.clientX-mv.x));OS.win.y=Math.max(4,Math.min(window.innerHeight-80,mv.t+e.clientY-mv.y));el.style.left=OS.win.x+'px';el.style.top=OS.win.y+'px'});
  const endM=()=>{if(mv){mv=null;fitOs();saveOs()}};ph.addEventListener('pointerup',endM);ph.addEventListener('pointercancel',endM);
  const gr=el.querySelector('.pgrip');let rs=null;
  gr.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();rs={x:e.clientX,w:el.offsetWidth};try{gr.setPointerCapture(e.pointerId)}catch(_){}});
  gr.addEventListener('pointermove',e=>{if(!rs)return;const w=Math.round(Math.max(OS_MIN,Math.min(osMax(),window.innerWidth-el.offsetLeft-4,rs.w+e.clientX-rs.x)));OS.win.w=w;el.style.width=w+'px';fitOs()});
  const endR=()=>{if(rs){rs=null;fitOs();saveOs()}};gr.addEventListener('pointerup',endR);gr.addEventListener('pointercancel',endR);
}
function fitOs(){
  const el=OS.el;if(!el||!OS.win.open)return;const vh=window.innerHeight,need=el.querySelector('.ph').offsetHeight+el.querySelector('.pbody').scrollHeight+2;
  let y=el.offsetTop;if(y+need>vh-8)y=Math.max(4,vh-8-need);el.style.top=y+'px';OS.win.y=y;el.style.maxHeight=(vh-y-8)+'px';
}
function placeOs(){
  const el=OS.el,w=Math.max(OS_MIN,Math.min(osMax(),OS.win.w||380)),vw=window.innerWidth,vh=window.innerHeight;
  el.style.width=w+'px';const topB=Math.round(document.querySelector('.top').getBoundingClientRect().bottom)+10;
  let x=OS.win.x!==null?OS.win.x:24,y=OS.win.y!==null?OS.win.y:Math.max(topB,vh-420);
  x=Math.max(4,Math.min(vw-w-4,x));y=Math.max(4,Math.min(vh-80,y));el.style.left=x+'px';el.style.top=y+'px';OS.win.x=x;OS.win.y=y;OS.win.w=w;fitOs();
}
function updOsUI(){
  $('#osBtn').classList.toggle('open',OS.win.open);
  if(OS.el)OS.el.querySelectorAll('.osq button').forEach(b=>b.classList.toggle('on',(b.dataset.q==='1')===OS.q));
}
function openOs(){if(!OS.el)buildOs();OS.win.open=true;OS.el.style.display='flex';placeOs();fxFront(OS.el);updOsUI()}
function closeOs(){OS.win.open=false;if(OS.el)OS.el.style.display='none';updOsUI()}
$('#osBtn').onclick=()=>OS.win.open?closeOs():openOs();
window.addEventListener('resize',()=>{if(OS.win.open)placeOs()});

export { OS, closeOs, saveOs, updOsUI };
