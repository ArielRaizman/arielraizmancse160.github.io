// Notes for Grader
// Used the youtube videos and the help of copilot

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
let u_ModelMatrix;
let u_GlobalRotationMatrix;
let g_globalAngle = 0.0;
let g_jointSlider = 0.0;
let g_purpleJoint = 0.0;
let g_animation = true;
let g_verticalAngle = 0.0;
let g_isDragging = false;
let g_lastX = -1;
let g_lastY = -1;
let g_rotationSpeed = 0.5;
let g_scale = 1.0;
let g_zoomSpeed = 0.1;

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

function htmlUI() {
  document.getElementById('on').onclick = function() { g_animation = true; };
  document.getElementById('off').onclick = function() { g_animation = false; };

}

function mouseNavigation() {
  // Add mouse events for canvas rotation
  canvas.onmousedown = function(ev) { 
    g_isDragging = true;
    g_lastX = ev.clientX;
    g_lastY = ev.clientY;
  };
  
  canvas.onmouseup = function() { 
    g_isDragging = false;
  };
  
  canvas.onmouseleave = function() {
    g_isDragging = false;
  };
  
  canvas.onmousemove = function(ev) { 
    if (g_isDragging) {
      const dx = ev.clientX - g_lastX;
      const dy = ev.clientY - g_lastY;
      
      // Update rotation angles
      g_globalAngle -= dx * g_rotationSpeed;
      g_verticalAngle -= dy * g_rotationSpeed;
      
      g_lastX = ev.clientX;
      g_lastY = ev.clientY;
      
      // Redraw the scene
      renderShapes();
    }
  };

  canvas.onwheel = function(ev) {

    ev.preventDefault(); 
    
    if (ev.deltaY > 0) {
      g_scale =  Math.min(5.0, g_scale + g_zoomSpeed)
    } else {
      
      g_scale = Math.max(0.1, g_scale - g_zoomSpeed)
    }

    renderShapes();
  }
}

function main() {

  setupWebGL();
  connectVariablesToGLSL();

  htmlUI();

  mouseNavigation();
  setupSeaLemonClick(); // Add this to register the click handler
  
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
  let startTime = performance.now()
  var globalRotMat = new Matrix4()
    .scale(g_scale, g_scale, g_scale) 
    .rotate(g_verticalAngle, 1, 0, 0) 
    .rotate(g_globalAngle, 0, 1, 0); 
  
  gl.uniformMatrix4fv(u_GlobalRotationMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.enable(gl.DEPTH_TEST);

  kelpStalk(-3,-0.2,4);
  kelpStalk(-2,-0.2,-3);
  kelpStalk(4,-0.2,0);
  seaLemon();

  var duration = performance.now() - startTime;
  sendTextToHTML("perf", "fps " + 1000/duration);
}

function kelpSection(x,y,z,stemToggle) {

  var stem = new Cube();
  stem.color = [0.0, 0.5, 0.0, 1.0];
  stem.matrix.translate(-0.075, -.25  , -0.075);
  stem.matrix.scale(0.15, 0.5, 0.15);
  stem.matrix.translate(x,y,z)
  stem.matrix.scale(0.5, 0.5, 0.5);
  stemMatrix = new Matrix4(stem.matrix);
  stem.render();

  
  // // Generate a seed based on g_startTime (only set once at the beginning)
  // const leafSeed = Math.floor(g_startTime * 1000);
  
  // // Simple deterministic random function based on the seed
  // function seededRandom(seed, index) {
  //   const x = Math.sin(seed + index * 9999) * 10000;
  //   return x - Math.floor(x);
  // }
  // Create 3 leaves coming out from the right side of the stem
  const leafSpacing = 0.15; // Vertical spacing between leaves
  const leafStartY = -0.15 ; // Starting position from bottom of stem
  if (stemToggle) {
    // First leaf (bottom)
    var leaf1 = new Leaf();
    leaf1.color = [0.0, 0.7, 0.0, 1.0];
    leaf1.matrix = new Matrix4(stemMatrix);
    leaf1.matrix.translate(2, (leafStartY + 0.25) / 0.5, 0.5 ); 
    leaf1.matrix.rotate(90, 0, 0, 1); 
    // Add swaying motion
    leaf1.matrix.rotate(10 * Math.sin(g_seconds * 1.5), 0, 1, 0);
    leaf1.matrix.rotate(5 * Math.cos(g_seconds), 1, 0, 1); 
    leaf1.matrix.scale(0.2/0.5, 0.2/0.15, 0.1/0.15); 
    leaf1.render();
    
    // Second leaf (middle)
    var leaf2 = new Leaf();
    leaf2.color = [0.0, 0.7, 0.0, 1.0];
    leaf2.matrix = new Matrix4(stemMatrix);
    leaf2.matrix.translate(2, (leafSpacing + leafStartY + 0.25) / 0.5, 0.5 ); 
    leaf2.matrix.rotate(90, 0, 0, 1);
    // Add swaying motion with different timing
    leaf2.matrix.rotate(12 * Math.sin(g_seconds * 1.2 + 0.5), 0, 1, 0);
    leaf2.matrix.rotate(8 * Math.cos(g_seconds * 0.8), 1, 0, 1);
    leaf2.matrix.scale(0.2/0.5, 0.2/0.15, 0.1/0.15); 
    leaf2.render();
    
    // Third leaf (top)
    var leaf3 = new Leaf();
    leaf3.color = [0.0, 0.7, 0.0, 1.0];
    leaf3.matrix = new Matrix4(stemMatrix);
    leaf3.matrix.translate(2, (leafSpacing*2 + leafStartY + 0.25) / 0.5, 0.5 ); 
    leaf3.matrix.rotate(90, 0, 0, 1);
    // Add swaying motion with different amplitude and phase
    leaf3.matrix.rotate(15 * Math.sin(g_seconds * 0.9 + 1.0), 0, 1, 0);
    leaf3.matrix.rotate(6 * Math.cos(g_seconds * 1.1), 1, 0, 1);
    leaf3.matrix.scale(0.2/0.5, 0.2/0.15, 0.1/0.15); 
    leaf3.render();
  }
}

function kelpStalk(x,y,z) {
  var numSections = 12; 
  var sectionHeight = 0.5;  
  var waveSpeed = 2.0;  
  var waveAmplitude = 0.5 ; 
    
  for (let i = 1; i < numSections; i++) {
    var shifty = i * sectionHeight;
    
    
    var heightFactor = i / numSections;
    var shiftx = Math.sin(g_seconds * waveSpeed + i * 0.2) * waveAmplitude * heightFactor;
    
    kelpSection(shiftx + x, shifty + y, z, i > 1);
  }
}

let g_seaLemonScrunched = false;
let g_seaLemonScrunchTime = 0;
let g_scrunchDuration = {
  scrunchUp: 0.2,
  scrunchDown: 0.5,
  hold: 1.0
}; 
let g_scrunchState = "none";

function scrunchSeaLemon() {
  g_seaLemonScrunched = true;
  g_seaLemonScrunchTime = g_seconds;
  g_scrunchState = "scrunchUp";
}

function setupSeaLemonClick() {
  canvas.addEventListener('click', function(ev) {
    if (ev.shiftKey) {
      const [x, y] = coordsToGL(ev);
      if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) {
        scrunchSeaLemon();
      }
    }
  });
}

function seaLemon() {
  let totalCycleTime = g_scrunchDuration.scrunchUp + g_scrunchDuration.hold + g_scrunchDuration.scrunchDown;
  
  let scrunchFactor = 0;
  if (g_seaLemonScrunched) {
    let timeSinceScrunch = g_seconds - g_seaLemonScrunchTime;
    
    if (timeSinceScrunch > totalCycleTime) {
      g_seaLemonScrunched = false;
      g_scrunchState = 'none';
    } else {
      if (timeSinceScrunch < g_scrunchDuration.scrunchUp) {
        scrunchFactor = timeSinceScrunch / g_scrunchDuration.scrunchUp;
      } else if (timeSinceScrunch < g_scrunchDuration.scrunchUp + g_scrunchDuration.hold) {
        scrunchFactor = 1.0;
      } else {
        const scrunchDownTime = timeSinceScrunch - (g_scrunchDuration.scrunchUp + g_scrunchDuration.hold);
        scrunchFactor = 1.0 - (scrunchDownTime / g_scrunchDuration.scrunchDown);
      }
    }
  }
  
  // scrunch ammount
  let heightScale = 1.0 - 0.7 * -scrunchFactor; 
  let widthScale = 1.0 + 0.6 * -scrunchFactor; 

  let offsetX = -0.2 * scrunchFactor;
  let offsetZ = -0.3 * scrunchFactor;
  
  // Base layer - wide cube
  var baseCube = new Cube();
  baseCube.color = [0.9, 0.8, 0.2, 1.0]; 
  baseCube.matrix.translate(-0.2 - offsetX/2, -0.1, -0.4 - offsetZ);
  baseCube.matrix.scale(0.8 * widthScale, 0.1 * heightScale, 1.6 * widthScale);
  baseCube.matrix.scale(0.5, 0.5, 0.5);
  baseCube.render();
  
  baseMatrix = new Matrix4(baseCube.matrix);

  // Middle layer - less wide
  var middleCube = new Cube();
  middleCube.color = [0.9, 0.75, 0.15, 1.0]; 
  middleCube.matrix = new Matrix4(baseMatrix);
  middleCube.matrix.translate(0.06, 0.5, 0.03); 
  middleCube.matrix.scale(0.7/0.8, 0.12/0.1, 1.4/1.6);  
  middleCube.render();
  
  // Top layer - dome shape
  var topCube = new Cube();
  topCube.color = [0.85, 0.7, 0.1, 1.0]; 
  topCube.matrix = new Matrix4(baseMatrix);
  topCube.matrix.translate(0.19, 0.72, 0.1);  
  topCube.matrix.scale(0.5/0.8, 0.15/0.1, 1.1/1.6); 
  topCube.render();

  // Left eye
  var leftEye = new Leaf();
  leftEye.color = [0.9, 0.8, 0.2, 1.0];
  leftEye.matrix = new Matrix4(baseMatrix);
  leftEye.matrix.translate(0.25, 2.5, 0.1);
  leftEye.matrix.scale(0.07, 0.45, 0.03); 
  leftEye.matrix.rotate(45, 0, 0, 1); 
  leftEye.matrix.scale(2,2,2);
  
  leftEye.render();
  
  // Right eye
  var rightEye = new Leaf();
  rightEye.color = [0.9, 0.8, 0.2, 1.0];
  rightEye.matrix = new Matrix4(baseMatrix);
  rightEye.matrix.translate(0.75, 2.5, 0.1); 
  rightEye.matrix.scale(0.07, 0.45, 0.03); 
  rightEye.matrix.rotate(-45, 0, 0, 1); 
  rightEye.matrix.scale(2,2,2);
  
  rightEye.render();

  // gills
  const baseGillColor = [1.0, 1.0, 0.4, 0.7];  

  function createGills(numGills, gillRadius, baseGillColor) {
    for (let i = 0; i < numGills; i++) {
      const angle = (i / numGills) * Math.PI * 2; 
      
      const x = Math.cos(angle) * gillRadius;
      const z = Math.sin(angle) * (gillRadius/2);
      
      var gill = new Leaf();
      gill.color = baseGillColor;  
      
      gill.matrix = new Matrix4(baseMatrix);
      
      gill.matrix.translate(0.5 + x, 2.5  , 0.7 + z);
      
      gill.matrix.scale(0.1, 0.7, 0.05);
      
      gill.render();
    }
  }
  createGills(12, 0.2, baseGillColor);
  createGills(6, 0.1, baseGillColor);
  
}

function sendTextToHTML(id, text) {
  document.getElementById(id).innerHTML = text;
}
