import { useEffect, useRef, useState, type CSSProperties, type DragEvent } from 'react';
import { strengthLabel, type DecodedWatermark, type EmbedStrength, type PixelBuffer } from './lib/watermark';
import { formatFromHints, formatLabel, type ImageFormat } from './lib/formats';
import { loadImage, pixelsToPngBlob } from './lib/loader';
import { callWorker } from './lib/worker-client';
import { APP_VERSION, LEGAL_COPY, PLAY_STORE_URL, type LegalLanguage } from './legal';

type View = 'embed' | 'verify' | 'how' | 'terms' | 'privacy';
type IconName = 'arrow' | 'check' | 'chevron' | 'download' | 'file' | 'image' | 'lock' | 'plus' | 'refresh' | 'shield' | 'spark' | 'upload' | 'zoom';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type EmbedResult = {
  url: string;
  blob: Blob;
  fileName: string;
  width: number;
  height: number;
  owner: string;
};

type LoadedImage = {
  file: File;
  format: ImageFormat;
  previewUrl: string;
  pixels: PixelBuffer;
  note: string;
};

// iOS, accept'te HEIC yazmazsa fotoğrafı seçerken kendisi JPEG'e çevirir (daha güvenli).
// Diğer platformlarda tüm görsel uzantıları açıkça listelenir; HEIC/TIFF gerekirse cihaz içinde çözülür.
const IS_IOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const ACCEPT = IS_IOS
  ? 'image/*'
  : 'image/*,.jpg,.jpeg,.jfif,.png,.webp,.gif,.bmp,.tif,.tiff,.avif,.heic,.heif,.ico,.svg';

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (name === 'arrow') return <svg {...common}><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
  if (name === 'check') return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
  if (name === 'chevron') return <svg {...common}><path d="m6 9 6 6 6-6" /></svg>;
  if (name === 'download') return <svg {...common}><path d="M12 3v12m-5-5 5 5 5-5M5 21h14" /></svg>;
  if (name === 'file') return <svg {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></svg>;
  if (name === 'image') return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.4" /><path d="m4 17 5-5 3 3 2-2 6 5" /></svg>;
  if (name === 'lock') return <svg {...common}><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></svg>;
  if (name === 'plus') return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
  if (name === 'refresh') return <svg {...common}><path d="M20 11a8 8 0 1 0 1 4M20 5v6h-6" /></svg>;
  if (name === 'shield') return <svg {...common}><path d="M12 3 20 6v5c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6Z" /><path d="m8.5 12 2.2 2.2 4.8-4.8" /></svg>;
  if (name === 'spark') return <svg {...common}><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4Z" /><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6Z" /></svg>;
  if (name === 'upload') return <svg {...common}><path d="M12 16V4m-5 5 5-5 5 5M5 20h14" /></svg>;
  return <svg {...common}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5M11 8v6M8 11h6" /></svg>;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'tarih bilgisi okunamadı';
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function extensionNote(file: File, format: ImageFormat): string {
  const declared = formatFromHints(file.name, '');
  if (declared === 'UNKNOWN' || declared === format) return '';
  return `Dosya adı ${formatLabel(declared)} gibi görünüyor ama içeriği ${formatLabel(format)}; cihazınızda otomatik çözüldü.`;
}

async function saveBlob(blob: Blob, fileName: string, preferShare: boolean): Promise<void> {
  const file = new File([blob], fileName, { type: blob.type || 'image/png' });
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  if (preferShare && typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: fileName });
      return;
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') return;
      // paylaşım açılamadıysa normal indirmeye düş
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function App() {
  // Hash yönlendirme: statik barındırmada (GitHub Pages) ve PWA'da yenilemede 404 vermez.
  const viewFromHash = (): View => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash === 'verify') return 'verify';
    if (hash === 'how-it-works') return 'how';
    if (hash === 'terms') return 'terms';
    if (hash === 'privacy') return 'privacy';
    return 'embed';
  };
  const [view, setView] = useState<View>(viewFromHash);
  const [owner, setOwner] = useState('');
  const [strength, setStrength] = useState<EmbedStrength>('balanced');
  const [embedSource, setEmbedSource] = useState<LoadedImage | null>(null);
  const [embedResult, setEmbedResult] = useState<EmbedResult | null>(null);
  const [verifySource, setVerifySource] = useState<LoadedImage | null>(null);
  const [verification, setVerification] = useState<DecodedWatermark | null | undefined>(undefined);
  const [processing, setProcessing] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(100);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
  const [legalLanguage, setLegalLanguage] = useState<LegalLanguage>('tr');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const verifyInputRef = useRef<HTMLInputElement>(null);
  const embedToken = useRef(0);
  const verifyToken = useRef(0);
  const canShareFiles = (() => {
    const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
    try {
      return window.matchMedia('(pointer: coarse)').matches && typeof nav.share === 'function' && !!nav.canShare?.({ files: [new File([''], 'a.png', { type: 'image/png' })] });
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    const onInstall = (event: Event) => { event.preventDefault(); setInstallPrompt(event as BeforeInstallPromptEvent); };
    const onInstalled = () => { setInstallPrompt(null); setInstalled(true); };
    window.addEventListener('beforeinstallprompt', onInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => { window.removeEventListener('beforeinstallprompt', onInstall); window.removeEventListener('appinstalled', onInstalled); };
  }, []);

  useEffect(() => {
    const onHash = () => { setView(viewFromHash()); setError(''); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Object URL'leri bırakırken sızıntı olmasın.
  useEffect(() => () => { if (embedSource?.previewUrl) URL.revokeObjectURL(embedSource.previewUrl); }, [embedSource?.previewUrl]);
  useEffect(() => () => { if (verifySource?.previewUrl) URL.revokeObjectURL(verifySource.previewUrl); }, [verifySource?.previewUrl]);
  useEffect(() => () => { if (embedResult?.url) URL.revokeObjectURL(embedResult.url); }, [embedResult?.url]);

  const strengthInfo = strengthLabel(strength);

  const navigate = (nextView: View) => {
    const paths: Record<View, string> = { embed: '#/', verify: '#/verify', how: '#/how-it-works', terms: '#/terms', privacy: '#/privacy' };
    window.location.hash = paths[nextView];
    setView(nextView);
    setError('');
    window.scrollTo({ top: 0 });
  };

  const prepareFile = async (mode: 'embed' | 'verify', file: File | undefined) => {
    setError('');
    if (!file) return;
    const token = mode === 'embed' ? ++embedToken.current : ++verifyToken.current;
    const current = () => (mode === 'embed' ? embedToken.current : verifyToken.current) === token;
    if (mode === 'embed') { setEmbedResult(null); setEmbedSource(null); } else { setVerification(undefined); setVerifySource(null); }
    setPreparing(true);
    try {
      const loaded = await loadImage(file);
      if (!current()) { URL.revokeObjectURL(loaded.previewUrl); return; }
      const item: LoadedImage = { file, format: loaded.format, previewUrl: loaded.previewUrl, pixels: loaded.pixels, note: extensionNote(file, loaded.format) };
      if (mode === 'embed') setEmbedSource(item); else setVerifySource(item);
    } catch (caught) {
      if (current()) setError(caught instanceof Error ? caught.message : 'Fotoğraf açılamadı. Lütfen başka bir dosya deneyin.');
    } finally {
      if (current()) setPreparing(false);
    }
  };

  const handleEmbed = async () => {
    if (!embedSource) { setError('Önce imzalanacak bir fotoğraf seçin.'); return; }
    if (!owner.trim()) { setError('Fotoğraf sahibi veya kısa bir imza yazın.'); return; }
    setError('');
    setProcessing(true);
    try {
      const { pixels } = embedSource;
      const reply = await callWorker({ action: 'embed', pixels: pixels.data.slice().buffer as ArrayBuffer, width: pixels.width, height: pixels.height, owner, strength });
      if (!reply.ok) throw new Error(reply.message);
      if (!reply.pixels) throw new Error('İmzalanan görsel boş geldi.');
      const blob = await pixelsToPngBlob({ data: new Uint8ClampedArray(reply.pixels), width: pixels.width, height: pixels.height });
      const baseName = embedSource.file.name.replace(/\.[^/.]+$/, '') || 'fotograf';
      setEmbedResult({ blob, url: URL.createObjectURL(blob), fileName: `${baseName}-filigran.png`, width: pixels.width, height: pixels.height, owner: owner.trim() });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Filigran eklenirken bir hata oluştu.');
    } finally {
      setProcessing(false);
    }
  };

  const handleVerify = async () => {
    if (!verifySource) { setError('Önce doğrulanacak bir fotoğraf seçin.'); return; }
    setError('');
    setProcessing(true);
    try {
      const { pixels } = verifySource;
      const reply = await callWorker({ action: 'verify', pixels: pixels.data.slice().buffer as ArrayBuffer, width: pixels.width, height: pixels.height });
      if (!reply.ok) throw new Error(reply.message);
      setVerification(reply.watermark ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Fotoğraf doğrulanırken bir hata oluştu.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, mode: 'embed' | 'verify') => {
    event.preventDefault();
    setDragging(false);
    void prepareFile(mode, event.dataTransfer.files?.[0]);
  };

  const installApp = async () => {
    if (installed) { setError('Filigran uygulaması bu cihaza zaten yüklenmiş.'); return; }
    if (!installPrompt) {
      const ua = navigator.userAgent.toLowerCase();
      setError(IS_IOS
        ? 'PWA kurulumu için Safari’de Paylaş düğmesine dokunun, ardından “Ana Ekrana Ekle”yi seçin.'
        : /android/.test(ua)
          ? 'Chrome menüsünü açıp “Uygulamayı yükle” veya “Ana ekrana ekle” seçeneğini kullanın.'
          : 'Chrome veya Edge menüsünden “Filigran uygulamasını yükle” seçeneğini kullanın.');
      return;
    }
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      if (choice.outcome === 'accepted') setInstalled(true);
    } catch {
      setInstallPrompt(null);
      setError('Kurulum penceresi açılamadı. Tarayıcı menüsünden “Uygulamayı yükle” seçeneğini deneyin.');
    }
  };

  const updateApp = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        await registration?.update();
        registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (caught) {
      console.warn('Service worker güncellenemedi; sayfa yeniden yükleniyor.', caught);
    }
    const url = new URL(window.location.href);
    url.searchParams.set('updated', String(Date.now()));
    window.location.replace(url.toString());
  };

  const downloadResult = (share: boolean) => {
    if (!embedResult) return;
    void saveBlob(embedResult.blob, embedResult.fileName, share).catch(() => setError('Dosya kaydedilemedi. Görsele uzun basarak kaydetmeyi deneyin.'));
  };

  const renderDropzone = (mode: 'embed' | 'verify') => {
    const isVerify = mode === 'verify';
    const file = (isVerify ? verifySource : embedSource)?.file ?? null;
    return (
      <div
        className={`dropzone ${dragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => handleDrop(event, mode)}
        onClick={() => (isVerify ? verifyInputRef.current : fileInputRef.current)?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') (isVerify ? verifyInputRef.current : fileInputRef.current)?.click(); }}
      >
        <input
          ref={isVerify ? verifyInputRef : fileInputRef}
          type="file"
          accept={ACCEPT}
          onChange={(event) => { const picked = event.currentTarget.files?.[0]; event.currentTarget.value = ''; void prepareFile(mode, picked); }}
          hidden
        />
        <div className="dropzone-icon"><Icon name={file ? 'image' : 'upload'} size={22} /></div>
        {preparing && !file ? (
          <>
            <strong>Fotoğraf hazırlanıyor…</strong>
            <span>Biçim ve önizleme cihazda kontrol ediliyor.</span>
          </>
        ) : file ? (
          <>
            <strong>{file.name}</strong>
            <span>{formatBytes(file.size)} · Değiştirmek için tıklayın</span>
          </>
        ) : (
          <>
            <strong>Fotoğrafı buraya bırakın</strong>
            <span>veya cihazınızdan seçin · JPEG, PNG, WebP, HEIC, AVIF, TIFF, GIF, BMP…</span>
          </>
        )}
      </div>
    );
  };

  const legalCopy = LEGAL_COPY[legalLanguage];
  const legalSections = view === 'terms' ? legalCopy.terms : legalCopy.privacy;
  const legalTitle = view === 'terms' ? legalCopy.termsTitle : legalCopy.privacyTitle;

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <button className="brand" onClick={() => navigate('embed')} aria-label="Filigran ana sayfa">
          <span className="brand-mark"><span /></span>
          <span><b>filigran</b><small>görünmez dijital imza</small></span>
        </button>
        <nav className="main-nav" aria-label="Ana menü">
          <button className={view === 'embed' ? 'active' : ''} onClick={() => navigate('embed')}>Gömme</button>
          <button className={view === 'verify' ? 'active' : ''} onClick={() => navigate('verify')}>Doğrula</button>
          <button className={view === 'how' ? 'active' : ''} onClick={() => navigate('how')}>Nasıl çalışır</button>
        </nav>
        <div className="topbar-actions">
          <span className="privacy-mini"><Icon name="lock" size={14} /> cihazında</span>
          <button className="install-button pwa-install-button" onClick={installApp} aria-label="Filigran PWA uygulamasını yükle"><Icon name="plus" size={15} /> {installed ? 'yüklü' : 'yükle'}</button>
          <button className="install-button update-button" onClick={() => void updateApp()}><Icon name="refresh" size={14} /> Güncelle</button>
        </div>
      </header>

      <main>
        {view === 'embed' && (
          <>
            <section className="hero compact-hero">
              <div className="eyebrow"><span className="eyebrow-dot" /> fotoğraf sanatçıları için</div>
              <h1>Görünmeyen bir imza,<br /><em>görünen bir güven.</em></h1>
              <p>Fotoğraflarını cihazından çıkarmadan, sahipliğini piksellerin içine sessizce işle.</p>
            </section>
            <section className="workspace">
              <div className="workspace-intro">
                <div><span className="section-kicker">01 / görünmez imza</span><h2>Fotoğrafını sessizce imzala.</h2></div>
                <span className="process-time"><Icon name="spark" size={15} /> yaklaşık 10 saniye</span>
              </div>
              <div className="workspace-grid">
                <aside className="control-panel">
                  <div className="panel-block">
                    <div className="label-row"><label>Fotoğraf</label><span className="step-number">01</span></div>
                    {renderDropzone('embed')}
                    {embedSource && <div className="file-meta"><span><Icon name="file" size={14} /> {formatLabel(embedSource.format)}</span><span>{formatBytes(embedSource.file.size)} · {embedSource.pixels.width}×{embedSource.pixels.height}px</span></div>}
                    {embedSource?.note && <p className="field-note format-note">{embedSource.note}</p>}
                  </div>
                  <div className="panel-block signature-block">
                    <div className="label-row"><label htmlFor="owner">Sahiplik bilgisi</label><span className="step-number">02</span></div>
                    <div className="input-wrap"><Icon name="shield" size={17} /><input id="owner" value={owner} onChange={(event) => setOwner(event.target.value)} maxLength={42} placeholder="adınız veya kısa imzanız" /><span>{owner.length}/42</span></div>
                    <p className="field-note">Doğrulama sırasında bu metin size geri gösterilir.</p>
                  </div>
                  <div className="panel-block strength-block">
                    <div className="label-row"><label>İmza yoğunluğu</label><span className="step-number">03</span></div>
                    <div className="strength-options">
                      {(['soft', 'balanced', 'durable'] as EmbedStrength[]).map((value) => <button key={value} className={strength === value ? 'selected' : ''} onClick={() => setStrength(value)}><span className="strength-line"><i /><i /><i /></span><b>{strengthLabel(value).title}</b></button>)}
                    </div>
                    <p className="field-note strength-note">{strengthInfo.note}</p>
                  </div>
                  <button className="primary-button" onClick={handleEmbed} disabled={processing || preparing}>{processing ? <><span className="spinner" /> işleniyor...</> : preparing ? <><span className="spinner" /> fotoğraf hazırlanıyor...</> : <>görünmez imzayı ekle <Icon name="arrow" size={17} /></>}</button>
                  <div className="privacy-note"><Icon name="lock" size={16} /><span><b>Fotoğrafın cihazında kalır.</b><br />Sunucuya yüklenmez, tüm işlem tarayıcıda gerçekleşir.</span></div>
                </aside>
                <div className="preview-panel">
                  <div className="preview-toolbar"><div><span className="preview-label">önizleme</span><span className="status-dot" />{embedResult ? 'imza hazır' : embedSource ? 'işleme hazır' : preparing ? 'fotoğraf hazırlanıyor' : 'fotoğraf bekleniyor'}</div>{(embedSource || embedResult) && <div className="zoom-control"><Icon name="zoom" size={15} /><input type="range" min="70" max="140" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /><span>{zoom}%</span></div>}</div>
                  {!embedSource && !embedResult ? (
                    <div className="empty-preview"><div className="preview-orbit"><div className="orbit-inner"><Icon name="image" size={30} /></div></div><h3>Fotoğrafın burada nefes alacak.</h3><p>Bir görsel seçtiğinde önce ve sonra halini burada karşılaştırabilirsin.</p></div>
                  ) : (
                    <div className={`compare-stage ${embedResult ? 'has-result' : ''}`} style={{ '--preview-scale': `${zoom / 100}` } as CSSProperties}>
                      <div className="compare-card"><div className="compare-label">{embedResult ? 'önce' : 'fotoğraf'}</div><img src={embedSource?.previewUrl} alt="Filigran eklenmeden önce" /></div>
                      {embedResult && <><div className="compare-divider"><span><Icon name="arrow" size={14} /></span></div><div className="compare-card result-card"><div className="compare-label accent-label">sonra · görünmez</div><img src={embedResult.url} alt="Filigran eklendikten sonra" /></div></>}
                    </div>
                  )}
                  {embedResult && <div className="result-bar"><div><span className="success-icon"><Icon name="check" size={15} /></span><span><b>İmza başarıyla işlendi.</b><small>{embedResult.width} × {embedResult.height}px · {embedResult.owner}</small></span></div><span className="result-actions">{canShareFiles && <button className="download-button" onClick={() => downloadResult(true)}><Icon name="download" size={16} /> kaydet / paylaş</button>}<button className={canShareFiles ? 'text-button' : 'download-button'} onClick={() => downloadResult(false)}>{!canShareFiles && <Icon name="download" size={16} />} {canShareFiles ? 'dosya olarak indir' : 'indir'}</button></span></div>}
                </div>
              </div>
            </section>
          </>
        )}

        {view === 'verify' && (
          <section className="verify-page">
            <div className="page-heading"><div className="eyebrow"><span className="eyebrow-dot" /> imza dedektörü</div><h1>Bir fotoğrafın <em>hikâyesini</em><br />doğrula.</h1><p>Filigran ile işlenmiş bir görseli yükle. Piksellerin içinde saklanan sahiplik bilgisini arayalım.</p></div>
            <div className="verify-grid">
              <div className="verify-upload-card"><div className="card-topline"><span className="section-kicker">02 / imza doğrulama</span><span className="round-icon"><Icon name="shield" size={18} /></span></div>{renderDropzone('verify')}<button className="primary-button" onClick={handleVerify} disabled={processing || preparing}>{processing ? <><span className="spinner" /> aranıyor...</> : preparing ? <><span className="spinner" /> fotoğraf hazırlanıyor...</> : <>gizli imzayı ara <Icon name="arrow" size={17} /></>}</button><div className="privacy-note"><Icon name="lock" size={16} /><span><b>Arama da cihazında gerçekleşir.</b><br />Fotoğrafın hiçbir yere gönderilmez.</span></div></div>
              <div className="verify-result-card">
                {!verifySource && verification === undefined ? <div className="verify-empty"><div className="radar"><span /><span /><span /></div><h3>İmza sonucu burada görünecek.</h3><p>Filigran ile imzalanmış bir fotoğraf seçerek başla.</p></div> : <><div className="verify-image-wrap">{verifySource && <img src={verifySource.previewUrl} alt="Doğrulanacak fotoğraf" />}</div>{verification ? <div className="verification-success"><div className="result-heading"><span className="success-icon large"><Icon name="check" size={20} /></span><div><span>imza bulundu</span><h2>Bu fotoğraf imzalı.</h2></div><b className="confidence">%{verification.confidence} örnekleme güveni</b></div><div className="owner-result"><span className="result-label">SAHİPLİK BİLGİSİ</span><strong>{verification.owner}</strong><span className="result-date">{formatDate(verification.createdAt)} tarihinde işlendi · {verification.method}</span></div><div className="verification-footnote"><Icon name="shield" size={15} /> İmza, görsel piksellerinden okundu. Exif bilgisine bağlı değil.</div></div> : verification === null ? <div className="verification-failed"><div className="failed-icon"><Icon name="refresh" size={21} /></div><h2>İmza bulunamadı.</h2><p>Bu görselde Filigran tarafından eklenmiş bir dijital imza tespit edemedik. Dosya yeniden sıkıştırılmış veya düzenlenmiş olabilir.</p><button className="text-button" onClick={() => { setVerification(undefined); setVerifySource(null); }}>başka bir fotoğraf dene <Icon name="arrow" size={15} /></button></div> : <div className="checking-state"><span className="spinner dark" /> pikseller taranıyor...</div>}</>}
              </div>
            </div>
          </section>
        )}

        {view === 'how' && (
          <section className="how-page"><div className="page-heading"><div className="eyebrow"><span className="eyebrow-dot" /> perde arkasında</div><h1>Görünmezliğin <em>mekaniği.</em></h1><p>Filigran, fotoğrafın üzerine bir yazı basmaz. Sahiplik bilgisini, renk kanalının görünmeyen en düşük bitlerine dağıtarak işler.</p></div><div className="how-steps"><article><span className="how-number">01</span><div className="how-icon"><Icon name="upload" size={22} /></div><h3>Fotoğrafını seç</h3><p>JPEG, PNG, WebP, HEIC/HEIF, AVIF, TIFF, GIF, BMP gibi görselini sürükleyip bırak veya seç. Gerçek biçim dosya adına değil içeriğe bakılarak cihazında tanınır.</p></article><article><span className="how-number">02</span><div className="how-icon coral"><Icon name="spark" size={22} /></div><h3>İmzayı piksellere yay</h3><p>Kısa sahiplik bilgisi, renk kanalındaki görünmeyen bitlere tekrarlarla dağıtılır; çıktı PNG olarak korunur.</p></article><article><span className="how-number">03</span><div className="how-icon green"><Icon name="shield" size={22} /></div><h3>Dilediğinde doğrula</h3><p>İmzalı dosyayı tekrar yüklediğinde Filigran, sinyali tarar ve eşleşen sahiplik bilgisini gösterir.</p></article></div><div className="method-note"><div className="note-mark"><Icon name="lock" size={19} /></div><div><b>Gizlilik bir özellik değil, mimarinin kendisi.</b><p>Bu ilk sürümde yükleme, işleme ve doğrulama tamamen tarayıcı içinde gerçekleşir. Fotoğrafların bir sunucuya gönderilmez. Yine de görünmez filigran, telif ihlaline karşı tek başına hukuki kanıt ya da kopyalamayı engelleyen bir DRM değildir; ağır kırpma, yeniden boyutlandırma veya kayıplı sıkıştırma sinyali zayıflatabilir.</p></div></div></section>
        )}

        {(view === 'terms' || view === 'privacy') && (
          <section className="legal-page">
            <div className="page-heading"><div className="eyebrow"><span className="eyebrow-dot" /> filigran · v{APP_VERSION}</div><h1>{legalTitle}</h1><p>{legalCopy.updated}</p></div>
            <div className="legal-toolbar"><span>Filigran v{APP_VERSION}</span><div><button className={legalLanguage === 'tr' ? 'selected' : ''} onClick={() => setLegalLanguage('tr')}>Türkçe</button><button className={legalLanguage === 'en' ? 'selected' : ''} onClick={() => setLegalLanguage('en')}>English</button></div></div>
            <article className="legal-card">{legalSections.map(([heading, body]) => <section key={heading}><h2>{heading}</h2><p>{body}</p></section>)}</article>
          </section>
        )}
      </main>
      {error && <div className="toast-error" role="alert"><span>!</span>{error}<button onClick={() => setError('')}>×</button></div>}
      <footer><span>© 2026 filigran · v{APP_VERSION}</span><span><Icon name="lock" size={13} /> fotoğrafların cihazında kalır</span><span className="footer-links"><button onClick={() => navigate('terms')}>Kullanım şartları</button><button onClick={() => navigate('privacy')}>Gizlilik politikası</button></span><span className="footer-method">FGR1 · channel-bit spread</span></footer>
    </div>
  );
}

export default App;
