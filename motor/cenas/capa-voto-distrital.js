// Capa do Reels "Voto distrital: o seu voto vai pro lixo!" — ARTE DO AUTOR (capa-arte-lixeira.png: o card com o
// Hugo Motta dentro da lixeira, fundo amarelo). Fundo tirado com ferramentas/recortar.py (birefnet-general) →
// capa-lixeira-recorte.png; a pedido do autor, fundo VERMELHO. Mesmo modelo das capas do Renan e da esquerda cirandeira
// (logo no topo, título carimbado, figura apoiada na borda de baixo, sombra chapada).
// Render: node motor/render.js capa-voto-distrital saida/capa-voto-distrital.png --still 1
const DIR = '../midia/voto-distrital/';
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagens: {
    lixeira: DIR + 'capa-lixeira-recorte.png',          // recorte 1536×1024; figura em x 394–1136, y 18–1007
    logo: '../identidade/marca/o-camarada-bege.png',
  },
  desenhar(ctx, t, L) {
    const { COR, FONTE } = L, W = 1080, H = 1920, CX = 540, LARG = 900;
    L.fundo(ctx, COR.vermelho);
    L.raios(ctx, CX, 1250, 1900, 24, 0.04, 'rgba(138,20,17,0.45)');

    // a arte, com sombra chapada de tinta (silhueta deslocada)
    const img = L.img.lixeira, esc = 1.04, w = img.width * esc, h = img.height * esc;
    const x = CX - ((394 + 1136) / 2) * esc, y = 1685 - 1007 * esc;     // base em y 1685 e topo do card abaixo do título (grid 3:4)
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.drawImage(img, x, y, w, h);
    const s = document.createElement('canvas'); s.width = W; s.height = H;
    const gs = s.getContext('2d'); gs.drawImage(c, 0, 0); gs.globalCompositeOperation = 'source-in';
    gs.fillStyle = COR.tinta; gs.fillRect(0, 0, W, H);
    ctx.drawImage(s, 18, 13); ctx.drawImage(c, 0, 0);

    // logo + título
    L.imagem(ctx, L.img.logo, CX, 300, 250);
    const t1 = Math.min(150, L.ajustar(ctx, 'VOTO DISTRITAL:', FONTE.manchete, LARG));
    L.texto(ctx, 'VOTO DISTRITAL:', CX, 480, { tam: t1, cor: COR.bege, alinhar: 'center', erro: COR.tinta, desloc: 6 });
    ctx.save(); ctx.translate(CX, 575); ctx.rotate(-0.02);
    ctx.fillStyle = COR.tinta; ctx.fillRect(-LARG / 2, -56, LARG, 112);
    const t2 = Math.min(78, L.ajustar(ctx, 'O SEU VOTO VAI PRO LIXO!', FONTE.bloco, LARG - 60, 400));
    L.texto(ctx, 'O SEU VOTO VAI PRO LIXO!', 0, t2 * 0.36, { familia: FONTE.bloco, peso: 400, tam: t2, cor: COR.amarelo, alinhar: 'center' });
    ctx.restore();

    L.papel(ctx, 1, 0.12); L.vinheta(ctx, 0.3);
  },
};
