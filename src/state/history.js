import { LATE } from '../app/late.js';
import { $, ALL, FREE, FX, FXKEYS, LAY, SC, TYPES, applyCols, buildSession, engine, flash, freeN, fxActive, fxLinkedHere, fxSend, fxSyncAll, laneDefs, layoutRows, makeLane, refreshFx, refreshSlots, saveFree, saveFx, saveLay, saveScenes, saveUser, screen, userPats } from '../app/all.js';
// ---------- Desfazer / refazer ----------
// guarda o estado de padrões, cenas, linhas da tela livre e efeitos; cada mudança vira um passo (agrupa mexidas seguidas)
const UNDO={st:[],rd:[],cur:null,t:null,lock:false,MAX:60};
function undoSnap(){
  const fx={};FXKEYS.forEach(k=>{const F=FX[k];fx[k]={on:F.on,style:F.style,p:F.p,links:F.links,master:F.master}});
  return JSON.stringify({u:userPats,sc:{main:SC.main,free:SC.free,novo:SC.novo},fr:{n:freeN,l:FREE.map(l=>({key:l.key,type:l.type,name:l.name}))},fx});
}
function undoUI(){const u=$('#undoBtn'),r=$('#redoBtn');if(u)u.disabled=!UNDO.st.length;if(r)r.disabled=!UNDO.rd.length}
function undoCommit(){clearTimeout(UNDO.t);UNDO.t=null;const s=undoSnap();if(UNDO.cur===null){UNDO.cur=s;return}if(s===UNDO.cur)return;
  UNDO.st.push(UNDO.cur);if(UNDO.st.length>UNDO.MAX)UNDO.st.shift();UNDO.cur=s;UNDO.rd=[];undoUI()}
function undoMark(){if(UNDO.lock||!document.body.classList.contains('in-session'))return;clearTimeout(UNDO.t);UNDO.t=setTimeout(undoCommit,350)}
function undoReset(){clearTimeout(UNDO.t);UNDO.t=null;UNDO.st=[];UNDO.rd=[];UNDO.cur=undoSnap();undoUI()}
function undoApply(str){
  const d=JSON.parse(str);UNDO.lock=true;
  try{
    Object.keys(userPats).forEach(k=>delete userPats[k]);Object.assign(userPats,d.u||{});LATE.userVer++;saveUser();
    SC.main=d.sc.main;SC.free=d.sc.free;SC.novo=d.sc.novo;LATE.scenes=SC[screen];saveScenes();
    const want=(d.fr&&d.fr.l)||[],keep={};FREE.forEach(l=>keep[l.key]=l);
    FREE.forEach(l=>{if(!want.some(w=>w.key===l.key)){l.active=-1;l.queued=null;engine.send({type:'lane.remove',lane:l.key,reset:true})}});
    FREE.length=0;want.forEach(w=>{if(!TYPES[w.type])return;let l=keep[w.key];if(l)l.name=w.name;else{l=makeLane(w.type,w.key,w.name)}FREE.push(l)});engine.send({type:'lanes.sync',lanes:laneDefs()});
    LATE.freeN=d.fr?d.fr.n|0:freeN;saveFree();
    FXKEYS.forEach(k=>{const v=d.fx&&d.fx[k],F=FX[k];if(!v)return;F.on=!!v.on;F.style=v.style;Object.assign(F.p,v.p||{});F.links=(v.links||[]).slice();F.master=!!v.master});
    fxSyncAll('undo');
    saveFx();
    if(document.body.classList.contains('in-session')){buildSession();refreshSlots()}
    refreshFx();
  }finally{UNDO.lock=false}
}
function doUndo(){if(UNDO.t)undoCommit();if(!UNDO.st.length){flash('Nada pra desfazer');return}UNDO.rd.push(UNDO.cur);UNDO.cur=UNDO.st.pop();undoApply(UNDO.cur);undoUI();flash('Desfeito')}
function doRedo(){if(UNDO.t)undoCommit();if(!UNDO.rd.length){flash('Nada pra refazer');return}UNDO.st.push(UNDO.cur);UNDO.cur=UNDO.rd.pop();undoApply(UNDO.cur);undoUI();flash('Refeito')}
{const a=saveUser,b=saveScenes,c=saveFx,d=saveFree;LATE.saveUser=function(){const r=a.apply(this,arguments);undoMark();return r};LATE.saveScenes=function(){const r=b.apply(this,arguments);undoMark();return r};LATE.saveFx=function(){const r=c.apply(this,arguments);undoMark();return r};LATE.saveFree=function(){const r=d.apply(this,arguments);undoMark();return r}}
$('#undoBtn').onclick=doUndo;$('#redoBtn').onclick=doRedo;

// ligar/desligar efeito pela barra (sem instrumento ligado, vale pra música toda)
const pfFxOn=k=>fxActive(k)&&(FX[k].master||fxLinkedHere(k)>0);
function pfToggleFx(k){const F=FX[k];if(pfFxOn(k))F.on=false;else{F.on=true;if(!F.master&&!fxLinkedHere(k))F.master=true}engine.send({type:'audio.unlock'});fxSend(k,'power');refreshFx();saveFx()}


function szSync(){const h=$('#szH'),w=$('#szW');h.value=LAY.rh||Math.round(($('#grid .lane')||{getBoundingClientRect:()=>({height:44})}).getBoundingClientRect().height);
  const c=document.querySelector('#grid .lane .clip');w.value=LAY.cw||Math.round(c?c.getBoundingClientRect().width:120);
  $('#szHv').textContent=LAY.rh?LAY.rh+' px':'Auto';$('#szWv').textContent=LAY.cw?LAY.cw+' px':'Auto'}
function szOpen(){const p=$('#szPop'),b=$('#sizeBtn');if(p.classList.contains('open')){szClose();return}szSync();p.classList.add('open');p.setAttribute('aria-hidden','false');b.classList.add('open');
  const r=b.getBoundingClientRect();p.style.top=(r.bottom+6)+'px';p.style.left=Math.max(8,Math.min(window.innerWidth-p.offsetWidth-8,r.right-p.offsetWidth))+'px'}
function szClose(){const p=$('#szPop');p.classList.remove('open');p.setAttribute('aria-hidden','true');$('#sizeBtn').classList.remove('open')}
$('#sizeBtn').onclick=e=>{e.stopPropagation();szOpen()};
document.addEventListener('pointerdown',e=>{const p=$('#szPop');if(p.classList.contains('open')&&!p.contains(e.target)&&!e.target.closest('#sizeBtn'))szClose()},true);
$('#szH').oninput=e=>{LAY.rh=+e.target.value;ALL().forEach(l=>{l.h=null});layoutRows();szSync()};
$('#szW').oninput=e=>{LAY.cw=+e.target.value;applyCols();szSync()};
$('#szH').onchange=$('#szW').onchange=()=>saveLay();
$('#szAuto').onclick=()=>{LAY.rh=null;LAY.cw=null;layoutRows();applyCols();saveLay();szSync()};

export { doRedo, doUndo, pfFxOn, pfToggleFx, szClose, undoReset };
