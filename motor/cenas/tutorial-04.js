// FORMAÇÃO PARA NOVOS MILITANTES · EP. 4: Ideologia e filosofia dentro do coletivo (HORIZONTAL 1920×1080) · último episódio
// Começa lúdico: a criação do mundo numa história iorubá, em ILUSTRAÇÃO 2D (sem fotos): Olorum (luz), Oxalá descendo com a terra e a
// galinha-d'angola de cinco dedos, o barro de Nanã e o sopro da vida; Oxalufã (o velho, com o opaxorô) e Oxaguiã (o jovem guerreiro, com
// espada, escudo e pilão). Depois: o nome Lufã e a resistência (gravuras e fotos de época, domínio público, com crédito), capitalismo ×
// socialismo × comunismo (Marx, Engels e os livros em português), comunismo popular, sem purismo acadêmico, LGBTQIA+, viver é resistir,
// a paz (Oxalufã) e a luta (Oxaguiã), a esperança e o fim da formação.
const T = Object.assign({}, (window.TEMPOS || {}).marcas || {});

window.CENA = {
  w: 1920, h: 1080, fps: 30, dur: (window.TEMPOS || {}).dur || 315,
  imagens: {
    "kapital": "../midia/tutorial-04/das-kapital-1867.jpg",
    "valongo": "../midia/tutorial-04/valongo-debret.jpg",
    "botocudos": "../midia/tutorial-04/botocudos-debret.jpg",
    "cafezal": "../midia/tutorial-04/cafezal-ferrez.jpg",
    "oxalufa": "../midia/tutorial-04/oxalufa.png",
    "oxaguia": "../midia/tutorial-04/oxaguia.png",
    "lufa": "../midia/tutorial-03/logo-lufa-empilhado.png",
    "pomba": "../midia/tutorial-04/pomba.png",
    "marx": "../midia/tutorial-01/marx.jpg",
    "engels": "../midia/comunismo-01/engels-recorte.jpg",
    "manifesto": "../midia/tutorial-01/manifesto-1848.png",
    "navio": "../midia/tutorial-04/navio-negreiro-rugendas.jpg"
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

    // ================================================ ILUSTRAÇÕES (2D, sem fotos): Oxalá, Oxalufã, Oxaguiã, a galinha-d'angola
    // Seguindo as referências enviadas pelo autor: Oxalufã, velho, corpo grande e curvado, todo de branco, coroa de pontas, idés de prata,
    // avental de renda e o opaxorô (cajado com três "guarda-chuvas" de contas e o pássaro no alto), com a pomba por perto; Oxaguiã, jovem e
    // musculoso, um ombro de fora, branco com detalhes azuis, coroa alta com a pomba no medalhão azul, espada de metal e o atori.
    const BRANCO = '#F7F3EA', SOMBRA = '#D8D0BF', PRATA = '#C9CED6', PRATA2 = '#8E959F', PELE = '#5E3B26';
    // ---- partes do corpo, desenhadas com curvas (traço de tinta de cartaz)
    function tra(w = 4) { ctx.strokeStyle = TINTA; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; }
    function adê(cx, cy, s, o = {}) {   // a coroa (adê) com a franja de contas (filá) cobrindo o rosto
      tra(3 * s); ctx.fillStyle = PRATA;
      if (o.alto) {   // Oxaguiã: coroa alta, de topo reto, com o medalhão azul e a pomba
        ctx.beginPath(); ctx.moveTo(cx - 36 * s, cy); ctx.lineTo(cx - 52 * s, cy - 104 * s); ctx.lineTo(cx + 52 * s, cy - 104 * s); ctx.lineTo(cx + 36 * s, cy); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = PRATA2; ctx.fillRect(cx - 38 * s, cy - 10 * s, 76 * s, 10 * s); ctx.strokeRect(cx - 38 * s, cy - 10 * s, 76 * s, 10 * s);
        ctx.fillStyle = '#8EC5EA'; ctx.beginPath(); ctx.arc(cx, cy - 56 * s, 24 * s, 0, 7); ctx.fill(); ctx.stroke();
        ctx.fillStyle = BRANCO; ctx.beginPath(); ctx.ellipse(cx - 2 * s, cy - 54 * s, 11 * s, 6 * s, -0.2, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx - 4 * s, cy - 56 * s); ctx.quadraticCurveTo(cx - 18 * s, cy - 74 * s, cx + 4 * s, cy - 66 * s); ctx.fill(); ctx.beginPath(); ctx.arc(cx + 9 * s, cy - 58 * s, 4 * s, 0, 7); ctx.fill();
        ctx.fillStyle = '#2E7FB8'; ctx.beginPath(); ctx.arc(cx, cy - 18 * s, 4 * s, 0, 7); ctx.fill();
      } else {   // Oxalufã: coroa de pontas
        ctx.beginPath(); ctx.moveTo(cx - 40 * s, cy); ctx.lineTo(cx - 44 * s, cy - 50 * s);
        for (let i = 0; i < 6; i++) { const x0 = cx - 44 * s + (88 * s * i) / 6; ctx.lineTo(x0 + 7 * s, cy - 76 * s); ctx.lineTo(x0 + 14.6 * s, cy - 50 * s); }
        ctx.lineTo(cx + 40 * s, cy); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = PRATA2; ctx.fillRect(cx - 42 * s, cy - 14 * s, 84 * s, 10 * s);
        ctx.fillStyle = BRANCO; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(cx - 37 * s + i * 14.6 * s, cy - 70 * s, 3 * s, 0, 7); ctx.fill(); }
      }
      const azul = !!o.alto, longa = o.longa ? 1.6 : 1;
      for (let i = -6; i <= 6; i++) {   // a franja de contas (filá)
        const x = cx + i * 6.2 * s, comp = (54 - Math.abs(i) * 2.2) * s * longa;
        ctx.strokeStyle = 'rgba(28,23,20,0.35)'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x, cy + comp); ctx.stroke();
        let k2 = 0; for (let k = 5 * s; k < comp; k += 6.5 * s, k2++) { ctx.fillStyle = azul && (k2 + i) % 4 === 0 ? '#2E7FB8' : (i % 2 ? BRANCO : '#EDEDED'); ctx.beginPath(); ctx.arc(x, cy + k, 2.6 * s, 0, 7); ctx.fill(); }
      }
    }
    function cabeca(cx, cy, s, o = {}) {   // rosto coberto pelo filá; só o queixo e o pescoço aparecem
      ctx.fillStyle = PELE; tra(3 * s);
      ctx.fillRect(cx - 11 * s, cy + 44 * s, 22 * s, 24 * s);
      ctx.beginPath(); ctx.ellipse(cx, cy + 26 * s, 28 * s, 34 * s, 0, 0, 7); ctx.fill(); ctx.stroke();
      adê(cx, cy - 2 * s, s, o);
    }
    function colares(cx, cy, s, n = 4) {   // fios de contas brancos
      for (let k = 0; k < n; k++) { const r = (30 + k * 7) * s;
        ctx.fillStyle = k % 2 ? BRANCO : '#E8E2D2'; for (let a = 0.18; a <= 0.82; a += 0.035) { ctx.beginPath(); ctx.arc(cx + Math.cos(a * Math.PI) * r, cy - 18 * s + Math.sin(a * Math.PI) * r, 2.6 * s, 0, 7); ctx.fill(); } }
    }
    function bracoIde(x0, y0, x1, y1, s) {   // braço branco (manga bufante) com antebraço e idé (bracelete) de prata
      tra(3 * s);
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      ctx.fillStyle = BRANCO; ctx.beginPath(); ctx.ellipse((x0 + mx) / 2, (y0 + my) / 2, 20 * s, 16 * s, Math.atan2(y1 - y0, x1 - x0), 0, 7); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = TINTA; ctx.lineWidth = 15 * s; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.strokeStyle = PELE; ctx.lineWidth = 10 * s; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.strokeStyle = PRATA; ctx.lineWidth = 6 * s; const bx = lerp(mx, x1, 0.6), by = lerp(my, y1, 0.6);
      ctx.beginPath(); ctx.arc(bx, by, 6 * s, 0, 7); ctx.stroke();
      ctx.fillStyle = PELE; tra(2.5 * s); ctx.beginPath(); ctx.arc(x1, y1, 9 * s, 0, 7); ctx.fill(); ctx.stroke();
    }
    function saia(cx, top, base, larg, s, cintura = 46) {   // saia rodada em três camadas, com renda na barra
      tra(4 * s);
      [[1, BRANCO], [0.86, '#F1EBDD'], [0.7, BRANCO]].forEach(([f, cor], k) => {
        const b = top + (base - top) * (k === 0 ? 1 : k === 1 ? 0.8 : 0.55), L2 = larg * f;
        ctx.fillStyle = cor; ctx.beginPath(); ctx.moveTo(cx - cintura * s, top);
        ctx.bezierCurveTo(cx - cintura * s - 10 * s, top + (b - top) * 0.4, cx - L2 / 2, b - 30 * s, cx - L2 / 2, b);
        for (let i = 0; i <= 10; i++) { const x = cx - L2 / 2 + (L2 * i) / 10; ctx.quadraticCurveTo(x - L2 / 40, b + 12 * s, x, b); }
        ctx.bezierCurveTo(cx + L2 / 2, b - 30 * s, cx + cintura * s + 10 * s, top + (b - top) * 0.4, cx + cintura * s, top); ctx.closePath(); ctx.fill(); ctx.stroke();
      });
      ctx.strokeStyle = SOMBRA; ctx.lineWidth = 3 * s; [-0.25, 0, 0.25].forEach((f) => { ctx.beginPath(); ctx.moveTo(cx + f * 60 * s, top + 20 * s); ctx.quadraticCurveTo(cx + f * larg * 0.5, (top + base) / 2, cx + f * larg * 0.75, base - 10 * s); ctx.stroke(); });
    }
    function tronco(cx, top, base, s, larg = 44) {   // blusa branca com ombros arredondados
      tra(4 * s); ctx.fillStyle = BRANCO;
      ctx.beginPath(); ctx.moveTo(cx - (larg - 6) * s, base); ctx.bezierCurveTo(cx - (larg + 4) * s, base - 50 * s, cx - (larg + 8) * s, top + 20 * s, cx - 24 * s, top);
      ctx.lineTo(cx + 24 * s, top); ctx.bezierCurveTo(cx + (larg + 8) * s, top + 20 * s, cx + (larg + 4) * s, base - 50 * s, cx + (larg - 6) * s, base); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    function oja(cx, y, s, laco = true) {   // o ojá: pano amarrado no peito, com laço
      tra(3 * s); ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.moveTo(cx - 50 * s, y); ctx.quadraticCurveTo(cx, y + 14 * s, cx + 50 * s, y); ctx.lineTo(cx + 48 * s, y + 26 * s); ctx.quadraticCurveTo(cx, y + 40 * s, cx - 48 * s, y + 26 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
      if (laco) { ctx.beginPath(); ctx.ellipse(cx + 40 * s, y + 10 * s, 22 * s, 13 * s, -0.4, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(cx + 40 * s, y + 30 * s, 20 * s, 12 * s, 0.5, 0, 7); ctx.fill(); ctx.stroke(); }
    }
    function opaxoro(x, y0, y1, s) {   // o opaxorô: cajado de metal com três "guarda-chuvas" com franja de contas e o pássaro no alto
      tra(3 * s); ctx.fillStyle = PRATA;
      ctx.fillRect(x - 5 * s, y1, 10 * s, y0 - y1); ctx.strokeRect(x - 5 * s, y1, 10 * s, y0 - y1);
      [[200, 62], [110, 52], [30, 40]].forEach(([dy, r]) => {
        const yy = y1 + dy * s;
        for (let k = -r + 4; k <= r - 4; k += 7) {   // a franja de contas pendurada
          const comp = (26 + (Math.abs(k) % 3) * 3) * s;
          ctx.strokeStyle = PRATA2; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.moveTo(x + k * s, yy); ctx.lineTo(x + k * s, yy + comp); ctx.stroke();
          ctx.fillStyle = BRANCO; for (let q = 6 * s; q <= comp; q += 6 * s) { ctx.beginPath(); ctx.arc(x + k * s, yy + q, 2 * s, 0, 7); ctx.fill(); }
        }
        ctx.fillStyle = PRATA; tra(3 * s); ctx.beginPath(); ctx.moveTo(x - r * s, yy); ctx.bezierCurveTo(x - r * 0.7 * s, yy - 34 * s, x + r * 0.7 * s, yy - 34 * s, x + r * s, yy); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = PRATA2; ctx.fillRect(x - r * s, yy - 3 * s, 2 * r * s, 6 * s);
      });
      const by = y1 - 12 * s;   // o pássaro
      ctx.fillStyle = BRANCO; tra(2.5 * s); ctx.beginPath(); ctx.ellipse(x, by, 18 * s, 11 * s, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + 15 * s, by - 9 * s, 8 * s, 0, 7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 6 * s, by - 4 * s); ctx.quadraticCurveTo(x - 26 * s, by - 30 * s, x - 2 * s, by - 20 * s); ctx.fill(); ctx.stroke();
      ctx.fillStyle = AMA; ctx.beginPath(); ctx.moveTo(x + 22 * s, by - 10 * s); ctx.lineTo(x + 31 * s, by - 7 * s); ctx.lineTo(x + 22 * s, by - 5 * s); ctx.fill();
    }
    function bracoForte(x0, y0, x1, y1, s, esp = 1) {   // braço de pele (forte), com idé no braço e no pulso
      tra(3 * s);
      const mx = lerp(x0, x1, 0.48), my = lerp(y0, y1, 0.48);
      ctx.strokeStyle = TINTA; ctx.lineWidth = 34 * s * esp; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(mx, my); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.strokeStyle = PELE; ctx.lineWidth = 27 * s * esp; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(mx, my); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 8 * s; ctx.beginPath(); ctx.moveTo(lerp(x0, mx, 0.2), lerp(y0, my, 0.2) - 6 * s); ctx.lineTo(lerp(x0, mx, 0.8), lerp(y0, my, 0.8) - 6 * s); ctx.stroke();
      const ang = Math.atan2(y1 - y0, x1 - x0);
      [[lerp(x0, mx, 0.55), lerp(y0, my, 0.55)], [lerp(mx, x1, 0.8), lerp(my, y1, 0.8)]].forEach(([bx, by]) => {
        ctx.save(); ctx.translate(bx, by); ctx.rotate(ang); ctx.fillStyle = PRATA; tra(2.5 * s); ctx.fillRect(-7 * s, -17 * s * esp, 14 * s, 34 * s * esp); ctx.strokeRect(-7 * s, -17 * s * esp, 14 * s, 34 * s * esp); ctx.restore(); });
      ctx.fillStyle = PELE; tra(2.5 * s); ctx.beginPath(); ctx.arc(x1, y1, 15 * s * esp, 0, 7); ctx.fill(); ctx.stroke();
    }
    // as ilustrações finais (desenho próprio em alta resolução, motor/cenas/orixas-ilustracao.js, com acabamento de pintura)
    function figura(img, x, y, alt, rot = 0) {   // pés em (x, y), altura alt
      if (!img) return;
      const w = img.width * alt / img.height;
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      ctx.fillStyle = 'rgba(28,23,20,0.18)'; ctx.beginPath(); ctx.ellipse(0, 0, w * 0.42, alt * 0.025, 0, 0, 7); ctx.fill();
      ctx.drawImage(img, -w / 2, -alt, w, alt); ctx.restore();
    }
    function oxalufa(x, y, s = 1, balanca = 0) { figura(L.img.oxalufa, x, y, 640 * s, Math.sin(balanca) * 0.01); }
    function oxaguia(x, y, s = 1, brilho = 0) { figura(L.img.oxaguia, x, y, 680 * s, 0);
      if (brilho > 0) { ctx.save(); ctx.globalAlpha = brilho; L.estrela(ctx, x - 150 * s, y - 610 * s, 30 * s, 0, '#FFFFFF'); ctx.restore(); } }
    function oxala(x, y, s = 1) { figura(L.img.oxalufa, x, y, 560 * s, 0); }
    function galinha(x, y, s = 1, passo = 0) {   // galinha-d'angola: cinza com pintas brancas, cabeça azulada, barbela vermelha
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      const p = Math.sin(passo * Math.PI * 2) * 6;
      ctx.strokeStyle = '#7A6A55'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-10, -30); ctx.lineTo(-14 + p, 0); ctx.moveTo(10, -30); ctx.lineTo(14 - p, 0); ctx.stroke();
      ctx.fillStyle = '#4A4F57'; ctx.strokeStyle = TINTA; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(0, -62, 62, 42, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#F2F2F2'; for (let i = -50; i <= 50; i += 12) for (let j = -90; j <= -30; j += 11) if (((i / 50) ** 2 + ((j + 62) / 38) ** 2) < 0.9) { ctx.beginPath(); ctx.arc(i + (j % 2 ? 4 : 0), j, 2.6, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#4A4F57'; ctx.beginPath(); ctx.moveTo(40, -86); ctx.quadraticCurveTo(62, -110, 66, -128); ctx.lineTo(80, -126); ctx.quadraticCurveTo(76, -100, 58, -78); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#DCE7F2'; ctx.beginPath(); ctx.ellipse(76, -134, 14, 12, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#B07A3B'; ctx.beginPath(); ctx.moveTo(70, -144); ctx.lineTo(76, -164); ctx.lineTo(82, -144); ctx.fill();   // a crista (casco)
      ctx.fillStyle = VERM; ctx.beginPath(); ctx.ellipse(80, -120, 5, 8, 0, 0, 7); ctx.fill();   // barbela
      ctx.fillStyle = '#E8B04A'; ctx.beginPath(); ctx.moveTo(88, -136); ctx.lineTo(100, -132); ctx.lineTo(88, -128); ctx.fill();
      ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(78, -137, 2.5, 0, 7); ctx.fill();
      ctx.restore();
    }
    function peCinco(cx, cy, r, p) {   // destaque: o pé da galinha, com os CINCO dedos numerados
      if (p <= 0) return;
      ctx.save(); ctx.globalAlpha = clamp(p * 3);
      ctx.fillStyle = '#FFFFFF'; tra(5); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();
      const CORP = '#B7A68C', hx = cx, hy = cy - r * 0.05;
      ctx.strokeStyle = TINTA; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(hx, cy - r * 1.1); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.strokeStyle = CORP; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(hx, cy - r * 1.1); ctx.lineTo(hx, hy); ctx.stroke();
      const DED = [-1.0, -0.5, 0, 0.5, 1.0];
      DED.forEach((a, i) => { const k = ease.saida(clamp(p * 5 - i * 0.55)); if (k <= 0) return;
        const ex = hx + Math.sin(a) * r * 0.66 * k, ey = hy + Math.cos(a) * r * 0.62 * k;
        ctx.strokeStyle = TINTA; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.strokeStyle = CORP; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(ex + Math.sin(a) * 8, ey + Math.cos(a) * 8, 6, 0, 7); ctx.fill();   // a unha
        L.texto(ctx, String(i + 1), hx + Math.sin(a) * r * 0.85, hy + Math.cos(a) * r * 0.8 + 10, { familia: FONTE.manchete, peso: 900, tam: 34, cor: VERM, alinhar: 'center' }); });
      ctx.restore();
      L.etiqueta(ctx, 'CINCO DEDOS EM CADA PÉ', cx, cy + r + 44, clamp(p * 3 - 1.2), { cor: VERM, tam: 30 });
      if (p > 0.6) L.texto(ctx, 'as galinhas comuns têm quatro', cx, cy + r + 100, { familia: FONTE.maquina, peso: 400, tam: 24, cor: TINTA, alinhar: 'center' });
    }

    // ------------------------------------------------ foto histórica em moldura dourada, com crédito embaixo (só se a imagem existir)
    function quadro(k, x, y, w, h, t0, legenda, credito, o = {}) {
      const img = L.img[k]; if (!img) return;
      const e = ease.saida(seg(t, t0, t0 + 0.5)); if (e <= 0) return;
      ctx.save(); ctx.globalAlpha = clamp(e * 2); ctx.translate(0, (1 - e) * 80);
      L.moldura(ctx, x, y, w, h, 22);
      L.foto(ctx, img, x, y, w, h, { pb: o.pb ?? true, zoom: lerp(1, 1.06, seg(t, t0, t0 + 6)), desfoque: (1 - seg(t, t0, t0 + 0.6)) * 8 });
      if (legenda) L.texto(ctx, legenda, x + w / 2, y + h + 66, { familia: FONTE.grotesca, peso: 700, tam: tamMax(legenda, FONTE.grotesca, 28, 700, w + 40), cor: TINTA, alinhar: 'center' });
      if (credito) L.texto(ctx, credito, x + w / 2, y + h + 100, { familia: FONTE.maquina, peso: 400, tam: tamMax(credito, FONTE.maquina, 20, 400, w + 40), cor: TINTA, alinhar: 'center' });
      ctx.restore();
    }
    // livro em português (desenho nosso, inspirado nas primeiras edições; não é a capa de nenhuma editora)
    function livro(x, y, w, h, titulo, autor, ano, cor, t0, rot = 0) {
      const e = ease.saida(seg(t, t0, t0 + 0.45)); if (e <= 0) return;
      ctx.save(); ctx.translate(x + w / 2, y + h / 2 + (1 - e) * 300); ctx.rotate(rot); ctx.globalAlpha = clamp(e * 2);
      ctx.fillStyle = 'rgba(28,23,20,0.35)'; ctx.fillRect(-w / 2 + 10, -h / 2 + 12, w, h);
      ctx.fillStyle = cor; ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-w / 2, -h / 2, 14, h);
      ctx.strokeStyle = AMA; ctx.lineWidth = 3; ctx.strokeRect(-w / 2 + 24, -h / 2 + 14, w - 38, h - 28);
      const linhas = titulo.split('\n');
      linhas.forEach((l, i) => L.texto(ctx, l, 7, -h / 2 + 90 + i * 40, { familia: FONTE.manchete, peso: 900, tam: tamMax(l, FONTE.manchete, 40, 900, w - 60), cor: AMA, alinhar: 'center' }));
      L.estrela(ctx, 7, h / 2 - 110, 22, 0, AMA);
      L.texto(ctx, autor, 7, h / 2 - 54, { familia: FONTE.sub, peso: 600, tam: tamMax(autor, FONTE.sub, 22, 600, w - 60), cor: BEGE, alinhar: 'center' });
      L.texto(ctx, ano, 7, h / 2 - 26, { familia: FONTE.maquina, peso: 400, tam: 20, cor: BEGE, alinhar: 'center' });
      ctx.restore();
    }
    function xis(x, y, r, p, cor = VERM, lw = 14) {
      if (p <= 0) return;
      ctx.save(); ctx.strokeStyle = cor; ctx.lineWidth = lw; ctx.lineCap = 'round';
      const a = clamp(p * 2), b = clamp(p * 2 - 1);
      ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x - r + 2 * r * a, y - r + 2 * r * a); ctx.stroke();
      if (b > 0) { ctx.beginPath(); ctx.moveTo(x + r, y - r); ctx.lineTo(x + r - 2 * r * b, y - r + 2 * r * b); ctx.stroke(); }
      ctx.restore();
    }
    function etq(txt, x, y, t0, cor = TINTA, tam = 32) { L.etiqueta(ctx, txt, x, y, seg(t, t0, t0 + 0.3), { cor, tam }); }

    // ------------------------------------------------ 1. a criação do mundo (ilustração)
    function criacao(lt) {
      arquivo = false;
      // céu (bege dourado) e águas
      const gc = ctx.createLinearGradient(0, 0, 0, 1080); gc.addColorStop(0, '#F3E6C6'); gc.addColorStop(0.62, '#EBD9AE'); gc.addColorStop(0.62, '#2B4F78'); gc.addColorStop(1, '#1F3A5F');
      ctx.fillStyle = gc; ctx.fillRect(0, 0, 1920, 1080);
      for (let i = 0; i < 9; i++) { const y = 700 + i * 42, d = Math.sin(t * 1.4 + i) * 30; ctx.strokeStyle = 'rgba(237,224,196,0.25)'; ctx.lineWidth = 3; ctx.beginPath();
        for (let x = -40; x < 1960; x += 40) ctx.lineTo(x + d, y + Math.sin(x / 60 + t * 2 + i) * 5); ctx.stroke(); }
      // Olorum: luz no alto do céu (não tem rosto)
      const po = ease.saida(seg(t, T.olorum - 0.3, T.olorum + 0.8));
      if (po > 0) { ctx.save(); ctx.globalAlpha = po; L.raios(ctx, 960, -60, 900, 18, t * 0.05, 'rgba(235,181,42,0.35)');
        ctx.fillStyle = AMA; ctx.beginPath(); ctx.arc(960, -60, 150, 0, 7); ctx.fill(); ctx.restore();
        L.etiqueta(ctx, 'OLORUM, O SENHOR DO CÉU', 960, 150, seg(t, T.olorum + 0.2, T.olorum + 0.5), { cor: TINTA, tam: 28 }); }
      kicker('UMA HISTÓRIA IORUBÁ', 80, 80, seg(lt, 0.3, 1.2), TINTA);
      // a terra: cresce do montinho até virar chão
      const pt = seg(t, T.caiu, T.caiu + 1.2), pc = ease.saida(seg(t, T.ciscou, T.firme));
      if (pt > 0) { const lar = lerp(160, 1960, pc), alt = lerp(110 * pt, 140, pc);
        ctx.fillStyle = '#8A5A34'; ctx.strokeStyle = TINTA; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(960 - lar / 2, 700); ctx.quadraticCurveTo(960, 700 - alt * 2, 960 + lar / 2, 700); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#3F5A2E'; if (pc > 0.6) { ctx.globalAlpha = (pc - 0.6) / 0.4; ctx.fillRect(0, 676, 1920, 10); ctx.globalAlpha = 1; } }
      etq('TERRA FIRME', 960, 760, T.firme, VERM, 34);
      // Oxalá desce do céu pela corrente, com o saco de terra
      const pd = ease.saida(seg(t, T.desceu - 0.2, T.desceu + 2.2));
      if (t < T.modelou) {
        const oy = lerp(-120, 690, pd), ox = 640;
        ctx.strokeStyle = PRATA2; ctx.lineWidth = 5; ctx.setLineDash([12, 8]); ctx.beginPath(); ctx.moveTo(ox, -20); ctx.lineTo(ox, oy - 330); ctx.stroke(); ctx.setLineDash([]);
        if (pd > 0) { oxala(ox, oy, 1.15);
          if (t < T.caiu) { ctx.fillStyle = '#8A5A34'; ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(ox + 90, oy - 250, 40, 50, 0, 0, 7); ctx.fill(); ctx.stroke(); } }
        // a terra caindo do saco
        if (t >= T.caiu && t < T.caiu + 1.2) for (let i = 0; i < 14; i++) { const k = (seg(t, T.caiu + i * 0.05, T.caiu + 0.8 + i * 0.05)); if (k <= 0 || k >= 1) continue;
          ctx.fillStyle = '#8A5A34'; ctx.beginPath(); ctx.arc(lerp(ox + 90, 960 + (i - 7) * 14, k), lerp(oy - 250, 680, k * k), 8, 0, 7); ctx.fill(); }
        // a galinha-d'angola
        const pg = ease.saida(seg(t, T.galinha - 0.2, T.galinha + 0.5));
        if (pg > 0) { const gx = t < T.ciscou ? ox + 150 : lerp(ox + 150, 1160 + Math.sin(t * 3) * 120, ease.saida(seg(t, T.ciscou, T.ciscou + 1))), gy = t < T.ciscou ? Math.max(oy - 40, 690) - (1 - pg) * 40 : 690;
          galinha(gx, gy, 1.45, t >= T.ciscou ? t * 1.5 : 0);
          L.etiqueta(ctx, "GALINHA-D'ANGOLA", gx + 40, gy - 270, seg(t, T.galinha + 0.3, T.galinha + 0.6), { cor: AZUL, tam: 26 }); }
        peCinco(1560, 330, 150, seg(t, T.cinco, T.cinco + 1.5) * (t < T.caiu + 0.5 ? 1 : clamp((T.caiu + 1.2 - t) / 0.7)));
        if (t >= T.ciscou) for (let i = 0; i < 6; i++) { const ph = (t * 1.4 + i * 0.3) % 1; ctx.globalAlpha = 1 - ph; ctx.fillStyle = '#8A5A34'; ctx.beginPath(); ctx.arc(1100 + Math.sin(i * 9) * 300 + ph * 60, 690 - ph * 40, 6, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
      } else {
        // Oxalá modela os seres humanos com o barro de Nanã; Olorum dá o sopro da vida
        const pm = seg(t, T.modelou, T.modelou + 0.6);
        oxala(560, 690, 1.15);
        [[900, 0], [1080, 1], [1260, 2], [1440, 3]].forEach(([x, i]) => {
          const pf = seg(t, T.modelou + 0.6 + i * 0.6, T.modelou + 1.4 + i * 0.6); if (pf <= 0) return;
          const vivo = seg(t, T.sopro + i * 0.25, T.sopro + 0.6 + i * 0.25);
          ctx.save(); ctx.globalAlpha = clamp(pf * 2);
          const corpo = { roupa: vivo > 0.5 ? GENTE[i].roupa : '#7A5230', pele: vivo > 0.5 ? GENTE[i].pele : '#8A5A34', calca: vivo > 0.5 ? TINTA : '#6B4A2E' };
          pessoa(x, 690, corpo, 1.05 * ease.saida(pf), 0);
          ctx.restore();
          if (vivo > 0 && vivo < 1) { ctx.save(); ctx.globalAlpha = 1 - vivo; ctx.strokeStyle = AMA; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(960, 0); ctx.lineTo(x, 470); ctx.stroke(); ctx.restore(); }
        });
        etq('O BARRO DE NANÃ', 1170, 790, T.nana, '#5B3F7A', 30);
        etq('O SOPRO DA VIDA', 1170, 860, T.sopro + 0.3, VERM, 30);
        if (t >= T.pai) {   // o pai da criação: de branco, a paz (e a pomba, como no nosso logo)
          const pp = ease.saida(seg(t, T.pai, T.pai + 0.6));
          ctx.save(); ctx.globalAlpha = pp; ctx.fillStyle = BEGE; ctx.fillRect(0, 0, 1920, 1080); L.raios(ctx, 960, 1180, 2600, 24, t * 0.02, 'rgba(235,181,42,0.18)'); ctx.restore();
          oxala(960, 910, 1.55 * pp + 0.001);
          const vx = lerp(1250, 1500, seg(t, T.pai + 0.5, T.pai + 4)), vy = 260 + Math.sin(t * 3) * 20;
          if (pp > 0.5) { ctx.save(); ctx.globalAlpha = (pp - 0.5) * 2; L.imagem(ctx, L.img.pomba, vx, vy - 60, 170); ctx.restore(); }
          etq('PAI DA CRIAÇÃO', 520, 470, T.pai + 0.4, TINTA, 40); etq('VESTIDO DE BRANCO', 520, 560, T.branco, PRATA2, 34); etq('A PAZ', 1400, 560, T.branco + 0.9, AZUL, 44);
        }
      }
    }

    // ------------------------------------------------ 2. as duas faces de Oxalá
    function faces(lt) {
      L.fundo(ctx, BEGE);
      kicker('OXALÁ TEM DUAS FACES', 120, 150, seg(lt, 0.1, 0.6));
      ctx.fillStyle = 'rgba(31,58,95,0.06)'; ctx.fillRect(960, 0, 960, 1080);
      ctx.fillStyle = TINTA; ctx.fillRect(957, 220, 6, 700);
      const pl = ease.saida(seg(t, T.lufa_face - 0.2, T.lufa_face + 0.6));
      if (pl > 0) { ctx.save(); ctx.globalAlpha = pl; oxalufa(480, 920, 1.04, t * 1.2); ctx.restore();
        cubo('OXALUFÃ', 120, 180, 64, seg(t, T.lufa_face, T.lufa_face + 0.6), { maxW: 600 });
        etq('O VELHO SÁBIO', 760, 420, T.lufa_face + 1.4, TINTA, 28); etq('O OPAXORÔ', 770, 340, T.opaxoro, TINTA, 28); etq('TRAZ A PAZ', 760, 500, T.opaxoro + 1.1, AZUL, 32); }
      const pr = ease.saida(seg(t, T.guia - 0.2, T.guia + 0.6));
      if (pr > 0) { ctx.save(); ctx.globalAlpha = pr; oxaguia(1460, 920, 1.05, seg(t, T.espada, T.espada + 0.4) * (1 - seg(t, T.espada + 0.4, T.espada + 0.9))); ctx.restore();
        cubo('OXAGUIÃ', 1040, 180, 64, seg(t, T.guia, T.guia + 0.6), { maxW: 600 });
        etq('O JOVEM GUERREIRO', 1180, 340, T.guia + 1.0, TINTA, 28); etq('ESPADA DE METAL E ATORI', 1740, 500, T.espada, TINTA, 24); etq('LUTA QUANDO É PRECISO', 1180, 420, T.luta1, VERM, 28); }
      if (t > T.guia + 1) L.texto(ctx, 'ilustração · iconografia segundo Pierre Verger (Orixás) e Reginaldo Prandi (Mitologia dos Orixás)', 960, 1050, { familia: FONTE.maquina, peso: 400, tam: 18, cor: TINTA, alinhar: 'center' });
    }

    // ------------------------------------------------ 3. o nome (CARTAZ)
    function nome(lt) {
      arquivo = false; sol(1300);
      const pn = seg(t, T.lufan - 0.3, T.lufan + 0.3), pl = seg(t, T.lufan + 1.0, T.lufan + 1.6);
      if (pl > 0) { ctx.save(); ctx.globalAlpha = pl * 0.85; L.texto(ctx, 'OXA', 840, 395, { familia: FONTE.manchete, peso: 900, tam: 190, cor: VESC, alinhar: 'right' }); ctx.restore(); }
      if (pn > 0) cubo('LUFÃ', 860, 240, 150, pn, { maxW: 700 });
      if (pl > 0) { ctx.save(); ctx.globalAlpha = pl; L.texto(ctx, 'do orixá OXALUFÃ', 1180, 545, { familia: FONTE.sub, peso: 600, tam: 44, cor: BEGE, alinhar: 'center', tracking: 3 }); ctx.restore(); }
      L.aplicarCarimbo(ctx, seg(t, T.lufan + 0.6, T.lufan + 0.9), 330, 380, () => L.imagem(ctx, L.img.lufa, 330, 380, 360), 32);
      faixa('BUSCAR A PAZ SEM NEGAR A LUTA', 260, 720, T.filosofia + 0.6, 1400, BEGE, VERM, 54, 33);
    }

    // ------------------------------------------------ 4. a resistência (ARQUIVO, gravuras e fotos de época)
    function resistencia(lt) {
      L.fundo(ctx, BEGE);
      kicker('O NOME LUFÃ LEMBRA', 120, 150, seg(lt, 0.1, 0.5));
      cubo('NÃO FOI SÓ UMA ESCOLHA RELIGIOSA', 120, 180, 56, seg(lt, 0.1, 0.9), { maxW: 1300 });
      const X = 130, Y = 340, Wf = 860, Hf = 470;
      const Q = [['navio', T.africanos - 0.6, 'A travessia forçada: africanos escravizados no porão de um navio negreiro', 'Johann Moritz Rugendas, "Navio negreiro", c. 1830 · domínio público'],
        ['valongo', T.mercadoria - 1.6, 'Vendidos como mercadoria: o mercado do Valongo, Rio de Janeiro', 'Jean-Baptiste Debret, c. 1835 · domínio público'],
        ['botocudos', T.indigenas - 0.4, 'Povos indígenas retratados no século XIX', 'Jean-Baptiste Debret, "Botocudos, Puris, Pataxós e Machacalis", 1834 · domínio público'],
        ['cafezal', T.vulneraveis - 0.6, 'Trabalho escravizado numa fazenda de café', 'Marc Ferrez, c. 1882 · domínio público']].filter(([k]) => L.img[k]);
      const atual = Q.filter(([, t0]) => t >= t0).pop();
      if (atual) quadro(atual[0], X, Y, Wf, Hf, atual[1], atual[2], atual[3]);
      const R = 1130;
      [['POVOS AFRICANOS', T.africanos, VERM], ['TRATADOS COMO MERCADORIA', T.mercadoria, TINTA], ['POVOS INDÍGENAS', T.indigenas, VERM], ['DESPIDOS DA SUA HUMANIDADE', T.indigenas + 1.6, TINTA],
        ['POVOS DE TERREIRO', T.terreiro, VERM], ['OS MAIS VULNERÁVEIS', T.vulneraveis, TINTA]].forEach(([s2, t0, cor], i) => {
        const e = ease.saida(seg(t, t0, t0 + 0.4)); if (e <= 0) return;
        const y = 380 + i * 80; ctx.save(); ctx.globalAlpha = e; ctx.translate((1 - e) * 120, 0);
        ctx.fillStyle = cor; ctx.fillRect(R, y - 46, 640, 62);
        L.texto(ctx, s2, R + 26, y - 4, { familia: FONTE.grotesca, peso: 700, tam: tamMax(s2, FONTE.grotesca, 32, 700, 590), cor: BEGE });
        ctx.restore();
      });
      if (t >= T.poder - 1.2) L.aplicarCarimbo(ctx, seg(t, T.poder - 0.2, T.poder + 0.1), 1450, 880, () => {
        ctx.save(); ctx.translate(1450, 880); ctx.rotate(-0.05); ctx.strokeStyle = VERM; ctx.lineWidth = 8; ctx.strokeRect(-320, -56, 640, 112);
        L.texto(ctx, 'EM NOME DO PODER E DO LUCRO', 0, 16, { familia: FONTE.bloco, peso: 400, tam: 40, cor: VERM, alinhar: 'center' }); ctx.restore();
      }, 41);
    }

    // ------------------------------------------------ 5. capitalismo, socialismo, comunismo (ARQUIVO)
    function tres(lt) {
      L.fundo(ctx, BEGE);
      if (t < T.no_cap) {   // Marx e Engels, para situar
        kicker('PARA ENTENDER', 120, 150, seg(lt, 0.1, 0.5));
        cubo('TRÊS PALAVRAS', 120, 180, 70, seg(lt, 0.1, 0.8), { maxW: 900 });
        quadro('marx', 1120, 250, 300, 380, T.tres + 0.4, 'KARL MARX', 'J. J. E. Mayall, 1875 · domínio público');
        quadro('engels', 1500, 250, 300, 380, T.tres + 1.0, 'FRIEDRICH ENGELS', 'retrato de época · domínio público');
        [['CAPITALISMO', T.p_cap, TINTA], ['SOCIALISMO', T.p_soc, VERM], ['COMUNISMO', T.p_com, VERM]].forEach(([s2, t0, cor], i) =>
          carimbar(s2, 520, 470 + i * 140, t0, cor, 110, FONTE.manchete, 50 + i, { larg: 800, alinhar: 'center' }));
        return;
      }
      if (t < T.soc) {   // capitalismo: a pirâmide
        kicker('NO CAPITALISMO', 120, 150, seg(t, T.no_cap, T.no_cap + 0.5));
        cubo('O CAPITAL NO CENTRO', 120, 180, 66, seg(t, T.no_cap, T.no_cap + 0.8), { maxW: 900 });
        const pd = ease.saida(seg(t, T.donos - 0.3, T.donos + 0.4));
        ctx.save(); ctx.globalAlpha = pd;
        ctx.fillStyle = '#E3D5B5'; ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(1380, 330); ctx.lineTo(1800, 880); ctx.lineTo(960, 880); ctx.closePath(); ctx.fill(); ctx.stroke();
        pessoa(1380, 470, { roupa: TINTA, pele: '#E0B48A', chapeu: 'bone' }, 0.7, 0);
        ctx.fillStyle = TINTA; ctx.fillRect(1356, 290, 48, 34); ctx.fillRect(1344, 320, 72, 8);   // cartola
        [1060, 1180, 1300, 1420, 1540, 1660].forEach((x, i) => pessoa(x, 870, GENTE[(i % 5) + 1], 0.75, 0));
        ctx.restore();
        etq('POUCOS SÃO DONOS', 1380, 250, T.donos, TINTA, 30); etq('A MAIORIA VENDE O SEU TRABALHO', 1380, 940 - 20, T.salario - 1.2, VERM, 28);
        if (t >= T.lucro) for (let i = 0; i < 5; i++) { const ph = ((t - T.lucro) * 0.8 + i * 0.2) % 1; ctx.fillStyle = AMA; ctx.strokeStyle = TINTA; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(lerp(1100 + i * 120, 1380, ph), lerp(760, 500, ph), 16, 0, 7); ctx.fill(); ctx.stroke(); }
        etq('O LUCRO FICA COM O DONO', 1380, 400 - 40, T.lucro + 0.3, AMA, 26);
        [['MORADIA', T.merc2 - 2.0], ['COMIDA', T.merc2 - 1.4], ['SAÚDE', T.merc2 - 0.8]].forEach(([s2, t0], i) => {
          const e = ease.saida(seg(t, t0, t0 + 0.4)); if (e <= 0) return;
          const x = 140 + i * 270, y = 480; ctx.save(); ctx.globalAlpha = e;
          ctx.fillStyle = '#F2E7CF'; ctx.fillRect(x, y, 230, 200); ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.strokeRect(x, y, 230, 200);
          L.texto(ctx, s2, x + 115, y + 120, { familia: FONTE.bloco, peso: 400, tam: 40, cor: TINTA, alinhar: 'center' });
          ctx.restore();
          L.etiqueta(ctx, 'R$ $$$', x + 190, y + 10, seg(t, T.merc2, T.merc2 + 0.3), { cor: VERM, tam: 24 });
        });
        etq('TUDO VIRA MERCADORIA', 520, 780, T.merc2 + 0.3, VERM, 34);
        return;
      }
      if (t < T.com) {   // socialismo
        kicker('O SOCIALISMO', 120, 150, seg(t, T.soc, T.soc + 0.5));
        cubo('O CAMINHO PARA MUDAR', 120, 180, 66, seg(t, T.soc, T.soc + 0.8), { maxW: 900 });
        const pf = ease.saida(seg(t, T.soc + 0.3, T.soc + 1));
        ctx.save(); ctx.globalAlpha = pf;
        ctx.fillStyle = TINTA; ctx.fillRect(1180, 520, 420, 260); ctx.beginPath(); ctx.moveTo(1180, 520); ctx.lineTo(1260, 440); ctx.lineTo(1260, 520); ctx.lineTo(1340, 440); ctx.lineTo(1340, 520); ctx.lineTo(1420, 440); ctx.lineTo(1420, 520); ctx.fill();
        ctx.fillRect(1500, 360, 40, 160); ctx.fillStyle = AMA; for (let i = 0; i < 4; i++) ctx.fillRect(1220 + i * 95, 600, 50, 50);
        ctx.fillStyle = TINTA; ctx.fillRect(1540, 270, 8, 120); L.bandeira(ctx, 1548, 272, 150, 90, t, VERM); L.estrela(ctx, 1600, 316, 20, 0, AMA);
        ctx.restore();
        etq('OS MEIOS DE PRODUÇÃO PASSAM A SER DE TODOS', 1390, 860, T.meios, VERM, 26);
        if (t >= T.riqueza) for (let i = 0; i < 6; i++) { const ph = ((t - T.riqueza) * 0.7 + i * 0.17) % 1; ctx.fillStyle = AMA; ctx.strokeStyle = TINTA; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(lerp(1390, 300 + i * 120, ph), lerp(600, 700, ph), 14, 0, 7); ctx.fill(); ctx.stroke(); }
        [[200, 0], [340, 1], [480, 2], [620, 3], [760, 4]].forEach(([x, i]) => { const p = seg(t, T.riqueza - 0.3 + i * 0.12, T.riqueza + 0.3 + i * 0.12); if (p > 0) pessoa(x, 860, GENTE[i], 0.8, 0); });
        etq('A RIQUEZA VOLTA PARA QUEM TRABALHA', 480, 560, T.riqueza + 0.6, TINTA, 28);
        return;
      }
      // comunismo: sem classes; a frase de Marx; os livros (em português)
      kicker('O COMUNISMO', 120, 150, seg(t, T.com, T.com + 0.5));
      cubo('ONDE QUEREMOS CHEGAR', 120, 180, 66, seg(t, T.com, T.com + 0.8), { maxW: 900 });
      etq('SEM CLASSES', 300, 400, T.sem_classe, VERM, 34); etq('SEM EXPLORAÇÃO', 640, 400, T.exploracao, TINTA, 34);
      [0, 1, 2, 3, 4].forEach((i) => { const p = seg(t, T.sem_classe + i * 0.1, T.sem_classe + 0.4 + i * 0.1); if (p > 0) pessoa(200 + i * 150, 720, GENTE[i], 0.8, 0); });
      ctx.fillStyle = TINTA; ctx.fillRect(110, 722, 760, 6);
      if (t >= T.cada) {
        ctx.fillStyle = '#F2E7CF'; ctx.fillRect(110, 770, 820, 130); ctx.fillStyle = VERM; ctx.fillRect(110, 770, 10, 130);
        L.texto(ctx, L.datilografar('“De cada um segundo suas capacidades,', seg(t, T.cada, T.cada + 0.9)), 140, 820, { familia: FONTE.maquina, peso: 400, tam: 28, cor: TINTA });
        L.texto(ctx, L.datilografar('a cada um segundo suas necessidades.”', seg(t, T.cada + 0.9, T.cada + 1.8)), 140, 860, { familia: FONTE.maquina, peso: 400, tam: 28, cor: TINTA });
        L.texto(ctx, 'Karl Marx, Crítica do Programa de Gotha (1875)', 140, 892, { familia: FONTE.maquina, peso: 400, tam: 18, cor: VERM });
      }
      // a estante: os livros do marxismo-leninismo, em português
      livro(1010, 330, 210, 300, 'MANIFESTO\nDO PARTIDO\nCOMUNISTA', 'MARX E ENGELS', '1848', VERM, T.com + 0.6, -0.04);
      livro(1250, 330, 210, 300, 'O\nCAPITAL', 'KARL MARX', '1867', TINTA, T.com + 1.1, 0.02);
      livro(1490, 330, 210, 300, 'CRÍTICA DO\nPROGRAMA\nDE GOTHA', 'KARL MARX', '1875', '#7A1512', T.com + 1.6, -0.02);
      livro(1490 + 0, 660, 210, 300, 'O ESTADO\nE A\nREVOLUÇÃO', 'V. I. LÊNIN', '1917', AZUL, T.com + 2.1, 0.03);
      quadro('manifesto', 1040, 670, 150, 220, T.com + 2.6, null, null, { pb: false });
      quadro('kapital', 1270, 670, 160, 220, T.com + 3.0, null, null, { pb: false });
      if (t > T.com + 3.2) L.texto(ctx, 'livros: desenho nosso dos títulos em português · embaixo, as 1ªs edições (1848 e 1867), domínio público', 960, 1050, { familia: FONTE.maquina, peso: 400, tam: 16, cor: TINTA, alinhar: 'center' });
    }

    // ------------------------------------------------ 6. comunismo popular (ARQUIVO)
    function popular(lt) {
      L.fundo(ctx, BEGE);
      kicker('AQUI NO COLETIVO', 120, 150, seg(lt, 0.1, 0.5));
      cubo('COMUNISMO POPULAR', 120, 180, 70, seg(lt, 0.1, 0.8), { maxW: 1000 });
      if (t >= T.marx - 0.4) { const e = ease.saida(seg(t, T.marx - 0.4, T.marx + 0.1));
        ctx.save(); ctx.translate(1500, 420 + (1 - e) * 500); ctx.rotate(0.05);
        ctx.fillStyle = VERM; ctx.fillRect(-120, -160, 240, 320); ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.strokeRect(-120, -160, 240, 320);
        L.texto(ctx, 'O CAPITAL', 0, -30, { familia: FONTE.manchete, peso: 900, tam: 50, cor: AMA, alinhar: 'center' }); L.texto(ctx, 'KARL MARX', 0, 20, { familia: FONTE.sub, peso: 600, tam: 26, cor: BEGE, alinhar: 'center' });
        ctx.restore(); xis(1500, 420, 120, seg(t, T.marx + 0.3, T.marx + 0.8), TINTA, 12); }
      if (t >= T.milhoes - 0.2) {
        const n = (8.4 * ease.saida(seg(t, T.milhoes - 0.2, T.milhoes + 1.0))).toFixed(1).replace('.', ',');
        L.aplicarCarimbo(ctx, seg(t, T.milhoes - 0.2, T.milhoes + 0.1), 520, 470, () => {
          ctx.fillStyle = TINTA; ctx.fillRect(120, 380, 800, 190);
          L.texto(ctx, `${n} MILHÕES`, 520, 490, { familia: FONTE.manchete, peso: 900, tam: 110, cor: AMA, alinhar: 'center' });
          L.texto(ctx, 'de pessoas não sabem ler nem escrever', 520, 545, { familia: FONTE.maquina, peso: 400, tam: 30, cor: BEGE, alinhar: 'center' });
        }, 61);
        L.texto(ctx, 'IBGE, PNAD Contínua 2025 (15 anos ou mais)', 520, 600, { familia: FONTE.maquina, peso: 400, tam: 20, cor: TINTA, alinhar: 'center' });
      }
      [['MORADIA DIGNA', T.moradia], ['COMIDA', T.comida], ['EDUCAÇÃO', T.educacao], ['UM BOM TRABALHO', T.trabalho], ['UMA BOA CASA', T.casa],
        ['VIVER SEM REPRESSÃO', T.repressao], ['LAZER (É DIREITO)', T.lazer]].forEach(([s2, t0], i) =>
        etq(s2, 260 + (i % 3) * 330, 690 + Math.floor(i / 3) * 80, t0 - 0.1, [VERM, TINTA, AZUL][i % 3], 30));
      if (t >= T.sonhos) faixa('ESSES SONHOS SÃO A RESISTÊNCIA DOS POVOS DESTA TERRA', 1000, 860, T.sonhos + 0.4, 820, VERM, BEGE, 30, 62);
    }

    // ------------------------------------------------ 7. sem purismo acadêmico (ARQUIVO)
    function purismo(lt) {
      L.fundo(ctx, BEGE);
      kicker('POR ISSO', 120, 150, seg(lt, 0.1, 0.5));
      cubo('O PURISMO AFASTA', 120, 180, 72, seg(lt, 0.1, 0.8), { maxW: 900 });
      // o livrão fechado, com letrinhas miúdas, e as pessoas indo embora
      const pa = seg(t, T.afasta - 1.5, T.afasta);
      ctx.fillStyle = '#E8DAB8'; ctx.fillRect(160, 420, 360, 440); ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.strokeRect(160, 420, 360, 440);
      ctx.fillStyle = TINTA; for (let i = 0; i < 26; i++) ctx.fillRect(190, 450 + i * 15, 300 - (i % 4) * 30, 3);
      [0, 1].forEach((i) => pessoa(620 + i * 130 + pa * 240, 860, GENTE[i + 2], 0.8, pa * 3));
      if (t >= T.identificadas - 1.4) etq('REPRESENTADAS E IDENTIFICADAS', 1380, 330, T.identificadas - 1.4, VERM, 32);
      const G = [['SOCIALISTAS PRETOS', T.pretos, 1], ['COMUNISTAS POBRES', T.pobres, 4], ['TRABALHADORES', T.fascismo + 1.0, 2], ['ESTUDANTES', T.mulher - 0.6, 3], ['MULHERES', T.mulher, 0], ['MÃES SOLO', T.sozinhas, 5]];
      G.forEach(([s2, t0, g], i) => {
        const p = seg(t, t0 - 0.2, t0 + 0.3); if (p <= 0) return;
        const x = 1080 + (i % 3) * 260, y = 620 + Math.floor(i / 3) * 290;
        pessoa(x, y, GENTE[g], 0.75 * ease.saida(p) + 0.001, 0);
        if (s2 === 'MÃES SOLO') pessoa(x + 50, y, GENTE[3], 0.4, 0);
        L.etiqueta(ctx, s2, x, y + 36, p, { cor: i % 2 ? VERM : TINTA, tam: 22 });
      });
      etq('CONTRA O CAPITALISMO E O FASCISMO', 1340, 400, T.fascismo - 0.4, TINTA, 26);
    }

    // ------------------------------------------------ 8. LGBTQIA+ (CARTAZ)
    function lgbt(lt) {
      arquivo = false; sol(1300);
      const fx = ease.saida(seg(lt, 0.2, 0.9));
      ['#E40303', '#FF8C00', '#FFED00', '#008026', '#004DFF', '#750787'].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(-1920 + fx * 1920, 120 + i * 14, 1920, 14); });
      ['#5BCEFA', '#F5A9B8', '#FFFFFF', '#F5A9B8', '#5BCEFA'].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(1920 - fx * 1920, 920 - 70 + i * 14, 1920, 14); });
      carimbar('O PAÍS QUE MAIS MATA', 960, 320, T.trans - 0.6, BEGE, 90, FONTE.bloco, 71, { larg: 1500 });
      carimbar('PESSOAS TRANS NO MUNDO', 960, 440, T.trans, AMA, 110, FONTE.manchete, 72, { larg: 1500, erro: VESC, desloc: 6 });
      if (t >= T.trans + 0.8) L.texto(ctx, 'pelo 18º ano seguido · dossiê da ANTRA, janeiro de 2026', 960, 500, { familia: FONTE.maquina, peso: 400, tam: 30, cor: BEGE, alinhar: 'center' });
      faixa('VIVER É UM ATO REVOLUCIONÁRIO', 360, 680, T.revolucionario - 0.6, 1200, BEGE, VERM, 60, 73);
    }

    // ------------------------------------------------ 9. só viver não basta (CARTAZ)
    function basta(lt) {
      arquivo = false; sol(1300);
      carimbar('MAS SÓ VIVER', 960, 300, T.basta + 0.1, BEGE, 110, FONTE.manchete, 81, { larg: 1400 });
      carimbar('NÃO BASTA', 960, 470, T.basta + 0.8, AMA, 170, FONTE.manchete, 82, { larg: 1400, erro: VESC, desloc: 7 });
      faixa('RESISTÊNCIA ATIVA PARA MUDAR TODO O SISTEMA', 260, 700, T.ativa - 0.3, 1400, BEGE, VERM, 50, 83);
    }

    // ------------------------------------------------ 10. a paz que buscamos e a luta que não se nega
    function paz(lt) {
      L.fundo(ctx, BEGE);
      const luta = t >= T.lutas - 0.6;
      if (!luta) {
        kicker('A FACE DE OXALUFÃ', 120, 150, seg(lt, 0.1, 0.5));
        const yb = cubo('A PAZ QUE BUSCAMOS', 120, 180, 70, seg(lt, 0.1, 0.8), { maxW: 900 });
        oxalufa(1500, 930, 1.15, t * 1.2);
        [['IGUALDADE E EQUIDADE', T.igualdade], ['NINGUÉM EXPLORA NINGUÉM', T.igualdade + 1.8], ['O CAPITAL FORA DO CENTRO', T.capital_centro]].forEach(([s2, t0], i) => {
          const e = ease.saida(seg(t, t0, t0 + 0.4)); if (e <= 0) return;
          ctx.save(); ctx.globalAlpha = e; ctx.fillStyle = i === 2 ? VERM : TINTA; ctx.fillRect(120, yb + 60 + i * 96, 820, 72);
          L.texto(ctx, s2, 150, yb + 108 + i * 96, { familia: FONTE.grotesca, peso: 700, tam: 34, cor: BEGE }); check(900, yb + 92 + i * 96, 1, AMA, 0.8); ctx.restore();
        });
        if (t >= T.ceu2 - 0.8) faixa('MAS ESSA PAZ NÃO CAI DO CÉU', 120, 860, T.ceu2 - 0.8, 820, AMA, TINTA, 40, 91);
        return;
      }
      kicker('A FACE DE OXAGUIÃ', 1000, 150, seg(t, T.lutas - 0.6, T.lutas));
      const yb = cubo('A LUTA NÃO SE NEGA', 1000, 180, 66, seg(t, T.lutas - 0.6, T.lutas + 0.2), { maxW: 860 });
      oxaguia(480, 950, 1.1, seg(t, T.oxaguia2, T.oxaguia2 + 0.4) * (1 - seg(t, T.oxaguia2 + 0.4, T.oxaguia2 + 0.9)));
      if (t >= T.nao_violencia - 1.2) { L.aplicarCarimbo(ctx, seg(t, T.nao_violencia - 1.2, T.nao_violencia - 0.9), 1420, yb + 90, () => {
        ctx.fillStyle = TINTA; ctx.fillRect(1000, yb + 40, 840, 96); L.texto(ctx, 'LUTAR NÃO É VIOLÊNCIA', 1420, yb + 108, { familia: FONTE.bloco, peso: 400, tam: 54, cor: BEGE, alinhar: 'center' }); }, 92); }
      [['É SE FORMAR', T.formar - 0.4], ['ESTUDAR', T.formar + 0.6], ['ORGANIZAR', T.formar + 1.2]].forEach(([s2, t0], i) => etq(s2, 1130 + i * 290, yb + 210, t0, [VERM, AZUL, VERDE][i], 32));
      if (t >= T.alcancado - 0.8) faixa('CHEGAR EM QUEM AINDA NÃO FOI ALCANÇADO', 1000, yb + 330, T.alcancado - 0.8, 840, AMA, TINTA, 32, 93);
      if (t >= T.salvacao - 1.2) { const y = yb + 460;
        L.aplicarCarimbo(ctx, seg(t, T.salvacao - 1.2, T.salvacao - 0.9), 1420, y, () => {
          ctx.fillStyle = '#F2E7CF'; ctx.fillRect(1000, y - 50, 840, 100); ctx.strokeStyle = TINTA; ctx.lineWidth = 3; ctx.strokeRect(1000, y - 50, 840, 100);
          L.texto(ctx, 'A DIREITA NÃO É A SALVAÇÃO', 1420, y + 16, { familia: FONTE.bloco, peso: 400, tam: 44, cor: TINTA, alinhar: 'center' }); }, 94);
        xis(1420, y, 40, seg(t, T.salvacao, T.salvacao + 0.4), VERM, 12); }
    }

    // ------------------------------------------------ 11. ainda há luz (CARTAZ, o sol nascendo)
    function esperanca(lt) {
      arquivo = false;
      const sobe = ease.saida(seg(lt, 0, 6));
      L.fundo(ctx, VERM); L.raios(ctx, 960, lerp(1500, 1150, sobe), 2800, 24, -0.3 + t * 0.02, 'rgba(235,181,42,0.22)');
      ctx.fillStyle = AMA; ctx.beginPath(); ctx.arc(960, lerp(1500, 1150, sobe), 380, Math.PI, 0); ctx.fill();
      carimbar('AINDA HÁ MUITA LUZ', 960, 300, T.luz - 0.4, AMA, 140, FONTE.manchete, 101, { larg: 1500, erro: VESC, desloc: 7 });
      carimbar('E MUITA LUTA PELA FRENTE', 960, 460, T.luz + 0.8, BEGE, 100, FONTE.manchete, 102, { larg: 1500, erro: VESC, desloc: 5 });
      carimbar('HOUVE ANTES, E AINDA HAVERÁ AGORA', 960, 620, T.houve, BEGE, 60, FONTE.bloco, 103, { larg: 1400 });
    }

    // ------------------------------------------------ 12. fim (CARTAZ)
    function fim(lt) {
      arquivo = false; sol(1300);
      ctx.save(); ctx.globalAlpha = ease.saida(seg(lt, 0, 0.8)); oxalufa(240, 1010, 0.66, t); oxaguia(1690, 1010, 0.62, 0); ctx.restore();
      carimbar('PAZ COMO OBJETIVO', 960, 250, T.fim + 0.2, BEGE, 100, FONTE.manchete, 111, { larg: 1100 });
      carimbar('LUTA COMO CAMINHO', 960, 390, T.caminho - 0.3, AMA, 120, FONTE.manchete, 112, { larg: 1100, erro: VESC, desloc: 6 });
      if (t >= T.parabens) L.aplicarCarimbo(ctx, seg(t, T.parabens, T.parabens + 0.3), 960, 560, () => {
        ctx.fillStyle = VERDE; ctx.fillRect(560, 500, 800, 120);
        L.texto(ctx, '✓ FORMAÇÃO CONCLUÍDA!', 960, 584, { familia: FONTE.bloco, peso: 400, tam: 58, cor: BEGE, alinhar: 'center' }); }, 113);
      faixa('PAZ ENTRE NÓS, GUERRA AOS SENHORES!', 460, 760, T.pazentre, 1000, BEGE, VERM, 50, 114);
    }
    function final(lt) {
      arquivo = false; sol(1300);
      L.aplicarCarimbo(ctx, seg(lt, 0, 0.3), CX, 430, () => L.imagem(ctx, L.img.lufa, CX, 430, 600), 97);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.6, 1.1);
      L.texto(ctx, 'NARRAÇÃO: LÉO DUARTE', CX, 880, { familia: FONTE.sub, peso: 600, tam: 46, cor: BEGE, alinhar: 'center', tracking: 4 });
      ctx.restore();
    }

    // ------------------------------------------------ desenho do quadro (depois das definições acima)
    const ordem = [[0, criacao], [T.faces, faces], [T.nome, nome], [T.religiosa - 0.3, resistencia], [T.tres, tres], [T.popular, popular], [T.purismo, purismo],
      [T.lgbt, lgbt], [T.basta, basta], [T.paz, paz], [T.esperanca, esperanca], [T.fim, fim], [T.logo, final]];
    const [b0, fn] = ordem.filter(([a]) => t >= a).pop();
    const IMP = [T.lufan, T.p_cap, T.p_soc, T.p_com, T.milhoes - 0.2, T.trans, T.revolucionario - 0.6, T.basta + 0.8, T.nao_violencia - 1.2, T.parabens, T.pazentre, T.logo];
    const { dx, dy } = L.tremor(t, IMP, 7);
    ctx.save(); ctx.translate(dx, dy); fn(t - b0, t); ctx.restore();
    [[T.faces, BEGE, 24], [T.nome, VERM, -24], [T.religiosa - 0.3, BEGE, 24], [T.tres, BEGE, -24], [T.popular, BEGE, 24], [T.purismo, BEGE, -24], [T.lgbt, VERM, 24],
      [T.basta, VERM, -24], [T.paz, BEGE, 24], [T.esperanca, VERM, -24], [T.fim, AMA, 24], [T.logo, VESC, -24]].forEach(([X, cor, ang]) => L.corteDiagonal(ctx, seg(t, X - 0.4, X), cor, ang));
    if (arquivo) L.varredura(ctx, t, 0.06);
    IMP.forEach(X => L.flash(ctx, t, X, AMA, 0.25, 0.18));
    L.papel(ctx, t, 0.12); L.vinheta(ctx, 0.35);
    // entrada suave (sem som e sem ruído no começo): o quadro abre do escuro
    if (t < 0.8) { ctx.fillStyle = `rgba(0,0,0,${1 - t / 0.8})`; ctx.fillRect(0, 0, 1920, 1080); }
    legenda();
  },
};
