import { LATE, late } from '../app/late.js';
import { CFG } from '../app/all.js';
late({get LSND(){return LSND},set LSND(v){LSND=v},get UGEN(){return UGEN},set UGEN(v){UGEN=v}});
// ===================== EXPLORAR + CRIAR NOVO =====================
// Biblioteca: instrumentos dos gêneros (4 loops cada), amostras gravadas do G-STUDIO e sons do usuário (importados ou gravados)
var LSND=null;
var NOVO=[],NV={n:0,root:9,mode:'minor',auto:CFG.autoKey!==false,bpm:124,ctx:'draft'},UGEN=null;
var LIBM={items:[],folders:[],favs:[]};
var UBUF={},UPEND={};
var XS={open:false,pick:false,view:'all',type:'all',genre:'all',q:'',aud:null,menuId:null};
const XCAT=[['drums','Drums','#FFA63D'],['perc','Percussão','#FF6A3D'],['bass','Baixo','#6C8BFF'],['keys','Teclados e pads','#FF3DAE'],['synth','Leads e arps','#5CFF8A'],['fx','Efeitos','#C8FF3D'],['vocal','Vozes','#FFE600'],['other','Outros','#BDBDBD']];
const XCATN=Object.fromEntries(XCAT.map(c=>[c[0],c[1]])),XCATC=Object.fromEntries(XCAT.map(c=>[c[0],c[2]]));
const LANECAT={kick:'drums',clap:'drums',snare:'drums',hat:'drums',ohat:'drums',tom:'perc',perc:'perc',bass:'bass',sub:'bass',chord:'keys',pad:'keys',arp:'synth',lead:'synth',fx:'fx'};
const CC0=[
 {f:'bongo_hi',name:'Bongô agudo',cat:'perc',h:'perc'},{f:'bongo_lo',name:'Bongô grave',cat:'perc',h:'perc'},{f:'logdrum',name:'Log drum',cat:'perc',h:'perc'},
 {f:'conga_hi',name:'Conga aguda',cat:'perc',h:'perc'},{f:'conga_mid',name:'Conga média',cat:'perc',h:'perc'},{f:'conga_lo',name:'Tumba',cat:'perc',h:'perc'},
 {f:'clap909',name:'Palma eletrônica',cat:'drums',h:'clap'},{f:'palma',name:'Palma de mão',cat:'drums',h:'clap'},
 {f:'hat_c',name:'Chimbal fechado',cat:'drums',h:'hat'},{f:'hat_o',name:'Chimbal aberto',cat:'drums',h:'ohat'},
 {f:'ride',name:'Prato de condução',cat:'drums',h:'ohat'},{f:'crash',name:'Prato de ataque',cat:'drums',h:'once'},
 {f:'letsgo',name:"Voz: Let's Go",cat:'vocal',h:'once'}];

export { CC0, LANECAT, LIBM, LSND, NOVO, NV, UBUF, UGEN, UPEND, XCAT, XCATC, XCATN, XS };
