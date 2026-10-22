// app.js

document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const inputCanvas = document.getElementById('inputCanvas');
    const outputCanvas = document.getElementById('outputCanvas');
    const processBtn = document.getElementById('processBtn');
    const statusDiv = document.getElementById('status');
    const downloadLink = document.getElementById('downloadLink');

    const ctxInput = inputCanvas.getContext('2d');
    const ctxOutput = outputCanvas.getContext('2d');

    let originalImage = null;

    // Resim Yükleme İşlemi
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files;
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Canvas boyutlarını ayarla
                inputCanvas.width = img.width;
                inputCanvas.height = img.height;
                ctxInput.drawImage(img, 0, 0);
                
                originalImage = img;
                statusDiv.innerText = "Resim yüklendi. İşlemeye hazır.";
                processBtn.disabled = false;
                
                // Output canvas'ı gizle
                outputCanvas.style.display = 'none';
                downloadLink.style.display = 'none';
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // İşlem Butonu
    processBtn.addEventListener('click', async () => {
        if (!originalImage) return;

        processBtn.disabled = true;
        statusDiv.innerText = "FFT işlemi başlatılıyor... Lütfen bekleyin.";
        
        try {
            await cleanImageWithFFT(inputCanvas, outputCanvas);
            
            outputCanvas.style.display = 'block';
            
            // İndirme linkini hazırla
            const dataURL = outputCanvas.toDataURL('image/png');
            downloadLink.href = dataURL;
            downloadLink.download = 'temizlenmis_gorsel.png';
            downloadLink.style.display = 'inline-block';
            
            statusDiv.innerText = "İşlem tamamlandı!";
        } catch (error) {
            console.error(error);
            statusDiv.innerText = "Hata oluştu: " + error.message;
        } finally {
            processBtn.disabled = false;
        }
    });

    // FFT Fonksiyonu (Daha önceki mesajdaki kodun burada olması gerekiyor)
    async function cleanImageWithFFT(canvasElementId, outputCanvasId) {
        const inputCanvas = document.getElementById(canvasElementId);
        const outputCanvas = document.getElementById(outputCanvasId);
        const ctx = inputCanvas.getContext('2d');
        const outCtx = outputCanvas.getContext('2d');

        outputCanvas.width = inputCanvas.width;
        outputCanvas.height = inputCanvas.height;

        const width = inputCanvas.width;
        const height = inputCanvas.height;

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
        for (let y = 0; y < height; y++) {
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

        // Filtreleme (Gaussian Low-pass)
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

        // Ters FFT (IFFT) - Sütun
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

        // Ters FFT (IFFT) - Satır
        let resultMatrix = ;
        for (let y = 0; y < height; y++) {
            resultMatrix.push(math.ifft(iRows[y]));
        }

        // Sonuç Görseli
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
    }
});
