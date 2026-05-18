// --- POPUP (VERSCHIJNT MAAR 1 KEER) ---
let popupActief = true;

// 1. Achtergrond & Venster in één keer aanmaken
const overlay = document.createElement('div');
Object.assign(overlay.style, {
  position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.85)', display: 'flex', justifyContent: 'center',
  alignItems: 'center', zIndex: '9999', fontFamily: 'sans-serif'
});
document.body.appendChild(overlay);

const popup = document.createElement('div');
Object.assign(popup.style, {
  backgroundColor: '#fff', padding: '25px', borderRadius: '12px',
  textAlign: 'center', maxWidth: '400px', width: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
});
overlay.appendChild(popup);

// 2. Inhoud (Titel, Tekst en Donkere Knop)
popup.innerHTML = `
  <h2 style="color: #d32f2f; margin-top: 0;">Systeemeisen</h2>
  <p style="line-height: 1.5; color: #333;">
    Dit VR Museum vereist veel prestaties.<br>
    <b>Oude apparaten werken niet.</b><br><br>
    Gebruik een moderne laptop, tablet of telefoon.
  </p>
  <button id="sluitPopupBtn" style="margin-top: 15px; padding: 12px; background-color: #222; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100%; transition: background 0.2s;">
    BEGRIJPEN & STARTEN
  </button>
`;

// 3. Hover-effect voor de donkere knop (optioneel, voor desktop)
const knop = document.getElementById('sluitPopupBtn');
knop.addEventListener('mouseenter', () => knop.style.backgroundColor = '#444');
knop.addEventListener('mouseleave', () => knop.style.backgroundColor = '#222');

// 4. Verwijder de popup definitief na klikken
knop.addEventListener('click', () => {
  overlay.remove(); // Verwijdert de HTML volledig uit de pagina
  popupActief = false; // Activeert de Three.js besturing
});
