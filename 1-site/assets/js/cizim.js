/*!
 * Zümrüt İletişim — Özgün cihaz çizimleri (SVG)
 * Ürün fotoğrafı yüklenmemiş ürünler için temsili, stilize çizimler üretir.
 * Marka logosu veya birebir ürün tasarımı içermez.
 * Kullanım: ZI.cizim.url({ cizim: 'telefon', gorunum: 'arka', kamera: 'ucgen', renk: '#6b2233' })
 */
(function (g) {
  'use strict';
  var ZI = g.ZI = g.ZI || {};

  /* ---------------- Renk yardımcıları ---------------- */
  function hexRgb(h) {
    h = String(h || '#888888').replace('#', '').trim();
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16);
    if (isNaN(n)) n = 0x888888;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbHex(r, gg, b) {
    return '#' + [r, gg, b].map(function (v) {
      v = Math.max(0, Math.min(255, Math.round(v)));
      return (v < 16 ? '0' : '') + v.toString(16);
    }).join('');
  }
  function karistir(a, b, t) {
    var A = hexRgb(a), B = hexRgb(b);
    return rgbHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
  }
  function acik(h, t) { return karistir(h, '#ffffff', t); }
  function koyu(h, t) { return karistir(h, '#000000', t); }
  function isik(h) { var c = hexRgb(h); return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255; }

  /* ---------------- SVG tuvali ---------------- */
  function Tuval(w, h) { this.w = w; this.h = h; this.defs = []; this.govde = []; this.n = 0; }
  Tuval.prototype.id = function (p) { this.n += 1; return (p || 'i') + this.n; };
  Tuval.prototype.def = function (s) { this.defs.push(s); };
  Tuval.prototype.ekle = function (s) { this.govde.push(s); };
  Tuval.prototype.svg = function () {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + this.w + ' ' + this.h +
      '" width="' + this.w + '" height="' + this.h + '"><defs>' + this.defs.join('') + '</defs>' +
      this.govde.join('') + '</svg>';
  };

  function duraklar(stops) {
    return stops.map(function (s) {
      return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>';
    }).join('');
  }
  function dogrusal(t, stops, x1, y1, x2, y2) {
    var id = t.id('l');
    t.def('<linearGradient id="' + id + '" x1="' + (x1 || 0) + '" y1="' + (y1 || 0) + '" x2="' + (x2 == null ? 1 : x2) +
      '" y2="' + (y2 || 0) + '">' + duraklar(stops) + '</linearGradient>');
    return 'url(#' + id + ')';
  }
  function dairesel(t, stops, cx, cy, r, fx, fy) {
    var id = t.id('r');
    t.def('<radialGradient id="' + id + '" cx="' + (cx == null ? 0.5 : cx) + '" cy="' + (cy == null ? 0.5 : cy) + '" r="' + (r || 0.5) + '"' +
      (fx != null ? ' fx="' + fx + '" fy="' + fy + '"' : '') + '>' + duraklar(stops) + '</radialGradient>');
    return 'url(#' + id + ')';
  }
  function kirp(t, sekil) {
    var id = t.id('c');
    t.def('<clipPath id="' + id + '">' + sekil + '</clipPath>');
    return 'url(#' + id + ')';
  }
  function yuvarlak(x, y, w, h, r, ek) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r + '"' + (ek || '') + '/>';
  }
  var YAZI = 'font-family="Helvetica Neue,Helvetica,Arial,sans-serif"';

  /* ---------------- Metalik çerçeve ve cam ---------------- */
  function cerceve(t, c, dikey) {
    var parlak = isik(c) > 0.62;
    var stops = [
      [0, koyu(c, parlak ? 0.28 : 0.45)],
      [0.06, acik(c, parlak ? 0.55 : 0.32)],
      [0.2, c],
      [0.5, acik(c, parlak ? 0.2 : 0.12)],
      [0.8, c],
      [0.94, acik(c, parlak ? 0.5 : 0.28)],
      [1, koyu(c, parlak ? 0.3 : 0.5)]
    ];
    return dikey ? dogrusal(t, stops, 0, 0, 0, 1) : dogrusal(t, stops, 0, 0, 1, 0);
  }
  function arkaCam(t, c) {
    return dogrusal(t, [[0, acik(c, 0.14)], [0.45, c], [1, koyu(c, 0.1)]], 0, 0, 1, 1);
  }

  /* ---------------- Duvar kağıtları ---------------- */
  var DUVARLAR = {
    zumrut: { taban: ['#03261f', '#0b5a45'], lekeler: [['#34d399', 0.8, 0.22, 0.7, 0.6], ['#22d3ee', 0.6, 0.85, 0.3, 0.55], ['#bbf7d0', 0.5, 0.3, 0.15, 0.35], ['#059669', 0.7, 0.8, 0.9, 0.5]] },
    gunbatimi: { taban: ['#ff9966', '#ff5e62'], lekeler: [['#ffd166', 0.85, 0.2, 0.25, 0.5], ['#ef476f', 0.7, 0.85, 0.55, 0.55], ['#7b2ff7', 0.55, 0.3, 0.95, 0.6]] },
    okyanus: { taban: ['#061a40', '#0353a4'], lekeler: [['#00c6ff', 0.75, 0.8, 0.25, 0.55], ['#7ee8fa', 0.5, 0.2, 0.55, 0.45], ['#3a0ca3', 0.6, 0.35, 0.95, 0.6]] },
    gece: { taban: ['#07051a', '#1b1340'], lekeler: [['#8e2de2', 0.75, 0.25, 0.35, 0.55], ['#4361ee', 0.7, 0.85, 0.7, 0.55], ['#f72585', 0.45, 0.7, 0.15, 0.4]] },
    lavanta: { taban: ['#c9b6f2', '#8ec5fc'], lekeler: [['#f9a8d4', 0.8, 0.2, 0.3, 0.5], ['#a78bfa', 0.7, 0.85, 0.65, 0.55], ['#e0f2fe', 0.7, 0.4, 0.95, 0.45]] },
    kum: { taban: ['#f6d365', '#fda085'], lekeler: [['#fff1c1', 0.8, 0.25, 0.2, 0.45], ['#f472b6', 0.45, 0.85, 0.75, 0.5], ['#fb923c', 0.6, 0.2, 0.9, 0.5]] },
    aurora: { taban: ['#020617', '#0b1d3a'], lekeler: [['#00f5a0', 0.7, 0.2, 0.3, 0.5], ['#00d9f5', 0.65, 0.8, 0.45, 0.5], ['#7b2ff7', 0.7, 0.45, 0.9, 0.6]] },
    grafit: { taban: ['#111214', '#2b2d31'], lekeler: [['#9ca3af', 0.35, 0.25, 0.3, 0.5], ['#60a5fa', 0.35, 0.85, 0.7, 0.55], ['#e5e7eb', 0.2, 0.5, 0.05, 0.4]] }
  };
  function duvarSec(o) {
    if (o.duvar && DUVARLAR[o.duvar]) return o.duvar;
    var c = hexRgb(o.renk || '#333');
    var l = isik(o.renk || '#333');
    if (c[0] > c[2] + 25 && c[0] > c[1]) return l > 0.6 ? 'kum' : 'gunbatimi';
    if (c[1] > c[0] + 10 && c[1] >= c[2] - 5) return 'zumrut';
    if (c[2] > c[0] + 20) return l > 0.65 ? 'lavanta' : 'okyanus';
    if (l < 0.3) return 'gece';
    return 'aurora';
  }
  function duvarKagidi(t, x, y, w, h, r, ad) {
    var d = DUVARLAR[ad] || DUVARLAR.zumrut;
    var clip = kirp(t, yuvarlak(x, y, w, h, r));
    var s = '<g clip-path="' + clip + '">';
    s += yuvarlak(x, y, w, h, 0, ' fill="' + dogrusal(t, [[0, d.taban[0]], [1, d.taban[1]]], 0, 0, 0.35, 1) + '"');
    d.lekeler.forEach(function (l) {
      var R = l[4] * Math.max(w, h);
      s += '<ellipse cx="' + (x + l[2] * w) + '" cy="' + (y + l[3] * h) + '" rx="' + R + '" ry="' + (R * 0.85) +
        '" fill="' + dairesel(t, [[0, l[0], l[1]], [0.55, l[0], l[1] * 0.35], [1, l[0], 0]]) + '"/>';
    });
    s += '<path d="M' + x + ' ' + (y + h * 0.6) + ' C ' + (x + w * 0.3) + ' ' + (y + h * 0.5) + ', ' + (x + w * 0.62) + ' ' + (y + h * 0.78) + ', ' + (x + w) + ' ' + (y + h * 0.62) +
      ' L ' + (x + w) + ' ' + (y + h) + ' L ' + x + ' ' + (y + h) + ' Z" fill="#fff" opacity=".08"/>';
    s += '<path d="M' + x + ' ' + (y + h * 0.74) + ' C ' + (x + w * 0.36) + ' ' + (y + h * 0.64) + ', ' + (x + w * 0.7) + ' ' + (y + h * 0.9) + ', ' + (x + w) + ' ' + (y + h * 0.74) +
      ' L ' + (x + w) + ' ' + (y + h) + ' L ' + x + ' ' + (y + h) + ' Z" fill="#fff" opacity=".07"/>';
    s += '</g>';
    return { svg: s, clip: clip };
  }
  function yansima(t, clip, x, y, w, h) {
    return '<g clip-path="' + clip + '"><path d="M' + x + ' ' + y + ' L ' + (x + w * 0.7) + ' ' + y + ' L ' + x + ' ' + (y + h * 0.55) + ' Z" fill="' +
      dogrusal(t, [[0, '#ffffff', 0.16], [1, '#ffffff', 0]], 0, 0, 1, 1) + '"/></g>';
  }

  /* ---------------- Kamera lensi ---------------- */
  function lens(t, cx, cy, R, c) {
    var halka = dairesel(t, [[0.8, koyu(c || '#777', 0.5)], [0.9, acik(c || '#999', 0.45)], [1, koyu(c || '#777', 0.35)]]);
    var cam = dairesel(t, [[0, '#3b4a7a'], [0.35, '#16193a'], [0.75, '#050509'], [1, '#000000']], 0.38, 0.36, 0.7);
    var s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="' + halka + '"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R * 0.86) + '" fill="#0a0a0d"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R * 0.7) + '" fill="' + cam + '"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R * 0.34) + '" fill="#020203"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R * 0.22) + '" fill="none" stroke="#5b4bb7" stroke-opacity=".55" stroke-width="' + (R * 0.05) + '"/>';
    s += '<ellipse cx="' + (cx - R * 0.26) + '" cy="' + (cy - R * 0.28) + '" rx="' + (R * 0.17) + '" ry="' + (R * 0.11) + '" transform="rotate(-35 ' + (cx - R * 0.26) + ' ' + (cy - R * 0.28) + ')" fill="#fff" opacity=".55"/>';
    s += '<circle cx="' + (cx + R * 0.24) + '" cy="' + (cy + R * 0.26) + '" r="' + (R * 0.06) + '" fill="#9fb4ff" opacity=".5"/>';
    return s;
  }
  function flas(cx, cy, r) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#f3ead2"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.6) + '" fill="#fff8e6" opacity=".9"/>';
  }
  function ada(t, x, y, w, h, r, c) {
    var dolgu = dogrusal(t, [[0, acik(c, isik(c) > 0.6 ? 0.35 : 0.18)], [1, koyu(c, 0.06)]], 0, 0, 1, 1);
    return yuvarlak(x, y, w, h, r, ' fill="' + dolgu + '" stroke="' + koyu(c, 0.22) + '" stroke-opacity=".6" stroke-width="1.2"') +
      yuvarlak(x + 1.5, y + 1.5, w - 3, h - 3, r - 1.5, ' fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1"');
  }

  /* ---------------- Yan tuşlar ---------------- */
  function yanTuslar(t, W, H, c, olcek) {
    var k = olcek || 1, f = cerceve(t, c, true), s = '';
    s += yuvarlak(0.5, H * 0.2, 6, 30 * k, 3, ' fill="' + f + '"');
    s += yuvarlak(0.5, H * 0.28, 6, 52 * k, 3, ' fill="' + f + '"');
    s += yuvarlak(0.5, H * 0.38, 6, 52 * k, 3, ' fill="' + f + '"');
    s += yuvarlak(W - 6.5, H * 0.3, 6, 84 * k, 3, ' fill="' + f + '"');
    return s;
  }

  /* ---------------- Ekran içerikleri ---------------- */
  function kilitEkrani(W, sy, olcek) {
    var k = olcek || 1;
    return '<text x="' + (W / 2) + '" y="' + (sy + 62 * k) + '" text-anchor="middle" ' + YAZI + ' font-size="' + (14 * k) + '" font-weight="500" fill="#fff" fill-opacity=".86">Pazartesi 28 Eylül</text>' +
      '<text x="' + (W / 2) + '" y="' + (sy + 128 * k) + '" text-anchor="middle" ' + YAZI + ' font-size="' + (70 * k) + '" font-weight="600" letter-spacing="-2" fill="#fff" fill-opacity=".94">09:00</text>';
  }
  var UYGULAMA_RENK = [['#34d399', '#059669'], ['#60a5fa', '#2563eb'], ['#fbbf24', '#f97316'], ['#f472b6', '#db2777'], ['#a78bfa', '#7c3aed'],
    ['#f87171', '#dc2626'], ['#2dd4bf', '#0d9488'], ['#e5e7eb', '#9ca3af'], ['#fde68a', '#f59e0b'], ['#93c5fd', '#6366f1'], ['#86efac', '#16a34a'], ['#fca5a5', '#fb7185']];
  function simge(t, x, y, s, i) {
    var p = UYGULAMA_RENK[i % UYGULAMA_RENK.length];
    var d = dogrusal(t, [[0, p[0]], [1, p[1]]], 0, 0, 0, 1);
    var o = yuvarlak(x, y, s, s, s * 0.24, ' fill="' + d + '"');
    var cx = x + s / 2, cy = y + s / 2, m = s * 0.22;
    switch (i % 6) {
      case 0: o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + m + '" fill="none" stroke="#fff" stroke-width="' + (s * 0.07) + '"/>'; break;
      case 1: o += yuvarlak(cx - m, cy - m * 0.8, m * 2, m * 1.6, m * 0.3, ' fill="none" stroke="#fff" stroke-width="' + (s * 0.07) + '"'); break;
      case 2: o += '<path d="M' + (cx - m) + ' ' + (cy + m * 0.7) + ' L ' + cx + ' ' + (cy - m) + ' L ' + (cx + m) + ' ' + (cy + m * 0.7) + ' Z" fill="#fff" opacity=".92"/>'; break;
      case 3: o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (m * 0.9) + '" fill="#fff" opacity=".92"/>'; break;
      case 4: o += yuvarlak(cx - m, cy - m * 0.12, m * 2, m * 0.24, m * 0.12, ' fill="#fff"') + yuvarlak(cx - m * 0.12, cy - m, m * 0.24, m * 2, m * 0.12, ' fill="#fff"'); break;
      default: o += yuvarlak(cx - m, cy - m * 0.6, m * 0.5, m * 1.4, 2, ' fill="#fff"') + yuvarlak(cx - m * 0.2, cy - m, m * 0.5, m * 1.8, 2, ' fill="#fff"') + yuvarlak(cx + m * 0.6, cy - m * 0.2, m * 0.5, m, 2, ' fill="#fff"');
    }
    return o;
  }
  function anaEkran(t, x, y, w, h, sutun, satir, bas) {
    var s = '', pad = w * 0.075, g = (w - pad * 2) / sutun, ic = g * 0.72, i = bas || 0;
    for (var r = 0; r < satir; r++) {
      for (var c = 0; c < sutun; c++) {
        s += simge(t, x + pad + c * g + (g - ic) / 2, y + r * (g * 1.08), ic, i++);
      }
    }
    return s;
  }
  function cam(t, x, y, w, h, r, opak) {
    return yuvarlak(x, y, w, h, r, ' fill="' + dogrusal(t, [[0, '#ffffff', opak || 0.18], [0.5, '#ffffff', 0.06], [1, '#ffffff', 0.14]], 0, 0, 1, 1) +
      '" stroke="#ffffff" stroke-opacity=".5" stroke-width="1"');
  }

  /* ---------------- Telefon ---------------- */
  function telefon(o) {
    var W = 300, H = Math.round(W / (o.oran || 0.485)), c = o.renk || '#2e2e30', R = o.kose || 46;
    var t = new Tuval(W, H);
    t.ekle(yanTuslar(t, W, H, c));
    t.ekle(yuvarlak(4, 4, W - 8, H - 8, R, ' fill="' + cerceve(t, c) + '"'));
    if (o.gorunum === 'arka') {
      t.ekle(yuvarlak(8, 8, W - 16, H - 16, R - 4, ' fill="' + arkaCam(t, c) + '"'));
      var parlama = kirp(t, yuvarlak(8, 8, W - 16, H - 16, R - 4));
      t.ekle('<g clip-path="' + parlama + '"><path d="M8 ' + (H * 0.72) + ' L ' + (W - 8) + ' ' + (H * 0.32) + ' L ' + (W - 8) + ' ' + (H * 0.5) + ' L 8 ' + (H * 0.9) + ' Z" fill="#fff" opacity=".07"/></g>');
      t.ekle(kameraDuzeni(t, W, H, c, o.kamera || 'ucgen'));
    } else {
      t.ekle(yuvarlak(9, 9, W - 18, H - 18, R - 5, ' fill="#050506"'));
      var sx = 15, sy = 15, sw = W - 30, sh = H - 30;
      var dk = duvarKagidi(t, sx, sy, sw, sh, R - 11, duvarSec(o));
      t.ekle(dk.svg);
      t.ekle(kilitEkrani(W, sy));
      t.ekle(yuvarlak(W / 2 - 34, sh - 20, 68, 5, 2.5, ' fill="#fff" opacity=".8"'));
      if (o.on === 'delik') t.ekle('<circle cx="' + (W / 2) + '" cy="' + (sy + 20) + '" r="7" fill="#000"/>');
      else t.ekle(yuvarlak(W / 2 - 38, sy + 10, 76, 22, 11, ' fill="#000"'));
      t.ekle(yansima(t, dk.clip, sx, sy, sw, sh));
    }
    return t.svg();
  }

  function kameraDuzeni(t, W, H, c, tip) {
    var s = '';
    var halka = isik(c) > 0.55 ? koyu(c, 0.25) : acik(c, 0.25);
    switch (tip) {
      case 'ucgen':
        s += ada(t, 22, 22, 138, 138, 40, c);
        s += lens(t, 60, 60, 27, halka) + lens(t, 60, 122, 27, halka) + lens(t, 122, 91, 27, halka);
        s += flas(122, 46, 8) + '<circle cx="122" cy="138" r="7" fill="#101114"/>';
        break;
      case 'plato':
        s += ada(t, 12, 20, W - 24, 118, 44, c);
        s += lens(t, 58, 52, 24, halka) + lens(t, 58, 106, 24, halka) + lens(t, 112, 79, 24, halka);
        s += flas(232, 62, 8) + '<circle cx="232" cy="98" r="6" fill="#101114"/>';
        break;
      case 'ikili':
        s += ada(t, 26, 24, 76, 150, 38, c);
        s += lens(t, 64, 62, 27, halka) + lens(t, 64, 136, 27, halka);
        s += flas(122, 50, 7);
        break;
      case 'tekli':
        s += ada(t, 24, 24, 92, 92, 30, c);
        s += lens(t, 64, 64, 28, halka) + flas(100, 36, 6);
        break;
      case 'tek':
        s += ada(t, 12, 22, W - 24, 84, 42, c);
        s += lens(t, 62, 64, 28, halka) + flas(118, 64, 8) + '<circle cx="246" cy="64" r="5" fill="#101114"/>';
        break;
      case 'yatay2':
        s += ada(t, 12, 22, W - 24, 84, 42, c);
        s += lens(t, 60, 64, 27, halka) + lens(t, 126, 64, 27, halka) + flas(238, 64, 8);
        break;
      case 'dikey3':
        s += lens(t, 62, 64, 29, halka) + lens(t, 62, 134, 29, halka) + lens(t, 62, 204, 29, halka);
        s += flas(118, 60, 8);
        break;
      case 'dikey4':
        s += lens(t, 60, 62, 27, halka) + lens(t, 60, 128, 27, halka) + lens(t, 60, 194, 27, halka) + lens(t, 118, 128, 20, halka);
        s += flas(118, 62, 8) + '<circle cx="118" cy="190" r="6" fill="#101114"/>';
        break;
      case 'daire':
        s += '<circle cx="' + (W / 2) + '" cy="122" r="96" fill="' + dairesel(t, [[0, acik(c, 0.12)], [0.86, c], [0.93, acik(c, 0.4)], [1, koyu(c, 0.3)]]) + '"/>';
        s += '<circle cx="' + (W / 2) + '" cy="122" r="80" fill="' + dairesel(t, [[0, '#26272b'], [1, '#101114']]) + '"/>';
        s += lens(t, W / 2, 80, 26, '#888') + lens(t, W / 2 - 42, 128, 24, '#888') + lens(t, W / 2 + 42, 128, 24, '#888') + flas(W / 2, 176, 7);
        break;
      default: // kare4
        s += ada(t, 22, 22, 138, 138, 36, c);
        s += lens(t, 60, 60, 24, halka) + lens(t, 122, 60, 24, halka) + lens(t, 60, 122, 24, halka) + flas(122, 122, 9);
    }
    return s;
  }

  /* ---------------- Katlanabilir (kitap tipi) ---------------- */
  function katlanir(o) {
    var c = o.renk || '#2b2f3a';
    var gorunum = o.gorunum || 'acik';
    if (gorunum === 'acik') {
      var W = 640, H = Math.round(W / (o.oran || 1.42)), R = 38;
      var t = new Tuval(W, H);
      t.ekle(yuvarlak(3, 3, W - 6, H - 6, R, ' fill="' + cerceve(t, c) + '"'));
      t.ekle(yuvarlak(8, 8, W - 16, H - 16, R - 5, ' fill="#050506"'));
      var sx = 14, sy = 14, sw = W - 28, sh = H - 28;
      var dk = duvarKagidi(t, sx, sy, sw, sh, R - 10, duvarSec(o));
      t.ekle(dk.svg);
      // sol panel: widget kartları
      var kw = sw / 2 - 40;
      t.ekle(yuvarlak(sx + 22, sy + 30, kw, sh * 0.5, 22, ' fill="#ffffff" fill-opacity=".2" stroke="#fff" stroke-opacity=".35"'));
      t.ekle('<text x="' + (sx + 42) + '" y="' + (sy + 66) + '" ' + YAZI + ' font-size="15" font-weight="600" fill="#fff">Kayseri</text>');
      t.ekle('<text x="' + (sx + 40) + '" y="' + (sy + 122) + '" ' + YAZI + ' font-size="54" font-weight="300" fill="#fff">24°</text>');
      t.ekle('<text x="' + (sx + 42) + '" y="' + (sy + 150) + '" ' + YAZI + ' font-size="13" fill="#fff" fill-opacity=".85">Güneşli · Y:27° D:14°</text>');
      t.ekle(yuvarlak(sx + 22, sy + 44 + sh * 0.5, kw / 2 - 8, sh * 0.3, 20, ' fill="#ffffff" fill-opacity=".16"'));
      t.ekle('<text x="' + (sx + 40) + '" y="' + (sy + 84 + sh * 0.5) + '" ' + YAZI + ' font-size="30" font-weight="600" fill="#fff">09:00</text>');
      t.ekle(yuvarlak(sx + 30 + kw / 2, sy + 44 + sh * 0.5, kw / 2 - 8, sh * 0.3, 20, ' fill="#ffffff" fill-opacity=".16"'));
      t.ekle('<circle cx="' + (sx + 30 + kw * 0.75 - 4) + '" cy="' + (sy + 44 + sh * 0.65) + '" r="' + (sh * 0.09) + '" fill="none" stroke="#34d399" stroke-width="7" stroke-dasharray="70 200" transform="rotate(-90 ' + (sx + 30 + kw * 0.75 - 4) + ' ' + (sy + 44 + sh * 0.65) + ')"/>');
      // sağ panel: uygulama ızgarası
      t.ekle(anaEkran(t, sx + sw / 2 + 6, sy + 34, sw / 2 - 12, sh, 4, 3, 0));
      t.ekle(yuvarlak(sx + sw / 2 + 30, sy + sh - 70, sw / 2 - 60, 54, 22, ' fill="#ffffff" fill-opacity=".22"'));
      for (var i = 0; i < 4; i++) t.ekle(simge(t, sx + sw / 2 + 48 + i * ((sw / 2 - 96) / 3.2), sy + sh - 62, 38, i + 6));
      // menteşe kıvrımı
      t.ekle('<rect x="' + (W / 2 - 7) + '" y="' + sy + '" width="14" height="' + sh + '" fill="' + dogrusal(t, [[0, '#000', 0], [0.42, '#000', 0.22], [0.5, '#fff', 0.18], [0.58, '#000', 0.22], [1, '#000', 0]]) + '"/>');
      t.ekle('<circle cx="' + (W * 0.75) + '" cy="' + (sy + 16) + '" r="4" fill="#000" opacity=".5"/>');
      t.ekle(yansima(t, dk.clip, sx, sy, sw, sh));
      return t.svg();
    }
    // kapalı görünüm (pasaport oranı)
    var W2 = 300, H2 = Math.round(W2 / (o.oranKapali || 0.69)), R2 = 42;
    var t2 = new Tuval(W2, H2);
    t2.ekle(yanTuslar(t2, W2, H2, c, 0.8));
    t2.ekle(yuvarlak(4, 4, W2 - 8, H2 - 8, R2, ' fill="' + cerceve(t2, c) + '"'));
    if (gorunum === 'kapali-arka') {
      t2.ekle(yuvarlak(8, 8, W2 - 16, H2 - 16, R2 - 4, ' fill="' + arkaCam(t2, c) + '"'));
      t2.ekle(kameraDuzeni(t2, W2, H2, c, o.kamera || 'yatay2'));
      // menteşe sırtı
      t2.ekle('<rect x="4" y="' + (R2 * 0.6) + '" width="7" height="' + (H2 - R2 * 1.2) + '" rx="3" fill="' + dogrusal(t2, [[0, koyu(c, 0.4)], [1, acik(c, 0.3)]]) + '"/>');
    } else {
      t2.ekle(yuvarlak(9, 9, W2 - 18, H2 - 18, R2 - 5, ' fill="#050506"'));
      var dk2 = duvarKagidi(t2, 15, 15, W2 - 30, H2 - 30, R2 - 11, duvarSec(o));
      t2.ekle(dk2.svg);
      t2.ekle(kilitEkrani(W2, 5, 0.92));
      t2.ekle('<circle cx="' + (W2 / 2) + '" cy="34" r="6.5" fill="#000"/>');
      t2.ekle(yansima(t2, dk2.clip, 15, 15, W2 - 30, H2 - 30));
    }
    return t2.svg();
  }

  /* ---------------- Kapaklı katlanabilir (flip) ---------------- */
  function flip(o) {
    var c = o.renk || '#f0c9d0';
    if (o.gorunum === 'kapali') {
      var W = 300, H = 350, R = 44, t = new Tuval(W, H);
      t.ekle(yuvarlak(4, 4, W - 8, H - 8, R, ' fill="' + cerceve(t, c) + '"'));
      t.ekle(yuvarlak(8, 8, W - 16, H - 16, R - 4, ' fill="' + arkaCam(t, c) + '"'));
      t.ekle(yuvarlak(16, 16, W - 32, H - 50, R - 14, ' fill="#050506"'));
      var dk = duvarKagidi(t, 20, 20, W - 40, H - 58, R - 18, duvarSec(o));
      t.ekle(dk.svg);
      t.ekle('<text x="' + (W / 2 + 30) + '" y="96" text-anchor="middle" ' + YAZI + ' font-size="52" font-weight="600" fill="#fff" fill-opacity=".92">09:00</text>');
      t.ekle('<text x="' + (W / 2 + 30) + '" y="122" text-anchor="middle" ' + YAZI + ' font-size="13" fill="#fff" fill-opacity=".85">Pzt 28 Eyl</text>');
      t.ekle(lens(t, 66, H - 92, 26, '#888') + lens(t, 132, H - 92, 26, '#888') + flas(188, H - 92, 7));
      t.ekle('<rect x="' + (R) + '" y="' + (H - 12) + '" width="' + (W - R * 2) + '" height="6" rx="3" fill="' + koyu(c, 0.35) + '" opacity=".6"/>');
      return t.svg();
    }
    var W2 = 280, H2 = 650, R2 = 40, t2 = new Tuval(W2, H2);
    t2.ekle(yanTuslar(t2, W2, H2, c, 0.8));
    t2.ekle(yuvarlak(4, 4, W2 - 8, H2 - 8, R2, ' fill="' + cerceve(t2, c) + '"'));
    t2.ekle(yuvarlak(9, 9, W2 - 18, H2 - 18, R2 - 5, ' fill="#050506"'));
    var dk2 = duvarKagidi(t2, 15, 15, W2 - 30, H2 - 30, R2 - 11, duvarSec(o));
    t2.ekle(dk2.svg);
    t2.ekle(kilitEkrani(W2, 25));
    t2.ekle('<circle cx="' + (W2 / 2) + '" cy="32" r="6.5" fill="#000"/>');
    t2.ekle('<rect x="15" y="' + (H2 / 2 - 5) + '" width="' + (W2 - 30) + '" height="10" fill="' + dogrusal(t2, [[0, '#000', 0], [0.45, '#000', 0.2], [0.5, '#fff', 0.2], [0.55, '#000', 0.2], [1, '#000', 0]], 0, 0, 0, 1) + '"/>');
    t2.ekle('<rect x="0" y="' + (H2 / 2 - 14) + '" width="8" height="28" rx="3" fill="' + koyu(c, 0.3) + '"/><rect x="' + (W2 - 8) + '" y="' + (H2 / 2 - 14) + '" width="8" height="28" rx="3" fill="' + koyu(c, 0.3) + '"/>');
    t2.ekle(yansima(t2, dk2.clip, 15, 15, W2 - 30, H2 - 30));
    return t2.svg();
  }

  /* ---------------- Tablet ---------------- */
  function tablet(o) {
    var W = 460, H = Math.round(W / (o.oran || 0.72)), c = o.renk || '#d9dadc', R = 34;
    var t = new Tuval(W, H);
    t.ekle(yuvarlak(W - 6, H * 0.12, 5, 44, 2.5, ' fill="' + cerceve(t, c, true) + '"'));
    t.ekle(yuvarlak(3, 3, W - 9, H - 6, R, ' fill="' + cerceve(t, c) + '"'));
    t.ekle(yuvarlak(8, 8, W - 19, H - 16, R - 5, ' fill="#050506"'));
    var sx = 22, sy = 22, sw = W - 47, sh = H - 44;
    var dk = duvarKagidi(t, sx, sy, sw, sh, 16, duvarSec(o));
    t.ekle(dk.svg);
    t.ekle('<text x="' + (sx + 34) + '" y="' + (sy + 92) + '" ' + YAZI + ' font-size="64" font-weight="600" letter-spacing="-2" fill="#fff" fill-opacity=".94">09:00</text>');
    t.ekle('<text x="' + (sx + 36) + '" y="' + (sy + 120) + '" ' + YAZI + ' font-size="15" font-weight="500" fill="#fff" fill-opacity=".86">Pazartesi 28 Eylül</text>');
    t.ekle(anaEkran(t, sx + 10, sy + sh * 0.42, sw - 20, sh, 5, 3, 2));
    t.ekle('<circle cx="' + (W - 14) + '" cy="' + (H / 2) + '" r="3.2" fill="#1b1c20"/>');
    t.ekle(yansima(t, dk.clip, sx, sy, sw, sh));
    return t.svg();
  }

  /* ---------------- Dizüstü ---------------- */
  function laptop(o) {
    var W = 680, H = 430, c = o.renk || '#d9dadc', t = new Tuval(W, H);
    var lx = 86, ly = 8, lw = W - 172, lh = 360;
    t.ekle(yuvarlak(lx, ly, lw, lh, 20, ' fill="' + dogrusal(t, [[0, acik(c, 0.2)], [1, koyu(c, 0.15)]], 0, 0, 0, 1) + '"'));
    t.ekle(yuvarlak(lx + 5, ly + 5, lw - 10, lh - 8, 16, ' fill="#08090a"'));
    var sx = lx + 16, sy = ly + 18, sw = lw - 32, sh = lh - 30;
    var dk = duvarKagidi(t, sx, sy, sw, sh, 6, duvarSec(o));
    t.ekle(dk.svg);
    t.ekle(yuvarlak(sx, sy, sw, 16, 0, ' fill="#000" fill-opacity=".28"'));
    t.ekle('<text x="' + (sx + sw - 60) + '" y="' + (sy + 12) + '" ' + YAZI + ' font-size="9" fill="#fff" fill-opacity=".85">Pzt 09:00</text>');
    // pencere
    t.ekle(yuvarlak(sx + sw * 0.16, sy + sh * 0.2, sw * 0.5, sh * 0.58, 10, ' fill="#fff" fill-opacity=".9"'));
    t.ekle(yuvarlak(sx + sw * 0.16, sy + sh * 0.2, sw * 0.5, 22, 10, ' fill="#f1f1f4"'));
    ['#ff5f57', '#febc2e', '#28c840'].forEach(function (r, i) { t.ekle('<circle cx="' + (sx + sw * 0.16 + 16 + i * 14) + '" cy="' + (sy + sh * 0.2 + 11) + '" r="4.5" fill="' + r + '"/>'); });
    for (var i = 0; i < 5; i++) t.ekle(yuvarlak(sx + sw * 0.19, sy + sh * 0.2 + 40 + i * 20, sw * (0.44 - (i % 2) * 0.12), 8, 4, ' fill="#d4d4d8"'));
    t.ekle(yuvarlak(sx + sw * 0.7, sy + sh * 0.3, sw * 0.22, sh * 0.42, 12, ' fill="#fff" fill-opacity=".22" stroke="#fff" stroke-opacity=".35"'));
    t.ekle(yuvarlak(sx + sw * 0.28, sy + sh - 34, sw * 0.44, 26, 10, ' fill="#fff" fill-opacity=".25"'));
    for (var j = 0; j < 7; j++) t.ekle(simge(t, sx + sw * 0.3 + j * (sw * 0.4 / 7), sy + sh - 30, 18, j + 1));
    t.ekle('<circle cx="' + (W / 2) + '" cy="' + (ly + 11) + '" r="2.6" fill="#1f2023"/>');
    t.ekle(yansima(t, dk.clip, sx, sy, sw, sh));
    // gövde
    var by = ly + lh;
    t.ekle('<path d="M20 ' + (by + 4) + ' L ' + (W - 20) + ' ' + (by + 4) + ' Q ' + (W - 6) + ' ' + (by + 5) + ' ' + (W - 10) + ' ' + (by + 22) + ' Q ' + (W - 14) + ' ' + (by + 36) + ' ' + (W - 60) + ' ' + (by + 38) +
      ' L 60 ' + (by + 38) + ' Q 14 ' + (by + 36) + ' 10 ' + (by + 22) + ' Q 6 ' + (by + 5) + ' 20 ' + (by + 4) + ' Z" fill="' + dogrusal(t, [[0, acik(c, 0.3)], [0.35, c], [1, koyu(c, 0.3)]], 0, 0, 0, 1) + '"/>');
    t.ekle('<rect x="20" y="' + (by + 1) + '" width="' + (W - 40) + '" height="5" rx="2.5" fill="' + acik(c, 0.45) + '"/>');
    t.ekle('<path d="M' + (W / 2 - 60) + ' ' + (by + 4) + ' Q ' + (W / 2 - 54) + ' ' + (by + 14) + ' ' + (W / 2 - 40) + ' ' + (by + 14) + ' L ' + (W / 2 + 40) + ' ' + (by + 14) + ' Q ' + (W / 2 + 54) + ' ' + (by + 14) + ' ' + (W / 2 + 60) + ' ' + (by + 4) + ' Z" fill="' + koyu(c, 0.18) + '" opacity=".55"/>');
    return t.svg();
  }

  /* ---------------- Kulaklık (kutulu) ---------------- */
  function kulaklik(o) {
    var c = o.renk || '#f4f4f5', W = 480, H = 420, t = new Tuval(W, H);
    var govde = dogrusal(t, [[0, acik(c, 0.5)], [0.5, c], [1, koyu(c, 0.14)]], 0, 0, 1, 1);
    var kenar = koyu(c, 0.18);
    // kutu
    t.ekle(yuvarlak(110, 110, 260, 210, 78, ' fill="' + govde + '" stroke="' + kenar + '" stroke-opacity=".35"'));
    t.ekle('<path d="M112 176 Q 240 186 368 176" fill="none" stroke="' + koyu(c, 0.25) + '" stroke-opacity=".5" stroke-width="2"/>');
    t.ekle('<circle cx="240" cy="236" r="5" fill="#22c55e"/><circle cx="240" cy="236" r="10" fill="#22c55e" opacity=".18"/>');
    t.ekle('<ellipse cx="200" cy="140" rx="70" ry="16" fill="#fff" opacity=".35"/>');
    // kulaklıklar
    function tomurcuk(x, y, ayna) {
      var s = ayna ? -1 : 1, st = '';
      st += '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ' 1)">';
      st += yuvarlak(-14, 20, 28, 108, 14, ' fill="' + govde + '" stroke="' + kenar + '" stroke-opacity=".35"');
      st += '<ellipse cx="4" cy="12" rx="44" ry="40" fill="' + govde + '" stroke="' + kenar + '" stroke-opacity=".35"/>';
      st += '<ellipse cx="-18" cy="4" rx="20" ry="17" fill="' + koyu(c, 0.62) + '"/>';
      st += '<ellipse cx="-18" cy="4" rx="13" ry="10" fill="' + koyu(c, 0.8) + '"/>';
      st += '<ellipse cx="20" cy="-6" rx="14" ry="8" fill="#fff" opacity=".45"/>';
      st += yuvarlak(-8, 116, 16, 8, 4, ' fill="' + koyu(c, 0.35) + '" opacity=".6"');
      st += '</g>';
      return st;
    }
    t.ekle(tomurcuk(96, 232, false));
    t.ekle(tomurcuk(384, 232, true));
    return t.svg();
  }

  /* ---------------- Aksesuarlar ---------------- */
  function adaptor(o) {
    var c = o.renk || '#f4f4f5', W = 420, H = 420, t = new Tuval(W, H);
    var d = dogrusal(t, [[0, acik(c, 0.55)], [0.55, c], [1, koyu(c, 0.12)]], 0, 0, 1, 1);
    // pimler
    t.ekle(yuvarlak(150, 36, 26, 90, 13, ' fill="' + dogrusal(t, [[0, '#9ca3af'], [0.5, '#f3f4f6'], [1, '#6b7280']]) + '"'));
    t.ekle(yuvarlak(244, 36, 26, 90, 13, ' fill="' + dogrusal(t, [[0, '#9ca3af'], [0.5, '#f3f4f6'], [1, '#6b7280']]) + '"'));
    // gövde
    t.ekle(yuvarlak(96, 100, 228, 228, 52, ' fill="' + d + '" stroke="' + koyu(c, 0.2) + '" stroke-opacity=".35"'));
    t.ekle(yuvarlak(112, 116, 196, 60, 30, ' fill="#fff" opacity=".35"'));
    // USB-C yuvası
    t.ekle(yuvarlak(180, 270, 60, 20, 10, ' fill="' + koyu(c, 0.7) + '"'));
    t.ekle(yuvarlak(190, 277, 40, 6, 3, ' fill="' + koyu(c, 0.45) + '"'));
    // kablo
    t.ekle('<path d="M210 290 C 210 360, 300 360, 330 410" fill="none" stroke="' + koyu(c, 0.06) + '" stroke-width="16" stroke-linecap="round"/>');
    t.ekle('<path d="M210 290 C 210 360, 300 360, 330 410" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="4" stroke-linecap="round"/>');
    return t.svg();
  }
  function kablo(o) {
    var c = o.renk || '#f4f4f5', W = 420, H = 420, t = new Tuval(W, H), s = koyu(c, 0.1);
    for (var i = 0; i < 4; i++) {
      t.ekle('<ellipse cx="' + (210 + i * 6) + '" cy="' + (200 + i * 5) + '" rx="' + (130 - i * 8) + '" ry="' + (86 - i * 5) + '" fill="none" stroke="' + koyu(c, 0.32) + '" stroke-width="17"/>');
      t.ekle('<ellipse cx="' + (210 + i * 6) + '" cy="' + (200 + i * 5) + '" rx="' + (130 - i * 8) + '" ry="' + (86 - i * 5) + '" fill="none" stroke="' + s + '" stroke-width="14"/>');
      t.ekle('<ellipse cx="' + (210 + i * 6) + '" cy="' + (200 + i * 5) + '" rx="' + (130 - i * 8) + '" ry="' + (86 - i * 5) + '" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>');
    }
    function uc(x, y, a) {
      return '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ')">' +
        yuvarlak(-20, -46, 40, 70, 12, ' fill="' + dogrusal(t, [[0, acik(c, 0.5)], [1, koyu(c, 0.1)]]) + '" stroke="' + koyu(c, 0.25) + '" stroke-opacity=".4"') +
        yuvarlak(-13, -72, 26, 30, 7, ' fill="' + dogrusal(t, [[0, '#9ca3af'], [0.5, '#f3f4f6'], [1, '#6b7280']]) + '"') +
        yuvarlak(-8, -68, 16, 8, 3, ' fill="#374151"') + '</g>';
    }
    ['M110 250 C 70 300, 60 330, 84 360', 'M320 170 C 360 120, 370 90, 350 60'].forEach(function (d) {
      t.ekle('<path d="' + d + '" fill="none" stroke="' + koyu(c, 0.32) + '" stroke-width="17" stroke-linecap="round"/>');
      t.ekle('<path d="' + d + '" fill="none" stroke="' + s + '" stroke-width="14" stroke-linecap="round"/>');
    });
    t.ekle(uc(84, 390, 180));
    t.ekle(uc(350, 88, 10));
    return t.svg();
  }
  function kablosuz(o) {
    var c = o.renk || '#f4f4f5', W = 420, H = 360, t = new Tuval(W, H);
    t.ekle('<ellipse cx="210" cy="196" rx="170" ry="70" fill="' + koyu(c, 0.2) + '"/>');
    t.ekle('<ellipse cx="210" cy="182" rx="170" ry="70" fill="' + dogrusal(t, [[0, acik(c, 0.5)], [1, koyu(c, 0.1)]], 0, 0, 1, 1) + '"/>');
    t.ekle('<ellipse cx="210" cy="182" rx="112" ry="44" fill="none" stroke="' + koyu(c, 0.25) + '" stroke-opacity=".45" stroke-width="3"/>');
    t.ekle('<ellipse cx="210" cy="182" rx="40" ry="15" fill="' + koyu(c, 0.1) + '" opacity=".5"/>');
    t.ekle('<ellipse cx="170" cy="160" rx="80" ry="18" fill="#fff" opacity=".35"/>');
    t.ekle('<circle cx="340" cy="206" r="4" fill="#22c55e"/>');
    t.ekle('<path d="M40 200 C 10 260, 60 320, 140 340" fill="none" stroke="' + koyu(c, 0.1) + '" stroke-width="12" stroke-linecap="round"/>');
    return t.svg();
  }
  function powerbank(o) {
    var c = o.renk || '#2a2b2f', W = 300, H = 460, t = new Tuval(W, H);
    t.ekle(yuvarlak(50, 20, 200, 420, 46, ' fill="' + dogrusal(t, [[0, acik(c, 0.28)], [0.5, c], [1, koyu(c, 0.2)]], 0, 0, 1, 1) + '"'));
    t.ekle('<circle cx="150" cy="200" r="70" fill="none" stroke="' + (isik(c) > 0.5 ? koyu(c, 0.2) : acik(c, 0.2)) + '" stroke-width="10" opacity=".7"/>');
    for (var i = 0; i < 4; i++) t.ekle('<circle cx="' + (120 + i * 20) + '" cy="380" r="5" fill="' + (i < 3 ? '#34d399' : acik(c, 0.3)) + '"/>');
    t.ekle(yuvarlak(125, 24, 50, 10, 5, ' fill="' + koyu(c, 0.5) + '"'));
    t.ekle(yuvarlak(70, 40, 60, 360, 30, ' fill="#fff" opacity=".07"'));
    return t.svg();
  }
  function kilif(o) {
    var c = o.renk || '#8fb3d9', W = 320, H = 640, t = new Tuval(W, H), R = 54;
    var seffaf = o.seffaf;
    var dolgu = seffaf ? dogrusal(t, [[0, '#ffffff', 0.55], [1, '#dbeafe', 0.35]], 0, 0, 1, 1) : dogrusal(t, [[0, acik(c, 0.25)], [0.5, c], [1, koyu(c, 0.15)]], 0, 0, 1, 1);
    t.ekle(yuvarlak(8, 8, W - 16, H - 16, R, ' fill="' + dolgu + '" stroke="' + (seffaf ? '#94a3b8' : koyu(c, 0.3)) + '" stroke-opacity=".6" stroke-width="2"'));
    if (seffaf) t.ekle(yuvarlak(22, 22, W - 44, H - 44, R - 14, ' fill="' + dogrusal(t, [[0, '#e2e8f0'], [1, '#cbd5e1']], 0, 0, 1, 1) + '" opacity=".55"'));
    // kamera boşluğu
    t.ekle(yuvarlak(26, 26, 150, 150, 42, ' fill="' + (seffaf ? '#1f2937' : koyu(c, 0.55)) + '" opacity="' + (seffaf ? 0.85 : 0.9) + '"'));
    t.ekle(yuvarlak(34, 34, 134, 134, 36, ' fill="#111" opacity=".5"'));
    // manyetik halka
    t.ekle('<circle cx="160" cy="360" r="86" fill="none" stroke="' + (seffaf ? '#94a3b8' : koyu(c, 0.2)) + '" stroke-opacity=".55" stroke-width="7"/>');
    t.ekle(yuvarlak(154, 452, 12, 26, 6, ' fill="none" stroke="' + (seffaf ? '#94a3b8' : koyu(c, 0.2)) + '" stroke-opacity=".55" stroke-width="5"'));
    // tuş kabartmaları
    t.ekle(yuvarlak(W - 10, 210, 6, 96, 3, ' fill="' + (seffaf ? '#cbd5e1' : koyu(c, 0.1)) + '"'));
    t.ekle(yuvarlak(4, 150, 6, 64, 3, ' fill="' + (seffaf ? '#cbd5e1' : koyu(c, 0.1)) + '"'));
    t.ekle('<path d="M40 520 L 280 200" stroke="#fff" stroke-opacity=".25" stroke-width="30" stroke-linecap="round"/>');
    return t.svg();
  }
  function ekranKoruyucu(o) {
    var W = 360, H = 640, t = new Tuval(W, H);
    function levha(x, y, a, op) {
      return '<g transform="rotate(' + a + ' ' + (x + 130) + ' ' + (y + 270) + ')">' +
        yuvarlak(x, y, 260, 540, 44, ' fill="' + dogrusal(t, [[0, '#ffffff', 0.85], [0.5, '#e0f2fe', 0.45], [1, '#ffffff', 0.75]], 0, 0, 1, 1) + '" stroke="#94a3b8" stroke-opacity="' + op + '" stroke-width="2"') +
        yuvarlak(x + 8, y + 8, 244, 524, 38, ' fill="none" stroke="#0f172a" stroke-opacity=".7" stroke-width="10"') +
        yuvarlak(x + 96, y + 20, 68, 18, 9, ' fill="#fff" stroke="#94a3b8" stroke-opacity=".5"') +
        '<path d="M' + (x + 30) + ' ' + (y + 420) + ' L ' + (x + 220) + ' ' + (y + 120) + '" stroke="#fff" stroke-width="26" stroke-opacity=".7" stroke-linecap="round"/>' +
        '<path d="M' + (x + 70) + ' ' + (y + 470) + ' L ' + (x + 236) + ' ' + (y + 210) + '" stroke="#fff" stroke-width="8" stroke-opacity=".6" stroke-linecap="round"/>' +
        '</g>';
    }
    t.ekle(levha(70, 60, 8, 0.4));
    t.ekle(levha(30, 40, -4, 0.6));
    t.ekle('<text x="80" y="' + (H - 60) + '" ' + YAZI + ' font-size="28" font-weight="700" fill="#0f172a" fill-opacity=".55">9H</text>');
    return t.svg();
  }
  function lensKoruyucu(o) {
    var c = o.renk || '#6b7280', W = 380, H = 380, t = new Tuval(W, H);
    t.ekle(yuvarlak(60, 60, 260, 260, 72, ' fill="' + dogrusal(t, [[0, '#ffffff', 0.7], [1, '#e2e8f0', 0.4]], 0, 0, 1, 1) + '" stroke="#94a3b8" stroke-opacity=".6" stroke-width="2"'));
    [[130, 130], [130, 250], [250, 190]].forEach(function (p) {
      t.ekle('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="50" fill="' + dairesel(t, [[0.78, '#111'], [0.86, acik(c, 0.5)], [1, koyu(c, 0.3)]]) + '"/>');
      t.ekle('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="38" fill="' + dairesel(t, [[0, '#ffffff', 0.5], [1, '#cbd5e1', 0.2]], 0.35, 0.35, 0.7) + '"/>');
    });
    t.ekle('<path d="M90 300 L 290 90" stroke="#fff" stroke-opacity=".5" stroke-width="18" stroke-linecap="round"/>');
    return t.svg();
  }
  function tutucu(o) {
    var c = o.renk || '#2a2b2f', W = 380, H = 420, t = new Tuval(W, H);
    t.ekle(yuvarlak(170, 250, 40, 150, 14, ' fill="' + dogrusal(t, [[0, acik(c, 0.3)], [1, koyu(c, 0.2)]]) + '"'));
    t.ekle(yuvarlak(120, 370, 140, 26, 13, ' fill="' + koyu(c, 0.1) + '"'));
    t.ekle('<circle cx="190" cy="170" r="130" fill="' + dairesel(t, [[0, acik(c, 0.25)], [0.85, c], [1, koyu(c, 0.3)]]) + '"/>');
    t.ekle('<circle cx="190" cy="170" r="92" fill="none" stroke="' + acik(c, 0.35) + '" stroke-opacity=".6" stroke-width="8"/>');
    t.ekle('<ellipse cx="150" cy="120" rx="60" ry="26" fill="#fff" opacity=".12"/>');
    return t.svg();
  }

  /* ---------------- Kategori simgeleri (ikinci el rozeti) ---------------- */
  function ikinciEl(o) {
    var W = 300, H = 620, t = new Tuval(W, H), c = o.renk || '#c8b39a';
    var ic = telefon({ gorunum: 'arka', kamera: 'ucgen', renk: c });
    // iç svg'yi olduğu gibi göm
    t.ekle(ic.replace('<svg ', '<svg x="0" y="0" '));
    t.ekle('<circle cx="222" cy="520" r="78" fill="#fff"/><circle cx="222" cy="520" r="70" fill="#0071e3"/>');
    t.ekle('<path d="M190 506 A 36 36 0 0 1 252 498" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/><path d="M246 480 L 256 500 L 234 504 Z" fill="#fff"/>');
    t.ekle('<path d="M254 534 A 36 36 0 0 1 192 542" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/><path d="M198 560 L 188 540 L 210 536 Z" fill="#fff"/>');
    return t.svg();
  }

  /* ---------------- Genel arayüz ---------------- */
  var CIZICILER = {
    telefon: telefon, katlanir: katlanir, flip: flip, tablet: tablet, laptop: laptop, kulaklik: kulaklik,
    adaptor: adaptor, kablo: kablo, kablosuz: kablosuz, powerbank: powerbank, kilif: kilif,
    cam: ekranKoruyucu, lens: lensKoruyucu, tutucu: tutucu, ikinciel: ikinciEl
  };
  var onbellek = {};

  function svg(tanim) {
    tanim = tanim || {};
    var f = CIZICILER[tanim.cizim] || telefon;
    return f(tanim);
  }
  function url(tanim) {
    var anahtar = JSON.stringify(tanim || {});
    if (!onbellek[anahtar]) onbellek[anahtar] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(tanim));
    return onbellek[anahtar];
  }
  /* Ürün için varsayılan çizim tanımı (görsel yüklenmemişse) */
  function varsayilan(urun, renk) {
    urun = urun || {};
    var r = renk || (urun.renkler && urun.renkler[0] && urun.renkler[0].kod) || '#8e8e93';
    var k = urun.kategori, a = urun.altKategori;
    if (k === 'tablet') return [{ cizim: 'tablet', renk: r }];
    if (k === 'laptop') return [{ cizim: 'laptop', renk: r }];
    if (k === 'aksesuar') {
      var harita = { kilif: 'kilif', sarj: 'adaptor', cam: 'cam', kulaklik: 'kulaklik' };
      return [{ cizim: harita[a] || 'kulaklik', renk: r }];
    }
    if (urun.katlanabilir) return [{ cizim: 'katlanir', gorunum: 'acik', renk: r }, { cizim: 'katlanir', gorunum: 'kapali-arka', renk: r }];
    var kamera = urun.marka === 'Samsung' ? 'dikey3' : (urun.marka === 'Xiaomi' ? 'daire' : 'ikili');
    return [{ cizim: 'telefon', gorunum: 'arka', kamera: kamera, renk: r }, { cizim: 'telefon', gorunum: 'on', on: urun.marka === 'Apple' ? 'ada' : 'delik', renk: r }];
  }

  ZI.cizim = { svg: svg, url: url, varsayilan: varsayilan, DUVARLAR: DUVARLAR, renk: { acik: acik, koyu: koyu, isik: isik, karistir: karistir } };
})(typeof window !== 'undefined' ? window : globalThis);
