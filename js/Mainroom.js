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
camera.position.set(0, 1.9, 17);

// ---- AUDIO ----
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('audio/sound.mp3', buffer => {
  sound.setBuffer(buffer);
  sound.setLoop(false);
  sound.setVolume(0.5);
});

// ---- RESIZE ----
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// ---- LICHT ----
const ambientLight = new THREE.AmbientLight(0xfff5e0, 0.3);
scene.add(ambientLight);

const halLamp = new THREE.PointLight(0xffd27f, 1.5, 30);
halLamp.position.set(0, 4.8, 0);
scene.add(halLamp);

const lampGeo = new THREE.SphereGeometry(0.15, 16, 16);
const lampMat = new THREE.MeshStandardMaterial({
  color: 0xffd27f,
  emissive: 0xffd27f,
  emissiveIntensity: 2
});
const lampMesh = new THREE.Mesh(lampGeo, lampMat);
lampMesh.position.set(0, 4.8, 0);
scene.add(lampMesh);

const gangLamp = new THREE.PointLight(0xffd27f, 0.8, 15);
gangLamp.position.set(0, 4.8, 17);
scene.add(gangLamp);

const gangLampMesh = new THREE.Mesh(lampGeo, lampMat);
gangLampMesh.position.set(0, 4.8, 17);
scene.add(gangLampMesh);

// ---- TEXTURES ----
const textureLoader = new THREE.TextureLoader();

const betonTexture = textureLoader.load('art/beton.jpg');
betonTexture.wrapS = THREE.RepeatWrapping;
betonTexture.wrapT = THREE.RepeatWrapping;
betonTexture.repeat.set(4, 4);

// ---- PENTAGON VLOER ----
const shape = new THREE.Shape();
const sides = 5;
const radius = 15;

for (let i = 0; i < sides; i++) {
  const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  if (i === 0) shape.moveTo(x, y);
  else shape.lineTo(x, y);
}

const floorGeo = new THREE.ShapeGeometry(shape);
const pos = floorGeo.attributes.position;
const uvs = [];
for (let i = 0; i < pos.count; i++) {
  uvs.push(pos.getX(i) / (radius * 2) + 0.5);
  uvs.push(pos.getY(i) / (radius * 2) + 0.5);
}
floorGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

const floorMat = new THREE.MeshStandardMaterial({ map: betonTexture });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const extraFloor = new THREE.Mesh(
  new THREE.CircleGeometry(28, 64),
  new THREE.MeshStandardMaterial({ map: betonTexture })
);
extraFloor.rotation.x = -Math.PI / 2;
extraFloor.position.y = -0.01;
scene.add(extraFloor);

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

  if (i === 2) {
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
  }
}

// ---- PLAFOND ----
const ceilGeo = new THREE.ShapeGeometry(shape);
const ceilMat = new THREE.MeshStandardMaterial({ color: 0xF0EAD6 });
const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = wallHeight;
scene.add(ceiling);

// ---- BALIE ----
const balieMat = new THREE.MeshStandardMaterial({ color: 0x5c3d1e, side: THREE.DoubleSide });

const balieWand = new THREE.Mesh(
  new THREE.CylinderGeometry(2, 2, 1.1, 32, 1, true, 0, Math.PI * 1.5),
  balieMat
);
balieWand.position.set(0, 0.55, 0);
balieWand.rotation.y = Math.PI / -1.5;
scene.add(balieWand);

const balieTop = new THREE.Mesh(
  new THREE.CylinderGeometry(2.2, 2.2, 0.1, 32, 1, false, 0, Math.PI * 1.5),
  balieMat
);
balieTop.position.set(0, 1.1, 0);
balieTop.rotation.y = Math.PI / -1.5;
scene.add(balieTop);

// ---- ENTREE GANG ----
const gangMat = new THREE.MeshStandardMaterial({ color: 0x622B14, side: THREE.DoubleSide });
const gangFloorMat = new THREE.MeshStandardMaterial({ map: betonTexture });

const gangFloor = new THREE.Mesh(new THREE.PlaneGeometry(6, 10), gangFloorMat);
gangFloor.rotation.x = -Math.PI / 2;
gangFloor.position.set(0, 0.01, 17);
scene.add(gangFloor);

const gangCeil = new THREE.Mesh(
  new THREE.PlaneGeometry(6, 10),
  new THREE.MeshStandardMaterial({ color: 0xF0EAD6 })
);
gangCeil.rotation.x = Math.PI / 2;
gangCeil.position.set(0, wallHeight, 17);
scene.add(gangCeil);

const gangLeft = new THREE.Mesh(new THREE.PlaneGeometry(10, wallHeight), gangMat);
gangLeft.rotation.y = Math.PI / 2;
gangLeft.position.set(-3, wallHeight / 2, 17);
scene.add(gangLeft);

const gangRight = new THREE.Mesh(new THREE.PlaneGeometry(10, wallHeight), gangMat);
gangRight.rotation.y = -Math.PI / 2;
gangRight.position.set(3, wallHeight / 2, 17);
scene.add(gangRight);

const gangBack = new THREE.Mesh(new THREE.PlaneGeometry(6, wallHeight), gangMat);
gangBack.position.set(0, wallHeight / 2, 22);
scene.add(gangBack);

const gangLight = new THREE.PointLight(0x622B14, 0.8);
gangLight.position.set(0, wallHeight - 1, 17);
scene.add(gangLight);

// ---- ART ROOMS ----
const roomDepth = 10;
const roomWidth = 12;
const roomPositions = [];
const doors = [];
const roomWallMat = new THREE.MeshStandardMaterial({ color: 0x995F2F, side: THREE.DoubleSide });
const roomFloorMat = new THREE.MeshStandardMaterial({ map: betonTexture });
const roomCeilMat = new THREE.MeshStandardMaterial({ color: 0xF0EAD6 });

for (let i = 0; i < sides; i++) {
  if (i === 2) continue;

  const angle1 = (i / sides) * Math.PI * 2 - Math.PI / 2;
  const angle2 = ((i + 1) / sides) * Math.PI * 2 - Math.PI / 2;

  const x1 = Math.cos(angle1) * radius;
  const z1 = Math.sin(angle1) * radius;
  const x2 = Math.cos(angle2) * radius;
  const z2 = Math.sin(angle2) * radius;

  const cx = (x1 + x2) / 2;
  const cz = (z1 + z2) / 2;
  const wallAngle = -Math.atan2(z2 - z1, x2 - x1);

  const nx = -Math.sin(wallAngle);
  const nz = -Math.cos(wallAngle);

  const rx = cx + nx * roomDepth / 2;
  const rz = cz + nz * roomDepth / 2;

  roomPositions.push({ rx, rz });
  doors.push({ wallAngle });

  function addWall(offsetX, offsetZ, rotY, w, h) {
    const geo = new THREE.PlaneGeometry(w, h);
    const mesh = new THREE.Mesh(geo, roomWallMat);
    mesh.position.set(rx + offsetX, h / 2, rz + offsetZ);
    mesh.rotation.y = rotY;
    scene.add(mesh);
  }

  addWall(nx * roomDepth / 2, nz * roomDepth / 2, wallAngle + Math.PI, roomWidth, wallHeight);

  const perpX = -Math.sin(wallAngle + Math.PI / 2) * roomWidth / 2;
  const perpZ = -Math.cos(wallAngle + Math.PI / 2) * roomWidth / 2;
  addWall(-perpX, -perpZ, wallAngle + Math.PI / 2, roomDepth, wallHeight);
  addWall(perpX, perpZ, wallAngle - Math.PI / 2, roomDepth, wallHeight);

  const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomDepth), roomFloorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.rotation.z = wallAngle;
  floorMesh.position.set(rx, 0.01, rz);
  scene.add(floorMesh);

  const ceilMesh = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomDepth), roomCeilMat);
  ceilMesh.rotation.x = Math.PI / 2;
  ceilMesh.rotation.z = -wallAngle;
  ceilMesh.position.set(rx, wallHeight, rz);
  scene.add(ceilMesh);

  const roomLight = new THREE.PointLight(0xffffff, 0.3);
  roomLight.position.set(rx, wallHeight - 1, rz);
  scene.add(roomLight);
}

// ---- SCHILDERIJEN ----
const kunstwerken = [];

roomPositions.forEach((kamer, i) => {
  const angle = doors[i].wallAngle;
  const wx = Math.sin(angle);
  const wz = Math.cos(angle);
  const px = Math.cos(angle);
  const pz = -Math.sin(angle);

  [-2.5, 0, 2.5].forEach(offset => {
    const kunst = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    kunst.position.set(
      kamer.rx + wx * (roomDepth / 2 - 9) + px * offset,
      2.5,
      kamer.rz + wz * (roomDepth / 2 - 9) + pz * offset
    );
    kunst.rotation.y = angle;
    scene.add(kunst);
    kunstwerken.push({ mesh: kunst, angle });
  });

  [-2.5, 0, 2.5].forEach(offset => {
    const kunst = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    kunst.position.set(
      kamer.rx + px * (roomWidth / 2 - 0.1) + wx * offset,
      2.5,
      kamer.rz + pz * (roomWidth / 2 - 0.1) + wz * offset
    );
    kunst.rotation.y = angle - Math.PI / 2;
    scene.add(kunst);
    kunstwerken.push({ mesh: kunst, angle: angle - Math.PI / 2 });
  });

  [-2.5, 0, 2.5].forEach(offset => {
    const kunst = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    kunst.position.set(
      kamer.rx - px * (roomWidth / 2 - 0.1) + wx * offset,
      2.5,
      kamer.rz - pz * (roomWidth / 2 - 0.1) + wz * offset
    );
    kunst.rotation.y = angle + Math.PI / 2;
    scene.add(kunst);
    kunstwerken.push({ mesh: kunst, angle: angle + Math.PI / 2 });
  });
});

// ---- AUDIO KNOPPEN ----
const audioButtons = [];

kunstwerken.forEach(k => {
  const btn = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  );
  btn.position.copy(k.mesh.position);
  btn.rotation.copy(k.mesh.rotation);
  btn.translateY(-1.0);
  btn.translateX(0.9);
  btn.translateZ(0.05);
  scene.add(btn);
  audioButtons.push({ button: btn, isPlaying: false });
});

// ---- TEXT POPUPS ----
const infoData = [
  { titel: "Identiteit", tekst: "Dit werk verkent gender en zelfexpressie binnen de queer gemeenschap." },
  { titel: "Geschiedenis", tekst: "Een eerbetoon aan de voorvechters van gelijkheid." },
  { titel: "Toekomst", tekst: "Samen bouwen we aan een inclusieve wereld." }
];

// koppel info aan kunstwerken
kunstwerken.forEach((k, i) => {
  k.mesh.userData = infoData[i % infoData.length];
});

// klik detectie voor popups
window.addEventListener('mousedown', () => {
  if (document.pointerLockElement !== canvas) return;

  const popupRaycaster = new THREE.Raycaster();
  const center = new THREE.Vector2(0, 0);
  popupRaycaster.setFromCamera(center, camera);

  const hits = popupRaycaster.intersectObjects(kunstwerken.map(k => k.mesh));
  if (hits.length > 0) {
    toonInfo(hits[0].object.userData);
  }
});

function toonInfo(data) {
  document.exitPointerLock();

  const overlay = document.createElement('div');
  overlay.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:1000;";

  overlay.innerHTML = `
    <div id="kaart" style="background:white; padding:25px; width:260px; border-radius:15px; text-align:center; font-family:sans-serif;">
      <h2 style="color:#aa1eaa; margin:0 0 10px 0;">${data.titel}</h2>
      <p id="tekst" style="display:none; line-height:1.5; color:#333;">${data.tekst}</p>
      <button id="knop" style="margin-top:15px; padding:10px 20px; background:#ff85aa; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">Lees meer</button>
    </div>`;

  document.body.appendChild(overlay);

  const knop = overlay.querySelector('#knop');
  const kaart = overlay.querySelector('#kaart');
  const tekst = overlay.querySelector('#tekst');

  knop.onclick = () => {
    if (knop.innerText === "Lees meer") {
      tekst.style.display = "block";
      kaart.style.width = "350px";
      knop.innerText = "Sluiten";
    } else {
      overlay.remove();
      canvas.requestPointerLock();
    }
  };
}


// ---- SPOTLIGHTS OP SCHILDERIJEN ----
roomPositions.forEach((kamer, i) => {
  const angle = doors[i].wallAngle;
  const wx = Math.sin(angle);
  const wz = Math.cos(angle);
  const px = Math.cos(angle);
  const pz = -Math.sin(angle);

  const spotMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 2
  });

  [-2.5, 0, 2.5].forEach(offset => {
    const spot = new THREE.SpotLight(0xfff5e0, 1.5, 8, Math.PI / 8, 0.3);
    spot.position.set(
      kamer.rx + wx * (roomDepth / 2 - 9) + px * offset,
      wallHeight - 0.3,
      kamer.rz + wz * (roomDepth / 2 - 9) + pz * offset
    );
    spot.target.position.set(
      kamer.rx + wx * (roomDepth / 2 - 9) + px * offset,
      2.5,
      kamer.rz + wz * (roomDepth / 2 - 9) + pz * offset
    );
    scene.add(spot);
    scene.add(spot.target);
    const spotMesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), spotMat);
    spotMesh.position.copy(spot.position);
    scene.add(spotMesh);
  });

  [-2.5, 0, 2.5].forEach(offset => {
    const spot = new THREE.SpotLight(0xfff5e0, 1.5, 8, Math.PI / 8, 0.3);
    spot.position.set(
      kamer.rx + px * (roomWidth / 2 - 0.1) + wx * offset,
      wallHeight - 0.3,
      kamer.rz + pz * (roomWidth / 2 - 0.1) + wz * offset
    );
    spot.target.position.set(
      kamer.rx + px * (roomWidth / 2 - 0.1) + wx * offset,
      2.5,
      kamer.rz + pz * (roomWidth / 2 - 0.1) + wz * offset
    );
    scene.add(spot);
    scene.add(spot.target);
    const spotMesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), spotMat);
    spotMesh.position.copy(spot.position);
    scene.add(spotMesh);
  });

  [-2.5, 0, 2.5].forEach(offset => {
    const spot = new THREE.SpotLight(0xfff5e0, 1.5, 8, Math.PI / 8, 0.3);
    spot.position.set(
      kamer.rx - px * (roomWidth / 2 - 0.1) + wx * offset,
      wallHeight - 0.3,
      kamer.rz - pz * (roomWidth / 2 - 0.1) + wz * offset
    );
    spot.target.position.set(
      kamer.rx - px * (roomWidth / 2 - 0.1) + wx * offset,
      2.5,
      kamer.rz - pz * (roomWidth / 2 - 0.1) + wz * offset
    );
    scene.add(spot);
    scene.add(spot.target);
    const spotMesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), spotMat);
    spotMesh.position.copy(spot.position);
    scene.add(spotMesh);
  });
});

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

// ---- ZOOM ----
function setupZoom(camera, minFov = 30, maxFov = 100, sensitivity = 0.01) {
  window.addEventListener('wheel', (event) => {
    camera.fov = Math.max(minFov, Math.min(maxFov, camera.fov + event.deltaY * sensitivity));
    camera.updateProjectionMatrix();
  });
}

setupZoom(camera);

// ---- AUDIO CLICK ----
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let currentPlaying = null;

window.addEventListener('click', () => {
  mouse.x = 0;
  mouse.y = 0;

  raycaster.setFromCamera(mouse, camera);

  const hits = raycaster.intersectObjects(audioButtons.map(b => b.button));
  if (!hits.length || !sound.buffer) return;

  const btn = audioButtons.find(b => b.button === hits[0].object);
  if (!btn) return;

  if (btn.isPlaying) {
    sound.stop();
    btn.isPlaying = false;
    btn.button.material.color.set(0x00ff00);
    currentPlaying = null;
  } else {
    if (currentPlaying && currentPlaying !== btn) {
      sound.stop();
      currentPlaying.isPlaying = false;
      currentPlaying.button.material.color.set(0x00ff00);
    }
    sound.play();
    btn.isPlaying = true;
    btn.button.material.color.set(0xff0000);
    currentPlaying = btn;
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
  const inGang = x > -3 && x < 3 && z > 10 && z < 22;
  const inHal = insidePentagon(x, z);
  const inRoom = roomPositions.some(r => Math.abs(x - r.rx) < 7 && Math.abs(z - r.rz) < 7);
  return inGang || inHal || inRoom;
}

function insidePentagon(x, z) {
  for (let i = 0; i < sides; i++) {
    if (i === 2) continue;

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




// ---- HELP KNOP & INSTRUCTIES ----
const helpKnop = document.createElement('div');
helpKnop.innerHTML = "?";
helpKnop.style.cssText = "position:fixed; bottom:20px; right:20px; width:40px; height:40px; background:#444; color:white; border-radius:50%; display:flex; justify-content:center; align-items:center; cursor:pointer; z-index:4000; font-family:sans-serif; border:none; box-shadow: 0px 2px 5px rgba(0,0,0,0.3);";
document.body.appendChild(helpKnop);

const infoScherm = document.createElement('div');
infoScherm.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.7); color:white; display:none; justify-content:center; align-items:center; z-index:5000; font-family:sans-serif; cursor:pointer;";

const isMobiel = "ontouchstart" in window;

infoScherm.innerHTML = `
  <div style="padding:25px; background:white; color:black; border-radius:8px; text-align:center; width:280px; box-shadow: 0px 4px 15px rgba(0,0,0,0.5);">
    <h3 style="margin-top:0;">Besturing voor VR museum</h3>
    <div style="margin:15px 0; font-size:14px; line-height:1.5; text-align:left;">
      ${isMobiel ?
        "• Swipe om rond te kijken<br>• Tik op schilderij voor info" :
        "• Lopen: WASD <br>• Kijken: Muis<br>• Klik op schilderij voor info<br>• Scroll om in/uit te zoomen"}
    </div>
    <button style="padding:10px 20px; background:#333; color:white; border:none; border-radius:4px; cursor:pointer; width:100%;">Start</button>
  </div>
`;
document.body.appendChild(infoScherm);

function startMuseum() {
  infoScherm.style.display = "none";
  if (!isMobiel && typeof canvas !== 'undefined') {
    canvas.requestPointerLock();
  }
}

function toonGids() {
  infoScherm.style.display = "flex";
}

infoScherm.onclick = startMuseum;

helpKnop.onclick = function(e) {
  e.stopPropagation();
  toonGids();
};

let museumGestart = false;

document.addEventListener('pointerlockchange', function() {
  const popupOpen = document.querySelector('#kaart') !== null;
  if (document.pointerLockElement === null && !isMobiel && museumGestart && !popupOpen) {
    toonGids();
  }
});

// ---- ANIMATIE LOOP ----
function animate() {
  requestAnimationFrame(animate);
  updateMovement();
  renderer.render(scene, camera);
}
animate();