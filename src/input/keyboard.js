// ---------- Aparelho, instalação e atalhos de teclado ----------
const MODK=DEV.apple?'⌘':'Ctrl',SHK=DEV.apple?'⇧':'Shift';
let BIP=null; // pedido de instalação do Chrome/Edge/Android
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();BIP=e;onbAdapt()});
window.addEventListener('appinstalled',()=>{BIP=null});
async function installNow(){if(!BIP)return false;const e=BIP;BIP=null;try{e.prompt();await e.userChoice}catch(_){}return true}
const ICO_SH='<svg viewBox="0 0 20 20" class="obi"><path d="M10 2v11M6 6l4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 9H3v9h14V9h-2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
function installSteps(){
  const o=DEV.os,b=DEV.br;
  if(o==='ipados'||o==='ios')return {t:'Instale em 3 passos'+(b==='Safari'?' pelo Safari':''),s:['Toque em '+ICO_SH+' <em>Compartilhar</em>'+(o==='ipados'?' no topo da tela':' na barra de baixo'),'Role a lista e toque em <em>Adicionar à Tela de Início</em>','Toque em <em>Adicionar</em> e abra o G-STUDIO pelo ícone']};
  if(o==='android')return {t:'Instale em 2 passos',s:['Toque no menu <em>⋮</em> do navegador','Toque em <em>Instalar app</em> ou <em>Adicionar à tela inicial</em>']};
  if(b==='Firefox')return {t:'Use direto no navegador',s:['O Firefox não instala sites como app','Para instalar, abra o link no <em>Chrome</em>, no <em>Edge</em>'+(o==='mac'?' ou no <em>Safari</em>':'')]};
  if(o==='mac'&&b==='Safari')return {t:'Instale em 2 passos pelo Safari',s:['No menu, clique em <em>Arquivo</em> e depois em <em>Adicionar ao Dock</em>','Clique em <em>Adicionar</em> e abra o G-STUDIO pelo Dock']};
  return {t:'Instale em 2 passos pelo '+b,s:['Na barra de endereço, clique no ícone de <em>Instalar</em> (ou no menu <em>'+(b==='Edge'?'…':'⋮')+'</em>, em <em>Instalar G-STUDIO</em>)','Clique em <em>Instalar</em> e abra o G-STUDIO como um app']};
}
function onbAdapt(){
  const st=installSteps(),ol=document.querySelector('#onb .obos');if(!ol)return;
  $('#obTitle').textContent=st.t;ol.innerHTML=st.s.map((x,i)=>'<li><b>'+(i+1)+'</b><span>'+x+'</span></li>').join('');
  if(BIP)ol.insertAdjacentHTML('beforeend','<li class="obinst"><button class="oblite obinstb">Instalar agora</button></li>'),ol.querySelector('.obinstb').onclick=async()=>{await installNow();onbAdapt()};
  $('#obNote').textContent='Este aparelho: '+DEV.label+' · '+DEV.br+'.';
  if(window.gsCompatUI)gsCompatUI();
}
onbAdapt();
// dicas de atalho nos botões
function kbTitles(){
  if(DEV.kind==='phone'||!CFG.keys)return;
  const T={'#play':'Tocar / parar (Espaço)','#recBtn':'Gravar (R)','#editTog':'Editar (E)','#osBtn':'One shots (O)','#homeBtn':'Início (H)','#saveBtn':'Salvar ('+MODK+' S)','#undoBtn':'Desfazer ('+MODK+' Z)','#redoBtn':'Refazer ('+SHK+' '+MODK+' Z)','#rmxBtn':'Remix FX (X)','#sizeBtn':'Tamanho dos loops','#cfgOpen':'Configurações ('+MODK+' ,)','#projOpen':'Projetos ('+MODK+' O)','#expOpen':'Explorar (E)','#hxNew':'Criar novo (N)','#bp':'Mais BPM (+)','#bm':'Menos BPM (−)'};
  Object.entries(T).forEach(([s,t])=>{const e=$(s);if(e)e.title=t});
}
kbTitles();
const KB={li:0,pi:0,show:false};
function kbMark(){
  document.querySelectorAll('.clip.kfocus').forEach(e=>e.classList.remove('kfocus'));
  if(!KB.show||!cols.length)return;KB.li=Math.max(0,Math.min(cols.length-1,KB.li));KB.pi=Math.max(0,Math.min(7,KB.pi));
  const el=cols[KB.li].padEls&&cols[KB.li].padEls[KB.pi];if(el){el.classList.add('kfocus');el.scrollIntoView({block:'nearest',inline:'nearest'})}
}
document.addEventListener('pointerdown',()=>{if(KB.show){KB.show=false;kbMark()}},true);
const KB_LIST=()=>[
 ['Geral',[['?','Ver os atalhos'],[MODK+' ,','Configurações'],[MODK+' O','Projetos'],['Esc','Fechar janela ou painel']]],
 ['Tela inicial',[['Enter','Entrar no destaque'],['Espaço','Ouvir a prévia do destaque'],['1 – 9','Abrir o canal 1 a 9'],['N','Criar novo'],['E','Explorar']]],
 ['Piano roll (igual ao Logic)',[['A – Ç ~','Teclas brancas'],['W E T Y U O P','Teclas pretas'],['Z  X','Oitava abaixo / acima'],['C  V','Velocidade menos / mais'],['Espaço','Tocar / parar'],['R','Gravar']]],
 ['Sessão',[['Espaço','Tocar / parar'],['1 – 8','Soltar a cena'],['0','Parar tudo no fim do compasso'],['↑ ↓ ← →','Escolher um loop'],['Enter','Soltar ou tirar o loop escolhido'],['M','Mutar a linha escolhida'],['S','Solo: só a linha escolhida toca'],['+  −','Subir ou baixar o BPM'],['R','Gravar'],['E','Editar'],[MODK+' S','Salvar projeto'],[MODK+' Z','Desfazer'],[SHK+' '+MODK+' Z','Refazer'],['X','Remix FX'],['H','Voltar ao início']]]];
function openKb(){
  const box=document.createElement('div');box.className='kbl';
  KB_LIST().forEach(([g,L])=>{const s=document.createElement('section');s.innerHTML='<h3></h3>';s.querySelector('h3').textContent=g;
    L.forEach(([k,d])=>{const r=document.createElement('div');r.className='kbr';r.innerHTML='<span></span><kbd></kbd>';r.querySelector('span').textContent=d;r.querySelector('kbd').textContent=k;s.appendChild(r)});box.appendChild(s)});
  bkSheet('Atalhos de teclado',DEV.label,box,[{l:'Fechar',pri:true,f:bkClose}]);$('#bkModal').classList.add('kbm');
}
const typing=e=>{const t=e.target;return !!t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))&&t.offsetParent!==null&&t.type!=='range'&&t.type!=='checkbox'};
function kbEsc(){
  if(typeof TOUR!=='undefined'&&TOUR.on){const s=$('#tour .tskip');if(s)s.click();return true}
  const dlg=[...document.querySelectorAll('.xdlg.open')].pop();if(dlg){const n=dlg.querySelector('.no,#ugNo,#nvKeyOk');if(n)n.click();else dlg.classList.remove('open');return true}
  if($('#xMenu').classList.contains('open')){closeXMenu();return true}
  const mods=[...document.querySelectorAll('.modal.open')];
  if(mods.length){const m=mods[mods.length-1];if(m.id==='bkModal'){bkClose();return true}
    const map={clipEd:'#ceCancel',sceneEd:'#mcancel',picker:'#pkDone',projSave:'#psCancel',projList:'#plClose',recDone:'#rdClose',cfgModal:'#cfgClose'};const b=map[m.id]&&$(map[m.id]);if(b)b.click();else m.classList.remove('open');return true}
  if(RL.open){$('#rlClose').click();return true}
  if(typeof RX!=='undefined'&&RX.open){closeRmx();return true}
  if(XS.open){closeExplore();return true}
  const fx=FXKEYS.filter(k=>FX[k].win.open);if(fx.length){fx.forEach(closeFx);return true}
  if(OS.win.open){closeOs();return true}
  if($('#docv').classList.contains('show')){closeDoc();return true}
  if($('#terms').classList.contains('show'))return true;
  if($('#onb').classList.contains('show')){closeOnb();return true}
  return false;
}
document.addEventListener('keydown',e=>{
  if(!CFG.keys)return;
  if(typing(e)){if(e.key==='Escape'&&kbEsc()){e.preventDefault();e.target.blur()}return}
  const mod=DEV.apple?e.metaKey:e.ctrlKey,k=e.key,inS=document.body.classList.contains('in-session');
  const blocked=!!document.querySelector('.modal.open,.xdlg.open')||RL.open||XS.open||(typeof TOUR!=='undefined'&&TOUR.on)||$('#onb').classList.contains('show')||$('#terms').classList.contains('show')||$('#docv').classList.contains('show');
  if(k==='Escape'){if(kbEsc()){e.preventDefault();const ae=document.activeElement;if(ae&&ae!==document.body&&ae.blur)ae.blur()}return}
  if(mod&&!e.altKey){
    if(k===','){e.preventDefault();if(!blocked)openCfg();return}
    if(k==='o'||k==='O'){e.preventDefault();if(!blocked)openProjList();return}
    if((k==='s'||k==='S')&&inS){e.preventDefault();if(!blocked)openProjSave();return}
    if((k==='z'||k==='Z')&&inS&&!blocked){e.preventDefault();if(e.shiftKey)doRedo();else doUndo();return}
    if((k==='y'||k==='Y')&&inS&&!blocked&&!DEV.apple){e.preventDefault();doRedo();return}
    return;
  }
  if(e.ctrlKey||e.metaKey||e.altKey||blocked)return;
  if(k==='?'){e.preventDefault();openKb();return}
  if(!inS){ // tela inicial
    if(k==='Enter'&&(e.target===document.body||e.target.id==='hero')){e.preventDefault();const g=$('#hero .hgo');if(g)g.click();return}
    if(k===' '&&(e.target===document.body||e.target.id==='hero')){e.preventDefault();const p=$('#hero .hprev');if(p)p.click();return}
    if(/^[1-9]$/.test(k)){const t=document.querySelector('.htile[data-ch="CH0'+k+'"]');if(t){e.preventDefault();t.click()}return}
    if(k==='n'||k==='N'){e.preventDefault();$('#hxNew').click();return}
    if(k==='e'||k==='E'){e.preventDefault();$('#expOpen').click();return}
    return;
  }
  // sessão
  if(k===' '){e.preventDefault();if(!e.repeat)$('#play').click();return}
  if(/^[1-8]$/.test(k)){e.preventDefault();if(!e.repeat)launchScene(+k-1);return}
  if(k==='0'){e.preventDefault();const s=$('#stopall');if(s)s.click();else stopAll();return}
  if(k==='ArrowUp'||k==='ArrowDown'||k==='ArrowLeft'||k==='ArrowRight'){e.preventDefault();
    if(KB.show){if(k==='ArrowUp')KB.li--;if(k==='ArrowDown')KB.li++;if(k==='ArrowLeft')KB.pi--;if(k==='ArrowRight')KB.pi++}
    KB.show=true;kbMark();return}
  if(k==='Enter'){if(KB.show&&cols[KB.li]){e.preventDefault();padTap(KB.li,KB.pi)}return}
  if(k==='s'||k==='S'){const c=cols[KB.li];if(c&&c.padEls&&c.padEls[0]){e.preventDefault();const sb=c.padEls[0].parentElement.querySelector('.solo');if(sb)sb.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))}return}
  if(k==='m'||k==='M'){const c=cols[KB.li];if(c&&c.padEls&&c.padEls[0]){e.preventDefault();const mb=c.padEls[0].parentElement.querySelector('.mute');if(mb)mb.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))}return}
  if(k==='+'||k==='='){e.preventDefault();setBpm(bpm+1);return}
  if(k==='-'||k==='_'||k==='−'){e.preventDefault();setBpm(bpm-1);return}
  if(k==='r'||k==='R'){e.preventDefault();if(!e.repeat)$('#recBtn').click();return}
  if(k==='e'||k==='E'){e.preventDefault();$('#editTog').click();return}
  if(k==='x'||k==='X'){e.preventDefault();RX.open?closeRmx():openRmx();return}
  if(k==='h'||k==='H'){e.preventDefault();$('#homeBtn').click();return}
});

