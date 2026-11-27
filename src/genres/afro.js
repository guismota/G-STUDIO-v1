// Afrohouse (CH09): tudo o que define o gênero, num lugar só.
//   style   = andamento, tom, nomes das linhas, cenas prontas, sons (snd) e os 4 loops de cada linha (p)
//   home    = card da tela inicial (cor, descrição, imagem)
//   palette = cores do visual animado
//   cover   = capa tipográfica
//   symbol  = símbolo do card (SVG) (este gênero não tem)
// gênero especial Afrohouse: a percussão conduz, kick macio, muito swing, coro, kalimba e baixo redondo
import { ARP, B, C, D, FX4, T } from '../app/all.js';
const gAfro={
 style:{name:'Afrohouse',bpm:121,swing:.11,key:{root:9,mode:'minor'},artist:true,theme:'afro',names:{snare:'Snap',ohat:'Aberto',tom:'Congas',perc:'Madeira',chord:'Keys',pad:'Coro',arp:'Kalimba',lead:'Voz'},
  scenes:[{kick:0,hat:0,perc:0,tom:0,sub:0},{kick:0,clap:0,hat:0,ohat:0,tom:0,perc:1,bass:0,pad:0,arp:0},{pad:0,arp:1,lead:0,perc:0,tom:2,sub:1,fx:0},
          {kick:1,clap:1,snare:0,hat:1,ohat:1,tom:1,perc:2,bass:1,chord:0,pad:0,arp:0,lead:1,fx:1}],
  snd:{sub:{type:'sine',cut:170},pad:{type:'choir'},arp:{type:'kalimba'},sc:.22,
       kick:{f0:118,f1:48,dec:.52,click:.12,sweep:.055,tail:.45,lvl:.74},clap:{f:1500,dec:.3,spread:2,smp:'palma',sv:.5},snare:{tone:220,hp:2600,dec:.08,alt:'snap'},
       hat:{metal:false,dec:.03,odec:.24,hp:9000,smp:'hat_c',osmp:'hat_o',sdur:.1,sv:.45},tom:{mult:1,dec:.3,smp:1,sv:.85,map:{200:220,150:164.81,110:130.81}},perc:{type:'shaker'},
       bass:{type:'round',cut:520},chord:{type:'keys'},lead:{type:'vox'}},
  p:{
   kick:[D('4x4','x...x...x...x...'),D('Deep','x...x...x...x..o'),D('Half','x.......x.......'),D('Build','x...x...x...x... x...x...x.x.xxxx')],
   clap:[D('Leve','....x.......x...'),D('Shuffle','....x..o....x.o.'),D('Sparse','............x...'),D('Fill','....x.......x... ....x...o.x.oxxx')],
   snare:[D('Snap','......o.......x.'),D('Clave','x..x..x...x.x...'),D('Rumba','x..x...x..x.x...'),D('Roll','................ ........o.o.ooxx')],
   hat:[D('Swing','o.x.o.xoo.x.o.xo'),D('16ths','oxoxoxoxoxoxoxox'),D('Off','..x...x...x...x.'),D('Tique','x.o.x.o.x.o.x.o.')],
   ohat:[D('Ar','......x.......x.'),D('Off','..x...x...x...x.'),D('Late','...x.......x....'),D('Wash','x...............')],
   tom:[T('Tumba','..m.m.l...m.H.l.'),T('Bongô','h.hm..h.h.hm..h.'),T('Fala','m..l..m...l..m..'),T('Fill','................ ......h.hmm.mll.')],
   perc:[D('Shaker','oxxooxxooxxooxxo'),D('Log','..x..x....x..x..',{syn:'smp:logdrum'}),D('Bongô','x.o..x.ox.o..x.o',{syn:'smp:bongo_hi'}),D('Grave','...x......x..x..',{syn:'smp:bongo_lo'})],
   bass:[
    B('Redondo',32,[[2,'A1',1.5],[6,'A1',.5],[7,'C2',1],[10,'A1',1.5],[14,'G1',1],[18,'F1',1.5],[22,'F1',.5],[23,'A1',1],[26,'G1',1.5],[30,'E1',1]]),
    B('Rolando',16,[[2,'A1',.5],[3,'A1',.5],[6,'A1',.5],[7,'C2',.5],[10,'A1',.5],[11,'E2',.5],[14,'G1',.5],[15,'A1',.5]]),
    B('Longo',32,[[0,'A1',6],[7,'C2',2],[10,'E2',4],[16,'F1',6],[23,'G1',2],[26,'E1',4]]),
    B('Swing',16,[[0,'A1',.5],[3,'A1',.5],[6,'C2',.5],[8,'A1',.25],[10,'G1',.5],[12,'E2',.25],[14,'D2',.5]])],
   sub:[
    B('Offbeat',32,[[2,'A1',1.5],[6,'A1',1.5],[10,'A1',1.5],[14,'A1',1.5],[18,'F1',1.5],[22,'F1',1.5],[26,'G1',1.5],[30,'E1',1.5]]),
    B('Long',32,[[0,'A1',16],[16,'F1',16]]),
    B('Pulse',16,[[2,'A1',1],[6,'A1',1],[10,'A1',1],[14,'C2',1]]),
    B('Follow',32,[[0,'A1',3],[6,'A1',2],[10,'C2',2],[16,'F1',3],[22,'F1',2],[26,'E1',4]])],
   chord:[
    C('Keys',32,[[3,'Am9',1],[6,'Am9',1],[11,'Am9',1],[19,'Fmaj9',1],[22,'Fmaj9',1],[27,'Em7',1]]),
    C('Rhodes',16,[[2,'Am9',.5],[7,'Am9',.5],[10,'Am9',.5],[15,'Fmaj9',.5]],{syn:'keys'}),
    C('Prog',32,[[0,'Am9',4],[4,'Fmaj9',4],[8,'Dm9',4],[12,'Em7',4],[16,'Am9',4],[20,'Fmaj9',4],[24,'Gadd9',4],[28,'Em7',4]]),
    C('Organ',32,[[0,'Am9',8],[8,'Fmaj9',8],[16,'Dm9',8],[24,'Esus4',4],[28,'Em7',4]],{syn:'organ'})],
   pad:[
    C('Coro',32,[[0,'Am9',16],[16,'Fmaj9',16]],{syn:'choir'}),
    C('Warm',32,[[0,'Am9',16],[16,'Fmaj9',16]],{syn:'warm'}),
    C('Air',32,[[0,'Am11',16],[16,'Fmaj9',16]],{syn:'air'}),
    C('Swell',16,[[0,'Am9',16]],{syn:'swell'})],
   arp:[
    ARP('Kalimba',32,[[0,'Am9'],[16,'Fmaj9']],{oct:1,gate:.5,mask:'x..x..x...x..x..'}),
    ARP('Gotas',32,[[0,'Am9'],[16,'Dm9']],{oct:2,gate:.3,mask:'..x...x..x...x..'}),
    ARP('Marimba',16,[[0,'Am7']],{mode:'updown',oct:1,gate:.4,mask:'x.xx.x.x..x.x.x.'}),
    ARP('Sino',32,[[0,'Am9'],[16,'Fmaj9']],{oct:2,gate:.3,mask:'x.......x.......'},{syn:'bell'})],
   lead:[
    B('Chant',32,[[0,'E5',2],[3,'D5',1],[4,'C5',2],[8,'A4',4],[16,'E5',2],[19,'G5',1],[20,'E5',2],[24,'D5',4]]),
    B('Eco',16,[[2,'A4',.5],[6,'C5',.5],[10,'E5',.5],[14,'D5',.5]]),
    B('Flauta',32,[[0,'A5',1],[2,'C6',.5],[3,'D6',1],[6,'E6',2],[10,'D6',.5],[11,'C6',.5],[12,'A5',2],[16,'G5',1],[18,'A5',1],[20,'C6',2],[24,'A5',4]],{syn:'whistle'}),
    B('Hook',16,[[0,'A4',.5],[3,'C5',.5],[6,'E5',.5],[8,'D5',.5],[11,'C5',.5],[14,'A4',.5]],{syn:'fm'})],
   fx:FX4
  }},
 home:{k:'afro',artist:true,theme:'afro',html:'<span>Afro</span><em>house</em>',desc:'Tambores, coro e pôr do sol'},
 palette:['#FF6B2C','#FFC23D'],
 cover:{lay:'band',bg:'#FF6B2C',blk:'#1a0c04',ink:'#FFF1DC',lab:'#FFC23D',w:'AFRO',low:true,pro:true},
 symbol:null
};
export { gAfro };
