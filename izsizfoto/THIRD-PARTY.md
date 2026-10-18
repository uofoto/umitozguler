# Üçüncü taraf yazılım bildirimleri

HEIC/HEIF çözme için `libheif-js` **1.23.5** sürümünün tarayıcı WASM derlemesi paketlenmiştir. Kaynak ve proje: [catdad-experiments/libheif-js](https://github.com/catdad-experiments/libheif-js). Libheif bileşeni LGPL-3.0 lisanslıdır; bu dağıtımda kullanılan lisans metinleri `LICENSE-libheif-js.txt` ve `LICENSE-libheif-wasm.txt` dosyalarındadır.

Kayıpsız WebP kodlama için `@jsquash/webp` **1.5.0** ve onun libwebp tabanlı WebP encoder WASM bileşeni uygulama içine derlenmiştir. Kaynak ve proje: [jamsinclair/jSquash](https://github.com/jamsinclair/jSquash). Paket Apache-2.0, dahil edilen WebP encoder kodu BSD-3-Clause lisanslıdır. Metinler `LICENSE-jsquash-webp.txt` ve `LICENSE-webp-codec.txt` dosyalarındadır.

Dosyalar çevrimdışı çalışabilmesi için uygulama paketiyle birlikte dağıtılır; fotoğraf işlenirken bu kodlar dosyayı internet servisine göndermez. Lisans metinlerini değiştirmeden saklayın.
