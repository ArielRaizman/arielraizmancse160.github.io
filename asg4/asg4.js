// Notes for Grader
// Used the youtube videos and the help of copilot

// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  `attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal; 
  uniform mat4  u_ModelMatrix;
  uniform mat4 u_GlobalRotationMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix* u_ViewMatrix* u_GlobalRotationMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
  }`

// Fragment shader program
var FSHADER_SOURCE =
  `precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
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
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV); 
    } else if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0); 
    }
    else {
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
let u_Sampler1;
let u_whichTexture = -1; 
let u_ViewMatrix;
let u_ProjectionMatrix;
let g_camera;
let g_seaLemons = [];
let g_normalOn = false;

// Object Pooling 
let g_kelpStem = null;
let g_kelpBranch = null;
let g_kelpLeaf = null;

let g_seaLemonParts = {
  baseCube: null,
  middleCube: null,
  topCube: null,
  leftEye: null,
  rightEye: null,
  gill: null
};

let g_tempMatrix = null;

let g_blocks = []; // Array to store placed blocks

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

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1'); // Get the storage location of u_Sampler
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }
  
  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture'); // Get the storage location of u_Sampler
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix'); // Get the storage location of u_Sampler
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return false;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix'); // Get the storage location of u_Sampler
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return false;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

}

function htmlUI() {
  document.getElementById('on').onclick = function() { g_animation = true; };
  document.getElementById('off').onclick = function() { g_animation = false; };
  document.getElementById('normalon').onclick = function() { g_normalOn = true; }
  document.getElementById('normaloff').onclick = function() { g_normalOn = false; }

  document.getElementById('eyerotation').addEventListener('mousemove', function() { g_eyeRotation = this.value; });
  document.getElementById('scrunchslide').addEventListener('mousemove', function() { g_userScrunch = this.value; });
  // document.getElementById('viewangle').addEventListener('mousemove', function() { g_globalAngle = this.value; });

}

function initTextures() {
  var image0 = new Image();
  if (!image0) {
    console.log('Failed to create the image object');
    return false;
  }
  image0.onload = function() { sendTextureToGPU(image0, 0); };
  image0.src = 'sky.jpg';
  
  var image1 = new Image();
  if (!image1) {
    console.log('Failed to create the image object');
    return false;
  }
  image1.onload = function() { sendTextureToGPU(image1, 1); };
  image1.src = 'ground.jpg';
  
  return true;
}

function sendTextureToGPU(image, textureUnit) {
  var texture = gl.createTexture(); 
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 
  
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, texture); 

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); 
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  if (textureUnit === 0) {
    gl.uniform1i(u_Sampler0, textureUnit); 
  } else if (textureUnit === 1) {
    gl.uniform1i(u_Sampler1, textureUnit); 
  }
  // Add more textures

  console.log("Texture " + textureUnit + " loaded");
  renderShapes(); // Draw the scene
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
      
      // Use camera rotation instead of global rotation variables
      if (dx !== 0) {
        g_camera.panRight(dx * 0.2);  
      }
      
      // Vertical movement controls up/down camera rotation
      if (dy !== 0) {
        g_camera.panUp(-dy * 0.2);  
      }
      
      g_lastX = ev.clientX;
      g_lastY = ev.clientY;
      
      renderShapes();
    }
  };

  // canvas.onwheel = function(ev) {
  //   ev.preventDefault(); 
    
  //   if (ev.deltaY > 0) {
  //     g_scale = Math.min(5.0, g_scale + g_zoomSpeed)
  //   } else {
  //     g_scale = Math.max(0.1, g_scale - g_zoomSpeed)
  //   }

  //   renderShapes();
  // }
}

function initObjectPool() {
  // Initialize kelp objects
  g_kelpStem = new Cube();
  g_kelpBranch = new Cube();
  g_kelpLeaf = new Leaf();
  
  // Initialize sea lemon objects
  g_seaLemonParts.baseCube = new Cube();
  g_seaLemonParts.middleCube = new Cube();
  g_seaLemonParts.topCube = new Cube();
  g_seaLemonParts.leftEye = new Leaf();
  g_seaLemonParts.rightEye = new Leaf();
  g_seaLemonParts.gill = new Leaf();
  
  // Initialize reusable matrix
  g_tempMatrix = new Matrix4();
}

// var g_map = [
//   [3,3,3,3,3,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,3,3,3,3,3,3],
//   [3,4,4,3,2,2,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,2,3,3,4,4,3,3],
//   [3,4,4,3,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,3,3,4,4,3,3],
//   [3,3,3,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,3,3,3,3,3],
//   [2,2,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,2,2,2,3,3,2],
//   [2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,1,1,2,2,2,2],
//   [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,1,1,2,2,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,1,2,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,1,2,3,2,2,1,0,0,0,[1,1],0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,1,2,2,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,1,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,3,4,3,2,1,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,3,2,1,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
//   [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
//   [2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2],
//   [2,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,2],
//   [3,2,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,2,3],
//   [3,3,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,3,3]
// ]

// function drawMap() {
//   var block = new Cube();
//   block.color = [0.4, 0.3, 0.2, 1.0];
  
//   for (let x = 0; x < g_map.length; x++) {
//     for (let y = 0; y < g_map[x].length; y++) {
//       let cellValue = g_map[x][y];
//       let height = 0;
//       let placeKelp = false;
      
//       if (Array.isArray(cellValue)) {
//         height = cellValue[0];
//         // console.log("block placed?", cellValue[0]);
//         placeKelp = cellValue[1] === 1;
//       } else {
//         height = cellValue;
//       }
      
//       if (height === 0) continue;
      
//       for (let h = 0; h < height; h++) {
//         block.matrix.setIdentity();
//         block.matrix.translate(0, -0.1 + (h * 0.3), 0); 
//         block.matrix.scale(0.3, 0.3, 0.3);
//         block.matrix.translate(x - 16, 0, y - 16); 
//         block.renderFast();
//       }
      
//       // Place kelp if specified
//       // if (placeKelp) {
//       //   // Position kelp on top of the highest block
//       //   const kelpX = (x - 16) / 3;
//       //   const kelpY = -0.1 + (height * 0.3);
//       //   const kelpZ = (y - 16) / 3;
        
//       //   kelpStalk(kelpX, kelpY, kelpZ);
//       // }
//     }
//   }
// }

// function initSeaLemons() {
//   g_seaLemons.push({
//     position: [0, 0, 0],
//     scale: 0.4,
//     rotX: 0,
//     rotY: 320,
//     rotZ: 0
//   });
  
//   g_seaLemons.push({
//     position: [3, 0, 0.5],
//     scale: 0.4,
//     rotX: 0,
//     rotY: 200,
//     rotZ: 0
//   });
//   g_seaLemons.push({
//     position: [-3, 0.3, 3.5],
//     scale: 0.4,
//     rotX: 0,
//     rotY: 200,
//     rotZ: 0
//   });

//   g_seaLemons.push({
//     position: [-2.5, 0, -3.5],
//     scale: 0.4,
//     rotX: 0,
//     rotY: 260,
//     rotZ: 0
//   });
//   sendTextToHTML("seaLemonCount", "Sea Lemons Left: " + (g_seaLemons.length));
// }

function main() {

  setupWebGL();
  connectVariablesToGLSL();

  htmlUI();

  mouseNavigation();
  setupSeaLemonClick(); 
  g_camera = new Camera(canvas);
  setupKeyboardControls(); 
  initObjectPool();
  // initSeaLemons();
  initTextures(); 
  
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.FRONT);
  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
  // Clear <canvas>
  // renderShapes();
  requestAnimationFrame(tick);
}

var g_shapes = []; 

function coordsToGL(ev) {
  var x = ev.clientX;
  var y = ev.clientY; 
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return [x, y];
} 

g_startTime = performance.now() / 1000.0;
g_seconds = performance.now() / 1000.0 - g_startTime;

let g_wasAnimating = true; 

function tick() {
  // let startTime = performance.now()
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
  
  g_camera.update();
  // checkSeaLemonCollisions();

  renderShapes();
  // var duration = performance.now() - startTime;
  // sendTextToHTML("perf", "fpaaas " + 100/duration);
  requestAnimationFrame(tick);
}

function updateAnimationAngle() {
  if (g_animation) {
    const sinValue = Math.sin(g_seconds);
    const cosValue = Math.cos(g_seconds);
    g_jointSlider = 45*sinValue;
    g_purpleJoint = 45*cosValue;
  }
}

var g_eye = [0, 0, -2]
var g_at = [0, 0, 0]
var g_up = [0, 1, 0]

function renderShapes() { 
  // let startTime = performance.now()

  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.getProjectionMatrix().elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.getViewMatrix().elements);

  var globalRotMat = new Matrix4()
    .scale(g_scale, g_scale, g_scale) 
    .rotate(g_verticalAngle, 1, 0, 0) 
    .rotate(g_globalAngle, 0, 1, 0); 
  
  gl.uniformMatrix4fv(u_GlobalRotationMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

  
  // drawMap();
  // drawBlocks();
  // kelpStalk(-3,-0.2,4);
  // kelpStalk(-13,-0.2,-6);
  // kelpStalk(15,0.8,10);
  // drawSeaLemons();
  // seaLemon()

  var ground = new Cube();
  ground.textureNum = 1;
  if (g_normalOn) { ground.textureNum = -3; }
  ground.color = [0.2, 0.2, 0.2, 1.0];
  ground.matrix.translate(0, -0.101, 0);
  ground.matrix.scale(3, 0, 3);
  ground.matrix.translate(-.5,0,-0.5);
  ground.renderFast();
  renderSky();

  var cube = new Cube();
  cube.color = [0.2, 0.2, 0.2, 1.0];
  cube.textureNum = 0;
  if (g_normalOn) { cube.textureNum = -3; }
  cube.matrix.setIdentity();
  cube.matrix.translate(0, 0, 0);
  cube.matrix.scale(0.3, 0.3, 0.3);
  cube.matrix.translate(-0.5, -0.5, -0.5); // Center the cube
  cube.renderFast();
}

function drawSeaLemons() {
  for (let i = 0; i < g_seaLemons.length; i++) {
    const lemon = g_seaLemons[i];
    seaLemon(
      lemon.position[0], 
      lemon.position[1], 
      lemon.position[2], 
      lemon.scale,
      lemon.rotX,
      lemon.rotY,
      lemon.rotZ
    );
  }
}

function renderSky() {
  gl.depthMask(false);
  let oldCullFace = gl.getParameter(gl.CULL_FACE_MODE);
  gl.cullFace(gl.FRONT);
  
  var skyMatrix = new Matrix4(g_camera.getViewMatrix());
  skyMatrix.elements[12] = 0;
  skyMatrix.elements[13] = 0;
  skyMatrix.elements[14] = 0;
  
  var sky = new Cube();
  sky.textureNum = 0; 
  if (g_normalOn) { sky.textureNum = -3; }
  sky.matrix.scale(-50, -50, -50);
  sky.matrix.translate(-.5,-.5,-0.5);

  gl.uniformMatrix4fv(u_ViewMatrix, false, skyMatrix.elements);
  sky.renderFast();
  
  gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.getViewMatrix().elements);
  
  gl.depthMask(true);
  gl.cullFace(oldCullFace);
}

function setupKeyboardControls() {
  document.addEventListener('keydown', function(event) {
    const key = event.key.toLowerCase();
    const speed = 0.1; 
    
    switch(key) {
      case 'w': g_camera.moveForward(speed); break;
      case 's': g_camera.moveBackward(speed); break;
      case 'a': g_camera.moveLeft(speed); break;
      case 'd': g_camera.moveRight(speed); break;
      case 'q': g_camera.panLeft(2.0); break;  
      case 'e': g_camera.panRight(2.0); break;
      case ' ': g_camera.moveUp(speed); break; 
      case 'shift': g_camera.moveDown(speed); break; // Added shift key for down movement
      
      case '1':
        const cameraPos = g_camera.eye;
        const forward = new Vector3();
        forward.set(g_camera.at);
        forward.sub(g_camera.eye);
        forward.normalize();
        
        const placePos = new Vector3();
        placePos.set(forward);
        placePos.mul(0.5);
        placePos.add(cameraPos);
        
        g_blocks.push({
          position: [placePos.elements[0], placePos.elements[1], placePos.elements[2]],
          size: 0.3, 
          color: [0.6, 0.6, 0.6, 1.0] 
        });
        
        console.log("Placed block at", placePos.elements);
        break;
        
      case '2':
        const camPos = g_camera.eye;
        const camForward = new Vector3();
        camForward.set(g_camera.at);
        camForward.sub(g_camera.eye);
        camForward.normalize();
        
        let closestBlock = -1;
        let closestDistance = 5.0;
        
        for (let i = 0; i < g_blocks.length; i++) {
          const blockPos = g_blocks[i].position;
          const blockSize = g_blocks[i].size;
          
          const blockVec = new Vector3([
            blockPos[0] - camPos.elements[0],
            blockPos[1] - camPos.elements[1],
            blockPos[2] - camPos.elements[2]
          ]);
          
          const distance = blockVec.magnitude();
          
          blockVec.normalize();
          
          const dotProduct = blockVec.elements[0] * camForward.elements[0] +
                            blockVec.elements[1] * camForward.elements[1] +
                            blockVec.elements[2] * camForward.elements[2];
          
          if (dotProduct > 0.7 && distance < closestDistance) {
            closestDistance = distance;
            closestBlock = i;
          }
        }
        
        if (closestBlock !== -1) {
          console.log("Breaking block at", g_blocks[closestBlock].position);
          g_blocks.splice(closestBlock, 1);
        }
        break;
    }
    
    if (['w','a','s','d','q','e','1','2',' ','shift'].includes(key)) {
      renderShapes();
    }
  });
}

function drawBlocks() {
  var block = new Cube();
  
  for (let i = 0; i < g_blocks.length; i++) {
    const blockData = g_blocks[i];
    
    block.matrix.setIdentity();
    block.color = blockData.color;
    block.matrix.translate(blockData.position[0], blockData.position[1], blockData.position[2]);
    block.matrix.scale(blockData.size, blockData.size, blockData.size);
    block.matrix.translate(-0.5, -0.5, -0.5); // Center the block
    block.renderFast();
  }
}

function kelpSection(x,y,z,stemToggle) {
  g_kelpStem.matrix.setIdentity();
  
  // Main stem
  g_kelpStem.color = [0.2, 0.5, 0.0, 1.0];
  g_kelpStem.matrix.translate(-0.075, -.25, -0.075);
  g_kelpStem.matrix.scale(0.15, 0.5, 0.15);
  g_kelpStem.matrix.translate(x,y,z);
  g_kelpStem.matrix.scale(0.5, 0.5, 0.5);
  
  g_tempMatrix.set(g_kelpStem.matrix);
  g_kelpStem.renderFast();

  // 3 branches with leaves
  const leafSpacing = 0.15; 
  const leafStartY = -0.15; 
  
  if (stemToggle) {
    for (let i = 0; i < 3; i++) {
      const yPos = (leafStartY + i * leafSpacing + 0.25) / 0.5;
      
      // Reset branch matrix
      g_kelpBranch.matrix.set(g_tempMatrix);
      g_kelpBranch.color = [0.2, 0.6, 0.0, 1.0];
      g_kelpBranch.matrix.translate(1.5, yPos, 0.5);

      const branchAngle = 15 * Math.sin(g_seconds * 1.3 + i * 0.5);
      g_kelpBranch.matrix.rotate(branchAngle, 0, 1, 0);
      g_kelpBranch.matrix.rotate(90, 0, 0, 1);

      g_kelpBranch.matrix.scale(0.1, 0.8, 0.4);
      g_kelpBranch.matrix.translate(0, -0.2, -0.5); 
      
      // Save branch matrix for leaf
      // var branchMatrix = new Matrix4(g_kelpBranch.matrix);
      // g_kelpLeaf.matrix.set(g_kelpBranch.matrix);
      g_kelpBranch.renderFast();
      
      // Reset leaf matrix
      g_kelpLeaf.matrix.set(g_kelpBranch.matrix);
      g_kelpLeaf.color = [0.0, 0.7, 0.0, 1.0];
      g_kelpLeaf.matrix.translate(0, -2, 0); 
      g_kelpLeaf.matrix.translate(0.5, 1.5, 0.5);

      const leafAngle = 10 * Math.sin(g_seconds * 1.8 + i * 0.7);
      g_kelpLeaf.matrix.rotate(leafAngle, 0, 0, 1);
      g_kelpLeaf.matrix.rotate(8 * Math.cos(g_seconds * 1.2 + i * 0.3), 1, 0, 0);
      g_kelpLeaf.matrix.scale(2.0, 1.5, 1.0);
      
      g_kelpLeaf.renderFast();
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

function seaLemon(x = 0, y = 0, z = 0, scale = 1.0, rotX = 0, rotY = 0, rotZ = 0) {
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
  
  let baseMatrix = new Matrix4();
  baseMatrix.translate(x, y, z);
  baseMatrix.rotate(rotX, 1, 0, 0);
  baseMatrix.rotate(rotY, 0, 1, 0);
  baseMatrix.rotate(rotZ, 0, 0, 1);
  baseMatrix.scale(scale, scale, scale);
  
  // base layer
  g_seaLemonParts.baseCube.matrix.setIdentity();
  g_seaLemonParts.baseCube.matrix.multiply(baseMatrix);
  g_seaLemonParts.baseCube.textureNum = -2;
  g_seaLemonParts.baseCube.color = [0.9, 0.8, 0.2, 1.0]; 
  g_seaLemonParts.baseCube.matrix.translate(-0.2 - offsetX/2, -0.1, -0.4 - offsetZ);
  g_seaLemonParts.baseCube.matrix.translate(0, 0, 0.8 * (1 - breatheScaleZ) * widthScale/2);
  g_seaLemonParts.baseCube.matrix.scale(0.8 * widthScale, 0.1 * heightScale, 1.6 * widthScale * breatheScaleZ);
  g_seaLemonParts.baseCube.matrix.scale(0.5, 0.5, 0.5);
  g_seaLemonParts.baseCube.renderFast();
  
  g_tempMatrix.set(g_seaLemonParts.baseCube.matrix);

  // mid layer
  g_seaLemonParts.middleCube.matrix.set(g_tempMatrix);
  g_seaLemonParts.middleCube.color = [0.9, 0.75, 0.15, 1.0]; 
  g_seaLemonParts.middleCube.matrix.translate(0.06, 0.5, 0.03); 
  g_seaLemonParts.middleCube.matrix.scale(0.7/0.8, (0.12/0.1) * breatheScaleY, 1.4/1.6);  
  g_seaLemonParts.middleCube.renderFast();
  
  // top layer
  g_seaLemonParts.topCube.color = [0.85, 0.7, 0.1, 1.0]; 
  g_seaLemonParts.topCube.matrix.set(g_tempMatrix);
  g_seaLemonParts.topCube.matrix.translate(0.19, 0.72, 0.1);  
  g_seaLemonParts.topCube.matrix.scale(0.5/0.8, (0.15/0.1) * breatheScaleY, 1.1/1.6); 
  g_seaLemonParts.topCube.renderFast();

  // Left eye
  g_seaLemonParts.leftEye.color = [0.9, 0.8, 0.2, 1.0];
  g_seaLemonParts.leftEye.matrix.set(g_tempMatrix);
  g_seaLemonParts.leftEye.matrix.translate(0.25, 2.5, 0.1);
  g_seaLemonParts.leftEye.matrix.scale(0.07, 0.45, 0.03); 
  g_seaLemonParts.leftEye.matrix.rotate(-g_eyeRotation, 0, 0, 1); 
  g_seaLemonParts.leftEye.matrix.scale(2,2,2);
  
  g_seaLemonParts.leftEye.renderFast();
  
  // Right eye
  g_seaLemonParts.rightEye.color = [0.9, 0.8, 0.2, 1.0];
  g_seaLemonParts.rightEye.matrix.set(g_tempMatrix);
  g_seaLemonParts.rightEye.matrix.translate(0.75, 2.5, 0.1); 
  g_seaLemonParts.rightEye.matrix.scale(0.07, 0.45, 0.03); 
  g_seaLemonParts.rightEye.matrix.rotate(g_eyeRotation, 0, 0, 1); 
  g_seaLemonParts.rightEye.matrix.scale(2,2,2);
  
  g_seaLemonParts.rightEye.renderFast();

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
      
      g_seaLemonParts.gill.color = baseGillColor;  
      
      g_seaLemonParts.gill.matrix.set(g_tempMatrix);
      
      g_seaLemonParts.gill.matrix.translate(0.5 + x, 2.5, 0.7 + z);
      
      g_seaLemonParts.gill.matrix.scale(0.1 * breatheFactor, 0.7 * breatheFactor, 0.05 * breatheFactor);
      
      g_seaLemonParts.gill.renderFast();
    }
  }
  createGills(12, 0.2, baseGillColor);
  createGills(6, 0.1, baseGillColor);
}

function sendTextToHTML(id, text) {
  document.getElementById(id).innerHTML = text;
}

function checkSeaLemonCollisions() {
  const cameraPos = g_camera.eye;
  const collisionDistance = 0.6; 
  
  for (let i = g_seaLemons.length - 1; i >= 0; i--) {
    const lemon = g_seaLemons[i];
    
    const dx = cameraPos.elements[0] - lemon.position[0];
    const dy = cameraPos.elements[1] - lemon.position[1];
    const dz = cameraPos.elements[2] - lemon.position[2];
    
    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    if (distance < collisionDistance) {
      console.log("Touched a sea lemon! Removing it.");
      
      g_seaLemons.splice(i, 1);
      sendTextToHTML("seaLemonCount", "Sea Lemons Left: " + (g_seaLemons.length));
    }
  }
}
