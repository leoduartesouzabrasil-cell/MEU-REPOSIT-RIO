// Renderiza uma cena em MP4 (H.264) frame a frame, em paralelo.
// Uso: node motor/render.js <cena> [saida.mp4] [--audio trilha.wav] [--still 3.2] [--partes 4] [--de 10 --ate 20]
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const args = process.argv.slice(2);
const cena = args[0] || 'demo';
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const saida = (args[1] && !args[1].startsWith('--')) ? args[1] : `saida/${cena}.mp4`;
const audio = opt('--audio'), still = opt('--still');
const partes = parseInt(opt('--partes') || Math.min(4, os.cpus().length), 10);

async function abrir(browser) {
  const page = await browser.newPage();
  page.on('pageerror', e => console.error('erro na cena:', e.message));
  await page.goto('file://' + path.resolve(__dirname, 'player.html') + `?cena=${cena}`);
  const info = await page.evaluate(() => window.pronto.then(c => ({ w: c.w, h: c.h, fps: c.fps, dur: c.dur })));
  return { page, ...info };
}

// renderiza os frames [f0, f1) num arquivo de vídeo sem áudio (JPEG em pipe → H.264)
async function parte(browser, f0, f1, arquivo, progresso) {
  const { page, fps } = await abrir(browser);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', arquivo], { stdio: ['pipe', 'ignore', 'inherit'] });
  for (let f = f0; f < f1; f++) {
    const jpg = await page.evaluate(t => frameData(t, 'image/jpeg', 0.93), f / fps);
    if (!ff.stdin.write(Buffer.from(jpg.split(',')[1], 'base64')))
      await new Promise(r => ff.stdin.once('drain', r));
    progresso();
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await page.close();
}

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const { page, w, h, fps, dur } = await abrir(browser);

  if (still) {
    const png = await page.evaluate(t => frameData(t), parseFloat(still));
    fs.writeFileSync(saida, Buffer.from(png.split(',')[1], 'base64'));
    console.log(`quadro ${still}s → ${saida}`);
    return browser.close();
  }
  await page.close();

  const de = parseFloat(opt('--de') || 0), ate = parseFloat(opt('--ate') || dur);
  const fIni = Math.round(de * fps), fFim = Math.round(ate * fps), total = fFim - fIni;
  const tmp = fs.mkdtempSync(path.join(path.dirname(path.resolve(saida)), '.partes-'));
  let feitos = 0;
  const t0 = Date.now();
  const progresso = () => {
    if (++feitos % fps === 0) {
      const ritmo = feitos / ((Date.now() - t0) / 1000);
      process.stdout.write(`\r${feitos}/${total} frames · ${ritmo.toFixed(1)} fps · faltam ${Math.round((total - feitos) / ritmo)}s   `);
    }
  };
  const tam = Math.ceil(total / partes);
  const arquivos = [];
  await Promise.all(Array.from({ length: partes }, (_, k) => {
    const a = fIni + k * tam, b = Math.min(fFim, a + tam);
    const arq = path.join(tmp, `p${k}.mp4`); arquivos.push(arq);
    return a < b ? parte(browser, a, b, arq, progresso) : Promise.resolve();
  }));
  await browser.close();

  const lista = path.join(tmp, 'lista.txt');
  fs.writeFileSync(lista, arquivos.filter(fs.existsSync).map(a => `file '${a}'`).join('\n'));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lista,
    ...(audio ? ['-ss', String(de), '-t', String(ate - de), '-i', audio,
      '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest'] : []),
    '-c:v', 'copy', '-movflags', '+faststart', saida]);
  fs.rmSync(tmp, { recursive: true });
  console.log(`\n${w}x${h} @${fps}fps, ${(ate - de).toFixed(1)}s → ${saida}`);
})();
