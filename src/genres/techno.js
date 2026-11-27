// Techno (CH04): tudo o que define o gênero, num lugar só.
//   style   = andamento, tom, nomes das linhas, cenas prontas, sons (snd) e os 4 loops de cada linha (p)
//   home    = card da tela inicial (cor, descrição, imagem)
//   palette = cores do visual animado
//   cover   = capa tipográfica
//   symbol  = símbolo do card (SVG)
import { ARP, B, C, D, FX4, T } from '../app/all.js';
const gTechno={
 style:{name:'Techno',bpm:130,swing:0,key:{root:7,mode:'minor'},
  snd:{sub:{type:'tri',drive:2.2,cut:200},pad:{type:'dark'},arp:{type:'square'},sc:.5,kick:{f0:200,f1:43.65,dec:.5,click:.4,sweep:.1,rumble:1,rumbleDec:.45,drive:2},clap:{f:1200,dec:.3,spread:3},snare:{tone:196,hp:2600,dec:.2},hat:{metal:true,dec:.04,odec:.25},tom:{mult:1,dec:.3,map:{200:196,150:146.83,110:110}},perc:{type:'rim'},
       bass:{type:'pluck',cut:1400},chord:{type:'stab',wave:'sawtooth',q:4},lead:{type:'pluck',wave:'square',q:6,cut:5000}},
  p:{
   kick:[D('Rumble','X...X...X...X...'),D('Drive','X...X...X...X..o'),D('Broken','X...X..X..X.X...'),D('Build','X...X...X...X... X...X...X.X.XXXX')],
   clap:[D('2 & 4','....X.......X...'),D('Off','......x.......x.'),D('Late','....X........x..'),D('Fill','....X.......X... ....X.....x.XxXX')],
   snare:[D('Backbeat','....x.......x...'),D('Ghost','...o.x.....o.x..'),D('Half','........X.......'),D('Roll','................ ........ooxxXXXX')],
   hat:[D('Offbeat','..x...x...x...x.'),D('16ths','xoXoxoXoxoXoxoXo'),D('Gallop','.xx..xx..xx..xx.'),D('Ride','x.x.x.x.x.x.x.x.')],
   ohat:[D('Offbeat','..x...x...x...x.'),D('Long','......x.......x.'),D('Sync','...x.......x....'),D('Rush','..x...x...x...x. ..x...x...x.x.xx')],
   tom:[T('Ritual','l.....m...l...h.'),T('Pulse','..l...l...l...l.'),T('Tribal','m..l...h...m.l..'),T('Fill','................ ........h.h.m.ll')],
   perc:[D('Poly','x..x..x..x..x..x'),D('Rim','...x...x...x...x'),D('Click','.x.x.x.x.x.x.x.x'),D('Sparse','......x......... ..x.......x.....')],
   bass:[
    B('Rolling',16,[[1,'G1',.7],[2,'G1',.7],[3,'G2',.5],[5,'G1',.7],[6,'G1',.7],[7,'G1',.5],[9,'G1',.7],[10,'G1',.7],[11,'Bb1',.5],[13,'G1',.7],[14,'G1',.7],[15,'F1',.5]]),
    B('Offbeat',16,[[2,'G1',1],[6,'G1',1],[10,'G1',1],[14,'G1',1]]),
    B('Dark',32,[[0,'G1',2],[3,'G1',1],[6,'Bb1',1],[8,'G1',2],[11,'F1',1],[14,'G1',1],[16,'G1',2],[19,'D2',1],[22,'C2',1],[24,'Bb1',2],[27,'G1',1],[30,'F1',1]]),
    B('Pulse',16,[[2,'G1',.5],[3,'G2',.5],[6,'G1',.5],[7,'G2',.5],[10,'G1',.5],[11,'G2',.5],[14,'Bb1',.5],[15,'C2',.5]])],
   chord:[
    C('Dub',16,[[3,'Gm7',1],[10,'Gm7',1]]),
    C('Minor',32,[[0,'Gm9',1],[6,'Gm9',1],[16,'Ebmaj7',1],[22,'Ebmaj7',1]]),
    C('Organ',16,[[2,'Gm7',.5],[5,'Gm7',.5],[10,'Gm7',.5],[13,'Gm7',.5]],{syn:'organ'}),
    C('Echo',16,[[2,'Cm7',1],[7,'Cm7',1],[11,'Gm7',1]])],
   lead:[
    B('Stab',16,[[0,'G4',.5],[3,'Bb4',.5],[6,'G4',.5],[10,'D5',.5]]),
    B('Hypno',16,[[0,'G4',.5],[1,'G4',.5],[2,'Bb4',.5],[3,'G4',.5],[4,'C5',.5],[5,'G4',.5],[6,'Bb4',.5],[7,'F4',.5],[8,'G4',.5],[9,'G4',.5],[10,'Bb4',.5],[11,'G4',.5],[12,'D5',.5],[13,'G4',.5],[14,'C5',.5],[15,'Bb4',.5]]),
    B('Bleep',16,[[1,'G5',.25],[7,'D6',.25],[9,'G5',.25],[15,'Bb5',.25]],{syn:'fm'}),
    B('Ping',16,[[0,'D6',.25],[4,'D6',.25],[8,'D6',.25],[12,'F6',.25]],{syn:'fm'})],
   sub:[
    B('Rumble',16,[[2,'G1',1],[3,'G1',.5],[6,'G1',1],[7,'G1',.5],[10,'G1',1],[11,'G1',.5],[14,'G1',1],[15,'G1',.5]]),
    B('Offbeat',16,[[2,'G1',1.5],[6,'G1',1.5],[10,'G1',1.5],[14,'G1',1.5]]),
    B('Drone',32,[[0,'G1',32]]),
    B('Shift',32,[[2,'G1',1.5],[6,'G1',1.5],[10,'G1',1.5],[14,'G1',1.5],[18,'Eb1',1.5],[22,'Eb1',1.5],[26,'F1',1.5],[30,'F1',1.5]])],
   pad:[
    C('Dark',32,[[0,'Gm',32]],{syn:'dark'}),
    C('Atmos',32,[[0,'Gm9',16],[16,'Ebmaj7',16]],{syn:'warm'}),
    C('Strings',32,[[0,'Gm',16],[16,'Eb',16]],{syn:'strings'}),
    C('Choir',32,[[0,'Gm7',32]],{syn:'choir'})],
   arp:[
    ARP('Hypno',16,[[0,'Gm7']],{oct:0,gate:.3}),
    ARP('Seq',16,[[0,'Gm']],{mode:'updown',oct:0,gate:.4,mask:'x.xx.x.xx.x.x.xx'}),
    ARP('Up',32,[[0,'Gm9'],[16,'Ebmaj7']],{rate:2,oct:1,gate:1},{syn:'pluck'}),
    ARP('Bleep',16,[[0,'Gm9']],{oct:2,gate:.3,mask:'x.....x...x.....'},{syn:'bell'})],
   fx:FX4
  }},
 home:{k:'techno',gc:'#6C8BFF',xpos:'50% 40%',c1:'#a35cff',c2:'#ff3b4f',pos:'center 38%',desc:'Escuro, repetitivo e lindo'},
 palette:['#6C8BFF','#C9D3FF'],
 cover:{lay:'outline',bg:'#0c0c0c',blk:'#6C8BFF',ink:'#6C8BFF',lab:'#f2f2ee',w:'TECHNO'},
 symbol:'<path d="M8 8H40V40H8Z"/><g fill="currentColor" stroke="none"><rect x="14" y="14" width="8" height="8"/><rect x="26" y="26" width="8" height="8"/></g><path d="M26 18H34M14 30H22"/>'
};
export { gTechno };
