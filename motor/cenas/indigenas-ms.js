// "Veneno na água" — ameaças a indígenas Guarani Kaiowá em MS após a eleição (out/2026).
// Tempos vêm de indigenas-ms.tempos.js (gerado por audio/indigenas-ms/montar.py a partir da narração).
// Render: node motor/render.js indigenas-ms saida/indigenas-ms.mp4 --audio audio/indigenas-ms/mix.wav
// Versão de 60 s: mesma cena com outros tempos → ... --tempos indigenas-ms-60 --audio audio/indigenas-ms/mix-60.wav
// Blocos cuja marca não existe na versão (frase cortada da narração) simplesmente não entram.
const M = window.TEMPOS.marcas;
const PAL = window.TEMPOS.legendas.flatMap(l => l.p);
// tempo da palavra falada (primeira que começa com `w` depois de `depois`)
const W = (w, depois = 0) => (PAL.find(([p, t]) => t >= depois && p.toLowerCase().startsWith(w.toLowerCase())) || [0, 1e9])[1];

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: window.TEMPOS.dur,
  imagens: {
    aldeia: '../midia/indigenas-ms/arquivo-ms.jpg',
    panambi: '../midia/indigenas-ms/panambi-2024.webp',
    mural: '../midia/indigenas-ms/retomada-2024.jpg',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease } = L, W_ = 1080;
    let legenda = true, legCor = COR.tinta, arquivo = true;

    const ordem = [[0, abertura], [M.gravacao, gravacao], [M.cartaz1, cartazVeneno], [M.sassoro, aldeia],
      [M.pararam, agua], [M.ministerio, ministerio], [M.medo, medo], [M.isolado, isolado], [M.rodovia, rodovia],
      [M.caminhonetes, caminhonetes], [M.permanente, permanente], [M.apib, contagem], [M.cartaz2, cartazSeis],
      [M.prefeitura, dossie], [M.cacique, cacique], [M.cartaz3, cartazMedo], [M.favor, dever], [M.fim, final]]
      .filter(([a]) => a !== undefined);
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    fn(t - b0, t);

    // cortes diagonais nas viradas de registro (batem com o "whoosh" da trilha)
    [[M.cartaz1, COR.amarelo, -24], [M.sassoro, COR.bege, 24], [M.cartaz2, COR.vermelho, -24],
      [M.prefeitura, COR.bege, 24], [M.cartaz3, COR.amarelo, -24], [M.fim, COR.amarelo, 24]]
      .forEach(([T, cor, ang]) => L.corteDiagonal(ctx, seg(t, T - 0.4, T), cor, ang));

    if (legenda) L.legenda(ctx, window.TEMPOS.legendas, t, 1450, { cor: legCor });
    if (arquivo) L.varredura(ctx, t, 0.08);
    L.papel(ctx, t); L.vinheta(ctx, 0.3);

    // ---------------------------------------------------------------- ARQUIVO
    function abertura(lt, t) {
      L.fundo(ctx, COR.bege);
      L.camera(ctx, { zoom: 1 + lt * 0.006 }, () => L.planta(ctx, 2));
      L.texto(ctx, L.datilografar('MATO GROSSO DO SUL · 2026', seg(t, 0.2, 1.2)), W_ / 2, 330,
        { familia: FONTE.grotesca, peso: 700, tam: 40, cor: COR.vermelho, alinhar: 'center', tracking: 4, rgb: 1.5 });
      if (t < M.audio) {
        L.texto(ctx, L.datilografar('25.10.2026', seg(t, M.domingo - 0.3, M.domingo + 0.7)), W_ / 2, 560,
          { familia: FONTE.maquina, peso: 400, tam: 110, cor: COR.tinta, alinhar: 'center' });
        L.fonte(ctx, FONTE.maquina, 110, 400);
        const x25 = W_ / 2 - ctx.measureText('25.10.2026').width / 2;
        L.selecao(ctx, x25 - 6, 470, ctx.measureText('25').width + 12, 112, seg(t, M.domingo + 0.5, M.domingo + 0.9), COR.vermelho);
        const p = ease.saida(seg(t, W('urnas') - 0.6, W('urnas')));
        if (p > 0) { ctx.save(); ctx.globalAlpha = p; L.urna(ctx, W_ / 2, 900 + (1 - p) * 60, 1.1); ctx.restore(); }
        L.etiqueta(ctx, '2º TURNO', 780, 720, seg(t, W('urnas'), W('urnas') + 0.3), { cor: COR.vermelho });
      } else {
        const p = seg(t, M.audio, M.audio + 0.3);
        L.ondas(ctx, W_ / 2, 850, t, { cor: COR.vermelho, n: 5, passo: 70 });
        ctx.save(); ctx.globalAlpha = p; L.ondaSonora(ctx, W_ / 2, 850, 760 * p, 220, t); ctx.restore();
        L.etiqueta(ctx, 'UM ÁUDIO CIRCULA', W_ / 2, 1120, seg(t, M.audio + 0.2, M.audio + 0.5));
      }
    }

    function gravacao(lt, t) {
      L.fundo(ctx, COR.tinta); legCor = COR.bege;
      L.ondas(ctx, W_ / 2, 760, t, { cor: COR.begeEscuro, n: 6, passo: 80, largura: 1.5 });
      L.ondaSonora(ctx, W_ / 2, 760, 820, 260, t, t > M.veneno ? COR.vermelho : COR.bege);
      L.texto(ctx, 'REC ●', 90, 330, { familia: FONTE.grotesca, peso: 700, tam: 38, cor: COR.vermelho, tracking: 3,
        rgb: 2 });
      L.etiqueta(ctx, 'ÁUDIO ATRIBUÍDO A SERVIDOR', W_ / 2, 470, seg(t, W('atribuída') - 0.1, W('atribuída') + 0.2));
      L.etiqueta(ctx, 'PREFEITURA DE TACURU (MS)', W_ / 2, 570, seg(t, W('prefeitura') - 0.1, W('prefeitura') + 0.2),
        { cor: COR.vermelho });
      if (t > M.veneno - 0.1) {
        L.texto(ctx, L.datilografar('VENENO', seg(t, M.veneno - 0.1, M.veneno + 0.35)), W_ / 2, 1160,
          { familia: FONTE.grotesca, peso: 700, tam: 120, cor: COR.bege, alinhar: 'center', rgb: 4 });
        L.fonte(ctx, FONTE.grotesca, 120, 700);
        const w = ctx.measureText('VENENO').width;
        L.selecao(ctx, W_ / 2 - w / 2 - 10, 1060, w + 20, 125, seg(t, M.veneno + 0.5, M.veneno + 0.9), COR.vermelho);
      }
    }

    function aldeia(lt, t) {
      L.fundo(ctx, COR.bege);
      L.camera(ctx, { zoom: 1 + lt * 0.01, y: 960 - lt * 4 }, () => {
        L.moldura(ctx, 140, 420, 800, 532);
        L.foto(ctx, L.img.aldeia, 140, 420, 800, 532, { desfoque: lerp(14, 0, ease.saida(seg(lt, 0.2, 1.2))), zoom: 1.05 });
      });
      L.etiqueta(ctx, 'ALDEIA SASSORÓ · TACURU (MS)', W_ / 2, 1110, seg(t, W('Sassoró') - 0.1, W('Sassoró') + 0.2), { tam: 38 });
      L.etiqueta(ctx, 'POVO GUARANI KAIOWÁ', W_ / 2, 1210, seg(t, W('Guarani') - 0.1, W('Guarani') + 0.2),
        { tam: 38, cor: COR.vermelho });
      L.etiqueta(ctx, 'CAMINHÕES-PIPA', 760, 340, seg(t, W('caminhões') - 0.1, W('caminhões') + 0.2),
        { tam: 38, cor: COR.amarelo, corTexto: COR.tinta });
      L.credito(ctx, 'Imagem de arquivo · Foto: Marcello Casal Jr/Agência Brasil', seg(lt, 0.8, 2.5), 60, 1800);
    }

    function agua(lt, t) {
      L.fundo(ctx, COR.bege);
      L.camera(ctx, { zoom: 1 + lt * 0.01 }, () => L.planta(ctx, 5, COR.azul, 0.14));
      for (let k = 0; k < 3; k++) {                               // gotas caindo (batem com o "ploc")
        const p = seg(lt, 0.15 + k * 0.5, 0.4 + k * 0.5);
        if (p > 0 && p < 1) L.gota(ctx, W_ / 2, lerp(250, 640, ease.entrada(p)), 22, COR.azul);
      }
      L.aplicarCarimbo(ctx, 1, W_ / 2, 820, () => L.gota(ctx, W_ / 2, 860, 190, COR.azul), 1);
      L.aplicarCarimbo(ctx, seg(t, W('beber', M.pararam) - 0.1, W('beber', M.pararam) + 0.25), W_ / 2, 820, () => {
        ctx.save(); ctx.translate(W_ / 2, 820); ctx.rotate(-0.6); ctx.fillStyle = COR.vermelho;
        ctx.fillRect(-330, -26, 660, 52); ctx.restore();
      }, 3);
    }

    function ministerio(lt, t) {
      L.fundo(ctx, COR.bege);
      L.camera(ctx, { zoom: 1.05 + lt * 0.012 }, () => L.planta(ctx, 7));
      L.texto(ctx, L.datilografar('MINISTÉRIO DOS POVOS INDÍGENAS:', seg(lt, 0.2, 1.1)), 90, 640,
        { familia: FONTE.grotesca, peso: 700, tam: 44, cor: COR.tinta, rgb: 1.5 });
      ['NÃO HÁ COMPROVAÇÃO', 'DE CONTAMINAÇÃO', 'DA ÁGUA.'].forEach((s, i) =>
        L.texto(ctx, L.datilografar(s, seg(t, W('afirma') + i * 0.5, W('afirma') + 0.5 + i * 0.5)), 90, 780 + i * 100,
          { familia: FONTE.grotesca, peso: 700, tam: 64, cor: COR.tinta, rgb: 2 }));
      L.fonte(ctx, FONTE.grotesca, 64, 700);
      L.selecao(ctx, 80, 724, ctx.measureText('NÃO HÁ COMPROVAÇÃO').width + 20, 72,
        seg(t, W('comprovação') - 0.1, W('comprovação') + 0.4), COR.azul);
    }

    function medo(lt, t) {
      L.fundo(ctx, COR.tinta); legenda = false;
      L.palavras(ctx, [['Mas', W('Mas', M.medo - 0.1)], ['o', W('o', M.medo)], ['medo', W('medo', M.medo)]], t, W_ / 2, 900,
        { tam: 130, cor: COR.bege });
      L.palavras(ctx, [['já', W('já', M.medo)], ['chegou.', W('chegou', M.medo)]], t, W_ / 2, 1060,
        { tam: 130, cor: COR.vermelho });
    }

    function isolado(lt, t) {
      L.fundo(ctx, COR.tinta); legCor = COR.bege;
      L.ondas(ctx, W_ / 2, 820, t, { cor: COR.begeEscuro, n: 7, passo: 80 });
      L.sinal(ctx, W_ / 2, 820, t, COR.vermelho, 100);
      L.texto(ctx, 'NÃO FOI UM CASO ISOLADO', W_ / 2, 340, { familia: FONTE.grotesca, peso: 700, tam: 50, cor: COR.bege,
        alinhar: 'center', rgb: 2, tracking: 3 });
      L.etiqueta(ctx, 'TACURU', 300, 600, seg(lt, 0.4, 0.7), { cor: COR.vermelho });
      L.etiqueta(ctx, 'CORONEL SAPUCAIA', 700, 720, seg(lt, 0.75, 1.05));
      L.etiqueta(ctx, 'AMAMBAI', 330, 1060, seg(lt, 1.1, 1.4), { cor: COR.amarelo, corTexto: COR.tinta });
      if (t > M.cinco - 0.2) {                                   // "ao menos 5 assassinatos" (Cimi)
        L.fundo(ctx, COR.tinta);
        L.aplicarCarimbo(ctx, seg(t, M.cinco - 0.2, M.cinco + 0.15), W_ / 2, 820, () =>
          L.texto(ctx, '5', W_ / 2, 1010, { tam: 520, cor: COR.vermelho, alinhar: 'center', erro: COR.vermelhoEscuro, desloc: 12 }), 41);
        L.texto(ctx, L.datilografar('ASSASSINATOS INVESTIGADOS', seg(t, M.cinco + 0.4, M.cinco + 1.2)), W_ / 2, 1130,
          { familia: FONTE.grotesca, peso: 700, tam: 50, cor: COR.bege, alinhar: 'center', rgb: 2 });
        L.credito(ctx, 'desde a véspera do 2º turno · fonte: Cimi', seg(t, M.cinco + 1.0, M.cinco + 3), 220, 1210, COR.begeEscuro);
      }
    }

    function rodovia(lt, t) {
      L.fundo(ctx, COR.bege); legCor = COR.bege;
      L.estrada(ctx, t);
      L.etiqueta(ctx, 'MS-289', W_ / 2, 560, seg(lt, 0.4, 0.7), { cor: COR.vermelho, tam: 56 });
      L.etiqueta(ctx, 'CORONEL SAPUCAIA', 300, 700, seg(lt, 0.75, 1.05), { tam: 36 });
      L.etiqueta(ctx, 'AMAMBAI', 820, 700, seg(lt, 1.1, 1.4), { tam: 36 });
      if (t > M.circunst) {
        ctx.save(); ctx.fillStyle = COR.bege; ctx.globalAlpha = 0.93; ctx.fillRect(60, 980, 960, 260); ctx.restore();
        L.texto(ctx, L.datilografar('CIRCUNSTÂNCIAS:', seg(t, M.circunst, M.circunst + 0.4)), 100, 1070,
          { familia: FONTE.grotesca, peso: 700, tam: 50, cor: COR.tinta, rgb: 1.5 });
        L.texto(ctx, L.datilografar('AINDA NÃO ESCLARECIDAS', seg(t, M.circunst + 0.4, M.circunst + 1.0)), 100, 1170,
          { familia: FONTE.grotesca, peso: 700, tam: 64, cor: COR.tinta, rgb: 2 });
        L.fonte(ctx, FONTE.grotesca, 64, 700);
        L.selecao(ctx, 92, 1112, ctx.measureText('AINDA NÃO ESCLARECIDAS').width + 16, 72,
          seg(t, W('esclarecidas') - 0.1, W('esclarecidas') + 0.4), COR.azul);
      }
    }

    function caminhonetes(lt, t) {
      L.fundo(ctx, COR.bege);
      L.foto(ctx, L.img.panambi, 0, 300, W_, 1000, { seletiva: true, zoom: 1.05 + lt * 0.006, dx: lerp(160, -160, lt / 10),
        desfoque: lerp(12, 0, ease.saida(seg(lt, 0, 0.8))) });
      L.etiqueta(ctx, 'CAMINHONETES NO TERRITÓRIO', W_ / 2, 1220, seg(t, W('camionetes') - 0.1, W('camionetes') + 0.2),
        { cor: COR.vermelho, tam: 40 });
      L.credito(ctx, 'Imagem de arquivo · Douradina (MS), 2024 · Foto: Bruno Peres/Agência Brasil', seg(lt, 0.8, 2.8), 60, 1800);
    }

    function permanente(lt, t) {
      L.fundo(ctx, COR.bege);
      L.camera(ctx, { zoom: 1 + lt * 0.012 }, () =>
        L.foto(ctx, L.img.mural, 0, 300, W_, 960, { seletiva: true, zoom: 1.35, desfoque: lerp(12, 0, ease.saida(seg(lt, 0, 0.8))) }));
      L.texto(ctx, L.datilografar('PARA O CIMI:', seg(lt, 0.2, 0.7)), 80, 260, { familia: FONTE.grotesca, peso: 700, tam: 44,
        cor: COR.vermelho, rgb: 1.5 });
      L.etiqueta(ctx, 'VIOLÊNCIA PERMANENTE', W_ / 2, 1220, seg(t, W('permanente') - 0.1, W('permanente') + 0.2),
        { cor: COR.vermelho, tam: 46 });
      L.credito(ctx, 'Imagem de arquivo · Foto: Tânia Rêgo/Agência Brasil', seg(lt, 0.8, 2.5), 60, 1800);
    }

    function contagem(lt, t) {
      L.fundo(ctx, COR.bege);
      L.camera(ctx, { zoom: 1 + lt * 0.008 }, () => L.planta(ctx, 9));
      const ano = 2022 + Math.max(0, Math.min(4, Math.floor((lt - 1.2) / 0.6)));   // bate com os "tiques"
      L.texto(ctx, String(ano), W_ / 2, 940, { tam: 340, cor: COR.tinta, alinhar: 'center',
        erro: COR.vermelho, desloc: 8 });
      L.texto(ctx, L.datilografar('GUARANI KAIOWÁ ASSASSINADOS EM MS', seg(lt, 0.3, 1.2)), W_ / 2, 560,
        { familia: FONTE.grotesca, peso: 700, tam: 42, cor: COR.vermelho, alinhar: 'center', rgb: 1.5 });
      L.credito(ctx, 'fonte: Apib', seg(lt, 0.5, 1.2), 450, 1060);
    }

    function dossie(lt, t) {
      L.fundo(ctx, COR.bege);
      L.camera(ctx, { zoom: 1 + lt * 0.003 }, () => L.planta(ctx, 12, COR.tinta, 0.12));
      L.texto(ctx, 'O QUE ACONTECEU DEPOIS', 90, 290, { familia: FONTE.sub, peso: 600, tam: 44, cor: COR.vermelho, tracking: 5 });
      const itens = [
        [W('Diante', M.prefeitura - 0.5), 'PREFEITURA DE TACURU', 'afastou o servidor e abriu processo administrativo', COR.vermelho],
        [M.mpf, 'MINISTÉRIO PÚBLICO FEDERAL', 'deu 24 horas para a prefeitura explicar o áudio', COR.vermelho],
        [M.pf, 'POLÍCIA FEDERAL', 'acionada para investigar', COR.vermelho],
        [M.deputadas, 'SÔNIA GUAJAJARA E CÉLIA XAKRIABÁ', 'deputadas cobram investigação e proteção', COR.vermelho],
        [M.governo, 'GOVERNO DE MATO GROSSO DO SUL', 'diz que não há genocídio no estado', COR.azul],
      ];
      itens.filter(([T]) => T !== undefined && T < 1e8).forEach(([T, tit, desc, cor], i) => {
        if (t < T) return;
        const y = 420 + i * 200;
        L.texto(ctx, L.datilografar(tit, seg(t, T + 0.1, T + 0.75)), 90, y, { familia: FONTE.grotesca, peso: 700, tam: 44,
          cor: COR.tinta, rgb: 1.5 });
        L.fonte(ctx, FONTE.grotesca, 44, 700);
        L.selecao(ctx, 82, y - 44, ctx.measureText(tit).width + 16, 56, seg(t, T + 0.8, T + 1.1), cor);
        L.texto(ctx, L.datilografar(desc, seg(t, T + 0.9, T + 1.8)), 90, y + 60, { familia: FONTE.maquina, peso: 400, tam: 34,
          cor: COR.tinta });
      });
    }

    function cacique(lt, t) {
      L.fundo(ctx, COR.bege);
      L.camera(ctx, { zoom: 1 + lt * 0.006 }, () => L.planta(ctx, 3, COR.tinta, 0.12));
      L.etiqueta(ctx, 'CACIQUE IVAN MONTIEL', W_ / 2, 430, seg(lt, 0.2, 0.5), { cor: COR.vermelho });
      L.etiqueta(ctx, 'LIDERANÇA DA ALDEIA SASSORÓ', W_ / 2, 530, seg(lt, 1.4, 1.7), { tam: 36 });
      const p = ease.saida(seg(t, M.direito + 1.5, M.direito + 2.6));    // o voto desce e entra na urna
      if (p > 0) { ctx.fillStyle = COR.vermelho; ctx.fillRect(W_ / 2 - 90, lerp(590, 820, p), 180, 120); }
      L.urna(ctx, W_ / 2, 900, 1.15);
      L.etiqueta(ctx, 'MESMO DIREITO DE ESCOLHER', W_ / 2, 1230, seg(t, W('mesmo', M.direito) - 0.1, W('mesmo', M.direito) + 0.2),
        { cor: COR.amarelo, corTexto: COR.tinta });
    }

    // ---------------------------------------------------------------- CARTAZ
    function cartazVeneno(lt, t) {
      legenda = false; arquivo = false;
      L.fundo(ctx, COR.amarelo);
      L.raios(ctx, W_ / 2, 1050, 1700, 20, L.emDois(t) * 0.1, COR.vermelho);
      for (let k = 0; k < 4; k++) {
        const p = seg(lt, 0.5 + k * 0.32 - 0.25, 0.5 + k * 0.32);
        if (p > 0 && p < 1) L.gota(ctx, W_ / 2, lerp(-60, 900, ease.entrada(p)), 30);
      }
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), W_ / 2, 1050, () => {
        ctx.fillStyle = COR.amarelo; ctx.beginPath(); ctx.arc(W_ / 2, 1060, 290, 0, 7); ctx.fill();
        L.gota(ctx, W_ / 2, 1100, 170, COR.azul);
      }, 51);
      L.aplicarCarimbo(ctx, seg(lt, 0.05, 0.35), W_ / 2, 470, () => {
        ctx.fillStyle = COR.vermelho; ctx.fillRect(0, 330, W_, 290);
        L.texto(ctx, 'VENENO', W_ / 2, 570, { familia: FONTE.bloco, peso: 400, tam: L.ajustar(ctx, 'VENENO', FONTE.bloco, W_ - 140, 400),
          cor: COR.amarelo, alinhar: 'center' });
      }, 53);
      L.aplicarCarimbo(ctx, seg(lt, 0.4, 0.7), W_ / 2, 1560, () => {
        ctx.fillStyle = COR.bege; ctx.fillRect(0, 1440, W_, 230);
        L.texto(ctx, 'NA ÁGUA.', W_ / 2, 1625, { tam: 220, cor: COR.vermelho, alinhar: 'center', erro: COR.vermelhoEscuro });
      }, 55);
    }

    function cartazSeis(lt, t) {
      legenda = false; arquivo = false;
      L.fundo(ctx, COR.vermelho);
      L.raios(ctx, W_ / 2, 900, 1700, 20, L.emDois(t) * 0.08, 'rgba(235,181,42,0.16)');
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), W_ / 2, 820, () =>
        L.texto(ctx, '6', W_ / 2, 1100, { tam: 760, cor: COR.amarelo, alinhar: 'center', erro: COR.vermelhoEscuro, desloc: 16 }), 61);
      L.aplicarCarimbo(ctx, seg(lt, 0.35, 0.6), W_ / 2, 1300, () => {
        L.texto(ctx, 'GUARANI KAIOWÁ', W_ / 2, 1290, { tam: 130, cor: COR.bege, alinhar: 'center' });
        L.texto(ctx, 'ASSASSINADOS EM MS', W_ / 2, 1410, { tam: 104, cor: COR.bege, alinhar: 'center' });
      }, 63);
      L.credito(ctx, '2022 – 2026 · fonte: Apib', seg(lt, 0.7, 1.4), 360, 1500, COR.amarelo);
    }

    function cartazMedo(lt, t) {
      legenda = false; arquivo = false;
      L.fundo(ctx, COR.amarelo);
      L.raios(ctx, W_ / 2, 1900, 2300, 24, -0.4 + L.emDois(t) * 0.07, 'rgba(200,32,30,0.2)');
      [['QUEM TEM MEDO', W('Quem', M.cartaz3)], ['DE BEBER A ÁGUA', W('beber', M.cartaz3)],
        ['DO PRÓPRIO TERRITÓRIO', W('próprio', M.cartaz3)]].forEach(([s, T], i) => {
        const p = ease.saida(seg(t, T - 0.15, T + 0.2)), tam = L.ajustar(ctx, 'DO PRÓPRIO TERRITÓRIO', FONTE.manchete, W_ - 180);
        L.texto(ctx, s, lerp(-1100, 70 + i * 25, p), 420 + i * tam * 1.02, { tam, cor: COR.vermelho, erro: COR.vermelhoEscuro, desloc: 5 });
      });
      L.aplicarCarimbo(ctx, seg(t, M.democracia + 0.2, M.democracia + 0.5), W_ / 2, 1050, () => {
        ctx.fillStyle = COR.vermelho; ctx.fillRect(0, 900, W_, 290);
        L.texto(ctx, 'BRASIL SOBERANO', W_ / 2, 1100, { tam: L.ajustar(ctx, 'BRASIL SOBERANO', FONTE.manchete, W_ - 120),
          cor: COR.amarelo, alinhar: 'center' });
      }, 71);
      L.aplicarCarimbo(ctx, seg(t, M.democracia + 0.5, M.democracia + 0.8), W_ / 2, 1320, () =>
        L.texto(ctx, 'PARA QUEM?', W_ / 2, 1380, { familia: FONTE.bloco, peso: 400,
          tam: L.ajustar(ctx, 'PARA QUEM?', FONTE.bloco, W_ - 200, 400), cor: COR.tinta, alinhar: 'center' }), 73);
    }

    function dever(lt, t) {
      legenda = false; arquivo = false;
      L.fundo(ctx, COR.bege);
      ctx.save(); ctx.translate(150, 1900); ctx.rotate(-0.22);
      L.bandeira(ctx, 0, -560, 840, 420, t, COR.vermelho); L.mastro(ctx, 0, -580, 300);
      ctx.restore();
      L.aplicarCarimbo(ctx, seg(lt, 0.1, 0.4), W_ / 2, 470, () =>
        L.texto(ctx, 'NÃO É FAVOR.', W_ / 2, 540, { tam: L.ajustar(ctx, 'NÃO É FAVOR.', FONTE.manchete, W_ - 160), cor: COR.tinta,
          alinhar: 'center', erro: COR.vermelho, desloc: 6 }), 81);
      L.aplicarCarimbo(ctx, seg(t, M.dever, M.dever + 0.3), W_ / 2, 800, () => {
        ctx.fillStyle = COR.vermelho; ctx.fillRect(0, 680, W_, 250);
        L.texto(ctx, 'É DEVER DO ESTADO.', W_ / 2, 860, { familia: FONTE.bloco, peso: 400,
          tam: L.ajustar(ctx, 'É DEVER DO ESTADO.', FONTE.bloco, W_ - 120, 400), cor: COR.bege, alinhar: 'center' });
      }, 83);
      L.texto(ctx, L.datilografar('CONSTITUIÇÃO FEDERAL · ART. 231', seg(t, M.constituicao - 0.2, M.constituicao + 0.6)), W_ / 2, 1050,
        { familia: FONTE.maquina, peso: 400, tam: 46, cor: COR.tinta, alinhar: 'center' });
    }

    function final(lt, t) {
      legenda = false; arquivo = false;
      L.fundo(ctx, COR.amarelo);
      L.raios(ctx, W_ / 2, 1500, 1800, 22, L.emDois(t) * 0.05, 'rgba(200,32,30,0.16)');
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), W_ / 2, 500, () => {
        L.texto(ctx, 'PROTEJAM OS', 80, 470, { tam: L.ajustar(ctx, 'NOSSOS POVOS', FONTE.manchete, W_ - 160), cor: COR.vermelho });
        L.texto(ctx, 'NOSSOS POVOS', 80, 470 + L.ajustar(ctx, 'NOSSOS POVOS', FONTE.manchete, W_ - 160) * 0.85,
          { tam: L.ajustar(ctx, 'NOSSOS POVOS', FONTE.manchete, W_ - 160), cor: COR.vermelho });
      }, 91);
      L.aplicarCarimbo(ctx, seg(lt, 0.35, 0.65), W_ / 2, 980, () =>
        L.texto(ctx, 'INDÍGENAS', W_ / 2, 1050, { familia: FONTE.bloco, peso: 400,
          tam: L.ajustar(ctx, 'INDÍGENAS', FONTE.bloco, W_ - 120, 400), cor: COR.vermelho, alinhar: 'center',
          erro: COR.vermelhoEscuro, desloc: 6 }), 93);
      L.aplicarCarimbo(ctx, seg(lt, 0.8, 1.1), W_ / 2, 1300, () => L.estrela(ctx, W_ / 2, 1300, 110, 0, COR.vermelho), 95);
      ctx.save(); ctx.globalAlpha = seg(lt, 1.2, 1.8);
      L.texto(ctx, 'Fontes: Agência Brasil · ICL Notícias · NC News', W_ / 2, 1500,
        { familia: FONTE.maquina, peso: 400, tam: 28, cor: COR.tinta, alinhar: 'center' });
      L.texto(ctx, 'Fotos: Marcello Casal Jr, Bruno Peres, Tânia Rêgo / Agência Brasil (CC BY 3.0 BR)', W_ / 2, 1545,
        { familia: FONTE.maquina, peso: 400, tam: 24, cor: COR.tinta, alinhar: 'center' });
      ctx.restore();
    }
  },
};
