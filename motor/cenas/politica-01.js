// "POLÍTICA É DA SUA CONTA!" · EP. 1: Você já vive a política (com Eduarda Prado). Roteiro: roteiros/politica-01.md
// Mesmo padrão do "Desmistificando o Comunismo · EP. 1" (motor/cenas/comunismo-01.js): gancho em ARQUIVO numa moldura →
// vinheta da série → ARQUIVO (fotos e prints reais da Agência Brasil, fichas datilografadas, bonecos 2D) com picos CARTAZ →
// próximo episódio → logo. PRÉVIA sem narração: as legendas usam a fala do roteiro com tempo estimado; com a narração,
// T e as legendas vêm de politica-01.tempos.js (gerado pelo montar.py).
//
// DIAGRAMAÇÃO PADRÃO: título y 330 · fonte dos dados y 384 · conteúdo x 120–960, y 420–1420 · legenda (tarja) y 1466–1542
const T = Object.assign({
  gancho: 0, atraso: 2.0, bolso: 3.4, onde: 5.0,
  vin: 7.0,
  onibus: 10.5, viagens: 11.9, preco: 13.2, print: 14.6, sel: 16.6, prefeitura: 18.0,
  politica: 21.5, decide: 22.2, regras: 23.2, recursos: 24.2,
  escola: 27.5, planejar: 29.2, financiar: 29.9, realizar: 30.6, metas: 32.4, metasSel: 34.2,
  prior: 37.0, primeiro: 39.6, interesses: 41.4, ouvido: 43.4,
  eleicao: 46.0, naoAcaba: 47.6, camara: 50.2, continuam: 52.0,
  lai: 55.0, laiSel: 57.4, passos: 59.2,
  perguntas: 63.0, p1: 63.6, p2: 65.0, p3: 66.4,
  dia: 69.0, conta: 71.0,
  proximo: 73.5, logo: 77.5, dur: 81.5,
}, (window.TEMPOS || {}).marcas || {});

// fala do roteiro (prévia): [início, fim, texto]; "|" quebra em tarjas
const FALA = [
  [0.3, 6.8, 'Você está esperando o ônibus. | Está atrasado. A passagem pesa no bolso. | Mas onde a política entra nessa história?'],
  [10.8, 21.3, 'Quais bairros o ônibus atende? | Quantas viagens ele faz? | Quanto custa a passagem? | Em São Paulo, a prefeitura subiu a tarifa | para R$ 5,30 em janeiro de 2026.'],
  [21.7, 27.3, 'Política é como a gente organiza | a vida em sociedade: | quem decide, quais regras valem | e quais recursos são usados.'],
  [27.7, 36.8, 'Pensa numa escola pública. | Para funcionar, é preciso planejar, | financiar e realizar. | O acesso à educação avançou, | mas sem atingir a maioria das metas.'],
  [37.2, 45.8, 'O ônibus precisa melhorar. | A escola precisa de manutenção. | O que vem primeiro? | Nessas escolhas entram necessidades e interesses. | Quem está sendo ouvido?'],
  [46.2, 54.8, 'A política não acaba na eleição. | Depois do voto, as decisões continuam: | no Congresso, na Câmara da sua cidade, | na prefeitura.'],
  [55.2, 62.8, 'E a gente pode participar. | A Lei de Acesso à Informação | garante o direito de pedir dados | ao poder público. | Dá para se informar, propor e acompanhar.'],
  [63.2, 68.8, 'Guarde três perguntas: | quem é responsável? | Onde conferir? | Como foi decidido?'],
  [69.2, 73.3, 'E no seu dia: | onde a política apareceu? | Política é da sua conta.'],
  [73.7, 77.3, 'No próximo episódio: | quem decide o quê?'],
];
function legendasDaFala() {
  const out = [];
  for (const [a, b, txt] of FALA) {
    const partes = txt.split('|').map(s => s.trim()), total = partes.reduce((s, p) => s + p.length, 0);
    let t0 = a;
    for (const p of partes) {
      const d = (b - a) * p.length / total, ws = p.split(/\s+/), dw = Math.min(0.32, d * 0.8 / ws.length);
      out.push({ t0, t1: t0 + d, p: ws.map((w, i) => [w, t0 + i * dw]) });
      t0 += d;
    }
  }
  return out;
}
const LEG = ((window.TEMPOS || {}).legendas) || legendasDaFala();

window.CENA = {
  w: 1080, h: 1920, fps: 30, dur: T.dur,
  imagens: {
    onibus: '../midia/politica-01/onibus-sp-2026.jpg',          // Paulo Pinto / Agência Brasil (CC BY 3.0 BR)
    tarifa: '../midia/politica-01/print-tarifa-sp-2026.jpg',     // print da matéria da Agência Brasil, 06/01/2026
    escola: '../midia/politica-01/escola-df-2025.webp',          // Marcelo Camargo / Agência Brasil
    metas: '../midia/politica-01/print-educacao-2025.jpg',       // print da matéria da Agência Brasil, 13/06/2025
    urnas: '../midia/politica-01/urnas-2026.jpg',                // Fernando Frazão / Agência Brasil
    camara: '../midia/politica-01/sessao-camara-2025.jpg',       // Lula Marques / Agência Brasil
    logo: '../identidade/marca/coletivo-lufa.png',               // logo do Coletivo Lufã (só a logo, sem o nome escrito)
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease, clamp } = L;
    const CX = 540, LARG = 840, X0 = 120, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta, AZUL = COR.azul;
    let arquivo = true;
    const POVO = [[AZUL, '#8A5A3A', 'bone'], [VERM, '#E0B48A'], ['#6B5A48', '#5E3B26', 'bone'], [AZUL, '#C68E5E'], [VERM, '#5E3B26'], ['#3A302A', '#E0B48A', 'bone']]
      .map(([roupa, pele, chapeu], i) => ({ roupa, pele, chapeu, coque: i % 2 === 1 }));
    const PASSAGEIRA = { roupa: VERM, pele: '#8A5A3A', chapeu: null };

    const ordem = [[0, gancho], [T.vin, vinheta], [T.onibus, onibus], [T.politica, politica], [T.escola, escola], [T.prior, prioridade],
      [T.eleicao, eleicao], [T.lai, participar], [T.perguntas, perguntas], [T.dia, seuDia], [T.proximo, proximo], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [T.onde, T.prefeitura, T.decide, T.regras, T.recursos, T.metasSel, T.primeiro, T.naoAcaba, T.continuam, T.laiSel, T.dia + 0.3, T.conta, T.proximo + 0.1, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 10);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();

    [[T.vin, VERM, 24], [T.onibus, BEGE, -24], [T.politica, AMA, 24], [T.escola, BEGE, -24], [T.prior, BEGE, 24], [T.eleicao, BEGE, -24],
      [T.lai, BEGE, 24], [T.perguntas, BEGE, -24], [T.dia, VERM, 24], [T.proximo, VERM, -24], [T.logo, BEGE, 24]]
      .forEach(([X, cor, ang]) => L.corteDiagonal(ctx, seg(t, X - 0.4, X), cor, ang));
    if (arquivo) L.varredura(ctx, t, 0.07);
    IMP.forEach(X => L.flash(ctx, t, X, AMA, 0.25, 0.22));
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);
    legenda();

    // ------------------------------------------------ componentes padronizados (iguais aos do comunismo-01)
    function legenda() {
      const l = LEG.find(l => t >= l.t0 - 0.05 && t < l.t1);
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
        L.texto(ctx, txt, o.x ?? CX, y, { familia, peso, tam: tamMax(txt, familia, tam, peso, o.larg || LARG), cor, alinhar: o.alinhar || 'center', ...o }), seed);
    }
    function faixa(txt, y, t0, fundoCor = TINTA, cor = BEGE, tam = 56, seed = 9) {
      L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), CX, y, () => {
        ctx.fillStyle = fundoCor; ctx.fillRect(X0, y - 60, LARG, 120);
        L.texto(ctx, txt, CX, y + tam * 0.36, { familia: FONTE.bloco, peso: 400, tam: tamMax(txt, FONTE.bloco, tam, 400, 780), cor, alinhar: 'center' });
      }, seed);
    }
    // foto de arquivo numa moldura, com foco entrando, legenda e crédito logo ABAIXO
    function quadro(img, t0, x, y, w, h, legendaFoto, creditoFoto, esp = 26) {
      const e = ease.saida(seg(t, t0, t0 + 0.5));
      if (e <= 0) return;
      ctx.save(); ctx.globalAlpha = clamp(e * 2); ctx.translate(0, (1 - e) * 80);
      L.moldura(ctx, x, y, w, h, esp);
      L.foto(ctx, img, x, y, w, h, { pb: true, zoom: lerp(1.0, 1.07, seg(t, t0, t0 + 4)), desfoque: (1 - seg(t, t0, t0 + 0.6)) * 8 });
      if (legendaFoto) L.texto(ctx, legendaFoto, CX, y + h + esp + 52, { familia: FONTE.grotesca, peso: 700, tam: tamMax(legendaFoto, FONTE.grotesca, 32, 700, 820), cor: TINTA, alinhar: 'center' });
      if (creditoFoto) L.texto(ctx, creditoFoto, CX, y + h + esp + (legendaFoto ? 92 : 50), { familia: FONTE.maquina, peso: 400, tam: 24, cor: TINTA, alinhar: 'center' });
      ctx.restore();
    }
    // print de matéria real: papel inclinado com sombra, entra de baixo
    function printMateria(img, t0, y, h, rot = -0.02) {
      const e = ease.saida(seg(t, t0, t0 + 0.5));
      if (e <= 0) return null;
      const w = LARG, s = w / img.width, ih = Math.min(h, img.height * s);
      ctx.save(); ctx.translate(CX, y + ih / 2 + (1 - e) * 1000); ctx.rotate(rot);
      ctx.fillStyle = 'rgba(28,23,20,0.35)'; ctx.fillRect(-w / 2 + 12, -ih / 2 + 14, w, ih);
      ctx.beginPath(); ctx.rect(-w / 2, -ih / 2, w, ih); ctx.clip();
      ctx.filter = 'sepia(0.25) contrast(1.05)'; ctx.drawImage(img, 0, 0, img.width, ih / s, -w / 2, -ih / 2, w, ih); ctx.filter = 'none';
      ctx.restore();
      return { x: CX - w / 2, y, w, h: ih, s };
    }
    // ficha datilografada (como a da lei de 1833)
    function ficha(t0, y, h, cab, linhas, fonte, tamL = 46) {
      const e = ease.saida(seg(t, t0, t0 + 0.4));
      if (e <= 0) return;
      ctx.save(); ctx.translate(0, (1 - e) * 900);
      ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(X0 + 14, y + 14, LARG, h);
      ctx.fillStyle = BEGE; ctx.fillRect(X0, y, LARG, h); ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.strokeRect(X0, y, LARG, h);
      ctx.fillStyle = VERM; ctx.fillRect(X0, y, LARG, 14);
      L.texto(ctx, cab, X0 + 44, y + 90, { familia: FONTE.sub, peso: 600, tam: 44, cor: VERM, tracking: 3 });
      linhas.forEach((s, i) => L.texto(ctx, L.datilografar(s, seg(t, t0 + 0.4 + i * 0.4, t0 + 0.8 + i * 0.4)), X0 + 44, y + 180 + i * 66,
        { familia: FONTE.maquina, peso: 400, tam: tamMax(s, FONTE.maquina, tamL, 400, 760), cor: TINTA }));
      if (fonte) L.texto(ctx, fonte, X0 + 44, y + h - 34, { familia: FONTE.maquina, peso: 400, tam: 22, cor: TINTA });
      ctx.restore();
    }

    // ------------------------------------------------ boneco de cartaz (pés em x, y), igual ao do comunismo-01
    function pessoa(x, y, p, esc = 1, passo = 0) {
      ctx.save(); ctx.translate(x, y); ctx.scale(esc, esc);
      const sw = Math.sin(passo * Math.PI) * 12, quica = Math.abs(Math.sin(passo * Math.PI)) * 6;
      ctx.translate(0, -quica); ctx.lineWidth = 4; ctx.strokeStyle = TINTA; ctx.lineJoin = 'round';
      ctx.fillStyle = p.calca || TINTA; ctx.fillRect(-22 + sw, -72, 18, 72); ctx.fillRect(4 - sw, -72, 18, 72);
      ctx.fillStyle = p.roupa;
      ctx.beginPath(); ctx.moveTo(-36, -150); ctx.lineTo(36, -150); ctx.lineTo(46, -66); ctx.lineTo(-46, -66); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillRect(-56, -146, 18, 72); ctx.strokeRect(-56, -146, 18, 72); ctx.fillRect(38, -146, 18, 72); ctx.strokeRect(38, -146, 18, 72);
      ctx.fillStyle = p.pele || '#C68E5E'; ctx.beginPath(); ctx.arc(-47, -68, 9, 0, 7); ctx.arc(47, -68, 9, 0, 7); ctx.fill();
      if (p.tipo === 'avental') { ctx.fillStyle = BEGE; ctx.fillRect(-28, -130, 56, 70); ctx.strokeRect(-28, -130, 56, 70); }
      ctx.fillStyle = p.pele || '#C68E5E'; ctx.beginPath(); ctx.arc(0, -184, 30, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(0, -190, 31, Math.PI, 0); ctx.fill();
      ctx.fillRect(-12, -186, 6, 6); ctx.fillRect(6, -186, 6, 6);
      if (p.chapeu === 'bone') { ctx.fillStyle = TINTA; ctx.fillRect(-31, -216, 62, 22); ctx.fillRect(0, -198, 46, 8); }
      if (p.coque) { ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(0, -226, 16, 0, 7); ctx.fill(); }
      ctx.restore();
    }
    function onibusIcone(x, y, esc = 1) {
      ctx.save(); ctx.translate(x, y); ctx.scale(esc, esc); ctx.strokeStyle = TINTA; ctx.lineWidth = 5;
      ctx.fillStyle = VERM; ctx.fillRect(-150, -120, 300, 110); ctx.strokeRect(-150, -120, 300, 110);
      ctx.fillStyle = BEGE; for (let i = 0; i < 5; i++) ctx.fillRect(-136 + i * 54, -106, 42, 40);
      ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(-90, -8, 24, 0, 7); ctx.arc(90, -8, 24, 0, 7); ctx.fill();
      ctx.restore();
    }
    function escolaIcone(x, y, esc = 1) {
      ctx.save(); ctx.translate(x, y); ctx.scale(esc, esc); ctx.strokeStyle = TINTA; ctx.lineWidth = 5;
      ctx.fillStyle = COR.begeEscuro; ctx.fillRect(-130, -130, 260, 130); ctx.strokeRect(-130, -130, 260, 130);
      ctx.fillStyle = VERM; ctx.beginPath(); ctx.moveTo(-150, -130); ctx.lineTo(0, -210); ctx.lineTo(150, -130); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = TINTA; ctx.fillRect(-24, -70, 48, 70); for (const wx of [-100, -60, 52, 92]) ctx.fillRect(wx, -104, 28, 28);
      ctx.restore();
    }
    function casa(x, y, w, cor = COR.begeEscuro) {
      const h = w * 0.7; ctx.strokeStyle = TINTA; ctx.lineWidth = 4;
      ctx.fillStyle = cor; ctx.fillRect(x - w / 2, y - h, w, h); ctx.strokeRect(x - w / 2, y - h, w, h);
      ctx.fillStyle = VERM; ctx.beginPath(); ctx.moveTo(x - w / 2 - 10, y - h); ctx.lineTo(x, y - h - w * 0.42); ctx.lineTo(x + w / 2 + 10, y - h); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = TINTA; ctx.fillRect(x - w * 0.1, y - h * 0.5, w * 0.2, h * 0.5);
    }

    // ------------------------------------------------ 0. gancho: a espera pelo ônibus (ARQUIVO)
    function gancho(lt) {
      L.fundo(ctx, BEGE);
      titulo('ESPERANDO O ÔNIBUS', seg(lt, 0.0, 0.6));
      cred('São Paulo, janeiro de 2026', seg(lt, 0.2, 0.8));
      quadro(L.img.onibus, 0.1, X0 + 30, 470, LARG - 60, 540, 'Ônibus em São Paulo no dia do aumento da tarifa', 'Foto: Paulo Pinto / Agência Brasil');
      L.etiqueta(ctx, 'ATRASADO', 780, 560, seg(t, T.atraso, T.atraso + 0.3), { cor: VERM, tam: 38 });
      L.etiqueta(ctx, 'A PASSAGEM PESA', 330, 960, seg(t, T.bolso, T.bolso + 0.3), { cor: TINTA, tam: 36 });
      if (t >= T.onde) L.aplicarCarimbo(ctx, seg(t, T.onde, T.onde + 0.3), CX, 1290, () => {
        ctx.save(); ctx.translate(CX, 1290); ctx.rotate(-0.04);
        ctx.strokeStyle = VERM; ctx.lineWidth = 9; ctx.strokeRect(-380, -70, 760, 140);
        L.texto(ctx, 'ONDE ENTRA A POLÍTICA?', 0, 22, { familia: FONTE.bloco, peso: 400, tam: 56, cor: VERM, alinhar: 'center' });
        ctx.restore();
      }, 11);
    }

    // ------------------------------------------------ A. vinheta da série (3,5 s, música própria)
    function vinheta(lt) { arquivo = false; L.vinhetaPolitica(ctx, lt, { ep: 'EP. 1 · VOCÊ JÁ VIVE A POLÍTICA', logo: L.img.logo }); }

    // ------------------------------------------------ B. um ônibus, muitas decisões + o print da tarifa (ARQUIVO)
    function onibus(lt) {
      L.fundo(ctx, BEGE);
      const noPrint = t >= T.print;
      titulo(noPrint ? 'QUEM DECIDE O PREÇO?' : 'UM ÔNIBUS, MUITAS DECISÕES', noPrint ? seg(t, T.print, T.print + 0.6) : seg(lt, 0.1, 0.6));
      cred(noPrint ? 'Agência Brasil, 6 de janeiro de 2026' : 'mapa ilustrativo', noPrint ? seg(t, T.print + 0.2, T.print + 0.8) : seg(lt, 0.3, 0.9));
      if (t < T.print + 0.5) {
        const sai = ease.entrada(seg(t, T.print - 0.1, T.print + 0.4));
        ctx.save(); ctx.translate(-sai * 1200, 0);
        // bairros e o trajeto desenhado
        ctx.save(); ctx.globalAlpha = ease.saida(seg(lt, 0.1, 0.5)); casa(230, 640, 110); casa(340, 660, 86); ctx.restore();
        L.etiqueta(ctx, 'BAIRRO A', 285, 720, seg(lt, 0.3, 0.6), { cor: VERM, tam: 30 });
        ctx.save(); ctx.globalAlpha = ease.saida(seg(lt, 0.5, 0.9)); casa(760, 1040, 110); casa(870, 1060, 86); ctx.restore();
        L.etiqueta(ctx, 'BAIRRO B', 815, 1120, seg(lt, 0.7, 1.0), { cor: VERM, tam: 30 });
        const P = v => [lerp(300, 800, v), lerp(780, 1000, v) - Math.sin(v * Math.PI) * 60];
        const u = ease.saida(seg(lt, 0.6, 2.0));
        ctx.save(); ctx.setLineDash([22, 16]); ctx.lineWidth = 10; ctx.strokeStyle = TINTA; ctx.beginPath();
        for (let i = 0; i <= 40 * u; i++) { const [px, py] = P(i / 40); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.stroke(); ctx.restore();
        if (t > T.viagens) { const v = ((t - T.viagens) / 1.6) % 1, [bx, by] = P(ease.saida(v)); onibusIcone(bx, by - 10, 0.36); }
        L.etiqueta(ctx, 'QUANTAS VIAGENS?', 760, 620, seg(t, T.viagens, T.viagens + 0.3), { cor: TINTA, tam: 32 });
        L.etiqueta(ctx, 'QUANTO CUSTA?', 330, 1230, seg(t, T.preco, T.preco + 0.3), { cor: AZUL, tam: 36 });
        ctx.restore();
      }
      // o print real da matéria, com o preço selecionado
      const r = printMateria(L.img.tarifa, T.print, 450, 880);
      if (r) {
        // "passa agora a custar R$ 5,30" fica na linha do lide (~y 1090 do print original de 1545 px)
        L.selecao(ctx, r.x + 22, r.y + 1130 * r.s, 290, 44, seg(t, T.sel, T.sel + 0.5), VERM);
        if (t >= T.prefeitura) L.aplicarCarimbo(ctx, seg(t, T.prefeitura, T.prefeitura + 0.3), CX, 1290, () =>
          L.etiqueta(ctx, 'QUEM DECIDIU: A PREFEITURA', CX, 1290, 1, { cor: VERM, tam: 42 }), 21);
      }
    }

    // ------------------------------------------------ C. o que é política (CARTAZ)
    function politica(lt) {
      arquivo = false;
      L.fundo(ctx, AMA);
      L.raios(ctx, CX, 1500, 2600, 20, -0.3 + L.emDois(t) * 0.05, 'rgba(200,32,30,0.18)');
      carimbar('POLÍTICA É', 520, T.politica + 0.1, TINTA, 120, FONTE.manchete, 30);
      carimbar('DECIDIR JUNTO:', 640, T.politica + 0.3, TINTA, 90, FONTE.manchete, 31);
      [['QUEM DECIDE?', T.decide, 860, VERM], ['QUAIS REGRAS?', T.regras, 1040, TINTA], ['QUAIS RECURSOS?', T.recursos, 1220, VERM]].forEach(([s, t0, y, c], i) =>
        L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), CX, y, () => {
          ctx.save(); ctx.translate(lerp(-40, 40, i / 2), 0);
          ctx.fillStyle = c; ctx.fillRect(X0 + 20, y - 72, LARG - 40, 144);
          L.texto(ctx, s, CX, y + 30, { familia: FONTE.bloco, peso: 400, tam: tamMax(s, FONTE.bloco, 84, 400, 740), cor: c === TINTA ? AMA : BEGE, alinhar: 'center' });
          ctx.restore();
        }, 32 + i));
    }

    // ------------------------------------------------ D. a escola pública: foto + print das metas (ARQUIVO)
    function escola(lt) {
      L.fundo(ctx, BEGE);
      const noPrint = t >= T.metas;
      titulo(noPrint ? 'AS METAS DA EDUCAÇÃO' : 'PENSA NUMA ESCOLA PÚBLICA', noPrint ? seg(t, T.metas, T.metas + 0.6) : seg(lt, 0.1, 0.6));
      cred(noPrint ? 'Agência Brasil, 13 de junho de 2025 · dados da Pnad Educação (IBGE)' : 'exemplo real', noPrint ? seg(t, T.metas + 0.2, T.metas + 0.8) : seg(lt, 0.3, 0.9));
      if (t < T.metas + 0.5) {
        const sai = ease.entrada(seg(t, T.metas - 0.1, T.metas + 0.4));
        ctx.save(); ctx.translate(sai * 1200, 0);
        quadro(L.img.escola, T.escola, X0 + 30, 460, LARG - 60, 520, 'Alunos de escola pública no Itapoã (DF), 2025', 'Foto: Marcelo Camargo / Agência Brasil');
        [['PLANEJAR', T.planejar, 250], ['FINANCIAR', T.financiar, 540], ['REALIZAR', T.realizar, 830]].forEach(([s, t0, x]) =>
          L.etiqueta(ctx, s, x, 1270, seg(t, t0, t0 + 0.3), { cor: VERM, tam: 40 }));
        ctx.restore();
      }
      const r = printMateria(L.img.metas, T.metas, 450, 760, 0.015);
      if (r) {
        // título da matéria: "…mas sem atingir maioria das metas" (2ª linha do título, ~y 255 do print de 1320 px)
        L.selecao(ctx, r.x + 150, r.y + 478 * r.s, 560, 54, seg(t, T.metasSel, T.metasSel + 0.5), VERM);
        if (t >= T.metasSel + 0.4) L.aplicarCarimbo(ctx, seg(t, T.metasSel + 0.4, T.metasSel + 0.7), CX, 1300, () =>
          L.etiqueta(ctx, 'MAIORIA DAS METAS NÃO ATINGIDA', CX, 1300, 1, { cor: TINTA, tam: 40 }), 41);
      }
    }

    // ------------------------------------------------ E. prioridades: necessidades e interesses (2D)
    function prioridade(lt) {
      L.fundo(ctx, BEGE);
      const fase2 = t >= T.interesses;
      titulo(fase2 ? 'NECESSIDADES E INTERESSES' : 'O QUE VEM PRIMEIRO?', fase2 ? seg(t, T.interesses, T.interesses + 0.6) : seg(lt, 0.1, 0.6));
      cred(fase2 ? 'quem está sendo ouvido?' : 'várias necessidades, um orçamento', fase2 ? seg(t, T.interesses + 0.2, T.interesses + 0.8) : seg(lt, 0.3, 0.9));
      // balança: ônibus × escola, oscila e fica equilibrada (o roteiro não escolhe lado)
      const osc = Math.sin(lt * 2.2) * 0.12 * (1 - seg(t, T.primeiro, T.primeiro + 1.5)), ent = ease.saida(seg(lt, 0, 0.5));
      ctx.save(); ctx.globalAlpha = ent; ctx.translate(0, fase2 ? -60 : 0);
      const cx = CX, cy = 600, Lb = 320;
      ctx.fillStyle = TINTA; ctx.fillRect(cx - 9, cy, 18, 360); ctx.fillRect(cx - 110, cy + 350, 220, 24);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(osc); ctx.fillRect(-Lb, -9, Lb * 2, 18); ctx.restore();
      ctx.fillStyle = AMA; ctx.beginPath(); ctx.arc(cx, cy, 22, 0, 7); ctx.fill(); ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.stroke();
      [[-1, () => onibusIcone(0, 0, 0.62), 'TRANSPORTE'], [1, () => escolaIcone(0, 0, 0.62), 'MANUTENÇÃO']].forEach(([lado, ic, nome]) => {
        const px = cx + lado * Lb * Math.cos(osc), py = cy + lado * Lb * Math.sin(osc);
        ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 120, py + 170); ctx.moveTo(px, py); ctx.lineTo(px + 120, py + 170); ctx.stroke();
        ctx.fillStyle = TINTA; ctx.beginPath(); ctx.ellipse(px, py + 174, 140, 16, 0, 0, 7); ctx.fill();
        ctx.save(); ctx.translate(px, py + 160); ic(); ctx.restore();
        L.etiqueta(ctx, nome, px, py + 240, seg(lt, 0.4 + (lado + 1) * 0.3, 0.7 + (lado + 1) * 0.3), { cor: TINTA, tam: 30 });
      });
      ctx.restore();
      if (t >= T.primeiro && !fase2) L.aplicarCarimbo(ctx, seg(t, T.primeiro, T.primeiro + 0.3), CX, 1240, () => {
        ctx.save(); ctx.translate(CX, 1240); ctx.rotate(-0.04);
        ctx.strokeStyle = VERM; ctx.lineWidth = 9; ctx.strokeRect(-360, -70, 720, 140);
        L.texto(ctx, 'O QUE VEM PRIMEIRO?', 0, 22, { familia: FONTE.bloco, peso: 400, tam: 56, cor: VERM, alinhar: 'center' });
        ctx.restore();
      }, 51);
      if (fase2) {
        // dois grupos com prioridades diferentes, falando com a mesma força
        const chao = 1330;
        ctx.fillStyle = COR.begeEscuro; ctx.fillRect(X0, chao, LARG, 16);
        POVO.slice(0, 3).forEach((p, i) => pessoa(190 + i * 95, chao, p, 0.62));
        POVO.slice(3).forEach((p, i) => pessoa(700 + i * 95, chao, p, 0.62));
        ctx.fillStyle = TINTA; ctx.fillRect(CX - 60, 1130, 120, 200);
        L.etiqueta(ctx, 'DECISÃO', CX, 1100, seg(t, T.interesses + 0.3, T.interesses + 0.6), { cor: TINTA, tam: 28 });
        if (t >= T.ouvido) faixa('QUEM ESTÁ SENDO OUVIDO?', 1000, T.ouvido, VERM, BEGE, 54, 52);
      }
    }

    // ------------------------------------------------ F. a política não acaba na eleição (ARQUIVO + carimbos)
    function eleicao(lt) {
      L.fundo(ctx, BEGE);
      const naCamara = t >= T.camara;
      titulo(naCamara ? 'DEPOIS DO VOTO' : 'ELEIÇÕES 2026', naCamara ? seg(t, T.camara, T.camara + 0.6) : seg(lt, 0.1, 0.6));
      cred(naCamara ? 'as decisões continuam' : 'o voto é um momento, não o fim', naCamara ? seg(t, T.camara + 0.2, T.camara + 0.8) : seg(lt, 0.3, 0.9));
      if (t < T.camara + 0.4) {
        const sai = ease.entrada(seg(t, T.camara - 0.1, T.camara + 0.3));
        ctx.save(); ctx.translate(-sai * 1200, 0);
        quadro(L.img.urnas, T.eleicao, X0 + 30, 470, LARG - 60, 520, 'Urnas eletrônicas saindo para os locais de votação, RJ', 'Foto: Fernando Frazão / Agência Brasil');
        if (t >= T.naoAcaba) L.aplicarCarimbo(ctx, seg(t, T.naoAcaba, T.naoAcaba + 0.3), CX, 1270, () => {
          ctx.save(); ctx.translate(CX, 1270); ctx.rotate(-0.04);
          ctx.strokeStyle = VERM; ctx.lineWidth = 9; ctx.strokeRect(-400, -70, 800, 140);
          L.texto(ctx, 'NÃO ACABA NA ELEIÇÃO', 0, 22, { familia: FONTE.bloco, peso: 400, tam: 56, cor: VERM, alinhar: 'center' });
          ctx.restore();
        }, 61);
        ctx.restore();
      }
      if (naCamara) {
        quadro(L.img.camara, T.camara, X0 + 30, 470, LARG - 60, 480, 'Sessão da Câmara dos Deputados, Brasília, 2025', 'Foto: Lula Marques / Agência Brasil');
        [['CONGRESSO', T.camara + 0.8, 250], ['CÂMARA MUNICIPAL', T.camara + 1.2, 560], ['PREFEITURA', T.camara + 1.6, 860]].forEach(([s, t0, x]) =>
          L.etiqueta(ctx, s, x, 1150, seg(t, t0, t0 + 0.3), { cor: AZUL, tam: 30 }));
        if (t >= T.continuam) faixa('AS DECISÕES CONTINUAM', 1300, T.continuam, TINTA, AMA, 58, 62);
      }
    }

    // ------------------------------------------------ G. participar: a Lei de Acesso à Informação + o caminho (ARQUIVO)
    function participar(lt) {
      L.fundo(ctx, BEGE);
      titulo('DÁ PARA PARTICIPAR', seg(lt, 0.1, 0.6));
      cred('Lei nº 12.527, de 18 de novembro de 2011', seg(lt, 0.3, 0.9));
      ficha(T.lai, 470, 470, 'LEI DE ACESSO À INFORMAÇÃO', ['Qualquer pessoa pode pedir', 'informações ao poder público,', 'sem precisar dizer o motivo.'],
        'fonte: Lei nº 12.527/2011, art. 10, § 3º (planalto.gov.br)', 44);
      L.selecao(ctx, X0 + 40, 470 + 136, 660, 62, seg(t, T.laiSel, T.laiSel + 0.5), VERM);
      // o caminho em escada: informar → propor → acompanhar
      [['INFORMAR', T.passos, 1080, 290], ['PROPOR', T.passos + 0.6, 1200, 540], ['ACOMPANHAR', T.passos + 1.2, 1320, 790]].forEach(([s, t0, y, x], i, a) => {
        L.etiqueta(ctx, s, x, y, seg(t, t0, t0 + 0.3), { cor: i === 1 ? VERM : TINTA, tam: 40 });
        if (i < 2 && t > t0 + 0.3) {
          const u = ease.saida(seg(t, t0 + 0.3, t0 + 0.6)), [x2, y2] = [a[i + 1][3], a[i + 1][2]];
          ctx.strokeStyle = TINTA; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + 90, y + 20); ctx.lineTo(lerp(x + 90, x2 - 110, u), lerp(y + 20, y2 - 20, u)); ctx.stroke();
        }
      });
    }

    // ------------------------------------------------ H. três perguntas (ARQUIVO, datilografia + seleção)
    function perguntas(lt) {
      L.fundo(ctx, BEGE);
      titulo('GUARDE TRÊS PERGUNTAS', seg(lt, 0.1, 0.6));
      cred('para acompanhar qualquer decisão', seg(lt, 0.3, 0.9));
      [['1', 'QUEM É RESPONSÁVEL?', T.p1, 560], ['2', 'ONDE CONFERIR?', T.p2, 840], ['3', 'COMO FOI DECIDIDO?', T.p3, 1120]].forEach(([n, s, t0, y]) => {
        const e = ease.saida(seg(t, t0, t0 + 0.4));
        if (e <= 0) return;
        ctx.save(); ctx.globalAlpha = clamp(e * 2); ctx.translate((1 - e) * -120, 0);
        ctx.fillStyle = 'rgba(28,23,20,0.25)'; ctx.fillRect(X0 + 12, y - 98, LARG, 200);
        ctx.fillStyle = COR.begeEscuro; ctx.fillRect(X0, y - 110, LARG, 200);
        L.texto(ctx, n, X0 + 90, y + 58, { familia: FONTE.manchete, peso: 900, tam: 200, cor: VERM, alinhar: 'center', erro: TINTA, desloc: 5 });
        L.texto(ctx, L.datilografar(s, seg(t, t0 + 0.2, t0 + 0.8)), X0 + 200, y + 18, { familia: FONTE.grotesca, peso: 700, tam: tamMax(s, FONTE.grotesca, 52, 700, 600), cor: TINTA });
        ctx.restore();
      });
      L.selecao(ctx, X0 + 196, 840 - 30, 420, 66, seg(t, T.p2 + 0.9, T.p2 + 1.3), VERM);
    }

    // ------------------------------------------------ I. e no seu dia? (CARTAZ final)
    function seuDia(lt) {
      arquivo = false;
      L.fundo(ctx, VERM);
      L.raios(ctx, CX, 1180, 2600, 22, -0.25 + L.emDois(t) * 0.05, 'rgba(138,20,17,0.5)');
      carimbar('E NO SEU DIA?', 640, T.dia + 0.3, AMA, 170, FONTE.manchete, 71, { erro: COR.vermelhoEscuro, desloc: 7 });
      if (t >= T.conta) {
        L.aplicarCarimbo(ctx, seg(t, T.conta, T.conta + 0.3), CX, 920, () => {
          ctx.fillStyle = TINTA; ctx.fillRect(130, 870, 820, 100);
          L.texto(ctx, 'POLÍTICA É DA SUA', CX, 955, { tam: Math.min(100, L.ajustar(ctx, 'POLÍTICA É DA SUA', FONTE.manchete, 780)), cor: BEGE, alinhar: 'center', erro: VERM, desloc: 4 });
        }, 72);
        L.aplicarCarimbo(ctx, seg(t, T.conta + 0.25, T.conta + 0.55), CX, 1080, () =>
          L.texto(ctx, 'CONTA!', CX, 1080 + 76, { familia: FONTE.bloco, peso: 400, tam: 210, cor: AMA, alinhar: 'center', erro: TINTA, desloc: 9 }), 73);
      }
    }

    // ------------------------------------------------ J. próximo episódio (CARTAZ, igual ao do comunismo-01)
    function proximo(lt) {
      arquivo = false;
      L.fundo(ctx, VERM);
      L.raios(ctx, CX, 1560, 2600, 20, -0.3 + L.emDois(t) * 0.05, 'rgba(237,224,196,0.13)');
      ctx.fillStyle = COR.vermelhoEscuro; ctx.beginPath(); ctx.arc(CX, 1560, 330, Math.PI, 0); ctx.fill();
      carimbar('PRÓXIMO EPISÓDIO:', 600, T.proximo + 0.1, BEGE, 70, FONTE.bloco, 81);
      carimbar('QUEM DECIDE', 800, T.proximo + 0.4, AMA, 180, FONTE.manchete, 82, { erro: COR.vermelhoEscuro, desloc: 7 });
      carimbar('O QUÊ?', 990, T.proximo + 0.6, AMA, 200, FONTE.manchete, 83, { erro: COR.vermelhoEscuro, desloc: 7 });
      if (t > T.proximo + 1.0) {
        ctx.save(); ctx.globalAlpha = seg(t, T.proximo + 1.0, T.proximo + 1.4);
        L.texto(ctx, 'POLÍTICA É DA SUA CONTA! · COM EDUARDA PRADO', CX, 1140, { familia: FONTE.manchete, peso: 900, tam: tamMax('POLÍTICA É DA SUA CONTA! · COM EDUARDA PRADO', FONTE.manchete, 40, 900), cor: BEGE, alinhar: 'center', tracking: 3 });
        ctx.restore();
      }
    }

    // ------------------------------------------------ K. logo e créditos (igual ao do comunismo-01, com a logo do Lufã)
    function final(lt) {
      L.fundo(ctx, BEGE); arquivo = false;
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 760, () => L.imagem(ctx, L.img.logo, CX, 760, 420), 97);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.6, 1.2);
      [['Roteiro, pesquisa e apresentação: Eduarda Prado', 1100],
        ['Edição e direção criativa: Leonardo Duarte', 1140],
        ['Fotos: Paulo Pinto, Marcelo Camargo, Fernando Frazão e Lula Marques · Agência Brasil (CC BY 3.0 BR)', 1190],
        ['Prints: Agência Brasil, 06/01/2026 (tarifa de ônibus em SP) e 13/06/2025 (metas da educação, Pnad/IBGE)', 1230],
        ['Fontes: Constituição Federal, arts. 6º e 30, V · Lei de Acesso à Informação (Lei nº 12.527/2011)', 1280],
        ['Plano Nacional de Educação (Lei nº 13.005/2014)', 1320],
        ['Mapa, balança e bonecos: exemplos ilustrativos', 1370]].forEach(([s2, y]) =>
        L.texto(ctx, s2, CX, y, { familia: FONTE.maquina, peso: 400, tam: tamMax(s2, FONTE.maquina, 24, 400), cor: TINTA, alinhar: 'center' }));
      ctx.restore();
    }
  },
};
