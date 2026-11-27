// ---------- interface do Explorar ----------
function xToast(m){const t=$('#xToast');t.textContent=m;t.classList.remove('show');void t.offsetWidth;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2400)}
function openExplore(pick){
  if(!pick&&!XS.open&&!reduceMotion()){stopPreview();pageWipe({c:'#ffffff',ch:'BIBLIOTECA',nm:'Explorar'},()=>openExplore0(false));return}
  openExplore0(pick);
}
function openExplore0(pick){
  stopPreview();XS.pick=!!pick;XS.open=true;
  const x=$('#explore');x.classList.toggle('pick',XS.pick);x.classList.add('open');document.body.classList.add('in-explore');
  $('#xTitle').textContent=XS.pick?'Adicionar sons':'Explorar';
  xRender();
}
function closeExplore(){
  if(!XS.pick&&!reduceMotion()){pageWipe({c:'#FFE600',ch:'G-STUDIO',nm:'Início'},closeExplore0);return}
  closeExplore0();
}
function closeExplore0(){xStopAud();closeXMenu();XS.open=false;$('#explore').classList.remove('open');document.body.classList.remove('in-explore');
  if(XS.pick&&screen==='novo'){buildSession();refreshSlots()}else if(!document.body.classList.contains('in-session'))buildHome()}
function xSide(){
  const s=$('#xSide');s.innerHTML='';
  const fav=LIBM.favs.length,mine=LIBM.items.length,all=libAll();
  const sec=(t)=>{const h=document.createElement('div');h.className='xsh';h.textContent=t;s.appendChild(h)};
  const item=(v,label,n,color,extra)=>{const b=document.createElement('button');b.className='xsi'+(XS.view===v?' on':'');b.innerHTML=(color?'<i style="--c:'+color+'"></i>':'')+'<span></span><small>'+(n!=null?n:'')+'</small>';b.querySelector('span').textContent=label;
    b.onclick=()=>{XS.view=v;xRender()};if(extra)extra(b);s.appendChild(b)};
  sec('Biblioteca');item('all','Tudo',all.length);item('fav','Favoritos',fav);item('mine','Meus sons',mine);
  sec('Tipos');XCAT.forEach(c=>{const n=all.filter(x=>x.cat===c[0]).length;if(n)item('cat:'+c[0],c[1],n,c[2])});
  sec('Pastas');
  LIBM.folders.forEach(f=>item('f:'+f.id,f.name,f.ids.length,null,b=>{b.classList.add('fold');const m=document.createElement('span');m.className='xfm';m.textContent='⋯';m.onclick=e=>{e.stopPropagation();folderMenu(f,m)};b.appendChild(m)}));
  const nb=document.createElement('button');nb.className='xsi xnew';nb.textContent='+ Nova pasta';nb.onclick=()=>xAsk('Nome da pasta','',v=>{if(!v)return;const f={id:Date.now().toString(36),name:v.slice(0,30),ids:[]};LIBM.folders.push(f);saveLib();XS.view='f:'+f.id;xRender()});s.appendChild(nb);
  const tip=document.createElement('p');tip.className='xtip';tip.textContent='Seus sons ficam guardados só neste aparelho.';s.appendChild(tip);
}
function xChips(){
  const c=$('#xChips');c.innerHTML='';
  const grp=(opts,key)=>{const g=document.createElement('div');g.className='xcg';opts.forEach(([v,l])=>{const b=document.createElement('button');b.className='xc'+(XS[key]===v?' on':'');b.textContent=l;b.onclick=()=>{XS[key]=v;xRender()};g.appendChild(b)});c.appendChild(g)};
  grp([['all','Todos'],['inst','Instrumentos'],['oneshot','Sons curtos'],['loop','Loops']],'type');
  grp([['all','Todos os gêneros']].concat(GENRES.map(G=>[G.k,genreName(G.k)])),'genre');
}
function xRender(){
  if(!XS.open)return;
  xSide();xChips();
  const L=libVisible(),box=$('#xList');box.innerHTML='';
  const v=XS.view,title=v==='all'?'Tudo':v==='fav'?'Favoritos':v==='mine'?'Meus sons':v.startsWith('cat:')?XCATN[v.slice(4)]:(LIBM.folders.find(f=>'f:'+f.id===v)||{name:'Pasta'}).name;
  $('#xViewT').textContent=title;$('#xCount').textContent=L.length+(L.length===1?' som':' sons');
  if(!L.length){
    const e=document.createElement('div');e.className='xempty';
    if(v==='mine')e.innerHTML='<b>Ainda não tem sons seus aqui</b><span>Traga arquivos do app Arquivos ou grave pelo microfone. Aceita WAV, MP3, M4A e AIFF.</span><div><button class="hw pri" data-a="imp">Importar arquivos</button><button class="hw" data-a="rec">Gravar som</button></div>';
    else if(v==='fav')e.innerHTML='<b>Nenhum favorito ainda</b><span>Toque na estrela de um som para guardar aqui.</span>';
    else if(v.startsWith('f:'))e.innerHTML='<b>Pasta vazia</b><span>Use o menu ⋯ de qualquer som para colocar nesta pasta.</span>';
    else e.innerHTML='<b>Nada encontrado</b><span>Tente outro filtro ou outra busca.</span>';
    e.querySelectorAll('button').forEach(b=>b.onclick=()=>b.dataset.a==='imp'?$('#xFile').click():openRecDlg());
    box.appendChild(e);return;
  }
  const fav=new Set(LIBM.favs);let lastSec='';
  const secOf=it=>it.src==='u'?'Meus sons':it.src==='c'?'Gravados do G-STUDIO':'Instrumentos dos gêneros';
  L.forEach(it=>{
    if(!v.startsWith('f:')&&v!=='fav'){const s=secOf(it);if(s!==lastSec){lastSec=s;const h=document.createElement('div');h.className='xsec';h.textContent=s;box.appendChild(h)}}
    const r=document.createElement('div');r.className='xrow'+(XS.flash&&XS.flash.includes(it.id)?' flash':'');r.style.setProperty('--c',XCATC[it.cat]||'#bbb');
    r.innerHTML='<button class="xplay" aria-label="Ouvir"><svg viewBox="0 0 16 16"><path d="M4.5 2.6v10.8L13 8z" fill="currentColor"/></svg></button><i class="xdot"></i><div class="xinfo"><b></b><span></span></div><div class="xloops"></div>'+
      '<button class="xfav'+(fav.has(it.id)?' on':'')+'" aria-label="Favorito">★</button><button class="xmore" aria-label="Mais opções">⋯</button>'+(XS.pick?'<button class="xadd1">+ Adicionar</button>':'');
    r.querySelector('b').textContent=it.name;r.querySelector('.xinfo span').textContent=libSub(it);
    r.querySelector('.xplay').onclick=e=>xAudition(it,null,e.currentTarget);
    if(it.kind==='inst'){const lp=r.querySelector('.xloops');it.loops.forEach((n,i)=>{if(!n)return;const b=document.createElement('button');b.className='xl';b.textContent=n;b.onclick=()=>xAudition(it,i,b);lp.appendChild(b)})}
    r.querySelector('.xfav').onclick=e=>{const i=LIBM.favs.indexOf(it.id);if(i>=0)LIBM.favs.splice(i,1);else LIBM.favs.push(it.id);saveLib();e.currentTarget.classList.toggle('on',i<0);xSide()};
    r.querySelector('.xmore').onclick=e=>itemMenu(it,e.currentTarget);
    const ad=r.querySelector('.xadd1');if(ad)ad.onclick=()=>novoAdd(it);
    box.appendChild(r);
  });
  XS.flash=null;
}
// menus
function closeXMenu(){const m=$('#xMenu');m.classList.remove('open');m.innerHTML=''}
function showXMenu(anchor,entries){
  const m=$('#xMenu');m.innerHTML='';
  entries.forEach(en=>{if(!en)return;if(en.sep){const h=document.createElement('div');h.className='xms';h.textContent=en.sep;m.appendChild(h);return}
    const b=document.createElement('button');b.textContent=en.l;if(en.on)b.classList.add('on');if(en.danger)b.classList.add('danger');b.onclick=()=>{closeXMenu();en.f()};m.appendChild(b)});
  const r=anchor.getBoundingClientRect(),W=window.innerWidth,H=window.innerHeight;m.classList.add('open');
  const mw=m.offsetWidth,mh=m.offsetHeight;m.style.left=Math.max(8,Math.min(W-mw-8,r.right-mw))+'px';m.style.top=(r.bottom+mh+8<H?r.bottom+4:Math.max(8,r.top-mh-4))+'px';
}
function itemMenu(it,anchor){
  const u=it.src==='u',inF=XS.view.startsWith('f:')?LIBM.folders.find(f=>'f:'+f.id===XS.view):null;
  const E=[{sep:'Pastas'}];
  LIBM.folders.forEach(f=>{const has=f.ids.includes(it.id);E.push({l:(has?'✓ ':'')+f.name,on:has,f:()=>{if(has)f.ids.splice(f.ids.indexOf(it.id),1);else f.ids.push(it.id);saveLib();xRender();xToast(has?'Tirado de '+f.name:'Guardado em '+f.name)}})});
  E.push({l:'+ Nova pasta com este som',f:()=>xAsk('Nome da pasta','',v=>{if(!v)return;LIBM.folders.push({id:Date.now().toString(36),name:v.slice(0,30),ids:[it.id]});saveLib();xRender();xToast('Guardado em '+v)})});
  if(XS.pick||screen==='novo')E.push({sep:'Página'},{l:'Adicionar ao Criar novo',f:()=>novoAdd(it)});
  if(u){
    E.push({sep:'Este som'},{l:'Renomear',f:()=>xAsk('Novo nome',it.name,v=>{if(!v)return;const m=LIBM.items.find(x=>x.id===it.id);m.name=v.slice(0,40);saveLib();xRender()})});
    E.push({l:it.kind==='loop'?'Usar como som curto':'Usar como loop',f:()=>{const m=LIBM.items.find(x=>x.id===it.id);m.kind=m.kind==='loop'?'oneshot':'loop';if(m.kind==='loop'&&!m.bars){const c=classify(m.name+' loop',m.dur||2);m.bars=c.bars;m.bpm=c.bpm}saveLib();xRender()}});
    if(it.kind==='loop')E.push({l:'BPM do loop ('+Math.round(it.bpm)+')',f:()=>xAsk('BPM original do loop',String(Math.round(it.bpm)),v=>{const b=parseFloat(String(v).replace(',','.'));if(!(b>=60&&b<=200)){xToast('Use um BPM entre 60 e 200');return}const m=LIBM.items.find(x=>x.id===it.id);m.bpm=b;m.bars=Math.max(1,Math.round((m.dur||2)*b/240));saveLib();xRender()})});
    E.push({l:'Mudar tipo ('+(XCATN[it.cat]||'Outros')+')',f:()=>showXMenu(anchor,XCAT.map(c=>({l:c[1],on:c[0]===it.cat,f:()=>{const m=LIBM.items.find(x=>x.id===it.id);m.cat=c[0];saveLib();xRender()}})))});
    E.push({l:'Apagar som',danger:true,f:()=>xAsk('Apagar "'+it.name+'"? Isso não tem volta.',null,()=>{LIBM.items=LIBM.items.filter(x=>x.id!==it.id);LIBM.folders.forEach(f=>{f.ids=f.ids.filter(i=>i!==it.id)});LIBM.favs=LIBM.favs.filter(i=>i!==it.id);delete UBUF[it.id];saveLib();idbDel(it.id).catch(()=>{});xRender();xToast('Som apagado')},'Apagar')});
  }
  if(inF)E.push({sep:''},{l:'Tirar desta pasta',f:()=>{inF.ids=inF.ids.filter(i=>i!==it.id);saveLib();xRender()}});
  showXMenu(anchor,E);
}
function folderMenu(f,anchor){showXMenu(anchor,[{l:'Renomear pasta',f:()=>xAsk('Nome da pasta',f.name,v=>{if(v){f.name=v.slice(0,30);saveLib();xRender()}})},
  {l:'Apagar pasta',danger:true,f:()=>xAsk('Apagar a pasta "'+f.name+'"? Os sons continuam na biblioteca.',null,()=>{LIBM.folders=LIBM.folders.filter(x=>x!==f);if(XS.view==='f:'+f.id)XS.view='all';saveLib();xRender()},'Apagar')}])}
// diálogo simples (texto ou confirmação)
function xAsk(msg,val,cb,okLabel){
  const d=$('#xAsk');d.querySelector('p').textContent=msg;const inp=d.querySelector('input');
  inp.style.display=val==null?'none':'block';inp.value=val||'';d.querySelector('.ok').textContent=okLabel||'OK';
  d.querySelector('.ok').classList.toggle('danger',!!okLabel);
  d.classList.add('open');if(val!=null)setTimeout(()=>{try{inp.focus();inp.select()}catch(e){}},60);
  d.querySelector('.ok').onclick=()=>{d.classList.remove('open');cb(val==null?true:inp.value.trim())};
  d.querySelector('.no').onclick=()=>d.classList.remove('open');
  inp.onkeydown=e=>{if(e.key==='Enter')d.querySelector('.ok').click()};
}
// ligações
(()=>{
  $('#expOpen').onclick=()=>openExplore(false);
  $('#xBack').onclick=closeExplore;$('#xDone').onclick=closeExplore;
  $('#xImp').onclick=()=>{initAudio();$('#xFile').click()};
  $('#xFile').onchange=e=>{const fs=[...e.target.files];e.target.value='';if(fs.length)importFiles(fs)};
  $('#xRecBtn').onclick=openRecDlg;
  $('#xq').oninput=e=>{XS.q=e.target.value;xRender()};
  $('#xRecGo').onclick=()=>{if(MIC.on)micStop();else micStart()};
  $('#xRecPlay').onclick=()=>{if(!MIC.buf)return;xStopAud();const s=ctx.createBufferSource();s.buffer=MIC.buf;s.connect(out);s.start();XS.aud={id:'rec',stop:()=>{try{s.stop()}catch(e){}}}};
  $('#xRecSave').onclick=saveRec;$('#xRecX').onclick=closeRecDlg;
  document.addEventListener('pointerdown',e=>{const m=$('#xMenu');if(m.classList.contains('open')&&!m.contains(e.target)&&!e.target.closest('.xmore,.xfm'))closeXMenu()},true);
  $('#nvKey').onclick=openNvKey;$('#nvSave').onclick=saveAsGenre;$('#ugOk').onclick=saveAsGenreGo;$('#ugNo').onclick=()=>$('#ugDlg').classList.remove('open');
  $('#ugMenuBtn').onclick=e=>ugenMenu(e.currentTarget);$('#ugName').onkeydown=e=>{if(e.key==='Enter')saveAsGenreGo()};$('#nvKeyOk').onclick=()=>$('#nvKeyDlg').classList.remove('open');
  $('#nvAuto').onchange=e=>{NV.auto=e.target.checked;nvKeyApply()};
  loadLib();loadNovo();
})();

