//shape object, creating an object which is an array of x,y points (a shape)
//plus some properties of that shape, e.g. variance of points from centre

var shapes = new Array();

function start() {
	var initForm = document.forms[0];
	var nShapesIndex = initForm.elements["nShapes"].selectedIndex;
	var canvasID =""
	for (var j = 0; j<initForm.elements["nShapes"].selectedIndex; j++) {	
		canvasID = "canvas"+j;		
		var newShape = new shape(75,75,100,100,5,canvasID); 
		shapes.push(newShape);
	}

	var x = 0;
	var y = 1;
	for (var j=0;j<shapes.length;j++) {	
		var canvW = shapes[j].centre[x]+2*shapes[j].radius;
		var canvH = shapes[j].centre[y]+2*shapes[j].radius;
		var newElement=document.createElement("canvas");
		newElement.setAttribute("id",shapes[j].canvasID);
		newElement.setAttribute("width",canvW);
		newElement.setAttribute("height",canvH);
		document.getElementById("displayArea").appendChild(newElement);
		shapes[j].drawShape();
	}
	initForm.style.display = 'none'
}

function newGen() {
	var fittest = 0;
	for (var i = 0; i<1;i++) {
	for (var j=1;j<shapes.length;j++) {	
		shapes[j].mutate(2);
	}
	fittest = selectFittest(shapes);
	for (var j=0;j<shapes.length;j++) {	
		shapes[j].drawShape();
		clone(shapes[j],shapes[fittest]);
	}}
}

function tenGens() {
	for (var j=0;j<10;j++) {
		newGen()
	}
}

function shape(xinit,yinit,w,h,incr,canvasID) {
   this.points = new Array();
	for (var x=xinit;x<=xinit+w;x=x+incr) {	
		this.points.push([x,yinit]);
	}
	for (var y=yinit;y<=yinit+h;y=y+incr) {	
		this.points.push([x,y]);
	}
	for (x;x>=xinit;x=x-incr) {	
		this.points.push([x,y]);
	}
	for (y;y>=yinit;y=y-incr) {	
		this.points.push([x,y]);
	}
	this.canvasID = canvasID;
	this.centre = [xinit+w/2,yinit+h/2];
	this.radius = (w+h)/4;
	this.circularity = circularity;
	this.mutate = mutate;
	this.drawShape = drawShape;
}

function circularity(){
//mean square deviation of distance of points from circle with same centre	
	var x = 0;
	var y = 1; //can address each point as points[j][x,y]
	var j = 0;
	var d = new Array(); // distances of points from centre
	var s = new Array(); // separation of points from previous
   var sum_d = 0;
   var sum_s = 0;
   var mean_s =0;
   var dev_d = 0;
   var dev_s = 0;
   for (j=0;j<this.points.length;j++) {
		//calculate distance d from centre of shape
		d[j] = Math.sqrt((this.points[j][x]-this.centre[x])*(this.points[j][x]-this.centre[x]) + (this.points[j][y]-this.centre[y])*(this.points[j][y]-this.centre[y]));
		if (j==0) {
			s[j] = 10;
		} else {
			s[j] = Math.sqrt((this.points[j][x]-this.points[j-1][x])*(this.points[j][x]-this.points[j-1][x]) + (this.points[j][y]-this.points[j-1][y])*(this.points[j][y]-this.points[j-1][y]));
		}		
		sum_d = sum_d + d[j];
		sum_s = sum_s + s[j];
	}
	this.radius = sum_d/this.points.length;
	mean_s = sum_s/this.points.length;
	for (j=0;j<this.points.length;j++) {
		dev_d = dev_d+(d[j]-this.radius)*(d[j]-this.radius);
		dev_s = dev_s+(s[j]-mean_s)*(s[j]-mean_s);
	}
	dev_d = dev_d/this.points.length;
	dev_s = dev_s/this.points.length;
	return (dev_s+dev_d);
//	return dev_d;
}

function mutate(r){
	// r = by how much should the points vary "radius of mutation"
	var x = 0;
	var y = 1; //can address each point as points[j][x,y]
	var j = 0;
	for (j=0;j<this.points.length;j++) {
		this.points[j][x] = this.points[j][x] +  Math.round((Math.random()-0.5)*r);
		this.points[j][y] = this.points[j][y] +  Math.round((Math.random()-0.5)*r);
	}

}

function drawShape() {
  var drawingCanvas = document.getElementById(this.canvasID); 
  var context = drawingCanvas.getContext('2d');  
  var x = 0;
  var y = 1;
  var j = 0;
  context.clearRect(0,0,400,400);
  context.strokeStyle = "#000000";
  context.fillStyle = "#ffffff";
  context.font="10pt Arial, sans-serif";
  context.beginPath();
  context.moveTo(this.points[0][x],this.points[0][y]);
  for (j=0;j<this.points.length;j++){
//    context.moveTo(this.points[j][x],this.points[j][y]);			// for dots 
//    context.lineTo(this.points[j][x]+1,this.points[j][y]+1);	   // use these two

    context.lineTo(this.points[j][x],this.points[j][y]);			// for perimeter

//    context.lineTo(this.points[j][x],this.points[j][y]);	   	// for spoked wheel
//    context.lineTo(this.centre[x],this.centre[y]);					//	use these
//    context.moveTo(this.points[j][x],this.points[j][y])			// three
  }
  context.closePath();
//  context.strokeText(Math.floor(this.circularity()),20,20);
  context.strokeText(this.circularity(),20,20);
  context.stroke();
}

function clone(shapeA,shapeB) {
	var x = 0;
	var y = 1;
	shapeA.centre = shapeB.centre;
	shapeA.radius = shapeB.radius;
	for (j=0;j<shapeA.points.length;j++){
		shapeA.points[j][x] = shapeB.points[j][x];
		shapeA.points[j][y] = shapeB.points[j][y];	
	}
	
}

function selectFittest(population) {
	fittest = 0;
	fitness = population[0].circularity();
	for (var j=1;j<population.length;j++) {
		if (population[j].circularity() < fitness) {
			fittest = j;
			fitness = population[j].circularity();
		}
	}
	return fittest;
}

