# İzsiz Foto 2.8.4 — deneysel temel piksel dönüşümü

- Görüntüler için isteğe bağlı RGB düşük-bit (LSB) yeniden yazma adımı eklendi.
- İşlem yalnızca temel LSB gömmelerini hedefler; SynthID veya başka anahtarlı/dağıtılmış görünmez filigranları algılamaz ve kaldırma garantisi vermez.
- Dönüştürülen görsel yeni PNG olarak kaydedilir; bazı renk değerleri değişebilir ve EXIF tarihi, ICC profili ile C2PA imzası/köken kaydı çıktıya taşınmaz. Kaynak dosya değiştirilmez.
- Video kareleri bu işlemden geçmez. Piksel dönüşümü için 32 MP sınırı uygulanır.
- Dönüşüm testi ve sürüm dosyaları güncellendi; `node tests/test.js` ile doğrula.
