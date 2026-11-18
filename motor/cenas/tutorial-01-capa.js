// CAPA do EP. 1 da série para novos membros (1920×1080), para o site (Área do Militante). Quadro parado: render com --still 1.
window.CENA = {
  w: 1920, h: 1080, fps: 30, dur: 2,
  imagens: {
    leo: '../midia/tutorial-01/leo-duarte.jpg',
    duda: '../midia/tutorial-01/eduarda-prado.jpg',
    lufa: '../midia/tutorial-01/logo-lufa-empilhado.png',
  },
  desenhar(ctx, t, L) {
    const { COR, FONTE } = L;
    const VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, VESC = COR.vermelhoEscuro;
    L.fundo(ctx, VERM);
    L.raios(ctx, 1380, 1250, 2800, 26, -0.3, 'rgba(237,224,196,0.12)');
    ctx.fillStyle = VESC; ctx.beginPath(); ctx.arc(1380, 1250, 470, Math.PI, 0); ctx.fill();
    ctx.save(); ctx.globalAlpha = 0.16; L.foiceMartelo(ctx, 1390, 470, 420, VESC); ctx.restore();

    // cubo do logo, reto, com a estrela no lugar do pingo do "i"
    function cubo(txt, x, yb, tam, face, lado, cor, maxW = 920) {
      L.fonte(ctx, FONTE.grotesca, tam, 900); ctx.fontStretch = 'expanded';
      let larg = (c) => c === 'I' ? Math.max(ctx.measureText(c).width, tam * 0.5) : ctx.measureText(c).width;
      const w0 = [...txt].reduce((s, c) => s + larg(c), 0) + tam * 0.9;
      if (w0 > maxW) { tam *= maxW / w0; L.fonte(ctx, FONTE.grotesca, tam, 900); ctx.fontStretch = 'expanded'; }
      larg = (c) => c === 'I' ? Math.max(ctx.measureText(c).width, tam * 0.5) : ctx.measureText(c).width;
      const tw = [...txt].reduce((s, c) => s + larg(c), 0), w = tw + tam * 0.9, h = tam * 1.4, D = Math.round(h * 0.18);
      ctx.fillStyle = lado; ctx.beginPath(); ctx.moveTo(x + w, yb); ctx.lineTo(x + w + D, yb + D); ctx.lineTo(x + w + D, yb + h + D);
      ctx.lineTo(x + D, yb + h + D); ctx.lineTo(x, yb + h); ctx.lineTo(x + w, yb + h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = face; ctx.fillRect(x, yb, w, h);
      let cx = x + tam * 0.45; const base = yb + h / 2 + tam * 0.37;
      ctx.fillStyle = cor; ctx.textBaseline = 'alphabetic';
      for (const c of txt) {
        const cw = larg(c);
        if (c === 'I') { ctx.fillRect(cx + cw / 2 - tam * 0.09, base - tam * 0.44, tam * 0.18, tam * 0.44); L.estrela(ctx, cx + cw / 2, base - tam * 0.68, tam * 0.22, 0, cor); }
        else ctx.fillText(c, cx, base);
        cx += cw;
      }
      ctx.fontStretch = 'normal';
    }

    L.texto(ctx, 'FORMAÇÃO PARA NOVOS MILITANTES · EP. 1', 120, 250, { familia: FONTE.sub, peso: 600, tam: 44, cor: BEGE, tracking: 4 });
    cubo('BEM-VINDO AO', 120, 300, 104, AMA, '#C4930B', VERM, 760);
    cubo('COLETIVO LUFÃ!', 120, 450, 160, '#FFFFFF', '#E2D6C2', '#CC2220', 960);

    // os fundadores em moldura dourada
    [['leo', 1250, 330, 'LÉO DUARTE'], ['duda', 1580, 330, 'EDUARDA PRADO']].forEach(([k, x, y, nome]) => {
      L.moldura(ctx, x, y, 270, 320, 26);
      L.foto(ctx, L.img[k], x, y, 270, 320, { pb: true });
      L.estrela(ctx, x + 135, y - 26, 28, 0, AMA);
      L.etiqueta(ctx, nome, x + 135, y + 320 + 64, 1, { cor: COR.tinta, tam: 30 });
    });
    L.imagem(ctx, L.img.lufa, 260, 860, 260);
    L.texto(ctx, 'O que é o coletivo, de onde viemos e no que acreditamos', 430, 880, { familia: FONTE.serifa, estilo: 'italic', peso: 400, tam: 40, cor: BEGE });
    L.papel(ctx, 1, 0.12); L.vinheta(ctx, 0.35);
  },
};
