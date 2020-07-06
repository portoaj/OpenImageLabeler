let index = 1;

function updateNavigator() {
    document.getElementById('navigator-text').textContent = index + ' / ' + getImages().length;
    updateImage();
}

function navigateLeft() {
    console.log('left');
    index -= 1;
    if (index < 1) {
        index = getImages().length;
    }
    updateNavigator();
}

function navigateRight() {
    console.log('right');
    index += 1;
    if (index >= getImages().length) {
        if (getImages().length > 0) {
            index = 1;
        } else {
            index = 0;
        }
    }
    updateNavigator();
}

function getIndex() {
    return index;
}