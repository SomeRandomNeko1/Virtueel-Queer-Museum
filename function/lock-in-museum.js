function setupPointerLockAndPicking(renderer, isPaintingOpen, pickPainting, onLookDelta) {
  renderer.domElement.addEventListener('click', (event) => {
    if (isPaintingOpen()) return;

    if (document.pointerLockElement === renderer.domElement) {
      if (pickPainting(0, 0)) return;
    } else {
      const normalizedX = (event.clientX / window.innerWidth) * 2 - 1;
      const normalizedY = -(event.clientY / window.innerHeight) * 2 + 1;
      if (pickPainting(normalizedX, normalizedY)) return;
    }

    renderer.domElement.requestPointerLock();
  });

  window.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement !== renderer.domElement) return;
    onLookDelta(event.movementX, event.movementY);
  });
}