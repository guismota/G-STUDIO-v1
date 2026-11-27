// House (CH01): tudo o que define o gênero, num lugar só.
//   style   = andamento, tom, nomes das linhas, cenas prontas, sons (snd) e os 4 loops de cada linha (p)
//   home    = card da tela inicial (cor, descrição, imagem)
//   palette = cores do visual animado
//   cover   = capa tipográfica
//   symbol  = símbolo do card (SVG)
import { ARP, B, C, D, FX4, T } from '../app/all.js';
const gHouse={
 style:{name:'House',bpm:124,swing:.1,key:{root:5,mode:'minor'},names:{tom:'Toms 909',perc:'Perc',bass:'Órgão M1',chord:'Stabs',lead:'Vocal'},
  scenes:[{kick:0,hat:0,perc:1,bass:0},{kick:0,clap:0,hat:0,ohat:0,perc:1,bass:0,chord:0,lead:0},{pad:0,chord:1,lead:2,fx:0},
          {kick:0,clap:1,snare:0,hat:0,ohat:0,perc:0,bass:1,chord:0,pad:0,lead:0,fx:1}],
  snd:{sub:{type:'sine',drive:1.3},pad:{type:'strings'},arp:{type:'pluck'},sc:.5,
       kick:{type:'909',f0:230,f1:50,dec:.42,sweep:.08,click:.55,drive:1.35,lvl:.9},clap:{f:1500,dec:.25,spread:3,smp:'clap909'},snare:{tone:185,hp:1500,dec:.2},
       hat:{type:'909',dec:.05,odec:.34,tune:1.55},tom:{mult:1,dec:.34,lvl:.5,map:{200:174.61,150:130.81,110:103.83}},perc:{type:'ride909'},
       bass:{type:'organ',cut:2600},chord:{type:'m1'},lead:{type:'vchop'}},
  p:{
   kick:[D('4x4','X...X...X...X...'),D('Ghost','X...X...X..oX...'),D('Jack','X...X.o.X...X.o.'),D('Break','X.......X.......')],
   clap:[D('2 & 4','....X.......X...'),D('Chicago','....X.......X..o'),D('Layer','....X.......X... ....X.......X.o.'),D('Fill','....X.......X... ....X...o.X.XoXX')],
   snare:[D('909','....x.......x...'),D('Ghosts','..o.x..o..o.x...'),D('Roll','................ ........o.o.xoxX'),D('Half','........X.......')],
   hat:[D('Shuffle','xoxoxoxoxoxoxoxo'),D('Offbeat','..x...x...x...x.'),D('Jack','x.xox.xox.xox.xo'),D('16ths','xoXoxoXoxoXoxoXo')],
   ohat:[D('Offbeat','..X...X...X...X.'),D('Push','..x...x...x..xx.'),D('Late','......x.......x.'),D('Sync','...x.......x....')],
   tom:[T('Groove','......m...l.....'),T('Tribal','..h..m.h..h..m..'),T('Low','m.....l.m.....l.'),T('Fill','................ ........h.hmm.ll')],
   perc:[D('Ride','X...x...X...x...',{syn:'ride909'}),D('Shaker','oxoxoxoxoxoxoxox',{syn:'shaker'}),D('Tamb','..x...x...x...x.',{syn:'rattle'}),D('Rim','..x..x....x..x.x',{syn:'rim909'})],
   bass:[
    B('M1 Riff',16,[[0,'F2',.75],[3,'F2',.5],[6,'F3',.5],[8,'F2',.5],[10,'Eb3',.5],[11,'F2',.25],[14,'Ab2',.5]]),
    B('M1 Riff 2',32,[[0,'F2',.75],[3,'F2',.5],[6,'F3',.5],[8,'F2',.5],[10,'Eb3',.5],[11,'F2',.25],[14,'Ab2',.5],[16,'Db2',.75],[19,'Db2',.5],[22,'Db3',.5],[24,'Eb2',.5],[26,'Eb3',.5],[27,'Eb2',.25],[30,'C3',.5]]),
    B('Rolling',16,[[1,'F1',.6],[2,'F1',.6],[3,'F2',.5],[5,'F1',.6],[6,'F1',.6],[7,'F2',.5],[9,'F1',.6],[10,'F1',.6],[11,'Ab1',.5],[13,'F1',.6],[14,'Eb2',.5],[15,'F2',.5]],{syn:'saw'}),
    B('101',16,[[0,'F1',.5],[2,'F2',.5],[3,'F1',.5],[6,'C2',.5],[8,'F1',.5],[10,'Eb2',.5],[11,'F1',.5],[14,'Ab1',.5]],{syn:'pluck'})],
   chord:[
    C('M1 Stab',16,[[2,'Fm7',.4],[6,'Fm7',.4],[10,'Fm7',.4],[13,'Fm7',.3],[14,'Fm7',.4]]),
    C('Piano',32,[[0,'Fm9',1],[3,'Fm9',1],[6,'Fm9',2],[10,'Fm9',1],[16,'Dbmaj9',1],[19,'Dbmaj9',1],[22,'Dbmaj9',2],[26,'Ebadd9',1],[28,'Ebadd9',2]],{syn:'piano'}),
    C('Dub',16,[[2,'Fm9',.5],[10,'Fm9',.5]],{syn:'dub'}),
    C('Rhodes',32,[[0,'Fm9',4],[4,'Bbm9',4],[8,'Eb9',4],[12,'Abmaj9',4],[16,'Dbmaj9',8],[24,'C7sus4',8]],{syn:'keys'})],
   lead:[
    B('Diva',32,[[0,'C5',.5],[3,'Eb5',.5],[6,'F5',.5],[16,'Ab5',.5],[19,'G5',.5],[22,'F5',.5],[27,'Eb5',.5]]),
    B('Hook',32,[[0,'C5',1],[2,'Eb5',1],[4,'F5',2],[7,'Eb5',1],[10,'C5',1],[12,'Ab4',2],[16,'C5',1],[18,'Eb5',1],[20,'F5',2],[24,'G5',1],[26,'F5',1],[28,'Eb5',2]],{syn:'pluck'}),
    B('Bell',16,[[3,'C6',1],[11,'Ab5',1]],{syn:'fm'}),
    B("Let's go",32,[[0,'F4',2]],{syn:'go'})],
   sub:[
    B('Offbeat',32,[[2,'F1',1.5],[6,'F1',1.5],[10,'F1',1.5],[14,'F1',1.5],[18,'Db1',1.5],[22,'Db1',1.5],[26,'Eb1',1.5],[30,'Eb1',1.5]]),
    B('Long',32,[[0,'F1',14],[16,'Db1',7],[24,'Eb1',7]]),
    B('Pulse',16,[[2,'F1',1],[3,'F1',.5],[6,'F1',1],[7,'F1',.5],[10,'F1',1],[11,'F1',.5],[14,'Ab1',1],[15,'F1',.5]]),
    B('Follow',32,[[0,'F1',3],[6,'F1',2],[10,'Ab1',2],[16,'Db1',3],[22,'Db1',2],[26,'Eb1',4]])],
   pad:[
    C('Strings',32,[[0,'Fm9',16],[16,'Dbmaj9',8],[24,'Ebadd9',8]],{syn:'strings'}),
    C('Warm',32,[[0,'Fm9',32]],{syn:'warm'}),
    C('Choir',32,[[0,'Fm7',16],[16,'Dbmaj7',16]],{syn:'choir'}),
    C('Swell',16,[[0,'Fm9',16]],{syn:'swell'})],
   arp:[
    ARP('Up',32,[[0,'Fm9'],[16,'Dbmaj9'],[24,'Ebadd9']],{rate:2,oct:1,gate:1.2}),
    ARP('Bounce',16,[[0,'Fm7']],{mode:'updown',oct:1,gate:.5,mask:'x.xx.xx.x.xx.xx.'}),
    ARP('Offbeat',32,[[0,'Fm9'],[16,'Dbmaj9']],{oct:1,gate:1,mask:'..x...x...x...x.'}),
    ARP('Sparkle',32,[[0,'Fm9'],[16,'Dbmaj9']],{oct:2,gate:.6,mask:'x..x..x..x..x.x.'},{syn:'bell'})],
   fx:FX4
  }},
 home:{k:'house',gc:'#FFA63D',xpos:'50% 45%',c1:'#3d7bff',c2:'#ff4fd8',pos:'center 70%',fx:'saturate(1.25) contrast(1.1)',tint:.35,desc:'Groove clássico pra mexer o ombro'},
 palette:['#FFE600','#FFA63D'],
 cover:{lay:'band',bg:'#0c0c0c',blk:'#FFE600',ink:'#f2f2ee',lab:'#000',w:'HOUSE'},
 symbol:'<path d="M8 22L24 8L40 22V40H8Z"/><circle cx="24" cy="30" r="6"/><rect x="22.5" y="28.5" width="3" height="3" fill="currentColor" stroke="none"/>'
};
export { gHouse };
