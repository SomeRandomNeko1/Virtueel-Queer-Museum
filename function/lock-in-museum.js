renderer.domElement.addEventListener('click', (event) => {
  if (activePaintingUrl) return;

  if (document.pointerLockElement === renderer.domElement) {
    if (pickPainting(0, 0)) return;
  } else {
    const normalizedX = (event.clientX / window.innerWidth) * 2 - 1;
    const normalizedY = -(event.clientY / window.innerHeight) * 2 + 1;
    if (pickPainting(normalizedX, normalizedY)) return;
  }

  renderer.domElement.requestPointerLock();
});

window.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== renderer.domElement) return;
  yaw   -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pitch));
});