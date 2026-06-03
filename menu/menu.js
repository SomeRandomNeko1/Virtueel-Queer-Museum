        // ─── Three.js Gate: DARK ONLY, Menu stays LIGHT ───
        class GateEntrance {
            constructor(canvasId) {
                this.canvas = document.getElementById(canvasId);
                this.loader = document.getElementById('three-loader');
                this.active = false;
                this.animationComplete = false;

                // ✅ DARK scene only for the gate
                this.scene = new THREE.Scene();
                this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.03);
                this.scene.background = new THREE.Color(0x0a0a0a);

                this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
                this.camera.position.set(0, 2.5, 25); // Start further back

                this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false });
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                this.renderer.setClearColor(0x0a0a0a, 1);
                this.renderer.shadowMap.enabled = true;

                this.setupLighting();
                this.createGate();
                this.createParticles();

                window.addEventListener('resize', () => this.onResize());
                this.animate();
            }

            setupLighting() {
                const ambient = new THREE.AmbientLight(0x333333, 0.5);
                this.scene.add(ambient);

                const mainLight = new THREE.DirectionalLight(0xbbbbbb, 0.6);
                mainLight.position.set(5, 12, 8);
                mainLight.castShadow = true;
                mainLight.shadow.mapSize.set(2048, 2048);
                this.scene.add(mainLight);

                // Warm glow from inside the museum
                const interiorLight = new THREE.PointLight(0x776655, 0.7, 30);
                interiorLight.position.set(0, 3, -5);
                this.scene.add(interiorLight);

                const rimLight1 = new THREE.PointLight(0x777777, 0.35, 18);
                rimLight1.position.set(-5, 4, 3);
                this.scene.add(rimLight1);

                const rimLight2 = new THREE.PointLight(0x777777, 0.35, 18);
                rimLight2.position.set(5, 4, 3);
                this.scene.add(rimLight2);
            }

            createGate() {
                const gateGroup = new THREE.Group();
                this.gate = gateGroup;

                // === DARK MATERIALS ONLY FOR GATE ===
                const darkStone = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.85, metalness: 0.15 });
                const greyStone = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.9, metalness: 0.1 });
                const darkMetal = new THREE.MeshStandardMaterial({ color: 0x0f0f0f, roughness: 0.5, metalness: 0.8, emissive: 0x080808, emissiveIntensity: 0.2 });
                const metalTrim = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.35, metalness: 0.9 });

                // Columns
                const colGeo = new THREE.CylinderGeometry(0.5, 0.6, 7.5, 12);
                const leftCol = new THREE.Mesh(colGeo, darkStone);
                leftCol.position.set(-4.2, 3.75, 0);
                leftCol.castShadow = true; leftCol.receiveShadow = true;
                gateGroup.add(leftCol);

                const rightCol = new THREE.Mesh(colGeo, darkStone);
                rightCol.position.set(4.2, 3.75, 0);
                rightCol.castShadow = true; rightCol.receiveShadow = true;
                gateGroup.add(rightCol);

                // Bases
                const baseGeo = new THREE.CylinderGeometry(0.85, 1, 0.65, 12);
                const lBase = new THREE.Mesh(baseGeo, greyStone);
                lBase.position.set(-4.2, 0.32, 0); lBase.castShadow = true;
                gateGroup.add(lBase);
                const rBase = new THREE.Mesh(baseGeo, greyStone);
                rBase.position.set(4.2, 0.32, 0); rBase.castShadow = true;
                gateGroup.add(rBase);

                // Capitals
                const capGeo = new THREE.CylinderGeometry(0.6, 0.75, 0.95, 12);
                const lCap = new THREE.Mesh(capGeo, greyStone);
                lCap.position.set(-4.2, 7.7, 0); gateGroup.add(lCap);
                const rCap = new THREE.Mesh(capGeo, greyStone);
                rCap.position.set(4.2, 7.7, 0); gateGroup.add(rCap);

                // Top beam
                const beamGeo = new THREE.BoxGeometry(10, 0.85, 1.4);
                const beam = new THREE.Mesh(beamGeo, darkStone);
                beam.position.set(0, 7.65, 0); beam.castShadow = true;
                gateGroup.add(beam);

                // Metal trim
                const trimGeo = new THREE.BoxGeometry(9.5, 0.13, 0.45);
                const tTop = new THREE.Mesh(trimGeo, metalTrim); tTop.position.set(0, 8.05, 0); gateGroup.add(tTop);
                const tBot = new THREE.Mesh(trimGeo, metalTrim); tBot.position.set(0, 7.25, 0); gateGroup.add(tBot);

                // === OPENING DOORS (DARK) ===
                const dW = 3, dH = 6, dD = 0.18;
                const doorMat = darkMetal;

                // Left door with pivot
                const doorGeo = new THREE.BoxGeometry(dW, dH, dD);
                this.leftDoor = new THREE.Mesh(doorGeo, doorMat);
                this.leftDoor.position.set(1.5, 3, 0.25);
                this.leftDoor.castShadow = true;
                this.leftDoorPivot = new THREE.Group();
                this.leftDoorPivot.position.set(-2.85, 3, 0);
                this.leftDoorPivot.add(this.leftDoor);
                gateGroup.add(this.leftDoorPivot);

                // Right door with pivot
                this.rightDoor = new THREE.Mesh(doorGeo, doorMat);
                this.rightDoor.position.set(-1.5, 3, 0.25);
                this.rightDoor.castShadow = true;
                this.rightDoorPivot = new THREE.Group();
                this.rightDoorPivot.position.set(2.85, 3, 0);
                this.rightDoorPivot.add(this.rightDoor);
                gateGroup.add(this.rightDoorPivot);

                // Door handles
                const hGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 8);
                const hMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.4, metalness: 0.95 });
                const lHandle = new THREE.Mesh(hGeo, hMat);
                lHandle.position.set(2.7, 3, 0.45); lHandle.rotation.z = Math.PI / 2;
                gateGroup.add(lHandle);
                const rHandle = new THREE.Mesh(hGeo, hMat);
                rHandle.position.set(-2.7, 3, 0.45); rHandle.rotation.z = Math.PI / 2;
                gateGroup.add(rHandle);

                // Floor
                const floorGeo = new THREE.PlaneGeometry(35, 35);
                const floorMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.95, metalness: 0.08 });
                const floor = new THREE.Mesh(floorGeo, floorMat);
                floor.rotation.x = -Math.PI / 2; floor.position.y = 0; floor.receiveShadow = true;
                gateGroup.add(floor);

                // Back wall (visible when doors open)
                const wallGeo = new THREE.PlaneGeometry(14, 9);
                const wallMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.95 });
                const backWall = new THREE.Mesh(wallGeo, wallMat);
                backWall.position.set(0, 4.5, -1.2);
                gateGroup.add(backWall);

                // Column details
                this.addColumnDetails(leftCol, -4.2);
                this.addColumnDetails(rightCol, 4.2);

                this.scene.add(gateGroup);
            }

            addColumnDetails(column, xPos) {
                const gGeo = new THREE.CylinderGeometry(0.045, 0.045, 6.5, 6);
                const gMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.9 });
                for (let i = 0; i < 10; i++) {
                    const a = (i / 10) * Math.PI * 2;
                    const g = new THREE.Mesh(gGeo, gMat);
                    g.position.set(Math.cos(a) * 0.52, 3.75, Math.sin(a) * 0.52);
                    g.rotation.z = Math.PI / 2;
                    column.add(g);
                }
            }

            createParticles() {
                const count = 350;
                const pos = new Float32Array(count * 3);
                for (let i = 0; i < count; i++) {
                    pos[i * 3] = (Math.random() - 0.5) * 45;
                    pos[i * 3 + 1] = Math.random() * 22;
                    pos[i * 3 + 2] = (Math.random() - 0.5) * 35;
                }
                const geo = new THREE.BufferGeometry();
                geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
                const mat = new THREE.PointsMaterial({ color: 0x3a3a4a, size: 0.09, transparent: true, opacity: 0.35, sizeAttenuation: true });
                this.particles = new THREE.Points(geo, mat);
                this.scene.add(this.particles);
            }

            openDoors(progress) {
                const angle = Math.PI / 2.1;
                this.leftDoorPivot.rotation.y = -angle * progress;
                this.rightDoorPivot.rotation.y = angle * progress;
            }

            animate() {
                requestAnimationFrame(() => this.animate());

                if (this.gate && !this.animationComplete && !this.active) {
                    this.gate.rotation.y = Math.sin(Date.now() * 0.00025) * 0.006;
                }

                if (this.particles) {
                    const pos = this.particles.geometry.attributes.position.array;
                    for (let i = 0; i < pos.length; i += 3) {
                        pos[i + 1] -= 0.012;
                        if (pos[i + 1] < 0) { pos[i + 1] = 22; pos[i] = (Math.random() - 0.5) * 45; pos[i + 2] = (Math.random() - 0.5) * 35; }
                    }
                    this.particles.geometry.attributes.position.needsUpdate = true;
                }

                if (this.active && !this.animationComplete) this.updateCameraAnimation();
                this.renderer.render(this.scene, this.camera);
            }

            updateCameraAnimation() {
                const duration = 5000;
                const elapsed = Date.now() - this.startTime;
                const p = Math.min(elapsed / duration, 1);
                const ease = 1 - Math.pow(1 - p, 4);

                // Camera: far → gate → through
                const start = new THREE.Vector3(0, 2.5, 25);
                const mid = new THREE.Vector3(0, 2.6, 1.5);
                const end = new THREE.Vector3(0, 2.8, -12);

                if (p < 0.55) {
                    this.camera.position.lerpVectors(start, mid, ease);
                } else {
                    const p2 = (p - 0.55) / 0.45;
                    const e2 = 1 - Math.pow(1 - p2, 3);
                    this.camera.position.lerpVectors(mid, end, e2);
                }

                // Open doors starting at 20% progress
                const doorP = Math.max(0, Math.min(1, (p - 0.2) * 1.4));
                this.openDoors(doorP);

                this.camera.lookAt(0, 2.7 + Math.sin(p * Math.PI) * 0.15, -2);

                if (p >= 1) {
                    this.animationComplete = true;
                    if (this.onComplete) this.onComplete();
                }
            }

            startEntrance(onComplete) {
                this.onComplete = onComplete;
                this.active = true;
                this.animationComplete = false;
                this.startTime = Date.now();

                // Reset
                if (this.leftDoorPivot) this.leftDoorPivot.rotation.y = 0;
                if (this.rightDoorPivot) this.rightDoorPivot.rotation.y = 0;
                this.camera.position.set(0, 2.5, 25);
                this.camera.lookAt(0, 2.5, 0);
                if (this.scene.fog) this.scene.fog.density = 0.03;

                this.canvas.classList.add('active');
                this.loader.classList.add('active');
                setTimeout(() => this.loader.classList.remove('active'), 1200);
            }

            reset() {
                this.active = false; this.animationComplete = false;
                this.canvas.classList.remove('active');
                if (this.leftDoorPivot) this.leftDoorPivot.rotation.y = 0;
                if (this.rightDoorPivot) this.rightDoorPivot.rotation.y = 0;
                this.camera.position.set(0, 2.5, 25);
                this.camera.lookAt(0, 2.5, 0);
            }

            onResize() {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }
        }

        let gateEntrance;
        document.addEventListener('DOMContentLoaded', () => {
            gateEntrance = new GateEntrance('three-canvas');
        });

        // ─── Menu Interactions (LIGHT MENU → DARK GATE FLOW) ───
        const menuOverlay = document.getElementById('menu-overlay');
        const optionsPanel = document.getElementById('options-panel');
        const exitPanel = document.getElementById('exit-panel');
        const transitionOverlay = document.getElementById('transition-overlay');
        const startBtn = document.getElementById('btn-start');

        const startNotice = document.createElement('div');
        startNotice.id = 'start-notice';
        startNotice.textContent = 'Accepteer eerst de cookies om te kunnen beginnen.';
        startNotice.style.cssText = 'margin-top: 12px; font-family: "Cormorant Garamond", serif; font-size: 14px; color: rgba(60,50,45,0.85); text-align:center;';
        document.querySelector('.menu-buttons').appendChild(startNotice);

        const cookieConsentGiven = () => localStorage.getItem('cookieConsent') !== null;
        const updateStartButton = () => {
            const allowed = cookieConsentGiven();
            startBtn.disabled = !allowed;
            startBtn.classList.toggle('disabled', !allowed);
            startNotice.textContent = allowed
                ? 'Je hebt cookies gekozen. Begin de tour nu.'
                : 'Accepteer eerst de cookies om te kunnen beginnen.';
        };
        updateStartButton();
        window.addEventListener('cookieConsentChanged', updateStartButton);

        document.getElementById('btn-start').addEventListener('click', () => {
            if (!cookieConsentGiven()) {
                const cookieBanner = document.getElementById('cookie-banner');
                if (cookieBanner) cookieBanner.classList.remove('hidden');
                startBtn.classList.add('shake');
                setTimeout(() => startBtn.classList.remove('shake'), 500);
                return;
            }

            // hiding cookie banner when entering
            const cookieBanner = document.getElementById('cookie-banner');
            if (cookieBanner) {
                cookieBanner.classList.add('hidden');
                cookieBanner.style.display = 'none';
            }

            // 1. Fade out WHITE menu
            menuOverlay.classList.add('hidden');

            // 2. Brief transition overlay (same light color for smooth fade)
            setTimeout(() => {
                transitionOverlay.classList.add('active');

                // 3. Show dark Three.js canvas & start gate animation
                setTimeout(() => {
                    gateEntrance.startEntrance(() => {
                        // 4. Animation complete - you're inside!
                        setTimeout(() => {
                            transitionOverlay.classList.remove('active');
                            document.getElementById('three-canvas').style.display = 'none';
                            document.getElementById('c').style.display = 'block';
                            museumGestart = true;
                            document.getElementById('c').requestPointerLock();
                            document.getElementById('crosshair').style.display = 'block';
                        }, 400);
                    });
                }, 500);
            }, 700);
        });

        document.getElementById('btn-options').addEventListener('click', () => {
            menuOverlay.style.opacity = '0';
            setTimeout(() => { optionsPanel.classList.add('active'); menuOverlay.style.opacity = '1'; }, 300);
        });
        document.getElementById('options-back').addEventListener('click', () => {
            optionsPanel.classList.remove('active');
        });
        document.getElementById('btn-exit').addEventListener('click', () => exitPanel.classList.add('active'));
        document.getElementById('exit-no').addEventListener('click', () => exitPanel.classList.remove('active'));
        document.getElementById('exit-yes').addEventListener('click', () => {
            document.body.style.transition = 'opacity 1s ease';
            document.body.style.opacity = '0';
            setTimeout(() => {
                document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#faf9f7;color:#8b7355;font-family:Playfair Display,serif;font-size:24px;letter-spacing:4px;">Thank you for visiting.</div>';
                document.body.style.opacity = '1';
            }, 1000);
        });

        // load cookie only in menu
        const cookieScript = document.createElement('script');
        cookieScript.src = '/function/cookies.js';
        document.head.appendChild(cookieScript);
        
        // Sliders & toggles (unchanged)
        document.querySelectorAll('.slider-container').forEach(slider => {
            let drag = false;
            const update = e => {
                const r = slider.getBoundingClientRect();
                let v = Math.round(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
                slider.querySelector('.slider-fill').style.width = v + '%';
                slider.querySelector('.slider-thumb').style.left = v + '%';
                slider.parentElement.querySelector('.slider-value').textContent = v;
                slider.dataset.value = v;
            };
            slider.addEventListener('mousedown', e => { drag = true; update(e); });
            document.addEventListener('mousemove', e => { if (drag) update(e); });
            document.addEventListener('mouseup', () => drag = false);
        });
        document.querySelectorAll('.toggle-switch').forEach(t => t.addEventListener('click', () => t.classList.toggle('active')));
        const quals = ['Low', 'Medium', 'High', 'Ultra']; let qIdx = 2;
        document.getElementById('quality-btn').addEventListener('click', () => {
            qIdx = (qIdx + 1) % quals.length;
            document.getElementById('quality-btn').textContent = quals[qIdx];
        });
