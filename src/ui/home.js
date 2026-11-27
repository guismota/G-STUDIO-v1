import { STYLES } from '../app/all.js';
// ---------- Boas-vindas, início e navegação ----------
const GENRES=[
 {k:'house',gc:'#FFA63D',xpos:'50% 45%',c1:'#3d7bff',c2:'#ff4fd8',pos:'center 70%',fx:'saturate(1.25) contrast(1.1)',tint:.35,desc:'Groove clássico pra mexer o ombro'},
 {k:'deep',gc:'#FF6A3D',xpos:'50% 34%',c1:'#4dff9a',c2:'#8a5cff',pos:'center 32%',desc:'Olho fechado, copo na mão'},
 {k:'acid',gc:'#C8FF3D',xpos:'50% 30%',c1:'#8dff3d',c2:'#d05cff',pos:'center 28%',desc:'303 gritando desde 1987'},
 {k:'techno',gc:'#6C8BFF',xpos:'50% 40%',c1:'#a35cff',c2:'#ff3b4f',pos:'center 38%',desc:'Escuro, repetitivo e lindo'},
 {k:'acidtechno',gc:'#5CFF8A',xpos:'50% 26%',c1:'#ff3b3b',c2:'#ffb37a',pos:'center 24%',desc:'Rápido demais pro seu vizinho'},
 {k:'funk',gc:'#FF3DAE',xpos:'50% 22%',c1:'#FFE600',c2:'#ff2d1a',pos:'center 22%',desc:'Música popular eletrônica brasileira'},
 {k:'dnb',gc:'#22E1FF',desc:'Quebrada rápida, grave sujo e um pé no garage'},
 {k:'solomun',artist:true,desc:'Baixo rolando, riff metálico e Ibiza às 6h'},
 {k:'afro',artist:true,theme:'afro',html:'<span>Afro</span><em>house</em>',desc:'Tambores, coro e pôr do sol'},
 {k:'vice',artist:true,theme:'vice',html:'<span>Ocean</span><em>Drive</em>',trend:true,desc:'Crie a soundtrack para roubar um banco ou dar um rolê de conversível pela orla.'},
 {k:'cumbia',artist:true,theme:'cumbia',html:'<em>Cumbia</em>',desc:'Duelo de teclados, güiro raspando e o baile inteiro pulando até o sol nascer.'}];
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
const GSYM={'house':'<path d="M8 22L24 8L40 22V40H8Z"/><circle cx="24" cy="30" r="6"/><rect x="22.5" y="28.5" width="3" height="3" fill="currentColor" stroke="none"/>','deep':'<path d="M8 22L24 8L40 22V40H8Z"/><path d="M14 26H34M17 31H31M20 36H28"/>','acid':'<path d="M8 22L24 8L40 22V40H8Z"/><path d="M11 31Q14.25 24 17.5 31T24 31T30.5 31T37 31"/>','techno':'<path d="M8 8H40V40H8Z"/><g fill="currentColor" stroke="none"><rect x="14" y="14" width="8" height="8"/><rect x="26" y="26" width="8" height="8"/></g><path d="M26 18H34M14 30H22"/>','acidtechno':'<path d="M8 8H40V40H8Z"/><path d="M11 31Q14.25 24 17.5 31T24 31T30.5 31T37 31"/>','funk':'<path d="M12 5H36V43H12Z"/><circle cx="24" cy="16" r="6"/><circle cx="24" cy="32.5" r="7.5"/><rect x="22.5" y="31" width="3" height="3" fill="currentColor" stroke="none"/><rect x="22.5" y="14.5" width="3" height="3" fill="currentColor" stroke="none"/>'};
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
const HPAL={vice:['#FF4FA0','#FF45C8'],house:['#FFE600','#FFA63D'],deep:['#3DFFC8','#3D7BFF'],acid:['#C8FF3D','#FFE600'],techno:['#6C8BFF','#C9D3FF'],acidtechno:['#5CFF8A','#FF3B3B'],
  funk:['#FF3DAE','#FFE600'],dnb:['#22E1FF','#EDEDED'],solomun:['#B026FF','#E2B8FF'],afro:['#FF6B2C','#FFC23D'],cumbia:['#FF4B1F','#F4F2EA']};
const hHash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const hRnd=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
function ugPal(g){const h=hHash(g.id||g.name||'x');return ['#2F5BEA','hsl('+(185+h%80)+',95%,62%)']}
function artSpec(k,g){
  if(g)return {style:'user',c:ugPal(g),bpm:(g.nv&&g.nv.bpm)||124,seed:hHash(g.id||'u'),name:g.name||'',id:g.id};
  return {style:k,c:HPAL[k]||['#FFE600','#fff'],bpm:(STYLES[k]&&STYLES[k].bpm)||124,seed:hHash(k),name:(STYLES[k]&&STYLES[k].name)||k};
}
export { CHN, GENRES, HPAL, LASTK, artSpec, hRnd, histList, histPush };
