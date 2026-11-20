// ILUSTRAÇÃO dos orixás para o EP. 4 (desenho próprio, sem fotos), em alta resolução e fundo transparente.
// Render: node motor/render.js orixas-ilustracao saida/orixas.png --still 0  → depois ferramentas recortam em dois PNGs.
// Referências do autor: Oxalufã — velho, corpo grande e curvado, todo de branco, coroa de pontas com franja de contas, idés de prata,
// avental de renda com medalhões, opaxorô (cajado com três "guarda-chuvas" com franjas de contas e o pássaro no alto), a pomba por perto.
// Oxaguiã — jovem e musculoso, branco com detalhes azuis (nada de vermelho), coroa alta com a pomba num medalhão azul, espada de metal e atori.
window.CENA = {
  w: 2800, h: 2000, fps: 30, dur: 1,
  desenhar(ctx, t, L) {
    ctx.clearRect(0, 0, 2800, 2000);
    const TINTA = '#1C1714', PELE = '#5A3622', PELE_L = '#7A4B30', PELE_S = '#3E2416';
    const BR = '#FBF9F4', BR2 = '#ECE8DF', BR3 = '#D6D1C6', AZ = '#2E7FB8', AZ2 = '#8EC5EA', AZ3 = '#1F5C8E';
    const PR = '#D3D8DF', PR2 = '#9AA2AD', PR3 = '#6E7682';
    const lerp = (a, b, k) => a + (b - a) * k;
    const lg = (x0, y0, x1, y1, st) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
    const rg = (x, y, r0, r1, st) => { const g = ctx.createRadialGradient(x, y, r0, x, y, r1); st.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
    const tinta = (w = 3) => { ctx.strokeStyle = TINTA; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; };
    const caminho = (pts, fechar = true) => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const p = pts[i]; if (p.length === 6) ctx.bezierCurveTo(...p); else if (p.length === 4) ctx.quadraticCurveTo(...p); else ctx.lineTo(p[0], p[1]); } if (fechar) ctx.closePath(); };
    const preenche = (fill, w = 3) => { ctx.fillStyle = fill; ctx.fill(); tinta(w); ctx.stroke(); };
    function conta(x, y, r, cor = BR, brilho = true) {   // uma conta com volume
      ctx.fillStyle = rg(x - r * 0.35, y - r * 0.35, r * 0.1, r * 1.2, [[0, '#FFFFFF'], [0.5, cor], [1, cor === BR ? BR3 : cor]]);
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      if (brilho) { ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.28, 0, 7); ctx.fill(); }
    }
    function fio(x0, y0, x1, y1, passo, r, cores) {   // fio de contas
      const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / passo));
      for (let i = 0; i <= n; i++) conta(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, r, cores[i % cores.length]);
    }
    function arco(cx, cy, rx, ry, a0, a1, passo, r, cores) {
      const n = Math.round((a1 - a0) * Math.max(rx, ry) / passo);
      for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; conta(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, r, cores[i % cores.length]); }
    }
    function fioPescoco(cx, yPesc, meia, yUmbigo, n, passo, r, coresDe) {   // fios de conta: saem do pescoço, descem em U e fecham no umbigo
      for (let k = n - 1; k >= 0; k--) {
        const hw = meia + k * 10, yb = yUmbigo - (n - 1 - k) * 34, cores = coresDe(k);
        const P = (u) => { const a = 1 - u; return [a * a * (cx - hw) + 2 * a * u * (cx - hw * 0.9) + u * u * cx, a * a * yPesc + 2 * a * u * (yb + 10) + u * u * yb]; };
        const Q = (u) => { const [x, y] = P(u); return [2 * cx - x, y]; };
        let cont = 0;
        for (const F of [P, Q]) for (let u = 0; u <= 1.0001; u += passo / (yb - yPesc + hw)) { const [x, y] = F(u); conta(x, y, r, cores[(cont++) % cores.length]); }
        ctx.fillStyle = cores[0]; conta(cx, yb + r * 1.8, r * 1.6, cores[0]);
      }
    }
    function hachura(clipFn, x0, y0, x1, y1, passo = 9, a = 0.32, ang = 1, dentro = null) {   // sombra a traço (gravura)
      ctx.save(); if (dentro) { dentro(); ctx.clip(); } clipFn(); ctx.clip(); ctx.strokeStyle = `rgba(28,23,20,${a})`; ctx.lineWidth = 1.6;
      for (let x = x0 - (y1 - y0); x < x1; x += passo) { ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x + (y1 - y0) * ang, y0); ctx.stroke(); }
      ctx.restore();
    }
    function metal(x0, y0, x1, y1) { return lg(x0, y0, x1, y1, [[0, '#F4F6F8'], [0.35, PR], [0.6, PR2], [0.8, '#E9ECF0'], [1, PR3]]); }
    function dobra(pts, a = 0.14) { caminho(pts, false); ctx.strokeStyle = `rgba(90,98,110,${a})`; ctx.lineWidth = 10; ctx.stroke(); ctx.strokeStyle = `rgba(90,98,110,${a * 1.6})`; ctx.lineWidth = 2.5; ctx.stroke(); }
    function babado(x0, x1, y, alt, n, fill = BR, curva = 34) {   // babado com renda vazada, acompanhando a curva da saia
      const w = (x1 - x0) / n, mid = (x0 + x1) / 2, half = (x1 - x0) / 2, cy = (x) => y + curva * (1 - ((x - mid) / half) ** 2);
      ctx.beginPath(); ctx.moveTo(x0, cy(x0) - alt);
      for (let i = 1; i <= 20; i++) { const x = x0 + (x1 - x0) * i / 20; ctx.lineTo(x, cy(x) - alt); }
      for (let i = n; i > 0; i--) { const xa = x0 + i * w, xb = xa - w; ctx.bezierCurveTo(xa - w * 0.1, cy(xa) + alt * 0.55, xb + w * 0.1, cy(xb) + alt * 0.55, xb, cy(xb)); }
      ctx.closePath(); ctx.fillStyle = lg(0, y - alt, 0, y + curva + alt * 0.5, [[0, BR2], [0.5, fill], [1, BR2]]); ctx.fill(); tinta(2.5); ctx.stroke();
      ctx.fillStyle = 'rgba(120,128,140,0.55)';
      for (let i = 0; i < n; i++) { const cx = x0 + (i + 0.5) * w, yy = cy(cx); ctx.beginPath(); ctx.arc(cx, yy + alt * 0.12, w * 0.12, 0, 7); ctx.fill();
        for (let k = -1; k <= 1; k += 2) { ctx.beginPath(); ctx.arc(cx + k * w * 0.26, yy - alt * 0.2, w * 0.06, 0, 7); ctx.fill(); } }
      for (let i = 0; i <= n * 3; i++) { const x = x0 + (x1 - x0) * i / (n * 3); ctx.fillStyle = 'rgba(110,118,130,0.45)'; ctx.beginPath(); ctx.arc(x, cy(x) - alt + 9, 2.4, 0, 7); ctx.fill(); }
    }
    function _babadoVelho(x0, x1, y, alt, n, fill = BR) {
      const w = (x1 - x0) / n;
      ctx.beginPath(); ctx.moveTo(x0, y - alt);
      ctx.lineTo(x1, y - alt); ctx.lineTo(x1, y);
      for (let i = n; i > 0; i--) { const xa = x0 + i * w, xb = xa - w; ctx.bezierCurveTo(xa - w * 0.1, y + alt * 0.55, xb + w * 0.1, y + alt * 0.55, xb, y); }
      ctx.closePath(); ctx.fillStyle = lg(0, y - alt, 0, y + alt * 0.5, [[0, BR2], [0.5, fill], [1, BR2]]); ctx.fill(); tinta(2.5); ctx.stroke();
      ctx.fillStyle = 'rgba(120,128,140,0.55)';
      for (let i = 0; i < n; i++) { const cx = x0 + (i + 0.5) * w; ctx.beginPath(); ctx.arc(cx, y + alt * 0.12, w * 0.12, 0, 7); ctx.fill();
        for (let k = -1; k <= 1; k += 2) { ctx.beginPath(); ctx.arc(cx + k * w * 0.26, y - alt * 0.2, w * 0.06, 0, 7); ctx.fill(); } }
    }
    function roseta(cx, cy, r) {   // medalhão de renda (rosácea)
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
      ctx.strokeStyle = PR3; ctx.lineWidth = 2.2;
      [1, 0.86, 0.32].forEach((f) => { ctx.beginPath(); ctx.arc(cx, cy, r * f, 0, 7); ctx.stroke(); });
      for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; ctx.fillStyle = 'rgba(110,118,130,0.6)'; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r * 0.93, cy + Math.sin(a) * r * 0.93, r * 0.035, 0, 7); ctx.fill(); }
      for (let i = 0; i < 8; i++) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(i * Math.PI / 4);
        ctx.beginPath(); ctx.moveTo(0, -r * 0.3); ctx.bezierCurveTo(r * 0.22, -r * 0.45, r * 0.2, -r * 0.72, 0, -r * 0.8); ctx.bezierCurveTo(-r * 0.2, -r * 0.72, -r * 0.22, -r * 0.45, 0, -r * 0.3);
        ctx.strokeStyle = PR3; ctx.lineWidth = 2; ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -r * 0.36); ctx.lineTo(0, -r * 0.72); ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore(); }
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * r * 0.16, cy + Math.sin(a) * r * 0.16, r * 0.1, r * 0.06, a, 0, 7); ctx.stroke(); }
    }
    function braco(pts, larg, idés) {   // braço de pele: forma que afina do ombro ao pulso, com músculo e idés (braceletes) de prata
      const seg2 = (a, b, w0, w1, bojo) => { const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), nx = -Math.sin(ang), ny = Math.cos(ang), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        ctx.beginPath(); ctx.moveTo(a[0] + nx * w0, a[1] + ny * w0); ctx.quadraticCurveTo(mx + nx * (w0 + w1) * 0.5 * bojo, my + ny * (w0 + w1) * 0.5 * bojo, b[0] + nx * w1, b[1] + ny * w1);
        ctx.lineTo(b[0] - nx * w1, b[1] - ny * w1); ctx.quadraticCurveTo(mx - nx * (w0 + w1) * 0.5 * bojo, my - ny * (w0 + w1) * 0.5 * bojo, a[0] - nx * w0, a[1] - ny * w0); ctx.closePath();
        ctx.fillStyle = lg(a[0] + nx * w0, a[1] + ny * w0, a[0] - nx * w0, a[1] - ny * w0, [[0, PELE_S], [0.35, PELE_L], [0.7, PELE], [1, PELE_S]]); ctx.fill(); tinta(3); ctx.stroke(); };
      ctx.fillStyle = PELE; for (const q of pts) { ctx.beginPath(); ctx.arc(q[0], q[1], larg * 0.42, 0, 7); ctx.fill(); }
      seg2(pts[0], pts[1], larg * 0.62, larg * 0.4, 1.42); seg2(pts[1], pts[2], larg * 0.44, larg * 0.27, 1.3);
      ctx.strokeStyle = 'rgba(255,215,180,0.22)'; ctx.lineWidth = larg * 0.12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(lerp(pts[0][0], pts[1][0], 0.2) - larg * 0.15, lerp(pts[0][1], pts[1][1], 0.2) - larg * 0.1); ctx.lineTo(lerp(pts[0][0], pts[1][0], 0.75) - larg * 0.12, lerp(pts[0][1], pts[1][1], 0.75) - larg * 0.08); ctx.stroke();
      ctx.fillStyle = PELE; ctx.beginPath(); ctx.arc(pts[1][0], pts[1][1], larg * 0.38, 0, 7); ctx.fill();
      idés.forEach(([i, f, alt]) => { const a = pts[i], b = pts[i + 1], x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f, ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang); const h = larg * (i === 0 ? 0.98 : 0.72);
        ctx.fillStyle = metal(0, -h / 2, 0, h / 2); ctx.beginPath(); ctx.roundRect(-alt / 2, -h / 2, alt, h, 6); ctx.fill(); tinta(2.5); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-alt / 2 + 4, -h / 2 + 6); ctx.lineTo(-alt / 2 + 4, h / 2 - 6); ctx.stroke(); ctx.restore(); });
    }
    function _bracoVelho(pts, larg, idés) {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const tracar = (w, cor) => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.strokeStyle = cor; ctx.lineWidth = w; ctx.stroke(); };
      tracar(larg + 7, TINTA); tracar(larg, PELE); tracar(larg * 0.45, PELE_L);
      ctx.save(); ctx.translate(-larg * 0.18, -larg * 0.12); tracar(larg * 0.12, 'rgba(255,220,190,0.25)'); ctx.restore();
      idés.forEach(([i, f, alt]) => { const a = pts[i], b = pts[i + 1], x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f, ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang); const h = larg * 1.08;
        ctx.fillStyle = metal(0, -h / 2, 0, h / 2); ctx.beginPath(); ctx.roundRect(-alt / 2, -h / 2, alt, h, 6); ctx.fill(); tinta(2.5); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-alt / 2 + 4, -h / 2 + 6); ctx.lineTo(-alt / 2 + 4, h / 2 - 6); ctx.stroke(); ctx.restore(); });
    }
    function mao(x, y, r, ang = 0) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
      ctx.fillStyle = rg(-r * 0.3, -r * 0.3, 2, r * 1.3, [[0, PELE_L], [1, PELE]]); ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.85, 0, 0, 7); ctx.fill(); tinta(2.5); ctx.stroke();
      ctx.strokeStyle = PELE_S; ctx.lineWidth = 2; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(r * 0.1, k * r * 0.3); ctx.lineTo(r * 0.8, k * r * 0.32); ctx.stroke(); }
      ctx.beginPath(); ctx.ellipse(-r * 0.2, -r * 0.8, r * 0.28, r * 0.45, -0.6, 0, 7); ctx.fillStyle = PELE; ctx.fill(); tinta(2.5); ctx.stroke();
      ctx.restore();
    }
    function pomba(x, y, s, asa = 0) {   // pomba branca em voo, com penas
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      const asaPena = (dir) => { ctx.save(); ctx.scale(dir, 1); ctx.rotate(-0.25 + asa);
        caminho([[0, 0], [-40, -60, -120, -110, -210, -120], [-170, -90, -190, -70, -150, -40], [-170, -40, -160, -20, -120, -10], [-130, 0, -100, 10, -60, 14], [-30, 18, -10, 10, 0, 0]]);
        preenche(lg(0, -120, 0, 20, [[0, '#FFFFFF'], [1, BR2]]), 2.5);
        ctx.strokeStyle = BR3; ctx.lineWidth = 2; for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.moveTo(-20 - k * 25, -10 - k * 6); ctx.lineTo(-60 - k * 26, -60 - k * 8); ctx.stroke(); }
        ctx.restore(); };
      asaPena(-1);
      caminho([[-90, 10], [-40, -20, 40, -20, 80, -10], [100, -6, 110, 4, 96, 14], [60, 30, -40, 34, -90, 10]]); preenche(lg(0, -20, 0, 34, [[0, '#FFFFFF'], [1, BR2]]), 2.5);
      caminho([[-90, 10], [-130, 0, -150, 20, -140, 40], [-120, 30, -100, 24, -86, 18]]); preenche(BR, 2.5);   // cauda
      ctx.beginPath(); ctx.arc(92, -6, 20, 0, 7); preenche(BR, 2.5);
      ctx.fillStyle = '#E3B04B'; ctx.beginPath(); ctx.moveTo(110, -8); ctx.lineTo(128, -2); ctx.lineTo(110, 2); ctx.fill();
      ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(98, -10, 3.2, 0, 7); ctx.fill();
      asaPena(1);
      ctx.restore();
    }

    // ================================================================ OXALUFÃ (0–1400)
    (function oxalufa() {
      const chao = 1950;
      ctx.save();
      // a pomba voando
      pomba(1130, 300, 1.25, 0.1);
      // o pano (alá) pelas costas, à direita
      caminho([[930, 640], [1080, 700, 1220, 980, 1250, 1460], [1180, 1520, 1050, 1480, 960, 1380], [990, 1100, 960, 820, 930, 640]]);
      preenche(lg(930, 640, 1250, 1460, [[0, BR], [0.6, BR2], [1, BR3]]), 3);
      hachura(() => caminho([[1060, 760], [1200, 1000, 1240, 1300, 1250, 1460], [1180, 1520, 1100, 1480, 1060, 1440]]), 1040, 740, 1260, 1520, 9, 0.3);
      dobra([[1000, 760], [1110, 960, 1170, 1200, 1190, 1440]]); dobra([[970, 900], [1040, 1100, 1060, 1260, 1050, 1420]], 0.1);
      // a saia rodada, larga, em camadas
      caminho([[600, 1080], [470, 1300, 330, 1620, 250, 1900], [600, 1960, 950, 1960, 1290, 1900], [1220, 1620, 1090, 1300, 940, 1080]]);
      preenche(lg(250, 0, 1290, 0, [[0, BR2], [0.2, BR], [0.8, BR], [1, BR2]]), 3.5);
      ctx.save(); caminho([[600, 1080], [470, 1300, 330, 1620, 250, 1900], [250, 1990], [1290, 1990], [1290, 1900], [1220, 1620, 1090, 1300, 940, 1080]]); ctx.clip();
      [[640, 1140, 420, 1880], [720, 1140, 640, 1900], [880, 1140, 980, 1900], [930, 1140, 1180, 1880]].forEach(([a, b, c, d]) => dobra([[a, b], [(a + c) / 2 - 20, (b + d) / 2, (a + c) / 2 + 20, (b + d) / 2 + 100, c, d]]));
      hachura(() => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(560, 1080); ctx.lineTo(420, 1990); ctx.lineTo(0, 1990); ctx.closePath(); }, 200, 1080, 620, 1990, 10, 0.3, 1, () => caminho([[600, 1080], [470, 1300, 330, 1620, 250, 1900], [600, 1960, 950, 1960, 1290, 1900], [1220, 1620, 1090, 1300, 940, 1080]]));
      hachura(() => { ctx.beginPath(); ctx.moveTo(1000, 1080); ctx.lineTo(1400, 1080); ctx.lineTo(1400, 1990); ctx.lineTo(1150, 1990); ctx.closePath(); }, 980, 1080, 1320, 1990, 12, 0.22, 1, () => caminho([[600, 1080], [470, 1300, 330, 1620, 250, 1900], [600, 1960, 950, 1960, 1290, 1900], [1220, 1620, 1090, 1300, 940, 1080]]));
      babado(318, 1222, 1660, 70, 15, BR, 40);
      babado(250, 1290, 1880, 86, 17, BR, 50);
      ctx.restore();
      // o avental de renda com os dois medalhões
      caminho([[640, 1090], [880, 1090], [930, 1800], [590, 1800]]); preenche(lg(590, 0, 930, 0, [[0, BR2], [0.5, '#FFFFFF'], [1, BR2]]), 3);
      for (let y = 1110; y < 1790; y += 22) { conta(645 - (y - 1090) * 0.07, y, 5, BR); conta(875 + (y - 1090) * 0.07, y, 5, BR); }
      roseta(760, 1300, 112); roseta(760, 1580, 128);
      // o tronco largo e curvado
      ctx.save(); ctx.translate(760, 1090); ctx.rotate(-0.09); ctx.translate(-760, -1090);
      caminho([[600, 1090], [480, 1000, 470, 760, 600, 650], [680, 600, 860, 600, 950, 650], [1060, 760, 1050, 1000, 930, 1090]]);
      preenche(lg(470, 0, 1060, 0, [[0, BR2], [0.2, BR], [0.8, BR], [1, BR2]]), 3.5);
      hachura(() => caminho([[930, 650], [1060, 760, 1050, 1000, 930, 1090], [890, 1090], [960, 900, 960, 760, 900, 650]]), 880, 640, 1070, 1100, 9, 0.3);
      dobra([[560, 760], [600, 880, 610, 980, 640, 1080]]); dobra([[960, 740], [930, 860, 920, 980, 900, 1080]]);
      // as mangas bufantes
      [[580, 690, -0.5], [950, 690, 0.5]].forEach(([x, y, a]) => { ctx.beginPath(); ctx.ellipse(x, y, 90, 70, a, 0, 7); preenche(rg(x - 20, y - 20, 10, 100, [[0, '#FFFFFF'], [1, BR2]]), 3);
        dobra([[x - 40, y - 30], [x, y, x - 10, y + 30, x + 10, y + 50]], 0.12); });
      // o ojá amarrado no peito, com laço
      caminho([[520, 790], [760, 840, 1000, 790, 1000, 790], [1010, 860], [760, 920, 520, 860, 515, 860]]); preenche(lg(0, 790, 0, 900, [[0, '#FFFFFF'], [1, BR2]]), 3);
      ctx.beginPath(); ctx.ellipse(1010, 800, 60, 34, -0.5, 0, 7); preenche(BR, 3); ctx.beginPath(); ctx.ellipse(1010, 870, 54, 30, 0.6, 0, 7); preenche(BR2, 3);
      ctx.beginPath(); ctx.arc(1000, 835, 18, 0, 7); preenche(BR, 3);
      // os fios de contas (brancos e prateados)
      fioPescoco(712, 600, 52, 1080, 4, 13, 5.6, (k) => k % 2 ? [BR, BR, PR] : [BR]);
      // o braço que segura o opaxorô e o outro, apoiado
      braco([[560, 720], [470, 860], [372, 1000]], 62, [[0, 0.45, 26], [1, 0.82, 34]]);
      braco([[960, 720], [1000, 880], [920, 1010]], 62, [[0, 0.45, 26], [1, 0.82, 34]]);
      mao(915, 1015, 34, 2.4);
      // o pescoço, a cabeça, a coroa de pontas e a franja de contas
      ctx.fillStyle = PELE; ctx.beginPath(); ctx.roundRect(660, 520, 90, 110, 30); ctx.fill(); tinta(3); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(700, 460, 95, 118, -0.1, 0, 7); preenche(rg(670, 430, 10, 140, [[0, PELE_L], [1, PELE]]), 3.5);
      const rosto = (fx, fy, k) => { ctx.strokeStyle = PELE_S; ctx.lineWidth = 4 * k; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(fx - 50 * k, fy - 10 * k); ctx.quadraticCurveTo(fx - 32 * k, fy - 2 * k, fx - 16 * k, fy - 10 * k); ctx.moveTo(fx + 16 * k, fy - 10 * k); ctx.quadraticCurveTo(fx + 32 * k, fy - 2 * k, fx + 50 * k, fy - 10 * k); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(fx - 4 * k, fy - 6 * k); ctx.quadraticCurveTo(fx - 14 * k, fy + 34 * k, fx + 6 * k, fy + 40 * k); ctx.stroke();
        ctx.fillStyle = '#4A2618'; ctx.beginPath(); ctx.ellipse(fx, fy + 72 * k, 26 * k, 10 * k, 0, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,215,180,0.25)'; ctx.beginPath(); ctx.ellipse(fx - 30 * k, fy + 20 * k, 18 * k, 10 * k, 0, 0, 7); ctx.fill(); };
      rosto(690, 470, 1);
      // coroa
      const cx = 700, by = 400;
      ctx.beginPath(); ctx.moveTo(cx - 130, by); ctx.lineTo(cx - 140, by - 70);
      for (let i = 0; i < 7; i++) { const x0 = cx - 140 + i * 40; ctx.lineTo(x0 + 20, by - 170 - (i === 3 ? 20 : 0)); ctx.lineTo(x0 + 40, by - 70); }
      ctx.lineTo(cx + 130, by); ctx.closePath(); ctx.fillStyle = metal(cx - 140, by - 190, cx + 140, by); ctx.fill(); tinta(3.5); ctx.stroke();
      for (let i = 0; i < 7; i++) conta(cx - 120 + i * 40, by - 178 - (i === 3 ? 20 : 0), 9, PR);
      ctx.fillStyle = metal(0, by - 70, 0, by); ctx.beginPath(); ctx.roundRect(cx - 138, by - 64, 276, 54, 8); ctx.fill(); tinta(3); ctx.stroke();
      for (let i = 0; i < 12; i++) { conta(cx - 118 + i * 21.5, by - 37, 6, BR); }
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 120, by - 80); ctx.lineTo(cx - 60, by - 150); ctx.stroke();
      // a franja (filá): fios de contas brancas e prateadas até o peito
      for (let i = -11; i <= 11; i++) { const x = cx + i * 11, comp = 300 - Math.abs(i) * 4;
        ctx.strokeStyle = 'rgba(90,98,110,0.4)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, by - 8); ctx.lineTo(x + i * 0.4, by + comp); ctx.stroke();
        for (let y = by; y < by + comp; y += 14) conta(x + (y - by) / comp * i * 0.4, y, 4.6, (Math.floor(y / 14) + i) % 5 === 0 ? PR : BR); }
      ctx.restore();
      // o opaxorô (na frente)
      const ox = 330;
      ctx.fillStyle = metal(ox - 14, 0, ox + 14, 0); ctx.fillRect(ox - 12, 230, 24, chao - 230); tinta(3); ctx.strokeRect(ox - 12, 230, 24, chao - 230);
      for (let y = 380; y < chao; y += 240) { ctx.fillStyle = metal(ox - 18, 0, ox + 18, 0); ctx.beginPath(); ctx.roundRect(ox - 20, y, 40, 22, 6); ctx.fill(); tinta(2.5); ctx.stroke(); }
      mao(372, 1000, 42, -0.2);
      [[880, 165], [600, 140], [360, 110]].forEach(([yy, r]) => {
        for (let k = -r + 8; k <= r - 8; k += 11) { const comp = 110 + Math.abs(Math.sin(k)) * 14;
          ctx.strokeStyle = 'rgba(110,118,130,0.6)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(ox + k, yy); ctx.lineTo(ox + k, yy + comp); ctx.stroke();
          for (let q = 10; q < comp; q += 12) conta(ox + k, yy + q, 4.4, q % 36 < 12 ? PR : BR);
          ctx.fillStyle = metal(ox + k - 6, 0, ox + k + 6, 0); ctx.beginPath(); ctx.moveTo(ox + k - 6, yy + comp); ctx.lineTo(ox + k, yy + comp + 18); ctx.lineTo(ox + k + 6, yy + comp); ctx.closePath(); ctx.fill(); }
        caminho([[ox - r, yy], [ox - r * 0.8, yy - r * 0.55, ox + r * 0.8, yy - r * 0.55, ox + r, yy]]); preenche(metal(ox - r, yy - r * 0.5, ox + r, yy), 3.5);
        ctx.strokeStyle = PR3; ctx.lineWidth = 2; for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(ox, yy - r * 0.42); ctx.quadraticCurveTo(ox + k * r * 0.2, yy - r * 0.3, ox + k * r * 0.3, yy); ctx.stroke(); }
        ctx.fillStyle = metal(0, yy - 6, 0, yy + 10); ctx.fillRect(ox - r, yy - 4, 2 * r, 14); tinta(2.5); ctx.strokeRect(ox - r, yy - 4, 2 * r, 14);
      });
      ctx.beginPath(); ctx.arc(ox, 238, 22, 0, 7); preenche(metal(ox - 22, 216, ox + 22, 260), 3);
      pomba(ox + 4, 190, 0.5, 0.5);
      ctx.restore();
    })();

    // ================================================================ OXAGUIÃ (1400–2800), centro em 2100
    (function oxaguia() {
      const C = 2100;
      ctx.save();
      // o atori (vara longa e fina), na mão esquerda
      ctx.save(); ctx.translate(2420, 900); ctx.rotate(0.42);
      ctx.fillStyle = lg(-9, 0, 9, 0, [[0, '#FFFFFF'], [0.6, BR2], [1, BR3]]); ctx.fillRect(-9, -720, 18, 1250); tinta(3); ctx.strokeRect(-9, -720, 18, 1250);
      ctx.restore();
      // a saia longa
      caminho([[C - 190, 1150], [C - 270, 1450, C - 380, 1750, C - 410, 1920], [C, 1965, C, 1965, C + 410, 1920], [C + 380, 1750, C + 270, 1450, C + 190, 1150]]);
      preenche(lg(C - 410, 0, C + 410, 0, [[0, BR2], [0.2, BR], [0.8, BR], [1, BR2]]), 3.5);
      ctx.save(); caminho([[C - 190, 1150], [C - 270, 1450, C - 380, 1750, C - 410, 1920], [C - 410, 1995], [C + 410, 1995], [C + 410, 1920], [C + 380, 1750, C + 270, 1450, C + 190, 1150]]); ctx.clip();
      hachura(() => { ctx.beginPath(); ctx.moveTo(C - 190, 1150); ctx.lineTo(C - 120, 1150); ctx.lineTo(C - 250, 1995); ctx.lineTo(C - 420, 1995); ctx.closePath(); }, C - 420, 1150, C - 120, 1995, 10, 0.28, 1, () => caminho([[C - 190, 1150], [C - 270, 1450, C - 380, 1750, C - 410, 1920], [C, 1965, C, 1965, C + 410, 1920], [C + 380, 1750, C + 270, 1450, C + 190, 1150]]));
      hachura(() => { ctx.beginPath(); ctx.moveTo(C + 130, 1150); ctx.lineTo(C + 190, 1150); ctx.lineTo(C + 420, 1995); ctx.lineTo(C + 260, 1995); ctx.closePath(); }, C + 120, 1150, C + 420, 1995, 12, 0.2, 1, () => caminho([[C - 190, 1150], [C - 270, 1450, C - 380, 1750, C - 410, 1920], [C, 1965, C, 1965, C + 410, 1920], [C + 380, 1750, C + 270, 1450, C + 190, 1150]]));
      [[-120, -260], [-40, -110], [60, 120], [140, 280]].forEach(([a, b]) => dobra([[C + a, 1180], [C + a * 1.2, 1500, C + b * 0.9, 1700, C + b, 1900]]));
      // faixa de renda com contas azuis
      babado(C - 292, C + 292, 1450, 52, 11, BR, 26);
      for (let x = C - 290; x <= C + 290; x += 20) conta(x, 1428, 5, AZ2);
      // o bordado azul da barra (gotas com centro branco e contorno de prata)
      for (let i = -6; i <= 6; i++) { const x = C + i * 62, y = 1775 + 30 * (1 - (i / 6.5) ** 2);
        ctx.save(); ctx.translate(x, y);
        caminho([[0, -70], [26, -40, 30, -6, 0, 18], [-30, -6, -26, -40, 0, -70]]); preenche(lg(0, -70, 0, 18, [[0, AZ2], [0.5, AZ], [1, AZ3]]), 2.5);
        conta(0, -14, 9, '#FFFFFF'); ctx.strokeStyle = PR2; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -14, 14, 0, 7); ctx.stroke();
        for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.4; conta(Math.cos(a) * 46, -20 + Math.sin(a) * 52, 3.4, AZ2, false); }
        ctx.restore(); }
      babado(C - 410, C + 410, 1895, 70, 15, BR, 38);
      for (let x = C - 390; x <= C + 390; x += 22) conta(x, 1840 + 30 * (1 - ((x - C) / 410) ** 2), 4.5, AZ2, false);
      ctx.restore();
      // a faixa da cintura (pano prateado com laço)
      caminho([[C - 200, 1110], [C, 1140, C + 200, 1110, C + 200, 1110], [C + 205, 1190], [C, 1220, C - 205, 1190, C - 205, 1190]]); preenche(metal(0, 1110, 0, 1210), 3);
      ctx.beginPath(); ctx.ellipse(C - 220, 1170, 54, 30, 0.5, 0, 7); preenche(metal(C - 270, 1140, C - 170, 1200), 3);
      caminho([[C - 230, 1180], [C - 270, 1300, C - 250, 1360, C - 220, 1400], [C - 200, 1330, C - 200, 1260, C - 200, 1190]]); preenche(metal(C - 270, 1180, C - 200, 1400), 3);
      // o tronco musculoso
      caminho([[C - 175, 1120], [C - 190, 980, C - 250, 800, C - 215, 660], [C - 120, 600, C + 120, 600, C + 215, 660], [C + 250, 800, C + 190, 980, C + 175, 1120]]);
      preenche(lg(C - 250, 0, C + 250, 0, [[0, PELE_S], [0.35, PELE_L], [0.6, PELE], [1, PELE_S]]), 3.5);
      ctx.strokeStyle = 'rgba(30,15,8,0.45)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(C - 150, 820); ctx.quadraticCurveTo(C - 70, 870, C, 840); ctx.quadraticCurveTo(C + 70, 870, C + 150, 820); ctx.stroke();   // peitoral
      ctx.beginPath(); ctx.moveTo(C, 850); ctx.lineTo(C, 1080); ctx.stroke();
      [930, 990, 1045].forEach((y) => { ctx.beginPath(); ctx.moveTo(C - 70, y); ctx.quadraticCurveTo(C - 35, y + 12, C - 6, y); ctx.moveTo(C + 6, y); ctx.quadraticCurveTo(C + 35, y + 12, C + 70, y); ctx.stroke(); });
      ctx.fillStyle = 'rgba(255,220,190,0.14)'; ctx.beginPath(); ctx.ellipse(C - 90, 760, 70, 40, -0.3, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(C + 110, 760, 60, 36, 0.3, 0, 7); ctx.fill();
      [[-1], [1]].forEach(([d]) => { ctx.beginPath(); ctx.ellipse(C + d * 205, 690, 66, 58, d * 0.5, 0, 7); preenche(rg(C + d * 190, 670, 5, 80, [[0, PELE_L], [1, PELE]]), 3); });
      // o pano branco cruzado (do ombro esquerdo dele ao quadril), com renda e contas azuis
      caminho([[C + 120, 610], [C + 230, 650], [C + 60, 900, C - 40, 1020, C - 175, 1120], [C - 230, 1080], [C - 80, 980, C + 30, 820, C + 120, 610]]);
      preenche(lg(C - 230, 1100, C + 230, 620, [[0, BR2], [0.5, '#FFFFFF'], [1, BR2]]), 3);
      dobra([[C + 150, 680], [C + 60, 840, C - 30, 960, C - 150, 1070]], 0.12);
      for (let q = 0; q <= 1; q += 0.035) { conta(C + 120 + (C - 230 - (C + 120)) * q + Math.sin(q * 3) * 30 * (1 - q), 610 + (1080 - 610) * q, 4.2, q * 100 % 14 < 7 ? AZ : '#FFFFFF', false); }
      for (let q = 0; q <= 1; q += 0.035) { conta(C + 230 + (C - 175 - (C + 230)) * q, 650 + (1120 - 650) * q, 4.2, AZ2, false); }
      // colares: corrente de prata e fio azul e branco (sem vermelho)
      fioPescoco(C, 610, 56, 1095, 4, 13, 5.4, (k) => k === 0 ? [PR, PR2] : k % 2 ? [AZ, '#FFFFFF'] : ['#FFFFFF', '#FFFFFF', AZ]);
      // os braços fortes: o direito segura a espada; o esquerdo, o atori
      braco([[C - 205, 690], [C - 280, 900], [C - 150, 930]], 92, [[0, 0.4, 30], [1, 0.75, 40]]);
      braco([[C + 205, 690], [C + 300, 880], [C + 320, 900]], 92, [[0, 0.4, 30]]);
      mao(C + 330, 900, 50, -0.6);
      // a espada de metal, reta, erguida na diagonal
      ctx.save(); ctx.translate(C - 140, 930); ctx.rotate(-0.42);
      caminho([[-26, -40], [-22, -520], [0, -600], [22, -520], [26, -40]]); preenche(lg(-26, 0, 26, 0, [[0, PR2], [0.45, '#FFFFFF'], [0.55, PR], [1, PR3]]), 3.5);
      ctx.strokeStyle = PR3; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(0, -560); ctx.stroke();
      ctx.strokeStyle = 'rgba(31,92,142,0.55)'; ctx.lineWidth = 2; for (let y = -120; y > -460; y -= 60) { ctx.beginPath(); ctx.moveTo(-10, y); ctx.quadraticCurveTo(0, y - 20, 10, y); ctx.stroke(); }
      caminho([[-90, -46], [90, -46], [80, -24], [-80, -24]]); preenche(metal(0, -46, 0, -24), 3);
      ctx.beginPath(); ctx.roundRect(-18, -24, 36, 110, 10); preenche(lg(-18, 0, 18, 0, [[0, AZ3], [0.5, AZ2], [1, AZ3]]), 3);
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2; for (let y = -10; y < 80; y += 14) { ctx.beginPath(); ctx.moveTo(-16, y); ctx.lineTo(16, y + 8); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(0, 98, 20, 0, 7); preenche(metal(-20, 80, 20, 118), 3);
      ctx.restore();
      mao(C - 150, 930, 52, 0.4);
      // pescoço, cabeça, coroa alta e a franja com contas azuis
      ctx.fillStyle = PELE; ctx.beginPath(); ctx.roundRect(C - 55, 520, 110, 120, 30); ctx.fill(); tinta(3); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(C, 450, 100, 122, 0, 0, 7); preenche(rg(C - 30, 420, 10, 150, [[0, PELE_L], [1, PELE]]), 3.5);
      { const fx = C, fy = 470; ctx.strokeStyle = PELE_S; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(fx - 52, fy - 14); ctx.quadraticCurveTo(fx - 34, fy - 4, fx - 16, fy - 12); ctx.moveTo(fx + 16, fy - 12); ctx.quadraticCurveTo(fx + 34, fy - 4, fx + 52, fy - 14); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(fx, fy - 8); ctx.quadraticCurveTo(fx - 12, fy + 34, fx + 8, fy + 40); ctx.stroke(); ctx.fillStyle = '#4A2618'; ctx.beginPath(); ctx.ellipse(fx, fy + 74, 26, 10, 0, 0, 7); ctx.fill(); }
      const by = 400;
      caminho([[C - 100, by], [C - 128, by - 240], [C + 128, by - 240], [C + 100, by]]); preenche(metal(C - 128, by - 240, C + 128, by), 3.5);
      caminho([[C - 138, by - 240], [C, by - 270, C + 138, by - 240, C + 138, by - 240], [C + 128, by - 222], [C, by - 246, C - 128, by - 222, C - 128, by - 222]]); preenche(metal(0, by - 270, 0, by - 222), 3);
      for (let i = -3; i <= 3; i++) conta(C + i * 36, by - 252 - (3 - Math.abs(i)) * 4, 7, i % 2 ? AZ2 : '#FFFFFF');
      ctx.strokeStyle = PR3; ctx.lineWidth = 2.5;   // o relevo em arabescos
      [[-1], [1]].forEach(([d]) => { for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.arc(C + d * 82, by - 80 - k * 76, 20, d > 0 ? Math.PI * 0.5 : -Math.PI * 0.5, d > 0 ? Math.PI * 1.9 : Math.PI * 0.9); ctx.stroke(); } });
      ctx.beginPath(); ctx.arc(C, by - 140, 62, 0, 7); preenche(metal(C - 62, by - 202, C + 62, by - 78), 3);
      ctx.beginPath(); ctx.arc(C, by - 140, 48, 0, 7); preenche(rg(C - 16, by - 156, 5, 58, [[0, '#CFE8F8'], [0.7, AZ2], [1, AZ]]), 3);
      pomba(C - 6, by - 138, 0.25, 0.35);
      ctx.beginPath(); ctx.ellipse(C, by - 54, 16, 20, 0, 0, 7); preenche(rg(C - 6, by - 68, 2, 26, [[0, '#DDF0FF'], [0.6, AZ], [1, AZ3]]), 3);
      ctx.fillStyle = metal(0, by - 40, 0, by); ctx.beginPath(); ctx.roundRect(C - 110, by - 34, 220, 34, 6); ctx.fill(); tinta(3); ctx.stroke();
      for (let i = 0; i < 11; i++) conta(C - 100 + i * 20, by - 17, 5.6, i % 2 ? AZ2 : '#FFFFFF');
      for (let i = -9; i <= 9; i++) { const x = C + i * 11, comp = 210 - Math.abs(i) * 3;
        ctx.strokeStyle = 'rgba(90,98,110,0.4)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, by); ctx.lineTo(x, by + comp); ctx.stroke();
        for (let y = by + 6; y < by + comp; y += 14) conta(x, y, 4.4, (Math.floor(y / 14) + i) % 4 === 0 ? AZ : '#FFFFFF'); }
      ctx.restore();
    })();
  },
};
