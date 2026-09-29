/*!
 * Zümrüt İletişim — GitHub yayınlama modülü
 * Depo panelindeki değişiklikleri GitHub REST API (Git Data API) ile TEK bir commit olarak gönderir.
 * GitHub Pages bu commit'ten sonra siteyi otomatik olarak yeniden yayınlar.
 */
(function (g) {
  'use strict';
  var ZI = g.ZI = g.ZI || {};
  var API = 'https://api.github.com';

  function ayar() { return ZI.yerelAl('zi-github', null); }
  function ayarKaydet(a) { ZI.yerelKoy('zi-github', a); }

  /* github.io adresinden kullanıcı/depo tahmini */
  function tahmin() {
    var h = location.hostname || '';
    var m = h.match(/^([a-z0-9-]+)\.github\.io$/i);
    if (!m) return null;
    var sahip = m[1];
    var parca = location.pathname.split('/').filter(Boolean);
    var depo = parca.length && !/\.html?$/i.test(parca[0]) ? parca[0] : sahip + '.github.io';
    return { sahip: sahip, depo: depo, dal: 'main' };
  }

  function HataGH(mesaj, durum, ayrinti) { var e = new Error(mesaj); e.durum = durum; e.ayrinti = ayrinti; return e; }
  function hataMetni(durum, govde) {
    var msg = govde && govde.message ? String(govde.message) : '';
    if (durum === 401) return 'GitHub erişim anahtarı geçersiz ya da süresi dolmuş. Ayarlar’dan yeni bir anahtar girin.';
    if (durum === 403 && /rate limit/i.test(msg)) return 'GitHub istek sınırına ulaşıldı. Birkaç dakika sonra tekrar deneyin.';
    if (durum === 403) return 'Anahtarın bu depoya yazma izni yok. Anahtarı oluştururken “Contents: Read and write” iznini verin.';
    if (durum === 404) return 'Depo ya da dosya bulunamadı. Kullanıcı adı, depo adı ve dal adını kontrol edin; anahtarın bu depoya erişimi olduğundan emin olun.';
    if (durum === 409) return 'Depo boş ya da dal bulunamadı. Önce site dosyalarını depoya yükleyin.';
    if (durum === 422) return 'GitHub isteği kabul etmedi' + (msg ? ': ' + msg : '.');
    if (durum >= 500) return 'GitHub şu an yanıt vermiyor. Biraz sonra tekrar deneyin.';
    return 'GitHub hatası (' + durum + ')' + (msg ? ': ' + msg : '');
  }

  function istek(token, yol, secenek) {
    secenek = secenek || {};
    var basliklar = { Accept: secenek.accept || 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    if (token) basliklar.Authorization = 'Bearer ' + token;
    if (secenek.govde) basliklar['Content-Type'] = 'application/json';
    return fetch(API + yol, { method: secenek.yontem || 'GET', headers: basliklar, body: secenek.govde ? JSON.stringify(secenek.govde) : undefined, cache: 'no-store' })
      .catch(function () { throw HataGH('GitHub’a bağlanılamadı. İnternet bağlantınızı kontrol edin.', 0); })
      .then(function (r) {
        if (secenek.ham && r.ok) return r.text();
        return r.text().then(function (t) {
          var j = null;
          try { j = t ? JSON.parse(t) : null; } catch (e) { j = null; }
          if (!r.ok) throw HataGH(hataMetni(r.status, j), r.status, j);
          return j;
        });
      });
  }
  function yolDepo(a) { return '/repos/' + encodeURIComponent(a.sahip) + '/' + encodeURIComponent(a.depo); }
  function yolKodla(p) { return p.split('/').map(encodeURIComponent).join('/'); }

  function utf8B64(metin) {
    var b = new TextEncoder().encode(metin), s = '', parca = 0x8000;
    for (var i = 0; i < b.length; i += parca) s += String.fromCharCode.apply(null, b.subarray(i, i + parca));
    return btoa(s);
  }
  function b64Utf8(b64) {
    var ikili = atob(String(b64 || '').replace(/\s/g, '')), b = new Uint8Array(ikili.length);
    for (var i = 0; i < ikili.length; i++) b[i] = ikili.charCodeAt(i);
    return new TextDecoder().decode(b);
  }

  /* Depo erişimini ve yazma iznini denetle */
  function test(token, a) {
    return istek(token, yolDepo(a)).then(function (d) {
      var yazma = d && d.permissions ? !!(d.permissions.push || d.permissions.admin || d.permissions.maintain) : null;
      if (yazma === false) throw HataGH('Bu anahtarın depoya yazma izni yok. “Contents: Read and write” izni gerekli.', 403);
      return { depo: d.full_name, varsayilanDal: d.default_branch, gizli: d.private, yazma: yazma };
    });
  }

  /* Bir dosyanın en güncel içeriğini ve blob sha'sını oku */
  function dosyaOku(token, a, yol) {
    return istek(token, yolDepo(a) + '/contents/' + yolKodla(yol) + '?ref=' + encodeURIComponent(a.dal || 'main')).then(function (j) {
      if (j && j.content && j.encoding === 'base64') return { metin: b64Utf8(j.content), sha: j.sha };
      return istek(token, yolDepo(a) + '/contents/' + yolKodla(yol) + '?ref=' + encodeURIComponent(a.dal || 'main'), { accept: 'application/vnd.github.raw+json', ham: true })
        .then(function (t) { return { metin: t, sha: j && j.sha }; });
    });
  }
  function klasorListele(token, a, yol) {
    return istek(token, yolDepo(a) + '/contents/' + yolKodla(yol) + '?ref=' + encodeURIComponent(a.dal || 'main'))
      .then(function (j) { return Array.isArray(j) ? j : []; }, function (e) { if (e.durum === 404) return []; throw e; });
  }

  /* window.X = {...}; biçimindeki veri dosyasını çöz */
  function jsVeriCoz(metin) {
    var i = metin.indexOf('='), j = metin.lastIndexOf(';');
    if (i < 0) throw new Error('Veri dosyası okunamadı');
    return JSON.parse(metin.slice(i + 1, j > i ? j : undefined).trim());
  }
  function jsVeriYaz(degisken, nesne, aciklama) {
    return '/* ' + aciklama + ' */\nwindow.' + degisken + ' = ' + JSON.stringify(nesne, null, 2) + ';\n';
  }

  /*
   * Tek commit ile birden çok dosya yaz / sil.
   * dosyalar: [{ yol, metin } | { yol, b64 }], silinecekler: [yol], ilerleme(fn)
   */
  function commitGonder(token, a, dosyalar, silinecekler, mesaj, ilerleme) {
    var dal = a.dal || 'main', bas = yolDepo(a);
    var adim = function (m) { if (ilerleme) ilerleme(m); };
    var tabanCommit, tabanAgac;
    adim('Depo bilgisi alınıyor…');
    return istek(token, bas + '/git/ref/heads/' + encodeURIComponent(dal))
      .then(function (ref) {
        tabanCommit = ref.object.sha;
        return istek(token, bas + '/git/commits/' + tabanCommit);
      })
      .then(function (c) {
        tabanAgac = c.tree.sha;
        var sonuc = [], i = 0;
        function sirayla() {
          if (i >= dosyalar.length) return Promise.resolve(sonuc);
          var f = dosyalar[i++];
          adim('Dosya gönderiliyor (' + i + '/' + dosyalar.length + '): ' + f.yol);
          var govde = f.b64 != null ? { content: f.b64, encoding: 'base64' } : { content: utf8B64(f.metin), encoding: 'base64' };
          return istek(token, bas + '/git/blobs', { yontem: 'POST', govde: govde }).then(function (b) {
            sonuc.push({ path: f.yol, mode: '100644', type: 'blob', sha: b.sha });
            return sirayla();
          });
        }
        return sirayla();
      })
      .then(function (agacOgeleri) {
        (silinecekler || []).forEach(function (y) { agacOgeleri.push({ path: y, mode: '100644', type: 'blob', sha: null }); });
        adim('Değişiklikler birleştiriliyor…');
        return istek(token, bas + '/git/trees', { yontem: 'POST', govde: { base_tree: tabanAgac, tree: agacOgeleri } });
      })
      .then(function (agac) {
        return istek(token, bas + '/git/commits', { yontem: 'POST', govde: { message: mesaj, tree: agac.sha, parents: [tabanCommit] } });
      })
      .then(function (yeni) {
        adim('Yayın kaydediliyor…');
        return istek(token, bas + '/git/refs/heads/' + encodeURIComponent(dal), { yontem: 'PATCH', govde: { sha: yeni.sha, force: false } })
          .then(function () { return { commit: yeni.sha, url: yeni.html_url }; });
      });
  }

  ZI.github = {
    ayar: ayar, ayarKaydet: ayarKaydet, tahmin: tahmin, test: test, dosyaOku: dosyaOku, klasorListele: klasorListele,
    commitGonder: commitGonder, jsVeriCoz: jsVeriCoz, jsVeriYaz: jsVeriYaz, utf8B64: utf8B64
  };
})(window);
