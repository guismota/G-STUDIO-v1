import { $, APPV, BIP, CFG, CMP, DEV, MAIN, bkClose, bkExport, bkPick, bkSheet, closeModal, ctx, engine, fin, fmtDate, fmtMB, idbDo, idbEntries, installNow, isStandalone, kbTitles, layoutRows, openDoc, openKb, out, playing, plural, saveCfg, showOnb, startTour, stopTransport, termsAt, two } from '../app/all.js';
// ---------- Configurações ----------
const WAKE={s:null};
async function wakeOn(){if(!CFG.wake||!playing||WAKE.s||!navigator.wakeLock)return;try{const s=await navigator.wakeLock.request('screen');if(!playing||!CFG.wake){s.release().catch(()=>{});return}WAKE.s=s;s.addEventListener('release',()=>{if(WAKE.s===s)WAKE.s=null})}catch(e){}}
function wakeOff(){if(WAKE.s){const s=WAKE.s;WAKE.s=null;s.release().catch(()=>{})}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')wakeOn()});
function setMono(){if(!fin||!out)return;out.channelCount=CFG.mono?1:2;out.channelCountMode=CFG.mono?'explicit':'max';out.channelInterpretation='speakers';fin.channelCount=2;fin.channelCountMode=CFG.mono?'explicit':'max';fin.channelInterpretation='speakers'}
function setLimit(){if(!ctx||!CMP)return;try{out.disconnect()}catch(e){}out.connect(CFG.limit?CMP:fin)}
function applyCfg(){
  const b=document.body;b.classList.toggle('eco',!!CFG.eco);b.classList.toggle('sz-s',CFG.size==='s');b.classList.toggle('sz-l',CFG.size==='l');b.classList.toggle('noflash',!!CFG.noflash);b.classList.toggle('noanim',!CFG.anim);b.classList.toggle('noshake',!!CFG.noshake);
  setLimit();setMono();if(typeof layoutRows==='function')layoutRows();
  if(CFG.wake)wakeOn();else wakeOff();
}
const CFG_SPEC=[
 {sec:'Tocar',rows:[
  {k:'launch',t:'Quando a cena entra',d:'Vale para cenas e loops trocados com a música tocando.',seg:[['beat','No tempo'],['bar','No compasso'],['2bar','2 compassos']]},
  {k:'swing',t:'Swing',d:'O balanço de cada gênero. Desligado, tudo fica reto.',tg:1},
  {k:'wake',t:'Tela sempre acesa',d:'A tela não apaga enquanto a música toca.',tg:1}]},
 {sec:'Som',rows:[
  {k:'pvol',t:'Volume da prévia',d:'Prévias da tela inicial e do Explorar.',rng:1},
  {k:'autoKey',t:'Tom automático no Criar novo',d:'Coloca os sons no mesmo tom. Vale para rascunhos novos.',tg:1},
  {k:'rec',t:'Formato da gravação',d:'M4A é leve para mandar. WAV tem qualidade máxima.',seg:[['m4a','M4A'],['wav','WAV']]},
  {k:'limit',t:'Proteção contra clip',d:'Segura os picos na saída. Desligada, o som fica mais aberto, mas pode distorcer.',tg:1}]},
 {sec:'Visual',rows:[
  {k:'anim',t:'Animações',d:'Troca de página e explosão ao soltar uma cena.',tg:1},
  {k:'size',t:'Tamanho dos botões',d:'Grande é melhor para tocar com o dedo. Compacto mostra mais de uma vez.',seg:[['s','Compacto'],['n','Normal'],['l','Grande']]},
  {k:'eco',t:'Modo economia',d:'Desliga luzes, laser, espectro e animações de fundo. Poupa bateria.',tg:1}]},
 {sec:'Acessibilidade',rows:[
  {k:'noflash',t:'Sem flashes',d:'Tira as piscadas e clarões fortes da tela. Recomendado para quem tem sensibilidade à luz ou epilepsia fotossensível.',tg:1},
  {k:'noshake',t:'Sem tremer a tela',d:'A tela não balança ao soltar uma cena nem ao trocar de canal.',tg:1},
  {k:'mono',t:'Áudio mono',d:'Junta esquerda e direita num canal só. Bom para quem usa um fone só ou ouve melhor de um lado.',tg:1}]}
];
function cfgRow(t,d){const r=document.createElement('div');r.className='cfgrow';r.innerHTML='<div class="ct"><b></b><small></small></div><div class="cc"></div>';r.querySelector('b').textContent=t;const s=r.querySelector('small');if(d)s.textContent=d;else s.remove();return r}
function cfgSet(k,v){CFG[k]=v;saveCfg();applyCfg()}
function armBtn(b,label,fn){let t=null;b.onclick=()=>{if(!t){b.classList.add('armed');b.textContent=label;t=setTimeout(()=>{t=null;b.classList.remove('armed');b.textContent=b.dataset.l},3000);return}clearTimeout(t);t=null;fn()};b.dataset.l=b.textContent}
function renderCfg(){
  const box=$('#cfgBody');box.innerHTML='';
  CFG_SPEC.forEach(S=>{
    const sec=document.createElement('section');sec.className='cfgsec';sec.innerHTML='<h3></h3>';sec.querySelector('h3').textContent=S.sec;
    S.rows.forEach(R=>{
      const r=cfgRow(R.t,R.d),cc=r.querySelector('.cc');
      if(R.tg){const b=document.createElement('button');b.className='tg';b.setAttribute('role','switch');b.setAttribute('aria-label',R.t);
        const up=()=>b.setAttribute('aria-checked',CFG[R.k]?'true':'false');up();b.onclick=()=>{cfgSet(R.k,!CFG[R.k]);up()};cc.appendChild(b)}
      else if(R.seg){r.classList.add('wide');const g=document.createElement('div');g.className='seg';
        R.seg.forEach(([v,l])=>{const b=document.createElement('button');b.textContent=l;b.classList.toggle('on',CFG[R.k]===v);b.onclick=()=>{cfgSet(R.k,v);g.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b))};g.appendChild(b)});cc.appendChild(g)}
      else if(R.rng){r.classList.add('wide');const i=document.createElement('input');i.type='range';i.min=0;i.max=100;i.step=5;i.value=Math.round(CFG.pvol*100);i.setAttribute('aria-label',R.t);
        const o=document.createElement('span');o.className='rv';const up=()=>{o.textContent=i.value+'%'};up();i.oninput=()=>{CFG.pvol=i.value/100;up();engine.send({type:'preview.volume',value:CFG.pvol})};i.onchange=()=>saveCfg();cc.appendChild(i);cc.appendChild(o)}
      sec.appendChild(r);
    });
    box.appendChild(sec);
  });
  if(DEV.kind!=='phone'){
    const sk=document.createElement('section');sk.className='cfgsec';sk.innerHTML='<h3>Teclado</h3>';
    const rk=cfgRow('Atalhos de teclado',DEV.kind==='tablet'?'Para usar com teclado conectado ao '+DEV.label+'.':'Espaço toca, 1 a 8 soltam as cenas, setas escolhem os loops.');
    const tg=document.createElement('button');tg.className='tg';tg.setAttribute('role','switch');tg.setAttribute('aria-label','Atalhos de teclado');const up=()=>tg.setAttribute('aria-checked',CFG.keys?'true':'false');up();tg.onclick=()=>{cfgSet('keys',!CFG.keys);up();kbTitles()};rk.querySelector('.cc').appendChild(tg);sk.appendChild(rk);
    const rl=cfgRow('Ver todos os atalhos','Ou aperte ? a qualquer momento.');rl.querySelector('.cc').innerHTML='<button class="hw" id="cfgKb">Ver</button>';sk.appendChild(rl);rl.querySelector('#cfgKb').onclick=openKb;
    box.appendChild(sk);
  }
  // Dados
  const sd=document.createElement('section');sd.className='cfgsec';sd.innerHTML='<h3>Dados</h3>';
  const rb=cfgRow('Backup','');rb.querySelector('.ct').insertAdjacentHTML('beforeend','<small id="cfgBk"></small>');
  rb.querySelector('.cc').innerHTML='<button class="hw" id="cfgBkE">Exportar</button><button class="hw" id="cfgBkR">Restaurar</button>';sd.appendChild(rb);
  const rs=cfgRow('Espaço usado','Calculando…');rs.querySelector('small').id='cfgSpace';sd.appendChild(rs);
  const rr=cfgRow('Voltar a tela Principal ao original','Apaga seus loops M1 a M4, as cenas editadas, os efeitos e os tamanhos das linhas. Projetos, gêneros criados e sons ficam.');
  rr.querySelector('.cc').innerHTML='<button class="hw" id="cfgReset">Voltar</button>';sd.appendChild(rr);
  const ra=cfgRow('Apagar tudo','Deixa o app como novo. Apaga todos os dados deste aparelho.');ra.classList.add('dzr');
  ra.querySelector('.cc').innerHTML='<button class="hw danger" id="cfgWipe">Apagar tudo</button>';sd.appendChild(ra);
  box.appendChild(sd);
  // Ajuda e Sobre
  const sa=document.createElement('section');sa.className='cfgsec';sa.innerHTML='<h3>Ajuda e Sobre</h3>';
  const rt=cfgRow('Rever o tour','Mostra de novo a explicação rápida da tela inicial e da sessão.');rt.querySelector('.cc').innerHTML='<button class="hw" id="cfgTour">Ver</button>';sa.appendChild(rt);
  if(!isStandalone()){const dk=DEV.kind==='desktop',ri=cfgRow(dk?'Instalar no computador':'Instalar no '+DEV.label,dk?'Abre o G-STUDIO numa janela própria, sem a barra do navegador.':'Coloque o G-STUDIO na tela de início para abrir como app, em tela cheia.');
    ri.querySelector('.cc').innerHTML='<button class="hw" id="cfgInst">'+(BIP?'Instalar':'Ver como')+'</button>';sa.appendChild(ri);
    ri.querySelector('#cfgInst').onclick=async()=>{if(BIP){await installNow();renderCfg();return}closeModal('cfgModal');showOnb(true)}}
  const rd=cfgRow('Este aparelho',DEV.label+' · '+DEV.br+'. As opções acima foram ajustadas para ele.');sa.appendChild(rd);
  {const at=termsAt(),r1=cfgRow('Termos de Uso','Versão de testes, confidencial.'+(at?' Você aceitou em '+two(at.getDate())+'/'+two(at.getMonth()+1)+'/'+at.getFullYear()+'.':''));r1.querySelector('.cc').innerHTML='<button class="hw">Ler</button>';r1.querySelector('.cc button').onclick=()=>openDoc('terms');sa.appendChild(r1);
   const r2=cfgRow('Política de Privacidade','O texto completo sobre os seus dados.');r2.querySelector('.cc').innerHTML='<button class="hw">Ler</button>';r2.querySelector('.cc button').onclick=()=>openDoc('privacy');sa.appendChild(r2)}
  sa.insertAdjacentHTML('beforeend',`<details class="cfgrow det"><summary><div class="ct"><b>Privacidade</b><small>Tudo fica no seu aparelho.</small></div><span class="chev"></span></summary><div class="dtx">
<p>O G-STUDIO não tem conta, não coleta dados e não manda nada para servidor. Projetos, gêneros criados, sons importados e gravações ficam guardados só neste aparelho, no armazenamento do navegador ou do app.</p>
<p>O microfone só é usado quando você toca em gravar no Explorar, e o áudio fica no aparelho. Os arquivos de backup e as gravações só saem daqui quando você mesmo exporta ou compartilha.</p>
<p>Se você apagar os dados do site ou o app, tudo isso some. Por isso, faça backup de vez em quando.</p></div></details>`);
  sa.insertAdjacentHTML('beforeend',`<details class="cfgrow det"><summary><div class="ct"><b>Créditos</b><small>Sons e fontes usados no app.</small></div><span class="chev"></span></summary><div class="dtx">
<p>Os sons dos gêneros são sintetizados em tempo real pelo próprio app. As amostras gravadas são de domínio público (CC0 1.0), do pacote Stargate DAW sample pack:</p>
<ul><li>Congas, bongôs e log drum: VCSL e VCSO-2-CE, por sgossner</li><li>Clap 909: Fugue State Audio</li><li>Palma: Freesound 493707, bastianpusch</li><li>Hi-hats, ride e crash: Karoryfer Samples</li><li>Voz "let's go": microlag</li></ul>
<p>Fontes: Archivo, Big Shoulders Display, Rubik Mono One e Instrument Serif, todas com licença SIL Open Font.</p><p class="cver">G-STUDIO v${APPV}</p></div></details>`);
  box.appendChild(sa);
  $('#cfgBkE').onclick=bkExport;$('#cfgBkR').onclick=bkPick;
  $('#cfgReset').onclick=()=>bkSheet('Voltar a Principal ao original','',
    '<div class="bkmsg warn"><b>Atenção</b><span>Isso vai apagar seus loops M1 a M4, as cenas que você editou, os ajustes de efeitos e os tamanhos das linhas da tela Principal. Projetos salvos, gêneros criados e sons importados não são afetados.</span><span>Não dá para desfazer. Deseja continuar?</span></div>',
    [{l:'Cancelar',f:bkClose},{l:'Voltar ao original',dz:true,f:cfgResetMain}]);
  $('#cfgWipe').onclick=()=>bkSheet('Apagar tudo','',
    '<div class="bkmsg warn"><b>Isso apagará todos os dados do G-STUDIO neste aparelho</b><span>Projetos salvos, gêneros criados, sons importados, gravações do microfone, pastas, favoritos e configurações. O app volta a ficar como recém-instalado.</span><span>Essa ação não pode ser desfeita. Se quiser guardar alguma coisa, exporte um backup antes.</span><span>Deseja continuar?</span></div>',
    [{l:'Cancelar',f:bkClose},{l:'Fazer backup',f:bkExport},{l:'Apagar tudo',dz:true,f:cfgWipe}]);
  $('#cfgTour').onclick=()=>{try{localStorage.removeItem('gstudio_tour_home');localStorage.removeItem('gstudio_tour_sess')}catch(e){}closeModal('cfgModal');if(document.body.classList.contains('in-session'))startTour('sess');else setTimeout(()=>startTour('home'),250)};
  updCfgBk();cfgSpace();
}
function updCfgBk(){const e=$('#cfgBk');if(!e)return;const t=+localStorage.getItem('gstudio_bkdate')||0;e.textContent=t?'Último backup: '+fmtDate(t):'Nenhum backup feito ainda'}
async function cfgSpace(){
  const e=$('#cfgSpace');if(!e)return;let snd=0,n=0,ls=0;
  try{(await idbEntries()).forEach(([k,v])=>{const s=v&&(v.byteLength||0);snd+=s;n++})}catch(_){}
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(k.startsWith('gstudio_')||k.startsWith('looppads_')))ls+=(localStorage.getItem(k)||'').length*2}
    e.textContent='Sons seus: '+(n?fmtMB(snd)+' em '+plural(n,'arquivo','arquivos'):'nenhum')+' · Projetos e ajustes: '+fmtMB(ls);
}
function cfgResetMain(){
  if(playing)stopTransport();
  try{const u=JSON.parse(localStorage.getItem('looppads_user'))||{};MAIN.forEach(l=>{delete u[l.key]});localStorage.setItem('looppads_user',JSON.stringify(u))}catch(e){}
  try{const j=JSON.parse(localStorage.getItem('gstudio_scenes'))||{};delete j.main;localStorage.setItem('gstudio_scenes',JSON.stringify(j))}catch(e){}
  ['gstudio_fx','gstudio_layout','looppads_scenes'].forEach(k=>localStorage.removeItem(k));
  location.reload();
}
async function cfgWipe(){
  if(playing)stopTransport();
  try{await idbDo('readwrite',st=>st.clear())}catch(e){}
  const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(k.startsWith('gstudio_')||k.startsWith('looppads_')))ks.push(k)}
  ks.forEach(k=>localStorage.removeItem(k));location.reload();
}
function openCfg(){renderCfg();$('#cfgModal').classList.add('open')}
$('#cfgOpen').onclick=openCfg;$('#cfgClose').onclick=()=>closeModal('cfgModal');
$('#cfgModal').addEventListener('click',e=>{if(e.target.id==='cfgModal')closeModal('cfgModal')});
applyCfg();


export { openCfg, setMono, wakeOff, wakeOn };
