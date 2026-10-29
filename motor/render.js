// Renderiza uma cena em MP4 (H.264) frame a frame.
// Uso: node motor/render.js <cena> [saida.mp4] [--audio trilha.mp3] [--still 3.2]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const args = process.argv.slice(2);
  const cena = args[0] || 'demo';
  const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
  const saida = (args[1] && !args[1].startsWith('--')) ? args[1] : `saida/${cena}.mp4`;
  const audio = opt('--audio'), still = opt('--still');

  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  await page.goto('file://' + path.resolve(__dirname, 'player.html') + `?cena=${cena}`);
  const { w, h, fps, dur } = await page.evaluate(() => window.pronto.then(c => ({ w: c.w, h: c.h, fps: c.fps, dur: c.dur })));

  if (still) {
    const png = await page.evaluate(t => frameData(t), parseFloat(still));
    require('fs').writeFileSync(saida, Buffer.from(png.split(',')[1], 'base64'));
    console.log(`quadro ${still}s → ${saida}`);
    return browser.close();
  }

  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    ...(audio ? ['-i', audio, '-shortest', '-c:a', 'aac', '-b:a', '192k'] : []),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', saida],
    { stdio: ['pipe', 'ignore', 'inherit'] });

  const total = Math.round(dur * fps);
  for (let f = 0; f < total; f++) {
    const png = await page.evaluate(t => frameData(t), f / fps);
    if (!ff.stdin.write(Buffer.from(png.split(',')[1], 'base64')))
      await new Promise(r => ff.stdin.once('drain', r));
    if (f % fps === 0) process.stdout.write(`\r${f}/${total} frames`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log(`\n${w}x${h} @${fps}fps, ${dur}s → ${saida}`);
})();
