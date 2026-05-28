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

// ==== AUDIO SETUP ====
const listener = new THREE.AudioListener();
let globalAudio = null;

// We wachten met het toevoegen van de listener tot de eerste klik
let audioContextInitialized = false;

function initAudioContext() {
    if (audioContextInitialized) return;
    camera.add(listener);
    globalAudio = new THREE.Audio(listener);
    globalAudio.setVolume(0.75);
    audioContextInitialized = true;
    console.log("AudioContext geïnitialiseerd na user gesture");
}

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

const deurTexture = textureLoader.load('art/Deur.png');
betonTexture.wrapS = THREE.RepeatWrapping;
betonTexture.wrapT = THREE.RepeatWrapping;
betonTexture.repeat.set(4, 4);
deurTexture.colorSpace = THREE.SRGBColorSpace;
deurTexture.wrapS = THREE.ClampToEdgeWrapping;
deurTexture.wrapT = THREE.ClampToEdgeWrapping;

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

// ---- MUREN & POSTERS ----
const wallHeight = 5;
const doorHeight = 3;
const openingWidth = 3;
const wallMat = new THREE.MeshStandardMaterial({ color: 0xD4C4A0, side: THREE.DoubleSide });

const loader = new THREE.TextureLoader();

const sideWallImages = [
  { img: 'art/image3.jpg', targetWallIndex: 1, side: 'left' },
  { img: 'art/image4.jpg', targetWallIndex: 3, side: 'right' }
];

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

  // --- Poster Sectie ---
  const posterData = sideWallImages.find(item => item.targetWallIndex === i);

  if (posterData) {
    const posterGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const posterMat = new THREE.MeshStandardMaterial({
      color: posterData.fallbackColor,
      side: THREE.DoubleSide
    });

    loader.load(
      posterData.img,
      (texture) => { posterMat.map = texture; posterMat.needsUpdate = true; },
      undefined,
      () => { console.warn("Kon afbeelding niet laden:", posterData.img); }
    );

    const poster = new THREE.Mesh(posterGeo, posterMat);
    poster.position.set(cx, wallHeight / 2, cz);
    poster.rotation.y = wallAngle;

    if (posterData.side === 'left') {
      poster.translateX(-(openingWidth / 2 + (wallLength - openingWidth) / 4));
    } else if (posterData.side === 'right') {
      poster.translateX(openingWidth / 2 + (wallLength - openingWidth) / 4);
    }

    poster.translateZ(0.02);
    scene.add(poster);
  }
}

// ---- BORDJES HOOFDHAL ----
const kamerNamen = ['Laden...', 'Laden...', 'Laden...', 'Laden...']; // Tijdelijke tekst
let kamerIndex = 0;
const signPlates = []; // Array om de bordjes in op te slaan voor later

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

  const offsetX = kamerIndex < 3 ? -2.5 : 2;

  // Maak canvas
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 1024;
  signCanvas.height = 512;
  
  // Teken initiële tekst
  tekenBordje(signCanvas, kamerNamen[kamerIndex]);

  const signFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.7, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x3e2723 })
  );
  signFrame.position.set(cx, 1.9, cz);
  signFrame.rotation.y = wallAngle;
  signFrame.translateZ(0.1);
  signFrame.translateX(offsetX);
  scene.add(signFrame);

  const signPlate = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 0.6),
    new THREE.MeshStandardMaterial({
      map: new THREE.CanvasTexture(signCanvas),
      roughness: 0.6
    })
  );
  signPlate.position.set(cx, 1.9, cz);
  signPlate.rotation.y = wallAngle;
  signPlate.translateZ(0.13);
  signPlate.translateX(offsetX);
  scene.add(signPlate);

  signPlates.push(signPlate); // Sla op in array
  kamerIndex++;
}

// Hulpfunctie om de tekst op het canvas te tekenen
function tekenBordje(canvas, tekst) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#995F2F'; // Houtkleur
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = '#000000';
    ctx.font = 'Bold 140px Arial'; // Iets kleiner font voor lange namen
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tekst, 512, 256);
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

// === GANG POSTERS ===
const leftPosterTex1 = loader.load('art/image7.jpg');
const leftPoster1 = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 3),
  new THREE.MeshStandardMaterial({ map: leftPosterTex1, side: THREE.DoubleSide })
);
leftPoster1.rotation.y = Math.PI / 2;
leftPoster1.position.set(-2.99, wallHeight / 2, 14);
scene.add(leftPoster1);

const leftPosterTex2 = loader.load('art/image8.jpg');
const leftPoster2 = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 3),
  new THREE.MeshStandardMaterial({ map: leftPosterTex2, side: THREE.DoubleSide })
);
leftPoster2.rotation.y = Math.PI / 2;
leftPoster2.position.set(-2.99, wallHeight / 2, 19);
scene.add(leftPoster2);

const rightPosterTex1 = loader.load('art/image5.jpg');
const rightPoster1 = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 3),
  new THREE.MeshStandardMaterial({ map: rightPosterTex1, side: THREE.DoubleSide })
);
rightPoster1.rotation.y = -Math.PI / 2;
rightPoster1.position.set(2.99, wallHeight / 2, 16.5);
scene.add(rightPoster1);

const rightPosterTex2 = loader.load('art/image6.jpg');
const rightPoster2 = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 3),
  new THREE.MeshStandardMaterial({ map: rightPosterTex2, side: THREE.DoubleSide })
);
rightPoster2.rotation.y = -Math.PI / 2;
rightPoster2.position.set(2.99, wallHeight / 2, 20.5);
scene.add(rightPoster2);

// ---- DEUR (OPEN/DICHT) ----
const deurPivot = new THREE.Group();
deurPivot.position.set(0, 0, 17);

const deur = new THREE.Mesh(
  new THREE.BoxGeometry(1.51, 3, 0.12),
  new THREE.MeshStandardMaterial({
    map: deurTexture,
    roughness: 0.9,
    metalness: 0.0,
    color: new THREE.Color(0.6, 0.6, 0.6)
  })
);
const deur2 = deur.clone();
const deurPivot2 = new THREE.Group();

const bovenDeurMat = new THREE.MeshStandardMaterial({
  color: 0x000000,
  roughness: 0.8,
  metalness: 0.2
});

const bovenDeurCylinder = new THREE.Mesh(
  new THREE.CylinderGeometry(0.08, 0.08, 5.8, 32),
  bovenDeurMat
);
bovenDeurCylinder.position.set(0, 3.0, 12.15);
bovenDeurCylinder.rotation.z = Math.PI / 2;
scene.add(bovenDeurCylinder);

deurPivot2.position.set(0, 0, 17);
deur2.position.set(0.75, 1.5, -4.85);
deurPivot2.add(deur2);
scene.add(deurPivot2);

deur.position.set(-0.76, 1.5, -4.85);
deurPivot.add(deur);
scene.add(deurPivot);

// Deur animatie
let doorsOpen = false;
let animatingDoors = false;

const DOOR_DURATION = 2000;

const doorAnimation = {
  leftClosed: -0.76,
  leftOpen: -2.1,
  rightClosed: 0.75,
  rightOpen: 2.1
};

function easeInOut(t) {
  return t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

let pendingDoorState = null;

function animateDoors(open) {
  if (animatingDoors) return;
  animatingDoors = true;

  const start = performance.now();

  function loop(now) {
    const t = Math.min((now - start) / DOOR_DURATION, 1);
    const e = easeInOut(t);

    deur.position.x = open
      ? THREE.MathUtils.lerp(doorAnimation.leftClosed, doorAnimation.leftOpen, e)
      : THREE.MathUtils.lerp(doorAnimation.leftOpen, doorAnimation.leftClosed, e);

    deur2.position.x = open
      ? THREE.MathUtils.lerp(doorAnimation.rightClosed, doorAnimation.rightOpen, e)
      : THREE.MathUtils.lerp(doorAnimation.rightOpen, doorAnimation.rightClosed, e);

    if (t < 1) {
      requestAnimationFrame(loop);
    } else {
      doorsOpen = open;
      animatingDoors = false;

      if (pendingDoorState !== null) {
        const next = pendingDoorState;
        pendingDoorState = null;
        animateDoors(next);
      }
    }
  }

  requestAnimationFrame(loop);
}

const touchZone1 = new THREE.Mesh(
  new THREE.CylinderGeometry(0.6, 0.4, 0.1, 32),
  new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
);
touchZone1.position.set(0, 0.05, 12);
scene.add(touchZone1);

function triggerDoors(open) {
  if (animatingDoors) {
    pendingDoorState = open;
    return;
  }
  animateDoors(open);
}

const touchRadius = 5;
let isInTouchZone = false;

function checkTouchZones() {
  const camPos = camera.position;
  let currentlyInZone = camPos.distanceTo(touchZone1.position) < touchRadius;

  if (currentlyInZone && !isInTouchZone) triggerDoors(true);
  if (!currentlyInZone && isInTouchZone) triggerDoors(false);

  isInTouchZone = currentlyInZone;
}

function maakPlant(x, z) {
  const plantGroup = new THREE.Group();

  // pot
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.38, 0.45, 18),
    new THREE.MeshStandardMaterial({ color: 0x6b4f3a, roughness: 0.9 })
  );
  pot.position.y = 0.225;
  plantGroup.add(pot);

  // stam (1 solide stam → geen zweven meer)
  const stam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.07, 1.05, 10),
    new THREE.MeshStandardMaterial({ color: 0x3b2f2f })
  );
  stam.position.y = 0.95; // netjes van pot tot bladbasis
  plantGroup.add(stam);

  // blad materiaal
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x2f9e5c,
    roughness: 0.85
  });

  // compacte “top cluster” (geen zwevende losse hoogteverschillen)
  const bladPosities = [
    [0, 1.45, 0],
    [0.18, 1.45, 0.1],
    [-0.18, 1.45, -0.1],
    [0.12, 1.55, -0.12],
    [-0.12, 1.55, 0.12],
    [0, 1.6, 0.18],
    [0.08, 1.62, -0.08],
    [-0.08, 1.62, 0.08]
  ];

  bladPosities.forEach(p => {
    const blad = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 14, 14),
      leafMat
    );
    blad.position.set(p[0], p[1], p[2]);
    plantGroup.add(blad);
  });

  plantGroup.position.set(x, 0, z);
  scene.add(plantGroup);
}

// links en rechts van de deur
maakPlant(-3.6, 11.4);
maakPlant(3.6, 11.4);

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

// ---- FRAME POSITIE MAP (vanuit API-versie) ----
const KAMER_TO_ROOM = { 1: 0, 2: 1, 3: 2, 4: 3 };

const PLAATS_CONFIG = {
  1: { wall: 'back',  offset: -2.5 },
  2: { wall: 'back',  offset:  0   },
  3: { wall: 'back',  offset:  2.5 },
  4: { wall: 'left',  offset: -2.5 },
  5: { wall: 'left',  offset:  0   },
  6: { wall: 'left',  offset:  2.5 },
  7: { wall: 'right', offset: -2.5 },
  8: { wall: 'right', offset:  0   },
  9: { wall: 'right', offset:  2.5 },
};

function getFramePosition(kamerId, plaatsNr) {
  const roomIdx = KAMER_TO_ROOM[kamerId];
  if (roomIdx === undefined) return null;

  const kamer = roomPositions[roomIdx];
  const angle = doors[roomIdx].wallAngle;
  const wx = Math.sin(angle);
  const wz = Math.cos(angle);
  const px = Math.cos(angle);
  const pz = -Math.sin(angle);
  const cfg = PLAATS_CONFIG[plaatsNr];
  if (!cfg) return null;

  if (cfg.wall === 'back') {
    return {
      x: kamer.rx + wx * (roomDepth / 2 - 9) + px * cfg.offset,
      y: 2.5,
      z: kamer.rz + wz * (roomDepth / 2 - 9) + pz * cfg.offset,
      rotY: angle
    };
  } else if (cfg.wall === 'left') {
    return {
      x: kamer.rx + px * (roomWidth / 2 - 0.1) + wx * cfg.offset,
      y: 2.5,
      z: kamer.rz + pz * (roomWidth / 2 - 0.1) + wz * cfg.offset,
      rotY: angle - Math.PI / 2
    };
  } else {
    return {
      x: kamer.rx - px * (roomWidth / 2 - 0.1) + wx * cfg.offset,
      y: 2.5,
      z: kamer.rz - pz * (roomWidth / 2 - 0.1) + wz * cfg.offset,
      rotY: angle + Math.PI / 2
    };
  }
}

// ---- AUDIO & LEES MEER KNOPPEN ----
const audioButtons = [];
const leesMeerButtons = [];

// Hulpfunctie: maak knoppen aan voor een mesh
function addButtonsForMesh(mesh, audioPath = null) {
  const hasAudio = audioPath && audioPath.trim() !== '';
  
  // Alleen audio knop als er audio is
  if (hasAudio) {
    const btn = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.3, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    );
    btn.position.copy(mesh.position);
    btn.rotation.copy(mesh.rotation);
    btn.translateY(-1.0);
    btn.translateX(0.9);
    btn.translateZ(0.05);
    scene.add(btn);
    
    // Laad specifieke audio voor dit kunstwerk
    const audioLoader = new THREE.AudioLoader();
    audioLoader.setCrossOrigin('anonymous'); 
    const specificSound = new THREE.Audio(listener);
    
    // Construeer volledige URL als het een relatief pad is
    const fullAudioUrl = audioPath.startsWith('http') 
      ? audioPath 
      : `${API_BASE}/index.php${audioPath.startsWith('/') ? '' : '/'}${audioPath}`;
    
    audioLoader.load(fullAudioUrl, (buffer) => {
      specificSound.setBuffer(buffer);
      specificSound.setLoop(false);
      specificSound.setVolume(0.5);
    }, undefined, (err) => {
      console.warn('Kon audio niet laden:', fullAudioUrl, err);
    });
    
    audioButtons.push({ 
      button: btn, 
      isPlaying: false, 
      audio: specificSound,
      mesh: mesh 
    });
  }

  // Lees meer knop (altijd toevoegen als er beschrijving is, of fallback voor placeholders)
  const leesBtn = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x0000ff })
  );
  leesBtn.position.copy(mesh.position);
  leesBtn.rotation.copy(mesh.rotation);
  leesBtn.translateY(-1.0);
  // Als er geen audio is, zetten we de lees-meer knop meer naar rechts (centraal)
  leesBtn.translateX(hasAudio ? 0.5 : 0.7);
  leesBtn.translateZ(0.05);
  scene.add(leesBtn);
  
  leesMeerButtons.push({ 
    button: leesBtn, 
    data: mesh.userData 
  });
}


// ---- API KUNSTWERKEN LADEN ----
const API_BASE = 'http://10.120.5.132:8000';

// ---- API DATA LADEN ----
async function loadKunstwerkenFromAPI() {
  try {
    // 1. Haal Kunstwerken, Frames én Kamers op
    const [resKunst, resFrames, resKamers] = await Promise.all([
      fetch(`${API_BASE}/`),
      fetch(`${API_BASE}/frames`),
      fetch(`${API_BASE}/kamers`)
    ]);
    
    const kunstData  = await resKunst.json();
    const framesData = await resFrames.json();
    const kamersData = await resKamers.json();

    // ---- UPDATE DE BORDJES ----
    kamersData.forEach((kamer, i) => {
        if (signPlates[i]) {
            const canvas = signPlates[i].material.map.image; // Pak het bestaande canvas
            tekenBordje(canvas, kamer.Naam); // Teken de nieuwe naam erop
            signPlates[i].material.map.needsUpdate = true; // Vertel Three.js dat de texture is veranderd
        }
    });

    // ---- REST VAN JE BESTAANDE KUNSTWERK CODE ----
    const frameMap = {};
    framesData.forEach(f => {
      frameMap[f.FramePlaatsId] = { kamerId: f.KamerId, plaatsNr: f.PlaatsNr };
    });

    const artLoader = new THREE.TextureLoader();
    artLoader.crossOrigin = 'anonymous';

    kunstData.forEach(kunst => {
        // ... (je bestaande code om schilderijen te plaatsen) ...
        if (!kunst.ImageUrl || !kunst.FramePlaatsId) return;
        const frameInfo = frameMap[kunst.FramePlaatsId];
        if (!frameInfo) return;

        const pos = getFramePosition(frameInfo.kamerId, frameInfo.plaatsNr);
        if (!pos) return;

        const fullImageUrl = kunst.ImageUrl;


        artLoader.load(fullImageUrl, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          const aspect = tex.image.width / tex.image.height;
          const artW = aspect >= 1 ? 2 : 2 * aspect;
          const artH = aspect >= 1 ? 2 / aspect : 2;

          const mesh = new THREE.Mesh(
              new THREE.PlaneGeometry(artW, artH),
              new THREE.MeshStandardMaterial({ map: tex })
          );
          mesh.position.set(pos.x, pos.y, pos.z);
          mesh.rotation.y = pos.rotY;

          // ← userData HIER zetten, niet erna
          mesh.userData = {
              titel:  kunst.Naam         || 'Naamloos',
              tekst:  kunst.Beschrijving || '',
              auteur: kunst.Auteur       || '',
              imageUrl: fullImageUrl,
          };

          scene.add(mesh);
          addButtonsForMesh(mesh, kunst.Audiopath);
      });
    });

  } catch (e) {
    console.warn('Kon data niet laden van API:', e);
  }
}

loadKunstwerkenFromAPI();

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

// ---- POPUP ----
function toonInfo(data) {
  if (!data) return;
  document.exitPointerLock();

  const title  = data.titel       || data.Naam         || 'Naamloos Kunstwerk';
  const description = data.tekst  || data.Beschrijving  || 'Geen beschrijving beschikbaar.';
  const author = data.auteur      || data.Auteur        || 'Onbekende kunstenaar';

  const overlay = document.createElement('div');
  overlay.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:1000;";

  overlay.innerHTML = `
    <div id="kaart" style="
      background:rgba(255,255,255,0.08);
      backdrop-filter:blur(12px);
      -webkit-backdrop-filter:blur(12px);
      border:1px solid rgba(255,255,255,0.15);
      padding:30px;
      width:600px;
      border-radius:10px;
      display:flex;
      gap:20px;
      font-family:sans-serif;
      color:white;
    ">
      <div style="flex:1;">
        ${data.imageUrl
          ? `<img src="${data.imageUrl}" style="width:100%; aspect-ratio:4/3; object-fit:contain; background:#111; border-radius:4px;" />`
          : `<div style="width:100%; aspect-ratio:4/3; background:#eee; display:flex; justify-content:center; align-items:center; color:#666; font-weight:bold;">Geen afbeelding</div>`
        }
      </div>
      <div style="flex:1; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <h2 style="color:#aa1eaa; margin:0 0 5px 0;">${title}</h2>
          <h4 style="margin:0 0 10px 0; color:#ccc; font-style:italic;">Door: ${author}</h4>
          <p style="line-height:1.6; color:#ddd; font-size:14px;">${description}</p>
        </div>
        <button id="knop" style="padding:10px 20px; background:white; color:black; border:none; border-radius:4px; cursor:pointer; align-self:flex-end;">Terug</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  overlay.querySelector('#knop').onclick = () => {
    overlay.remove();
    canvas.requestPointerLock();
  };
}

// ---- CONTROLS ----
const look = { yaw: 0, pitch: 0 };
const speed = 0.05;
let keys = {};

window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

canvas.addEventListener('click', () => canvas.requestPointerLock());

document.addEventListener('mousemove', e => {
  if (document.pointerLockElement === canvas) {
    look.yaw -= e.movementX * 0.002;
    look.pitch -= e.movementY * 0.002;
    look.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, look.pitch));
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

// ---- KLIK HANDLER (audio + lees meer) ----
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let currentPlaying = null;

window.addEventListener('click', () => {
  if (document.pointerLockElement !== canvas) return;

  mouse.x = 0;
  mouse.y = 0;
  raycaster.setFromCamera(mouse, camera);

  // Audio check
  const audioHits = raycaster.intersectObjects(audioButtons.map(b => b.button));
  if (audioHits.length > 0) {
    const btn = audioButtons.find(b => b.button === audioHits[0].object);
    if (btn && btn.audio) {
      // Stop andere audio eerst
      audioButtons.forEach(otherBtn => {
        if (otherBtn.isPlaying && otherBtn !== btn) {
          otherBtn.audio.stop();
          otherBtn.isPlaying = false;
          otherBtn.button.material.color.set(0x00ff00);
        }
      });
      
      if (btn.isPlaying) {
        btn.audio.stop();
        btn.isPlaying = false;
        btn.button.material.color.set(0x00ff00);
      } else {
        btn.audio.play();
        btn.isPlaying = true;
        btn.button.material.color.set(0xff0000);
      }
      return;
    }
  }

  // Lees meer check
  const leesMeerHits = raycaster.intersectObjects(leesMeerButtons.map(b => b.button));
  if (leesMeerHits.length > 0) {
    const gevonden = leesMeerButtons.find(b => b.button === leesMeerHits[0].object);
    if (gevonden) toonInfo(gevonden.data);
  }
});

function updateMovement() {
  const forward = new THREE.Vector3(-Math.sin(look.yaw), 0, -Math.cos(look.yaw));
  const right = new THREE.Vector3(Math.cos(look.yaw), 0, -Math.sin(look.yaw));

  const next = camera.position.clone();

  if (keys['KeyW']) next.addScaledVector(forward, speed);
  if (keys['KeyS']) next.addScaledVector(forward, -speed);
  if (keys['KeyA']) next.addScaledVector(right, -speed);
  if (keys['KeyD']) next.addScaledVector(right, speed);

  // Eerst probeer volledige beweging, dan X-only, dan Z-only
  // Zo kun je langs muren schuiven maar niet door hoeken
  if (isAllowed(next.x, next.z)) {
    camera.position.x = next.x;
    camera.position.z = next.z;
  } else if (isAllowed(next.x, camera.position.z)) {
    camera.position.x = next.x;
  } else if (isAllowed(camera.position.x, next.z)) {
    camera.position.z = next.z;
  }

  camera.rotation.order = 'YXZ';
  camera.rotation.y = look.yaw;
  camera.rotation.x = look.pitch;
}

function isAllowed(x, z) {
  const margin = 0.4;

  // Entreegang
  if (x > -3 + margin && x < 3 - margin && z > 12 && z < 22) return true;

  // Hoofdhal pentagon
  if (insidePentagon(x, z, margin)) return true;

  // Kamers
  for (let i = 0; i < roomPositions.length; i++) {
    const r = roomPositions[i];
    const angle = doors[i].wallAngle;
    const dx = x - r.rx;
    const dz = z - r.rz;
    const localX = dx * Math.cos(angle) - dz * Math.sin(angle);
    const localZ = dx * Math.sin(angle) + dz * Math.cos(angle);
    if (
      localX > -roomWidth / 2 + margin &&
      localX <  roomWidth / 2 - margin &&
      localZ > -roomDepth / 2 + margin &&
      localZ <  roomDepth / 2 + 1.5
    ) return true;
  }

  return false;
}

function insidePentagon(x, z, margin = 0.4) {
  for (let i = 0; i < sides; i++) {
    const angle1 = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const angle2 = ((i + 1) / sides) * Math.PI * 2 - Math.PI / 2;
    const x1 = Math.cos(angle1) * radius;
    const z1 = Math.sin(angle1) * radius;
    const x2 = Math.cos(angle2) * radius;
    const z2 = Math.sin(angle2) * radius;
    const nx = -(z2 - z1);
    const nz =   x2 - x1;
    const len = Math.sqrt(nx * nx + nz * nz);
    const dot = ((x - x1) * nx + (z - z1) * nz) / len;
    // Zijde 2 = gang-opening, ruimere drempel zodat je erdoor kunt
    const threshold = (i === 2) ? -openingWidth / 2 : margin;
    if (dot < threshold) return false;
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

// ---- JOYSTICK ----
function initJoystick({ camera, joystickEl, isMobile }) {
  if (!joystickEl) {
    console.error("joystickEl is null");
    return { update() {}, resize() {} };
  }

  const move = { x: 0, y: 0 };

  if (isMobile) joystickEl.style.display = 'block';

  const joystick = nipplejs.create({
    zone: joystickEl,
    mode: 'static',
    position: { left: '55px', bottom: '55px' },
    color: 'white',
    size: 80
  });

  joystick.on('move', (_, data) => {
    if (!data || !data.vector) return;
    move.x = data.vector.x;
    move.y = -data.vector.y;
  });

  joystick.on('end', () => {
    move.x = 0;
    move.y = 0;
  });

  function update() {
    const spd = 0.05;
    const forward = new THREE.Vector3(Math.sin(look.yaw), 0, Math.cos(look.yaw));
    const right   = new THREE.Vector3(Math.cos(look.yaw), 0, -Math.sin(look.yaw));

    const next = camera.position.clone();
    next.add(forward.multiplyScalar(move.y * spd));
    next.add(right.multiplyScalar(move.x * spd));

    if (isAllowed(next.x, next.z)) {
      camera.position.x = next.x;
      camera.position.z = next.z;
    }
  }

  return { update };
}

const joystickEl = document.getElementById('joystick-zone');

const isMobile =
  /Android|iPhone|iPad/i.test(navigator.userAgent) || ('ontouchstart' in window);

if (!isMobile) joystickEl.style.display = "none";

const joystickControls = initJoystick({ camera, joystickEl, isMobile });

// ---- ANIMATIE LOOP ----
function animate() {
  requestAnimationFrame(animate);
  updateMovement();
  joystickControls.update();
  renderer.render(scene, camera);
  checkTouchZones();
}
animate();