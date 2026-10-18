# İzsiz Foto 2.4.0 — HEIC/HEIF dönüştürme

- HEIC/HEIF fotoğraflar cihazdaki tarayıcıda PNG, JPEG veya WebP'ye çevrilebilir. Dönüştürücüler uygulamayla birlikte paketlenir; fotoğraf harici bir servise gönderilmez.
- PNG ve kayıpsız WebP, çözülen 8 bit RGBA piksel verisini ek kayıpsız saklar. JPEG en yüksek kaliteyle kodlanır ancak doğası gereği kayıplıdır.
- HEIC/HEIF dönüşümünde üstveriler taşınmaz; yön, görüntü piksellerine uygulanır. Birden çok görüntülü dosyalarda ana görüntü seçilir.
- Bellek güvenliği için HEIC/HEIF dosyalarında 100 MiB ve 32 MP sınırları uygulanır.
- Çevrimdışı HEIC desteği için uygulama kabuğuna libheif ve WebP kodlayıcı dosyaları eklendi; servis çalışanı bu dosyaları ilk kurulumda önbelleğe alır.
- JPEG/PNG/WebP'nin yeniden kodlamadan üstveri temizleme akışı değiştirilmedi. Üçüncü taraf lisans metinleri pakete eklendi.
- HEIC/HEIF marka algılama ve AVIF ayrımı için çekirdek regresyon testleri eklendi.

## Dönüşümün sınırları

HEIC kayıplı bir kaynak olabilir. Ayrıca bu uygulamanın decoder'ı görüntüyü 8 bit RGBA'ya çözer; kaynak 10 bit/HDR, ICC profili veya çekim tarihi gibi bilgileri çıktı dosyasında birebir korumaz. HEIC dönüşümünde tüm üstveriler taşınmaz. JPEG çıktısı her zaman kayıplı kodlanır. Gerçek iPhone/Android cihazlarında ve geniş HEIC fotoğraf çeşitliliğinde test edilmelidir.
