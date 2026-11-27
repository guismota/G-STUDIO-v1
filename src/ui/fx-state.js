import { late } from '../app/late.js';
import { DLYST, ECHB, FXDEF, FXKEYS, REVST, bpm, engine } from '../app/all.js';
late({get saveFx(){return saveFx},set saveFx(v){saveFx=v}}); // o desfazer (state/history.js) encaixa nesta função
// ---------- estado dos efeitos que a tela mostra, salva e desfaz (o som fica no motor: engine/fx.js) ----------
const FX={};
(function loadFx(){
  let j=null;try{j=JSON.parse(localStorage.getItem('gstudio_fx'))}catch(e){}
  FXKEYS.forEach(k=>{
    const d=FXDEF[k],s=(j&&typeof j[k]==='object'&&j[k])||{},w=(s.win&&typeof s.win==='object')?s.win:{};
    const p=Object.assign({},d.def);
    if(s.p&&typeof s.p==='object')Object.keys(p).forEach(n=>{const v=+s.p[n];if(Number.isFinite(v)&&v>=0&&v<=1)p[n]=v});
    const num=v=>Number.isFinite(+v)&&v!==null?+v:null;
    FX[k]={on:s.on!==false,style:[0,1,2].includes(s.style)?s.style:0,p,
      links:Array.isArray(s.links)?s.links.filter(x=>typeof x==='string'):[],master:!!s.master,mode:s.mode==='xpad'?'xpad':'knob',xt:false,xb:null,
      win:{open:false,x:num(w.x),y:num(w.y),w:num(w.w)},el:null,lnk:false};
  });
})();
let fxSaveT=null;
function saveFx(){
  clearTimeout(fxSaveT);
  fxSaveT=setTimeout(()=>{
    const o={};FXKEYS.forEach(k=>{const F=FX[k];o[k]={on:F.on,style:F.style,p:F.p,links:F.links,master:F.master,mode:F.mode,win:{x:F.win.x,y:F.win.y,w:F.win.w}}});
    try{localStorage.setItem('gstudio_fx',JSON.stringify(o))}catch(e){}
  },250);
}
// mesmas contas do motor, sobre o estado da tela (para os visores e rótulos dos plugins)
const fxActive=k=>FX[k].on||FX[k].xt;
const fxOn=(k,c)=>fxActive(k)&&!FX[k].master&&FX[k].links.includes(c.key);
const revLen=()=>REVST[FX.rev.style].t*(.35+FX.rev.p.decay*1.3);
const dlyTime=()=>Math.min(1.9,(FX.dly.xb||DLYST[FX.dly.style].b)*60/bpm);
const echIdx=()=>Math.round(FX.ech.p.beat*(ECHB.length-1));
const echTime=()=>Math.min(3.9,ECHB[echIdx()]*60/bpm);
function fltHz(){const F=FX.flt,v=F.p.cut;return F.style===0?60*Math.pow(300,v):F.style===1?20*Math.pow(400,v):150*Math.pow(40,v)}
// o motor tem a sua cópia do estado: tudo de uma vez (fx.sync) ou um efeito por vez (fx.set, dizendo o que mudou)
const fxState=k=>{const F=FX[k];return {on:F.on,style:F.style,p:Object.assign({},F.p),links:F.links.slice(),master:F.master,mode:F.mode,xt:!!F.xt,xb:F.xb||null}};
function fxSend(k,action,extra){engine.send(Object.assign({type:'fx.set',fx:k,state:fxState(k),action},extra||{}))}
function fxSyncAll(rebuild){const s={};FXKEYS.forEach(k=>{s[k]=fxState(k)});engine.send({type:'fx.sync',fx:s,rebuild:rebuild||null})}
fxSyncAll();
export { FX, dlyTime, echIdx, echTime, fltHz, fxActive, fxOn, fxSend, fxSyncAll, revLen, saveFx };
