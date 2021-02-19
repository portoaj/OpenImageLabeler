function exportPascalVOCXML() {
    let jszip = new JSZip();
    let containsPoly = false;
    //Iterate through images and create files if they are valid
    for(let i = 0; i < images.length; i++) {
        //Only generate file if image is annotated
        if(images[i].annotated === false || images[i].annotations.length === 0)
            continue;
        //Create output string
        let output = "";
        output += '<annotation>\n';
        output += '\t<folder>' + images[i].relpath.substring(0, images[i].relpath.indexOf('/')) + '</folder>\n';
        output += '\t<filename>' + images[i].name.substring(images[i].name.indexOf('/') + 1) + '</filename>\n';
        output += '\t<source>\n';
        output += '\t\t<database>Unknown</database>\n';
        output += '\t</source>\n';
        output += '\t<size>\n';
        output += '\t\t<width>' + images[i].width + '</width>\n';
        output += '\t\t<height>' + images[i].height + '</height>\n';
        output += '\t\t<depth>'+ images[i].depth + '</depth>\n';
        output += '\t</size>\n';
        output += '\t<segmented>0</segmented>\n';
        for(let j = 0; j < images[i].annotations.length; j++)
        {
            if(images[i].annotations[j].mode === 'rect') {
                output += '\t<object>\n';
                output += '\t\t<name>' + images[i].annotations[j].label + '</name>\n';
                output += '\t\t<pose>Unspecified</pose>\n';
                output += '\t\t<truncated>0</truncated>\n';
                output += '\t\t<difficult>0</difficult>\n';
                output += '\t\t<bndbox>\n';
                output += '\t\t\t<xmin>' + images[i].annotations[j].points[0].x + '</xmin>\n';
                output += '\t\t\t<ymin>' + images[i].annotations[j].points[0].y + '</ymin>\n';
                output += '\t\t\t<xmax>' + images[i].annotations[j].points[1].x + '</xmax>\n';
                output += '\t\t\t<ymax>' + images[i].annotations[j].points[1].y + '</ymax>\n';
                output += '\t\t</bndbox>\n';
                output += '\t</object>\n';
            }
            else if(images[i].annotations[j].mode === 'poly') {
                containsPoly = true;
                let xmin = images[i].annotations[j].points[0].x;
                let xmax = images[i].annotations[j].points[0].x;
                let ymin = images[i].annotations[j].points[0].y;
                let ymax = images[i].annotations[j].points[0].y;
                for(let k = 1; k < images[i].annotations[j].points.length; k++) {
                    if(images[i].annotations[j].points[k].x < xmin)
                        xmin = images[i].annotations[j].points[k].x;
                    else if(images[i].annotations[j].points[k].x > xmax)
                        xmax = images[i].annotations[j].points[k].x;
                    if(images[i].annotations[j].points[k].y < ymin)
                        ymin = images[i].annotations[j].points[k].y;
                    else if(images[i].annotations[j].points[k].y > ymax)
                        ymax = images[i].annotations[j].points[k].y;
                }
                output += '\t<object>\n';
                output += '\t\t<name>' + images[i].annotations[j].label + '</name>\n';
                output += '\t\t<pose>Unspecified</pose>\n';
                output += '\t\t<truncated>0</truncated>\n';
                output += '\t\t<difficult>0</difficult>\n';
                output += '\t\t<bndbox>\n';
                output += '\t\t\t<xmin>' + xmin.toString() + '</xmin>\n';
                output += '\t\t\t<ymin>' + ymin.toString() + '</ymin>\n';
                output += '\t\t\t<xmax>' + xmax.toString() + '</xmax>\n';
                output += '\t\t\t<ymax>' + ymax.toString() + '</ymax>\n';
                output += '\t\t</bndbox>\n';
                output += '\t</object>\n';
            }
        }
        output += '</annotation>';
        //Add file with output string to jszip
        jszip.file(images[i].name.substring(0, images[i].name.indexOf('.')) + '.xml', output);
    }
    if(containsPoly === true) {
        M.toast({html: 'Polygon annotations approximated to bounding boxes because of output format'});
    }
    jszip.generateAsync({
        type: "blob"
    }).then((blob) => {
        saveAs(blob, "annotations.zip");
    }, (err) => {
        console.log('Download error: ' + err);
        //TODO create notification if error
    });
}

function exportAWSObjectDetection() {
    let jszip = new JSZip();
    let containsPoly = false;
    //Iterate through images and create files if they are valid
    for(let i = 0; i < images.length; i++) {
        //Only generate file if image is annotated
        if(images[i].annotated === false || images[i].annotations.length === 0)
            continue;
        //Create output string
        let output = {
            "file": images[i].name.substring(images[i].name.indexOf('/') + 1),
            "image_size": [{
                "width": images[i].width,
                "height": images[i].height,
                "depth": images[i].depth
            }],
        }
        let annotationsObj = [];
        for(let j = 0; j < images[i].annotations.length; j++)
        {
            let annotationObj = {};
            annotationObj['class_id'] = getChipIndexNoDefault(images[i].annotations[j].label);
            if(images[i].annotations[j].mode === 'rect') {
                annotationObj['left'] = Math.round(images[i].annotations[j].points[0].x);
                annotationObj['top'] = Math.round(images[i].annotations[j].points[0].y);
                annotationObj['width'] = Math.round(images[i].annotations[j].points[1].x - images[i].annotations[j].points[0].x);
                annotationObj['height'] = Math.round(images[i].annotations[j].points[1].y - images[i].annotations[j].points[0].y);
            }
            else if(images[i].annotations[j].mode === 'poly') {
                containsPoly = true;
                let xmin = images[i].annotations[j].points[0].x;
                let xmax = images[i].annotations[j].points[0].x;
                let ymin = images[i].annotations[j].points[0].y;
                let ymax = images[i].annotations[j].points[0].y;
                for(let k = 1; k < images[i].annotations[j].points.length; k++) {
                    if(images[i].annotations[j].points[k].x < xmin)
                        xmin = images[i].annotations[j].points[k].x;
                    else if(images[i].annotations[j].points[k].x > xmax)
                        xmax = images[i].annotations[j].points[k].x;
                    if(images[i].annotations[j].points[k].y < ymin)
                        ymin = images[i].annotations[j].points[k].y;
                    else if(images[i].annotations[j].points[k].y > ymax)
                        ymax = images[i].annotations[j].points[k].y;
                }
                annotationObj['left'] = Math.round(xmin);
                annotationObj['top'] = Math.round(ymin);
                annotationObj['width'] = Math.round(xmax - xmin);
                annotationObj['height'] = Math.round(ymax - ymin);
            }
            annotationsObj.push(annotationObj);
        }
        output['annotations'] = annotationsObj;
        let categoriesObj = [];
        let chipTags = getChipTags();
        if(chipTags.indexOf('default') !== -1)
            chipTags.splice(chipTags.indexOf('default'), 1);
        for(let j = 0; j < chipTags.length; j++) {
            let categoryObj = {}
            categoryObj['class_id'] = j;
            categoryObj['name'] = chipTags[j];
            categoriesObj.push(categoryObj);
        }
        output['categories'] = categoriesObj;
        //Add file with output string to jszip
        jszip.file(images[i].name.substring(0, images[i].name.indexOf('.')) + '.json', JSON.stringify(output));
    }
    if(containsPoly === true) {
        M.toast({html: 'Polygon annotations approximated to bounding boxes because of output format'});
    }
    jszip.generateAsync({
        type: "blob"
    }).then((blob) => {
        saveAs(blob, "annotations.zip");
    }, (err) => {
        console.log('Download error: ' + err);
        //TODO create notification if error
    });
}