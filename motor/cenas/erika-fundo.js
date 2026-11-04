// Fundo da abertura do trecho da Erika Hilton: o mesmo papel, granulação e vinheta do motor, com a moldura do Jones
// (mesma janela da cena do comunismo). O vídeo entra por cima (ffmpeg), como no gancho do Jones.
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 1, imagens: {},
  desenhar(ctx, t, L) {
    const { COR } = L;
    L.fundo(ctx, COR.bege);
    L.moldura(ctx, 195, 445, 690, 880, 30);
    ctx.fillStyle = COR.tinta; ctx.fillRect(195, 445, 690, 880);
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);
  },
};
