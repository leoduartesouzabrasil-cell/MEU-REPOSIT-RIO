// "Não foi golpe. Foi o povo." — a virada de Lula no 2º turno de 2026. PRÉVIA sem narração (tempos estimados).
// Quando a narração chegar, os tempos de T passam a vir de eleicoes-2026.tempos.js (mesmos nomes).
// Render: node motor/render.js eleicoes-2026 saida/eleicoes-2026.mp4 --audio audio/eleicoes-2026/previa.wav
// Margem segura: conteúdo em x 90–930 e y 250–1500.
const T = Object.assign({
  inicio: 0, turno1: 2.5, dias21: 7.0, turno2: 8.5, golpe: 13.0, contas: 15.0,
  outros: 16.5, voltaram: 20.5, brancos: 24.5, total: 28.0, divide: 30.0,
  checklist: 33.0, ck1: 34.0, ck2: 36.8, ck3: 39.6, ck4: 42.2, naoGolpe: 44.0,
  povo: 46.0, abst: 46.8, desde2006: 48.6, nordeste: 50.0, rua: 51.6,
  mundo: 54.5, franca: 55.0, espanha: 56.6, historia: 58.2, cuba: 58.8, china: 59.6,
  acabou: 61.2, mobilizacao: 62.6, logo: 64.2, dur: 67.5,
}, (window.TEMPOS || {}).marcas || {});

// ponto do rosto em cada foto (fração da largura/altura) e zoom, para enquadrar os retratos
const ROSTO = { flavio: [0.54, 0.42, 2.1], lula: [0.64, 0.47, 2.6] };

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: T.dur,
  imagens: {
    flavio: '../midia/eleicoes-2026/flavio-1turno.jpg',
    lula: '../midia/eleicoes-2026/lula-paulista.jpg',
    lulaPalco: '../midia/eleicoes-2026/lula-vitoria.jpg',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease } = L;
    const CX = 510, LARG = 820, AZUL = COR.azul, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta;
    let arquivo = true;

    const ordem = [[0, abertura], [T.turno1, primeiroTurno], [T.dias21, dias21], [T.turno2, segundoTurno], [T.golpe, golpe],
      [T.contas, contas], [T.checklist, checklist], [T.povo, povo], [T.mundo, mundo], [T.acabou, acabou], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [T.turno2 + 2.6, T.golpe, T.naoGolpe, T.acabou, T.mobilizacao, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 16);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();

    [[T.turno1, AMA, -24], [T.golpe, VERM, 24], [T.contas, BEGE, -24], [T.checklist, BEGE, 24], [T.povo, VERM, -24],
      [T.mundo, AMA, 24], [T.acabou, VERM, -24], [T.logo, BEGE, 24]]
      .forEach(([X, cor, ang]) => L.corteDiagonal(ctx, seg(t, X - 0.4, X), cor, ang));
    if (arquivo) L.varredura(ctx, t, 0.08);
    IMP.forEach(X => L.flash(ctx, t, X, AMA, 0.25, 0.35));
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);

    // ------------------------------------------------ helpers
    function rotulo(txt, y, p, cor = TINTA, tam = 46, familia = FONTE.grotesca) {
      L.texto(ctx, L.datilografar(txt, p), CX, y, { familia, peso: 700, tam, cor, alinhar: 'center', rgb: 1.5 });
    }
    function retrato(img, cx, cy, r, cor) {                           // foto redonda com anel na cor do candidato
      const [fx, fy, zoom] = img === L.img.flavio ? ROSTO.flavio : ROSTO.lula;
      const s0 = Math.max(2 * r / img.width, 2 * r / img.height) * zoom, iw = img.width * s0, ih = img.height * s0;
      ctx.save(); ctx.fillStyle = cor; ctx.beginPath(); ctx.arc(cx, cy, r + 12, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();
      L.foto(ctx, img, cx - r, cy - r, 2 * r, 2 * r, { pb: true, zoom, dx: (0.5 - fx) * iw, dy: (0.5 - fy) * ih, retic: false });
      ctx.restore();
    }
    // barra de candidato: foto + número da urna + nome + barra animada + percentual
    function barra(y, img, num, nome, cor, pct, p, zoom, dxImg) {
      retrato(img, 170, y, 78, cor, zoom, dxImg);
      ctx.fillStyle = cor; ctx.fillRect(280, y - 70, 120, 70);
      L.texto(ctx, num, 340, y - 14, { tam: 64, cor: BEGE, alinhar: 'center' });
      L.texto(ctx, nome, 420, y - 22, { familia: FONTE.grotesca, peso: 700, tam: 40, cor: TINTA });
      const w = 640 * (pct / 52) * ease.saida(p);
      ctx.fillStyle = 'rgba(28,23,20,0.12)'; ctx.fillRect(280, y + 10, 640, 64);
      ctx.fillStyle = cor; ctx.fillRect(280, y + 10, w, 64);
      L.texto(ctx, (pct * ease.saida(p)).toFixed(2).replace('.', ',') + '%', 300 + Math.max(w, 160) - 20, y + 62,
        { tam: 56, cor: w > 180 ? BEGE : TINTA, alinhar: 'right' });
    }
    function bloco(y, valor, txt, p, cor) {                             // bloco de soma (milhões de votos)
      if (p <= 0) return;
      const e = ease.saida(p);
      ctx.save(); ctx.globalAlpha = Math.min(1, p * 3);
      ctx.fillStyle = cor; ctx.fillRect(lerp(-800, 90, e), y, 820, 130);
      L.texto(ctx, valor, lerp(-800, 90, e) + 30, y + 100, { tam: 100, cor: BEGE });
      L.texto(ctx, txt, lerp(-800, 90, e) + 330, y + 78, { familia: FONTE.grotesca, peso: 700, tam: 34, cor: BEGE });
      ctx.restore();
    }

    // ------------------------------------------------ A. abertura
    function abertura(lt) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.02 }, () => L.planta(ctx, 21, TINTA, 0.1));
      L.urna(ctx, CX, 950, 1.2);
      rotulo('4 DE OUTUBRO', 560, seg(lt, 0.1, 0.8), VERM, 70);
      rotulo('1º TURNO', 650, seg(lt, 0.8, 1.4), TINTA, 56);
    }

    // ------------------------------------------------ B. primeiro turno
    function primeiroTurno(lt) {
      L.fundo(ctx, BEGE);
      rotulo('1º TURNO · 4 OUT', 330, seg(lt, 0, 0.5), TINTA, 48);
      barra(620, L.img.flavio, '22', 'FLÁVIO BOLSONARO · PL', AZUL, 47.03, seg(lt, 0.3, 1.8), 2.0, 60);
      barra(960, L.img.lula, '13', 'LULA · PT', VERM, 45.16, seg(lt, 0.9, 2.4), 2.6, 40);
      L.etiqueta(ctx, 'FLÁVIO NA FRENTE', CX, 1250, seg(lt, 2.6, 2.9), { cor: AZUL, corTexto: BEGE, tam: 44 });
      L.credito(ctx, 'votos válidos · fonte: TSE', seg(lt, 1, 2), 360, 1330);
    }

    function dias21(lt) {
      L.fundo(ctx, TINTA); arquivo = false;
      const dia = Math.min(25, 4 + Math.floor(ease.saida(seg(lt, 0, 1.2)) * 21));
      L.texto(ctx, String(dia).padStart(2, '0'), CX, 1000, { tam: 420, cor: AMA, alinhar: 'center', erro: VERM, desloc: 10 });
      L.texto(ctx, 'DE OUTUBRO', CX, 1120, { familia: FONTE.grotesca, peso: 700, tam: 56, cor: BEGE, alinhar: 'center' });
      rotulo('21 DIAS DEPOIS', 560, seg(lt, 0, 0.5), BEGE, 56);
    }

    // ------------------------------------------------ C. segundo turno (a virada)
    function segundoTurno(lt) {
      L.fundo(ctx, BEGE);
      rotulo('2º TURNO · 25 OUT', 330, seg(lt, 0, 0.5), TINTA, 48);
      // as barras trocam de lugar: Lula sobe para o topo
      const troca = ease.saida(seg(lt, 1.6, 2.4));
      barra(lerp(960, 620, troca), L.img.lula, '13', 'LULA · PT', VERM, 51.79, seg(lt, 0.2, 2.0), 2.6, 40);
      barra(lerp(620, 960, troca), L.img.flavio, '22', 'FLÁVIO BOLSONARO · PL', AZUL, 48.21, seg(lt, 0.4, 2.0), 2.0, 60);
      L.aplicarCarimbo(ctx, seg(lt, 2.6, 2.9), CX, 1260, () => {
        ctx.save(); ctx.translate(CX, 1260); ctx.rotate(-0.08); ctx.strokeStyle = VERM; ctx.lineWidth = 12;
        ctx.strokeRect(-260, -90, 520, 160);
        L.texto(ctx, 'VIRADA', 0, 40, { familia: FONTE.bloco, peso: 400, tam: 120, cor: VERM, alinhar: 'center' }); ctx.restore();
      }, 7);
      L.credito(ctx, 'primeira virada no 2º turno desde a redemocratização', seg(lt, 3.2, 4.4), 175, 1400);
    }

    // ------------------------------------------------ D. golpe?
    function golpe(lt) {
      L.fundo(ctx, VERM); arquivo = false;
      L.raios(ctx, CX, 960, 1800, 22, L.emDois(t) * 0.06, 'rgba(28,23,20,0.18)');
      const glitch = lt < 0.5 && Math.floor(lt * 30) % 3 === 0 ? 14 : 0;
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 900, () =>
        L.texto(ctx, 'GOLPE?', CX + glitch, 980, { familia: FONTE.bloco, peso: 400, tam: L.ajustar(ctx, 'GOLPE?', FONTE.bloco, LARG, 400),
          cor: BEGE, alinhar: 'center', erro: TINTA, desloc: 10 }), 9);
      rotulo('VAMOS ÀS CONTAS.', 1200, seg(lt, 0.9, 1.6), AMA, 64);
    }

    // ------------------------------------------------ E. as contas
    function contas(lt, t) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.004 }, () => L.planta(ctx, 33, TINTA, 0.08));
      rotulo('DE ONDE VIERAM OS VOTOS?', 320, seg(lt, 0, 0.8), TINTA, 50);
      if (t < T.divide) {
        bloco(420, '9,3 MI', 'VOTARAM EM OUTROS\nCANDIDATOS NO 1º TURNO'.split('\n')[0], seg(t, T.outros, T.outros + 0.5), COR.vermelhoEscuro);
        L.texto(ctx, t > T.outros + 0.3 ? 'CANDIDATOS NO 1º TURNO' : '', 420, 540, { familia: FONTE.grotesca, peso: 700, tam: 34, cor: BEGE });
        bloco(580, '+2,9 MI', 'VOLTARAM ÀS URNAS', seg(t, T.voltaram, T.voltaram + 0.5), TINTA);
        bloco(740, '+1,9 MI', 'DEIXARAM BRANCO/NULO', seg(t, T.brancos, T.brancos + 0.5), COR.sangue);
        if (t > T.total) {
          ctx.fillStyle = TINTA; ctx.fillRect(90, 905, 840, 6);
          L.aplicarCarimbo(ctx, seg(t, T.total, T.total + 0.3), CX, 1040, () => {
            L.texto(ctx, '= 14,1 MI', CX, 1080, { tam: 170, cor: VERM, alinhar: 'center', erro: TINTA, desloc: 6 });
            L.texto(ctx, 'DE VOTOS EM JOGO', CX, 1160, { familia: FONTE.grotesca, peso: 700, tam: 46, cor: TINTA, alinhar: 'center' });
          }, 15);
        }
      } else {
        const p = ease.saida(seg(t, T.divide, T.divide + 1.2));
        L.texto(ctx, '14,1 MI DE VOTOS EM JOGO', CX, 520, { familia: FONTE.grotesca, peso: 700, tam: 48, cor: TINTA, alinhar: 'center' });
        const wL = 840 * 0.738 * p, wF = 840 * 0.262 * p;
        ctx.fillStyle = VERM; ctx.fillRect(90, 600, wL, 220);
        ctx.fillStyle = AZUL; ctx.fillRect(930 - wF, 600, wF, 220);
        if (p > 0.6) {
          L.texto(ctx, '+10,4 MI', 120, 760, { tam: 120, cor: BEGE });
          L.texto(ctx, '+3,7', 915, 740, { tam: 70, cor: BEGE, alinhar: 'right' });
        }
        retrato(L.img.lula, 250, 1000, 95, VERM, 2.6, 40);
        retrato(L.img.flavio, 790, 1000, 95, AZUL, 2.0, 60);
        L.texto(ctx, 'LULA', 250, 1160, { familia: FONTE.grotesca, peso: 700, tam: 46, cor: VERM, alinhar: 'center' });
        L.texto(ctx, 'FLÁVIO', 790, 1160, { familia: FONTE.grotesca, peso: 700, tam: 46, cor: AZUL, alinhar: 'center' });
        L.aplicarCarimbo(ctx, seg(t, T.divide + 1.5, T.divide + 1.8), CX, 1300, () =>
          L.texto(ctx, '3 DE CADA 4 VOTOS NOVOS FORAM PARA LULA', CX, 1300, { familia: FONTE.grotesca, peso: 700, tam: 38, cor: VERM, alinhar: 'center' }), 17);
      }
      L.credito(ctx, 'cálculo sobre dados do TSE (via Exame)', seg(lt, 2, 3), 280, 1420);
    }

    // ------------------------------------------------ F. não foi golpe
    function checklist(lt, t) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.004 }, () => L.planta(ctx, 41, TINTA, 0.08));
      rotulo('O QUE GARANTE O RESULTADO', 330, seg(lt, 0, 0.8), TINTA, 48);
      [[T.ck1, 'TESTE DE INTEGRIDADE', 'urnas conferidas com cédulas de papel'],
        [T.ck2, 'OBSERVADORES DE 46 PAÍSES', 'acompanharam votação e apuração'],
        [T.ck3, 'MISSÕES INTERNACIONAIS', 'atestaram o resultado'],
        [T.ck4, 'NENHUMA PROVA DE FRAUDE', 'acusações sem provas']].forEach(([X, tit, sub], i) => {
        if (t < X) return;
        const y = 470 + i * 190, p = seg(t, X, X + 0.3);
        L.aplicarCarimbo(ctx, p, 150, y, () => {
          ctx.fillStyle = COR.verde || '#2E6B3A'; ctx.fillStyle = TINTA; ctx.fillRect(105, y - 45, 90, 90);
          ctx.strokeStyle = AMA; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(125, y); ctx.lineTo(145, y + 22); ctx.lineTo(178, y - 25); ctx.stroke();
        }, 20 + i);
        L.texto(ctx, L.datilografar(tit, seg(t, X + 0.1, X + 0.7)), 230, y - 2, { familia: FONTE.grotesca, peso: 700, tam: 42, cor: TINTA });
        L.texto(ctx, L.datilografar(sub, seg(t, X + 0.6, X + 1.4)), 230, y + 46, { familia: FONTE.maquina, peso: 400, tam: 32, cor: TINTA });
      });
      L.aplicarCarimbo(ctx, seg(t, T.naoGolpe, T.naoGolpe + 0.3), CX, 1300, () => {
        ctx.fillStyle = VERM; ctx.fillRect(90, 1220, 840, 170);
        L.texto(ctx, 'NÃO FOI GOLPE.', CX, 1340, { familia: FONTE.bloco, peso: 400, tam: L.ajustar(ctx, 'NÃO FOI GOLPE.', FONTE.bloco, 780, 400), cor: BEGE, alinhar: 'center' });
      }, 29);
    }

    // ------------------------------------------------ G. foi o povo
    function povo(lt, t) {
      L.fundo(ctx, BEGE);
      if (t < T.rua) {
        rotulo('ABSTENÇÃO', 360, seg(lt, 0, 0.5), TINTA, 50);
        const v = lerp(21.08, 19.22, ease.saida(seg(t, T.abst, T.abst + 1.4)));
        L.texto(ctx, v.toFixed(2).replace('.', ',') + '%', CX, 620, { tam: 260, cor: VERM, alinhar: 'center', erro: TINTA, desloc: 8 });
        L.texto(ctx, '1º TURNO 21,08% → 2º TURNO 19,22%', CX, 700, { familia: FONTE.maquina, peso: 400, tam: 34, cor: TINTA, alinhar: 'center' });
        L.etiqueta(ctx, 'MENOR NUM 2º TURNO DESDE 2006', CX, 820, seg(t, T.desde2006, T.desde2006 + 0.3), { cor: TINTA, corTexto: AMA, tam: 40 });
        [['CEARÁ 13,9%', 320, 980], ['PERNAMBUCO 15,2%', 640, 1080], ['PARAÍBA 15,5%', 360, 1180]].forEach(([s, x, y], i) =>
          L.etiqueta(ctx, s, x, y, seg(t, T.nordeste + i * 0.3, T.nordeste + i * 0.3 + 0.3), { cor: VERM, corTexto: BEGE, tam: 40 }));
        if (t > T.nordeste) rotulo('NORDESTE: AS MENORES ABSTENÇÕES', 1300, seg(t, T.nordeste, T.nordeste + 0.8), VERM, 38);
      } else {
        const lt2 = t - T.rua;
        L.camera(ctx, { zoom: 1.05 + lt2 * 0.02 }, () => {
          ctx.fillStyle = VERM; ctx.fillRect(82, 292, 856, 716);
          L.foto(ctx, L.img.lulaPalco, 90, 300, 840, 700, { seletiva: 'quente', zoom: 1.2 });
        });
        ['TRANSPORTE GRATUITO', 'GENTE NA RUA', 'GENTE CONVENCENDO GENTE'].forEach((s, i) =>
          L.etiqueta(ctx, s, CX, 1100 + i * 100, seg(lt2, i * 0.5, i * 0.5 + 0.3), { cor: i === 2 ? VERM : TINTA, corTexto: i === 2 ? BEGE : AMA, tam: 42 }));
        L.credito(ctx, 'Foto: Paulo Pinto/Agência Brasil', seg(lt2, 0.3, 1), 330, 1040);
      }
    }

    // ------------------------------------------------ H. o mundo e a história
    function mundo(lt, t) {
      L.fundo(ctx, TINTA); arquivo = false;
      L.raios(ctx, CX, 1700, 2300, 24, L.emDois(t) * 0.05, 'rgba(200,32,30,0.25)');
      rotulo('E NÃO É SÓ AQUI', 330, seg(lt, 0, 0.6), AMA, 52);
      L.etiqueta(ctx, 'FRANÇA · 400 MIL NAS RUAS', CX, 470, seg(t, T.franca, T.franca + 0.3), { cor: VERM, corTexto: BEGE, tam: 44 });
      L.etiqueta(ctx, 'ESPANHA · LUTA POR MORADIA', CX, 580, seg(t, T.espanha, T.espanha + 0.3), { cor: VERM, corTexto: BEGE, tam: 44 });
      if (t > T.historia) rotulo('A HISTÓRIA ENSINA', 760, seg(t, T.historia, T.historia + 0.5), BEGE, 46);
      L.aplicarCarimbo(ctx, seg(t, T.cuba, T.cuba + 0.3), 330, 920, () => {
        L.texto(ctx, 'CUBA', 330, 920, { tam: 120, cor: AMA, alinhar: 'center' });
        L.texto(ctx, '1959', 330, 1010, { familia: FONTE.maquina, peso: 400, tam: 56, cor: BEGE, alinhar: 'center' });
      }, 31);
      L.aplicarCarimbo(ctx, seg(t, T.china, T.china + 0.3), 700, 920, () => {
        L.texto(ctx, 'CHINA', 700, 920, { tam: 120, cor: AMA, alinhar: 'center' });
        L.texto(ctx, '1949', 700, 1010, { familia: FONTE.maquina, peso: 400, tam: 56, cor: BEGE, alinhar: 'center' });
      }, 33);
      if (t > T.china + 0.5) {
        L.estrela(ctx, CX, 1180, 70, 0, VERM);
        rotulo('NADA VEIO DE CIMA.', 1320, seg(t, T.china + 0.5, T.china + 1.0), BEGE, 50);
        rotulo('VEIO DO POVO ORGANIZADO.', 1400, seg(t, T.china + 0.9, T.china + 1.5), AMA, 50);
      }
    }

    function acabou(lt, t) {
      L.fundo(ctx, VERM); arquivo = false;
      L.raios(ctx, CX, 1900, 2300, 24, -0.4 + L.emDois(t) * 0.06, 'rgba(235,181,42,0.25)');
      L.bandeira(ctx, 150, 1120, 760, 300, t, COR.vermelhoEscuro, TINTA);
      L.mastro(ctx, 150, 1110, 1700, TINTA);
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 520, () =>
        L.texto(ctx, 'A ELEIÇÃO ACABOU.', CX, 560, { tam: L.ajustar(ctx, 'A ELEIÇÃO ACABOU.', FONTE.manchete, LARG), cor: BEGE, alinhar: 'center', erro: TINTA, desloc: 6 }), 41);
      L.aplicarCarimbo(ctx, seg(t, T.mobilizacao, T.mobilizacao + 0.3), CX, 800, () => {
        ctx.fillStyle = AMA; ctx.fillRect(0, 690, 1080, 230);
        L.texto(ctx, 'A MOBILIZAÇÃO, NÃO.', CX, 850, { familia: FONTE.bloco, peso: 400, tam: L.ajustar(ctx, 'A MOBILIZAÇÃO, NÃO.', FONTE.bloco, LARG, 400), cor: VERM, alinhar: 'center' });
      }, 43);
    }

    function final(lt) {
      L.fundo(ctx, BEGE); arquivo = false;
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 820, () => L.imagem(ctx, L.img.logo, CX, 820, 800), 97);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.6, 1.2);
      L.texto(ctx, 'Fontes: TSE · Exame · CNN · NPR', CX, 1160, { familia: FONTE.maquina, peso: 400, tam: 26, cor: TINTA, alinhar: 'center' });
      L.texto(ctx, 'Fotos: Joédson Alves, Paulo Pinto / Agência Brasil (CC BY 3.0 BR)', CX, 1205, { familia: FONTE.maquina, peso: 400, tam: 22, cor: TINTA, alinhar: 'center' });
      ctx.restore();
    }
  },
};
