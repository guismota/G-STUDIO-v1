// ===================== TOUR RÁPIDO (primeiro uso, pode pular) =====================
const TOURS={
 home:[
  {sel:'#hero',t:'Seu canal',d:'Aqui fica o último gênero que você tocou. Toque em Entrar para abrir o estúdio.'},
  {sel:'#hero .hprev',t:'Ouça antes de entrar',d:'O alto-falante toca uma prévia de uns 18 segundos. Toque de novo para parar.'},
  {sel:'.hrow .htile',t:'Todos os canais',d:'Deslize as fileiras para o lado. Toque num card para entrar ou no alto-falante para ouvir.'},
  {sel:'#expOpen',t:'Explorar',d:'Sua biblioteca: os sons do G-STUDIO, arquivos que você importar e gravações pelo microfone.'},
  {sel:'#hxNew',t:'Criar do zero',d:'Uma página em branco para misturar sons de qualquer gênero e salvar como um gênero seu.'}],
 sess:[
  {sel:'#session .lane .clip',t:'Toque um loop',d:'Cada pad é um loop. Toque para soltar: ele entra no tempo certo, no começo do próximo compasso.'},
  {sel:'#scenes .sc',t:'Cenas',d:'Uma cena solta várias linhas de uma vez. Comece pela 1 e depois experimente a 3.'},
  {sel:'.fxc',t:'Efeitos',d:'Escolha o efeito em cima, ajuste nos knobs, troque o estilo e ligue no botão. Toque de novo na aba para abrir todos os ajustes.'},
  {sel:'#recBtn',t:'Gravar',d:'Grava tudo o que sai do app. No fim, você salva ou compartilha o áudio.'},
  {sel:'#editTog',t:'Editar',d:'Com Editar ligado, você cria seus próprios loops e monta suas cenas.'}]
};
var TOUR={on:false,k:null,i:0};
function tourDone(k){try{return localStorage.getItem('gstudio_tour_'+k)==='1'}catch(e){return true}}
function maybeTour(k){
  if(TOUR.on||tourDone(k))return;
  if(k==='home'&&(document.body.classList.contains('in-session')||XS.open||$('#onb').classList.contains('show')||$('#terms').classList.contains('show')))return;
  if(k==='sess'&&(!document.body.classList.contains('in-session')||screen!=='main'))return;
  startTour(k);
}
function startTour(k){TOUR.on=true;TOUR.k=k;TOUR.i=0;$('#tour').classList.add('on');showTourStep()}
function endTour(){try{localStorage.setItem('gstudio_tour_'+TOUR.k,'1')}catch(e){}TOUR.on=false;$('#tour').classList.remove('on')}
function showTourStep(){
  const L=TOURS[TOUR.k],st=L[TOUR.i];if(!st){endTour();return}
  const el=document.querySelector(st.sel);
  if(!el||!el.getBoundingClientRect().width){TOUR.i++;showTourStep();return}
  if(TOUR.k==='home'){const r0=el.getBoundingClientRect();if(r0.top<60||r0.bottom>innerHeight-40)el.scrollIntoView({block:'center',behavior:'auto'})}
  const T=$('#tour'),card=T.querySelector('.tcard');
  T.querySelector('.tn').textContent=(TOUR.i+1)+' de '+L.length;
  T.querySelector('.tt').textContent=st.t;T.querySelector('.td').textContent=st.d;
  T.querySelector('.tgo').textContent=TOUR.i===L.length-1?'Começar':'Próximo';
  T.querySelector('.tdots').innerHTML=L.map((_,j)=>'<i'+(j===TOUR.i?' class="on"':'')+'></i>').join('');
  placeTour(el);
  card.classList.remove('pop');void card.offsetWidth;card.classList.add('pop');
}
function placeTour(el){
  const T=$('#tour'),h=T.querySelector('.thole'),card=T.querySelector('.tcard'),r=el.getBoundingClientRect(),p=8;
  h.style.left=(r.left-p)+'px';h.style.top=(r.top-p)+'px';h.style.width=(r.width+p*2)+'px';h.style.height=(r.height+p*2)+'px';
  const cw=Math.min(340,innerWidth*.9),ch=card.offsetHeight||170;
  let x=Math.min(innerWidth-cw-12,Math.max(12,r.left+r.width/2-cw/2)),y=r.bottom+p+14,up=false;
  if(y+ch>innerHeight-12){y=r.top-p-14-ch;up=true}
  if(y<12)y=Math.min(innerHeight-ch-12,Math.max(12,r.top+r.height/2-ch/2));
  card.style.width=cw+'px';card.style.left=x+'px';card.style.top=y+'px';card.classList.toggle('up',up);
  card.style.setProperty('--ax',Math.max(16,Math.min(cw-16,r.left+r.width/2-x))+'px');
}
(()=>{
  const T=$('#tour');
  T.querySelector('.tgo').onclick=()=>{TOUR.i++;showTourStep()};
  T.querySelector('.tskip').onclick=endTour;
  window.addEventListener('resize',()=>{if(TOUR.on){const st=TOURS[TOUR.k][TOUR.i];const el=st&&document.querySelector(st.sel);if(el)placeTour(el)}});
  const again=$('#tourAgain');if(again)again.onclick=()=>{try{localStorage.removeItem('gstudio_tour_home');localStorage.removeItem('gstudio_tour_sess')}catch(e){}startTour('home')};
})();

