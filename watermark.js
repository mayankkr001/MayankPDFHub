// watermark.js
// Add watermark to PDF using pdf-lib

document.addEventListener('DOMContentLoaded', () => {
    const { PDFDocument, StandardFonts, rgb, degrees } = PDFLib;

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const optionsPanel = document.getElementById('options-panel');
    const successState = document.getElementById('success-state');
    const filenameDisplay = document.getElementById('filename-display');
    const watermarkText = document.getElementById('watermark-text');
    const watermarkColor = document.getElementById('watermark-color');
    const processBtn = document.getElementById('process-btn');
    const downloadBtn = document.getElementById('download-btn');

    let currentFile = null;
    let originalFilename = '';

    window.PDFUtils.setupDropZone('drop-zone', 'file-input', handleFiles);

    function handleFiles(files) {
        if (files.length === 0) return;
        currentFile = files[0];
        originalFilename = currentFile.name;
        filenameDisplay.textContent = originalFilename;

        dropZone.style.display = 'none';
        optionsPanel.style.display = 'block';
    }

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 0, g: 0, b: 0 };
    }

    processBtn.addEventListener('click', async () => {
        if (!currentFile) {
            alert('Please select a PDF file first.');
            return;
        }

        const text = watermarkText.value || 'CONFIDENTIAL';
        const colorHex = watermarkColor.value || '#ff0000';
        const color = hexToRgb(colorHex);

        window.PDFUtils.showLoading(processBtn, 'Adding Watermark...');

        try {
            const arrayBuffer = await window.PDFUtils.readFileAsArrayBuffer(currentFile);
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const pages = pdfDoc.getPages();

            pages.forEach(page => {
                const { width, height } = page.getSize();
                const fontSize = 50;

                // Draw text diagonally across center
                page.drawText(text, {
                    x: width / 2 - (text.length * fontSize) / 4, // Rough centering
                    y: height / 2,
                    size: fontSize,
                    font: helveticaFont,
                    color: rgb(color.r, color.g, color.b),
                    rotate: degrees(45),
                    opacity: 0.5,
                });
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            optionsPanel.style.display = 'none';
            successState.style.display = 'block';
            window.PDFUtils.hideLoading(processBtn);

            downloadBtn.onclick = () => {
                const newFilename = 'watermarked_' + originalFilename;
                window.PDFUtils.downloadFile(blob, newFilename);
            };

        } catch (error) {
            console.error('Watermark error:', error);
            alert('Failed to watermark PDF. File might be encrypted or corrupted.');
            window.PDFUtils.hideLoading(processBtn);
        }
    });

});
