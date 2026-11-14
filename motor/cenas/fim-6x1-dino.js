// Fim da 6x1 · as brechas da liminar de Dino. CAMADA DE TEXTO (fundo transparente) sobre o vídeo-base (audio/fim-6x1-dino/base.py).
// Roteiro e fontes: roteiros/fim-6x1-dino.md, midia/fim-6x1-dino/FONTES.md. Marcas e legendas: fim-6x1-dino.tempos.js (montar.py).
// Exportar com alfa: node ferramentas/overlay.js fim-6x1-dino saida/.fim6x1/overlay.mov
// Layout (pedido do autor): NADA sobre o rosto (rosto do Léo em y ≈ 480–1500). Cards e carimbos no alto, sobre a cortina (y 225–465,
// à direita da logo); legenda logo abaixo do queixo (y 1580–1656); logo LÉO DUARTE toda vermelha, sem contorno, dentro do recorte do grid (y ≥ 240).
// Sem fontes nem créditos na tela.
const T = Object.assign({ abert: 5.3, empresarios: 10.2, regras: 11.9, coletivas: 15.8, brechas: 18.1, folgas: 21.9, escarnio: 24.5,
  rick: 25.7, classe: 27.0, desmob: 32.2, radical: 33.5, cta: 34.9, picaretagem: 40.4, fimfala: 41.1, dur: 42.9 }, (window.TEMPOS || {}).marcas || {});

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: T.dur, transparente: true,
  imagens: { leo: '../identidade/marca/leo-duarte-silhueta-vermelha.png', dino: '../midia/fim-6x1-dino/dino.png' },   // Dino: CanalGov, CC BY 3.0 (Commons)

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease, clamp } = L, CX = 540, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta;
    ctx.clearRect(0, 0, 1080, 1920);
    const CORTES = (window.TEMPOS || {}).cortes || [];
    const IMP = [0.05, T.escarnio, T.radical, T.cta];
    const { dx, dy } = L.tremor(t, IMP, 8);
    ctx.save(); ctx.translate(dx, dy);

    // ------------------------------------------------ abertura: manchete-gancho na emenda das duas metades
    if (t < T.abert + 0.2) {
      const sai = clamp((T.abert + 0.2 - t) / 0.2);
      ctx.save(); ctx.globalAlpha = sai;
      L.aplicarCarimbo(ctx, seg(t, 0.0, 0.3), CX, 1040, () => {
        ctx.save(); ctx.translate(CX, 1040); ctx.rotate(-0.02);
        ctx.fillStyle = TINTA; ctx.fillRect(-520 + 10, -70 + 10, 1040, 140);
        ctx.fillStyle = VERM; ctx.fillRect(-520, -70, 1040, 140);
        ctx.strokeStyle = AMA; ctx.lineWidth = 5; ctx.strokeRect(-508, -58, 1016, 116);
        L.texto(ctx, 'ESCALA 6x1, NUNCA MAIS!', 0, 28, { familia: FONTE.bloco, peso: 400, tam: tm('ESCALA 6x1, NUNCA MAIS!', FONTE.bloco, 84, 960), cor: BEGE, alinhar: 'center', erro: TINTA, desloc: 4 });
        ctx.restore();
      }, 3);
      dinoPalhaco(T.palhaco || 1.7);
      ctx.restore();
    }

    // ------------------------------------------------ cards com os fatos (no peito, acima da legenda: y 1150–1430)
    // a) CNC + CNI no STF
    janela(T.empresarios + 0.15, T.regras - 0.1, p => chip('CNC + CNI FORAM AO STF', 345, p, TINTA, BEGE, 40));
    // b) a liminar: 8h24 sem hora extra
    janela(T.regras + 0.1, T.coletivas - 0.05, p => ficha(p, 'LIMINAR DE DINO · 12/11', ['42 h em 5 dias de 8h24', '24 min SEM HORA EXTRA'], 1));
    // c) acordo coletivo decide
    janela(T.coletivas + 0.1, T.folgas - 0.1, p => chip('ACORDO COLETIVO DECIDE SUA FOLGA', 345, p, VERM, BEGE, 36));
    // d) o calendário: as duas folgas saem da semana
    janela(T.folgas - 0.1, T.escarnio - 0.05, p => calendario(p));
    // e) ESCÁRNIO
    janela(T.escarnio, T.classe, p => carimbo('ESCÁRNIO!', 345, p, VERM, 9));
    // f) a luta: Rick Azevedo, Erika Hilton, a classe trabalhadora
    janela(T.classe + 0.1, T.desmob - 0.2, p => chip('2 FOLGAS POR SEMANA!', 345, p, TINTA, AMA, 44));
    // g) RADICALIZAR
    janela(T.radical, T.cta - 0.05, p => carimbo('RADICALIZAR!', 345, p, VERM, 11));
    // h) chamada: compartilhar (o sinal que mais distribui o Reels é o envio por DM)
    janela(T.cta, T.dur + 1, p => cta(p));

    ctx.restore();

    // flash curto em cada corte (quebra de padrão) e nos impactos
    CORTES.forEach(c => L.flash(ctx, t, c, '#FFFFFF', 0.08, 0.10));
    IMP.forEach(X => L.flash(ctx, t, X, AMA, 0.22, 0.22));

    legenda();
    logo();

    // ================================================ componentes
    function tm(s, fam, tam, larg, peso = 400) { return Math.min(tam, L.ajustar(ctx, s, fam, larg, peso)); }
    function janela(a, b, f) {               // entra em a, sai em b (com animação de 0,25 s)
      if (t < a || t > b + 0.25) return;
      f(t < b ? seg(t, a, a + 0.3) : 1 - seg(t, b, b + 0.25));
    }
    function chip(s, y, p, fundo, cor, tam) {
      if (p <= 0) return;
      L.fonte(ctx, FONTE.grotesca, tam, 700);
      const w = Math.min(ctx.measureText(s).width + 60, 640), h = tam * 1.9, e = lerp(0.6, 1, ease.carimbo(clamp(p)));
      ctx.save(); ctx.translate(630, y); ctx.scale(e, e); ctx.globalAlpha = clamp(p * 3); ctx.rotate(-0.02);
      ctx.fillStyle = TINTA; ctx.fillRect(-w / 2 + 8, -h / 2 + 8, w, h);
      ctx.fillStyle = fundo; ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = cor; ctx.lineWidth = 3; ctx.strokeRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14);
      L.texto(ctx, s, 0, tam * 0.36, { familia: FONTE.grotesca, peso: 700, tam: tm(s, FONTE.grotesca, tam, w - 50, 700), cor, alinhar: 'center' });
      ctx.restore();
    }
    function ficha(p, titulo, linhas, seed) {
      const e = ease.saida(clamp(p));
      ctx.save(); ctx.globalAlpha = clamp(p * 3); ctx.translate((1 - e) * -700, 0); ctx.rotate(-0.015);
      const x = 305, y = 220, w = 660, h = 250;
      ctx.fillStyle = 'rgba(28,23,20,0.45)'; ctx.fillRect(x + 12, y + 12, w, h);
      ctx.fillStyle = BEGE; ctx.fillRect(x, y, w, h); ctx.fillStyle = VERM; ctx.fillRect(x, y, w, 12);
      L.texto(ctx, titulo, x + 30, y + 68, { familia: FONTE.sub, peso: 600, tam: 38, cor: VERM, tracking: 2 });
      linhas.forEach((s, i) => L.texto(ctx, L.datilografar(s, seg(t, T.regras + 0.4 + i * 0.6, T.regras + 1.0 + i * 0.6)), x + 30, y + 140 + i * 66,
        { familia: FONTE.maquina, peso: 400, tam: 42, cor: TINTA }));
      L.fonte(ctx, FONTE.maquina, 42, 400);
      L.selecao(ctx, x + 26, y + 168, ctx.measureText('24 min SEM HORA EXTRA').width + 8, 56, seg(t, T.regras + 2.0, T.regras + 2.4), VERM);
      ctx.restore();
    }
    function calendario(p) {
      const dias = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'], x0 = 325, y = 300, w = 88, h = 110;
      ctx.save(); ctx.globalAlpha = clamp(p * 3);
      ctx.fillStyle = 'rgba(28,23,20,0.85)'; ctx.fillRect(x0 - 20, y - 70, 7 * w + 40, h + 110);
      L.texto(ctx, 'SUA SEMANA', x0, y - 22, { familia: FONTE.grotesca, peso: 700, tam: 30, cor: AMA });
      const k = ease.saida(seg(t, T.folgas + 0.5, T.folgas + 1.4));          // as folgas saem da semana
      dias.forEach((d, i) => {
        const folga = i >= 5, x = x0 + i * w + (folga ? k * 260 : 0);
        ctx.save(); if (folga) ctx.globalAlpha *= 1 - k * 0.85;
        ctx.fillStyle = folga ? '#3E8E3A' : VERM; ctx.fillRect(x + 4, y, w - 8, h);
        L.texto(ctx, d, x + w / 2, y + 46, { familia: FONTE.grotesca, peso: 700, tam: 26, cor: BEGE, alinhar: 'center' });
        L.texto(ctx, folga ? 'FOLGA' : 'TRAB.', x + w / 2, y + 92, { familia: FONTE.grotesca, peso: 700, tam: 22, cor: BEGE, alinhar: 'center' });
        ctx.restore();
        if (folga && k > 0.3) { ctx.fillStyle = VERM; ctx.fillRect(x0 + i * w + 4, y, w - 8, h);
          L.texto(ctx, 'TRAB.', x0 + i * w + w / 2, y + 92, { familia: FONTE.grotesca, peso: 700, tam: 22, cor: BEGE, alinhar: 'center' });
          L.texto(ctx, d, x0 + i * w + w / 2, y + 48, { familia: FONTE.grotesca, peso: 700, tam: 28, cor: BEGE, alinhar: 'center' }); }
      });
      ctx.restore();
      if (t > T.folgas + 1.4) carimbo('FOLGA EMPURRADA', 470, seg(t, T.folgas + 1.4, T.folgas + 1.7), AMA, 5, 50, TINTA);
    }
    function carimbo(s, y, p, cor, seed, tam = 120, corTexto = BEGE) {
      L.aplicarCarimbo(ctx, clamp(p), 630, y, () => {
        ctx.save(); ctx.translate(630, y); ctx.rotate(-0.06);
        const tt = tm(s, FONTE.bloco, tam, 580), w = Math.min(640, (L.fonte(ctx, FONTE.bloco, tt, 400), ctx.measureText(s).width + 70)), h = tt * 1.35;
        ctx.fillStyle = TINTA; ctx.fillRect(-w / 2 + 10, -h / 2 + 10, w, h);
        ctx.fillStyle = cor; ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeStyle = corTexto; ctx.lineWidth = 5; ctx.strokeRect(-w / 2 + 9, -h / 2 + 9, w - 18, h - 18);
        L.texto(ctx, s, 0, tt * 0.36, { familia: FONTE.bloco, peso: 400, tam: tt, cor: corTexto, alinhar: 'center' });
        ctx.restore();
      }, seed);
    }
    function cta(p) {
      const e = ease.carimbo(clamp(p));
      ctx.save(); ctx.translate(635, 340); ctx.scale(lerp(0.5, 1, e), lerp(0.5, 1, e)); ctx.globalAlpha = clamp(p * 3); ctx.rotate(-0.03);
      ctx.fillStyle = TINTA; ctx.fillRect(-325 + 10, -118 + 10, 650, 236);
      ctx.fillStyle = AMA; ctx.fillRect(-325, -118, 650, 236);
      ctx.strokeStyle = TINTA; ctx.lineWidth = 5; ctx.strokeRect(-313, -106, 626, 212);
      // ícone de envio (avião de papel), pulsando
      const pul = 1 + 0.08 * Math.sin(t * 9);
      ctx.save(); ctx.translate(-240, -10); ctx.scale(pul * 0.8, pul * 0.8); ctx.rotate(-0.35);
      ctx.fillStyle = VERM; ctx.beginPath(); ctx.moveTo(-60, -10); ctx.lineTo(70, -50); ctx.lineTo(10, 60); ctx.lineTo(0, 10); ctx.closePath(); ctx.fill();
      ctx.restore();
      L.texto(ctx, 'MANDA PRA QUEM', 60, -38, { familia: FONTE.bloco, peso: 400, tam: 48, cor: TINTA, alinhar: 'center' });
      L.texto(ctx, 'TRABALHA NA 6x1', 60, 22, { familia: FONTE.bloco, peso: 400, tam: 48, cor: VERM, alinhar: 'center' });
      if (t > T.fimfala - 1.5) L.texto(ctx, 'STF julga até segunda (16/11)', 0, 84, { familia: FONTE.grotesca, peso: 700, tam: 30, cor: TINTA, alinhar: 'center' });
      ctx.restore();
    }
    // legenda padrão (tarja escura do tamanho da frase, filete vermelho, texto bege 48 px), com as palavras-chave em amarelo
    function legenda() {
      const LEG = (window.TEMPOS || {}).legendas || [];
      const l = LEG.find(l => t >= l.t0 - 0.05 && t < l.t1);
      if (!l) return;
      const CHAVE = /^(dino|empresários|brechas|folgas|semana|escárnio|radicalizar|compartilhe|6x1|picaretagem|covardia|nojento|descansar|coletivas)/i;
      const pal = l.p.map(([w, t0]) => [w, t0 - 0.08]);
      L.fonte(ctx, FONTE.serifa, 48, 400, 'italic');
      const esp = 48 * 0.28, larg = pal.map(([w]) => ctx.measureText(w).width), tot = larg.reduce((a, b) => a + b, 0) + esp * (pal.length - 1);
      const tam = Math.min(48, 48 * 820 / tot), k = tam / 48, W = tot * k, x0 = 540 - W / 2, Y = t < T.abert ? 880 : 1580;
      ctx.save(); ctx.globalAlpha = clamp((l.t1 - t) / 0.15) * clamp((t - l.t0 + 0.05) / 0.12);
      ctx.fillStyle = 'rgba(15,12,11,0.86)'; ctx.fillRect(x0 - 26, Y, W + 52, 76);
      ctx.fillStyle = VERM; ctx.fillRect(x0 - 26, Y, 7, 76);
      let x = x0;
      pal.forEach(([w, t0], i) => {
        const a = seg(t, t0, t0 + 0.2);
        if (a > 0) {
          ctx.save(); ctx.globalAlpha *= a; ctx.filter = a < 1 ? `blur(${(1 - a) * 8}px)` : 'none';
          L.texto(ctx, w, x, Y + 51 + (1 - ease.saida(a)) * 10, { familia: FONTE.serifa, estilo: 'italic', peso: 400, tam, cor: CHAVE.test(w) ? AMA : BEGE });
          ctx.restore();
        }
        x += (larg[i] + esp) * k;
      });
      ctx.restore();
    }
    // a fotinha do Flávio Dino no canto de baixo, ao lado do Rick: entra normal e, em tp, vira PALHAÇO
    // (nariz vermelho, bochechas, peruca colorida; coordenadas do rosto na foto: nariz 238,230 · cabeça x 155–375, topo y 15)
    function dinoPalhaco(tp) {
      const im = L.img.dino; if (!im) return;
      const sx = 95, sy = 0, sw = 300, sh = 370;                    // recorte da foto (rosto)
      const dw = 210, dh = dw * sh / sw, dx = 830, dy = 930 - dh - 18;
      const e = ease.carimbo(seg(t, 0.2, 0.55)), k = dw / sw;
      ctx.save(); ctx.translate(dx + dw / 2, dy + dh / 2); ctx.scale(e, e); ctx.rotate(0.04 + (t > tp ? Math.sin((t - tp) * 14) * 0.03 * clamp(1 - (t - tp) / 1.5) : 0));
      ctx.translate(-dw / 2, -dh / 2);
      L.moldura(ctx, 0, 0, dw, dh, 12);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, dw, dh); ctx.clip();
      ctx.drawImage(im, sx, sy, sw, sh, 0, 0, dw, dh);
      const p = ease.carimbo(seg(t, tp, tp + 0.3));
      if (p > 0) {
        const P = (x, y) => [(x - sx) * k, (y - sy) * k];
        // peruca: tufos coloridos dos dois lados da cabeça e no topo
        const tufos = [[150, 120, '#FF6A00'], [135, 175, '#2E7DF2'], [150, 230, '#22B04B'], [380, 120, '#FF2D95'], [395, 175, '#FFD400'], [380, 230, '#FF6A00'],
          [200, 40, '#2E7DF2'], [265, 25, '#FF2D95'], [330, 45, '#22B04B']];
        tufos.forEach(([x, y, c], i) => {
          const [X, Y] = P(x, y), r = 34 * k * p;
          ctx.fillStyle = c;
          for (let j = 0; j < 5; j++) { ctx.beginPath(); ctx.arc(X + Math.cos(j * 1.3 + i) * r * 0.6, Y + Math.sin(j * 1.3 + i) * r * 0.6, r * 0.75, 0, 7); ctx.fill(); }
        });
        // bochechas
        ctx.save(); ctx.globalAlpha = 0.55 * p; ctx.fillStyle = '#FF3B6B';
        [[192, 252], [292, 252]].forEach(([x, y]) => { const [X, Y] = P(x, y); ctx.beginPath(); ctx.arc(X, Y, 22 * k, 0, 7); ctx.fill(); });
        ctx.restore();
        // nariz vermelho com brilho
        const [nx, ny] = P(238, 232), rn = 30 * k * p;
        ctx.fillStyle = '#E3141B'; ctx.beginPath(); ctx.arc(nx, ny, rn, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(nx - rn * 0.35, ny - rn * 0.35, rn * 0.28, 0, 7); ctx.fill();
      }
      ctx.restore(); ctx.restore();
    }
    // a logo Léo Duarte (única marca no vídeo): canto superior esquerdo, dentro da zona segura
    function logo() {
      const im = L.img.leo; if (!im) return;
      const w = 175, h = w * im.height / im.width;
      ctx.save(); ctx.globalAlpha = clamp(t / 0.3); ctx.drawImage(im, 95, 250, w, h); ctx.restore();
    }
  },
};
