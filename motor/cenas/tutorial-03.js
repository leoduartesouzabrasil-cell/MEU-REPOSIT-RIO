// FORMAÇÃO PARA NOVOS MILITANTES · EP. 3: A Área do Militante e a Organização dos Núcleos (HORIZONTAL 1920×1080)
// Mesma base do EP. 1 (tutorial-01.js): ARQUIVO (bege) × CARTAZ (vermelho), cortes diagonais, títulos no cubo reto do logo,
// legenda em tarja. O site aparece dentro de um celular, com telas capturadas de uma CONTA DE EXEMPLO ("Rosa Exemplo",
// dados fictícios), em midia/tutorial-03/telas (pos.json guarda a posição de cada parte da página, em px CSS).
// DIAGRAMAÇÃO: texto à esquerda (x 120–1100) · celular à direita (x 1214–1626, y 50–914) · legenda (tarja) y 938–1014
const T = Object.assign({}, (window.TEMPOS || {}).marcas || {});
const POS = {"mil":{"grupo-geral":[23,392,343,53],"engajados":[23,617,343,225],"formacao":[23,873,343,595],"abrir-carteira":[23,1498,343,93],"lista-avisos":[41,1697,307,227],"meus-nucleos":[39,2066,311,181],"abrir-artigo":[261,2376,90,35],"abrir-gerador":[277,2590,74,35],"abrir-convite":[260,2445,91,35]},
  "cartao-afazer":[23,700,343,56],"botao-afazer":[20,770,350,52],"cartao-fazendo":[23,700,343,74],"botao-fazendo":[18,706,350,52],"cartao-pronto":[23,700,343,101],
  "org":{"nucleos":[23,289,343,62],"quadro":[23,634,343,212]}};

window.CENA = {
  w: 1920, h: 1080, fps: 30, dur: (window.TEMPOS || {}).dur || 210,
  imagens: {
    inicio: '../midia/tutorial-03/telas/inicio.png', menu: '../midia/tutorial-03/telas/menu.png',
    ficha: '../midia/tutorial-03/telas/ficha.png', fichaNucleos: '../midia/tutorial-03/telas/ficha-nucleos.png',
    mil: '../midia/tutorial-03/telas/mil-full.png',
    orgAfazer: '../midia/tutorial-03/telas/org-afazer.png', orgFazendo: '../midia/tutorial-03/telas/org-fazendo.png', orgPronto: '../midia/tutorial-03/telas/org-pronto.png',
    tarefaAfazer: '../midia/tutorial-03/telas/tarefa-afazer.png', tarefaFazendo: '../midia/tutorial-03/telas/tarefa-fazendo.png',
    lufa: '../midia/tutorial-03/logo-lufa-empilhado.png',
    n_marxista: '../midia/tutorial-03/nucleos/marxista.jpg', n_racial: '../midia/tutorial-03/nucleos/racial.jpg', n_feminista: '../midia/tutorial-03/nucleos/feminista.jpg',
    n_lgbt: '../midia/tutorial-03/nucleos/lgbtqia.jpg', n_povos: '../midia/tutorial-03/nucleos/povos.jpg', n_terreiro: '../midia/tutorial-03/nucleos/terreiro.jpg',
    n_cultural: '../midia/tutorial-03/nucleos/cultural.jpg', n_estudantil: '../midia/tutorial-03/nucleos/estudantil.jpg', n_jornal: '../midia/tutorial-03/nucleos/jornal.jpg',
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

    // ------------------------------------------------ A. abertura (CARTAZ)
    function abre(lt) {
      arquivo = false; sol(1300);
      L.aplicarCarimbo(ctx, seg(lt, 0.3, 0.6), 480, 470, () => { ctx.save(); ctx.globalAlpha = 0.18; L.foiceMartelo(ctx, 480, 470, 300, VESC); ctx.restore(); L.imagem(ctx, L.img.lufa, 480, 470, 520); }, 3);
      carimbar('FORMAÇÃO PARA NOVOS MILITANTES · EP. 3', 1300, 250, 0.9, BEGE, 40, FONTE.sub, 4, { larg: 950, tracking: 4 });
      carimbar('A ÁREA DO', 1300, 430, 1.5, AMA, 170, FONTE.manchete, 5, { larg: 950, erro: VESC, desloc: 7 });
      carimbar('MILITANTE', 1300, 600, 2.0, AMA, 190, FONTE.manchete, 6, { larg: 950, erro: VESC, desloc: 8 });
      faixa('E A ORGANIZAÇÃO DOS NÚCLEOS', 860, 760, 3.2, 880, BEGE, VERM, 52, 7);
    }

    // ------------------------------------------------ B. como entrar (celular)
    function entrar(lt) {
      L.fundo(ctx, BEGE);
      kicker('PASSO A PASSO', 120, 150, seg(lt, 0.1, 0.5));
      const yb = cubo('COMO ENTRAR', 120, 180, 76, seg(lt, 0.1, 0.8), { maxW: 900 });
      passos([['Acesse coletivolufa.github.io', T.entrar + 4.6], ['Entre na sua conta', T.entrar + 6.5], ['Menu → Área do Militante', T.menu - 1.2, true]], 120, yb + 90);
      if (t >= T.primeira) {
        const e = ease.saida(seg(t, T.primeira, T.primeira + 0.5));
        ctx.save(); ctx.globalAlpha = e;
        ctx.fillStyle = TINTA; ctx.fillRect(120, 620, 900, 270); ctx.fillStyle = VERM; ctx.fillRect(120, 620, 900, 12);
        L.texto(ctx, 'NA PRIMEIRA VEZ', 160, 684, { familia: FONTE.sub, peso: 600, tam: 40, cor: AMA, tracking: 4 });
        [['complete o seu cadastro', T.primeira + 1.8], ['escolha os seus núcleos', T.nucleos_cad], ['coloque a sua foto', T.foto - 0.2]].forEach(([s, t0], i) => {
          check(180, 730 + i * 52, seg(t, t0, t0 + 0.4), AMA, 1);
          if (t >= t0) L.texto(ctx, L.datilografar(s, seg(t, t0, t0 + 0.5)), 230, 752 + i * 52, { familia: FONTE.maquina, peso: 400, tam: 38, cor: BEGE });
        });
        ctx.restore();
      }
      const img = t < T.entrar + 7.6 ? L.img.inicio : t < T.primeira ? L.img.menu : t < T.nucleos_cad - 0.3 ? L.img.ficha : L.img.fichaNucleos;
      celular(img, 0, seg(lt, 0.2, 0.9));
      toque(370, 22, 0, T.entrar + 7.3);           // o botão do menu
      toque(175, 410, 0, T.menu - 0.3);            // "Área do militante" no menu
      if (t >= T.nucleos_cad) destaque([16, 240, 360, 540], 0, seg(t, T.nucleos_cad, T.nucleos_cad + 0.4));
    }

    // ------------------------------------------------ C. o que tem na Área do Militante (celular rolando)
    function area(lt) {
      L.fundo(ctx, BEGE);
      kicker('ÁREA DO MILITANTE', 120, 150, seg(lt, 0.1, 0.5));
      const yb = cubo('O QUE TEM LÁ', 120, 180, 76, seg(lt, 0.1, 0.8), { maxW: 900 });
      const M = POS.mil;
      const itens = [['GRUPO GERAL NO WHATSAPP', T.grupo, 'grupo-geral', 80], ['CAMARADAS MAIS ENGAJADOS', T.engaj, 'engajados', 560], ['A FORMAÇÃO (ESTE VÍDEO!)', T.formacao, 'formacao', 820],
        ['A SUA CARTEIRINHA', T.carteira, 'abrir-carteira', 1260], ['CENTRAL DE AVISOS', T.avisos + 1.5, 'lista-avisos', 1600], ['OS SEUS NÚCLEOS', T.seus - 1, 'meus-nucleos', 1960]];
      const r = rolar([[0, 0], ...itens.map(([, t0, , y]) => [t0 - 0.3, y])]);
      const atual = itens.filter(([, t0]) => t >= t0 - 0.3).pop();
      itens.forEach(([s, t0], i) => {
        if (t < t0) return;
        const y = yb + 70 + i * 76, ativo = atual && atual[0] === s;
        const e = ease.saida(seg(t, t0, t0 + 0.4));
        ctx.save(); ctx.translate((1 - e) * -200, 0); ctx.globalAlpha = e;
        ctx.fillStyle = ativo ? VERM : TINTA; ctx.fillRect(120, y - 46, 760, 64);
        L.texto(ctx, s, 150, y, { familia: FONTE.grotesca, peso: 700, tam: tamMax(s, FONTE.grotesca, 34, 700, 640), cor: ativo ? BEGE : BEGE });
        check(840, y - 18, 1, AMA, 0.8);
        ctx.restore();
      });
      const sy = celular(L.img.mil, r, seg(lt, 0.1, 0.8));
      if (atual) destaque(M[atual[2]], sy, seg(t, atual[1], atual[1] + 0.3));
      if (t >= T.carteira) toque(...centro(M['abrir-carteira']), sy, T.carteira + 2.6);
    }

    // ------------------------------------------------ D. os núcleos (2D)
    function nucleos(lt) {
      L.fundo(ctx, BEGE);
      kicker('ONDE VOCÊ ATUA', 120, 150, seg(lt, 0.1, 0.5));
      cubo('OS NÚCLEOS', 120, 180, 76, seg(lt, 0.1, 0.8), { maxW: 900 });
      const N = [['n_marxista', 'MARXISTA'], ['n_racial', 'RACIAL'], ['n_feminista', 'FEMINISTA'], ['n_lgbt', 'LGBTQIA+'],
        ['n_povos', 'POVOS ORIGINÁRIOS'], ['n_terreiro', 'POVOS DE TERREIRO'], ['n_cultural', 'CULTURAL'], ['n_estudantil', 'ESTUDANTIL']];
      N.forEach(([k, nome], i) => {
        const t0 = T[k] - 0.2; if (t < t0) return;
        const x = 150 + (i % 4) * 240, y = 370 + Math.floor(i / 4) * 222, s = 164;
        L.aplicarCarimbo(ctx, seg(t, t0, t0 + 0.3), x + s / 2, y + s / 2, () => {
          ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(x + 10, y + 10, s, s);
          ctx.drawImage(L.img[k], x, y, s, s);
          ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.strokeRect(x, y, s, s);
          L.texto(ctx, nome, x + s / 2, y + s + 40, { familia: FONTE.grotesca, peso: 700, tam: tamMax(nome, FONTE.grotesca, 24, 700, 220), cor: TINTA, alinhar: 'center' });
        }, 30 + i);
      });
      L.etiqueta(ctx, 'DE TODOS', 232, 370, seg(t, T.todos + 0.4, T.todos + 0.7), { cor: VERM, tam: 30 });
      if (t >= T.escolher) {
        const e = ease.saida(seg(t, T.escolher, T.escolher + 0.4));
        faixa('OS OUTROS, VOCÊ ESCOLHE NO CADASTRO', 140, 870, T.escolher, 960, TINTA, AMA, 36, 41);
      }
      // a Redação do Jornal, à parte
      if (t >= T.jornal) {
        const e = ease.saida(seg(t, T.jornal, T.jornal + 0.5)), x = 1340, y = 300, s = 360;
        ctx.save(); ctx.translate((1 - e) * 600, 0);
        L.moldura(ctx, x, y, s, s, 24);
        ctx.drawImage(L.img.n_jornal, x, y, s, s);
        ctx.restore();
        L.etiqueta(ctx, 'E A REDAÇÃO DO JORNAL', x + s / 2, y + s + 80, seg(t, T.jornal + 0.4, T.jornal + 0.7), { cor: VERM, tam: 32 });
      }
    }

    // ------------------------------------------------ E. a Organização dos Núcleos (celular)
    function organizacao(lt) {
      L.fundo(ctx, BEGE);
      kicker('A PARTE MAIS IMPORTANTE', 120, 150, seg(lt, 0.1, 0.6));
      const yb = cubo('ORGANIZAÇÃO', 120, 180, 76, seg(lt, 0.1, 0.8), { maxW: 900 });
      const y2 = cubo('DOS NÚCLEOS', 120, yb + 14, 76, seg(lt, 0.4, 1.1), { maxW: 900 });
      [['o que cada núcleo precisa produzir', T.org + 5.2], ['e você colabora criando conteúdo', T.org + 7.5]].forEach(([s, t0], i) => {
        if (t >= t0) L.texto(ctx, L.datilografar(s, seg(t, t0, t0 + 0.7)), 120, y2 + 90 + i * 64, { familia: FONTE.maquina, peso: 400, tam: 40, cor: TINTA });
      });
      L.selecao(ctx, 116, y2 + 90 + 64 - 46, 700, 60, seg(t, T.org + 8.5, T.org + 9.2), VERM);
      // primeiro o botão "Acessar" na Área; depois a página da Organização
      if (t < T.org + 3.2) {
        const sy = celular(L.img.mil, 2330, seg(lt, 0.1, 0.8));
        const r = [260, 2517, 91, 35];
        destaque(r, sy, seg(t, T.org + 0.8, T.org + 1.1)); toque(...centro(r), sy, T.org + 2.4);
      } else {
        const sy = celular(L.img.orgAfazer, rolar([[0, 0], [T.org + 6, 180]]), 1);
        destaque(t < T.org + 6 ? POS.org.nucleos : POS.org.quadro, sy, seg(t, T.org + 3.6, T.org + 4));
      }
    }

    // ------------------------------------------------ F. núcleo = identificação (2D)
    function identificacao(lt) {
      L.fundo(ctx, BEGE);
      kicker('O QUE É UM NÚCLEO', 120, 150, seg(lt, 0.1, 0.5));
      cubo('IDENTIFICAÇÃO', 120, 180, 76, seg(lt, 0.1, 0.8), { maxW: 900 });
      // a pessoa no meio, as pautas com que se identifica dos lados
      const cx = 1300, chao = 760;
      ctx.fillStyle = TINTA; ctx.fillRect(820, chao, 960, 8);
      [['n_racial', 1040, T.ident + 6.8], ['n_povos', 1600, T.ident + 11.4]].forEach(([k, x, t0]) => {
        const e = ease.saida(seg(t, t0, t0 + 0.4)); if (e <= 0) return;
        ctx.save(); ctx.globalAlpha = e; ctx.translate(0, (1 - e) * 40);
        ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(x - 90 + 8, 350 + 8, 180, 180); ctx.drawImage(L.img[k], x - 90, 350, 180, 180);
        ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.strokeRect(x - 90, 350, 180, 180);
        ctx.restore();
      });
      const grupo = seg(t, T.debater + 1.0, T.debater + 2.2);   // ao "conversar com essas pessoas", chega o pessoal
      [[-300, 1], [-170, 2], [170, 3], [300, 4]].forEach(([dx2, i], k) => {
        const p = clamp(grupo * 1.4 - k * 0.12); if (p <= 0) return;
        pessoa(cx + dx2 * ease.saida(p) + (1 - ease.saida(p)) * Math.sign(dx2) * 400, chao, GENTE[i], 0.9, p < 1 ? p * 4 : 0);
      });
      pessoa(cx, chao, GENTE[0], 1.15, 0);
      if (t >= T.ident + 2.0) L.texto(ctx, L.datilografar('Você se identifica com a pauta?', seg(t, T.ident + 2.0, T.ident + 3.0)), 120, 440, { familia: FONTE.maquina, peso: 400, tam: 42, cor: TINTA });
      if (t >= T.ident + 13.2) L.texto(ctx, L.datilografar('Então o núcleo é seu:', seg(t, T.ident + 13.2, T.ident + 14.0)), 120, 520, { familia: FONTE.maquina, peso: 400, tam: 42, cor: TINTA });
      [['FAZER PARTE', T.debater - 1.3], ['DEBATER E CONVERSAR', T.debater], ['CRIAR CONTEÚDO', T.criando], ['ESTUDAR JUNTO', T.estudar]].forEach(([s, t0], i) =>
        L.etiqueta(ctx, s, 320 + (i % 2) * 380, 620 + Math.floor(i / 2) * 110, seg(t, t0, t0 + 0.3), { cor: i % 2 ? VERM : TINTA, tam: 34 }));
    }

    // ------------------------------------------------ G. o quadro de tarefas (2D)
    function quadro(lt) {
      L.fundo(ctx, BEGE);
      kicker('NA ORGANIZAÇÃO', 120, 150, seg(lt, 0.1, 0.5));
      cubo('O QUADRO DE TAREFAS', 120, 180, 70, seg(lt, 0.1, 0.8), { maxW: 1100 });
      const COLS = [['A FAZER', VERM, T.c_afazer], ['FAZENDO', AMA, T.c_fazendo], ['PRONTO', VERDE, T.c_pronto]];
      COLS.forEach(([s, cor, t0], i) => {
        const x = 420 + i * 470, y = 330, w = 430, h = 560;
        const e = ease.saida(seg(t, t0 - 0.2, t0 + 0.3)); if (e <= 0) return;
        ctx.save(); ctx.globalAlpha = e; ctx.translate(0, (1 - e) * 80);
        ctx.fillStyle = 'rgba(28,23,20,0.25)'; ctx.fillRect(x + 12, y + 12, w, h);
        ctx.fillStyle = '#F2E7CF'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = cor; ctx.fillRect(x, y, w, 16);
        L.texto(ctx, s, x + w / 2, y + 74, { familia: FONTE.manchete, peso: 900, tam: 52, cor: TINTA, alinhar: 'center' });
        ctx.restore();
      });
      // as tarefas caem em "A fazer"
      [['POST', T.t_post, '▣'], ['VÍDEO', T.t_video, '▶'], ['ARTE', T.t_arte, '✎'], ['PESQUISA', T.t_pesquisa, '⌕']].forEach(([s, t0, ic], i) => {
        const p = seg(t, t0 - 0.15, t0 + 0.35); if (p <= 0) return;
        const x = 450, y = lerp(140, 440 + i * 105, ease.carimbo(p)), w = 370, h = 84;
        ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate((1 - p) * 0.2 * (i % 2 ? 1 : -1));
        ctx.fillStyle = 'rgba(28,23,20,0.3)'; ctx.fillRect(-w / 2 + 6, -h / 2 + 6, w, h);
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.fillStyle = VERM; ctx.fillRect(-w / 2, -h / 2, 10, h);
        L.texto(ctx, ic + '  ' + s, -w / 2 + 34, 14, { familia: FONTE.bloco, peso: 400, tam: 40, cor: TINTA });
        ctx.restore();
      });
      // o líder do núcleo coloca as tarefas
      const pl = ease.saida(seg(t, T.lider - 0.4, T.lider + 0.4));
      if (pl > 0) {
        pessoa(lerp(-100, 250, pl), 880, { roupa: VERM, pele: '#5E3B26', chapeu: 'lenco' }, 1.0, pl < 1 ? pl * 4 : 0);
        L.etiqueta(ctx, 'LÍDER DO NÚCLEO', 250, 560, seg(t, T.lider + 0.3, T.lider + 0.6), { cor: TINTA, tam: 28 });
      }
    }

    // ------------------------------------------------ H. pegar uma tarefa (celular)
    function pegar(lt) {
      L.fundo(ctx, BEGE);
      kicker('VIU UMA TAREFA?', 120, 150, seg(lt, 0.1, 0.5));
      const yb = cubo('PEGUE PARA VOCÊ', 120, 180, 76, seg(lt, 0.1, 0.8), { maxW: 900 });
      passos([['Toque na tarefa', T.toque], ['Leia a descrição', T.toque + 1.4], ['Toque em “Quero fazer”', T.quero, true]], 120, yb + 90);
      if (t >= T.vai_fazendo) faixa('ELA VAI PARA “FAZENDO”, COM O SEU NOME', 120, yb + 380, T.vai_fazendo, 900, AMA, TINTA, 36, 51);
      const R = 330;
      if (t < T.toque + 0.5) { const sy = celular(L.img.orgAfazer, R, seg(lt, 0.1, 0.8)); destaque(POS['cartao-afazer'], sy, seg(t, T.viu + 0.6, T.viu + 0.9)); toque(...centro(POS['cartao-afazer']), sy, T.toque + 0.2); }
      else if (t < T.vai_fazendo) { celular(L.img.tarefaAfazer, 0, 1); toque(...centro(POS['botao-afazer']), 0, T.quero + 0.3); destaque(POS['botao-afazer'], 0, seg(t, T.quero - 0.4, T.quero)); }
      else { const sy = celular(L.img.orgFazendo, R, 1); destaque(POS['cartao-fazendo'], sy, seg(t, T.vai_fazendo, T.vai_fazendo + 0.3)); }
    }

    // ------------------------------------------------ I. concluir e ganhar XP (celular)
    function concluir(lt) {
      L.fundo(ctx, BEGE);
      kicker('TERMINOU?', 120, 150, seg(lt, 0.1, 0.5));
      const yb = cubo('MARQUE COMO PRONTO', 120, 180, 70, seg(lt, 0.1, 0.8), { maxW: 960 });
      passos([['Abra a tarefa de novo', T.terminou + 1.3], ['Toque em “Concluído”', T.concluido, true], ['Ela vai para “Pronto”', T.pronto]], 120, yb + 90);
      // o contador de XP
      if (t >= T.aprovar - 0.2) {
        const p = seg(t, T.xp, T.xp + 1.0), n = Math.round(10 * ease.saida(p));
        L.aplicarCarimbo(ctx, seg(t, T.aprovar - 0.2, T.aprovar + 0.1), 470, yb + 430, () => {
          ctx.fillStyle = VERDE; ctx.fillRect(160, yb + 350, 620, 150);
          L.texto(ctx, 'APROVADO', 470, yb + 400, { familia: FONTE.sub, peso: 600, tam: 34, cor: BEGE, alinhar: 'center', tracking: 6 });
          L.texto(ctx, `+${n} XP`, 470, yb + 480, { familia: FONTE.manchete, peso: 900, tam: 92, cor: AMA, alinhar: 'center', erro: TINTA, desloc: 4 });
        }, 61);
      }
      const R = 330;
      if (t < T.terminou + 1.6) { const sy = celular(L.img.orgFazendo, R, seg(lt, 0.1, 0.8)); toque(...centro(POS['cartao-fazendo']), sy, T.terminou + 1.3); }
      else if (t < T.pronto) { celular(L.img.tarefaFazendo, 0, 1); destaque(POS['botao-fazendo'], 0, seg(t, T.concluido - 0.4, T.concluido)); toque(...centro(POS['botao-fazendo']), 0, T.concluido + 0.3); }
      else { const sy = celular(L.img.orgPronto, R, 1); destaque(POS['cartao-pronto'], sy, seg(t, T.pronto, T.pronto + 0.3), VERDE); }
    }

    // ------------------------------------------------ J. mais ferramentas (celular)
    function ferramentas(lt) {
      L.fundo(ctx, BEGE);
      kicker('NA ÁREA DO MILITANTE', 120, 150, seg(lt, 0.1, 0.5));
      const yb = cubo('VOCÊ TAMBÉM PODE', 120, 180, 72, seg(lt, 0.1, 0.8), { maxW: 960 });
      const M = POS.mil;
      const IT = [['PUBLICAR ARTIGOS NO SITE', T.artigos, 'abrir-artigo'], ['CRIAR ARTES NO GERADOR', T.artes, 'abrir-gerador'], ['CONVIDAR NOVOS MILITANTES', T.convida, 'abrir-convite']];
      IT.forEach(([s, t0], i) => {
        const y = yb + 80 + i * 92, e = ease.saida(seg(t, t0 - 0.2, t0 + 0.3)); if (e <= 0) return;
        ctx.save(); ctx.globalAlpha = e; ctx.translate((1 - e) * -200, 0);
        ctx.fillStyle = i === 2 ? VERM : TINTA; ctx.fillRect(120, y - 50, 820, 72);
        L.texto(ctx, s, 150, y, { familia: FONTE.grotesca, peso: 700, tam: tamMax(s, FONTE.grotesca, 36, 700, 760), cor: BEGE });
        ctx.restore();
      });
      L.etiqueta(ctx, '+1 XP POR CONVITE', 760, yb + 380, seg(t, T.convite + 0.6, T.convite + 0.9), { cor: VERDE, tam: 38 });
      if (t >= T.convite + 3.5) faixa('QUEM JUNTA MAIS PONTOS VIRA DESTAQUE', 120, yb + 500, T.convite + 3.5, 900, AMA, TINTA, 36, 71);
      const atual = IT.filter(([, t0]) => t >= t0 - 0.2).pop();
      const r = rolar([[0, 2250], [T.convite + 3.3, 560]]);
      const sy = celular(L.img.mil, r, seg(lt, 0.1, 0.8));
      if (t < T.convite + 3.3 && atual) destaque(M[atual[2]], sy, seg(t, atual[1] - 0.2, atual[1] + 0.1));
      if (t >= T.convite + 3.3) destaque(M['engajados'], sy, seg(t, T.convite + 4.0, T.convite + 4.3));
    }

    // ------------------------------------------------ K. fim (CARTAZ)
    function fim(lt) {
      arquivo = false; sol(1300);
      carimbar('É ISSO, CAMARADA!', CX, 220, T.fim, BEGE, 76, FONTE.bloco, 81, { larg: 1200 });
      carimbar('AGORA É COM VOCÊ', CX, 390, T.fim + 1.3, AMA, 150, FONTE.manchete, 82, { larg: 1500, erro: VESC, desloc: 7 });
      L.aplicarCarimbo(ctx, seg(t, T.assisti, T.assisti + 0.3), CX, 540, () => {
        ctx.fillStyle = TINTA; ctx.fillRect(CX - 300 + 8, 488 + 8, 600, 110); ctx.fillStyle = AMA; ctx.fillRect(CX - 300, 488, 600, 110);
        L.texto(ctx, '✓ ASSISTI', CX, 568, { familia: FONTE.bloco, peso: 400, tam: 70, cor: TINTA, alinhar: 'center' });
      }, 83);
      if (t >= T.assisti + 0.6) L.texto(ctx, 'toque quando terminar o vídeo e conclua a sua formação', CX, 650, { familia: FONTE.maquina, peso: 400, tam: 32, cor: BEGE, alinhar: 'center' });
      carimbar('BEM-VINDO(A) À LUTA!', CX, 790, T.bemvindo, BEGE, 96, FONTE.manchete, 84, { larg: 1400, erro: VESC, desloc: 5 });
    }

    // ------------------------------------------------ L. tela final
    function final(lt) {
      arquivo = false; sol(1300);
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 430, () => L.imagem(ctx, L.img.lufa, CX, 430, 600), 97);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.6, 1.1);
      L.texto(ctx, 'NARRAÇÃO: LÉO DUARTE', CX, 880, { familia: FONTE.sub, peso: 600, tam: 46, cor: BEGE, alinhar: 'center', tracking: 4 });
      ctx.restore();
    }

    // ------------------------------------------------ desenho do quadro (depois das definições acima)
    const ordem = [[0, abre], [T.entrar, entrar], [T.topo, area], [T.nucleos, nucleos], [T.org, organizacao], [T.ident, identificacao],
      [T.quadro, quadro], [T.viu, pegar], [T.terminou, concluir], [T.mais, ferramentas], [T.fim, fim], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [0.3, T.nucleos, T.todos + 0.4, T.quadro, T.aprovar, T.xp, T.convite + 0.6, T.fim, T.assisti, T.bemvindo, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 8);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();

    [[T.entrar, BEGE, -24], [T.topo, BEGE, 24], [T.nucleos, BEGE, -24], [T.org, BEGE, 24], [T.ident, BEGE, -24], [T.quadro, BEGE, 24],
      [T.viu, BEGE, -24], [T.terminou, BEGE, 24], [T.mais, BEGE, -24], [T.fim, VERM, 24], [T.logo, VESC, -24]].forEach(([X, cor, ang]) => L.corteDiagonal(ctx, seg(t, X - 0.4, X), cor, ang));
    if (arquivo) L.varredura(ctx, t, 0.06);
    IMP.forEach(X => L.flash(ctx, t, X, AMA, 0.25, 0.2));
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);
    legenda();

  },
};
