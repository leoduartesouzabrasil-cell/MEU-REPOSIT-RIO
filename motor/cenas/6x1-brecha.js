// "6x1: a brecha que empurra a sua folga" — roteiro roteiros/6x1-brecha-folgas.md · narração e marcas: audio/6x1-brecha/montar.py (6x1-brecha.tempos.js)
// Gancho escuro com a corrente que QUEBRA no "escravidão" (TUM) → tela preta → explicação (bege) → denúncia (escuro) → chamada (bege) → logo.
// Diagramação: título y 330 · conteúdo y 420–1420 · legenda (tarja) y 1466–1542 · logo Léo Duarte (vermelha) no canto de cima (fora do grid só no fim).
const T = Object.assign({ quebra: 8.2, fim6x1: 10, dezembro: 12.4, duas: 14.5, stf: 16.1, brecha: 18, acordo: 18.8, semana: 22.8, mes: 23.7, lutou: 25.3,
  empurrar: 30.2, sabese: 31.9, ouseja: 33.4, descansa: 35.8, camara: 40.3, julgamento: 44.4, compartilhe: 47, folgatoda: 49.8, logo: 53.5, dur: 55.7 },
  (window.TEMPOS || {}).marcas || {});
window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: T.dur,
  imagens: { leo: '../identidade/marca/leo-duarte-silhueta-vermelha.png' },
  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease, clamp } = L, CX = 540, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta, CARVAO = COR.carvao;
    const VOLTA = T.quebra + 0.85;                                   // fim da tela preta
    let arquivo = false;
    const IMP = [T.quebra, T.brecha, T.empurrar, T.folgatoda, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 12);
    ctx.save(); ctx.translate(dx, dy);
    if (t < T.quebra + 0.25) gancho();
    else if (t < VOLTA) { L.fundo(ctx, '#000'); }                       // tela preta
    else if (t < T.lutou) explicacao();
    else if (t < T.camara) denuncia();
    else if (t < T.logo) chamada();
    else final();
    ctx.restore();
    [[T.lutou, CARVAO, -24], [T.camara, BEGE, 24], [T.logo, BEGE, -24]].forEach(([X, cor, ang]) => L.corteDiagonal(ctx, seg(t, X - 0.4, X), cor, ang));
    if (arquivo) L.varredura(ctx, t, 0.06);
    L.flash(ctx, t, T.quebra, '#FFFFFF', 0.25, 0.75);
    [T.brecha, T.empurrar, T.folgatoda, T.logo].forEach(X => L.flash(ctx, t, X, AMA, 0.22, 0.22));
    if (t < T.quebra + 0.25 || t >= VOLTA) { L.papel(ctx, t, 0.11); L.vinheta(ctx, 0.35); }
    if (t < T.quebra + 0.2 || (t >= VOLTA && t < T.logo)) legenda();
    if (t >= VOLTA && t < T.logo) logo();

    // ------------------------------------------------ componentes
    function tm(s, fam, tam, larg = 900, peso = 400) { return Math.min(tam, L.ajustar(ctx, s, fam, larg, peso)); }
    function carimbar(txt, y, t0, cor, tam, fam = FONTE.bloco, seed = 1, o = {}) {
      const peso = fam === FONTE.bloco ? 400 : 900;
      L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), CX, y, () =>
        L.texto(ctx, txt, CX, y, { familia: fam, peso, tam: tm(txt, fam, tam, o.larg || 900, peso), cor, alinhar: 'center', erro: o.erro || TINTA, desloc: 5 }), seed);
    }
    function faixa(txt, y, t0, fundoC, cor, tam = 50, seed = 9) {
      L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), CX, y, () => {
        ctx.save(); ctx.translate(CX, y); ctx.rotate(-0.02);
        ctx.fillStyle = TINTA; ctx.fillRect(-460 + 8, -58 + 8, 920, 116); ctx.fillStyle = fundoC; ctx.fillRect(-460, -58, 920, 116);
        L.texto(ctx, txt, 0, tam * 0.36, { familia: FONTE.bloco, peso: 400, tam: tm(txt, FONTE.bloco, tam, 860), cor, alinhar: 'center' });
        ctx.restore();
      }, seed);
    }
    function titulo(txt, t0, cor = TINTA) {
      L.texto(ctx, L.datilografar(txt, seg(t, t0, t0 + 0.6)), CX + 60, 330, { familia: FONTE.grotesca, peso: 700, tam: tm(txt, FONTE.grotesca, 44, 680, 700), cor, alinhar: 'center', rgb: 1.5 });   // à direita da logo
    }
    function sol(fundoC, raios) { L.fundo(ctx, fundoC); L.raios(ctx, CX, 1300, 2600, 22, -0.25 + L.emDois(t) * 0.04, raios); }
    // corrente horizontal (elos alternando de frente e de lado); quebra no elo do meio
    function corrente(y, q) {
      const n = 13, passo = 96, x0 = CX - (n - 1) * passo / 2, tensao = clamp(t / T.quebra), treme = (L.rng(Math.floor(t * 30))() - 0.5) * 6 * tensao;
      for (let i = 0; i < n; i++) {
        const lado = i < n / 2 ? -1 : 1, meio = i === 6;
        let x = x0 + i * passo, yy = y + treme * (i % 2 ? 1 : -1), rot = 0;
        if (q > 0 && !meio) { const d = Math.abs(i - 6); x += lado * ease.saida(q) * (260 + d * 40); yy += Math.pow(q, 2) * 420 * (0.5 + (i % 3) * 0.3); rot = lado * q * (1.5 + d * 0.2); }
        if (q > 0 && meio) continue;                                   // o elo do meio estoura
        ctx.save(); ctx.translate(x, yy); ctx.rotate(rot);
        const g = ctx.createLinearGradient(0, -40, 0, 40); g.addColorStop(0, '#d9d9d9'); g.addColorStop(0.5, '#7a7a7a'); g.addColorStop(1, '#3a3a3a');
        ctx.strokeStyle = g; ctx.lineWidth = i % 2 ? 16 : 18;
        ctx.beginPath(); if (i % 2) ctx.ellipse(0, 0, 62, 14, 0, 0, 7); else ctx.ellipse(0, 0, 62, 34, 0, 0, 7); ctx.stroke();
        ctx.restore();
      }
      if (q > 0 && q < 1) {                                           // faíscas
        const r = L.rng(7);
        for (let k = 0; k < 26; k++) { const a = r() * 6.28, v = 200 + r() * 520; ctx.fillStyle = k % 3 ? AMA : '#FFFFFF';
          ctx.globalAlpha = 1 - q; ctx.fillRect(CX + Math.cos(a) * v * q, y + Math.sin(a) * v * q + q * q * 300, 7, 7); }
        ctx.globalAlpha = 1;
      }
    }
    function semana(y, t0, sai, rot = 'SUA SEMANA') {                  // 7 dias; as folgas (SÁB/DOM) saem da semana
      const dias = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'], w = 118, x0 = CX - 7 * w / 2, k = ease.saida(seg(t, sai, sai + 0.9));
      ctx.save(); ctx.globalAlpha = clamp(seg(t, t0, t0 + 0.3) * 3);
      ctx.fillStyle = 'rgba(28,23,20,0.9)'; ctx.fillRect(x0 - 20, y - 70, 7 * w + 40, 220);
      L.texto(ctx, rot, x0, y - 22, { familia: FONTE.grotesca, peso: 700, tam: 32, cor: AMA });
      dias.forEach((d, i) => {
        const folga = i >= 5, x = x0 + i * w;
        ctx.fillStyle = VERM; ctx.fillRect(x + 5, y, w - 10, 130);
        if (folga) {                                                  // a folga vai embora pra direita
          ctx.save(); ctx.globalAlpha *= 1 - k * 0.9; const xf = x + k * 520;
          ctx.fillStyle = '#3E8E3A'; ctx.fillRect(xf + 5, y, w - 10, 130);
          L.texto(ctx, d, xf + w / 2, y + 56, { familia: FONTE.grotesca, peso: 700, tam: 30, cor: BEGE, alinhar: 'center' });
          L.texto(ctx, 'FOLGA', xf + w / 2, y + 102, { familia: FONTE.grotesca, peso: 700, tam: 24, cor: BEGE, alinhar: 'center' }); ctx.restore();
        }
        if (!folga || k > 0.3) {
          L.texto(ctx, d, x + w / 2, y + 56, { familia: FONTE.grotesca, peso: 700, tam: 30, cor: BEGE, alinhar: 'center' });
          L.texto(ctx, 'TRAB.', x + w / 2, y + 102, { familia: FONTE.grotesca, peso: 700, tam: 24, cor: BEGE, alinhar: 'center' });
        }
      });
      ctx.restore();
    }
    function mes(y, t0) {                                             // mês inteiro: as folgas pulam pra fora do mês
      const w = 92, h = 52, x0 = CX - 7 * w / 2, k = ease.saida(seg(t, t0 + 0.5, t0 + 1.6));
      ctx.save(); ctx.globalAlpha = clamp(seg(t, t0, t0 + 0.3) * 3);
      ctx.fillStyle = 'rgba(28,23,20,0.9)'; ctx.fillRect(x0 - 20, y - 70, 7 * w + 40, 5 * h + 100);
      L.texto(ctx, 'SEU MÊS', x0, y - 22, { familia: FONTE.grotesca, peso: 700, tam: 32, cor: AMA });
      for (let s = 0; s < 5; s++) for (let d = 0; d < 7; d++) {
        const folga = d >= 5, x = x0 + d * w, yy = y + s * h;
        ctx.fillStyle = VERM; ctx.fillRect(x + 4, yy + 4, w - 8, h - 8);
        if (folga) { ctx.save(); ctx.globalAlpha *= 1 - k; ctx.fillStyle = '#3E8E3A';
          ctx.fillRect(x + 4 + k * (300 + s * 40), yy + 4 - k * (200 + s * 30), w - 8, h - 8); ctx.restore(); }
      }
      ctx.restore();
      if (k > 0.6) carimbar('NEM NO MESMO MÊS', y + 5 * h + 90, t0 + 1.2, AMA, 64, FONTE.bloco, 14);
    }
    function relogio(cx, cy, r, t0) {
      if (t < t0) return; const giro = (t - t0) * 9;
      ctx.save(); ctx.globalAlpha = clamp(seg(t, t0, t0 + 0.3) * 3);
      ctx.fillStyle = BEGE; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); ctx.strokeStyle = TINTA; ctx.lineWidth = 10; ctx.stroke();
      for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; ctx.fillStyle = TINTA; ctx.fillRect(cx + Math.cos(a) * r * 0.8 - 4, cy + Math.sin(a) * r * 0.8 - 4, 8, 8); }
      ctx.strokeStyle = VERM; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(giro) * r * 0.75, cy + Math.sin(giro) * r * 0.75); ctx.stroke();
      ctx.strokeStyle = TINTA; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(giro / 12) * r * 0.5, cy + Math.sin(giro / 12) * r * 0.5); ctx.stroke();
      ctx.restore();
    }

    // ------------------------------------------------ cenas
    function gancho() {
      sol(CARVAO, 'rgba(138,20,17,0.45)');
      const n = T.quebra;
      carimbar('ENQUANTO A ESQUERDA', 520, 0.3, BEGE, 92, FONTE.manchete, 1);
      carimbar('BRIGA ENTRE SI...', 620, n * 0.18, BEGE, 92, FONTE.manchete, 2);
      carimbar('OS EMPRESÁRIOS TENTAM', 780, n * 0.42, AMA, 74, FONTE.bloco, 3);
      carimbar('TRAZER DE VOLTA A', 870, n * 0.62, AMA, 74, FONTE.bloco, 4);
      carimbar('ESCRAVIDÃO', 1010, n * 0.8, VERM, 150, FONTE.bloco, 5, { erro: '#000' });
      corrente(1220, seg(t, T.quebra, T.quebra + 0.6));
    }
    function explicacao() {
      arquivo = true; L.fundo(ctx, BEGE);
      const parte2 = t >= T.stf, s2 = ease.saida(seg(t, T.stf, T.stf + 0.5));
      titulo(parte2 ? 'MAS ABRIRAM UMA BRECHA' : 'FIM DA ESCALA 6x1', parte2 ? T.stf : VOLTA, parte2 ? VERM : TINTA);
      if (!parte2 || s2 < 1) {
        ctx.save(); ctx.globalAlpha = 1 - s2; ctx.translate(0, -s2 * 200);
        carimbar('GARANTIDO!', 560, T.fim6x1 + 0.6, VERM, 120, FONTE.bloco, 11);
        if (t > T.dezembro - 0.1) {
          const e = ease.carimbo(seg(t, T.dezembro - 0.1, T.dezembro + 0.25));
          ctx.save(); ctx.translate(CX, 820); ctx.scale(e, e); ctx.rotate(-0.03);
          ctx.fillStyle = TINTA; ctx.fillRect(-400 + 10, -150 + 10, 800, 300); ctx.fillStyle = VERM; ctx.fillRect(-400, -150, 800, 300);
          ctx.strokeStyle = BEGE; ctx.lineWidth = 5; ctx.strokeRect(-388, -138, 776, 276);
          L.texto(ctx, '16 DE DEZEMBRO', 0, -30, { familia: FONTE.bloco, peso: 400, tam: tm('16 DE DEZEMBRO', FONTE.bloco, 92, 720), cor: AMA, alinhar: 'center' });
          L.texto(ctx, '42 h · 2 FOLGAS POR SEMANA', 0, 70, { familia: FONTE.grotesca, peso: 700, tam: 48, cor: BEGE, alinhar: 'center' });
          ctx.restore();
        }
        ctx.restore();
      }
      if (parte2) {
        L.etiqueta(ctx, 'LIMINAR DO STF · 12/11', CX, 470, seg(t, T.stf + 0.2, T.stf + 0.5), { cor: TINTA, tam: 34 });
        carimbar('BRECHA', 640, T.brecha, VERM, 170, FONTE.bloco, 12);
        if (t > T.brecha + 0.3) {                                      // rachadura
          ctx.save(); ctx.strokeStyle = TINTA; ctx.lineWidth = 6; ctx.beginPath();
          const p = seg(t, T.brecha + 0.3, T.brecha + 0.8), pts = [[300, 560], [420, 610], [500, 580], [600, 650], [700, 610], [790, 670]];
          pts.slice(0, 1 + Math.floor(p * 5)).forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.restore();
        }
        L.etiqueta(ctx, 'COM ACORDO COLETIVO', CX, 790, seg(t, T.acordo, T.acordo + 0.3), { cor: AMA, corTexto: TINTA, tam: 40 });
        if (t < T.mes - 0.1) semana(1000, T.semana - 1.2, T.semana + 0.1);
        else mes(960, T.mes - 0.1);
        if (t > T.semana + 0.6 && t < T.mes - 0.1) carimbar('FORA DA SEMANA', 1300, T.semana + 0.6, AMA, 64, FONTE.bloco, 13);
      }
    }
    function denuncia() {
      sol(CARVAO, 'rgba(200,32,30,0.35)');
      const p3 = t >= T.ouseja;
      if (!p3) {
        carimbar('A GENTE LUTOU MUITO', 520, T.lutou + 0.1, BEGE, 90, FONTE.manchete, 21);
        carimbar('2 FOLGAS: CONQUISTA!', 640, T.lutou + 1.2, AMA, 80, FONTE.bloco, 22);
        if (t > T.empurrar - 0.1) {
          carimbar('FOLGA EMPURRADA', 820, T.empurrar, VERM, 104, FONTE.bloco, 23, { erro: '#000' });
          // folhas de calendário voando
          for (let k = 0; k < 7; k++) { const p = seg(t, T.empurrar + k * 0.18, T.empurrar + 1.6 + k * 0.18); if (p <= 0 || p >= 1) continue;
            ctx.save(); ctx.translate(lerp(250, 1300, p), 1000 + Math.sin(p * 6 + k) * 60 - k * 18); ctx.rotate(p * 4 + k);
            ctx.fillStyle = BEGE; ctx.fillRect(-55, -65, 110, 130); ctx.fillStyle = '#3E8E3A'; ctx.fillRect(-55, -65, 110, 30);
            L.texto(ctx, 'FOLGA', 0, 30, { familia: FONTE.grotesca, peso: 700, tam: 24, cor: TINTA, alinhar: 'center' }); ctx.restore(); }
        }
        relogio(CX, 1170, 130, T.sabese - 0.3);
        if (t > T.sabese) L.texto(ctx, L.datilografar('pra sabe-se lá quando...', seg(t, T.sabese, T.sabese + 1.0)), CX, 1360, { familia: FONTE.serifa, estilo: 'italic', peso: 400, tam: 56, cor: BEGE, alinhar: 'center' });
      } else {
        carimbar('OU SEJA:', 520, T.ouseja, BEGE, 90, FONTE.manchete, 24);
        faixa('VOCÊ TRABALHA COMO O PATRÃO QUER', 700, T.ouseja + 0.6, VERM, BEGE, 50, 25);
        faixa('E DESCANSA QUANDO ELE DEIXAR', 860, T.descansa, AMA, TINTA, 54, 26);
        // o patrão segurando o calendário das folgas
        if (t > T.descansa + 0.3) {
          const e = ease.saida(seg(t, T.descansa + 0.3, T.descansa + 0.8));
          ctx.save(); ctx.globalAlpha = e; ctx.translate(CX, 1380);
          ctx.fillStyle = TINTA; ctx.fillRect(-70, -260, 140, 190); ctx.fillStyle = VERM; ctx.fillRect(-10, -250, 20, 120);   // terno + gravata
          ctx.fillStyle = '#E0B48A'; ctx.beginPath(); ctx.arc(0, -300, 50, 0, 7); ctx.fill();
          ctx.fillStyle = TINTA; ctx.fillRect(-60, -360, 120, 16); ctx.fillRect(-40, -440, 80, 84);                             // cartola
          ctx.fillRect(-60, -70, 40, 70); ctx.fillRect(20, -70, 40, 70);
          ctx.save(); ctx.translate(140, -230); ctx.rotate(0.15 + Math.sin(t * 3) * 0.05);                                       // calendário na mão
          ctx.fillStyle = BEGE; ctx.fillRect(-60, -70, 120, 140); ctx.fillStyle = '#3E8E3A'; ctx.fillRect(-60, -70, 120, 34);
          L.texto(ctx, 'FOLGA?', 0, 30, { familia: FONTE.grotesca, peso: 700, tam: 30, cor: TINTA, alinhar: 'center' }); ctx.restore();
          ctx.restore();
          L.etiqueta(ctx, 'O PATRÃO', CX - 220, 1150, seg(t, T.descansa + 0.6, T.descansa + 0.9), { cor: VERM, tam: 34 });
        }
      }
    }
    function chamada() {
      arquivo = true; L.fundo(ctx, BEGE); L.raios(ctx, CX, 1500, 2600, 22, -0.25, 'rgba(200,32,30,0.06)');
      titulo('O QUE FAZER AGORA', T.camara);
      const final = t >= T.compartilhe;
      if (!final) {
        L.etiqueta(ctx, 'CÂMARA', CX - 190, 540, seg(t, T.camara + 0.2, T.camara + 0.5), { cor: TINTA, tam: 44 });
        L.etiqueta(ctx, 'SENADO', CX + 190, 540, seg(t, T.camara + 0.6, T.camara + 0.9), { cor: TINTA, tam: 44 });
        if (t > T.camara + 1.6) { ctx.fillStyle = VERM; ctx.beginPath(); ctx.moveTo(CX - 40, 620); ctx.lineTo(CX + 40, 620); ctx.lineTo(CX, 680); ctx.fill(); }
        carimbar('STF: DERRUBA A BRECHA!', 790, T.camara + 1.6, VERM, 84, FONTE.bloco, 31);
        L.etiqueta(ctx, 'JULGAMENTO NO PLENÁRIO · SEM DATA', CX, 960, seg(t, T.julgamento, T.julgamento + 0.3), { cor: AMA, corTexto: TINTA, tam: 34 });
      } else {
        const e = ease.carimbo(seg(t, T.compartilhe, T.compartilhe + 0.35));
        ctx.save(); ctx.translate(CX, 640); ctx.scale(e, e); ctx.rotate(-0.03);
        ctx.fillStyle = TINTA; ctx.fillRect(-420 + 10, -130 + 10, 840, 260); ctx.fillStyle = AMA; ctx.fillRect(-420, -130, 840, 260);
        ctx.strokeStyle = TINTA; ctx.lineWidth = 5; ctx.strokeRect(-408, -118, 816, 236);
        ctx.save(); ctx.translate(-320, 0); ctx.rotate(-0.35); const pul = 1 + 0.08 * Math.sin(t * 9); ctx.scale(pul, pul);
        ctx.fillStyle = VERM; ctx.beginPath(); ctx.moveTo(-55, -10); ctx.lineTo(65, -45); ctx.lineTo(10, 55); ctx.lineTo(0, 10); ctx.closePath(); ctx.fill(); ctx.restore();
        L.texto(ctx, 'COMPARTILHA', 60, -20, { familia: FONTE.bloco, peso: 400, tam: 64, cor: TINTA, alinhar: 'center' });
        L.texto(ctx, 'E MARCA SEU SINDICATO', 60, 60, { familia: FONTE.bloco, peso: 400, tam: 44, cor: VERM, alinhar: 'center' });
        ctx.restore();
        carimbar('FOLGA É TODA SEMANA!', 1000, T.folgatoda, VERM, 96, FONTE.bloco, 32);
        if (t > T.folgatoda + 1.2) carimbar('NÃO QUANDO O PATRÃO QUISER', 1130, T.folgatoda + 1.2, TINTA, 64, FONTE.manchete, 33, { erro: VERM });
      }
    }
    function final() {
      L.fundo(ctx, BEGE); L.raios(ctx, CX, 1100, 2600, 22, -0.25, 'rgba(200,32,30,0.07)');
      const im = L.img.leo, w = 520, h = w * im.height / im.width;
      L.aplicarCarimbo(ctx, seg(t, T.logo, T.logo + 0.3), CX, 880, () => ctx.drawImage(im, CX - w / 2, 880 - h / 2, w, h), 41);
    }
    function logo() {                                                   // logo Léo Duarte, pequena, no alto à esquerda (fora da área do Reels)
      const im = L.img.leo, w = 120, h = w * im.height / im.width;
      ctx.save(); ctx.globalAlpha = 0.95; ctx.drawImage(im, 70, 200, w, h); ctx.restore();
    }
    // legenda (padrão da casa: tarja escura, filete vermelho, bege; palavras-chave em amarelo)
    function legenda() {
      const LEG = (window.TEMPOS || {}).legendas || [], l = LEG.find(l => t >= l.t0 - 0.05 && t < l.t1);
      if (!l) return;
      const CH = /^(esquerda|empresários|escravidão|6x1|16|folgas|stf|brecha|acordo|coletivo|semana|mês|lutou|patrão|empurrar|câmara|senado|plenário|compartilhe|sindicato|folga)/i;
      const T0 = 46, pal = l.p.map(([w, t0]) => [w, t0 - 0.08]); L.fonte(ctx, FONTE.serifa, T0, 400, 'italic');
      const esp = T0 * 0.28, larg = pal.map(([w]) => ctx.measureText(w).width), tot = larg.reduce((a, b) => a + b, 0) + esp * (pal.length - 1);
      const tam = Math.min(T0, T0 * 820 / tot), k = tam / T0, Wl = tot * k, x0 = CX - Wl / 2, Y = 1466;
      ctx.save(); ctx.globalAlpha = clamp((l.t1 - t) / 0.15) * clamp((t - l.t0 + 0.05) / 0.12);
      ctx.fillStyle = 'rgba(15,12,11,0.88)'; ctx.fillRect(x0 - 24, Y, Wl + 48, 76); ctx.fillStyle = VERM; ctx.fillRect(x0 - 24, Y, 7, 76);
      let x = x0;
      pal.forEach(([w, t0], i) => {
        const a = seg(t, t0, t0 + 0.2);
        if (a > 0) { ctx.save(); ctx.globalAlpha *= a; L.texto(ctx, w, x, Y + 51 + (1 - ease.saida(a)) * 8, { familia: FONTE.serifa, estilo: 'italic', peso: 400, tam, cor: CH.test(w) ? AMA : BEGE }); ctx.restore(); }
        x += (larg[i] + esp) * k;
      });
      ctx.restore();
    }
  },
};
