//Create file selector objects to handle importing tempImages or image folders
window.addEventListener('DOMContentLoaded', () => {
    let imageImportButton = document.getElementById('import-image');
    imageImportButton.onclick = () => {
        let folderSelector = document.createElement('input');
        folderSelector.setAttribute('type', 'file');
        //Process click event
        folderSelector.addEventListener('change', (event) => {
            importImage(event.target.files[0]);
            //let fileArray = [];
            //const files = event.target.files;
            // for (let i = 0; i < files.length; i++)
            //   fileArray.push(files[i]);
            // importImage(fileArray)
        })
        folderSelector.click();
    }
    let folderImportButton = document.getElementById('import-folder');
    folderImportButton.onclick = () => {
        let folderSelector = document.createElement('input');
        folderSelector.setAttribute('type', 'file');
        folderSelector.setAttribute('webkitdirectory', 'webkitdirectory');
        folderSelector.setAttribute('multiple', 'multiple');
        //Process click event
        folderSelector.addEventListener('change', (event) => {
            let fileArray = [];
            const files = event.target.files;
            for (let i = 0; i < files.length; i++)
                fileArray.push(files[i]);
            importImageFolder(fileArray)
        })
        folderSelector.click();
    }
});

function importImage(tempImageFile) {
    let tempImage = null;
    let processed = false;
    let valid = true;
    const validExtensions = ['jpg', 'png'];
    const validHeaders = ['data:image/png;', 'data:image/jpeg;'];
    beginLoading();
    const processImage = () => {
        let validImages = [];
        let invalidImages = [];
        //Make sure uploaded tempImages are valid
        const fileName = tempImage.name;
        let extension = fileName.substring(fileName.lastIndexOf('.') + 1);
        const base64 = tempImage.base64;
        //Check image is not already uploaded
        if (imageAlreadyUploaded(fileName)) {
            valid = false;
        }
        //If the base64 of the image is invalid skip it
        if (base64.indexOf('base64') === -1) {
            valid = false;
        }
        let header = base64.substring(0, base64.indexOf('base64'));
        //If the extension or image header is invalid skip it
        if (!validExtensions.includes(extension) || !validHeaders.includes(header)) {
            valid = false;
        } else {
            validImages.push(tempImage);
        }
        //Alert the user which files were invalid if any
        if (!valid) {
            let alertStr = 'The following file was not in a valid format or was already uploaded and will be ignored: ' + invalidImages[0];
            alert(alertStr);
            return;
        }
        //Get the width, height, and depth for each image
        loadImage(tempImage.base64, img => {
            reference = tempImage;
            reference.width = img.width;
            reference.height = img.height;
            img.loadPixels();
            let isColor = false;
            for (let i = 0; i < img.width; i++) {
                if (isColor)
                    break;
                for (let j = 0; j < img.height; j++) {
                    vals = img.get(i, j);
                    for (let k = 0; k < 4; k++) {
                        if (vals[0] !== vals[1] || vals[1] !== vals[2]) {
                            reference.depth = 3;
                            isColor = true;
                            break;
                        }
                    }
                }
            }
            if (!isColor)
                reference.depth = 1;
        });
        appendImages(validImages);
        endLoading();
        updateNavigator();
    }
    const recurseImage = (fileArray) => {
        if (processed) {
            processImage();
            return;
        }
        const reader = new FileReader();
        reader.addEventListener('load', function () {
            tempImage = {
                'base64': reader.result,
                'name': name,
                'relpath': relpath,
                'width': -1,
                'height': -1,
                'depth': -1,
                'annotations': [],
                'annotated': false
            };
            processed = true;
            recurseImage(fileArray);
        }, false);
        let currentImage = tempImageFile;
        let name = currentImage['name'];
        let relpath = currentImage.webkitRelativePath;
        reader.readAsDataURL(currentImage);
    }
    recurseImage(tempImageFile);
}

function importImageFolder(fileArray) {
    let tempImages = [];
    const validExtensions = ['jpg', 'png'];
    const validHeaders = ['data:image/png;', 'data:image/jpeg;'];
    beginLoading();
    const processImages = () => {
        let validImages = [];
        let invalidImages = [];
        //Make sure uploaded tempImages are valid
        for (let i = 0; i < tempImages.length; i++) {
            const fileName = tempImages[i].name;
            let extension = fileName.substring(fileName.lastIndexOf('.') + 1);
            const base64 = tempImages[i].base64;
            //Check image is not already uploaded
            if (imageAlreadyUploaded(fileName)) {
                invalidImages.push(fileName);
                continue;
            }
            //If the base64 of the image is invalid skip it
            if (base64.indexOf('base64') === -1) {
                invalidImages.push(fileName);
                continue;
            }
            let header = base64.substring(0, base64.indexOf('base64'));
            //If the extension or image header is invalid skip it
            if (!validExtensions.includes(extension) || !validHeaders.includes(header)) {
                invalidImages.push(fileName);
            } else {
                validImages.push(tempImages[i]);
            }
        }
        //Alert the user which files were invalid if any
        if (invalidImages.length === 1) {
            let alertStr = 'The following file was not in a valid format or was already uploaded and will be ignored: ' + invalidImages[0];
            alert(alertStr);
        } else if (invalidImages.length > 1) {
            let alertStr = 'The following files were not in a valid format or were already uploaded and will be ignored: '
            for (let i = 0; i < invalidImages.length - 1; i++) {
                alertStr += invalidImages[i] + ', ';
            }
            alertStr += invalidImages[invalidImages.length - 1];
            alert(alertStr);
        }
        //Get the width, height, and depth for each image
        for (let i = 0; i < validImages.length; i++) {
            loadImage(validImages[i].base64, img => {
                reference = validImages[i];
                validImages[i].width = img.width;
                validImages[i].height = img.height;
                img.loadPixels();
                let isColor = false;
                for (let i = 0; i < img.width; i++) {
                    if (isColor)
                        break;
                    for (let j = 0; j < img.height; j++) {
                        vals = img.get(i, j);
                        for (let k = 0; k < 4; k++) {
                            if (vals[0] !== vals[1] || vals[1] !== vals[2]) {
                                reference.depth = 3;
                                isColor = true;
                                break;
                            }
                        }
                    }
                }
                if (!isColor)
                    reference.depth = 1;
            });
        }
        appendImages(validImages);
        endLoading();
        updateNavigator();
    }
    const recurseImages = (fileArray) => {
        if (fileArray.length == 0) {
            processImages();
            return;
        }
        const reader = new FileReader();
        reader.addEventListener('load', function () {
            tempImages.push({
                'base64': reader.result,
                'name': name,
                'relpath': relpath,
                'width': -1,
                'height': -1,
                'depth': -1,
                'annotations': [],
                'annotated': false
            });
            recurseImages(fileArray);
        }, false);
        let currentImage = fileArray.pop();
        let name = currentImage['name'];
        let relpath = currentImage.webkitRelativePath;
        reader.readAsDataURL(currentImage);
    }
    recurseImages(fileArray);
}

function changeAnnotationMode(mode) {
    if(mode === 'rect') {
        setRectMode();
    }
    else if(mode === 'poly') {
        setPolyMode();
    }
}

function changeImage(direction) {
    if (direction === 'left')
        navigateLeft();
    else if (direction === 'right')
        navigateRight();
}

function beginLoading() {
    let loadingCircle = '<div class="preloader-wrapper active" id="loading-circle" style="top:10px; left:10px;">\
    <div class="spinner-layer">\
      <div class="circle-clipper left">\
        <div class="circle"></div>\
      </div><div class="gap-patch">\
        <div class="circle"></div>\
      </div><div class="circle-clipper right">\
        <div class="circle"></div>\
      </div>\
    </div>\
  </div>';
  document.getElementById('placeholder').insertAdjacentHTML('afterbegin', loadingCircle);
}

function endLoading() {
    let loadingElement = document.getElementById('loading-circle');
    if(loadingElement !== null) 
        loadingElement.parentNode.removeChild(loadingElement);

}