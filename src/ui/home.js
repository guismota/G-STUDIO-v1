import { STYLES, gAcid, gAcidtechno, gAfro, gCumbia, gDeep, gDnb, gFunk, gHouse, gSolomun, gTechno, gVice } from '../app/all.js';
// ---------- Boas-vindas, início e navegação ----------
// card de cada gênero na tela inicial, na ordem dos canais (CH01...); os dados ficam em src/genres/<gênero>.js
const GENRES=[gHouse.home,gDeep.home,gAcid.home,gTechno.home,gAcidtechno.home,gFunk.home,gDnb.home,gSolomun.home,gAfro.home,gVice.home,gCumbia.home];
const CHN=i=>'CH'+String(i+1).padStart(2,'0');
// I de traço único com a mesma largura das outras letras da fonte mono: espaçamento igual em VICECITY, AFTERPARTY etc.
function monoFix(){try{const c=document.createElement('canvas').getContext('2d'),F=100,LS=-.075;
  c.font='400 '+F+'px "Rubik Mono One","Archivo Black",sans-serif';const L='ACDEHNORTUVY';let sb=0,n=0,rs={};
  for(const ch of L){const m=c.measureText(ch),l=-m.actualBoundingBoxLeft,r=m.width-m.actualBoundingBoxRight;if(!isFinite(l)||!isFinite(r))continue;sb+=l+r;n++;rs[ch]=[l,r]}
  if(!n)return;sb=sb/(2*n)/F;
  c.font='900 '+F+'px "Rubik","Archivo Black",sans-serif';const mi=c.measureText('I'),il=-mi.actualBoundingBoxLeft/F,ir=(mi.width-mi.actualBoundingBoxRight)/F;
  const ml=sb-il,mr=sb-ir+LS;
  const st=document.documentElement.style;st.setProperty('--iML',ml.toFixed(3)+'em');st.setProperty('--iMR',mr.toFixed(3)+'em')}catch(e){}}
monoFix();if(document.fonts){document.fonts.ready.then(monoFix);Promise.all([document.fonts.load('400 100px "Rubik Mono One"'),document.fonts.load('900 100px "Rubik"')]).then(()=>{monoFix();setTimeout(monoFix,300)}).catch(()=>{})}
const iFix=h=>h.replace(/>([^<]*)</g,(m,t)=>'>'+t.replace(/[iI]/g,'<b class="iI">I</b>')+'<');
GENRES.forEach(g=>{if(g.artist)g.html=iFix(g.html||'<span>After</span><em>party</em>')});
const GSYM={'house':gHouse.symbol,'deep':gDeep.symbol,'acid':gAcid.symbol,'techno':gTechno.symbol,'acidtechno':gAcidtechno.symbol,'funk':gFunk.symbol};
const gsym=k=>'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter">'+GSYM[k]+'</svg>';
const LASTK='gstudio_last',HISTK='gstudio_hist';
function histPush(k){try{let a=JSON.parse(localStorage.getItem(HISTK)||'[]');if(!Array.isArray(a))a=[];a=[k].concat(a.filter(x=>x!==k)).slice(0,12);localStorage.setItem(HISTK,JSON.stringify(a))}catch(e){}}
function histList(){try{const a=JSON.parse(localStorage.getItem(HISTK)||'[]');return Array.isArray(a)?a:[]}catch(e){return []}}
function homeOrder(){let l=null;try{l=localStorage.getItem(LASTK)}catch(e){}const a=GENRES.map((g,i)=>({g,i}));const j=a.findIndex(x=>x.g.k===l);if(j>0)a.unshift(a.splice(j,1)[0]);return a}
function genreWave(k){const W=1200,H=100,m=50,pts=[];
 for(let x=0;x<=W;x+=2){const t=x/W;let y=0,p;
  if(k==='house')y=Math.sin(t*Math.PI*16)*30;
  else if(k==='deep')y=Math.sin(t*Math.PI*6)*18+Math.sin(t*Math.PI*22)*6;
  else if(k==='acid'){p=(t*12)%1;y=(p*2-1)*26+Math.sin(p*Math.PI*10)*12*Math.exp(-p*3)}
  else if(k==='techno')y=(Math.sin(t*Math.PI*16)>0?1:-1)*26;
  else if(k==='acidtechno'){p=(t*16)%1;y=(p<.5?1:-1)*20+Math.sin(p*Math.PI*14)*14*Math.exp(-p*4)}
  else if(k==='dnb'){p=(t*8)%1;y=(p<.08?40:p<.5?-Math.sin(p*Math.PI*30)*18*Math.exp(-p*4):(p>.6&&p<.66?-34:Math.sin(p*Math.PI*40)*8))}
  else if(k==='afro')y=Math.sin(t*Math.PI*10)*16+Math.sin(t*Math.PI*30)*10*Math.abs(Math.sin(t*Math.PI*5));
  else if(k==='solomun')y=Math.sin(t*Math.PI*8)*24+Math.sin(t*Math.PI*24)*9+Math.sin(t*Math.PI*40)*4;
  else if(k==='funk'){p=(t*10)%1;y=Math.sin(p*Math.PI*18)*40*Math.exp(-p*7)+(p>.5?Math.sin(p*Math.PI*30)*16*Math.exp(-(p-.5)*9):0)}
  pts.push((x?'L':'M')+x+' '+(m-y).toFixed(1))}
 const sv='<svg class="osc" viewBox="0 0 '+W+' 100" preserveAspectRatio="none"><path d="'+pts.join('')+'"/></svg>';return sv+sv}
// ---------- Tela inicial: destaque do último canal + fileiras que deslizam ----------
const HPAL={vice:gVice.palette,house:gHouse.palette,deep:gDeep.palette,acid:gAcid.palette,techno:gTechno.palette,acidtechno:gAcidtechno.palette,funk:gFunk.palette,dnb:gDnb.palette,solomun:gSolomun.palette,afro:gAfro.palette,cumbia:gCumbia.palette};
const hHash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const hRnd=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
function ugPal(g){const h=hHash(g.id||g.name||'x');return ['#2F5BEA','hsl('+(185+h%80)+',95%,62%)']}
function artSpec(k,g){
  if(g)return {style:'user',c:ugPal(g),bpm:(g.nv&&g.nv.bpm)||124,seed:hHash(g.id||'u'),name:g.name||'',id:g.id};
  return {style:k,c:HPAL[k]||['#FFE600','#fff'],bpm:(STYLES[k]&&STYLES[k].bpm)||124,seed:hHash(k),name:(STYLES[k]&&STYLES[k].name)||k};
}
export { CHN, GENRES, GSYM, HPAL, LASTK, artSpec, hRnd, histList, histPush };
