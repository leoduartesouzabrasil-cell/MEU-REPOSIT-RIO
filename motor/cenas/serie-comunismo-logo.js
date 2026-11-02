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
    const { COR, FONTE, seg, ease } = L, CX = 540;
    L.fundo(ctx, COR.vermelho);
    L.raios(ctx, CX, 1180, 2400, 22, -0.25 + L.emDois(t) * 0.04, 'rgba(138,20,17,0.5)');
    L.imagem(ctx, L.img.logo, CX, 300, 230, seg(t, 0, 0.3));
    // estrela com foice e martelo
    L.aplicarCarimbo(ctx, seg(t, 0.0, 0.25), CX, 700, () => L.estrela(ctx, CX, 700, 200, 0, COR.amarelo), 3);
    L.aplicarCarimbo(ctx, seg(t, 0.15, 0.4), CX, 710, () => L.foiceMartelo(ctx, CX, 710, 165, COR.vermelho), 4);
    // "DESMISTIFICANDO O" junto, em faixa de tinta
    L.aplicarCarimbo(ctx, seg(t, 0.35, 0.6), CX, 985, () => {
      ctx.fillStyle = COR.tinta; ctx.fillRect(130, 935, 820, 100);
      const tam = Math.min(108, L.ajustar(ctx, 'DESMISTIFICANDO O', FONTE.manchete, 780));
      L.texto(ctx, 'DESMISTIFICANDO O', CX, 1020, { tam, cor: COR.bege, alinhar: 'center', erro: COR.vermelho, desloc: 4 });
    }, 5);
    // COMUNISMO sozinho, grande (o destaque)
    L.aplicarCarimbo(ctx, seg(t, 0.55, 0.85), CX, 1160, () => {
      ctx.save(); ctx.translate(CX, 1160);                         // reto (pedido do autor)
      const tam = Math.min(220, L.ajustar(ctx, 'COMUNISMO', FONTE.bloco, 940, 400));
      L.texto(ctx, 'COMUNISMO', 0, tam * 0.36, { familia: FONTE.bloco, peso: 400, tam, cor: COR.amarelo, alinhar: 'center', erro: COR.tinta, desloc: 9 });
      ctx.restore();
    }, 6);
    // COM LÉO DUARTE: no canto direito, abaixo do COMUNISMO, mesma fonte e cor do "DESMISTIFICANDO", em faixa de tinta
    // assinatura discreta no canto: filete amarelo + letra espaçada, alinhada à direita do COMUNISMO
    if (t > 0.85) {
      const q = ease.saida(seg(t, 0.85, 1.15)), txt = 'COM LÉO DUARTE', tam = 40;
      ctx.save(); ctx.globalAlpha = q;
      L.fonte(ctx, FONTE.manchete, tam, 900); ctx.letterSpacing = '6px'; const w = ctx.measureText(txt).width; ctx.letterSpacing = '0px';
      ctx.fillStyle = COR.amarelo; ctx.fillRect(1000 - w - 26 - 60 * q, 1278, 60 * q, 5);
      L.texto(ctx, txt, 1000, 1295, { tam, cor: COR.bege, alinhar: 'right', tracking: 6 });
      ctx.restore();
    }
    // episódio
    if (t > 1.9) L.etiqueta(ctx, EP, CX, 1450, seg(t, 1.9, 2.15), { cor: COR.tinta, corTexto: COR.bege, tam: 40 });
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);
  },
};
