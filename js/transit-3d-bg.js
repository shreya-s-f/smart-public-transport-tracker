/**
 * TRANSIT.IN — Official 3D Smart City & Transit Network Background
 * Built with Three.js: Real 3D Electric Buses, High-Speed Metro Trains,
 * Elevated Rail Viaducts, Smart City Skyscrapers, Holographic Waypoints & Parallax.
 */
(function() {
  'use strict';

  function initTransit3D() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not yet loaded, retrying...');
      setTimeout(initTransit3D, 80);
      return;
    }

    // Prevent duplicate canvas instances
    if (document.getElementById('transit-3d-canvas')) {
      const existing = document.getElementById('transit-3d-canvas');
      if (existing) existing.remove();
    }

    // Create Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'transit-3d-canvas';
    document.body.prepend(canvas);

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2500);
    camera.position.set(0, 175, 420);
    camera.lookAt(0, 30, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false; // lightweight high FPS

    // Theme Management
    let isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const darkFogColor = new THREE.Color(0x080D20);
    const lightFogColor = new THREE.Color(0xF0F9FF);
    scene.fog = new THREE.FogExp2(isDark ? darkFogColor : lightFogColor, 0.0016);

    // ------------------------------------------------------------------------
    // LIGHTING
    // ------------------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(isDark ? 0x242d4a : 0xe0e7ff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(isDark ? 0x38bdf8 : 0x2563eb, 1.5);
    sunLight.position.set(150, 300, 200);
    scene.add(sunLight);

    const secondaryLight = new THREE.DirectionalLight(isDark ? 0x8b5cf6 : 0x7c3aed, 1.0);
    secondaryLight.position.set(-200, 250, -100);
    scene.add(secondaryLight);

    // ------------------------------------------------------------------------
    // SMART CITY SKYSCRAPERS & ROADS
    // ------------------------------------------------------------------------
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    // Ground Plane with subtle transit grid
    const groundGeo = new THREE.PlaneGeometry(1600, 1600, 32, 32);
    const groundMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x050917 : 0xedf2f7,
      wireframe: false
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    cityGroup.add(ground);

    // Buildings Materials
    const bldgMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0e172a : 0xf1f5f9,
      roughness: 0.3,
      metalness: 0.6
    });

    const bldgEdgeMat = new THREE.LineBasicMaterial({
      color: isDark ? 0x1e293b : 0xcbd5e1,
      transparent: true,
      opacity: 0.5
    });

    const windowGlowMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x38bdf8 : 0x2563eb,
      transparent: true,
      opacity: isDark ? 0.45 : 0.25
    });

    // Generate City Blocks leaving transit avenues open
    const buildingBoxes = [];
    const BLDG_COUNT = 55;
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    for (let i = 0; i < BLDG_COUNT; i++) {
      const angle = (i / BLDG_COUNT) * Math.PI * 2;
      const dist = 180 + Math.random() * 450;
      const x = Math.cos(angle) * dist + (Math.random() - 0.5) * 60;
      const z = Math.sin(angle) * dist + (Math.random() - 0.5) * 60;

      // Keep center highway corridor clear
      if (Math.abs(x) < 70 && Math.abs(z) < 180) continue;

      const w = 24 + Math.random() * 32;
      const d = 24 + Math.random() * 32;
      const h = 50 + Math.random() * 190;

      const bldg = new THREE.Mesh(boxGeo, bldgMat);
      bldg.scale.set(w, h, d);
      bldg.position.set(x, h / 2, z);
      cityGroup.add(bldg);
      buildingBoxes.push(bldg);

      // Building Wireframe Edges
      const edges = new THREE.EdgesGeometry(boxGeo);
      const line = new THREE.LineSegments(edges, bldgEdgeMat);
      line.scale.set(w, h, d);
      line.position.copy(bldg.position);
      cityGroup.add(line);

      // Roof Antenna with beacon light
      if (h > 120) {
        const antennaGeo = new THREE.CylinderGeometry(0.5, 0.8, 22, 6);
        const antennaMat = new THREE.MeshBasicMaterial({ color: isDark ? 0x8b5cf6 : 0x6366f1 });
        const antenna = new THREE.Mesh(antennaGeo, antennaMat);
        antenna.position.set(x, h + 11, z);
        cityGroup.add(antenna);

        const beaconGeo = new THREE.SphereGeometry(1.8, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(x, h + 22, z);
        cityGroup.add(beacon);
      }
    }

    // ------------------------------------------------------------------------
    // 3D HIGHWAY SYSTEM (CURVED ROADS WITH LANES)
    // ------------------------------------------------------------------------
    // Ground Highway Curve
    const roadPoints = [
      new THREE.Vector3(-450, 0, 160),
      new THREE.Vector3(-250, 0, 90),
      new THREE.Vector3(-100, 0, -30),
      new THREE.Vector3(80, 0, -110),
      new THREE.Vector3(260, 0, -60),
      new THREE.Vector3(380, 0, 70),
      new THREE.Vector3(250, 0, 220),
      new THREE.Vector3(0, 0, 250),
      new THREE.Vector3(-240, 0, 230),
      new THREE.Vector3(-450, 0, 160)
    ];
    const roadCurve = new THREE.CatmullRomCurve3(roadPoints, true, 'catmullrom', 0.2);

    // Road Ribbon Mesh
    const roadGeo = new THREE.TubeGeometry(roadCurve, 120, 14, 4, true);
    const roadMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x111827 : 0xdbeafe,
      roughness: 0.8,
      metalness: 0.2
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.scale.set(1, 0.08, 1);
    roadMesh.position.y = 0.5;
    scene.add(roadMesh);

    // Glowing Lane Divider Line
    const lanePoints = roadCurve.getPoints(250);
    const laneGeo = new THREE.BufferGeometry().setFromPoints(lanePoints);
    const laneMat = new THREE.LineDashedMaterial({
      color: isDark ? 0x38bdf8 : 0x2563eb,
      dashSize: 6,
      gapSize: 4,
      linewidth: 2,
      transparent: true,
      opacity: 0.8
    });
    const laneLine = new THREE.Line(laneGeo, laneMat);
    laneLine.computeLineDistances();
    laneLine.position.y = 1.2;
    scene.add(laneLine);

    // ------------------------------------------------------------------------
    // 3D ELEVATED METRO MONORAIL VIADUCT
    // ------------------------------------------------------------------------
    const metroPoints = [
      new THREE.Vector3(-420, 50, -180),
      new THREE.Vector3(-200, 55, -90),
      new THREE.Vector3(-50, 50, 40),
      new THREE.Vector3(120, 48, 140),
      new THREE.Vector3(280, 52, 60),
      new THREE.Vector3(400, 55, -120),
      new THREE.Vector3(200, 60, -260),
      new THREE.Vector3(-100, 55, -280),
      new THREE.Vector3(-420, 50, -180)
    ];
    const metroCurve = new THREE.CatmullRomCurve3(metroPoints, true, 'catmullrom', 0.15);

    // Elevated Metro Track Viaduct
    const viaductGeo = new THREE.TubeGeometry(metroCurve, 140, 3.5, 6, true);
    const viaductMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1e293b : 0x94a3b8,
      metalness: 0.8,
      roughness: 0.2
    });
    const viaductMesh = new THREE.Mesh(viaductGeo, viaductMat);
    scene.add(viaductMesh);

    // Viaduct Support Pillars
    const pillarGeo = new THREE.CylinderGeometry(2.5, 3.5, 60, 8);
    const pillarMat = new THREE.MeshStandardMaterial({ color: isDark ? 0x0f172a : 0xcbd5e1 });
    const viaductPoints = metroCurve.getSpacedPoints(18);
    viaductPoints.forEach(p => {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(p.x, p.y / 2, p.z);
      scene.add(pillar);
    });

    // ------------------------------------------------------------------------
    // BUILD REAL 3D ELECTRIC BUSES (TRANSIT.IN SMART EV FLEET)
    // ------------------------------------------------------------------------
    function createTransitBus(colorHex, nameStr) {
      const busGroup = new THREE.Group();

      // Main Aero Chassis Body
      const bodyGeo = new THREE.BoxGeometry(22, 7.5, 8.5);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.2,
        metalness: 0.4
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 4.8;
      busGroup.add(body);

      // Dark Panoramic Glass Windows Strip
      const glassGeo = new THREE.BoxGeometry(22.2, 3.2, 8.6);
      const glassMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x030712 : 0x38bdf8,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.85
      });
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.y = 5.6;
      busGroup.add(glass);

      // Glowing LED Destination Sign (Front)
      const signGeo = new THREE.PlaneGeometry(5, 1.4);
      const signMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide
      });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(11.15, 7.2, 0);
      sign.rotation.y = Math.PI / 2;
      busGroup.add(sign);

      // Dual Bright Headlights
      const hlGeo = new THREE.SphereGeometry(0.8, 8, 8);
      const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const hlLeft = new THREE.Mesh(hlGeo, hlMat);
      hlLeft.position.set(11.1, 3.8, 2.6);
      const hlRight = new THREE.Mesh(hlGeo, hlMat);
      hlRight.position.set(11.1, 3.8, -2.6);
      busGroup.add(hlLeft);
      busGroup.add(hlRight);

      // Headlight Beams (Soft Cones)
      const beamGeo = new THREE.ConeGeometry(5, 24, 12, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: isDark ? 0.18 : 0.08,
        side: THREE.DoubleSide
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(23, 3.8, 0);
      beam.rotation.z = -Math.PI / 2;
      busGroup.add(beam);

      // Red Taillights (Rear)
      const tlGeo = new THREE.BoxGeometry(0.4, 1.2, 1.8);
      const tlMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const tlLeft = new THREE.Mesh(tlGeo, tlMat);
      tlLeft.position.set(-11.1, 4.2, 2.8);
      const tlRight = new THREE.Mesh(tlGeo, tlMat);
      tlRight.position.set(-11.1, 4.2, -2.8);
      busGroup.add(tlLeft);
      busGroup.add(tlRight);

      // 6 Bus Wheels
      const wheelGeo = new THREE.CylinderGeometry(1.8, 1.8, 1.2, 12);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });
      const wheelPositions = [
        [7, 1.8, 4.3], [7, 1.8, -4.3],
        [-3, 1.8, 4.3], [-3, 1.8, -4.3],
        [-7, 1.8, 4.3], [-7, 1.8, -4.3]
      ];
      wheelPositions.forEach(([wx, wy, wz]) => {
        const w = new THREE.Mesh(wheelGeo, wheelMat);
        w.rotation.x = Math.PI / 2;
        w.position.set(wx, wy, wz);
        busGroup.add(w);
      });

      return busGroup;
    }

    // Spawn 4 Active Buses with different routes & colors
    const buses = [
      { mesh: createTransitBus(0x8B5CF6, 'Route 102'), offset: 0.05, speed: 0.00075 },
      { mesh: createTransitBus(0x38BDF8, 'Express 42'), offset: 0.32, speed: 0.00082 },
      { mesh: createTransitBus(0x10B981, 'Eco Line 1'), offset: 0.58, speed: 0.00078 },
      { mesh: createTransitBus(0xF59E0B, 'Airport Shuttle'), offset: 0.82, speed: 0.00085 }
    ];

    buses.forEach(b => scene.add(b.mesh));

    // ------------------------------------------------------------------------
    // BUILD 3D HIGH-SPEED METRO BULLET TRAIN (ON ELEVATED VIADUCT)
    // ------------------------------------------------------------------------
    const metroTrain = new THREE.Group();
    const CAR_LEN = 26;
    const CAR_COUNT = 3;

    for (let c = 0; c < CAR_COUNT; c++) {
      const carGroup = new THREE.Group();
      // Aerodynamic Car Chassis
      const carGeo = new THREE.BoxGeometry(CAR_LEN, 7.5, 7.8);
      const carMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0xf8fafc : 0xffffff,
        metalness: 0.7,
        roughness: 0.2
      });
      const car = new THREE.Mesh(carGeo, carMat);
      car.position.y = 4.2;
      carGroup.add(car);

      // Blue Panoramic Window Strip
      const winGeo = new THREE.BoxGeometry(CAR_LEN + 0.2, 2.6, 8.0);
      const winMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: isDark ? 0.75 : 0.6
      });
      const win = new THREE.Mesh(winGeo, winMat);
      win.position.y = 4.6;
      carGroup.add(win);

      // Red Accent Stripe along bottom
      const stripeGeo = new THREE.BoxGeometry(CAR_LEN + 0.1, 0.8, 8.1);
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.y = 2.0;
      carGroup.add(stripe);

      carGroup.position.x = -c * (CAR_LEN + 1.2);
      metroTrain.add(carGroup);
    }

    // Metro Front Nose Light
    const metroLight = new THREE.PointLight(0x38bdf8, 3, 70);
    metroLight.position.set(CAR_LEN / 2 + 2, 4.5, 0);
    metroTrain.add(metroLight);

    scene.add(metroTrain);
    let metroProgress = 0.2;

    // ------------------------------------------------------------------------
    // 3D HOLOGRAPHIC TRANSIT STATIONS & FLOATING GPS BEACONS
    // ------------------------------------------------------------------------
    const stationLocations = [
      new THREE.Vector3(-100, 0, -30),
      new THREE.Vector3(260, 0, -60),
      new THREE.Vector3(0, 0, 250)
    ];

    const beaconRings = [];

    stationLocations.forEach((loc, idx) => {
      // Modern Glass Station Canopy
      const canopyGeo = new THREE.CylinderGeometry(14, 14, 1.2, 16, 1, false, 0, Math.PI);
      const canopyMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.set(loc.x + 14, 12, loc.z);
      canopy.rotation.z = Math.PI;
      scene.add(canopy);

      // Station Platform
      const platGeo = new THREE.BoxGeometry(26, 2, 14);
      const platMat = new THREE.MeshStandardMaterial({ color: isDark ? 0x1e293b : 0xe2e8f0 });
      const plat = new THREE.Mesh(platGeo, platMat);
      plat.position.set(loc.x + 14, 1, loc.z);
      scene.add(plat);

      // Floating Holographic GPS Beacon Rings
      const ringGeo = new THREE.TorusGeometry(8, 0.5, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx === 0 ? 0x8b5cf6 : (idx === 1 ? 0x38bdf8 : 0x10b981),
        transparent: true,
        opacity: 0.7
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(loc.x, 26, loc.z);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
      beaconRings.push(ring);

      // Vertical Hologram Pillar
      const beamGeo = new THREE.CylinderGeometry(0.5, 3.5, 45, 12, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: ringMat.color,
        transparent: true,
        opacity: isDark ? 0.22 : 0.12,
        side: THREE.DoubleSide
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(loc.x, 24, loc.z);
      scene.add(beam);
    });

    // ------------------------------------------------------------------------
    // MOUSE PARALLAX & SMOOTH CAMERA LERP
    // ------------------------------------------------------------------------
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let scrollY = window.scrollY || 0;
    let targetScrollY = scrollY;

    window.addEventListener('mousemove', (e) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    window.addEventListener('scroll', () => {
      targetScrollY = window.scrollY;
    }, { passive: true });

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, { passive: true });

    // Live Theme Switching
    const observer = new MutationObserver(() => {
      const currentDark = document.documentElement.getAttribute('data-theme') !== 'light';
      if (currentDark !== isDark) {
        isDark = currentDark;
        scene.fog.color.set(isDark ? darkFogColor : lightFogColor);
        groundMat.color.set(isDark ? 0x050917 : 0xedf2f7);
        bldgMat.color.set(isDark ? 0x0e172a : 0xf1f5f9);
        roadMat.color.set(isDark ? 0x111827 : 0xdbeafe);
        ambientLight.color.set(isDark ? 0x242d4a : 0xe0e7ff);
        sunLight.color.set(isDark ? 0x38bdf8 : 0x2563eb);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // ------------------------------------------------------------------------
    // ANIMATION RENDER LOOP
    // ------------------------------------------------------------------------
    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth Camera Inertia
      mouse.x += (mouse.targetX - mouse.x) * 0.035;
      mouse.y += (mouse.targetY - mouse.y) * 0.035;
      scrollY += (targetScrollY - scrollY) * 0.05;

      // Camera Position Orbit with gentle parallax
      camera.position.x = mouse.x * 90;
      camera.position.y = 175 - mouse.y * 45 + scrollY * 0.08;
      camera.position.z = 420 + Math.abs(mouse.x) * 20;
      camera.lookAt(mouse.x * 20, 25, 0);

      // Animate 3D Buses along the Highway Curve
      buses.forEach(b => {
        b.offset = (b.offset + b.speed) % 1;
        const pos = roadCurve.getPointAt(b.offset);
        const tangent = roadCurve.getTangentAt(b.offset).normalize();

        b.mesh.position.set(pos.x, pos.y + 0.5, pos.z);

        // Orient bus along road direction
        const lookTarget = pos.clone().add(tangent);
        lookTarget.y = pos.y + 0.5;
        b.mesh.lookAt(lookTarget);
      });

      // Animate 3D Metro Train along Elevated Viaduct
      metroProgress = (metroProgress + 0.0006) % 1;
      const metroPos = metroCurve.getPointAt(metroProgress);
      const metroTangent = metroCurve.getTangentAt(metroProgress).normalize();

      metroTrain.position.set(metroPos.x, metroPos.y + 0.6, metroPos.z);
      const metroLook = metroPos.clone().add(metroTangent);
      metroLook.y = metroPos.y + 0.6;
      metroTrain.lookAt(metroLook);

      // Animate Holographic Beacon Rings
      beaconRings.forEach((ring, idx) => {
        ring.rotation.z += 0.015;
        ring.scale.setScalar(1 + 0.12 * Math.sin(time * 2.5 + idx));
      });

      // Render
      renderer.render(scene, camera);
    }

    animate();
  }

  // Load Three.js if needed, then initialize
  if (typeof THREE === 'undefined') {
    const s = document.createElement('script');
    s.src = 'js/three.min.js';
    s.onload = initTransit3D;
    document.head.appendChild(s);
  } else {
    initTransit3D();
  }
})();
