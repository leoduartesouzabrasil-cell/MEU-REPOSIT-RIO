// "Okê, caboclo" — Umbanda, caboclos e os indígenas vivos. Paleta preto/vermelho/amarelo (modo TENSO).
// Tempos: umbanda-caboclos.tempos.js (gerado por audio/umbanda-caboclos/montar.py).
// Render: node motor/render.js umbanda-caboclos saida/umbanda-caboclos.mp4 --audio audio/umbanda-caboclos/mix.wav
// MARGEM SEGURA: todo texto/imagem importante fica em x 90–930 e y 250–1500 (botões e legenda do Reels nas bordas).
const M = window.TEMPOS.marcas;
const PAL = window.TEMPOS.legendas.flatMap(l => l.p);
const W = (w, depois = 0) => (PAL.find(([p, t]) => t >= depois && p.toLowerCase().startsWith(w.toLowerCase())) || [0, 1e9])[1];
const IMPACTOS = [M.pensa, M.n258, M.voz, M.sauda, M.demarcacao, M.logo];

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: window.TEMPOS.dur,
  imagens: {
    terreiro: '../midia/umbanda-caboclos/terreiro-rj-2016.jpg',
    branca: '../midia/umbanda-caboclos/roupa-branca-2024.jpg',
    atlA: '../midia/umbanda-caboclos/atl-2025-a.webp',
    atlB: '../midia/umbanda-caboclos/atl-2025-b.webp',
    marcha: '../midia/umbanda-caboclos/marcha-2025.jpg',
    pecas: '../midia/umbanda-caboclos/pecas-sagradas-2024.jpg',
    retomada: '../midia/indigenas-ms/panambi-2024.webp',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease } = L;
    const FUNDO = COR.carvao, TXT = COR.bege, VERM = COR.vermelho, AMA = COR.amarelo, SANGUE = COR.sangue;
    const CX = 510, LARG = 820;                  // centro e largura úteis (margem segura)
    let legenda = true, arquivo = true;

    const ordem = [[0, abertura], [M.gira, gira], [M.reverencia, mata], [M.roupa - 1.0, roupaBranca], [M.origem, origem],
      [M.pensa, pensa], [M.milhao, vivos], [M.ano2025, mortos], [M.terra, terra], [M.voz, voz], [M.naoda, espirito],
      [M.votar, votar], [M.sauda, chamado], [M.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();

    const { dx, dy } = L.tremor(t, IMPACTOS, 20);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();

    [[M.origem, SANGUE, 24], [M.naoda, VERM, -24], [M.sauda, SANGUE, 24], [M.logo, SANGUE, -24]]
      .forEach(([T, cor, ang]) => L.corteDiagonal(ctx, seg(t, T - 0.4, T), cor, ang));
    if (legenda) {
      ctx.save(); ctx.fillStyle = 'rgba(15,12,11,0.55)'; ctx.fillRect(0, 1340, 1080, 110); ctx.restore();
      L.legenda(ctx, window.TEMPOS.legendas, t, 1418, { cor: TXT, cx: CX, tam: 62 });
    }
    if (arquivo) L.varredura(ctx, t, 0.12);
    IMPACTOS.forEach(T => L.flash(ctx, t, T, VERM, 0.3, 0.45));
    L.papel(ctx, t, 0.15); L.vinheta(ctx, 0.55);

    // ------------------------------------------------ helpers locais
    function rotulo(txt, y, p, cor = AMA, tam = 44) {         // digitação em grotesca, centralizada na área segura
      L.texto(ctx, L.datilografar(txt, p), CX, y, { familia: FONTE.grotesca, peso: 700, tam, cor, alinhar: 'center', rgb: 2 });
    }
    function cred(txt, p, y) {                                  // crédito centralizado, sempre dentro da margem
      if (p <= 0) return;
      L.texto(ctx, L.datilografar(txt, p * 2), CX, y, { familia: FONTE.maquina, peso: 400, cor: COR.begeEscuro, alinhar: 'center',
        tam: Math.min(26, L.ajustar(ctx, txt, FONTE.maquina, LARG, 400)) });
    }
    function quadro(img, y, h, o = {}) {                       // foto dentro da área segura, com filete vermelho
      const x = 90, w = 840;
      ctx.fillStyle = VERM; ctx.fillRect(x - 8, y - 8, w + 16, h + 16);
      L.foto(ctx, img, x, y, w, h, { seletiva: 'quente', ...o });
    }

    // ------------------------------------------------ 1. o terreiro
    function abertura(lt) {
      L.fundo(ctx, FUNDO);
      L.brasa(ctx, 0, 1100, 1080, 800, 4);
      [[260, 1300, 300, 1], [420, 1340, 360, 2], [600, 1320, 330, 3], [760, 1300, 280, 4]].forEach(([x, y, h, s]) => L.vela(ctx, x, y, h, t, s));
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 560, () => {
        L.texto(ctx, 'OKÊ,', CX, 560, { familia: FONTE.bloco, peso: 400, tam: 210, cor: AMA, alinhar: 'center', erro: VERM, desloc: 8 });
        L.texto(ctx, 'CABOCLO!', CX, 760, { tam: L.ajustar(ctx, 'CABOCLO!', FONTE.manchete, LARG), cor: TXT, alinhar: 'center', erro: VERM, desloc: 6 });
      }, 11);
      legenda = false;
    }

    function gira(lt, t) {
      L.fundo(ctx, FUNDO);
      L.camera(ctx, { zoom: 1.0 + lt * 0.02, x: 540 + lt * 6 }, () => quadro(L.img.terreiro, 300, 620, { zoom: 1.15, desfoque: lerp(10, 0, ease.saida(seg(lt, 0, 0.8))) }));
      cred('Terreiro de Umbanda, RJ · Foto: Tânia Rêgo/Agência Brasil', seg(lt, 0.5, 2), 970);
      [['CABOCLO PITIGUAÍBA', M.pitiguaiba, 1060, VERM], ['SETE FLECHAS', M.flechas, 1140, AMA], ['CABOCLA JUREMA', M.jurema, 1220, VERM],
        ['CABOCLO TUPINAMBÁ', M.tupinamba, 1300, AMA]].forEach(([s, T, y, cor], i) =>
        L.etiqueta(ctx, s, i % 2 ? 640 : 380, y - 20, seg(t, T - 0.1, T + 0.2), { cor, corTexto: cor === AMA ? FUNDO : TXT, tam: 38 }));
      legenda = false;
    }

    function mata(lt) {
      L.fundo(ctx, FUNDO);
      L.camera(ctx, { zoom: 1.02 + lt * 0.015 }, () => quadro(L.img.atlA, 360, 740, { zoom: 1.25, desfoque: lerp(12, 0, ease.saida(seg(lt, 0, 0.8))) }));
      rotulo('A FORÇA DOS POVOS DA MATA', 290, seg(lt, 0.4, 1.4));
      cred('Acampamento Terra Livre 2025 · Foto: Fabio Rodrigues-Pozzebom/Agência Brasil', seg(lt, 0.8, 2.5), 1150);
    }

    function roupaBranca(lt, t) {
      L.fundo(ctx, FUNDO);
      L.camera(ctx, { zoom: 1.05 + lt * 0.02 }, () => quadro(L.img.branca, 360, 720, { zoom: 1.2, pb: true }));
      rotulo('E QUANDO TIRA A', 290, seg(t, W('quando', M.reverencia) - 0.1, W('quando', M.reverencia) + 0.5), TXT);
      L.aplicarCarimbo(ctx, seg(t, M.roupa, M.roupa + 0.3), CX, 1180, () => {
        ctx.fillStyle = VERM; ctx.fillRect(90, 1110, 840, 120);
        L.texto(ctx, 'ROUPA BRANCA?', CX, 1200, { tam: 100, cor: TXT, alinhar: 'center' });
      }, 13);
      cred('Foto: Fernando Frazão/Agência Brasil', seg(lt, 0.5, 1.5), 1300);
    }

    // ------------------------------------------------ 2. a origem
    function origem(lt, t) {
      L.fundo(ctx, FUNDO);
      L.camera(ctx, { zoom: 1.1 + lt * 0.01 }, () => L.foto(ctx, L.img.pecas, 0, 0, 1080, 1920, { pb: true, zoom: 1, desfoque: 6 }));
      ctx.save(); ctx.fillStyle = 'rgba(15,12,11,0.78)'; ctx.fillRect(0, 0, 1080, 1920); ctx.restore();
      rotulo('SEGUNDO A TRADIÇÃO', 330, seg(lt, 0.1, 0.9), TXT, 40);
      if (t > M.setecruz - 0.1) {
        L.etiqueta(ctx, 'CABOCLO DAS SETE ENCRUZILHADAS', CX, 470, seg(t, M.setecruz - 0.1, M.setecruz + 0.2), { cor: VERM, corTexto: TXT, tam: 40 });
      }
      if (t > M.ano1908 - 0.3) {
        L.texto(ctx, L.datilografar('1908', seg(t, M.ano1908 - 0.3, M.ano1908 + 0.3)), CX, 760, { tam: 300, cor: AMA, alinhar: 'center', erro: VERM, desloc: 8 });
        cred('uma das vertentes da Umbanda · Niterói (RJ)', seg(t, M.ano1908 + 0.4, M.ano1908 + 1.6), 830);
      }
      if (t > M.elitizado - 0.1) {
        rotulo('REJEITADOS NO ESPIRITISMO ELITIZADO:', 990, seg(t, M.elitizado - 0.1, M.elitizado + 0.8), TXT, 36);
        L.etiqueta(ctx, 'NEGROS', 340, 1110, seg(t, M.negros - 0.1, M.negros + 0.2), { cor: AMA, corTexto: FUNDO, tam: 56 });
        L.etiqueta(ctx, 'INDÍGENAS', 680, 1110, seg(t, W('indígenas', M.negros) - 0.1, W('indígenas', M.negros) + 0.2), { cor: VERM, corTexto: TXT, tam: 56 });
      }
    }

    // ------------------------------------------------ 3. a virada (tenso)
    function pensa(lt) {
      L.fundo(ctx, FUNDO); legenda = false; arquivo = false;
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 860, () =>
        L.texto(ctx, 'AGORA PENSA.', CX, 900, { tam: L.ajustar(ctx, 'AGORA PENSA.', FONTE.manchete, LARG), cor: TXT, alinhar: 'center', erro: VERM, desloc: 7 }), 21);
    }

    function vivos(lt, t) {
      L.fundo(ctx, FUNDO);
      L.camera(ctx, { zoom: 1 + lt * 0.012 }, () => quadro(L.img.marcha, 640, 600, { zoom: 1.2, desfoque: lerp(10, 0, ease.saida(seg(lt, 0, 0.8))) }));
      L.aplicarCarimbo(ctx, seg(lt, 0.3, 0.6), CX, 400, () =>
        L.texto(ctx, '1,7 MILHÃO', CX, 460, { tam: L.ajustar(ctx, '1,7 MILHÃO', FONTE.manchete, LARG - 80), cor: AMA, alinhar: 'center', erro: VERM, desloc: 7 }), 23);
      rotulo('DE INDÍGENAS VIVOS', 560, seg(t, W('indígenas', M.milhao) - 0.1, W('vivos') + 0.2), TXT);
      L.aplicarCarimbo(ctx, seg(t, M.povos391 - 0.1, M.povos391 + 0.2), CX, 1140, () => {
        ctx.fillStyle = VERM; ctx.fillRect(90, 1090, 840, 110);
        L.texto(ctx, '391 POVOS', CX, 1180, { tam: 96, cor: TXT, alinhar: 'center' });
      }, 25);
      cred('IBGE · Censo 2022 · Foto: Fabio Rodrigues-Pozzebom/Agência Brasil', seg(lt, 1, 2.5), 1260);
    }

    function mortos(lt, t) {
      L.fundo(ctx, FUNDO);
      rotulo('SÓ EM 2025', 420, seg(lt, 0, 0.5), TXT, 52);
      if (t > M.n258 - 0.15) {
        L.respingo(ctx, CX, 760, 170, seg(t, M.n258, M.n258 + 0.25), SANGUE, 31);
        L.aplicarCarimbo(ctx, seg(t, M.n258 - 0.15, M.n258 + 0.15), CX, 760, () =>
          L.texto(ctx, '258', CX, 900, { tam: 420, cor: VERM, alinhar: 'center', erro: SANGUE, desloc: 12 }), 27);
        L.escorrer(ctx, 260, 890, 500, seg(t, M.n258 + 0.2, M.n258 + 4), VERM, 33, 180);
        rotulo('INDÍGENAS ASSASSINADOS', 1150, seg(t, W('foram', M.n258) - 0.1, W('assassinados') + 0.3), TXT, 54);
        cred('fonte: Cimi, relatório 2026', seg(t, M.n258 + 1, M.n258 + 2.5), 1220);
      }
    }

    function terra(lt, t) {
      L.fundo(ctx, FUNDO);
      L.camera(ctx, { zoom: 1.05 + lt * 0.02 }, () => quadro(L.img.retomada, 370, 600, { zoom: 1.1 }));
      L.etiqueta(ctx, 'TERRA INVADIDA', CX, 300, seg(t, W('invadida') - 0.1, W('invadida') + 0.2), { cor: VERM, corTexto: TXT, tam: 50 });
      cred('Retomada Guarani Kaiowá, Douradina (MS) · Foto: Bruno Peres/Agência Brasil', seg(lt, 0.5, 2), 1000);
      if (t > W('onde', M.terra) - 0.1) rotulo('ONDE ESTÁ A SUA VOZ?', 1140, seg(t, W('onde', M.terra) - 0.1, M.voz - 0.2), AMA, 60);
    }

    function voz(lt) {
      L.fundo(ctx, FUNDO); legenda = false; arquivo = false;
      L.raios(ctx, CX, 1500, 2200, 22, L.emDois(t) * 0.04, SANGUE);
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 760, () => {
        ctx.fillStyle = VERM; ctx.fillRect(0, 600, 1080, 280);
        L.texto(ctx, 'ONDE ESTÁ', CX, 800, { tam: L.ajustar(ctx, 'ONDE ESTÁ', FONTE.bloco, LARG - 40, 400), familia: FONTE.bloco, peso: 400, cor: FUNDO, alinhar: 'center' });
        L.texto(ctx, 'A SUA VOZ?', CX, 1060, { tam: L.ajustar(ctx, 'A SUA VOZ?', FONTE.manchete, LARG), cor: AMA, alinhar: 'center', erro: VERM, desloc: 8 });
      }, 29);
      L.escorrer(ctx, 0, 878, 1080, seg(lt, 0.3, 1.6), VERM, 29, 120);
    }

    // ------------------------------------------------ 4. o chamado
    function espirito(lt, t) {
      L.fundo(ctx, FUNDO);
      // metade de cima: o espírito cultuado · metade de baixo: o indígena vivo
      quadro(L.img.terreiro, 300, 460, { zoom: 1.6, pb: true });
      rotulo('O ESPÍRITO VOCÊ CULTUA', 290, seg(t, W('cultuar') - 0.1, W('cultuar') + 0.6), TXT, 42);
      const pb = t > W('costas') ? true : false;
      quadro(L.img.atlB, 820, 460, { zoom: 1.2, pb });
      if (t > W('costas') - 0.1) {
        ctx.save(); ctx.globalAlpha = 0.35 * seg(t, W('costas'), W('costas') + 0.4); ctx.fillStyle = FUNDO; ctx.fillRect(90, 820, 840, 460); ctx.restore();
      }
      rotulo('E O INDÍGENA VIVO?', 1265, seg(t, W('vivo') - 0.3, W('vivo') + 0.4), AMA, 52);
    }

    function votar(lt, t) {
      L.fundo(ctx, FUNDO);
      L.urna(ctx, CX, 820, 1.25, TXT, FUNDO);
      L.aplicarCarimbo(ctx, seg(t, W('contra', M.votar) - 0.1, W('contra', M.votar) + 0.2), CX, 820, () => {
        ctx.save(); ctx.translate(CX, 820); ctx.strokeStyle = VERM; ctx.lineWidth = 46; ctx.lineCap = 'butt';
        ctx.beginPath(); ctx.moveTo(-300, -220); ctx.lineTo(300, 220); ctx.moveTo(300, -220); ctx.lineTo(-300, 220); ctx.stroke(); ctx.restore();
      }, 41);
      rotulo('VOTO EM QUEM É CONTRA', 400, seg(lt, 0.3, 1.2), TXT, 46);
      rotulo('OS POVOS INDÍGENAS?', 470, seg(lt, 1.2, 2.0), AMA, 46);
    }

    function chamado(lt, t) {
      L.fundo(ctx, FUNDO); legenda = false; arquivo = false;
      L.raios(ctx, CX, 1700, 2300, 24, -0.4 + L.emDois(t) * 0.05, SANGUE);
      const tam = L.ajustar(ctx, 'QUEM SAÚDA CABOCLO', FONTE.manchete, LARG);
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 380, () =>
        L.texto(ctx, 'QUEM SAÚDA CABOCLO', CX, 420, { tam, cor: TXT, alinhar: 'center', erro: VERM, desloc: 6 }), 51);
      L.aplicarCarimbo(ctx, seg(t, W('defende', M.sauda) - 0.1, W('defende', M.sauda) + 0.2), CX, 560, () => {
        L.texto(ctx, 'DEFENDE OS', CX, 420 + tam, { tam, cor: AMA, alinhar: 'center', erro: VERM, desloc: 6 });
        L.texto(ctx, 'POVOS INDÍGENAS', CX, 420 + tam * 1.9, { tam, cor: AMA, alinhar: 'center', erro: VERM, desloc: 6 });
      }, 53);
      if (t > M.oke2 - 0.1) L.texto(ctx, 'OKÊ, CABOCLO!', CX, 1000, { familia: FONTE.serifa, estilo: 'italic', peso: 400, tam: 96,
        cor: TXT, alinhar: 'center' });
      L.aplicarCarimbo(ctx, seg(t, M.demarcacao, M.demarcacao + 0.3), CX, 1190, () => {
        ctx.fillStyle = VERM; ctx.fillRect(0, 1090, 1080, 200);
        L.texto(ctx, 'DEMARCAÇÃO JÁ!', CX, 1230, { familia: FONTE.bloco, peso: 400, tam: L.ajustar(ctx, 'DEMARCAÇÃO JÁ!', FONTE.bloco, LARG, 400),
          cor: AMA, alinhar: 'center', erro: FUNDO, desloc: 6 });
      }, 55);
      if (t > M.demarcacao + 0.6) rotulo('E PROTEÇÃO AOS POVOS INDÍGENAS', 1470, seg(t, M.demarcacao + 0.6, M.demarcacao + 1.6), TXT, 40);
      L.escorrer(ctx, 0, 1288, 1080, seg(t, M.demarcacao + 0.3, M.demarcacao + 2), VERM, 55, 110);
    }

    function final(lt) {
      L.fundo(ctx, FUNDO); legenda = false; arquivo = false;
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 820, () => L.imagem(ctx, L.img.logo, CX, 820, 800), 97);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.6, 1.2);
      L.texto(ctx, 'Fontes: IBGE (Censo 2022) · Cimi (relatório 2026)', CX, 1180, { familia: FONTE.maquina, peso: 400, tam: 26, cor: COR.begeEscuro, alinhar: 'center' });
      L.texto(ctx, 'Fotos: Tânia Rêgo, Fernando Frazão, Fabio Rodrigues-Pozzebom,', CX, 1225, { familia: FONTE.maquina, peso: 400, tam: 22, cor: COR.begeEscuro, alinhar: 'center' });
      L.texto(ctx, 'Tomaz Silva, Bruno Peres / Agência Brasil (CC BY 3.0 BR)', CX, 1258, { familia: FONTE.maquina, peso: 400, tam: 22, cor: COR.begeEscuro, alinhar: 'center' });
      ctx.restore();
    }
  },
};
