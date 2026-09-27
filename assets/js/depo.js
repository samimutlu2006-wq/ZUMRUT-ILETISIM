/*!
 * Zümrüt İletişim — Depo Takip Paneli
 * Ürün ekleme / düzenleme / silme, görsel yükleme, stok girişi-çıkışı ve hareket kaydı,
 * mağaza ve vitrin ayarları, GitHub'a yayınlama, içe / dışa aktarma.
 */
(function (g) {
  'use strict';
  var ZI = g.ZI, d = document, $ = ZI.$, $$ = ZI.$$, k = ZI.kacis;
  var GV = ZI.guvenlik, GH = ZI.github;
  var oturum = GV.oturum();
  if (!oturum) { location.replace('giris.html'); return; }

  /* =====================================================================
     Durum
     ===================================================================== */
  var S = {
    veri: null, hareketler: [], yayinlanmadi: false, degisiklik: 0, tabanSha: null, yonetici: null,
    sekme: 'urunler',
    t: { sayfa: 1, boyut: 20, aktiflik: 'tumu', sirala: 'kod', yon: -1, q: '', f: { tur: '', kod: '', ad: '', marka: '', durum: '', stok: '' } },
    secili: {},
    h: { q: '', tip: '', sayfa: 1 },
    gizliBant: {}
  };
  var F = null; // açık form durumu

  var TUR = { telefon: 'Telefon', tablet: 'Tablet', laptop: 'Laptop', aksesuar: 'Aksesuar' };
  var ALT = { kilif: 'Kılıf', sarj: 'Şarj / Adaptör', cam: 'Kırılmaz Cam', kulaklik: 'Kulaklık & Aksesuar' };
  var HAREKET = {
    olusturma: ['Ürün eklendi', 'koyu'], giris: ['Stok girişi', 'sifir'], cikis: ['Stok çıkışı', 'ikinci'],
    duzeltme: ['Stok düzeltme', 'ornek'], silme: ['Ürün silindi', 'ikinci']
  };
  var MARKALAR = ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Honor', 'Oppo', 'Realme', 'Google', 'OnePlus', 'Vivo', 'Tecno', 'Infinix', 'Lenovo', 'Asus', 'HP', 'Dell', 'JBL', 'Anker', 'Baseus', 'Diğer'];
  var SERILER = ['iPhone', 'iPad', 'iPad Pro', 'iPad Air', 'iPad mini', 'MacBook Air', 'MacBook Pro', 'AirPods', 'Apple Watch', 'Galaxy S', 'Galaxy Z', 'Galaxy A', 'Galaxy Tab', 'Galaxy Buds', 'Xiaomi', 'Redmi Note', 'Redmi', 'POCO', 'Xiaomi Pad'];
  var KOZMETIK = ['Mükemmel', 'Çok Temiz', 'Temiz', 'İyi', 'Orta'];
  var PARCA = ['Değişen parça yok, tüm parçalar orijinal', 'Ekran orijinaliyle değişti', 'Batarya orijinaliyle değişti', 'Arka kapak değişti', 'Kamera değişti', 'Ekran ve batarya değişti'];
  var OZ_CIHAZ = [['islemci', 'İşlemci', 'Örn. A20 Pro, Snapdragon 8 Elite Gen 5'], ['ram', 'RAM', 'Örn. 12 GB'], ['depolama', 'Depolama', 'Örn. 256 GB / 512 GB'], ['ekran', 'Ekran', 'Örn. 6,3 inç OLED, 120 Hz'], ['kamera', 'Arka kamera', 'Örn. 48 MP Ana + 12 MP Ultra Geniş'], ['onKamera', 'Ön kamera', 'Örn. 12 MP'], ['batarya', 'Batarya ve şarj', 'Örn. 5.000 mAh, 45W'], ['isletimSistemi', 'İşletim sistemi', 'Örn. iOS 27, Android 16'], ['diger', 'Diğer bilgiler', 'Örn. Çift SIM, kutu içeriği']];
  var OZ_AKSESUAR = [['uyumluluk', 'Uyumluluk', 'Örn. iPhone 17 serisi'], ['malzeme', 'Malzeme', 'Örn. Silikon'], ['cikis', 'Çıkış gücü', 'Örn. 20W USB-C'], ['kapasite', 'Kapasite', 'Örn. 10.000 mAh'], ['batarya', 'Pil ömrü', 'Örn. 24 saate kadar'], ['diger', 'Diğer bilgiler', '']];
  var OZ_ADLAR = {};
  OZ_CIHAZ.concat(OZ_AKSESUAR, [['cip', 'Çip'], ['ozellik', 'Öne çıkanlar'], ['sertlik', 'Sertlik'], ['yuzey', 'Yüzey'], ['uzunluk', 'Uzunluk'], ['baglanti', 'Bağlantı']]).forEach(function (x) { OZ_ADLAR[x[0]] = x[1]; });

  /* =====================================================================
     Yardımcılar
     ===================================================================== */
  function simdi() { return new Date().toISOString(); }
  function tarihYaz(iso, kisa) {
    if (!iso) return '—';
    var t = new Date(iso);
    if (isNaN(t)) return '—';
    return new Intl.DateTimeFormat('tr-TR', kisa ? { day: '2-digit', month: '2-digit', year: 'numeric' } : { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(t);
  }
  function turAdi(u) {
    if (u.kategori === 'aksesuar') return ALT[u.altKategori] || 'Aksesuar';
    if (u.kategori === 'telefon' && u.katlanabilir) return 'Katlanabilir';
    return TUR[u.kategori] || '—';
  }
  function secenekOzet(u) {
    if (u.secenekler && u.secenekler.length) return u.secenekler.map(function (s) { return s.ad; }).filter(Boolean).join(' · ');
    return (u.ozellikler && u.ozellikler.depolama) || '';
  }
  function durumRozet(u) {
    return u.durum === 'ikinci-el' ? '<span class="dp-rozet dp-rozet--ikinci">2. El' + (u.kozmetik ? ' · ' + k(u.kozmetik) : '') + '</span>' : '<span class="dp-rozet dp-rozet--sifir">Sıfır</span>';
  }
  function urunBul(id) { return S.veri.urunler.filter(function (u) { return u.id === id; })[0]; }
  function sayiAl(v) { if (v === '' || v == null) return null; var n = Number(String(v).replace(/\./g, '').replace(',', '.')); return isNaN(n) ? null : n; }
  function rastgele(n) { return Math.random().toString(36).slice(2, 2 + (n || 6)); }

  function bildir(m, hata) {
    var b = $('#dp-bildirim');
    b.className = 'dp-bildirim' + (hata ? ' hata' : '');
    b.innerHTML = ZI.ikon(hata ? 'uyari' : 'onay') + '<span>' + k(m) + '</span>';
    requestAnimationFrame(function () { b.classList.add('acik'); });
    clearTimeout(b._z); b._z = setTimeout(function () { b.classList.remove('acik'); }, hata ? 6000 : 3000);
  }

  function modal(o) {
    return new Promise(function (coz) {
      var m = $('#dp-modal'), kutu = $('.dp-modal__kutu', m);
      kutu.className = 'dp-modal__kutu' + (o.genis ? ' dp-modal__kutu--genis' : '');
      kutu.innerHTML = (o.ikon ? '<div class="dp-modal__ikon ' + (o.ikonSinif || '') + '">' + ZI.ikon(o.ikon) + '</div>' : '') +
        '<h2 id="dp-modal-baslik">' + k(o.baslik) + '</h2>' + (o.metin ? '<p>' + o.metin + '</p>' : '') + (o.icerik || '') +
        '<div class="dp-modal__alt">' + (o.butonlar || [{ metin: 'Tamam', sinif: 'dp-btn--turuncu', deger: 'tamam', varsayilan: true }]).map(function (b) {
          return '<button type="button" class="dp-btn dp-btn--buyuk ' + (b.sinif || 'dp-btn--cizgi') + '" data-deger="' + b.deger + '"' + (b.varsayilan ? ' data-varsayilan' : '') + '>' + (b.ikon ? ZI.ikon(b.ikon) : '') + k(b.metin) + '</button>';
        }).join('') + '</div>';
      kutu.setAttribute('aria-labelledby', 'dp-modal-baslik');
      m.classList.add('acik'); m.setAttribute('aria-hidden', 'false');
      var onceki = d.activeElement, bitti = false;
      function kapat(deger) {
        if (bitti) return; bitti = true;
        m.classList.remove('acik'); m.setAttribute('aria-hidden', 'true');
        d.removeEventListener('keydown', tus, true);
        kutu.onclick = null; m.onclick = null;
        if (onceki && onceki.focus && d.contains(onceki)) onceki.focus();
        coz(deger);
      }
      kutu.onclick = function (e) {
        var b = e.target.closest('[data-deger]');
        if (!b || b.disabled) return;
        var v = b.dataset.deger;
        if (v === 'iptal') return kapat(null);
        if (o.dogrula && o.dogrula(kutu, v) === false) return;
        kapat(o.topla ? o.topla(kutu, v) : v);
      };
      m.onclick = function (e) { if (e.target === m && !o.kapatilamaz) kapat(null); };
      function tus(e) {
        if (e.key === 'Escape' && !o.kapatilamaz) { e.stopPropagation(); kapat(null); }
        if (e.key === 'Enter' && e.target.tagName === 'INPUT' && kutu.contains(e.target)) {
          var v = kutu.querySelector('[data-varsayilan]');
          if (v) { e.preventDefault(); v.click(); }
        }
      }
      d.addEventListener('keydown', tus, true);
      setTimeout(function () { var f = kutu.querySelector('input:not([type=hidden]),select,textarea') || kutu.querySelector('[data-varsayilan]'); if (f) f.focus(); }, 80);
      if (o.acildi) o.acildi(kutu, kapat);
    });
  }
  function onayla(baslik, metin, evet, tehlike) {
    return modal({
      ikon: tehlike ? 'uyari' : 'bilgi', ikonSinif: tehlike ? 'tehlike' : '', baslik: baslik, metin: metin,
      butonlar: [{ metin: 'Vazgeç', deger: 'iptal', sinif: 'dp-btn--cizgi' }, { metin: evet || 'Tamam', deger: 'evet', sinif: tehlike ? 'dp-btn--tehlike' : 'dp-btn--turuncu', varsayilan: true }]
    }).then(function (v) { return v === 'evet'; });
  }
  function bilgiVer(baslik, metin, ikon, sinif) { return modal({ ikon: ikon || 'bilgi', ikonSinif: sinif || '', baslik: baslik, metin: metin }); }

  function indir(ad, icerik, tur) {
    var b = icerik instanceof Blob ? icerik : new Blob([icerik], { type: tur || 'text/plain;charset=utf-8' });
    var a = d.createElement('a');
    a.href = URL.createObjectURL(b); a.download = ad;
    d.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }

  /* Basit ZIP (sıkıştırmasız) oluşturucu — elle yayın paketi için */
  var CRC_TABLO = (function () { var t = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CRC_TABLO[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zipOlustur(dosyalar) {
    var enc = new TextEncoder(), parcalar = [], merkez = [], ofset = 0;
    var t = new Date(), dt = ((t.getFullYear() - 1980) << 9) | ((t.getMonth() + 1) << 5) | t.getDate(), ts = (t.getHours() << 11) | (t.getMinutes() << 5) | (t.getSeconds() >> 1);
    dosyalar.forEach(function (f) {
      var ad = enc.encode(f.yol), veri = f.bayt || enc.encode(f.metin || ''), crc = crc32(veri);
      var yb = new DataView(new ArrayBuffer(30));
      yb.setUint32(0, 0x04034b50, true); yb.setUint16(4, 20, true); yb.setUint16(6, 0x0800, true); yb.setUint16(8, 0, true);
      yb.setUint16(10, ts, true); yb.setUint16(12, dt, true); yb.setUint32(14, crc, true); yb.setUint32(18, veri.length, true); yb.setUint32(22, veri.length, true);
      yb.setUint16(26, ad.length, true); yb.setUint16(28, 0, true);
      parcalar.push(new Uint8Array(yb.buffer), ad, veri);
      var mb = new DataView(new ArrayBuffer(46));
      mb.setUint32(0, 0x02014b50, true); mb.setUint16(4, 20, true); mb.setUint16(6, 20, true); mb.setUint16(8, 0x0800, true); mb.setUint16(10, 0, true);
      mb.setUint16(12, ts, true); mb.setUint16(14, dt, true); mb.setUint32(16, crc, true); mb.setUint32(20, veri.length, true); mb.setUint32(24, veri.length, true);
      mb.setUint16(28, ad.length, true); mb.setUint32(42, ofset, true);
      merkez.push(new Uint8Array(mb.buffer), ad);
      ofset += 30 + ad.length + veri.length;
    });
    var mBoy = merkez.reduce(function (s, x) { return s + x.length; }, 0);
    var son = new DataView(new ArrayBuffer(22));
    son.setUint32(0, 0x06054b50, true); son.setUint16(8, dosyalar.length, true); son.setUint16(10, dosyalar.length, true);
    son.setUint32(12, mBoy, true); son.setUint32(16, ofset, true);
    return new Blob(parcalar.concat(merkez, [new Uint8Array(son.buffer)]), { type: 'application/zip' });
  }
  function b64Bayt(b64) { var s = atob(b64), b = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; }
  function gitBlobSha(metin) {
    var bayt = new TextEncoder().encode(metin), bas = new TextEncoder().encode('blob ' + bayt.length + '\u0000');
    var tum = new Uint8Array(bas.length + bayt.length); tum.set(bas); tum.set(bayt, bas.length);
    return g.crypto.subtle.digest('SHA-1', tum).then(function (h) { return Array.prototype.map.call(new Uint8Array(h), function (x) { return (x < 16 ? '0' : '') + x.toString(16); }).join(''); });
  }

  /* =====================================================================
     Veri yükleme ve taslak
     ===================================================================== */
  function scriptYukle(yol, degisken) {
    return new Promise(function (coz) {
      try { delete g[degisken]; } catch (e) { g[degisken] = undefined; }
      var s = d.createElement('script');
      s.src = yol + '?v=' + Date.now();
      s.onload = function () { coz(g[degisken] || null); };
      s.onerror = function () { coz(null); };
      d.head.appendChild(s);
    });
  }
  function uzaktanOku() {
    var a = GH.ayar(), token = oturum.token;
    if (!a || !token) return Promise.resolve(null);
    return Promise.all([GH.dosyaOku(token, a, 'data/veri.js'), GH.dosyaOku(token, a, 'data/hareketler.js').catch(function () { return null; })])
      .then(function (r) {
        return { veri: GH.jsVeriCoz(r[0].metin), sha: r[0].sha, hareketler: r[1] ? GH.jsVeriCoz(r[1].metin) : [] };
      })
      .catch(function (e) { bildir('GitHub’dan güncel veri okunamadı: ' + e.message, true); return null; });
  }
  function veriYukle() {
    return Promise.all([
      scriptYukle('data/veri.js', 'ZI_VERI'), scriptYukle('data/hareketler.js', 'ZI_HAREKETLER'), scriptYukle('data/yonetici.js', 'ZI_YONETICI'),
      ZI.depo.al('taslak').catch(function () { return null; }), uzaktanOku()
    ]).then(function (r) {
      var site = r[0], siteH = r[1], yon = r[2], taslak = r[3], uzak = r[4];
      var yerel = ZI.yerelAl('zi-yonetici-yerel', null);
      S.yonetici = (yerel && (!yon || Date.parse(yerel.guncelleme || 0) > Date.parse(yon.guncelleme || 0))) ? yerel : yon;

      function kullan(v, h, yayinlanmadi, sha, degisiklik) {
        S.veri = ZI.normalize(JSON.parse(JSON.stringify(v || ZI.bosVeri())));
        S.hareketler = (Array.isArray(h) ? h.slice() : []).sort(function (a, b) { return String(b.tarih || '').localeCompare(String(a.tarih || '')); });
        S.yayinlanmadi = !!yayinlanmadi; S.degisiklik = degisiklik || 0; S.tabanSha = sha || null;
      }
      if (taslak && taslak.veri && taslak.yayinlanmadi) {
        if (uzak && taslak.tabanSha && uzak.sha && uzak.sha !== taslak.tabanSha) {
          return modal({
            ikon: 'uyari', baslik: 'Başka bir cihazdan yayın yapılmış',
            metin: 'Bu cihazda yayınlanmamış <b>' + (taslak.degisiklik || 1) + '</b> değişiklik var, ancak site bu arada başka bir cihazdan güncellenmiş. Hangisiyle devam etmek istersiniz?',
            butonlar: [{ metin: 'Güncel yayını yükle', deger: 'uzak', sinif: 'dp-btn--cizgi' }, { metin: 'Bu cihazdakileri koru', deger: 'taslak', sinif: 'dp-btn--turuncu', varsayilan: true }],
            kapatilamaz: true
          }).then(function (secim) {
            if (secim === 'uzak') { kullan(uzak.veri, uzak.hareketler, false, uzak.sha); return taslakKaydet(); }
            kullan(taslak.veri, taslak.hareketler, true, uzak.sha, taslak.degisiklik);
            return taslakKaydet();
          });
        }
        kullan(taslak.veri, taslak.hareketler, true, taslak.tabanSha || (uzak && uzak.sha), taslak.degisiklik);
        return;
      }
      if (uzak) {
        var taslakYeni = taslak && taslak.veri && Date.parse(taslak.veri.guncelleme || 0) > Date.parse(uzak.veri.guncelleme || 0);
        if (taslakYeni) kullan(taslak.veri, taslak.hareketler, false, taslak.tabanSha || uzak.sha);
        else kullan(uzak.veri, uzak.hareketler, false, uzak.sha);
        return;
      }
      if (taslak && taslak.veri && (!site || Date.parse(taslak.veri.guncelleme || 0) >= Date.parse(site.guncelleme || 0))) {
        kullan(taslak.veri, taslak.hareketler, false, taslak.tabanSha);
        return;
      }
      kullan(site, siteH, false, null);
    });
  }
  function taslakKaydet() {
    return ZI.depo.koy('taslak', { veri: S.veri, hareketler: S.hareketler, yayinlanmadi: S.yayinlanmadi, degisiklik: S.degisiklik, tabanSha: S.tabanSha, kaydedildi: simdi() })
      .catch(function (e) { bildir('Taslak bu tarayıcıya kaydedilemedi: ' + (e && e.message || e), true); });
  }
  function degisti(mesaj) {
    S.yayinlanmadi = true; S.degisiklik += 1;
    taslakKaydet(); ustDurum();
    if (mesaj) bildir(mesaj);
  }
  function hareketEkle(u, tip, adet, onceki, sonraki, not) {
    S.hareketler.unshift({ id: 'h' + Date.now().toString(36) + rastgele(3), urunId: u.id, urunAd: u.ad, urunKod: u.kod, tarih: simdi(), tip: tip, adet: adet, onceki: onceki, sonraki: sonraki, not: not || '', kullanici: oturum.kullanici });
    if (S.hareketler.length > 5000) S.hareketler.length = 5000;
  }

  /* =====================================================================
     Üst çubuk ve sekmeler
     ===================================================================== */
  var SEKMELER = [['urunler', 'Ürünler', 'kutu'], ['hareketler', 'Stok Hareketleri', 'gecmis'], ['magaza', 'Mağaza & Vitrin', 'magaza'], ['ayarlar', 'Ayarlar', 'ayar']];
  function ustCiz() {
    $('#dp-ust').innerHTML = '<div class="dp-ust__ic">' +
      '<a class="dp-marka" href="index.html" target="_blank" rel="noopener" title="Siteyi yeni sekmede aç">' + ZI.markaTas() + '<span>Zümrüt İletişim</span></a>' +
      '<span class="dp-etiket">Depo</span>' +
      '<nav class="dp-sekmeler" role="tablist" aria-label="Panel bölümleri">' + SEKMELER.map(function (s) {
        return '<button class="dp-sekme" type="button" role="tab" data-sekme="' + s[0] + '" aria-selected="false">' + ZI.ikon(s[2]) + k(s[1]) + '</button>';
      }).join('') + '</nav>' +
      '<div class="dp-ust__sag">' +
      '<span class="dp-durum" id="dp-durum"></span>' +
      '<button class="dp-btn dp-btn--turuncu" type="button" id="dp-yayinla">' + ZI.ikon('bulut') + '<span>Yayınla</span></button>' +
      '<a class="dp-btn dp-btn--hayalet dp-site-link" href="index.html" target="_blank" rel="noopener">' + ZI.ikon('dis') + '<span>Siteyi Gör</span></a>' +
      '<div class="dp-kullanici dp-menu-kap"><button class="dp-kullanici__btn" type="button" aria-haspopup="true" aria-expanded="false" data-acilir="dp-kullanici-menu"><span class="dp-avatar">' + k((oturum.kullanici || 'A').charAt(0)) + '</span><span>' + k(oturum.kullanici) + '</span>' + ZI.ikon('asagi') + '</button>' +
      '<div class="dp-acilir" id="dp-kullanici-menu" role="menu"><button type="button" data-git="ayarlar">' + ZI.ikon('ayar') + 'Ayarlar</button><a href="index.html" target="_blank" rel="noopener">' + ZI.ikon('dis') + 'Siteyi görüntüle</a><hr><button type="button" data-cikis class="tehlike">' + ZI.ikon('cikis') + 'Çıkış yap</button></div></div>' +
      '</div></div>';
    $('#dp-ust').addEventListener('click', function (e) {
      var s = e.target.closest('[data-sekme]'); if (s) { sekmeAc(s.dataset.sekme); return; }
      var gt = e.target.closest('[data-git]'); if (gt) { acilirKapat(); sekmeAc(gt.dataset.git); return; }
      if (e.target.closest('[data-cikis]')) { cikis(); return; }
      if (e.target.closest('#dp-yayinla')) { yayinla(); }
    });
    ustDurum();
  }
  function ustDurum() {
    var el = $('#dp-durum'), b = $('#dp-yayinla');
    if (!el || !b) return;
    var a = GH.ayar();
    if (S.yayinlanmadi) {
      el.className = 'dp-durum bekliyor';
      el.textContent = S.degisiklik + ' yayınlanmamış değişiklik';
      b.disabled = false;
      b.title = 'Değişiklikleri siteye aktar';
    } else {
      el.className = 'dp-durum' + (a ? '' : ' yerel');
      el.textContent = a ? 'Tüm değişiklikler yayında' : 'GitHub bağlı değil';
      b.disabled = true;
      b.title = 'Yayınlanacak değişiklik yok';
    }
  }
  function sekmeAc(ad, ilk) {
    if (!SEKMELER.some(function (s) { return s[0] === ad; })) ad = 'urunler';
    S.sekme = ad;
    $$('.dp-sekme').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.sekme === ad ? 'true' : 'false'); });
    try { history.replaceState(null, '', '#' + ad); } catch (e) { /* yok */ }
    ({ urunler: urunlerSekmesi, hareketler: hareketlerSekmesi, magaza: magazaSekmesi, ayarlar: ayarlarSekmesi })[ad]();
    if (!ilk) g.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function cikis() {
    var dev = S.yayinlanmadi ? onayla('Çıkış yapılsın mı?', 'Yayınlanmamış <b>' + S.degisiklik + '</b> değişikliğiniz bu tarayıcıda saklanıyor; tekrar giriş yaptığınızda kaldığınız yerden devam edebilirsiniz.', 'Çıkış yap') : Promise.resolve(true);
    dev.then(function (e) { if (!e) return; GV.oturumKapat(); location.href = 'giris.html'; });
  }

  /* Açılır menüler (genel) */
  function acilirKapat(haric) {
    $$('.dp-acilir.acik').forEach(function (m) { if (m !== haric) { m.classList.remove('acik'); var b = d.querySelector('[data-acilir="' + m.id + '"]'); if (b) b.setAttribute('aria-expanded', 'false'); } });
    var sm = $('#dp-satir-menu'); if (sm && sm !== haric) sm.remove();
    $$('.dp-noktalar-btn[aria-expanded="true"]').forEach(function (b) { if (!haric || !haric.contains(b)) b.setAttribute('aria-expanded', 'false'); });
  }
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-acilir]');
    if (b) {
      var m = d.getElementById(b.dataset.acilir), acik = m.classList.contains('acik');
      acilirKapat(m);
      m.classList.toggle('acik', !acik); b.setAttribute('aria-expanded', acik ? 'false' : 'true');
      e.stopPropagation(); return;
    }
    if (!e.target.closest('.dp-acilir') && !e.target.closest('.dp-noktalar-btn')) acilirKapat();
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') acilirKapat(); });

  /* =====================================================================
     ÜRÜNLER SEKMESİ
     ===================================================================== */
  function urunlerSekmesi() {
    var t = S.t;
    $('#dp-ana').innerHTML =
      '<div class="dp-sayfa-baslik"><div><h1>Ürün ve Stok</h1><p>Ürün ekleyin, düzenleyin, stok girişi / çıkışı yapın. Değişiklikler “Yayınla” ile siteye aktarılır.</p></div></div>' +
      '<div class="dp-bantlar" id="dp-bantlar"></div>' +
      '<div class="dp-ozet" id="dp-ozet"></div>' +
      '<section class="dp-cerceve" aria-label="Ürün listesi">' +
      '<div class="dp-cerceve__ust"><span class="dp-cerceve__baslik">Ürün ve Stok Listesi</span>' +
      '<div class="dp-arac">' +
      '<label class="dp-arama">' + ZI.ikon('ara') + '<span class="zi-gizli">Ürünlerde ara</span><input type="search" id="dp-ara" placeholder="Ürün, kod veya marka ara" value="' + k(t.q) + '"></label>' +
      '<div class="dp-grup">' +
      '<div class="dp-menu-kap"><button class="dp-btn dp-btn--siyah" type="button" data-acilir="dp-aktar-menu" aria-haspopup="true" aria-expanded="false">' + ZI.ikon('takas') + 'İçe / Dışa Aktar</button>' +
      '<div class="dp-acilir" id="dp-aktar-menu" role="menu">' +
      '<button type="button" data-islem="csv">' + ZI.ikon('tablo') + 'Excel’e aktar (CSV)</button>' +
      '<button type="button" data-islem="json">' + ZI.ikon('indir') + 'Yedek indir (JSON)</button>' +
      '<label>' + ZI.ikon('yukle') + 'Yedekten geri yükle<input type="file" accept=".json,application/json" data-islem="json-yukle" hidden></label>' +
      '<hr><button type="button" data-islem="paket">' + ZI.ikon('kutu') + 'Yayın paketini indir (ZIP)</button></div></div>' +
      '<button class="dp-btn dp-btn--siyah" type="button" id="dp-toplu-sil" disabled>' + ZI.ikon('carpi') + 'Sil</button>' +
      '<button class="dp-btn dp-btn--siyah" type="button" id="dp-toplu-duzenle" disabled>' + ZI.ikon('kalem') + 'Düzenle</button>' +
      '<button class="dp-btn dp-btn--turuncu" type="button" id="dp-yeni">' + ZI.ikon('arti') + 'Yeni Ekle</button>' +
      '</div></div></div>' +
      '<div class="dp-tablo-kap"><table class="dp-tablo" id="dp-tablo"><thead>' + tabloBaslik() + '</thead><tbody></tbody></table></div>' +
      '<div class="dp-sayfalama" id="dp-sayfalama"></div>' +
      '</section>' +
      '<button class="dp-fab" type="button" id="dp-fab" aria-label="Yeni ürün ekle" title="Yeni ürün ekle">' + ZI.ikon('arti') + '</button>';

    $('#dp-ara').addEventListener('input', function () { t.q = this.value; t.sayfa = 1; tabloCiz(); });
    $$('.dp-filtre [data-f]').forEach(function (el) {
      el.value = t.f[el.dataset.f] || '';
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function () { t.f[el.dataset.f] = el.value; t.sayfa = 1; tabloCiz(); });
    });
    $('#dp-tablo thead').addEventListener('click', function (e) {
      var b = e.target.closest('[data-sirala]');
      if (b) { var a = b.dataset.sirala; if (t.sirala === a) t.yon *= -1; else { t.sirala = a; t.yon = 1; } tabloCiz(); return; }
      var h = e.target.closest('#dp-hepsi');
      if (h) { sayfadakiler().forEach(function (u) { if (h.checked) S.secili[u.id] = true; else delete S.secili[u.id]; }); tabloCiz(); }
    });
    $('#dp-yeni').addEventListener('click', function () { formAc(null); });
    $('#dp-fab').addEventListener('click', function () { formAc(null); });
    $('#dp-toplu-duzenle').addEventListener('click', function () { var id = Object.keys(S.secili)[0]; var u = urunBul(id); if (u) formAc(u); });
    $('#dp-toplu-sil').addEventListener('click', function () { topluSil(Object.keys(S.secili)); });
    var tb = $('#dp-tablo tbody');
    tb.addEventListener('click', function (e) {
      var tr = e.target.closest('tr[data-id]'); if (!tr) return;
      var u = urunBul(tr.dataset.id); if (!u) return;
      if (e.target.closest('[data-duzenle]')) { formAc(u); return; }
      if (e.target.closest('[data-stok]')) { stokModal(u); return; }
      if (e.target.closest('[data-menu]')) { satirMenu(e.target.closest('[data-menu]'), u); e.stopPropagation(); return; }
      if (e.target.closest('[data-aktif]') || e.target.closest('.dp-anahtar')) return;
      if (e.target.closest('[data-sec]')) return;
      if (e.target.closest('button, a, input, label')) return;
      // Satıra tıklayınca seç / bırak
      if (S.secili[u.id]) delete S.secili[u.id]; else S.secili[u.id] = true;
      tabloCiz();
    });
    tb.addEventListener('dblclick', function (e) { var tr = e.target.closest('tr[data-id]'); if (tr && !e.target.closest('button,input,label')) { var u = urunBul(tr.dataset.id); if (u) formAc(u); } });
    tb.addEventListener('change', function (e) {
      var tr = e.target.closest('tr[data-id]'); if (!tr) return;
      var u = urunBul(tr.dataset.id); if (!u) return;
      if (e.target.matches('[data-sec]')) { if (e.target.checked) S.secili[u.id] = true; else delete S.secili[u.id]; tabloCiz(); }
      if (e.target.matches('[data-aktif]')) {
        u.aktif = e.target.checked; u.guncelleme = simdi();
        degisti(u.ad + (u.aktif ? ' sitede gösterilecek.' : ' siteden gizlenecek.'));
        tabloCiz(); ozetCiz();
      }
    });
    bantlarCiz(); ozetCiz(); tabloCiz();
  }

  function aracIslem(e) {
    var b = e.target.closest('[data-islem]');
    if (!b || b.tagName === 'INPUT') return;
    acilirKapat();
    var i = b.dataset.islem;
    if (i === 'csv') csvIndir();
    else if (i === 'json') jsonIndir();
    else if (i === 'paket') paketIndir();
  }

  function tabloBaslik() {
    function th(ad, alan, sinif) {
      var t = S.t, ok = t.sirala === alan ? ' aria-sort="' + (t.yon > 0 ? 'ascending' : 'descending') + '"' : '';
      return '<th' + (sinif ? ' class="' + sinif + '"' : '') + '><button class="dp-th" type="button" data-sirala="' + alan + '"' + ok + '>' + ad + ZI.ikon('asagi') + '</button></th>';
    }
    return '<tr>' +
      '<th style="width:46px"><span class="dp-th"><input type="checkbox" id="dp-hepsi" aria-label="Sayfadaki tüm ürünleri seç"></span></th>' +
      '<th style="width:64px"><span class="dp-th">Görsel</span></th>' +
      th('Türü', 'tur') + th('Ürün Kodu', 'kod') + th('Ürün Açıklaması', 'ad') + th('Marka / Seri', 'marka') + th('Durum', 'durum') + th('Pil', 'pil') +
      th('Fiyat', 'fiyat', 'sag') + th('Stok', 'stok', 'orta') +
      '<th class="orta"><span class="dp-th" style="justify-content:center">Sitede</span></th><th style="width:52px"><span class="dp-th"></span></th></tr>' +
      '<tr class="dp-filtre">' +
      '<th></th><th></th>' +
      '<th><select data-f="tur" aria-label="Türe göre filtrele"><option value="">Tümü</option><option value="telefon">Telefon</option><option value="katlanabilir">Katlanabilir</option><option value="tablet">Tablet</option><option value="laptop">Laptop</option><option value="aksesuar">Aksesuar</option></select></th>' +
      '<th><input data-f="kod" placeholder="Kod" aria-label="Koda göre filtrele"></th>' +
      '<th><input data-f="ad" placeholder="Ürün adı" aria-label="Ada göre filtrele"></th>' +
      '<th><input data-f="marka" placeholder="Marka" aria-label="Markaya göre filtrele"></th>' +
      '<th><select data-f="durum" aria-label="Duruma göre filtrele"><option value="">Tümü</option><option value="sifir">Sıfır</option><option value="ikinci-el">2. El</option></select></th>' +
      '<th></th><th></th>' +
      '<th><select data-f="stok" aria-label="Stoka göre filtrele"><option value="">Tümü</option><option value="var">Stokta</option><option value="az">Kritik (≤ 1)</option><option value="yok">Tükendi</option></select></th>' +
      '<th></th><th></th></tr>';
  }

  function filtreli() {
    var t = S.t, q = ZI.normalMetin(t.q), f = t.f;
    var l = S.veri.urunler.filter(function (u) {
      if (t.aktiflik === 'aktif' && !u.aktif) return false;
      if (t.aktiflik === 'pasif' && u.aktif) return false;
      if (f.tur) { if (f.tur === 'katlanabilir') { if (!(u.kategori === 'telefon' && u.katlanabilir)) return false; } else if (u.kategori !== f.tur) return false; }
      if (f.durum && u.durum !== f.durum) return false;
      if (f.stok === 'var' && u.stok <= 0) return false;
      if (f.stok === 'az' && u.stok > 1) return false;
      if (f.stok === 'yok' && u.stok > 0) return false;
      if (f.kod && ZI.normalMetin(u.kod).indexOf(ZI.normalMetin(f.kod)) < 0) return false;
      if (f.ad && ZI.normalMetin(u.ad).indexOf(ZI.normalMetin(f.ad)) < 0) return false;
      if (f.marka && ZI.normalMetin((u.marka || '') + ' ' + (u.seri || '')).indexOf(ZI.normalMetin(f.marka)) < 0) return false;
      if (q && ZI.normalMetin([u.ad, u.kod, u.marka, u.seri, turAdi(u), u.durum === 'ikinci-el' ? '2. el ikinci el' : 'sifir'].join(' ')).indexOf(q) < 0) return false;
      return true;
    });
    var al = {
      tur: turAdi, kod: function (u) { return u.kod || ''; }, ad: function (u) { return u.ad || ''; }, marka: function (u) { return (u.marka || '') + ' ' + (u.seri || ''); },
      durum: function (u) { return u.durum; }, pil: function (u) { return u.pilSagligi == null ? -1 : Number(u.pilSagligi); },
      fiyat: function (u) { var f2 = ZI.baslangicFiyati(u); return f2 == null ? -1 : f2; }, stok: function (u) { return u.stok; }
    }[t.sirala] || function (u) { return u.kod; };
    l.sort(function (a, b) {
      var x = al(a), y = al(b);
      var r = (typeof x === 'number' && typeof y === 'number') ? x - y : String(x).localeCompare(String(y), 'tr', { numeric: true, sensitivity: 'base' });
      return r * t.yon;
    });
    return l;
  }
  function sayfadakiler() {
    var l = filtreli(), t = S.t, top = Math.max(1, Math.ceil(l.length / t.boyut));
    if (t.sayfa > top) t.sayfa = top;
    return l.slice((t.sayfa - 1) * t.boyut, t.sayfa * t.boyut);
  }

  function satirHTML(u) {
    var gr = ZI.gorseller(u)[0];
    var fiyat = ZI.baslangicFiyati(u);
    var stokSinif = u.stok <= 0 ? ' yok' : (u.stok <= 1 ? ' az' : '');
    var pilDeger = u.pilSagligi != null && u.pilSagligi !== '' && u.kategori !== 'aksesuar' ? Number(u.pilSagligi) : null;
    var pil = pilDeger != null ? '<span class="dp-pil' + (pilDeger >= 85 ? '' : (pilDeger >= 80 ? ' orta' : ' dusuk')) + '" style="--p:' + pilDeger + '%" title="Pil sağlığı"><i></i>%' + pilDeger + '</span>' : '<span class="dp-alt-metin">—</span>';
    var stokBtn = '<button class="dp-stok' + stokSinif + '" type="button" data-stok title="Stok girişi / çıkışı" aria-label="Stok: ' + u.stok + '. Stok girişi veya çıkışı yap">' + u.stok + '</button>';
    var aktif = '<label class="dp-anahtar" title="Sitede göster"><input type="checkbox" data-aktif' + (u.aktif ? ' checked' : '') + ' aria-label="' + k(u.ad) + ' sitede gösterilsin"><span></span></label>';
    var alt = [u.ornek ? '<span class="dp-rozet dp-rozet--ornek">Örnek</span>' : '', u.rozet ? '<span class="dp-rozet dp-rozet--koyu">' + k(u.rozet) + '</span>' : '', k(secenekOzet(u))].filter(Boolean).join(' ');
    return '<tr data-id="' + k(u.id) + '" class="' + (S.secili[u.id] ? 'secili ' : '') + (u.aktif ? '' : 'pasif') + '">' +
      '<td data-h="sec"><input type="checkbox" data-sec aria-label="' + k(u.ad) + ' seç"' + (S.secili[u.id] ? ' checked' : '') + '></td>' +
      '<td data-h="gorsel"><div class="dp-kucuk-gorsel">' + (gr ? '<img src="' + k(gr.src) + '" alt=""' + (gr.foto ? ' class="foto"' : '') + ' loading="lazy" decoding="async">' : '') + '</div></td>' +
      '<td data-h="tur"><span class="dp-tur">' + k(turAdi(u)) + '</span></td>' +
      '<td data-h="kod"><span class="dp-kod">' + k(u.kod || '—') + '</span></td>' +
      '<td data-h="ad"><button class="dp-urun-ad" type="button" data-duzenle title="Düzenle">' + k(u.ad) + '</button><span class="dp-alt-metin">' + alt + '</span></td>' +
      '<td data-h="marka" class="dp-mobil-gizle"><b>' + k(u.marka || '—') + '</b><span class="dp-alt-metin">' + k(u.seri || '') + '</span></td>' +
      '<td data-h="durum" class="dp-mobil-gizle">' + durumRozet(u) + '</td>' +
      '<td data-h="pil" class="dp-mobil-gizle">' + pil + '</td>' +
      '<td data-h="fiyat" class="sag dp-mobil-gizle"><span class="dp-sayi">' + (fiyat != null ? ZI.fiyatYaz(fiyat) : '—') + '</span>' + ((u.secenekler || []).length > 1 ? '<span class="dp-alt-metin">' + u.secenekler.length + ' seçenek</span>' : '') + '</td>' +
      '<td data-h="stok" class="orta dp-mobil-gizle">' + stokBtn + '</td>' +
      '<td data-h="sitede" class="orta dp-mobil-gizle">' + aktif + '</td>' +
      '<td data-h="menu"><button class="dp-noktalar-btn" type="button" data-menu aria-haspopup="true" aria-expanded="false" aria-label="' + k(u.ad) + ' işlemleri">' + ZI.ikon('noktalar') + '</button></td>' +
      '<td data-h="bilgi"><span class="dp-alt-metin">' + k(u.kod || '') + ' · ' + k(turAdi(u)) + ' · ' + (u.durum === 'ikinci-el' ? '2. El' : 'Sıfır') + ' · ' + (fiyat != null ? ZI.fiyatYaz(fiyat) : 'Fiyat yok') + '</span></td>' +
      '<td data-h="alt">' + stokBtn + pil + '<span style="margin-left:auto;display:inline-flex;align-items:center;gap:8px;font-size:12px;color:var(--d-metin-2)">Sitede ' + aktif + '</span></td>' +
      '</tr>';
  }

  function tabloCiz() {
    if (S.sekme !== 'urunler' || !$('#dp-tablo')) return;
    var t = S.t, l = filtreli(), top = Math.max(1, Math.ceil(l.length / t.boyut));
    if (t.sayfa > top) t.sayfa = top;
    var sayfa = l.slice((t.sayfa - 1) * t.boyut, t.sayfa * t.boyut);
    var tb = $('#dp-tablo tbody');
    tb.innerHTML = sayfa.length ? sayfa.map(satirHTML).join('')
      : '<tr class="dp-bos-satir"><td colspan="12">' + (S.veri.urunler.length ? 'Filtrelere uyan ürün yok. <button type="button" class="dp-link" id="dp-filtre-temizle">Filtreleri temizle</button>' : 'Henüz ürün yok. <button type="button" class="dp-link" id="dp-ilk-urun">İlk ürünü ekleyin</button>') + '</td></tr>';
    var ft = $('#dp-filtre-temizle'); if (ft) ft.onclick = function () { S.t.q = ''; S.t.f = { tur: '', kod: '', ad: '', marka: '', durum: '', stok: '' }; S.t.aktiflik = 'tumu'; urunlerSekmesi(); };
    var iu = $('#dp-ilk-urun'); if (iu) iu.onclick = function () { formAc(null); };
    // Başlık sıralama göstergesi
    $$('#dp-tablo [data-sirala]').forEach(function (b) {
      if (b.dataset.sirala === t.sirala) b.setAttribute('aria-sort', t.yon > 0 ? 'ascending' : 'descending'); else b.removeAttribute('aria-sort');
    });
    var hepsi = $('#dp-hepsi');
    var secSay = sayfa.filter(function (u) { return S.secili[u.id]; }).length;
    hepsi.checked = sayfa.length > 0 && secSay === sayfa.length;
    hepsi.indeterminate = secSay > 0 && secSay < sayfa.length;
    // Seçim temizliği (silinen ürünler)
    Object.keys(S.secili).forEach(function (id) { if (!urunBul(id)) delete S.secili[id]; });
    var n = Object.keys(S.secili).length;
    $('#dp-toplu-sil').disabled = n === 0;
    $('#dp-toplu-sil').innerHTML = ZI.ikon('carpi') + 'Sil' + (n ? ' (' + n + ')' : '');
    $('#dp-toplu-duzenle').disabled = n !== 1;
    sayfalamaCiz(l.length, top);
  }

  function sayfalamaCiz(adet, top) {
    var t = S.t, el = $('#dp-sayfalama');
    var bas = adet ? (t.sayfa - 1) * t.boyut + 1 : 0, son = Math.min(adet, t.sayfa * t.boyut);
    el.innerHTML = '<span class="dp-sayfalama__bilgi">' + adet + ' kayıttan ' + bas + '–' + son + ' arası gösteriliyor' + (Object.keys(S.secili).length ? ' · ' + Object.keys(S.secili).length + ' seçili' : '') + '</span>' +
      '<label class="dp-secim dp-secim--koyu"><span class="zi-gizli">Durum</span><select id="dp-aktiflik"><option value="tumu">Tümü</option><option value="aktif">Aktif</option><option value="pasif">Pasif</option></select>' + ZI.ikon('asagi') + '</label>' +
      '<label class="dp-secim"><span class="zi-gizli">Sayfa başına</span><select id="dp-boyut">' + [10, 20, 50, 100].map(function (n) { return '<option value="' + n + '"' + (n === t.boyut ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select>' + ZI.ikon('asagi') + '</label>' +
      '<button class="dp-sayfa-btn" type="button" data-sayfa="ilk" aria-label="İlk sayfa"' + (t.sayfa <= 1 ? ' disabled' : '') + '>«</button>' +
      '<button class="dp-sayfa-btn" type="button" data-sayfa="onceki" aria-label="Önceki sayfa"' + (t.sayfa <= 1 ? ' disabled' : '') + '>' + ZI.ikon('sol') + '</button>' +
      '<span class="dp-sayfa-no"><input type="number" min="1" max="' + top + '" value="' + t.sayfa + '" aria-label="Sayfa numarası" id="dp-sayfa-no"> / ' + top + '</span>' +
      '<button class="dp-sayfa-btn" type="button" data-sayfa="sonraki" aria-label="Sonraki sayfa"' + (t.sayfa >= top ? ' disabled' : '') + '>' + ZI.ikon('sag') + '</button>' +
      '<button class="dp-sayfa-btn" type="button" data-sayfa="son" aria-label="Son sayfa"' + (t.sayfa >= top ? ' disabled' : '') + '>»</button>';
    $('#dp-aktiflik').value = t.aktiflik;
    $('#dp-aktiflik').onchange = function () { t.aktiflik = this.value; t.sayfa = 1; tabloCiz(); };
    $('#dp-boyut').onchange = function () { t.boyut = Number(this.value); t.sayfa = 1; tabloCiz(); };
    $('#dp-sayfa-no').onchange = function () { t.sayfa = Math.max(1, Math.min(top, Number(this.value) || 1)); tabloCiz(); };
    el.onclick = function (e) {
      var b = e.target.closest('[data-sayfa]'); if (!b || b.disabled) return;
      t.sayfa = { ilk: 1, onceki: t.sayfa - 1, sonraki: t.sayfa + 1, son: top }[b.dataset.sayfa];
      tabloCiz();
      $('.dp-tablo-kap').scrollTop = 0;
    };
  }

  function ozetCiz() {
    var el = $('#dp-ozet'); if (!el) return;
    var u = S.veri.urunler, aktif = u.filter(function (x) { return x.aktif; });
    var stokCihaz = 0, stokAks = 0, deger = 0, ikinci = 0;
    u.forEach(function (x) {
      if (x.kategori === 'aksesuar') stokAks += x.stok; else stokCihaz += x.stok;
      var f = ZI.baslangicFiyati(x); if (f != null && x.stok > 0) deger += f * x.stok;
      if (x.durum === 'ikinci-el' && x.stok > 0) ikinci++;
    });
    var kritik = aktif.filter(function (x) { return x.stok <= 1 && x.rozet !== 'Yakında'; }).length;
    el.innerHTML =
      '<div class="dp-kutu"><small>' + ZI.ikon('kutu') + 'Ürünler</small><b>' + u.length + '</b><span>' + aktif.length + ' sitede · ' + (u.length - aktif.length) + ' gizli</span></div>' +
      '<div class="dp-kutu"><small>' + ZI.ikon('tablo') + 'Toplam stok adedi</small><b>' + ZI.sayi(stokCihaz + stokAks) + '</b><span>' + stokCihaz + ' cihaz · ' + stokAks + ' aksesuar · ' + ikinci + ' ikinci el</span></div>' +
      '<div class="dp-kutu"><small>' + ZI.ikon('etiket') + 'Stok değeri (liste fiyatıyla)</small><b>' + ZI.fiyatYaz(deger) + '</b><span>Fiyatı girilmiş ürünlerin toplamı</span></div>' +
      '<button type="button" class="dp-kutu dp-kutu--koyu" id="dp-kritik"><small>' + ZI.ikon('uyari') + 'Kritik / tükenen stok</small><b>' + kritik + '</b><span>Stoğu 1 ve altında · listelemek için tıklayın</span></button>';
    $('#dp-kritik').onclick = function () { S.t.f.stok = 'az'; S.t.aktiflik = 'aktif'; S.t.sayfa = 1; var s = $('.dp-filtre [data-f="stok"]'); if (s) s.value = 'az'; tabloCiz(); $('.dp-cerceve').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  }

  function bantlarCiz() {
    var el = $('#dp-bantlar'); if (!el) return;
    var b = [], a = GH.ayar();
    function bant(id, sinif, ikon, metin, eylem, eylemMetni) {
      if (S.gizliBant[id]) return;
      b.push('<div class="dp-bant ' + sinif + '" data-bant="' + id + '">' + ZI.ikon(ikon) + '<p>' + metin + '</p>' +
        (eylem ? '<button type="button" class="dp-btn ' + (sinif.indexOf('koyu') > -1 ? 'dp-btn--turuncu' : 'dp-btn--siyah') + '" data-bant-eylem="' + eylem + '">' + k(eylemMetni) + '</button>' : '') +
        '<button type="button" class="dp-bant__kapat" data-bant-kapat="' + id + '" aria-label="Kapat">' + ZI.ikon('carpi') + '</button></div>');
    }
    if (oturum.varsayilan) bant('sifre', 'dp-bant--koyu', 'kilit', '<b>Varsayılan şifreyi kullanıyorsunuz.</b> Siteyi yayına almadan önce yönetici şifrenizi değiştirin.', 'sifre', 'Şifreyi değiştir');
    if (oturum.anahtarCozulemedi) bant('anahtar', 'dp-bant--uyari', 'anahtar', '<b>Depodaki GitHub anahtarı çözülemedi.</b> Ayarlar’dan anahtarı yeniden girin.', 'github', 'Ayarlar');
    if (!a) bant('github', 'dp-bant--uyari', 'bulut', '<b>Değişiklikler şu an yalnızca bu tarayıcıda saklanıyor.</b> Sitenin herkes için güncellenmesi için GitHub bağlantısını bir kez kurun ya da “Yayın paketini indir” ile dosyaları elle yükleyin.', 'github', 'Bağlantıyı kur');
    else if (!oturum.token) bant('token', 'dp-bant--uyari', 'anahtar', '<b>Bu oturumda GitHub anahtarı yok.</b> Yayınlayabilmek için Ayarlar’dan erişim anahtarınızı girin.', 'github', 'Anahtarı gir');
    var ornek = S.veri.urunler.filter(function (u) { return u.ornek; }).length;
    if (ornek) bant('ornek', '', 'bilgi', 'Katalogda <b>' + ornek + ' örnek ürün</b> var (ikinci el cihaz ve genel aksesuar örnekleri, “Örnek” etiketli). Kendi ürünlerinizi ekledikten sonra tek tıkla silebilirsiniz.', 'ornek', 'Örnekleri sil');
    if (S.yayinlanmadi) bant('yayin', '', 'bulut', '<b>' + S.degisiklik + ' yayınlanmamış değişiklik</b> var. Site ziyaretçileri bu değişiklikleri yayınladıktan sonra görür.', 'yayinla', 'Şimdi yayınla');
    el.innerHTML = b.join('');
    el.onclick = function (e) {
      var kapat = e.target.closest('[data-bant-kapat]');
      if (kapat) { S.gizliBant[kapat.dataset.bantKapat] = true; bantlarCiz(); return; }
      var ey = e.target.closest('[data-bant-eylem]'); if (!ey) return;
      var x = ey.dataset.bantEylem;
      if (x === 'sifre') { sekmeAc('ayarlar'); setTimeout(function () { var s = $('#dp-sifre-kart'); if (s) s.scrollIntoView({ behavior: 'smooth' }); }, 120); }
      else if (x === 'github') sekmeAc('ayarlar');
      else if (x === 'ornek') ornekleriSil();
      else if (x === 'yayinla') yayinla();
    };
  }

  function satirMenu(btn, u) {
    var var_ = $('#dp-satir-menu');
    var ayni = var_ && var_.dataset.id === u.id;
    acilirKapat();
    if (ayni) return;
    var m = d.createElement('div');
    m.className = 'dp-acilir acik'; m.id = 'dp-satir-menu'; m.dataset.id = u.id; m.setAttribute('role', 'menu');
    m.style.position = 'fixed';
    m.innerHTML =
      '<button type="button" data-m="duzenle">' + ZI.ikon('kalem') + 'Düzenle</button>' +
      '<button type="button" data-m="stok">' + ZI.ikon('takas') + 'Stok girişi / çıkışı</button>' +
      '<button type="button" data-m="hareket">' + ZI.ikon('gecmis') + 'Stok hareketleri</button>' +
      '<button type="button" data-m="kopya">' + ZI.ikon('kopya') + 'Kopyala</button>' +
      '<a href="' + ZI.urunLink(u) + '" target="_blank" rel="noopener" data-m="gor">' + ZI.ikon('goz') + 'Sitede görüntüle</a>' +
      '<hr><button type="button" data-m="sil" class="tehlike">' + ZI.ikon('cop') + 'Sil</button>';
    d.body.appendChild(m);
    var r = btn.getBoundingClientRect(), mw = m.offsetWidth, mh = m.offsetHeight;
    var ust = r.bottom + 6; if (ust + mh > g.innerHeight - 10) ust = Math.max(10, r.top - mh - 6);
    m.style.top = ust + 'px'; m.style.left = Math.max(10, Math.min(g.innerWidth - mw - 10, r.right - mw)) + 'px'; m.style.right = 'auto';
    btn.setAttribute('aria-expanded', 'true');
    m.addEventListener('click', function (e) {
      var x = e.target.closest('[data-m]'); if (!x) return;
      var ne = x.dataset.m;
      if (ne !== 'gor') e.preventDefault();
      acilirKapat();
      if (ne === 'duzenle') formAc(u);
      else if (ne === 'stok') stokModal(u);
      else if (ne === 'hareket') urunHareketleri(u);
      else if (ne === 'kopya') formAc(u, true);
      else if (ne === 'sil') topluSil([u.id]);
    });
    var ilk = m.querySelector('button'); if (ilk) ilk.focus();
    g.addEventListener('scroll', function kapa() { acilirKapat(); g.removeEventListener('scroll', kapa, true); }, true);
  }

  function topluSil(idler) {
    idler = idler.filter(urunBul);
    if (!idler.length) return;
    var adlar = idler.slice(0, 4).map(function (id) { return '<b>' + k(urunBul(id).ad) + '</b>'; }).join(', ') + (idler.length > 4 ? ' ve ' + (idler.length - 4) + ' ürün daha' : '');
    onayla(idler.length === 1 ? 'Ürün silinsin mi?' : idler.length + ' ürün silinsin mi?', adlar + ' kalıcı olarak silinecek. Bu işlem stok hareketlerine kaydedilir.', 'Sil', true).then(function (e) {
      if (!e) return;
      idler.forEach(function (id) {
        var u = urunBul(id);
        hareketEkle(u, 'silme', -u.stok, u.stok, 0, 'Ürün silindi');
        S.veri.urunler = S.veri.urunler.filter(function (x) { return x.id !== id; });
        S.veri.vitrin.forEach(function (v) { if (v.urunId === id) v.urunId = ''; if (v.urunler) v.urunler = v.urunler.filter(function (x) { return x !== id; }); });
        delete S.secili[id];
      });
      degisti(idler.length + ' ürün silindi.');
      bantlarCiz(); ozetCiz(); tabloCiz();
    });
  }
  function ornekleriSil() {
    var l = S.veri.urunler.filter(function (u) { return u.ornek; });
    if (!l.length) { bildir('Örnek ürün kalmadı.'); return; }
    onayla(l.length + ' örnek ürün silinsin mi?', '“Örnek” etiketli ikinci el cihazlar ve genel aksesuarlar silinecek. Gerçek model bilgileri içeren sıfır ürünler (iPhone, Galaxy, Xiaomi vb.) yerinde kalır; bunların stok ve fiyatlarını kendinize göre güncelleyin.', 'Örnekleri sil', true).then(function (e) {
      if (!e) return;
      l.forEach(function (u) { hareketEkle(u, 'silme', -u.stok, u.stok, 0, 'Örnek ürün silindi'); });
      var idler = l.map(function (u) { return u.id; });
      S.veri.urunler = S.veri.urunler.filter(function (u) { return !u.ornek; });
      S.veri.vitrin.forEach(function (v) { if (v.urunler) v.urunler = v.urunler.filter(function (x) { return idler.indexOf(x) < 0; }); });
      degisti(l.length + ' örnek ürün silindi.');
      if (S.sekme === 'urunler') { bantlarCiz(); ozetCiz(); tabloCiz(); } else sekmeAc(S.sekme);
    });
  }

  /* =====================================================================
     ÜRÜN FORMU (çekmece)
     ===================================================================== */
  function bosUrun() {
    return {
      id: null, kod: '', ad: '', marka: '', seri: '', kategori: 'telefon', altKategori: '', katlanabilir: false, durum: 'sifir', kozmetik: '', rozet: '',
      fiyat: null, secenekler: [], renkler: [], cikisYili: new Date().getFullYear(), cikisTarihi: '', uretimYili: new Date().getFullYear(), pilSagligi: 100,
      degisenParca: 'Değişen parça yok, kapalı kutu', kisaAciklama: '', aciklama: '', ozellikler: {}, gorseller: [], stok: 1, aktif: true, oneCikan: false
    };
  }
  function alan(etiket, ic, o) {
    o = o || {};
    return '<div class="dp-alan' + (o.genis ? ' dp-genis' : '') + '"' + (o.id ? ' id="' + o.id + '"' : '') + (o.gizli ? ' hidden' : '') + '>' +
      (etiket ? '<label' + (o.for ? ' for="' + o.for + '"' : '') + '>' + etiket + (o.zorunlu ? ' <b>*</b>' : '') + '</label>' : '') + ic +
      (o.ipucu ? '<p class="dp-ipucu">' + o.ipucu + '</p>' : '') + '</div>';
  }
  function girdi(ad, deger, o) {
    o = o || {};
    return '<input type="' + (o.tip || 'text') + '" id="f-' + ad + '" name="' + ad + '" value="' + k(deger == null ? '' : deger) + '"' +
      (o.ph ? ' placeholder="' + k(o.ph) + '"' : '') + (o.liste ? ' list="' + o.liste + '"' : '') + (o.min != null ? ' min="' + o.min + '"' : '') +
      (o.max != null ? ' max="' + o.max + '"' : '') + (o.adim ? ' step="' + o.adim + '"' : '') + (o.maks ? ' maxlength="' + o.maks + '"' : '') +
      (o.mod ? ' inputmode="' + o.mod + '"' : '') + ' autocomplete="off">';
  }
  function secim(ad, deger, secenekler) {
    return '<select id="f-' + ad + '" name="' + ad + '">' + secenekler.map(function (s) {
      var v = Array.isArray(s) ? s[0] : s, t = Array.isArray(s) ? s[1] : s;
      return '<option value="' + k(v) + '"' + (String(v) === String(deger == null ? '' : deger) ? ' selected' : '') + '>' + k(t) + '</option>';
    }).join('') + '</select>';
  }
  function segment(ad, deger, secenekler) {
    return '<div class="dp-segment" role="group" data-segment="' + ad + '">' + secenekler.map(function (s) {
      return '<button type="button" data-deger="' + s[0] + '" aria-pressed="' + (s[0] === deger) + '">' + (s[2] ? ZI.ikon(s[2]) + ' ' : '') + k(s[1]) + '</button>';
    }).join('') + '</div><input type="hidden" name="' + ad + '" value="' + k(deger) + '">';
  }
  function anahtar(ad, deger, baslik, alt) {
    return '<label class="dp-satir-anahtar"><span><b>' + k(baslik) + '</b>' + (alt ? '<small>' + k(alt) + '</small>' : '') + '</span>' +
      '<span class="dp-anahtar"><input type="checkbox" name="' + ad + '"' + (deger ? ' checked' : '') + '><span></span></span></label>';
  }

  function formAc(u, kopya) {
    var yeni = !u || !!kopya;
    var f = u ? JSON.parse(JSON.stringify(u)) : bosUrun();
    if (kopya) { f.id = null; f.kod = ''; f.ad = f.ad + ' (kopya)'; f.stok = 0; f.ornek = false; }
    F = { u: f, orijinal: (u && !kopya) ? u : null, gorseller: (f.gorseller || []).slice(), degisti: false };
    var panel = $('.dp-cekmece__panel');
    var secenekler = f.secenekler && f.secenekler.length ? f.secenekler : [{ ad: '', fiyat: f.fiyat }];
    var parcaSecili = PARCA.indexOf(f.degisenParca) > -1 || f.degisenParca === 'Değişen parça yok, kapalı kutu' ? f.degisenParca : (f.degisenParca ? '__diger' : '');

    panel.innerHTML =
      '<header class="dp-cekmece__ust"><h2 id="dp-form-baslik">' + (F.orijinal ? 'Ürünü Düzenle' : (kopya ? 'Ürünü Kopyala' : 'Yeni Ürün Ekle')) + '</h2>' +
      (F.orijinal ? '<span class="dp-etiket">' + k(f.kod) + '</span>' : '') +
      '<button class="dp-btn dp-btn--hayalet dp-btn--kare" type="button" data-kapat aria-label="Kapat">' + ZI.ikon('carpi') + '</button></header>' +
      '<form class="dp-cekmece__govde" id="dp-form" novalidate autocomplete="off">' +

      /* 1 — Görseller */
      '<section class="dp-form-bolum"><h3><i>1</i>Görseller<small>İlk görsel kapak olur</small></h3>' +
      '<div class="dp-yukle" id="dp-yukle">' + ZI.ikon('resim') + '<b>Fotoğrafları sürükleyip bırakın ya da tıklayıp seçin</b><span>JPG, PNG, WEBP · telefon fotoğrafları otomatik küçültülür</span>' +
      '<input type="file" id="dp-dosya" accept="image/*" multiple aria-label="Fotoğraf seç"></div>' +
      '<div class="dp-gorseller" id="dp-gorseller"></div>' +
      '<button type="button" class="dp-ekle-btn" id="dp-cizim-ekle">' + ZI.ikon('arti') + 'Hazır çizim ekle</button>' +
      '<p class="dp-ipucu" style="font-size:12px;color:var(--d-metin-2);margin-top:6px">Fotoğraf eklemezseniz sitede ürün türüne ve ilk renge göre hazır bir çizim gösterilir. Beyaz ya da açık gri zeminli fotoğraflar en iyi sonucu verir.</p>' +
      '</section>' +

      /* 2 — Temel bilgiler */
      '<section class="dp-form-bolum"><h3><i>2</i>Temel bilgiler</h3><div class="dp-izgara">' +
      alan('Ürün adı', girdi('ad', f.ad, { ph: 'Örn. iPhone 17 Pro 256 GB', maks: 90 }), { zorunlu: true, genis: true, for: 'f-ad' }) +
      alan('Marka', girdi('marka', f.marka, { ph: 'Örn. Apple', liste: 'dl-marka' }) + '<datalist id="dl-marka">' + MARKALAR.map(function (m) { return '<option value="' + m + '">'; }).join('') + '</datalist>', { zorunlu: true, for: 'f-marka' }) +
      alan('Seri / model ailesi', girdi('seri', f.seri, { ph: 'Örn. iPhone, Galaxy S', liste: 'dl-seri' }) + '<datalist id="dl-seri">' + SERILER.map(function (m) { return '<option value="' + m + '">'; }).join('') + '</datalist>', { for: 'f-seri' }) +
      alan('Kategori', segment('kategori', f.kategori, [['telefon', 'Telefon', 'ekran'], ['tablet', 'Tablet'], ['laptop', 'Laptop'], ['aksesuar', 'Aksesuar']]), { zorunlu: true, genis: true }) +
      alan('Aksesuar türü', secim('altKategori', f.altKategori || 'kilif', [['kilif', 'Kılıf'], ['sarj', 'Şarj aleti / adaptör / kablo'], ['cam', 'Kırılmaz cam / ekran koruyucu'], ['kulaklik', 'Kulaklık ve diğer aksesuarlar']]), { id: 'k-alt', gizli: f.kategori !== 'aksesuar', for: 'f-altKategori' }) +
      '<div class="dp-alan" id="k-katlanir"' + (f.kategori !== 'telefon' ? ' hidden' : '') + '>' + anahtar('katlanabilir', f.katlanabilir, 'Katlanabilir telefon', 'Galaxy Z, iPhone Duo gibi') + '</div>' +
      alan('Rozet', secim('rozet', f.rozet, [['', 'Yok'], ['Yeni', 'Yeni'], ['Yakında', 'Yakında'], ['Fırsat', 'Fırsat']]), { for: 'f-rozet', ipucu: '“Yeni” rozeti turuncu renkte gösterilir.' }) +
      alan('Ürün kodu', girdi('kod', f.kod, { ph: 'Boş bırakın, otomatik verilsin', maks: 24 }), { for: 'f-kod' }) +
      alan('Kısa açıklama', girdi('kisaAciklama', f.kisaAciklama, { ph: 'Kartlarda görünen tek satır', maks: 110 }), { genis: true, for: 'f-kisaAciklama' }) +
      alan('Açıklama', '<textarea id="f-aciklama" name="aciklama" rows="3" placeholder="Ürün sayfasında görünen açıklama (kutu içeriği, kullanım durumu vb.)">' + k(f.aciklama) + '</textarea>', { genis: true, for: 'f-aciklama' }) +
      '</div></section>' +

      /* 3 — Durum */
      '<section class="dp-form-bolum"><h3><i>3</i>Durum, pil ve geçmiş</h3><div class="dp-izgara">' +
      alan('Ürün durumu', segment('durum', f.durum, [['sifir', 'Sıfır / Kapalı kutu', 'kutu'], ['ikinci-el', 'İkinci el', 'etiket']]), { zorunlu: true, genis: true }) +
      alan('Kozmetik durum', secim('kozmetik', f.kozmetik || 'Temiz', KOZMETIK), { id: 'k-kozmetik', gizli: f.durum !== 'ikinci-el', for: 'f-kozmetik', ipucu: 'Sitede “2. El – Temiz” gibi gösterilir.' }) +
      alan('Pil sağlığı', '<div class="dp-pil-kaydirici"><input type="range" min="0" max="100" value="' + (f.pilSagligi == null ? 100 : f.pilSagligi) + '" id="f-pil-kaydir" aria-label="Pil sağlığı kaydırıcı"><div class="dp-birim">' + girdi('pilSagligi', f.pilSagligi, { tip: 'number', min: 0, max: 100, mod: 'numeric' }) + '<span>%</span></div></div>', { id: 'k-pil', genis: true, for: 'f-pilSagligi', ipucu: 'Aksesuarlarda boş bırakın.' }) +
      alan('Değişen parça', secim('parcaSecim', parcaSecili, [['Değişen parça yok, kapalı kutu', 'Değişen parça yok (kapalı kutu)']].concat(PARCA.map(function (p) { return [p, p]; })).concat([['__diger', 'Diğer (açıklayın)…'], ['', 'Belirtme']])) +
        '<input type="text" id="f-parcaDiger" name="parcaDiger" value="' + k(parcaSecili === '__diger' ? f.degisenParca : '') + '" placeholder="Örn. Şarj soketi değişti" style="margin-top:8px"' + (parcaSecili === '__diger' ? '' : ' hidden') + '>', { genis: true, for: 'f-parcaSecim' }) +
      alan('Çıkış yılı', girdi('cikisYili', f.cikisYili, { tip: 'number', min: 2000, max: 2100, mod: 'numeric' }), { for: 'f-cikisYili' }) +
      alan('Üretim yılı', girdi('uretimYili', f.uretimYili, { tip: 'number', min: 2000, max: 2100, mod: 'numeric' }), { for: 'f-uretimYili', ipucu: 'Bu cihazın üretildiği yıl.' }) +
      alan('Çıkış tarihi (isteğe bağlı)', girdi('cikisTarihi', f.cikisTarihi, { ph: 'Örn. Eylül 2026' }), { genis: true, for: 'f-cikisTarihi' }) +
      '</div></section>' +

      /* 4 — Fiyat ve stok */
      '<section class="dp-form-bolum"><h3><i>4</i>Fiyat ve stok</h3>' +
      '<div class="dp-alan"><span class="dp-etiketi">Seçenekler ve fiyatlar</span><div class="dp-tekrar" id="dp-secenekler">' + secenekler.map(secenekSatiri).join('') + '</div>' +
      '<button type="button" class="dp-ekle-btn" id="dp-secenek-ekle">' + ZI.ikon('arti') + 'Seçenek ekle</button>' +
      '<p class="dp-ipucu">Depolama gibi seçenekler için her satıra ad ve fiyat girin (ör. 256 GB — 99.999). Tek fiyatlı üründe adı boş bırakabilirsiniz. Fiyatı boş bırakılan seçenekte “Fiyat için arayın” yazar.</p></div>' +
      '<div class="dp-izgara" style="margin-top:14px">' +
      alan(F.orijinal ? 'Stok adedi' : 'Açılış stoğu', '<div class="dp-birim">' + girdi('stok', f.stok, { tip: 'number', min: 0, mod: 'numeric' }) + '<span>adet</span></div>', { for: 'f-stok', ipucu: F.orijinal ? 'Buradaki değişiklik “stok düzeltme” olarak kaydedilir. Satış ve alımlar için tablodaki stok düğmesini kullanın.' : 'Eklenen ürünün mağazadaki adedi.' }) +
      '<div class="dp-alan" style="display:grid;gap:8px">' + anahtar('aktif', f.aktif, 'Sitede göster', 'Kapalıysa ürün sitede görünmez') + anahtar('oneCikan', f.oneCikan, 'Ana sayfada öne çıkar', '“Öne çıkan cihazlar” bölümünde') + '</div>' +
      '</div></section>' +

      /* 5 — Renkler */
      '<section class="dp-form-bolum"><h3><i>5</i>Renkler<small>Sitede renk seçici olarak görünür</small></h3>' +
      '<div class="dp-tekrar" id="dp-renkler">' + (f.renkler.length ? f.renkler : [{ ad: '', kod: '#1d1d1f' }]).map(renkSatiri).join('') + '</div>' +
      '<button type="button" class="dp-ekle-btn" id="dp-renk-ekle">' + ZI.ikon('arti') + 'Renk ekle</button></section>' +

      /* 6 — Teknik özellikler */
      '<section class="dp-form-bolum"><h3><i>6</i>Sistem ve teknik özellikler</h3><div class="dp-izgara" id="dp-ozellikler"></div></section>' +
      '</form>' +
      '<footer class="dp-cekmece__alt"><span class="dp-not">* zorunlu alan</span><button class="dp-btn dp-btn--cizgi dp-btn--buyuk" type="button" data-kapat>Vazgeç</button>' +
      '<button class="dp-btn dp-btn--turuncu dp-btn--buyuk" type="submit" form="dp-form">' + ZI.ikon('tik') + (F.orijinal ? 'Kaydet' : 'Ürünü Ekle') + '</button></footer>';

    ozellikAlanlari(f.kategori, f.ozellikler);
    gorselleriCiz();
    formOlaylari();
    cekmeceAc();
  }
  function secenekSatiri(s) {
    return '<div class="dp-tekrar__satir"><input class="dp-girdi" type="text" data-s="ad" value="' + k(s.ad || '') + '" placeholder="Seçenek (ör. 256 GB)" aria-label="Seçenek adı">' +
      '<div class="dp-birim"><input class="dp-girdi" type="text" inputmode="numeric" data-s="fiyat" value="' + (s.fiyat != null && s.fiyat !== '' ? k(ZI.sayi(s.fiyat)) : '') + '" placeholder="Fiyat" aria-label="Fiyat"><span>TL</span></div>' +
      '<button type="button" class="dp-sil-btn" data-sil-satir aria-label="Seçeneği kaldır">' + ZI.ikon('carpi') + '</button></div>';
  }
  function renkSatiri(r) {
    return '<div class="dp-tekrar__satir dp-tekrar__satir--renk"><input type="color" data-r="kod" value="' + k(/^#[0-9a-f]{6}$/i.test(r.kod || '') ? r.kod : '#1d1d1f') + '" aria-label="Renk">' +
      '<input class="dp-girdi" type="text" data-r="ad" value="' + k(r.ad || '') + '" placeholder="Renk adı (ör. Gece Mavisi)" aria-label="Renk adı">' +
      '<button type="button" class="dp-sil-btn" data-sil-satir aria-label="Rengi kaldır">' + ZI.ikon('carpi') + '</button></div>';
  }
  function ozellikAlanlari(kategori, mevcut) {
    var liste = kategori === 'aksesuar' ? OZ_AKSESUAR : OZ_CIHAZ;
    var el = $('#dp-ozellikler');
    var eski = {};
    $$('[data-oz]', el).forEach(function (i) { eski[i.dataset.oz] = i.value; });
    var degerler = Object.assign({}, mevcut || {}, eski);
    var goster = liste.map(function (x) { return x[0]; });
    Object.keys(degerler).forEach(function (a) { if (degerler[a] && goster.indexOf(a) < 0) goster.push(a); });
    el.innerHTML = goster.map(function (a) {
      var tanim = liste.filter(function (x) { return x[0] === a; })[0];
      var ad = tanim ? tanim[1] : (OZ_ADLAR[a] || a), ph = tanim ? tanim[2] : '';
      var uzun = a === 'ekran' || a === 'kamera' || a === 'diger';
      return '<div class="dp-alan' + (uzun ? ' dp-genis' : '') + '"><label for="oz-' + a + '">' + k(ad) + '</label>' +
        (uzun ? '<textarea id="oz-' + a + '" data-oz="' + a + '" rows="2" placeholder="' + k(ph) + '">' + k(degerler[a] || '') + '</textarea>'
          : '<input type="text" id="oz-' + a + '" data-oz="' + a + '" value="' + k(degerler[a] || '') + '" placeholder="' + k(ph) + '">') + '</div>';
    }).join('');
  }
  function formRenk() { var r = $('#dp-renkler [data-r="kod"]'); return r ? r.value : null; }
  function gorselleriCiz() {
    var el = $('#dp-gorseller'); if (!el) return;
    var renk = formRenk();
    el.innerHTML = F.gorseller.map(function (x, i) {
      var src = typeof x === 'string' ? x : ZI.cizim.url(Object.assign({}, x, renk && !x.sabitRenk ? { renk: renk } : {}));
      var foto = typeof x === 'string' && !/\.svg(\?|$)/i.test(x);
      return '<div class="dp-gorsel" data-i="' + i + '">' + (i === 0 ? '<span class="dp-gorsel__kapak">Kapak</span>' : '') +
        '<img src="' + k(src) + '" alt="Görsel ' + (i + 1) + '"' + (foto ? ' class="foto"' : '') + '>' +
        '<div class="dp-gorsel__arac">' +
        (i > 0 ? '<button type="button" data-g="sol" aria-label="Sola taşı">' + ZI.ikon('sol') + '</button>' : '') +
        (i > 0 ? '<button type="button" data-g="kapak" aria-label="Kapak yap" title="Kapak yap">' + ZI.ikon('yildiz') + '</button>' : '') +
        (i < F.gorseller.length - 1 ? '<button type="button" data-g="sag" aria-label="Sağa taşı">' + ZI.ikon('sag') + '</button>' : '') +
        '<button type="button" class="sil" data-g="sil" aria-label="Görseli kaldır">' + ZI.ikon('cop') + '</button></div></div>';
    }).join('');
  }
  function gorselIsle(dosya) {
    return new Promise(function (coz, reddet) {
      if (!/^image\//i.test(dosya.type || '') && !/\.(jpe?g|png|webp|gif|avif|heic|heif)$/i.test(dosya.name || '')) return reddet(new Error((dosya.name || 'Dosya') + ': görsel dosyası değil.'));
      if (dosya.size > 30 * 1024 * 1024) return reddet(new Error(dosya.name + ': dosya çok büyük (30 MB üstü).'));
      var url = URL.createObjectURL(dosya), img = new Image();
      img.onload = function () {
        var max = 1400, w = img.naturalWidth, h = img.naturalHeight, o = Math.min(1, max / Math.max(w, h));
        var c = d.createElement('canvas'); c.width = Math.max(1, Math.round(w * o)); c.height = Math.max(1, Math.round(h * o));
        var x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
        x.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        var sonuc = c.toDataURL('image/webp', 0.84);
        if (sonuc.indexOf('data:image/webp') !== 0) {
          x.globalCompositeOperation = 'destination-over'; x.fillStyle = '#ffffff'; x.fillRect(0, 0, c.width, c.height);
          sonuc = c.toDataURL('image/jpeg', 0.86);
        }
        coz(sonuc);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reddet(new Error((dosya.name || 'Dosya') + ': açılamadı. HEIC ise telefonda JPG olarak kaydedip tekrar deneyin.')); };
      img.src = url;
    });
  }
  function dosyalariEkle(liste) {
    var dosyalar = Array.prototype.slice.call(liste || []);
    if (!dosyalar.length) return;
    var el = $('#dp-gorseller');
    var yer = dosyalar.map(function () { var x = d.createElement('div'); x.className = 'dp-gorsel yukleniyor'; el.appendChild(x); return x; });
    var sira = Promise.resolve();
    dosyalar.forEach(function (f, i) {
      sira = sira.then(function () {
        return gorselIsle(f).then(function (veri) { F.gorseller.push(veri); F.degisti = true; }, function (e) { bildir(e.message, true); }).then(function () { yer[i].remove(); });
      });
    });
    sira.then(function () { gorselleriCiz(); });
  }
  function formOlaylari() {
    var form = $('#dp-form');
    form.addEventListener('input', function () { F.degisti = true; });
    form.addEventListener('click', function (e) {
      var sg = e.target.closest('[data-segment] button');
      if (sg) {
        var grup = sg.closest('[data-segment]'), ad = grup.dataset.segment;
        $$('button', grup).forEach(function (b) { b.setAttribute('aria-pressed', b === sg ? 'true' : 'false'); });
        form.querySelector('input[name="' + ad + '"]').value = sg.dataset.deger;
        F.degisti = true;
        if (ad === 'kategori') {
          var kat = sg.dataset.deger;
          $('#k-alt').hidden = kat !== 'aksesuar';
          $('#k-katlanir').hidden = kat !== 'telefon';
          var psec = $('#f-parcaSecim');
          if (kat === 'aksesuar') {
            var p = $('#f-pilSagligi'); if (p && String(p.value) === '100') { p.value = ''; }
            if (psec.value === 'Değişen parça yok, kapalı kutu') psec.value = '';
          } else if (psec.value === '') {
            psec.value = form.querySelector('input[name="durum"]').value === 'ikinci-el' ? PARCA[0] : 'Değişen parça yok, kapalı kutu';
            var pp = $('#f-pilSagligi'); if (pp && pp.value === '') { pp.value = 100; $('#f-pil-kaydir').value = 100; }
          }
          ozellikAlanlari(kat, {});
        }
        if (ad === 'durum') {
          var ikinci = sg.dataset.deger === 'ikinci-el';
          $('#k-kozmetik').hidden = !ikinci;
          var ps = $('#f-parcaSecim');
          if (ikinci && ps.value === 'Değişen parça yok, kapalı kutu') ps.value = PARCA[0];
          if (!ikinci && ps.value === PARCA[0]) ps.value = 'Değişen parça yok, kapalı kutu';
          if (!ikinci) { $('#f-pilSagligi').value = 100; $('#f-pil-kaydir').value = 100; }
        }
        return;
      }
      var sil = e.target.closest('[data-sil-satir]');
      if (sil) {
        var liste = sil.closest('.dp-tekrar');
        if (liste.children.length > 1) sil.closest('.dp-tekrar__satir').remove();
        else $$('input', sil.closest('.dp-tekrar__satir')).forEach(function (i) { if (i.type !== 'color') i.value = ''; });
        F.degisti = true;
        if (liste.id === 'dp-renkler') gorselleriCiz();
        return;
      }
      if (e.target.closest('#dp-secenek-ekle')) { $('#dp-secenekler').insertAdjacentHTML('beforeend', secenekSatiri({})); $('#dp-secenekler .dp-tekrar__satir:last-child input').focus(); return; }
      if (e.target.closest('#dp-renk-ekle')) { $('#dp-renkler').insertAdjacentHTML('beforeend', renkSatiri({ kod: '#8e8e93' })); $('#dp-renkler .dp-tekrar__satir:last-child [data-r="ad"]').focus(); return; }
      if (e.target.closest('#dp-cizim-ekle')) {
        var kat2 = form.querySelector('input[name="kategori"]').value;
        var taslak = { kategori: kat2, altKategori: $('#f-altKategori').value, katlanabilir: form.querySelector('input[name="katlanabilir"]').checked, marka: $('#f-marka').value.trim() };
        var adaylar = ZI.cizim.varsayilan(taslak);
        var mevcut = F.gorseller.map(function (x) { return typeof x === 'string' ? x : JSON.stringify(x); });
        var eklenecek = adaylar.filter(function (a) { return mevcut.indexOf(JSON.stringify(a)) < 0; })[0] || adaylar[0];
        F.gorseller.push(eklenecek); F.degisti = true; gorselleriCiz();
        return;
      }
      var gb = e.target.closest('[data-g]');
      if (gb) {
        var i = Number(gb.closest('.dp-gorsel').dataset.i), l = F.gorseller, x = l[i];
        if (gb.dataset.g === 'sil') l.splice(i, 1);
        else if (gb.dataset.g === 'sol' && i > 0) { l[i] = l[i - 1]; l[i - 1] = x; }
        else if (gb.dataset.g === 'sag' && i < l.length - 1) { l[i] = l[i + 1]; l[i + 1] = x; }
        else if (gb.dataset.g === 'kapak') { l.splice(i, 1); l.unshift(x); }
        F.degisti = true; gorselleriCiz();
      }
    });
    form.addEventListener('change', function (e) {
      if (e.target.id === 'f-parcaSecim') { var dg = $('#f-parcaDiger'); dg.hidden = e.target.value !== '__diger'; if (!dg.hidden) dg.focus(); }
      if (e.target.id === 'dp-dosya') { dosyalariEkle(e.target.files); e.target.value = ''; }
      if (e.target.matches('[data-r="kod"]')) gorselleriCiz();
      if (e.target.matches('[data-s="fiyat"]')) { var n = sayiAl(e.target.value); e.target.value = n == null ? '' : ZI.sayi(n); }
    });
    var kay = $('#f-pil-kaydir'), pil = $('#f-pilSagligi');
    kay.addEventListener('input', function () { pil.value = kay.value; });
    pil.addEventListener('input', function () { if (pil.value !== '') kay.value = Math.max(0, Math.min(100, Number(pil.value))); });
    var yk = $('#dp-yukle');
    ['dragenter', 'dragover'].forEach(function (t) { yk.addEventListener(t, function (e) { e.preventDefault(); yk.classList.add('surukle'); }); });
    ['dragleave', 'drop'].forEach(function (t) { yk.addEventListener(t, function (e) { e.preventDefault(); yk.classList.remove('surukle'); }); });
    yk.addEventListener('drop', function (e) { dosyalariEkle(e.dataTransfer.files); });
    form.addEventListener('submit', function (e) { e.preventDefault(); formKaydet(); });
  }

  function formTopla() {
    var form = $('#dp-form'), hatalar = [];
    function deger(ad) { var el = form.querySelector('[name="' + ad + '"]'); return el ? (el.type === 'checkbox' ? el.checked : el.value) : null; }
    var u = F.u;
    var ad = String(deger('ad') || '').trim(), marka = String(deger('marka') || '').trim();
    if (!ad) hatalar.push(['ad', 'Ürün adı gerekli.']);
    if (!marka) hatalar.push(['marka', 'Marka gerekli (bilinmiyorsa “Diğer” yazın).']);
    var kod = String(deger('kod') || '').trim();
    if (kod && S.veri.urunler.some(function (x) { return x.kod === kod && (!F.orijinal || x !== F.orijinal); })) hatalar.push(['kod', 'Bu ürün kodu başka bir üründe kullanılıyor.']);
    var pilH = deger('pilSagligi'), pil = pilH === '' ? null : Number(pilH);
    if (pil != null && (isNaN(pil) || pil < 0 || pil > 100)) hatalar.push(['pilSagligi', 'Pil sağlığı 0 ile 100 arasında olmalı.']);
    var stok = Number(deger('stok'));
    if (deger('stok') === '' || isNaN(stok) || stok < 0 || Math.floor(stok) !== stok) hatalar.push(['stok', 'Stok 0 veya daha büyük bir tam sayı olmalı.']);
    var secenekler = $$('#dp-secenekler .dp-tekrar__satir').map(function (s) {
      return { ad: $('[data-s="ad"]', s).value.trim(), fiyat: sayiAl($('[data-s="fiyat"]', s).value) };
    }).filter(function (s) { return s.ad || s.fiyat != null; });
    if (secenekler.some(function (s) { return s.fiyat != null && s.fiyat < 0; })) hatalar.push(['dp-secenekler', 'Fiyat negatif olamaz.']);
    var fiyat = null;
    if (secenekler.length === 1 && !secenekler[0].ad) { fiyat = secenekler[0].fiyat; secenekler = []; }
    var renkler = $$('#dp-renkler .dp-tekrar__satir').map(function (s) { return { ad: $('[data-r="ad"]', s).value.trim(), kod: $('[data-r="kod"]', s).value }; }).filter(function (r) { return r.ad; });
    var oz = {};
    $$('[data-oz]', form).forEach(function (i) { var v = i.value.trim(); if (v) oz[i.dataset.oz] = v; });
    var ps = deger('parcaSecim'), parca = ps === '__diger' ? String(deger('parcaDiger') || '').trim() : ps;
    var kategori = deger('kategori'), durum = deger('durum');
    var yil = function (v) { var n = Number(v); return v === '' || isNaN(n) ? null : n; };
    return {
      hatalar: hatalar,
      u: Object.assign({}, u, {
        ad: ad, marka: marka, seri: String(deger('seri') || '').trim(), kategori: kategori,
        altKategori: kategori === 'aksesuar' ? deger('altKategori') : '', katlanabilir: kategori === 'telefon' && !!deger('katlanabilir'),
        durum: durum, kozmetik: durum === 'ikinci-el' ? deger('kozmetik') : '', rozet: deger('rozet'), kod: kod,
        kisaAciklama: String(deger('kisaAciklama') || '').trim(), aciklama: String(deger('aciklama') || '').trim(),
        pilSagligi: pil, degisenParca: parca || '', cikisYili: yil(deger('cikisYili')), uretimYili: yil(deger('uretimYili')), cikisTarihi: String(deger('cikisTarihi') || '').trim(),
        secenekler: secenekler, fiyat: fiyat, stok: isNaN(stok) ? 0 : stok, aktif: !!deger('aktif'), oneCikan: !!deger('oneCikan'),
        renkler: renkler, ozellikler: oz, gorseller: F.gorseller.slice()
      })
    };
  }
  function formKaydet() {
    var sonuc = formTopla();
    $$('.dp-alan.hata', $('#dp-form')).forEach(function (a) { a.classList.remove('hata'); var h = a.querySelector('.dp-hata'); if (h) h.remove(); });
    if (sonuc.hatalar.length) {
      sonuc.hatalar.forEach(function (h) {
        var el = d.getElementById('f-' + h[0]) || d.getElementById(h[0]);
        var a = el && el.closest('.dp-alan');
        if (a) { a.classList.add('hata'); a.insertAdjacentHTML('beforeend', '<p class="dp-hata">' + k(h[1]) + '</p>'); }
      });
      var ilk = $('.dp-alan.hata input, .dp-alan.hata select', $('#dp-form'));
      if (ilk) { ilk.focus(); ilk.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      bildir(sonuc.hatalar[0][1], true);
      return;
    }
    var u = sonuc.u, zaman = simdi();
    if (!F.orijinal) {
      u.id = benzersizId(u);
      u.kod = u.kod || yeniKod();
      u.eklenme = zaman; u.guncelleme = zaman; u.ornek = false;
      S.veri.urunler.unshift(u);
      hareketEkle(u, 'olusturma', u.stok, 0, u.stok, 'Ürün eklendi');
      cekmeceKapat(true);
      degisti('“' + u.ad + '” eklendi. Siteye aktarmak için “Yayınla”ya basın.');
    } else {
      var o = F.orijinal, eskiStok = o.stok;
      var id = o.id, eklenme = o.eklenme;
      Object.keys(o).forEach(function (a) { delete o[a]; });
      Object.assign(o, u, { id: id, kod: u.kod || yeniKod(), eklenme: eklenme, guncelleme: zaman, ornek: false });
      if (eskiStok !== o.stok) hareketEkle(o, 'duzeltme', o.stok - eskiStok, eskiStok, o.stok, 'Ürün düzenlenirken stok güncellendi');
      cekmeceKapat(true);
      degisti('“' + o.ad + '” kaydedildi.');
    }
    if (S.sekme === 'urunler') { bantlarCiz(); ozetCiz(); tabloCiz(); }
  }
  function benzersizId(u) {
    var taban = ZI.kisaAd(u.ad).slice(0, 60) + (u.durum === 'ikinci-el' ? '-2el' : '');
    if (!taban || taban === '-2el') taban = 'urun' + taban;
    var id = taban, n = 2;
    while (S.veri.urunler.some(function (x) { return x.id === id; })) id = taban + '-' + (n++);
    return id;
  }
  function yeniKod() {
    var max = 1000;
    S.veri.urunler.forEach(function (x) { var m = /(\d+)\s*$/.exec(x.kod || ''); if (m) max = Math.max(max, Number(m[1])); });
    return 'ZI-' + (max + 1);
  }
  function cekmeceAc() {
    var c = $('#dp-cekmece');
    c.classList.add('acik'); c.setAttribute('aria-hidden', 'false');
    d.body.style.overflow = 'hidden';
    setTimeout(function () { var i = $('#f-ad'); if (i) i.focus({ preventScroll: true }); }, 380);
  }
  function cekmeceKapat(zorla) {
    var c = $('#dp-cekmece');
    if (!c.classList.contains('acik')) return;
    var dev = (!zorla && F && F.degisti) ? onayla('Değişiklikler kaydedilmedi', 'Formda kaydedilmemiş değişiklikler var. Kapatmak istediğinize emin misiniz?', 'Kaydetmeden kapat', true) : Promise.resolve(true);
    dev.then(function (e) {
      if (!e) return;
      c.classList.remove('acik'); c.setAttribute('aria-hidden', 'true');
      d.body.style.overflow = '';
      F = null;
    });
  }
  $('#dp-cekmece').addEventListener('click', function (e) { if (e.target.closest('[data-kapat]')) cekmeceKapat(); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('#dp-cekmece').classList.contains('acik') && !$('#dp-modal').classList.contains('acik')) cekmeceKapat(); });

  /* =====================================================================
     STOK HAREKETLERİ
     ===================================================================== */
  function stokModal(u) {
    var tip = 'giris';
    modal({
      ikon: 'takas', baslik: 'Stok girişi / çıkışı',
      metin: '<b>' + k(u.ad) + '</b> · ' + k(u.kod) + '<br>Mevcut stok: <b>' + u.stok + ' adet</b>',
      icerik: '<div style="display:grid;gap:14px;margin-top:18px">' +
        '<div class="dp-segment" id="m-tip" role="group" aria-label="İşlem türü"><button type="button" data-tip="giris" aria-pressed="true">' + ZI.ikon('arti') + ' Stok girişi</button><button type="button" data-tip="cikis" aria-pressed="false">− Stok çıkışı</button></div>' +
        '<div class="dp-izgara"><div class="dp-alan"><label for="m-adet">Adet</label><input type="number" id="m-adet" min="1" step="1" value="1" inputmode="numeric"></div>' +
        '<div class="dp-alan"><label for="m-not">Açıklama</label><input type="text" id="m-not" list="m-notlar" placeholder="Örn. Satış"><datalist id="m-notlar"><option value="Satış"><option value="Tedarikçiden alım"><option value="Takas ile alındı"><option value="Müşteri iadesi"><option value="Sayım düzeltmesi"><option value="Arızalı / fire"></datalist></div></div>' +
        '<p class="dp-ipucu" id="m-sonuc" style="font-size:14px"></p></div>',
      butonlar: [{ metin: 'Vazgeç', deger: 'iptal', sinif: 'dp-btn--cizgi' }, { metin: 'Kaydet', deger: 'kaydet', sinif: 'dp-btn--turuncu', varsayilan: true }],
      acildi: function (kutu) {
        function guncelle() {
          var n = Math.floor(Number($('#m-adet', kutu).value) || 0);
          var yeni = tip === 'giris' ? u.stok + n : u.stok - n;
          $('#m-sonuc', kutu).innerHTML = 'Yeni stok: <b style="color:' + (yeni < 0 ? 'var(--d-kirmizi)' : 'var(--d-metin)') + '">' + yeni + ' adet</b>' + (yeni < 0 ? ' — stok eksiye düşemez' : '');
        }
        $('#m-tip', kutu).addEventListener('click', function (e) {
          var b = e.target.closest('[data-tip]'); if (!b) return;
          tip = b.dataset.tip;
          $$('[data-tip]', kutu).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          if (tip === 'cikis' && !$('#m-not', kutu).value) $('#m-not', kutu).value = 'Satış';
          if (tip === 'giris' && $('#m-not', kutu).value === 'Satış') $('#m-not', kutu).value = '';
          guncelle();
        });
        $('#m-adet', kutu).addEventListener('input', guncelle);
        guncelle();
      },
      dogrula: function (kutu) {
        var n = Number($('#m-adet', kutu).value);
        if (!n || n < 1 || Math.floor(n) !== n) { bildir('Adet 1 veya daha büyük bir tam sayı olmalı.', true); return false; }
        if (tip === 'cikis' && n > u.stok) { bildir('Stokta yalnızca ' + u.stok + ' adet var.', true); return false; }
      },
      topla: function (kutu) { return { tip: tip, adet: Number($('#m-adet', kutu).value), not: $('#m-not', kutu).value.trim() }; }
    }).then(function (r) {
      if (!r) return;
      var once = u.stok;
      u.stok = r.tip === 'giris' ? once + r.adet : once - r.adet;
      u.guncelleme = simdi();
      hareketEkle(u, r.tip, r.tip === 'giris' ? r.adet : -r.adet, once, u.stok, r.not || (r.tip === 'giris' ? 'Stok girişi' : 'Stok çıkışı'));
      degisti(u.ad + ': stok ' + once + ' → ' + u.stok);
      if (S.sekme === 'urunler') { ozetCiz(); tabloCiz(); bantlarCiz(); }
    });
  }
  function hareketSatiri(h, urunGoster) {
    var t = HAREKET[h.tip] || [h.tip, 'ornek'];
    var adet = Number(h.adet) || 0;
    return '<tr><td data-h="tarih">' + k(tarihYaz(h.tarih)) + '</td>' +
      (urunGoster ? '<td data-h="urun"><b>' + k(h.urunAd) + '</b><span class="dp-alt-metin">' + k(h.urunKod || '') + '</span></td>' : '') +
      '<td><span class="dp-rozet dp-rozet--' + t[1] + '">' + k(t[0]) + '</span></td>' +
      '<td class="sag"><span class="dp-sayi" style="color:' + (adet > 0 ? 'var(--d-yesil)' : (adet < 0 ? 'var(--d-kirmizi)' : 'inherit')) + '">' + (adet > 0 ? '+' : '') + adet + '</span></td>' +
      '<td class="orta"><span class="dp-sayi">' + (h.onceki != null ? h.onceki : '—') + ' → ' + (h.sonraki != null ? h.sonraki : '—') + '</span></td>' +
      '<td style="white-space:normal">' + k(h.not || '') + '</td><td>' + k(h.kullanici || '') + '</td></tr>';
  }
  function urunHareketleri(u) {
    var l = S.hareketler.filter(function (h) { return h.urunId === u.id; });
    modal({
      genis: true, ikon: 'gecmis', baslik: 'Stok hareketleri', metin: '<b>' + k(u.ad) + '</b> · ' + k(u.kod) + ' · Mevcut stok: <b>' + u.stok + '</b>',
      icerik: '<div class="dp-tablo-kap" style="max-height:52vh;margin-top:14px"><table class="dp-tablo dp-tablo--hareket"><thead><tr><th><span class="dp-th">Tarih</span></th><th><span class="dp-th">İşlem</span></th><th class="sag"><span class="dp-th">Adet</span></th><th class="orta"><span class="dp-th">Stok</span></th><th><span class="dp-th">Açıklama</span></th><th><span class="dp-th">Kullanıcı</span></th></tr></thead><tbody>' +
        (l.length ? l.map(function (h) { return hareketSatiri(h, false); }).join('') : '<tr class="dp-bos-satir"><td colspan="6">Bu ürün için kayıtlı hareket yok.</td></tr>') + '</tbody></table></div>',
      butonlar: [{ metin: 'Kapat', deger: 'iptal', sinif: 'dp-btn--cizgi' }, { metin: 'Stok girişi / çıkışı', deger: 'stok', sinif: 'dp-btn--turuncu', varsayilan: true }]
    }).then(function (v) { if (v === 'stok') stokModal(u); });
  }
  function hareketlerSekmesi() {
    var h = S.h;
    $('#dp-ana').innerHTML =
      '<div class="dp-sayfa-baslik"><div><h1>Stok Hareketleri</h1><p>Ürün ekleme, stok girişi, stok çıkışı (satış), düzeltme ve silme kayıtları.</p></div>' +
      '<button class="dp-btn dp-btn--siyah dp-btn--buyuk" type="button" id="dp-h-csv">' + ZI.ikon('tablo') + 'Excel’e aktar (CSV)</button></div>' +
      '<section class="dp-cerceve"><div class="dp-cerceve__ust"><span class="dp-cerceve__baslik">Hareket Kayıtları</span><div class="dp-arac">' +
      '<label class="dp-arama">' + ZI.ikon('ara') + '<span class="zi-gizli">Harekette ara</span><input type="search" id="dp-h-ara" placeholder="Ürün adı, kod veya açıklama" value="' + k(h.q) + '"></label>' +
      '<label class="dp-secim dp-secim--koyu"><span class="zi-gizli">İşlem türü</span><select id="dp-h-tip"><option value="">Tüm işlemler</option>' + Object.keys(HAREKET).map(function (x) { return '<option value="' + x + '"' + (h.tip === x ? ' selected' : '') + '>' + HAREKET[x][0] + '</option>'; }).join('') + '</select>' + ZI.ikon('asagi') + '</label>' +
      '</div></div>' +
      '<div class="dp-tablo-kap"><table class="dp-tablo dp-tablo--hareket"><thead><tr><th><span class="dp-th">Tarih</span></th><th><span class="dp-th">Ürün</span></th><th><span class="dp-th">İşlem</span></th><th class="sag"><span class="dp-th" style="justify-content:flex-end">Adet</span></th><th class="orta"><span class="dp-th" style="justify-content:center">Stok (önce → sonra)</span></th><th><span class="dp-th">Açıklama</span></th><th><span class="dp-th">Kullanıcı</span></th></tr></thead><tbody id="dp-h-govde"></tbody></table></div>' +
      '<div class="dp-sayfalama" id="dp-h-sayfalama"></div></section>';
    function ciz() {
      var q = ZI.normalMetin(h.q);
      var l = S.hareketler.filter(function (x) {
        if (h.tip && x.tip !== h.tip) return false;
        if (q && ZI.normalMetin([x.urunAd, x.urunKod, x.not, x.kullanici].join(' ')).indexOf(q) < 0) return false;
        return true;
      });
      var boy = 50, top = Math.max(1, Math.ceil(l.length / boy));
      if (h.sayfa > top) h.sayfa = top;
      var parca = l.slice((h.sayfa - 1) * boy, h.sayfa * boy);
      $('#dp-h-govde').innerHTML = parca.length ? parca.map(function (x) { return hareketSatiri(x, true); }).join('') : '<tr class="dp-bos-satir"><td colspan="7">Kayıt bulunamadı.</td></tr>';
      $('#dp-h-sayfalama').innerHTML = '<span class="dp-sayfalama__bilgi">' + l.length + ' kayıt</span>' +
        '<button class="dp-sayfa-btn" type="button" data-hs="-1"' + (h.sayfa <= 1 ? ' disabled' : '') + ' aria-label="Önceki sayfa">' + ZI.ikon('sol') + '</button>' +
        '<span class="dp-sayfa-no">' + h.sayfa + ' / ' + top + '</span>' +
        '<button class="dp-sayfa-btn" type="button" data-hs="1"' + (h.sayfa >= top ? ' disabled' : '') + ' aria-label="Sonraki sayfa">' + ZI.ikon('sag') + '</button>';
    }
    $('#dp-h-ara').addEventListener('input', function () { h.q = this.value; h.sayfa = 1; ciz(); });
    $('#dp-h-tip').addEventListener('change', function () { h.tip = this.value; h.sayfa = 1; ciz(); });
    $('#dp-h-sayfalama').addEventListener('click', function (e) { var b = e.target.closest('[data-hs]'); if (b && !b.disabled) { h.sayfa += Number(b.dataset.hs); ciz(); } });
    $('#dp-h-csv').addEventListener('click', function () {
      var satir = [['Tarih', 'Ürün Kodu', 'Ürün', 'İşlem', 'Adet', 'Önceki Stok', 'Sonraki Stok', 'Açıklama', 'Kullanıcı']].concat(S.hareketler.map(function (x) {
        return [tarihYaz(x.tarih), x.urunKod || '', x.urunAd, (HAREKET[x.tip] || [x.tip])[0], x.adet, x.onceki, x.sonraki, x.not || '', x.kullanici || ''];
      }));
      indir('stok-hareketleri-' + new Date().toISOString().slice(0, 10) + '.csv', csvYaz(satir), 'text/csv;charset=utf-8');
    });
    ciz();
  }

  /* =====================================================================
     MAĞAZA & VİTRİN
     ===================================================================== */
  function magazaSekmesi() {
    var m = S.veri.magaza;
    var saatler = m.saatler;
    $('#dp-ana').innerHTML =
      '<div class="dp-sayfa-baslik"><div><h1>Mağaza & Vitrin</h1><p>İletişim bilgileri, çalışma saatleri, mağaza fotoğrafı ve ana sayfadaki kayan lansman vitrini.</p></div></div>' +
      '<div class="dp-iki-kolon">' +
      '<section class="dp-kart"><div class="dp-kart__ust">' + ZI.ikon('magaza') + '<div><h2>Mağaza bilgileri</h2><p>“Biz kimiz?” bölümünde, alt bilgide ve WhatsApp bağlantılarında kullanılır.</p></div></div>' +
      '<form id="dp-magaza-form" class="dp-izgara" novalidate>' +
      alan('Mağaza adı', '<input type="text" name="ad" value="' + k(m.ad) + '">') +
      alan('Telefon', '<input type="tel" name="telefon" value="' + k(m.telefon) + '" placeholder="0542 303 24 83">') +
      alan('WhatsApp numarası', '<input type="tel" name="whatsapp" value="' + k(m.whatsapp) + '" placeholder="905423032483">', { ipucu: 'Ülke koduyla, boşluksuz (ör. 905423032483).' }) +
      alan('E-posta', '<input type="email" name="eposta" value="' + k(m.eposta) + '" placeholder="ornek@alanadi.com">', { ipucu: 'Boş bırakırsanız sitede gösterilmez.' }) +
      alan('Adres', '<textarea name="adres" rows="2">' + k(m.adres) + '</textarea>', { genis: true }) +
      alan('Tanıtım metni', '<textarea name="tanitim" rows="5">' + k(m.tanitim) + '</textarea>', { genis: true }) +
      alan('Instagram adresi', '<input type="url" name="instagram" value="' + k(m.instagram) + '" placeholder="https://instagram.com/...">', { genis: true }) +
      alan('Fiyat notu', '<textarea name="fiyatNotu" rows="2">' + k(m.fiyatNotu) + '</textarea>', { genis: true, ipucu: 'Ürün sayfalarında fiyatın altında ve alt bilgide görünür.' }) +
      alan('Enlem', '<input type="text" name="enlem" value="' + k(m.konum.enlem) + '" inputmode="decimal">') +
      alan('Boylam', '<input type="text" name="boylam" value="' + k(m.konum.boylam) + '" inputmode="decimal">') +
      alan('Google Haritalar yer kimliği (isteğe bağlı)', '<input type="text" name="yerKimligi" value="' + k(m.konum.yerKimligi) + '">', { genis: true, ipucu: 'Yol tarifi bağlantısının doğrudan mağaza kaydını açması için.' }) +
      '</form><div class="dp-kart__alt"><button type="button" class="dp-btn dp-btn--turuncu dp-btn--buyuk" id="dp-magaza-kaydet">' + ZI.ikon('tik') + 'Bilgileri kaydet</button></div></section>' +

      '<div class="dp-kartlar">' +
      '<section class="dp-kart"><div class="dp-kart__ust">' + ZI.ikon('saat') + '<div><h2>Çalışma saatleri</h2><p>Sitede “Şu an açık / kapalı” durumu buna göre hesaplanır (Türkiye saati).</p></div></div>' +
      '<div id="dp-saatler">' + ZI.GUNLER.map(function (gun, i) {
        var s = saatler[i] || { kapali: true };
        return '<div class="dp-saat-satir' + (s.kapali ? ' kapali' : '') + '" data-gun="' + i + '"><b>' + gun + '</b>' +
          '<label class="dp-anahtar" title="Açık"><input type="checkbox" data-acik' + (s.kapali ? '' : ' checked') + ' aria-label="' + gun + ' açık"><span></span></label>' +
          '<div class="dp-alan"><input type="time" data-s="acilis" value="' + k(s.acilis || '09:00') + '" aria-label="' + gun + ' açılış"></div>' +
          '<div class="dp-alan"><input type="time" data-s="kapanis" value="' + k(s.kapanis || '20:30') + '" aria-label="' + gun + ' kapanış"></div></div>';
      }).join('') + '</div>' +
      '<div class="dp-kart__alt"><button type="button" class="dp-btn dp-btn--turuncu" id="dp-saat-kaydet">' + ZI.ikon('tik') + 'Saatleri kaydet</button></div></section>' +

      '<section class="dp-kart"><div class="dp-kart__ust">' + ZI.ikon('resim') + '<div><h2>Mağaza fotoğrafı</h2><p>“Biz kimiz?” bölümünde gösterilen dükkân görseli.</p></div></div>' +
      '<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><img id="dp-magaza-gorsel" src="' + k(m.gorsel || 'assets/img/magaza.jpg') + '" alt="Mağaza fotoğrafı" style="width:160px;height:120px;object-fit:cover;border-radius:14px;background:#eee">' +
      '<div class="dp-yukle" style="flex:1;min-width:200px;padding:16px">' + ZI.ikon('yukle') + '<b>Yeni fotoğraf seçin</b><input type="file" accept="image/*" id="dp-magaza-dosya" aria-label="Mağaza fotoğrafı seç"></div></div></section>' +
      '</div></div>' +

      '<section class="dp-kart" style="margin-top:18px"><div class="dp-kart__ust">' + ZI.ikon('yildiz') + '<div><h2>Lansman vitrini (ana sayfa)</h2><p>Ana sayfada 5 saniyede bir kayan büyük slaytlar. Her slayt bir ürüne bağlanır; görseller o ürünün fotoğraflarından ya da çizimlerinden oluşur.</p></div></div>' +
      '<div id="dp-vitrin"></div>' +
      '<div class="dp-kart__alt"><span class="dp-not">Bağlantı örnekleri: <code>urun.html?id=iphone-17</code> · <code>urunler.html?k=iphone</code> · <code>whatsapp:Mesajınız</code></span>' +
      '<button type="button" class="dp-btn dp-btn--cizgi" id="dp-vitrin-ekle">' + ZI.ikon('arti') + 'Slayt ekle</button>' +
      '<button type="button" class="dp-btn dp-btn--turuncu dp-btn--buyuk" id="dp-vitrin-kaydet">' + ZI.ikon('tik') + 'Vitrini kaydet</button></div></section>';

    $('#dp-magaza-kaydet').onclick = function () {
      var f = $('#dp-magaza-form'), v = function (a) { return f.querySelector('[name="' + a + '"]').value.trim(); };
      if (!v('ad')) { bildir('Mağaza adı boş olamaz.', true); return; }
      Object.assign(m, { ad: v('ad'), telefon: v('telefon'), whatsapp: v('whatsapp').replace(/\D/g, ''), eposta: v('eposta'), adres: v('adres'), tanitim: v('tanitim'), instagram: v('instagram'), fiyatNotu: v('fiyatNotu') });
      var en = Number(String(v('enlem')).replace(',', '.')), boy = Number(String(v('boylam')).replace(',', '.'));
      m.konum = { enlem: isNaN(en) || !v('enlem') ? null : en, boylam: isNaN(boy) || !v('boylam') ? null : boy, yerKimligi: v('yerKimligi') };
      degisti('Mağaza bilgileri kaydedildi.');
    };
    $('#dp-saatler').addEventListener('change', function (e) {
      if (e.target.matches('[data-acik]')) e.target.closest('.dp-saat-satir').classList.toggle('kapali', !e.target.checked);
    });
    $('#dp-saat-kaydet').onclick = function () {
      m.saatler = $$('#dp-saatler .dp-saat-satir').map(function (s, i) {
        var acik = $('[data-acik]', s).checked;
        return acik ? { gun: ZI.GUNLER[i], acilis: $('[data-s="acilis"]', s).value || '09:00', kapanis: $('[data-s="kapanis"]', s).value || '20:00' } : { gun: ZI.GUNLER[i], kapali: true };
      });
      degisti('Çalışma saatleri kaydedildi.');
    };
    $('#dp-magaza-dosya').onchange = function () {
      var f = this.files[0]; this.value = '';
      if (!f) return;
      gorselIsle(f).then(function (v) { m.gorsel = v; $('#dp-magaza-gorsel').src = v; degisti('Mağaza fotoğrafı güncellendi.'); }, function (e) { bildir(e.message, true); });
    };
    vitrinCiz();
  }
  function vitrinCiz() {
    var el = $('#dp-vitrin'), vt = S.veri.vitrin;
    var urunSecenek = function (secili) {
      return '<option value="">— Seçin —</option>' + S.veri.urunler.map(function (u) { return '<option value="' + k(u.id) + '"' + (u.id === secili ? ' selected' : '') + '>' + k(u.ad) + (u.durum === 'ikinci-el' ? ' (2. El)' : '') + '</option>'; }).join('');
    };
    el.innerHTML = vt.length ? vt.map(function (s, i) {
      var ana = s.urunId || (s.urunler || [])[0] || '';
      var ek = (s.urunler || []).filter(function (x) { return x !== ana; });
      return '<div class="dp-vitrin-kart" data-i="' + i + '">' +
        '<div class="dp-vitrin-kart__ust"><span class="dp-vitrin-onizleme" style="background:' + (s.tema === 'koyu' ? '#000' : '#f5f5f7') + ';box-shadow:inset 0 0 0 1px #d2d2d7"></span><b>' + (i + 1) + '. slayt · ' + k(s.baslik || 'Başlıksız') + '</b>' +
        '<label class="dp-anahtar" title="Yayında"><input type="checkbox" data-v="aktif"' + (s.aktif !== false ? ' checked' : '') + ' aria-label="Slayt yayında"><span></span></label>' +
        '<button type="button" class="dp-sil-btn" data-vt="yukari" aria-label="Yukarı taşı"' + (i === 0 ? ' disabled' : '') + '>' + ZI.ikon('yukari') + '</button>' +
        '<button type="button" class="dp-sil-btn" data-vt="asagi" aria-label="Aşağı taşı"' + (i === vt.length - 1 ? ' disabled' : '') + '>' + ZI.ikon('asagiOk') + '</button>' +
        '<button type="button" class="dp-sil-btn" data-vt="sil" aria-label="Slaytı sil">' + ZI.ikon('cop') + '</button></div>' +
        '<div class="dp-izgara dp-izgara--3">' +
        alan('Tema', '<select data-v="tema"><option value="acik"' + (s.tema !== 'koyu' ? ' selected' : '') + '>Açık (gri zemin)</option><option value="koyu"' + (s.tema === 'koyu' ? ' selected' : '') + '>Koyu (siyah zemin)</option></select>') +
        alan('Görsel düzeni', '<select data-v="sahne">' + [['katlanir', 'Sağda ve solda cihaz (katlanır)'], ['lansman', 'Lansman: 3 cihaz, ışıltılı'], ['yelpaze', 'Yelpaze: 3 cihaz + etiketler'], ['tek', 'Tek görsel']].map(function (o) { return '<option value="' + o[0] + '"' + (s.sahne === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>') +
        alan('Üst etiket', '<input type="text" data-v="etiket" value="' + k(s.etiket || '') + '" placeholder="Örn. Yeni">') +
        alan('Başlık', '<input type="text" data-v="baslik" value="' + k(s.baslik || '') + '">') +
        alan('Alt başlık', '<input type="text" data-v="altBaslik" value="' + k(s.altBaslik || '') + '">', { genis: false }) +
        alan('Ana ürün', '<select data-v="urunId">' + urunSecenek(ana) + '</select>') +
        alan('2. ürün (lansman / yelpaze)', '<select data-v="urun2">' + urunSecenek(ek[0]) + '</select>') +
        alan('3. ürün (lansman / yelpaze)', '<select data-v="urun3">' + urunSecenek(ek[1]) + '</select>') +
        alan('1. buton metni', '<input type="text" data-v="b1metin" value="' + k(s.buton1 && s.buton1.metin || '') + '">') +
        alan('1. buton bağlantısı', '<input type="text" data-v="b1link" value="' + k(s.buton1 && s.buton1.link || '') + '">') +
        alan('2. buton metni', '<input type="text" data-v="b2metin" value="' + k(s.buton2 && s.buton2.metin || '') + '">') +
        alan('2. buton bağlantısı', '<input type="text" data-v="b2link" value="' + k(s.buton2 && s.buton2.link || '') + '">') +
        '</div></div>';
    }).join('') : '<p class="dp-ipucu" style="color:var(--d-metin-2)">Vitrinde slayt yok. “Slayt ekle” ile başlayın.</p>';
    el.onclick = function (e) {
      var b = e.target.closest('[data-vt]'); if (!b) return;
      vitrinTopla();
      var i = Number(b.closest('.dp-vitrin-kart').dataset.i), x = vt[i];
      if (b.dataset.vt === 'sil') vt.splice(i, 1);
      if (b.dataset.vt === 'yukari' && i > 0) { vt[i] = vt[i - 1]; vt[i - 1] = x; }
      if (b.dataset.vt === 'asagi' && i < vt.length - 1) { vt[i] = vt[i + 1]; vt[i + 1] = x; }
      vitrinCiz();
    };
    $('#dp-vitrin-ekle').onclick = function () {
      vitrinTopla();
      vt.push({ id: 'v' + rastgele(5), aktif: true, tema: 'acik', sahne: 'tek', etiket: 'Yeni', baslik: 'Yeni slayt', altBaslik: '', urunId: '', urunler: [], buton1: { metin: 'Daha Fazla Bilgi', link: '' }, buton2: { metin: 'Fiyatları Görüntüleyin', link: '' } });
      vitrinCiz();
    };
    $('#dp-vitrin-kaydet').onclick = function () { vitrinTopla(); degisti('Vitrin kaydedildi.'); vitrinCiz(); };
  }
  function vitrinTopla() {
    $$('#dp-vitrin .dp-vitrin-kart').forEach(function (kart) {
      var s = S.veri.vitrin[Number(kart.dataset.i)]; if (!s) return;
      var v = function (a) { var el = kart.querySelector('[data-v="' + a + '"]'); return el.type === 'checkbox' ? el.checked : el.value.trim(); };
      s.aktif = v('aktif'); s.tema = v('tema'); s.sahne = v('sahne'); s.etiket = v('etiket'); s.baslik = v('baslik'); s.altBaslik = v('altBaslik');
      s.urunId = v('urunId');
      s.urunler = [v('urunId'), v('urun2'), v('urun3')].filter(Boolean).filter(function (x, i, l) { return l.indexOf(x) === i; });
      s.buton1 = { metin: v('b1metin'), link: v('b1link') || (s.urunId ? 'urun.html?id=' + s.urunId : '') };
      s.buton2 = { metin: v('b2metin'), link: v('b2link') || (s.urunId ? 'urun.html?id=' + s.urunId + '#fiyat' : '') };
    });
  }

  /* =====================================================================
     AYARLAR
     ===================================================================== */
  function ayarlarSekmesi() {
    var a = GH.ayar() || GH.tahmin() || { sahip: '', depo: '', dal: 'main' };
    var bagli = !!GH.ayar(), token = !!oturum.token;
    var durum = bagli && token ? ['iyi', 'Bağlı · yayına hazır'] : (bagli ? ['uyari', 'Ayarlar kayıtlı · bu oturumda anahtar yok'] : ['', 'Bağlı değil']);
    var repoAnahtarli = !!(S.yonetici && S.yonetici.anahtar);
    $('#dp-ana').innerHTML =
      '<div class="dp-sayfa-baslik"><div><h1>Ayarlar</h1><p>GitHub yayın bağlantısı, yönetici hesabı ve yedekleme.</p></div></div>' +
      '<div class="dp-iki-kolon">' +
      '<section class="dp-kart dp-kart--cerceve" id="dp-github-kart"><div class="dp-kart__ust">' + ZI.ikon('bulut') + '<div><h2>GitHub bağlantısı</h2><p>Panelde yaptığınız değişikliklerin “Yayınla” ile siteye aktarılması için bir kez kurulur.</p></div></div>' +
      '<p style="margin-bottom:16px"><span class="dp-baglanti-durum ' + durum[0] + '">' + durum[1] + '</span>' + (repoAnahtarli ? ' <span class="dp-rozet dp-rozet--koyu" style="margin-left:6px">Anahtar depoda şifreli</span>' : '') + '</p>' +
      '<details style="margin-bottom:16px"><summary class="dp-link" style="cursor:pointer">Erişim anahtarı nasıl alınır?</summary><ol class="dp-adim-liste" style="margin-top:12px">' +
      '<li><span>GitHub’da sağ üstteki profil resminize tıklayın → <b>Settings</b> → en altta <b>Developer settings</b> → <b>Personal access tokens</b> → <b>Fine-grained tokens</b> → <b>Generate new token</b>.</span></li>' +
      '<li><span><b>Repository access</b> bölümünde <b>Only select repositories</b> seçip bu sitenin deposunu seçin.</span></li>' +
      '<li><span><b>Permissions → Repository permissions → Contents</b> iznini <b>Read and write</b> yapın. Başka izin gerekmez.</span></li>' +
      '<li><span>Anahtara bir süre verin (ör. 1 yıl), <b>Generate token</b>’a basın ve <b>github_pat_…</b> ile başlayan anahtarı aşağıya yapıştırın.</span></li></ol></details>' +
      '<form id="dp-gh-form" class="dp-izgara" novalidate>' +
      alan('GitHub kullanıcı adı', '<input type="text" name="sahip" value="' + k(a.sahip) + '" autocapitalize="none" spellcheck="false">', { zorunlu: true }) +
      alan('Depo (repository) adı', '<input type="text" name="depo" value="' + k(a.depo) + '" autocapitalize="none" spellcheck="false">', { zorunlu: true }) +
      alan('Dal (branch)', '<input type="text" name="dal" value="' + k(a.dal || 'main') + '" autocapitalize="none" spellcheck="false">') +
      alan('Erişim anahtarı', '<input type="password" name="token" value="" placeholder="' + (token ? '•••••••• (bu oturumda kayıtlı)' : 'github_pat_…') + '" autocomplete="off" spellcheck="false">', { ipucu: token ? 'Değiştirmek istemiyorsanız boş bırakın.' : '' }) +
      '<div class="dp-genis">' + anahtar('depoyaKaydet', true, 'Anahtarı şifreli olarak depoya kaydet (önerilir)', 'Böylece diğer cihazlardan yalnızca kullanıcı adı ve şifreyle giriş yapıp yayınlayabilirsiniz. Anahtar, yönetici şifrenizle şifrelenir.') + '</div>' +
      '<div class="dp-genis" id="dp-gh-sifre-alanlari"></div>' +
      '</form>' +
      '<div class="dp-kart__alt"><span class="dp-not" id="dp-gh-sonuc"></span><button type="button" class="dp-btn dp-btn--cizgi" id="dp-gh-test">' + ZI.ikon('yenile') + 'Bağlantıyı test et</button><button type="button" class="dp-btn dp-btn--turuncu dp-btn--buyuk" id="dp-gh-kaydet">' + ZI.ikon('tik') + 'Kaydet ve bağlan</button></div>' +
      (bagli ? '<p style="margin-top:14px;font-size:12px"><button type="button" class="dp-link" id="dp-gh-kaldir">Bu cihazdaki bağlantıyı kaldır</button></p>' : '') +
      '</section>' +

      '<div class="dp-kartlar">' +
      '<section class="dp-kart" id="dp-sifre-kart"><div class="dp-kart__ust">' + ZI.ikon('kilit') + '<div><h2>Yönetici hesabı</h2><p>Giriş kullanıcı adı ve şifresi. Şifre hiçbir yerde açık olarak saklanmaz.</p></div></div>' +
      '<form id="dp-sifre-form" class="dp-izgara" novalidate>' +
      alan('Kullanıcı adı', '<input type="text" name="kullanici" value="' + k(S.yonetici ? S.yonetici.kullanici : oturum.kullanici) + '" autocomplete="username" autocapitalize="none">', { genis: true }) +
      alan('Mevcut şifre', '<input type="password" name="mevcut" autocomplete="current-password">', { genis: true }) +
      alan('Yeni şifre', '<input type="password" name="yeni" autocomplete="new-password"><div class="dp-guc"><i id="dp-guc"></i></div>', { ipucu: '<span id="dp-guc-metin">En az 10 karakter; harf ve rakam içermeli.</span>' }) +
      alan('Yeni şifre (tekrar)', '<input type="password" name="tekrar" autocomplete="new-password">') +
      (token ? '<div class="dp-genis">' + anahtar('anahtarSakla', true, 'GitHub anahtarını yeni şifreyle şifreleyip depoya kaydet', 'Diğer cihazlardan da yayınlayabilmek için') + '</div>' : '') +
      '</form><div class="dp-kart__alt"><button type="button" class="dp-btn dp-btn--turuncu dp-btn--buyuk" id="dp-sifre-kaydet">' + ZI.ikon('kilit') + 'Şifreyi değiştir</button></div></section>' +

      '<section class="dp-kart"><div class="dp-kart__ust">' + ZI.ikon('indir') + '<div><h2>Yedekleme ve dışa aktarma</h2><p>Tüm ürün, mağaza ve stok hareketi verilerinizin kopyası.</p></div></div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<button type="button" class="dp-btn dp-btn--siyah" data-islem="json">' + ZI.ikon('indir') + 'Yedek indir (JSON)</button>' +
      '<label class="dp-btn dp-btn--cizgi" style="cursor:pointer">' + ZI.ikon('yukle') + 'Yedekten geri yükle<input type="file" accept=".json,application/json" data-islem="json-yukle" hidden></label>' +
      '<button type="button" class="dp-btn dp-btn--cizgi" data-islem="csv">' + ZI.ikon('tablo') + 'Excel’e aktar (CSV)</button>' +
      '<button type="button" class="dp-btn dp-btn--cizgi" data-islem="paket">' + ZI.ikon('kutu') + 'Yayın paketini indir (ZIP)</button></div></section>' +

      '<section class="dp-kart dp-tehlike-bolge"><div class="dp-kart__ust">' + ZI.ikon('uyari') + '<div><h2>Dikkat gerektiren işlemler</h2><p>Geri alınamaz. Yayınlamadığınız sürece site etkilenmez.</p></div></div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<button type="button" class="dp-btn dp-btn--tehlike" id="dp-ornek-sil">' + ZI.ikon('cop') + 'Örnek ürünleri sil (' + S.veri.urunler.filter(function (u) { return u.ornek; }).length + ')</button>' +
      '<button type="button" class="dp-btn dp-btn--tehlike" id="dp-taslak-at">' + ZI.ikon('yenile') + 'Taslağı at, yayındaki sürüme dön</button>' +
      '<button type="button" class="dp-btn dp-btn--tehlike" id="dp-hepsini-sil">' + ZI.ikon('cop') + 'Tüm ürünleri sil</button></div></section>' +
      '</div></div>';

    // GitHub formu: şifre alanları
    var ghf = $('#dp-gh-form');
    function sifreAlanlari() {
      var kaydet = ghf.querySelector('[name="depoyaKaydet"]').checked;
      var el = $('#dp-gh-sifre-alanlari');
      if (!kaydet) { el.innerHTML = ''; return; }
      el.innerHTML = oturum.varsayilan
        ? '<div class="dp-bant dp-bant--uyari" style="margin-bottom:12px">' + ZI.ikon('kilit') + '<p><b>Varsayılan şifre herkesçe bilinir.</b> Anahtarı depoya kaydetmeden önce yeni bir şifre belirleyin.</p></div>' +
          '<div class="dp-izgara">' + alan('Yeni şifre', '<input type="password" name="ghYeni" autocomplete="new-password">', { ipucu: 'En az 10 karakter; harf ve rakam.' }) + alan('Yeni şifre (tekrar)', '<input type="password" name="ghTekrar" autocomplete="new-password">') + '</div>'
        : alan('Yönetici şifreniz', '<input type="password" name="ghSifre" autocomplete="current-password">', { ipucu: 'Anahtarı şifrelemek için gerekli.' });
    }
    ghf.addEventListener('change', function (e) { if (e.target.name === 'depoyaKaydet') sifreAlanlari(); });
    sifreAlanlari();

    function ghDegerler() {
      var v = function (n) { var el = ghf.querySelector('[name="' + n + '"]'); return el ? (el.type === 'checkbox' ? el.checked : el.value.trim()) : ''; };
      return { a: { sahip: v('sahip').replace(/^https?:\/\/github\.com\//i, '').split('/')[0], depo: v('depo').replace(/\.git$/i, ''), dal: v('dal') || 'main' }, token: v('token') || oturum.token || '', kaydet: v('depoyaKaydet'), sifre: v('ghSifre'), yeni: v('ghYeni'), tekrar: v('ghTekrar') };
    }
    $('#dp-gh-test').onclick = function () {
      var x = ghDegerler(), sonuc = $('#dp-gh-sonuc');
      if (!x.a.sahip || !x.a.depo || !x.token) { sonuc.textContent = 'Kullanıcı adı, depo adı ve anahtar gerekli.'; return; }
      sonuc.textContent = 'Test ediliyor…';
      GH.test(x.token, x.a).then(function (r) {
        sonuc.innerHTML = '<b style="color:var(--d-yesil)">Bağlantı başarılı:</b> ' + k(r.depo) + ' · varsayılan dal: ' + k(r.varsayilanDal);
        if (r.varsayilanDal && r.varsayilanDal !== x.a.dal) { ghf.querySelector('[name="dal"]').value = r.varsayilanDal; }
      }, function (e) { sonuc.innerHTML = '<b style="color:var(--d-kirmizi)">Hata:</b> ' + k(e.message); });
    };
    $('#dp-gh-kaydet').onclick = function () {
      var x = ghDegerler(), btn = this;
      if (!x.a.sahip || !x.a.depo) { bildir('GitHub kullanıcı adı ve depo adı gerekli.', true); return; }
      if (!x.token) { bildir('Erişim anahtarını girin.', true); return; }
      var hazirlik;
      if (x.kaydet) {
        if (oturum.varsayilan) {
          var guc = GV.sifreGucu(x.yeni);
          if (!guc.yeterli) { bildir('Yeni şifre en az 10 karakter olmalı ve harf ile rakam içermeli.', true); return; }
          if (x.yeni !== x.tekrar) { bildir('Yeni şifreler birbirini tutmuyor.', true); return; }
          hazirlik = Promise.resolve({ kullanici: S.yonetici ? S.yonetici.kullanici : oturum.kullanici, sifre: x.yeni });
        } else {
          if (!x.sifre) { bildir('Anahtarı şifrelemek için yönetici şifrenizi girin.', true); return; }
          hazirlik = GV.dogrula(S.yonetici, S.yonetici.kullanici, x.sifre).then(function (r) {
            if (!r.tamam) throw new Error('Yönetici şifresi hatalı.');
            return { kullanici: S.yonetici.kullanici, sifre: x.sifre };
          });
        }
      } else hazirlik = Promise.resolve(null);
      btn.disabled = true;
      $('#dp-gh-sonuc').textContent = 'Bağlantı denetleniyor…';
      hazirlik.then(function (hesap) {
        return GH.test(x.token, x.a).then(function (r) {
          if (r.varsayilanDal && r.varsayilanDal !== x.a.dal) x.a.dal = r.varsayilanDal;
          GH.ayarKaydet(x.a);
          oturum.token = x.token; oturum.anahtarCozulemedi = false; GV.oturumAc(oturum);
          if (!hesap) return null;
          return GV.kayitOlustur(hesap.kullanici, hesap.sifre, x.token).then(function (kayit) { return yoneticiYayinla(kayit, 'GitHub anahtarı şifreli olarak kaydedildi'); });
        });
      }).then(function () {
        btn.disabled = false;
        bildir('GitHub bağlantısı kuruldu. Artık “Yayınla” ile siteyi güncelleyebilirsiniz.');
        sekmeAc('ayarlar'); ustDurum();
      }).catch(function (e) {
        btn.disabled = false;
        $('#dp-gh-sonuc').innerHTML = '<b style="color:var(--d-kirmizi)">Hata:</b> ' + k(e.message);
        bildir(e.message, true);
      });
    };
    var kaldir = $('#dp-gh-kaldir');
    if (kaldir) kaldir.onclick = function () {
      onayla('Bağlantı kaldırılsın mı?', 'Bu cihazdaki GitHub ayarları ve oturumdaki anahtar silinir. Depodaki dosyalar etkilenmez.', 'Kaldır', true).then(function (e) {
        if (!e) return;
        ZI.yerelSil('zi-github'); oturum.token = null; GV.oturumAc(oturum); sekmeAc('ayarlar'); ustDurum();
      });
    };

    // Şifre formu
    var sf = $('#dp-sifre-form');
    sf.querySelector('[name="yeni"]').addEventListener('input', function () {
      var g2 = GV.sifreGucu(this.value), cub = $('#dp-guc');
      cub.style.width = Math.max(8, g2.puan * 20) + '%';
      cub.style.background = g2.puan >= 4 ? 'var(--d-yesil)' : (g2.puan >= 2 ? 'var(--d-turuncu)' : 'var(--d-kirmizi)');
      $('#dp-guc-metin').textContent = this.value ? g2.metin + (g2.yeterli ? '' : ' · en az 10 karakter, harf ve rakam') : 'En az 10 karakter; harf ve rakam içermeli.';
    });
    $('#dp-sifre-kaydet').onclick = function () {
      var v = function (n) { var el = sf.querySelector('[name="' + n + '"]'); return el ? (el.type === 'checkbox' ? el.checked : el.value) : ''; };
      var kullanici = String(v('kullanici')).trim();
      if (!kullanici || kullanici.length < 3) { bildir('Kullanıcı adı en az 3 karakter olmalı.', true); return; }
      if (!v('mevcut')) { bildir('Mevcut şifrenizi girin.', true); return; }
      if (!GV.sifreGucu(v('yeni')).yeterli) { bildir('Yeni şifre en az 10 karakter olmalı ve harf ile rakam içermeli.', true); return; }
      if (v('yeni') !== v('tekrar')) { bildir('Yeni şifreler birbirini tutmuyor.', true); return; }
      var btn = this; btn.disabled = true;
      GV.dogrula(S.yonetici, S.yonetici.kullanici, v('mevcut')).then(function (r) {
        if (!r.tamam) throw new Error('Mevcut şifre hatalı.');
        var tokenSakla = oturum.token && (v('anahtarSakla') === '' ? false : !!v('anahtarSakla'));
        return GV.kayitOlustur(kullanici, v('yeni'), tokenSakla ? oturum.token : null);
      }).then(function (kayit) {
        oturum.kullanici = kayit.kullanici;
        return yoneticiYayinla(kayit, 'Yönetici şifresi değiştirildi');
      }).then(function () {
        btn.disabled = false;
        sf.reset();
        sekmeAc('ayarlar');
      }).catch(function (e) { btn.disabled = false; bildir(e.message, true); });
    };

    $('#dp-ornek-sil').onclick = ornekleriSil;
    $('#dp-taslak-at').onclick = function () {
      onayla('Taslak atılsın mı?', 'Bu cihazdaki yayınlanmamış tüm değişiklikler silinir ve sitenin yayındaki hâli yeniden yüklenir.', 'Taslağı at', true).then(function (e) {
        if (!e) return;
        ZI.depo.sil('taslak').then(function () { location.reload(); });
      });
    };
    $('#dp-hepsini-sil').onclick = function () {
      modal({
        ikon: 'uyari', ikonSinif: 'tehlike', baslik: 'Tüm ürünler silinsin mi?',
        metin: 'Bu işlem ' + S.veri.urunler.length + ' ürünün tamamını siler. Onaylamak için kutuya <b>SİL</b> yazın.',
        icerik: '<div class="dp-alan" style="margin-top:14px"><input type="text" id="m-onay" autocomplete="off" aria-label="Onay metni"></div>',
        butonlar: [{ metin: 'Vazgeç', deger: 'iptal', sinif: 'dp-btn--cizgi' }, { metin: 'Tümünü sil', deger: 'sil', sinif: 'dp-btn--tehlike', varsayilan: true }],
        dogrula: function (kutu) { if ($('#m-onay', kutu).value.trim().toLocaleUpperCase('tr') !== 'SİL') { bildir('Onay için SİL yazın.', true); return false; } }
      }).then(function (v) {
        if (v !== 'sil') return;
        S.veri.urunler.forEach(function (u) { hareketEkle(u, 'silme', -u.stok, u.stok, 0, 'Toplu silme'); });
        S.veri.urunler = []; S.veri.vitrin.forEach(function (s) { s.urunId = ''; s.urunler = []; });
        degisti('Tüm ürünler silindi.');
        sekmeAc('ayarlar');
      });
    };
  }

  /* Yeni yönetici kaydını yayınla (GitHub bağlıysa hemen, değilse yerel + indirme) */
  function yoneticiYayinla(kayit, mesaj) {
    var a = GH.ayar(), token = oturum.token;
    var metin = GH.jsVeriYaz('ZI_YONETICI', kayit, 'Zümrüt İletişim · Yönetici giriş kaydı. Şifre burada SAKLANMAZ; yalnızca doğrulama özeti bulunur. Panelden şifre değiştirildiğinde otomatik güncellenir.');
    function yerelUygula() {
      S.yonetici = kayit;
      ZI.yerelKoy('zi-yonetici-yerel', kayit);
      oturum.varsayilan = false; GV.oturumAc(oturum);
    }
    if (a && token) {
      bildir('Yönetici kaydı GitHub’a gönderiliyor…');
      return GH.commitGonder(token, a, [{ yol: 'data/yonetici.js', metin: metin }], [], 'Depo paneli: ' + mesaj.toLocaleLowerCase('tr'), null).then(function () {
        yerelUygula();
        bildir(mesaj + '. Yeni şifre bu cihazda hemen, diğer cihazlarda 1–2 dakika içinde geçerli olur.');
      });
    }
    yerelUygula();
    return modal({
      ikon: 'kilit', baslik: 'Şifre bu cihazda değişti',
      metin: 'GitHub bağlantısı kurulu olmadığı için yeni kayıt yalnızca bu tarayıcıda geçerli. Diğer cihazlarda da geçerli olması için indirilen <b>yonetici.js</b> dosyasını deponuzdaki <b>data</b> klasörüne yükleyin (eski dosyanın üzerine).',
      butonlar: [{ metin: 'Kapat', deger: 'iptal', sinif: 'dp-btn--cizgi' }, { metin: 'yonetici.js dosyasını indir', deger: 'indir', sinif: 'dp-btn--turuncu', varsayilan: true, ikon: 'indir' }]
    }).then(function (v) { if (v === 'indir') indir('yonetici.js', metin, 'text/javascript;charset=utf-8'); });
  }

  /* =====================================================================
     YAYINLAMA
     ===================================================================== */
  function dataUrlCoz(u) {
    var m = /^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i.exec(u || '');
    if (!m) return null;
    var uz = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/avif': 'avif' }[m[1].toLowerCase()] || 'img';
    return { tur: m[1], b64: m[2], uzanti: uz };
  }
  /* Yayına hazır kopya: gömülü (data:) görselleri dosyaya dönüştür */
  function yayinHazirla() {
    var veri = JSON.parse(JSON.stringify(S.veri));
    var gorselDosyalar = [];
    function donustur(deger, onEk) {
      var c = dataUrlCoz(deger);
      if (!c) return deger;
      var yol = 'assets/img/urunler/' + onEk + '-' + Date.now().toString(36) + rastgele(4) + '.' + c.uzanti;
      gorselDosyalar.push({ yol: yol, b64: c.b64 });
      return yol;
    }
    veri.urunler.forEach(function (u) {
      u.gorseller = (u.gorseller || []).map(function (x) { return typeof x === 'string' ? donustur(x, ZI.kisaAd(u.id).slice(0, 40) || 'urun') : x; });
    });
    if (veri.magaza && veri.magaza.gorsel) veri.magaza.gorsel = donustur(veri.magaza.gorsel, 'magaza');
    veri.guncelleme = simdi();
    var kullanilan = {};
    veri.urunler.forEach(function (u) { u.gorseller.forEach(function (x) { if (typeof x === 'string') kullanilan[x] = true; }); });
    if (veri.magaza && veri.magaza.gorsel) kullanilan[veri.magaza.gorsel] = true;
    return {
      veri: veri, gorseller: gorselDosyalar, kullanilan: kullanilan,
      veriMetni: GH.jsVeriYaz('ZI_VERI', veri, 'Zümrüt İletişim · Site verileri (ürünler, mağaza, vitrin). Bu dosya depo panelinden otomatik güncellenir.'),
      hareketMetni: GH.jsVeriYaz('ZI_HAREKETLER', S.hareketler, 'Zümrüt İletişim · Stok hareketleri. Bu dosya depo panelinden otomatik güncellenir.')
    };
  }
  function yayinla() {
    if (!S.yayinlanmadi) { bildir('Yayınlanacak değişiklik yok.'); return; }
    var a = GH.ayar(), token = oturum.token;
    if (!a || !token) {
      return modal({
        ikon: 'bulut', baslik: 'Nasıl yayınlamak istersiniz?',
        metin: 'Siteyi güncellemek için değişikliklerin GitHub’daki depoya aktarılması gerekir.',
        icerik: '<ol class="dp-adim-liste" style="margin-top:14px"><li><span><b>Otomatik (önerilir):</b> GitHub bağlantısını bir kez kurun; sonra tek tıkla yayınlarsınız.</span></li>' +
          '<li><span><b>Elle:</b> Yayın paketini (ZIP) indirin, açın ve içindeki <b>data</b> ile <b>assets</b> klasörlerini GitHub’da deponuza sürükleyip bırakın (<b>Add file → Upload files → Commit changes</b>).</span></li></ol>',
        butonlar: [{ metin: 'Vazgeç', deger: 'iptal', sinif: 'dp-btn--cizgi' }, { metin: 'Yayın paketini indir', deger: 'paket', sinif: 'dp-btn--siyah', ikon: 'kutu' }, { metin: 'GitHub’ı bağla', deger: 'github', sinif: 'dp-btn--turuncu', varsayilan: true }]
      }).then(function (v) { if (v === 'github') sekmeAc('ayarlar'); if (v === 'paket') paketIndir(); });
    }
    bildir('Yayın hazırlanıyor…');
    GH.dosyaOku(token, a, 'data/veri.js').catch(function (e) { if (e.durum === 404) return { sha: null }; throw e; }).then(function (uzak) {
      if (S.tabanSha && uzak.sha && uzak.sha !== S.tabanSha) {
        return onayla('Site başka bir cihazdan güncellenmiş', 'Siz bu paneli açtıktan sonra site başka bir yerden yayınlanmış. Devam ederseniz o değişikliklerin üzerine kendi değişiklikleriniz yazılır.', 'Üzerine yaz ve yayınla', true)
          .then(function (e) { if (!e) throw new Error('iptal'); });
      }
    }).then(yayinSurec, function (e) {
      if (e && e.message === 'iptal') { bildir('Yayın iptal edildi.'); return; }
      bildir('Yayınlanamadı: ' + ((e && e.message) || 'bilinmeyen hata'), true);
    });

    function yayinSurec() {
      var adimlar = ['Değişiklikler hazırlanıyor', 'Eski görseller denetleniyor', 'Dosyalar GitHub’a gönderiliyor', 'Yayın kaydediliyor'];
      var kutu = null, kapatFn = null;
      modal({
        ikon: 'bulut', baslik: 'Yayınlanıyor…', metin: 'Lütfen bu pencereyi kapatmayın.',
        icerik: '<div class="dp-adimlar">' + adimlar.map(function (x) { return '<div class="dp-adim">' + x + '</div>'; }).join('') + '</div><p id="dp-yayin-ayrinti" class="dp-ipucu" style="margin-top:12px;font-size:12px"></p>',
        butonlar: [{ metin: 'Kapat', deger: 'iptal', sinif: 'dp-btn--cizgi' }], kapatilamaz: true,
        acildi: function (k2, kp) { kutu = k2; kapatFn = kp; k2.querySelector('[data-deger]').disabled = true; }
      });
      function adim(i, durum, metin) {
        var el = kutu.querySelectorAll('.dp-adim')[i]; if (!el) return;
        el.className = 'dp-adim ' + durum; if (metin) el.textContent = metin;
      }
      var hazir;
      Promise.resolve().then(function () {
        adim(0, 'suruyor');
        hazir = yayinHazirla();
        adim(0, 'tamam', 'Değişiklikler hazırlandı (' + hazir.gorseller.length + ' yeni görsel)');
        adim(1, 'suruyor');
        return GH.klasorListele(token, a, 'assets/img/urunler');
      }).then(function (liste) {
        var sil = liste.filter(function (f) { return f.type === 'file' && !/^(BENIOKU\.txt|\.gitkeep|README\.md)$/i.test(f.name) && !hazir.kullanilan[f.path]; }).map(function (f) { return f.path; });
        adim(1, 'tamam', sil.length ? sil.length + ' kullanılmayan görsel silinecek' : 'Kullanılmayan görsel yok');
        var dosyalar = hazir.gorseller.concat([{ yol: 'data/veri.js', metin: hazir.veriMetni }, { yol: 'data/hareketler.js', metin: hazir.hareketMetni }]);
        adim(2, 'suruyor');
        return GH.commitGonder(token, a, dosyalar, sil, 'Depo paneli: site verileri güncellendi (' + S.degisiklik + ' değişiklik)', function (t) {
          var ay = kutu.querySelector('#dp-yayin-ayrinti'); if (ay) ay.textContent = t;
          if (/Yayın kaydediliyor/.test(t)) { adim(2, 'tamam', 'Dosyalar gönderildi'); adim(3, 'suruyor'); }
        });
      }).then(function (sonuc) {
        return Promise.all([gitBlobSha(hazir.veriMetni), gorselOnbellekKaydet(hazir.gorseller)]).then(function (r) {
          S.veri = ZI.normalize(hazir.veri); S.tabanSha = r[0]; S.yayinlanmadi = false; S.degisiklik = 0;
          return taslakKaydet().then(function () { return sonuc; });
        });
      }).then(function (sonuc) {
        adim(2, 'tamam', 'Dosyalar gönderildi');
        adim(3, 'tamam', 'Yayın kaydedildi');
        ustDurum();
        if (S.sekme === 'urunler') { bantlarCiz(); tabloCiz(); }
        kutu.querySelector('h2').textContent = 'Yayınlandı!';
        var ik = kutu.querySelector('.dp-modal__ikon'); ik.className = 'dp-modal__ikon basari'; ik.innerHTML = ZI.ikon('onay');
        kutu.querySelector('p').innerHTML = 'GitHub Pages siteyi <b>1–2 dakika</b> içinde herkes için güncelleyecek. Bu cihazda değişiklikleri hemen görebilirsiniz.';
        kutu.querySelector('#dp-yayin-ayrinti').innerHTML = sonuc && sonuc.url ? '<a class="dp-link" href="' + k(sonuc.url) + '" target="_blank" rel="noopener">GitHub’daki kaydı görüntüle ↗</a>' : '';
        kutu.querySelector('.dp-modal__alt').innerHTML = '<a class="dp-btn dp-btn--cizgi dp-btn--buyuk" href="index.html" target="_blank" rel="noopener">' + ZI.ikon('dis') + 'Siteyi aç</a><button type="button" class="dp-btn dp-btn--turuncu dp-btn--buyuk" data-deger="iptal" data-varsayilan>Tamam</button>';
        $('#dp-modal').onclick = function (e) { if (e.target.id === 'dp-modal') kapatFn(null); };
      }).catch(function (e) {
        $$('.dp-adim.suruyor', kutu).forEach(function (x) { x.className = 'dp-adim hata'; });
        kutu.querySelector('h2').textContent = 'Yayınlanamadı';
        var ik = kutu.querySelector('.dp-modal__ikon'); ik.className = 'dp-modal__ikon tehlike'; ik.innerHTML = ZI.ikon('uyari');
        kutu.querySelector('p').textContent = (e && e.message) || 'Bilinmeyen hata';
        kutu.querySelector('#dp-yayin-ayrinti').textContent = 'Değişiklikleriniz bu tarayıcıda güvende; sorunu giderip tekrar deneyebilirsiniz.';
        var btn = kutu.querySelector('[data-deger]'); if (btn) btn.disabled = false;
        $('#dp-modal').onclick = function (ev) { if (ev.target.id === 'dp-modal') kapatFn(null); };
      });
    }
  }

  /* Yeni yüklenen görsellerin bu cihazdaki kopyası: GitHub Pages yeniden yayınlanana kadar görseller kırık görünmesin */
  function gorselOnbellekKaydet(gorseller) {
    if (!gorseller || !gorseller.length) return Promise.resolve();
    return ZI.depo.al('gorsel-onbellek').catch(function () { return null; }).then(function (o) {
      o = o || {};
      var simdiMs = Date.now();
      Object.keys(o).forEach(function (y) { if (!o[y] || simdiMs - (o[y].t || 0) > 3 * 86400000) delete o[y]; });
      gorseller.forEach(function (x) {
        var c = x.yol.split('.').pop();
        var tur = { webp: 'image/webp', jpg: 'image/jpeg', png: 'image/png', gif: 'image/gif', avif: 'image/avif' }[c] || 'image/webp';
        o[x.yol] = { t: simdiMs, v: 'data:' + tur + ';base64,' + x.b64 };
      });
      ZI.gorselOnbellek = Object.keys(o).reduce(function (m, y) { m[y] = o[y].v; return m; }, ZI.gorselOnbellek || {});
      return ZI.depo.koy('gorsel-onbellek', o).catch(function () { /* yok */ });
    });
  }

  /* =====================================================================
     İÇE / DIŞA AKTARMA
     ===================================================================== */
  function csvYaz(satirlar) {
    return '﻿' + satirlar.map(function (s) {
      return s.map(function (h) { h = h == null ? '' : String(h); return /[;"\n\r]/.test(h) ? '"' + h.replace(/"/g, '""') + '"' : h; }).join(';');
    }).join('\r\n');
  }
  function csvIndir() {
    var s = [['Ürün Kodu', 'Ürün Adı', 'Marka', 'Seri', 'Tür', 'Durum', 'Kozmetik', 'Pil Sağlığı (%)', 'Değişen Parça', 'Çıkış Yılı', 'Üretim Yılı', 'Seçenekler', 'Başlangıç Fiyatı (TL)', 'Stok', 'Sitede', 'Renkler', 'Eklenme']];
    S.veri.urunler.forEach(function (u) {
      s.push([u.kod, u.ad, u.marka, u.seri, turAdi(u), u.durum === 'ikinci-el' ? '2. El' : 'Sıfır', u.kozmetik, u.pilSagligi, u.degisenParca, u.cikisYili, u.uretimYili,
        (u.secenekler || []).map(function (x) { return x.ad + (x.fiyat != null ? ' = ' + x.fiyat : ''); }).join(' | '), ZI.baslangicFiyati(u), u.stok, u.aktif ? 'Evet' : 'Hayır',
        (u.renkler || []).map(function (r) { return r.ad; }).join(', '), tarihYaz(u.eklenme, true)]);
    });
    indir('zumrut-urunler-' + new Date().toISOString().slice(0, 10) + '.csv', csvYaz(s), 'text/csv;charset=utf-8');
  }
  function jsonIndir() {
    var yedek = { tur: 'zumrut-iletisim-yedek', surum: 1, tarih: simdi(), veri: S.veri, hareketler: S.hareketler };
    indir('zumrut-yedek-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(yedek, null, 2), 'application/json');
  }
  function jsonYukle(dosya) {
    if (!dosya) return;
    var r = new FileReader();
    r.onload = function () {
      var y;
      try { y = JSON.parse(r.result); } catch (e) { bildir('Dosya okunamadı: geçerli bir JSON değil.', true); return; }
      var veri = y && y.veri ? y.veri : (y && y.urunler ? y : null);
      if (!veri || !Array.isArray(veri.urunler)) { bildir('Bu dosya bir Zümrüt İletişim yedeği değil.', true); return; }
      onayla('Yedek geri yüklensin mi?', '<b>' + veri.urunler.length + ' ürün</b> içeren yedek, paneldeki mevcut verilerin yerine geçecek' + (y.tarih ? ' (yedek tarihi: ' + k(tarihYaz(y.tarih)) + ')' : '') + '. Yayınlayana kadar site etkilenmez.', 'Geri yükle', true).then(function (e) {
        if (!e) return;
        S.veri = ZI.normalize(veri);
        if (Array.isArray(y.hareketler)) S.hareketler = y.hareketler;
        degisti('Yedek geri yüklendi.');
        sekmeAc(S.sekme);
      });
    };
    r.readAsText(dosya);
  }
  function paketIndir() {
    var hazir = yayinHazirla();
    var dosyalar = [
      { yol: 'data/veri.js', metin: hazir.veriMetni },
      { yol: 'data/hareketler.js', metin: hazir.hareketMetni }
    ].concat(hazir.gorseller.map(function (g2) { return { yol: g2.yol, bayt: b64Bayt(g2.b64) }; }));
    indir('zumrut-yayin-paketi-' + new Date().toISOString().slice(0, 10) + '.zip', zipOlustur(dosyalar));
    modal({
      ikon: 'kutu', baslik: 'Yayın paketi indirildi',
      metin: 'ZIP dosyasını açın. GitHub’da deponuzun ana sayfasında <b>Add file → Upload files</b> deyip içindeki <b>data</b>' + (hazir.gorseller.length ? ' ve <b>assets</b>' : '') + ' klasörlerini sürükleyip bırakın, ardından <b>Commit changes</b>’a basın. Site 1–2 dakika içinde güncellenir.',
      butonlar: [{ metin: 'Daha sonra', deger: 'iptal', sinif: 'dp-btn--cizgi' }, { metin: 'Yükledim, yayınlandı olarak işaretle', deger: 'tamam', sinif: 'dp-btn--turuncu', varsayilan: true }]
    }).then(function (v) {
      if (v !== 'tamam') return;
      S.veri = ZI.normalize(hazir.veri); S.yayinlanmadi = false; S.degisiklik = 0;
      taslakKaydet(); ustDurum();
      if (S.sekme === 'urunler') { bantlarCiz(); tabloCiz(); }
      bildir('Yayınlandı olarak işaretlendi.');
    });
  }

  /* =====================================================================
     BAŞLAT
     ===================================================================== */
  ZI.hazir(function () {
    ustCiz();
    var anaAlan = $('#dp-ana');
    anaAlan.addEventListener('click', aracIslem);
    anaAlan.addEventListener('change', function (e) { if (e.target.matches('[data-islem="json-yukle"]')) { acilirKapat(); jsonYukle(e.target.files[0]); e.target.value = ''; } });
    ZI.gorselOnbellekYukle().then(veriYukle).then(function () {
      var hedef = (location.hash || '').replace('#', '');
      sekmeAc(hedef || 'urunler', true);
      ustDurum();
    }).catch(function (e) {
      $('#dp-ana').innerHTML = '<div class="dp-yukleniyor"><p>Veriler yüklenemedi: ' + k(e && e.message || e) + '</p><button class="dp-btn dp-btn--turuncu" onclick="location.reload()">Tekrar dene</button></div>';
    });
  });
})(window);
