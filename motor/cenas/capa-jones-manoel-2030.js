// Capa do Reels "Uma nova via" — cartaz em fundo VERMELHO: o quadro do Lula atrás, o Jones na frente.
// Artes enviadas pelo autor: capa-arte-lula-quadro.png (quadro recortado aqui) e capa-arte-jones.png (→ rembg → capa-jones-recorte.png)
// Render: node motor/render.js capa-jones-manoel-2030 saida/capa-jones.png --still 1
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagens: {
    quadro: '../midia/jones-manoel-2030/capa-arte-lula-quadro.png',
    jones: '../midia/jones-manoel-2030/capa-jones-recorte.png',
    logo: '../identidade/marca/o-camarada-bege.png',              // bege: o vermelho some no fundo vermelho
  },
  desenhar(ctx, t, L) {
    const { COR, FONTE } = L, W = 1080, H = 1920, CX = 540, LARG = 900;
    L.fundo(ctx, '#D3140A');
    L.raios(ctx, CX, 1150, 1800, 24, 0.04, 'rgba(120,10,8,0.30)');

    // quadro do Lula: recorte da moldura na arte, levemente inclinado, com sombra
    const q = L.img.quadro, [qx, qy, qw, qh] = [340, 35, 855, 957], wq = 660, hq = wq * qh / qw;
    ctx.save(); ctx.translate(CX - 10, 560 + hq / 2); ctx.rotate(-0.035);
    ctx.fillStyle = 'rgba(28,23,20,0.45)'; ctx.fillRect(-wq / 2 + 18, -hq / 2 + 22, wq, hq);
    ctx.drawImage(q, qx, qy, qw, qh, -wq / 2, -hq / 2, wq, hq);
    ctx.restore();

    // Jones na frente: sobe da borda de baixo, com sombra de tinta deslocada
    const f = L.img.jones, bx0 = 340, bx1 = 1250, by0 = 48;            // caixa da figura na arte (px)
    const esc = 1000 / (f.height - by0), w = f.width * esc, h = f.height * esc;
    const x = CX - ((bx0 + bx1) / 2) * esc, y = H - h;
    const sombra = document.createElement('canvas'); sombra.width = f.width; sombra.height = f.height;
    const g = sombra.getContext('2d'); g.drawImage(f, 0, 0); g.globalCompositeOperation = 'source-in';
    g.fillStyle = COR.tinta; g.fillRect(0, 0, f.width, f.height);
    ctx.drawImage(sombra, x + 18, y + 12, w, h);
    ctx.drawImage(f, x, y, w, h);

    // logo + título
    L.imagem(ctx, L.img.logo, CX, 205, 270);
    const t1 = Math.min(190, L.ajustar(ctx, '#JONES2030:', FONTE.manchete, LARG));
    L.texto(ctx, '#JONES2030:', CX, 410, { tam: t1, cor: COR.amarelo, alinhar: 'center', erro: COR.tinta, desloc: 7 });
    ctx.save(); ctx.translate(CX, 488); ctx.rotate(-0.02);
    ctx.fillStyle = COR.tinta; ctx.fillRect(-LARG / 2, -50, LARG, 100);
    const t2 = Math.min(72, L.ajustar(ctx, 'A ESQUERDA TEM ESPERANÇA?', FONTE.bloco, LARG - 60, 400));
    L.texto(ctx, 'A ESQUERDA TEM ESPERANÇA?', 0, t2 * 0.36, { familia: FONTE.bloco, peso: 400, tam: t2, cor: COR.bege, alinhar: 'center' });
    ctx.restore();

    L.papel(ctx, 1, 0.12); L.vinheta(ctx, 0.3);
  },
};
