// ---------- audição nos editores e notas tocadas no piano roll (teclado da tela, teclado do computador e, no futuro, MIDI) ----------
import { ALL, arpSynth, barOff, bass, bpm, chord, clapOnly, ctx, emit, fxHit, hat, inVoice, kick, lead, padSynth, perc, smpHit, snare, subBass, tT0, tom } from '../app/all.js';
function auditionHit(lane,r,v){return inVoice(auditionHit0,null,[lane,r,v])}
function auditionHit0(lane,r,v){
  const c=ALL().find(x=>x.key===lane);if(!c||!ctx)return;const t=ctx.currentTime+.01,o=c.gain;v=v||1;
  switch(c.type){case 'smp':smpHit(c,t,o,v);break;case 'kick':kick(t,o,v);break;case 'clap':clapOnly(t,o,v);break;case 'snare':snare(t,o,v);break;case 'hat':hat(t,o,false,v);break;case 'ohat':hat(t,o,true,v);break;case 'perc':perc(t,o,v);break;case 'tom':tom(t,c.rows[r].f,o,v);break;case 'fx':fxHit(t,c.rows[r].f,1.6,o,v);break}
}
function auditionNote(lane,m,v){return inVoice(auditionNote0,null,[lane,m,v])}
function auditionNote0(lane,m,v){
  const c=ALL().find(x=>x.key===lane);if(!c||!ctx)return;const t=ctx.currentTime+.01;let o=c.gain;
  if(v&&Math.abs(v-1)>.01){const g=ctx.createGain();g.gain.value=v;g.connect(o);o=g;setTimeout(()=>{try{g.disconnect()}catch(e){}},4000)}
  if(c.type==='bass')bass(t,m,.3,o,1,0,null);else if(c.type==='sub')subBass(t,m,.3,o,1);else if(c.type==='chord')chord(t,[m],.5,o);else if(c.type==='pad')padSynth(t,[m],.8,o);else if(c.type==='arp')arpSynth(t,m,.25,o,1);else lead(t,m,.3,o,1);
}
const HELD={}; // notas seguradas: id -> nota, força e a hora em que começou
function noteOn(c){if(!ctx)return;HELD[c.id]={m:c.note,t:ctx.currentTime,v:c.velocity||1};auditionNote(c.lane,c.note,c.velocity||1)}
// soltou: se estiver gravando, encaixa na grade (1/16) e avisa a tela
function noteOff(c){
  const k=HELD[c.id];if(!k)return;delete HELD[c.id];if(!c.record)return;
  const t0=k.t,t1=ctx.currentTime,sd=60/bpm/4,lat=(ctx.outputLatency||0)+(ctx.baseLatency||0),start=tT0+barOff*16*sd;
  const a=t0-lat,b=t1-lat;
  if(a<start-sd/2)return;
  let s=Math.round((a-start)/sd),l=Math.max(1,Math.round((b-a)/sd));
  s=((s%c.len)+c.len)%c.len;l=Math.min(l,c.len-s);
  emit({type:'note.recorded',lane:c.lane,note:k.m,start:s,length:l,velocity:k.v});
}
export { auditionHit, auditionNote, noteOff, noteOn };
