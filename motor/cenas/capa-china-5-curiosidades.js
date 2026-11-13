// Capa do Reels "5 curiosidades da China" sobre a arte do autor (1536×1024, fundo amarelo, Mao na moldura com a bandeira).
// O amarelo da arte é estendido para cima; título em escada inclinada (tinta + vermelho). Miolo do grid 3:4: y 240–1680.
// Render: node motor/render.js capa-china-5-curiosidades saida/china-capa.png --still 1
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagens: {
    arte: '../midia/china-5-curiosidades/arte-capa.png',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },
  desenhar(ctx, t, L) {
    const { COR, FONTE } = L, W = 1080, H = 1920, CX = 540, a = L.img.arte;
    const AMARELO = '#FDC501';
    L.fundo(ctx, AMARELO);
    // a arte: bandeira + moldura (x 270–1370 na arte) ocupando a largura, encostada embaixo
    const fx0 = 270, fx1 = 1370, esc = (W + 20) / (fx1 - fx0);
    const aw = a.width * esc, ah = a.height * esc, ax = CX - ((fx0 + fx1) / 2) * esc, ay = H - ah + 40;
    ctx.drawImage(a, ax, ay, aw, ah);
    // raios de sol discretos no amarelo, atrás do título
    ctx.save(); ctx.globalAlpha = 0.18; L.raios(ctx, CX, ay + 200, 1600, 20, -0.2, COR.vermelho); ctx.restore();
    ctx.drawImage(a, ax, ay, aw, ah);   // a arte por cima dos raios
    L.imagem(ctx, L.img.logo, CX, 300, 300);
    const linha = (s, y, fam, tam, cor, sombra = COR.tinta) => {
      ctx.save(); ctx.translate(CX, y); ctx.rotate(-0.07);
      const peso = fam === FONTE.bloco ? 400 : 900;
      L.texto(ctx, s, 0, 0, { familia: fam, peso, tam: Math.min(tam, L.ajustar(ctx, s, fam, 960, peso)), cor, alinhar: 'center', erro: sombra, desloc: 7 });
      ctx.restore();
    };
    linha('5 COISAS QUE VOCÊ', 500, FONTE.manchete, 140, COR.tinta, COR.vermelho);
    linha('NÃO SABE SOBRE A', 640, FONTE.manchete, 140, COR.tinta, COR.vermelho);
    linha('CHINA COMUNISTA!', 810, FONTE.bloco, 150, COR.vermelho, COR.tinta);
    L.papel(ctx, 1, 0.1); L.vinheta(ctx, 0.3);
  },
};
