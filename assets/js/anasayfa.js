/*!
 * Zümrüt İletişim — Ana sayfa
 * Alt menü, lansman vitrini (5 sn'de bir kayar), öne çıkanlar, aksesuar akordeonu, biz kimiz + harita.
 */
(function (g) {
  'use strict';
  var ZI = g.ZI, d = document, $ = ZI.$, $$ = ZI.$$, k = ZI.kacis;
  var SURE = 5000;

  ZI.baslat(function (veri) {
    altnavKur(veri);
    vitrinKur(veri);
    oneCikanlarKur(veri);
    aksesuarKur(veri);
    hakkimizdaKur(veri);
    yapisalVeri(veri);
  });

  /* ------------------------------------------------------------------ */
  /* Alt menü (kategori ikonları + "Yeni" rozetleri)                     */
  /* ------------------------------------------------------------------ */
  function altnavKur(veri) {
    var aktif = ZI.aktifUrunler(veri);
    var ogeler = [
      { ad: 'iPhone', k: 'iphone', c: { cizim: 'telefon', gorunum: 'arka', kamera: 'ucgen', renk: '#e3e4e6' } },
      { ad: 'Samsung Galaxy', k: 'samsung', c: { cizim: 'telefon', gorunum: 'arka', kamera: 'dikey4', renk: '#5b4b8a' } },
      { ad: 'iPad', k: 'ipad', c: { cizim: 'tablet', renk: '#a9c4de', oran: 0.7 } },
      { ad: 'MacBook', k: 'macbook', c: { cizim: 'laptop', renk: '#bfd3e6' } },
      { ad: 'Xiaomi', k: 'xiaomi', c: { cizim: 'telefon', gorunum: 'arka', kamera: 'daire', renk: '#3f6b5a' } },
      { ad: 'Katlanabilir', k: 'katlanabilir', c: { cizim: 'katlanir', gorunum: 'acik', renk: '#2b2f3a' } },
      { ad: 'Aksesuarlar', k: 'aksesuar', c: { cizim: 'kulaklik' } },
      { ad: 'İkinci El', k: 'ikinci-el', c: { cizim: 'ikinciel', renk: '#c8b39a' } }
    ];
    var ray = $('#altnav');
    ray.innerHTML = ogeler.map(function (o, i) {
      var liste = aktif.filter(ZI.kategoriler[o.k].f);
      var yeni = liste.some(function (u) { return u.rozet === 'Yeni' || u.rozet === 'Yakında'; });
      return '<a class="zi-altnav__oge" href="urunler.html?k=' + o.k + '"><span class="zi-altnav__gorsel"><img src="' + ZI.cizim.url(o.c) + '" alt="" width="72" height="54"></span>' +
        '<span class="zi-altnav__ad">' + k(o.ad) + '</span>' + (yeni ? '<span class="zi-yeni">Yeni</span>' : '') + '</a>';
    }).join('');
  }

  /* ------------------------------------------------------------------ */
  /* Lansman vitrini                                                     */
  /* ------------------------------------------------------------------ */
  function urunBul(veri, id) { return veri.urunler.filter(function (u) { return u.id === id; })[0]; }
  function link(hedef, veri) {
    if (!hedef) return '#';
    if (hedef.indexOf('whatsapp:') === 0) return ZI.waLink(hedef.slice(9), veri.magaza);
    return hedef;
  }
  function dis(hedef) { return /^https?:/i.test(hedef) ? ' target="_blank" rel="noopener"' : ''; }

  function aktifMi(u) { return u && u.aktif !== false; }
  /* Slayttaki ürünler silinmiş / gizlenmişse sahneyi boş bırakmamak için benzer ürünlerle tamamla */
  function tamamla(liste, adet, veri, tercih) {
    var sonuc = liste.slice();
    var havuz = ZI.sirala(ZI.aktifUrunler(veri).filter(function (x) { return x.kategori === 'telefon' && sonuc.indexOf(x) < 0; }));
    if (tercih) havuz.sort(function (a, b) { return (tercih(b) ? 1 : 0) - (tercih(a) ? 1 : 0); });
    while (sonuc.length < adet && havuz.length) sonuc.push(havuz.shift());
    return sonuc;
  }
  function sahneHTML(s, veri) {
    var u = urunBul(veri, s.urunId);
    if (!aktifMi(u)) u = null;
    var urunler = (s.urunler || []).map(function (id) { return urunBul(veri, id); }).filter(aktifMi);
    if (s.sahne === 'lansman' && !u) u = urunler[0] || tamamla([], 1, veri, function (x) { return x.marka === 'Samsung'; })[0];
    if (s.sahne === 'lansman') urunler = tamamla(urunler.indexOf(u) < 0 && u ? [u].concat(urunler) : urunler, 3, veri, function (x) { return u && x.marka === u.marka; });
    if (s.sahne === 'yelpaze') urunler = tamamla(urunler.length ? urunler : (u ? [u] : []), 3, veri, function (x) { return x.durum === 'ikinci-el'; });
    if ((s.sahne === 'katlanir' || s.sahne === 'tek') && !u) u = urunler[0] || tamamla([], 1, veri, function (x) { return x.oneCikan; })[0];
    if (s.sahne === 'katlanir' && u) {
      var gl = ZI.gorseller(u);
      var fotolu = gl[0] && gl[0].foto;
      var acikGorsel = fotolu ? gl[0] : ZI.gorseller(Object.assign({}, u, { gorseller: [{ cizim: 'katlanir', gorunum: 'acik', oran: 1.42 }] }))[0];
      var kapali = fotolu ? (gl[1] || gl[0]) : ZI.gorseller(Object.assign({}, u, { gorseller: [{ cizim: 'katlanir', gorunum: 'kapali-arka', kamera: 'yatay2' }] }), ZI.renkSec(u, /yıldız|beyaz|gümüş|krem/i))[0];
      return '<div class="zi-sahne zi-sahne-katlanir" aria-hidden="true">' +
        '<div class="zi-sahne-katlanir__sol">' + (fotolu
          ? '<img src="' + k(acikGorsel.src) + '" alt="">'
          : '<div class="zi-kitap" data-kitap="' + k(acikGorsel.src) + '"><div class="zi-kitap__yaprak zi-kitap__yaprak--sol"></div><div class="zi-kitap__yaprak zi-kitap__yaprak--sag"></div></div>') + '</div>' +
        '<div class="zi-sahne-katlanir__sag"><img src="' + k(kapali.src) + '" alt=""></div></div>';
    }
    if (s.sahne === 'lansman') {
      var orta = u || urunler[0];
      if (!orta) return '';
      var yan = urunler.filter(function (x) { return x !== orta; });
      var koyu = /siyah|grafit|gece|uzay|black/i;
      var ortaG = ZI.gorseller(Object.assign({}, orta, { gorseller: orta.gorseller.filter(function (x) { return typeof x === 'string'; }).length ? orta.gorseller : [{ cizim: 'telefon', gorunum: 'on', on: 'delik', duvar: 'gece' }] }), ZI.renkSec(orta, koyu))[0];
      var yanG = yan.slice(0, 2).map(function (x) { return ZI.gorseller(x, ZI.renkSec(x, koyu))[0]; });
      return '<div class="zi-sahne" aria-hidden="true"><div class="zi-sahne-lansman__isik"></div><div class="zi-sahne-lansman__cihazlar">' +
        (yanG[0] ? '<img class="zi-sahne-lansman__sol" src="' + k(yanG[0].src) + '" alt="">' : '') +
        (yanG[1] ? '<img class="zi-sahne-lansman__sag" src="' + k(yanG[1].src) + '" alt="">' : '') +
        '<img class="zi-sahne-lansman__orta" src="' + k(ortaG.src) + '" alt="">' +
        '</div></div>';
    }
    if (s.sahne === 'yelpaze') {
      var uc = (urunler.length ? urunler : [u]).filter(Boolean).slice(0, 3);
      if (!uc.length) return '';
      var ilk = uc[0];
      var pil = uc.map(function (x) { return x.pilSagligi; }).filter(Boolean)[0];
      return '<div class="zi-sahne" aria-hidden="true"><div class="zi-sahne-yelpaze">' +
        uc.map(function (x) { return '<img src="' + k(ZI.gorseller(x)[0].src) + '" alt="">'; }).join('') +
        '<span class="zi-cip-yuzen zi-cip-yuzen--1">' + ZI.pilHTML(pil || 90) + ' %' + (pil || 90) + ' pil sağlığı</span>' +
        '<span class="zi-cip-yuzen zi-cip-yuzen--2"><span class="yesil">' + ZI.ikon('onay') + '</span> Orijinal parça bilgisi</span>' +
        '<span class="zi-cip-yuzen zi-cip-yuzen--3"><span class="mavi">' + ZI.ikon('takas') + '</span> Takasa uygun</span>' +
        '</div></div>';
    }
    if (u) {
      var tg = ZI.gorseller(u)[0];
      return '<div class="zi-sahne" aria-hidden="true"><div class="zi-sahne-tek"><img src="' + k(tg.src) + '" alt=""></div></div>';
    }
    return '';
  }

  function slaytHTML(s, i, n, veri) {
    var konum = s.sahne === 'lansman' ? ' ust' : (s.sahne === 'yelpaze' ? ' sol' : (s.sahne === 'tek' ? ' ust' : ''));
    var b1 = s.buton1 && s.buton1.metin ? '<a class="zi-btn zi-btn--dolu" href="' + k(link(s.buton1.link, veri)) + '"' + dis(link(s.buton1.link, veri)) + '>' + k(s.buton1.metin) + '</a>' : '';
    var b2 = s.buton2 && s.buton2.metin ? '<a class="zi-btn zi-btn--cizgi" href="' + k(link(s.buton2.link, veri)) + '"' + dis(link(s.buton2.link, veri)) + '>' + k(s.buton2.metin) + ' ' + ZI.ikon('sag') + '</a>' : '';
    return '<article class="zi-slayt ' + (s.tema === 'koyu' ? 'zi-slayt--koyu zi-koyu' : 'zi-slayt--acik') + '" data-i="' + i + '" role="group" aria-roledescription="slayt" aria-label="' + (i + 1) + ' / ' + n + ': ' + k(s.baslik) + '">' +
      sahneHTML(s, veri) +
      '<div class="zi-slayt__metin' + konum + '">' +
      (s.etiket ? '<p class="zi-slayt__etiket">' + k(s.etiket) + '</p>' : '') +
      '<h2 class="zi-slayt__baslik">' + k(s.baslik) + '</h2>' +
      (s.altBaslik ? '<p class="zi-slayt__alt">' + k(s.altBaslik) + '</p>' : '') +
      ((b1 || b2) ? '<div class="zi-btn-grup">' + b1 + b2 + '</div>' : '') +
      '</div></article>';
  }

  function vitrinKur(veri) {
    var kok = $('#vitrin');
    var slaytlar = (veri.vitrin || []).filter(function (s) { return s && s.aktif !== false; });
    if (!slaytlar.length) { kok.hidden = true; return; }
    var n = slaytlar.length;
    var html = slaytlar.map(function (s, i) { return slaytHTML(s, i, n, veri); });
    var onEk = n > 1 ? [html[(n - 2 + n) % n], html[n - 1]] : [];
    var sonEk = n > 1 ? [html[0], html[1 % n]] : [];
    var OFS = onEk.length;
    kok.innerHTML = '<div class="zi-vitrin__pencere"><div class="zi-vitrin__ray" aria-live="off">' +
      onEk.concat(html, sonEk).join('') + '</div></div>' +
      (n > 1 ? '<div class="zi-vitrin__kontrol">' +
        '<button class="zi-daire-btn" type="button" data-yon="-1" aria-label="Önceki slayt">' + ZI.ikon('sol') + '</button>' +
        '<div class="zi-noktalar" role="group" aria-label="Slayt seçimi">' + slaytlar.map(function (s, i) {
          return '<button class="zi-nokta" type="button" data-git="' + i + '" aria-label="' + (i + 1) + '. slayt: ' + k(s.baslik) + '" style="--sure:' + SURE + 'ms"><span class="zi-nokta__dolgu"></span></button>';
        }).join('') + '</div>' +
        '<button class="zi-daire-btn" type="button" data-yon="1" aria-label="Sonraki slayt">' + ZI.ikon('sag') + '</button>' +
        '<button class="zi-daire-btn" type="button" data-oynat aria-label="Otomatik geçişi durdur">' + ZI.ikon('duraklat') + '</button>' +
        '</div>' : '');

    var ray = $('.zi-vitrin__ray', kok), pencere = $('.zi-vitrin__pencere', kok);
    var tumu = $$('.zi-slayt', ray);
    tumu.forEach(function (el, j) { if (j < OFS || j >= OFS + n) el.dataset.klon = '1'; });
    // 3B kitap yaprakları
    $$('[data-kitap]', ray).forEach(function (kit) {
      var src = kit.getAttribute('data-kitap');
      $$('.zi-kitap__yaprak', kit).forEach(function (y) { y.style.backgroundImage = 'url("' + src + '")'; });
    });

    var i = 0, p = OFS, kilitli = false;
    var azHareket = g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var durdu = azHareket || n < 2;
    var sebepler = {};

    function olcu() {
      var s0 = tumu[0];
      var gen = s0.getBoundingClientRect().width;
      var bosluk = parseFloat(getComputedStyle(ray).columnGap || getComputedStyle(ray).gap) || 20;
      return { gen: gen, adim: gen + bosluk, pen: pencere.clientWidth };
    }
    function konumla(anim, ekKaydirma) {
      var o = olcu();
      var x = -(p * o.adim) + (o.pen - o.gen) / 2 + (ekKaydirma || 0);
      ray.classList.toggle('zi-kayiyor', !!anim);
      ray.style.transform = 'translate3d(' + x + 'px,0,0)';
    }
    function isaretle() {
      tumu.forEach(function (el, j) {
        var ayni = Number(el.dataset.i) === i;
        var odakta = ayni && !el.dataset.klon;
        el.classList.toggle('aktif', ayni);
        el.setAttribute('aria-hidden', odakta ? 'false' : 'true');
        $$('a, button', el).forEach(function (a) { if (odakta) a.removeAttribute('tabindex'); else a.setAttribute('tabindex', '-1'); });
      });
      $$('.zi-nokta', kok).forEach(function (nk, j) {
        var a = j === i;
        nk.classList.remove('aktif');
        if (a) { void nk.offsetWidth; nk.classList.add('aktif'); nk.setAttribute('aria-current', 'true'); } else nk.removeAttribute('aria-current');
      });
    }
    function git(yeniI, yon) {
      if (kilitli || n < 2) return;
      var hedefP;
      if (yon === 1) hedefP = p + 1;
      else if (yon === -1) hedefP = p - 1;
      else hedefP = OFS + yeniI;
      i = ((hedefP - OFS) % n + n) % n;
      p = hedefP;
      kilitli = true;
      isaretle();
      konumla(true);
      setTimeout(function () { kilitli = false; }, 950);
    }
    ray.addEventListener('transitionend', function (e) {
      if (e.target !== ray) return;
      if (p < OFS || p >= OFS + n) { p = OFS + i; konumla(false); }
      kilitli = false;
    });

    // Otomatik geçiş: aktif noktanın dolgu animasyonu bittiğinde bir sonraki slayta geç
    kok.addEventListener('animationend', function (e) {
      if (!e.target.classList.contains('zi-nokta__dolgu') || durdu) return;
      git(null, 1);
    });
    function oynatDurum(yeniDurdu) {
      durdu = yeniDurdu;
      kok.classList.toggle('durdu', durdu);
      var b = $('[data-oynat]', kok);
      if (b) {
        b.innerHTML = ZI.ikon(durdu ? 'oynat' : 'duraklat');
        b.setAttribute('aria-label', durdu ? 'Otomatik geçişi başlat' : 'Otomatik geçişi durdur');
      }
      ray.setAttribute('aria-live', durdu ? 'polite' : 'off');
      if (!durdu) isaretle();
    }
    function duraklat(sebep, evet) {
      sebepler[sebep] = !!evet;
      var herhangi = Object.keys(sebepler).some(function (x) { return sebepler[x]; });
      kok.classList.toggle('duraklatildi', herhangi);
    }

    kok.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b && b.dataset.yon) { git(null, Number(b.dataset.yon)); return; }
      if (b && b.dataset.git != null) { var hedef = Number(b.dataset.git); if (hedef !== i) git(hedef); return; }
      if (b && b.hasAttribute('data-oynat')) { oynatDurum(!durdu); return; }
      var sl = e.target.closest('.zi-slayt');
      if (sl && (sl.getAttribute('aria-hidden') === 'true')) {
        e.preventDefault();
        var j = tumu.indexOf(sl);
        if (j !== p) git(null, j > p ? 1 : -1);
      }
    });
    kok.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { git(null, 1); }
      else if (e.key === 'ArrowLeft') { git(null, -1); }
    });
    kok.addEventListener('focusin', function (e) { if (e.target.matches(':focus-visible')) duraklat('odak', true); });
    kok.addEventListener('focusout', function () { setTimeout(function () { if (!kok.contains(d.activeElement)) duraklat('odak', false); }, 0); });
    d.addEventListener('visibilitychange', function () { duraklat('gizli', d.hidden); });
    if ('IntersectionObserver' in g) {
      new IntersectionObserver(function (x) { duraklat('gorunmez', !x[0].isIntersecting); }, { threshold: 0.35 }).observe(kok);
    }

    // Kaydırma (dokunmatik / fare sürükleme)
    var basX = null, basY = null, fark = 0, suruklendi = false, id = null;
    pencere.addEventListener('pointerdown', function (e) {
      if (n < 2 || kilitli || (e.pointerType === 'mouse' && e.button !== 0)) return;
      basX = e.clientX; basY = e.clientY; fark = 0; suruklendi = false; id = e.pointerId;
    });
    pencere.addEventListener('pointermove', function (e) {
      if (basX == null || e.pointerId !== id) return;
      var dx = e.clientX - basX, dy = e.clientY - basY;
      if (!suruklendi && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) { suruklendi = true; try { pencere.setPointerCapture(id); } catch (x) { /* yok */ } duraklat('surukle', true); }
      if (suruklendi) { fark = dx; konumla(false, dx); }
    });
    function birak() {
      if (basX == null) return;
      var s = suruklendi, f = fark;
      basX = null;
      if (!s) return;
      duraklat('surukle', false);
      if (Math.abs(f) > 60) git(null, f < 0 ? 1 : -1);
      else konumla(true);
      setTimeout(function () { suruklendi = false; }, 0);
    }
    pencere.addEventListener('pointerup', birak);
    pencere.addEventListener('pointercancel', birak);
    pencere.addEventListener('click', function (e) { if (suruklendi) { e.preventDefault(); e.stopPropagation(); } }, true);
    pencere.addEventListener('dragstart', function (e) { e.preventDefault(); });

    var boyutZ;
    g.addEventListener('resize', function () { clearTimeout(boyutZ); boyutZ = setTimeout(function () { konumla(false); }, 60); });

    isaretle();
    konumla(false);
    oynatDurum(durdu);
    // Yazı tipi yüklenince ölçü değişebilir
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { konumla(false); });
  }

  /* ------------------------------------------------------------------ */
  /* Öne çıkan cihazlar                                                  */
  /* ------------------------------------------------------------------ */
  function oneCikanlarKur(veri) {
    var filtreler = [
      { ad: 'Tümü', k: 'cihaz' }, { ad: 'iPhone', k: 'iphone' }, { ad: 'Samsung', k: 'samsung' }, { ad: 'Xiaomi', k: 'xiaomi' },
      { ad: 'Katlanabilir', k: 'katlanabilir' }, { ad: 'Tablet & Laptop', k: 'tablet-laptop' }, { ad: 'İkinci El', k: 'ikinci-el' }
    ];
    var aktif = ZI.aktifUrunler(veri).filter(function (u) { return u.kategori !== 'aksesuar'; });
    var kutu = $('#one-cikan-filtre'), ray = $('#one-cikan-ray');
    kutu.innerHTML = filtreler.map(function (f, i) {
      return '<button class="zi-cip" type="button" data-k="' + f.k + '" aria-pressed="' + (i === 0) + '">' + k(f.ad) + '</button>';
    }).join('');
    function ciz(anahtar) {
      var liste = anahtar === 'cihaz' ? aktif : aktif.filter(ZI.kategoriler[anahtar].f);
      var one = liste.filter(function (u) { return u.oneCikan; });
      var goster = ZI.sirala(one.length >= 3 ? one : liste).slice(0, 12);
      ray.innerHTML = goster.length ? goster.map(function (u, j) { return ZI.kartHTML(u, { i: j }); }).join('')
        : '<div class="zi-bos" style="grid-column:1/-1;width:min(560px,80vw)"><h2>Şimdilik ürün yok</h2><p>Bu kategoriye yakında yeni cihazlar eklenecek.</p></div>';
      ray.scrollTo({ left: 0, behavior: 'auto' });
      $$('.zi-kart', ray).forEach(function (el, j) { el.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: j * 45, easing: 'cubic-bezier(.28,.11,.32,1)', fill: 'backwards' }); });
      oklariGuncelle();
    }
    kutu.addEventListener('click', function (e) {
      var b = e.target.closest('.zi-cip');
      if (!b) return;
      $$('.zi-cip', kutu).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      ciz(b.dataset.k);
    });
    function oklariGuncelle() {
      var sol = $('[data-raf-ok="-1"]'), sag = $('[data-raf-ok="1"]');
      sol.disabled = ray.scrollLeft < 8;
      sag.disabled = ray.scrollLeft + ray.clientWidth >= ray.scrollWidth - 8;
      sol.style.opacity = sol.disabled ? .4 : 1; sag.style.opacity = sag.disabled ? .4 : 1;
    }
    ray.addEventListener('scroll', function () { g.requestAnimationFrame(oklariGuncelle); }, { passive: true });
    $$('[data-raf-ok]').forEach(function (b) {
      b.addEventListener('click', function () {
        var kart = $('.zi-kart', ray);
        var adim = kart ? kart.getBoundingClientRect().width + 20 : 300;
        ray.scrollBy({ left: Number(b.dataset.rafOk) * adim * Math.max(1, Math.floor(ray.clientWidth / adim) - 1), behavior: 'smooth' });
      });
    });
    ciz('cihaz');
  }

  /* ------------------------------------------------------------------ */
  /* Aksesuar akordeonu                                                  */
  /* ------------------------------------------------------------------ */
  function aksesuarKur(veri) {
    var kartlar = [
      { k: 'kilif', no: '01', ad: 'Kılıflar', metin: 'Şeffaf, silikon, cüzdan ve darbe emici modeller.', c: { cizim: 'kilif', renk: '#8fb3d9' } },
      { k: 'sarj', no: '02', ad: 'Şarj Aletleri & Adaptörler', metin: 'Hızlı şarj adaptörleri, kablolar, kablosuz şarj ve powerbank.', c: { cizim: 'adaptor' } },
      { k: 'cam', no: '03', ad: 'Kırılmaz Camlar', metin: 'Temperli, hayalet ve mat ekran koruyucular; lens koruma.', c: { cizim: 'cam' } },
      { k: 'kulaklik', no: '04', ad: 'Kulaklık & Aksesuarlar', metin: 'Kablosuz kulaklıklar ve araç tutucu gibi günlük yardımcılar.', c: { cizim: 'kulaklik' } }
    ];
    var aktif = ZI.aktifUrunler(veri);
    var izgara = $('#aksesuar-kartlar'), panel = $('#aksesuar-panel'), ic = $('#aksesuar-panel-ic');
    izgara.innerHTML = kartlar.map(function (x, i) {
      var say = aktif.filter(ZI.kategoriler[x.k].f).length;
      return '<button class="zi-bento zi-belir" type="button" style="--i:' + i + '" data-k="' + x.k + '" aria-expanded="false" aria-controls="aksesuar-panel-ic">' +
        '<span class="zi-bento__etiket">' + x.no + '</span>' +
        '<span class="zi-bento__baslik">' + k(x.ad) + '</span>' +
        '<span class="zi-bento__metin">' + k(x.metin) + '</span>' +
        '<span class="zi-bento__gorsel"><img src="' + ZI.cizim.url(x.c) + '" alt=""></span>' +
        '<span class="zi-bento__sayi">' + say + ' ürün</span>' +
        '<span class="zi-bento__arti" aria-hidden="true">' + ZI.ikon('arti') + '</span></button>';
    }).join('');

    var acikK = null;
    function okKonumla() {
      var b = acikK && $('.zi-bento[data-k="' + acikK + '"]', izgara);
      var ok = $('.zi-akordeon__ok', ic);
      if (!b || !ok) return;
      var r = b.getBoundingClientRect(), pr = ic.getBoundingClientRect();
      ok.style.left = (r.left + r.width / 2 - pr.left - 10) + 'px';
    }
    function ac(anahtar) {
      var x = kartlar.filter(function (y) { return y.k === anahtar; })[0];
      var liste = ZI.sirala(aktif.filter(ZI.kategoriler[anahtar].f)).slice(0, 4);
      ic.innerHTML = '<span class="zi-akordeon__ok" aria-hidden="true"></span>' +
        '<div class="zi-akordeon__ust"><h3>' + k(x.ad) + '</h3><a class="zi-link-ok" href="urunler.html?k=' + anahtar + '">Tümünü görün ' + ZI.ikon('sag') + '</a></div>' +
        (liste.length ? '<div class="zi-akordeon__izgara">' + liste.map(function (u, j) { return ZI.kartHTML(u, { beyaz: true, i: j, aciklama: false }); }).join('') + '</div>'
          : '<p class="zi-alt-baslik">Bu kategoride şu an ürün bulunmuyor. Mağazamıza sorabilirsiniz.</p>');
      $$('.zi-bento', izgara).forEach(function (b) { b.setAttribute('aria-expanded', b.dataset.k === anahtar ? 'true' : 'false'); });
      acikK = anahtar;
      // yeniden tetikle: kartlar kademeli belirsin
      panel.classList.remove('acik'); void panel.offsetWidth; panel.classList.add('acik');
      okKonumla();
      setTimeout(function () {
        var r = panel.getBoundingClientRect();
        if (r.bottom > g.innerHeight) g.scrollBy({ top: Math.min(r.bottom - g.innerHeight + 24, r.top - 80), behavior: 'smooth' });
      }, 380);
    }
    function kapat() {
      panel.classList.remove('acik');
      $$('.zi-bento', izgara).forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      acikK = null;
    }
    izgara.addEventListener('click', function (e) {
      var b = e.target.closest('.zi-bento');
      if (!b) return;
      if (acikK === b.dataset.k) kapat(); else ac(b.dataset.k);
    });
    g.addEventListener('resize', okKonumla);
  }

  /* ------------------------------------------------------------------ */
  /* Biz kimiz + harita                                                   */
  /* ------------------------------------------------------------------ */
  function hakkimizdaKur(veri) {
    var m = veri.magaza;
    $$('[data-magaza]').forEach(function (el) { var a = el.dataset.magaza; if (m[a]) el.textContent = m[a]; });
    if (m.gorsel) $('#magaza-gorsel').src = m.gorsel;

    var liste = [
      '<a href="' + ZI.telLink(m) + '"><span class="zi-ikon-daire">' + ZI.ikon('telefon') + '</span><span><small>Telefon</small>' + k(m.telefon) + '</span></a>',
      '<a href="' + k(ZI.waLink('Merhaba, bilgi almak istiyorum.', m)) + '" target="_blank" rel="noopener"><span class="zi-ikon-daire">' + ZI.ikon('mesaj') + '</span><span><small>WhatsApp</small>Mesaj gönderin</span></a>'
    ];
    if (m.eposta) liste.push('<a href="mailto:' + k(m.eposta) + '"><span class="zi-ikon-daire">' + ZI.ikon('eposta') + '</span><span><small>E-posta</small>' + k(m.eposta) + '</span></a>');
    liste.push('<a href="' + k(ZI.yolTarifi(m)) + '" target="_blank" rel="noopener"><span class="zi-ikon-daire">' + ZI.ikon('konum') + '</span><span><small>Adres</small>' + k(m.adres) + '</span></a>');
    $('#iletisim-liste').innerHTML = liste.join('');

    var n = ZI.istanbulSimdi();
    $('#saat-satirlari').innerHTML = ZI.saatOzeti(m).map(function (s) {
      return '<div class="zi-saat-satir' + (s.gunler.indexOf(n.gun) > -1 ? ' bugun' : '') + '"><span>' + k(s.etiket) + '</span><span>' + k(s.deger) + '</span></div>';
    }).join('');
    function durumYaz() {
      var ds = ZI.magazaDurumu(m), el = $('#acik-durum');
      el.hidden = false;
      el.className = 'zi-acik-durum' + (ds.acik ? '' : ' kapali');
      el.textContent = ds.metin + (ds.detay ? ' · ' + ds.detay : '');
    }
    durumYaz(); setInterval(durumYaz, 60000);

    $('#yol-tarifi').href = ZI.yolTarifi(m);
    $('#wa-buton').href = ZI.waLink('Merhaba, bilgi almak istiyorum.', m);
    var hl = $('#harita-link');
    hl.href = m.konum && m.konum.yerKimligi
      ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(m.ad) + '&query_place_id=' + encodeURIComponent(m.konum.yerKimligi)
      : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(m.adres);

    var hy = $('#harita-yer');
    if (hy && m.adres) {
      var parca = m.adres.split(',').map(function (x) { return x.trim(); });
      $('b', hy).textContent = parca.length > 2 ? parca.slice(1, -1).join(', ') : parca[0];
      $('span', hy).textContent = parca.length > 1 ? parca[parca.length - 1] : '';
    }
    // Haritayı görünür olunca yükle
    var kutu = $('#harita-kutu');
    function yukle() {
      if (kutu.dataset.yuklendi) return;
      kutu.dataset.yuklendi = '1';
      var f = d.createElement('iframe');
      f.src = ZI.haritaGomme(m);
      f.title = m.ad + ' konumu (Google Haritalar)';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.setAttribute('allowfullscreen', '');
      f.addEventListener('load', function () { var y = $('#harita-yer'); if (y) y.remove(); });
      kutu.insertBefore(f, kutu.firstChild);
    }
    if ('IntersectionObserver' in g) {
      var io = new IntersectionObserver(function (x) { if (x[0].isIntersecting) { yukle(); io.disconnect(); } }, { rootMargin: '400px' });
      io.observe(kutu);
    } else yukle();
  }

  /* ------------------------------------------------------------------ */
  /* Yapısal veri (Google yerel işletme)                                  */
  /* ------------------------------------------------------------------ */
  function yapisalVeri(veri) {
    var m = veri.magaza;
    var gunEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    var saat = (m.saatler || []).map(function (s, i) { return s.kapali ? null : { '@type': 'OpeningHoursSpecification', dayOfWeek: gunEn[i], opens: s.acilis, closes: s.kapanis }; }).filter(Boolean);
    var ld = {
      '@context': 'https://schema.org', '@type': 'MobilePhoneStore', name: m.ad, telephone: '+' + ZI.telLink(m).replace(/\D/g, ''),
      address: { '@type': 'PostalAddress', streetAddress: 'Hoca Ahmet Yesevi, Kadir Has Cd. No:131/A', addressLocality: 'Kocasinan', addressRegion: 'Kayseri', postalCode: '38090', addressCountry: 'TR' },
      openingHoursSpecification: saat, url: location.href.split('#')[0].split('?')[0]
    };
    if (m.konum && m.konum.enlem) ld.geo = { '@type': 'GeoCoordinates', latitude: m.konum.enlem, longitude: m.konum.boylam };
    if (m.eposta) ld.email = m.eposta;
    if (m.adres && m.adres.indexOf('Kadir Has') === -1) ld.address = { '@type': 'PostalAddress', streetAddress: m.adres, addressCountry: 'TR' };
    var s = d.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(ld);
    d.head.appendChild(s);
  }
})(window);
