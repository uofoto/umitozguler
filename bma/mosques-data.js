/*
 * Okunabilir hâle getirilmiş sürüm.
 * String tablosu, dinamik string çözücü ve başlangıçtaki döndürme IIFE’si kaldırıldı.
 * İşlevsel sabitler doğrudan kaynakta gösterilmektedir.
 */

let PRESET_MOSQUES = [{
    id: "ulu-cami",
    name: "Bursa Ulu Cami",
    district: "Osmangazi",
    address: "Nalbantoğlu, Atatürk Cd., Osmangazi/Bursa",
    mapsSearch: "Bursa Ulu Cami"
  }, {
    id: "orhan-gazi",
    name: "Orhan Gazi Camii",
    district: "Osmangazi",
    address: "Nalbantoğlu, Tarihi Çarşı, Osmangazi/Bursa",
    mapsSearch: "Orhan Gazi Camii Bursa"
  }, {
    id: "hudavendigar",
    name: "I. Murad Hüdavendigar Camii",
    district: "Osmangazi",
    address: "Çekirge, 1. Murat Sk., Osmangazi/Bursa",
    mapsSearch: "Hüdavendigar Camii Bursa"
  }, {
    id: "muradiye",
    name: "Muradiye Camii (II. Murad)",
    district: "Osmangazi",
    address: "Muradiye, Prf. Dr. Halil İnalcık Sk., Osmangazi/Bursa",
    mapsSearch: "Muradiye Camii Bursa"
  }, {
    id: "sehadet-camii",
    name: "Şahadet Camii (Hisar / Kale Camii)",
    district: "Osmangazi",
    address: "Hisar, Tophane Parkı İçi, Osmangazi/Bursa",
    mapsSearch: "Şahadet Camii Bursa"
  }, {
    id: "uftade-camii",
    name: "Üftade Camii ve Mescidi",
    district: "Osmangazi",
    address: "Kavaklı, Üftade Sk., Osmangazi/Bursa",
    mapsSearch: "Üftade Camii Bursa"
  }, {
    id: "yigit-kohne",
    name: "Yiğit Köhne Camii",
    district: "Osmangazi",
    address: "Alacahırka, Kiremitçi Sk., Osmangazi/Bursa",
    mapsSearch: "Yiğit Köhne Camii"
  }, {
    id: "alaaddin-bey",
    name: "Alaaddin Bey Camii",
    district: "Osmangazi",
    address: "Alaaddin, Alaaddin Sk., Osmangazi/Bursa",
    mapsSearch: "Alaaddin Bey Camii Bursa"
  }, {
    id: "abdal-camii",
    name: "Abdal Mehmed Camii",
    district: "Osmangazi",
    address: "Abdal, Abdal Cd., Osmangazi/Bursa",
    mapsSearch: "Abdal Mehmed Camii Bursa"
  }, {
    id: "haci-ozbek",
    name: "Hacı Özbek Camii",
    district: "Osmangazi",
    address: "Reyhan, Tarihi Çarşı, Osmangazi/Bursa",
    mapsSearch: "Hacı Özbek Camii Bursa"
  }, {
    id: "reyhan-camii",
    name: "Reyhan Camii",
    district: "Osmangazi",
    address: "Reyhan, Reyhan Cd., Osmangazi/Bursa",
    mapsSearch: "Reyhan Camii Bursa"
  }, {
    id: "kavakli-camii",
    name: "Kavaklı Camii",
    district: "Osmangazi",
    address: "Kavaklı, Kavaklı Cd., Osmangazi/Bursa",
    mapsSearch: "Kavaklı Camii Bursa"
  }, {
    id: "alacahirka-camii",
    name: "Alacahırka Camii",
    district: "Osmangazi",
    address: "Alacahırka, Alacahırka Cd., Osmangazi/Bursa",
    mapsSearch: "Alacahırka Camii Bursa"
  }, {
    id: "sekerhoca-camii",
    name: "Şekerhoca Camii",
    district: "Osmangazi",
    address: "Şekerhoca, Şekerhoca Sk., Osmangazi/Bursa",
    mapsSearch: "Şekerhoca Camii Bursa"
  }, {
    id: "karabas-i-veli",
    name: "Karabaş-i Veli Camii",
    district: "Osmangazi",
    address: "Maksem, Karabaş Sk., Osmangazi/Bursa",
    mapsSearch: "Karabaş-i Veli Kültür Merkezi"
  }, {
    id: "tahtakale-camii",
    name: "Tahtakale Camii",
    district: "Osmangazi",
    address: "Tahtakale, Tahtakale Mh., Osmangazi/Bursa",
    mapsSearch: "Tahtakale Camii Bursa"
  }, {
    id: "kiremitci-camii",
    name: "Kiremitçi Camii",
    district: "Osmangazi",
    address: "Kiremitçi, Kiremitçi Mh., Osmangazi/Bursa",
    mapsSearch: "Kiremitçi Camii Bursa"
  }, {
    id: "kayhan-camii",
    name: "Kayhan (Kaygan) Camii",
    district: "Osmangazi",
    address: "Kayhan, Kayhan Cd., Osmangazi/Bursa",
    mapsSearch: "Kayhan Camii Bursa"
  }, {
    id: "tuzpazari-camii",
    name: "Tuzpazarı Camii",
    district: "Osmangazi",
    address: "Tuzpazarı, Çarşı İçi, Osmangazi/Bursa",
    mapsSearch: "Tuzpazarı Camii Bursa"
  }, {
    id: "serefuddin-camii",
    name: "Şerefüddin Camii",
    district: "Osmangazi",
    address: "Hocaalizade, Şerefüddin Sk., Osmangazi/Bursa",
    mapsSearch: "Şerefüddin Camii"
  }, {
    id: "hoca-alizade",
    name: "Hoca Alizade Camii",
    district: "Osmangazi",
    address: "Hocaalizade, Hocaalizade Cd., Osmangazi/Bursa",
    mapsSearch: "Hoca Alizade Camii Bursa"
  }, {
    id: "veled-i-sarban",
    name: "Veled-i Sarban Camii",
    district: "Osmangazi",
    address: "Reyhan Mh., Sarban Sk., Osmangazi/Bursa",
    mapsSearch: "Veled-i Sarban Camii"
  }, {
    id: "karaseyh-camii",
    name: "Karaşeyh Camii",
    district: "Osmangazi",
    address: "Karaşeyh Mh., Osmangazi/Bursa",
    mapsSearch: "Karaşeyh Camii Bursa"
  }, {
    id: "somuncu-baba-firini",
    name: "Somuncu Baba Mescidi",
    district: "Osmangazi",
    address: "Mollafenari, Somuncu Baba Sk., Osmangazi/Bursa",
    mapsSearch: "Somuncu Baba Camii"
  }, {
    id: "ishakpasa-camii",
    name: "İshakpaşa Camii",
    district: "Osmangazi",
    address: "Muradiye, İshakpaşa Sk., Osmangazi/Bursa",
    mapsSearch: "İshakpaşa Camii Bursa"
  }, {
    id: "bedrettin-camii",
    name: "Bedrettin Camii",
    district: "Osmangazi",
    address: "Bedrettin Mh., Osmangazi/Bursa",
    mapsSearch: "Bedrettin Camii Bursa"
  }, {
    id: "yerkapi-camii",
    name: "Yerkapı Camii",
    district: "Osmangazi",
    address: "Yerkapı Mh., Osmangazi/Bursa",
    mapsSearch: "Yerkapı Camii Bursa"
  }, {
    id: "demirkapi-mescidi",
    name: "Demirkapı Mescidi",
    district: "Osmangazi",
    address: "Demirkapı Sk., Osmangazi/Bursa",
    mapsSearch: "Demirkapı Mescidi"
  }, {
    id: "sehrekustu-camii",
    name: "Şehreküstü Camii",
    district: "Osmangazi",
    address: "Şehreküstü, Osmangazi/Bursa",
    mapsSearch: "Şehreküstü Camii"
  }, {
    id: "maksem-camii",
    name: "Maksem Camii",
    district: "Osmangazi",
    address: "Maksem, Osmangazi/Bursa",
    mapsSearch: "Maksem Camii"
  }, {
    id: "dayioglu-camii",
    name: "Dayıoğlu Camii",
    district: "Osmangazi",
    address: "Tahtakale, Osmangazi/Bursa",
    mapsSearch: "Dayıoğlu Camii"
  }, {
    id: "hamzabey-camii",
    name: "Hamzabey Camii",
    district: "Osmangazi",
    address: "Hamzabey Mh., Osmangazi/Bursa",
    mapsSearch: "Hamzabey Camii Bursa"
  }, {
    id: "imaret-isabey",
    name: "İmaret-i İsabey Camii",
    district: "Osmangazi",
    address: "Alaaddin Mh., Kale içi, Osmangazi/Bursa",
    mapsSearch: "İmaret-i İsabey Camii Bursa"
  }, {
    id: "nilufer-hidirlik",
    name: "Nilüfer Hatun (Hıdırlık) Camii",
    district: "Osmangazi",
    address: "Pınarbaşı Meydanı, İvaz Paşa Mh., Osmangazi/Bursa",
    mapsSearch: "Nilüfer Hatun Hıdırlık Camii Bursa"
  }, {
    id: "yaylacik-camii",
    name: "Yaylacık Camii",
    district: "Osmangazi",
    address: "Yaylacık, Osmangazi/Bursa",
    mapsSearch: "Yaylacık Camii Bursa"
  }, {
    id: "koza-hani-mescidi",
    name: "Koza Hanı Mescidi",
    district: "Osmangazi",
    address: "Şehreküstü, Uzun Çarşı Cd., Koza Hanı içi, Osmangazi/Bursa",
    mapsSearch: "Koza Hanı Mescidi Bursa"
  }, {
    id: "haci-ivaz-pasa-camii",
    name: "Hacı İvaz Paşa Camii",
    district: "Osmangazi",
    address: "Tavuk Pazarı, Pirinç Hanı karşısı, Osmangazi/Bursa",
    mapsSearch: "Hacı İvaz Paşa Camii Bursa"
  }, {
    id: "hatice-isfendiyar-sultan-camii",
    name: "Hatice İsfendiyar Sultan Camii",
    district: "Osmangazi",
    address: "Gökdere, Kamberler Mahallesi, Osmangazi/Bursa",
    mapsSearch: "Hatice İsfendiyar Sultan Camii Bursa"
  }, {
    id: "gazi-timurtas-pasa-camii",
    name: "Demirtaş Camii / Temurtaş Camii",
    district: "Osmangazi",
    address: "Demirtaş Mahallesi, Osmangazi/Bursa",
    mapsSearch: "Timurtaş Paşa Camii Bursa"
  }, {
    id: "azeb-bey-camii",
    name: "Azeb Bey Camii",
    district: "Osmangazi",
    address: "Muradiye, Kullukçu Sk., Osmangazi/Bursa",
    mapsSearch: "Azeb Bey Camii Bursa"
  }, {
    id: "ahmed-dai-camii",
    name: "Ahmed Dai Camii",
    district: "Osmangazi",
    address: "Cumhuriyet Cd. ile Ahmed Dai Sk. kesişimi, Osmangazi/Bursa",
    mapsSearch: "Ahmed Dai Camii Bursa"
  }, {
    id: "kefensuzen-camii",
    name: "Kefensüzen Camii",
    district: "Osmangazi",
    address: "Kefensüzen Mh., Osmangazi/Bursa",
    mapsSearch: "Kefensüzen Camii Bursa",
    addedAt: "2026-07-18"
  }, {
    id: "mizanoglu-camii",
    name: "Mizanoğlu Camii (Mescidi)",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Mizanoğlu Camii Bursa",
    addedAt: "2026-07-18"
  }, {
    id: "zafranlik-camii",
    name: "Zafranlık Camii",
    district: "Osmangazi",
    address: "Zafran, Osmangazi/Bursa",
    mapsSearch: "Zafranlık Camii Bursa",
    addedAt: "2026-07-18"
  }, {
    id: "suluki-camii",
    name: "Süluki Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Süluki Camii Bursa",
    addedAt: "2026-07-18"
  }, {
    id: "acem-reis",
    name: "Acem Reis (Arab Dede) Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Acem Reis Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "ahmet-pasa-fenari-camii",
    name: "Ahmet Paşa Fenari Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Ahmet Paşa Fenari Camii Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "akbiyik",
    name: "Akbıyık (Veled-i Harir) Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Akbıyık Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "alanyeri",
    name: "Alanyeri (İsmail Hakkı) Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Alanyeri Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "altiparmak-camii",
    name: "Altıparmak Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Altıparmak Camii Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "araplar-camii",
    name: "Araplar Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Araplar Camii Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "aynali",
    name: "Aynalı (Çopraz / Haca Tayyib) Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Aynalı Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "besikciler-camii",
    name: "Beşikçiler (Sinan Dede) Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Beşikçiler Sinan Dede Camii Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "cagir-aga",
    name: "Çakır Ağa (Mecnun Dede) Mescidi",
    district: "Osmangazi",
    address: "Tahtakale, Kurşunlu Sk., Osmangazi/Bursa",
    mapsSearch: "Çakır Ağa Mescidi Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "cirag-bey-mescidi",
    name: "Çırağbey Camii",
    district: "Osmangazi",
    address: "Mollagürani, Çırağ Bey Sk. (Hisar İçi), Osmangazi/Bursa",
    mapsSearch: "Çırağbey Camii Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "cukur-mahalle-mescidi",
    name: "Çukur Mahalle Mescidi",
    district: "Yıldırım",
    address: "Yıldırım Mah., Beyazıt Cd. No:17, Yıldırım/Bursa",
    mapsSearch: "Çukur Mahalle Mescidi Yıldırım Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "daye-hatun",
    name: "Dâye Hatun (Daya Kadın / Taya Hatun) Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Dâye Hatun Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "ebu-i-shak-mescidi",
    name: "Ebu İshak Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Ebu İshak Mescidi Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "enbiya",
    name: "Enbiya (Veled-i Enbiya) Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Enbiya Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "ertugrul-camii",
    name: "Ertuğrul Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Ertuğrul Camii Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "guranli",
    name: "Güranlı (Yeşil) Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Güranlı Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "hacilar-camii",
    name: "Hacılar Camii",
    district: "Osmangazi",
    address: "Hükümet Konağı karşısı, Osmangazi/Bursa",
    mapsSearch: "Hacılar Camii Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "hayreddin-pasa-camii-minaresi",
    name: "Hayreddin Paşa Camii Minaresi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Hayreddin Paşa Camii Minaresi Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "i-brahim-pasa",
    name: "İbrahim Paşa (Candarlı / Mahkeme) Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "İbrahim Paşa Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "i-sa-bey-fenari",
    name: "İsa Bey Fenari (Güdük Minare) Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "İsa Bey Fenari Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "i-zzuddin",
    name: "İzzuddin (Pınarbaşı) Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "İzzuddin Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "kademeri",
    name: "Kademeri (Çukur) Camii",
    district: "Osmangazi",
    address: "Pınarbaşı, Uzun Sk., Osmangazi/Bursa",
    mapsSearch: "Kademeri Çukur Camii Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "karakadi-mescidi",
    name: "Karakadı Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Karakadı Mescidi Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "kayan",
    name: "Kayan (Kavganı) Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Kayan Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "koca-naip-camii",
    name: "Koca Naip Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Koca Naip Camii Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "konevi",
    name: "Konevi (Şeyh Konevi) Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Konevi Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "lamii-celebi-mescidi",
    name: "Lamii Çelebi Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Lamii Çelebi Mescidi Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "mantici-mescidi",
    name: "Mantıcı Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Mantıcı Mescidi Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "mecidiye-camii",
    name: "Mecidiye Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Mecidiye Camii Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "mes-ud-makramevi",
    name: "Mes'ud Makramevi (Hasırcılar) Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Mes'ud Makramevi Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "molla-fenari-camii",
    name: "Molla Fenari Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Molla Fenari Camii Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "nakkas-ali-mescidi",
    name: "Nakkaş Ali Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Nakkaş Ali Mescidi Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "nalbantoglu-camii",
    name: "Nalbantoğlu Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Nalbantoğlu Camii Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "pasa-camii",
    name: "Paşa Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Paşa Camii Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "reyhan",
    name: "Reyhan (Acemler) Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Reyhan Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "sati-fakih",
    name: "Satı Fakıh (Sıdı Fakıh) Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Satı Fakıh Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "selimiye-camii",
    name: "Selimiye Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Selimiye Camii Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "seyid-nasir-zaviye",
    name: "Seyid Nasır Zaviye (Haca Şahabeddin) Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Seyid Nasır Zaviye Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "seyh-pasa",
    name: "Şeyh Paşa (Dibekli) Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Şeyh Paşa Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "simkes",
    name: "Simkeş (Sırmakeş) Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Simkeş Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "sivaslilar",
    name: "Sivaslılar (Tahtalı) Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Sivaslılar Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "surmeli",
    name: "Sürmeli (Tefsir Han / Ahi Hasan) Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Sürmeli Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "sahabeddin-pasa-camii",
    name: "Şahabeddin Paşa Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Şahabeddin Paşa Camii Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "tahtali-mescid",
    name: "Tahtalı Mescid",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Tahtalı Mescid Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "uc-kizlar-camii-ve-minaresi",
    name: "Üç Kızlar Camii ve Minaresi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Üç Kızlar Camii ve Minaresi Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "veled-i-habib",
    name: "Veled-i Habib (Eminiye Dergâhı) Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Veled-i Habib Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "veled-i-halva-i",
    name: "Veled-i Halva-i (Helvacıoğlu) Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Veled-i Halva-i Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "veled-i-sarayi",
    name: "Veled-i Sarayi (Saray) Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Veled-i Sarayi Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "veled-i-veziri",
    name: "Veled-i Veziri (Üç Kumalı) Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Veled-i Veziri Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "veled-i-yanic-mescidi",
    name: "Veled-i Yanıç Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Veled-i Yanıç Mescidi Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "veled-i-semseddin",
    name: "Veled-i Şemseddin (Yohni Kapan) Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Veled-i Şemseddin Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "yeni-kablica-mescidi",
    name: "Yeni Kablıca Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Yeni Kablıca Mescidi Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "yigit-cedid-camii",
    name: "Yiğit Cedid Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Yiğit Cedid Camii Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "zogronlik",
    name: "Zoğronlık (Zofronlık) Mescidi",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Zoğronlık Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "yesil-cami",
    name: "Yeşil Cami",
    district: "Yıldırım",
    address: "Yeşil, Yıldırım/Bursa",
    mapsSearch: "Yeşil Cami Bursa"
  }, {
    id: "emir-sultan",
    name: "Emir Sultan Camii",
    district: "Yıldırım",
    address: "Emirsultan, Yıldırım/Bursa",
    mapsSearch: "Emir Sultan Camii Bursa"
  }, {
    id: "yildirim-bayezid",
    name: "Yıldırım Bayezid Camii",
    district: "Yıldırım",
    address: "Yıldırım, Yıldırım/Bursa",
    mapsSearch: "Yıldırım Bayezid Camii"
  }, {
    id: "ali-pasa",
    name: "Ali Paşa Camii",
    district: "Osmangazi",
    address: "Namazgah, Ali Paşa Sk., Osmangazi/Bursa",
    mapsSearch: "Ali Paşa Camii Bursa"
  }, {
    id: "namazgah",
    name: "Bursa Tarihi Namazgah",
    district: "Yıldırım",
    address: "Namazgah, Yıldırım/Bursa",
    mapsSearch: "Namazgah Bursa"
  }, {
    id: "molla-yegan",
    name: "Molla Yegan Camii",
    district: "Yıldırım",
    address: "Yıldırım Mh., Yıldırım/Bursa",
    mapsSearch: "Molla Yegan"
  }, {
    id: "davutkadi-camii",
    name: "Davutkadı Camii",
    district: "Yıldırım",
    address: "Davutkadı Mh., Yıldırım/Bursa",
    mapsSearch: "Davutkadı Camii Bursa"
  }, {
    id: "musababa-camii",
    name: "Musababa Camii",
    district: "Yıldırım",
    address: "Musababa Mh., Yıldırım/Bursa",
    mapsSearch: "Musababa Camii"
  }, {
    id: "piremir-camii",
    name: "Piremir Camii",
    district: "Yıldırım",
    address: "Piremir Mh., Yıldırım/Bursa",
    mapsSearch: "Piremir Camii"
  }, {
    id: "teferruc-camii",
    name: "Teferrüç Camii",
    district: "Yıldırım",
    address: "Teferrüç, Yıldırım/Bursa",
    mapsSearch: "Teferrüç Camii"
  }, {
    id: "karaagac-camii",
    name: "Karaağaç Camii",
    district: "Yıldırım",
    address: "Karaağaç Mh., Yıldırım/Bursa",
    mapsSearch: "Karaağaç Camii"
  }, {
    id: "zeyniler-camii",
    name: "Zeyniler Köyü Mescidi",
    district: "Yıldırım",
    address: "Zeyniler Köyü, Yıldırım/Bursa",
    mapsSearch: "Zeyniler Mescidi"
  }, {
    id: "molla-arap",
    name: "Molla Arap Camii",
    district: "Yıldırım",
    address: "Mollaarap Mh., Yıldırım/Bursa",
    mapsSearch: "Molla Arap Camii"
  }, {
    id: "umurbey-camii",
    name: "Umurbey Camii",
    district: "Yıldırım",
    address: "Umurbey Mh., Yıldırım/Bursa",
    mapsSearch: "Umurbey Camii"
  }, {
    id: "yesil-mescidi",
    name: "Yeşil Türbe Mescidi",
    district: "Yıldırım",
    address: "Yeşil, Yıldırım/Bursa",
    mapsSearch: "Yeşil Türbe"
  }, {
    id: "selcuk-hatun",
    name: "Selçuk Hatun Camii",
    district: "Yıldırım",
    address: "Selçuk Hatun Mh., Yıldırım/Bursa",
    mapsSearch: "Selçuk Hatun Camii"
  }, {
    id: "haci-ilyas-camii",
    name: "Hacı İlyas Camii",
    district: "Yıldırım",
    address: "Hacı İlyas Mh., Yıldırım/Bursa",
    mapsSearch: "Hacı İlyas Camii"
  }, {
    id: "degirmenlikizik-camii",
    name: "Değirmenlikızık Camii",
    district: "Yıldırım",
    address: "Değirmenlikızık, Yıldırım/Bursa",
    mapsSearch: "Değirmenlikızık Camii"
  }, {
    id: "fidyekizik-camii",
    name: "Fidyekızık Tarihi Camii",
    district: "Yıldırım",
    address: "Fidyekızık, Yıldırım/Bursa",
    mapsSearch: "Fidyekızık Camii"
  }, {
    id: "sitti-hatun",
    name: "Kanberler (Sitti Hatun) Camii",
    district: "Yıldırım",
    address: "Umurbey, Yıldırım/Bursa",
    mapsSearch: "Sitti Hatun Camii"
  }, {
    id: "hamamlikizik-camii",
    name: "Hamamlıkızık Camii",
    district: "Yıldırım",
    address: "Hamamlıkızık Köyü, Yıldırım/Bursa",
    mapsSearch: "Hamamlıkızık Camii"
  }, {
    id: "cumalikizik-camii",
    name: "Cumalıkızık Camii",
    district: "Yıldırım",
    address: "Cumalıkızık Köyü, Yıldırım/Bursa",
    mapsSearch: "Cumalıkızık Camii"
  }, {
    id: "bayezid-pasa-catal",
    name: "Bayezid Paşa (Çatal Mescit) Camii",
    district: "Yıldırım",
    address: "Yıldırım/Bursa",
    mapsSearch: "Bayezid Paşa Camii Bursa Çatal Mescit"
  }, {
    id: "meydancik-camii",
    name: "Meydancık Camii",
    district: "Yıldırım",
    address: "Meydancık, Alancık Sk., Yıldırım/Bursa",
    mapsSearch: "Meydancık Camii Bursa"
  }, {
    id: "fazlullah",
    name: "Fazlullah (Feyzullah) Paşa Mescidi",
    district: "Yıldırım",
    address: "Yıldırım/Bursa",
    mapsSearch: "Fazlullah Yıldırım Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "hoca-taskin-mescidi",
    name: "Hoca Taşkın Mescidi",
    district: "Yıldırım",
    address: "Yıldırım/Bursa",
    mapsSearch: "Hoca Taşkın Mescidi Yıldırım Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "i-bni-bezzaz",
    name: "İbni Bezzaz (Bekçi) Camii",
    district: "Yıldırım",
    address: "Yıldırım/Bursa",
    mapsSearch: "İbni Bezzaz Yıldırım Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "i-shak-sah",
    name: "İshak Şah (Kabakçı / Müftü Önü) Camii",
    district: "Yıldırım",
    address: "Yıldırım/Bursa",
    mapsSearch: "İshak Şah Yıldırım Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "namazgah-yani-camii",
    name: "Namazgâh Yanı Camii",
    district: "Yıldırım",
    address: "Yıldırım/Bursa",
    mapsSearch: "Namazgâh Yanı Camii Yıldırım Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "satbasi",
    name: "Satbaşı (Karacelebi) Camii",
    district: "Yıldırım",
    address: "Yıldırım/Bursa",
    mapsSearch: "Satbaşı Yıldırım Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "selimzade-camii",
    name: "Selimzâde Camii",
    district: "Yıldırım",
    address: "Yıldırım/Bursa",
    mapsSearch: "Selimzâde Camii Yıldırım Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "sible",
    name: "Sıble (Şıblı) Camii",
    district: "Yıldırım",
    address: "Yıldırım/Bursa",
    mapsSearch: "Sıble Yıldırım Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "vefikiye-camii",
    name: "Vefikiye Camii",
    district: "Yıldırım",
    address: "Yıldırım/Bursa",
    mapsSearch: "Vefikiye Camii Yıldırım Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "yesil-i-mareti",
    name: "Yeşil İmâreti",
    district: "Yıldırım",
    address: "Yıldırım/Bursa",
    mapsSearch: "Yeşil İmâreti Yıldırım Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "yildirim-darussifasi",
    name: "Yıldırım Darüşşifası",
    district: "Yıldırım",
    address: "Yıldırım/Bursa",
    mapsSearch: "Yıldırım Darüşşifası Yıldırım Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "iznik-ayasofya",
    name: "İznik Ayasofya Orhan Camii",
    district: "İznik",
    address: "İznik Merkez, İznik/Bursa",
    mapsSearch: "İznik Ayasofya Camii"
  }, {
    id: "iznik-yesil",
    name: "İznik Yeşil Camii",
    district: "İznik",
    address: "Lefke Kapı civarı, İznik/Bursa",
    mapsSearch: "İznik Yeşil Camii"
  }, {
    id: "haci-ozbek-iznik",
    name: "Hacı Özbek Camii (Çarşı Mescidi)",
    district: "İznik",
    address: "Çarşı İçi, İznik/Bursa",
    mapsSearch: "Hacı Özbek Camii İznik"
  }, {
    id: "mahmut-celebi",
    name: "Mahmut Çelebi Camii",
    district: "İznik",
    address: "Ayasofya civarı, İznik/Bursa",
    mapsSearch: "Mahmut Çelebi Camii İznik"
  }, {
    id: "esrefzade",
    name: "Eşrefzade (Eşref-i Rumi) Camii",
    district: "İznik",
    address: "İznik Merkez, İznik/Bursa",
    mapsSearch: "Eşrefzade Camii İznik"
  }, {
    id: "seyh-kutbuddin",
    name: "Şeyh Kutbuddin Camii",
    district: "İznik",
    address: "İznik, Bursa",
    mapsSearch: "Şeyh Kutbuddin Camii İznik"
  }, {
    id: "yakup-celebi-iznik",
    name: "Yakup Çelebi Camii",
    district: "İznik",
    address: "İznik Merkez, İznik/Bursa",
    mapsSearch: "Yakup Çelebi Camii İznik",
    addedAt: "2026-07-13"
  }, {
    id: "orhan-gazi-eski-cami-iznik",
    name: "Orhan Gazi Eski Camisi",
    district: "İznik",
    address: "Yenişehir Kapısı dışı, Kırgızlar Türbesi karşısı, İznik/Bursa",
    mapsSearch: "Orhan Gazi Camii İznik",
    addedAt: "2026-07-13T01:00:00"
  }, {
    id: "tirilye-fatih-camii",
    name: "Tirilye Fatih Camii (Hagios Stephanos Kilisesi)",
    district: "Mudanya",
    address: "Tirilye, Mudanya/Bursa",
    mapsSearch: "Fatih Camii Tirilye Mudanya",
    addedAt: "2026-07-13T02:00:00"
  }, {
    id: "halil-aga-eski",
    name: "Halil Ağa Camii (Eski Cami)",
    district: "Mudanya",
    address: "Hasanbey, Mudanya/Bursa",
    mapsSearch: "Halil Ağa Camii Mudanya"
  }, {
    id: "hasan-bey-camii-mudanya",
    name: "Hasan Bey Camii",
    district: "Mudanya",
    address: "Hasanbey Mahallesi, Mudanya/Bursa",
    mapsSearch: "Hasan Bey Camii Mudanya",
    addedAt: "2026-07-13T05:00:00"
  }, {
    id: "omer-bey-camii-mudanya",
    name: "Ömer Bey Camii",
    district: "Mudanya",
    address: "Ömerbey Mahallesi, Halitpaşa Cd. No:72B, Mudanya/Bursa",
    mapsSearch: "Ömer Bey Camii Mudanya",
    addedAt: "2026-07-13T04:00:00"
  }, {
    id: "tekke-i-cedidi-camii",
    name: "Tekke-i Cedidi Camii",
    district: "Mudanya",
    address: "Mudanya Merkez, Mudanya/Bursa",
    mapsSearch: "Tekke-i Cedidi Camii Mudanya",
    addedAt: "2026-07-13T03:00:00"
  }, {
    id: "tekke-i-atik",
    name: "Tekke-i Atik Camii",
    district: "Mudanya",
    address: "Hasanbey, Mudanya/Bursa",
    mapsSearch: "Tekke-i Atik Camii Mudanya"
  }, {
    id: "haci-mehmet-aga-camii",
    name: "Hacı Mehmet Ağa Camii",
    district: "Mudanya",
    address: "Mudanya/Bursa",
    mapsSearch: "Hacı Mehmet Ağa Camii Mudanya Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "kursunlu-camii",
    name: "Kurşunlu Camii",
    district: "Gemlik",
    address: "Kurşunlu, Gemlik/Bursa",
    mapsSearch: "Kurşunlu Camii Gemlik"
  }, {
    id: "umurbey-carsi-camii",
    name: "Umurbey Çarşı Camii",
    district: "Gemlik",
    address: "Umurbey Beldesi Merkez, Çarşı içi, Gemlik/Bursa",
    mapsSearch: "Umurbey Çarşı Camii Gemlik"
  }, {
    id: "inegol-ishakpasa",
    name: "İshakpaşa Camii",
    district: "İnegöl",
    address: "İnegöl Merkez, İnegöl/Bursa",
    mapsSearch: "İshakpaşa Camii İnegöl"
  }, {
    id: "yildirim-camii-inegol",
    name: "Yıldırım Camii",
    district: "İnegöl",
    address: "Cuma Mahallesi, Nuri Doğrul Cd., İshak Paşa Medresesi yanı, İnegöl/Bursa",
    mapsSearch: "Yıldırım Camii İnegöl",
    addedAt: "2026-07-13T06:00:00"
  }, {
    id: "kasim-efendi-camii-inegol",
    name: "Kasım Efendi Camii",
    district: "İnegöl",
    address: "İnegöl Merkez, İnegöl/Bursa",
    mapsSearch: "Kasım Efendi Camii İnegöl",
    addedAt: "2026-07-19"
  }, {
    id: "hancerli-fatma-sultan-camii-inegol",
    name: "Hançerli Fatma Sultan Camii (Kurşunlu Camii / İmaret Camii)",
    district: "İnegöl",
    address: "Kurşunlu Mahallesi, İnegöl/Bursa",
    mapsSearch: "Hançerli Fatma Sultan Camii İnegöl",
    addedAt: "2026-07-19"
  }, {
    id: "yenisehir-ulu",
    name: "Orhan Gazi Ulu Camii",
    district: "Yenişehir",
    address: "Ulucami Mahallesi, Ulucami Sokak, Yenişehir/Bursa",
    mapsSearch: "Yenişehir Ulu Camii"
  }, {
    id: "yarhisar-orhan-gazi-camii",
    name: "Yarhisar Orhan Gazi Camii (Nilüfer Hatun Camii)",
    district: "Yenişehir",
    address: "Yarhisar Köyü, Yenişehir/Bursa",
    mapsSearch: "Orhan Gazi Camii Yarhisar Yenişehir Bursa",
    addedAt: "2026-07-13T11:00:00"
  }, {
    id: "bali-bey-camii-yenisehir",
    name: "Balı Bey Camii",
    district: "Yenişehir",
    address: "Yenişehir Merkez, Yenişehir/Bursa",
    mapsSearch: "Balı Bey Camii Yenişehir",
    addedAt: "2026-07-13T07:00:00"
  }, {
    id: "kumluk-camii-yenisehir",
    name: "Kumluk Camii",
    district: "Yenişehir",
    address: "Murat Paşa Mahallesi, Yenişehir/Bursa",
    mapsSearch: "Kumluk Camii Yenişehir Bursa",
    addedAt: "2026-07-13T08:00:00"
  }, {
    id: "voyvoda-cinarli-camii-yenisehir",
    name: "Voyvoda (Çınarlı) Camii",
    district: "Yenişehir",
    address: "Bali Bey Camii ve Külliyesi yakını (kuzeyi), Yenişehir/Bursa",
    mapsSearch: "Çınarlı Camii Yenişehir Bursa",
    addedAt: "2026-07-13T09:00:00"
  }, {
    id: "sinan-pasa-camii-kulliyesi-yenisehir",
    name: "Sinan Paşa Camii ve Külliyesi (Kurşunlu Han)",
    district: "Yenişehir",
    address: "Yenişehir Merkez, Yenişehir/Bursa",
    mapsSearch: "Sinan Paşa Külliyesi Yenişehir Bursa",
    addedAt: "2026-07-13T10:00:00"
  }, {
    id: "ethem-pasa-camii",
    name: "Ethem Paşa Camii",
    district: "Yenişehir",
    address: "Yenişehir/Bursa",
    mapsSearch: "Ethem Paşa Camii Yenişehir Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "osman-gazi-camii",
    name: "Osman Gazi Camii",
    district: "Yenişehir",
    address: "Yenişehir/Bursa",
    mapsSearch: "Osman Gazi Camii Yenişehir Bursa",
    addedAt: "2026-07-19"
  }, {
    id: "mustafakemalpasa-yesil-camii",
    name: "Yeşil Camii",
    district: "Mustafakemalpaşa",
    address: "Çırpan Mahallesi, Yeşil Cami Sk. No:1, Mustafakemalpaşa/Bursa",
    mapsSearch: "Yeşil Camii Mustafakemalpaşa"
  }, {
    id: "mustafakemalpasa-yenickoy-camii",
    name: "Yeniceköy Camii",
    district: "Mustafakemalpaşa",
    address: "Yenice Köyü, Devecikonağı, Mustafakemalpaşa/Bursa",
    mapsSearch: "Yeniceköy Camii Mustafakemalpaşa"
  }, {
    id: "mustafakemalpasa-muftu-camii",
    name: "Şeyh Müftü Camii",
    district: "Mustafakemalpaşa",
    address: "Şeyhmüftü Mahallesi, Balıkesir Cd., Mustafakemalpaşa/Bursa",
    mapsSearch: "Müftü Camii Mustafakemalpaşa"
  }, {
    id: "mustafakemalpasa-melikkoyu-camii",
    name: "Melik Köyü Camii",
    district: "Mustafakemalpaşa",
    address: "Melik Köyü, Mustafakemalpaşa/Bursa",
    mapsSearch: "Melik Köyü Camii Mustafakemalpaşa"
  }, {
    id: "mustafakemalpasa-lala-sahin-pasa-kulliyesi",
    name: "Lala Şahin Paşa Külliyesi (Cami, Medrese, Türbe)",
    district: "Mustafakemalpaşa",
    address: "Kirmasti Çayı kıyısındaki park, Mustafakemalpaşa/Bursa",
    mapsSearch: "Lala Şahin Paşa Türbesi Mustafakemalpaşa"
  }, {
    id: "mustafakemalpasa-kestelek-koyu-camii",
    name: "Kestelek Köyü Camii",
    district: "Mustafakemalpaşa",
    address: "Kestelek Köyü, Çaltılıbük, Mustafakemalpaşa/Bursa",
    mapsSearch: "Kestelek Köyü Camii Mustafakemalpaşa"
  }, {
    id: "mustafakemalpasa-hamzabey-camii",
    name: "Hamzabey Camii",
    district: "Mustafakemalpaşa",
    address: "Mustafakemalpaşa/Bursa",
    mapsSearch: "Hamzabey Camii Mustafakemalpaşa"
  }, {
    id: "mustafakemalpasa-seydiali-koyu-camii",
    name: "Seydi Ali Köyü Camisi",
    district: "Mustafakemalpaşa",
    address: "Seydi Ali Köyü, Mustafakemalpaşa/Bursa",
    mapsSearch: "Seydi Ali Köyü Camisi Mustafakemalpaşa"
  }, {
    id: "mustafakemalpasa-ayaz-koyu-camii",
    name: "Ayaz Köyü Camisi",
    district: "Mustafakemalpaşa",
    address: "Ayaz Köyü, Mustafakemalpaşa/Bursa",
    mapsSearch: "Ayaz Köyü Camisi Mustafakemalpaşa"
  }, {
    id: "golyazi-eski-camii",
    name: "Gölyazı Eski Camii",
    district: "Nilüfer",
    address: "Gölyazı, Nilüfer/Bursa",
    mapsSearch: "Gölyazı Eski Camii Bursa"
  }, {
    id: "karacabey-yenisaribeykoyu-camii",
    name: "Yenisarıbey Köyü Camii",
    district: "Karacabey",
    address: "Yenisarıbey Köyü, Karacabey/Bursa",
    mapsSearch: "Yenisarıbey Köyü Camii Karacabey"
  }, {
    id: "karacabey-kumbetli-camii",
    name: "Kümbetli Cami",
    district: "Karacabey",
    address: "Hamidiye Mahallesi, Karacabey/Bursa",
    mapsSearch: "Kümbetli Cami Karacabey"
  }, {
    id: "karacabey-ismetpasa-haci-ali-aga-camii",
    name: "Hacı Ali Ağa Camii",
    district: "Karacabey",
    address: "İsmetpaşa Köyü, Karacabey/Bursa",
    mapsSearch: "Hacı Ali Ağa Camii İsmetpaşa Karacabey"
  }, {
    id: "karacabey-uluabat-eski-valide-sultan-camii",
    name: "Uluabat Eski (Valide Sultan) Camii",
    district: "Karacabey",
    address: "Uluabat Köyü, Karacabey/Bursa",
    mapsSearch: "Uluabat Eski Cami Karacabey"
  }, {
    id: "karacabey-imaret-kursunlu-camii",
    name: "İmaret Camii (Kurşunlu Cami)",
    district: "Karacabey",
    address: "Selimiye Mahallesi, Karacabey/Bursa",
    mapsSearch: "İmaret Camii Kurşunlu Cami Karacabey"
  }, {
    id: "karacabey-ulu-camii",
    name: "Ulu Cami",
    district: "Karacabey",
    address: "Eski Karacabey, Karacabey/Bursa",
    mapsSearch: "Ulu Cami Karacabey"
  }, {
    id: "arap-mehmet-camii",
    name: "Arap Mehmet Camii",
    district: "Osmangazi",
    address: "Osmangazi/Bursa",
    mapsSearch: "Arap Mehmet Camii Bursa",
    addedAt: "2026-07-20"
  }, {
    id: "bahri-baba-camii",
    name: "Bahri Baba Camii",
    district: "Osmangazi",
    address: "Muradiye, Salıpazarı Cd., Osmangazi/Bursa",
    mapsSearch: "Bahri Baba Camii Bursa",
    addedAt: "2026-07-20"
  }, {
    id: "basci-ibrahim-pasa-camii",
    name: "Başçı İbrahim Paşa Camii",
    district: "Osmangazi",
    address: "Maksem, Başçı İbrahim Sk., Osmangazi/Bursa",
    mapsSearch: "Başçı İbrahim Paşa Camii Bursa",
    addedAt: "2026-07-20"
  }, {
    id: "nilufer-hatun-darphane",
    name: "Nilüfer Hatun (Darphane) Mescidi",
    district: "Osmangazi",
    address: "Saltanat Kapı yakını, Osmangazi/Bursa",
    mapsSearch: "Nilüfer Hatun Darphane Mescidi Bursa",
    addedAt: "2026-07-20"
  }, {
    id: "davut-pasa-camii",
    name: "Davut Paşa Camii",
    district: "Osmangazi",
    address: "Bit Pazarı Çarşısı, Osmangazi/Bursa",
    mapsSearch: "Davut Paşa Camii Bursa",
    addedAt: "2026-07-20"
  }, {
    id: "duhter-i-serif-fiskirik",
    name: "Duhter-i Şerif (Fışkırık) Camii",
    district: "Osmangazi",
    address: "Tahtakale, Ahmet Sk. ile Hazım Sk. kesişimi, Osmangazi/Bursa",
    mapsSearch: "Duhter-i Şerif Fışkırık Camii Bursa",
    addedAt: "2026-07-20"
  }, {
    id: "gungormez-camii",
    name: "Güngörmez Camii",
    district: "Osmangazi",
    address: "Ulucami, Atatürk Cd., Osmangazi/Bursa",
    mapsSearch: "Güngörmez Camii Bursa",
    addedAt: "2026-07-20"
  }, {
    id: "guranli-mescidi",
    name: "Güranlı Mescidi",
    district: "Osmangazi",
    address: "Mollagürani, Güranlı Sk., Osmangazi/Bursa",
    mapsSearch: "Güranlı Mescidi Bursa",
    addedAt: "2026-07-20"
  }, 
  // === Osmangazi eklemeleri (Vakıflar envanterinde olup listede bulunmayanlar) ===
  {
    id: "elvan-bey-camii",
    name: "Elvan Bey Camii",
    district: "Osmangazi",
    address: "Hamzabey Mah., Osmangazi/Bursa",
    mapsSearch: "Elvan Bey Camii Bursa",
    addedAt: "2026-07-21"
  }, {
    id: "fidan-hani-mescidi",
    name: "Fidan Hanı Mescidi (Mahmut Paşa)",
    district: "Osmangazi",
    address: "Orhanbey Mah., Uzun Çarşı Cd., Osmangazi/Bursa",
    mapsSearch: "Fidan Hanı Mescidi Bursa",
    addedAt: "2026-07-21"
  }, {
    id: "geyve-han-camii",
    name: "Geyve Han Camii",
    district: "Osmangazi",
    address: "Orhanbey Mah., Uzunçarşı Cad., Osmangazi/Bursa",
    mapsSearch: "Geyve Han Camii Bursa",
    addedAt: "2026-07-21"
  }, {
    id: "haci-sevinc-camii",
    name: "Hacı Sevinç Camii",
    district: "Osmangazi",
    address: "Tahtakale Mah., Veziri Cad., Osmangazi/Bursa",
    mapsSearch: "Hacı Sevinç Camii Bursa",
    addedAt: "2026-07-21"
  }, {
    id: "hoca-hasan-camii",
    name: "Hoca Hasan Camii",
    district: "Osmangazi",
    address: "Hoca Hasan Mah., Hoca Hasan Sok., Osmangazi/Bursa",
    mapsSearch: "Hoca Hasan Camii Bursa",
    addedAt: "2026-07-21"
  }, {
    id: "ismail-hakki-tekke-camii",
    name: "İsmail Hakkı Tekke Camii",
    district: "Osmangazi",
    address: "Tuzpazarı Mah., İsmail Hakkı Cad., Osmangazi/Bursa",
    mapsSearch: "İsmail Hakkı Tekke Camii Bursa",
    addedAt: "2026-07-21"
  }, {
    id: "ivaz-pasa-camii",
    name: "İvaz Paşa Camii",
    district: "Osmangazi",
    address: "Orhanbey Mah., İstiklal Mevkii, Osmangazi/Bursa",
    mapsSearch: "İvaz Paşa Camii Bursa",
    addedAt: "2026-07-21"
  }, {
    id: "ruscuk-camii",
    name: "Ruscuk Camii",
    district: "Osmangazi",
    address: "Şahabettinpaşa Mah., Osmangazi/Bursa",
    mapsSearch: "Ruscuk Camii Bursa",
    addedAt: "2026-07-21"
  }, {
    id: "tavukcu-mescidi",
    name: "Tavukçu Mescidi",
    district: "Osmangazi",
    address: "Şehreküstü Mah., Tavukçu Sok., Osmangazi/Bursa",
    mapsSearch: "Tavukçu Mescidi Bursa",
    addedAt: "2026-07-21"
  }, {
    id: "uftade-tekke-camii",
    name: "Üftade Tekke Camii",
    district: "Osmangazi",
    address: "Pınarbaşı Semti, Osmangazi/Bursa",
    mapsSearch: "Üftade Tekke Camii Bursa",
    addedAt: "2026-07-21"
  }, {
    id: "yeni-bezzaz-camii",
    name: "Yeni Bezzaz Camii",
    district: "Osmangazi",
    address: "Tuzpazarı Mah., İsmail Hakkı Cad., Osmangazi/Bursa",
    mapsSearch: "Yeni Bezzaz Camii Bursa",
    addedAt: "2026-07-21"
  }, {
    id: "elmalik-camii",
    name: "Elmalık Camii",
    district: "Osmangazi",
    address: "Tuzpazarı Mah., Osmangazi/Bursa",
    mapsSearch: "Elmalık Camii Bursa",
    addedAt: "2026-07-21"
  },  

  // === Yıldırım eklemeleri ===
  {
    id: "babadag-camii",
    name: "Babadağ Camii",
    district: "Yıldırım",
    address: "Yeni Mah., Merdivenli Sok., Yıldırım/Bursa",
    mapsSearch: "Babadağ Camii Bursa",
    addedAt: "2026-07-21"
  }, {
    id: "haci-husamettin-tekke-camii",
    name: "Hacı Hüsamettin Tekke Camii",
    district: "Yıldırım",
    address: "Molla Arap Mah., Hüsamettin Tekke Sok., Yıldırım/Bursa",
    mapsSearch: "Hacı Hüsamettin Tekke Camii Bursa",
    addedAt: "2026-07-21"
  }, {
    id: "haci-sevindik-camii",
    name: "Hacı Sevindik Camii",
    district: "Yıldırım",
    address: "Meydancık Mah., Cami Aralığı Sok., Yıldırım/Bursa",
    mapsSearch: "Hacı Sevindik Camii Bursa",
    addedAt: "2026-07-21"
  }, {
    id: "haci-seyfettin-camii",
    name: "Hacı Seyfettin Camii",
    district: "Yıldırım",
    address: "Hacı Seyfettin Mah., İncirli Cad., Yıldırım/Bursa",
    mapsSearch: "Hacı Seyfettin Camii Bursa",
    addedAt: "2026-07-21"
  }, {
    id: "mucelleddin-omer-aga-camii",
    name: "Mücelleddin Ömer Ağa Camii",
    district: "Yıldırım",
    address: "Hacı Seyfettin Mah., Mücelleddin Mevkii, Yıldırım/Bursa",
    mapsSearch: "Mücelleddin Ömer Ağa Camii Bursa",
    addedAt: "2026-07-21"
  }, {
    id: "selami-tekkesi-camii",
    name: "Selami Tekkesi Camii",
    district: "Yıldırım",
    address: "Namazgah Mah., Yıldırım/Bursa",
    mapsSearch: "Selami Tekkesi Camii Bursa",
    addedAt: "2026-07-21"
  }, {
    id: "tatarlar-camii",
    name: "Tatarlar Camii",
    district: "Yıldırım",
    address: "Selimzade Mah., Selimzade Cad., Yıldırım/Bursa",
    mapsSearch: "Tatarlar Camii Bursa",
    addedAt: "2026-07-21"
  },    

  // === İnegöl eklemeleri ===
  {
    id: "isak-pasa-camii-inegol",
    name: "İsak Paşa Camii ve Haziresi",
    district: "İnegöl",
    address: "Camiikebir Mevkii, Cuma Mah., İnegöl/Bursa",
    mapsSearch: "İsak Paşa Camii İnegöl",
    addedAt: "2026-07-21"
  }, {
    id: "cuma-camii-inegol",
    name: "Cuma Camii",
    district: "İnegöl",
    address: "Cuma Mah., İnegöl/Bursa",
    mapsSearch: "Cuma Camii İnegöl",
    addedAt: "2026-07-21"
  }, {
    id: "burhaniye-camii-inegol",
    name: "Burhaniye Camii",
    district: "İnegöl",
    address: "Burhaniye Mah., İnegöl/Bursa",
    mapsSearch: "Burhaniye Camii İnegöl",
    addedAt: "2026-07-21"
  }, {
    id: "kemal-pasa-bosnak-camii",
    name: "Kemal Paşa (Boşnak) Camii",
    district: "İnegöl",
    address: "Kemal Paşa Cad., Esat Bey Mah., İnegöl/Bursa",
    mapsSearch: "Kemal Paşa Boşnak Camii İnegöl",
    addedAt: "2026-07-21"
  }, {
    id: "osmaniye-camasirlik-camii",
    name: "Osmaniye (Çamaşırlık) Camii",
    district: "İnegöl",
    address: "Osmaniye Mah., İnegöl/Bursa",
    mapsSearch: "Osmaniye Çamaşırlık Camii İnegöl",
    addedAt: "2026-07-21"
  }, {
    id: "sipali-koyu-ivaz-celebi-camii",
    name: "Şipali Köyü (İvaz Çelebi) Camii ve Haziresi",
    district: "İnegöl",
    address: "Şipali Köyü, Köyiçi Mevkii, İnegöl/Bursa",
    mapsSearch: "Şipali Köyü İvaz Çelebi Camii İnegöl",
    addedAt: "2026-07-21"
  }, {
    id: "cardak-camii-inegol",
    name: "Çardak Camii",
    district: "İnegöl",
    address: "Cuma Mah., İnegöl/Bursa",
    mapsSearch: "Çardak Camii İnegöl",
    addedAt: "2026-07-21"
  }, {
    id: "hurriyet-sari-camii",
    name: "Hürriyet Sarı Camii",
    district: "İnegöl",
    address: "Mahmudiye Mah., Kasımefendi Cad., İnegöl/Bursa",
    mapsSearch: "Hürriyet Sarı Camii İnegöl",
    addedAt: "2026-07-21"
  }, {
    id: "haci-hafiz-laz-camii",
    name: "Hacı Hafız (Laz) Camii",
    district: "İnegöl",
    address: "Kemal Paşa Mah., İsmailefendi Cad., İnegöl/Bursa",
    mapsSearch: "Hacı Hafız Laz Camii İnegöl",
    addedAt: "2026-07-21"
  }, {
    id: "tahta-kopru-hamidiye-camii",
    name: "Tahta Köprü Hamidiye Camii",
    district: "İnegöl",
    address: "Tahtaköprü, Köy İçi Mevkii, İnegöl/Bursa",
    mapsSearch: "Tahta Köprü Hamidiye Camii İnegöl",
    addedAt: "2026-07-21"
  }, {
    id: "sungur-pasa-koyu-camii",
    name: "Sungur Paşa Köyü Camii",
    district: "İnegöl",
    address: "Sungur Paşa Köyü, Köyiçi Mevkii, İnegöl/Bursa",
    mapsSearch: "Sungur Paşa Köyü Camii İnegöl",
    addedAt: "2026-07-21"
  }, {
    id: "kiran-koyu-camii",
    name: "Kıran Köyü Camii",
    district: "İnegöl",
    address: "Kıran Köyü, Köy içi Mevkii, İnegöl/Bursa",
    mapsSearch: "Kıran Köyü Camii İnegöl",
    addedAt: "2026-07-21"
  }, {
    id: "hamidiye-koyu-camii",
    name: "Hamidiye Köyü Camii",
    district: "İnegöl",
    address: "Hamidiye Köyü, Köy içi Mevkii, İnegöl/Bursa",
    mapsSearch: "Hamidiye Köyü Camii İnegöl",
    addedAt: "2026-07-21"
  }, {
    id: "suleymaniye-camii-inegol",
    name: "Süleymaniye Camii",
    district: "İnegöl",
    address: "Süleymaniye Mah., İnegöl/Bursa",
    mapsSearch: "Süleymaniye Camii İnegöl",
    addedAt: "2026-07-21"
  }, {
    id: "sinan-bey-camii-inegol",
    name: "Sinan Bey Camii",
    district: "İnegöl",
    address: "Sinan Bey Mah., Atatürk Bulvarı, İnegöl/Bursa",
    mapsSearch: "Sinan Bey Camii İnegöl",
    addedAt: "2026-07-21"
  },

  // === Yenişehir eklemeleri ===
  {
    id: "haci-hasan-demirci-hidirbali-camii",
    name: "Hacı Hasan Demirci (Hıdırbali) Camii ve Haziresi",
    district: "Yenişehir",
    address: "Hıdırbali Mah., Ali Haydar Sok., Yenişehir/Bursa",
    mapsSearch: "Hıdırbali Camii Yenişehir",
    addedAt: "2026-07-21"
  }, {
    id: "postinpos-camii",
    name: "Postinpos Camii",
    district: "Yenişehir",
    address: "Yenigün Cad., Cihadiye Cad., Yenişehir/Bursa",
    mapsSearch: "Postinpos Camii Yenişehir",
    addedAt: "2026-07-21"
  }, {
    id: "semaki-camii",
    name: "Şemaki Camii",
    district: "Yenişehir",
    address: "Çayır Mah., Şeref Mevkii, Yenişehir/Bursa",
    mapsSearch: "Şemaki Camii Yenişehir",
    addedAt: "2026-07-21"
  }, {
    id: "baba-sultan-camii-yenisehir",
    name: "Baba Sultan Camii",
    district: "Yenişehir",
    address: "Yenigün Mah., Sağır Osman Cad., Yenişehir/Bursa",
    mapsSearch: "Baba Sultan Camii Yenişehir",
    addedAt: "2026-07-21"
  }, {
    id: "cayir-tatarlar-mescidi",
    name: "Çayır (Tatarlar) Mescidi",
    district: "Yenişehir",
    address: "Çayır Mah., Tatarlar Mevkii, Yenişehir/Bursa",
    mapsSearch: "Çayır Tatarlar Mescidi Yenişehir",
    addedAt: "2026-07-21"
  }, {
    id: "hatuniye-camii",
    name: "Hatuniye Camii",
    district: "Yenişehir",
    address: "Yenigün Mah., Güldeste Cad., Yenişehir/Bursa",
    mapsSearch: "Hatuniye Camii Yenişehir",
    addedAt: "2026-07-21"
  }, {
    id: "reyhan-pasa-sumbullu-camii",
    name: "Reyhan Paşa Camii (Sümbüllü)",
    district: "Yenişehir",
    address: "Yeni Mah., Dere Sok., Yenişehir/Bursa",
    mapsSearch: "Reyhan Paşa Camii Yenişehir",
    addedAt: "2026-07-21"
  },

  // === Mustafakemalpaşa eklemeleri ===
  {
    id: "attariye-camii",
    name: "Attariye Camii",
    district: "Mustafakemalpaşa",
    address: "Attariye Mah., Mustafakemalpaşa/Bursa",
    mapsSearch: "Attariye Camii Mustafakemalpaşa",
    addedAt: "2026-07-21"
  }, {
    id: "celtikci-koyu-camii",
    name: "Çeltikçi Köyü Camii",
    district: "Mustafakemalpaşa",
    address: "Çeltikçi Mah., Mustafakemalpaşa/Bursa",
    mapsSearch: "Çeltikçi Köyü Camii Mustafakemalpaşa",
    addedAt: "2026-07-21"
  }, {
    id: "selimiye-camii-minaresi-mkp",
    name: "Selimiye Camii Minaresi",
    district: "Mustafakemalpaşa",
    address: "Selimiye Mah., Cami Sok., Mustafakemalpaşa/Bursa",
    mapsSearch: "Selimiye Camii Minaresi Mustafakemalpaşa",
    addedAt: "2026-07-21"
  }, {
    id: "zufer-bey-camii",
    name: "Züfer Bey Camii",
    district: "Mustafakemalpaşa",
    address: "Züfer Bey Mah., Çarşı Sok., Mustafakemalpaşa/Bursa",
    mapsSearch: "Züfer Bey Camii Mustafakemalpaşa",
    addedAt: "2026-07-21"
  }, {
    id: "fevzi-dede-camii",
    name: "Fevzi Dede Camii",
    district: "Mustafakemalpaşa",
    address: "Fevzidede Mah., Hüseyin Cad., Mustafakemalpaşa/Bursa",
    mapsSearch: "Fevzi Dede Camii Mustafakemalpaşa",
    addedAt: "2026-07-21"
  }, {
    id: "hamidiye-yesil-camii-mkp",
    name: "Hamidiye (Yeşil) Camii",
    district: "Mustafakemalpaşa",
    address: "Çırpan Mah., Balıkesir Cad., Mustafakemalpaşa/Bursa",
    mapsSearch: "Hamidiye Yeşil Camii Mustafakemalpaşa",
    addedAt: "2026-07-21"
  }, {
    id: "haci-poturcu-camii",
    name: "Hacı Poturcu Camii",
    district: "Mustafakemalpaşa",
    address: "Orta Mah., Eski Bursa Cad., Mustafakemalpaşa/Bursa",
    mapsSearch: "Hacı Poturcu Camii Mustafakemalpaşa",
    addedAt: "2026-07-21"
  }, {
    id: "sevketiye-demirciler-camii",
    name: "Şevketiye (Demirciler) Camii",
    district: "Mustafakemalpaşa",
    address: "Şevketiye Mah., Demirciler Cad., Mustafakemalpaşa/Bursa",
    mapsSearch: "Şevketiye Demirciler Camii Mustafakemalpaşa",
    addedAt: "2026-07-21"
  }, {
    id: "bahcelievler-camii-mkp",
    name: "Bahçelievler Camii",
    district: "Mustafakemalpaşa",
    address: "Hamza Bey Mah., Bahçeli Mevkii, Mustafakemalpaşa/Bursa",
    mapsSearch: "Bahçelievler Camii Mustafakemalpaşa",
    addedAt: "2026-07-21"
  }, {
    id: "cardak-camii-mkp",
    name: "Çardak Camii",
    district: "Mustafakemalpaşa",
    address: "Orta Mah., Eski Bursa Cad., Mustafakemalpaşa/Bursa",
    mapsSearch: "Çardak Camii Mustafakemalpaşa",
    addedAt: "2026-07-21"
  }, {
    id: "yildiz-orta-camii",
    name: "Yıldız (Orta) Camii",
    district: "Mustafakemalpaşa",
    address: "Orta Mah., Eski Bursa Cad., Mustafakemalpaşa/Bursa",
    mapsSearch: "Yıldız Orta Camii Mustafakemalpaşa",
    addedAt: "2026-07-21"
  }, {
    id: "cirpan-camii",
    name: "Çırpan Camii",
    district: "Mustafakemalpaşa",
    address: "Çırpan Mah., Adile Mezarlık Sok., Mustafakemalpaşa/Bursa",
    mapsSearch: "Çırpan Camii Mustafakemalpaşa",
    addedAt: "2026-07-21"
  },

  // === Mudanya eklemeleri ===
  {
    id: "yeni-camii-mudanya",
    name: "Yeni Camii",
    district: "Mudanya",
    address: "Halitpaşa Mah., Fevzi Sok., Mudanya/Bursa",
    mapsSearch: "Yeni Camii Mudanya",
    addedAt: "2026-07-21"
  }, {
    id: "mursel-koyu-camii",
    name: "Mürsel Köyü Camii",
    district: "Mudanya",
    address: "Mürsel Köyü, Köyiçi Mevkii, Mudanya/Bursa",
    mapsSearch: "Mürsel Köyü Camii Mudanya",
    addedAt: "2026-07-21"
  },

  // === Orhangazi eklemeleri ===
  {
    id: "muradiye-camii-orhangazi",
    name: "Muradiye Camii",
    district: "Orhangazi",
    address: "Muradiye Mah., Yalova Cad., Orhangazi/Bursa",
    mapsSearch: "Muradiye Camii Orhangazi",
    addedAt: "2026-07-21"
  }, {
    id: "tekke-camii-orhangazi",
    name: "Tekke Camii",
    district: "Orhangazi",
    address: "Tekke Mahallesi, Cami Sok., Orhangazi/Bursa",
    mapsSearch: "Tekke Camii Orhangazi",
    addedAt: "2026-07-21"
  }, {
    id: "gurle-koyu-orhangazi-camii",
    name: "Gürle Köyü (Orhangazi) Camii",
    district: "Orhangazi",
    address: "Gürle Köyü, Köy İçi, Orhangazi/Bursa",
    mapsSearch: "Gürle Köyü Camii Orhangazi",
    addedAt: "2026-07-21"
  },

  // === Kestel eklemeleri ===
  {
    id: "aksukoyu-camii",
    name: "Aksuköyü Camii",
    district: "Kestel",
    address: "Aksu Köyü, Köyiçi, Kestel/Bursa",
    mapsSearch: "Aksuköyü Camii Kestel",
    addedAt: "2026-07-21"
  }, {
    id: "vani-mehmet-efendi-camii",
    name: "Vani Mehmet Efendi Camii",
    district: "Kestel",
    address: "Kestel Mah., Beşevler Mevkii, Kestel/Bursa",
    mapsSearch: "Vani Mehmet Efendi Camii Kestel",
    addedAt: "2026-07-21"
  },

  // === Karacabey eklemeleri ===
  {
    id: "karacabey-ulu-hudavendigar-camii",
    name: "Ulu (Hüdavendigar) Camii",
    district: "Karacabey",
    address: "Garipçe Mah., İmaret Cad., Karacabey/Bursa",
    mapsSearch: "Ulu Hüdavendigar Camii Karacabey",
    addedAt: "2026-07-21"
  }, {
    id: "karacabey-mamuriyet-camii",
    name: "Mamuriyet Camii",
    district: "Karacabey",
    address: "Mamuriyet Mah., 7 Nolu Sok., Karacabey/Bursa",
    mapsSearch: "Mamuriyet Camii Karacabey",
    addedAt: "2026-07-21"
  }, {
    id: "karacabey-haci-cemali-nasrullah-camii",
    name: "Hacı Cemali (Nasrullah) Camii",
    district: "Karacabey",
    address: "Yenice Mah., Bursa Cad., Karacabey/Bursa",
    mapsSearch: "Hacı Cemali Nasrullah Camii Karacabey",
    addedAt: "2026-07-21"
  }, {
    id: "karacabey-rungus-pasa-camii",
    name: "Runguş Paşa Camii",
    district: "Karacabey",
    address: "Runguş Paşa Mah., Karacabey/Bursa",
    mapsSearch: "Runguş Paşa Camii Karacabey",
    addedAt: "2026-07-21"
  }, {
    id: "karacabey-hamidiye-camii",
    name: "Hamidiye Camii",
    district: "Karacabey",
    address: "Hüdavendigar Mah., Karacabey/Bursa",
    mapsSearch: "Hamidiye Camii Karacabey",
    addedAt: "2026-07-21"
  }, {
    id: "karacabey-saadet-camii",
    name: "Saadet Camii",
    district: "Karacabey",
    address: "Saadet Mah., Karacabey/Bursa",
    mapsSearch: "Saadet Camii Karacabey",
    addedAt: "2026-07-21"
  }, {
    id: "karacabey-hidayet-camii",
    name: "Hidayet Camii",
    district: "Karacabey",
    address: "Sırabademler Mah., 14 Eylül Cad., Karacabey/Bursa",
    mapsSearch: "Hidayet Camii Karacabey",
    addedAt: "2026-07-21"
  }, 

  // === Nilüfer eklemeleri ===
  {
    id: "nilufer-demirci-koyu-camii",
    name: "Demirci Köyü Camii",
    district: "Nilüfer",
    address: "Demirci Mah., Nilüfer/Bursa",
    mapsSearch: "Demirci Köyü Camii Nilüfer",
    addedAt: "2026-07-21"
  }, {
    id: "nilufer-ozluce-koyu-camii",
    name: "Özlüce Köyü Camii",
    district: "Nilüfer",
    address: "Özlüce Mahallesi, Nilüfer/Bursa",
    mapsSearch: "Özlüce Köyü Camii Nilüfer",
    addedAt: "2026-07-21"
  },

  // === Gemlik eklemeleri ===
  {
    id: "gemlik-yeni-balik-pazari-camii",
    name: "Yeni (Balık Pazarı) Camii",
    district: "Gemlik",
    address: "Balıkpazarı Mah., Gemlik/Bursa",
    mapsSearch: "Yeni Balık Pazarı Camii Gemlik",
    addedAt: "2026-07-21"
  }, {
    id: "gemlik-emetullah-camii",
    name: "Emetullah Camii ve Şehitler Anıtı",
    district: "Gemlik",
    address: "Demirsubaşı Mah., Gemlik/Bursa",
    mapsSearch: "Emetullah Camii Gemlik",
    addedAt: "2026-07-21"
  }, {
    id: "gemlik-adliye-koyu-camii",
    name: "Adliye Köyü Camii",
    district: "Gemlik",
    address: "Adliye Köyü, Gemlik/Bursa",
    mapsSearch: "Adliye Köyü Camii Gemlik",
    addedAt: "2026-07-21"
  },

  // === Orhaneli eklemesi ===
  {
    id: "orhaneli-durdu-bey-camii",
    name: "Durdu Bey Camii",
    district: "Orhaneli",
    address: "Fevzi Paşa Mah., Çarşı Cad., Orhaneli/Bursa",
    mapsSearch: "Durdu Bey Camii Orhaneli",
    addedAt: "2026-07-21"
  },

  // === Gürsu eklemesi ===
  {
    id: "gursu-orta-camii",
    name: "Orta Camii",
    district: "Gürsu",
    address: "İstiklal Mah., Fatih Cad., Gürsu/Bursa",
    mapsSearch: "Orta Camii Gürsu",
    addedAt: "2026-07-21"
  },

  // === Harmancık eklemesi ===
  {
    id: "harmancik-divan-camii",
    name: "Divan Camii",
    district: "Harmancık",
    address: "Dedebali Mah., Harmancık/Bursa",
    mapsSearch: "Divan Camii Harmancık",
    addedAt: "2026-07-21"
  }];;
const MOSQUE_INFO = {
  "ulu-cami": {
    period: "1396 – 1399 (Yıldırım Bayezid Dönemi)",
    founder: "Yıldırım Bayezid (I. Bayezid)",
    architect: "Mimarı kesin olarak bilinmiyor; kaynaklarda Ali Neccar adı geçer.",
    info: "Niğbolu Zaferi sonrası, adak olarak 20 ayrı cami yerine 20 kubbeli tek bir ulu cami yapılması önerisiyle inşa edilmiştir. Türkiye'nin iç mekânı en geniş camisi olup kündekari tekniğiyle işlenmiş tarihi minberi ve içindeki şadırvanla ünlüdür."
  },
  "orhan-gazi": {
    period: "1339 (Orhan Gazi Dönemi)",
    founder: "Orhan Gazi",
    info: "Bursa'da kale surları dışına inşa edilen ilk külliyenin ana yapısıdır; şehirdeki 'zaviyeli plan' tipindeki ilk camidir. 1413'te Karamanoğlu Mehmed Bey tarafından tahrip edilmiş, 1417'de Çelebi Mehmed tarafından onarılmıştır."
  },
  "hudavendigar": {
    period: "1365 – 1366 (I. Murad Dönemi)",
    founder: "I. Murad (Hüdavendigar)",
    info: "Alt katı ibadet mekânı, üst katı medrese olarak tasarlanmış; Osmanlı mimarisinde eşi görülmeyen iki katlı bir yapıdır. O dönem şehre uzak sayılan Çekirge'de, ovaya hâkim bir tepe üzerine inşa edilmiştir."
  },
  "muradiye": {
    period: "1425 – 1426 (II. Murad Dönemi)",
    founder: "II. Murad",
    info: "Bursa'da bir Osmanlı padişahı adına yapılan son camidir. Kündekari tekniğiyle işlenmiş ahşap giriş kapısı ve İznik çinileriyle tanınır; külliye çevresinde çok sayıda şehzade ve saray mensubunun türbesi bulunur."
  },
  "sehadet-camii": {
    period: "1365 (I. Murad Hüdavendigar Dönemi); 1892'de büyük ölçüde yenilendi",
    founder: "I. Murad (Hüdavendigar)",
    info: "Hisar içinde, sarayın tam karşısında I. Murad Hüdavendigar tarafından 1365 yılında 'Sultan Camisi' (Kale Camisi) adıyla yaptırılmıştır. Çeşitli kaynaklara göre, Sultan'ın 1389'da Kosova'da şehit düşmesi üzerine cami 'Şahadet Camisi' adını almıştır. Üç sahınlı; orta sahın iki kubbe, iki yan sahın ise ikişerden toplam dört tonozla örtülü, çok direkli-kubbeli bir Ulu Cami örneğidir. Kuzeydoğusunda tek minaresi, kuzeyinde dört küçük kubbeli son cemaat yeri bulunur; 17. yüzyılda güney cephesini desteklemek için iki payanda eklenmiştir. 1855 depreminde ağır hasar görmüş, 1892'de Vali Mahmud Celaleddin tarafından yıkıntılar üzerine, yalnızca orta sahından ibaret ve aslının yaklaşık üçte iki küçüklüğünde, oldukça farklı bir biçimde yeniden inşa edilmiştir. Cephesi 19. yüzyılda Avrupa'da yaygın Gotik üslupta, sivri kemerli pencerelerle yapılmıştır. Kaynak: turkiyenintarihieserleri.com"
  },
  "yesil-cami": {
    period: "1414 – 1419 (Çelebi Mehmed Dönemi)",
    founder: "Çelebi Sultan I. Mehmed",
    architect: "Hacı İvaz Paşa",
    info: "Fetret Devri sonrası devletin yeniden toparlanışını simgeleyen yapıdır. Marmara Adası mermeri ve zengin İznik çinileriyle erken dönem Osmanlı sanatının en görkemli örneklerinden sayılır; karşısındaki Yeşil Türbe'de banisi Çelebi Mehmed medfundur."
  },
  "emir-sultan": {
    period: "15. yüzyıl başı (Çelebi Mehmed / II. Murad Dönemi)",
    founder: "Hundi Fatma Hatun (Yıldırım Bayezid'in kızı, Emir Sultan'ın eşi)",
    info: "Buhara asıllı âlim Emir Sultan adına eşi tarafından yaptırılmıştır. 1795 depreminde tamamen yıkılmış, 1804'te III. Selim tarafından aynı plan üzerine yeniden inşa edilmiştir. Avlusundaki asırlık çınarlar ve Emir Sultan Türbesi'yle bilinir."
  },
  "yildirim-bayezid": {
    period: "1391 – 1395 (Yıldırım Bayezid Dönemi)",
    founder: "Yıldırım Bayezid (I. Bayezid)",
    info: "'Ters T' planlı erken dönem Osmanlı camilerindendir; tamamen kesme taştan inşa edilmesi ve ünlü 'Bursa kemeri'nin ilk kez burada kullanılmasıyla dikkat çeker. 1855 depreminden sonra kapsamlı onarım görmüştür."
  },
  "ali-pasa": {
    period: "Yıldırım Bayezid Dönemi; onarımlar 1854 depremi sonrası",
    founder: "Ali Paşa (Çandarlı Halil Hayreddin Paşa'nın oğlu, Yıldırım Bayezid'in veziri)",
    info: "Bursa Orhan Camii ile başlayan, kanatlı ters \"T\" planlı zaviyeli camiler grubundandır. 1854 depreminde büyük hasar görmüş, kubbeler ve yan kanatlar yıkılmış; bugünkü şeklini depremden sonraki onarımlarla almıştır. Beş kemerli son cemaat yeri yığma ayaklara oturur, doğu ve batı yanları kapalıdır. Beş bölmeli mekânın aslen kubbelerle örtülü olduğu kalan izlerden anlaşılmaktadır; günümüzde onarımlarla büyük değişime uğramıştır. Çokgen iki sütunca, on bir sıra mukarnaslı portal nişini destekler, iki yanında beş sıra mukarnaslı hücreler bulunur. Kapıdan sonra, aslında art arda iki kubbeyle örtülü olması gereken asıl ibadet mekânına geçilir; bu kubbeler yıkılmış, yerlerine tavan yapılmıştır — namaz kılınan kısım bu iki kubbenin altındaki alandır. Doğu ve batı yan kanatlar tamamen yıkılmış olup, üzerlerinin daire tonozlarla örtülü olduğu kalan izlerden anlaşılır. Yapı üç sıra tuğla, bir sıra moloz taş dizisiyle inşa edilmiştir; 1854 depreminde çarpılıp eğrilmiştir. Caminin asıl minaresi yoktur, şimdiki minare sonradan yapılmıştır. (Kaynak: Bursa İl Kültür ve Turizm Müdürlüğü)"
  },
  "alaaddin-bey": {
    period: "1326 (Orhan Gazi Dönemi); onarımlar 1861-1862 ve 1960",
    founder: "Alaaddin Bey (Osman Gazi'nin oğlu, Orhan Bey'in kardeşi)",
    info: "Erken Osmanlı dönemini anlatan kaynaklara göre Bursa'da yapılan ilk cami olarak bilinmektedir. 1855 depreminde bir hayli hasar gören caminin 1861-1862 tamirinde bazı kısımları değiştirilerek revakı yeniden yapılmış, cephesine Türk minaresine uygun olmayan üçgen biçimde bir alınlık eklenmiştir; 1960'ta Bursa Eski Eserleri Sevenler Kurumu tarafından yeniden onarılmıştır. Cami içten 8,13 x 8,30 metre ölçüsünde, kare planlıdır. Sol taraftaki minarenin kürsü kısmı son cemaat yeri duvarına gömülüdür. Harim kısmı büyük bir kubbeyle örtülmüştür; tuğla minarenin şerefe altında mermerden kozalak motifleri vardır. Avlunun batısında çok sayıda eski, güzel taşlı mezar bulunur. Kale içinde, kaplıca kapısının hemen iç tarafında Alaaddin Bey'e ait bir mescidin daha olduğu bilinmekte, ancak yeri ve yıkılış tarihi bilinmemektedir. (Kaynak: Bursa İl Kültür ve Turizm Müdürlüğü)"
  },
  "serefuddin-camii": {
    period: "1479 (II. Murad / Fatih Dönemi)",
    founder: "Şerafeddin Paşa",
    info: "Okçular Çarşısı içinde yer aldığı için halk arasında 'Okçular Camii' olarak da bilinir. Kare planlı, tek kubbeli, sade bir mahalle camisidir."
  },
  "uftade-camii": {
    period: "16. yüzyılın ikinci yarısı (Kanuni / II. Selim Dönemi)",
    founder: "Üftade Hazretleri (Mehmed Muhyiddin Üftade)",
    info: "Aziz Mahmud Hüdayi'nin hocası olan meşhur mutasavvıf Üftade Hazretleri tarafından yaptırılmıştır. Cami çeşitli depremlerde hasar görmüş, torunu İbrahim ve sonraki dönemde Rıza Paşa tarafından onarılmıştır; karşısındaki türbede Üftade Hazretleri medfundur."
  },
  "karabas-i-veli": {
    period: "16. yüzyıl",
    founder: "Yakup Çelebi",
    info: "Aslen bir Mevlevi tekkesi olarak inşa edilmiş, adını burada uzun yıllar irşad faaliyeti yürüten Karabaş-i Veli Hazretleri'nden almıştır. Günümüzde ibadetin yanı sıra kültür merkezi olarak da kullanılmaktadır."
  },
  "iznik-ayasofya": {
    period: "1331 (Orhan Gazi Dönemi) — aslen Bizans bazilikası",
    founder: "Orhan Gazi (camiye dönüştüren)",
    info: "MS 7. yüzyılda inşa edilen basilikadan dönüştürülmüştür. 1331'de İznik'in fethiyle Orhan Gazi tarafından camiye çevrilmiştir. 2. Ekümenik Konsil'in (787) yapıldığı yer olarak Hristiyanlık tarihinde de büyük öneme sahiptir. Günümüzde ibadete açıktır."
  },
  "iznik-yesil": {
    period: "1378'de başlandı, 1387'de tamamlandı",
    founder: "Çandarlı Kara Halil Hayreddin Paşa (başlatan), Vezir-i Azam Ali Paşa (bitiren)",
    architect: "Hacı b. Musa",
    info: "İznik'in abidelerle dolu çevresinde, Lefke Kapısı civarında yer alan caminin en dikkat çekici eseridir. Evliya Çelebi de bu camiden Hayreddin Paşa Camii, yani Yeşil Camii adıyla şöhret bulmuş güzel bir cami olarak söz eder. Tek kubbeli ve revaklı sade bir yapı olmasına rağmen büyük bir etki bırakır; bu etkide malzeme, işçilik ve zengin süslemenin yanında, camiye adını veren yeşil bir sütun gibi yükselen zarif minarenin ve harime eklenen üçlü kemerli revakın getirdiği ferahlığın büyük payı vardır. Çandarlı Kara Halil Hayreddin Paşa tarafından 1378'de başlanan yapı, 1387'de Vezir-i Azam Ali Paşa tarafından tamamlanmıştır; kitabeye göre mimarı Hacı b. Musa'dır. Zengin mermer işçiliğine sahip son cemaat yerinin orta bölümü küçük zarif bir kubbeyle örtülüdür; sütun başlıkları, pencere alınlık ve çerçeveleri, kapı çevresi ve mihrap mermerin dantel gibi işlenmesiyle bezenmiştir. Uzunlamasına dikdörtgen ana mekânın giriş kısmında sütunlarla ayrılan, ortasında küçük bir kubbenin yükseldiği bir bölüm bulunur; asıl mekânı ise 10,5 metre çapında, kurşun kaplı büyük bir kubbe örter. Caminin en güzel unsuru minaresidir: yuvarlak gövdeli minarede alttaki bir sıra stalaktitin ardından beyaz mermer bir kuşak, sonrasında ise çini süsleme başlar — mermer üzerinde büyük altı köşeli yıldızların arasına küçük sekiz köşeliler ustalıkla yerleştirilerek ikinci bir kuşak oluşturulmuş, gövde sırlı tuğla zemin üzerine mavi-beyaz çinilerle zikzak desenlerle süslenmiş, üstüne dört sıra çiniyle stalaktitli bir şerefe yapılmıştır. Yunanlıların verdiği tahribat nedeniyle cami 1956-1968 yılları arasında restore edilmiştir."
  },
  "haci-ozbek-iznik": {
    period: "734 (1333-34), fetihten iki üç yıl sonra (Orhan Gazi Dönemi)",
    founder: "Hacı Özbek b. Mehmed",
    info: "Lefkekapısı'na giden ana caddede, Eşrefoğlu Rûmî Külliyesi hizasında yer alır. Üç satırlık kitabesiyle kitabesi mevcut en eski Osmanlı eseri kabul edilir; aslında bir Bizans kilisesi olduğu yönündeki iddia ise vaktiyle İznik Rumları'nca uydurulmuş asılsız bir söylentidir. Kare planlı, iç ölçüleri yaklaşık 7,50 m olan yapı, taş ile tuğla hatıllardan karma malzemeyle inşa edilmiş; kemerlerde küfeki taşı aralarına üç tuğla konulan örgü kullanılması, yapımında yerli Bizanslı duvarcı ustaların çalıştığını gösterir. İlk yapıldığında iki mermer sütuna dayanan, üç kemerle dışa açılan özgün bir son cemaat yeri bulunuyordu; ancak cadde genişletme gerekçesiyle 1930'lu yıllarda bu bölüm yıktırılmış, caminin başka bir cephesine uydurma bir son cemaat yeri eklenmiştir. Kiremit örtülü kubbe, eskiden dört pencereli iken sonradan çoğu kapatılan on iki köşeli bir kasnağa oturur; kareden kasnağa geçiş Türk baklavalarıyla sağlanmıştır. Kapıya göre ana eksende olmayan mihrap özgün biçimini kaybetmiş, kitabesi de yerinden sökülerek mihrabın sağındaki pencereye yerleştirilmiştir. Bitişiğindeki çeşmeden günümüze bir iz kalmamıştır. Kurtuluş Savaşı döneminde Rumların Türk eserlerine yönelik tahribatını atlatabilen yapı, sonraki dönemde özgün duvar tekniğine uygun şekilde restore edilmeyişi nedeniyle tarihi değerine uygun bir görünüme kavuşamamıştır. Kaynak: İslam Ansiklopedisi"
  },
  "yakup-celebi-iznik": {
    period: "791 (1389) yılından önce (I. Murad Dönemi)",
    founder: "Yâkub Çelebi (Sultan I. Murad'ın oğlu)",
    info: "Zâviyeli/tabhâneli plan grubundan olan yapı, bir sıra kesme taş - üç sıra tuğla almaşık duvar örgüsüne, kirpi saçaklı kubbe ve tonozlara sahiptir. Önünde beş birimli, aynalı tonozlu bir revak; içeride ortada kubbeli sofa mekânı, iki yanında ise ocaklı tabhâne odaları bulunur. Mihrap bölümü daha yüksek bir kubbeyle örtülü olup mihrap ve minber 1963 onarımında yenilenmiştir. Yapının önünde, Yâkub Çelebi için inşa edilmiş kare planlı açık bir türbe yer alır; Çelebi Bursa'da babasının türbesine defnedildiğinden bu yapı makam türbesi niteliğindedir. Cami 1919'a kadar kullanılmış, 1934'te müze deposuna çevrilmiş, 1963'te onarılarak yeniden ibadete açılmış ve yakın zamanda esaslı bir onarım daha görmüştür. Kaynak: İslam Ansiklopedisi"
  },
  "orhan-gazi-eski-cami-iznik": {
    period: "1325-1326 dolayı (Osmanlı fethinden en az beş yıl önce, Orhan Gazi Dönemi, salt. 1326-1362)",
    founder: "Orhan Gazi",
    info: "İznik ilçe merkezinde, Yenişehir Kapısı dışında ve Kırgızlar Türbesi karşısında bulunan yapı, günümüzde tümüyle harap durumda bir cami kalıntısıdır. Yıkıntı halindeyken 1963 yılında Prof. Oktay Aslanapa'nın yönettiği kazıyla gün yüzüne çıkarılmıştır. Beden duvarları moloz taş örgülü ve oldukça ince olup çatı ile örtülü olduğu hemen hemen kesinleşmiştir. Asıl ibadet mekânı, 18 santimetre boyunda altı köşeli çinilerle süslenmiştir; bu çiniler renk bakımından güzel olmakla birlikte işlenme yöntemleri ilkeldir. Mihrabın çevresinde ve kapı dolaylarında, ince ve gelişmiş bir işçiliğin izlerini taşıyan alçı süsleme kalıntıları bulunmaktadır. Camiden elde edilen buluntular ve bir bölümü kırık yazıt taşı İznik Müzesi'nde sergilenmektedir. Kaynak: İslam Ansiklopedisi"
  },
  "mahmut-celebi": {
    period: "1442-1443 (II. Murad Dönemi)",
    founder: "Vezir Mahmut Çelebi (II. Murad'ın kayınbiraderi, Çandarlı Halil Paşa'nın torunu)",
    info: "İznik Mahmut Çelebi Mahallesi'nde, Ayasofya'nın yaklaşık 100 m güneyinde yer alır. Erken Osmanlı devri tek kubbeli camiler grubundandır; kuzeyinde dikdörtgen planlı, üzeri tonoz örtülü ve ortası kubbeli bir son cemaat yeri bulunur. Giriş kapısı üzerinde 45x180 cm ölçüsünde üç satırlık yapım kitabesi vardır. Yeşil Cami'nin küçük bir örneği sayılan yapının üzeri duvarlara dayanan bir kubbeyle örtülü olup kareden kubbeye geçiş Türk üçgenli bir frizle sağlanmıştır. Minaresi yeşil sırlı tuğlalardan kuşaklarla çevrili olup 1967 depreminde zarar görmüştür. Mahmut Çelebi, caminin bahçesindeki demir parmaklıklı bir türbede medfundur. Karşısındaki İznik'in en eski çeşmesi 1970'li yıllarda yıkılmış, yanındaki aşhane-imaretten ise yalnızca duvar izleri günümüze ulaşabilmiştir. Kaynak: e-tarih.org"
  },
  "esrefzade": {
    period: "15. yüzyıl sonu, 1485'ten önce (Eşrefoğlu Rûmî'nin ölümünden sonra yapıldığı tahmin edilir)",
    founder: "Bânisi kesin olarak bilinmemektedir; Eşrefoğlu Rûmî (ö. 874/1469-70) adına inşa edilmiştir",
    info: "Eşrefzâde veya Eşref-i Rûmî Camii adlarıyla da anılır; Kādiriyye tarikatının Eşrefiyye kolunun kurucusu Eşrefoğlu Rûmî adına yaptırılmıştır. Yunan işgali sırasında tamamen yıkılmış, özgün yapıdan günümüze yalnızca minare ile hazire kısmı ulaşabilmiştir. İnşa tarihi kesin olmamakla birlikte, 1485'te Fatih Sultan Mehmed'in eşi Mükrime Hatun'un burada bir cüz okuma vakfı kurmuş olması yapının bu tarihten önce var olduğunu göstermektedir. Eski fotoğraflardan, uzunlamasına dikdörtgen planlı, düz çatılı caminin dört sütuna oturan beş kemerli derin bir son cemaat yerine sahip olduğu, mukarnaslı kavsarası dışında bütünüyle çini kaplı bir mihrabının bulunduğu anlaşılmaktadır. Camiden ayrı, türbe duvarına bitişik konumdaki tuğla gövdeli minare, IV. Murad döneminde yapılan onarımda zengin çini kuşaklarla süslenmiş; bu onarımda cami ve bitişiğindeki türbenin içi de çinilerle kaplanmıştır. Söz konusu çinilerden günümüze ulaşan parçalar İznik Müzesi'nde sergilenmekte olup İznik çiniciliğinin XVII. yüzyıldaki son dönem örnekleri arasında değerli kabul edilir; caminin, İznik'te üretilip yerinde kullanılan tek çinili eser olması ayrıca önemlidir. Yapı çevresinde vaktiyle Eşrefoğlu Rûmî'nin büyük türbesi, şadırvanlı bir avlu, küçük bir hamam ve geniş bir tekke kompleksinin izleri bulunuyordu; bu da yapının bir külliye olarak zamanla genişletildiğini düşündürmektedir. Tamamen harap olan cami, 1954 yılında cami derneği tarafından sade bir kâgir yapı olarak yeniden inşa edilip aynı yıl ibadete açılmış, günümüzde de kullanılmaktadır; Eşrefoğlu Rûmî'ye ve yakınlarına ait bazı kabirler minare ile caminin sağ tarafı arasındaki açık hazirede yer almaktadır. Kaynak: İslam Ansiklopedisi"
  },
  "tirilye-fatih-camii": {
    period: "610-850 arası (asıl kilise yapımı); 968/1560 (camiye çevrilişi, Kanuni Dönemi)",
    founder: "Aslen bir Bizans kilisesi; 16. yüzyılda Osmanlılar tarafından satın alınarak camiye çevrilmiştir",
    info: "Tirilye'deki Hagios Stephanos (ilk adıyla Aya Todori, ayrıca Kenolakkus Manastırı Kilisesi olarak da bilinen) kilisesi, Güney Marmara'daki en eski ve özgün Bizans kiliselerinden biridir ve 610-850 yılları arasına tarihlenen ender Bizans yapılarındandır. Girişinde Bizans stili sütun başlıkları, 19 metre yüksekliğinde çift kademeli kasnağa oturan gösterişli konik bir kubbesi bulunur. 16. yüzyılda satın alınarak camiye çevrilmiş olup bu duruma dair Arap harfli iki Osmanlıca belgeden biri, batı cephesindeki giriş kapısı hizasında saçak altındaki kitabede yer almaktadır; kapıda hicri 968 (miladi 1560) tarihi yazılıdır ve yapı Fatih Camii adıyla anılmaya başlanmıştır. Batısındaki avlu duvarına Hasan İbn Ali adında biri tarafından bir çeşme yaptırılmıştır. 1855 depreminde minaresi, kubbesi ve güney duvarı hasar görmüş ve onarılmıştır. Temmuz 1920'de bölgenin Yunan ordusunca işgali sırasında yerli Rumlar tarafından bir süre yeniden kiliseye çevrilmiş, ancak Eylül 1921'de bölgeye gelen Kral Konstantinos'un karşı çıkmasıyla yeniden cami olarak kullanılmaya devam etmiştir. Kaynak: Mudanya Belediyesi"
  },
  "halil-aga-eski": {
    period: "1500 (Mudanya'nın en eski yapılış tarihli camisi)",
    founder: "Kethüda Halil Ağa",
    info: "Mudanya ilçe merkezinde, sahil şeridinin arkasındaki cadde üzerinde, girişe oldukça yakın bir konumda bulunur. Kare planlı yapının iç kısmında bir kubbe bulunmakla birlikte, kubbenin üzeri piramit tarzında kapatıldığından dışarıdan görünmez; bu özelliğiyle 'gizli kubbe' olarak adlandırılır. Taştan inşa edilmiş tek minareli caminin ağaçtan beyaz oyma bir minberi, klasik eski Osmanlı süslemeleriyle bezenmiş bir mihrabı ve ağaç şerit süslemeli bir tavanı vardır. Mermer sütunlu bir yan girişi de bulunan caminin kapısı üzerinde Osmanlıca yazılar yer alır; iç kısımda bayanlara ayrılmış bir balkon bölümü mevcuttur. Arka bahçesindeki hazirede Havace Hacı Ali bin Muhammet Hazretleri, Muhammet Necmettin Molla, Mudanya Müdürü Hurşit Ağa Mahdumu Ahmet Bey, Remzi Bey, Tevfik Efendi, Emine Seher Hanım, Mudanya Naibi İbrahim Efendi ile Elhac Salih Efendi'nin kerimesi Safiye Hatun'un kabirleri bulunmaktadır. Kaynak: Seyyah Çelebi"
  },
  "yildirim-camii-inegol": {
    period: "1398-1402 (I. Bayezid/Yıldırım Dönemi); günümüzdeki bina II. Abdülhamid Dönemi'nde yenilendi",
    founder: "I. Bayezid (Yıldırım Bayezid)",
    info: "İnegöl ilçe merkezinde, Cuma Mahallesi Nuri Doğrul Caddesi'nde, İshak Paşa Medresesi'nin yanında yer alır. İnegöl'ün en eski camisi olup Yıldırım Cami, Beyazıd Han Cami, Yıldırım Han Cami ve Cuma Cami adlarıyla da anılır. Özgün yapı I. Bayezid tarafından 1398-1402 yıllarında yaptırılmış, zamanla tahrip olması üzerine II. Abdülhamid döneminde yerine bugünkü gotik yapı inşa edilmiştir; yalnızca minarenin kaidesi özgünlüğünü korumaktadır. Evliya Çelebi Seyahatnâme'sinde kubbesinin kiremit örtülü olduğunu belirtir. 10,50 x 10,50 m ölçülerinde kare planlı yapının altıgen kaide üzerinde yükselen silindirik tuğla minaresi tek şerefeli olup şerefe üstünde çini süslemeler bulunur; minare kaidesi bir sıra taş, üç sıra tuğla ile almaşık örülmüş, gövde ve petek tuğladandır. İç ve dış duvarlar sıvalı olduğundan özgün malzeme ve teknik tam olarak belli değildir. Kasnak, pandantif ve kubbe yüzeyi bitkisel motifli kalem işleriyle, harim duvarları ise bitkisel bezemeler ve yazılarla süslüdür. Kaynak: Kültür Portalı"
  },
  "inegol-ishakpasa": {
    period: "873 (1468-69) yılından önce tamamlanmış; vakfiyesi Safer 891/Şubat 1486, ek vakfiyesi Cemaziyelevvel 892/Mayıs 1487 tarihli",
    founder: "İshak Paşa (Fatih Sultan Mehmed devri vezîriazamı)",
    info: "İnegöl'de şehir merkezini oluşturan külliyenin bir parçasıdır; vakfiyede cami, medrese, türbe, imaret, han ve ahırlardan oluşan külliye tanımlanmakta olup imaret, han ve ahırlar günümüze ulaşmamıştır. İnşa kitabesi bulunmayan cami, zâviyeli/tabhâneli plan grubundandır ve yan mekânları eyvanlı olarak düzenlenmiştir. Taş-tuğla almaşık örgülü duvarlarında altta dikdörtgen, üstte sivri kemerli iki sıra pencere bulunur. Mihrap ekseninde yer alan iki birimden kuzeydeki daha geniş olup üçgen geçişli, mukarnaslı aydınlık fenerli bir kubbeyle; mihrap yönündeki, biraz daha küçük tutulan birim ise prizmatik üçgen geçişli bir kubbeyle örtülüdür. Kuzeye doğru uzanan dikdörtgen tabhâne mekânları güneyde kubbe, kuzeyde aynalı tonozla örtülüdür. Dikdörtgen nişli, köşeleri sütuncelerle yumuşatılmış mihrabın yedi sıralı zarif bir mukarnas yaşmağı vardır; niş çevresindeki çerçevenin sonradan yenilendiği anlaşılmaktadır. Kuzeydeki beş birimli son cemaat yeri altı kalın payeye oturan sivri kemerli açıklıklara sahip olup üstü kubbelerle örtülü, revak cephesi kirpi saçak altında geometrik tuğla düzenlemeleriyle bezelidir; kapı üzerindeki dört satırlık Arapça kitabe 1294 (1877) tarihli bir tamire işaret eder. Son cemaat yerinin batı köşesinden yapıya dışarıdan bitişik minareye geçilir; beş cepheli, taş-tuğla almaşık örgülü kaide ile pabuç kısmı özgün olup gövde, şerefe, petek ve külah sonradan yenilenmiştir. Mihrap ekseninde bulunan şadırvan tamamen yeniden yapılmış olup altıgen planlı hazne ve kiremit kaplı ahşap sundurmaya sahiptir. Kaynak: İslam Ansiklopedisi"
  },
  "kasim-efendi-camii-inegol": {
    period: "1521",
    founder: "Kasım Efendi",
    info: "İnegöl merkezinde, Kasım Efendi tarafından 1521 yılında yaptırılmış tarihi bir camidir."
  },
  "hancerli-fatma-sultan-camii-inegol": {
    period: "16. yüzyıl (Hançerli Fatma Sultan vakfiyesi 1533)",
    founder: "Hançerli Fatma Sultan",
    info: "İnegöl'ün Kurşunlu Mahallesi'nde yer alır; Kurşunlu Camii veya İmaret Camii adlarıyla da anılır. Hançerli Fatma Sultan'ın 1533 tarihli vakfiyesine dayanır."
  },
  "bali-bey-camii-yenisehir": {
    period: "İnşa kitabesi bulunmadığından kesin tarihi bilinmiyor (Fatih Sultan Mehmed Dönemi eserleri arasında değerlendirilir)",
    founder: "Balı Bey (İzmir fatihi Baş vezir Beyazıd Paşa'nın kardeşi şehit Hamza Bey'in oğlu)",
    info: "Fatih devri eserleri arasında değerlendirilen caminin inşa kitabesi bulunmadığından yapım tarihi kesin olarak bilinmemektedir. Güneyindeki hazirede iki mezar taşı yer alır: birincisinde Balı Bey'in adı belirtilmeyen bir oğlunun 910 H./1504-05 M. tarihinde vefat ettiği, ikincisinde ise yalnızca 956 H./1549-50 M. tarihi yazılıdır. Yenişehir'deki Şemaki evinin bahçesinde muhafaza edilen 1159 H./1746-47 M. tarihli üç satırlık mermer bir kitabe, bazı yayınlarda caminin tamir kitabesi olarak değerlendirilir; bu kitabede 'Halil Beğ bin merhum mirliva Kadr-i Alişan Mehmed Beğ'in' camiyi Beyt-i Mamur'a döndürdüğü belirtilmektedir. Cami; kare planlı kubbeli bir ibadet mekânı, doğu ve batısında eş boyutlu kare planlı ve kubbeli küçük yan kanatlar ile kuzeyinde doğu-batı doğrultusunda dikdörtgen planlı, düz tavanlı bir son cemaat yerinden oluşur. Kaynak: bursa.com"
  },
  "kumluk-camii-yenisehir": {
    period: "14. yüzyıl (zaman içinde birçok kez onarım görmüştür)",
    founder: "Osman Gazi",
    info: "Yenişehir Murat Paşa Mahallesi'nde bulunan Kumluk Camii, 14. yüzyılda Osman Gazi tarafından yaptırılmıştır. Osman Gazi'nin burayı merkez edinerek Yenişehir adını verdiği, şehri kurarken evler, mabetler ve çeşitli yapılar inşa ettirdiği anlatılır; kuruluş dönemi kaynakları bir saraydan söz etmese de Neşrî'nin 'taht kurdu' ifadesi, Bursa başkent oluncaya kadar burasının kullanıldığını göstermektedir. Caminin en önemli özelliği, Osmanlı Devleti'nin ilk hutbesinin burada okunmuş olmasıdır; bu yönüyle Osmanlı tarihinde ayrı bir yere sahiptir. Zaman içinde birçok onarımdan geçen yapı, günümüze kadar ulaşmıştır. Kaynak: Bursa'da Zaman"
  },
  "voyvoda-cinarli-camii-yenisehir": {
    period: "1415 (kesin yapım tarihi bilinmemekle birlikte, bazı kaynaklarda 15. veya 17. yüzyıla da tarihlenir); kubbesi 1830'da onarılmıştır",
    founder: "Sungur Paşa (Amasyalı Sadettin Bey'in oğlu)",
    info: "Yenişehir'in en eski camilerinden biri kabul edilen yapı, Bali Bey Camii ve Külliyesi'nin yakınında, onun kuzeyinde yer alır. Kesin yapım tarihi bilinmemekle birlikte 15. veya 17. yüzyıla ait olabileceği ileri sürülmektedir. Fener kubbeli camiler türünden olan yapı, bahçesindeki asırlık çınar ağacından dolayı halk arasında 'Çınarlı Camii' olarak da anılır. Mehmet Göktekin'in anılarına göre caminin banisi, 1295 yılında Osman Gazi'ye Yenişehir ovasında katılan Amasyalı Sadettin Bey'in oğlu Sungur Paşa'dır. 1305 doğumlu olan Sungur Paşa, Şehzade Süleyman Paşa ile birlikte Gelibolu'da pek çok yararlılık göstermiş, uzun süre I. Murad'ın sancaktarlığını yapmıştır. Sungur Paşa, 1415 yılında bu cami ile bitişiğindeki medreseyi yaptırmıştır; medrese 1922 yılında yıkılmıştır. 19. yüzyıl başlarında çökme tehlikesi gösteren kubbe, 1830 yılında dönemin Yenişehir Voyvodası (yöneticisi/valisi) Ali Bey tarafından aslına uygun şekilde onarılmıştır. Kaynak: bursa.com"
  },
  "sinan-pasa-camii-kulliyesi-yenisehir": {
    period: "Kesin olarak bilinmemekle birlikte, elde edilen belgelere göre yaklaşık 1572-1573",
    founder: "Sinan Paşa",
    info: "Halk arasında 'Kurşunlu Han' olarak da anılan Sinan Paşa Külliyesi; cami, medrese, imaret-aşhane, arasta ve girişlerden oluşmaktadır. Günümüzde Sinan Paşa Yurdu olarak hizmet veren külliyenin bütününden yalnızca az bir bölüm ayakta kalabilmiş olup, halen kullanılabilir durumdaki kısımların başında medrese, imaret ve cami gelmektedir. Külliyenin banisi Sinan Paşa, 1520 yılında Arnavutluk'ta Topoyani'de doğmuş, küçük yaştan itibaren yetiştirilen devşirmelerden olup Kanuni Sultan Süleyman'ın aşçılığını yapmıştır. Sancak beyliği görevinde bulunmuş; ikiye ayrılan Yemen'i birleştirip yeniden Osmanlı yönetimine kazandırmasındaki başarısından dolayı kendisine 'Yemen Fatihi', ayrıca 'Tunus Fatihi' unvanları verilmiştir. Dördüncü vezirliğe kadar yükselmiş, İran seferinde komutanlık yapmış ve ardından sadrazam olmuştur; III. Murad ve III. Mehmed dönemlerinde toplam dört kez sadrazamlık görevine getirilmiş, 3 Nisan 1596'da vefat etmiştir. Külliyenin kesin yapım tarihi hiçbir belgede yer almamakla birlikte, Topkapı'daki Sinan Paşa arşivinde bulunan bir belgede Yenişehir'den ve bu külliyeden söz edilmektedir; buna göre külliyenin kurulduğu arazi Sultan Orhan tarafından Yenişehir halkına mera olarak sınırları belirlenmiş bir mülk şeklinde verilmiş, daha sonra kasaba halkı bu arazi üzerine cami, medrese, imaret ve kervansaraydan oluşan külliyenin yapılabilmesi için toprakların Sinan Paşa'ya devredilmesine karar vermiştir. Bu belgeler ışığında külliyenin yapımının yaklaşık 1572-1573 yıllarına rastladığı değerlendirilmektedir. Kaynak: Yenişehir Belediyesi"
  },
  "yenisehir-ulu": {
    period: "1324-1362 (Orhan Gazi Dönemi); en son 1923 yılında tadilat görmüştür",
    founder: "Orhan Gazi",
    info: "Yenişehir ilçesi Ulucami Mahallesi Ulucami Sokak'ta bulunan cami, kayıtlara göre Orhan Gazi (1324-1362) tarafından yaptırılmıştır. Büyük bir minareye sahip olduğu için halk arasında 'Ulu Cami' adıyla anılır. Birçok defa tadilat görmesine rağmen özgün yapısı korunmuş, en son 1923 yılında onarım geçirmiştir. Taş kullanılarak ve kubbesiz olarak inşa edilen caminin minaresi, çokgen tuğla kaideli ve tek şerefelidir; günümüze bozulmadan ulaşan minarenin on iki kenarlı kaidesi taş ve tuğla işçiliğiyle örülmüştür. Kaideden silindirik tuğla gövdeye geçiş üçgenlerle sağlanmış, gövdeye geçişte ve şerefe altında birer bilezik yer almaktadır. Minarenin dikkat çeken özellikleri, gövdesindeki oran uyumu ile şerefe altındaki yedi sıra stalaktitin düzenli dizilimidir. Yarhisar'daki Orhan Gazi Camii'nin minaresiyle benzerlikler taşımakla birlikte, Yenişehir Ulu Camii minaresinin şerefesi daha zengin görünümlü olup gölge-ışık etkilerini daha belirgin kılan bir yapıya sahiptir. Kaynak: Bursa Ulu Cami"
  },
  "yarhisar-orhan-gazi-camii": {
    period: "14. yüzyıl (Orhan Gazi Dönemi, salt. 1324-1362); yapı büyük ölçüde yenilenmiştir",
    founder: "Orhan Gazi (Sultan Orhan Bey)",
    info: "Yenişehir'e bağlı Yarhisar Köyü'nde bulunan bu camiden pek çok Osmanlı kroniğinde söz edilir. Orhan Bey, baba yurdu saydığı bu köye bir cami, yanı başına bir çeşme ve bir de hamam yaptırmıştır; bu üç eserden cami ile çeşme günümüzde de kullanılmakta, hamamdan ise yalnızca yıkıntı kalmıştır. Orhan Gazi tarafından yaptırılan cami, aynı zamanda 'Nilüfer Hatun Camii' olarak da anılmaktadır. Dikdörtgen planlı caminin üzeri düz tavanla örtülü olup, iki sıra tuğla ve iki sıra taşla örülen duvarların içinde bazı taş süslemelere rastlanır; yapı büyük ölçüde yenilenmiştir. Köyde ayrıca, Orhan Bey tarafından yaptırıldığı tahmin edilen ve çeşitli bezemelere sahip tarihi bir hamam da bulunmaktadır; bugün oldukça bakımsız durumda olan bu yapının koruma altına alınması gerekmektedir. (Ayverdi I. (1966), s. 201; Vakıflar (1986) IV. s. 627) Kaynak: bursa.com"
  },
  "hasan-bey-camii-mudanya": {
    period: "Hicri 1063 / Miladi 1652-1653 (kapıdaki Türkçe kitabede kuruluş 1644, onarım 1975 olarak da geçmektedir)",
    founder: "Mirliva Hasan Bey (Mısır Mirlivası Hasan Bey)",
    info: "Mudanya'da Hasanbey Mahallesi'nde bulunan, minaresiyle kolayca fark edilen bir camidir. Kitabesine göre Mirliva Hasan Bey tarafından yaptırılmıştır. Kuzey-güney doğrultusunda dikdörtgen planlı yapının duvarları moloz taş ve ahşap hatıllı olup ahşap çatısı kiremitle örtülüdür; kuzeybatısında tek şerefeli bir minare, minarenin kuzeyinde ise kitabeli bir çeşme yer alır. Giriş kapısındaki taş kitabede inşa tarihi Hicri 1063 (Miladi 1652-1653) olarak belirtilirken, kapı üzerindeki başka bir Türkçe yazıda kuruluş 1644, onarım tarihi ise 1975 olarak geçmektedir. Hasan Bey Türbesi'ndeki iki kitabeli lahitten birinde 'Mısır Mirlivası Hasan Bey' ibaresi bulunur; çeşmedeki iki satırlık taş kitabe de yine caminin Hasan Bey tarafından yaptırıldığını doğrulamaktadır. Kaynak: Bursa Büyükşehir Belediyesi"
  },
  "omer-bey-camii-mudanya": {
    period: "1715",
    founder: "Ömer Bey",
    info: "Mudanya ilçesi Ömerbey Mahallesi Halitpaşa Caddesi No:72B'de, cadde üzerinde bulunur; adını yaptıran Ömer Bey'den alır. 200 m² büyüklüğündeki kare planlı cami birçok kez onarım görmüş olmakla birlikte, yapıldığı tarihten kalma minaresi özgünlüğünü korumaktadır. İçinde ahşap bir minber ve klasik süslemeli bir mihrap ile kadınların namaz kılması için bir balkon bölümü bulunur. 2018 yılında aslına sadık kalınarak restore edilmiştir. Kaynak: bursa.com.tr"
  },
  "tekke-i-cedidi-camii": {
    period: "1677 (17. yüzyıl); 1975'te betonarme olarak yeniden inşa edildi",
    founder: "Hacı Mehmet Ağa (tahmini)",
    info: "Cami avlusunun güney duvarındaki kitabeye göre 1677 yılında inşa edilmiştir. 1975'te özgün yapı yıkılarak yerine bugünkü betonarme cami yapılmıştır. Kare planlı yapının sekizgen kasnağa oturan büyük bir kubbesi vardır; kaidesine kadar yıkılmış olan minaresi de yeniden inşa edilmiştir. Caminin, haziresinde medfun bulunan Hacı Mehmet Ağa adlı bir zat tarafından yaptırıldığı tahmin edilmektedir. 17. yüzyıl eseri olan cami, geçirdiği onarımlarla özgün niteliğini büyük ölçüde yitirmiş olup günümüzde basık kubbeli ve tek şerefeli bir görünümdedir. Kaynak: bursa.com.tr"
  },
  "tekke-i-atik": {
    period: "1453 (kapı üzerindeki levhaya göre)",
    founder: "Kesin olarak bilinmemekle birlikte Hacı Ali Zağili Mağrabi tarafından yaptırıldığı düşünülmektedir",
    info: "Giriş kapısının üzerinde 1453 tarihi yazılı bir levha bulunmaktadır. Kuzey-güney doğrultusunda dikdörtgen planlı cami, asıl ibadet mekânı ve son cemaat yerinden oluşur; üzeri ahşap kırma çatı ve kiremit ile örtülüdür. Mihrap, mavi-beyaz kare biçimli çini panolarla kaplanmıştır. Kaynak: bursa.com.tr"
  },
  "cumalikizik-camii": {
    period: "Erken Osmanlı (Cumalıkızık vakıf köyü)",
    founder: "Orhan Gazi vakıfları",
    info: "UNESCO Dünya Mirası Listesi'ndeki Cumalıkızık köyünün tarihi camisidir. Osmanlı'nın kuruluş dönemi vakıf köyü dokusunun canlı örneğidir."
  },
  "umurbey-carsi-camii": {
    period: "1897 – 1899 (yapım), 1910 – 1912 (kapsamlı onarım)",
    founder: "Umurbey halkı (banisi hakkında ayrıntılı kayıt yok)",
    info: "Bursa'nın Gemlik ilçesine bağlı, III. Cumhurbaşkanı Celal Bayar'ın memleketi olan Umurbey Beldesi'nin çarşı merkezinde yer alır. 1910 yılındaki tamire ait kitabe cami girişinde bulunmaktadır. Kareye yakın planlı yapı, dört sütunun taşıdığı merkezi bir kubbe ve çevresindeki 10 pencere ile dikkat çeker; şadırvan ve cami içi kalem işçilikleri özenlidir. Minaresi bir dönem yıkılmış olup 2013 itibarıyla minaresiz hizmet vermekteydi. Bursa Büyükşehir Belediyesi'nin 29.03.2016'da tamamladığı restorasyon çalışmasıyla minare yenilenmiş, Gemlik Belediyesi'nin meydan projesiyle bütünleşik bir çevre düzenlemesi de gerçekleştirilmiştir."
  },
  "koza-hani-mescidi": {
    period: "15. yüzyıl sonu (II. Bayezid Dönemi)",
    founder: "II. Bayezid",
    info: "Osmangazi ilçesi Şehreküstü Mahallesi'nde, Uzun Çarşı Caddesi üzerindeki Koza Hanı'nın avlusunda, şadırvanın üzerinde yer alır. Bursa'daki han mescitlerinin en güzel örneklerinden biri kabul edilir ve tümüyle kesme taştan inşa edilmiştir. Mescide yüksek bir merdivenle çıkılmaktadır; bu merdiven eskiden demirken, yapılan onarımda özgün biçimine uygun olarak kagir hale getirilmiştir. Günümüzde sağlam durumda olup ibadete açıktır."
  },
  "meydancik-camii": {
    period: "Fatih Sultan Mehmed Dönemi, 1497'den önce",
    founder: "Kazzazoğlu Sole Mehmet Paşa",
    info: "Yıldırım ilçesi Meydancık Mahallesi Alancık Sokak'ta bulunur; mülkiyeti Vakıflar Genel Müdürlüğü'ne aittir. Sole Mehmet Paşa'nın Bursa'da yaptırdığı üç mescitten biridir. 7,00 x 7,00 metre iç ölçülerinde kare planlı asıl ibadet alanı ile 3,65 metre derinliğinde bir son cemaat yerinden oluşur; girişi sivri kemerlidir ve duvarları üç sıra tuğla, bir sıra kesme taş ile örülmüştür. Asıl ibadet alanının üzeri büyük bir kubbe, son cemaat yerinin üzeri ise tonozla örtülüdür. Birçok kez onarım gören yapının batısındaki tuğla gövdeli, tek şerefeli minaresi 1913 onarımında yenilenmiş olup girişte buna ait tamirat kitabesi bulunur. Kubbe kasnağında üç alt sırada dört sivri kemerli pencere yer alır; güneydeki iki pencere sonradan kapatılarak dolaba dönüştürülmüştür. Dış köşeliklerinde silindirik gövdeli sütunceleri bulunan mihrap sade ve dikdörtgen çerçevelidir. Kaynak: Yıldırım Belediyesi"
  },
  "haci-ivaz-pasa-camii": {
    period: "II. Murad Dönemi (15. yüzyıl); 1970'te yeniden inşa",
    founder: "Hacı İvaz Paşa",
    info: "Yeşil Külliyesi'nin mimarı Hacı İvaz Paşa tarafından II. Murad devrinde yaptırılmıştır; Pirinç Hanı karşısında, Tavuk Pazarı semtinde, medrese ile aynı avluyu paylaşan İvaz Paşa Külliyesi'nin bir parçasıdır. Bir vakfiyede İmadiye Mescidi olarak anılmış, zamanla İvaz Paşa Mescidi, Kazzaziye/Kazazhane Mescidi ya da Tavuk Pazarı Mescidi gibi adlarla da bilinmiştir. 1642 yılına kadar mescit olarak hizmet vermiş, Seyyid Mehmed Efendi'nin vakfettiği bir minberle camiye dönüştürülmüştür. 1958'deki çarşı yangınında tamamen harap olmuş, 1970 yılında Bursa Eski Eserleri Sevenler Kurumu'nun girişimiyle yeniden inşa edilmiştir. Kuzey-güney doğrultusunda dikdörtgen planlı olup üzeri iki kubbeyle örtülüdür; beden duvarları kesme taş ve tuğla örgülüdür, tek minarelidir. Kaynak: bursa.com"
  },
  "hatice-isfendiyar-sultan-camii": {
    period: "1500 (Fatih Sultan Mehmed Dönemi)",
    founder: "Hatice Sultan (İsfendiyaroğlu İbrahim Bey'in kızı)",
    info: "Gökdere'de Kamberler Mahallesi'nde bulunan bu cami, uzun süre adı bilinmeden ayakta kalmış, belediyenin Kamberler'deki evleri istimlak ederek meydan düzenlemesi yapmasıyla gün yüzüne çıkmıştır. Kitabesine göre 1500 yılında, II. (Çelebi) Mehmed'in torunu Hatice Sultan tarafından yaptırılmıştır. Hatice Sultan'ın babası İsfendiyaroğlu İbrahim Bey, annesi Çelebi Mehmed'in kızı Selçuk Hatun'dur; eşi ise Fatih Sultan Mehmed dönemi sadrazamı Mahmud Paşa'dır. Kubbeyle örtülü, kare planlı caminin girişinde bir son cemaat yeri bulunur; duvarları tuğla ve taşla örülüdür. Osmangazi Belediyesi'nin yürüttüğü 'Kamberler Tarih ve Kültür Parkı Projesi' (2008) kapsamında çevresindeki eski yapılardan ayıklanarak bugünkü görünümüne kavuşmuştur. Hatice Sultan Camii veya Hatice İsfendiyar Camii olarak da anılır; namaz vakitleri dışında kapalıdır. Kaynak: Seyyah Çelebi"
  },
  "gazi-timurtas-pasa-camii": {
    period: "1390 (bazı kaynaklara göre Yıldırım Bayezid Dönemi)",
    founder: "Ali Bey (Timurtaş Paşa'nın oğlu) — bazı kaynaklara göre Kara Timurtaş Paşa",
    info: "Osmangazi'nin Demirtaş Mahallesi'ndeki cami, Timurtaş Paşa'nın oğlu Ali Bey tarafından 1390 yılında yaptırılmıştır; bazı kaynaklarda ise Yıldırım Bayezid'in emiri Kara Timurtaş Paşa'ya atfedilir ve Demirtaş Paşa Camii olarak da anılır. 'Ters T planlı', 'zaviyeli', 'yan mekânlı' olarak da adlandırılan, tuğla ve kesme taştan yapılmış 'Bursa tipi cami' grubundandır; ortasında aydınlık fenerli merkezi bir kubbe, yanlarında tonoz örtülü eyvanlar bulunur. Caminin en dikkat çekici özelliği, saat kulesini andıran ilginç minaresidir: cami binasından ayrı olarak sokağın karşısında, birbirine kemerlerle bağlı altı tuğla ayak üzerine oturtulmuş, Osmanlı mimarisinde benzeri bulunmayan bu minarenin kaidesinin ortasında bir şadırvan yer alır. Minare, Bursa Eski Eserleri Sevenler Derneği tarafından 1966 yılında onarılmıştır. Kaynak: Mustafa Canbaz"
  },
  "azeb-bey-camii": {
    period: "1456 (II. Murad Dönemi)",
    founder: "Azeb Bey b. Abdullah",
    info: "Muradiye semtinde Kullukçu Sokağı'nda bulunur. Kapısı üzerindeki Arapça kitabesine göre, II. Murad'ın komutanlarından Ümera'dan Azeb Bey b. Abdullah tarafından 1456 yılında yaptırılmıştır. Bursa'da bir hayli örneği bulunan, son cemaat yeri payeli, kare planlı ve tek kubbeli cami tipindendir; duvarları iki sıra tuğla ve moloz taşla örülmüştür. Son cemaat yeri iki kemerle ayrılmış, üstleri beşik tonozlu üç bölümden oluşur; kare mekândan 5,80 metre çapındaki kubbeye geçiş Türk üçgenleriyle sağlanmıştır. Batıdaki minarenin kaidesi tuğla ve taştan, silindirik gövdesi tuğladandır; şerefe altında dört sıra kirpi saçak dizisi bulunur ve sivri külahı kurşun kaplıdır. Sağ tarafındaki Azeb Bey Türbesi de kare planlı ve kubbeyle örtülüdür; mekân 19 pencereyle aydınlatılmıştır. Yapı en son 1947 yılında tamir edilmiş olup sağlam ve ibadete açıktır. Kaynak: Kültür Portalı"
  },
  "ahmed-dai-camii": {
    period: "1471 (II. Mehmed Dönemi)",
    founder: "Edincikli Hızıroğlu Yahşi Bey",
    info: "Cumhuriyet Caddesi ile Ahmed Dai Sokağı'nın kesiştiği yerdedir; bir mahalle camii tipindedir. Camiye adını veren Ahmed Dai'nin yapıyla doğrudan bir ilişkisi yoktur, sadece Ahmed Dai Mahallesi'nde bulunduğu için bu adı almıştır — Ahmed Dai, Gazi Süleyman Paşa'nın hizmetinde bulunmuş ve I. Murad döneminde vefat etmiş ünlü bir şairdir. Revakı üstündeki yüksek kalkanda üç çökertme tuğla şekilleriyle süslenmiş, kalkan duvarlarının üç tarafında Bursa'ya özgü kabartma bir kuşak dolaşmaktadır. 7,57 x 7,57 metre iç ölçülerinde, kare planlı ve tek kubbeli olan cami, girişinde 4,47 metre boyutlarında bir son cemaat yerine sahiptir; içi on pencereyle aydınlanır. Tespihlik ve mihrabı Yeşil Türbe çinileriyle kaplıdır. Minaresi 24 dilimli, tuğla işlemeli bir yapıdır. Cami 1953 yılında Bursa Eski Eserleri Sevenler Kurumu tarafından onarılmış olup halen sağlam ve ibadete açıktır. Kaynak: bursa.com"
  },
  "kefensuzen-camii": {
    period: "Fatih Sultan Mehmed Dönemi (1451)",
    founder: "Hoca Mehmet (\"Kefen Süzen\" lakabıyla anılır)",
    info: "Dayakadın Mahallesi, Süzenler Caddesi'nde bulunan cami, Fatih döneminde \"Kefen Süzen\" adıyla anılan Hoca Mehmet tarafından yaptırılmıştır. 7,50 x 8,10 metre iç ölçülerindeki caminin bütün duvarları moloz taşıyla örülmüş olup tek kubbelidir; son cemaat yerinin üstü ahşap sundurmalı ve kiremit kaplıdır. Sekizgen ve sağır bir kasnak üzerine oturtulan kubbe kiremitle örtülmüştür. Mihrabı sade olup duvar içine gömülmüştür. Doğu, batı ve kuzey duvarlarındaki ikişer alt pencere demir parmaklıklı ve sivri kemerlidir; güney duvarındaki alt pencereler örülerek dolap haline getirilmiştir. Üst pencereler, kuzey duvarı dışında ikişer adet sivri kemerli olup kubbe kasnağında pencere yoktur. 1940'lı yıllarda bir şahsa satılan cami, 1950 yılına kadar depo ve ev olarak kullanılmış; bu tarihten sonra Recep Kıryaoğlu adındaki bir şahıs tarafından satın alınarak 1953 yılında yeniden tamir ettirilip ibadete açılmıştır. Minaresi, cami 1940'larda şahsa satılınca yıkılmış, 1950'den sonra yeniden yapılmıştır. Kaynak: Kültür Portalı"
  },
  "mizanoglu-camii": {
    period: "1300",
    founder: "Bilinmiyor",
    info: "Osmangazi ilçesindeki tarihi mescitlerden biridir."
  },
  "zafranlik-camii": {
    period: "15. yüzyılın ikinci yarısı (Fatih Sultan Mehmed Dönemi, 1451-1481)",
    founder: "Bilinmiyor",
    info: "Dikdörtgen planlı, küçük boyutlu bir yapıdır. Caminin güney bitişiğinde Bekir Dede Türbesi bulunmaktadır."
  },
  "suluki-camii": {
    period: "Kanuni Sultan Süleyman Dönemi (1520-1566)",
    founder: "Bilinmiyor",
    info: "Osmangazi ilçesindeki tarihi camilerden biridir."
  },
  "mustafakemalpasa-yesil-camii": {
    period: "Bilinmiyor (yakın zamanda tamirat geçirdiği düşünülüyor)",
    founder: "Bilinmiyor",
    info: "Mustafakemalpaşa ilçesi Çırpan Mahallesi, Yeşil Cami Sokak No:1'de yer alır; ilçenin ilgi çeken camilerinden biridir. Harim üzeri, dört yan kubbenin ortasında onlardan biraz daha büyük bir ana kubbe ile örtülüdür. Dört küçük kubbeyle örtülü son cemaat yerine, oldukça geniş bahçe avlusundaki bir kapıdan girilir; bu kapı küçük bir camiyi andıran görünümü ve caminin iki minaresiyle birlikte hoş bir manzara oluşturur. Dikdörtgen planlı yapı, harime son cemaat yerindeki kapıdan girilecek şekilde düzenlenmiştir. Mihrap seramikle kaplanmış, mihrap nişinin üstü ve yan duvarlar ayetlerle süslenmiştir. Minber ve kürsü ahşap malzemeden, sade bir görünümle yapılmıştır. Kaynak: Erol Şaşmaz"
  },
  "mustafakemalpasa-yenickoy-camii": {
    period: "1901 (kitabesine göre)",
    founder: "Hızır Paşa",
    info: "Mustafakemalpaşa'nın Devecikonağı bucağına bağlı Yenice Köyü'ndedir. 51x62 cm ölçülerindeki mermer kitabesine göre Hızır Paşa tarafından 1901 yılında yaptırılmıştır. Kuzey-güney doğrultusunda dikdörtgen planlı olan camiye sonradan bir son cemaat yeri eklenmiştir; ahşap çatıyla örtülüdür. Güney duvarının ortasında yarım yuvarlak mihrap, kuzeyinde ise giriş kapısı bulunur. Güney duvarında altlı üstlü ikişer, doğu ve batı duvarlarında ikişer alt üçer üst, kuzey duvarında iki alt pencereyle aydınlatılır; alttaki pencereler yuvarlak kemerli, üsttekiler dikdörtgendir. Giriş kısmında antik malzemelerle yapılmış bir çeşmesi vardır. Bizans dönemi kalıntıları bulunan köyün adına 17. yüzyıl kadı sicillerinde rastlanmaktadır; Lala Şahin Paşa'nın vakıf köyü olup, Bagenoğulları ailesi tarafından kurulduğu rivayet edilmektedir."
  },
  "mustafakemalpasa-muftu-camii": {
    period: "1894-1895",
    founder: "Şeyh Müftü adına, Naib Şefik Bey'in katkılarıyla",
    info: "Şeyhmüftü Mahallesi Balıkesir Caddesi üzerinde, Mustafakemalpaşa'dadır. Harimin kuzeyindeki giriş kapısı üzerinde yer alan üç satırlık mermer kitabede, 'Şeyh Müfti Cami Şerifi'nin 1894-1895 yılında Naib Şefik Bey'in yardımlarıyla yapıldığı yazılıdır. Kuzey-güney doğrultusunda dikdörtgen planlı olup güneyde harim, kuzeyde sonradan eklenen son cemaat yeri, batı cephenin kuzey köşesinde minare bulunur. Harimde ortada dört sütun üzerinde yükselen bir kubbe, yanlarda ise düz tavan yer alır. Beden duvarlarından alçak olan son cemaat yeri düz çatıyla örtülüdür; ahşap desteklere oturan beş yuvarlak kemer açıklığı camekanlı olup orta bölüm kapı olarak düzenlenmiştir. Doğu cephede güneyde harim, kuzeyde son cemaat yeri yer alır; harim cephesindeki alt pencereler sivri kemerli ve demir parmaklıklı, üst pencereler yuvarlak kemerlidir. Batı cephenin güneyinde harim, kuzeyinde türbe ve minare bulunur. Cepheler moloz taş ve tuğlayla düzensiz bir teknikte örülmüş, köşelerde kesme taş kullanılmıştır; son cemaat yeri ve kubbe kasnağı ahşaptır. Kaynak: Kültür Portalı"
  },
  "mustafakemalpasa-melikkoyu-camii": {
    period: "Bilinmiyor (eski caminin üzerine yeniden inşa edilmiş)",
    founder: "Bilinmiyor",
    info: "Mustafakemalpaşa ilçesine bağlı, Bursa il merkezine yaklaşık 98 km mesafedeki Melik Köyü'ndedir. Mevcut cami, eski caminin üzerine daha büyük ölçekte yeniden yapılmıştır; eski minare orijinal haliyle korunmuş, yeni yapılan minareyle birlikte iki minareli bir cami ortaya çıkmıştır. Kareye yakın planlı olan yapının kurşun kaplı bir kubbesi vardır. Batı yönündeki eski minarenin üzerinde yapım kitabesi bulunur ve şerefe etrafındaki işlemeleriyle dikkat çeker. Yeni minare daha yüksek olup iki şerefelidir. Üç kubbeden oluşan son cemaat yerine avludan iki kapıyla giriş yapılmaktadır. Kaynak: Erol Şaşmaz"
  },
  "mustafakemalpasa-lala-sahin-pasa-kulliyesi": {
    period: "1348 öncesi (vakfiye tarihi: Haziran 1348)",
    founder: "Rumeli Beylerbeyi Lala Şahin Paşa",
    info: "Mustafakemalpaşa'nın eski adı Kirmasti olan merkezinde, Kirmasti çayı kıyısındaki bir parkın içinde yer alır; cami, medrese ve türbeden oluşan bir külliyedir. Lala Şahin Paşa'nın 1348 tarihli vakfiyesine göre caminin karşısında bir zaviye de bulunuyordu; paşa ayrıca Kirmasti'de hamam, dükkânlar ve çay üzerinde ahşap bir köprü yaptırmıştı. Bu eserler, 1339-40 civarında Bizanslılara karşı kazanılan Yalakabad (Yalova) Muharebesi'nin ganimetleriyle inşa ettirilmiştir. Külliyeden günümüze yalnızca türbe sağlam ulaşmış; cami tamamen yok olmuş, minarenin şerefeyle birlikte yıkılan gövdesinden yalnızca alt kısmı ve medrese duvarlarının bazı parçaları kalmıştır. Minarenin kare kaidesi kesme taş ve tuğladan, gövdesi yalnızca tuğladandır; kaidedeki mermer kitabeye göre minare 1823'te yenilenmiştir. Medreseden yalnızca bazı duvar parçaları günümüze ulaşmış, üzerine Cumhuriyet'in ilk yıllarında bir okul inşa edilmiştir. Kitabesi olmayan ancak vakfiyesinden 1348'den önce yapıldığı anlaşılan türbe, 1787'de onarılmış, 1948'de Maarif Vekâleti tarafından restore edilmiş olup halen belediye tarafından depo olarak kullanılmaktadır. Kare planlı gövdesi sivri külahlı bir kubbeyle örtülü olan türbe, muhtemelen eski bir Bizans yapısının duvar ve mimari parçalarından yararlanılarak inşa edilmiştir; özellikle güneydoğu cephesinde Bizans işçiliğine ait kademeli kemerler, tuğla rozet ve kirpi saçak süslemeleri dikkat çeker, sekiz dilimli kubbesi ise Selçuklu üslubunu yansıtır. Zaviyenin hiçbir izi kalmamış, muhtemelen 1861-62'den sonra ortadan kalkmıştır; hamam ve ahşap köprünün de günümüze ulaşan izi yoktur. Kaynak: İslam Ansiklopedisi"
  },
  "mustafakemalpasa-kestelek-koyu-camii": {
    period: "Eski cami: Eylül 1886 (Muharrem 1304 H.); köyün yerleşim geçmişi çok daha eskiye uzanır",
    founder: "Eski (Hacı Hasan) caminin banisi net değil; vakıf kayıtlarında adı geçmektedir",
    info: "Kestelek, Mustafakemalpaşa ilçesinin Çaltılıbük bucağına bağlı, ilçe merkezine yaklaşık 23 km uzaklıkta, Mustafakemalpaşa çayının hemen batısında bir köydür. Bilge Umar'a göre köyün adı 'kestel' (hisar) kökünden 'hisarcık' anlamında türetilmiştir; yakınındaki kale kalıntısı bu görüşü destekler. 1830'larda bölgeyi gezen seyyah Charles Texier, Kirmasti'den 24 km sonra ulaşılan 40-50 haneli küçük bir köy olarak Kestelek'ten ve hemen ardından görülen tuğla-taş duvarlı bir Bizans şatosundan söz eder; bu kalenin Uluabat (Lopadion) Kalesi ile yaşıt olduğunu belirtir. Tepe üzerinde, çevredeki yolları gözetleyebilecek konumdaki kalenin önemli bir bölümü halen ayaktadır; köylülere göre Osmanlı devrindeki Sincan kazasının merkezi bu kaledir. Köyün yanındaki maden ocağında da antik yerleşim kalıntıları çıkmıştır; buranın Bizans dönemi Kastallos kalesi olduğu düşünülmektedir. Köydeki modern caminin yerinde, vakıf kayıtlarına Hacı Hasan Camisi adıyla geçen eski bir cami bulunuyordu; avlusundaki 33x66 cm ölçülerindeki üç satırlık yazıtta bu caminin Eylül 1886'da (Muharrem 1304 H.) yaptırıldığı belirtilir. Kirmasti'nin ilçe merkezi olmasına kadar Sincan Bucağı'nın merkezi olan köy, 1907 tarihli Hüdavendigâr Vilayeti Salnamesi'nde 98 hane olarak kayıtlıdır. Köyde koruma altına alınmış çok eski bir servi ağacı, eski bir mezarlık ve mezar taşları bulunur; yakınındaki Etibank'a ait 'Eskiköy yeri' denilen madende bor çıkarılmakta olup buradan da çok sayıda eski yerleşim kalıntısı çıkmaktadır. Kaynak: Bursa Gazeteciler Cemiyeti / bursa.com"
  },
  "mustafakemalpasa-hamzabey-camii": {
    period: "Vakıf 1462-63; günümüzdeki cami 1950'de tamamen yenilenmiş",
    founder: "Hamza Bey (Murat Bey'in oğlu) — vakfeden olarak anılır",
    info: "1950 yılında tamamen yenilenen caminin kendi tarihini gösteren bir kitabesi yoktur. Caminin güneyindeki türbenin kuzey cephesinde, giriş kapısının iki yanında yer alan ve metin bütünlüğü taşıyan kitabelerde, Murat Bey'in oğlu Hamza Bey'in 1462-63 yılında üç değirmeni ile Kara Keçülü'deki ve Bolu'daki mülklerini tekkesine vakfettiği yazılıdır. Kare planlı türbe pandantifli bir kubbeyle örtülü olup içten sıvalıdır; beden duvarlarının dış yüzü altta kesme taş, üstte tuğla ve harç karışımıyla örülmüştür. Doğu cephesinde antik bir mezar taşı devşirme malzeme olarak kullanılmıştır. Kaynak: Mustafakemalpaşa Belediyesi"
  },
  "mustafakemalpasa-seydiali-koyu-camii": {
    period: "1885",
    founder: "Köy halkı (Bulgaristan göçmenleri)",
    info: "Seydi Ali köyü, Bursa il merkezine 95 km, Mustafakemalpaşa ilçesine ise 10 km uzaklıktadır. Köy, 1877-78 Osmanlı-Rus Savaşı sonrasında Bulgaristan'dan gelen göçmenler tarafından kurulmuştur; adını, köy girişindeki mezarlıkta bulunan türbede yatan ve köyün kuruluşunda emeği geçen ilk yerleşimci Seydi Ali'den almaktadır. Köy camisi 1885 yılında yapılmıştır; farklı dönemlerdeki bakım ve tadilatlarla özgün halinden bir ölçüde uzaklaşmıştır. Kareye yakın planlı olan cami, kiremit kaplı kırma çatıya sahiptir. Tek şerefeli minaresi güzel bir görünüm sergiler; mihrabı seramik malzemeyle, minber ve kürsüsü ahşaptan yapılmıştır. Cami içindeki ahşap tavan rozet ve madalyonlarla süslenmiştir. Kadınlar mahfiline harim içindeki ahşap bir merdivenle çıkılmaktadır."
  },
  "mustafakemalpasa-ayaz-koyu-camii": {
    period: "Türbe 1442-43; cami 1899-1900 (kitabeye göre)",
    founder: "Ayas Paşa (türbe, cami ve mescit); türbe için Ayas Bin Sinan Bin Ayas",
    info: "Ayaz köyü, Mustafakemalpaşa ilçesine bağlı olup Bursa il merkezine 95 km, ilçe merkezine 10 km uzaklıktadır. Köy, İstanbul'un fethinden 35 yıl önce, 1416 yılında, Lala Şahin Paşa'nın komutanlarından ve rivayete göre Fatih Sultan Mehmed'in hocalarından olan Ayas Paşa tarafından kurulmuştur; köyü de içine alan geniş bir tımar arazisi, savaşlardaki başarılarından ötürü kendisine verilmiştir. 1530 tarihli belgelere göre köyde 4 hane yaşamaktaydı. Ayas Paşa 1442 yılında bir türbe, cami ve mescit yaptırmış; caminin güneyindeki türbe onun eseri olup kendi mezarının da burada olduğu söylenir. Türbenin 1443 yılında Ayas Bin Sinan Bin Ayas tarafından yaptırıldığı, hem türbe girişindeki kitabeden hem de 1936'da Uludağ Mecmuası yazarı Naci Kasım'ın tercüme ettiği, Yusuf oğlu Ayas Bey'in 1385'te oğlu Sinan Bey adına düzenlediği vakfiyeden anlaşılmaktadır; Sinan Bey ile Hamza Bey'in kardeş olduğu ve her ikisinin de bu türbede medfun bulunduğu vakfiyeye göre kesindir. Caminin giriş kapısı üzerindeki üç satırlık kitabede caminin 1899-1900 (1317 H.) yılında yapıldığı, aşağıdaki manzum metinle birlikte kayıtlıdır:\n\n'Ne dikleş sürete girmiş binasu bu minarenin\nSanurmısın olur bihude mesai'si baninin\nMuhammed eyledi refik çünki hasbeden lillahtır sa'yi\n'Ve'l-bakiyatu's-salihat' dır müjdesi anın\nAtayi hakkı ile tarihin didin 'abd-i muhtar'\nAranur ise bilinsün vakt-i inşası bunun 1317'\n\nCaminin tamamı yenilenmiş olup tarihi bir özellik taşımamakla birlikte minaresi orijinaldir; kare kaideli, yuvarlak gövdeli ve tek şerefelidir. Caminin yanında Hamza Bin Ayas Bey'in türbesi de bulunmaktadır. Köy, Cumhuriyet döneminde 'Ayas' yerine 'Ayaz' adını almıştır; eskiden bataklık olan araziler 1965 sonrasında yapılan setlerle tarıma kazandırılmış, bugün köy sebze ve özellikle meyve üretimiyle öne çıkmaktadır."
  },
  "golyazi-eski-camii": {
    period: "Yapım tarihi kesin olarak bilinmiyor",
    founder: "Bilinmiyor",
    info: "Nilüfer ilçesine bağlı Gölyazı Köyü'nde bulunan cami büyük ölçüde yenilenmiştir. Doğu-batı yönünde dikdörtgen planlı yapının üzeri kiremit kaplı bir çatıyla örtülüdür; büyük yığma ve kesme taştan inşa edilmiştir. Minaresi tek şerefeli olup şerefe altı işlemelidir. Mihrap üstü pencerelerinden ikisi vitraylıdır. Son dönemde restorasyon gören caminin mihrabı kalem işi süsleme ve ayet işlemeleriyle bezelidir; minber ve kürsü ile kadınlar mahfili ahşap malzemeden yapılmıştır. Caminin hemen arkasında yıkık vaziyette bir sıbyan mektebi bulunur. Cami halen ibadete açıktır. Kaynak: Erol Şaşmaz"
  },
  "seyh-kutbuddin": {
    period: "Cami: iddiaya göre 1496; türbe daha erken (Şeyh Kutbuddin öl. 1418); cami 2004'te yeniden inşa edildi",
    founder: "Cami için Çandarlı İbrahim Paşa (öl. 1427) veya rivayete göre İbrahim Paşa (1496); türbe için Halil Paşa rivayeti de vardır",
    info: "Yeşil Camii ve Nilüfer Hatun İmareti'nin yanında yer alır; adını, bitişiğindeki Şeyh Kutbuddin'e (öl. 1418) ait türbeden alır. Cami, Çandarlı İbrahim Paşa tarafından yaptırıldığı kabul edilir; eskiden son cemaat yeri ve kubbeli kare bir mekândan ibaretti. Kare planlı, pandantif kubbeli türbenin girişi doğu duvarda, eksenin güneyinde yer alır; kuzey, güney ve batı duvarlarında eksende, doğu duvarında ise eksenin güneyinde birer pencere bulunur; içeride güneydeki pencereye simetrik iki dikdörtgen niş vardır. Türbeyi örten kubbe, üzeri kiremit kaplı sağır on iki köşeli bir kasnak üzerinde yükselir. Cami ve türbenin banisi konusunda kesin bir bilgi olmayıp, caminin İbrahim Paşa tarafından 1496'da, türbenin ise Halil Paşa tarafından yaptırıldığı öne sürülmektedir. Kare planlı cami ile ona bitişik, kuzeybatıda yer alan kare planlı türbe aynı eksendedir. Orijinal cami yıkılmış olup 2004 yılında aslına uygun şekilde yeniden inşa edilmiştir. Kurtuluş Savaşı sırasında Yunanlılar tarafından yakılıp yıkılan camilerden biridir; kapı, duvarları ve şerefesi yıkık vaziyette ayaktadır, minaresi tuğladandır. Üstü kubbeli, dört köşeli bir yapı olan türbe ise ilk Osmanlı dönemi duvar tekniğini yansıtmaktadır."
  },
  "karacabey-yenisaribeykoyu-camii": {
    period: "1954 (kitabesine göre)",
    founder: "Bilinmiyor",
    info: "Karacabey ilçesinin güneybatısında yan yana Sarıbey adlı üç köy bulunur: Eskisarıbey, Ortasarıbey ve en batıdaki Yenisarıbey. Yenisarıbey, eski Kokona adlı yerleşim yerinde kurulduğu için bu adla da anılmıştır; 1895 Yıllığı'na göre 42 haneli köyün diğer adının Kokona olduğu kayıtlıdır. 1934 yılına kadar Mustafakemalpaşa'ya bağlı olan köy, bu tarihte alınan bir kararla Karacabey'e bağlanmıştır. Eski bir Rum köyü olan Yenisarıbey'de 1927'de 271, 1997'de ise 523 kişi yaşamış; köyde 1880'li yıllarda gelen Bulgaristan göçmenleri ile 1897'de Yunanistan'ın Mora Yenişehir'inden gelen göçmenler iskân edilmiştir. Kitabesine göre 1954 yapımı olan cami dikdörtgen planlı olup kırma çatılı ve kiremit kaplıdır; çatı altı kaplaması ahşaptandır. Minaresi tek şerefeli olup şerefe altı işlemelidir. Cami duvarları ile mihrap, minber ve kürsü farklı desenli seramik/fayans kaplıdır. Müezzin mahfili ile kadınlar mahfili sade bir ahşap işçilikle yapılmıştır. Kaynak: Bursa Gazeteciler Cemiyeti (BGC) internet sitesi"
  },
  "karacabey-kumbetli-camii": {
    period: "Kesin yapım tarihi bilinmiyor; rivayete göre yaklaşık 2200 yıllık bir yapı olup yaklaşık bin yıldır cami olarak kullanılmaktadır",
    founder: "Bilinmiyor",
    info: "Karacabey ilçe merkezinde, Hamidiye Mahallesi'nde yer alan eski bir camidir; 'Dümbekli Mescidi' veya 'Tümbekli Cami' adlarıyla da anılır. Adını, yapının üzerindeki yarım küre biçimli tepe kısmından aldığı söylenir. Rivayete göre M.Ö. 200 yıllarında önce Yahudilere havra olarak ibadete açılan bina, daha sonra Hristiyanlara kilise, son olarak da cami olarak hizmet vermiştir; yapı üzerinde sekiz kollu şamdan ve Davud yıldızı izlerinin bulunduğu belirtilir. Bu özelliğiyle Musevilik, Hristiyanlık ve Müslümanlığın kesiştiği, Bursa'da bu niteliği taşıyan tek ibadethane olarak kabul edilir ve Karacabey'in en eski tarihi eseri sayılır. Doğu-batı yönünde dikdörtgen planlı harim, kuzeyinde ona bitişik bir yan mekân ve batısında son cemaat yerinden oluşur. Duvarların yapımında moloz taş ve mermer parçalarının yanı sıra Bizans dönemine ait sütun başlıklarından da yararlanılmıştır. Harim, eksenin batısında iki sütunlu, üç açıklıklı bir arkadla iki bölüme ayrılır; ortadaki açıklık sivri, yanlardaki açıklıklar yuvarlak kemerlidir. Kuzey-güney doğrultusunda dikdörtgen planlı batı bölüm beşik tonozla örtülüdür; batı duvardaki eksen kapısı son cemaat yerine, kuzey duvardaki basık kemerli kapı ise yan mekâna açılır, güney duvar ise sağırdır. Harimin kare planlı doğu bölümü, üçgen kuşakla geçilen bir kubbeyle örtülüdür; güney duvarında eksende yarım yuvarlak bir mihrap nişi ile iki yanında simetrik iki pencere bulunur. Kuzey-güney doğrultusunda dikdörtgen planlı son cemaat yerinde güney duvarda eksenin batısında bir pencere, batı duvar ekseninde giriş kapısı ve iki yanında ikişer pencere yer alır. Kuzeybatıdaki minaresi yuvarlak gövdeli, tek şerefeli ve konik külahlıdır. Kaynak: Kültür Portalı"
  },
  "karacabey-ismetpasa-haci-ali-aga-camii": {
    period: "1230 H. (1815) — kuzeydeki giriş kapısı üzerindeki 32x60 cm ölçülerindeki kitabeye göre",
    founder: "Kelisanlı Hacı Ali Ağa",
    info: "Karacabey'e bağlı İsmetpaşa köyünde bulunan cami, günümüzde kullanılmamakta olup harap durumdadır ve halen depo olarak kullanılmaktadır. Kuzey-güney doğrultusunda dikdörtgen planlı ve düz tavanlı yapıya, kuzey cephe eksenindeki kapıdan girilir; kapının iki yanında birer pencere bulunur. Güney duvar ekseninde yarım yuvarlak mihrap ile iki yanında birer pencere, doğu ve batı duvarlarda ise ikişer pencere yer alır. Harim ekseninde, ahşap tavanı taşıyan kare kesitli destekler mekânı ikiye ayırır. Harime giriş kapısı dikdörtgen, cephelerdeki pencereler yuvarlak kemerli olup pencerelerin üzerinde basık hafifletme kemerleri bulunur. Yapı kırma çatı ile örtülüdür; köşelerde ve kuzeybatıdaki minare kaidesinde kesme taş, beden duvarlarında ise moloz taş malzeme kullanılmıştır. Pencere kemerleri ile minare gövdesi tuğladandır. Kaynak: Kültür Portalı"
  },
  "karacabey-uluabat-eski-valide-sultan-camii": {
    period: "Yapı özellikleri ve rivayetlere göre 14. yüzyıl sonu - 15. yüzyıl başı (yöre halkına göre Bursa Ulu Camii'den sekiz yıl sonra, yaklaşık 1408); 1953'te kapsamlı onarım görmüştür",
    founder: "Kesin olarak bilinmiyor",
    info: "Karacabey ilçesine bağlı Uluabat köyünde bulunan cami, halk arasında 'Yıldırım Camii' veya 'Eski Cami' adlarıyla da bilinir. Yapı özellikleri ve adları dolayısıyla 14. yüzyıl sonu - 15. yüzyıl başında inşa edildiği düşünülmekte; yöre halkı, caminin Bursa Ulu Camii'den sekiz yıl sonra, yaklaşık 1408'de yapıldığını söylemektedir. Yanında eskiden bir hamam ve bir hanın da bulunduğu belirtilir; bu üçlü yapılanma Osmanlı'nın ilk dönemlerinde uyguladığı yerleşim düzenine uygun düşmektedir. Fetih sırasında Lopadion Kalesi'nin ileri karakol niteliğinde bir direnek noktası olduğuna dair bilgiler de bu görüşü destekler niteliktedir. Genel olarak kuzey-güney doğrultusunda dikdörtgen planlı olan cami, güneyde kare planlı bir ana mekân ve kuzeyde doğu-batı doğrultusunda dikdörtgen planlı, sonradan eklenmiş bir son cemaat yerinden oluşur. Doğu cephesinin kuzey köşesinde, özgünlüğünü yitirmiş düzensiz planlı bir minare kaidesi yer alır. Tavan düz ve ahşap olup yapı dıştan yenilenmiş bir kırma çatıyla örtülüdür; yapı malzemeleri arasında antik parçalara da rastlanmaktadır. Minare kaidesinde düzgün kesilmiş taş, devşirme mermer parçalar ve tuğla; minare gövdesinde ise tuğla kullanılmıştır. 1953 yılında gerçekleştirilen onarımda yapı hemen tümüyle değişikliğe uğramıştır. Kaynak: Bursa Gazeteciler Cemiyeti"
  },
  "karacabey-imaret-kursunlu-camii": {
    period: "İnşasına 1446'da başlanmış; banisinin 1456'da Belgrat Savaşı'nda şehit düşmesi üzerine vasiyeti gereği ailesi tarafından Fatih Sultan Mehmet devrinde, 1457 yılında tamamlanmıştır",
    founder: "Rumeli Beylerbeyi Büyük Emir Abdullah oğlu Dayı Karaca Bey (vefatının ardından ailesi tarafından tamamlattırılmıştır)",
    info: "Selimiye Mahallesi'nde yer alan caminin mülkiyeti Vakıflar Genel Müdürlüğü'ne aittir. 1853 depreminde hasar gören yapı, sonraki dönemde Yunanlılar tarafından da tahrip edilmiş; kullanılamaz hale gelen bina 1971-72 yıllarında Vakıflar Genel Müdürlüğü'nce onarılarak 12 Temmuz 1980'de yeniden ibadete açılmıştır. Kuzeyindeki imaret günümüze ulaşamamıştır. Caminin 36 penceresi, 9 kubbesi ve iki kapılı bir minaresi bulunur; son cemaat yeri ile kuzey-güney doğrultusunda art arda sıralanan giriş ve ibadet mekânından, girişin doğu ve batısında önlerinde birer dehliz bulunan iki yan kanattan oluşur. Doğu-batı yönünde dikdörtgen planlı son cemaat yeri, haçvari altı destek ve kemerle beş bölüme ayrılır; kuzey cephe, eş yükseklikteki sivri kemerli revakla dışa açılır. Kubbeler ve tonoz aynı yükseklikte olup kubbenin ortasında sekiz cepheli bir aydınlık feneri yükselir. Son cemaat yerinin güney duvarı ortasındaki giriş, malzeme çeşitliliği ile taş ve mermer işçiliğinin kalitesiyle dikkat çeker. Kübik kaideli, silindirik gövdeli, tek şerefeli ve piramidal külahlı minaresiyle yapının tamamı taştandır. Son cemaat revakının minare çevresindeki kubbesi altında Karaca Bey'in mezarı bulunur; kitabesinde, Belgrat Kalesi muharebelerinde şehit düşen Abdullah oğlu büyük emir Karaca Bey'in kabri olduğu yazılıdır. Tarihi kayıtlarda 'Kurşunlu Cami' adıyla da anılmaktadır. Kaynak: Bursa'nın Değerleri"
  },
  "karacabey-ulu-camii": {
    period: "I. Murad Hüdavendigar dönemi (1362-1389) vakfı; 1774'te (1188 H.) kapsamlı bir düzenleme ve muhtemelen I. Abdülhamit devrinde (1774-1789) bir onarım geçirmiş; Vakıflar Genel Müdürlüğü'nce 1964'te restore edilmiştir",
    founder: "I. Murad Hüdavendigar",
    info: "Şehrin 'Eski Karacabey' olarak anılan bölümünde yer alan cami, Osmanlı Sultanı I. Murad Hüdavendigar zamanında Bursa'da inşa edilen eserler arasında sayılır ve yapının onun vakfı olduğu kitabesinden anlaşılmaktadır; kitabede caminin sağlam bir yapı olduğu, çevresinde bir benzerinin bulunmadığı ve banisinin ve yapının kalıcılığına dair bir dua yer alır. 1774 yılında camiye ser-mahfil, muarrif, vaiz, müezzin, mütevelli, devirhan ve cüzühan gibi görevlendirmeler yapılmıştır. Depremler ve Kurtuluş Savaşı yıllarındaki Karacabey Yangını'nda ağır hasar gören eser, geçirdiği her onarımda özgün mimari özelliklerinden bir kısmını kaybetmiştir; günümüzde kubbesiz, çatılı bir görünüme sahiptir. Altıgen kaideli minaresi on altı kenarlı gövdeye sahip olup tek şerefelidir. Mimari veriler, yapının I. Abdülhamit döneminde (1774-1789) bir onarımdan geçtiğine işaret etmektedir. Yunan işgali sırasında yanan cami, Vakıflar Genel Müdürlüğü tarafından 1964 yılında restore edilmiş olup halen ibadete açıktır. Caminin harimi 19,34 x 16,60 m ölçülerinde ve çatılıdır. Yapının özgün haline kavuşturulması amacıyla hazırlanan yeni bir onarım ve restorasyon projesinin ilerleyen dönemde uygulamaya konması beklenmektedir. Kaynak: Kültür Varlıkları"
  },
  "abdal-camii": {
    period: "II. Murad Dönemi (15. yüzyıl)",
    founder: "Başçı İbrahim (Abdal Mehmed adına)",
    info: "Dikdörtgen planlı caminin üzerinde iki oval kubbe bulunmaktadır. Caminin yanında türbesi ve çeşmesi de bulunmaktadır. Cami, 1955 yılında Bursa Eski Eserleri Sevenler Kurumu tarafından büyük çapta onarılmıştır. (Kaynak: kulturportali.gov.tr)"
  },
  "acem-reis": {
    period: "1516 öncesi (Fatih Sultan Mehmed Dönemi)",
    founder: "Bedrettin Mahmut bin Mehmet Acem (Fatih'in hocalarından, öl. 1516)",
    info: "İç ölçüleri 7,32 x 7,25 metre olan caminin girişinde 2,71 metre derinliğinde bir son cemaat yeri bulunmaktadır. Ana mekân büyük bir kubbeyle örtülüdür; duvarlar üç sıra tuğla, bir sıra kesme taş kullanılarak örülmüştür. Son cemaat yeri ortada dar, yanlarda geniş üç bölüm halindedir; orta göz sivri kemer altında Bursa kemerli, yan gözler ise sivri kemerlerle ayak ve yan duvarlara bağlanmıştır. Orta bölme beşik tonozla, yanlar ise üstü kurşun kaplı aynalı tonozla örtülüdür. Cami iki yol arasında kalmış olup, küçülen haziresinden günümüze yalnızca 3-4 mezar ulaşmıştır. (Kaynak: Bursa İl Kültür ve Turizm Müdürlüğü)"
  },
  "ahmet-pasa-fenari-camii": {
    period: "Fatih Sultan Mehmed Dönemi (15. yüzyıl); onarımlar 1803 ve 1911",
    founder: "Fatih devri banisi bilinmemekle birlikte, yangın sonrası 1803'te Şerife Nefise Hanım, 1911'de Hacı Atika ailesinden Fethiye Hanım ve halkın katkılarıyla onarılmıştır.",
    info: "İç ölçüleri 7,60 x 10,80 metre olan caminin üzeri ahşap ve yerli tuğla ile örtülüdür. Caminin önünde yan yana iki çeşme bulunuyordu; bu çeşmeler 1976'da yıkılıp yerine yenileri yapılmıştır. Caminin doğusunda anıtsal bir çınar ağacı yer almaktadır. (Kaynak: kulturenvanteri.com)"
  },
  "akbiyik": {
    period: "Fatih Sultan Mehmed Dönemi (15. yüzyıl); onarım 1858",
    founder: "İpekoğlu Hoca Dursun (Akbıyık Efendi adına)",
    info: "Erkek Lisesi'nin arkasında, Nalbantoğlu Mahallesi'nde yer almaktadır. Asıl ibadet alanı 6,46 x 6,66 metre iç ölçülerinde olan cami, üç bölümlü son cemaat yeriyle birlikte genel olarak dikdörtgen bir alana sahiptir. Duvarları bir sıra kesme taş, üç sıra tuğla ile örülmüştür; üzerini büyük bir kubbe örtmektedir. Son cemaat yerinde iki revaklı dar bir giriş bulunur; revakların üzerinde beşik tonozlar vardır, önleri parmaklık ve camekânla kapalıdır. Doğusunda tuğla örgülü, külahı kısa, alemi boğa boynuzu biçiminde bir minaresi bulunur. Bursa depreminde büyük tahrip gören cami 1858 yılında onarılmıştır. Hemen altında, Akbıyık Caddesi üzerinde Akbıyık Türbesi yer alır. (Kaynak: Bursa İl Kültür ve Turizm Müdürlüğü)"
  },
  "alacahirka-camii": {
    period: "14. yüzyıl sonu / 15. yüzyıl başı (tahmini); onarımlar 1585 ve 1635",
    founder: "Banisi kesin olarak bilinmemektedir; Buhara'dan gelip Bursa fethine katılan erenlerden biri tarafından yaptırıldığı sanılmaktadır.",
    info: "Alaca Hırka semtinde, Köşk Caddesi üzerinde yer alır. Kitabesi bulunmadığından yapım tarihi ve banisi kesin olarak bilinmemekle birlikte, Hoca Yakup tarafından 1585'te, İmamzade Mahmut Çelebi tarafından da 1635'te onarılmıştır; buna ve mimari üsluba dayanılarak 14. yüzyıl sonu ya da 15. yüzyıl başında yapıldığı sanılmaktadır. Moloz taş duvarlı cami iki sıra kirpi saçakla sona erer. Dikdörtgen planlı yapının üzeri ahşap kırma çatı ile örtülüdür. Doğusundaki minare orijinal olup sekizgen kaide üzerine yuvarlak gövdeli, kesme taştan yapılmıştır. Doğusundaki mezarlardan biri Hoca Yakup'a aittir. (Kaynak: camiler.fandom.com)"
  },
  "alanyeri": {
    period: "Fatih Sultan Mehmed Dönemi; yapılışı 1472 (tahmini)",
    founder: "Banisi kesin olarak bilinmemektedir.",
    info: "İsmail Hakkı Tekkesi'nin doğusunda yer alan mescit, \"Tekke Mescit\" adıyla da anılmaktadır. Son cemaat yeri olmayan, güneybatı kısmı evler arasında kalan, çatılı ve üzeri kiremitle örtülü bir mesciddir. Cami ve müştemilatı 120 m², iç alanı ise 50 m²'dir; duvarlarında ahşap hatıl kullanılan tek mescittir. Batı yönünden açılan bir kapıyla doğrudan harime geçilir. Ahşap tavanlı ana mekândaki mihrap sade bir niş halindedir ve daha sonra yeni çinilerle kaplanmıştır. Minaresi yapıdan ayrı olup güneybatı yönünde yer alır; kaide kısmı orijinal olup moloz taş ve tuğla ile örülüdür. (Kaynak: Bursa İl Kültür ve Turizm Müdürlüğü)"
  },
  "altiparmak-camii": {
    period: "Fatih Sultan Mehmed Dönemi (1451-1481)",
    founder: "Muhiddin Mehmet (Fatih devri hocalarından)",
    info: "Asıl ibadet mekânı ve son cemaat yeriyle birlikte dikdörtgen bir plan şemasına sahiptir. Girişi, Bursa camilerinde sıkça görülen kalkan duvarı ile vurgulanmıştır. Doğusunda, çoğunluğu 16. yüzyıla ait mezar taşlarının bulunduğu bir hazire yer almaktadır. (Kaynak: kulturenvanteri.com)"
  },
  "araplar-camii": {
    period: "1512 (tahmini, bazı kaynaklara göre)",
    founder: "İstanbul'daki Araplar Şeyhi Hüseyin oğlu Zenci Ebubekir",
    info: "Ali Paşa Semti'nde, Ali Paşa Camii'nin batı tarafında yer alır. Adını, çevresinde Arap Dede adında bir gömütün bulunmasından almıştır. Rivayete göre banisi, camiyi azatlıların haraçlarını toplayarak yaptırdığı için \"Azap Bekir\" olarak da anılmıştır. Duvarları tamamen moloz taşıyla örülmüş, üzeri kırma çatı ile kapatılmıştır. Asıl ibadet yeri ahşap tavanlı olup, kuzey yönündeki son cemaat yeriyle birlikte dikdörtgen bir yapı oluşturur. 1855 depreminden sonra büyük onarımdan geçmiş, bu süreçte eski mimari özelliklerinin bir kısmını yitirmiştir. Minaresi yoktur; doğu yönünde Arap Dede'nin mezarı bulunmaktadır. (Kaynak: Bursa İl Kültür ve Turizm Müdürlüğü)"
  },
  "arap-mehmet-camii": {
    period: "1490",
    founder: "Yaptıranı kesin bilinmemekle birlikte, Kâmil Kepecioğlu'na göre Arap Mehmet'tir; oğlu Şemsettin Ahmet Çelebi ve torunu ulemadan Abdülfettah Efendi Bursa'da ikamet etmiştir.",
    info: "8,65 x 8,65 metre boyutlarındaki ana mekâna ek olarak 3,90 metre derinliğinde bir son cemaat yeri vardır. Beden duvarları iki sıra tuğla, iki sıra moloz taş örgülüdür. Sekizgen kubbe kasnağında moloz taş yerine kesme taş kullanılmış, aralar dikey tek tuğla ile birlikte yatay düzende üçer sıralı tuğla hatıllarla birleştirilmiştir. İki sıra kirpi saçakla sonuçlanan kubbe kurşun örtülüdür. Son cemaat yeri, doğu ve batı duvarlarına ve iki yığma ayağa dayanan üç sivri kemerden oluşur; ortadaki bölme daha dar olup yüksek kasnaklı bir kubbeyle, iki yan bölme ise aynalı tonozla örtülüdür. Kemer araları demir doğramalı camekânla kapatılmıştır. Ana girişin ahşap kapı kanatları özgünlüğünü korumaktadır. Her cephede ikişer olmak üzere toplam on sekiz pencere aydınlatmayı sağlar. Kuzeybatısındaki minareye ana mekândan açılan bir kapıyla çıkılır; minarenin sekizgen kaidesi ana binanın örgü sistemiyle uyumlu olup, silindirik gövdeye üçgenlerle geçiş yapılmıştır. Gövde tuğla örgülü, şerefe altı sıvalıdır. (Kaynak: kulturenvanteri.com)"
  },
  "aynali": {
    period: "1467 (II. Murad Dönemi)",
    founder: "Hoca Tabib Hüsnü Efendi (Yıldırım Darüşşifası Müderrisi)",
    info: "Kayhan Mahallesi, Ünlü Caddesi'ndedir. Minare şerefesinin altında sıralanmış aynalar bulunduğu için \"Aynalı Mescit\" olarak da anılmıştır. 1955 yılındaki gazete haberlerine göre, 9-10 yıldır kullanılmayan cami o dönemde Kızılay'ın deposu ve aşevi olarak hizmet vermekteydi. İç ölçüleri 8,20 x 8,23 metre olan ana mekânın üzeri yüksek bir kubbeyle örtülüdür. Son cemaat yerinin üzerini, kare planlı baklavalı kuşağın taşıdığı sekiz köşeli kasnak ve kubbe örter. On sekiz pencereyle aydınlatılan caminin batıdaki minaresi tek şerefelidir. 1981 onarımında şerefesindeki aynalar kaldırılıp yerine kare mozaik taşı konmuştur. Duvarları moloz taşından örülmüştür. (Kaynak: Bursa İl Kültür ve Turizm Müdürlüğü)"
  },
  "bahri-baba-camii": {
    period: "1566-1572 arası (Kanuni Sultan Süleyman Dönemi, salt. 1520-1566)",
    founder: "Mutasavvıf ve şair Bahri Baba",
    info: "Muradiye'de Salıpazarı Caddesi üzerinde yer alır. 10,44 x 10,44 metre boyutlarında kare planlı cami, sekizgen bir kasnağa oturan tek bir kubbeyle örtülüdür. Duvarlar moloz taş ve tuğla ile, kubbe kasnağı kesme taş ile işlenmiştir. Üç bölmeli son cemaat yeri ve minare yıkılmıştır. Yıllarca odun deposu olarak kullanılan bina, son yıllarda kesme taş ve tuğladan kalkan duvarlı son cemaat yeri ve minare eklenerek yeniden ibadete açılmıştır. (Kaynak: Bursa Kültür Varlıkları Envanteri: Anıtsal Eserler, Bursa Büyükşehir Belediyesi Yayınları)"
  },
  "basci-ibrahim-pasa-camii": {
    period: "Fatih Sultan Mehmed Dönemi; onarımlar 1891 ve 1960",
    founder: "Başçı İbrahim (vakfiyesinin aslı Topkapı Sarayı arşivindedir)",
    info: "Maksem semtinde, Başçı İbrahim Sokağı'nda bulunur. Zamanla harap olan cami, 1854 depreminden sonra ve 1891'de onarım görmüş; bir ara depo olarak kullanıldıktan sonra Vakıflar Genel Müdürlüğü ile Bursa Eski Eserleri Sevenler Kurumu'nun ortak onarımıyla 1960'ta yeniden ibadete açılmıştır. Kare planlı asıl ibadet mekânı, prizmatik üçgenlerden (badem) oluşan bir kuşak üzerine oturan, üstten kurşun kaplı bir kubbeyle örtülüdür; ana mekân 10,00 x 9,95 metre iç ölçülerindedir. Kasnakta üç, altta sekiz, üstte altı pencere bulunur; alt sıradaki pencerelerden altısı sonradan genişletilerek özgün şeklini yitirmiştir, güneydeki iki pencerenin ahşap kapakları ise orijinaldir. Son cemaat yerinde girişi bulunan minare caminin batı köşesindedir; sekizgen kaideli, silindirik gövdesi tuğladandır, şerefe altı sıra kirpi saçaklıdır. Petek, külah ve şerefe onarım sırasında yenilenmiş, avludaki sekiz kenarlı şadırvan da yeni yapılmıştır. Cami ile hamamı arasında ve güney duvarı arkasında birçok mezar bulunur; güneydoğusunda 1481'de vefat eden Başçı İbrahim Bey'in mezarı yer alır. (Kaynak: Bursa İl Kültür ve Turizm Müdürlüğü)"
  },
  "bedrettin-camii": {
    period: "1443 (Çelebi Mehmet Dönemi); onarımlar 1586 ve 1888",
    founder: "Hafsa Sultan (Çelebi Mehmet'in kızı, Çandarlı Mahmut Bey'in eşi)",
    info: "Kayhan Mahallesi Simavlı Sokak üzerinden Yeşil'e gelirken, Boyacı Küllüğü Köprüsü'nün batısında, üç yol ortasındadır. Bu dönemde Mahmutlara \"Bedrettin\" denildiği için camiye bu isim verilmiştir. Mahalle mescidi tipinde, tek kubbeli, kalkan duvarlı ve kare planlıdır. 8,85 x 8,85 metre iç ölçülerindeki asıl ibadet alanını büyük bir kubbe örter; son cemaat yerinin üstü tonozludur. Duvarları iki sıra tuğla, iki sıra moloz taşla örülmüştür. Batı yönündeki minare sekizgen kaideli, silindirik tuğla gövdeli, kısa külahlı ve tek şerefelidir; şerefe altında dört sıra kirpi saçak, gövdede çiçek motifi bulunur. Kıble tarafındaki avlu duvarında, sivri kemerli bir niş içinde musluk ve küçük bir yalaktan oluşan bir çeşme yer alır. (Kaynak: Bursa İl Kültür ve Turizm Müdürlüğü)"
  },
  "bayezid-pasa-catal": {
    period: "1421 öncesi (Sultan I. Mehmet Dönemi); onarımlar 1892, 1951, 1976",
    founder: "Bayezıt Paşa (Yahşi Bey oğlu; vezirlik ve sadrazamlık yapmış, 1421'de şehit düşmüştür)",
    info: "Yeşil Semti'nde, Yeşil Külliyesi'nin hemen doğusunda, 6. Okul Sokak'tadır. 7,75 x 7,57 metre iç ölçülerindeki caminin üst kısmı kırma çatı ile örtülüdür; 3,80 metre derinliğinde bir son cemaat yeri bulunur. 1855 depreminde tahrip olan cami 1892'de onarılmış, kuzeyden çıkılan bir merdivenle ulaşılan girişin altında bir bodrum yer alır. 1951'de onarılan yapı 1976'da yıkılıp yeniden yaptırılmış, bu süreçte özgün mimarisini yitirmiştir. Asıl minaresi yıkıldığı için yerine tuğla malzemeli yeni bir minare inşa edilmiş, şerefe altı dört sıra kirpi saçak dizilidir. (Kaynak: Bursa İl Kültür ve Turizm Müdürlüğü)"
  },
  "besikciler-camii": {
    period: "Fatih Sultan Mehmed Dönemi (salt. 1451-1481)",
    founder: "Sofu Hacı Sinan (Sadrazam İshak Paşa'nın oğlu İbrahim Efendi'nin kethüdası)",
    info: "Beşikçiler Caddesi ile Cem Sokağı'nın birleştiği köşede yer alır. Ana ibadet mekânı dikdörtgen olup üzeri sekizgen kasnağa oturan bir kubbeyle örtülüdür; duvarlar üç sıra tuğla, iki sıra kesme taşla örülmüştür. Üç gözlü son cemaat yerini dört yığma ayakla tuğla örgülü sivri kemerler oluşturur, üzeri aynalı tonozlarla örtülüdür. Son cemaat yerinin iki yan duvarının ve kalkan duvarının olmayışı, dönemin Bursa camilerinden farklılık gösterir. Üç sıra tuğla, bir sıra kesme taşla örülmüş on iki genli bir kaideye oturan minare kısa bir külaha sahiptir. (Kaynak: Bursa Kültür Varlıkları Envanteri: Anıtsal Eserler, Bursa Büyükşehir Belediyesi Yayınları)"
  },
  "cagir-aga": {
    period: "1440 (Fatih Sultan Mehmed Dönemi); onarım 1970",
    founder: "Çakır Ağa (Mecnun Dede adına)",
    info: "Tahtakale Mevkii'nde, Tahtakale Mahallesi Kurşunlu Sokak'ta yer alır. Ana duvarları üç sıra tuğla ve moloz taş örgülü, iki sıra kirpi saçaklıdır. Kubbe kasnağı iki sıra kesme taş, üç sıra yatay tuğla örgülüdür; kesme taş araları dikey tuğlayla takviye edilmiştir. Cami 7,38 x 7,60 metre iç ölçülerindedir. Girişinde 2,90 metre genişliğinde, üstü tonozla örtülü bir son cemaat yeri bulunur; buraya orta gözden geçilir. Girişi Bursa kemerli olup üstünde ikinci bir sivri kemer vardır. Duvarlarında kuş gagası ve yaba motifleri hâkimdir. 1970 yılına kadar üstü kırma çatılı iken, o tarihteki onarımda kubbeye çevrilmiştir. Batı kısmında tuğla gövdeli, tek şerefeli, sivri külahlı bir minaresi vardır. (Kaynak: Bursa İl Kültür ve Turizm Müdürlüğü)"
  },
  "cirag-bey-mescidi": {
    period: "I. Murat Dönemi; onarım 1677",
    founder: "Şerafüddin el-Hac Şeyh Çırağ (Hacı İvaz Paşa'nın kardeşi)",
    info: "Hisar içinde, aynı adı taşıyan Çırağ Bey Sokak üzerinde, Mollagürani Mahallesi'ndedir. 50 m² iç alana sahip cami dikdörtgen planlıdır; üst kısımları önceleri kubbeliyken bugün kırma çatı ile örtülüdür, bir sıra kirpi saçaklıdır. Yapının güneydoğu köşesi pahlanarak üç sıra tuğla stalaktit yapılmıştır. Doğu duvarının altında iki dikdörtgen çerçeveli, demir parmaklıklı, üstte sivri kemerli pencere bulunur. Duvarları taş ve tuğla ile örülmüştür; 1677'de büyük ölçüde onarım görmüştür. Minaresi kısa ve sekiz köşelidir. (Kaynak: kahvetabela.com)"
  },
  "cukur-mahalle-mescidi": {
    period: "15. yüzyılın ikinci yarısı",
    founder: "Ahmet Bey",
    info: "Farklı zamanlarda yapılan onarımlar ve bir ara dokuma fabrikası olarak kullanılması nedeniyle mescit orijinalliğinden uzaklaşmıştır. İbadet mekânı kareye yakın dikdörtgen planlıdır, üzeri çatı ile örtülüdür ve altı pencereyle aydınlatılmıştır; ancak bitişikteki bir yapı nedeniyle bu pencerelerden biri kapanmıştır. İçeride günümüze ulaşan herhangi bir bezeme yoktur; son cemaat yerindeki ahşap sütun ve sütun başlıkları ise orijinaldir. (Kaynak: gotobursa.com.tr)"
  },
  "kademeri": {
    period: "II. Murad Dönemi",
    founder: "Ahi Kadem (asıl adı Ali; Kadem Eri Ali veya Ahi Kadem olarak da anılır)",
    info: "Pınarbaşı Mahallesi Uzun Sokak'ta bulunur, Kademeri Camii olarak da bilinir. İç ölçüleri 7,30 x 7,25 metre olan caminin girişinde üç metre derinliğinde bir son cemaat yeri vardır; üstü kiremitle örtülüdür. Asıl ibadet alanının üst kısmı kubbeyle örtülmüştür. Duvarları bir tuğla, bir kesme taş ve aralarına birer dikey tuğla konularak örülmüştür. Batıdaki minare sekiz köşeli bir kaideyle başlayıp bir mermer bir tuğla küple silindirik tuğla gövdeye geçer; tek şerefeli ve sivri külahlıdır. (Kaynak: Kültür Portalı)"
  },
  "nilufer-hatun-darphane": {
    period: "XIV. yüzyıl (tahmini)",
    founder: "Orhan Gazi'nin hanımı Nilüfer Hatun tarafından yaptırıldığı sanılmaktadır",
    info: "Saltanat Kapı'nın hemen yakınında bulunan ve bugün Kur'an Kursu olarak kullanılan mescidin XIV. yüzyıla ait olduğu düşünülmektedir; zaman içinde orijinalliğini büyük ölçüde yitirmiştir. Dikdörtgen planlı mescidin üzeri kiremitle kaplı ahşap bir çatı ile örtülüdür. Kuzey yönündeki son cemaat yerinin yanları ve önü kapatılmıştır. Son yıllarda ana ibadet mekânı ile son cemaat yeri arasındaki duvar kaldırılarak birleştirilmiştir. Kaynak: bursa.bel.tr"
  },
  "davutkadi-camii": {
    period: "1517 (yapım); 1885 (yeniden inşa)",
    founder: "Hacı Emin tarafından Davut Kadı adına yaptırılmış; 1885'te Emine Hanım tarafından yeniden inşa ettirilmiştir",
    info: "Hacıseyfettin Mahallesi'nde bulunan bugünkü caminin doğusundaki ev, asıl caminin bulunduğu yer olup sonradan yıkılmış ve yerine ev yapılmıştır. Zamanla harap olan yapı 1885 yılında Emine Hanım tarafından yeniden inşa ettirilmiştir. Ahşap tavanlı, çatısı kiremitle örtülü camiye 1953 yılında yapılan onarımda betonarme bir son cemaat yeri ve mahfil eklenmiş, 2003 yılında da caminin yan tarafına bir mekân daha ilave edilmiştir. Bir adet tek şerefeli minaresi ile bir dükkânı, Kur'an kursu ve iki lojmanı bulunmaktadır. Davut Kadı, Kara Davut adıyla da anılır; Bursa Kadısı olup çeşitli yerlerde müderrislik yapmış, 1527 yılında Bursa Kadılığı görevinden alınmıştır. Kaynak: kulturportali.gov.tr"
  },
  "davut-pasa-camii": {
    period: "16. yüzyıl",
    founder: "Sultan II. Bayezid'in veziri ve Fatih Sultan Mehmet Han zamanında Anadolu Beylerbeyi olan Davut Paşa",
    info: "Bit Pazarı çarşısında bulunan mescit, Davut Paşa tarafından yaptırılmıştır; Davut Paşa'nın çeşitli yerlerde medrese, hamam ve hayratları vardır. Bugünkü yapının sonradan yapıldığı kaynaklarda belirtilmiştir. Davut Paşa Mescidi harap durumda iken Şiblizade tarafından tekrar inşa edilmiştir. 6,40 x 9,00 metre iç ölçülerinde olan mescidin üzeri kırma çatı ile örtülmüş olup 2002 yılında kapsamlı bir tadilattan geçirilmiş, 2003 yılında da cami önündeki çeşme restore edilmiştir. Dış yüzeyi sıvalı olan küçük bir minaresi bulunmaktadır. Kaynak: kulturportali.gov.tr"
  },
  "daye-hatun": {
    period: "1421 (Çelebi Sultan Mehmed Dönemi)",
    founder: "Çelebi Sultan Mehmed'in süt annesi Daye Hatun",
    info: "255 m² iç mekâna sahip olan caminin bir adet minaresi bulunmaktadır; kırma çatı ile örtülmüş olup kiremit ile kaplanmıştır. 1651'de yenilenmiş, son tamiratı 1971'de yapılmıştır. Cami avlusunda çok sayıda mezar bulunmaktadır; Nakşibendi tarikatı ariflerinden Açıkbaş Mahmud'un mezarı da buradadır. Kaynak: kulturportali.gov.tr"
  },
  "duhter-i-serif-fiskirik": {
    period: "Fatih Sultan Mehmed Dönemi (salt. 1451-1481); Mart/Nisan 1492 tarihli bir sicile dayanarak bu döneme tarihlenmektedir",
    founder: "Molla Şerefüddin Kırımi'nin kız kardeşi Şahi Hatun",
    info: "Tahtakale Semti'nde, Ahmet ve Hazım Sokaklarının kesiştiği yerde bulunur; halk arasında Fışkırık Camisi olarak da bilinir. 7,67 x 7,91 metre ölçülerinde kareye yakın planlı olup, duvarlardan kubbeye geçiş Türk üçgenleri ile sağlanmıştır. Tonozla örtülü son cemaat yeri revakı üç gözlüdür; duvarlar bir sıra kesme taş, üç sıra tuğla ile örülmüştür. Derzler, Bursa'nın birçok yapısında olduğu gibi kuş gagası ve üç çatallı tezyinatla süslenmiştir; minarenin eski kaidesinin derzleri de aynı özelliktedir. Mihrap 1951 yılına kadar stalaktitliydi; bu tarihten sonra dokuz sıra stalaktitli olarak yenilenip üzeri yağlı boyayla kapatılmış, çevresindeki rumi ve sekiz köşeli tezyinat da boyanmıştır. (Kaynak: Baykal, Bursa ve Anıtları, 82; Bursa Ansiklopedisi, Cilt 2, 557; Kaplanoğlu, Bursa Anıtlar Ansiklopedisi, 49)"
  },
  "gungormez-camii": {
    period: "1562-1563",
    founder: "Abdullah Efendi",
    info: "Ulu Cami'nin tam karşısında, Atatürk Caddesi kenarında yer alır; kıble duvarı, bitişiğindeki Tahtakale Hanı'nın kuzeyine dayanmaktadır. Kare planlı ana mekânın üzeri tek bir kubbeyle örtülüdür. (Kaynak: Bursa Kültür Varlıkları Envanteri: Anıtsal Eserler, Bursa Büyükşehir Belediyesi Yayınları, s.98)"
  },
  "guranli-mescidi": {
    period: "1594",
    founder: "Erzincanlı Hüseyin (Erzincan'ın Güran Köyü'nden Bursa'ya yerleşmiş bir şahıs)",
    info: "Mollagürani Mahallesi'nde, Güranlı Sokak ile II. Tahtalı Sokak'ın kesiştiği yerde bulunur. Ahşap direkler arasına kerpiç dolgu ile inşa edilmiş olup avlusu, minaresi ve son cemaat yeri yoktur; üzeri kırma çatı ile örtülüdür. Bitişiğinde, camiyi yaptıran Hüseyin Bey'in mezarıyla birlikte yazıtsız bir kabir daha bulunmaktadır."
  },
  "haci-iskender-camii": {
    period: "1500",
    founder: "Abdullah oğlu Hacı İskender",
    info: "Namazgâh bölgesinin batısında, eski Akçardak Mahallesi'nde, Cıngıllı Sokak başında yer alır; eski şer'iye sicillerinde bölge 'Hacı İskender Mahallesi' olarak da geçmektedir. Kâzım Baykal'ın 'Bursa ve Anıtları' adlı eserinde orijinal yapısına dair bilgiler yer alır; ayakta kalan özgün beden duvarları ve zarif işçilikli bir minaresiyle bilinirdi, tarihi deprem kayıtlarında minarenin şerefe kısmının hasar gördüğü belirtilmiştir. Zamanla harap olan özgün yapının yerini, günümüzde tamamen yenilenmiş modern bir cami almıştır. (Kaynak: Vakıflar Genel Müdürlüğü; Kâzım Baykal, Bursa ve Anıtları)"
  },
  "hacilar-camii": {
    period: "871 H. (1466)",
    founder: "Bakkal Hacı Sinan",
    info: "Hükümet Konağı ve Adliye binasının önünden geçen yolun karşısında yer alır. Rivayete göre, çeşitli nedenlerle hacca gidemeyen Bursalı hacı adaylarının bu amaçla ayırdıkları paralarla yaptırılmıştır; bu yüzden halk arasında 'Hancılar Camii' olarak da anıldığı söylenir. Kare planlı asıl ibadet mekânı, üç bölmeli son cemaat yeriyle birlikte dikdörtgen bir alana oturur; son cemaat yerinin ön ayakları iki sıra tuğla bir sıra moloz taştan, kemer üstleri ise kesme taştandır. Derzlerinde kuş gagası ve kare içinde yıldız motifli kuşaklar işlenmiştir. Yüksek kalkan duvarındaki üç sivri kemerli nişten ikisi tuğla dalga motifleriyle bezenmiş, ortadaki nişe kitabe yerleştirilmiştir; üç sıralı kirpi saçak altında, kemer üzengi hizasına kadar inen çıkıntılı bir çerçeve dolanır. Son cemaat yerinin orta giriş gözü dar, yüksek ve kubbeli, yan gözleri ise daha geniş ve tonoz örtülüdür. Doğu ve batı yan duvarlar sonradan örülmüş, kuzey cephedeki kemer boşlukları camekânla kapatılmıştır. (Kaynak: kulturportali.gov.tr)"
  },
};

let MOSQUE_INFO_OVERRIDES = {};

function loadMosqueInfoOverrides() {
  const storedOverrides = localStorage.getItem('manevi-atlas-mosque-info-overrides');
  if (!storedOverrides) return;

  try {
    MOSQUE_INFO_OVERRIDES = JSON.parse(storedOverrides) || {};
  } catch (error) {
    MOSQUE_INFO_OVERRIDES = {};
  }
}

function saveMosqueInfoOverrides() {
  localStorage.setItem(
    'manevi-atlas-mosque-info-overrides',
    JSON.stringify(MOSQUE_INFO_OVERRIDES)
  );
}

function loadCustomAddedMosques() {
  PRESET_MOSQUES.forEach((mosque) => {
    if (mosque.isCustom === undefined) {
      mosque.isCustom = false;
    }
  });

  const storedCustomMosques = localStorage.getItem('manevi-atlas-custom-mosques');
  if (storedCustomMosques) {
    try {
      const customMosques = JSON.parse(storedCustomMosques);

      customMosques.forEach((customMosque) => {
        customMosque.isCustom = true;

        const mosqueAlreadyExists = PRESET_MOSQUES.some(
          (mosque) => mosque.id === customMosque.id
        );
        if (!mosqueAlreadyExists) {
          PRESET_MOSQUES.push(customMosque);
        }
      });
    } catch (error) {
      console.error('Özel cami listesi yüklenemedi', error);
    }
  }

  applyMosqueOverrides();

  const storedDeletedMosques = localStorage.getItem('manevi-atlas-deleted-presets');
  if (storedDeletedMosques) {
    try {
      const deletedMosqueIds = new Set(
        JSON.parse(storedDeletedMosques).map((mosque) => mosque.id)
      );
      PRESET_MOSQUES = PRESET_MOSQUES.filter(
        (mosque) => !deletedMosqueIds.has(mosque.id)
      );
    } catch (error) {
      console.error('Silinen cami listesi okunamadı', error);
    }
  }
}

function persistCustomMosqueList() {
  const customMosques = PRESET_MOSQUES.filter((mosque) => mosque.isCustom);
  localStorage.setItem(
    'manevi-atlas-custom-mosques',
    JSON.stringify(customMosques)
  );

  if (typeof markDataChanged === 'function') {
    markDataChanged();
  }
}

function saveMosqueOverride(mosqueId, overrideData) {
  let mosqueOverrides = {};
  const storedOverrides = localStorage.getItem('manevi-atlas-mosque-overrides');

  if (storedOverrides) {
    try {
      mosqueOverrides = JSON.parse(storedOverrides);
    } catch (error) {
      // Bozuk veya eski yerel veri varsa temiz bir override nesnesiyle devam edilir.
    }
  }

  mosqueOverrides[mosqueId] = overrideData;
  localStorage.setItem(
    'manevi-atlas-mosque-overrides',
    JSON.stringify(mosqueOverrides)
  );
}

function applyMosqueOverrides() {
  const storedOverrides = localStorage.getItem('manevi-atlas-mosque-overrides');
  if (!storedOverrides) return;

  try {
    const mosqueOverrides = JSON.parse(storedOverrides);

    Object.keys(mosqueOverrides).forEach((mosqueId) => {
      const mosque = PRESET_MOSQUES.find((item) => item.id === mosqueId);
      if (mosque) {
        Object.assign(mosque, mosqueOverrides[mosqueId]);
      }
    });
  } catch (error) {
    console.error('Cami düzenlemeleri okunamadı', error);
  }
}

function getDeletedPresetMosques() {
  const storedDeletedMosques = localStorage.getItem('manevi-atlas-deleted-presets');
  if (!storedDeletedMosques) return [];

  try {
    return JSON.parse(storedDeletedMosques);
  } catch (error) {
    return [];
  }
}

function updateDeletedMosquesCount() {
  const countBadge = document.getElementById('deletedMosquesCountBadge');
  if (countBadge) {
    countBadge.textContent = getDeletedPresetMosques().length;
  }
}

const DISTRICT_CODE = {
  Osmangazi: 'OSG',
  Yıldırım: 'YLD'
};

function getSicilNo(mosque) {
  const mosquesInDistrict = PRESET_MOSQUES.filter(
    (item) => item.district === mosque.district
  );
  const registryIndex =
    mosquesInDistrict.findIndex((item) => item.id === mosque.id) + 1;
  const displayIndex =
    registryIndex > 0 ? registryIndex : mosquesInDistrict.length + 1;

  return `${DISTRICT_CODE[mosque.district] || 'DLT'}-${String(displayIndex).padStart(2, '0')}`;
}
