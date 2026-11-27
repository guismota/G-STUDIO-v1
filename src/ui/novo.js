import { LATE } from '../app/late.js';
import { $, CFG, LASTK, MODE_N, NOTE_PT, NOVO, NV, SC, STYLES, TYPES, UGEN, XCATC, bpm, buildSession, ctx, engine, ensureGain, flash, goHome, histPush, loadBuf, makeLane, openNvKey, playing, previewPlay, refreshSlots, routeAll, saveUser, screen, setScreen, setStyle, showXMenu, stopLaneSrc, stopPreview, updNvKey, userPats, xAsk, xToast } from '../app/all.js';
// ---------- Criar novo: estado ----------
const NOVO_STY=STYLES.novo={name:'Criar novo',bpm:124,swing:0,key:{root:9,mode:'minor'},snd:STYLES.house.snd,p:{},novo:true};
Object.keys(TYPES).forEach(t=>{NOVO_STY.p[t]=[]});
function novoSer(c){return {key:c.key,type:c.type,name:c.name,src:c.src||null,smp:c.smp||null,cat:c.cat||null,lbpm:c.lbpm||null,bars:c.bars||null,h:c.hh||null}}
function novoLane(o){
  const l=makeLane(o.type,o.key,o.name);
  if(o.src)l.src=o.src;
  if(o.smp){l.smp=o.smp;l.cat=o.cat||'other';l.color=XCATC[l.cat]||l.color;l.rows=[{l:o.name}];
    if(o.type==='loopa'){l.kind='loop';l.lbpm=o.lbpm||120;l.bars=o.bars||1;l.bpats=[{name:'Loop',len:16,data:'loop'},null,null,null]}
    else{l.hh=o.h||null;l.bpats=hitPats(o.h||guessHit(o.name,o.cat))}
    loadBuf(o.smp)}
  return l;
}
// carrega um conjunto de faixas na página (o rascunho do Criar novo ou um gênero do usuário)
function novoFill(data,cx){
  NOVO.forEach(c=>{stopLaneSrc(c);if(c.gain){try{c.gain.disconnect();c.post.disconnect()}catch(e){}}});NOVO.length=0;
  Object.assign(NV,{n:0,root:9,mode:'minor',auto:CFG.autoKey!==false,bpm:124},data.nv||{});NV.ctx=cx;
  (data.lanes||[]).forEach(o=>{if(!o||!TYPES[o.type]||typeof o.key!=='string')return;const l=novoLane(o);
    if(cx!=='draft'){l.upats=(data.pats&&Array.isArray(data.pats[o.key]))?data.pats[o.key]:[null,null,null,null];userPats[o.key]=l.upats}
    else if(!userPats[o.key])userPats[o.key]=[null,null,null,null];
    NOVO.push(l)});
  (data.mix||[]).forEach(m=>{const l=NOVO.find(x=>x.key===m.key);if(l){l.vol=Math.max(0,Math.min(1.5,+m.vol||0));l.muted=!!m.muted}});
  SC.novo=Array.isArray(data.scenes)&&data.scenes.length===8?data.scenes:Array(8).fill(null);
  NOVO_STY.bpm=NV.bpm;NOVO_STY.key={root:NV.root,mode:NV.mode};
  if(ctxReady())NOVO.forEach(ensureGain);
  if(screen==='novo')LATE.scenes=SC.novo;
}
function ctxReady(){return !!ctx}
function novoLoadDraft(){
  let j=null;try{j=JSON.parse(localStorage.getItem('gstudio_novo'))}catch(e){}
  let sc=j&&j.scenes;if(!sc){try{const k=JSON.parse(localStorage.getItem('gstudio_scenes'));sc=k&&k.novo}catch(e){}}
  novoFill({nv:j&&j.nv,lanes:j&&j.lanes,scenes:sc,mix:j&&j.mix},'draft');NOVO_STY.name='Criar novo';
}
function loadNovo(){novoLoadDraft();LATE.UGEN=ugenList()}
function saveNovo(){
  const mix=NOVO.map(c=>({key:c.key,vol:c.vol,muted:c.muted}));
  if(NV.ctx&&NV.ctx!=='draft'){const g=(UGEN||[]).find(x=>x.id===NV.ctx);if(!g)return;
    g.nv={root:NV.root,mode:NV.mode,auto:NV.auto,bpm:NV.bpm,n:NV.n};g.lanes=NOVO.map(novoSer);g.pats={};NOVO.forEach(c=>{g.pats[c.key]=c.upats||userPats[c.key]||[null,null,null,null]});
    g.scenes=SC.novo;g.mix=mix;saveUgens();return}
  try{localStorage.setItem('gstudio_novo',JSON.stringify({nv:Object.assign({},NV,{ctx:'draft'}),lanes:NOVO.map(novoSer),scenes:SC.novo,mix}))}catch(e){}
}
// ---------- gêneros criados pelo usuário ----------
function ugenList(){if(typeof UGEN!=='undefined'&&Array.isArray(UGEN))return UGEN;let a=null;try{a=JSON.parse(localStorage.getItem('gstudio_ugen'))}catch(e){}return Array.isArray(a)?a:[]}
function saveUgens(){try{localStorage.setItem('gstudio_ugen',JSON.stringify(UGEN||[]))}catch(e){xToast('Sem espaço para salvar o gênero')}}
function ugenStingKey(g){const l=(g.lanes||[]).find(x=>x.src);return l?l.src:'novo'}
function ugenPlan(g){
  const sc=(g.scenes||[]).filter(Boolean).slice(0,4);
  if(sc.length)return {plan:b=>sc[Math.min(sc.length-1,b>>1)],bars:sc.length*2};
  const all={},dr={};(g.lanes||[]).forEach(l=>{all[l.key]=0;if(TYPES[l.type]&&(TYPES[l.type].kind||'drum')==='drum')dr[l.key]=0});
  return {plan:b=>b<2&&Object.keys(dr).length?dr:all,bars:6};
}
function ugenPreview(id,done){
  const g=ugenList().find(x=>x.id===id);if(!g||!(g.lanes||[]).length){done&&done();return}
  engine.send({type:'audio.unlock'});
  const nk={root:(g.nv||{}).root??9,mode:(g.nv||{}).mode||'minor',auto:(g.nv||{}).auto!==false};
  const lanes=g.lanes.map(o=>{const m=(g.mix||[]).find(x=>x.key===o.key);return {def:o,nvk:nk,pats:(g.pats&&g.pats[o.key])||[null,null,null,null],mix:m?{vol:+m.vol,muted:!!m.muted}:null}});
  const P=ugenPlan(g),k=ugenStingKey(g)==='novo'?'house':ugenStingKey(g);
  previewPlay({type:'preview.start',id:'ug:'+id,genre:k,lanes,plan:Array.from({length:P.bars},(_,b)=>P.plan(b)),bars:P.bars,end:false,volume:.62,bpm:(g.nv&&g.nv.bpm)||124},()=>{done&&done()});
}
function openNovoSession(){
  stopPreview();engine.send({type:'audio.unlock'});
  NOVO_STY.bpm=NV.bpm;LATE.screen='novo';setStyle('novo');
  document.body.classList.add('in-session','novo');document.body.classList.toggle('ugen',NV.ctx!=='draft');
  const d=document.querySelector('.dev');d.classList.remove('enter');void d.offsetWidth;d.classList.add('enter');
  if(ctx){NOVO.forEach(ensureGain);routeAll()}
  setScreen('novo');updNvKey();
}
function enterUgen(id){
  const g=ugenList().find(x=>x.id===id);if(!g)return;try{localStorage.setItem(LASTK,'ug:'+id)}catch(e){}histPush('ug:'+id);
  if(playing)engine.send({type:'transport.stop'});
  if(NV.ctx==='draft')saveNovo();
  novoFill({nv:g.nv,lanes:g.lanes,scenes:g.scenes,pats:g.pats,mix:g.mix},id);NOVO_STY.name=g.name;
  openNovoSession();
}
function saveAsGenre(){
  if(!NOVO.length){flash('Adicione pelo menos um som antes');return}
  $('#ugName').value='';$('#ugDesc').value='';$('#ugDlg').classList.add('open');setTimeout(()=>{try{$('#ugName').focus()}catch(e){}},60);
}
function saveAsGenreGo(){
  const name=($('#ugName').value||'').trim().slice(0,18);if(!name){$('#ugName').focus();return}
  const desc=($('#ugDesc').value||'').trim().slice(0,44);
  if(playing)engine.send({type:'transport.stop'});
  NV.bpm=bpm;const id='g'+Date.now().toString(36),map={};
  const lanes=NOVO.map((c,i)=>{const o=novoSer(c),nk=id+'_'+(i+1);map[c.key]=nk;o.key=nk;return o});
  const pats={};NOVO.forEach(c=>{pats[map[c.key]]=JSON.parse(JSON.stringify(c.upats||userPats[c.key]||[null,null,null,null]))});
  const scenes=(SC.novo||Array(8).fill(null)).map(sc=>{if(!sc)return null;const o={};for(const k in sc)if(map[k])o[map[k]]=sc[k];return o});
  const mix=NOVO.map(c=>({key:map[c.key],vol:c.vol,muted:c.muted}));
  LATE.UGEN=ugenList();UGEN.push({id,name,desc,created:Date.now(),nv:{root:NV.root,mode:NV.mode,auto:NV.auto,bpm:NV.bpm,n:lanes.length},lanes,pats,scenes,mix});saveUgens();
  NOVO.forEach(c=>{stopLaneSrc(c);delete userPats[c.key]});NOVO.length=0;SC.novo=Array(8).fill(null);saveNovo();saveUser();
  $('#ugDlg').classList.remove('open');buildSession();refreshSlots();
  flash(name+' está na tela inicial');xToast('Gênero salvo: '+name+'. Ele está na tela inicial.');
}
function nvKeyLbl(){return 'Mudar o tom ('+NOTE_PT[NV.root]+' '+MODE_N[NV.mode]+')'}
function ugenMenu(anchor){
  const g=ugenList().find(x=>x.id===NV.ctx);
  if(!g){showXMenu(anchor,[{sep:'Criar novo'},{l:nvKeyLbl(),f:openNvKey}]);return}
  showXMenu(anchor,[{sep:g.name},{l:nvKeyLbl(),f:openNvKey},
    {l:'Renomear',f:()=>xAsk('Nome do gênero',g.name,v=>{if(!v)return;g.name=v.slice(0,18);NOVO_STY.name=g.name;saveUgens();flash('Agora se chama '+g.name)})},
    {l:'Trocar a frase',f:()=>xAsk('Frase do gênero',g.desc||'',v=>{g.desc=(v||'').slice(0,44);saveUgens()})},
    {l:'Apagar gênero',danger:true,f:()=>xAsk('Apagar o gênero "'+g.name+'"? Os sons da biblioteca continuam.',null,()=>{
      LATE.UGEN=ugenList().filter(x=>x!==g);saveUgens();(g.lanes||[]).forEach(l=>delete userPats[l.key]);NV.ctx='x';goHome();},'Apagar')}]);
}
function novoShift(g,K){K=K||NV;let d=((K.root-(STYLES[g].key||{root:9}).root)%12+12)%12;if(d>6)d-=12;return d}
function novoPat(c,i){
  const base=(STYLES[c.src].p[c.type]||[])[i];if(!base)return null;
  const K=c.nvk||NV;if(!K.auto||TYPES[c.type].kind!=='note')return base;
  const sh=novoShift(c.src,K);if(!sh)return base;
  c._tp=c._tp||{};const k=i+':'+sh;if(c._tp[k])return c._tp[k];
  if(!Array.isArray(base.data))return base;
  const p=Object.assign({},base,{data:base.data.map(n=>{if(!Array.isArray(n))return n;const m=n.slice();m[1]=Array.isArray(m[1])?m[1].map(x=>x+sh):(typeof m[1]==='number'?m[1]+sh:m[1]);return m})});
  return c._tp[k]=p;
}
// padrões prontos para sons curtos
function hitPats(h){
  const P={tempo:{name:'4 por 4',len:16,data:[0,4,8,12]},contra:{name:'Contratempo',len:16,data:[2,6,10,14]},back:{name:'2 e 4',len:16,data:[4,12]},
    once:{name:'1 por ciclo',len:32,data:[0]},perc:{name:'Balanço',len:16,data:[3,6,10,13]},sixt:{name:'16 avos',len:16,data:[0,2,4,6,8,10,12,14,1,5,9,13].sort((a,b)=>a-b)}};
  const order={kick:['tempo','back','contra','once'],clap:['back','tempo','contra','once'],hat:['contra','sixt','tempo','once'],ohat:['contra','back','tempo','once'],
    perc:['perc','contra','back','once'],once:['once','tempo','back','contra']}[h]||['once','tempo','back','contra'];
  return order.map(k=>P[k]);
}
function guessHit(name,cat){const n=(name||'').toLowerCase();
  if(/kick|bumbo|\bbd\b|808/.test(n))return 'kick';if(/clap|palma|snare|caixa|\bsd\b|rim/.test(n))return 'clap';
  if(/open|aberto|ride|ohat|oh\b/.test(n))return 'ohat';if(/hat|chimbal|\bhh\b|shaker|tamb/.test(n))return 'hat';
  if(cat==='perc')return 'perc';if(cat==='drums')return 'perc';return 'once'}

export { NOVO_STY, enterUgen, guessHit, loadNovo, novoFill, novoLane, novoLoadDraft, novoPat, novoSer, openNovoSession, saveAsGenre, saveAsGenreGo, saveNovo, ugenList, ugenMenu, ugenPreview, ugenStingKey };
