// Canvas en renderer
const canvas = document.getElementById('c');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  50
);
camera.position.set(0, 1.7, 4);

// Resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Material helper
const mat = (color) =>
  new THREE.MeshStandardMaterial({ color });

// --- VLOER ---
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  mat(0x8B6F47)
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// --- MUREN ---
const wallMat = mat(0xD4C4A0);

// achter
const backWall = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 5),
  wallMat
);
backWall.position.set(0, 2.5, -5);
scene.add(backWall);

// voor
const frontWall = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 5),
  wallMat
);
frontWall.rotation.y = Math.PI;
frontWall.position.set(0, 2.5, 5);
scene.add(frontWall);

// links
const leftWall = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 5),
  wallMat
);
leftWall.rotation.y = Math.PI / 2;
leftWall.position.set(-5, 2.5, 0);
scene.add(leftWall);

// rechts
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
  mat(0xF0EAD6)
);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = 5;
scene.add(ceiling);

// --- LICHT ---
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const light = new THREE.PointLight(0xffffff, 1.2);
light.position.set(0, 4, 0);
scene.add(light);

// --- SCHILDERIJEN ---
const loader = new THREE.TextureLoader();

const images = [
  'images.jpg',
  'images1.jpg',
  'images2.jpg'
];

images.forEach((img, i) => {
  const tex = loader.load(img);

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1, 0.05),
    mat(0x6B4226)
  );
  frame.position.set(-2 + i * 2, 3, -5);
  scene.add(frame);

  const painting = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.8),
    new THREE.MeshStandardMaterial({ map: tex })
  );
  painting.position.set(-2 + i * 2, 3, -4.94);
  scene.add(painting);
});

// --- CONTROLS ---
let keys = { w: false, a: false, s: false, d: false };
let yaw = 0;
let pitch = 0;
const speed = 0.08;

// keyboard
window.addEventListener('keydown', e => {
  if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = true;

  // springen
  if (e.code === 'Space' && isOnGround) {
    velocityY = 0.2;
    isOnGround = false;
  }
});

window.addEventListener('keyup', e => {
  if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = false;
});

// mouse lock
canvas.addEventListener('click', () => {
  canvas.requestPointerLock();
});

// mouse look
document.addEventListener('mousemove', e => {
  if (document.pointerLockElement === canvas) {
    yaw -= e.movementX * 0.002;
    pitch += e.movementY * 0.002;

    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
  }
});

// --- GRAVITY ---
let velocityY = 0;
let gravity = -0.01;
let playerHeight = 1.7;
let isOnGround = false;

// --- COLLISION ---
const roomLimit = 4.5;

// movement
function updateMovement() {
  const forward = new THREE.Vector3(
    -Math.sin(yaw),
    0,
    -Math.cos(yaw)
  );

  const right = new THREE.Vector3(
    Math.cos(yaw),
    0,
    -Math.sin(yaw)
  );

  let nextPosition = camera.position.clone();

  if (keys.w) nextPosition.addScaledVector(forward, speed);
  if (keys.s) nextPosition.addScaledVector(forward, -speed);
  if (keys.a) nextPosition.addScaledVector(right, -speed);
  if (keys.d) nextPosition.addScaledVector(right, speed);

  if (
    nextPosition.x > -roomLimit &&
    nextPosition.x < roomLimit &&
    nextPosition.z > -roomLimit &&
    nextPosition.z < roomLimit
  ) {
    camera.position.x = nextPosition.x;
    camera.position.z = nextPosition.z;
  }
}

// gravity update
function updateGravity() {
  velocityY += gravity;
  camera.position.y += velocityY;

  if (camera.position.y <= playerHeight) {
    camera.position.y = playerHeight;
    velocityY = 0;
    isOnGround = true;
  } else {
    isOnGround = false;
  }
}

// camera rotatie
function updateCameraRotation() {
  camera.rotation.set(pitch, yaw, 0);
}

// animate
function animate() {
  requestAnimationFrame(animate);

  updateMovement();
  updateGravity();
  updateCameraRotation();

  renderer.render(scene, camera);
}

animate();