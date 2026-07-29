/**
 * geofencing.js — Akıllı Konum Farkındalığı ve Proaktif Bildirim Sistemi
 * Kullanıcının konumunu takip eder ve tarihi camilere yaklaştığında bildirim gönderir.
 */

(function() {
    'use strict';

    const GEOFENCE_RADIUS_METERS = 100; // 100 metre yaklaşınca uyar
    const NOTIFICATION_COOLDOWN_MS = 1000 * 60 * 60 * 4; // Aynı cami için 4 saatte bir bildirim
    const LAST_NOTIFIED_KEY = 'manevi-atlas-last-notified';

    window.__geofencing = {
        watchId: null,
        lastNotified: {}, // { mosqueId: timestamp }
        isTracking: false,

        init: function() {
            this.loadState();
            this.requestPermissions();
        },

        loadState: function() {
            try {
                const raw = localStorage.getItem(LAST_NOTIFIED_KEY);
                this.lastNotified = raw ? JSON.parse(raw) : {};
            } catch (e) { this.lastNotified = {}; }
        },

        saveState: function() {
            localStorage.setItem(LAST_NOTIFIED_KEY, JSON.stringify(this.lastNotified));
        },

        requestPermissions: function() {
            if (!("Notification" in window)) return;
            
            if (Notification.permission !== "granted" && Notification.permission !== "denied") {
                Notification.requestPermission();
            }
        },

        startTracking: function() {
            if (this.isTracking || !navigator.geolocation) return;

            this.isTracking = true;
            this.watchId = navigator.geolocation.watchPosition(
                (pos) => this.checkProximity(pos.coords),
                (err) => console.error("Konum takibi hatası:", err),
                {
                    enableHighAccuracy: true,
                    maximumAge: 30000,
                    timeout: 27000
                }
            );
            console.log("Geofencing takibi başlatıldı.");
        },

        stopTracking: function() {
            if (this.watchId) {
                navigator.geolocation.clearWatch(this.watchId);
                this.watchId = null;
            }
            this.isTracking = false;
        },

        checkProximity: function(coords) {
            if (typeof mosqueGeocodeCache === 'undefined') return;

            const userPos = { lat: coords.latitude, lng: coords.longitude };
            
            // Sadece Preset camileri kontrol et
            PRESET_MOSQUES.forEach(mosque => {
                const mosqueCoords = mosqueGeocodeCache[mosque.id];
                if (!mosqueCoords) return;

                const distance = this.calculateDistance(userPos, mosqueCoords);
                
                if (distance <= GEOFENCE_RADIUS_METERS) {
                    this.notifyUser(mosque);
                }
            });
        },

        calculateDistance: function(p1, p2) {
            const R = 6371e3; // Metre cinsinden dünya yarıçapı
            const φ1 = p1.lat * Math.PI/180;
            const φ2 = p2.lat * Math.PI/180;
            const Δφ = (p2.lat-p1.lat) * Math.PI/180;
            const Δλ = (p2.lng-p1.lng) * Math.PI/180;

            const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                      Math.cos(φ1) * Math.cos(φ2) *
                      Math.sin(Δλ/2) * Math.sin(Δλ/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

            return R * c;
        },

        notifyUser: function(mosque) {
            const now = Date.now();
            const lastTime = this.lastNotified[mosque.id] || 0;

            // Cooldown kontrolü (Sık sık aynı cami için bildirim gönderme)
            if (now - lastTime < NOTIFICATION_COOLDOWN_MS) return;

            // Ziyaret edilip edilmediğini kontrol et (Zaten ziyaret edildiyse bildirim gönderme)
            const isVisited = visitsData.some(v => v.mosqueId === mosque.id);
            if (isVisited) return;

            this.lastNotified[mosque.id] = now;
            this.saveState();

            if (Notification.permission === "granted") {
                const options = {
                    body: `Şu an tarihi ${mosque.name} yanındasınız. Bir vakit namazı kılıp defterinize işlemek ister misiniz?`,
                    icon: 'icons/icon-192.png',
                    badge: 'icons/icon-192.png',
                    vibrate: [200, 100, 200],
                    tag: 'geofence-' + mosque.id,
                    data: { mosqueId: mosque.id }
                };

                // Service Worker üzerinden bildirim gönder (Arka plan desteği için)
                if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.ready.then(registration => {
                        registration.showNotification("Manevi Atlas Asistanı", options);
                    });
                } else {
                    new Notification("Manevi Atlas Asistanı", options);
                }
            }
        }
    };

    // Global erişim
    window.initGeofencing = function() {
        window.__geofencing.init();
        // Uygulama açıldığında takibi başlat (Kullanıcı ayarlarından kapatılabilir)
        if (localStorage.getItem('manevi-atlas-geofencing-enabled') !== '0') {
            window.__geofencing.startTracking();
        }
    };

})();
