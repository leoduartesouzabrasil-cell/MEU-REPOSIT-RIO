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
  // registro "Arquivo" (documentário)
  serifa: '"Instrument Serif"',     // use com estilo 'italic'
  grotesca: '"Archivo"',             // caixa alta pequena, peso 700
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
function fonte(ctx, familia, tam, peso = 900, estilo = '') { ctx.font = `${estilo} ${peso} ${tam}px ${familia}`; }

// tamanho que faz `txt` ocupar exatamente `largura`
function ajustar(ctx, txt, familia, largura, peso = 900) {
  fonte(ctx, familia, 100, peso); return 100 * largura / ctx.measureText(txt).width;
}

// texto com "erro de impressão" (cópia deslocada atrás)
// rgb: separação de cor estilo TV antiga (px), em vermelho/azul da paleta
function texto(ctx, txt, x, y, o = {}) {
  const { familia = FONTE.manchete, tam = 120, peso = 900, estilo = '', cor = COR.vermelho, alinhar = 'left',
    erro = null, desloc = 6, base = 'alphabetic', tracking = 0, rgb = 0 } = o;
  ctx.save(); fonte(ctx, familia, tam, peso, estilo); ctx.textAlign = alinhar; ctx.textBaseline = base;
  if (tracking) ctx.letterSpacing = `${tracking}px`;
  if (erro) { ctx.fillStyle = erro; ctx.fillText(txt, x + desloc, y + desloc * 0.6); }
  if (rgb) {
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = COR.vermelho; ctx.fillText(txt, x - rgb, y);
    ctx.fillStyle = COR.azul; ctx.fillText(txt, x + rgb, y);
    ctx.globalAlpha = 1;
  }
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

// ======================================================================
// Registro "ARQUIVO" — documentário de motion graphics (ref-03)
// ======================================================================

// linhas de varredura de TV/VHS + leve tremulação de brilho (12 fps)
function varredura(ctx, t, forca = 0.10) {
  const { width: w, height: h } = ctx.canvas;
  ctx.save(); ctx.fillStyle = COR.tinta; ctx.globalAlpha = forca;
  for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1.5);
  const f = rng(Math.floor(t * 12) + 7)();
  ctx.globalAlpha = 0.03 + f * 0.03; ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// câmera virtual: envolve o desenho num pan/zoom. cam = {x, y, zoom} (x,y = centro olhado)
function camera(ctx, cam, desenhar) {
  const { width: w, height: h } = ctx.canvas;
  ctx.save(); ctx.translate(w / 2, h / 2); ctx.scale(cam.zoom || 1, cam.zoom || 1);
  ctx.translate(-(cam.x ?? w / 2), -(cam.y ?? h / 2)); desenhar(); ctx.restore();
}

// palavra por palavra (sincronizar com a narração). palavras = [['quase', 0.2], ['ninguém', 0.5]]
// cada palavra entra com desfoque→nítido. Centralizado em x.
function palavras(ctx, lista, t, x, y, o = {}) {
  const { familia = FONTE.serifa, estilo = 'italic', peso = 400, tam = 64, cor = COR.tinta, espaco = 0.45, rgb = 1.5 } = o;
  fonte(ctx, familia, tam, peso, estilo);
  const larg = lista.map(([p]) => ctx.measureText(p).width), sp = tam * espaco;
  let cx = x - (larg.reduce((a, b) => a + b, 0) + sp * (lista.length - 1)) / 2;
  lista.forEach(([p, t0], i) => {
    const k = seg(t, t0, t0 + 0.25);
    if (k > 0) {
      ctx.save(); ctx.globalAlpha = k; ctx.filter = k < 1 ? `blur(${(1 - k) * 10}px)` : 'none';
      texto(ctx, p, cx, y + (1 - ease.saida(k)) * 12, { familia, estilo, peso, tam, cor, rgb });
      ctx.restore();
    }
    cx += larg[i] + sp;
  });
}

// letra por letra com desfoque (ex.: "Duri" → "During WW2")
function revelarLetras(ctx, txt, p, x, y, o = {}) {
  const { familia = FONTE.serifa, estilo = 'italic', peso = 400, tam = 64, cor = COR.tinta, alinhar = 'center' } = o;
  fonte(ctx, familia, tam, peso, estilo);
  let cx = x - (alinhar === 'center' ? ctx.measureText(txt).width / 2 : 0);
  const n = txt.length;
  for (let i = 0; i < n; i++) {
    const k = clamp(p * n * 1.4 - i);
    if (k > 0) {
      ctx.save(); ctx.globalAlpha = k; ctx.filter = k < 1 ? `blur(${(1 - k) * 8}px)` : 'none';
      texto(ctx, txt[i], cx, y, { familia, estilo, peso, tam, cor }); ctx.restore();
    }
    cx += ctx.measureText(txt[i]).width;
  }
}

// seleção de texto estilo celular: caixa translúcida + alças nas pontas
function selecao(ctx, x, y, w, h, p, cor = COR.azul) {
  if (p <= 0) return;
  const ww = w * ease.saida(p);
  ctx.save();
  ctx.globalAlpha = 0.35; ctx.fillStyle = cor; ctx.fillRect(x, y, ww, h);
  ctx.globalAlpha = 1; ctx.fillRect(x - 2, y, 4, h); ctx.fillRect(x + ww - 2, y, 4, h);
  ctx.beginPath(); ctx.arc(x, y - 6, 8, 0, 7); ctx.arc(x + ww, y + h + 6, 8, 0, 7); ctx.fill();
  ctx.restore();
}

// etiqueta de interface (chip): surge com pop
function etiqueta(ctx, txt, x, y, p, o = {}) {
  if (p <= 0) return;
  const { cor = COR.azul, corTexto = COR.bege, tam = 44 } = o;
  fonte(ctx, FONTE.grotesca, tam, 700);
  const w = ctx.measureText(txt).width + tam * 1.1, h = tam * 1.5, e = lerp(0.6, 1, ease.carimbo(p));
  ctx.save(); ctx.translate(x, y); ctx.scale(e, e); ctx.globalAlpha = clamp(p * 3);
  ctx.fillStyle = COR.tinta; ctx.fillRect(-w / 2 + 6, -h / 2 + 6, w, h);           // sombra chapada
  ctx.fillStyle = cor; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = COR.bege; ctx.lineWidth = 3; ctx.strokeRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10);
  texto(ctx, txt, 0, tam * 0.36, { familia: FONTE.grotesca, peso: 700, tam, cor: corTexto, alinhar: 'center' });
  ctx.restore();
}

// ondas concêntricas de sinal (rádio, transmissão, alcance)
function ondas(ctx, cx, cy, t, o = {}) {
  const { cor = COR.bege, n = 6, passo = 90, vel = 0.5, largura = 2 } = o;
  ctx.save(); ctx.strokeStyle = cor; ctx.lineWidth = largura;
  for (let i = 0; i < n; i++) {
    const f = (i + (t * vel) % 1) / n;
    ctx.globalAlpha = (1 - f) * 0.8;
    ctx.beginPath(); ctx.arc(cx, cy, 20 + f * n * passo, 0, 7); ctx.stroke();
  }
  ctx.restore();
}

// ícone de sinal: arcos dos dois lados (como antena transmitindo)
function sinal(ctx, cx, cy, t, cor = COR.vermelho, tam = 160) {
  ctx.save(); ctx.strokeStyle = cor; ctx.lineCap = 'butt';
  for (let i = 0; i < 4; i++) {
    const r = tam * (0.35 + i * 0.22), a = 0.6, lig = (Math.floor(t * 6) % 4) >= i;
    ctx.globalAlpha = lig ? 0.95 : 0.35; ctx.lineWidth = tam * 0.12;
    ctx.beginPath(); ctx.arc(cx, cy, r, -a, a); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI - a, Math.PI + a); ctx.stroke();
  }
  ctx.restore();
}

// planta técnica / patente procedural como fundo (linhas finas, hachuras, números)
function planta(ctx, seed = 1, cor = COR.tinta, alfa = 0.22) {
  const { width: w, height: h } = ctx.canvas, r = rng(seed);
  ctx.save(); ctx.globalAlpha = alfa; ctx.strokeStyle = cor; ctx.fillStyle = cor; ctx.lineWidth = 2;
  for (let k = 0; k < 9; k++) {
    const x = r() * w * 0.9, y = r() * h * 0.9, bw = 120 + r() * 300, bh = 80 + r() * 380;
    ctx.strokeRect(x, y, bw, bh);
    if (r() > 0.5) {                                   // hachura
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, bw, bh); ctx.clip();
      for (let d = -bh; d < bw; d += 18) { ctx.beginPath(); ctx.moveTo(x + d, y + bh); ctx.lineTo(x + d + bh, y); ctx.stroke(); }
      ctx.restore();
    }
    const n = Math.floor(10 + r() * 90);               // cota numerada
    ctx.beginPath(); ctx.moveTo(x + bw, y + bh / 2); ctx.lineTo(x + bw + 50, y + bh / 2 - 30); ctx.stroke();
    fonte(ctx, FONTE.maquina, 36, 400); ctx.fillText(String(n), x + bw + 56, y + bh / 2 - 34);
  }
  for (let k = 0; k < 14; k++) {                       // colunas cilíndricas
    const x = r() * w, y = r() * h, ch = 120 + r() * 200;
    ctx.strokeRect(x, y, 34, ch); ctx.beginPath(); ctx.arc(x + 17, y + ch, 17, 0, Math.PI); ctx.stroke();
  }
  ctx.restore();
}

// foto de arquivo: P&B, contraste, desfoque de foco opcional, com retícula por cima
// img = L.img.nome (pré-carregada via CENA.imagens)
function foto(ctx, img, x, y, w, h, o = {}) {
  const { pb = true, desfoque = 0, zoom = 1, retic = true } = o;
  const s = Math.max(w / img.width, h / img.height) * zoom, iw = img.width * s, ih = img.height * s;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.filter = `${pb ? 'grayscale(1) sepia(0.25) contrast(1.15)' : 'saturate(0.8)'} ${desfoque ? `blur(${desfoque}px)` : ''}`;
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
  ctx.filter = 'none';
  if (retic) { ctx.globalAlpha = 0.12; reticula(ctx, x, y, w, h, COR.tinta, 6, 1.4); }
  ctx.restore();
}

// moldura dourada de quadro (retratos, "memória")
function moldura(ctx, x, y, w, h, esp = 46) {
  ctx.save();
  const faixas = [[COR.vermelhoEscuro, 0], [COR.amarelo, 6], ['#B98516', 18], [COR.amarelo, 26], [COR.vermelhoEscuro, esp - 8]];
  faixas.forEach(([c, d]) => { ctx.fillStyle = c; ctx.fillRect(x - esp + d, y - esp + d, w + 2 * (esp - d), h + 2 * (esp - d)); });
  ctx.fillStyle = 'rgba(28,23,20,0.35)'; ctx.fillRect(x + w + esp, y - esp + 14, 14, h + 2 * esp);   // sombra
  ctx.fillRect(x - esp + 14, y + h + esp, w + 2 * esp, 14);
  ctx.restore();
}

window.CT = { COR, FONTE, clamp, seg, lerp, ease, emDois, rng, fundo, papel, vinheta, reticula,
  raios, estrela, bandeira, mastro, corteDiagonal, fonte, ajustar, texto, carimbo, aplicarCarimbo, datilografar,
  varredura, camera, palavras, revelarLetras, selecao, etiqueta, ondas, sinal, planta, foto, moldura, img: {} };
