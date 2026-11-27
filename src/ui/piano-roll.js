// ---------- Piano roll (página cheia, com gravação) ----------
const RL={open:false,base:36,rec:false,count:true,met:true,keys:{},kbEls:{},last:''};
const BLACK=[1,3,6,8,10];
function openRoll(ci,pi){
  initAudio();
  const c=cols[ci],src=getPat(c,pi);
  ED.ci=ci;ED.kind='note';ED.target=pi>=4?pi-4:firstEmpty(c);
  ED.len=src?(src.len||16):16;ED.prev=false;ED.lastPos=-1;ED.bar=0;
  loadInto(c,src);
  RL.base=c.type==='sub'?24:c.type==='bass'?36:isChordT(c.type)?48:60;
  RL.rec=false;MET.on=false;RL.last='';
  const r=$('#roll');r.style.setProperty('--c',c.color);
  $('#rlTitle').textContent=LN(c);
  $('#rlKey').textContent=STYLES[style].name+' · '+keyName();
  $('#rlScale button[data-c="0"]').textContent='Escala '+keyName();
  r.classList.add('open');RL.open=true;
  rlChips();rlBuild();rlBuildKb();rlUI();
}
function closeRoll(){
  RL.rec=false;MET.on=false;
  if(ED.ci>=0)cols[ED.ci].preview=null;
  ED.ci=-1;ED.prev=false;RL.open=false;$('#roll').classList.remove('open');
  Object.keys(RL.keys).forEach(id=>delete RL.keys[id]);
}
function rlChips(){
  const c=cols[ED.ci],t=$('#rlTarget');t.innerHTML='';
  for(let i=0;i<4;i++){
    const b=document.createElement('button');b.className='hw chip';b.textContent='Meu '+(i+1);
    if(userPats[c.key][i])b.classList.add('filled');
    if(ED.target===i)b.classList.add('sel');
    b.onclick=()=>{ED.target=i;rlChips()};t.appendChild(b);
  }
  const f=$('#rlFrom');f.innerHTML='';
  const add=(label,pat)=>{const b=document.createElement('button');b.className='hw chip';b.textContent=label;
    b.onclick=()=>{ED.len=pat?(pat.len||16):ED.len;loadInto(c,pat);rlBuild();rlUI()};f.appendChild(b)};
  add('Vazio',null);
  for(let i=0;i<8;i++){const p=getPat(c,i);if(p&&Array.isArray(p.data))add(i<4?String(i+1):'M'+(i-3),p)}
}
function rlBuild(){
  const c=cols[ED.ci],g=$('#rlGrid');g.innerHTML='';buildRows(c);
  g.style.setProperty('--n',ED.len);
  ED.cells=ED.rows.map(()=>[]);ED.lastPos=-1;
  ED.rows.forEach((m,r)=>{
    const line=document.createElement('div');
    line.className='nrow'+(isRoot(m)?' root':'')+(BLACK.includes(m%12)?' blk':'');
    const lb=document.createElement('span');lb.textContent=nName(m);line.appendChild(lb);
    for(let i=0;i<ED.len;i++){
      const e=document.createElement('button');
      e.className='ncell'+(i%4===0?' beat':'')+(i%16===0&&i>0?' bar':'');
      e.dataset.r=r;e.dataset.i=i;line.appendChild(e);ED.cells[r][i]=e;
    }
    g.appendChild(line);
  });
  paintNotes();
  // mostra a região onde estão as notas (ou o centro)
  const ms=ED.notes.map(n=>ED.rows.indexOf(n.m)).filter(i=>i>=0);
  const mid=ms.length?ms.reduce((a,b)=>a+b,0)/ms.length:ED.rows.length/2;
  const rh=g.firstChild?g.firstChild.offsetHeight+2:28;
  g.scrollTop=Math.max(0,mid*rh-g.clientHeight/2);
}
function rlBuildKb(){
  const kb=$('#rlKb');kb.innerHTML='';RL.kbEls={};
  const whites=[];for(let m=RL.base;m<=RL.base+24;m++)if(!BLACK.includes(m%12))whites.push(m);
  kb.style.setProperty('--nw',whites.length);
  whites.forEach(m=>{
    const k=document.createElement('div');k.className='kw'+(inScale(m)?'':' out')+(isRoot(m)?' root':'');k.dataset.m=m;
    if(m%12===0||isRoot(m))k.textContent=nName(m);
    kb.appendChild(k);RL.kbEls[m]=k;
  });
  for(let m=RL.base;m<=RL.base+24;m++){
    if(!BLACK.includes(m%12))continue;
    const wi=whites.indexOf(m-1)+1,k=document.createElement('div');
    k.className='kbk'+(inScale(m)?'':' out');k.dataset.m=m;k.style.left='calc(100% / '+whites.length+' * '+wi+')';
    kb.appendChild(k);RL.kbEls[m]=k;
  }
  if(DEV.kind!=='phone'&&CFG.keys)MT_KEYS.forEach((ch,i)=>{const el=RL.kbEls[RL.base+i];if(el)el.insertAdjacentHTML('beforeend','<small class="mtk">'+ch+'</small>')});
  const r=$('#rlMt');if(r)r.textContent='Oitava '+nName(RL.base)+' · Vel '+RL.vel;
}
// Musical Typing do Logic: A S D F G H J K L Ç ~ = teclas brancas; W E T Y U O P = pretas; Z X = oitava; C V = velocidade
const MT_CODES=['KeyA','KeyW','KeyS','KeyE','KeyD','KeyF','KeyT','KeyG','KeyY','KeyH','KeyU','KeyJ','KeyK','KeyO','KeyL','KeyP','Semicolon','Quote'];
const MT_KEYS=['A','W','S','E','D','F','T','G','Y','H','U','J','K','O','L','P',';',"'"];
RL.vel=100;
function rlKeys(e){
  if(!RL.open||!CFG.keys||typing(e)||e.metaKey||e.ctrlKey||e.altKey)return;
  if(document.querySelector('.modal.open,.xdlg.open'))return;
  const down=e.type==='keydown',i=MT_CODES.indexOf(e.code);
  if(i>=0){e.preventDefault();e.stopPropagation();if(e.repeat)return;const m=RL.base+i,id='k'+e.code;
    if(down){if(!RL.keys[id]){initAudio();rlNoteOn(m,id,RL.vel/100)}}else rlNoteOff(id);return}
  if(!down)return;
  const k=e.code;
  if(k==='KeyZ'){e.preventDefault();e.stopPropagation();$('#rlOctDn').click();return}
  if(k==='KeyX'){e.preventDefault();e.stopPropagation();$('#rlOctUp').click();return}
  if(k==='KeyC'||k==='KeyV'){e.preventDefault();e.stopPropagation();RL.vel=Math.max(1,Math.min(127,RL.vel+(k==='KeyV'?16:-16)));const r=$('#rlMt');if(r)r.textContent='Oitava '+nName(RL.base)+' · Vel '+RL.vel;return}
  if(k==='Space'){e.preventDefault();e.stopPropagation();if(!e.repeat)$('#rlPlay').click();return}
  if(k==='KeyR'){e.preventDefault();e.stopPropagation();if(!e.repeat)$('#rlRec').click();return}
}
document.addEventListener('keydown',rlKeys,true);document.addEventListener('keyup',rlKeys,true);
window.addEventListener('blur',()=>{Object.keys(RL.keys).filter(id=>id[0]==='k').forEach(id=>rlNoteOff(id))});
function rlUI(){
  $('#rlPlay').innerHTML=playing?ICON.stop:ICON.play;
  $('#rlPlay').classList.toggle('on',playing);
  $('#rlRec').classList.toggle('on',RL.rec);
  $('#rlMet').classList.toggle('on',RL.met);
  $('#rlCount').classList.toggle('on',RL.count);
  $('#rlLen').querySelectorAll('button').forEach(b=>b.classList.toggle('on',+b.dataset.l===ED.len));
  $('#rlScale').querySelectorAll('button').forEach(b=>b.classList.toggle('on',(+b.dataset.c===1)===ED.chrom));
}
function rlNoteOn(m,id,v){
  if(!ctx)return;
  RL.keys[id]={m,t:ctx.currentTime,v:v||1};
  const el=RL.kbEls[m];if(el)el.classList.add('dn');
  auditionNote(m,v||1);
}
function rlNoteOff(id){
  const k=RL.keys[id];if(!k)return;delete RL.keys[id];
  if(!Object.values(RL.keys).some(o=>o.m===k.m)){const el=RL.kbEls[k.m];if(el)el.classList.remove('dn')}
  if(RL.rec&&playing&&ED.ci>=0)rlRecord(k.m,k.t,ctx.currentTime,k.v);
}
// encaixa a nota tocada na grade (1/16) e grava no loop
function rlRecord(m,t0,t1,v){
  const sd=60/bpm/4,lat=(ctx.outputLatency||0)+(ctx.baseLatency||0),start=tT0+barOff*16*sd;
  const a=t0-lat,b=t1-lat;
  if(a<start-sd/2)return;
  let s=Math.round((a-start)/sd),l=Math.max(1,Math.round((b-a)/sd));
  s=((s%ED.len)+ED.len)%ED.len;l=Math.min(l,ED.len-s);
  if(isMono()){ED.notes=ED.notes.filter(n=>n.s!==s);ED.notes.forEach(n=>{if(n.s<s&&n.s+n.l>s)n.l=s-n.s})}
  else ED.notes=ED.notes.filter(n=>!(n.s===s&&n.m===m));
  ED.notes.push(v&&Math.abs(v-1)>.01&&!isChordT(cols[ED.ci].type)?{m,s,l,v}:{m,s,l});
  if(!ED.rows.includes(m))rlBuild();else paintNotes();
  syncPreview();
  return {s,l};
}
function rlStartPlay(countIn){
  ED.prev=true;syncPreview();
  startTransport(countIn);
}
$('#rlPlay').onclick=()=>{
  initAudio();
  if(playing){RL.rec=false;MET.on=false;stopTransport(true)}
  else rlStartPlay(false);
  rlUI();
};
$('#rlRec').onclick=()=>{
  initAudio();
  if(RL.rec){RL.rec=false;MET.on=false;rlUI();return}
  RL.rec=true;MET.on=RL.met;
  rlStartPlay(RL.count);
  rlUI();
};
$('#rlMet').onclick=()=>{RL.met=!RL.met;if(RL.rec)MET.on=RL.met;rlUI()};
$('#rlCount').onclick=()=>{RL.count=!RL.count;rlUI()};
$('#rlLen').querySelectorAll('button').forEach(b=>b.onclick=()=>{
  const nl=+b.dataset.l;if(nl===ED.len)return;
  ED.notes=ED.notes.filter(n=>n.s<nl);ED.notes.forEach(n=>n.l=Math.min(n.l,nl-n.s));
  ED.len=nl;syncPreview();rlBuild();rlUI();
});
$('#rlScale').querySelectorAll('button').forEach(b=>b.onclick=()=>{ED.chrom=+b.dataset.c===1;rlBuild();rlUI()});
$('#rlClear').onclick=()=>{ED.notes=[];syncPreview();rlBuild()};
$('#rlClose').onclick=closeRoll;
$('#rlOctDn').onclick=()=>{RL.base=Math.max(12,RL.base-12);rlBuildKb()};
$('#rlOctUp').onclick=()=>{RL.base=Math.min(84,RL.base+12);rlBuildKb()};
$('#rlSave').onclick=()=>{
  const c=cols[ED.ci],data=curData();
  if(!data.length){flash('Loop vazio. Coloca alguma coisa aí');return}
  userPats[c.key][ED.target]={name:'Meu '+(ED.target+1),len:ED.len,data,syn:ED.syn};
  saveUser();userVer++;refreshPads();flash('Salvo em Meu '+(ED.target+1)+'. Agora é só soltar');closeRoll();
};
(()=>{ // teclado na tela: vários dedos e deslizar entre teclas
  const kb=$('#rlKb');
  kb.addEventListener('pointerdown',e=>{
    const el=e.target.closest('[data-m]');if(!el)return;e.preventDefault();
    try{kb.setPointerCapture(e.pointerId)}catch(_){}
    rlNoteOn(+el.dataset.m,e.pointerId);
  });
  kb.addEventListener('pointermove',e=>{
    const k=RL.keys[e.pointerId];if(!k)return;
    const el=document.elementFromPoint(e.clientX,e.clientY),m=el&&el.dataset&&el.dataset.m?+el.dataset.m:null;
    if(m!==null&&m!==k.m){rlNoteOff(e.pointerId);rlNoteOn(m,e.pointerId)}
  });
  ['pointerup','pointercancel'].forEach(ev=>kb.addEventListener(ev,e=>rlNoteOff(e.pointerId)));
  // desenhar notas com o dedo na grade
  const g=$('#rlGrid');
  g.addEventListener('pointerdown',e=>{const el=cellAt(e.clientX,e.clientY);if(!el)return;e.preventDefault();noteDown(el)});
  g.addEventListener('pointermove',e=>{if(painting===null)return;const el=cellAt(e.clientX,e.clientY);if(el)noteMove(el)});
})();
function rlTick(){ // atualiza o display do piano roll
  if(!RL.open)return;
  let pos='1.1.1',st='Parado',cls='';
  if(playing&&cur>=0){
    if(curBar<0){pos=String(4-Math.floor(cur/4));st='Se prepara';cls='count'}
    else{pos=(pmN(curBar,ED.len/16)+1)+'.'+(Math.floor(cur/4)+1)+'.'+(cur%4+1);st=RL.rec?'Gravando':'Tocando';cls=RL.rec?'rec':''}
  }
  const key=pos+st+playing;
  if(key!==RL.last){RL.last=key;$('#rlPos').textContent=pos;$('#rlState').textContent=st;$('#rlLcd').className='rlcd '+cls;
    $('#rlPlay').innerHTML=playing?ICON.stop:ICON.play;$('#rlPlay').classList.toggle('on',playing)}
}

