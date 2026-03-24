// Split Tool Logic

let selectedFile = null;

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const optionsContainer = document.getElementById('options-container');
    const splitBtn = document.getElementById('split-btn');
    const changeFileBtn = document.getElementById('change-file-btn');
    const successState = document.getElementById('success-state');
    const downloadBtn = document.getElementById('download-btn');
    const fileInput = document.getElementById('file-input');

    // File info els
    const fileNameEl = document.getElementById('file-name');
    const fileSizeEl = document.getElementById('file-size');
    const rangeInput = document.getElementById('range-input');

    let splitPdfBlob = null;
    let totalPages = 0;

    // Initialize Drop Zone
    PDFUtils.setupDropZone('drop-zone', 'file-input', handleFiles);

    function handleFiles(files) {
        const file = files[0];
        if (file.type !== 'application/pdf') {
            alert('Please select a valid PDF file.');
            return;
        }
        selectedFile = file;

        // Load file to get page count (optional UX improvement)
        // For now, update UI immediately
        updateUI();
        loadPageCount();
    }

    async function loadPageCount() {
        try {
            const arrayBuffer = await PDFUtils.readFileAsArrayBuffer(selectedFile);
            const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
            totalPages = pdf.getPageCount();
            rangeInput.placeholder = `e.g. 1-${totalPages > 5 ? 5 : totalPages}`;
        } catch (e) {
            console.error('Error loading PDF info', e);
        }
    }

    function updateUI() {
        if (selectedFile) {
            dropZone.style.display = 'none';
            optionsContainer.style.display = 'block';
            fileNameEl.textContent = selectedFile.name;
            fileSizeEl.textContent = PDFUtils.formatBytes(selectedFile.size);
            rangeInput.value = '';
        } else {
            dropZone.style.display = 'block';
            optionsContainer.style.display = 'none';
        }
    }

    changeFileBtn.addEventListener('click', () => {
        selectedFile = null;
        updateUI();
    });

    // Parse Range String "1-3, 5, 7-9" -> [0, 1, 2, 4, 6, 7, 8] (0-indexed)
    function parsePageRange(rangeStr, maxPages) {
        const pages = new Set();
        const parts = rangeStr.split(',');

        for (const part of parts) {
            const trimmed = part.trim();
            if (trimmed.includes('-')) {
                const [start, end] = trimmed.split('-').map(num => parseInt(num));
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = start; i <= end; i++) {
                        if (i >= 1 && i <= maxPages) pages.add(i - 1);
                    }
                }
            } else {
                const num = parseInt(trimmed);
                if (!isNaN(num) && num >= 1 && num <= maxPages) {
                    pages.add(num - 1);
                }
            }
        }
        return Array.from(pages).sort((a, b) => a - b);
    }

    splitBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        const rangeStr = rangeInput.value.trim();
        if (!rangeStr) {
            alert('Please enter page ranges.');
            return;
        }

        try {
            PDFUtils.showLoading(splitBtn, 'Splitting...');

            const arrayBuffer = await PDFUtils.readFileAsArrayBuffer(selectedFile);
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const total = pdfDoc.getPageCount();

            const pagesToKeep = parsePageRange(rangeStr, total);

            if (pagesToKeep.length === 0) {
                alert('Invalid page range. Please check input.');
                PDFUtils.hideLoading(splitBtn);
                return;
            }

            const newPdf = await PDFLib.PDFDocument.create();
            const copiedPages = await newPdf.copyPages(pdfDoc, pagesToKeep);
            copiedPages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            splitPdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

            optionsContainer.style.display = 'none';
            successState.style.display = 'block';

        } catch (error) {
            console.error(error);
            alert('Error splitting PDF.');
        } finally {
            PDFUtils.hideLoading(splitBtn);
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (splitPdfBlob) {
            PDFUtils.downloadFile(splitPdfBlob, `${selectedFile.name.replace(/\.pdf$/i, '')}_split_mayankpdfhub.pdf`);
        }
    });

});

