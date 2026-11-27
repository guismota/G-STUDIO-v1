// Resumo dos níveis medidos: variação entre rodadas, faixas no topo do medidor, clipagem e faixas mudas.
// Uso: node tests/levels-report.mjs [chromium|webkit]
import fs from 'node:fs';
const browsers = process.argv[2] ? [process.argv[2]] : ['chromium', 'webkit'];
for (const b of browsers) {
  const d = `tests/baseline/levels/${b}`;
  if (!fs.existsSync(d)) continue;
  let worst = { sp: 0 }, n = 0, over = 0;
  const top = [], clip = [], mute = [];
  for (const f of fs.readdirSync(d).filter(f => f.endsWith('.json')).sort()) {
    const j = JSON.parse(fs.readFileSync(`${d}/${f}`, 'utf8'));
    for (const s in j.slots) {
      const runs = j.slots[s];
      for (const k of Object.keys(runs[0].lanes)) {
        const v = runs.map(r => r.lanes[k] || 0), sp = Math.max(...v) - Math.min(...v);
        n++; if (sp > 0.03) over++;
        if (sp > worst.sp) worst = { sp, where: `${j.genre} padrão ${+s + 1} ${k}`, v };
        if (runs.some(r => r.raw[k] >= 1)) top.push(`${j.genre} p${+s + 1} ${k} (${Math.max(...runs.map(r => r.raw[k])).toFixed(2)})`);
      }
      const mr = Math.max(...runs.map(r => r.masterRaw || 0));
      if (runs.some(r => r.clip) || mr >= 0.999) clip.push(`${j.genre} p${+s + 1} (pico da saída final ${mr.toFixed(3)}${runs.some(r => r.clip) ? ', luz acesa' : ''})`);
      for (const k of runs[0].on) if (runs.some(r => !(r.lanes[k] > 0))) mute.push(`${j.genre} p${+s + 1} ${k}`);
    }
  }
  console.log(`\n[${b}] ${n} medições de faixa`);
  console.log(`  maior variação entre rodadas: ${worst.sp.toFixed(3)} (${worst.where}: ${worst.v?.map(x => x.toFixed(3)).join(' / ')})`);
  console.log(`  variações acima de 0,03: ${over}`);
  console.log(`  clipagem na saída final: ${clip.length ? clip.join(', ') : 'nenhuma'}`);
  console.log(`  faixas com padrão e sem som: ${mute.length ? mute.join(', ') : 'nenhuma'}`);
  console.log(`  faixas que passam do topo do medidor da linha (pico >= 1,0): ${top.length}${top.length ? '\n    ' + top.join('\n    ') : ''}`);
}
