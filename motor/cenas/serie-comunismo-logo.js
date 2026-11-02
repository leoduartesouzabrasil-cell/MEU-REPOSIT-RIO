// Vinheta/logo da série "DESMISTIFICANDO O COMUNISMO" (abre cada episódio depois do gancho). Curta: 3,5 s.
// Pedido do autor: "O COMUNISMO" em mais destaque (maior), "com Léo Duarte" embaixo, depois o episódio.
// Prévia: node motor/render.js serie-comunismo-logo saida/serie-logo.png --still 2.2
// Para outro episódio, troque EP (ou passe a vinheta como componente para a cena do episódio).
const EP = 'EP. 1 · O QUE É O COMUNISMO?';
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 3.5,
  imagens: { logo: '../identidade/marca/o-camarada-bege.png' },
  desenhar(ctx, t, L) {
    const { COR, FONTE, seg } = L, CX = 540;
    L.fundo(ctx, COR.vermelho);
    L.raios(ctx, CX, 1180, 2400, 22, -0.25 + L.emDois(t) * 0.04, 'rgba(138,20,17,0.5)');
    L.imagem(ctx, L.img.logo, CX, 300, 230, seg(t, 0, 0.3));
    // estrela com foice e martelo
    L.aplicarCarimbo(ctx, seg(t, 0.0, 0.25), CX, 700, () => L.estrela(ctx, CX, 700, 200, 0, COR.amarelo), 3);
    L.aplicarCarimbo(ctx, seg(t, 0.15, 0.4), CX, 710, () => L.foiceMartelo(ctx, CX, 710, 165, COR.vermelho), 4);
    // DESMISTIFICANDO (menor, em faixa de tinta)
    L.aplicarCarimbo(ctx, seg(t, 0.35, 0.6), CX, 985, () => {
      ctx.fillStyle = COR.tinta; ctx.fillRect(170, 935, 740, 100);
      const tam = Math.min(108, L.ajustar(ctx, 'DESMISTIFICANDO', FONTE.manchete, 700));
      L.texto(ctx, 'DESMISTIFICANDO', CX, 1020, { tam, cor: COR.bege, alinhar: 'center', erro: COR.vermelho, desloc: 4 });
    }, 5);
    // O COMUNISMO (o destaque: o maior texto da vinheta)
    L.aplicarCarimbo(ctx, seg(t, 0.55, 0.85), CX, 1150, () => {
      ctx.save(); ctx.translate(CX, 1150); ctx.rotate(-0.04);
      L.texto(ctx, 'O', -400, 20, { familia: FONTE.bloco, peso: 400, tam: 110, cor: COR.amarelo, alinhar: 'center', erro: COR.tinta, desloc: 6 });
      const tam = Math.min(190, L.ajustar(ctx, 'COMUNISMO', FONTE.bloco, 800, 400));
      L.texto(ctx, 'COMUNISMO', 60, tam * 0.36, { familia: FONTE.bloco, peso: 400, tam, cor: COR.amarelo, alinhar: 'center', erro: COR.tinta, desloc: 9 });
      ctx.restore();
    }, 6);
    // com Léo Duarte
    if (t > 0.9) {
      ctx.save(); ctx.globalAlpha = seg(t, 0.9, 1.15);
      L.texto(ctx, 'com Léo Duarte', CX, 1320, { familia: FONTE.serifa, estilo: 'italic', peso: 400, tam: 72, cor: COR.bege, alinhar: 'center' });
      ctx.restore();
    }
    // episódio
    if (t > 1.2) L.etiqueta(ctx, EP, CX, 1440, seg(t, 1.2, 1.45), { cor: COR.tinta, corTexto: COR.bege, tam: 40 });
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);
  },
};
