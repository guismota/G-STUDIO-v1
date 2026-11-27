// ---------- Capas tipográficas dos cards (estilo capa de disco de selo) ----------
// lay: band (faixa de cor em cima), block (bloco de cor na lateral), side (palavra deitada), outline (contorno), stack (duas linhas)
const COVER={
 house:{lay:'band',bg:'#0c0c0c',blk:'#FFE600',ink:'#f2f2ee',lab:'#000',w:'HOUSE'},
 deep:{lay:'block',bg:'#ECE9E1',blk:'#3D7BFF',ink:'#0c0c0c',lab:'#0c0c0c',w:'DEEP'},
 acid:{lay:'side',bg:'#C8FF3D',blk:'#0c0c0c',ink:'#0c0c0c',lab:'#0c0c0c',w:'ACID'},
 techno:{lay:'outline',bg:'#0c0c0c',blk:'#6C8BFF',ink:'#6C8BFF',lab:'#f2f2ee',w:'TECHNO'},
 acidtechno:{lay:'split',bg:'#0c0c0c',blk:'#5CFF8A',ink:'#5CFF8A',lab:'#5CFF8A',w:'ACID',w2:'TECHNO'},
 funk:{lay:'band',bg:'#FF3DAE',blk:'#0c0c0c',ink:'#FFE600',lab:'#FFE600',w:'MPEB',low:true},
 dnb:{lay:'block',bg:'#0c0c0c',blk:'#22E1FF',ink:'#f2f2ee',lab:'#f2f2ee',w:'D&B',left:true},
 solomun:{lay:'sun',bg:'#16062a',blk:'#B026FF',ink:'#E9C8FF',lab:'#E2B8FF',w:'6AM',pro:true},
 afro:{lay:'band',bg:'#FF6B2C',blk:'#1a0c04',ink:'#FFF1DC',lab:'#FFC23D',w:'AFRO',low:true,pro:true},
 vice:{lay:'vi',bg:'#2a0a3a',blk:'#FF8A3D',ink:'#FF45C8',lab:'#FFB3E6',w:'VI',pro:true},
 cumbia:{lay:'teclas',bg:'#FF4B1F',blk:'#F4F2EA',ink:'#111111',lab:'#111111',w:'CUMBIA',pro:true}
};
const COVF='"Big Shoulders Display","Archivo",sans-serif';
let COVG=null;function coverGrain(){if(COVG)return COVG;const c=document.createElement('canvas');c.width=c.height=180;const g=c.getContext('2d'),d=g.createImageData(180,180);for(let i=0;i<d.data.length;i+=4){const v=Math.random()<.5?0:255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=Math.random()*200|0}g.putImageData(d,0,0);return COVG=c}
function coverOf(sp){
  if(COVER[sp.style])return COVER[sp.style];
  const lays=['band','block','outline'],L=lays[sp.seed%3],w=(String(sp.name||'MEU').trim().split(/\s+/)[0]||'MEU').toUpperCase().slice(0,8);
  return {lay:L,bg:L==='block'?'#ECE9E1':'#0c0c0c',blk:'#2F5BEA',ink:L==='block'?'#0c0c0c':(L==='outline'?'#5B86FF':'#f2f2ee'),lab:L==='band'?'#f2f2ee':(L==='block'?'#0c0c0c':'#f2f2ee'),w,user:true};
}
function coverCat(sp){let i=-1;if(sp.style==='user'){const u=ugenList();i=GENRES.length+u.findIndex(x=>x.id===sp.id)}else i=GENRES.findIndex(x=>x.k===sp.style);return 'G—'+String(Math.max(1,i+1)).padStart(3,'0')}
// fonte do tamanho que faz a palavra "estourar" a largura, como nas capas
function coverFit(x,word,maxW,maxH){let f=maxH;x.font='900 '+f+'px '+COVF;const m=x.measureText(word).width;if(m>maxW)f=f*maxW/m;return Math.max(10,f)}
function drawCover(cv,sp,t,mode){
  const dpr=Math.min(2,window.devicePixelRatio||1),w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
  if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
  const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);drawCoverCtx(x,w,h,sp,t,mode);
}
function drawCoverCtx(x,w,h,sp,t,mode){
  const C=coverOf(sp),cat=coverCat(sp);
  const shOn=()=>{x.shadowColor='rgba(0,0,0,.3)';x.shadowBlur=Math.max(3,Math.round(h*.045));x.shadowOffsetX=0;x.shadowOffsetY=Math.max(1,Math.round(h*.014))},shOff=()=>{x.shadowColor='rgba(0,0,0,0)';x.shadowBlur=0;x.shadowOffsetY=0}; // sombra leve só nas letras grandes
  x.fillStyle=C.bg;x.fillRect(0,0,w,h);x.textBaseline='alphabetic';
  const lab=(txt,X,Y,col,al)=>{x.font='800 '+Math.round(h*.085)+'px "Archivo",sans-serif';x.fillStyle=col;x.textAlign=al||'left';x.fillText(txt,X,Y)};
  const pad=Math.round(w*.06),lh=Math.round(h*.085);
  if(C.lay==='band'){
    const bh=Math.round(h*.36),by=C.low?h-bh:0;x.fillStyle=C.blk;x.fillRect(0,by,w,bh);
    const f=coverFit(x,C.w,w*1.25,h*(C.low?.78:.82));x.font='900 '+f+'px '+COVF;x.fillStyle=C.ink;x.textAlign='left';
    shOn();x.fillText(C.w,-f*.06,C.low?h*.66:h+f*.1);shOff();
    if(C.low)lab(cat,w-pad,by+bh*.5+lh*.36,C.lab,'right');else lab(cat,pad,bh*.5+lh*.36,C.lab);
  }else if(C.lay==='block'){
    const bw=Math.round(w*.34),bx=C.left?0:w-bw;x.fillStyle=C.blk;x.fillRect(bx,0,bw,h);
    const f=coverFit(x,C.w,w*1.3,h*.86);x.font='900 '+f+'px '+COVF;x.fillStyle=C.ink;x.textAlign=C.left?'right':'left';
    shOn();if(C.left){x.fillText(C.w,w+f*.05,h+f*.12)}else x.fillText(C.w,-f*.05,h+f*.12);shOff();
    lab(cat,C.left?bw+pad:pad,pad+lh,C.lab);
  }else if(C.lay==='side'){
    const f=coverFit(x,C.w,h*1.2,w*.62);x.save();x.translate(w*.02,h);x.rotate(-Math.PI/2);x.font='900 '+f+'px '+COVF;x.fillStyle=C.ink;x.textAlign='left';shOn();x.fillText(C.w,-h*.02,f*.8);shOff();x.restore();
    x.fillStyle=C.blk;x.beginPath();x.arc(w*.78,h*.62,h*.16,0,Math.PI*2);x.fill();
    lab(cat,w-pad,h-pad,C.lab,'right');
  }else if(C.lay==='outline'){
    x.fillStyle=C.blk;x.fillRect(0,h-Math.round(h*.12),w,Math.round(h*.12));
    const f=coverFit(x,C.w,w*1.2,h*.8);x.font='900 '+f+'px '+COVF;x.strokeStyle=C.ink;x.lineWidth=Math.max(1.4,f*.025);x.lineJoin='round';x.textAlign='left';
    shOn();x.strokeText(C.w,-f*.04,h*.8);shOff();
    lab(cat,pad,pad+lh,C.lab);
  }else if(C.lay==='split'){
    const words=()=>{const fa=h*.66,ft=h*.44,ya=h*.14+fa*.74;x.textAlign='left';x.font='900 '+fa+'px '+COVF;x.fillText(C.w,pad*.7,ya);x.font='900 '+ft+'px '+COVF;x.fillText(C.w2,pad*.7,ya+ft*.86)};
    const tri=()=>{x.beginPath();x.moveTo(0,h*1.02);x.lineTo(w,h*.3);x.lineTo(w,h);x.lineTo(0,h);x.closePath()};
    x.fillStyle=C.ink;shOn();words();shOff();
    x.save();tri();x.fillStyle=C.blk;x.fill();x.clip();x.fillStyle=C.bg;words();x.restore();
    lab(cat,pad,pad+lh*.9,C.lab);
  }else if(C.lay==='tape'){
    const f=coverFit(x,C.w,w-pad*1.4,h*.6);x.font='900 '+f+'px '+COVF;x.fillStyle=C.ink;x.textAlign='left';shOn();x.fillText(C.w,pad*.7,pad*.5+f*.86);shOff();
    x.save();x.translate(w/2,h*.7);x.rotate(-.13);const bh=h*.2;x.fillStyle=C.blk;shOn();x.fillRect(-w,-bh/2,w*2,bh);shOff();
    const tf=Math.round(bh*.56);x.font='900 '+tf+'px '+COVF;x.fillStyle=C.tp;x.textAlign='left';x.textBaseline='middle';
    const seg=C.w2+'  ✱  ',sw=x.measureText(seg).width;for(let xx=-w*1.1;xx<w*1.1;xx+=sw)x.fillText(seg,xx,bh*.04);x.textBaseline='alphabetic';x.restore();
    lab(cat,w-pad,h-pad*.8,C.lab,'right');
  }else if(C.lay==='sun'){
    x.fillStyle=C.blk;x.beginPath();x.arc(w*.68,h*.98,h*.62,Math.PI,0);x.fill();
    x.fillStyle=C.bg;for(let i=0;i<4;i++)x.fillRect(0,h*.62+i*h*.085,w,Math.max(1.5,h*.022*(i+1)*.6));
    const f=coverFit(x,C.w,w*1.12,h*.74);x.font='900 '+f+'px '+COVF;x.fillStyle=C.ink;x.textAlign='left';shOn();x.fillText(C.w,-f*.04,h*.93);shOff();
    lab(cat,pad,pad+lh*.9,C.lab);
  }else if(C.lay==='vi'){
    x.save();x.translate(w*.54,h*.6);x.rotate(-.28);const f=h*1.36;x.font='900 '+f+'px '+COVF;x.fillStyle=C.ink;x.textAlign='center';shOn();x.fillText(C.w,0,f*.36);shOff();x.restore();
    x.fillStyle=C.blk;x.fillRect(0,h-Math.round(h*.09),w*.55,Math.round(h*.09));
    lab(cat,pad,pad+lh*.9,C.lab);
  }else if(C.lay==='teclas'){ // teclado: teclas na diagonal cruzando a capa e o nome em bloco
    const f=coverFit(x,C.w,w*1.04,h*.5);
    x.save();x.translate(w*.5,h*.5);x.rotate(-.2);const kw=Math.max(8,h*.1),kh=h*.9,n=Math.ceil(w*1.7/kw)+4,gap=Math.max(1,kw*.07);
    x.fillStyle='#111';x.fillRect(-n*kw,0,2*n*kw,kh);
    for(let i=-n;i<n;i++){x.fillStyle=C.blk;x.fillRect(i*kw+gap/2,0,kw-gap,kh)}
    for(let i=-n;i<n;i++){if([0,1,3,4,5].includes(((i%7)+7)%7)){x.fillStyle=C.ink;x.fillRect(i*kw+kw*.66,0,kw*.6,kh*.36)}}
    x.restore();
    x.font='900 '+f+'px '+COVF;x.fillStyle=C.ink;x.textAlign='left';shOn();x.fillText(C.w,-f*.02,f*.74);shOff();
    lab(cat,pad*.8,f*.74+lh*1.2,C.lab);
  }else{ // stack
    const f=coverFit(x,C.w2.length>C.w.length?C.w2:C.w,w*1.08,h*.46);x.font='900 '+f+'px '+COVF;x.fillStyle=C.ink;x.textAlign='left';
    shOn();x.fillText(C.w,pad*.6,h*.5);shOff();shOn();x.fillText(C.w2,pad*.6,h*.5+f*.86);shOff();
    x.fillStyle=C.blk;x.fillRect(0,h-Math.round(h*.09),w*.55,Math.round(h*.09));
    lab(cat,pad,pad+lh*.9,C.lab);
  }
  if(C.pro){ // acabamento PRO: filete interno e selo redondo
    x.strokeStyle=C.lab;x.globalAlpha=.55;x.lineWidth=1;x.strokeRect(5.5,5.5,w-11,h-11);x.globalAlpha=1;
  }
  if(C.pro){const f=Math.round(w*.3),cx=pad+f*.2,cy=h-pad-f*.2;x.save();x.translate(cx,cy);x.rotate(Math.PI/6);x.font='700 '+f+'px "Helvetica Neue",Helvetica,Arial,sans-serif';x.textAlign='center';x.textBaseline='alphabetic';x.fillStyle='#FFE600';shOn();x.fillText('*',0,f*.6);shOff();x.restore()} // asterisco amarelo no canto
  x.save();x.globalAlpha=.075;x.fillStyle=x.createPattern(coverGrain(),'repeat');x.fillRect(0,0,w,h);x.restore(); // grão de impressão
  if(mode==='live'){ // prévia tocando: régua de 16 passos andando no tempo
    const st=Math.floor(t*sp.bpm/60*4)%16,n=16,gw=(w-pad*2)/n,yy=h-Math.max(5,Math.round(h*.05));
    for(let i=0;i<n;i++){x.fillStyle=i===st?(C.pro?C.lab:C.blk===C.bg?C.ink:(C.lay==='outline'?C.lab:C.ink)):'rgba(127,127,127,.35)';x.fillRect(pad+i*gw+1,yy,gw-2,3)}
  }
}
function hexA(c,a){if(c[0]==='#'){const n=parseInt(c.slice(1),16);return 'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+a+')'}return c.replace('hsl(','hsla(').replace(')',','+a+')')}
