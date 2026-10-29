// Capa do Reels "Veneno na água" (modo TENSO). Quadro único 1080×1920; o miolo 1080×1440 aparece no grid do perfil.
// Render: node motor/render.js capa-indigenas-ms saida/capa-indigenas-ms.png --still 1
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagens: {
    pessoa: '../midia/indigenas-ms/valdelice-veron-recorte.png',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE } = L, W = 1080;
    L.fundo(ctx, COR.carvao);
    L.raios(ctx, W / 2, 1000, 1700, 22, 0, 'rgba(94,11,10,0.55)');

    // pessoa recortada: P&B com o vermelho preservado + sombra vermelha deslocada (erro de impressão)
    const img = L.img.pessoa, h = 1300, w = img.width * h / img.height, x = W / 2 - w / 2, y = 640;
    const sombra = document.createElement('canvas'); sombra.width = img.width; sombra.height = img.height;
    const g = sombra.getContext('2d'); g.drawImage(img, 0, 0);
    g.globalCompositeOperation = 'source-in'; g.fillStyle = COR.vermelho; g.fillRect(0, 0, img.width, img.height);
    ctx.drawImage(sombra, x + 18, y + 10, w, h);
    L.foto(ctx, img, x, y, w, h, { seletiva: true, retic: false });

    // logo pequeno no topo
    L.imagem(ctx, L.img.logo, W / 2, 290, 360);

    // título
    const tam = L.ajustar(ctx, 'NOSSOS POVOS', FONTE.manchete, W - 200);
    L.texto(ctx, 'PROTEJAM OS', W / 2, 440 + tam * 0.78, { tam, cor: COR.bege, alinhar: 'center', erro: COR.vermelho, desloc: 6 });
    L.texto(ctx, 'NOSSOS POVOS', W / 2, 440 + tam * 1.6, { tam, cor: COR.bege, alinhar: 'center', erro: COR.vermelho, desloc: 6 });

    ctx.fillStyle = COR.vermelho; ctx.fillRect(0, 1440, W, 220);
    L.texto(ctx, 'INDÍGENAS', W / 2, 1610, { familia: FONTE.bloco, peso: 400,
      tam: L.ajustar(ctx, 'INDÍGENAS', FONTE.bloco, W - 120, 400), cor: COR.carvao, alinhar: 'center' });
    L.escorrer(ctx, 0, 1658, W, 1, COR.vermelho, 93, 150);

    const faixa = ctx.createLinearGradient(0, 1780, 0, 1920);
    faixa.addColorStop(0, 'rgba(15,12,11,0)'); faixa.addColorStop(0.5, COR.carvao);
    ctx.fillStyle = faixa; ctx.fillRect(0, 1780, W, 140);
    L.texto(ctx, 'Na foto: Valdelice Veron, liderança Guarani Kaiowá · Foto: Rafa Neddermeyer/Agência Brasil', W / 2, 1870,
      { familia: FONTE.maquina, peso: 400, tam: 22, cor: COR.begeEscuro, alinhar: 'center' });
    L.papel(ctx, 1, 0.15); L.vinheta(ctx, 0.55);
  },
};
