var actionStack = [];
var redoStack = [];

function undo(){
	var action = actionStack.pop();
	action.undo();
	redoStack.push(action);
}

function redo(){
	var action = redoStack.pop();
	action.execute();
	actionStack.push(action);
}

//////////////////// ActionList ////////////////////////////

//args: coordinates to the new point
function createPoint(args){
	var action = new CreatePoint();
	action.setCoordinates(args.x, args.y);
	action.execute();
	actionStack.push(action);
}

//args: object containing two points
function createSegment(args){
	var action = new CreateSegment();
	action.setPoints(args.pointA.x, args.pointA.y, args.pointB.x, args.pointB.y);
	action.execute();
	actionStack.push(action);
}

//args: two points
function createLine(args){
	var action = new CreateLine();
	action.setPoints(args.pointA.x, args.pointA.y, args.pointB.x, args.pointB.y);
	action.execute();
	actionStack.push(action);
}

//args: two points
function createRay(args){
	var action = new CreateRay();
	action.setPoints(args.pointA.x, args.pointA.y, args.pointB.x, args.pointB.y);
	action.execute();
	actionStack.push(action);
}


//args: two points
function createCircunference(args){
	var action = new CreateCircle();
	action.setPoints(args.pointA.x, args.pointA.y, args.pointB.x, args.pointB.y);
	action.setRadius(args.radius);
	action.execute();
	actionStack.push(action);
}

//args: two points
function createIntersections(args){
	var action = new CreateIntersections();
	action.setListOfObjects(args);
	action.execute();
	actionStack.push(action);
}

// CLASS DEFINITIONS ////////////////////////////////

function CreateIntersections(){
	this.intersections = [];
	this.listOfObjects = null;
	this.listOfIndexes = null;
	this.setListOfObjects = function (arg){
		this.listOfObjects = arg;
	}	
	this.execute = function (){
		console.log("Mandou executar..."+this.listOfObjects.length);
		if(this.listOfObjects.length > 0){
			var selectedSize = this.listOfObjects.length;
		    if(selectedSize > 1){
		        for(var i = 0; i < selectedSize - 1; i++) {
		            for(var j = 1; j < selectedSize; j++){
		            	constructIntersections(this.intersections, this.listOfObjects[i], this.listOfObjects[j]);
		            }
		        }    
		    }
		}
	}
	this.undo = function (){

	}

}

function constructIntersections(listOfIntersections, path1, path2) {
    var intersections = path1.getIntersections(path2);
    for (var i = 0; i < intersections.length; i++) {
    	if(!verifyExistenceOfIntersection(intersections[i].point, listOfIntersections)){
    		var inter = new paper.Path.Circle({
	            center: intersections[i].point,
	            radius: 4,
	            fillColor: 'red',
	            strokeColor: 'black',
	            strokeWidth: 1
        	});
        	listOfIntersections.push(inter);
    	}
    }
}

function verifyExistenceOfIntersection(point, list){
	for(var i = 0; i < list.length; i++){
		if(list[i].position.x == point.x && list[i].position.y == point.y) 
			return true;
	}
	return false;
}


function CreatePoint(){
	this.x = 0;
	this.y = 0;
	this.index = -1;
	this.execute = function(){
		if(this.point == null){
			this.point = new paper.Path.Circle({
    						center: new paper.Point(this.x, this.y),
    						radius: 4,
    						strokeColor: 'black',
    						fillColor: 'blue'
						 });
			this.point.toString = "RegularPoint";
		} else {
			paper.project.activeLayer.insertChild(this.index, this.point);
		}
		paper.view.update();
	}
	this.setCoordinates = function(x, y){
		this.x = x;
		this.y = y;
	}
	this.undo = function(){
		this.index = this.point.index;
		this.point.remove();
	}
}

function CreateSegment(){
	this.pointA = null;
	this.pointB = null;
	this.segment = null;
	this.indexA = -1;
	this.indexB = -1;
	this.indexS = -1;
	this.execute = function(){
		if(this.segment == null){
			this.segment = new paper.Path.Line({
	    						from: this.pointA.position,
							    to: this.pointB.position,
							    strokeColor: 'black'
						 	});
			this.segment.sendToBack();
			this.segment.toString = "SegmentStroke";
			this.segment.relatedObjects = [this.pointA, this.pointB];
			this.pointA.relatedObjects.push(this.segment);
			this.pointB.relatedObjects.push(this.segment);
		}
		else {
			paper.project.activeLayer.insertChild(this.indexS, this.segment);
			paper.project.activeLayer.insertChild(this.indexA, this.pointA);
			paper.project.activeLayer.insertChild(this.indexB, this.pointB);
		}
		paper.view.update();
	}
	this.setPoints = function(a_x, a_y, b_x, b_y){
		this.pointA = new paper.Path.Circle({
    						center: new paper.Point(a_x, a_y),
    						radius: 4,
    						strokeColor: 'black',
    						fillColor: 'blue'
						 });
		this.pointA.toString = "SegmentPoint";
		this.pointB = new paper.Path.Circle({
    						center: new paper.Point(b_x, b_y),
    						radius: 4,
    						strokeColor: 'black',
    						fillColor: 'blue'
						 });
		this.pointB.toString = "SegmentPoint";
		this.pointB.relatedObjects = [this.pointA];
		this.pointA.relatedObjects = [this.pointB];
	}
	this.undo = function(){
		this.indexA = this.pointA.index;
		this.indexB = this.pointB.index;
		this.indexS = this.segment.index;
		this.pointA.remove();
		this.pointB.remove();
		this.segment.remove();
	}
}

function CreateCircle(){

	this.pointA = null;
	this.pointB = null;
	this.circunference = null;
	this.radius = -1;
	this.indexA = -1;
	this.indexB = -1;
	this.indexC = -1;

	this.setPoints = function(a_x, a_y, b_x, b_y){
		this.pointA = new paper.Path.Circle({
    						center: new paper.Point(a_x, a_y),
    						radius: 4,
    						strokeColor: 'black',
    						fillColor: 'blue'
						 });
		this.pointB = new paper.Path.Circle({
    						center: new paper.Point(b_x, b_y),
    						radius: 4,
    						strokeColor: 'black',
    						fillColor: 'blue'
						 });
		this.pointA.toString = "CircunferenceCenterPoint";
		this.pointB.toString = "CircunferenceRayPoint";
		this.pointA.relatedObjects = [this.pointB];
		this.pointB.relatedObjects = [this.pointA];
	}

	this.setRadius = function(radius){
		this.radius = radius;
	}

	this.execute = function(){
		if(this.circunference == null){
			this.circunference = new paper.Path.Circle({
				center: this.pointA.position,
				radius: this.radius,
				strokeColor: 'black'
			});
			this.circunference.toString = "CircunferenceStroke";
			this.circunference.relatedObjects = [this.pointA, this.pointB];
			this.pointA.relatedObjects.push(this.circunference);
			this.pointB.relatedObjects.push(this.circunference);

		} else {
			paper.project.activeLayer.insertChild(this.indexS, this.circunference);
			paper.project.activeLayer.insertChild(this.indexA, this.pointA);
			paper.project.activeLayer.insertChild(this.indexB, this.pointB);
		}
		paper.view.update();
	}

	this.undo = function(){
		this.indexA = this.pointA.index;
		this.indexB = this.pointB.index;
		this.indexS = this.circunference.index;
		this.circunference.remove();
		this.pointA.remove();
		this.pointB.remove();
	}
}


function CreateLine(){
	this.pointA = null;
	this.pointB = null;
	this.line = null;
	this.indexA = -1;
	this.indexB = -1;
	this.indexS = -1;
	this.execute = function(){
		if(this.line == null){
			var coeficienteAngular = coef(this.pointA.position, this.pointB.position);
            var lineY0 = getLineY(this.pointA.position, 0, coeficienteAngular);
            var lineYwidth = getLineY(this.pointA.position, $("#canvas").width(), coeficienteAngular);
			this.line = new paper.Path.Line({
	    						from: new paper.Point(0,lineY0),
							    to: new paper.Point($("#canvas").width(), lineYwidth),
							    strokeColor: 'black'
						 	});
			this.line.toString = "LineStroke";
			this.line.relatedObjects = [this.pointA, this.pointB];
			this.pointA.relatedObjects.push(this.line);
			this.pointB.relatedObjects.push(this.line);
			this.line.sendToBack();
		}
		else {
			paper.project.activeLayer.insertChild(this.indexS, this.line);
			paper.project.activeLayer.insertChild(this.indexA, this.pointA);
			paper.project.activeLayer.insertChild(this.indexB, this.pointB);
		}
		paper.view.update();
	}
	this.setPoints = function(a_x, a_y, b_x, b_y){
		this.pointA = new paper.Path.Circle({
    						center: new paper.Point(a_x, a_y),
    						radius: 4,
    						strokeColor: 'black',
    						fillColor: 'blue'
						 });
		this.pointA.toString = "LinePoint";
		this.pointB = new paper.Path.Circle({
    						center: new paper.Point(b_x, b_y),
    						radius: 4,
    						strokeColor: 'black',
    						fillColor: 'blue'
						 });
		this.pointB.toString = "LinePoint";
		this.pointB.relatedObjects = [this.pointA];
		this.pointA.relatedObjects = [this.pointB];
	}
	this.undo = function(){
		this.indexA = this.pointA.index;
		this.indexB = this.pointB.index;
		this.indexS = this.line.index;
		this.pointA.remove();
		this.pointB.remove();
		this.line.remove();
	}
}

function CreateRay(){
	this.pointA = null;
	this.pointB = null;
	this.line = null;
	this.indexA = -1;
	this.indexB = -1;
	this.indexS = -1;
	this.execute = function(){
		if(this.line == null){
			var coeficienteAngular = coef(this.pointA.position, this.pointB.position);
            var lineYwidth = getLineY(this.pointA.position, $("#canvas").width(), coeficienteAngular);
            var lineYwidth;
            var toPoint;
            if(this.pointB.position.x <= this.pointA.position.x){
                lineYwidth = getLineY(this.pointA.position, 0, coeficienteAngular);
                toPoint = new paper.Point(0, lineYwidth);
            } else{
                lineYwidth = getLineY(this.pointA.position, $("#canvas").width(), coeficienteAngular);
               	toPoint = new paper.Point($("#canvas").width(), lineYwidth);
            }
			this.line = new paper.Path.Line({
	    						from: this.pointA.position,
							    to: toPoint,
							    strokeColor: 'black'
						 	});
			this.line.sendToBack();
			this.line.toString = "RayStroke";
			this.pointA.relatedObjects.push(this.pointB);
			this.pointB.relatedObjects.push(this.pointA);
			this.line.relatedObjects = [this.pointA, this.pointB];
		}
		else {
			paper.project.activeLayer.insertChild(this.indexS, this.line);
			paper.project.activeLayer.insertChild(this.indexA, this.pointA);
			paper.project.activeLayer.insertChild(this.indexB, this.pointB);
		}
		paper.view.update();
	}
	this.setPoints = function(a_x, a_y, b_x, b_y){
		this.pointA = new paper.Path.Circle({
    						center: new paper.Point(a_x, a_y),
    						radius: 4,
    						strokeColor: 'black',
    						fillColor: 'blue'
						 });
		this.pointA.toString = "RayPoint";
		this.pointB = new paper.Path.Circle({
    						center: new paper.Point(b_x, b_y),
    						radius: 4,
    						strokeColor: 'black',
    						fillColor: 'blue'
						 });
		this.pointB.toString = "RayPoint";
		this.pointA.relatedObjects = [this.pointB];
		this.pointB.relatedObjects = [this.pointA];
	}
	this.undo = function(){
		this.indexA = this.pointA.index;
		this.indexB = this.pointB.index;
		this.indexS = this.line.index;
		this.pointA.remove();
		this.pointB.remove();
		this.line.remove();
	}

}


function coef(pontoA, pontoB){
    var coef = (pontoA.y - pontoB.y)/(pontoA.x - pontoB.x);
    return coef;
}

function getLineY(ponto, x, coef){
    var y = coef * (x - ponto.x) + ponto.y;
    return y;
}

//---------------------------------------

function showIntersections(path1, path2) {
    var intersections = getProjectIntersections();
    for (var i = 0; i < intersections.length; i++) {
        new Path.Circle({
            center: intersections[i].point,
            radius: 5,
            fillColor: '#009dec'
        }).removeOnMove();
    }
}