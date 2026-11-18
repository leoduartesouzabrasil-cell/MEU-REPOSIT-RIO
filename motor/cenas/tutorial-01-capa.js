// CAPA do EP. 1 da série para novos membros (1920×1080), para o site (Área do Militante). Quadro parado: render com --still 1.
window.CENA = {
  w: 1920, h: 1080, fps: 30, dur: 2,
  imagens: {
    marxEngels: '../midia/tutorial-01/marx-engels-recorte.png',   // arte do autor da página (Marx e Engels, sem fundo)
    lufa: '../midia/tutorial-01/logo-lufa-empilhado.png',
  },
  desenhar(ctx, t, L) {
    const { COR, FONTE } = L;
    const VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, VESC = COR.vermelhoEscuro;
    L.fundo(ctx, VERM);
    L.raios(ctx, 1450, 1250, 2800, 26, -0.3, 'rgba(237,224,196,0.12)');
    ctx.fillStyle = VESC; ctx.beginPath(); ctx.arc(1450, 1250, 470, Math.PI, 0); ctx.fill();
    // o logo do coletivo, grande e meio transparente, atrás de Marx e Engels
    L.imagem(ctx, L.img.lufa, 1430, 360, 760, 0.3);

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
      return yb + h + D;
    }

    L.texto(ctx, 'FORMAÇÃO PARA NOVOS MILITANTES · EP. 1', 120, 360, { familia: FONTE.sub, peso: 600, tam: 44, cor: BEGE, tracking: 4 });
    const y1 = cubo('BEM-VINDO AO', 120, 400, 104, AMA, '#C4930B', VERM, 700);
    const y2 = cubo('COLETIVO LUFÃ!', 120, y1 + 16, 160, '#FFFFFF', '#E2D6C2', '#CC2220', 880);
    // subtítulo em UMA linha, numa tarja preta logo abaixo do título
    const SUB = 'O que é o coletivo, de onde viemos e no que acreditamos';
    let ts = 40; L.fonte(ctx, FONTE.serifa, ts, 400, 'italic');
    const lw = ctx.measureText(SUB).width; if (lw > 900) { ts *= 900 / lw; }
    L.fonte(ctx, FONTE.serifa, ts, 400, 'italic');
    const sw = ctx.measureText(SUB).width + 60, sy = y2 + 18, sh = ts * 1.9;
    ctx.fillStyle = COR.tinta; ctx.fillRect(120, sy, sw, sh);
    ctx.fillStyle = VERM; ctx.fillRect(120, sy, 9, sh);
    L.texto(ctx, SUB, 152, sy + sh / 2 + ts * 0.32, { familia: FONTE.serifa, estilo: 'italic', peso: 400, tam: ts, cor: BEGE });
    // a figura da capa: Marx e Engels, grandes, saindo da borda de baixo, NA FRENTE das caixas de texto (cada episódio terá uma figura importante)
    const img = L.img.marxEngels, fw = 1180, fh = fw * img.height / img.width;
    ctx.save(); ctx.shadowColor = 'rgba(28,23,20,0.45)'; ctx.shadowOffsetX = 14; ctx.shadowOffsetY = 0; ctx.shadowBlur = 0;
    ctx.drawImage(img, 1920 - fw + 90, 1080 - fh + 10, fw, fh); ctx.restore();

    L.papel(ctx, 1, 0.12); L.vinheta(ctx, 0.35);
  },
};
