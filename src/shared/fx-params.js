// Tabelas fixas dos efeitos, usadas pelo motor (para tocar) e pela tela (para mostrar). Não mexem no áudio.
const FXDEF={
 rev:{name:'Reverb',tag:'Rev',styles:['Room','Hall','Plate'],big:{k:'mix',l:'Mix'},small:[{k:'decay',l:'Decay'},{k:'tone',l:'Tone'}],def:{mix:.35,decay:.5,tone:.6}},
 dly:{name:'Delay',tag:'Dly',styles:['Eco','Ping-pong','Tape'],big:{k:'mix',l:'Mix'},small:[{k:'fb',l:'Feedback'},{k:'tone',l:'Tone'}],def:{mix:.35,fb:.4,tone:.6}},
 ech:{name:'Echo',tag:'Ech',styles:['Beat','Dub','Space'],big:{k:'mix',l:'Mix'},small:[{k:'beat',l:'Beat'},{k:'fb',l:'Feedback'}],def:{mix:.5,beat:.6,fb:.55}},
 dst:{name:'Distorção',tag:'Dist',styles:['Drive','Fuzz','Crush'],big:{k:'drive',l:'Drive'},small:[{k:'tone',l:'Tone'},{k:'mix',l:'Mix'}],def:{drive:.4,tone:.6,mix:1}},
 flt:{name:'Filter',tag:'Flt',styles:['Low-pass','High-pass','Band-pass'],big:{k:'cut',l:'Cutoff'},small:[{k:'res',l:'Resonance'},{k:'lfo',l:'LFO'}],def:{cut:.6,res:.25,lfo:0}}
};
const FXKEYS=Object.keys(FXDEF);
const REVST=[{t:1,pre:.006,damp:.55},{t:2.6,pre:.022,damp:.35},{t:1.8,pre:.001,damp:.12}];
const DLYST=[{b:.75,lbl:'1/8 pontuado'},{b:.5,pp:true,lbl:'1/8 ping-pong'},{b:1,tape:true,lbl:'1/4 fita'}];
const ECHB=[.125,.25,.5,.75,1,2],ECHL=['1/8','1/4','1/2','3/4','1','2'];
const fmtHz=h=>h<1000?Math.round(h)+' Hz':(h/1000).toFixed(1)+' kHz';
export { DLYST, ECHB, ECHL, FXDEF, FXKEYS, REVST, fmtHz };
