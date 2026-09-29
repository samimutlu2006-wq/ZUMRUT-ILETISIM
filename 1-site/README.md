# Zümrüt İletişim · Web Sitesi ve Depo Takip Paneli

Kayseri Kocasinan’daki **Zümrüt İletişim** mağazası için hazırlanmış, Apple tasarım diline uygun, telefon / tablet / bilgisayarda düzgün görünen bir vitrin sitesi ve siyah-turuncu **depo takip paneli**.

- Sitede **satış yapılmaz**. Ürün sayfalarında “Satın Al / Sepete Ekle” yerine **Hemen Ara** ve **WhatsApp ile İletişime Geç** düğmeleri vardır.
- Site **GitHub Pages** üzerinde ücretsiz çalışır; sunucu, veritabanı ya da ek hizmet gerekmez.
- Ürünler, fiyatlar, stoklar, fotoğraflar, mağaza bilgileri ve ana sayfa vitrini **yönetici panelinden** değiştirilir ve **Yayınla** düğmesiyle siteye aktarılır.

> **Siteyi daha önce kurduysanız ve bu sürüme geçiyorsanız** en alttaki “10. Yeni sürüme geçiş” bölümüne bakın.

---

## 1. Siteyi GitHub’da yayına alma (bir kez)

1. **GitHub hesabı açın** (varsa giriş yapın): <https://github.com>
2. Sağ üstteki **+** → **New repository**.
   - **Repository name:** örneğin `zumrut-iletisim`
     (Sitenin adresi `https://KULLANICI-ADINIZ.github.io/zumrut-iletisim/` olur. Adresin kısa olmasını istiyorsanız depoya tam olarak `KULLANICI-ADINIZ.github.io` adını verin; o zaman adres `https://KULLANICI-ADINIZ.github.io/` olur.)
   - **Public** seçili kalsın → **Create repository**.
3. Açılan sayfada **uploading an existing file** bağlantısına tıklayın.
   GitHub bir seferde en fazla **100 dosya** kabul eder; site ise ürün fotoğraflarıyla birlikte 100’den fazla dosyadan oluşur. Bu yüzden iki seferde yükleyin:
   - **1. yükleme:** ZIP’ten çıkan klasörü açın, önce `assets/img/urunler` klasörünü klasörün dışına (ör. masaüstüne) taşıyın. Kalan her şeyi (index.html, assets, data …) sürükleyip bırakın → en altta **Commit changes**.
   - **2. yükleme:** Depoda `assets` → `img` klasörüne girin → **Add file → Upload files** → kenara aldığınız `urunler` klasörünü sürükleyip bırakın → **Commit changes**.
   > İpucu: `.nojekyll` adlı gizli dosya bilgisayarınızda görünmeyebilir; yüklenmese de site çalışır. Bilgisayarda **GitHub Desktop** kullanıyorsanız dosya sınırı yoktur, tek seferde gönderebilirsiniz.
4. Depoda **Settings** → sol menüde **Pages** →
   **Source:** *Deploy from a branch* · **Branch:** `main` ve `/ (root)` → **Save**.
5. 1–2 dakika sonra aynı sayfanın üstünde sitenizin adresi görünür. Açın; site hazır.

> Özel alan adı (ör. `zumrutiletisim.com`) kullanmak isterseniz: **Settings → Pages → Custom domain**. Alan adınızın DNS ayarlarını GitHub’ın gösterdiği şekilde yapın ve **Enforce HTTPS** kutusunu işaretleyin.

---

## 2. Yönetici girişi ve ilk kurulum

Sitenin sağ üst köşesindeki **kişi simgesi (Yönetici)** giriş sayfasını açar (`giris.html`).

| | |
|---|---|
| Varsayılan kullanıcı adı | `admin` |
| Varsayılan şifre | `zumrut2026` |

> ⚠️ Varsayılan şifre bu dosyada yazdığı için herkesçe bilinir. **İlk girişte mutlaka değiştirin** (aşağıdaki adımlar bunu da yapar).

### GitHub bağlantısını kurun (önerilir — bir kez yapılır)

Panelde yaptığınız değişikliklerin tek tıkla siteye aktarılması için panelin GitHub’a yazabilmesi gerekir. Bunun için sınırlı yetkili bir **erişim anahtarı** oluşturacaksınız:

1. GitHub’da sağ üstte profil resminiz → **Settings** → en altta **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. **Token name:** `Zümrüt İletişim paneli` · **Expiration:** en uzun süreyi seçin (ör. 1 yıl).
3. **Repository access:** **Only select repositories** → sitenin deposunu seçin.
4. **Permissions → Repository permissions → Contents:** **Read and write**. (Başka izin vermeyin.)
5. **Generate token** → `github_pat_…` ile başlayan anahtarı kopyalayın.
6. Panelde **Ayarlar** sekmesi → **GitHub bağlantısı**:
   - Kullanıcı adı ve depo adı GitHub Pages adresinden otomatik dolar (dolmazsa elle yazın).
   - Anahtarı yapıştırın, **“Anahtarı şifreli olarak depoya kaydet”** açık kalsın.
   - **Yeni şifre** belirleyin (en az 10 karakter, harf ve rakam; 12+ karakter önerilir).
   - **Kaydet ve bağlan**.

Artık **telefon, tablet ya da bilgisayar fark etmeksizin** yalnızca kullanıcı adı ve şifreyle giriş yapıp yayınlayabilirsiniz. Anahtar, şifrenizle şifrelenmiş olarak depoda durur; şifreniz hiçbir yere kaydedilmez.

---

## 3. Günlük kullanım

### Ürün ekleme / düzenleme
- **Yeni Ekle** (ya da ekranın altındaki turuncu **+**) → form açılır:
  - **Görseller:** fotoğrafları sürükleyip bırakın ya da seçin (telefon fotoğrafları otomatik küçültülür). İlk görsel kapaktır. Ürünün birden çok rengi varsa **her fotoğrafın altından rengini seçin**; sitede o renge tıklayan müşteri o rengin fotoğraflarını görür. Fotoğraf eklemezseniz ürün türüne ve renge göre hazır bir çizim gösterilir.
  - **Temel bilgiler:** ad, marka, seri, kategori (Telefon / Tablet / Laptop / Aksesuar), katlanabilir mi, rozet (**Yeni** turuncu görünür), **ürün kodu** (etiketteki takip numaranızı, ör. `SY007`, yazabilirsiniz; boş bırakırsanız otomatik verilir), kısa açıklama.
  - **Durum:** *Sıfır / Kapalı kutu* ya da *İkinci el* (kozmetik: Kusursuz, Mükemmel, Çok Temiz, Temiz…), **pil sağlığı %**, **şarj döngüsü (devir)**, **garanti** (ör. “Firma garantili”, “23 ay garantili”), **değişen parça**, **çıkış yılı**, **üretim yılı**.
  - **Fiyat ve stok:** **Satış fiyatı** (sitede görünen fiyat) ve stok adedi. Hafıza ya da model gibi seçenekleri ayrı fiyatla göstermek isterseniz **Seçenek ekle** (ör. 128 GB — 64.999, 256 GB — 69.999). *Sitede göster*, *Ana sayfada öne çıkar*.
  - **Renkler:** sitede renk seçici olarak görünür.
  - **Sistem ve teknik özellikler:** işlemci, RAM, depolama, ekran, kameralar, batarya, işletim sistemi…
- Tablodaki ürün adına tıklayarak düzenleyin; satırın sonundaki **⋮** menüsünde *Fiyat gir, Stok girişi / çıkışı, Stok hareketleri, Kopyala, Sitede görüntüle, Sil* vardır.

### Fiyat girme
- **Fiyatlar** sekmesi: tüm ürünlerin fiyatları tek ekranda. Kutuya fiyatı yazın, **Enter** ile bir sonrakine geçin; bitince alttaki **Fiyatları kaydet**. Üstteki listeden “Fiyatı girilmemiş”, “İkinci el”, “Kılıflar” gibi gruplar seçilebilir.
- **Toplu fiyat değiştir (%)**: listelenen ürünlere yüzdeyle zam ya da indirim yapar; “sonu 9’la bitsin (ör. 64.999)” gibi yuvarlama seçenekleri vardır. Sonucu kaydetmeden önce listede görürsünüz; beğenmezseniz **Geri al**.
- **Ürünler** tablosunda **Fiyat** sütunundaki tutara (ya da turuncu **Fiyat gir** düğmesine) tıklayarak tek bir ürünün fiyatını hızlıca değiştirebilirsiniz.
- Fiyatı girilmemiş ürünlerde sitede “Fiyat için mağazamızı arayın” yazar; panelin üstündeki turuncu bant kaç üründe fiyat eksik olduğunu gösterir.
- Birden çok ürünü seçip **Sil** ile toplu silebilirsiniz. Satırdaki anahtarla ürünü siteden gizleyebilirsiniz (silmeden).

### Stok takibi
- Tablodaki **stok sayısına** tıklayın → **Stok girişi** (alım, takas, iade) ya da **Stok çıkışı** (satış, fire).
- Her işlem **Stok Hareketleri** sekmesine tarih, adet, önceki → sonraki stok ve açıklamayla kaydedilir; Excel’e (CSV) aktarılabilir.
- Üstteki **Kritik / tükenen stok** kutusuna tıklayınca stoğu 1 ve altındaki ürünler listelenir.

### Yayınlama
- Değişiklikler önce **bu tarayıcıda** saklanır (sayfayı kapatsanız da kaybolmaz). Üst çubukta “N yayınlanmamış değişiklik” yazar.
- **Yayınla** → değişiklikler ve yeni fotoğraflar tek seferde GitHub’a gönderilir; site **1–2 dakika** içinde herkes için güncellenir. Kullanılmayan eski fotoğraflar depodan otomatik silinir.
- Aynı tarayıcıda **Siteyi Gör** ile açılan site, yayınlanmamış değişiklikleri de gösterir (altta “Önizleme” bandı çıkar). Ziyaretçiler yalnızca yayınlananı görür.

### Mağaza & Vitrin
- Telefon, WhatsApp numarası, e-posta, adres, tanıtım metni, fiyat notu, harita konumu.
- **Çalışma saatleri** (sitede “Şu an açık / kapalı” buna göre hesaplanır).
- **Mağaza fotoğrafı.**
- **Lansman vitrini:** ana sayfada 5 saniyede bir kayan slaytlar. **Slayt ekle** → **Fotoğraf** düzeninde kendi görselinizi (en fazla 3) yükleyin; zemin rengi ve yazı rengi fotoğraftan otomatik ayarlanır (**Fotoğraftan al** ile tekrar hesaplatabilir ya da renkleri elle seçebilirsiniz).
  - *Yerleşim:* “Sağda, tam boy” yakın çekim telefon fotoğrafları için; “Altta, ortada” geniş grup fotoğrafları için; “Köşeleri yuvarlak kart” renkli, çerçeveli görseller için.
  - *Beyaz zemini gizle:* beyaz arka planlı ürün fotoğraflarında beyazı slaytın zeminiyle kaynaştırır.
  - Başlık, alt başlık ve iki düğmenin metni / bağlantısı değiştirilebilir. Bağlantı örnekleri: `urun.html?id=iphone-18-pro`, `urunler.html?k=iphone`, `whatsapp:Mesajınız`.

### Katalog
Katalogda **61 ürün** var:
- **Mağazanın kendi fotoğraflarından eklenen 21 ürün:** 8 ikinci el telefon (etiketlerindeki takip no, hafıza, pil, kozmetik ve garanti bilgileriyle), 9 kılıf modeli (64 fotoğraf, renklere göre), 3 kulaklık (Marshall Major V, JBL Tune 520BT, ttec AirBeat Clap) ve kalp şeklinde LED selfie ışığı. **Bunların fiyatları boş**; **Fiyatlar** sekmesinden girin. Kılıfların stok adedi fotoğraf sayısı kadar girildi, kontrol edin.
- Sıfır cihazlar (iPhone Duo, iPhone 18 Pro, Galaxy S26, Z Fold8, Xiaomi 17T…) gerçek model bilgileri ve 27 Eylül 2026 tarihli resmi Türkiye liste fiyatlarıyla girildi. **Stok adetleri örnektir.**
- **“Örnek” etiketli 10 ürün** (şarj aleti, kırılmaz cam ve araç tutucu örnekleri) temsilidir. Kendi ürünlerinizi ekledikten sonra panelde **Örnekleri sil** ile kaldırın.

---

## 4. GitHub bağlantısı olmadan yayınlama (elle)

Anahtar oluşturmak istemezseniz: panelde **İçe / Dışa Aktar → Yayın paketini indir (ZIP)**.
ZIP’i açın, içindeki `data` (ve varsa `assets`) klasörlerini GitHub’da deponun ana sayfasına sürükleyip bırakın (**Add file → Upload files**) → **Commit changes**. Ardından panelde “Yükledim, yayınlandı olarak işaretle”ye basın.

---

## 5. Yedekleme

- **Yedek indir (JSON):** ürünler, mağaza bilgileri, vitrin ve stok hareketlerinin tamamı. Ara ara alıp bilgisayarınızda saklayın.
- **Yedekten geri yükle:** yedek dosyasını seçin, sonra **Yayınla**.
- **Excel’e aktar (CSV):** ürün listesini Excel’de açmak için.
- Ayrıca GitHub her yayını bir kayıt (commit) olarak sakladığı için eski hâllere depodan da dönülebilir.

---

## 6. Güvenlik

- Şifre hiçbir yerde açık olarak tutulmaz. `data/yonetici.js` yalnızca şifreden türetilmiş bir doğrulama özeti içerir (PBKDF2-SHA256, 600.000 tekrar).
- GitHub anahtarı şifrenizle **AES-GCM** kullanılarak şifrelenip depoda saklanır. Anahtar yalnızca bu depoya ve yalnızca dosya içeriklerine (Contents) erişebilir.
- Depo herkese açık olduğundan güvenliğiniz şifrenizin gücüne bağlıdır: **en az 12 karakterlik, tahmin edilemez** bir şifre kullanın ve kimseyle paylaşmayın.
- Anahtarın ele geçtiğinden şüphelenirseniz GitHub’da **Settings → Developer settings → Fine-grained tokens** bölümünden anahtarı silin, yenisini oluşturup panelden girin.
- Panel oturumu yalnızca açık sekmede geçerlidir; sekmeyi kapatınca yeniden giriş gerekir.

### Şifremi unuttum
1. GitHub’da depodaki `data/yonetici.js` dosyasını açın → kalem simgesi (**Edit**).
2. İçeriği tamamen silip aşağıdakini yapıştırın → **Commit changes**:

```js
/* Zümrüt İletişim · Yönetici giriş kaydı. Şifre burada SAKLANMAZ; yalnızca doğrulama özeti bulunur. Panelden şifre değiştirildiğinde otomatik güncellenir. */
window.ZI_YONETICI = {
  "surum": 1,
  "kullanici": "admin",
  "tuz": "x10YQ2s1ju8jgL4e45LQRA==",
  "tekrar": 600000,
  "dogrulayici": "fms4yE/cToT0Tgh53O/uHuUH3NvdMrb4hGhiq+hr4j4=",
  "anahtar": null,
  "varsayilan": true,
  "guncelleme": "2026-09-27T09:00:00.000Z"
};
```

3. 1–2 dakika sonra `admin` / `zumrut2026` ile girin ve **2. bölümdeki** GitHub kurulumunu yeniden yapın (yeni şifre belirleyerek).

---

## 7. Dosya yapısı

```
index.html          Ana sayfa (alt menü, lansman vitrini, öne çıkanlar, aksesuarlar, biz kimiz + harita)
urunler.html        Kategori / arama listesi (ör. urunler.html?k=iphone, ?k=ikinci-el, ?q=galaxy)
urun.html           Ürün detay sayfası (urun.html?id=…)
giris.html          Yönetici girişi
depo.html           Depo takip paneli (siyah & turuncu)
404.html            Bulunamadı sayfası
data/veri.js        Ürünler, mağaza bilgileri, vitrin  ← panel otomatik günceller
data/hareketler.js  Stok hareketleri                   ← panel otomatik günceller
data/yonetici.js    Yönetici giriş kaydı               ← panel otomatik günceller
assets/css          site.css (genel), depo.css (panel)
assets/js           ortak.js, anasayfa.js, urun.js, liste.js, cizim.js,
                    giris.js, guvenlik.js, github.js, depo.js
assets/img          logo.svg, logo-beyaz.svg, logo-isaret.svg, magaza.jpg, og-kapak.jpg, apple-touch-icon.png,
                    urunler/ (ürün fotoğrafları ve panelden yüklenen görseller), vitrin/ (ana sayfa slayt fotoğrafları)
assets/fonts        Inter yazı tipi (SIL Open Font License, OFL-Inter.txt)
```

---

## 8. Bilinmesi gerekenler

- **Yazı tipi:** Apple cihazlarda Apple’ın kendi yazı tipi (SF Pro) kullanılır. Windows ve Android’de ona en yakın açık lisanslı yazı tipi olan **Inter** yüklenir.
- **Logo:** gönderdiğiniz logo vektöre çevrildi (`assets/img/logo.svg`); üst menüde, alt bilgide, giriş sayfasında, panelde ve sekme simgesinde kullanılıyor.
- **Ürün görselleri:** Telefon, kılıf ve kulaklıklarda sizin fotoğraflarınız kullanılıyor. Fotoğrafı olmayan ürünlerde özgün, temsili çizimler görünür; ürün sayfasında marka, logo yerine **marka adı rozetiyle** gösterilir.
- **Kılıf modelleri:** Hangi iPhone’a ait oldukları fotoğraftaki kamera boşluğundan çıkarıldı (geniş kamera bölmesi → iPhone 17 Pro / Pro Max, kare kamera → iPhone 14–16 Pro, dikey kamera → iPhone 16 / 17). Farklıysa panelden ürün adını ve “Uyumluluk” alanını düzeltin.
- **Ana sayfa slaytları:** gönderdiğiniz iPhone ve Samsung tanıtım görselleriyle hazırlandı. Samsung görselinin üstündeki yazılar, slaytın kendi başlığıyla çakışmasın diye kırpıldı.
- **Çalışma saatleri** Google İşletme kaydınızdaki bilgiye göre girildi (Pazartesi–Cumartesi 09:00–20:30, Pazar kapalı). Farklıysa panelden düzeltin.
- **E-posta** alanı boş bırakıldı; panelde **Mağaza & Vitrin**’den ekleyebilirsiniz (boşken sitede görünmez).
- **Dükkân fotoğrafı**, gönderdiğiniz Google Haritalar ekran görüntüsünden kırpıldı. Kendi çektiğiniz bir fotoğrafla panelden değiştirebilirsiniz.
- **Paylaşım görseli:** Bağlantınız WhatsApp’ta paylaşıldığında `assets/img/og-kapak.jpg` görünür. Bazı uygulamalar görseli yalnızca tam adresle okur; isterseniz `index.html`’deki `og:image` satırındaki adresi `https://…github.io/…/assets/img/og-kapak.jpg` biçiminde tam adresle değiştirin.
- **Yerelde deneme:** `index.html`’i çift tıklayarak da açabilirsiniz; tüm sayfalar çalışır (yazı tipi yalnızca sitede, https üzerinden yüklenir).

---

## 9. Sorun giderme

| Sorun | Çözüm |
|---|---|
| Yayınladım ama sitede görünmüyor | 1–2 dakika bekleyip sayfayı yenileyin. Depoda **Actions** sekmesindeki “pages build and deployment” işinin yeşil tik aldığını kontrol edin. |
| “Anahtar geçersiz ya da süresi dolmuş” | GitHub’da yeni bir anahtar oluşturup **Ayarlar → GitHub bağlantısı**’na girin. |
| “Anahtarın bu depoya yazma izni yok” | Anahtarı oluştururken **Contents: Read and write** iznini ve doğru depoyu seçtiğinizden emin olun. |
| “Site başka bir cihazdan güncellenmiş” uyarısı | İki cihazdan aynı anda düzenleme yapılmış. Hangisinin kalacağını seçin; gerekirse diğer cihazda “Güncel yayını yükle”yi seçin. |
| Harita görünmüyor | Reklam / içerik engelleyici Google Haritalar’ı engelliyor olabilir; “Haritada aç” bağlantısı her zaman çalışır. |
| Giriş sayfası “güvenli (https) bağlantı” uyarısı veriyor | Siteyi `https://` ile açın (GitHub Pages’te **Enforce HTTPS** açık olmalı). |
| Panelde yeni ürünleri / slaytları görmüyorum | Bu tarayıcıda eski, yayınlanmamış bir taslak kalmış olabilir. Açılan uyarıda **Güncel yayını yükle**’yi seçin ya da **Ayarlar → Dikkat gerektiren işlemler → Taslağı at, yayındaki sürüme dön**’ü kullanın. |

---

## 10. Yeni sürüme geçiş (siteyi daha önce kurduysanız)

1. Dosyaları 1. bölümdeki gibi **iki seferde** yükleyin (önce `assets/img/urunler` dışındaki her şey, sonra `assets/img` içine `urunler` klasörü). GitHub aynı adlı dosyaların üzerine yazar.
2. **Şifrenizi panelden değiştirdiyseniz** `data/yonetici.js` dosyasını yüklemeyin (sürükledikten sonra listeden kaldırın); yoksa şifre `zumrut2026`’ya döner ve GitHub bağlantısı silinir.
3. `data/veri.js` yeni ürünleri, fotoğrafları ve slaytları içerir. Panelden kendi eklediğiniz ürünler varsa yüklemeden önce panelde **İçe / Dışa Aktar → Yedek indir (JSON)** ile yedek alın; bu ürünleri sonra yeniden eklemek gerekir.
