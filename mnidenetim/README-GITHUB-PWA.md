# Mustafa Necati İlkokulu Öğretmen İzleme ve Değerlendirme — PWA

Bu paket, verilen yazılımın içeriğini ve mevcut işlevlerini değiştirmeden PWA olarak çalışabilmesi için hazırlanmıştır.

## GitHub Pages’e yükleme

1. GitHub’da yeni veya mevcut bir repository açın.
2. Bu klasördeki **tüm dosya ve klasörleri** repository köküne yükleyin. Özellikle `index.html`, `manifest.webmanifest`, `sw.js` ve `icons/` klasörü aynı seviyede kalmalıdır.
3. Repository’de **Settings → Pages** bölümüne girin.
4. **Deploy from a branch** seçin; branch olarak `main`, klasör olarak `/ (root)` seçip kaydedin.
5. Oluşan `https://kullaniciadi.github.io/repository-adi/` adresini telefonda açın.
6. Android Chrome’da menüden **Ana ekrana ekle / Uygulamayı yükle** seçin. iPhone’da Safari paylaş menüsünden **Ana Ekrana Ekle** seçin.
7. Android Chrome’da uygulama içinde görünen **Uygulamayı kur** düğmesi de kurulumu başlatabilir. Bu düğmenin çıkması için sayfanın GitHub Pages gibi HTTPS bir adreste açılması gerekir; `file://` üzerinden açıldığında kurulum çalışmaz.

## Önemli notlar

- PWA kurulumu için GitHub Pages adresinin HTTPS olması gerekir; GitHub Pages bunu otomatik sağlar.
- Kayıtlar uygulamanın kullanıldığı telefon/tarayıcıdaki `localStorage` içinde tutulur. Veritabanına veya GitHub’a otomatik gönderilmez.
- Raporlar → Veri aktarımı ve yedek bölümündeki **JSON dosyası indir** düğmesi, seçili eğitim öğretim yılının kayıtlarını dosya olarak indirir.
- Daha önce indirilen JSON dosyasını **JSON dosyası seç** düğmesiyle yükleyebilirsiniz. Yükleme yalnızca mevcut listedeki tanınan öğretmen kayıtlarını günceller.
- Değerlendirme ekranındaki **PDF / Yazdır** düğmesi telefonun yazdırma ekranını açar. Buradan **PDF olarak kaydet** seçilerek dosya oluşturulabilir.
- Değerlendirme ekranındaki **E-posta hazırla** düğmesi telefonun e-posta uygulamasında konu ve açıklaması hazır bir taslak açar. Kaydedilen PDF dosyası e-postaya eklenir. GitHub Pages tek başına e-postaya dosya ekleyip otomatik gönderim yapamaz; bunun için ayrıca sunucu veya e-posta servisi gerekir.
- Mobil görünümde uzun tablolar yatay kaydırmalı, değerlendirme maddeleri dokunmatik büyük düğmeli ve üst menü telefon ekranına uyumlu olacak şekilde düzenlenmiştir.
- Öğretmen verileri kişisel bilgi içerebileceği için JSON yedeklerini güvenli bir yerde saklayın ve herkese açık GitHub repository’sine yüklemeyin.
- Güncelleme yaptıktan sonra service worker yeni önbellek sürümünü alır; gerekirse uygulamayı bir kez kapatıp açın.
