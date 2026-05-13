window.addEventListener('wheel', (e) => {
  camera.fov = Math.max(30, Math.min(100, camera.fov + e.deltaY * 0.01));
  camera.updateProjectionMatrix();
});

function updateCameraFromAngles() {
  const cosPitch = Math.cos(pitch);
  camera.lookAt(
    camera.position.x + Math.sin(yaw) * cosPitch,
    camera.position.y + Math.sin(pitch),
    camera.position.z + Math.cos(yaw) * cosPitch
  );
}