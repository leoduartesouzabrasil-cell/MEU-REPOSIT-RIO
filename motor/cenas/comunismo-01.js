// "DESMISTIFICANDO O COMUNISMO" · EP. 1: O que é o comunismo? Roteiro: roteiros/comunismo-01-o-que-e.md
// A cena começa no GANCHO: o vídeo do Jones Manoel (0–16,3 s) numa moldura, recortado sem a legenda original dele e com a
// nossa legenda. O vídeo é sobreposto na janela pela montagem (audio/comunismo-01/juntar.sh).
// Ordem: vinheta → fábricas (anos 1800, criança na fábrica, lei de 1833) → Marx e Engels + Manifesto + a frase da luta de classes →
// quem trabalha × quem é dono → a padaria (500 pães, salário × lucro) → meios de produção × o que é seu ("comunista pode ter iPhone")
// → próximo episódio → logo. PRÉVIA sem narração; com a narração, T vem de comunismo-01.tempos.js.
//
// DIAGRAMAÇÃO PADRÃO: título y 330 · fonte dos dados y 384 · conteúdo x 120–960, y 420–1420 · legenda (tarja) y 1466–1542
const JONES = 16.3;   // o gancho: 0–16,3 s do vídeo do Jones Manoel, numa moldura (o vídeo entra na montagem: juntar.sh)
const T = Object.assign({
  vin: JONES, fab: JONES + 3.5, crianca: JONES + 6.4, lei: JONES + 7.8, marx: JONES + 10.4, engels: JONES + 11.1, manif: JONES + 12.6,
  frase: JONES + 14.4, sel: JONES + 16.4, classes: JONES + 18.6, dono: JONES + 19.6, padaria: JONES + 21.0, paes: JONES + 21.8,
  nenhum: JONES + 24.4, leva: JONES + 25.6, salario: JONES + 27.2, lucro: JONES + 28.0, meios: JONES + 30.2, seu: JONES + 32.8,
  iphone: JONES + 34.8, proximo: JONES + 38.2, logo: JONES + 41.8, dur: JONES + 45.4,
}, (window.TEMPOS || {}).marcas || {});
// janela do vídeo do Jones (o recorte 576×535 do original, sem a legenda dele, escalado para 840×780): x 120, y 450
const JANELA = { x: 120, y: 450, w: 840, h: 780 };
// legenda da fala do Jones no NOSSO padrão (transcrição com tempo por palavra; a legenda original dele fica fora do recorte)
const LEG_JONES = [{"t0": 0.0, "t1": 3.44, "p": [["Você", 0.0], ["está", 0.18], ["confundindo", 0.4], ["Marx", 1.02], ["com", 1.74], ["Jesus", 2.04], ["Cristo.", 2.3]]}, {"t0": 3.44, "t1": 6.02, "p": [["É", 3.44], ["a", 3.54], ["Bíblia", 3.64], ["Sagrada", 4.1], ["que", 4.76], ["fala:", 5.02]]}, {"t0": 6.08, "t1": 8.58, "p": [["“dai", 6.08], ["tudo", 6.24], ["aos", 6.64], ["pobres", 6.94], ["e", 7.46], ["me", 7.82], ["siga”.", 7.92]]}, {"t0": 8.58, "t1": 10.98, "p": [["Não", 8.58], ["é", 8.72], ["o", 8.9], ["Manifesto", 9.0], ["do", 9.54], ["Partido", 9.66], ["Comunista.", 9.94]]}, {"t0": 10.98, "t1": 12.86, "p": [["Nós,", 10.98], ["comunistas,", 11.28], ["a", 12.02], ["gente", 12.14], ["não", 12.28], ["defende", 12.46]]}, {"t0": 12.86, "t1": 13.78, "p": [["voto", 12.86], ["de", 13.18], ["pobreza.", 13.24]]}, {"t0": 13.78, "t1": 15.02, "p": [["Quem", 13.78], ["defende", 13.92], ["voto", 14.38], ["de", 14.64], ["pobreza", 14.74]]}, {"t0": 15.02, "t1": 16.3, "p": [["são", 15.02], ["os", 15.22], ["franciscanos.", 15.34]]}];

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: T.dur,
  imagens: {
    marx: '../midia/comunismo-01/marx-recorte.jpg',       // J. J. E. Mayall, 1875 (domínio público)
    engels: '../midia/comunismo-01/engels-recorte.jpg',   // retrato de Engels (domínio público)
    logoBege: '../identidade/marca/o-camarada-bege.png',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease, clamp } = L;
    const CX = 540, LARG = 840, X0 = 120, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta, AZUL = COR.azul;
    let arquivo = true;
    const OPERARIO = { roupa: AZUL, pele: '#8A5A3A', chapeu: 'bone' };
    const DONO = { roupa: TINTA, pele: '#E0B48A', tipo: 'terno', calca: TINTA, chapeu: 'cartola' };
    const PADEIRO = { roupa: BEGE, pele: '#5E3B26', tipo: 'avental', chapeu: 'padeiro' };

    const ordem = [[0, gancho], [T.vin, vinheta], [T.fab, fabricas], [T.marx, autores], [T.classes, classes], [T.padaria, padaria],
      [T.meios, meios], [T.proximo, proximo], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [T.lei, T.sel, T.nenhum, T.lucro, T.iphone, T.proximo + 0.1, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 10);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();

    [[T.vin, VERM, 24], [T.fab, BEGE, -24], [T.marx, BEGE, 24], [T.classes, BEGE, -24], [T.padaria, BEGE, 24], [T.meios, BEGE, -24],
      [T.proximo, VERM, 24], [T.logo, BEGE, -24]].forEach(([X, cor, ang]) => L.corteDiagonal(ctx, seg(t, X - 0.4, X), cor, ang));
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

    // ------------------------------------------------ 0. o gancho: o vídeo do Jones numa moldura (o vídeo é sobreposto na montagem)
    function gancho(lt) {
      L.fundo(ctx, BEGE);
      titulo('“É COMUNISTA, MAS TEM COISAS?”', seg(lt, 0.0, 0.6));
      cred('Jones Manoel, historiador', seg(lt, 0.2, 0.8));
      const { x, y, w, h } = JANELA;
      L.moldura(ctx, x, y, w, h, 30);
      ctx.fillStyle = TINTA; ctx.fillRect(x, y, w, h);                 // aqui entra o vídeo (juntar.sh)
      L.texto(ctx, 'Vídeo: Jones Manoel', CX, y + h + 80, { familia: FONTE.maquina, peso: 400, tam: 26, cor: TINTA, alinhar: 'center' });
    }

    // ------------------------------------------------ A. vinheta da série (3,5 s, música própria)
    function vinheta(lt) { arquivo = false; L.vinhetaComunismo(ctx, lt, { ep: 'EP. 1 · O QUE É O COMUNISMO?', logo: L.img.logoBege }); }

    // ------------------------------------------------ B. Europa das fábricas (ARQUIVO)
    function fabricas(lt) {
      L.fundo(ctx, BEGE);
      titulo('EUROPA · ANOS 1800', seg(lt, 0.1, 0.6));
      cred('a Revolução Industrial', seg(lt, 0.3, 0.9));
      const sobe = ease.saida(seg(lt, 0, 0.7));
      ctx.save(); ctx.translate(0, (1 - sobe) * 300);
      // céu de fuligem
      ctx.fillStyle = COR.begeEscuro; ctx.fillRect(X0, 430, LARG, 640);
      // chaminés com fumaça (recortadas na área do conteúdo: não sobem no título)
      ctx.save(); ctx.beginPath(); ctx.rect(X0, 430, LARG, 640); ctx.clip();
      [[230, 520], [470, 470], [800, 500]].forEach(([x, y], k) => {
        ctx.fillStyle = TINTA; ctx.fillRect(x - 22, y, 44, 430);
        ctx.fillStyle = VERM; ctx.fillRect(x - 22, y + 30, 44, 12);
        for (let i = 0; i < 7; i++) {
          const f = ((lt * 0.35 + i / 7 + k * 0.13) % 1), r = 26 + f * 70;
          ctx.fillStyle = `rgba(28,23,20,${0.55 * (1 - f)})`;
          ctx.beginPath(); ctx.arc(x + f * 90 + Math.sin(f * 6 + k) * 14, y - 20 - f * 260, r, 0, 7); ctx.fill();
        }
      });
      ctx.restore();
      // galpões com telhado serrilhado
      ctx.fillStyle = TINTA; ctx.fillRect(X0, 860, LARG, 210);
      for (let x = X0; x < X0 + LARG; x += 120) { ctx.beginPath(); ctx.moveTo(x, 860); ctx.lineTo(x + 120, 860); ctx.lineTo(x + 120, 790); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = AMA; for (let x = X0 + 30; x < X0 + LARG - 40; x += 90) for (let y = 900; y < 1040; y += 60) ctx.fillRect(x, y, 40, 30);
      // chão e a fila de operários entrando
      ctx.fillStyle = COR.begeEscuro; ctx.fillRect(X0, 1070, LARG, 330);
      ctx.fillStyle = 'rgba(28,23,20,0.25)'; ctx.fillRect(X0, 1070, LARG, 8);
      for (let k = 0; k < 6; k++) {
        const ph = (lt * 0.25 + k / 6) % 1, x = lerp(1000, 200, ph), crianca = k === 3;
        pessoa(x, 1330, { roupa: [AZUL, '#3A302A', VERM, '#6B5A48', AZUL, '#3A302A'][k], pele: ['#8A5A3A', '#E0B48A', '#5E3B26', '#C68E5E', '#E0B48A', '#8A5A3A'][k], chapeu: crianca ? null : 'bone' },
          crianca ? 0.62 : 0.95, ph * 20);
        if (crianca && t >= T.crianca) L.etiqueta(ctx, 'ATÉ CRIANÇA', x, 1110, seg(t, T.crianca, T.crianca + 0.3), { cor: VERM, tam: 34 });
      }
      ctx.restore();
      // ficha da lei de 1833
      if (t >= T.lei) {
        const e = ease.saida(seg(t, T.lei, T.lei + 0.4));
        ctx.save(); ctx.translate(0, (1 - e) * 700);
        ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(X0 + 14, 474, LARG, 470);
        ctx.fillStyle = BEGE; ctx.fillRect(X0, 460, LARG, 470); ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.strokeRect(X0, 460, LARG, 470);
        ctx.fillStyle = VERM; ctx.fillRect(X0, 460, LARG, 14);
        L.texto(ctx, 'INGLATERRA, 1833', X0 + 44, 550, { familia: FONTE.sub, peso: 600, tam: 48, cor: VERM, tracking: 3 });
        ['Só agora a lei proíbe criança', 'com menos de 9 anos', 'na fábrica de tecido.'].forEach((s, i) =>
          L.texto(ctx, L.datilografar(s, seg(t, T.lei + 0.4 + i * 0.4, T.lei + 0.8 + i * 0.4)), X0 + 44, 650 + i * 72, { familia: FONTE.maquina, peso: 400, tam: 46, cor: TINTA }));
        L.selecao(ctx, X0 + 40, 692, 460, 64, seg(t, T.lei + 1.6, T.lei + 2.0), VERM);
        L.texto(ctx, 'fonte: Parlamento britânico (Lei das Fábricas, 1833)', X0 + 44, 900, { familia: FONTE.maquina, peso: 400, tam: 22, cor: TINTA });
        ctx.restore();
      }
    }

    // ------------------------------------------------ C. Marx e Engels, o Manifesto e a frase (ARQUIVO)
    function autores(lt) {
      L.fundo(ctx, BEGE);
      titulo(t < T.manif ? 'DOIS ALEMÃES' : 'O MANIFESTO COMUNISTA · 1848', t < T.manif ? seg(lt, 0.1, 0.6) : seg(t, T.manif, T.manif + 0.6));
      cred(t < T.manif ? 'fotos de época, domínio público' : 'Londres, fevereiro de 1848', t < T.manif ? seg(lt, 0.3, 0.9) : seg(t, T.manif + 0.2, T.manif + 0.8));
      // os retratos: grandes no começo; quando entra o Manifesto, sobem e encolhem
      const enc = ease.saida(seg(t, T.manif, T.manif + 0.6));
      const W = lerp(330, 210, enc), H = lerp(400, 250, enc), y = lerp(500, 440, enc);
      [['marx', 'KARL MARX', lerp(160, 140, enc), T.marx], ['engels', 'FRIEDRICH ENGELS', lerp(590, 730, enc), T.engels]].forEach(([k, nome, x, t0]) => {
        const e = ease.saida(seg(t, t0, t0 + 0.5));
        if (e <= 0) return;
        ctx.save(); ctx.globalAlpha = clamp(e * 2); ctx.translate(0, (1 - e) * 120);
        L.moldura(ctx, x, y, W, H, lerp(26, 16, enc));
        L.foto(ctx, L.img[k], x, y, W, H, { desfoque: (1 - seg(t, t0, t0 + 0.6)) * 8 });
        L.etiqueta(ctx, nome, x + W / 2, y + H + lerp(70, 48, enc), seg(t, t0 + 0.3, t0 + 0.6), { cor: VERM, tam: lerp(34, 26, enc) });
        ctx.restore();
      });
      // a capa do Manifesto (desenho da edição de Londres, 1848)
      if (t >= T.manif) {
        const e = ease.saida(seg(t, T.manif, T.manif + 0.5)), x = 395, w = 290, h = 380, y0 = 470 + (1 - e) * 900;
        ctx.save(); ctx.translate(x + w / 2, y0 + h / 2); ctx.rotate(-0.03);
        ctx.fillStyle = 'rgba(28,23,20,0.35)'; ctx.fillRect(-w / 2 + 10, -h / 2 + 12, w, h);
        ctx.fillStyle = '#E8DAB8'; ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.strokeRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28);
        L.texto(ctx, 'Manifest', 0, -80, { familia: FONTE.serifa, peso: 400, tam: 64, cor: TINTA, alinhar: 'center' });
        L.texto(ctx, 'der', 0, -40, { familia: FONTE.serifa, peso: 400, tam: 30, cor: TINTA, alinhar: 'center' });
        L.texto(ctx, 'Kommunistischen', 0, 4, { familia: FONTE.serifa, peso: 400, tam: 38, cor: TINTA, alinhar: 'center' });
        L.texto(ctx, 'Partei.', 0, 48, { familia: FONTE.serifa, peso: 400, tam: 38, cor: TINTA, alinhar: 'center' });
        ctx.fillStyle = TINTA; ctx.fillRect(-60, 80, 120, 2);
        L.texto(ctx, 'London 1848', 0, 140, { familia: FONTE.serifa, peso: 400, tam: 26, cor: TINTA, alinhar: 'center' });
        ctx.restore();
      }
      // a frase do capítulo I, datilografada, com "luta de classes" selecionado
      if (t >= T.frase) {
        const L1 = '“A história de toda sociedade', L2 = 'até hoje é a história da', L3 = 'luta de classes.”';
        ctx.fillStyle = 'rgba(28,23,20,0.25)'; ctx.fillRect(X0 + 12, 952, LARG, 400);
        ctx.fillStyle = COR.begeEscuro; ctx.fillRect(X0, 940, LARG, 400);
        [[L1, 1040], [L2, 1110]].forEach(([s, y], i) =>
          L.texto(ctx, L.datilografar(s, seg(t, T.frase + i * 0.6, T.frase + 0.6 + i * 0.6)), X0 + 40, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(L1, FONTE.maquina, 52, 400, 760), cor: TINTA }));
        L.selecao(ctx, X0 + 36, 1150, 560, 84, seg(t, T.sel, T.sel + 0.5), VERM);
        L.texto(ctx, L.datilografar(L3, seg(t, T.frase + 1.2, T.frase + 1.8)), X0 + 40, 1215, { familia: FONTE.bloco, peso: 400, tam: 66, cor: VERM });
        L.texto(ctx, 'Manifesto Comunista, capítulo I (1848)', X0 + 40, 1300, { familia: FONTE.maquina, peso: 400, tam: 24, cor: TINTA });
      }
    }

    // ------------------------------------------------ D. quem trabalha × quem é dono (ARQUIVO)
    function classes(lt) {
      L.fundo(ctx, BEGE);
      titulo('LUTA DE CLASSES', seg(lt, 0.1, 0.6));
      cred('de um lado, quem trabalha; do outro, quem é dono', seg(lt, 0.3, 0.9));
      const e1 = ease.saida(seg(lt, 0, 0.5)), e2 = ease.saida(seg(t, T.dono, T.dono + 0.5));
      ctx.fillStyle = VERM; ctx.fillRect(X0, 470, 400 * e1, 820);
      if (e2 > 0) { ctx.fillStyle = AZUL; ctx.fillRect(X0 + LARG - 400 * e2, 470, 400 * e2, 820); }
      if (e1 > 0.5) {
        pessoa(X0 + 200, 1160, OPERARIO, 2.0);
        L.texto(ctx, 'QUEM', X0 + 200, 560, { familia: FONTE.grotesca, peso: 700, tam: 40, cor: BEGE, alinhar: 'center' });
        L.texto(ctx, 'TRABALHA', X0 + 200, 640, { familia: FONTE.bloco, peso: 400, tam: 62, cor: BEGE, alinhar: 'center' });
      }
      if (e2 > 0.5) {
        pessoa(X0 + LARG - 200, 1160, DONO, 2.0);
        L.texto(ctx, 'QUEM', X0 + LARG - 200, 560, { familia: FONTE.grotesca, peso: 700, tam: 40, cor: BEGE, alinhar: 'center' });
        L.texto(ctx, 'É DONO', X0 + LARG - 200, 640, { familia: FONTE.bloco, peso: 400, tam: 62, cor: BEGE, alinhar: 'center' });
        L.aplicarCarimbo(ctx, seg(t, T.dono + 0.3, T.dono + 0.6), CX, 880, () =>
          L.texto(ctx, '×', CX, 930, { familia: FONTE.manchete, peso: 900, tam: 200, cor: TINTA, alinhar: 'center' }), 21);
      }
    }

    // ------------------------------------------------ E. a padaria (2D, exemplo)
    function padaria(lt) {
      L.fundo(ctx, BEGE);
      titulo('PENSA NUMA PADARIA', seg(lt, 0.1, 0.6));
      cred('exemplo', seg(lt, 0.3, 0.9));
      // forno (de quem é dono) à esquerda
      ctx.fillStyle = '#6B4A2E'; ctx.fillRect(150, 640, 340, 380); ctx.strokeStyle = TINTA; ctx.lineWidth = 5; ctx.strokeRect(150, 640, 340, 380);
      ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(320, 860, 110, Math.PI, 0); ctx.lineTo(430, 960); ctx.lineTo(210, 960); ctx.fill();
      const brilho = 0.6 + 0.4 * Math.sin(lt * 9);
      ctx.fillStyle = `rgba(235,181,42,${brilho})`; ctx.beginPath(); ctx.arc(320, 900, 70, Math.PI, 0); ctx.fill();
      ctx.fillStyle = VERM; ctx.beginPath(); ctx.arc(320, 930, 40, Math.PI, 0); ctx.fill();
      ctx.fillStyle = TINTA; ctx.fillRect(280, 540, 80, 100);                                   // chaminé do forno
      L.etiqueta(ctx, 'O FORNO', 320, 1070, seg(lt, 0.4, 0.7), { cor: TINTA, tam: 30 });
      // padeiro
      pessoa(560, 1300, PADEIRO, 1.25, 0);
      L.etiqueta(ctx, 'PADEIRO', 560, 1350, seg(lt, 0.6, 0.9), { cor: VERM, tam: 30 });
      // contador de pães
      const n = Math.round(500 * ease.saida(seg(t, T.paes, T.paes + 2.4)));
      L.texto(ctx, String(n), 760, 640, { familia: FONTE.manchete, peso: 900, tam: 170, cor: TINTA, alinhar: 'center' });
      L.texto(ctx, 'PÃES POR DIA', 760, 700, { familia: FONTE.grotesca, peso: 700, tam: 34, cor: TINTA, alinhar: 'center', tracking: 3 });
      // pilha de pães: perto do padeiro, depois deslizando para o dono
      const leva = ease.saida(seg(t, T.leva, T.leva + 1.0)), donoE = ease.saida(seg(t, T.leva - 0.3, T.leva + 0.2));
      if (donoE > 0) pessoa(lerp(1200, 900, donoE), 1300, DONO, 1.25);
      const qtd = Math.min(24, Math.round(n / 500 * 24));
      for (let k = 0; k < qtd; k++) {
        const col = k % 6, lin = Math.floor(k / 6);
        const x = 640 + col * 46 + lerp(0, 120, leva), y = 1262 - lin * 30 - (k % 2) * 4;   // na bancada, à frente
        pao(x + (leva > 0 ? Math.sin(k) * 6 * (1 - leva) : 0), y);
      }
      if (t >= T.nenhum && t < T.leva + 0.5) L.aplicarCarimbo(ctx, seg(t, T.nenhum, T.nenhum + 0.3), 560, 800, () =>
        L.etiqueta(ctx, 'NENHUM É DELE', 560, 800, 1, { cor: VERM, tam: 44 }), 31);
      if (donoE > 0) L.etiqueta(ctx, 'DONO DO FORNO', lerp(1200, 900, donoE), 1350, seg(t, T.leva, T.leva + 0.3), { cor: AZUL, tam: 30 });
      // salário (uma moeda volta) × lucro (a pilha fica)
      if (t >= T.salario) {
        const q = ease.saida(seg(t, T.salario, T.salario + 0.6));
        moeda(lerp(880, 600, q), lerp(1000, 980, q) - Math.sin(q * Math.PI) * 120);
        if (q >= 1) L.etiqueta(ctx, 'SALÁRIO', 600, 910, seg(t, T.salario + 0.6, T.salario + 0.9), { cor: AMA, corTexto: TINTA, tam: 34 });
      }
      if (t >= T.lucro) L.aplicarCarimbo(ctx, seg(t, T.lucro, T.lucro + 0.3), 880, 900, () =>
        L.etiqueta(ctx, 'LUCRO', 880, 900, 1, { cor: AZUL, tam: 50 }), 33);
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

    // ------------------------------------------------ F. meios de produção × o que é seu
    function meios(lt) {
      L.fundo(ctx, BEGE);
      titulo('O QUE O COMUNISMO QUER', seg(lt, 0.1, 0.6));
      cred('Manifesto Comunista, cap. II · Engels (1893)', seg(lt, 0.3, 0.9));
      const cartao = (x, cor, cab, rod, icones, t0, seed) => {
        const e = ease.saida(seg(t, t0, t0 + 0.5));
        if (e <= 0) return;
        ctx.save(); ctx.translate(0, (1 - e) * 900);
        ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(x + 10, 482, 400, 700);
        ctx.fillStyle = COR.begeEscuro; ctx.fillRect(x, 470, 400, 700);
        ctx.fillStyle = cor; ctx.fillRect(x, 470, 400, 130);
        cab.forEach((s, i) => L.texto(ctx, s, x + 200, 525 + i * 52, { familia: FONTE.bloco, peso: 400, tam: tamMax(s, FONTE.bloco, 40, 400, 360), cor: BEGE, alinhar: 'center' }));
        icones.forEach(([fn, nome], i) => {
          const yy = 680 + i * 112, q = seg(t, t0 + 0.4 + i * 0.2, t0 + 0.7 + i * 0.2);
          if (q <= 0) return;
          ctx.save(); ctx.globalAlpha = q; fn(x + 90, yy); L.texto(ctx, nome, x + 160, yy + 14, { familia: FONTE.grotesca, peso: 700, tam: 36, cor: TINTA }); ctx.restore();
        });
        L.aplicarCarimbo(ctx, seg(t, t0 + 1.4, t0 + 1.7), x + 200, 1120, () => {
          ctx.fillStyle = cor; ctx.fillRect(x + 20, 1080, 360, 76);
          L.texto(ctx, rod, x + 200, 1132, { familia: FONTE.bloco, peso: 400, tam: tamMax(rod, FONTE.bloco, 40, 400, 330), cor: BEGE, alinhar: 'center' });
        }, seed);
        ctx.restore();
      };
      cartao(X0, VERM, ['MEIOS DE', 'PRODUÇÃO'], '→ DE TODOS', [[icFabrica, 'FÁBRICA'], [icTerra, 'TERRA'], [icMaquina, 'MÁQUINA'], [icForno, 'FORNO']], T.meios, 41);
      cartao(X0 + 440, AZUL, ['O QUE É', 'SEU'], '→ CONTINUA SEU', [[icCasa, 'CASA'], [icCarro, 'CARRO'], [icCelular, 'CELULAR'], [icRoupa, 'ROUPA']], T.seu, 42);
      if (t >= T.iphone) {
        L.aplicarCarimbo(ctx, seg(t, T.iphone, T.iphone + 0.3), CX, 1290, () => {
          ctx.save(); ctx.translate(CX, 1290); ctx.rotate(-0.03);
          ctx.fillStyle = TINTA; ctx.fillRect(-LARG / 2 - 10, -62, LARG + 20, 124);
          const s = 'COMUNISTA PODE TER IPHONE, SIM.';
          L.texto(ctx, s, 0, 20, { familia: FONTE.bloco, peso: 400, tam: tamMax(s, FONTE.bloco, 56, 400, 800), cor: AMA, alinhar: 'center' });
          ctx.restore();
        }, 45);
        ctx.save(); ctx.globalAlpha = seg(t, T.iphone + 0.6, T.iphone + 1.2);
        L.texto(ctx, '“O comunismo não tira a ninguém o poder de se apropriar de produtos sociais…”', CX, 1395,
          { familia: FONTE.serifa, estilo: 'italic', peso: 400, tam: tamMax('“O comunismo não tira a ninguém o poder de se apropriar de produtos sociais…”', FONTE.serifa, 30, 400), cor: TINTA, alinhar: 'center' });
        ctx.restore();
      }
    }
    // ícones simples (≈ 80×80, centro em x,y)
    function icFabrica(x, y) { ctx.fillStyle = TINTA; ctx.fillRect(x - 40, y - 10, 80, 40); ctx.beginPath(); ctx.moveTo(x - 40, y - 10); ctx.lineTo(x - 20, y - 30); ctx.lineTo(x - 20, y - 10); ctx.lineTo(x, y - 30); ctx.lineTo(x, y - 10); ctx.fill(); ctx.fillRect(x + 18, y - 45, 14, 40); }
    function icTerra(x, y) { ctx.fillStyle = '#9A6F0E'; ctx.fillRect(x - 40, y - 20, 80, 50); ctx.fillStyle = TINTA; for (let i = 0; i < 4; i++) ctx.fillRect(x - 36, y - 12 + i * 12, 72, 4); ctx.fillStyle = AMA; ctx.beginPath(); ctx.arc(x + 26, y - 34, 12, 0, 7); ctx.fill(); }
    function icMaquina(x, y) { ctx.fillStyle = TINTA; for (let i = 0; i < 8; i++) { ctx.save(); ctx.translate(x, y); ctx.rotate(i * Math.PI / 4); ctx.fillRect(-7, -36, 14, 14); ctx.restore(); } ctx.beginPath(); ctx.arc(x, y, 26, 0, 7); ctx.fill(); ctx.fillStyle = COR.begeEscuro; ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.fill(); }
    function icForno(x, y) { ctx.fillStyle = '#6B4A2E'; ctx.fillRect(x - 38, y - 30, 76, 60); ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(x, y + 22, 24, Math.PI, 0); ctx.fill(); ctx.fillStyle = AMA; ctx.beginPath(); ctx.arc(x, y + 24, 12, Math.PI, 0); ctx.fill(); }
    function icCasa(x, y) { ctx.fillStyle = BEGE; ctx.fillRect(x - 30, y - 10, 60, 44); ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.strokeRect(x - 30, y - 10, 60, 44); ctx.fillStyle = VERM; ctx.beginPath(); ctx.moveTo(x - 40, y - 8); ctx.lineTo(x, y - 40); ctx.lineTo(x + 40, y - 8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = TINTA; ctx.fillRect(x - 8, y + 10, 16, 24); }
    function icCarro(x, y) { ctx.fillStyle = AZUL; ctx.fillRect(x - 40, y - 4, 80, 26); ctx.beginPath(); ctx.moveTo(x - 24, y - 4); ctx.lineTo(x - 14, y - 24); ctx.lineTo(x + 16, y - 24); ctx.lineTo(x + 26, y - 4); ctx.fill(); ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(x - 22, y + 24, 10, 0, 7); ctx.arc(x + 22, y + 24, 10, 0, 7); ctx.fill(); }
    function icCelular(x, y) { ctx.fillStyle = TINTA; ctx.fillRect(x - 20, y - 38, 40, 76); ctx.fillStyle = AMA; ctx.fillRect(x - 14, y - 30, 28, 52); ctx.fillStyle = BEGE; ctx.beginPath(); ctx.arc(x, y + 30, 4, 0, 7); ctx.fill(); }
    function icRoupa(x, y) { ctx.fillStyle = VERM; ctx.beginPath(); ctx.moveTo(x - 16, y - 30); ctx.lineTo(x - 40, y - 16); ctx.lineTo(x - 30, y); ctx.lineTo(x - 22, y - 4); ctx.lineTo(x - 22, y + 34); ctx.lineTo(x + 22, y + 34); ctx.lineTo(x + 22, y - 4); ctx.lineTo(x + 30, y); ctx.lineTo(x + 40, y - 16); ctx.lineTo(x + 16, y - 30); ctx.lineTo(x, y - 22); ctx.closePath(); ctx.fill(); ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.stroke(); }

    // ------------------------------------------------ G. próximo episódio (CARTAZ)
    function proximo(lt) {
      arquivo = false;
      L.fundo(ctx, VERM);
      L.raios(ctx, CX, 1560, 2600, 20, -0.3 + L.emDois(t) * 0.05, 'rgba(237,224,196,0.13)');
      ctx.fillStyle = COR.vermelhoEscuro; ctx.beginPath(); ctx.arc(CX, 1560, 330, Math.PI, 0); ctx.fill();
      carimbar('PRÓXIMO EPISÓDIO:', 600, T.proximo + 0.1, BEGE, 70, FONTE.bloco, 51);
      carimbar('SOCIALISMO É A', 800, T.proximo + 0.4, AMA, 170, FONTE.manchete, 52, { erro: COR.vermelhoEscuro, desloc: 7 });
      carimbar('MESMA COISA?', 990, T.proximo + 0.6, AMA, 190, FONTE.manchete, 53, { erro: COR.vermelhoEscuro, desloc: 7 });
      if (t > T.proximo + 1.0) {
        ctx.save(); ctx.globalAlpha = seg(t, T.proximo + 1.0, T.proximo + 1.4);
        L.texto(ctx, 'DESMISTIFICANDO O COMUNISMO · COM LÉO DUARTE', CX, 1140, { familia: FONTE.manchete, peso: 900, tam: 40, cor: BEGE, alinhar: 'center', tracking: 3 });
        ctx.restore();
      }
    }

    // ------------------------------------------------ H. logo e créditos
    function final(lt) {
      L.fundo(ctx, BEGE); arquivo = false;
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 780, () => L.imagem(ctx, L.img.logo, CX, 780, 780), 97);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.6, 1.2);
      [['Gancho: Jones Manoel (vídeo)', 1110],
        ['Fotos: Marx (J. J. E. Mayall, 1875) e Engels · domínio público', 1150],
        ['Fontes: Manifesto Comunista (1848) · Lei das Fábricas (Parlamento britânico, 1833)', 1200],
        ['Engels, entrevista de 1893 (Marx e Engels, Entrevistas, Boitempo)', 1240],
        ['Padaria: exemplo ilustrativo', 1290]].forEach(([s2, y]) =>
        L.texto(ctx, s2, CX, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(s2, FONTE.maquina, 24, 400), cor: TINTA, alinhar: 'center' }));
      ctx.restore();
    }
  },
};
