# İzsiz Foto 2.7.0 — salt-okunur köken denetimi

- Her işlenen kaynak dosya için cihaz içinde SHA-256 özeti hesaplanır.
- Dosya adı, boyutu, biçimi/kapsayıcısı ve tanınan C2PA/JUMBF kaydı durumu sonuç raporunda gösterilir.
- Denetim salt-okunurdur; kaynak dosya değiştirilmez ve denetim sonucu temizlenmiş çıktıya yazılmaz.
- Piksel tabanlı görünmez filigranlar için analiz yapılmadığı açıkça raporlanır. “Analiz edilmedi” sonucu filigranın yokluğu anlamına gelmez.
- Mevcut metadata temizleme ve dönüştürme akışı değiştirilmedi.
