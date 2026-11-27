import { $, gateTerms, powerOnHome } from '../app/all.js';
// ---------- primeira vez: boas-vindas e como instalar ----------
const ONB={key:'gstudio_onboarded'};
const isStandalone=()=>(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
function showOnb(force){
  if(window.GSC&&GSC.lvl==='bloq')force=true;
  else if(isStandalone())return false; // dentro do app instalado não precisa
  const el=$('#onb');let seen=false;try{seen=localStorage.getItem(ONB.key)==='1'}catch(e){}
  if(seen&&!force)return false;
  el.classList.remove('out');el.classList.add('show');el.scrollTop=0;return true;
}
if(isStandalone()){const x=$('#onbAgain');if(x){const sep=x.previousSibling;if(sep&&sep.nodeType===3)sep.textContent=sep.textContent.replace(/ · $/,'');x.remove()}}
function closeOnb(){
  try{localStorage.setItem(ONB.key,'1')}catch(e){}
  const el=$('#onb');el.classList.add('out');setTimeout(()=>{el.classList.remove('show','out')},700);gateTerms(powerOnHome);
}
$('#obGo').onclick=closeOnb;
{const x=$('#onbAgain');if(x)x.onclick=()=>showOnb(true)}
(()=>{const w=$('#welcome');setTimeout(()=>{w.classList.add('out');if(window.GSC&&GSC.lvl==='bloq'){showOnb(true);return}gateTerms(()=>{if(!showOnb(false))powerOnHome()})},1000);setTimeout(()=>{w.style.display='none'},1500)})();

export { closeOnb, isStandalone, showOnb };
