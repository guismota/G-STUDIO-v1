import { LATE } from '../app/late.js';
import { $, MAIN, STYLES, arpSynth, bass, chord, clapOnly, cols, ctx, engine, flash, fxHit, getPat, hat, inVoice, kick, lead, openRoll, padSynth, perc, playing, refreshPads, saveUser, smpHit, snare, style, subBass, tom, userPats } from '../app/all.js';
// ---------- Editor de loops ----------
const ED={ci:-1,kind:'drum',len:16,grid:[],notes:[],rows:[],bar:0,chrom:false,target:0,prev:false,cells:[],pat:null,lastPos:-1};
let painting=null;
const NN=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const MODES={minor:[0,2,3,5,7,8,10],dorian:[0,2,3,5,7,9,10],phrygian:[0,1,3,5,7,8,10]};
const MODE_PT={minor:'menor',dorian:'dórico',phrygian:'frígio'};
const keyOf=()=>STYLES[style].key||{root:9,mode:'minor'};
const keyName=()=>{const K=keyOf();return NN[K.root]+' '+MODE_PT[K.mode]};
const inScale=m=>{const K=keyOf();return MODES[K.mode].includes(((m-K.root)%12+12)%12)};
const isRoot=m=>((m-keyOf().root)%12+12)%12===0;
const nName=m=>NN[m%12]+(Math.floor(m/12)-1);
function firstEmpty(c){const u=userPats[c.key];const i=u.findIndex(p=>!p);return i<0?0:i}

// drums: grade de uma nota (toms com 3 alturas)
function patToGrid(c,pat,len){
  const g=c.rows.map(()=>Array(len).fill(0)),multi=c.rows.length>1;
  if(pat&&Array.isArray(pat.data))pat.data.forEach(n=>{
    const st=Array.isArray(n)?n[0]:n;if(st>=len)return;
    let r=0,v=1;
    if(Array.isArray(n)&&multi){let best=1e9;c.rows.forEach((row,ri)=>{const dd=Math.abs((row.f||0)-n[1]);if(dd<best){best=dd;r=ri}});v=+n[2]||1}
    else if(Array.isArray(n))v=+n[1]||1;
    g[r][st]=Math.max(.1,Math.min(VMAX,v));
  });
  return g;
}
const VMAX=1.3;
function gridToData(c){
  const d=[],multi=c.rows.length>1;
  for(let i=0;i<ED.len;i++)c.rows.forEach((row,r)=>{const v=ED.grid[r][i];if(!v)return;const vv=Math.round(v*100)/100;
    if(multi)d.push(Math.abs(vv-1)<.01?[i,row.f]:[i,row.f,vv]);else d.push(Math.abs(vv-1)<.01?i:[i,vv])});
  return d;
}

// notas: piano roll
function patToNotes(c,pat,len){
  const n=[];
  if(pat&&Array.isArray(pat.data))pat.data.forEach(x=>{
    if(!Array.isArray(x))return;const s=x[0];if(s>=len)return;
    const l=Math.max(1,Math.min(len-s,Math.round(x[2]||1))),v=typeof x[3]==='number'&&x[3]>0?x[3]:undefined;
    (Array.isArray(x[1])?x[1]:[x[1]]).forEach(m=>n.push(v?{m,s,l,v}:{m,s,l}));
  });
  return n;
}
function notesToData(c){
  const ns=ED.notes.slice().sort((a,b)=>a.s-b.s||a.m-b.m);
  if(isChordT(c.type)){
    const g={};ns.forEach(n=>{const k=n.s+':'+n.l;(g[k]=g[k]||{s:n.s,l:n.l,m:[]}).m.push(n.m)});
    return Object.values(g).sort((a,b)=>a.s-b.s).map(x=>[x.s,x.m,x.l,x.l>=8]);
  }
  return ns.map(n=>n.v&&Math.abs(n.v-1)>.01?[n.s,n.m,n.l,Math.round(n.v*100)/100]:[n.s,n.m,n.l]);
}
function buildRows(c){
  let [lo,hi]=c.range;
  ED.notes.forEach(n=>{lo=Math.min(lo,n.m);hi=Math.max(hi,n.m)});
  const need=new Set(ED.notes.map(n=>n.m));ED.rows=[];
  for(let m=hi;m>=lo;m--)if(ED.chrom||inScale(m)||need.has(m))ED.rows.push(m);
}
const LN=c=>(MAIN.includes(c)&&STYLES[style].names&&STYLES[style].names[c.type])||c.name;
const isChordT=t=>t==='chord'||t==='pad';
const isMono=()=>!isChordT(cols[ED.ci].type);
function noteAt(m,i){return ED.notes.find(n=>n.m===m&&i>=n.s&&i<n.s+n.l)}

function curData(){const c=cols[ED.ci];return ED.kind==='note'?notesToData(c):gridToData(c)}
function syncPreview(){
  const c=cols[ED.ci];ED.pat={len:ED.len,data:curData(),syn:ED.syn};
  if(ED.prev)engine.send({type:'clip.preview',lane:c.key,pattern:ED.pat});
}
function auditionHit(r,v){return inVoice(auditionHit0,null,[r,v])}
function auditionHit0(r,v){
  const c=cols[ED.ci];if(!ctx)return;const t=ctx.currentTime+.01,o=c.gain;v=v||1;
  switch(c.type){case 'smp':smpHit(c,t,o,v);break;case 'kick':kick(t,o,v);break;case 'clap':clapOnly(t,o,v);break;case 'snare':snare(t,o,v);break;case 'hat':hat(t,o,false,v);break;case 'ohat':hat(t,o,true,v);break;case 'perc':perc(t,o,v);break;case 'tom':tom(t,c.rows[r].f,o,v);break;case 'fx':fxHit(t,c.rows[r].f,1.6,o,v);break}
}
function auditionNote(m,v){return inVoice(auditionNote0,null,[m,v])}
function auditionNote0(m,v){
  const c=cols[ED.ci];if(!ctx)return;const t=ctx.currentTime+.01;let o=c.gain;
  if(v&&Math.abs(v-1)>.01){const g=ctx.createGain();g.gain.value=v;g.connect(o);o=g;setTimeout(()=>{try{g.disconnect()}catch(e){}},4000)}
  if(c.type==='bass')bass(t,m,.3,o,1,0,null);else if(c.type==='sub')subBass(t,m,.3,o,1);else if(c.type==='chord')chord(t,[m],.5,o);else if(c.type==='pad')padSynth(t,[m],.8,o);else if(c.type==='arp')arpSynth(t,m,.25,o,1);else lead(t,m,.3,o,1);
}
function loadInto(c,pat){
  ED.syn=pat&&pat.syn?pat.syn:undefined;
  if(ED.kind==='note'){ED.notes=patToNotes(c,pat,ED.len);ED.chrom=ED.notes.some(n=>!inScale(n.m))}
  else ED.grid=patToGrid(c,pat,ED.len);
  syncPreview();
}
function openClipEditor(ci,pi){
  if(cols[ci].kind==='note'){openRoll(ci,pi);return}
  engine.send({type:'audio.unlock'});
  const c=cols[ci],src=getPat(c,pi);
  ED.ci=ci;ED.kind=c.kind;ED.target=pi>=4?pi-4:firstEmpty(c);
  ED.len=src?(src.len||16):16;ED.bar=0;ED.page=0;ED.prev=false;ED.lastPos=-1;
  loadInto(c,src);
  $('#cePrev').classList.remove('on');
  $('#ceTitle').textContent=LN(c)+' · loop';$('#clipEd').style.setProperty('--c',c.color);
  $('#ceNoteCtl').style.display=ED.kind==='note'?'flex':'none';
  $('#ceScale button[data-c="0"]').textContent='Escala '+keyName();
  buildEdChips();buildEd();
  $('#clipEd').classList.add('open');
}
function buildEdChips(){
  const c=cols[ED.ci],t=$('#ceTarget');t.innerHTML='';
  for(let i=0;i<4;i++){
    const b=document.createElement('button');b.className='hw chip';b.textContent='Meu '+(i+1);
    if(userPats[c.key][i])b.classList.add('filled');
    if(ED.target===i)b.classList.add('sel');
    b.onclick=()=>{ED.target=i;buildEdChips()};
    t.appendChild(b);
  }
  const f=$('#ceFrom');f.innerHTML='';
  const add=(label,pat)=>{const b=document.createElement('button');b.className='hw chip';b.textContent=label;b.onclick=()=>{ED.len=pat?(pat.len||16):ED.len;ED.bar=0;loadInto(c,pat);buildEd()};f.appendChild(b)};
  add('Vazio',null);
  for(let i=0;i<8;i++){const p=getPat(c,i);if(p&&Array.isArray(p.data))add(i<4?String(i+1):'M'+(i-3),p)}
}
function buildEd(){
  $('#edGrid').style.setProperty('--cc',cols[ED.ci].color);
  if(ED.kind==='note')buildNoteGrid();else buildEdGrid();
  refreshEdCtl();
}
function refreshEdCtl(){
  $('#ceLen').querySelectorAll('button').forEach(b=>b.classList.toggle('on',+b.dataset.l===ED.len));
  $('#ceBar').querySelectorAll('button').forEach(b=>{b.classList.toggle('on',+b.dataset.b===ED.bar);b.disabled=+b.dataset.b>=ED.len/16});
  $('#ceScale').querySelectorAll('button').forEach(b=>b.classList.toggle('on',(+b.dataset.c===1)===ED.chrom));
}
function buildEdGrid(){
  const c=cols[ED.ci],g=$('#edGrid');g.innerHTML='';ED.cells=c.rows.map(()=>[]);
  const pages=ED.len/16;if(ED.page==null||ED.page>=pages)ED.page=0;
  g.classList.add('stepseq');
  const bar=document.createElement('div');bar.className='sqbar';
  bar.innerHTML='<div class="sqmode"><button data-m="on">Ligar</button><button data-m="vel">Velocidade</button></div><div class="sqpages"></div><button class="sqfollow">Seguir</button>';
  bar.querySelectorAll('.sqmode button').forEach(b=>{b.classList.toggle('sel',b.dataset.m===(ED.mode||'on'));b.onclick=()=>{ED.mode=b.dataset.m;buildEdGrid()}});
  const pg=bar.querySelector('.sqpages');
  for(let p=0;p<4;p++){const b=document.createElement('button');b.className='sqpg'+(p===ED.page?' sel':'')+(p>=pages?' off':'');b.textContent=p+1;
    const has=p<pages&&ED.grid.some(row=>row.slice(p*16,p*16+16).some(v=>v>0));if(has)b.classList.add('has');
    b.onclick=()=>{if(p>=pages)return;ED.page=p;buildEdGrid()};pg.appendChild(b)}
  const fo=bar.querySelector('.sqfollow');fo.classList.toggle('sel',ED.follow!==false);fo.style.display=pages>1?'':'none';fo.onclick=()=>{ED.follow=ED.follow===false;buildEdGrid()};
  g.appendChild(bar);
  const wrap=document.createElement('div');wrap.className='sqgrid'+(ED.mode==='vel'?' vel':'');
  c.rows.forEach((row,r)=>{
    const line=document.createElement('div');line.className='sqrow';
    const lb=document.createElement('span');lb.className='sqname';lb.textContent=c.rows.length>1?row.l:LN(c);line.appendChild(lb);
    for(let k=0;k<16;k++){
      const i=ED.page*16+k,v=ED.grid[r][i]||0,e=document.createElement('button');
      e.className='cell sqs'+(k%4===0?' beat':'')+(v?' on':'');e.style.setProperty('--v',(v/VMAX).toFixed(3));
      e.dataset.r=r;e.dataset.i=i;e.innerHTML='<i></i>';
      line.appendChild(e);ED.cells[r][i]=e;
    }
    wrap.appendChild(line);
  });
  const ru=document.createElement('div');ru.className='sqrow sqrule';ru.innerHTML='<span></span>'+Array.from({length:16},(_,k)=>'<b>'+(k%4===0?(ED.page*4+k/4+1):'')+'</b>').join('');
  wrap.appendChild(ru);
  g.appendChild(wrap);ED.lastPos=-1;
}
function buildNoteGrid(){
  const c=cols[ED.ci],g=$('#edGrid');g.innerHTML='';g.classList.remove('stepseq');buildRows(c);
  ED.cells=ED.rows.map(()=>[]);ED.lastPos=-1;
  const wrap=document.createElement('div');wrap.className='nroll';
  ED.rows.forEach((m,r)=>{
    const line=document.createElement('div');line.className='nrow'+(isRoot(m)?' root':'');
    const lb=document.createElement('span');lb.textContent=nName(m);line.appendChild(lb);
    for(let k=0;k<16;k++){
      const i=ED.bar*16+k,e=document.createElement('button');
      e.className='ncell'+(k%4===0?' beat':'');e.dataset.r=r;e.dataset.i=i;
      line.appendChild(e);ED.cells[r][i]=e;
    }
    wrap.appendChild(line);
  });
  g.appendChild(wrap);paintNotes();
}
function paintNotes(){
  ED.cells.forEach((row,r)=>{const m=ED.rows[r];row.forEach((e,i)=>{
    const n=noteAt(m,i);
    e.classList.toggle('on',!!n);e.classList.toggle('st',!!n&&i===n.s);e.classList.toggle('end',!!n&&i===n.s+n.l-1);
  })});
}
function noteDown(el){
  const m=ED.rows[+el.dataset.r],i=+el.dataset.i,ex=noteAt(m,i);
  if(ex){ED.notes.splice(ED.notes.indexOf(ex),1);painting={erase:true}}
  else{
    if(isMono()){ // baixo e lead: uma nota por vez
      ED.notes=ED.notes.filter(n=>n.s!==i);
      ED.notes.forEach(n=>{if(n.s<i&&n.s+n.l>i)n.l=i-n.s});
    }
    const n={m,s:i,l:1};ED.notes.push(n);painting={note:n};auditionNote(m);
  }
  paintNotes();syncPreview();
}
function noteMove(el){
  const m=ED.rows[+el.dataset.r],i=+el.dataset.i;
  if(painting.erase){const ex=noteAt(m,i);if(ex){ED.notes.splice(ED.notes.indexOf(ex),1);paintNotes();syncPreview()}return}
  const n=painting.note;if(m!==n.m||i<n.s)return;
  let l=i-n.s+1;
  ED.notes.forEach(o=>{if(o!==n&&o.s>n.s&&(isMono()||o.m===n.m))l=Math.min(l,o.s-n.s)});
  l=Math.min(l,ED.len-n.s);
  if(l!==n.l){n.l=l;paintNotes();syncPreview()}
}
function setCell(el,v){
  const r=+el.dataset.r,i=+el.dataset.i;if(ED.grid[r][i]===v)return;
  const was=ED.grid[r][i];ED.grid[r][i]=v;el.classList.toggle('on',!!v);el.style.setProperty('--v',(v/VMAX).toFixed(3));if(v&&!was)auditionHit(r,v);syncPreview();
}
function velAt(el,y){const b=el.getBoundingClientRect();return Math.max(.1,Math.min(VMAX,(1-(y-b.top)/b.height)*VMAX))}
function cellAt(x,y){const e=document.elementFromPoint(x,y);const c=e&&e.closest?e.closest('.cell,.ncell'):null;return c&&c.closest('#edGrid')?c:null}
const edg=$('#edGrid');
edg.addEventListener('pointerdown',e=>{
  const el=cellAt(e.clientX,e.clientY);if(!el)return;e.preventDefault();
  if(ED.kind==='note'){noteDown(el);return}
  const cur=ED.grid[+el.dataset.r][+el.dataset.i];
  if(ED.mode==='vel'){painting={vel:true};setCell(el,Math.round(velAt(el,e.clientY)*20)/20);return}
  painting=cur?0:1;setCell(el,painting);
});
edg.addEventListener('pointermove',e=>{
  if(painting===null)return;const el=cellAt(e.clientX,e.clientY);if(!el)return;
  if(ED.kind==='note')noteMove(el);else if(painting&&painting.vel){setCell(el,Math.round(velAt(el,e.clientY)*20)/20)}else setCell(el,painting);
});
['pointerup','pointercancel'].forEach(ev=>window.addEventListener(ev,()=>{painting=null}));
$('#ceLen').querySelectorAll('button').forEach(b=>b.onclick=()=>{
  const c=cols[ED.ci],nl=+b.dataset.l;if(nl===ED.len)return;
  if(ED.kind==='note'){
    ED.notes=ED.notes.filter(n=>n.s<nl);ED.notes.forEach(n=>n.l=Math.min(n.l,nl-n.s));
    if(ED.bar>=nl/16)ED.bar=0;
  }else{ED.grid=c.rows.map((_,r)=>Array.from({length:nl},(_,i)=>ED.grid[r][i]||0));if(nl>ED.len){for(let r=0;r<ED.grid.length;r++)for(let i=ED.len;i<nl;i++)ED.grid[r][i]=ED.grid[r][i%ED.len]||0}if(ED.page>=nl/16)ED.page=0}
  ED.len=nl;syncPreview();buildEd();
});
$('#ceBar').querySelectorAll('button').forEach(b=>b.onclick=()=>{const v=+b.dataset.b;if(v>=ED.len/16)return;ED.bar=v;buildEd()});
$('#ceScale').querySelectorAll('button').forEach(b=>b.onclick=()=>{ED.chrom=+b.dataset.c===1;buildEd()});
$('#cePrev').onclick=()=>{
  engine.send({type:'audio.unlock'});ED.prev=!ED.prev;$('#cePrev').classList.toggle('on',ED.prev);
  const c=cols[ED.ci];
  if(ED.prev){syncPreview();engine.send({type:'clip.preview',lane:c.key,pattern:ED.pat});if(!playing)engine.send({type:'transport.play'})}else engine.send({type:'clip.preview',lane:c.key,pattern:null});
};
$('#ceClear').onclick=()=>{
  const c=cols[ED.ci];
  if(ED.kind==='note')ED.notes=[];else ED.grid=c.rows.map(()=>Array(ED.len).fill(0));
  syncPreview();buildEd();
};
function closeClipEditor(){
  if(ED.ci>=0)engine.send({type:'clip.preview',lane:cols[ED.ci].key,pattern:null});
  ED.ci=-1;ED.prev=false;$('#clipEd').classList.remove('open');
}
$('#ceCancel').onclick=closeClipEditor;
$('#ceDel').onclick=()=>{
  const c=cols[ED.ci];userPats[c.key][ED.target]=null;
  if(c.active===4+ED.target)c.active=-1;if(c.queued===4+ED.target)c.queued=null;
  saveUser();LATE.userVer++;refreshPads();closeClipEditor();flash('Apagado. Bola pra frente');
};
$('#ceSave').onclick=()=>{
  const c=cols[ED.ci],data=curData();
  if(!data.length){flash('Loop vazio. Coloca alguma coisa aí');return}
  userPats[c.key][ED.target]={name:'Meu '+(ED.target+1),len:ED.len,data,syn:ED.syn};
  saveUser();LATE.userVer++;refreshPads();flash('Salvo em Meu '+(ED.target+1)+'. Agora é só soltar');closeClipEditor();
};


export { ED, LN, auditionNote, buildEdGrid, buildRows, cellAt, curData, firstEmpty, inScale, isChordT, isMono, isRoot, keyName, loadInto, nName, noteDown, noteMove, openClipEditor, paintNotes, painting, syncPreview };
