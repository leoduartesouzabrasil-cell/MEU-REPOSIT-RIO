// Capa do Reels "Esquerda cirandeira" — cartaz em fundo AMARELO: Lula à frente, Janones à esquerda e Manuela à direita.
// Artes enviadas pelo autor: capa-arte-{lula,janones,manuela}.png → recorte (rembg) → capa-*-recorte.png
// Render: node motor/render.js capa-esquerda-cirandeira saida/capa-cirandeira.png --still 1
const DIR = '../midia/esquerda-cirandeira/';
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagens: {
    lula: DIR + 'capa-lula-recorte.png', janones: DIR + 'capa-janones-recorte.png', manuela: DIR + 'capa-manuela-recorte.png',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },
  desenhar(ctx, t, L) {
    const { COR, FONTE } = L, W = 1080, H = 1920, CX = 540, LARG = 900;
    L.fundo(ctx, COR.amarelo);
    L.raios(ctx, CX, 1150, 1800, 24, 0.04, 'rgba(176,118,40,0.22)');
    // a roda da ciranda: anel vermelho atrás dos três
    ctx.strokeStyle = COR.vermelho; ctx.lineWidth = 46; ctx.beginPath(); ctx.arc(CX, 1130, 430, 0, 7); ctx.stroke();

    // figura recortada, subindo da borda de baixo, com sombra de tinta deslocada
    function figura(img, [bx0, by0, bx1], cx, alt, sombra = 16) {
      const esc = alt / (img.height - by0), w = img.width * esc, h = img.height * esc;
      const x = cx - ((bx0 + bx1) / 2) * esc, y = H - h;
      const s = document.createElement('canvas'); s.width = img.width; s.height = img.height;
      const g = s.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-in';
      g.fillStyle = COR.tinta; g.fillRect(0, 0, img.width, img.height);
      ctx.drawImage(s, x + sombra, y + sombra * 0.7, w, h);
      ctx.drawImage(img, x, y, w, h);
    }
    figura(L.img.janones, [175, 29, 1352], 140, 880);       // atrás, à esquerda
    figura(L.img.manuela, [253, 16, 1282], 950, 890);      // atrás, à direita
    figura(L.img.lula, [319, 41, 1220], CX, 1130, 20);      // à frente, no centro

    // logo + título
    L.imagem(ctx, L.img.logo, CX, 205, 270);
    const t1 = Math.min(150, L.ajustar(ctx, 'ESQUERDA CIRANDEIRA:', FONTE.manchete, LARG));
    L.texto(ctx, 'ESQUERDA CIRANDEIRA:', CX, 410, { tam: t1, cor: COR.vermelho, alinhar: 'center', erro: COR.tinta, desloc: 6 });
    ctx.save(); ctx.translate(CX, 500); ctx.rotate(-0.02);
    ctx.fillStyle = COR.tinta; ctx.fillRect(-LARG / 2, -52, LARG, 104);
    const t2 = Math.min(76, L.ajustar(ctx, 'É HORA DE RADICALIZAR!', FONTE.bloco, LARG - 60, 400));
    L.texto(ctx, 'É HORA DE RADICALIZAR!', 0, t2 * 0.36, { familia: FONTE.bloco, peso: 400, tam: t2, cor: COR.amarelo, alinhar: 'center' });
    ctx.restore();

    L.papel(ctx, 1, 0.12); L.vinheta(ctx, 0.3);
  },
};
