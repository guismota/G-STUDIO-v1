import { LATE } from '../app/late.js';
import { $, CC0, GENRES, LANECAT, LIBM, NOVO, NOVO_STY, NV, STYLES, TYPES, XCATN, XS, buildSession, engine, guessHit, laneDefs, novoLane, novoLoadDraft, openNovoSession, playing, previewPlay, refreshPads, saveNovo, saveUser, screen, sortByKind, stopPreview, undoReset, userPats, xRender, xToast } from '../app/all.js';
// ---------- IndexedDB ----------
var IDBP=null;
function idb(){if(IDBP)return IDBP;IDBP=new Promise((res,rej)=>{try{const r=indexedDB.open('gstudio',1);r.onupgradeneeded=()=>{r.result.createObjectStore('files')};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}});return IDBP}
function idbDo(mode,fn){return idb().then(db=>new Promise((res,rej)=>{const tx=db.transaction('files',mode),st=tx.objectStore('files');const r=fn(st);tx.oncomplete=()=>res(r&&'result' in r?r.result:undefined);tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error)}))}
const idbPut=(id,ab)=>idbDo('readwrite',st=>st.put(ab,id));
const idbGet=id=>idbDo('readonly',st=>st.get(id));
const idbDel=id=>idbDo('readwrite',st=>st.delete(id));
function loadLib(){try{const j=JSON.parse(localStorage.getItem('gstudio_lib'));if(j){LIBM.items=Array.isArray(j.items)?j.items:[];LIBM.folders=Array.isArray(j.folders)?j.folders:[];LIBM.favs=Array.isArray(j.favs)?j.favs:[]}}catch(e){}}
function saveLib(){try{localStorage.setItem('gstudio_lib',JSON.stringify(LIBM))}catch(e){xToast('Sem espaço para salvar a biblioteca')}}

// ---------- itens da biblioteca ----------
function genreName(g){return g==='solomun'?'Afterparty':STYLES[g].name}
function libAll(){
  const out=[];
  LIBM.items.slice().sort((a,b)=>(b.added||0)-(a.added||0)).forEach(u=>out.push(Object.assign({src:'u'},u)));
  CC0.forEach(c=>out.push({id:'c:'+c.f,src:'c',name:c.name,cat:c.cat,kind:'oneshot',h:c.h}));
  GENRES.forEach(G=>{const S=STYLES[G.k];Object.keys(LANECAT).forEach(t=>{const pats=S.p[t]||[];if(!pats.some(Boolean))return;
    out.push({id:'n:'+G.k+':'+t,src:'n',g:G.k,t,name:(S.names&&S.names[t])||TYPES[t].name,cat:LANECAT[t],kind:'inst',bpm:S.bpm,loops:pats.map(p=>p?p.name:'')})})});
  return out;
}
function libFind(id){return libAll().find(x=>x.id===id)}
function libSub(it){
  if(it.kind==='inst')return genreName(it.g)+' · '+it.bpm+' BPM · '+it.loops.filter(Boolean).length+' loops';
  const a=[it.src==='u'?(it.rec?'Gravado':'Importado'):'G-STUDIO',XCATN[it.cat]||'Outros'];
  if(it.kind==='loop')a.push('Loop · '+(it.bars||1)+(it.bars>1?' compassos':' compasso')+' · '+Math.round(it.bpm||0)+' BPM');else a.push('Som curto'+(it.dur?' · '+it.dur.toFixed(1).replace('.',',')+' s':''));
  return a.join(' · ');
}
function libVisible(){
  const q=XS.q.trim().toLowerCase(),fav=new Set(LIBM.favs);
  let L=libAll();
  const v=XS.view;
  if(v==='fav')L=L.filter(x=>fav.has(x.id));
  else if(v==='mine')L=L.filter(x=>x.src==='u');
  else if(v.startsWith('cat:'))L=L.filter(x=>x.cat===v.slice(4));
  else if(v.startsWith('f:')){const f=LIBM.folders.find(f=>f.id===v.slice(2));const ids=f?f.ids:[];L=ids.map(id=>L.find(x=>x.id===id)).filter(Boolean)}
  if(XS.type!=='all')L=L.filter(x=>x.kind===XS.type);
  if(XS.genre!=='all')L=L.filter(x=>x.src==='n'&&x.g===XS.genre);
  if(q)L=L.filter(x=>(x.name+' '+(x.g?genreName(x.g):'')+' '+(XCATN[x.cat]||'')+' '+(x.kind==='loop'?'loop':'')).toLowerCase().includes(q));
  return L;
}

// ---------- classificação de arquivos importados ----------
function classify(name,dur){
  const n=name.toLowerCase();let cat='other';
  const R=[['vocal',/vox|vocal|voice|voz|acapella|chant|shout|hey|yeah/],['fx',/\bfx\b|riser|impact|sweep|noise|whoosh|uplift|downlift|rise|siren|sirene/],
    ['bass',/bass|baixo|\bsub\b|808|reese/],['drums',/kick|bumbo|\bbd\b|snare|caixa|\bsd\b|clap|palma|hat|hh|chimbal|cymbal|crash|ride|prato|drum|bateria|beat|break|top/],
    ['perc',/perc|conga|bongo|\btom\b|shaker|rim|clave|cowbell|tamb|atabaque|surdo|timbal/],['keys',/pad|chord|acorde|keys|piano|rhodes|organ|orgao|órgão|string/],
    ['synth',/lead|synth|arp|pluck|bell|stab|melod|hook/]];
  for(const [c,re] of R)if(re.test(n)){cat=c;break}
  const mb=/(\d{2,3})\s*bpm/.exec(n)||/(?:^|[^\d])(\d{2,3})(?:[^\d]|$)/.exec(n.replace(/\.[a-z0-9]+$/,''));
  let bpm=mb?+mb[1]:0;if(bpm<70||bpm>180)bpm=0;
  const isLoop=/loop/.test(n)||(bpm&&dur>1.2)||dur>3.5;
  let bars=1;
  if(isLoop){
    if(bpm){bars=Math.max(1,Math.round(dur*bpm/240));}
    else{let best=null;[1,2,4,8,16].forEach(b=>{const t=b*240/dur;if(t>=80&&t<=175){const s=Math.abs(t-124);if(!best||s<best.s)best={b,t,s}}});
      if(best){bars=best.b;bpm=Math.round(best.t*10)/10}else{bars=Math.max(1,Math.round(dur*124/240));bpm=Math.round(bars*240/dur*10)/10}}
  }
  if(cat==='other'&&!isLoop&&dur<1.2)cat='drums';
  return {cat,kind:isLoop?'loop':'oneshot',bpm:bpm||124,bars};
}
const uid=()=>'u:'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
async function importFiles(files){
  engine.send({type:'audio.unlock'});let ok=0,bad=0;const added=[];
  for(const f of files){
    if(f.size>60*1024*1024){bad++;continue}
    try{const ab=await f.arrayBuffer(),id=uid();
      await idbPut(id,ab);
      const r=await engine.request({type:'sample.load',id},'sample.loaded'); // o motor abre e prepara o som
      if(!r.ok){idbDel(id).catch(()=>{});throw new Error('decode')}
      const base=f.name.replace(/\.[a-z0-9]+$/i,'').replace(/[_]+/g,' ').trim().slice(0,40)||'Som';
      const c=classify(f.name,r.duration);
      LIBM.items.push({id,name:base,cat:c.cat,kind:c.kind,bpm:c.bpm,bars:c.bars,dur:+r.duration.toFixed(2),added:Date.now(),size:f.size});added.push(id);ok++;
    }catch(e){bad++}
  }
  saveLib();
  if(ok){XS.view='mine';XS.type='all';XS.genre='all';XS.q='';$('#xq').value='';XS.flash=added}
  xToast(ok?(ok===1?'1 som importado':ok+' sons importados')+(bad?' · '+bad+' não abriram':''):'Não deu para abrir esse arquivo. Use WAV, MP3, M4A ou AIFF.');
  xRender();
}

// ---------- audição ----------
function xStopAud(){const a=XS.aud;XS.aud=null;if(a&&a.stop)a.stop();document.querySelectorAll('#explore .on-aud').forEach(e=>e.classList.remove('on-aud'))}
function xAudition(it,li,btn){
  const same=XS.aud&&XS.aud.id===it.id&&XS.aud.li===li;xStopAud();if(same)return;
  engine.send({type:'audio.unlock'});stopPreview();if(playing)engine.send({type:'transport.stop'});
  if(btn)btn.classList.add('on-aud');
  if(it.kind==='inst'){
    const idx=li!=null?li:Math.max(0,it.loops.findIndex(Boolean));
    previewPlay({type:'preview.start',id:'aud:'+it.id,genre:it.g,plan:Array.from({length:4},()=>({[it.t]:idx})),bars:4,end:false,volume:.7},()=>{if(XS.aud&&XS.aud.id===it.id)xStopAud()});
    XS.aud={id:it.id,li,stop:()=>engine.send({type:'preview.stop'})};return;
  }
  const token='a'+(++AUDN);XS.aud={id:it.id,li,token,stop:()=>engine.send({type:'sample.stopAudition'})};
  engine.send({type:'sample.audition',id:it.id,kind:it.kind,token});
}
let AUDN=0;
engine.on('sample.audition',e=>{if(!e.ok&&XS.aud&&XS.aud.token===e.token){xToast('Som indisponível');xStopAud()}});
engine.on('sample.auditionEnded',e=>{if(XS.aud&&XS.aud.token===e.token)xStopAud()});


// ---------- adicionar à página em branco ----------
function novoAdd(it){
  NV.n++;const key=(NV.ctx&&NV.ctx!=='draft'?NV.ctx+'_x':'n')+NV.n;
  let o;
  if(it.kind==='inst')o={key,type:it.t,name:it.name+' · '+genreName(it.g).replace(' House','').replace('Acid Techno','Acid T.'),src:it.g};
  else if(it.kind==='loop')o={key,type:'loopa',name:it.name,smp:it.id,cat:it.cat,lbpm:it.bpm,bars:it.bars};
  else o={key,type:'smp',name:it.name,smp:it.id,cat:it.cat,h:it.h||guessHit(it.name,it.cat)};
  const l=novoLane(o);NOVO.push(l);sortByKind(NOVO);userPats[key]=[null,null,null,null];if(NV.ctx!=='draft')l.upats=userPats[key];
  engine.send({type:'lanes.sync',lanes:laneDefs()});
  saveNovo();saveUser();
  if(screen==='novo')buildSession();
  xToast(l.name+' entrou na página');xRender();
}
function enterNovo(){
  if(playing)engine.send({type:'transport.stop'});
  if(NV.ctx!=='draft')novoLoadDraft();
  NOVO_STY.name='Criar novo';openNovoSession();
}
// desfazer: abrir o Criar novo zera o histórico (estava em state/history.js; fica junto da função que modifica)
{const en=enterNovo;enterNovo=function(){const r=en.apply(this,arguments);undoReset();return r}}

// ---------- tom do Criar novo ----------
const NOTE_PT=['Dó','Dó#','Ré','Mi♭','Mi','Fá','Fá#','Sol','Lá♭','Lá','Si♭','Si'],MODE_N={minor:'menor',dorian:'dórico',phrygian:'frígio'};
function updNvKey(){const b=$('#nvKey');if(b)b.innerHTML='<small>Tom</small> '+NOTE_PT[NV.root]+' '+MODE_N[NV.mode]+(NV.auto?'':' <em>livre</em>')}
function openNvKey(){
  const m=$('#nvKeyDlg'),r=m.querySelector('.nkr'),md=m.querySelector('.nkm');r.innerHTML='';md.innerHTML='';
  NOTE_PT.forEach((n,i)=>{const b=document.createElement('button');b.className='hw'+(i===NV.root?' on':'');b.textContent=n;b.onclick=()=>{NV.root=i;nvKeyApply()};r.appendChild(b)});
  Object.keys(MODE_N).forEach(k=>{const b=document.createElement('button');b.className='hw'+(k===NV.mode?' on':'');b.textContent=MODE_N[k];b.onclick=()=>{NV.mode=k;nvKeyApply()};md.appendChild(b)});
  m.querySelector('#nvAuto').checked=NV.auto;m.classList.add('open');
}
function nvKeyApply(){NOVO_STY.key={root:NV.root,mode:NV.mode};NOVO.forEach(c=>{c._tp={}});LATE.userVer++;saveNovo();updNvKey();refreshPads();if($('#nvKeyDlg').classList.contains('open'))openNvKey()}

export { MODE_N, NOTE_PT, classify, enterNovo, genreName, idb, idbDel, idbDo, idbGet, idbPut, importFiles, libAll, libSub, libVisible, loadLib, novoAdd, nvKeyApply, openNvKey, saveLib, uid, updNvKey, xAudition, xStopAud };
