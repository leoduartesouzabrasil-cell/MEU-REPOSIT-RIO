// SÉRIE PARA NOVOS MEMBROS · EP. 1: Bem-vindo ao Coletivo Lufã! (HORIZONTAL 1920×1080, narração de Léo Duarte)
// Mesma base de motion graphics do "Desmistificando o Comunismo" (comunismo-01.js): ARQUIVO (bege, molduras douradas, datilografia)
// alternando com CARTAZ (vermelho, sol nascente, carimbos), cortes diagonais, legenda em tarja palavra por palavra.
// Ordem: boas-vindas (CARTAZ) → fundação, 6/11/2026, Léo e Eduarda (ARQUIVO) → marxista e de esquerda radical, sem partido (CARTAZ)
// → por que existimos (ARQUIVO, lista + militantes) → base: marxismo-leninismo, Marx, Lênin, Manifesto (ARQUIVO)
// → esquerda radical: o que NÃO é (CARTAZ) e a raiz × o analgésico (ARQUIVO, árvore 2D) → comunismo popular (ARQUIVO)
// → comunicação popular (CARTAZ) → próximo episódio (CARTAZ) → logo e créditos.
// DIAGRAMAÇÃO (horizontal): título y 120 · fonte y 166 · conteúdo y 210–880 · legenda (tarja) y 938–1014
const T = Object.assign({}, (window.TEMPOS || {}).marcas || {});

window.CENA = {
  w: 1920, h: 1080, fps: 30, dur: (window.TEMPOS || {}).dur || 110,
  imagens: {
    leo: '../midia/tutorial-01/leo-duarte.jpg',            // acervo do Coletivo Lufã (site)
    duda: '../midia/tutorial-01/eduarda-prado.jpg',        // acervo do Coletivo Lufã (site)
    marx: '../midia/tutorial-01/marx.jpg',                 // J. J. E. Mayall, 1875 · Wikimedia Commons, domínio público
    lenin: '../midia/tutorial-01/lenin.jpg',               // Lênin em 1920 · Wikimedia Commons, domínio público
    manifesto: '../midia/tutorial-01/manifesto-1848.png',  // capa da 1ª edição, Londres 1848 · domínio público
    lufa: '../midia/tutorial-01/logo-lufa-empilhado.png',
    lufaLinha: '../midia/tutorial-01/logo-lufa-linha-amarela.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease, clamp } = L;
    const W = 1920, CX = 960, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta, AZUL = COR.azul, VESC = COR.vermelhoEscuro;
    let arquivo = true;

    const ordem = [[0, abre], [T.funda, fundacao], [T.somos, somos], [T.exist, existimos], [T.base, base], [T.radical, radical],
      [T.apenas, raiz], [T.popular, popular], [T.comunica, comunica], [T.proximo, proximo], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [0.35, T.lufa0, T.uniao, T.somos + 0.1, T.radical1, T.formar, T.luta + 0.4, T.radical + 0.1, T.raiz, T.nunca + 0.3,
      T.comunica + 1.3, T.proximo + 0.1, T.chega, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 9);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();

    [[T.funda, BEGE, -24], [T.somos, VERM, 24], [T.exist, BEGE, -24], [T.base, BEGE, 24], [T.radical, VERM, -24], [T.apenas, BEGE, 24],
      [T.popular, BEGE, -24], [T.comunica, VERM, 24], [T.proximo, AMA, -24], [T.logo, VESC, 24]].forEach(([X, cor, ang]) => L.corteDiagonal(ctx, seg(t, X - 0.4, X), cor, ang));
    if (arquivo) L.varredura(ctx, t, 0.07);
    IMP.forEach(X => L.flash(ctx, t, X, AMA, 0.25, 0.2));
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);
    legenda();

    // ------------------------------------------------ componentes padronizados
    function legenda() {
      const LEG = (window.TEMPOS || {}).legendas || [];
      const l = LEG.find(l => t >= l.t0 - 0.05 && t < l.t1);
      if (!l || t >= T.logo) return;
      const pal = l.p.map(([w, t0]) => [w, t0 - 0.08]), largura = tam => {
        L.fonte(ctx, FONTE.serifa, tam, 400, 'italic');
        return pal.reduce((s, [p]) => s + ctx.measureText(p).width, 0) + tam * 0.28 * (pal.length - 1);
      };
      const tam = Math.min(48, 48 * 1300 / largura(48)), w = largura(tam);
      ctx.save(); ctx.globalAlpha = clamp((l.t1 - t) / 0.15) * clamp((t - l.t0 + 0.05) / 0.12);
      ctx.fillStyle = 'rgba(15,12,11,0.86)'; ctx.fillRect(CX - w / 2 - 26, 938, w + 52, 76);
      ctx.fillStyle = VERM; ctx.fillRect(CX - w / 2 - 26, 938, 7, 76);
      L.palavras(ctx, pal, t, CX, 989, { tam, cor: BEGE, espaco: 0.28, rgb: 0 });
      ctx.restore();
    }
    function tamMax(txt, familia, tam, peso = 700, larg = 1500) { return Math.min(tam, L.ajustar(ctx, txt, familia, larg, peso)); }
    // título no CUBO do Coletivo Lufã: igual ao bloco "LUFÃ" do logo (face branca, letra vermelha larga e pesada,
    // relevo chapado à direita e embaixo), mas RETO, sem inclinação. Todo "I" ganha a estrelinha do logo no lugar do pingo.
    function fonteCubo(tam) { L.fonte(ctx, FONTE.grotesca, tam, 900); ctx.fontStretch = 'expanded'; }
    function largCubo(txt, tam) { fonteCubo(tam); const w = [...txt].reduce((s, c) => s + (c === 'I' ? Math.max(ctx.measureText(c).width, tam * 0.5) : ctx.measureText(c).width), 0); ctx.fontStretch = 'normal'; return w; }
    function textoCubo(txt, x, yb, tam, cor) {
      fonteCubo(tam); ctx.fillStyle = cor; ctx.textBaseline = 'alphabetic';
      for (const c of txt) {
        const cw = c === 'I' ? Math.max(ctx.measureText(c).width, tam * 0.5) : ctx.measureText(c).width;
        if (c === 'I') {   // "i" do logo: haste mais baixa que as maiúsculas e a estrela no lugar do pingo
          const hw = tam * 0.18, hh = tam * 0.44, cx = x + cw / 2;   // haste menor, como no logo
          ctx.fillRect(cx - hw / 2, yb - hh, hw, hh);
          L.estrela(ctx, cx, yb - tam * 0.68, tam * 0.22, 0, cor);   // estrela solta, com um respiro acima da haste
        } else ctx.fillText(c, x, yb);
        x += cw;
      }
      ctx.fontStretch = 'normal';
    }
    function titulo(txt, p) {
      if (p <= 0) return;
      let tam = 54; const lw = largCubo(txt, tam); if (lw > 1400) tam *= 1400 / lw;
      const tw = largCubo(txt, tam), w = tw + tam * 1.1, h = tam * 1.6, D = Math.round(h * 0.2), x = CX - w / 2, yb = 60;
      const n = Math.floor(txt.length * clamp(p * 1.6 - 0.2));
      L.aplicarCarimbo(ctx, ease.saida(clamp(p * 2.5)), CX, yb + h / 2, () => {
                ctx.fillStyle = '#C2AE88';                                                           // relevo chapado (como no logo)
        ctx.beginPath(); ctx.moveTo(x + w, yb); ctx.lineTo(x + w + D, yb + D); ctx.lineTo(x + w + D, yb + h + D); ctx.lineTo(x + D, yb + h + D);
        ctx.lineTo(x, yb + h); ctx.lineTo(x + w, yb + h); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, yb, w, h);                               // face
        textoCubo(txt.slice(0, n), x + (w - tw) / 2, yb + h / 2 + tam * 0.37, tam, '#CC2220');
      }, 77);
    }
    function cred(txt, p, cor = TINTA, y = 194, x = CX, alinhar = 'center') {
      if (p <= 0) return;
      L.texto(ctx, L.datilografar(txt, p * 2), x, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(txt, FONTE.maquina, 24, 400), cor, alinhar });
    }
    function carimbar(txt, cx, y, t0, cor, tam, familia = FONTE.bloco, seed = 1, o = {}) {
      const peso = familia === FONTE.manchete ? 900 : familia === FONTE.sub ? 600 : 400;
      L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), cx, y, () =>
        L.texto(ctx, txt, cx, y, { familia, peso, tam: tamMax(txt, familia, tam, peso, o.larg || 1500), cor, alinhar: 'center', ...o }), seed);
    }
    function faixa(txt, cx, y, t0, larg, fundoCor = TINTA, cor = BEGE, tam = 52, seed = 9) {
      L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), cx, y, () => {
        ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(cx - larg / 2 + 10, y - 46, larg, 92);
        ctx.fillStyle = fundoCor; ctx.fillRect(cx - larg / 2, y - 52, larg, 92);
        L.texto(ctx, txt, cx, y + tam * 0.36 - 6, { familia: FONTE.bloco, peso: 400, tam: tamMax(txt, FONTE.bloco, tam, 400, larg - 80), cor, alinhar: 'center' });
      }, seed);
    }
    function ficha(x, y, w, h, faixaCor = VERM) {
      ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(x + 14, y + 14, w, h);
      ctx.fillStyle = '#F2E7CF'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = faixaCor; ctx.fillRect(x, y, w, 14);
    }
    function sol(cy = 1250, cor = 'rgba(237,224,196,0.12)') {
      L.fundo(ctx, VERM);
      L.raios(ctx, CX, cy, 2600, 24, -0.3 + L.emDois(t) * 0.05, cor);
      ctx.fillStyle = VESC; ctx.beginPath(); ctx.arc(CX, cy, 420, Math.PI, 0); ctx.fill();
    }
    function retrato(k, x, y, w, h, t0, nome, o = {}) {
      const e = ease.saida(seg(t, t0, t0 + 0.5));
      if (e <= 0) return;
      ctx.save(); ctx.globalAlpha = clamp(e * 2); ctx.translate(0, (1 - e) * 120);
      L.moldura(ctx, x, y, w, h, o.esp || 30);
      L.foto(ctx, L.img[k], x, y, w, h, { pb: o.pb ?? true, desfoque: (1 - seg(t, t0, t0 + 0.7)) * 9, zoom: lerp(1.0, 1.06, seg(t, t0, t0 + 6)) });
      if (o.estrela) L.estrela(ctx, x + w / 2, y - (o.esp || 30), 30, 0, AMA);
      L.etiqueta(ctx, nome, x + w / 2, y + h + (o.esp || 30) + 40, seg(t, t0 + 0.3, t0 + 0.6), { cor: VERM, tam: o.tamNome || 32 });
      if (o.cargo) L.etiqueta(ctx, o.cargo, x + w / 2, y + h + (o.esp || 30) + 96, seg(t, t0 + 0.6, t0 + 0.9), { cor: TINTA, tam: 22 });
      ctx.restore();
    }
    function check(x, y, p, cor = VERM, s = 1) {
      if (p <= 0) return;
      ctx.save(); ctx.strokeStyle = cor; ctx.lineWidth = 10 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const a = clamp(p * 2), b = clamp(p * 2 - 1);
      ctx.beginPath(); ctx.moveTo(x - 22 * s, y); ctx.lineTo(x - 22 * s + 16 * s * a, y + 18 * s * a);
      if (b > 0) ctx.lineTo(x - 6 * s + 34 * s * b, y + 18 * s - 42 * s * b);
      ctx.stroke(); ctx.restore();
    }
    function xis(x, y, r, p, cor = VERM, lw = 14) {
      if (p <= 0) return;
      ctx.save(); ctx.strokeStyle = cor; ctx.lineWidth = lw; ctx.lineCap = 'round';
      const a = clamp(p * 2), b = clamp(p * 2 - 1);
      ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x - r + 2 * r * a, y - r + 2 * r * a); ctx.stroke();
      if (b > 0) { ctx.beginPath(); ctx.moveTo(x + r, y - r); ctx.lineTo(x + r - 2 * r * b, y - r + 2 * r * b); ctx.stroke(); }
      ctx.restore();
    }

    // ------------------------------------------------ boneco de cartaz (pés em x, y)
    function pessoa(x, y, p, esc = 1, passo = 0) {
      ctx.save(); ctx.translate(x, y); ctx.scale(esc, esc);
      const sw = Math.sin(passo * Math.PI) * 12, quica = Math.abs(Math.sin(passo * Math.PI)) * 6;
      ctx.translate(0, -quica); ctx.lineWidth = 4; ctx.strokeStyle = TINTA; ctx.lineJoin = 'round';
      ctx.fillStyle = p.calca || TINTA; ctx.fillRect(-22 + sw, -72, 18, 72); ctx.fillRect(4 - sw, -72, 18, 72);
      ctx.fillStyle = p.roupa;
      ctx.beginPath(); ctx.moveTo(-36, -150); ctx.lineTo(36, -150); ctx.lineTo(46, -66); ctx.lineTo(-46, -66); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillRect(-56, -146, 18, 72); ctx.strokeRect(-56, -146, 18, 72); ctx.fillRect(38, -146, 18, 72); ctx.strokeRect(38, -146, 18, 72);
      ctx.fillStyle = p.pele || '#C68E5E'; ctx.beginPath(); ctx.arc(-47, -68, 9, 0, 7); ctx.arc(47, -68, 9, 0, 7); ctx.fill();
      ctx.fillStyle = p.pele || '#C68E5E'; ctx.beginPath(); ctx.arc(0, -184, 30, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(0, -190, 31, Math.PI, 0); ctx.fill();
      ctx.fillRect(-12, -186, 6, 6); ctx.fillRect(6, -186, 6, 6);
      if (p.chapeu === 'bone') { ctx.fillStyle = TINTA; ctx.fillRect(-31, -216, 62, 22); ctx.fillRect(0, -198, 46, 8); }
      if (p.chapeu === 'lenco') { ctx.fillStyle = VERM; ctx.beginPath(); ctx.arc(0, -196, 32, Math.PI, 0); ctx.fill(); }
      if (p.bandeira) {
        ctx.fillStyle = TINTA; ctx.fillRect(48, -300, 8, 240);
        L.bandeira(ctx, 56, -298, 110, 70, t, VERM);
        L.estrela(ctx, 92, -262, 14, 0, AMA);
      }
      ctx.restore();
    }

    // ------------------------------------------------ A. boas-vindas (CARTAZ)
    function abre(lt) {
      arquivo = false;
      sol(1300);
      // o logo do coletivo, carimbado, com a foice e o martelo atrás
      L.aplicarCarimbo(ctx, seg(lt, 0.35, 0.65), 520, 500, () => {
        ctx.save(); ctx.globalAlpha = 0.18; L.foiceMartelo(ctx, 520, 500, 330, VESC); ctx.restore();
        L.imagem(ctx, L.img.lufa, 520, 500, 560);
      }, 3);
      carimbar('SÉRIE PARA NOVOS MEMBROS · EP. 1', 1340, 250, 0.95, BEGE, 46, FONTE.sub, 4, { larg: 900, tracking: 4 });
      carimbar('BEM-VINDOS', 1340, 450, T.bv + 0.4, AMA, 190, FONTE.manchete, 5, { larg: 900, erro: VESC, desloc: 7 });
      carimbar('E BEM-VINDAS', 1340, 610, T.bv + 1.2, AMA, 150, FONTE.manchete, 6, { larg: 900, erro: VESC, desloc: 6 });
      faixa('AO COLETIVO LUFÃ!', 1340, 760, T.lufa0, 820, BEGE, VERM, 70, 7);
    }

    // ------------------------------------------------ B. a fundação (ARQUIVO)
    function fundacao(lt) {
      L.fundo(ctx, BEGE);
      titulo('COMO TUDO COMEÇOU', seg(lt, 0.1, 0.6));
      cred('a fundação do Coletivo Lufã', seg(lt, 0.3, 0.9));
      // ficha datilografada com a data
      const e = ease.saida(seg(lt, 0.2, 0.7));
      ctx.save(); ctx.translate((e - 1) * 900, 0);
      ficha(130, 230, 760, 600);
      L.texto(ctx, 'REGISTRO DE FUNDAÇÃO', 180, 300, { familia: FONTE.grotesca, peso: 700, tam: 30, cor: TINTA, tracking: 4 });
      L.texto(ctx, L.datilografar('6 DE NOVEMBRO', seg(t, T.data, T.data + 0.7)), 180, 420, { familia: FONTE.manchete, peso: 900, tam: 110, cor: VERM });
      L.texto(ctx, L.datilografar('DE 2026', seg(t, T.data + 0.6, T.data + 1.0)), 180, 520, { familia: FONTE.manchete, peso: 900, tam: 110, cor: VERM });
      [['após o 2º turno das', 600], ['eleições presidenciais', 650]].forEach(([s, y], i) =>
        L.texto(ctx, L.datilografar(s, seg(t, T.eleicao + i * 0.6, T.eleicao + 0.6 + i * 0.6)), 180, y, { familia: FONTE.maquina, peso: 400, tam: 40, cor: TINTA }));
      L.texto(ctx, L.datilografar('da resistência à', seg(t, T.resist, T.resist + 0.6)), 180, 730, { familia: FONTE.maquina, peso: 400, tam: 40, cor: TINTA });
      L.selecao(ctx, 176, 752, 520, 62, seg(t, T.uniao, T.uniao + 0.4), VERM);
      L.texto(ctx, L.datilografar('UNIÃO COLETIVA', seg(t, T.uniao - 0.3, T.uniao + 0.2)), 180, 800, { familia: FONTE.bloco, peso: 400, tam: 54, cor: VERM });
      ctx.restore();
      // os dois fundadores, em moldura dourada, com estrela
      retrato('leo', 1000, 270, 310, 350, T.leo, 'LÉO DUARTE', { estrela: true });
      retrato('duda', 1440, 270, 310, 350, T.duda, 'EDUARDA PRADO', { estrela: true });
      if (t > T.duda + 0.6) cred('fotos: acervo do Coletivo Lufã', seg(t, T.duda + 0.6, T.duda + 1.2), TINTA, 752, 1375);
      faixa('OS FUNDADORES', 1375, 840, T.uniao + 0.4, 600, VERM, BEGE, 46, 8);
    }

    // ------------------------------------------------ C. marxista e de esquerda radical (CARTAZ)
    function somos(lt) {
      arquivo = false;
      sol(1320);
      L.aplicarCarimbo(ctx, seg(t, T.somos, T.somos + 0.3), 400, 470, () => L.estrela(ctx, 400, 470, 270, 0, AMA), 11);
      L.aplicarCarimbo(ctx, seg(t, T.somos + 0.15, T.somos + 0.45), 400, 480, () => L.foiceMartelo(ctx, 400, 480, 220, VERM), 12);
      carimbar('SOMOS UM COLETIVO', 1240, 240, T.somos + 0.1, BEGE, 70, FONTE.bloco, 13, { larg: 1100 });
      carimbar('MARXISTA', 1240, 450, T.somos + 0.4, AMA, 230, FONTE.manchete, 14, { larg: 1100, erro: VESC, desloc: 9 });
      carimbar('E DE ESQUERDA RADICAL', 1240, 580, T.radical1, BEGE, 96, FONTE.manchete, 15, { larg: 1100, erro: VESC, desloc: 5 });
      faixa('SEM LIGAÇÃO COM PARTIDO POLÍTICO', 1240, 700, T.partido + 0.3, 1100, TINTA, BEGE, 46, 16);
      faixa('COMPROMISSO: O TRABALHADOR BRASILEIRO', 1240, 820, T.trab, 1100, AMA, TINTA, 46, 17);
    }

    // ------------------------------------------------ D. por que existimos (ARQUIVO)
    function existimos(lt) {
      L.fundo(ctx, BEGE);
      titulo('POR QUE EXISTIMOS', seg(lt, 0.1, 0.6));
      cred('os quatro objetivos do coletivo', seg(lt, 0.3, 0.9));
      ficha(130, 230, 1040, 620);
      const itens = [['Disputar ideias', T.ideias], ['Fazer o contraponto à direita e à extrema direita', T.direita],
        ['Enfrentar o capitalismo pela raiz', T.capital], ['Formar novos militantes comunistas', T.formar]];
      itens.forEach(([s, t0], i) => {
        const y = 340 + i * 130, ult = i === 3;
        if (t < t0 - 0.1) return;
        L.texto(ctx, String(i + 1).padStart(2, '0'), 180, y, { familia: FONTE.manchete, peso: 900, tam: 70, cor: VERM });
        if (ult) L.selecao(ctx, 280, y - 52, 820, 70, seg(t, t0 + 0.6, t0 + 1.0), VERM);
        L.texto(ctx, L.datilografar(s, seg(t, t0, t0 + 0.6)), 290, y, { familia: ult ? FONTE.bloco : FONTE.maquina, peso: 400, tam: tamMax(s, FONTE.maquina, ult ? 42 : 40, 400, 800), cor: TINTA });
        ctx.fillStyle = 'rgba(28,23,20,0.25)'; ctx.fillRect(180, y + 34, 940, 2);
      });
      // à direita: o militante com a bandeira; no "formar", chegam novos militantes
      const ROUPAS = [AZUL, VERM, '#6B4A2E', AZUL, TINTA], PELES = ['#8A5A3A', '#5E3B26', '#E0B48A', '#C68E5E', '#8A5A3A'];
      ctx.fillStyle = TINTA; ctx.fillRect(1220, 820, 600, 8);
      pessoa(1520, 818, { roupa: VERM, pele: '#8A5A3A', chapeu: 'lenco', bandeira: true }, 1.25, 0);
      [[1300, 0], [1400, 1], [1640, 2], [1740, 3]].forEach(([x, i]) => {
        const p = seg(t, T.formar + 0.2 + i * 0.25, T.formar + 0.9 + i * 0.25);
        if (p <= 0) return;
        const xi = lerp(x + (x < 1520 ? -260 : 260), x, ease.saida(p));
        pessoa(xi, 818, { roupa: ROUPAS[i], pele: PELES[i], chapeu: i % 2 ? 'bone' : '' }, 0.95, p < 1 ? p * 4 : 0);
      });
      L.etiqueta(ctx, 'NOVOS MILITANTES', 1520, 300, seg(t, T.formar + 1.4, T.formar + 1.7), { cor: VERM, tam: 34 });
    }

    // ------------------------------------------------ E. a base: marxismo-leninismo (ARQUIVO)
    function base(lt) {
      L.fundo(ctx, BEGE);
      titulo('A NOSSA BASE: O MARXISMO-LENINISMO', seg(lt, 0.1, 0.7));
      cred('fotos e imagens de época · domínio público', seg(lt, 0.3, 0.9));
      retrato('marx', 170, 250, 290, 370, T.marx, 'KARL MARX', { tamNome: 30 });
      retrato('lenin', 560, 250, 290, 370, T.lenin, 'LÊNIN', { tamNome: 30 });
      if (t > T.lenin + 0.5) cred('Marx: J. J. E. Mayall, 1875 · Lênin, 1920 · Wikimedia Commons', seg(t, T.lenin + 0.5, T.lenin + 1.1), TINTA, 760, 510);
      // a capa do Manifesto, de 1848
      const tm = T.luta - 1.0;
      if (t >= tm) {
        const e = ease.saida(seg(t, tm, tm + 0.5));
        ctx.save(); ctx.translate(1060, 450 + (1 - e) * 700); ctx.rotate(-0.04);
        ctx.fillStyle = 'rgba(28,23,20,0.35)'; ctx.fillRect(-120 + 12, -190 + 14, 240, 380);
        L.foto(ctx, L.img.manifesto, -120, -190, 240, 380, { pb: false, retic: false });
        ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.strokeRect(-120, -190, 240, 380);
        ctx.restore();
        L.etiqueta(ctx, 'MANIFESTO COMUNISTA · 1848', 1060, 700, seg(t, tm + 0.4, tm + 0.7), { cor: TINTA, tam: 24 });
      }
      // a frase do capítulo I, datilografada, com "luta de classes" selecionado
      if (t >= T.luta - 0.6) {
        ficha(1240, 250, 540, 460, VERM);
        const LINHAS = ['“A história de toda', 'sociedade até hoje', 'é a história da'];
        LINHAS.forEach((s, i) => L.texto(ctx, L.datilografar(s, seg(t, T.luta - 0.6 + i * 0.35, T.luta - 0.25 + i * 0.35)), 1280, 340 + i * 64, { familia: FONTE.maquina, peso: 400, tam: 40, cor: TINTA }));
        L.selecao(ctx, 1276, 506, 470, 82, seg(t, T.luta + 0.4, T.luta + 0.9), VERM);
        L.texto(ctx, L.datilografar('luta de classes.”', seg(t, T.luta + 0.3, T.luta + 0.7)), 1280, 566, { familia: FONTE.bloco, peso: 400, tam: 54, cor: VERM });
        L.texto(ctx, 'Manifesto Comunista, cap. I (1848)', 1280, 660, { familia: FONTE.maquina, peso: 400, tam: 24, cor: TINTA });
      }
      faixa('ENTENDER O PRESENTE E TRANSFORMÁ-LO COM ORGANIZAÇÃO', CX, 840, T.transf, 1640, VERM, BEGE, 46, 21);
    }

    // ------------------------------------------------ F. esquerda radical: o que NÃO é (CARTAZ)
    function radical(lt) {
      arquivo = false;
      sol(1320);
      carimbar('SER DE ESQUERDA RADICAL', CX, 250, T.radical + 0.1, AMA, 130, FONTE.manchete, 31, { larg: 1500, erro: VESC, desloc: 7 });
      carimbar('NÃO É SINÔNIMO DE', CX, 360, T.radical + 1.2, BEGE, 60, FONTE.bloco, 32, { larg: 1000 });
      [['VIOLÊNCIA', 420, T.violencia], ['FALTA DE RESPEITO', CX, T.violencia + 1.0], ['FALTA DE EMPATIA', 1500, T.violencia + 1.6]].forEach(([s, x, t0], i) => {
        L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), x, 560, () => {
          ctx.fillStyle = TINTA; ctx.fillRect(x - 250, 490, 500, 130);
          L.texto(ctx, s, x, 578, { familia: FONTE.bloco, peso: 400, tam: tamMax(s, FONTE.bloco, 54, 400, 440), cor: BEGE, alinhar: 'center' });
        }, 33 + i);
        xis(x, 555, 95, seg(t, t0 + 0.35, t0 + 0.65), AMA, 16);
      });
    }

    // ------------------------------------------------ G. a raiz × o analgésico (ARQUIVO, explicação 2D)
    function raiz(lt) {
      L.fundo(ctx, BEGE);
      titulo('RADICAL VEM DE RAIZ', seg(lt, 0.1, 0.6));
      cred('do latim "radix": ir à causa dos problemas', seg(lt, 0.3, 0.9));
      // árvore: copa com os problemas, raízes = a causa
      const AX = 620, CHAO = 640;
      ctx.fillStyle = '#6B4A2E'; ctx.fillRect(130, CHAO, 980, 230); // terra
      ctx.fillStyle = 'rgba(28,23,20,0.2)'; for (let i = 0; i < 40; i++) ctx.fillRect(140 + (i * 97) % 960, CHAO + 20 + (i * 53) % 200, 10, 4);
      ctx.fillStyle = TINTA; ctx.fillRect(130, CHAO - 4, 980, 8);
      // raízes que crescem
      const pr = seg(lt, 0.3, 2.2), quente = seg(t, T.raiz - 0.2, T.raiz + 0.2);
      ctx.save(); ctx.strokeStyle = quente > 0 ? VERM : TINTA; ctx.lineCap = 'round';
      [[-1, 0.9], [-0.5, 1], [0, 1.1], [0.45, 1], [0.95, 0.85]].forEach(([d, c], i) => {
        const k = clamp(pr * 1.3 - i * 0.08);
        ctx.lineWidth = 16 - i % 2 * 4;
        ctx.beginPath(); ctx.moveTo(AX + d * 20, CHAO);
        ctx.quadraticCurveTo(AX + d * 160, CHAO + 70 * c, AX + d * 300 * k, CHAO + 190 * c * k); ctx.stroke();
      });
      ctx.restore();
      // tronco e copa
      ctx.fillStyle = '#4A3424'; ctx.fillRect(AX - 26, CHAO - 150, 52, 154);
      ctx.fillStyle = '#3F5A2E'; [[0, -250, 110], [-115, -200, 82], [115, -200, 82], [-60, -300, 74], [66, -300, 74]].forEach(([dx2, dy2, r]) => {
        ctx.beginPath(); ctx.arc(AX + dx2, CHAO + dy2, r, 0, 7); ctx.fill();
      });
      [['FOME', AX - 130, CHAO - 230, 0], ['DESEMPREGO', AX + 120, CHAO - 310, 0.3], ['SEM MORADIA', AX, CHAO - 180, 0.6]].forEach(([s, x, y, d]) =>
        L.etiqueta(ctx, s, x, y, seg(t, T.problemas + d, T.problemas + d + 0.3), { cor: TINTA, tam: 28 }));
      L.etiqueta(ctx, 'A CAUSA ESTÁ AQUI', AX, CHAO + 165, seg(t, T.raiz, T.raiz + 0.3), { cor: VERM, tam: 36 });
      // à direita: o analgésico, que só alivia
      ctx.fillStyle = TINTA; ctx.fillRect(1180, 230, 4, 620);
      const pa = ease.saida(seg(t, T.analg - 0.6, T.analg - 0.1));
      if (pa > 0) {
        ctx.save(); ctx.globalAlpha = clamp(pa * 2); ctx.translate(1490, 470 + (1 - pa) * 200); ctx.rotate(-0.35);
        ctx.fillStyle = TINTA; ctx.beginPath(); ctx.roundRect(-176, -66, 360, 140, 70); ctx.fill();
        ctx.fillStyle = '#F7EEDC'; ctx.beginPath(); ctx.roundRect(-180, -70, 180, 140, [70, 0, 0, 70]); ctx.fill();
        ctx.fillStyle = AZUL; ctx.beginPath(); ctx.roundRect(0, -70, 180, 140, [0, 70, 70, 0]); ctx.fill();
        ctx.restore();
        L.texto(ctx, 'ANALGÉSICO', 1490, 700, { familia: FONTE.bloco, peso: 400, tam: 56, cor: AZUL, alinhar: 'center' });
        L.texto(ctx, 'alivia hoje, a dor volta amanhã', 1490, 750, { familia: FONTE.maquina, peso: 400, tam: 30, cor: TINTA, alinhar: 'center' });
        xis(1490, 470, 150, seg(t, T.analg + 0.3, T.analg + 0.7), VERM, 22);
      }
    }

    // ------------------------------------------------ H. comunismo popular (ARQUIVO)
    function popular(lt) {
      L.fundo(ctx, BEGE);
      titulo('COMUNISMO POPULAR', seg(lt, 0.1, 0.6));
      cred('é assim que o Coletivo Lufã trabalha', seg(lt, 0.3, 0.9));
      // quem não tem o básico
      const CARDS = [['MORADIA DIGNA', T.moradia, icCasa], ['EMPREGO DIGNO', T.emprego, icCarteira], ['ALIMENTAÇÃO', T.alim, icPrato]];
      if (t > T.quem - 0.2) L.texto(ctx, L.datilografar('quem sequer tem acesso a…', seg(t, T.quem - 0.2, T.quem + 0.6)), 160, 270, { familia: FONTE.maquina, peso: 400, tam: 40, cor: TINTA });
      CARDS.forEach(([s, t0, ic], i) => {
        const x = 160 + i * 330, e = ease.saida(seg(t, t0 - 0.1, t0 + 0.3));
        if (e <= 0) return;
        ctx.save(); ctx.translate(0, (1 - e) * 60); ctx.globalAlpha = clamp(e * 2);
        ficha(x, 320, 290, 330, TINTA);
        ic(x + 145, 470);
        L.texto(ctx, s, x + 145, 610, { familia: FONTE.sub, peso: 600, tam: tamMax(s, FONTE.sub, 34, 600, 250), cor: TINTA, alinhar: 'center' });
        ctx.restore();
        // primeiro um "sem", depois o check quando o povo concorda
        if (t < T.concorda) L.etiqueta(ctx, 'FALTA', x + 245, 340, seg(t, t0 + 0.3, t0 + 0.6), { cor: VERM, tam: 26 });
      });
      // o livro de Marx, fechado
      const tb = T.nunca - 0.2, eb = ease.saida(seg(t, tb, tb + 0.5));
      if (eb > 0) {
        ctx.save(); ctx.translate(1440, 470 + (1 - eb) * 600); ctx.rotate(0.05);
        ctx.fillStyle = 'rgba(28,23,20,0.35)'; ctx.fillRect(-150 + 14, -190 + 14, 300, 380);
        ctx.fillStyle = VESC; ctx.fillRect(-150, -190, 300, 380);
        ctx.fillStyle = VERM; ctx.fillRect(-130, -190, 280, 380);
        ctx.fillStyle = AMA; ctx.fillRect(-100, -120, 220, 4); ctx.fillRect(-100, 110, 220, 4);
        L.texto(ctx, 'O CAPITAL', 10, -40, { familia: FONTE.manchete, peso: 900, tam: 60, cor: AMA, alinhar: 'center' });
        L.texto(ctx, 'KARL MARX', 10, 10, { familia: FONTE.sub, peso: 600, tam: 32, cor: BEGE, alinhar: 'center', tracking: 3 });
        L.estrela(ctx, 10, 70, 26, 0, AMA);
        ctx.restore();
        L.etiqueta(ctx, 'NUNCA VAI LER', 1440, 720, seg(t, T.nunca + 0.3, T.nunca + 0.6), { cor: TINTA, tam: 32 });
      }
      // …mas concorda com boa parte
      CARDS.forEach(([, ,], i) => check(160 + i * 330 + 245, 350, seg(t, T.concorda + 0.3 + i * 0.25, T.concorda + 0.6 + i * 0.25), VERM, 1.1));
      faixa('MAS CONCORDA COM BOA PARTE DOS SEUS CONCEITOS', CX, 830, T.concorda + 0.2, 1640, AMA, TINTA, 46, 41);
    }
    function icCasa(x, y) { ctx.save(); ctx.translate(x, y); ctx.scale(1.6, 1.6); ctx.fillStyle = BEGE; ctx.fillRect(-30, -10, 60, 44); ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.strokeRect(-30, -10, 60, 44); ctx.fillStyle = VERM; ctx.beginPath(); ctx.moveTo(-40, -8); ctx.lineTo(0, -40); ctx.lineTo(40, -8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = TINTA; ctx.fillRect(-8, 10, 16, 24); ctx.restore(); }
    function icCarteira(x, y) { ctx.save(); ctx.translate(x, y); ctx.scale(1.6, 1.6); ctx.fillStyle = AZUL; ctx.fillRect(-32, -40, 64, 80); ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.strokeRect(-32, -40, 64, 80); ctx.fillStyle = AMA; ctx.fillRect(-20, -24, 40, 4); ctx.fillRect(-20, -14, 40, 4); L.estrela(ctx, 0, 14, 14, 0, AMA); ctx.restore(); }
    function icPrato(x, y) { ctx.save(); ctx.translate(x, y); ctx.scale(1.6, 1.6); ctx.fillStyle = '#F7EEDC'; ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 10, 44, 22, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#E8DAB8'; ctx.beginPath(); ctx.ellipse(0, 6, 26, 12, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#6B4A2E'; ctx.beginPath(); ctx.arc(-8, 0, 9, 0, 7); ctx.fill(); ctx.fillStyle = '#3F5A2E'; ctx.beginPath(); ctx.arc(10, 2, 8, 0, 7); ctx.fill(); ctx.fillStyle = TINTA; ctx.fillRect(-60, -20, 5, 46); ctx.fillRect(56, -20, 5, 46); ctx.restore(); }

    // ------------------------------------------------ I. comunicação popular (CARTAZ)
    function comunica(lt) {
      arquivo = false;
      sol(1320);
      carimbar('NOSSA COMUNICAÇÃO É', CX, 220, T.comunica + 1.0, BEGE, 60, FONTE.bloco, 51, { larg: 1100 });
      carimbar('POPULAR', CX, 400, T.comunica + 1.3, AMA, 200, FONTE.manchete, 52, { larg: 1100, erro: VESC, desloc: 8 });
      const IT = [['CARTAZES', T.cartazes, icCartaz], ['VÍDEOS', T.videos, icVideo], ['ARTIGOS', T.artigos, icArtigo], ['JORNAL', T.jornal, icJornal], ['DEBATES', T.debates, icDebate]];
      IT.forEach(([s, t0, ic], i) => {
        const x = 330 + i * 315;
        L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), x, 580, () => {
          ctx.fillStyle = 'rgba(28,23,20,0.35)'; ctx.fillRect(x - 125 + 10, 470 + 10, 250, 230);
          ctx.fillStyle = BEGE; ctx.fillRect(x - 125, 470, 250, 230);
          ic(x, 560);
          L.texto(ctx, s, x, 680, { familia: FONTE.sub, peso: 600, tam: 36, cor: TINTA, alinhar: 'center', tracking: 2 });
        }, 53 + i);
      });
      faixa('FEITA PARA CHEGAR A QUEM PRECISA OUVIR', CX, 820, T.ouvir, 1500, TINTA, AMA, 50, 59);
    }
    function icCartaz(x, y) { ctx.fillStyle = VERM; ctx.fillRect(x - 40, y - 56, 80, 100); L.estrela(ctx, x, y - 14, 24, 0, AMA); ctx.fillStyle = BEGE; ctx.fillRect(x - 28, y + 24, 56, 8); }
    function icVideo(x, y) { ctx.fillStyle = TINTA; ctx.fillRect(x - 64, y - 44, 128, 88); ctx.fillStyle = VERM; ctx.beginPath(); ctx.moveTo(x - 16, y - 24); ctx.lineTo(x + 26, y); ctx.lineTo(x - 16, y + 24); ctx.closePath(); ctx.fill(); }
    function icArtigo(x, y) { ctx.fillStyle = '#F7EEDC'; ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.fillRect(x - 42, y - 56, 84, 108); ctx.strokeRect(x - 42, y - 56, 84, 108); ctx.fillStyle = TINTA; for (let i = 0; i < 6; i++) ctx.fillRect(x - 30, y - 40 + i * 15, i === 0 ? 60 : 50 - (i % 2) * 14, 5); }
    function icJornal(x, y) { ctx.fillStyle = '#F7EEDC'; ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.fillRect(x - 62, y - 50, 124, 96); ctx.strokeRect(x - 62, y - 50, 124, 96); ctx.fillStyle = VERM; ctx.fillRect(x - 52, y - 40, 104, 16); ctx.fillStyle = TINTA; ctx.fillRect(x - 52, y - 16, 48, 48); for (let i = 0; i < 4; i++) ctx.fillRect(x + 4, y - 16 + i * 13, 48, 5); }
    function icDebate(x, y) {
      ctx.fillStyle = VERM; ctx.beginPath(); ctx.roundRect(x - 66, y - 52, 80, 54, 12); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - 50, y); ctx.lineTo(x - 56, y + 18); ctx.lineTo(x - 32, y); ctx.fill();
      ctx.fillStyle = AZUL; ctx.beginPath(); ctx.roundRect(x - 10, y - 14, 80, 54, 12); ctx.fill(); ctx.beginPath(); ctx.moveTo(x + 50, y + 38); ctx.lineTo(x + 58, y + 56); ctx.lineTo(x + 34, y + 38); ctx.fill();
    }

    // ------------------------------------------------ J. próximo episódio (CARTAZ)
    function proximo(lt) {
      arquivo = false;
      sol(1300);
      carimbar('NO PRÓXIMO EPISÓDIO:', CX, 230, T.proximo + 0.1, BEGE, 64, FONTE.bloco, 61, { larg: 1100 });
      carimbar('O QUE É SER UM', CX, 420, T.proximo + 0.5, AMA, 150, FONTE.manchete, 62, { larg: 1500, erro: VESC, desloc: 7 });
      carimbar('MILITANTE ATIVO?', CX, 610, T.militante, AMA, 190, FONTE.manchete, 63, { larg: 1500, erro: VESC, desloc: 8 });
      L.aplicarCarimbo(ctx, seg(t, T.chega, T.chega + 0.3), CX, 790, () => {
        ctx.save(); ctx.translate(CX, 790); ctx.rotate(-0.04);
        ctx.fillStyle = TINTA; ctx.fillRect(-330, -62, 660, 124);
        L.texto(ctx, 'CHEGA MAIS!', 0, 30, { familia: FONTE.bloco, peso: 400, tam: 84, cor: AMA, alinhar: 'center' });
        ctx.restore();
      }, 64);
    }

    // ------------------------------------------------ K. logo e créditos
    function final(lt) {
      arquivo = false;
      sol(1300);
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 430, () => L.imagem(ctx, L.img.lufa, CX, 430, 600), 97);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.6, 1.1);
      L.texto(ctx, 'NARRAÇÃO: EDUARDA PRADO', CX, 880, { familia: FONTE.sub, peso: 600, tam: 46, cor: BEGE, alinhar: 'center', tracking: 4 });
      ctx.restore();
    }
  },
};
