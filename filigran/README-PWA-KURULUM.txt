FİLİGRAN MOBİL PWA — GITHUB YAYIN DOSYALARI

Bu paket APK veya indirilecek bir HTML uygulaması değildir. HTTPS sitenizde yayımlanır ve tarayıcıdan PWA olarak ana ekrana/masaüstüne kurulur.

GITHUB'A YÜKLEME
1. ZIP'i açın.
2. ZIP içindeki index.html, 404.html, assets klasörü, manifest.webmanifest, filigran-mark.svg, filigran-mark-192.png, filigran-mark-512.png, manus-routes.json, sw.js ve .nojekyll dosyalarını GitHub deponuzdaki mevcut filigran/ klasörünün doğrudan içine kopyalayın.
3. Dosyaları yeni bir alt klasöre koymayın; aynı adlı mevcut dosyaları yenileriyle değiştirin. assets klasörünün içindeki worker dosyası da yüklenmelidir.
4. GitHub Pages dağıtımının tamamlanmasını bekleyin.
5. Kurulu Filigran PWA'yı açıp üst çubuktaki Güncelle düğmesine bir kez basın. Bu yayın v10 service worker kullanır; Güncelle eski Filigran uygulama önbelleğini bırakıp güncel dosyaları etkinleştirir ve uygulama kökünü açar.

KULLANIM NOTLARI
Uygulama JPEG, PNG ve WebP biçimlerini dosyanın gerçek içerik imzasından tanır; örneğin .png adlı bir dosyanın gerçek içeriği JPEG ise JPEG olarak işlenir. HEIC/HEIF de seçilebilir: cihaz tarayıcısı bu biçimi açabiliyorsa uygulama cihaz üzerinde işler, açamıyorsa JPEG olarak dışa aktarma yönergesi gösterir.

Büyük mobil fotoğraflar cihaz belleğine göre küçültülür; imza ekleme ve doğrulama Web Worker'da çalışır. Fotoğraflar sunucuya yüklenmez. Çıktı, indirme düğmesiyle PNG olarak kaydedilir.

PWA kurulum ipuçları: iPhone/iPad'de Safari > Paylaş > Ana Ekrana Ekle; Android'de Chrome menüsü > Uygulamayı yükle/Ana ekrana ekle; masaüstünde Chrome/Edge adres çubuğundaki kurulum simgesi veya tarayıcı menüsü.

Canlı siteye yeni dosyaları bu oturumdan otomatik yüklemedim; GitHub'a kopyalayıp yayımlamanız gerekir. Yayımdan sonra kurulu uygulamada Güncelle'ye basın.
