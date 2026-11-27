// ---------- gravação pelo microfone: a janela (a captura e o tratamento do som ficam no motor: engine/mic.js) ----------
import { $, LIBM, XS, classify, engine, saveLib, uid, xRender, xStopAud, xToast } from '../app/all.js';
const MICU={on:false,ready:false}; // espelho do que o motor avisa
engine.on('mic.state',e=>{MICU.on=e.on;if(e.on){MICU.ready=false;$('#xRec').classList.add('rec');$('#xRecGo').textContent='Parar';$('#xRecSave').disabled=true;$('#xRecPlay').disabled=true}
  else{$('#xRecLv').style.width='0';$('#xRec').classList.remove('rec');$('#xRecGo').textContent='Gravar de novo'}});
engine.on('mic.level',e=>{const s=(Date.now()-e.t0)/1000;$('#xRecT').textContent=s.toFixed(1).replace('.',',')+' s';$('#xRecLv').style.width=Math.min(100,e.value*140)+'%'});
engine.on('mic.done',e=>{MICU.ready=!!e.ok;if(e.ok){$('#xRecT').textContent='Pronto: '+e.seconds.toFixed(1).replace('.',',')+' s';$('#xRecSave').disabled=false;$('#xRecPlay').disabled=false}
  else $('#xRecT').textContent='Não captou som. Tente de novo mais perto do microfone.'});
function openRecDlg(){
  $('#xRecName').value='Gravação '+(LIBM.items.filter(x=>x.rec).length+1);$('#xRecT').textContent='Toque em Gravar e faça o som';
  $('#xRecSave').disabled=true;$('#xRecPlay').disabled=true;$('#xRecGo').textContent='Gravar';MICU.ready=false;engine.send({type:'mic.clear'});$('#xRec').classList.add('open');
}
function closeRecDlg(){engine.send({type:'mic.stop'});$('#xRec').classList.remove('open');xStopAud()}
async function saveRec(){
  if(!MICU.ready)return;const id=uid(),name=($('#xRecName').value||'').trim().slice(0,40)||'Gravação';
  const r=await engine.request({type:'mic.save',id},'mic.saved');if(!r.ok){xToast('Não deu para salvar a gravação');return}
  const dur=r.duration;const c=classify(name,dur);
  LIBM.items.push({id,name,cat:c.cat==='other'?'vocal':c.cat,kind:dur>4?'loop':'oneshot',bpm:c.bpm,bars:c.bars,dur:+dur.toFixed(2),added:Date.now(),rec:true,size:r.size});
  saveLib();MICU.ready=false;$('#xRec').classList.remove('open');XS.view='mine';XS.flash=[id];xToast('Gravação salva em Meus sons');xRender();
}

export { MICU, closeRecDlg, openRecDlg, saveRec };
