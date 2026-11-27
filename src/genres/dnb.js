// Drum & Bass (CH07): tudo o que define o gênero, num lugar só.
//   style   = andamento, tom, nomes das linhas, cenas prontas, sons (snd) e os 4 loops de cada linha (p)
//   home    = card da tela inicial (cor, descrição, imagem)
//   palette = cores do visual animado
//   cover   = capa tipográfica
//   symbol  = símbolo do card (SVG) (este gênero não tem)
// drum and bass: 174, rollers escuros e quebrada suja; o grave fundo mora no Sub e o reese fica só no meio
import { ARP, B, C, D, FX4, T } from '../app/all.js';
const gDnb={
 style:{name:'Drum & Bass',bpm:174,swing:.03,key:{root:4,mode:'minor'},names:{clap:'Break',ohat:'Ride',tom:'Bleeps',perc:'Rim',chord:'Dub',pad:'Atmos',arp:'Pluck',lead:'Vox'},
  scenes:[{kick:0,clap:0,hat:0,sub:0,pad:0},
          {kick:0,clap:0,snare:0,hat:1,ohat:0,perc:0,bass:0,sub:0,pad:0,chord:0},
          {pad:1,chord:2,arp:0,lead:0,tom:1,fx:0},
          {kick:1,clap:1,snare:1,hat:2,ohat:1,tom:0,perc:1,bass:1,sub:3,chord:0,pad:0,lead:2,fx:1}],
  snd:{sub:{type:'sine',cut:150,lvl:.68},pad:{type:'dark'},arp:{type:'pluck',cut:2400},sc:.55,
       kick:{f0:185,f1:49,dec:.3,click:.45,sweep:.045,drive:1.4,lvl:.85},clap:{f:1700,dec:.18,spread:2,alt:'break'},snare:{tone:190,hp:1400,dec:.2},
       hat:{metal:false,dec:.02,odec:.6,hp:9800,ride:true,rsmp:1},tom:{mult:1,dec:.12,alt:'bleep',map:{200:246.94,150:196,110:164.81}},perc:{type:'shaker'},
       bass:{type:'reese',cut:780,drive:1.8},chord:{type:'dub'},lead:{type:'vox'}},
  p:{
   kick:[D('Two-step','X.........X.....'),D('Roller','X.........X..x..'),D('Steppa','X.......x.X.....'),D('Build','X.........X..... X...x...X.x.xXxX')],
   clap:[D('Think','o.o.X..o.o.oX.o.'),D('Amen','x.x.X.ox.oxoX.o. x.x.X.ox.ox.X..x'),D('Chop','....X..x.x..X.oo ..x.X..x..x.Xxox'),D('Fill','o.o.X..o.o.oX.o. X.XoX.oxXoxoXXXX')],
   snare:[D('Back','....X.......X...'),D('Ghost','....X..o.o..X..o'),D('Half','........X.......'),D('Roll','................ x.x.x.x.xxxxXXXX')],
   hat:[D('Tick','x...x...x...x...'),D('8ths','x.x.x.x.x.x.x.x.'),D('Shuffle','x.ox.ox.x.ox.oxo'),D('Roll','x.xxx.x.x.xxx.xx')],
   ohat:[D('Ride','x...x...x...x...'),D('Bell','x.x.x.x.x.x.x.x.'),D('Off','..x...x...x...x.'),D('Wash','x...............')],
   tom:[T('Morse','..h.......h..m..'),T('Scan','h.m.l........... h.m.l.......m...'),T('Pulse','....l.......l.l.'),T('Glitch','................ hmhm..l.hhmml.l.')],
   perc:[D('Rim','..x..x....x..x..',{syn:'rim'}),D('Shaker','.o.o.o.x.o.o.o.x'),D('Rattle','.....x.......x..',{syn:'rattle'}),D('Clave','x..x..x...x.x...',{syn:'clave'})],
   bass:[
    B('Roller',32,[[0,'E2',6],[6,'G2',2],[8,'E2',4],[12,'D2',4],[16,'C2',6],[22,'D2',2],[24,'B1',8]]),
    B('Growl',16,[[0,'E2',3],[4,'E2',1],[6,'G2',2],[10,'E2',2],[13,'D2',3]],{syn:'growl'}),
    B('Dub',32,[[0,'E2',14],[16,'C2',8],[24,'D2',8]]),
    B('Garage',16,[[0,'E2',1],[3,'E2',.5],[6,'E2',1],[10,'D2',.5],[11,'E2',1],[14,'G2',.5]],{syn:'wobble2'})],
   sub:[
    B('Long',32,[[0,'E1',16],[16,'C2',8],[24,'B1',8]]),
    B('Roots',32,[[0,'E1',6],[8,'E1',4],[12,'D1',4],[16,'C2',6],[24,'B1',8]]),
    B('Pulse',16,[[0,'E1',2],[10,'E1',2]]),
    B('Drop',32,[[0,'E1',2],[10,'E1',2],[16,'E1',2],[26,'G1',2],[30,'D1',2]])],
   chord:[
    C('Dub',32,[[0,'Em9',1],[16,'Cmaj7',1]],{syn:'dub'}),
    C('Stab',16,[[0,'Em7',.5],[10,'Em7',.5]],{syn:'stab'}),
    C('Keys',32,[[0,'Em9',8],[8,'Cmaj7',8],[16,'Am9',8],[24,'Bm7',8]],{syn:'keys'}),
    C('Organ',16,[[0,'Em7',.5],[3,'Em7',.5],[6,'Em7',.5],[10,'Am7',.5],[11,'Am7',.5],[14,'Em7',.5]],{syn:'organ'})],
   pad:[
    C('Vinil',32,[[0,'Em',32]],{syn:'vinyl'}),
    C('Dark',32,[[0,'Em',16],[16,'Cmaj7',16]],{syn:'dark'}),
    C('Atmos',32,[[0,'Em11',16],[16,'Cmaj7',16]],{syn:'air'}),
    C('Swell',16,[[0,'Em9',16]],{syn:'swell'})],
   arp:[
    ARP('Pluck',16,[[0,'Em']],{oct:1,gate:.3,mask:'x..x..x...x..x..'}),
    ARP('Acid',16,[[0,'Em']],{oct:0,gate:.5,mask:'x.xxx.x.x.xx.x.x'},{syn:'acid'}),
    ARP('Bell',32,[[0,'Em9'],[16,'Cmaj7']],{oct:2,gate:.4,mask:'x...x.x...x...x.'},{syn:'bell'}),
    ARP('Rave',16,[[0,'Em7']],{oct:1,gate:.25,mask:'xx.xx.x.xx.xx.x.'},{syn:'square'})],
   lead:[
    B('Vox',16,[[0,'B4',.25],[2,'B4',.25],[3,'D5',.5],[6,'E5',.25],[8,'B4',.5],[11,'G4',.25],[14,'A4',.5]]),
    B('Sino',32,[[0,'B5',1],[3,'E5',1],[6,'G5',2],[16,'D6',1],[19,'B5',1],[22,'E5',2]],{syn:'fm'}),
    B('Neuro',16,[[0,'E3',.5],[2,'E3',.25],[3,'G3',.5],[6,'E3',.5],[8,'B2',.5],[11,'D3',.25],[12,'E3',1]],{syn:'metal'}),
    B('Hoover',32,[[0,'E4',6],[6,'G4',2],[8,'F#4',8],[16,'E4',6],[22,'D4',2],[24,'B3',8]],{syn:'saw'})],
   fx:FX4
  }},
 home:{k:'dnb',gc:'#22E1FF',desc:'Quebrada rápida, grave sujo e um pé no garage'},
 palette:['#22E1FF','#EDEDED'],
 cover:{lay:'block',bg:'#0c0c0c',blk:'#22E1FF',ink:'#f2f2ee',lab:'#f2f2ee',w:'D&B',left:true},
 symbol:null
};
export { gDnb };
