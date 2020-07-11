let chipsInstance = null;
let label = 'nolabel';

function setChipsInstance(instance) {
    chipsInstance = instance;
}

function chipSelected(chipObj) {
    label = chipObj.textContent.slice(0, chipObj.textContent.length - 5);
    let chipObjs = chipsInstance['$chips'];
    for (let i = 0; i < chipObjs.length; i++) {
        chipObjs[i].style.backgroundColor = '#e4e4e4';
    }
    chipObj.style.backgroundColor = '#4fc3f7';
    console.log(label);
}

function chipAdded(chipObj, singleChip) {
    if (singleChip) {
        label = chipObj.textContent.slice(0, chipObj.textContent.length - 5);
        if (chipsInstance === null)
            trySelectChip(0);
        else {
            chipsInstance.selectChip(0);
            console.log(label)
        }
    }
}

function trySelectChip(index) {
    if (chipsInstance !== null) {
        chipsInstance.selectChip(index)
        console.log(label)
    } else {
        setTimeout(trySelectChip, 30, index);
    }
}

function chipDeleted(singleChip, noChips) {
    if (singleChip) {
        label = chipsInstance['chipsData'][0]['tag'];
        if (chipsInstance === null)
            trySelectChip(0);
        else {
            chipsInstance.selectChip(0);
            console.log(label)
        }
    } else if (noChips) {
        label = null;
        console.log(label);
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
                console.log(label)
            }
        }
    }
}

function getLabel() {
    return label;
}