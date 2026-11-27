// Acid Techno (CH05): tudo o que define o gênero, num lugar só.
//   style   = andamento, tom, nomes das linhas, cenas prontas, sons (snd) e os 4 loops de cada linha (p)
//   home    = card da tela inicial (cor, descrição, imagem)
//   palette = cores do visual animado
//   cover   = capa tipográfica
//   symbol  = símbolo do card (SVG)
import { ARP, B, C, D, FX4, T } from '../app/all.js';
const gAcidtechno={
 style:{name:'Acid Techno',bpm:138,swing:0,key:{root:4,mode:'phrygian'},
  snd:{sub:{type:'sine',drive:2.4},pad:{type:'dark'},arp:{type:'acid',q:1.2,f:1.3},sc:.5,kick:{f0:240,f1:41.2,dec:.45,click:.8,sweep:.1,drive:3},clap:{f:1100,dec:.3,spread:3},snare:{tone:174.6,hp:3000,dec:.2},hat:{metal:true,dec:.05,odec:.3},tom:{mult:1.2,dec:.25,map:{200:196,150:146.83,110:110}},perc:{type:'rim'},
       bass:{type:'303',q:1.35,f:1.4,drive:1},chord:{type:'stab',wave:'square',q:8},lead:{type:'saw'}},
  p:{
   kick:[D('4x4','X...X...X...X...'),D('Gallop','X...X..xX...X..x'),D('Stomp','X.x.X...X.x.X...'),D('Build','X...X...X...X... X...X...X.X.XXXX')],
   clap:[D('2 & 4','....X.......X...'),D('Double','....XX......XX..'),D('Late','.....X.......X..'),D('Roll','....X.......X... ........x.x.XxXX')],
   snare:[D('Backbeat','....x.......x...'),D('Shuffle','....x..o....x.o.'),D('Roll','............oxxX'),D('Hit','...............X')],
   hat:[D('16ths','xoXoxoXoxoXoxoXo'),D('Offbeat','..x...x...x...x.'),D('Drive','x.xxx.xxx.xxx.xx'),D('Tick','.x...x...x...x..')],
   ohat:[D('Offbeat','..x...x...x...x.'),D('Wash','..x...x...x...xx'),D('Sync','...x...x...x...x'),D('Late','..............x.')],
   tom:[T('Run','........hhmmll.l'),T('Gallop','...m...m...m...h'),T('Rumble','.l...l...l...l..'),T('Fill','................ ........HhMmLlLL')],
   perc:[D('Rim','..x..x....x..x..'),D('Machine','.x.x.x.x.x.x.x.x'),D('Poly','x..x..x..x..x..x'),D('Bell','...x...x...x...x',{syn:'cowbell'})],
   bass:[
    B('Squelch',16,[[0,'E1',1,1.3],[1,'E2',1,1,1],[2,'E1',1],[3,'F1',1,1.3],[4,'E1',1],[5,'G2',1,1,1],[6,'E1',1],[7,'E2',1,1.3],[8,'E1',1],[9,'F2',1,1,1],[10,'E1',1],[11,'B1',1,1.3],[12,'E1',1],[13,'C2',1,1,1],[14,'D2',1,1.3],[15,'E2',1,1,1]]),
    B('Hammer',16,[[0,'E1',1,1.3],[1,'E1',1],[3,'E2',1,1.3],[4,'E1',1],[6,'F2',1,1,1],[7,'E1',1],[9,'G1',1,1.3],[10,'E1',1],[12,'E2',1,1.3],[14,'D2',1,1,1],[15,'E1',1]]),
    B('Climb',32,[[0,'E1',2,1.3],[2,'F1',2],[4,'G1',2,1,1],[6,'A1',2],[8,'B1',2,1.3],[10,'C2',2,1,1],[12,'D2',2],[14,'E2',2,1.3],[16,'F2',2,1,1],[18,'E2',2],[20,'D2',2,1.3],[22,'C2',2,1,1],[24,'B1',2],[26,'A1',2,1.3],[28,'G1',2,1,1],[30,'F1',2]]),
    B('Minimal',16,[[0,'E1',1,1.3],[3,'E1',1],[6,'E2',1,1.3,1],[8,'E1',1],[11,'F1',1,1.3],[14,'E2',1,1,1]])],
   chord:[
    C('Stab',16,[[2,'Em7',.5],[10,'Em7',.5]]),
    C('Rave',32,[[0,'Em7',1],[3,'Em7',1],[6,'Fmaj7',1],[16,'Dm7',1],[19,'Dm7',1],[22,'Cmaj7',1],[26,'Fmaj7',1]]),
    C('Hit',16,[[0,'Em',.5],[3,'Em',.5],[6,'F',.5]],{syn:'stab'}),
    C('Offbeat',16,[[2,'Em7',.5],[6,'Em7',.5],[10,'Fmaj7',.5],[14,'Fmaj7',.5]])],
   lead:[
    B('Siren',32,[[0,'E5',8],[16,'F5',8]],{syn:'siren'}),
    B('Zap',16,[[0,'E6',.25],[3,'B5',.25],[6,'E6',.25],[11,'F5',.25],[14,'E6',.25]],{syn:'pluck'}),
    B('Hoover',32,[[0,'E4',4],[4,'F4',4],[8,'E4',8],[16,'G4',4],[20,'F4',4],[24,'E4',8]]),
    B('Rave',16,[[0,'B4',.5],[3,'B4',.5],[6,'C5',.5],[8,'E5',1],[11,'D5',.5],[14,'C5',.5]],{syn:'saw'})],
   sub:[
    B('Offbeat',16,[[2,'E1',1.5],[6,'E1',1.5],[10,'E1',1.5],[14,'E1',1.5]]),
    B('Rumble',16,[[2,'E1',1],[3,'E1',.5],[6,'E1',1],[7,'E1',.5],[10,'E1',1],[11,'E1',.5],[14,'E1',1],[15,'F1',.5]]),
    B('Long',16,[[0,'E1',16]]),
    B('Shift',32,[[2,'E1',1.5],[6,'E1',1.5],[10,'E1',1.5],[14,'E1',1.5],[18,'F1',1.5],[22,'F1',1.5],[26,'F1',1.5],[30,'E1',1.5]])],
   pad:[
    C('Dark',32,[[0,'Em',32]],{syn:'dark'}),
    C('Tension',32,[[0,'Em',16],[16,'F',16]],{syn:'strings'}),
    C('Choir',32,[[0,'Em7',32]],{syn:'choir'}),
    C('Swell',16,[[0,'Em',16]],{syn:'swell'})],
   arp:[
    ARP('Acid',16,[[0,'Em7']],{oct:1,gate:.6}),
    ARP('Hammer',16,[[0,'Em']],{mode:'updown',oct:1,gate:.4,mask:'xx.xx.xx.xx.xx.x'}),
    ARP('Up',32,[[0,'Em7'],[16,'Fmaj7']],{rate:2,oct:1,gate:1},{syn:'square'}),
    ARP('Bleep',16,[[0,'Em7']],{oct:2,gate:.3,mask:'x..x..x..x..x...'},{syn:'bell'})],
   fx:FX4
  }},
 home:{k:'acidtechno',gc:'#5CFF8A',xpos:'50% 26%',c1:'#ff3b3b',c2:'#ffb37a',pos:'center 24%',desc:'Rápido demais pro seu vizinho'},
 palette:['#5CFF8A','#FF3B3B'],
 cover:{lay:'split',bg:'#0c0c0c',blk:'#5CFF8A',ink:'#5CFF8A',lab:'#5CFF8A',w:'ACID',w2:'TECHNO'},
 symbol:'<path d="M8 8H40V40H8Z"/><path d="M11 31Q14.25 24 17.5 31T24 31T30.5 31T37 31"/>'
};
export { gAcidtechno };
