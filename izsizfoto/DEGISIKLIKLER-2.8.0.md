# İzsiz Foto 2.8.0 — köken kayıtlarını okuma ve kaba piksel denetimi

- Yeni, bağımsız ve salt-okunur modül: `provenance-audit.js`. Temizleme çekirdeği (IzsizCore) değiştirilmedi.
- Kaynak dosyadaki açık köken kayıtları okunur ve raporlanır: C2PA/JUMBF bildirimi, XMP/IPTC `DigitalSourceType`, oluşturucu yazılım, EXIF yazılım etiketi, PNG metin alanları.
- Genel amaçlı kaba piksel testleri eklendi (en düşük bit düzlemi, 8 piksel periyodik desen). Bunlar SynthID veya anahtarlı herhangi bir filigranı tespit etmez.
- Rapor ve kapsam metinleri güncellendi: görünmez filigranlar (ör. SynthID) bu yöntemlerle tespit edilemez; “bulgu yok” sonucu “filigran yok” demek değildir.
- Denetim sonucu temizlenmiş çıktıya yazılmaz; kaynak dosya değiştirilmez. Metadata temizleme ve dönüştürme akışı aynen korundu.
- Testler genişletildi (`node tests/test.js`).
