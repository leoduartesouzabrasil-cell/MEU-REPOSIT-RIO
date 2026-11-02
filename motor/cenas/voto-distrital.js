// "Voto distrital: seu voto no lixo" (ângulo: contra). Roteiro: roteiros/voto-distrital.md
// Abertura CARTAZ noturna → print da notícia (Agência Câmara) → contexto (ficha) → "como isso funcionaria na prática?" →
// maquete 3D fosca da Vila Exemplo (distritos, Dona Maria e seu João votam, o empresário leva, 60% dos votos no lixo,
// a caneta redesenha o mapa, o curral, quem fica de fora) → distritão (rejeitado 2017/2021) → cartaz final → logo.
// PRÉVIA sem narração (tempos estimados). Com a narração, T vem de voto-distrital.tempos.js.
// Render: node motor/render.js voto-distrital saida/voto-distrital.mp4 --audio audio/voto-distrital/previa.wav
//
// DIAGRAMAÇÃO PADRÃO: título y 330 · fonte dos dados y 384 · conteúdo x 120–960, y 420–1420 · legenda (tarja) y 1466–1542
const T = Object.assign({
  n1: 0.3, n2: 1.2, n3: 2.1, n4: 2.9, cedula: 3.2, print: 4.6, sel: 6.0, ctx: 8.4, c1: 9.0, c2: 10.0, c3: 11.0, c4: 12.0,
  metade: 13.2, pratica: 15.8, cidade: 18.2, distrito: 20.8, desce: 22.0, maria: 23.8, joao: 25.4, chuva: 27.0, conta: 28.6,
  vence: 29.6, lixo: 31.0, lixoTxt: 32.6, mapa: 34.2, risca: 35.0, novo: 36.7, curral: 38.3, perde: 40.6, distritao: 44.4,
  rej1: 45.6, rej2: 46.6, reforma: 48.8, jogada: 50.6, nao: 52.2, logo: 54.8, dur: 58.4,
}, (window.TEMPOS || {}).marcas || {});

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: T.dur,
  imagens: {
    print: '../midia/voto-distrital/print-agencia-camara-2026-10-28.jpg',   // recorte 1300×1650
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease, clamp } = L;
    const CX = 540, LARG = 840, X0 = 120, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta, AZUL = COR.azul;
    let arquivo = true;

    const ordem = [[0, abertura], [T.print, noticia], [T.ctx, contexto], [T.pratica, pratica], [T.cidade, maquete],
      [T.distritao, distritao], [T.reforma, fecho], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [T.n1, T.n2, T.n3, T.n4, T.pratica + 0.1, T.vence, T.lixoTxt, T.curral + 1.0, T.rej1, T.rej2, T.reforma + 0.1, T.jogada, T.nao, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 12);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();

    [[T.print, BEGE, -24], [T.ctx, BEGE, 24], [T.pratica, VERM, -24], [T.cidade, BEGE, 24], [T.distritao, BEGE, -24],
      [T.reforma, VERM, 24], [T.logo, BEGE, -24]].forEach(([X, cor, ang]) => L.corteDiagonal(ctx, seg(t, X - 0.4, X), cor, ang));
    if (arquivo) L.varredura(ctx, t, 0.07);
    IMP.forEach(X => L.flash(ctx, t, X, AMA, 0.25, 0.25));
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);
    legenda();

    // ------------------------------------------------ componentes padronizados (iguais aos vídeos anteriores)
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
    function carimbar(txt, y, t0, cor, tam, familia = FONTE.bloco, seed = 1, o = {}) {
      const peso = familia === FONTE.manchete ? 900 : 400;
      L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), CX, y, () =>
        L.texto(ctx, txt, CX, y, { familia, peso, tam: tamMax(txt, familia, tam, peso, o.larg || LARG), cor, alinhar: 'center', ...o }), seed);
    }
    // cédula de papel (2D): retângulo bege com o "X" vermelho
    function cedula(x, y, rot, esc = 1) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(esc, esc);
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-86, -54, 180, 116);
      ctx.fillStyle = BEGE; ctx.fillRect(-90, -58, 180, 116);
      ctx.fillStyle = TINTA; for (let i = 0; i < 3; i++) ctx.fillRect(-70, -34 + i * 26, 92, 6);
      ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.strokeRect(34, -36, 38, 38);
      ctx.strokeStyle = VERM; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(36, -34); ctx.lineTo(70, 0); ctx.moveTo(70, -34); ctx.lineTo(36, 0); ctx.stroke();
      ctx.restore();
    }
    function lixeira2d(x, y, esc, tampa = 0) {
      ctx.save(); ctx.translate(x, y); ctx.scale(esc, esc);
      ctx.fillStyle = BEGE; ctx.beginPath(); ctx.moveTo(-120, -150); ctx.lineTo(120, -150); ctx.lineTo(96, 150); ctx.lineTo(-96, 150); ctx.fill();
      ctx.fillStyle = TINTA; for (let i = -2; i <= 2; i++) ctx.fillRect(i * 40 - 7, -110, 14, 230);
      ctx.save(); ctx.translate(-134, -160); ctx.rotate(-tampa * 0.9);
      ctx.fillStyle = BEGE; ctx.fillRect(0, -24, 268, 30); ctx.fillRect(104, -48, 60, 26); ctx.restore();
      ctx.restore();
    }

    // ------------------------------------------------ A. abertura (CARTAZ noturno)
    function abertura(lt) {
      arquivo = false;
      L.fundo(ctx, TINTA);
      // lua amarela atrás, com raios de cartaz muito discretos
      L.raios(ctx, 860, 200, 2200, 24, L.emDois(t) * 0.03, 'rgba(235,181,42,0.06)');
      ctx.fillStyle = AMA; ctx.beginPath(); ctx.arc(860, 200, 105, 0, 7); ctx.fill();
      ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(902, 172, 98, 0, 7); ctx.fill();       // lua minguante
      // estrelas (pontos de retícula)
      const r = L.rng(7); ctx.fillStyle = 'rgba(237,224,196,0.5)';
      for (let i = 0; i < 40; i++) { const x = r() * 1080, y = 60 + r() * 300; ctx.fillRect(x, y, 4, 4); }
      carimbar('NA CALADA', 430, T.n1, BEGE, 120, FONTE.bloco, 11);
      carimbar('DA NOITE', 560, T.n1 + 0.15, BEGE, 120, FONTE.bloco, 12);
      carimbar('ELES QUEREM JOGAR', 680, T.n2, AMA, 74, FONTE.bloco, 13);
      carimbar('O SEU VOTO', 920, T.n3, BEGE, 210, FONTE.manchete, 14, { erro: VERM, desloc: 7 });
      carimbar('NO LIXO!', 1140, T.n4, VERM, 240, FONTE.manchete, 15, { erro: COR.vermelhoEscuro, desloc: 8 });
      // a cédula cai na lixeira
      if (t >= T.cedula - 0.6) {
        const pl = seg(t, T.cedula - 0.6, T.cedula - 0.2), pc = seg(t, T.cedula, T.cedula + 0.55);
        const yL = lerp(1780, 1420, ease.saida(pl));
        if (pc < 1) cedula(lerp(260, 560, pc), lerp(1180, yL - 40, ease.entrada(pc)), pc * 3.4, lerp(1, 0.75, pc));
        lixeira2d(540, yL, 0.75, clamp(Math.sin(Math.PI * seg(t, T.cedula + 0.2, T.cedula + 0.9))));
      }
    }

    // ------------------------------------------------ B. o print da notícia (ARQUIVO)
    function noticia(lt) {
      L.fundo(ctx, BEGE);
      titulo('A NOTÍCIA', seg(lt, 0.1, 0.6));
      cred('Agência Câmara de Notícias · 28/10/2026', seg(lt, 0.3, 1.0));
      const img = L.img.print, w = 840, s = w / img.width, h = 1000;
      const z = lerp(1.0, 1.1, ease.saida(seg(lt, 0, 3.6))), sobe = ease.saida(seg(lt, 0, 0.6));
      L.camera(ctx, { x: lerp(CX, 400, seg(lt, 0.8, 3.0)), y: lerp(960, 760, seg(lt, 0.8, 3.0)), zoom: z }, () => {
        ctx.save(); ctx.translate(CX, 930 + (1 - sobe) * 600); ctx.rotate(-0.022);
        ctx.fillStyle = 'rgba(28,23,20,0.35)'; ctx.fillRect(-w / 2 + 16, -h / 2 + 18, w, h);
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-w / 2 - 10, -h / 2 - 10, w + 20, h + 20);
        ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip();
        ctx.drawImage(img, -w / 2, -h / 2, w, img.height * s);
        ctx.restore();
        // seleção em "ainda neste ano" (linha 3 da manchete)
        L.selecao(ctx, -w / 2 + 24, -h / 2 + 183, 330, 50, seg(t, T.sel, T.sel + 0.5), VERM);
        ctx.restore();
      });
      if (t >= T.sel + 0.6) L.etiqueta(ctx, 'AINDA EM 2026', 760, 1330, seg(t, T.sel + 0.6, T.sel + 0.9), { cor: VERM, tam: 44 });
    }

    // ------------------------------------------------ C. contexto (ARQUIVO, ficha datilografada)
    function contexto(lt) {
      L.fundo(ctx, BEGE);
      titulo('O QUE ELES QUEREM VOTAR', seg(lt, 0.1, 0.7));
      cred('fonte: Agência Câmara · CartaCapital · CNN Brasil', seg(lt, 0.3, 1.0));
      const sobe = ease.saida(seg(lt, 0, 0.5));
      ctx.save(); ctx.translate(0, (1 - sobe) * 500);
      ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(X0 + 14, 446, LARG, 560);
      ctx.fillStyle = COR.begeEscuro; ctx.fillRect(X0, 432, LARG, 560);
      ctx.fillStyle = VERM; ctx.fillRect(X0, 432, LARG, 16);
      L.texto(ctx, 'PEC · REFORMA ELEITORAL', X0 + 44, 520, { familia: FONTE.sub, peso: 600, tam: 44, cor: VERM, tracking: 3 });
      const LIN = [['VOTO DISTRITAL MISTO', T.c1], ['VOTAÇÃO: AINDA EM 2026', T.c2], ['ANTES DA POSSE DOS NOVOS', T.c3], ['DEPUTADOS (FEV/2027)', T.c3 + 0.5],
        ['TRANSIÇÃO EM 2030 · VALE EM 2034', T.c4]];
      LIN.forEach(([s, t0], i) => {
        const y = 610 + i * 78;
        if (i === 1 || i === 2) L.selecao(ctx, X0 + 40, y - 46, 640, 60, seg(t, t0 + 0.7, t0 + 1.1), i === 1 ? VERM : AZUL);
        L.texto(ctx, L.datilografar(s, seg(t, t0, t0 + 0.7)), X0 + 44, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(s, FONTE.maquina, 46, 400, 760), cor: TINTA });
      });
      ctx.restore();
      // barra: metade lista do partido | metade distrito
      if (t >= T.metade) {
        const p = ease.saida(seg(t, T.metade, T.metade + 0.6)), y = 1090, hB = 190;
        ctx.fillStyle = TINTA; ctx.fillRect(X0 + 10, y + 10, LARG, hB);
        ctx.fillStyle = AMA; ctx.fillRect(CX - (LARG / 2) * p, y, (LARG / 2) * p, hB);
        ctx.fillStyle = VERM; ctx.fillRect(CX, y, (LARG / 2) * p, hB);
        ctx.fillStyle = BEGE; ctx.fillRect(CX - 4, y - 20, 8, hB + 40);
        ctx.save(); ctx.globalAlpha = seg(t, T.metade + 0.4, T.metade + 0.8);
        L.texto(ctx, 'METADE', CX - LARG / 4, y + 74, { familia: FONTE.grotesca, peso: 700, tam: 40, cor: TINTA, alinhar: 'center' });
        L.texto(ctx, 'LISTA DO PARTIDO', CX - LARG / 4, y + 136, { familia: FONTE.bloco, peso: 400, tam: 40, cor: TINTA, alinhar: 'center' });
        L.texto(ctx, 'METADE', CX + LARG / 4, y + 74, { familia: FONTE.grotesca, peso: 700, tam: 40, cor: BEGE, alinhar: 'center' });
        L.texto(ctx, 'DISTRITO', CX + LARG / 4, y + 136, { familia: FONTE.bloco, peso: 400, tam: 48, cor: BEGE, alinhar: 'center' });
        ctx.restore();
        if (t >= T.metade + 1.0) L.etiqueta(ctx, '1 DISTRITO = 1 VAGA', CX + LARG / 4, 1360, seg(t, T.metade + 1.0, T.metade + 1.3), { cor: TINTA, tam: 38 });
      }
    }

    // ------------------------------------------------ D. "como isso funcionaria na prática?" (CARTAZ)
    function pratica(lt) {
      arquivo = false;
      L.fundo(ctx, VERM);
      L.raios(ctx, CX, 1560, 2600, 20, -0.3 + L.emDois(t) * 0.05, 'rgba(237,224,196,0.13)');
      ctx.fillStyle = COR.vermelhoEscuro; ctx.beginPath(); ctx.arc(CX, 1560, 330, Math.PI, 0); ctx.fill();
      carimbar('COMO ISSO', 640, T.pratica + 0.1, BEGE, 130, FONTE.bloco, 21);
      carimbar('FUNCIONARIA', 840, T.pratica + 0.35, AMA, 230, FONTE.manchete, 22, { erro: COR.vermelhoEscuro, desloc: 8 });
      carimbar('NA PRÁTICA?', 1040, T.pratica + 0.6, BEGE, 210, FONTE.manchete, 23, { erro: TINTA, desloc: 6 });
    }

    // ------------------------------------------------ E. a maquete 3D (Vila Exemplo)
    function maquete(lt) {
      arquivo = false;
      const M = montar(L), P = M.P;
      atualizar(M, t);
      P.desenhar(ctx);
      ctx.fillStyle = 'rgba(237,224,196,0.92)'; ctx.fillRect(0, 270, 1080, 140); ctx.fillStyle = TINTA; ctx.fillRect(X0, 408, LARG, 3);
      // rótulos 2D por cima do 3D
      const Pj = (o, dy) => P.projetar(o, dy);
      titulo(t < T.mapa ? 'VILA EXEMPLO · DISTRITO 1' : t < T.perde ? 'O MAPA' : 'QUEM FICA DE FORA', seg(lt, 0.2, 0.8));
      cred('exemplo ilustrativo · personagens fictícios', seg(lt, 0.4, 1.0));
      if (t < T.desce + 0.6) {
        M.distritos.forEach(([nome, x], i) => {
          const q = Pj([x, 0.3, 0]); L.etiqueta(ctx, nome, q.x, q.y, seg(t, T.cidade + 1.2 + i * 0.25, T.cidade + 1.5 + i * 0.25) * (1 - seg(t, T.desce, T.desce + 0.4)), { cor: i === 0 ? VERM : TINTA, tam: 34 });
        });
        if (t >= T.distrito) L.etiqueta(ctx, '1 DISTRITO = 1 VAGA', CX, 1330, seg(t, T.distrito, T.distrito + 0.3) * (1 - seg(t, T.desce, T.desce + 0.3)), { cor: VERM, tam: 46 });
      }
      if (t >= T.desce + 0.8 && t < T.mapa) {
        // nomes dos candidatos e percentuais
        M.cand.forEach((c, i) => {
          const q = Pj(c.pessoa, -0.35), pc = seg(t, T.desce + 0.8 + i * 0.25, T.desce + 1.1 + i * 0.25);
          L.etiqueta(ctx, c.nome, q.x, q.y, pc * (1 - seg(t, T.lixo + 1.4, T.lixo + 1.8) * (i < 2 ? 1 : 0)), { cor: c.corEtq, corTexto: c.corTexto, tam: 28 });
          const n = votosNum(i, t).n, pct = Math.round(n * 5);
          if (pct > 0 && t < T.lixo + 0.2) {
            const qb = P.projetar([c.x, 0.31 + n * 0.64 + 0.5, -3.2]);
            L.etiqueta(ctx, pct + '%', qb.x, Math.max(470, qb.y), 1, { cor: BEGE, corTexto: TINTA, tam: 40 });
          }
        });
        const qm = Pj(M.maria, 2.3), qj = Pj(M.joao, 2.3);
        L.etiqueta(ctx, 'DONA MARIA', qm.x, qm.y, seg(t, T.maria - 0.4, T.maria) * (1 - seg(t, T.chuva, T.chuva + 0.3)), { cor: AMA, corTexto: TINTA, tam: 30 });
        L.etiqueta(ctx, 'SEU JOÃO', qj.x, qj.y, seg(t, T.joao - 0.4, T.joao) * (1 - seg(t, T.chuva, T.chuva + 0.3)), { cor: VERM, tam: 30 });
        if (t >= T.vence) {
          const q0 = Pj(M.cand[2].pessoa, 2.7), q = { x: q0.x, y: Math.max(470, q0.y) };
          L.aplicarCarimbo(ctx, seg(t, T.vence, T.vence + 0.3), q.x, q.y, () => L.etiqueta(ctx, 'ELEITO', q.x, q.y, 1, { cor: AMA, corTexto: TINTA, tam: 44 }), 31);
        }
        if (t >= T.lixoTxt) {
          L.aplicarCarimbo(ctx, seg(t, T.lixoTxt, T.lixoTxt + 0.3), CX, 1330, () => {
            ctx.fillStyle = TINTA; ctx.fillRect(X0, 1262, LARG, 132);
            L.texto(ctx, '60% DOS VOTOS → LIXO', CX, 1352, { familia: FONTE.bloco, peso: 400, tam: tamMax('60% DOS VOTOS → LIXO', FONTE.bloco, 70, 400, 780), cor: BEGE, alinhar: 'center' });
          }, 33);
        }
      }
      if (t >= T.novo && t < T.perde) {
        L.aplicarCarimbo(ctx, seg(t, T.novo, T.novo + 0.3), CX, 1300, () => {
          ctx.fillStyle = TINTA; ctx.fillRect(X0, 1236, LARG, 128);
          L.texto(ctx, 'QUEM DESENHA O MAPA', CX, 1290, { familia: FONTE.grotesca, peso: 700, tam: 46, cor: BEGE, alinhar: 'center' });
          L.texto(ctx, 'ESCOLHE QUEM GANHA', CX, 1346, { familia: FONTE.grotesca, peso: 700, tam: 46, cor: AMA, alinhar: 'center' });
        }, 35);
        if (t < T.curral) L.etiqueta(ctx, 'EMPRESÁRIO: 40% → 55%', CX, 1150, seg(t, T.novo + 0.5, T.novo + 0.8), { cor: AZUL, tam: 40 });
      }
      if (t >= T.curral + 1.0 && t < T.perde) {
        const q = Pj([-8, 3.2, 0]);
        L.aplicarCarimbo(ctx, seg(t, T.curral + 1.0, T.curral + 1.3), q.x, q.y, () =>
          L.texto(ctx, 'CURRAL', q.x, q.y, { familia: FONTE.manchete, peso: 900, tam: 210, cor: VERM, alinhar: 'center', erro: TINTA, desloc: 7 }), 37);
      }
      if (t >= T.perde) {
        ['MULHERES', 'NEGROS', 'JUVENTUDE', 'MOVIMENTOS'].forEach((s, i) => {
          const q = Pj(M.fora[i], 2.6);
          L.etiqueta(ctx, s, q.x, q.y, seg(t, T.perde + 0.6 + i * 0.35, T.perde + 0.9 + i * 0.35), { cor: [VERM, TINTA, AMA, AZUL][i], corTexto: i === 2 ? TINTA : BEGE, tam: 30 });
        });
        L.aplicarCarimbo(ctx, seg(t, T.perde + 2.2, T.perde + 2.5), CX, 1330, () => {
          ctx.fillStyle = TINTA; ctx.fillRect(X0, 1266, LARG, 124);
          L.texto(ctx, 'SEM TERRITÓRIO, SEM VAGA', CX, 1350, { familia: FONTE.bloco, peso: 400, tam: tamMax('SEM TERRITÓRIO, SEM VAGA', FONTE.bloco, 60, 400, 780), cor: BEGE, alinhar: 'center' });
        }, 39);
      }
    }
    function votosVisiveis(i) {   // nº de cubos (cada um = 5%) já empilhados no candidato i
      const total = [6, 6, 8][i];
      let n = 0;
      if (i === 0 && t >= T.maria + 1.6) n = 1;
      if (i === 1 && t >= T.joao + 1.6) n = 1;
      const pc = seg(t, T.chuva, T.conta);
      n = Math.max(n, Math.floor(1e-6 + pc * total));
      return Math.min(total, n);
    }

    // ------------------------------------------------ F. distritão (ARQUIVO)
    function distritao(lt) {
      L.fundo(ctx, BEGE);
      titulo('E NA TRANSIÇÃO, EM 2030?', seg(lt, 0.1, 0.7));
      cred('fonte: Agência Câmara (19/09/2017 e 11/08/2021) · CartaCapital · CNN Brasil', seg(lt, 0.3, 1.0));
      const sobe = ease.saida(seg(lt, 0, 0.5));
      ctx.save(); ctx.translate(0, (1 - sobe) * 500);
      ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(X0 + 14, 450, LARG, 900);
      ctx.fillStyle = COR.begeEscuro; ctx.fillRect(X0, 436, LARG, 900);
      L.texto(ctx, 'NA MESA:', X0 + 44, 520, { familia: FONTE.sub, peso: 600, tam: 44, cor: VERM, tracking: 3 });
      L.texto(ctx, 'DISTRITÃO', CX, 690, { familia: FONTE.manchete, peso: 900, tam: tamMax('DISTRITÃO', FONTE.manchete, 220, 900, 760), cor: TINTA, alinhar: 'center' });
      const s1 = 'só os mais votados do estado', s2 = 'o voto no partido não conta';
      L.texto(ctx, L.datilografar(s1, seg(lt, 0.5, 1.1)), CX, 790, { familia: FONTE.maquina, peso: 400, tam: 40, cor: TINTA, alinhar: 'center' });
      L.texto(ctx, L.datilografar(s2, seg(lt, 0.9, 1.5)), CX, 846, { familia: FONTE.maquina, peso: 400, tam: 40, cor: TINTA, alinhar: 'center' });
      ctx.restore();
      [[T.rej1, 'REJEITADO · 2017', '238 × 205 (precisava de 308)', 1010, -0.08, 41], [T.rej2, 'REJEITADO · 2021', '423 × 35', 1210, 0.06, 43]].forEach(([t0, a, b, y, rot, seed]) =>
        L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), CX, y, () => {
          ctx.save(); ctx.translate(CX, y); ctx.rotate(rot);
          ctx.strokeStyle = VERM; ctx.lineWidth = 9; ctx.strokeRect(-330, -80, 660, 160); ctx.lineWidth = 3; ctx.strokeRect(-316, -66, 632, 132);
          L.texto(ctx, a, 0, -2, { familia: FONTE.bloco, peso: 400, tam: 62, cor: VERM, alinhar: 'center' });
          L.texto(ctx, b, 0, 48, { familia: FONTE.grotesca, peso: 700, tam: 32, cor: VERM, alinhar: 'center' });
          ctx.restore();
        }, seed));
    }

    // ------------------------------------------------ G. fecho (CARTAZ)
    function fecho(lt) {
      arquivo = false;
      L.fundo(ctx, VERM);
      L.raios(ctx, CX, 1560, 2600, 20, -0.3 + L.emDois(t) * 0.05, 'rgba(237,224,196,0.13)');
      ctx.fillStyle = COR.vermelhoEscuro; ctx.beginPath(); ctx.arc(CX, 1560, 330, Math.PI, 0); ctx.fill();
      carimbar('ISSO NÃO É', 560, T.reforma + 0.1, BEGE, 96, FONTE.bloco, 51);
      carimbar('REFORMA.', 760, T.reforma + 0.3, AMA, 240, FONTE.manchete, 52, { erro: COR.vermelhoEscuro, desloc: 8 });
      if (t >= T.jogada) {
        const pe = ease.saida(seg(t, T.jogada, T.jogada + 0.3));
        ctx.save(); ctx.translate(CX, 990); ctx.rotate(-7 * Math.PI / 180);
        ctx.fillStyle = COR.carvao; ctx.fillRect(-760 + (1 - pe) * -1500 + 10, -108, 1520, 230);
        ctx.fillStyle = TINTA; ctx.fillRect(-760 + (1 - pe) * -1500, -118, 1520, 230); ctx.restore();
        L.aplicarCarimbo(ctx, seg(t, T.jogada + 0.15, T.jogada + 0.45), CX, 990, () => {
          ctx.save(); ctx.translate(CX, 990); ctx.rotate(-7 * Math.PI / 180);
          L.texto(ctx, 'É JOGADA.', 0, 60, { familia: FONTE.manchete, peso: 900, tam: tamMax('É JOGADA.', FONTE.manchete, 190, 900, 800), cor: BEGE, alinhar: 'center', erro: VERM, desloc: 6 });
          ctx.restore();
        }, 53);
      }
      if (t >= T.nao) carimbar('NÃO AO VOTO DISTRITAL.', 1250, T.nao, BEGE, 70, FONTE.bloco, 55, { larg: 860 });
    }

    // ------------------------------------------------ H. logo e créditos
    function final(lt) {
      L.fundo(ctx, BEGE); arquivo = false;
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 780, () => L.imagem(ctx, L.img.logo, CX, 780, 780), 97);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.6, 1.2);
      [['Print: Agência Câmara de Notícias (28/10/2026)', 1110],
        ['Fontes: Agência Câmara · CartaCapital · CNN Brasil · Metrópoles', 1150],
        ['Alma Preta · Congresso em Foco · InfoMoney', 1190],
        ['Vila Exemplo: exemplo ilustrativo, personagens fictícios', 1240]].forEach(([s2, y]) =>
        L.texto(ctx, s2, CX, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(s2, FONTE.maquina, 24, 400), cor: TINTA, alinhar: 'center' }));
      ctx.restore();
    }
  },
};

// ======================================================================
// Maquete 3D: montada uma vez (por página) e posicionada a cada quadro só em função de t
// ======================================================================
let _M = null;
function montar(L) {
  if (_M) return _M;
  const P = L.palco3d('vila', 1080, 1920, { nevoa: [55, 120] }), { T3, cena, malha } = P, C = L.COR;
  const PELE = ['#C68E5E', '#8A5A3A', '#5E3B26', '#E0B48A'], MADEIRA = '#7A5230';
  const r = L.rng(42), M = { P };
  const B = (w, h, d) => new T3.BoxGeometry(w, h, d);
  const add = (o, x = 0, y = 0, z = 0, pai = cena) => { o.position.set(x, y, z); pai.add(o); return o; };

  // chão (papelão bege) e ruas (faixas begeEscuro)
  add(malha(B(46, 0.4, 34), C.bege, { aresta: false }), 0, -0.2, 0);
  for (const z of [-6, 6]) add(malha(B(46, 0.02, 1.4), C.begeEscuro, { aresta: false, sombra: false }), 0, 0.01, z);
  for (const x of [-12, 12]) add(malha(B(1.4, 0.02, 34), C.begeEscuro, { aresta: false, sombra: false }), x, 0.012, 0);

  // casas: caixa + telhado em pirâmide
  const telhado = new T3.ConeGeometry(1.25, 0.9, 4); telhado.rotateY(Math.PI / 4);
  M.casas = [];
  for (let x = -20; x <= 20; x += 3.3) for (let z = -14; z <= 14; z += 3.3) {
    if ((x > -15.5 && x < -4.5 && z > -5.5) || (z > 10 && x < 2)) continue;   // praça do distrito 1 e a frente da cerca
    if (Math.abs(z + 6) < 1.4 || Math.abs(z - 6) < 1.4 || Math.abs(Math.abs(x) - 12) < 1.4) continue;   // ruas
    if (r() < 0.18) continue;
    const g = new T3.Group(), h = 0.9 + r() * 1.1, parede = r() < 0.5 ? C.bege : C.begeEscuro;
    add(malha(B(1.6, h, 1.6), parede), 0, h / 2, 0, g);
    const cor = x > -4 && x < 0 ? C.vermelho : [C.vermelho, C.amarelo, C.tinta, C.vermelhoEscuro][Math.floor(r() * 4)];
    const tel = add(malha(telhado, cor), 0, h + 0.45, 0, g);
    g.rotation.y = (r() - 0.5) * 0.3; add(g, x + (r() - 0.5) * 0.6, 0, z + (r() - 0.5) * 0.6);
    M.casas.push({ g, x, z, tel, corOrig: cor });
  }

  // linhas vermelhas dos distritos (x = -4 e x = 4), desenhadas ao longo de z
  const linhaD = x => { const m = add(malha(B(0.35, 0.08, 34), C.vermelho, { aresta: false, sombra: false }), x, 0.06, 0); return m; };
  M.l1 = linhaD(-4); M.l2 = linhaD(4); M.l1novo = linhaD(1.4);
  M.distritos = [['DISTRITO 1', -10], ['DISTRITO 2', 0], ['DISTRITO 3', 10]];

  // pessoa estilizada: pernas, tronco, braços, cabeça e cabelo/acessório
  function pessoa({ roupa, pele, cabelo = C.tinta, tipo = 'curto', calca = C.tinta }) {
    const g = new T3.Group();
    for (const s of [-0.16, 0.16]) add(malha(new T3.CylinderGeometry(0.11, 0.11, 0.7, 8), calca), s, 0.35, 0, g);
    add(malha(new T3.CylinderGeometry(0.3, 0.42, 0.9, 10), roupa), 0, 1.15, 0, g);
    for (const s of [-1, 1]) { const b = add(malha(new T3.CylinderGeometry(0.08, 0.09, 0.75, 6), roupa), s * 0.44, 1.12, 0, g); b.rotation.z = s * 0.18; }
    add(malha(new T3.SphereGeometry(0.3, 14, 10), pele, { angulo: 80 }), 0, 1.9, 0, g);
    if (tipo === 'coque') {
      add(malha(new T3.SphereGeometry(0.31, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), cabelo, { angulo: 80 }), 0, 1.93, -0.02, g);
      add(malha(new T3.SphereGeometry(0.16, 10, 8), cabelo, { angulo: 80 }), 0, 2.1, -0.24, g);
    } else if (tipo === 'bone') {
      add(malha(new T3.CylinderGeometry(0.31, 0.31, 0.16, 14), cabelo), 0, 2.12, 0, g);
      add(malha(B(0.36, 0.04, 0.3), cabelo), 0, 2.06, 0.32, g);
      add(malha(B(0.26, 0.06, 0.05), C.tinta, { aresta: false }), 0, 1.8, 0.29, g);          // bigode
    } else if (tipo === 'longo') {
      add(malha(new T3.SphereGeometry(0.33, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), cabelo, { angulo: 80 }), 0, 1.92, -0.03, g);
      add(malha(B(0.6, 0.6, 0.18), cabelo), 0, 1.68, -0.2, g);
      for (const s of [-0.12, 0.12]) add(malha(new T3.TorusGeometry(0.08, 0.02, 6, 14), C.tinta, { aresta: false }), s, 1.92, 0.29, g);   // óculos
    } else if (tipo === 'terno') {
      add(malha(new T3.SphereGeometry(0.31, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2.4), cabelo, { angulo: 80 }), 0, 1.95, 0, g);
      add(malha(B(0.1, 0.55, 0.05), C.vermelho, { aresta: false }), 0, 1.25, 0.37, g);         // gravata
    } else {
      add(malha(new T3.SphereGeometry(0.31, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2.4), cabelo, { angulo: 80 }), 0, 1.95, 0, g);
    }
    cena.add(g); return g;
  }

  // praça do distrito 1: 3 pedestais com candidatos, a urna e a lixeira
  M.cand = [
    { nome: 'PROFESSORA', x: -12.1, cor: C.amarelo, corEtq: C.amarelo, corTexto: C.tinta, total: 6 },
    { nome: 'LÍDER COMUNITÁRIO', x: -10, cor: C.vermelho, corEtq: C.vermelho, corTexto: C.bege, total: 6 },
    { nome: 'EMPRESÁRIO', x: -7.9, cor: C.azul, corEtq: C.azul, corTexto: C.bege, total: 8 },
  ];
  const tipos = [{ roupa: C.amarelo, pele: PELE[1], cabelo: C.tinta, tipo: 'longo' }, { roupa: C.vermelho, pele: PELE[2], tipo: 'curto' },
    { roupa: C.azul, pele: PELE[3], cabelo: '#8C7A5E', tipo: 'terno', calca: C.azul }];
  M.cand.forEach((c, i) => {
    c.pedestal = add(malha(B(1.5, 1, 1.5), C.tinta), c.x, 0.5, -1.5);
    add(malha(B(1.2, 0.45, 0.05), c.cor, { aresta: false }), c.x, 0.55, -0.73);
    c.pessoa = pessoa(tipos[i]); c.pessoa.position.set(c.x, 1, -1.5);
    // pilha de votos: cubos de 5% atrás do candidato
    c.cubos = [];
    for (let k = 0; k < c.total; k++) {
      const cubo = malha(B(0.62, 0.62, 0.62), c.cor); cubo.visible = false; cena.add(cubo); c.cubos.push(cubo);
    }
  });
  M.urna = add(new T3.Group(), -10, 0, 3.6);
  add(malha(B(1.3, 1.1, 1.0), C.bege), 0, 0.55, 0, M.urna); add(malha(B(0.7, 0.04, 0.12), C.tinta, { aresta: false }), 0, 1.11, 0, M.urna);
  add(malha(B(1.0, 0.24, 0.02), C.tinta, { aresta: false }), 0, 0.75, 0.51, M.urna);
  M.lixeira = add(new T3.Group(), -7.5, 0, 2.7); M.lixeira.scale.setScalar(0.72);
  add(malha(new T3.CylinderGeometry(1.15, 0.95, 2.1, 18, 1, true), '#3A302A'), 0, 1.05, 0, M.lixeira);
  add(malha(new T3.CylinderGeometry(0.95, 0.95, 0.06, 18), C.tinta, { aresta: false }), 0, 0.03, 0, M.lixeira);
  M.tampa = add(new T3.Group(), -1.15, 2.1, 0, M.lixeira);
  add(malha(new T3.CylinderGeometry(1.2, 1.2, 0.14, 18), '#3A302A'), 1.15, 0.07, 0, M.tampa);
  // o "X" do lixo pintado na frente
  for (const s of [-1, 1]) { const x = add(malha(B(0.14, 1.0, 0.04), C.vermelho, { aresta: false }), 0, 1.1, 1.06, M.lixeira); x.rotation.z = s * 0.7; }

  // eleitores
  M.maria = pessoa({ roupa: C.vermelho, pele: PELE[0], cabelo: '#B9B2A4', tipo: 'coque', calca: C.vermelhoEscuro });
  M.joao = pessoa({ roupa: C.amarelo, pele: PELE[2], cabelo: C.azul, tipo: 'bone' });
  M.cedula = add(malha(B(0.42, 0.04, 0.3), C.bege), 0, -5, 0);
  // multidão do distrito (aparece na "chuva" de votos)
  M.povo = [];
  for (let k = 0; k < 14; k++) {
    const p = pessoa({ roupa: [C.vermelho, C.amarelo, C.azul, C.begeEscuro, C.tinta][k % 5], pele: PELE[k % 4], tipo: ['curto', 'coque', 'bone', 'longo'][k % 4], cabelo: k % 3 ? C.tinta : '#B9B2A4' });
    p.userData = { x: -15 + r() * 10, z: 6.4 + r() * 3.2 }; p.scale.setScalar(0.85); p.visible = false; M.povo.push(p);
  }
  // caneta gigante (redesenha a linha)
  M.caneta = new T3.Group();
  add(malha(new T3.CylinderGeometry(0.35, 0.35, 6, 6), C.amarelo), 0, 3.6, 0, M.caneta);
  add(malha(new T3.ConeGeometry(0.35, 0.9, 6), C.begeEscuro), 0, 0.45, 0, M.caneta).rotation.x = Math.PI;
  add(malha(new T3.CylinderGeometry(0.36, 0.36, 0.5, 6), C.vermelho), 0, 6.8, 0, M.caneta);
  M.caneta.rotation.z = -0.4; M.caneta.scale.setScalar(1.8); M.caneta.visible = false; cena.add(M.caneta);
  // cerca (curral): mourões e travessas em volta do novo distrito 1 (x -17..0, z -13..10)
  M.cerca = [];
  const ret = [[-17, -13], [1.4, -13], [1.4, 10.4], [-17, 10.4], [-17, -13]];
  for (let s = 0; s < 4; s++) {
    const [ax, az] = ret[s], [bx, bz] = ret[s + 1], len = Math.hypot(bx - ax, bz - az), n = Math.round(len / 1.4);
    for (let k = 0; k < n; k++) {
      const x = ax + (bx - ax) * k / n, z = az + (bz - az) * k / n;
      const g = new T3.Group(); add(malha(B(0.28, 1.8, 0.28), MADEIRA), 0, 0.9, 0, g);
      const dir = Math.atan2(bz - az, bx - ax), tl = len / n;
      for (const y of [0.6, 1.3]) { const tv = add(malha(B(tl, 0.16, 0.12), MADEIRA), Math.cos(dir) * tl / 2, y, Math.sin(dir) * tl / 2, g); tv.rotation.y = -dir; }
      g.position.set(x, -2.2, z); g.userData = { ordem: (s * 40 + k) }; cena.add(g); M.cerca.push(g);
    }
  }
  // quem fica de fora da cerca
  M.fora = [0, 1, 2, 3].map(i => {
    const p = pessoa([{ roupa: C.vermelho, pele: PELE[1], tipo: 'longo' }, { roupa: C.begeEscuro, pele: PELE[2], tipo: 'curto' },
      { roupa: C.amarelo, pele: PELE[0], tipo: 'bone', cabelo: C.vermelho }, { roupa: C.azul, pele: PELE[3], tipo: 'coque', cabelo: C.tinta }][i]);
    p.position.set(-10.5 + i * 1.35, 0, 12); p.visible = false; return p;
  });
  return (_M = M);
}

// posiciona tudo em função de t (sem estado entre quadros)
function atualizar(M, t) {
  const L = window.CT, { seg, lerp, ease, clamp } = L, P = M.P;
  const sm = p => p * p * (3 - 2 * p);
  // câmera: [tempo, posição, alvo]
  const K = [
    [T.cidade, [34, 46, 4], [0, 0, 0]], [T.desce - 0.3, [30, 41, 1], [-1, 0, 0]],
    [T.desce + 1.5, [-10, 10, 18], [-10, 1.7, -1]], [T.chuva, [-10, 10.4, 18.6], [-10, 1.7, -1]],
    [T.vence, [-9.8, 10.8, 19.2], [-9.8, 2.2, -1.2]], [T.lixo, [-9.2, 10.2, 19.4], [-9.2, 1.8, -0.4]],
    [T.mapa - 0.1, [-9.2, 10.4, 19.8], [-9.2, 1.8, -0.4]], [T.mapa + 1.0, [24, 36, 3], [-5, 0, 0]], [T.novo + 0.8, [22, 34, 2], [-5, 0, 0]],
    [T.curral + 0.9, [16, 30, 6], [-7, 0, -1]], [T.perde, [15, 29, 6], [-7, 0, -1]], [T.perde + 1.0, [-8.5, 8.4, 28.5], [-8.5, 1.4, 10]], [T.distritao, [-8.5, 8.2, 27.8], [-8.5, 1.4, 10]],
  ];
  let i = 0; while (i < K.length - 2 && t >= K[i + 1][0]) i++;
  const [ta, pa, aa] = K[i], [tb, pb, ab] = K[i + 1], k = sm(clamp((t - ta) / (tb - ta)));
  P.camera(pa.map((v, j) => lerp(v, pb[j], k)), aa.map((v, j) => lerp(v, ab[j], k)));

  // linhas dos distritos: crescem ao longo de z no começo; a do meio é riscada e redesenhada
  const pl = ease.saida(seg(t, T.cidade + 0.3, T.cidade + 1.4));
  M.l2.scale.z = Math.max(pl, 0.001);
  const risca = seg(t, T.risca, T.risca + 0.5), nova = seg(t, T.risca + 0.5, T.novo);
  M.l1.scale.z = Math.max(pl * (1 - risca), 0.001); M.l1.position.z = 17 * risca;
  M.l1novo.visible = nova > 0; M.l1novo.scale.z = Math.max(nova, 0.001); M.l1novo.position.z = -17 + 17 * nova;
  M.caneta.visible = t >= T.risca - 0.2 && t < T.novo + 0.6;
  if (M.caneta.visible) {
    const zc = t < T.risca + 0.5 ? lerp(-17, 17, risca) : lerp(-17, 17, nova), xc = t < T.risca + 0.5 ? -4 : 1.4;
    M.caneta.position.set(xc + 1.6, 0.3 + (t < T.risca ? 3 * (1 - seg(t, T.risca - 0.2, T.risca)) : 0), zc);
  }
  // o bairro que entra no distrito 1 pisca (telhado azul = eleitores do empresário)
  const entra = seg(t, T.novo - 0.4, T.novo);
  M.casas.forEach(c => { if (c.x > -4 && c.x < 0) c.tel.material = P.mat(entra > 0 && t < T.distritao ? (Math.floor((t - T.novo) * 6) % 2 && t < T.novo + 0.6 ? L.COR.amarelo : L.COR.azul) : c.corOrig); });

  // eleitores: Dona Maria e seu João andam até a urna, a cédula entra e vira um cubo que voa para a pilha
  const anda = (p, t0, x0, x1) => {
    const a = seg(t, t0 - 1.2, t0), v = seg(t, t0 + 0.6, t0 + 1.6);
    p.position.set(lerp(x0, x1, a), Math.abs(Math.sin(a * Math.PI * 4)) * 0.08 * (a < 1), lerp(8.5, 5.1, a) + v * 1.6);
    p.rotation.y = a < 1 ? Math.PI : (v > 0 ? 0 : Math.PI);
    p.visible = t < T.chuva + 0.6;
  };
  anda(M.maria, T.maria, -12, -10.4); anda(M.joao, T.joao, -8, -9.6);
  M.cedula.position.y = -5;
  for (const [p, t0] of [[M.maria, T.maria], [M.joao, T.joao]]) {
    const q = seg(t, t0, t0 + 0.4);
    if (q > 0 && q < 1) { M.cedula.position.set(lerp(p.position.x, -10, q), lerp(1.5, 1.2, q), lerp(p.position.z - 0.3, 3.6, q)); }
  }
  M.povo.forEach((p, k) => {
    const a = seg(t, T.chuva - 0.4 + k * 0.08, T.chuva + 0.4 + k * 0.08);
    p.visible = a > 0 && t < T.mapa; p.position.set(p.userData.x, -1.9 * (1 - ease.saida(a)), p.userData.z); p.rotation.y = Math.PI;
  });

  // pilhas de votos (cubos de 5%): crescem; na hora do lixo, os da professora e do líder voam para a lixeira
  const lix = M.lixeira.position;
  M.cand.forEach((c, i) => {
    const n = votosNum(i, t);
    c.cubos.forEach((cubo, kk) => {
      const yAlvo = 0.31 + kk * 0.64, xA = c.x, zA = -3.2;
      cubo.visible = kk < n.n;
      if (!cubo.visible) return;
      // entrada: o cubo novo cai do alto
      const tEnt = n.tEnt(kk), qe = ease.saida(seg(t, tEnt, tEnt + 0.35));
      let x = xA, y = lerp(yAlvo + 6, yAlvo, qe), z = zA, s = 1;
      if (i < 2 && t >= T.lixo) {
        const t0 = T.lixo + (kk + i * 6) * 0.08, q = seg(t, t0, t0 + 0.7);
        x = lerp(xA, lix.x, q); z = lerp(zA, lix.z, q); y = lerp(yAlvo, 0.8, q) + Math.sin(q * Math.PI) * 4.5;
        s = q > 0.85 ? lerp(1, 0.2, seg(q, 0.85, 1)) : 1; cubo.visible = q < 1;
        cubo.rotation.set(q * 5, q * 3, 0);
      } else cubo.rotation.set(0, 0, 0);
      cubo.position.set(x, y, z); cubo.scale.setScalar(s);
    });
    // o eleito sobe no pedestal
    const sobe = i === 2 ? ease.carimbo(seg(t, T.vence, T.vence + 0.4)) : 0;
    c.pedestal.scale.y = 1 + sobe * 0.8; c.pedestal.position.y = 0.5 * (1 + sobe * 0.8);
    c.pessoa.position.y = 1 + sobe * 0.8; c.pessoa.rotation.y = 0;
    // os perdedores abaixam a cabeça (inclinam) depois do lixo
    c.pessoa.rotation.x = i < 2 ? 0.25 * seg(t, T.lixo + 0.8, T.lixo + 1.4) : 0;
  });
  // tampa da lixeira abre durante o lixo
  M.tampa.rotation.z = 1.4 * clamp(Math.sin(Math.PI * seg(t, T.lixo - 0.3, T.lixo + 1.9)) * 1.4);

  // curral: os mourões sobem em onda
  M.cerca.forEach(g => {
    const t0 = T.curral + g.userData.ordem * 0.006, q = ease.carimbo(seg(t, t0, t0 + 0.35));
    g.position.y = lerp(-2.2, 0, q); g.visible = q > 0;
  });
  // quem fica de fora
  M.fora.forEach((p, i) => {
    const q = ease.saida(seg(t, T.perde + 0.3 + i * 0.35, T.perde + 0.8 + i * 0.35));
    p.visible = q > 0; p.position.z = lerp(17, 12, q);
    p.position.y = Math.abs(Math.sin(q * Math.PI * 3)) * 0.1 * (q < 1);
  });
}
function votosNum(i, t) {
  const total = [6, 6, 8][i], primeiro = [T.maria + 1.6, T.joao + 1.6, null][i];
  const pc = window.CT.seg(t, T.chuva, T.conta);
  const nChuva = Math.floor(1e-6 + pc * total);
  const n = Math.min(total, Math.max(primeiro !== null && t >= primeiro ? 1 : 0, nChuva));
  const tEnt = kk => (kk === 0 && primeiro !== null) ? primeiro : T.chuva + (kk + 1) / total * (T.conta - T.chuva) - 0.02;
  return { n, tEnt };
}
