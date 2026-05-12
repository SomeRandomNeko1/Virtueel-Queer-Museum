// Canvas en renderer
const canvas = document.getElementById('c');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.Fog(0x1a1a2e, 12, 22);

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  50
);
camera.position.set(0, 2.5, 6);

// Resize
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener('resize', resize);

// Material helper
const mat = (color, rough = 0.8, metal = 0) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness: rough,
    metalness: metal
  });



// --- CAMERA CONTROLS ---
let isDragging = false;
let prevX = 0;
let prevY = 0;

let spherical = {
  theta: -0.2,
  phi: 0.35,
  r: 6
};

const camTarget = new THREE.Vector3(0, 1.5, 0);

canvas.addEventListener('mousedown', e => {
  isDragging = true;
  prevX = e.clientX;
  prevY = e.clientY;
});

window.addEventListener('mouseup', () => {
  isDragging = false;
});

canvas.addEventListener('mousemove', e => {
  if (!isDragging) return;

  spherical.theta -= (e.clientX - prevX) * 0.005;
  spherical.phi = Math.max(
    0.1,
    Math.min(1.2, spherical.phi - (e.clientY - prevY) * 0.005)
  );

  prevX = e.clientX;
  prevY = e.clientY;
});

canvas.addEventListener('wheel', e => {
  spherical.r = Math.max(
    2.5,
    Math.min(11, spherical.r + e.deltaY * 0.01)
  );
});

// Camera update
function updateCamera() {
  camera.position.x =
    camTarget.x +
    spherical.r * Math.sin(spherical.phi) * Math.sin(spherical.theta);

  camera.position.y =
    camTarget.y +
    spherical.r * Math.cos(spherical.phi);

  camera.position.z =
    camTarget.z +
    spherical.r * Math.sin(spherical.phi) * Math.cos(spherical.theta);

  camera.lookAt(camTarget);
}

// Animatie
function animate() {
  requestAnimationFrame(animate);
  updateCamera();
  renderer.render(scene, camera);
}

animate();

// --- SCHILDERIJ MET AFBEELDING ---

// Texture laden
const textureLoader = new THREE.TextureLoader();
const paintingTexture = textureLoader.load('images.jpg');

// kleurweergave
paintingTexture.encoding = THREE.sRGBEncoding;
paintingTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

// Frame (lijst)
const frameM = mat(0x6B4226, 0.7, 0.2);
const frame = new THREE.Mesh(
  new THREE.BoxGeometry(1.4, 1, 0.05),
  frameM
);
frame.position.set(2, 3.2, -5);
frame.castShadow = true;
scene.add(frame);

// Painting 
const painting = new THREE.Mesh(
  new THREE.PlaneGeometry(1.2, 0.8),
  new THREE.MeshStandardMaterial({
    map: paintingTexture
  })
);

// positie muur 
painting.position.set(2, 3.2, -4.94);
scene.add(painting);
 





// objecten -- items --

// --- VLOER ---
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  mat(0x8B6F47, 0.9)
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

for (let i = -4; i < 5; i++) {
  const plank = new THREE.Mesh(
    new THREE.PlaneGeometry(0.05, 10),
    mat(0x6B4F2A, 1)
  );
  plank.rotation.x = -Math.PI / 2;
  plank.position.set(i, 0.001, 0);
  scene.add(plank);
}

// --- MUREN ---
const wallMat = mat(0xD4C4A0, 0.95);

const backWall = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 5),
  wallMat
);
backWall.position.set(0, 2.5, -5);
scene.add(backWall);

const leftWall = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 5),
  wallMat
);
leftWall.rotation.y = Math.PI / 2;
leftWall.position.set(-5, 2.5, 0);
scene.add(leftWall);

const rightWall = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 5),
  wallMat
);
rightWall.rotation.y = -Math.PI / 2;
rightWall.position.set(5, 2.5, 0);
scene.add(rightWall);

// --- PLAFOND ---
const ceiling = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  mat(0xF0EAD6, 0.95)
);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = 5;
scene.add(ceiling);

// --- LICHT ---
const mainLight = new THREE.PointLight(0xFFF5DC, 1.8, 10);
mainLight.position.set(0, 4.3, 0);
mainLight.castShadow = true;
scene.add(mainLight);

const ambient = new THREE.AmbientLight(0x6070A0, 0.6);
scene.add(ambient);


// --- PLANT ---
const plant = new THREE.Mesh(
  new THREE.CylinderGeometry(0.15, 0.12, 0.3, 12),
  mat(0xC0622A)
);
plant.position.set(4.2, 0.15, 4.2);
scene.add(plant);

