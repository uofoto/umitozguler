/* HEIC/HEIF dönüştürme hattı: dosyalar yalnızca tarayıcıda işlenir.
   libheif-js LGPL-3.0 ile; kayıpsız WebP kodlayıcısı üçüncü taraf lisanslarıyla dağıtılır. */
(function (root) {
  'use strict';

  var current = document.currentScript;
  var base = current && current.src ? new URL('.', current.src).href : location.href;
  var modulePromise = null;
  var webpPromise = null;
  var MAX_PIXELS = 32e6;

  function loadScript(name) {
    var src = new URL(name, base).href;
    var found = Array.prototype.find.call(document.scripts, function (s) { return s.src === src; });
    if (found) {
      if (found.dataset.izsizLoaded === 'true' || found.readyState === 'complete') return Promise.resolve();
      if (found.dataset.izsizLoading) return new Promise(function (resolve, reject) {
        found.addEventListener('load', resolve, { once: true });
        found.addEventListener('error', reject, { once: true });
      });
    }
    return new Promise(function (resolve, reject) {
      var script = found || document.createElement('script');
      script.src = src;
      script.async = true;
      script.dataset.izsizLoading = 'true';
      script.onload = function () { script.dataset.izsizLoaded = 'true'; resolve(); };
      script.onerror = function () { reject(new Error('Dönüştürme bileşeni yüklenemedi: ' + name)); };
      if (!found) document.head.appendChild(script);
    });
  }

  async function getHeifModule() {
    if (!modulePromise) {
      modulePromise = loadScript('libheif-bundle.js').then(function () {
        if (typeof root.libheif !== 'function') throw new Error('HEIC çözücüsü başlatılamadı.');
        return root.libheif();
      }).catch(function (err) { modulePromise = null; throw err; });
    }
    return modulePromise;
  }

  async function getWebpEncoder() {
    if (!webpPromise) {
      webpPromise = loadScript('webp-encoder.js').then(function () {
        if (!root.IzsizWebP || typeof root.IzsizWebP.encode !== 'function') throw new Error('WebP kodlayıcısı başlatılamadı.');
        return root.IzsizWebP;
      }).catch(function (err) { webpPromise = null; throw err; });
    }
    return webpPromise;
  }

  function createImageData(width, height, data) {
    if (typeof ImageData === 'function') return new ImageData(data, width, height);
    var canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    var ctx = canvas.getContext('2d');
    var out = ctx.createImageData(width, height);
    out.data.set(data);
    return out;
  }

  function canvasBlob(canvas, type, quality) {
    return new Promise(function (resolve, reject) {
      try {
        canvas.toBlob(function (blob) {
          if (!blob) return reject(new Error('Görüntü kodlanamadı.'));
          if (blob.type !== type) return reject(new Error('Tarayıcı istenen çıktı biçimini desteklemiyor: ' + type));
          resolve(blob);
        }, type, quality);
      } catch (err) { reject(err); }
    });
  }

  async function decode(buffer) {
    var mod = await getHeifModule();
    var decoder = new mod.HeifDecoder();
    var images = [];
    try {
      images = decoder.decode(buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer));
      if (!images || !images.length) throw new Error('HEIC/HEIF dosyası okunamadı veya içinde görüntü bulunamadı.');
      var image = images.find(function (candidate) { return candidate.is_primary && candidate.is_primary(); }) || images[0];
      var width = image.get_width(), height = image.get_height();
      if (!width || !height) throw new Error('Görüntü boyutları okunamadı.');
      if (width * height > MAX_PIXELS) throw new Error('Görüntü ' + Math.round(width * height / 1e6) + ' MP. Bellek güvenliği için HEIC/HEIF dönüştürme sınırı 32 MP.');
      var pixels = new Uint8ClampedArray(width * height * 4);
      await new Promise(function (resolve, reject) {
        try {
          image.display({ data: pixels, width: width, height: height }, function (result) {
            if (!result) return reject(new Error('HEIC/HEIF görüntüsü çözülemedi. Dosya bozuk veya codec desteklenmiyor olabilir.'));
            resolve();
          });
        } catch (err) { reject(err); }
      });
      return { imageData: createImageData(width, height, pixels), width: width, height: height };
    } finally {
      images.forEach(function (item) { if (item && typeof item.free === 'function') item.free(); });
      if (decoder.decoder) {
        mod.heif_context_free(decoder.decoder);
        decoder.decoder = null;
      }
    }
  }

  async function convert(buffer, format) {
    if (format !== 'png' && format !== 'jpg' && format !== 'webp') throw new Error('Çıktı biçimi geçersiz.');
    var source = await decode(buffer);
    var blob;
    if (format === 'webp') {
      var encoder = await getWebpEncoder();
      blob = await encoder.encode(source.imageData);
    } else {
      var canvas = document.createElement('canvas');
      canvas.width = source.width; canvas.height = source.height;
      var ctx = canvas.getContext('2d', { alpha: format !== 'jpg' });
      if (!ctx) throw new Error('Tarayıcı görüntü belleğini ayıramadı.');
      if (format === 'jpg') {
        var flat = ctx.createImageData(source.width, source.height);
        for (var i = 0; i < source.imageData.data.length; i += 4) {
          var alpha = source.imageData.data[i + 3] / 255;
          flat.data[i] = Math.round(source.imageData.data[i] * alpha + 255 * (1 - alpha));
          flat.data[i + 1] = Math.round(source.imageData.data[i + 1] * alpha + 255 * (1 - alpha));
          flat.data[i + 2] = Math.round(source.imageData.data[i + 2] * alpha + 255 * (1 - alpha));
          flat.data[i + 3] = 255;
        }
        ctx.putImageData(flat, 0, 0);
      } else ctx.putImageData(source.imageData, 0, 0);
      blob = await canvasBlob(canvas, format === 'jpg' ? 'image/jpeg' : 'image/png', format === 'jpg' ? 1 : undefined);
      canvas.width = 0; canvas.height = 0;
    }
    return {
      blob: blob,
      imageData: source.imageData,
      width: source.width,
      height: source.height,
      mime: format === 'jpg' ? 'image/jpeg' : 'image/' + format,
      ext: format === 'jpg' ? '.jpg' : '.' + format,
      lossless: format !== 'jpg'
    };
  }

  root.IzsizHeif = { decode: decode, convert: convert };
})(window);
