/**
 * TRANSIT.IN — Realistic 3D Smart Transit City & Real-Time Roadways
 * Built with Three.js: Real electric buses traveling on accurate paved roads,
 * bus stops with boarding halts, streetlights, only 8 iconic landmark skyscrapers,
 * and cinematic miniature tilt parallax.
 */
(function() {
  'use strict';

  function initTransit3D() {
    if (typeof THREE === 'undefined') {
      setTimeout(initTransit3D, 80);
      return;
    }

    // Clean existing canvas if any
    const oldCanvas = document.getElementById('transit-3d-canvas');
    if (oldCanvas) oldCanvas.remove();

    // Create Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'transit-3d-canvas';
    document.body.prepend(canvas);

    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 130, 260);
    camera.lookAt(0, 15, -15);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Theme Management
    let isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const darkFog = new THREE.Color(0x080D20);
    const lightFog = new THREE.Color(0xF0F9FF);
    scene.fog = new THREE.FogExp2(isDark ? darkFog : lightFog, 0.0018);

    // ------------------------------------------------------------------------
    // LIGHTING SYSTEM
    // ------------------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(isDark ? 0x222e4a : 0xf1f5f9, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(isDark ? 0x38bdf8 : 0x2563eb, 1.8);
    sunLight.position.set(120, 250, 150);
    scene.add(sunLight);

    const cityGlowLight = new THREE.DirectionalLight(isDark ? 0x8b5cf6 : 0x7c3aed, 1.0);
    cityGlowLight.position.set(-150, 180, -100);
    scene.add(cityGlowLight);

    // ------------------------------------------------------------------------
    // GROUND & REALISTIC MULTI-LANE ROAD SYSTEM
    // ------------------------------------------------------------------------
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 1. Base Terrain
    const terrainGeo = new THREE.PlaneGeometry(1200, 1200);
    const terrainMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x060a17 : 0xf8fafc,
      roughness: 0.9,
      metalness: 0.1
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -0.2;
    worldGroup.add(terrain);

    // 2. Main Asphalt Roadway (East-West Boulevard)
    // Road width: 34 units (17 units per side: Lane 1 @ Z=+8.5, Lane 2 @ Z=-8.5)
    const roadLength = 760;
    const roadWidth = 34;
    const roadGeo = new THREE.PlaneGeometry(roadLength, roadWidth);
    const roadMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x111827 : 0x334155,
      roughness: 0.85,
      metalness: 0.15
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0, 0);
    worldGroup.add(roadMesh);

    // 3. Concrete Curbs & Sidewalks (North and South)
    const walkWidth = 14;
    const walkGeo = new THREE.BoxGeometry(roadLength, 1.2, walkWidth);
    const walkMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1e293b : 0xe2e8f0,
      roughness: 0.7
    });

    // South Sidewalk (Front)
    const southWalk = new THREE.Mesh(walkGeo, walkMat);
    southWalk.position.set(0, 0.6, roadWidth / 2 + walkWidth / 2);
    worldGroup.add(southWalk);

    // North Sidewalk (Back)
    const northWalk = new THREE.Mesh(walkGeo, walkMat);
    northWalk.position.set(0, 0.6, -(roadWidth / 2 + walkWidth / 2));
    worldGroup.add(northWalk);

    // 4. Crisp Painted Road Markings
    const markingsGroup = new THREE.Group();
    worldGroup.add(markingsGroup);

    // A. Double Solid Yellow Center Line
    const centerLineGeo = new THREE.PlaneGeometry(roadLength, 0.45);
    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const centerLine1 = new THREE.Mesh(centerLineGeo, yellowMat);
    centerLine1.rotation.x = -Math.PI / 2;
    centerLine1.position.set(0, 0.05, 0.5);
    markingsGroup.add(centerLine1);

    const centerLine2 = new THREE.Mesh(centerLineGeo, yellowMat);
    centerLine2.rotation.x = -Math.PI / 2;
    centerLine2.position.set(0, 0.05, -0.5);
    markingsGroup.add(centerLine2);

    // B. White Dashed Lane Dividers
    const dashLength = 6;
    const dashGap = 6;
    const dashCount = Math.floor(roadLength / (dashLength + dashGap));
    const dashGeo = new THREE.PlaneGeometry(dashLength, 0.4);
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let d = -dashCount / 2; d <= dashCount / 2; d++) {
      const posX = d * (dashLength + dashGap);
      // North lane dash
      const dashN = new THREE.Mesh(dashGeo, whiteMat);
      dashN.rotation.x = -Math.PI / 2;
      dashN.position.set(posX, 0.05, -8.5);
      markingsGroup.add(dashN);

      // South lane dash
      const dashS = new THREE.Mesh(dashGeo, whiteMat);
      dashS.rotation.x = -Math.PI / 2;
      dashS.position.set(posX, 0.05, 8.5);
      markingsGroup.add(dashS);
    }

    // C. White Edge Shoulder Lines
    const edgeGeo = new THREE.PlaneGeometry(roadLength, 0.4);
    const edgeS = new THREE.Mesh(edgeGeo, whiteMat);
    edgeS.rotation.x = -Math.PI / 2;
    edgeS.position.set(0, 0.05, roadWidth / 2 - 0.8);
    markingsGroup.add(edgeS);

    const edgeN = new THREE.Mesh(edgeGeo, whiteMat);
    edgeN.rotation.x = -Math.PI / 2;
    edgeN.position.set(0, 0.05, -roadWidth / 2 + 0.8);
    markingsGroup.add(edgeN);

    // D. Pedestrian Zebra Crossings
    function createZebraCrossing(centerX) {
      const stripeCount = 10;
      const stripeW = 1.4;
      const stripeL = 8;
      const stripeGeo = new THREE.PlaneGeometry(stripeW, stripeL);

      for (let s = 0; s < stripeCount; s++) {
        const stripe = new THREE.Mesh(stripeGeo, whiteMat);
        stripe.rotation.x = -Math.PI / 2;
        const offsetZ = -13 + s * 2.8;
        stripe.position.set(centerX, 0.06, offsetZ);
        markingsGroup.add(stripe);
      }
    }
    createZebraCrossing(-120);
    createZebraCrossing(140);

    // ------------------------------------------------------------------------
    // BUS STOPS WITH GLASS SHELTERS & TIMETABLE SCREENS
    // ------------------------------------------------------------------------
    function createBusStop(x, z, rotationY, stopName, badgeColor) {
      const stopGroup = new THREE.Group();
      stopGroup.position.set(x, 1.2, z);
      stopGroup.rotation.y = rotationY;

      // Modern Glass Curved Canopy
      const canopyGeo = new THREE.CylinderGeometry(8, 8, 0.8, 16, 1, false, 0, Math.PI);
      const canopyMat = new THREE.MeshStandardMaterial({
        color: badgeColor,
        transparent: true,
        opacity: isDark ? 0.7 : 0.5,
        roughness: 0.1,
        metalness: 0.8
      });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.set(0, 8.5, 0);
      canopy.rotation.z = Math.PI;
      stopGroup.add(canopy);

      // Support Columns
      const colGeo = new THREE.CylinderGeometry(0.3, 0.3, 8.5, 8);
      const colMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
      const col1 = new THREE.Mesh(colGeo, colMat);
      col1.position.set(-6, 4.25, -2);
      const col2 = new THREE.Mesh(colGeo, colMat);
      col2.position.set(6, 4.25, -2);
      stopGroup.add(col1);
      stopGroup.add(col2);

      // Waiting Bench
      const benchGeo = new THREE.BoxGeometry(10, 0.5, 1.8);
      const benchMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      const bench = new THREE.Mesh(benchGeo, benchMat);
      bench.position.set(0, 1.8, -2);
      stopGroup.add(bench);

      // Digital Timetable LED Screen
      const screenGeo = new THREE.BoxGeometry(4.5, 2.5, 0.4);
      const screenMat = new THREE.MeshBasicMaterial({ color: badgeColor });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(0, 6.2, -2.1);
      stopGroup.add(screen);

      // Pulsing Bus Stop Ground Marker
      const ringGeo = new THREE.RingGeometry(3.5, 4.2, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: badgeColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0, 0.08, 6.5);
      stopGroup.add(ring);

      worldGroup.add(stopGroup);
      return { stopGroup, ring };
    }

    // Bus Stop 1 (Eastbound - South Sidewalk)
    const stopEast = createBusStop(-40, 20, 0, 'Transit Hub East', 0x10B981);
    // Bus Stop 2 (Westbound - North Sidewalk)
    const stopWest = createBusStop(60, -20, Math.PI, 'Metro Concourse West', 0x38BDF8);

    // ------------------------------------------------------------------------
    // CURVED ARCH STREETLIGHTS WITH POOLS OF LIGHT
    // ------------------------------------------------------------------------
    function createStreetlight(x, z, rotY) {
      const lightGroup = new THREE.Group();
      lightGroup.position.set(x, 1.2, z);
      lightGroup.rotation.y = rotY;

      // Vertical Pole
      const poleGeo = new THREE.CylinderGeometry(0.35, 0.5, 18, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: isDark ? 0x334155 : 0x94a3b8 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 9;
      lightGroup.add(pole);

      // Curved Arch Arm
      const armGeo = new THREE.BoxGeometry(6, 0.35, 0.35);
      const arm = new THREE.Mesh(armGeo, poleMat);
      arm.position.set(2.8, 17.5, 0);
      arm.rotation.z = -0.25;
      lightGroup.add(arm);

      // Glowing Lamp Head
      const headGeo = new THREE.BoxGeometry(2.2, 0.5, 1.2);
      const headMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(5.5, 16.8, 0);
      lightGroup.add(head);

      // Downward Light Cone Pool on Road
      const coneGeo = new THREE.ConeGeometry(8, 17, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: isDark ? 0.08 : 0.04,
        side: THREE.DoubleSide
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(5.5, 8.5, 0);
      lightGroup.add(cone);

      worldGroup.add(lightGroup);
    }

    const lightSpacing = 90;
    for (let lx = -270; lx <= 270; lx += lightSpacing) {
      createStreetlight(lx, 18.5, 0);
      createStreetlight(lx + 45, -18.5, Math.PI);
    }

    // ------------------------------------------------------------------------
    // ROADSIDE TREES & GREENERY (NATURAL BOULEVARD FEEL)
    // ------------------------------------------------------------------------
    function createTree(x, z) {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(x, 1.2, z);

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 6, 6);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 3;
      treeGroup.add(trunk);

      // Foliage Spheres
      const leafGeo = new THREE.DodecahedronGeometry(3.5, 1);
      const leafMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x059669 : 0x10b981,
        roughness: 0.8
      });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.y = 7.5;
      treeGroup.add(leaf);

      worldGroup.add(treeGroup);
    }

    for (let tx = -280; tx <= 280; tx += 70) {
      createTree(tx + 20, 23);
      createTree(tx - 15, -23);
    }

    // ------------------------------------------------------------------------
    // ONLY 8 ICONIC MODERN LANDMARK BUILDINGS (CLEAN, SPACIOUS SKYLINE)
    // ------------------------------------------------------------------------
    const buildings = [
      // 1. Central Iconic Tower: Transit.IN Sky Tower (Center Back)
      { x: 0, z: -120, w: 42, h: 175, d: 42, color: 0x0f172a, crown: 'spire', name: 'SkyTower' },
      // 2. West Commercial Curved High-Rise
      { x: -140, z: -110, w: 38, h: 120, d: 34, color: 0x1e293b, crown: 'sloped', name: 'WestPlaza' },
      // 3. West Glass Terminal Pavilion
      { x: -260, z: -85, w: 55, h: 55, d: 40, color: 0x0f172a, crown: 'flat', name: 'Terminal1' },
      // 4. East Tech Twin Tower A
      { x: 130, z: -115, w: 32, h: 140, d: 30, color: 0x1e293b, crown: 'antennae', name: 'TechTowerA' },
      // 5. East Tech Twin Tower B (connected feel)
      { x: 175, z: -115, w: 32, h: 110, d: 30, color: 0x0f172a, crown: 'flat', name: 'TechTowerB' },
      // 6. East Innovation Atrium
      { x: 270, z: -90, w: 45, h: 65, d: 42, color: 0x1e293b, crown: 'glassDome', name: 'InnovationAtrium' },
      // 7. Far West Metro Hub Station
      { x: -350, z: -70, w: 60, h: 45, d: 35, color: 0x0f172a, crown: 'flat', name: 'MetroWest' },
      // 8. Far East City Gateway
      { x: 350, z: -70, w: 48, h: 75, d: 38, color: 0x1e293b, crown: 'sloped', name: 'EastGateway' }
    ];

    buildings.forEach(b => {
      const bldgGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const bldgMat = new THREE.MeshStandardMaterial({
        color: isDark ? b.color : 0xf1f5f9,
        roughness: 0.25,
        metalness: 0.65
      });
      const bldg = new THREE.Mesh(bldgGeo, bldgMat);
      bldg.position.set(b.x, b.h / 2, b.z);
      worldGroup.add(bldg);

      // Crisp Architectural Wireframe Edges
      const edgeGeo = new THREE.EdgesGeometry(bldgGeo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: isDark ? 0x38bdf8 : 0x93c5fd,
        transparent: true,
        opacity: isDark ? 0.35 : 0.2
      });
      const edges = new THREE.LineSegments(edgeGeo, edgeMat);
      edges.position.copy(bldg.position);
      worldGroup.add(edges);

      // Illuminated Window Bands
      const windowRows = Math.floor(b.h / 14);
      for (let r = 1; r < windowRows; r++) {
        const bandGeo = new THREE.BoxGeometry(b.w + 0.2, 1.6, b.d + 0.2);
        const bandMat = new THREE.MeshBasicMaterial({
          color: (r % 2 === 0) ? 0x38bdf8 : 0x8b5cf6,
          transparent: true,
          opacity: isDark ? 0.35 : 0.2
        });
        const band = new THREE.Mesh(bandGeo, bandMat);
        band.position.set(b.x, r * 14, b.z);
        worldGroup.add(band);
      }

      // Crown Features (Spire / Antenna / Heli)
      if (b.crown === 'spire') {
        const spireGeo = new THREE.CylinderGeometry(0.4, 1.8, 32, 8);
        const spireMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
        const spire = new THREE.Mesh(spireGeo, spireMat);
        spire.position.set(b.x, b.h + 16, b.z);
        worldGroup.add(spire);

        const beaconGeo = new THREE.SphereGeometry(1.6, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(b.x, b.h + 32, b.z);
        worldGroup.add(beacon);
      }
    });

    // ------------------------------------------------------------------------
    // BUILD AUTHENTIC 3D ELECTRIC BUSES (REALISTIC CITY VEHICLES)
    // ------------------------------------------------------------------------
    function buildDetailedBus(themeColor, routeName) {
      const bus = new THREE.Group();

      const BUS_L = 26;
      const BUS_H = 8.8;
      const BUS_W = 9.2;

      // 1. Aerodynamic Lower Body
      const bodyGeo = new THREE.BoxGeometry(BUS_L, BUS_H * 0.55, BUS_W);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: themeColor,
        roughness: 0.25,
        metalness: 0.3
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 2.4 + (BUS_H * 0.55) / 2;
      bus.add(body);

      // 2. Upper Roof & Window Cabin
      const roofGeo = new THREE.BoxGeometry(BUS_L - 1, BUS_H * 0.45, BUS_W - 0.4);
      const roofMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x0f172a : 0xffffff,
        roughness: 0.3
      });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 2.4 + BUS_H * 0.55 + (BUS_H * 0.45) / 2;
      bus.add(roof);

      // 3. Panoramic Dark Glass Windows Strip
      const winGeo = new THREE.BoxGeometry(BUS_L + 0.1, 3.2, BUS_W + 0.1);
      const winMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x030712 : 0x0284c7,
        roughness: 0.1,
        metalness: 0.85,
        transparent: true,
        opacity: 0.85
      });
      const windows = new THREE.Mesh(winGeo, winMat);
      windows.position.y = 6.2;
      bus.add(windows);

      // 4. Large Curved Front Windshield
      const wsGeo = new THREE.PlaneGeometry(BUS_W - 1, 4.2);
      const wsMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.7,
        roughness: 0.1
      });
      const windshield = new THREE.Mesh(wsGeo, wsMat);
      windshield.position.set(BUS_L / 2 + 0.08, 6.2, 0);
      windshield.rotation.y = Math.PI / 2;
      bus.add(windshield);

      // 5. Glowing Digital Destination Board (Front LED Display)
      const signGeo = new THREE.PlaneGeometry(6.5, 1.4);
      const signMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(BUS_L / 2 + 0.1, 8.4, 0);
      sign.rotation.y = Math.PI / 2;
      bus.add(sign);

      // 6. Dual LED Projector Headlights
      const hlGeo = new THREE.SphereGeometry(0.7, 8, 8);
      const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const hlL = new THREE.Mesh(hlGeo, hlMat);
      hlL.position.set(BUS_L / 2 + 0.1, 3.6, 3.2);
      const hlR = new THREE.Mesh(hlGeo, hlMat);
      hlR.position.set(BUS_L / 2 + 0.1, 3.6, -3.2);
      bus.add(hlL);
      bus.add(hlR);

      // Forward Headlight Glow Cones (illuminates road in front)
      const coneGeo = new THREE.ConeGeometry(5.5, 26, 12, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: isDark ? 0.2 : 0.08,
        side: THREE.DoubleSide
      });
      const beamL = new THREE.Mesh(coneGeo, coneMat);
      beamL.position.set(BUS_L / 2 + 13, 3.2, 2.5);
      beamL.rotation.z = -Math.PI / 2;
      bus.add(beamL);

      const beamR = new THREE.Mesh(coneGeo, coneMat);
      beamR.position.set(BUS_L / 2 + 13, 3.2, -2.5);
      beamR.rotation.z = -Math.PI / 2;
      bus.add(beamR);

      // 7. Red Taillights (Rear)
      const tlGeo = new THREE.BoxGeometry(0.4, 1.4, 1.8);
      const tlMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const tlL = new THREE.Mesh(tlGeo, tlMat);
      tlL.position.set(-BUS_L / 2 - 0.1, 4.0, 3.2);
      const tlR = new THREE.Mesh(tlGeo, tlMat);
      tlR.position.set(-BUS_L / 2 - 0.1, 4.0, -3.2);
      bus.add(tlL);
      bus.add(tlR);

      // 8. 6 Heavy-Duty Wheels with Rims
      const wheelGeo = new THREE.CylinderGeometry(2.0, 2.0, 1.2, 16);
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });
      const rimGeo = new THREE.CylinderGeometry(1.1, 1.1, 1.25, 8);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8 });

      const wheels = [];
      const wheelPos = [
        [8, 2.0, 4.6], [8, 2.0, -4.6],     // Front pair
        [-4, 2.0, 4.6], [-4, 2.0, -4.6],   // Mid pair
        [-8.5, 2.0, 4.6], [-8.5, 2.0, -4.6]// Rear pair
      ];

      wheelPos.forEach(([wx, wy, wz]) => {
        const wheelWrap = new THREE.Group();
        wheelWrap.position.set(wx, wy, wz);

        const tire = new THREE.Mesh(wheelGeo, tireMat);
        tire.rotation.x = Math.PI / 2;
        wheelWrap.add(tire);

        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.x = Math.PI / 2;
        wheelWrap.add(rim);

        bus.add(wheelWrap);
        wheels.push(wheelWrap);
      });

      return { busGroup: bus, wheels };
    }

    // ------------------------------------------------------------------------
    // REAL-TIME BUS DRIVING ENGINE (CORRECT ROAD LANES + BUS STOP BOARDING)
    // ------------------------------------------------------------------------
    // The road loop:
    // South Lane (Eastbound): X goes from -330 to +330, Z = +8.5
    // East Turnaround: smoothly curves from (+330, Z=+8.5) to (+330, Z=-8.5)
    // North Lane (Westbound): X goes from +330 to -330, Z = -8.5
    // West Turnaround: smoothly curves from (-330, Z=-8.5) to (-330, Z=+8.5)
    // Total loop length approx: 2 * 660 + 2 * (Math.PI * 8.5) = 1320 + 53.4 = 1373 units.

    const LOOP_X_MIN = -320;
    const LOOP_X_MAX = 320;
    const LANE_DIST = 8.5; // Offset from road center

    function getBusRoadState(distanceTraveled) {
      const straightLen = LOOP_X_MAX - LOOP_X_MIN; // 640
      const turnLen = Math.PI * LANE_DIST;         // 26.7
      const totalLen = 2 * straightLen + 2 * turnLen; // 1333.4
      let d = distanceTraveled % totalLen;
      if (d < 0) d += totalLen;

      // Section 1: South Lane (Eastbound: X: -320 -> +320, Z = +8.5)
      if (d < straightLen) {
        const x = LOOP_X_MIN + d;
        const z = LANE_DIST;
        return { pos: new THREE.Vector3(x, 0, z), angle: 0 };
      }
      d -= straightLen;

      // Section 2: East Curve (U-turn from Z=+8.5 to Z=-8.5 around X=+320)
      if (d < turnLen) {
        const frac = d / turnLen; // 0 to 1
        const theta = frac * Math.PI; // 0 to PI
        const x = LOOP_X_MAX + Math.sin(theta) * LANE_DIST;
        const z = Math.cos(theta) * LANE_DIST;
        return { pos: new THREE.Vector3(x, 0, z), angle: theta };
      }
      d -= turnLen;

      // Section 3: North Lane (Westbound: X: +320 -> -320, Z = -8.5)
      if (d < straightLen) {
        const x = LOOP_X_MAX - d;
        const z = -LANE_DIST;
        return { pos: new THREE.Vector3(x, 0, z), angle: Math.PI };
      }
      d -= straightLen;

      // Section 4: West Curve (U-turn from Z=-8.5 to Z=+8.5 around X=-320)
      const frac = d / turnLen;
      const theta = Math.PI + frac * Math.PI;
      const x = LOOP_X_MIN - Math.sin(frac * Math.PI) * LANE_DIST;
      const z = Math.cos(theta) * LANE_DIST;
      return { pos: new THREE.Vector3(x, 0, z), angle: theta };
    }

    // Instantiate 3 Active Buses
    const activeBuses = [
      {
        entity: buildDetailedBus(0x10B981, 'Route 102 Eco Express'), // Green
        distance: 180,
        cruisingSpeed: 1.25,
        currentSpeed: 1.25,
        stopStationX: -40,  // Stops at East Bus Stop
        stopLane: 8.5,
        stopTimer: 0
      },
      {
        entity: buildDetailedBus(0x38BDF8, 'Airport Direct 404'),     // Blue
        distance: 820,
        cruisingSpeed: 1.35,
        currentSpeed: 1.35,
        stopStationX: 60,   // Stops at West Bus Stop
        stopLane: -8.5,
        stopTimer: 0
      },
      {
        entity: buildDetailedBus(0x8B5CF6, 'City Rapid Metro Line'), // Purple
        distance: 510,
        cruisingSpeed: 1.18,
        currentSpeed: 1.18,
        stopStationX: null, // Express non-stop
        stopLane: null,
        stopTimer: 0
      }
    ];

    activeBuses.forEach(b => worldGroup.add(b.entity.busGroup));

    // ------------------------------------------------------------------------
    // MOUSE PARALLAX & CAMERA DAMPING
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
        scene.fog.color.set(isDark ? darkFog : lightFog);
        terrainMat.color.set(isDark ? 0x060a17 : 0xf8fafc);
        roadMat.color.set(isDark ? 0x111827 : 0x334155);
        walkMat.color.set(isDark ? 0x1e293b : 0xe2e8f0);
        ambientLight.color.set(isDark ? 0x222e4a : 0xf1f5f9);
        sunLight.color.set(isDark ? 0x38bdf8 : 0x2563eb);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // ------------------------------------------------------------------------
    // RENDER ANIMATION LOOP
    // ------------------------------------------------------------------------
    let lastTime = performance.now();

    function renderLoop(now) {
      requestAnimationFrame(renderLoop);

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // 1. Smooth Camera Motion
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;
      scrollY += (targetScrollY - scrollY) * 0.06;

      camera.position.x = mouse.x * 65;
      camera.position.y = 130 - mouse.y * 35 + scrollY * 0.08;
      camera.position.z = 260 + Math.abs(mouse.x) * 15;
      camera.lookAt(mouse.x * 15, 12, -15);

      // 2. Animate Real-Time Buses on the Road
      activeBuses.forEach(b => {
        // Check for Bus Stop Halt Behavior
        if (b.stopStationX !== null) {
          const state = getBusRoadState(b.distance);
          const isAtStop = Math.abs(state.pos.x - b.stopStationX) < 14 && Math.abs(state.pos.z - b.stopLane) < 2;

          if (isAtStop && b.stopTimer <= 0 && b.currentSpeed > 0.1) {
            // Initiate 2.2-second passenger boarding halt
            b.stopTimer = 2.2;
          }

          if (b.stopTimer > 0) {
            b.stopTimer -= dt;
            b.currentSpeed = Math.max(0, b.currentSpeed - dt * 2.0); // smooth braking
          } else {
            b.currentSpeed = Math.min(b.cruisingSpeed, b.currentSpeed + dt * 1.5); // smooth acceleration
          }
        }

        // Advance along road
        b.distance += b.currentSpeed * 60 * dt;

        // Position and orient bus directly on asphalt
        const roadState = getBusRoadState(b.distance);
        b.entity.busGroup.position.copy(roadState.pos);
        b.entity.busGroup.rotation.y = -roadState.angle;

        // Spin wheels based on actual driving speed
        b.entity.wheels.forEach(w => {
          w.children[0].rotation.z += (b.currentSpeed * 60 * dt) * 0.2;
        });
      });

      // 3. Pulse Bus Stop Rings
      const timeSec = now * 0.003;
      stopEast.ring.scale.setScalar(1 + 0.14 * Math.sin(timeSec));
      stopWest.ring.scale.setScalar(1 + 0.14 * Math.cos(timeSec));

      renderer.render(scene, camera);
    }

    requestAnimationFrame(renderLoop);
  }

  // Auto-launch Three.js transit scene
  if (typeof THREE === 'undefined') {
    const s = document.createElement('script');
    s.src = 'js/three.min.js';
    s.onload = initTransit3D;
    document.head.appendChild(s);
  } else {
    initTransit3D();
  }
})();
