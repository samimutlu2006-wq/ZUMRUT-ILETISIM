/*!
 * Zümrüt İletişim — Kategori / arama listesi
 */
(function (g) {
  'use strict';
  var ZI = g.ZI, d = document, $ = ZI.$, $$ = ZI.$$, k = ZI.kacis;

  var SERIT = [
    ['tumu', 'Tümü'], ['iphone', 'iPhone'], ['samsung', 'Samsung'], ['xiaomi', 'Xiaomi'], ['katlanabilir', 'Katlanabilir'],
    ['ipad', 'iPad'], ['macbook', 'MacBook'], ['tablet', 'Tabletler'], ['laptop', 'Laptoplar'], ['aksesuar', 'Aksesuarlar'], ['ikinci-el', 'İkinci El']
  ];

  ZI.baslat(function (veri) {
    var durum = {
      k: ZI.parametre('k') || 'tumu',
      d: ZI.parametre('d') || '',
      m: ZI.parametre('m') || '',
      q: ZI.parametre('q') || '',
      s: ZI.parametre('s') || 'onerilen'
    };
    if (!ZI.kategoriler[durum.k]) durum.k = 'tumu';
    var tum = ZI.aktifUrunler(veri);

    $('#kategori-serit').innerHTML = SERIT.map(function (x) {
      return '<a class="zi-cip' + (x[0] === durum.k && !durum.q ? ' aktif' : '') + '" href="urunler.html?k=' + x[0] + '"' + (x[0] === durum.k && !durum.q ? ' aria-current="page"' : '') + '>' + k(x[1]) + '</a>';
    }).join('');
    $('#sirala').value = durum.s;

    function temel() {
      var l = durum.q ? ZI.ara(tum, durum.q) : ZI.filtrele(tum, durum.k);
      return l;
    }
    function ciz() {
      var kat = ZI.kategoriler[durum.k];
      var baslik = durum.q ? '“' + durum.q + '” için sonuçlar' : kat.baslik;
      $('#liste-baslik').textContent = baslik;
      $('#liste-alt').textContent = durum.q ? 'Ürün adı, marka ve modele göre arandı.' : kat.alt;
      d.title = (durum.q ? 'Arama: ' + durum.q : kat.baslik) + ' · Zümrüt İletişim';

      var l = temel();
      // Durum filtresi (Sıfır / 2. El) yalnızca anlamlıysa
      var sifirSay = l.filter(function (u) { return u.durum === 'sifir'; }).length, ikinciSay = l.length - sifirSay;
      var markalar = {};
      l.forEach(function (u) { if (ZI.markaGoster(u.marka)) markalar[u.marka] = (markalar[u.marka] || 0) + 1; });
      var markaListe = Object.keys(markalar).sort(function (a, b) { return markalar[b] - markalar[a]; });
      var cip = [];
      if (sifirSay && ikinciSay) {
        cip.push(['d', '', 'Tümü', l.length], ['d', 'sifir', 'Sıfır', sifirSay], ['d', 'ikinci-el', '2. El', ikinciSay]);
      }
      if (markaListe.length > 1) markaListe.forEach(function (m) { cip.push(['m', m, m, markalar[m]]); });
      $('#durum-filtre').innerHTML = cip.map(function (c) {
        var aktif = c[0] === 'd' ? durum.d === c[1] : durum.m === c[1];
        return '<button class="zi-cip" type="button" data-alan="' + c[0] + '" data-deger="' + k(c[1]) + '" aria-pressed="' + aktif + '">' + k(c[2]) + ' <small>' + c[3] + '</small></button>';
      }).join('');

      if (durum.d) l = l.filter(function (u) { return u.durum === durum.d; });
      if (durum.m) l = l.filter(function (u) { return u.marka === durum.m; });
      if (!durum.q || durum.s !== 'onerilen') l = ZI.sirala(l, durum.s);

      $('#sayi').textContent = l.length + ' ürün';
      var liste = $('#liste');
      if (!l.length) {
        liste.innerHTML = '<div class="zi-bos" style="grid-column:1/-1"><h2>Aradığınız ürünü bulamadık</h2><p>Stoklarımız sık değişiyor. Aradığınız cihazı bize sorun, sizin için bakalım.</p>' +
          '<div class="zi-btn-grup zi-btn-grup--orta"><a class="zi-btn zi-btn--dolu" href="' + k(ZI.waLink('Merhaba, ' + (durum.q || ZI.kategoriler[durum.k].baslik) + ' hakkında bilgi almak istiyorum.')) + '" target="_blank" rel="noopener">WhatsApp’tan Sorun</a>' +
          '<a class="zi-btn zi-btn--cizgi" href="urunler.html?k=tumu">Tüm ürünler</a></div></div>';
      } else {
        liste.innerHTML = l.map(function (u, i) { return ZI.kartHTML(u, { i: Math.min(i, 8) }); }).join('');
        $$('.zi-kart', liste).forEach(function (el, i) {
          if (i < 12) el.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 550, delay: i * 35, easing: 'cubic-bezier(.28,.11,.32,1)', fill: 'backwards' });
        });
      }
      var p = new URLSearchParams();
      if (durum.q) p.set('q', durum.q); else p.set('k', durum.k);
      if (durum.d) p.set('d', durum.d);
      if (durum.m) p.set('m', durum.m);
      if (durum.s !== 'onerilen') p.set('s', durum.s);
      try { history.replaceState(null, '', 'urunler.html?' + p.toString()); } catch (e) { /* file:// */ }
    }

    $('#durum-filtre').addEventListener('click', function (e) {
      var b = e.target.closest('.zi-cip');
      if (!b) return;
      var alan = b.dataset.alan, deger = b.dataset.deger;
      durum[alan] = durum[alan] === deger ? '' : deger;
      ciz();
    });
    $('#sirala').addEventListener('change', function () { durum.s = this.value; ciz(); });

    // Nav içindeki arama kutusunu mevcut sorguyla doldur
    if (durum.q) $$('input[name="q"]').forEach(function (i) { i.value = durum.q; });
    ciz();
  });
})(window);
