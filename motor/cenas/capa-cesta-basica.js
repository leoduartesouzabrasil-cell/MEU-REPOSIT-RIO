// Capa do Reels "A sua compra no mercado vai ficar mais cara com o Lula?" — arte enviada pelo autor (mão segurando as
// fotos em chamas), em fundo amarelo da própria arte (#FEC901, amostrado nas bordas, para não ter emenda).
// Render: node motor/render.js capa-cesta-basica saida/capa-cesta.png --still 1
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagens: {
    arte: '../midia/cesta-basica/capa-arte.png',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },
  desenhar(ctx, t, L) {
    const { COR, FONTE } = L, W = 1080, H = 1920, CX = 540, LARG = 900;
    L.fundo(ctx, '#FEC901');
    // a arte (1024×1536) inteira, na largura da tela, abaixo do título
    const a = L.img.arte, esc = 1.05, aw = a.width * esc, ah = a.height * esc;
    ctx.drawImage(a, CX - aw / 2, 470, aw, ah);                          // sobe: fotos inteiras no recorte 3:4 do grid

    // logo + título
    L.imagem(ctx, L.img.logo, CX, 300, 220);
    const t1 = Math.min(130, L.ajustar(ctx, 'CUIDADO COM A FAKE NEWS:', FONTE.manchete, LARG));
    L.texto(ctx, 'CUIDADO COM A FAKE NEWS:', CX, 455, { tam: t1, cor: COR.vermelho, alinhar: 'center', erro: COR.tinta, desloc: 6 });
    ctx.save(); ctx.translate(CX, 580); ctx.rotate(-0.02);
    ctx.fillStyle = COR.tinta; ctx.fillRect(-LARG / 2, -95, LARG, 190);
    [['SUA COMPRA NO MERCADO', -18], ['NÃO VAI ENCARECER!', 64]].forEach(([s, y], k) => {
      const tam = Math.min(72, L.ajustar(ctx, s, FONTE.bloco, LARG - 60, 400));
      L.texto(ctx, s, 0, y, { familia: FONTE.bloco, peso: 400, tam, cor: k ? COR.bege : '#FEC901', alinhar: 'center' });
    });
    ctx.restore();

    L.papel(ctx, 1, 0.12); L.vinheta(ctx, 0.3);
  },
};
