import { LATE } from '../app/late.js';
import { $, ALL, CFG, HW, ICON, LAY, LN, STYLES, SW, cols, editMode, engine, flash, getPat, makeKnob, openClipEditor, openExplore, openPicker, refreshFx, removeLane, saveLay, screen, style } from '../app/all.js';
// ---------- Interface ----------
function refreshPads(){
  cols.forEach(c=>c.padEls.forEach((el,pi)=>{
    const pat=getPat(c,pi);
    el.classList.toggle('empty',!pat);
    el.classList.toggle('user',pi>=4&&!!pat);
    c.padNm[pi].textContent=pat?pat.name:'+';
  }));
}
// solo: as outras linhas ficam apagadas
function updSoloUI(){const any=cols.some(x=>x.solo);cols.forEach(c=>{if(c.padEls&&c.padEls[0]){const row=c.padEls[0].parentElement;row.classList.toggle('soloff',any&&!c.solo);const sb=row.querySelector('.solo');if(sb)sb.classList.toggle('on',!!c.solo)}})}
// tocar num pad: no modo editar (ou pad vazio) abre o editor; senão, o motor solta o loop no tempo certo
function padTap(ci,pi){
  const pat=getPat(cols[ci],pi);
  if(cols[ci].kind==='loop'&&(editMode||!pat)){flash(pat?'Loop de áudio toca inteiro':'Loops de áudio usam só o primeiro pad');return}
  if(editMode||!pat){openClipEditor(ci,pi);return}
  engine.send({type:'clip.tap',lane:cols[ci].key,slot:pi});
}
// o motor avisa o que está tocando e na fila (e a cena ativa); a tela guarda o mesmo estado para desenhar os pads
engine.on('clips',e=>{LATE.sceneOn=e.scene;ALL().forEach(c=>{const s=e.lanes[c.key];if(s){c.active=s.active;c.queued=s.queued}})});
// arrastar alças: altura de linha e largura de coluna
function dragger(el,{down,move,up}){
  let on=false,sx=0,sy=0;
  el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();on=true;sx=e.clientX;sy=e.clientY;el.classList.add('act');try{el.setPointerCapture(e.pointerId)}catch(_){}down&&down(e)});
  el.addEventListener('pointermove',e=>{if(on)move(e.clientX-sx,e.clientY-sy)});
  const end=()=>{if(!on)return;on=false;el.classList.remove('act');up&&up()};
  el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function applyCols(){
  const s=$('#session');s.style.setProperty('--hw',HW+'px');s.style.setProperty('--sw',SW+'px');
  s.classList.toggle('cwset',!!LAY.cw);if(LAY.cw)s.style.setProperty('--cw',LAY.cw+'px');else s.style.removeProperty('--cw');
  const g=$('#grid'),ru=s.querySelector('.ruler');if(g&&ru){if(!g._rsync){g._rsync=1;g.addEventListener('scroll',()=>{const r=s.querySelector('.ruler');if(r)r.scrollLeft=g.scrollLeft},{passive:true})}ru.scrollLeft=LAY.cw?g.scrollLeft:0;if(!LAY.cw)g.scrollLeft=0}
  s.classList.toggle('compact',HW<132);
}
const MINI={fx:1,lead:1,tom:1};
function isMini(t){return !!MINI[t]&&!(((STYLES[style]||{}).big)||[]).includes(t)}
function layoutRows(){
  const g=$('#grid');if(!g||!g._spec)return;
  const mn=CFG.size==='l'?46:CFG.size==='s'?24:30,auto=screen!=='main'?'minmax('+(mn+14)+'px,'+(mn*3)+'px)':'minmax('+mn+'px,1fr)';
  const sm=Math.round(mn*.8),mini=screen!=='main'?'minmax('+(sm+8)+'px,'+(mn*2)+'px)':'minmax('+sm+'px,.55fr)';
  const rh=LAY.rh,fix=rh?(t=>(isMini(t)?Math.round(rh*.78):rh)+'px'):null;
  g.style.gridTemplateRows=g._spec.map(x=>typeof x==='string'?x:(x.h?x.h+'px':fix?fix(x.type):isMini(x.type)?mini:auto)).join(' ');
}
function rowResizer(el,c,row){
  let sh=0,last=0;
  dragger(el,{
    down:()=>{
      const now=Date.now();
      if(now-last<320){c.h=null;layoutRows();saveLay();flash('Altura automática');last=0;sh=-1;return}
      last=now;sh=row.getBoundingClientRect().height;
    },
    move:(dx,dy)=>{if(sh<0)return;c.h=Math.round(clamp(sh+dy,32,260));layoutRows()},
    up:()=>{if(sh>=0)saveLay()}
  });
}
function colResizer(el,which){
  let s0=0;
  dragger(el,{
    down:()=>{s0=which==='hw'?HW:SW},
    move:dx=>{if(which==='hw')LATE.HW=Math.round(clamp(s0+dx,80,280));else LATE.SW=Math.round(clamp(s0-dx,90,360));applyCols()},
    up:()=>{LAY.hw=HW;LAY.sw=SW;saveLay()}
  });
}
function buildLane(c,ci){
  const row=document.createElement('div');row.className='lane'+(c.kind!=='drum'?' syn':'')+(c.muted?' muted':'')+(isMini(c.type)?' lmini':'');row.style.setProperty('--c',c.color);row.style.setProperty('--i',ci);
  const lh=document.createElement('div');lh.className='lh';
  lh.innerHTML='<span class="tab"></span><span class="ix">'+String(ci+1).padStart(2,'0')+'</span><div class="nmw"><b></b><span class="fxt"></span></div>'+(screen!=='main'?'<button class="rm" aria-label="Remover">'+ICON.x+'</button>':'')+'<span class="ms"><button class="mute'+(c.muted?' on':'')+'" aria-label="Mutar">M</button><button class="solo'+(c.solo?' on':'')+'" aria-label="Solo">S</button></span><div class="kv"></div>';
  lh.querySelector('b').textContent=LN(c);c.fxEl=lh.querySelector('.fxt');
  const lm=document.createElement('span');lm.className='lm';lm.innerHTML='<span></span>';lh.appendChild(lm);c.lmEl=lm.firstChild;c.lvS=null;
  makeKnob(lh.querySelector('.kv'),{v:c.vol,small:true,onChange:v=>{c.vol=v;engine.send({type:'mixer.volume',lane:c.key,value:v})}});
  const mb=lh.querySelector('.mute');
  mb.addEventListener('pointerdown',e=>{e.preventDefault();c.muted=!c.muted;mb.classList.toggle('on',c.muted);row.classList.toggle('muted',c.muted);engine.send({type:'mixer.mute',lane:c.key,on:c.muted})});
  lh.querySelector('.solo').addEventListener('pointerdown',e=>{e.preventDefault();c.solo=!c.solo;engine.send({type:'mixer.solo',lane:c.key,on:c.solo});updSoloUI()});
  if(cols.some(x=>x.solo)&&!c.solo)row.classList.add('soloff');
  const rm=lh.querySelector('.rm');if(rm)rm.addEventListener('click',()=>removeLane(c));
  row.appendChild(lh);
  c.padEls=[];c.padNm=[];c.padPg=[];c.pgIdx=-1;c.cells=[];c.shown='';
  for(let pi=0;pi<8;pi++){
    const b=document.createElement('button');b.className='clip';
    b.innerHTML='<span class="nm"></span><span class="pg"></span>';
    b.addEventListener('pointerdown',e=>{e.preventDefault();padTap(ci,pi)});
    c.padEls.push(b);c.padNm.push(b.querySelector('.nm'));c.padPg.push(b.querySelector('.pg'));
    row.appendChild(b);
  }
  const st=document.createElement('div');st.className='strip';
  for(let i=0;i<16;i++){const e=document.createElement('i');st.appendChild(e);c.cells.push(e)}
  row.appendChild(st);
  const rz=document.createElement('div');rz.className='rz-h';rowResizer(rz,c,row);row.appendChild(rz);
  return row;
}
function buildSession(){
  const root=$('#session');root.innerHTML='';
  root.classList.toggle('free',screen!=='main');
  const ru=document.createElement('div');ru.className='ruler';
  ru.innerHTML='<div></div><div class="rl"><span class="c0">Instrumento<i class="rz-w"></i></span>'+['1','2','3','4','M1','M2','M3','M4'].map(t=>'<span>'+t+'</span>').join('')+'<span class="cs"><i class="rz-s"></i>Passos</span></div>';
  root.appendChild(ru);
  colResizer(ru.querySelector('.rz-w'),'hw');colResizer(ru.querySelector('.rz-s'),'sw');
  const g=document.createElement('div');g.className='grid';g.id='grid';root.appendChild(g);
  const spec=[];let r=1;
  [['Drums',cols.filter(c=>c.kind==='drum')],[screen==='novo'?'Sons':'Synth',cols.filter(c=>c.kind!=='drum')]].filter(x=>x[1].length).forEach(([label,ls],gi)=>{
    if(gi>0){spec.push('6px');r++}
    const gl=document.createElement('div');gl.className='gl';gl.textContent=label;gl.style.setProperty('--gc',label==='Drums'?'#ff9a3c':'#7d8bff');gl.style.gridRow=r+' / span '+ls.length;gl.style.gridColumn='1';g.appendChild(gl);
    ls.forEach(c=>{const ln=buildLane(c,cols.indexOf(c));ln.style.gridRow=String(r);ln.style.gridColumn='2';g.appendChild(ln);spec.push(c);r++});
  });
  if(screen!=='main'){
    const nv=screen==='novo',op=nv?()=>openExplore(true):openPicker;
    if(!cols.length){
      const e=document.createElement('div');e.className='empty-state';e.style.gridColumn='1 / 3';
      e.innerHTML=nv?'<b>Página em branco</b><span>Escolha sons do G-STUDIO, importe os seus ou grave pelo microfone.</span><button class="hw pri">Adicionar som</button>':'<b>Tela livre</b><span>Monta do zero, só com quem você quer na pista.</span><button class="hw pri">Chamar instrumento</button>';
      e.querySelector('button').onclick=op;g.appendChild(e);spec.push('1fr');
    }else{
      const a=document.createElement('button');a.className='addrow';a.textContent=nv?'+ Adicionar som':'+ Adicionar instrumento';a.style.gridColumn='2';a.style.gridRow=String(r);a.onclick=op;g.appendChild(a);spec.push('40px');
    }
  }
  g._spec=spec;layoutRows();applyCols();refreshPads();refreshFx();
}
export { applyCols, buildSession, layoutRows, padTap, refreshPads };
