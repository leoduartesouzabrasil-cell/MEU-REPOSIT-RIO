const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const [cena, ...ts] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const p = await b.newPage();
  p.on('pageerror', e => console.error('ERRO', e.message)); p.on('console', m => m.type() === 'error' && console.error('console', m.text()));
  await p.goto('file://' + path.resolve('motor/player.html') + '?cena=' + cena + (process.env.TEMPOS ? '&tempos=' + process.env.TEMPOS : ''));
  await p.evaluate(() => window.pronto);
  for (const t of ts) { const d = await p.evaluate(t => frameData(t, 'image/jpeg', 0.8), +t); fs.writeFileSync(`saida/q/${t}.jpg`, Buffer.from(d.split(',')[1], 'base64')); }
  await b.close();
})();
