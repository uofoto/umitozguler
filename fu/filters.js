(() => {
  'use strict';

  window.PhotoFilterLibrary = Object.freeze({
    categories: [
      { id: 'all', label: 'Tümü' },
      { id: 'nature', label: 'Doğa' },
      { id: 'light', label: 'Işık & renk' },
      { id: 'cinema', label: 'Sinematik' },
      { id: 'film', label: 'Analog film' },
      { id: 'portrait', label: 'Portre' },
    ],
    filters: [
      { id: 'water-veil', title: 'Suya tül', category: 'nature', description: 'Akış hissi veren, su renklerine duyarlı yumuşatma.', swatch: 'linear-gradient(150deg,#cde6e3,#5d9b9a 48%,#173f48)', values: { water: 88, contrast: -4, vibrance: 7 } },
      { id: 'forest-mist', title: 'Orman sisi', category: 'nature', description: 'Yeşil gölgelerde yumuşak, katmanlı sis.', swatch: 'linear-gradient(140deg,#d6ddd1,#718a74 55%,#283f35)', values: { fog: 58, fade: 8, shadows: 10, contrast: -5, temperature: -2 } },
      { id: 'deep-forest', title: 'Derin orman', category: 'nature', description: 'Zengin yeşiller, derin gölgeler ve sakin kontrast.', swatch: 'linear-gradient(145deg,#87a17c,#42644b 50%,#203c35)', values: { temperature: -7, vibrance: 24, contrast: 8, vignette: 11, shadows: -5 } },
      { id: 'forest-glow', title: 'Orman ışığı', category: 'nature', description: 'Yaprak aralarından süzülen sıcak, yumuşak ışık.', swatch: 'linear-gradient(135deg,#e9d494,#88a66a 48%,#3c5b45)', values: { exposure: 8, saturation: 8, glow: 16, sunGlow: 14, temperature: 3 } },
      { id: 'sunset', title: 'Gün batımı', category: 'nature', description: 'Ufukta amber ışık, canlı ama dengeli renkler.', swatch: 'linear-gradient(145deg,#f4c377,#e98256 50%,#704c6d)', values: { temperature: 24, saturation: 14, highlights: 10, sunGlow: 64, glow: 20 } },
      { id: 'sunrise', title: 'Gün doğumu', category: 'nature', description: 'Pastel pembe-altın aydınlık ve açık gölgeler.', swatch: 'linear-gradient(145deg,#f5d7cf,#f0b78f 50%,#8197a0)', values: { exposure: 10, temperature: 13, saturation: 7, sunGlow: 36, glow: 22, fade: 6 } },
      { id: 'golden-hour', title: 'Altın saat', category: 'nature', description: 'Alçak güneşin sıcak, yumuşak tonları.', swatch: 'linear-gradient(145deg,#f2d18c,#d99c54 52%,#765d4c)', values: { temperature: 21, saturation: 11, sunGlow: 48, glow: 17 } },
      { id: 'blue-hour', title: 'Mavi saat', category: 'nature', description: 'Alacakaranlıkta serin mavi gölgeler.', swatch: 'linear-gradient(145deg,#bac9d5,#617c9b 50%,#27394e)', values: { temperature: -20, contrast: 10, saturation: 4, vignette: 9 } },

      { id: 'vivid', title: 'Canlı renk', category: 'light', description: 'Soluk tonları seçici biçimde canlandırır.', swatch: 'linear-gradient(120deg,#e7806f,#e7cd73 35%,#679b72 68%,#687fb4)', values: { vibrance: 35, contrast: 5, sharpness: 12 } },
      { id: 'soft-glow', title: 'Yumuşak ışık', category: 'light', description: 'Parlak alanları nazikçe yayar, gölgeleri açar.', swatch: 'linear-gradient(140deg,#f6e6ce,#e9d7bf 50%,#b3c1b4)', values: { exposure: 4, shadows: 9, highlights: -10, contrast: -8, glow: 24 } },
      { id: 'airy-bright', title: 'Aydınlık', category: 'light', description: 'Temiz, havadar beyazlar ve yumuşak ton geçişleri.', swatch: 'linear-gradient(140deg,#fff9e9,#e9e8d9 50%,#c4d7d0)', values: { exposure: 18, highlights: -12, contrast: -10, glow: 14 } },
      { id: 'moody', title: 'Dingin gölge', category: 'light', description: 'Derin siyahlar ve kontrollü kenar gölgesi.', swatch: 'linear-gradient(145deg,#8e968f,#535d57 48%,#202d32)', values: { exposure: -8, contrast: 16, vignette: 16 } },
      { id: 'crisp-daylight', title: 'Net gün ışığı', category: 'light', description: 'Temiz detay, doğal kontrast ve ölçülü canlılık.', swatch: 'linear-gradient(145deg,#eee8c8,#9dc1b5 48%,#527786)', values: { contrast: 8, vibrance: 14, sharpness: 10 } },
      { id: 'cool-tone', title: 'Serin ton', category: 'light', description: 'Nötr maviler ve sakin beyaz dengesi.', swatch: 'linear-gradient(145deg,#dce7eb,#a8c2d0 55%,#607b91)', values: { temperature: -22, saturation: 3, contrast: 5 } },
      { id: 'warm-light', title: 'Sıcak ışık', category: 'light', description: 'Tenlere ve gün ışığına doğal bir sıcaklık katar.', swatch: 'linear-gradient(145deg,#f6e3bb,#e2b67d 52%,#9b7256)', values: { temperature: 18, saturation: 4, glow: 14 } },
      { id: 'pastel-matte', title: 'Pastel mat', category: 'light', description: 'Düşük kontrastlı, yumuşak ve soluk renkler.', swatch: 'linear-gradient(145deg,#e9d6cf,#c6d2bd 52%,#9da9b6)', values: { saturation: -20, contrast: -12, fade: 18 } },

      { id: 'teal-night', title: 'Teal gece', category: 'cinema', description: 'Serin gölgeler ve sinematik derinlik.', swatch: 'linear-gradient(145deg,#6ba5a0,#38666c 50%,#202e49)', values: { temperature: -10, vibrance: 24, contrast: 14, vignette: 20, glow: 13 } },
      { id: 'amber-cinema', title: 'Amber sahne', category: 'cinema', description: 'Sıcak vurgularla film karesi görünümü.', swatch: 'linear-gradient(145deg,#d7aa68,#a66d50 55%,#453d4b)', values: { temperature: 15, contrast: 12, vignette: 15, saturation: 4 } },
      { id: 'classic-noir', title: 'Klasik noir', category: 'cinema', description: 'Dramatik siyah-beyaz ve grenli gölgeler.', swatch: 'linear-gradient(145deg,#d3d2cb,#777b7a 48%,#25292d)', values: { saturation: -100, contrast: 24, vignette: 26, grain: 10 } },
      { id: 'blue-noir', title: 'Mavi noir', category: 'cinema', description: 'Soğuk gece tonları, derin ve sakin gölgeler.', swatch: 'linear-gradient(145deg,#91a2b6,#4f637c 48%,#20273a)', values: { temperature: -24, saturation: -15, contrast: 14, vignette: 21 } },
      { id: 'dream-glow', title: 'Düşsel parıltı', category: 'cinema', description: 'Işıklarda yumuşak parlama ve rüya gibi solukluk.', swatch: 'linear-gradient(145deg,#f2dfcb,#c8b7c7 52%,#879aa4)', values: { glow: 42, fade: 19, contrast: -9, saturation: -6 } },
      { id: 'action-film', title: 'Aksiyon filmi', category: 'cinema', description: 'Güçlü kontrast, canlı renk ve net detay.', swatch: 'linear-gradient(145deg,#e6b76c,#bf6849 50%,#30495a)', values: { contrast: 20, saturation: 12, vibrance: 18, sharpness: 12 } },
      { id: 'neon-night', title: 'Neon gece', category: 'cinema', description: 'Gece ışıklarında canlı renkler ve parlama.', swatch: 'linear-gradient(145deg,#f169a6,#766be1 52%,#213650)', values: { saturation: 20, vibrance: 30, contrast: 18, temperature: -8, glow: 20 } },
      { id: 'western-dusk', title: 'Tozlu gün batımı', category: 'cinema', description: 'Mat toprak tonları ve hafif analog gren.', swatch: 'linear-gradient(145deg,#d5ae77,#987958 52%,#4f4b49)', values: { temperature: 14, saturation: -9, fade: 14, vignette: 15, grain: 10 } },

      { id: '35mm', title: '35 mm film', category: 'film', description: 'Hafif film greni ve doğal, yumuşak renkler.', swatch: 'linear-gradient(145deg,#e7d1ad,#9da77e 52%,#657875)', values: { grain: 19, fade: 9, vignette: 10, saturation: -5, contrast: 3 } },
      { id: 'portra-soft', title: 'Portre film', category: 'film', description: 'Yumuşak ten tonları ve film benzeri ışık.', swatch: 'linear-gradient(145deg,#f0d5b5,#c89d87 52%,#747d72)', values: { temperature: 9, shadows: 8, highlights: -7, saturation: -2, grain: 5, glow: 8 } },
      { id: 'slide-film', title: 'Pozitif film', category: 'film', description: 'Doygun renkler ve belirgin orta ton kontrastı.', swatch: 'linear-gradient(145deg,#e9bd70,#8aaa70 48%,#627f9e)', values: { contrast: 14, saturation: 16, vibrance: 9, grain: 5 } },
      { id: 'kodak-warm', title: 'Sıcak film', category: 'film', description: 'Sıcak analog renk paleti ve ince gren.', swatch: 'linear-gradient(145deg,#edcf86,#b87d54 52%,#51685a)', values: { temperature: 9, saturation: 12, contrast: 9, grain: 6 } },
      { id: 'retro', title: 'Retro anı', category: 'film', description: 'Soluk nostalji, sıcak ton ve hafif vinyet.', swatch: 'linear-gradient(145deg,#ecd4a9,#bd9c75 52%,#6d7566)', values: { temperature: 12, saturation: -22, contrast: -5, fade: 24, vignette: 19, grain: 14 } },
      { id: 'sepia', title: 'Sepya', category: 'film', description: 'Klasik kahverengi tonlama ve nazik film dokusu.', swatch: 'linear-gradient(145deg,#d6ba88,#9d7954 52%,#574a3c)', values: { temperature: 30, saturation: -48, fade: 8, vignette: 15, grain: 10 } },
      { id: 'silver-print', title: 'Gümüş baskı', category: 'film', description: 'Siyah-beyaz analog baskı ve ölçülü gren.', swatch: 'linear-gradient(145deg,#e2e0d7,#94958d 52%,#343638)', values: { saturation: -100, contrast: 13, grain: 17 } },
      { id: 'matte-film', title: 'Mat film', category: 'film', description: 'Yumuşak siyahlar ve hafif soluk renkler.', swatch: 'linear-gradient(145deg,#e5d2c0,#aeb39d 52%,#747b83)', values: { contrast: -12, fade: 27, saturation: -8, grain: 8 } },

      { id: 'gentle-portrait', title: 'Doğal portre', category: 'portrait', description: 'Yumuşak ten ışığı ve doğal gölge dengesi.', swatch: 'linear-gradient(145deg,#f3dac8,#d6aa91 52%,#788a7a)', values: { temperature: 3, contrast: -4, highlights: -8, shadows: 10, sharpness: 4, glow: 6 } },
      { id: 'soft-skin', title: 'Yumuşak cilt', category: 'portrait', description: 'İnce gürültü azaltma ve yumuşak parlama.', swatch: 'linear-gradient(145deg,#f6e1d6,#dbb8a9 52%,#9da9a0)', values: { denoise: 11, glow: 12, saturation: -3 } },
      { id: 'warm-portrait', title: 'Sıcak portre', category: 'portrait', description: 'Doğal sıcaklık ve yumuşak arka plan kenarları.', swatch: 'linear-gradient(145deg,#f4d6b5,#d39779 52%,#63544e)', values: { temperature: 13, saturation: -3, highlights: -5, vignette: 4, glow: 10 } },
      { id: 'editorial-portrait', title: 'Editoryal portre', category: 'portrait', description: 'Dengeli kontrast ve dergi çekimi berraklığı.', swatch: 'linear-gradient(145deg,#e7d8c7,#b0a395 52%,#46535b)', values: { contrast: 11, saturation: -9, sharpness: 10, vignette: 8 } },
      { id: 'airy-portrait', title: 'Havadar portre', category: 'portrait', description: 'Açık gölgeler ve parlak, yumuşak görünüm.', swatch: 'linear-gradient(145deg,#fff2df,#efd6c3 52%,#b9c6be)', values: { exposure: 13, highlights: -14, contrast: -8, fade: 7, glow: 20 } },
      { id: 'mono-portrait', title: 'Portre noir', category: 'portrait', description: 'Yüz detaylarını koruyan siyah-beyaz tonlama.', swatch: 'linear-gradient(145deg,#e7e4dc,#93918b 52%,#3a3c40)', values: { saturation: -100, contrast: 8, vignette: 8 } },
      { id: 'cinematic-portrait', title: 'Sinematik portre', category: 'portrait', description: 'Film kontrastı ve sıcak, kontrollü ışık.', swatch: 'linear-gradient(145deg,#d8bd91,#9a7865 52%,#303d49)', values: { temperature: 8, contrast: 12, vignette: 13, glow: 12 } },
      { id: 'portrait-film', title: 'Analog portre', category: 'portrait', description: 'Ten tonlarında hafif analog sıcaklık ve gren.', swatch: 'linear-gradient(145deg,#f0d8c4,#bd9984 52%,#697267)', values: { temperature: 10, saturation: -6, fade: 10, grain: 8 } },
    ],
  });
})();
