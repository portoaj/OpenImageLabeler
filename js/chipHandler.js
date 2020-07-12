let chipsInstance = null;
let label = 'nolabel';
let annotationModeLabel = 'nolabel';
let annotationMode = false;
let lastPickedChip = null;

//Sets chip instance as DOM initializes
function setChipsInstance(instance) {
    chipsInstance = instance;
}

//Handles chip selection and background highlighting
function chipSelected(input) {
    //Return to avoid error from dummy call
    if (input[0]['M_Chips']['_selectedChip'] === null)
        return;
    let chipObj = input[0]['M_Chips']['_selectedChip'][0];
    if(annotationMode === true)
        selectedAnnotation.label = chipObj.textContent.slice(0, chipObj.textContent.length - 5);
    else
        label = chipObj.textContent.slice(0, chipObj.textContent.length - 5);
    recolorLabels();
}

//Makes sure annotations only occur when label is valid
function canAnnotate() {
    return label !== null;
}

//Listener for when chips are added, selects that chip if it is the only one
function chipAdded(chipObj, singleChip) {
    if (singleChip) {
        label = chipObj.textContent.slice(0, chipObj.textContent.length - 5);
        trySelectChip(0, 0);
    }
}

//Selects a chip if chipsInstance has loaded, otherwise it tries again after a delay
function trySelectChip(index, attempt) {
    if (attempt > 50) {
        console.log('trySelectChip failed for index: ' + index.toString());
        return;
    }
    if (chipsInstance !== null && chipsInstance['chipsData'].length !== 0) {
        chipsInstance.selectChip(index);
    } else {
        setTimeout(trySelectChip, 30, index, attempt + 1);
    }
}

//Listener for when chips are deleted, sets label apprpriately
function chipDeleted(singleChip, noChips) {
    if (singleChip) {
        label = chipsInstance['chipsData'][0]['tag'];
        trySelectChip(0, 0);

    } else if (noChips) {
        label = null;
    }
    //More than one chip so make sure one is selected
    else {
        if (!hasChip(getLabel())) {
            trySelectChip(0, 0);
        }
    }
}

//Load chips for specific annotation
function startAnnotationMode(annotation) {
    annotationMode = true;
    lastPickedChip = getLabel();
    if (!hasChip(annotation.label)) {
        console.log(chipsInstance);
        chipsInstance.addChip({
            tag: annotation.label
        });
    }
    const chipObjs = chipsInstance['$chips'];
    for (let i = 0; i < chipObjs.length; i++) {
        if (chipObjs[i].textContent.slice(0, chipObjs[i].textContent.length - 5) === annotation.label) {
            chipObjs[i].style.backgroundColor = '#ffb300';
        } else
            chipObjs[i].style.backgroundColor = '#e4e4e4';
    }
}

//Reset chips to normal state
function exitAnnotationMode() {
    annotationMode = false;
    if (lastPickedChip) {
        if (!hasChip(lastPickedChip)) {
            chipsInstance.addChip({
                tag: lastPickedChip
            });
        }
        trySelectChip(getChipIndex(lastPickedChip), 0);
    }
    recolorLabels();
}

//Return label
function getLabel() {
    return label;
}

//Returns whether or not that chip is currently loaded
function hasChip(chipTag) {
    const chipsData = chipsInstance['chipsData'];
    for (let i = 0; i < chipsData.length; i++)
        if (chipsData[i]['tag'] === chipTag)
            return true;
    return false;
}

//Gets the index in chips of the chip with the given tag
function getChipIndex(chipTag) {
    const chipsData = chipsInstance['chipsData'];
    for (let i = 0; i < chipsData.length; i++)
        if (chipsData[i]['tag'] === chipTag)
            return i;
    return -1;

}

//Recolors labels
function recolorLabels() {
    //If in annotation mode just change the annotations label
    if (annotationMode === true) {
        const chipObjs = chipsInstance['$chips'];
        for (let i = 0; i < chipObjs.length; i++) {
            if (chipObjs[i].textContent.slice(0, chipObjs[i].textContent.length - 5) === selectedAnnotation.label) {
                chipObjs[i].style.backgroundColor = '#ffb300';
            } else
                chipObjs[i].style.backgroundColor = '#e4e4e4';
        }
    } else {
        let chipObjs = chipsInstance['$chips'];
        for (let i = 0; i < chipObjs.length; i++) {
            if (chipObjs[i].textContent.slice(0, chipObjs[i].textContent.length - 5) === getLabel()) {
                chipObjs[i].style.backgroundColor = '#4fc3f7';
            } else
                chipObjs[i].style.backgroundColor = '#e4e4e4';
        }
    }
}