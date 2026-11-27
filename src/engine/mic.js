import { $, LIBM, UBUF, XS, classify, ctx, idbPut, initAudio, saveLib, uid, xRender, xStopAud, xToast } from '../app/all.js';
// ---------- gravação pelo microfone ----------
var MIC={on:false,stream:null,node:null,src:null,chunks:[],len:0,t0:0,timer:null,buf:null,sr:44100,peak:0,ab:null};
async function micStart(){
  initAudio();xStopAud();
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){xToast('Este aparelho não liberou o microfone para o app');return}
  try{MIC.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}})}catch(e){xToast('Sem acesso ao microfone. Libere em Ajustes > Safari > Microfone.');return}
  MIC.src=ctx.createMediaStreamSource(MIC.stream);MIC.node=ctx.createScriptProcessor(4096,1,1);MIC.chunks=[];MIC.len=0;MIC.sr=ctx.sampleRate;MIC.peak=0;
  const z=ctx.createGain();z.gain.value=0;MIC.z=z;
  MIC.node.onaudioprocess=e=>{if(!MIC.on)return;const d=e.inputBuffer.getChannelData(0);MIC.chunks.push(new Float32Array(d));MIC.len+=d.length;let p=0;for(let i=0;i<d.length;i+=16)p=Math.max(p,Math.abs(d[i]));MIC.peak=Math.max(p,MIC.peak*.85);if(MIC.len>MIC.sr*60)micStop()};
  MIC.src.connect(MIC.node);MIC.node.connect(z);z.connect(ctx.destination);
  MIC.on=true;MIC.t0=Date.now();$('#xRec').classList.add('rec');$('#xRecGo').textContent='Parar';$('#xRecSave').disabled=true;$('#xRecPlay').disabled=true;
  MIC.timer=setInterval(()=>{const s=(Date.now()-MIC.t0)/1000;$('#xRecT').textContent=s.toFixed(1).replace('.',',')+' s';$('#xRecLv').style.width=Math.min(100,MIC.peak*140)+'%'},80);
}
function micStop(){
  if(!MIC.on)return;MIC.on=false;clearInterval(MIC.timer);$('#xRecLv').style.width='0';
  try{MIC.src.disconnect();MIC.node.disconnect();MIC.z.disconnect()}catch(e){}
  if(MIC.stream)MIC.stream.getTracks().forEach(t=>t.stop());MIC.stream=null;
  $('#xRec').classList.remove('rec');$('#xRecGo').textContent='Gravar de novo';
  const all=new Float32Array(MIC.len);let o=0;MIC.chunks.forEach(c=>{all.set(c,o);o+=c.length});MIC.chunks=[];
  let pk=0;for(let i=0;i<all.length;i++)pk=Math.max(pk,Math.abs(all[i]));
  const th=Math.max(.01,pk*.06);let a=0,b=all.length-1;while(a<b&&Math.abs(all[a])<th)a++;while(b>a&&Math.abs(all[b])<th*.5)b--;
  a=Math.max(0,a-Math.round(MIC.sr*.01));b=Math.min(all.length-1,b+Math.round(MIC.sr*.12));
  const cut=all.slice(a,b+1);
  if(cut.length<MIC.sr*.05||pk<.003){$('#xRecT').textContent='Não captou som. Tente de novo mais perto do microfone.';MIC.buf=null;return}
  const g=Math.min(4,.89/pk);for(let i=0;i<cut.length;i++)cut[i]*=g;
  const fo=Math.min(cut.length>>2,Math.round(MIC.sr*.03));for(let i=0;i<fo;i++)cut[cut.length-1-i]*=i/fo;
  const buf=ctx.createBuffer(1,cut.length,MIC.sr);buf.getChannelData(0).set(cut);MIC.buf=buf;MIC.ab=wavMono(cut,MIC.sr);
  $('#xRecT').textContent='Pronto: '+(cut.length/MIC.sr).toFixed(1).replace('.',',')+' s';$('#xRecSave').disabled=false;$('#xRecPlay').disabled=false;
}
function wavMono(f,sr){const n=f.length,ab=new ArrayBuffer(44+n*2),v=new DataView(ab),w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
  w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);
  for(let i=0;i<n;i++){const x=Math.max(-1,Math.min(1,f[i]));v.setInt16(44+i*2,x<0?x*32768:x*32767,true)}return ab}
function openRecDlg(){
  $('#xRecName').value='Gravação '+(LIBM.items.filter(x=>x.rec).length+1);$('#xRecT').textContent='Toque em Gravar e faça o som';
  $('#xRecSave').disabled=true;$('#xRecPlay').disabled=true;$('#xRecGo').textContent='Gravar';MIC.buf=null;$('#xRec').classList.add('open');
}
function closeRecDlg(){micStop();$('#xRec').classList.remove('open');xStopAud()}
async function saveRec(){
  if(!MIC.buf)return;const id=uid(),dur=MIC.buf.duration,name=($('#xRecName').value||'').trim().slice(0,40)||'Gravação';
  try{await idbPut(id,MIC.ab)}catch(e){xToast('Não deu para salvar a gravação');return}
  UBUF[id]=MIC.buf;const c=classify(name,dur);
  LIBM.items.push({id,name,cat:c.cat==='other'?'vocal':c.cat,kind:dur>4?'loop':'oneshot',bpm:c.bpm,bars:c.bars,dur:+dur.toFixed(2),added:Date.now(),rec:true,size:MIC.ab.byteLength});
  saveLib();MIC.buf=null;$('#xRec').classList.remove('open');XS.view='mine';XS.flash=[id];xToast('Gravação salva em Meus sons');xRender();
}

export { MIC, closeRecDlg, micStart, micStop, openRecDlg, saveRec };
