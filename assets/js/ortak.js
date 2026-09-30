/*!
 * Zümrüt İletişim — Ortak site betiği
 * Veri yükleme, üst menü / mega menü / mobil menü / arama, ürün kartları, alt bilgi.
 */
(function (g) {
  'use strict';
  var ZI = g.ZI = g.ZI || {};
  var d = document;

  /* =====================================================================
     Yardımcılar
     ===================================================================== */
  ZI.$ = function (s, k) { return (k || d).querySelector(s); };
  ZI.$$ = function (s, k) { return Array.prototype.slice.call((k || d).querySelectorAll(s)); };
  var $ = ZI.$, $$ = ZI.$$;

  ZI.kacis = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var k = ZI.kacis;

  ZI.sayi = function (n) { return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0)); };
  ZI.fiyatYaz = function (n) { return (n == null || n === '' || isNaN(n)) ? '' : ZI.sayi(n) + ' TL'; };

  ZI.normalMetin = function (s) {
    return String(s || '').toLocaleLowerCase('tr')
      .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  };
  ZI.kisaAd = function (s) { return ZI.normalMetin(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); };

  ZI.parametre = function (ad) { try { return new URLSearchParams(location.search).get(ad); } catch (e) { return null; } };

  ZI.ikon = function (ad, sinif) {
    var p = IKONLAR[ad] || '';
    return '<svg class="zi-ikon' + (sinif ? ' ' + sinif : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + p + '</svg>';
  };
  var IKONLAR = {
    ara: '<circle cx="11" cy="11" r="6.8"/><path d="m20 20-4-4"/>',
    kisi: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5c.6-3.9 3.7-6.5 7.5-6.5s6.9 2.6 7.5 6.5"/>',
    kilit: '<rect x="5" y="10.5" width="14" height="10" rx="2.2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    asagi: '<path d="m6 9.5 6 6 6-6"/>',
    sag: '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
    sol: '<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>',
    geri: '<path d="M19.5 12h-15"/><path d="m11 5.5-6.5 6.5 6.5 6.5"/>',
    telefon: '<path d="M5.2 3.5h3.1l1.8 4.6-2.3 1.6a11.6 11.6 0 0 0 6.5 6.5l1.6-2.3 4.6 1.8v3.1a2 2 0 0 1-2.1 2A16.5 16.5 0 0 1 3.2 5.6a2 2 0 0 1 2-2.1z"/>',
    mesaj: '<path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.5-4.4a8.4 8.4 0 1 1 15.5-4.5z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" stroke-width="2.4"/>',
    eposta: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
    konum: '<path d="M12 21s-7-6.1-7-11.4a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.6" r="2.5"/>',
    saat: '<circle cx="12" cy="12" r="8.8"/><path d="M12 7.2V12l3.2 2"/>',
    takvim: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    islemci: '<rect x="7" y="7" width="10" height="10" rx="1.6"/><rect x="10" y="10" width="4" height="4" rx=".6"/><path d="M9.5 3.5V7M14.5 3.5V7M9.5 17v3.5M14.5 17v3.5M3.5 9.5H7M3.5 14.5H7M17 9.5h3.5M17 14.5h3.5"/>',
    ram: '<rect x="2.5" y="7" width="19" height="10" rx="1.6"/><path d="M6.5 17v3M10 17v3M14 17v3M17.5 17v3M6.5 10.5v3M10 10.5v3M14 10.5v3M17.5 10.5v3"/>',
    depolama: '<ellipse cx="12" cy="6" rx="7" ry="2.8"/><path d="M5 6v12c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8V6M5 12c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8"/>',
    ekran: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.6"/><path d="M10.5 5.2h3"/>',
    kamera: '<path d="M4 8h3l1.6-2.5h6.8L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.4"/>',
    onkamera: '<circle cx="12" cy="12" r="8.8"/><circle cx="12" cy="12" r="3.2"/><path d="M12 3.2v2M12 18.8v2"/>',
    pil: '<rect x="2.5" y="7.5" width="17" height="9" rx="2.2"/><path d="M21.5 10.5v3"/><rect x="5" y="10" width="8" height="4" rx=".8" fill="currentColor" stroke="none"/>',
    parca: '<path d="M14.6 6.3a4 4 0 0 0-5.2 5.2l-5.8 5.8a1.6 1.6 0 1 0 2.2 2.2l5.8-5.8a4 4 0 0 0 5.2-5.2l-2.3 2.3-2.2-.6-.6-2.2z"/>',
    onay: '<circle cx="12" cy="12" r="8.8"/><path d="m8.2 12.4 2.6 2.6 5-5.4"/>',
    bilgi: '<circle cx="12" cy="12" r="8.8"/><path d="M12 11v5.2M12 7.8h.01"/>',
    tik: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    carpi: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    arti: '<path d="M12 5v14M5 12h14"/>',
    paylas: '<path d="M12 3.5v11.5"/><path d="m7.8 7.7 4.2-4.2 4.2 4.2"/><path d="M5.5 12v7a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-7"/>',
    oynat: '<path d="M8.5 5.8v12.4l9.6-6.2z" fill="currentColor" stroke="none"/>',
    duraklat: '<path d="M8 5.5h2.8v13H8zM13.2 5.5H16v13h-2.8z" fill="currentColor" stroke="none"/>',
    takas: '<path d="M4 8.5h13.5L14 5M20 15.5H6.5L10 19"/>',
    kalkan: '<path d="M12 3 19 6v5.4c0 4.3-2.9 7.9-7 9.6-4.1-1.7-7-5.3-7-9.6V6z"/><path d="m9 12 2.1 2.1L15.2 10"/>',
    kutu: '<path d="M3.5 7.5 12 3.2l8.5 4.3v9L12 20.8l-8.5-4.3z"/><path d="M3.5 7.5 12 11.8l8.5-4.3M12 11.8v9"/>',
    yon: '<path d="M12 2.8 21.2 12 12 21.2 2.8 12z"/><path d="M9 14v-2.8h5.6M12.8 8.8l2.4 2.4-2.4 2.4"/>',
    dis: '<path d="M14 4h6v6M20 4l-8.5 8.5"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    ayar: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.6M12 18.6v2.6M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2.8 12h2.6M18.6 12h2.6M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
    magaza: '<path d="M4.5 10v10h15V10"/><path d="M3 9.6 5 4h14l2 5.6a2.6 2.6 0 0 1-4.6 1.6 2.6 2.6 0 0 1-4.4 0 2.6 2.6 0 0 1-4.4 0A2.6 2.6 0 0 1 3 9.6z"/><path d="M10 20v-5h4v5"/>',
    etiket: '<path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3-8.7 8.7z"/><circle cx="8" cy="8" r="1.4"/>',
    yildiz: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    yapay: '<path d="M12 3.5 13.8 9 19.5 11 13.8 13 12 18.5 10.2 13 4.5 11 10.2 9z"/><path d="M18.5 3.5v3M17 5h3"/>',
    renk: '<circle cx="12" cy="12" r="8.8"/><path d="M12 3.2a8.8 8.8 0 0 0 0 17.6z" fill="currentColor" stroke="none" opacity=".35"/>',
    kalem: '<path d="M4 20h4L19.2 8.8a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.6 6.4 4 4"/>',
    kopya: '<rect x="8" y="8" width="12" height="12" rx="2.2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    indir: '<path d="M12 4v11"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M5 19.5h14"/>',
    yukle: '<path d="M12 15.5V4.5"/><path d="m7.5 9 4.5-4.5L16.5 9"/><path d="M5 19.5h14"/>',
    cop: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/><path d="M10 11v6M14 11v6"/>',
    gecmis: '<path d="M3.8 12.5a8.3 8.3 0 1 0 2.4-6.3"/><path d="M3.8 4.5v4.3h4.3"/><path d="M12 7.8V12l3 2"/>',
    goz: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    cikis: '<path d="M9 4.5H5.5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1H9"/><path d="M15 16.5 19.5 12 15 7.5M19.5 12H9"/>',
    noktalar: '<circle cx="12" cy="5.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="18.5" r="1.4" fill="currentColor" stroke="none"/>',
    resim: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-5-5-8.5 8.5"/>',
    anahtar: '<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 8.7-8.7M16 7l2.5 2.5M14 9l2 2"/>',
    bulut: '<path d="M7 18.5h10a4 4 0 0 0 .6-8A6 6 0 0 0 6 9.5a4.5 4.5 0 0 0 1 9z"/><path d="M12 16.5V11M9.5 13.3 12 10.8l2.5 2.5"/>',
    tablo: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M3.5 14.5h17M9.5 9.5v10"/>',
    yenile: '<path d="M20 11a8 8 0 0 0-14.3-4.3L4 8.5"/><path d="M4 4v4.5h4.5"/><path d="M4 13a8 8 0 0 0 14.3 4.3l1.7-1.8"/><path d="M20 20v-4.5h-4.5"/>',
    yukari: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    asagiOk: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    uyari: '<path d="M12 3.5 21.5 20h-19z"/><path d="M12 10v4.5M12 17.2h.01"/>',
    sarj: '<path d="M13.2 2.8 5.8 13.2h5.6l-1 8 7.8-10.9h-5.8z"/>',
    instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.9"/><path d="M17.2 6.8h.01" stroke-width="2.6"/>',
    tamir: '<path d="M20.2 6.4 17 9.6l-2.6-2.6 3.2-3.2a5 5 0 0 0-6.4 6.4L4.4 17a1.9 1.9 0 0 0 2.6 2.6l6.8-6.8a5 5 0 0 0 6.4-6.4z"/>',
    defter: '<path d="M6 3.5h11.5a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1.5 1.5 0 0 1-1.5-1.5v-14A1.5 1.5 0 0 1 6 3.5z"/><path d="M8.5 8h6.5M8.5 11.5h6.5M8.5 15h4"/>'
  };

  /* Mağaza logosu (vektör). Renk, kapsayıcının "color" değerinden gelir (currentColor). */
  var LOGO = { vb: '0 0 918.7 199.5', d: 'M217.7 160.7L217.7 164.2 218.5 164.8 321.3 164.8 322.3 163.8 322.3 161 321.5 160 218.3 160ZM812.7 160.7L812.7 164 813.5 164.8 916.3 164.8 917.5 164 917.5 160.8 916.7 160 818.3 159.8 813.2 160ZM706.8 144.8L706.7 186.3 707.2 186.8 710.5 187 711.7 186.2 711.7 150.5 712.2 150 713.3 150.8 737.8 186.3 739 187 741.8 187 743.3 186 768.3 150.2 769 150.2 769.3 150.7 769.3 186.2 770.3 187 773.5 187 774.3 186.5 774.5 145.2 774 144.5 767 144.3 765.7 145 740.8 180.3 740 180.2 715.8 145.5 714 144.3 707.8 144.3ZM677.5 144.3L676.7 145.3 676.7 186.2 677.5 187 680.8 187 681.7 186 681.7 145.2 680.5 144.3ZM577 144.3L576 145 576 186.2 577.3 187 580 187 580.8 186.3 580.8 145 579.8 144.3ZM509.3 144.7L509 147.8 509.7 148.5 529.8 148.5 530.7 149.2 530.7 185.7 531 186.7 531.8 187 535.2 186.8 535.7 186.2 535.7 149.3 536.7 148.5 556.8 148.5 557.5 147.3 557.3 145 556.2 144.3 510.3 144.3ZM450 144.7L449.7 145.3 449.7 185.8 450 186.7 450.7 187 491.8 186.8 492.3 186.2 492.3 183.7 491.2 182.8 455.5 182.8 454.7 182 454.7 168 455.3 167.2 489.7 167.2 490.5 166.5 490.5 163.3 489.8 162.8 455.5 162.8 454.7 162.2 454.8 149 455.7 148.5 491.2 148.5 491.8 148 491.7 144.8 491 144.3 451 144.3ZM391.2 144.5L390.7 145 390.8 186.5 391.5 187 429 186.8 429.5 186 429.5 183.7 428.7 182.8 396.5 182.8 395.7 181.8 395.7 145.2 395 144.5ZM361.7 144.3L360.7 145.2 360.7 186.3 361.8 187 364.8 187 365.8 185.8 365.7 145 364.8 144.3ZM611.2 145.8L609 147 606.8 149.2 605.8 151.2 605 155.7 605.2 159.8 605.8 162.2 608.7 165.3 611.7 166.7 615 167.3 643 167.8 646.2 169 647.8 171 648.3 175.8 647.3 179.3 644.3 181.7 639 182.7 626.7 183 616 182.5 612.2 181.2 610.7 179.7 609.8 174.2 606 173.8 605.2 174.3 605.7 180.2 606.7 182.7 608.3 184.5 611 186 614.5 186.7 627.2 187.5 627.7 188.2 627.8 192.3 628.7 192.8 632.7 192.8 633.5 193.5 633.8 194.5 633.5 196 632.7 196.7 628.2 196.8 627.7 197.3 627.7 199 628.3 199.5 635 199.3 636.2 198.5 636.7 196.8 636.5 191.5 635.3 190.7 631.3 190.3 630.5 189.3 630.5 187.8 631.7 187.2 637.8 187.2 644.8 186.3 649.7 184.5 652.2 181.7 653.5 177.5 653.5 172.5 652.3 168.3 650.2 165.7 645.8 163.8 640.3 163.2 616.8 163.2 614.3 162.7 612.3 161.7 610.8 159.7 610.3 158 610.7 153 612.3 150.7 615 149.5 618.5 148.8 626.5 148.3 637.8 148.5 644.7 149.8 646.7 151.7 647.3 155.5 647.8 156.2 651.3 156.3 652.3 155.7 652.3 153.8 651.2 149.5 648.8 146.7 646.5 145.3 638 144 617.7 144.3ZM677 133L676.7 133.8 677 139.3 681.5 139.3 681.8 138.8 681.8 133.5 681 132.8ZM576.5 133L576 133.5 576.2 139.2 576.7 139.5 580.7 139.3 581 138.8 580.8 133.2 580.2 132.8ZM361.2 133L360.7 134 360.8 139 361.3 139.5 365.5 139.3 365.8 138.8 365.8 133.5 365 132.8ZM715.3 17.2L715.3 81.3 717.2 89.8 718.8 93.2 721.7 96.5 723.7 98 728.5 100.3 734.3 101.5 767.3 102.2 789.7 101.5 798.8 100.3 805.3 98.3 808 96.8 810.2 94.8 812.2 91.7 813.5 88.2 814.8 79.3 814.8 17.2 814.3 16.7 803.5 16.5 802.8 17 802.8 75.8 802.2 82 800.7 85.8 798.2 88.2 793 89.8 786.2 90.5 758.8 91 738 90 732.8 88.7 731.2 87.7 729.5 85.8 727.7 80.5 727.7 17.5 726.7 16.5 716.3 16.5ZM326.3 17L326.3 81.8 327 86.3 328.2 90.2 330.8 94.7 333 96.8 338.7 100 345.3 101.5 379.2 102.2 400.2 101.5 410 100.3 416.7 98.2 419.3 96.5 421.5 94.3 424.5 87.8 425.3 84 425.8 77.8 425.8 17.2 425.5 16.7 414.5 16.5 413.7 17.3 413.7 77 413 82.3 411.3 86.2 410.3 87.3 408 88.7 402.8 90 380 91 351.3 90.3 345.7 89.3 343.2 88.3 341 86.7 339.3 83.3 338.5 78.8 338.5 17.3 337.7 16.5 327.2 16.5ZM823.3 16.5L822.7 17.5 822.8 26.3 823.3 27 863 27 864.2 27.7 864.3 100.7 865 101.3 876.3 101.2 876.7 100.3 876.7 27.8 877.5 27 918 27 918.7 26 918.5 16.8 916.8 16.3ZM600.8 17L600.8 100.7 601.2 101.2 612.3 101.3 613 100.7 613 68.8 614 67.8 671.2 67.8 677.3 68.7 680 69.8 682.3 71.7 683.8 74.5 684.7 77.8 685 100.8 685.7 101.3 696.2 101.3 696.8 100.8 697 76.3 696.3 71.8 695.2 69.2 693.2 66.7 687.2 63.3 687.7 62.5 691.2 61.2 695.2 58 697 54.3 698.2 49 698.5 39.2 697.3 30.7 695.5 26.2 692.2 22 691 21 685.7 18.5 679.5 17 674.8 16.5 602 16.3ZM613 28L614 27 672.5 27.2 678.3 28.2 681.7 29.7 683.2 31 685.3 35.3 685.8 38.2 685.8 44.8 685 49.3 683.5 52.5 682.2 54 678.3 56 674 57 667.3 57.5 614.2 57.5 613 56.5ZM446.3 16.8L446.2 100.5 446.7 101.2 457.7 101.3 458.5 100.5 458.5 31.7 459.2 31 464.3 37.8 507.3 100 509 101.3 517.2 101.3 518.3 100.5 566 31.7 567.2 31 567.7 31.7 567.7 100.7 568.5 101.3 578.8 101.3 579.8 100.7 579.8 17 579.3 16.5 563.3 16.3 561.3 17.3 515.7 83 513.2 85.8 512 85 465 17.3 463.2 16.3 447.5 16.3ZM220 17L220 26.3 220.5 27 291.3 27 291.8 27.3 291.8 28.2 217.3 90.7 216.7 91.7 216.5 100.5 217 101.2 313.8 101.3 314.3 100.8 314.5 92.2 314.3 91.3 313.7 90.8 238 90.8 237.5 90.2 240.2 87.5 311.7 27.7 313.2 25.7 313.2 17.3 312.5 16.5 221.3 16.3ZM144 10.7L105.8 10.5 105.2 10.8 106.3 13.3 134.3 52.8 136.2 56.2 49.2 144 49.2 144.7 49.8 145 87 145 88.7 144.3 177 56.7 176.8 55ZM56.8 10.8L56.8 11.7 87.8 56.5 87.8 57.3 0.3 144.2 0 145 0 189.3 0.3 190 149 190 171.8 153.7 171.7 152.3 33.7 152.3 33 151.8 33 151.2 128.7 56.8 128.3 55.7 96.2 11 93.8 10.5 57.5 10.5ZM7.7 11L14 20.3 37.7 52.5 75.8 52.7 76.5 52.3 76.5 51.7 46.8 11 45.5 10.5 8.3 10.5ZM770.5 0.7L770.3 9.5 771 10.5 789.3 10.5 790 10 790 0.8 789.2 0 771.3 0ZM740.2 0.8L740.2 9.7 740.8 10.5 759.3 10.5 759.7 10.2 759.8 0.8 759.3 0.2 741.2 0ZM381.3 1L381.3 8.3 382 10.5 400.3 10.5 401.2 9.7 401.2 1 400.3 0 382.3 0ZM351 0.8L351 9.7 351.7 10.5 370.2 10.5 370.7 10 370.7 0.7 370 0 351.8 0Z' };
  var ISARET = { vb: '0 0 177 179.5', d: 'M144 0.2L105.8 0 105.2 0.3 106.3 2.8 134.3 42.3 136.2 45.7 49.2 133.5 49.2 134.2 49.8 134.5 87 134.5 88.7 133.8 177 46.2 176.8 44.5ZM56.8 0.3L56.8 1.2 87.8 46 87.8 46.8 0.3 133.7 0 134.5 0 178.8 0.3 179.5 149 179.5 171.8 143.2 171.7 141.8 33.7 141.8 33 141.3 33 140.7 128.7 46.3 128.3 45.2 96.2 0.5 93.8 0 57.5 0ZM7.7 0.5L14 9.8 37.7 42 75.8 42.2 76.5 41.8 76.5 41.2 46.8 0.5 45.5 0 8.3 0Z' };
  ZI.logo = function (tip, sinif) {
    var l = tip === 'isaret' ? ISARET : LOGO;
    return '<svg class="' + (sinif || 'zi-logo') + '" viewBox="' + l.vb + '" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="' + l.d + '"/></svg>';
  };
  ZI.markaTas = function () { return ZI.logo('isaret', 'zi-marka__tas'); };

  /* =====================================================================
     Tarayıcı deposu (IndexedDB anahtar-değer)
     ===================================================================== */
  ZI.depo = (function () {
    var vt = null;
    function ac() {
      if (vt) return vt;
      vt = new Promise(function (coz, reddet) {
        if (!g.indexedDB) return reddet(new Error('IndexedDB yok'));
        var r = g.indexedDB.open('zumrut-iletisim', 1);
        r.onupgradeneeded = function () { r.result.createObjectStore('kv'); };
        r.onsuccess = function () { coz(r.result); };
        r.onerror = function () { reddet(r.error); };
      });
      return vt;
    }
    function islem(tip, fn) {
      return ac().then(function (db) {
        return new Promise(function (coz, reddet) {
          var tx = db.transaction('kv', tip), st = tx.objectStore('kv'), sonuc;
          var r = fn(st);
          if (r) r.onsuccess = function () { sonuc = r.result; };
          tx.oncomplete = function () { coz(sonuc); };
          tx.onerror = function () { reddet(tx.error); };
          tx.onabort = function () { reddet(tx.error); };
        });
      });
    }
    return {
      al: function (a) { return islem('readonly', function (st) { return st.get(a); }); },
      koy: function (a, v) { return islem('readwrite', function (st) { return st.put(v, a); }); },
      sil: function (a) { return islem('readwrite', function (st) { return st.delete(a); }); }
    };
  })();

  ZI.yerelAl = function (a, v) { try { var x = localStorage.getItem(a); return x == null ? v : JSON.parse(x); } catch (e) { return v; } };
  ZI.yerelKoy = function (a, v) { try { localStorage.setItem(a, JSON.stringify(v)); } catch (e) { /* yok say */ } };
  ZI.yerelSil = function (a) { try { localStorage.removeItem(a); } catch (e) { /* yok say */ } };

  /* =====================================================================
     Veri
     ===================================================================== */
  var VARSAYILAN_MAGAZA = {
    ad: 'Zümrüt İletişim',
    tanitim: '',
    telefon: '0542 303 24 83',
    whatsapp: '905423032483',
    eposta: '',
    adres: 'Hoca Ahmet Yesevi, Kadir Has Cd. No:131/A, 38090 Kocasinan/Kayseri',
    konum: { enlem: 38.7583204, boylam: 35.4926544, yerKimligi: '' },
    saatler: [
      { gun: 'Pazartesi', acilis: '09:00', kapanis: '20:30' }, { gun: 'Salı', acilis: '09:00', kapanis: '20:30' },
      { gun: 'Çarşamba', acilis: '09:00', kapanis: '20:30' }, { gun: 'Perşembe', acilis: '09:00', kapanis: '20:30' },
      { gun: 'Cuma', acilis: '09:00', kapanis: '20:30' }, { gun: 'Cumartesi', acilis: '09:00', kapanis: '20:30' },
      { gun: 'Pazar', kapali: true }
    ],
    fiyatNotu: 'Fiyatlar bilgilendirme amaçlıdır. Sitemiz üzerinden satış yapılmamaktadır; güncel fiyat ve stok bilgisi için mağazamızla iletişime geçin.',
    instagram: '',
    tamir: null
  };
  /* Ana sayfadaki "Tamir ve teknik servis" bölümü (panelden değiştirilebilir) */
  var VARSAYILAN_TAMIR = {
    aktif: true,
    metin: 'Ekranı kırılan, şarjı çabuk biten ya da çalışmayan telefonunuzu mağazamıza getirin. Arızaya bakalım, ne yapılacağını ve ücretini size söyleyelim.',
    hizmetler: ['Ekran değişimi', 'Batarya değişimi', 'Şarj soketi', 'Kamera', 'Arka cam', 'Yazılım']
  };
  ZI.GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  ZI.bosVeri = function () { return { surum: 1, guncelleme: null, magaza: JSON.parse(JSON.stringify(VARSAYILAN_MAGAZA)), vitrin: [], urunler: [] }; };

  ZI.normalize = function (v) {
    v = v || ZI.bosVeri();
    v.magaza = Object.assign({}, VARSAYILAN_MAGAZA, v.magaza || {});
    if (!Array.isArray(v.magaza.saatler) || v.magaza.saatler.length !== 7) v.magaza.saatler = VARSAYILAN_MAGAZA.saatler;
    v.magaza.konum = Object.assign({}, VARSAYILAN_MAGAZA.konum, v.magaza.konum || {});
    v.magaza.tamir = Object.assign({}, VARSAYILAN_TAMIR, v.magaza.tamir || {});
    v.magaza.tamir.hizmetler = (Array.isArray(v.magaza.tamir.hizmetler) ? v.magaza.tamir.hizmetler : VARSAYILAN_TAMIR.hizmetler).map(function (x) { return String(x || '').trim(); }).filter(Boolean);
    v.magaza.instagram = ZI.instagramLink(v.magaza.instagram);
    v.vitrin = Array.isArray(v.vitrin) ? v.vitrin : [];
    v.urunler = (Array.isArray(v.urunler) ? v.urunler : []).filter(function (u) { return u && u.id; }).map(function (u) {
      u.renkler = Array.isArray(u.renkler) ? u.renkler : [];
      u.secenekler = Array.isArray(u.secenekler) ? u.secenekler : [];
      u.gorseller = Array.isArray(u.gorseller) ? u.gorseller : [];
      if (Array.isArray(u.gorselRenkleri)) { u.gorselRenkleri = u.gorseller.map(function (x, i) { return u.gorselRenkleri[i] || ''; }); if (!u.gorselRenkleri.some(Boolean)) delete u.gorselRenkleri; }
      u.ozellikler = u.ozellikler || {};
      u.stok = Number(u.stok) || 0;
      u.aktif = u.aktif !== false;
      u.durum = u.durum === 'ikinci-el' ? 'ikinci-el' : 'sifir';
      return u;
    });
    return v;
  };

  /* Yayınlanmış veri + (yönetici önizlemesi varsa) taslak */
  ZI.veriYukle = function () {
    if (ZI._veriSozu) return ZI._veriSozu;
    ZI._veriSozu = new Promise(function (coz) {
      if (g.ZI_VERI) return coz(g.ZI_VERI);
      var s = d.createElement('script');
      s.src = 'data/veri.js?v=' + Date.now();
      s.onload = function () { coz(g.ZI_VERI || null); };
      s.onerror = function () { coz(null); };
      d.head.appendChild(s);
    }).then(function (yayin) {
      return ZI.onizlemeVerisi(yayin).then(function (taslak) {
        var veri = ZI.normalize(JSON.parse(JSON.stringify(taslak || yayin || ZI.bosVeri())));
        ZI.veri = veri;
        ZI.onizlemede = !!taslak;
        return veri;
      });
    });
    return ZI._veriSozu;
  };

  /* Yöneticinin cihazında: yeni yayınlanan görsellerin yerel kopyası (Pages güncellenene kadar) */
  ZI.gorselOnbellekYukle = function () {
    return ZI.depo.al('gorsel-onbellek').then(function (o) {
      ZI.gorselOnbellek = {};
      Object.keys(o || {}).forEach(function (y) { if (o[y] && o[y].v) ZI.gorselOnbellek[y] = o[y].v; });
    }).catch(function () { ZI.gorselOnbellek = {}; });
  };

  ZI.onizlemeVerisi = function (yayin) {
    var bitis = ZI.yerelAl('zi-onizleme', 0);
    if (!bitis || bitis < Date.now()) return Promise.resolve(null);
    return ZI.gorselOnbellekYukle().then(function () { return ZI.depo.al('taslak'); }).then(function (t) {
      if (!t || !t.veri) return null;
      var yz = yayin && yayin.guncelleme ? Date.parse(yayin.guncelleme) : 0;
      var tz = t.veri.guncelleme ? Date.parse(t.veri.guncelleme) : 0;
      if (t.yayinlanmadi) { ZI.onizlemeNedeni = 'taslak'; return t.veri; }
      if (tz > yz) { ZI.onizlemeNedeni = 'guncelleniyor'; return t.veri; }
      return null;
    }).catch(function () { return null; });
  };

  /* =====================================================================
     Ürün yardımcıları
     ===================================================================== */
  /* Ürün görselleri. "renk" bir renk nesnesi ({ad, kod}) ya da renk kodu olabilir.
     Fotoğraflar renklere etiketlenmişse (gorselRenkleri) seçilen rengin fotoğrafları öne alınır. */
  ZI.gorseller = function (u, renk) {
    var renkler = u.renkler || [];
    var secili = renk && typeof renk === 'object' ? renk : (renk ? (renkler.filter(function (x) { return x.kod === renk; })[0] || { kod: renk }) : (renkler[0] || null));
    var r = (secili && secili.kod) || null;
    var etiket = Array.isArray(u.gorselRenkleri) ? u.gorselRenkleri : [];
    var ogeler = [], baska = false;
    (u.gorseller || []).forEach(function (x, i) { if (x) ogeler.push({ x: x, renk: etiket[i] || '' }); });
    if (ogeler.length && secili && secili.ad && etiket.some(Boolean)) {
      /* Seçilen rengin fotoğrafı varsa o (+ renksiz fotoğraflar); yoksa renksiz fotoğraflar.
         İkisi de yoksa çizime düşmez: modelin diğer renklerdeki gerçek fotoğrafları gösterilir, fotoğraftaki renk yazılır. */
      var eslesen = ogeler.filter(function (o) { return o.renk === secili.ad; });
      var genel = ogeler.filter(function (o) { return !o.renk && typeof o.x === 'string'; });
      if (eslesen.length) ogeler = eslesen.concat(genel);
      else if (genel.length) ogeler = genel;
      else {
        ogeler = ogeler.filter(function (o) { return typeof o.x === 'string' && !/\.svg(\?|$)/i.test(o.x); });
        baska = ogeler.length > 0;
      }
    }
    if (!ogeler.length) ogeler = (ZI.cizim ? ZI.cizim.varsayilan(u, r) : []).map(function (x) { return { x: x, renk: '' }; });
    return ogeler.map(function (o) {
      var x = o.x;
      if (typeof x === 'string') {
        var gr = { src: (ZI.gorselOnbellek && ZI.gorselOnbellek[x]) || x, foto: !/\.svg(\?|$)/i.test(x) };
        if (baska && o.renk) gr.baskaRenk = o.renk;
        return gr;
      }
      var t = Object.assign({}, x);
      if (r && !t.sabitRenk) t.renk = r;
      return { src: ZI.cizim.url(t), foto: false, cizim: true };
    });
  };
  /* Belirli bir renk adına göre (ör. koyu bir sahne için) renk kodu seç */
  ZI.renkSec = function (u, desen) {
    var r = (u.renkler || []).filter(function (x) { return desen.test(x.ad || ''); })[0];
    return r ? r.kod : (u.renkler && u.renkler[0] && u.renkler[0].kod);
  };
  ZI.gorselHTML = function (gr, alt, ek) {
    return '<img src="' + k(gr.src) + '" alt="' + k(alt || '') + '"' + (gr.foto ? ' class="foto"' : '') + ' loading="lazy" decoding="async"' + (ek || '') + '>';
  };

  ZI.durumEtiketi = function (u) {
    if (u.durum === 'ikinci-el') return '2. El' + (u.kozmetik ? ' – ' + u.kozmetik : '');
    return 'Sıfır / Kapalı Kutu';
  };
  ZI.durumRozeti = function (u, uzun) {
    var ikinci = u.durum === 'ikinci-el';
    return '<span class="zi-rozet ' + (ikinci ? 'zi-rozet--ikinciel' : 'zi-rozet--sifir') + '">' +
      k(uzun ? ZI.durumEtiketi(u) : (ikinci ? '2. El' : 'Sıfır')) + '</span>';
  };
  function fiyatVar(x) { return x != null && x !== '' && !isNaN(x); }
  /* Sitede gösterilecek fiyatlar: seçeneklerin fiyatları; seçenek yoksa ya da fiyatı boş seçenek varsa genel satış fiyatı */
  ZI.fiyatlar = function (u) {
    var sec = u.secenekler || [];
    var f = sec.map(function (s) { return s.fiyat; }).filter(fiyatVar).map(Number);
    if (fiyatVar(u.fiyat) && (!sec.length || sec.some(function (s) { return !fiyatVar(s.fiyat); }))) f.push(Number(u.fiyat));
    return f;
  };
  ZI.baslangicFiyati = function (u) { var f = ZI.fiyatlar(u); return f.length ? Math.min.apply(null, f) : null; };
  ZI.fiyatMetni = function (u, html) {
    var f = ZI.fiyatlar(u);
    if (!f.length) return 'Fiyat için mağazamızı arayın';
    var min = Math.min.apply(null, f), coklu = (u.secenekler || []).length > 1 && Math.max.apply(null, f) !== min;
    var deger = ZI.fiyatYaz(min);
    if (html) deger = '<b>' + deger + '</b>';
    return coklu ? deger + "'den başlayan fiyatlarla" : deger;
  };
  ZI.stokBilgisi = function (u) {
    if (u.rozet === 'Yakında') return { sinif: 'yakinda', metin: 'Yakında mağazada' };
    if (u.stok > 0) return { sinif: '', metin: u.durum === 'ikinci-el' ? 'Mağazada, tek adet' : 'Mağazada mevcut' };
    return { sinif: 'yok', metin: 'Stok bilgisi için arayın' };
  };
  ZI.pilHTML = function (p) {
    p = Number(p);
    var s = p >= 85 ? '' : (p >= 80 ? ' zi-pil--orta' : ' zi-pil--dusuk');
    return '<span class="zi-pil' + s + '" aria-hidden="true"><span class="zi-pil__govde"><span class="zi-pil__dolu" style="width:' + Math.max(8, Math.min(100, p)) + '%"></span></span><span class="zi-pil__uc"></span></span>';
  };
  ZI.markaGoster = function (m) { return m && !/^(diğer|diger|genel|-)$/i.test(m); };
  ZI.MARKA_RENK = { Apple: '#1d1d1f', Samsung: '#1428a0', Xiaomi: '#ff6900' };

  /* Kategoriler */
  function seriMi(u, re) { return re.test((u.seri || '') + ' ' + (u.ad || '')); }
  ZI.kategoriler = {
    tumu: { baslik: 'Tüm Ürünler', alt: 'Mağazamızdaki bütün cihaz ve aksesuarlar.', f: function () { return true; } },
    iphone: { baslik: 'iPhone', alt: 'Sıfır ve ikinci el tüm iPhone modelleri.', f: function (u) { return u.marka === 'Apple' && u.kategori === 'telefon'; } },
    apple: { baslik: 'Apple', alt: 'iPhone, iPad, MacBook ve Apple aksesuarları.', f: function (u) { return u.marka === 'Apple'; } },
    android: { baslik: 'Android Telefonlar', alt: 'Samsung, Xiaomi ve diğer popüler markalar.', f: function (u) { return u.kategori === 'telefon' && u.marka !== 'Apple'; } },
    samsung: { baslik: 'Samsung Galaxy', alt: 'Galaxy S serisi, katlanabilir Galaxy Z ve Galaxy A modelleri.', f: function (u) { return u.marka === 'Samsung' && u.kategori === 'telefon'; } },
    'galaxy-s': { baslik: 'Galaxy S Serisi', alt: 'Samsung\'un amiral gemisi telefonları.', f: function (u) { return u.marka === 'Samsung' && u.kategori === 'telefon' && seriMi(u, /galaxy s\d/i); } },
    katlanabilir: { baslik: 'Katlanabilir Telefonlar', alt: 'Açılınca tablet, katlanınca telefon.', f: function (u) { return u.kategori === 'telefon' && u.katlanabilir; } },
    xiaomi: { baslik: 'Xiaomi & Redmi', alt: 'Xiaomi ve Redmi telefonlar.', f: function (u) { return u.marka === 'Xiaomi' && u.kategori === 'telefon'; } },
    ipad: { baslik: 'iPad', alt: 'iPad Pro, iPad Air, iPad ve iPad mini.', f: function (u) { return u.marka === 'Apple' && u.kategori === 'tablet'; } },
    macbook: { baslik: 'MacBook', alt: 'MacBook Air, MacBook Pro ve MacBook Neo.', f: function (u) { return u.marka === 'Apple' && u.kategori === 'laptop'; } },
    tablet: { baslik: 'Tabletler', alt: 'iPad, Galaxy Tab ve Xiaomi Pad.', f: function (u) { return u.kategori === 'tablet'; } },
    laptop: { baslik: 'Laptoplar', alt: 'MacBook ve dizüstü bilgisayarlar.', f: function (u) { return u.kategori === 'laptop'; } },
    'tablet-laptop': { baslik: 'Tabletler & Laptoplar', alt: 'Çalışmak, çizmek, izlemek için.', f: function (u) { return u.kategori === 'tablet' || u.kategori === 'laptop'; } },
    aksesuar: { baslik: 'Aksesuarlar', alt: 'Kılıf, şarj aleti, kırılmaz cam ve kulaklık.', f: function (u) { return u.kategori === 'aksesuar'; } },
    kilif: { baslik: 'Kılıflar', alt: 'Cihazınızı şıkça koruyun.', f: function (u) { return u.kategori === 'aksesuar' && u.altKategori === 'kilif'; } },
    sarj: { baslik: 'Şarj Aletleri & Adaptörler', alt: 'Hızlı, güvenli şarj çözümleri.', f: function (u) { return u.kategori === 'aksesuar' && u.altKategori === 'sarj'; } },
    cam: { baslik: 'Kırılmaz Camlar', alt: 'Ekranınız için ilk savunma hattı.', f: function (u) { return u.kategori === 'aksesuar' && u.altKategori === 'cam'; } },
    kulaklik: { baslik: 'Kulaklık & Aksesuarlar', alt: 'Kablosuz kulaklıklar ve günlük aksesuarlar.', f: function (u) { return u.kategori === 'aksesuar' && u.altKategori === 'kulaklik'; } },
    'ikinci-el': { baslik: 'İkinci El', alt: 'Pil sağlığı ve değişen parça bilgisi açıkça yazılı cihazlar.', f: function (u) { return u.durum === 'ikinci-el'; } },
    sifir: { baslik: 'Sıfır / Kapalı Kutu', alt: 'Kutusu açılmamış yeni cihazlar.', f: function (u) { return u.durum === 'sifir' && u.kategori !== 'aksesuar'; } }
  };
  ZI.aktifUrunler = function (veri) { return (veri || ZI.veri).urunler.filter(function (u) { return u.aktif; }); };
  ZI.filtrele = function (liste, anahtar) {
    var kat = ZI.kategoriler[anahtar] || ZI.kategoriler.tumu;
    return liste.filter(kat.f);
  };
  ZI.sirala = function (liste, tur) {
    var l = liste.slice();
    var yil = function (u) { return (Number(u.cikisYili) || 0) * 100 + (u.rozet === 'Yeni' || u.rozet === 'Yakında' ? 50 : 0); };
    if (tur === 'fiyat-artan') l.sort(function (a, b) { return (ZI.baslangicFiyati(a) || 9e12) - (ZI.baslangicFiyati(b) || 9e12); });
    else if (tur === 'fiyat-azalan') l.sort(function (a, b) { return (ZI.baslangicFiyati(b) || -1) - (ZI.baslangicFiyati(a) || -1); });
    else if (tur === 'yeni-eklenen') l.sort(function (a, b) { return String(b.eklenme || '').localeCompare(String(a.eklenme || '')); });
    else l.sort(function (a, b) { return (b.oneCikan ? 1 : 0) - (a.oneCikan ? 1 : 0) || yil(b) - yil(a) || (ZI.baslangicFiyati(b) || 0) - (ZI.baslangicFiyati(a) || 0); });
    return l;
  };
  var KATEGORI_ARAMA = { telefon: 'telefon cep telefonu akilli telefon', tablet: 'tablet', laptop: 'laptop dizustu bilgisayar notebook', aksesuar: 'aksesuar' };
  var ALT_ARAMA = { kilif: 'kilif kapak', sarj: 'sarj adaptor kablo powerbank kablosuz', cam: 'kirilmaz cam ekran koruyucu', kulaklik: 'kulaklik bluetooth' };
  function kacisRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  ZI.ara = function (liste, sorgu) {
    var q = ZI.normalMetin(sorgu);
    if (!q) return [];
    var parcalar = q.split(' ').filter(Boolean);
    var desenler = parcalar.map(function (p) { return new RegExp('(^|[^a-z0-9])' + kacisRe(p)); });
    return liste.map(function (u) {
      var metin = ZI.normalMetin([u.ad, u.marka, u.seri, KATEGORI_ARAMA[u.kategori] || '', ALT_ARAMA[u.altKategori] || '',
        u.durum === 'ikinci-el' ? 'ikinci el 2. el 2el' : 'sifir', u.katlanabilir ? 'katlanabilir katlanir' : '',
        (u.renkler || []).map(function (r) { return r.ad; }).join(' ')].join(' '));
      var kod = ZI.normalMetin(u.kod).replace(/[^a-z0-9]/g, '');
      var ad = ZI.normalMetin(u.ad), puan = 0;
      for (var i = 0; i < parcalar.length; i++) {
        var p = parcalar[i];
        if (desenler[i].test(metin)) puan += desenler[i].test(ad) ? 3 : 1;
        else if (p.length > 2 && kod.indexOf(p.replace(/[^a-z0-9]/g, '')) === 0) puan += 4;
        else return null;
      }
      if (ad.indexOf(q) === 0) puan += 5;
      return { u: u, p: puan };
    }).filter(Boolean).sort(function (a, b) { return b.p - a.p; }).map(function (x) { return x.u; });
  };

  ZI.urunLink = function (u) { return 'urun.html?id=' + encodeURIComponent(u.id); };

  ZI.kartHTML = function (u, s) {
    s = s || {};
    var gr = ZI.gorseller(u)[0];
    var stok = ZI.stokBilgisi(u);
    var ust = '<div class="zi-kart__ust">' + (u.rozet ? '<span class="zi-yeni">' + k(u.rozet) + '</span>' : '<span></span>') +
      ((u.kategori !== 'aksesuar' || u.durum === 'ikinci-el') ? ZI.durumRozeti(u) : '') + '</div>';
    var renkler = (u.renkler || []).slice(0, 6).map(function (r) { return '<span style="background:' + k(r.kod || '#ccc') + '" title="' + k(r.ad) + '"></span>'; }).join('');
    var pil = (u.durum === 'ikinci-el' && u.pilSagligi) ? '<div class="zi-kart__pil">' + ZI.pilHTML(u.pilSagligi) + ' %' + k(u.pilSagligi) + ' pil sağlığı</div>' : '';
    var aciklama = s.aciklama !== false ? (u.kisaAciklama || '') : '';
    return '<a class="zi-kart' + (s.beyaz ? ' zi-kart--beyaz' : '') + (s.belir ? ' zi-belir' : '') + '" href="' + ZI.urunLink(u) + '" data-urun="' + k(u.id) + '"' + (s.i != null ? ' style="--i:' + s.i + '"' : '') + '>' +
      ust +
      '<div class="zi-kart__gorsel">' + (gr ? ZI.gorselHTML(gr, u.ad) : '') + '</div>' +
      '<div class="zi-renk-noktalari">' + renkler + '</div>' +
      (ZI.markaGoster(u.marka) ? '<div class="zi-kart__marka">' + k(u.marka) + '</div>' : '') +
      '<h3 class="zi-kart__ad">' + k(u.ad) + '</h3>' +
      (aciklama ? '<p class="zi-kart__aciklama">' + k(aciklama) + '</p>' : '') + pil +
      '<p class="zi-kart__fiyat">' + ZI.fiyatMetni(u, true) + '</p>' +
      '<div class="zi-kart__alt"><span class="zi-kart__stok ' + stok.sinif + '">' + k(stok.metin) + '</span><span class="zi-btn zi-btn--dolu zi-btn--kucuk">İncele</span></div>' +
      '</a>';
  };

  /* =====================================================================
     Mağaza bilgileri
     ===================================================================== */
  ZI.telLink = function (m) { var t = String((m || ZI.veri.magaza).telefon || '').replace(/\D/g, ''); if (t.indexOf('0') === 0) t = '90' + t.slice(1); return 'tel:+' + t; };
  ZI.waLink = function (metin, m) {
    m = m || ZI.veri.magaza;
    var no = String(m.whatsapp || m.telefon || '').replace(/\D/g, '');
    if (no.indexOf('0') === 0) no = '90' + no.slice(1);
    return 'https://wa.me/' + no + (metin ? '?text=' + encodeURIComponent(metin) : '');
  };
  /* Instagram: "@kullanici", "kullanici" ya da uzun paylaşım bağlantısı → temiz profil adresi */
  ZI.instagramLink = function (x) {
    var s = String(x || '').trim();
    if (!s) return '';
    var m = s.match(/instagram\.com\/([A-Za-z0-9._]+)/i) || s.match(/^@?([A-Za-z0-9._]{1,30})$/);
    return m ? 'https://www.instagram.com/' + m[1] + '/' : s;
  };
  ZI.instagramAd = function (m) {
    var l = ZI.instagramLink((m || ZI.veri.magaza).instagram), a = l.match(/instagram\.com\/([^/]+)/);
    return a ? '@' + a[1] : '';
  };
  ZI.tamirWa = 'Merhaba, cihazımın tamiri için bilgi almak istiyorum.';
  ZI.yolTarifi = function (m) {
    m = m || ZI.veri.magaza;
    var c = m.konum || {};
    var u = 'https://www.google.com/maps/dir/?api=1&destination=' + (c.enlem && c.boylam ? c.enlem + ',' + c.boylam : encodeURIComponent(m.adres));
    if (c.yerKimligi) u += '&destination_place_id=' + encodeURIComponent(c.yerKimligi);
    return u;
  };
  ZI.haritaGomme = function (m) {
    m = m || ZI.veri.magaza;
    var c = m.konum || {};
    var q = c.enlem && c.boylam ? c.enlem + ',' + c.boylam : m.adres;
    return 'https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&hl=tr&z=17&output=embed';
  };
  ZI.saatDakika = function (s) { var p = String(s || '').split(':'); return (+p[0] || 0) * 60 + (+p[1] || 0); };
  ZI.istanbulSimdi = function (t) {
    t = t || new Date();
    try {
      var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Istanbul', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(t);
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      var gunler = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
      return { gun: gunler[o.weekday], dakika: (+o.hour % 24) * 60 + (+o.minute) };
    } catch (e) { var g2 = (t.getDay() + 6) % 7; return { gun: g2, dakika: t.getHours() * 60 + t.getMinutes() }; }
  };
  ZI.magazaDurumu = function (m, t) {
    m = m || ZI.veri.magaza;
    var s = m.saatler || [], n = ZI.istanbulSimdi(t), bugun = s[n.gun];
    if (bugun && !bugun.kapali && n.dakika >= ZI.saatDakika(bugun.acilis) && n.dakika < ZI.saatDakika(bugun.kapanis)) {
      return { acik: true, metin: 'Şu an açık', detay: 'Kapanış ' + bugun.kapanis };
    }
    if (bugun && !bugun.kapali && n.dakika < ZI.saatDakika(bugun.acilis)) return { acik: false, metin: 'Şu an kapalı', detay: 'Açılış bugün ' + bugun.acilis };
    for (var i = 1; i <= 7; i++) {
      var gi = (n.gun + i) % 7, gg = s[gi];
      if (gg && !gg.kapali) return { acik: false, metin: 'Şu an kapalı', detay: 'Açılış ' + (i === 1 ? 'yarın' : ZI.GUNLER[gi]) + ' ' + gg.acilis };
    }
    return { acik: false, metin: 'Şu an kapalı', detay: '' };
  };
  ZI.saatOzeti = function (m) {
    m = m || ZI.veri.magaza;
    var s = m.saatler || [], satirlar = [];
    function yaz(x) { return x.kapali ? 'Kapalı' : x.acilis + ' – ' + x.kapanis; }
    var hi = s.slice(0, 5).map(yaz);
    var hepsiAyni = hi.every(function (x) { return x === hi[0]; });
    if (hepsiAyni) satirlar.push({ etiket: 'Hafta içi', deger: hi[0], gunler: [0, 1, 2, 3, 4] });
    else s.slice(0, 5).forEach(function (x, i) { satirlar.push({ etiket: ZI.GUNLER[i], deger: yaz(x), gunler: [i] }); });
    satirlar.push({ etiket: 'Cumartesi', deger: yaz(s[5] || { kapali: true }), gunler: [5] });
    satirlar.push({ etiket: 'Pazar', deger: yaz(s[6] || { kapali: true }), gunler: [6] });
    return satirlar;
  };

  /* =====================================================================
     Üst menü, mega menü, mobil menü, arama
     ===================================================================== */
  var MENU = [
    { id: 'iphone', ad: 'iPhone & Apple', kisa: 'iPhone', link: 'urunler.html?k=iphone' },
    { id: 'android', ad: 'Android (Samsung & Diğer)', kisa: 'Android', link: 'urunler.html?k=android' },
    { id: 'tablet', ad: 'Tabletler & Laptoplar', kisa: 'Tablet & Laptop', link: 'urunler.html?k=tablet-laptop' },
    { id: 'aksesuar', ad: 'Aksesuarlar', link: 'urunler.html?k=aksesuar' },
    { id: 'ikinciel', ad: 'İkinci El & Takas', kisa: 'İkinci El', link: 'urunler.html?k=ikinci-el' },
    { id: 'iletisim', ad: 'İletişim', link: 'index.html#iletisim' }
  ];
  ZI.MENU = MENU;

  ZI.navCiz = function () {
    var nav = $('#zi-nav');
    if (!nav || nav.dataset.hazir) return;
    nav.dataset.hazir = '1';
    nav.classList.add('zi-nav');
    nav.innerHTML =
      '<div class="zi-nav__ic">' +
      '<a class="zi-marka" href="index.html" aria-label="Zümrüt İletişim ana sayfa">' + ZI.logo('tam', 'zi-logo') + '</a>' +
      '<ul class="zi-menu" role="list">' + MENU.map(function (m) {
        return '<li class="zi-menu__oge" data-menu="' + m.id + '"><a class="zi-menu__dugme' + (m.kisa ? ' zi-menu__dugme--kisa' : '') + '" href="' + m.link + '" aria-haspopup="true" aria-expanded="false" aria-controls="zi-mega"' + (m.kisa ? ' aria-label="' + k(m.ad) + '"' : '') + '><span class="zi-menu__uzun">' + k(m.ad) + '</span>' + (m.kisa ? '<span class="zi-menu__kisa" aria-hidden="true">' + k(m.kisa) + '</span>' : '') + '</a></li>';
      }).join('') + '</ul>' +
      '<div class="zi-nav__sag">' +
      '<button class="zi-nav__ikon" type="button" data-arama aria-label="Ürün ara" aria-expanded="false">' + ZI.ikon('ara') + '</button>' +
      '<a class="zi-nav__ikon zi-nav__yonetici" href="giris.html" title="Yönetici Girişi" aria-label="Yönetici Girişi">' + ZI.ikon('kisi') + '<span>Yönetici</span></a>' +
      '<button class="zi-hamburger" type="button" aria-label="Menüyü aç" aria-expanded="false" aria-controls="zi-mobil"><span></span><span></span></button>' +
      '</div></div>';

    var mega = d.createElement('div');
    mega.className = 'zi-mega'; mega.id = 'zi-mega';
    mega.innerHTML = '<div class="zi-mega__ic"></div>';
    var perde = d.createElement('div'); perde.className = 'zi-perde'; perde.setAttribute('aria-hidden', 'true');
    var mobil = d.createElement('div'); mobil.className = 'zi-mobil'; mobil.id = 'zi-mobil'; mobil.setAttribute('aria-label', 'Menü');
    nav.after(mega); d.body.appendChild(perde); d.body.appendChild(mobil);
    menuDavranisi(nav, mega, perde, mobil);
  };

  function kucukUrun(u, alt) {
    var gr = ZI.gorseller(u)[0];
    return '<a class="zi-mega__link" href="' + ZI.urunLink(u) + '"><span class="zi-mega__kucuk-gorsel">' + (gr ? ZI.gorselHTML(gr, '') : '') + '</span><span>' + k(u.ad) +
      (u.rozet ? ' <span class="zi-yeni">' + k(u.rozet) + '</span>' : '') + '<small>' + k(alt || ZI.fiyatMetni(u)) + '</small></span></a>';
  }
  function modelKutusu(u) {
    var gr = ZI.gorseller(u)[0];
    return '<a class="zi-model" href="' + ZI.urunLink(u) + '"><span class="zi-model__gorsel">' + (gr ? ZI.gorselHTML(gr, '') : '') + '</span>' +
      '<span class="zi-model__ad">' + k(u.ad) + '</span>' +
      (u.rozet ? '<span class="zi-yeni">' + k(u.rozet) + '</span>' : '<span class="zi-model__alt">' + k(u.durum === 'ikinci-el' ? ('%' + (u.pilSagligi || '—') + ' pil') : (u.cikisYili || '')) + '</span>') + '</a>';
  }
  function kademe(i) { return ' style="--i:' + i + '"'; }

  ZI.megaIcerik = function (veri) {
    var hepsi = ZI.sirala(ZI.aktifUrunler(veri));
    var iphone = hepsi.filter(ZI.kategoriler.iphone.f);
    var m = veri.magaza;
    var html = '';

    /* iPhone & Apple */
    html += '<section class="zi-mega__bolum" data-menu="iphone" aria-label="iPhone & Apple"><div class="zi-mega-iphone"><div>' +
      '<div class="zi-segment zi-mega__kademe" role="group" aria-label="Ürün durumu"' + kademe(0) + '><span class="zi-segment__kaydirac"></span>' +
      '<button type="button" aria-pressed="true" data-durum="sifir">Sıfır</button><button type="button" aria-pressed="false" data-durum="ikinci-el">2. El</button></div>' +
      '<div class="zi-model-rafi zi-mega__kademe" data-raf="iphone"' + kademe(1) + '></div></div>' +
      '<div class="zi-mega__yan">' +
      '<p class="zi-mega__kolon-baslik zi-mega__kademe"' + kademe(2) + '>iPhone</p>' +
      '<a class="zi-mega__buyuk-link zi-mega__kademe"' + kademe(3) + ' href="urunler.html?k=iphone">Tüm iPhone\'lar</a>' +
      '<a class="zi-mega__buyuk-link zi-mega__kademe"' + kademe(4) + ' href="urunler.html?k=iphone&amp;d=sifir">Sıfır / Kapalı Kutu</a>' +
      '<a class="zi-mega__buyuk-link zi-mega__kademe"' + kademe(5) + ' href="urunler.html?k=iphone&amp;d=ikinci-el">İkinci El</a>' +
      '<p class="zi-mega__kolon-baslik zi-mega__kademe"' + kademe(6) + '>Diğer Apple ürünleri</p>' +
      '<a class="zi-mega__link zi-mega__kademe"' + kademe(7) + ' href="urunler.html?k=ipad">iPad</a>' +
      '<a class="zi-mega__link zi-mega__kademe"' + kademe(8) + ' href="urunler.html?k=macbook">MacBook</a>' +
      '<a class="zi-mega__link zi-mega__kademe"' + kademe(9) + ' href="urunler.html?k=apple">Tüm Apple ürünleri</a>' +
      '</div></div></section>';

    /* Android */
    var sSerisi = hepsi.filter(ZI.kategoriler['galaxy-s'].f).slice(0, 5);
    var katlanir = hepsi.filter(function (u) { return u.katlanabilir && u.kategori === 'telefon' && u.marka !== 'Apple'; }).slice(0, 5);
    var xiaomi = hepsi.filter(ZI.kategoriler.xiaomi.f).slice(0, 5);
    var digerAndroid = hepsi.filter(function (u) { return ZI.kategoriler.android.f(u) && !ZI.kategoriler['galaxy-s'].f(u) && !u.katlanabilir && u.marka !== 'Xiaomi'; }).slice(0, 3);
    html += '<section class="zi-mega__bolum" data-menu="android" aria-label="Android"><div class="zi-mega__izgara" style="--kolon:4">' +
      kolon('Samsung Galaxy S Serisi', sSerisi.length ? sSerisi : digerAndroid.filter(function (u) { return u.marka === 'Samsung'; }).slice(0, 5), 'urunler.html?k=samsung', 'Tüm Samsung Galaxy', 0) +
      kolon('Katlanabilir Telefonlar', katlanir, 'urunler.html?k=katlanabilir', 'Tüm katlanabilirler', 1) +
      kolon('Xiaomi & Redmi', xiaomi, 'urunler.html?k=xiaomi', 'Tüm Xiaomi', 2) +
      '<div class="zi-mega__kademe"' + kademe(3) + '><p class="zi-mega__kolon-baslik">Keşfedin</p>' +
      '<a class="zi-mega__buyuk-link" href="urunler.html?k=android">Tüm Android</a>' +
      '<a class="zi-mega__buyuk-link" href="urunler.html?k=samsung">Samsung</a>' +
      '<a class="zi-mega__buyuk-link" href="urunler.html?k=xiaomi">Xiaomi</a>' +
      '<a class="zi-mega__buyuk-link" href="urunler.html?k=android&amp;d=ikinci-el">İkinci El</a></div>' +
      '</div></section>';

    /* Tablet & Laptop */
    var ipad = hepsi.filter(ZI.kategoriler.ipad.f).slice(0, 5);
    var andTab = hepsi.filter(function (u) { return u.kategori === 'tablet' && u.marka !== 'Apple'; }).slice(0, 5);
    var laptop = hepsi.filter(ZI.kategoriler.laptop.f).slice(0, 5);
    html += '<section class="zi-mega__bolum" data-menu="tablet" aria-label="Tabletler ve Laptoplar"><div class="zi-mega__izgara" style="--kolon:4">' +
      kolon('iPad', ipad, 'urunler.html?k=ipad', 'Tüm iPad\'ler', 0) +
      kolon('Android Tabletler', andTab, 'urunler.html?k=tablet', 'Tüm tabletler', 1) +
      kolon('Laptoplar', laptop, 'urunler.html?k=laptop', 'Tüm laptoplar', 2) +
      '<div class="zi-mega__kademe"' + kademe(3) + '><p class="zi-mega__kolon-baslik">Keşfedin</p>' +
      '<a class="zi-mega__buyuk-link" href="urunler.html?k=tablet-laptop">Tümü</a>' +
      '<a class="zi-mega__buyuk-link" href="urunler.html?k=ipad">iPad</a>' +
      '<a class="zi-mega__buyuk-link" href="urunler.html?k=macbook">MacBook</a>' +
      '<a class="zi-mega__buyuk-link" href="urunler.html?k=tablet-laptop&amp;d=ikinci-el">İkinci El</a></div>' +
      '</div></section>';

    /* Aksesuarlar */
    var aks = hepsi.filter(ZI.kategoriler.aksesuar.f);
    var ak = [
      { k: 'kilif', ad: 'Kılıflar', c: { cizim: 'kilif', renk: '#8fb3d9' } },
      { k: 'sarj', ad: 'Şarj Aletleri', c: { cizim: 'adaptor' } },
      { k: 'cam', ad: 'Kırılmaz Camlar', c: { cizim: 'cam' } },
      { k: 'kulaklik', ad: 'Kulaklıklar', c: { cizim: 'kulaklik' } }
    ];
    html += '<section class="zi-mega__bolum" data-menu="aksesuar" aria-label="Aksesuarlar"><div class="zi-ikon-rafi">' +
      ak.map(function (a, i) {
        var say = aks.filter(ZI.kategoriler[a.k].f).length;
        return '<a class="zi-ikon-kutu zi-mega__kademe"' + kademe(i) + ' href="urunler.html?k=' + a.k + '"><img src="' + ZI.cizim.url(a.c) + '" alt="">' + k(a.ad) + '<small>' + say + ' ürün</small></a>';
      }).join('') + '</div>' +
      '<a class="zi-mega__tumu zi-mega__kademe"' + kademe(5) + ' href="urunler.html?k=aksesuar">Tüm aksesuarlar ' + ZI.ikon('sag') + '</a></section>';

    /* İkinci El & Takas */
    var ikinci = ZI.sirala(hepsi.filter(ZI.kategoriler['ikinci-el'].f), 'yeni-eklenen').slice(0, 5);
    html += '<section class="zi-mega__bolum" data-menu="ikinciel" aria-label="İkinci El ve Takas"><div class="zi-mega__izgara" style="--kolon:3">' +
      '<div class="zi-mega__kademe"' + kademe(0) + '><p class="zi-mega__kolon-baslik">Son eklenen ikinci el cihazlar</p>' +
      (ikinci.length ? ikinci.map(function (u) { return kucukUrun(u, (u.pilSagligi ? '%' + u.pilSagligi + ' pil · ' : '') + (u.kozmetik || '') + ' · ' + (ZI.fiyatYaz(ZI.baslangicFiyati(u)) || 'Fiyat sorun')); }).join('') : '<p class="zi-arama__bos">Şu an listelenmiş ikinci el cihaz yok.</p>') +
      '<a class="zi-mega__tumu" href="urunler.html?k=ikinci-el">Tüm ikinci el cihazlar ' + ZI.ikon('sag') + '</a></div>' +
      '<div class="zi-mega__kademe"' + kademe(1) + '><p class="zi-mega__kolon-baslik">Takas nasıl işler?</p><div class="zi-adimlar">' +
      '<div class="zi-adim"><span><b>Cihazınızı getirin</b>Eski telefonunuzu mağazamıza getirin ya da WhatsApp\'tan fotoğrafını gönderin.</span></div>' +
      '<div class="zi-adim"><span><b>Değerini birlikte belirleyelim</b>Pil sağlığı, kozmetik durum ve parçalar kontrol edilerek takas değeri çıkarılır.</span></div>' +
      '<div class="zi-adim"><span><b>Farkı ödeyin, yenisini alın</b>Takas değeri, seçtiğiniz sıfır ya da ikinci el cihazın fiyatından düşülür.</span></div>' +
      '</div></div>' +
      '<div class="zi-mega__kademe"' + kademe(2) + '><p class="zi-mega__kolon-baslik">Takas teklifi alın</p>' +
      '<a class="zi-mega__buyuk-link" href="' + k(ZI.waLink('Merhaba, cihazım için takas teklifi almak istiyorum.', m)) + '" target="_blank" rel="noopener">WhatsApp\'tan yazın</a>' +
      '<a class="zi-mega__buyuk-link" href="' + ZI.telLink(m) + '">' + k(m.telefon) + '</a>' +
      '<a class="zi-mega__buyuk-link" href="urunler.html?k=ikinci-el">İkinci El Vitrini</a></div>' +
      '</div></section>';

    /* İletişim */
    var durum = ZI.magazaDurumu(m);
    html += '<section class="zi-mega__bolum" data-menu="iletisim" aria-label="İletişim"><div class="zi-mega__izgara" style="--kolon:4">' +
      '<div class="zi-mega__kademe"' + kademe(0) + '><p class="zi-mega__kolon-baslik">Mağaza</p><a class="zi-mega__buyuk-link" href="index.html#iletisim">' + k(m.ad) + '</a>' +
      '<p class="zi-mega__link" style="font-weight:400">' + k(m.adres) + '</p><span class="zi-acik-durum' + (durum.acik ? '' : ' kapali') + '">' + k(durum.metin) + (durum.detay ? ' · ' + k(durum.detay) : '') + '</span>' +
      '<a class="zi-mega__link" href="' + k(ZI.yolTarifi(m)) + '" target="_blank" rel="noopener" style="margin-top:8px">' + ZI.ikon('konum') + ' Yol tarifi al</a></div>' +
      '<div class="zi-mega__kademe"' + kademe(1) + '><p class="zi-mega__kolon-baslik">Bize ulaşın</p>' +
      '<a class="zi-mega__link" href="' + ZI.telLink(m) + '">' + ZI.ikon('telefon') + ' ' + k(m.telefon) + '</a>' +
      '<a class="zi-mega__link" href="' + k(ZI.waLink('Merhaba, bilgi almak istiyorum.', m)) + '" target="_blank" rel="noopener">' + ZI.ikon('mesaj') + ' WhatsApp ile yazın</a>' +
      (m.instagram ? '<a class="zi-mega__link" href="' + k(ZI.instagramLink(m.instagram)) + '" target="_blank" rel="noopener">' + ZI.ikon('instagram') + ' ' + k(ZI.instagramAd(m)) + '</a>' : '') +
      (m.eposta ? '<a class="zi-mega__link" href="mailto:' + k(m.eposta) + '">' + ZI.ikon('eposta') + ' ' + k(m.eposta) + '</a>' : '') + '</div>' +
      '<div class="zi-mega__kademe"' + kademe(2) + '><p class="zi-mega__kolon-baslik">Çalışma saatleri</p>' +
      ZI.saatOzeti(m).map(function (s) { return '<p class="zi-mega__link" style="justify-content:space-between;font-weight:400"><span>' + k(s.etiket) + '</span><b>' + k(s.deger) + '</b></p>'; }).join('') + '</div>' +
      (m.tamir && m.tamir.aktif
        ? '<div class="zi-mega__kademe"' + kademe(3) + '><p class="zi-mega__kolon-baslik">Tamir ve teknik servis</p>' +
          '<a class="zi-mega__buyuk-link" href="index.html#tamir">Telefon tamiri</a>' +
          '<a class="zi-mega__link" href="' + k(ZI.waLink(ZI.tamirWa, m)) + '" target="_blank" rel="noopener">' + ZI.ikon('mesaj') + ' Arızayı WhatsApp’tan sorun</a></div>'
        : '<div class="zi-mega__kademe"' + kademe(3) + '><p class="zi-mega__kolon-baslik">Yol tarifi</p>' +
          '<a class="zi-mega__buyuk-link" href="' + k(ZI.yolTarifi(m)) + '" target="_blank" rel="noopener">Haritada aç</a>' +
          '<a class="zi-mega__buyuk-link" href="index.html#iletisim">Biz kimiz?</a></div>') +
      '</div></section>';

    /* Arama */
    html += '<section class="zi-mega__bolum" data-menu="arama" aria-label="Arama"><form class="zi-arama__alan zi-mega__kademe" role="search" action="urunler.html"' + kademe(0) + '>' + ZI.ikon('ara') +
      '<input type="search" name="q" placeholder="Ürün, marka veya model arayın" autocomplete="off" aria-label="Ürün ara"></form>' +
      '<p class="zi-mega__kolon-baslik zi-mega__kademe" data-arama-baslik' + kademe(1) + '>Hızlı bağlantılar</p><div class="zi-arama__sonuc zi-mega__kademe" data-arama-sonuc' + kademe(2) + '>' +
      [['iPhone', 'urunler.html?k=iphone'], ['Samsung Galaxy', 'urunler.html?k=samsung'], ['Katlanabilir telefonlar', 'urunler.html?k=katlanabilir'], ['İkinci el cihazlar', 'urunler.html?k=ikinci-el'], ['Kılıflar', 'urunler.html?k=kilif'], ['Şarj aletleri', 'urunler.html?k=sarj']]
        .map(function (x) { return '<a class="zi-mega__link" href="' + x[1] + '">' + ZI.ikon('sag') + ' ' + x[0] + '</a>'; }).join('') +
      '</div></section>';

    return html;

    function kolon(baslik, liste, link, linkAd, i) {
      return '<div class="zi-mega__kademe"' + kademe(i) + '><p class="zi-mega__kolon-baslik">' + k(baslik) + '</p>' +
        (liste.length ? liste.map(function (u) { return kucukUrun(u); }).join('') : '<p class="zi-arama__bos">Bu grupta şu an ürün yok.</p>') +
        '<a class="zi-mega__tumu" href="' + link + '">' + k(linkAd) + ' ' + ZI.ikon('sag') + '</a></div>';
    }
  };

  ZI.mobilIcerik = function (veri) {
    var hepsi = ZI.sirala(ZI.aktifUrunler(veri));
    var m = veri.magaza;
    function liste(urunler) {
      return urunler.map(function (u) {
        var gr = ZI.gorseller(u)[0];
        return '<li><a href="' + ZI.urunLink(u) + '">' + (gr ? '<img src="' + k(gr.src) + '" alt="" loading="lazy">' : '') + '<span>' + k(u.ad) + (u.rozet ? '<span class="zi-yeni"> ' + k(u.rozet) + '</span>' : '') + '<br><small>' + k(ZI.durumEtiketi(u)) + '</small></span></a></li>';
      }).join('');
    }
    function blok(id, ad, ic) {
      return '<li class="zi-mobil__oge"><button class="zi-mobil__dugme" type="button" aria-expanded="false" aria-controls="zi-mobil-' + id + '">' + k(ad) + ZI.ikon('asagi') + '</button>' +
        '<div class="zi-mobil__alt" id="zi-mobil-' + id + '"><div><ul>' + ic + '</ul></div></div></li>';
    }
    function tumu(link, ad) { return '<li><a href="' + link + '">' + ZI.ikon('sag') + ' ' + k(ad) + '</a></li>'; }
    var html = '<form class="zi-arama__alan" role="search" action="urunler.html" style="margin-top:8px">' + ZI.ikon('ara') + '<input type="search" name="q" placeholder="Ürün ara" aria-label="Ürün ara"></form><ul>';
    html += blok('iphone', 'iPhone & Apple', liste(hepsi.filter(function (u) { return ZI.kategoriler.iphone.f(u) && u.durum === 'sifir'; }).slice(0, 6)) +
      tumu('urunler.html?k=iphone&d=sifir', 'Sıfır iPhone\'lar') + tumu('urunler.html?k=iphone&d=ikinci-el', 'İkinci el iPhone\'lar') + tumu('urunler.html?k=apple', 'Tüm Apple ürünleri'));
    html += blok('android', 'Android (Samsung & Diğer)', liste(hepsi.filter(ZI.kategoriler.android.f).slice(0, 6)) +
      tumu('urunler.html?k=samsung', 'Samsung Galaxy') + tumu('urunler.html?k=katlanabilir', 'Katlanabilir telefonlar') + tumu('urunler.html?k=xiaomi', 'Xiaomi & Redmi'));
    html += blok('tablet', 'Tabletler & Laptoplar', liste(hepsi.filter(ZI.kategoriler['tablet-laptop'].f).slice(0, 5)) + tumu('urunler.html?k=tablet-laptop', 'Tümünü gör'));
    html += blok('aksesuar', 'Aksesuarlar', tumu('urunler.html?k=kilif', 'Kılıflar') + tumu('urunler.html?k=sarj', 'Şarj Aletleri & Adaptörler') + tumu('urunler.html?k=cam', 'Kırılmaz Camlar') + tumu('urunler.html?k=kulaklik', 'Kulaklık & Aksesuarlar'));
    html += blok('ikinciel', 'İkinci El & Takas', liste(hepsi.filter(ZI.kategoriler['ikinci-el'].f).slice(0, 5)) + tumu('urunler.html?k=ikinci-el', 'Tüm ikinci el cihazlar') +
      '<li><a href="' + k(ZI.waLink('Merhaba, cihazım için takas teklifi almak istiyorum.', m)) + '" target="_blank" rel="noopener">' + ZI.ikon('takas') + ' Takas teklifi alın</a></li>');
    html += blok('iletisim', m.tamir && m.tamir.aktif ? 'Tamir & İletişim' : 'İletişim', '<li><a href="' + ZI.telLink(m) + '">' + ZI.ikon('telefon') + ' ' + k(m.telefon) + '</a></li>' +
      '<li><a href="' + k(ZI.waLink('Merhaba, bilgi almak istiyorum.', m)) + '" target="_blank" rel="noopener">' + ZI.ikon('mesaj') + ' WhatsApp</a></li>' +
      (m.instagram ? '<li><a href="' + k(ZI.instagramLink(m.instagram)) + '" target="_blank" rel="noopener">' + ZI.ikon('instagram') + ' Instagram · ' + k(ZI.instagramAd(m)) + '</a></li>' : '') +
      '<li><a href="' + k(ZI.yolTarifi(m)) + '" target="_blank" rel="noopener">' + ZI.ikon('konum') + ' Yol tarifi</a></li>' +
      (m.tamir && m.tamir.aktif ? '<li><a href="index.html#tamir">' + ZI.ikon('tamir') + ' Tamir ve teknik servis</a></li>' : '') + tumu('index.html#iletisim', 'Biz kimiz?'));
    html += '</ul><a class="zi-mobil__yonetici" href="giris.html">' + ZI.ikon('kilit') + ' Yönetici Girişi</a>';
    return html;
  };

  function menuDavranisi(nav, mega, perde, mobil) {
    var ic = $('.zi-mega__ic', mega);
    var acik = null, acZ = null, kapaZ = null;
    var inceIsaretci = g.matchMedia && g.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function tetikleyiciler(id) { return $$('[data-menu="' + id + '"] > .zi-menu__dugme', nav); }
    function ac(id, odak) {
      clearTimeout(kapaZ); clearTimeout(acZ);
      if (!ic.children.length) return;
      if (acik === id) { if (odak) ilkOdak(); return; }
      $$('.zi-mega__bolum', ic).forEach(function (b) { b.classList.toggle('aktif', b.dataset.menu === id); });
      $$('.zi-menu__dugme', nav).forEach(function (a) { a.setAttribute('aria-expanded', 'false'); });
      tetikleyiciler(id).forEach(function (a) { a.setAttribute('aria-expanded', 'true'); });
      $('[data-arama]', nav).setAttribute('aria-expanded', id === 'arama' ? 'true' : 'false');
      mega.style.height = ic.scrollHeight + 'px';
      nav.classList.add('zi-nav--acik'); perde.classList.add('acik');
      acik = id;
      if (id === 'iphone') segmentGuncelle();
      if (id === 'arama') setTimeout(function () { var inp = $('[data-menu="arama"] input', ic); if (inp) inp.focus(); }, 60);
      else if (odak) ilkOdak();
    }
    function ilkOdak() { var a = $('.zi-mega__bolum.aktif a, .zi-mega__bolum.aktif button', ic); if (a) a.focus(); }
    function kapat(odakGeri) {
      clearTimeout(acZ); clearTimeout(kapaZ);
      if (!acik) return;
      var onceki = acik;
      mega.style.height = '0px';
      nav.classList.remove('zi-nav--acik'); perde.classList.remove('acik');
      $$('.zi-menu__dugme', nav).forEach(function (a) { a.setAttribute('aria-expanded', 'false'); });
      $('[data-arama]', nav).setAttribute('aria-expanded', 'false');
      acik = null;
      if (odakGeri) { var t = onceki === 'arama' ? $('[data-arama]', nav) : tetikleyiciler(onceki)[0]; if (t) t.focus(); }
    }
    ZI.megaKapat = kapat;

    $$('.zi-menu__oge', nav).forEach(function (li) {
      var id = li.dataset.menu, a = $('.zi-menu__dugme', li);
      li.addEventListener('mouseenter', function () {
        if (!inceIsaretci) return;
        clearTimeout(kapaZ); clearTimeout(acZ);
        acZ = setTimeout(function () { ac(id); }, acik ? 40 : 160);
      });
      a.addEventListener('click', function (e) {
        // Dokunmatik: ilk dokunuş menüyü açar, ikinci dokunuş sayfaya gider.
        if (!inceIsaretci && acik !== id) { e.preventDefault(); ac(id); }
      });
      a.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || (e.key === ' ' && !e.shiftKey)) { e.preventDefault(); ac(id, true); }
      });
    });
    nav.addEventListener('mouseleave', function () { if (inceIsaretci && acik !== 'arama') kapaZ = setTimeout(function () { kapat(); }, 220); });
    mega.addEventListener('mouseenter', function () { clearTimeout(kapaZ); clearTimeout(acZ); });
    mega.addEventListener('mouseleave', function () { if (inceIsaretci && acik !== 'arama') kapaZ = setTimeout(function () { kapat(); }, 220); });
    $('.zi-marka', nav).addEventListener('mouseenter', function () { clearTimeout(acZ); });
    perde.addEventListener('click', function () { kapat(); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (acik) kapat(true);
        if (mobil.classList.contains('acik')) mobilKapat(true);
      }
    });
    mega.addEventListener('focusout', function (e) {
      // Yalnızca klavye odağı gerçekten menü dışına taşındığında kapat
      // (bölüm değişirken gizlenen bir düğmenin odağı kaybetmesi kapatmamalı).
      var hedef = e.relatedTarget;
      if (!hedef) return;
      if (acik && acik !== 'arama' && !mega.contains(hedef) && !nav.contains(hedef)) kapat();
    });

    // Arama
    $('[data-arama]', nav).addEventListener('click', function () {
      if (g.innerWidth < 834) { mobilAc(); setTimeout(function () { var i = $('input', mobil); if (i) i.focus(); }, 80); return; }
      if (acik === 'arama') kapat(true); else ac('arama');
    });
    ic.addEventListener('input', function (e) {
      if (e.target.name !== 'q' || !ZI.veri) return;
      var q = e.target.value;
      var sonuc = $('[data-arama-sonuc]', ic), baslik = $('[data-arama-baslik]', ic);
      if (!q.trim()) { baslik.textContent = 'Hızlı bağlantılar'; sonuc.innerHTML = ZI._hizli || sonuc.innerHTML; mega.style.height = ic.scrollHeight + 'px'; return; }
      if (!ZI._hizli) ZI._hizli = sonuc.innerHTML;
      var bulunan = ZI.ara(ZI.aktifUrunler(), q).slice(0, 9);
      baslik.textContent = bulunan.length ? 'Ürünler' : 'Sonuç bulunamadı';
      sonuc.innerHTML = bulunan.length ? bulunan.map(function (u) { return kucukUrun(u); }).join('') : '<p class="zi-arama__bos">“' + k(q) + '” için eşleşen ürün yok. Farklı bir kelime deneyin ya da bize WhatsApp\'tan sorun.</p>';
      mega.style.height = ic.scrollHeight + 'px';
    });

    // iPhone segmenti
    function segmentGuncelle(durum) {
      var seg = $('[data-menu="iphone"] .zi-segment', ic);
      if (!seg || !ZI.veri) return;
      var btn = durum ? $('[data-durum="' + durum + '"]', seg) : $('[aria-pressed="true"]', seg);
      $$('button', seg).forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      var kay = $('.zi-segment__kaydirac', seg);
      kay.style.width = btn.offsetWidth + 'px';
      kay.style.transform = 'translateX(' + (btn.offsetLeft - 3) + 'px)';
      var liste = ZI.sirala(ZI.aktifUrunler().filter(function (u) { return ZI.kategoriler.iphone.f(u) && u.durum === btn.dataset.durum; })).slice(0, 8);
      var raf = $('[data-raf="iphone"]', ic);
      raf.innerHTML = liste.length ? liste.map(modelKutusu).join('') : '<p class="zi-arama__bos">Bu durumda listelenmiş iPhone yok.</p>';
      if (acik === 'iphone') mega.style.height = ic.scrollHeight + 'px';
    }
    ic.addEventListener('click', function (e) {
      var b = e.target.closest('.zi-segment button');
      if (b) segmentGuncelle(b.dataset.durum);
    });
    ZI._segmentGuncelle = segmentGuncelle;

    // Mobil
    var ham = $('.zi-hamburger', nav);
    function mobilAc() {
      mobil.classList.add('acik'); ham.setAttribute('aria-expanded', 'true'); ham.setAttribute('aria-label', 'Menüyü kapat');
      d.body.classList.add('zi-kilit'); nav.classList.add('zi-nav--acik');
    }
    function mobilKapat(odak) {
      mobil.classList.remove('acik'); ham.setAttribute('aria-expanded', 'false'); ham.setAttribute('aria-label', 'Menüyü aç');
      d.body.classList.remove('zi-kilit'); nav.classList.remove('zi-nav--acik');
      if (odak) ham.focus();
    }
    ham.addEventListener('click', function () { if (mobil.classList.contains('acik')) mobilKapat(); else mobilAc(); });
    mobil.addEventListener('click', function (e) {
      var b = e.target.closest('.zi-mobil__dugme');
      if (b) { var a = b.getAttribute('aria-expanded') === 'true'; b.setAttribute('aria-expanded', a ? 'false' : 'true'); return; }
      if (e.target.closest('a')) mobilKapat();
    });
    g.addEventListener('resize', function () {
      if (g.innerWidth >= 834 && mobil.classList.contains('acik')) mobilKapat();
      if (g.innerWidth < 834 && acik) kapat();
      if (acik) mega.style.height = ic.scrollHeight + 'px';
    });
  }

  ZI.navDoldur = function (veri) {
    var ic = $('.zi-mega__ic');
    if (ic) { ic.innerHTML = ZI.megaIcerik(veri); ZI._hizli = null; }
    var mobil = $('#zi-mobil');
    if (mobil) mobil.innerHTML = ZI.mobilIcerik(veri);
    /* Tamir bölümü açıksa üst menüde "Tamir & İletişim" yazar */
    var t = veri.magaza && veri.magaza.tamir && veri.magaza.tamir.aktif;
    $$('[data-menu="iletisim"] > .zi-menu__dugme .zi-menu__uzun').forEach(function (a) { a.textContent = t ? 'Tamir & İletişim' : 'İletişim'; });
  };

  /* =====================================================================
     Alt bilgi
     ===================================================================== */
  ZI.altCiz = function (veri) {
    var alt = $('#zi-alt');
    if (!alt) return;
    var m = veri.magaza, yil = new Date().getFullYear();
    alt.className = 'zi-alt';
    alt.innerHTML = '<div class="zi-alt__ic">' +
      '<div class="zi-alt__not"><p>' + k(m.fiyatNotu) + '</p>' +
      '<p>Apple, iPhone, iPad, MacBook ve AirPods, Apple Inc.’in; Samsung ve Galaxy, Samsung Electronics Co., Ltd.’nin; Xiaomi ve Redmi, Xiaomi Inc.’in tescilli markalarıdır. Fotoğraf yüklenmemiş ürünlerde gösterilen çizimler temsilidir.</p></div>' +
      '<div class="zi-alt__kolonlar">' +
      '<div class="zi-alt__kolon"><h3>Telefonlar</h3><ul><li><a href="urunler.html?k=iphone">iPhone</a></li><li><a href="urunler.html?k=samsung">Samsung Galaxy</a></li><li><a href="urunler.html?k=katlanabilir">Katlanabilir</a></li><li><a href="urunler.html?k=xiaomi">Xiaomi & Redmi</a></li></ul></div>' +
      '<div class="zi-alt__kolon"><h3>Tablet, Laptop ve Aksesuar</h3><ul><li><a href="urunler.html?k=ipad">iPad</a></li><li><a href="urunler.html?k=tablet">Tabletler</a></li><li><a href="urunler.html?k=laptop">Laptoplar</a></li><li><a href="urunler.html?k=aksesuar">Aksesuarlar</a></li></ul></div>' +
      '<div class="zi-alt__kolon"><h3>İkinci El & Takas</h3><ul><li><a href="urunler.html?k=ikinci-el">İkinci el cihazlar</a></li><li><a href="' + k(ZI.waLink('Merhaba, cihazım için takas teklifi almak istiyorum.', m)) + '" target="_blank" rel="noopener">Takas teklifi alın</a></li><li><a href="urunler.html?k=sifir">Sıfır / Kapalı Kutu</a></li></ul></div>' +
      '<div class="zi-alt__kolon"><h3>Mağaza</h3><ul><li><a href="index.html#iletisim">Biz kimiz?</a></li><li><a href="' + ZI.telLink(m) + '">' + k(m.telefon) + '</a></li>' +
      (m.eposta ? '<li><a href="mailto:' + k(m.eposta) + '">' + k(m.eposta) + '</a></li>' : '') +
      (m.instagram ? '<li><a href="' + k(ZI.instagramLink(m.instagram)) + '" target="_blank" rel="noopener">Instagram · ' + k(ZI.instagramAd(m)) + '</a></li>' : '') +
      (m.tamir && m.tamir.aktif ? '<li><a href="index.html#tamir">Tamir ve teknik servis</a></li>' : '') +
      '<li><a href="' + k(ZI.yolTarifi(m)) + '" target="_blank" rel="noopener">Yol tarifi</a></li><li><a href="giris.html">Yönetici Girişi</a></li></ul></div>' +
      '</div>' +
      '<div class="zi-alt__son"><span class="zi-alt__marka">' + ZI.logo('tam', 'zi-logo zi-logo--alt') + '<span>Copyright © ' + yil + ' ' + k(m.ad) + '. Tüm hakları saklıdır.</span></span><nav aria-label="Alt bağlantılar"><span>' + k(m.adres) + '</span></nav></div>' +
      '</div>';
  };

  /* =====================================================================
     Önizleme bandı, bildirim, belirme
     ===================================================================== */
  ZI.onizlemeBandi = function () {
    if (!ZI.onizlemede || $('.zi-onizleme')) return;
    var b = d.createElement('div');
    b.className = 'zi-onizleme'; b.setAttribute('role', 'status');
    b.innerHTML = ZI.onizlemeNedeni === 'guncelleniyor'
      ? '<span><b>Yayınlanıyor</b> · Site birkaç dakika içinde herkes için güncellenecek.</span><a href="depo.html">Panele dön</a>'
      : '<span><b>Önizleme</b> · Henüz yayınlanmamış değişiklikleri görüyorsunuz.</span><a href="depo.html">Panele dön</a>';
    d.body.appendChild(b);
  };
  ZI.bildir = function (metin, sure) {
    var b = $('.zi-bildirim');
    if (!b) { b = d.createElement('div'); b.className = 'zi-bildirim'; b.setAttribute('role', 'status'); d.body.appendChild(b); }
    b.textContent = metin;
    requestAnimationFrame(function () { b.classList.add('acik'); });
    clearTimeout(b._z); b._z = setTimeout(function () { b.classList.remove('acik'); }, sure || 2600);
  };
  ZI.belirmeKur = function (kok) {
    var ogeler = $$('.zi-belir:not(.gorundu)', kok);
    if (!('IntersectionObserver' in g)) { ogeler.forEach(function (o) { o.classList.add('gorundu'); }); return; }
    if (!ZI._gozcu) {
      ZI._gozcu = new IntersectionObserver(function (girdiler) {
        girdiler.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('gorundu'); ZI._gozcu.unobserve(x.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    ogeler.forEach(function (o) { ZI._gozcu.observe(o); });
  };

  /* Sayfa geçişi: görünüm geçişi desteklenmiyorsa kısa bir solma uygula */
  function gecisKur() {
    if ('onpagereveal' in g) return;
    d.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || a.hasAttribute('download')) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^(https?:|mailto:|tel:)/i.test(href) || href.indexOf('#') > 0 && a.pathname === location.pathname) return;
      e.preventDefault();
      d.documentElement.style.transition = 'opacity .18s ease';
      d.documentElement.style.opacity = '0';
      setTimeout(function () { location.href = a.href; }, 170);
    });
    g.addEventListener('pageshow', function () { d.documentElement.style.opacity = ''; });
  }

  /* =====================================================================
     Başlatıcı
     ===================================================================== */
  ZI.hazir = function (fn) { if (d.readyState !== 'loading') fn(); else d.addEventListener('DOMContentLoaded', fn); };
  ZI.baslat = function (sayfa) {
    d.documentElement.classList.remove('no-js');
    ZI.hazir(function () {
      ZI.navCiz();
      gecisKur();
      ZI.veriYukle().then(function (veri) {
        ZI.navDoldur(veri);
        ZI.altCiz(veri);
        try { if (sayfa) sayfa(veri); } catch (e) { if (g.console) console.error(e); }
        ZI.onizlemeBandi();
        ZI.belirmeKur();
      });
    });
  };
})(window);
