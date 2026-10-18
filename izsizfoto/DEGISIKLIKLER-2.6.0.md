# İzsiz Foto 2.6.0

WebM ve AVI video kapsayıcıları için metadata temizleme desteği eklendi. WebM dosyalarında EBML `Tags`, `Attachments` ve `Chapters` alanları; AVI dosyalarında `LIST/INFO` ve tanınan başlık alanları temizlenir.

İşlem yeniden kodlama yapmaz. Video ve ses akışları, codec bilgileri, süre ve kalite korunur. Metadata alanları dosya ofsetlerini bozmamak için aynı boyutta boş/padding alanlarına dönüştürülebilir; bu nedenle çıktı boyutu her zaman küçülmeyebilir.

Bu özellik dosya kapsayıcısındaki metadata içindir. Karelerin içine görsel olarak işlenmiş filigranları veya sesin içine gömülmüş bilgileri kaldırmaz.
