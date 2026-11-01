// Capa do Reels "Okê, caboclo" — cartaz soviético em fundo AMARELO a partir da arte enviada (mão erguendo a imagem do caboclo).
// Arte: midia/umbanda-caboclos/capa-arte-mao-caboclo.png → recorte (rembg) → capa-arte-recorte.png
// Render: node motor/render.js capa-umbanda-caboclos-arte saida/capa.png --still 1
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagens: {
    figura: '../midia/umbanda-caboclos/capa-arte-recorte.png',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },
  desenhar(ctx, t, L) {
    const { COR, FONTE } = L, W = 1080, H = 1920, CX = 540, LARG = 900;
    L.fundo(ctx, COR.amarelo);
    // sol vermelho com raios atrás da figura
    L.raios(ctx, CX, 1080, 1700, 24, 0.05, 'rgba(176,118,40,0.22)');
    ctx.fillStyle = COR.vermelho; ctx.beginPath(); ctx.arc(CX, 1080, 400, 0, 7); ctx.fill();

    // mão erguendo o caboclo: sobe da borda de baixo, com sombra de tinta deslocada
    const f = L.img.figura, bx0 = 562, bx1 = 942, by0 = 32;           // caixa da figura na arte (px)
    const esc = 1290 / (f.height - by0), w = f.width * esc, h = f.height * esc;
    const x = CX - ((bx0 + bx1) / 2) * esc, y = H - h;
    const sombra = document.createElement('canvas'); sombra.width = f.width; sombra.height = f.height;
    const g = sombra.getContext('2d'); g.drawImage(f, 0, 0); g.globalCompositeOperation = 'source-in';
    g.fillStyle = COR.tinta; g.fillRect(0, 0, f.width, f.height);
    ctx.drawImage(sombra, x + 16, y + 10, w, h);
    ctx.drawImage(f, x, y, w, h);

    // logo + título
    L.imagem(ctx, L.img.logo, CX, 260, 300);
    const t1 = L.ajustar(ctx, 'CABOCLOS E INDÍGENAS:', FONTE.manchete, LARG);
    L.texto(ctx, 'CABOCLOS E INDÍGENAS:', CX, 360 + t1 * 0.72, { tam: t1, cor: COR.vermelho, alinhar: 'center', erro: COR.tinta, desloc: 5 });
    const yb = 360 + t1 * 0.72 + 30;                                    // faixa de tinta com o chamado
    ctx.save(); ctx.translate(CX, yb + 60); ctx.rotate(-0.025);
    ctx.fillStyle = COR.tinta; ctx.fillRect(-LARG / 2, -60, LARG, 120);
    const t2 = Math.min(96, L.ajustar(ctx, 'HONRE SEUS ANCESTRAIS', FONTE.bloco, LARG - 70, 400));
    L.texto(ctx, 'HONRE SEUS ANCESTRAIS', 0, t2 * 0.36, { familia: FONTE.bloco, peso: 400, tam: t2, cor: COR.amarelo, alinhar: 'center' });
    ctx.restore();

    L.papel(ctx, 1, 0.12); L.vinheta(ctx, 0.3);
  },
};
