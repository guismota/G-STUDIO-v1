import { CFG, CMP, FXA, K, cols, ctx, duck, filt, fin, makeShaper, mix, out, routeLane, updDly, updEch, updFltLfo } from '../app/all.js';
// cadeia de cada linha: volume -> (seco | distorção) -> saída -> mix + envios de reverb e delay
function ensureGain(c){
  if(ctx&&!c.gain){
    c.gain=ctx.createGain();c.post=ctx.createGain();
    c.dDry=ctx.createGain();c.dPre=ctx.createGain();c.dTone=ctx.createBiquadFilter();c.dTone.type='lowpass';
    c.dWet=ctx.createGain();c.dWet.gain.value=0;
    c.sRev=ctx.createGain();c.sRev.gain.value=0;c.sDly=ctx.createGain();c.sDly.gain.value=0;c.sEch=ctx.createGain();c.sEch.gain.value=0;
    c.mid=ctx.createGain();c.fDry=ctx.createGain();c.flt=ctx.createBiquadFilter();c.fWet=ctx.createGain();c.fWet.gain.value=0;
    c.gain.connect(c.dDry);c.dDry.connect(c.mid);
    c.gain.connect(c.dPre);makeShaper(c);c.dTone.connect(c.dWet);c.dWet.connect(c.mid);
    c.mid.connect(c.fDry);c.fDry.connect(c.post);c.mid.connect(c.flt);c.flt.connect(c.fWet);c.fWet.connect(c.post);
    FXA.flt.depth.connect(c.flt.detune);
    c.post.connect(c.type==='kick'?mix:duck);c.post.connect(c.sRev);c.post.connect(c.sDly);c.post.connect(c.sEch);c.sEch.connect(FXA.ech.in);
    c.an=ctx.createAnalyser();c.an.fftSize=256;c.post.connect(c.an);
    c.sRev.connect(FXA.rev.in);c.sDly.connect(FXA.dly.in);
  }
  applyGain(c);routeLane(c);
}
const SOLO=()=>cols.some(x=>x.solo);
const audible=c=>!c.muted&&(!c.solo&&SOLO()?false:true);
function applyGain(c){if(c.gain)c.gain.gain.value=audible(c)?c.vol:0}
function applySolo(){cols.forEach(applyGain)} // o visual do solo (linhas apagadas) fica na tela: updSoloUI em ui/session.js
function setMono(){if(!fin||!out)return;out.channelCount=CFG.mono?1:2;out.channelCountMode=CFG.mono?'explicit':'max';out.channelInterpretation='speakers';fin.channelCount=2;fin.channelCountMode=CFG.mono?'explicit':'max';fin.channelInterpretation='speakers'}
function setLimit(){if(!ctx||!CMP)return;try{out.disconnect()}catch(e){}out.connect(CFG.limit?CMP:fin)}
function setFilter(){if(filt)filt.frequency.value=20000} // controle saiu da barra: o filtro de DJ agora é o pad do Remix FX
function setMaster(){if(out)out.gain.value=K.mv}
function setBpmDelay(){if(ctx&&FXA.dly.in){updDly();updEch()}updFltLfo()} // os visores dos plugins são atualizados pela tela (ui/transport.js)

export { applyGain, applySolo, audible, ensureGain, setBpmDelay, setFilter, setLimit, setMaster, setMono };
