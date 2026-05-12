// 1. De Help-knop (het kleine rondje rechtsonder)
const helpKnop = document.createElement('div');
helpKnop.innerHTML = "?";
helpKnop.style.cssText = "position:fixed; bottom:20px; right:20px; width:40px; height:40px; background:#444; color:white; border-radius:50%; display:flex; justify-content:center; align-items:center; cursor:pointer; z-index:4000; font-family:sans-serif; border:none; box-shadow: 0px 2px 5px rgba(0,0,0,0.3);";
document.body.appendChild(helpKnop);

// 2. Het instructiescherm (Overlay)
const infoScherm = document.createElement('div');
infoScherm.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.7); color:white; display:flex; justify-content:center; align-items:center; z-index:5000; font-family:sans-serif; cursor:pointer;";

const isMobiel = "ontouchstart" in window;

infoScherm.innerHTML = `
    <div style="padding:25px; background:white; color:black; border-radius:8px; text-align:center; width:280px; box-shadow: 0px 4px 15px rgba(0,0,0,0.5);">
        <h3 style="margin-top:0;">Besturing voor VR museum</h3>
        <div style="margin:15px 0; font-size:14px; line-height:1.5; text-align:left;">
            ${isMobiel ? 
                "• Swipe om rond te kijken<br>• Tik op schilderij voor info" : 
                "• Lopen: WASD <br>• Kijken: Muis<br>• Klik op schilderij voor info"}
        </div>
        <button style="padding:10px 20px; background:#333; color:white; border:none; border-radius:4px; cursor:pointer; width:100%;">Start</button>
    </div>
`;
document.body.appendChild(infoScherm);

// 3. Functies voor openen en sluiten
function startMuseum() {
    infoScherm.style.display = "none";
    // Start PointerLock alleen op PC
    if (!isMobiel && typeof canvas !== 'undefined') {
        canvas.requestPointerLock();
    }
}

function toonGids() {
    infoScherm.style.display = "flex";
}

// 4. Klik-events
infoScherm.onclick = startMuseum;

helpKnop.onclick = function(e) {
    e.stopPropagation(); 
    toonGids();
};

// Als je op ESC drukt op PC, komt de gids terug
document.addEventListener('pointerlockchange', function() {
    if (document.pointerLockElement === null && !isMobiel) {
        toonGids();
    }
});
