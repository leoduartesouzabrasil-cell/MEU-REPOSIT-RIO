// "Veneno na água" — ameaças a indígenas Guarani Kaiowá em MS após a eleição (out/2026). MODO TENSO.
// Tempos vêm de indigenas-ms[-60].tempos.js (gerado por audio/indigenas-ms/montar.py a partir da narração).
// Render: node motor/render.js indigenas-ms saida/indigenas-ms.mp4 --audio audio/indigenas-ms/mix.wav
// Versão de 60 s: mesma cena com outros tempos → ... --tempos indigenas-ms-60 --audio audio/indigenas-ms/mix-60.wav
// Blocos cuja marca não existe na versão (frase cortada da narração) simplesmente não entram.
const M = window.TEMPOS.marcas;
const PAL = window.TEMPOS.legendas.flatMap(l => l.p);
// tempo da palavra falada (primeira que começa com `w` depois de `depois`); 1e9 se não existir nesta versão
const W = (w, depois = 0) => (PAL.find(([p, t]) => t >= depois && p.toLowerCase().startsWith(w.toLowerCase())) || [0, 1e9])[1];
// impactos (carimbo + estrondo na trilha): tremor de câmera e clarão vermelho
const IMPACTOS = [M.cartaz1, M.cinco, M.cartaz2, M.favor, M.dever, M.logo, M.cartaz3 + 0.9, M.democracia + 0.2]
  .filter(x => x !== undefined && !isNaN(x));

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: window.TEMPOS.dur,
  imagens: {
    aldeia: '../midia/indigenas-ms/arquivo-ms.jpg',
    panambi: '../midia/indigenas-ms/panambi-2024.webp',
    mural: '../midia/indigenas-ms/retomada-2024.jpg',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease } = L, W_ = 1080;
    // paleta tensa: carvão de fundo, bege como texto, vermelho e sangue como ação
    const FUNDO = COR.carvao, TXT = COR.bege, SANGUE = COR.sangue, VERM = COR.vermelho;
    let legenda = true, arquivo = true;

    const ordem = [[0, abertura], [M.gravacao, gravacao], [M.cartaz1, cartazVeneno], [M.sassoro, aldeia],
      [M.pararam, agua], [M.ministerio, ministerio], [M.medo, medo], [M.isolado, isolado], [M.rodovia, rodovia],
      [M.caminhonetes, caminhonetes], [M.permanente, permanente], [M.apib, contagem], [M.cartaz2, cartazSeis],
      [M.prefeitura, dossie], [M.cacique, cacique], [M.cartaz3, cartazMedo], [M.favor, dever], [M.fim, final]]
      .filter(([a]) => a !== undefined);
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();

    const { dx, dy } = L.tremor(t, IMPACTOS);
    ctx.save(); ctx.translate(dx, dy);
    fn(t - b0, t);
    ctx.restore();

    // cortes diagonais em sangue nas viradas
    [[M.sassoro, SANGUE, 24], [M.cartaz2, VERM, -24], [M.prefeitura, SANGUE, 24], [M.fim, SANGUE, 24],
      [M.isolado, SANGUE, -24], [M.ministerio, SANGUE, 24]]
      .filter(([T]) => T !== undefined).forEach(([T, cor, ang]) => L.corteDiagonal(ctx, seg(t, T - 0.4, T), cor, ang));

    if (legenda) L.legenda(ctx, window.TEMPOS.legendas, t, 1450, { cor: TXT });
    if (arquivo) L.varredura(ctx, t, 0.14);
    IMPACTOS.forEach(T => L.flash(ctx, t, T, VERM, 0.3, 0.5));
    L.papel(ctx, t, 0.15); L.vinheta(ctx, 0.6);

    // ---------------------------------------------------------------- ARQUIVO (escuro)
    function abertura(lt, t) {
      L.fundo(ctx, FUNDO);
      L.camera(ctx, { zoom: 1 + lt * 0.008 }, () => L.planta(ctx, 2, TXT, 0.08));
      L.texto(ctx, L.datilografar('MATO GROSSO DO SUL · 2026', seg(t, 0.1, 0.9)), W_ / 2, 330,
        { familia: FONTE.grotesca, peso: 700, tam: 40, cor: VERM, alinhar: 'center', tracking: 4, rgb: 2 });
      if (t < M.audio) {
        L.texto(ctx, L.datilografar('25.10.2026', seg(t, M.domingo - 0.3, M.domingo + 0.7)), W_ / 2, 560,
          { familia: FONTE.maquina, peso: 400, tam: 110, cor: TXT, alinhar: 'center' });
        L.fonte(ctx, FONTE.maquina, 110, 400);
        const x25 = W_ / 2 - ctx.measureText('25.10.2026').width / 2;
        L.selecao(ctx, x25 - 6, 470, ctx.measureText('25').width + 12, 112, seg(t, M.domingo + 0.5, M.domingo + 0.9), VERM);
        const p = ease.saida(seg(t, W('urnas') - 0.6, W('urnas')));
        if (p > 0) { ctx.save(); ctx.globalAlpha = p; L.urna(ctx, W_ / 2, 900 + (1 - p) * 60, 1.1, TXT, FUNDO); ctx.restore(); }
        L.etiqueta(ctx, '2º TURNO', 780, 720, seg(t, W('urnas'), W('urnas') + 0.3), { cor: VERM, corTexto: TXT });
      } else {
        const p = seg(t, M.audio, M.audio + 0.3);
        L.ondas(ctx, W_ / 2, 850, t, { cor: SANGUE, n: 5, passo: 70 });
        ctx.save(); ctx.globalAlpha = p; L.ondaSonora(ctx, W_ / 2, 850, 760 * p, 220, t, VERM); ctx.restore();
        L.etiqueta(ctx, 'UM ÁUDIO CIRCULA', W_ / 2, 1120, seg(t, M.audio + 0.2, M.audio + 0.5), { cor: SANGUE, corTexto: TXT });
      }
    }

    function gravacao(lt, t) {
      L.fundo(ctx, FUNDO);
      L.ondas(ctx, W_ / 2, 760, t, { cor: SANGUE, n: 6, passo: 80, largura: 2 });
      L.ondaSonora(ctx, W_ / 2, 760, 820, 260 + (t > M.veneno ? 80 : 0), t, t > M.veneno ? VERM : TXT);
      if (Math.floor(t * 2) % 2 === 0) L.texto(ctx, 'REC ●', 90, 330, { familia: FONTE.grotesca, peso: 700, tam: 38, cor: VERM, tracking: 3, rgb: 2 });
      L.etiqueta(ctx, 'ÁUDIO ATRIBUÍDO A SERVIDOR', W_ / 2, 470, seg(t, W('atribuída') - 0.1, W('atribuída') + 0.2), { cor: COR.tinta, corTexto: TXT });
      L.etiqueta(ctx, 'PREFEITURA DE TACURU (MS)', W_ / 2, 570, seg(t, W('prefeitura') - 0.1, W('prefeitura') + 0.2),
        { cor: VERM, corTexto: TXT });
      if (t > M.veneno - 0.1) {
        L.texto(ctx, L.datilografar('VENENO', seg(t, M.veneno - 0.1, M.veneno + 0.35)), W_ / 2, 1160,
          { familia: FONTE.grotesca, peso: 700, tam: 130, cor: VERM, alinhar: 'center', rgb: 5 });
        L.escorrer(ctx, 250, 1170, 580, seg(t, M.veneno + 0.4, M.veneno + 3), VERM, 7, 160);
      }
    }

    function aldeia(lt, t) {
      L.fundo(ctx, FUNDO);
      L.camera(ctx, { zoom: 1.02 + lt * 0.012, y: 960 - lt * 5 }, () => {
        ctx.fillStyle = VERM; ctx.fillRect(132, 412, 816, 548);
        L.foto(ctx, L.img.aldeia, 140, 420, 800, 532, { seletiva: true, desfoque: lerp(14, 0, ease.saida(seg(lt, 0.2, 1.2))), zoom: 1.05 });
      });
      L.etiqueta(ctx, 'ALDEIA SASSORÓ · TACURU (MS)', W_ / 2, 1110, seg(t, W('Sassoró') - 0.1, W('Sassoró') + 0.2),
        { tam: 38, cor: COR.tinta, corTexto: TXT });
      L.etiqueta(ctx, 'POVO GUARANI KAIOWÁ', W_ / 2, 1210, seg(t, W('Guarani') - 0.1, W('Guarani') + 0.2), { tam: 38, cor: VERM, corTexto: TXT });
      L.etiqueta(ctx, 'CAMINHÕES-PIPA', 760, 340, seg(t, W('caminhões') - 0.1, W('caminhões') + 0.2), { tam: 38, cor: SANGUE, corTexto: TXT });
      L.credito(ctx, 'Imagem de arquivo · Foto: Marcello Casal Jr/Agência Brasil', seg(lt, 0.8, 2.5), 60, 1800, COR.begeEscuro);
    }

    function agua(lt, t) {
      L.fundo(ctx, FUNDO);
      for (let k = 0; k < 3; k++) {
        const p = seg(lt, 0.15 + k * 0.5, 0.4 + k * 0.5);
        if (p > 0 && p < 1) L.gota(ctx, W_ / 2, lerp(250, 640, ease.entrada(p)), 22, COR.azul);
      }
      L.gota(ctx, W_ / 2, 860, 190, COR.azul);
      L.aplicarCarimbo(ctx, seg(t, W('beber', M.pararam) - 0.1, W('beber', M.pararam) + 0.25), W_ / 2, 820, () => {
        ctx.save(); ctx.translate(W_ / 2, 820); ctx.rotate(-0.6); ctx.fillStyle = VERM; ctx.fillRect(-330, -26, 660, 52); ctx.restore();
      }, 3);
    }

    function ministerio(lt, t) {
      L.fundo(ctx, FUNDO);
      L.camera(ctx, { zoom: 1.05 + lt * 0.015 }, () => L.planta(ctx, 7, TXT, 0.07));
      L.texto(ctx, L.datilografar('MINISTÉRIO DOS POVOS INDÍGENAS:', seg(lt, 0.2, 1.1)), 90, 640,
        { familia: FONTE.grotesca, peso: 700, tam: 44, cor: COR.begeEscuro, rgb: 1.5 });
      ['NÃO HÁ COMPROVAÇÃO', 'DE CONTAMINAÇÃO.'].forEach((s, i) =>
        L.texto(ctx, L.datilografar(s, seg(t, W('afirma') + i * 0.5, W('afirma') + 0.5 + i * 0.5)), 90, 780 + i * 100,
          { familia: FONTE.grotesca, peso: 700, tam: 64, cor: TXT, rgb: 2 }));
      L.fonte(ctx, FONTE.grotesca, 64, 700);
      L.selecao(ctx, 80, 724, ctx.measureText('NÃO HÁ COMPROVAÇÃO').width + 20, 72,
        seg(t, W('comprovação') - 0.1, W('comprovação') + 0.4), COR.azul);
    }

    function medo(lt, t) {
      L.fundo(ctx, FUNDO); legenda = false;
      L.palavras(ctx, [['Mas', W('Mas', M.medo - 0.1)], ['o', W('o', M.medo)], ['medo', W('medo', M.medo)]], t, W_ / 2, 900,
        { tam: 130, cor: TXT });
      L.palavras(ctx, [['já', W('já', M.medo)], ['chegou.', W('chegou', M.medo)]], t, W_ / 2, 1060, { tam: 130, cor: VERM });
    }

    function isolado(lt, t) {
      L.fundo(ctx, FUNDO);
      L.ondas(ctx, W_ / 2, 820, t, { cor: SANGUE, n: 7, passo: 80 });
      L.sinal(ctx, W_ / 2, 820, t, VERM, 100);
      L.texto(ctx, 'NÃO FOI UM CASO ISOLADO', W_ / 2, 340, { familia: FONTE.grotesca, peso: 700, tam: 50, cor: TXT,
        alinhar: 'center', rgb: 3, tracking: 3 });
      L.etiqueta(ctx, 'TACURU', 300, 600, seg(lt, 0.4, 0.7), { cor: VERM, corTexto: TXT });
      L.etiqueta(ctx, 'CORONEL SAPUCAIA', 700, 720, seg(lt, 0.75, 1.05), { cor: COR.tinta, corTexto: TXT });
      L.etiqueta(ctx, 'AMAMBAI', 330, 1060, seg(lt, 1.1, 1.4), { cor: SANGUE, corTexto: TXT });
      if (t > M.cinco - 0.2) {                                   // "ao menos 5 assassinatos" (Cimi)
        L.fundo(ctx, FUNDO);
        L.respingo(ctx, W_ / 2, 820, 150, seg(t, M.cinco, M.cinco + 0.25), SANGUE, 9);
        L.aplicarCarimbo(ctx, seg(t, M.cinco - 0.2, M.cinco + 0.15), W_ / 2, 820, () =>
          L.texto(ctx, '5', W_ / 2, 1010, { tam: 520, cor: VERM, alinhar: 'center', erro: SANGUE, desloc: 12 }), 41);
        L.escorrer(ctx, 440, 1000, 200, seg(t, M.cinco + 0.2, M.cinco + 4), VERM, 5, 200);
        L.texto(ctx, L.datilografar('ASSASSINATOS INVESTIGADOS', seg(t, M.cinco + 0.4, M.cinco + 1.2)), W_ / 2, 1290,
          { familia: FONTE.grotesca, peso: 700, tam: 50, cor: TXT, alinhar: 'center', rgb: 2 });
        L.credito(ctx, 'desde a véspera do 2º turno · fonte: Cimi', seg(t, M.cinco + 1.0, M.cinco + 3), 220, 1350, COR.begeEscuro);
      }
    }

    function rodovia(lt, t) {
      L.fundo(ctx, COR.tinta);
      L.estrada(ctx, t, FUNDO, VERM);
      L.etiqueta(ctx, 'MS-289', W_ / 2, 560, seg(lt, 0.4, 0.7), { cor: VERM, corTexto: TXT, tam: 56 });
      L.etiqueta(ctx, 'CORONEL SAPUCAIA', 300, 700, seg(lt, 0.75, 1.05), { tam: 36, cor: SANGUE, corTexto: TXT });
      L.etiqueta(ctx, 'AMAMBAI', 820, 700, seg(lt, 1.1, 1.4), { tam: 36, cor: SANGUE, corTexto: TXT });
      if (t > M.circunst) {
        ctx.save(); ctx.fillStyle = FUNDO; ctx.globalAlpha = 0.9; ctx.fillRect(60, 980, 960, 260); ctx.restore();
        L.texto(ctx, L.datilografar('CIRCUNSTÂNCIAS:', seg(t, M.circunst, M.circunst + 0.4)), 100, 1070,
          { familia: FONTE.grotesca, peso: 700, tam: 50, cor: COR.begeEscuro, rgb: 1.5 });
        L.texto(ctx, L.datilografar('AINDA NÃO ESCLARECIDAS', seg(t, M.circunst + 0.4, M.circunst + 1.0)), 100, 1170,
          { familia: FONTE.grotesca, peso: 700, tam: 64, cor: TXT, rgb: 2 });
      }
    }

    function caminhonetes(lt, t) {
      L.fundo(ctx, FUNDO);
      L.foto(ctx, L.img.panambi, 0, 300, W_, 1000, { seletiva: true, zoom: 1.05 + lt * 0.006, dx: lerp(160, -160, lt / 10),
        desfoque: lerp(12, 0, ease.saida(seg(lt, 0, 0.8))) });
      L.etiqueta(ctx, 'CAMINHONETES NO TERRITÓRIO', W_ / 2, 1220, seg(t, W('camionetes') - 0.1, W('camionetes') + 0.2),
        { cor: VERM, corTexto: TXT, tam: 40 });
      L.credito(ctx, 'Imagem de arquivo · Douradina (MS), 2024 · Foto: Bruno Peres/Agência Brasil', seg(lt, 0.8, 2.8), 60, 1800, COR.begeEscuro);
    }

    function permanente(lt, t) {
      L.fundo(ctx, FUNDO);
      L.camera(ctx, { zoom: 1 + lt * 0.012 }, () =>
        L.foto(ctx, L.img.mural, 0, 300, W_, 960, { seletiva: true, zoom: 1.35, desfoque: lerp(12, 0, ease.saida(seg(lt, 0, 0.8))) }));
      L.texto(ctx, L.datilografar('PARA O CIMI:', seg(lt, 0.2, 0.7)), 80, 260, { familia: FONTE.grotesca, peso: 700, tam: 44, cor: VERM, rgb: 1.5 });
      L.etiqueta(ctx, 'VIOLÊNCIA PERMANENTE', W_ / 2, 1220, seg(t, W('permanente') - 0.1, W('permanente') + 0.2), { cor: VERM, corTexto: TXT, tam: 46 });
      L.credito(ctx, 'Imagem de arquivo · Foto: Tânia Rêgo/Agência Brasil', seg(lt, 0.8, 2.5), 60, 1800, COR.begeEscuro);
    }

    function contagem(lt, t) {
      L.fundo(ctx, FUNDO);
      L.camera(ctx, { zoom: 1 + lt * 0.01 }, () => L.planta(ctx, 9, TXT, 0.07));
      const ano = 2022 + Math.max(0, Math.min(4, Math.floor((lt - 1.2) / 0.6)));   // bate com os "tiques"
      L.texto(ctx, String(ano), W_ / 2, 940, { tam: 340, cor: TXT, alinhar: 'center', erro: VERM, desloc: 8 });
      L.texto(ctx, L.datilografar('GUARANI KAIOWÁ ASSASSINADOS EM MS', seg(lt, 0.3, 1.2)), W_ / 2, 560,
        { familia: FONTE.grotesca, peso: 700, tam: 42, cor: VERM, alinhar: 'center', rgb: 1.5 });
      L.credito(ctx, 'fonte: Apib', seg(lt, 0.5, 1.2), 450, 1060, COR.begeEscuro);
    }

    function dossie(lt, t) {
      L.fundo(ctx, FUNDO);
      L.camera(ctx, { zoom: 1 + lt * 0.004 }, () => L.planta(ctx, 12, TXT, 0.06));
      L.texto(ctx, 'O QUE ACONTECEU DEPOIS', 90, 290, { familia: FONTE.sub, peso: 600, tam: 44, cor: VERM, tracking: 5 });
      const itens = [
        [W('Diante', M.prefeitura - 0.5), 'PREFEITURA DE TACURU', 'afastou o servidor e abriu processo administrativo', VERM],
        [M.mpf, 'MINISTÉRIO PÚBLICO FEDERAL', 'deu 24 horas para a prefeitura explicar o áudio', VERM],
        [M.pf, 'POLÍCIA FEDERAL', 'acionada para investigar', VERM],
        [M.deputadas, 'SÔNIA GUAJAJARA E CÉLIA XAKRIABÁ', 'deputadas cobram investigação e proteção', VERM],
        [M.governo, 'GOVERNO DE MATO GROSSO DO SUL', 'diz que não há genocídio no estado', COR.azul],
      ].filter(([T]) => T !== undefined && T < 1e8);
      itens.forEach(([T, tit, desc, cor], i) => {
        if (t < T) return;
        const y = 420 + i * 200;
        L.texto(ctx, L.datilografar(tit, seg(t, T + 0.1, T + 0.75)), 90, y, { familia: FONTE.grotesca, peso: 700, tam: 44, cor: TXT, rgb: 1.5 });
        L.fonte(ctx, FONTE.grotesca, 44, 700);
        L.selecao(ctx, 82, y - 44, ctx.measureText(tit).width + 16, 56, seg(t, T + 0.8, T + 1.1), cor);
        L.texto(ctx, L.datilografar(desc, seg(t, T + 0.9, T + 1.8)), 90, y + 60, { familia: FONTE.maquina, peso: 400, tam: 34, cor: COR.begeEscuro });
      });
      if (itens.length <= 2) {                                    // versão curta: relógio do prazo de 24 h
        const p = seg(t, M.mpf + 0.5, M.cartaz3 ?? M.mpf + 8);
        ctx.save(); ctx.strokeStyle = SANGUE; ctx.lineWidth = 26;
        ctx.beginPath(); ctx.arc(W_ / 2, 1050, 170, 0, 7); ctx.stroke();
        ctx.strokeStyle = VERM; ctx.beginPath(); ctx.arc(W_ / 2, 1050, 170, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - p)); ctx.stroke();
        ctx.restore();
        L.texto(ctx, String(Math.ceil(24 * (1 - p))).padStart(2, '0') + 'h', W_ / 2, 1095, { tam: 130, cor: TXT, alinhar: 'center' });
      }
    }

    function cacique(lt, t) {
      L.fundo(ctx, FUNDO);
      L.camera(ctx, { zoom: 1 + lt * 0.006 }, () => L.planta(ctx, 3, TXT, 0.06));
      L.etiqueta(ctx, 'CACIQUE IVAN MONTIEL', W_ / 2, 430, seg(lt, 0.2, 0.5), { cor: VERM, corTexto: TXT });
      L.etiqueta(ctx, 'LIDERANÇA DA ALDEIA SASSORÓ', W_ / 2, 530, seg(lt, 1.4, 1.7), { tam: 36, cor: COR.tinta, corTexto: TXT });
      const p = ease.saida(seg(t, M.direito + 1.5, M.direito + 2.6));    // o voto desce e entra na urna
      if (p > 0) { ctx.fillStyle = VERM; ctx.fillRect(W_ / 2 - 90, lerp(590, 820, p), 180, 120); }
      L.urna(ctx, W_ / 2, 900, 1.15, TXT, FUNDO);
      L.etiqueta(ctx, 'MESMO DIREITO DE ESCOLHER', W_ / 2, 1230, seg(t, W('mesmo', M.direito) - 0.1, W('mesmo', M.direito) + 0.2),
        { cor: VERM, corTexto: TXT });
    }

    // ---------------------------------------------------------------- CARTAZ (sangue)
    function cartazVeneno(lt, t) {
      legenda = false; arquivo = false;
      L.fundo(ctx, FUNDO);
      L.raios(ctx, W_ / 2, 1060, 1700, 20, L.emDois(t) * 0.05, SANGUE);
      // a gota cai e a água fica vermelha
      const vira = seg(lt, 0.5, 1.6);
      for (let k = 0; k < 4; k++) {
        const p = seg(lt, 0.5 + k * 0.32 - 0.25, 0.5 + k * 0.32);
        if (p > 0 && p < 1) L.gota(ctx, W_ / 2, lerp(-60, 900, ease.entrada(p)), 30, VERM);
      }
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), W_ / 2, 1050, () => {
        ctx.fillStyle = FUNDO; ctx.beginPath(); ctx.arc(W_ / 2, 1060, 290, 0, 7); ctx.fill();
        L.gota(ctx, W_ / 2, 1100, 170, COR.azul);
        ctx.save(); ctx.globalAlpha = vira; L.gota(ctx, W_ / 2, 1100, 170, VERM); ctx.restore();
      }, 51);
      L.aplicarCarimbo(ctx, seg(lt, 0.05, 0.35), W_ / 2, 470, () => {
        ctx.fillStyle = VERM; ctx.fillRect(0, 330, W_, 290);
        L.texto(ctx, 'VENENO', W_ / 2, 570, { familia: FONTE.bloco, peso: 400, tam: L.ajustar(ctx, 'VENENO', FONTE.bloco, W_ - 140, 400),
          cor: FUNDO, alinhar: 'center' });
      }, 53);
      L.escorrer(ctx, 0, 618, W_, seg(lt, 0.35, 1.5), VERM, 21, 220);
      L.aplicarCarimbo(ctx, seg(lt, 0.4, 0.7), W_ / 2, 1560, () =>
        L.texto(ctx, 'NA ÁGUA.', W_ / 2, 1625, { tam: 220, cor: TXT, alinhar: 'center', erro: VERM, desloc: 8 }), 55);
    }

    function cartazSeis(lt, t) {
      legenda = false; arquivo = false;
      L.fundo(ctx, FUNDO);
      L.respingo(ctx, W_ / 2, 800, 260, seg(lt, 0, 0.2), SANGUE, 61);
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), W_ / 2, 820, () =>
        L.texto(ctx, '6', W_ / 2, 1100, { tam: 760, cor: VERM, alinhar: 'center', erro: SANGUE, desloc: 16 }), 61);
      L.aplicarCarimbo(ctx, seg(lt, 0.35, 0.6), W_ / 2, 1300, () => {
        L.texto(ctx, 'GUARANI KAIOWÁ', W_ / 2, 1290, { tam: 130, cor: TXT, alinhar: 'center' });
        L.texto(ctx, 'ASSASSINADOS EM MS', W_ / 2, 1410, { tam: 104, cor: TXT, alinhar: 'center' });
      }, 63);
      L.credito(ctx, '2022 – 2026 · fonte: Apib', seg(lt, 0.7, 1.4), 360, 1500, COR.begeEscuro);
    }

    function cartazMedo(lt, t) {
      legenda = false; arquivo = false;
      L.fundo(ctx, FUNDO);
      L.raios(ctx, W_ / 2, 1900, 2300, 24, -0.4 + L.emDois(t) * 0.04, SANGUE);
      [['QUEM TEM MEDO', W('Quem', M.cartaz3)], ['DE BEBER A ÁGUA', W('beber', M.cartaz3)],
        ['DO PRÓPRIO TERRITÓRIO', W('próprio', M.cartaz3)]].forEach(([s, T], i) => {
        const p = ease.saida(seg(t, T - 0.15, T + 0.2)), tam = L.ajustar(ctx, 'DO PRÓPRIO TERRITÓRIO', FONTE.manchete, W_ - 180);
        L.texto(ctx, s, lerp(-1100, 70 + i * 25, p), 420 + i * tam * 1.02, { tam, cor: TXT, erro: VERM, desloc: 5 });
      });
      L.aplicarCarimbo(ctx, seg(t, M.democracia + 0.2, M.democracia + 0.5), W_ / 2, 1050, () => {
        ctx.fillStyle = VERM; ctx.fillRect(0, 900, W_, 290);
        L.texto(ctx, 'BRASIL SOBERANO', W_ / 2, 1100, { tam: L.ajustar(ctx, 'BRASIL SOBERANO', FONTE.manchete, W_ - 120),
          cor: FUNDO, alinhar: 'center' });
      }, 71);
      L.escorrer(ctx, 0, 1188, W_, seg(t, M.democracia + 0.5, M.democracia + 2), VERM, 71, 180);
      L.aplicarCarimbo(ctx, seg(t, M.democracia + 0.5, M.democracia + 0.8), W_ / 2, 1420, () =>
        L.texto(ctx, 'PARA QUEM?', W_ / 2, 1500, { familia: FONTE.bloco, peso: 400,
          tam: L.ajustar(ctx, 'PARA QUEM?', FONTE.bloco, W_ - 200, 400), cor: TXT, alinhar: 'center' }), 73);
    }

    function dever(lt, t) {
      legenda = false; arquivo = false;
      L.fundo(ctx, FUNDO);
      L.escorrer(ctx, 0, 0, W_, seg(lt, 0, 5), SANGUE, 81, 520);           // sangue descendo do topo
      L.aplicarCarimbo(ctx, seg(lt, 0.1, 0.4), W_ / 2, 560, () =>
        L.texto(ctx, 'NÃO É FAVOR.', W_ / 2, 630, { tam: L.ajustar(ctx, 'NÃO É FAVOR.', FONTE.manchete, W_ - 160), cor: TXT,
          alinhar: 'center', erro: VERM, desloc: 6 }), 81);
      L.aplicarCarimbo(ctx, seg(t, M.dever, M.dever + 0.3), W_ / 2, 900, () => {
        ctx.fillStyle = VERM; ctx.fillRect(0, 780, W_, 250);
        L.texto(ctx, 'É DEVER DO ESTADO.', W_ / 2, 960, { familia: FONTE.bloco, peso: 400,
          tam: L.ajustar(ctx, 'É DEVER DO ESTADO.', FONTE.bloco, W_ - 120, 400), cor: FUNDO, alinhar: 'center' });
      }, 83);
      L.texto(ctx, L.datilografar('CONSTITUIÇÃO FEDERAL · ART. 231', seg(t, M.constituicao - 0.2, M.constituicao + 0.6)), W_ / 2, 1150,
        { familia: FONTE.maquina, peso: 400, tam: 46, cor: TXT, alinhar: 'center' });
    }

    // fecho: palavra de ordem e, em seguida, o logo da página
    function final(lt, t) {
      legenda = false; arquivo = false;
      L.fundo(ctx, FUNDO);
      if (t < M.logo) {
        L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), W_ / 2, 600, () => {
          const tam = L.ajustar(ctx, 'NOSSOS POVOS', FONTE.manchete, W_ - 160);
          L.texto(ctx, 'PROTEJAM OS', 80, 600, { tam, cor: TXT });
          L.texto(ctx, 'NOSSOS POVOS', 80, 600 + tam * 0.85, { tam, cor: TXT });
        }, 91);
        L.aplicarCarimbo(ctx, seg(lt, 0.35, 0.65), W_ / 2, 1100, () =>
          L.texto(ctx, 'INDÍGENAS', W_ / 2, 1170, { familia: FONTE.bloco, peso: 400,
            tam: L.ajustar(ctx, 'INDÍGENAS', FONTE.bloco, W_ - 120, 400), cor: VERM, alinhar: 'center', erro: SANGUE, desloc: 8 }), 93);
        L.escorrer(ctx, 80, 1185, 920, seg(lt, 0.6, 1.8), VERM, 93, 240);
      } else {
        const lp = t - M.logo;
        L.aplicarCarimbo(ctx, seg(lp, 0, 0.3), W_ / 2, 860, () => L.imagem(ctx, L.img.logo, W_ / 2, 860, 860), 97);
        ctx.save(); ctx.globalAlpha = seg(lp, 0.6, 1.2);
        L.texto(ctx, 'Fontes: Agência Brasil · ICL Notícias · NC News', W_ / 2, 1500,
          { familia: FONTE.maquina, peso: 400, tam: 28, cor: COR.begeEscuro, alinhar: 'center' });
        L.texto(ctx, 'Fotos: Marcello Casal Jr, Bruno Peres, Tânia Rêgo / Agência Brasil (CC BY 3.0 BR)', W_ / 2, 1545,
          { familia: FONTE.maquina, peso: 400, tam: 24, cor: COR.begeEscuro, alinhar: 'center' });
        ctx.restore();
      }
    }
  },
};
