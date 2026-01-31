const siteData = {
    // Fotoğrafları buraya ekle. En son eklediğin her zaman en sağda (sonda) olsun.
    photos: [
        { id: 101, category: 'makro', title: 'Makro' },
        { id: 81,  category: 'portre', title: 'Portre' },
        { id: 103, category: 'renkli_doga', title: 'Doğa' },
        { id: 102, category: 'sokak', title: 'Sokak' },
        { id: 100, category: 'hayvan', title: 'Uyum' },
        { id: 92,  category: 'kulturel', title: 'Kültür' },
        { id: 90,  category: 'soyut', title: 'Soyut' }
        // Yeni fotoğraf ekleyince virgül koyup altına ekle: { id: 104, category: 'sokak', title: 'Yeni Sokak' }
    ],

    // Makaleleri buraya ekle. En yeni yazı en üstte (başta) olsun.
    articles: [
        {
            title: "Gözün Ardındaki Zihin",
            date: "28 Ocak 2026",
            category: "Kuram",
            excerpt: "Fotoğrafla olan ünsiyetimiz, makineyi dizginleme arzusuyla başlar...",
            link: "makale/gozun-ardindaki-zihin.html",
            image: "img/kitaplar.webp"
        },
        {
            title: "Siyah Beyazın Ruhuna Yolculuk",
            date: "20 Ocak 2026",
            category: "Teknik",
            excerpt: "Renklerden arındırılmış bir karede asıl hikaye ışık ve gölgenin dansıdır...",
            link: "makale/siyah-beyaz-ruh.html",
            image: "img/3.webp"
        },
        {
            title: "Yarışma Fotoğrafçılığı: Bir Sanat mı, Bir Şablon mu?",
            date: "25 Ocak 2026",
            category: "Eleştiri & Deneme",
            excerpt: "Ülkemizde fotoğraf yarışmaları, sanatsal bir keşif alanından çok bir onay mekanizmasına dönüştü.",
            link: "makale/yarisma-fotografciligi-elestiri.html",
            image: "img/28.webp"
        }
    ]
};
