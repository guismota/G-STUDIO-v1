import { bpm, ctx, emit, fin, initAudio, metClick, playing, startTransport, tT0 } from '../app/all.js';
// ---------- Gravação: grava o que sai na master e exporta ----------
const REC={on:false,t0:0,L:[],R:[],len:0,sr:48000,sp:null,z:null,mr:null,mrc:[],mime:'',dst:null,wav:null,m4a:null};
const f2i=a=>{const o=new Int16Array(a.length);for(let i=0;i<a.length;i++){const v=a[i]<-1?-1:a[i]>1?1:a[i];o[i]=v<0?v*32768:v*32767}return o};
function recStart(from){
  initAudio();REC.L=[];REC.R=[];REC.len=0;REC.sr=ctx.sampleRate;REC.wav=null;REC.m4a=null;REC.from=from||0;
  const sp=ctx.createScriptProcessor(4096,2,2);
  sp.onaudioprocess=e=>{if(!REC.on)return;const b=e.inputBuffer;let L=b.getChannelData(0),R=b.numberOfChannels>1?b.getChannelData(1):L;
    const pt=typeof e.playbackTime==='number'?e.playbackTime:ctx.currentTime; // corta o que veio antes da contagem
    if(pt+L.length/REC.sr<=REC.from)return;if(pt<REC.from){const k=Math.floor((REC.from-pt)*REC.sr);L=L.subarray(k);R=R.subarray(k)}
    REC.L.push(f2i(L));REC.R.push(f2i(R));REC.len+=L.length;if(REC.len>REC.sr*60*20)setTimeout(recStop,0)};
  REC.z=ctx.createGain();REC.z.gain.value=0;fin.connect(sp);sp.connect(REC.z);REC.z.connect(ctx.destination);REC.sp=sp;
  REC.mr=null;REC.mrc=[];
  try{if(window.MediaRecorder&&ctx.createMediaStreamDestination){
    const dst=ctx.createMediaStreamDestination();fin.connect(dst);REC.dst=dst;
    const mt=['audio/mp4','audio/aac','audio/webm;codecs=opus','audio/webm'].find(t=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t));
    REC.mr=new MediaRecorder(dst.stream,mt?{mimeType:mt,audioBitsPerSecond:256000}:undefined);REC.mime=REC.mr.mimeType||mt||'audio/mp4';
    REC.mr.ondataavailable=e=>{if(e.data&&e.data.size)REC.mrc.push(e.data)};const go=()=>{try{if(REC.on&&REC.mr.state==='inactive')REC.mr.start(1000)}catch(e){}};const w=(REC.from-ctx.currentTime)*1000;if(w>5)setTimeout(go,w);else go()}}catch(e){REC.mr=null}
  REC.on=true;REC.t0=performance.now()+Math.max(0,(REC.from-ctx.currentTime)*1000);emitRec();
}
function encodeWav(){
  const n=REC.len,sr=REC.sr,buf=new ArrayBuffer(44+n*4),dv=new DataView(buf),w=(o,str)=>{for(let i=0;i<str.length;i++)dv.setUint8(o+i,str.charCodeAt(i))};
  w(0,'RIFF');dv.setUint32(4,36+n*4,true);w(8,'WAVE');w(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);
  dv.setUint32(24,sr,true);dv.setUint32(28,sr*4,true);dv.setUint16(32,4,true);dv.setUint16(34,16,true);w(36,'data');dv.setUint32(40,n*4,true);
  const out=new Int16Array(buf,44);let k=0;
  for(let c=0;c<REC.L.length;c++){const L=REC.L[c],R=REC.R[c];for(let i=0;i<L.length;i++){out[k++]=L[i];out[k++]=R[i]}}
  return new Blob([buf],{type:'audio/wav'});
}
function recStop(){
  if(REC.cnt){recCancel();return}
  if(!REC.on)return;REC.on=false;
  try{fin.disconnect(REC.sp)}catch(e){}try{REC.sp.disconnect()}catch(e){}try{REC.z.disconnect()}catch(e){}
  const fin2=()=>{REC.wav=REC.len?encodeWav():null;REC.L=[];REC.R=[];emitRecDone()};
  if(REC.mr&&REC.mr.state!=='inactive'){REC.mr.onstop=()=>{REC.m4a=REC.mrc.length?new Blob(REC.mrc,{type:REC.mime}):null;try{fin.disconnect(REC.dst)}catch(e){}fin2()};REC.mr.stop()}
  else fin2();
  emitRec();
}
// contagem: 3 cliques no tempo e a gravação entra no próximo tempo
REC.cnt=0;REC.tms=[];
function recCountIn(){
  initAudio();const beat=60/bpm,now=ctx.currentTime;
  let t0=now+.12;if(playing){const n=Math.ceil((now+.06-tT0)/beat);t0=tT0+n*beat}
  const start=t0+3*beat;REC.tms.forEach(clearTimeout);REC.tms=[];
  for(let i=0;i<3;i++){const t=t0+i*beat;metClick(t,i===0);REC.tms.push(setTimeout(()=>{REC.cnt=3-i;emitRec()},Math.max(0,(t-now)*1000)))}
  REC.cnt=3;emitRec();notice('Se prepara');
  recStart(start);
  if(!playing)startTransport(false,start); // o relógio já entra no tempo certo depois dos 3 cliques
  REC.tms.push(setTimeout(()=>{REC.cnt=0;emitRec();notice('Gravando')},Math.max(0,(start-now)*1000)));
}
function recCancel(){REC.tms.forEach(clearTimeout);REC.tms=[];REC.cnt=0;REC.on=false;
  try{fin.disconnect(REC.sp)}catch(e){}try{REC.sp.disconnect()}catch(e){}try{if(REC.mr&&REC.mr.state!=='inactive')REC.mr.stop()}catch(e){}try{fin.disconnect(REC.dst)}catch(e){}
  emitRec();notice('Gravação cancelada')}
// avisos para a tela: estado do botão REC (gravando, contagem) e gravação pronta (os arquivos vão por código: engine.file)
const notice=text=>emit({type:'notice',text});
function emitRec(){emit({type:'rec.state',on:REC.on,count:REC.cnt||0,t0:REC.t0})}
function emitRecDone(){emit({type:'rec.done',seconds:REC.len/REC.sr,mime:REC.mime,wav:REC.wav?{id:'rec:wav',size:REC.wav.size}:null,m4a:REC.m4a?{id:'rec:m4a',size:REC.m4a.size}:null})}
function recFileById(id){return id==='rec:wav'?REC.wav:id==='rec:m4a'?REC.m4a:null}
export { REC, recCancel, recCountIn, recFileById, recStop };
