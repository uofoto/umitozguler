// ui.js — Modallar, form akışları, sekmeler, kaydırma (swipe), lightbox, PWA kurulum ve genel arayüz yardımcıları

    // CAMİ LİSTESİ ÜSTÜNDEKİ "DOKUNARAK BİLGİ AL" İPUCU BANNER'I (bir kere gösterilir)
    function initMosqueInfoHintBanner() {
      const banner = document.getElementById('mosqueInfoHintBanner');
      if (!banner) return;
      const dismissed = localStorage.getItem('manevi-atlas-mosque-info-hint-dismissed');
      if (!dismissed) {
        banner.classList.remove('hidden');
        banner.classList.add('flex');
      }
    }
    window.dismissMosqueInfoHint = function() {
      localStorage.setItem('manevi-atlas-mosque-info-hint-dismissed', '1');
      const banner = document.getElementById('mosqueInfoHintBanner');
      if (banner) { banner.classList.add('hidden'); banner.classList.remove('flex'); }
    };
    // ANA SAYFADAKİ "YENİLİKLER" BİLDİRİM KARTI
    // Kart artık HTML içine elle yazılmıyor; changelog.js'teki APP_CHANGELOG
    // dizisinden ve envanterdeki otomatik "yeni cami eklendi" / "bilgi kartı
    // güncellendi" olaylarından üretilip, en güncel 5 kayıt gösterilir.
    // Yeni bir özellik eklediğinizde tek yapmanız gereken changelog.js'e bir
    // kayıt eklemek — bu dosyaya (ui.js) veya index.html'e dokunmanıza gerek
    // kalmaz.
    function getNewestMosqueAddedAt() {
      const withDates = PRESET_MOSQUES.filter(m => m.addedAt);
      if (withDates.length === 0) return 'none';
      return withDates.reduce((latest, m) => new Date(m.addedAt) > new Date(latest) ? m.addedAt : latest, withDates[0].addedAt);
    }
    // Envanterdeki en son eklenen tarihte eklenmiş camileri özetleyen bir
    // "Yenilikler" kaydı üretir (varsa). Kart, bu tarihten itibaren 14 gün
    // boyunca listede kalabilir (14 günden eskiyse artık "yeni" sayılmaz).
    function buildMosqueAddedEntry() {
      const newestAddedAt = getNewestMosqueAddedAt();
      if (newestAddedAt === 'none') return null;

      const now = new Date();
      const daysSinceUpdate = Math.floor((now - new Date(newestAddedAt)) / (1000 * 60 * 60 * 24));
      if (daysSinceUpdate < 0 || daysSinceUpdate > 14) return null;

      const recentNew = PRESET_MOSQUES
        .filter(m => m.addedAt === newestAddedAt)
        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
      if (recentNew.length === 0) return null;

      const districts = [...new Set(recentNew.map(m => m.district))];
      const districtText = districts.length > 1
        ? `${districts.slice(0, -1).join(', ')} ve ${districts[districts.length - 1]}`
        : districts[0];
      const namesPreview = recentNew.slice(0, 3).map(m => m.name).join(', ');
      const extra = recentNew.length > 3 ? ` ve ${recentNew.length - 3} diğeri` : '';

      return {
        id: `mosque-added-${newestAddedAt}`,
        date: newestAddedAt,
        icon: '🕌',
        title: `${recentNew.length} Yeni Cami Eklendi`,
        desc: `${escapeHtml(districtText)} bölgelerinden ${escapeHtml(namesPreview)}${escapeHtml(extra)} envantere katıldı.`
      };
    }
    // Envanterdeki en yeni "infoUpdatedAt" tarihini bulur; bir caminin bilgi
    // kartı eklendikçe/güncellendikçe bu otomatik değişir.
    function getNewestInfoUpdateDate() {
      const withDates = PRESET_MOSQUES.filter(m => m.infoUpdatedAt);
      if (withDates.length === 0) return 'none';
      return withDates.reduce((latest, m) => new Date(m.infoUpdatedAt) > new Date(latest) ? m.infoUpdatedAt : latest, withDates[0].infoUpdatedAt);
    }
    // En son güncelleme tarihinde bilgi kartı eklenen/güncellenen camileri
    // özetleyen bir "Yenilikler" kaydı üretir (varsa).
    function buildInfoUpdateEntry() {
      const newestInfoUpdate = getNewestInfoUpdateDate();
      if (newestInfoUpdate === 'none') return null;

      const now = new Date();
      const daysSinceUpdate = Math.floor((now - new Date(newestInfoUpdate)) / (1000 * 60 * 60 * 24));
      if (daysSinceUpdate < 0 || daysSinceUpdate > 14) return null;

      const recentlyUpdated = PRESET_MOSQUES
        .filter(m => m.infoUpdatedAt === newestInfoUpdate)
        .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
      if (recentlyUpdated.length === 0) return null;

      const namesPreview = recentlyUpdated.slice(0, 3).map(m => m.name).join(', ');
      const extra = recentlyUpdated.length > 3 ? ` ve ${recentlyUpdated.length - 3} diğerinin` : '';
      const title = recentlyUpdated.length === 1
        ? `${recentlyUpdated[0].name} Bilgi Kartı Yenilendi`
        : `${recentlyUpdated.length} Caminin Bilgi Kartı Yenilendi`;
      const desc = recentlyUpdated.length === 1
        ? `Yapılış tarihi, banisi ve mimari geçmişine dair ayrıntılı bilgiler eklendi.`
        : `${escapeHtml(namesPreview)}${escapeHtml(extra)} yapılış tarihi, banisi ve mimari geçmişine dair ayrıntılı bilgileri eklendi.`;

      return {
        id: `info-updated-${newestInfoUpdate}`,
        date: newestInfoUpdate,
        icon: '📖',
        title: escapeHtml(title),
        desc,
        details: recentlyUpdated.map(m => `${m.name} — ${m.district}`)
      };
    }
    // Elle yazılan (changelog.js) ve otomatik üretilen (yeni cami/bilgi
    // güncellemesi) kayıtları birleştirip tarihe göre en yeniden en eskiye
    // sıralar, sadece ilk 5'ini döndürür.
    function buildWhatsNewEntries() {
      const entries = Array.isArray(window.APP_CHANGELOG) ? window.APP_CHANGELOG.slice() : [];
      const mosqueEntry = buildMosqueAddedEntry();
      if (mosqueEntry) entries.push(mosqueEntry);
      const infoEntry = buildInfoUpdateEntry();
      if (infoEntry) entries.push(infoEntry);
      entries.sort((a, b) => new Date(b.date) - new Date(a.date));
      return entries.slice(0, 5);
    }
    function renderWhatsNewEntryHtml(entry, idx) {
      const hasDetails = Array.isArray(entry.details) && entry.details.length > 0;
      const detailsHtml = hasDetails ? `
        <button onclick="toggleWhatsNewDetail(${idx})" class="text-[10px] font-bold mt-1" style="color:var(--teal-700);">
          <span id="whatsNewToggleLabel-${idx}">Detayları gör</span> <i id="whatsNewToggleIcon-${idx}" class="fa-solid fa-chevron-down text-[8px]"></i>
        </button>
        <ul id="whatsNewDetailList-${idx}" class="hidden mt-1.5 space-y-0.5 text-[10px] leading-snug list-disc pl-4" style="color:var(--ink-soft);">
          ${entry.details.map(d => `<li>${escapeHtml(d)}</li>`).join('')}
        </ul>` : '';
      return `
        <div class="flex items-start gap-2.5">
          <span class="text-base leading-none mt-0.5">${entry.icon}</span>
          <div class="min-w-0">
            <p class="text-[11px] font-bold" style="color:var(--ink);">${entry.title}</p>
            <p class="text-[10px] leading-snug" style="color:var(--ink-soft);">${entry.desc}</p>
            ${detailsHtml}
          </div>
        </div>`;
    }
    window.toggleWhatsNewDetail = function(idx) {
      const list = document.getElementById(`whatsNewDetailList-${idx}`);
      const label = document.getElementById(`whatsNewToggleLabel-${idx}`);
      const icon = document.getElementById(`whatsNewToggleIcon-${idx}`);
      if (!list) return;
      const willShow = list.classList.contains('hidden');
      list.classList.toggle('hidden');
      if (label) label.textContent = willShow ? 'Detayları gizle' : 'Detayları gör';
      if (icon) { icon.classList.toggle('fa-chevron-down', !willShow); icon.classList.toggle('fa-chevron-up', willShow); }
    };
    function initWhatsNewBanner() {
      const banner = document.getElementById('whatsNewBanner');
      const listEl = document.getElementById('whatsNewList');
      if (!banner || !listEl) return;

      const entries = buildWhatsNewEntries();
      listEl.innerHTML = entries.map((entry, idx) => renderWhatsNewEntryHtml(entry, idx)).join('');

      const currentVersion = entries.map(e => e.id).join('|');
      window.__whatsNewCurrentVersion = currentVersion;

      const dismissedVersion = localStorage.getItem('manevi-atlas-whatsnew-dismissed');
      if (entries.length > 0 && dismissedVersion !== currentVersion) {
        banner.classList.remove('hidden');
      }
    }
    window.dismissWhatsNewBanner = function() {
      localStorage.setItem('manevi-atlas-whatsnew-dismissed', window.__whatsNewCurrentVersion || '');
      const banner = document.getElementById('whatsNewBanner');
      if (banner) banner.classList.add('hidden');
    };
    // === UYGULAMA GÜNCELLEME KONTROLÜ ===
    // Servis çalışanı (service worker), performans için statik dosyaları (cami
    // listesi, arayüz kodları vb.) cihazda önbelleğe alır. Bu sayede uygulama
    // internetsizken de açılabilir, ama sunucudaki bilgiler değiştiğinde (ör.
    // yeni bir cami eklendiğinde) cihazdaki önbellek kendiliğinden yenilenmez.
    // Bu yüzden sunucudaki küçük "version.json" dosyasını (önbelleğe hiç
    // takılmadan, doğrudan ağdan) kontrol ediyoruz; cihazda daha önce görülen
    // sürümden farklıysa kullanıcıya bir "Güncelle" bandı gösteriyoruz.
    // Sunucudaki cami/bilgi verisinin (mosques-data.js) gerçek içeriğinin bir
    // özetini (SHA-256 hash) hesaplar. Bu, "version.json" gibi elle güncellenmesi
    // gereken bir dosyaya bağlı değildir: siz mosques-data.js'i sunucuya her
    // yüklediğinizde (tek bir harf bile değişse) bu özet otomatik olarak
    // değişir. Böylece güncelleme tespiti tamamen otomatikleşir; sizin ayrıca
    // bir sürüm numarası/metni girmenizi gerektirmez.
    async function computeContentHash() {
      const res = await fetch(`./mosques-data.js?__freshcheck=1&t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('mosques-data.js alınamadı');
      const text = await res.text();
      const encoded = new TextEncoder().encode(text);
      const digest = await crypto.subtle.digest('SHA-256', encoded);
      return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
    }
    async function checkForAppUpdate(manualTrigger = false) {
      try {
        // Sürüm kontrolüyle eş zamanlı olarak servis çalışanının da sunucudaki
        // sw.js'i kontrol etmesini tetikle. Böylece sadece içerik değil,
        // servis çalışanının kendisi değiştiyse de en erken şekilde fark edilir.
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then((reg) => {
            if (reg) reg.update().catch(() => {});
          }).catch(() => {});
        }

        // version.json artık ZORUNLU değil: sadece varsa, ayarlardaki "Uygulama
        // Sürümü" rozetinde okunaklı bir etiket göstermek için kullanılır.
        // Güncelleme olup olmadığı kararı buna bağlı DEĞİLDİR — bu dosyayı
        // güncellemeyi unutsanız bile aşağıdaki içerik özeti kontrolü sayesinde
        // uygulama gerçek değişikliği kendiliğinden fark eder.
        let displayVersion = null;
        try {
          const vres = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' });
          if (vres.ok) {
            const vdata = await vres.json();
            displayVersion = vdata.version || null;
          }
        } catch (e) { /* version.json yoksa sorun değil, sessizce geç */ }

        const remoteHash = await computeContentHash();
        window.__remoteAppVersion = displayVersion || remoteHash;
        window.__remoteContentHash = remoteHash;

        const localHash = localStorage.getItem('manevi-atlas-content-hash');
        updateVersionBadge(displayVersion || localHash || remoteHash);

        // Cihazda bu içerik takibi özelliğinden önce yüklenmiş, zaten bir
        // servis çalışanı tarafından kontrol edilen (dolayısıyla önbellekte
        // eski dosyalar barındırma ihtimali olan) bir sayfa olabilir. Böyle
        // bir durumda "localHash boş, o yüzden ilk kurulumdur" varsayıp
        // sessizce "güncel" demek YANLIŞ ve yanıltıcıdır. Bu yüzden sadece
        // gerçekten hiçbir servis çalışanı kaydı yokken (yani cihazda
        // önbellek de yoksa) sessiz ilk-kurulum varsayımını yap.
        const hasExistingController = ('serviceWorker' in navigator) && !!navigator.serviceWorker.controller;
        if (!localHash && !hasExistingController) {
          localStorage.setItem('manevi-atlas-content-hash', remoteHash);
          if (manualTrigger) showToast("Uygulama güncel.", "success");
          return false;
        }

        if (localHash !== remoteHash) {
          if (manualTrigger) {
            // Kullanıcı elle "güncellemeyi kontrol et" dediyse, bandı göster ve
            // ona haber ver — ama karar yine kendisine bırakılır.
            const banner = document.getElementById('appUpdateBanner');
            if (banner) banner.classList.remove('hidden');
            showToast("Yeni bir güncelleme bulundu.", "success");
          } else {
            // OTOMATİK GÜNCELLEME: Uygulama açılışında sessizce fark tespit edildi.
            // Kullanıcının ayrıca bir bandı fark edip tıklamasını beklemeden,
            // güncellemeyi hemen kendiliğinden uygula. Namaz kayıtları IndexedDB'de
            // tutulduğundan bu işlem hiçbir veri kaybına yol açmaz; sadece
            // uygulamanın kod/veri önbelleğini tazeler ve sayfayı bir kez yeniler.
            // Sonsuz döngüyü önlemek için applyAppUpdate, yeniden yüklemeden önce
            // yerel özet değerini güncel değerle eşitler.
            if (typeof window.applyAppUpdate === 'function') {
              window.applyAppUpdate();
            }
          }
          return true;
        } else if (manualTrigger) {
          showToast("Uygulama zaten güncel.", "success");
        }
        return false;
      } catch (e) {
        if (manualTrigger) showToast("Güncelleme kontrol edilemedi. İnternet bağlantınızı kontrol edin.", "error");
        return false;
      }
    }
    // Ayarlar sayfasındaki "Uygulama Sürümü: …" etiketini günceller. Bu, bir
    // sorun bildirirken ("telefonumda hangi sürüm çalışıyor?") tek bakışta
    // cevap verebilmeyi sağlar — konsol veya kaynak koda bakmaya gerek kalmaz.
    function updateVersionBadge(version) {
      const el = document.getElementById('appVersionBadge');
      if (el && version) el.textContent = version;
    }
    window.updateVersionBadge = updateVersionBadge;
    window.checkForAppUpdate = checkForAppUpdate;
    window.dismissAppUpdateBanner = function() {
      const banner = document.getElementById('appUpdateBanner');
      if (banner) banner.classList.add('hidden');
    };
    // Kullanıcı "Güncelle" butonuna bastığında: cihazdaki tüm eski önbellekleri
    // temizler, sürüm numarasını günceller ve sayfayı sıfırdan (ağdan) yeniden
    // yükler. Bu, cami defteri (ziyaret kayıtları) IndexedDB'de tutulduğu için
    // hiçbir kayıt kaybına yol açmaz — sadece uygulamanın kendi kodunu ve
    // cami listesini en güncel haliyle yeniden indirir.
    window.applyAppUpdate = async function() {
      try {
        window.haptic(15);
        showToast("Güncelleniyor...", "success");

        // Tercih edilen yol: sunucuda hazır bekleyen bir servis çalışanı varsa
        // (bkz. 'updatefound' dinleyicisi), ona nazikçe devral mesajı gönder.
        // Devrettiğinde 'controllerchange' olayı sayfayı zaten yenileyecek.
        if (window.__pendingSW) {
          window.__pendingSW.postMessage('SKIP_WAITING');
          if (window.__remoteContentHash) {
            localStorage.setItem('manevi-atlas-content-hash', window.__remoteContentHash);
          }
          return;
        }

        // Yedek yol: bekleyen bir SW henüz tespit edilmediyse (ör. sadece
        // version.json değişmiş, veya SW kontrolü daha tamamlanmadıysa) eski
        // yöntemle tüm önbellekleri temizleyip sayfayı sıfırdan yeniden yükle.
        // Bu durumda da hiçbir kayıt kaybı olmaz; cami kayıtları IndexedDB'de,
        // bu temizlik yalnızca uygulamanın kendi kod/veri önbelleğini kapsar.
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg) await reg.update().catch(() => {});
        }
        if (window.__remoteContentHash) {
          localStorage.setItem('manevi-atlas-content-hash', window.__remoteContentHash);
        }
        setTimeout(() => { window.location.reload(); }, 250);
      } catch (e) {
        showToast("Güncelleme uygulanamadı. Lütfen tekrar deneyin.", "error");
      }
    };
    // Envanterde ayrıntılı kaydı bulunmayan mabetler için dürüst, genel bir tanıtım metni üretir
    function getMosqueInfo(m) {
      if (MOSQUE_INFO_OVERRIDES[m.id]) return MOSQUE_INFO_OVERRIDES[m.id];
      if (MOSQUE_INFO[m.id]) return MOSQUE_INFO[m.id];
      // MOSQUE_INFO sözlüğünde ayrı bir kayıt yoksa, caminin kendi nesnesine
      // doğrudan eklenmiş "info" alanını kullan (mosques-data.js'e iki farklı
      // yoldan bilgi eklenebilir; ikisi de burada birleştirilir). period/founder
      // ayrıca girilmediyse dürüst bir yer tutucu metin gösterilir.
      if (m.info) {
        return {
          period: m.period || "Kesin yapım tarihi envanterimizde kayıtlı değil",
          founder: m.founder || "Banisi hakkında doğrulanmış bir kayıt henüz eklenmedi",
          info: m.info
        };
      }
      return {
        period: "Kesin yapım tarihi envanterimizde kayıtlı değil",
        founder: "Banisi hakkında doğrulanmış bir kayıt henüz eklenmedi",
        info: `${escapeHtml(m.name)}, Bursa'nın ${m.district} ilçesindeki tescilli tarihi cami ve mescidlerinden biridir. Bu mabetle ilgili yapım tarihi, banisi ve mimari geçmişine dair ayrıntılı bilgiler Vakıflar Genel Müdürlüğü ve yerel kültür envanteri kayıtlarında yer almaktadır; bu kayıtlar uygulamamıza henüz eklenmemiştir.`
      };
    }
 // YENİ EKLENEN: GÜNÜN AYETLERİ DİZİSİ
    const QURAN_VERSES = [
      { text: "\"Ki onlar gaybe iman eder, namazı dosdoğru kılar ve kendilerine rızık olarak verdiğimiz şeylerden harcarlar.\"", source: "Bakara / 3. Ayet" },
      { text: "\"Sonra Âdem, Rabbinden öğrendiği sözlerle Allah’a yalvardı, tevbe etti, Allah da tevbesini kabul buyurdu. Doğrusu O, tevbeleri çok kabul eden, nihâyetsiz merhamet sahibi olandır.\"", source: "Bakara / 37. Ayet" },
      { text: "\"Namazı dosdoğru kılın, zekâtı verin ve rukû edenlerle beraber siz de rukû edin.\"", source: "Bakara / 43. Ayet" },
      { text: "\"Sabır ve namazla Allah’tan yardım isteyin. Doğrusu namaz çok ağır ve çetin bir iştir. Ancak o, Allah’a duyduğu derin saygıdan kalbi ürperenlere ağır gelmez.\"", source: "Bakara / 45. Ayet" },
      { text: "\"Onlar, kendilerinin Rablerine kavuşacaklarını ve günün birinde O’na döneceklerini kesinlikle bilen kimselerdir.\"", source: "Bakara / 46. Ayet" },
      { text: "\"Hani biz, İsrâiloğulları’ndan: 'Sadece Allah’a kulluk edeceksiniz, ana-babaya, akrabaya, yetimlere, yoksullara iyilikte bulunacaksınız!' diye söz almış ve: 'İnsanlara güzel söz söyleyin, namazı hakkıyla kılın, zekâtı verin!' diye emretmiştik. Sonra sizden pek azı müstesna, sözünüzden döndünüz ve hâlâ yüz çevirmeye devam ediyorsunuz.\"", source: "Bakara / 83. Ayet" },
      { text: "\"Namazı dosdoğru kılın ve zekâtı verin. Kendiniz için önceden her ne iyilik yaparsanız, mükâfatını Allah’ın yanında bulacaksınız. Çünkü Allah, bütün yaptıklarınızı görmektedir.\"", source: "Bakara / 110. Ayet" },
      { text: "\"Doğu da Allah’ındır, batı da. O halde nereye dönerseniz dönün, Allah’a yönelmiş olur, O’nu karşınızda bulursunuz. Elbette Allah lutf u keremi çok geniş olan ve her şeyi hakkıyla bilendir.\"", source: "Bakara / 115. Ayet" },
      { text: "\"Biz Kâbe’yi, insanlar için toplanıp sevap kazanma yeri ve emniyetli bir mekân kıldık. Öyleyse siz de İbrâhim’in makâmını namazgâh edinin. Zâten İbrâhim’le İsmâil’e de: 'Tavaf edenler, ibâdet kastıyla orada kalanlar, rükû ve secde edenler için evimi tertemiz tutun!' diye emretmiştik.\"", source: "Bakara / 125. Ayet" },
      { text: "\"İnsanlardan bir takım beyinsizler: 'Müslümanları, şimdiye kadar yöneldikleri kıbleden vazgeçiren sebep nedir?' diyecekler. De ki: 'Doğu da Allah’ındır, batı da. O, dilediğini doğru yola kavuşturur.'\"", source: "Bakara / 142. Ayet" },
      { text: "\"Böylece sizi, bütün insanlara şâhit ve örnek olasınız, Peygamber de size şâhit ve örnek olsun diye dengeli mutedil bir ümmet kıldık. Senin daha önce de yöneldiğin Kâbe’yi yeniden kıble yapmamızın sebebi, Peygamber’e uyanları, ökçesi üzerinde tekrar eski dinlerine dönecek olanlardan ayırmak içindir. Kıblenin değiştirilmesi, Allah’ın doğru yola ilettiklerinden başkalarına elbette ağır gelir. Allah sizin imanınızı, önceden Beyt-i Makdis’e yönelerek kıldığınız namazları zâyi etmeyecektir. Çünkü Allah, insanlara çok şefkatli, çok merhametlidir.\"", source: "Bakara / 143. Ayet" },
      { text: "\"Rasûlüm! Biz, kıbleyle alakalı vahiy ümidiyle yüzünü sık sık göğe doğru çevirip durduğunu elbette görüyoruz. Şimdi seni râzı olacağın bir kıbleye döndürüyoruz. Bundan böyle namazda yüzünü Mescid-i Harâm’a doğru çevir. Ey mü’minler! Siz de nerede olursanız olun, namaz kılarken yüzünüzü o yöne çevirin. Kendilerine kitap verilenler, bunun Rablerinden gelen bir gerçek olduğunu çok iyi bilirler. Allah, onların yaptıklarından habersiz değildir.\"", source: "Bakara / 144. Ayet" },
      { text: "\"Her milletin yöneldiği bir kıblesi vardır. Siz hep hayırlı işler yapmada birbirinizle yarışın! Nerede olursanız olun, Allah hepinizi huzurunda bir araya getirecektir. Çünkü Allah’ın her şeye gücü yeter.\"", source: "Bakara / 148. Ayet" },
      { text: "\"O halde siz beni anın, ben de sizi anayım. Bana şükredin ve sakın nimetlerime nankörlük etmeyin.\"", source: "Bakara / 152. Ayet" },
      { text: "\"Ey iman edenler! Sabrederek ve namaz kılarak Allah’tan yardım isteyin! Çünkü Allah, sabredenlerle beraberdir.\"", source: "Bakara / 153. Ayet" },
      { text: "\"Yüzlerinizi doğu ya da batı tarafına çevirmeniz iyilik değildir. Asıl iyilik; Allah’a, âhiret gününe, meleklere, kitaplara ve peygamberlere inanan; malını sevdiği halde akrabasına, yetimlere, yoksullara, yolda kalan gariplere, dilenenlere, hürriyetine kavuşmak isteyen köle ve esirlere veren; namazı dosdoğru kılıp zekâtı ödeyen; antlaşma yaptığında sözünde duran; sıkıntı, darlık, hastalık ve şiddetli savaş zamanlarında sabredenlerin yaptığıdır. Kulluklarında samimi ve dürüst olanlar işte bunlardır; gerçek takvâ sahipleri de yine bunlardır.\"", source: "Bakara / 177. Ayet" },
      { text: "\"Rasûlüm! Kullarım sana beni sorarlarsa, şüphesiz ben onlara çok yakınım. Bana dua edenin duasına icâbet ederim. Öyleyse onlar da benim dâvetime uysunlar ve bana iman etsinler. Böyle yaparlarsa, en doğru yolu bulmuş olurlar.\"", source: "Bakara / 186. Ayet" },
      { text: "\"Namazları, özellikle orta namazı vaktinde, eksiksiz ve şartlarına uygun olarak kılmaya devam edin. Allah’ın huzurunda derin bir saygıyla el bağlayıp divan durun.\"", source: "Bakara / 238. Ayet" },
      { text: "\"Eğer bir korku ve tehlike söz konusu olursa namazınızı yürürken veya binek üzerinde kılabilirsiniz. Emniyete kavuştuğunuzda ise, bilmediklerinizi size öğrettiği şekilde Allah’ı zikredin; namazı şartlarına uygun olarak kılın.\"", source: "Bakara / 239. Ayet" },
      { text: "\"Allah ki, O’ndan başka hiçbir ilâh yoktur. O, ebedî diridir. Varlığı kendinden olup bütün kâinatı yönetendir. O’nu ne bir uyuklama ne de bir uyku yakalayabilir. Göklerde ve yerde ne varsa hepsi O’nundur. İzni olmadan O’nun huzurunda kim kalkıp da şefaat edebilir? O, kullarının geleceğini de bilir, geçmişini de. Kullar ise, dilediği dışında O’nun ilminden hiçbir şeyi kavrayamazlar. O’nun kürsüsü, gökleri ve yeri kuşatmıştır. Dolayısıyla her ikisini de koruyup gözetmek O’na asla ağır gelmez. En yüce ve en büyük yalnız O’dur.\"", source: "Bakara / 255. Ayet" },
      { text: "\"İman edip sâlih ameller işleyen, namazı dosdoğru kılıp zekâtı verenler yok mu, işte onların Rableri katında mükâfatları vardır. Onlara hiçbir korku yoktur ve onlar asla üzülmeyeceklerdir.\"", source: "Bakara / 277. Ayet" },
      { text: "\"Allah, kimseyi gücünün yetmeyeceği şeyle sorumlu tutmaz. Herkesin yaptığı iyilik kendi yararına, işlediği günahlar da kendi zararınadır. O mü’minler, niyazlarına şöyle devam etiler: 'Rabbimiz! Unutur veya hata edersek bizi cezalandırma! Rabbimiz! Bizden öncekilere yüklediğin gibi bize de ağır bir yük yükleme! Rabbimiz! Kaldıramayacağımız şeyleri de bize yükleme! Günahlarımızı affet, bizi bağışla, bize merhamet et! Sen bizim sahibimiz ve yardımcımızsın. Kâfirler gürûhuna karşı bize yardım eyle!'\"", source: "Bakara / 286. Ayet" },
      { text: "\"Zekeriya, mâbette durmuş namaz kılarken melekler ona şöyle seslendi: 'Allah sana Yahya isminde bir evladın olacağını müjdeliyor. O, Allah’tan bir kelime olan İsa’yı doğrulayacak, hem kavminin efendisi olacak, dünya zevklerinden uzak bir hayat sürecek, hem de sâlih kullar arasından seçilmiş bir peygamber olacaktır.'\"", source: "Âl-i İmrân / 39. Ayet" },
      { text: "\"Ey iman edenler! Sarhoş iken ne söylediğinizi bilecek derecede ayıkıncaya, cünüp iken de -yolcu olanlarınız hâriç- yıkanıncaya kadar namaza yaklaşmayın. Eğer hasta ya da yolcu iseniz veya sizden biriniz abdestini bozmuşsa veyahut kadınlarınızla cinsî münâsebette bulunmuşsanız; bu durumlarda abdest alacak veya yıkanacak su bulamazsanız, o zaman temiz bir toprakla teyemmüm edin: yüzünüzü ve kollarınızı onunla meshedin. Doğrusu Allah, çok affedici, çok bağışlayıcıdır.\"", source: "Nisâ / 43. Ayet" },
      { text: "\"Allah, düşmanlarınızın kimler olduğunu sizden daha iyi bilir. Gerçek dost olarak Allah yeter, yardımcı olarak da Allah yeter!\"", source: "Nisâ / 45. Ayet" },
      { text: "\"Ne zaman savaş izni verileceğini sorup durdukları bir zamanda kendilerine: 'Şimdilik elinizi savaştan çekin, namazı dosdoğru kılın ve zekâtı verin' denilen kimseleri görmedin mi? Nihâyet üzerlerine savaş farz kılınınca içlerinden bir kısmının, Allah’tan korkar gibi, hatta daha da fazla insanlardan korkmaya başladığını ve: 'Rabbimiz, bize savaşı niçin farz kıldın? Bize biraz daha mühlet verseydin olmaz mıydı?' dediklerini görürsün. Onlara de ki: 'Dünyanın menfaati pek azdır ve kısa bir süre içindir. Âhiret ise, Allah’a karşı gelmekten sakınanlar için bütünüyle hayırdır ve size orada kıl kadar bile bir haksızlık yapılmaz.'\"", source: "Nisâ / 77. Ayet" },
      { text: "\"Yeryüzünde sefere çıktığınız zaman, kâfirlerin size bir fenâlık yapmasından korkarsanız, namazı kısaltmanızda üzerinize bir günah yoktur. Şüphesiz kâfirler, sizin apaçık düşmanınızdır.\"", source: "Nisâ / 101. Ayet" },
      { text: "\"Rasûlüm! Savaşta mü’minler arasında bulunup onlara namaz kıldırdığın zaman, onlardan bir grup silahlarını da yanlarına alarak seninle beraber namaza dursunlar. Bu esnâda diğer grup düşmanı gözetlesin. Namaz kılan grup secde yapıp rekâtı tamamlayınca, düşmanı gözetlemek üzere arka tarafa geçsin. Sonra henüz namaz kılmamış olan diğer grup gelsin ve seninle beraber namazlarını kılsınlar. Hem yer değiştirirken hem de namaz esnâsında ihtiyat tedbirlerini alsınlar, silahlarını da yanlarında bulundursunlar. Çünkü kâfirler, silahlarınızı ve teçhîzâtınızı unutup bırakmanızı, böylece âni bir baskınla üzerinize saldırmayı çok arzu ederler. Ancak yağmur-çamurdan dolayı sıkıntıya düşerseniz, yahut hasta iseniz namaz kılarken silahlarınızı yere bırakmanızda size bir vebâl yoktur. Fakat yine de gelebilecek tehlikelere karşı tedbiri elden bırakmayın. Şüphesiz ki Allah, kâfirler için pek alçaltıcı bir azap hazırlamıştır.\"", source: "Nisâ / 102. Ayet" },
      { text: "\"Korku hâlinde kıldığınız namazı bitirince ayakta iken, otururken ve yanlarınız üzerine yatarken Allah’ı zikredin. Korkudan emîn olduğunuz vakit ise artık namazı normal zamandaki şartlarına uyarak dosdoğru kılın. Çünkü namaz, mü’minler üzerine vakitleri belirlenmiş farz bir ibâdetdir.\"", source: "Nisâ / 103. Ayet" },
      { text: "\"Münafıklar, kendilerince güyâ Allah’ı aldatmaya çalışıyorlar. Oysa Allah, onların hilelerini sürekli kendi başlarına çeviriyor. Onlar namaza kalktıklarında tembel tembel kalkarlar, insanlara gösteriş yaparlar ve Allah’ı da pek az hatırlarına getirirler.\"", source: "Nisâ / 142. Ayet" },
      { text: "\"Fakat onlardan ilimde derinleşmiş olanlar ile, sana indirilene ve senden önce indirilen kitaplara iman eden mü’minlere; özellikle namazı dosdoğru kılan, zekâtı veren, Allah’a ve âhiret gününe iman edenlere pek büyük bir mükâfat vereceğiz.\"", source: "Nisâ / 162. Ayet" },
      { text: "\"Ey iman edenler! Namaza kalktığınızda yüzlerinizi, dirseklere kadar ellerinizi ve kollarınızı yıkayın, başınıza meshedin ve topuklara kadar da ayaklarınızı yıkayın! Eğer cünüp iseniz güzelce yıkanıp temizlenin. Şayet hasta veya yolcu olursanız yahut biriniz tuvaletten gelirse ya da eşlerinizle cinsî münâsebette bulunur da, abdest veya gusül almanız gereken böyle durumlarda su bulamazsanız, o zaman temiz toprağa ellerinizi sürüp onunla yüzlerinizi ve dirseklere kadar kollarınızı meshedin. Bu tür emirlerle Allah size güçlük çıkarmak istemez; bilakis şükredesiniz diye sizi tertemiz kılmak ve size olan nimetini tamamlamak ister.\"", source: "Mâide / 6. Ayet" },
      { text: "\"Allah İsrâiloğulları’ndan kesin ve bağlayıcı bir söz almıştı. Biz onlardan, her bir kabileye bir kişi olmak üzere on iki temsilci tâyin etmiştik. Allah şöyle buyurmuştu: 'Ben elbette sizinle beraberim. Şayet namazı dosdoğru kılar, zekâtı verir, peygamberlerime inanır, onları bütün gücünüzle destekler ve Allah rızâsı için güzel bir borç verirseniz ben de mutlaka sizin günahlarınızı bağışlar ve sizi altlarından ırmaklar akan cennetlere yerleştiririm. Artık bundan sonra hanginiz inkâra saplanırsa, dümdüz yolun ortasında kesinlikle sapıtmış olur.'\"", source: "Mâide / 12. Ayet" },
      { text: "\"Sizin dostunuz ancak Allah, O’nun Peygamberi, bir de Allah’a tam boyun eğerek namazı dosdoğru kılan ve zekâtı veren mü’min­lerdir.\"", source: "Mâide / 55. Ayet" },
      { text: "\"Siz ezan okuyup namaza dâvette bulunduğunuz zaman onu alay ve eğlence konusu yaparlar. Çünkü onlar, akletmeyen ve gerçeği anlamayan bir topluluktur.\"", source: "Mâide / 58. Ayet" },
      { text: "\"Hiç şüphesiz şeytan içki ve kumar yoluyla sizin aranıza ancak düşmanlık ve kin bırakmak, sizi Allah’ı zikretmekten ve namaz kılmaktan alıkoymak ister. Artık bunlardan vazgeçtiniz, değil mi?\"", source: "Mâide / 91. Ayet" },
      { text: "\"Ey iman edenler! Birinize ölüm gelip çattığı zaman vasiyet esnâsında sizden adâletli iki kişi; şâyet ölüm musîbeti yolculuk yaparken sizi yakalarsa sizden olmayanlardan iki kişi aranızda şâhitlik yapsın. Eğer şâhitlerden şüphelenirseniz, namazdan sonra onları alıkoyun ve kendilerine şöyle yemin ettirin: 'Vallahi, akrabamız bile olsa biz yeminimizi hiçbir menfaat karşılığında satmayız ve Allah’ın emâneti olan bu şâhitliği de asla gizlemeyiz. Böyle yaparsak mutlaka günahkârlardan oluruz.'\"", source: "Mâide / 106. Ayet" },
      { text: "\"Yine bize: Namazı dosdoğru kılın ve Allah’a karşı gelmekten sakının, diye emredildi. O Allah ki, sonunda O’nun huzurunda toplanacaksınız.\"", source: "En'âm / 72. Ayet" },
      { text: "\"İşte bu Kur’an, kendinden önceki kitapları doğrulayan, şehirlerin anası olan Mekke halkını ve çevresinde bulunan herkesi uyarman için indirdiğimiz feyiz ve bereket kaynağı bir kitaptır. Âhirete inananlar ona da inanır ve namazlarını vaktinde dosdoğru kılmaya devam ederler.\"", source: "En'âm / 92. Ayet" },
      { text: "\"De ki: 'Şüphesiz benim namazım, bütün ibâdetlerim, hayatım ve ölümüm, Âlemlerin Rabbi Allah içindir.'\"", source: "En'âm / 162. Ayet" },
      { text: "\"Rabbinize yalvara yakara ve gizlice dua edin. Çünkü O, aşırı gidenleri sevmez.\"", source: "A'râf / 55. Ayet" },
      { text: "\"Kitaba sımsıkı sarılanlar ve namazı dosdoğru kılanlara gelince, şüphesiz ki biz, hem kendilerinin, hem de toplumun ıslahına adanmışların mükâfatını asla zâyi etmeyiz.\"", source: "A'râf / 170. Ayet" },
      { text: "\"Rabbini sabah akşam içten içe, boyun büküp yalvara yakara, derin bir ürpertiyle ve ancak kendin işitebileceğin bir sesle zikret! Sakın gâfillerden olma!\"", source: "A'râf / 205. Ayet" },
      { text: "\"Onlar namazlarını dosdoğru kılarlar, kendilerine verdiğimiz nimetlerden Allah yolunda harcarlar.\"", source: "Enfâl / 3. Ayet" },
      { text: "\"Onların Kâbe’deki ibâdetleri, ıslık çalmak ve el çırpmaktan başka bir şey değildir. Öyleyse inkâr etmenizden dolayı tadın azabı!\"", source: "Enfâl / 35. Ayet" },
      { text: "\"O haram aylar sona erince müşrikleri bulduğunuz yerde öldürün, onları yakalayın, esir edin, geçebilecekleri bütün yolları ve geçitleri tutup kendilerini kontrol altında bulundurun. Eğer şirkten vazgeçer, namazı kılar ve zekâtı verirlerse yollarını serbest bırakın. Şüphesiz Allah, çok bağışlayıcıdır, engin merhamet sahibidir.\"", source: "Tevbe / 5. Ayet" },
      { text: "\"Her şeye rağmen eğer tevbe edip yaptıklarından vazgeçer, namazı kılar ve zekâtı verirlerse, bu takdirde onlar sizin din kardeşlerinizdir. Biz, bilip anlayacak kimseler için âyetleri böyle ayrıntılarıyla açıklıyoruz.\"", source: "Tevbe / 11. Ayet" },
      { text: "\"Allah’ın mescitlerini ancak Allah’a ve âhiret gününe inanan, namazı dosdoğru kılan, zekâtı veren ve sadece Allah’tan korkan kimseler gerçek mânada îmâr edebilir. Doğru yola ermiş olmaları umulanlar işte bunlardır.\"", source: "Tevbe / 18. Ayet" },
      { text: "\"Onların yaptığı bağışların kabul edilmesine engel olan şey, Allah’ı ve Rasûlü’nü inkâr etmeleri, namaza tembel tembel gelmeleri ve bağışlarını gönülsüz olarak zorlana zorlana yapmalarıdır.\"", source: "Tevbe / 54. Ayet" },
      { text: "\"Mü’min erkekler ve mü’min kadınlar birbirlerinin dostu ve yardımcısıdırlar. İyiliği emir ve tavsiye eder, kötülüklerin önünü almaya çalışırlar. Namazı dosdoğru kılar, zekâtı verir, Allah’a ve Rasûlü’ne itaat ederler. İşte onlar, kendilerine Allah’ın merhametle muâmele edeceği seçkin kimselerdir. Şüphesiz ki Allah, kudreti dâimâ üstün gelen, her işi ve hükmü hikmetli ve sağlam olandır.\"", source: "Tevbe / 71. Ayet" },
      { text: "\"Onlardan ölen hiç kimsenin cenâze namazını kılma ve hakkında dua etmek maksadıyla kabrinin başında da durma. Çünkü onlar Allah ve Rasûlü’nü inkâr etmişler ve yoldan çıkmış kimseler olarak ölmüşlerdir.\"", source: "Tevbe / 84. Ayet" },
      { text: "\"Mûsâ ve kardeşine şöyle vahyettik. 'Mısır’da kavminiz için evler hazırlayın. Bu evlerinizi birbirleriyle irtibatlı, topluca namaz kılınacak ortak mekânlar ve toplantılarınızın yapılacağı merkezî yerler hâline getirin. Namazlarınızı da bu evlerde cemaatle ve dosdoğru kılın. Ey Mûsâ, mü’minleri müjdele!'\"", source: "Yunus / 87. Ayet" },
      { text: "\"Dediler ki: 'Ey Şuayb! Atalarımızın tapageldiği putlarımızı bir yana bırakmamızı veya bizzat kendi mallarımızı dilediğimiz gibi kullanmaktan vazgeçmemizi sana namazın mı emrediyor? Bunu senden beklemezdik. Çünkü sen yumuşak huylu, vakur, aklı başında bir adamsın.'\"", source: "Hûd / 87. Ayet" },
      { text: "\"Gündüzün iki tarafında ve gecenin gündüze yakın saatlerinde namazı dosdoğru kıl. Şüphesiz ki iyilikler kötülükleri giderir. Bu buyruklar, ibret ve öğüt almasını bilenlere bir hatırlatmadır.\"", source: "Hûd / 114. Ayet" },
      { text: "\"Onlar, Rablerinin rızâsını kazanmak için her türlü sıkıntıya sabreder, namazı dosdoğru kılar, kendilerine verdiğimiz rızıklardan gizlice ve açıktan Allah yolunda harcar, kötülüğü iyilik yaparak kendilerinden uzaklaştırırlar. Dünyanın sonunda güzel bir hayat işte böyle kimseleri beklemektedir.\"", source: "Ra'd / 22. Ayet" },
      { text: "\"Rasûlüm! İman eden kullarıma söyle: İçinde hiçbir alışverişin bulunmadığı, dostluğun fayda vermediği o dehşetli kıyâmet günü gelip çatmadan namazlarını dosdoğru kılsınlar ve kendilerine verdiğimiz rızıklardan Allah yolunda gizlice ve açıktan harcasınlar!\"", source: "İbrahim / 31. Ayet" },
      { text: "\"Rabbimiz! Ben zürriyetimden bir kısmını senin her türlü hürmete lâyık Mukaddes Evin’in yanında ekin bitmeyen bir vâdiye yerleştirdim. Rabbimiz, namazı dosdoğru kılsınlar diye böyle yaptım. Sen de insanlardan bir kısmının gönlünü onlara yönlendir ve onları çeşitli ürünlerle rızıklandır ki sana şükretsinler.\"", source: "İbrahim / 37. Ayet" },
      { text: "\"Rabbim! Beni ve zürriyetimi namazı dosdoğru kılanlardan eyle! Rabbimiz dualarımızı kabul buyur!\"", source: "İbrahim / 40. Ayet" },
      { text: "\"Güneşin öğleyin batıya doğru kaydığı andan gece karanlığı bastırıncaya kadar belli vakitlerde namazı dosdoğru kıl; özellikle sabah namazını da kıl, çünkü sabah namazı şâhitlidir.\"", source: "İsrâ / 78. Ayet" },
      { text: "\"Gecenin bir kısmında uyanıp sana mahsus bir ibâdet olmak üzere teheccüd namazı kıl. Böyle yaptığın takdirde umulur ki Rabbin seni Makâm-ı Mahmûd’a eriştirir.\"", source: "İsrâ / 79. Ayet" },
      { text: "\"De ki: 'İster Allah diyerek, isterse Rahmân diyerek yalvarın. Hangisiyle yalvarırsanız olur; çünkü en güzel isimler O’nundur.' Sen de namazında, niyâzında sesini fazla yükseltme, büsbütün de kısma, ikisi arasında orta bir yol tut.\"", source: "İsrâ / 110. Ayet" },
      { text: "\"Nerede olursam olayım beni hayır ve bereket sebebi kıldı. Hayatta kaldığım müddetçe bana namazı ve zekâtı emretti.\"", source: "Meryem / 31. Ayet" },
      { text: "\"Ailesi başta olmak üzere halkına namaz kılmayı ve zekât vermeyi emrederdi. O, Rabbinin rızâsına ermiş seçkin bir kuldu.\"", source: "Meryem / 55. Ayet" },
      { text: "\"Ama onlardan sonra öyle kötü bir nesil geldi ki, namazı terk ettiler ve şehvetlerinin ardına düştüler. Bunlar, helâk çukuruna düşerek yaptıkları bu azgınlıkların cezasını göreceklerdir.\"", source: "Meryem / 59. Ayet" },
      { text: "\"Sen sözü açıktan söylemiş olsan da gizli söylemiş olsan da Allah için birdir; çünkü O gizliyi de, gizlinin gizlisini de bilir.\"", source: "Tâ-Hâ / 7. Ayet" },
      { text: "\"Şüphesiz ben Allahım. Benden başka ilâh yoktur. Öyleyse yalnız bana kulluk et, beni anmak için de namaz kıl!\"", source: "Tâ-Hâ / 14. Ayet" },
      { text: "\"Rasûlüm! Sen onların alay ve inkâr dolu sözlerine sabret! Güneş doğmadan ve batmadan önce Rabbini överek tesbih et. Gecenin bazı saatlerinde ve gündüzün bazı vakitlerinde de tesbihine devam et ki, Rabbinin hoşnutluğuna eresin.\"", source: "Tâ-Hâ / 130. Ayet" },
      { text: "\"Ailene ve ümmetine namazı emret. Kendin de onu kılmaya sabırla devam et. Biz senden rızık istemiyoruz; üstelik seni de biz rızıklandırıyoruz. İyi bilin ki, hayırlı son, kalpleri Allah’a saygı ile dopdolu olup günahlardan sakınan ve ilâhî buyruklara uyanların olacaktır.\"", source: "Tâ-Hâ / 132. Ayet" },
      { text: "\"Biz onları, emrimizle insanlara doğru yolu gösteren önderler yaptık. Onlara hayırlı işler yapmayı, namazı dosdoğru kılmayı ve zekâtı vermeyi emrettik. Onlar, kendilerini sadece bize kulluğa adamış kimselerdi.\"", source: "Enbiyâ / 73. Ayet" },
      { text: "\"Biz her ümmete bir kurban ibâdeti belirledik ki, kendilerine rızık olarak verdiğimiz hayvanları kurban ederken üzerlerine Allah’ın adını ansınlar. Şunu iyi bilin ki, sizin ilâhınız tek bir ilâhtır; öyleyse artık O’na teslim olun. Rasûlüm! Tam bir ihlâs, samimiyet ve tevazu içinde Allah’a boyun eğen kulları müjdele!\"", source: "Hac / 34. Ayet" },
      { text: "\"Onlar ki, yanlarında Allah anıldığı zaman kalpleri derin bir saygıyla ürperir, başlarına gelen musibetlere sabreder, namazı dosdoğru kılar ve kendilerine verdiğimiz rızıklardan bir kısmını Allah yolunda harcarlar.\"", source: "Hac / 35. Ayet" },
      { text: "\"Allah’ın dinine yardım eden o mü’minler, kendilerine yeryüzünde bir hâkimiyet verdiğimizde, namazlarını dosdoğru kılarlar, zekâtlarını verirler, her türlü iyiliği emredip yayar, kötülük ve yanlışlıkları yasaklayıp önünü almaya çalışırlar. Bütün işlerin neticede varıp değerlendirileceği yer Allah’ın huzurudur.\"", source: "Hac / 41. Ayet" },
      { text: "\"Allah yolunda gerektiği şekilde cihâd edin. O sizi bunun için seçti ve dîni yaşama konusunda üzerinize hiçbir zorluk yüklemedi. Haydin, atanız İbrâhim’in dinine uyun. Allah, önceki kitaplarda da, Kur’an’da da sizi 'müslümanlar' olarak isimlendirdi. Tâ ki, İslâm’a bağlılığınız hususunda Peygamber size şâhit olsun, siz de diğer insanlara şâhit olasınız. Öyleyse namazı dosdoğru kılın, zekâtı verin ve Allah’ın dinine sarılın. O sizin Mevlânızdır. O ne güzel Mevlâ, ne güzel yardımcıdır!\"", source: "Hac / 78. Ayet" },
      { text: "\"Onlar namazlarında tam bir tevazu, teslimiyet ve derin bir saygı içindedirler.\"", source: "Mü'minûn / 2. Ayet" },
      { text: "\"Onlar namazlarını vaktinde, bütün şartları ve rükünleriyle birlikte kılar, hiç geçirmezler.\"", source: "Mü'minûn / 9. Ayet" },
      { text: "\"O erler ki, ne ticâret ne de alış veriş onları Allah’ı zikretmekten, namazı dosdoğru kılmaktan ve zekâtı vermekten alıkoyabilir. Onlar, kalplerin halden hâle girip alt üst olacağı ve gözlerin dehşetten donakalacağı bir günden korkarlar.\"", source: "Nûr / 37. Ayet" },
      { text: "\"Öyleyse, namazı dosdoğru kılın, zekâtı verin ve Peygamber’e itaat edin ki Allah’ın rahmetine erişesiniz.\"", source: "Nûr / 56. Ayet" },
      { text: "\"Ey iman edenler! Elinizin altında bulunan köleleriniz, câriyeleriniz ve henüz ergenlik çağına girmemiş çocuklarınız şu üç vakitte yanınıza girmek için sizden izin istesinler: Sabah namazından önce, öğleyin elbiselerinizi çıkarıp istirahata çekildiğiniz vakit ve yatsı namazından sonra. Çünkü bu üç vakit, sizin mahrem halde bulunabileceğiniz zamanlardır. Bu vakitlerin dışında, izinsiz olarak yanınıza girmelerinde ne size ne de onlara bir günah yoktur. Çünkü, ev içinde kaçınılmaz olarak birbirinizin yanına girip çıkmak durumundasınız. Allah size âyetlerini işte böyle açıklamaktadır. Allah herşeyi hakkıyla bilen, her hükmü ve işi hikmetli ve sağlam olandır.\"", source: "Nûr / 58. Ayet" },
      { text: "\"Düşünüp öğüt almak, bir de Rabbine şükretmek isteyenler için geceyle gündüzü peş peşe getiren de O’dur.\"", source: "Furkan / 62. Ayet" },
      { text: "\"Rahmân’ın has kulları onlardır ki, yeryüzünde tevazu ve vakar ile yürürler; kendini bilmez kimseler onlara laf attığında incitmeksizin 'Selâmetle!' derler, geçerler.\"", source: "Furkan / 63. Ayet" },
      { text: "\"Gecelerini Rablerine secde ederek ve O’nun huzurunda kıyâma durarak geçirirler.\"", source: "Furkan / 64. Ayet" },
      { text: "\"O, mü’minlere doğru yolu gösteren bir rehber ve büyük bir müjdedir.\"", source: "Neml / 2. Ayet" },
      { text: "\"Onlar ki namazı dosdoğru kılarlar, zekâtı verirler ve âhiretin varlığına da kesin olarak iman ederler.\"", source: "Neml / 3. Ayet" },
      { text: "\"Rasûlüm! Sana kitaptan ne vahyediliyorsa onu okuyup başkalarına da anlat. Namazı da dosdoğru kıl! Çünkü bütün şartlarına riâyet edilerek hakkıyla kılınan namaz, insanı her türlü hayasızlıktan, dînin ve aklın kabul etmediği şeylerden alıkoyar. Allah’ı zikretmek ise en büyük ibâdettir. Allah, bütün yaptıklarınızı bilir.\"", source: "Ankebût / 45. Ayet" },
      { text: "\"Bâtıl şeylerden yüz çevirerek hepiniz tüm benliğinizle sadece Allah’a yönelin, O’na karşı gelmekten sakının, namazı dosdoğru kılın ve Allah’a ortak koşanlardan olmayın.\"", source: "Rûm / 31. Ayet" },
      { text: "\"İnsanların malları içinde artacağını düşünerek fâize verdiğiniz para, zâhiren artar gibi gözükse de, Allah katında artmaz. Oysa Allah’ın rızâsını isteyerek karşılıksız verdiğiniz zekât cinsinden şeylere gelince, işte böyle yapanlar, mal ve sevaplarını kat kat artıranların tâ kendileridir.\"", source: "Rûm / 39. Ayet" },
      { text: "\"Onlar namazı dosdoğru kılar, zekâtı verir, âhirete de tam ve kesin bir şekilde inanırlar.\"", source: "Lokman / 4. Ayet" },
      { text: "\"İşte Rablerinin gösterdiği yolda yürüyenler onlardır, kurtuluşa erecek olanlar da yalnızca onlardır.\"", source: "Lokman / 5. Ayet" },
      { text: "\"Evlâdım! Namazı dosdoğru kıl, iyiliği emret, kötülükten sakındır ve bu uğurda başına gelecek musîbetlere sabret. Çünkü bunlar azim ve kararlılık gerektiren mühim işlerdir.\"", source: "Lokman / 17. Ayet" },
      { text: "\"Bizim âyetlerimize ancak şu kimseler iman ederler ki, o âyetlerle kendilerine öğüt verildiği zaman, hiçbir büyüklük duygusuna kapılmadan derhal yüzleri üzere secdeye kapanır ve Rablerini övgülerle anıp tesbih ederler.\"", source: "Secde / 15. Ayet" },
      { text: "\"Geceleyin yanları yataklardan uzaklaşır, azâbından korkup rahmetini umarak Rablerine yalvarırlar ve kendilerine verdiğimiz rızıklardan Allah yolunda harcarlar.\"", source: "Secde / 16. Ayet" },
      { text: "\"Dışarı çıkmanızı gerektiren zarurî bir sebep olmadıkça evlerinizde ağırbaşlılıkla oturun. Mecburi bir iş için çıkmanız gerektiğinde ise, eski câhiliye devri kadınlarının yaptığı gibi, süslerinizi ve câzibenizi dışarı vurarak çıkmayın. Namazı dosdoğru kılın, zekâtı verin, Allah ve Rasûlü’ne itaat edin. Ey Peygamber’in şerefli hâne halkı! Allah bu emirleriyle sizden her türlü kiri gidermek ve sizi tertemiz kılmak istiyor.\"", source: "Ahzâb / 33. Ayet" },
      { text: "\"Ey iman edenler! Allah’ı çok çok zikredin.\"", source: "Ahzâb / 41. Ayet" },
      { text: "\"Sabah akşam O’nu tesbih edin.\"", source: "Ahzâb / 42. Ayet" },
      { text: "\"Hiçbir günahkâr, başkasının günahını yüklenmez ve onunla yargılanmaz. Ağır bir günah yükü altında ezilen kimse, yükünü taşımak için başkasını yardıma çağırsa, bu çağırdığı kimse akrabası bile olsa, onun günahından en küçük bir şey yüklenemez. Sen ancak görmedikleri halde Rablerinden korkan ve namazı dosdoğru kılan kimseleri uyarabilirsin. Artık kim günahlarından temizlenirse kendi iyiliğine temizlenmiş olur. Nihâî dönüş yalnız Allah’a olacaktır.\"", source: "Fâtır / 18. Ayet" },
      { text: "\"Allah’ın kitabını gerektiği gibi okuyan, namazı dosdoğru kılan ve kendilerine verdiğimiz rızıklardan Allah yolunda gizli açık harcayanlar, asla zarara uğramayacak bir ticâreti ümit edebilirler.\"", source: "Fâtır / 29. Ayet" },
      { text: "\"Onlar Rablerinin çağrısına uyarlar ve namazı dosdoğru kılarlar. Aralarındaki işlerini istişâre ederek yürütürler. Kendilerine verdiğimiz rızıklardan da Allah yolunda harcarlar.\"", source: "Şûrâ / 38. Ayet" },
      { text: "\"O halde Rasûlüm, onların alay ve hakaret dolu sözlerine sabret; gerek güneşin doğuşundan önce, gerek batışından önce Rabbini övgüyle tesbih et!\"", source: "Kaf / 39. Ayet" },
      { text: "\"Gecenin bir bölümünde ve secdelerin ardından da O’nu tesbih et.\"", source: "Kaf / 40. Ayet" },
      { text: "\"Gönülleri Allah’a karşı saygıyla dopdolu olup O’na itaatsizlikten sakınan ve güçleri ölçüsünde O’nun emirlerini yerine getirmeye çalışanlar, cennetlerde ve pınar başlarında olacaklardır.\"", source: "Zâriyât / 15. Ayet" },
      { text: "\"Rablerinin kendilerine bahşedeceği her türlü nimeti alacaklardır. Çünkü onlar daha önce iyilik eden ve yaptığı işi güzel yapan kimselerdi.\"", source: "Zâriyât / 16. Ayet" },
      { text: "\"Geceleri pek az uyurlardı.\"", source: "Zâriyât / 17. Ayet" },
      { text: "\"Seher vakitleri de Allah’tan bağışlanma dilerlerdi.\"", source: "Zâriyât / 18. Ayet" },
      { text: "\"Peygamberle gizli ve özel görüşmeden önce muhtaçlara sadaka verdiğiniz takdirde fakirliğe düşeceğiz diye korktunuz mu? Mademki siz bunu yapmadığınız takdirde Allah sizi bağışladı; öyleyse siz de artık namazı dosdoğru kılın, zekâtı verin, Allah ve Rasûlü’ne itaat edin. Zira Allah, bütün yaptıklarınızdan haberdardır.\"", source: "Mücâdele / 13. Ayet" },
      { text: "\"Ey iman edenler! Cuma günü namaz için ezan okunduğunda hemen Allah’ı anmaya koşun; işi, alış verişi bırakın! Eğer bilirseniz sizin için hayırlı olan budur.\"", source: "Cum'a / 9. Ayet" },
      { text: "\"Namaz tamamlanınca artık yeryüzüne yayılabilir ve Allah’ın lutf u kereminden rızkınızı temine çalışabilirsiniz. Bununla birlikte Allah’ı çok çok zikredin ki iki cihanda da kurtuluşa eresiniz.\"", source: "Cum'a / 10. Ayet" },
      { text: "\"Ancak namazı hakkıyla kılanlar böyle değildir.\"", source: "Meâric / 22. Ayet" },
      { text: "\"Onlar namazlarında devamlıdırlar.\"", source: "Meâric / 23. Ayet" },
      { text: "\"Onlar, bütün şartları ve rükünleriyle birlikte namazlarını vaktinde kusursuz olarak kılar ve hiç geçirmezler.\"", source: "Meâric / 34. Ayet" },
      { text: "\"Rasûlüm! Rabbin, senin gecenin üçte ikisine yakın kısmını, bazan yarısını, bazan da üçte birini ibâdetle geçirdiğini, beraberindeki mü’minlerden bir kısmının da böyle yaptığını elbette biliyor. Geceyi ve gündüzü yaratıp sürelerini takdir eden Allah’tır. O, gece ibâdetini gerektiği şekilde yapamayacağınızı bildiği için size lutuf ve merhametiyle muâmele edip, kolaylaştırmaya gitti. Artık Kur’an’dan kolayınıza gelen miktarı okuyun. Allah şunu da biliyor ki, içinizden hastalar olacak; bir kısmınız Allah’ın lutfundan nasibini aramak üzere yeryüzünde dolaşacak; bir kısmınız da Allah yolunda savaşacak. Bundan böyle Kur’an’dan kolayınıza gelen miktarı okuyun, namazı dosdoğru kılın, zekâtı verin, bir de Allah’a gönül hoşluğuyla güzel bir borç verin. Kendiniz için iyilik olarak önden ne gönderirseniz, Allah katında onu daha hayırlı ve mükâfatı kat kat artmış olarak bulursunuz. Günahlarınız için Allah’tan bağışlanma dileyin. Şüphesiz Allah, çok bağışlayıcıdır, sonsuz merhamet sahibidir.\"", source: "Müzzemmil / 20. Ayet" },
      { text: "\"Onlar da şöyle cevap verirler: 'Biz namaz kılanlardan değildik.'\"", source: "Müddessir / 43. Ayet" },
      { text: "\"O kişi dünyada ne dini doğrular, ne de namaz kılardı.\"", source: "Kıyamet / 31. Ayet" },
      { text: "\"Sabah akşam Rabbinin ismini an.\"", source: "İnsan / 25. Ayet" },
      { text: "\"Gecenin bir kısmında O’na secde et ve geceleyin uzun bir süre O’nu tesbihte bulun.\"", source: "İnsan / 26. Ayet" },
      { text: "\"Rabbinin ismini anıp namaz kılan.\"", source: "A'lâ / 15. Ayet" },
      { text: "\"Namaza durduğu zaman bir kulu?\"", source: "Alak / 10. Ayet" },
      { text: "\"Halbuki onlara da ancak, taat ve ibâdeti yalnızca Allah’a has kılıp sadece O’nun rızâsını hedef alarak, bâtıl dinleri terk edip dupduru bir tevhid inancı içinde sadece Allah’a kulluk etmeleri, namazı dosdoğru kılmaları ve zekâtı vermeleri emredilmişti. İşte sağlam, dosdoğru ve kıyâmete kadar bâkî kalacak din budur!\"", source: "Beyyine / 5. Ayet" },
      { text: "\"Hayır! Hayır! Elbette yakında bileceksiniz.\"", source: "Tekâsür / 4. Ayet" },
      { text: "\"Hayır! Eğer gerçeği kesin bir bilgiyle bilseydiniz böyle yapmaya cür’et edemezdiniz!\"", source: "Tekâsür / 5. Ayet" },
      { text: "\"Siz, o kızgın alevli cehenemi mutlaka göreceksiniz.\"", source: "Tekâsür / 6. Ayet" },
      { text: "\"Yazıklar olsun şöyle namaz kılanlara ki,\"", source: "Mâûn / 4. Ayet" },
      { text: "\"Onlar namazlarını gafletle kılar, ona gereken önemi vermezler.\"", source: "Mâûn / 5. Ayet" },
      { text: "\"Sen de Rabbin için namaz kıl ve kurban kes!\"", source: "Kevser / 2. Ayet" }
    ];
    // YENİ EKLENEN: RASTGELE AYET GÖSTERME FONKSİYONU
    function displayDailyVerse() {
      const randomIndex = Math.floor(Math.random() * QURAN_VERSES.length);
      const verse = QURAN_VERSES[randomIndex];
      const verseEl = document.getElementById('dailyVerseText');
      const sourceEl = document.getElementById('dailyVerseSource');
      if (verseEl && sourceEl) {
        verseEl.textContent = verse.text;
        sourceEl.textContent = "— " + verse.source;
      }
    }
    // YENİ EKLENEN: NAMAZ VAKTİ GERİ SAYIM SİSTEMİ (Bursa, Diyanet hesaplama metodu)
    const PRAYER_COUNTDOWN_LAT = 40.1826, PRAYER_COUNTDOWN_LON = 29.0665;
    const PRAYER_COUNTDOWN_MAP = [
      { key: 'Fajr', label: 'Sabah' },
      { key: 'Dhuhr', label: 'Öğle' },
      { key: 'Asr', label: 'İkindi' },
      { key: 'Maghrib', label: 'Akşam' },
      { key: 'Isha', label: 'Yatsı' }
    ];
    let prayerCountdownInterval = null;
    let prayerTimingsToday = null;
    let prayerTimingsTomorrow = null;
    let prayerTimingsDateKey = null;
    function pcDateKey(d) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    function pcFormatForApi(d) {
      return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    }
    async function fetchPrayerTimingsForDate(dateObj) {
      const url = `https://api.aladhan.com/v1/timings/${pcFormatForApi(dateObj)}?latitude=${PRAYER_COUNTDOWN_LAT}&longitude=${PRAYER_COUNTDOWN_LON}&method=13`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Namaz vakti servisi yanıt vermedi');
      const data = await res.json();
      if (!data || !data.data || !data.data.timings) throw new Error('Namaz vakti verisi hatalı');
      return data.data.timings;
    }
    async function getPrayerTimingsCached(dateObj) {
      const key = pcDateKey(dateObj);
      let cache = {};
      const raw = localStorage.getItem('manevi-atlas-prayertimes-cache');
      if (raw) { try { cache = JSON.parse(raw); } catch (e) {} }
      if (cache[key]) return cache[key];

      const timings = await fetchPrayerTimingsForDate(dateObj);
      cache[key] = timings;
      const keys = Object.keys(cache).sort();
      while (keys.length > 6) { delete cache[keys.shift()]; }
      localStorage.setItem('manevi-atlas-prayertimes-cache', JSON.stringify(cache));
      return timings;
    }
    function pcParseTimeOnDate(dateObj, hhmmRaw) {
      const hhmm = (hhmmRaw || '00:00').split(' ')[0];
      const [h, m] = hhmm.split(':').map(Number);
      const d = new Date(dateObj);
      d.setHours(h || 0, m || 0, 0, 0);
      return d;
    }
    window.initPrayerCountdown = async function() {
      document.getElementById('prayerCountdownLoading').classList.remove('hidden');
      document.getElementById('prayerCountdownError').classList.add('hidden');
      document.getElementById('prayerCountdownError').classList.remove('flex');
      document.getElementById('prayerCountdownContent').classList.add('hidden');

      const now = new Date();
      const todayKey = pcDateKey(now);

      try {
        if (prayerTimingsDateKey !== todayKey || !prayerTimingsToday || !prayerTimingsTomorrow) {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const [todayT, tomorrowT] = await Promise.all([
            getPrayerTimingsCached(now),
            getPrayerTimingsCached(tomorrow)
          ]);
          prayerTimingsToday = todayT;
          prayerTimingsTomorrow = tomorrowT;
          prayerTimingsDateKey = todayKey;
        }

        document.getElementById('prayerCountdownLoading').classList.add('hidden');
        document.getElementById('prayerCountdownContent').classList.remove('hidden');

        if (prayerCountdownInterval) clearInterval(prayerCountdownInterval);
        tickPrayerCountdown();
        prayerCountdownInterval = setInterval(tickPrayerCountdown, 1000);
      } catch (e) {
        console.error('Namaz vakti alınamadı:', e);
        document.getElementById('prayerCountdownLoading').classList.add('hidden');
        document.getElementById('prayerCountdownContent').classList.add('hidden');
        const errBox = document.getElementById('prayerCountdownError');
        errBox.classList.remove('hidden');
        errBox.classList.add('flex');
      }
    };
    function tickPrayerCountdown() {
      if (!prayerTimingsToday) return;
      const now = new Date();

      // Gün değiştiyse verileri tazele
      if (pcDateKey(now) !== prayerTimingsDateKey) {
        initPrayerCountdown();
        return;
      }

      const todayBase = new Date(now); todayBase.setHours(0, 0, 0, 0);
      const tomorrowBase = new Date(todayBase); tomorrowBase.setDate(tomorrowBase.getDate() + 1);

      const todaysTimes = PRAYER_COUNTDOWN_MAP.map(p => ({
        key: p.key, label: p.label,
        time: pcParseTimeOnDate(todayBase, prayerTimingsToday[p.key])
      }));

      let next = todaysTimes.find(p => p.time.getTime() > now.getTime());
      let isTomorrow = false;
      if (!next && prayerTimingsTomorrow) {
        next = {
          key: 'Fajr', label: 'Sabah',
          time: pcParseTimeOnDate(tomorrowBase, prayerTimingsTomorrow['Fajr'])
        };
        isTomorrow = true;
      }
      if (!next) return;

      const totalSec = Math.max(0, Math.floor((next.time.getTime() - now.getTime()) / 1000));
      const hh = Math.floor(totalSec / 3600);
      const mm = Math.floor((totalSec % 3600) / 60);
      const ss = totalSec % 60;

      document.getElementById('nextPrayerName').textContent = `${next.label} Namazı${isTomorrow ? ' (Yarın)' : ''}`;
      document.getElementById('nextPrayerClock').textContent = `${String(next.time.getHours()).padStart(2, '0')}:${String(next.time.getMinutes()).padStart(2, '0')}`;
      document.getElementById('prayerCountdownH').textContent = String(hh).padStart(2, '0');
      document.getElementById('prayerCountdownM').textContent = String(mm).padStart(2, '0');
      document.getElementById('prayerCountdownS').textContent = String(ss).padStart(2, '0');

      const row = document.getElementById('prayerTimesRow');
      if (row) {
        row.innerHTML = todaysTimes.map(p => {
          const active = !isTomorrow && p.key === next.key;
          return `
            <div class="flex flex-col items-center flex-1 rounded-xl py-1.5 transition-all" style="${active ? 'background:var(--teal-900); color:#fff;' : 'background:var(--paper-deep); color:var(--ink-soft);'}">
              <span class="text-[8px] font-bold uppercase tracking-wide">${p.label}</span>
              <span class="text-[9.5px] font-bold font-ledger mt-0.5">${String(p.time.getHours()).padStart(2, '0')}:${String(p.time.getMinutes()).padStart(2, '0')}</span>
            </div>`;
        }).join('');
      }
    }
    // CAMİ DETAY / TARİHÇE BİLGİSİ MODALI
    let currentMosqueInfoId = null;
    window.openMosqueInfoModal = function(id) {
      const m = PRESET_MOSQUES.find(x => x.id === id);
      if (!m) return;
      currentMosqueInfoId = id;
      const detail = getMosqueInfo(m);
      const isOsmangazi = m.district === 'Osmangazi';

      document.getElementById('mosqueInfoDistrictBadge').textContent = `${m.district} · ${getSicilNo(m)}`;
      document.getElementById('mosqueInfoName').textContent = m.name;
      document.querySelector('#mosqueInfoAddress span').textContent = m.address;
      document.getElementById('mosqueInfoPeriod').textContent = detail.period;
      document.getElementById('mosqueInfoFounder').textContent = detail.founder;
      document.getElementById('mosqueInfoText').textContent = detail.info;

      const archWrap = document.getElementById('mosqueInfoArchitectWrap');
      if (detail.architect) {
        document.getElementById('mosqueInfoArchitect').textContent = detail.architect;
        archWrap.classList.remove('hidden');
      } else {
        archWrap.classList.add('hidden');
      }

      const isCustom = !!MOSQUE_INFO_OVERRIDES[id];
      const notice = document.getElementById('mosqueInfoCustomNotice');
      const resetBtn = document.getElementById('mosqueInfoResetBtn');
      notice.classList.toggle('hidden', !isCustom);
      notice.classList.toggle('flex', isCustom);
      resetBtn.classList.toggle('hidden', !isCustom);

      const heroPanel = document.querySelector('#mosqueInfoModal .hero-panel');
      if (heroPanel) {
        heroPanel.style.background = isOsmangazi
          ? 'radial-gradient(120% 140% at 100% 0%, rgba(195,154,69,0.18) 0%, rgba(195,154,69,0) 45%), linear-gradient(160deg, var(--teal-950) 0%, var(--teal-900) 55%, var(--teal-700) 130%)'
          : 'radial-gradient(120% 140% at 100% 0%, rgba(227,161,126,0.22) 0%, rgba(227,161,126,0) 45%), linear-gradient(160deg, var(--brick-deep) 0%, var(--brick) 65%, var(--brick-soft) 140%)';
      }

      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.mapsSearch || (m.name + ' ' + m.address))}`;
      document.getElementById('mosqueInfoMapLink').href = mapUrl;

      document.getElementById('mosqueInfoModal').classList.remove('hidden');
    };
    window.closeMosqueInfoModal = function() {
      document.getElementById('mosqueInfoModal').classList.add('hidden');
    };
    document.getElementById('mosqueInfoModal').addEventListener('click', function(e) { if (e.target === this) closeMosqueInfoModal(); });
    // CAMİ BİLGİ KARTINI DÜZENLEME
    window.openMosqueInfoEditModal = function(id) {
      const m = PRESET_MOSQUES.find(x => x.id === id);
      if (!m) return;
      const detail = getMosqueInfo(m);
      document.getElementById('mosqueInfoEditMosqueName').textContent = m.name;
      document.getElementById('editInfoPeriod').value = detail.period || '';
      document.getElementById('editInfoFounder').value = detail.founder || '';
      document.getElementById('editInfoArchitect').value = detail.architect || '';
      document.getElementById('editInfoText').value = detail.info || '';
      document.getElementById('mosqueInfoModal').classList.add('hidden');
      document.getElementById('mosqueInfoEditModal').classList.remove('hidden');
    };
    window.closeMosqueInfoEditModal = function() {
      document.getElementById('mosqueInfoEditModal').classList.add('hidden');
      if (currentMosqueInfoId) openMosqueInfoModal(currentMosqueInfoId);
    };
    document.getElementById('mosqueInfoEditModal').addEventListener('click', function(e) { if (e.target === this) closeMosqueInfoEditModal(); });
    window.saveMosqueInfoEdit = function() {
      if (!currentMosqueInfoId) return;
      const period = document.getElementById('editInfoPeriod').value.trim();
      const founder = document.getElementById('editInfoFounder').value.trim();
      const architect = document.getElementById('editInfoArchitect').value.trim();
      const info = document.getElementById('editInfoText').value.trim();

      if (!period || !founder || !info) {
        showToast("Lütfen yapılış tarihi, banisi ve kısa bilgi alanlarını doldurun.", "error");
        return;
      }

      MOSQUE_INFO_OVERRIDES[currentMosqueInfoId] = { period, founder, info };
      if (architect) MOSQUE_INFO_OVERRIDES[currentMosqueInfoId].architect = architect;
      saveMosqueInfoOverrides();

      document.getElementById('mosqueInfoEditModal').classList.add('hidden');
      openMosqueInfoModal(currentMosqueInfoId);
      showToast("Cami bilgisi güncellendi.", "success");
    };
    // CAMİ BİLGİ KARTINI SIFIRLAMA (KULLANICI DÜZENLEMESİNİ SİLME)
    let pendingInfoResetId = null;
    window.triggerResetMosqueInfo = function(id) {
      if (!id) return;
      pendingInfoResetId = id;
      pendingAction = 'resetMosqueInfo';
      openConfirmModal("Bilgi Kartı Sıfırlansın mı?", "Bu camiye ait düzenlediğiniz bilgiler silinerek varsayılan içeriğe dönülecektir.", "Sıfırla");
    };
    function executeResetMosqueInfo(id) {
      delete MOSQUE_INFO_OVERRIDES[id];
      saveMosqueInfoOverrides();
      if (currentMosqueInfoId === id) openMosqueInfoModal(id);
      showToast("Bilgi kartı varsayılan haline döndürüldü.", "success");
    }
    window.openMosqueEditModal = function(id) {
      const m = PRESET_MOSQUES.find(x => x.id === id);
      if (!m) return;
      editingMosqueId = id;
      document.getElementById('editMosqueName').value = m.name;
      document.getElementById('editMosqueAddress').value = m.address || '';
      const distSelect = document.getElementById('editMosqueDistrict');
      if (distSelect) {
        const opt = Array.from(distSelect.options).find(o => o.value === m.district);
        if (opt) distSelect.value = m.district;
        else distSelect.value = 'Osmangazi';
      }
      const notice = document.getElementById('editMosquePresetNotice');
      notice.classList.toggle('hidden', !!m.isCustom);
      notice.classList.toggle('flex', !m.isCustom);
      document.getElementById('mosqueEditModal').classList.remove('hidden');
    };
    window.closeMosqueEditModal = function() {
      document.getElementById('mosqueEditModal').classList.add('hidden');
      editingMosqueId = null;
    };
    window.saveMosqueEdit = function() {
      if (!editingMosqueId) return;
      const m = PRESET_MOSQUES.find(x => x.id === editingMosqueId);
      if (!m) return;

      const newName = document.getElementById('editMosqueName').value.trim();
      const newAddress = document.getElementById('editMosqueAddress').value.trim();
      const distSelect = document.getElementById('editMosqueDistrict');
      const newDistrict = distSelect ? distSelect.value : m.district;

      if (!newName) { showToast("Cami ismi boş bırakılamaz.", "error"); return; }

      const duplicate = PRESET_MOSQUES.some(x => x.id !== m.id && x.name.trim().toLowerCase() === newName.toLowerCase());
      if (duplicate) { showToast("Bu isimde bir mabet zaten listenizde var.", "error"); return; }

      m.name = newName;
      m.address = newAddress || m.address;
      m.district = newDistrict;
      m.mapsSearch = `${newName} ${newDistrict} Bursa`;

      if (m.isCustom) {
        persistCustomMosqueList();
      } else {
        saveMosqueOverride(m.id, { name: m.name, address: m.address, district: m.district, mapsSearch: m.mapsSearch });
      }

      // Bu camiye ait mevcut defter kayıtlarındaki isim/ilçe bilgisini de güncelle
      visitsData.forEach(v => {
        if (v.mosqueId === m.id) { v.mosqueName = m.name; v.district = m.district; }
      });

      populateMosquesDropdown();
      triggerAllUIUpdates();
      closeMosqueEditModal();
      showToast("Cami bilgileri güncellendi.", "success");
    };
    window.triggerDeleteMosque = function(id) {
      const m = PRESET_MOSQUES.find(x => x.id === id);
      if (!m) return;
      pendingMosqueDeleteId = id;
      pendingAction = 'deleteMosque';
      const visitCount = visitsData.filter(v => v.mosqueId === id).length;
      const msg = visitCount > 0
        ? `"${m.name}" cami listenizden kaldırılacak. Bu mabette ${visitCount} adet namaz kaydınız var, defterinizdeki kayıtlar silinmeyecek. Devam edilsin mi?`
        : `"${m.name}" cami listenizden kaldırılacak. Ayarlar > Silinen Camiler bölümünden istediğiniz zaman geri getirebilirsiniz.`;
      openConfirmModal("Cami Listeden Kaldırılsın mı?", msg, "Kaldır");
    };
    function executeDeleteMosque(id) {
      const idx = PRESET_MOSQUES.findIndex(m => m.id === id);
      if (idx === -1) return;
      const removed = PRESET_MOSQUES[idx];
      PRESET_MOSQUES.splice(idx, 1);

      // Özel (kullanıcının eklediği) bir camiyse, kendi deposundan da çıkar;
      // ancak her iki türü de (hazır + özel) aynı "Silinen Camiler" listesine
      // ekleyerek geri getirilebilir hale getir.
      if (removed.isCustom) {
        persistCustomMosqueList();
      }
      const deletedList = getDeletedPresetMosques();
      if (!deletedList.some(d => d.id === id)) deletedList.push(removed);
      localStorage.setItem('manevi-atlas-deleted-presets', JSON.stringify(deletedList));

      populateMosquesDropdown();
      triggerAllUIUpdates();
      updateDeletedMosquesCount();
      showToast(`"${removed.name}" listeden kaldırıldı.`, "success");
      pendingMosqueDeleteId = null;
    }
    window.openDeletedMosquesModal = function() {
      renderDeletedMosquesList();
      document.getElementById('deletedMosquesModal').classList.remove('hidden');
    };
    window.closeDeletedMosquesModal = function() {
      document.getElementById('deletedMosquesModal').classList.add('hidden');
    };
    // === KULLANIM ŞARTLARI MODALI ===
    window.openTermsModal = function() {
      document.getElementById('termsModal').classList.remove('hidden');
      document.getElementById('termsModal').querySelector('.overflow-y-auto').scrollTop = 0;
    };
    window.closeTermsModal = function() {
      document.getElementById('termsModal').classList.add('hidden');
    };
    window.switchTermsLang = function(lang) {
      const trBtn = document.getElementById('termsLangTrBtn');
      const enBtn = document.getElementById('termsLangEnBtn');
      const trContent = document.getElementById('termsContentTr');
      const enContent = document.getElementById('termsContentEn');
      const isTr = lang === 'tr';
      trContent.classList.toggle('hidden', !isTr);
      enContent.classList.toggle('hidden', isTr);
      trBtn.classList.toggle('active', isTr);
      enBtn.classList.toggle('active', !isTr);
      trBtn.style.color = isTr ? '' : 'rgba(255,255,255,0.8)';
      enBtn.style.color = isTr ? 'rgba(255,255,255,0.8)' : '';
      window.haptic(6);
    };
    function renderDeletedMosquesList() {
      const list = getDeletedPresetMosques();
      const container = document.getElementById('deletedMosquesList');
      if (list.length === 0) {
        container.innerHTML = `<p class="text-xs text-center py-6" style="color:var(--ink-faint);">Silinmiş cami bulunmuyor.</p>`;
        return;
      }
      container.innerHTML = list.map(m => `
        <div class="flex items-center justify-between rounded-xl p-2.5" style="background:var(--paper-deep); border:1px solid var(--line);">
          <div class="space-y-0.5 pr-2 min-w-0">
            <p class="font-bold text-xs truncate" style="color:var(--ink);">${escapeHtml(m.name)}</p>
            <p class="text-[10px]" style="color:var(--ink-faint);">${escapeHtml(m.district)}</p>
          </div>
          <button onclick="restoreDeletedMosque('${m.id}')" class="text-[10px] font-bold px-2.5 py-1.5 rounded-lg text-white flex-shrink-0" style="background:var(--teal-900);">Geri Getir</button>
        </div>
      `).join('');
    }
    window.restoreDeletedMosque = function(id) {
      let list = getDeletedPresetMosques();
      const restored = list.find(m => m.id === id);
      list = list.filter(m => m.id !== id);
      localStorage.setItem('manevi-atlas-deleted-presets', JSON.stringify(list));
      if (restored && !PRESET_MOSQUES.some(m => m.id === id)) {
        PRESET_MOSQUES.push(restored);
        if (restored.isCustom) persistCustomMosqueList();
      }
      populateMosquesDropdown();
      triggerAllUIUpdates();
      updateDeletedMosquesCount();
      renderDeletedMosquesList();
      showToast(`"${restored ? restored.name : 'Cami'}" listeye geri eklendi.`, "success");
    };
    window.escapeHtml = function(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    };
    const FALLBACK_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23F2ECDD"/><text x="50%" y="50%" font-family="sans-serif" font-size="12" fill="%235B5445" text-anchor="middle" dy=".3em">Önizleme yok</text></svg>'
    );
    window.__imgFallback = function(el) { el.onerror = null; el.src = FALLBACK_IMG; };
    window.compressImage = function(file) {
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error('TIMEOUT')), 20000);
        const finishReject = (err) => { clearTimeout(timeoutId); reject(err); };
        const finishResolve = (val) => { clearTimeout(timeoutId); resolve(val); };

        const runCompression = (blobLike) => {
          const reader = new FileReader();
          reader.onerror = () => finishReject(new Error('READ_ERROR'));
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                const maxDimension = 2400;
                let width = img.width, height = img.height;
                if (width > height) { if (width > maxDimension) { height = Math.round((height * maxDimension) / width); width = maxDimension; } }
                else { if (height > maxDimension) { width = Math.round((width * maxDimension) / height); height = maxDimension; } }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
                finishResolve(canvas.toDataURL('image/jpeg', 0.92));
              } catch (err) { finishReject(err); }
            };
            img.onerror = () => finishReject(new Error('DECODE_ERROR'));
            img.src = event.target.result;
          };
          reader.readAsDataURL(blobLike);
        };

        const lowerName = (file.name || '').toLowerCase();
        const looksHeic = ['image/heic', 'image/heif'].includes((file.type || '').toLowerCase())
          || lowerName.endsWith('.heic') || lowerName.endsWith('.heif');

        if (looksHeic) {
          if (typeof heic2any === 'undefined') { finishReject(new Error('HEIC_LIB_MISSING')); return; }
          heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 })
            .then((converted) => runCompression(Array.isArray(converted) ? converted[0] : converted))
            .catch(() => finishReject(new Error('HEIC_CONVERT_ERROR')));
        } else {
          runCompression(file);
        }
      });
    };
    // === PROFIL FOTOGRAFI VE ISIM YONETIMI ===
    function loadProfileData() {
      // Geofencing Toggle Durumu
      const geofencingEnabled = localStorage.getItem('manevi-atlas-geofencing-enabled') !== '0';
      const geofencingToggle = document.getElementById('geofencingToggle');
      if (geofencingToggle) geofencingToggle.checked = geofencingEnabled;

      const savedName = localStorage.getItem('manevi-atlas-username') || 'Ziyaretçi';
      const savedPhoto = localStorage.getItem('manevi-atlas-userphoto');

      document.getElementById('profileNameInput').value = localStorage.getItem('manevi-atlas-username') || '';
      updateNameDisplays(savedName);

      if (savedPhoto) {
        setProfileImages(savedPhoto);
      } else {
        updateInitials(savedName);
      }

      updateOwnProfileHint();
      updateHeroPersonalizeHint();
    }
    // Kullanıcı henüz kendi adını/fotoğrafını eklememişse (varsayılan "Ziyaretçi" profili duruyorsa)
    // ve banner'ı daha önce kapatmadıysa, kendi profilini oluşturması için uyarı göster.
    function updateOwnProfileHint() {
      const banner = document.getElementById('ownProfileHintBanner');
      if (!banner) return;
      const hasOwnName = !!localStorage.getItem('manevi-atlas-username');
      const hasOwnPhoto = !!localStorage.getItem('manevi-atlas-userphoto');
      const dismissed = localStorage.getItem('manevi-atlas-own-profile-hint-dismissed');

      if (!hasOwnName && !hasOwnPhoto && !dismissed) {
        banner.classList.remove('hidden');
        banner.classList.add('flex');
      } else {
        banner.classList.add('hidden');
        banner.classList.remove('flex');
      }
    }
    // Dashboard'daki "Hoş geldiniz, Ziyaretçi" karşılamasının altında, kullanıcı
    // kendi adını/fotoğrafını eklemediği sürece kısa bir kişiselleştirme uyarısı gösterir.
    function updateHeroPersonalizeHint() {
      const hint = document.getElementById('heroPersonalizeHint');
      if (!hint) return;
      const hasOwnName = !!localStorage.getItem('manevi-atlas-username');
      const hasOwnPhoto = !!localStorage.getItem('manevi-atlas-userphoto');
      hint.classList.toggle('hidden', hasOwnName || hasOwnPhoto);
    }
    window.dismissOwnProfileHint = function() {
      localStorage.setItem('manevi-atlas-own-profile-hint-dismissed', '1');
      updateOwnProfileHint();
    };
    window.saveProfileName = function(name) {
      const val = name.trim();
      if (val === '') {
        // Kullanıcı ismini tamamen silerse, "Ziyaretçi" varsayılan durumuna geri dön.
        localStorage.removeItem('manevi-atlas-username');
        updateNameDisplays('Ziyaretçi');
        if (!localStorage.getItem('manevi-atlas-userphoto')) updateInitials('Ziyaretçi');
        updateOwnProfileHint();
        updateHeroPersonalizeHint();
        showToast("Profil ismi sıfırlandı.", "success");
        return;
      }
      localStorage.setItem('manevi-atlas-username', val);
      updateNameDisplays(val);
      if (!localStorage.getItem('manevi-atlas-userphoto')) {
        updateInitials(val);
      }
      updateOwnProfileHint();
      updateHeroPersonalizeHint();
      showToast("Profil ismi kaydedildi.", "success");
    }
    function updateNameDisplays(name) {
      if(document.getElementById('headerNameDisplay')) document.getElementById('headerNameDisplay').textContent = name;
      if(document.getElementById('heroNameDisplay')) document.getElementById('heroNameDisplay').textContent = name;
      if(document.getElementById('profileStatsName')) document.getElementById('profileStatsName').textContent = name;
    }
    function updateInitials(name) {
      const hasOwnName = !!localStorage.getItem('manevi-atlas-username');
      let initials = "";
      if (hasOwnName && name && name.trim() !== "") {
         const parts = name.trim().split(' ');
         if(parts.length > 1) initials = parts[0][0] + parts[parts.length-1][0];
         else initials = parts[0].substring(0,2);
         initials = initials.toUpperCase();
      }
      if(document.getElementById('headerInitials')) document.getElementById('headerInitials').textContent = initials;
      if(document.getElementById('profileInitials')) document.getElementById('profileInitials').textContent = initials;
    }
    window.handleProfilePhotoUpload = async function(input) {
      if (input.files && input.files[0]) {
        try {
          showToast("Fotoğraf işleniyor...", "success");
          const base64Data = await window.compressImage(input.files[0]);
          localStorage.setItem('manevi-atlas-userphoto', base64Data);
          setProfileImages(base64Data);
          updateOwnProfileHint();
          updateHeroPersonalizeHint();
          showToast("Profil fotoğrafı güncellendi!", "success");
        } catch (err) {
          showToast("Fotoğraf yüklenemedi. Lütfen tekrar deneyin.", "error");
        }
      }
    }
    function setProfileImages(src) {
      const headerImg = document.getElementById('headerProfileImg');
      const profileImg = document.getElementById('profilePhotoImg');
      const headerInitials = document.getElementById('headerInitials');
      const profileInitials = document.getElementById('profileInitials');

      if(headerImg) { headerImg.src = src; headerImg.classList.remove('hidden'); }
      if(profileImg) { profileImg.src = src; profileImg.classList.remove('hidden'); }
      if(headerInitials) headerInitials.classList.add('hidden');
      if(profileInitials) profileInitials.classList.add('hidden');
    }
    async function initApp() {
      const __splashStart = Date.now();
      const __MIN_SPLASH_MS = 1400;
      loadTheme();
      loadHapticsUI();
      loadCustomAddedMosques();
      loadMosqueInfoOverrides();
      loadFavorites();
      loadRatings();
      loadGeocodeCache();
      // Harita modalı henüz açılmadan, statik koordinat matrisini (mosques-geo.json)
      // arka planda ön-yükle. Kullanıcı haritayı ilk kez açtığında bu istek
      // büyük ihtimalle zaten tamamlanmış olur → sıfır gecikmeyle açılış.
      if (typeof prefetchMosqueGeoMatrix === 'function') prefetchMosqueGeoMatrix();
      // Sayfa yenilendiğinde tarayıcının eski arama kutusu değerini geri getirmesini
      // (form restore) önlemek için arama kutusunu ve filtreyi başlangıç durumuna sıfırla
      const __searchInputOnInit = document.getElementById('mosqueSearchInput');
      if (__searchInputOnInit) __searchInputOnInit.value = '';
      activeFilterDistrict = 'HEPSİ';
      initWhatsNewBanner();
      initMosqueInfoHintBanner();
      checkForAppUpdate(); // Sunucuda daha yeni bir sürüm var mı, sessizce kontrol et
      await loadVisits();
      loadProfileData(); 
      try { displayDailyVerse(); } catch (e) { console.error("Ayet yüklenemedi:", e); }
      try { initPrayerCountdown(); } catch (e) { console.error("Namaz vakitleri yüklenemedi:", e); }

      document.getElementById('appModeBadge').innerHTML = useIndexedDB
        ? '<span style="color:var(--teal-700);">Cihazınızda Güvende</span>'
        : '<span style="color:var(--teal-700);">Yerel Yedek Modu</span>';
      document.getElementById('syncStatus').innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full" style="background:var(--gold);"></span>
        <span>Kayıtlar Hazır</span>
      `;
      triggerAllUIUpdates();

      const __elapsed = Date.now() - __splashStart;
      const __remaining = Math.max(0, __MIN_SPLASH_MS - __elapsed);
      setTimeout(() => {
        const loader = document.getElementById('authLoader');
        loader.style.opacity = '0';
        setTimeout(() => loader.classList.add('hidden'), 450);
      }, __remaining);
    }
    function triggerAllUIUpdates() {
      if (window.__gamification && typeof window.__gamification.checkAllAchievements === 'function') {
        window.__gamification.checkAllAchievements();
      }
      updateDashboardUI();
      updateMosquesListUI();
      updateHistoryFeedUI();
      updateDeletedMosquesCount();
      updateRecentlyAddedMosquesUI();
      updateFavoriteMosquesUI();
      updateStatsUI();
      updateHeroBadgeUI();
      if (typeof syncUnvanGuideUI === 'function') syncUnvanGuideUI();
      if (typeof updateBackupStatusUI === 'function') updateBackupStatusUI();
      if (typeof maybeShowBackupReminder === 'function') maybeShowBackupReminder();
    }
    // ANA SAYFADA, İSMİN YANINDA GÖSTERİLEN UNVAN ROZETİ
    // Tek gerçek kaynak: stats.js -> getCurrentUnvan(). Profil sekmesindeki unvan
    // rehberi ve İstatistik sekmesindeki "Mevcut Unvanın" kartıyla her zaman
    // aynı sonucu gösterir; artık kendi ayrı eşik listesini tutmuyor.
    function updateHeroBadgeUI() {
      const el = document.getElementById('heroBadgeIcon');
      if (!el || typeof getCurrentUnvan !== 'function') return;
      const unvan = getCurrentUnvan();
      if (unvan.current) {
        el.className = 'leading-none sicil-tag';
        el.style.color = 'var(--teal-700)';
        el.textContent = unvan.current.title;
        el.title = unvan.current.title + ' — ' + unvan.current.desc;
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
    // DEFTER / İSTATİSTİK GÖRÜNÜM ANAHTARI
    window.switchDefterView = function(view) {
      const feed = document.getElementById('historyFeed');
      const stats = document.getElementById('statsPanel');
      const defterBtn = document.getElementById('defterViewBtn');
      const statsBtn = document.getElementById('statsViewBtn');
      if (view === 'stats') {
        feed.classList.add('hidden');
        stats.classList.remove('hidden');
        statsBtn.classList.add('active');
        statsBtn.style.color = '';
        defterBtn.classList.remove('active');
        defterBtn.style.color = 'var(--ink-soft)';
        updateStatsUI();
      } else {
        feed.classList.remove('hidden');
        stats.classList.add('hidden');
        defterBtn.classList.add('active');
        defterBtn.style.color = '';
        statsBtn.classList.remove('active');
        statsBtn.style.color = 'var(--ink-soft)';
      }
    };
    // 6. GÜNLÜK / GEÇMİŞ AKIŞI
    function updateHistoryFeedUI() {
      const container = document.getElementById('historyFeed');
      document.getElementById('historyTotalCount').textContent = `${visitsData.length} Kayıt`;

      if (visitsData.length === 0) {
        container.innerHTML = `
          <div class="paper-card rounded-2xl empty-state">
            <div class="empty-icon"><i class="fa-solid fa-feather-pointed"></i></div>
            <p class="text-xs font-semibold" style="color:var(--ink-soft);">Manevi günlüğünüz henüz boş</p>
            <p class="text-[10px] max-w-[220px]" style="color:var(--ink-faint);">İlk namaz kaydınızı işleyerek seyahatinizi başlatın.</p>
            <button onclick="switchTab(2)" class="btn-primary text-[10px] font-bold px-4 py-2 rounded-xl mt-1">İlk Kaydı Ekle</button>
          </div>`;
        return;
      }

      container.innerHTML = visitsData.map((v, idx) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
        const formattedDate = v.date ? new Date(v.date).toLocaleDateString('tr-TR', options) : 'Tarih Yok';

        let photosHTML = '';
        if (v.photos && v.photos.length > 0) {
          window.photoGalleries[v.id] = v.photos;
          photosHTML = `
            <div class="grid grid-cols-2 gap-2 mt-2">
              ${v.photos.map((p, pIdx) => `
                <div class="relative rounded-xl overflow-hidden h-24 cursor-pointer active:opacity-80 transition-opacity" style="background:var(--paper-deep); border:1px solid var(--line);" onclick="openLightboxFromRecord('${v.id}', ${pIdx})">
                  <img src="${p}" class="w-full h-full object-cover" alt="Ziyaret fotoğrafı" onerror="window.__imgFallback(this)">
                  <div class="absolute bottom-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style="background:rgba(0,0,0,0.5);">
                    <i class="fa-solid fa-expand text-white text-[9px]"></i>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }

        let mapBtnHTML = '';
        if (v.address) {
          const isUrl = (v.address.startsWith('http') || v.address.includes('google.com/maps')) && !v.address.toLowerCase().includes('javascript:');
          let targetUrl = isUrl ? v.address : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.mosqueName + ' ' + v.address)}`;
          // URL güvenliği: Sadece http, https veya google maps linklerine izin ver
          if (isUrl && !targetUrl.startsWith('http') && !targetUrl.startsWith('https')) {
            targetUrl = '#';
          }
          mapBtnHTML = `
            <a href="${targetUrl}" target="_blank" rel="noopener" class="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-1 rounded-lg mt-2 transition-colors" style="background:rgba(21,90,76,0.08); color:var(--teal-900);">
              <i class="fa-solid fa-compass"></i><span class="truncate max-w-[150px]">${isUrl ? 'Konumu Görüntüle' : escapeHtml(v.address)}</span>
            </a>
          `;
        }

        const isLast = idx === visitsData.length - 1;
        return `
          <div class="relative pl-9 ${isLast ? '' : 'pb-1'} fade-in-up">
            ${!isLast ? `<div class="timeline-rail"></div>` : ''}
            <div class="absolute left-[15px] top-6 timeline-dot"></div>
            <div class="paper-card rounded-2xl p-4 relative">
              <div class="absolute top-4 right-4 flex items-center gap-2.5">
                <button onclick="triggerEditVisit('${v.id}')" class="p-1" style="color:var(--ink-faint);" title="Kaydı düzenle">
                  <i class="fa-solid fa-pen text-xs"></i>
                </button>
                <button onclick="triggerDelete('${v.id}')" class="p-1" style="color:var(--ink-faint);" title="Kaydı sil">
                  <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
              <div class="space-y-1 pr-12">
                <div class="flex items-center space-x-1.5">
                  <span class="text-[9px] font-bold text-white px-2 py-0.5 rounded font-ledger" style="background:var(--teal-900);">${escapeHtml(v.prayerTime)}${v.prayerTime === 'Vakit Dışı' ? '' : ' Namazı'}</span>
                  <span class="text-[9px] font-bold uppercase tracking-wider" style="color:var(--ink-faint);">${v.outOfBursa ? '<i class="fa-solid fa-earth-europe" style="margin-right:3px;"></i>' : ''}${escapeHtml(v.district)}</span>
                </div>
                <h3 class="font-bold text-xs mt-1" style="color:var(--ink);">${escapeHtml(v.mosqueName)}</h3>
                <p class="text-[10px]" style="color:var(--ink-faint);">${formattedDate} - Saat: ${escapeHtml(v.time) || '--:--'}</p>
              </div>
              ${v.notes ? `<p class="text-[11px] p-2.5 rounded-lg italic mt-2" style="color:var(--ink-soft); background:var(--paper-deep); border-left:2px solid var(--teal-700);">"${escapeHtml(v.notes)}"</p>` : ''}
              ${mapBtnHTML}
              ${photosHTML}
            </div>
          </div>
        `;
      }).join('');
    }
    // 7. ONAY MODALI (Silme / Sıfırlama ortak kullanım)
    let pendingDeleteId = null;
    let pendingAction = null;
 // 'delete' | 'resetAll'

    function openConfirmModal(title, message, actionLabel) {
      window.haptic([12, 40, 12]);
      document.getElementById('confirmTitle').textContent = title;
      document.getElementById('confirmMessage').textContent = message;
      const okBtn = document.getElementById('confirmOkBtn');
      if (actionLabel) okBtn.textContent = actionLabel;
      const modal = document.getElementById('customConfirmModal');
      modal.classList.remove('hidden');
      modal.style.opacity = '0';
      requestAnimationFrame(() => {
        modal.style.transition = 'opacity .28s ease';
        modal.style.opacity = '1';
        modal.firstElementChild.classList.remove('scale-95');
        modal.firstElementChild.classList.add('scale-100');
      });
    }
    window.triggerDelete = function(docId) {
      pendingDeleteId = docId;
      pendingAction = 'delete';
      openConfirmModal("Kaydı Siliyoruz", "Bu namaz ibadeti kaydı günlüğünüzden silinecektir. Emin misiniz?", "Sil");
    };
    window.triggerResetAll = function() {
      pendingAction = 'resetAll';
      openConfirmModal("Tüm Veriler Silinsin mi?", "Defterinizdeki tüm namaz kayıtları kalıcı olarak silinecek. Bu işlem geri alınamaz.", "Hepsini Sil");
    };
    document.getElementById('confirmCancelBtn').addEventListener('click', () => closeConfirmModal());
    document.getElementById('confirmOkBtn').addEventListener('click', async () => {
      window.haptic([16, 45, 16]);
      if (pendingAction === 'delete' && pendingDeleteId) {
        await executeDeleteLog(pendingDeleteId);
      } else if (pendingAction === 'resetAll') {
        await executeResetAll();
      } else if (pendingAction === 'deleteMosque' && pendingMosqueDeleteId) {
        executeDeleteMosque(pendingMosqueDeleteId);
      } else if (pendingAction === 'resetMosqueInfo' && pendingInfoResetId) {
        executeResetMosqueInfo(pendingInfoResetId);
      }
      closeConfirmModal();
    });
    function closeConfirmModal() {
      const modal = document.getElementById('customConfirmModal');
      modal.firstElementChild.classList.remove('scale-100');
      modal.firstElementChild.classList.add('scale-95');
      modal.style.opacity = '0';
      document.getElementById('confirmOkBtn').textContent = "Sil";
      setTimeout(() => { modal.classList.add('hidden'); modal.style.opacity = ''; pendingDeleteId = null; pendingMosqueDeleteId = null; pendingInfoResetId = null; pendingAction = null; }, 280);
    }
    async function executeResetAll() {
      const backup = visitsData;
      visitsData = [];
      try {
        if (useIndexedDB) {
          const db = await openDB();
          await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).clear();
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
          });
        } else {
          localStorage.removeItem(LS_FALLBACK_KEY);
        }
        triggerAllUIUpdates();
        showToast("Tüm kayıtlar silindi.", "success");
      } catch (e) {
        visitsData = backup;
        showToast("Veriler sıfırlanırken bir sorun oluştu.", "error");
      }
    }
    // 8. YENİ İBADET KAYDETME VE CAMI ONDERLIGINI LISTEYE KATMA
    window.handleVisitSubmit = async function(event) {
      event.preventDefault();

      const selectElem = document.getElementById('formMosqueSelect');
      const selectedOptionId = selectElem.value;
      const prayerTime = document.getElementById('formPrayerSelected').value;
      const address = document.getElementById('formAddress').value.trim();
      const date = document.getElementById('formDate').value;
      const time = document.getElementById('formTime').value;
      const notes = document.getElementById('formNotes').value.trim();

      if (!selectedOptionId) { showToast("Lütfen ibadet edilen mabedi seçin.", "error"); return; }
      if (!prayerTime) { showToast("Lütfen kılınan namaz vaktini belirtin.", "error"); return; }

      let mosqueName = "", mosqueId = selectedOptionId, district = "Osmangazi";
      
      if (selectedOptionId === "custom") {
        const customName = document.getElementById('formCustomName').value.trim();
        if (!customName) { showToast("Mabet ismi boş bırakılamaz.", "error"); return; }

        const existingMatch = PRESET_MOSQUES.find(m => m.name.trim().toLowerCase() === customName.toLowerCase());
        if (existingMatch && !(editingVisitId && existingMatch.id === visitsData.find(v => v.id === editingVisitId)?.mosqueId)) {
          mosqueName = existingMatch.name;
          mosqueId = existingMatch.id;
          district = existingMatch.district;
        } else {
          mosqueName = customName;
          const tempId = "custom-" + Date.now();
          mosqueId = tempId;
          district = document.getElementById('formCustomDistrict').value;

          const newCustomMosque = {
            id: tempId,
            name: customName,
            district: district,
            address: address || `${district}, Bursa`,
            mapsSearch: customName + " " + district + " Bursa",
            isCustom: true,
            addedAt: new Date().toISOString().slice(0, 10)
          };

          PRESET_MOSQUES.push(newCustomMosque);
          persistCustomMosqueList();
          populateMosquesDropdown();
        }
      } else {
        const matched = PRESET_MOSQUES.find(m => m.id === selectedOptionId);
        if (matched) { mosqueName = matched.name; district = matched.district; }
      }

      const photosArray = [];
      if (window.uploadedPhotos[1]) photosArray.push(window.uploadedPhotos[1]);
      if (window.uploadedPhotos[2]) photosArray.push(window.uploadedPhotos[2]);

      const btn = document.getElementById('btnSubmitForm');
      const origText = btn.innerHTML;
      const isEditing = !!editingVisitId;
      btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> <span>${isEditing ? 'Güncelleniyor...' : 'Defter Yazılıyor...'}</span>`;
      btn.disabled = true;

      if (isEditing) {
        const idx = visitsData.findIndex(v => v.id === editingVisitId);
        if (idx === -1) {
          showToast("Düzenlenecek kayıt bulunamadı.", "error");
          btn.innerHTML = origText; btn.disabled = false;
          return;
        }
        const backup = { ...visitsData[idx] };
        const updatedRecord = {
          ...visitsData[idx], mosqueId, mosqueName, district, prayerTime,
          address: address || visitsData[idx].address || '',
          date, time, notes, photos: photosArray
        };
        visitsData[idx] = updatedRecord;
        sortVisitsInMemory();
        const ok = await persistNewVisit(updatedRecord);

        if (ok) {
          window.haptic(20);
          showToast("Kaydınız güncellendi.", "success");
          cancelEditVisit();
          triggerAllUIUpdates();
          switchTab(3);
        } else {
          const revertIdx = visitsData.findIndex(v => v.id === updatedRecord.id);
          if (revertIdx !== -1) visitsData[revertIdx] = backup;
        }
        btn.innerHTML = origText;
        btn.disabled = false;
        return;
      }

      const newRecord = {
        id: "v-" + Date.now(), mosqueId, mosqueName, district, prayerTime,
        address: address || (PRESET_MOSQUES.find(m => m.id === mosqueId)?.address || ''),
        date, time, notes, photos: photosArray, createdAt: new Date().toISOString()
      };

      visitsData.push(newRecord);
      sortVisitsInMemory();
      const ok = await persistNewVisit(newRecord);

      if (ok) {
        window.haptic([16, 55, 20]);
        showToast("İbadet kaydınız deftere işlendi. Allah kabul etsin!", "success");
        document.getElementById('visitForm').reset();
        window.uploadedPhotos = { 1: null, 2: null };
        resetPhotoPreview(1);
        resetPhotoPreview(2);
        document.querySelectorAll('.prayer-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('formPrayerSelected').value = "";
        toggleCustomMosqueInput();
        setTodayDateTime();
        triggerAllUIUpdates();
        switchTab(3);
      } else {
        visitsData = visitsData.filter(v => v.id !== newRecord.id);
      }

      btn.innerHTML = origText;
      btn.disabled = false;
    };
    // === MEVCUT DEFTER KAYDINI DÜZENLEME ===
    window.triggerEditVisit = function(id) {
      const v = visitsData.find(x => x.id === id);
      if (!v) return;
      editingVisitId = id;

      const select = document.getElementById('formMosqueSelect');
      const hasOption = Array.from(select.options).some(o => o.value === v.mosqueId);
      if (hasOption) {
        select.value = v.mosqueId;
        document.getElementById('customMosqueSection').classList.add('hidden');
        document.getElementById('formCustomName').required = false;
      } else {
        select.value = 'custom';
        document.getElementById('customMosqueSection').classList.remove('hidden');
        document.getElementById('formCustomName').value = v.mosqueName;
        document.getElementById('formCustomName').required = true;
        const distSel = document.getElementById('formCustomDistrict');
        if (distSel) {
          const opt = Array.from(distSel.options).find(o => o.value === v.district);
          if (opt) distSel.value = v.district;
        }
      }

      selectPrayer(v.prayerTime);
      document.getElementById('formAddress').value = v.address || '';
      document.getElementById('formDate').value = v.date || '';
      document.getElementById('formTime').value = v.time || '';
      document.getElementById('formNotes').value = v.notes || '';

      window.uploadedPhotos = {
        1: (v.photos && v.photos[0]) || null,
        2: (v.photos && v.photos[1]) || null
      };
      for (let i = 1; i <= 2; i++) {
        if (window.uploadedPhotos[i]) {
          const preview = document.getElementById(`photoPreview${i}`);
          preview.src = window.uploadedPhotos[i];
          preview.classList.remove('hidden');
          document.getElementById(`photoPlaceholder${i}`).classList.add('hidden');
          document.getElementById(`btnRemovePhoto${i}`).classList.remove('hidden');
        } else {
          resetPhotoPreview(i);
        }
      }

      document.getElementById('btnSubmitForm').innerHTML = `<i class="fa-solid fa-floppy-disk"></i> <span>Kaydı Güncelle</span>`;
      document.getElementById('editModeNotice').classList.remove('hidden');

      switchTab(2);
    };
    window.cancelEditVisit = function() {
      editingVisitId = null;
      document.getElementById('visitForm').reset();
      window.uploadedPhotos = { 1: null, 2: null };
      resetPhotoPreview(1);
      resetPhotoPreview(2);
      document.querySelectorAll('.prayer-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('formPrayerSelected').value = '';
      toggleCustomMosqueInput();
      setTodayDateTime();
      document.getElementById('btnSubmitForm').innerHTML = `<i class="fa-solid fa-heart-circle-check"></i> <span>Vakti Deftere İşle</span>`;
      document.getElementById('editModeNotice').classList.add('hidden');
    };
    // 9. FOTOĞRAF ÖN İZLEME VE İŞLEME
    window.processAndPreviewImage = async function(input, index) {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const placeholder = document.getElementById(`photoPlaceholder${index}`);
        const origContent = placeholder.innerHTML;
        placeholder.innerHTML = `<i class="fa-solid fa-spinner animate-spin" style="color:var(--teal-700);"></i><p class="text-[8px] mt-0.5" style="color:var(--ink-soft);">İşleniyor...</p>`;

        try {
          const base64Data = await window.compressImage(file);
          window.uploadedPhotos[index] = base64Data;
          const preview = document.getElementById(`photoPreview${index}`);
          preview.src = base64Data;
          preview.classList.remove('hidden');
          placeholder.classList.add('hidden');
          document.getElementById(`btnRemovePhoto${index}`).classList.remove('hidden');
        } catch (err) {
          const messages = {
            HEIC_LIB_MISSING: "HEIC dönüştürücü yüklenemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.",
            HEIC_CONVERT_ERROR: "Bu HEIC fotoğraf dönüştürülemedi. Galeriden JPG/PNG olarak paylaşmayı deneyin.",
            READ_ERROR: "Dosya okunamadı. Lütfen tekrar deneyin.",
            DECODE_ERROR: "Bu görsel açılamadı. Farklı bir fotoğraf deneyin.",
            TIMEOUT: "Fotoğraf işlenemedi (zaman aşımı). Daha küçük bir fotoğraf deneyin."
          };
          showToast(messages[err?.message] || "Görsel işlenemedi. Lütfen başka bir fotoğraf deneyin.", "error");
          placeholder.innerHTML = origContent;
          input.value = '';
        }
      }
    };
    window.removePhoto = function(index) {
      window.uploadedPhotos[index] = null;
      resetPhotoPreview(index);
    };
    function resetPhotoPreview(index) {
      const input = document.getElementById(`photoInput${index}`);
      if (input) input.value = '';
      const preview = document.getElementById(`photoPreview${index}`);
      if (preview) { preview.removeAttribute('src'); preview.classList.add('hidden'); }
      const placeholder = document.getElementById(`photoPlaceholder${index}`);
      if (placeholder) placeholder.classList.remove('hidden');
      const removeBtn = document.getElementById(`btnRemovePhoto${index}`);
      if (removeBtn) removeBtn.classList.add('hidden');
    }
    // 10. NAMAZ SEÇİMİ
    window.selectPrayer = function(prayer) {
      window.haptic(15);
      document.querySelectorAll('.prayer-btn').forEach(btn => btn.classList.remove('active'));
      const selectedBtn = document.getElementById(`btn-p-${prayer}`);
      if (selectedBtn) selectedBtn.classList.add('active');
      document.getElementById('formPrayerSelected').value = prayer;
    };
    function setTodayDateTime() {
      const now = new Date();
      document.getElementById('formDate').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      document.getElementById('formTime').value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    // 12. MOBİL SEKME GEÇİŞİ 
    window.toggleGeofencing = function(enabled) {
      localStorage.setItem('manevi-atlas-geofencing-enabled', enabled ? '1' : '0');
      if (window.__geofencing) {
        if (enabled) window.__geofencing.startTracking();
        else window.__geofencing.stopTracking();
      }
      showToast(enabled ? "Konum asistanı aktif." : "Konum asistanı kapatıldı.", "success");
    };

    window.switchTab = function(index) {
      const isChanging = index !== currentActiveTab;
      if (isChanging) window.haptic(15);
      currentActiveTab = index;
      document.getElementById('tabViewport').style.transform = `translateX(-${index * 20}%)`;
      document.getElementById('navIndicator').style.left = `${index * 20}%`;

      for (let i = 0; i < 5; i++) {
        const btn = document.getElementById(`nav-btn-${i}`);
        btn.classList.toggle('active', i === index);
      }

      if (index === 1) updateMosquesListUI();

      const panels = document.querySelectorAll('.tab-panel');
      const activePanel = panels[index];
      if (activePanel) {
        activePanel.scrollTo({ top: 0, behavior: 'instant' });
        // Sekmeye girişte hafif bir "içerik canlanması" hissi için mevcut
        // fade-in-up animasyonunu yeniden tetikle (kayma animasyonuna ek olarak).
        if (isChanging) {
          activePanel.classList.remove('tab-content-pop');
          void activePanel.offsetWidth; // reflow: animasyonu yeniden başlatmak için
          activePanel.classList.add('tab-content-pop');
        }
      }
    };
    // 13. PARMAK KAYDIRMA (SWIPE)
    let touchStartX = 0, touchEndX = 0;
    const swipeContainer = document.getElementById('swipeContainer');
    swipeContainer.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    swipeContainer.addEventListener('touchend', e => { touchEndX = e.changedTouches[0].screenX; handleSwipe(); }, { passive: true });
    function handleSwipe() {
      const threshold = 75;
      const diff = touchStartX - touchEndX;
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      if (diff > threshold && currentActiveTab < 4) switchTab(currentActiveTab + 1);
      else if (diff < -threshold && currentActiveTab > 0) switchTab(currentActiveTab - 1);
    }
    // 13b. AŞAĞI ÇEKEREK YENİLEME (PULL TO REFRESH)
    let ptrStartY = 0;
    let ptrTracking = false;
    let ptrPulling = false;
    let ptrDistance = 0;
    let ptrRefreshing = false;
    const PTR_THRESHOLD = 68;
    const PTR_MAX = 110;
    function ptrGetActivePanel() {
      const panels = document.querySelectorAll('.tab-panel');
      return panels[currentActiveTab] || null;
    }
    function ptrSetIndicator(distance, state) {
      const wrap = document.getElementById('pullToRefreshIndicator');
      const icon = document.getElementById('pullToRefreshIcon');
      const label = document.getElementById('pullToRefreshLabel');
      if (!wrap || !icon || !label) return;
      const height = Math.max(0, Math.min(distance, PTR_MAX));
      wrap.style.height = `${height}px`;
      wrap.style.opacity = height > 4 ? '1' : '0';

      if (state === 'refreshing') {
        icon.className = 'fa-solid fa-spinner animate-spin text-[11px]';
        icon.style.transform = 'none';
        label.textContent = 'Yenileniyor...';
      } else if (distance >= PTR_THRESHOLD) {
        icon.className = 'fa-solid fa-arrow-down text-[11px] transition-transform';
        icon.style.transform = 'rotate(180deg)';
        label.textContent = 'Bırakınca yenilenir';
      } else {
        icon.className = 'fa-solid fa-arrow-down text-[11px] transition-transform';
        icon.style.transform = 'none';
        label.textContent = 'Yenilemek için çek';
      }
    }
    function ptrReset(animated) {
      const wrap = document.getElementById('pullToRefreshIndicator');
      if (wrap) {
        wrap.style.transition = animated ? 'height .25s ease, opacity .2s ease' : 'none';
        wrap.style.height = '0';
        wrap.style.opacity = '0';
      }
      ptrDistance = 0;
      ptrPulling = false;
      ptrTracking = false;
    }
    async function refreshAppData() {
      if (ptrRefreshing) return;
      ptrRefreshing = true;
      ptrSetIndicator(PTR_MAX, 'refreshing');
      window.haptic(15);
      const minDisplay = new Promise(r => setTimeout(r, 550));
      try {
        loadCustomAddedMosques();
        applyMosqueOverrides();
        loadMosqueInfoOverrides();
        loadFavorites();
        loadRatings();
        await loadVisits();
        loadProfileData();
        displayDailyVerse();
        triggerAllUIUpdates();
        await initPrayerCountdown();
        // Yenilerken sunucuda yeni bir sürüm olup olmadığını da kontrol et.
        // Sadece bir banner bırakıp kullanıcının fark etmesini beklemek yerine,
        // kullanıcı zaten "en güncel bilgiyi getir" niyetiyle aşağı çektiği için
        // bir güncelleme bulunursa doğrudan uygula: önbellek temizlenir ve sayfa
        // sıfırdan (en güncel cami/bilgi listesiyle) yeniden yüklenir.
        const updateAvailable = await checkForAppUpdate();
        if (updateAvailable) {
          await minDisplay;
          ptrRefreshing = false;
          ptrReset(true);
          window.applyAppUpdate();
          return;
        }
        showToast('Kayıtlar güncellendi.', 'success');
      } catch (e) {
        showToast('Yenileme sırasında bir sorun oluştu.', 'error');
      }
      await minDisplay;
      ptrRefreshing = false;
      ptrReset(true);
    }
    swipeContainer.addEventListener('touchstart', e => {
      if (ptrRefreshing) return;
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      const panel = ptrGetActivePanel();
      if (!panel || panel.scrollTop > 0) { ptrTracking = false; return; }
      ptrStartY = e.touches[0].screenY;
      ptrTracking = true;
      ptrPulling = false;
    }, { passive: true });
    swipeContainer.addEventListener('touchmove', e => {
      if (!ptrTracking || ptrRefreshing) return;
      const panel = ptrGetActivePanel();
      if (!panel || panel.scrollTop > 0) { ptrReset(false); return; }
      const currentY = e.touches[0].screenY;
      const deltaY = currentY - ptrStartY;
      if (deltaY <= 0) { ptrReset(false); return; }
      ptrPulling = true;
      ptrDistance = Math.min(deltaY * 0.5, PTR_MAX);
      ptrSetIndicator(ptrDistance, 'pulling');
    }, { passive: true });
    swipeContainer.addEventListener('touchend', () => {
      if (!ptrTracking) return;
      if (ptrPulling && ptrDistance >= PTR_THRESHOLD) {
        refreshAppData();
      } else {
        ptrReset(true);
      }
      ptrTracking = false;
    }, { passive: true });
    // 15. TOAST
    window.showToast = function(message, type = "success") {
      const toast = document.getElementById('toastNotification');
      const msgEl = document.getElementById('toastMessage');
      const iconEl = document.getElementById('toastIcon');
      msgEl.textContent = message;
      iconEl.innerHTML = type === "success"
        ? `<i class="fa-solid fa-circle-check text-base" style="color:var(--gold);"></i>`
        : `<i class="fa-solid fa-circle-xmark text-base" style="color:var(--brick-soft);"></i>`;
      toast.classList.remove('opacity-0', '-translate-y-4');
      toast.classList.add('opacity-100', 'translate-y-0');
      setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', '-translate-y-4');
      }, 3000);
    };

    // 16. LIGHTBOX (Fotoğraf Büyütme / Yakınlaştırma / Gezinme)
    let lightboxPhotos = [];
    let lightboxIndex = 0;
    let lbScale = 1, lbX = 0, lbY = 0;
    let lbLastTapTime = 0;
    let lbPointers = new Map();
    let lbStartDist = 0, lbStartScale = 1;
    let lbDragging = false, lbDragStartX = 0, lbDragStartY = 0, lbStartX = 0, lbStartY = 0;
    window.openLightbox = function(src, photosList, index) {
      lightboxPhotos = (photosList && photosList.length) ? photosList : [src];
      lightboxIndex = index || 0;
      renderLightboxImage();
      document.getElementById('lightboxModal').classList.remove('hidden');
    };
    window.openLightboxFromRecord = function(recordId, index) {
      const photos = (window.photoGalleries && window.photoGalleries[recordId]) || [];
      if (!photos.length) return;
      openLightbox(photos[index], photos, index);
    };
    function renderLightboxImage() {
      resetLightboxZoom();
      const img = document.getElementById('lightboxImage');
      img.onerror = () => window.__imgFallback(img);
      img.src = lightboxPhotos[lightboxIndex];
      const counter = document.getElementById('lightboxCounter');
      const prevBtn = document.getElementById('lightboxPrevBtn');
      const nextBtn = document.getElementById('lightboxNextBtn');
      if (lightboxPhotos.length > 1) {
        counter.textContent = `${lightboxIndex + 1} / ${lightboxPhotos.length}`;
        prevBtn.classList.toggle('hidden', lightboxIndex === 0);
        nextBtn.classList.toggle('hidden', lightboxIndex === lightboxPhotos.length - 1);
      } else {
        counter.textContent = '';
        prevBtn.classList.add('hidden');
        nextBtn.classList.add('hidden');
      }
    }
    window.lightboxNav = function(dir) {
      const next = lightboxIndex + dir;
      if (next < 0 || next >= lightboxPhotos.length) return;
      lightboxIndex = next;
      renderLightboxImage();
    };
    function resetLightboxZoom() {
      lbScale = 1; lbX = 0; lbY = 0;
      applyLightboxTransform(true);
    }
    function applyLightboxTransform(animated) {
      const img = document.getElementById('lightboxImage');
      img.style.transition = animated ? 'transform 0.18s ease' : 'none';
      img.style.transform = `translate(${lbX}px, ${lbY}px) scale(${lbScale})`;
    }
    window.lightboxZoom = function(delta) {
      lbScale = Math.min(4, Math.max(1, +(lbScale + delta).toFixed(2)));
      if (lbScale === 1) { lbX = 0; lbY = 0; }
      applyLightboxTransform(true);
    };
    window.downloadLightboxImage = function() {
      try {
        const img = document.getElementById('lightboxImage');
        const a = document.createElement('a');
        a.href = img.src;
        a.download = `bursa-manevi-atlas-hatira-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (e) {
        showToast("Fotoğraf indirilemedi.", "error");
      }
    };
    window.closeLightbox = function() {
      document.getElementById('lightboxModal').classList.add('hidden');
      resetLightboxZoom();
    };
    document.getElementById('lightboxModal').addEventListener('click', function(e) { if (e.target === this) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (document.getElementById('lightboxModal').classList.contains('hidden')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') lightboxNav(1);
      if (e.key === 'ArrowLeft') lightboxNav(-1);
    });
    // Pinch-to-zoom, çift dokunma ve sürükleyerek gezinme (dokunmatik + fare)
    const lbViewport = document.getElementById('lightboxViewport');
    function lbDistance(p1, p2) { return Math.hypot(p1.x - p2.x, p1.y - p2.y); }
    lbViewport.addEventListener('pointerdown', (e) => {
      lbViewport.setPointerCapture(e.pointerId);
      lbPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (lbPointers.size === 1) {
        lbDragging = true;
        lbDragStartX = e.clientX; lbDragStartY = e.clientY;
        lbStartX = lbX; lbStartY = lbY;

        const now = Date.now();
        if (now - lbLastTapTime < 300) {
          if (lbScale > 1) { resetLightboxZoom(); }
          else { lbScale = 2.5; applyLightboxTransform(true); }
          lbLastTapTime = 0;
        } else {
          lbLastTapTime = now;
        }
      } else if (lbPointers.size === 2) {
        lbDragging = false;
        const pts = Array.from(lbPointers.values());
        lbStartDist = lbDistance(pts[0], pts[1]);
        lbStartScale = lbScale;
      }
    });
    lbViewport.addEventListener('pointermove', (e) => {
      if (!lbPointers.has(e.pointerId)) return;
      lbPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (lbPointers.size === 2) {
        const pts = Array.from(lbPointers.values());
        const dist = lbDistance(pts[0], pts[1]);
        lbScale = Math.min(4, Math.max(1, lbStartScale * (dist / lbStartDist)));
        applyLightboxTransform(false);
      } else if (lbPointers.size === 1 && lbDragging && lbScale > 1) {
        lbX = lbStartX + (e.clientX - lbDragStartX);
        lbY = lbStartY + (e.clientY - lbDragStartY);
        applyLightboxTransform(false);
      }
    });
    function lbPointerEnd(e) {
      lbPointers.delete(e.pointerId);
      lbDragging = false;
      if (lbScale < 1) resetLightboxZoom();
      else applyLightboxTransform(true);
    }
    lbViewport.addEventListener('pointerup', lbPointerEnd);
    lbViewport.addEventListener('pointercancel', lbPointerEnd);
    lbViewport.addEventListener('pointerleave', lbPointerEnd);
    lbViewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      lbScale = Math.min(4, Math.max(1, +(lbScale - e.deltaY * 0.0015 * lbScale).toFixed(2)));
      if (lbScale === 1) { lbX = 0; lbY = 0; }
      applyLightboxTransform(false);
    }, { passive: false });
    // 17. UYGULAMA OLARAK YÜKLEME (PWA install prompt)
    let deferredInstallPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      document.getElementById('installBanner').classList.remove('hidden');
    });
    document.getElementById('installBtn').addEventListener('click', async () => {
      document.getElementById('installBanner').classList.add('hidden');
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
    });
    document.getElementById('installDismissBtn').addEventListener('click', () => {
      document.getElementById('installBanner').classList.add('hidden');
    });
    window.addEventListener('appinstalled', () => {
      document.getElementById('installBanner').classList.add('hidden');
      showToast('Uygulama ana ekranınıza yüklendi!', 'success');
    });
    // 17b. ÇEVRİMDIŞI MOD ROZETİ
    // Tarayıcının navigator.onLine / 'online' / 'offline' sinyallerine göre
    // üst bardaki rozeti göster/gizle. İnternet giderken normal "Kayıtlar
    // Hazır" senkron rozetiyle çakışmaması için o rozet geçici olarak gizlenir
    // (internet gelince tekrar görünür).
    function updateOfflineModeBadge() {
      const badge = document.getElementById('offlineModeBadge');
      const sync = document.getElementById('syncStatus');
      if (!badge) return;
      if (navigator.onLine) {
        badge.classList.add('hidden');
        badge.classList.remove('flex');
        if (sync) sync.classList.remove('hidden');
      } else {
        badge.classList.remove('hidden');
        badge.classList.add('flex');
        if (sync) sync.classList.add('hidden');
      }
    }
    window.addEventListener('online', updateOfflineModeBadge);
    window.addEventListener('offline', updateOfflineModeBadge);
    updateOfflineModeBadge();

    // 18. SERVICE WORKER KAYDI (çevrimdışı açılış desteği) + GÜNCELLEME TESPİTİ
    // Basit "register et ve unut" yerine: yeni bir sürüm sunucuya yüklendiğinde
    // bunu olabildiğince erken fark edip kullanıcıya güncelleme bandını
    // gösteriyoruz. Servis çalışanı hazır ("installed") ama henüz devrede
    // değilse (sayfa hâlâ eski koda bağlıyken), window.__pendingSW olarak
    // saklıyoruz; kullanıcı "Güncelle"ye basınca ona SKIP_WAITING mesajı
    // gönderiyoruz (bkz. applyAppUpdate ve sw.js).
    //
    // ÖNEMLİ: Site GitHub Pages üzerinden (Fastly CDN) yayınlanıyor ve .htaccess
    // gibi sunucu taraflı önbellek kurallarına izin vermiyor. Bu yüzden sw.js
    // dosyasını HER DEPLOY'DA farklı bir ?v= sorgu parametresiyle kaydediyoruz;
    // tarayıcı/CDN bu tam URL'i daha önce hiç görmediği için önbellek
    // ne kadar agresif olursa olsun mecburen sıfırdan indirir. CACHE_NAME'i
    // sw.js içinde artırdığım her seferde bu SW_REGISTER_VERSION'ı da artıracağım.
    const SW_REGISTER_VERSION = "v43";
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register(`sw.js?v=${SW_REGISTER_VERSION}`).then((reg) => {
          reg.addEventListener('updatefound', () => {
            const newSW = reg.installing;
            if (!newSW) return;
            newSW.addEventListener('statechange', () => {
              if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                window.__pendingSW = newSW;
                const banner = document.getElementById('appUpdateBanner');
                if (banner) banner.classList.remove('hidden');
              }
            });
          });
          // Uygulama arka plandan öne geldiğinde veya her saat başı, sunucuda
          // yeni bir sw.js olup olmadığını sessizce kontrol et (bu, kullanıcının
          // uygulamayı yalnızca ana ekran ikonundan açtığı ve hiç manuel
          // "Kontrol Et" demediği durumlarda güncellemenin fark edilmesini sağlar).
          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') reg.update().catch(() => {});
          });
          setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
        }).catch(() => {});
      });

      // Yeni SW devraldığı an (skipWaiting sonrası) sayfayı bir kez yenile.
      let __swRefreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (__swRefreshing) return;
        __swRefreshing = true;
        window.location.reload();
      });
    }
