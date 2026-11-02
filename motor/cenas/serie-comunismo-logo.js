// Vinheta/logo da série "DESMISTIFICANDO O COMUNISMO" (abre cada episódio depois do gancho). Curta: 3,5 s.
// Pedido do autor: tudo reto; "DESMISTIFICANDO O" junto; "COMUNISMO" sozinho e grande; "COM LÉO DUARTE" no canto direito, abaixo,
// na mesma fonte e cor do "DESMISTIFICANDO"; depois o episódio.
// Prévia: node motor/render.js serie-comunismo-logo saida/serie-logo.png --still 2.2
// Para outro episódio, troque EP (ou passe a vinheta como componente para a cena do episódio).
const EP = 'EP. 1 · O QUE É O COMUNISMO?';
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 3.5,
  imagens: { logo: '../identidade/marca/o-camarada-bege.png' },
  desenhar(ctx, t, L) {
    L.vinhetaComunismo(ctx, t, { ep: EP, logo: L.img.logo });
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);
  },
};
