const audioButtons = [];
const audioLoader = new THREE.AudioLoader();
const listener = new THREE.AudioListener();
camera.add(listener);

// AudioContext hervatten na gebruikersinteractie
function resumeAudioContext() {
    if (listener.context.state === 'suspended') {
        listener.context.resume().then(() => {
            console.log('AudioContext resumed');
        });
    }
}

// Speaker icon generator
function createSpeakerIconTexture(isPlaying) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Achtergrond cirkel
    ctx.fillStyle = isPlaying ? '#ff4444' : '#44ff44';
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.fill();
    
    // Speaker symbool
    ctx.fillStyle = 'white';
    ctx.save();
    ctx.translate(128, 128);
    
    // Speaker body
    const speaker = new Path2D('M-40,-30 L-10,-30 L20,-60 L20,60 L-10,30 L-40,30 Z');
    ctx.fill(speaker);
    
    // Golven als niet muted/playing
    if (isPlaying) {
        // Pauze tekens
        ctx.fillRect(30, -30, 15, 60);
        ctx.fillRect(55, -30, 15, 60);
    } else {
        // Sound waves
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(0, 0, 50, -Math.PI/3, Math.PI/3);
        ctx.stroke();
    }
    
    ctx.restore();
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

// Maak audio knop voor een specifiek kunstwerk
function createAudioButton(mesh, audioUrl) {
    if (!audioUrl) return null;
    
    // Maak groep voor knop (makkelijker positioneren)
    const buttonGroup = new THREE.Group();
    buttonGroup.position.copy(mesh.position);
    buttonGroup.rotation.copy(mesh.rotation);
    
    // Positioneer onder het schilderij (pas Y aan op basis van schilderij hoogte)
    const artworkHeight = mesh.geometry.parameters.height;
    buttonGroup.translateY(-(artworkHeight / 2) - 0.8); // 80cm onder het schilderij
    buttonGroup.translateZ(0.05); // Iets voor de wand
    
    // Fysieke knop (hitbox)
    const buttonMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.1),
        new THREE.MeshStandardMaterial({ 
            color: 0x00aa00,
            emissive: 0x002200,
            emissiveIntensity: 0.2
        })
    );
    
    // Icon plane
    const iconGeo = new THREE.PlaneGeometry(0.4, 0.4);
    const iconMat = new THREE.MeshBasicMaterial({ 
        map: createSpeakerIconTexture(false),
        transparent: true
    });
    const iconMesh = new THREE.Mesh(iconGeo, iconMat);
    iconMesh.position.z = 0.06;
    
    buttonGroup.add(buttonMesh);
    buttonGroup.add(iconMesh);
    scene.add(buttonGroup);
    
    // Laad audio specifiek voor dit kunstwerk
    const sound = new THREE.Audio(listener);
    
    // Gebruik crossOrigin voor CORS
    audioLoader.load(audioUrl, (buffer) => {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(0.8);
        console.log('Audio geladen:', audioUrl);
    }, undefined, (err) => {
        console.warn('Kon audio niet laden:', audioUrl, err);
        // Maak knop grijs als laden faalt
        buttonMesh.material.color.set(0x666666);
    });
    
    const btnData = {
        group: buttonGroup,
        button: buttonMesh,
        icon: iconMesh,
        sound: sound,
        isPlaying: false,
        url: audioUrl
    };
    
    audioButtons.push(btnData);
    return btnData;
}

// Raycasting voor audio knoppen
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (e) => {
    // Alleen als pointer locked (game mode) of als we niet op UI klikken
    if (document.pointerLockElement !== canvas && e.target !== canvas) return;
    
    // Bereken mouse positie
    if (document.pointerLockElement === canvas) {
        mouse.x = 0;
        mouse.y = 0;
    } else {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }
    
    raycaster.setFromCamera(mouse, camera);
    
    // Check intersecties met audio knoppen
    const buttonMeshes = audioButtons.map(b => b.button);
    const hits = raycaster.intersectObjects(buttonMeshes);
    
    if (hits.length > 0) {
        // Hervat audio context (browser beleid)
        resumeAudioContext();
        
        const hitBtn = audioButtons.find(b => b.button === hits[0].object);
        if (!hitBtn) return;
        
        // Stop andere spelende audio
        audioButtons.forEach(other => {
            if (other !== hitBtn && other.isPlaying) {
                other.sound.stop();
                other.isPlaying = false;
                other.icon.material.map = createSpeakerIconTexture(false);
                other.button.material.color.set(0x00aa00);
                other.button.material.emissive.set(0x002200);
            }
        });
        
        if (hitBtn.isPlaying) {
            // Pause
            hitBtn.sound.pause();
            hitBtn.isPlaying = false;
            hitBtn.icon.material.map = createSpeakerIconTexture(false);
            hitBtn.button.material.color.set(0x00aa00);
            hitBtn.button.material.emissive.set(0x002200);
        } else {
            // Play (alleen als buffer geladen is)
            if (hitBtn.sound.buffer) {
                hitBtn.sound.play();
                hitBtn.isPlaying = true;
                hitBtn.icon.material.map = createSpeakerIconTexture(true);
                hitBtn.button.material.color.set(0xaa0000);
                hitBtn.button.material.emissive.set(0x220000);
            } else {
                console.log('Audio nog niet geladen');
            }
        }
    }
});

// ---- INTEGRATIE MET API ----
// Pas je loadKunstwerkenFromAPI functie aan:

async function loadKunstwerkenFromAPI() {
    try {
        const [resKunst, resFrames] = await Promise.all([
            fetch(`${API_BASE}/`),
            fetch(`${API_BASE}/frames`)
        ]);
        const kunstData = await resKunst.json();
        const framesData = await resFrames.json();

        const frameMap = {};
        framesData.forEach(f => {
            frameMap[f.FramePlaatsId] = { kamerId: f.KamerId, plaatsNr: f.PlaatsNr };
        });

        const artLoader = new THREE.TextureLoader();
        artLoader.crossOrigin = 'anonymous';

        kunstData.forEach(kunst => {
            if (!kunst.ImageUrl || !kunt.FramePlaatsId) return;
            const frameInfo = frameMap[kunst.FramePlaatsId];
            if (!frameInfo) return;

            const pos = getFramePosition(frameInfo.kamerId, frameInfo.plaatsNr);
            if (!pos) return;

            // Laad afbeelding
            const fileName = kunst.ImageUrl.substring(kunst.ImageUrl.lastIndexOf('/') + 1);
            const fullImageUrl = `${API_BASE}/index.php/uploads/${fileName}`;

            artLoader.load(fullImageUrl, (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                
                const w = tex.image?.width || 1;
                const h = tex.image?.height || 1;
                const aspect = w / h;
                const artW = aspect >= 1 ? 2 : 2 * aspect;
                const artH = aspect >= 1 ? 2 / aspect : 2;

                const mesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(artW, artH),
                    new THREE.MeshStandardMaterial({ map: tex })
                );
                mesh.position.set(pos.x, pos.y, pos.z);
                mesh.rotation.y = pos.rotY;
                mesh.userData = {
                    titel: kunst.Naam || 'Naamloos',
                    tekst: kunst.Beschrijving || '',
                    auteur: kunst.Auteur || '',
                };
                scene.add(mesh);
                
                // BELANGRIJK: Maak audio knop als er audio is
                if (kunt.Audiopath && kunst.Audiopath.trim() !== '') {
                    const audioFileName = kunst.Audiopath.substring(kunst.Audiopath.lastIndexOf('/') + 1);
                    const fullAudioUrl = kunst.Audiopath.startsWith('http') 
                        ? kunst.Audiopath 
                        : `${API_BASE}/uploads/${audioFileName}`;
                    
                    createAudioButton(mesh, fullAudioUrl);
                }
                
                // Lees meer knop (bestaande functionaliteit)
                addLeesMeerButton(mesh);
                
            });
        });

    } catch (e) {
        console.warn('Kon kunstwerken niet laden:', e);
    }
}

// Helper voor lees meer knop (uit je vorige code)
function addLeesMeerButton(mesh) {
    const btn = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.3, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x0000ff })
    );
    btn.position.copy(mesh.position);
    btn.rotation.copy(mesh.rotation);
    btn.translateY(-1.0);
    btn.translateX(0.5); // Naast audio knop, of pas aan
    btn.translateZ(0.05);
    scene.add(btn);
    
    leesMeerButtons.push({ 
        button: btn, 
        data: mesh.userData 
    });
}