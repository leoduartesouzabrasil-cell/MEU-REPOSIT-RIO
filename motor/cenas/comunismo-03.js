// "DESMISTIFICANDO O COMUNISMO" · EP. 3: O que é mais-valia? Roteiro: roteiros/comunismo-03-mais-valia.md
// Mesma base do EP. 1 e do EP. 2: gancho (vídeo do autor numa moldura), vinheta da série, registros ARQUIVO/CARTAZ, legenda padrão.
// Ordem: gancho (0–GANCHO s, o vídeo entra no juntar.sh) → vinheta → #1 CARTAZ: das 8 horas, quantas são suas? (régua) →
// #2 a hamburgueria (preço, 40 lanches) → o cupom do seu dia (valor novo, salário, mais-valia e para onde vai) → CARTAZ: MAIS-VALIA →
// #3 o patrão compra a força de trabalho (balança) → #4 o Brasil (três réguas, estimativa) → Marx, 1849 → CARTAZ: quantas horas são suas? → logo.
// T vem de comunismo-03.tempos.js (gerado por audio/comunismo-03/montar.py).
//
// DIAGRAMAÇÃO PADRÃO: título y 330 · fonte dos dados y 384 · conteúdo x 120–960, y 420–1420 · legenda (tarja) y 1466–1542
const GANCHO = 40.85;  // duração do vídeo de abertura (igual a audio/comunismo-03/previa.py)
const GANCHO_TITULO = 'MAS O QUE É MAIS-VALIA?';
const GANCHO_CRED = 'Jones Manoel, historiador';
// trecho do vídeo: 0–40,85 s do original (midia/comunismo-03/gancho-original.mp4), até "Foi assim!"; legenda no nosso padrão
const GANCHO_LEG = [{"t0": 0.0, "p": [["Aí,", 0.0], ["um", 0.22], ["belo", 0.32], ["dia,", 0.44]], "t1": 0.54}, {"t0": 0.54, "p": [["o", 0.54], ["meu", 0.64], ["amigo", 0.7], ["de", 0.86], ["infância,", 1.06]], "t1": 1.42}, {"t0": 1.42, "p": [["Júlio", 1.42], ["César,", 1.56], ["chegou", 1.74], ["pra", 1.92], ["mim", 2.06], ["e", 2.14]], "t1": 2.16}, {"t0": 2.16, "p": [["falou", 2.16], ["assim:", 2.3]], "t1": 3.3}, {"t0": 3.3, "p": [["“Jones,", 3.3], ["eu", 3.62], ["descobri", 3.94], ["por que", 4.26], ["tu", 4.58]], "t1": 4.74}, {"t0": 4.74, "p": [["é", 4.74], ["f*dido.”", 4.86]], "t1": 5.3}, {"t0": 5.3, "p": [["Eu", 5.3], ["falei:", 5.36]], "t1": 5.48}, {"t0": 5.48, "p": [["“C*ralho,", 5.48]], "t1": 6.7}, {"t0": 6.7, "p": [["o", 6.7], ["que", 6.76], ["foi?", 6.98]], "t1": 7.04}, {"t0": 7.04, "p": [["Me", 7.04], ["conta,", 7.22], ["né?”", 7.66]], "t1": 8.12}, {"t0": 8.12, "p": [["Eu", 8.12], ["quero", 8.42], ["saber!", 8.62]], "t1": 10.52}, {"t0": 10.52, "p": [["E", 10.52], ["aí,", 10.66], ["véi,", 11.12], ["ele", 11.38], ["tinha", 11.68], ["tido", 12.02], ["uma", 12.32]], "t1": 12.62}, {"t0": 12.62, "p": [["aula", 12.62], ["com", 12.78], ["a", 12.9], ["professora", 12.98], ["Cecília", 13.3]], "t1": 14.06}, {"t0": 14.06, "p": [["de", 14.06], ["sociologia,", 14.6]], "t1": 15.24}, {"t0": 15.24, "p": [["baseada", 15.24], ["num", 15.34], ["livro", 15.42], ["de", 15.54]], "t1": 15.58}, {"t0": 15.58, "p": [["sociologia", 15.58], ["pra", 15.96], ["jovens", 16.12], ["do", 16.28]], "t1": 16.4}, {"t0": 16.4, "p": [["século", 16.4], ["21", 16.6], ["que", 17.02], ["ele", 17.5], ["entendeu", 17.88], ["que", 18.04]], "t1": 18.14}, {"t0": 18.14, "p": [["é", 18.14], ["mais-valia.", 18.24]], "t1": 19.4}, {"t0": 19.4, "p": [["Aí,", 19.4], ["ele", 19.5], ["me", 19.6], ["explicou", 19.76], ["de", 19.96], ["um", 20.04]], "t1": 20.1}, {"t0": 20.1, "p": [["jeito", 20.1], ["assim,", 20.22], ["bem", 20.4], ["rápido,", 20.52]], "t1": 20.82}, {"t0": 20.82, "p": [["cinco", 20.82], ["minutinhos", 20.96], ["que", 21.2], ["é", 21.32], ["mais-valia.", 21.34]], "t1": 22.2}, {"t0": 22.2, "p": [["E", 22.2], ["a", 22.34], ["explicação", 22.38], ["dele", 22.6], ["foi", 22.72]], "t1": 22.84}, {"t0": 22.84, "p": [["basicamente", 22.84], ["assim:", 23.14]], "t1": 23.38}, {"t0": 23.38, "p": [["“Ó,", 23.38], ["quanto", 23.68], ["é", 23.82], ["a", 23.92], ["mensalidade", 24.0], ["de", 24.54]], "t1": 24.76}, {"t0": 24.76, "p": [["cada", 24.76], ["estudante", 24.98], ["da", 25.2], ["escola?”", 25.32]], "t1": 25.6}, {"t0": 25.6, "p": [["Eu", 25.6], ["falei:", 25.7]], "t1": 25.9}, {"t0": 25.9, "p": [["“Um", 25.9], ["salário", 25.96], ["mínimo.”", 26.12]], "t1": 26.58}, {"t0": 26.58, "p": [["“E tu", 26.58], ["ganha", 26.7], ["quanto?”", 26.84]], "t1": 27.12}, {"t0": 27.12, "p": [["“Um", 27.12], ["salário", 27.2], ["mínimo.”", 27.4]], "t1": 27.76}, {"t0": 27.76, "p": [["Pronto.", 27.76]], "t1": 28.3}, {"t0": 28.3, "p": [["Com", 28.3], ["a", 28.62], ["mensalidade", 28.9], ["de", 29.28], ["uma", 29.4], ["turma,", 29.54]], "t1": 30.3}, {"t0": 30.3, "p": [["eles", 30.3], ["pagam", 30.4], ["todos", 30.64], ["os", 30.8], ["funcionários.", 30.96]], "t1": 31.86}, {"t0": 31.86, "p": [["E", 31.86], ["o", 31.92], ["que", 31.98], ["sobra", 32.16], ["é", 32.46], ["lucro", 32.6], ["pra", 32.82], ["eles.", 33.08]], "t1": 33.38}, {"t0": 33.38, "p": [["Porque", 33.38], ["quem", 33.46], ["faz", 33.58], ["a", 33.68], ["escola", 33.78]], "t1": 33.96}, {"t0": 33.96, "p": [["funcionar", 33.96], ["são", 34.44], ["os", 34.54], ["trabalhadores.", 34.72]], "t1": 35.22}, {"t0": 35.22, "p": [["Porque", 35.22], ["o", 35.3], ["patrão", 35.44], ["não", 35.6], ["trabalha.", 35.76]], "t1": 36.44}, {"t0": 36.44, "p": [["Então", 36.44], ["isso", 36.56], ["que", 36.74], ["é", 36.82], ["mais-valia.", 36.86000000000001]], "t1": 37.4}, {"t0": 37.4, "p": [["Quem", 37.4], ["falou", 37.5], ["isso", 37.66], ["foi", 37.78], ["Karl Marx.", 37.88]], "t1": 38.3}, {"t0": 38.3, "p": [["Eu", 38.3], ["falei:", 38.32]], "t1": 38.52}, {"t0": 38.52, "p": [["“C*rai,", 38.52], ["f*da", 38.78], ["esse", 38.92], ["Karl Marx,", 39.02]], "t1": 39.48}, {"t0": 39.48, "p": [["hein?”", 39.48]], "t1": 40.04}, {"t0": 40.04, "p": [["Foi", 40.04], ["assim!", 40.36]], "t1": 40.9}];
const T = Object.assign({ vin: GANCHO + 0.4, dur: GANCHO + 20 }, (window.TEMPOS || {}).marcas || {});
const JANELA = { x: 195, y: 445, w: 690, h: 880 };

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: T.dur,
  imagens: {
    ganchoFim: '../midia/comunismo-03/gancho-ultimo-quadro.jpg',   // último quadro do trecho, já recortado 690×880
    marx: '../midia/comunismo-01/marx-recorte.jpg',   // J. J. E. Mayall, 1875 · domínio público
    logoBege: '../identidade/marca/o-camarada-bege.png',
    logo: '../identidade/marca/o-camarada-vermelho.png',
    ocV: '../identidade/marca/variantes/o-camarada-v-vermelha.png',   // logos novas (versões verticais, quase do mesmo formato)
    lufaV: '../identidade/marca/variantes/lufa-v-colorida.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease, clamp } = L;
    const CX = 540, LARG = 840, X0 = 120, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta;
    const PAPEL = '#F6EEDB', PAO = '#C98A3A', CARNE = '#4A2A1A';
    let arquivo = true;
    const suave = p => p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;   // entra e sai devagar (régua)

    const ordem = [[0, gancho], [T.vin, vinheta], [T.oito, oito], [T.lanche, lanchonete], [T.cupom, cupom], [T.mv, maisValia],
      [T.porque, porque], [T.brasil, brasil], [T.m1849, marx1849], [T.final, pergunta], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [T.oito + 0.1, T.menos, T.mil + 0.2, T.novo + 0.6, T.lucro + 0.3, T.mvc, T.mvc + 0.5, T.npago, T.seutrab, T.quantas, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 10);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();

    [[T.vin, VERM, 24], [T.oito, VERM, -24], [T.lanche, BEGE, 24], [T.cupom, BEGE, -24], [T.mv, VERM, 24], [T.porque, BEGE, -24],
      [T.brasil, BEGE, 24], [T.m1849, BEGE, -24], [T.final, VERM, 24], [T.logo, BEGE, -24]]
      .forEach(([X, cor, ang]) => L.corteDiagonal(ctx, seg(t, X - 0.4, X), cor, ang));
    if (arquivo) L.varredura(ctx, t, 0.07);
    IMP.forEach(X => L.flash(ctx, t, X, AMA, 0.25, 0.22));
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);
    legenda();

    // ------------------------------------------------ componentes padronizados (iguais aos do EP. 2)
    function legenda() {
      const LEG = [...GANCHO_LEG, ...((window.TEMPOS || {}).legendas || [])];
      const l = LEG.find(l => t >= l.t0 - 0.05 && t < l.t1);
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
      L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), o.x || CX, y, () =>
        L.texto(ctx, txt, o.x || CX, y, { familia, peso, tam: tamMax(txt, familia, tam, peso, o.larg || LARG), cor, alinhar: 'center', ...o }), seed);
    }
    function faixa(txt, y, t0, fundoCor = TINTA, cor = BEGE, tam = 56, seed = 9) {
      L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), CX, y, () => {
        ctx.fillStyle = fundoCor; ctx.fillRect(X0, y - 60, LARG, 120);
        L.texto(ctx, txt, CX, y + tam * 0.36, { familia: FONTE.bloco, peso: 400, tam: tamMax(txt, FONTE.bloco, tam, 400, 780), cor, alinhar: 'center' });
      }, seed);
    }
    function sombraCaixa(x, y, w, h, cor = BEGE, borda = true) {
      ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(x + 12, y + 12, w, h);
      ctx.fillStyle = cor; ctx.fillRect(x, y, w, h);
      if (borda) { ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h); }
    }
    function fundoCartaz() {
      arquivo = false;
      L.fundo(ctx, VERM);
      L.raios(ctx, CX, 1560, 2600, 20, -0.3 + L.emDois(t) * 0.05, 'rgba(237,224,196,0.13)');
      ctx.fillStyle = COR.vermelhoEscuro; ctx.beginPath(); ctx.arc(CX, 1560, 330, Math.PI, 0); ctx.fill();
    }

    // ------------------------------------------------ a régua de 8 horas: pago = horas que pagam o salário (amarelo); o resto é vermelho
    // vis = quantos blocos já apareceram (0–8)
    function regua(x, y, w, h, pago, vis = 8, o = {}) {
      const bw = w / 8;
      for (let k = 0; k < 8; k++) {
        const q = clamp(vis - k);
        if (q <= 0) continue;
        const bx = x + k * bw, f = clamp(pago - k);
        ctx.save(); ctx.globalAlpha = q;
        ctx.fillStyle = 'rgba(28,23,20,0.35)'; ctx.fillRect(bx + 6, y + 6, bw - 6, h);
        ctx.fillStyle = VERM; ctx.fillRect(bx, y, bw - 6, h);
        if (f > 0) { ctx.fillStyle = AMA; ctx.fillRect(bx, y, (bw - 6) * f, h); }
        ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.strokeRect(bx, y, bw - 6, h);
        if (o.horas !== false) L.texto(ctx, (k + 1) + 'h', bx + bw - 14, y + h - 12, { familia: FONTE.maquina, peso: 400, tam: Math.min(24, h * 0.3), cor: f >= 1 ? TINTA : BEGE, alinhar: 'right' });
        ctx.restore();
      }
    }

    // ------------------------------------------------ boneco de cartaz (pés em x, y), igual ao do EP. 2
    function pessoa(x, y, p, esc = 1, braco = 0) {
      ctx.save(); ctx.translate(x, y); ctx.scale(esc, esc);
      ctx.lineWidth = 4; ctx.strokeStyle = TINTA; ctx.lineJoin = 'round';
      ctx.fillStyle = p.calca || TINTA; ctx.fillRect(-22, -72, 18, 72); ctx.fillRect(4, -72, 18, 72);
      ctx.fillStyle = p.roupa;
      ctx.beginPath(); ctx.moveTo(-36, -150); ctx.lineTo(36, -150); ctx.lineTo(46, -66); ctx.lineTo(-46, -66); ctx.closePath(); ctx.fill(); ctx.stroke();
      // braços: sobem e descem montando o lanche
      const by = Math.sin(braco) * 14;
      ctx.fillRect(-56, -146 + by, 18, 72); ctx.strokeRect(-56, -146 + by, 18, 72); ctx.fillRect(38, -146 - by, 18, 72); ctx.strokeRect(38, -146 - by, 18, 72);
      ctx.fillStyle = p.pele || '#C68E5E'; ctx.beginPath(); ctx.arc(-47, -68 + by, 9, 0, 7); ctx.arc(47, -68 - by, 9, 0, 7); ctx.fill();
      if (p.tipo === 'avental') { ctx.fillStyle = BEGE; ctx.fillRect(-28, -130, 56, 70); ctx.strokeRect(-28, -130, 56, 70); }
      ctx.fillStyle = p.pele || '#C68E5E'; ctx.beginPath(); ctx.arc(0, -184, 30, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(0, -190, 31, Math.PI, 0); ctx.fill();
      ctx.fillRect(-12, -186, 6, 6); ctx.fillRect(6, -186, 6, 6);
      if (p.chapeu === 'bone') { ctx.fillStyle = p.bone || TINTA; ctx.fillRect(-31, -216, 62, 22); ctx.fillRect(0, -198, 46, 8); ctx.strokeRect(-31, -216, 62, 22); }
      ctx.restore();
    }
    // um hambúrguer de cartaz (centro em x, y; s = escala)
    function burger(x, y, s = 1) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineWidth = 3; ctx.strokeStyle = TINTA;
      ctx.fillStyle = PAO; ctx.beginPath(); ctx.roundRect(-46, 14, 92, 20, 8); ctx.fill(); ctx.stroke();            // pão de baixo
      ctx.fillStyle = CARNE; ctx.beginPath(); ctx.roundRect(-50, -2, 100, 18, 8); ctx.fill(); ctx.stroke();         // carne
      ctx.fillStyle = AMA; ctx.beginPath(); ctx.moveTo(-50, -4); ctx.lineTo(50, -4); ctx.lineTo(40, 8); ctx.lineTo(28, -2); ctx.lineTo(10, 10);
      ctx.lineTo(-6, -2); ctx.lineTo(-26, 8); ctx.lineTo(-40, -2); ctx.closePath(); ctx.fill(); ctx.stroke();               // queijo
      ctx.fillStyle = VERM; ctx.fillRect(-42, -12, 84, 8); ctx.strokeRect(-42, -12, 84, 8);                             // tomate
      ctx.fillStyle = PAO; ctx.beginPath(); ctx.ellipse(0, -14, 50, 34, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();  // pão de cima
      ctx.fillStyle = BEGE; [[-24, -30], [-6, -38], [14, -32], [28, -22], [-30, -20]].forEach(([a, b]) => { ctx.beginPath(); ctx.ellipse(a, b, 4, 2.5, 0.4, 0, 7); ctx.fill(); });
      ctx.restore();
    }

    // as duas logos lado a lado, com a mesma altura (O Camarada e Coletivo Lufã)
    function duasLogos(cy, h, gap, p = 1) {
      if (p <= 0) return;
      const wa = h * L.img.ocV.width / L.img.ocV.height, wb = h * L.img.lufaV.width / L.img.lufaV.height, x0 = CX - (wa + gap + wb) / 2;
      ctx.save(); ctx.globalAlpha = clamp(p);
      ctx.drawImage(L.img.ocV, x0, cy - h / 2, wa, h);
      ctx.drawImage(L.img.lufaV, x0 + wa + gap, cy - h / 2, wb, h);
      ctx.restore();
    }

    // ------------------------------------------------ 0. o gancho: o vídeo de abertura numa moldura (o vídeo é sobreposto no juntar.sh)
    function gancho(lt) {
      L.fundo(ctx, BEGE);
      duasLogos(214, 120, 56, seg(lt, 0, 0.4));
      titulo(GANCHO_TITULO, seg(lt, 0.0, 0.6));
      if (GANCHO_CRED) cred(GANCHO_CRED, seg(lt, 0.2, 0.8));
      const { x, y, w, h } = JANELA;
      L.moldura(ctx, x, y, w, h, 30);
      ctx.fillStyle = TINTA; ctx.fillRect(x, y, w, h);                 // aqui entra o vídeo (juntar.sh)
      if (L.img.ganchoFim && t >= GANCHO - 0.1) ctx.drawImage(L.img.ganchoFim, x, y, w, h);
      L.texto(ctx, 'Vídeo: Jones Manoel no Podpah', CX, y + h + 72, { familia: FONTE.maquina, peso: 400, tam: 26, cor: TINTA, alinhar: 'center' });
    }

    // ------------------------------------------------ A. vinheta da série (3,5 s, música própria)
    function vinheta(lt) { arquivo = false; L.vinhetaComunismo(ctx, lt, { ep: 'EP. 3 · O QUE É MAIS-VALIA?', logo: L.img.logoBege }); }

    // ------------------------------------------------ 1. CARTAZ: das 8 horas, quantas são suas?
    function oito(lt) {
      fundoCartaz();
      carimbar('DAS 8 HORAS', 540, T.oito + 0.1, BEGE, 150, FONTE.manchete, 1, { erro: COR.vermelhoEscuro, desloc: 6 });
      carimbar('QUANTAS SÃO SUAS?', 680, T.oito + 0.5, AMA, 110, FONTE.bloco, 2);
      // a régua: aparece toda amarela; no "salário mínimo" o vermelho come da direita para a esquerda até sobrar 1h28
      const pago = lerp(8, 8 - 6.53, suave(seg(t, T.minimo + 0.3, T.menos + 0.2)));
      ctx.save(); ctx.translate(0, 0);
      regua(X0, 820, LARG, 150, pago, 8 * seg(t, T.oito + 0.9, T.oito + 1.8));
      ctx.restore();
      if (t >= T.minimo) L.etiqueta(ctx, 'QUEM GANHA 1 SALÁRIO MÍNIMO', CX, 1060, seg(t, T.minimo, T.minimo + 0.3), { cor: TINTA, tam: 40 });
      if (t >= T.menos) {
        L.etiqueta(ctx, '1h28 PRA VOCÊ', X0 + 120, 1180, seg(t, T.menos, T.menos + 0.3), { cor: AMA, corTexto: TINTA, tam: 38 });
        carimbar('TRABALHO NÃO PAGO', 1330, T.menos + 0.5, BEGE, 92, FONTE.bloco, 3);
      }
    }

    // ------------------------------------------------ 2. a hamburgueria (ARQUIVO)
    function lanchonete(lt) {
      L.fundo(ctx, BEGE);
      titulo('IMAGINA: UMA REDE DE HAMBÚRGUER', seg(lt, 0.1, 0.7));
      cred('exemplo com números redondos', seg(lt, 0.3, 0.9));
      // a tela de pedidos
      sombraCaixa(560, 440, 380, 220, TINTA, false);
      L.texto(ctx, 'PEDIDOS', 750, 494, { familia: FONTE.sub, peso: 600, tam: 34, cor: AMA, alinhar: 'center', tracking: 4 });
      const n = 148 + Math.floor(Math.max(0, lt - 0.3) / 0.7);
      ['#' + n, '#' + (n + 1), '#' + (n + 2)].forEach((s, i) =>
        L.texto(ctx, 'PEDIDO ' + s, 750, 552 + i * 40, { familia: FONTE.maquina, peso: 400, tam: 30, cor: i === 0 ? BEGE : 'rgba(237,224,196,0.45)', alinhar: 'center' }));
      // o trabalhador atrás do balcão, montando
      pessoa(300, 1150, { roupa: VERM, pele: '#8A5A3A', chapeu: 'bone', bone: VERM, tipo: 'avental' }, 1.35, t * 9);
      // o balcão
      ctx.fillStyle = 'rgba(28,23,20,0.35)'; ctx.fillRect(X0 + 12, 1032, LARG, 150);
      ctx.fillStyle = VERM; ctx.fillRect(X0, 1020, LARG, 150); ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.strokeRect(X0, 1020, LARG, 150);
      ctx.fillStyle = TINTA; ctx.fillRect(X0, 1020, LARG, 18);
      // o lanche e o preço
      if (t >= T.preco) {
        const e = ease.saida(seg(t, T.preco, T.preco + 0.4));
        burger(720, 900 - (1 - e) * 60, 1.6 * e + 0.01);
        L.etiqueta(ctx, 'R$ 25', 860, 800, seg(t, T.preco + 0.3, T.preco + 0.6), { cor: AMA, corTexto: TINTA, tam: 48 });
      }
      // os 40 lanches: pilha no balcão + contador
      if (t >= T.monta) {
        const q = suave(seg(t, T.monta, T.mil)), nL = Math.round(40 * q);
        for (let k = 0; k < Math.min(nL, 12); k++) burger(500 + (k % 6) * 72, 996 - Math.floor(k / 6) * 44, 0.62);
        L.texto(ctx, nL + ' LANCHES', X0 + 40, 1120, { familia: FONTE.bloco, peso: 400, tam: 64, cor: BEGE });
        L.texto(ctx, 'POR DIA', X0 + 40, 1150, { familia: FONTE.maquina, peso: 400, tam: 24, cor: BEGE });
      }
      if (t >= T.mil + 0.2) carimbar('= R$ 1.000', 1330, T.mil + 0.2, VERM, 130, FONTE.manchete, 11, { erro: TINTA, desloc: 5 });
    }

    // ------------------------------------------------ 3. o cupom do seu dia (ARQUIVO)
    function cupom(lt) {
      L.fundo(ctx, BEGE);
      titulo('A CONTA DO SEU DIA', seg(lt, 0.1, 0.6));
      cred('exemplo · números redondos e plausíveis', seg(lt, 0.3, 0.9));
      const LIN = [
        [T.cupom, 'VENDAS (40 x R$ 25)', 'R$ 1.000', 0],
        [T.carne, '(-) pão, carne, embalagem', 'R$ 360', 0],
        [T.luz, '(-) luz, gás, chapa', 'R$ 40', 0],
        [T.novo, '= VALOR NOVO: SEU TRABALHO', 'R$ 600', 1],
        [T.cem, 'SEU SALÁRIO', 'R$ 100', 0],
        [T.outras, 'NÃO PAGO: MAIS-VALIA', 'R$ 500', 1],
        [T.aluguel, '   aluguel', 'R$ 80', 0],
        [T.impostos, '   impostos', 'R$ 120', 0],
        [T.juros, '   juros do banco', 'R$ 40', 0],
        [T.marca, '   a marca', 'R$ 60', 0],
        [T.lucro, '   LUCRO DO DONO', 'R$ 200', 2],
      ];
      const vis = LIN.filter(([t0]) => t >= t0).length, y0 = 470, LH = 56;
      // o papel do cupom vai crescendo à medida que imprime
      const alto = lerp(130, 120 + LIN.length * LH, clamp(vis / LIN.length)), X1 = 170, W1 = 740;
      ctx.fillStyle = 'rgba(28,23,20,0.25)'; ctx.fillRect(X1 + 12, 432, W1, alto);
      ctx.fillStyle = PAPEL; ctx.fillRect(X1, 420, W1, alto);
      // serrilhado embaixo
      ctx.beginPath(); ctx.moveTo(X1, 420 + alto); for (let k = 0; k <= 37; k++) ctx.lineTo(X1 + k * 20, 420 + alto + (k % 2 ? 12 : 0)); ctx.lineTo(X1 + W1, 420 + alto); ctx.fill();
      L.texto(ctx, 'HAMBURGUERIA · CUPOM DO SEU DIA', CX, 462, { familia: FONTE.maquina, peso: 400, tam: 24, cor: TINTA, alinhar: 'center' });
      ctx.fillStyle = TINTA; for (let k = 0; k < 36; k++) ctx.fillRect(X1 + 20 + k * 20, 478, 10, 2);
      LIN.forEach(([t0, rot, val, dest], i) => {
        if (t < t0) return;
        const y = y0 + 64 + i * LH, p = seg(t, t0, t0 + 0.35);
        if (dest) {
          L.fonte(ctx, FONTE.maquina, 34, 400);
          L.selecao(ctx, X1 + 22, y - 40, W1 - 44, 52, seg(t, t0 + 0.4, t0 + 0.8), dest === 2 ? AMA : VERM);
        }
        L.texto(ctx, L.datilografar(rot, p), X1 + 30, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(rot, FONTE.maquina, 34, 400, 500), cor: TINTA });
        L.texto(ctx, L.datilografar(val, p), X1 + W1 - 30, y, { familia: FONTE.maquina, peso: 400, tam: 34, cor: TINTA, alinhar: 'right' });
        if (i === 2 || i === 4) { ctx.fillStyle = TINTA; for (let k = 0; k < 36; k++) ctx.fillRect(X1 + 20 + k * 20, y + 16, 10, 2); }
      });
      // a régua do dia: 1h20 pagam o salário, 6h40 não são pagas
      if (t >= T.hora) {
        const pago = lerp(8, 8 * 100 / 600, suave(seg(t, T.outras, T.outras + 1.0)));
        regua(X0, 1180, LARG, 96, t < T.outras ? 8 * 100 / 600 : pago, 8 * seg(t, T.hora, T.hora + 0.6));
        L.etiqueta(ctx, 'SEU SALÁRIO: 1h20', X0 + 150, 1340, seg(t, T.hora + 0.4, T.hora + 0.7), { cor: AMA, corTexto: TINTA, tam: 34 });
        if (t >= T.outras) L.etiqueta(ctx, '6h40 NÃO PAGAS', X0 + 600, 1340, seg(t, T.outras + 0.3, T.outras + 0.6), { cor: VERM, tam: 34 });
      }
    }

    // ------------------------------------------------ 4. CARTAZ: MAIS-VALIA (Marx em moldura)
    function maisValia(lt) {
      fundoCartaz();
      const e = ease.saida(seg(lt, 0, 0.5)), w = 300, h = 370, x = CX - w / 2, y = 440;
      ctx.save(); ctx.globalAlpha = clamp(e * 2); ctx.translate(0, (1 - e) * 120);
      L.moldura(ctx, x, y, w, h, 22);
      L.foto(ctx, L.img.marx, x, y, w, h, { desfoque: (1 - seg(lt, 0, 0.6)) * 8 });
      L.texto(ctx, 'Karl Marx · J. J. E. Mayall, 1875 · domínio público', CX, y + h + 60, { familia: FONTE.maquina, peso: 400, tam: 22, cor: BEGE, alinhar: 'center' });
      ctx.restore();
      carimbar('MAIS-VALIA', 1040, T.mvc, AMA, 200, FONTE.manchete, 41, { erro: COR.vermelhoEscuro, desloc: 8 });
      if (t >= T.npago) faixa('= O TRABALHO NÃO PAGO', 1240, T.npago, TINTA, BEGE, 60, 42);
    }

    // ------------------------------------------------ 5. por que o patrão pode fazer isso (ARQUIVO): a força de trabalho e a balança
    function porque(lt) {
      L.fundo(ctx, BEGE);
      titulo('O QUE O PATRÃO COMPRA?', seg(lt, 0.1, 0.6));
      cred('Marx, O Capital, Livro I (1867)', seg(lt, 0.3, 0.9));
      // a ficha
      const ef = ease.saida(seg(lt, 0.2, 0.6));
      ctx.save(); ctx.translate(0, (1 - ef) * 600);
      sombraCaixa(X0, 430, LARG, 200, COR.begeEscuro);
      L.texto(ctx, L.datilografar('Ele não paga o que você produz.', seg(t, T.porque + 0.6, T.porque + 1.4)), X0 + 40, 500, { familia: FONTE.maquina, peso: 400, tam: 40, cor: TINTA });
      L.texto(ctx, L.datilografar('Ele compra a sua', seg(t, T.forca - 1.2, T.forca - 0.4)), X0 + 40, 580, { familia: FONTE.maquina, peso: 400, tam: 40, cor: TINTA });
      L.fonte(ctx, FONTE.maquina, 40, 400); const w0 = ctx.measureText('Ele compra a sua ').width;
      if (t >= T.forca) {
        L.selecao(ctx, X0 + 36 + w0, 540, ctx.measureText('FORÇA DE TRABALHO.').width + 8, 56, seg(t, T.forca + 0.2, T.forca + 0.6), VERM);
        L.texto(ctx, L.datilografar('FORÇA DE TRABALHO.', seg(t, T.forca, T.forca + 0.5)), X0 + 40 + w0, 580, { familia: FONTE.maquina, peso: 400, tam: 40, cor: TINTA });
      }
      ctx.restore();
      // a balança: o que você custa (R$ 100) × o que você cria (R$ 600)
      if (t >= T.preco2) {
        const q = ease.saida(seg(t, T.preco2, T.preco2 + 0.5)), inc = 0.2 * suave(seg(t, T.preco2 + 1.0, T.preco2 + 2.0));
        ctx.save(); ctx.globalAlpha = q;
        const px = CX, py = 760;
        ctx.fillStyle = TINTA; ctx.fillRect(px - 10, py, 20, 400); ctx.fillRect(px - 120, py + 400, 240, 24);   // poste e base
        ctx.save(); ctx.translate(px, py); ctx.rotate(inc);
        ctx.fillRect(-330, -10, 660, 20);                                                                      // braço
        const prato = (sx, rot, cor, txt, val) => {
          ctx.save(); ctx.translate(sx, 0); ctx.rotate(-inc);
          ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-110, 150); ctx.moveTo(0, 0); ctx.lineTo(110, 150); ctx.stroke();
          ctx.fillStyle = cor; ctx.beginPath(); ctx.ellipse(0, 150, 130, 26, 0, 0, 7); ctx.fill(); ctx.stroke();
          L.texto(ctx, txt, 0, 225, { familia: FONTE.sub, peso: 600, tam: 30, cor: TINTA, alinhar: 'center', tracking: 2 });
          L.texto(ctx, val, 0, 290, { familia: FONTE.bloco, peso: 400, tam: 64, cor: rot, alinhar: 'center' });
          ctx.restore();
        };
        prato(-300, TINTA, AMA, 'O QUE VOCÊ CUSTA', 'R$ 100');
        prato(300, VERM, VERM, 'O QUE VOCÊ CRIA', 'R$ 600');
        // a pilha de lanches no prato da direita
        ctx.save(); ctx.translate(300, 0); ctx.rotate(-inc);
        for (let k = 0; k < 6; k++) burger(-50 + (k % 3) * 50, 112 - Math.floor(k / 3) * 34, 0.5);
        ctx.restore();
        ctx.restore();
        ctx.restore();
      }
      // o que você custa: comida, aluguel, transporte (etiquetas em linha, entre a base da balança e a faixa)
      [[T.comida, 'COMIDA', 270], [T.aluguel2, 'ALUGUEL', 540], [T.transporte, 'TRANSPORTE', 810]].forEach(([t0, s2, x]) => {
        if (t >= t0) L.etiqueta(ctx, s2, x, 1240, seg(t, t0, t0 + 0.3), { cor: AMA, corTexto: TINTA, tam: 32 });
      });
      if (t >= T.seutrab) faixa('O LUCRO VEM DO SEU TRABALHO', 1350, T.seutrab, TINTA, AMA, 54, 51);
    }

    // ------------------------------------------------ 6. o Brasil: três réguas (estimativa)
    function brasil(lt) {
      L.fundo(ctx, BEGE);
      titulo('QUANTAS HORAS NÃO SÃO PAGAS?', seg(lt, 0.1, 0.6));
      cred('estimativa não oficial · IBGE (Contas Nacionais 2025; PNAD Contínua 2º tri/2026)', seg(lt, 0.3, 0.9));
      const tDois = T.media + (T.minimo2 - T.media) * 0.55;
      const LIN = [[T.media, 'QUEM GANHA A MÉDIA · R$ 3.738', 4 + 38 / 60, '4h38'],
        [tDois, 'ATÉ 2 MÍNIMOS (7 EM CADA 10) · R$ 3.242', 5 + 4 / 60, '5h04'],
        [T.minimo2, 'QUEM GANHA O MÍNIMO · R$ 1.621', 6 + 32 / 60, '6h32']];
      LIN.forEach(([t0, rot, nao, hh], i) => {
        if (t < t0) return;
        const y = 470 + i * 300, e = ease.saida(seg(t, t0, t0 + 0.4));
        ctx.save(); ctx.globalAlpha = e;
        L.texto(ctx, rot, X0, y + 20, { familia: FONTE.sub, peso: 600, tam: tamMax(rot, FONTE.sub, 36, 600), cor: TINTA, tracking: 2 });
        const pago = lerp(8, 8 - nao, suave(seg(t, t0 + 0.3, t0 + 1.2)));
        regua(X0, y + 46, LARG, 110, pago, 8);
        ctx.restore();
        if (t >= t0 + 1.0) L.etiqueta(ctx, hh + ' NÃO PAGAS', X0 + LARG - 170, y + 210, seg(t, t0 + 1.0, t0 + 1.3), { cor: VERM, tam: 34 });
      });
      L.texto(ctx, 'conta: valor que cada pessoa ocupada produz por mês (VAB 2025 ÷ ocupados ÷ 12) ≈ R$ 8.861', CX, 1410,
        { familia: FONTE.maquina, peso: 400, tam: 19, cor: TINTA, alinhar: 'center' });
    }

    // ------------------------------------------------ 7. Marx, 1849 (ARQUIVO)
    function marx1849(lt) {
      L.fundo(ctx, BEGE);
      titulo('MARX JÁ ESCREVIA, EM 1849', seg(lt, 0.1, 0.6));
      cred('Trabalho Assalariado e Capital (marxists.org)', seg(lt, 0.3, 0.9));
      const e = ease.saida(seg(lt, 0.1, 0.6)), w = 240, h = 300, x = CX - w / 2, y = 430;
      ctx.save(); ctx.globalAlpha = clamp(e * 2);
      L.moldura(ctx, x, y, w, h, 18);
      L.foto(ctx, L.img.marx, x, y, w, h, { desfoque: (1 - seg(lt, 0.1, 0.7)) * 8 });
      L.texto(ctx, 'J. J. E. Mayall, 1875 · domínio público', CX, y + h + 46, { familia: FONTE.maquina, peso: 400, tam: 20, cor: TINTA, alinhar: 'center' });
      ctx.restore();
      const ef = ease.saida(seg(lt, 0.4, 0.8));
      ctx.save(); ctx.translate(0, (1 - ef) * 700);
      sombraCaixa(X0, 830, LARG, 520, COR.begeEscuro);
      const Q = ['“Trabalha para viver. […]', 'Para ele, quando termina', 'essa actividade é que começa', 'a sua vida, à mesa,', 'na taberna, na cama.”'];
      const tamF = tamMax(Q[2], FONTE.maquina, 46, 400, 770);
      L.fonte(ctx, FONTE.maquina, tamF, 400);
      if (t >= T.vida) L.selecao(ctx, X0 + 36 + ctx.measureText('essa actividade é que ').width, 1032, ctx.measureText('começa').width + 8, 60, seg(t, T.vida, T.vida + 0.4), VERM);
      if (t >= T.vida) L.selecao(ctx, X0 + 36, 1104, ctx.measureText('a sua vida').width + 8, 60, seg(t, T.vida + 0.4, T.vida + 0.8), VERM);
      Q.forEach((s, i) => L.texto(ctx, L.datilografar(s, seg(t, T.m1849 + 0.7 + i * 0.7, T.m1849 + 1.4 + i * 0.7)), X0 + 40, 920 + i * 72,
        { familia: FONTE.maquina, peso: 400, tam: tamF, cor: TINTA }));
      L.texto(ctx, 'Marx, Trabalho Assalariado e Capital, 1849', X0 + 40, 1320, { familia: FONTE.maquina, peso: 400, tam: 22, cor: TINTA });
      ctx.restore();
    }

    // ------------------------------------------------ 8. CARTAZ: quantas horas do seu dia são suas?
    function pergunta(lt) {
      fundoCartaz();
      carimbar('E AÍ, CAMARADA?', 520, T.final + 0.2, BEGE, 96, FONTE.bloco, 61);
      if (t >= T.quantas) {
        carimbar('QUANTAS HORAS', 720, T.quantas, BEGE, 130, FONTE.manchete, 62, { erro: COR.vermelhoEscuro, desloc: 6 });
        carimbar('DO SEU DIA', 870, T.quantas + 0.3, BEGE, 130, FONTE.manchete, 63, { erro: COR.vermelhoEscuro, desloc: 6 });
        carimbar('SÃO SUAS?', 1050, T.quantas + 0.6, AMA, 190, FONTE.manchete, 64, { erro: TINTA, desloc: 8 });
      }
      if (t >= T.conte) L.etiqueta(ctx, 'CONTA AQUI NOS COMENTÁRIOS ↓', CX, 1300, seg(t, T.conte, T.conte + 0.3), { cor: TINTA, tam: 40 });
    }

    // ------------------------------------------------ F. logo e créditos
    function final(lt) {
      L.fundo(ctx, BEGE); arquivo = false;
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 760, () => duasLogos(760, 380, 90), 97);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.6, 1.2);
      [['Vídeo de abertura: Jones Manoel no Podpah · Retrato de Marx: J. J. E. Mayall, 1875 · domínio público', 1090],
        ['Dados: IBGE (Contas Nacionais 2025; PNAD Contínua 2º tri/2026) · Decreto 12.797/2025', 1135],
        ['4intelligence (microdados da PNAD) · conta inspirada no post de @vermelhobrasa_ e Coletivo Lufã', 1170],
        ['Estimativa não oficial, com caráter formativo · a hamburgueria é um exemplo com números ilustrativos', 1215],
        ['Marx, O Capital, Livro I (1867) · Trabalho Assalariado e Capital (1849)', 1250]].forEach(([s2, y]) =>
        L.texto(ctx, s2, CX, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(s2, FONTE.maquina, 24, 400), cor: TINTA, alinhar: 'center' }));
      ctx.restore();
    }
  },
};
