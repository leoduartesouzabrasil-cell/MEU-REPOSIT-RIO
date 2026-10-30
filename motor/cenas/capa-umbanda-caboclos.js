// Capa do Reels "Okê, caboclo" — mesmo modelo da capa anterior (arte inteira, logo + título em cima),
// agora com fundo AMARELO e a ilustração de um caboclo de Umbanda (gerada na OpenArt, Wan 2.7 Image, 9:16).
// Render: node motor/render.js capa-umbanda-caboclos saida/capa.png --still 1
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagens: {
    arte: '../midia/umbanda-caboclos/caboclo-openart.webp',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },
  desenhar(ctx, t, L) {
    const { COR, FONTE } = L, W = 1080, H = 1920, CX = 540, LARG = 900;
    const a = L.img.arte;
    // fundo liso na cor do papel amarelo da arte; a arte entra inteira, sem distorção, com bordas esfumadas
    ctx.fillStyle = '#D9B25C'; ctx.fillRect(0, 0, W, H);
    const esc = (H * 0.86) / a.height, aw = a.width * esc, ah = a.height * esc, ay = H - ah;
    const c = document.createElement('canvas'); c.width = Math.ceil(aw); c.height = Math.ceil(ah);
    const g = c.getContext('2d'); g.drawImage(a, 0, 0, aw, ah);
    g.globalCompositeOperation = 'destination-in';
    const mv = g.createLinearGradient(0, 0, 0, ah); mv.addColorStop(0, 'rgba(0,0,0,0)'); mv.addColorStop(140 / ah, 'rgba(0,0,0,1)'); mv.addColorStop(1, 'rgba(0,0,0,1)');
    g.fillStyle = mv; g.fillRect(0, 0, aw, ah);
    const mh = g.createLinearGradient(0, 0, aw, 0); mh.addColorStop(0, 'rgba(0,0,0,0)'); mh.addColorStop(70 / aw, 'rgba(0,0,0,1)');
    mh.addColorStop(1 - 70 / aw, 'rgba(0,0,0,1)'); mh.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = mh; g.fillRect(0, 0, aw, ah);
    ctx.drawImage(c, CX - aw / 2, ay);

    L.imagem(ctx, L.img.logo, CX, 290, 330);
    const t1 = L.ajustar(ctx, 'CABOCLOS E INDÍGENAS:', FONTE.manchete, LARG);
    L.texto(ctx, 'CABOCLOS E INDÍGENAS:', CX, 410 + t1 * 0.7, { tam: t1, cor: COR.vermelho, alinhar: 'center', erro: COR.tinta, desloc: 5 });
    const t2 = L.ajustar(ctx, 'honre seus ancestrais!', FONTE.serifa, LARG - 40, 400);
    L.texto(ctx, 'honre seus ancestrais!', CX, 410 + t1 * 0.7 + t2 * 0.95, { familia: FONTE.serifa, estilo: 'italic', peso: 400,
      tam: t2, cor: COR.tinta, alinhar: 'center' });

    const base = ctx.createLinearGradient(0, H - 130, 0, H);
    base.addColorStop(0, 'rgba(15,12,11,0)'); base.addColorStop(1, 'rgba(15,12,11,0.7)');
    ctx.fillStyle = base; ctx.fillRect(0, H - 130, W, 130);
    const cred = 'Ilustração: caboclo de Umbanda · arte gerada por IA (OpenArt)';
    L.texto(ctx, cred, CX, H - 40, { familia: FONTE.maquina, peso: 400, cor: COR.bege, alinhar: 'center',
      tam: Math.min(22, L.ajustar(ctx, cred, FONTE.maquina, W - 160, 400)) });
    L.papel(ctx, 1, 0.1); L.vinheta(ctx, 0.3);
  },
};
