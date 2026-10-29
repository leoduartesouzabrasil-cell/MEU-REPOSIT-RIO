// Construtivismo Tropical — biblioteca de motion graphics (Canvas 2D, determinística por tempo).
// Toda cena desenha o frame a partir de `t` (segundos), então o render é exato e repetível.

const COR = {
  bege: '#EDE0C4', begeEscuro: '#D6C29A',
  vermelho: '#C8201E', vermelhoEscuro: '#8A1411',
  amarelo: '#EBB52A', azul: '#1F3A5F', tinta: '#1C1714',
};

const FONTE = {
  manchete: '"Big Shoulders Display"',
  bloco: '"Russo One"',
  sub: '"Oswald"',
  maquina: '"Special Elite"',
};

// ---------- tempo e curvas ----------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, p) => a + (b - a) * p;
const ease = {
  saida: p => 1 - Math.pow(1 - p, 4),             // padrão da identidade: chega rápido e assenta
  entrada: p => p * p * p,
  carimbo: p => {                                  // overshoot curto
    const c = 2.2; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
  },
};
// "animação em dois": congela o tempo a cada 2 frames para parecer feito à mão
const emDois = (t, fps = 30) => Math.floor(t * fps / 2) * 2 / fps;

// gerador pseudoaleatório com semente (determinístico)
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// ---------- fundo, textura e acabamento ----------
function fundo(ctx, cor) { ctx.fillStyle = cor; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); }

const _graos = [];
function _gerarGraos(w, h) {
  for (let k = 0; k < 4; k++) {
    const c = document.createElement('canvas'); c.width = w / 2; c.height = h / 2;
    const g = c.getContext('2d'), img = g.createImageData(c.width, c.height), r = rng(97 + k * 31);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = r() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    // manchas grandes de papel
    for (let m = 0; m < 40; m++) {
      g.fillStyle = `rgba(60,40,20,${0.02 + r() * 0.04})`;
      g.beginPath(); g.arc(r() * c.width, r() * c.height, 20 + r() * 120, 0, 7); g.fill();
    }
    _graos.push(c);
  }
}
// papel vivo: grão que "ferve" a 12 fps
function papel(ctx, t, forca = 0.11) {
  const { width: w, height: h } = ctx.canvas;
  if (!_graos.length) _gerarGraos(w, h);
  ctx.save();
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = forca;
  ctx.drawImage(_graos[Math.floor(t * 12) % 4], 0, 0, w, h);
  ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = forca * 0.5;
  ctx.drawImage(_graos[(Math.floor(t * 12) + 2) % 4], 0, 0, w, h);
  ctx.restore();
}

function vinheta(ctx, forca = 0.35) {
  const { width: w, height: h } = ctx.canvas;
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(28,23,20,0)'); g.addColorStop(1, `rgba(28,23,20,${forca})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}

// retícula de pontos (sombra de impressão) dentro de um retângulo
function reticula(ctx, x, y, w, h, cor, passo = 14, raio = 3.2) {
  ctx.save(); ctx.fillStyle = cor;
  for (let j = 0; j * passo < h; j++)
    for (let i = 0; i * passo < w; i++) {
      ctx.beginPath(); ctx.arc(x + i * passo + (j % 2) * passo / 2, y + j * passo, raio, 0, 7); ctx.fill();
    }
  ctx.restore();
}

// ---------- símbolos ----------
function raios(ctx, cx, cy, raio, n, rot, cor) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.fillStyle = cor;
  const a = Math.PI / n;
  for (let i = 0; i < n; i++) {
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(i * 2 * a) * raio, Math.sin(i * 2 * a) * raio);
    ctx.lineTo(Math.cos(i * 2 * a + a) * raio, Math.sin(i * 2 * a + a) * raio);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function estrela(ctx, cx, cy, r, rot, cor) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.fillStyle = cor; ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.40 : r, a = -Math.PI / 2 + i * Math.PI / 5;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill(); ctx.restore();
}

// bandeira tremulando: faixas verticais deslocadas por senoide
function bandeira(ctx, x, y, w, h, t, cor, sombra = COR.vermelhoEscuro) {
  const fatias = 60, fw = w / fatias;
  for (let i = 0; i < fatias; i++) {
    const k = i / fatias, onda = Math.sin(k * 7 - t * 5) * 22 * k;
    const luz = Math.cos(k * 7 - t * 5);
    ctx.fillStyle = luz < -0.45 ? sombra : cor;
    ctx.fillRect(x + i * fw, y + onda, fw + 1, h * (1 - k * 0.12));
  }
}

// mastro simples com ponta de lança
function mastro(ctx, x, y1, y2, cor = COR.tinta) {
  ctx.fillStyle = cor; ctx.fillRect(x - 9, y1, 18, y2 - y1);
  ctx.beginPath(); ctx.moveTo(x, y1 - 70); ctx.lineTo(x + 22, y1); ctx.lineTo(x - 22, y1); ctx.closePath(); ctx.fill();
}

// ---------- transições ----------
// corte diagonal: faixa sólida varre a tela inteira (p 0→1). ang em graus.
function corteDiagonal(ctx, p, cor, ang = -24) {
  if (p <= 0 || p >= 1) return;               // em p=1 a cena seguinte já assumiu
  const { width: w, height: h } = ctx.canvas, d = Math.hypot(w, h);
  ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate(ang * Math.PI / 180);
  ctx.fillStyle = cor; ctx.fillRect(-d, -d, lerp(0, 2 * d, ease.saida(p)), 2 * d);
  ctx.restore();
}

// ---------- texto ----------
function fonte(ctx, familia, tam, peso = 900) { ctx.font = `${peso} ${tam}px ${familia}`; }

// tamanho que faz `txt` ocupar exatamente `largura`
function ajustar(ctx, txt, familia, largura, peso = 900) {
  fonte(ctx, familia, 100, peso); return 100 * largura / ctx.measureText(txt).width;
}

// texto com "erro de impressão" (cópia deslocada atrás)
function texto(ctx, txt, x, y, o = {}) {
  const { familia = FONTE.manchete, tam = 120, peso = 900, cor = COR.vermelho, alinhar = 'left',
    erro = null, desloc = 6, base = 'alphabetic', tracking = 0 } = o;
  ctx.save(); fonte(ctx, familia, tam, peso); ctx.textAlign = alinhar; ctx.textBaseline = base;
  if (tracking) ctx.letterSpacing = `${tracking}px`;
  if (erro) { ctx.fillStyle = erro; ctx.fillText(txt, x + desloc, y + desloc * 0.6); }
  ctx.fillStyle = cor; ctx.fillText(txt, x, y); ctx.restore();
}

// carimbo: devolve {escala, dx, dy, alfa} para p 0→1
function carimbo(p, seed = 1) {
  if (p <= 0) return { escala: 1.6, dx: 0, dy: 0, alfa: 0 };
  const e = lerp(1.6, 1, ease.carimbo(clamp(p * 1.25)));
  const tremor = p > 0.55 && p < 0.85 ? (rng(seed + Math.floor(p * 30))() - 0.5) * 14 : 0;
  return { escala: e, dx: tremor, dy: -tremor * 0.6, alfa: clamp(p * 4) };
}

function aplicarCarimbo(ctx, p, cx, cy, desenhar, seed) {
  const c = carimbo(p, seed); if (!c.alfa) return;
  ctx.save(); ctx.globalAlpha = c.alfa;
  ctx.translate(cx + c.dx, cy + c.dy); ctx.scale(c.escala, c.escala); ctx.translate(-cx, -cy);
  desenhar(); ctx.restore();
}

// datilografia: parte visível da string + cursor
function datilografar(txt, p) {
  const n = Math.floor(txt.length * clamp(p));
  return txt.slice(0, n) + (p < 1 && Math.floor(p * 40) % 2 === 0 ? '▌' : '');
}

window.CT = { COR, FONTE, clamp, seg, lerp, ease, emDois, rng, fundo, papel, vinheta, reticula,
  raios, estrela, bandeira, mastro, corteDiagonal, fonte, ajustar, texto, carimbo, aplicarCarimbo, datilografar };
