import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const scene = new THREE.Scene();

const skyboxLoader = new THREE.CubeTextureLoader();
const skyboxTexture = skyboxLoader.load([
  'sky.jpg', 
  'sky.jpg', 
  'sky.jpg', 
  'sky.jpg', 
  'sky.jpg', 
  'sky.jpg'  
]);
scene.background = skyboxTexture;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 1.6; 

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, document.body);

const instructions = document.createElement('div');
instructions.style.position = 'absolute';
instructions.style.top = '50%';
instructions.style.left = '50%';
instructions.style.transform = 'translate(-50%, -50%)';
instructions.style.color = 'white';
instructions.style.backgroundColor = 'rgba(0,0,0,0.5)';
instructions.style.padding = '20px';
instructions.style.borderRadius = '5px';
instructions.style.textAlign = 'center';
instructions.style.width = '100%';
instructions.style.maxWidth = '400px';
instructions.innerHTML = 'Notes for Grader: <br/><br/> The very simple game is just to collect all 20 fishing weights. <br/><br/>The fishing weights are textured (you have to look closely but they have a metal texture) primitive shapes, pyramids, cubes and cylinders. And they all emit colored lights.<br/><br/>The textured model is the fossils around the floor.<br/><br/>The 3 light sources are ambient light coming from the caustics, a spot light from the top simulating the sun shining into the ocean, and the lights from the weights. <br/><br/>Click to play<br><br>WASD = Move<br>Space = Up<br>Shift = Down<br>Mouse = Look<br>ESC = Pause';
document.body.appendChild(instructions);

instructions.addEventListener('click', function() {
  controls.lock();
});

controls.addEventListener('lock', function() {
  instructions.style.display = 'none';
});

controls.addEventListener('unlock', function() {
  instructions.style.display = 'block';
});

const moveSpeed = 0.2;
const moveState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  up: false,
  down: false
};

document.addEventListener('keydown', function(event) {
  switch (event.code) {
    case 'KeyW': moveState.forward = true; break;
    case 'KeyA': moveState.left = true; break;
    case 'KeyS': moveState.backward = true; break;
    case 'KeyD': moveState.right = true; break;
    case 'Space': moveState.up = true; break;
    case 'ShiftLeft': 
    case 'ShiftRight': moveState.down = true; break;
  }
});

document.addEventListener('keyup', function(event) {
  switch (event.code) {
    case 'KeyW': moveState.forward = false; break;
    case 'KeyA': moveState.left = false; break;
    case 'KeyS': moveState.backward = false; break;
    case 'KeyD': moveState.right = false; break;
    case 'Space': moveState.up = false; break;
    case 'ShiftLeft':
    case 'ShiftRight': moveState.down = false; break;
  }
});

const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader(); 


const ambientLight = new THREE.AmbientLight(0xffffff, 0.15); 
scene.add(ambientLight);

const causticsAmbient = new THREE.AmbientLight(0x0a1a28, 0.25); 
scene.add(causticsAmbient);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const causticsLight = new THREE.DirectionalLight(0xffffff, 2.0); 
causticsLight.position.set(0, 10, 0);
scene.add(causticsLight);

const causticsSize = 30;
let waterTime = 0;

const causticTexture = textureLoader.load(`caustics.jpg`);
causticTexture.wrapS = THREE.RepeatWrapping;
causticTexture.wrapT = THREE.RepeatWrapping;

causticTexture.repeat.set(3, 3);

const oceanFloorTexture = textureLoader.load('placeholder');
oceanFloorTexture.wrapS = THREE.RepeatWrapping;
oceanFloorTexture.wrapT = THREE.RepeatWrapping;
oceanFloorTexture.repeat.set(8, 8);

const oceanFloorMaterial = new THREE.MeshPhongMaterial({
  map: oceanFloorTexture,
  color: 0x7c879d,  
  shininess: 10,
  specular: 0x666666
});

const oceanFloor = new THREE.Mesh(
  new THREE.PlaneGeometry(causticsSize, causticsSize),
  oceanFloorMaterial
);
oceanFloor.scale.set(3, 3, 3); 
oceanFloor.rotation.x = -Math.PI / 2;
oceanFloor.position.y = -1;
oceanFloor.receiveShadow = true;
scene.add(oceanFloor);

const createWalls = () => {
  const actualFloorSize = causticsSize * 3;
  const wallHeight = 4;  
  const wallThickness = 1;
  const halfSize = actualFloorSize / 2;
  
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a5e7c,  
    roughness: 0.7,
    metalness: 0.3
  });
  
  const walls = [
    new THREE.Mesh(
      new THREE.BoxGeometry(actualFloorSize + wallThickness*2, wallHeight, wallThickness),
      wallMaterial
    ),
    new THREE.Mesh(
      new THREE.BoxGeometry(actualFloorSize + wallThickness*2, wallHeight, wallThickness),
      wallMaterial
    ),
    new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, actualFloorSize),
      wallMaterial
    ),
    new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, actualFloorSize),
      wallMaterial
    )
  ];
  
  walls[0].position.set(0, wallHeight/2 - 1, -halfSize - wallThickness/2); 
  walls[1].position.set(0, wallHeight/2 - 1, halfSize + wallThickness/2);  
  walls[2].position.set(halfSize + wallThickness/2, wallHeight/2 - 1, 0); 
  walls[3].position.set(-halfSize - wallThickness/2, wallHeight/2 - 1, 0); 
  
  walls.forEach(wall => {
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);
  });
  
  return walls;
};

const walls = createWalls();

const createCausticsPlane = (scale, speed, opacity, heightOffset = 0) => {
  const material = new THREE.MeshBasicMaterial({
    map: causticTexture,
    transparent: true,
    opacity: opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,  
    depthTest: true     
  });
  
  material.userData = { 
    speedX: speed.x, 
    speedY: speed.y,
    rotationSpeed: speed.rotation
  };
  
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(causticsSize * scale, causticsSize * scale),
    material
  );
  
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.99 + heightOffset; 
  return plane;
};

let causticsPlane1, causticsPlane2, causticsPlane3;

if (causticsPlane1) scene.remove(causticsPlane1);
if (causticsPlane2) scene.remove(causticsPlane2);
if (causticsPlane3) scene.remove(causticsPlane3);

causticsPlane1 = createCausticsPlane(5.0, {x: 0.00010, y: 0.00014, rotation: 0.0002}, 0.4, 0.04);
causticsPlane2 = createCausticsPlane(5.2, {x: -0.00012, y: -0.00008, rotation: -0.0003}, 0.3, 0.08);
causticsPlane3 = createCausticsPlane(4.7, {x: 0.00018, y: -0.00016, rotation: 0.0004}, 0.5, 0.12);

scene.add(causticsPlane1);
scene.add(causticsPlane2);
scene.add(causticsPlane3);

oceanFloor.renderOrder = 0;
causticsPlane1.renderOrder = 1;
causticsPlane2.renderOrder = 2;
causticsPlane3.renderOrder = 3;

scene.background = skyboxTexture;
scene.fog = null; 

function createUnderwaterEnvironment() {
  const underwaterElements = new THREE.Group();
  const floorSize = causticsSize * 3; 
  const halfSize = floorSize / 2;
  const margin = 5; 
  
  function getRandomPosition() {
    return {
      x: Math.random() * (floorSize - margin*2) - (halfSize - margin),
      y: -1, 
      z: Math.random() * (floorSize - margin*2) - (halfSize - margin)
    };
  }
  
  const modelConfigs = [
    { 
      file: 'Coral.glb', 
      count: 30, 
      scale: [1.0, 1.0, 1.0],
      yOffset: 1,
      randomScale: 0.5, 
      randomRotation: true
    },
    { 
      file: 'Kelp.glb', 
      count: 25, 
      scale: [1.0, 1.0, 1.0],
      yOffset: 1,
      randomScale: 0.4,
      randomRotation: false
    },
    { 
      file: 'Rock.glb', 
      count: 20, 
      scale: [1.0, 1.0, 1.0],
      yOffset: 0,
      randomScale: 0.6,
      randomRotation: true
    },
    { 
      file: 'Rock2.glb', 
      count: 15, 
      scale: [1.0, 1.0, 1.0],
      yOffset: 0,
      randomScale: 0.5,
      randomRotation: true
    },
    { 
      file: 'fossil.gltf', 
      count: 10,                  
      scale: [0.3, 0.3, 0.3],     
      yOffset: 0.1,              
      randomScale: 0.3,           
      randomRotation: true,      
      special: true               
    }
  ];
  
  let loadedCount = 0;
  const totalModels = modelConfigs.reduce((sum, config) => sum + config.count, 0);
  modelConfigs.forEach(config => {
    for (let i = 0; i < config.count; i++) {
      const pos = getRandomPosition();
      
      gltfLoader.load(
        config.file,
        function(gltf) {
          const model = gltf.scene;
          
          const randomScale = 1.0 + (Math.random() * 2 - 1) * config.randomScale;
          model.scale.set(
            config.scale[0] * randomScale,
            config.scale[1] * randomScale, 
            config.scale[2] * randomScale
          );
          
          model.position.set(
            pos.x,
            pos.y + config.yOffset,
            pos.z
          );
          
          if (config.randomRotation) {
            model.rotation.y = Math.random() * Math.PI * 2;
            
            model.rotation.x = (Math.random() - 0.5) * 0.3;
            model.rotation.z = (Math.random() - 0.5) * 0.3;
          }
          
          model.traverse(function(child) {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          
          underwaterElements.add(model);
          
          loadedCount++;
          underwaterLoadingElem.textContent = `Loading underwater elements... ${Math.round((loadedCount/totalModels) * 100)}%`;
          
          if (loadedCount === totalModels) {
            underwaterLoadingElem.remove();
          }
        },
        function(error) {
          console.error(`Error loading ${config.file}:`, error);
          loadedCount++;
        }
      );
    }
  });
  
  scene.add(underwaterElements);
  return underwaterElements;
}

const underwaterElements = createUnderwaterEnvironment();

function createFishingWeights() {
  const fishingWeights = new THREE.Group();
  const floorSize = causticsSize * 3;
  const halfSize = floorSize / 2;
  const margin = 8;
  const count = 20; 
  
  const metalTexture = textureLoader.load('metal.jpg');
    metalTexture.wrapS = THREE.RepeatWrapping;
    metalTexture.wrapT = THREE.RepeatWrapping;

const metalMaterial = new THREE.MeshStandardMaterial({
  map: metalTexture,
  metalness: 0.8,    
  roughness: 0.3,    
  emissive: 0x111111 
});
  
  const brassColor = new THREE.Color(0xd4af37);
  const brassMaterial = new THREE.MeshStandardMaterial({
    map: metalTexture, 
    color: brassColor,
    metalness: 0.7,
    roughness: 0.6,
    emissive: new THREE.Color(brassColor).multiplyScalar(0.2)
  });
  
  const copperColor = new THREE.Color(0xb87333);
  const copperMaterial = new THREE.MeshStandardMaterial({
    map: metalTexture,  
    color: copperColor,
    metalness: 0.8,
    roughness: 0.6,
    emissive: new THREE.Color(copperColor).multiplyScalar(0.2)
  });
  
  const materials = [metalMaterial, brassMaterial, copperMaterial];
  
  const lightColors = [
    0x00ffff, 
    0xff00ff,
    0xffff00, 
    0xff8800, 
    0x0088ff  
  ];
  
  function getRandomPosition() {
    return {
      x: Math.random() * (floorSize - margin*2) - (halfSize - margin),
      y: -1 + Math.random() * 2.5, 
      z: Math.random() * (floorSize - margin*2) - (halfSize - margin)
    };
  }
  
  for (let i = 0; i < count; i++) {
    let geometry;
    const shapeType = i % 3; 
    
    switch(shapeType) {
      case 0:
        geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        break;
      case 1: 
        geometry = new THREE.ConeGeometry(0.2, 0.4, 4);
        break;
      case 2: 
        geometry = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 8);
        break;
    }
    
    const material = materials[Math.floor(Math.random() * materials.length)];
    
    const weight = new THREE.Mesh(geometry, material);
    
    const pos = getRandomPosition();
    weight.position.set(pos.x, pos.y, pos.z);
    
    weight.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    
    weight.userData = {
      bobSpeed: 0.3 + Math.random() * 0.7,
      bobHeight: 0.1 + Math.random() * 0.2,
      spinSpeed: 0.2 + Math.random() * 0.4,
      initialY: pos.y,
      timeOffset: Math.random() * 10
    };
    
    const lightColor = lightColors[Math.floor(Math.random() * lightColors.length)];
    const pointLight = new THREE.PointLight(lightColor, 1.0, 5.0);
    pointLight.position.set(0, 0, 0); 
    
    const lightSphereMaterial = new THREE.MeshBasicMaterial({
      color: lightColor,
      transparent: true,
      opacity: 0.7
    });
    const lightSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      lightSphereMaterial
    );
    
    weight.add(pointLight);
    weight.add(lightSphere);
    
    fishingWeights.add(weight);
  }
  
  scene.add(fishingWeights);
  return fishingWeights;
}

const fishingWeights = createFishingWeights();

const weightCounterElem = document.createElement('div');
weightCounterElem.style.position = 'absolute';
weightCounterElem.style.top = '20px';
weightCounterElem.style.right = '20px';
weightCounterElem.style.background = 'rgba(0,0,0,0.7)';
weightCounterElem.style.color = 'white';
weightCounterElem.style.padding = '15px';
weightCounterElem.style.borderRadius = '10px';
weightCounterElem.style.fontSize = '24px';
weightCounterElem.style.fontWeight = 'bold';
weightCounterElem.textContent = 'Fishing Weights: 20';
document.body.appendChild(weightCounterElem);

let weightsRemaining = fishingWeights.children.length;

function updateWeightCounter() {
  weightCounterElem.textContent = `Fishing Weights: ${weightsRemaining}`;
  
  weightCounterElem.style.backgroundColor = 'rgba(0,127,255,0.7)';
  setTimeout(() => {
    weightCounterElem.style.backgroundColor = 'rgba(0,0,0,0.7)';
  }, 300);
}

const collectionFlash = new THREE.PointLight(0xffffff, 0, 10); 
scene.add(collectionFlash);

const completionMessage = document.createElement('div');
completionMessage.style.position = 'absolute';
completionMessage.style.top = '50%';
completionMessage.style.left = '50%';
completionMessage.style.transform = 'translate(-50%, -50%)';
completionMessage.style.color = 'white';
completionMessage.style.backgroundColor = 'rgba(0,100,0,0.8)';
completionMessage.style.padding = '20px';
completionMessage.style.borderRadius = '10px';
completionMessage.style.fontSize = '32px';
completionMessage.style.textAlign = 'center';
completionMessage.style.display = 'none';
completionMessage.innerHTML = 'All fishing weights collected!';
document.body.appendChild(completionMessage);

let checkCollisionFrame = 0;


if (controls.isLocked && fishingWeights) {
  checkCollisionFrame = (checkCollisionFrame + 1) % 5;
  if (checkCollisionFrame === 0) {
    const collectDistance = 1.5;
    
    for (let i = fishingWeights.children.length - 1; i >= 0; i--) {
      const weight = fishingWeights.children[i];
      const distance = camera.position.distanceTo(weight.position);
      
      if (distance < collectDistance) {
        collectionFlash.position.copy(weight.position);
        collectionFlash.intensity = 5;
        
        if (weight.geometry) weight.geometry.dispose();
        if (weight.material) {
          if (Array.isArray(weight.material)) {
            weight.material.forEach(m => m.dispose());
          } else {
            weight.material.dispose();
          }
        }
        
        weight.children.forEach(child => {
          if (child.isLight) {
            child.parent.remove(child);
          }
          if (child.material) child.material.dispose();
          if (child.geometry) child.geometry.dispose();
        });
        
        fishingWeights.remove(weight);
        weightsRemaining--;
        updateWeightCounter();
        
        if (weightsRemaining === 0) {
          completionMessage.style.display = 'block';
          setTimeout(() => {
            completionMessage.style.display = 'none';
          }, 5000);
        }
        
        setTimeout(() => {
          collectionFlash.intensity = 0;
        }, 200);
        
        break;
      }
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  
  if (controls.isLocked) {
    const direction = new THREE.Vector3();
    controls.getDirection(direction);
    const sideDirection = new THREE.Vector3(-direction.z, 0, direction.x);
    
    if (moveState.forward) {
      controls.moveForward(moveSpeed);
    }
    if (moveState.backward) {
      controls.moveForward(-moveSpeed);
    }
    if (moveState.left) {
      controls.moveRight(-moveSpeed);
    }
    if (moveState.right) {
      controls.moveRight(moveSpeed);
    }
    
    if (moveState.up) {
      camera.position.y += moveSpeed;
    }
    if (moveState.down) {
      camera.position.y -= moveSpeed;
    }
  }
  
  waterTime += 0.006; 
  
  [causticsPlane1, causticsPlane2, causticsPlane3].forEach(plane => {
    const { speedX, speedY, rotationSpeed } = plane.material.userData;
    
    plane.material.map.offset.x += speedX;
    plane.material.map.offset.y += speedY;
    
    plane.position.x = Math.sin(waterTime * Math.abs(speedX) * 5) * 0.8;
    plane.position.z = Math.cos(waterTime * Math.abs(speedY) * 4) * 0.8;
    
    plane.rotation.z += rotationSpeed;
    
    plane.material.needsUpdate = true;
  });
  
  const intensity = Math.sin(waterTime * 0.5) * 0.3 + 2.3;
  causticsLight.intensity = intensity;
  
  const blueVariation = Math.sin(waterTime * 0.3) * 0.05 + 0.5; 
  causticsLight.color.setRGB(0.5, 0.7 + blueVariation, 1.0);
  
  if (fishingWeights) {
    fishingWeights.children.forEach(weight => {
      const { bobSpeed, bobHeight, spinSpeed, initialY, timeOffset } = weight.userData;
      
      weight.position.y = initialY + Math.sin(waterTime * bobSpeed + timeOffset) * bobHeight;
      
      weight.rotation.y += spinSpeed * 0.01;
      weight.rotation.x += spinSpeed * 0.005;
      
    });
  }
  
  if (controls.isLocked && fishingWeights) {
    const collectDistance = 1.5;
    
    for (let i = fishingWeights.children.length - 1; i >= 0; i--) {
      const weight = fishingWeights.children[i];
      
      const distance = camera.position.distanceTo(weight.position);
      
      if (distance < collectDistance) {
        const flash = new THREE.PointLight(0xffffff, 5, 10);
        flash.position.copy(weight.position);
        scene.add(flash);
        
        setTimeout(() => {
          scene.remove(flash);
        }, 200);
        
        fishingWeights.remove(weight);
        weightsRemaining--;
        
        updateWeightCounter();
        
        if (weightsRemaining === 0) {
          const completionMessage = document.createElement('div');
          completionMessage.style.position = 'absolute';
          completionMessage.style.top = '50%';
          completionMessage.style.left = '50%';
          completionMessage.style.transform = 'translate(-50%, -50%)';
          completionMessage.style.color = 'white';
          completionMessage.style.backgroundColor = 'rgba(0,100,0,0.8)';
          completionMessage.style.padding = '20px';
          completionMessage.style.borderRadius = '10px';
          completionMessage.style.fontSize = '32px';
          completionMessage.style.textAlign = 'center';
          completionMessage.innerHTML = 'All fishing weights collected!';
          document.body.appendChild(completionMessage);
          
          setTimeout(() => {
            completionMessage.remove();
          }, 5000);
        }
        
        break;
      }
    }
  }
  
  renderer.render(scene, camera);
}

animate();