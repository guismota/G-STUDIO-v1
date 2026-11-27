// Tabelas do Remix FX usadas pelo motor (para tocar) e pela tela (para mostrar os rótulos). Não mexe no áudio.
const rxDiv=()=>[1,2,4,8]; // semínimas por batida: 1/4, 1/8, 1/16, 1/32
const DUBDIV=[[.5,'1/8'],[.75,'3/16'],[1,'1/4'],[1.5,'3/8'],[2,'1/2']];
// rótulos mostrados na tela (mesmas contas que o motor faz para tocar)
const rxGateLabel=v=>'1/'+(rxDiv()[Math.min(3,Math.floor(v*4))]*4);
const rxPitchLabel=v=>{const st=Math.round((v-.5)*24);return (st>0?'+':'')+st+' st'};
const rxEchoLabel=(x,y)=>{const i=Math.min(DUBDIV.length-1,Math.floor(x*DUBDIV.length)),fb=.3+y*.68;return DUBDIV[i][1]+' · '+Math.round(fb*100)+'%'};
export { DUBDIV, rxDiv, rxEchoLabel, rxGateLabel, rxPitchLabel };
