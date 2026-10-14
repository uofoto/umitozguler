# Lumina Studio (PWA)

Telefona "uygulama" gibi yüklenen, ilk açılıştan sonra internetsiz çalışan fotoğraf editörü.
Fotoğraflar cihazdan çıkmaz; her şey tarayıcıda işlenir.

## GitHub Pages'e yayınlama
1. GitHub'da yeni bir depo aç (ör. `lumina-studio`), **Public** olsun.
2. Bu klasördeki **tüm dosyaları** (`icons/` klasörü ve `.nojekyll` dahil) depoya yükle.
3. Depo → **Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save**.
4. 1-2 dk sonra adres hazır: `https://KULLANICI_ADIN.github.io/lumina-studio/`

## Telefona yükleme
- **Android (Chrome):** adresi aç → menü ⋮ → **Uygulamayı yükle** (ya da üstteki **⤓ Yükle** düğmesi).
- **iPhone (Safari):** adresi aç → **Paylaş** → **Ana Ekrana Ekle**.

## Kullanım
- ＋ ile fotoğraf aç, kaydırıcılarla düzenle, **⇩** ile JPG olarak kaydet / paylaş.
- **⇄** düğmesine basılı tutarak orijinali gör. Bir değerin üstüne dokununca sıfırlanır.
- İki parmakla yakınlaştır, sürükleyerek kaydır. Geri al / ileri al: ↶ ↷ (Ctrl+Z / Ctrl+Y).
- Büyük fotoğraflar en uzun kenarı 4096 px olacak şekilde işlenir.

## Çalışan / çalışmayan bölümler
Çalışır: Işık, Renk (sıcaklık/ton/canlılık/doygunluk), Renk Karışımı (HSL, 8 kanal), Renk Derecelendirme
(karıştırma/denge), Ayrıntılar, Efektler (vinyet/tane), Kalibrasyon, merkez maske (pozlama/netlik), "Sinematik Alpler" ayarı.
Henüz çalışmaz (yalnızca arayüz): Ton Eğrisi çizimi, renk tekerlekleri, sol taraftaki araçlar, AI araçları.

## Güncelleme
Dosyaları değiştirdikten sonra `sw.js` içindeki `VERSION` değerini artır (`v2`, `v3`…).

## Yerelde deneme
`python3 -m http.server 8000` → http://localhost:8000
