// Gancho de teste para a versão antiga (1.7.8.1), que não tem window.__gs.
// O servidor de teste insere este trecho no fim do bloco principal do index.html, só na resposta enviada
// ao navegador de teste. O arquivo legacy/index.html continua intocado.
// A versão nova vai ter um window.__gs com exatamente esta mesma interface (só em desenvolvimento e teste).
export const HOOK = `
window.__gs={
  version:APPV,
  genres:()=>Object.keys(STYLES),
  genreName:k=>STYLES[k]&&STYLES[k].name,
  state:()=>({screen,style,playing,bpm,bar,step,lanes:cols.map(c=>({key:c.key,type:c.type,name:c.name,active:c.active,queued:c.queued,muted:c.muted,vol:c.vol}))}),
  hasPat:(lane,i)=>{const c=cols.find(x=>x.key===lane);return !!(c&&getPat(c,i))},
  levels:()=>{const o={};cols.forEach(c=>{o[c.key]=c.lv||0});return {master:[VZ.lvL,VZ.lvR],clip:performance.now()<VZ.clipUntil,lanes:o}},
  playSlot:i=>{initAudio();if(playing)stopTransport();sceneOn=-1;const on=[];cols.forEach(c=>{const p=getPat(c,i);c.active=p?i:-1;c.queued=null;if(p)on.push(c.key)});startTransport();return on},
  stop:()=>{if(playing)stopTransport()},
  // Medição de níveis: toca todas as linhas no padrão i durante N compassos, medidos pelo relógio do áudio.
  // Lê o sinal no mesmo ponto dos medidores do app (saída de cada linha e saída final) e converte para a mesma
  // escala do medidor (0 a 1, -48 dB a 0 dB), mas sem pular trechos: o medidor da tela só olha 5 ms por quadro.
  // Também guarda o maior valor que o medidor da tela mostrou (lv) e se a luz de clipagem acendeu.
  // o "piscar" das faixas da tela inicial sorteia um número a cada 5 a 10 s (mesmo na sessão) e desalinha os
  // sorteios dos ruídos; durante a medição ele fica pausado e volta no fim
  measure:(i,bars)=>new Promise(res0=>{initAudio();if(playing)stopTransport();clearTimeout(flickT);const res=v=>{flickLoop();res0(v)};
    const N=8192,taps=[],mk=(key,node)=>{const a=ctx.createAnalyser();a.fftSize=N;node.connect(a);taps.push({key,node,a,buf:new Float32Array(N),pk:0})};
    cols.forEach(c=>{if(c.post)mk(c.key,c.post)});mk('_master',fin);
    sceneOn=-1;const on=[];cols.forEach(c=>{const p=getPat(c,i);c.active=p?i:-1;c.queued=null;if(p)on.push(c.key)});
    startTransport();const end=tT0+bars*4*60/bpm-.06,lv={};let clip=false;
    const poll=()=>{for(const t of taps){t.a.getFloatTimeDomainData(t.buf);let m=t.pk;for(let k=0;k<N;k++){const v=t.buf[k]<0?-t.buf[k]:t.buf[k];if(v>m)m=v}t.pk=m}
      cols.forEach(c=>{lv[c.key]=Math.max(lv[c.key]||0,c.lv||0)});if(performance.now()<VZ.clipUntil)clip=true};
    const iv=setInterval(()=>{if(ctx.currentTime<tT0)return;if(ctx.currentTime>=end){clearInterval(iv);stopTransport();
      const lanes={},raw={};taps.forEach(t=>{try{t.node.disconnect(t.a)}catch(e){}if(t.key!=='_master'){lanes[t.key]=dbv(t.pk);raw[t.key]=t.pk}});
      const ms=taps.find(t=>t.key==='_master');res({on,lanes,raw,lv,master:dbv(ms.pk),masterRaw:ms.pk,clip,seconds:end-tT0});return}poll()},10)}),
  enterGenre:k=>enterGenre(k),
  goHome:()=>goHome(),
  openClipEditor:(lane,i)=>{const ci=cols.findIndex(x=>x.key===lane);openClipEditor(ci,i)},
  // para o teste de dados salvos: mexe no estado como o usuário mexeria
  setBpm:v=>setBpm(v),
  setLane:(lane,o)=>{const c=cols.find(x=>x.key===lane);if(!c)return;if(o.vol!=null)c.vol=o.vol;if(o.muted!=null)c.muted=o.muted;applyGain(c)},
  setUserPat:(lane,idx,pat)=>{if(!userPats[lane])userPats[lane]=[null,null,null,null];userPats[lane][idx]=pat;saveUser();userVer++},
  setScene:(i,o)=>{scenes[i]=o;saveScenes();refreshSlots()},
  setFx:(k,on,p)=>{FX[k].on=on;Object.assign(FX[k].p,p||{});saveFx();refreshFx()},
  novoEnter:()=>enterNovo(),
  novoAddInst:(t,name,g)=>novoAdd({kind:'inst',t,name,g}),
  novoAddLib:id=>{const it=LIBM.items.find(x=>x.id===id);novoAdd({kind:it.kind==='loop'?'loop':'smp',id:it.id,name:it.name,cat:it.cat,bpm:it.bpm,bars:it.bars})},
  enterUgen:id=>enterUgen(id),
  lib:()=>JSON.parse(JSON.stringify(LIBM)),
  idbKeys:()=>idbEntries().then(e=>e.map(x=>[x[0],x[1]&&x[1].byteLength||0]).sort()),
  snapshot:()=>snapshot(),
  projects:()=>JSON.parse(JSON.stringify(PROJ.list)),
  ugen:()=>JSON.parse(JSON.stringify(ugenList())),
  voices:()=>Object.assign({},VBS),
  audioTime:()=>ctx?ctx.currentTime:0
};
`;

export function legacyHook(html) {
  const tail = 'render();\n})();\n</script>';
  const i = html.lastIndexOf(tail);
  if (i < 0) throw new Error('gancho: fim do bloco principal não encontrado');
  return html.slice(0, i) + 'render();\n' + HOOK + '})();\n</script>' + html.slice(i + tail.length);
}
