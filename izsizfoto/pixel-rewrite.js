/* İzsiz Foto — deneysel, temel RGB LSB piksel dönüşümü.
 * Yalnızca her RGB kanalının en düşük bitini sıfırlar; anahtarlı/dağıtılmış
 * filigranları algılamaz veya kaldırdığını garanti etmez.
 */
(function (root) {
  'use strict';

  function clearRgbLsb(rgba, width, height) {
    var pixels = width * height;
    if (!rgba || !width || !height || rgba.length < pixels * 4) {
      throw new Error('Piksel verisi eksik veya boyutlar geçersiz.');
    }
    var changedChannels = 0;
    for (var i = 0; i < pixels * 4; i += 4) {
      for (var c = 0; c < 3; c++) {
        if (rgba[i + c] & 1) {
          rgba[i + c] &= 0xfe;
          changedChannels++;
        }
      }
    }
    return { changedChannels: changedChannels, totalChannels: pixels * 3 };
  }

  var api = { clearRgbLsb: clearRgbLsb };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.IzsizPixelRewrite = api;
})(typeof self !== 'undefined' ? self : this);
