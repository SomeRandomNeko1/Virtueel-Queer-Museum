 function initJoystick({ camera, joystickEl, isMobile }) {

    const keys = { w:false, a:false, s:false, d:false };
    const move = { x:0, y:0 };

    let pitch = 0;
    let yaw = 0;

    let joystick = null;

    /* joystick setup */
    if (isMobile && window.nipplejs && joystickEl) {

        joystick = nipplejs.create({
            zone: joystickEl,
            mode: 'static',
            position: { left: '50px', bottom: '50px' },
            color: 'white',
            size: Math.min(innerWidth, innerHeight) * 0.15
        });

        joystick.on('move', (_, data) => {
            if (!data) return;
            move.x = data.vector.x;
            move.y = -data.vector.y;
        });

        joystick.on('end', () => {
            move.x = 0;
            move.y = 0;
        });

    } else {
        joystickEl.style.display = 'none';
    }

    /* keyboard */
    const keyMap = { w:'w', a:'a', s:'s', d:'d' };

    window.addEventListener('keydown', e => {
        if (keyMap[e.key]) keys[e.key] = true;
    });

    window.addEventListener('keyup', e => {
        if (keyMap[e.key]) keys[e.key] = false;
    });

    /* look controls */
    let dragging = false;
    let prevX = 0;
    let prevY = 0;

    function pos(e) {
        return {
            x: e.clientX || e.touches?.[0].clientX,
            y: e.clientY || e.touches?.[0].clientY
        };
    }

    window.addEventListener('mousedown', e => {
        dragging = true;
        const p = pos(e);
        prevX = p.x;
        prevY = p.y;
    });

    window.addEventListener('mouseup', () => dragging = false);

    window.addEventListener('mousemove', e => {
        if (!dragging) return;

        const p = pos(e);

        const dx = p.x - prevX;
        const dy = p.y - prevY;

        prevX = p.x;
        prevY = p.y;

        const sens = 0.002;

        yaw -= dx * sens;
        pitch -= dy * sens;

        pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
    });

    function update() {

        const speed = 0.05;

        let moveX = (keys.d - keys.a) + move.x;
        let moveZ = (keys.s - keys.w) + move.y;

        const len = Math.hypot(moveX, moveZ);

        if (len > 0) {
            moveX /= len;
            moveZ /= len;
        }

        const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
        const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

        camera.position.add(
            forward.multiplyScalar(moveZ)
                .add(right.multiplyScalar(moveX))
                .multiplyScalar(speed)
        );

        camera.position.y = 1.6;
        camera.rotation.set(pitch, yaw, 0, 'YXZ');
    }

    function resize() {
        if (joystick) {
            joystick.options.size =
                Math.min(innerWidth, innerHeight) * 0.15;
        }
    }

    return { update, resize };
}