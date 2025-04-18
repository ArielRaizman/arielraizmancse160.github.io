// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  `attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE =
  `precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`  

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; 
let g_selectedSize = 10; 
let g_selectedType=POINT;
let g_segments = 10;
function htmlUI() {
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0]; };
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0,0.0,0.0,1.0]; };
  document.getElementById('clear').onclick = function() { g_shapes = []; renderShapes(); };
  document.getElementById('drawing').onclick = function() { drawPicture(); };

  document.getElementById('point').onclick = function() { g_selectedType =POINT};
  document.getElementById('triangle').onclick = function() { g_selectedType =TRIANGLE };
  document.getElementById('circle').onclick = function() { g_selectedType =CIRCLE };
  document.getElementById('etch').onclick = function() { etchASketch(); };

  //sliders
  document.getElementById('redslide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenslide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueslide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });
  document.getElementById('sizeslide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
  document.getElementById('segmentslide').addEventListener('mouseup', function() { g_segments = this.value; });
}
function main() {

  setupWebGL();
  connectVariablesToGLSL();

  htmlUI();
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev){ click(ev) };
  canvas.onmousemove = function(ev){ if (ev.buttons == 1) click(ev) }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = [];

var g_shapes = []; 

function coordsToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return [x, y];
} 



function renderShapes() { 
  // Clear <canvas>
  var startTime = performance.now();
  gl.clear(gl.COLOR_BUFFER_BIT);

  // var len = g_points.length;
  var len = g_shapes.length;
  for(var i = 0; i < len; i++) {
    g_shapes[i].render()
  }
  var duration = performance.now() - startTime;
  sendTextToHTML("perf", "numdot " + len + " ms " + duration + " fps " + 1000/duration);
}

function click(ev) {
  etchMode = false; 
  document.removeEventListener('keydown', handleEtchKeyPress);
  sendTextToHTML("isetch", "");
  // Get the coordinates of a mouse press
  [x,y] = coordsToGL(ev);
  // Store the coordinates to g_points array
  // g_points.push([x, y]);

  // g_colors.push(g_selectedColor.slice());

  // g_sizes.push(g_selectedSize);

  // let point = new Triangle();
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else if (g_selectedType == CIRCLE) {
    point = new Circle();
    point.segments = g_segments;
  }
  point.position = [x,y];
  
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapes.push(point);
  // Store the coordinates to g_points array
  // if (x >= 0.0 && y >= 0.0) {      // First quadrant
  //   g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  // } else if (x < 0.0 && y < 0.0) { // Third quadrant
  //   g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  // } else {                         // Others
  //   g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  // }
  // Render the shapes
  renderShapes(ev);
  
}

function sendTextToHTML(id, text) {
  document.getElementById(id).innerHTML = text;
}

let etchPosition = [0.0, 0.0]; // Start at the center of the canvas
let etchMode = false; // Flag to track if etch-a-sketch mode is active

function etchASketch() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  etchPosition = [0.0, 0.0]; 
  drawEtchPoint();

  etchMode = true;
  sendTextToHTML("isetch", "Etch-a-Sketch mode is ON! Press 'w', and 's' to move vertically, and the left and right arrow keys to move horizontally :)");
  document.addEventListener('keydown', handleEtchKeyPress);
}

function handleEtchKeyPress(event) {
  if (!etchMode) {
    return;
  } 

  const step = 0.05;

  if (event.key === 'w') {
    etchPosition[1] += step; 
  } else if (event.key === 's') {
    etchPosition[1] -= step; 
  } else if (event.key === 'ArrowLeft') {
    etchPosition[0] -= step; 
  } else if (event.key === 'ArrowRight') {
    etchPosition[0] += step; 
  }

  drawEtchPoint();
}

function drawEtchPoint() {
  let point = new Point();
  point.position = [...etchPosition, 0.0]; 
  point.color = [...g_selectedColor];
  point.size = g_selectedSize;

  g_shapes.push(point);
  renderShapes();
}