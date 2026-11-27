import { LATE } from '../app/late.js';
import { $, CFG, ICON, LN, cols, draft, editMode, editing, engine, flash, getPat, reduceMotion, saveScenes, scenes } from '../app/all.js';
// ---------- Cenas ----------
function launchScene(i){
  const sc=scenes[i];
  if(!sc){openSceneEditor(i);return}
  if(!cols.length){flash('Chama um instrumento primeiro');return}
  const lanes={};cols.forEach(c=>{const v=sc[c.key];lanes[c.key]=Number.isInteger(v)&&getPat(c,v)?v:-1});
  engine.send({type:'scene.launch',index:i,lanes}); // a animação vem quando a cena entra de fato (scene.fired)
}
engine.on('scene.fired',e=>sceneFx(e.index));
// animação ao soltar uma cena: flash, onda de choque, número gigante com glitch e as linhas acendendo em cascata
function sceneFx(i){
  if(reduceMotion())return;
  const fx=$('#sceneFx'),sl=slotEls[i],r=sl?sl.getBoundingClientRect():{left:innerWidth/2,top:innerHeight/2,width:0,height:0};
  fx.style.setProperty('--x',(r.left+r.width/2)+'px');fx.style.setProperty('--y',(r.top+r.height/2)+'px');
  const s=$('#session'),d=document.querySelector('.dev');
  [fx,s,d].forEach(e=>e.classList.remove('go','sfx','shake'));void fx.offsetWidth;
  fx.classList.add('go');s.classList.add('sfx');if(!CFG.noshake)d.classList.add('shake');
  if(sl){sl.classList.remove('boom');void sl.offsetWidth;sl.classList.add('boom')}
  d.addEventListener('animationend',function f(e){if(e.target===d&&e.animationName==='shk'){d.classList.remove('shake');d.removeEventListener('animationend',f)}});
  clearTimeout(fx._t);fx._t=setTimeout(()=>{fx.classList.remove('go');s.classList.remove('sfx');d.classList.remove('shake');if(sl)sl.classList.remove('boom')},1000);
}
const curMap=()=>{const o={};cols.forEach(c=>o[c.key]=c.active);return o};
const draftOf=c=>Number.isInteger(draft[c.key])?draft[c.key]:-1;
function openSceneEditor(i){
  if(!cols.length){flash('Chama um instrumento primeiro');return}
  LATE.editing=i;
  LATE.draft=scenes[i]?Object.assign({},scenes[i]):curMap();
  $('#mt').textContent='Cena '+(i+1);
  renderSceneEditor();$('#sceneEd').classList.add('open');
}
function renderSceneEditor(){
  const g=$('#mgrid');g.innerHTML='';
  cols.forEach(c=>{
    const r=document.createElement('div');r.className='mrow';r.style.setProperty('--c',c.color);
    const n=document.createElement('div');n.className='nmr';n.innerHTML='<i></i>';n.appendChild(document.createTextNode(LN(c)));r.appendChild(n);
    [-1,0,1,2,3,4,5,6,7].forEach(v=>{
      const b=document.createElement('button');b.className='hw'+(v<0?' off':'');
      b.textContent=v<0?'Off':(v<4?String(v+1):'M'+(v-3));
      if(v>=0&&!getPat(c,v))b.disabled=true;
      if(draftOf(c)===v)b.classList.add('sel');
      b.addEventListener('click',()=>{draft[c.key]=v;renderSceneEditor()});
      r.appendChild(b);
    });
    g.appendChild(r);
  });
}
function closeSceneEditor(){$('#sceneEd').classList.remove('open');LATE.editing=-1}
$('#mcancel').onclick=closeSceneEditor;
$('#mcopy').onclick=()=>{LATE.draft=curMap();renderSceneEditor()};
$('#mclear').onclick=()=>{if(editing>=0){scenes[editing]=null;saveScenes()}closeSceneEditor();refreshSlots()};
$('#msave').onclick=()=>{
  if(editing>=0){
    const o={};cols.forEach(c=>{o[c.key]=draftOf(c)});
    scenes[editing]=cols.every(c=>o[c.key]<0)?null:o;saveScenes();
  }
  closeSceneEditor();refreshSlots();
};
const slotEls=[];
function refreshSlots(){slotEls.forEach((b,i)=>{b.classList.toggle('empty',!scenes[i]);b.lastChild.textContent=scenes[i]?'Cena':'Vazia'})}
function buildScenes(){
  const s=$('#scenes');s.innerHTML='';
  for(let i=0;i<8;i++){
    const b=document.createElement('button');b.className='hw sc';
    b.innerHTML='<span class="led"></span><b>'+(i+1)+'</b><span>Cena</span>';
    b.addEventListener('pointerdown',e=>{e.preventDefault();if(editMode||!scenes[i])openSceneEditor(i);else launchScene(i)});
    slotEls.push(b);s.appendChild(b);
  }
  const x=document.createElement('button');x.className='hw sc';x.id='stopall';x.innerHTML=ICON.stop+'Parar';
  x.addEventListener('pointerdown',e=>{e.preventDefault();engine.send({type:'clip.stopAll'})});s.appendChild(x);
  refreshSlots();
}

export { buildScenes, launchScene, refreshSlots, slotEls };
