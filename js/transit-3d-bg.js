/**
 * TRANSIT.IN — Interactive 3D Holographic Background Engine
 * GPU-accelerated canvas 3D perspective projection, dynamic transit constellation,
 * undulating 3D perspective rail grid, floating gyroscopic nodes, and mouse parallax.
 */
(function() {
  'use strict';

  // Ensure canvas and vignette exist in DOM
  let canvas = document.getElementById('transit-3d-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'transit-3d-canvas';
    document.body.prepend(canvas);
  }

  let vignette = document.querySelector('.transit-3d-vignette');
  if (!vignette) {
    vignette = document.createElement('div');
    vignette.className = 'transit-3d-vignette';
    document.body.prepend(vignette);
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // 3D Engine Parameters
  const FOCAL_LENGTH = 650;
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let scrollY = window.scrollY || 0;
  let targetScrollY = scrollY;
  let isDarkMode = document.documentElement.getAttribute('data-theme') !== 'light';

  // Theme observer
  const themeObserver = new MutationObserver(() => {
    isDarkMode = document.documentElement.getAttribute('data-theme') !== 'light';
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Handle Resize
  function onResize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', onResize, { passive: true });

  // Mouse Parallax tracking
  window.addEventListener('mousemove', (e) => {
    // Normalized between -1 and 1
    mouse.targetX = (e.clientX / width - 0.5) * 2;
    mouse.targetY = (e.clientY / height - 0.5) * 2;
  }, { passive: true });

  // Scroll tracking for 3D flight-through
  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
  }, { passive: true });

  // --------------------------------------------------------------------------
  // 3D Point & Object Entities
  // --------------------------------------------------------------------------

  // 1. Transit Hub Nodes in 3D Space
  const NODE_COUNT = 65;
  const nodes = [];
  const BOUND_X = 1400;
  const BOUND_Y = 800;
  const BOUND_Z = 1200;

  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: (Math.random() - 0.5) * BOUND_X * 2,
      y: (Math.random() - 0.5) * BOUND_Y * 2,
      z: Math.random() * BOUND_Z - 200,
      baseRadius: Math.random() * 2.5 + 1.5,
      pulsePhase: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      vz: (Math.random() - 0.5) * 0.6,
      hubType: i % 4 === 0 ? 'metro' : (i % 4 === 1 ? 'bus' : 'station')
    });
  }

  // 2. 3D Glowing Transit Route Pulses
  const PULSE_COUNT = 18;
  const pulses = [];
  for (let i = 0; i < PULSE_COUNT; i++) {
    pulses.push({
      fromNode: Math.floor(Math.random() * NODE_COUNT),
      toNode: Math.floor(Math.random() * NODE_COUNT),
      progress: Math.random(),
      speed: Math.random() * 0.008 + 0.004,
      trailLength: 0.15
    });
  }

  // 3. Floating 3D Tech Rings (Satellites)
  const rings = [
    { x: -380, y: -160, z: 400, radius: 120, rotX: 0.4, rotY: 0, rotZ: 0, speedY: 0.006 },
    { x: 420, y: 180, z: 500, radius: 160, rotX: 1.1, rotY: 0, rotZ: 0.5, speedY: -0.005 },
    { x: 0, y: 320, z: 650, radius: 220, rotX: 1.5, rotY: 0, rotZ: 0, speedY: 0.003 }
  ];

  // --------------------------------------------------------------------------
  // Math & 3D Projection Helpers
  // --------------------------------------------------------------------------
  function project(x, y, z, camAngleX, camAngleY, camZOffset) {
    // Apply camera rotation Y (yaw)
    const cosY = Math.cos(camAngleY);
    const sinY = Math.sin(camAngleY);
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;

    // Apply camera rotation X (pitch)
    const cosX = Math.cos(camAngleX);
    const sinX = Math.sin(camAngleX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX + camZOffset;

    if (z2 + FOCAL_LENGTH <= 10) {
      return { visible: false, x: 0, y: 0, scale: 0, z: z2 };
    }

    const scale = FOCAL_LENGTH / (FOCAL_LENGTH + z2);
    const projX = width / 2 + x1 * scale;
    const projY = height / 2 + y2 * scale;

    return {
      visible: projX >= -100 && projX <= width + 100 && projY >= -100 && projY <= height + 100,
      x: projX,
      y: projY,
      scale: scale,
      z: z2
    };
  }

  // --------------------------------------------------------------------------
  // Render Loop
  // --------------------------------------------------------------------------
  let time = 0;
  let camAngleX = 0;
  let camAngleY = 0;

  function render() {
    time += 0.015;

    // Smooth inertia camera tracking
    mouse.x += (mouse.targetX - mouse.x) * 0.04;
    mouse.y += (mouse.targetY - mouse.y) * 0.04;
    scrollY += (targetScrollY - scrollY) * 0.05;

    camAngleX = mouse.y * 0.12 - 0.04;
    camAngleY = -mouse.x * 0.15;
    const camZOffset = (scrollY * 0.25) % 400;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // Color definitions based on theme
    const primaryColor = isDarkMode ? 'rgba(56, 189, 248, ' : 'rgba(37, 99, 235, ';
    const accentColor  = isDarkMode ? 'rgba(139, 92, 246, ' : 'rgba(124, 58, 237, ';
    const emeraldColor = isDarkMode ? 'rgba(16, 185, 129, ' : 'rgba(5, 150, 105, ';
    const gridLineColor = isDarkMode ? 'rgba(139, 92, 246, ' : 'rgba(99, 102, 241, ';

    // ------------------------------------------------------------------------
    // LAYER 1: Undulating 3D Perspective Transit Ground Grid
    // ------------------------------------------------------------------------
    const gridRows = 16;
    const gridCols = 24;
    const gridSpacing = 90;
    const gridGroundY = 380;
    const gridZStart = -100;

    ctx.save();
    ctx.lineWidth = 1;

    // Longitudinal grid lines (depth rays)
    for (let col = -gridCols / 2; col <= gridCols / 2; col++) {
      ctx.beginPath();
      let started = false;
      for (let row = 0; row < gridRows; row++) {
        const x = col * gridSpacing;
        const z = gridZStart + row * gridSpacing + ((scrollY * 0.5) % gridSpacing);
        // Harmonic terrain wave
        const wave = Math.sin(col * 0.4 + time) * Math.cos(row * 0.3 + time * 0.8) * 25;
        const y = gridGroundY + wave;

        const p = project(x, y, z, camAngleX, camAngleY, 0);
        if (p.visible) {
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
      }
      const alpha = Math.max(0, 0.18 - Math.abs(col) * 0.008);
      ctx.strokeStyle = gridLineColor + (isDarkMode ? alpha : alpha * 0.7) + ')';
      ctx.stroke();
    }

    // Latitudinal grid lines (cross lines)
    for (let row = 0; row < gridRows; row++) {
      ctx.beginPath();
      let started = false;
      const z = gridZStart + row * gridSpacing + ((scrollY * 0.5) % gridSpacing);
      const rowAlpha = Math.max(0, (1 - row / gridRows) * 0.22);

      for (let col = -gridCols / 2; col <= gridCols / 2; col++) {
        const x = col * gridSpacing;
        const wave = Math.sin(col * 0.4 + time) * Math.cos(row * 0.3 + time * 0.8) * 25;
        const y = gridGroundY + wave;

        const p = project(x, y, z, camAngleX, camAngleY, 0);
        if (p.visible) {
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
      }
      ctx.strokeStyle = gridLineColor + (isDarkMode ? rowAlpha : rowAlpha * 0.7) + ')';
      ctx.stroke();
    }
    ctx.restore();

    // ------------------------------------------------------------------------
    // LAYER 2: Floating 3D Tech Rings (Satellites)
    // ------------------------------------------------------------------------
    rings.forEach((ring) => {
      ring.rotY += ring.speedY;
      const segments = 36;
      ctx.save();
      ctx.beginPath();
      let firstPoint = null;

      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        // Point on circle
        let rx = Math.cos(theta) * ring.radius;
        let ry = Math.sin(theta) * ring.radius * Math.sin(ring.rotX);
        let rz = Math.sin(theta) * ring.radius * Math.cos(ring.rotX);

        // Rotate Y
        const cosRY = Math.cos(ring.rotY);
        const sinRY = Math.sin(ring.rotY);
        let rx2 = rx * cosRY - rz * sinRY;
        let rz2 = rx * sinRY + rz * cosRY;

        const p = project(ring.x + rx2, ring.y + ry, ring.z + rz2, camAngleX, camAngleY, camZOffset);
        if (p.visible) {
          if (!firstPoint) {
            ctx.moveTo(p.x, p.y);
            firstPoint = p;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
      }
      ctx.strokeStyle = accentColor + (isDarkMode ? '0.18)' : '0.12)');
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    });

    // ------------------------------------------------------------------------
    // LAYER 3: 3D Transit Constellation Network (Nodes + Lines)
    // ------------------------------------------------------------------------
    const projectedNodes = [];

    // Update & project all nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      n.z += n.vz;

      // Gentle bounds bounce
      if (Math.abs(n.x) > BOUND_X) n.vx *= -1;
      if (Math.abs(n.y) > BOUND_Y) n.vy *= -1;
      if (n.z < -200 || n.z > BOUND_Z) n.vz *= -1;

      const p = project(n.x, n.y, n.z, camAngleX, camAngleY, camZOffset);
      projectedNodes.push({ p, node: n });
    }

    // Draw interconnecting 3D transit lines
    const MAX_DIST_3D = 400;
    ctx.save();
    for (let i = 0; i < projectedNodes.length; i++) {
      const a = projectedNodes[i];
      if (!a.p.visible) continue;

      for (let j = i + 1; j < projectedNodes.length; j++) {
        const b = projectedNodes[j];
        if (!b.p.visible) continue;

        const dx = a.node.x - b.node.x;
        const dy = a.node.y - b.node.y;
        const dz = a.node.z - b.node.z;
        const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist3D < MAX_DIST_3D) {
          const alpha = (1 - dist3D / MAX_DIST_3D) * (isDarkMode ? 0.22 : 0.14);
          ctx.beginPath();
          ctx.moveTo(a.p.x, a.p.y);
          ctx.lineTo(b.p.x, b.p.y);
          ctx.strokeStyle = primaryColor + alpha + ')';
          ctx.lineWidth = Math.max(0.6, (a.p.scale + b.p.scale) * 0.7);
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    // ------------------------------------------------------------------------
    // LAYER 4: 3D Animated Transit Data Pulses (Moving packets along routes)
    // ------------------------------------------------------------------------
    ctx.save();
    pulses.forEach(pulse => {
      pulse.progress += pulse.speed;
      if (pulse.progress >= 1) {
        pulse.progress = 0;
        pulse.fromNode = Math.floor(Math.random() * nodes.length);
        pulse.toNode = Math.floor(Math.random() * nodes.length);
      }

      const n1 = nodes[pulse.fromNode];
      const n2 = nodes[pulse.toNode];
      if (!n1 || !n2) return;

      const curX = n1.x + (n2.x - n1.x) * pulse.progress;
      const curY = n1.y + (n2.y - n1.y) * pulse.progress;
      const curZ = n1.z + (n2.z - n1.z) * pulse.progress;

      const p = project(curX, curY, curZ, camAngleX, camAngleY, camZOffset);
      if (p.visible && p.scale > 0) {
        const pulseRadius = Math.max(1.8, 3.8 * p.scale);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseRadius * 2.5);
        grad.addColorStop(0, emeraldColor + (isDarkMode ? '0.9)' : '0.85)'));
        grad.addColorStop(0.5, primaryColor + (isDarkMode ? '0.5)' : '0.4)'));
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();

    // ------------------------------------------------------------------------
    // LAYER 5: Draw 3D Transit Hub Nodes with Radial Aura
    // ------------------------------------------------------------------------
    ctx.save();
    for (let i = 0; i < projectedNodes.length; i++) {
      const item = projectedNodes[i];
      if (!item.p.visible) continue;

      const p = item.p;
      const n = item.node;
      const radius = Math.max(1.2, n.baseRadius * p.scale * (1 + 0.2 * Math.sin(time * 2 + n.pulsePhase)));

      // Glowing Aura
      const auraGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 3.5);
      const nodeCol = n.hubType === 'metro' ? accentColor : (n.hubType === 'bus' ? primaryColor : emeraldColor);
      auraGrad.addColorStop(0, nodeCol + (isDarkMode ? '0.85)' : '0.7)'));
      auraGrad.addColorStop(0.4, nodeCol + (isDarkMode ? '0.35)' : '0.2)'));
      auraGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Bright Core
      ctx.fillStyle = isDarkMode ? '#FFFFFF' : '#1E293B';
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    requestAnimationFrame(render);
  }

  // Start loop when page is visible
  let animId = requestAnimationFrame(render);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animId = requestAnimationFrame(render);
    }
  });

})();
