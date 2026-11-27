import { LATE } from '../app/late.js';
import { $, ALL, FREE, FX, FXKEYS, K, NOVO, NOVO_STY, NV, OS, SC, STYLES, TYPES, bpm, enterGenre, flash, freeN, fxSyncAll, kFiltK, kMstK, kPump, makeLane, novoFill, novoSer, playing, refreshFx, saveAsGenre, saveFree, saveFx, saveNovo, saveOs, saveScenes, saveUser, screen, setBpm, setFilter, setMaster, setScreen, showXMenu, stopTransport, style, ugenList, updOsUI, userPats } from '../app/all.js';
// ---------- Projetos: guardar e abrir ideias com nome ----------
const PROJ={list:[],cur:null};
(()=>{try{const a=JSON.parse(localStorage.getItem('gstudio_projects'));if(Array.isArray(a))PROJ.list=a.filter(x=>x&&x.id&&x.data)}catch(e){}
  try{const c=localStorage.getItem('gstudio_cur');if(c&&PROJ.list.some(x=>x.id===c))PROJ.cur=c}catch(e){}})();
function saveProjList(){try{localStorage.setItem('gstudio_projects',JSON.stringify(PROJ.list));localStorage.setItem('gstudio_cur',PROJ.cur||'');return true}catch(e){return false}}
const curProj=()=>PROJ.cur?PROJ.list.find(x=>x.id===PROJ.cur)||null:null;
const two=n=>String(n).padStart(2,'0');
const fmtDate=ms=>{const d=new Date(ms);return two(d.getDate())+'/'+two(d.getMonth()+1)+' '+two(d.getHours())+':'+two(d.getMinutes())};
function snapshot(){
  const fx={};FXKEYS.forEach(k=>{const F=FX[k];fx[k]={on:F.on,style:F.style,p:F.p,links:F.links,master:F.master,mode:F.mode}});
  return JSON.parse(JSON.stringify({v:1,style,bpm,user:userPats,scenes:{main:SC.main,free:SC.free,novo:SC.novo},novo:{nv:NV,lanes:NOVO.map(novoSer)},
    free:{n:freeN,lanes:FREE.map(l=>({key:l.key,type:l.type,name:l.name}))},
    mix:ALL().map(l=>({key:l.key,vol:l.vol,muted:l.muted})),fx,K:{sc:K.sc,fv:K.fv,mv:K.mv},os:{vol:OS.vol,q:OS.q}}));
}
function restore(d){
  if(playing)stopTransport();
  Object.keys(userPats).forEach(k=>delete userPats[k]);Object.assign(userPats,d.user||{});saveUser();LATE.userVer++;
  const ok8=a=>Array.isArray(a)&&a.length===8?a:Array(8).fill(null);
  SC.main=ok8(d.scenes&&d.scenes.main);SC.free=ok8(d.scenes&&d.scenes.free);SC.novo=ok8(d.scenes&&d.scenes.novo);saveScenes();
  if(d.novo){novoFill({nv:d.novo.nv,lanes:d.novo.lanes,scenes:SC.novo},'draft');NOVO_STY.name='Criar novo';saveNovo()}
  FREE.length=0;LATE.freeN=d.free?d.free.n|0:0;((d.free&&d.free.lanes)||[]).forEach(l=>{if(l&&TYPES[l.type])FREE.push(makeLane(l.type,l.key,l.name))});saveFree();
  ALL().forEach(l=>{const T=TYPES[l.type];l.vol=T.vol;l.muted=false});
  (d.mix||[]).forEach(m=>{const l=ALL().find(x=>x.key===m.key);if(l){l.vol=Math.max(0,Math.min(1.5,+m.vol||0));l.muted=!!m.muted}});
  FXKEYS.forEach(k=>{const v=d.fx&&d.fx[k],F=FX[k];if(!v)return;F.on=!!v.on;F.style=[0,1,2].includes(v.style)?v.style:0;Object.assign(F.p,v.p||{});
    F.links=Array.isArray(v.links)?v.links.slice():[];F.master=!!v.master;F.mode=v.mode==='xpad'?'xpad':'knob'});saveFx();
  if(d.os){OS.vol=+d.os.vol||.8;OS.q=!!d.os.q;saveOs()}
  enterGenre(STYLES[d.style]?d.style:'house');
  setBpm(d.bpm||STYLES[style].bpm);
  if(d.K){K.sc=+d.K.sc||0;K.fv=d.K.fv!=null?+d.K.fv:1;K.mv=d.K.mv!=null?+d.K.mv:.8;kPump.set(K.sc);kFiltK.set(K.fv);kMstK.set(K.mv);setFilter();setMaster()}
  fxSyncAll('project');
  setScreen(screen);refreshFx();updOsUI();
}
function storeProject(asNew){
  const name=($('#psName').value||'').trim().slice(0,40)||STYLES[style].name;
  let pr=asNew?null:curProj();
  if(!pr){pr={id:'p'+Date.now().toString(36)};PROJ.list.unshift(pr)}
  Object.assign(pr,{name,style,bpm,updated:Date.now(),data:snapshot()});
  PROJ.list.sort((a,b)=>b.updated-a.updated);PROJ.cur=pr.id;
  closeModal('projSave');updProjN();
  flash(saveProjList()?'Salvo: '+name:'Sem espaço pra salvar. Apaga algum projeto');
}
function openProjSave(){
  const c=curProj();
  $('#psName').value=c?c.name:STYLES[style].name+' '+fmtDate(Date.now());
  $('#psInfo').textContent=c?'Editando "'+c.name+'"':'Projeto novo';
  $('#psNew').style.display=c?'':'none';$('#psSave').textContent=c?'Salvar por cima':'Salvar';
  $('#projSave').classList.add('open');setTimeout(()=>{try{$('#psName').select()}catch(e){}},60);
}
function closeModal(id){$('#'+id).classList.remove('open')}
function updProjN(){const n=PROJ.list.length;$('#projN').textContent=n?String(n):''}
function renderProjList(){
  const box=$('#plItems');box.innerHTML='';$('#plCount').textContent=PROJ.list.length?PROJ.list.length+(PROJ.list.length>1?' salvos':' salvo'):'';
  if(!PROJ.list.length){box.innerHTML='<div class="pempty"><b>Nada salvo ainda</b><span>Abre um gênero, monta sua ideia e toca no disquete pra salvar.</span></div>';return}
  PROJ.list.forEach(pr=>{
    const r=document.createElement('div');r.className='prow'+(pr.id===PROJ.cur?' cur':'');
    r.innerHTML='<div class="pinfo"><b></b><small></small></div><div class="pacts"><button class="hw pri" data-a="open">Abrir</button><button class="hw" data-a="ren">Renomear</button><button class="hw danger" data-a="del">Apagar</button></div>';
    r.querySelector('b').textContent=pr.name;
    r.querySelector('small').textContent=(STYLES[pr.style]?STYLES[pr.style].name:'')+' · '+pr.bpm+' BPM · '+fmtDate(pr.updated)+(pr.id===PROJ.cur?' · aberto':'');
    r.querySelector('[data-a=open]').onclick=()=>{closeModal('projList');closeModal('projSave');PROJ.cur=pr.id;saveProjList();restore(pr.data);flash('Abriu: '+pr.name)};
    r.querySelector('[data-a=ren]').onclick=()=>{
      const inf=r.querySelector('.pinfo');inf.innerHTML='<input class="pinput small" maxlength="40">';const i=inf.querySelector('input');i.value=pr.name;i.focus();i.select();
      const done=()=>{const v=i.value.trim().slice(0,40);if(v){pr.name=v;saveProjList()}renderProjList()};
      i.onkeydown=e=>{if(e.key==='Enter')done();if(e.key==='Escape')renderProjList()};i.onblur=done;
    };
    const del=r.querySelector('[data-a=del]');let armed=null;
    del.onclick=()=>{
      if(!armed){del.textContent='Certeza?';del.classList.add('armed');armed=setTimeout(()=>{armed=null;del.textContent='Apagar';del.classList.remove('armed')},2600);return}
      clearTimeout(armed);PROJ.list=PROJ.list.filter(x=>x.id!==pr.id);if(PROJ.cur===pr.id)PROJ.cur=null;saveProjList();updProjN();renderProjList();
    };
    box.appendChild(r);
  });
}
function openProjList(){renderProjList();$('#projList').classList.add('open')}
$('#saveBtn').onclick=e=>{if(document.body.classList.contains('novo')){const draft=!ugenList().some(x=>x.id===NV.ctx);showXMenu(e.currentTarget,[{l:'Salvar projeto',f:openProjSave},{l:draft?'Salvar como gênero':'Salvar como novo gênero',f:saveAsGenre}])}else openProjSave()};
$('#psSave').onclick=()=>storeProject(false);$('#psNew').onclick=()=>storeProject(true);
$('#psCancel').onclick=()=>closeModal('projSave');$('#psList').onclick=()=>{closeModal('projSave');openProjList()};
$('#psName').onkeydown=e=>{if(e.key==='Enter')storeProject(false)};
$('#projOpen').onclick=openProjList;$('#plClose').onclick=()=>closeModal('projList');
updProjN();

export { PROJ, closeModal, curProj, fmtDate, openProjList, openProjSave, snapshot, two };
