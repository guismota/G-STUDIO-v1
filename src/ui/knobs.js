// ---------- Knobs ----------
function makeKnob(host,{v,label,small,onChange}){
  const sz=small?26:40,c=sz/2,r=sz/2-2.5,A0=-.75*Math.PI,A1=.75*Math.PI;
  host.className='knob'+(small?' sm':'');
  host.innerHTML='<svg viewBox="0 0 '+sz+' '+sz+'"><path class="trk"/><path class="val"/><circle class="cap" cx="'+c+'" cy="'+c+'" r="'+(r-(small?3.5:4.5))+'"/><line class="ptr"/></svg>'+(label?'<span class="lbl">'+label+'</span>':'');
  const trk=host.querySelector('.trk'),val=host.querySelector('.val'),ptr=host.querySelector('.ptr');
  const pt=(a,rad)=>[c+rad*Math.sin(a),c-rad*Math.cos(a)];
  const arc=(a0,a1)=>{const p0=pt(a0,r),p1=pt(a1,r);return 'M'+p0[0].toFixed(2)+' '+p0[1].toFixed(2)+'A'+r+' '+r+' 0 '+(a1-a0>Math.PI?1:0)+' 1 '+p1[0].toFixed(2)+' '+p1[1].toFixed(2)};
  trk.setAttribute('d',arc(A0,A1));
  function draw(){
    const a=A0+(A1-A0)*v;val.setAttribute('d',v>.005?arc(A0,a):'');
    const q0=pt(a,r*.2),q1=pt(a,r-(small?4.5:6));
    ptr.setAttribute('x1',q0[0]);ptr.setAttribute('y1',q0[1]);ptr.setAttribute('x2',q1[0]);ptr.setAttribute('y2',q1[1]);
  }
  draw();
  let drag=false,sy=0,sv=0;
  host.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();drag=true;sy=e.clientY;sv=v;try{host.setPointerCapture(e.pointerId)}catch(_){}});
  host.addEventListener('pointermove',e=>{if(!drag)return;v=Math.max(0,Math.min(1,sv+(sy-e.clientY)/(small?110:150)));draw();onChange(v)});
  const end=()=>{drag=false};
  host.addEventListener('pointerup',end);host.addEventListener('pointercancel',end);
  return {set(nv){v=nv;draw()}};
}

export { makeKnob };
