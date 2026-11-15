// CORTE 01 · live do Coletivo Lufã (15/11/2026): Núcleo dos Povos de Terreiro. Template v2 (corte-modelo.js): camada transparente
// sobre saida/corte-01-terreiro-base.mp4. Em cima: quem fala (vídeo-base) + tarja com nome e @; embaixo: um card por ponto; legenda na emenda.
// Exportar: node ferramentas/overlay.js corte-01-terreiro saida/.corte01/overlay.mov
const P = { x: 24, w: 1032, cimaY: 64, cimaH: 1076, baixoY: 1156, baixoH: 640, raio: 26 };
const PESSOAS = { leo: ['LEONARDO DUARTE', '@_ocamarada'], luiz: ['LUIZ GUSTAVO', '@vamosinvestigar'] };
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: (window.TEMPOS || {}).dur || 90,
  imagens: { lufa: '../identidade/marca/coletivo-lufa-horizontal.png' },
  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease, clamp } = L, CX = 540, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta;
    const B = (window.TEMPOS || {}).blocos || [], bl = B.find(b => t >= b.t0 && t < b.t1) || B[B.length - 1] || { t0: 0, t1: 1, quem: 'leo', card: 'dia' };
    const lt = t - bl.t0, fr = clamp(lt / Math.max(0.1, bl.t1 - bl.t0));
    ctx.clearRect(0, 0, 1080, 1920);

    // fundo preto com o "buraco" arredondado do painel de cima (o vídeo aparece por ele)
    ctx.save(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.rect(0, 0, 1080, 1920); arred(P.x, P.cimaY, P.w, P.cimaH, P.raio); ctx.fill('evenodd'); ctx.restore();

    // painel de baixo: o card do ponto
    ctx.save(); ctx.beginPath(); arred(P.x, P.baixoY, P.w, P.baixoH, P.raio); ctx.clip(); ctx.translate(P.x, P.baixoY);
    const W = P.w, H = P.baixoH, cx = W / 2, entra = seg(lt, 0, 0.35);
    ({ dia, nucleo, direita, luiz, '2018': ano2018, '2026': ano2026, violencia, mapa })[bl.card]();
    L.papel(ctx, t, 0.07);
    ctx.restore();

    // tarja com nome e @ de quem fala (canto de baixo do painel de cima)
    const [nome, arroba] = PESSOAS[bl.quem];
    ctx.save(); ctx.globalAlpha = clamp(seg(lt, 0, 0.25) * 1.5);
    const tx = P.x + 26, ty = P.cimaY + P.cimaH - 190;
    L.fonte(ctx, FONTE.bloco, 40, 400); const tw = Math.max(ctx.measureText(nome).width, 300) + 56;
    ctx.fillStyle = 'rgba(15,12,11,0.88)'; ctx.fillRect(tx, ty, tw, 106); ctx.fillStyle = AMA; ctx.fillRect(tx, ty, 9, 106);
    L.texto(ctx, nome, tx + 30, ty + 50, { familia: FONTE.bloco, peso: 400, tam: 40, cor: BEGE });
    L.texto(ctx, arroba, tx + 30, ty + 88, { familia: FONTE.grotesca, peso: 700, tam: 28, cor: AMA });
    ctx.restore();

    // logo pequena do Coletivo Lufã, no alto
    const im = L.img.lufa, lw = 230, lh = lw * im.height / im.width;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.drawImage(im, CX - lw / 2, 205, lw, lh); ctx.restore();

    legenda();

    // ================================================ cards (coordenadas dentro do painel de baixo: 1032 × 640)
    function fundo(cor, raios = 'rgba(200,32,30,0.08)') { ctx.fillStyle = cor; ctx.fillRect(0, 0, W, H); L.raios(ctx, cx, H + 260, 1700, 22, -0.2 + L.emDois(t) * 0.03, raios); }
    function carimba(txt, y, t0, cor, tam, fam = FONTE.bloco, larg = 940, seed = 1) {
      const peso = fam === FONTE.bloco ? 400 : 900;
      L.aplicarCarimbo(ctx, seg(lt, t0, t0 + 0.3), cx, y, () =>
        L.texto(ctx, txt, cx, y, { familia: fam, peso, tam: Math.min(tam, L.ajustar(ctx, txt, fam, larg, peso)), cor, alinhar: 'center', erro: cor === TINTA ? VERM : TINTA, desloc: 4 }), seed);
    }
    function chip(txt, x, y, p, fundoC = TINTA, cor = BEGE, tam = 32) { if (p > 0) { ctx.save(); L.etiqueta(ctx, txt, x, y, p, { cor: fundoC, corTexto: cor, tam }); ctx.restore(); } }
    function dia() {
      fundo(BEGE);
      carimba('15 DE NOVEMBRO', 270, 0.1, VERM, 150);
      carimba('DIA NACIONAL DA UMBANDA', 400, 0.6, TINTA, 84, FONTE.manchete);
      if (lt > 1.2) L.texto(ctx, L.datilografar('Lei 12.644/2012', seg(lt, 1.2, 2.0)), cx, 500, { familia: FONTE.maquina, peso: 400, tam: 34, cor: TINTA, alinhar: 'center' });
    }
    function nucleo() {
      fundo(VERM, 'rgba(138,20,17,0.5)');
      carimba('NÚCLEO DOS', 190, 0.1, BEGE, 90, FONTE.manchete);
      carimba('POVOS DE TERREIRO', 300, 0.4, AMA, 96);
      ['CONSCIENTIZAÇÃO', 'PROTEÇÃO', 'ACOLHIMENTO'].forEach((s, i) => chip(s, 190 + i * 326, 430, seg(lt, 14.6 + i * 0.8, 14.9 + i * 0.8), TINTA, BEGE, 34));
      if (lt > 1.2) L.texto(ctx, 'COLETIVO LUFÃ · comandado por Luiz Gustavo', cx, 560, { familia: FONTE.grotesca, peso: 700, tam: 30, cor: BEGE, alinhar: 'center' });
    }
    function direita() {
      fundo(BEGE);
      const virada = lt > 13.7;                                     // "porque hoje Oxalá é preto..."
      if (!virada) {
        carimba('SEM ACOLHIMENTO DA ESQUERDA', 190, 0.1, TINTA, 70, FONTE.manchete);
        if (lt > 7.5) { ctx.fillStyle = VERM; ctx.beginPath(); ctx.moveTo(cx - 40, 250); ctx.lineTo(cx + 40, 250); ctx.lineTo(cx, 300); ctx.fill(); }
        carimba('TERREIRO VAI PRA', 380, 7.5, VERM, 92);
        carimba('EXTREMA DIREITA', 490, 8.2, VERM, 100);
      } else {
        carimba('AS ENTIDADES SÃO', 230, 13.7, TINTA, 90, FONTE.manchete);
        carimba('PRETAS E PERIFÉRICAS', 360, 15.4, VERM, 92);
      }
    }
    function luiz() {
      fundo(TINTA, 'rgba(200,32,30,0.25)');
      carimba('LUIZ GUSTAVO', 230, 0.1, BEGE, 120);
      carimba('OGÃ DE CANDOMBLÉ', 350, 0.8, AMA, 80, FONTE.manchete);
      if (lt > 1.6) L.texto(ctx, 'Núcleo dos Povos de Terreiro · Coletivo Lufã', cx, 470, { familia: FONTE.grotesca, peso: 700, tam: 30, cor: BEGE, alinhar: 'center' });
    }
    function linha(t2026) {                                          // linha do tempo 2018 → 2026
      const y = 470, x0 = 120, x1 = W - 120;
      ctx.fillStyle = TINTA; ctx.fillRect(x0, y - 4, (x1 - x0) * (t2026 ? 1 : ease.saida(seg(lt, 0.3, 1.2)) * 0.5), 8);
      [[x0, '2018', true], [x1, '2026', t2026]].forEach(([x, s, on]) => {
        if (!on) return; ctx.fillStyle = VERM; ctx.beginPath(); ctx.arc(x, y, 22, 0, 7); ctx.fill();
        L.texto(ctx, s, x, y + 80, { familia: FONTE.bloco, peso: 400, tam: 48, cor: TINTA, alinhar: 'center' });
      });
    }
    function ano2018() {
      fundo(BEGE);
      carimba('2018: O TERREIRO', 170, 0.1, TINTA, 84, FONTE.manchete);
      carimba('VIROU BOLSONARISTA', 280, 0.6, VERM, 92);
      chip('TRABALHO DE FORMIGUINHA', cx, 380, seg(lt, 6.2, 6.5), TINTA, AMA, 36);
      linha(false);
    }
    function ano2026() {
      fundo(BEGE);
      carimba('2026: TODOS', 170, 0.1, TINTA, 90, FONTE.manchete);
      carimba('VOTARAM NO PT', 290, 0.5, VERM, 100);
      linha(true);
    }
    function violencia() {
      fundo('#5E0B0A', 'rgba(0,0,0,0.25)');
      carimba('POVOS DE TERREIRO SOB ATAQUE', 140, 0.1, BEGE, 64, FONTE.manchete);
      carimba('VIOLÊNCIA INSTITUCIONAL', 290, 10.4, AMA, 80);
      carimba('VIOLÊNCIA BOLSONARISTA', 420, 12.9, AMA, 80);
      if (lt > 2.0) L.texto(ctx, 'organizar junto com essa galera', cx, 560, { familia: FONTE.serifa, estilo: 'italic', peso: 400, tam: 40, cor: BEGE, alinhar: 'center' });
    }
    function mapa() {
      fundo(BEGE);
      // alfinete de mapa
      const pin = ease.carimbo(seg(lt, 0.1, 0.5));
      ctx.save(); ctx.translate(cx, 150); ctx.scale(pin, pin); ctx.fillStyle = VERM;
      ctx.beginPath(); ctx.arc(0, -20, 48, Math.PI, 0); ctx.lineTo(0, 70); ctx.closePath(); ctx.fill();
      ctx.fillStyle = BEGE; ctx.beginPath(); ctx.arc(0, -20, 18, 0, 7); ctx.fill(); ctx.restore();
      carimba('MAPEAMENTO DAS CASAS', 300, 0.4, TINTA, 84, FONTE.manchete);
      carimba('DE CANDOMBLÉ', 400, 0.8, VERM, 92);
      chip('RIO DE JANEIRO + OUTROS ESTADOS: AJUDE!', cx, 500, seg(lt, 4.0, 4.3), TINTA, AMA, 32);
      if (lt > 7) L.texto(ctx, 'Siga @vamosinvestigar e @_ocamarada', cx, 590, { familia: FONTE.grotesca, peso: 700, tam: 32, cor: TINTA, alinhar: 'center' });
    }
    // legenda (nosso padrão), na emenda dos painéis
    function legenda() {
      const LEG = (window.TEMPOS || {}).legendas || [], l = LEG.find(l => t >= l.t0 - 0.05 && t < l.t1);
      if (!l) return;
      const CH = /^(umbanda|terreiro|núcleo|acolhimento|extrema|bolsonarismo|oxalá|pretas|periféricas|ogã|candomblé|bolsonarista|formiguinha|pt|marxista|violência|mapeamento|militando)/i;
      const pal = l.p.map(([w, t0]) => [w, t0 - 0.08]); L.fonte(ctx, FONTE.serifa, 48, 400, 'italic');
      const esp = 48 * 0.28, larg = pal.map(([w]) => ctx.measureText(w).width), tot = larg.reduce((a, b) => a + b, 0) + esp * (pal.length - 1);
      const tam = Math.min(48, 48 * 900 / tot), k = tam / 48, Wl = tot * k, x0 = CX - Wl / 2, Y = P.baixoY - 46;
      ctx.save(); ctx.globalAlpha = clamp((l.t1 - t) / 0.15) * clamp((t - l.t0 + 0.05) / 0.12);
      ctx.fillStyle = 'rgba(15,12,11,0.92)'; ctx.fillRect(x0 - 26, Y, Wl + 52, 76); ctx.fillStyle = VERM; ctx.fillRect(x0 - 26, Y, 7, 76);
      let x = x0;
      pal.forEach(([w, t0], i) => {
        const a = seg(t, t0, t0 + 0.2);
        if (a > 0) { ctx.save(); ctx.globalAlpha *= a; L.texto(ctx, w, x, Y + 51 + (1 - ease.saida(a)) * 8, { familia: FONTE.serifa, estilo: 'italic', peso: 400, tam, cor: CH.test(w) ? AMA : BEGE }); ctx.restore(); }
        x += (larg[i] + esp) * k;
      });
      ctx.restore();
    }
    function arred(x, y, w, h, r) {
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
  },
};
