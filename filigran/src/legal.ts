export type LegalLanguage = 'tr' | 'en';

export const APP_VERSION = '1.0.0';
// Google Play'e yayınlandıktan sonra gerçek mağaza bağlantısını buraya ekleyin.
export const PLAY_STORE_URL = '';
export const CONTACT_EMAIL = 'iletisim@filigran.app';

export const LEGAL_COPY = {
  tr: {
    termsTitle: 'Kullanım Şartları',
    privacyTitle: 'Gizlilik Politikası',
    updated: 'Son güncelleme: 23 Ekim 2026',
    terms: [
      ['Kabul', 'Filigran uygulamasını kullanarak bu Kullanım Şartlarını kabul etmiş olursunuz. Şartları kabul etmiyorsanız uygulamayı kullanmayın.'],
      ['Hizmetin kapsamı', 'Filigran, JPEG, PNG ve WebP görseller üzerinde cihaz içinde görünmez dijital imza oluşturmanıza ve daha sonra bu imzayı kontrol etmenize yardımcı olan bir araçtır. Uygulama hukuki danışmanlık, telif tescili veya DRM hizmeti değildir.'],
      ['Kullanıcı sorumluluğu', 'Yüklediğiniz görseller ve girdiğiniz sahiplik bilgilerinin kullanım hakkına sahip olduğunuzu beyan edersiniz. Uygulamayı başkalarının haklarını ihlal etmek, yanıltıcı sahiplik iddiası oluşturmak veya hukuka aykırı içerik işlemek için kullanamazsınız.'],
      ['Teknik sınırlamalar', 'Yeniden sıkıştırma, kırpma, yeniden boyutlandırma, ekran görüntüsü alma veya başka bir düzenleme dijital imzayı zayıflatabilir ya da yok edebilir. İmza sonucu tek başına mülkiyetin veya telif hakkının kesin kanıtı olarak değerlendirilmemelidir.'],
      ['Fikri mülkiyet', 'Filigran uygulamasının yazılımı, tasarımı, markası ve içeriği, aksi belirtilmedikçe geliştiricisine aittir. Kendi görselleriniz ve uygulamaya girdiğiniz sahiplik bilgileri üzerindeki haklarınız size aittir.'],
      ['Garanti ve sorumluluğun sınırı', 'Uygulama mevcut haliyle sunulur. Kesintisiz çalışma, her cihazda uyumluluk veya her görselde doğru sonuç garanti edilmez. Kanunen izin verilen azami ölçüde, veri kaybı, kullanım kesintisi veya dolaylı zararlardan sorumlu değiliz.'],
      ['Değişiklikler ve iletişim', 'Bu şartları gerektiğinde güncelleyebiliriz. Önemli değişiklikler uygulama içinde veya yayın sayfasında duyurulabilir. Sorularınız için ' + CONTACT_EMAIL + ' adresinden bize ulaşabilirsiniz.'],
    ],
    privacy: [
      ['Veri sorumlusu ve kapsam', 'Bu politika, Filigran uygulamasının hangi bilgileri işlediğini açıklar. Uygulama fotoğrafları cihazınızda işler; fotoğraflarınızın sunucuya yüklenmesi uygulamanın normal çalışma şeklinin parçası değildir.'],
      ['İşlenen bilgiler', 'Seçtiğiniz görsel, sahiplik metni ve doğrulama sonucu işlem tamamlanana kadar cihazınızın belleğinde işlenir. Uygulama hesap oluşturmaz, fotoğraf galerinizin tamamına erişmez ve görselleri uzaktan depolamaz.'],
      ['Saklama ve silme', 'İşlenen dosyalar uygulama tarafından kalıcı bir sunucu hesabında saklanmaz. Oluşturulan çıktı dosyası, siz indirir veya paylaşırsa cihazınızın seçtiğiniz konumunda bulunabilir; bu dosyanın silinmesinden siz sorumlusunuz.'],
      ['İzinler', 'Uygulama fotoğraf seçmek için cihazınızın dosya veya fotoğraf seçicisini kullanır. Kamera, konum, kişiler veya mikrofon erişimi istemez; işletim sisteminin seçici ekranı dışında galerinize erişmez.'],
      ['Üçüncü taraf hizmetler', 'Arayüz yazı tipleri için Google Fonts kullanılabilir. Bu kaynakların yüklenmesi sırasında Google, standart teknik bağlantı bilgilerini görebilir. Google Fonts kullanımı cihazınızın ve ağınızın ayarlarına bağlıdır.'],
      ['Çocukların gizliliği', 'Uygulama çocuklara özel olarak tasarlanmamıştır ve bilerek çocuklardan kişisel veri toplamaz.'],
      ['Haklarınız ve iletişim', 'Gizlilikle ilgili sorularınız veya talepleriniz için ' + CONTACT_EMAIL + ' adresine yazabilirsiniz. Yasal başvuru haklarınız, bulunduğunuz ülkenin mevzuatına göre saklıdır.'],
      ['Politika değişiklikleri', 'Bu politikayı gerektiğinde güncelleyebiliriz. Güncel sürüm ve yürürlük tarihi bu sayfada yayımlanır.'],
    ],
  },
  en: {
    termsTitle: 'Terms of Use',
    privacyTitle: 'Privacy Policy',
    updated: 'Last updated: October 23, 2026',
    terms: [
      ['Acceptance', 'By using Filigran, you agree to these Terms of Use. Do not use the application if you do not agree to them.'],
      ['Service scope', 'Filigran is a device-side tool that helps you embed an invisible digital signature in JPEG, PNG, and WebP images and check that signature later. It is not legal advice, copyright registration, or DRM.'],
      ['User responsibility', 'You represent that you have the rights to the images and ownership information you submit. You may not use the application to infringe others’ rights, make deceptive ownership claims, or process unlawful content.'],
      ['Technical limitations', 'Recompression, cropping, resizing, screenshots, or other editing may weaken or remove a digital signature. A verification result alone should not be treated as conclusive proof of ownership or copyright.'],
      ['Intellectual property', 'Unless stated otherwise, the Filigran software, design, brand, and content belong to its developer. You retain your rights in your own images and ownership information entered into the application.'],
      ['Warranty and liability', 'The application is provided as-is. Continuous operation, compatibility with every device, or a correct result for every image is not guaranteed. To the maximum extent permitted by law, we are not liable for data loss, interruption, or indirect damages.'],
      ['Changes and contact', 'We may update these terms when necessary. Material changes may be announced in the application or on the publication page. Contact us at ' + CONTACT_EMAIL + '.'],
    ],
    privacy: [
      ['Controller and scope', 'This policy explains what information Filigran processes. Images are processed on your device; uploading your photos to a server is not part of the application’s normal operation.'],
      ['Information processed', 'The selected image, ownership text, and verification result are processed in device memory until the operation is complete. The application does not create an account, access your entire photo library, or remotely store images.'],
      ['Retention and deletion', 'Processed files are not stored in a permanent server account by the application. An output file may remain wherever you save or share it on your device; you are responsible for deleting that file.'],
      ['Permissions', 'The application uses the operating system’s file or photo picker to select an image. It does not request camera, location, contacts, or microphone access, and does not access your gallery beyond the picker.'],
      ['Third-party services', 'Google Fonts may be used for interface fonts. When those resources load, Google may receive standard technical connection information. This depends on your device and network settings.'],
      ['Children’s privacy', 'The application is not directed at children and does not knowingly collect personal information from children.'],
      ['Your rights and contact', 'For privacy questions or requests, contact ' + CONTACT_EMAIL + '. Your statutory rights under the laws applicable to you remain unaffected.'],
      ['Policy changes', 'We may update this policy when necessary. The current version and effective date are published on this page.'],
    ],
  },
} as const;
