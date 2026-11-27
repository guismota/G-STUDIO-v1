// Cumbia (CH11): tudo o que define o gênero, num lugar só.
//   style   = andamento, tom, nomes das linhas, cenas prontas, sons (snd) e os 4 loops de cada linha (p)
//   home    = card da tela inicial (cor, descrição, imagem)
//   palette = cores do visual animado
//   cover   = capa tipográfica
//   symbol  = símbolo do card (SVG) (este gênero não tem)
// cumbia: tudo sobre a cadência andaluza Am · G · F · E (meio compasso cada, 2 compassos)
import { B, D, FXP, N, T } from '../app/all.js';
const CUMR=[['A1','E2','A2','C2'],['G1','D2','G2','B1'],['F1','C2','F2','A1'],['E1','B1','E2','G#1']]; // raiz, quinta, oitava, terça
const CUMV=[['A3','C4','E4'],['G3','B3','D4'],['F3','A3','C4'],['E3','G#3','B3']];
const CUMG=[['A4','C5','E5'],['G4','B4','D5'],['F4','A4','C5'],['E4','G#4','B4']];
function CUMB(name,tpl,ex){const L=[];CUMR.forEach((r,i)=>tpl.forEach(([s,k,l])=>L.push([i*8+s,r[k],l])));return B(name,32,L,ex)}
function CUMC(name,tpl,ex,len){const d=len||8,data=[];CUMV.forEach((v,i)=>tpl.forEach(([s,l])=>data.push([i*d+s,v.map(N),l,false])));return Object.assign({name,len:d*4,data},ex||{})}
function CUMA(name,seq,gate,ex){const data=[];CUMG.forEach((v,i)=>{const m=v.map(N).concat([N(v[0])+12]);seq.forEach((k,j)=>{if(k!=null)data.push([i*8+j,m[k],gate,1,0])})});return Object.assign({name,len:32,data},ex||{})}
// gênero especial Cumbia: duelo de teclados da cumbia villera (Argentina). Güiro e campana conduzem, timbales e congas,
// baixo elétrico em tumbao, órgão no contratempo e o teclado solo com vibrato e "bend" de rodinha
const gCumbia={
 style:{name:'Cumbia',bpm:100,swing:.08,human:{t:.009,v:.14},big:['lead'],key:{root:9,mode:'minor'},artist:true,theme:'cumbia',names:{snare:'Caixa',hat:'Güiro',ohat:'Sino',tom:'Congas',perc:'Paila',bass:'Baixo',chord:'Keys',arp:'Viola',lead:'Solo'},
  scenes:[{kick:0,hat:0,ohat:0,tom:0,bass:0,chord:0},{kick:0,snare:0,hat:0,ohat:0,tom:0,perc:0,bass:0,chord:0,lead:0},{hat:3,ohat:2,tom:2,pad:0,arp:2,lead:1},
          {kick:1,clap:1,snare:0,hat:1,ohat:1,tom:1,perc:1,bass:1,chord:3,arp:0,lead:2,fx:0}],
  snd:{sub:{type:'sine',cut:180},pad:{type:'strings'},arp:{type:'guitarra'},sc:.06,
       kick:{f0:118,f1:58,dec:.3,click:.25,sweep:.05,knock:.6,lvl:.72},clap:{f:1400,dec:.22,spread:3,smp:'palma',sv:.55},snare:{tone:280,hp:3000,dec:.09,lvl:.5},
       hat:{type:'guiro',dec:.15,odec:.3},tom:{mult:1,dec:.3,smp:1,sv:.8,map:{200:220,150:164.81,110:130.81}},perc:{type:'timbal'},
       bass:{type:'elec',cut:1300,sub:.7},chord:{type:'organ'},lead:{type:'cumbia'}},
  p:{
   kick:[D('Bombo','X.......X.......'),D('Pique','X.....x.X.......'),D('Reto','X...X...X...X...'),D('Dobrado','X..x....X..x....')],
   clap:[D('Contra','..x...x...x...x.'),D('Dembow','...x..x....x..x.'),D('2 e 4','....X.......X...'),D('Virada','....X.......X... ....X...x.X.xxXX')],
   snare:[D('Contra','..x...x...x...x.'),D('Dembow','...X..X....X..X.'),D('Back','....X.......X...'),D('Rufo','................ ........o.o.xoxX')],
   hat:[D('Güiro','X.xxX.xxX.xxX.xx'),D('Villero','X.xoX.xoX.xoX.xo'),D('Chiqui','X.x.X.x.X.x.X.x.'),D('Longo','X...X...X...X...')],
   ohat:[D('Tempo','X...x...X...x...'),D('Corrido','X.x.X.x.X.x.X.x.'),D('Contra','..X...X...X...X.'),D('Síncope','X..xX.x.X..xX.x.')],
   tom:[T('Tumbao','m..mh.l.m..mh.l.'),T('Marcha','..h...hh..h...hh'),T('Aberto','h.m.l.m.h.m.l.m.'),T('Repique','................ hhmmhhmmllmmhhLL')],
   perc:[D('Golpe','..o...o...o.x.X.'),D('Cáscara','o.oo.o.oo.o.oo.o'),D('Toque','x..x..X...x.X...'),D('Repique','................ ....x.x.xxxXxxXX')],
   bass:[CUMB('Tumbao',[[0,0,2.5],[3,0,.8],[4,1,2.5]]),CUMB('Passo',[[0,0,1.6],[2,3,1.6],[4,1,1.6],[6,3,1.6]]),
         CUMB('Oitavas',[[0,0,1.5],[2,2,1],[4,0,1.5],[6,2,1]]),CUMB('Villero',[[0,0,2.6],[3,0,.7],[6,1,1.5]])],
   sub:[CUMB('Raiz',[[0,0,7.5]]),CUMB('Pulso',[[0,0,3],[4,0,3]]),CUMB('Quinta',[[0,0,3.5],[4,1,3.5]]),CUMB('Bumbo',[[0,0,2]])],
   chord:[CUMC('Chucu',[[2,.9],[6,.9]]),CUMC('Sanfona',[[0,1.5],[3,.8],[4,1.5],[6,1.5]],{syn:'aco'}),CUMC('Piano',[[0,1],[3,1],[6,1]],{syn:'piano'}),CUMC('Sinte',[[2,.6],[3,.6],[6,1.2]],{syn:'brass'})],
   pad:[CUMC('Cordas',[[0,8]],{syn:'strings'}),CUMC('Coro',[[0,8]],{syn:'choir'}),CUMC('Quente',[[0,8]],{syn:'warm'}),CUMC('Swell',[[0,8]],{syn:'swell'})],
   arp:[CUMA('Dedilho',[0,1,2,1,3,2,1,2],.9),CUMA('Arpejo',[0,null,2,null,1,null,2,null],1.6),
    B('Flauta',32,[[0,'E5',5.5],[6,'D5',.9],[7,'C5',.9],[8,'D5',5.5],[14,'C5',.9],[15,'B4',.9],[16,'C5',5.5],[22,'B4',.9],[23,'A4',.9],[24,'B4',7.5,1,1]],{syn:'flauta'}),
    CUMA('Pique',[null,null,2,1,null,null,2,1],.8)],
   lead:[ // [passo, nota, duração, dinâmica, ornamento: 1 bend, 2 mordente, 3 caída]
    B('Punteo',32,[[0,'E5',1,1.05,2],[1,'C5',.8,.75],[2,'E5',1,.9],[3,'A5',2.5,1.1,1],[6,'G#5',.8,.7],[7,'A5',.8,.8],[8,'B5',1.5,1],[10,'A5',.8,.75],[11,'G5',2.5,.95,3],
                    [16,'F5',1,1,2],[17,'E5',.8,.7],[18,'C5',1,.85],[19,'A4',2,.9],[22,'C5',.8,.7],[23,'D5',.8,.8],[24,'E5',1,.95],[25,'F5',.8,.75],[26,'E5',.8,.8],[27,'D5',.8,.7],[28,'B4',3.5,1.05,1]]),
    B('Lamento',32,[[0,'A4',.8,.8],[1,'C5',.8,.85],[2,'E5',4.5,1.1,1],[7,'D5',1,.8],[8,'D5',3.5,1.05,2],[12,'B4',1,.8],[13,'C5',1,.85],[14,'D5',1.5,.9],
                    [16,'C5',4.5,1.05,1],[21,'A4',1,.75],[22,'B4',.8,.8],[23,'C5',.8,.85],[24,'B4',2,1,2],[26,'A4',1,.8],[27,'G#4',4.5,1.1,3]]),
    B('Fiesta',32,[[0,'A5',.7,1.1],[2,'A5',.7,.7],[3,'G5',.7,.8],[4,'A5',.7,1],[6,'E5',.7,.75],[7,'C5',1,.9],[8,'D5',.7,1.05],[10,'D5',.7,.7],[11,'C5',.7,.8],[12,'D5',.7,1],[14,'B4',.7,.75],[15,'G4',1,.85],
                    [16,'C5',.7,1.05],[18,'C5',.7,.7],[19,'A4',.7,.8],[20,'C5',.7,1],[22,'F5',1.5,1.05,1],[24,'E5',.7,1],[25,'F5',.7,.75],[26,'E5',.7,.85],[27,'D5',.7,.7],[28,'B4',.7,.9],[29,'C5',.7,.75],[30,'B4',1.6,1,3]]),
    B('Sanfona',32,[[0,'C5',1.5,.9],[2,'B4',.7,.7],[3,'C5',.7,.8],[4,'E5',2.5,1.05],[7,'D5',.8,.75],[8,'D5',1.5,.9],[10,'C5',.7,.7],[11,'B4',.7,.8],[12,'D5',2.5,1],[15,'C5',.8,.7],
                    [16,'C5',1.5,.9],[18,'A4',.7,.7],[19,'C5',.7,.8],[20,'F5',2.5,1.05],[23,'E5',.8,.7],[24,'E5',1,.95],[25,'D5',.7,.75],[26,'C5',.7,.8],[27,'B4',.7,.75],[28,'G#4',1,.9],[29,'A4',.7,.7],[30,'B4',2,.95]],{syn:'acordeon'})],
   fx:[FXP('Sirene','S...............................'),FXP('Riser','R...............................'),FXP('Impact','I...............................'),FXP('Reverse','V...............')]
  }},
 home:{k:'cumbia',artist:true,theme:'cumbia',html:'<em>Cumbia</em>',desc:'Duelo de teclados, güiro raspando e o baile inteiro pulando até o sol nascer.'},
 palette:['#FF4B1F','#F4F2EA'],
 cover:{lay:'teclas',bg:'#FF4B1F',blk:'#F4F2EA',ink:'#111111',lab:'#111111',w:'CUMBIA',pro:true},
 symbol:null
};
export { gCumbia };
