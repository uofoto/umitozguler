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
