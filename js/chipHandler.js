let chipsInstance = null;
let label = 'nolabel';

//Sets chip instance as DOM initializes
function setChipsInstance(instance) {
    chipsInstance = instance;
}

//Handles chip selection and background highlighting
function chipSelected(chipObj) {
    label = chipObj.textContent.slice(0, chipObj.textContent.length - 5);
    let chipObjs = chipsInstance['$chips'];
    for (let i = 0; i < chipObjs.length; i++) {
        chipObjs[i].style.backgroundColor = '#e4e4e4';
    }
    chipObj.style.backgroundColor = '#4fc3f7';
}

//Makes sure annotations only occur when label is valid
function canAnnotate() {
    return label !== null;
}

//Listener for when chips are added, selects that chip if it is the only one
function chipAdded(chipObj, singleChip) {
    if (singleChip) {
        label = chipObj.textContent.slice(0, chipObj.textContent.length - 5);
        if (chipsInstance === null)
            trySelectChip(0);
        else {
            chipsInstance.selectChip(0);
        }
    }
}

//Selects a chip if chipsInstance has loaded, otherwise it tries again after a delay
function trySelectChip(index) {
    if (chipsInstance !== null) {
        chipsInstance.selectChip(index)
    } else {
        setTimeout(trySelectChip, 30, index);
    }
}

//Listener for when chips are deleted, sets label apprpriately
function chipDeleted(singleChip, noChips) {
    if (singleChip) {
        label = chipsInstance['chipsData'][0]['tag'];
        if (chipsInstance === null)
            trySelectChip(0);
        else {
            chipsInstance.selectChip(0);
        }
    } else if (noChips) {
        label = null;
    } else {
        let labeledChipExists = false;
        const chipsData = chipsInstance['chipsData'];
        for (let i = 0; i < chipsData.length; i++) {
            if (chipsData[i]['tag'] === label) {
                labeledChipExists = true;
                break;
            }
        }
        if (!labeledChipExists) {
            if (chipsInstance === null)
                trySelectChip(0);
            else {
                chipsInstance.selectChip(0);
            }
        }
    }
}
//Return label
function getLabel() {
    return label;
}