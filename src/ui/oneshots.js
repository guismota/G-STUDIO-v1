// ---------- One Shots: 8 sons de efeito para disparar na hora ----------
function osHorn(t,o){ // buzina de festa: três toques
  [[0,.11],[.15,.09],[.28,.55]].forEach(([d,l])=>{
    const g=ctx.createGain(),f=ctx.createBiquadFilter(),ws=ctx.createWaveShaper();f.type='bandpass';f.frequency.value=1400;f.Q.value=.7;ws.curve=softCurve(2);
    g.gain.setValueAtTime(.0001,t+d);g.gain.linearRampToValueAtTime(.16,t+d+.012);g.gain.setValueAtTime(.16,t+d+l);g.gain.exponentialRampToValueAtTime(.0001,t+d+l+.08);
    [415,554,698].forEach((fr,i)=>{const x=ctx.createOscillator();x.type='sawtooth';x.frequency.setValueAtTime(fr*1.02,t+d);x.frequency.exponentialRampToValueAtTime(fr*(d>.2?.94:1),t+d+l);x.detune.value=(i-1)*9;x.connect(ws);x.start(t+d);x.stop(t+d+l+.1)});
    ws.connect(f);f.connect(g);g.connect(o)});
}
function osSiren(t,o){ // sirene de dub
  const x=ctx.createOscillator(),l=ctx.createOscillator(),lg=ctx.createGain(),f=ctx.createBiquadFilter(),g=ctx.createGain(),d=1.8;
  x.type='square';x.frequency.value=620;l.type='triangle';l.frequency.setValueAtTime(2.5,t);l.frequency.linearRampToValueAtTime(7,t+d);lg.gain.value=320;l.connect(lg);lg.connect(x.frequency);
  f.type='lowpass';f.frequency.value=2800;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.08,t+.04);g.gain.setValueAtTime(.08,t+d-.3);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  x.connect(f);f.connect(g);g.connect(o);x.start(t);l.start(t);x.stop(t+d+.05);l.stop(t+d+.05)}
function osLaser(t,o){ // pew pew
  [0,.13].forEach(d=>{const x=ctx.createOscillator(),g=ctx.createGain();x.type='sawtooth';x.frequency.setValueAtTime(3200,t+d);x.frequency.exponentialRampToValueAtTime(120,t+d+.22);
    g.gain.setValueAtTime(.12,t+d);g.gain.exponentialRampToValueAtTime(.0001,t+d+.24);x.connect(g);g.connect(o);x.start(t+d);x.stop(t+d+.26)})}
function osRewind(t,o){ // volta a fita
  const x=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain(),n=noise(t,.95),nf=ctx.createBiquadFilter(),ng=ctx.createGain();
  x.type='sawtooth';x.frequency.setValueAtTime(180,t);x.frequency.exponentialRampToValueAtTime(1400,t+.3);x.frequency.exponentialRampToValueAtTime(60,t+.9);
  f.type='bandpass';f.frequency.setValueAtTime(600,t);f.frequency.exponentialRampToValueAtTime(3000,t+.3);f.frequency.exponentialRampToValueAtTime(200,t+.9);f.Q.value=1.5;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.14,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+.92);x.connect(f);f.connect(g);g.connect(o);x.start(t);x.stop(t+.95);
  nf.type='highpass';nf.frequency.value=2500;ng.gain.setValueAtTime(.08,t);ng.gain.exponentialRampToValueAtTime(.0001,t+.9);n.connect(nf);nf.connect(ng);ng.connect(o)}
function osHey(t,o){ // grito "hey" de galera
  const sum=ctx.createGain(),g=ctx.createGain(),d=.32;
  [[600,500,.9,7],[1800,2200,.5,9],[2600,2900,.25,10]].forEach(([a,b,gn,q])=>{const bp=ctx.createBiquadFilter(),bg=ctx.createGain();bp.type='bandpass';bp.Q.value=q;bp.frequency.setValueAtTime(a,t);bp.frequency.linearRampToValueAtTime(b,t+d);bg.gain.value=gn*3;sum.connect(bp);bp.connect(bg);bg.connect(g)});
  [0,1,2,3].forEach(i=>{const x=ctx.createOscillator(),f0=[205,230,190,260][i];x.type='sawtooth';x.frequency.setValueAtTime(f0,t+i*.008);x.frequency.linearRampToValueAtTime(f0*.82,t+d);x.connect(sum);x.start(t+i*.008);x.stop(t+d+.05)});
  const h=noise(t,.06),hf=ctx.createBiquadFilter(),hg=ctx.createGain();hf.type='highpass';hf.frequency.value=1800;hg.gain.setValueAtTime(.15,t);hg.gain.exponentialRampToValueAtTime(.0001,t+.06);h.connect(hf);hf.connect(hg);hg.connect(o);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.18,t+.03);g.gain.setValueAtTime(.18,t+d-.1);g.gain.exponentialRampToValueAtTime(.0001,t+d);g.connect(o)}
function osCrash(t,o){
  const n=noise(t,2.4),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='highpass';f.frequency.value=4200;g.gain.setValueAtTime(.32,t);g.gain.exponentialRampToValueAtTime(.0001,t+2.3);n.connect(f);f.connect(g);g.connect(o);
  const mf=ctx.createBiquadFilter(),mg=ctx.createGain();mf.type='highpass';mf.frequency.value=6000;mg.gain.setValueAtTime(.05,t);mg.gain.exponentialRampToValueAtTime(.0001,t+1.4);
  [340,515,733,1012].forEach(fr=>{const x=ctx.createOscillator();x.type='square';x.frequency.value=fr;x.connect(mf);x.start(t);x.stop(t+1.5)});mf.connect(mg);mg.connect(o)}
const OSDEF=[
 {n:'Air Horn',c:'#FFA63D',f:osHorn},{n:'Siren',c:'#FF6A3D',f:osSiren},{n:'Laser',c:'#C8FF3D',f:osLaser},{n:'Boom',c:'#6C8BFF',f:(t,o)=>fxHit(t,3,2,o,1)},
 {n:'Rewind',c:'#5CFF8A',f:osRewind},{n:'Let\'s Go',c:'#FF3DAE',f:(t,o)=>{if(!smp('letsgo',t,o,1))osHey(t,o)}},{n:'Riser',c:'#FFA63D',f:(t,o)=>fxHit(t,1,60/bpm*4,o,1)},{n:'Crash',c:'#C8FF3D',f:(t,o)=>{if(!smp('crash',t,o,.8))osCrash(t,o)}}];
const OS=(()=>{let j=null;try{j=JSON.parse(localStorage.getItem('gstudio_os'))}catch(e){}j=j||{};const w=j.win||{},num=v=>Number.isFinite(+v)&&v!==null?+v:null;
  return {vol:Number.isFinite(+j.vol)?+j.vol:.8,q:!!j.q,win:{open:false,x:num(w.x),y:num(w.y),w:num(w.w)},el:null,g:null}})();
function saveOs(){try{localStorage.setItem('gstudio_os',JSON.stringify({vol:OS.vol,q:OS.q,win:{x:OS.win.x,y:OS.win.y,w:OS.win.w}}))}catch(e){}}
function osOut(){if(!OS.g){OS.g=ctx.createGain();OS.g.connect(mix)}OS.g.gain.value=OS.vol*1.2;return OS.g}
function fireOs(i,pad){
  initAudio();const now=ctx.currentTime;let t=now+.005;
  if(OS.q&&playing){const sd=60/bpm/4,n=Math.ceil((now+.01-tT0)/sd);t=Math.max(t,tT0+n*sd)} // espera o próximo 1/16
  const oo=osOut();inVoice(OSDEF[i].f,null,[t,oo]);
  if(pad){const d=Math.max(0,(t-now)*1000);setTimeout(()=>{pad.classList.remove('hit');void pad.offsetWidth;pad.classList.add('hit')},d)}
}
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
  makeKnob(el.querySelector('.osvol'),{v:OS.vol,label:'Volume',small:true,onChange:v=>{OS.vol=v;if(OS.g)OS.g.gain.value=v*1.2;saveOs()}});
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

