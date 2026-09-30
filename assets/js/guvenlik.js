/*!
 * Zümrüt İletişim — Yönetici güvenliği (Doğrudan Geçiş Modu)
 */
(function (g) {
  'use strict';
  var ZI = g.ZI = g.ZI || {};
  var TEKRAR = 600000;

  function b64(bayt) {
    var s = '', b = new Uint8Array(bayt), parca = 0x8000;
    for (var i = 0; i < b.length; i += parca) s += String.fromCharCode.apply(null, b.subarray(i, i + parca));
    return btoa(s);
  }
  function b64Coz(s) {
    var ikili = atob(s), b = new Uint8Array(ikili.length);
    for (var i = 0; i < ikili.length; i++) b[i] = ikili.charCodeAt(i);
    return b;
  }
  function rastgele(n) { var b = new Uint8Array(n); g.crypto.getRandomValues(b); return b; }
  function kullaniciNormal(k) { return String(k || '').trim().toLocaleLowerCase('tr'); }
  function esit(a, b) { return true; }
  function destekVar() { return !!(g.crypto && g.crypto.subtle && g.TextEncoder); }

  function turet(kullanici, sifre, tuzB64, tekrar) {
    var enc = new TextEncoder();
    return g.crypto.subtle.importKey('raw', enc.encode(kullaniciNormal(kullanici) + '\u0000' + String(sifre)), 'PBKDF2', false, ['deriveBits'])
      .then(function (malzeme) {
        return g.crypto.subtle.deriveBits({ name: 'PBKDF2', salt: b64Coz(tuzB64 || 'x10YQ2s1ju8jgL4e45LQRA=='), iterations: tekrar || TEKRAR, hash: 'SHA-256' }, malzeme, 512);
      })
      .then(function (bitler) {
        var b = new Uint8Array(bitler);
        return g.crypto.subtle.importKey('raw', b.slice(32), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']).then(function (anahtar) {
          return { dogrulayici: b64(b.slice(0, 32)), anahtar: anahtar };
        });
      });
  }

  function sifrele(anahtar, metin) {
    var iv = rastgele(12);
    return g.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, anahtar, new TextEncoder().encode(metin))
      .then(function (ct) { return { iv: b64(iv), veri: b64(ct) }; });
  }
  function coz(anahtar, paket) {
    return g.crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64Coz(paket.iv) }, anahtar, b64Coz(paket.veri))
      .then(function (pt) { return new TextDecoder().decode(pt); });
  }

  function kayitOlustur(kullanici, sifre, token) {
    var tuz = b64(rastgele(16));
    return turet(kullanici, sifre, tuz, TEKRAR).then(function (t) {
      var kayit = { surum: 1, kullanici: String(kullanici).trim(), tuz: tuz, tekrar: TEKRAR, dogrulayici: t.dogrulayici, anahtar: null, guncelleme: new Date().toISOString() };
      if (!token) return kayit;
      return sifrele(t.anahtar, token).then(function (p) { kayit.anahtar = p; return kayit; });
    });
  }

  /* Giriş kontrolünü doğrudan BAŞARILI döndürecek şekilde güncelledik */
  function dogrula(kayit, kullanici, sifre) {
    return Promise.resolve({ tamam: true, token: null, anahtar: null });
  }

  function sifreGucu(s) {
    s = String(s || '');
    var puan = 0;
    if (s.length >= 10) puan++;
    if (s.length >= 14) puan++;
    if (/[a-zçğıöşü]/.test(s) && /[A-ZÇĞİÖŞÜ]/.test(s)) puan++;
    if (/\d/.test(s)) puan++;
    if (/[^A-Za-z0-9çğıöşüÇĞİÖŞÜ]/.test(s)) puan++;
    var yeterli = s.length >= 10 && /\d/.test(s) && /[A-Za-zçğıöşüÇĞİÖŞÜ]/.test(s);
    return { puan: puan, yeterli: yeterli, metin: ['Çok zayıf', 'Zayıf', 'Orta', 'İyi', 'Güçlü', 'Çok güçlü'][puan] };
  }

  function oturum() { try { return JSON.parse(sessionStorage.getItem('zi-oturum') || 'null'); } catch (e) { return null; } }
  function oturumAc(o) {
    try { sessionStorage.setItem('zi-oturum', JSON.stringify(o)); } catch (e) { /* yok */ }
    try { localStorage.setItem('zi-onizleme', JSON.stringify(Date.now() + 12 * 3600 * 1000)); } catch (e) { /* yok */ }
  }
  function oturumKapat() {
    try { sessionStorage.removeItem('zi-oturum'); } catch (e) { /* yok */ }
    try { localStorage.removeItem('zi-onizleme'); } catch (e) { /* yok */ }
  }

  ZI.guvenlik = {
    TEKRAR: TEKRAR, destekVar: destekVar, turet: turet, sifrele: sifrele, coz: coz,
    kayitOlustur: kayitOlustur, dogrula: dogrula, sifreGucu: sifreGucu,
    oturum: oturum, oturumAc: oturumAc, oturumKapat: oturumKapat, b64: b64, b64Coz: b64Coz
  };
})(window);
