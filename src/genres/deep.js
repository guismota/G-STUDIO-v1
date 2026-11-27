// Deep House (CH02): tudo o que define o gênero, num lugar só.
//   style   = andamento, tom, nomes das linhas, cenas prontas, sons (snd) e os 4 loops de cada linha (p)
//   home    = card da tela inicial (cor, descrição, imagem)
//   palette = cores do visual animado
//   cover   = capa tipográfica
//   symbol  = símbolo do card (SVG)
import { ARP, B, C, D, FX4, T } from '../app/all.js';
const gDeep={
 style:{name:'Deep House',bpm:120,swing:.2,key:{root:2,mode:'dorian'},
  snd:{sub:{type:'sine'},pad:{type:'warm'},arp:{type:'bell'},sc:.45,kick:{f0:140,f1:43.65,dec:.5,click:.15,sweep:.09,tail:.6,knock:.6},clap:{f:1700,dec:.32,spread:4,smp:'clap909',sv:.85},snare:{tone:220,hp:1500,dec:.22},hat:{metal:false,dec:.035,odec:.22,hp:8000,smp:'hat_c',osmp:'hat_o',sdur:.2},tom:{mult:.9,dec:.4,smp:1,map:{200:196,150:146.83,110:110}},perc:{type:'shaker'},
       bass:{type:'round',cut:700},chord:{type:'keys'},lead:{type:'fm'}},
  p:{
   kick:[D('Deep','X...x...X...x...'),D('Soft','x...o...x...o..o'),D('Skip','X...x..oX...x...'),D('Half','X.......x.....o.')],
   clap:[D('Soft','....x.......x...'),D('Snap','....x.......x..o'),D('Late','.....x.......x..'),D('Fill','....x.......x... ....x.......x.oo')],
   snare:[D('Ghost','..o.x.o...o.x..o'),D('Brush','o.o.x.o.o.o.x.o.'),D('Backbeat','....x.......x...'),D('Roll','................ ....x.......xoox')],
   hat:[D('Swing','x.ox.ox.x.ox.ox.'),D('Shuffle','o.x.o.x.o.x.o.x.'),D('Air','..x...x...x...x.'),D('16ths','oxooxoxooxooxoxo')],
   ohat:[D('Air','..x...x...x...x.'),D('Breath','......x.......x.'),D('Late','..............x.'),D('Sync','...x...x...x...x')],
   tom:[T('Conga','..h.h..m..h.m..m'),T('Bongo','h..h..h.h..h.m..'),T('Talk','..m..h..m...h.l.'),T('Fill','................ ......h.h.m.m.ll')],
   perc:[D('Shaker','oxoxoxoxoxoxoxox'),D('Soft','o.x.o.x.o.x.o.x.'),D('Clave','x..x..x...x.x...',{syn:'clave'}),D('Rim','...x..x....x..x.',{syn:'rim'})],
   bass:[
    B('Deep',32,[[0,'D2',2],[3,'A1',1],[6,'D2',1],[10,'C2',2],[14,'A1',1],[16,'G1',2],[19,'D2',1],[22,'G1',1],[26,'F2',2],[30,'D2',1]]),
    B('Walk',32,[[0,'D2',2],[2,'E2',2],[4,'F2',2],[6,'A2',2],[8,'G2',2],[10,'F2',2],[12,'E2',2],[14,'C2',2],[16,'G1',2],[18,'A1',2],[20,'B1',2],[22,'D2',2],[24,'F2',2],[26,'E2',2],[28,'D2',2],[30,'A1',2]]),
    B('Offbeat',16,[[2,'D2',1.5],[6,'D2',1.5],[10,'C2',1.5],[14,'A1',1.5]]),
    B('Sub',32,[[0,'D2',14],[16,'G1',14]])],
   chord:[
    C('Keys',32,[[0,'Dm9',2],[3,'Dm9',1],[6,'Dm9',2],[10,'Dm9',1],[16,'G9',2],[19,'G9',1],[22,'G9',2],[26,'G9',1]]),
    C('Rhodes',32,[[0,'Dm9',3],[6,'Dm9',2],[11,'Fmaj9',2],[16,'Em7',3],[22,'G9',2],[27,'Am7',2]],{syn:'keys'}),
    C('Progression',32,[[0,'Dm9',4],[4,'Em7',4],[8,'Fmaj9',4],[12,'G9',4],[16,'Am7',8],[24,'G9',8]]),
    C('Stab',16,[[2,'Dm9',.5],[6,'Dm9',.5],[10,'Am7',.5],[14,'Am7',.5]],{syn:'organ'})],
   lead:[
    B('Bells',32,[[0,'A5',1],[3,'F5',1],[6,'D5',2],[10,'E5',1],[16,'B5',1],[19,'G5',1],[22,'D5',2],[26,'F5',1]]),
    B('Pluck',16,[[0,'D5',.5],[2,'F5',.5],[4,'A5',.5],[7,'G5',.5],[10,'F5',.5],[12,'E5',.5]],{syn:'pluck'}),
    B('Vox',32,[[0,'A4',3],[4,'C5',3],[8,'D5',6],[16,'E5',3],[20,'D5',3],[24,'A4',6]],{syn:'whistle'}),
    B('Float',32,[[0,'F5',4],[6,'E5',2],[8,'D5',6],[16,'C5',4],[22,'D5',2],[24,'A4',6]],{syn:'fm'})],
   sub:[
    B('Deep',32,[[0,'D1',6],[8,'D1',4],[16,'G1',6],[24,'G1',4]]),
    B('Offbeat',32,[[2,'D1',1.5],[6,'D1',1.5],[10,'D1',1.5],[14,'D1',1.5],[18,'G1',1.5],[22,'G1',1.5],[26,'G1',1.5],[30,'G1',1.5]]),
    B('Long',32,[[0,'D1',16],[16,'G1',16]]),
    B('Sync',16,[[0,'D1',2],[3,'D1',1],[7,'D1',1],[10,'F1',2],[14,'A1',1]])],
   pad:[
    C('Warm',32,[[0,'Dm11',16],[16,'G9',16]],{syn:'warm'}),
    C('Strings',32,[[0,'Dm9',8],[8,'Em7',8],[16,'Fmaj9',8],[24,'G9',8]],{syn:'strings'}),
    C('Choir',32,[[0,'Dm9',32]],{syn:'choir'}),
    C('Swell',32,[[0,'Dm11',16],[16,'G9',16]],{syn:'swell'})],
   arp:[
    ARP('Up',32,[[0,'Dm9'],[16,'G9']],{rate:2,oct:1,gate:1.2},{syn:'pluck'}),
    ARP('Rain',32,[[0,'Dm11'],[16,'G9']],{oct:2,gate:.5,mask:'x...x..x..x...x.'}),
    ARP('Rolling',16,[[0,'Dm9']],{mode:'updown',oct:0,gate:.4},{syn:'pluck'}),
    ARP('Offbeat',32,[[0,'Dm9'],[16,'G9']],{oct:1,gate:1,mask:'..x...x...x...x.'})],
   fx:FX4
  }},
 home:{k:'deep',gc:'#FF6A3D',xpos:'50% 34%',c1:'#4dff9a',c2:'#8a5cff',pos:'center 32%',desc:'Olho fechado, copo na mão'},
 palette:['#3DFFC8','#3D7BFF'],
 cover:{lay:'block',bg:'#ECE9E1',blk:'#3D7BFF',ink:'#0c0c0c',lab:'#0c0c0c',w:'DEEP'},
 symbol:'<path d="M8 22L24 8L40 22V40H8Z"/><path d="M14 26H34M17 31H31M20 36H28"/>'
};
export { gDeep };
