// Exporta uma cena como CAMADA COM TRANSPARÊNCIA (para pôr textos e cards por cima de um vídeo real).
// Uso: node ferramentas/overlay.js <cena> <saida.mov> [--partes 4]
// Saída: MOV com codec PNG (canal alfa). Depois: ffmpeg -i base.mp4 -i saida.mov -filter_complex overlay ...
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
const [cena, saida] = process.argv.slice(2);
const partes = parseInt((process.argv.indexOf('--partes') > 0 ? process.argv[process.argv.indexOf('--partes') + 1] : '4'), 10);
(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const abrir = async () => {
    const p = await b.newPage(); p.on('pageerror', e => console.error('ERRO', e.message));
    await p.goto('file://' + path.resolve('motor/player.html') + '?cena=' + cena);
    const info = await p.evaluate(() => window.pronto.then(c => ({ fps: c.fps, dur: c.dur })));
    return { p, ...info };
  };
  const { p: p0, fps, dur } = await abrir(); await p0.close();
  const total = Math.round(dur * fps), tam = Math.ceil(total / partes), tmp = path.dirname(path.resolve(saida));
  let feitos = 0;
  const arqs = await Promise.all(Array.from({ length: partes }, async (_, k) => {
    const { p } = await abrir(), arq = path.join(tmp, `ov${k}.mov`);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'png', '-framerate', String(fps), '-i', '-',
      '-c:v', 'png', '-pix_fmt', 'rgba', arq], { stdio: ['pipe', 'ignore', 'inherit'] });
    for (let f = k * tam; f < Math.min(total, (k + 1) * tam); f++) {
      const png = await p.evaluate(t => frameData(t, 'image/png'), f / fps);
      if (!ff.stdin.write(Buffer.from(png.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
      if (++feitos % 60 === 0) process.stdout.write(`\r${feitos}/${total}`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); await p.close(); return arq;
  }));
  await b.close();
  const lista = path.join(tmp, 'ov-lista.txt'); fs.writeFileSync(lista, arqs.map(a => `file '${a}'`).join('\n'));
  await new Promise(r => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', saida], { stdio: 'inherit' }).on('close', r));
  arqs.forEach(a => fs.unlinkSync(a));
  console.log(`\n${total} quadros → ${saida}`);
})();
