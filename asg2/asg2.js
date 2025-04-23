// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  `attribute vec4 a_Position;
  uniform mat4  u_ModelMatrix;
  uniform mat4 u_GlobalRotationMatrix;
  void main() {
    gl_Position = u_GlobalRotationMatrix * u_ModelMatrix * a_Position;
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
let u_ModelMatrix
let u_GlobalRotationMatrix;
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
  // gl.enable(gl.DEPTH_TEST); // Enable depth test
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

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotationMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotationMatrix');
  if (!u_GlobalRotationMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotationMatrix');
    return;
  }
}
// const POINT = 0;
// const TRIANGLE = 1;
// const CIRCLE = 2;
// let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; 
// let g_selectedType=POINT;
// let g_segments = 10;
let g_globalAngle = 0.0;
let g_jointSlider = 0.0;
let g_purpleJoint = 0.0;
let g_animation = true;
function htmlUI() {
  document.getElementById('on').onclick = function() { g_animation = true; };
  document.getElementById('off').onclick = function() { g_animation = false; };

  // //sliders
  document.getElementById('angleslide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderShapes(); });
  document.getElementById('jointslide').addEventListener('mousemove', function() { g_jointSlider = this.value; renderShapes(); });
  document.getElementById('purplejointslide').addEventListener('mousemove', function() { g_purpleJoint = this.value; renderShapes(); });
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
  // renderShapes();
  requestAnimationFrame(tick);
}

var g_shapes = []; 

function coordsToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return [x, y];
} 

g_startTime = performance.now() / 1000.0;
g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  console.log(g_seconds);

  updateAnimationAngle();

  renderShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngle() {
  if (g_animation) {
    g_jointSlider = 45*Math.sin(g_seconds);
    g_purpleJoint = 45*Math.cos(g_seconds);
  }
}

function renderShapes() { 
  // Clear <canvas>
  // var startTime = performance.now();

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotationMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.enable(gl.DEPTH_TEST);

  // // Test triangle
  // gl.uniform4f(u_FragColor, 0.9, 0.9, 0.4, 1.0); 
  // const modelMatrix = new Matrix4(); 
  // gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  // drawTriangle3D(gl, [-1.0,0.0,0.0,  -0.5,-1.0,0.0,  0.0,0.0,0.0]);

  // Draw Cube
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.matrix.translate(-.25,-.75,0.0);
  body.matrix.rotate(-5,1,0,0);
  body.matrix.scale(0.5,.3,0.5);
  body.render()

  // Draw Cube
  var arm = new Cube();
  arm.color = [1.0, 1.0, 0.0, 1.0];
  arm.matrix.translate(0,-.5,0.0);
  arm.matrix.rotate(-5,1,0,0);
  arm.matrix.rotate(g_jointSlider,0,0,1);
  var yellowCoordinates = new Matrix4(arm.matrix);
  arm.matrix.scale(0.25,.7,0.5);
  arm.matrix.translate(-0.5,0,0);
  arm.render()

  var box = new Cube();
  box.color = [1,0,1,1];
  box.matrix = yellowCoordinates
  box.matrix.translate(0,.65,0)
  // box.matrix.rotate(g_purpleJoint,0,0,1)
  box.matrix.rotate(g_purpleJoint,0,0,1)
  box.matrix.scale(.3,.3,.3)
  box.matrix.translate(-.5,0,-0.0001)
  // box.matrix.translate(-.1,.1,0.0);
  // box.matrix.rotate(-30,1,0,0);
  // box.matrix.scale(0.2,.4,.2);
  box.render()

  var k = 10;
  for (var i = 1; i < k; i++) {
    var c = new Cube();
    c.matrix.translate(-.8,1.9*i/k-1,0.0);
    c.matrix.rotate(g_seconds*1000,1,1,1);
    c.matrix.scale(.1,.5/k,.1/k)
    c.color = [
      (Math.sin(g_seconds * i) * 0.5 + 0.5), 
      (Math.cos(g_seconds * i * 1.5) * 0.5 + 0.5), 
      (Math.sin(g_seconds * i * 2) * 0.5 + 0.5), 
      1
    ];
    c.render()
  }

  // var duration = performance.now() - startTime;
  // sendTextToHTML("perf", "numdot " + len + " ms " + duration + " fps " + 1000/duration);
}

function sendTextToHTML(id, text) {
  document.getElementById(id).innerHTML = text;
}
