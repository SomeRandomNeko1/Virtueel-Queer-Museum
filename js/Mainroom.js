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