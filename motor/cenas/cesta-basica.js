// "A sua compra no mercado vai ficar mais cara com o Lula. Será mesmo?" — a votação da cesta básica com imposto zero.
// PRÉVIA sem narração (tempos estimados). Com a narração, os tempos de T vêm de cesta-basica.tempos.js, com as legendas.
// Render: node motor/render.js cesta-basica saida/cesta.mp4 --audio audio/cesta-basica/previa.wav
//
// DIAGRAMAÇÃO PADRÃO: título y 330 · fonte dos dados y 384 · conteúdo x 120–960, y 420–1420 · legenda (tarja) y 1466–1542
const T = Object.assign({
  titulo: 0.3, sera: 2.6,
  votacao: 5.0, placar: 8.0, sim: 8.6, nao: 10.4, contra: 12.4, esquerda: 19.0,
  aprovado: 23.0, itens: 24.4, taxa: 28.6,
  maioria: 32.6, m2027: 33.6, precisa: 37.0, olho: 40.4, lembre: 43.0, lembre2: 45.4, logo: 49.0, dur: 52.4,
}, (window.TEMPOS || {}).marcas || {});

// votação final do PLP 68/2024 (17/12/2024, dados abertos da Câmara): 324 SIM · 123 NÃO · 3 abstenções · 63 ausentes
const VOTO = { sim: 324, nao: 123, abst: 3, total: 513 };
// Câmara em 2027 (eleição de 04/10/2026): esquerda (PT-PCdoB-PV, PSOL-Rede, PSB, PDT) · centro · direita (PL, Novo, Missão)
const C2027 = { esquerda: 124, centro: 257, direita: 132 };
// quem votou NÃO (lista nominal oficial) — foto e enquadramento manual [centro x, centro y, lado da janela em fração da altura]
const CONTRA = [
  ['NIKOLAS FERREIRA', 'PL-MG', 'nikolas', [0.5,  0.3,  0.42]],
  ['BIA KICIS', 'PL-DF', 'kicis', [0.52,  0.36,  0.5]],
  ['CARLA ZAMBELLI', 'PL-SP', 'zambelli', [0.5,  0.4,  0.62]],
  ['GUSTAVO GAYER', 'PL-GO', 'gayer', [0.52,  0.36,  0.6]],
  ['MARCEL VAN HATTEM', 'NOVO-RS', 'hattem', [0.5,  0.4,  0.64]],
  ['RICARDO SALLES', 'NOVO-SP', 'salles', [0.52,  0.45,  0.6]],
  ['KIM KATAGUIRI', 'UNIÃO-SP', 'kim', [0.55,  0.45,  0.52]],
  ['CARLOS JORDY', 'PL-RJ', 'jordy', [0.5,  0.44,  0.72]],
  ['GENERAL PAZUELLO', 'PL-RJ', 'pazuello', [0.5,  0.45,  0.65]],
  ['MARIO FRIAS', 'PL-SP', 'frias', [0.48,  0.28,  0.33]],
];
// esquerda na votação final: todos SIM (exceto 1 NÃO no PT e 2 abstenções no PSOL)
const ESQ = [['PT', 64], ['PDT', 17], ['PSB', 14], ['PSOL', 8], ['PCdoB', 7], ['PV', 5], ['REDE', 1]];
const ITENS = ['ARROZ', 'FEIJÃO', 'LEITE', 'CARNES', 'CAFÉ', 'FARINHA', 'AÇÚCAR', 'PÃO'];
const M = '../midia/cesta-basica/';

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: T.dur,
  imagens: {
    nikolas: M + 'nikolas.jpg', kicis: M + 'kicis.jpg', zambelli: M + 'zambelli.jpg', gayer: M + 'gayer.jpg', hattem: M + 'hattem.jpg',
    salles: M + 'salles.jpg', kim: M + 'kim.jpg', jordy: M + 'jordy.jpg', pazuello: M + 'pazuello.jpg', frias: M + 'frias.jpg',
    logo: '../identidade/marca/o-camarada-vermelho.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease } = L;
    const CX = 540, LARG = 840, X0 = 120, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta, AZUL = COR.azul;
    let arquivo = true;

    const ordem = [[0, gancho], [T.votacao, votacao], [T.aprovado, aprovado], [T.maioria, maioria], [T.lembre, lembre], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [T.sera, T.placar + 1.6, T.aprovado, T.taxa, T.precisa, T.lembre2, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 12);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();

    [[T.votacao, BEGE, -24], [T.aprovado, VERM, 24], [T.maioria, BEGE, -24], [T.lembre, AZUL, 24], [T.logo, BEGE, -24]]
      .forEach(([X, cor, ang]) => L.corteDiagonal(ctx, seg(t, X - 0.4, X), cor, ang));
    if (arquivo) L.varredura(ctx, t, 0.08);
    IMP.forEach(X => L.flash(ctx, t, X, AMA, 0.25, 0.3));
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
    function retrato(i, cx, cy, r, anel = 7) {                          // enquadramento manual de cada foto
      const [, , chave, [fx, fy, lado]] = CONTRA[i], img = L.img[chave];
      const base = Math.max(2 * r / img.width, 2 * r / img.height), s0 = 2 * r / (lado * img.height);
      ctx.save(); ctx.fillStyle = AZUL; ctx.beginPath(); ctx.arc(cx, cy, r + anel, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();
      L.foto(ctx, img, cx - r, cy - r, 2 * r, 2 * r, { pb: true, zoom: s0 / base, dx: (0.5 - fx) * img.width * s0, dy: (0.5 - fy) * img.height * s0, retic: false });
      ctx.restore();
    }
    // maquete do plenário: 513 cadeiras em semicírculo (fileiras concêntricas), ordenadas da esquerda para a direita
    function cadeiras() { return window._cadeiras || (window._cadeiras = (() => {
      const fileiras = 11, r0 = 170, dr = 31, lugares = [];
      const pesos = Array.from({ length: fileiras }, (_, k) => r0 + k * dr), soma = pesos.reduce((a, b) => a + b, 0);
      let resto = 513;
      pesos.forEach((r, k) => {
        const n = k === fileiras - 1 ? resto : Math.round(513 * r / soma); resto -= n;
        for (let j = 0; j < n; j++) { const a = Math.PI - (j + 0.5) * Math.PI / n; lugares.push([r, a]); }
      });
      return lugares.sort((p, q) => q[1] - p[1]);                             // da esquerda (ângulo π) para a direita (0)
    })()); }
    function plenario(cx, cy, grupos, p, esc = 1) {                       // grupos: [[n, cor], ...] na ordem esquerda → direita
      const cores = []; grupos.forEach(([n, cor]) => { for (let k = 0; k < n; k++) cores.push(cor); });
      cadeiras().forEach(([r, a], k) => {
        const aceso = seg(p, k / 513 * 0.8, k / 513 * 0.8 + 0.2);
        ctx.fillStyle = aceso > 0 ? (cores[k] || 'rgba(28,23,20,0.12)') : 'rgba(28,23,20,0.12)';
        ctx.globalAlpha = aceso > 0 ? lerp(0.3, 1, aceso) : 1;
        ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r * esc, cy - Math.sin(a) * r * esc, 11 * esc, 0, 7); ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    // ------------------------------------------------ A. o gancho: o carrinho e o preço subindo
    function gancho(lt, t) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.01 }, () => L.planta(ctx, 71, TINTA, 0.07));
      // carrinho de mercado (traço de gravura)
      ctx.save(); ctx.translate(CX - 60, 1050); ctx.strokeStyle = TINTA; ctx.lineWidth = 16; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-300, -230); ctx.lineTo(-230, -230); ctx.lineTo(-150, 90); ctx.lineTo(230, 90); ctx.lineTo(290, -140); ctx.lineTo(-200, -140); ctx.stroke();
      for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-200 + k * 120 - 20, -140); ctx.lineTo(-160 + k * 110, 90); ctx.stroke(); }
      ctx.fillStyle = TINTA; [[-110, 160], [200, 160]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 34, 0, 7); ctx.fill(); });
      ctx.restore();
      // etiqueta de preço subindo
      const sobe = ease.saida(seg(lt, 0.6, 2.4)), preco = Math.round(lerp(100, 168, sobe));
      ctx.save(); ctx.translate(CX + 190, 900 - sobe * 130); ctx.rotate(0.12);
      ctx.fillStyle = AMA; ctx.fillRect(-150, -70, 300, 140); ctx.strokeStyle = TINTA; ctx.lineWidth = 6; ctx.strokeRect(-150, -70, 300, 140);
      L.texto(ctx, 'R$ ' + preco + ',00', 0, 28, { tam: 80, cor: VERM, alinhar: 'center' });
      ctx.restore();
      L.texto(ctx, '▲', CX + 380, 840 - sobe * 130, { familia: FONTE.grotesca, peso: 700, tam: 80, cor: VERM, alinhar: 'center' });
      L.aplicarCarimbo(ctx, seg(t, T.titulo, T.titulo + 0.3), CX, 470, () => {
        L.texto(ctx, 'A SUA COMPRA VAI FICAR', CX, 430, { familia: FONTE.bloco, peso: 400, tam: tamMax('A SUA COMPRA VAI FICAR', FONTE.bloco, 64, 400), cor: TINTA, alinhar: 'center' });
        L.texto(ctx, 'MAIS CARA COM O LULA?', CX, 540, { tam: L.ajustar(ctx, 'MAIS CARA COM O LULA?', FONTE.manchete, LARG), cor: VERM, alinhar: 'center', erro: TINTA, desloc: 6 });
      }, 151);
      L.aplicarCarimbo(ctx, seg(t, T.sera, T.sera + 0.3), CX, 1340, () => bloco('SERÁ MESMO?', 1375, BEGE, 110, [VERM, 1270, 150]), 153);
    }

    // ------------------------------------------------ B. a votação: proposta, plenário, quem votou contra, a esquerda
    function votacao(lt, t) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.002 }, () => L.planta(ctx, 73, TINTA, 0.06));
      cred('votação final do PLP 68/2024 · 17/12/2024 · dados abertos da Câmara', seg(lt, 0.4, 1.4));
      if (t < T.contra) {
        titulo('A PROPOSTA DO GOVERNO', seg(lt, 0, 0.6));
        L.aplicarCarimbo(ctx, seg(t, T.votacao + 0.3, T.votacao + 0.6), CX, 520, () => {
          ctx.fillStyle = TINTA; ctx.fillRect(X0, 450, LARG, 150);
          L.texto(ctx, 'ZERAR OS IMPOSTOS', CX, 520, { familia: FONTE.bloco, peso: 400, tam: 66, cor: AMA, alinhar: 'center' });
          L.texto(ctx, 'DA CESTA BÁSICA', CX, 585, { familia: FONTE.bloco, peso: 400, tam: 56, cor: BEGE, alinhar: 'center' });
        }, 155);
        if (t >= T.placar) {
          const p = seg(t, T.placar, T.placar + 1.6);
          plenario(CX, 1150, [[VOTO.sim, VERM], [VOTO.abst, '#9A8F80'], [VOTO.nao, AZUL]], p);
          linha('A CÂMARA: 513 DEPUTADOS', 650, seg(t, T.placar, T.placar + 0.6), TINTA, 34);
          const s = Math.round(lerp(0, VOTO.sim, ease.saida(seg(t, T.sim, T.sim + 1.0)))), n = Math.round(lerp(0, VOTO.nao, ease.saida(seg(t, T.nao, T.nao + 1.0))));
          if (t >= T.sim) { L.texto(ctx, String(s), 300, 1300, { tam: 150, cor: VERM, alinhar: 'center', erro: TINTA, desloc: 5 }); L.texto(ctx, 'A FAVOR', 300, 1350, { familia: FONTE.grotesca, peso: 700, tam: 40, cor: VERM, alinhar: 'center' }); }
          if (t >= T.nao) { L.texto(ctx, String(n), 780, 1300, { tam: 150, cor: AZUL, alinhar: 'center', erro: TINTA, desloc: 5 }); L.texto(ctx, 'CONTRA', 780, 1350, { familia: FONTE.grotesca, peso: 700, tam: 40, cor: AZUL, alinhar: 'center' }); }
        }
      } else if (t < T.esquerda) {
        titulo('QUEM VOTOU CONTRA', seg(t, T.contra, T.contra + 0.5), AZUL);
        L.etiqueta(ctx, 'PL E NOVO ORIENTARAM: NÃO', CX, 460, seg(t, T.contra + 0.2, T.contra + 0.5), { cor: AZUL, corTexto: BEGE, tam: 36 });
        const passo = (T.esquerda - T.contra - 1.0) / CONTRA.length;
        CONTRA.forEach(([nome, partido], i) => {
          const t0 = T.contra + 0.4 + i * passo, p = ease.saida(seg(t, t0, t0 + 0.35));
          if (p <= 0) return;
          const col = i % 2, lin = Math.floor(i / 2), x = col ? 700 : 270, y = 590 + lin * 172;
          ctx.save(); ctx.globalAlpha = Math.min(1, p * 2); ctx.translate((1 - p) * (col ? 80 : -80), 0);
          retrato(i, x - 70, y, 72);
          L.texto(ctx, nome, x + 14, y - 4, { familia: FONTE.bloco, peso: 400, tam: tamMax(nome, FONTE.bloco, 30, 400, 236), cor: TINTA });
          L.texto(ctx, partido, x + 14, y + 36, { familia: FONTE.maquina, peso: 400, tam: 24, cor: AZUL });
          ctx.restore();
          L.aplicarCarimbo(ctx, seg(t, t0 + 0.25, t0 + 0.45), x - 70, y + 70, () => {
            ctx.fillStyle = AZUL; ctx.fillRect(x - 105, y + 54, 70, 32);
            L.texto(ctx, 'NÃO', x - 70, y + 79, { familia: FONTE.grotesca, peso: 700, tam: 24, cor: BEGE, alinhar: 'center' });
          }, 160 + i);
        });
      } else {
        titulo('A ESQUERDA VOTOU A FAVOR', seg(t, T.esquerda, T.esquerda + 0.5), VERM);
        ESQ.forEach(([p, n], k) => {
          const y = 520 + k * 110, e = ease.saida(seg(t, T.esquerda + 0.3 + k * 0.2, T.esquerda + 0.9 + k * 0.2));
          L.texto(ctx, p, X0 + 150, y + 50, { familia: FONTE.bloco, peso: 400, tam: 44, cor: TINTA, alinhar: 'right' });
          ctx.fillStyle = VERM; ctx.fillRect(X0 + 175, y + 8, Math.max(8, (LARG - 300) * n / 64 * e), 56);
          L.texto(ctx, Math.round(n * e) + ' SIM', X0 + 175 + Math.max(8, (LARG - 300) * n / 64 * e) + 14, y + 50, { familia: FONTE.grotesca, peso: 700, tam: 34, cor: VERM });
        });
        linha('116 VOTOS A FAVOR · 1 CONTRA · 2 ABSTENÇÕES', 1330, seg(t, T.esquerda + 1.6, T.esquerda + 2.4), TINTA, 32);
      }
    }

    // ------------------------------------------------ C. aprovado: a prateleira com imposto zero
    function aprovado(lt, t) {
      L.fundo(ctx, VERM); arquivo = false;
      L.raios(ctx, CX, 960, 1800, 22, L.emDois(t) * 0.05, 'rgba(28,23,20,0.16)');
      L.aplicarCarimbo(ctx, seg(t, T.aprovado, T.aprovado + 0.3), CX, 400, () =>
        L.texto(ctx, 'APROVADO.', CX, 440, { tam: Math.min(170, L.ajustar(ctx, 'APROVADO.', FONTE.manchete, LARG)), cor: BEGE, alinhar: 'center', erro: TINTA, desloc: 8 }), 171);
      cred('Cesta Básica Nacional · LC 214/2025 · alíquota-padrão estimada 27,91% (CGIBS 14/2026)', seg(lt, 0.6, 1.4), BEGE, 500);
      ITENS.forEach((nome, k) => {
        const col = k % 2, lin = Math.floor(k / 2), x = col ? 760 : 320, y = 620 + lin * 175;
        const p = ease.saida(seg(t, T.itens + k * 0.4, T.itens + 0.4 + k * 0.4));
        if (p <= 0) return;
        ctx.save(); ctx.globalAlpha = Math.min(1, p * 2); ctx.translate(0, (1 - p) * 40);
        ctx.fillStyle = BEGE; ctx.fillRect(x - 200, y - 70, 400, 150); ctx.strokeStyle = TINTA; ctx.lineWidth = 5; ctx.strokeRect(x - 200, y - 70, 400, 150);
        ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(x - 175, y - 45, 9, 0, 7); ctx.fill();                       // furo da etiqueta
        L.texto(ctx, nome, x, y - 14, { familia: FONTE.bloco, peso: 400, tam: tamMax(nome, FONTE.bloco, 44, 400, 340), cor: TINTA, alinhar: 'center' });
        const zero = t >= T.taxa + k * 0.12, risca = seg(t, T.taxa + k * 0.12, T.taxa + 0.25 + k * 0.12);
        L.texto(ctx, '27,9%', x - 70, y + 52, { familia: FONTE.grotesca, peso: 700, tam: 38, cor: '#8A7F70', alinhar: 'center' });
        if (risca > 0) { ctx.strokeStyle = VERM; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - 130, y + 40); ctx.lineTo(x - 130 + 120 * risca, y + 40); ctx.stroke(); }
        if (zero) L.texto(ctx, '0%', x + 90, y + 58, { tam: 72, cor: VERM, alinhar: 'center', erro: TINTA, desloc: 3 });
        ctx.restore();
      });
      if (t >= T.taxa) L.aplicarCarimbo(ctx, seg(t, T.taxa + 1.2, T.taxa + 1.5), CX, 1365, () =>
        bloco('IMPOSTO ZERO NA CESTA BÁSICA', 1390, VERM, 50, [AMA, 1330, 96]), 173);
    }

    // ------------------------------------------------ D. a maioria: a Câmara de 2027
    function maioria(lt, t) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.002 }, () => L.planta(ctx, 75, TINTA, 0.06));
      titulo(t >= T.m2027 ? 'A CÂMARA EM 2027' : 'POR ISSO, MAIORIA IMPORTA', seg(lt, 0, 0.5), t >= T.m2027 ? TINTA : VERM);
      cred('eleição de 04/10/2026 · Agência Senado · Exame · CNN Brasil', seg(lt, 0.4, 1.4));
      const p = seg(t, T.m2027, T.m2027 + 1.8);
      plenario(CX, 1000, [[C2027.esquerda, VERM], [C2027.centro, AMA], [C2027.direita, AZUL]], p);
      [['ESQUERDA', C2027.esquerda, VERM, 250], ['CENTRO', C2027.centro, '#B98516', 540], ['DIREITA', C2027.direita, AZUL, 830]].forEach(([nome, n, cor, x], k) => {
        const e = ease.saida(seg(t, T.m2027 + 0.4 + k * 0.5, T.m2027 + 1.2 + k * 0.5));
        if (e <= 0) return;
        L.texto(ctx, String(Math.round(n * e)), x, 1150, { tam: 110, cor, alinhar: 'center', erro: TINTA, desloc: 4 });
        L.texto(ctx, nome, x, 1200, { familia: FONTE.grotesca, peso: 700, tam: 34, cor, alinhar: 'center' });
      });
      if (t >= T.precisa) {
        const pp = seg(t, T.precisa, T.precisa + 0.4);
        L.aplicarCarimbo(ctx, pp, CX, 1275, () => bloco('PRA APROVAR UMA LEI DESSAS: 257', 1300, BEGE, 48, [TINTA, 1243, 92]), 175);
      }
      if (t >= T.olho) linha('FIQUE DE OLHO EM COMO CADA UM VOTA.', 1405, seg(t, T.olho, T.olho + 1.0), VERM, 40);
    }

    // ------------------------------------------------ E. lembre-se: Kim Kataguiri e Nikolas Ferreira, lado a lado
    function lembre(lt, t) {
      L.fundo(ctx, BEGE);
      L.camera(ctx, { zoom: 1 + lt * 0.006 }, () => L.planta(ctx, 77, TINTA, 0.06));
      linha('QUANDO ELES RECLAMAREM', 470, seg(t, T.lembre, T.lembre + 0.7), TINTA, 52);
      linha('DO PREÇO DO MERCADO…', 540, seg(t, T.lembre + 0.5, T.lembre + 1.2), TINTA, 52);
      [[6, 290, -1], [0, 790, 1]].forEach(([i, x, lado], k) => {                       // Kim à esquerda, Nikolas à direita
        const [nome, partido] = CONTRA[i], e = ease.saida(seg(t, T.lembre + 0.2 + k * 0.3, T.lembre + 0.8 + k * 0.3));
        if (e <= 0) return;
        ctx.save(); ctx.globalAlpha = Math.min(1, e * 2); ctx.translate((1 - e) * 120 * lado, 0);
        retrato(i, x, 820, 180, 12);
        L.texto(ctx, nome, x, 1062, { familia: FONTE.bloco, peso: 400, tam: tamMax(nome, FONTE.bloco, 40, 400, 420), cor: TINTA, alinhar: 'center' });
        L.texto(ctx, partido, x, 1102, { familia: FONTE.maquina, peso: 400, tam: 28, cor: AZUL, alinhar: 'center' });
        ctx.restore();
        L.aplicarCarimbo(ctx, seg(t, T.lembre + 0.9 + k * 0.3, T.lembre + 1.15 + k * 0.3), x + 115, 955, () => {
          ctx.save(); ctx.translate(x + 115, 955); ctx.rotate(-0.12); ctx.fillStyle = AZUL; ctx.fillRect(-70, -34, 140, 64);
          L.texto(ctx, 'NÃO', 0, 16, { familia: FONTE.bloco, peso: 400, tam: 44, cor: BEGE, alinhar: 'center' }); ctx.restore();
        }, 181 + k);
      });
      if (t >= T.lembre2) L.aplicarCarimbo(ctx, seg(t, T.lembre2, T.lembre2 + 0.3), CX, 1250, () => {
        ctx.fillStyle = VERM; ctx.fillRect(X0, 1160, LARG, 250);
        L.texto(ctx, 'LEMBRE-SE:', CX, 1225, { familia: FONTE.bloco, peso: 400, tam: 50, cor: AMA, alinhar: 'center' });
        L.texto(ctx, 'ELES VOTARAM CONTRA ZERAR', CX, 1300, { familia: FONTE.bloco, peso: 400, tam: tamMax('ELES VOTARAM CONTRA ZERAR', FONTE.bloco, 52, 400, LARG - 60), cor: BEGE, alinhar: 'center' });
        L.texto(ctx, 'OS IMPOSTOS DA CESTA BÁSICA.', CX, 1370, { familia: FONTE.bloco, peso: 400, tam: tamMax('OS IMPOSTOS DA CESTA BÁSICA.', FONTE.bloco, 52, 400, LARG - 60), cor: BEGE, alinhar: 'center' });
      }, 185);
      cred('votação final do PLP 68/2024 · 17/12/2024 · dados abertos da Câmara', seg(lt, 0.4, 1.4));
    }

    function final(lt) {
      L.fundo(ctx, BEGE); arquivo = false;
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 780, () => L.imagem(ctx, L.img.logo, CX, 780, 780), 97);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.6, 1.2);
      [['Fontes: Câmara dos Deputados (dados abertos, votação de 17/12/2024) · LC 214/2025 · CGIBS · Agência Senado', 1110],
        ['Fotos: Câmara dos Deputados · Agência Brasil (licenças livres, créditos na descrição)', 1150]].forEach(([s, y]) =>
        L.texto(ctx, s, CX, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(s, FONTE.maquina, 22, 400), cor: TINTA, alinhar: 'center' }));
      ctx.restore();
    }
  },
};
