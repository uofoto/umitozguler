# Mustafa Necati İlkokulu Öğretmen İzleme ve Değerlendirme — PWA

Bu paket, verilen yazılımın içeriğini ve mevcut işlevlerini değiştirmeden PWA olarak çalışabilmesi için hazırlanmıştır.

## GitHub Pages’e yükleme

1. GitHub’da yeni veya mevcut bir repository açın.
2. Bu klasördeki **tüm dosya ve klasörleri** repository köküne yükleyin. Özellikle `index.html`, `manifest.webmanifest`, `sw.js` ve `icons/` klasörü aynı seviyede kalmalıdır.
3. Repository’de **Settings → Pages** bölümüne girin.
4. **Deploy from a branch** seçin; branch olarak `main`, klasör olarak `/ (root)` seçip kaydedin.
5. Oluşan `https://kullaniciadi.github.io/repository-adi/` adresini telefonda açın.
6. Android Chrome’da menüden **Ana ekrana ekle / Uygulamayı yükle** seçin. iPhone’da Safari paylaş menüsünden **Ana Ekrana Ekle** seçin.

## Önemli notlar

- PWA kurulumu için GitHub Pages adresinin HTTPS olması gerekir; GitHub Pages bunu otomatik sağlar.
- Kayıtlar uygulamanın kullanıldığı telefon/tarayıcıdaki `localStorage` içinde tutulur. Veritabanına veya GitHub’a otomatik gönderilmez.
- Raporlar → Veri aktarımı ve yedek bölümündeki **JSON dosyası indir** düğmesi, seçili eğitim öğretim yılının kayıtlarını dosya olarak indirir.
- Daha önce indirilen JSON dosyasını **JSON dosyası seç** düğmesiyle yükleyebilirsiniz. Yükleme yalnızca mevcut listedeki tanınan öğretmen kayıtlarını günceller.
- Öğretmen verileri kişisel bilgi içerebileceği için JSON yedeklerini güvenli bir yerde saklayın ve herkese açık GitHub repository’sine yüklemeyin.
- Güncelleme yaptıktan sonra service worker yeni önbellek sürümünü alır; gerekirse uygulamayı bir kez kapatıp açın.
