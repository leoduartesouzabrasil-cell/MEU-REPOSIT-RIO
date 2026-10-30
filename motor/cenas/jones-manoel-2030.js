// "Uma nova via" — Lula × Jones Manoel, rumo a 2030. PRÉVIA sem narração (tempos estimados).
// Quando a narração chegar, os tempos de T vêm de jones-manoel-2030.tempos.js (mesmos nomes), com as legendas.
// Render: node motor/render.js jones-manoel-2030 saida/jones.mp4 --audio audio/jones-manoel-2030/previa.wav
//
// DIAGRAMAÇÃO PADRÃO (a mesma de eleicoes-2026.js):
//   título do bloco y 330 · fonte dos dados y 384 · conteúdo x 120–960, y 420–1400
//   crédito de foto logo abaixo da foto · legenda: tarja escura y 1466–1542
const T = Object.assign({
  lula: 0.3, jones: 2.3, concilia: 4.6, comunista: 10.2, virada: 15.6, vencemos: 16.2, naoBasta: 19.6, novaVia: 21.6,
  diferencas: 25.6, d1: 26.0, d2: 29.6, d3: 34.6, d4: 39.6, d5: 43.0, mais: 46.6, votos: 52.4, eterno: 56.0,
  jones2030: 58.2, organize: 60.6, logo: 64.0, dur: 67.4,
}, (window.TEMPOS || {}).marcas || {});

// ponto do rosto em cada foto (fração da largura/altura) e zoom, para os retratos redondos
const ROSTO = { lula: [0.535, 0.30, 2.4], jones: [0.43, 0.47, 2.2] };
const _cache = {};

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: T.dur,
  imagens: {
    lula: '../midia/jones-manoel-2030/lula-discurso-2026.jpg',
    jones: '../midia/jones-manoel-2030/jones-une-2023.jpg',
    jonesRetrato: '../midia/jones-manoel-2030/jones-pcb-2022.jpg',
    jonesRecorte: '../midia/jones-manoel-2030/jones-recorte.png',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease } = L;
    const CX = 540, LARG = 840, X0 = 120, AZUL = COR.azul, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta;
    let arquivo = true;

    const ordem = [[0, apresentacao], [T.concilia, definicoes], [T.virada, virada], [T.diferencas, diferencas],
      [T.mais, maisPropostas], [T.votos, chamado], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [T.vencemos, T.naoBasta, T.novaVia, T.jones2030, T.organize, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 14);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();

    [[T.concilia, BEGE, -24], [T.virada, VERM, 24], [T.diferencas, BEGE, -24], [T.mais, VERM, 24], [T.votos, TINTA, -24], [T.logo, BEGE, -24]]
      .forEach(([X, cor, ang]) => L.corteDiagonal(ctx, seg(t, X - 0.4, X), cor, ang));
    if (arquivo) L.varredura(ctx, t, 0.08);
    IMP.forEach(X => L.flash(ctx, t, X, AMA, 0.25, 0.35));
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);
    legenda();

    // ------------------------------------------------ componentes padronizados
    function legenda() {                                                // tarja escura, palavras no tempo da fala
      const LEG = (window.TEMPOS || {}).legendas;
      const l = LEG && LEG.find(l => t >= l.t0 - 0.05 && t < l.t1);
      if (!l) return;
      const pal = l.p.map(([w, t0]) => [w, t0 - 0.08]), largura = tam => {
        L.fonte(ctx, FONTE.serifa, tam, 400, 'italic');
        return pal.reduce((s, [p]) => s + ctx.measureText(p).width, 0) + tam * 0.28 * (pal.length - 1);
      };
      const tam = Math.min(48, 48 * 760 / largura(48)), w = largura(tam);
      ctx.save(); ctx.globalAlpha = L.clamp((l.t1 - t) / 0.15) * L.clamp((t - l.t0 + 0.05) / 0.12);
      ctx.fillStyle = 'rgba(15,12,11,0.86)'; ctx.fillRect(CX - w / 2 - 26, 1466, w + 52, 76);
      ctx.fillStyle = VERM; ctx.fillRect(CX - w / 2 - 26, 1466, 7, 76);
      L.palavras(ctx, pal, t, CX, 1517, { tam, cor: BEGE, espaco: 0.28, rgb: 0 });
      ctx.restore();
    }
    function tamMax(txt, familia, tam, peso = 700, larg = LARG) { return Math.min(tam, L.ajustar(ctx, txt, familia, larg, peso)); }
    function titulo(txt, p, cor = TINTA) {
      L.texto(ctx, L.datilografar(txt, p), CX, 330, { familia: FONTE.grotesca, peso: 700, tam: tamMax(txt, FONTE.grotesca, 48), cor, alinhar: 'center', rgb: 1.5 });
    }
    function cred(txt, p, cor = TINTA, y = 384, x = CX, larg = LARG) {
      if (p <= 0) return;
      L.texto(ctx, L.datilografar(txt, p * 2), x, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(txt, FONTE.maquina, 22, 400, larg), cor, alinhar: 'center' });
    }
    function linha(txt, y, p, cor = TINTA, tam = 46, x = CX, larg = LARG) {
      L.texto(ctx, L.datilografar(txt, p), x, y, { familia: FONTE.grotesca, peso: 700, tam: tamMax(txt, FONTE.grotesca, tam, 700, larg), cor, alinhar: 'center' });
    }
    function bloco(txt, y, cor, tam, fundo, x = CX, larg = LARG) {
      if (fundo) { ctx.fillStyle = fundo[0]; ctx.fillRect(x - larg / 2, fundo[1], larg, fundo[2]); }
      L.texto(ctx, txt, x, y, { familia: FONTE.bloco, peso: 400, tam: tamMax(txt, FONTE.bloco, tam, 400, larg - 50), cor, alinhar: 'center' });
    }
    function retrato(img, cx, cy, r, cor) {
      const [fx, fy, zoom] = img === L.img.lula ? ROSTO.lula : ROSTO.jones;
      const s0 = Math.max(2 * r / img.width, 2 * r / img.height) * zoom, iw = img.width * s0, ih = img.height * s0;
      ctx.save(); ctx.fillStyle = cor; ctx.beginPath(); ctx.arc(cx, cy, r + 12, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();
      L.foto(ctx, img, cx - r, cy - r, 2 * r, 2 * r, { pb: true, zoom, dx: (0.5 - fx) * iw, dy: (0.5 - fy) * ih, retic: false });
      ctx.restore();
    }
    function quadro(img, x, y, w, h, o = {}) {                          // foto com filete
      ctx.fillStyle = o.filete || VERM; ctx.fillRect(x - 8, y - 8, w + 16, h + 16);
      L.foto(ctx, img, x, y, w, h, { pb: o.pb ?? true, seletiva: o.seletiva, zoom: o.zoom || 1.05, dx: o.dx || 0, dy: o.dy || 0 });
    }
    function marca(x, y, ok, p) {                                       // ✓ (amarelo em vermelho) ou ✗ (bege em azul)
      L.aplicarCarimbo(ctx, p, x, y, () => {
        ctx.fillStyle = ok ? VERM : AZUL; ctx.beginPath(); ctx.arc(x, y, 34, 0, 7); ctx.fill();
        ctx.strokeStyle = ok ? AMA : BEGE; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath();
        if (ok) { ctx.moveTo(x - 15, y); ctx.lineTo(x - 3, y + 13); ctx.lineTo(x + 17, y - 13); }
        else { ctx.moveTo(x - 12, y - 12); ctx.lineTo(x + 12, y + 12); ctx.moveTo(x + 12, y - 12); ctx.lineTo(x - 12, y + 12); }
        ctx.stroke();
      }, ok ? 61 : 63);
    }

    // urna eletrônica desenhada: tela com cargo, número e nome; teclado numérico com CONFIRMA (p: entrada, d: digitação)
    function urna(cx, cy, p, d) {
      if (p <= 0) return;
      ctx.save(); ctx.globalAlpha = p; ctx.translate(cx, cy + (1 - p) * 80);
      ctx.fillStyle = 'rgba(15,12,11,0.35)'; ctx.fillRect(-370, -195, 760, 410);              // sombra chapada
      ctx.fillStyle = TINTA; ctx.fillRect(-380, -205, 760, 410);
      ctx.fillStyle = BEGE; ctx.fillRect(-350, -175, 400, 290);                                  // tela
      L.texto(ctx, 'PRESIDENTE', -150, -130, { familia: FONTE.grotesca, peso: 700, tam: 30, cor: TINTA, alinhar: 'center' });
      const dig = '13'.slice(0, Math.floor(d * 2.99));
      ['', ''].forEach((_, k) => {                                                               // duas caixas de dígito
        ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.strokeRect(-255 + k * 105, -105, 90, 120);
        if (dig[k]) L.texto(ctx, dig[k], -210 + k * 105, -8, { tam: 110, cor: VERM, alinhar: 'center' });
      });
      if (d >= 1) L.texto(ctx, 'LULA', -150, 85, { familia: FONTE.grotesca, peso: 700, tam: 40, cor: TINTA, alinhar: 'center' });
      ctx.fillStyle = VERM; ctx.fillRect(-350, 135, 400, 45);                                    // faixa "VOTO"
      L.texto(ctx, 'VOTO', -150, 170, { familia: FONTE.grotesca, peso: 700, tam: 32, cor: BEGE, alinhar: 'center' });
      for (let k = 0; k < 10; k++) {                                                             // teclado 1–9, 0
        const col = k < 9 ? k % 3 : 1, lin = k < 9 ? Math.floor(k / 3) : 3, x = 100 + col * 82, y = -175 + lin * 66;
        const aceso = (k === 0 && d > 0.2 && d < 0.45) || (k === 2 && d > 0.55 && d < 0.8);   // teclas 1 e 3 piscam
        ctx.fillStyle = aceso ? AMA : '#3A322C'; ctx.fillRect(x, y, 70, 56);
        L.texto(ctx, String(k < 9 ? k + 1 : 0), x + 35, y + 40, { familia: FONTE.grotesca, peso: 700, tam: 30, cor: aceso ? TINTA : BEGE, alinhar: 'center' });
      }
      ctx.fillStyle = d >= 1 ? AMA : '#6B6A2E'; ctx.fillRect(100, 105, 234, 75);               // CONFIRMA
      L.texto(ctx, 'CONFIRMA', 217, 154, { familia: FONTE.grotesca, peso: 700, tam: 30, cor: TINTA, alinhar: 'center' });
      ctx.restore();
    }
    // Jones recortado: P&B de alto contraste, com silhueta vermelha deslocada (feito uma vez)
    function jonesCartaz(cx, base, alt, p) {
      if (p <= 0) return;
      const img = L.img.jonesRecorte;
      if (!_cache.jones) {
        const w = img.width, h = img.height, mk = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
        const foto = mk(), g = foto.getContext('2d');
        g.filter = 'grayscale(1) contrast(1.6) brightness(1.08)'; g.drawImage(img, 0, 0); g.filter = 'none';
        const fade = g.createLinearGradient(0, h * 0.8, 0, h);                                   // base esmaecida
        fade.addColorStop(0, 'rgba(0,0,0,1)'); fade.addColorStop(1, 'rgba(0,0,0,0)');
        g.globalCompositeOperation = 'destination-in'; g.fillStyle = fade; g.fillRect(0, 0, w, h);
        const silh = mk(), gs = silh.getContext('2d');
        gs.drawImage(foto, 0, 0); gs.globalCompositeOperation = 'source-in'; gs.fillStyle = VERM; gs.fillRect(0, 0, w, h);
        _cache.jones = { foto, silh };
      }
      const { foto, silh } = _cache.jones, e = ease.saida(p), bx0 = 150, bx1 = 669, by0 = 20;   // caixa da figura na foto
      const esc = alt / (img.height - by0), w = img.width * esc, h = img.height * esc;
      const x = cx - ((bx0 + bx1) / 2) * esc, y = base - h + (1 - e) * 200;
      ctx.save(); ctx.globalAlpha = Math.min(1, p * 2.5);
      ctx.drawImage(silh, x - 24, y - 14, w, h);                                // contraste vermelho deslocado
      ctx.drawImage(foto, x, y, w, h);
      ctx.restore();
    }

    // ------------------------------------------------ A. "Esse é o Lula. Esse é o Jones Manoel."
    function apresentacao(lt, t) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.006 }, () => L.planta(ctx, 51, TINTA, 0.07));
      const eL = ease.saida(seg(t, T.lula, T.lula + 0.6)), eJ = ease.saida(seg(t, T.jones, T.jones + 0.6));
      if (eL > 0) {
        ctx.save(); ctx.globalAlpha = eL; ctx.translate(lerp(-300, 0, eL), 0);
        quadro(L.img.lula, X0, 300, LARG, 500, { filete: AZUL, zoom: 1.12, dy: 40 });
        ctx.restore();
        L.etiqueta(ctx, 'ESSE É O LULA', 330, 770, seg(t, T.lula + 0.4, T.lula + 0.7), { cor: AZUL, corTexto: BEGE, tam: 40 });
        cred('Foto: Paulo Pinto/Agência Brasil', seg(t, T.lula + 0.5, T.lula + 1.2), TINTA, 846);
      }
      if (eJ > 0) {
        ctx.save(); ctx.globalAlpha = eJ; ctx.translate(lerp(300, 0, eJ), 0);
        quadro(L.img.jones, X0, 890, LARG, 500, { filete: VERM, zoom: 1.08, dy: 20 });
        ctx.restore();
        L.etiqueta(ctx, 'ESSE É O JONES MANOEL', 640, 1360, seg(t, T.jones + 0.4, T.jones + 0.7), { cor: VERM, corTexto: BEGE, tam: 40 });
        cred('Foto: Agência Brasil', seg(t, T.jones + 0.5, T.jones + 1.2), TINTA, 1436);
      }
    }

    // ------------------------------------------------ B. conciliador de classes × comunista
    function definicoes(lt, t) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.004 }, () => L.planta(ctx, 53, TINTA, 0.07));
      titulo('A PRIMEIRA DIFERENÇA', seg(lt, 0, 0.6));
      // Lula
      retrato(L.img.lula, 250, 600, 130, AZUL);
      L.aplicarCarimbo(ctx, seg(t, T.concilia + 0.3, T.concilia + 0.6), 660, 560, () => {
        bloco('CONCILIADOR', 560, AZUL, 64, null, 660, 560);
        bloco('DE CLASSES', 640, AZUL, 64, null, 660, 560);
      }, 71);
      ['governa para o trabalhador', 'e para o patrão ao mesmo tempo'].forEach((s, i) =>
        L.texto(ctx, L.datilografar(s, seg(t, T.concilia + 1.2 + i * 1.2, T.concilia + 2.4 + i * 1.2)), 660, 710 + i * 40,
          { familia: FONTE.maquina, peso: 400, tam: 28, cor: TINTA, alinhar: 'center' }));
      // Jones
      if (t >= T.comunista) {
        ctx.fillStyle = TINTA; ctx.fillRect(X0, 820, LARG * ease.saida(seg(t, T.comunista - 0.3, T.comunista)), 5);
        retrato(L.img.jones, 250, 1060, 130, VERM);
        L.aplicarCarimbo(ctx, seg(t, T.comunista + 0.3, T.comunista + 0.6), 660, 1050, () =>
          bloco('COMUNISTA', 1070, VERM, 84, null, 660, 560), 73);
        ['o poder nas mãos de', 'quem produz a riqueza'].forEach((s, i) =>
          L.texto(ctx, L.datilografar(s, seg(t, T.comunista + 1.2 + i * 1.2, T.comunista + 2.4 + i * 1.2)), 660, 1150 + i * 40,
            { familia: FONTE.maquina, peso: 400, tam: 28, cor: TINTA, alinhar: 'center' }));
      }
    }

    // ------------------------------------------------ C. vencemos — não basta — uma nova via (CARTAZ)
    function virada(lt, t) {
      arquivo = false;
      if (t < T.naoBasta) {
        L.fundo(ctx, VERM);
        L.raios(ctx, CX, 960, 1800, 22, L.emDois(t) * 0.05, 'rgba(28,23,20,0.16)');
        titulo('ELEIÇÕES 2026', seg(lt, 0, 0.5), BEGE);
        urna(CX, 760, ease.saida(seg(t, T.virada, T.virada + 0.5)), seg(t, T.virada + 0.5, T.vencemos));
        L.aplicarCarimbo(ctx, seg(t, T.vencemos, T.vencemos + 0.3), CX, 1100, () =>
          L.texto(ctx, 'VENCEMOS.', CX, 1160, { tam: L.ajustar(ctx, 'VENCEMOS.', FONTE.manchete, 700), cor: BEGE, alinhar: 'center', erro: TINTA, desloc: 8 }), 81);
      } else if (t < T.novaVia) {
        L.fundo(ctx, COR.carvao);
        L.aplicarCarimbo(ctx, seg(t, T.naoBasta, T.naoBasta + 0.3), CX, 860, () => {
          L.texto(ctx, 'MAS', CX, 760, { familia: FONTE.bloco, peso: 400, tam: 90, cor: BEGE, alinhar: 'center' });
          L.texto(ctx, 'NÃO BASTA.', CX, 940, { tam: L.ajustar(ctx, 'NÃO BASTA.', FONTE.manchete, LARG), cor: VERM, alinhar: 'center', erro: BEGE, desloc: 6 });
        }, 83);
        linha('SÓ DERROTAR O FASCISMO', 1080, seg(t, T.naoBasta + 0.6, T.naoBasta + 1.3), BEGE, 44);
      } else {
        // sol nascente amarelo: uma nova via
        L.fundo(ctx, AMA);
        const e = ease.saida(seg(t, T.novaVia, T.novaVia + 1.2));
        L.raios(ctx, CX, 1250, 2200, 24, t * 0.03, 'rgba(200,32,30,0.20)');
        ctx.fillStyle = VERM; ctx.beginPath(); ctx.arc(CX, lerp(1800, 1130, e), 440, 0, 7); ctx.fill();
        L.aplicarCarimbo(ctx, seg(t, T.novaVia + 0.2, T.novaVia + 0.5), CX, 460, () => {
          L.texto(ctx, 'UMA', CX, 370, { familia: FONTE.bloco, peso: 400, tam: 70, cor: TINTA, alinhar: 'center' });
          L.texto(ctx, 'NOVA VIA', CX, 520, { tam: Math.min(170, L.ajustar(ctx, 'NOVA VIA', FONTE.manchete, LARG)), cor: VERM, alinhar: 'center', erro: TINTA, desloc: 8 });
        }, 85);
        linha('O PODER NAS MÃOS DE QUEM TRABALHA', 590, seg(t, T.novaVia + 1.2, T.novaVia + 2.2), TINTA, 44);
        jonesCartaz(CX + 20, 1405, 800, seg(t, T.novaVia + 0.4, T.novaVia + 1.3));
        cred('Foto: Agência Brasil', seg(t, T.novaVia + 1.0, T.novaVia + 1.8), TINTA, 1452);
      }
    }

    // ------------------------------------------------ D. as diferenças (placar)
    function diferencas(lt, t) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.003 }, () => L.planta(ctx, 57, TINTA, 0.07));
      titulo('O GOVERNO × O QUE JONES DEFENDE', seg(lt, 0, 0.6));
      const xL = 330, xR = 750, wC = 400;
      // cabeçalhos das colunas
      [[xL, 'GOVERNO LULA', AZUL], [xR, 'JONES MANOEL', VERM]].forEach(([x, s, cor], i) => {
        const e = ease.saida(seg(lt, 0.1 + i * 0.15, 0.5 + i * 0.15));
        ctx.save(); ctx.globalAlpha = e; ctx.fillStyle = cor; ctx.fillRect(x - wC / 2, 430 - (1 - e) * 40, wC, 78);
        L.texto(ctx, s, x, 482 - (1 - e) * 40, { familia: FONTE.grotesca, peso: 700, tam: 36, cor: BEGE, alinhar: 'center' });
        ctx.restore();
      });
      const temas = [
        [T.d1, 'JORNADA', ['40 HORAS'], ['30 HORAS'], 'projeto do governo (abr/2026) · Jones, Diario de PE (05/10/2026)'],
        [T.d2, 'JUROS', ['SELIC 14,25%', '+ ARCABOUÇO'], ['JUROS BAIXOS', '+ INVESTIMENTO'], 'Copom (jun/2026) · Jones, Diario de PE e X'],
        [T.d3, 'PRIVATIZAÇÕES', ['NENHUMA', 'REVERTIDA'], ['REVERTER', 'PETRÓLEO', 'PÚBLICO'], 'Jones, O Povo (07/03/2026)'],
        [T.d4, 'REFORMA TRABALHISTA', ['MANTEVE'], ['REVOGAR', '+ FIM DA', 'PEJOTIZAÇÃO'], 'Jones, Diario de PE (05/10/2026)'],
        [T.d5, 'BETS', ['LIBEROU E', 'REGULAMENTOU'], ['CONTRA AS', 'APOSTAS'], 'Lei 14.790/2023 · Jones, Diario de PE (05/10/2026)'],
      ];
      const i = temas.filter(([X]) => t >= X).length - 1;
      if (i < 0) return;
      const [X, tema, esq, dir, fonte] = temas[i], li = t - X, e = ease.saida(seg(li, 0, 0.35));
      cred('fonte: ' + fonte, seg(li, 0.3, 1.0));
      ctx.save(); ctx.globalAlpha = e; ctx.translate(lerp(160, 0, e), 0);
      L.texto(ctx, tema, CX, 640, { tam: tamMax(tema, FONTE.manchete, 110, 900), cor: TINTA, alinhar: 'center', erro: AMA, desloc: 5 });
      ctx.restore();
      // valores: governo (azul, ✗) entra primeiro; Jones (vermelho, ✓) carimba depois
      const pE = seg(li, 0.5, 0.8), pD = seg(li, 1.5, 1.8);
      if (i === 0) {                                                    // jornada: contador 44 → 40 e 44 → 30
        const n1 = Math.round(lerp(44, 40, ease.saida(seg(li, 0.5, 1.3)))), n2 = Math.round(lerp(44, 30, ease.saida(seg(li, 1.5, 2.5))));
        if (pE > 0) L.texto(ctx, n1 + 'H', xL, 900, { tam: 200, cor: AZUL, alinhar: 'center', erro: TINTA, desloc: 5 });
        if (pD > 0) L.texto(ctx, n2 + 'H', xR, 900, { tam: 200, cor: VERM, alinhar: 'center', erro: TINTA, desloc: 5 });
        if (pE > 0) L.texto(ctx, 'por semana', xL, 960, { familia: FONTE.maquina, peso: 400, tam: 30, cor: TINTA, alinhar: 'center' });
        if (pD > 0) L.texto(ctx, 'por semana', xR, 960, { familia: FONTE.maquina, peso: 400, tam: 30, cor: TINTA, alinhar: 'center' });
      } else {
        [[esq, xL, AZUL, pE, 89], [dir, xR, VERM, pD, 91]].forEach(([linhas, x, cor, p, seed]) =>
          L.aplicarCarimbo(ctx, p, x, 860, () => {
            const tam = Math.min(...linhas.map(s => tamMax(s, FONTE.bloco, 60, 400, wC - 40)));   // mesmo tamanho nas duas linhas
            linhas.forEach((s, k) => L.texto(ctx, s, x, 840 + k * 80, { familia: FONTE.bloco, peso: 400, tam, cor, alinhar: 'center' }));
          }, seed + i));
      }
      marca(xL, 1080, false, seg(li, 0.9, 1.2));
      marca(xR, 1080, true, seg(li, 2.0, 2.3));
      // placar: 4 bolinhas mostrando em qual diferença estamos
      temas.forEach((_, k) => {
        ctx.fillStyle = k <= i ? VERM : 'rgba(28,23,20,0.2)'; ctx.beginPath(); ctx.arc(CX - 100 + k * 50, 1230, 12, 0, 7); ctx.fill();
      });
    }

    // ------------------------------------------------ D2. e mais propostas (lista em etiquetas, uma a uma)
    function maisPropostas(lt, t) {
      L.fundo(ctx, VERM); arquivo = false;
      L.raios(ctx, CX, 1700, 2300, 24, L.emDois(t) * 0.05, 'rgba(28,23,20,0.16)');
      titulo('O QUE MAIS JONES DEFENDE', seg(lt, 0, 0.6), BEGE);
      cred('fontes: O Povo (07/03/2026) · Diario de PE (05/10/2026) · propostas de campanha (set/2026)', seg(lt, 0.4, 1.2), BEGE);
      const itens = [['REFORMA AGRÁRIA DE VERDADE', AMA, TINTA], ['TRANSPORTE PÚBLICO ESTATAL', TINTA, AMA], ['SANEAMENTO PÚBLICO', AMA, TINTA],
        ['TERRAS INDÍGENAS E QUILOMBOLAS', TINTA, AMA], ['FIM DA DÍVIDA ABUSIVA DOS ESTADOS', AMA, TINTA], ['VOZ PARA SINDICATOS E MOVIMENTOS', TINTA, AMA]];
      L.fonte(ctx, FONTE.grotesca, 40, 700);                                       // um tamanho só para todas as etiquetas
      const tam = Math.min(40, ...itens.map(([s]) => 40 * 780 / (ctx.measureText(s).width + 44)));
      itens.forEach(([s, cor, corTexto], k) =>
        L.etiqueta(ctx, s, CX, 520 + k * 140, seg(lt, 0.4 + k * 0.75, 0.7 + k * 0.75), { cor, corTexto, tam }));
    }

    // ------------------------------------------------ E. o chamado
    function chamado(lt, t) {
      L.fundo(ctx, COR.carvao); arquivo = false;
      L.raios(ctx, CX, 1700, 2300, 24, L.emDois(t) * 0.05, 'rgba(200,32,30,0.22)');
      const img = L.img.jonesRetrato, h = 560, w = h * img.width / img.height;
      quadro(img, CX - w / 2, 420, w, h, { pb: true, seletiva: true, zoom: 1.02 });
      cred('Foto: PCB (reprodução permitida com crédito)', seg(lt, 0.4, 1.2), BEGE, 1014);
      if (t < T.eterno) {
        const n = Math.round(lerp(0, 249077, ease.saida(seg(t, T.votos + 0.2, T.votos + 1.6))));
        L.texto(ctx, n.toLocaleString('pt-BR'), CX, 1170, { tam: 150, cor: AMA, alinhar: 'center', erro: VERM, desloc: 6 });
        linha('VOTOS · DEPUTADO FEDERAL POR PERNAMBUCO', 1240, seg(t, T.votos + 0.8, T.votos + 1.6), BEGE, 36);
      } else if (t < T.jones2030) {
        linha('O LULA NÃO VAI', 1130, seg(t, T.eterno, T.eterno + 0.5), BEGE, 64);
        linha('DURAR PARA SEMPRE.', 1210, seg(t, T.eterno + 0.4, T.eterno + 1.0), BEGE, 64);
      } else {
        L.aplicarCarimbo(ctx, seg(t, T.jones2030, T.jones2030 + 0.3), CX, 1150, () =>
          L.texto(ctx, 'JONES 2030?', CX, 1190, { tam: L.ajustar(ctx, 'JONES 2030?', FONTE.manchete, LARG), cor: AMA, alinhar: 'center', erro: VERM, desloc: 8 }), 93);
        L.aplicarCarimbo(ctx, seg(t, T.organize, T.organize + 0.3), CX, 1310, () =>
          bloco('ORGANIZE-SE.', 1345, VERM, 100, [AMA, 1250, 140]), 95);
      }
    }

    function final(lt) {
      L.fundo(ctx, BEGE); arquivo = false;
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 800, () => L.imagem(ctx, L.img.logo, CX, 800, 780), 97);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.6, 1.2);
      [['Fontes: Diario de Pernambuco · O Povo · IHU/Sul21 · Bahia Notícias · Aratu On · Banco Central · Congresso em Foco', 1160],
        ['Fotos: Paulo Pinto e Agência Brasil (CC BY 3.0 BR) · PCB (reprodução permitida com crédito)', 1210]].forEach(([s, y]) =>
        L.texto(ctx, s, CX, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(s, FONTE.maquina, 24, 400), cor: TINTA, alinhar: 'center' }));
      ctx.restore();
    }
  },
};
