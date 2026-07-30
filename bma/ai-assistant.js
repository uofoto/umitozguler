/**
 * ai-assistant.js — Google Gemini Destekli Manevi Rehber ve Sesli Asistan
 * Bu modül, Google Gemini API kullanarak cami verileriyle soruları yanıtlar.
 */

(function() {
    'use strict';

    const AI_CONFIG = {
        model: 'gemini-1.5-flash',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/'
    };

    window.__aiAssistant = {
        isRecording: false,
        recognition: null,
        synth: window.speechSynthesis,
        currentMosque: null,

        init: function() {
            console.log('AI Asistan başlatılıyor...');
            this.initSpeechRecognition();
            this.createChatUI();
        },

        initSpeechRecognition: function() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition();
                this.recognition.lang = 'tr-TR';
                this.recognition.interimResults = false;
                this.recognition.maxAlternatives = 1;

                this.recognition.onresult = (event) => {
                    const text = event.results[0][0].transcript;
                    document.getElementById('aiChatInput').value = text;
                    this.stopRecordingUI();
                    this.sendMessage();
                };

                this.recognition.onspeechend = () => {
                    this.recognition.stop();
                    this.stopRecordingUI();
                };

                this.recognition.onerror = (event) => {
                    console.error('Ses tanıma hatası:', event.error);
                    this.stopRecordingUI();
                };
            }
        },

        createChatUI: function() {
            const chatHtml = `
                <div id="aiChatModal" class="hidden fixed inset-0 z-[60] bg-black/60 flex items-end sm:items-center justify-center backdrop-blur-sm">
                    <div class="rounded-t-3xl sm:rounded-3xl w-full max-w-md p-0 shadow-2xl flex flex-col" style="background:var(--paper-card); height:80vh;">
                        <!-- Header -->
                        <div class="p-4 flex items-center justify-between border-b" style="border-color:var(--line);">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white" style="background:var(--teal-900);">
                                    <i class="fa-solid fa-sparkles"></i>
                                </div>
                                <div>
                                    <h3 class="font-bold text-sm font-display" style="color:var(--ink);">Manevi Rehber (Gemini AI)</h3>
                                    <p id="aiChatStatus" class="text-[10px]" style="color:var(--ink-faint);">Çevrimiçi · Yardım etmeye hazır</p>
                                </div>
                            </div>
                            <button onclick="window.__aiAssistant.closeChat()" class="icon-btn" style="color:var(--ink-faint);"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                        
                        <!-- Messages Area -->
                        <div id="aiChatMessages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-opacity-30" style="background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22%3E%3Cpath d=%22M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z%22 fill=%22%23C39A45%22 opacity=%220.03%22/%3E%3C/svg%3E');">
                            <div class="flex items-start gap-2.5">
                                <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] text-white" style="background:var(--teal-800);">
                                    <i class="fa-solid fa-robot"></i>
                                </div>
                                <div class="rounded-2xl p-3 text-xs leading-relaxed max-w-[85%]" style="background:var(--paper-deep); color:var(--ink-soft);">
                                    Selamün aleyküm seyyah! Ben Bursa Manevi Atlası'nın Gemini destekli rehberiyim. Şu an incelediğin <b><span id="aiChatMosqueName">cami</span></b> veya Bursa'nın manevi tarihi hakkında bana istediğini sorabilirsin.
                                </div>
                            </div>
                        </div>

                        <!-- Input Area -->
                        <div class="p-4 border-t" style="border-color:var(--line); background:var(--paper);">
                            <div class="flex items-center gap-2">
                                <div class="relative flex-1">
                                    <input id="aiChatInput" type="text" placeholder="Bir soru sorun..." class="field w-full rounded-2xl pl-4 pr-10 py-3 text-xs" onkeypress="if(event.key==='Enter') window.__aiAssistant.sendMessage()">
                                    <button id="aiMicBtn" onclick="window.__aiAssistant.toggleVoice()" class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-colors" style="color:var(--ink-faint);">
                                        <i class="fa-solid fa-microphone"></i>
                                    </button>
                                </div>
                                <button onclick="window.__aiAssistant.sendMessage()" class="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform" style="background:var(--teal-900);">
                                    <i class="fa-solid fa-paper-plane"></i>
                                </button>
                            </div>
                            <p class="text-[9px] text-center mt-2" style="color:var(--ink-faint);">AI yanıtları hatalı olabilir, tarihi bilgileri teyit ediniz.</p>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', chatHtml);
        },

        openChat: function(mosqueId) {
            console.log('Sohbet açılıyor, Cami ID:', mosqueId);
            if (!mosqueId) {
                showToast('Cami bilgisi bulunamadı.', 'error');
                return;
            }
            this.currentMosque = PRESET_MOSQUES.find(m => m.id === mosqueId);
            document.getElementById('aiChatMosqueName').textContent = this.currentMosque ? this.currentMosque.name : 'cami';
            document.getElementById('aiChatModal').classList.remove('hidden');
            document.getElementById('aiChatInput').focus();
            
            const container = document.getElementById('aiChatMessages');
            while (container.children.length > 1) {
                container.removeChild(container.lastChild);
            }
            
            if (window.haptic) window.haptic(15);
        },

        closeChat: function() {
            document.getElementById('aiChatModal').classList.add('hidden');
            if (this.synth.speaking) this.synth.cancel();
        },

        toggleVoice: function() {
            if (!this.recognition) {
                showToast('Tarayıcınız ses tanımayı desteklemiyor.', 'error');
                return;
            }

            if (this.isRecording) {
                this.recognition.stop();
                this.stopRecordingUI();
            } else {
                try {
                    this.recognition.start();
                    this.startRecordingUI();
                } catch (e) {
                    console.error('Ses tanıma başlatılamadı:', e);
                }
            }
        },

        startRecordingUI: function() {
            this.isRecording = true;
            const btn = document.getElementById('aiMicBtn');
            btn.style.color = '#DC2626';
            btn.classList.add('animate-pulse');
            if (window.haptic) window.haptic(20);
        },

        stopRecordingUI: function() {
            this.isRecording = false;
            const btn = document.getElementById('aiMicBtn');
            btn.style.color = 'var(--ink-faint)';
            btn.classList.remove('animate-pulse');
        },

        addMessage: function(text, isUser = false) {
            const container = document.getElementById('aiChatMessages');
            const msgHtml = `
                <div class="flex ${isUser ? 'justify-end' : 'items-start'} gap-2.5 fade-in-up">
                    ${!isUser ? `
                        <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] text-white" style="background:var(--teal-800);">
                            <i class="fa-solid fa-robot"></i>
                        </div>
                    ` : ''}
                    <div class="rounded-2xl p-3 text-xs leading-relaxed max-w-[85%] shadow-sm" style="background:${isUser ? 'var(--teal-900)' : 'var(--paper-deep)'}; color:${isUser ? '#fff' : 'var(--ink-soft)'};">
                        ${text.replace(/\n/g, '<br>')}
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', msgHtml);
            container.scrollTop = container.scrollHeight;
        },

        sendMessage: async function() {
            const input = document.getElementById('aiChatInput');
            const text = input.value.trim();
            if (!text) return;

            input.value = '';
            this.addMessage(text, true);
            
            const loadingId = 'ai-loading-' + Date.now();
            const container = document.getElementById('aiChatMessages');
            container.insertAdjacentHTML('beforeend', `
                <div id="${loadingId}" class="flex items-start gap-2.5 fade-in">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] text-white" style="background:var(--teal-800);">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <div class="rounded-2xl p-3 text-xs flex gap-1" style="background:var(--paper-deep); color:var(--ink-faint);">
                        <span class="animate-bounce">.</span><span class="animate-bounce" style="animation-delay:0.2s">.</span><span class="animate-bounce" style="animation-delay:0.4s">.</span>
                    </div>
                </div>
            `);
            container.scrollTop = container.scrollHeight;

            try {
                const response = await this.callGemini(text);
                const loadingEl = document.getElementById(loadingId);
                if (loadingEl) loadingEl.remove();
                this.addMessage(response);
                this.speak(response);
            } catch (error) {
                const loadingEl = document.getElementById(loadingId);
                if (loadingEl) loadingEl.remove();
                
                let errorMsg = "Üzgünüm, bir bağlantı hatası oluştu.";
                if (error.message.includes('API anahtarı')) {
                    errorMsg = "Hata: Geçersiz veya eksik Gemini API anahtarı. Lütfen ayarlarınızı kontrol edin.";
                } else if (error.message.includes('403') || error.message.includes('401')) {
                    errorMsg = "Hata: API anahtarınız yetkisiz veya yanlış formatta. Gemini API anahtarı kullandığınızdan emin olun.";
                } else if (error.message.includes('quota')) {
                    errorMsg = "Hata: API kullanım kotanız dolmuş olabilir.";
                }
                
                this.addMessage(errorMsg);
                console.error("Gemini Detaylı Hata:", error);
            }
        },

        callGemini: async function(userPrompt) {
            const key = window.__AI_API_KEY__;
            if (!key || key === '' || key.startsWith('sk-')) {
                throw new Error('Geçerli bir Gemini API anahtarı bulunamadı. (OpenAI anahtarı kullanılamaz)');
            }

            let systemInstruction = "Sen Bursa Manevi Atlası uygulamasının uzman manevi rehberisin. Bursa'nın tarihi camileri, mimarisi ve manevi şahsiyetleri hakkında derin bilgiye sahipsin. Nazik, bilgili ve manevi bir dil kullan. Yanıtlarını Markdown formatında değil, düz metin olarak ver.";
            
            if (this.currentMosque) {
                systemInstruction += `\n\nŞu anki cami hakkında bilgiler:\nAdı: ${this.currentMosque.name}\nİlçe: ${this.currentMosque.district}\nAdres: ${this.currentMosque.address}\nTarihçe: ${this.currentMosque.info || 'Bilgi yok'}\nBanisi: ${this.currentMosque.founder || 'Bilinmiyor'}\nDönemi: ${this.currentMosque.period || 'Bilinmiyor'}`;
            }

            const url = `${AI_CONFIG.baseUrl}${AI_CONFIG.model}:generateContent?key=${key}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userPrompt }] }],
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(`Gemini API Hatası (${response.status}): ${errData.error?.message || 'Bilinmeyen hata'}`);
            }

            const data = await response.json();
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Gemini geçersiz yanıt döndürdü.');
            }
        },

        speak: function(text) {
            const isSoundEnabled = localStorage.getItem('manevi-atlas-sound') !== 'off';
            if (!isSoundEnabled) return;

            if (this.synth.speaking) this.synth.cancel();
            
            const cleanText = text.replace(/<[^>]*>/g, '');
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'tr-TR';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            this.synth.speak(utterance);
        }
    };

    window.initAiAssistant = function(apiKey) {
        window.__AI_API_KEY__ = apiKey;
        window.__aiAssistant.init();
    };

})();
