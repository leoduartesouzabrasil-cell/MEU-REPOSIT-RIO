// Vinheta/logo da série "DESMISTIFICANDO O COMUNISMO" (abre cada episódio depois do gancho).
// Prévia: node motor/render.js serie-comunismo-logo saida/serie-logo.png --still 2.2
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 3,
  imagens: { logo: '../identidade/marca/o-camarada-bege.png' },
  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, ease } = L, CX = 540;
    L.fundo(ctx, COR.vermelho);
    L.raios(ctx, CX, 1180, 2400, 22, -0.25 + L.emDois(t) * 0.04, 'rgba(138,20,17,0.5)');
    // estrela grande ao fundo
    L.aplicarCarimbo(ctx, seg(t, 0.05, 0.35), CX, 760, () => L.estrela(ctx, CX, 760, 230, 0, COR.amarelo), 3);
    L.aplicarCarimbo(ctx, seg(t, 0.25, 0.55), CX, 760, () => L.foiceMartelo(ctx, CX, 770, 190, COR.vermelho), 4);
    // nome da série
    L.aplicarCarimbo(ctx, seg(t, 0.5, 0.8), CX, 1110, () => {
      ctx.fillStyle = COR.tinta; ctx.fillRect(90, 1030, 900, 150);
      const tam = Math.min(170, L.ajustar(ctx, 'DESMISTIFICANDO', FONTE.manchete, 860));
      L.texto(ctx, 'DESMISTIFICANDO', CX, 1158, { tam, cor: COR.bege, alinhar: 'center', erro: COR.vermelho, desloc: 5 });
    }, 5);
    L.aplicarCarimbo(ctx, seg(t, 0.75, 1.05), CX, 1260, () => {
      ctx.save(); ctx.translate(CX, 1260); ctx.rotate(-0.04);
      const tam = Math.min(120, L.ajustar(ctx, 'O COMUNISMO', FONTE.bloco, 860, 400));
      L.texto(ctx, 'O COMUNISMO', 0, tam * 0.36, { familia: FONTE.bloco, peso: 400, tam, cor: COR.amarelo, alinhar: 'center', erro: COR.tinta, desloc: 7 });
      ctx.restore();
    }, 6);
    // episódio
    if (t > 1.2) L.etiqueta(ctx, 'EP. 1 · O QUE É O COMUNISMO?', CX, 1420, seg(t, 1.2, 1.5), { cor: COR.tinta, corTexto: COR.bege, tam: 40 });
    L.imagem(ctx, L.img.logo, CX, 300, 230, seg(t, 0, 0.4));
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);
  },
};
