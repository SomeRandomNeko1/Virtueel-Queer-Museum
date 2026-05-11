/*Audio*/
 {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let currentPlaying = null;

    /* --- Speaker icon --- */
    function drawSpeakerIcon(muted) {

        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;

        const ctx = canvas.getContext('2d');

        const scale = 200 / 24;
        const offset = (256 - 200) / 2;

        ctx.save();
        ctx.translate(offset, offset);
        ctx.scale(scale, scale);

        ctx.fillStyle = 'white';

        const body = new Path2D(
            'M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508' +
            'c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12' +
            'c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93' +
            'l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06Z'
        );
        ctx.fill(body);

        if (!muted) {

            const wave = new Path2D(
                'M18.584 5.106a.75.75 0 0 1 1.06 0' +
                'c3.808 3.807 3.808 9.98 0 13.788' +
                'a.75.75 0 0 1-1.06-1.06' +
                'a8.25 8.25 0 0 0 0-11.668' +
                '.75.75 0 0 1 0-1.06Z'
            );
            ctx.fill(wave);
        }

        ctx.restore();
        return canvas;
    }

    function createIcon(muted) {
        const tex = new THREE.CanvasTexture(drawSpeakerIcon(muted));

        return new THREE.Mesh(
            new THREE.PlaneGeometry(0.6, 0.6),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true })
        );
    }

    function createButton(x, y, z) {

        const button = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.1),
            new THREE.MeshStandardMaterial({ color: 0x00ff00 })
        );

        button.position.set(x, y, z);
        scene.add(button);

        let icon = createIcon(false);
        icon.position.set(x, y, z + 0.06);
        scene.add(icon);

        return { button, icon, isPlaying: false };
    }

    const buttons = [
        createButton(3, 2, 0.6),
        createButton(-3, 2, 0.6)
    ];

    window.addEventListener('click', e => {

        mouse.x = (e.clientX / innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const hits = raycaster.intersectObjects(
            buttons.map(b => b.button)
        );

        if (!hits.length || !sound.buffer) return;

        const btn = buttons.find(b => b.button === hits[0].object);

        if (!btn) return;

        if (btn.isPlaying) {

            sound.stop();
            btn.isPlaying = false;
            btn.button.material.color.set(0x00ff00);
            currentPlaying = null;

        } else {

            if (currentPlaying && currentPlaying !== btn) {
                sound.stop();
                currentPlaying.isPlaying = false;
                currentPlaying.button.material.color.set(0x00ff00);
            }

            sound.play();

            btn.isPlaying = true;
            btn.button.material.color.set(0xff0000);
            currentPlaying = btn;
        }
    });
}