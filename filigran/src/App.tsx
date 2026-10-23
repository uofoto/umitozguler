import { useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent } from 'react';
import {
  capacityFor,
  decodeWatermark,
  embedWatermark,
  strengthLabel,
  type DecodedWatermark,
  type EmbedStrength,
} from './lib/watermark';
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

type ImageDataResult = {
  imageData: ImageData;
  width: number;
  height: number;
};

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

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

function loadImageData(file: File, maxEdge = 2200): Promise<ImageDataResult> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    let objectUrl = '';
    let fallbackStarted = false;
    let settled = false;

    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      callback();
    };

    const draw = () => {
      const sourceWidth = image.naturalWidth;
      const sourceHeight = image.naturalHeight;
      if (!sourceWidth || !sourceHeight) {
        finish(() => reject(new Error('Görselin boyutları okunamadı.')));
        return;
      }
      const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
      const width = Math.max(1, Math.round(sourceWidth * scale));
      const height = Math.max(1, Math.round(sourceHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        finish(() => reject(new Error('Bu tarayıcıda görsel alanı başlatılamadı.')));
        return;
      }
      try {
        context.drawImage(image, 0, 0, width, height);
        const imageData = context.getImageData(0, 0, width, height);
        finish(() => resolve({ imageData, width, height }));
      } catch {
        finish(() => reject(new Error('Görsel pikselleri okunamadı. Lütfen fotoğrafı JPEG, PNG veya WebP olarak yeniden seçin.')));
      }
    };

    image.onload = draw;
    image.onerror = () => {
      // Mobile Safari/WebView can fail to decode a local object URL from Photos.
      // Retry with a data URL before reporting a format error.
      if (fallbackStarted) {
        finish(() => reject(new Error('Görsel okunamadı. Lütfen fotoğrafı JPEG, PNG veya WebP olarak yeniden seçin.')));
        return;
      }
      fallbackStarted = true;
      const reader = new FileReader();
      reader.onload = () => { image.src = String(reader.result); };
      reader.onerror = () => finish(() => reject(new Error('Görsel okunamadı. Lütfen fotoğrafı JPEG, PNG veya WebP olarak yeniden seçin.')));
      reader.readAsDataURL(file);
    };

    objectUrl = URL.createObjectURL(file);
    image.src = objectUrl;
  });
}

function imageDataToBlob(imageData: ImageData): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const context = canvas.getContext('2d');
    if (!context) {
      reject(new Error('Çıktı görseli hazırlanamadı.'));
      return;
    }
    context.putImageData(imageData, 0, 0);
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Çıktı dosyası oluşturulamadı.')), 'image/png');
  });
}

function fileIsImage(file: File | undefined): file is File {
  if (!file) return false;
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  // Some mobile browsers leave File.type empty or report it inconsistently.
  return ACCEPTED_TYPES.includes(type) || (type === '' && ACCEPTED_EXTENSIONS.some((extension) => name.endsWith(extension)));
}

function App() {
  const appBasePath = () => new URL(import.meta.env.BASE_URL, document.baseURI).pathname.replace(/\/$/, '') + '/';
  const viewFromPath = (): View => {
    const base = appBasePath();
    if (window.location.pathname === `${base}verify`) return 'verify';
    if (window.location.pathname === `${base}how-it-works`) return 'how';
    if (window.location.pathname === `${base}terms`) return 'terms';
    if (window.location.pathname === `${base}privacy`) return 'privacy';
    return 'embed';
  };
  const [view, setView] = useState<View>(viewFromPath);
  const [owner, setOwner] = useState('');
  const [strength, setStrength] = useState<EmbedStrength>('balanced');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [embedResult, setEmbedResult] = useState<EmbedResult | null>(null);
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [verifyUrl, setVerifyUrl] = useState('');
  const [verification, setVerification] = useState<DecodedWatermark | null | undefined>(undefined);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(100);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [legalLanguage, setLegalLanguage] = useState<LegalLanguage>('tr');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const verifyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onInstall);
    return () => window.removeEventListener('beforeinstallprompt', onInstall);
  }, []);

  const strengthInfo = strengthLabel(strength);
  const selectedFileMeta = useMemo(() => {
    if (!selectedFile) return null;
    return { size: formatBytes(selectedFile.size), type: selectedFile.type.replace('image/', '').toUpperCase() };
  }, [selectedFile]);

  const navigate = (nextView: View) => {
    const base = appBasePath();
    const paths: Record<View, string> = { embed: base, verify: `${base}verify`, how: `${base}how-it-works`, terms: `${base}terms`, privacy: `${base}privacy` };
    window.history.pushState({}, '', paths[nextView]);
    setView(nextView);
    setError('');
  };

  useEffect(() => {
    const onPopState = () => setView(viewFromPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const chooseEmbedFile = (file: File | undefined) => {
    setError('');
    setEmbedResult(null);
    if (!file) return;
    if (!fileIsImage(file)) {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      setSelectedFile(null);
      setSourceUrl('');
      setError('Sadece JPEG, PNG veya WebP fotoğraflar kabul edilir.');
      return;
    }
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSelectedFile(file);
    setSourceUrl(URL.createObjectURL(file));
  };

  const chooseVerifyFile = (file: File | undefined) => {
    setError('');
    setVerification(undefined);
    if (!file) return;
    if (!fileIsImage(file)) {
      if (verifyUrl) URL.revokeObjectURL(verifyUrl);
      setVerifyFile(null);
      setVerifyUrl('');
      setError('Sadece JPEG, PNG veya WebP fotoğraflar kabul edilir.');
      return;
    }
    if (verifyUrl) URL.revokeObjectURL(verifyUrl);
    setVerifyFile(file);
    setVerifyUrl(URL.createObjectURL(file));
  };

  const handleEmbed = async () => {
    if (!selectedFile) {
      setError('Önce imzalanacak bir fotoğraf seçin.');
      return;
    }
    if (!owner.trim()) {
      setError('Fotoğraf sahibi veya kısa bir imza yazın.');
      return;
    }
    setError('');
    setProcessing(true);
    try {
      const source = await loadImageData(selectedFile);
      const result = embedWatermark(source.imageData, owner, strength);
      const blob = await imageDataToBlob(result.imageData);
      const extension = 'png';
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      if (embedResult?.url) URL.revokeObjectURL(embedResult.url);
      setEmbedResult({
        blob,
        url: URL.createObjectURL(blob),
        fileName: `${baseName}-filigran.${extension}`,
        width: source.width,
        height: source.height,
        owner: owner.trim(),
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Filigran eklenirken bir hata oluştu.');
    } finally {
      setProcessing(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyFile) {
      setError('Önce doğrulanacak bir fotoğraf seçin.');
      return;
    }
    setError('');
    setProcessing(true);
    try {
      const source = await loadImageData(verifyFile);
      setVerification(decodeWatermark(source.imageData));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Fotoğraf doğrulanırken bir hata oluştu.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, mode: 'embed' | 'verify') => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (mode === 'embed') chooseEmbedFile(file);
    else chooseVerifyFile(file);
  };

  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  const updateApp = () => {
    if (PLAY_STORE_URL) {
      window.location.href = PLAY_STORE_URL;
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set('updated', String(Date.now()));
    window.location.replace(url.toString());
  };

  const downloadResult = () => {
    if (!embedResult) return;
    const link = document.createElement('a');
    link.href = embedResult.url;
    link.download = embedResult.fileName;
    link.click();
  };

  const renderDropzone = (mode: 'embed' | 'verify') => {
    const isVerify = mode === 'verify';
    const file = isVerify ? verifyFile : selectedFile;
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
          accept={`${ACCEPTED_TYPES.join(',')},${ACCEPTED_EXTENSIONS.join(',')}`}
          onChange={(event) => (isVerify ? chooseVerifyFile(event.target.files?.[0]) : chooseEmbedFile(event.target.files?.[0]))}
          hidden
        />
        <div className="dropzone-icon"><Icon name={file ? 'image' : 'upload'} size={22} /></div>
        {file ? (
          <>
            <strong>{file.name}</strong>
            <span>{formatBytes(file.size)} · Değiştirmek için tıklayın</span>
          </>
        ) : (
          <>
            <strong>Fotoğrafı buraya bırakın</strong>
            <span>veya cihazınızdan seçin · JPEG, PNG, WebP</span>
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
          <button className="install-button update-button" onClick={updateApp}><Icon name="refresh" size={14} /> Güncelle</button>
          {installPrompt && <button className="install-button" onClick={installApp}><Icon name="plus" size={15} /> Yükle</button>}
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
                    {selectedFileMeta && <div className="file-meta"><span><Icon name="file" size={14} /> {selectedFileMeta.type}</span><span>{selectedFileMeta.size}</span></div>}
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
                  <button className="primary-button" onClick={handleEmbed} disabled={processing}>{processing ? <><span className="spinner" /> işleniyor...</> : <>görünmez imzayı ekle <Icon name="arrow" size={17} /></>}</button>
                  <div className="privacy-note"><Icon name="lock" size={16} /><span><b>Fotoğrafın cihazında kalır.</b><br />Sunucuya yüklenmez, tüm işlem tarayıcıda gerçekleşir.</span></div>
                </aside>
                <div className="preview-panel">
                  <div className="preview-toolbar"><div><span className="preview-label">önizleme</span><span className="status-dot" />{embedResult ? 'imza hazır' : selectedFile ? 'işleme hazır' : 'fotoğraf bekleniyor'}</div>{(sourceUrl || embedResult) && <div className="zoom-control"><Icon name="zoom" size={15} /><input type="range" min="70" max="140" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /><span>{zoom}%</span></div>}</div>
                  {!selectedFile && !embedResult ? (
                    <div className="empty-preview"><div className="preview-orbit"><div className="orbit-inner"><Icon name="image" size={30} /></div></div><h3>Fotoğrafın burada nefes alacak.</h3><p>Bir görsel seçtiğinde önce ve sonra halini burada karşılaştırabilirsin.</p></div>
                  ) : (
                    <div className={`compare-stage ${embedResult ? 'has-result' : ''}`} style={{ '--preview-scale': `${zoom / 100}` } as CSSProperties}>
                      <div className="compare-card"><div className="compare-label">{embedResult ? 'önce' : 'fotoğraf'}</div><img src={sourceUrl} alt="Filigran eklenmeden önce" /></div>
                      {embedResult && <><div className="compare-divider"><span><Icon name="arrow" size={14} /></span></div><div className="compare-card result-card"><div className="compare-label accent-label">sonra · görünmez</div><img src={embedResult.url} alt="Filigran eklendikten sonra" /></div></>}
                    </div>
                  )}
                  {embedResult && <div className="result-bar"><div><span className="success-icon"><Icon name="check" size={15} /></span><span><b>İmza başarıyla işlendi.</b><small>{embedResult.width} × {embedResult.height}px · {embedResult.owner}</small></span></div><button className="download-button" onClick={downloadResult}><Icon name="download" size={16} /> indir</button></div>}
                </div>
              </div>
            </section>
          </>
        )}

        {view === 'verify' && (
          <section className="verify-page">
            <div className="page-heading"><div className="eyebrow"><span className="eyebrow-dot" /> imza dedektörü</div><h1>Bir fotoğrafın <em>hikâyesini</em><br />doğrula.</h1><p>Filigran ile işlenmiş bir görseli yükle. Piksellerin içinde saklanan sahiplik bilgisini arayalım.</p></div>
            <div className="verify-grid">
              <div className="verify-upload-card"><div className="card-topline"><span className="section-kicker">02 / imza doğrulama</span><span className="round-icon"><Icon name="shield" size={18} /></span></div>{renderDropzone('verify')}<button className="primary-button" onClick={handleVerify} disabled={processing}>{processing ? <><span className="spinner" /> aranıyor...</> : <>gizli imzayı ara <Icon name="arrow" size={17} /></>}</button><div className="privacy-note"><Icon name="lock" size={16} /><span><b>Arama da cihazında gerçekleşir.</b><br />Fotoğrafın hiçbir yere gönderilmez.</span></div></div>
              <div className="verify-result-card">
                {!verifyFile && verification === undefined ? <div className="verify-empty"><div className="radar"><span /><span /><span /></div><h3>İmza sonucu burada görünecek.</h3><p>Filigran ile imzalanmış bir fotoğraf seçerek başla.</p></div> : <><div className="verify-image-wrap">{verifyUrl && <img src={verifyUrl} alt="Doğrulanacak fotoğraf" />}</div>{verification ? <div className="verification-success"><div className="result-heading"><span className="success-icon large"><Icon name="check" size={20} /></span><div><span>imza bulundu</span><h2>Bu fotoğraf imzalı.</h2></div><b className="confidence">%{verification.confidence} örnekleme güveni</b></div><div className="owner-result"><span className="result-label">SAHİPLİK BİLGİSİ</span><strong>{verification.owner}</strong><span className="result-date">{formatDate(verification.createdAt)} tarihinde işlendi · {verification.method}</span></div><div className="verification-footnote"><Icon name="shield" size={15} /> İmza, görsel piksellerinden okundu. Exif bilgisine bağlı değil.</div></div> : verification === null ? <div className="verification-failed"><div className="failed-icon"><Icon name="refresh" size={21} /></div><h2>İmza bulunamadı.</h2><p>Bu görselde Filigran tarafından eklenmiş bir dijital imza tespit edemedik. Dosya yeniden sıkıştırılmış veya düzenlenmiş olabilir.</p><button className="text-button" onClick={() => { if (verifyUrl) URL.revokeObjectURL(verifyUrl); setVerification(undefined); setVerifyFile(null); setVerifyUrl(''); }}>başka bir fotoğraf dene <Icon name="arrow" size={15} /></button></div> : <div className="checking-state"><span className="spinner dark" /> pikseller taranıyor...</div>}</>}
              </div>
            </div>
          </section>
        )}

        {view === 'how' && (
          <section className="how-page"><div className="page-heading"><div className="eyebrow"><span className="eyebrow-dot" /> perde arkasında</div><h1>Görünmezliğin <em>mekaniği.</em></h1><p>Filigran, fotoğrafın üzerine bir yazı basmaz. Sahiplik bilgisini, renk kanalının görünmeyen en düşük bitlerine dağıtarak işler.</p></div><div className="how-steps"><article><span className="how-number">01</span><div className="how-icon"><Icon name="upload" size={22} /></div><h3>Fotoğrafını seç</h3><p>JPEG, PNG veya WebP görselini sürükleyip bırak. Görselin boyutu ve formatı cihazında okunur.</p></article><article><span className="how-number">02</span><div className="how-icon coral"><Icon name="spark" size={22} /></div><h3>İmzayı piksellere yay</h3><p>Kısa sahiplik bilgisi, renk kanalındaki görünmeyen bitlere tekrarlarla dağıtılır; çıktı PNG olarak korunur.</p></article><article><span className="how-number">03</span><div className="how-icon green"><Icon name="shield" size={22} /></div><h3>Dilediğinde doğrula</h3><p>İmzalı dosyayı tekrar yüklediğinde Filigran, sinyali tarar ve eşleşen sahiplik bilgisini gösterir.</p></article></div><div className="method-note"><div className="note-mark"><Icon name="lock" size={19} /></div><div><b>Gizlilik bir özellik değil, mimarinin kendisi.</b><p>Bu ilk sürümde yükleme, işleme ve doğrulama tamamen tarayıcı içinde gerçekleşir. Fotoğrafların bir sunucuya gönderilmez. Yine de görünmez filigran, telif ihlaline karşı tek başına hukuki kanıt ya da kopyalamayı engelleyen bir DRM değildir; ağır kırpma, yeniden boyutlandırma veya kayıplı sıkıştırma sinyali zayıflatabilir.</p></div></div></section>
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
