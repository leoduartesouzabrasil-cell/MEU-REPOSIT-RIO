// Capa do Reels "Voto distrital: o seu voto vai pro lixo!" — modelo fixo de capa (L.capaSovietica).
// Figura: Hugo Motta (foto de Lula Marques/Agência Brasil, 15/04/2026) → ferramentas/recortar.py (birefnet-portrait)
// → motor/ilustrar.py --luz esquerda --pele-sem-vermelho. Por cima, a cédula caindo na lixeira (o tema do vídeo).
// Render: node motor/render.js capa-voto-distrital saida/capa-voto-distrital.png --still 1
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagens: {
    figura: '../midia/voto-distrital/capa-motta-ilustracao.png',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },
  desenhar(ctx, t, L) {
    const { COR } = L;
    L.capaSovietica(ctx, {
      figura: L.img.figura, logo: L.img.logo, alturaFigura: 900, yFigura: 470, dxFigura: 110,
      linhas: ['VOTO DISTRITAL:', 'O SEU VOTO'], destaque: 'VAI PRO LIXO!',
      credito: 'Ilustração sobre foto de Hugo Motta, presidente da Câmara · Lula Marques/Agência Brasil',
    });
  },
};
