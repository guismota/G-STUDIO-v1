import { LATE, late } from '../late.js';
import { xToast } from '../all.js';
late({get CMP(){return CMP},set CMP(v){CMP=v},get anL(){return anL},set anL(v){anL=v},get anR(){return anR},set anR(v){anR=v},get anS(){return anS},set anS(v){anS=v},get bar(){return bar},set bar(v){bar=v},get barOff(){return barOff},set barOff(v){barOff=v},get bpm(){return bpm},set bpm(v){bpm=v},get ctx(){return ctx},set ctx(v){ctx=v},get cur(){return cur},set cur(v){cur=v},get curBar(){return curBar},set curBar(v){curBar=v},get duck(){return duck},set duck(v){duck=v},get filt(){return filt},set filt(v){filt=v},get fin(){return fin},set fin(v){fin=v},get lastKey(){return lastKey},set lastKey(v){lastKey=v},get mix(){return mix},set mix(v){mix=v},get nextTime(){return nextTime},set nextTime(v){nextTime=v},get noiseBuf(){return noiseBuf},set noiseBuf(v){noiseBuf=v},get out(){return out},set out(v){out=v},get playing(){return playing},set playing(v){playing=v},get step(){return step},set step(v){step=v},get tT0(){return tT0},set tT0(v){tT0=v},get timer(){return timer},set timer(v){timer=v}});
const $=s=>document.querySelector(s);
const m2f=m=>440*Math.pow(2,(m-69)/12);
const ICON={
  play:'<svg viewBox="0 0 16 16"><path d="M4.5 2.6v10.8L13 8z"/></svg>',
  stop:'<svg viewBox="0 0 16 16"><rect x="3.5" y="3.5" width="9" height="9" rx="1"/></svg>',
  x:'<svg viewBox="0 0 16 16"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>',
  link:'<svg viewBox="0 0 16 16"><path d="M6.6 9.4l2.8-2.8M7.4 4.4l1.2-1.2a2.6 2.6 0 0 1 3.7 3.7l-1.2 1.2M8.6 11.6l-1.2 1.2a2.6 2.6 0 0 1-3.7-3.7l1.2-1.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  edit:'<svg viewBox="0 0 16 16"><path d="M11.2 1.8l3 3-8.7 8.7-3.8.8.8-3.8z"/></svg>'
};
let ctx,out,mix,filt,dly,fb,wet,noiseBuf,fin,anL,anR,anS,CMP=null;
const CFG_DEF={launch:'bar',swing:true,wake:true,pvol:1,sting:true,autoKey:true,rec:'m4a',limit:true,anim:true,size:'n',eco:false,noflash:false,noshake:false,mono:false,keys:true};
const CFG=Object.assign({},CFG_DEF,(()=>{try{const j=JSON.parse(localStorage.getItem('gstudio_cfg'));return j&&typeof j==='object'?j:{}}catch(e){return{}}})());
function saveCfg(){try{localStorage.setItem('gstudio_cfg',JSON.stringify(CFG))}catch(e){}}
const APPV=__APP_VERSION__; // vem de package.json (appVersion): o build grava aqui
const DEV=(()=>{const ua=navigator.userAgent||'',pf=navigator.platform||'',tp=navigator.maxTouchPoints||0;
  const ipad=/iPad/.test(ua)||((pf==='MacIntel'||/Macintosh/.test(ua))&&tp>1),iphone=/iPhone|iPod/.test(ua),android=/Android/.test(ua);
  const os=ipad?'ipados':iphone?'ios':android?'android':(/Mac/.test(pf)||/Macintosh/.test(ua))?'mac':(/Win/.test(pf)||/Windows/.test(ua))?'windows':/CrOS/.test(ua)?'chromeos':/Linux/.test(ua)?'linux':'other';
  const kind=iphone||(android&&/Mobile/.test(ua))?'phone':(ipad||android)?'tablet':'desktop';
  const br=/Edg\//.test(ua)?'Edge':/OPR\//.test(ua)?'Opera':/SamsungBrowser/.test(ua)?'Samsung Internet':/CriOS/.test(ua)?'Chrome':/FxiOS|Firefox\//.test(ua)?'Firefox':/Chrome\//.test(ua)?'Chrome':/Safari\//.test(ua)?'Safari':'navegador';
  const label={ipados:'iPad',ios:'iPhone',android:kind==='phone'?'Celular Android':'Tablet Android',mac:'Mac',windows:'PC com Windows',chromeos:'Chromebook',linux:'PC com Linux',other:'Computador'}[os];
  return {os,kind,br,label,apple:os==='mac'||os==='ipados'||os==='ios'}})();
document.body.classList.add('dev-'+DEV.kind,'os-'+DEV.os);
let barOff=0,tT0=0;const MET={on:false};
let duck=null;
let bpm=124,playing=false,step=0,bar=0,nextTime=0,timer=null,cur=-1,curBar=0,lastKey='';
const uiQ=[];
const K={mv:.8,fv:1,dv:0,sc:.5};
let msgTxt='',msgT=null;
function flash(m){/* o visor mostra só o gênero; avisos de algo que não deu certo viram balão */if(/^(Sem |Adicione|Chama|Não |Nada pra|Escolha|Grave)/.test(m||'')&&typeof xToast==='function')xToast(m)}

export { $, APPV, CFG, CMP, DEV, ICON, K, MET, anL, anR, anS, bar, barOff, bpm, ctx, cur, curBar, duck, filt, fin, flash, lastKey, m2f, mix, nextTime, noiseBuf, out, playing, saveCfg, step, tT0, timer, uiQ };
