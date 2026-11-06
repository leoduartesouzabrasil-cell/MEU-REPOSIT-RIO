// "QUEM DISSE ISSO? A BÍBLIA OU O COMUNISMO?" — jogo de adivinhação. Roteiro: roteiros/comunismo-biblia.md (v3)
// Seis frases que muita gente chamaria de "coisa de comunista": quatro estão na Bíblia; Che e Marx entram para confundir;
// a última está nos dois (2 Tessalonicenses 3:10 e Lênin, 1917). Resposta bíblica = Jesus com brilho divino e a Bíblia flutuando;
// resposta comunista = foto grande em moldura. Versão de até 1:20.
// Cada rodada (ARQUIVO): ficha datilografada SEM autor → "BÍBLIA OU COMUNISTA?" com contagem 3-2-1 → resposta carimbada com a fonte.
// Os tempos vêm de comunismo-biblia.tempos.js (audio/comunismo-biblia/montar.py).
//
// DIAGRAMAÇÃO PADRÃO: título y 330 · fonte dos dados y 384 · conteúdo x 120–960, y 420–1420 · legenda (tarja) y 1466–1542
const T = Object.assign({
  desafio: 1.4, vamos: 4.7,
  r1: 5.9, q1: 7.4, f1: 11.7, a1: 14.3, ref1: 14.6, r2: 16.6, q2: 18.2, f2: 21.5, a2: 22.6, ref2: 22.7,
  r3: 23.4, q3: 24.3, f3: 31.2, a3: 33.1, ref3: 33.5, r4: 36.1, q4: 37.7, f4: 42.3, a4: 43.4, ref4: 43.6,
  r5: 44.3, q5: 44.6, f5: 50.1, a5: 51.2, ref5: 52.5, r6: 55.0, q6: 56.5, f6: 58.1, a6: 59.4, ref6: 60.4, lenin6: 62.9,
  placar: 66.5, proxima: 68.9, lembra: 70.5, acertou: 74.4, logo: 77.2, dur: 80.0,
}, (window.TEMPOS || {}).marcas || {});

// abertura: os soquinhos da luta Jesus × Marx ([instante do impacto, quem bate: 'M' Marx, 'J' Jesus, '2' os dois]); iguais em audio/comunismo-biblia/previa.py
const SOCOS = [[2.6, 'M'], [3.8, 'J'], [5.0, 'M'], [6.2, 'J'], [7.4, '2']];

// as rodadas: texto da ficha (o texto da fonte; "[…]" onde a fala encurtou), quem disse e a referência
// (versão de até 1:20: a rodada de Isaías 5:8 e o fecho do Engels saíram; ver roteiros/comunismo-biblia.md)
const RODADAS = [
  { txt: '“O salário dos trabalhadores […] que vocês retiveram com fraude está clamando contra vocês.”', tipo: 'B', ref: 'TIAGO 5:4' },
  { txt: '“O revolucionário verdadeiro é guiado por grandes sentimentos de amor.”', tipo: 'C', nome: 'CHE GUEVARA', obra: ['O socialismo e o homem em Cuba,', '1965'],
    foto: 'che', credFoto: 'foto: Alberto Korda, 1960 · domínio público', zoom: 1.1, dy: 20 },
  { txt: '“Derrubou governantes dos seus tronos, mas exaltou os humildes. Encheu de coisas boas os famintos, mas despediu de mãos vazias os ricos.”', tipo: 'B', ref: 'LUCAS 1:52-53' },
  { txt: '“De cada um segundo as suas capacidades, a cada um segundo as suas necessidades!”', tipo: 'C', nome: 'KARL MARX', obra: ['Crítica do Programa de Gotha,', '1875'],
    foto: 'marx', credFoto: 'foto: J. J. E. Mayall · domínio público', zoom: 1.0, dy: 0 },
  { txt: '“[…] tinham tudo em comum. Vendiam suas propriedades e bens e os distribuíam conforme a necessidade de cada um.”', tipo: 'B', ref: 'ATOS 2:44-45' },
  { txt: '“Quem não trabalha não deve comer.”', tipo: 'AS DUAS', ref: '2 TESSALONICENSES 3:10', nome: 'LÊNIN', obra: ['O Estado e a Revolução,', '1917'],
    foto: 'lenin', credFoto: 'foto: Pavel Zhukov, 1920 · dom. público', zoom: 1.15, dy: 40 },
];

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: T.dur,
  imagens: {
    che: '../midia/comunismo-biblia/che-korda-1960.jpg',        // Alberto Korda, 1960 · domínio público (PD-Cuba)
    marx: '../midia/comunismo-01/marx-recorte.jpg',              // J. J. E. Mayall, 1875 · domínio público
    jesusQuadro: '../midia/comunismo-biblia/jesus-hofmann-1889.jpg', // Heinrich Hofmann, 1889 (detalhe de "Cristo e o jovem rico"), domínio público
    lenin: '../midia/comunismo-02/lenin-1920.jpg',               // Pavel Zhukov, 1920 · domínio público
    logo: '../identidade/marca/o-camarada-vermelho.png',
    rostoJesus: '../midia/comunismo-biblia/rosto-jesus.png',   // rosto recortado da pintura de Hofmann, 1889 (abertura)
    rostoMarx: '../midia/comunismo-biblia/rosto-marx.png',     // rosto recortado da foto de Mayall, 1875 (abertura)
    lufa: '../midia/comunismo-02/coletivo-lufa.png',              // logo do Coletivo Lufã (o vídeo também é do coletivo)
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease, clamp } = L;
    const CX = 540, LARG = 840, X0 = 120, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta, AZUL = COR.azul;
    let arquivo = true;
    const PAINEL = { x: X0, y: 455, w: LARG, h: 535 };   // área da resposta (onde estava a ficha)
    const RING = { topo: 1150, frente: 1335, xt0: 110, xt1: 970, xf0: 30, xf1: 1050 };   // o ringue da abertura
    const MOLD = { w: 300, h: 380, borda: 22 };          // tamanho ÚNICO de todas as molduras de foto/quadro

    // modo CAPA (motor/cenas/capa-comunismo-biblia.js): o ringue do vídeo, parado no soco, com os dois logos no alto
    if (window.CAPA_BIBLIA) { capa(); return; }

    const ordem = [[0, abertura], ...RODADAS.map((_, i) => [T['r' + (i + 1)], lt => rodada(i, lt)]),
      [T.placar, placar], [T.proxima, recado], [T.acertou, acertou], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [0.4, 0.75, 1.65, ...SOCOS.map(([ti]) => ti), ...RODADAS.map((_, i) => T['a' + (i + 1)]), T.lenin6, T.placar + 0.4, T.lembra + 0.6, T.acertou + 0.2, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 10);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();

    [[T.r1, BEGE, -24], ...RODADAS.slice(1).map((_, i) => [T['r' + (i + 2)], BEGE, i % 2 ? -24 : 24]),
      [T.placar, VERM, 24], [T.proxima, VERM, -24], [T.acertou, AMA, -24], [T.logo, BEGE, 24]]
      .forEach(([X, cor, ang]) => L.corteDiagonal(ctx, seg(t, X - 0.4, X), cor, ang));
    if (arquivo) L.varredura(ctx, t, 0.07);
    IMP.forEach(X => L.flash(ctx, t, X, AMA, 0.25, 0.22));
    seloLufa();
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);
    legenda();

    // ------------------------------------------------ componentes padronizados
    // selo discreto do Coletivo Lufã no alto, acima do título (o vídeo também é do coletivo)
    function seloLufa() {
      const y = 228, d = 104;
      ctx.save(); ctx.globalAlpha = 0.92 * seg(t, 0.2, 0.8);
      ctx.fillStyle = BEGE; ctx.beginPath(); ctx.arc(CX, y, d / 2 + 4, 0, 7); ctx.fill();
      L.imagem(ctx, L.img.lufa, CX, y, d);
      ctx.restore();
    }
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
    function carimbar(txt, x, y, t0, cor, tam, familia = FONTE.bloco, seed = 1, o = {}) {
      const peso = familia === FONTE.manchete ? 900 : 400;
      L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), x, y, () =>
        L.texto(ctx, txt, x, y, { familia, peso, tam: tamMax(txt, familia, tam, peso, o.larg || LARG), cor, alinhar: o.alinhar || 'center', ...o }), seed);
    }
    function cartazFundo() {
      arquivo = false;
      L.fundo(ctx, VERM);
      L.raios(ctx, CX, 1560, 2600, 20, -0.3 + L.emDois(t) * 0.05, 'rgba(237,224,196,0.13)');
      ctx.fillStyle = COR.vermelhoEscuro; ctx.beginPath(); ctx.arc(CX, 1560, 330, Math.PI, 0); ctx.fill();
    }
    // quebra o texto em linhas que cabem em `larg`
    function quebrar(txt, familia, tam, larg, peso = 400) {
      L.fonte(ctx, familia, tam, peso);
      const linhas = []; let atual = '';
      txt.split(' ').forEach(p => {
        const tenta = atual ? atual + ' ' + p : p;
        if (ctx.measureText(tenta).width > larg && atual) { linhas.push(atual); atual = p; } else atual = tenta;
      });
      if (atual) linhas.push(atual);
      return linhas;
    }
    // texto datilografado em várias linhas (p = 0..1 do texto inteiro)
    function datilografarLinhas(linhas, p, x, y0, passo, o) {
      const total = linhas.reduce((s, l) => s + l.length, 0); let resta = Math.floor(total * clamp(p));
      linhas.forEach((l, i) => {
        const n = Math.min(l.length, resta); resta -= n;
        if (n > 0) L.texto(ctx, l.slice(0, n), x, y0 + i * passo, o);
      });
    }

    // ------------------------------------------------ os dois botões (BÍBLIA amarelo × COMUNISTA vermelho)
    function botoes(y, estado) {
      // estado: {acende: 'B'|'C'|'AS DUAS'|null, p: 0..1 da resposta}
      const W = 330, H = 110;
      [['B', 'BÍBLIA', AMA, TINTA], ['C', 'COMUNISTA', VERM, BEGE]].forEach(([k, txt, cor, corT]) => {
        const certo = estado.acende === k || estado.acende === 'AS DUAS';
        const p = ease.saida(clamp(estado.p || 0));
        const esc = estado.acende ? (certo ? 1 + 0.08 * p : 1 - 0.08 * p) : 1;
        const alfa = estado.acende && !certo ? 1 - 0.65 * p : 1;
        const x = k === 'B' ? 290 : 790;
        ctx.save(); ctx.globalAlpha = alfa; ctx.translate(x, y); ctx.scale(esc, esc);
        ctx.fillStyle = TINTA; ctx.fillRect(-W / 2 + 8, -H / 2 + 8, W, H);
        ctx.fillStyle = cor; ctx.fillRect(-W / 2, -H / 2, W, H);
        ctx.strokeStyle = TINTA; ctx.lineWidth = certo && estado.acende ? 8 : 4; ctx.strokeRect(-W / 2, -H / 2, W, H);
        L.texto(ctx, txt, 0, 20, { familia: FONTE.bloco, peso: 400, tam: tamMax(txt, FONTE.bloco, 54, 400, W - 40), cor: corT, alinhar: 'center' });
        ctx.restore();
      });
    }
    function contagem(cx, cy, t0, t1) {
      if (t < t0 || t >= t1) return;
      const d = t1 - t0, k = Math.min(3, Math.ceil(3 * (1 - (t - t0) / d))), fase = (3 * (t - t0) / d) % 1;
      ctx.save();
      ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(cx, cy, 58, 0, 7); ctx.fill();
      ctx.strokeStyle = AMA; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, cy, 50, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - fase)); ctx.stroke();
      L.texto(ctx, String(k), cx, cy + 28, { familia: FONTE.manchete, peso: 900, tam: 80, cor: BEGE, alinhar: 'center' });
      ctx.restore();
    }
    // placar: 7 quadradinhos (amarelo = Bíblia, vermelho = comunista, metade/metade = as duas)
    function pontos(y, atual, tam = 34, gap = 50) {
      RODADAS.forEach((r, i) => {
        const x = CX + (i - (RODADAS.length - 1) / 2) * gap, revelado = t >= T['a' + (i + 1)];
        ctx.save(); ctx.translate(x, y);
        if (revelado) {
          if (r.tipo === 'AS DUAS') {
            ctx.fillStyle = AMA; ctx.beginPath(); ctx.moveTo(-tam / 2, -tam / 2); ctx.lineTo(tam / 2, -tam / 2); ctx.lineTo(-tam / 2, tam / 2); ctx.fill();
            ctx.fillStyle = VERM; ctx.beginPath(); ctx.moveTo(tam / 2, -tam / 2); ctx.lineTo(tam / 2, tam / 2); ctx.lineTo(-tam / 2, tam / 2); ctx.fill();
          } else { ctx.fillStyle = r.tipo === 'B' ? AMA : VERM; ctx.fillRect(-tam / 2, -tam / 2, tam, tam); }
        }
        ctx.strokeStyle = TINTA; ctx.lineWidth = i === atual ? 5 : 2.5; ctx.strokeRect(-tam / 2, -tam / 2, tam, tam);
        ctx.restore();
      });
    }

    // ------------------------------------------------ 0. abertura (CARTAZ): QUEM DISSE ISSO? + a "luta" Jesus × Marx (brincadeira)
    // Dois bonecos de cartaz (Jesus de túnica e manto; Marx de terno) com o ROSTO recortado das imagens (cabeção, estilo caricatura),
    // em guarda, trocando soquinhos (SOCOS: [instante do impacto, quem bate]) com "POW!" a cada pancada; um X no meio.
    function abertura(lt) {
      // fundo amarelo (cartaz) com raios vermelhos bem suaves; título em preto e vermelho
      arquivo = false;
      L.fundo(ctx, AMA);
      L.raios(ctx, CX, 1100, 2600, 22, -0.3 + L.emDois(t) * 0.05, 'rgba(200,32,30,0.10)');
      carimbar('QUEM DISSE', CX, 420, 0.4, TINTA, 130, FONTE.manchete, 1, { erro: VERM, desloc: 5 });
      carimbar('ISSO?', CX, 575, 0.75, VERM, 180, FONTE.manchete, 2, { erro: TINTA, desloc: 8 });
      const chao = 1300, entra = ease.saida(seg(t, 1.0, 1.6));
      ringueFundo();
      carimbar('X', CX, 860, 1.65, VERM, 230, FONTE.manchete, 3, { erro: TINTA, desloc: 9, larg: 300 });
      const soco = quem => SOCOS.reduce((m, [ti, q]) => (q === quem || q === '2') ? Math.max(m, pulsoSoco(ti)) : m, 0);
      const levou = quem => SOCOS.reduce((m, [ti, q]) => (q !== quem && q !== '2') ? Math.max(m, pulsoLevou(ti)) : m, 0);
      ctx.fillStyle = 'rgba(28,23,20,0.22)';
      [300, 780].forEach(x => { ctx.beginPath(); ctx.ellipse(x, chao + 4, 110, 16, 0, 0, 7); ctx.fill(); });
      boneco({ x: 300 - (1 - entra) * 700, y: chao, lado: +1, roupa: 'tunica', rosto: L.img.rostoJesus, soco: soco('J'), levou: levou('J'), fase: 0 });
      boneco({ x: 780 + (1 - entra) * 700, y: chao, lado: -1, roupa: 'terno', rosto: L.img.rostoMarx, soco: soco('M'), levou: levou('M'), fase: 1.7 });
      ringueFrente();
      SOCOS.forEach(([ti, q], n) => {
        const p = seg(t, ti, ti + 0.45);
        if (p <= 0 || p >= 1) return;
        const x = q === '2' ? CX : q === 'M' ? 350 : 730, y = q === '2' ? 900 : 820;
        pow(x, y, ['POW!', 'PÁ!', 'TUM!', 'PLAFT!', 'BUM!'][n % 5], p, n);
      });
      // as plaquinhas na saia do ringue: BÍBLIA × COMUNISMO
      if (t >= 1.8) {
        ctx.save(); ctx.globalAlpha = seg(t, 1.8, 2.1);
        [[300, 'BÍBLIA', AMA, TINTA], [780, 'COMUNISMO', BEGE, VERM]].forEach(([x, txt, cor, corT]) => {
          ctx.fillStyle = cor; ctx.fillRect(x - 140, 1355, 280, 72);
          ctx.strokeStyle = TINTA; ctx.lineWidth = 5; ctx.strokeRect(x - 140, 1355, 280, 72);
          L.texto(ctx, txt, x, 1406, { familia: FONTE.bloco, peso: 400, tam: tamMax(txt, FONTE.bloco, 44, 400, 250), cor: corT, alinhar: 'center' });
        });
        ctx.restore();
      }
    }
    // o ringue: lona, postes, cantos azul × vermelho e cordas (as de trás aqui; as da frente em ringueFrente, por cima dos bonecos)
    function cordas(x0, x1, ys, y0, y1) {
      ys.forEach((dy, i) => {
        const ya = y0 + dy, yb = y1 + dy;
        ctx.strokeStyle = TINTA; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(x0, ya); ctx.lineTo(x1, yb); ctx.stroke();
        ctx.strokeStyle = i === 1 ? VERM : BEGE; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x0, ya); ctx.lineTo(x1, yb); ctx.stroke();
      });
    }
    function poste(x, y0, y1, corCanto, w = 22) {
      ctx.fillStyle = '#B8B2A6'; ctx.fillRect(x - w / 2, y0, w, y1 - y0); ctx.strokeStyle = TINTA; ctx.lineWidth = 5; ctx.strokeRect(x - w / 2, y0, w, y1 - y0);
      ctx.fillStyle = corCanto; ctx.fillRect(x - w, y0 + 10, w * 2, (y1 - y0) * 0.55); ctx.strokeRect(x - w, y0 + 10, w * 2, (y1 - y0) * 0.55);
    }
    function ringueFundo() {
      const R = RING;
      // lona (trapézio em perspectiva) e saia do ringue
      ctx.lineWidth = 6; ctx.strokeStyle = TINTA;
      ctx.fillStyle = '#F2E8D0';
      ctx.beginPath(); ctx.moveTo(R.xt0, R.topo); ctx.lineTo(R.xt1, R.topo); ctx.lineTo(R.xf1, R.frente); ctx.lineTo(R.xf0, R.frente); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(28,23,20,0.06)'; for (let i = 1; i < 6; i++) { const y = lerp(R.topo, R.frente, i / 6); ctx.fillRect(lerp(R.xt0, R.xf0, i / 6), y, lerp(R.xt1, R.xf1, i / 6) - lerp(R.xt0, R.xf0, i / 6), 2); }
      ctx.fillStyle = VERM; ctx.fillRect(R.xf0, R.frente, R.xf1 - R.xf0, 110); ctx.strokeRect(R.xf0, R.frente, R.xf1 - R.xf0, 110);
      ctx.fillStyle = COR.vermelhoEscuro; ctx.fillRect(R.xf0, R.frente + 96, R.xf1 - R.xf0, 14);
      // postes de trás (canto azul à esquerda, vermelho à direita) e cordas de trás
      poste(R.xt0, R.topo - 270, R.topo, AZUL, 18); poste(R.xt1, R.topo - 270, R.topo, VERM, 18);
      cordas(R.xt0, R.xt1, [-230, -160, -90], R.topo, R.topo);
      cordas(R.xt0, R.xf0, [-230, -160, -90], R.topo, R.frente);       // laterais
      cordas(R.xt1, R.xf1, [-230, -160, -90], R.topo, R.frente);
    }
    function ringueFrente() {
      const R = RING;
      cordas(R.xf0, R.xf1, [-300, -215, -130], R.frente, R.frente);
      poste(R.xf0, R.frente - 330, R.frente, AZUL); poste(R.xf1, R.frente - 330, R.frente, VERM);
    }
    function capa() {
      arquivo = false;
      L.fundo(ctx, AMA);
      L.raios(ctx, CX, 1250, 2600, 22, -0.3, 'rgba(200,32,30,0.10)');
      // os dois logos no alto, lado a lado e centralizados (dentro do recorte 3:4 do grid: y 240–1680)
      // (mesmo padrão das outras capas: logo pequeno, centralizado em y 300; aqui os dois lado a lado, sem traço)
      const yl = 322, wOC = 290, dLufa = 106, gap = 70;
      const total = wOC + gap + dLufa, x0 = CX - total / 2;
      L.imagem(ctx, L.img.logo, x0 + wOC / 2, yl, wOC);
      ctx.fillStyle = BEGE; ctx.beginPath(); ctx.arc(x0 + total - dLufa / 2, yl, dLufa / 2 + 3, 0, 7); ctx.fill();
      L.imagem(ctx, L.img.lufa, x0 + total - dLufa / 2, yl, dLufa);
      // o título
      L.texto(ctx, 'QUEM DISSE', CX, 538, { familia: FONTE.manchete, peso: 900, tam: tamMax('QUEM DISSE', FONTE.manchete, 165, 900, 900), cor: TINTA, alinhar: 'center', erro: VERM, desloc: 6 });
      L.texto(ctx, 'ISSO?', CX, 732, { familia: FONTE.manchete, peso: 900, tam: 215, cor: VERM, alinhar: 'center', erro: TINTA, desloc: 9 });
      // o ringue, igual ao da abertura do vídeo, mais para baixo; os dois parados em guarda, com o X no meio
      ctx.save(); ctx.translate(0, 190);
      ringueFundo();
      L.texto(ctx, 'X', CX, 900, { familia: FONTE.manchete, peso: 900, tam: 240, cor: VERM, alinhar: 'center', erro: TINTA, desloc: 9 });
      ctx.fillStyle = 'rgba(28,23,20,0.22)';
      [300, 780].forEach(x => { ctx.beginPath(); ctx.ellipse(x, 1304, 110, 16, 0, 0, 7); ctx.fill(); });
      boneco({ x: 300, y: 1300, lado: +1, roupa: 'tunica', rosto: L.img.rostoJesus, soco: 0, levou: 0, fase: 0 });
      boneco({ x: 780, y: 1300, lado: -1, roupa: 'terno', rosto: L.img.rostoMarx, soco: 0, levou: 0, fase: 0 });
      ringueFrente();
      [[300, 'BÍBLIA', AMA, TINTA], [780, 'COMUNISMO', BEGE, VERM]].forEach(([x, txt, cor, corT]) => {
        ctx.fillStyle = cor; ctx.fillRect(x - 140, 1355, 280, 72);
        ctx.strokeStyle = TINTA; ctx.lineWidth = 5; ctx.strokeRect(x - 140, 1355, 280, 72);
        L.texto(ctx, txt, x, 1406, { familia: FONTE.bloco, peso: 400, tam: tamMax(txt, FONTE.bloco, 44, 400, 250), cor: corT, alinhar: 'center' });
      });
      ctx.restore();
      L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.3);
    }
    function pulsoSoco(ti) {   // 0 → 1 (soco esticado no impacto) → 0
      if (t < ti - 0.2 || t > ti + 0.3) return 0;
      return t < ti ? ease.saida((t - (ti - 0.2)) / 0.2) : 1 - (t - ti) / 0.3;
    }
    function pulsoLevou(ti) { return t < ti || t > ti + 0.5 ? 0 : 1 - (t - ti) / 0.5; }
    // boneco de cartaz com cabeção de foto. o = {x, y (chão), lado (+1 olha p/ direita), roupa: 'tunica'|'terno', rosto, soco, levou, fase}
    function boneco(o) {
      const { lado } = o, pula = Math.abs(Math.sin(t * 7 + o.fase)) * 14;
      const passo = o.soco * 70 * lado - o.levou * 60 * lado;                 // avança no soco, recua quando apanha
      const inclina = (o.soco * 0.08 - o.levou * 0.2) * lado;
      const tunica = o.roupa === 'tunica', PELE = '#D9A57A';
      ctx.save();
      ctx.translate(o.x + passo, o.y - pula);
      ctx.rotate(inclina);
      ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = TINTA; ctx.lineWidth = 6;
      // pernas (base aberta, em guarda)
      if (tunica) {
        ctx.fillStyle = '#8A5A2E';                                           // sandálias
        ctx.fillRect(-58, -16, 46, 16); ctx.strokeRect(-58, -16, 46, 16); ctx.fillRect(14, -16, 46, 16); ctx.strokeRect(14, -16, 46, 16);
        ctx.fillStyle = PELE; ctx.fillRect(-48, -40, 26, 26); ctx.fillRect(22, -40, 26, 26);
      } else {
        ctx.fillStyle = '#1E1B1A';
        ctx.beginPath(); ctx.moveTo(-40, -200); ctx.lineTo(-62, -14); ctx.lineTo(-24, -14); ctx.lineTo(-6, -200); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(40, -200); ctx.lineTo(62, -14); ctx.lineTo(24, -14); ctx.lineTo(6, -200); ctx.fill(); ctx.stroke();
        ctx.fillStyle = TINTA; ctx.beginPath(); ctx.ellipse(-48, -8, 32, 12, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(48, -8, 32, 12, 0, 0, 7); ctx.fill();
      }
      // braço de trás (guarda, perto do queixo)
      braco(-lado * 46, -350, lado * 30, -420, tunica, 0.85);
      // corpo
      if (tunica) {
        ctx.fillStyle = '#EFE6D2';                                           // túnica clara até os pés
        ctx.beginPath(); ctx.moveTo(-62, -385); ctx.lineTo(62, -385); ctx.lineTo(96, -36); ctx.lineTo(-96, -36); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#A3271E';                                           // manto vermelho atravessado
        ctx.beginPath(); ctx.moveTo(-lado * 64, -385); ctx.lineTo(-lado * 20, -385); ctx.lineTo(lado * 94, -60); ctx.lineTo(lado * 40, -36); ctx.lineTo(-lado * 70, -250); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#C9A24A'; ctx.fillRect(-58, -215, 116, 14);          // cordão na cintura
      } else {
        ctx.fillStyle = '#1E1B1A';                                           // paletó
        ctx.beginPath(); ctx.moveTo(-66, -385); ctx.lineTo(66, -385); ctx.lineTo(74, -175); ctx.lineTo(-74, -175); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = BEGE;                                                // camisa
        ctx.beginPath(); ctx.moveTo(-24, -385); ctx.lineTo(24, -385); ctx.lineTo(0, -270); ctx.closePath(); ctx.fill();
        ctx.fillStyle = TINTA; ctx.beginPath(); ctx.moveTo(-18, -372); ctx.lineTo(0, -362); ctx.lineTo(18, -372); ctx.lineTo(18, -352); ctx.lineTo(0, -362); ctx.lineTo(-18, -352); ctx.fill();   // gravata-borboleta
        ctx.strokeStyle = '#4A4440'; ctx.lineWidth = 4;                       // lapelas
        ctx.beginPath(); ctx.moveTo(-26, -385); ctx.lineTo(-6, -262); ctx.moveTo(26, -385); ctx.lineTo(6, -262); ctx.stroke();
        ctx.fillStyle = '#C9A24A'; ctx.beginPath(); ctx.arc(0, -238, 6, 0, 7); ctx.arc(0, -205, 6, 0, 7); ctx.fill();   // botões
        ctx.strokeStyle = TINTA; ctx.lineWidth = 6;
      }
      // pescoço + cabeção (o rosto recortado), balançando quando apanha
      ctx.fillStyle = PELE; ctx.fillRect(-20, -410, 40, 30);
      const img = o.rosto, hw = 250, hh = hw * img.height / img.width;
      ctx.save(); ctx.translate(0, -400); ctx.rotate(-o.levou * 0.35 * lado + Math.sin(t * 9 + o.fase) * 0.03);
      ctx.drawImage(img, -hw / 2, -hh + 30, hw, hh);
      ctx.restore();
      // braço da frente: guarda → soco esticado até o rosto do outro
      const alcance = lerp(0, 330, o.soco);
      braco(lado * 46, -350, lado * (100 + alcance), lerp(-320, -470, o.soco), tunica, 1);
      ctx.restore();
    }
    // braço (manga) do ombro até o punho, com uma luvinha vermelha
    function braco(x0, y0, x1, y1, tunica, s) {
      ctx.save();
      ctx.strokeStyle = TINTA; ctx.lineWidth = 46 * s; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.strokeStyle = tunica ? '#EFE6D2' : '#1E1B1A'; ctx.lineWidth = 36 * s; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.lineWidth = 5; ctx.strokeStyle = TINTA; ctx.fillStyle = VERM;
      ctx.beginPath(); ctx.arc(x1, y1, 34 * s, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = BEGE; ctx.beginPath(); ctx.arc(x1 - Math.sign(x1 - x0 || 1) * 26 * s, y1 + 8, 12 * s, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(x1 + 6, y1 - 12 * s, 12 * s, 7 * s, -0.4, 0, 7); ctx.fill();
      ctx.restore();
    }
    // balão de onomatopeia (estrela amarela com contorno)
    function pow(x, y, txt, p, seed) {
      const esc = p < 0.25 ? ease.saida(p / 0.25) * 1.15 : 1.15 - 0.15 * Math.min(1, (p - 0.25) / 0.2), alfa = p > 0.75 ? 1 - (p - 0.75) / 0.25 : 1;
      const rr = L.rng(seed * 11 + 5);
      ctx.save(); ctx.globalAlpha = alfa; ctx.translate(x, y); ctx.rotate((rr() - 0.5) * 0.5); ctx.scale(esc, esc);
      ctx.beginPath();
      for (let i = 0; i < 24; i++) { const ang = i * Math.PI / 12, r = i % 2 ? 70 + rr() * 10 : 120 + rr() * 25; ctx.lineTo(Math.cos(ang) * r * 1.25, Math.sin(ang) * r); }
      ctx.closePath(); ctx.fillStyle = BEGE; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = TINTA; ctx.stroke();
      L.texto(ctx, txt, 0, 26, { familia: FONTE.manchete, peso: 900, tam: tamMax(txt, FONTE.manchete, 84, 900, 230), cor: VERM, alinhar: 'center', erro: TINTA, desloc: 4 });
      ctx.restore();
    }
    // ------------------------------------------------ 1–6. uma rodada do jogo (ARQUIVO)
    // PAINEL de resposta (onde estava a ficha): Bíblia = Jesus com brilho divino e a Bíblia flutuando; comunista = foto grande em moldura
    function rodada(i, lt) {
      const r = RODADAS[i], k = i + 1, q = T['q' + k], f = T['f' + k], a = T['a' + k], ref = T['ref' + k], ultima = k === RODADAS.length;
      L.fundo(ctx, BEGE);
      titulo(ultima ? 'A ÚLTIMA: BÍBLIA OU COMUNISTA?' : 'BÍBLIA OU COMUNISTA?', seg(lt, 0.05, 0.6));
      cred(`rodada ${k} de ${RODADAS.length}`, seg(lt, 0.2, 0.7));
      pontos(425, i);
      // a ficha com a frase, sem autor (some quando vem a resposta)
      const fy = 500, fh = 440, e = ease.saida(seg(lt, 0, 0.4)), some = seg(t, a, a + 0.35);
      if (some < 1) {
        ctx.save(); ctx.translate(0, (1 - e) * 900 - some * 60); ctx.globalAlpha = 1 - some;
        ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(X0 + 14, fy + 14, LARG, fh);
        ctx.fillStyle = COR.begeEscuro; ctx.fillRect(X0, fy, LARG, fh); ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.strokeRect(X0, fy, LARG, fh);
        ctx.fillStyle = VERM; ctx.fillRect(X0, fy, LARG, 12);
        const tamF = ultima ? 64 : r.txt.length > 120 ? 40 : 46;
        const linhas = quebrar(r.txt, FONTE.maquina, tamF, LARG - 90);
        const passo = tamF * 1.4, y0 = fy + fh / 2 - (linhas.length - 1) * passo / 2 + tamF * 0.35;
        if (t < q) L.texto(ctx, '?', CX, fy + fh / 2 + 70, { familia: FONTE.manchete, peso: 900, tam: 220, cor: 'rgba(28,23,20,0.18)', alinhar: 'center' });
        datilografarLinhas(linhas, seg(t, q, f), ultima ? CX : X0 + 45, y0, passo,
          { familia: FONTE.maquina, peso: 400, tam: tamF, cor: TINTA, alinhar: ultima ? 'center' : 'left' });
        ctx.restore();
      }
      // a resposta no painel
      if (t >= a) {
        // TODAS as molduras com o mesmo tamanho (MOLD): Jesus, Che, Marx e Lênin
        if (r.tipo === 'B') divino(235, a, false);
        if (r.tipo === 'C') fotoGrande(r, CX - MOLD.w / 2, a, true);
        if (r.tipo === 'AS DUAS') { divino(150, a, true); if (t >= T.lenin6) fotoGrande(r, 960 - 22 - 8 - MOLD.w, T.lenin6, false); }
      }
      // os botões + contagem 3-2-1 (entre o fim da frase e a resposta)
      const yb = 1060;
      if (t >= q - 0.2) {
        ctx.save(); ctx.globalAlpha = seg(t, q - 0.2, q + 0.2);
        botoes(yb, t >= a ? { acende: r.tipo, p: seg(t, a, a + 0.3) } : {});
        ctx.restore();
        contagem(CX, yb, f, a);
      }
      // a referência embaixo dos botões
      const yr = 1200;
      if (r.tipo === 'B' && t >= ref) {
        carimbar(r.ref, CX, yr + 100, ref, TINTA, 120, FONTE.bloco, 30 + k, { larg: 780 });
        if (t >= ref + 0.3) {
          ctx.save(); ctx.globalAlpha = seg(t, ref + 0.3, ref + 0.6);
          L.texto(ctx, 'BÍBLIA · tradução NVI', CX, yr + 170, { familia: FONTE.maquina, peso: 400, tam: 28, cor: TINTA, alinhar: 'center' });
          ctx.restore();
        }
      }
      if (r.tipo === 'C' && t >= a + 0.2) {
        carimbar(r.nome, CX, yr + 90, a + 0.2, VERM, 110, FONTE.bloco, 40 + k, { larg: 780 });
        if (t >= a + 0.5) {
          ctx.save(); ctx.globalAlpha = seg(t, a + 0.5, a + 0.8);
          L.texto(ctx, r.obra.join(' '), CX, yr + 160, { familia: FONTE.maquina, peso: 400, tam: tamMax(r.obra.join(' '), FONTE.maquina, 30, 400, 800), cor: TINTA, alinhar: 'center' });
          ctx.restore();
        }
      }
      if (r.tipo === 'AS DUAS') {
        if (t >= a) carimbar('AS DUAS!', CX, yr + 20, a, AMA, 100, FONTE.manchete, 77, { erro: TINTA, desloc: 6, larg: 520 });
        if (t >= ref) {
          carimbar('2 TESSALONICENSES', 330, yr + 110, ref, TINTA, 40, FONTE.bloco, 71, { larg: 400 });
          carimbar('3:10', 330, yr + 185, ref + 0.15, TINTA, 70, FONTE.bloco, 72, { larg: 400 });
        }
        if (t >= T.lenin6) {
          carimbar('LÊNIN', 750, yr + 120, T.lenin6, VERM, 74, FONTE.bloco, 73, { larg: 400 });
          ctx.save(); ctx.globalAlpha = seg(t, T.lenin6 + 0.3, T.lenin6 + 0.6);
          L.texto(ctx, 'O Estado e a Revolução, 1917', 750, yr + 175, { familia: FONTE.maquina, peso: 400, tam: 26, cor: TINTA, alinhar: 'center' });
          ctx.restore();
        }
      }
    }

    // Jesus (pintura de Hofmann, recortada) com brilho divino, auréola, raios de luz, faíscas e a Bíblia flutuando ao lado
    // Jesus num QUADRO de moldura dourada (pintura de Heinrich Hofmann, 1889, em cores), com luz dourada atrás e a Bíblia flutuando ao lado
    // x = canto esquerdo do quadro; compacto = última rodada (Jesus + Bíblia + Lênin lado a lado)
    function divino(x, t0, compacto) {
      const e = ease.saida(seg(t, t0, t0 + 0.5)), P = PAINEL, { w, h, borda } = MOLD, y = P.y + 32 + (1 - e) * 80;
      const bx = compacto ? x + w + borda + 62 : x + w + borda + 150, cx = compacto ? x + w / 2 + 120 : (x + bx) / 2 + w / 4, cy = P.y + P.h * 0.45;
      ctx.save();
      ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip();
      ctx.globalAlpha = clamp(e * 1.5);
      // fundo: luz dourada e raios girando devagar
      ctx.fillStyle = '#F3E3B4'; ctx.fillRect(P.x, P.y, P.w, P.h);
      const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, 560);
      g.addColorStop(0, 'rgba(255,250,230,1)'); g.addColorStop(0.4, 'rgba(250,214,120,0.75)'); g.addColorStop(1, 'rgba(235,181,42,0.15)');
      ctx.fillStyle = g; ctx.fillRect(P.x, P.y, P.w, P.h);
      L.raios(ctx, cx, cy, 900, 28, t * 0.12, 'rgba(255,255,240,0.45)');
      // o quadro, com halo de luz em volta
      ctx.save(); ctx.shadowColor = 'rgba(255,240,180,0.95)'; ctx.shadowBlur = 50;
      ctx.fillStyle = 'rgba(255,240,180,0.9)'; ctx.fillRect(x - borda, y - borda, w + 2 * borda, h + 2 * borda);
      ctx.restore();
      L.moldura(ctx, x, y, w, h, borda);
      fotoCheia(L.img.jesusQuadro, x, y, w, h, { pb: false, zoom: 1.12, dy: 60, desfoque: (1 - seg(t, t0, t0 + 0.5)) * 8 });
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = clamp(e * 1.5) * (0.16 + 0.06 * Math.sin(t * 3));
      const br = ctx.createRadialGradient(x + w * 0.5, y + h * 0.3, 0, x + w * 0.5, y + h * 0.3, 240);
      br.addColorStop(0, 'rgba(255,240,200,0.9)'); br.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.fillStyle = br; ctx.fillRect(x, y, w, h);
      ctx.restore();
      const credJ = 'Jesus · H. Hofmann, 1889 · domínio público';
      L.texto(ctx, credJ, x + w / 2, y + h + borda + 28, { familia: FONTE.maquina, peso: 400, tam: tamMax(credJ, FONTE.maquina, 18, 400, w + 40), cor: TINTA, alinhar: 'center' });
      // a Bíblia flutuando ao lado do quadro
      const by = y + h * 0.5 + Math.sin(t * 2.2) * 14 - (1 - e) * 60;
      biblia(bx, by, compacto ? 0.55 : 0.85, -0.12 + Math.sin(t * 1.3) * 0.05, clamp(e * 1.5));
      // faíscas subindo
      for (let n = 0; n < 16; n++) {
        const rr = L.rng(n * 7 + 3), fase = (t * (0.18 + rr() * 0.2) + rr()) % 1;
        const sx = P.x + rr() * P.w, sy = P.y + P.h - fase * P.h;
        estrelinha(sx, sy, 5 + rr() * 9, Math.sin(fase * Math.PI) * (0.5 + 0.5 * Math.sin(t * 6 + n)));
      }
      ctx.restore();
    }
    // foto que SEMPRE preenche a moldura: escala para cobrir e limita o deslocamento à sobra da imagem (nunca aparece faixa vazia)
    function fotoCheia(img, x, y, w, h, o = {}) {
      const s = Math.max(w / img.width, h / img.height) * (o.zoom || 1);
      const sobraX = (img.width * s - w) / 2, sobraY = (img.height * s - h) / 2;
      L.foto(ctx, img, x, y, w, h, { ...o, dx: clamp(o.dx || 0, -sobraX, sobraX), dy: Math.max(-sobraY, Math.min(sobraY, o.dy || 0)) });
    }
    function biblia(x, y, s, rot, alfa) {
      ctx.save(); ctx.globalAlpha = alfa; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
      const aura = ctx.createRadialGradient(0, 0, 20, 0, 0, 190);
      aura.addColorStop(0, 'rgba(255,248,215,0.9)'); aura.addColorStop(1, 'rgba(255,230,140,0)');
      ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(0, 0, 190, 0, 7); ctx.fill();
      ctx.shadowColor = 'rgba(255,230,140,0.9)'; ctx.shadowBlur = 30;
      ctx.fillStyle = '#E9D9A8'; ctx.fillRect(-82, -112, 172, 236);          // páginas (lombada de folhas)
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#C9A24A'; for (let i = 0; i < 6; i++) ctx.fillRect(84, -104 + i * 38, 4, 30);
      ctx.fillStyle = '#4A1A12'; ctx.fillRect(-92, -120, 172, 236);         // capa de couro
      ctx.fillStyle = '#2E0F0A'; ctx.fillRect(-92, -120, 18, 236);           // lombada
      ctx.strokeStyle = '#D9B24C'; ctx.lineWidth = 4; ctx.strokeRect(-66, -100, 128, 196);
      ctx.fillStyle = '#E8C45C'; ctx.fillRect(-9, -76, 18, 108); ctx.fillRect(-38, -52, 76, 16);   // a cruz dourada
      L.texto(ctx, 'BÍBLIA', -2, 82, { familia: FONTE.sub, peso: 600, tam: 26, cor: '#E8C45C', alinhar: 'center', tracking: 4 });
      ctx.restore();
    }
    function estrelinha(x, y, r, a) {
      if (a <= 0) return;
      ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#FFF6D6'; ctx.translate(x, y);
      ctx.beginPath();
      for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.28 : r, ang = i * Math.PI / 4; ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr); }
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
    // o comunista: foto grande em moldura, com raios de cartaz atrás; crédito logo abaixo da foto
    function fotoGrande(r, x, t0, fundoVermelho) {
      const e = ease.saida(seg(t, t0, t0 + 0.45)), P = PAINEL, { w, h, borda } = MOLD, y = P.y + 32 + (1 - e) * 80;
      ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip();
      ctx.globalAlpha = clamp(e * 1.5);
      if (fundoVermelho) { ctx.fillStyle = VERM; ctx.fillRect(P.x, P.y, P.w, P.h); L.raios(ctx, x + w / 2, P.y + P.h * 0.45, 900, 20, t * 0.08, 'rgba(237,224,196,0.14)'); }
      L.moldura(ctx, x, y, w, h, borda);
      fotoCheia(L.img[r.foto], x, y, w, h, { zoom: r.zoom, dy: r.dy, desfoque: (1 - seg(t, t0, t0 + 0.5)) * 8 });
      L.texto(ctx, r.credFoto, x + w / 2, y + h + borda + 28, { familia: FONTE.maquina, peso: 400, tam: tamMax(r.credFoto, FONTE.maquina, 18, 400, w + 40), cor: fundoVermelho ? BEGE : TINTA, alinhar: 'center' });
      ctx.restore();
    }

    // ------------------------------------------------ 8. placar (CARTAZ)
    function placar(lt) {
      cartazFundo();
      carimbar('PLACAR', CX, 520, T.placar + 0.05, BEGE, 130, FONTE.manchete, 81, { erro: COR.vermelhoEscuro, desloc: 6 });
      const n = Math.round(lerp(0, 4, ease.saida(seg(t, T.placar + 0.4, T.placar + 1.4))));
      const m = Math.round(lerp(0, 2, ease.saida(seg(t, T.placar + 0.4, T.placar + 1.4))));
      L.texto(ctx, String(n), 330, 870, { familia: FONTE.manchete, peso: 900, tam: 320, cor: AMA, alinhar: 'center', erro: TINTA, desloc: 8 });
      L.texto(ctx, '×', CX, 800, { familia: FONTE.manchete, peso: 900, tam: 120, cor: BEGE, alinhar: 'center' });
      L.texto(ctx, String(m), 750, 870, { familia: FONTE.manchete, peso: 900, tam: 320, cor: BEGE, alinhar: 'center', erro: TINTA, desloc: 8 });
      L.texto(ctx, 'NA BÍBLIA', 330, 960, { familia: FONTE.bloco, peso: 400, tam: 46, cor: AMA, alinhar: 'center' });
      L.texto(ctx, 'SÓ DE COMUNISTA', 750, 960, { familia: FONTE.bloco, peso: 400, tam: 40, cor: BEGE, alinhar: 'center' });
      ctx.save(); ctx.translate(0, 0);
      ctx.fillStyle = BEGE; ctx.fillRect(CX - 190, 1040, 380, 90);
      pontos(1085, -1, 40, 58);
      ctx.restore();
      if (t >= T.placar + 1.6) {
        ctx.save(); ctx.globalAlpha = seg(t, T.placar + 1.6, T.placar + 2.0);
        L.texto(ctx, 'de 6 frases · a última está nos dois', CX, 1200, { familia: FONTE.maquina, peso: 400, tam: 30, cor: BEGE, alinhar: 'center' });
        ctx.restore();
      }
    }

    // ------------------------------------------------ 10. o recado (CARTAZ)
    function recado(lt) {
      cartazFundo();
      carimbar('DEFENDER QUEM TRABALHA', CX, 600, T.proxima + 0.1, BEGE, 84, FONTE.bloco, 91);
      carimbar('NÃO É NOVIDADE', CX, 760, T.proxima + 1.2, AMA, 120, FONTE.manchete, 92, { erro: TINTA, desloc: 7 });
      carimbar('JÁ ESTAVA LÁ', CX, 930, T.lembra, BEGE, 100, FONTE.bloco, 93);
      carimbar('MUITO ANTES', CX, 1060, T.lembra + 0.3, AMA, 110, FONTE.manchete, 94, { erro: TINTA, desloc: 7 });
      carimbar('DO MARX', CX, 1190, T.lembra + 0.6, AMA, 110, FONTE.manchete, 95, { erro: TINTA, desloc: 7 });
    }

    // ------------------------------------------------ 11. quantas você acertou? (CARTAZ amarelo)
    function acertou(lt) {
      arquivo = false;
      L.fundo(ctx, AMA);
      L.raios(ctx, CX, 1560, 2600, 20, -0.3 + L.emDois(t) * 0.05, 'rgba(200,32,30,0.12)');
      carimbar('QUANTAS', CX, 640, T.acertou + 0.2, TINTA, 190, FONTE.manchete, 101, { erro: VERM, desloc: 7 });
      carimbar('VOCÊ ACERTOU?', CX, 820, T.acertou + 0.45, VERM, 140, FONTE.manchete, 102, { erro: TINTA, desloc: 7 });
      if (t >= T.acertou + 1.0) {
        ctx.save(); ctx.globalAlpha = seg(t, T.acertou + 1.0, T.acertou + 1.4);
        ctx.fillStyle = TINTA; ctx.fillRect(CX - 300, 960, 600, 110);
        L.texto(ctx, 'COMENTA AÍ ↓', CX, 1036, { familia: FONTE.bloco, peso: 400, tam: 60, cor: AMA, alinhar: 'center' });
        ctx.restore();
      }
    }

    // ------------------------------------------------ 12. logo e créditos
    function final(lt) {
      L.fundo(ctx, BEGE); arquivo = false;
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 760, () => L.imagem(ctx, L.img.logo, CX, 760, 780), 97);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.6, 1.2);
      [['Bíblia: Nova Versão Internacional (NVI) · Tiago 5:4 · Lucas 1:52-53 · Atos 2:44-45 · 2 Tessalonicenses 3:10', 1060],
        ['Che Guevara, O socialismo e o homem em Cuba (1965) · Marx, Crítica do Programa de Gotha (1875)', 1100],
        ['Lênin, O Estado e a Revolução (1917)', 1140],
        ['Imagens (domínio público): Jesus, Heinrich Hofmann (1889) · Che, Alberto Korda (1960)', 1190],
        ['Marx, J. J. E. Mayall · Lênin, Pavel Zhukov (1920)', 1225]]
        .forEach(([s2, y]) => L.texto(ctx, s2, CX, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(s2, FONTE.maquina, 24, 400), cor: TINTA, alinhar: 'center' }));
      ctx.restore();
    }
  },
};
