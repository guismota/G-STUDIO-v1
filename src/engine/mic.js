import { AUD, UBUF, audStop, ctx, emit, idbPut, initAudio, out } from '../app/all.js';
// ---------- gravação pelo microfone ----------
var MIC={on:false,stream:null,node:null,src:null,chunks:[],len:0,t0:0,timer:null,buf:null,sr:44100,peak:0,ab:null};
async function micStart(){
  initAudio();
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){emit({type:'notice',kind:'toast',text:'Este aparelho não liberou o microfone para o app'});return}
  try{MIC.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}})}catch(e){emit({type:'notice',kind:'toast',text:'Sem acesso ao microfone. Libere em Ajustes > Safari > Microfone.'});return}
  MIC.src=ctx.createMediaStreamSource(MIC.stream);MIC.node=ctx.createScriptProcessor(4096,1,1);MIC.chunks=[];MIC.len=0;MIC.sr=ctx.sampleRate;MIC.peak=0;
  const z=ctx.createGain();z.gain.value=0;MIC.z=z;
  MIC.node.onaudioprocess=e=>{if(!MIC.on)return;const d=e.inputBuffer.getChannelData(0);MIC.chunks.push(new Float32Array(d));MIC.len+=d.length;let p=0;for(let i=0;i<d.length;i+=16)p=Math.max(p,Math.abs(d[i]));MIC.peak=Math.max(p,MIC.peak*.85);if(MIC.len>MIC.sr*60)micStop()};
  MIC.src.connect(MIC.node);MIC.node.connect(z);z.connect(ctx.destination);
  MIC.on=true;MIC.t0=Date.now();emit({type:'mic.state',on:true});
  MIC.timer=setInterval(()=>emit({type:'mic.level',value:MIC.peak,t0:MIC.t0}),80);
}
function micStop(){
  if(!MIC.on)return;MIC.on=false;clearInterval(MIC.timer);
  try{MIC.src.disconnect();MIC.node.disconnect();MIC.z.disconnect()}catch(e){}
  if(MIC.stream)MIC.stream.getTracks().forEach(t=>t.stop());MIC.stream=null;
  emit({type:'mic.state',on:false});
  const all=new Float32Array(MIC.len);let o=0;MIC.chunks.forEach(c=>{all.set(c,o);o+=c.length});MIC.chunks=[];
  let pk=0;for(let i=0;i<all.length;i++)pk=Math.max(pk,Math.abs(all[i]));
  const th=Math.max(.01,pk*.06);let a=0,b=all.length-1;while(a<b&&Math.abs(all[a])<th)a++;while(b>a&&Math.abs(all[b])<th*.5)b--;
  a=Math.max(0,a-Math.round(MIC.sr*.01));b=Math.min(all.length-1,b+Math.round(MIC.sr*.12));
  const cut=all.slice(a,b+1);
  if(cut.length<MIC.sr*.05||pk<.003){MIC.buf=null;emit({type:'mic.done',ok:false});return}
  const g=Math.min(4,.89/pk);for(let i=0;i<cut.length;i++)cut[i]*=g;
  const fo=Math.min(cut.length>>2,Math.round(MIC.sr*.03));for(let i=0;i<fo;i++)cut[cut.length-1-i]*=i/fo;
  const buf=ctx.createBuffer(1,cut.length,MIC.sr);buf.getChannelData(0).set(cut);MIC.buf=buf;MIC.ab=wavMono(cut,MIC.sr);
  emit({type:'mic.done',ok:true,seconds:cut.length/MIC.sr});
}
function wavMono(f,sr){const n=f.length,ab=new ArrayBuffer(44+n*2),v=new DataView(ab),w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
  w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);
  for(let i=0;i<n;i++){const x=Math.max(-1,Math.min(1,f[i]));v.setInt16(44+i*2,x<0?x*32768:x*32767,true)}return ab}
// guarda a gravação do microfone (o arquivo vai para o IndexedDB e o som fica pronto para tocar)
function micSave(c){if(!MIC.buf){emit({type:'mic.saved',token:c.token,ok:false});return}const buf=MIC.buf,ab=MIC.ab;
  idbPut(c.id,ab).then(()=>{UBUF[c.id]=buf;MIC.buf=null;emit({type:'mic.saved',token:c.token,ok:true,duration:buf.duration,size:ab.byteLength})},()=>emit({type:'mic.saved',token:c.token,ok:false}))}
// ouve a gravação do microfone (usa a mesma vaga da audição da biblioteca)
function micPlay(){if(!MIC.buf)return;audStop();const s=ctx.createBufferSource();s.buffer=MIC.buf;s.connect(out);s.start();AUD.src=s;AUD.g={gain:{setTargetAtTime(){}}};AUD.token='rec'}
export { MIC, micPlay, micSave, micStart, micStop };
