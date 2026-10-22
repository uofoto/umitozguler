document.addEventListener('DOMContentLoaded', () => {
    console.log("Sayfa yüklendi. Script çalışıyor.");
    
    const imageInput = document.getElementById('imageInput');
    const inputCanvas = document.getElementById('inputCanvas');
    const outputCanvas = document.getElementById('outputCanvas');
    const processBtn = document.getElementById('processBtn');
    const statusDiv = document.getElementById('status');
    const downloadLink = document.getElementById('downloadLink');

    // Elementlerin bulunduğunu kontrol et
    if (!imageInput || !inputCanvas || !outputCanvas || !processBtn) {
        console.error("HTML Elementlerinden biri bulunamadı! ID'leri kontrol et.");
        return;
    }

    const ctxInput = inputCanvas.getContext('2d');
    const ctxOutput = outputCanvas.getContext('2d');

    let originalImage = null;

    console.log("Resim yükleme dinleyicisi kuruldu.");

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files;
        if (!file) return;

        statusDiv.innerText = "Resim yükleniyor...";
        const reader = new FileReader();
        
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                console.log("Resim yüklendi ve canvas'a çiziliyor.", img.width, "x", img.height);
                
                inputCanvas.width = img.width;
                inputCanvas.height = img.height;
                ctxInput.drawImage(img, 0, 0);
                
                originalImage = img;
                statusDiv.innerText = "Resim yüklendi. İşlemeye hazır.";
                processBtn.disabled = false;
                
                outputCanvas.style.display = 'none';
                downloadLink.style.display = 'none';
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    processBtn.addEventListener('click', async () => {
        if (!originalImage) {
            alert("Lütfen önce bir resim seçin!");
            return;
        }

        console.log("İşlem butonuna basıldı. Başlatılıyor...");
        processBtn.disabled = true;
        statusDiv.innerText = "FFT işlemi başlatılıyor... Lütfen bekleyin (bu biraz sürebilir).";
        
        try {
            await cleanImageWithFFT(inputCanvas, outputCanvas);
            
            console.log("İşlem tamamlandı. Görseller gösteriliyor.");
            outputCanvas.style.display = 'block';
            
            const dataURL = outputCanvas.toDataURL('image/png');
            downloadLink.href = dataURL;
            downloadLink.download = 'temizlenmis_gorsel.png';
            downloadLink.style.display = 'inline-block';
            
            statusDiv.innerText = "İşlem tamamlandı! Sonucu indirebilirsiniz.";
        } catch (error) {
            console.error("İşlem sırasında kritik hata oluştu:", error);
            statusDiv.innerText = "Hata oluştu: " + error.message;
            alert("Bir hata oluştu. Konsolu (F12 -> Console) kontrol et.");
        } finally {
            processBtn.disabled = false;
        }
    });

    // FFT Fonksiyonu
    async function cleanImageWithFFT(canvasElementId, outputCanvasId) {
        const inputCanvas = document.getElementById(canvasElementId);
        const outputCanvas = document.getElementById(outputCanvasId);
        const ctx = inputCanvas.getContext('2d');
        const outCtx = outputCanvas.getContext('2d');

        const width = inputCanvas.width;
        const height = inputCanvas.height;

        console.log(`Görsel boyutu: \${width}x\${height}`);

        // 1. Piksel Verilerini Al
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        let matrix = new Float32Array(width * height);

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            matrix[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
        }

        console.log("Piksel verileri alındı. FFT işlemine geçiliyor...");

        // Matrisi 2D'ye çevir
        let rows = ;
        for (let y = 0; y < height; y++) {
            let row = ;
            for (let x = 0; x < width; x++) {
                row.push(matrix[y * width + x]);
            }
            rows.push(row);
        }

        // Satır bazlı FFT
        console.log("Satır FFT'si hesaplanıyor...");
        for (let y = 0; y < height; y++) {
            if (typeof math === 'undefined') throw new Error("Math.js kütüphanesi yüklenmedi!");
            rows[y] = math.fft(rows[y]);
        }

        // Transpoze
        let cols = ;
        for (let x = 0; x < width; x++) {
            let col = ;
            for (let y = 0; y < height; y++) {
                col.push(rows[y][x]);
            }
            cols.push(col);
        }

        // Sütun bazlı FFT
        console.log("Sütun FFT'si hesaplanıyor...");
        for (let x = 0; x < width; x++) {
            cols[x] = math.fft(cols[x]);
        }

        // Transpoze geri
        let spectrum = ;
        for (let y = 0; y < height; y++) {
            let row = ;
            for (let x = 0; x < width; x++) {
                row.push(cols[x][y]);
            }
            spectrum.push(row);
        }

        // Filtreleme
        console.log("Filtreleme uygulanıyor...");
        const cx = width / 2;
        const cy = height / 2;
        const sigma = Math.min(width, height) / 8;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let u = x;
                let v = y;
                if (u >= cx) u -= width;
                if (v >= cy) v -= height;
                
                const dist = Math.sqrt(u*u + v*v);
                const filterVal = Math.exp(-(dist*dist) / (2 * sigma * sigma));

                spectrum[y][x].re *= filterVal;
                spectrum[y][x].im *= filterVal;
            }
        }

        // Ters FFT - Sütun
        console.log("Ters FFT (Sütun) hesaplanıyor...");
        let iCols = ;
        for (let x = 0; x < width; x++) {
            iCols[x] = math.ifft(spectrum.map(row => row[x]));
        }

        // Transpoze
        let iRows = ;
        for (let y = 0; y < height; y++) {
            let row = ;
            for (let x = 0; x < width; x++) {
                row.push(iCols[x][y]);
            }
            iRows.push(row);
        }

        // Ters FFT - Satır
        console.log("Ters FFT (Satır) hesaplanıyor...");
        let resultMatrix = ;
        for (let y = 0; y < height; y++) {
            resultMatrix.push(math.ifft(iRows[y]));
        }

        // Sonuç Görseli
        console.log("Sonuç görseli oluşturuluyor...");
        const outputData = outCtx.createImageData(width, height);
        let maxVal = 0;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const val = resultMatrix[y][x].re;
                if (val > maxVal) maxVal = val;
            }
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let val = resultMatrix[y][x].re;
                val = (val / maxVal) * 255;
                if (val < 0) val = 0;
                if (val > 255) val = 255;

                const idx = (y * width + x) * 4;
                outputData.data[idx] = val;
                outputData.data[idx + 1] = val;
                outputData.data[idx + 2] = val;
                outputData.data[idx + 3] = 255;
            }
        }

        outCtx.putImageData(outputData, 0, 0);
        console.log("Tüm işlemler başarıyla tamamlandı.");
    }
});
