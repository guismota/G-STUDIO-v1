import { LATE } from '../app/late.js';
// ---------- laço de quadros do motor: a cada quadro da tela, avisa a posição tocando, as batidas e os níveis ----------
// (a tela só desenha o que chega pelos eventos transport.step, pulse e meters)
import { CFG, anL, anR, anS, cols, ctx, emit, fin, uiQ } from '../app/all.js';
const PQ=[]; // batidas agendadas (acendem as luzes na hora em que o som chega)
const MB={L:null,R:null,lb:new Float32Array(256),fq:null};
function peakOf(an,buf){an.getFloatTimeDomainData(buf);let m=0;for(let i=0;i<buf.length;i++){const a=buf[i]<0?-buf[i]:buf[i];if(a>m)m=a}return m}
function setupMeters(){
  const sp=ctx.createChannelSplitter(2);fin.connect(sp);
  LATE.anL=ctx.createAnalyser();anL.fftSize=512;LATE.anR=ctx.createAnalyser();anR.fftSize=512;
  sp.connect(anL,0);sp.connect(anR,1);
  LATE.anS=ctx.createAnalyser();anS.fftSize=1024;anS.smoothingTimeConstant=.75;fin.connect(anS);
  MB.L=new Float32Array(512);MB.R=new Float32Array(512);MB.fq=new Uint8Array(anS.frequencyBinCount);
}
function engFrame(){
  if(ctx){
    let st=null;while(uiQ.length&&uiQ[0].t<=ctx.currentTime)st=uiQ.shift();
    if(st)emit({type:'transport.step',step:st.s,bar:st.b});
    if(anS){
      const lanes={};if(!CFG.eco)cols.forEach(c=>{if(c.an)lanes[c.key]=peakOf(c.an,MB.lb)});
      anS.getByteFrequencyData(MB.fq);
      emit({type:'meters',l:peakOf(anL,MB.L),r:peakOf(anR,MB.R),lanes,spectrum:MB.fq,sr:ctx.sampleRate});
    }
    if(CFG.eco)PQ.length=0;
    else while(PQ.length&&PQ[0].t<=ctx.currentTime){const q=PQ.shift();emit({type:'pulse',value:q.v})}
  }
  requestAnimationFrame(engFrame);
}
requestAnimationFrame(engFrame);
export { PQ, setupMeters };
