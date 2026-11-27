import { $, closeModal, fmtDate, idb, idbDo, idbPut, playing, stopTransport, two } from '../app/all.js';
// ---------- Backup: tudo num arquivo (projetos, gêneros criados, biblioteca, sons do usuário) ----------
const BK={file:null,data:null,busy:false};
const BK_SKIP=k=>k.startsWith('gstudio_tour_')||k==='gstudio_onboarded'||k==='gstudio_terms';
const bkKeys=()=>{const a=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(k.startsWith('gstudio_')||k.startsWith('looppads_'))&&!BK_SKIP(k))a.push(k)}return a};
function idbEntries(){return idb().then(db=>new Promise((res,rej)=>{const out=[],tx=db.transaction('files','readonly'),cur=tx.objectStore('files').openCursor();
  cur.onsuccess=()=>{const c=cur.result;if(c){out.push([c.key,c.value]);c.continue()}};tx.oncomplete=()=>res(out);tx.onerror=()=>rej(tx.error)}))}
const ab2b64=ab=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]||'');r.onerror=()=>rej(r.error);r.readAsDataURL(new Blob([ab]))});
const b642ab=b=>fetch('data:application/octet-stream;base64,'+b).then(r=>r.arrayBuffer());
const fmtMB=n=>n<1048576?Math.max(1,Math.round(n/1024))+' KB':(n/1048576).toFixed(1).replace('.',',')+' MB';
function bkCounts(ls,nf){
  const P=x=>{try{return JSON.parse(x)}catch(e){return null}};
  const pr=P(ls.gstudio_projects),ug=P(ls.gstudio_ugen),lb=P(ls.gstudio_lib);
  return {proj:Array.isArray(pr)?pr.length:0,gen:Array.isArray(ug)?ug.length:0,snd:lb&&Array.isArray(lb.items)?lb.items.length:0,files:nf};
}
const plural=(n,a,b)=>n+' '+(n===1?a:b);
const bkSummary=c=>[plural(c.proj,'projeto','projetos'),plural(c.gen,'gênero criado','gêneros criados'),plural(c.snd,'som seu','sons seus')].join(' · ');
function bkSheet(title,info,body,btns){
  $('#bkTitle').textContent=title;$('#bkInfo').textContent=info||'';$('#bkBody').innerHTML='';
  if(typeof body==='string')$('#bkBody').innerHTML=body;else if(body)$('#bkBody').appendChild(body);
  const f=$('#bkFoot');f.innerHTML='<span class="spacer"></span>';
  btns.forEach(b=>{const e=document.createElement('button');e.className='hw'+(b.pri?' pri':'')+(b.danger?' danger':'')+(b.dz?' dz':'');e.textContent=b.l;e.onclick=b.f;if(b.id)e.id=b.id;f.appendChild(e)});
  $('#bkModal').classList.add('open');
}
const bkClose=()=>{if(!BK.busy){closeModal('bkModal');BK.file=null;BK.data=null}};
async function bkExport(){
  if(BK.busy)return;BK.busy=true;
  bkSheet('Exportar backup','Preparando…','<div class="bkmsg"><i class="bkspin"></i><span>Juntando projetos, gêneros e sons…</span></div>',[]);
  try{
    const ls={};bkKeys().forEach(k=>{ls[k]=localStorage.getItem(k)});
    const ent=await idbEntries(),files={};let raw=0;
    for(const [k,v] of ent){if(v instanceof ArrayBuffer||ArrayBuffer.isView(v)){const ab=v instanceof ArrayBuffer?v:v.buffer;raw+=ab.byteLength;files[k]=await ab2b64(ab)}}
    const d=new Date(),stamp=d.getFullYear()+'-'+two(d.getMonth()+1)+'-'+two(d.getDate());
    const json=JSON.stringify({app:'G-STUDIO',kind:'backup',v:1,date:d.toISOString(),ls,files});
    BK.file=new File([json],'G-STUDIO backup '+stamp+'.json',{type:'application/json'});
    try{localStorage.setItem('gstudio_bkdate',String(Date.now()))}catch(e){}
    BK.busy=false;updBkInfo();
    const c=bkCounts(ls,Object.keys(files).length),canSh=!!(navigator.canShare&&navigator.canShare({files:[BK.file]}));
    bkSheet('Backup pronto',fmtMB(BK.file.size),
      '<div class="bkmsg"><b>'+bkSummary(c)+'</b><span>'+(canSh?'Toque em Salvar e escolha "Salvar em Arquivos", AirDrop ou onde preferir. Guarde fora do aparelho para não perder.':'O arquivo vai para a pasta de downloads. Guarde fora do aparelho para não perder.')+'</span></div>',
      [{l:'Fechar',f:bkClose},{l:canSh?'Salvar':'Baixar arquivo',pri:true,f:async()=>{
        if(canSh){try{await navigator.share({files:[BK.file],title:BK.file.name})}catch(e){if(e&&e.name==='AbortError')return;dl0(BK.file)}}else dl0(BK.file)}}]);
  }catch(e){BK.busy=false;bkSheet('Exportar backup','','<div class="bkmsg"><b>Não deu para gerar o backup</b><span>'+String(e&&e.message||e).slice(0,120)+'</span></div>',[{l:'Fechar',pri:true,f:bkClose}])}
}
function dl0(f){const u=URL.createObjectURL(f),a=document.createElement('a');a.href=u;a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000)}
function bkPick(){const i=$('#bkFile');i.value='';i.click()}
async function bkRead(f){
  if(!f)return;
  let d=null;try{d=JSON.parse(await f.text())}catch(e){}
  if(!d||d.app!=='G-STUDIO'||d.kind!=='backup'||!d.ls||typeof d.ls!=='object'){
    bkSheet('Restaurar backup','','<div class="bkmsg"><b>Esse arquivo não é um backup do G-STUDIO</b><span>Escolha o arquivo .json que o app gerou em Exportar backup.</span></div>',[{l:'Escolher outro',f:bkPick},{l:'Fechar',pri:true,f:bkClose}]);return}
  BK.data=d;const c=bkCounts(d.ls,Object.keys(d.files||{}).length),when=d.date?fmtDate(Date.parse(d.date)):'';
  bkSheet('Restaurar backup',when?'Feito em '+when:'',
    '<div class="bkmsg"><b>'+bkSummary(c)+'</b><span><em>Juntar</em> mantém o que já está neste aparelho e acrescenta o que vem do backup. <em>Substituir</em> apaga tudo daqui e deixa igual ao backup.</span></div>',
    [{l:'Cancelar',f:bkClose},{l:'Substituir tudo',danger:true,id:'bkRep',f:e=>{const b=e.currentTarget;if(!b.classList.contains('armed')){b.classList.add('armed');b.textContent='Certeza? Apaga tudo';return}bkApply('replace')}},{l:'Juntar',pri:true,f:()=>bkApply('merge')}]);
}
function bkMergeLs(k,inc,cur){
  const P=x=>{try{return JSON.parse(x)}catch(e){return null}};
  if(cur==null)return inc;
  const a=P(cur),b=P(inc);if(a==null||b==null)return cur;
  if(k==='gstudio_projects'&&Array.isArray(a)&&Array.isArray(b)){const m=new Map(a.map(x=>[x.id,x]));b.forEach(x=>{if(!x||!x.id)return;const o=m.get(x.id);if(!o||(x.updated||0)>(o.updated||0))m.set(x.id,x)});return JSON.stringify([...m.values()].sort((p,q)=>(q.updated||0)-(p.updated||0)))}
  if(k==='gstudio_ugen'&&Array.isArray(a)&&Array.isArray(b)){const ids=new Set(a.map(x=>x&&x.id));return JSON.stringify(a.concat(b.filter(x=>x&&x.id&&!ids.has(x.id))))}
  if(k==='gstudio_lib'&&typeof a==='object'&&typeof b==='object'){
    const items=Array.isArray(a.items)?a.items.slice():[],iid=new Set(items.map(x=>x.id));(b.items||[]).forEach(x=>{if(x&&x.id&&!iid.has(x.id))items.push(x)});
    const fold=Array.isArray(a.folders)?a.folders.map(x=>Object.assign({},x,{ids:(x.ids||[]).slice()})):[];
    (b.folders||[]).forEach(x=>{if(!x||!x.id)return;const o=fold.find(y=>y.id===x.id);if(o)(x.ids||[]).forEach(i=>{if(!o.ids.includes(i))o.ids.push(i)});else fold.push(x)});
    const favs=[...new Set([].concat(a.favs||[],b.favs||[]))];
    return JSON.stringify({items,folders:fold,favs});
  }
  if(k==='looppads_user'&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a))return JSON.stringify(Object.assign({},b,a));
  return cur;
}
async function bkApply(mode){
  const d=BK.data;if(!d||BK.busy)return;BK.busy=true;
  if(playing)stopTransport();
  bkSheet('Restaurar backup','Restaurando…','<div class="bkmsg"><i class="bkspin"></i><span>Gravando sons e projetos neste aparelho…</span></div>',[]);
  try{
    if(mode==='replace'){await idbDo('readwrite',st=>st.clear())}
    const have=new Set(mode==='merge'?(await idbEntries()).map(e=>e[0]):[]);
    for(const [k,b] of Object.entries(d.files||{})){if(have.has(k)||typeof b!=='string')continue;const ab=await b642ab(b);await idbPut(k,ab)}
    if(mode==='replace'){bkKeys().forEach(k=>localStorage.removeItem(k));Object.entries(d.ls).forEach(([k,v])=>{if(typeof v==='string'&&!BK_SKIP(k))localStorage.setItem(k,v)})}
    else Object.entries(d.ls).forEach(([k,v])=>{if(typeof v!=='string'||BK_SKIP(k)||k==='gstudio_bkdate')return;const nv=bkMergeLs(k,v,localStorage.getItem(k));if(nv!=null)localStorage.setItem(k,nv)});
    localStorage.setItem('gstudio_onboarded','1');
    bkSheet('Backup restaurado','','<div class="bkmsg"><b>Tudo certo</b><span>O app vai reabrir para carregar tudo.</span></div>',[]);
    setTimeout(()=>location.reload(),1100);
  }catch(e){BK.busy=false;bkSheet('Restaurar backup','','<div class="bkmsg"><b>Não deu para restaurar</b><span>'+(e&&e.name==='QuotaExceededError'?'Falta espaço no aparelho. Libere espaço e tente de novo.':String(e&&e.message||e).slice(0,120))+'</span></div>',[{l:'Fechar',pri:true,f:bkClose}])}
}
function updBkInfo(){const t=+localStorage.getItem('gstudio_bkdate')||0;$('#bkLast').textContent=t?'Último backup: '+fmtDate(t):'Nenhum backup feito ainda'}
$('#bkExport').onclick=bkExport;$('#bkImport').onclick=bkPick;
$('#bkFile').onchange=e=>bkRead(e.target.files&&e.target.files[0]);
$('#bkModal').addEventListener('click',e=>{if(e.target.id==='bkModal')bkClose()});
updBkInfo();


export { bkClose, bkExport, bkPick, bkSheet, fmtMB, idbEntries, plural };
