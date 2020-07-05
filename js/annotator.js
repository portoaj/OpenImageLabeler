let mode = null;
let images = null;
/*Image Object structure
{
    'base64': base64,
    'name': name,
    'relpath': relpath,
    'height': -1,
    'width': -1,
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