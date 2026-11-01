// "Renan Santos: da direita para a extrema-direita": continuação da "Esquerda cirandeira".
// A régua volta, os comentários tinham razão, o dossiê mostra as falas e o plano, a régua é corrigida e a ciranda fecha a ligação.
// PRÉVIA sem narração (tempos estimados). Com a narração, os tempos de T vêm de renan-santos.tempos.js.
// Render: node motor/render.js renan-santos saida/renan-santos.mp4 --audio audio/renan-santos/previa.wav
//
// DIAGRAMAÇÃO PADRÃO: título y 330 · fonte dos dados y 384 · conteúdo x 120–960, y 420–1420 · legenda (tarja) y 1466–1542
const T = Object.assign({
  titulo: 0.3, pan: 0.5, c1: 4.0, c2: 4.8, c3: 5.6, razao: 7.4,
  dossie: 9.6, mbl: 10.6, missao: 11.4, votos: 12.2, f1: 14.2, f2: 18.0, f3: 21.8, f4: 26.0,
  cartaz: 30.6, extrema: 32.2, corrige: 34.6, risco: 35.2, pula: 35.9, corrigida: 37.4, visao: 39.4,
  ciranda: 43.0, cresce: 45.0, terno: 47.0, mesmo: 48.8, radical: 51.0, comente: 53.4, logo: 56.4, dur: 59.6,
}, (window.TEMPOS || {}).marcas || {});

// a MESMA régua do vídeo da esquerda cirandeira (faixas, fotos, etiquetas e enquadramento manual)
const FAIXAS = [['ESQUERDA RADICALIZADA', '#8A1411'], ['ESQUERDA', '#C8201E'], ['CENTRO', '#EBB52A'], ['DIREITA', '#4A6488'], ['EXTREMA-DIREITA', '#1F3A5F']];
const REGUA = [
  ['JONES MANOEL', 'jones', 0, 'QUER TROCAR A MÚSICA', [0.5, 0.4, 0.7]],
  ['ELIAS JABBOUR', 'jabbour', 0, 'QUER TROCAR A MÚSICA', [0.48, 0.33, 0.4]],
  ['ERIKA HILTON', 'erika', 1, 'DERRUBOU A 6x1', [0.36, 0.55, 0.9]],
  ['RICK AZEVEDO', 'rick', 1, 'DERRUBOU A 6x1', [0.5, 0.46, 0.74]],
  ['DILMA ROUSSEFF', 'dilma', 1, 'BANCO DO BRICS', [0.5, 0.5, 0.95]],
  ['LULA', 'lula', 1, 'O DONO DA RODA', [0.54, 0.4, 0.62]],
  ['ANDRÉ JANONES', 'janones', 1, 'EXÉRCITO DO LULA', [0.5, 0.48, 0.95]],
  ['GERALDO ALCKMIN', 'alckmin', 2, 'EX-PSDB', [0.82, 0.74, 0.5]],
  ['CIRO GOMES', 'ciro', 2, 'FOI PRO PSDB + PL', [0.5, 0.45, 0.7]],
  ['DAVI ALCOLUMBRE', 'alcolumbre', 2, 'DANÇA COM TODO GOVERNO', [0.48, 0.48, 0.75]],
  ['RENAN SANTOS', 'renan', 3, 'MBL', [0.58, 0.45, 0.78]],
  ['NIKOLAS FERREIRA', 'nikolas', 4, '3,1 MI DE VOTOS', [0.5, 0.3, 0.42]],
  ['LUCAS PAVANATO', 'pavanato', 4, '3 MI DE VOTOS', [0.5, 0.45, 0.7]],
  ['FLÁVIO BOLSONARO', 'flavio', 4, 'PERDEU O 2º TURNO', [0.47, 0.43, 0.42]],
  ['JAIR BOLSONARO', 'bolsonaro', 4, 'NO FIM DA FILA', [0.377, 0.49, 0.5]],
];
const RENAN = 10;

// o dossiê: data/contexto, a fala (linhas), a linha selecionada, apoio e fontes
const FICHAS = [
  ['f1', '1º/8/2026 · LANÇAMENTO DA CANDIDATURA', ['“Nós vamos', 'matar', 'quem roubar.”'], 1, null,
    'fonte: Estado de Minas/Folhapress · Bem Paraná'],
  ['f2', '26/8/2026 · ENTREVISTA NA GLOBO', ['“Vai ter um', 'regime de exceção', 'em favelas.”'], 1, null,
    'fonte: Correio da Manhã · NSC Total · A Crítica'],
  ['f3', 'PLANO DE GOVERNO (“LIVRO AMARELO”)', ['direito penal do inimigo', '+ superpresídios', 'no modelo do Cecot'], 2, 'O PRESÍDIO DE BUKELE',
    'fonte: Gazeta do Povo · Agência Pública · Congresso em Foco'],
  ['f4', 'BOMBA ATÔMICA: SAIR DO TRATADO DE NÃO PROLIFERAÇÃO?', ['“Necessariamente,', 'e no momento', 'certo.”'], 0, null,
    'fonte: NSC Total (Globo, 26/8/2026) · SBT News'],
];
const M = '../midia/esquerda-cirandeira/';

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: T.dur,
  imagens: {
    jones: M + 'jones-2026-tse.jpg', jabbour: M + 'jabbour-2025.jpg', erika: M + 'erika-2026.jpg', rick: M + 'rick-2026.jpg',
    dilma: M + 'dilma-2026.jpg', lula: M + 'lula-2026.jpg', janones: M + 'janones-2026.jpg', alckmin: M + 'alckmin-2026.jpg',
    ciro: M + 'ciro-2026-tse.jpg', alcolumbre: M + 'alcolumbre-2026.jpg', renan: M + 'renan-2026.jpg', nikolas: M + 'nikolas-2026.jpg',
    pavanato: M + 'pavanato-2026-tse.jpg', flavio: M + 'flavio-2026.jpg', bolsonaro: M + 'bolsonaro-2025.jpg',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease } = L;
    const CX = 540, LARG = 840, X0 = 120, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta;
    const ESP = 350, wx = i => i * ESP, yR = 1160;
    let arquivo = true;

    const ordem = [[0, abertura], [T.dossie, dossie], [T.cartaz, cartaz], [T.corrige, corrige], [T.ciranda, ciranda],
      [T.radical, bandeira], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [T.razao, T.cartaz, T.extrema, T.pula + 1.2, T.mesmo, T.radical, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 12);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();

    [[T.dossie, BEGE, -24], [T.cartaz, AMA, 24], [T.corrige, BEGE, -24], [T.ciranda, BEGE, 24], [T.radical, VERM, -24], [T.logo, BEGE, 24]]
      .forEach(([X, cor, ang]) => L.corteDiagonal(ctx, seg(t, X - 0.4, X), cor, ang));
    if (arquivo) L.varredura(ctx, t, 0.08);
    IMP.forEach(X => L.flash(ctx, t, X, AMA, 0.25, 0.3));
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);
    legenda();

    // ------------------------------------------------ componentes padronizados (iguais aos da esquerda cirandeira)
    function legenda() {
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
    function cred(txt, p, cor = TINTA, y = 384) {
      if (p <= 0) return;
      L.texto(ctx, L.datilografar(txt, p * 2), CX, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(txt, FONTE.maquina, 22, 400), cor, alinhar: 'center' });
    }
    function linha(txt, y, p, cor = TINTA, tam = 46) {
      L.texto(ctx, L.datilografar(txt, p), CX, y, { familia: FONTE.grotesca, peso: 700, tam: tamMax(txt, FONTE.grotesca, tam), cor, alinhar: 'center' });
    }
    function bloco(txt, y, cor, tam, fundo) {
      if (fundo) { ctx.fillStyle = fundo[0]; ctx.fillRect(X0, fundo[1], LARG, fundo[2]); }
      L.texto(ctx, txt, CX, y, { familia: FONTE.bloco, peso: 400, tam: tamMax(txt, FONTE.bloco, tam, 400, LARG - 50), cor, alinhar: 'center' });
    }
    // retrato redondo com o enquadramento manual de cada foto (janela quadrada → círculo); corAnel troca a cor da faixa
    function retrato(i, cx, cy, r, anel = 8, corAnel = null) {
      const [, chave, faixa, , [fx, fy, lado]] = REGUA[i], img = L.img[chave];
      const base = Math.max(2 * r / img.width, 2 * r / img.height), s0 = 2 * r / (lado * img.height), zoom = s0 / base;
      const iw = img.width * s0, ih = img.height * s0;
      ctx.save(); ctx.fillStyle = corAnel || FAIXAS[faixa][1]; ctx.beginPath(); ctx.arc(cx, cy, r + anel, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();
      L.foto(ctx, img, cx - r, cy - r, 2 * r, 2 * r, { pb: true, zoom, dx: (0.5 - fx) * iw, dy: (0.5 - fy) * ih, retic: false });
      ctx.restore();
    }
    function corTextoFaixa(f) { return FAIXAS[f][1] === '#EBB52A' ? '#9A6F0E' : FAIXAS[f][1]; }
    // bonequinho de ciranda (silhueta); terno = 0..1 veste paletó (lapela bege + gravata)
    function boneco(x, y, cor, esc = 1, terno = 0) {
      ctx.save(); ctx.translate(x, y); ctx.scale(esc, esc); ctx.fillStyle = cor;
      ctx.beginPath(); ctx.arc(0, -52, 26, 0, 7); ctx.fill(); ctx.fillRect(-20, -26, 40, 70);
      if (terno > 0) {
        ctx.globalAlpha = terno; ctx.fillStyle = BEGE;
        ctx.beginPath(); ctx.moveTo(-11, -26); ctx.lineTo(11, -26); ctx.lineTo(0, 2); ctx.fill();
        ctx.fillStyle = VERM; ctx.beginPath(); ctx.moveTo(-3, -24); ctx.lineTo(3, -24); ctx.lineTo(4, -4); ctx.lineTo(0, 2); ctx.lineTo(-4, -4); ctx.fill();
      }
      ctx.restore();
    }
    // a régua estática: barra, nomes das faixas, fotos e nomes (usada na abertura)
    function reguaInteira(X, opts = {}) {
      REGUA.forEach(([, , faixa], i) => { const x0 = X(wx(i) - ESP / 2); ctx.fillStyle = FAIXAS[faixa][1]; ctx.fillRect(x0, yR, ESP + 1, 34); });
      FAIXAS.forEach(([nome], f) => {
        const i0 = REGUA.findIndex(r => r[2] === f), i1 = REGUA.length - 1 - [...REGUA].reverse().findIndex(r => r[2] === f);
        L.texto(ctx, nome, X((wx(i0) + wx(i1)) / 2), yR + 74, { familia: FONTE.grotesca, peso: 700, tam: 34, cor: corTextoFaixa(f), alinhar: 'center' });
      });
      REGUA.forEach(([nome], i) => {
        const x = X(wx(i)), r = 118, y = yR - 300;
        if (x < -150 || x > 1230) return;
        ctx.strokeStyle = TINTA; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y + r); ctx.lineTo(x, yR); ctx.stroke();
        retrato(i, x, y, r, 9);
        if (i !== RENAN || !opts.semNomeRenan)
          L.texto(ctx, nome, x, yR + 120, { familia: FONTE.grotesca, peso: 700, tam: tamMax(nome, FONTE.grotesca, 26, 700, 300), cor: TINTA, alinhar: 'center' });
      });
    }

    // ------------------------------------------------ A. a régua volta: a câmera corre até o Renan, na direita
    function abertura(lt, t) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.003 }, () => L.planta(ctx, 63, TINTA, 0.06));
      titulo('LEMBRA DA RÉGUA?', seg(t, T.titulo, T.titulo + 0.6));
      cred('do vídeo "esquerda cirandeira"', seg(t, T.titulo + 0.6, T.titulo + 1.6));
      const pan = seg(t, T.pan, T.pan + 2.6), e = pan < 0.5 ? 4 * pan ** 3 : 1 - (-2 * pan + 2) ** 3 / 2;
      const camX = lerp(wx(1), wx(RENAN), e), X = w => CX + (w - camX);
      reguaInteira(X);
      const xr = X(wx(RENAN)), yr = yR - 300;
      if (pan >= 1) L.selecao(ctx, xr - 140, yr - 140, 280, 280, seg(t, T.pan + 2.6, T.pan + 3.1), VERM);
      // os comentários do post, empilhados acima da foto
      [['ISSO É EXTREMA-DIREITA', T.c1, VERM, -70], ['RÉGUA ERRADA', T.c2, TINTA, 110], ['RENAN NA DIREITA??', T.c3, TINTA, -40]]
        .forEach(([s, t0, cor, ox], k) => L.etiqueta(ctx, s, CX + ox, 470 + k * 78, seg(t, t0, t0 + 0.3), { cor, corTexto: BEGE, tam: 30 }));
      if (t >= T.razao) {                                                            // carimbo: vocês tinham razão
        const pa = seg(t, T.razao, T.razao + 0.3);
        ctx.fillStyle = `rgba(15,12,11,${0.85 * pa})`; ctx.fillRect(0, 0, 1080, 1920);
        L.aplicarCarimbo(ctx, pa, CX, 900, () => {
          bloco('VOCÊS', 850, BEGE, 90);
          L.texto(ctx, 'TINHAM RAZÃO.', CX, 1010, { tam: Math.min(170, L.ajustar(ctx, 'TINHAM RAZÃO.', FONTE.manchete, LARG)), cor: AMA, alinhar: 'center', erro: VERM, desloc: 7 });
        }, 201);
      }
    }

    // ------------------------------------------------ B. o dossiê: moldura + quatro fichas datilografadas
    function dossie(lt, t) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.004 }, () => L.planta(ctx, 71, TINTA, 0.07));
      titulo('O DOSSIÊ', seg(lt, 0, 0.5));
      if (t < T.f1) {
        // retrato em moldura dourada, com o foco entrando
        const x = 330, y = 470, w = 420, h = 470, img = L.img.renan, z = 1.25;
        const s = Math.max(w / img.width, h / img.height) * z, pf = seg(t, T.dossie + 0.1, T.dossie + 1.0);
        L.moldura(ctx, x, y, w, h, 40);
        L.foto(ctx, img, x, y, w, h, { pb: true, zoom: z, desfoque: (1 - pf) * 14, dx: (0.5 - 0.6) * img.width * s, dy: (0.5 - 0.42) * img.height * s });
        cred('Foto: Paulo Pinto / Agência Brasil', seg(t, T.dossie + 0.6, T.dossie + 1.4), TINTA, 1010);
        L.texto(ctx, 'RENAN SANTOS', CX, 1090, { familia: FONTE.bloco, peso: 400, tam: 56, cor: TINTA, alinhar: 'center' });
        [['FUNDADOR DO MBL', T.mbl, TINTA], ['CANDIDATO DO MISSÃO', T.missao, '#4A6488'], ['4º LUGAR · 2,7 MI DE VOTOS', T.votos, VERM]]
          .forEach(([s, t0, cor], k) => L.etiqueta(ctx, s, CX, 1175 + k * 82, seg(t, t0, t0 + 0.3), { cor, corTexto: BEGE, tam: 32 }));
        return;
      }
      // cabeçalho fixo: retrato pequeno + nome
      retrato(RENAN, 210, 510, 66, 7);
      L.texto(ctx, 'RENAN SANTOS', 300, 505, { familia: FONTE.bloco, peso: 400, tam: 44, cor: TINTA });
      L.texto(ctx, 'MBL · MISSÃO · CANDIDATO A PRESIDENTE EM 2026', 302, 548, { familia: FONTE.maquina, peso: 400, tam: 22, cor: TINTA });
      const i = FICHAS.filter(([k]) => t >= T[k]).length - 1, [k, data, linhas, sel, apoio, fonte] = FICHAS[i], t0 = T[k];
      const ent = ease.saida(seg(t, t0, t0 + 0.45)), ang = (i % 2 ? 1.2 : -1.2) * Math.PI / 180;
      ctx.save(); ctx.translate(CX + (1 - ent) * 900, 1010); ctx.rotate(ang);
      // a ficha de arquivo: papel claro, borda de tinta, número da ficha
      ctx.fillStyle = 'rgba(28,23,20,0.25)'; ctx.fillRect(-412, -342, 840, 720);
      ctx.fillStyle = '#F4EAD2'; ctx.fillRect(-420, -350, 840, 720);
      ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.strokeRect(-404, -334, 808, 688);
      L.texto(ctx, `FICHA ${i + 1}/4`, 380, -290, { familia: FONTE.sub, peso: 600, tam: 26, cor: VERM, alinhar: 'right', tracking: 2 });
      L.texto(ctx, L.datilografar(data, seg(t, t0 + 0.3, t0 + 1.0)), -380, -290, { familia: FONTE.maquina, peso: 400, tam: tamMax(data, FONTE.maquina, 28, 400, 600), cor: TINTA });
      ctx.fillStyle = TINTA; ctx.fillRect(-380, -258, 760, 3);
      const tamQ = Math.min(96, ...linhas.map(s => L.ajustar(ctx, s, FONTE.serifa, 720, 400))), y0 = -90 - (linhas.length - 3) * 40;
      linhas.forEach((s, j) => {
        const y = y0 + j * tamQ * 1.15, ws = s.split(' '), ti = t0 + 0.9 + j * 0.45;
        if (j === sel) {
          L.fonte(ctx, FONTE.serifa, tamQ, 400, 'italic');
          const w = ctx.measureText(s).width;
          L.selecao(ctx, -w / 2 - 10, y - tamQ * 0.78, w + 20, tamQ * 1.0, seg(t, t0 + 2.0, t0 + 2.5), VERM);
        }
        L.palavras(ctx, ws.map((p, q) => [p, ti + q * 0.12]), t, 0, y, { tam: tamQ, cor: j === sel && t > t0 + 2.3 ? VERM : TINTA, espaco: 0.28 });
      });
      if (apoio) L.etiqueta(ctx, apoio, 0, 200, seg(t, t0 + 2.4, t0 + 2.7), { cor: '#1F3A5F', corTexto: BEGE, tam: 30 });
      L.texto(ctx, L.datilografar(fonte, seg(t, t0 + 1.0, t0 + 2.0)), 0, 320, { familia: FONTE.maquina, peso: 400, tam: tamMax(fonte, FONTE.maquina, 22, 400, 740), cor: TINTA, alinhar: 'center' });
      ctx.restore();
    }

    // ------------------------------------------------ C. CARTAZ: isso não é direita / é extrema-direita
    function cartaz(lt, t) {
      arquivo = false;
      L.fundo(ctx, AMA);
      L.raios(ctx, CX, 1100, 2400, 22, lt * 0.12, 'rgba(200,32,30,0.30)');
      L.aplicarCarimbo(ctx, seg(t, T.cartaz + 0.1, T.cartaz + 0.4), CX, 640, () => {
        bloco('ISSO NÃO É', 600, TINTA, 96);
        L.texto(ctx, 'DIREITA.', CX, 790, { tam: Math.min(230, L.ajustar(ctx, 'DIREITA.', FONTE.manchete, LARG)), cor: VERM, alinhar: 'center', erro: TINTA, desloc: 7 });
      }, 211);
      if (t >= T.extrema) {
        const pe = seg(t, T.extrema, T.extrema + 0.3);
        // a faixa vermelha entra na diagonal, como no cartaz soviético
        ctx.save(); ctx.translate(CX, 1060); ctx.rotate(-6 * Math.PI / 180);
        ctx.fillStyle = VERM; ctx.fillRect(-700 + (1 - ease.saida(pe)) * -1400, -150, 1400, 300); ctx.restore();
        L.aplicarCarimbo(ctx, seg(t, T.extrema + 0.15, T.extrema + 0.45), CX, 1060, () => {
          ctx.save(); ctx.translate(CX, 1060); ctx.rotate(-6 * Math.PI / 180);
          L.texto(ctx, 'É EXTREMA-', 0, -10, { familia: FONTE.bloco, peso: 400, tam: tamMax('É EXTREMA-', FONTE.bloco, 120, 400, 800), cor: BEGE, alinhar: 'center', erro: COR.vermelhoEscuro, desloc: 5 });
          L.texto(ctx, 'DIREITA.', 0, 120, { familia: FONTE.bloco, peso: 400, tam: tamMax('É EXTREMA-', FONTE.bloco, 120, 400, 800), cor: AMA, alinhar: 'center', erro: COR.vermelhoEscuro, desloc: 5 });
          ctx.restore();
        }, 213);
      }
    }

    // ------------------------------------------------ D. régua corrigida: a foto pula da direita para a extrema-direita
    function corrige(lt, t) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.002 }, () => L.planta(ctx, 65, TINTA, 0.06));
      titulo(t >= T.corrigida ? 'RÉGUA CORRIGIDA' : 'A RÉGUA', t >= T.corrigida ? seg(t, T.corrigida, T.corrigida + 0.5) : 1, t >= T.corrigida ? VERM : TINTA);
      cred('fotos: Agência Brasil · Câmara dos Deputados · TSE · Wikimedia Commons (créditos no final)', seg(lt, 0.3, 1.3));
      const m = ease.saida(seg(t, T.pula, T.pula + 1.2)), mm = seg(t, T.pula, T.pula + 1.2);
      // posição de cada um: a extrema-direita abre espaço e o Renan entra na frente dela
      const pos = i => i < RENAN ? wx(i) : i === RENAN ? lerp(wx(RENAN), wx(RENAN + 1), m) : wx(i + m);
      const fim = wx(14 + m);
      const v = ease.saida(seg(t, T.visao, T.visao + 1.4)), total = wx(15);
      const camX = lerp(lerp(wx(RENAN) + ESP * 0.3, wx(RENAN) + ESP * 0.8, m), total / 2, v);
      const esc = lerp(1, 860 / (total + 300), v), yB = lerp(yR, 980, v);
      const X = w => CX + (w - camX) * esc;
      // a barra: até o centro igual; a direita fica com o lugar vago; a extrema-direita cresce
      for (let i = 0; i <= RENAN; i++) {
        const f = REGUA[i][2], x0 = X(wx(i) - ESP / 2), x1 = X(wx(i) + ESP / 2);
        ctx.fillStyle = FAIXAS[f][1]; ctx.fillRect(x0, yB, x1 - x0 + 1, 34 * lerp(1, 0.7, v));
      }
      ctx.fillStyle = FAIXAS[4][1]; ctx.fillRect(X(wx(RENAN) + ESP / 2), yB, X(fim + ESP / 2) - X(wx(RENAN) + ESP / 2), 34 * lerp(1, 0.7, v));
      const faixaTxt = (nome, f, xm) => L.texto(ctx, nome, xm, yB + 74 * lerp(1, 0.6, v), { familia: FONTE.grotesca, peso: 700, tam: lerp(34, 15, v), cor: corTextoFaixa(f), alinhar: 'center' });
      [[0, 0, 1], [1, 2, 6], [2, 7, 9]].forEach(([f, a, b]) => faixaTxt(FAIXAS[f][0], f, X((wx(a) + wx(b)) / 2)));
      faixaTxt('DIREITA', 3, X(wx(RENAN)));
      faixaTxt('EXTREMA-DIREITA', 4, X((wx(RENAN + 1) + fim) / 2));
      // o lugar vago na direita: círculo tracejado com "?"
      const r = lerp(118, 24, v), yF = yB - lerp(300, 60, v);
      if (m > 0.3) {
        ctx.save(); ctx.globalAlpha = seg(mm, 0.3, 0.8); ctx.setLineDash([14 * esc + 2, 12 * esc + 2]); ctx.strokeStyle = '#4A6488'; ctx.lineWidth = lerp(6, 2, v);
        ctx.beginPath(); ctx.arc(X(wx(RENAN)), yF, r, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        L.texto(ctx, '?', X(wx(RENAN)), yF + r * 0.42, { familia: FONTE.manchete, tam: r * 1.3, cor: '#4A6488', alinhar: 'center' });
        ctx.restore();
      }
      // todas as fotos (o Renan por último, por cima)
      [...REGUA.keys()].filter(i => i !== RENAN).concat([RENAN]).forEach(i => {
        const [nome] = REGUA[i], x = X(pos(i));
        if (x < -150 || x > 1230) return;
        const salto = i === RENAN ? Math.sin(Math.PI * mm) * lerp(260, 60, v) : 0, y = yF - salto;
        ctx.strokeStyle = i === RENAN && mm > 0 && mm < 1 ? 'rgba(0,0,0,0)' : TINTA; ctx.lineWidth = lerp(5, 2, v);
        ctx.beginPath(); ctx.moveTo(x, y + r); ctx.lineTo(x, yB); ctx.stroke();
        retrato(i, x, y, r, lerp(9, 3, v), i === RENAN && mm > 0.5 ? FAIXAS[4][1] : null);
        if (v < 0.5) {
          ctx.save(); ctx.globalAlpha = 1 - v * 2;
          L.texto(ctx, nome, x, yB + 120, { familia: FONTE.grotesca, peso: 700, tam: tamMax(nome, FONTE.grotesca, 26, 700, 300), cor: TINTA, alinhar: 'center' });
          ctx.restore();
        }
        // o X vermelho na foto, ainda na direita
        if (i === RENAN && t >= T.risco && mm <= 0) {
          const pr = seg(t, T.risco, T.risco + 0.35), d = r * 0.9;
          ctx.save(); ctx.strokeStyle = VERM; ctx.lineWidth = 16; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x - d, y - d); ctx.lineTo(x - d + 2 * d * Math.min(1, pr * 2), y - d + 2 * d * Math.min(1, pr * 2)); ctx.stroke();
          if (pr > 0.5) { const q = (pr - 0.5) * 2; ctx.beginPath(); ctx.moveTo(x + d, y - d); ctx.lineTo(x + d - 2 * d * q, y - d + 2 * d * q); ctx.stroke(); }
          ctx.restore();
        }
        if (i === RENAN && mm >= 1 && v < 0.5) {
          ctx.save(); ctx.globalAlpha = 1 - v * 2;
          L.etiqueta(ctx, 'EXTREMA-DIREITA', x, y - r - 70, seg(t, T.pula + 1.2, T.pula + 1.5), { cor: FAIXAS[4][1], corTexto: BEGE, tam: 34 });
          ctx.restore();
        }
      });
      if (v > 0.5) linha('AGORA, NO LUGAR CERTO.', 1150, seg(t, T.visao + 0.8, T.visao + 1.6), TINTA, 44);
    }

    // ------------------------------------------------ E. a ligação: a ciranda gira enquanto a extrema-direita cresce de terno
    function ciranda(lt, t) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.006 }, () => L.planta(ctx, 61, TINTA, 0.07));
      linha('ENQUANTO A ESQUERDA CIRANDEIRA DANÇA…', 470, seg(t, T.ciranda + 0.2, T.ciranda + 1.2), TINTA, 40);
      if (t >= T.cresce) linha('…A EXTREMA-DIREITA CRESCE E TROCA DE ROUPA', 540, seg(t, T.cresce, T.cresce + 1.2), '#1F3A5F', 40);
      const n = 12, R = 150, rx = 360, cy = 980, rot = lt * 0.5;
      ctx.save(); ctx.strokeStyle = TINTA; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(rx, cy, R, 0, 7); ctx.stroke();
      for (let k = 0; k < n; k++) {
        const a = rot + k * 2 * Math.PI / n;
        boneco(rx + Math.cos(a) * R, cy + Math.sin(a) * R, k < 6 ? VERM : k < 9 ? '#4A6488' : '#B98516', 0.72);
      }
      ctx.restore();
      [['ESQUERDA', 190, VERM, BEGE], ['CENTRÃO', 360, '#4A6488', BEGE], ['MERCADO', 530, '#B98516', TINTA]].forEach(([s, x, cor, ct]) =>
        L.etiqueta(ctx, s, x, 1250, 1, { cor, corTexto: ct, tam: 24 }));
      // o boneco da extrema-direita: cresce e veste terno
      const pc = ease.saida(seg(t, T.cresce, T.cresce + 2.2)), esc = lerp(0.7, 3.4, pc);
      boneco(770, 1190 - 44 * esc, '#1F3A5F', esc, seg(t, T.terno, T.terno + 0.5));
      if (t >= T.cresce) L.etiqueta(ctx, 'EXTREMA-DIREITA', 770, 1250, seg(t, T.cresce, T.cresce + 0.3), { cor: '#1F3A5F', corTexto: BEGE, tam: 24 });
      if (t >= T.terno && t < T.mesmo) linha('MUDA O PARTIDO, MUDA O TERNO…', 1370, seg(t, T.terno, T.terno + 1.0), VERM, 40);
      if (t >= T.mesmo) {
        const pm = seg(t, T.mesmo, T.mesmo + 0.3);
        ctx.fillStyle = `rgba(15,12,11,${0.82 * pm})`; ctx.fillRect(0, 0, 1080, 1920);
        L.aplicarCarimbo(ctx, pm, CX, 900, () => bloco('O PROJETO É O MESMO.', 935, BEGE, 84, [VERM, 830, 160]), 221);
      }
    }

    // ------------------------------------------------ F. radicalize-se (a bandeira do primeiro vídeo)
    function bandeira(lt, t) {
      arquivo = false;
      L.fundo(ctx, COR.carvao);
      L.raios(ctx, CX, 1900, 2300, 24, -0.4 + L.emDois(t) * 0.06, 'rgba(200,32,30,0.28)');
      const fx = 170, fy = 840, fw = 760, fh = 440;
      L.mastro(ctx, fx, fy - 10, 1700, BEGE);
      for (let i = 0, n2 = 90; i < n2; i++) {
        const kk = i / n2, ond = Math.sin(kk * 7 - t * 5) * 22 * kk, luz = Math.cos(kk * 7 - t * 5);
        const mk = L.clamp(0.5 - luz * 0.5) * 0.55;
        ctx.fillStyle = `rgb(${lerp(200, 138, mk) | 0},${lerp(32, 20, mk) | 0},${lerp(30, 17, mk) | 0})`;
        ctx.fillRect(fx + 9 + kk * fw, fy + ond, fw / n2 + 1, fh * (1 - kk * 0.12));
      }
      const k = 0.17, onda = Math.sin(k * 7 - t * 5) * 22 * k;
      L.estrelaContorno(ctx, fx + 9 + fw * k, fy + 66 + onda, 38, AMA);
      L.foiceMartelo(ctx, fx + 9 + fw * k + 4, fy + 195 + onda, 140, AMA);
      L.aplicarCarimbo(ctx, seg(t, T.radical, T.radical + 0.3), CX, 560, () =>
        L.texto(ctx, 'RADICALIZE-SE.', CX, 600, { tam: L.ajustar(ctx, 'RADICALIZE-SE.', FONTE.manchete, LARG), cor: BEGE, alinhar: 'center', erro: VERM, desloc: 7 }), 231);
      if (t >= T.comente) L.aplicarCarimbo(ctx, seg(t, T.comente, T.comente + 0.3), CX, 1380, () => {
        ctx.fillStyle = AMA; ctx.fillRect(X0, 1300, LARG, 170);
        L.texto(ctx, 'E VOCÊ: ONDE ELE FICA', CX, 1372, { familia: FONTE.bloco, peso: 400, tam: tamMax('E VOCÊ: ONDE ELE FICA', FONTE.bloco, 56, 400, LARG - 60), cor: VERM, alinhar: 'center' });
        L.texto(ctx, 'NA SUA RÉGUA?', CX, 1442, { familia: FONTE.bloco, peso: 400, tam: tamMax('E VOCÊ: ONDE ELE FICA', FONTE.bloco, 56, 400, LARG - 60), cor: TINTA, alinhar: 'center' });
      }, 233);
    }

    function final(lt) {
      L.fundo(ctx, BEGE); arquivo = false;
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 780, () => L.imagem(ctx, L.img.logo, CX, 780, 780), 97);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.6, 1.2);
      [['Fotos: Paulo Pinto, Lula Marques, Bruno Peres, Marcelo Camargo, Joédson Alves / Agência Brasil (CC BY 3.0 BR)', 1110],
        ['Bruno Spada, Kayo Magalhães / Câmara dos Deputados (CC BY 3.0) · TSE (CC BY 4.0) · Luiza Valente (CC0)', 1150],
        ['Fontes: Estado de Minas/Folhapress · Correio da Manhã · NSC Total · Gazeta do Povo', 1200],
        ['Agência Pública · Congresso em Foco · SBT News · Bem Paraná · A Crítica', 1240]].forEach(([s, y]) =>
        L.texto(ctx, s, CX, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(s, FONTE.maquina, 22, 400), cor: TINTA, alinhar: 'center' }));
      ctx.restore();
    }
  },
};
