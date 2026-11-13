// Capa do Reels "5 curiosidades da China" com a arte do autor RECORTADA (sem o fundo amarelo: arte-capa-recorte.png,
// bandeira + moldura com o Mao). Cartaz soviético: fundo carvão com brasa e raios vermelhos, título em escada (bege + amarelo).
// Miolo do grid 3:4: y 240–1680. Render: node motor/render.js capa-china-5-curiosidades saida/china-capa.png --still 1
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagens: {
    arte: '../midia/china-5-curiosidades/arte-capa-recorte.png',
    logo: '../identidade/marca/o-camarada-bege.png',
  },
  desenhar(ctx, t, L) {
    const { COR, FONTE } = L, W = 1080, H = 1920, CX = 540, a = L.img.arte;
    L.fundo(ctx, COR.carvao);
    L.raios(ctx, CX, 1250, 2600, 22, -0.22, 'rgba(138,20,17,0.55)');
    L.brasa(ctx, 0, H * 0.5, W, H * 0.5, 9);
    // a arte recortada (conteúdo x 270–1368, y 24–989 na arte) ocupando a largura, com sombra chapada
    const x0 = 270, x1 = 1368, y0 = 24, y1 = 989, esc = (W + 60) / (x1 - x0);
    const w = (x1 - x0) * esc, h = (y1 - y0) * esc, x = CX - w / 2, y = 1900 - h;
    ctx.save(); ctx.filter = 'brightness(0) opacity(0.6)'; ctx.drawImage(a, x0, y0, x1 - x0, y1 - y0, x + 18, y + 22, w, h); ctx.restore();
    ctx.drawImage(a, x0, y0, x1 - x0, y1 - y0, x, y, w, h);
    L.imagem(ctx, L.img.logo, CX, 290, 300);
    const linha = (s, yy, fam, tam, cor) => {
      ctx.save(); ctx.translate(CX, yy); ctx.rotate(-0.07);
      const peso = fam === FONTE.bloco ? 400 : 900;
      L.texto(ctx, s, 0, 0, { familia: fam, peso, tam: Math.min(tam, L.ajustar(ctx, s, fam, 960, peso)), cor, alinhar: 'center', erro: COR.vermelho, desloc: 7 });
      ctx.restore();
    };
    linha('5 COISAS QUE VOCÊ', 480, FONTE.manchete, 140, COR.bege);
    linha('NÃO SABE SOBRE A', 620, FONTE.manchete, 140, COR.bege);
    linha('CHINA COMUNISTA!', 785, FONTE.bloco, 150, COR.amarelo);
    L.papel(ctx, 1, 0.14); L.vinheta(ctx, 0.45);
  },
};
