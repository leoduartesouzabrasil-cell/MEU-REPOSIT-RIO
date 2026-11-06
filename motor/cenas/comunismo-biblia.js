// "QUEM DISSE ISSO? A BÍBLIA OU O COMUNISMO?" — jogo de adivinhação. Roteiro: roteiros/comunismo-biblia.md (v3)
// Sete frases que muita gente chamaria de "coisa de comunista": cinco estão na Bíblia; Che e Marx entram para confundir;
// a última está nos dois (2 Tessalonicenses 3:10 e Lênin, 1917). Fecho com Engels (cristianismo primitivo = movimento dos oprimidos).
// Cada rodada (ARQUIVO): ficha datilografada SEM autor → "BÍBLIA OU COMUNISTA?" com contagem 3-2-1 → resposta carimbada com a fonte.
// Os tempos vêm de comunismo-biblia.tempos.js (audio/comunismo-biblia/montar.py).
//
// DIAGRAMAÇÃO PADRÃO: título y 330 · fonte dos dados y 384 · conteúdo x 120–960, y 420–1420 · legenda (tarja) y 1466–1542
const T = Object.assign({
  desafio: 2.3, vamos: 11.7,
  r1: 12.7, q1: 14.4, f1: 19.5, a1: 23.2, ref1: 23.7, r2: 26.3, q2: 27.6, f2: 34.3, a2: 38.0, ref2: 38.4,
  r3: 41.0, q3: 42.8, f3: 46.9, a3: 49.7, ref3: 51.2, r4: 52.2, q4: 53.2, f4: 61.6, a4: 64.5, ref4: 65.9,
  r5: 69.2, q5: 71.0, f5: 76.6, a5: 80.1, ref5: 81.3, r6: 82.3, q6: 84.8, f6: 91.4, a6: 93.9, ref6: 94.8,
  r7: 98.4, com7: 100.1, q7: 104.6, f7: 106.6, a7: 110.1, ref7: 112.2, lenin7: 115.2,
  placar: 119.4, engels: 123.1, oprimidos: 127.3, proxima: 129.7, lembra: 134.3, acertou: 139.1, logo: 143.0, dur: 146.6,
}, (window.TEMPOS || {}).marcas || {});

// as rodadas: texto da ficha (o texto da fonte; "[…]" onde a fala encurtou), quem disse e a referência
const RODADAS = [
  { txt: '“O salário dos trabalhadores […] que vocês retiveram com fraude está clamando contra vocês.”', tipo: 'B', ref: 'TIAGO 5:4' },
  { txt: '“Ai de vocês que adquirem casas e mais casas, propriedades e mais propriedades, até não haver mais lugar para ninguém […]”', tipo: 'B', ref: 'ISAÍAS 5:8' },
  { txt: '“O revolucionário verdadeiro é guiado por grandes sentimentos de amor.”', tipo: 'C', nome: 'CHE GUEVARA', obra: ['O socialismo e o homem', 'em Cuba, 1965'],
    foto: 'che', credFoto: 'foto: Alberto Korda, 1960 · domínio público', zoom: 1.05, dy: 10 },
  { txt: '“Derrubou governantes dos seus tronos, mas exaltou os humildes. Encheu de coisas boas os famintos, mas despediu de mãos vazias os ricos.”', tipo: 'B', ref: 'LUCAS 1:52-53' },
  { txt: '“De cada um segundo as suas capacidades, a cada um segundo as suas necessidades!”', tipo: 'C', nome: 'KARL MARX', obra: ['Crítica do Programa', 'de Gotha, 1875'],
    foto: 'marx', credFoto: 'foto: J. J. E. Mayall · domínio público', zoom: 1.0, dy: 0 },
  { txt: '“[…] tinham tudo em comum. Vendiam suas propriedades e bens e os distribuíam conforme a necessidade de cada um.”', tipo: 'B', ref: 'ATOS 2:44-45' },
  { txt: '“Quem não trabalha não deve comer.”', tipo: 'AS DUAS', ref: '2 TESSALONICENSES 3:10', nome: 'LÊNIN', obra: ['O Estado e a', 'Revolução, 1917'],
    foto: 'lenin', credFoto: 'Pavel Zhukov, 1920 · dom. público', zoom: 1.15, dy: 40 },
];

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: T.dur,
  imagens: {
    che: '../midia/comunismo-biblia/che-korda-1960.jpg',        // Alberto Korda, 1960 · domínio público (PD-Cuba)
    marx: '../midia/comunismo-01/marx-recorte.jpg',              // J. J. E. Mayall, 1875 · domínio público
    engels: '../midia/comunismo-01/engels-recorte.jpg',          // domínio público
    lenin: '../midia/comunismo-02/lenin-1920.jpg',               // Pavel Zhukov, 1920 · domínio público
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease, clamp } = L;
    const CX = 540, LARG = 840, X0 = 120, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta, AZUL = COR.azul;
    let arquivo = true;

    const ordem = [[0, abertura], ...RODADAS.map((_, i) => [T['r' + (i + 1)], lt => rodada(i, lt)]),
      [T.placar, placar], [T.engels, engels], [T.proxima, recado], [T.acertou, acertou], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [0.4, 0.75, ...RODADAS.map((_, i) => T['a' + (i + 1)]), T.placar + 0.4, T.lembra + 0.6, T.acertou + 0.2, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 10);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();

    [[T.r1, BEGE, -24], ...RODADAS.slice(1).map((_, i) => [T['r' + (i + 2)], BEGE, i % 2 ? -24 : 24]),
      [T.placar, VERM, 24], [T.engels, BEGE, -24], [T.proxima, VERM, 24], [T.acertou, AMA, -24], [T.logo, BEGE, 24]]
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
        const x = CX + (i - 3) * gap, revelado = t >= T['a' + (i + 1)];
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

    // ------------------------------------------------ 0. abertura (CARTAZ): QUEM DISSE ISSO?
    function abertura(lt) {
      cartazFundo();
      carimbar('QUEM DISSE', CX, 600, 0.4, BEGE, 170, FONTE.manchete, 1, { erro: COR.vermelhoEscuro, desloc: 6 });
      carimbar('ISSO?', CX, 800, 0.75, AMA, 230, FONTE.manchete, 2, { erro: TINTA, desloc: 8 });
      if (t >= T.desafio) {
        ctx.save(); ctx.globalAlpha = seg(t, T.desafio, T.desafio + 0.4);
        L.texto(ctx, L.datilografar('UM DESAFIO PRA VOCÊ', seg(t, T.desafio, T.desafio + 0.8)), CX, 930, { familia: FONTE.sub, peso: 600, tam: 46, cor: BEGE, alinhar: 'center', tracking: 4 });
        ctx.restore();
      }
      if (t >= T.vamos - 2.5) {
        ctx.save(); ctx.translate(0, (1 - ease.saida(seg(t, T.vamos - 2.5, T.vamos - 2.0))) * 600);
        botoes(1110, {});
        ctx.restore();
      }
    }

    // ------------------------------------------------ 1–7. uma rodada do jogo (ARQUIVO)
    function rodada(i, lt) {
      const r = RODADAS[i], k = i + 1, q = T['q' + k], f = T['f' + k], a = T['a' + k], ref = T['ref' + k];
      L.fundo(ctx, BEGE);
      titulo(k === 7 ? 'A ÚLTIMA: BÍBLIA OU COMUNISTA?' : 'BÍBLIA OU COMUNISTA?', seg(lt, 0.05, 0.6));
      cred(`rodada ${k} de 7`, seg(lt, 0.2, 0.7));
      pontos(440, i);
      // a ficha com a frase, sem autor
      const fy = 500, fh = 440, e = ease.saida(seg(lt, 0, 0.4));
      ctx.save(); ctx.translate(0, (1 - e) * 900);
      ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(X0 + 14, fy + 14, LARG, fh);
      ctx.fillStyle = COR.begeEscuro; ctx.fillRect(X0, fy, LARG, fh); ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.strokeRect(X0, fy, LARG, fh);
      ctx.fillStyle = VERM; ctx.fillRect(X0, fy, LARG, 12);
      const tamF = k === 7 ? 64 : r.txt.length > 120 ? 40 : 46;
      const linhas = quebrar(r.txt, FONTE.maquina, tamF, LARG - 90);
      const passo = tamF * 1.4, y0 = fy + fh / 2 - (linhas.length - 1) * passo / 2 + tamF * 0.35;
      if (k === 7 && t < q) {   // "comenta aqui embaixo": antes da frase, o convite
        L.texto(ctx, L.datilografar('COMENTA AÍ:', seg(t, T.com7, T.com7 + 0.5)), CX, fy + 190, { familia: FONTE.sub, peso: 600, tam: 56, cor: VERM, alinhar: 'center', tracking: 4 });
        L.texto(ctx, L.datilografar('BÍBLIA OU COMUNISTA?', seg(t, T.com7 + 0.4, T.com7 + 1.1)), CX, fy + 280, { familia: FONTE.sub, peso: 600, tam: 56, cor: TINTA, alinhar: 'center', tracking: 4 });
      } else if (t < q) {
        L.texto(ctx, '?', CX, fy + fh / 2 + 70, { familia: FONTE.manchete, peso: 900, tam: 220, cor: 'rgba(28,23,20,0.18)', alinhar: 'center' });
      }
      datilografarLinhas(linhas, seg(t, q, f), k === 7 ? CX : X0 + 45, y0, passo,
        { familia: FONTE.maquina, peso: 400, tam: tamF, cor: TINTA, alinhar: k === 7 ? 'center' : 'left' });
      ctx.restore();
      // os botões + contagem 3-2-1 (entre o fim da frase e a resposta)
      const yb = 1060;
      if (t >= q - 0.2) {
        ctx.save(); ctx.globalAlpha = seg(t, q - 0.2, q + 0.2);
        botoes(yb, t >= a ? { acende: r.tipo, p: seg(t, a, a + 0.3) } : {});
        ctx.restore();
        contagem(CX, yb, f, a);
      }
      if (k === 7 && t >= a) {
        carimbar('AS DUAS!', CX, 915, a, AMA, 110, FONTE.manchete, 77, { erro: TINTA, desloc: 7, larg: 520 });
      }
      // a resposta: referência bíblica ou o comunista (foto + obra)
      const yr = 1200;
      if (r.tipo === 'B' && t >= ref) {
        carimbar(r.ref, CX, yr + 110, ref, TINTA, 120, FONTE.bloco, 30 + k, { larg: 780 });
        if (t >= ref + 0.3) {
          ctx.save(); ctx.globalAlpha = seg(t, ref + 0.3, ref + 0.6);
          L.texto(ctx, 'BÍBLIA · tradução NVI', CX, yr + 175, { familia: FONTE.maquina, peso: 400, tam: 28, cor: TINTA, alinhar: 'center' });
          ctx.restore();
        }
      }
      if (r.tipo === 'C' && t >= a) comunista(r, X0 + 70, yr - 10, a, 1);
      if (r.tipo === 'AS DUAS' && t >= ref) {
        // à esquerda a Bíblia, à direita Lênin
        carimbar('2 TESSALONICENSES', X0 + 200, yr + 50, ref, TINTA, 40, FONTE.bloco, 71, { larg: 380 });
        carimbar('3:10', X0 + 200, yr + 140, ref + 0.15, TINTA, 90, FONTE.bloco, 72, { larg: 380 });
        if (t >= ref + 0.3) {
          ctx.save(); ctx.globalAlpha = seg(t, ref + 0.3, ref + 0.6);
          L.texto(ctx, 'BÍBLIA · NVI', X0 + 200, yr + 190, { familia: FONTE.maquina, peso: 400, tam: 26, cor: TINTA, alinhar: 'center' });
          ctx.restore();
        }
        if (t >= T.lenin7) comunista(r, CX + 30, yr - 10, T.lenin7, 0.8);
      }
    }
    // foto do comunista em moldura + nome + obra, crédito logo abaixo da foto
    function comunista(r, x, y, t0, esc) {
      const e = ease.saida(seg(t, t0, t0 + 0.4)), w = 150 * esc / 0.8 * 0.8, h = 180 * esc / 0.8 * 0.8;
      ctx.save(); ctx.globalAlpha = clamp(e * 2); ctx.translate(0, (1 - e) * 80);
      L.moldura(ctx, x, y, w, h, 14);
      L.foto(ctx, L.img[r.foto], x, y, w, h, { zoom: r.zoom, dy: r.dy * esc, desfoque: (1 - seg(t, t0, t0 + 0.5)) * 6 });
      L.texto(ctx, r.credFoto, x + w / 2, y + h + 34, { familia: FONTE.maquina, peso: 400, tam: tamMax(r.credFoto, FONTE.maquina, 16, 400, w + 90), cor: TINTA, alinhar: 'center' });
      const xt = x + w + 40;
      L.texto(ctx, r.nome, xt, y + 62, { familia: FONTE.bloco, peso: 400, tam: tamMax(r.nome, FONTE.bloco, 64 * esc, 400, 960 - xt), cor: VERM });
      r.obra.forEach((s, j) => L.texto(ctx, s, xt, y + 110 + j * 38 * esc, { familia: FONTE.maquina, peso: 400, tam: tamMax(s, FONTE.maquina, 30 * esc, 400, 960 - xt), cor: TINTA }));
      ctx.restore();
    }

    // ------------------------------------------------ 8. placar (CARTAZ)
    function placar(lt) {
      cartazFundo();
      carimbar('PLACAR', CX, 520, T.placar + 0.05, BEGE, 130, FONTE.manchete, 81, { erro: COR.vermelhoEscuro, desloc: 6 });
      const n = Math.round(lerp(0, 5, ease.saida(seg(t, T.placar + 0.4, T.placar + 1.4))));
      const m = Math.round(lerp(0, 2, ease.saida(seg(t, T.placar + 0.4, T.placar + 1.4))));
      L.texto(ctx, String(n), 330, 870, { familia: FONTE.manchete, peso: 900, tam: 320, cor: AMA, alinhar: 'center', erro: TINTA, desloc: 8 });
      L.texto(ctx, '×', CX, 800, { familia: FONTE.manchete, peso: 900, tam: 120, cor: BEGE, alinhar: 'center' });
      L.texto(ctx, String(m), 750, 870, { familia: FONTE.manchete, peso: 900, tam: 320, cor: BEGE, alinhar: 'center', erro: TINTA, desloc: 8 });
      L.texto(ctx, 'NA BÍBLIA', 330, 960, { familia: FONTE.bloco, peso: 400, tam: 46, cor: AMA, alinhar: 'center' });
      L.texto(ctx, 'SÓ DE COMUNISTA', 750, 960, { familia: FONTE.bloco, peso: 400, tam: 40, cor: BEGE, alinhar: 'center' });
      ctx.save(); ctx.translate(0, 0);
      ctx.fillStyle = BEGE; ctx.fillRect(CX - 220, 1040, 440, 90);
      pontos(1085, -1, 40, 58);
      ctx.restore();
      if (t >= T.placar + 1.6) {
        ctx.save(); ctx.globalAlpha = seg(t, T.placar + 1.6, T.placar + 2.0);
        L.texto(ctx, 'de 7 frases · a última está nos dois', CX, 1200, { familia: FONTE.maquina, peso: 400, tam: 30, cor: BEGE, alinhar: 'center' });
        ctx.restore();
      }
    }

    // ------------------------------------------------ 9. Engels (ARQUIVO)
    function engels(lt) {
      L.fundo(ctx, BEGE);
      titulo('ATÉ O ENGELS NOTOU', seg(lt, 0.1, 0.6));
      cred('Contribuição para a História do Cristianismo Primitivo (1894–95)', seg(lt, 0.3, 0.9));
      const x = 370, y = 450, w = 340, h = 410, e = ease.saida(seg(lt, 0.1, 0.6));
      ctx.save(); ctx.globalAlpha = clamp(e * 2); ctx.translate(0, (1 - e) * 120);
      L.moldura(ctx, x, y, w, h, 24);
      L.foto(ctx, L.img.engels, x, y, w, h, { desfoque: (1 - seg(lt, 0.1, 0.7)) * 8 });
      L.texto(ctx, 'Friedrich Engels · domínio público', CX, y + h + 60, { familia: FONTE.maquina, peso: 400, tam: 22, cor: TINTA, alinhar: 'center' });
      ctx.restore();
      if (lt > 0.6) {
        const q = ease.saida(seg(lt, 0.6, 1.0));
        ctx.save(); ctx.translate(0, (1 - q) * 500);
        ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(X0 + 12, 1032, LARG, 380);
        ctx.fillStyle = COR.begeEscuro; ctx.fillRect(X0, 1020, LARG, 380);
        const L1 = '“O cristianismo era, na origem,', L2 = 'o movimento dos oprimidos.”';
        L.texto(ctx, L.datilografar(L1, seg(lt, 1.0, 1.8)), X0 + 40, 1120, { familia: FONTE.maquina, peso: 400, tam: 46, cor: TINTA });
        L.fonte(ctx, FONTE.maquina, 46, 400); const wSel = ctx.measureText('o movimento dos oprimidos.”').width;
        L.selecao(ctx, X0 + 36, 1150, wSel + 8, 66, seg(t, T.oprimidos, T.oprimidos + 0.5), VERM);
        L.texto(ctx, L.datilografar(L2, seg(lt, 1.8, 2.6)), X0 + 40, 1200, { familia: FONTE.maquina, peso: 400, tam: 46, cor: TINTA });
        ['dos escravos', 'dos pobres', 'dos sem direito'].forEach((s2, i) => L.etiqueta(ctx, s2.toUpperCase(), X0 + 150 + i * 270, 1310, seg(t, T.oprimidos + 0.6 + i * 0.25, T.oprimidos + 0.9 + i * 0.25), { cor: VERM, tam: 28 }));
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
      [['Bíblia: Nova Versão Internacional (NVI) · Tiago 5:4 · Isaías 5:8 · Lucas 1:52-53 · Atos 2:44-45 · 2 Ts 3:10', 1060],
        ['Che Guevara, O socialismo e o homem em Cuba (1965) · Marx, Crítica do Programa de Gotha (1875)', 1100],
        ['Lênin, O Estado e a Revolução (1917) · Engels, Contribuição para a História do Cristianismo Primitivo (1894–95)', 1140],
        ['Fotos (domínio público): Che, Alberto Korda (1960) · Marx, J. J. E. Mayall · Lênin, Pavel Zhukov (1920) · Engels', 1190]]
        .forEach(([s2, y]) => L.texto(ctx, s2, CX, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(s2, FONTE.maquina, 24, 400), cor: TINTA, alinhar: 'center' }));
      ctx.restore();
    }
  },
};
