// Demo da mescla: registro ARQUIVO (documentário calmo) alternando com registro CARTAZ (impacto).
// 12 s, Reels 1080×1920. Modelo para vídeos narrados.
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 12,
  imagens: { cartaz: '../identidade/referencias/ref-02-urss-1917-1957.jpg' },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease } = L, W = 1080, H = 1920;

    if (t < 2.6) digitado(t);
    else if (t < 5.0) retrato(t - 2.6);
    else if (t < 7.0) sinais(t - 5.0);
    else if (t < 9.4) cartaz(t - 7.0);
    else fecho(t - 9.4);

    L.corteDiagonal(ctx, seg(t, 6.6, 7.0), COR.amarelo);
    L.corteDiagonal(ctx, seg(t, 9.0, 9.4), COR.bege, 24);

    // acabamento: arquivo ganha varredura de TV; cartaz fica só com o papel
    if (t < 6.8 || t > 9.4) L.varredura(ctx, t);
    L.papel(ctx, t); L.vinheta(ctx, 0.3);

    // 1. planta técnica + texto sendo digitado + seleção em vermelho, câmera desliza
    function digitado(t) {
      L.fundo(ctx, COR.bege);
      const pan = lerp(0, -90, ease.saida(seg(t, 1.3, 2.2)));   // câmera vai até a palavra selecionada
      L.camera(ctx, { x: W / 2 + pan, y: H / 2, zoom: lerp(1, 1.12, seg(t, 0, 1.3)) + 0.25 * ease.saida(seg(t, 1.3, 2.2)) }, () => {
        L.planta(ctx, 4);
        const frase = 'ELES CONSTRUÍRAM O PAÍS';
        L.fonte(ctx, FONTE.grotesca, 54, 700);
        const xi = W / 2 - ctx.measureText(frase).width / 2;
        L.texto(ctx, L.datilografar(frase, seg(t, 0.2, 1.3)), xi, 980,
          { familia: FONTE.grotesca, peso: 700, tam: 54, cor: COR.tinta, rgb: 2 });
        L.fonte(ctx, FONTE.grotesca, 54, 700);
        const x0 = xi + ctx.measureText('ELES ').width, w = ctx.measureText('CONSTRUÍRAM').width;
        L.selecao(ctx, x0 - 6, 935, w + 12, 62, seg(t, 1.5, 1.9), COR.vermelho);
      });
    }

    // 2. retrato de arquivo em moldura, foco entrando, palavras com a narração
    function retrato(t) {
      L.fundo(ctx, COR.bege);
      L.camera(ctx, { zoom: lerp(1.0, 1.08, seg(t, 0, 2.4)) }, () => {
        L.moldura(ctx, 260, 640, 560, 760);
        L.foto(ctx, L.img.cartaz, 260, 640, 560, 760, { desfoque: lerp(14, 0, ease.saida(seg(t, 0.2, 1.0))), zoom: 1.35 });
      });
      L.palavras(ctx, [['quase', 0.3], ['ninguém', 0.6], ['lembra', 0.95]], t, W / 2, 1600, { tam: 76 });
      L.revelarLetras(ctx, 'desde 1917', seg(t, 1.4, 2.0), W / 2, 500, { tam: 60, cor: COR.vermelho });
    }

    // 3. tela escura: ondas de sinal + etiquetas (chips) surgindo
    function sinais(t) {
      L.fundo(ctx, COR.tinta);
      L.ondas(ctx, W / 2, 900, t, { cor: COR.begeEscuro, n: 7, passo: 80 });
      L.sinal(ctx, W / 2, 900, t, COR.vermelho, 120);
      L.etiqueta(ctx, 'TERRA', 330, 640, seg(t, 0.3, 0.6));
      L.etiqueta(ctx, 'PÃO', 760, 760, seg(t, 0.6, 0.9), { cor: COR.vermelho });
      L.etiqueta(ctx, 'TRABALHO', 660, 1150, seg(t, 0.9, 1.2), { cor: COR.amarelo, corTexto: COR.tinta });
      L.texto(ctx, 'O QUE O POVO PEDE', W / 2, 400, { familia: FONTE.grotesca, peso: 700, tam: 50, cor: COR.bege, alinhar: 'center', rgb: 2, tracking: 4 });
    }

    // 4. virada para o registro CARTAZ: impacto
    function cartaz(t) {
      L.fundo(ctx, COR.amarelo);
      L.raios(ctx, W / 2, 1150, 1700, 20, L.emDois(t) * 0.1, COR.vermelho);
      L.aplicarCarimbo(ctx, seg(t, 0.15, 0.5), W / 2, 760, () => {
        ctx.fillStyle = COR.vermelho; ctx.fillRect(0, 600, W, 300);
        L.texto(ctx, 'O POVO', W / 2, 850, { familia: FONTE.bloco, peso: 400,
          tam: L.ajustar(ctx, 'O POVO', FONTE.bloco, W - 140, 400), cor: COR.amarelo, alinhar: 'center' });
      }, 31);
      L.aplicarCarimbo(ctx, seg(t, 0.6, 0.9), W / 2, 1150, () => {
        ctx.fillStyle = COR.amarelo; ctx.beginPath(); ctx.arc(W / 2, 1150, 230, 0, 7); ctx.fill();
        L.estrela(ctx, W / 2, 1165, 180, 0, COR.vermelho);
      }, 33);
      L.aplicarCarimbo(ctx, seg(t, 1.0, 1.3), W / 2, 1530, () => {
        ctx.fillStyle = COR.bege; ctx.fillRect(0, 1420, W, 230);
        L.texto(ctx, 'LEMBRA.', W / 2, 1610, { tam: 220, cor: COR.vermelho, alinhar: 'center', erro: COR.vermelhoEscuro });
      }, 35);
    }

    // 5. fecho calmo: serifa itálica + ícone de sinal
    function fecho(t) {
      L.fundo(ctx, COR.bege);
      L.sinal(ctx, W / 2, 820, t, COR.vermelho, 150);
      L.palavras(ctx, [['a', 0.2], ['história', 0.4], ['é', 0.75], ['nossa.', 0.95]], t, W / 2, 1150, { tam: 92 });
      ctx.globalAlpha = seg(t, 1.5, 1.9);
      L.texto(ctx, 'CONSTRUTIVISMO TROPICAL', W / 2, 1560, { familia: FONTE.sub, peso: 600, tam: 36, cor: COR.vermelho, alinhar: 'center', tracking: 5 });
      ctx.globalAlpha = 1;
    }
  },
};
