function fitTextureToVisibleBounds(tex) {
  const image = tex.image;
  if (!image || !image.width || !image.height) return;

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');
  if (!context) return;

  context.drawImage(image, 0, 0);
  const { data, width, height } = context.getImageData(0, 0, image.width, image.height);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return;

  const contentWidth = maxX - minX + 1;
  const contentHeight = maxY - minY + 1;

  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(contentWidth / width, contentHeight / height);
  tex.offset.set(minX / width, 1 - (maxY + 1) / height);
  tex.needsUpdate = true;
}

function loadFrameTexture(loader, path) {
  const tex = loader.load(path, (loaded) => {
    loaded.colorSpace = THREE.SRGBColorSpace;
    fitTextureToVisibleBounds(loaded);
  });
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function addBillboard(scene, loader, url, x, y, z, size = 2.5) {
  const tex = loader.load(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.position.set(x, y, z);
  sprite.scale.set(size, size, 1);
  scene.add(sprite);
  return sprite;
}

function addFramedPainting(scene, loader, clickablePaintings, options) {
  const {
    url,
    x,
    y,
    z,
    maxArtSide = 1.2,
    rotationY = 0,
    frameTex,
    frameOverhang = 0.12
  } = options;

  const normal = new THREE.Vector3(Math.sin(rotationY), 0, Math.cos(rotationY));
  const inset = 0.001;

  loader.load(
    url,
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;

      const imageWidth = tex.image?.naturalWidth || tex.image?.videoWidth || tex.image?.width || 1;
      const imageHeight = tex.image?.naturalHeight || tex.image?.videoHeight || tex.image?.height || 1;
      const aspect = imageWidth / imageHeight;

      let artWidth = maxArtSide;
      let artHeight = maxArtSide;

      if (aspect >= 1) {
        artWidth = maxArtSide;
        artHeight = maxArtSide / aspect;
      } else {
        artHeight = maxArtSide;
        artWidth = maxArtSide * aspect;
      }

      const frameWidth = artWidth + frameOverhang * 2;
      const frameHeight = artHeight + frameOverhang * 2;
      const frameGeo = new THREE.PlaneGeometry(frameWidth, frameHeight);
      const frameMat = new THREE.MeshStandardMaterial({ map: frameTex, transparent: true });

      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.set(x, y, z);
      frame.rotation.y = rotationY;
      scene.add(frame);

      const artGeo = new THREE.PlaneGeometry(artWidth, artHeight);
      const artMat = new THREE.MeshStandardMaterial({ map: tex });
      const art = new THREE.Mesh(artGeo, artMat);
      art.position.set(x + normal.x * inset, y, z + normal.z * inset);
      art.rotation.y = rotationY;
      art.userData.paintingUrl = url;
      clickablePaintings.push(art);
      scene.add(art);
    },
    undefined,
    () => {
      console.warn(`Failed to load painting: ${url}`);
    }
  );
}