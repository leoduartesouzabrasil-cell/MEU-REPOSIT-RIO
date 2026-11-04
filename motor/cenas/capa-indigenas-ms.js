// Capa do Reels "Veneno na água" — modelo fixo de capa: cartaz de propaganda soviética (L.capaSovietica).
// Figura: foto recortada → motor/ilustrar.py → ilustração. Render: node motor/render.js capa-indigenas-ms saida/capa.png --still 1
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagens: {
    figura: '../midia/indigenas-ms/valdelice-veron-ilustracao.png',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },
  desenhar(ctx, t, L) {
    L.capaSovietica(ctx, {
      figura: L.img.figura, logo: L.img.logo,
      linhas: ['PROTEJAM OS', 'NOSSOS POVOS'], destaque: 'INDÍGENAS!',
      credito: 'Ilustração sobre foto de Valdelice Veron (liderança Guarani Kaiowá) · Rafa Neddermeyer/Agência Brasil',
    });
  },
};
