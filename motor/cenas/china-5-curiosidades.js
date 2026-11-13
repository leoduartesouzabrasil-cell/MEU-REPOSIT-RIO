// "5 curiosidades da China comunista". Roteiro: roteiros/china-5-curiosidades.md · base de estilo: comunismo-01.js
// Ordem: gancho CARTAZ ("na China ser cristão é proibido?") → congela + carimbo MENTIRA → cristãos e religiões (ARQUIVO) →
// "5 CURIOSIDADES" (CARTAZ) → nº 1 pobreza → nº 2 trem-bala → nº 3 expectativa de vida → nº 4 florestas → "e por último" →
// nº 5 partido (CARTAZ) → resumo + "comenta" → logo e créditos. Marcas e legendas: china-5-curiosidades.tempos.js (montar.py).
//
// DIAGRAMAÇÃO PADRÃO: título y 330 · fonte dos dados y 384 · conteúdo x 120–960, y 420–1420 · legenda (tarja) y 1466–1542
const T = Object.assign({
  gancho: 0.3, proibido: 3.1, corte: 3.7, mentira: 4.2, carimbo: 5.6, igreja: 6.5, religioes: 10.9, errado: 16.5, cinco: 20.0,
  n1: 23.8, n1b: 31.2, n2: 36.6, n2b: 41.1, n3: 43.6, n3b: 51.4, n4: 53.4, n4b: 58.9, n4c: 60.5, ultimo: 65.0, n5: 67.3,
  alemanha: 72.7, comenta: 76.1, logo: 83.7, dur: 87.1,
}, (window.TEMPOS || {}).marcas || {});

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: T.dur,
  imagensOpcionais: true,   // sem a foto, a cena desenha a versão 2D
  imagens: {
    igreja: '../midia/china-5-curiosidades/igreja.jpg',
    trem: '../midia/china-5-curiosidades/trem.jpg',
    r1949: '../midia/china-5-curiosidades/1949.jpg',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease, clamp } = L;
    const CX = 540, LARG = 840, X0 = 120, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta, AZUL = COR.azul;
    const VERDE = '#3E6B3A';   // cor seletiva só da floresta (nº 4)
    const temImg = k => L.img[k] && L.img[k].naturalWidth > 0;
    let arquivo = true;
    const POVO = [
      { roupa: AZUL, pele: '#D8A878', chapeu: 'bone' }, { roupa: VERM, pele: '#C99566' }, { roupa: BEGE, pele: '#E0B48A', chapeu: 'bone', bone: VERM },
      { roupa: AMA, pele: '#B9875A' }, { roupa: AZUL, pele: '#CFA070' }, { roupa: TINTA, pele: '#D8A878', chapeu: 'bone', bone: AMA, calca: AZUL },
    ];

    const ordem = [[0, gancho], [T.igreja, religioes], [T.cinco, cinco], [T.n1, pobreza], [T.n2, trem], [T.n3, vida], [T.n4, floresta],
      [T.ultimo, ultimo], [T.n5, partido], [T.comenta, resumo], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [T.proibido, T.carimbo, T.cinco, T.n1 + 0.1, T.n2 + 0.1, T.n3 + 0.1, T.n4 + 0.1, T.n5, T.alemanha, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 10);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();

    [[T.igreja, BEGE, -24], [T.cinco, VERM, 24], [T.n1, BEGE, -24], [T.n2, BEGE, 24], [T.n3, BEGE, -24], [T.n4, BEGE, 24],
      [T.ultimo, VERM, -24], [T.comenta, BEGE, 24], [T.logo, BEGE, -24]].forEach(([X, cor, ang]) => L.corteDiagonal(ctx, seg(t, X - 0.4, X), cor, ang));
    if (arquivo) L.varredura(ctx, t, 0.07);
    IMP.forEach(X => L.flash(ctx, t, X, AMA, 0.25, 0.22));
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);
    legenda();

    // ------------------------------------------------ componentes padronizados (iguais aos do EP. 1)
    function legenda() {
      const LEG = (window.TEMPOS || {}).legendas || [];
      const l = LEG.find(l => t >= l.t0 - 0.05 && t < l.t1);
      if (!l || t >= T.logo) return;
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
      L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), o.cx || CX, y, () =>
        L.texto(ctx, txt, o.cx || CX, y, { familia, peso, tam: tamMax(txt, familia, tam, peso, o.larg || LARG), cor, alinhar: 'center', ...o }), seed);
    }
    function faixa(txt, y, t0, fundoCor = TINTA, cor = BEGE, tam = 56, seed = 9) {
      L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), CX, y, () => {
        ctx.fillStyle = fundoCor; ctx.fillRect(X0, y - 60, LARG, 120);
        L.texto(ctx, txt, CX, y + tam * 0.36, { familia: FONTE.bloco, peso: 400, tam: tamMax(txt, FONTE.bloco, tam, 400, 780), cor, alinhar: 'center' });
      }, seed);
    }
    // número contando (pt-BR, com pontos de milhar)
    function contar(de, ate, p, casas = 0) {
      const v = lerp(de, ate, ease.saida(clamp(p)));
      return v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
    }
    // selo "Nº X" carimbado no canto superior esquerdo do conteúdo
    function selo(n, t0) {
      L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), 220, 520, () => {
        ctx.save(); ctx.translate(220, 520); ctx.rotate(-0.08);
        ctx.fillStyle = VERM; ctx.beginPath(); ctx.arc(0, 0, 92, 0, 7); ctx.fill();
        ctx.strokeStyle = BEGE; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 78, 0, 7); ctx.stroke();
        L.texto(ctx, 'Nº', 0, -22, { familia: FONTE.grotesca, peso: 700, tam: 34, cor: BEGE, alinhar: 'center' });
        L.texto(ctx, String(n), 0, 52, { familia: FONTE.bloco, peso: 400, tam: 86, cor: AMA, alinhar: 'center' });
        ctx.restore();
      }, 30 + n);
    }
    function fotoMoldura(k, x, y, w, h, t0, legendaFoto, creditoFoto, o = {}) {
      if (!temImg(k)) return;
      const e = ease.saida(seg(t, t0, t0 + 0.5));
      ctx.save(); ctx.globalAlpha = clamp(seg(t, t0, t0 + 0.3));
      L.moldura(ctx, x, y, w, h, 22);
      L.foto(ctx, L.img[k], x, y, w, h, { pb: true, zoom: lerp(1.0, 1.06, seg(t, t0, t0 + 4)), desfoque: (1 - e) * 8, ...o });
      if (legendaFoto) L.texto(ctx, legendaFoto, x + w / 2, y + h + 58, { familia: FONTE.grotesca, peso: 700, tam: tamMax(legendaFoto, FONTE.grotesca, 28, 700, w + 40), cor: TINTA, alinhar: 'center' });
      L.texto(ctx, creditoFoto, x + w / 2, y + h + (legendaFoto ? 92 : 56), { familia: FONTE.maquina, peso: 400, tam: tamMax(creditoFoto, FONTE.maquina, 22, 400, w + 40), cor: TINTA, alinhar: 'center' });
      ctx.restore();
    }
    function sol(cor = 'rgba(138,20,17,0.5)', y = 1180) {
      L.fundo(ctx, VERM);
      L.raios(ctx, CX, y, 2400, 22, -0.25 + L.emDois(t) * 0.04, cor);
    }

    // ------------------------------------------------ boneco de cartaz (pés em x, y)
    function pessoa(x, y, p, esc = 1, passo = 0) {
      ctx.save(); ctx.translate(x, y); ctx.scale(esc, esc);
      const sw = Math.sin(passo * Math.PI) * 12, quica = Math.abs(Math.sin(passo * Math.PI)) * 6;
      ctx.translate(0, -quica); ctx.lineWidth = 4; ctx.strokeStyle = TINTA; ctx.lineJoin = 'round';
      ctx.fillStyle = p.calca || TINTA; ctx.fillRect(-22 + sw, -72, 18, 72); ctx.fillRect(4 - sw, -72, 18, 72);
      ctx.fillStyle = p.roupa;
      ctx.beginPath(); ctx.moveTo(-36, -150); ctx.lineTo(36, -150); ctx.lineTo(46, -66); ctx.lineTo(-46, -66); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillRect(-56, -146, 18, 72); ctx.strokeRect(-56, -146, 18, 72); ctx.fillRect(38, -146, 18, 72); ctx.strokeRect(38, -146, 18, 72);
      ctx.fillStyle = p.pele || '#C68E5E'; ctx.beginPath(); ctx.arc(-47, -68, 9, 0, 7); ctx.arc(47, -68, 9, 0, 7); ctx.fill();
      ctx.fillStyle = p.pele || '#C68E5E'; ctx.beginPath(); ctx.arc(0, -184, 30, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(0, -190, 31, Math.PI, 0); ctx.fill();
      ctx.fillRect(-12, -186, 6, 6); ctx.fillRect(6, -186, 6, 6);
      if (p.chapeu === 'bone') { ctx.fillStyle = p.bone || TINTA; ctx.fillRect(-31, -216, 62, 22); ctx.fillRect(0, -198, 46, 8); }
      ctx.restore();
    }

    // ------------------------------------------------ 0. o gancho (CARTAZ) → congela → MENTIRA
    function gancho(lt) {
      arquivo = false;
      const tc = Math.min(t, T.corte);                    // depois do corte, a imagem congela
      const parado = t >= T.corte;
      ctx.save();
      if (parado) ctx.filter = 'grayscale(0.85) contrast(1.1) brightness(0.8)';
      const z = lerp(1.0, 1.07, seg(tc, T.gancho, T.corte));
      L.camera(ctx, { zoom: z }, () => {
        sol();
        // cruz cristã em silhueta, grande, atrás do texto
        ctx.save(); ctx.globalAlpha = 0.9 * seg(tc, 0.2, 0.7); ctx.fillStyle = COR.vermelhoEscuro;
        ctx.fillRect(CX - 60, 420, 120, 560); ctx.fillRect(CX - 230, 560, 460, 120); ctx.restore();
        const linhas = [['VOCÊ SABIA QUE', 560, 0.3, BEGE, 92, FONTE.sub], ['NA CHINA, SER', 760, 1.2, BEGE, 150, FONTE.manchete],
          ['CRISTÃO', 960, 1.9, AMA, 210, FONTE.bloco], ['É PROIBIDO?', 1180, T.proibido - 0.05, BEGE, 170, FONTE.manchete]];
        linhas.forEach(([s, y, t0, cor, tam, fam], i) => {
          const peso = fam === FONTE.bloco ? 400 : 900;
          L.aplicarCarimbo(ctx, seg(tc, t0, t0 + 0.3), CX, y, () =>
            L.texto(ctx, s, CX, y, { familia: fam, peso, tam: tamMax(s, fam, tam, peso, 900), cor, alinhar: 'center', erro: TINTA, desloc: 6 }), 10 + i);
        });
      });
      ctx.restore();
      if (parado) {
        // listras de "pausa" de fita e o tremor do disco arranhando
        const k = seg(t, T.corte, T.corte + 0.5);
        ctx.save(); ctx.globalAlpha = 0.5 * (1 - k * 0.6); ctx.fillStyle = TINTA;
        for (let i = 0; i < 7; i++) { const y = (L.rng(Math.floor(t * 20) + i)() * 1920) | 0; ctx.fillRect(0, y, 1080, 6 + i % 3 * 5); }
        ctx.restore();
        L.texto(ctx, '❚❚', 960, 200, { familia: FONTE.grotesca, peso: 700, tam: 60, cor: BEGE, alinhar: 'center' });
        // MENTIRA carimbado torto
        L.aplicarCarimbo(ctx, seg(t, T.carimbo, T.carimbo + 0.3), CX, 860, () => {
          ctx.save(); ctx.translate(CX, 860); ctx.rotate(-0.16);
          ctx.strokeStyle = AMA; ctx.lineWidth = 16; ctx.strokeRect(-430, -150, 860, 260);
          ctx.fillStyle = 'rgba(200,32,30,0.92)'; ctx.fillRect(-416, -136, 832, 232);
          L.texto(ctx, 'MENTIRA', 0, 60, { familia: FONTE.bloco, peso: 400, tam: 190, cor: AMA, alinhar: 'center', erro: TINTA, desloc: 8 });
          ctx.restore();
        }, 7);
      }
    }

    // ------------------------------------------------ 1. cristãos e religiões (ARQUIVO)
    function religioes(lt) {
      L.fundo(ctx, BEGE);
      titulo('CRISTÃOS NA CHINA', seg(lt, 0.1, 0.6));
      cred('Livro Branco do Conselho de Estado da China, 2018', seg(lt, 0.3, 0.9));
      const fase2 = t >= T.religioes;
      // a igreja (foto) ou, sem foto, uma cruz de cartaz
      const sobe = ease.saida(seg(t, T.religioes, T.religioes + 0.5));
      const fy = lerp(450, 430, sobe), fh = lerp(330, 240, sobe), fw = lerp(560, 400, sobe), fx = CX - fw / 2;
      if (temImg('igreja')) fotoMoldura('igreja', fx, fy, fw, fh, T.igreja, null, CRED.igreja);
      else { ctx.fillStyle = TINTA; ctx.fillRect(CX - 30, fy + 40, 60, fh - 80); ctx.fillRect(CX - 120, fy + 120, 240, 60); }
      // contador de cristãos
      const yc = lerp(1080, 880, sobe);
      const p = seg(t, T.igreja + 1.2, T.igreja + 2.6);
      if (p > 0) {
        L.texto(ctx, contar(0, 40000000, p) + (p >= 1 ? '+' : ''), CX, yc, { familia: FONTE.bloco, peso: 400, tam: 120, cor: VERM, alinhar: 'center', erro: TINTA, desloc: 4 });
        L.etiqueta(ctx, 'CRISTÃOS SÓ NAS IGREJAS REGISTRADAS', CX, yc + 76, seg(t, T.igreja + 2.4, T.igreja + 2.7), { cor: TINTA, tam: 32 });
      }
      // a ficha das religiões
      if (fase2) {
        const e = ease.saida(seg(t, T.religioes + 0.3, T.religioes + 0.7));
        ctx.save(); ctx.translate(0, (1 - e) * 900);
        const y0 = 1030;
        ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(X0 + 14, y0 + 14, LARG, 360);
        ctx.fillStyle = BEGE; ctx.fillRect(X0, y0, LARG, 360); ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.strokeRect(X0, y0, LARG, 360);
        ctx.fillStyle = VERM; ctx.fillRect(X0, y0, LARG, 14);
        L.texto(ctx, 'RELIGIÕES RECONHECIDAS', X0 + 40, y0 + 82, { familia: FONTE.sub, peso: 600, tam: 44, cor: VERM, tracking: 3 });
        ['budismo · taoísmo · islã', 'catolicismo · protestantismo'].forEach((s, i) =>
          L.texto(ctx, L.datilografar(s, seg(t, T.religioes + 0.9 + i * 0.8, T.religioes + 1.7 + i * 0.8)), X0 + 40, y0 + 160 + i * 64, { familia: FONTE.maquina, peso: 400, tam: 44, cor: TINTA }));
        const s3 = '≈ 200 milhões de religiosos';
        L.texto(ctx, L.datilografar(s3, seg(t, T.religioes + 2.6, T.religioes + 3.6)), X0 + 40, y0 + 310, { familia: FONTE.maquina, peso: 400, tam: 46, cor: TINTA });
        L.fonte(ctx, FONTE.maquina, 46, 400);
        L.selecao(ctx, X0 + 36, y0 + 266, ctx.measureText(s3).width + 10, 60, seg(t, T.religioes + 3.8, T.religioes + 4.2), VERM);
        ctx.restore();
      }
      if (t >= T.errado) faixa('TE CONTARAM ERRADO', 600, T.errado + 0.5, VERM, BEGE, 64, 21);
    }

    // ------------------------------------------------ 2. "5 CURIOSIDADES" (CARTAZ)
    function cinco(lt) {
      arquivo = false;
      sol();
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 860, () => {
        L.estrela(ctx, CX, 760, 330, 0, AMA);
        L.texto(ctx, '5', CX, 900, { familia: FONTE.bloco, peso: 400, tam: 420, cor: VERM, alinhar: 'center', erro: TINTA, desloc: 10 });
      }, 41);
      carimbar('CURIOSIDADES', 1200, T.cinco + 0.5, BEGE, 140, FONTE.manchete, 42, { erro: TINTA });
      carimbar('DA CHINA QUE VOCÊ NÃO SABIA', 1330, T.cinco + 1.1, AMA, 64, FONTE.sub, 43, { erro: TINTA });
    }

    // ------------------------------------------------ 3. nº 1 · pobreza (ARQUIVO, 2D)
    function pobreza(lt) {
      L.fundo(ctx, BEGE);
      titulo('POBREZA EXTREMA', seg(lt, 0.1, 0.6));
      cred('Banco Mundial, 2022 (menos de US$ 1,90 por dia)', seg(lt, 0.3, 0.9));
      selo(1, T.n1 + 0.1);
      const fase2 = t >= T.n1b;
      const sai = ease.saida(seg(t, T.n1b, T.n1b + 0.5));
      // a linha da pobreza e os bonecos subindo por cima dela
      ctx.save(); ctx.globalAlpha = 1 - sai;
      const yl = 1170;
      ctx.fillStyle = VERM; ctx.fillRect(X0, yl, LARG, 10);
      L.texto(ctx, 'LINHA DA POBREZA EXTREMA', CX, yl + 56, { familia: FONTE.grotesca, peso: 700, tam: 30, cor: VERM, alinhar: 'center' });
      for (let i = 0; i < 6; i++) {
        const t0 = T.n1 + 1.4 + i * 0.35, k = ease.saida(seg(t, t0, t0 + 0.9));
        const x = 220 + i * 128, y = lerp(1400, yl - 8, k);
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1080, yl); ctx.clip();
        pessoa(x, y, POVO[i], 0.62, seg(t, t0, t0 + 0.9) * 2);
        ctx.restore();
      }
      ctx.restore();
      // o contador
      const p = seg(t, T.n1 + 1.0, T.n1 + 3.6);
      const yn = lerp(760, 620, sai);
      if (p > 0) {
        L.texto(ctx, contar(0, 800, p), 600, yn, { familia: FONTE.bloco, peso: 400, tam: 210, cor: VERM, alinhar: 'center', erro: TINTA, desloc: 6 });
        L.texto(ctx, 'MILHÕES DE PESSOAS', 600, yn + 80, { familia: FONTE.sub, peso: 600, tam: 56, cor: TINTA, alinhar: 'center', tracking: 2 });
        L.etiqueta(ctx, 'EM 40 ANOS', 600, yn + 160, seg(t, T.n1 + 4.4, T.n1 + 4.7), { cor: AZUL, tam: 36 });
      }
      // a pizza: quase 3/4 da redução da pobreza no mundo
      if (fase2) {
        const cx = CX, cy = 1040, r = 230, k = ease.saida(seg(t, T.n1b + 0.6, T.n1b + 1.6));
        ctx.save();
        ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(cx + 10, cy + 10, r, 0, 7); ctx.fill();
        ctx.fillStyle = COR.begeEscuro; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
        ctx.fillStyle = VERM; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * 0.75 * k); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = TINTA; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
        ctx.restore();
        if (k > 0.8) L.texto(ctx, 'CHINA', cx - 40, cy + 30, { familia: FONTE.bloco, peso: 400, tam: 70, cor: AMA, alinhar: 'center', erro: TINTA, desloc: 3 });
        L.etiqueta(ctx, 'QUASE 3/4 DA REDUÇÃO DA POBREZA NO MUNDO', CX, 1340, seg(t, T.n1b + 1.6, T.n1b + 1.9), { cor: VERM, tam: 30 });
      }
    }

    // ------------------------------------------------ 4. nº 2 · trem-bala
    function trem(lt) {
      L.fundo(ctx, BEGE);
      titulo('TREM-BALA', seg(lt, 0.1, 0.6));
      cred('China State Railway Group, dezembro de 2025', seg(lt, 0.3, 0.9));
      selo(2, T.n2 + 0.1);
      if (temImg('trem')) fotoMoldura('trem', 380, 450, 560, 330, T.n2 + 0.3, null, CRED.trem);
      // o trem desenhado cruzando a tela
      const k = seg(t, T.n2 + 1.2, T.n2 + 3.2), xt = lerp(-900, 1300, ease.saida(k));
      const yt = 960;
      ctx.fillStyle = TINTA; ctx.fillRect(0, yt + 70, 1080, 8);
      for (let i = 0; i < 30; i++) ctx.fillRect(i * 40, yt + 82, 18, 8);
      ctx.save(); ctx.translate(xt, yt);
      ctx.fillStyle = BEGE; ctx.strokeStyle = TINTA; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-700, 0); ctx.lineTo(80, 0); ctx.quadraticCurveTo(230, 10, 260, 66); ctx.lineTo(-700, 66); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = VERM; ctx.fillRect(-700, 36, 900, 12);
      ctx.fillStyle = TINTA; for (let i = 0; i < 9; i++) ctx.fillRect(-680 + i * 80, 12, 50, 18);
      ctx.beginPath(); ctx.moveTo(110, 8); ctx.quadraticCurveTo(190, 14, 215, 34); ctx.lineTo(110, 34); ctx.fill();
      ctx.restore();
      // velocidade
      if (k > 0 && k < 1) { ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = TINTA; for (let i = 0; i < 6; i++) ctx.fillRect(xt - 900 - i * 60, yt + 6 + i * 10, 140, 3); ctx.restore(); }
      // contador
      const p = seg(t, T.n2 + 1.0, T.n2 + 3.0);
      if (p > 0) {
        L.texto(ctx, contar(0, 50000, p), CX, 1210, { familia: FONTE.bloco, peso: 400, tam: 170, cor: VERM, alinhar: 'center', erro: TINTA, desloc: 5 });
        L.texto(ctx, 'QUILÔMETROS', CX, 1280, { familia: FONTE.sub, peso: 600, tam: 52, cor: TINTA, alinhar: 'center', tracking: 4 });
      }
      // barras: China × resto do mundo
      if (t >= T.n2b) {
        ctx.save(); ctx.fillStyle = BEGE; ctx.globalAlpha = ease.saida(seg(t, T.n2b, T.n2b + 0.3)); ctx.fillRect(X0 - 20, 880, LARG + 40, 430); ctx.restore();
        const kb = ease.saida(seg(t, T.n2b + 0.2, T.n2b + 1.0));
        [['CHINA', 1, VERM, 960], ['RESTO DO MUNDO', 0.43, TINTA, 1150]].forEach(([nome, f, cor, y]) => {
          L.texto(ctx, nome, X0, y - 20, { familia: FONTE.grotesca, peso: 700, tam: 36, cor: TINTA });
          ctx.fillStyle = cor; ctx.fillRect(X0, y, LARG * f * kb, 90);
        });
        carimbar('MAIS QUE O RESTO DO MUNDO SOMADO', 1360, T.n2b + 1.0, VERM, 48, FONTE.bloco, 51);
      }
    }

    // ------------------------------------------------ 5. nº 3 · expectativa de vida
    function vida(lt) {
      L.fundo(ctx, BEGE);
      titulo('EXPECTATIVA DE VIDA', seg(lt, 0.1, 0.6));
      cred('Conselho de Estado da China (1949) · Comissão Nacional de Saúde (2024)', seg(lt, 0.3, 0.9));
      selo(3, T.n3 + 0.1);
      if (temImg('r1949')) fotoMoldura('r1949', 400, 450, 520, 330, T.n3 + 0.5, null, CRED.r1949);
      else carimbar('1949', 640, T.n3 + 0.5, VERM, 200, FONTE.bloco, 61, { cx: 680, larg: 400 });
      // a régua da idade
      const y = 1180, xa = X0 + 20, xb = X0 + LARG - 20, idade = a => lerp(xa, xb, a / 90);
      ctx.fillStyle = TINTA; ctx.fillRect(xa, y, xb - xa, 8);
      for (let a = 0; a <= 90; a += 10) {
        ctx.fillRect(idade(a) - 2, y - 16, 4, 40);
        L.texto(ctx, String(a), idade(a), y + 64, { familia: FONTE.grotesca, peso: 700, tam: 28, cor: TINTA, alinhar: 'center' });
      }
      L.texto(ctx, 'ANOS DE VIDA, EM MÉDIA', CX, y + 110, { familia: FONTE.maquina, peso: 400, tam: 26, cor: TINTA, alinhar: 'center' });
      const k35 = seg(t, T.n3 + 2.2, T.n3 + 4.0), k79 = seg(t, T.n3b, T.n3b + 1.4);
      const a = t < T.n3b ? lerp(0, 35, ease.saida(k35)) : lerp(35, 79, ease.saida(k79));
      ctx.fillStyle = VERM; ctx.fillRect(xa, y - 4, idade(a) - xa, 16);
      pessoa(idade(a), y - 10, POVO[0], 0.75, (t < T.n3b ? k35 : k79) * 6);
      if (k35 >= 1) {
        ctx.save(); ctx.globalAlpha = t < T.n3b ? 1 : 0.45;
        L.etiqueta(ctx, '1949: 35 ANOS', idade(35), 930, 1, { cor: TINTA, tam: 36 });
        ctx.restore();
      }
      if (k79 >= 1) L.etiqueta(ctx, 'HOJE: 79 ANOS', idade(79) - 60, 930, seg(t, T.n3b + 1.4, T.n3b + 1.7), { cor: VERM, tam: 40 });
    }

    // ------------------------------------------------ 6. nº 4 · florestas (o verde é a cor seletiva)
    function floresta(lt) {
      L.fundo(ctx, BEGE);
      titulo('FLORESTAS', seg(lt, 0.1, 0.6));
      cred('Adm. Nacional de Florestas e Pastagens · NASA/Nature Sustainability, 2019', seg(lt, 0.3, 0.9));
      selo(4, T.n4 + 0.1);
      const fase3 = t >= T.n4c, sai = ease.saida(seg(t, T.n4c, T.n4c + 0.5));
      // 100 árvores: % do território com floresta
      const pct = t < T.n4b ? 8.6 * ease.saida(seg(t, T.n4 + 1.6, T.n4 + 3.0)) : lerp(8.6, 25.1, ease.saida(seg(t, T.n4b, T.n4b + 1.6)));
      ctx.save(); ctx.globalAlpha = 1 - sai;
      for (let i = 0; i < 100; i++) {
        const col = i % 10, lin = 9 - Math.floor(i / 10), x = 420 + col * 52, yy = 650 + lin * 56;
        const viva = i < Math.round(pct);
        ctx.fillStyle = viva ? VERDE : COR.begeEscuro;
        ctx.beginPath(); ctx.moveTo(x, yy - 24); ctx.lineTo(x + 18, yy + 10); ctx.lineTo(x - 18, yy + 10); ctx.closePath(); ctx.fill();
        ctx.fillStyle = viva ? TINTA : COR.begeEscuro; ctx.fillRect(x - 3, yy + 10, 6, 10);
      }
      L.texto(ctx, contar(0, pct, 1, pct < 10 ? 1 : 0) + '%', 250, 900, { familia: FONTE.bloco, peso: 400, tam: 110, cor: t < T.n4b ? TINTA : VERDE, alinhar: 'center', erro: t < T.n4b ? null : TINTA, desloc: 3 });
      L.texto(ctx, t < T.n4b ? 'EM 1949' : 'HOJE', 250, 970, { familia: FONTE.sub, peso: 600, tam: 48, cor: TINTA, alinhar: 'center', tracking: 3 });
      L.texto(ctx, 'do território é floresta', 250, 1020, { familia: FONTE.maquina, peso: 400, tam: 26, cor: TINTA, alinhar: 'center' });
      ctx.restore();
      // o planeta: 1/4 do verde novo
      if (fase3) {
        const cx = CX, cy = 900, r = 260, k = ease.saida(seg(t, T.n4c + 0.4, T.n4c + 1.4));
        ctx.save(); ctx.globalAlpha = sai;
        ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(cx + 10, cy + 10, r, 0, 7); ctx.fill();
        ctx.fillStyle = AZUL; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(237,224,196,0.35)'; ctx.lineWidth = 3;
        for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(cx, cy, r * Math.cos(i * 0.35), r, 0, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - r * Math.cos(i * 0.4), cy + r * Math.sin(i * 0.4)); ctx.lineTo(cx + r * Math.cos(i * 0.4), cy + r * Math.sin(i * 0.4)); ctx.stroke(); }
        ctx.fillStyle = VERDE; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI / 2 * k); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = TINTA; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
        ctx.restore();
        if (k > 0.9) L.texto(ctx, '1/4', cx + 120, cy - 70, { familia: FONTE.bloco, peso: 400, tam: 90, cor: AMA, alinhar: 'center', erro: TINTA, desloc: 4 });
        L.etiqueta(ctx, 'DO VERDE NOVO DO PLANETA', CX, 1250, seg(t, T.n4c + 1.4, T.n4c + 1.7), { cor: VERDE, tam: 38 });
        L.texto(ctx, 'aumento da área de folhas, 2000–2017', CX, 1330, { familia: FONTE.maquina, peso: 400, tam: 24, cor: TINTA, alinhar: 'center' });
      }
    }

    // ------------------------------------------------ 7. "e por último…" (CARTAZ, a tensão sobe)
    function ultimo(lt) {
      arquivo = false;
      sol('rgba(138,20,17,0.5)', 1400 - seg(lt, 0, 2.2) * 300);
      const s = 'E POR ÚLTIMO...';
      L.texto(ctx, L.datilografar(s, seg(lt, 0.1, 0.9)), CX, 820, { familia: FONTE.manchete, peso: 900, tam: 130, cor: BEGE, alinhar: 'center', erro: TINTA });
      L.texto(ctx, L.datilografar('mas não menos importante', seg(lt, 0.9, 1.6)), CX, 920, { familia: FONTE.serifa, estilo: 'italic', peso: 400, tam: 64, cor: AMA, alinhar: 'center' });
    }

    // ------------------------------------------------ 8. nº 5 · o partido (CARTAZ)
    function partido(lt) {
      arquivo = false;
      sol();
      L.texto(ctx, 'Departamento de Organização do PCCh · dados de 31/12/2024', CX, 384, { familia: FONTE.maquina, peso: 400, tam: 22, cor: BEGE, alinhar: 'center' });
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 520, () => {
        ctx.fillStyle = AMA; ctx.beginPath(); ctx.arc(CX, 500, 92, 0, 7); ctx.fill();
        L.foiceMartelo(ctx, CX, 500, 100, VERM);
      }, 71);
      const fase2 = t >= T.alemanha, sobe = ease.saida(seg(t, T.alemanha, T.alemanha + 0.5));
      const p = seg(t, T.n5 + 1.0, T.n5 + 3.0), y = lerp(820, 720, sobe);
      if (p > 0) L.texto(ctx, contar(0, 100000000, p), CX, y, { familia: FONTE.bloco, peso: 400, tam: tamMax('100.000.000', FONTE.bloco, 170, 400, 880), cor: AMA, alinhar: 'center', erro: TINTA, desloc: 7 });
      carimbar('DE MEMBROS', y + 100, T.n5 + 3.0, BEGE, 90, FONTE.manchete, 72, { erro: TINTA });
      if (!fase2) carimbar('NO PARTIDO COMUNISTA DA CHINA', y + 190, T.n5 + 3.6, BEGE, 54, FONTE.sub, 73, { erro: TINTA });
      // comparação: bonecos (1 = 10 milhões)
      if (fase2) {
        const linha = (n, y0, rot, t0, parcial = 1) => {
          L.texto(ctx, rot, X0, y0 - 150, { familia: FONTE.grotesca, peso: 700, tam: 34, cor: BEGE });
          for (let i = 0; i < Math.ceil(n); i++) {
            const k = seg(t, t0 + i * 0.06, t0 + i * 0.06 + 0.25);
            if (k <= 0) continue;
            ctx.save(); ctx.globalAlpha = k;
            if (i === Math.ceil(n) - 1 && parcial < 1) { ctx.beginPath(); ctx.rect(X0 + i * 84 - 40, y0 - 200, 80 * parcial, 220); ctx.clip(); }
            pessoa(X0 + 40 + i * 84, y0, POVO[i % POVO.length], 0.5);
            ctx.restore();
          }
        };
        linha(10, 1140, 'PARTIDO COMUNISTA DA CHINA · 100 MILHÕES', T.alemanha + 0.3);
        linha(8.3, 1400, 'ALEMANHA INTEIRA · 83 MILHÕES', T.alemanha + 1.2, 0.3);
        L.texto(ctx, '1 boneco = 10 milhões de pessoas', X0 + LARG, 1440, { familia: FONTE.maquina, peso: 400, tam: 22, cor: BEGE, alinhar: 'right' });
      }
    }

    // ------------------------------------------------ 9. resumo + "comenta"
    function resumo(lt) {
      L.fundo(ctx, BEGE);
      titulo('QUAL DESSAS VOCÊ NÃO SABIA?', seg(lt, 0.1, 0.7));
      const itens = [['POBREZA EXTREMA', '−800 MILHÕES'], ['TREM-BALA', '50 MIL KM'], ['EXPECTATIVA DE VIDA', '35 → 79 ANOS'],
        ['FLORESTAS', '8,6% → 25%'], ['PARTIDO COMUNISTA', '100 MILHÕES']];
      itens.forEach(([a, b], i) => {
        const y = 470 + i * 150, k = seg(t, T.comenta + 0.5 + i * 0.25, T.comenta + 0.8 + i * 0.25);
        if (k <= 0) return;
        L.aplicarCarimbo(ctx, k, CX, y + 50, () => {
          ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(X0 + 10, y + 10, LARG, 110);
          ctx.fillStyle = i % 2 ? TINTA : VERM; ctx.fillRect(X0, y, LARG, 110);
          ctx.fillStyle = AMA; ctx.beginPath(); ctx.arc(X0 + 60, y + 55, 38, 0, 7); ctx.fill();
          L.texto(ctx, String(i + 1), X0 + 60, y + 78, { familia: FONTE.bloco, peso: 400, tam: 60, cor: TINTA, alinhar: 'center' });
          L.texto(ctx, a, X0 + 120, y + 68, { familia: FONTE.grotesca, peso: 700, tam: tamMax(a, FONTE.grotesca, 32, 700, 340), cor: BEGE });
          L.texto(ctx, b, X0 + LARG - 30, y + 74, { familia: FONTE.bloco, peso: 400, tam: tamMax(b, FONTE.bloco, 46, 400, 300), cor: AMA, alinhar: 'right' });
        }, 80 + i);
      });
      // "comenta aqui": balão de comentário
      const k = seg(t, T.comenta + 2.4, T.comenta + 2.7);
      if (k > 0) L.aplicarCarimbo(ctx, k, CX, 1290, () => {
        ctx.fillStyle = AZUL; ctx.fillRect(250, 1230, 580, 120);
        ctx.beginPath(); ctx.moveTo(320, 1350); ctx.lineTo(300, 1400); ctx.lineTo(380, 1350); ctx.fill();
        L.texto(ctx, 'COMENTA AQUI 💬', CX, 1310, { familia: FONTE.bloco, peso: 400, tam: 56, cor: BEGE, alinhar: 'center' });
      }, 88);
    }

    // ------------------------------------------------ 10. logo e créditos
    function final(lt) {
      L.fundo(ctx, BEGE); arquivo = false;
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 780, () => L.imagem(ctx, L.img.logo, CX, 780, 780), 97);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.6, 1.2);
      [[CRED_FINAL.fotos, 1110],
        ['Fontes: Livro Branco do Conselho de Estado (2016, 2017, 2018) · Banco Mundial (2022)', 1160],
        ['China State Railway Group (2025) · Comissão Nacional de Saúde (2025)', 1200],
        ['Adm. Nacional de Florestas e Pastagens (2026) · Chen et al., Nature Sustainability (2019)', 1240],
        ['Departamento de Organização do PCCh (2025)', 1280]].forEach(([s2, y]) =>
        L.texto(ctx, s2, CX, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(s2, FONTE.maquina, 24, 400), cor: TINTA, alinhar: 'center' }));
      ctx.restore();
    }
  },
};

// créditos das fotos (preenchidos com o CREDITOS.md de midia/china-5-curiosidades)
const CRED = {
  igreja: 'Catedral de Xujiahui, Xangai · Foto: Onedesign23 / Wikimedia Commons (CC BY-SA 4.0)',
  trem: 'Trem Fuxing CR400AF · Foto: MNXANL / Wikimedia Commons (CC BY-SA 4.0)',
  r1949: 'Pequim, 1º/10/1949 · autor desconhecido, domínio público',
};
const CRED_FINAL = { fotos: 'Fotos: Onedesign23 e MNXANL (CC BY-SA 4.0, Wikimedia Commons) · 1949: domínio público' };
