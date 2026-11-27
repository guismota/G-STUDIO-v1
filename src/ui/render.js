import { LATE } from '../app/late.js';
import { $, ED, STYLES, buildEdGrid, cols, ctx, cur, curBar, drawViz, getPat, hitsOf, lastKey, nbOf, playing, pmN, rlTick, sceneOn, slotEls, style, uiQ, userVer } from '../app/all.js';
let lastMsg='',lastPos='';
function render(){
  if(ctx)while(uiQ.length&&uiQ[0].t<=ctx.currentTime){const q=uiQ.shift();LATE.cur=q.s;LATE.curBar=q.b}
  const key=cur+':'+curBar,stepChanged=key!==lastKey;
  if(stepChanged)LATE.lastKey=key;
  const pos=(playing&&cur>=0)?(curBar<0?'– '+(4-Math.floor(cur/4)):(curBar+1)+'.'+(Math.floor(cur/4)+1)+'.'+(cur%4+1)):'1.1.1';
  if(pos!==lastPos){lastPos=pos;$('#lcdPos').textContent=pos}
  const msg=STYLES[style]?STYLES[style].name:'';
  if(msg!==lastMsg){lastMsg=msg;$('#lcdMsg').textContent=msg}
  slotEls.forEach((b,i)=>{b.classList.toggle('on',playing&&sceneOn===i);b.classList.toggle('held',!playing&&sceneOn===i)});
  cols.forEach(c=>{
    c.padEls.forEach((el,i)=>{
      const a=c.active===i;
      el.classList.toggle('play',a);el.classList.toggle('held',a&&!playing);
      el.classList.toggle('q',c.queued===i||(a&&c.queued===-1));
    });
    const pat=c.active>=0?getPat(c,c.active):null;
    const want=(playing&&pat)?c.active:-1;
    if(c.pgIdx!==want){if(c.pgIdx>=0&&c.padPg[c.pgIdx])c.padPg[c.pgIdx].style.width='0';c.pgIdx=want}
    if(want>=0&&stepChanged&&cur>=0){const L=pat.len||16,p=pmN(curBar,L/16)*16+cur;c.padPg[want].style.width=((p+1)/L*100)+'%'}
    const half=pat?pmN(curBar,nbOf(pat)):0,k2=c.active+':'+style+':'+userVer+':'+half;
    if(c.shown!==k2){c.shown=k2;const h=hitsOf(pat,half);c.cells.forEach((e,i)=>e.classList.toggle('hit',h.has(i)))}
    if(stepChanged)c.cells.forEach((e,i)=>e.classList.toggle('ph',playing&&i===cur));
  });
  if(ED.ci>=0){
    const p=(playing&&ED.prev&&cur>=0&&curBar>=0)?pmN(curBar,ED.len/16)*16+cur:-1;
    if(p>=0&&ED.kind==='drum'&&ED.follow!==false&&$('#edGrid').classList.contains('stepseq')&&Math.floor(p/16)!==ED.page&&$('#clipEd').classList.contains('open')){ED.page=Math.floor(p/16);buildEdGrid()}
    if(p!==ED.lastPos){
      ED.cells.forEach(row=>{if(row[ED.lastPos])row[ED.lastPos].classList.remove('ph');if(p>=0&&row[p])row[p].classList.add('ph')});
      ED.lastPos=p;
    }
  }
  drawViz();rlTick();
  requestAnimationFrame(render);
}

export { render };
