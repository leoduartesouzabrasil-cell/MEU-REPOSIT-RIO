// "DESMISTIFICANDO O COMUNISMO" · EP. 2: O que é o socialismo? Roteiro: roteiros/comunismo-02-socialismo.md
// Mesma base do EP. 1 (motor/cenas/comunismo-01.js): registros ARQUIVO/CARTAZ, vinheta da série, padaria 2D, legenda padrão.
// Ordem: gancho (nenhum país chegou ao comunismo; "União das Repúblicas SOCIALISTAS Soviéticas") → vinheta → a escada
// capitalismo → socialismo → comunismo + Lênin → a padaria no socialismo (forno de todos, pão pro bairro, a cada um segundo
// o trabalho) → o último degrau (Marx, 1875) + URSS/Cuba/Vietnã no degrau do socialismo → próximo episódio (mais-valia) → logo.
// PRÉVIA sem narração; com a narração, T vem de comunismo-02.tempos.js.
//
// DIAGRAMAÇÃO PADRÃO: título y 330 · fonte dos dados y 384 · conteúdo x 120–960, y 420–1420 · legenda (tarja) y 1466–1542
const T = Object.assign({
  nenhum: 0.3, urss: 2.4, sel: 4.8, vin: 6.6, escada: 10.1, sobe: 13.0, lenin: 15.6,
  padaria: 21.0, todos: 22.0, bairro: 24.0, trabalho: 26.6, topo: 29.4, fartura: 31.2, marx: 32.6, paises: 36.0,
  proximo: 39.6, logo: 43.2, dur: 46.8,
}, (window.TEMPOS || {}).marcas || {});

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: T.dur,
  imagens: {
    lenin: '../midia/comunismo-02/lenin-1920.jpg',         // Pavel Zhukov, 1920 (domínio público)
    logoBege: '../identidade/marca/o-camarada-bege.png',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease, clamp } = L;
    const CX = 540, LARG = 840, X0 = 120, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta, AZUL = COR.azul;
    let arquivo = true;
    const PADEIRO = { roupa: BEGE, pele: '#5E3B26', tipo: 'avental', chapeu: 'padeiro' };
    const POVO = [{ roupa: AZUL, pele: '#8A5A3A', chapeu: 'bone' }, { roupa: VERM, pele: '#E0B48A' }, { roupa: '#6B5A48', pele: '#5E3B26', chapeu: 'bone' },
      { roupa: AZUL, pele: '#C68E5E' }, { roupa: VERM, pele: '#8A5A3A', chapeu: 'bone' }];

    const ordem = [[0, gancho], [T.vin, vinheta], [T.escada, escada], [T.padaria, padaria], [T.topo, comunismo], [T.proximo, proximo], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [T.nenhum, T.sel, T.sobe, T.todos, T.trabalho, T.topo + 0.8, T.paises, T.proximo + 0.1, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 10);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();

    [[T.vin, VERM, 24], [T.escada, BEGE, -24], [T.padaria, BEGE, 24], [T.topo, BEGE, -24], [T.proximo, VERM, 24], [T.logo, BEGE, -24]]
      .forEach(([X, cor, ang]) => L.corteDiagonal(ctx, seg(t, X - 0.4, X), cor, ang));
    if (arquivo) L.varredura(ctx, t, 0.07);
    IMP.forEach(X => L.flash(ctx, t, X, AMA, 0.25, 0.22));
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);
    legenda();

    // ------------------------------------------------ componentes padronizados
    function legenda() {
      const LEG = (window.TEMPOS || {}).legendas;
      const l = LEG && LEG.find(l => t >= l.t0 - 0.05 && t < l.t1);
      if (!l) return;
      const pal = l.p.map(([w, t0]) => [w, t0 - 0.08]), largura = tam => {
        L.fonte(ctx, FONTE.serifa, tam, 400, 'italic');
        return pal.reduce((s, [p]) => s + ctx.measureText(p).width, 0) + tam * 0.28 * (pal.length - 1);
      };
      const tam = Math.min(48, 48 * 760 / largura(48)), w = largura(tam);
      ctx.save(); ctx.globalAlpha = clamp((l.t1 - t) / 0.15) * clamp((t - l.t0 + 0.05) / 0.12);
      ctx.fillStyle = 'rgba(15,12,11,0.86)'; ctx.fillRect(CX - w / 2 - 26, 1466, w + 52, 76);
      ctx.fillStyle = VERM; ctx.fillRect(CX - w / 2 - 26, 1466, 7, 76);
      L.palavras(ctx, pal, t, CX, 1517, { tam, cor: BEGE, espaco: 0.28, rgb: 0 });
      ctx.restore();
    }
    function tamMax(txt, familia, tam, peso = 700, larg = LARG) { return Math.min(tam, L.ajustar(ctx, txt, familia, larg, peso)); }
    function titulo(txt, p, cor = TINTA) {
      L.texto(ctx, L.datilografar(txt, p), CX, 330, { familia: FONTE.grotesca, peso: 700, tam: tamMax(txt, FONTE.grotesca, 48), cor, alinhar: 'center', rgb: 1.5 });
    }
    function cred(txt, p, cor = TINTA, y = 384) {
      if (p <= 0) return;
      L.texto(ctx, L.datilografar(txt, p * 2), CX, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(txt, FONTE.maquina, 22, 400), cor, alinhar: 'center' });
    }
    function carimbar(txt, y, t0, cor, tam, familia = FONTE.bloco, seed = 1, o = {}) {
      const peso = familia === FONTE.manchete ? 900 : 400;
      L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), CX, y, () =>
        L.texto(ctx, txt, CX, y, { familia, peso, tam: tamMax(txt, familia, tam, peso, o.larg || LARG), cor, alinhar: 'center', ...o }), seed);
    }
    function faixa(txt, y, t0, fundoCor = TINTA, cor = BEGE, tam = 56, seed = 9) {
      L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), CX, y, () => {
        ctx.fillStyle = fundoCor; ctx.fillRect(X0, y - 60, LARG, 120);
        L.texto(ctx, txt, CX, y + tam * 0.36, { familia: FONTE.bloco, peso: 400, tam: tamMax(txt, FONTE.bloco, tam, 400, 780), cor, alinhar: 'center' });
      }, seed);
    }

    // ------------------------------------------------ boneco de cartaz (pés em x, y); p = {roupa, pele, tipo, calca, chapeu}
    function pessoa(x, y, p, esc = 1, passo = 0) {
      ctx.save(); ctx.translate(x, y); ctx.scale(esc, esc);
      const sw = Math.sin(passo * Math.PI) * 12, quica = Math.abs(Math.sin(passo * Math.PI)) * 6;
      ctx.translate(0, -quica); ctx.lineWidth = 4; ctx.strokeStyle = TINTA; ctx.lineJoin = 'round';
      ctx.fillStyle = p.calca || TINTA; ctx.fillRect(-22 + sw, -72, 18, 72); ctx.fillRect(4 - sw, -72, 18, 72);
      ctx.fillStyle = p.roupa;
      ctx.beginPath(); ctx.moveTo(-36, -150); ctx.lineTo(36, -150); ctx.lineTo(46, -66); ctx.lineTo(-46, -66); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillRect(-56, -146, 18, 72); ctx.strokeRect(-56, -146, 18, 72); ctx.fillRect(38, -146, 18, 72); ctx.strokeRect(38, -146, 18, 72);
      ctx.fillStyle = p.pele || '#C68E5E'; ctx.beginPath(); ctx.arc(-47, -68, 9, 0, 7); ctx.arc(47, -68, 9, 0, 7); ctx.fill();
      if (p.tipo === 'terno') {
        ctx.fillStyle = BEGE; ctx.beginPath(); ctx.moveTo(-14, -150); ctx.lineTo(0, -118); ctx.lineTo(14, -150); ctx.fill();
        ctx.fillStyle = VERM; ctx.fillRect(-5, -142, 10, 50);
      }
      if (p.tipo === 'avental') { ctx.fillStyle = BEGE; ctx.fillRect(-28, -130, 56, 70); ctx.strokeRect(-28, -130, 56, 70); }
      ctx.fillStyle = p.pele || '#C68E5E'; ctx.beginPath(); ctx.arc(0, -184, 30, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(0, -190, 31, Math.PI, 0); ctx.fill();
      ctx.fillRect(-12, -186, 6, 6); ctx.fillRect(6, -186, 6, 6);
      if (p.chapeu === 'cartola') { ctx.fillStyle = TINTA; ctx.fillRect(-40, -214, 80, 10); ctx.fillRect(-26, -268, 52, 56); ctx.fillStyle = VERM; ctx.fillRect(-26, -226, 52, 10); }
      if (p.chapeu === 'padeiro') {
        ctx.fillStyle = '#F7EEDC'; ctx.beginPath(); ctx.arc(-16, -236, 20, 0, 7); ctx.arc(16, -236, 20, 0, 7); ctx.arc(0, -248, 22, 0, 7); ctx.fill(); ctx.stroke();
        ctx.fillRect(-28, -222, 56, 14); ctx.strokeRect(-28, -222, 56, 14);
      }
      if (p.chapeu === 'bone') { ctx.fillStyle = TINTA; ctx.fillRect(-31, -216, 62, 22); ctx.fillRect(0, -198, 46, 8); }
      ctx.restore();
    }

    function pao(x, y) {
      ctx.fillStyle = '#B9802F'; ctx.beginPath(); ctx.ellipse(x, y, 22, 14, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = TINTA; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.strokeStyle = '#F2D99A'; ctx.beginPath(); ctx.moveTo(x - 8, y - 6); ctx.lineTo(x - 2, y + 4); ctx.moveTo(x + 4, y - 6); ctx.lineTo(x + 10, y + 4); ctx.stroke();
    }
    function moeda(x, y) {
      ctx.fillStyle = AMA; ctx.beginPath(); ctx.arc(x, y, 26, 0, 7); ctx.fill(); ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.stroke();
      L.texto(ctx, '$', x, y + 11, { familia: FONTE.bloco, peso: 400, tam: 30, cor: TINTA, alinhar: 'center' });
    }
    function icCasa(x, y) { ctx.fillStyle = BEGE; ctx.fillRect(x - 30, y - 10, 60, 44); ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.strokeRect(x - 30, y - 10, 60, 44); ctx.fillStyle = VERM; ctx.beginPath(); ctx.moveTo(x - 40, y - 8); ctx.lineTo(x, y - 40); ctx.lineTo(x + 40, y - 8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = TINTA; ctx.fillRect(x - 8, y + 10, 16, 24); }

    // ------------------------------------------------ 0. o gancho (CARTAZ): nenhum país chegou ao comunismo
    function gancho(lt) {
      arquivo = false;
      L.fundo(ctx, VERM);
      L.raios(ctx, CX, 1560, 2600, 20, -0.3 + L.emDois(t) * 0.05, 'rgba(237,224,196,0.13)');
      ctx.fillStyle = COR.vermelhoEscuro; ctx.beginPath(); ctx.arc(CX, 1560, 330, Math.PI, 0); ctx.fill();
      carimbar('NENHUM PAÍS', 520, T.nenhum, BEGE, 150, FONTE.manchete, 1, { erro: COR.vermelhoEscuro, desloc: 6 });
      carimbar('CHEGOU AO', 660, T.nenhum + 0.3, BEGE, 110, FONTE.bloco, 2);
      carimbar('COMUNISMO', 820, T.nenhum + 0.6, AMA, 210, FONTE.manchete, 3, { erro: TINTA, desloc: 8 });
      if (t >= T.urss) {
        const e = ease.saida(seg(t, T.urss, T.urss + 0.4));
        ctx.save(); ctx.translate(0, (1 - e) * 600);
        ctx.fillStyle = 'rgba(28,23,20,0.35)'; ctx.fillRect(X0 + 12, 982, LARG, 330);
        ctx.fillStyle = BEGE; ctx.fillRect(X0, 970, LARG, 330);
        L.texto(ctx, 'O NOME OFICIAL DA URSS:', X0 + 40, 1040, { familia: FONTE.sub, peso: 600, tam: 38, cor: VERM, tracking: 3 });
        const linhas = [['União das Repúblicas', 1120], ['Socialistas Soviéticas', 1200]];
        linhas.forEach(([s, y], i) => L.texto(ctx, L.datilografar(s, seg(t, T.urss + 0.4 + i * 0.7, T.urss + 1.1 + i * 0.7)), X0 + 40, y,
          { familia: FONTE.maquina, peso: 400, tam: 56, cor: TINTA }));
        L.fonte(ctx, FONTE.maquina, 56, 400); const w = ctx.measureText('Socialistas').width;
        L.selecao(ctx, X0 + 36, 1150, w + 8, 66, seg(t, T.sel, T.sel + 0.5), VERM);
        ctx.restore();
      }
    }

    // ------------------------------------------------ A. vinheta da série (3,5 s, música própria)
    function vinheta(lt) { arquivo = false; L.vinhetaComunismo(ctx, lt, { ep: 'EP. 2 · O QUE É O SOCIALISMO?', logo: L.img.logoBege }); }

    // ------------------------------------------------ escada de três degraus (usada em B e D)
    // passo = posição do boneco: 0 chão do capitalismo, 1 socialismo, 2 comunismo (fracionário durante a subida)
    function desenharEscada(passo, o = {}) {
      const DEG = [['CAPITALISMO', AZUL, BEGE], ['SOCIALISMO', VERM, BEGE], ['COMUNISMO', AMA, TINTA]];
      const base = 1330, alt = 150, larg = 280;
      DEG.forEach(([nome, cor, corT], i) => {
        const x = X0 + i * larg, topo = base - (i + 1) * alt, h = (i + 1) * alt, q = ease.saida(seg(t, (o.t0 || 0) + i * 0.3, (o.t0 || 0) + 0.4 + i * 0.3));
        if (q <= 0) return;
        ctx.save(); ctx.globalAlpha = q;
        ctx.fillStyle = TINTA; ctx.fillRect(x + 8, topo + 8, larg, h);
        ctx.fillStyle = cor; ctx.fillRect(x, topo, larg, h);
        ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.strokeRect(x, topo, larg, h);
        L.texto(ctx, nome, x + larg / 2, topo + 56, { familia: FONTE.bloco, peso: 400, tam: tamMax(nome, FONTE.bloco, 40, 400, larg - 30), cor: corT, alinhar: 'center' });
        ctx.restore();
      });
      // o boneco (a classe trabalhadora) subindo
      const p = clamp(passo, 0, 2), i0 = Math.floor(Math.min(p, 1.999)), f = p - i0;
      const xa = X0 + i0 * larg + larg / 2, xb = X0 + (i0 + 1) * larg + larg / 2, ya = base - (i0 + 1) * alt, yb = base - (i0 + 2) * alt;
      const x = f > 0 ? lerp(xa, xb, f) : xa, y = f > 0 ? lerp(ya, yb, f) - Math.sin(f * Math.PI) * 90 : ya;
      if (o.boneco !== false) pessoa(x, y, { roupa: VERM, pele: '#8A5A3A', chapeu: 'bone' }, 0.85, f > 0 && f < 1 ? f * 6 : 0);
      return { base, alt, larg };
    }

    // ------------------------------------------------ B. a escada + Lênin (ARQUIVO)
    function escada(lt) {
      L.fundo(ctx, BEGE);
      titulo(t < T.lenin ? 'UMA ESCADA DE TRÊS DEGRAUS' : 'QUEM DEU O NOME: LÊNIN', t < T.lenin ? seg(lt, 0.1, 0.7) : seg(t, T.lenin, T.lenin + 0.6));
      cred(t < T.lenin ? 'do capitalismo ao comunismo' : 'O Estado e a Revolução, 1917', t < T.lenin ? seg(lt, 0.3, 0.9) : seg(t, T.lenin + 0.2, T.lenin + 0.8));
      if (t < T.lenin + 0.4) {
        const sai = ease.entrada(seg(t, T.lenin, T.lenin + 0.4));
        ctx.save(); ctx.translate(-sai * 1200, 0);
        desenharEscada(ease.saida(seg(t, T.sobe, T.sobe + 1.0)), { t0: T.escada + 0.2 });
        if (t >= T.sobe + 1.0) L.etiqueta(ctx, 'NO MEIO DO CAMINHO', X0 + 420, 760, seg(t, T.sobe + 1.0, T.sobe + 1.3), { cor: VERM, tam: 40 });
        ctx.restore();
      }
      if (t >= T.lenin) {
        const e = ease.saida(seg(t, T.lenin, T.lenin + 0.5));
        ctx.save(); ctx.globalAlpha = e;
        const x = 340, y = 450, w = 400, h = 540;
        L.moldura(ctx, x, y, w, h, 24);
        L.foto(ctx, L.img.lenin, x, y, w, h, { pb: true, zoom: 1.15, dy: 30, desfoque: (1 - seg(t, T.lenin, T.lenin + 0.6)) * 8 });
        L.texto(ctx, 'Lênin, 1920 · foto de Pavel Zhukov, domínio público', CX, y + h + 66, { familia: FONTE.maquina, peso: 400, tam: 22, cor: TINTA, alinhar: 'center' });
        ctx.restore();
        if (t >= T.lenin + 0.8) {
          const q = ease.saida(seg(t, T.lenin + 0.8, T.lenin + 1.2));
          ctx.save(); ctx.translate(0, (1 - q) * 500);
          ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(X0 + 12, 1122, LARG, 300);
          ctx.fillStyle = COR.begeEscuro; ctx.fillRect(X0, 1110, LARG, 300);
          ['“Aquilo a que se chama habitualmente', 'socialismo, chamou Marx a «primeira»', 'fase… da sociedade comunista.”'].forEach((s, i) =>
            L.texto(ctx, L.datilografar(s, seg(t, T.lenin + 1.2 + i * 0.5, T.lenin + 1.7 + i * 0.5)), X0 + 36, 1180 + i * 62, { familia: FONTE.maquina, peso: 400, tam: 40, cor: TINTA }));
          L.selecao(ctx, X0 + 32, 1196, 250, 56, seg(t, T.lenin + 2.8, T.lenin + 3.2), VERM);
          ctx.restore();
        }
      }
    }

    // ------------------------------------------------ C. a padaria no socialismo (2D, exemplo)
    function padaria(lt) {
      L.fundo(ctx, BEGE);
      titulo('A PADARIA NO SOCIALISMO', seg(lt, 0.1, 0.6));
      cred('exemplo', seg(lt, 0.3, 0.9));
      // forno com a placa que troca de DONO para DE TODOS
      ctx.fillStyle = '#6B4A2E'; ctx.fillRect(150, 640, 340, 380); ctx.strokeStyle = TINTA; ctx.lineWidth = 5; ctx.strokeRect(150, 640, 340, 380);
      ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(320, 860, 110, Math.PI, 0); ctx.lineTo(430, 960); ctx.lineTo(210, 960); ctx.fill();
      ctx.fillStyle = `rgba(235,181,42,${0.6 + 0.4 * Math.sin(lt * 9)})`; ctx.beginPath(); ctx.arc(320, 900, 70, Math.PI, 0); ctx.fill();
      ctx.fillStyle = VERM; ctx.beginPath(); ctx.arc(320, 930, 40, Math.PI, 0); ctx.fill();
      ctx.fillStyle = TINTA; ctx.fillRect(280, 540, 80, 100);
      const troca = seg(t, T.todos, T.todos + 0.4);
      ctx.save(); ctx.translate(320, 600); ctx.scale(1, Math.abs(Math.cos(troca * Math.PI)));
      const deTodos = troca >= 0.5, placa = deTodos ? 'DE TODOS' : 'DONO';
      ctx.fillStyle = deTodos ? VERM : AZUL; ctx.fillRect(-150, -40, 300, 80); ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.strokeRect(-150, -40, 300, 80);
      L.texto(ctx, placa, 0, 18, { familia: FONTE.bloco, peso: 400, tam: 46, cor: BEGE, alinhar: 'center' });
      ctx.restore();
      // três padeiros
      [560, 700, 840].forEach((x, i) => pessoa(x, 1300, { ...PADEIRO, pele: ['#5E3B26', '#E0B48A', '#8A5A3A'][i] }, 1.0));
      // o bairro: casinhas que recebem os pães
      [[640, 560], [780, 520], [920, 560]].forEach(([x, y]) => icCasa(x, y));
      if (t >= T.bairro) {
        for (let k = 0; k < 9; k++) {
          const t0 = T.bairro + k * 0.18, q = seg(t, t0, t0 + 0.7), alvo = [[640, 600], [780, 560], [920, 600]][k % 3];
          if (q <= 0) continue;
          const x = lerp(430, alvo[0], q), y = lerp(880, alvo[1], q) - Math.sin(q * Math.PI) * 220;
          if (q < 1) pao(x, y);
        }
        L.etiqueta(ctx, 'PÃO PARA O BAIRRO, NÃO PARA O LUCRO', CX, 462, seg(t, T.bairro + 1.4, T.bairro + 1.7), { cor: TINTA, tam: 34 });
      }
      if (t >= T.trabalho) {
        [560, 700, 840].forEach((x, i) => { const q = ease.saida(seg(t, T.trabalho + i * 0.2, T.trabalho + 0.5 + i * 0.2)); if (q > 0) { pao(x - 40, lerp(1000, 1120, q)); moeda(x + 40, lerp(1000, 1120, q)); } });
        L.aplicarCarimbo(ctx, seg(t, T.trabalho + 0.8, T.trabalho + 1.1), CX, 1390, () => {
          ctx.fillStyle = VERM; ctx.fillRect(X0, 1340, LARG, 100);
          L.texto(ctx, 'A CADA UM, SEGUNDO O SEU TRABALHO', CX, 1406, { familia: FONTE.bloco, peso: 400, tam: tamMax('A CADA UM, SEGUNDO O SEU TRABALHO', FONTE.bloco, 46, 400, 800), cor: BEGE, alinhar: 'center' });
        }, 41);
      }
    }

    // ------------------------------------------------ D. o último degrau: comunismo (Marx, 1875) + URSS/Cuba/Vietnã no socialismo
    function comunismo(lt) {
      L.fundo(ctx, BEGE);
      titulo(t < T.paises ? 'E O COMUNISMO?' : 'TUDO O QUE EXISTIU ATÉ HOJE', t < T.paises ? seg(lt, 0.1, 0.6) : seg(t, T.paises, T.paises + 0.6));
      cred(t < T.paises ? 'Marx, Crítica do Programa de Gotha (1875)' : 'experiências socialistas: o caminho, não a chegada', t < T.paises ? seg(lt, 0.3, 0.9) : seg(t, T.paises + 0.2, T.paises + 0.8));
      const g = desenharEscada(1 + ease.saida(seg(t, T.topo + 0.2, T.topo + 1.0)), { t0: T.topo - 1 });
      // fartura no topo: pães em volta do boneco
      if (t >= T.fartura) for (let k = 0; k < 10; k++) { const q = ease.saida(seg(t, T.fartura + k * 0.05, T.fartura + 0.3 + k * 0.05)); if (q > 0) pao(X0 + 2 * 280 + 40 + (k % 5) * 50, 880 - Math.floor(k / 5) * 26 - (1 - q) * 80); }
      if (t >= T.marx && t < T.paises) {
        const q = ease.saida(seg(t, T.marx, T.marx + 0.4));
        ctx.save(); ctx.globalAlpha = q;
        ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(X0 + 12, 482, LARG, 230);
        ctx.fillStyle = COR.begeEscuro; ctx.fillRect(X0, 470, LARG, 230);
        ['“De cada um segundo as suas capacidades,', 'a cada um segundo as suas necessidades!”'].forEach((s, i) =>
          L.texto(ctx, s, CX, 560 + i * 62, { familia: FONTE.serifa, estilo: 'italic', peso: 400, tam: 46, cor: TINTA, alinhar: 'center' }));
        L.texto(ctx, 'Marx, 1875', CX, 680, { familia: FONTE.maquina, peso: 400, tam: 24, cor: TINTA, alinhar: 'center' });
        ctx.restore();
      }
      if (t >= T.paises) [['URSS', 'até 1991'], ['CUBA', ''], ['VIETNÃ', '']].forEach(([s, sub], i) => {
        const q = seg(t, T.paises + 0.4 + i * 0.3, T.paises + 0.7 + i * 0.3);
        L.etiqueta(ctx, s, X0 + 420, 540 + i * 90, q, { cor: VERM, tam: 44 });
      });
      if (t >= T.paises + 1.6) L.aplicarCarimbo(ctx, seg(t, T.paises + 1.6, T.paises + 1.9), X0 + 420, 900, () => {
        ctx.save(); ctx.translate(X0 + 420, 900); ctx.rotate(-0.05);
        ctx.strokeStyle = VERM; ctx.lineWidth = 8; ctx.strokeRect(-200, -48, 400, 96);
        L.texto(ctx, 'SOCIALISMO', 0, 18, { familia: FONTE.bloco, peso: 400, tam: 54, cor: VERM, alinhar: 'center' });
        ctx.restore();
      }, 42);
    }


    // ------------------------------------------------ E. próximo episódio (CARTAZ)
    function proximo(lt) {
      arquivo = false;
      L.fundo(ctx, VERM);
      L.raios(ctx, CX, 1560, 2600, 20, -0.3 + L.emDois(t) * 0.05, 'rgba(237,224,196,0.13)');
      ctx.fillStyle = COR.vermelhoEscuro; ctx.beginPath(); ctx.arc(CX, 1560, 330, Math.PI, 0); ctx.fill();
      carimbar('PRÓXIMO EPISÓDIO:', 600, T.proximo + 0.1, BEGE, 70, FONTE.bloco, 51);
      carimbar('O QUE É', 800, T.proximo + 0.4, AMA, 170, FONTE.manchete, 52, { erro: COR.vermelhoEscuro, desloc: 7 });
      carimbar('MAIS-VALIA?', 990, T.proximo + 0.6, AMA, 200, FONTE.manchete, 53, { erro: COR.vermelhoEscuro, desloc: 7 });
      if (t > T.proximo + 1.0) {
        ctx.save(); ctx.globalAlpha = seg(t, T.proximo + 1.0, T.proximo + 1.4);
        L.texto(ctx, 'DESMISTIFICANDO O COMUNISMO · COM LÉO DUARTE', CX, 1140, { familia: FONTE.manchete, peso: 900, tam: 40, cor: BEGE, alinhar: 'center', tracking: 3 });
        ctx.restore();
      }
    }

    // ------------------------------------------------ F. logo e créditos
    function final(lt) {
      L.fundo(ctx, BEGE); arquivo = false;
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 780, () => L.imagem(ctx, L.img.logo, CX, 780, 780), 97);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.6, 1.2);
      [['Foto: Lênin (Pavel Zhukov, 1920) · domínio público', 1110],
        ['Fontes: Marx, Crítica do Programa de Gotha (1875) · Lênin, O Estado e a Revolução (1917)', 1160],
        ['Constituição de Cuba (2019) · nome oficial: República Socialista do Vietnã', 1200],
        ['Padaria: exemplo ilustrativo', 1250]].forEach(([s2, y]) =>
        L.texto(ctx, s2, CX, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(s2, FONTE.maquina, 24, 400), cor: TINTA, alinhar: 'center' }));
      ctx.restore();
    }
  },
};
