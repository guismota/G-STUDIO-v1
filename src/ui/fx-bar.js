import { $, FX, FXDEF, FXKEYS, closeFx, fxActive, fxLinkedHere, fxSend, makeKnob, openFx, pfFxOn, pfToggleFx, placePlug, saveFx, setFxParam, updFxUI } from '../app/all.js';
// ---------- Efeitos na barra: abas, 3 knobs, estilo e liga/desliga ----------
const FXS={k:'rev',kn:[],lv:[-1,-1,-1],last:0};
const fxsPar=k=>{const D=FXDEF[k];return [D.big,D.small[0],D.small[1]]};
function fxsSel(k){FXS.k=k;FXS.lv=[-1,-1,-1];fxsLabels();fxsSync(true)}
function fxsLabels(){const k=FXS.k,F=FX[k],D=FXDEF[k];
  fxsPar(k).forEach((q,i)=>{const l=$('#fxK'+i+' .lbl');if(l)l.textContent=q.l});
  $('#fxStN').textContent=D.styles[F.style]||'';
  document.querySelectorAll('.fxtab').forEach(b=>b.classList.toggle('sel',b.dataset.fx===k))}
function fxSetStyle(k,i){const F=FX[k];if(i===F.style)return;F.style=i;
  fxSend(k,'style');
  updFxUI(k);saveFx();if(F.el)F.el.querySelectorAll('.pst button').forEach(b=>b.classList.toggle('sel',+b.dataset.i===i))}
document.querySelectorAll('.fxtab').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.fx;if(FXS.k===k){FX[k].win.open?closeFx(k):openFx(k)}else fxsSel(k)}));
$('#fxPw').onclick=()=>pfToggleFx(FXS.k);
$('#fxSt').onclick=()=>{const k=FXS.k;fxSetStyle(k,(FX[k].style+1)%FXDEF[k].styles.length);fxsLabels()};
[0,1,2].forEach(i=>{FXS.kn[i]=makeKnob($('#fxK'+i),{v:.5,label:'·',small:true,onChange:v=>{const k=FXS.k;setFxParam(k,fxsPar(k)[i].k,v);FXS.lv[i]=v}})});
{const a=FXKEYS.find(k=>fxActive(k)&&(FX[k].master||fxLinkedHere(k)>0));if(a)FXS.k=a}fxsLabels();
function fxsSync(force){
  const k=FXS.k,F=FX[k];
  document.querySelectorAll('.fxtab').forEach(b=>{const kk=b.dataset.fx;b.classList.toggle('lit',pfFxOn(kk));b.classList.toggle('open',FX[kk].win.open)});
  $('#fxPw').classList.toggle('on',pfFxOn(k));
  fxsPar(k).forEach((q,i)=>{const v=F.p[q.k];if(force||Math.abs(v-FXS.lv[i])>.001){FXS.kn[i].set(v);FXS.lv[i]=v}});
  const sn=FXDEF[k].styles[F.style]||'';if($('#fxStN').textContent!==sn)$('#fxStN').textContent=sn;
}
function fxsDraw(now){requestAnimationFrame(fxsDraw);if(!document.body.classList.contains('in-session')||document.hidden||now-FXS.last<120)return;FXS.last=now;fxsSync(false)}
requestAnimationFrame(fxsDraw);
window.addEventListener('resize',()=>FXKEYS.forEach(k=>{if(FX[k].win.open)placePlug(k)}));

