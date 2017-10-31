var values = {
    paths: 50,
    minPoints: 5,
    maxPoints: 15,
    minRadius: 30,
    maxRadius: 90
};

var hitOptions = {
    segments: true,
    stroke: true,
    fill: true,
    tolerance: 5
};

var segment, path;
var movePath = false;

var isConstructing = true;
var point1;
var point2;
var tempPath;
var moveClicked = false;

function mouseup(event, currentBtn){
    switch(currentBtn){
        case 'move':
            moveClicked = false;
            break;
        default:
            console.log("default switch mouseup");
    }
}

function mousedown(event, currentBtn){
    switch(currentBtn) {
    case 'move':
        selectMovingObject(event)
        break;
    case 'selection':
        testHitOnProject(event);
        break;
    case 'point':
        createPoint(event.point);
        break;
    case 'segment':
        if(isConstructing){
            // cria o ponto e começa a rastrear o movimento
            initConstruction(event.point);
            isConstructing = false;
        } else {
            createSegment({pointA: point1.position, pointB: point2.position});
            point1.remove();
            point2.remove();
            tempPath.remove();
            point1 = point2 = null;
            tempPath = null;
            isConstructing = true;
        }
        break;
    case 'circunference':
        if(isConstructing){
            initConstruction(event.point);
            isConstructing = false;
        }else{
            createCircunference({pointA: point1.position, pointB: point2.position, radius: distanceBetween2points(point1.position, point2.position)})
            point1.remove();
            point2.remove();
            tempPath.remove();
            point1 = point2 = null;
            tempPath = null;
            isConstructing = true;
        }
        break;
    case 'line':
        if(isConstructing){
            initConstruction(event.point);
            isConstructing = false;
        }else{
            createLine({pointA: point1.position, pointB: point2.position});
            point1.remove();
            point2.remove();
            tempPath.remove();
            point1 = point2 = null;
            tempPath = null;
            isConstructing = true;
        }
        break;
        case 'ray':
        if(isConstructing){
            initConstruction(event.point);
            isConstructing = false;
        }else{
            createRay({pointA: point1.position, pointB: point2.position});
            point1.remove();
            point2.remove();
            tempPath.remove();
            point1 = point2 = null;
            tempPath = null;
            isConstructing = true;
        }
        break;
    default:
        console.log("default switch mousedown");
    }
}

var movingObject = null;

function moveObject(event){
    if (movingObject == null){
        return;
    } else {
        if(movingObject.toString == "EURegularPoint"){
            movingObject.position = event.point;
        } else if (movingObject.toString.indexOf("Segment") != -1 ){
            movingObject.position = event.point;
            if(movingObject.toString == 'EUSegmentPointA'){
                movingObject.relatedObjects[1].segments[0].point = event.point;
            }else{
                movingObject.relatedObjects[1].segments[1].point = event.point;
            }
        } else if (movingObject.toString.indexOf("Circunference") != -1){
            if(movingObject.toString == "EUCircunferenceCenterPoint"){
                movingObject.position = event.point;
                var circleStroke = movingObject.relatedObjects[1];
                var scaleFactor = distanceBetween2points(movingObject.position, movingObject.relatedObjects[0].position) / (circleStroke.bounds.width/2);
                circleStroke.scale(scaleFactor);
                circleStroke.position = event.point;
            }else{
                movingObject.position = event.point;
                var circleStroke = movingObject.relatedObjects[1];
                var scaleFactor = distanceBetween2points(movingObject.position, movingObject.relatedObjects[0].position) / (circleStroke.bounds.width/2);
                circleStroke.scale(scaleFactor);
            }
        } else if(movingObject.toString.indexOf("Line") != -1){
            movingObject.position = event.point;
            var lineStroke = movingObject.relatedObjects[1];
            var coeficienteAngular = coef(movingObject.relatedObjects[0].position, event.point);
            var lineY0 = getLineY(event.point, 0, coeficienteAngular);
            var lineYwidth = getLineY(event.point, $("#canvas").width(), coeficienteAngular);
            lineStroke.segments[0].point = new paper.Point(0,lineY0);
            lineStroke.segments[1].point = new paper.Point($("#canvas").width(), lineYwidth);
        } else if(movingObject.toString.indexOf("Ray") != -1){
            movingObject.position = event.point;
            var lineStroke = movingObject.relatedObjects[1];
            var coeficienteAngular = coef(movingObject.relatedObjects[0].position, movingObject.position);
            var lineYwidth;

            if(coeficienteAngular != Number.POSITIVE_INFINITY && coeficienteAngular != Number.NEGATIVE_INFINITY){
                if(movingObject.toString == "EURayPointB"){
                    if(movingObject.position.x <= movingObject.relatedObjects[0].position.x){
                        lineYwidth = getLineY(movingObject.position, 0, coeficienteAngular);
                        lineStroke.segments[1].point = new paper.Point(0, lineYwidth);
                    } else{
                        lineYwidth = getLineY(movingObject.position, $("#canvas").width(), coeficienteAngular);
                        lineStroke.segments[1].point = new paper.Point($("#canvas").width(), lineYwidth);
                    }    
                } else {
                    lineStroke.segments[0].point = event.point;
                    if(movingObject.position.x >= movingObject.relatedObjects[0].position.x){
                        lineYwidth = getLineY(movingObject.position, 0, coeficienteAngular);
                        lineStroke.segments[1].point = new paper.Point(0, lineYwidth);
                    } else{
                        lineYwidth = getLineY(movingObject.position, $("#canvas").width(), coeficienteAngular);
                        lineStroke.segments[1].point = new paper.Point($("#canvas").width(), lineYwidth);
                    }   
                }
            } else {
                if(coeficienteAngular == Number.POSITIVE_INFINITY){
                    if(movingObject.toString == "EURayPointB"){
                        lineStroke.segments[1].point = new paper.Point(event.point.x,0);
                    }else{
                        lineStroke.segments[1].point = new paper.Point(event.point.x, $("#canvas").height());
                    }    
                } else{
                    if(movingObject.toString == "EURayPointB"){
                        lineStroke.segments[1].point = new paper.Point(event.point.x,$("#canvas").height());
                    }else{
                        lineStroke.segments[1].point = new paper.Point(event.point.x, 0);
                    }    
                }
            }
            lineStroke.sendToBack();
        }
    }   
}

function selectMovingObject(event){
    segmentHitResult = pathHitResult = null;
    var hitResult = project.hitTest(event.point, hitOptions);
    if (hitResult == null){
        return;
    } else {
        if(hitResult.item.toString.indexOf("oint") != -1 && hitResult.item.toString != 'EUIntersectionPoint'){
            movingObject = hitResult.item;
            moveClicked = true;
        }
    }   
}

function mouseCursor(event){
    segmentHitResult = pathHitResult = null;
    var hitResult = project.hitTest(event.point, hitOptions);
    if (hitResult == null){
        $('#canvas').css('cursor','default');
        return;
    } else {
        if(hitResult.item.toString.indexOf("oint") != -1 && hitResult.item.toString != 'EUIntersectionPoint'){
            $('#canvas').css('cursor','pointer');
        } else {
            $('#canvas').css('cursor','default');
        }
    }   
}

function mousemove(event){
    if(!window.mobileAndTabletcheck()){
        moveOrDrag(event);
    }
}

function mousedrag(event){
    moveOrDrag(event);
}

function initConstruction(point){
    point1 = new paper.Path.Circle({
                            center: new paper.Point(point.x, point.y),
                            radius: 4,
                            strokeColor: 'black',
                            fillColor: 'blue'
                         });
}

function moveOrDrag(event){
    if(!isConstructing && currentBtn == 'segment'){
        if(point2 == null){
            point2 = new paper.Path.Circle({
                            center: new paper.Point(this.x, this.y),
                            radius: 4,
                            strokeColor: 'black',
                            fillColor: 'blue'
                         });
            tempPath = new paper.Path.Line({
                                from: point1.position,
                                to: point2.position,
                                strokeColor: 'black'
                            });
        } else {
            point2.position = event.point;
            tempPath.segments[1].point = event.point;
        }
    } else if (!isConstructing && currentBtn == 'circunference') {
        if(point2 == null){
            point2 = new paper.Path.Circle({
                            center: new paper.Point(this.x, this.y),
                            radius: 4,
                            strokeColor: 'black',
                            fillColor: 'blue'
                         });    
            tempPath = new paper.Path.Circle({
                            center: point1.position,
                            radius: distanceBetween2points(point1.position, point2.position),
                            strokeColor: 'black'
                         });
            tempPath.sendToBack(); 
        }else{
            point2.position = event.point;
            tempPath.remove();
            tempPath = new paper.Path.Circle({
                            center: point1.position,
                            radius: distanceBetween2points(point1.position, point2.position),
                            strokeColor: 'black'
                         }); 
        }
    } else if(!isConstructing && currentBtn == 'line'){
        if(point2 == null){
            point2 = new paper.Path.Circle({
                            center: new paper.Point(this.x, this.y),
                            radius: 4,
                            strokeColor: 'black',
                            fillColor: 'blue'
                         });
            tempPath = new paper.Path.Line({
                                from: point1.position,
                                to: point2.position,
                                strokeColor: 'black'
                            });
            tempPath.sendToBack();
        } else {
            point2.position = event.point;
            var coeficienteAngular = coef(point1.position, event.point);
            var lineY0 = getLineY(point1.position, 0, coeficienteAngular);
            var lineYwidth = getLineY(point1.position, $("#canvas").width(), coeficienteAngular);
            if(coeficienteAngular != Number.POSITIVE_INFINITY && coeficienteAngular != Number.NEGATIVE_INFINITY){
                tempPath.segments[0].point = new paper.Point(0,lineY0);
                tempPath.segments[1].point = new paper.Point($("#canvas").width(), lineYwidth);
            } else {
                tempPath.segments[0].point = new paper.Point(event.point.x, 0);
                tempPath.segments[1].point = new paper.Point(event.point.x, $("#canvas").height());
            }
        }
    } else if(!isConstructing && currentBtn == 'ray'){
        if(point2 == null){
            point2 = new paper.Path.Circle({
                            center: new paper.Point(this.x, this.y),
                            radius: 4,
                            strokeColor: 'black',
                            fillColor: 'blue'
                         });
            tempPath = new paper.Path.Line({
                                from: point1.position,
                                to: point2.position,
                                strokeColor: 'black'
                            });
            tempPath.sendToBack();
        } else {
            point2.position = event.point;
            var coeficienteAngular = coef(point1.position, event.point);
            var lineYwidth;

            if(coeficienteAngular != Number.POSITIVE_INFINITY && coeficienteAngular != Number.NEGATIVE_INFINITY){
                if(point2.position.x <= point1.position.x){
                    lineYwidth = getLineY(point1.position, 0, coeficienteAngular);
                    tempPath.segments[1].point = new paper.Point(0, lineYwidth);
                } else{
                    lineYwidth = getLineY(point1.position, $("#canvas").width(), coeficienteAngular);
                    tempPath.segments[1].point = new paper.Point($("#canvas").width(), lineYwidth);
                }
            } else {
                 if(coeficienteAngular == Number.POSITIVE_INFINITY){
                    if(point2.toString == "EURayPointB"){
                        tempPath.segments[1].point = new paper.Point(event.point.x,$("#canvas").height());
                    }else{
                        tempPath.segments[1].point = new paper.Point(event.point.x, 0);
                    }    
                } else{
                    if(point2.toString == "EURayPointB"){
                        tempPath.segments[1].point = new paper.Point(event.point.x,0);
                    }else{
                        tempPath.segments[1].point = new paper.Point(event.point.x, $("#canvas").height());
                    }    
                }
            }

            
        }
    } else if(isConstructing && currentBtn == 'selection'){
        project.activeLayer.selected = false;
        highlightMethod(event);
    } else if(isConstructing && currentBtn == 'move'){
        mouseCursor(event);
        if(moveClicked)
            moveObject(event);
    }
}


function distanceBetween2points(pointA, pointB){
    return Math.sqrt(Math.pow((pointA.x - pointB.x),2)+Math.pow((pointA.y - pointB.y),2))
}

function unselectObjects(){
    var selectedSize = selectedObjects.length;
    for(var i = 0; i < selectedSize; i++){
        var object = selectedObjects.pop();
        if(object.shadowClone != null)
            object.shadowClone.remove();
        object.shadowClone = null;
    }
}

var segmentHitResult, pathHitResult;
var movepathHitResult = false;
var selectedObjects = [];

function testHitOnProject(event){
    segmentHitResult = pathHitResult = null;
    var hitResult = project.hitTestAll(event.point, hitOptions);
    if (hitResult.length == 0){
        project.activeLayer.selected = false;
        unselectObjects();
        return;
    } else if (hitResult.length > 0 && hitResult[0].item.isClone){
        return;
    } else {
        for(var i = 0; i < hitResult.length; i++){
            if(selectedObjects.indexOf(hitResult[i].item) == -1){
                if(hitResult[i].item.shadowClone != null) return;
                createShadow(hitResult[i].item);
                selectedObjects.push(hitResult[i].item);
                if(hitResult[i].item.toString != "EURegularPoint"){
                    createShadow(hitResult[i].item.relatedObjects[0]);
                    selectedObjects.push(hitResult[i].item.relatedObjects[0]);
                    createShadow(hitResult[i].item.relatedObjects[1]);
                    selectedObjects.push(hitResult[i].item.relatedObjects[1]);
                }        
            }else{
                return;
            }
        }
    }   
}

function generateIntersections(){
    var strokeList = [];
    for(var i = 0; i < selectedObjects.length; i++){
        if(selectedObjects[i].toString.indexOf("oint") == -1){
            strokeList.push(selectedObjects[i]);
        }
    }
    createIntersections(strokeList);
}

function createShadow(item){
    var clone = item.clone();
    clone.strokeWidth = 10;
    clone.strokeColor = new paper.Color(0.7,0.7,1,0.4);
    clone.sendToBack();
    clone.isClone = true;
    item.shadowClone = clone;
}

function highlightMethod(event){
    segmentHitResult = pathHitResult = null;
    var hitResult = project.hitTestAll(event.point, hitOptions);
    if (hitResult.length == 0 || hitResult[0].item.isClone){
        project.activeLayer.selected = false;
        return;
    } else {
        for(var i = 0; i < hitResult.length; i++){
            if(!hitResult[i].item.isClone){
                hitResult[i].item.selected = true;
                if(hitResult[i].item.toString != "EURegularPoint"){
                    hitResult[i].item.relatedObjects[0].selected = true;
                    hitResult[i].item.relatedObjects[1].selected = true;
                }    

            }
        }
    }   
}

