// Contas sobre padrões (sem áudio), usadas pelo motor (para tocar) e pela tela (para desenhar os pads).
const pm2=x=>((x%2)+2)%2;
const pmN=(x,n)=>((x%n)+n)%n,nbOf=p=>p?Math.max(1,Math.round((p.len||16)/16)):1; // loops de 1, 2 ou 4 compassos
function hitsOf(pat,half){
  if(!pat)return new Set();
  const d=pat.data,r=new Set(),add=v=>{const i=v-half*16;if(i>=0&&i<16)r.add(i)};
  if(typeof d==='string')add(0);else d.forEach(x=>add(Array.isArray(x)?x[0]:x));
  return r;
}
export { hitsOf, nbOf, pm2, pmN };
