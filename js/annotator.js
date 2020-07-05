function setup() {
    //Create a p5.js canvas in place of the placeholder object
    let placeholder = select('#placeholder');
    let canvas = createCanvas(placeholder.size()['width'], placeholder.size()['height']);
    canvas.parent(placeholder);
    fill(240, 98, 146);
    noStroke();
    rect(0, 0, width, height);
}