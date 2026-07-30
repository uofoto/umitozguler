// changelog.js — "Yenilikler" bildirim kartının VERİ KAYNAĞI.
//
// Ana sayfadaki "Yenilikler" kartı artık HTML içine elle yazılmıyor;
// bu dosyadaki listeden OTOMATİK olarak üretiliyor ve her zaman en güncel
// 5 kaydı (mosques-data.js içindeki "yeni cami eklendi" / "bilgi kartı
// güncellendi" bildirimleriyle birlikte) tarihe göre sıralayıp gösteriyor.
//
// YENİ BİR ÖZELLİK/DÜZENLEME EKLEDİĞİNİZDE YAPMANIZ GEREKEN TEK ŞEY:
// aşağıdaki APP_CHANGELOG dizisinin BAŞINA (ya da herhangi bir yerine,
// sıralama zaten tarihe göre otomatik yapılıyor) yeni bir kayıt eklemek.
// Başka hiçbir dosyada (index.html, ui.js vb.) değişiklik yapmanıza
// GEREK YOKTUR — kart, en yeni 5 kaydı kendiliğinden bulup gösterir ve
// listenin 6. sırasına düşen eski kayıtlar otomatik olarak kartta
// görünmez olur (silmenize gerek kalmaz, geçmişi burada saklı kalır).
//
// Alanlar:
//   id      : Benzersiz, değişmeyen bir metin anahtarı (kaydı "görüldü"
//             olarak işaretlemek için kullanılır; iki kayıt aynı id'yi
//             paylaşmasın).
//   date    : ISO 8601 tarih/saat ("YYYY-MM-DDTHH:MM:SS"). Sıralama buna
//             göre yapılır; aynı gün eklenen birden çok kayıtta saatleri
//             farklı verin ki sıra karışmasın.
//   icon    : Kartta emoji olarak görünür.
//   title   : Kısa, kalın başlık.
//   desc    : Açıklama metni (düz metin yeterli; otomatik olarak HTML'e
//             güvenli şekilde işlenir).
//   details : (opsiyonel) "Detayları gör" ile açılan madde listesi
//             (string dizisi).

window.APP_CHANGELOG = [
  {
    id: 'bilgi-karti-guncellenen-camiler',
    date: '2026-07-27T11:00:00',
    icon: '📚',
    title: 'Bilgi Kartı Güncellenen Camiler',
    desc: '9 caminin bilgi kartına banisi, yapım tarihi ve ayrıntılı tarihçe bilgileri eklendi.',
    details: [
      'Nalbantoğlu Camii — Osmangazi',
      'Nakkaş Ali Mescidi — Osmangazi',
      'Molla Fenari Camii — Osmangazi',
      'Ruscuk Camii — Osmangazi',
      'Satı Fakıh (Sıdı Fakıh) Mescidi — Osmangazi',
      'Selimiye Camii — Osmangazi',
      'Şahabeddin Paşa Camii — Osmangazi',
      'Şekerhoca Camii — Osmangazi',
      'Sivaslılar (Tahtalı) Mescidi — Osmangazi'
    ]
  },
  {
    id: 'vakit-disi-namaz',
    date: '2026-07-26T21:00:00',
    icon: '🕋',
    title: '"Vakit Dışı" Namaz Seçeneği Eklendi',
    desc: 'Namaz Vakti Kaydet ekranına, kaza veya şükür namazı gibi beş vakit dışında kılınan namazları işleyebilmeniz için "Vakit Dışı" seçeneği eklendi. Bu kayıtlar da tüm istatistiklerinize dahil edilir.'
  },
  {
    id: 'bursa-disi-ziyaret',
    date: '2026-07-26T20:00:00',
    icon: '🌍',
    title: 'Bursa Dışı Ziyaret Kaydı',
    desc: 'Artık Bursa dışındaki illerde bulunan tarihi bir camide kıldığınız namazı da; caminin adını ve şehri belirterek deftere işleyebilirsiniz.'
  },
  {
    id: 'cami-arama-eklendi',
    date: '2026-07-25T12:00:00',
    icon: '🔍',
    title: 'Cami Seçim Kutusuna Arama Eklendi',
    desc: 'Namaz Vakti Kaydet ekranındaki "Cami / Mescid Seçimi" listesi artık aranabiliyor; ayrıca her ilçe kendine özgü bir renkle işaretleniyor, böylece listede ilçeden ilçeye geçişi fark etmek kolaylaştı.'
  },
  {
    id: 'cami-listesi-temizlendi',
    date: '2026-07-18T09:00:00',
    icon: '🧹',
    title: 'Cami Listesi Temizlendi',
    desc: 'Tarihi niteliği bulunmayan veya mükerrer kayıtlı 18 cami envanterden çıkarıldı; listedeki bilgiler daha doğru hale getirildi.',
    details: [
      'Armutköy Camii — Osmangazi',
      'Başçı İbrahim Camii — Osmangazi',
      'Hacı Hasan (Mecidiye) Camii — Karacabey',
      'Veziri Camii — Osmangazi',
      'Erhan Senater Camii — Osmangazi',
      'Veysel Karani Camii — Osmangazi',
      'Hacı İskender Camii — Osmangazi (2 kayıt)',
      'Ortayol (Orhangazi Vakfı) Camii — Yıldırım',
      'Hayriye Camii — Yıldırım',
      'Yeni Mahalle Camii — Yıldırım',
      'Şükraniye (Sarı) Camii — Yıldırım',
      'Hamidiye Camii — İnegöl',
      'Kurşunlu Köyü Yıldırım Camii — İnegöl',
      'Yeni Mahalle (Dere) Camii — Mustafakemalpaşa',
      'Haşim Onur Mihrahur Ali Ağa Camii — Karacabey',
      'Asmalı Mescit — Karacabey',
      'Canbolu Camii — Karacabey'
    ]
  },
  {
    id: 'istatistik-paylasim',
    date: '2026-07-14T09:00:00',
    icon: '📊',
    title: 'İstatistiklerini Paylaş',
    desc: 'Paylaşım kartı artık en son namaz kılınan camiyi ve ziyaret edilen camilerin listesini de gösteriyor. Buton, Defter → İstatistik sekmesinde daha belirgin bir yerde.'
  },
  {
    id: 'yedekleme-hatirlatmasi',
    date: '2026-07-10T09:00:00',
    icon: '🛡️',
    title: 'Yedekleme Hatırlatması Eklendi',
    desc: 'Kayıtların yalnızca bu cihazda saklandığı unutulmasın diye, birkaç değişiklikten sonra sana yedek almanı hatırlatan bir bildirim eklendi. Ayarlar\'da artık son yedekleme tarihini de görebilirsin.'
  }
];
