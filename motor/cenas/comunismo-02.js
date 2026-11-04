// "DESMISTIFICANDO O COMUNISMO" · EP. 2: O que é o socialismo? Roteiro: roteiros/comunismo-02-socialismo.md (v2)
// Mesma base do EP. 1 (motor/cenas/comunismo-01.js): gancho do Jones Manoel numa moldura, vinheta da série, registros ARQUIVO/CARTAZ.
// Ordem: gancho (Jones, 0–14,35 s, o vídeo entra no juntar.sh) → vinheta → #1 nenhum país chegou ao comunismo (URSS) →
// #2 a palavra é mais velha que Marx (1827/1832, os utópicos) → #3 Marx e Engels: o socialismo científico (Engels, 1888) →
// #4 a escada: o socialismo é o primeiro degrau → o último degrau (Marx, 1875) + URSS/Cuba/Vietnã/China → próximo (mais-valia) → logo.
// PRÉVIA sem narração; com a narração, T vem de comunismo-02.tempos.js.
//
// DIAGRAMAÇÃO PADRÃO: título y 330 · fonte dos dados y 384 · conteúdo x 120–960, y 420–1420 · legenda (tarja) y 1466–1542
const JONES = 14.35;  // o gancho: 0–14,35 s do vídeo do Jones Manoel (até "…universalizar a prosperidade no Brasil.")
const J0 = JONES + 0.4;
const T = Object.assign({
  vin: J0, nenhum: J0 + 3.7, urss: J0 + 5.8, sel: J0 + 8.2,
  origem: J0 + 10.3, franca: J0 + 12.0, utopicos: J0 + 14.0, utopico: J0 + 17.0, plano: J0 + 19.5,
  cientifico: J0 + 22.9, engels: J0 + 23.5, cient: J0 + 26.2, luta: J0 + 28.6, e88: J0 + 32.4, sel88: J0 + 37.4,
  escada: J0 + 41.9, sobe: J0 + 44.0, selo1: J0 + 45.4, selo2: J0 + 47.2, selo3: J0 + 49.2,
  topo: J0 + 52.5, fartura: J0 + 54.0, marx: J0 + 54.8, paises: J0 + 58.2, proximo: J0 + 62.6, logo: J0 + 66.4, dur: J0 + 70.0,
}, (window.TEMPOS || {}).marcas || {});
// janela do vídeo do Jones: recorte 720×920 do original a partir do topo (tira a legenda dele, que começa em y ~940), escalado para 690×880
const JANELA = { x: 195, y: 445, w: 690, h: 880 };
// legenda da fala do Jones no NOSSO padrão (transcrição com tempo por palavra)
const LEG_JONES = [{"t0": 0.0, "t1": 1.12, "p": [["Quando", 0.0], ["a", 0.06], ["gente", 0.12], ["fala", 0.22], ["de", 0.48], ["socialismo,", 0.6]]}, {"t0": 1.12, "t1": 2.46, "p": [["tem", 1.12], ["muita", 1.22], ["gente", 1.38], ["que", 1.54], ["pensa", 1.72], ["assim:", 2.16]]}, {"t0": 2.46, "t1": 4.46, "p": [["“ah,", 2.46], ["vai", 2.94], ["tomar", 3.14], ["minha", 3.34], ["casa,", 3.54]]}, {"t0": 4.46, "t1": 5.86, "p": [["vai", 4.46], ["tomar", 4.7], ["meu", 4.9], ["carro,", 5.14]]}, {"t0": 5.86, "t1": 7.2, "p": [["não", 5.86], ["vai", 5.96], ["ter", 6.08], ["mais", 6.22], ["pequeno", 6.38], ["comércio”.", 6.76]]}, {"t0": 7.2, "t1": 8.54, "p": [["Não,", 7.2], ["é", 7.28], ["claro", 7.36], ["que", 7.58], ["não,", 7.76], ["pô.", 8.1]]}, {"t0": 8.54, "t1": 9.24, "p": [["O", 8.54], ["que", 8.64], ["a", 8.68], ["gente", 8.78], ["quer,", 8.88]]}, {"t0": 9.24, "t1": 12.14, "p": [["inclusive,", 9.24], ["com", 9.84], ["o", 10.02], ["processo", 10.2], ["da", 10.44], ["Revolução", 10.7], ["Brasileira,", 11.06]]}, {"t0": 12.14, "t1": 14.35, "p": [["é", 12.14], ["universalizar", 12.32], ["a", 13.0], ["prosperidade", 13.18], ["no", 13.68], ["Brasil.", 13.94]]}];

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: T.dur,
  imagens: {
    jonesFim: '../midia/comunismo-02/jones-ultimo-quadro.jpg',   // último quadro do trecho (14,2 s), já recortado 690×880
    saintsimon: '../midia/comunismo-02/saint-simon-1848.jpg',      // Ravergie (seg. Labille-Guiard), 1848 · domínio público
    fourier: '../midia/comunismo-02/fourier-1835.jpg',             // Jean Gigoux, 1835 · foto F. Foliot, CC BY-SA 4.0
    owen: '../midia/comunismo-02/owen-1834.jpg',                   // W. H. Brooke, 1834 · domínio público
    marx: '../midia/comunismo-01/marx-recorte.jpg',                // J. J. E. Mayall, 1875 · domínio público
    engels: '../midia/comunismo-01/engels-recorte.jpg',            // retrato de Engels · domínio público
    logoBege: '../identidade/marca/o-camarada-bege.png',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease, clamp } = L;
    const CX = 540, LARG = 840, X0 = 120, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta, AZUL = COR.azul;
    let arquivo = true;

    const ordem = [[0, jones], [T.vin, vinheta], [T.nenhum, gancho], [T.origem, origem], [T.cientifico, cientifico], [T.escada, escada],
      [T.topo, comunismo], [T.proximo, proximo], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [T.nenhum, T.sel, T.utopico, T.cient, T.luta, T.sobe + 1.0, T.selo3, T.topo + 0.8, T.paises + 1.9, T.proximo + 0.1, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 10);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();

    [[T.vin, VERM, 24], [T.nenhum, VERM, -24], [T.origem, BEGE, 24], [T.cientifico, BEGE, -24], [T.escada, BEGE, 24], [T.topo, BEGE, -24], [T.proximo, VERM, 24], [T.logo, BEGE, -24]]
      .forEach(([X, cor, ang]) => L.corteDiagonal(ctx, seg(t, X - 0.4, X), cor, ang));
    if (arquivo) L.varredura(ctx, t, 0.07);
    IMP.forEach(X => L.flash(ctx, t, X, AMA, 0.25, 0.22));
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);
    legenda();

    // ------------------------------------------------ componentes padronizados
    function legenda() {
      const LEG = [...LEG_JONES, ...((window.TEMPOS || {}).legendas || [])];
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

    // ------------------------------------------------ 0. o gancho: o vídeo do Jones numa moldura (o vídeo é sobreposto na montagem)
    function jones(lt) {
      L.fundo(ctx, BEGE);
      titulo('SOCIALISMO VAI TOMAR A SUA CASA?', seg(lt, 0.0, 0.6));
      cred('Jones Manoel, historiador', seg(lt, 0.2, 0.8));
      const { x, y, w, h } = JANELA;
      L.moldura(ctx, x, y, w, h, 30);
      ctx.fillStyle = TINTA; ctx.fillRect(x, y, w, h);                 // aqui entra o vídeo (juntar.sh)
      if (t >= JONES - 0.1) ctx.drawImage(L.img.jonesFim, x, y, w, h);  // depois que o vídeo acaba: o último quadro, sem buraco
      L.texto(ctx, 'Vídeo: Jones Manoel', CX, y + h + 72, { familia: FONTE.maquina, peso: 400, tam: 26, cor: TINTA, alinhar: 'center' });
    }

    // ------------------------------------------------ 1. CARTAZ: nenhum país chegou ao comunismo
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

    // ------------------------------------------------ 2. a palavra é mais velha que Marx: 1827/1832 e os utópicos (ARQUIVO)
    function origem(lt) {
      L.fundo(ctx, BEGE);
      const fase2 = t >= T.utopicos;
      titulo(fase2 ? 'O SOCIALISMO UTÓPICO' : 'A PALAVRA É MAIS VELHA QUE MARX', fase2 ? seg(t, T.utopicos, T.utopicos + 0.6) : seg(lt, 0.1, 0.7));
      cred(fase2 ? 'retratos de época' : 'primeiros registros impressos', fase2 ? seg(t, T.utopicos + 0.2, T.utopicos + 0.8) : seg(lt, 0.3, 0.9));
      // ficha datilografada com os dois registros
      if (t < T.utopicos + 0.4) {
        const sai = ease.entrada(seg(t, T.utopicos, T.utopicos + 0.4)), e = ease.saida(seg(lt, 0, 0.4));
        ctx.save(); ctx.translate(-sai * 1200, (1 - e) * 900);
        ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(X0 + 14, 534, LARG, 640);
        ctx.fillStyle = BEGE; ctx.fillRect(X0, 520, LARG, 640); ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.strokeRect(X0, 520, LARG, 640);
        ctx.fillStyle = VERM; ctx.fillRect(X0, 520, LARG, 14);
        const REG = [[T.origem + 0.3, '1827 · INGLATERRA', ['“socialistas”: revista dos', 'seguidores de Robert Owen']],
          [T.franca, '1832 · FRANÇA', ['“socialisme”: Pierre Leroux,', 'no jornal Le Globe']]];
        REG.forEach(([t0, cab, linhas], k) => {
          if (t < t0) return;
          const y0 = 620 + k * 270;
          L.texto(ctx, L.datilografar(cab, seg(t, t0, t0 + 0.4)), X0 + 44, y0, { familia: FONTE.sub, peso: 600, tam: 50, cor: VERM, tracking: 3 });
          linhas.forEach((s2, i) => L.texto(ctx, L.datilografar(s2, seg(t, t0 + 0.4 + i * 0.5, t0 + 0.9 + i * 0.5)), X0 + 44, y0 + 78 + i * 64,
            { familia: FONTE.maquina, peso: 400, tam: 46, cor: TINTA }));
        });
        L.fonte(ctx, FONTE.maquina, 46, 400);
        if (t >= T.franca + 1.4) L.selecao(ctx, X0 + 40, 650, ctx.measureText('“socialistas”').width + 8, 64, seg(t, T.franca + 1.4, T.franca + 1.8), VERM);
        if (t >= T.franca + 1.4) L.selecao(ctx, X0 + 40, 920, ctx.measureText('“socialisme”').width + 8, 64, seg(t, T.franca + 1.6, T.franca + 2.0), VERM);
        L.texto(ctx, 'antes de Marx e Engels escreverem o Manifesto (1848)', CX, 1120, { familia: FONTE.maquina, peso: 400, tam: 26, cor: TINTA, alinhar: 'center' });
        ctx.restore();
      }
      // os três utópicos, em moldura, com o crédito logo abaixo de cada retrato
      if (fase2) {
        const R = [['saintsimon', 'SAINT-SIMON', ['Ravergie, 1848', 'domínio público'], 0, 1.0, 0],
          ['fourier', 'FOURIER', ['Jean Gigoux · foto F. Foliot', 'CC BY-SA 4.0'], 0.6, 1.25, 70],
          ['owen', 'OWEN', ['W. H. Brooke, 1834', 'domínio público'], 1.2, 1.05, 20]];
        const w = 236, h = 300, y = 480;
        R.forEach(([k, nome, credito, d, zoom, dy], i) => {
          const t0 = T.utopicos + 0.3 + d, e = ease.saida(seg(t, t0, t0 + 0.5));
          if (e <= 0) return;
          const x = X0 + 10 + i * (w + 66);
          ctx.save(); ctx.globalAlpha = clamp(e * 2); ctx.translate(0, (1 - e) * 120);
          L.moldura(ctx, x, y, w, h, 20);
          L.foto(ctx, L.img[k], x, y, w, h, { zoom, dy, desfoque: (1 - seg(t, t0, t0 + 0.6)) * 8 });
          credito.forEach((c, j) => L.texto(ctx, c, x + w / 2, y + h + 50 + j * 24, { familia: FONTE.maquina, peso: 400, tam: tamMax(c, FONTE.maquina, 19, 400, w + 40), cor: TINTA, alinhar: 'center' }));
          L.etiqueta(ctx, nome, x + w / 2, y + h + 128, seg(t, t0 + 0.3, t0 + 0.6), { cor: VERM, tam: 30 });
          ctx.restore();
        });
        carimbar('SOCIALISMO UTÓPICO', 1080, T.utopico, VERM, 96, FONTE.bloco, 21);
        if (t >= T.plano) {
          faixa('UM BOM PLANO + BOA VONTADE', 1270, T.plano, TINTA, BEGE, 54, 22);
          L.etiqueta(ctx, 'BASTA?', 860, 1196, seg(t, T.plano + 0.8, T.plano + 1.1), { cor: AMA, tam: 36 });
        }
      }
    }

    // ------------------------------------------------ 3. Marx e Engels: o socialismo científico + Engels, 1888 (ARQUIVO)
    function cientifico(lt) {
      L.fundo(ctx, BEGE);
      const q88 = t >= T.e88;
      titulo(q88 ? 'POR QUE "MANIFESTO COMUNISTA"?' : 'MARX E ENGELS', q88 ? seg(t, T.e88, T.e88 + 0.6) : seg(lt, 0.1, 0.6));
      cred(q88 ? 'Engels, prefácio à edição inglesa do Manifesto (1888)' : 'fotos de época, domínio público', q88 ? seg(t, T.e88 + 0.2, T.e88 + 0.8) : seg(lt, 0.3, 0.9));
      // os retratos: grandes no começo; quando entra a ficha de 1888, sobem e encolhem
      const enc = ease.saida(seg(t, T.e88, T.e88 + 0.6));
      const W = lerp(330, 200, enc), H = lerp(400, 240, enc), y = lerp(480, 440, enc);
      [['marx', 'KARL MARX', lerp(160, 150, enc), T.cientifico + 0.2], ['engels', 'FRIEDRICH ENGELS', lerp(590, 730, enc), T.engels]].forEach(([k, nome, x, t0]) => {
        const e = ease.saida(seg(t, t0, t0 + 0.5));
        if (e <= 0) return;
        ctx.save(); ctx.globalAlpha = clamp(e * 2); ctx.translate(0, (1 - e) * 120);
        L.moldura(ctx, x, y, W, H, lerp(26, 16, enc));
        L.foto(ctx, L.img[k], x, y, W, H, { desfoque: (1 - seg(t, t0, t0 + 0.6)) * 8 });
        L.etiqueta(ctx, nome, x + W / 2, y + H + lerp(70, 48, enc), seg(t, t0 + 0.3, t0 + 0.6), { cor: VERM, tam: lerp(34, 26, enc) });
        ctx.restore();
      });
      if (!q88) {
        carimbar('SOCIALISMO CIENTÍFICO', 1050, T.cient, VERM, 92, FONTE.bloco, 31);
        if (t >= T.luta) L.aplicarCarimbo(ctx, seg(t, T.luta, T.luta + 0.3), CX, 1260, () => {
          ctx.fillStyle = TINTA; ctx.fillRect(X0, 1170, LARG, 180);
          L.texto(ctx, 'A MUDANÇA VEM DA LUTA', CX, 1246, { familia: FONTE.bloco, peso: 400, tam: 56, cor: BEGE, alinhar: 'center' });
          L.texto(ctx, 'DA CLASSE TRABALHADORA', CX, 1318, { familia: FONTE.bloco, peso: 400, tam: 56, cor: AMA, alinhar: 'center' });
        }, 32);
      } else {
        // a frase de Engels, datilografada, com "comunismo… da classe operária" selecionado
        const e = ease.saida(seg(t, T.e88 + 0.3, T.e88 + 0.7));
        ctx.save(); ctx.translate(0, (1 - e) * 900);
        ctx.fillStyle = 'rgba(28,23,20,0.25)'; ctx.fillRect(X0 + 12, 822, LARG, 560);
        ctx.fillStyle = COR.begeEscuro; ctx.fillRect(X0, 810, LARG, 560);
        L.texto(ctx, 'ENGELS, 1888', X0 + 40, 890, { familia: FONTE.sub, peso: 600, tam: 42, cor: VERM, tracking: 3 });
        const LIN = ['“Assim, em 1847, o socialismo', 'era um movimento da classe média,', 'e o comunismo um movimento', 'da classe operária.”'];
        const tamF = tamMax(LIN[1], FONTE.maquina, 46, 400, 770);
        L.fonte(ctx, FONTE.maquina, tamF, 400);
        const wCom = ctx.measureText('e o comunismo').width, wOp = ctx.measureText('da classe operária.”').width;
        L.selecao(ctx, X0 + 36, 1100, wCom + 8, 62, seg(t, T.sel88, T.sel88 + 0.4), VERM);
        L.selecao(ctx, X0 + 36, 1172, wOp + 8, 62, seg(t, T.sel88 + 0.4, T.sel88 + 0.8), VERM);
        LIN.forEach((s2, i) => L.texto(ctx, L.datilografar(s2, seg(t, T.e88 + 0.7 + i * 0.7, T.e88 + 1.4 + i * 0.7)), X0 + 40, 990 + i * 72,
          { familia: FONTE.maquina, peso: 400, tam: tamF, cor: TINTA }));
        L.texto(ctx, 'trad. Edições Avante! (marxists.org)', X0 + 40, 1330, { familia: FONTE.maquina, peso: 400, tam: 22, cor: TINTA });
        ctx.restore();
      }
    }

    // ------------------------------------------------ 4. a escada: o socialismo é o primeiro degrau depois do capitalismo
    function escada(lt) {
      L.fundo(ctx, BEGE);
      titulo('E O QUE É O SOCIALISMO?', seg(lt, 0.1, 0.7));
      cred('o primeiro degrau depois do capitalismo', seg(lt, 0.3, 0.9));
      desenharEscada(ease.saida(seg(t, T.sobe, T.sobe + 1.0)), { t0: T.escada + 0.2 });
      [[T.selo1, 'FÁBRICAS E TERRA DE TODOS', VERM, BEGE], [T.selo2, 'PRODUÇÃO PLANEJADA PRO POVO', TINTA, BEGE],
        [T.selo3, 'A CADA UM, SEGUNDO O SEU TRABALHO', AMA, TINTA]].forEach(([t0, txt, fundoCor, cor], i) => {
        if (t < t0) return;
        const y = 500 + i * 118;
        L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), CX, y, () => {
          ctx.fillStyle = fundoCor; ctx.fillRect(X0, y - 46, LARG, 92);
          ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.strokeRect(X0, y - 46, LARG, 92);
          L.texto(ctx, txt, CX, y + 16, { familia: FONTE.bloco, peso: 400, tam: tamMax(txt, FONTE.bloco, 44, 400, 790), cor, alinhar: 'center' });
        }, 60 + i);
      });
    }

    // ------------------------------------------------ 5. o último degrau: comunismo (Marx, 1875) + URSS/Cuba/Vietnã/China no socialismo
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
      if (t >= T.paises) ['URSS', 'CUBA', 'VIETNÃ', 'CHINA'].forEach((s2, i) => {
        const q = seg(t, T.paises + 0.4 + i * 0.3, T.paises + 0.7 + i * 0.3);
        L.etiqueta(ctx, s2, X0 + 420, 520 + i * 84, q, { cor: VERM, tam: 42 });
      });
      if (t >= T.paises + 1.9) L.aplicarCarimbo(ctx, seg(t, T.paises + 1.9, T.paises + 2.2), X0 + 420, 1180, () => {
        ctx.save(); ctx.translate(X0 + 420, 1180); ctx.rotate(-0.05);
        ctx.fillStyle = BEGE; ctx.fillRect(-125, -40, 250, 80);
        ctx.strokeStyle = TINTA; ctx.lineWidth = 6; ctx.strokeRect(-125, -40, 250, 80);
        L.texto(ctx, 'O CAMINHO', 0, 15, { familia: FONTE.bloco, peso: 400, tam: 42, cor: VERM, alinhar: 'center' });
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
      [['Vídeo de abertura: Jones Manoel', 1090],
        ['Retratos: Saint-Simon (Ravergie, 1848) · Owen (W. H. Brooke, 1834) · Marx (Mayall) · Engels: domínio público', 1135],
        ['Fourier (Jean Gigoux; foto F. Foliot, CC BY-SA 4.0)', 1170],
        ['Fontes: Co-operative Magazine (1827) · Leroux, Le Globe (1832) · Engels, Do Socialismo Utópico ao Científico (1880)', 1215],
        ['Engels, prefácio ao Manifesto (1888) · Marx, Crítica do Programa de Gotha (1875)', 1250],
        ['Constituições de Cuba (2019) e da China · República Socialista do Vietnã', 1285]].forEach(([s2, y]) =>
        L.texto(ctx, s2, CX, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(s2, FONTE.maquina, 24, 400), cor: TINTA, alinhar: 'center' }));
      ctx.restore();
    }
  },
};
