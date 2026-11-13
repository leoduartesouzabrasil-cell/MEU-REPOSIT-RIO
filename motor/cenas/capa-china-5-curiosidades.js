// Capa do Reels "5 curiosidades da China": cartaz com o gancho do vídeo (sem figura: a única foto livre de 1949 é pequena demais
// para a ilustração). Miolo do grid 3:4 em y 240–1680. Render: node motor/render.js capa-china-5-curiosidades saida/china-capa.png --still 1
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: 2,
  imagens: { logo: '../identidade/marca/o-camarada-bege.png' },
  desenhar(ctx, t, L) {
    const { COR, FONTE } = L, CX = 540;
    L.fundo(ctx, COR.vermelho);
    L.raios(ctx, CX, 1500, 2600, 22, -0.25, 'rgba(138,20,17,0.55)');
    L.imagem(ctx, L.img.logo, CX, 330, 300);
    const linha = (s, y, fam, tam, cor, rot = -0.05) => {
      ctx.save(); ctx.translate(CX, y); ctx.rotate(rot);
      const peso = fam === FONTE.bloco ? 400 : 900;
      L.texto(ctx, s, 0, 0, { familia: fam, peso, tam: Math.min(tam, L.ajustar(ctx, s, fam, 920, peso)), cor, alinhar: 'center', erro: COR.tinta, desloc: 8 });
      ctx.restore();
    };
    linha('NA CHINA, SER', 600, FONTE.manchete, 150, COR.bege);
    linha('CRISTÃO É', 790, FONTE.bloco, 190, COR.amarelo);
    linha('PROIBIDO?', 980, FONTE.manchete, 220, COR.bege);
    // carimbo MENTIRA
    ctx.save(); ctx.translate(CX, 1210); ctx.rotate(-0.14);
    ctx.strokeStyle = COR.amarelo; ctx.lineWidth = 16; ctx.strokeRect(-400, -125, 800, 230);
    ctx.fillStyle = COR.tinta; ctx.fillRect(-386, -111, 772, 202);
    L.texto(ctx, 'MENTIRA!', 0, 50, { familia: FONTE.bloco, peso: 400, tam: 138, cor: COR.amarelo, alinhar: 'center' });
    ctx.restore();
    // selo 5 curiosidades
    ctx.save(); ctx.translate(CX, 1500);
    ctx.fillStyle = COR.tinta; ctx.fillRect(-380, -70, 760, 140);
    L.estrela(ctx, -300, 0, 52, 0, COR.amarelo);
    L.texto(ctx, '5 CURIOSIDADES DA CHINA', 40, 22, { familia: FONTE.sub, peso: 600, tam: 54, cor: COR.bege, alinhar: 'center' });
    ctx.restore();
    L.papel(ctx, 1, 0.14); L.vinheta(ctx, 0.45);
  },
};
