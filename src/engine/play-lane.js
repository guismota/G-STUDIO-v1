import { late } from '../app/late.js';
import { PQ, PV, STYLES, arpSynth, audible, bar, barOff, bass, bpm, chord, clapOnly, duckAt, fxHit, getPat, hat, inVoice, kick, lead, loopStep, padSynth, perc, pmN, pvDuck, smpHit, snare, style, subBass, sweep, tom } from '../app/all.js';
// ----- tocar uma linha -----
late({get LSND(){return LSND},set LSND(v){LSND=v}});
var LSND=null; // conjunto de sons de outro gênero, quando a linha veio de outro gênero (Criar novo)
const snd=()=>(typeof LSND!=='undefined'&&LSND)||STYLES[(typeof PV!=='undefined'&&PV.k)||style].snd; // conjunto de sons em uso
function hitAt(d,pos){for(const x of d){if(x===pos)return 1;if(Array.isArray(x)&&x[0]===pos)return x[1]||1}return 0}
function playCol(c,s,t,P){return inVoice(()=>{LSND=c.src?STYLES[c.src].snd:null;try{playCol0(c,s,t,P)}finally{LSND=null}})}
function playCol0(c,s,t,P){
  const pat=P?P.pat:(c.preview||(c.active>=0?getPat(c,c.active):null));
  if(!pat)return;
  const d=pat.data,L=pat.len||16,pos=P?P.pos%L:pmN(bar-barOff,L/16)*16+s,sd=60/bpm/4,o=c.gain,syn=pat.syn;
  if(c.kind==='loop'){if(d==='loop'&&pos===0)loopStep(c,t);return}
  const HU=((c.src?STYLES[c.src]:STYLES[style])||{}).human;let vm=1;
  if(HU){const k=c.type==='kick'||c.type==='bass'||c.type==='sub'?.35:c.type==='lead'?.7:1;t+=Math.random()*HU.t*k;vm=1-Math.random()*HU.v*k}
  if(c.kind==='drum'){
    if(c.type==='tom'){d.forEach(n=>{if(Array.isArray(n)&&n[0]===pos)tom(t,n[1],o,(n[2]||1)*vm)});return}
    const v=hitAt(d,pos)*vm;if(!v)return;
    switch(c.type){
      case 'kick':kick(t,o,v);if(P){pvDuck(t,v)}else if(audible(c)&&c.vol>.05){PQ.push({t,v:Math.min(1,v)});duckAt(t,v)}break;
      case 'clap':clapOnly(t,o,v);break;
      case 'snare':snare(t,o,v);break;
      case 'hat':hat(t,o,false,v);break;
      case 'ohat':hat(t,o,true,v);break;
      case 'perc':perc(t,o,v,syn);break;
      case 'smp':smpHit(c,t,o,v);break;
    }
    return;
  }
  if(d==='sweep'){if(pos===0)sweep(t,sd*16,o);return}
  if(c.kind==='fx'){d.forEach(n=>{if(Array.isArray(n)&&n[0]===pos)fxHit(t,n[1],(L-pos)*sd,o,n[2]||1)});return}
  d.forEach(n=>{
    if(n[0]!==pos)return;
    if(c.type==='chord'){chord(t,n[1],n[2]*sd,o,n[3]===true?'pad':syn);return}
    if(c.type==='pad'){padSynth(t,n[1],n[2]*sd,o,syn);return}
    const v=(typeof n[3]==='number'&&n[3]>0?n[3]:1)*vm;
    if(c.type==='bass'){bass(t,n[1],n[2]*sd,o,v,n[4],c,syn);c.lastM=n[1]}
    else if(c.type==='sub')subBass(t,n[1],n[2]*sd,o,v);
    else if(c.type==='arp')arpSynth(t,n[1],n[2]*sd,o,v,syn,n[4]);
    else lead(t,n[1],n[2]*sd,o,v,syn,n[4]);
  });
}


export { playCol, snd };
