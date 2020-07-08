let mode = null;
let images = [];
let drawingBox = false;
let drawingBoxStart = null;
let polyPoints = [];
let currentImage = null;
let currentImagep5 = null;
/*Image Object structure
{
    'base64': base64,
    'name': name,
    'relpath': relpath,
    'width': -1,
    'height': -1,
    'depth': -1,
    'annotations': [],
    'annotated': false
}
*/
/*Annotation Object structure
{
    'label': label,
    'points': [...],
    'mode': mode
}
Rect mode has one point at top-left and one point and bottom-right
*/

let selectedAnnotation = null;
let selectedLabel = null;

function setup() {
    //Create a p5.js canvas in place of the placeholder object
    let placeholder = select('#placeholder');
    let canvas = createCanvas(placeholder.size()['width'], placeholder.size()['height']);
    canvas.parent(placeholder);
    $(window).resize(() => {
        resizeCanvas(placeholder.size()['width'], placeholder.size()['height'])
    });
}

function draw() {
    if (!currentImagep5)
        return;
    image(currentImagep5, 0, 0, width, height);

    if (drawingBox) {
        console.log('drawbox');
        stroke(255, 207, 61, 150);
        fill(255, 207, 61, 75);
        let drawingBoxStartCanvas = imagePositionToCanvasPosition(drawingBoxStart);
        let xmin = min(drawingBoxStartCanvas.x, constrainedMousePosition().x);
        let xmax = max(drawingBoxStartCanvas.x, constrainedMousePosition().x);
        let ymin = min(drawingBoxStartCanvas.y, constrainedMousePosition().y);
        let ymax = max(drawingBoxStartCanvas.y, constrainedMousePosition().y);
        console.log(xmin, ymin, xmax, ymax);
        rect(xmin, ymin, xmax - xmin, ymax - ymin);
    }
    for (let i = 0; i < currentImage.annotations.length; i++) {
        if (currentImage.annotations[i] != selectedAnnotation) {
            stroke(35, 232, 45, 200);
            fill(35, 232, 45, 100);
            let annotation = currentImage.annotations[i];
            let minRect = imagePositionToCanvasPosition(annotation.points[0]);
            let maxRect = imagePositionToCanvasPosition(annotation.points[1]);
            rect(minRect.x, minRect.y, maxRect.x - minRect.x, maxRect.y - minRect.y);
        }
    }
}

function mousePressed() {
    //Ignore mouse click if mouse out of canvas
    if (mouseX > width || mouseX < 0 || mouseY > height || mouseY < 0)
        return;
    //Ignore mouse click if no image is loaded
    if (!currentImage)
        return;
    if (mode === 'rect') {
        if (drawingBox === false) {
            drawingBox = true;
            drawingBoxStart = canvasPositionToImagePosition(constrainedMousePosition());
        }
    }
}

function mouseReleased() {
    if (drawingBox) {
        let xmin = min(drawingBoxStart.x, constrainedMouseImagePosition().x);
        let xmax = max(drawingBoxStart.x, constrainedMouseImagePosition().x);
        let ymin = min(drawingBoxStart.y, constrainedMouseImagePosition().y);
        let ymax = max(drawingBoxStart.y, constrainedMouseImagePosition().y);
        let annotation = {
            'label': 'defaultrectlabelshouldchange',
            'points': [createVector(xmin, ymin), createVector(xmax, ymax)],
            'mode': mode
        };
        currentImage.annotated = true;
        currentImage.annotations.push(annotation);
        drawingBox = false;
        drawingBoxStart = null;
    }
}

function constrainedMousePosition() {
    return createVector(constrain(mouseX, 0, width), constrain(mouseY, 0, height));
}

function constrainedMouseImagePosition() {
    return canvasPositionToImagePosition(constrainedMousePosition());
}
//Convert from canvas coordinates to image pixel coordinates
function canvasPositionToImagePosition(positionVector) {
    let scaleRatios = createVector(currentImage.width / width, currentImage.height / height);
    return createVector(constrain(positionVector.x * scaleRatios.x, 0, currentImage.width), constrain(positionVector.y * scaleRatios.y, 0, currentImage.height));
}

//Convert from image pixel coordinates to canvas coordinates
function imagePositionToCanvasPosition(canvasVector) {
    let scaleRatios = createVector(width / currentImage.width, height / currentImage.height);
    return createVector(constrain(canvasVector.x * scaleRatios.x, 0, currentImage.width), constrain(canvasVector.y * scaleRatios.y, 0, currentImage.height));
}

function appendImages(_images) {
    images = images.concat(_images);
}

function getImages() {
    return images;
}

function setRectMode() {
    mode = 'rect';
}

function updateImage() {
    currentImage = images[getIndex() - 1];
    currentImagep5 = loadImage(currentImage.base64);
}

function setPolyMode() {
    mode = 'poly';
    //TODO make this work: https://stackoverflow.com/questions/217578/how-can-i-determine-whether-a-2d-point-is-within-a-polygon#:~:text=Look%20at%20the%20polygon%20as,it%20is%20inside%20the%20polygon.
    console.log('set poly');
}

function imageAlreadyUploaded(imageName) {
    for (let i = 0; i < images.length; i++)
        if (imageName === images[i].name)
            return true;
    return false;
}