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
camera.position.set(0, 1.7, 0);

// ---- RESIZE ----
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// ---- ANIMATIE LOOP ----
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// ---- LICHT ----
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 4, 0);
scene.add(pointLight);

// ---- PENTAGON VLOER ----
const shape = new THREE.Shape();
const sides = 5;
const radius = 8;

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

  const wallGeo = new THREE.PlaneGeometry(wallLength, wallHeight);
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(cx, wallHeight / 2, cz);
  wall.rotation.y = wallAngle;
  scene.add(wall);
}