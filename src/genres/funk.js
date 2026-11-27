// MPEB (CH06): tudo o que define o gênero, num lugar só.
//   style   = andamento, tom, nomes das linhas, cenas prontas, sons (snd) e os 4 loops de cada linha (p)
//   home    = card da tela inicial (cor, descrição, imagem)
//   palette = cores do visual animado
//   cover   = capa tipográfica
//   symbol  = símbolo do card (SVG)
import { ARP, B, C, D, FX4, T } from '../app/all.js';
const gFunk={
 style:{name:'MPEB',bpm:130,swing:.03,key:{root:0,mode:'phrygian'},names:{snare:'Caixa',tom:'Atabaque',perc:'Tuim'},
  snd:{sub:{type:'808',rel:.15,drive:1.6},pad:{type:'choir'},arp:{type:'bolha'},sc:.25,
       kick:{f0:125,f1:43.65,dec:.9,click:.25,sweep:.07,drive:3,knock:.7},clap:{f:1300,dec:.22,spread:2,smp:'palma'},snare:{tone:280,hp:2400,dec:.13},
       hat:{metal:false,dec:.035,odec:.2,hp:8000},tom:{mult:1,dec:.22,smp:1,map:{200:311.13,150:196,110:130.81}},perc:{type:'tuim'},
       bass:{type:'808',drive:2.6,cut:2400},chord:{type:'brass'},lead:{type:'agudo'}},
  p:{
   kick:[D('Tamborzão','X..x..X...X..x..'),D('Pancadão','X...X...X...X...'),D('Bruxaria','X.....X...X.....'),D('Automotivo','X...X...X...X... X...X...X.X.XXXX')],
   clap:[D('Funk','....X.......X...'),D('Tamborzão','....X..o....X..o'),D('Mandela','..X...X...X...X.'),D('Virada','....X.......X... ....X...X.X.XXXX')],
   snare:[D('Contra','....x..x....x...'),D('Ghost','..o.x..o..o.x..o'),D('Seco','............X...'),D('Rufo','................ ........o.o.xoxX')],
   hat:[D('Funk','x.xxx.xxx.xxx.xx'),D('8ths','x.x.x.x.x.x.x.x.'),D('Off','..x...x...x...x.'),D('Tamb','oxoxXxoxoxoxXxox')],
   ohat:[D('Off','..x...x...x...x.'),D('Late','......x.......x.'),D('Sobe','..x...x...x...xx'),D('Um','x...............')],
   tom:[T('Tamborzão','..h.m..h.m..h.lm'),T('Atabaque','h.hm..h.h.hm..l.'),T('Grave','l..l..m...l..m..'),T('Virada','................ ......h.hmm.mll.')],
   perc:[D('Tuim','..x.....x.x.....'),D('Tuim 16','x.xx.x.xx.x.x.xx'),D('Cowbell','x..x..x...x..x..',{syn:'cowbell'}),D('Shaker','oxoxoxoxoxoxoxox',{syn:'shaker'})],
   bass:[
    B('Tamborzão',16,[[0,'C2',2],[3,'C2',2],[6,'C2',3],[10,'Eb2',2],[13,'C2',2]]),
    B('Mandelão',16,[[0,'C2',3],[4,'C2',3],[8,'C2',3],[12,'Db2',2,1,1]]),
    B('Bruxa',16,[[0,'C2',6],[10,'Db2',2,1.3,1],[13,'C2',2,1,1]]),
    B('Desce',32,[[0,'G2',4],[4,'F2',4],[8,'Eb2',4],[12,'C2',4],[16,'Bb1',4],[20,'Ab1',4],[24,'G1',8]])],
   sub:[
    B('Grave',16,[[0,'C1',3],[6,'C1',2],[10,'Eb1',3]]),
    B('Tambor',16,[[0,'C1',2],[3,'C1',2],[6,'C1',2],[10,'C1',3]]),
    B('Long',16,[[0,'C1',16]]),
    B('Desce',32,[[0,'G1',8],[8,'F1',8],[16,'Eb1',8],[24,'C1',8]])],
   chord:[
    C('Terror',16,[[0,'Cm',1],[3,'Db',1],[8,'Cm',1],[11,'Db',2]],{syn:'piano'}),
    C('Metais',16,[[0,'Cm7',1],[6,'Cm7',1],[10,'Cm7',1]]),
    C('Orquestra',16,[[0,'Fm',.5],[4,'Fm',.5],[8,'Db',1]],{syn:'stab'}),
    C('Piano',16,[[0,'Cm7',.5],[3,'Cm7',.5],[6,'Fm7',.5],[10,'Cm7',.5]],{syn:'piano'})],
   pad:[
    C('Coral',32,[[0,'Cm',16],[16,'Db',16]],{syn:'choir'}),
    C('Dark',32,[[0,'Cm',32]],{syn:'dark'}),
    C('Strings',32,[[0,'Cm7',16],[16,'Abmaj7',16]],{syn:'strings'}),
    C('Swell',16,[[0,'Cm',16]],{syn:'swell'})],
   arp:[
    ARP('Bolha',16,[[0,'Cm7']],{oct:1,gate:.4,mask:'x..x..x.x..x..x.'}),
    ARP('Bolha 2',32,[[0,'Cm7'],[16,'Abmaj7']],{mode:'updown',oct:2,gate:.3,mask:'x.x..x.x.x..x.x.'}),
    ARP('Tuim',16,[[0,'Cm']],{oct:2,gate:.25,mask:'x..x..x...x..x..'},{syn:'tuim'}),
    ARP('Pluck',32,[[0,'Cm7'],[16,'Fm7']],{rate:2,oct:1,gate:1},{syn:'pluck'})],
   lead:[
    B('Agudo',16,[[0,'C6',.5],[2,'Db6',.5],[3,'C6',1],[8,'C6',.5],[10,'Eb6',.5],[11,'Db6',1]]),
    B('Bruxaria',32,[[0,'G5',4],[4,'Ab5',4],[8,'G5',8],[16,'Db6',4],[20,'C6',4],[24,'G5',8]]),
    B('Assobio',32,[[0,'G5',1],[3,'C6',.5],[6,'Bb5',1],[10,'G5',1],[16,'Eb6',1],[19,'C6',.5],[22,'Bb5',1],[26,'G5',2]],{syn:'whistle'}),
    B('Alarme',32,[[0,'C6',8],[16,'C6',8]],{syn:'siren'})],
   fx:FX4
  }},
 home:{k:'funk',gc:'#FF3DAE',xpos:'50% 22%',c1:'#FFE600',c2:'#ff2d1a',pos:'center 22%',desc:'Música popular eletrônica brasileira'},
 palette:['#FF3DAE','#FFE600'],
 cover:{lay:'band',bg:'#FF3DAE',blk:'#0c0c0c',ink:'#FFE600',lab:'#FFE600',w:'MPEB',low:true},
 symbol:'<path d="M12 5H36V43H12Z"/><circle cx="24" cy="16" r="6"/><circle cx="24" cy="32.5" r="7.5"/><rect x="22.5" y="31" width="3" height="3" fill="currentColor" stroke="none"/><rect x="22.5" y="14.5" width="3" height="3" fill="currentColor" stroke="none"/>'
};
export { gFunk };
