// Protect Tool Logic
let selectedFile = null;
let protectedPdfBlob = null;

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const optionsPanel = document.getElementById('options-panel');
    const processBtn = document.getElementById('process-btn');
    const successState = document.getElementById('success-state');
    const downloadBtn = document.getElementById('download-btn');
    const filenameDisplay = document.getElementById('filename-display');
    const passwordInput = document.getElementById('password-input');

    PDFUtils.setupDropZone('drop-zone', 'file-input', handleFiles);

    function handleFiles(files) {
        const file = files[0];
        if (!file) return;

        const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
        if (!isPdf) {
            alert('Please select a valid PDF file.');
            return;
        }

        selectedFile = file;
        filenameDisplay.textContent = file.name;
        dropZone.style.display = 'none';
        optionsPanel.style.display = 'block';
    }

    processBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        const password = passwordInput.value.trim();
        if (!password) {
            alert('Please enter a password.');
            return;
        }

        try {
            PDFUtils.showLoading(processBtn, 'Encrypting...');

            const arrayBuffer = await PDFUtils.readFileAsArrayBuffer(selectedFile);
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

            if (typeof pdfDoc.encrypt !== 'function') {
                throw new Error('Encryption API missing.');
            }

            await pdfDoc.encrypt({
                userPassword: password,
                ownerPassword: password,
                permissions: {
                    printing: 'highResolution',
                    copying: false,
                    modifying: false,
                    annotating: true,
                    fillingForms: true,
                    contentAccessibility: true,
                    documentAssembly: false
                }
            });

            const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
            protectedPdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

            optionsPanel.style.display = 'none';
            successState.style.display = 'block';
        } catch (error) {
            console.error('Protect error:', error);
            alert('Failed to protect PDF. Please try another file or refresh and retry.');
        } finally {
            PDFUtils.hideLoading(processBtn);
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (!protectedPdfBlob || !selectedFile) return;
        PDFUtils.downloadFile(
            protectedPdfBlob,
            `${selectedFile.name.replace(/\.pdf$/i, '')}_protected_mayankpdfhub.pdf`
        );
    });
});
