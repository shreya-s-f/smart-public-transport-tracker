/**
 * TRANSIT.IN — Premium Micro-Interactions, 3D Tilt, & Command Palette
 */

(function () {
  'use strict';

  // 1. Desktop Custom Cursor
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (isFinePointer) {
    document.body.classList.add('has-custom-cursor');

    const dot = document.createElement('div');
    dot.className = 'transit-cursor-dot';

    const ring = document.createElement('div');
    ring.className = 'transit-cursor-ring';

    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    });

    const renderCursor = () => {
      ringX += (mouseX - ringX) * 0.25;
      ringY += (mouseY - ringY) * 0.25;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    // Magnetic Hover Effect on Buttons and Links
    const addHoverListeners = () => {
      const interactives = document.querySelectorAll('a, button, input, select, .touch-action-btn, .glass-panel, .glass-card, [role="button"]');
      interactives.forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
      });
    };
    addHoverListeners();
    document.addEventListener('DOMContentLoaded', addHoverListeners);
  }

  // 2. 3D Card Hover Tilt Effect
  function init3DTilt() {
    const cards = document.querySelectorAll('.glass-panel, .step-card, .testimonial-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }

  // 3. Global Command Palette (Ctrl + K)
  function initCommandPalette() {
    const backdrop = document.createElement('div');
    backdrop.className = 'cmd-palette-backdrop';
    backdrop.id = 'transitCmdPalette';

    backdrop.innerHTML = `
      <div class="cmd-palette-box" role="dialog" aria-modal="true" aria-label="Command Palette">
        <div class="cmd-palette-input-wrap">
          <i class="fa-solid fa-magnifying-glass" style="color: #8B5CF6;"></i>
          <input type="text" id="cmdPaletteInput" class="cmd-palette-input" placeholder="Type a route, stop, or navigation action (e.g. 500A, Safety, Tracking)..." autocomplete="off">
          <span class="kbd-shortcut">ESC to close</span>
        </div>
        <div class="cmd-palette-results" id="cmdPaletteResults">
          <!-- Commands inserted dynamically -->
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const input = document.getElementById('cmdPaletteInput');
    const results = document.getElementById('cmdPaletteResults');

    const commands = [
      { title: 'Live Bus Tracking Radar', category: 'Navigation', icon: 'fa-satellite-dish', url: 'tracking.html' },
      { title: 'Route 500A (Silk Board - Hebbal)', category: 'Route', icon: 'fa-route', url: 'tracking.html?route=500A' },
      { title: 'Route 507 (Okhla - Connaught Place)', category: 'Route', icon: 'fa-route', url: 'tracking.html?route=507' },
      { title: 'BEST-301 (CSMT - BKC Mumbai)', category: 'Route', icon: 'fa-route', url: 'tracking.html?route=BEST-301' },
      { title: 'BGK-01 (Navanagar - College Cross)', category: 'Route', icon: 'fa-route', url: 'tracking.html?route=BGK-01' },
      { title: 'Book Contactless QR Pass', category: 'Ticketing', icon: 'fa-ticket', url: 'booking.html' },
      { title: 'Safety Shield & Emergency SOS', category: 'Safety', icon: 'fa-shield-heart', url: 'safety.html' },
      { title: 'Driver Cabin Console Mode', category: 'Driver', icon: 'fa-id-card-clip', url: 'driver.html' },
      { title: 'Central Admin Management', category: 'Admin', icon: 'fa-sliders', url: 'admin.html' },
      { title: 'Commuter Profile & Wallet', category: 'Account', icon: 'fa-user-astronaut', url: 'profile.html' },
      { title: 'Browse Pan-India Route Network', category: 'Navigation', icon: 'fa-network-wired', url: 'routes.html' },
      { title: 'View Timetable & Platform Bays', category: 'Timetable', icon: 'fa-clock', url: 'timetable.html' }
    ];

    function renderResults(filterText = '') {
      const q = filterText.toLowerCase().trim();
      const matched = commands.filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));

      if (matched.length === 0) {
        results.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: #94A3B8; font-size: 0.9rem;">No matching routes or pages found.</div>`;
        return;
      }

      results.innerHTML = matched.map((c, i) => `
        <a href="${c.url}" class="cmd-item ${i === 0 ? 'selected' : ''}">
          <div class="cmd-item-left">
            <i class="fa-solid ${c.icon} cmd-item-icon"></i>
            <div>
              <div style="font-weight: 600;">${c.title}</div>
              <div style="font-size: 0.75rem; color: #94A3B8;">${c.category}</div>
            </div>
          </div>
          <i class="fa-solid fa-arrow-turn-down" style="font-size: 0.75rem; opacity: 0.4;"></i>
        </a>
      `).join('');
    }

    renderResults('');

    const openPalette = () => {
      backdrop.classList.add('active');
      input.value = '';
      renderResults('');
      setTimeout(() => input.focus(), 100);
    };

    const closePalette = () => {
      backdrop.classList.remove('active');
    };

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (backdrop.classList.contains('active')) {
          closePalette();
        } else {
          openPalette();
        }
      } else if (e.key === 'Escape' && backdrop.classList.contains('active')) {
        closePalette();
      }
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closePalette();
    });

    input.addEventListener('input', (e) => {
      renderResults(e.target.value);
    });

    // Wire navbar Ctrl+K trigger buttons
    document.querySelectorAll('#navCmdKBtn').forEach(btn => {
      btn.addEventListener('click', openPalette);
    });
  }

  // 4. Universal Toast Notifications System
  function initToastStack() {
    let stack = document.getElementById('transit-toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'transit-toast-stack';
      document.body.appendChild(stack);
    }

    window.showTransitToast = function (message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = 'transit-toast';

      const iconMap = {
        success: 'fa-circle-check',
        error: 'fa-triangle-exclamation',
        info: 'fa-circle-info',
        warning: 'fa-bell'
      };
      const colorMap = {
        success: '#34D399',
        error: '#EF4444',
        info: '#38BDF8',
        warning: '#F59E0B'
      };

      const icon = iconMap[type] || 'fa-circle-info';
      const color = colorMap[type] || '#38BDF8';

      toast.innerHTML = `
        <i class="fa-solid ${icon}" style="color: ${color}; font-size: 1.15rem;"></i>
        <div style="flex: 1; font-weight: 500;">${message}</div>
      `;

      stack.appendChild(toast);

      // Web Audio Synthesized Chime
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(type === 'error' ? 320 : 660, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(type === 'error' ? 240 : 880, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } catch (e) {}

      setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 350);
      }, 3500);
    };
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init3DTilt();
      initCommandPalette();
      initToastStack();
    });
  } else {
    init3DTilt();
    initCommandPalette();
    initToastStack();
  }
})();
