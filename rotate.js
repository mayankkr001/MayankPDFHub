// Rotate Tool Logic
let selectedFile = null;
let currentRotation = 0;
let rotatedPdfBlob = null;

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const optionsPanel = document.getElementById('options-panel');
    const processBtn = document.getElementById('process-btn');
    const successState = document.getElementById('success-state');
    const downloadBtn = document.getElementById('download-btn');
    const fileInput = document.getElementById('file-input');
    const filenameDisplay = document.getElementById('filename-display');
    const rotateLeftBtn = document.getElementById('rotate-left');
    const rotateRightBtn = document.getElementById('rotate-right');
    const rotationDisplay = document.getElementById('rotation-display');

    PDFUtils.setupDropZone('drop-zone', 'file-input', handleFiles);

    function handleFiles(files) {
        const file = files[0];
        if (file.type !== 'application/pdf') {
            alert('Please select a valid PDF file.');
            return;
        }
        selectedFile = file;
        filenameDisplay.textContent = file.name;
        dropZone.style.display = 'none';
        optionsPanel.style.display = 'block';
    }

    rotateLeftBtn.addEventListener('click', () => {
        currentRotation = (currentRotation - 90) % 360;
        updateRotationDisplay();
    });

    rotateRightBtn.addEventListener('click', () => {
        currentRotation = (currentRotation + 90) % 360;
        updateRotationDisplay();
    });

    function updateRotationDisplay() {
        let displayRot = currentRotation;
        if (displayRot < 0) displayRot += 360;
        rotationDisplay.textContent = `Rotation: ${displayRot}°`;
    }

    processBtn.addEventListener('click', async () => {
        if (!selectedFile) return;
        try {
            PDFUtils.showLoading(processBtn, 'Rotating...');

            const arrayBuffer = await PDFUtils.readFileAsArrayBuffer(selectedFile);
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();

            pages.forEach(page => {
                const existingRotation = page.getRotation().angle;
                page.setRotation(PDFLib.degrees(existingRotation + currentRotation));
            });

            const pdfBytes = await pdfDoc.save();
            rotatedPdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

            optionsPanel.style.display = 'none';
            successState.style.display = 'block';

        } catch (error) {
            console.error(error);
            alert('Error rotating PDF.');
        } finally {
            PDFUtils.hideLoading(processBtn);
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (rotatedPdfBlob) {
            PDFUtils.downloadFile(rotatedPdfBlob, `${selectedFile.name.replace(/\.pdf$/i, '')}_rotated_mayankpdfhub.pdf`);
        }
    });
});

