// Capa do Reels "Desmistificando o Comunismo · EP. 2: O que é socialismo?", idêntica à capa do EP. 1 (capa-comunismo-01.js):
// mesma arte da vinheta da série; só muda o episódio. Marx e Engels (recorte do autor) apoiados na borda de baixo.
// Render: node motor/render.js capa-comunismo-02 saida/capa-comunismo-02.png --still 1
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagens: {
    figuras: '../midia/comunismo-01/capa-marx-engels-recorte.png',   // 1536×1024; figuras de x 13 a 1517, encostadas embaixo
    logo: '../identidade/marca/o-camarada-bege.png',
  },
  desenhar(ctx, t, L) {
    const { COR, FONTE } = L, W = 1080, H = 1920, CX = 540;
    L.fundo(ctx, COR.vermelho);
    L.raios(ctx, CX, 1250, 2400, 22, -0.25, 'rgba(138,20,17,0.5)');
    L.imagem(ctx, L.img.logo, CX, 440, 340);
    ctx.fillStyle = COR.tinta; ctx.fillRect(130, 590, 820, 96);
    const t1 = Math.min(104, L.ajustar(ctx, 'DESMISTIFICANDO O', FONTE.manchete, 780));
    L.texto(ctx, 'DESMISTIFICANDO O', CX, 672, { tam: t1, cor: COR.bege, alinhar: 'center', erro: COR.vermelho, desloc: 4 });
    const t2 = Math.min(210, L.ajustar(ctx, 'COMUNISMO', FONTE.bloco, 940, 400));
    L.texto(ctx, 'COMUNISMO', CX, 764 + t2 * 0.36, { familia: FONTE.bloco, peso: 400, tam: t2, cor: COR.amarelo, alinhar: 'center', erro: COR.tinta, desloc: 9 });
    L.fonte(ctx, FONTE.manchete, 40, 900); ctx.letterSpacing = '6px'; const w = ctx.measureText('COM LÉO DUARTE').width; ctx.letterSpacing = '0px';
    ctx.fillStyle = COR.amarelo; ctx.fillRect(1000 - w - 86, 878, 60, 5);
    L.texto(ctx, 'COM LÉO DUARTE', 1000, 895, { tam: 40, cor: COR.bege, alinhar: 'right', tracking: 6 });
    const img = L.img.figuras, esc = 0.95, iw = img.width * esc, ih = img.height * esc;
    const x = CX - ((13 + 1517) / 2) * esc, y = H - ih;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.drawImage(img, x, y, iw, ih);
    const s = document.createElement('canvas'); s.width = W; s.height = H;
    const gs = s.getContext('2d'); gs.drawImage(c, 0, 0); gs.globalCompositeOperation = 'source-in';
    gs.fillStyle = COR.tinta; gs.fillRect(0, 0, W, H);
    ctx.drawImage(s, -16, 0); ctx.drawImage(c, 0, 0);
    L.etiqueta(ctx, 'EP. 2 · O QUE É SOCIALISMO?', CX, 975, 1, { cor: COR.tinta, corTexto: COR.bege, tam: 40 });
    L.papel(ctx, 1, 0.12); L.vinheta(ctx, 0.3);
  },
};
