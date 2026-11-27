import { $, CFG, cols, engine } from '../app/all.js';
// ---------- Medidores, espectro e luzes ----------
const VZ={pulse:0,lastP:-1,clipUntil:0,lvL:0,lvR:0,fq:null,bars:null,caps:null,m:null,pend:[]};
const dbv=p=>{if(p<=.00001)return 0;return Math.max(0,Math.min(1,(20*Math.log10(p)+48)/48))};
const elL=$('#mL'),elR=$('#mR'),clipLed=$('#clipLed'),lightsEl=$('#lights'),laserEl=$('#laser'),markEl=document.querySelector('#homeBtn .mark');
const spec=$('#spec'),sctx=spec.getContext('2d');
const setLvl=(el,v)=>{el.style.clipPath='inset('+((1-v)*100).toFixed(1)+'% 0 0 0)'};
clipLed.addEventListener('click',()=>{VZ.clipUntil=0;clipLed.classList.remove('hot')});
// o motor manda a cada quadro os picos da saída e das linhas, o espectro e as batidas (para as luzes)
engine.on('meters',e=>{VZ.m=e;VZ.fq=e.spectrum});
engine.on('pulse',e=>{VZ.pend.push(e.value)});
function drawViz(){
  const M=VZ.m;
  if(M){
    const now=performance.now(),pl=M.l,pr=M.r;
    if(pl>=.999||pr>=.999)VZ.clipUntil=now+1500;
    VZ.lvL=Math.max(dbv(pl),VZ.lvL-.025);VZ.lvR=Math.max(dbv(pr),VZ.lvR-.025);
    setLvl(elL,VZ.lvL);setLvl(elR,VZ.lvR);
    clipLed.classList.toggle('hot',now<VZ.clipUntil);
    if(!CFG.eco)cols.forEach(c=>{
      const pk=M.lanes[c.key];if(pk==null||!c.lmEl)return;
      const v=Math.max(dbv(pk),(c.lv||0)-.03);c.lv=v;
      if(Math.abs(v-(c.lvS==null?-1:c.lvS))>.008){c.lvS=v;setLvl(c.lmEl,v)}
    });
  }
  if(CFG.eco){VZ.pend.length=0;return}
  VZ.pulse*=.88;
  for(const v of VZ.pend)if(v>VZ.pulse)VZ.pulse=v;VZ.pend.length=0;
  if(VZ.pulse<.01)VZ.pulse=0;
  if(CFG.noflash)VZ.pulse=0;
  if(Math.abs(VZ.pulse-VZ.lastP)>.01){
    VZ.lastP=VZ.pulse;const p=VZ.pulse;
    lightsEl.style.opacity=(.35+p*.65).toFixed(3);laserEl.style.opacity=(.15+p*.85).toFixed(3);
    markEl.style.filter=p>.02?'drop-shadow(0 0 '+Math.round(2+p*10)+'px rgba(255,90,150,'+(.25+p*.55).toFixed(2)+'))':'none';
  }
  drawSpec();
}
function drawSpec(){
  const dpr=window.devicePixelRatio||1,w=spec.clientWidth,h=spec.clientHeight;
  if(!w||!h)return;
  const W=Math.round(w*dpr),H=Math.round(h*dpr);
  if(spec.width!==W||spec.height!==H||!VZ.sg){spec.width=W;spec.height=H;VZ.sg=sctx.createLinearGradient(0,H,0,0);const ac=document.body.classList.contains('th-cumbia')?'#FF4B1F':document.body.classList.contains('th-vice')?'#FF45C8':document.body.classList.contains('th-afro')?'#FF6B2C':document.body.classList.contains('th-art')?'#B026FF':'#FFE600';VZ.sg.addColorStop(0,ac);VZ.sg.addColorStop(1,ac)}
  const n=Math.max(16,Math.min(96,Math.floor(w/9)));
  if(!VZ.bars||VZ.bars.length!==n){VZ.bars=new Float32Array(n);VZ.caps=new Float32Array(n)}
  sctx.clearRect(0,0,W,H);
  const fq=VZ.fq,binHz=VZ.m?VZ.m.sr/1024:46.875,f0=35,f1=16000,bw=W/n,gap=Math.max(1,Math.round(bw*.28));
  for(let i=0;i<n;i++){
    let m=0;
    if(fq){
      const a=Math.floor(f0*Math.pow(f1/f0,i/n)/binHz),b=Math.max(a+1,Math.floor(f0*Math.pow(f1/f0,(i+1)/n)/binHz));
      for(let k=a;k<b&&k<fq.length;k++)if(fq[k]>m)m=fq[k];
    }
    VZ.bars[i]=Math.max(m/255,VZ.bars[i]-.04);VZ.caps[i]=Math.max(VZ.bars[i],VZ.caps[i]-.008);
    const v=VZ.bars[i],bh=Math.max(dpr,v*(H-3*dpr)),x=i*bw;
    sctx.globalAlpha=.25+v*.75;sctx.fillStyle=VZ.sg;sctx.fillRect(x,H-bh,bw-gap,bh);
    if(VZ.caps[i]>.02){sctx.globalAlpha=.9;sctx.fillStyle='#ffffff';sctx.fillRect(x,H-VZ.caps[i]*(H-3*dpr)-2*dpr,bw-gap,1.5*dpr)}
  }
  sctx.globalAlpha=1;
}

export { VZ, dbv, drawViz };
