// ---------- Dados musicais ----------
const all16=[...Array(16).keys()];
const Am7=[57,60,64,67],Fmaj7=[53,57,60,64],Dm7=[50,53,57,60],Am9=[57,60,64,67,71];
const Am=[57,60,64],Dm=[50,53,57],Dm9=[50,53,57,60,64],Fmaj9=[53,57,60,64,67],Em7=[52,55,59,62];
const seq=(a,len)=>a.map((m,i)=>[i,m,len]);

// ---------- Ajudantes para escrever os gêneros ----------
const PCN={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
function N(s){const m=/^([A-G](?:#|b)?)(-?\d)$/.exec(s);if(!m)throw new Error('nota '+s);return (+m[2]+1)*12+PCN[m[1]]}
const QUAL={'':[0,4,7],m:[0,3,7],'7':[0,4,7,10],m7:[0,3,7,10],maj7:[0,4,7,11],m9:[0,3,7,10,14],maj9:[0,4,7,11,14],'9':[0,4,7,10,14],m11:[0,3,7,10,14,17],sus2:[0,2,7],sus4:[0,5,7],'7sus4':[0,5,7,10],m6:[0,3,7,9],add9:[0,4,7,14],madd9:[0,3,7,14],m7b5:[0,3,6,10]};
function CH(name){const m=/^([A-G](?:#|b)?)(.*)$/.exec(name),iv=QUAL[m[2]];if(!m||!iv)throw new Error('acorde '+name);const pc=PCN[m[1]];let base=48+pc;if(pc>=8)base-=12;return iv.map(i=>base+i)}
// bateria em texto: X acento, x normal, o fantasma; espaços só organizam
function D(name,str,ex){const s=str.replace(/\s/g,''),data=[];for(let i=0;i<s.length;i++){const ch=s[i];if(ch==='X')data.push([i,1.2]);else if(ch==='x')data.push(i);else if(ch==='o')data.push([i,.5])}return Object.assign({name,data,len:s.length},ex||{})}
// toms em texto: h agudo, m médio, l grave (maiúscula = acento)
function T(name,str,ex){const s=str.replace(/\s/g,''),F={h:200,m:150,l:110},data=[];for(let i=0;i<s.length;i++){const ch=s[i],f=F[ch.toLowerCase()];if(f)data.push(ch===ch.toUpperCase()?[i,f,1.2]:[i,f])}return Object.assign({name,data,len:s.length},ex||{})}
// notas: [passo, 'nota', duração, força, slide]
function B(name,len,notes,ex){return Object.assign({name,len,data:notes.map(n=>[n[0],N(n[1]),n[2],n[3]||1,n[4]||0])},ex||{})}
// acordes: [passo, 'acorde', duração, pad?]
function C(name,len,list,ex){return Object.assign({name,len,data:list.map(n=>[n[0],CH(n[1]),n[2],!!n[3]])},ex||{})}
const RISER={name:'Riser',data:'sweep',len:16};
// arpejo gerado dos acordes: chords=[[passo,'Acorde'],...], o: {rate, mode up|down|updown, oct, gate, mask}
function ARP(name,len,chords,o,ex){
  o=o||{};const rate=o.rate||1,oct=o.oct==null?1:o.oct,gate=o.gate||rate*.6,data=[];let k=0;
  for(let s=0;s<len;s+=rate){
    if(o.mask&&o.mask.replace(/\s/g,'')[s%o.mask.replace(/\s/g,'').length]!=='x'){k++;continue}
    let cur=chords[0];chords.forEach(c=>{if(c[0]<=s)cur=c});
    const tones=CH(cur[1]).map(m=>m+12*oct),seq=o.mode==='down'?tones.slice().reverse():o.mode==='updown'?tones.concat(tones.slice(1,-1).reverse()):tones;
    data.push([s,seq[k%seq.length],gate,1,0]);k++;
  }
  return Object.assign({name,len,data},ex||{});
}
// efeitos em texto: R riser, D down, I impacto, V reverse
function FXP(name,str){const s=str.replace(/\s/g,''),M={R:1,D:2,I:3,V:4,S:5},data=[];for(let i=0;i<s.length;i++)if(M[s[i]])data.push([i,M[s[i]]]);return {name,data,len:s.length}}
const FX4=[FXP('Riser','R...............................'),FXP('Impact','I...............................'),FXP('Down','D...............'),FXP('Reverse','V...............')];

// cumbia: tudo sobre a cadência andaluza Am · G · F · E (meio compasso cada, 2 compassos)
const CUMR=[['A1','E2','A2','C2'],['G1','D2','G2','B1'],['F1','C2','F2','A1'],['E1','B1','E2','G#1']]; // raiz, quinta, oitava, terça
const CUMV=[['A3','C4','E4'],['G3','B3','D4'],['F3','A3','C4'],['E3','G#3','B3']];
const CUMG=[['A4','C5','E5'],['G4','B4','D5'],['F4','A4','C5'],['E4','G#4','B4']];
function CUMB(name,tpl,ex){const L=[];CUMR.forEach((r,i)=>tpl.forEach(([s,k,l])=>L.push([i*8+s,r[k],l])));return B(name,32,L,ex)}
function CUMC(name,tpl,ex,len){const d=len||8,data=[];CUMV.forEach((v,i)=>tpl.forEach(([s,l])=>data.push([i*d+s,v.map(N),l,false])));return Object.assign({name,len:d*4,data},ex||{})}
function CUMA(name,seq,gate,ex){const data=[];CUMG.forEach((v,i)=>{const m=v.map(N).concat([N(v[0])+12]);seq.forEach((k,j)=>{if(k!=null)data.push([i*8+j,m[k],gate,1,0])})});return Object.assign({name,len:32,data},ex||{})}

