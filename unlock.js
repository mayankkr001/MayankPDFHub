// unlock.js
// Unlock PDF using pdf-lib

document.addEventListener('DOMContentLoaded', () => {
    const { PDFDocument } = PDFLib;

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const optionsPanel = document.getElementById('options-panel');
    const successState = document.getElementById('success-state');
    const filenameDisplay = document.getElementById('filename-display');
    const passwordInput = document.getElementById('password-input');
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
        passwordInput.focus();
    }

    processBtn.addEventListener('click', async () => {
        const password = passwordInput.value;
        // User might not enter password if they think it's just removing it without knowing it.
        // But client-side decrypt usually requires the password.

        window.PDFUtils.showLoading(processBtn, 'Unlocking...');

        try {
            const arrayBuffer = await window.PDFUtils.readFileAsArrayBuffer(currentFile);

            // Try to load with password
            // If the PDF is NOT encrypted, this will just load it.
            // If it IS encrypted, it needs the password.

            let pdfDoc;
            try {
                pdfDoc = await PDFDocument.load(arrayBuffer, { password: password });
            } catch (err) {
                // Wrong password or unknown encryption
                throw new Error('Incorrect password or unsupported encryption.');
            }

            // To "unlock" it (remove password), we just save it. 
            // PDF-Lib saves without encryption by default unless encrypt() is called.
            const pdfBytes = await pdfDoc.save();

            // Success
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            optionsPanel.style.display = 'none';
            successState.style.display = 'block';
            window.PDFUtils.hideLoading(processBtn);

            downloadBtn.onclick = () => {
                const newFilename = 'unlocked_' + originalFilename;
                window.PDFUtils.downloadFile(blob, newFilename);
            };

        } catch (error) {
            console.error('Unlock error:', error);
            alert('Failed to unlock PDF. Please check if the password is correct.');
            window.PDFUtils.hideLoading(processBtn);
        }
    });
});
