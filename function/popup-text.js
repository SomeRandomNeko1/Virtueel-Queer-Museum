const schilderijen = [];
const infoData = [
    { titel: "Identiteit", tekst: "Dit werk verkent gender en zelfexpressie binnen de queer gemeenschap." },
    { titel: "Geschiedenis", tekst: "Een eerbetoon aan de voorvechters van gelijkheid." },
    { titel: "Toekomst", tekst: "Samen bouwen we aan een inclusieve wereld." }
];

// 1. Zoek schilderijen en koppel tekst
let index = 0;
scene.traverse(function(obj) {
    // Check of het een vlak is met een afbeelding
    if (obj.isMesh && obj.geometry.type === "PlaneGeometry" && obj.material.map) {
        if (infoData[index]) {
            obj.userData = infoData[index];
            schilderijen.push(obj);
            index++;
        }
    }
});

// 2. Maak het richtpunt (de stip)
const dot = document.createElement('div');
dot.style.cssText = "position:fixed; top:50%; left:50%; width:6px; height:6px; background:black; border-radius:50%; transform:translate(-50%,-50%); pointer-events:none; border:1px solid white; z-index:100;";
document.body.appendChild(dot);

// 3. Klik detectie
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(0, 0);

window.addEventListener('mousedown', function() {
    if (document.pointerLockElement !== canvas) return;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(schilderijen);

    if (hits.length > 0) {
        toonInfo(hits[0].object.userData);
    }
});

// 4. Info scherm functie
function toonInfo(data) {
    document.exitPointerLock();
    dot.style.display = 'none';

    // Maak de overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:1000;";
    
    overlay.innerHTML = `
        <div id="kaart" style="background:white; padding:25px; width:260px; border-radius:15px; text-align:center; font-family:sans-serif; transition:0.3s;">
            <h2 style="color:#aa1eaa; margin:0 0 10px 0;">${data.titel}</h2>
            <p id="tekst" style="display:none; line-height:1.5; color:#333;">${data.tekst}</p>
            <button id="knop" style="margin-top:15px; padding:10px 20px; background:#ff85aa; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">Lees meer</button>
        </div>`;

    document.body.appendChild(overlay);

    const knop = overlay.querySelector('#knop');
    const kaart = overlay.querySelector('#kaart');
    const tekst = overlay.querySelector('#tekst');

    knop.onclick = function() {
        if (knop.innerText === "Lees meer") {
            tekst.style.display = "block";
            kaart.style.width = "350px";
            knop.innerText = "Sluiten";
        } else {
            overlay.remove();
            dot.style.display = 'block';
            canvas.requestPointerLock();
        }
    };
}
