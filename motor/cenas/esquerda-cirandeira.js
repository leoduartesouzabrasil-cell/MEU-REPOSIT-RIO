// "Esquerda cirandeira" — a ciranda explica o termo, a régua mostra quem é quem, o circo fecha a crítica.
// PRÉVIA sem narração (tempos estimados). Com a narração, os tempos de T vêm de esquerda-cirandeira.tempos.js.
// Render: node motor/render.js esquerda-cirandeira saida/cirandeira.mp4 --audio audio/esquerda-cirandeira/previa.wav
//
// DIAGRAMAÇÃO PADRÃO: título y 330 · fonte dos dados y 384 · conteúdo x 120–960, y 420–1420 · legenda (tarja) y 1466–1542
const T = Object.assign({
  titulo: 0.3, origem: 3.6, meme: 7.4, hoje: 9.4, migalhas: 12.0,
  regua: 15.0, p1: 15.8, p2: 17.1, p3: 18.6, p4: 19.9, p5: 21.2, p6: 22.5, p7: 23.8, p8: 25.4, p9: 26.9, p10: 28.6,
  p11: 30.3, p12: 31.9, p13: 33.2, p14: 34.5, p15: 35.9, visao: 37.6,
  circo: 40.0, plateia: 43.0, palhaco: 45.0, acabar: 48.0, radical: 50.4, comente: 52.8, logo: 55.6, dur: 59.0,
}, (window.TEMPOS || {}).marcas || {});

// faixas da régua (esquerda → direita)
const FAIXAS = [['ESQUERDA RADICALIZADA', '#8A1411'], ['ESQUERDA', '#C8201E'], ['CENTRO', '#EBB52A'], ['DIREITA', '#4A6488'], ['EXTREMA-DIREITA', '#1F3A5F']];
// a régua: nome, foto, faixa, etiqueta e enquadramento MANUAL [centro x, centro y, lado da janela] (centro em fração da foto,
// lado em fração da ALTURA da foto). Cada um foi ajustado à mão: rosto inteiro com ombros, sem estourar a borda da foto.
const REGUA = [
  ['JONES MANOEL', 'jones', 0, 'QUER TROCAR A MÚSICA', [0.5, 0.4, 0.7]],
  ['ELIAS JABBOUR', 'jabbour', 0, 'QUER TROCAR A MÚSICA', [0.48, 0.33, 0.4]],
  ['ERIKA HILTON', 'erika', 1, 'DERRUBOU A 6x1', [0.36, 0.55, 0.9]],
  ['RICK AZEVEDO', 'rick', 1, 'DERRUBOU A 6x1', [0.5, 0.46, 0.74]],
  ['DILMA ROUSSEFF', 'dilma', 1, 'BANCO DO BRICS', [0.5, 0.5, 0.95]],
  ['LULA', 'lula', 1, 'O DONO DA RODA', [0.54, 0.4, 0.62]],
  ['ANDRÉ JANONES', 'janones', 1, 'EXÉRCITO DO LULA', [0.5, 0.48, 0.95]],
  ['GERALDO ALCKMIN', 'alckmin', 2, 'EX-PSDB', [0.82, 0.74, 0.5]],
  ['CIRO GOMES', 'ciro', 2, 'FOI PRO PSDB + PL', [0.5, 0.45, 0.7]],
  ['DAVI ALCOLUMBRE', 'alcolumbre', 2, 'DANÇA COM TODO GOVERNO', [0.48, 0.48, 0.75]],
  ['RENAN SANTOS', 'renan', 3, 'MBL', [0.58, 0.45, 0.78]],
  ['NIKOLAS FERREIRA', 'nikolas', 4, '3,1 MI DE VOTOS', [0.5, 0.3, 0.42]],
  ['LUCAS PAVANATO', 'pavanato', 4, '3 MI DE VOTOS', [0.5, 0.45, 0.7]],
  ['FLÁVIO BOLSONARO', 'flavio', 4, 'PERDEU O 2º TURNO', [0.47, 0.43, 0.42]],
  ['JAIR BOLSONARO', 'bolsonaro', 4, 'NO FIM DA FILA', [0.377, 0.49, 0.5]],
];
const M = '../midia/esquerda-cirandeira/';

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: T.dur,
  imagens: {
    jones: M + 'jones-2026-tse.jpg', jabbour: M + 'jabbour-2025.jpg', erika: M + 'erika-2026.jpg', rick: M + 'rick-2026.jpg',
    dilma: M + 'dilma-2026.jpg', lula: M + 'lula-2026.jpg', janones: M + 'janones-2026.jpg', alckmin: M + 'alckmin-2026.jpg',
    ciro: M + 'ciro-2026-tse.jpg', alcolumbre: M + 'alcolumbre-2026.jpg', renan: M + 'renan-2026.jpg', nikolas: M + 'nikolas-2026.jpg',
    pavanato: M + 'pavanato-2026-tse.jpg', flavio: M + 'flavio-2026.jpg', bolsonaro: M + 'bolsonaro-2025.jpg',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease } = L;
    const CX = 540, LARG = 840, X0 = 120, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta;
    let arquivo = true;

    const ordem = [[0, abertura], [T.regua, regua], [T.circo, circo], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [T.origem, T.circo, T.palhaco, T.acabar, T.radical, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 12);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();

    [[T.regua, BEGE, -24], [T.circo, VERM, 24], [T.radical, VERM, -24], [T.logo, BEGE, 24]]
      .forEach(([X, cor, ang]) => L.corteDiagonal(ctx, seg(t, X - 0.4, X), cor, ang));
    if (arquivo) L.varredura(ctx, t, 0.08);
    IMP.forEach(X => L.flash(ctx, t, X, AMA, 0.25, 0.3));
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);
    legenda();

    // ------------------------------------------------ componentes padronizados
    function legenda() {
      const LEG = (window.TEMPOS || {}).legendas;
      const l = LEG && LEG.find(l => t >= l.t0 - 0.05 && t < l.t1);
      if (!l) return;
      const pal = l.p.map(([w, t0]) => [w, t0 - 0.08]), largura = tam => {
        L.fonte(ctx, FONTE.serifa, tam, 400, 'italic');
        return pal.reduce((s, [p]) => s + ctx.measureText(p).width, 0) + tam * 0.28 * (pal.length - 1);
      };
      const tam = Math.min(48, 48 * 760 / largura(48)), w = largura(tam);
      ctx.save(); ctx.globalAlpha = L.clamp((l.t1 - t) / 0.15) * L.clamp((t - l.t0 + 0.05) / 0.12);
      ctx.fillStyle = 'rgba(15,12,11,0.86)'; ctx.fillRect(CX - w / 2 - 26, 1466, w + 52, 76);
      ctx.fillStyle = VERM; ctx.fillRect(CX - w / 2 - 26, 1466, 7, 76);
      L.palavras(ctx, pal, t, CX, 1517, { tam, cor: BEGE, espaco: 0.28, rgb: 0 });
      ctx.restore();
    }
    function tamMax(txt, familia, tam, peso = 700, larg = LARG) { return Math.min(tam, L.ajustar(ctx, txt, familia, larg, peso)); }
    function titulo(txt, p, cor = TINTA) {
      L.texto(ctx, L.datilografar(txt, p), CX, 330, { familia: FONTE.grotesca, peso: 700, tam: tamMax(txt, FONTE.grotesca, 48), cor, alinhar: 'center', rgb: 1.5 });
    }
    function cred(txt, p, cor = TINTA, y = 384) {
      if (p <= 0) return;
      L.texto(ctx, L.datilografar(txt, p * 2), CX, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(txt, FONTE.maquina, 22, 400), cor, alinhar: 'center' });
    }
    function linha(txt, y, p, cor = TINTA, tam = 46) {
      L.texto(ctx, L.datilografar(txt, p), CX, y, { familia: FONTE.grotesca, peso: 700, tam: tamMax(txt, FONTE.grotesca, tam), cor, alinhar: 'center' });
    }
    function bloco(txt, y, cor, tam, fundo) {
      if (fundo) { ctx.fillStyle = fundo[0]; ctx.fillRect(X0, fundo[1], LARG, fundo[2]); }
      L.texto(ctx, txt, CX, y, { familia: FONTE.bloco, peso: 400, tam: tamMax(txt, FONTE.bloco, tam, 400, LARG - 50), cor, alinhar: 'center' });
    }
    // retrato redondo com o enquadramento manual de cada foto (janela quadrada → círculo)
    function retrato(i, cx, cy, r, anel = 8) {
      const [, chave, faixa, , [fx, fy, lado]] = REGUA[i], img = L.img[chave];
      const base = Math.max(2 * r / img.width, 2 * r / img.height), s0 = 2 * r / (lado * img.height), zoom = s0 / base;
      const iw = img.width * s0, ih = img.height * s0;
      ctx.save(); ctx.fillStyle = FAIXAS[faixa][1]; ctx.beginPath(); ctx.arc(cx, cy, r + anel, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();
      L.foto(ctx, img, cx - r, cy - r, 2 * r, 2 * r, { pb: true, zoom, dx: (0.5 - fx) * iw, dy: (0.5 - fy) * ih, retic: false });
      ctx.restore();
    }

    // bonequinho de ciranda (silhueta): cabeça + corpo, braços abertos para dar as mãos
    function boneco(x, y, cor, esc = 1) {
      ctx.save(); ctx.translate(x, y); ctx.scale(esc, esc); ctx.fillStyle = cor;
      ctx.beginPath(); ctx.arc(0, -52, 26, 0, 7); ctx.fill(); ctx.fillRect(-20, -26, 40, 70);
      ctx.restore();
    }

    // ------------------------------------------------ A. a ciranda explica o termo (sem fotos de ninguém)
    // faixas fixas, nada sobreposto: título 420–640 · roda 690–1210 · etiquetas y 1290 · frase y 1385
    function abertura(lt, t) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.006 }, () => L.planta(ctx, 61, TINTA, 0.07));
      const n = 12, R = 190, cy = 960, rot = lt * 0.35, hoje = t >= T.hoje;
      ctx.save(); ctx.globalAlpha = 0.95 * ease.saida(seg(lt, 0, 0.8));
      ctx.strokeStyle = TINTA; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(CX, cy, R, 0, 7); ctx.stroke();
      for (let k = 0; k < n; k++) {
        const a = rot + k * 2 * Math.PI / n, x = CX + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        // a partir de "hoje": metade da roda vira centrão (azul-acinzentado) e mercado (ocre), de mãos dadas com a esquerda
        const cor = !hoje ? (k % 2 ? VERM : TINTA) : k < 6 ? VERM : k < 9 ? '#4A6488' : '#B98516';
        boneco(x, y, cor, 0.85);
      }
      ctx.restore();
      L.aplicarCarimbo(ctx, seg(t, T.titulo, T.titulo + 0.3), CX, 520, () => {
        L.texto(ctx, 'ESQUERDA', CX, 500, { familia: FONTE.bloco, peso: 400, tam: 84, cor: TINTA, alinhar: 'center' });
        L.texto(ctx, 'CIRANDEIRA?', CX, 630, { tam: Math.min(150, L.ajustar(ctx, 'CIRANDEIRA?', FONTE.manchete, LARG)), cor: VERM, alinhar: 'center', erro: TINTA, desloc: 7 });
      }, 101);
      if (t >= T.origem) cred('fonte: data_labe · Jornal Extra AL (out/2026)', seg(t, T.origem + 0.5, T.origem + 1.5));
      if (t >= T.origem && !hoje) {
        L.aplicarCarimbo(ctx, seg(t, T.origem, T.origem + 0.3), CX, cy, () => {
          ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(CX, cy, 110, 0, 7); ctx.fill();
          L.texto(ctx, '2016', CX, cy + 34, { tam: 100, cor: AMA, alinhar: 'center' });
        }, 103);
        L.etiqueta(ctx, 'VIROU MEME', CX, 1290, seg(t, T.meme, T.meme + 0.3), { cor: VERM, corTexto: BEGE, tam: 38 });
        linha('ATO CONTRA O IMPEACHMENT: PCO × CIRANDA DO PSOL', 1385, seg(t, T.origem + 0.5, T.origem + 1.6), TINTA, 34);
      }
      if (hoje) {
        [['ESQUERDA', 250, VERM, BEGE], ['CENTRÃO', 540, '#4A6488', BEGE], ['MERCADO', 830, '#B98516', TINTA]].forEach(([s, x, cor, ct], k) =>
          L.etiqueta(ctx, s, x, 1290, seg(t, T.hoje + k * 0.4, T.hoje + 0.3 + k * 0.4), { cor, corTexto: ct, tam: 34 }));
        if (t < T.migalhas) linha('DE MÃOS DADAS COM O CENTRÃO E O MERCADO', 1385, seg(t, T.hoje + 0.4, T.hoje + 1.4), TINTA, 36);
        else {
          for (let k = 0; k < 10; k++) {                                            // migalhas caindo no meio da roda
            const q = seg(t, T.migalhas + k * 0.1, T.migalhas + 0.6 + k * 0.1);
            ctx.fillStyle = '#B98516'; ctx.fillRect(CX - 90 + (k * 37) % 180, lerp(860, 1030, ease.saida(q)), 11, 9);
          }
          linha('…E MIGALHAS PRO POVO NÃO SE REVOLTAR', 1385, seg(t, T.migalhas, T.migalhas + 1.0), VERM, 36);
        }
      }
    }

    // ------------------------------------------------ B. a régua: as fotos passam da esquerda radicalizada à extrema-direita
    function regua(lt, t) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.002 }, () => L.planta(ctx, 63, TINTA, 0.06));
      titulo('A RÉGUA', seg(lt, 0, 0.5));
      cred('fotos: Agência Brasil · Câmara dos Deputados · TSE · Wikimedia Commons (créditos no final)', seg(lt, 0.5, 1.5));
      const marcas = REGUA.map((_, i) => T['p' + (i + 1)]), n = marcas.filter(x => t >= x).length, atual = Math.max(0, n - 1);
      const ESP = 350, wx = i => i * ESP;                                          // posição de cada pessoa no "mundo" da régua
      // câmera: segue quem acabou de entrar; na visão geral, recua para mostrar a régua inteira
      const alvo = k => wx(k), ant = Math.max(0, atual - 1);
      let camX = lerp(alvo(ant), alvo(atual), ease.saida(seg(t, marcas[atual], marcas[atual] + 0.6)));
      const v = ease.saida(seg(t, T.visao, T.visao + 1.4)), total = wx(14);
      camX = lerp(camX, total / 2, v);
      const esc = lerp(1, 860 / (total + 300), v), yR = lerp(1160, 980, v);       // escala do mundo (1 = de perto)
      const X = wx0 => CX + (wx0 - camX) * esc;
      // a barra: cada trecho na cor da faixa de quem está ali
      REGUA.forEach(([, , faixa], i) => {
        const x0 = X(wx(i) - ESP / 2), x1 = X(wx(i) + ESP / 2);
        ctx.fillStyle = FAIXAS[faixa][1]; ctx.fillRect(x0, yR, x1 - x0 + 1, 34 * lerp(1, 0.7, v));
      });
      // nome de cada faixa, escrito sobre o começo do seu trecho
      FAIXAS.forEach(([nome], f) => {
        const i0 = REGUA.findIndex(r => r[2] === f), i1 = REGUA.length - 1 - [...REGUA].reverse().findIndex(r => r[2] === f);
        const xm = X((wx(i0) + wx(i1)) / 2);
        L.texto(ctx, nome, xm, yR + 74 * lerp(1, 0.6, v), { familia: FONTE.grotesca, peso: 700, tam: lerp(34, 15, v), cor: FAIXAS[f][1] === '#EBB52A' ? '#9A6F0E' : FAIXAS[f][1], alinhar: 'center' });
      });
      // as fotos em cima da régua
      REGUA.forEach(([nome, , faixa, etq], i) => {
        const p = ease.saida(seg(t, marcas[i], marcas[i] + 0.45));
        if (p <= 0) return;
        const x = X(wx(i)), r = lerp(118, 24, v), y = yR - lerp(300, 60, v) + (1 - p) * 60;
        if (x < -150 || x > 1230) return;
        ctx.save(); ctx.globalAlpha = Math.min(1, p * 2);
        ctx.strokeStyle = TINTA; ctx.lineWidth = lerp(5, 2, v); ctx.beginPath(); ctx.moveTo(x, y + r); ctx.lineTo(x, yR); ctx.stroke();  // haste até a régua
        retrato(i, x, y, r, lerp(9, 3, v));
        if (v < 0.5) {
          ctx.globalAlpha = Math.min(1, p * 2) * (1 - v * 2);
          L.texto(ctx, nome, x, y - r - 30, { familia: FONTE.bloco, peso: 400, tam: tamMax(nome, FONTE.bloco, 34, 400, 310), cor: TINTA, alinhar: 'center' });
          if (i === atual) L.etiqueta(ctx, etq, x, y - r - 110, seg(t, marcas[i] + 0.3, marcas[i] + 0.6), { cor: FAIXAS[faixa][1], corTexto: faixa === 2 ? TINTA : BEGE, tam: tamMax(etq, FONTE.grotesca, 28, 700, 360) });
        }
        ctx.restore();
      });
      // faixa atual em destaque, acima de tudo
      if (n > 0 && v < 0.5) {
        const [nomeF, corF] = FAIXAS[REGUA[atual][2]];
        L.etiqueta(ctx, nomeF, CX, 1350, 1, { cor: corF, corTexto: REGUA[atual][2] === 2 ? TINTA : BEGE, tam: 40 });
      }
      if (v > 0.5) linha('DA ESQUERDA RADICALIZADA À EXTREMA-DIREITA', 1150, seg(t, T.visao + 0.8, T.visao + 1.6), TINTA, 38);
    }

    // ------------------------------------------------ C. o circo
    function circo(lt, t) {
      arquivo = false;
      if (t < T.radical) {
        L.fundo(ctx, '#2A1410');
        // lona listrada em leque, vista de dentro
        const n = 18;
        for (let k = 0; k < n; k++) {
          const a0 = k * Math.PI / n, a1 = a0 + Math.PI / n;                              // leque descendo do mastro central
          ctx.fillStyle = k % 2 ? VERM : BEGE; ctx.beginPath(); ctx.moveTo(CX, 140);
          ctx.lineTo(CX + Math.cos(a0) * 2200, 140 + Math.sin(a0) * 2200); ctx.lineTo(CX + Math.cos(a1) * 2200, 140 + Math.sin(a1) * 2200); ctx.fill();
        }
        // picadeiro + holofotes
        ctx.fillStyle = 'rgba(15,12,11,0.62)'; ctx.fillRect(0, 0, 1080, 1920);
        const fo = Math.sin(t * 1.3) * 120;
        [[200 + fo, AMA], [880 - fo, AMA]].forEach(([x, cor]) => {
          const g = ctx.createLinearGradient(0, 250, 0, 1150); g.addColorStop(0, 'rgba(235,181,42,0.45)'); g.addColorStop(1, 'rgba(235,181,42,0.05)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, 250); ctx.lineTo(CX - 230, 1150); ctx.lineTo(CX + 230, 1150); ctx.fill();
        });
        ctx.fillStyle = VERM; ctx.beginPath(); ctx.ellipse(CX, 1150, 380, 90, 0, 0, 7); ctx.fill();
        ctx.fillStyle = BEGE; ctx.beginPath(); ctx.ellipse(CX, 1150, 340, 70, 0, 0, 7); ctx.fill();
        L.aplicarCarimbo(ctx, seg(t, T.circo + 0.2, T.circo + 0.5), CX, 560, () => {
          L.texto(ctx, 'A POLÍTICA VIROU', CX, 520, { familia: FONTE.bloco, peso: 400, tam: tamMax('A POLÍTICA VIROU', FONTE.bloco, 80, 400), cor: BEGE, alinhar: 'center' });
          L.texto(ctx, 'UM GRANDE CIRCO.', CX, 660, { tam: L.ajustar(ctx, 'UM GRANDE CIRCO.', FONTE.manchete, LARG), cor: AMA, alinhar: 'center', erro: TINTA, desloc: 7 });
        }, 131);
        // plateia: fileiras de cabeças; no "palhaço", nariz vermelho em todo mundo
        if (t >= T.plateia) {
          const pe = ease.saida(seg(t, T.plateia, T.plateia + 0.6));
          for (let fila = 0; fila < 3; fila++) for (let k = 0; k < 9; k++) {
            const x = 80 + k * 115 + (fila % 2) * 55, y = 1250 + fila * 64 + (1 - pe) * 200;
            ctx.fillStyle = ['#6B4A3E', '#563A30', '#3F2A23'][fila]; ctx.beginPath(); ctx.arc(x, y, 32, 0, 7); ctx.fill(); ctx.fillRect(x - 38, y + 24, 76, 56);
            const pn = seg(t, T.palhaco + (k + fila) * 0.04, T.palhaco + 0.2 + (k + fila) * 0.04);
            if (pn > 0) { ctx.fillStyle = VERM; ctx.beginPath(); ctx.arc(x, y + 4, 11 * ease.carimbo(pn), 0, 7); ctx.fill(); }
          }
          linha('SOMOS A PLATEIA…', 820, seg(t, T.plateia, T.plateia + 0.8), BEGE, 56);
          if (t >= T.palhaco) L.aplicarCarimbo(ctx, seg(t, T.palhaco, T.palhaco + 0.3), CX, 900, () =>
            L.texto(ctx, '…OU OS PALHAÇOS?', CX, 940, { familia: FONTE.bloco, peso: 400, tam: tamMax('…OU OS PALHAÇOS?', FONTE.bloco, 84, 400), cor: VERM, alinhar: 'center', erro: BEGE, desloc: 4 }), 133);
        }
        if (t >= T.acabar) {                                                         // a lona rasga: chega de ciranda
          const pa = seg(t, T.acabar, T.acabar + 0.3);
          ctx.fillStyle = `rgba(15,12,11,${0.75 * pa})`; ctx.fillRect(0, 0, 1080, 1920);
          L.aplicarCarimbo(ctx, pa, CX, 760, () => bloco('CHEGA DE CIRANDA.', 800, BEGE, 110, [VERM, 680, 180]), 135);
        }
      } else {
        // radicalizar: bandeira vermelha com estrela, foice e martelo
        L.fundo(ctx, COR.carvao);
        L.raios(ctx, CX, 1900, 2300, 24, -0.4 + L.emDois(t) * 0.06, 'rgba(200,32,30,0.28)');
        const fx = 170, fy = 840, fw = 760, fh = 440;
        L.mastro(ctx, fx, fy - 10, 1700, BEGE);
        for (let i = 0, n2 = 90; i < n2; i++) {
          const kk = i / n2, ond = Math.sin(kk * 7 - t * 5) * 22 * kk, luz = Math.cos(kk * 7 - t * 5);
          const m = L.clamp(0.5 - luz * 0.5) * 0.55;
          ctx.fillStyle = `rgb(${lerp(200, 138, m) | 0},${lerp(32, 20, m) | 0},${lerp(30, 17, m) | 0})`;
          ctx.fillRect(fx + 9 + kk * fw, fy + ond, fw / n2 + 1, fh * (1 - kk * 0.12));
        }
        const k = 0.17, onda = Math.sin(k * 7 - t * 5) * 22 * k;
        L.estrelaContorno(ctx, fx + 9 + fw * k, fy + 66 + onda, 38, AMA);
        L.foiceMartelo(ctx, fx + 9 + fw * k + 4, fy + 195 + onda, 140, AMA);
        L.aplicarCarimbo(ctx, seg(t, T.radical, T.radical + 0.3), CX, 560, () =>
          L.texto(ctx, 'RADICALIZE-SE.', CX, 600, { tam: L.ajustar(ctx, 'RADICALIZE-SE.', FONTE.manchete, LARG), cor: BEGE, alinhar: 'center', erro: VERM, desloc: 7 }), 137);
        if (t >= T.comente) L.aplicarCarimbo(ctx, seg(t, T.comente, T.comente + 0.3), CX, 700, () =>
          bloco('DE QUE LADO DA RÉGUA VOCÊ ESTÁ?', 730, VERM, 52, [AMA, 668, 96]), 139);
      }
    }

    function final(lt) {
      L.fundo(ctx, BEGE); arquivo = false;
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 780, () => L.imagem(ctx, L.img.logo, CX, 780, 780), 97);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.6, 1.2);
      [['Fotos: Paulo Pinto, Lula Marques, Bruno Peres, Marcelo Camargo, Joédson Alves / Agência Brasil (CC BY 3.0 BR)', 1110],
        ['Bruno Spada, Kayo Magalhães / Câmara dos Deputados (CC BY 3.0) · TSE (CC BY 4.0) · Luiza Valente (CC0)', 1150],
        ['Fontes: data_labe · Jornal Extra AL · Agência Brasil · Agência Câmara', 1200]].forEach(([s, y]) =>
        L.texto(ctx, s, CX, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(s, FONTE.maquina, 22, 400), cor: TINTA, alinhar: 'center' }));
      ctx.restore();
    }
  },
};
