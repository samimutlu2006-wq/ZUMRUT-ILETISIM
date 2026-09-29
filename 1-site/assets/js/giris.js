/*!
 * Zümrüt İletişim — Yönetici girişi
 */
(function (g) {
  'use strict';
  var ZI = g.ZI, d = document, $ = ZI.$;
  var KILIT_ANAHTARI = 'zi-giris-deneme';

  ZI.hazir(function () {
    d.documentElement.classList.remove('no-js');
    ZI.navCiz();
    ZI.veriYukle().then(function (v) { ZI.navDoldur(v); });
    $('#giris-tas').innerHTML = ZI.logo('tam', 'zi-logo');

    // Zaten giriş yapılmışsa doğrudan panele geç
    if (ZI.guvenlik.oturum()) { location.replace('depo.html'); return; }

    var form = $('#giris-formu'), hata = $('#hata'), btn = $('#giris-btn');
    var kayitlar = null;
    var kayitSozu = kayitYukle().then(function (k) { kayitlar = k; return k; });

    $('#goz').addEventListener('click', function () {
      var s = $('#sifre'), acik = s.type === 'password';
      s.type = acik ? 'text' : 'password';
      this.setAttribute('aria-pressed', acik ? 'true' : 'false');
      this.setAttribute('aria-label', acik ? 'Şifreyi gizle' : 'Şifreyi göster');
      s.focus();
    });
    ['kullanici', 'sifre'].forEach(function (id) {
      $('#' + id).addEventListener('input', function () { hataGizle(); });
    });
    setTimeout(function () { $('#kullanici').focus(); }, 300);

    if (!ZI.guvenlik.destekVar()) {
      hataGoster('Bu sayfa güvenli (https) bağlantıyla açılmadığı ya da tarayıcınız desteklemediği için giriş yapılamıyor. Siteyi GitHub Pages adresinden (https://…github.io) açın.');
      btn.disabled = true;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var kullanici = $('#kullanici').value.trim(), sifre = $('#sifre').value;
      if (!kullanici || !sifre) { hataGoster('Kullanıcı adı ve şifre gerekli.'); titret(); return; }
      var kilit = kilitDurumu();
      if (kilit > 0) { hataGoster('Çok fazla hatalı deneme. ' + Math.ceil(kilit / 1000) + ' saniye sonra tekrar deneyin.'); return; }
      yukleniyor(true);
      kayitSozu.then(function (k) {
        if (!k || !k.length) throw new Error('kayit');
        return ZI.guvenlik.dogrula(k[0], kullanici, sifre).then(function (s) { s.kayit = k[0]; return s; });
      }).then(function (s) {
        if (!s.tamam) {
          denemeEkle();
          yukleniyor(false);
          hataGoster('Kullanıcı adı veya şifre hatalı.');
          titret();
          $('#sifre').select();
          return;
        }
        try { sessionStorage.removeItem(KILIT_ANAHTARI); } catch (x) { /* yok */ }
        ZI.guvenlik.oturumAc({
          kullanici: s.kayit.kullanici, zaman: Date.now(), token: s.token || null,
          varsayilan: !!s.kayit.varsayilan, anahtarCozulemedi: !!s.anahtarCozulemedi
        });
        btn.querySelector('span').textContent = 'Giriş başarılı';
        d.body.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: 'forwards', easing: 'ease-in' });
        setTimeout(function () { location.href = 'depo.html'; }, 240);
      }).catch(function (err) {
        yukleniyor(false);
        hataGoster(err && err.message === 'kayit'
          ? 'Yönetici kaydı (data/yonetici.js) okunamadı. Dosyanın depoda olduğundan emin olun.'
          : 'Giriş sırasında bir hata oluştu. Sayfayı yenileyip tekrar deneyin.');
      });
    });

    function yukleniyor(evet) {
      btn.disabled = evet;
      btn.innerHTML = evet ? '<span class="zi-donen" aria-hidden="true"></span><span>Doğrulanıyor…</span>'
        : '<span>Giriş Yap</span>' + ZI.ikon('sag');
    }
    function hataGoster(m) { hata.hidden = false; hata.innerHTML = ZI.ikon('bilgi') + '<span>' + ZI.kacis(m) + '</span>'; $$alan().forEach(function (a) { a.classList.add('hata'); }); }
    function hataGizle() { hata.hidden = true; $$alan().forEach(function (a) { a.classList.remove('hata'); }); }
    function $$alan() { return ZI.$$('.zi-alan', form); }
    function titret() { form.classList.remove('zi-titre'); void form.offsetWidth; form.classList.add('zi-titre'); }
  });

  /* Yayındaki kayıt + (varsa) bu cihazda şifre değiştirildikten sonra saklanan daha yeni kayıt */
  function kayitYukle() {
    return new Promise(function (coz) {
      var s = d.createElement('script');
      s.src = 'data/yonetici.js?v=' + Date.now();
      s.onload = function () { coz(g.ZI_YONETICI || null); };
      s.onerror = function () { coz(null); };
      d.head.appendChild(s);
    }).then(function (yayin) {
      var yerel = ZI.yerelAl('zi-yonetici-yerel', null);
      var yz = yayin && yayin.guncelleme ? Date.parse(yayin.guncelleme) : 0;
      var lz = yerel && yerel.guncelleme ? Date.parse(yerel.guncelleme) : 0;
      if (yerel && lz > yz) return [yerel];
      if (yerel && lz <= yz) ZI.yerelSil('zi-yonetici-yerel');
      return yayin ? [yayin] : [];
    });
  }

  function denemeler() { try { return JSON.parse(sessionStorage.getItem(KILIT_ANAHTARI) || '[]'); } catch (e) { return []; } }
  function denemeEkle() {
    var l = denemeler().filter(function (t) { return Date.now() - t < 10 * 60 * 1000; });
    l.push(Date.now());
    try { sessionStorage.setItem(KILIT_ANAHTARI, JSON.stringify(l)); } catch (e) { /* yok */ }
  }
  function kilitDurumu() {
    var l = denemeler().filter(function (t) { return Date.now() - t < 10 * 60 * 1000; });
    if (l.length < 5) return 0;
    var bekle = 30000 * Math.pow(2, Math.min(4, l.length - 5));
    return Math.max(0, l[l.length - 1] + bekle - Date.now());
  }
})(window);
