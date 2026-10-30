// "Não foi golpe. Foi o povo." — a virada de Lula no 2º turno de 2026. PRÉVIA sem narração (tempos estimados).
// Quando a narração chegar, os tempos de T passam a vir de eleicoes-2026.tempos.js (mesmos nomes).
// Render: node motor/render.js eleicoes-2026 saida/eleicoes-2026.mp4 --audio audio/eleicoes-2026/previa.wav
//
// DIAGRAMAÇÃO PADRÃO (vale para todos os blocos):
//   título do bloco ......... y = 330, centralizado, Archivo 700 até 48px (titulo())
//   conteúdo ................ entre y = 420 e y = 1360, centralizado em x = 540, largura máx. 840 (x 120–960)
//   crédito/fonte ........... y = 1440, centralizado, máquina de escrever até 26px (cred())
//   nada importante fora de x 120–960 e y 250–1500 (margem segura do Reels)
const T = Object.assign({
  inicio: 0, turno1: 2.2, mapa: 6.2, mapaVira: 9.4, turno2: 12.0, golpe: 16.0, contas: 18.0,
  outros: 19.5, voltaram: 22.5, brancos: 25.5, total: 28.5, divide: 30.5,
  checklist: 33.5, ck1: 34.3, ck2: 36.6, ck3: 38.9, ck4: 41.2, naoGolpe: 43.0,
  soberania: 44.5, fogo: 45.6, soberano: 48.0,
  povo: 50.0, abst: 50.8, desde2006: 52.6, nordeste: 54.0, rua: 55.6,
  mundo: 58.0, franca: 58.3, espanha: 60.6, cuba: 62.6, china: 64.2, organizado: 65.4,
  acabou: 66.6, mobilizacao: 68.0, logo: 70.0, dur: 73.5,
}, (window.TEMPOS || {}).marcas || {});

const NE = ['MA', 'PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA'];
const LULA_1T = NE.concat(['PA', 'AM', 'AP']);          // 1º turno: Lula em 12 estados
const LULA_2T = LULA_1T.concat(['MG']);                  // 2º turno: Minas virou (13 estados)
// ponto do rosto em cada foto (fração da largura/altura) e zoom, para enquadrar os retratos
const _band = {}, _mont = {};                            // caches: bandeiras desenhadas e cartaz da montagem
const ROSTO = { flavio: [0.46, 0.36, 2.6], lula: [0.64, 0.47, 2.6], trump: [0.5, 0.34, 1.7] };

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: T.dur,
  imagens: {
    flavio: '../midia/eleicoes-2026/flavio-jornalistas.jpg',
    lula: '../midia/eleicoes-2026/lula-paulista.jpg',
    lulaPalco: '../midia/eleicoes-2026/lula-vitoria.jpg',
    trump: '../midia/eleicoes-2026/trump.jpg',
    paris: '../midia/eleicoes-2026/franca-paris.jpg',
    madri: '../midia/eleicoes-2026/espanha-madri.jpg',
    havana: '../midia/eleicoes-2026/cuba-1959.jpg',
    china: '../midia/eleicoes-2026/china-camponeses.jpg',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease } = L;
    const CX = 540, LARG = 840, X0 = 120, AZUL = COR.azul, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta;
    let arquivo = true;

    const ordem = [[0, abertura], [T.turno1, primeiroTurno], [T.mapa, mapa], [T.turno2, segundoTurno], [T.golpe, golpe],
      [T.contas, contas], [T.checklist, checklist], [T.soberania, soberania], [T.povo, povo], [T.mundo, mundo],
      [T.acabou, acabou], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [T.mapaVira, T.turno2 + 2.6, T.golpe, T.naoGolpe, T.soberano, T.acabou, T.mobilizacao, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 16);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();

    [[T.turno1, AMA, -24], [T.mapa, BEGE, 24], [T.turno2, BEGE, -24], [T.golpe, VERM, 24], [T.contas, BEGE, -24],
      [T.checklist, BEGE, 24], [T.soberania, TINTA, -24], [T.povo, VERM, 24], [T.mundo, AMA, -24], [T.acabou, VERM, 24], [T.logo, BEGE, -24]]
      .forEach(([X, cor, ang]) => L.corteDiagonal(ctx, seg(t, X - 0.4, X), cor, ang));
    if (arquivo) L.varredura(ctx, t, 0.08);
    IMP.forEach(X => L.flash(ctx, t, X, AMA, 0.25, 0.35));
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);

    // ------------------------------------------------ componentes padronizados
    function tamMax(txt, familia, tam, peso = 700, larg = LARG) { return Math.min(tam, L.ajustar(ctx, txt, familia, larg, peso)); }
    function titulo(txt, p, cor = TINTA) {                              // título do bloco: sempre y 330
      L.texto(ctx, L.datilografar(txt, p), CX, 330, { familia: FONTE.grotesca, peso: 700, tam: tamMax(txt, FONTE.grotesca, 48),
        cor, alinhar: 'center', rgb: 1.5 });
    }
    function cred(txt, p, cor = TINTA) {                                // crédito/fonte: sempre y 1440
      if (p <= 0) return;
      L.texto(ctx, L.datilografar(txt, p * 2), CX, 1440, { familia: FONTE.maquina, peso: 400, tam: tamMax(txt, FONTE.maquina, 26, 400),
        cor, alinhar: 'center' });
    }
    function linha(txt, y, p, cor = TINTA, tam = 46) {                  // linha de apoio centralizada
      L.texto(ctx, L.datilografar(txt, p), CX, y, { familia: FONTE.grotesca, peso: 700, tam: tamMax(txt, FONTE.grotesca, tam),
        cor, alinhar: 'center' });
    }
    function bloco(txt, y, cor, tam, fundo) {                           // palavra-bloco (Russo One) centralizada
      if (fundo) { ctx.fillStyle = fundo[0]; ctx.fillRect(X0, fundo[1], LARG, fundo[2]); }
      L.texto(ctx, txt, CX, y, { familia: FONTE.bloco, peso: 400, tam: tamMax(txt, FONTE.bloco, tam, 400, LARG - 60), cor, alinhar: 'center' });
    }
    function retrato(img, cx, cy, r, cor) {                             // foto redonda com anel na cor do candidato
      const [fx, fy, zoom] = img === L.img.flavio ? ROSTO.flavio : img === L.img.trump ? ROSTO.trump : ROSTO.lula;
      const s0 = Math.max(2 * r / img.width, 2 * r / img.height) * zoom, iw = img.width * s0, ih = img.height * s0;
      ctx.save(); ctx.fillStyle = cor; ctx.beginPath(); ctx.arc(cx, cy, r + 12, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();
      L.foto(ctx, img, cx - r, cy - r, 2 * r, 2 * r, { pb: true, zoom, dx: (0.5 - fx) * iw, dy: (0.5 - fy) * ih, retic: false });
      ctx.restore();
    }
    // barra de candidato: foto + número da urna + nome + barra animada + percentual (tudo dentro de x 120–960)
    function barra(y, img, num, nome, cor, pct, p) {
      retrato(img, X0 + 90, y, 78, cor);
      const xb = X0 + 190, wb = LARG - 190;
      ctx.fillStyle = cor; ctx.fillRect(xb, y - 70, 120, 70);
      L.texto(ctx, num, xb + 60, y - 14, { tam: 64, cor: BEGE, alinhar: 'center' });
      L.texto(ctx, nome, xb + 140, y - 22, { familia: FONTE.grotesca, peso: 700, tam: tamMax(nome, FONTE.grotesca, 38, 700, wb - 140), cor: TINTA });
      const w = wb * (pct / 52) * ease.saida(p);
      ctx.fillStyle = 'rgba(28,23,20,0.12)'; ctx.fillRect(xb, y + 10, wb, 64);
      ctx.fillStyle = cor; ctx.fillRect(xb, y + 10, w, 64);
      L.texto(ctx, (pct * ease.saida(p)).toFixed(2).replace('.', ',') + '%', xb + Math.max(w, 200) - 16, y + 62,
        { tam: 56, cor: w > 200 ? BEGE : TINTA, alinhar: 'right' });
    }
    function somaBloco(y, valor, txt1, txt2, p, cor) {                  // bloco de soma (milhões de votos), entra deslizando
      if (p <= 0) return;
      const x = lerp(-900, X0, ease.saida(p));
      ctx.save(); ctx.globalAlpha = Math.min(1, p * 3);
      ctx.fillStyle = TINTA; ctx.fillRect(x + 8, y + 8, LARG, 140);
      ctx.fillStyle = cor; ctx.fillRect(x, y, LARG, 140);
      L.texto(ctx, valor, x + 30, y + 108, { tam: 100, cor: BEGE });
      L.texto(ctx, txt1, x + 330, y + 64, { familia: FONTE.grotesca, peso: 700, tam: 32, cor: BEGE });
      L.texto(ctx, txt2, x + 330, y + 108, { familia: FONTE.grotesca, peso: 700, tam: 32, cor: BEGE });
      ctx.restore();
    }
    function quadro(img, y, h, o = {}) {                                // foto larga com filete, na largura padrão
      ctx.fillStyle = o.filete || VERM; ctx.fillRect(X0 - 8, y - 8, LARG + 16, h + 16);
      L.foto(ctx, img, X0, y, LARG, h, { pb: o.pb ?? true, seletiva: o.seletiva, zoom: o.zoom || 1.05, dx: o.dx || 0, dy: o.dy || 0 });
    }
    // bandeiras nacionais em cores da paleta (desenhadas uma vez, depois "tremulam" em fatias)
    function bandeiraPais(cod, x, y, w, h, tt) {
      const c = _band[cod] || (_band[cod] = desenharBandeira(cod, 600, 400));
      const n = 40, fw = w / n;
      for (let i = 0; i < n; i++) {
        const k = i / n, onda = Math.sin(k * 6 - tt * 5) * 12 * k, luz = Math.cos(k * 6 - tt * 5);
        ctx.drawImage(c, k * 600, 0, 600 / n + 1, 400, x + i * fw, y + onda, fw + 1, h);
        if (luz < -0.4) { ctx.fillStyle = 'rgba(15,12,11,0.22)'; ctx.fillRect(x + i * fw, y + onda, fw + 1, h); }
      }
    }
    function desenharBandeira(cod, w, h) {
      const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
      if (cod === 'FR') { [AZUL, BEGE, VERM].forEach((cor, i) => { g.fillStyle = cor; g.fillRect(i * w / 3, 0, w / 3 + 1, h); }); }
      if (cod === 'ES') { g.fillStyle = VERM; g.fillRect(0, 0, w, h); g.fillStyle = AMA; g.fillRect(0, h / 4, w, h / 2); }
      if (cod === 'CU') {
        for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? BEGE : AZUL; g.fillRect(0, i * h / 5, w, h / 5 + 1); }
        g.fillStyle = VERM; g.beginPath(); g.moveTo(0, 0); g.lineTo(h * 0.87, h / 2); g.lineTo(0, h); g.fill();
        L.estrela(g, h * 0.29, h / 2, h * 0.14, 0, BEGE);
      }
      if (cod === 'CN') {
        g.fillStyle = VERM; g.fillRect(0, 0, w, h);
        L.estrela(g, w * 0.17, h * 0.25, h * 0.15, 0, AMA);
        [[0.33, 0.1], [0.4, 0.2], [0.4, 0.35], [0.33, 0.45]].forEach(([a, b], i) => L.estrela(g, w * a, h * b, h * 0.05, 0.3 + i * 0.3, AMA));
      }
      return c;
    }

    // ------------------------------------------------ A. abertura
    function abertura(lt) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.02 }, () => L.planta(ctx, 21, TINTA, 0.1));
      titulo('ELEIÇÕES 2026', seg(lt, 0, 0.4));
      L.texto(ctx, L.datilografar('4 DE OUTUBRO', seg(lt, 0.2, 0.9)), CX, 600, { tam: 120, cor: VERM, alinhar: 'center', erro: TINTA, desloc: 5 });
      linha('1º TURNO', 690, seg(lt, 0.9, 1.4), TINTA, 56);
      L.urna(ctx, CX, 1000, 1.2);
    }

    // ------------------------------------------------ B. primeiro turno
    function primeiroTurno(lt) {
      L.fundo(ctx, BEGE);
      titulo('1º TURNO · 4 DE OUTUBRO', seg(lt, 0, 0.5));
      barra(600, L.img.flavio, '22', 'FLÁVIO BOLSONARO · PL', AZUL, 47.03, seg(lt, 0.3, 1.8));
      barra(900, L.img.lula, '13', 'LULA · PT', VERM, 45.16, seg(lt, 0.9, 2.4));
      L.etiqueta(ctx, 'FLÁVIO NA FRENTE', CX, 1180, seg(lt, 2.6, 2.9), { cor: AZUL, corTexto: BEGE, tam: 44 });
      cred('votos válidos · fonte: TSE', seg(lt, 1, 2));
    }

    // ------------------------------------------------ B2. mapa: o avanço estado a estado
    function mapa(lt, t) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.006 }, () => L.planta(ctx, 27, TINTA, 0.07));
      const virou = t >= T.mapaVira, esc = 760 / window.MAPA_BR_TAM[0], ox = CX - 380, oy = 440;
      const ufs = Object.keys(window.MAPA_BR);
      titulo(virou ? '2º TURNO · O AVANÇO DE LULA' : '1º TURNO · QUEM VENCEU ONDE', virou ? seg(t, T.mapaVira, T.mapaVira + 0.6) : seg(lt, 0, 0.6));
      ufs.forEach((uf, i) => {
        const entra = seg(lt, 0.1 + i * 0.04, 0.4 + i * 0.04);
        if (entra <= 0) return;
        const lula = (virou ? LULA_2T : LULA_1T).includes(uf);
        // na virada os estados de Lula "acendem" em sequência (Lula cresceu em todos)
        const acende = virou ? seg(t, T.mapaVira + i * 0.03, T.mapaVira + 0.25 + i * 0.03) : 0;
        let cor = lula ? (virou ? VERM : '#D9554A') : (virou ? '#4A6488' : AZUL);
        if (uf === 'MG' && virou) cor = Math.floor((t - T.mapaVira) * 6) % 2 && t < T.mapaVira + 1.2 ? AMA : VERM;
        ctx.save(); ctx.globalAlpha = entra;
        ctx.beginPath();
        window.MAPA_BR[uf].forEach(anel => anel.forEach(([x, y], j) => ctx[j ? 'lineTo' : 'moveTo'](ox + x * esc, oy + y * esc)));
        ctx.closePath(); ctx.fillStyle = cor; ctx.fill();
        if (acende > 0 && acende < 1) { ctx.fillStyle = `rgba(235,181,42,${0.6 * (1 - acende)})`; ctx.fill(); }
        ctx.strokeStyle = BEGE; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      });
      // legenda (placar de estados)
      L.etiqueta(ctx, virou ? 'LULA · 13 ESTADOS' : 'LULA · 12 ESTADOS', 330, 1260, seg(lt, 1.2, 1.5), { cor: VERM, corTexto: BEGE, tam: 34 });
      L.etiqueta(ctx, virou ? 'FLÁVIO · 13 + DF' : 'FLÁVIO · 14 + DF', 750, 1260, seg(lt, 1.4, 1.7), { cor: AZUL, corTexto: BEGE, tam: 34 });
      if (virou) {
        L.aplicarCarimbo(ctx, seg(t, T.mapaVira + 0.3, T.mapaVira + 0.6), 700, 1010, () =>
          L.etiqueta(ctx, 'MINAS GERAIS VIROU', 700, 1010, 1, { cor: AMA, corTexto: TINTA, tam: 38 }), 11);
        linha('LULA CRESCEU EM TODOS OS ESTADOS', 1370, seg(t, T.mapaVira + 0.8, T.mapaVira + 1.6), VERM, 46);
      } else linha('21 DIAS DEPOIS…', 1370, seg(lt, 2.0, 2.6), TINTA, 46);
      cred('vencedor por estado · fonte: TSE', seg(lt, 1.5, 2.5));
    }

    // ------------------------------------------------ C. segundo turno (a virada)
    function segundoTurno(lt) {
      L.fundo(ctx, BEGE);
      titulo('2º TURNO · 25 DE OUTUBRO', seg(lt, 0, 0.5));
      const troca = ease.saida(seg(lt, 1.6, 2.4));                      // as barras trocam de lugar: Lula sobe
      barra(lerp(900, 600, troca), L.img.lula, '13', 'LULA · PT', VERM, 51.79, seg(lt, 0.2, 2.0));
      barra(lerp(600, 900, troca), L.img.flavio, '22', 'FLÁVIO BOLSONARO · PL', AZUL, 48.21, seg(lt, 0.4, 2.0));
      L.aplicarCarimbo(ctx, seg(lt, 2.6, 2.9), CX, 1180, () => {
        ctx.save(); ctx.translate(CX, 1180); ctx.rotate(-0.06); ctx.strokeStyle = VERM; ctx.lineWidth = 12;
        ctx.strokeRect(-260, -95, 520, 160);
        L.texto(ctx, 'VIRADA', 0, 35, { familia: FONTE.bloco, peso: 400, tam: 120, cor: VERM, alinhar: 'center' }); ctx.restore();
      }, 7);
      cred('primeira virada no 2º turno desde a redemocratização · TSE', seg(lt, 3.0, 4.2));
    }

    // ------------------------------------------------ D. golpe?
    function golpe(lt) {
      L.fundo(ctx, VERM); arquivo = false;
      L.raios(ctx, CX, 960, 1800, 22, L.emDois(t) * 0.06, 'rgba(28,23,20,0.18)');
      const glitch = lt < 0.5 && Math.floor(lt * 30) % 3 === 0 ? 14 : 0;
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 880, () =>
        L.texto(ctx, 'GOLPE?', CX + glitch, 940, { familia: FONTE.bloco, peso: 400, tam: L.ajustar(ctx, 'GOLPE?', FONTE.bloco, LARG, 400),
          cor: BEGE, alinhar: 'center', erro: TINTA, desloc: 10 }), 9);
      linha('VAMOS ÀS CONTAS.', 1120, seg(lt, 0.9, 1.6), AMA, 64);
    }

    // ------------------------------------------------ E. as contas
    function contas(lt, t) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.004 }, () => L.planta(ctx, 33, TINTA, 0.08));
      titulo('DE ONDE VIERAM OS VOTOS?', seg(lt, 0, 0.8));
      if (t < T.divide) {
        somaBloco(440, '9,3 MI', 'VOTARAM EM OUTROS', 'CANDIDATOS NO 1º TURNO', seg(t, T.outros, T.outros + 0.5), COR.vermelhoEscuro);
        somaBloco(610, '+2,9 MI', 'VOLTARAM', 'ÀS URNAS', seg(t, T.voltaram, T.voltaram + 0.5), TINTA);
        somaBloco(780, '+1,9 MI', 'DEIXARAM DE VOTAR', 'BRANCO OU NULO', seg(t, T.brancos, T.brancos + 0.5), COR.sangue);
        if (t > T.total) {
          ctx.fillStyle = TINTA; ctx.fillRect(X0, 960, LARG, 6);
          L.aplicarCarimbo(ctx, seg(t, T.total, T.total + 0.3), CX, 1100, () => {
            L.texto(ctx, '= 14,1 MI', CX, 1140, { tam: 170, cor: VERM, alinhar: 'center', erro: TINTA, desloc: 6 });
            L.texto(ctx, 'DE VOTOS EM JOGO', CX, 1220, { familia: FONTE.grotesca, peso: 700, tam: 46, cor: TINTA, alinhar: 'center' });
          }, 15);
        }
      } else {
        const p = ease.saida(seg(t, T.divide, T.divide + 1.2));
        linha('14,1 MI DE VOTOS EM JOGO', 500, 1, TINTA, 48);
        const wL = LARG * 0.738 * p, wF = LARG * 0.262 * p;
        ctx.fillStyle = VERM; ctx.fillRect(X0, 560, wL, 220);
        ctx.fillStyle = AZUL; ctx.fillRect(X0 + LARG - wF, 560, wF, 220);
        if (p > 0.6) {
          L.texto(ctx, '+10,4 MI', X0 + 30, 720, { tam: 120, cor: BEGE });
          L.texto(ctx, '+3,7', X0 + LARG - 20, 700, { tam: 70, cor: BEGE, alinhar: 'right' });
        }
        retrato(L.img.lula, 300, 960, 95, VERM);
        retrato(L.img.flavio, 780, 960, 95, AZUL);
        L.texto(ctx, 'LULA', 300, 1120, { familia: FONTE.grotesca, peso: 700, tam: 46, cor: VERM, alinhar: 'center' });
        L.texto(ctx, 'FLÁVIO', 780, 1120, { familia: FONTE.grotesca, peso: 700, tam: 46, cor: AZUL, alinhar: 'center' });
        L.aplicarCarimbo(ctx, seg(t, T.divide + 1.5, T.divide + 1.8), CX, 1260, () =>
          linha('3 DE CADA 4 VOTOS NOVOS FORAM PARA LULA', 1270, 1, VERM, 44), 17);
      }
      cred('cálculo sobre dados do TSE (via Exame)', seg(lt, 2, 3));
    }

    // ------------------------------------------------ F. não foi golpe
    function checklist(lt, t) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.004 }, () => L.planta(ctx, 41, TINTA, 0.08));
      titulo('O QUE GARANTE O RESULTADO', seg(lt, 0, 0.8));
      [[T.ck1, 'TESTE DE INTEGRIDADE', 'urnas conferidas com cédulas de papel'],
        [T.ck2, 'OBSERVADORES DE 46 PAÍSES', 'acompanharam votação e apuração'],
        [T.ck3, 'MISSÕES INTERNACIONAIS', 'atestaram o resultado'],
        [T.ck4, 'NENHUMA PROVA DE FRAUDE', 'acusações sem provas']].forEach(([X, tit, sub], i) => {
        if (t < X) return;
        const y = 480 + i * 170, p = seg(t, X, X + 0.3);
        L.aplicarCarimbo(ctx, p, X0 + 45, y, () => {
          ctx.fillStyle = TINTA; ctx.fillRect(X0, y - 45, 90, 90);
          ctx.strokeStyle = AMA; ctx.lineWidth = 14; ctx.beginPath();
          ctx.moveTo(X0 + 20, y); ctx.lineTo(X0 + 40, y + 22); ctx.lineTo(X0 + 73, y - 25); ctx.stroke();
        }, 20 + i);
        L.texto(ctx, L.datilografar(tit, seg(t, X + 0.1, X + 0.7)), X0 + 120, y - 2, { familia: FONTE.grotesca, peso: 700, tam: 42, cor: TINTA });
        L.texto(ctx, L.datilografar(sub, seg(t, X + 0.6, X + 1.4)), X0 + 120, y + 44, { familia: FONTE.maquina, peso: 400, tam: 30, cor: TINTA });
      });
      L.aplicarCarimbo(ctx, seg(t, T.naoGolpe, T.naoGolpe + 0.3), CX, 1245, () =>
        bloco('NÃO FOI GOLPE.', 1290, BEGE, 130, [VERM, 1160, 170]), 29);
      cred('TSE · missões internacionais de observação', seg(lt, 1, 2));
    }

    // ------------------------------------------------ F2. soberania: o cartaz Flávio + Trump pega fogo
    function montagem() {                                               // cartaz impresso (estático), feito uma vez
      if (_mont.poster) return _mont.poster;
      const w = 760, h = 560, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
      g.fillStyle = BEGE; g.fillRect(0, 0, w, h);
      [[L.img.flavio, 0.46, 0.42, 1.9, 'FLÁVIO BOLSONARO'], [L.img.trump, 0.5, 0.42, 1.15, 'DONALD TRUMP']].forEach(([img, fx, fy, zoom, nome], i) => {
        const x = 20 + i * 370, y = 20, fw = 350, fh = 440;
        const s = Math.max(fw / img.width, fh / img.height) * zoom, iw = img.width * s, ih = img.height * s;
        L.foto(g, img, x, y, fw, fh, { pb: true, zoom, dx: (0.5 - fx) * iw, dy: (0.5 - fy) * ih });
        L.texto(g, nome, x + fw / 2, 515, { familia: FONTE.maquina, peso: 400, tam: 34, cor: TINTA, alinhar: 'center' });
      });
      // ruído suave (grade 48x36, interpolação bilinear) que desenha a frente irregular do fogo
      const gw = 48, gh = 36, r = L.rng ? L.rng(77) : (() => { let s = 77; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
      const grade = Array.from({ length: (gw + 1) * (gh + 1) }, () => r()), ruido = new Float32Array(w * h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const gx = x / w * gw, gy = y / h * gh, i0 = Math.floor(gx), j0 = Math.floor(gy), fx = gx - i0, fy = gy - j0;
        const v = (a, b) => grade[(j0 + b) * (gw + 1) + i0 + a];
        ruido[y * w + x] = lerp(lerp(v(0, 0), v(1, 0), fx), lerp(v(0, 1), v(1, 1), fx), fy);
      }
      const trab = document.createElement('canvas'); trab.width = w; trab.height = h;
      Object.assign(_mont, { poster: c, ruido, trab, base: g.getImageData(0, 0, w, h) });
      return c;
    }
    function queimar(x0, y0, p, tt) {                                    // p 0→1: o fogo sobe de baixo para cima
      montagem();
      const { ruido, trab, base } = _mont, w = 760, h = 560, g = trab.getContext('2d');
      const img = g.createImageData(w, h), s = base.data, d = img.data;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const k = y * w + x, i = k * 4, lim = (1 - y / h) * 0.85 + ruido[k] * 0.3, f = p * 1.15 - lim;
        if (f > 0.06) { d[i + 3] = 0; continue; }                       // já virou cinza (some)
        d[i] = s[i]; d[i + 1] = s[i + 1]; d[i + 2] = s[i + 2]; d[i + 3] = 255;
        if (f > 0) { const a = f / 0.06; d[i] = lerp(60, 15, a); d[i + 1] = lerp(30, 12, a); d[i + 2] = lerp(20, 11, a); }   // borda carbonizada
        else if (f > -0.05) { const a = 1 + f / 0.05; d[i] = lerp(s[i], 235, a); d[i + 1] = lerp(s[i + 1], 120, a); d[i + 2] = lerp(s[i + 2], 30, a); }   // brasa
      }
      g.putImageData(img, 0, 0);
      ctx.save(); ctx.translate(x0, y0); ctx.rotate(-0.02);
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.globalAlpha = Math.max(0, 1 - p * 1.3); ctx.fillRect(10, 14, w, h); ctx.globalAlpha = 1;
      ctx.drawImage(trab, 0, 0);
      // chamas ao longo da frente do fogo
      if (p > 0 && p < 1) {
        ctx.globalCompositeOperation = 'lighter';
        for (let x = 10; x < w; x += 22) {
          let yf = h; for (let y = h - 1; y >= 0; y -= 4) { const f = p * 1.15 - ((1 - y / h) * 0.85 + ruido[y * w + x] * 0.3); if (f < 0) { yf = y; break; } yf = y; }
          if (yf >= h - 1 && p < 0.05) continue;
          const tremor = Math.sin(tt * 13 + x * 0.37) * 0.3 + Math.sin(tt * 7.3 + x) * 0.2, alt = 70 + 60 * (0.5 + tremor) + 50 * Math.sin(x * 0.11);
          const gr = ctx.createLinearGradient(0, yf, 0, yf - alt);
          gr.addColorStop(0, 'rgba(235,181,42,0.85)'); gr.addColorStop(0.45, 'rgba(200,32,30,0.55)'); gr.addColorStop(1, 'rgba(200,32,30,0)');
          ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(x, yf - alt / 2, 18, alt / 2, 0, 0, 7); ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.restore();
    }
    function soberania(lt, t) {
      L.fundo(ctx, COR.carvao); arquivo = false;
      L.brasa(ctx, 0, 1000, 1080, 700, 9);
      titulo('QUEM PEDIU PRESSÃO DOS EUA CONTRA O BRASIL', seg(lt, 0, 0.9), AMA);
      const p = seg(t, T.fogo, T.fogo + 3.2);
      L.camera(ctx, { zoom: 1 + lt * 0.01 }, () => queimar(CX - 380, 470, p, t));
      if (p === 0) L.etiqueta(ctx, 'MONTAGEM', 840, 470, seg(lt, 0.3, 0.6), { cor: VERM, corTexto: BEGE, tam: 26 });
      // fagulhas subindo
      if (p > 0) for (let i = 0; i < 26; i++) {
        const r = Math.sin(i * 91.7) * 0.5 + 0.5, v = ((t - T.fogo) * (120 + r * 160) + i * 57) % 700;
        ctx.fillStyle = i % 3 ? AMA : VERM; ctx.globalAlpha = Math.max(0, 1 - v / 700) * Math.min(1, p * 4);
        ctx.fillRect(CX - 380 + r * 760 + Math.sin(t * 3 + i) * 20, 1030 - v, 5, 5);
      }
      ctx.globalAlpha = 1;
      L.aplicarCarimbo(ctx, seg(t, T.soberano, T.soberano + 0.3), CX, 1205, () =>
        bloco('O BRASIL É SOBERANO.', 1250, BEGE, 120, [VERM, 1120, 170]), 37);
      cred('montagem · fotos: Joédson Alves/Agência Brasil e Casa Branca (dom. público)', seg(lt, 0.8, 2), BEGE);
    }

    // ------------------------------------------------ G. foi o povo
    function povo(lt, t) {
      L.fundo(ctx, BEGE);
      if (t < T.rua) {
        titulo('ABSTENÇÃO', seg(lt, 0, 0.5));
        const v = lerp(21.08, 19.22, ease.saida(seg(t, T.abst, T.abst + 1.4)));
        L.texto(ctx, v.toFixed(2).replace('.', ',') + '%', CX, 620, { tam: 260, cor: VERM, alinhar: 'center', erro: TINTA, desloc: 8 });
        L.texto(ctx, '1º TURNO 21,08% → 2º TURNO 19,22%', CX, 700, { familia: FONTE.maquina, peso: 400, tam: 34, cor: TINTA, alinhar: 'center' });
        L.etiqueta(ctx, 'MENOR NUM 2º TURNO DESDE 2006', CX, 820, seg(t, T.desde2006, T.desde2006 + 0.3), { cor: TINTA, corTexto: AMA, tam: 40 });
        [['CE 13,9%', 270], ['PE 15,2%', 540], ['PB 15,5%', 810]].forEach(([s, x], i) =>
          L.etiqueta(ctx, s, x, 980, seg(t, T.nordeste + i * 0.3, T.nordeste + i * 0.3 + 0.3), { cor: VERM, corTexto: BEGE, tam: 40 }));
        if (t > T.nordeste) linha('NORDESTE: AS MENORES ABSTENÇÕES', 1110, seg(t, T.nordeste, T.nordeste + 0.8), VERM, 42);
        cred('fonte: TSE (via Exame)', seg(lt, 1, 2));
      } else {
        const lt2 = t - T.rua;
        titulo('FOI O POVO.', seg(lt2, 0, 0.4), VERM);
        L.camera(ctx, { zoom: 1.02 + lt2 * 0.01, y: 960 }, () => quadro(L.img.lulaPalco, 420, 600, { pb: true, seletiva: 'quente', zoom: 1.2 }));
        ['TRANSPORTE GRATUITO', 'GENTE NA RUA', 'GENTE CONVENCENDO GENTE'].forEach((s, i) =>
          L.etiqueta(ctx, s, CX, 1120 + i * 100, seg(lt2, i * 0.5, i * 0.5 + 0.3), { cor: i === 2 ? VERM : TINTA, corTexto: i === 2 ? BEGE : AMA, tam: 42 }));
        cred('Foto: Paulo Pinto/Agência Brasil', seg(lt2, 0.3, 1));
      }
    }

    // ------------------------------------------------ H. o mundo e a história: bandeiras + fotos
    function mundo(lt, t) {
      L.fundo(ctx, COR.carvao); arquivo = false;
      L.raios(ctx, CX, 1700, 2300, 24, L.emDois(t) * 0.05, 'rgba(200,32,30,0.22)');
      if (t >= T.organizado) {
        titulo('A HISTÓRIA ENSINA', 1, AMA);
        const lt2 = t - T.organizado;
        [['FR', 140, 440], ['ES', 560, 440], ['CU', 140, 700], ['CN', 560, 700]].forEach(([c, x, y], i) => {
          const p = ease.saida(seg(lt2, i * 0.08, i * 0.08 + 0.35));
          if (p > 0) { ctx.save(); ctx.globalAlpha = p; bandeiraPais(c, x, y + (1 - p) * 60, 380, 220, t + i); ctx.restore(); }
        });
        L.aplicarCarimbo(ctx, seg(lt2, 0.3, 0.6), CX, 1060, () => bloco('NADA VEIO DE CIMA.', 1100, BEGE, 90), 51);
        L.aplicarCarimbo(ctx, seg(lt2, 0.7, 1.0), CX, 1200, () => bloco('VEIO DO POVO ORGANIZADO.', 1240, AMA, 90), 53);
        return;
      }
      const itens = [
        [T.franca, 'FR', L.img.paris, 'FRANÇA', '400 MIL NAS RUAS · OUT/2026', 'Paris, 17/10/2026 · Foto: Jorge Jaramillo · CC BY-SA 4.0'],
        [T.espanha, 'ES', L.img.madri, 'ESPANHA', 'LUTA POR MORADIA', 'Madri, 26/09/2026 · Foto: Barcex · CC BY-SA 4.0'],
        [T.cuba, 'CU', L.img.havana, 'CUBA · 1959', 'O POVO NAS RUAS DE HAVANA', 'Havana, 8/1/1959 · domínio público'],
        [T.china, 'CN', L.img.china, 'CHINA · 1949', 'A REVOLUÇÃO VEIO DO CAMPO', 'Camponeses chineses, anos 1960 · foto reproduzida da BBC'],
      ];
      const idx = itens.filter(([X]) => t >= X).length - 1;
      titulo(t >= T.cuba ? 'A HISTÓRIA ENSINA' : 'E NÃO É SÓ AQUI', t >= T.cuba ? seg(t, T.cuba, T.cuba + 0.5) : seg(lt, 0, 0.6), AMA);
      if (idx < 0) return;
      const [X, cod, img, nome, sub, credito] = itens[idx], li = t - X, e = ease.saida(seg(li, 0, 0.45));
      ctx.save(); ctx.globalAlpha = e;
      L.camera(ctx, { zoom: 1.0 + li * 0.012, y: 920 }, () => {
        if (img) quadro(img, 630, 520, { pb: true, seletiva: true, zoom: 1.08 });
        else {
          ctx.fillStyle = VERM; ctx.fillRect(X0 - 8, 622, LARG + 16, 536); ctx.fillStyle = TINTA; ctx.fillRect(X0, 630, LARG, 520);
          L.raios(ctx, CX, 890, 900, 24, li * 0.1, 'rgba(200,32,30,0.35)');
          L.estrela(ctx, CX, 900, 190, 0, AMA);
        }
      });
      ctx.restore();
      bandeiraPais(cod, CX - 150, lerp(-260, 410, ease.saida(seg(li, 0.05, 0.5))), 300, 200, t);
      L.aplicarCarimbo(ctx, seg(li, 0.3, 0.6), CX, 1270, () => bloco(nome, 1310, AMA, 90), 31 + idx);
      linha(sub, 1375, seg(li, 0.6, 1.2), BEGE, 40);
      cred(credito, seg(li, 0.5, 1.2), BEGE);
    }

    // ------------------------------------------------ I. o chamado: bandeira com foice e martelo
    function acabou(lt, t) {
      L.fundo(ctx, COR.carvao); arquivo = false;
      L.raios(ctx, CX, 1900, 2300, 24, -0.4 + L.emDois(t) * 0.06, 'rgba(200,32,30,0.28)');
      // bandeira vermelha lisa com a estrela vazada e a foice e o martelo no canto (como a bandeira soviética)
      const fx = 170, fy = 880, fw = 760, fh = 470;
      L.mastro(ctx, fx, fy - 10, 1700, BEGE);
      for (let i = 0, n = 90; i < n; i++) {                              // tecido com dobras suaves (luz e sombra graduais)
        const kk = i / n, ond = Math.sin(kk * 7 - t * 5) * 22 * kk, luz = Math.cos(kk * 7 - t * 5);
        const m = L.clamp(0.5 - luz * 0.5) * 0.55, cl = L.clamp(luz - 0.6) * 0.5;
        const r = lerp(lerp(200, 138, m), 230, cl), g = lerp(lerp(32, 20, m), 70, cl), bb = lerp(lerp(30, 17, m), 60, cl);
        ctx.fillStyle = `rgb(${r | 0},${g | 0},${bb | 0})`;
        ctx.fillRect(fx + 9 + kk * fw, fy + ond, fw / n + 1, fh * (1 - kk * 0.12));
      }
      const k = 0.17, onda = Math.sin(k * 7 - t * 5) * 22 * k;          // mesma onda da bandeira na altura do símbolo
      L.estrelaContorno(ctx, fx + 9 + fw * k, fy + 66 + onda, 38, AMA);
      L.foiceMartelo(ctx, fx + 9 + fw * k + 4, fy + 195 + onda, 140, AMA);
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 500, () =>
        L.texto(ctx, 'A ELEIÇÃO ACABOU.', CX, 540, { tam: L.ajustar(ctx, 'A ELEIÇÃO ACABOU.', FONTE.manchete, LARG), cor: BEGE, alinhar: 'center', erro: VERM, desloc: 6 }), 41);
      L.aplicarCarimbo(ctx, seg(t, T.mobilizacao, T.mobilizacao + 0.3), CX, 690, () =>
        bloco('A MOBILIZAÇÃO, NÃO.', 735, VERM, 110, [AMA, 600, 190]), 43);
    }

    function final(lt) {
      L.fundo(ctx, BEGE); arquivo = false;
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 800, () => L.imagem(ctx, L.img.logo, CX, 800, 780), 97);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.6, 1.2);
      [['Fontes: TSE · Exame · CNN · NPR · The Brazilian Report', 1160],
        ['Fotos: Joédson Alves, Paulo Pinto / Agência Brasil (CC BY 3.0 BR) · Casa Branca (dom. público)', 1210],
        ['Jorge Jaramillo, Barcex (CC BY-SA 4.0) · Havana 1959 (dom. público) · China: via BBC', 1250]].forEach(([s, y]) =>
        L.texto(ctx, s, CX, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(s, FONTE.maquina, 26, 400), cor: TINTA, alinhar: 'center' }));
      ctx.restore();
    }
  },
};
