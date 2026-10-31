// "Esquerda cirandeira" — a roda que gira pra direita. PRÉVIA sem narração (tempos estimados).
// Quando a narração chegar, os tempos de T vêm de esquerda-cirandeira.tempos.js (mesmos nomes), com as legendas.
// Render: node motor/render.js esquerda-cirandeira saida/cirandeira.mp4 --audio audio/esquerda-cirandeira/previa.wav
//
// DIAGRAMAÇÃO PADRÃO: título y 330 · fonte dos dados y 384 · conteúdo x 120–960, y 420–1420 · legenda (tarja) y 1466–1542
const T = Object.assign({
  titulo: 0.3, origem: 3.6, meme: 7.6, hoje: 9.6,
  roda: 13.6, p1: 14.4, p2: 15.6, p3: 17.2, p4: 18.4, p5: 19.8, p6: 21.0, p7: 22.4, p8: 24.2, p9: 26.0, p10: 27.8,
  p11: 29.8, p12: 31.4, p13: 32.6, p14: 33.8, p15: 35.4, gira: 37.2,
  mercado: 40.0, m1: 40.8, m2: 42.2, m3: 43.6, m4: 45.0, migalhas: 46.6,
  fecho: 50.0, praia: 50.4, ponta: 53.4, logo: 56.6, dur: 60.0,
}, (window.TEMPOS || {}).marcas || {});

// faixas da régua (esquerda → direita)
const FAIXAS = [['ESQUERDA RADICALIZADA', '#8A1411'], ['ESQUERDA', '#C8201E'], ['CENTRO', '#EBB52A'], ['DIREITA', '#4A6488'], ['EXTREMA-DIREITA', '#1F3A5F']];
// a roda: nome, foto, faixa, etiqueta, rosto [x, y, altura do rosto] em fração da foto
const RODA = [
  ['JONES MANOEL', 'jones', 0, 'QUER TROCAR A MÚSICA', [0.43, 0.48, 0.25]],
  ['ELIAS JABBOUR', 'jabbour', 0, 'QUER TROCAR A MÚSICA', [0.48, 0.25, 0.23]],
  ['ERIKA HILTON', 'erika', 1, 'DERRUBOU A 6x1', [0.36, 0.47, 0.45]],
  ['RICK AZEVEDO', 'rick', 1, 'DERRUBOU A 6x1', [0.52, 0.40, 0.35]],
  ['DILMA ROUSSEFF', 'dilma', 1, 'BANCO DO BRICS', [0.50, 0.43, 0.40]],
  ['LULA', 'lula', 1, 'O DONO DA RODA', [0.53, 0.31, 0.25]],
  ['ANDRÉ JANONES', 'janones', 1, 'EXÉRCITO DO LULA', [0.50, 0.36, 0.50]],
  ['GERALDO ALCKMIN', 'alckmin', 2, 'EX-PSDB', [0.82, 0.68, 0.27]],
  ['CIRO GOMES', 'ciro', 2, 'FOI PRO PSDB + PL', [0.47, 0.40, 0.58]],
  ['DAVI ALCOLUMBRE', 'alcolumbre', 2, 'DANÇA COM TODO GOVERNO', [0.48, 0.40, 0.30]],
  ['RENAN SANTOS', 'renan', 3, 'MBL', [0.58, 0.38, 0.35]],
  ['NIKOLAS FERREIRA', 'nikolas', 4, '3,1 MI DE VOTOS', [0.50, 0.23, 0.17]],
  ['LUCAS PAVANATO', 'pavanato', 4, '3 MI DE VOTOS', [0.50, 0.40, 0.55]],
  ['FLÁVIO BOLSONARO', 'flavio', 4, 'PERDEU O 2º TURNO', [0.47, 0.375, 0.16]],
  ['JAIR BOLSONARO', 'bolsonaro', 4, 'NO FIM DA FILA', [0.377, 0.41, 0.22]],
];
const M = '../midia/esquerda-cirandeira/';

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: T.dur,
  imagens: {
    jones: M + 'jones-2023.jpg', jabbour: M + 'jabbour-2025.jpg', erika: M + 'erika-2026.jpg', rick: M + 'rick-2026.jpg',
    dilma: M + 'dilma-2026.jpg', lula: M + 'lula-2026.jpg', janones: M + 'janones-2026.jpg', alckmin: M + 'alckmin-2026.jpg',
    ciro: M + 'ciro-2026-tse.jpg', alcolumbre: M + 'alcolumbre-2026.jpg', renan: M + 'renan-2026.jpg', nikolas: M + 'nikolas-2026.jpg',
    pavanato: M + 'pavanato-2026-tse.jpg', flavio: M + 'flavio-2026.jpg', bolsonaro: M + 'bolsonaro-2025.jpg',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease } = L;
    const CX = 540, LARG = 840, X0 = 120, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta;
    let arquivo = true;

    const ordem = [[0, abertura], [T.roda, roda], [T.mercado, mercado], [T.fecho, fecho], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [T.origem, T.gira, T.migalhas, T.ponta, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 12);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();

    [[T.roda, BEGE, -24], [T.mercado, VERM, 24], [T.fecho, BEGE, -24], [T.logo, BEGE, 24]]
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
    // retrato redondo: o rosto ocupa ~70% do círculo, centrado
    function retrato(i, cx, cy, r, anel = 8) {
      const [, chave, faixa, , [fx, fy, fh]] = RODA[i], img = L.img[chave];
      const base = Math.max(2 * r / img.width, 2 * r / img.height), zoom = Math.max(1, 1.45 * r / (fh * img.height) / base);
      const s0 = base * zoom, iw = img.width * s0, ih = img.height * s0;
      ctx.save(); ctx.fillStyle = FAIXAS[faixa][1]; ctx.beginPath(); ctx.arc(cx, cy, r + anel, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();
      L.foto(ctx, img, cx - r, cy - r, 2 * r, 2 * r, { pb: true, zoom, dx: (0.5 - fx) * iw, dy: (0.5 - fy) * ih, retic: false });
      ctx.restore();
    }

    // ------------------------------------------------ A. o que é
    function abertura(lt, t) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.006 }, () => L.planta(ctx, 61, TINTA, 0.07));
      // roda de bonequinhos de mãos dadas (silhuetas), girando devagar
      const n = 12, R = 225, cy = 1040, rot = lt * 0.35;
      ctx.save(); ctx.globalAlpha = 0.9 * ease.saida(seg(lt, 0, 0.8));
      ctx.strokeStyle = TINTA; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(CX, cy, R, 0, 7); ctx.stroke();
      for (let k = 0; k < n; k++) {
        const a = rot + k * 2 * Math.PI / n, x = CX + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        ctx.fillStyle = k % 2 ? VERM : TINTA; ctx.beginPath(); ctx.arc(x, y - 52, 26, 0, 7); ctx.fill();          // cabeça
        ctx.fillRect(x - 20, y - 26, 40, 70);                                                                      // corpo
      }
      ctx.restore();
      L.aplicarCarimbo(ctx, seg(t, T.titulo, T.titulo + 0.3), CX, 560, () => {
        L.texto(ctx, 'ESQUERDA', CX, 520, { familia: FONTE.bloco, peso: 400, tam: 96, cor: TINTA, alinhar: 'center' });
        L.texto(ctx, 'CIRANDEIRA?', CX, 660, { tam: L.ajustar(ctx, 'CIRANDEIRA?', FONTE.manchete, LARG), cor: VERM, alinhar: 'center', erro: TINTA, desloc: 7 });
      }, 101);
      if (t >= T.origem) {
        L.aplicarCarimbo(ctx, seg(t, T.origem, T.origem + 0.3), CX, 1040, () => {
          ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(CX, 1040, 140, 0, 7); ctx.fill();
          L.texto(ctx, '2016', CX, 1080, { tam: 120, cor: AMA, alinhar: 'center' });
        }, 103);
        if (t < T.hoje) linha('ATO CONTRA O IMPEACHMENT: PCO × CIRANDA DO PSOL', 1385, seg(t, T.origem + 0.5, T.origem + 1.6), TINTA, 36);
        cred('fonte: data_labe · Jornal Extra AL (out/2026)', seg(t, T.origem + 0.5, T.origem + 1.5));
      }
      L.etiqueta(ctx, 'VIROU MEME', 800, 870, seg(t, T.meme, T.meme + 0.3), { cor: VERM, corTexto: BEGE, tam: 40 });
      if (t >= T.hoje) {
        linha('HOJE: A ESQUERDA QUE DANÇA DE MÃOS DADAS', 1385, seg(t, T.hoje, T.hoje + 1.0), TINTA, 38);
        linha('COM QUEM DEVIA ENFRENTAR', 1432, seg(t, T.hoje + 0.8, T.hoje + 1.6), VERM, 38);
      }
    }

    // ------------------------------------------------ B. a roda (15 retratos de mãos dadas) + régua
    function roda(lt, t) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.002 }, () => L.planta(ctx, 63, TINTA, 0.06));
      const marcas = RODA.map((_, i) => T['p' + (i + 1)]), n = marcas.filter(x => t >= x).length, atual = Math.max(0, n - 1);
      const cy = 900, R = 330, r = 58;
      // ângulo de cada lugar: começa embaixo à esquerda, sobe pela esquerda, passa no alto (centro) e desce pela direita
      const giro = ease.entradaSaida ? ease.entradaSaida(seg(t, T.gira, T.gira + 1.8)) : ease.saida(seg(t, T.gira, T.gira + 1.8));
      const balanco = Math.sin(t * 2.2) * 0.035, rot = balanco + giro * 0.9;   // a roda dança; no fim gira pra direita
      const ang = i => Math.PI / 2 + 0.2 + i * (2 * Math.PI - 0.4) / 14 + rot;
      const pos = i => [CX + Math.cos(ang(i)) * R, cy + Math.sin(ang(i)) * R];
      titulo(t >= T.gira ? 'A RODA GIRA… PRA DIREITA' : 'A CIRANDA', seg(lt, 0, 0.5), t >= T.gira ? VERM : TINTA);
      // mãos dadas: arco entre vizinhos que já entraram
      ctx.save(); ctx.lineCap = 'round';
      for (let i = 0; i + 1 < n; i++) {
        const p = seg(t, marcas[i + 1], marcas[i + 1] + 0.4);
        ctx.strokeStyle = TINTA; ctx.lineWidth = 12; ctx.beginPath();
        ctx.arc(CX, cy, R, ang(i), lerp(ang(i), ang(i + 1), p)); ctx.stroke();
        if (p >= 1) { const a = (ang(i) + ang(i + 1)) / 2; ctx.fillStyle = AMA; ctx.beginPath(); ctx.arc(CX + Math.cos(a) * R, cy + Math.sin(a) * R, 13, 0, 7); ctx.fill(); }
      }
      ctx.restore();
      RODA.forEach((_, i) => {
        const p = ease.saida(seg(t, marcas[i], marcas[i] + 0.4));
        if (p <= 0) return;
        const [x, y] = pos(i), sobe = Math.abs(Math.sin(t * 4.4 + i)) * 6;          // pulinho de ciranda
        ctx.save(); ctx.globalAlpha = Math.min(1, p * 2); retrato(i, x, y - sobe - (1 - p) * 40, r * (i === atual ? 1.12 : 1), i === atual ? 10 : 6); ctx.restore();
      });
      // destaque do centro: quem acabou de entrar
      if (n > 0) {
        const [nome, , faixa, etq] = RODA[atual], e = ease.saida(seg(t, marcas[atual], marcas[atual] + 0.35));
        ctx.save(); ctx.globalAlpha = e;
        retrato(atual, CX, cy - 60, 135 * lerp(0.85, 1, e), 10);
        L.texto(ctx, nome, CX, cy + 135, { familia: FONTE.bloco, peso: 400, tam: tamMax(nome, FONTE.bloco, 46, 400, 470), cor: TINTA, alinhar: 'center' });
        ctx.restore();
        L.etiqueta(ctx, etq, CX, cy + 190, seg(t, marcas[atual] + 0.3, marcas[atual] + 0.6), { cor: FAIXAS[faixa][1], corTexto: faixa === 2 ? TINTA : BEGE, tam: tamMax(etq, FONTE.grotesca, 30, 700, 400) });
      }
      // régua do espectro
      const ry = 1350, rw = LARG / FAIXAS.length;
      FAIXAS.forEach(([nome, cor], k) => {
        ctx.fillStyle = cor; ctx.fillRect(X0 + k * rw, ry, rw, 26);
        L.texto(ctx, nome, X0 + k * rw + rw / 2, ry + 56, { familia: FONTE.grotesca, peso: 700, tam: tamMax(nome, FONTE.grotesca, 17, 700, rw - 8), cor: TINTA, alinhar: 'center' });
      });
      if (n > 0) {                                                                   // ponteiro desliza para a faixa de quem entrou
        const alvo = k => X0 + (RODA[k][2] + 0.5) * rw, ant = Math.max(0, atual - 1);
        const x = lerp(alvo(ant), alvo(atual), ease.saida(seg(t, marcas[atual], marcas[atual] + 0.5)));
        ctx.fillStyle = TINTA; ctx.beginPath(); ctx.moveTo(x, ry - 4); ctx.lineTo(x - 16, ry - 30); ctx.lineTo(x + 16, ry - 30); ctx.fill();
      }
      if (t >= T.gira) {                                                             // seta: a roda gira pra direita
        const p = seg(t, T.gira, T.gira + 0.8);
        ctx.save(); ctx.globalAlpha = p; ctx.strokeStyle = VERM; ctx.lineWidth = 14; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(CX, cy, R + 95, -Math.PI * 0.75, -Math.PI * 0.25); ctx.stroke();
        const a = -Math.PI * 0.25, xa = CX + Math.cos(a) * (R + 95), ya = cy + Math.sin(a) * (R + 95);
        ctx.fillStyle = VERM; ctx.beginPath(); ctx.moveTo(xa + 22, ya + 30); ctx.lineTo(xa - 30, ya + 4); ctx.lineTo(xa + 16, ya - 30); ctx.fill();
        ctx.restore();
      }
      cred('fotos: Agência Brasil · Câmara dos Deputados · TSE · Wikimedia Commons (créditos no final)', seg(lt, 0.5, 1.5));
    }

    // ------------------------------------------------ C. a ciranda do mercado
    function mercado(lt, t) {
      L.fundo(ctx, VERM); arquivo = false;
      L.raios(ctx, CX, 960, 1800, 22, L.emDois(t) * 0.05, 'rgba(28,23,20,0.16)');
      titulo('A CIRANDA DO MERCADO', seg(lt, 0, 0.6), BEGE);
      cred('fontes: InfoMoney · Correio Braziliense · Banco Central (Selic jun/2026)', seg(lt, 0.4, 1.2), BEGE);
      [['MINISTÉRIOS PRO CENTRÃO', T.m1], ['EMENDAS BILIONÁRIAS', T.m2], ['ARCABOUÇO FISCAL', T.m3], ['JUROS DE 14,25%', T.m4]].forEach(([s, X], k) =>
        L.aplicarCarimbo(ctx, seg(t, X, X + 0.3), CX, 520 + k * 130, () => bloco(s, 545 + k * 130, k % 2 ? AMA : BEGE, 58, [TINTA, 482 + k * 130, 96]), 111 + k));
      if (t >= T.migalhas) {                                                         // prato com migalhas pro povo
        const p = seg(t, T.migalhas, T.migalhas + 0.4);
        ctx.save(); ctx.globalAlpha = p;
        ctx.fillStyle = BEGE; ctx.beginPath(); ctx.ellipse(CX, 1170, 230, 46, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = TINTA; ctx.lineWidth = 6; ctx.stroke();
        for (let k = 0; k < 9; k++) {                                                // migalhas caindo
          const q = seg(t, T.migalhas + k * 0.12, T.migalhas + 0.7 + k * 0.12), x = CX - 120 + (k * 37) % 240;
          ctx.fillStyle = '#B98516'; ctx.fillRect(x, lerp(1000, 1158, ease.saida(q)), 10, 8);
        }
        ctx.restore();
        linha('E MIGALHAS PRO POVO NÃO SE REVOLTAR', 1290, seg(t, T.migalhas + 0.4, T.migalhas + 1.4), BEGE, 40);
      }
    }

    // ------------------------------------------------ D. o fecho
    function fecho(lt, t) {
      L.fundo(ctx, AMA); arquivo = false;
      L.raios(ctx, CX, 1700, 2300, 24, t * 0.03, 'rgba(200,32,30,0.18)');
      L.aplicarCarimbo(ctx, seg(t, T.praia, T.praia + 0.3), CX, 520, () => {
        L.texto(ctx, 'CIRANDA É BONITA', CX, 500, { familia: FONTE.bloco, peso: 400, tam: tamMax('CIRANDA É BONITA', FONTE.bloco, 84, 400), cor: TINTA, alinhar: 'center' });
        L.texto(ctx, 'NA PRAIA.', CX, 640, { tam: 150, cor: VERM, alinhar: 'center', erro: TINTA, desloc: 6 });
      }, 121);
      // a roda inteira pequena, girando pra direita e se afastando; uma mão solta fica para trás: o povo
      const R = 170, cy = 960, rot = lt * 0.9, afasta = ease.saida(seg(lt, 0.5, 3.0));
      RODA.forEach((_, i) => {
        const a = rot + i * 2 * Math.PI / 16, x = CX + 160 * afasta + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        retrato(i, x, y, 36, 4);
      });
      const pm = ease.saida(seg(lt, 1.0, 1.6));
      ctx.save(); ctx.globalAlpha = pm; ctx.fillStyle = TINTA;
      ctx.beginPath(); ctx.arc(220, 1000, 34, 0, 7); ctx.fill(); ctx.fillRect(196, 1030, 48, 110);  // o povo, sozinho
      ctx.lineWidth = 14; ctx.strokeStyle = TINTA; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(244, 1060); ctx.lineTo(300, 1020); ctx.stroke();
      ctx.restore();
      L.etiqueta(ctx, 'O POVO', 220, 1190, seg(lt, 1.2, 1.5), { cor: VERM, corTexto: BEGE, tam: 32 });
      if (t >= T.ponta) L.aplicarCarimbo(ctx, seg(t, T.ponta, T.ponta + 0.3), CX, 1300, () =>
        bloco('EM QUAL PONTA DA RODA VOCÊ ESTÁ?', 1325, BEGE, 52, [TINTA, 1262, 100]), 123);
    }

    function final(lt) {
      L.fundo(ctx, BEGE); arquivo = false;
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 780, () => L.imagem(ctx, L.img.logo, CX, 780, 780), 97);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.6, 1.2);
      [['Fotos: Paulo Pinto, Lula Marques, Bruno Peres, Marcelo Camargo, Joédson Alves / Agência Brasil (CC BY 3.0 BR)', 1110],
        ['Bruno Spada, Kayo Magalhães / Câmara dos Deputados (CC BY 3.0) · TSE (CC BY 4.0) · Luiza Valente (CC0)', 1150],
        ['Fontes: data_labe · Jornal Extra AL · Agência Brasil · Agência Câmara · InfoMoney · Banco Central', 1200]].forEach(([s, y]) =>
        L.texto(ctx, s, CX, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(s, FONTE.maquina, 22, 400), cor: TINTA, alinhar: 'center' }));
      ctx.restore();
    }
  },
};
