// CORTE 01 · live do Coletivo Lufã (15/11/2026): Núcleo dos Povos de Terreiro. Camada transparente sobre saida/corte-01-terreiro-base.mp4.
// Layout v3 (pedido do autor): SEM borda preta (vídeo em cima e foto embaixo de ponta a ponta), textos menores, e NADA importante na parte
// de baixo (onde o Instagram põe o @, a descrição e os botões): tarjas, cards e chamadas ficam acima de y ≈ 1560; abaixo disso só foto.
// Exportar: node ferramentas/overlay.js corte-01-terreiro saida/.corte01/overlay.mov
const P = { cimaH: 1100, baixoY: 1100, baixoH: 820, util: 450 };   // util = altura do painel de baixo que pode ter texto (1100 → 1550)
const PESSOAS = { leo: ['LEONARDO DUARTE', '@_ocamarada'], luiz: ['LUIZ GUSTAVO', '@vamosinvestigar'] };
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: (window.TEMPOS || {}).dur || 90,
  imagens: {
    lufa: '../identidade/marca/coletivo-lufa-horizontal.png',
    // fotos de uso livre (Wikimedia Commons; créditos em midia/corte-01-terreiro/CREDITOS.md e na legenda do post)
    rio1: '../midia/corte-01-terreiro/umbanda-rio-1.jpg', rio2: '../midia/corte-01-terreiro/umbanda-rio-2.jpg', rio3: '../midia/corte-01-terreiro/umbanda-rio-3.jpg',
    pretoVelho: '../midia/corte-01-terreiro/preto-velho.jpg', caboclo: '../midia/corte-01-terreiro/caboclo.jpg',
    candomble: '../midia/corte-01-terreiro/candomble-ritual.jpg', iemanja: '../midia/corte-01-terreiro/iemanja.jpg',
    dana2: '../midia/corte-01-terreiro/dana-02.jpg', iem11: '../midia/corte-01-terreiro/iemanja-11.jpg', iem3: '../midia/corte-01-terreiro/iemanja-03.jpg',
  },
  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease, clamp } = L, CX = 540, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta;
    const B = (window.TEMPOS || {}).blocos || [], bl = B.find(b => t >= b.t0 && t < b.t1) || B[B.length - 1] || { t0: 0, t1: 1, quem: 'leo', card: 'dia' };
    const lt = t - bl.t0, M = (window.TEMPOS || {}).marcas || {}, rel = x => (x ?? 0) - bl.t0;   // rel: marca (palavra) no tempo do bloco
    ctx.clearRect(0, 0, 1080, 1920);

    // painel de baixo (de ponta a ponta)
    ctx.save(); ctx.beginPath(); ctx.rect(0, P.baixoY, 1080, P.baixoH); ctx.clip(); ctx.translate(0, P.baixoY);
    const W = 1080, H = P.baixoH, cx = W / 2;
    ({ nucleo, direita, luiz, importancia, mapa })[bl.card]();
    L.papel(ctx, t, 0.06);
    ctx.restore();
    // filete vermelho na emenda dos dois painéis
    ctx.fillStyle = VERM; ctx.fillRect(0, P.baixoY - 3, 1080, 6);

    // tarja com nome e @ de quem fala (canto de baixo do vídeo, à esquerda)
    const [nome, arroba] = PESSOAS[bl.quem];
    ctx.save(); ctx.globalAlpha = clamp(seg(lt, 0, 0.25) * 1.5);
    const tx = 90, ty = P.cimaH - 230;                                   // longe da borda (não corta no Reels)
    L.fonte(ctx, FONTE.bloco, 30, 400); const tw = Math.max(ctx.measureText(nome).width, 230) + 44;
    ctx.fillStyle = 'rgba(15,12,11,0.85)'; ctx.fillRect(tx, ty, tw, 80); ctx.fillStyle = AMA; ctx.fillRect(tx, ty, 7, 80);
    L.texto(ctx, nome, tx + 24, ty + 38, { familia: FONTE.bloco, peso: 400, tam: 30, cor: BEGE });
    L.texto(ctx, arroba, tx + 24, ty + 66, { familia: FONTE.grotesca, peso: 700, tam: 22, cor: AMA });
    ctx.restore();

    // logo pequena do Coletivo Lufã, no alto (abaixo da barra do Instagram)
    const im = L.img.lufa, lw = 180, lh = lw * im.height / im.width;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 16; ctx.drawImage(im, 70, 205, lw, lh);                                  // canto superior esquerdo, sem encostar na borda ctx.restore();

    legenda();

    // ================================================ painel de baixo (coordenadas locais: 1080 × 820; texto só até y ≈ 450)
    function foto(img, t0, o = {}) {
      const e = ease.saida(seg(lt, t0, t0 + 0.5));
      ctx.save(); ctx.globalAlpha = clamp(seg(lt, t0, t0 + 0.3) * 1.2);
      L.foto(ctx, L.img[img], 0, 0, W, H, { pb: false, retic: false, zoom: lerp(1.03, 1.10, seg(lt, t0, t0 + 8)), dy: o.dy || 0, dx: o.dx || 0, desfoque: (1 - e) * 6 });
      ctx.restore();
    }
    // tarja com o texto-chave NO ALTO do painel de baixo (fora da área do @ e da descrição do Reels)
    function tarja(t0, linha1, linha2) {
      const g = ctx.createLinearGradient(0, 0, 0, 260); g.addColorStop(0, 'rgba(15,12,11,0.7)'); g.addColorStop(1, 'rgba(15,12,11,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, 260);
      L.aplicarCarimbo(ctx, seg(lt, t0 + 0.15, t0 + 0.45), cx, 120, () => {
        const tam1 = Math.min(40, L.ajustar(ctx, linha1, FONTE.bloco, 860, 400));
        L.fonte(ctx, FONTE.bloco, tam1, 400); const w1 = ctx.measureText(linha1).width + 44;
        ctx.fillStyle = VERM; ctx.fillRect(cx - w1 / 2, 86, w1, tam1 * 1.5);
        L.texto(ctx, linha1, cx, 86 + tam1 * 1.08, { familia: FONTE.bloco, peso: 400, tam: tam1, cor: BEGE, alinhar: 'center' });
        if (linha2) {
          const t2 = Math.min(26, L.ajustar(ctx, linha2, FONTE.grotesca, 860, 700)); L.fonte(ctx, FONTE.grotesca, t2, 700);
          const w2 = ctx.measureText(linha2).width + 30, y2 = 86 + tam1 * 1.5 + 6;
          ctx.fillStyle = 'rgba(15,12,11,0.85)'; ctx.fillRect(cx - w2 / 2, y2, w2, t2 + 18);
          L.texto(ctx, linha2, cx, y2 + t2 + 4, { familia: FONTE.grotesca, peso: 700, tam: t2, cor: AMA, alinhar: 'center' });
        }
      }, 5);
    }
    function fotoTarja(img, t0, l1, l2, o) { foto(img, t0, o); tarja(t0, l1, l2); }
    function fundo(cor, raios = 'rgba(200,32,30,0.08)') { ctx.fillStyle = cor; ctx.fillRect(0, 0, W, H); L.raios(ctx, cx, H, 1700, 22, -0.2 + L.emDois(t) * 0.03, raios); }
    function carimba(txt, y, t0, cor, tam, fam = FONTE.bloco, larg = 860, seed = 1) {
      const peso = fam === FONTE.bloco ? 400 : 900;
      L.aplicarCarimbo(ctx, seg(lt, t0, t0 + 0.3), cx, y, () =>
        L.texto(ctx, txt, cx, y, { familia: fam, peso, tam: Math.min(tam, L.ajustar(ctx, txt, fam, larg, peso)), cor, alinhar: 'center', erro: cor === TINTA ? VERM : TINTA, desloc: 3 }), seed);
    }
    function chip(txt, x, y, p, fundoC = TINTA, cor = BEGE, tam = 26) { if (p > 0) L.etiqueta(ctx, txt, x, y, p, { cor: fundoC, corTexto: cor, tam }); }

    function nucleo() {
      if (lt < rel(M.nucleo) - 0.3) fotoTarja('rio2', 0, '15 DE NOVEMBRO', 'DIA NACIONAL DA UMBANDA · Lei 12.644/2012');
      else if (lt < rel(M.consc) - 0.2) fotoTarja('rio1', rel(M.nucleo) - 0.3, 'NÚCLEO DOS POVOS DE TERREIRO', 'COLETIVO LUFÃ · comandado por Luiz Gustavo');
      else fotoTarja('rio3', rel(M.consc) - 0.2, 'CONSCIENTIZAÇÃO · PROTEÇÃO · ACOLHIMENTO', 'Núcleo dos Povos de Terreiro', { dy: 60 });
    }
    function direita() {
      const ex = rel(M.extrema) - 1.2, ox = rel(M.oxala) - 0.2, pr = rel(M.pretas) - 0.2;
      if (lt < ox) fotoTarja('rio3', 0, lt < ex ? 'SEM ACOLHIMENTO DA ESQUERDA' : 'TERREIRO VAI PRA EXTREMA DIREITA', lt < ex ? 'por falta de alinhamento' : 'isso não pode acontecer', { dy: 60 });
      else if (lt < pr) fotoTarja('pretoVelho', ox, 'AS ENTIDADES SÃO PRETAS', 'Preto Velho');
      else fotoTarja('caboclo', pr, 'PRETAS E PERIFÉRICAS', 'Caboclo', { dy: 300 });
    }
    function luiz() { fotoTarja('candomble', 0, 'LUIZ GUSTAVO · OGÃ DE CANDOMBLÉ', '@vamosinvestigar'); }
    function importancia() {
      const vi = rel(M.institucional) - 0.4;
      if (lt < vi) fotoTarja('iem11', 0, 'ORGANIZAR OS POVOS DE TERREIRO', 'marxistas junto com o povo de axé');
      else fotoTarja('iem3', vi, 'VIOLÊNCIA INSTITUCIONAL E BOLSONARISTA', 'contra os povos de terreiro');
    }
    function linha(t2026) {                                          // linha do tempo 2018 → 2026
      const y = 330, x0 = 160, x1 = W - 160;
      ctx.fillStyle = TINTA; ctx.fillRect(x0, y - 3, (x1 - x0) * (t2026 ? 1 : ease.saida(seg(lt, 0.3, 1.2)) * 0.5), 6);
      [[x0, '2018', true], [x1, '2026', t2026]].forEach(([x, s, on]) => {
        if (!on) return; ctx.fillStyle = VERM; ctx.beginPath(); ctx.arc(x, y, 16, 0, 7); ctx.fill();
        L.texto(ctx, s, x, y + 56, { familia: FONTE.bloco, peso: 400, tam: 36, cor: TINTA, alinhar: 'center' });
      });
    }
    function ano2018() {
      fundo(BEGE);
      carimba('2018: O TERREIRO', 110, 0.1, TINTA, 62, FONTE.manchete);
      carimba('VIROU BOLSONARISTA', 190, 0.6, VERM, 64);
      chip('TRABALHO DE FORMIGUINHA', cx, 262, seg(lt, 4.2, 4.5), TINTA, AMA, 28);
      linha(false);
    }
    function ano2026() {
      fundo(BEGE);
      carimba('2026: TODOS', 110, 0.1, TINTA, 64, FONTE.manchete);
      carimba('VOTARAM NO PT', 200, 0.5, VERM, 72);
      linha(true);
    }
    function organizar() { fotoTarja('iemanja', 0, 'MARXISTAS + POVOS DE TERREIRO', 'ORGANIZAÇÃO!'); }
    function mapa() {                                                // pessoas vestidas de santo (candomblé) + o mapeamento das casas de axé
      foto('dana2', 0);
      const ap = clamp(seg(lt, rel(M.casas) - 0.5, rel(M.casas)));   // o texto entra quando ele fala "das casas"
      const g = ctx.createLinearGradient(0, 0, 0, 470); g.addColorStop(0, `rgba(15,12,11,${0.85 * ap})`); g.addColorStop(1, 'rgba(15,12,11,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, 470);
      const t0 = rel(M.casas) - 0.5;
      if (lt < t0) { tarja(0, 'A IDEIA É FAZER O MAPEAMENTO', 'Luiz Gustavo · Núcleo dos Povos de Terreiro'); return; }
      carimba('MAPEAMENTO DAS CASAS DE AXÉ', 100, t0, BEGE, 56, FONTE.manchete);
      ['CANDOMBLÉ', 'UMBANDA', 'QUIMBANDA'].forEach((s2, i) => chip(s2, 290 + i * 250, 170, seg(lt, t0 + 0.5 + i * 0.35, t0 + 0.8 + i * 0.35), VERM, BEGE, 28));
      if (lt > t0 + 1.7) L.texto(ctx, L.datilografar('e outras religiões de matriz afro-brasileira', seg(lt, t0 + 1.7, t0 + 2.9)), cx, 250, { familia: FONTE.serifa, estilo: 'italic', peso: 400, tam: 36, cor: BEGE, alinhar: 'center', erro: TINTA, desloc: 2 });
      chip('RIO DE JANEIRO + OUTROS ESTADOS: AJUDE!', cx, 320, seg(lt, t0 + 3.6, t0 + 3.9), AMA, TINTA, 26);
      if (lt > t0 + 5) L.texto(ctx, 'Siga @vamosinvestigar e @_ocamarada', cx, 395, { familia: FONTE.grotesca, peso: 700, tam: 26, cor: BEGE, alinhar: 'center', erro: TINTA, desloc: 2 });
    }
    // legenda (nosso padrão, um pouco menor), na emenda dos painéis
    function legenda() {
      const LEG = (window.TEMPOS || {}).legendas || [], l = LEG.find(l => t >= l.t0 - 0.05 && t < l.t1);
      if (!l) return;
      const CH = /^(umbanda|terreiro|núcleo|acolhimento|extrema|bolsonarismo|oxalá|pretas|periféricas|ogã|candomblé|bolsonarista|formiguinha|pt|marxista|violência|mapeamento|militando)/i;
      const T0 = 40, pal = l.p.map(([w, t0]) => [w, t0 - 0.08]); L.fonte(ctx, FONTE.serifa, T0, 400, 'italic');
      const esp = T0 * 0.28, larg = pal.map(([w]) => ctx.measureText(w).width), tot = larg.reduce((a, b) => a + b, 0) + esp * (pal.length - 1);
      const tam = Math.min(T0, T0 * 860 / tot), k = tam / T0, Wl = tot * k, x0 = CX - Wl / 2, Y = P.baixoY - 34;
      ctx.save(); ctx.globalAlpha = clamp((l.t1 - t) / 0.15) * clamp((t - l.t0 + 0.05) / 0.12);
      ctx.fillStyle = 'rgba(15,12,11,0.92)'; ctx.fillRect(x0 - 22, Y, Wl + 44, 64); ctx.fillStyle = VERM; ctx.fillRect(x0 - 22, Y, 6, 64);
      let x = x0;
      pal.forEach(([w, t0], i) => {
        const a = seg(t, t0, t0 + 0.2);
        if (a > 0) { ctx.save(); ctx.globalAlpha *= a; L.texto(ctx, w, x, Y + 43 + (1 - ease.saida(a)) * 6, { familia: FONTE.serifa, estilo: 'italic', peso: 400, tam, cor: CH.test(w) ? AMA : BEGE }); ctx.restore(); }
        x += (larg[i] + esp) * k;
      });
      ctx.restore();
    }
  },
};
