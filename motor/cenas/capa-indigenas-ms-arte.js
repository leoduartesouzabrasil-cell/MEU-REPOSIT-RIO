// Capa do Reels "Veneno na água" montada sobre a ilustração fornecida (arte horizontal 1536×1024).
// A arte entra inteira, sem distorção: a figura (x 335–1102 na arte) cabe na largura; o fundo vermelho é estendido.
// Render: node motor/render.js capa-indigenas-ms-arte saida/capa.png --still 1
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagens: {
    arte: '../midia/indigenas-ms/ilustracao-capa.png',
    logo: '../identidade/marca/o-camarada-bege.png',
  },
  desenhar(ctx, t, L) {
    L.capaComArte(ctx, {
      arte: L.img.arte, logo: L.img.logo, figuraX: [335, 1102], escala: 1.2,
      linhas: ['PROTEJAM OS', 'NOSSOS POVOS'], destaque: 'INDÍGENAS!',
      credito: 'Ilustração baseada em foto de Rafa Neddermeyer/Agência Brasil',
    });
  },
};
