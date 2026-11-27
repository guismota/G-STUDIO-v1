import { LATE } from '../app/late.js';
import { $, FREE, FX, FXKEYS, MAIN, NOVO, SC, TYPES, buildSession, cols, engine, flash, freeN, fxSyncAll, laneDefs, makeLane, playing, refreshSlots, saveFree, saveFx, saveNovo, saveScenes, saveUser, screen, sortByKind, userPats } from '../app/all.js';
// ---------- Tela livre ----------
function addLane(type){
  LATE.freeN++;const same=FREE.filter(l=>l.type===type).length;
  const l=makeLane(type,'f'+freeN,TYPES[type].name+(same?' '+(same+1):''));
  FREE.push(l);sortByKind(FREE);userPats[l.key]=[null,null,null,null];
  engine.send({type:'lanes.sync',lanes:laneDefs()});
  saveFree();buildSession();flash(l.name+' entrou na festa');updPickCount();
}
function removeLane(c){
  const A=NOVO.includes(c)?NOVO:FREE,i=A.indexOf(c);if(i<0)return;
  engine.send({type:'lane.remove',lane:c.key,stopSource:A===NOVO}); // o motor para o som e desliga a linha
  A.splice(i,1);delete userPats[c.key];SC.free.forEach(s=>{if(s)delete s[c.key]});
  FXKEYS.forEach(k=>{const j=FX[k].links.indexOf(c.key);if(j>=0)FX[k].links.splice(j,1)});saveFx();fxSyncAll();
  if(A===NOVO)saveNovo();else saveFree();saveUser();saveScenes();buildSession();flash(c.name+' saiu da pista');
}
function updPickCount(){$('#pkCount').textContent=FREE.length+(FREE.length===1?' instrumento':' instrumentos')}
function openPicker(){
  const g=$('#pkGrid');g.innerHTML='';
  Object.keys(TYPES).filter(t=>!TYPES[t].hidden).forEach(t=>{
    const T=TYPES[t],b=document.createElement('button');b.className='hw pk';b.style.setProperty('--c',T.color);
    b.innerHTML='<i></i><span>'+T.name+'<small>'+(T.kind==='note'?'Synth':T.kind==='fx'?'FX':'Drum')+'</small></span>';
    b.onclick=()=>addLane(t);g.appendChild(b);
  });
  updPickCount();$('#picker').classList.add('open');
}
$('#pkDone').onclick=()=>$('#picker').classList.remove('open');
function setScreen(s){
  if(playing)engine.send({type:'transport.stop'});
  [MAIN,NOVO,FREE].forEach(A=>A.forEach(c=>{c.solo=false}));
  LATE.screen=s;LATE.cols=s==='main'?MAIN:s==='novo'?NOVO:FREE;LATE.scenes=SC[s];LATE.sceneOn=-1;
  engine.send({type:'lanes.view',screen:s,lanes:cols.map(c=>c.key)});
  document.querySelectorAll('.tabs .tab').forEach(b=>b.classList.toggle('on',b.dataset.s===s));
  buildSession();refreshSlots();
}
document.querySelectorAll('.tabs .tab').forEach(b=>b.onclick=()=>{if(b.dataset.s!==screen)setScreen(b.dataset.s)});
export { openPicker, removeLane, setScreen };
