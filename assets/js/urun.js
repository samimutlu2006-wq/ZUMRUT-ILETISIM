/*!
 * Zümrüt İletişim — Ürün detay sayfası
 */
(function (g) {
  'use strict';
  var ZI = g.ZI, d = document, $ = ZI.$, $$ = ZI.$$, k = ZI.kacis;

  var OZELLIKLER = [
    ['islemci', 'İşlemci', 'islemci'], ['cip', 'Çip', 'islemci'], ['ram', 'RAM', 'ram'], ['depolama', 'Depolama', 'depolama'],
    ['ekran', 'Ekran', 'ekran'], ['kamera', 'Arka Kamera', 'kamera'], ['onKamera', 'Ön Kamera', 'onkamera'],
    ['batarya', 'Batarya ve Şarj', 'pil'], ['kapasite', 'Kapasite', 'pil'], ['cikis', 'Çıkış Gücü', 'pil'],
    ['isletimSistemi', 'İşletim Sistemi', 'ayar'], ['uyumluluk', 'Uyumluluk', 'onay'], ['malzeme', 'Malzeme', 'etiket'],
    ['sertlik', 'Sertlik', 'kalkan'], ['yuzey', 'Yüzey', 'etiket'], ['uzunluk', 'Uzunluk', 'etiket'], ['baglanti', 'Bağlantı', 'ayar'],
    ['ozellik', 'Öne Çıkanlar', 'yildiz'], ['diger', 'Diğer', 'bilgi']
  ];
  ZI.OZELLIK_ADLARI = OZELLIKLER;

  ZI.baslat(function (veri) {
    var id = ZI.parametre('id');
    var u = veri.urunler.filter(function (x) { return x.id === id; })[0];
    if (!u || (!u.aktif && !ZI.onizlemede)) return bulunamadi();
    ciz(u, veri);
  });

  function bulunamadi() {
    $('#urun').innerHTML = '<div class="zi-bulunamadi"><h1>Ürün bulunamadı</h1><p>Aradığınız ürün satıştan kaldırılmış ya da bağlantı hatalı olabilir.</p>' +
      '<div class="zi-btn-grup zi-btn-grup--orta"><a class="zi-btn zi-btn--dolu" href="index.html">' + ZI.ikon('geri') + ' Ana Sayfaya Dön</a><a class="zi-btn zi-btn--cizgi" href="urunler.html?k=tumu">Tüm ürünler</a></div></div>';
    d.title = 'Ürün bulunamadı · Zümrüt İletişim';
  }

  function kategoriBilgisi(u) {
    if (u.durum === 'ikinci-el') return { ad: 'İkinci El', k: 'ikinci-el' };
    if (u.kategori === 'aksesuar') return { ad: ({ kilif: 'Kılıflar', sarj: 'Şarj Aletleri', cam: 'Kırılmaz Camlar', kulaklik: 'Kulaklık & Aksesuarlar' })[u.altKategori] || 'Aksesuarlar', k: u.altKategori || 'aksesuar' };
    if (u.kategori === 'tablet') return u.marka === 'Apple' ? { ad: 'iPad', k: 'ipad' } : { ad: 'Tabletler', k: 'tablet' };
    if (u.kategori === 'laptop') return u.marka === 'Apple' ? { ad: 'MacBook', k: 'macbook' } : { ad: 'Laptoplar', k: 'laptop' };
    if (u.marka === 'Apple') return { ad: 'iPhone', k: 'iphone' };
    if (u.marka === 'Samsung') return { ad: 'Samsung Galaxy', k: 'samsung' };
    if (u.marka === 'Xiaomi') return { ad: 'Xiaomi & Redmi', k: 'xiaomi' };
    return { ad: 'Telefonlar', k: 'android' };
  }

  function ciz(u, veri) {
    var m = veri.magaza;
    var kat = kategoriBilgisi(u);
    var secili = { renk: u.renkler[0] || null, secenek: null, gorsel: 0 };
    var fiyatliIlk = u.secenekler.filter(function (s) { return s.fiyat != null && s.fiyat !== ''; })[0];
    secili.secenek = fiyatliIlk || u.secenekler[0] || null;

    d.title = u.ad + (u.durum === 'ikinci-el' ? ' (2. El)' : '') + ' · Zümrüt İletişim';
    var md = d.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', (u.kisaAciklama || u.aciklama || u.ad) + ' · ' + ZI.durumEtiketi(u) + ' · Zümrüt İletişim, Kayseri');

    // Yerel menü
    var yerel = $('#yerel');
    yerel.hidden = false;
    yerel.innerHTML = '<div class="zi-yerel__ic"><span class="zi-yerel__ad">' + k(u.ad) + '</span><div class="zi-yerel__sag">' +
      '<a href="#fiyat">Fiyat</a><a href="#teknik">Teknik Özellikler</a>' +
      '<a class="zi-btn zi-btn--dolu zi-btn--kucuk" data-wa href="#" target="_blank" rel="noopener">WhatsApp’tan Sorun</a></div></div>';

    var ozet = ozetKartlari(u);
    var secimBaslik = u.kategori === 'laptop' ? 'Yapılandırma' : 'Depolama';
    var ozellikHTML = teknikSatirlari(u);

    $('#urun').innerHTML =
      '<div class="zi-urun__ust">' +
      '<a class="zi-geri" href="index.html">' + ZI.ikon('geri') + ' Ana Sayfaya Dön</a>' +
      '<nav class="zi-kirinti" aria-label="Sayfa yolu"><a href="index.html">Ana Sayfa</a>' + ZI.ikon('sag') + '<a href="urunler.html?k=' + kat.k + '">' + k(kat.ad) + '</a>' + ZI.ikon('sag') + '<span aria-current="page">' + k(u.ad) + '</span></nav>' +
      '</div>' +
      '<div class="zi-urun__izgara">' +
      /* Galeri */
      '<section class="zi-galeri" aria-label="Ürün görselleri">' +
      '<div class="zi-galeri__sahne" id="sahne" tabindex="0" aria-roledescription="galeri">' +
      (ZI.markaGoster(u.marka) ? '<span class="zi-galeri__marka" style="--marka-renk:' + (ZI.MARKA_RENK[u.marka] || '#1d1d1f') + '"><i></i>' + k(u.marka) + '</span>' : '') +
      '<span class="zi-galeri__durum">' + ZI.durumRozeti(u, true) + '</span>' +
      '<button class="zi-daire-btn zi-galeri__ok zi-galeri__ok--sol" type="button" data-g="-1" aria-label="Önceki görsel">' + ZI.ikon('sol') + '</button>' +
      '<button class="zi-daire-btn zi-galeri__ok zi-galeri__ok--sag" type="button" data-g="1" aria-label="Sonraki görsel">' + ZI.ikon('sag') + '</button>' +
      '</div>' +
      '<div class="zi-galeri__kucukler" id="kucukler" role="tablist" aria-label="Görsel seçimi"></div>' +
      '<div class="zi-galeri__noktalar" id="gnoktalar" aria-hidden="true"></div>' +
      '</section>' +
      /* Bilgi */
      '<section class="zi-bilgi" aria-label="Ürün bilgileri">' +
      '<div class="zi-bilgi__rozetler">' + (u.rozet ? '<span class="zi-rozet ' + (u.rozet === 'Yakında' ? 'zi-rozet--yakinda' : (u.rozet === 'Fırsat' ? 'zi-rozet--firsat' : 'zi-rozet--yeni')) + '">' + k(u.rozet) + '</span>' : '') +
      ZI.durumRozeti(u, true) + (stokRozeti(u)) + '</div>' +
      '<h1>' + k(u.ad) + '</h1>' +
      '<p class="zi-bilgi__marka">' + [ZI.markaGoster(u.marka) ? u.marka : '', u.seri && u.seri !== u.marka ? u.seri : '', u.kod ? 'Ürün kodu ' + u.kod : ''].filter(Boolean).map(k).join(' · ') + '</p>' +
      (u.kisaAciklama ? '<p class="zi-alt-baslik" style="margin-top:14px;font-size:19px">' + k(u.kisaAciklama) + '</p>' : '') +
      '<div class="zi-bilgi__fiyat" id="fiyat"><div class="zi-bilgi__fiyat-deger" id="fiyat-deger"></div><p class="zi-bilgi__fiyat-not">' + k(m.fiyatNotu) + '</p></div>' +
      (u.secenekler.length ? '<div class="zi-secim"><div class="zi-secim__baslik">' + secimBaslik + '<span id="secenek-ad"></span></div><div class="zi-secenekler" role="group" aria-label="' + secimBaslik + ' seçimi">' +
        u.secenekler.map(function (s, i) {
          var sf = s.fiyat != null && s.fiyat !== '' ? s.fiyat : u.fiyat;
          return '<button class="zi-secenek" type="button" data-s="' + i + '" aria-pressed="false"><b>' + k(s.ad) + '</b><span>' + (sf != null && sf !== '' ? ZI.fiyatYaz(sf) : 'Fiyat için arayın') + '</span></button>';
        }).join('') + '</div></div>' : '') +
      (u.renkler.length ? '<div class="zi-secim"><div class="zi-secim__baslik">Renk<span id="renk-ad"></span></div><div class="zi-renk-secici" role="group" aria-label="Renk seçimi">' +
        u.renkler.map(function (r, i) {
          return '<button class="zi-renk" type="button" data-r="' + i + '" style="background:' + k(r.kod || '#ccc') + '" aria-label="' + k(r.ad) + '" title="' + k(r.ad) + '" aria-pressed="false"></button>';
        }).join('') + '</div></div>' : '') +
      (ozet ? '<div class="zi-ozet">' + ozet + '</div>' : '') +
      '<div class="zi-btn-grup">' +
      '<a class="zi-btn zi-btn--dolu zi-btn--buyuk" href="' + ZI.telLink(m) + '">' + ZI.ikon('telefon') + ' Hemen Ara</a>' +
      '<a class="zi-btn zi-btn--cizgi zi-btn--buyuk" data-wa href="#" target="_blank" rel="noopener">' + ZI.ikon('mesaj') + ' WhatsApp ile İletişime Geç</a>' +
      '</div>' +
      '<div class="zi-magaza-not">' + ZI.ikon('magaza') + '<div><b>Mağazada inceleyin.</b> ' + k(m.adres) + '<br><span id="magaza-durum"></span> · <a href="' + k(ZI.yolTarifi(m)) + '" target="_blank" rel="noopener">Yol tarifi al</a></div></div>' +
      '<button class="zi-paylas" type="button" id="paylas">' + ZI.ikon('paylas') + ' Bu ürünü paylaşın</button>' +
      '</section>' +
      '</div>' +
      (u.aciklama ? '<p class="zi-aciklama zi-belir"><b>' + k(u.ad) + '.</b> ' + k(u.aciklama.replace(new RegExp('^' + u.ad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[;:,]?\\s*'), '')) + '</p>' : '') +
      (ozellikHTML ? '<section class="zi-teknik" id="teknik" aria-labelledby="teknik-baslik"><h2 id="teknik-baslik" class="zi-belir">Teknik Özellikler</h2><dl>' + ozellikHTML + '</dl></section>' : '');

    // Durum satırı
    var ds = ZI.magazaDurumu(m);
    $('#magaza-durum').textContent = ds.metin + (ds.detay ? ' (' + ds.detay + ')' : '');

    galeriKur(u, secili);
    secimKur(u, secili, m);
    benzerler(u, veri);
    paylasKur(u);

    if (location.hash === '#fiyat') {
      setTimeout(function () {
        var f = $('#fiyat');
        f.scrollIntoView({ behavior: 'smooth', block: 'center' });
        f.animate([{ background: 'rgba(0,113,227,.12)' }, { background: 'transparent' }], { duration: 1600, easing: 'ease-out' });
      }, 350);
    }
  }

  function stokRozeti(u) {
    var s = ZI.stokBilgisi(u);
    return '<span class="zi-rozet ' + (s.sinif === 'yok' ? 'zi-rozet--tukendi' : 'zi-rozet--notr') + '">' + k(s.metin) + '</span>';
  }

  function ozetKartlari(u) {
    var kartlar = [];
    var cihaz = u.kategori !== 'aksesuar';
    kartlar.push('<div class="zi-ozet__kart">' + ZI.ikon(u.durum === 'ikinci-el' ? 'etiket' : 'kutu') + '<div><small>Ürün durumu</small><b>' + k(ZI.durumEtiketi(u)) + '</b></div></div>');
    if (u.pilSagligi != null && u.pilSagligi !== '' && cihaz) {
      var p = Number(u.pilSagligi), sinif = p >= 85 ? '' : (p >= 80 ? ' orta' : ' dusuk');
      kartlar.push('<div class="zi-ozet__kart' + (p >= 85 ? ' iyi' : ' uyari') + '">' + ZI.ikon('pil') + '<div style="flex:1"><small>Pil sağlığı</small><b>%' + p + (u.durum === 'sifir' ? ' · Yeni cihaz' : '') + '</b>' +
        (u.pilDongu != null && u.pilDongu !== '' ? '<small style="margin-top:2px">' + k(u.pilDongu) + ' şarj döngüsü</small>' : '') +
        '<div class="zi-pil-cubuk' + sinif + '"><i style="width:0" data-pil="' + p + '"></i></div></div></div>');
    }
    if (u.cikisYili || u.cikisTarihi) kartlar.push('<div class="zi-ozet__kart">' + ZI.ikon('takvim') + '<div><small>Çıkış yılı</small><b>' + k(u.cikisYili || '') + '</b>' + (u.cikisTarihi ? '<small style="margin-top:2px">' + k(u.cikisTarihi) + '</small>' : '') + '</div></div>');
    if (u.uretimYili) kartlar.push('<div class="zi-ozet__kart">' + ZI.ikon('takvim') + '<div><small>Üretim yılı</small><b>' + k(u.uretimYili) + '</b></div></div>');
    if (u.garanti) kartlar.push('<div class="zi-ozet__kart' + (/garantisiz|yok/i.test(u.garanti) ? '' : ' iyi') + '">' + ZI.ikon('kalkan') + '<div><small>Garanti</small><b>' + k(u.garanti) + '</b></div></div>');
    if (u.degisenParca && cihaz) {
      var temiz = /yok|orijinal/i.test(u.degisenParca) && !/değişti|degisti/i.test(u.degisenParca);
      kartlar.push('<div class="zi-ozet__kart zi-ozet__kart--genis ' + (temiz ? 'iyi' : 'uyari') + '">' + ZI.ikon(temiz ? 'onay' : 'parca') + '<div><small>Değişen parça</small><b>' + k(u.degisenParca) + '</b></div></div>');
    }
    return kartlar.length > 1 ? kartlar.join('') : '';
  }

  function teknikSatirlari(u) {
    var o = u.ozellikler || {}, satir = [];
    OZELLIKLER.forEach(function (x) {
      if (o[x[0]]) satir.push('<div class="zi-teknik__satir zi-belir"><dt>' + ZI.ikon(x[2]) + k(x[1]) + '</dt><dd>' + k(o[x[0]]) + '</dd></div>');
    });
    Object.keys(o).forEach(function (a) {
      if (o[a] && !OZELLIKLER.some(function (x) { return x[0] === a; })) satir.push('<div class="zi-teknik__satir zi-belir"><dt>' + ZI.ikon('bilgi') + k(a.charAt(0).toLocaleUpperCase('tr') + a.slice(1)) + '</dt><dd>' + k(o[a]) + '</dd></div>');
    });
    if (u.renkler.length) satir.push('<div class="zi-teknik__satir zi-belir"><dt>' + ZI.ikon('renk') + 'Renk Seçenekleri</dt><dd>' + u.renkler.map(function (r) { return k(r.ad); }).join(', ') + '</dd></div>');
    if (u.kategori !== 'aksesuar') {
      satir.push('<div class="zi-teknik__satir zi-belir"><dt>' + ZI.ikon('etiket') + 'Durum</dt><dd>' + k(ZI.durumEtiketi(u)) + '</dd></div>');
    }
    return satir.join('');
  }

  function galeriKur(u, secili) {
    var sahne = $('#sahne'), kucukler = $('#kucukler'), noktalar = $('#gnoktalar');
    function listele() { return ZI.gorseller(u, secili.renk); }
    function yenile(ilk) {
      var liste = listele();
      if (secili.gorsel >= liste.length) secili.gorsel = 0;
      $$('img', sahne).forEach(function (im) { im.remove(); });
      liste.forEach(function (gr, i) {
        var im = d.createElement('img');
        im.src = gr.src; im.alt = u.ad + ' görseli ' + (i + 1);
        im.decoding = 'async';
        im.dataset.i = i;
        if (gr.foto) im.className = 'foto';
        if (i === secili.gorsel) im.classList.add('aktif');
        sahne.appendChild(im);
      });
      kucukler.innerHTML = liste.length > 1 ? liste.map(function (gr, i) {
        return '<button class="zi-galeri__kucuk" type="button" role="tab" data-i="' + i + '" aria-label="Görsel ' + (i + 1) + '" aria-current="' + (i === secili.gorsel) + '"><img src="' + k(gr.src) + '" alt=""' + (gr.foto ? ' class="foto"' : '') + '></button>';
      }).join('') : '';
      noktalar.innerHTML = liste.length > 1 ? liste.map(function (x, i) { return '<span class="' + (i === secili.gorsel ? 'aktif' : '') + '"></span>'; }).join('') : '';
      $$('.zi-galeri__ok', sahne).forEach(function (b) { b.hidden = liste.length < 2; });
      sahne.classList.toggle('foto-modu', !!(liste[0] && liste[0].foto));
      if (!ilk) $$('img.aktif', sahne).forEach(function (im) { im.animate([{ opacity: 0.2, transform: 'scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.28,.11,.32,1)' }); });
    }
    function goster(i) {
      var imgs = $$('img', sahne).sort(function (a, b) { return a.dataset.i - b.dataset.i; });
      if (!imgs.length) return;
      secili.gorsel = (i + imgs.length) % imgs.length;
      imgs.forEach(function (im, j) { im.classList.toggle('aktif', j === secili.gorsel); });
      $$('.zi-galeri__kucuk', kucukler).forEach(function (b, j) { b.setAttribute('aria-current', j === secili.gorsel ? 'true' : 'false'); });
      $$('span', noktalar).forEach(function (s, j) { s.classList.toggle('aktif', j === secili.gorsel); });
    }
    sahne.addEventListener('click', function (e) { var b = e.target.closest('[data-g]'); if (b) goster(secili.gorsel + Number(b.dataset.g)); });
    kucukler.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) goster(Number(b.dataset.i)); });
    sahne.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') goster(secili.gorsel + 1);
      if (e.key === 'ArrowLeft') goster(secili.gorsel - 1);
    });
    var bx = null;
    sahne.addEventListener('pointerdown', function (e) { bx = e.clientX; });
    sahne.addEventListener('pointerup', function (e) {
      if (bx == null) return;
      var f = e.clientX - bx; bx = null;
      if (Math.abs(f) > 50) goster(secili.gorsel + (f < 0 ? 1 : -1));
    });
    yenile(true);
    ZI._galeriYenile = function () { yenile(false); };
  }

  function secimKur(u, secili, m) {
    function waMetni() {
      var parca = [secili.secenek && secili.secenek.ad, secili.renk && secili.renk.ad, ZI.durumEtiketi(u)].filter(Boolean).join(', ');
      return 'Merhaba, sitenizde gördüğüm ' + u.ad + ' (' + parca + ') hakkında bilgi almak istiyorum.' + (u.kod ? ' Ürün kodu: ' + u.kod + '.' : '') + '\n' + location.href.split('#')[0];
    }
    function fiyatGuncelle(anim) {
      var el = $('#fiyat-deger');
      var f = secili.secenek && secili.secenek.fiyat != null && secili.secenek.fiyat !== '' ? Number(secili.secenek.fiyat) : (u.fiyat != null && u.fiyat !== '' ? Number(u.fiyat) : null);
      if (!secili.secenek && u.secenekler.length === 0 && f == null) f = ZI.baslangicFiyati(u);
      if (f == null) { el.textContent = 'Fiyat için mağazamızı arayın'; el.style.fontSize = '24px'; }
      else {
        el.style.fontSize = '';
        var bas = anim ? (Number(el.dataset.deger) || f) : f;
        el.dataset.deger = f;
        if (!anim || bas === f || !g.requestAnimationFrame) el.textContent = ZI.fiyatYaz(f);
        else {
          var t0 = null, sure = 450;
          (function adim(t) {
            if (!t0) t0 = t;
            var r = Math.min(1, (t - t0) / sure), e = 1 - Math.pow(1 - r, 3);
            el.textContent = ZI.fiyatYaz(bas + (f - bas) * e);
            if (r < 1) g.requestAnimationFrame(adim);
          })(performance.now());
        }
      }
      $$('[data-wa]').forEach(function (a) { a.href = ZI.waLink(waMetni(), m); });
      var sa = $('#secenek-ad'); if (sa) sa.textContent = secili.secenek ? secili.secenek.ad : '';
      var ra = $('#renk-ad'); if (ra) ra.textContent = secili.renk ? secili.renk.ad : '';
      $$('.zi-secenek').forEach(function (b) { b.setAttribute('aria-pressed', u.secenekler[Number(b.dataset.s)] === secili.secenek ? 'true' : 'false'); });
      $$('.zi-renk').forEach(function (b) { b.setAttribute('aria-pressed', u.renkler[Number(b.dataset.r)] === secili.renk ? 'true' : 'false'); });
    }
    d.addEventListener('click', function (e) {
      var s = e.target.closest('.zi-secenek');
      if (s) { secili.secenek = u.secenekler[Number(s.dataset.s)]; fiyatGuncelle(true); return; }
      var r = e.target.closest('.zi-renk');
      if (r) {
        var yeni = u.renkler[Number(r.dataset.r)];
        if (yeni !== secili.renk) { secili.renk = yeni; secili.gorsel = 0; fiyatGuncelle(false); if (ZI._galeriYenile) ZI._galeriYenile(); }
      }
    });
    fiyatGuncelle(false);
    // Pil çubuğu animasyonu
    setTimeout(function () { $$('[data-pil]').forEach(function (i) { i.style.width = Math.max(4, Math.min(100, Number(i.dataset.pil))) + '%'; }); }, 250);
  }

  function benzerler(u, veri) {
    var aktif = ZI.aktifUrunler(veri).filter(function (x) { return x.id !== u.id; });
    var ayni = aktif.filter(function (x) {
      if (u.kategori === 'aksesuar') return x.kategori === 'aksesuar' && x.altKategori === u.altKategori;
      return x.kategori === u.kategori;
    });
    function puan(x) {
      return (x.marka === u.marka ? 4 : 0) + (x.seri && x.seri === u.seri ? 2 : 0) + (x.durum === u.durum ? 1 : 0) + (!!x.katlanabilir === !!u.katlanabilir ? 1 : 0);
    }
    var sirali = ZI.sirala(ayni);
    var liste = sirali.map(function (x, i) { return { x: x, p: puan(x), i: i }; })
      .sort(function (a, b) { return b.p - a.p || a.i - b.i; }).map(function (o) { return o.x; }).slice(0, 10);
    if (liste.length < 3) liste = liste.concat(ZI.sirala(aktif.filter(function (x) { return liste.indexOf(x) < 0 && x.kategori === u.kategori; })).slice(0, 6 - liste.length));
    if (!liste.length) return;
    var bol = d.createElement('section');
    bol.className = 'zi-bolum';
    bol.setAttribute('aria-labelledby', 'benzer-baslik');
    bol.innerHTML = '<div class="zi-kap"><div class="zi-bolum__ust"><h2 class="zi-baslik zi-belir" id="benzer-baslik">Bunlara da göz atın. <span class="gri">Benzer cihazlar.</span></h2>' +
      '<a class="zi-link-ok" href="urunler.html?k=' + kategoriBilgisi(u).k + '">Tümünü görün ' + ZI.ikon('sag') + '</a></div></div>' +
      '<div class="zi-raf"><div class="zi-raf__ray">' + liste.map(function (x, i) { return ZI.kartHTML(x, { i: i }); }).join('') + '</div></div>';
    $('#icerik').appendChild(bol);
  }

  function paylasKur(u) {
    var b = $('#paylas');
    b.addEventListener('click', function () {
      var veri = { title: u.ad + ' · Zümrüt İletişim', text: u.ad + ' — ' + ZI.durumEtiketi(u), url: location.href.split('#')[0] };
      if (navigator.share) { navigator.share(veri).catch(function () { /* iptal */ }); return; }
      var yaz = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(veri.url) : Promise.reject();
      yaz.then(function () { ZI.bildir('Bağlantı kopyalandı'); }, function () { g.prompt('Bağlantıyı kopyalayın:', veri.url); });
    });
  }
})(window);
