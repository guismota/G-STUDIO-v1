function buildHome(){
  const box=$('#cards');box.innerHTML='';HART.list=[];if(HART.io){HART.io.disconnect();HART.io=null}
  const ug=ugenList();let last=null;try{last=localStorage.getItem(LASTK)}catch(e){}
  // topo: título + Criar novo sempre à vista
  const top=document.createElement('div');top.className='hxtop';
  top.innerHTML='<h1 aria-label="what’s poppin’?"><span class="w1">what’s</span><span class="w2"><mark>poppin’</mark><span class="q">?</span></span></h1>';
  box.appendChild(top);
  $('#hxNew').onclick=e=>tuneInX(e.currentTarget,enterNovo);
  // destaque: o último canal usado (ou House na primeira vez)
  let hg=null,hu=null;
  if(last&&last.startsWith('ug:'))hu=ug.find(g=>g.id===last.slice(3))||null;
  if(!hu)hg=GENRES.find(g=>g.k===last)||GENRES[0];
  const hero=document.createElement('div');hero.className='hero';hero.id='hero';hero.setAttribute('role','button');hero.tabIndex=0;
  let enterHero,pk,hname,hdesc,hbpm,gc,chip=last?'Tocado por último':'Comece por aqui',hi;
  if(hu){hi=GENRES.length+ug.indexOf(hu);pk=hu.id;hname=hEsc(hu.name);hdesc=hu.desc||('Criado por você · '+(hu.lanes||[]).length+((hu.lanes||[]).length===1?' som':' sons'));hbpm=(hu.nv&&hu.nv.bpm)||124;gc='#2F5BEA';enterHero=el=>hEnterUg(el,hu,hi);hero.classList.add('ug')}
  else{const S=STYLES[hg.k];hi=GENRES.indexOf(hg);pk=hg.k;hname=hNameHTML(hg,S);hdesc=hg.desc;hbpm=S.bpm;gc=hg.artist?(HPAL[hg.k]||['#FFE600'])[0]:'#FFE600';enterHero=el=>tuneIn(el,hg.k);if(hg.artist)hero.classList.add('art');if(hg.theme)hero.classList.add('t-'+hg.theme)}
  hero.style.setProperty('--gc',gc);
  hero.innerHTML='<canvas aria-hidden="true"></canvas><div class="hin"><span class="hchip"><i></i></span><div class="hnrow"><span class="hname"></span></div><span class="hbpm"></span>'+
    '<div class="hact"><span class="hdesc"></span><button class="hprev" aria-label="Ouvir prévia">'+ICO_SPK+'</button><button class="hgo" aria-label="Entrar"><svg viewBox="0 0 16 16"><path d="M2.5 8h10M8.5 3.5L13 8l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="2"/></svg></button></div></div>';
  hero.querySelector('.hchip').append(chip+' · '+CHN(hi));if(hg&&hg.trend)hero.querySelector('.hchip').insertAdjacentHTML('afterend','<span class="ttag hero-tag">Trending</span>');hero.querySelector('.hname').innerHTML=hname;hero.querySelector('.hdesc').textContent=hdesc;hero.querySelector('.hbpm').innerHTML=hbpm+' <small>BPM</small>';
  hero.setAttribute('aria-label',(hu?hu.name:STYLES[hg.k].name)+', '+chip);
  hero.onclick=()=>enterHero(hero);hero.onkeydown=e=>{if(e.target===hero&&(e.key==='Enter'||e.key===' ')){e.preventDefault();enterHero(hero)}};
  hero.querySelector('.hgo').onclick=e=>{e.stopPropagation();enterHero(hero)};
  if(hu)hero.querySelector('.hprev').remove();else hero.querySelector('.hprev').onclick=e=>{e.stopPropagation();togglePreview(hero,pk)};
  box.appendChild(hero);{const sep=document.createElement('div');sep.className='hsep';sep.setAttribute('aria-hidden','true');sep.innerHTML='<i></i><b></b><i></i>';box.appendChild(sep)}hartReg(hero.querySelector('canvas'),hu?artSpec(null,hu):artSpec(hg.k),true);
  // fileiras
  let d=120;
  const mk=(title,list)=>{if(!list.length)return null;const r=hRow(title,list.length);const sc=r.querySelector('.hscroll');box.appendChild(r);list.forEach(o=>{const t=hTile(Object.assign({d:d+=55},o));sc.appendChild(t);o.after&&o.after(t)});return r};
  const gTile=(g)=>{const S=STYLES[g.k],i=GENRES.indexOf(g),c=g.artist?(HPAL[g.k]||['#FFE600'])[0]:'#FFE600';
    return {trend:!!g.trend,lock:!!g.artist,cls:(g.artist?'art':'')+(g.theme?' t-'+g.theme:'')+(g.k===(hg&&hg.k)?' cur':''),gc:c,ch:CHN(i),name:hNameHTML(g,S),art:!!g.artist,sub:S.bpm+' BPM',label:S.name,pk:g.k,enter:el=>tuneIn(el,g.k),after:t=>hartReg(t.querySelector('canvas'),artSpec(g.k),false)}};
  // ordem de uso: o último tocado vem primeiro dentro de cada fileira; o resto fica na ordem original
  const HL=histList(),byUse=(arr,key)=>arr.map((x,n)=>({x,n,h:HL.indexOf(key(x))})).sort((a,b)=>(a.h<0?1e3+a.n:a.h)-(b.h<0?1e3+b.n:b.h)).map(o=>o.x);
  mk('Clássicos',byUse(GENRES.filter(g=>!g.artist),g=>g.k).map(gTile));
  mk('PRO',byUse(GENRES.filter(g=>g.artist),g=>g.k).map(gTile));
  const ut=byUse(ug,g=>'ug:'+g.id).map(g=>{const j=ug.indexOf(g),i=GENRES.length+j;return {cls:'ug'+(hu===g?' cur':''),noprev:true,gc:'#2F5BEA',ch:CHN(i),name:hEsc(g.name),sub:((g.nv&&g.nv.bpm)||124)+' BPM',label:g.name,pk:g.id,enter:el=>hEnterUg(el,g,i),after:t=>hartReg(t.querySelector('canvas'),artSpec(null,g),false)}});
  const r=mk('Seu espaço',ut.concat([{cls:'add',gc:'#EDEDED',ch:'Novo',name:'Criar novo',sub:'',label:'Criar novo',pk:'',enter:el=>tuneInX(el,enterNovo),after:t=>{t.querySelector('canvas').remove();t.querySelector('.tv').remove();t.querySelector('.tprev').remove();t.insertAdjacentHTML('afterbegin','<span class="tplus" aria-hidden="true">+</span>')}}]));
  if(r&&!ug.length)r.querySelector('.hrh span').textContent='';
  hartStart();
  requestAnimationFrame(()=>box.querySelectorAll('.hrow').forEach(r=>r._upd&&r._upd()));
}
const reduceMotion=()=>!CFG.anim||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
let flickT=0;
function flickLoop(){clearTimeout(flickT);flickT=setTimeout(()=>{
  if(!document.body.classList.contains('in-session')&&!reduceMotion()){
    const bs=[...document.querySelectorAll('.band:not(.soon):not(.tune)')];const b=bs[Math.floor(Math.random()*bs.length)];
    if(b){b.classList.add('flick');setTimeout(()=>b.classList.remove('flick'),520)}}
  flickLoop()},5000+Math.random()*5000)}
flickLoop();
function brandRestart(){document.querySelectorAll('#home .fbrand .bk1,#home .fbrand .bk2').forEach(e=>{if(e.getAnimations)e.getAnimations().forEach(x=>{try{x.currentTime=0}catch(_){}})})}
function powerOnHome(){brandRestart();const h=$('#home');h.classList.remove('tvon');void h.offsetWidth;h.classList.add('tvon');setTimeout(()=>{if(typeof maybeTour==='function')maybeTour('home')},900)}
function staticBurst(){
  if(!ctx||!noiseBuf)return;const t=ctx.currentTime,n=noise(t,.4),f=ctx.createBiquadFilter(),g=ctx.createGain();
  f.type='bandpass';f.frequency.value=3200;f.Q.value=.6;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.09,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.38);
  n.connect(f);f.connect(g);g.connect(fin);
}
