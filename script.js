function processImages() {
    const files = document.getElementById('upload').files;
    const watermarkFile = document.getElementById('watermarkImage').files[0];
    const folderName = document.getElementById('albumName').value || 'watermarked_images'; 
    const processedImages = [];
    const progressBar = document.getElementById('progressBar');
    const maxTotalSizeMB = 100; // 100MB limit
    const maxTotalSizeBytes = maxTotalSizeMB * 1024 * 1024;

    // Check if no images are selected
    if (files.length === 0) {
        alert('Please select images to upload.');
        return;
    }

    // Calculate total file size
    let totalSize = 0;
    for (let i = 0; i < files.length; i++) {
        totalSize += files[i].size;
    }

    if (totalSize > maxTotalSizeBytes) {
        alert(`The total file size exceeds ${maxTotalSizeMB}MB. Please reduce the number of images or use smaller files.`);
        return;
    }
    
    progressBar.value = 0; // Reset progress bar
    progressBar.max = files.length; // Set max value to the number of files
    
    if (!watermarkFile) {
        alert('Please upload a watermark image.');
        return;
    }

    const watermarkReader = new FileReader();
    watermarkReader.onload = function(event) {
        const watermarkImg = new Image();
        watermarkImg.src = event.target.result;
        watermarkImg.onload = function() {
            Array.from(files).forEach((file, index) => {
                processSingleImage(file, index, watermarkImg, processedImages, files.length, folderName, progressBar);
            });
        };
    };
    watermarkReader.readAsDataURL(watermarkFile);
}


function processSingleImage(file, index, watermarkImg, processedImages, totalFiles, folderName, progressBar) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // Add watermark image in the bottom right corner
            const watermarkSize = Math.min(canvas.width, canvas.height) * 0.15; 
            ctx.drawImage(
                watermarkImg,
                canvas.width - watermarkSize - 0, // 0 margin
                canvas.height - watermarkSize - 0,
                watermarkSize,
                watermarkSize
            );

            // Convert canvas to image data URL
            const dataURL = canvas.toDataURL('image/png');
            processedImages.push({ filename: `watermarked_image_${index + 1}.png`, data: dataURL });

            // Update progress bar
            progressBar.value = processedImages.length;

            // Check if all images have been processed
            if (processedImages.length === totalFiles) {
                saveImagesToZip(processedImages, folderName);
            }
        };
    };
    reader.readAsDataURL(file);
}

function saveImagesToZip(images, folderName) {
    const zip = new JSZip();
    const folder = zip.folder(folderName);

    images.forEach(image => {
        folder.file(image.filename, image.data.split(',')[1], { base64: true });
    });

    zip.generateAsync({ type: 'blob' }).then(function(content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${folderName}.zip`;
        link.click();
    });
}

function previewImage() {
    const files = document.getElementById('upload').files;
    const watermarkFile = document.getElementById('watermarkImage').files[0];
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');

    if (files.length === 0) {
        alert('Please select an image to preview.');
        return;
    }

    if (!watermarkFile) {
        alert('Please upload a watermark image.');
        return;
    }

    const watermarkReader = new FileReader();
    watermarkReader.onload = function(event) {
        const watermarkImg = new Image();
        watermarkImg.src = event.target.result;
        watermarkImg.onload = function() {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.src = event.target.result;
                img.onload = function() {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    // Add watermark image in the bottom right corner
                    const watermarkSize = Math.min(canvas.width, canvas.height) * 0.15; 
                    ctx.drawImage(
                        watermarkImg,
                        canvas.width - watermarkSize - 0, // 0 margin
                        canvas.height - watermarkSize - 0,
                        watermarkSize,
                        watermarkSize
                    );

                    // Display the canvas
                    canvas.style.display = 'block';
                };
            };
            reader.readAsDataURL(files[0]);
        };
    };
    watermarkReader.readAsDataURL(watermarkFile);
}