// Afterparty (CH08): tudo o que define o gênero, num lugar só.
//   style   = andamento, tom, nomes das linhas, cenas prontas, sons (snd) e os 4 loops de cada linha (p)
//   home    = card da tela inicial (cor, descrição, imagem)
//   palette = cores do visual animado
//   cover   = capa tipográfica
//   symbol  = símbolo do card (SVG) (este gênero não tem)
import { ARP, B, C, D, FX4, T } from '../app/all.js';
const gSolomun={
 style:{name:'Afterparty',bpm:123,swing:.05,key:{root:6,mode:'minor'},artist:true,names:{snare:'Snap',ohat:'Ride',tom:'Tribal'},
  snd:{sub:{type:'sine',drive:1.2,cut:200},pad:{type:'air'},arp:{type:'pluck',cut:2400},sc:.45,
       kick:{f0:140,f1:46.2,dec:.5,click:.18,sweep:.09,tail:.5,knock:.55},clap:{f:1350,dec:.34,spread:3},snare:{tone:220,hp:2000,dec:.15,alt:'snap'},
       hat:{metal:false,dec:.035,odec:1,hp:8600,ride:true,rsmp:1,smp:'hat_c',sdur:.16,sv:.8},tom:{mult:1,dec:.28,smp:1,map:{200:277.2,150:185,110:138.6}},perc:{type:'shaker'},
       bass:{type:'solo',cut:1150,q:5},chord:{type:'dub'},lead:{type:'metal'}},
  p:{
   kick:[D('4x4','X...x...X...x...'),D('Roll','X...x...X...x.o.'),D('Half','X.......X.......'),D('Build','X...x...X...x... X...x...X.x.x.xX')],
   clap:[D('Late','....X........X..'),D('2 & 4','....X.......X...'),D('Push','....X...o...X...'),D('Fill','....X.......X... ....X...o.X.oXXX')],
   snare:[D('Snap','......x.......x.'),D('Ghost','..o...x...o...x.'),D('Sparse','............x...'),D('Roll','................ ........o.o.xoxX')],
   hat:[D('Groove','o.x.o.xxo.x.o.xo'),D('Offbeat','..x...x...x...x.'),D('16ths','oxoxoxoxoxoxoxox'),D('Shuffle','x.xox.xox.xox.xo')],
   ohat:[D('Ride','x.x.x.x.x.x.x.x.'),D('Off','..x...x...x...x.'),D('Bell','....x.......x...'),D('Wash','x...............')],
   tom:[T('Tribal','..h.m..h..m.h.l.'),T('Conga','h.m.h..m.h.m..l.'),T('Low','m.....l...m...l.'),T('Fill','................ ......h.hmm.mll.')],
   perc:[D('Rattle','...x.......x..x.',{syn:'rattle'}),D('Shaker','oxoxoxoxoxoxoxox'),D('Rim','..x..x....x..x..',{syn:'rim'}),D('Clave','x..x..x...x.x...',{syn:'clave'})],
   bass:[
    B('Rolling',16,[[1,'F#1',.5],[2,'F#1',.5],[3,'F#2',.5],[5,'F#1',.5],[6,'A1',.5],[7,'F#1',.5],[9,'F#1',.5],[10,'F#2',.5],[11,'E2',.5],[13,'F#1',.5],[14,'C#2',.5],[15,'F#1',.5,1.3]]),
    B('Stab',16,[[3,'F#1',.5,1.3],[6,'C#2',.25],[7,'F#1',.5],[11,'E1',.5,1.3],[14,'F#2',.25]]),
    B('Deep',32,[[0,'F#1',3],[3,'F#1',1],[6,'A1',2],[10,'C#2',2],[14,'F#1',1],[16,'D2',3],[19,'D2',1],[22,'E2',2],[26,'C#2',2],[30,'A1',1]]),
    B('Funky',32,[[0,'F#1',1,1.3],[3,'F#2',.5],[4,'F#1',.5],[6,'A1',1],[8,'C#2',.5],[10,'F#1',1],[11,'E2',.5],[14,'C#2',1],[16,'D2',1,1.3],[19,'D3',.5],[20,'D2',.5],[22,'F#2',1],[24,'A1',.5],[26,'D2',1],[27,'E2',.5],[30,'C#2',1]])],
   sub:[
    B('Offbeat',32,[[2,'F#1',1.5],[6,'F#1',1.5],[10,'F#1',1.5],[14,'F#1',1.5],[18,'D1',1.5],[22,'D1',1.5],[26,'D1',1.5],[30,'E1',1.5]]),
    B('Long',32,[[0,'F#1',16],[16,'D1',16]]),
    B('Pulse',16,[[2,'F#1',1],[3,'F#1',.5],[6,'F#1',1],[7,'F#1',.5],[10,'F#1',1],[11,'F#1',.5],[14,'A1',1],[15,'F#1',.5]]),
    B('Follow',32,[[0,'F#1',3],[6,'F#1',2],[10,'A1',2],[16,'D1',3],[22,'D1',2],[26,'E1',4]])],
   chord:[
    C('Dub',32,[[3,'F#m9',1],[19,'Dmaj9',1]]),
    C('Echo',16,[[2,'F#m7',1],[11,'F#m7',1]]),
    C('Stab',32,[[0,'F#m9',.5],[3,'F#m9',.5],[6,'F#m9',1],[16,'Dmaj9',.5],[19,'Dmaj9',.5],[22,'Dmaj9',1]],{syn:'stab'}),
    C('Emotive',32,[[0,'F#m9',8],[8,'Amaj7',8],[16,'Dmaj9',8],[24,'Esus4',8]],{syn:'keys'})],
   pad:[
    C('Air',32,[[0,'F#m11',16],[16,'Dmaj9',16]],{syn:'air'}),
    C('Dream',32,[[0,'F#m11',16],[16,'Dmaj9',16]],{syn:'warm'}),
    C('Dark',32,[[0,'F#m',32]],{syn:'dark'}),
    C('Swell',16,[[0,'F#m9',16]],{syn:'swell'})],
   arp:[
    ARP('Hypno',16,[[0,'F#m']],{oct:0,gate:.35,mask:'x.xx.x.xx.x.x.xx'}),
    ARP('Emotive',32,[[0,'F#m9'],[16,'Dmaj9']],{oct:1,gate:.7}),
    ARP('Rain',32,[[0,'F#m11'],[16,'Dmaj9']],{oct:2,gate:.5,mask:'x...x..x..x...x.'},{syn:'bell'}),
    ARP('Low',16,[[0,'F#m7']],{mode:'updown',oct:0,gate:.5,mask:'x..x..x.x..x..x.'},{syn:'square'})],
   lead:[
    B('Metal',32,[[0,'C#5',.5],[2,'E5',.5],[3,'F#5',1],[6,'C#5',.5],[8,'A4',.5],[10,'B4',1],[14,'C#5',.5],[16,'D5',.5],[18,'F#5',.5],[19,'A5',1],[22,'F#5',.5],[24,'E5',.5],[26,'C#5',1],[30,'B4',.5]]),
    B('Hypno',16,[[0,'F#4',.5],[3,'C#5',.5],[6,'F#4',.5],[10,'E4',.5],[13,'C#5',.5]]),
    B('Ghost',32,[[3,'A5',2],[11,'F#5',2],[19,'E5',2],[27,'C#5',4]],{syn:'fm'}),
    B('Siren',32,[[0,'F#4',14],[16,'E4',14]],{syn:'saw'})],
   fx:FX4
  }},
 home:{k:'solomun',artist:true,desc:'Baixo rolando, riff metálico e Ibiza às 6h'},
 palette:['#B026FF','#E2B8FF'],
 cover:{lay:'sun',bg:'#16062a',blk:'#B026FF',ink:'#E9C8FF',lab:'#E2B8FF',w:'6AM',pro:true},
 symbol:null
};
export { gSolomun };
