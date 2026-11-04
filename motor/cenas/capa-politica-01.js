// Capa do vídeo atual, "Política é da sua conta! · EP. 1: Você já vive a política", no mesmo estilo da capa do
// "Desmistificando o Comunismo" (capa-comunismo-02.js): mesma logo, mesmas fontes, tamanhos, sombras e textura.
// Arte de grupo sem fundo (PNG transparente) grande, apoiada na borda de baixo. Layout organizado, sem elementos extras.
// Render: node motor/render.js capa-politica-01 saida/capa-politica-01.png --still 1
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagens: {
    logo: '../midia/politica-01/logo-coletivo-vermelha.png',   // logo do coletivo (pomba + nome), PNG sem fundo
    arte: '../midia/politica-01/arte-grupo-recorte.png',       // arte de grupo sem fundo (1536×1024)
  },
  desenhar(ctx, t, L) {
    const { COR, FONTE } = L, W = 1080, H = 1920, CX = 540;
    L.fundo(ctx, COR.amarelo);
    L.raios(ctx, CX, 1250, 2400, 22, 0, 'rgba(214,157,28,1)');
    // logo do coletivo: mesmo tamanho e posição da logo da capa do comunismo (340 px de largura)
    L.imagem(ctx, L.img.logo, CX, 370, 340);
    // título: faixa escura + texto bege, com sombra vermelha
    ctx.fillStyle = COR.tinta; ctx.fillRect(130, 470, 820, 96);
    const t1 = Math.min(104, L.ajustar(ctx, 'POLÍTICA É DA SUA', FONTE.manchete, 780));
    L.texto(ctx, 'POLÍTICA É DA SUA', CX, 552, { tam: t1, cor: COR.bege, alinhar: 'center', erro: COR.vermelho, desloc: 4 });
    // palavra grande em vermelho com sombra escura
    const t2 = Math.min(210, L.ajustar(ctx, 'CONTA!', FONTE.bloco, 940, 400));
    L.texto(ctx, 'CONTA!', CX, 644 + t2 * 0.36, { familia: FONTE.bloco, peso: 400, tam: t2, cor: COR.vermelho, alinhar: 'center', erro: COR.tinta, desloc: 9 });
    // apresentadora: traço vermelho + nome, alinhado à direita
    L.fonte(ctx, FONTE.manchete, 40, 900); ctx.letterSpacing = '6px'; const w = ctx.measureText('COM EDUARDA PRADO').width; ctx.letterSpacing = '0px';
    ctx.fillStyle = COR.vermelho; ctx.fillRect(1000 - w - 86, 758, 60, 5);
    L.texto(ctx, 'COM EDUARDA PRADO', 1000, 775, { tam: 40, cor: COR.tinta, alinhar: 'right', tracking: 6 });
    // etiqueta do episódio
    L.etiqueta(ctx, 'EP. 1 · VOCÊ JÁ VIVE A POLÍTICA', CX, 845, 1, { cor: COR.tinta, corTexto: COR.bege, tam: 40 });
    // arte em destaque, base encostada na borda da capa
    // arte maior, com a base encostada exatamente na borda de baixo da capa (sem borda visível cortando as pessoas)
    const A = L.img.arte, aw = 1280, ah = Math.round(A.height * aw / A.width);
    ctx.drawImage(A, (W - aw) / 2, H - ah, aw, ah);
    L.papel(ctx, 1, 0.12); L.vinheta(ctx, 0.3);
  },
};
