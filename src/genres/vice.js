// Ocean Drive (CH10): tudo o que define o gênero, num lugar só.
//   style   = andamento, tom, nomes das linhas, cenas prontas, sons (snd) e os 4 loops de cada linha (p)
//   home    = card da tela inicial (cor, descrição, imagem)
//   palette = cores do visual animado
//   cover   = capa tipográfica
//   symbol  = símbolo do card (SVG) (este gênero não tem)
// gênero especial Ocean Drive: a base do House (909 + órgão M1 + vocal real) puxada para o tech house de clube: swing, latino e piano de rave
import { ARP, B, C, D, FXP, T } from '../app/all.js';
const gVice={
 style:{name:'Ocean Drive',bpm:128,swing:.12,key:{root:7,mode:'minor'},artist:true,theme:'vice',names:{snare:'Rim',tom:'Congas',perc:'Perc',bass:'Órgão M1',chord:'Stabs',arp:'Piano',lead:'Vocal'},
  scenes:[{kick:0,hat:0,perc:1,bass:1},{kick:0,clap:0,snare:0,hat:0,ohat:0,perc:1,tom:0,bass:0,lead:1},{pad:0,chord:1,lead:0,fx:0},
          {kick:0,clap:0,snare:1,hat:0,ohat:0,tom:1,perc:0,bass:0,chord:3,arp:0,lead:1,fx:0}],
  snd:{sub:{type:'sine',drive:1.3},pad:{type:'warm'},arp:{type:'piano'},sc:.5,
       kick:{type:'909',f0:225,f1:49,dec:.4,sweep:.075,click:.5,drive:1.35,lvl:.9},clap:{f:1500,dec:.25,spread:3,smp:'clap909'},snare:{tone:220,hp:2600,dec:.08,alt:'snap'},
       hat:{type:'909',dec:.045,odec:.3,tune:1.6},tom:{mult:1,dec:.3,smp:1,sv:.7,map:{200:196,150:146.83,110:116.54}},perc:{type:'shaker'},
       bass:{type:'organ',cut:2400},chord:{type:'m1'},lead:{type:'vchop'}},
  p:{
   kick:[D('4x4','X...X...X...X...'),D('Ghost','X...X...X..oX...'),D('Skip','X...X...X...X..o'),D('Break','X.......X.......')],
   clap:[D('2 & 4','....X.......X...'),D('Late','....X.......X..o'),D('Layer','....X.......X... ....X.......X.o.'),D('Fill','....X.......X... ....X...o.X.XoXX')],
   snare:[D('Rim','...x..x....x..x.',{syn:'rim909'}),D('Break','....X..o.oX..o.. ....X..o.oX.oXoX'),D('Ghost','..o...x...o...x.'),D('Roll','................ ........o.o.xoxX')],
   hat:[D('Shuffle','xoxoxoxoxoxoxoxo'),D('Groove','.oxo.oxo.oxo.oxo'),D('Offbeat','..x...x...x...x.'),D('16ths','xoXoxoXoxoXoxoXo')],
   ohat:[D('Offbeat','..X...X...X...X.'),D('Push','..x...x...x..xx.'),D('Late','...x...x...x...x'),D('Wash','x...............')],
   tom:[T('Latin','h.hm..h.h.hm..h.'),T('Tumba','..m.m.l...m.h.l.'),T('Fala','m..l..m...l..m..'),T('Fill','................ ......h.hmm.mll.')],
   perc:[D('Shaker','oxoxoxoxoxoxoxox'),D('Ride','X...x...X...x...',{syn:'ride909'}),D('Bongô','..x..x.x..x...x.',{syn:'smp:bongo_hi'}),D('Tamb','..x...x...x...x.',{syn:'rattle'})],
   bass:[
    B('Groove',16,[[0,'G2',.5],[3,'G2',.25],[6,'G3',.25],[7,'G2',.25],[10,'G2',.5],[13,'Bb2',.25],[14,'G2',.25]]),
    B('M1 Riff',16,[[0,'G2',.75],[3,'G2',.5],[6,'G3',.5],[8,'G2',.5],[10,'F3',.5],[11,'G2',.25],[14,'Bb2',.5]]),
    B('101',16,[[0,'G1',.5],[2,'G2',.5],[3,'G1',.5],[6,'D2',.5],[8,'G1',.5],[10,'F2',.5],[11,'G1',.5],[14,'Bb1',.5]],{syn:'pluck'}),
    B('Funk',16,[[0,'G1',.5],[2,'G2',.25],[3,'G1',.25],[6,'Bb1',.5,1,1],[8,'C2',.5],[10,'G1',.25],[11,'F2',.25],[13,'G1',.5],[15,'D2',.25,1,1]],{syn:'solo'})],
   sub:[
    B('Offbeat',32,[[2,'G1',1.5],[6,'G1',1.5],[10,'G1',1.5],[14,'G1',1.5],[18,'Eb1',1.5],[22,'Eb1',1.5],[26,'F1',1.5],[30,'F1',1.5]]),
    B('Long',32,[[0,'G1',14],[16,'Eb1',7],[24,'F1',7]]),
    B('Pulse',16,[[2,'G1',1],[3,'G1',.5],[6,'G1',1],[7,'G1',.5],[10,'G1',1],[11,'G1',.5],[14,'Bb1',1],[15,'G1',.5]]),
    B('Follow',32,[[0,'G1',3],[6,'G1',2],[10,'Bb1',2],[16,'Eb1',3],[22,'Eb1',2],[26,'F1',4]])],
   chord:[
    C('M1 Stab',16,[[2,'Gm7',.4],[6,'Gm7',.4],[10,'Gm7',.4],[13,'Gm7',.3],[14,'Gm7',.4]]),
    C('Rave piano',16,[[0,'Gm9',.5],[3,'Gm9',.5],[6,'Gm9',.5],[10,'Ebmaj9',.5],[13,'F',.5]],{syn:'piano'}),
    C('Rhodes',32,[[0,'Gm9',4],[4,'Cm9',4],[8,'F9',4],[12,'Bbmaj9',4],[16,'Ebmaj9',8],[24,'D7sus4',8]],{syn:'keys'}),
    C('Rave',16,[[0,'Gm',.4],[3,'Gm',.4],[6,'Gm',.4],[10,'Eb',.4],[13,'F',.4]],{syn:'super'})],
   pad:[
    C('Warm',32,[[0,'Gm9',16],[16,'Ebmaj9',16]],{syn:'warm'}),
    C('Strings',32,[[0,'Gm9',16],[16,'Ebmaj9',8],[24,'F',8]],{syn:'strings'}),
    C('Choir',32,[[0,'Gm7',16],[16,'Ebmaj7',16]],{syn:'choir'}),
    C('Swell',16,[[0,'Gm9',16]],{syn:'swell'})],
   arp:[
    ARP('Piano',32,[[0,'Gm9'],[8,'Ebmaj9'],[16,'Bb'],[24,'F']],{oct:1,gate:.45,mask:'x.x..x.x..x..x..'}),
    ARP('Up',32,[[0,'Gm9'],[16,'Ebmaj9']],{rate:2,oct:1,gate:1.2},{syn:'pluck'}),
    ARP('Offbeat',32,[[0,'Gm9'],[16,'Ebmaj9']],{oct:1,gate:1,mask:'..x...x...x...x.'},{syn:'pluck'}),
    ARP('Sparkle',32,[[0,'Gm9'],[16,'Ebmaj9']],{oct:2,gate:.6,mask:'x..x..x..x..x.x.'},{syn:'bell'})],
   lead:[
    B('Chop',16,[[0,'D5',.25],[3,'D5',.25],[6,'F5',.25],[8,'G5',.25],[11,'F5',.25],[14,'D5',.25]]),
    B("Let's go",32,[[0,'G4',2]],{syn:'go'}),
    B('Diva',32,[[0,'D5',.5],[3,'F5',.5],[6,'G5',.5],[16,'Bb5',.5],[19,'A5',.5],[22,'G5',.5],[27,'F5',.5]]),
    B('Hook',32,[[0,'D5',1],[2,'F5',1],[4,'G5',2],[7,'F5',1],[10,'D5',1],[12,'Bb4',2],[16,'D5',1],[18,'F5',1],[20,'G5',2],[24,'A5',1],[26,'G5',1],[28,'F5',2]],{syn:'pluck'})],
   fx:[FXP('Sirene','S...............................'),FXP('Riser','R...............................'),FXP('Impact','I...............................'),FXP('Reverse','V...............')]
  }},
 home:{k:'vice',artist:true,theme:'vice',html:'<span>Ocean</span><em>Drive</em>',trend:true,desc:'Crie a soundtrack para roubar um banco ou dar um rolê de conversível pela orla.'},
 palette:['#FF4FA0','#FF45C8'],
 cover:{lay:'vi',bg:'#2a0a3a',blk:'#FF8A3D',ink:'#FF45C8',lab:'#FFB3E6',w:'VI',pro:true},
 symbol:null
};
export { gVice };
