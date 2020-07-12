let mode = null;
let images = [];
let drawingBox = false;
let drawingBoxStart = null;
let drawingPoly = false;
let polyPoints = [];
let currentImage = null;
let currentImagep5 = null;
let selectedAnnotation = null;
let selectedPolyPoint = null;
let selectedLabel = null;
const polyPointRadius = 4; //Radius in px
const minShapeDimension = 5; //Minimum dimension in px for annotations
/*
Image Object structure
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
Annotation Object structure
{
    'label': label,
    'points': [...],
    'mode': mode
}
Rect mode has one point at top-left and one point and bottom-right
*/

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
    //Draw partially drawn shapes
    if (drawingBox) {
        stroke(255, 207, 61, 150);
        fill(255, 207, 61, 75);
        let drawingBoxStartCanvas = imagePositionToCanvasPosition(drawingBoxStart);
        let xmin = min(drawingBoxStartCanvas.x, constrainedMousePosition().x);
        let xmax = max(drawingBoxStartCanvas.x, constrainedMousePosition().x);
        let ymin = min(drawingBoxStartCanvas.y, constrainedMousePosition().y);
        let ymax = max(drawingBoxStartCanvas.y, constrainedMousePosition().y);
        rect(xmin, ymin, xmax - xmin, ymax - ymin);
    } else if (drawingPoly && polyPoints.length > 0) {
        //Draw the outline and fill of the polygon
        stroke(255, 207, 61, 150);
        fill(255, 207, 61, 75);
        beginShape();
        for (let i = 0; i < polyPoints.length; i++) {
            const canvasPosition = imagePositionToCanvasPosition(polyPoints[i]);
            vertex(canvasPosition.x, canvasPosition.y);
        }
        endShape(CLOSE);
        //Draw all but the first point as gray
        stroke(10, 10, 8, 255);
        fill(250, 255, 176, 200);
        for (let i = 1; i < polyPoints.length; i++) {
            const canvasPosition = imagePositionToCanvasPosition(polyPoints[i]);
            ellipse(canvasPosition.x, canvasPosition.y, polyPointRadius);
        }
        //Draw the first point as yellow
        stroke(255, 207, 61, 200);
        fill(255, 207, 61, 135);
        const canvasPosition = imagePositionToCanvasPosition(polyPoints[0]);
        ellipse(canvasPosition.x, canvasPosition.y, polyPointRadius);
    }
    //Draw annotations except selected annotation
    for (let i = 0; i < currentImage.annotations.length; i++) {
        if (currentImage.annotations[i] != selectedAnnotation) {
            stroke(15, 212, 25, 200);
            fill(35, 232, 45, 100);
            let annotation = currentImage.annotations[i];
            if (currentImage.annotations[i].mode === 'rect') {
                let minRect = imagePositionToCanvasPosition(annotation.points[0]);
                let maxRect = imagePositionToCanvasPosition(annotation.points[1]);
                rect(minRect.x, minRect.y, maxRect.x - minRect.x, maxRect.y - minRect.y);
            } else if (currentImage.annotations[i].mode === 'poly') {
                beginShape();
                for (let j = 0; j < currentImage.annotations[i].points.length; j++) {
                    const canvasPosition = imagePositionToCanvasPosition(currentImage.annotations[i].points[j]);
                    vertex(canvasPosition.x, canvasPosition.y);
                }
                endShape(CLOSE);
            }
        }
    }
    //Draw selected annotation if there is one
    if (selectedAnnotation) {
        stroke(79, 195, 247, 200);
        fill(79, 195, 247, 100);
        if (selectedAnnotation.mode === 'rect') {
            let minRect = imagePositionToCanvasPosition(selectedAnnotation.points[0]);
            let maxRect = imagePositionToCanvasPosition(selectedAnnotation.points[1]);
            rect(minRect.x, minRect.y, maxRect.x - minRect.x, maxRect.y - minRect.y);
        } else if (selectedAnnotation.mode === 'poly') {
            beginShape();
            for (let i = 0; i < selectedAnnotation.points.length; i++) {
                const canvasPosition = imagePositionToCanvasPosition(selectedAnnotation.points[i]);
                vertex(canvasPosition.x, canvasPosition.y);
            }
            endShape(CLOSE);
        }
    }
}

function mousePressed() {
    //Ignore mouse click if mouse out of canvas
    if (mouseX > width || mouseX < 0 || mouseY > height || mouseY < 0) {
        selectedAnnotation = null;
        drawingPoly = false;
        polyPoints = [];
        return;
    }
    //Ignore mouse click if no image is loaded
    if (!currentImage)
        return;
    //Don't create annotation if trying to select one
    if (trySelect()) {
        drawingPoly = false;
        polyPoints = [];
        return;
    } else
        selectedAnnotation = null;


    //Start drawing rect if applicable
    if (mode === 'rect') {
        //Must have label selected
        //TODO alert user if this causes issue
        if (!canAnnotate) {
            return;
        }

        if (drawingBox === false) {
            drawingBox = true;
            drawingBoxStart = canvasPositionToImagePosition(constrainedMousePosition());
        }
    }
    //Start drawing poly if applicable or end
    else if (mode === 'poly') {
        //Check if this is user is creating poly
        if (drawingPoly === false) {
            drawingPoly = true;
            polyPoints.push(constrainedMouseImagePosition());
        }
        //Check if user is finalizing poly
        else if (dist(constrainedMousePosition().x, constrainedMousePosition().y, imagePositionToCanvasPosition(polyPoints[0]).x, imagePositionToCanvasPosition(polyPoints[0]).y) < 20) {
            let xmin = polyPoints[0].x;
            let xmax = polyPoints[0].x;
            let ymin = polyPoints[0].y;
            let ymax = polyPoints[0].y;
            for (let i = 1; i < polyPoints.length; i++) {
                if (polyPoints[i].x < xmin)
                    xmin = polyPoints[i].x;
                else if (polyPoints[i].x > xmax)
                    xmax = polyPoints[i].x;
                if (polyPoints[i].y < ymin)
                    ymin = polyPoints[i].y;
                else if (polyPoints[i].y > ymax)
                    ymax = polyPoints[i].y;
            }
            if (!(xmax - xmin < minShapeDimension || ymax - ymin < minShapeDimension)) {
                let annotation = {
                    'label': getLabel(),
                    'points': polyPoints,
                    'mode': mode
                };
                currentImage.annotations.push(annotation);
            }
            drawingPoly = false;
            polyPoints = [];
        }
        //Add next point to poly
        else {
            polyPoints.push(constrainedMouseImagePosition());
        }

    }
}

function mouseReleased() {
    if (drawingBox) {
        //Only create box annotation if there is a valid label
        if (!canAnnotate()) {
            drawingBox = false;
            drawingBoxStart = null;
            return;
        }
        let xmin = min(drawingBoxStart.x, constrainedMouseImagePosition().x);
        let xmax = max(drawingBoxStart.x, constrainedMouseImagePosition().x);

        let ymin = min(drawingBoxStart.y, constrainedMouseImagePosition().y);
        let ymax = max(drawingBoxStart.y, constrainedMouseImagePosition().y);
        if (xmax - xmin > 16 && ymax - ymin > 16) {
            let annotation = {
                'label': getLabel(),
                'points': [createVector(xmin, ymin), createVector(xmax, ymax)],
                'mode': mode
            };
            currentImage.annotated = true;
            currentImage.annotations.push(annotation);
        }
        drawingBox = false;
        drawingBoxStart = null;
    }
}

function keyPressed() {
    //TODO remove debug print below
    if (keyCode === 72 && currentImage) {
        console.log(currentImage.annotations);
    }
    if ((keyCode === 8 || keyCode === 46) && selectedAnnotation !== null) {
        let selectedAnnotationIndex = 0;
        for (let i = 0; i < currentImage.annotations.length; i++) {
            if (currentImage.annotations[i] === selectedAnnotation)
                selectedAnnotationIndex = i;
        }
        currentImage.annotations.splice(selectedAnnotationIndex, 1);
        selectedAnnotation = null;
    }
}

function trySelect() {
    for (let i = 0; i < currentImage.annotations.length; i++) {
        if (currentImage.annotations[i].mode === 'rect') {
            let minRect = imagePositionToCanvasPosition(currentImage.annotations[i].points[0]);
            let maxRect = imagePositionToCanvasPosition(currentImage.annotations[i].points[1]);
            const xmin = minRect.x;
            const ymin = minRect.y;
            const xmax = maxRect.x;
            const ymax = maxRect.y;
            const mousePosition = constrainedMousePosition();
            if (mousePosition.x > xmin && mousePosition.x < xmax && mousePosition.y > ymin && mousePosition.y < ymax) {
                selectedAnnotation = currentImage.annotations[i];
                return true;
            }
        } else if (currentImage.annotations[i].mode === 'poly') {
            let canvasPoints = [];
            for (let j = 0; j < currentImage.annotations[i].points.length; j++) {
                canvasPoints.push(imagePositionToCanvasPosition(currentImage.annotations[i].points[j]));
            }
            if (pointIsInPoly(constrainedMousePosition(), canvasPoints)) {
                selectedAnnotation = currentImage.annotations[i];
                return true;
            }
        }
    }
    //TODO make this work: https://stackoverflow.com/questions/217578/how-can-i-determine-whether-a-2d-point-is-within-a-polygon#:~:text=Look%20at%20the%20polygon%20as,it%20is%20inside%20the%20polygon.
    return false;
}

//Returns if point is inside polygon thanks to SO answer here: https://stackoverflow.com/questions/217578/
function pointIsInPoly(p, polygon) {
    var isInside = false;
    var minX = polygon[0].x,
        maxX = polygon[0].x;
    var minY = polygon[0].y,
        maxY = polygon[0].y;
    for (var n = 1; n < polygon.length; n++) {
        var q = polygon[n];
        minX = Math.min(q.x, minX);
        maxX = Math.max(q.x, maxX);
        minY = Math.min(q.y, minY);
        maxY = Math.max(q.y, maxY);
    }

    if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) {
        return false;
    }

    var i = 0,
        j = polygon.length - 1;
    for (i, j; i < polygon.length; j = i++) {
        if ((polygon[i].y > p.y) != (polygon[j].y > p.y) &&
            p.x < (polygon[j].x - polygon[i].x) * (p.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x) {
            isInside = !isInside;
        }
    }

    return isInside;
}
//Get mouse position constrained by canvas bounds
function constrainedMousePosition() {
    return createVector(constrain(mouseX, 0, width), constrain(mouseY, 0, height));
}

//Get mouse position constrained by canvas bounds image pixel coordinates
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

//Return whether or not mouse is outside of canvas
function mouseOutOfBounds() {
    return mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height;
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
}

function imageAlreadyUploaded(imageName) {
    for (let i = 0; i < images.length; i++)
        if (imageName === images[i].name)
            return true;
    return false;
}