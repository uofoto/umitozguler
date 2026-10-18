# İzsiz Foto 2.5.0

- MP4 ve MOV videolar için cihaz içinde metadata temizleme eklendi.
- Video ve ses akışları yeniden kodlanmadan korunur; görüntü kalitesi, süre ve ses değişmez.
- MP4/MOV kapsayıcılarındaki `udta`, `meta`, `uuid`, `ilst`, XMP ve benzeri tanınan metadata alanları temizlenir.
- Video çıktısı aynı kapsayıcı boyutunu koruyan `free` alanları kullanır; bu nedenle dosya boyutunun küçülmemesi normaldir.
- Sonuç ekranında videonun temizlendiği ve orijinal dosyanın silinmediği açıkça gösterilir.
- WebM, AVI ve diğer video kapsayıcıları bu sürümde desteklenmez.

## Sınır

Bu özellik video karelerinin içine görsel olarak gömülmüş filigranları veya videonun sesine gömülü konuşmaları silemez. Yalnızca dosya kapsayıcısındaki metadata alanlarını temizler.
