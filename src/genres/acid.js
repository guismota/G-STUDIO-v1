// Acid House (CH03): tudo o que define o gênero, num lugar só.
//   style   = andamento, tom, nomes das linhas, cenas prontas, sons (snd) e os 4 loops de cada linha (p)
//   home    = card da tela inicial (cor, descrição, imagem)
//   palette = cores do visual animado
//   cover   = capa tipográfica
//   symbol  = símbolo do card (SVG)
import { ARP, B, C, D, FX4, T } from '../app/all.js';
const gAcid={
 style:{name:'Acid House',bpm:126,swing:.06,key:{root:9,mode:'minor'},
  names:{bass:'303',arp:'303 B',perc:'Cowbell',tom:'Toms 909'},
  snd:{sub:{type:'sine',drive:1.6},pad:{type:'dark'},arp:{type:'acid',q:1,f:1,sweep:1},sc:.45,kick:{type:'909',f0:225,f1:43.65,dec:.42,sweep:.08,click:.85,drive:2.1},clap:{f:1250,dec:.3,spread:3,smp:'clap909'},snare:{tone:190,hp:1700,dec:.2},hat:{type:'909',dec:.04,odec:.28,tune:1.6},tom:{mult:1,dec:.3,lvl:.5,map:{200:220,150:164.81,110:110}},perc:{type:'cowbell'},
       bass:{type:'303',q:1.1,f:1,sweep:1,drive:1},chord:{type:'stab',wave:'square',q:6},lead:{type:'pluck',wave:'sawtooth',q:10,cut:6000}},
  p:{
   kick:[D('4x4','X...X...X...X...'),D('Skip','X...X...X...X.o.'),D('Half','X.......X...X...'),D('Build','X...X...X...X... X...X...X.X.XXXX')],
   clap:[D('2 & 4','....X.......X...'),D('Layer','....X.......X..x'),D('Late','....X.....x.X...'),D('Roll','....X.......X... ....X...x.x.XxXX')],
   snare:[D('808','....x.......x...'),D('Ghost','..o.x.....o.x...'),D('Roll','................ ..........oox.XX'),D('Hit','...............X')],
   hat:[D('16ths','xoXoxoXoxoXoxoXo'),D('Offbeat','..x...x...x...x.'),D('Swing','x.ox.ox.x.ox.ox.'),D('Tick','x..x..x...x..x..')],
   ohat:[D('Offbeat','..x...x...x...x.'),D('Late','......x.......x.'),D('Sync','...x...x...x...x'),D('Wash','..x.......x.....')],
   tom:[T('Conga','..h..m.h..h..m..'),T('Tribal','l..m..h.l..m.h..'),T('Roll','............hhmm'),T('Fill','................ ........hhmmmmll')],
   perc:[D('Cowbell','..x..x....x..x..'),D('Offbeat','..x...x...x...x.'),D('Ride','x.x.x.x.x.x.x.x.',{syn:'ride909'}),D('Rim','...x...x...x...x',{syn:'rim909'})],
   bass:[
    B('Classic',16,[[0,'A1',1,1.3],[2,'A1',1],[3,'A2',1,1,1],[5,'A1',1],[7,'C2',1,1.3],[8,'A1',1],[10,'A1',1],[11,'C3',1,1.3,1],[13,'G2',1],[15,'E2',1,1,1]]),
    B('Squelch',16,[[0,'A1',1,1.3],[1,'A2',1,1,1],[2,'A1',1],[3,'E2',1],[4,'A1',1,1.3],[5,'G2',1,1,1],[6,'A1',1],[7,'C2',1],[8,'A1',1,1.3],[9,'A2',1,1,1],[10,'A1',1],[11,'D2',1],[12,'A1',1,1.3],[13,'F2',1,1,1],[14,'E2',1],[15,'C2',1]]),
    B('Driving',32,[[0,'A1',2,1.3],[3,'C2',1],[4,'A1',1],[6,'E2',1,1.3],[8,'A1',2],[11,'G2',1,1,1],[12,'A1',1],[14,'G1',1],[16,'F1',2,1.3],[19,'A1',1],[20,'F1',1],[22,'C2',1,1.3],[24,'G1',2],[27,'B1',1,1,1],[28,'D2',1],[30,'E2',1,1.3]]),
    B('Slide',16,[[0,'A1',3,1.3],[3,'C2',3,1,1],[6,'E2',2,1,1],[8,'A1',3,1.3],[11,'G2',3,1,1],[14,'E2',2,1,1]])],
   chord:[
    C('Stab',16,[[4,'Am7',1],[7,'Am7',1],[10,'Am7',1]]),
    C('Rave',32,[[0,'Am7',1],[3,'Am7',1],[6,'Am7',1],[16,'Fmaj7',1],[19,'Fmaj7',1],[22,'G',1],[26,'Em7',1]]),
    C('Piano',32,[[0,'Am7',1],[3,'Am7',1],[6,'Am7',2],[10,'Am7',1],[16,'Fmaj7',1],[19,'Fmaj7',1],[22,'G',2],[26,'Em7',2]],{syn:'piano'}),
    C('Offbeat',16,[[2,'Am7',.5],[6,'Am7',.5],[10,'Dm7',.5],[14,'Dm7',.5]])],
   lead:[
    B('Line',16,[[0,'A4',.8],[1,'C5',.8],[2,'E5',.8],[3,'C5',.8],[4,'G5',.8],[5,'E5',.8],[6,'C5',.8],[7,'A4',.8],[8,'A4',.8],[9,'C5',.8],[10,'E5',.8],[11,'G5',.8],[12,'A5',.8],[13,'G5',.8],[14,'E5',.8],[15,'C5',.8]]),
    B('Zap',16,[[0,'A5',.5],[2,'A6',.5],[3,'A5',.5],[8,'C6',.5],[11,'E6',.5],[14,'A6',.5]]),
    B('Hoover',32,[[0,'A4',6],[8,'C5',6],[16,'G4',6],[24,'E4',6]],{syn:'saw'}),
    B('Rave',16,[[0,'E5',.5],[3,'E5',.5],[6,'G5',.5],[8,'A5',1],[11,'G5',.5],[14,'E5',.5]],{syn:'saw'})],
   sub:[
    B('Offbeat',16,[[2,'A1',1.5],[6,'A1',1.5],[10,'A1',1.5],[14,'A1',1.5]]),
    B('Long',16,[[0,'A1',16]]),
    B('Prog',32,[[0,'A1',8],[8,'A1',8],[16,'F1',8],[24,'G1',4],[28,'E1',4]]),
    B('Pulse',16,[[2,'A1',1],[3,'A1',.5],[6,'A1',1],[7,'A1',.5],[10,'A1',1],[11,'C2',.5],[14,'A1',1],[15,'G1',.5]])],
   pad:[
    C('Drone',32,[[0,'Am9',32]],{syn:'dark'}),
    C('Strings',32,[[0,'Am7',16],[16,'Fmaj7',8],[24,'G',8]],{syn:'strings'}),
    C('Choir',32,[[0,'Am7',16],[16,'Fmaj7',16]],{syn:'choir'}),
    C('Swell',16,[[0,'Am9',16]],{syn:'swell'})],
   arp:[
    ARP('Acid',16,[[0,'Am7']],{oct:1,gate:.6}),
    ARP('Up',32,[[0,'Am7'],[16,'Fmaj7'],[24,'G']],{rate:2,oct:1,gate:1.2},{syn:'pluck'}),
    ARP('Bleep',16,[[0,'Am9']],{oct:2,gate:.4,mask:'x..x..x...x..x..'},{syn:'bell'}),
    ARP('Bounce',16,[[0,'Am7']],{mode:'updown',oct:1,gate:.5,mask:'x.xx.xx.x.xx.xx.'},{syn:'square'})],
   fx:FX4
  }},
 home:{k:'acid',gc:'#C8FF3D',xpos:'50% 30%',c1:'#8dff3d',c2:'#d05cff',pos:'center 28%',desc:'303 gritando desde 1987'},
 palette:['#C8FF3D','#FFE600'],
 cover:{lay:'side',bg:'#C8FF3D',blk:'#0c0c0c',ink:'#0c0c0c',lab:'#0c0c0c',w:'ACID'},
 symbol:'<path d="M8 22L24 8L40 22V40H8Z"/><path d="M11 31Q14.25 24 17.5 31T24 31T30.5 31T37 31"/>'
};
export { gAcid };
