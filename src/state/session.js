let style='house';
const snd=()=>(typeof LSND!=='undefined'&&LSND)||STYLES[(typeof PV!=='undefined'&&PV.k)||style].snd;

// Instrumentos disponíveis (paleta de quente a frio)
const TYPES={
 kick:{name:'Kick',color:'#FFA63D',vol:.9},
 clap:{name:'Clap',color:'#FF6A3D',vol:.55},
 snare:{name:'Snare',color:'#FF3DAE',vol:.5},
 hat:{name:'Hi-hat',color:'#C8FF3D',vol:.42},
 ohat:{name:'Open Hat',color:'#5CFF8A',vol:.34},
 tom:{name:'Toms',color:'#FFA63D',vol:.5,rows:[{l:'High',f:200},{l:'Mid',f:150},{l:'Low',f:110}]},
 perc:{name:'Perc',color:'#FF6A3D',vol:.38},
 bass:{name:'Bass',color:'#6C8BFF',vol:.8,kind:'note',range:[28,57]},
 sub:{name:'Sub',color:'#6C8BFF',vol:.72,kind:'note',range:[24,48]},
 chord:{name:'Keys',color:'#FF3DAE',vol:.5,kind:'note',range:[48,76]},
 pad:{name:'Pad',color:'#C8FF3D',vol:.42,kind:'note',range:[45,79]},
 arp:{name:'Arp',color:'#FFA63D',vol:.42,kind:'note',range:[55,88]},
 lead:{name:'Lead',color:'#5CFF8A',vol:.4,kind:'note',range:[64,93]},
 fx:{name:'FX',color:'#FF3DAE',vol:.38,kind:'fx',rows:[{l:'Riser',f:1},{l:'Down',f:2},{l:'Impact',f:3},{l:'Reverse',f:4}]},
 smp:{name:'Som',color:'#FFE600',vol:.8,hidden:true},
 loopa:{name:'Loop',color:'#FFE600',vol:.8,kind:'loop',hidden:true}
};
function makeLane(type,key,name){
  const T=TYPES[type];
  return {key,type,name:name||T.name,color:T.color,vol:T.vol,kind:T.kind||'drum',rows:T.rows||[{l:T.name}],range:T.range,h:null,
    active:-1,queued:null,muted:false,preview:null,gain:null,padEls:[],padNm:[],padPg:[],pgIdx:-1,cells:[],shown:''};
}
const MAIN=Object.keys(TYPES).filter(t=>!TYPES[t].hidden).map(t=>makeLane(t,t));
// Tela livre: começa vazia e recebe só o que o usuário adicionar
let freeN=0;
const FREE=loadFree();
function loadFree(){
  try{const j=JSON.parse(localStorage.getItem('gstudio_free'));
    if(j&&Array.isArray(j.lanes)){freeN=j.n|0;return j.lanes.filter(l=>l&&TYPES[l.type]&&typeof l.key==='string').map(l=>Object.assign(makeLane(l.type,l.key,String(l.name||'').slice(0,24).replace(/^Baixo/,'Bass').replace(/^Acordes/,'Chords')||null),{h:+l.h||null}))}}catch(e){}
  return [];
}
function saveFree(){try{localStorage.setItem('gstudio_free',JSON.stringify({n:freeN,lanes:FREE.map(l=>({key:l.key,type:l.type,name:l.name,h:l.h}))}))}catch(e){}}
const ALL=()=>MAIN.concat(FREE,(typeof NOVO!=='undefined'&&NOVO)||[]);
let screen='main',cols=MAIN;
function sortByKind(a){const d=a.filter(l=>l.kind==='drum'),n=a.filter(l=>l.kind!=='drum');a.length=0;a.push(...d,...n)}

// Loops do usuário (4 por linha)
let userVer=0;
let userPats=loadUser();
function loadUser(){
  const u={};
  try{const j=JSON.parse(localStorage.getItem('looppads_user'));
    if(j&&typeof j==='object')Object.keys(j).forEach(k=>{if(Array.isArray(j[k]))u[k]=[0,1,2,3].map(i=>{const p=j[k][i];return p&&Array.isArray(p.data)&&[16,32,64].includes(p.len)?p:null})})}catch(e){}
  ALL().forEach(l=>{if(!u[l.key])u[l.key]=[null,null,null,null]});
  return u;
}
function saveUser(){try{localStorage.setItem('looppads_user',JSON.stringify(userPats))}catch(e){}if(typeof NV!=='undefined'&&NV&&NV.ctx&&NV.ctx!=='draft'&&screen==='novo')saveNovo()}
function getPat(c,i){
  if(i<0)return null;
  if(i<4){if(c.src)return novoPat(c,i);if(c.bpats)return c.bpats[i]||null;return (STYLES[style].p[c.type]||[])[i]||null}
  const u=c.upats||userPats[c.key];return u?u[i-4]||null:null;
}

// Tamanhos: largura das colunas e altura das linhas
let LAY=loadLay();
function loadLay(){const d={hw:null,sw:null,h:{},rh:null,cw:null};try{const j=JSON.parse(localStorage.getItem('gstudio_layout'));if(j){d.hw=+j.hw||null;d.sw=+j.sw||null;d.rh=+j.rh||null;d.cw=+j.cw||null;if(j.h&&typeof j.h==='object')d.h=j.h}}catch(e){}return d}
function saveLay(){LAY.h={};MAIN.forEach(l=>{if(l.h)LAY.h[l.key]=l.h});try{localStorage.setItem('gstudio_layout',JSON.stringify(LAY))}catch(e){}saveFree()}
MAIN.forEach(l=>{const v=+LAY.h[l.key];if(v)l.h=v});
let HW=LAY.hw||(window.innerWidth<1100?112:190),SW=LAY.sw||176;

// Cenas: 8 por tela; cada uma guarda {linha: slot}
const SC={main:null,free:null};
// cenas prontas: intro, groove, pico e break
const DEF_SCENES=[
 {kick:0,hat:0,perc:0,sub:0,pad:0},
 {kick:0,clap:0,hat:1,ohat:0,perc:1,bass:0,sub:0,chord:0,arp:0},
 {kick:1,clap:1,snare:1,hat:2,ohat:1,tom:0,perc:2,bass:1,sub:0,chord:1,pad:1,arp:1,lead:0},
 {sub:2,chord:3,pad:2,arp:2,lead:2,fx:0}];
const OLDK=['kick','clap','snare','hat','ohat','tom','perc','bass','chord','lead'];
function loadScenes(){
  let j=null;try{j=JSON.parse(localStorage.getItem('gstudio_scenes'))}catch(e){}
  const ok=a=>Array.isArray(a)&&a.length===8&&a.every(s=>s===null||(s&&typeof s==='object'&&!Array.isArray(s)));
  SC.main=j&&ok(j.main)?j.main:null;SC.free=j&&ok(j.free)?j.free:Array(8).fill(null);
  if(!SC.main){ // migra o formato antigo (lista por linha)
    let old=null;try{old=JSON.parse(localStorage.getItem('looppads_scenes'))}catch(e){}
    const valid=Array.isArray(old)&&old.length===8;
    SC.main=[...Array(8)].map((_,i)=>{
      if(!valid)return i<4?Object.assign({},DEF_SCENES[i]):null;
      const a=Array.isArray(old[i])&&old[i].length===OLDK.length?old[i]:null;
      if(!a)return null;const o={};OLDK.forEach((key,k)=>{const v=a[k];if(Number.isInteger(v)&&v>=-1&&v<8)o[key]=v});return o;
    });
  }
  // cenas padrão antigas (todas as linhas no mesmo loop) viram as novas
  SC.main=SC.main.map((sc,i)=>{
    if(i<4&&sc&&OLDK.every(k=>sc[k]===i)&&Object.keys(sc).length===OLDK.length)return Object.assign({},DEF_SCENES[i]);
    return sc;
  });
}
loadScenes();
let scenes=SC.main,sceneOn=-1,editMode=false,editing=-1,draft={};
function saveScenes(){try{localStorage.setItem('gstudio_scenes',JSON.stringify(SC))}catch(e){}if(typeof NV!=='undefined'&&NV&&screen==='novo')saveNovo()}

