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
    // İki metni ortak bir satır genişliğine sığdırmak için basit kısaltma yardımcı fonksiyonu
    function fitText(ctx, text, maxWidth) {
      if (ctx.measureText(text).width <= maxWidth) return text;
      let t = text;
      while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
      return t + '…';
    }
    function renderStatsShareCard(data) {
      return new Promise((resolve) => {
        const W = 1080, H = 1580;
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

        // Büyük tamamlanma yüzdesi (biraz küçültüldü, alt bölümlere yer açmak için)
        ctx.fillStyle = goldSoft;
        ctx.font = '900 140px sans-serif';
        ctx.fillText(`%${data.completionPerc}`, W / 2, 490);
        ctx.fillStyle = 'rgba(255,255,255,0.72)';
        ctx.font = '600 24px sans-serif';
        ctx.fillText('YOLCULUK TAMAMLANDI', W / 2, 535);

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
          ctx.font = '800 46px sans-serif';
          ctx.fillText(s[0], cx, 665);
          ctx.fillStyle = 'rgba(255,255,255,0.68)';
          ctx.font = '600 21px sans-serif';
          ctx.fillText(s[1], cx, 698);
        });

        // Ayraç
        ctx.strokeStyle = 'rgba(231,212,160,0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(140, 745);
        ctx.lineTo(W - 140, 745);
        ctx.stroke();

        // === SON İBADET (en son hangi camide vakit kılındığı) ===
        let cursorY = 745;
        if (data.lastVisit) {
          cursorY = 800;
          ctx.fillStyle = goldSoft;
          ctx.font = '700 24px sans-serif';
          ctx.fillText('SON DURAK', W / 2, cursorY);

          cursorY += 55;
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '800 42px serif';
          ctx.fillText(fitText(ctx, data.lastVisit.mosqueName, W - 200), W / 2, cursorY);

          cursorY += 38;
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.font = '600 24px sans-serif';
          const subLine = [data.lastVisit.district, data.lastVisit.prayerTime, data.lastVisit.relativeDate].filter(Boolean).join('  •  ');
          ctx.fillText(subLine, W / 2, cursorY);

          cursorY += 45;
          ctx.strokeStyle = 'rgba(231,212,160,0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(140, cursorY);
          ctx.lineTo(W - 140, cursorY);
          ctx.stroke();
        }

        // === ZİYARET ETTİĞİ CAMİLER LİSTESİ ===
        if (data.visitedMosqueNames && data.visitedMosqueNames.length) {
          cursorY += 55;
          ctx.fillStyle = goldSoft;
          ctx.font = '700 24px sans-serif';
          ctx.fillText('İHYA ETTİĞİ CAMİLER', W / 2, cursorY);

          cursorY += 20;
          const listStartY = cursorY + 40;
          const rowH = 56;
          ctx.textAlign = 'left';
          data.visitedMosqueNames.forEach((name, i) => {
            const y = listStartY + i * rowH;
            // altın nokta
            ctx.fillStyle = gold;
            ctx.beginPath();
            ctx.arc(160, y - 12, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '600 30px sans-serif';
            ctx.fillText(fitText(ctx, name, W - 320), 190, y);
          });
          ctx.textAlign = 'center';

          if (data.extraMosqueCount > 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.font = '600 24px sans-serif';
            ctx.fillText(`+ ${data.extraMosqueCount} cami daha`, W / 2, listStartY + data.visitedMosqueNames.length * rowH + 5);
            cursorY = listStartY + data.visitedMosqueNames.length * rowH + 5;
          } else {
            cursorY = listStartY + (data.visitedMosqueNames.length - 1) * rowH;
          }
        }

        // Alt bilgi
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = '500 24px sans-serif';
        ctx.fillText('umitozguler.com.tr/bma', W / 2, H - 60);

        canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
      });
    }
    // Bir tarihi "Bugün / Dün / X gün önce / X ay önce" gibi göreceli metne çevirir
    function formatRelativeDate(dateStr) {
      if (!dateStr) return '';
      const then = new Date(dateStr);
      if (isNaN(then.getTime())) return '';
      const now = new Date();
      const diffDays = Math.floor((new Date(now.toDateString()) - new Date(then.toDateString())) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return 'Bugün';
      if (diffDays === 1) return 'Dün';
      if (diffDays < 30) return `${diffDays} gün önce`;
      if (diffDays < 365) return `${Math.round(diffDays / 30)} ay önce`;
      return `${Math.round(diffDays / 365)} yıl önce`;
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

        // Ziyaretleri tarih/saate göre en yeniden en eskiye sırala
        const sortedVisits = [...visitsData].sort((a, b) => {
          const da = new Date(`${a.date || ''}T${a.time || '00:00'}`);
          const db = new Date(`${b.date || ''}T${b.time || '00:00'}`);
          return db - da;
        });

        // En son namaz kılınan cami
        const lastRaw = sortedVisits[0];
        const lastVisit = lastRaw && lastRaw.mosqueName ? {
          mosqueName: lastRaw.mosqueName,
          district: lastRaw.district || '',
          prayerTime: lastRaw.prayerTime || '',
          relativeDate: formatRelativeDate(lastRaw.date)
        } : null;

        // Ziyaret edilen camilerin (tekrarsız) en yeniden en eskiye listesi
        const seenIds = new Set();
        const allVisitedNames = [];
        for (const v of sortedVisits) {
          if (!v.mosqueName || seenIds.has(v.mosqueId)) continue;
          seenIds.add(v.mosqueId);
          allVisitedNames.push(v.mosqueName);
        }
        const MAX_LISTED = 5;
        const visitedMosqueNames = allVisitedNames.slice(0, MAX_LISTED);
        const extraMosqueCount = Math.max(0, allVisitedNames.length - MAX_LISTED);

        const blob = await renderStatsShareCard({
          name, title, totalVisits, streak, visitedCount, totalMosques, completionPerc,
          lastVisit, visitedMosqueNames, extraMosqueCount
        });
        const stamp = new Date().toISOString().slice(0, 10);
        const fileName = `bursa-manevi-atlas-istatistik-${stamp}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });
        const lastVisitText = lastVisit ? ` En son ${lastVisit.mosqueName}'de namaz kıldı.` : '';
        const shareText = `${name} - Bursa Manevi Atlası'nda ${totalVisits} vakit namaz kaydetti, ${visitedCount}/${totalMosques} tarihi camiyi ziyaret etti (%${completionPerc}).${lastVisitText} 🕌`;

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
    // === İSTATİSTİK RAPORUNU PDF OLARAK İNDİR ===
    // Kullanıcının ilerleme özetini (toplam vakit, ziyaret edilen cami sayısı,
    // tamamlanma yüzdesi, seri) ve namaz kılınmış tüm camilerin isim listesini
    // (ilçe ve ziyaret sayısıyla birlikte) tek bir PDF sayfasına çizip indirir.
    // Türkçe karakterlerin (ş, ğ, ı, ç, ö, ü) PDF içinde bozulmadan görünmesi
    // için önce bir <canvas> üzerine tarayıcı fontlarıyla çiziyor, ardından bu
    // görseli jsPDF ile tek sayfalık bir PDF'e gömüyoruz.
    function buildStatsPdfData() {
      const totalMosques = PRESET_MOSQUES.length;
      const visitedMosqueIds = new Set(visitsData.map(v => v.mosqueId));
      const visitedCount = PRESET_MOSQUES.filter(m => visitedMosqueIds.has(m.id)).length;
      const completionPerc = totalMosques ? Math.round((visitedCount / totalMosques) * 100) : 0;
      const totalVisits = visitsData.length;
      const streak = (typeof computeStreak === 'function') ? computeStreak() : 0;
      const title = (document.getElementById('userTitle')?.textContent || 'Seyyah 🧭').trim();
      const name = localStorage.getItem('manevi-atlas-username') || 'Seyyah';

      const countByMosque = {};
      visitsData.forEach(v => { countByMosque[v.mosqueId] = (countByMosque[v.mosqueId] || 0) + 1; });
      const visitedMosques = PRESET_MOSQUES
        .filter(m => countByMosque[m.id])
        .map(m => ({ name: m.name, district: m.district, count: countByMosque[m.id] }))
        .sort((a, b) => a.name.localeCompare(b.name, 'tr'));

      return { name, title, totalVisits, streak, visitedCount, totalMosques, completionPerc, visitedMosques };
    }
    function renderStatsPdfCanvas(data) {
      const W = 1000;
      const rowH = 42;
      const listTop = 470;
      const H = data.visitedMosques.length
        ? listTop + 40 + data.visitedMosques.length * rowH + 90
        : listTop + 140;

      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');

      // Rapor her zaman açık (kağıt) temayla, baskıya uygun şekilde oluşturulur
      const paper = '#FAF7EF', paperCard = '#FFFFFF', ink = '#241F17', inkSoft = '#5B5445', inkFaint = '#A7A08E';
      const tealDeep = '#082B25', teal900 = '#0C3A32', line = '#E5DEC9';
      const gold = '#C39A45', goldDeep = '#8C6A22', goldSoft = '#E7D4A0';

      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, W, H);

      // Üst başlık şeridi
      const headerGrad = ctx.createLinearGradient(0, 0, W, 190);
      headerGrad.addColorStop(0, tealDeep);
      headerGrad.addColorStop(1, teal900);
      ctx.fillStyle = headerGrad;
      ctx.fillRect(0, 0, W, 190);

      ctx.textAlign = 'left';
      ctx.fillStyle = goldSoft;
      ctx.font = '600 22px sans-serif';
      ctx.fillText('BURSA MANEVİ ATLASI', 50, 55);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 34px serif';
      ctx.fillText('İstatistik Raporu', 50, 100);

      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '600 20px sans-serif';
      ctx.fillText(`${data.name} — ${data.title}`, 50, 140);

      const reportDate = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '600 16px sans-serif';
      ctx.fillText(`Oluşturulma tarihi: ${reportDate}`, W - 50, 140);
      ctx.textAlign = 'left';

      // İstatistik kutuları
      const stats = [
        [`${data.totalVisits}`, 'Toplam Vakit'],
        [`${data.visitedCount}/${data.totalMosques}`, 'Ziyaret Edilen Cami'],
        [`%${data.completionPerc}`, 'Tamamlanma'],
        [`${data.streak}`, 'Gün Serisi']
      ];
      const boxW = (W - 100 - 3 * 16) / 4;
      stats.forEach((s, i) => {
        const x = 50 + i * (boxW + 16);
        const y = 230;
        ctx.fillStyle = paperCard;
        ctx.strokeStyle = line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, boxW, 90, 14) : ctx.rect(x, y, boxW, 90);
        ctx.fill(); ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillStyle = goldDeep;
        ctx.font = '800 30px sans-serif';
        ctx.fillText(s[0], x + boxW / 2, y + 45);
        ctx.fillStyle = inkSoft;
        ctx.font = '600 13px sans-serif';
        ctx.fillText(s[1], x + boxW / 2, y + 70);
      });
      ctx.textAlign = 'left';

      // Liste başlığı
      ctx.fillStyle = ink;
      ctx.font = '800 22px serif';
      ctx.fillText('İhya Ettiği Camiler', 50, 370);
      ctx.fillStyle = inkFaint;
      ctx.font = '600 14px sans-serif';
      ctx.fillText(`Toplam ${data.visitedMosques.length} farklı cami, namaz kılınma sayısıyla birlikte`, 50, 395);

      ctx.strokeStyle = line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, 415);
      ctx.lineTo(W - 50, 415);
      ctx.stroke();

      if (data.visitedMosques.length === 0) {
        ctx.fillStyle = inkFaint;
        ctx.font = '600 16px sans-serif';
        ctx.fillText('Henüz namaz kılınmış bir cami bulunmuyor.', 50, 460);
      } else {
        data.visitedMosques.forEach((m, i) => {
          const y = listTop - 30 + i * rowH;
          if (i % 2 === 0) {
            ctx.fillStyle = 'rgba(195,154,69,0.06)';
            ctx.fillRect(40, y - 26, W - 80, rowH);
          }
          ctx.fillStyle = gold;
          ctx.beginPath();
          ctx.arc(58, y - 4, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = ink;
          ctx.font = '700 18px sans-serif';
          ctx.fillText(fitText(ctx, m.name, W - 300), 78, y);

          ctx.fillStyle = inkFaint;
          ctx.font = '600 14px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(m.district, W - 170, y);
          ctx.textAlign = 'left';

          ctx.fillStyle = teal900;
          ctx.font = '700 14px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(`${m.count} kez`, W - 50, y);
          ctx.textAlign = 'left';
        });
      }

      // Alt bilgi
      ctx.strokeStyle = line;
      ctx.beginPath();
      ctx.moveTo(50, H - 55);
      ctx.lineTo(W - 50, H - 55);
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillStyle = inkFaint;
      ctx.font = '500 15px sans-serif';
      ctx.fillText('umitozguler.com.tr/bma', W / 2, H - 25);
      ctx.textAlign = 'left';

      return canvas;
    }
    window.downloadStatsPDF = async function() {
      try {
        if (!visitsData.length) {
          showToast("PDF için önce bir ziyaret kaydet.", "error");
          return;
        }
        if (!window.jspdf || !window.jspdf.jsPDF) {
          showToast("PDF özelliği yüklenemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.", "error");
          return;
        }
        window.haptic(15);

        const data = buildStatsPdfData();
        const canvas = renderStatsPdfCanvas(data);
        const imgData = canvas.toDataURL('image/png', 1.0);

        const { jsPDF } = window.jspdf;
        const pdfWidthMM = 210; // A4 genişliği
        const pdfHeightMM = pdfWidthMM * (canvas.height / canvas.width);
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pdfWidthMM, pdfHeightMM] });
        doc.addImage(imgData, 'PNG', 0, 0, pdfWidthMM, pdfHeightMM);

        const stamp = new Date().toISOString().slice(0, 10);
        doc.save(`bursa-manevi-atlas-istatistik-${stamp}.pdf`);
        showToast("İstatistik raporu PDF olarak indirildi.", "success");
      } catch (e) {
        showToast("PDF oluşturulamadı. Lütfen tekrar deneyin.", "error");
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
