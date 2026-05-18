// Schilderij popup — gebruikt globale vars uit demo.js:
// activePaintingUrl, renderer, keys, raycaster, pointer, clickablePaintings, camera

function el(tag, styles, props = {}) {
  const e = document.createElement(tag);
  Object.assign(e.style, styles);
  Object.assign(e, props);
  return e;
}

// Basis popup-elementen en styling
const paintingOverlay     = el('div', { position:'fixed', inset:'0', display:'none', alignItems:'center', justifyContent:'center', background:'rgba(120,120,120,0.55)', backdropFilter:'blur(3px)', zIndex:'30', padding:'32px' });
const paintingPopupContent = el('div', { display:'flex', flexDirection:'column', alignItems:'center', gap:'12px' });
const paintingCloseButton  = el('button', { position:'fixed', top:'16px', right:'16px', width:'30px', height:'30px', borderRadius:'50%', border:'none', background:'rgba(0,0,0,0.4)', color:'#fff', font:'600 18px/1 Arial,sans-serif', cursor:'pointer', zIndex:'31' }, { type:'button', textContent:'x' });
const paintingOverlayImage = el('img',   { maxWidth:'min(80vw,1000px)', maxHeight:'80vh', display:'block', background:'#fff', padding:'14px', boxShadow:'0 20px 80px rgba(0,0,0,0.35)' }, { alt:'Selected painting' });
const paintingInfoButton   = el('button', { padding:'10px 14px', border:'1px solid #111', background:'rgba(255,255,255,0.95)', color:'#111', cursor:'pointer', font:'600 14px/1.2 Arial,sans-serif' }, { type:'button', textContent:'Toon info' });
const paintingInfoBox      = el('div',   { display:'none', position:'absolute', bottom:'14px', left:'14px', right:'14px', padding:'12px 14px', background:'rgba(0,0,0,0.4)', border:'none', color:'#fff', font:'500 14px/1.4 Arial,sans-serif', textShadow:'0 1px 4px rgba(0,0,0,0.9)' });

// Informatie per schilderij op basis van asset-pad
const paintingMetadata = {
  'assets/sunflowers-van-gogh.avif':          { title:'Sunflowers',      author:'Vincent van Gogh',                    description:'Een beroemde reeks stillevens waarin Van Gogh met kleur, contrast en penseelstreek emotie en energie laat zien.' },
  'assets/van-gogh-wincent-starry-night.jpg': { title:'The Starry Night', author:'Vincent van Gogh',                    description:'Nachtlandschap met draaiende lucht en sterk kleurgebruik, een icoon van post-impressionisme en expressie.' },
  'assets/lake-van-gogh.jpg':                 { title:'Lake Scene',       author:'Vincent van Gogh (toegewezen in demo)', description:'Rustige compositie met focus op licht en wateroppervlak, geplaatst als thematisch museumstuk in deze scène.' },
  'assets/prettyflower-van-gogh.jpg':         { title:'Flower Study',     author:'Vincent van Gogh (toegewezen in demo)', description:'Bloemstudie waarin textuur en kleurdominantie de aandacht trekken, passend bij de andere werken in de ruimte.' }
};

// DOM-opbouw: afbeelding met info-overlay + knop eronder
const paintingImageWrapper = el('div', { position:'relative', display:'inline-block' });
paintingImageWrapper.appendChild(paintingOverlayImage);
paintingImageWrapper.appendChild(paintingInfoBox);
paintingPopupContent.appendChild(paintingImageWrapper);
paintingPopupContent.appendChild(paintingInfoButton);
paintingOverlay.appendChild(paintingCloseButton);
paintingOverlay.appendChild(paintingPopupContent);
document.body.appendChild(paintingOverlay);

// Event: sluit popup via X-knop
paintingCloseButton.addEventListener('click', closePaintingOverlay);

// Event: toon/verberg infoblok voor het huidige schilderij
paintingInfoButton.addEventListener('click', () => {
  if (!activePaintingUrl) return;
  const show = paintingInfoBox.style.display === 'none';
  paintingInfoBox.style.display = show ? 'block' : 'none';
  paintingInfoButton.textContent = show ? 'Verberg info' : 'Toon info';
});

// Event: klik op de grijze achtergrond sluit popup
paintingOverlay.addEventListener('click', (e) => {
  if (e.target === paintingOverlay) closePaintingOverlay();
});

// Sluit popup en reset tijdelijke UI-state
function closePaintingOverlay() {
  activePaintingUrl = null;
  paintingOverlay.style.display = 'none';
  paintingOverlayImage.removeAttribute('src');
  paintingInfoBox.style.display = 'none';
  paintingInfoButton.textContent = 'Toon info';
}

// Open popup voor een afbeelding en laad bijbehorende metadata
function openPaintingOverlay(imageUrl) {
  activePaintingUrl = imageUrl;
  paintingOverlayImage.src = imageUrl;
  paintingOverlay.style.display = 'flex';

  // Fallback als een afbeelding geen metadata heeft
  const { title, author, description } = paintingMetadata[imageUrl] || { title:'Onbekende titel', author:'Onbekende auteur', description:'Voor dit schilderij is nog geen uitleg toegevoegd.' };
  paintingInfoBox.innerHTML = `<strong>${title}</strong><br><strong>Auteur:</strong> ${author}<br>${description}`;
  paintingInfoBox.style.display = 'none';
  paintingInfoButton.textContent = 'Toon info';

  // Verlaat pointer lock zodat de gebruiker direct in de popup kan klikken
  if (document.pointerLockElement === renderer.domElement) document.exitPointerLock();

  // Stop alle bewegingstoetsen zodat de camera stil blijft tijdens popup
  Object.keys(keys).forEach((k) => { keys[k] = false; });
}

// Raycast op schilderijen; bij hit wordt de popup geopend
function pickPainting(normalizedX, normalizedY) {
  pointer.set(normalizedX, normalizedY);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(clickablePaintings, false)[0];
  if (!hit?.object.userData.paintingUrl) return false;
  openPaintingOverlay(hit.object.userData.paintingUrl);
  return true;
}

