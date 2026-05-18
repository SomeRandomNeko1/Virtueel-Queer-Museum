 //Schilderij schaling


function createPainting({
    image,
    x = 0,
    y = 2,
    z = 0.56,
    maxWidth = 3
}) {

    const texture = textureLoader.load(image, tex => {

        /* BETERE KWALITEIT */

        tex.colorSpace = THREE.SRGBColorSpace;

        tex.anisotropy =
            renderer.capabilities.getMaxAnisotropy();

        tex.minFilter =
            THREE.LinearMipmapLinearFilter;

        tex.magFilter =
            THREE.LinearFilter;

        /* image verhouding */

        const img = tex.image;

        const aspect =
            img.width / img.height;

        const width = maxWidth;

        const height =
            width / aspect;

        /* Schilderij schalen */

        painting.geometry.dispose();

        painting.geometry =
            new THREE.PlaneGeometry(
                width,
                height
            );

        /* Frame schalen */

        frame.geometry.dispose();

        frame.geometry =
            new THREE.BoxGeometry(
                width + 0.25,
                height + 0.25,
                0.15
            );
    });

    /* Schilderij */

    const painting = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshStandardMaterial({
            map: texture
        })
    );

    painting.position.set(
        x,
        y,
        z
    );

    painting.castShadow = true;

    scene.add(painting);

    /* Frame */

    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(
            1.2,
            1.2,
            0.15
        ),
        new THREE.MeshStandardMaterial({
            color: 0x5c3a21
        })
    );

    frame.position.set(
        x,
        y,
        z - 0.08
    );

    frame.castShadow = true;

    scene.add(frame);
}


   //Schilderijen


const painting1 = createPainting({
    image: './img/schilderij1.jpg',
    x: 3,
    y: 4,
    maxWidth: 3
});