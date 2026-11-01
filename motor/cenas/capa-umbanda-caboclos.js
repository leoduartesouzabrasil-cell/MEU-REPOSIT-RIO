// Capa do Reels "Okê, caboclo" — cartaz soviético em fundo AMARELO com o Caboclo Sete Flechas.
// Figura: foto da escultura (Wikimedia Commons, Gesart/CENSG, CC BY-SA 4.0) → recorte → motor/ilustrar.py --estatua.
// Render: node motor/render.js capa-umbanda-caboclos saida/capa.png --still 1
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagens: {
    figura: '../midia/umbanda-caboclos/caboclo-7flechas-ilustracao.png',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },
  desenhar(ctx, t, L) {
    const { COR, FONTE } = L, W = 1080, H = 1920, CX = 540, LARG = 900;
    L.fundo(ctx, COR.amarelo);
    // sol vermelho com raios atrás da cabeça
    L.raios(ctx, 650, 1000, 1600, 24, 0.05, 'rgba(176,118,40,0.22)');
    ctx.fillStyle = COR.vermelho; ctx.beginPath(); ctx.arc(650, 1000, 370, 0, 7); ctx.fill();

    // figura espelhada (olha para a direita, para o futuro), com sombra de tinta deslocada
    const f = L.img.figura, h = 1420, w = f.width * h / f.height, x = 680 - 0.63 * w, y = H - h;
    const sombra = document.createElement('canvas'); sombra.width = f.width; sombra.height = f.height;
    const g = sombra.getContext('2d'); g.drawImage(f, 0, 0); g.globalCompositeOperation = 'source-in';
    g.fillStyle = COR.tinta; g.fillRect(0, 0, f.width, f.height);
    ctx.save(); ctx.translate(x + w, y); ctx.scale(-1, 1);
    ctx.drawImage(sombra, -14, 10, w, h);
    ctx.drawImage(f, 0, 0, w, h);
    ctx.restore();

    L.imagem(ctx, L.img.logo, CX, 290, 330);
    const t1 = L.ajustar(ctx, 'CABOCLOS E INDÍGENAS:', FONTE.manchete, LARG);
    L.texto(ctx, 'CABOCLOS E INDÍGENAS:', CX, 400 + t1 * 0.7, { tam: t1, cor: COR.vermelho, alinhar: 'center', erro: COR.tinta, desloc: 5 });
    const t2 = L.ajustar(ctx, 'honre seus ancestrais!', FONTE.serifa, LARG - 40, 400);
    L.texto(ctx, 'honre seus ancestrais!', CX, 400 + t1 * 0.7 + t2 * 0.95, { familia: FONTE.serifa, estilo: 'italic', peso: 400,
      tam: t2, cor: COR.tinta, alinhar: 'center' });

    const base = ctx.createLinearGradient(0, H - 130, 0, H);
    base.addColorStop(0, 'rgba(15,12,11,0)'); base.addColorStop(1, 'rgba(15,12,11,0.75)');
    ctx.fillStyle = base; ctx.fillRect(0, H - 130, W, 130);
    const cred = 'Ilustração sobre foto da escultura do Caboclo Sete Flechas · Gesart/CENSG · CC BY-SA 4.0';
    L.texto(ctx, cred, CX, H - 40, { familia: FONTE.maquina, peso: 400, cor: COR.bege, alinhar: 'center',
      tam: Math.min(22, L.ajustar(ctx, cred, FONTE.maquina, W - 120, 400)) });
    L.papel(ctx, 1, 0.12); L.vinheta(ctx, 0.3);
  },
};
