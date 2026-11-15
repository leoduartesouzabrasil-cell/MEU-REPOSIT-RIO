// MODELO (template) dos cortes da live do Coletivo Lufã para Reels (1080×1920). Prévia estática: t < 1 → exemplo 1, t ≥ 1 → exemplo 2.
// Layout:
//   y 210–330   logos (Coletivo Lufã + Léo Duarte), centralizadas, fora da barra do Instagram
//   y 360–500   MANCHETE do corte (o gancho, 2 linhas no máximo) — muda a cada corte
//   y 540–1520  a pessoa falando, recortada em 4:5 em volta do rosto (some o preto e a interface da chamada), moldura vermelha
//               etiqueta "AO VIVO · LIVE DO COLETIVO LUFÃ" no canto de cima; nome de quem fala no canto de baixo
//   y 1560–1636 legenda palavra por palavra (padrão da casa: tarja escura, filete vermelho, bege 48 px, palavras-chave em amarelo)
//   fundo bege com papel granulado e raios de sol bem suaves (identidade Construtivismo Tropical)
const EX = [
  { quadro: 'q1', janela: [656, 0, 607, 1080], rosto: 0.40, nome: 'IGOR SILVA', titulo: ['O FIM DA 6x1', 'NÃO É FAVOR, É CONQUISTA!'],
    leg: [['A', 0], ['gente', 0], ['conquistou', 0], ['isso', 0], ['na', 0], ['luta.', 0]] },
  { quadro: 'q2', janela: [656, 0, 607, 1080], rosto: 0.42, nome: 'INARA COELHO', titulo: ['QUEM TRABALHA', 'PRECISA DESCANSAR!'],
    leg: [['Duas', 0], ['folgas', 0], ['por', 0], ['semana,', 0], ['no', 0], ['mínimo.', 0]] },
];
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagens: {
    q1: '../midia/cortes/modelo/quadro-celular.png', q2: '../midia/cortes/modelo/quadro-webcam.png',
    lufa: '../identidade/marca/coletivo-lufa-horizontal.png', leo: '../identidade/marca/leo-duarte-silhueta-vermelha.png',
  },
  desenhar(ctx, t, L) {
    const { COR, FONTE } = L, CX = 540, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta;
    const ex = EX[t < 1 ? 0 : 1];
    L.fundo(ctx, BEGE);
    L.raios(ctx, CX, 1100, 2600, 24, -0.2, 'rgba(200,32,30,0.06)');

    // logos
    const lw = 300, lh = lw * L.img.lufa.height / L.img.lufa.width, rw = 128, rh = rw * L.img.leo.height / L.img.leo.width;
    const gap = 50, tot = lw + gap + rw, x0 = CX - tot / 2;
    ctx.drawImage(L.img.lufa, x0, 268 - lh / 2, lw, lh);
    ctx.drawImage(L.img.leo, x0 + lw + gap, 268 - rh / 2, rw, rh);

    // manchete
    const t1 = ex.titulo[0], t2 = ex.titulo[1];
    L.texto(ctx, t1, CX, 420, { familia: FONTE.manchete, peso: 900, tam: Math.min(96, L.ajustar(ctx, t1, FONTE.manchete, 900)), cor: TINTA, alinhar: 'center', erro: VERM, desloc: 4 });
    L.texto(ctx, t2, CX, 500, { familia: FONTE.bloco, peso: 400, tam: Math.min(64, L.ajustar(ctx, t2, FONTE.bloco, 900, 400)), cor: VERM, alinhar: 'center', erro: TINTA, desloc: 3 });

    // a pessoa: recorte 4:5 da janela da chamada, centrado no rosto
    const [jx, jy, jw, jh] = ex.janela, vw = 780, vh = 975, vx = CX - vw / 2, vy = 548;
    const cw = jw, ch = cw * vh / vw, cy = Math.max(jy, Math.min(jy + jh - ch, jy + jh * ex.rosto - ch / 2));
    ctx.fillStyle = 'rgba(28,23,20,0.35)'; ctx.fillRect(vx + 14, vy + 14, vw, vh);
    ctx.drawImage(L.img[ex.quadro], jx, cy, cw, ch, vx, vy, vw, vh);
    ctx.strokeStyle = VERM; ctx.lineWidth = 12; ctx.strokeRect(vx - 6, vy - 6, vw + 12, vh + 12);
    // etiqueta da live
    L.etiqueta(ctx, '● AO VIVO · LIVE DO COLETIVO LUFÃ', vx + 250, vy + 46, 1, { cor: VERM, tam: 26 });
    // nome de quem fala
    ctx.save(); ctx.fillStyle = TINTA; ctx.fillRect(vx - 6, vy + vh - 96, 420, 74); ctx.fillStyle = AMA; ctx.fillRect(vx - 6, vy + vh - 96, 10, 74);
    L.texto(ctx, ex.nome, vx + 24, vy + vh - 48, { familia: FONTE.bloco, peso: 400, tam: 38, cor: BEGE });
    ctx.restore();

    // legenda (padrão da casa)
    const pal = ex.leg, tam = 48; L.fonte(ctx, FONTE.serifa, tam, 400, 'italic');
    const esp = tam * 0.28, larg = pal.map(([w]) => ctx.measureText(w).width), W = larg.reduce((a, b) => a + b, 0) + esp * (pal.length - 1), xl = CX - W / 2, Y = 1566;
    ctx.fillStyle = 'rgba(15,12,11,0.86)'; ctx.fillRect(xl - 26, Y, W + 52, 76); ctx.fillStyle = VERM; ctx.fillRect(xl - 26, Y, 7, 76);
    let x = xl;
    pal.forEach(([w], i) => { L.texto(ctx, w, x, Y + 51, { familia: FONTE.serifa, estilo: 'italic', peso: 400, tam, cor: /^(conquistou|luta|folgas|mínimo)/i.test(w) ? AMA : BEGE }); x += larg[i] + esp; });

    L.papel(ctx, 1, 0.1); L.vinheta(ctx, 0.25);
  },
};
