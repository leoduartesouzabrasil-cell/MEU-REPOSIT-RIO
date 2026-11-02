// "Voto distrital: seu voto no lixo" (ângulo: contra). Roteiro: roteiros/voto-distrital.md
// Abertura CARTAZ noturna → print da notícia (Agência Câmara) → contexto (ficha) → "como isso funcionaria na prática?" →
// Vila Exemplo em 2D (distritos, Dona Maria e seu João votam, o empresário leva, 60% dos votos no lixo,
// a caneta redesenha o mapa, o curral, quem fica de fora) → distritão (rejeitado 2017/2021) → cartaz final → logo.
// PRÉVIA sem narração (tempos estimados). Com a narração, T vem de voto-distrital.tempos.js.
// Render: node motor/render.js voto-distrital saida/voto-distrital.mp4 --audio audio/voto-distrital/previa.wav
//
// DIAGRAMAÇÃO PADRÃO: título y 330 · fonte dos dados y 384 · conteúdo x 120–960, y 420–1420 · legenda (tarja) y 1466–1542
const T = Object.assign({
  n1: 0.3, n2: 1.2, n3: 2.1, n4: 2.9, cedula: 3.2, print: 4.6, sel: 6.0, ctx: 8.4, motta: 8.7, c1: 10.2, c2: 11.0, c3: 11.8, c4: 12.6,
  metade: 13.6, pratica: 15.8, cidade: 18.2, distrito: 20.4, desce: 21.4, maria: 23.0, joao: 24.4, chuva: 25.8, conta: 27.2,
  vence: 28.0, lixo: 29.2, lixoTxt: 30.6, mapa: 32.0, risca: 32.7, novo: 34.2, curral: 35.6, perde: 37.6, bancada: 41.0, sim: 44.4,
  distritao: 49.2, rej1: 50.4, rej2: 51.2, reforma: 53.0, jogada: 54.6, nao: 56.0, logo: 58.2, dur: 61.8,
}, (window.TEMPOS || {}).marcas || {});
// marcas derivadas (a narração pode trazer as próprias)
T.barPL ??= T.sim + 0.9; T.barPT ??= T.sim + 1.4; T.mesmo ??= T.sim + 3.4; T.esquerda ??= T.perde + 3.2;

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: T.dur,
  imagens: {
    print: '../midia/voto-distrital/print-agencia-camara-2026-10-28.jpg',   // recorte 1300×1650
    motta: '../midia/voto-distrital/hugo-motta-2026.jpg',
    logo_pl: '../midia/voto-distrital/logos/pl.png', logo_pt: '../midia/voto-distrital/logos/pt.png',   // logos enviados pelo autor
    logo_pcdob: '../midia/voto-distrital/logos/pcdob.png', logo_pv: '../midia/voto-distrital/logos/pv.png',                    // Lula Marques/Agência Brasil, 15/04/2026
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease, clamp } = L;
    const CX = 540, LARG = 840, X0 = 120, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta, AZUL = COR.azul;
    let arquivo = true;

    const ordem = [[0, abertura], [T.print, noticia], [T.ctx, contexto], [T.pratica, pratica], [T.cidade, maquete], [T.bancada, bancada],
      [T.distritao, distritao], [T.reforma, fecho], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [T.n1, T.n2, T.n3, T.n4, T.pratica + 0.1, T.vence, T.lixoTxt, T.curral + 1.0, T.bancada + 1.8, T.mesmo, T.esquerda, T.rej1, T.rej2, T.reforma + 0.1, T.jogada, T.nao, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 12);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();

    [[T.print, BEGE, -24], [T.ctx, BEGE, 24], [T.pratica, VERM, -24], [T.cidade, BEGE, 24], [T.bancada, BEGE, -24], [T.distritao, BEGE, 24],
      [T.reforma, VERM, 24], [T.logo, BEGE, -24]].forEach(([X, cor, ang]) => L.corteDiagonal(ctx, seg(t, X - 0.4, X), cor, ang));
    if (arquivo) L.varredura(ctx, t, 0.07);
    IMP.forEach(X => L.flash(ctx, t, X, AMA, 0.25, 0.25));
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);
    legenda();

    // ------------------------------------------------ componentes padronizados (iguais aos vídeos anteriores)
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
    // cédula de papel (2D): retângulo bege com o "X" vermelho
    function cedula(x, y, rot, esc = 1) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(esc, esc);
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-86, -54, 180, 116);
      ctx.fillStyle = BEGE; ctx.fillRect(-90, -58, 180, 116);
      ctx.fillStyle = TINTA; for (let i = 0; i < 3; i++) ctx.fillRect(-70, -34 + i * 26, 92, 6);
      ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.strokeRect(34, -36, 38, 38);
      ctx.strokeStyle = VERM; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(36, -34); ctx.lineTo(70, 0); ctx.moveTo(70, -34); ctx.lineTo(36, 0); ctx.stroke();
      ctx.restore();
    }
    function lixeira2d(x, y, esc, tampa = 0) {
      ctx.save(); ctx.translate(x, y); ctx.scale(esc, esc);
      ctx.fillStyle = BEGE; ctx.beginPath(); ctx.moveTo(-120, -150); ctx.lineTo(120, -150); ctx.lineTo(96, 150); ctx.lineTo(-96, 150); ctx.fill();
      ctx.fillStyle = TINTA; for (let i = -2; i <= 2; i++) ctx.fillRect(i * 40 - 7, -110, 14, 230);
      ctx.save(); ctx.translate(-134, -160); ctx.rotate(-tampa * 0.9);
      ctx.fillStyle = BEGE; ctx.fillRect(0, -24, 268, 30); ctx.fillRect(104, -48, 60, 26); ctx.restore();
      ctx.restore();
    }

    // ------------------------------------------------ A. abertura (CARTAZ noturno)
    function abertura(lt) {
      arquivo = false;
      L.fundo(ctx, TINTA);
      // lua amarela atrás, com raios de cartaz muito discretos
      L.raios(ctx, 860, 200, 2200, 24, L.emDois(t) * 0.03, 'rgba(235,181,42,0.06)');
      ctx.fillStyle = AMA; ctx.beginPath(); ctx.arc(860, 200, 105, 0, 7); ctx.fill();
      ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(902, 172, 98, 0, 7); ctx.fill();       // lua minguante
      // estrelas (pontos de retícula)
      const r = L.rng(7); ctx.fillStyle = 'rgba(237,224,196,0.5)';
      for (let i = 0; i < 40; i++) { const x = r() * 1080, y = 60 + r() * 300; ctx.fillRect(x, y, 4, 4); }
      carimbar('NA CALADA', 430, T.n1, BEGE, 120, FONTE.bloco, 11);
      carimbar('DA NOITE', 560, T.n1 + 0.15, BEGE, 120, FONTE.bloco, 12);
      carimbar('ELES QUEREM JOGAR', 680, T.n2, AMA, 74, FONTE.bloco, 13);
      carimbar('O SEU VOTO', 920, T.n3, BEGE, 210, FONTE.manchete, 14, { erro: VERM, desloc: 7 });
      carimbar('NO LIXO!', 1140, T.n4, VERM, 240, FONTE.manchete, 15, { erro: COR.vermelhoEscuro, desloc: 8 });
      // a cédula cai na lixeira
      if (t >= T.cedula - 0.6) {
        const pl = seg(t, T.cedula - 0.6, T.cedula - 0.2), pc = seg(t, T.cedula, T.cedula + 0.55);
        const yL = lerp(1780, 1420, ease.saida(pl));
        if (pc < 1) cedula(lerp(260, 560, pc), lerp(1180, yL - 40, ease.entrada(pc)), pc * 3.4, lerp(1, 0.75, pc));
        lixeira2d(540, yL, 0.75, clamp(Math.sin(Math.PI * seg(t, T.cedula + 0.2, T.cedula + 0.9))));
      }
    }

    // ------------------------------------------------ B. o print da notícia (ARQUIVO)
    function noticia(lt) {
      L.fundo(ctx, BEGE);
      titulo('A NOTÍCIA', seg(lt, 0.1, 0.6));
      cred('Agência Câmara de Notícias · 28/10/2026', seg(lt, 0.3, 1.0));
      // o print inteiro, parado (sem flutuar nem cortar): 1300×1650 → 764×970, entre y 432 e 1402
      const img = L.img.print, h = 970, s = h / img.height, w = img.width * s, x = CX - w / 2, y = 432;
      const sobe = ease.saida(seg(lt, 0, 0.5));
      ctx.save(); ctx.translate(0, (1 - sobe) * 1500);
      ctx.fillStyle = 'rgba(28,23,20,0.35)'; ctx.fillRect(x + 14, y + 16, w, h);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - 8, y - 8, w + 16, h + 16);
      ctx.drawImage(img, x, y, w, h);
      // seleção em "ainda neste ano" (linha 3 da manchete; no recorte: x 39–547, y 286–358)
      L.selecao(ctx, x + 36 * s, y + 284 * s, 516 * s, 76 * s, seg(t, T.sel, T.sel + 0.5), VERM);
      ctx.restore();
      if (t >= T.sel + 0.6) L.etiqueta(ctx, 'AINDA EM 2026', 760, 930, seg(t, T.sel + 0.6, T.sel + 0.9), { cor: VERM, tam: 44 });
    }

    // ------------------------------------------------ C. contexto (ARQUIVO, ficha datilografada)
    function contexto(lt) {
      L.fundo(ctx, BEGE);
      titulo('O QUE ELES QUEREM VOTAR', seg(lt, 0.1, 0.7));
      cred('fonte: Agência Câmara · CartaCapital · CNN Brasil', seg(lt, 0.3, 1.0));
      const sobe = ease.saida(seg(t, T.c1 - 0.5, T.c1));
      if (t >= T.c1 - 0.5) {
      ctx.save(); ctx.translate(0, (1 - sobe) * 1100);
      ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(X0 + 14, 446, LARG, 560);
      ctx.fillStyle = COR.begeEscuro; ctx.fillRect(X0, 432, LARG, 560);
      ctx.fillStyle = VERM; ctx.fillRect(X0, 432, LARG, 16);
      L.texto(ctx, 'PEC · REFORMA ELEITORAL', X0 + 44, 520, { familia: FONTE.sub, peso: 600, tam: 44, cor: VERM, tracking: 3 });
      const LIN = [['VOTO DISTRITAL MISTO', T.c1], ['VOTAÇÃO: AINDA EM 2026', T.c2], ['ANTES DA POSSE DOS NOVOS', T.c3], ['DEPUTADOS (FEV/2027)', T.c3 + 0.5],
        ['TRANSIÇÃO EM 2030 · VALE EM 2034', T.c4]];
      LIN.forEach(([s, t0], i) => {
        const y = 610 + i * 78;
        if (i === 1 || i === 2) L.selecao(ctx, X0 + 40, y - 46, 640, 60, seg(t, t0 + 0.7, t0 + 1.1), i === 1 ? VERM : AZUL);
        L.texto(ctx, L.datilografar(s, seg(t, t0, t0 + 0.7)), X0 + 44, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(s, FONTE.maquina, 46, 400, 760), cor: TINTA });
      });
      ctx.restore();
      }
      // Hugo Motta: a foto aparece só quando o nome é falado e sai antes da ficha entrar
      if (t >= T.motta && t < T.c1) {
        const entra = ease.saida(seg(t, T.motta, T.motta + 0.5)), sai = ease.entrada(seg(t, T.c1 - 0.6, T.c1 - 0.2));
        const x = 300, w = 480, h = 520;
        ctx.save(); ctx.translate(-sai * 1300, (1 - entra) * 900);   // entra por baixo, sai pela esquerda
        L.moldura(ctx, x, 480, w, h, 30);
        L.foto(ctx, L.img.motta, x, 480, w, h, { zoom: 1.25, dx: 32, dy: -60, desfoque: (1 - seg(t, T.motta, T.motta + 0.6)) * 8 });
        L.texto(ctx, 'Foto: Lula Marques/Agência Brasil', CX, 1060, { familia: FONTE.maquina, peso: 400, tam: 24, cor: TINTA, alinhar: 'center' });
        L.etiqueta(ctx, 'HUGO MOTTA', CX, 1150, seg(t, T.motta + 0.4, T.motta + 0.7), { cor: VERM, tam: 56 });
        L.texto(ctx, L.datilografar('PRESIDENTE DA CÂMARA · REPUBLICANOS-PB', seg(t, T.motta + 0.5, T.motta + 1.0)), CX, 1250, { familia: FONTE.grotesca, peso: 700, tam: 34, cor: TINTA, alinhar: 'center' });
        ctx.restore();
      }
      // barra: metade lista do partido | metade distrito
      if (t >= T.metade) {
        const p = ease.saida(seg(t, T.metade, T.metade + 0.6)), y = 1090, hB = 190;
        ctx.fillStyle = TINTA; ctx.fillRect(X0 + 10, y + 10, LARG, hB);
        ctx.fillStyle = AMA; ctx.fillRect(CX - (LARG / 2) * p, y, (LARG / 2) * p, hB);
        ctx.fillStyle = VERM; ctx.fillRect(CX, y, (LARG / 2) * p, hB);
        ctx.fillStyle = BEGE; ctx.fillRect(CX - 4, y - 20, 8, hB + 40);
        ctx.save(); ctx.globalAlpha = seg(t, T.metade + 0.4, T.metade + 0.8);
        L.texto(ctx, 'METADE', CX - LARG / 4, y + 74, { familia: FONTE.grotesca, peso: 700, tam: 40, cor: TINTA, alinhar: 'center' });
        L.texto(ctx, 'LISTA DO PARTIDO', CX - LARG / 4, y + 136, { familia: FONTE.bloco, peso: 400, tam: 40, cor: TINTA, alinhar: 'center' });
        L.texto(ctx, 'METADE', CX + LARG / 4, y + 74, { familia: FONTE.grotesca, peso: 700, tam: 40, cor: BEGE, alinhar: 'center' });
        L.texto(ctx, 'DISTRITO', CX + LARG / 4, y + 136, { familia: FONTE.bloco, peso: 400, tam: 48, cor: BEGE, alinhar: 'center' });
        ctx.restore();
        if (t >= T.metade + 1.0) L.etiqueta(ctx, '1 DISTRITO = 1 VAGA', CX + LARG / 4, 1360, seg(t, T.metade + 1.0, T.metade + 1.3), { cor: TINTA, tam: 38 });
      }
    }

    // ------------------------------------------------ D. "como isso funcionaria na prática?" (CARTAZ)
    function pratica(lt) {
      arquivo = false;
      L.fundo(ctx, VERM);
      L.raios(ctx, CX, 1560, 2600, 20, -0.3 + L.emDois(t) * 0.05, 'rgba(237,224,196,0.13)');
      ctx.fillStyle = COR.vermelhoEscuro; ctx.beginPath(); ctx.arc(CX, 1560, 330, Math.PI, 0); ctx.fill();
      carimbar('COMO ISSO', 640, T.pratica + 0.1, BEGE, 130, FONTE.bloco, 21);
      carimbar('FUNCIONARIA', 840, T.pratica + 0.35, AMA, 230, FONTE.manchete, 22, { erro: COR.vermelhoEscuro, desloc: 8 });
      carimbar('NA PRÁTICA?', 1040, T.pratica + 0.6, BEGE, 210, FONTE.manchete, 23, { erro: TINTA, desloc: 6 });
    }

    // ------------------------------------------------ E. a Vila Exemplo em 2D (mapa → praça do distrito 1 → mapa redesenhado → curral)
    function maquete(lt) {
      L.fundo(ctx, BEGE);
      const zIn = ease.saida(seg(t, T.desce, T.desce + 0.7)), zOut = ease.saida(seg(t, T.mapa, T.mapa + 0.7));
      const praca = t >= T.desce + 0.45 && t < T.mapa + 0.35;
      const aPraca = seg(t, T.desce + 0.45, T.desce + 0.75) * (1 - seg(t, T.mapa, T.mapa + 0.35));
      const zoom = t < T.mapa ? lerp(1, 2.6, zIn) : lerp(2.6, 1, zOut);
      if (aPraca < 1) L.camera(ctx, { x: lerp(540, 540, zIn), y: t < T.mapa ? lerp(960, 600, zIn) : lerp(600, 960, zOut), zoom }, () => mapa());
      if (praca) { ctx.save(); ctx.globalAlpha = aPraca; L.fundo(ctx, BEGE); pracaD1(); ctx.restore(); }
      // faixa de papel atrás do título (padrão)
      titulo(praca && aPraca > 0.5 ? 'VILA EXEMPLO · DISTRITO 1' : t < T.mapa ? 'VILA EXEMPLO' : t < T.perde ? 'O MAPA' : 'QUEM FICA DE FORA', seg(lt, 0.2, 0.8));
      cred('exemplo ilustrativo · personagens fictícios', seg(lt, 0.4, 1.0));
      // rótulos do mapa
      if (t < T.desce) {
        [['DISTRITO 1', 600], ['DISTRITO 2', 920], ['DISTRITO 3', 1240]].forEach(([s, y], i) =>
          L.etiqueta(ctx, s, CX, y, seg(t, T.cidade + 1.2 + i * 0.25, T.cidade + 1.5 + i * 0.25), { cor: i === 0 ? VERM : TINTA, tam: 38 }));
        if (t >= T.distrito) L.etiqueta(ctx, '1 DISTRITO = 1 VAGA', CX, 1340, seg(t, T.distrito, T.distrito + 0.3), { cor: VERM, tam: 46 });
      }
      if (t >= T.novo && t < T.perde) {
        L.aplicarCarimbo(ctx, seg(t, T.novo, T.novo + 0.3), CX, 1300, () => {
          ctx.fillStyle = TINTA; ctx.fillRect(X0, 1236, LARG, 128);
          L.texto(ctx, 'QUEM DESENHA O MAPA', CX, 1290, { familia: FONTE.grotesca, peso: 700, tam: 46, cor: BEGE, alinhar: 'center' });
          L.texto(ctx, 'ESCOLHE QUEM GANHA', CX, 1346, { familia: FONTE.grotesca, peso: 700, tam: 46, cor: AMA, alinhar: 'center' });
        }, 35);
        if (t < T.curral) L.etiqueta(ctx, 'EMPRESÁRIO: 40% → 55%', CX, 1150, seg(t, T.novo + 0.5, T.novo + 0.8), { cor: AZUL, tam: 40 });
      }
      if (t >= T.curral + 1.0 && t < T.perde)
        L.aplicarCarimbo(ctx, seg(t, T.curral + 1.0, T.curral + 1.3), CX, 720, () =>
          L.texto(ctx, 'CURRAL', CX, 740, { familia: FONTE.manchete, peso: 900, tam: 230, cor: VERM, alinhar: 'center', erro: TINTA, desloc: 7 }), 37);
      if (t >= T.perde) {
        ['MULHERES', 'NEGROS', 'JUVENTUDE', 'MOVIMENTOS'].forEach((s, i) =>
          L.etiqueta(ctx, s, FORA_X[i], 975 - (i % 2) * 60, seg(t, T.perde + 0.6 + i * 0.35, T.perde + 0.9 + i * 0.35), { cor: [VERM, TINTA, AMA, AZUL][i], corTexto: i === 2 ? TINTA : BEGE, tam: 30 }));
        const esq = t >= T.esquerda, txt = esq ? 'PRINCIPALMENTE A ESQUERDA' : 'SEM TERRITÓRIO, SEM VAGA';
        L.aplicarCarimbo(ctx, esq ? seg(t, T.esquerda, T.esquerda + 0.3) : seg(t, T.perde + 2.2, T.perde + 2.5), CX, 1340, () => {
          ctx.fillStyle = esq ? VERM : TINTA; ctx.fillRect(X0, 1280, LARG, 120);
          L.texto(ctx, txt, CX, 1362, { familia: FONTE.bloco, peso: 400, tam: tamMax(txt, FONTE.bloco, 60, 400, 780), cor: BEGE, alinhar: 'center' });
        }, esq ? 40 : 39);
      }
    }

    // ---- o mapa da cidade (vista de cima, casinhas de cartaz), linhas dos distritos, caneta e cerca
    function mapa() {
      ctx.fillStyle = 'rgba(28,23,20,0.25)'; ctx.fillRect(X0 + 12, 452, LARG, 960);
      ctx.fillStyle = COR.begeEscuro; ctx.fillRect(X0, 440, LARG, 960);
      ctx.fillStyle = 'rgba(237,224,196,0.55)';                                   // ruas
      [600, 920, 1240].forEach(y => ctx.fillRect(X0, y - 10, LARG, 20)); ctx.fillRect(CX - 12, 440, 24, 960);
      const entra = t >= T.novo - 0.4 && t < T.distritao, pisca = t < T.novo + 0.4 && Math.floor((t - T.novo) * 8) % 2;
      CASAS.forEach(([x, y, cor, alt]) => {
        const naFaixa = y > 770 && y < 905;
        casa(x, y, naFaixa && entra ? (pisca ? AMA : AZUL) : cor, alt);
      });
      if (t >= T.perde) { ctx.fillStyle = 'rgba(237,224,196,0.55)'; ctx.fillRect(X0, 905, LARG, 495); }
      // linhas dos distritos: entram da esquerda para a direita; a de cima é apagada e redesenhada mais embaixo
      const pl = ease.saida(seg(t, T.cidade + 0.3, T.cidade + 1.4)), risca = seg(t, T.risca, T.risca + 0.5), nova = seg(t, T.risca + 0.5, T.novo);
      ctx.fillStyle = VERM;
      ctx.fillRect(X0 + LARG * risca, 755, LARG * pl * (1 - risca), 11);
      ctx.fillRect(X0, 1075, LARG * pl, 11);
      if (nova > 0) ctx.fillRect(X0, 895, LARG * nova, 11);
      if (t >= T.risca - 0.3 && t < T.novo + 0.5) {
        const px = t < T.risca + 0.5 ? X0 + LARG * risca : X0 + LARG * nova, py = t < T.risca + 0.5 ? 760 : 900;
        caneta(px, py - (t < T.risca ? 200 * (1 - seg(t, T.risca - 0.3, T.risca)) : 0));
      }
      // cerca do curral em volta do novo distrito 1 (y 440–900)
      if (t >= T.curral) {
        const MAD = '#7A5230', pts = [];
        for (let x = X0; x <= X0 + LARG; x += 42) pts.push([x, 900]);
        for (let y = 860; y >= 460; y -= 42) pts.push([X0 + LARG, y], [X0, y]);
        pts.forEach(([x, y], k) => {
          const q = ease.carimbo(seg(t, T.curral + k * 0.025, T.curral + k * 0.025 + 0.3)), h = 56 * q;
          if (q <= 0) return;
          ctx.fillStyle = TINTA; ctx.fillRect(x - 7, y - h + 3, 14, h);
          ctx.fillStyle = MAD; ctx.fillRect(x - 6, y - h, 12, h);
        });
        const q = seg(t, T.curral + 0.6, T.curral + 1.0);
        if (q > 0) {
          ctx.fillStyle = MAD;
          [-18, -38].forEach(dy => { ctx.fillRect(X0, 900 + dy, LARG * q, 7); ctx.fillRect(X0 - 3, 900 - 460 * q, 7, 460 * q); ctx.fillRect(X0 + LARG - 3, 900 - 460 * q, 7, 460 * q); });
        }
      }
      // quem fica de fora (abaixo da cerca)
      if (t >= T.perde) FORA_X.forEach((x, i) => {
        const q = ease.saida(seg(t, T.perde + 0.3 + i * 0.35, T.perde + 0.8 + i * 0.35));
        if (q > 0) pessoa(x, lerp(1420, 1190 - (i % 2) * 60, q), FORA[i], 0.95, q < 1 ? q * 6 : 0);
      });
    }
    function casa(x, y, corTelhado, alt) {
      ctx.fillStyle = TINTA; ctx.fillRect(x - 21, y - alt - 1, 42, alt + 3);
      ctx.fillStyle = alt > 30 ? BEGE : '#F4EAD3'; ctx.fillRect(x - 18, y - alt + 2, 36, alt - 2);
      ctx.fillStyle = TINTA; ctx.fillRect(x - 5, y - 14, 10, 14);
      ctx.fillStyle = corTelhado; ctx.beginPath(); ctx.moveTo(x - 26, y - alt + 2); ctx.lineTo(x, y - alt - 22); ctx.lineTo(x + 26, y - alt + 2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.stroke();
    }
    function caneta(x, y) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.55);
      ctx.fillStyle = 'rgba(28,23,20,0.25)'; ctx.fillRect(10, -250, 44, 230);
      ctx.fillStyle = COR.begeEscuro; ctx.beginPath(); ctx.moveTo(-20, -60); ctx.lineTo(0, 0); ctx.lineTo(20, -60); ctx.fill();
      ctx.fillStyle = TINTA; ctx.beginPath(); ctx.moveTo(-6, -18); ctx.lineTo(0, 0); ctx.lineTo(6, -18); ctx.fill();
      ctx.fillStyle = AMA; ctx.fillRect(-20, -300, 40, 240);
      ctx.fillStyle = COR.vermelhoEscuro; ctx.fillRect(-20, -300, 40, 14);
      ctx.fillStyle = VERM; ctx.fillRect(-20, -350, 40, 50);
      ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.strokeRect(-20, -350, 40, 290);
      ctx.restore();
    }

    // ---- a praça do distrito 1: pilhas de votos, candidatos nos pedestais, urna, eleitores e a lixeira
    function pracaD1() {
      ctx.fillStyle = COR.begeEscuro; ctx.fillRect(0, 1150, 1080, 290);            // chão da praça
      ctx.fillStyle = TINTA; ctx.fillRect(X0, 762, LARG, 4);                        // base das pilhas
      CAND.forEach((c, i) => {
        const n = votosNum(i, t), sobe = i === 2 ? ease.carimbo(seg(t, T.vence, T.vence + 0.4)) * 50 : 0;
        // pilha de cubos (cada um = 5%)
        for (let k = 0; k < n.n; k++) {
          const yAlvo = 760 - (k + 1) * 37, tEnt = n.tEnt(k);
          let x = c.x - 17, y = yAlvo, rot = 0, s = 1, vis = true;
          if (k === 0 && i < 2 && t < tEnt + 0.01 + 0.7 && t >= tEnt - 0.7 && n.primeiro) {   // cubo da Dona Maria / do seu João vem da urna
            const q = seg(t, tEnt - 0.7, tEnt);
            x = lerp(520, c.x - 17, q); y = lerp(1230, yAlvo, q) - Math.sin(q * Math.PI) * 260; rot = q * 6;
          } else y = lerp(yAlvo - 260, yAlvo, ease.saida(seg(t, tEnt, tEnt + 0.3)));
          if (i < 2 && t >= T.lixo) {                                               // para a lixeira
            const t0 = T.lixo + (k + i * 6) * 0.08, q = seg(t, t0, t0 + 0.7);
            x = lerp(c.x - 17, LIX.x - 17, q); y = lerp(yAlvo, LIX.y - 120, q) - Math.sin(q * Math.PI) * 300; rot = q * 7; vis = q < 1;
            s = q > 0.8 ? lerp(1, 0.4, seg(q, 0.8, 1)) : 1;
          }
          if (!vis) continue;
          ctx.save(); ctx.translate(x + 17, y + 17); ctx.rotate(rot); ctx.scale(s, s);
          ctx.fillStyle = TINTA; ctx.fillRect(-17 + 4, -17 + 4, 34, 34);
          ctx.fillStyle = c.cor; ctx.fillRect(-17, -17, 34, 34);
          ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.strokeRect(-17, -17, 34, 34);
          ctx.restore();
        }
        if (n.n > 0 && (t < T.lixo + 0.2 || i === 2)) {
          const eleito = i === 2 && t >= T.vence, yE = 760 - n.n * 37 - 30;
          if (eleito) L.aplicarCarimbo(ctx, seg(t, T.vence, T.vence + 0.3), c.x - 40, yE, () => L.etiqueta(ctx, '40% · ELEITO', c.x - 40, yE, 1, { cor: AMA, corTexto: TINTA, tam: 34 }), 31);
          else L.etiqueta(ctx, Math.round(n.n * 5) + '%', c.x, yE, 1, { cor: BEGE, corTexto: TINTA, tam: 32 });
        }
        // pedestal e candidato
        ctx.fillStyle = TINTA; ctx.fillRect(c.x - 100, 1060 - sobe, 200, 92 + sobe);
        ctx.fillStyle = c.cor; ctx.fillRect(c.x - 90, 1080 - sobe, 180, 44);
        L.texto(ctx, c.nome, c.x, 1111 - sobe, { familia: FONTE.grotesca, peso: 700, tam: tamMax(c.nome, FONTE.grotesca, 24, 700, 168), cor: i === 0 ? TINTA : BEGE, alinhar: 'center' });
        const cabisbaixo = i < 2 ? 0.12 * seg(t, T.lixo + 0.8, T.lixo + 1.4) : 0;
        pessoa(c.x, 1060 - sobe, c.p, 1.15, 0, cabisbaixo);
      });
      // urna eletrônica
      ctx.fillStyle = TINTA; ctx.fillRect(470, 1236, 146, 116);
      ctx.fillStyle = BEGE; ctx.fillRect(462, 1228, 146, 116); ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.strokeRect(462, 1228, 146, 116);
      ctx.fillStyle = TINTA; ctx.fillRect(478, 1246, 64, 44);
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) ctx.fillRect(552 + a * 16, 1250 + b * 16, 11, 11);
      const conf = [T.maria + 0.4, T.joao + 0.4].some(t0 => t >= t0 && t < t0 + 0.6);
      ctx.fillStyle = conf ? AMA : '#3A302A'; ctx.fillRect(482, 1250, 56, 36);
      if (conf) L.texto(ctx, 'FIM', 510, 1278, { familia: FONTE.grotesca, peso: 700, tam: 22, cor: TINTA, alinhar: 'center' });
      // eleitores: andam até a urna e votam
      [[T.maria, 140, 400, MARIA, 'DONA MARIA', AMA], [T.joao, 960, 690, JOAO, 'SEU JOÃO', VERM]].forEach(([t0, x0, x1, p, nome, cor]) => {
        if (t >= T.chuva + 0.4) return;
        const a = seg(t, t0 - 1.2, t0), x = lerp(x0, x1, a);
        pessoa(x, 1420, p, 1.0, a > 0 && a < 1 ? a * 8 : 0);
        L.etiqueta(ctx, nome, x, 1180, seg(t, t0 - 0.4, t0) * (1 - seg(t, T.chuva, T.chuva + 0.3)), { cor, corTexto: cor === AMA ? TINTA : BEGE, tam: 30 });
        const q = seg(t, t0, t0 + 0.4);                                          // a cédula entra na urna
        if (q > 0 && q < 1) cedula(lerp(x + (x1 < 540 ? 50 : -50), 535, q), lerp(1260, 1225, q), 0, 0.3);
      });
      // o povo do distrito
      POVO.forEach(([x, p], k) => {
        const a = ease.saida(seg(t, T.chuva - 0.4 + k * 0.08, T.chuva + 0.2 + k * 0.08));
        if (a > 0) pessoa(x, lerp(1560, 1440, a), p, 0.62);
      });
      // a lixeira entra pela direita e abre
      if (t >= T.lixo - 0.6) {
        const e = ease.saida(seg(t, T.lixo - 0.6, T.lixo - 0.2)), tampa = clamp(Math.sin(Math.PI * seg(t, T.lixo - 0.2, T.lixo + 2.0)) * 1.4);
        lixeira2d(lerp(1260, LIX.x, e), LIX.y, 0.62, tampa);
      }
      if (t >= T.lixoTxt)
        L.aplicarCarimbo(ctx, seg(t, T.lixoTxt, T.lixoTxt + 0.3), CX, 1330, () => {
          ctx.fillStyle = TINTA; ctx.fillRect(X0, 1262, LARG, 132);
          L.texto(ctx, '60% DOS VOTOS → LIXO', CX, 1352, { familia: FONTE.bloco, peso: 400, tam: tamMax('60% DOS VOTOS → LIXO', FONTE.bloco, 70, 400, 780), cor: BEGE, alinhar: 'center' });
        }, 33);
    }

    // ---- boneco de cartaz: pernas, tronco, braços, cabeça e cabelo/acessório (pés em x, y)
    function pessoa(x, y, p, esc = 1, passo = 0, incl = 0) {
      ctx.save(); ctx.translate(x, y); ctx.scale(esc, esc); ctx.rotate(incl);
      const sw = Math.sin(passo * Math.PI) * 12, quica = Math.abs(Math.sin(passo * Math.PI)) * 6;
      ctx.translate(0, -quica);
      ctx.lineWidth = 4; ctx.strokeStyle = TINTA; ctx.lineJoin = 'round';
      ctx.fillStyle = p.calca || TINTA; ctx.fillRect(-22 + sw, -72, 18, 72); ctx.fillRect(4 - sw, -72, 18, 72);
      ctx.fillStyle = p.roupa;                                                       // tronco
      ctx.beginPath(); ctx.moveTo(-36, -150); ctx.lineTo(36, -150); ctx.lineTo(46, -66); ctx.lineTo(-46, -66); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillRect(-56, -146, 18, 72); ctx.strokeRect(-56, -146, 18, 72); ctx.fillRect(38, -146, 18, 72); ctx.strokeRect(38, -146, 18, 72);
      ctx.fillStyle = p.pele; ctx.beginPath(); ctx.arc(-47, -68, 9, 0, 7); ctx.arc(47, -68, 9, 0, 7); ctx.fill();
      if (p.tipo === 'terno') {                                                     // lapelas e gravata
        ctx.fillStyle = BEGE; ctx.beginPath(); ctx.moveTo(-14, -150); ctx.lineTo(0, -118); ctx.lineTo(14, -150); ctx.fill();
        ctx.fillStyle = VERM; ctx.fillRect(-5, -142, 10, 50);
      }
      if (p.tipo === 'longo') { ctx.fillStyle = p.cabelo; ctx.fillRect(-32, -206, 64, 64); }
      ctx.fillStyle = p.pele; ctx.beginPath(); ctx.arc(0, -184, 30, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = p.cabelo || TINTA;
      if (p.tipo === 'coque') { ctx.beginPath(); ctx.arc(0, -190, 31, Math.PI, 0); ctx.fill(); ctx.beginPath(); ctx.arc(0, -224, 15, 0, 7); ctx.fill(); }
      else if (p.tipo === 'bone') { ctx.fillRect(-31, -216, 62, 22); ctx.fillRect(0, -198, 46, 8); ctx.fillStyle = TINTA; ctx.fillRect(-14, -170, 28, 7); }
      else { ctx.beginPath(); ctx.arc(0, -190, 31, Math.PI, 0); ctx.fill(); }
      if (p.tipo === 'longo') { ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-11, -182, 8, 0, 7); ctx.moveTo(19, -182); ctx.arc(11, -182, 8, 0, 7); ctx.stroke(); }
      ctx.fillStyle = TINTA; if (p.tipo !== 'longo') { ctx.fillRect(-12, -186, 6, 6); ctx.fillRect(6, -186, 6, 6); }
      ctx.restore();
    }

    // ------------------------------------------------ E2. a Câmara hoje e a simulação (ARQUIVO)
    function bancada(lt) {
      L.fundo(ctx, BEGE);
      const sim = t >= T.sim;
      titulo(sim ? 'COM OS MESMOS VOTOS DE 2026' : 'A CÂMARA HOJE', sim ? seg(t, T.sim, T.sim + 0.6) : seg(lt, 0.1, 0.7));
      cred(sim ? 'simulação: Ranking dos Políticos (30/10/2026), distrital misto compensatório' : 'resultado de 2026 · fonte: CNN Brasil · Exame · DIAP',
        sim ? seg(t, T.sim + 0.2, T.sim + 0.9) : seg(lt, 0.3, 1.0));
      if (!sim || t < T.sim + 0.4) {
        // hemiciclo de 513 cadeiras: PL (121) em azul à direita, federação PT-PCdoB-PV (88) em vermelho à esquerda
        const sai = ease.entrada(seg(t, T.sim, T.sim + 0.4));
        ctx.save(); ctx.translate(-sai * 1200, 0);
        const p = seg(lt, 0.2, 1.6);
        CADEIRAS.forEach(([x, y, k], i) => {
          if (i / CADEIRAS.length > p) return;
          ctx.fillStyle = k === 'pl' ? AZUL : k === 'pt' ? VERM : 'rgba(28,23,20,0.28)';
          ctx.beginPath(); ctx.arc(x, y, 10.5, 0, 7); ctx.fill();
        });
        ctx.globalAlpha = seg(lt, 1.2, 1.6);
        L.texto(ctx, '513', CX, 980, { familia: FONTE.manchete, peso: 900, tam: 120, cor: TINTA, alinhar: 'center' });
        L.texto(ctx, 'DEPUTADOS', CX, 1030, { familia: FONTE.grotesca, peso: 700, tam: 32, cor: TINTA, alinhar: 'center', tracking: 4 });
        ctx.globalAlpha = 1;
        if (lt > 1.8) {
          L.aplicarCarimbo(ctx, seg(lt, 1.8, 2.1), CX, 1180, () => {
            ctx.fillStyle = AZUL; ctx.fillRect(X0, 1110, LARG, 150);
            L.texto(ctx, 'PL: 121 DEPUTADOS', CX, 1185, { familia: FONTE.bloco, peso: 400, tam: tamMax('PL: 121 DEPUTADOS', FONTE.bloco, 70, 400, 760), cor: BEGE, alinhar: 'center' });
            L.texto(ctx, 'A MAIOR BANCADA · 23,6% DA CÂMARA', CX, 1236, { familia: FONTE.grotesca, peso: 700, tam: 28, cor: AMA, alinhar: 'center' });
          }, 61);
          selo('PL', 890, 570, AZUL, BEGE, seg(lt, 2.0, 2.3), 1.3);
          L.etiqueta(ctx, 'PT · PCdoB · PV: 88', 300, 1320, seg(lt, 2.6, 2.9), { cor: VERM, tam: 34 });
        }
        ctx.restore();
      }
      if (sim) {
        const e = ease.saida(seg(t, T.sim + 0.2, T.sim + 0.7));
        ctx.save(); ctx.translate((1 - e) * 1200, 0);
        // duas linhas de barras: antes (proporcional, real) → depois (simulação)
        const LIN = [['PL', AZUL, 121, 125, [['PL', AZUL, BEGE]]], ['PT · PCdoB · PV', VERM, 88, 80, [['PT', VERM, BEGE], ['PCdoB', COR.vermelhoEscuro, BEGE], ['PV', AMA, TINTA]]]];
        LIN.forEach(([nome, cor, a, b, selos], i) => {
          const B = [T.barPL, T.barPT][i], y0 = 520 + i * 420, q = ease.saida(seg(t, B, B + 1.0)), v = Math.round(lerp(a, b, q));
          selos.forEach(([s, c1, c2], j) => selo(s, X0 + 66 + j * 136, y0 + 6, c1, c2, seg(t, B - 0.4 + j * 0.12, B - 0.1 + j * 0.12), selos.length > 1 ? 1.08 : 1.15));
          L.texto(ctx, nome, X0 + (selos.length > 1 ? 440 : 160), y0 + 40, { familia: FONTE.grotesca, peso: 700, tam: 40, cor: TINTA });
          const W = v / 130 * LARG;
          ctx.fillStyle = 'rgba(28,23,20,0.25)'; ctx.fillRect(X0 + 8, y0 + 98, a / 130 * LARG, 90);
          ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.strokeRect(X0, y0 + 90, a / 130 * LARG, 90); ctx.setLineDash([]);
          ctx.fillStyle = cor; ctx.fillRect(X0, y0 + 90, W, 90);
          L.texto(ctx, String(v), X0 + W - 20, y0 + 160, { familia: FONTE.manchete, peso: 900, tam: 76, cor: cor === AMA ? TINTA : BEGE, alinhar: 'right' });
          L.texto(ctx, `hoje: ${a}`, X0, y0 + 230, { familia: FONTE.maquina, peso: 400, tam: 30, cor: TINTA });
          if (q >= 1) L.aplicarCarimbo(ctx, seg(t, B + 1.0, B + 1.3), X0 + LARG - 150, y0 + 225, () =>
            L.etiqueta(ctx, b > a ? `+${b - a}` : `−${a - b} CADEIRAS`, X0 + LARG - 150, y0 + 225, 1, { cor: b > a ? AZUL : VERM, tam: 40 }), 63 + i);
        });
        if (t >= T.mesmo) L.aplicarCarimbo(ctx, seg(t, T.mesmo, T.mesmo + 0.3), CX, 1360, () => {
          ctx.fillStyle = TINTA; ctx.fillRect(X0, 1300, LARG, 116);
          L.texto(ctx, 'O MESMO VOTO, MENOS VAGAS', CX, 1380, { familia: FONTE.bloco, peso: 400, tam: tamMax('O MESMO VOTO, MENOS VAGAS', FONTE.bloco, 60, 400, 780), cor: BEGE, alinhar: 'center' });
        }, 66);
        ctx.restore();
      }
    }
    // logo do partido (arquivo enviado pelo autor) em placa quadrada com sombra chapada; sem arquivo, selo com a sigla
    function selo(sigla, x, y, cor, corTexto, p, esc = 1) {
      if (p <= 0) return;
      const img = L.img['logo_' + sigla.toLowerCase()], k = esc * lerp(0.5, 1, ease.carimbo(p)), m = 56;
      ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.globalAlpha = clamp(p * 3);
      ctx.fillStyle = TINTA; ctx.fillRect(-m + 6, -m + 6, 2 * m, 2 * m);
      if (img) ctx.drawImage(img, -m, -m, 2 * m, 2 * m);
      else { ctx.fillStyle = cor; ctx.fillRect(-m, -m, 2 * m, 2 * m); L.texto(ctx, sigla, 0, 13, { familia: FONTE.bloco, peso: 400, tam: 36, cor: corTexto, alinhar: 'center' }); }
      ctx.strokeStyle = BEGE; ctx.lineWidth = 4; ctx.strokeRect(-m, -m, 2 * m, 2 * m);
      ctx.restore();
    }

    // ------------------------------------------------ F. distritão (ARQUIVO)
    function distritao(lt) {
      L.fundo(ctx, BEGE);
      titulo('E NA TRANSIÇÃO, EM 2030?', seg(lt, 0.1, 0.7));
      cred('fonte: Agência Câmara (19/09/2017 e 11/08/2021) · CartaCapital · CNN Brasil', seg(lt, 0.3, 1.0));
      const sobe = ease.saida(seg(lt, 0, 0.5));
      ctx.save(); ctx.translate(0, (1 - sobe) * 500);
      ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(X0 + 14, 450, LARG, 900);
      ctx.fillStyle = COR.begeEscuro; ctx.fillRect(X0, 436, LARG, 900);
      L.texto(ctx, 'NA MESA:', X0 + 44, 520, { familia: FONTE.sub, peso: 600, tam: 44, cor: VERM, tracking: 3 });
      L.texto(ctx, 'DISTRITÃO', CX, 690, { familia: FONTE.manchete, peso: 900, tam: tamMax('DISTRITÃO', FONTE.manchete, 220, 900, 760), cor: TINTA, alinhar: 'center' });
      const s1 = 'só os mais votados do estado', s2 = 'o voto no partido não conta';
      L.texto(ctx, L.datilografar(s1, seg(lt, 0.5, 1.1)), CX, 790, { familia: FONTE.maquina, peso: 400, tam: 40, cor: TINTA, alinhar: 'center' });
      L.texto(ctx, L.datilografar(s2, seg(lt, 0.9, 1.5)), CX, 846, { familia: FONTE.maquina, peso: 400, tam: 40, cor: TINTA, alinhar: 'center' });
      ctx.restore();
      [[T.rej1, 'REJEITADO · 2017', '238 × 205 (precisava de 308)', 1010, -0.08, 41], [T.rej2, 'REJEITADO · 2021', '423 × 35', 1210, 0.06, 43]].forEach(([t0, a, b, y, rot, seed]) =>
        L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), CX, y, () => {
          ctx.save(); ctx.translate(CX, y); ctx.rotate(rot);
          ctx.strokeStyle = VERM; ctx.lineWidth = 9; ctx.strokeRect(-330, -80, 660, 160); ctx.lineWidth = 3; ctx.strokeRect(-316, -66, 632, 132);
          L.texto(ctx, a, 0, -2, { familia: FONTE.bloco, peso: 400, tam: 62, cor: VERM, alinhar: 'center' });
          L.texto(ctx, b, 0, 48, { familia: FONTE.grotesca, peso: 700, tam: 32, cor: VERM, alinhar: 'center' });
          ctx.restore();
        }, seed));
    }

    // ------------------------------------------------ G. fecho (CARTAZ)
    function fecho(lt) {
      arquivo = false;
      L.fundo(ctx, VERM);
      L.raios(ctx, CX, 1560, 2600, 20, -0.3 + L.emDois(t) * 0.05, 'rgba(237,224,196,0.13)');
      ctx.fillStyle = COR.vermelhoEscuro; ctx.beginPath(); ctx.arc(CX, 1560, 330, Math.PI, 0); ctx.fill();
      carimbar('ISSO NÃO É', 560, T.reforma + 0.1, BEGE, 96, FONTE.bloco, 51);
      carimbar('REFORMA.', 760, T.reforma + 0.3, AMA, 240, FONTE.manchete, 52, { erro: COR.vermelhoEscuro, desloc: 8 });
      if (t >= T.jogada) {
        const pe = ease.saida(seg(t, T.jogada, T.jogada + 0.3));
        ctx.save(); ctx.translate(CX, 990); ctx.rotate(-7 * Math.PI / 180);
        ctx.fillStyle = COR.carvao; ctx.fillRect(-760 + (1 - pe) * -1500 + 10, -108, 1520, 230);
        ctx.fillStyle = TINTA; ctx.fillRect(-760 + (1 - pe) * -1500, -118, 1520, 230); ctx.restore();
        L.aplicarCarimbo(ctx, seg(t, T.jogada + 0.15, T.jogada + 0.45), CX, 990, () => {
          ctx.save(); ctx.translate(CX, 990); ctx.rotate(-7 * Math.PI / 180);
          L.texto(ctx, 'É JOGADA.', 0, 60, { familia: FONTE.manchete, peso: 900, tam: tamMax('É JOGADA.', FONTE.manchete, 190, 900, 800), cor: BEGE, alinhar: 'center', erro: VERM, desloc: 6 });
          ctx.restore();
        }, 53);
      }
      if (t >= T.nao) carimbar('NÃO AO VOTO DISTRITAL.', 1250, T.nao, BEGE, 70, FONTE.bloco, 55, { larg: 860 });
    }

    // ------------------------------------------------ H. logo e créditos
    function final(lt) {
      L.fundo(ctx, BEGE); arquivo = false;
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 780, () => L.imagem(ctx, L.img.logo, CX, 780, 780), 97);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.6, 1.2);
      [['Print: Agência Câmara de Notícias (28/10/2026) · Simulação: Ranking dos Políticos', 1110],
        ['Foto: Lula Marques/Agência Brasil (CC BY 3.0 BR)', 1150],
        ['Fontes: Agência Câmara · CartaCapital · CNN Brasil · Metrópoles', 1200],
        ['Alma Preta · Congresso em Foco · InfoMoney', 1240],
        ['Logotipos: PL, PT, PCdoB e PV (marcas dos partidos)', 1290],
        ['Vila Exemplo: exemplo ilustrativo, personagens fictícios', 1330]].forEach(([s2, y]) =>
        L.texto(ctx, s2, CX, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(s2, FONTE.maquina, 24, 400), cor: TINTA, alinhar: 'center' }));
      ctx.restore();
    }
  },
};

// ======================================================================
// Vila Exemplo (2D): casas do mapa, candidatos, eleitores e quem fica de fora
// ======================================================================
const _C = { bege: '#EDE0C4', begeE: '#D6C29A', verm: '#C8201E', vermE: '#8A1411', ama: '#EBB52A', azul: '#1F3A5F', tinta: '#1C1714' };
const PELE = ['#C68E5E', '#8A5A3A', '#5E3B26', '#E0B48A'];
const CASAS = (() => {
  let s = 42; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296), out = [];
  for (let y = 520; y <= 1390; y += 64) for (let x = 160; x <= 930; x += 66) {
    if ([600, 920, 1240].some(v => Math.abs(y - 10 - v) < 26) || Math.abs(x - 540) < 30 || r() < 0.2) continue;
    out.push([x + (r() - 0.5) * 10, y, [_C.verm, _C.ama, _C.tinta, _C.vermE][Math.floor(r() * 4)], 26 + Math.floor(r() * 16)]);
  }
  return out;
})();
const CAND = [
  { nome: 'PROFESSORA', x: 270, cor: _C.ama, p: { roupa: _C.ama, pele: PELE[1], cabelo: _C.tinta, tipo: 'longo' } },
  { nome: 'LÍDER COMUNITÁRIO', x: 540, cor: _C.verm, p: { roupa: _C.verm, pele: PELE[2], tipo: 'curto' } },
  { nome: 'EMPRESÁRIO', x: 810, cor: _C.azul, p: { roupa: _C.azul, pele: PELE[3], cabelo: '#8C7A5E', tipo: 'terno', calca: _C.azul } },
];
const MARIA = { roupa: _C.verm, pele: PELE[0], cabelo: '#B9B2A4', tipo: 'coque', calca: _C.vermE };
const JOAO = { roupa: _C.ama, pele: PELE[2], cabelo: _C.azul, tipo: 'bone' };
const POVO = Array.from({ length: 13 }, (_, k) => [120 + k * 70, { roupa: [_C.verm, _C.ama, _C.azul, _C.begeE, _C.tinta][k % 5], pele: PELE[k % 4],
  tipo: ['curto', 'coque', 'bone', 'longo'][k % 4], cabelo: k % 3 ? _C.tinta : '#B9B2A4' }]);
const FORA_X = [250, 440, 640, 830];
const FORA = [{ roupa: _C.verm, pele: PELE[1], tipo: 'longo', cabelo: _C.tinta }, { roupa: _C.begeE, pele: PELE[2], tipo: 'curto' },
  { roupa: _C.ama, pele: PELE[0], tipo: 'bone', cabelo: _C.verm }, { roupa: _C.azul, pele: PELE[3], tipo: 'coque', cabelo: _C.tinta }];
const LIX = { x: 930, y: 1330 };

function votosNum(i, t) {
  const total = [6, 6, 8][i], primeiro = [T.maria + 1.6, T.joao + 1.6, null][i];
  const pc = window.CT.seg(t, T.chuva, T.conta);
  const nChuva = Math.floor(1e-6 + pc * total);
  const n = Math.min(total, Math.max(primeiro !== null && t >= primeiro - 0.7 ? 1 : 0, nChuva));
  const tEnt = kk => (kk === 0 && primeiro !== null) ? primeiro : T.chuva + (kk + 1) / total * (T.conta - T.chuva) - 0.02;
  return { n, tEnt, primeiro: primeiro !== null };
}

// hemiciclo: 513 cadeiras em 10 fileiras; da esquerda para a direita: federação PT-PCdoB-PV (88), outros, PL (121)
const CADEIRAS = (() => {
  const fil = 10, r0 = 150, dr = 31, cx = 540, cy = 1010, raios = Array.from({ length: fil }, (_, i) => r0 + i * dr);
  const soma = raios.reduce((a, b) => a + b, 0); let resto = 513; const pts = [];
  raios.forEach((r, i) => {
    const n = i === fil - 1 ? resto : Math.round(513 * r / soma); resto -= n;
    for (let k = 0; k < n; k++) { const a = Math.PI - Math.PI * (k + 0.5) / n; pts.push([cx + r * Math.cos(a) * 1.0, cy - r * Math.sin(a), a]); }
  });
  pts.sort((p, q) => q[2] - p[2]);                     // da esquerda (ângulo π) para a direita (0)
  return pts.map(([x, y], i) => [x, y, i < 88 ? 'pt' : i >= 513 - 121 ? 'pl' : 'outro']);
})();
