// FORMAÇÃO PARA NOVOS MILITANTES · EP. 2: O que é ser um Militante Ativo? (HORIZONTAL 1920×1080)
// Mesma base do EP. 1 e do EP. 3: ARQUIVO (bege) × CARTAZ (vermelho), cortes diagonais, títulos no cubo reto do logo, legenda em tarja.
// Ordem: abertura → militante × apoiador → as funções → os compromissos → militância é presença → cuide de você (equilíbrio e limites)
// → o que não toleramos → os núcleos são a sua base (celular com o cadastro) → o líder do núcleo → é só pedir ajuda → próximo episódio → logo.
const T = Object.assign({}, (window.TEMPOS || {}).marcas || {});

window.CENA = {
  w: 1920, h: 1080, fps: 30, dur: (window.TEMPOS || {}).dur || 145,
  imagens: {
    fichaNucleos: '../midia/tutorial-03/telas/ficha-nucleos.png',   // conta de exemplo (dados fictícios)
    lufa: '../midia/tutorial-03/logo-lufa-empilhado.png',
  },

  desenhar(ctx, t, L) {
    const { COR, FONTE, seg, lerp, ease, clamp } = L;
    const CX = 960, VERM = COR.vermelho, AMA = COR.amarelo, BEGE = COR.bege, TINTA = COR.tinta, AZUL = COR.azul, VESC = COR.vermelhoEscuro, VERDE = '#2E7D32';
    let arquivo = true;

    // ------------------------------------------------ componentes
    function legenda() {
      const LEG = (window.TEMPOS || {}).legendas || [];
      const l = LEG.find(l => t >= l.t0 - 0.05 && t < l.t1);
      if (!l || t >= T.logo) return;
      const pal = l.p.map(([w, t0]) => [w, t0 - 0.08]), largura = tam => {
        L.fonte(ctx, FONTE.serifa, tam, 400, 'italic');
        return pal.reduce((s, [p]) => s + ctx.measureText(p).width, 0) + tam * 0.28 * (pal.length - 1);
      };
      const tam = Math.min(48, 48 * 1300 / largura(48)), w = largura(tam);
      ctx.save(); ctx.globalAlpha = clamp((l.t1 - t) / 0.15) * clamp((t - l.t0 + 0.05) / 0.12);
      ctx.fillStyle = 'rgba(15,12,11,0.86)'; ctx.fillRect(CX - w / 2 - 26, 938, w + 52, 76);
      ctx.fillStyle = VERM; ctx.fillRect(CX - w / 2 - 26, 938, 7, 76);
      L.palavras(ctx, pal, t, CX, 989, { tam, cor: BEGE, espaco: 0.28, rgb: 0 });
      ctx.restore();
    }
    function tamMax(txt, familia, tam, peso = 700, larg = 1500) { return Math.min(tam, L.ajustar(ctx, txt, familia, larg, peso)); }
    // cubo do logo (reto), com a estrelinha no lugar do pingo do "i"; alinhado à esquerda em x, topo em y; devolve a base
    function fonteCubo(tam) { L.fonte(ctx, FONTE.grotesca, tam, 900); ctx.fontStretch = 'expanded'; }
    const largC = (c, tam) => c === 'I' ? Math.max(ctx.measureText(c).width, tam * 0.5) : ctx.measureText(c).width;
    function cubo(txt, x, y, tam, p, o = {}) {
      if (p <= 0) return y;
      const maxW = o.maxW || 960;
      fonteCubo(tam); let tw = [...txt].reduce((s, c) => s + largC(c, tam), 0);
      if (tw + tam * 1.1 > maxW) { tam *= maxW / (tw + tam * 1.1); fonteCubo(tam); tw = [...txt].reduce((s, c) => s + largC(c, tam), 0); }
      const w = tw + tam * 1.1, h = tam * 1.6, D = Math.round(h * 0.2), face = o.face || '#FFFFFF', lado = o.lado || '#C2AE88', cor = o.cor || '#CC2220';
      const n = Math.floor(txt.length * clamp(p * 1.6 - 0.2));
      L.aplicarCarimbo(ctx, ease.saida(clamp(p * 2.5)), x + w / 2, y + h / 2, () => {
        ctx.fillStyle = lado; ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + D, y + D); ctx.lineTo(x + w + D, y + h + D); ctx.lineTo(x + D, y + h + D);
        ctx.lineTo(x, y + h); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
        ctx.fillStyle = face; ctx.fillRect(x, y, w, h);
        fonteCubo(tam); ctx.fillStyle = cor; ctx.textBaseline = 'alphabetic';
        let cx = x + tam * 0.55; const base = y + h / 2 + tam * 0.37;
        for (const c of txt.slice(0, n)) {
          const cw = largC(c, tam);
          if (c === 'I') { ctx.fillRect(cx + cw / 2 - tam * 0.09, base - tam * 0.44, tam * 0.18, tam * 0.44); L.estrela(ctx, cx + cw / 2, base - tam * 0.68, tam * 0.22, 0, cor); }
          else ctx.fillText(c, cx, base);
          cx += cw;
        }
        ctx.fontStretch = 'normal';
      }, 71);
      return y + h + D;
    }
    function kicker(txt, x, y, p, cor = VERM) {
      if (p <= 0) return;
      L.texto(ctx, L.datilografar(txt, p), x, y, { familia: FONTE.sub, peso: 600, tam: 34, cor, tracking: 4 });
    }
    function carimbar(txt, cx, y, t0, cor, tam, familia = FONTE.bloco, seed = 1, o = {}) {
      const peso = familia === FONTE.manchete ? 900 : familia === FONTE.sub ? 600 : 400;
      L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), cx, y, () =>
        L.texto(ctx, txt, cx, y, { familia, peso, tam: tamMax(txt, familia, tam, peso, o.larg || 1500), cor, alinhar: 'center', ...o }), seed);
    }
    function faixa(txt, x, y, t0, larg, fundoCor = TINTA, cor = BEGE, tam = 44, seed = 9) {
      const cx = x + larg / 2;
      L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), cx, y, () => {
        ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(x + 10, y - 40, larg, 84);
        ctx.fillStyle = fundoCor; ctx.fillRect(x, y - 46, larg, 84);
        L.texto(ctx, txt, cx, y + tam * 0.36 - 4, { familia: FONTE.bloco, peso: 400, tam: tamMax(txt, FONTE.bloco, tam, 400, larg - 60), cor, alinhar: 'center' });
      }, seed);
    }
    function sol(cy = 1300) {
      L.fundo(ctx, VERM);
      L.raios(ctx, CX, cy, 2600, 24, -0.3 + L.emDois(t) * 0.05, 'rgba(237,224,196,0.12)');
      ctx.fillStyle = VESC; ctx.beginPath(); ctx.arc(CX, cy, 420, Math.PI, 0); ctx.fill();
    }
    function check(x, y, p, cor = VERDE, s = 1) {
      if (p <= 0) return;
      ctx.save(); ctx.strokeStyle = cor; ctx.lineWidth = 9 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const a = clamp(p * 2), b = clamp(p * 2 - 1);
      ctx.beginPath(); ctx.moveTo(x - 20 * s, y); ctx.lineTo(x - 20 * s + 14 * s * a, y + 16 * s * a);
      if (b > 0) ctx.lineTo(x - 6 * s + 30 * s * b, y + 16 * s - 38 * s * b);
      ctx.stroke(); ctx.restore();
    }
    // lista de passos datilografados, com ✓ ao lado: itens [[texto, t0]]
    function passos(itens, x, y, o = {}) {
      const gap = o.gap || 74, tam = o.tam || 40;
      itens.forEach(([s, t0, destaque], i) => {
        if (t < t0 - 0.05) return;
        const yy = y + i * gap;
        ctx.fillStyle = destaque ? VERM : TINTA; ctx.fillRect(x, yy - tam * 0.75, 44, 44);
        L.texto(ctx, String(i + 1), x + 22, yy - tam * 0.75 + 34, { familia: FONTE.manchete, peso: 900, tam: 34, cor: BEGE, alinhar: 'center' });
        L.texto(ctx, L.datilografar(s, seg(t, t0, t0 + 0.5)), x + 66, yy, { familia: destaque ? FONTE.bloco : FONTE.maquina, peso: 400, tam: tamMax(s, FONTE.maquina, tam, 400, o.larg || 880), cor: destaque ? VERM : TINTA });
      });
    }
    // ------------------------------------------------ o celular com o site (conta de exemplo)
    const CEL = { x: 1214, y: 50, w: 412, h: 864 }, TELA = { x: 1226, y: 62, w: 388, h: 840 }, K = 388 / 390;
    function celular(img, rolar = 0, entra = 1) {
      const e = ease.saida(clamp(entra));
      ctx.save(); ctx.translate((1 - e) * 700, 0);
      ctx.fillStyle = 'rgba(28,23,20,0.35)'; ctx.beginPath(); ctx.roundRect(CEL.x + 18, CEL.y + 18, CEL.w, CEL.h, 52); ctx.fill();
      ctx.fillStyle = TINTA; ctx.beginPath(); ctx.roundRect(CEL.x, CEL.y, CEL.w, CEL.h, 52); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.roundRect(TELA.x, TELA.y, TELA.w, TELA.h, 40); ctx.clip();
      ctx.fillStyle = '#fff'; ctx.fillRect(TELA.x, TELA.y, TELA.w, TELA.h);
      const sy = Math.max(0, Math.min(img.height - 1688, rolar * 2));
      ctx.drawImage(img, 0, sy, 780, Math.min(1688, img.height - sy), TELA.x, TELA.y, TELA.w, Math.min(1688, img.height - sy) * TELA.w / 780);
      ctx.restore();
      ctx.fillStyle = TINTA; ctx.beginPath(); ctx.roundRect(CEL.x + CEL.w / 2 - 60, CEL.y + 14, 120, 26, 13); ctx.fill();
      ctx.restore();
      return sy / 2;
    }
    const naTela = (x, y, rolar) => [TELA.x + x * K, TELA.y + (y - rolar) * K];
    function destaque(r, rolar, p, cor = AMA) {
      if (p <= 0) return;
      const [x, y] = naTela(r[0], r[1], rolar), w = r[2] * K, h = r[3] * K, pul = 1 + Math.sin(t * 6) * 0.02;
      ctx.save(); ctx.beginPath(); ctx.roundRect(TELA.x, TELA.y, TELA.w, TELA.h, 40); ctx.clip();
      ctx.globalAlpha = clamp(p * 3); ctx.strokeStyle = cor; ctx.lineWidth = 7;
      ctx.translate(x + w / 2, y + h / 2); ctx.scale(pul, pul); ctx.strokeRect(-w / 2 - 8, -h / 2 - 8, w + 16, h + 16);
      ctx.restore();
    }
    function toque(x, y, rolar, t0) {
      const p = seg(t, t0 - 0.35, t0 + 0.6); if (p <= 0 || p >= 1) return;
      const [cx, cy] = naTela(x, y, rolar);
      ctx.save();
      const chega = clamp(p / 0.35), onda = clamp((p - 0.35) / 0.65);
      ctx.globalAlpha = 1 - onda * 0.6; ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.strokeStyle = TINTA; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(cx, cy, lerp(46, 26, chega), 0, 7); ctx.fill(); ctx.stroke();
      if (onda > 0) { ctx.globalAlpha = 1 - onda; ctx.strokeStyle = AMA; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, 26 + onda * 50, 0, 7); ctx.stroke(); }
      ctx.restore();
    }
    // rolagem suave entre pontos [[t, y]]
    function rolagem(chaves) {
      let y = chaves[0][1];
      for (let i = 1; i < chaves.length; i++) {
        const [t0, y1] = chaves[i];
        if (t >= t0) y = lerp(chaves[i - 1][1] === undefined ? y1 : y, y1, ease.saida(seg(t, t0, t0 + 0.8)));
      }
      return y;
    }
    function rolar(chaves) {   // mais simples e estável: interpola sempre entre a chave anterior e a atual
      let k = 0; while (k + 1 < chaves.length && t >= chaves[k + 1][0]) k++;
      if (k === 0) return chaves[0][1];
      return lerp(chaves[k - 1][1], chaves[k][1], ease.saida(seg(t, chaves[k][0], chaves[k][0] + 0.8)));
    }
    const centro = (r) => [r[0] + r[2] / 2, r[1] + r[3] / 2];

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
      ctx.beginPath(); ctx.arc(0, -184, 30, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(0, -190, 31, Math.PI, 0); ctx.fill();
      ctx.fillRect(-12, -186, 6, 6); ctx.fillRect(6, -186, 6, 6);
      if (p.chapeu === 'bone') { ctx.fillStyle = TINTA; ctx.fillRect(-31, -216, 62, 22); ctx.fillRect(0, -198, 46, 8); }
      if (p.chapeu === 'lenco') { ctx.fillStyle = VERM; ctx.beginPath(); ctx.arc(0, -196, 32, Math.PI, 0); ctx.fill(); }
      ctx.restore();
    }
    const GENTE = [{ roupa: VERM, pele: '#8A5A3A', chapeu: 'lenco' }, { roupa: AZUL, pele: '#5E3B26', chapeu: 'bone' }, { roupa: '#6B4A2E', pele: '#E0B48A' },
      { roupa: AMA, pele: '#C68E5E' }, { roupa: TINTA, pele: '#8A5A3A', chapeu: 'bone' }, { roupa: VERDE, pele: '#5E3B26' }];

    // ------------------------------------------------ ícones das funções
    function icone(tipo, x, y, s = 1) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineWidth = 5; ctx.strokeStyle = TINTA; ctx.lineJoin = 'round';
      if (tipo === 'arte') { ctx.fillStyle = AMA; ctx.beginPath(); ctx.ellipse(0, 0, 54, 42, 0, 0, 7); ctx.fill(); ctx.stroke();
        [[VERM, -24, -12], [AZUL, 0, -22], [VERDE, 24, -10], [TINTA, -18, 14]].forEach(([c, a, b]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(a, b, 9, 0, 7); ctx.fill(); }); }
      if (tipo === 'jornal') { ctx.fillStyle = '#F7EEDC'; ctx.fillRect(-56, -44, 112, 88); ctx.strokeRect(-56, -44, 112, 88); ctx.fillStyle = VERM; ctx.fillRect(-46, -34, 92, 14);
        ctx.fillStyle = TINTA; ctx.fillRect(-46, -12, 40, 40); for (let i = 0; i < 4; i++) ctx.fillRect(2, -12 + i * 12, 44, 5); }
      if (tipo === 'artigo') { ctx.fillStyle = '#F7EEDC'; ctx.fillRect(-40, -52, 80, 104); ctx.strokeRect(-40, -52, 80, 104); ctx.fillStyle = TINTA;
        for (let i = 0; i < 6; i++) ctx.fillRect(-28, -36 + i * 15, i === 0 ? 56 : 48 - (i % 2) * 14, 5); ctx.fillStyle = VERM; ctx.beginPath(); ctx.arc(30, 40, 16, 0, 7); ctx.fill(); }
      if (tipo === 'livro') { ctx.fillStyle = VERM; ctx.fillRect(-52, -40, 50, 80); ctx.fillRect(2, -40, 50, 80); ctx.strokeRect(-52, -40, 50, 80); ctx.strokeRect(2, -40, 50, 80);
        ctx.fillStyle = AMA; ctx.fillRect(-44, -24, 34, 4); ctx.fillRect(10, -24, 34, 4); L.estrela(ctx, 27, 16, 12, 0, AMA); }
      if (tipo === 'megafone') { ctx.fillStyle = VERM; ctx.beginPath(); ctx.moveTo(-40, -14); ctx.lineTo(30, -44); ctx.lineTo(30, 44); ctx.lineTo(-40, 14); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = TINTA; ctx.fillRect(-56, -16, 18, 32); ctx.fillRect(-30, 14, 12, 30);
        ctx.strokeStyle = AMA; ctx.lineWidth = 6; [0, 1, 2].forEach((k) => { ctx.beginPath(); ctx.arc(34, 0, 22 + k * 14, -0.7, 0.7); ctx.stroke(); }); }
      ctx.restore();
    }

    // ------------------------------------------------ A. abertura (CARTAZ)
    function abre(lt) {
      arquivo = false; sol(1300);
      L.aplicarCarimbo(ctx, seg(lt, 0.3, 0.6), 480, 470, () => { ctx.save(); ctx.globalAlpha = 0.18; L.foiceMartelo(ctx, 480, 470, 300, VESC); ctx.restore(); L.imagem(ctx, L.img.lufa, 480, 470, 520); }, 3);
      carimbar('FORMAÇÃO PARA NOVOS MILITANTES · EP. 2', 1300, 250, 0.9, BEGE, 40, FONTE.sub, 4, { larg: 950, tracking: 4 });
      carimbar('O QUE É SER UM', 1300, 430, 3.7, AMA, 140, FONTE.manchete, 5, { larg: 950, erro: VESC, desloc: 7 });
      carimbar('MILITANTE ATIVO?', 1300, 610, 4.6, AMA, 170, FONTE.manchete, 6, { larg: 950, erro: VESC, desloc: 8 });
    }

    // ------------------------------------------------ B. militante × apoiador (2D)
    function diferenca(lt) {
      L.fundo(ctx, BEGE);
      kicker('MILITANTE = MEMBRO ATIVO', 120, 150, seg(lt, 0.1, 0.6));
      cubo('QUEM CONSTRÓI', 120, 180, 76, seg(lt, 0.1, 0.8), { maxW: 900 });
      // duas colunas
      [['MILITANTE', 'colabora ativamente, por dentro', VERM, 560, T.ativamente - 0.3], ['APOIADOR', 'segue, apoia e participa', AZUL, 1380, T.apoia]].forEach(([s, sub, cor, cx, t0], i) => {
        const e = ease.saida(seg(t, t0, t0 + 0.4)); if (e <= 0) return;
        ctx.save(); ctx.globalAlpha = e; ctx.translate(0, (1 - e) * 60);
        ctx.fillStyle = '#F2E7CF'; ctx.fillRect(cx - 330, 360, 660, 520); ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.strokeRect(cx - 330, 360, 660, 520);
        ctx.fillStyle = cor; ctx.fillRect(cx - 330, 360, 660, 16);
        L.texto(ctx, s, cx, 450, { familia: FONTE.manchete, peso: 900, tam: 66, cor, alinhar: 'center' });
        L.texto(ctx, sub, cx, 500, { familia: FONTE.maquina, peso: 400, tam: 30, cor: TINTA, alinhar: 'center' });
        if (i === 0) { pessoa(cx - 70, 840, GENTE[0], 1.05, 0); ctx.fillStyle = TINTA; ctx.fillRect(cx - 18, 560, 8, 220); L.bandeira(ctx, cx - 10, 562, 140, 84, t, VERM); L.estrela(ctx, cx + 40, 604, 18, 0, AMA);
          pessoa(cx + 150, 840, GENTE[2], 0.9, 0); }
        else { pessoa(cx, 840, GENTE[1], 1.0, 0); ctx.fillStyle = TINTA; ctx.fillRect(cx + 50, 680, 34, 56); ctx.fillStyle = AMA; ctx.fillRect(cx + 54, 686, 26, 40);
          L.etiqueta(ctx, '♥ CURTIR', cx + 170, 640, 1, { cor: VERM, tam: 24 }); }
        ctx.restore();
      });
      L.etiqueta(ctx, 'MUITO BEM-VINDO!', 1380, 600, seg(t, T.apoia + 1.6, T.apoia + 1.9), { cor: VERDE, tam: 30 });
      if (t >= T.nao_ativo - 0.2) L.etiqueta(ctx, 'MAS NÃO É MEMBRO ATIVO', 1380, 920 - 120, seg(t, T.nao_ativo - 0.2, T.nao_ativo + 0.1), { cor: TINTA, tam: 30 });
    }

    // ------------------------------------------------ C. as funções (2D)
    function funcoes(lt) {
      L.fundo(ctx, BEGE);
      kicker('UM MILITANTE PODE SER', 120, 150, seg(lt, 0.1, 0.6));
      cubo('AS FUNÇÕES', 120, 180, 76, seg(lt, 0.1, 0.8), { maxW: 900 });
      const F = [['arte', 'CRIADOR DE CONTEÚDO', 'artes, memes, Reels e stories', T.f_criador], ['jornal', 'REDATOR DO JORNAL', 'Jornal da Classe Trabalhadora', T.f_redator],
        ['artigo', 'PESQUISADOR', 'artigos para o site', T.f_artigos], ['livro', 'FORMAÇÃO INTERNA', 'ajudar os camaradas a estudar', T.f_formacao], ['megafone', 'AGITADOR', 'nas redes e nas ruas', T.f_agitador]];
      F.forEach(([ic, s, sub, t0], i) => {
        const x = 130 + i * 340, y = 380, w = 310, h = 380;
        L.aplicarCarimbo(ctx, seg(t, t0 - 0.1, t0 + 0.2), x + w / 2, y + h / 2, () => {
          ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(x + 12, y + 12, w, h);
          ctx.fillStyle = '#F2E7CF'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
          ctx.fillStyle = i % 2 ? AMA : VERM; ctx.fillRect(x, y, w, 14);
          icone(ic, x + w / 2, y + 120, 1.3);
          L.texto(ctx, s, x + w / 2, y + 250, { familia: FONTE.grotesca, peso: 700, tam: tamMax(s, FONTE.grotesca, 30, 700, w - 30), cor: TINTA, alinhar: 'center' });
          L.texto(ctx, sub, x + w / 2, y + 296, { familia: FONTE.maquina, peso: 400, tam: tamMax(sub, FONTE.maquina, 22, 400, w - 30), cor: TINTA, alinhar: 'center' });
        }, 20 + i);
      });
      faixa('QUER MAIS RESPONSABILIDADE? VOCÊ É ACOMPANHADO', 130, 860, T.acomp - 0.3, 1660, TINTA, AMA, 40, 26);
    }

    // ------------------------------------------------ D. os compromissos (ARQUIVO)
    function compromissos(lt) {
      L.fundo(ctx, BEGE);
      kicker('SER MILITANTE É', 120, 150, seg(lt, 0.1, 0.5));
      cubo('ASSUMIR COMPROMISSOS', 120, 180, 72, seg(lt, 0.1, 0.8), { maxW: 1200 });
      ficha(120, 360, 1100, 440);
      [['Colaborar de acordo com a sua função', T.c_colaborar], ['Manter o seu cadastro em dia', T.c_cadastro], ['Respeito, cordialidade e empatia', T.c_respeito, true]].forEach(([s, t0, dest], i) => {
        if (t < t0 - 0.1) return;
        const y = 470 + i * 110;
        if (dest) L.selecao(ctx, 216, y - 52, 860, 70, seg(t, T.c_valem - 1.0, T.c_valem - 0.4), VERM);
        L.texto(ctx, L.datilografar(s, seg(t, t0, t0 + 0.7)), 220, y, { familia: dest ? FONTE.bloco : FONTE.maquina, peso: 400, tam: dest ? 46 : 44, cor: dest ? VERM : TINTA });
        check(170, y - 16, seg(t, t0 + 0.6, t0 + 0.9), VERDE, 1);
      });
      if (t >= T.c_valem) {
        L.aplicarCarimbo(ctx, seg(t, T.c_valem, T.c_valem + 0.3), 1530, 600, () => {
          ctx.save(); ctx.translate(1530, 600); ctx.rotate(-0.06);
          ctx.strokeStyle = VERM; ctx.lineWidth = 10; ctx.strokeRect(-250, -120, 500, 240);
          L.texto(ctx, 'VALEM TANTO', 0, -24, { familia: FONTE.manchete, peso: 900, tam: 76, cor: VERM, alinhar: 'center' });
          L.texto(ctx, 'QUANTO A RADICALIDADE', 0, 60, { familia: FONTE.manchete, peso: 900, tam: 50, cor: VERM, alinhar: 'center' });
          ctx.restore();
        }, 41);
      }
    }
    function ficha(x, y, w, h, faixaCor = VERM) {
      ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(x + 14, y + 14, w, h);
      ctx.fillStyle = '#F2E7CF'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = faixaCor; ctx.fillRect(x, y, w, 14);
    }

    // ------------------------------------------------ E. militância é presença (CARTAZ)
    function presenca(lt) {
      arquivo = false; sol(1300);
      carimbar('ATENÇÃO', CX, 230, T.atencao + 0.2, BEGE, 80, FONTE.bloco, 51, { larg: 900 });
      if (t >= T.atencao + 1.4) L.texto(ctx, 'muito tempo sem colaborar pode levar ao desligamento', CX, 330, { familia: FONTE.maquina, peso: 400, tam: 38, cor: BEGE, alinhar: 'center' });
      carimbar('MILITÂNCIA', CX, 520, T.presenca, AMA, 190, FONTE.manchete, 52, { larg: 1500, erro: VESC, desloc: 8 });
      carimbar('É PRESENÇA', CX, 700, T.presenca + 0.6, AMA, 170, FONTE.manchete, 53, { larg: 1500, erro: VESC, desloc: 8 });
    }

    // ------------------------------------------------ F. cuide de você: equilíbrio e limites (2D)
    function cuidado(lt) {
      L.fundo(ctx, BEGE);
      kicker('NOS PREOCUPAMOS COM VOCÊ', 120, 150, seg(lt, 0.1, 0.6));
      cubo('CUIDE DE VOCÊ', 120, 180, 76, seg(lt, 0.1, 0.8), { maxW: 900 });
      if (t >= T.bemestar - 0.2) [['bem-estar', 0], ['integridade física e moral', 1]].forEach(([s, i]) =>
        L.etiqueta(ctx, s.toUpperCase(), 330 + i * 380, 410, seg(t, T.bemestar - 0.2 + i * 1.0, T.bemestar + 0.1 + i * 1.0), { cor: i ? AZUL : VERDE, tam: 30 }));
      // a balança: militância × vida pessoal
      const pb = ease.saida(seg(t, T.equilibrar - 0.3, T.equilibrar + 0.3));
      if (pb > 0) {
        const cx = 1400, cy = 430, bal = Math.sin((t - T.equilibrar) * 2.2) * 0.12 * Math.max(0, 1 - (t - T.equilibrar) / 4);
        ctx.save(); ctx.globalAlpha = pb;
        ctx.fillStyle = TINTA; ctx.fillRect(cx - 10, cy, 20, 380); ctx.fillRect(cx - 120, cy + 380, 240, 24);
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(bal);
        ctx.fillRect(-360, -8, 720, 16); L.estrela(ctx, 0, -24, 30, 0, VERM);
        [[-360, 'MILITÂNCIA', VERM], [360, 'VIDA PESSOAL', AZUL]].forEach(([dx2, s, cor]) => {
          ctx.save(); ctx.translate(dx2, 0); ctx.rotate(-bal);
          ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-110, 200); ctx.moveTo(0, 0); ctx.lineTo(110, 200); ctx.stroke();
          ctx.fillStyle = cor; ctx.beginPath(); ctx.moveTo(-150, 200); ctx.lineTo(150, 200); ctx.lineTo(110, 250); ctx.lineTo(-110, 250); ctx.closePath(); ctx.fill();
          L.texto(ctx, s, 0, 236, { familia: FONTE.bloco, peso: 400, tam: 34, cor: BEGE, alinhar: 'center' });
          ctx.restore();
        });
        ctx.restore(); ctx.restore();
      }
      if (t >= T.limites - 0.3) faixa('ORGANIZAÇÃO E LIMITES PARA CUIDAR DE SI', 120, 860, T.limites - 0.3, 1660, TINTA, AMA, 40, 61);
      if (t >= T.equilibrar) L.texto(ctx, L.datilografar('equilibre a militância', seg(t, T.equilibrar, T.equilibrar + 0.6)), 120, 560, { familia: FONTE.maquina, peso: 400, tam: 42, cor: TINTA });
      if (t >= T.vida) L.texto(ctx, L.datilografar('com a vida pessoal', seg(t, T.vida, T.vida + 0.6)), 120, 620, { familia: FONTE.maquina, peso: 400, tam: 42, cor: TINTA });
    }

    // ------------------------------------------------ G. o que não toleramos (CARTAZ)
    function conduta(lt) {
      arquivo = false; sol(1300);
      carimbar('NÃO TOLERAMOS', CX, 250, T.conduta + 0.4, AMA, 130, FONTE.manchete, 71, { larg: 1400, erro: VESC, desloc: 7 });
      [['DISCURSO DE ÓDIO', 560, T.odio - 0.4], ['FAKE NEWS', 1360, T.fake]].forEach(([s, x, t0], i) => {
        L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), x, 450, () => {
          ctx.fillStyle = TINTA; ctx.fillRect(x - 330, 380, 660, 140);
          L.texto(ctx, s, x, 474, { familia: FONTE.bloco, peso: 400, tam: tamMax(s, FONTE.bloco, 64, 400, 600), cor: BEGE, alinhar: 'center' });
        }, 72 + i);
        xis(x, 450, 100, seg(t, t0 + 0.35, t0 + 0.65), AMA, 18);
      });
      faixa('AJA COM CORDIALIDADE E CUIDADO, DENTRO E FORA DO COLETIVO', 160, 720, T.aja, 1600, BEGE, VERM, 40, 75);
    }
    function xis(x, y, r, p, cor = VERM, lw = 14) {
      if (p <= 0) return;
      ctx.save(); ctx.strokeStyle = cor; ctx.lineWidth = lw; ctx.lineCap = 'round';
      const a = clamp(p * 2), b = clamp(p * 2 - 1);
      ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x - r + 2 * r * a, y - r + 2 * r * a); ctx.stroke();
      if (b > 0) { ctx.beginPath(); ctx.moveTo(x + r, y - r); ctx.lineTo(x + r - 2 * r * b, y - r + 2 * r * b); ctx.stroke(); }
      ctx.restore();
    }

    // ------------------------------------------------ H. os núcleos são a sua base (celular + 2D)
    function nucleos(lt) {
      L.fundo(ctx, BEGE);
      kicker('VOCÊ NÃO ESTÁ SOZINHO', 120, 150, seg(lt, 0.1, 0.6));
      const yb = cubo('SEUS NÚCLEOS', 120, 180, 76, seg(lt, 0.1, 0.8), { maxW: 900 });
      if (t >= T.base - 0.2) L.aplicarCarimbo(ctx, seg(t, T.base - 0.2, T.base + 0.1), 560, yb + 90, () => {
        ctx.fillStyle = VERM; ctx.fillRect(120, yb + 40, 880, 100);
        L.texto(ctx, 'SÃO A SUA BASE', 560, yb + 112, { familia: FONTE.manchete, peso: 900, tam: 76, cor: AMA, alinhar: 'center' });
      }, 81);
      [['CRIANDO CONTEÚDO', T.n_criando], ['PESQUISANDO', T.n_pesquisando], ['ESTUDANDO', T.n_estudando], ['CONHECENDO PESSOAS', T.n_conhecendo]].forEach(([s, t0], i) =>
        L.etiqueta(ctx, s, 330 + (i % 2) * 440, yb + 240 + Math.floor(i / 2) * 110, seg(t, t0, t0 + 0.3), { cor: i % 2 ? VERM : TINTA, tam: 34 }));
      celular(L.img.fichaNucleos, 0, seg(lt, 0.2, 0.9));
      destaque([16, 240, 360, 540], 0, seg(t, T.cadastro + 1.0, T.cadastro + 1.4));
    }

    // ------------------------------------------------ I. o líder do núcleo (2D, organograma)
    function lider(lt) {
      L.fundo(ctx, BEGE);
      kicker('EM TODO NÚCLEO', 120, 150, seg(lt, 0.1, 0.5));
      cubo('UM LÍDER', 120, 180, 76, seg(lt, 0.1, 0.8), { maxW: 900 });
      // diretoria → líder → novos membros
      const pd = ease.saida(seg(t, T.diretoria - 0.4, T.diretoria + 0.1));
      if (pd > 0) { ctx.save(); ctx.globalAlpha = pd;
        ctx.fillStyle = TINTA; ctx.fillRect(1180, 150, 460, 100); L.texto(ctx, 'DIRETORIA', 1410, 222, { familia: FONTE.manchete, peso: 900, tam: 64, cor: AMA, alinhar: 'center' });
        ctx.fillStyle = TINTA; ctx.fillRect(1406, 250, 8, 70); ctx.restore(); }
      pessoa(1410, 560, { roupa: VERM, pele: '#5E3B26', chapeu: 'lenco' }, 1.0, 0);
      L.etiqueta(ctx, 'LÍDER DO NÚCLEO', 1410, 610, seg(lt, 0.4, 0.7), { cor: VERM, tam: 30 });
      const pn = seg(t, T.lider + 3.4, T.lider + 4.6);
      if (pn > 0) { ctx.fillStyle = TINTA; ctx.fillRect(1100, 650, 620, 6); [1100, 1410, 1714].forEach((x) => ctx.fillRect(x - 3, 650, 6, 40)); }
      [[1100, 1], [1410, 3], [1714, 5]].forEach(([x, g], k) => { const p = clamp(pn * 1.5 - k * 0.2); if (p > 0) pessoa(x, 900, GENTE[g], 0.8 * ease.saida(p) + 0.001, 0); });
      [['AJUDA A SE SITUAR', T.situar - 0.6], ['CONSTÂNCIA NA MILITÂNCIA', T.constancia], ['DE UM JEITO SAUDÁVEL', T.saudavel - 0.2]].forEach(([s, t0], i) =>
        L.etiqueta(ctx, s, 520, 420 + i * 120, seg(t, t0, t0 + 0.3), { cor: [TINTA, VERM, VERDE][i], tam: 36 }));
    }

    // ------------------------------------------------ J. é só pedir ajuda (CARTAZ)
    function ajuda(lt) {
      arquivo = false; sol(1300);
      carimbar('NÃO CONHECE MUITO DE MARXISMO?', CX, 260, T.ajuda + 0.3, BEGE, 70, FONTE.bloco, 91, { larg: 1500 });
      carimbar('É SÓ PEDIR AJUDA', CX, 460, T.pedir, AMA, 170, FONTE.manchete, 92, { larg: 1600, erro: VESC, desloc: 8 });
      faixa('A GENTE CAMINHA JUNTO NA SUA FORMAÇÃO', 260, 660, T.junto, 1400, BEGE, VERM, 46, 93);
    }

    // ------------------------------------------------ K. próximo episódio e tela final
    function proximo(lt) {
      arquivo = false; sol(1300);
      carimbar('NO PRÓXIMO EPISÓDIO:', CX, 250, T.proximo + 0.1, BEGE, 64, FONTE.bloco, 61, { larg: 1100 });
      carimbar('A ÁREA DO MILITANTE', CX, 450, T.proximo + 0.5, AMA, 150, FONTE.manchete, 62, { larg: 1600, erro: VESC, desloc: 7 });
      carimbar('E OS NÚCLEOS', CX, 630, T.proximo + 0.9, AMA, 150, FONTE.manchete, 63, { larg: 1600, erro: VESC, desloc: 7 });
    }
    function final(lt) {
      arquivo = false; sol(1300);
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 430, () => L.imagem(ctx, L.img.lufa, CX, 430, 600), 97);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.6, 1.1);
      L.texto(ctx, 'NARRAÇÃO: EDUARDA PRADO', CX, 880, { familia: FONTE.sub, peso: 600, tam: 46, cor: BEGE, alinhar: 'center', tracking: 4 });
      ctx.restore();
    }

    // ------------------------------------------------ desenho do quadro (depois das definições acima)
    const ordem = [[0, abre], [T.dif, diferenca], [T.funcoes, funcoes], [T.comp, compromissos], [T.atencao, presenca], [T.cuidado, cuidado],
      [T.conduta, conduta], [T.sozinho, nucleos], [T.lider, lider], [T.ajuda, ajuda], [T.proximo, proximo], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [0.3, T.c_valem, T.presenca, T.presenca + 0.6, T.odio - 0.4, T.fake, T.base - 0.2, T.pedir, T.proximo + 0.1, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 8);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();
    [[T.dif, BEGE, -24], [T.funcoes, BEGE, 24], [T.comp, BEGE, -24], [T.atencao, VERM, 24], [T.cuidado, BEGE, -24], [T.conduta, VERM, 24],
      [T.sozinho, BEGE, -24], [T.lider, BEGE, 24], [T.ajuda, VERM, -24], [T.proximo, AMA, 24], [T.logo, VESC, -24]].forEach(([X, cor, ang]) => L.corteDiagonal(ctx, seg(t, X - 0.4, X), cor, ang));
    if (arquivo) L.varredura(ctx, t, 0.06);
    IMP.forEach(X => L.flash(ctx, t, X, AMA, 0.25, 0.2));
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);
    legenda();
  },
};
