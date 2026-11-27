import { ALL, DLYST, ECHB, ECHL, FX, FXDEF, FXKEYS, LN, cols, dlyTime, echIdx, echTime, fltHz, fmtHz, fxActive, fxOn, fxSend, revLen, saveFx } from '../app/all.js';
// --- interface do plugin
function bigKnobSVG(id){
  let ticks='',labels='',knurl='';
  for(let i=0;i<=30;i++){
    const a=(-135+i*9)*Math.PI/180,maj=i%3===0,r0=86,r1=maj?95:91;
    ticks+='<line x1="'+(100+r0*Math.sin(a)).toFixed(1)+'" y1="'+(100-r0*Math.cos(a)).toFixed(1)+'" x2="'+(100+r1*Math.sin(a)).toFixed(1)+'" y2="'+(100-r1*Math.cos(a)).toFixed(1)+'" class="'+(maj?'tk maj':'tk')+'"/>';
    if(maj)labels+='<text x="'+(100+106*Math.sin(a)).toFixed(1)+'" y="'+(100-106*Math.cos(a)+3).toFixed(1)+'">'+(i/3)+'</text>';
  }
  for(let i=0;i<48;i++){const a=i*7.5*Math.PI/180;knurl+='<line x1="'+(100+57*Math.sin(a)).toFixed(1)+'" y1="'+(100-57*Math.cos(a)).toFixed(1)+'" x2="'+(100+64*Math.sin(a)).toFixed(1)+'" y2="'+(100-64*Math.cos(a)).toFixed(1)+'"/>'}
  return '<svg viewBox="-16 -14 232 228" class="bk">'+
   '<defs>'+
    '<radialGradient id="bkb-'+id+'" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="#46474c"/><stop offset=".6" stop-color="#232427"/><stop offset="1" stop-color="#121314"/></radialGradient>'+
    '<linearGradient id="bkc-'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4b50"/><stop offset=".5" stop-color="#2e2f33"/><stop offset="1" stop-color="#1c1d20"/></linearGradient>'+
    '<filter id="bks-'+id+'" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>'+
   '</defs>'+
   '<g class="scale">'+ticks+labels+'</g>'+
   '<path class="trk" d=""/><path class="val" d=""/>'+
   '<circle cx="100" cy="106" r="64" fill="#000" opacity=".55" filter="url(#bks-'+id+')"/>'+
   '<g class="rot">'+
    '<circle cx="100" cy="100" r="64" fill="url(#bkb-'+id+')" stroke="#0a0a0b" stroke-width="1.5"/>'+
    '<g class="knurl">'+knurl+'</g>'+
    '<circle cx="100" cy="100" r="50" fill="url(#bkc-'+id+')" stroke="#0b0b0c" stroke-width="1.5"/>'+
    '<line x1="100" y1="82" x2="100" y2="56" class="ind"/>'+
   '</g>'+
   '<ellipse cx="88" cy="80" rx="30" ry="16" fill="#fff" opacity=".05"/>'+
  '</svg>';
}
function arcPath(r,a0,a1){
  const p=a=>[100+r*Math.sin(a),100-r*Math.cos(a)],s=p(a0),e=p(a1);
  return 'M'+s[0].toFixed(2)+' '+s[1].toFixed(2)+'A'+r+' '+r+' 0 '+(a1-a0>Math.PI?1:0)+' 1 '+e[0].toFixed(2)+' '+e[1].toFixed(2);
}
const BA0=-.75*Math.PI,BA1=.75*Math.PI;
function drawBig(k){
  const F=FX[k],el=F.el;if(!el)return;
  const v=F.p[FXDEF[k].big.k],a=BA0+(BA1-BA0)*v;
  el.querySelector('.rot').setAttribute('transform','rotate('+((-135+270*v).toFixed(2))+' 100 100)');
  el.querySelector('.bk .trk').setAttribute('d',arcPath(76,BA0,BA1));
  el.querySelector('.bk .val').setAttribute('d',v>.004?arcPath(76,BA0,a):'');
}
function plugInfo(k){
  const F=FX[k],st=FXDEF[k].styles[F.style];
  if(k==='rev')return st+' · '+revLen().toFixed(1)+' s';
  if(k==='dly')return (F.xb?ECHL[ECHB.indexOf(F.xb)]+' beat':DLYST[F.style].lbl)+' · '+Math.round(dlyTime()*1000)+' ms';
  if(k==='ech')return st+' · '+ECHL[echIdx()]+' beat · '+Math.round(echTime()*1000)+' ms';
  if(k==='flt')return st+' · '+fmtHz(fltHz())+(F.p.lfo>.01?' · LFO':'');
  return st+' · Mix '+Math.round(F.p.mix*100)+'%';
}
function updPlugLcd(k,param){
  const F=FX[k],el=F.el;if(!el)return;
  const d=FXDEF[k],n=param||d.big.k,lab=n===d.big.k?d.big.l:d.small.find(s=>s.k===n).l;
  el.querySelector('.pv').textContent=n==='beat'?'Beat '+ECHL[echIdx()]:lab+' '+Math.round(F.p[n]*100)+'%';
  el.querySelector('.pi').textContent=plugInfo(k);
}
function setFxParam(k,n,v){FX[k].p[n]=Math.max(0,Math.min(1,v));fxSend(k,'param',{param:n});updPlugLcd(k,n);saveFx()}
function fxLinkedHere(k){return cols.filter(c=>FX[k].links.includes(c.key)).length}
function updFxUI(k){
  const F=FX[k],el=F.el;
  const b=document.querySelector('.fxbtn[data-fx="'+k+'"]');
  if(b){b.classList.toggle('on',fxActive(k)&&(F.master||fxLinkedHere(k)>0));b.classList.toggle('open',F.win.open)}
  if(!el)return;
  el.classList.toggle('off',!F.on);
  el.querySelector('.pw').classList.toggle('on',F.on);
  el.querySelectorAll('.pst button').forEach(x=>x.classList.toggle('on',+x.dataset.i===F.style));
  const n=fxLinkedHere(k);
  el.querySelector('.lkc').textContent=F.master?'Master':n?String(n):'';
  el.querySelector('.lk').classList.toggle('on',n>0||F.master);
  el.querySelector('.mst').classList.toggle('sel',F.master);
  el.classList.toggle('xm',F.mode==='xpad');
  el.querySelectorAll('.pmode button').forEach(x=>x.classList.toggle('on',x.dataset.m===F.mode));
  el.querySelector('.lkp').classList.toggle('open',F.lnk);
  const list=el.querySelector('.lkl');list.innerHTML='';list.classList.toggle('dis',F.master);
  if(!cols.length){const e=document.createElement('span');e.className='lbl';e.textContent='Nenhum instrumento nesta tela';list.appendChild(e)}
  cols.forEach(c=>{
    const x=document.createElement('button');x.className='hw chip lch'+(F.links.includes(c.key)?' sel':'');x.style.setProperty('--c',c.color);
    x.innerHTML='<i></i>';x.appendChild(document.createTextNode(LN(c)));
    x.onclick=()=>toggleLink(k,c);list.appendChild(x);
  });
  updPlugLcd(k);drawBig(k);
}
function refreshFx(){FXKEYS.forEach(updFxUI);refreshFxTags()}
function refreshFxTags(){
  ALL().forEach(c=>{if(c.fxEl)c.fxEl.textContent=FXKEYS.filter(k=>fxOn(k,c)).map(k=>FXDEF[k].tag).join(' · ')});
}
function toggleLink(k,c){
  const L=FX[k].links,i=L.indexOf(c.key);FX[k].master=false;
  if(i>=0)L.splice(i,1);else L.push(c.key);
  fxSend(k,'routeLane',{lane:c.key});updFxUI(k);refreshFxTags();saveFx();
}
function setLinks(k,all){
  const L=FX[k].links;FX[k].master=false;
  cols.forEach(c=>{const i=L.indexOf(c.key);if(all&&i<0)L.push(c.key);if(!all&&i>=0)L.splice(i,1)});
  fxSend(k,'route');updFxUI(k);refreshFxTags();saveFx();
}
let zTop=20;
const PW_MIN=280;
const pwMax=()=>Math.max(PW_MIN,Math.min(440,Math.round(window.innerWidth*.5)));
function placePlug(k){
  const F=FX[k],el=F.el,i=FXKEYS.indexOf(k);
  let w=Math.max(PW_MIN,Math.min(pwMax(),F.win.w||340));
  el.style.width=w+'px';el.style.setProperty('--w',w+'px');
  const vw=window.innerWidth,vh=window.innerHeight;
  const topB=Math.round(document.querySelector('.top').getBoundingClientRect().bottom)+10;
  let x=F.win.x!==null?F.win.x:vw-w-24-i*36,y=F.win.y!==null?F.win.y:topB+i*36;
  x=Math.max(4,Math.min(vw-w-4,x));y=Math.max(4,Math.min(vh-80,y));
  el.style.left=x+'px';el.style.top=y+'px';
  F.win.x=x;F.win.y=y;F.win.w=w;fitPlug(k);
}
// mantém a janela inteira dentro da tela (move para cima se crescer)
function fitPlug(k){
  const F=FX[k],el=F.el;if(!el||!F.win.open)return;
  const vh=window.innerHeight,need=el.querySelector('.ph').offsetHeight+el.querySelector('.pbody').scrollHeight+2;
  let y=el.offsetTop;if(y+need>vh-8)y=Math.max(4,vh-8-need);
  el.style.top=y+'px';F.win.y=y;el.style.maxHeight=(vh-y-8)+'px';
}
function fxFront(el){el.style.zIndex=String(++zTop)}

export { PW_MIN, bigKnobSVG, drawBig, fitPlug, fxFront, fxLinkedHere, placePlug, pwMax, refreshFx, refreshFxTags, setFxParam, setLinks, updFxUI, updPlugLcd };
