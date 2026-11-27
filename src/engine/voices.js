// ---------- Limpeza de vozes ----------
// Cada nota cria osciladores, filtros e ganhos. No Safari/iPad eles continuam ligados à mesa depois de tocar e
// o processador vai somando milhares de nós mudos até o áudio engasgar (uns minutos de uso). Aqui cada nota vira
// um "pacote": quando todas as fontes dele terminam, esperamos o rabo do som (eco, filtro) e desligamos tudo.
let VB=null;const VBS={made:0,freed:0,nodes:0};
function vbDone(b){if(b.t)return;b.t=setTimeout(()=>{for(const n of b.nodes){try{n.disconnect()}catch(e){}}VBS.freed++;VBS.nodes+=b.nodes.length;b.nodes.length=0},4000)}
function inVoice(fn,self,args){const prev=VB,b={nodes:[],live:0,closed:false,t:0};VB=b;
  try{return fn.apply(self,args)}finally{VB=prev;b.closed=true;if(b.nodes.length){VBS.made++;if(b.live<=0)vbDone(b)}}}
function voiceInit(){
  ['createGain','createBiquadFilter','createOscillator','createWaveShaper','createDelay','createBufferSource','createConvolver','createStereoPanner','createConstantSource','createDynamicsCompressor'].forEach(k=>{
    if(typeof ctx[k]!=='function')return;const orig=ctx[k].bind(ctx);
    ctx[k]=function(){const n=orig.apply(null,arguments),b=VB;
      if(b){b.nodes.push(n);if(typeof n.start==='function'){const st=n.start.bind(n);let on=false;
        n.start=function(){if(!on){on=true;b.live++;n.addEventListener('ended',()=>{b.live--;if(b.closed&&b.live<=0)vbDone(b)})}return st.apply(null,arguments)}}}
      return n}})}
