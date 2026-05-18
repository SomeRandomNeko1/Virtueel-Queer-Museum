function setupZoom(camera, minFov = 30, maxFov = 100, sensitivity = 0.01) {
  window.addEventListener('wheel', (event) => {
    camera.fov = Math.max(minFov, Math.min(maxFov, camera.fov + event.deltaY * sensitivity));
    camera.updateProjectionMatrix();
  });
}

function updateCameraFromAngles(camera, yaw, pitch) {
  const cosPitch = Math.cos(pitch);
  camera.lookAt(
    camera.position.x + Math.sin(yaw) * cosPitch,
    camera.position.y + Math.sin(pitch),
    camera.position.z + Math.cos(yaw) * cosPitch
  );
}