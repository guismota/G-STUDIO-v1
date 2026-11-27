import { $, engine, rxEchoLabel, rxGateLabel, rxPitchLabel, szClose } from '../app/all.js';
// ---- interface
const RXEFF={wobble:{n:'Wobble',x:'Rate',y:'Depth'},repeat:{n:'Repeater',x:'Divisão',y:'Mix'},delay:{n:'Delay',x:'Tempo',y:'Feedback'},reverb:{n:'Reverb',x:'Tamanho',y:'Mix'},orbit:{n:'Orbit',x:'Rate',y:'Depth'}};
const RX=(()=>{let j={};try{j=JSON.parse(localStorage.getItem('gstudio_rmx'))||{}}catch(e){}return {open:false,win:{x:+j.x||null,y:+j.y||null,w:+j.w||null,h:+j.h||null},eff:RXEFF[j.eff]?j.eff:'wobble',lockF:false,lockE:false,f:{x:.5,y:.2},e:{x:.5,y:.5},fOn:false,eOn:false,n:null,tape:null}})();
function rxSave(){try{localStorage.setItem('gstudio_rmx',JSON.stringify({x:RX.win.x,y:RX.win.y,w:RX.win.w,h:RX.win.h,eff:RX.eff}))}catch(e){}}
function rxPadUI(el,o,on){const s=el.querySelector('.rxs');s.style.setProperty('--x',(o.x*100)+'%');s.style.setProperty('--y',((1-o.y)*100)+'%');s.classList.toggle('on',on)}
function rxLabels(){const p=$('#rxE');p.querySelector('.rxay').textContent='Feedback';p.querySelector('.rxax').textContent='Tempo'}
function rxPad(id,which){const el=$(id),s=el.querySelector('.rxs'),lk=el.querySelector('.rxlock');let pid=null;
  const at=e=>{const r=s.getBoundingClientRect();return {x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,1-(e.clientY-r.top)/r.height))}};
  const apply=(on,first)=>{const o=RX[which];if(which==='f'){RX.fOn=on;engine.send({type:'remix.filter',x:o.x,y:o.y,on})}else{RX.eOn=on;engine.send({type:'remix.echo',x:o.x,y:o.y,on,first:!!first});const v=on?rxEchoLabel(o.x,o.y):'';el.querySelector('.rxax').textContent=on&&v?v:'Tempo'}rxPadUI(el,o,on)};
  s.addEventListener('pointerdown',e=>{e.preventDefault();engine.send({type:'audio.unlock'});pid=e.pointerId;try{s.setPointerCapture(pid)}catch(_){}RX[which]=at(e);apply(true,true)});
  s.addEventListener('pointermove',e=>{if(pid!==e.pointerId)return;RX[which]=at(e);apply(true,false)});
  const end=e=>{if(pid!==e.pointerId)return;pid=null;const locked=which==='f'?RX.lockF:RX.lockE;if(!locked){if(which==='f')RX.f={x:.5,y:RX.f.y};apply(false)}};
  s.addEventListener('pointerup',end);s.addEventListener('pointercancel',end);
  lk.onclick=()=>{const k=which==='f'?'lockF':'lockE';RX[k]=!RX[k];lk.classList.toggle('on',RX[k]);if(!RX[k]){if(which==='f')RX.f={x:.5,y:RX.f.y};apply(false)}};
  el._apply=apply}
function rxSlider(id,fn){const el=$(id),st=el.querySelector('.rxst');let pid=null;
  const at=e=>{const r=st.getBoundingClientRect();return Math.max(0,Math.min(1,1-(e.clientY-r.top)/r.height))};
  const set=(v,on)=>{const lab=fn(v,on);el.classList.toggle('on',on);st.style.setProperty('--v',(v*100)+'%');el.querySelector('.rxsd').textContent=on&&lab?lab:''};
  st.addEventListener('pointerdown',e=>{e.preventDefault();engine.send({type:'audio.unlock'});pid=e.pointerId;try{st.setPointerCapture(pid)}catch(_){}set(at(e),true)});
  st.addEventListener('pointermove',e=>{if(pid===e.pointerId)set(at(e),true)});
  const rest=id==='#rxD'?.5:0;const end=e=>{if(pid!==e.pointerId)return;pid=null;set(rest,false)};st.addEventListener('pointerup',end);st.addEventListener('pointercancel',end);el._off=()=>set(rest,false)}
rxPad('#rxF','f');rxPad('#rxE','e');rxSlider('#rxG',(v,on)=>{engine.send({type:'remix.gate',value:v,on});return on?rxGateLabel(v):null});rxSlider('#rxD',(v,on)=>{engine.send({type:'remix.pitch',value:v,on});return on?rxPitchLabel(v):null});rxLabels();rxPadUI($('#rxF'),RX.f,false);rxPadUI($('#rxE'),RX.e,false);
document.querySelectorAll('#rmx .rxa').forEach(b=>{let pid=null;
  b.addEventListener('pointerdown',e=>{e.preventDefault();engine.send({type:'audio.unlock'});pid=e.pointerId;try{b.setPointerCapture(pid)}catch(_){}document.querySelectorAll('#rmx .rxa').forEach(x=>x.classList.toggle('on',x===b));engine.send({type:'remix.tape',action:b.dataset.a,on:true})});
  const end=e=>{if(pid!==e.pointerId)return;pid=null;b.classList.remove('on');engine.send({type:'remix.tape',action:b.dataset.a,on:false})};b.addEventListener('pointerup',end);b.addEventListener('pointercancel',end)});
function rxReset(){RX.lockF=RX.lockE=false;document.querySelectorAll('#rmx .rxlock').forEach(b=>b.classList.remove('on'));RX.f={x:.5,y:.2};RX.e={x:.5,y:.5};
  engine.send({type:'remix.reset'});
  ['#rxG','#rxD'].forEach(q=>$(q)._off&&$(q)._off());document.querySelectorAll('#rmx .rxa').forEach(b=>b.classList.remove('on'));rxPadUI($('#rxF'),RX.f,false);rxPadUI($('#rxE'),RX.e,false);rxLabels()}
$('#rxReset').onclick=rxReset;
// janela: abre embaixo ocupando boa parte da tela; arrasta pelo topo e redimensiona pelo canto
function rxPlace(){const el=$('#rmx'),W=window.innerWidth,H=window.innerHeight,mw=Math.min(460,W-16),mh=Math.min(240,H-80);
  let w=RX.win.w||W-24,h=RX.win.h||Math.round(H*.48);w=Math.max(mw,Math.min(W-8,w));h=Math.max(mh,Math.min(H-16,h));
  let x=RX.win.x!=null?RX.win.x:Math.round((W-w)/2),y=RX.win.y!=null?RX.win.y:H-h-12;x=Math.max(4,Math.min(W-w-4,x));y=Math.max(4,Math.min(H-h-4,y));
  Object.assign(el.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'})}
{const el=$('#rmx'),hd=el.querySelector('.rxh'),gr=el.querySelector('.rxgr');let mv=null,rs=null;
  hd.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;e.preventDefault();mv={x:e.clientX,y:e.clientY,l:el.offsetLeft,t:el.offsetTop};try{hd.setPointerCapture(e.pointerId)}catch(_){}});
  hd.addEventListener('pointermove',e=>{if(!mv)return;RX.win.x=mv.l+e.clientX-mv.x;RX.win.y=mv.t+e.clientY-mv.y;RX.win.w=el.offsetWidth;RX.win.h=el.offsetHeight;rxPlace()});
  const endM=()=>{if(mv){mv=null;rxSave()}};hd.addEventListener('pointerup',endM);hd.addEventListener('pointercancel',endM);
  gr.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();rs={x:e.clientX,y:e.clientY,w:el.offsetWidth,h:el.offsetHeight};RX.win.x=el.offsetLeft;RX.win.y=el.offsetTop;try{gr.setPointerCapture(e.pointerId)}catch(_){}});
  gr.addEventListener('pointermove',e=>{if(!rs)return;RX.win.w=rs.w+e.clientX-rs.x;RX.win.h=rs.h+e.clientY-rs.y;rxPlace()});
  const endR=()=>{if(rs){rs=null;rxSave()}};gr.addEventListener('pointerup',endR);gr.addEventListener('pointercancel',endR)}
function openRmx(){if(RX.open||!document.body.classList.contains('in-session'))return;engine.send({type:'remix.open'});RX.open=true;const el=$('#rmx');el.classList.add('open');el.setAttribute('aria-hidden','false');rxPlace();$('#rmxBtn').classList.add('on')}
function closeRmx(){if(!RX.open)return;RX.open=false;rxReset();engine.send({type:'remix.close'});const el=$('#rmx');el.classList.remove('open');el.setAttribute('aria-hidden','true');$('#rmxBtn').classList.remove('on')}
$('#rmxBtn').onclick=()=>RX.open?closeRmx():openRmx();$('#rxClose').onclick=closeRmx;
window.addEventListener('resize',()=>{if(RX.open)rxPlace();if($('#szPop').classList.contains('open'))szClose()});

// easter egg: tocar no knob da logo faz ele girar (sem deixar spamar)
(()=>{const fb=document.querySelector('#home .fbrand');if(!fb)return;let busy=false;fb.setAttribute('role','button');fb.setAttribute('aria-label','G-STUDIO');fb.tabIndex=-1;
  const knobOk=()=>{const k=fb.querySelector('.bk1');if(!k||!k.getAnimations)return true;const a=k.getAnimations().find(x=>x.animationName==='bkKnob');if(!a||a.currentTime==null)return true;const t=(a.currentTime%48800)/1000;return t>=1&&t<=19.6};
  fb.addEventListener('click',()=>{if(busy||!knobOk())return;busy=true;fb.classList.remove('spin');void fb.offsetWidth;fb.classList.add('spin');
    setTimeout(()=>fb.classList.remove('spin'),1400);setTimeout(()=>{busy=false},2600)})})();
export { RX, closeRmx, openRmx };
