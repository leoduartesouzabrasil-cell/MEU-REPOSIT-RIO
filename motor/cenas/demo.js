// Cena de demonstração da identidade (9 s, Reels 1080×1920).
// Serve de modelo: copie este arquivo para criar novos vídeos.
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 9,

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease } = L, W = 1080, H = 1920;

    if (t < 2.4) aberturaSol(ctx, t, L);
    else if (t < 5.4) manchete(ctx, t - 2.4, L);
    else if (t < 7.3) contador(ctx, t - 5.4, L);
    else encerramento(ctx, t - 7.3, L);

    // transições (por cima da cena que sai)
    L.corteDiagonal(ctx, seg(t, 2.0, 2.4), COR.bege);
    L.corteDiagonal(ctx, seg(t, 5.0, 5.4), COR.vermelho, 24);
    L.corteDiagonal(ctx, seg(t, 6.9, 7.3), COR.amarelo);

    L.papel(ctx, t); L.vinheta(ctx);

    // ---------- cenas ----------
    function aberturaSol(ctx, t) {
      L.fundo(ctx, COR.amarelo);
      const r = lerp(0, 1500, ease.saida(seg(t, 0, 0.8)));
      L.raios(ctx, W / 2, 1060, r, 18, L.emDois(t) * 0.12, COR.vermelho);
      L.aplicarCarimbo(ctx, seg(t, 0.5, 0.85), W / 2, 1060, () => {
        ctx.fillStyle = COR.vermelho; ctx.beginPath(); ctx.arc(W / 2, 1060, 300, 0, 7); ctx.fill();
        L.estrela(ctx, W / 2, 1075, 230, 0, COR.amarelo);
      }, 3);
      L.aplicarCarimbo(ctx, seg(t, 0.9, 1.2), W / 2, 400, () => {
        ctx.fillStyle = COR.vermelho; ctx.fillRect(110, 300, W - 220, 150);
        L.texto(ctx, 'CONSTRUTIVISMO', W / 2, 420, { tam: L.ajustar(ctx, 'CONSTRUTIVISMO', FONTE.manchete, W - 280), cor: COR.amarelo, alinhar: 'center' });
      }, 5);
      ctx.fillStyle = COR.amarelo; ctx.fillRect(lerp(W, 250, ease.saida(seg(t, 1.0, 1.25))), 470, W - 500, 120);
      ctx.save(); ctx.globalAlpha = seg(t, 1.15, 1.25);
      L.texto(ctx, 'TROPICAL', W / 2, 568, { familia: FONTE.bloco, peso: 400, tam: 96, cor: COR.vermelho, alinhar: 'center' });
      ctx.restore();
      ctx.fillStyle = COR.bege; ctx.fillRect(170, 1470, lerp(0, W - 340, ease.saida(seg(t, 1.05, 1.25))), 76);
      L.texto(ctx, L.datilografar('identidade visual · teste nº 01', seg(t, 1.2, 1.9)), W / 2, 1520,
        { familia: FONTE.maquina, peso: 400, tam: 44, cor: COR.tinta, alinhar: 'center' });
    }

    function manchete(ctx, t) {
      L.fundo(ctx, COR.bege);
      // bandeira diagonal ao fundo
      ctx.save(); ctx.translate(150, 1660); ctx.rotate(-0.26);
      const sobe = lerp(500, 0, ease.saida(seg(t, 0, 0.7)));
      L.bandeira(ctx, 0, -560 + sobe, 820, 500, t, COR.vermelho);
      L.mastro(ctx, 0, -580 + sobe, 600 + sobe);
      ctx.restore();
      L.reticula(ctx, 0, 1640, W, 280, COR.begeEscuro);
      // texto em escada
      const linhas = [['A TERRA', 0.2], ['É DE QUEM', 0.35]];
      linhas.forEach(([s, a], i) => {
        const p = ease.saida(seg(t, a, a + 0.35));
        L.texto(ctx, s, lerp(-700, 90 + i * 70, p), 420 + i * 190,
          { tam: 190, cor: COR.vermelho, erro: COR.azul, desloc: 7 });
      });
      L.aplicarCarimbo(ctx, seg(t, 1.0, 1.35), W / 2, 760, () => {
        ctx.fillStyle = COR.vermelho; ctx.fillRect(0, 640, W, 230);
        L.texto(ctx, 'TRABALHA', W / 2, 840, { familia: FONTE.bloco, peso: 400,
          tam: L.ajustar(ctx, 'TRABALHA', FONTE.bloco, W - 100, 400), cor: COR.bege, alinhar: 'center' });
      }, 9);
    }

    function contador(ctx, t) {
      L.fundo(ctx, COR.vermelho);
      ctx.save(); ctx.translate(W / 2, 900); ctx.rotate(-0.42);
      ctx.fillStyle = COR.azul; ctx.fillRect(-1400, -150, lerp(0, 2800, ease.saida(seg(t, 0.1, 0.6))), 300);
      ctx.restore();
      const ano = Math.round(lerp(1917, 2026, ease.saida(seg(t, 0.2, 1.1))));
      const trava = seg(t, 1.1, 1.35);
      L.aplicarCarimbo(ctx, trava > 0 ? trava : 1, W / 2, 900, () => {
        L.texto(ctx, String(ano), W / 2, 1010, { tam: 400, cor: COR.amarelo, alinhar: 'center', erro: COR.vermelhoEscuro, desloc: 12 });
      }, 13);
      L.texto(ctx, L.datilografar('do Volga ao Xingu.', seg(t, 0.5, 1.4)), W / 2, 1250,
        { familia: FONTE.maquina, peso: 400, tam: 58, cor: COR.bege, alinhar: 'center' });
      L.texto(ctx, 'A LUTA CONTINUA', W / 2, 380, { familia: FONTE.sub, peso: 600, tam: 64, cor: COR.bege, alinhar: 'center', tracking: 6 });
    }

    function encerramento(ctx, t) {
      L.fundo(ctx, COR.amarelo);
      L.raios(ctx, W / 2, 1900, 2200, 24, -0.4 + L.emDois(t) * 0.08, 'rgba(200,32,30,0.18)');
      const tb = L.ajustar(ctx, 'SOBERANO', FONTE.manchete, W - 180);
      L.texto(ctx, 'BRASIL', 90, 560, { tam: tb, cor: COR.vermelho, erro: COR.vermelhoEscuro });
      L.texto(ctx, 'SOBERANO', 90, 560 + tb * 0.85, { tam: tb, cor: COR.vermelho, erro: COR.vermelhoEscuro });
      L.aplicarCarimbo(ctx, seg(t, 0.3, 0.6), W / 2, 1000, () => {
        L.texto(ctx, 'PARA QUEM?', W / 2, 1060, { familia: FONTE.bloco, peso: 400,
          tam: L.ajustar(ctx, 'PARA QUEM?', FONTE.bloco, W - 180, 400), cor: COR.tinta, alinhar: 'center' });
      }, 21);
      L.aplicarCarimbo(ctx, seg(t, 0.7, 1.0), W / 2, 1380, () => L.estrela(ctx, W / 2, 1380, 150, 0.1, COR.vermelho), 25);
      L.texto(ctx, 'CONSTRUTIVISMO TROPICAL', W / 2, 1560, { familia: FONTE.sub, peso: 600, tam: 40, cor: COR.vermelho, alinhar: 'center', tracking: 5 });
    }
  },
};
