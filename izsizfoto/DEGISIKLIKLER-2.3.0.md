# İzsiz Foto 2.3.0 — değişiklikler

- WebP dosyalarında son ek koruma/silme seçeneği artık uygulanıyor; RIFF boyutu, chunk sınırları ve kesik chunk başlıkları doğrulanıyor.
- C2PA içerik kökeni verisi için koruma seçeneği eklendi. Varsayılan olarak temizlenir; arayüz bunun imza/köken doğrulamasını etkileyebileceğini açıklar.
- Piksel doğrulaması 32 MP üstü görsellerde çözme başlamadan atlanıyor; dosya başına 100 MiB sınırı eklendi.
- Android paylaşım hedefi her paylaşım için ayrı kimlik kullanıyor; eski geçici dosyalar bir saat sonra uygulama açılışında veya yeni paylaşımda temizleniyor.
- Otomatik sürüm denetimi kapatılabilir; manuel denetim seçeneği kalır. Güncelleme isteğinin kendi yayın adresine gönderildiği gizlilik açıklamasına eklendi.
- Arayüz, “piksel verisi aynı” iddiasını “görüntü yeniden kodlanmadı” olarak netleştiriyor ve dosya boyutu sınırını seçim alanında gösteriyor.
- JPEG/PNG/WebP C2PA ve WebP sınır davranışları için regresyon testleri eklendi.

## Geçerli sınırlamalar

HEIC/HEIF ve AVIF hâlâ desteklenmiyor. Büyük dosya işleme Web Worker’a taşınmadı; 100 MiB dosya sınırı olsa da düşük bellekli cihazlarda performans değişebilir. Gerçek iOS/Android cihaz testi ve geniş gerçek fotoğraf korpusu testi bu paket kapsamında yapılmadı.
