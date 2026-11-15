// MODELO v2 dos cortes da live do Coletivo Lufã para Reels (1080×1920), no formato pedido pelo autor (referência: IMG_0087):
// fundo preto · EM CIMA a pessoa falando (painel arredondado; com duas pessoas ao mesmo tempo, o painel de cima se divide meio a meio)
// · EMBAIXO sempre uma imagem ou manchete · legenda no NOSSO padrão (tarja escura, filete vermelho, bege 48 px, palavras-chave em amarelo),
// na emenda dos dois painéis · logo pequena do Coletivo Lufã no alto, longe da borda (dentro da zona segura do Reels).
// Prévia estática: t < 1 → uma pessoa + foto embaixo; t ≥ 1 → duas pessoas + manchete embaixo.
const PAINEL = { x: 24, w: 1032, cimaY: 64, cimaH: 1076, baixoY: 1156, baixoH: 640, raio: 26 };
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagens: {
    q1: '../midia/cortes/modelo/quadro-celular.png', q2: '../midia/cortes/modelo/quadro-webcam.png',
    foto: '../midia/fim-6x1-dino/dino.png',
    lufa: '../identidade/marca/coletivo-lufa-horizontal.png',
  },
  desenhar(ctx, t, L) {
    const { COR, FONTE } = L, CX = 540, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta;
    const P = PAINEL, dois = t >= 1;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 1080, 1920);

    // ---------- em cima: a(s) pessoa(s) (recorte da janela da chamada, centrado no rosto)
    const pessoas = dois
      ? [{ img: 'q1', janela: [656, 0, 607, 1080], rosto: 0.42 }, { img: 'q2', janela: [656, 0, 607, 1080], rosto: 0.42 }]
      : [{ img: 'q2', janela: [656, 0, 607, 1080], rosto: 0.40 }];
    const gap = 8, n = pessoas.length, pw = (P.w - gap * (n - 1)) / n;
    pessoas.forEach((p, i) => {
      const x = P.x + i * (pw + gap), [jx, jy, jw, jh0] = p.janela, jh = jh0 - 70;   // tira a faixa de baixo da janela (nome que a chamada escreve)
      // recorte com a mesma proporção do painel, o mais largo possível dentro da janela
      let cw = jw, ch = cw * P.cimaH / pw;
      if (ch > jh) { ch = jh; cw = ch * pw / P.cimaH; }
      const cx = jx + (jw - cw) / 2, cy = Math.max(jy, Math.min(jy + jh - ch, jy + jh * p.rosto - ch / 2));
      ctx.save(); arred(x, P.cimaY, pw, P.cimaH, P.raio); ctx.clip();
      ctx.drawImage(L.img[p.img], cx, cy, cw, ch, x, P.cimaY, pw, P.cimaH);
      ctx.restore();
    });

    // ---------- embaixo: imagem ou manchete
    ctx.save(); arred(P.x, P.baixoY, P.w, P.baixoH, P.raio); ctx.clip();
    if (!dois) {
      L.foto(ctx, L.img.foto, P.x, P.baixoY, P.w, P.baixoH, { pb: false, retic: false, zoom: 1.0, dy: 60 });
    } else {
      ctx.fillStyle = BEGE; ctx.fillRect(P.x, P.baixoY, P.w, P.baixoH);
      L.raios(ctx, CX, P.baixoY + P.baixoH + 200, 1600, 22, -0.2, 'rgba(200,32,30,0.08)');
      L.texto(ctx, 'O GLOBO · 13/11/2026', P.x + 60, P.baixoY + 96, { familia: FONTE.grotesca, peso: 700, tam: 30, cor: VERM, tracking: 2 });
      ['Fim da escala 6x1: STF', 'inicia julgamento e já tem', '4 votos a favor da nova jornada'].forEach((s, i) =>
        L.texto(ctx, s, P.x + 60, P.baixoY + 200 + i * 86, { familia: FONTE.manchete, peso: 900, tam: Math.min(78, L.ajustar(ctx, '4 votos a favor da nova jornada', FONTE.manchete, 900)), cor: TINTA }));
      L.fonte(ctx, FONTE.manchete, Math.min(78, L.ajustar(ctx, '4 votos a favor da nova jornada', FONTE.manchete, 900)), 900);
      L.selecao(ctx, P.x + 56, P.baixoY + 312, ctx.measureText('4 votos a favor').width + 8, 82, 1, VERM);
      L.texto(ctx, 'manchete do jornal (print) ou card nosso com o dado', P.x + 60, P.baixoY + 560, { familia: FONTE.maquina, peso: 400, tam: 26, cor: TINTA });
      L.papel(ctx, 1, 0.08);
    }
    ctx.restore();

    // ---------- logo pequena do Coletivo Lufã, no alto (abaixo da barra do Instagram, longe da borda)
    const lw = 230, lh = lw * L.img.lufa.height / L.img.lufa.width;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18;
    ctx.drawImage(L.img.lufa, CX - lw / 2, 205, lw, lh); ctx.restore();

    // ---------- legenda (nosso padrão), na emenda dos painéis
    const pal = dois ? [['A', 0], ['gente', 0], ['conquistou', 0], ['isso', 0], ['na', 0], ['luta.', 0]]
      : [['Duas', 0], ['folgas', 0], ['por', 0], ['semana,', 0], ['no', 0], ['mínimo.', 0]];
    const tam = 48; L.fonte(ctx, FONTE.serifa, tam, 400, 'italic');
    const esp = tam * 0.28, larg = pal.map(([w]) => ctx.measureText(w).width), W = larg.reduce((a, b) => a + b, 0) + esp * (pal.length - 1);
    const xl = CX - W / 2, Y = P.baixoY - 38 - 8;
    ctx.fillStyle = 'rgba(15,12,11,0.9)'; ctx.fillRect(xl - 26, Y, W + 52, 76); ctx.fillStyle = VERM; ctx.fillRect(xl - 26, Y, 7, 76);
    let x = xl;
    pal.forEach(([w], i) => { L.texto(ctx, w, x, Y + 51, { familia: FONTE.serifa, estilo: 'italic', peso: 400, tam, cor: /^(conquistou|luta|folgas|mínimo)/i.test(w) ? AMA : BEGE }); x += larg[i] + esp; });

    function arred(x, y, w, h, r) {
      ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
  },
};
