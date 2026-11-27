import { ALL, ECHB, ECHL, FX, FXDEF, ICON, MA, PW_MIN, applyFx, bigKnobSVG, buildDelayInner, ctx, drawBig, dstCurve, fitPlug, fxFront, initAudio, makeKnob, makeShaper, placePlug, pwMax, refreshFx, refreshFxTags, routeAll, saveFx, setFxParam, setLinks, updDly, updEch, updFxUI, updPlugLcd, updRev, updRevIR } from '../app/all.js';
// ---------- X-Pad (estilo mixer de DJ) ----------
const XBEAT=k=>k==='dly'||k==='ech';
function xpadLabels(k){return XBEAT(k)?ECHL:['0','25','50','75','100']}
function xpadTouch(k,fr,first){
  const F=FX[k],el=F.el,xp=el.querySelector('.xpad');
  if(first){F.xt=true;xp.classList.add('touch');xp.style.setProperty('--x0',(fr*100).toFixed(1)+'%');xp.classList.remove('rip');void xp.offsetWidth;xp.classList.add('rip')}
  const gl=fr;
  if(XBEAT(k)){const n=ECHB.length,i=Math.min(n-1,Math.floor(fr*n));
    xp.querySelectorAll('.xseg span').forEach((x,j)=>x.classList.toggle('on',j===i));
    if(k==='ech'){const v=i/(n-1);if(v!==F.p.beat)setFxParam(k,'beat',v)}
    else if(F.xb!==ECHB[i]){F.xb=ECHB[i];updDly();updPlugLcd(k)}}
  else setFxParam(k,k==='rev'?'mix':k==='dst'?'drive':'cut',fr);
  xp.style.setProperty('--x',(gl*100).toFixed(1)+'%');
  if(first){applyFx(k);routeAll();updFxUI(k);refreshFxTags()}
  else if(k==='rev'||k==='dst'||k==='flt')drawBig(k);
}
function xpadEnd(k){
  const F=FX[k],xp=F.el.querySelector('.xpad');
  F.xt=false;xp.classList.remove('touch');xp.querySelectorAll('.xseg span').forEach(x=>x.classList.remove('on'));
  if(k==='dly'&&F.xb){F.xb=null;updDly()}
  applyFx(k);routeAll();updFxUI(k);refreshFxTags();saveFx();
}
function buildPlug(k){
  const d=FXDEF[k],F=FX[k],el=document.createElement('div');
  el.className='plug';el.id='plug-'+k;
  el.innerHTML=
   '<div class="ph"><button class="pw" aria-label="Ligar ou desligar"><span class="led"></span></button>'+
    '<div class="pt"><b>'+d.name+'</b><small>G-STUDIO FX</small></div>'+
    '<button class="px" aria-label="Fechar">'+ICON.x+'</button></div>'+
   '<div class="pbody">'+
    '<div class="rocker small pst">'+d.styles.map((s,i)=>'<button data-i="'+i+'"><span class="led"></span>'+s+'</button>').join('')+'</div>'+
    '<div class="rocker small pmode"><button data-m="knob">Knob</button><button data-m="xpad">X-Pad</button></div>'+
    '<div class="bigk">'+bigKnobSVG(k)+'</div>'+
    '<div class="xpad" style="--n:'+xpadLabels(k).length+'"><div class="xseg">'+xpadLabels(k).map(l=>'<span>'+l+'</span>').join('')+'</div><i class="xfill"></i><i class="xline"></i><i class="xglow"></i><small class="xhint">Toque e segure</small></div>'+
    '<div class="plcd"><span class="pv"></span><span class="pi"></span></div>'+
    '<div class="smk"><div></div><div></div></div>'+
    '<button class="hw lk">'+ICON.link+'<span>Link</span><span class="lkc"></span></button>'+
    '<div class="lkp"><div class="lkh"><span class="lbl">Aplicar em</span><div class="chips"><button class="hw chip mst">Master</button><button class="hw chip" data-a="1">Todos</button><button class="hw chip" data-a="0">Nenhum</button></div></div><div class="lkl"></div></div>'+
   '</div>'+
   '<div class="pgrip" aria-label="Redimensionar"></div>';
  document.body.appendChild(el);F.el=el;
  el.addEventListener('pointerdown',()=>fxFront(el),true);
  el.querySelector('.px').onclick=()=>closeFx(k);
  el.querySelector('.pw').onclick=()=>{F.on=!F.on;applyFx(k);routeAll();refreshFx();saveFx()};
  el.querySelectorAll('.pst button').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i;if(i===F.style)return;F.style=i;
    if(ctx){
      if(k==='rev'){updRevIR();updRev()}
      else if(k==='dly'){buildDelayInner();updDly()}
      else if(k==='dst'){ALL().forEach(c=>{if(c.gain)makeShaper(c)});if(MA.sh)MA.sh.curve=dstCurve();routeAll()}
      else if(k==='ech')updEch();
      else routeAll();
    }
    updFxUI(k);saveFx();
  });
  el.querySelector('.lk').onclick=()=>{F.lnk=!F.lnk;updFxUI(k);fitPlug(k)};
  el.querySelectorAll('.lkh .chip[data-a]').forEach(b=>b.onclick=()=>setLinks(k,b.dataset.a==='1'));
  el.querySelector('.mst').onclick=()=>{F.master=!F.master;routeAll();updFxUI(k);refreshFxTags();saveFx()};
  el.querySelectorAll('.pmode button').forEach(b=>b.onclick=()=>{F.mode=b.dataset.m;updFxUI(k);fitPlug(k);saveFx()});
  // X-Pad: tocar liga o efeito e muda o parâmetro; soltar desliga (se estava desligado)
  const xp=el.querySelector('.xpad');let xid=null;
  const xpos=e=>{const r=xp.getBoundingClientRect();return Math.max(0,Math.min(.999,(e.clientX-r.left)/r.width))};
  xp.addEventListener('pointerdown',e=>{e.preventDefault();initAudio();xid=e.pointerId;try{xp.setPointerCapture(xid)}catch(_){}xpadTouch(k,xpos(e),true)});
  xp.addEventListener('pointermove',e=>{if(xid===e.pointerId)xpadTouch(k,xpos(e),false)});
  const xend=e=>{if(xid!==e.pointerId)return;xid=null;xpadEnd(k)};xp.addEventListener('pointerup',xend);xp.addEventListener('pointercancel',xend);
  // knob grande: arraste para cima/baixo; dois toques voltam ao padrão
  const bk=el.querySelector('.bigk');let drag=false,sy=0,sv=0,lastT=0;
  bk.addEventListener('pointerdown',e=>{
    e.preventDefault();const now=Date.now(),n=d.big.k;
    if(now-lastT<320){setFxParam(k,n,d.def[n]);drawBig(k);lastT=0;return}
    lastT=now;drag=true;sy=e.clientY;sv=F.p[n];try{bk.setPointerCapture(e.pointerId)}catch(_){}
  });
  bk.addEventListener('pointermove',e=>{if(!drag)return;setFxParam(k,d.big.k,sv+(sy-e.clientY)/220);drawBig(k)});
  const endB=()=>{drag=false};bk.addEventListener('pointerup',endB);bk.addEventListener('pointercancel',endB);
  const sm=el.querySelectorAll('.smk>div');
  d.small.forEach((s,i)=>makeKnob(sm[i],{v:F.p[s.k],label:s.l,onChange:v=>setFxParam(k,s.k,v)}));
  // mover pela barra de título
  const ph=el.querySelector('.ph');let mv=null;
  ph.addEventListener('pointerdown',e=>{
    if(e.target.closest('button'))return;e.preventDefault();
    mv={x:e.clientX,y:e.clientY,l:el.offsetLeft,t:el.offsetTop};try{ph.setPointerCapture(e.pointerId)}catch(_){}
  });
  ph.addEventListener('pointermove',e=>{
    if(!mv)return;
    F.win.x=Math.max(4,Math.min(window.innerWidth-el.offsetWidth-4,mv.l+e.clientX-mv.x));
    F.win.y=Math.max(4,Math.min(window.innerHeight-80,mv.t+e.clientY-mv.y));
    el.style.left=F.win.x+'px';el.style.top=F.win.y+'px';
  });
  const endM=()=>{if(mv){mv=null;fitPlug(k);saveFx()}};ph.addEventListener('pointerup',endM);ph.addEventListener('pointercancel',endM);
  // redimensionar pelo canto (com limite)
  const gr=el.querySelector('.pgrip');let rs=null;
  gr.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();rs={x:e.clientX,w:el.offsetWidth};try{gr.setPointerCapture(e.pointerId)}catch(_){}});
  gr.addEventListener('pointermove',e=>{
    if(!rs)return;
    const w=Math.round(Math.max(PW_MIN,Math.min(pwMax(),window.innerWidth-el.offsetLeft-4,rs.w+e.clientX-rs.x)));
    F.win.w=w;el.style.width=w+'px';el.style.setProperty('--w',w+'px');fitPlug(k);
  });
  const endR=()=>{if(rs){rs=null;fitPlug(k);saveFx()}};gr.addEventListener('pointerup',endR);gr.addEventListener('pointercancel',endR);
}
function openFx(k){
  const F=FX[k];if(!F.el)buildPlug(k);
  F.win.open=true;F.el.style.display='flex';placePlug(k);fxFront(F.el);updFxUI(k);
}
function closeFx(k){const F=FX[k];F.win.open=false;F.lnk=false;if(F.el)F.el.style.display='none';updFxUI(k)}
document.querySelectorAll('.fxbtn').forEach(b=>b.onclick=()=>{const k=b.dataset.fx;FX[k].win.open?closeFx(k):openFx(k)});
export { closeFx, openFx };
