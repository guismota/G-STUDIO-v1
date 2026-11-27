import { LATE } from '../app/late.js';
import { $, CFG, CHN, PREVIEW, coverOf, drawCover, drawCoverCtx, engine, enterUgen, hRnd, hexA, prevOn, reduceMotion, togglePreview, tuneInX, ugenPreview, ugenStingKey } from '../app/all.js';
// desenha um quadro do visual do canal. modo: 'hero' (lento e sem repetir), 'amb' (cards: quase parado), 'live' (prévia tocando, no tempo)
function drawArt(cv,sp,t0,mode,W,H){
  const dpr=W?1:Math.min(2,window.devicePixelRatio||1),w=W||cv.clientWidth,h=H||cv.clientHeight;if(!w||!h)return;
  if(!W&&(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr))){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
  const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);
  t0=Math.max(0,t0)+(sp.seed%997)/7;
  const slow=mode!=='live',spd=mode==='hero'?.3:mode==='amb'?.16:1,t=t0*spd,b=60/sp.bpm*(slow?2:1);
  const D1=Math.sin(t0*.047),D2=Math.sin(t0*.029+2.1),D3=Math.cos(t0*.019+.7);
  const [c1,c2]=sp.c,ph=((t/b)%1+1)%1,env=Math.exp(-ph*3.5)*(slow?.35:1),mid=h*.5,S=sp.style;
  x.fillStyle='#050505';x.fillRect(0,0,w,h);
  const gx=w*(.7+.1*D1),gy=h*(.42+.12*D2),gr=x.createRadialGradient(gx,gy,0,gx,gy,Math.max(w,h)*.8);gr.addColorStop(0,hexA(c1,.15+.05*D3));gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,w,h);
  x.lineJoin='round';x.lineCap='round';
  const line=(fn,col,lw,a)=>{x.beginPath();for(let i=0;i<=w;i+=3){const y=fn(i);i?x.lineTo(i,y):x.moveTo(i,y)}x.strokeStyle=hexA(col,a==null?1:a);x.lineWidth=lw;x.stroke()};
  const sm=v=>v*v*(3-2*v);
  if(S==='house'){
    const cx=w*(.74+.08*D1),cy=h*(.46+.1*D2),R=Math.max(w,h)*.75;
    for(let i=0;i<5;i++){const r=(((t/b/2+i)%5)/5)*R;x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.strokeStyle=hexA(i%2?c2:c1,Math.max(0,.6-r/R));x.lineWidth=2;x.stroke()}
    x.beginPath();x.arc(cx,cy,h*(.065+.015*D3)*(1+env*.6),0,Math.PI*2);x.fillStyle=c1;x.fill();
    line(i=>h*.8+Math.sin(i/w*Math.PI*(7+2*D2)+t*1.4)*h*.06*(.7+.4*D3+env),c1,2,.85);
  }else if(S==='deep'){
    for(let j=0;j<6;j++){const c=j%2?c2:c1,f=i=>h*(.28+j*.1+.03*D1)+Math.sin(i*.007*(1+.2*D2)+t*.45+j*1.3)*h*(.08+.02*D3)+Math.sin(i*.019-t*.3*(j+1))*h*.03;
      x.beginPath();for(let i=0;i<=w;i+=4){i?x.lineTo(i,f(i)):x.moveTo(i,f(i))}x.lineTo(w,h);x.lineTo(0,h);x.closePath();x.fillStyle=hexA(c,.07);x.fill();line(f,c,1.4,.55)}
  }else if(S==='acid'){
    const fr=5+1.5*D2,am=.85+.25*D1;
    for(let j=2;j>=0;j--)line(i=>{const q=((((i/w)*fr-t/b*.5+j*.07)%1)+1)%1;return mid+j*8+((q*2-1)*h*.2+Math.sin(q*Math.PI*(10+2*D3))*h*.15*Math.exp(-q*3))*(1-j*.25)*am},j?c2:c1,j?1.5:3,j?.35:1);
  }else if(S==='techno'){
    const n=Math.max(12,Math.round(w/26)),bw=w/n,u=t/(b/2),st=Math.floor(u),fr=sm(u-st);
    for(let i=0;i<n;i++){const v0=.15+.85*hRnd(i*7+st*13)*(.4+.6*hRnd(i+st*29)),v1=.15+.85*hRnd(i*7+(st+1)*13)*(.4+.6*hRnd(i+(st+1)*29));const bh=(v0+(v1-v0)*fr)*h*(.72+.08*D1);
      x.fillStyle=hexA(c1,.85);x.fillRect(i*bw+bw*.18,h-bh-h*.08,bw*.64,bh);x.fillStyle=c2;x.fillRect(i*bw+bw*.18,h-bh-h*.08-4,bw*.64,2)}
  }else if(S==='acidtechno'){
    for(let j=0;j<3;j++)line(i=>{const k=(i+t*(160+j*60))/12,k0=Math.floor(k),f=sm(k-k0),a=hRnd(k0+j*999),bb=hRnd(k0+1+j*999);return mid+((a+(bb-a)*f)-.5)*h*(.5-j*.11)*(.75+.25*D1+env*.5)},j===1?c2:c1,j?1.2:2.2,j?.5:1);
  }else if(S==='funk'){
    const pat='X..x..X...x.x...',gs=Math.max(16,Math.min(26,h/6)),cols=Math.ceil(w/gs)+1,rows=Math.ceil(h/gs),u=t/(b/4),st=Math.floor(u),dec=1-(u-st),off=(t*6)%gs;
    for(let cI=0;cI<cols;cI++){const hit=pat[((cI+st)%16+16)%16],ex=(hit==='X'?1:hit==='x'?.6:0)*(slow?.6:1);
      for(let r=0;r<rows;r++){const rr=gs*.12+gs*.3*ex*dec*(r%2?.8:1)+gs*.04*Math.sin(t0*.3+cI*.4+r*.7);x.beginPath();x.arc(cI*gs+gs/2-off,r*gs+gs/2,Math.max(1.2,rr),0,Math.PI*2);x.fillStyle=hexA((cI+r)%3?c1:c2,ex?.9:.28);x.fill()}}
  }else if(S==='dnb'){
    const sc=.9*(1+.2*D2);
    line(i=>{let p=((((i/w)*(3.5+D1)+t*sc)%1)+1)%1;const y=p<.06?h*.34:p<.5?-Math.sin(p*Math.PI*30)*h*.17*Math.exp(-p*4):(p>.6&&p<.65?-h*.32:Math.sin(p*Math.PI*40)*h*.07);return mid-y},c1,2,1);
    const sy=((t*h*.5)%h+h)%h;x.fillStyle=hexA(c2,.1);x.fillRect(0,sy,w,3);
    for(let y=0;y<h;y+=4){x.fillStyle='rgba(0,0,0,.25)';x.fillRect(0,y,w,1)}
  }else if(S==='solomun'){
    const cx=w*(.62+.06*D1),cy=mid;
    for(let k=0;k<4;k++){x.beginPath();const a=3+k%2+.35*D2,bb=2+.2*D3,ph2=t*.35*(k+1)+k;for(let u=0;u<=Math.PI*2+.01;u+=.03){const X=cx+Math.sin(a*u+ph2)*w*.32,Y=cy+Math.sin(bb*u)*h*.36;u?x.lineTo(X,Y):x.moveTo(X,Y)}
      x.strokeStyle=hexA(k%2?c2:c1,.55-k*.08);x.lineWidth=k?1.2:2;x.stroke()}
    x.beginPath();x.arc(cx,cy,4+env*6,0,Math.PI*2);x.fillStyle=c2;x.fill();
  }else if(S==='vice'){ // fim de tarde na orla: céu degradê, brilho do sol, prédios com janelas, mar refletindo, ponte com carros e palmeiras
    const hz=h*.62,sk=x.createLinearGradient(0,0,0,hz);sk.addColorStop(0,'#2b1b5e');sk.addColorStop(.35,'#8a3fb0');sk.addColorStop(.66,'#ff5e8a');sk.addColorStop(.88,'#ff9a5a');sk.addColorStop(1,'#ffd08a');x.fillStyle=sk;x.fillRect(0,0,w,hz);
    const sx=w*(.7+.03*D1),sy=hz-h*.05,gl=x.createRadialGradient(sx,sy,0,sx,sy,h*.6);gl.addColorStop(0,'rgba(255,236,200,.95)');gl.addColorStop(.12,'rgba(255,214,160,.7)');gl.addColorStop(.4,'rgba(255,140,120,.18)');gl.addColorStop(1,'rgba(255,120,120,0)');x.fillStyle=gl;x.fillRect(0,0,w,hz);
    for(let k=0;k<3;k++){const cw=w*(.35+.1*k),cy=h*(.16+.08*k),cx2=((t*(6+3*k)+k*w*.45+sp.seed%200)%(w+cw))-cw*.5;x.fillStyle='rgba(255,180,200,'+(.16+.05*k)+')';x.beginPath();x.ellipse(cx2,cy,cw*.5,h*.018,0,0,Math.PI*2);x.fill()}
    // prédios
    let bx=-4,i=0;while(bx<w*.64){const bw=w*(.035+.04*hRnd(i*3+1)),bh=h*(.1+.3*hRnd(i*7+2))*(i%5===2?1.35:1),top=hz-bh;
      const bg=x.createLinearGradient(0,top,0,hz);bg.addColorStop(0,'#3a1d4f');bg.addColorStop(1,'#1c0f2b');x.fillStyle=bg;x.fillRect(bx,top,bw,bh);
      if(i%4===1){x.fillStyle=i%8===1?'#ff5e8a':'#ffb15e';x.fillRect(bx,top,bw,1.5)}
      const cols=Math.max(1,Math.floor(bw/5)),rows=Math.floor(bh/6);for(let r=1;r<rows;r++)for(let c=0;c<cols;c++){if(hRnd(i*131+r*17+c*7+Math.floor(t*.15+hRnd(i+r)))<.32){x.fillStyle='rgba(255,210,140,.55)';x.fillRect(bx+2+c*5,top+r*6,2,2.5)}}
      bx+=bw+1;i++}
    // mar com o reflexo do sol
    const sea=x.createLinearGradient(0,hz,0,h);sea.addColorStop(0,'#7a3a8a');sea.addColorStop(.4,'#3c1f5e');sea.addColorStop(1,'#140a24');x.fillStyle=sea;x.fillRect(0,hz,w,h-hz);
    for(let k=0;k<9;k++){const y=hz+3+k*((h-hz)/9),ww=(h*.28)*(1-k*.08)*(.8+.2*Math.sin(t*1.3+k*1.7));x.fillStyle='rgba(255,205,160,'+(.55-k*.05)+')';x.fillRect(sx-ww/2+Math.sin(t*.9+k)*6,y,ww,1.6)}
    x.fillStyle='rgba(255,190,150,.5)';x.fillRect(0,hz,w,1);
    // ponte com faróis
    const py=hz+(h-hz)*.32;x.fillStyle='#1a0d27';x.fillRect(0,py,w,2.2);for(let k=0;k<8;k++){x.fillRect(k*w/7,py,2,h*.05)}
    for(let k=0;k<3;k++){const cx3=((t*w*.06+k*w*.37)%(w+20))-10;x.fillStyle='#ff4d4d';x.fillRect(cx3,py-1.6,2.5,1.4);const cx4=w-(((t*w*.05+k*w*.41)%(w+20))-10);x.fillStyle='#fff3d6';x.fillRect(cx4,py-1.6,2.5,1.4)}
    // palmeiras em primeiro plano
    const palm=(px,ph,sc,fl)=>{x.strokeStyle='#120818';x.lineWidth=Math.max(2,4*sc);x.beginPath();x.moveTo(px,h);x.quadraticCurveTo(px+fl*14*sc,h-ph*.55,px+fl*8*sc+3*D2,h-ph);x.stroke();
      const tx=px+fl*8*sc+3*D2,ty=h-ph;x.lineWidth=Math.max(1.5,2.4*sc);for(let k=0;k<8;k++){const a=-Math.PI*.98+k*Math.PI*.28+.06*Math.sin(t*.7+k),L=(30+8*(k%2))*sc;x.beginPath();x.moveTo(tx,ty);x.quadraticCurveTo(tx+Math.cos(a)*L*.6,ty+Math.sin(a)*L*.6-9*sc,tx+Math.cos(a)*L,ty+Math.sin(a)*L+11*sc);x.stroke()}};
    palm(w*.9,h*.88,Math.min(1.5,h/105),-1);palm(w*.8,h*.64,Math.min(1.05,h/150),1);
  }else if(S==='afro'){
    const hz=h*(.6+.03*D2),cx=w*(.7+.05*D1),r=h*(.32+.03*D3);
    x.save();x.beginPath();x.rect(0,0,w,hz);x.clip();const sg=x.createLinearGradient(0,hz-r,0,hz+r*.2);sg.addColorStop(0,c2);sg.addColorStop(1,c1);
    x.beginPath();x.arc(cx,hz+r*.15,r,0,Math.PI*2);x.fillStyle=sg;x.fill();x.restore();
    for(let k=0;k<8;k++){const y=hz+6+k*((h-hz)/8),ww=r*2*(1-k*.09),off=Math.sin(t*1.2+k)*10;x.fillStyle=hexA(k%2?c1:c2,.7-k*.07);x.fillRect(cx-ww/2+off,y,ww,2.5)}
    for(let i=0;i<3;i++){const rr=(((t/b/2+i)%3)/3)*w*.35;x.beginPath();x.arc(w*.18,hz,rr,Math.PI,Math.PI*2);x.strokeStyle=hexA(c1,Math.max(0,.5-rr/(w*.35)));x.lineWidth=2;x.stroke()}
    x.fillStyle=hexA(c1,.4);x.fillRect(0,hz,w,1.5);
  }else{ // gêneros do usuário: curvas próprias a partir do nome
    const s=sp.seed,a=1+s%4+.3*D1,bb=2+(s>>3)%3+.2*D2,k2=1+(s>>6)%3,cx=w*(.6+.05*D3);
    for(let k=0;k<3;k++){x.beginPath();for(let u=0;u<=Math.PI*2+.01;u+=.025){const X=cx+Math.sin(a*u+t*.4+k*.9)*w*.3,Y=mid+Math.sin(bb*u+k*k2)*h*.34*(1-k*.18);u?x.lineTo(X,Y):x.moveTo(X,Y)}
      x.strokeStyle=hexA(k===1?c2:c1,.75-k*.2);x.lineWidth=k?1.3:2.2;x.stroke()}
    line(i=>h*.86+Math.sin(i/w*Math.PI*(4+s%5)+t*1.5)*h*.05*(.6+.3*D1+env),c2,1.6,.8);
  }
}
// destaque: um disco de vinil girando devagar, com o selo no visual do gênero e o braço da agulha
const HERO_BG='#0f0f16'; // cinza bem escuro com 3% de azul
function drawVinyl(cv,sp,t,mode){
  const dpr=Math.min(2,window.devicePixelRatio||1),w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
  if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
  const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);t=Math.max(0,t);
  const C=coverOf(sp),live=mode==='live',nar=w<560;
  x.fillStyle=HERO_BG;x.fillRect(0,0,w,h);
  // capa: quadrada, à direita; o disco sai pela esquerda dela
  const S=Math.round(nar?Math.min(h*.78,w*.52):Math.min(h*1.06,w*.34)),cxR=nar?w-S*.5:w*.72,X0=Math.round(cxR-S/2),Y0=Math.round(nar?h*.04:h*.06);
  const tilt=-.075+Math.sin(t*.35)*.008; // tortinho, balançando quase nada
  const br=Math.sin(t*Math.PI*2/9),R=S*.47,out=live?.6:.46+.09*br,rot=t*Math.PI*2*(live?.55:.22)+(sp.seed%628)/100;
  x.save();x.translate(X0+S/2,Y0+S/2);x.rotate(tilt);x.translate(-S/2,-S/2); // daqui pra baixo: coordenadas da capa
  const dcx=S*.5-S*out-S*.02,dcy=S/2+Math.sin(t*1.3)*S*.006;
  // sombra do disco
  x.save();x.shadowColor='rgba(0,0,0,.55)';x.shadowBlur=S*.09;x.shadowOffsetX=-S*.02;x.shadowOffsetY=S*.04;
  x.beginPath();x.arc(dcx,dcy,R,0,Math.PI*2);x.fillStyle='#141414';x.fill();x.restore();
  for(let r=R*.4;r<R*.97;r+=2.4){x.beginPath();x.arc(dcx,dcy,r,0,Math.PI*2);x.strokeStyle=((r/2.4)|0)%2?'rgba(255,255,255,.04)':'rgba(255,255,255,.07)';x.lineWidth=1;x.stroke()}
  x.beginPath();x.arc(dcx,dcy,R*.985,0,Math.PI*2);x.strokeStyle='rgba(255,255,255,.16)';x.lineWidth=1.3;x.stroke();
  [[-1.0,-.45,.08],[2.15,2.6,.05]].forEach(([a0,a1,al])=>{x.save();x.beginPath();x.moveTo(dcx,dcy);x.arc(dcx,dcy,R*.97,a0,a1);x.closePath();x.clip();const sg=x.createRadialGradient(dcx,dcy,R*.36,dcx,dcy,R);sg.addColorStop(0,'rgba(255,255,255,0)');sg.addColorStop(.6,'rgba(255,255,255,'+al+')');sg.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=sg;x.fillRect(dcx-R,dcy-R,R*2,R*2);x.restore()});
  x.save();x.translate(dcx,dcy);x.rotate(rot);
  x.beginPath();x.arc(0,0,R*.62,-.3,.3);x.strokeStyle='rgba(255,255,255,.11)';x.lineWidth=R*.16;x.stroke();
  const lr=R*.33;x.beginPath();x.arc(0,0,lr,0,Math.PI*2);x.fillStyle=C.vl||(C.blk===C.bg?C.ink:C.blk);x.fill();
  x.fillStyle=C.vt||(C.blk===C.bg||C.lay==='side'?C.bg:(C.lay==='block'||C.lay==='outline'?'#0c0c0c':C.bg));x.font='800 '+Math.max(7,Math.round(lr*.2))+'px "Archivo",sans-serif';x.textAlign='center';
  x.fillText('G-STUDIO',0,-lr*.42);x.fillText('LADO A',0,lr*.58);
  x.fillRect(-lr*.62,-1,lr*.4,2);x.fillRect(lr*.22,-1,lr*.4,2);
  x.restore();
  x.beginPath();x.arc(dcx,dcy,Math.max(2,R*.025),0,Math.PI*2);x.fillStyle=HERO_BG;x.fill();
  // sombra da capa
  x.save();x.shadowColor='rgba(0,0,0,.6)';x.shadowBlur=S*.1;x.shadowOffsetX=-S*.015;x.shadowOffsetY=S*.05;x.fillStyle='#000';x.fillRect(0,0,S,S);x.restore();
  x.save();x.beginPath();x.rect(0,0,S,S);x.clip();drawCoverCtx(x,S,S,sp,t,live?'live':'amb');x.restore();
  x.strokeStyle='rgba(255,255,255,.08)';x.lineWidth=1;x.strokeRect(.5,.5,S-1,S-1);
  x.restore();
}
function vinylLabel(){return null}
const HART={list:[],raf:0,t0:performance.now(),lh:0,lt:0,io:null};
function hartIO(){if(HART.io||!window.IntersectionObserver)return;HART.io=new IntersectionObserver(es=>es.forEach(e=>{const o=HART.list.find(z=>z.cv===e.target);if(o)o.vis=e.isIntersecting}),{root:$('#home'),rootMargin:'40px'})}
function hartDraw(o,t,mode){if(o.hero)drawVinyl(o.cv,o.sp,t,mode);else drawCover(o.cv,o.sp,t,mode)}
function hartReg(cv,sp,hero){const o={cv,sp,hero,vis:true};HART.list.push(o);hartDraw(o,hero?0:20,hero?'hero':'amb');if(!hero){hartIO();if(HART.io)HART.io.observe(cv)}}
function hartLoop(now){
  HART.raf=0;if(document.body.classList.contains('in-session')||document.hidden)return;
  const t=(now-HART.t0)/1000,still=CFG.eco||reduceMotion(),dh=now-HART.lh>=33,dt=now-HART.lt>=100;
  if(dh)HART.lh=now;if(dt)HART.lt=now;
  HART.list.forEach(o=>{if(!o.cv.isConnected)return;const host=o.cv.parentElement,pl=host&&host.classList.contains('playing');
    if(pl){o.wp=true;if(dh)hartDraw(o,t,'live')}
    else if(o.wp&&!o.hero){o.wp=false;hartDraw(o,0,'amb')} // capas são paradas: só redesenha ao parar a prévia
    else if(still)return;
    else if(o.hero){if(dh)hartDraw(o,t,'hero')}});
  HART.raf=requestAnimationFrame(hartLoop);
}
function hartStart(){if(!HART.raf)HART.raf=requestAnimationFrame(hartLoop)}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>HART.list.forEach(o=>{if(o.cv.isConnected)hartDraw(o,0,o.hero?'hero':'amb')}));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)hartStart()});
window.addEventListener('resize',()=>{document.querySelectorAll('#cards .hrow').forEach(r=>r._upd&&r._upd());const t=(performance.now()-HART.t0)/1000;HART.list.forEach(o=>{if(o.cv.isConnected)hartDraw(o,o.hero?t:t+20,o.hero?'hero':'amb')})});
const PRO_LOCK=false;
const ICO_LOCK=()=>'<svg class="plock'+(PRO_LOCK?' closed':' open')+'" viewBox="0 0 16 16" aria-hidden="true">'+(PRO_LOCK?'<path d="M4.8 7V5a3.2 3.2 0 0 1 6.4 0v2" fill="none" stroke="currentColor" stroke-width="1.7"/>':'<path d="M4.8 7V4.9a3.2 3.2 0 0 1 6.1-1.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>')+'<rect x="2.8" y="7" width="10.4" height="7.6" rx="1.8" fill="currentColor"/><rect x="7.2" y="9.4" width="1.6" height="2.8" rx=".8" fill="#000"/></svg>';
const ICO_SPK='<svg viewBox="0 0 16 16"><path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor"/><path class="sw" d="M11 5.5a3.5 3.5 0 0 1 0 5M13 3.5a6.5 6.5 0 0 1 0 9" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
const hEsc=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function hNameHTML(G,S){return G&&G.artist?(G.html||'<span>After</span><em>party</em>'):hEsc(S.name)}
function hEnterUg(el,g,i){tuneInX(el,()=>enterUgen(g.id),{c:'#2F5BEA',ink:'#fff',ch:CHN(i),nm:g.name.replace(/[<>&]/g,'')},ugenStingKey(g))}
function hUgPreview(g){PREVIEW[g.id]=bb=>{ugenPreview(g.id,()=>{if(prevOn&&prevOn.b===bb){bb.classList.remove('playing');LATE.prevOn=null}});return()=>engine.send({type:'preview.stop'})}}
function hTile(o){
  const b=document.createElement('div');b.className='htile'+(o.cls?' '+o.cls:'');b.setAttribute('role','button');b.tabIndex=0;
  b.style.setProperty('--gc',o.gc);b.style.setProperty('--d',o.d+'ms');b.dataset.ch=o.ch;
  b.innerHTML='<canvas aria-hidden="true"></canvas><span class="tv" aria-hidden="true"></span><span class="tprev" role="button" aria-label="Ouvir prévia">'+ICO_SPK+'</span><span class="tin"><span class="thd"><span class="tch"></span><span class="tb"></span></span><span class="tn"></span></span>';
  b.querySelector('.tch').textContent=o.ch;if(o.trend)b.querySelector('.tch').insertAdjacentHTML('afterend','<span class="ttag">Trending</span>');b.querySelector('.tn').innerHTML=o.name;if(o.art)b.querySelector('.tn').classList.add('art');b.querySelector('.tb').textContent=o.sub;
  b.setAttribute('aria-label',o.label);
  b.onclick=()=>o.enter(b);b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();o.enter(b)}};
  if(o.noprev)b.querySelector('.tprev').remove();else b.querySelector('.tprev').onclick=e=>{e.stopPropagation();togglePreview(b,o.pk)};
  return b;
}
function hRow(title,n){const s=document.createElement('section');s.className='hrow';s.innerHTML='<div class="hrh"><h2></h2><span></span><i class="spacer"></i><button class="hra" data-d="-1" aria-label="Voltar">‹</button><button class="hra" data-d="1" aria-label="Avançar">›</button></div><div class="hscroll"></div>';
  const sc=s.querySelector('.hscroll'),upd=()=>{const a=s.querySelectorAll('.hra');a[0].disabled=sc.scrollLeft<4;a[1].disabled=sc.scrollLeft+sc.clientWidth>=sc.scrollWidth-4;s.classList.toggle('noscroll',sc.scrollWidth<=sc.clientWidth+4)};
  s.querySelectorAll('.hra').forEach(b=>b.onclick=()=>sc.scrollBy({left:+b.dataset.d*sc.clientWidth*.8,behavior:'smooth'}));sc.addEventListener('scroll',upd,{passive:true});s._upd=upd;s.querySelector('h2').textContent=title;if(title==='PRO'){s.classList.add('pro');s.querySelector('h2').insertAdjacentHTML('beforeend',ICO_LOCK());s.querySelector('h2').title=PRO_LOCK?'Exclusivo do plano PRO':'PRO liberado'}s.querySelector('.hrh span').textContent=n?String(n):'';return s}
export { HART, ICO_SPK, hEnterUg, hEsc, hNameHTML, hRow, hTile, hartReg, hartStart };
