let mode = null;
let images = [];
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
*/

let selectedAnnotation = null;
let selectedLabel = null;

function setup() {
    //Create a p5.js canvas in place of the placeholder object
    let placeholder = select('#placeholder');
    let canvas = createCanvas(placeholder.size()['width'], placeholder.size()['height']);
    canvas.parent(placeholder);
    fill(240, 98, 146);
    noStroke();
    rect(0, 0, width, height);
    $(window).resize(() => {
        resizeCanvas(placeholder.size()['width'], placeholder.size()['height'])
    });
}

function appendImages(_images) {
    images = images.concat(_images);
}

function getImages() {
    return images;
}

function imageAlreadyUploaded(imageName) {
    for(let i = 0; i < images.length; i++) {
        if(imageName ===images[i].name)
            return true;
    }
    return false;
}