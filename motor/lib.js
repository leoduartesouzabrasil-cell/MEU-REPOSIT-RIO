// Construtivismo Tropical — biblioteca de motion graphics (Canvas 2D, determinística por tempo).
// Toda cena desenha o frame a partir de `t` (segundos), então o render é exato e repetível.

const COR = {
  bege: '#EDE0C4', begeEscuro: '#D6C29A',
  vermelho: '#C8201E', vermelhoEscuro: '#8A1411',
  amarelo: '#EBB52A', azul: '#1F3A5F', tinta: '#1C1714',
  // modo TENSO (violência, morte, luto)
  sangue: '#5E0B0A', carvao: '#0F0C0B',
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
  if (p <= 0) return '';
  const n = Math.floor(txt.length * clamp(p));
  return txt.slice(0, n) + (p < 1 && Math.floor(p * 40) % 2 === 0 ? '▌' : '');
}

// ======================================================================
// Registro "ARQUIVO" — documentário de motion graphics (ref-03)
// ======================================================================

// linhas de varredura de TV/VHS + leve tremulação de brilho (12 fps)
let _linhas = null;
function varredura(ctx, t, forca = 0.10) {
  const { width: w, height: h } = ctx.canvas;
  if (!_linhas) {
    _linhas = document.createElement('canvas'); _linhas.width = w; _linhas.height = h;
    const g = _linhas.getContext('2d'); g.fillStyle = COR.tinta;
    for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1.5);
  }
  ctx.save(); ctx.globalAlpha = forca; ctx.drawImage(_linhas, 0, 0); ctx.fillStyle = COR.tinta;
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
const _plantas = {};
function planta(ctx, seed = 1, cor = COR.tinta, alfa = 0.22) {
  const chave = `${seed}|${cor}|${alfa}`;
  if (!_plantas[chave]) {
    const c = document.createElement('canvas'); c.width = ctx.canvas.width; c.height = ctx.canvas.height;
    _desenharPlanta(c.getContext('2d'), seed, cor, alfa); _plantas[chave] = c;
  }
  ctx.drawImage(_plantas[chave], 0, 0);
}
function _desenharPlanta(ctx, seed, cor, alfa) {
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
// seletiva: 'vermelho' mantém só os tons avermelhados da foto, puxados para o vermelho da paleta
const _fotos = new Map();
function _processar(img, pb, seletiva) {
  const chave = img.src + pb + seletiva;
  if (_fotos.has(chave)) return _fotos.get(chave);
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
  const g = c.getContext('2d');
  g.filter = pb ? 'grayscale(1) sepia(0.25) contrast(1.15)' : 'saturate(0.8)'; g.drawImage(img, 0, 0); g.filter = 'none';
  if (seletiva) {
    const o = document.createElement('canvas'); o.width = c.width; o.height = c.height;
    const go = o.getContext('2d'); go.drawImage(img, 0, 0);
    const src = go.getImageData(0, 0, c.width, c.height), dst = g.getImageData(0, 0, c.width, c.height);
    for (let i = 0; i < src.data.length; i += 4) {
      const r = src.data[i], gg = src.data[i + 1], b = src.data[i + 2];
      const k = clamp((r - Math.max(gg, b) - 40) / 60);          // quanto "vermelho" é o pixel
      if (k > 0) { dst.data[i] = lerp(dst.data[i], 200, k); dst.data[i + 1] = lerp(dst.data[i + 1], 32, k); dst.data[i + 2] = lerp(dst.data[i + 2], 30, k); }
      if (seletiva === 'quente') {                                // também mantém amarelos (vira o amarelo da paleta)
        const ka = clamp((Math.min(r, gg) - b - 60) / 50) * clamp((gg - 0.45 * r) / 40);
        if (ka > 0) { dst.data[i] = lerp(dst.data[i], 235, ka); dst.data[i + 1] = lerp(dst.data[i + 1], 181, ka); dst.data[i + 2] = lerp(dst.data[i + 2], 42, ka); }
      }
    }
    g.putImageData(dst, 0, 0);
  }
  _fotos.set(chave, c); return c;
}

function foto(ctx, img, x, y, w, h, o = {}) {
  const { pb = true, desfoque = 0, zoom = 1, retic = true, seletiva = false, dx = 0, dy = 0 } = o;
  const s = Math.max(w / img.width, h / img.height) * zoom, iw = img.width * s, ih = img.height * s;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  if (desfoque) ctx.filter = `blur(${desfoque}px)`;
  ctx.drawImage(_processar(img, pb, seletiva), x + (w - iw) / 2 + dx, y + (h - ih) / 2 + dy, iw, ih);
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

// ======================================================================
// Elementos de reportagem
// ======================================================================

// legenda da narração (registro Arquivo): linha atual, palavras surgindo no tempo da fala.
// linhas = TEMPOS.legendas [{t0, t1, p:[[palavra, t]]}]
// o.cx desloca o centro (margem segura: no Reels os botões ocupam a borda direita)
function legenda(ctx, linhas, t, y = 1450, o = {}) {
  const l = linhas.find(l => t >= l.t0 - 0.05 && t < l.t1);
  if (!l) return;
  const sai = clamp((l.t1 - t) / 0.15);
  ctx.save(); ctx.globalAlpha = sai;
  palavras(ctx, l.p.map(([w, t0]) => [w, t0 - 0.08]), t, o.cx ?? ctx.canvas.width / 2, y,
    { tam: 66, cor: COR.tinta, espaco: 0.28, ...o });
  ctx.restore();
}

// crédito de foto/fonte, datilografado pequeno no canto
function credito(ctx, txt, p, x = 60, y = 1820, cor = COR.tinta) {
  if (p <= 0) return;
  texto(ctx, datilografar(txt, p * 2), x, y, { familia: FONTE.maquina, peso: 400, tam: 28, cor });
}

// gota d'água
function gota(ctx, cx, cy, r, cor = COR.azul) {
  ctx.save(); ctx.fillStyle = cor; ctx.beginPath();
  ctx.moveTo(cx, cy - r * 1.6);
  ctx.bezierCurveTo(cx + r * 0.2, cy - r, cx + r, cy - r * 0.4, cx + r, cy + r * 0.15);
  ctx.arc(cx, cy + r * 0.15, r, 0, Math.PI);
  ctx.bezierCurveTo(cx - r, cy - r * 0.4, cx - r * 0.2, cy - r, cx, cy - r * 1.6);
  ctx.fill(); ctx.restore();
}

// urna eletrônica estilizada (traço de gravura)
function urna(ctx, cx, cy, esc = 1, cor = COR.tinta, fundo = COR.bege) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(esc, esc);
  ctx.fillStyle = cor; ctx.fillRect(-210, -120, 420, 260);
  ctx.fillStyle = fundo; ctx.fillRect(-180, -90, 190, 130);                  // tela
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) ctx.fillRect(40 + i * 46, -90 + j * 46, 34, 34);  // teclado
  ctx.fillStyle = COR.vermelho; ctx.fillRect(-180, 60, 190, 50);
  texto(ctx, 'VOTO', -85, 98, { familia: FONTE.grotesca, peso: 700, tam: 38, cor: fundo, alinhar: 'center' });
  ctx.restore();
}

// forma de onda de áudio (gravação), barras verticais pulsando
function ondaSonora(ctx, cx, cy, largura, altura, t, cor = COR.vermelho, n = 48) {
  const bw = largura / n, r = rng(11);
  ctx.save(); ctx.fillStyle = cor;
  for (let i = 0; i < n; i++) {
    const base = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.37 + r() * 3));
    const v = base * (0.35 + 0.65 * Math.abs(Math.sin(t * 9 + i * 0.8 + r() * 6)));
    const h = Math.max(6, altura * v);
    ctx.fillRect(cx - largura / 2 + i * bw + bw * 0.2, cy - h / 2, bw * 0.6, h);
  }
  ctx.restore();
}

// estrada em perspectiva com faixa central andando
function estrada(ctx, t, cor = COR.tinta, faixa = COR.amarelo) {
  const { width: w, height: h } = ctx.canvas, hz = h * 0.42;
  ctx.save(); ctx.fillStyle = cor; ctx.beginPath();
  ctx.moveTo(w / 2 - 30, hz); ctx.lineTo(w / 2 + 30, hz); ctx.lineTo(w * 1.1, h); ctx.lineTo(-w * 0.1, h); ctx.fill();
  ctx.fillStyle = faixa;
  for (let k = 0; k < 9; k++) {
    const f = ((k + (t * 0.9) % 1) / 9), y1 = hz + (h - hz) * f * f, y2 = hz + (h - hz) * Math.pow(f + 0.05, 2);
    const w1 = 4 + 30 * f;
    ctx.beginPath(); ctx.moveTo(w / 2 - w1 / 2, y1); ctx.lineTo(w / 2 + w1 / 2, y1);
    ctx.lineTo(w / 2 + w1 * 0.6, y2); ctx.lineTo(w / 2 - w1 * 0.6, y2); ctx.fill();
  }
  ctx.restore();
}

// ======================================================================
// Modo TENSO — sangue, choque, tremor
// ======================================================================

// sangue escorrendo de uma borda horizontal (y). p 0→1 = comprimento das gotas.
function escorrer(ctx, x, y, w, p, cor = COR.vermelho, seed = 1, comprimento = 260) {
  if (p <= 0) return;
  const r = rng(seed), n = Math.max(3, Math.floor(w / 46));
  ctx.save(); ctx.fillStyle = cor;
  for (let i = 0; i < n; i++) {
    const cx = x + (i + 0.2 + r() * 0.6) * (w / n), lw = 6 + r() * 16;
    const len = comprimento * (0.25 + r() * 0.95) * ease.saida(clamp(p * (0.8 + r() * 0.5)));
    ctx.fillRect(cx - lw / 2, y - 2, lw, len);
    ctx.beginPath(); ctx.arc(cx, y + len, lw * 0.75, 0, 7); ctx.fill();
  }
  ctx.restore();
}

// respingo de sangue: mancha central + gotas espalhadas
function respingo(ctx, cx, cy, raio, p = 1, cor = COR.vermelho, seed = 3) {
  if (p <= 0) return;
  const r = rng(seed), e = ease.saida(clamp(p * 1.6));
  ctx.save(); ctx.fillStyle = cor;
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const a = i / 24 * Math.PI * 2, rr = raio * (0.7 + r() * 0.5) * e;
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.fill();
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2, d = raio * (1 + r() * 2.2) * e, s = raio * (0.03 + r() * 0.12);
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, s, 0, 7); ctx.fill();
  }
  ctx.restore();
}

// clarão de cor na tela inteira, decai rápido depois de t0
function flash(ctx, t, t0, cor = COR.vermelho, dur = 0.25, forca = 0.55) {
  const k = (t - t0) / dur;
  if (k < 0 || k > 1) return;
  ctx.save(); ctx.globalAlpha = forca * (1 - k) * (1 - k); ctx.fillStyle = cor;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore();
}

// tremor de câmera depois de um impacto: devolve {dx, dy}
function tremor(t, impactos, forca = 22, dur = 0.35) {
  let dx = 0, dy = 0;
  for (const t0 of impactos) {
    const k = (t - t0) / dur;
    if (k >= 0 && k < 1) {
      const r = rng(Math.floor(t * 60) + 13);
      dx += (r() - 0.5) * 2 * forca * (1 - k); dy += (r() - 0.5) * 2 * forca * (1 - k);
    }
  }
  return { dx, dy };
}

// imagem centralizada com largura dada (logos)
function imagem(ctx, img, cx, cy, largura, alfa = 1) {
  const h = largura * img.height / img.width;
  ctx.save(); ctx.globalAlpha = alfa; ctx.drawImage(img, cx - largura / 2, cy - h / 2, largura, h); ctx.restore();
}

// ======================================================================
// CAPA — cartaz de propaganda soviética (modelo fixo das capas de Reels)
// ======================================================================

// foice e martelo no desenho da bandeira soviética (caixa ~100x100 centrada em cx,cy):
// lâmina da foice abre para a direita, com a ponta no alto e o cabo saindo embaixo à esquerda;
// martelo cruzando em diagonal, cabeça no alto à esquerda e cabo descendo para a direita.
function foiceMartelo(ctx, cx, cy, s, cor = COR.amarelo) {
  const g = Math.PI / 180;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s / 100, s / 100); ctx.fillStyle = cor;
  // lâmina: crescente que afina até a ponta (círculo interno deslocado na direção da ponta)
  ctx.beginPath();
  ctx.arc(0, 0, 50, -115 * g, 130 * g, false);
  ctx.arc(-3.4, -7.25, 42, 130 * g, -115 * g, true);
  ctx.closePath(); ctx.fill();
  // cabo da foice
  ctx.save(); ctx.translate(-29, 33); ctx.rotate(37 * g); ctx.fillRect(-6, -2, 12, 30); ctx.restore();
  // martelo
  ctx.save(); ctx.rotate(45 * g);
  ctx.fillRect(-35, -6, 92, 12);                 // cabo (de cima-esquerda para baixo-direita)
  ctx.fillRect(-46, -26, 18, 52);                // cabeça, perpendicular ao cabo
  ctx.restore();
  ctx.restore();
}

// estrela vazada (contorno dourado), como na bandeira soviética
function estrelaContorno(ctx, cx, cy, r, cor = COR.amarelo, espessura = r * 0.16) {
  ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = cor; ctx.lineWidth = espessura; ctx.lineJoin = 'miter'; ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.40 : r, a = -Math.PI / 2 + i * Math.PI / 5;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.stroke(); ctx.restore();
}

// bandeira grande tremulando (tecido com dobras), presa no canto superior esquerdo
function bandeiraCartaz(ctx, x, y, w, h, cor = COR.vermelho, sombra = COR.vermelhoEscuro) {
  const borda = (k, amp) => Math.sin(k * 5.5) * amp + Math.sin(k * 13 + 1) * amp * 0.25;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(x, y);
  for (let i = 0; i <= 40; i++) { const k = i / 40; ctx.lineTo(x + w * k, y + borda(k, 40) * k); }
  for (let i = 0; i <= 40; i++) { const k = i / 40; ctx.lineTo(x + w + borda(k, 50), y + h * k); }
  for (let i = 40; i >= 0; i--) { const k = i / 40; ctx.lineTo(x + w * k, y + h + borda(k + 0.3, 55) * k); }
  ctx.closePath(); ctx.fillStyle = cor; ctx.fill(); ctx.clip();
  // dobras: faixas diagonais escuras e claras, borradas como guache
  ctx.filter = 'blur(18px)';
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 ? sombra : 'rgba(255,90,60,0.25)';
    ctx.beginPath(); const x0 = x + w * (0.15 + i * 0.16);
    ctx.moveTo(x0, y - 50); ctx.lineTo(x0 + 70, y - 50); ctx.lineTo(x0 - 160, y + h + 80); ctx.lineTo(x0 - 240, y + h + 80); ctx.fill();
  }
  ctx.filter = 'none'; ctx.restore();
}

// brasa/fumaça vermelha no escuro (canto inferior do cartaz)
function brasa(ctx, x, y, w, h, seed = 5) {
  const r = rng(seed);
  ctx.save(); ctx.filter = 'blur(26px)';
  for (let i = 0; i < 26; i++) {
    ctx.fillStyle = `rgba(${150 + r() * 60},${20 + r() * 25},20,${0.15 + r() * 0.25})`;
    ctx.beginPath(); ctx.ellipse(x + r() * w, y + h * (0.3 + r() * 0.7), 40 + r() * 120, 60 + r() * 160, 0, 0, 7); ctx.fill();
  }
  ctx.filter = 'none'; ctx.restore();
}

// capa completa. cfg = { figura: img, logo: img, linhas: ['PROTEJAM OS', 'NOSSOS POVOS'], destaque: 'INDÍGENAS!',
//   credito: 'Na foto: ...', alturaFigura: 1350, yFigura: 560 }
function capaSovietica(ctx, cfg) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  fundo(ctx, COR.carvao);
  brasa(ctx, 0, H * 0.45, W, H * 0.55, 9);
  bandeiraCartaz(ctx, -80, 420, 840, 920);
  estrela(ctx, 175, 560, 50, 0, COR.amarelo);
  foiceMartelo(ctx, 185, 760, 125, COR.amarelo);

  // figura heroica (ilustração), com sombra de tinta
  const f = cfg.figura, hF = cfg.alturaFigura || 1520, wF = f.width * hF / f.height, yF = cfg.yFigura || 420;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetX = -14;
  ctx.drawImage(f, W / 2 - wF / 2 + (cfg.dxFigura || 60), yF, wF, hF); ctx.restore();

  // topo escuro com o logo
  const topo = ctx.createLinearGradient(0, 0, 0, 380);
  topo.addColorStop(0, COR.carvao); topo.addColorStop(1, 'rgba(15,12,11,0)');
  ctx.fillStyle = topo; ctx.fillRect(0, 0, W, 380);
  imagem(ctx, cfg.logo, W / 2, 270, 340);

  // título em escada inclinada, letras com sombra de tinta (como os cartazes)
  const base = ctx.createLinearGradient(0, H * 0.62, 0, H);
  base.addColorStop(0, 'rgba(15,12,11,0)'); base.addColorStop(0.45, 'rgba(15,12,11,0.85)'); base.addColorStop(1, COR.carvao);
  ctx.fillStyle = base; ctx.fillRect(0, H * 0.62, W, H * 0.38);
  ctx.save(); ctx.translate(70, 1380); ctx.rotate(-0.09);
  const tam = ajustar(ctx, cfg.linhas.reduce((a, b) => (a.length > b.length ? a : b)), FONTE.manchete, W - 260);
  cfg.linhas.forEach((l, i) => texto(ctx, l, i * 34, i * tam * 0.88, { tam, cor: COR.bege, erro: COR.tinta, desloc: 7 }));
  const yD = cfg.linhas.length * tam * 0.88 + 30;
  const tD = ajustar(ctx, cfg.destaque, FONTE.bloco, W - 200, 400);
  texto(ctx, cfg.destaque, cfg.linhas.length * 34, yD + tD * 0.25, { familia: FONTE.bloco, peso: 400, tam: tD, cor: COR.amarelo,
    erro: COR.vermelhoEscuro, desloc: 8 });
  ctx.restore();

  if (cfg.credito) texto(ctx, cfg.credito, W / 2, H - 50, { familia: FONTE.maquina, peso: 400, cor: COR.begeEscuro, alinhar: 'center',
    tam: Math.min(22, ajustar(ctx, cfg.credito, FONTE.maquina, W - 80, 400)) });
  papel(ctx, 1, 0.16); vinheta(ctx, 0.5);
}

// capa a partir de uma ARTE PRONTA (ilustração horizontal fornecida): mantém proporção, sem cortar a figura.
// cfg = { arte, logo, linhas, destaque, credito, figuraX: [x0, x1] (limites da figura na arte, px), escala }
function capaComArte(ctx, cfg) {
  const W = ctx.canvas.width, H = ctx.canvas.height, a = cfg.arte;
  const [fx0, fx1] = cfg.figuraX || [0, a.width];
  const esc = cfg.escala || Math.min((W - 120) / (fx1 - fx0), H / a.height);
  const aw = a.width * esc, ah = a.height * esc, ax = W / 2 - ((fx0 + fx1) / 2) * esc, ay = H - ah;

  // fundo: a própria textura vermelha da arte (canto sem figura), em ladrilhos espelhados acima dela
  const amostra = { x: 20, y: 60, w: 300, h: 300 };
  fundo(ctx, cfg.corFundo || '#D3140A');
  for (let y = 0, k = 0; y < ay + 40; y += amostra.h * esc, k++)
    for (let x = 0, j = 0; x < W; x += amostra.w * esc, j++) {
      ctx.save(); ctx.translate(x + (j % 2 ? amostra.w * esc : 0), y + (k % 2 ? amostra.h * esc : 0));
      ctx.scale(j % 2 ? -1 : 1, k % 2 ? -1 : 1);
      ctx.drawImage(a, amostra.x, amostra.y, amostra.w, amostra.h, 0, 0, amostra.w * esc, amostra.h * esc);
      ctx.restore();
    }

  // arte com a borda de cima esfumada na textura (sem emenda visível)
  const c = document.createElement('canvas'); c.width = W; c.height = Math.ceil(ah);
  const g = c.getContext('2d'); g.drawImage(a, ax, 0, aw, ah);
  // destination-in apaga tudo fora da forma desenhada: a máscara cobre a altura inteira
  const m = g.createLinearGradient(0, 0, 0, ah); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(90 / ah, 'rgba(0,0,0,1)');
  m.addColorStop(1, 'rgba(0,0,0,1)');
  g.globalCompositeOperation = 'destination-in'; g.fillStyle = m; g.fillRect(0, 0, W, ah);
  ctx.drawImage(c, 0, ay);

  imagem(ctx, cfg.logo, W / 2, 285, 330);
  const t1 = ajustar(ctx, cfg.linhas.join(' '), FONTE.manchete, W - 140);
  texto(ctx, cfg.linhas.join(' '), W / 2, ay - 250, { tam: t1, cor: COR.bege, alinhar: 'center', erro: COR.tinta, desloc: 5 });
  const t2 = ajustar(ctx, cfg.destaque, FONTE.bloco, W - 160, 400);
  texto(ctx, cfg.destaque, W / 2, ay - 70, { familia: FONTE.bloco, peso: 400, tam: t2, cor: COR.amarelo, alinhar: 'center',
    erro: COR.tinta, desloc: 8 });

  if (cfg.credito) {
    const base = ctx.createLinearGradient(0, H - 130, 0, H);
    base.addColorStop(0, 'rgba(15,12,11,0)'); base.addColorStop(1, 'rgba(15,12,11,0.75)');
    ctx.fillStyle = base; ctx.fillRect(0, H - 130, W, 130);
    texto(ctx, cfg.credito, W / 2, H - 40, { familia: FONTE.maquina, peso: 400, cor: COR.bege, alinhar: 'center',
      tam: Math.min(22, ajustar(ctx, cfg.credito, FONTE.maquina, W - 80, 400)) });
  }
  papel(ctx, 1, 0.1); vinheta(ctx, 0.35);
}

// vela acesa com chama tremulando
function vela(ctx, x, y, h, t, seed = 1, cor = COR.bege) {
  const r = rng(seed), f = Math.sin(t * 11 + seed) * 0.12 + Math.sin(t * 23 + seed * 3) * 0.06;
  ctx.save();
  ctx.fillStyle = cor; ctx.fillRect(x - 14, y - h, 28, h);
  const gl = ctx.createRadialGradient(x, y - h - 30, 4, x, y - h - 30, 120);
  gl.addColorStop(0, 'rgba(235,181,42,0.45)'); gl.addColorStop(1, 'rgba(235,181,42,0)');
  ctx.fillStyle = gl; ctx.fillRect(x - 120, y - h - 150, 240, 240);
  ctx.translate(x, y - h - 4); ctx.rotate(f);
  ctx.fillStyle = COR.amarelo; ctx.beginPath(); ctx.ellipse(0, -26, 12 + r() * 2, 30, 0, 0, 7); ctx.fill();
  ctx.fillStyle = COR.vermelho; ctx.beginPath(); ctx.ellipse(0, -16, 5, 14, 0, 0, 7); ctx.fill();
  ctx.restore();
}

window.CT = { COR, FONTE, clamp, seg, lerp, ease, emDois, rng, fundo, papel, vinheta, reticula,
  raios, estrela, bandeira, mastro, corteDiagonal, fonte, ajustar, texto, carimbo, aplicarCarimbo, datilografar,
  varredura, camera, palavras, revelarLetras, selecao, etiqueta, ondas, sinal, planta, foto, moldura,
  legenda, credito, gota, urna, ondaSonora, estrada, escorrer, respingo, flash, tremor, imagem,
  foiceMartelo, estrelaContorno, bandeiraCartaz, brasa, capaSovietica, capaComArte, vela, img: {} };
