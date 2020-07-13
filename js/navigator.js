let index = 1;

function updateNavigator() {
    document.getElementById('navigator-text').textContent = index + ' / ' + getImages().length;
    if(getImages().length > 0)
        tryUpdateImage();
}

function navigateLeft() {
    index -= 1;
    if (index < 1) {
        index = getImages().length;
    }
    updateNavigator();
}

function navigateRight() {
    index += 1;
    if (index > getImages().length) {
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