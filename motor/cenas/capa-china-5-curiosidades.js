// Capa do Reels "5 curiosidades da China" com a arte do autor RECORTADA (arte-capa-recorte.png: bandeira + moldura com o Mao).
// Mesmas proporções das outras capas (videos/*-capa.jpg): logos no topo, título no alto, arte centralizada dentro do grid 3:4 (y 240–1680).
// Título: "5 COISAS QUE VOCÊ NÃO SABE SOBRE A" pequeno; "CHINA" grande com o bloco "COMUNISTA!" ao lado.
// Logos: O Camarada nova (mascote, horizontal) + Léo Duarte. Render: node motor/render.js capa-china-5-curiosidades saida/china-capa.png --still 1
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagensOpcionais: true,
  imagens: {
    arte: '../midia/china-5-curiosidades/arte-capa-recorte.png',
    camarada: '../identidade/marca/o-camarada-mascote-horizontal.png',
    leo: '../identidade/marca/leo-duarte.png',
  },
  desenhar(ctx, t, L) {
    const { COR, FONTE } = L, W = 1080, H = 1920, CX = 540, a = L.img.arte;
    const tem = k => L.img[k] && L.img[k].naturalWidth > 0;
    L.fundo(ctx, COR.carvao);
    L.raios(ctx, CX, 1250, 2600, 22, -0.22, 'rgba(138,20,17,0.55)');
    L.brasa(ctx, 0, H * 0.55, W, H * 0.45, 9);

    // logos no topo: O Camarada | Léo Duarte
    const yl = 345;
    const temLeo = tem('leo'), hl = 92, hLeo = 150, hTag = temLeo ? hLeo : hl;
    const wc = hl * L.img.camarada.width / L.img.camarada.height, wl = temLeo ? hLeo * L.img.leo.width / L.img.leo.height : 0;
    const gapL = temLeo ? 70 : 0, total = wc + gapL + wl, xl = CX - total / 2;
    ctx.save(); ctx.translate(CX, yl); ctx.rotate(-0.02);
    ctx.fillStyle = COR.tinta; ctx.fillRect(-total / 2 - 44 + 8, -hTag / 2 - 22 + 8, total + 88, hTag + 44);
    ctx.fillStyle = COR.bege; ctx.fillRect(-total / 2 - 44, -hTag / 2 - 22, total + 88, hTag + 44);
    ctx.restore();
    L.imagem(ctx, L.img.camarada, xl + wc / 2, yl, wc);
    if (temLeo) {
      ctx.fillStyle = COR.tinta; ctx.fillRect(xl + wc + gapL / 2 - 2, yl - hTag / 2 + 10, 4, hTag - 20);
      L.imagem(ctx, L.img.leo, xl + wc + gapL + wl / 2, yl, wl);
    }

    // título
    const sub = '5 COISAS QUE VOCÊ NÃO SABE SOBRE A';
    L.texto(ctx, sub, CX, 535, { familia: FONTE.sub, peso: 600, tam: Math.min(62, L.ajustar(ctx, sub, FONTE.sub, 900, 600)), cor: COR.bege, alinhar: 'center', erro: COR.vermelho, desloc: 4 });
    // CHINA grande + bloco COMUNISTA!
    const medir = (txt, tam) => { L.fonte(ctx, FONTE.bloco, tam, 400); return ctx.measureText(txt).width; };
    const bloco = 'COMUNISTA!';
    const larguraTotal = k => medir('CHINA', 250 * k) + 26 * k + medir(bloco, 56 * k) + 50 * k;
    const k = Math.min(1, 940 / larguraTotal(1));
    const tC = 250 * k, tB = 56 * k, wC = medir('CHINA', tC), wB = medir(bloco, tB) + 50 * k, hB = 96 * k, gap = 26 * k;
    const tot = wC + gap + wB, xC = CX - tot / 2, yC = 765;
    L.texto(ctx, 'CHINA', xC, yC, { familia: FONTE.bloco, peso: 400, tam: tC, cor: COR.amarelo, erro: COR.vermelho, desloc: 9 });
    ctx.save(); ctx.translate(xC + wC + gap + wB / 2, yC - 95 * k); ctx.rotate(-0.06);
    ctx.fillStyle = COR.tinta; ctx.fillRect(-wB / 2 + 7, -hB / 2 + 7, wB, hB);
    ctx.fillStyle = COR.vermelho; ctx.fillRect(-wB / 2, -hB / 2, wB, hB);
    ctx.strokeStyle = COR.bege; ctx.lineWidth = 3; ctx.strokeRect(-wB / 2 + 7, -hB / 2 + 7, wB - 14, hB - 14);
    L.texto(ctx, bloco, 0, tB * 0.36, { familia: FONTE.bloco, peso: 400, tam: tB, cor: COR.bege, alinhar: 'center' });
    ctx.restore();

    // a arte recortada (conteúdo x 270–1368, y 24–989 na arte), centralizada e menor, cabendo no grid
    const x0 = 270, x1 = 1368, y0 = 24, y1 = 989, wA = 860, esc = wA / (x1 - x0);
    const hA = (y1 - y0) * esc, xA = CX - wA / 2, yA = 1665 - hA;
    ctx.save(); ctx.filter = 'brightness(0) opacity(0.6)'; ctx.drawImage(a, x0, y0, x1 - x0, y1 - y0, xA + 16, yA + 20, wA, hA); ctx.restore();
    ctx.drawImage(a, x0, y0, x1 - x0, y1 - y0, xA, yA, wA, hA);
    L.papel(ctx, 1, 0.14); L.vinheta(ctx, 0.45);
  },
};
