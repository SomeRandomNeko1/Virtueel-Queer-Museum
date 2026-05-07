// ---- RENDERER ----
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ---- SCENE ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// ---- CAMERA ----
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.7, 17);


// ---- RESIZE ----
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// ---- LICHT ----
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 4, 0);
scene.add(pointLight);

// ---- PENTAGON VLOER ----
const shape = new THREE.Shape();
const sides = 5;
const radius = 12;

for (let i = 0; i < sides; i++) {
  const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  if (i === 0) shape.moveTo(x, y);
  else shape.lineTo(x, y);
}

const floorGeo = new THREE.ShapeGeometry(shape);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x8B7355 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// ---- MUREN ----
const wallHeight = 5;
const doorHeight = 3;
const openingWidth = 3;
const wallMat = new THREE.MeshStandardMaterial({ color: 0xD4C4A0, side: THREE.DoubleSide });

for (let i = 0; i < sides; i++) {
  const angle1 = (i / sides) * Math.PI * 2 - Math.PI / 2;
  const angle2 = ((i + 1) / sides) * Math.PI * 2 - Math.PI / 2;

  const x1 = Math.cos(angle1) * radius;
  const z1 = Math.sin(angle1) * radius;
  const x2 = Math.cos(angle2) * radius;
  const z2 = Math.sin(angle2) * radius;

  const wallLength = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
  const cx = (x1 + x2) / 2;
  const cz = (z1 + z2) / 2;
  const wallAngle = -Math.atan2(z2 - z1, x2 - x1);

  if (i ===2) {
    // muur 2 = opening naar gang
    const leftGeo = new THREE.PlaneGeometry((wallLength - openingWidth) / 2, wallHeight);
    const leftWall = new THREE.Mesh(leftGeo, wallMat);
    leftWall.position.set(cx, wallHeight / 2, cz);
    leftWall.rotation.y = wallAngle;
    leftWall.translateX(-(openingWidth / 2 + (wallLength - openingWidth) / 4));
    scene.add(leftWall);

    const rightGeo = new THREE.PlaneGeometry((wallLength - openingWidth) / 2, wallHeight);
    const rightWall = new THREE.Mesh(rightGeo, wallMat);
    rightWall.position.set(cx, wallHeight / 2, cz);
    rightWall.rotation.y = wallAngle;
    rightWall.translateX(openingWidth / 2 + (wallLength - openingWidth) / 4);
    scene.add(rightWall);

    const topGeo = new THREE.PlaneGeometry(openingWidth, wallHeight - doorHeight);
    const topWall = new THREE.Mesh(topGeo, wallMat);
    topWall.position.set(cx, doorHeight + (wallHeight - doorHeight) / 2, cz);
    topWall.rotation.y = wallAngle;
    scene.add(topWall);
  } else {
    const wallGeo = new THREE.PlaneGeometry(wallLength, wallHeight);
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(cx, wallHeight / 2, cz);
    wall.rotation.y = wallAngle;
    scene.add(wall);
  }
}

// ---- PLAFOND ----
const ceilGeo = new THREE.ShapeGeometry(shape);
const ceilMat = new THREE.MeshStandardMaterial({ color: 0xF0EAD6 });
const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = wallHeight;
scene.add(ceiling);

// ---- ENTREE GANG ----
const gangMat = new THREE.MeshStandardMaterial({ color: 0xD4C4A0, side: THREE.DoubleSide });
const gangFloorMat = new THREE.MeshStandardMaterial({ color: 0x8B7355 });

const gangFloor = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 6),
  gangFloorMat
);
gangFloor.rotation.x = -Math.PI / 2;
gangFloor.position.set(0, 0.01, 14);
scene.add(gangFloor);

const gangCeil = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 6),
  new THREE.MeshStandardMaterial({ color: 0xF0EAD6 })
);
gangCeil.rotation.x = Math.PI / 2;
gangCeil.position.set(0, wallHeight, 14);
scene.add(gangCeil);

const gangLeft = new THREE.Mesh(
  new THREE.PlaneGeometry(6, wallHeight),
  gangMat
);
gangLeft.rotation.y = Math.PI / 2;
gangLeft.position.set(-2, wallHeight / 2, 14);
scene.add(gangLeft);

const gangRight = new THREE.Mesh(
  new THREE.PlaneGeometry(6, wallHeight),
  gangMat
);
gangRight.rotation.y = -Math.PI / 2;
gangRight.position.set(2, wallHeight / 2, 14);
scene.add(gangRight);

const gangBack = new THREE.Mesh(
  new THREE.PlaneGeometry(4, wallHeight),
  gangMat
);
gangBack.position.set(0, wallHeight / 2, 19);
scene.add(gangBack);

const gangLight = new THREE.PointLight(0xffffff, 0.8);
gangLight.position.set(0, wallHeight - 1, 14);
scene.add(gangLight);

// ---- CONTROLS ----
let yaw = 0;
let pitch = 0;
const speed = 0.05;
let keys = {};

window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

canvas.addEventListener('click', () => canvas.requestPointerLock());

document.addEventListener('mousemove', e => {
  if (document.pointerLockElement === canvas) {
    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
  }
});

// ---- MOVEMENT ----
function updateMovement() {
  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

  const next = camera.position.clone();

  if (keys['KeyW']) next.addScaledVector(forward, speed);
  if (keys['KeyS']) next.addScaledVector(forward, -speed);
  if (keys['KeyA']) next.addScaledVector(right, -speed);
  if (keys['KeyD']) next.addScaledVector(right, speed);

  if (isAllowed(next.x, next.z)) {
    camera.position.x = next.x;
    camera.position.z = next.z;
  }

  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
}

function isAllowed(x, z) {
  const inGang = x > -3 && x < 3 && z > 7 && z < 19;
  const inHal = insidePentagon(x, z);
  return inGang || inHal;
}

function insidePentagon(x, z) {
  for (let i = 0; i < sides; i++) {
    if (i === 3) continue; // sla de ingang muur over
    
    const angle1 = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const angle2 = ((i + 1) / sides) * Math.PI * 2 - Math.PI / 2;

    const x1 = Math.cos(angle1) * radius;
    const z1 = Math.sin(angle1) * radius;
    const x2 = Math.cos(angle2) * radius;
    const z2 = Math.sin(angle2) * radius;

    const nx = -(z2 - z1);
    const nz = x2 - x1;

    const dot = (x - x1) * nx + (z - z1) * nz;
    if (dot < 0.3) return false;
  }
  return true;
}

// ---- ANIMATIE LOOP ----
function animate() {
  requestAnimationFrame(animate);
  updateMovement();
  renderer.render(scene, camera);
}
animate();
