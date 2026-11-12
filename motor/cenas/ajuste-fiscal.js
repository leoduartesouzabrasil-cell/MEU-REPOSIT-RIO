// "QUEM PAGA A CONTA DO AJUSTE FISCAL?" — CAMADA TRANSPARENTE por cima do vídeo gravado (apresentador falando para a câmera).
// O vídeo dele (com cortes nas pausas e zoom alternado) vem do audio/ajuste-fiscal/editar.sh; esta cena desenha só as artes:
// manchete na abertura, foto do Jaques Wagner na primeira citação, etiquetas/carimbos, legenda e o cartão final com as logos.
// Render: node motor/render.js ajuste-fiscal saida/ajuste-fiscal-camada.mov --alfa
// ÁREAS: o rosto fica entre y ~210 e ~1000 (nada por cima); artes desenhadas em y 1050–1430 e deslocadas DESCE px para baixo
// (pedido do autor: legenda e pop-ups mais baixos); faixa de cima (y 0–190); legenda y 1680–1756 (LEG_Y), sem encostar nos pop-ups.
const DESCE = 200, LEG_Y = 1680;
const T = Object.assign({ dur: 10, logo: 7 }, (window.TEMPOS || {}).marcas || {});

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: T.dur,
  imagens: {
    wagner: '../midia/jaques-wagner/jaques-wagner-2019.jpg',            // Senado Federal, 2019 · CC BY 2.0 (Wikimedia Commons)
    ocV: '../identidade/marca/variantes/o-camarada-v-vermelha.png',
    lufaV: '../identidade/marca/variantes/lufa-v-colorida.png',
    lufaH: '../identidade/marca/variantes/lufa-h-colorida.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease, clamp } = L;
    const CX = 540, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta;
    ctx.clearRect(0, 0, 1080, 1920);
    const { dx, dy } = L.tremor(t, [T.bi60, T.costas, T.fortunas, T.herancas, T.dividendos, T.redes], 8);
    ctx.save(); ctx.translate(dx, dy + DESCE);

    // ------------------------------------------------ utilidades
    const tam = (txt, fam, max, larg, peso = 400) => Math.min(max, L.ajustar(ctx, txt, fam, larg, peso));
    const vis = (a, b, ent = 0.25, sai = 0.2) => clamp(seg(t, a, a + ent)) * (1 - clamp(seg(t, b - sai, b)));
    function cartao(x, y, w, h, cor = BEGE, sombra = TINTA) {
      ctx.fillStyle = sombra; ctx.fillRect(x + 10, y + 10, w, h);
      ctx.fillStyle = cor; ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h);
    }
    function carimbo(txt, y, t0, cor, max, fam = FONTE.manchete, seed = 1, o = {}) {
      if (t < t0) return;
      const peso = fam === FONTE.manchete ? 900 : 400;
      L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), o.x || CX, y, () =>
        L.texto(ctx, txt, o.x || CX, y, { familia: fam, peso, tam: tam(txt, fam, max, o.larg || 900, peso), cor, alinhar: 'center', ...o }), seed);
    }
    function faixaTopo(txt, p, cor = VERM, corT = BEGE) {   // faixa no alto, acima da cabeça (não desce)
      if (p <= 0) return;
      ctx.save(); ctx.translate(0, -DESCE); ctx.globalAlpha = clamp(p * 2);
      ctx.fillStyle = cor; ctx.fillRect(0, 40 - (1 - ease.saida(p)) * 160, 1080, 130);
      L.texto(ctx, txt, CX, 128 - (1 - ease.saida(p)) * 160, { familia: FONTE.manchete, peso: 900, tam: tam(txt, FONTE.manchete, 74, 980, 900), cor: corT, alinhar: 'center' });
      ctx.restore();
    }

    // ------------------------------------------------ 0. abertura: a pergunta no alto + a MANCHETE embaixo (o rosto fica livre)
    if (t < T.wagner) {
      faixaTopo('QUEM PAGA A CONTA DO AJUSTE FISCAL?', vis(0, T.camaradas + 2.5, 0.35, 0.3), TINTA, AMA);
      const p = vis(0.15, T.wagner, 0.4, 0.3);
      if (p > 0) {
        const e = ease.saida(clamp(seg(t, 0.15, 0.6)));
        ctx.save(); ctx.globalAlpha = clamp(p * 1.5); ctx.translate(0, (1 - e) * 500);
        ctx.translate(CX, 1245); ctx.rotate(-0.015); ctx.translate(-CX, -1245);
        cartao(70, 1065, 940, 360, '#F6EEDB');
        ctx.fillStyle = VERM; ctx.fillRect(70, 1065, 940, 58);
        L.texto(ctx, 'MANCHETE · 12/11/2026', 100, 1106, { familia: FONTE.sub, peso: 600, tam: 34, cor: BEGE, tracking: 4 });
        const LIN = ['Senado deve votar ajuste fiscal', 'com previsão de economia', 'de R$ 60 bi'];
        const tt = tam(LIN[0], FONTE.grotesca, 62, 860, 700);
        L.fonte(ctx, FONTE.grotesca, tt, 700);
        if (t >= T.bi60) L.selecao(ctx, 96, 1314, ctx.measureText('de R$ 60 bi').width + 10, 72, seg(t, T.bi60, T.bi60 + 0.4), AMA);
        LIN.forEach((s, i) => L.texto(ctx, L.datilografar(s, seg(t, 0.5 + i * 0.5, 1.1 + i * 0.5)), 100, 1190 + i * 74, { familia: FONTE.grotesca, peso: 700, tam: tt, cor: TINTA }));
        L.texto(ctx, 'Fonte: Agência Brasil · PLP 299/2026 (Senado)', 990, 1404, { familia: FONTE.maquina, peso: 400, tam: 22, cor: TINTA, alinhar: 'right' });
        ctx.restore();
        if (t >= T.ano2027) L.etiqueta(ctx, 'META PARA 2027', 820, 1040, seg(t, T.ano2027, T.ano2027 + 0.3), { cor: AMA, corTexto: TINTA, tam: 34 });
      }
    }

    // ------------------------------------------------ 1. Jaques Wagner: foto em moldura (embaixo, à direita) + quem é
    if (t >= T.wagner - 0.1 && t < T.despesas) {
      const p = vis(T.wagner - 0.1, T.despesas), e = ease.saida(seg(t, T.wagner - 0.1, T.wagner + 0.4));
      const w = 290, h = 340, x = 680, y = 1030 + (1 - e) * 500;
      ctx.save(); ctx.globalAlpha = clamp(p * 2);
      L.moldura(ctx, x, y, w, h, 18);
      L.foto(ctx, L.img.wagner, x, y, w, h, { desfoque: (1 - seg(t, T.wagner, T.wagner + 0.5)) * 8 });
      L.texto(ctx, 'Foto: Senado Federal · CC BY 2.0', x + w / 2, y + h + 44, { familia: FONTE.maquina, peso: 400, tam: 20, cor: BEGE, alinhar: 'center', erro: TINTA, desloc: 3 });
      ctx.restore();
      ctx.save(); ctx.globalAlpha = clamp(p * 2);
      L.etiqueta(ctx, 'JAQUES WAGNER', 345, 1130, seg(t, T.wagner + 0.2, T.wagner + 0.5), { cor: VERM, tam: 46 });
      L.etiqueta(ctx, 'SENADOR (PT-BA)', 345, 1220, seg(t, T.wagner + 0.5, T.wagner + 0.8), { cor: TINTA, tam: 34 });
      L.etiqueta(ctx, 'AUTOR DO PLP 299/2026', 345, 1300, seg(t, T.wagner + 0.8, T.wagner + 1.1), { cor: AMA, corTexto: TINTA, tam: 30 });
      if (t >= T.superavit) L.etiqueta(ctx, 'META: SUPERÁVIT', 345, 1380, seg(t, T.superavit, T.superavit + 0.3), { cor: BEGE, corTexto: TINTA, tam: 30 });
      ctx.restore();
    }
    // cortar gastos × aumentar arrecadação
    if (t >= T.despesas && t < T.atencao) {
      const p = vis(T.despesas, T.atencao);
      ctx.save(); ctx.globalAlpha = clamp(p * 2);
      L.etiqueta(ctx, '✂ CONTER DESPESAS', CX, 1180, seg(t, T.despesas, T.despesas + 0.3), { cor: VERM, tam: 50 });
      L.etiqueta(ctx, '+ ARRECADAÇÃO', CX, 1310, seg(t, T.arrecadacao, T.arrecadacao + 0.3), { cor: TINTA, tam: 50 });
      ctx.restore();
    }

    // ------------------------------------------------ 2. o que a população precisa (lista que vai entrando)
    if (t >= T.escolas - 0.3 && t < T.pergunta) {
      const p = vis(T.escolas - 0.3, T.pergunta - 0.4);
      ctx.save(); ctx.globalAlpha = clamp(p * 2);
      L.etiqueta(ctx, 'A POPULAÇÃO PRECISA DE:', CX, 1090, seg(t, T.escolas - 0.3, T.escolas), { cor: TINTA, tam: 40 });
      [[T.escolas, 'ESCOLAS', 300, 1180], [T.hospitais, 'HOSPITAIS', 780, 1180], [T.estruturas, 'ESTRUTURA', 300, 1280],
        [T.saude, 'SAÚDE', 780, 1280], [T.professores, 'PROFESSORES', CX, 1380]].forEach(([t0, s, x, y], i) => {
        if (t >= t0) L.etiqueta(ctx, s, x, y, seg(t, t0, t0 + 0.3), { cor: i % 2 ? AMA : VERM, corTexto: i % 2 ? TINTA : BEGE, tam: 48 });
      });
      ctx.restore();
    }

    // ------------------------------------------------ 3. a pergunta: por que a conta sempre cai nas costas da classe trabalhadora?
    if (t >= T.pergunta && t < T.taxar) {
      const p = vis(T.pergunta, T.taxar);
      ctx.save(); ctx.globalAlpha = clamp(p * 2);
      ctx.fillStyle = 'rgba(200,32,30,0.92)'; ctx.fillRect(0, 1060, 1080, 380);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 1060, 1080, 380); ctx.clip();
      L.raios(ctx, CX, 1440, 1400, 18, -0.3 + L.emDois(t) * 0.05, 'rgba(237,224,196,0.12)'); ctx.restore();
      carimbo('POR QUE A CONTA SEMPRE CAI', 1150, T.pergunta + 0.1, BEGE, 76, FONTE.manchete, 21);
      carimbo('NAS COSTAS DA', 1255, T.costas, BEGE, 76, FONTE.manchete, 22);
      carimbo('CLASSE TRABALHADORA?', 1385, T.costas + 0.3, AMA, 110, FONTE.manchete, 23, { erro: TINTA, desloc: 6 });
      ctx.restore();
    }

    // ------------------------------------------------ 4. a proposta: taxar quem tem muito (lista com ✔)
    if (t >= T.taxar && t < T.prejud) {
      const p = vis(T.taxar, T.prejud);
      ctx.save(); ctx.globalAlpha = clamp(p * 2);
      cartao(80, 1070, 920, 360, '#F6EEDB');
      L.texto(ctx, 'POR QUE NÃO COMEÇAR POR AQUI?', CX, 1135, { familia: FONTE.manchete, peso: 900, tam: 50, cor: VERM, alinhar: 'center' });
      [[T.fortunas, 'TAXAR GRANDES FORTUNAS'], [T.herancas, 'TAXAR GRANDES HERANÇAS'], [T.dividendos, 'IMPOSTO SOBRE LUCROS E DIVIDENDOS']].forEach(([t0, s], i) => {
        if (t < t0) return;
        const y = 1210 + i * 72, q = seg(t, t0, t0 + 0.3);
        L.aplicarCarimbo(ctx, q, 150, y, () => {
          ctx.fillStyle = VERM; ctx.fillRect(122, y - 34, 56, 56); ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.strokeRect(122, y - 34, 56, 56);
          L.texto(ctx, '✔', 150, y + 12, { familia: FONTE.grotesca, peso: 700, tam: 44, cor: BEGE, alinhar: 'center' });
        }, 30 + i);
        L.texto(ctx, L.datilografar(s, q * 2), 206, y + 12, { familia: FONTE.bloco, peso: 400, tam: tam(s, FONTE.bloco, 42, 760), cor: TINTA });
      });
      if (t >= T.bilhoes) L.etiqueta(ctx, 'QUEM ACUMULA BILHÕES NÃO PODE CONTRIBUIR?', CX, 1020, seg(t, T.bilhoes, T.bilhoes + 0.3), { cor: TINTA, tam: 34 });
      ctx.restore();
    }

    // ------------------------------------------------ 5. quem perde: saúde e educação
    if (t >= T.prejud && t < T.pressao) {
      const p = vis(T.prejud, T.pressao);
      ctx.save(); ctx.globalAlpha = clamp(p * 2);
      L.etiqueta(ctx, 'QUEM MAIS PRECISA DO ESTADO PERDE', CX, 1120, seg(t, T.prejud, T.prejud + 0.3), { cor: TINTA, tam: 40 });
      [[T.saude2, 'SAÚDE', 300], [T.educacao, 'EDUCAÇÃO', 780]].forEach(([t0, s, x]) => {
        if (t < t0) return;
        const q = seg(t, t0, t0 + 0.3), cai = ease.saida(seg(t, t0 + 0.2, t0 + 0.9)) * 40;
        L.etiqueta(ctx, s, x, 1250, q, { cor: VERM, tam: 54 });
        ctx.save(); ctx.globalAlpha *= clamp(q * 2); ctx.fillStyle = AMA; ctx.strokeStyle = TINTA; ctx.lineWidth = 4;
        ctx.beginPath(); const ay = 1320 + cai; ctx.moveTo(x - 30, ay); ctx.lineTo(x + 30, ay); ctx.lineTo(x + 30, ay + 40); ctx.lineTo(x + 55, ay + 40);
        ctx.lineTo(x, ay + 95); ctx.lineTo(x - 55, ay + 40); ctx.lineTo(x - 30, ay + 40); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      });
      ctx.restore();
    }

    // ------------------------------------------------ 6. chamada: pressão nas redes + segue e compartilha
    if (t >= T.pressao && t < T.logo) {
      const p = vis(T.pressao, T.logo);
      ctx.save(); ctx.globalAlpha = clamp(p * 2);
      if (t < T.segue) {
        L.etiqueta(ctx, 'CLASSE TRABALHADORA:', CX, 1150, seg(t, T.pressao, T.pressao + 0.3), { cor: TINTA, tam: 44 });
        carimbo('PRESSÃO NAS REDES!', 1300, T.redes, AMA, 120, FONTE.manchete, 41, { erro: TINTA, desloc: 6 });
      } else {
        L.etiqueta(ctx, '➕ SEGUE', 300, 1250, seg(t, T.segue + 1.0, T.segue + 1.3), { cor: VERM, tam: 56 });
        L.etiqueta(ctx, '📤 COMPARTILHA', 720, 1250, seg(t, T.compart, T.compart + 0.3), { cor: AMA, corTexto: TINTA, tam: 56 });
      }
      ctx.restore();
    }

    ctx.restore();
    // logo do Coletivo Lufã fixa no alto à esquerda, longe da borda (não corta no Reels nem no grid), sobre a parede ao lado da cabeça
    if (t < T.logo) {
      const lw = 230, lh = lw * L.img.lufaH.height / L.img.lufaH.width;
      ctx.save(); ctx.globalAlpha = 0.95 * clamp(t / 0.4); ctx.drawImage(L.img.lufaH, 90, 220, lw, lh); ctx.restore();
    }
    legenda();

    // ------------------------------------------------ fim: cartão com as duas logos (cobre o vídeo) e créditos
    if (t >= T.logo - 0.4) {
      L.corteDiagonal(ctx, seg(t, T.logo - 0.4, T.logo), BEGE, 24);
      if (t >= T.logo) {
        L.fundo(ctx, BEGE);
        L.aplicarCarimbo(ctx, seg(t, T.logo, T.logo + 0.3), CX, 800, () => {
          const h = 470, w = h * L.img.lufaV.width / L.img.lufaV.height;   // só a logo do Coletivo Lufã, centralizada (pedido do autor)
          ctx.drawImage(L.img.lufaV, CX - w / 2, 800 - h / 2, w, h);
        }, 97);
        ctx.save(); ctx.globalAlpha = seg(t, T.logo + 0.5, T.logo + 1.1);
        ['Foto de Jaques Wagner: Senado Federal (2019) · CC BY 2.0, via Wikimedia Commons',
          'Fontes: Agência Brasil e Agência Senado (11–12/11/2026) · PLP 299/2026'].forEach((s, i) =>
          L.texto(ctx, s, CX, 1110 + i * 42, { familia: FONTE.maquina, peso: 400, tam: tam(s, FONTE.maquina, 24, 960), cor: TINTA, alinhar: 'center' }));
        ctx.restore();
        L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.3);
      }
    }

    // ------------------------------------------------ legenda padrão (tarja escura, filete vermelho, texto bege)
    function legenda() {
      const LEG = (window.TEMPOS || {}).legendas || [];
      const l = LEG.find(l => t >= l.t0 - 0.05 && t < l.t1);
      if (!l || t >= T.logo) return;
      const pal = l.p.map(([w, t0]) => [w, t0 - 0.08]), largura = tm => {
        L.fonte(ctx, FONTE.serifa, tm, 400, 'italic');
        return pal.reduce((s, [p]) => s + ctx.measureText(p).width, 0) + tm * 0.28 * (pal.length - 1);
      };
      const tm = Math.min(48, 48 * 760 / largura(48)), w = largura(tm);
      ctx.save(); ctx.globalAlpha = clamp((l.t1 - t) / 0.15) * clamp((t - l.t0 + 0.05) / 0.12);
      ctx.fillStyle = 'rgba(15,12,11,0.86)'; ctx.fillRect(CX - w / 2 - 26, LEG_Y, w + 52, 76);
      ctx.fillStyle = VERM; ctx.fillRect(CX - w / 2 - 26, LEG_Y, 7, 76);
      L.palavras(ctx, pal, t, CX, LEG_Y + 51, { tam: tm, cor: BEGE, espaco: 0.28, rgb: 0 });
      ctx.restore();
    }
  },
};
