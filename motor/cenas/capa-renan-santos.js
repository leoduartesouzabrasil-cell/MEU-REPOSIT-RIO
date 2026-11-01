// Capa do Reels "Renan Santos: ele não é seu amigo": cartaz em fundo AMARELO, mesmo modelo da capa da esquerda cirandeira.
// Artes enviadas pelo autor: capa-arte-renan.png (o Renan dando de ombros) e capa-arte-riscados.png (os dois cartazes riscados).
// Fundo amarelo das artes tirado por preenchimento a partir da borda → capa-renan-recorte.png e capa-riscados-recorte.png.
// O Renan em evidência, à frente; os dois cartazes riscados atrás dele, menores e inclinados.
// Render: node motor/render.js capa-renan-santos saida/capa-renan.png --still 1
const DIR = '../midia/renan-santos/';
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagens: {
    renan: DIR + 'capa-renan-recorte.png',
    riscados: DIR + 'capa-riscados-recorte.png',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },
  desenhar(ctx, t, L) {
    const { COR, FONTE } = L, W = 1080, H = 1920, CX = 540, LARG = 900;
    L.fundo(ctx, COR.amarelo);
    L.raios(ctx, CX, 1150, 1800, 24, 0.04, 'rgba(176,118,40,0.22)');

    // silhueta em tinta deslocada (sombra chapada), como nas outras capas
    function comSombra(desenho, sombra) {
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const g = c.getContext('2d'); desenho(g);
      const s = document.createElement('canvas'); s.width = W; s.height = H;
      const gs = s.getContext('2d'); gs.drawImage(c, 0, 0); gs.globalCompositeOperation = 'source-in';
      gs.fillStyle = COR.tinta; gs.fillRect(0, 0, W, H);
      ctx.drawImage(s, sombra, sombra * 0.7); ctx.drawImage(c, 0, 0);
    }

    // os dois cartazes riscados, atrás e menores (recortes da arte: esquerdo x 54–765, direito x 790–1482, y 35–987)
    const R = L.img.riscados;
    [[54, 765, 240, 980, -7], [790, 1482, 840, 980, 6]].forEach(([x0, x1, cx, cy, ang]) => comSombra(g => {
      const w = 310, esc = w / (x1 - x0), h = (987 - 35) * esc;
      g.translate(cx, cy); g.rotate(ang * Math.PI / 180);
      g.drawImage(R, x0, 35, x1 - x0, 952, -w / 2, -h / 2, w, h);
    }, 10));

    // o Renan em evidência, subindo da borda de baixo (recorte: x 155–1393, y 61–1024)
    comSombra(g => {
      const img = L.img.renan, esc = 1.02, w = img.width * esc, h = img.height * esc;
      const x = CX - ((155 + 1393) / 2) * esc, y = H - h;           // apoiado na borda de baixo (sem flutuar); bem grande, as pontas dos dedos saem pelas laterais
      g.drawImage(img, x, y, w, h);
    }, 20);

    // logo + título
    L.imagem(ctx, L.img.logo, CX, 300, 250);
    const t1 = Math.min(160, L.ajustar(ctx, 'RENAN SANTOS:', FONTE.manchete, LARG));
    L.texto(ctx, 'RENAN SANTOS:', CX, 490, { tam: t1, cor: COR.vermelho, alinhar: 'center', erro: COR.tinta, desloc: 6 });
    ctx.save(); ctx.translate(CX, 580); ctx.rotate(-0.02);
    ctx.fillStyle = COR.tinta; ctx.fillRect(-LARG / 2, -54, LARG, 108);
    const t2 = Math.min(78, L.ajustar(ctx, 'ELE NÃO É SEU AMIGO.', FONTE.bloco, LARG - 60, 400));
    L.texto(ctx, 'ELE NÃO É SEU AMIGO.', 0, t2 * 0.36, { familia: FONTE.bloco, peso: 400, tam: t2, cor: COR.amarelo, alinhar: 'center' });
    ctx.restore();

    L.papel(ctx, 1, 0.12); L.vinheta(ctx, 0.3);
  },
};
