// Capa do Reels "Desmistificando o Comunismo · EP. 3: O que é mais-valia?" — idêntica à do EP. 2 (capa-comunismo-02.js): muda o episódio e,
// no lugar do logo único, as logos novas d'O Camarada e do Coletivo Lufã lado a lado, do mesmo tamanho (pedido do autor); mesma arte da vinheta da série
// (fundo vermelho com raios, logo O Camarada maior no lugar da estrela, "DESMISTIFICANDO O" / "COMUNISMO" / "COM LÉO DUARTE", etiqueta do EP.)
// + arte do autor (Marx e Engels, capa-arte-marx-engels.png, fundo amarelo tirado com birefnet-general → capa-marx-engels-recorte.png),
// APOIADA NA BORDA DE BAIXO (sem flutuar), com sombra chapada.
// Render: node motor/render.js capa-comunismo-03 saida/capa-comunismo-03.png --still 1
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagens: {
    figuras: '../midia/comunismo-01/capa-marx-engels-recorte.png',   // 1536×1024; figuras de x 13 a 1517, encostadas embaixo
    oc: '../identidade/marca/variantes/o-camarada-v-' + (window.VAR_LOGO || 'amarela') + '.png',
    lufa: '../identidade/marca/variantes/lufa-v-' + (window.VAR_LUFA || 'amarela') + '.png',
  },
  desenhar(ctx, t, L) {
    const { COR, FONTE } = L, W = 1080, H = 1920, CX = 540;
    L.fundo(ctx, COR.vermelho);
    L.raios(ctx, CX, 1250, 2400, 22, -0.25, 'rgba(138,20,17,0.5)');
    // as duas logos lado a lado, mesma altura, no lugar do logo único (dentro do recorte 3:4 do grid, y 240–1680)
    const LH = 210, wa = LH * L.img.oc.width / L.img.oc.height, wb = LH * L.img.lufa.width / L.img.lufa.height, gap = 70, x0 = CX - (wa + gap + wb) / 2;
    ctx.drawImage(L.img.oc, x0, 425 - LH / 2, wa, LH); ctx.drawImage(L.img.lufa, x0 + wa + gap, 425 - LH / 2, wb, LH);
    // título, igual à vinheta
    ctx.fillStyle = COR.tinta; ctx.fillRect(130, 590, 820, 96);
    const t1 = Math.min(104, L.ajustar(ctx, 'DESMISTIFICANDO O', FONTE.manchete, 780));
    L.texto(ctx, 'DESMISTIFICANDO O', CX, 672, { tam: t1, cor: COR.bege, alinhar: 'center', erro: COR.vermelho, desloc: 4 });
    const t2 = Math.min(210, L.ajustar(ctx, 'COMUNISMO', FONTE.bloco, 940, 400));
    L.texto(ctx, 'COMUNISMO', CX, 764 + t2 * 0.36, { familia: FONTE.bloco, peso: 400, tam: t2, cor: COR.amarelo, alinhar: 'center', erro: COR.tinta, desloc: 9 });
    L.fonte(ctx, FONTE.manchete, 40, 900); ctx.letterSpacing = '6px'; const w = ctx.measureText('COM LÉO DUARTE').width; ctx.letterSpacing = '0px';
    ctx.fillStyle = COR.amarelo; ctx.fillRect(1000 - w - 86, 878, 60, 5);
    L.texto(ctx, 'COM LÉO DUARTE', 1000, 895, { tam: 40, cor: COR.bege, alinhar: 'right', tracking: 6 });
    // Marx e Engels apoiados na borda de baixo, com sombra chapada de tinta
    const img = L.img.figuras, esc = 0.95, iw = img.width * esc, ih = img.height * esc;
    const x = CX - ((13 + 1517) / 2) * esc, y = H - ih;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.drawImage(img, x, y, iw, ih);
    const s = document.createElement('canvas'); s.width = W; s.height = H;
    const gs = s.getContext('2d'); gs.drawImage(c, 0, 0); gs.globalCompositeOperation = 'source-in';
    gs.fillStyle = COR.tinta; gs.fillRect(0, 0, W, H);
    ctx.drawImage(s, -16, 0); ctx.drawImage(c, 0, 0);
    // episódio (por cima, antes das cabeças)
    L.etiqueta(ctx, 'EP. 3 · O QUE É MAIS-VALIA?', CX, 975, 1, { cor: COR.tinta, corTexto: COR.bege, tam: 40 });
    L.papel(ctx, 1, 0.12); L.vinheta(ctx, 0.3);
  },
};
