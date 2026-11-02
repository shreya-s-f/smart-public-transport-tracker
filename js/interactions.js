/**
 * TRANSIT.IN — Premium Micro-Interactions, 3D Tilt, & Command Palette
 */

(function () {
  'use strict';

  // 1. Ultra-Fast Quantum Plasma Spotlight Aura (Zero Latency Native Pointer)
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (isFinePointer) {
    const aura = document.createElement('div');
    aura.className = 'transit-plasma-aura';
    document.body.appendChild(aura);

    let mouseX = -500;
    let mouseY = -500;
    let auraX = -500;
    let auraY = -500;
    let isMoving = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isMoving) {
        aura.classList.add('active');
        isMoving = true;
      }
    }, { passive: true });

    // High frequency spring loop (0.65 factor for snappy, instant glide)
    const renderAura = () => {
      auraX += (mouseX - auraX) * 0.65;
      auraY += (mouseY - auraY) * 0.65;
      aura.style.left = `${auraX}px`;
      aura.style.top = `${auraY}px`;
      requestAnimationFrame(renderAura);
    };
    requestAnimationFrame(renderAura);

    // Instant hover reaction on interactive elements
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('a, button, input, select, .touch-action-btn, .glass-panel, .glass-card, [role="button"], .profile-main-tab-btn, .filter-pill');
      if (target) {
        aura.classList.add('hovering');
      }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('a, button, input, select, .touch-action-btn, .glass-panel, .glass-card, [role="button"], .profile-main-tab-btn, .filter-pill');
      if (target) {
        aura.classList.remove('hovering');
      }
    }, { passive: true });
  }

  // 2. 3D Card Hover Tilt Effect (Smooth & Lightweight)
  function init3DTilt() {
    const cards = document.querySelectorAll('.glass-panel, .step-card, .testimonial-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      }, { passive: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3DTilt);
  } else {
    init3DTilt();
  }

  // 3. Global Universal Command Palette (Ctrl + K)
  function initCommandPalette() {
    const backdrop = document.createElement('div');
    backdrop.className = 'cmd-palette-backdrop';
    backdrop.id = 'globalCommandPalette';
    backdrop.innerHTML = `
      <div class="cmd-palette-box" role="dialog" aria-modal="true" aria-label="Command Palette">
        <div class="cmd-palette-input-wrap">
          <i class="fa-solid fa-magnifying-glass" style="color: #8B5CF6;"></i>
          <input type="text" id="cmdPaletteInput" class="cmd-palette-input" placeholder="Type a route, stop, or navigation action (e.g. 500A, Safety, Tracking)..." autocomplete="off">
          <span class="kbd-shortcut">ESC to close</span>
        </div>
        <div class="cmd-palette-results" id="cmdPaletteResults">
          <!-- Dynamically populated commands -->
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    const input = document.getElementById('cmdPaletteInput');
    const results = document.getElementById('cmdPaletteResults');

    const commands = [
      { title: 'Home & Hero Dashboard', category: 'Navigation', icon: 'fa-gauge-high', url: 'index.html' },
      { title: 'Live GPS Bus Tracking & Radar', category: 'Navigation', icon: 'fa-map-location-dot', url: 'tracking.html' },
      { title: 'Route Explorer & Intermodal Lines', category: 'Navigation', icon: 'fa-route', url: 'routes.html' },
      { title: 'Weekly Timetable & Platform Bays', category: 'Navigation', icon: 'fa-clock', url: 'timetable.html' },
      { title: 'Disruption Alerts & Weather Advisories', category: 'Navigation', icon: 'fa-bell', url: 'notifications.html' },
      { title: 'Book QR Tickets & Seats', category: 'Ticketing', icon: 'fa-ticket', url: 'booking.html' },
      { title: '24/7 SOS Safety Shield Hub', category: 'Safety', icon: 'fa-shield-heart', url: 'safety.html' },
      { title: 'Fleet Central Admin Portal', category: 'Admin', icon: 'fa-sliders', url: 'admin.html' },
      { title: 'Passenger Commuter Profile & Pass', category: 'Account', icon: 'fa-user-astronaut', url: 'profile.html' },
      { title: 'Route 507: Okhla to Connaught Place', category: 'Delhi Route', icon: 'fa-bus', url: 'tracking.html?route=507' },
      { title: 'Route Airport-Exp: New Delhi to IGI T3', category: 'Delhi Route', icon: 'fa-plane-departure', url: 'tracking.html?route=Airport-Exp' },
      { title: 'Route V-500D: Hebbal to Silk Board', category: 'Bangalore Route', icon: 'fa-bus', url: 'tracking.html?route=500D' },
      { title: 'Route BEST-301: CSMT to BKC', category: 'Mumbai Route', icon: 'fa-bolt', url: 'tracking.html?route=BEST-301' }
    ];

    function renderResults(filterText = '') {
      const q = filterText.toLowerCase().trim();
      const matched = commands.filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));

      if (matched.length === 0) {
        results.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: #94A3B8; font-size: 0.9rem;">No matching transit routes or tools found.</div>';
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
      setTimeout(() => {
        input.value = '';
        renderResults('');
        input.focus();
      }, 50);
    };

    const closePalette = () => {
      backdrop.classList.remove('active');
    };

    // Keyboard trigger Ctrl + K or Cmd + K
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

    // Connect top navbar shortcut button
    const navBtn = document.getElementById('navCmdKBtn');
    if (navBtn) {
      navBtn.addEventListener('click', openPalette);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommandPalette);
  } else {
    initCommandPalette();
  }

  // 4. Web Audio Synthesized Toasts
  function showTransitToast(message, type = 'info') {
    let stack = document.getElementById('transit-toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'transit-toast-stack';
      document.body.appendChild(stack);
    }

    const toast = document.createElement('div');
    toast.className = 'transit-toast';

    let icon = 'fa-circle-info';
    let iconColor = '#38BDF8';
    if (type === 'success') { icon = 'fa-circle-check'; iconColor = '#34D399'; }
    if (type === 'error') { icon = 'fa-triangle-exclamation'; iconColor = '#EF4444'; }
    if (type === 'warning') { icon = 'fa-circle-exclamation'; iconColor = '#F59E0B'; }

    toast.innerHTML = `
      <i class="fa-solid ${icon}" style="color: ${iconColor}; font-size: 1.1rem;"></i>
      <span style="flex: 1;">${message}</span>
      <button style="background: none; border: none; color: #94A3B8; cursor: pointer; padding: 0.2rem;" onclick="this.parentElement.remove()">&times;</button>
    `;

    stack.appendChild(toast);

    // Audio chime feedback
    playNotificationChime();

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  }

  function playNotificationChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  }

  // Expose global interface
  window.TransitInteractions = {
    showToast: showTransitToast,
    playChime: playNotificationChime
  };

})();
