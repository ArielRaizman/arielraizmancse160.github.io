// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw the canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, 400, 400);        // Fill a rectangle with the color

  // Draw red vector
  var vector = new Vector3([2.25, 2.25, 0.0]);

  
  // drawVector(vector, 'red');
}

function drawVector(ctx,v, color) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(200, 200);
  ctx.lineTo(v.elements[0] * 20 +200, 200- v.elements[1] * 20);
  ctx.stroke();
  // console.log('drawVector called with color: ' + color);
  
}

function handleDrawEvent() {
  var canvas = document.getElementById('example'); 
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, 400, 400);        // Fill a rectangle with the color

  var x1 = parseFloat(document.getElementById('x1').value);
  var y1 = parseFloat(document.getElementById('y1').value);
  var x2 = parseFloat(document.getElementById('x2').value);
  var y2 = parseFloat(document.getElementById('y2').value);
  // var operation = document.getElementById('operation').value;
  // var scalar = parseFloat(document.getElementById('scalar').value);
  console.log(x1,y1)
  console.log(x2,y2)

  var v1 = new Vector3([x1, y1, 0.0]);
  var v2 = new Vector3([x2, y2, 0.0]);

  drawVector(ctx,v1, 'red');
  drawVector(ctx,v2, 'blue');
}

function handleDrawOperationEvent() {
  var canvas = document.getElementById('example');
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  }
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, 400, 400);        // Fill a rectangle with the color

  var x1 = parseFloat(document.getElementById('x1').value);
  var y1 = parseFloat(document.getElementById('y1').value);
  var x2 = parseFloat(document.getElementById('x2').value);
  var y2 = parseFloat(document.getElementById('y2').value);
  var operation = document.getElementById('operation').value;
  var scalar = parseFloat(document.getElementById('scalar').value);

  var v1 = new Vector3([x1, y1, 0.0]);
  var v2 = new Vector3([x2, y2, 0.0]);

  drawVector(ctx,v1, 'red');
  drawVector(ctx,v2, 'blue');

  if (operation == "add") {
    var v3 = v1.add(v2);
    drawVector(ctx,v3, 'green');
  } else if (operation == "subtract") {
    var v3 = v1.sub(v2);
    drawVector(ctx,v3, 'green');
  } else if (operation == "multiply") {
    var v3 = v1.mul (scalar);
    var v4 = v2.mul(scalar);
    drawVector(ctx,v3, 'green');
    drawVector(ctx,v4, 'green');
  } else if (operation == "divide") {
    var v3 = v1.div(scalar);
    var v4 = v2.div(scalar);
    drawVector(ctx,v3, 'green');
    drawVector(ctx,v4, 'green');
  } else if (operation == "magnitude") {
    var mag1 = v1.magnitude();
    var mag2 = v2.magnitude();
    console.log("Magnitude v1:",mag1);
    console.log("Magnitude v2:",mag2);
  } else if (operation == "normalize") {
    var v3 = v1.normalize();
    var v4 = v2.normalize();
    drawVector(ctx,v3, 'green');
    drawVector(ctx,v4, 'green');
  } else if (operation == "angle") {
    var dot = Vector3.dot(v1, v2);
    var mag1 = v1.magnitude();
    var mag2 = v2.magnitude();

    var cosTheta = dot / (mag1 * mag2);
    var angle = Math.acos(cosTheta) * (180 / Math.PI);
    console.log("Angle:", angle);
  } else if (operation == "area") {
    var cross = Vector3.cross(v1, v2);
    var parallelogram = cross.magnitude();
    var triangle = parallelogram / 2;
    console.log("Area:", triangle);
  }
}