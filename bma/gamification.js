/**
 * gamification.js — Manevi Seri ve Dijital Koleksiyon Sistemi
 * Bu modül, kullanıcının ziyaret verilerini analiz ederek rozetler ve seriler üretir.
 */

(function() {
    'use strict';

    const BADGES_KEY = 'manevi-atlas-badges';
    
    // Rozet Tanımları
    const BADGE_DEFINITIONS = {
        // Milestone Rozetleri
        // NOT: 10 cami eşiği kaldırıldı — bu artık "Türbedar" unvanıyla birebir
        // aynı anlama geliyordu (bkz. stats.js -> getCurrentUnvan). Unvan sistemi
        // aşamalı ilerlemeyi, rozetler ise ek/özel başarımları temsil eder.
        'milestone-50': { id: 'milestone-50', title: 'Deneyimli Seyyah', desc: '50 farklı cami ziyareti', icon: '🥈', color: '#C0C0C0' },
        'milestone-100': { id: 'milestone-100', title: 'Bursa Rehberi', desc: '100 farklı cami ziyareti', icon: '🥇', color: '#FFD700' },
        
        // Seri Rozetleri
        'streak-fajr-7': { id: 'streak-fajr-7', title: 'Nur Taneleri', desc: '7 gün üst üste Sabah namazı', icon: '✨', color: '#6366F1' },
        'streak-multi-5': { id: 'streak-multi-5', title: 'Günün Seyyahı', desc: 'Aynı gün içinde 5 farklı cami', icon: '🐎', color: '#10B981' },
        
        // Özel Cami Koleksiyonu (Digital Stamps)
        'stamp-ulu-cami': { id: 'stamp-ulu-cami', title: 'Ulu Mabet', desc: 'Ulu Cami ziyareti', icon: '🕌', color: '#064E3B' },
        'stamp-yesil-cami': { id: 'stamp-yesil-cami', title: 'Çini Ustası', desc: 'Yeşil Cami ziyareti', icon: '💠', color: '#059669' },
        'stamp-emir-sultan': { id: 'stamp-emir-sultan', title: 'Gönül Sultanı', desc: 'Emir Sultan Camii ziyareti', icon: '🕊️', color: '#047857' },
        'stamp-muradiye': { id: 'stamp-muradiye', title: 'Saray Bahçesi', desc: 'Muradiye Camii ziyareti', icon: '🌸', color: '#065F46' }
    };

    window.__gamification = {
        earnedBadges: [],
        
        init: function() {
            this.loadEarnedBadges();
            this.checkAllAchievements();
        },

        loadEarnedBadges: function() {
            try {
                const raw = localStorage.getItem(BADGES_KEY);
                this.earnedBadges = raw ? JSON.parse(raw) : [];
            } catch (e) {
                this.earnedBadges = [];
            }
        },

        saveBadges: function() {
            localStorage.setItem(BADGES_KEY, JSON.stringify(this.earnedBadges));
        },

        earnBadge: function(badgeId) {
            if (this.earnedBadges.includes(badgeId)) return;
            
            this.earnedBadges.push(badgeId);
            this.saveBadges();
            
            const badge = BADGE_DEFINITIONS[badgeId];
            if (badge) {
                this.showBadgeNotification(badge);
            }
        },

        showBadgeNotification: function(badge) {
            if (typeof showToast === 'function') {
                showToast(`🎉 Tebrikler! "${badge.title}" rozetini kazandınız.`, 'success');
            }
            this.showBadgeModal(badge);
        },

        showBadgeModal: function(badge) {
            const modalHtml = `
                <div id="badgeModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
                    <div class="bg-white rounded-3xl p-6 w-full max-w-xs transform transition-transform duration-300 scale-95 shadow-2xl text-center">
                        <div class="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl shadow-inner" style="background:rgba(195,154,69,0.12);">
                            ${badge.icon}
                        </div>
                        <h2 class="text-lg font-black mb-1" style="color:var(--ink);">Yeni Rozet!</h2>
                        <h3 class="text-sm font-bold mb-2" style="color:var(--gold-deep);">${badge.title}</h3>
                        <p class="text-[11px] mb-6" style="color:var(--ink-soft);">${badge.desc}</p>
                        <button onclick="document.getElementById('badgeModal').remove()" 
                                class="w-full py-3 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-transform" 
                                style="background:var(--teal-900);">Harika!</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // Haptic feedback if available
            if (window.haptic) window.haptic([20, 50, 20, 50, 30]);
            
            // Animasyon için
            setTimeout(() => {
                const m = document.getElementById('badgeModal');
                if (m) {
                    m.firstElementChild.classList.remove('scale-95');
                    m.firstElementChild.classList.add('scale-100');
                }
            }, 10);
        },

        // Rozet ızgarasındaki herhangi bir rozete dokunulduğunda çağrılır.
        // Kazanılmışsa "nasıl kazandın" bilgisini, kazanılmamışsa "nasıl kazanılır"
        // bilgisini aynı yalın kart tasarımıyla gösterir — böylece kullanıcı
        // rozet mantığını mobilde de (hover olmadan) anlayabilir.
        showBadgeDetail: function(badgeId) {
            const badge = BADGE_DEFINITIONS[badgeId];
            if (!badge) return;

            const earned = this.earnedBadges.includes(badgeId);
            const existing = document.getElementById('badgeDetailModal');
            if (existing) existing.remove();

            const modalHtml = `
                <div id="badgeDetailModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onclick="if(event.target===this) this.remove()">
                    <div class="bg-white rounded-3xl p-6 w-full max-w-xs transform transition-transform duration-300 scale-95 shadow-2xl text-center">
                        <div class="relative w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl shadow-inner ${earned ? '' : 'grayscale opacity-60'}" style="background:rgba(195,154,69,0.12);">
                            ${badge.icon}
                            ${earned ? '' : `
                                <span class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-[11px] shadow-md" style="background:var(--ink-faint); color:#fff;">
                                    <i class="fa-solid fa-lock"></i>
                                </span>
                            `}
                        </div>
                        <span class="inline-block text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2" style="background:${earned ? 'rgba(21,90,76,0.1)' : 'rgba(0,0,0,0.06)'}; color:${earned ? 'var(--teal-700)' : 'var(--ink-faint)'};">
                            ${earned ? '✓ Kazanıldı' : 'Henüz Kazanılmadı'}
                        </span>
                        <h3 class="text-sm font-bold mb-2" style="color:var(--gold-deep);">${badge.title}</h3>
                        <p class="text-[9px] font-bold uppercase tracking-wider mb-1" style="color:var(--ink-faint);">${earned ? 'Nasıl Kazandın' : 'Nasıl Kazanılır'}</p>
                        <p class="text-[11px] mb-6" style="color:var(--ink-soft);">${badge.desc}</p>
                        <button onclick="document.getElementById('badgeDetailModal').remove()" 
                                class="w-full py-3 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-transform" 
                                style="background:var(--teal-900);">Anladım</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            if (window.haptic) window.haptic(earned ? [16, 40, 16] : 12);

            setTimeout(() => {
                const m = document.getElementById('badgeDetailModal');
                if (m) {
                    m.firstElementChild.classList.remove('scale-95');
                    m.firstElementChild.classList.add('scale-100');
                }
            }, 10);
        },

        checkAllAchievements: function() {
            if (!window.visitsData || window.visitsData.length === 0) return;

            const uniqueMosqueIds = new Set(window.visitsData.map(v => v.mosqueId));
            
            // 1. Milestone Kontrolleri
            if (uniqueMosqueIds.size >= 50) this.earnBadge('milestone-50');
            if (uniqueMosqueIds.size >= 100) this.earnBadge('milestone-100');

            // 2. Özel Cami Kontrolleri
            if (uniqueMosqueIds.has('ulu-cami')) this.earnBadge('stamp-ulu-cami');
            if (uniqueMosqueIds.has('yesil-cami')) this.earnBadge('stamp-yesil-cami');
            if (uniqueMosqueIds.has('emir-sultan')) this.earnBadge('stamp-emir-sultan');
            if (uniqueMosqueIds.has('muradiye')) this.earnBadge('stamp-muradiye');

            // 3. Seri Kontrolleri
            this.checkStreaks();
        },

        checkStreaks: function() {
            const visits = [...window.visitsData].sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Aynı gün içinde 5 farklı cami
            const visitsByDate = {};
            visits.forEach(v => {
                if (!v.date) return;
                if (!visitsByDate[v.date]) visitsByDate[v.date] = new Set();
                visitsByDate[v.date].add(v.mosqueId);
            });

            Object.values(visitsByDate).forEach(mosqueSet => {
                if (mosqueSet.size >= 5) this.earnBadge('streak-multi-5');
            });

            // 7 gün üst üste Sabah namazı
            const fajrDates = [...new Set(visits.filter(v => v.prayerTime === 'Sabah' && v.date).map(v => v.date))].sort();
            if (fajrDates.length >= 7) {
                let currentStreak = 1;
                for (let i = 1; i < fajrDates.length; i++) {
                    const d1 = new Date(fajrDates[i-1]);
                    const d2 = new Date(fajrDates[i]);
                    const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === 1) {
                        currentStreak++;
                        if (currentStreak >= 7) {
                            this.earnBadge('streak-fajr-7');
                            break;
                        }
                    } else {
                        currentStreak = 1;
                    }
                }
            }
        },

        getBadgeList: function() {
            return Object.values(BADGE_DEFINITIONS).map(b => ({
                ...b,
                earned: this.earnedBadges.includes(b.id)
            }));
        }
    };

    // Global erişim için
    window.initGamification = function() {
        window.__gamification.init();
    };

})();
