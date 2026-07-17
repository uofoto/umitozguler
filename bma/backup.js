// backup.js — Yedek dışa/içe aktarma ve ilerleme paylaşımı

    // === YEDEKLEME: DIŞA / İÇE AKTARMA ===
    window.exportBackup = function() {
      try {
        const payload = {
          app: "Bursa Manevi Atlası",
          version: "6.0",
          exportedAt: new Date().toISOString(),
          profileName: localStorage.getItem('manevi-atlas-username') || 'Seyyah',
          customMosques: JSON.parse(localStorage.getItem('manevi-atlas-custom-mosques') || '[]'),
          visits: visitsData
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const stamp = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `bursa-manevi-atlas-yedek-${stamp}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showToast("Yedek dosyanız indirildi.", "success");
      } catch (e) {
        showToast("Yedek oluşturulamadı. Lütfen tekrar deneyin.", "error");
      }
    };
    window.importBackup = function(input) {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const importedVisits = Array.isArray(data.visits) ? data.visits : (Array.isArray(data) ? data : null);
          if (!importedVisits) throw new Error('INVALID_FORMAT');

          if (Array.isArray(data.customMosques)) {
            data.customMosques.forEach(cm => {
              if (!PRESET_MOSQUES.some(m => m.id === cm.id)) PRESET_MOSQUES.push(cm);
            });
            localStorage.setItem('manevi-atlas-custom-mosques', JSON.stringify(data.customMosques));
            populateMosquesDropdown();
          }

          const existingIds = new Set(visitsData.map(v => v.id));
          let addedCount = 0;
          for (const rec of importedVisits) {
            if (!rec || !rec.id || existingIds.has(rec.id)) continue;
            visitsData.push(rec);
            existingIds.add(rec.id);
            await persistNewVisit(rec);
            addedCount++;
          }
          sortVisitsInMemory();
          triggerAllUIUpdates();
          showToast(addedCount > 0 ? `${addedCount} kayıt geri yüklendi.` : "Yedekte yeni kayıt bulunamadı.", "success");
        } catch (err) {
          showToast("Bu dosya geçerli bir yedek dosyası değil.", "error");
        } finally {
          input.value = '';
        }
      };
      reader.onerror = () => { showToast("Dosya okunamadı.", "error"); input.value = ''; };
      reader.readAsText(file);
    };
    // === İSTATİSTİKLERİNİ PAYLAŞ (Kişisel Karnesini Görsel Olarak Paylaş) ===
    // Kullanıcının kendi ilerlemesini (toplam vakit, ziyaret edilen cami,
    // tamamlanma yüzdesi, seri) şık bir görsel karta çizip, cihazın yerel
    // paylaşım menüsü (Instagram, WhatsApp, X vb.) üzerinden paylaşmasını
    // sağlar. Web Share API dosya paylaşımını desteklemeyen tarayıcılarda
    // görsel otomatik olarak indirilir ve özet metin panoya kopyalanır.
    function renderStatsShareCard(data) {
      return new Promise((resolve) => {
        const W = 1080, H = 1350;
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d');

        const css = getComputedStyle(document.documentElement);
        const pick = (name, fallback) => (css.getPropertyValue(name) || '').trim() || fallback;
        const tealDeep = pick('--teal-950', '#082B25');
        const teal900 = pick('--teal-900', '#0C3A32');
        const teal700 = pick('--teal-700', '#155A4C');
        const gold = pick('--gold', '#C39A45');
        const goldSoft = pick('--gold-soft', '#E7D4A0');

        // Arka plan degrade (uygulamanın hero panelindeki tonlarla aynı)
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, tealDeep);
        grad.addColorStop(0.55, teal900);
        grad.addColorStop(1, teal700);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // İnce kemer motifi (dekoratif)
        ctx.strokeStyle = 'rgba(231,212,160,0.16)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(120, H - 70);
        ctx.lineTo(120, 430);
        ctx.quadraticCurveTo(120, 190, W / 2, 190);
        ctx.quadraticCurveTo(W - 120, 190, W - 120, 430);
        ctx.lineTo(W - 120, H - 70);
        ctx.stroke();

        ctx.textAlign = 'center';

        // Üst etiket
        ctx.fillStyle = goldSoft;
        ctx.font = '600 30px sans-serif';
        ctx.fillText('BURSA MANEVİ ATLASI', W / 2, 130);

        // Unvan
        ctx.fillStyle = gold;
        ctx.font = '700 44px serif';
        ctx.fillText(data.title, W / 2, 205);

        // İsim
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 60px serif';
        ctx.fillText(data.name, W / 2, 285);

        // Büyük tamamlanma yüzdesi
        ctx.fillStyle = goldSoft;
        ctx.font = '900 168px sans-serif';
        ctx.fillText(`%${data.completionPerc}`, W / 2, 545);
        ctx.fillStyle = 'rgba(255,255,255,0.72)';
        ctx.font = '600 26px sans-serif';
        ctx.fillText('YOLCULUK TAMAMLANDI', W / 2, 600);

        // Alt istatistik sütunları
        const stats = [
          [`${data.totalVisits}`, 'Toplam Vakit'],
          [`${data.visitedCount}/${data.totalMosques}`, 'Ziyaret Edilen Cami'],
          [`🔥 ${data.streak}`, 'Gün Seri']
        ];
        const colW = W / 3;
        stats.forEach((s, i) => {
          const cx = colW * i + colW / 2;
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '800 50px sans-serif';
          ctx.fillText(s[0], cx, 780);
          ctx.fillStyle = 'rgba(255,255,255,0.68)';
          ctx.font = '600 22px sans-serif';
          ctx.fillText(s[1], cx, 815);
        });

        // Ayraç
        ctx.strokeStyle = 'rgba(231,212,160,0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(140, 870);
        ctx.lineTo(W - 140, 870);
        ctx.stroke();

        // Alt bilgi
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = '500 24px sans-serif';
        ctx.fillText('umitozguler.com.tr/bma', W / 2, H - 70);

        canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
      });
    }
    window.shareMyStats = async function() {
      try {
        if (!visitsData.length) {
          showToast("Paylaşacak istatistiğin yok. Önce bir ziyaret kaydet.", "error");
          return;
        }
        window.haptic(15);

        const totalMosques = PRESET_MOSQUES.length;
        const visitedMosqueIds = new Set(visitsData.map(v => v.mosqueId));
        const visitedCount = PRESET_MOSQUES.filter(m => visitedMosqueIds.has(m.id)).length;
        const completionPerc = totalMosques ? Math.round((visitedCount / totalMosques) * 100) : 0;
        const totalVisits = visitsData.length;
        const streak = (typeof computeStreak === 'function') ? computeStreak() : 0;
        const title = (document.getElementById('userTitle')?.textContent || 'Seyyah 🧭').trim();
        const name = localStorage.getItem('manevi-atlas-username') || 'Seyyah';

        const blob = await renderStatsShareCard({ name, title, totalVisits, streak, visitedCount, totalMosques, completionPerc });
        const stamp = new Date().toISOString().slice(0, 10);
        const fileName = `bursa-manevi-atlas-istatistik-${stamp}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });
        const shareText = `${name} - Bursa Manevi Atlası'nda ${totalVisits} vakit namaz kaydetti, ${visitedCount}/${totalMosques} tarihi camiyi ziyaret etti (%${completionPerc}). 🕌`;

        // Cihaz, dosya paylaşımını destekliyorsa (çoğu telefon) doğrudan
        // Instagram/WhatsApp/X gibi uygulamaların paylaşım menüsünü aç.
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: 'Bursa Manevi Atlası - İstatistiklerim', text: shareText });
            return;
          } catch (e) {
            if (e && e.name === 'AbortError') return; // kullanıcı paylaşımı iptal etti
            // desteklenmiyorsa aşağıdaki indirme yoluna düş
          }
        }

        // Dosya paylaşımı desteklenmiyorsa: görseli indir + özet metni panoya kopyala
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        if (navigator.clipboard) {
          try { await navigator.clipboard.writeText(shareText); } catch (e) {}
        }
        showToast("İstatistik görseli indirildi. Sosyal medyadan paylaşabilirsin.", "success");
      } catch (e) {
        showToast("İstatistik paylaşılamadı. Lütfen tekrar deneyin.", "error");
      }
    };
    // === PAYLAŞIM (Uygulamayı Tanıt ve İndirme Linkini Paylaş) ===
    window.shareProgress = async function() {
      const appUrl = "https://www.umitozguler.com.tr/bma/index.html";
      const shareTitle = "Bursa Manevi Atlası";
      const shareText = "Bursa Manevi Atlası ile Bursa'nın manevi noktalarına huzur dolu bir yolculuğa çık. Uygulamayı hemen telefonuna indir:";

      if (navigator.share) {
        try {
          await navigator.share({ title: shareTitle, text: shareText, url: appUrl });
        } catch (e) { /* kullanıcı paylaşımı iptal etti */ }
      } else if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(`${shareText}\n${appUrl}`);
          showToast("Uygulama bağlantısı panoya kopyalandı.", "success");
        } catch (e) {
          showToast("Paylaşım desteklenmiyor.", "error");
        }
      } else {
        showToast("Paylaşım bu cihazda desteklenmiyor.", "error");
      }
    };
