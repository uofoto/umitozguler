const $ = (id) => document.getElementById(id);
const fileInput = $("file-input");
const fileList = $("file-list");
const emptyState = $("empty-state");
const toast = $("toast");
const LARGE_FILE_BYTES = 50 * 1024 * 1024;
const FULL_HASH_LIMIT = 32 * 1024 * 1024;
const SAMPLE_BYTES = 256 * 1024;
const MAX_FOLDER_FILES = 1000;
const MAX_ANALYSIS_BYTES = 256 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "gif", "webp", "avif", "heic", "heif", "bmp", "tif", "tiff", "svg",
  "mp4", "mov", "m4v", "webm", "3gp", "mkv", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
  "txt", "csv", "odt", "ods", "odp", "rtf", "pages", "numbers", "key",
]);

const state = {
  records: [],
  currentFilter: "all",
  sort: "size",
  folderHandle: null,
  nextId: 1,
  toastTimer: null,
  installPrompt: null,
  serviceWorkerRegistration: null,
  updateRequested: false,
  previewUrl: null,
  previewToken: 0,
  folders: new Map(),
  nextFolderId: 1,
  busy: false,
};

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const tier = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** tier;
  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: tier === 0 ? 0 : 1 }).format(value)} ${units[tier]}`;
}

function formatDate(timestamp) {
  if (!timestamp) return "Tarih bilgisi yok";
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(timestamp));
}

function extensionOf(name) {
  const dot = name.lastIndexOf(".");
  return dot > -1 ? name.slice(dot + 1).toLowerCase() : "";
}

function kindOf(file) {
  const mime = (file.type || "").toLowerCase();
  const ext = extensionOf(file.name);
  if (mime.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "avif", "heic", "heif", "bmp", "tif", "tiff", "svg"].includes(ext)) return "photo";
  if (mime.startsWith("video/") || ["mp4", "mov", "m4v", "webm", "3gp", "mkv"].includes(ext)) return "video";
  return "document";
}

function typeLabel(file) {
  const ext = extensionOf(file.name);
  if (ext) return ext.toUpperCase();
  const mime = file.type || "";
  if (mime.startsWith("image/")) return "Görsel";
  if (mime.startsWith("video/")) return "Video";
  return "Belge";
}

function isEligible(file) {
  return kindOf(file) !== "document" || ALLOWED_EXTENSIONS.has(extensionOf(file.name)) || file.type === "application/pdf";
}

function announce(message) {
  window.clearTimeout(state.toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  state.toastTimer = window.setTimeout(() => { toast.hidden = true; }, 4800);
}

function iconSvg(kind) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const add = (tag, attrs) => {
    const node = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    svg.append(node);
  };
  if (kind === "photo") {
    add("rect", { x: 3, y: 4, width: 18, height: 16, rx: 3 });
    add("circle", { cx: 9, cy: 9, r: 1.5 });
    add("path", { d: "m4 17 5-5 3 3 3-4 5 6" });
  } else if (kind === "video") {
    add("rect", { x: 3, y: 5, width: 13, height: 14, rx: 2.5 });
    add("path", { d: "m16 10 5-3v10l-5-3z" });
  } else {
    add("path", { d: "M6 3h8l5 5v13H6z" });
    add("path", { d: "M14 3v6h5M9 13h6M9 17h6" });
  }
  return svg;
}

function makeActionIcon(type) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 20 20");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", type === "preview"
    ? "M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z M10 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
    : "m10 2 2.3 4.7 5.2.8-3.8 3.7.9 5.2-4.6-2.5-4.6 2.5.9-5.2-3.8-3.7 5.2-.8z");
  svg.append(path);
  return svg;
}

function makeRecord(file, options = {}) {
  const record = {
    id: state.nextId++,
    file,
    name: file.name,
    size: file.size,
    type: file.type || "",
    kind: kindOf(file),
    lastModified: file.lastModified || 0,
    source: options.source || "picker",
    folderId: options.folderId ?? null,
    rootName: options.rootName || "",
    relativePath: options.relativePath || "",
    handle: options.handle || null,
    parentHandle: options.parentHandle || null,
    selected: false,
    protected: false,
    fingerprint: null,
    fingerprintKind: "pending",
    duplicate: null,
    error: "",
  };
  state.records.push(record);
  return record;
}

async function fingerprintFile(file) {
  if (!globalThis.crypto?.subtle) return null;
  let data;
  let strength;
  if (file.size <= FULL_HASH_LIMIT) {
    data = await file.arrayBuffer();
    strength = "exact";
  } else {
    const middle = Math.max(0, Math.floor(file.size / 2) - SAMPLE_BYTES / 2);
    const tail = Math.max(0, file.size - SAMPLE_BYTES);
    const sample = new Blob([
      new TextEncoder().encode(`size:${file.size};`),
      file.slice(0, SAMPLE_BYTES),
      file.slice(middle, middle + SAMPLE_BYTES),
      file.slice(tail, file.size),
    ]);
    data = await sample.arrayBuffer();
    strength = "sample";
  }
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return { hex, strength };
}

function normalizedName(name) {
  return name.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("tr-TR");
}

function setBusy(busy) {
  state.busy = busy;
  $("choose-files").disabled = busy;
  $("empty-choose").disabled = busy;
  $("choose-folder").disabled = busy;
  $("clear-analysis").disabled = busy;
  fileInput.disabled = busy;
  render();
}

function updateDuplicates() {
  for (const record of state.records) record.duplicate = null;
  const byContent = new Map();
  for (const record of state.records) {
    if (!record.fingerprint) continue;
    const key = `${record.size}:${record.fingerprintKind}:${record.fingerprint}`;
    if (!byContent.has(key)) byContent.set(key, []);
    byContent.get(key).push(record);
  }
  for (const group of byContent.values()) {
    if (group.length < 2) continue;
    const groupId = `content-${group[0].id}`;
    for (const record of group) record.duplicate = { id: groupId, kind: group[0].fingerprintKind, count: group.length };
  }

  const byNameAndSize = new Map();
  for (const record of state.records) {
    if (record.duplicate) continue;
    const key = `${record.size}:${normalizedName(record.name)}`;
    if (!byNameAndSize.has(key)) byNameAndSize.set(key, []);
    byNameAndSize.get(key).push(record);
  }
  for (const group of byNameAndSize.values()) {
    if (group.length < 2) continue;
    const groupId = `name-${group[0].id}`;
    for (const record of group) record.duplicate = { id: groupId, kind: "name", count: group.length };
  }
}

async function analyzeRecords(records) {
  if (!records.length) return;
  $("list-status").textContent = "İçerik benzerlikleri cihazında inceleniyor…";
  let analyzedBytes = 0;
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    if (analyzedBytes + record.size > MAX_ANALYSIS_BYTES) {
      record.fingerprintKind = "skipped";
    } else {
      analyzedBytes += record.size;
      try {
        const result = await fingerprintFile(record.file);
        if (result) {
          record.fingerprint = result.hex;
          record.fingerprintKind = result.strength;
        } else {
          record.fingerprintKind = "unavailable";
        }
      } catch {
        record.fingerprintKind = "unavailable";
      }
    }
    if ((index + 1) % 20 === 0 || index === records.length - 1) {
      $("list-status").textContent = `İçerik benzerliği inceleniyor… ${index + 1}/${records.length}`;
    }
  }
  updateDuplicates();
  render();
  $("list-status").textContent = "Analiz tamamlandı · dosyalar yalnızca bu oturumda tutuluyor";
}

function getSortedVisibleRecords() {
  let records = [...state.records];
  if (state.currentFilter === "large") records = records.filter((record) => record.size >= LARGE_FILE_BYTES);
  if (state.currentFilter === "duplicates") records = records.filter((record) => record.duplicate);
  if (state.currentFilter === "selected") records = records.filter((record) => record.selected);
  if (state.sort === "size") records.sort((a, b) => b.size - a.size || a.name.localeCompare(b.name, "tr"));
  if (state.sort === "newest") records.sort((a, b) => b.lastModified - a.lastModified || b.size - a.size);
  if (state.sort === "name") records.sort((a, b) => a.name.localeCompare(b.name, "tr"));
  return records;
}

function duplicateBadge(record) {
  if (!record.duplicate) return null;
  const badge = document.createElement("span");
  if (record.duplicate.kind === "exact") {
    badge.className = "badge badge-duplicate";
    badge.textContent = `Aynı içerik · ${record.duplicate.count} dosya`;
  } else if (record.duplicate.kind === "sample") {
    badge.className = "badge badge-duplicate";
    badge.textContent = `İçerik örneği eşleşiyor · ${record.duplicate.count}`;
  } else {
    badge.className = "badge badge-possible";
    badge.textContent = `Ad + boyut eşleşiyor · ${record.duplicate.count}`;
  }
  badge.title = record.duplicate.kind === "name"
    ? "Dosya adı ve boyutu aynı, ancak içerik doğrulanmadı. Silmeden önce önizle."
    : record.duplicate.kind === "sample"
      ? "Büyük dosyaların ilk, orta ve son bölümlerinden örnek karşılaştırıldı; eşleşme kesin değildir."
      : "Dosyaların SHA-256 içerik özeti aynı.";
  return badge;
}

function createFileRow(record) {
  const row = document.createElement("article");
  row.className = `file-row${record.protected ? " is-protected" : ""}`;
  row.dataset.id = String(record.id);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "file-check";
  checkbox.checked = record.selected;
  checkbox.disabled = record.protected;
  checkbox.setAttribute("aria-label", `${record.name} dosyasını temizlik için seç`);
  checkbox.addEventListener("change", () => {
    record.selected = checkbox.checked;
    render();
  });

  const typeIcon = document.createElement("span");
  typeIcon.className = `file-type-icon${record.kind === "photo" ? " is-photo" : record.kind === "video" ? " is-video" : ""}`;
  typeIcon.append(iconSvg(record.kind));

  const info = document.createElement("div");
  info.className = "file-info";
  const name = document.createElement("span");
  name.className = "file-name";
  name.textContent = record.name;
  name.title = record.name;
  const meta = document.createElement("span");
  meta.className = "file-meta";
  const type = document.createElement("span");
  type.textContent = `${record.kind === "photo" ? "Fotoğraf" : record.kind === "video" ? "Video" : "Belge"} · ${typeLabel(record.file)}`;
  const date = document.createElement("span");
  date.textContent = formatDate(record.lastModified);
  const source = document.createElement("span");
  source.textContent = record.source === "folder" ? "Klasör erişimi" : "Yalnızca okunur";
  meta.append(type, date, source);
  info.append(name, meta);

  const badges = document.createElement("span");
  badges.className = "file-badges";
  if (record.size >= LARGE_FILE_BYTES) {
    const large = document.createElement("span");
    large.className = "badge badge-large";
    large.textContent = "Büyük dosya";
    badges.append(large);
  }
  const duplicate = duplicateBadge(record);
  if (duplicate) badges.append(duplicate);
  if (record.fingerprintKind === "pending") {
    const pending = document.createElement("span");
    pending.className = "badge badge-analyzing";
    pending.textContent = "İçerik inceleniyor";
    badges.append(pending);
  } else if (record.fingerprintKind === "skipped" || record.fingerprintKind === "unavailable") {
    const skipped = document.createElement("span");
    skipped.className = "badge badge-analyzing";
    skipped.textContent = record.fingerprintKind === "skipped" ? "İçerik kontrolü atlandı" : "İçerik özeti alınamadı";
    badges.append(skipped);
  }
  if (record.protected) {
    const kept = document.createElement("span");
    kept.className = "badge badge-kept";
    kept.textContent = "Korunuyor";
    badges.append(kept);
  }
  if (record.error) {
    const failure = document.createElement("span");
    failure.className = "badge badge-possible";
    failure.textContent = record.error;
    badges.append(failure);
  }

  const size = document.createElement("span");
  size.className = "file-size";
  size.textContent = formatBytes(record.size);

  const preview = document.createElement("button");
  preview.type = "button";
  preview.className = "file-action preview-action";
  preview.append(makeActionIcon("preview"));
  preview.setAttribute("aria-label", `${record.name} dosyasını önizle`);
  preview.title = "Önizle";
  preview.addEventListener("click", () => openPreview(record));

  const protect = document.createElement("button");
  protect.type = "button";
  protect.className = "file-action protect-action";
  protect.append(makeActionIcon("protect"));
  protect.setAttribute("aria-label", record.protected ? `${record.name} için korumayı kaldır` : `${record.name} dosyasını koru`);
  protect.title = record.protected ? "Korumayı kaldır" : "Bu dosyayı koru";
  protect.setAttribute("aria-pressed", String(record.protected));
  protect.addEventListener("click", () => {
    record.protected = !record.protected;
    if (record.protected) record.selected = false;
    render();
  });

  row.append(checkbox, typeIcon, info, badges, size, preview, protect);
  return row;
}

function render() {
  const records = state.records;
  const selected = records.filter((record) => record.selected);
  const duplicateGroups = new Set(records.filter((record) => record.duplicate).map((record) => record.duplicate.id));
  const largeCount = records.filter((record) => record.size >= LARGE_FILE_BYTES).length;
  $("file-count").textContent = String(records.length);
  $("duplicate-count").textContent = String(duplicateGroups.size);
  $("selected-size").textContent = formatBytes(selected.reduce((total, record) => total + record.size, 0));
  $("selected-count").textContent = `${selected.length} öğe seçili`;
  $("filter-all-count").textContent = String(records.length);
  $("filter-large-count").textContent = String(largeCount);
  $("filter-duplicate-count").textContent = String(records.filter((record) => record.duplicate).length);
  $("filter-selected-count").textContent = String(selected.length);
  $("select-large").disabled = state.busy || largeCount === 0;
  $("cleanup-button").disabled = state.busy || selected.length === 0;
  $("cleanup-button").textContent = selected.some((record) => record.source === "folder") ? "Seçilenleri sil" : "Silme seçeneklerini gör";
  emptyState.hidden = records.length > 0;
  $("list-footer").hidden = records.length === 0;

  const visible = getSortedVisibleRecords();
  const existingRows = fileList.querySelectorAll(".file-row, .filter-empty");
  existingRows.forEach((node) => node.remove());
  for (const record of visible) fileList.append(createFileRow(record));
  if (records.length > 0 && visible.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state filter-empty";
    const title = document.createElement("h3");
    title.textContent = "Bu filtrede dosya yok";
    const message = document.createElement("p");
    message.textContent = "Başka bir filtre seçebilir veya yeni dosya ekleyebilirsin.";
    empty.append(title, message);
    fileList.append(empty);
  }
  if (records.length && !$("list-status").textContent.includes("inceleniyor")) {
    $("list-status").textContent = "Analiz tamamlandı · dosyalar yalnızca bu oturumda tutuluyor";
  }
}

async function addSelectedFiles(fileListLike, options = {}) {
  const records = [];
  for (const file of Array.from(fileListLike || [])) {
    if (!isEligible(file)) continue;
    records.push(makeRecord(file, options));
  }
  if (!records.length && fileListLike?.length) {
    announce("Seçimde desteklenen fotoğraf, video veya belge bulunamadı.");
    return;
  }
  if (records.length) {
    render();
    setBusy(true);
    announce(`${records.length} dosya incelemeye eklendi. Hiçbir dosya otomatik silinmez.`);
    try {
      await analyzeRecords(records);
    } finally {
      setBusy(false);
    }
  }
}

async function scanDirectory(directory, parent = directory, prefix = "", counter = { scanned: 0, truncated: false }, folderId = null, rootName = "") {
  for await (const entry of directory.values()) {
    if (counter.scanned >= MAX_FOLDER_FILES) {
      counter.truncated = true;
      return counter;
    }
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.kind === "directory") {
      await scanDirectory(entry, entry, relativePath, counter, folderId, rootName);
      if (counter.truncated) return counter;
    } else if (entry.kind === "file") {
      counter.scanned += 1;
      try {
        const file = await entry.getFile();
        if (isEligible(file)) makeRecord(file, { source: "folder", folderId, rootName, handle: entry, parentHandle: parent, relativePath });
      } catch {
        // İzin verilmeyen veya artık bulunmayan bir öğe listeye eklenmez.
      }
    }
  }
  return counter;
}

async function chooseFolder() {
  if (typeof window.showDirectoryPicker !== "function") {
    announce("Bu tarayıcı klasör erişimini desteklemiyor. Dosyaları analiz edebilirsin; silme işlemini telefonunun Dosyalar uygulamasından yap.");
    return;
  }
  let busyStarted = false;
  try {
    const folder = await window.showDirectoryPicker({ id: "cep-bakimi-folder", mode: "readwrite" });
    let permission = await folder.queryPermission({ mode: "readwrite" });
    if (permission !== "granted") permission = await folder.requestPermission({ mode: "readwrite" });
    if (permission !== "granted") {
      announce("Klasör için okuma ve yazma izni verilmedi; hiçbir dosya değiştirilmedi.");
      return;
    }
    let folderId;
    if (typeof folder.isSameEntry === "function") {
      for (const [existingId, existing] of state.folders) {
        if (await folder.isSameEntry(existing.handle)) {
          folderId = existingId;
          state.records = state.records.filter((record) => record.folderId !== existingId);
          break;
        }
      }
    }
    if (folderId === undefined) folderId = state.nextFolderId++;
    const rootName = `Klasör ${folderId} · ${folder.name}`;
    state.folders.set(folderId, { handle: folder, name: folder.name });
    state.folderHandle = folder;
    const before = state.records.length;
    setBusy(true);
    busyStarted = true;
    $("list-status").textContent = "Seçtiğin klasör gözden geçiriliyor…";
    announce("Klasör taranıyor. Yalnızca bu klasör ve alt klasörleri incelenir.");
    const result = await scanDirectory(folder, folder, "", { scanned: 0, truncated: false }, folderId, rootName);
    const added = state.records.slice(before);
    render();
    if (result.truncated) announce(`Güvenlik için en fazla ${MAX_FOLDER_FILES.toLocaleString("tr-TR")} dosya tarandı. Klasörün bir bölümü atlandı.`);
    else if (!added.length) announce("Seçtiğin klasörde desteklenen yeni dosya bulunamadı.");
    else announce(`${added.length} desteklenen dosya bulundu. Silme öncesi her öğe için ayrıca onay istenir.`);
    if (added.length) await analyzeRecords(added);
    else $("list-status").textContent = "Analiz tamamlandı · dosyalar yalnızca bu oturumda tutuluyor";
  } catch (error) {
    if (error?.name !== "AbortError") announce("Klasör açılamadı. Dosyalarına hiçbir değişiklik yapılmadı.");
  } finally {
    if (busyStarted) {
      updateDuplicates();
      setBusy(false);
    }
  }
}

function setFilter(button) {
  state.currentFilter = button.dataset.filter;
  document.querySelectorAll(".filter-button").forEach((item) => {
    const active = item === button;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-pressed", String(active));
  });
  render();
}

function openPreview(record) {
  const dialog = $("preview-dialog");
  const content = $("preview-content");
  const previewToken = ++state.previewToken;
  if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
  state.previewUrl = URL.createObjectURL(record.file);
  $("preview-title").textContent = record.name;
  $("preview-meta").textContent = `${typeLabel(record.file)} · ${formatBytes(record.size)} · ${formatDate(record.lastModified)}`;
  content.replaceChildren();
  if (record.kind === "photo" && !["heic", "heif"].includes(extensionOf(record.name))) {
    const image = document.createElement("img");
    image.src = state.previewUrl;
    image.alt = record.name;
    content.append(image);
  } else if (record.kind === "video") {
    const video = document.createElement("video");
    video.src = state.previewUrl;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", `${record.name} video önizlemesi`);
    content.append(video);
  } else if (record.type === "application/pdf" || extensionOf(record.name) === "pdf") {
    const frame = document.createElement("iframe");
    frame.src = state.previewUrl;
    frame.title = `${record.name} PDF önizlemesi`;
    frame.setAttribute("sandbox", "");
    frame.setAttribute("referrerpolicy", "no-referrer");
    content.append(frame);
  } else if (["txt", "csv"].includes(extensionOf(record.name)) && record.size <= 2 * 1024 * 1024) {
    const text = document.createElement("pre");
    text.className = "preview-text";
    text.textContent = "Metin önizlemesi yükleniyor…";
    content.append(text);
    if (!dialog.open) dialog.showModal();
    record.file.slice(0, 2 * 1024 * 1024).text().then((value) => {
      if (previewToken === state.previewToken && dialog.open) text.textContent = value;
    }).catch(() => {
      if (previewToken === state.previewToken && dialog.open) text.textContent = "Bu dosya metin olarak okunamadı.";
    });
    return;
  } else {
    const text = document.createElement("p");
    text.className = "preview-placeholder";
    text.textContent = record.kind === "photo"
      ? "Bu fotoğraf biçimi tarayıcıda önizlenemiyor. Dosyan cihazında değişmeden duruyor."
      : "Bu dosya biçimi tarayıcıda önizlenemiyor. İstersen cihazına bir kopyasını indirebilirsin.";
    const download = document.createElement("a");
    download.className = "button button-secondary";
    download.href = state.previewUrl;
    download.download = record.name;
    download.textContent = "Bir kopyasını indir";
    content.append(text, download);
  }
  if (!dialog.open) dialog.showModal();
}

function closePreview() {
  const dialog = $("preview-dialog");
  state.previewToken += 1;
  $("preview-content").replaceChildren();
  if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
  state.previewUrl = null;
  if (dialog.open) dialog.close();
}

function openCleanupDialog() {
  const selected = state.records.filter((record) => record.selected);
  const writable = selected.filter((record) => record.source === "folder" && record.parentHandle);
  const readOnlyCount = selected.length - writable.length;
  if (!selected.length) return;
  if (!writable.length) {
    announce("Dosya seçiciden eklenen dosyalar yalnızca okunur. Klasör seçimi bu tarayıcıda destekleniyorsa klasörü seçip doğrudan silme izni verebilirsin; değilse telefonunun Dosyalar uygulamasından sil.");
    return;
  }

  const total = writable.reduce((sum, record) => sum + record.size, 0);
  const roots = [...new Set(writable.map((record) => record.rootName))].join(", ");
  $("delete-copy").textContent = `${writable.length} dosya (${formatBytes(total)}) seçtiğin klasörlerden (${roots}) kalıcı olarak silinecek.${readOnlyCount ? ` Dosya seçiciden eklenen ${readOnlyCount} öğe yalnızca okunur olduğundan silinmeyecek.` : ""} Silmeden önce boyut ve tarih; içerik özeti varsa bu da yeniden kontrol edilir. Bu işlem geri alınamaz.`;
  const summary = $("delete-summary");
  summary.replaceChildren();
  for (const record of writable.slice(0, 8)) {
    const line = document.createElement("span");
    const name = document.createElement("b");
    name.textContent = `${record.rootName}/${record.relativePath || record.name}`;
    const size = document.createElement("span");
    size.textContent = formatBytes(record.size);
    line.append(name, size);
    summary.append(line);
  }
  if (writable.length > 8) {
    const extra = document.createElement("span");
    extra.textContent = `ve ${writable.length - 8} dosya daha`;
    summary.append(extra);
  }
  $("confirm-delete").checked = false;
  $("confirm-delete-button").disabled = true;
  $("delete-dialog").showModal();
}

async function deleteConfirmed() {
  const selected = state.records.filter((record) => record.selected);
  const writable = selected.filter((record) => record.source === "folder" && record.parentHandle);
  if (!writable.length || !$("confirm-delete").checked) return;
  const button = $("confirm-delete-button");
  button.disabled = true;
  button.textContent = "Siliniyor…";
  try {
    const folderIds = new Set(writable.map((record) => record.folderId));
    for (const folderId of folderIds) {
      const folder = state.folders.get(folderId);
      if (!folder) throw new Error("permission");
      let permission = await folder.handle.queryPermission({ mode: "readwrite" });
      if (permission !== "granted") permission = await folder.handle.requestPermission({ mode: "readwrite" });
      if (permission !== "granted") throw new Error("permission");
    }
    for (const record of writable) {
      const currentFile = await record.handle.getFile();
      if (currentFile.size !== record.size || (record.lastModified && currentFile.lastModified !== record.lastModified)) throw new Error("changed");
      if (record.fingerprint) {
        const currentFingerprint = await fingerprintFile(currentFile);
        if (!currentFingerprint || currentFingerprint.hex !== record.fingerprint) throw new Error("changed");
      }
    }
    const deletedIds = new Set();
    const errors = [];
    for (const record of writable) {
      try {
        await record.parentHandle.removeEntry(record.handle.name);
        deletedIds.add(record.id);
      } catch {
        record.error = "Silinemedi";
        record.selected = false;
        errors.push(record.name);
      }
    }
    const reclaimed = writable.filter((record) => deletedIds.has(record.id)).reduce((total, record) => total + record.size, 0);
    state.records = state.records.filter((record) => !deletedIds.has(record.id));
    for (const record of state.records) {
      if (record.selected) record.selected = false;
    }
    $("delete-dialog").close();
    updateDuplicates();
    render();
    if (deletedIds.size) announce(`${deletedIds.size} dosya seçtiğin klasörlerden silindi. Tahmini boşalan alan: ${formatBytes(reclaimed)}.${errors.length ? ` ${errors.length} dosya silinemedi.` : ""}`);
    else announce("Seçilen dosyalar silinemedi. Hiçbir dosyanın silindiği varsayılmadı.");
  } catch (error) {
    if (error.message === "changed") {
      $("delete-dialog").close();
      announce("Bir dosya tarama sonrasında değişmiş. Güvenlik için hiçbir dosya silinmedi; klasörü yeniden tara.");
    } else if (error.message === "permission") {
      $("delete-dialog").close();
      announce("Yazma izni verilmedi; hiçbir dosya silinmedi.");
    } else {
      announce("Silme işlemi tamamlanamadı. Klasör ve izin durumunu kontrol et.");
    }
  } finally {
    button.textContent = "Dosyaları sil";
    button.disabled = !$("confirm-delete").checked;
  }
}

async function updateStorageEstimate() {
  const meter = document.querySelector(".storage-meter");
  if (!navigator.storage?.estimate) {
    $("storage-used").textContent = "Kullanılamıyor";
    $("storage-quota").textContent = "Tarayıcı API'si desteklenmiyor";
    $("storage-caption").textContent = "Bu tarayıcı kullanım ve kota tahmini vermiyor. Telefonun toplam depolamasına web uygulaması erişemez.";
    return;
  }
  try {
    const estimate = await navigator.storage.estimate();
    if (!Number.isFinite(estimate.usage) || !Number.isFinite(estimate.quota) || estimate.quota <= 0) throw new Error("estimate");
    const percentage = Math.min(100, Math.round((estimate.usage / estimate.quota) * 100));
    $("storage-used").textContent = formatBytes(estimate.usage);
    $("storage-quota").textContent = `${formatBytes(estimate.quota)} tahmini kota`;
    $("storage-caption").textContent = "Bu değer yalnızca tarayıcının bu siteye ayırdığı alanı gösterir; telefonun toplam depolaması değildir.";
    $("storage-meter-fill").style.width = `${percentage}%`;
    meter.setAttribute("aria-valuenow", String(percentage));
  } catch {
    $("storage-used").textContent = "Bilgi alınamadı";
    $("storage-quota").textContent = "Tarayıcı izin vermedi";
    $("storage-caption").textContent = "Telefonun toplam depolaması web uygulamasına açık değildir.";
  }
}

function clearAnalysis() {
  if (state.busy) {
    announce("Dosyalar incelenirken liste temizlenemiyor. Analiz bitince yeniden dene.");
    return;
  }
  for (const record of state.records) {
    if (record.previewUrl) URL.revokeObjectURL(record.previewUrl);
  }
  state.records = [];
  state.folderHandle = null;
  state.folders.clear();
  fileInput.value = "";
  $("list-status").textContent = "Analiz tamamlandı";
  state.currentFilter = "all";
  document.querySelectorAll(".filter-button").forEach((button) => {
    const active = button.dataset.filter === "all";
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  render();
  announce("Analiz listesini temizledik. Dosyaların cihazında değişmeden kaldı.");
}

$("choose-files").addEventListener("click", () => fileInput.click());
$("empty-choose").addEventListener("click", () => fileInput.click());
$("choose-folder").addEventListener("click", chooseFolder);
fileInput.addEventListener("change", () => {
  void addSelectedFiles(fileInput.files, { source: "picker" });
  fileInput.value = "";
});
$("sort-select").addEventListener("change", (event) => {
  state.sort = event.target.value;
  render();
});
document.querySelectorAll(".filter-button").forEach((button) => button.addEventListener("click", () => setFilter(button)));
$("select-large").addEventListener("click", () => {
  for (const record of state.records) {
    if (record.size >= LARGE_FILE_BYTES && !record.protected) record.selected = true;
  }
  render();
  announce("50 MB ve üzerindeki dosyalar seçildi. Silmek için her birini gözden geçir.");
});
$("cleanup-button").addEventListener("click", openCleanupDialog);
$("confirm-delete").addEventListener("change", (event) => { $("confirm-delete-button").disabled = !event.target.checked; });
$("confirm-delete-button").addEventListener("click", deleteConfirmed);
$("close-preview").addEventListener("click", closePreview);
$("preview-dialog").addEventListener("close", () => {
  const dialog = $("preview-dialog");
  if (!dialog.open) {
    state.previewToken += 1;
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
    state.previewUrl = null;
    $("preview-content").replaceChildren();
  }
});
$("clear-analysis").addEventListener("click", clearAnalysis);

if (typeof window.showDirectoryPicker === "function") {
  $("choose-folder").hidden = false;
  $("folder-support-note").textContent = "Klasör seçimi destekleniyorsa, izin verdiğin klasörde seçili dosyaları uygulama içinden silebilirsin.";
} else {
  $("folder-support-note").textContent = "Bu tarayıcıda klasör erişimi kullanılamıyor olabilir. Dosya analizi yine çalışır; silme işlemini telefonunun Dosyalar uygulamasından yap.";
}

function waitForWaitingWorker(registration, timeoutMs = 12000) {
  if (registration.waiting) return Promise.resolve(registration.waiting);
  const installing = registration.installing;
  if (!installing) return Promise.resolve(null);

  return new Promise((resolve) => {
    let timer;
    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      window.clearTimeout(timer);
      resolve(registration.waiting);
    };
    const checkState = () => {
      if (installing.state === "installed") window.setTimeout(finish, 0);
      if (installing.state === "redundant") finish();
    };
    installing.addEventListener("statechange", checkState);
    timer = window.setTimeout(finish, timeoutMs);
    checkState();
  });
}

async function updateApplication() {
  const button = $("update-button");
  if (!("serviceWorker" in navigator)) {
    announce("Bu tarayıcı PWA güncelleme denetimini desteklemiyor.");
    return;
  }

  button.disabled = true;
  button.textContent = "Kontrol ediliyor…";
  try {
    const registration = state.serviceWorkerRegistration || await navigator.serviceWorker.getRegistration();
    if (!registration) {
      announce("Güncelleme denetimi hazır değil. Sayfayı yenileyip tekrar deneyebilirsin.");
      return;
    }

    let waitingWorker = registration.waiting;
    if (!waitingWorker) {
      await registration.update();
      waitingWorker = registration.waiting;
      if (!waitingWorker && registration.installing) {
        waitingWorker = await waitForWaitingWorker(registration);
      }
    }

    if (!waitingWorker) {
      announce("Uygulamanın güncel sürümü yüklü.");
      return;
    }

    button.textContent = "Güncelleniyor…";
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
    state.updateRequested = true;
    announce("Yeni sürüm hazır. Uygulama yenileniyor.");
  } catch {
    announce("Güncelleme denetlenemedi. İnternet bağlantını kontrol edip tekrar dene.");
  } finally {
    if (!state.updateRequested) {
      button.disabled = false;
      button.textContent = "Güncelle";
    }
  }
}

const isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
$("install-button").hidden = isStandalone;
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  state.installPrompt = event;
  $("install-button").hidden = false;
});
window.addEventListener("appinstalled", () => {
  state.installPrompt = null;
  $("install-button").hidden = true;
});
$("install-button").addEventListener("click", async () => {
  if (!state.installPrompt) {
    const isAppleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    announce(isAppleMobile
      ? "Safari'de Paylaş menüsünü açıp 'Ana Ekrana Ekle' seçeneğini kullanabilirsin."
      : "Tarayıcı menüsünü açıp 'Uygulamayı yükle' veya 'Ana ekrana ekle' seçeneğini kullanabilirsin.");
    return;
  }
  const promptEvent = state.installPrompt;
  state.installPrompt = null;
  await promptEvent.prompt();
  const result = await promptEvent.userChoice;
  if (result?.outcome === "accepted") $("install-button").hidden = true;
});
$("update-button").addEventListener("click", updateApplication);

if ("serviceWorker" in navigator && window.isSecureContext) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (state.updateRequested) window.location.reload();
  });
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then((registration) => {
      state.serviceWorkerRegistration = registration;
      if (registration.waiting) $("update-button").dataset.updateReady = "true";
      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        installing?.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            $("update-button").dataset.updateReady = "true";
          }
        });
      });
    }).catch(() => {
      // PWA, servis çalışanı kullanılamasa da çevrimiçi biçimde çalışır.
    });
  });
}

render();
updateStorageEstimate();
