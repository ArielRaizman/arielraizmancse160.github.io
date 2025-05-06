// Notes for Grader
// Used the youtube videos and the help of copilot

// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  `attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4  u_ModelMatrix;
  uniform mat4 u_GlobalRotationMatrix;
  void main() {
    gl_Position = u_GlobalRotationMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE =
  `precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform int u_whichTexture;
  void main() {
    // gl_FragColor = u_FragColor;
    // gl_FragColor = vec4(v_UV,1,1);
    // gl_FragColor = texture2D(u_Sampler0, v_UV);
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1,1);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else {
      gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);
    }
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
let g_eyeRotation = -45;
let g_userScrunch = 0.0;
let a_uv; 
let u_Sampler0;
let u_whichTexture = -1; 

let g_cameraPos = [0.0, 1.0, 5.0]; // x, y, z
let g_cameraFront = [0.0, 0.0, -1.0]; // Direction vector
let g_cameraUp = [0.0, 1.0, 0.0]; // Up vector
let g_cameraSpeed = 0.1; // Movement speed
let g_yaw = -90.0; // Horizontal rotation (in degrees)
let g_pitch = 0.0; // Vertical rotation (in degrees)
let g_mouseSensitivity = 0.1;
let g_firstMouse = true; // Flag for initial mouse position

const glMatrix = {
  toRadian: function(a) { return a * Math.PI / 180.0; }
};

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

  // get the storage location of a_UV
  a_uv = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_uv < 0) {
    console.log('Failed to get the storage location of a_UV');
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
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0'); // Get the storage location of u_Sampler
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }
  
  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture'); // Get the storage location of u_Sampler
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }
}

function htmlUI() {
  document.getElementById('on').onclick = function() { g_animation = true; };
  document.getElementById('off').onclick = function() { g_animation = false; };

  document.getElementById('eyerotation').addEventListener('mousemove', function() { g_eyeRotation = this.value; });
  document.getElementById('scrunchslide').addEventListener('mousemove', function() { g_userScrunch = this.value; });
  document.getElementById('viewangle').addEventListener('mousemove', function() { g_globalAngle = this.value; });

}

function initTextures() {
  var image = new Image(); // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }

  image.onload = function() { sendTextureToTEXTURE0(image); }; // Register the event handler to be called on loading an image
  image.src = 'sky.jpg'; // Specify the image to be loaded
  //add more textures here
  return true;
}

function sendTextureToTEXTURE0(image) {
  var texture = gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  gl.activeTexture(gl.TEXTURE0); // Activate texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the texture object to the target

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR  ); // Set texture parameters
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image); // Specify the color format and type of the pixel data
  
  gl.uniform1i(u_Sampler0, 0); // Pass the texture unit to u_Sampler

  // renderShapes(); // Draw the scene
  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear <canvas>

  console.log("Texture loaded");
  renderShapes(); // Draw the scene

}

function mouseNavigation() {
  canvas.addEventListener('mousedown', function() {
    document.body.requestPointerLock = document.body.requestPointerLock || 
                                      document.body.mozRequestPointerLock || 
                                      document.body.webkitRequestPointerLock;
    document.body.requestPointerLock();
    g_isDragging = true;
  });
  
  document.addEventListener('pointerlockchange', lockChangeAlert, false);
  document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
  document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);
  
  function lockChangeAlert() {
    if (document.pointerLockElement === canvas || 
        document.mozPointerLockElement === canvas || 
        document.webkitPointerLockElement === canvas) {
      // Pointer is locked
      document.addEventListener('mousemove', updateCamera, false);
    } else {
      // Pointer is unlocked
      document.removeEventListener('mousemove', updateCamera, false);
      g_isDragging = false;
    }
  }
  
  function updateCamera(e) {
    if (!g_isDragging) return;
    
    // Get mouse movement
    const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
    const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
    
    // Update camera angles
    g_yaw += movementX * g_mouseSensitivity;
    g_pitch -= movementY * g_mouseSensitivity;
    
    // Limit pitch to avoid camera flipping
    g_pitch = Math.max(Math.min(g_pitch, 89), -89);
    
    // Calculate new camera front vector
    const frontX = Math.cos(glMatrix.toRadian(g_yaw)) * Math.cos(glMatrix.toRadian(g_pitch));
    const frontY = Math.sin(glMatrix.toRadian(g_pitch));
    const frontZ = Math.sin(glMatrix.toRadian(g_yaw)) * Math.cos(glMatrix.toRadian(g_pitch));
    
    g_cameraFront = normalize3D([frontX, frontY, frontZ]);
    
    renderShapes();
  }

  // Keep zoom functionality
  canvas.onwheel = function(ev) {
    ev.preventDefault(); 
    
    if (ev.deltaY > 0) {
      g_cameraSpeed = Math.max(0.05, g_cameraSpeed - 0.01);
    } else {
      g_cameraSpeed = Math.min(0.5, g_cameraSpeed + 0.01);
    }
  };
}

function setupKeyboardControls() {
  document.addEventListener('keydown', function(event) {
    const key = event.key.toLowerCase();
    
    // Calculate speed based on frame time
    const speed = g_cameraSpeed;
    
    // Handle WASD keys
    if (key === 'w') { // Forward
      // Move in the direction the camera is facing
      g_cameraPos[0] += g_cameraFront[0] * speed;
      g_cameraPos[1] += g_cameraFront[1] * speed;
      g_cameraPos[2] += g_cameraFront[2] * speed;
    }
    if (key === 's') { // Backward
      g_cameraPos[0] -= g_cameraFront[0] * speed;
      g_cameraPos[1] -= g_cameraFront[1] * speed;
      g_cameraPos[2] -= g_cameraFront[2] * speed;
    }
    if (key === 'a') { // Left
      // Move left (cross product of up and front to get right, then negate)
      const right = normalize3D(cross3D(g_cameraFront, g_cameraUp));
      g_cameraPos[0] -= right[0] * speed;
      g_cameraPos[2] -= right[2] * speed;
    }
    if (key === 'd') { // Right
      const right = normalize3D(cross3D(g_cameraFront, g_cameraUp));
      g_cameraPos[0] += right[0] * speed;
      g_cameraPos[2] += right[2] * speed;
    }
    
    renderShapes(); // Update the scene
  });
}

function normalize3D(v) {
  let length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  return [v[0] / length, v[1] / length, v[2] / length];
}

function cross3D(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function main() {

  setupWebGL();
  connectVariablesToGLSL();

  htmlUI();

  mouseNavigation();
  setupKeyboardControls();
  setupSeaLemonClick(); // Add this to register the click handler
  initTextures(); // Initialize textures
  
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.enable(gl.DEPTH_TEST);

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

let g_wasAnimating = true; 

function tick() {
  let startTime = performance.now()
  if (g_animation) {
    if (!g_wasAnimating) {
      g_startTime = performance.now() / 1000.0 - g_seconds;
      g_wasAnimating = true;
    }
    g_seconds = performance.now() / 1000.0 - g_startTime;
  } else {
    g_wasAnimating = false;
  }

  updateAnimationAngle();

  renderShapes();
  var duration = performance.now() - startTime;
  sendTextToHTML("perf", "fpaaas " + 100/duration);
  requestAnimationFrame(tick);
  
}

function updateAnimationAngle() {
  if (g_animation) {
    g_jointSlider = 45*Math.sin(g_seconds);
    g_purpleJoint = 45*Math.cos(g_seconds);
  }
}

function renderShapes() { 
  // Create view matrix for first-person camera
  var viewMatrix = new Matrix4();
  viewMatrix.setLookAt(
    g_cameraPos[0], g_cameraPos[1], g_cameraPos[2],  // Camera position
    g_cameraPos[0] + g_cameraFront[0], g_cameraPos[1] + g_cameraFront[1], g_cameraPos[2] + g_cameraFront[2],  // Look at point
    g_cameraUp[0], g_cameraUp[1], g_cameraUp[2]  // Up vector
  );
  
  // Replace the global rotation matrix with our view matrix
  gl.uniformMatrix4fv(u_GlobalRotationMatrix, false, viewMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

  kelpStalk(-3,-0.2,4);
  kelpStalk(-2,-0.2,-3);
  kelpStalk(4,-0.2,0);
  seaLemon();
}

function kelpSection(x,y,z,stemToggle) {

  // Main stem
  var stem = new Cube();
  stem.color = [0.2, 0.5, 0.0, 1.0];
  stem.matrix.translate(-0.075, -.25  , -0.075);
  stem.matrix.scale(0.15, 0.5, 0.15);
  stem.matrix.translate(x,y,z)
  stem.matrix.scale(0.5, 0.5, 0.5);
  stemMatrix = new Matrix4(stem.matrix);
  stem.render();

  // 3 branches with leaves
  const leafSpacing = 0.15; 
  const leafStartY = -0.15; 
  
  if (stemToggle) {
    for (let i = 0; i < 3; i++) {
      const yPos = (leafStartY + i * leafSpacing + 0.25) / 0.5;
      
      //  branch
      var branch = new Cube();
      branch.color = [0.2, 0.6, 0.0, 1.0];
      branch.matrix = new Matrix4(stemMatrix);
      branch.matrix.translate(1.5, yPos, 0.5);

      const branchAngle = 15 * Math.sin(g_seconds * 1.3 + i * 0.5);
      branch.matrix.rotate(branchAngle, 0, 1, 0);
      branch.matrix.rotate(90, 0, 0, 1);

      branch.matrix.scale(0.1, 0.8, 0.4);
      branch.matrix.translate(0, -0.2, -0.5); 
      var branchMatrix = new Matrix4(branch.matrix);
      branch.render();
      
      // Leaf
      var leaf = new Leaf();
      leaf.color = [0.0, 0.7, 0.0, 1.0];
      leaf.matrix = new Matrix4(branchMatrix);
      leaf.matrix.translate(0, -2, 0); 
      // leaf.matrix.scale(0.3  , 0.8, 0.3); 
      
      leaf.matrix.translate(0.5,1.5, 0.5);

      const leafAngle = 10 * Math.sin(g_seconds * 1.8 + i * 0.7);
      leaf.matrix.rotate(leafAngle, 0, 0, 1);
      leaf.matrix.rotate(8 * Math.cos(g_seconds * 1.2 + i * 0.3), 1, 0, 0);
      leaf.matrix.scale(2.0, 1.5, 1.0);
      
      leaf.render();
    }
  }
}

function kelpStalk(x,y,z) {
  var numSections = 6; 
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
  
  // shift click scrunching
  let animationScrunchFactor = 0;
  if (g_seaLemonScrunched) {
    let timeSinceScrunch = g_seconds - g_seaLemonScrunchTime;
    
    if (timeSinceScrunch > totalCycleTime) {
      g_seaLemonScrunched = false;
      g_scrunchState = 'none';
    } else {
      if (timeSinceScrunch < g_scrunchDuration.scrunchUp) {
        animationScrunchFactor = timeSinceScrunch / g_scrunchDuration.scrunchUp;
      } else if (timeSinceScrunch < g_scrunchDuration.scrunchUp + g_scrunchDuration.hold) {
        animationScrunchFactor = 1.0;
      } else {
        const scrunchDownTime = timeSinceScrunch - (g_scrunchDuration.scrunchUp + g_scrunchDuration.hold);
        animationScrunchFactor = 1.0 - (scrunchDownTime / g_scrunchDuration.scrunchDown);
      }
    }
  }
  
  // relative to slider scrunch
  let scrunchFactor = g_userScrunch/100 + animationScrunchFactor;
  
  const idleAnimationSpeed = 2; 
  const idleAnimationAmount = 0.05; 
  const idleFactor = Math.sin(g_seconds * idleAnimationSpeed) * idleAnimationAmount;
  
  const heightIdleFactor = Math.sin(g_seconds * idleAnimationSpeed + 0.5) * 2* idleAnimationAmount;
  const breatheScaleY = 1.0 + heightIdleFactor;
  
  const breatheScaleZ = 1.0 + idleFactor;
  
  let heightScale = (1.0 - 0.7 * -scrunchFactor) * breatheScaleY; 
  let widthScale = 1.0 + 0.6 * -scrunchFactor; 
  
  let offsetX = -0.2 * scrunchFactor;
  let offsetZ = -0.3 * scrunchFactor;
  
  // base layer 
  var baseCube = new Cube();
  baseCube.textureNum = 0;
  baseCube.color = [0.9, 0.8, 0.2, 1.0]; 
  baseCube.matrix.translate(-0.2 - offsetX/2, -0.1, -0.4 - offsetZ);
  baseCube.matrix.translate(0, 0, 0.8 * (1 - breatheScaleZ) * widthScale/2);
  baseCube.matrix.scale(0.8 * widthScale, 0.1 * heightScale, 1.6 * widthScale * breatheScaleZ);
  baseCube.matrix.scale(0.5, 0.5, 0.5);
  baseCube.render();
  
  baseMatrix = new Matrix4(baseCube.matrix);

  // mid layer
  var middleCube = new Cube();
  middleCube.color = [0.9, 0.75, 0.15, 1.0]; 
  middleCube.matrix = new Matrix4(baseMatrix);
  middleCube.matrix.translate(0.06, 0.5, 0.03); 
  middleCube.matrix.scale(0.7/0.8, (0.12/0.1) * breatheScaleY, 1.4/1.6);  
  middleCube.render();
  
  // top layer
  var topCube = new Cube();
  topCube.color = [0.85, 0.7, 0.1, 1.0]; 
  topCube.matrix = new Matrix4(baseMatrix);
  topCube.matrix.translate(0.19, 0.72, 0.1);  
  topCube.matrix.scale(0.5/0.8, (0.15/0.1) * breatheScaleY, 1.1/1.6); 
  topCube.render();

  // Left eye
  var leftEye = new Leaf();
  leftEye.color = [0.9, 0.8, 0.2, 1.0];
  leftEye.matrix = new Matrix4(baseMatrix);
  leftEye.matrix.translate(0.25, 2.5, 0.1);
  leftEye.matrix.scale(0.07, 0.45, 0.03); 
  leftEye.matrix.rotate(-g_eyeRotation, 0, 0, 1); 
  leftEye.matrix.scale(2,2,2);
  
  leftEye.render();
  
  // Right eye
  var rightEye = new Leaf();
  rightEye.color = [0.9, 0.8, 0.2, 1.0];
  rightEye.matrix = new Matrix4(baseMatrix);
  rightEye.matrix.translate(0.75, 2.5, 0.1); 
  rightEye.matrix.scale(0.07, 0.45, 0.03); 
  rightEye.matrix.rotate(g_eyeRotation, 0, 0, 1); 
  rightEye.matrix.scale(2,2,2);
  
  rightEye.render();

  // gills
  const baseGillColor = [1.0, 1.0, 0.4, 0.7];  

  function createGills(numGills, gillRadius, baseGillColor) {
    for (let i = 0; i < numGills; i++) {
      const angle = (i / numGills) * Math.PI * 2; 
      
      // animation offset
      const phaseOffset = i * 0.2;
      const breatheFactor = 1.0 + idleAnimationAmount * Math.sin(2 * g_seconds * idleAnimationSpeed + phaseOffset);
      
      const x = Math.cos(angle) * gillRadius;
      const z = Math.sin(angle) * (gillRadius/2);
      
      var gill = new Leaf();
      gill.color = baseGillColor;  
      
      gill.matrix = new Matrix4(baseMatrix);
      
      gill.matrix.translate(0.5 + x, 2.5, 0.7 + z);
      
      gill.matrix.scale(0.1 * breatheFactor, 0.7 * breatheFactor, 0.05 * breatheFactor);
      
      gill.render();
    }
  }
  createGills(12, 0.2, baseGillColor);
  createGills(6, 0.1, baseGillColor);
}

function sendTextToHTML(id, text) {
  document.getElementById(id).innerHTML = text;
}
