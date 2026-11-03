/**
 * TRANSIT.IN — Premium First-Time User Onboarding Tour System
 * ============================================================
 * - Triggers automatically after first-time signup (spt-is-new-user flag)
 * - Multi-page guided tour with spotlight, tooltip, and animated transitions
 * - Works across all 10 pages: Dashboard, Routes, Tracking, Timetable,
 *   Alerts, Booking, Safety, Voice AI, Admin, Profile
 * - Persists tour state across pages via sessionStorage
 * - Can be manually triggered from Profile page "Take Tour Again" button
 */

(function () {
  'use strict';

  // ──────────────────────────────────────────────────────────────────────────
  // TOUR CONFIGURATION — All steps, selectors, positions, and copy
  // ──────────────────────────────────────────────────────────────────────────
  const TOUR_STEPS = [
    // ── DASHBOARD (index.html) ──────────────────────────────────────────
    {
      page: 'index.html',
      selector: '.navbar',
      title: 'Your Command Center',
      desc: 'This is your <strong>global navigation bar</strong> — always visible at the top. Jump between <strong>Dashboard, Routes, Tracking, Booking, Safety,</strong> and all other modules instantly.',
      module: 'Navigation',
      icon: 'fa-bars',
      position: 'bottom',
      padding: 10,
    },
    {
      page: 'index.html',
      selector: '.hero-saas-section',
      title: 'Smart Dashboard Overview',
      desc: 'Your <strong>personalised homepage</strong> shows live fleet data, transit statistics, and quick access to all services — all updating in real-time.',
      module: 'Dashboard',
      icon: 'fa-gauge-high',
      position: 'bottom',
      padding: 16,
    },
    {
      page: 'index.html',
      selector: '.hero-cta-group',
      title: 'Explore Live Tracking & Get Started',
      desc: 'Click <strong>"Explore Live Tracking"</strong> to see real-time bus locations on the map, or <strong>"Get Started"</strong> to plan your first journey now.',
      module: 'Dashboard',
      icon: 'fa-satellite-dish',
      position: 'top',
      padding: 12,
    },
    {
      page: 'index.html',
      selector: '.hero-metrics-bar',
      title: 'Live System Metrics',
      desc: 'Animated counters show <strong>real-time data</strong>: active buses, passengers served, routes monitored, and cities connected — updating every few seconds.',
      module: 'Dashboard',
      icon: 'fa-chart-line',
      position: 'top',
      padding: 14,
    },
    // ── ROUTES (routes.html) ─────────────────────────────────────────────
    {
      page: 'routes.html',
      selector: '.navbar',
      title: 'Routes & Journey Planner',
      desc: 'Welcome to the <strong>Routes module</strong>. Browse all bus routes, filter by origin and destination, and plan your smartest journey in seconds.',
      module: 'Routes',
      icon: 'fa-route',
      position: 'bottom',
      padding: 10,
    },
    {
      page: 'routes.html',
      selector: '#journey-planner-container, .route-search-box, main',
      title: 'Journey Planner',
      desc: 'Enter your <strong>From</strong> and <strong>To</strong> locations to instantly see available routes, estimated times, and fare details for your trip.',
      module: 'Routes',
      icon: 'fa-compass',
      position: 'center',
      padding: 16,
    },
    // ── LIVE TRACKING (tracking.html) ────────────────────────────────────
    {
      page: 'tracking.html',
      selector: '.navbar',
      title: 'Live Bus Tracking',
      desc: 'The <strong>Live Tracking</strong> module shows real-time bus positions on an interactive map — see every bus moving across the city right now.',
      module: 'Live Tracking',
      icon: 'fa-map-location-dot',
      position: 'bottom',
      padding: 10,
    },
    {
      page: 'tracking.html',
      selector: '#map, .map-container, main',
      title: 'Interactive Map',
      desc: 'Tap any <strong>bus marker</strong> to see its route, next stops, live occupancy, and estimated arrival times. Your location can be enabled for nearby stop alerts.',
      module: 'Live Tracking',
      icon: 'fa-bus-simple',
      position: 'center',
      padding: 20,
    },
    // ── TIMETABLE (timetable.html) ───────────────────────────────────────
    {
      page: 'timetable.html',
      selector: 'main',
      title: 'Bus Timetable',
      desc: 'Search any <strong>route number or bus stop</strong> to instantly fetch scheduled departure and arrival times. Never miss your bus again.',
      module: 'Timetable',
      icon: 'fa-clock',
      position: 'center',
      padding: 20,
    },
    // ── BOOKING (booking.html) ────────────────────────────────────────────
    {
      page: 'booking.html',
      selector: 'main',
      title: 'Smart Ticket Booking',
      desc: 'Book bus tickets for any route, get your <strong>QR digital bus pass</strong> instantly, and manage your wallet — all without stepping to a ticket counter.',
      module: 'Booking',
      icon: 'fa-ticket',
      position: 'center',
      padding: 20,
    },
    // ── ALERTS (notifications.html) ───────────────────────────────────────
    {
      page: 'notifications.html',
      selector: 'main',
      title: 'Smart Alerts & Notifications',
      desc: 'Get real-time <strong>bus delay alerts, schedule changes, safety warnings,</strong> and personalised notifications — all managed from this hub.',
      module: 'Alerts',
      icon: 'fa-bell',
      position: 'center',
      padding: 20,
    },
    // ── SAFETY (safety.html) ─────────────────────────────────────────────
    {
      page: 'safety.html',
      selector: 'main',
      title: 'Safety Shield Hub',
      desc: 'Your personal <strong>safety command centre</strong>. Sound emergency alarms, alert Transit Police, share your live journey, and access 24/7 Pan-India helplines instantly.',
      module: 'Safety',
      icon: 'fa-shield-heart',
      position: 'center',
      padding: 20,
    },
    // ── VOICE AI (voice.html) ─────────────────────────────────────────────
    {
      page: 'voice.html',
      selector: 'main',
      title: 'Voice Transit Assistant',
      desc: 'Ask anything in your <strong>natural language</strong>: "Where is Bus 500D?", "Next bus to Airport?", "Book a ticket to Majestic." The AI assistant responds with spoken answers.',
      module: 'Voice AI',
      icon: 'fa-microphone',
      position: 'center',
      padding: 20,
    },
    // ── PROFILE (profile.html) ────────────────────────────────────────────
    {
      page: 'profile.html',
      selector: 'main',
      title: 'Your Commuter Profile',
      desc: 'Manage your <strong>personal details, travel history, wallet balance, digital bus pass, favourite routes,</strong> and account security — all in one place.',
      module: 'Profile',
      icon: 'fa-user',
      position: 'center',
      padding: 20,
    },
    // ── ADMIN (admin.html) ────────────────────────────────────────────────
    {
      page: 'admin.html',
      selector: 'main',
      title: 'Fleet Admin Dashboard',
      desc: 'Administrators can manage <strong>buses, routes, passengers, complaints, maintenance, analytics,</strong> and emergency operations from this central hub.',
      module: 'Admin',
      icon: 'fa-sliders',
      position: 'center',
      padding: 20,
    },
  ];

  // Page navigation order for tour
  const TOUR_PAGES = [
    'index.html',
    'routes.html',
    'tracking.html',
    'timetable.html',
    'booking.html',
    'notifications.html',
    'safety.html',
    'voice.html',
    'profile.html',
    'admin.html',
  ];

  const STORAGE_KEY_ACTIVE    = 'transit-tour-active';
  const STORAGE_KEY_STEP      = 'transit-tour-step';
  const STORAGE_KEY_NEW_USER  = 'spt-is-new-user';
  const STORAGE_KEY_DONE      = 'transit-tour-done';

  // ──────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────────────────────────
  function currentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  function stepsForPage(page) {
    return TOUR_STEPS.filter(s => s.page === page);
  }

  function allStepsForPage(page) {
    return TOUR_STEPS.map((s, i) => ({ ...s, globalIndex: i })).filter(s => s.page === page);
  }

  function totalSteps() { return TOUR_STEPS.length; }

  function getGlobalStep() {
    return parseInt(sessionStorage.getItem(STORAGE_KEY_STEP) || '0', 10);
  }

  function setGlobalStep(n) {
    sessionStorage.setItem(STORAGE_KEY_STEP, String(n));
  }

  function isNewUser() {
    return localStorage.getItem(STORAGE_KEY_NEW_USER) === 'true';
  }

  function isTourActive() {
    return sessionStorage.getItem(STORAGE_KEY_ACTIVE) === 'true';
  }

  function markTourActive() {
    sessionStorage.setItem(STORAGE_KEY_ACTIVE, 'true');
  }

  function completeTour() {
    sessionStorage.removeItem(STORAGE_KEY_ACTIVE);
    sessionStorage.removeItem(STORAGE_KEY_STEP);
    localStorage.removeItem(STORAGE_KEY_NEW_USER);
    localStorage.setItem(STORAGE_KEY_DONE, 'true');
  }

  function cancelTour() {
    sessionStorage.removeItem(STORAGE_KEY_ACTIVE);
    sessionStorage.removeItem(STORAGE_KEY_STEP);
    localStorage.removeItem(STORAGE_KEY_NEW_USER);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DOM BUILDERS
  // ──────────────────────────────────────────────────────────────────────────
  function buildTourDOM() {
    if (document.getElementById('transit-tour-root')) return;

    const root = document.createElement('div');
    root.id = 'transit-tour-root';
    root.innerHTML = `
      <!-- Spotlight -->
      <div id="tour-spotlight" class="tour-spotlight" style="display:none;"></div>

      <!-- Tooltip -->
      <div id="tour-tooltip" class="tour-tooltip" style="display:none;" role="dialog" aria-live="polite">
        <div class="tour-step-label">
          <span class="tour-step-num" id="tour-step-num">1</span>
          <span class="tour-module-badge"><i class="fa-solid fa-bus-simple"></i> <span id="tour-module-name">Dashboard</span></span>
        </div>
        <h3 class="tour-title" id="tour-title">Welcome</h3>
        <p class="tour-desc" id="tour-desc"></p>
        <div class="tour-progress" id="tour-progress"></div>
        <div class="tour-actions">
          <button class="tour-skip-btn" onclick="window.TransitTour.skip()">
            <i class="fa-solid fa-xmark"></i> Skip Tour
          </button>
          <div class="tour-btn-group">
            <button class="tour-prev-btn" id="tour-prev-btn" onclick="window.TransitTour.prev()" style="display:none;">
              <i class="fa-solid fa-arrow-left"></i> Back
            </button>
            <button class="tour-next-btn" id="tour-next-btn" onclick="window.TransitTour.next()">
              Next <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Welcome Screen -->
      <div id="tour-welcome" class="tour-welcome-screen">
        <div class="tour-welcome-card">
          <div class="confetti-burst" id="confetti-burst"></div>
          <div class="tour-welcome-icon">🚌</div>
          <div class="tour-welcome-hi">Welcome to Transit.IN</div>
          <h2 class="tour-welcome-title">Hey <span class="tour-welcome-name" id="tour-user-name">there</span>! 👋</h2>
          <p class="tour-welcome-desc">
            You've just joined India's smartest public transport platform. Let us take you on a quick <strong style="color:#C4B5FD;">60-second tour</strong> to show you everything you can do.
          </p>
          <div class="tour-welcome-features">
            <span class="tour-feature-pill"><i class="fa-solid fa-map-location-dot"></i> Live Tracking</span>
            <span class="tour-feature-pill"><i class="fa-solid fa-ticket"></i> Smart Booking</span>
            <span class="tour-feature-pill"><i class="fa-solid fa-shield-heart"></i> Safety Shield</span>
            <span class="tour-feature-pill"><i class="fa-solid fa-microphone"></i> Voice AI</span>
            <span class="tour-feature-pill"><i class="fa-solid fa-bell"></i> Smart Alerts</span>
            <span class="tour-feature-pill"><i class="fa-solid fa-route"></i> Route Planner</span>
          </div>
          <div>
            <button class="tour-start-btn" onclick="window.TransitTour.startTour()">
              <i class="fa-solid fa-play"></i> Start Tour (9 modules)
            </button>
            <button class="tour-skip-all-btn" onclick="window.TransitTour.skip()">
              Skip for now
            </button>
          </div>
        </div>
      </div>

      <!-- Page Transition Loader -->
      <div id="tour-transition" class="tour-page-transition">
        <div class="tour-transition-icon"><i class="fa-solid fa-bus-simple"></i></div>
        <div class="tour-transition-label" id="tour-transition-label">Loading next module...</div>
      </div>

      <!-- Completion Screen -->
      <div id="tour-complete" class="tour-complete-screen hidden">
        <div class="tour-complete-card">
          <div class="confetti-burst" id="confetti-burst-complete"></div>
          <div class="tour-complete-icon">🎉</div>
          <h2 class="tour-complete-title">You're all set!</h2>
          <p class="tour-complete-desc">
            You've seen everything Transit.IN has to offer. <strong style="color:#C4B5FD;">Real-time tracking, smart booking, safety tools, voice AI</strong> — it's all yours. Start exploring!
          </p>
          <button class="tour-go-btn" onclick="window.TransitTour.finish()">
            <i class="fa-solid fa-rocket"></i> Start Exploring
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(root);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CONFETTI ANIMATION
  // ──────────────────────────────────────────────────────────────────────────
  function launchConfetti(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const colors = ['#8B5CF6', '#38BDF8', '#C4B5FD', '#10b981', '#f59e0b', '#ef4444'];
    for (let i = 0; i < 55; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.cssText = `
        left: ${Math.random() * 100}%;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        width: ${6 + Math.random() * 8}px;
        height: ${6 + Math.random() * 8}px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        animation-duration: ${1.5 + Math.random() * 2}s;
        animation-delay: ${Math.random() * 0.8}s;
        opacity: ${0.6 + Math.random() * 0.4};
      `;
      container.appendChild(piece);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SPOTLIGHT POSITIONING
  // ──────────────────────────────────────────────────────────────────────────
  function positionSpotlight(el, padding) {
    const spotlight = document.getElementById('tour-spotlight');
    if (!spotlight) return;
    const rect = el.getBoundingClientRect();
    const p = padding || 12;
    spotlight.style.top    = (rect.top    - p) + 'px';
    spotlight.style.left   = (rect.left   - p) + 'px';
    spotlight.style.width  = (rect.width  + p * 2) + 'px';
    spotlight.style.height = (rect.height + p * 2) + 'px';
    spotlight.style.display = 'block';
  }

  function hideSpotlight() {
    const s = document.getElementById('tour-spotlight');
    if (s) s.style.display = 'none';
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TOOLTIP POSITIONING
  // ──────────────────────────────────────────────────────────────────────────
  function positionTooltip(targetEl, position) {
    const tooltip = document.getElementById('tour-tooltip');
    if (!tooltip) return;

    tooltip.style.display = 'block';
    tooltip.style.opacity = '0';
    tooltip.removeAttribute('data-arrow');

    // Give browser time to paint, then measure & place
    requestAnimationFrame(() => {
      const rect   = targetEl.getBoundingClientRect();
      const tw     = tooltip.offsetWidth;
      const th     = tooltip.offsetHeight;
      const margin = 20;
      const ww     = window.innerWidth;
      const wh     = window.innerHeight;
      let top, left;

      if (position === 'bottom') {
        top  = rect.bottom + margin;
        left = rect.left + rect.width / 2 - tw / 2;
        tooltip.setAttribute('data-arrow', 'top');
      } else if (position === 'top') {
        top  = rect.top - th - margin;
        left = rect.left + rect.width / 2 - tw / 2;
        tooltip.setAttribute('data-arrow', 'bottom');
      } else if (position === 'left') {
        top  = rect.top + rect.height / 2 - th / 2;
        left = rect.left - tw - margin;
        tooltip.setAttribute('data-arrow', 'right');
      } else if (position === 'right') {
        top  = rect.top + rect.height / 2 - th / 2;
        left = rect.right + margin;
        tooltip.setAttribute('data-arrow', 'left');
      } else {
        // center
        top  = wh / 2 - th / 2;
        left = ww / 2 - tw / 2;
      }

      // Clamp to viewport
      left = Math.max(12, Math.min(left, ww - tw - 12));
      top  = Math.max(80, Math.min(top,  wh - th - 20));

      tooltip.style.top  = top  + 'px';
      tooltip.style.left = left + 'px';
      tooltip.style.opacity = '1';
    });
  }

  function hideTooltip() {
    const t = document.getElementById('tour-tooltip');
    if (t) t.style.display = 'none';
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PROGRESS DOTS
  // ──────────────────────────────────────────────────────────────────────────
  function renderProgressDots(globalStep) {
    const container = document.getElementById('tour-progress');
    if (!container) return;
    const total = totalSteps();
    const dots = [];
    for (let i = 0; i < total; i++) {
      const state = i < globalStep ? 'done' : (i === globalStep ? 'active' : '');
      dots.push(`<div class="tour-dot ${state}" onclick="window.TransitTour.goToStep(${i})" title="Step ${i + 1}"></div>`);
    }
    container.innerHTML = dots.join('');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SHOW STEP
  // ──────────────────────────────────────────────────────────────────────────
  function showStep(globalStep) {
    const step = TOUR_STEPS[globalStep];
    if (!step) return;

    // Resolve selector (try multiple fallbacks)
    const selectors = step.selector.split(', ');
    let targetEl = null;
    for (const sel of selectors) {
      targetEl = document.querySelector(sel.trim());
      if (targetEl) break;
    }

    if (!targetEl) {
      // Fallback to body/main
      targetEl = document.querySelector('main') || document.body;
    }

    // Scroll target into view
    if (targetEl && targetEl.getBoundingClientRect().top > window.innerHeight) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Spotlight
    if (targetEl !== document.body) {
      positionSpotlight(targetEl, step.padding || 12);
    } else {
      hideSpotlight();
    }

    // Tooltip content
    document.getElementById('tour-step-num').textContent  = globalStep + 1;
    document.getElementById('tour-module-name').textContent = step.module;
    document.getElementById('tour-title').textContent      = step.title;
    document.getElementById('tour-desc').innerHTML         = step.desc;

    // Show/hide back button
    const prevBtn = document.getElementById('tour-prev-btn');
    if (prevBtn) prevBtn.style.display = globalStep > 0 ? 'flex' : 'none';

    // Next vs Finish label
    const nextBtn = document.getElementById('tour-next-btn');
    if (nextBtn) {
      if (globalStep === TOUR_STEPS.length - 1) {
        nextBtn.innerHTML = 'Finish Tour <i class="fa-solid fa-flag-checkered"></i>';
      } else {
        nextBtn.innerHTML = 'Next <i class="fa-solid fa-arrow-right"></i>';
      }
    }

    // Progress dots
    renderProgressDots(globalStep);

    // Position tooltip relative to target
    positionTooltip(targetEl, step.position || 'bottom');

    setGlobalStep(globalStep);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // NAVIGATE TO PAGE
  // ──────────────────────────────────────────────────────────────────────────
  function navigateToPage(targetPage, globalStep, label) {
    const transition = document.getElementById('tour-transition');
    const labelEl    = document.getElementById('tour-transition-label');

    if (labelEl) labelEl.textContent = `Loading ${label || targetPage}…`;
    if (transition) transition.classList.add('visible');

    setGlobalStep(globalStep);

    setTimeout(() => {
      window.location.href = targetPage;
    }, 600);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ──────────────────────────────────────────────────────────────────────────
  window.TransitTour = {

    /** Called once when the user clicks "Start Tour" on welcome screen */
    startTour() {
      const welcome = document.getElementById('tour-welcome');
      if (welcome) {
        welcome.style.opacity = '0';
        setTimeout(() => { welcome.style.display = 'none'; }, 500);
      }

      markTourActive();
      setGlobalStep(0);

      // If we're already on dashboard, show step
      const page = currentPage();
      const firstStep = TOUR_STEPS[0];
      if (page === firstStep.page || page === '' || page === '/') {
        setTimeout(() => showStep(0), 300);
      } else {
        navigateToPage(firstStep.page, 0, firstStep.module);
      }
    },

    /** Move to the next step (may navigate to new page) */
    next() {
      const current = getGlobalStep();
      const nextIdx = current + 1;

      if (nextIdx >= TOUR_STEPS.length) {
        this.showCompletion();
        return;
      }

      const nextStep    = TOUR_STEPS[nextIdx];
      const currentStep = TOUR_STEPS[current];

      if (nextStep.page !== currentStep.page) {
        // Navigate to next page
        hideTooltip();
        hideSpotlight();
        navigateToPage(nextStep.page, nextIdx, nextStep.module);
      } else {
        showStep(nextIdx);
      }
    },

    /** Move back to the previous step */
    prev() {
      const current = getGlobalStep();
      if (current <= 0) return;

      const prevIdx  = current - 1;
      const prevStep = TOUR_STEPS[prevIdx];
      const currStep = TOUR_STEPS[current];

      if (prevStep.page !== currStep.page) {
        hideTooltip();
        hideSpotlight();
        navigateToPage(prevStep.page, prevIdx, prevStep.module);
      } else {
        showStep(prevIdx);
      }
    },

    /** Jump directly to a global step index */
    goToStep(idx) {
      if (idx < 0 || idx >= TOUR_STEPS.length) return;
      const step    = TOUR_STEPS[idx];
      const current = TOUR_STEPS[getGlobalStep()];
      if (step.page !== current.page) {
        navigateToPage(step.page, idx, step.module);
      } else {
        showStep(idx);
      }
    },

    /** Skip/cancel the tour */
    skip() {
      cancelTour();
      hideTooltip();
      hideSpotlight();

      const welcome  = document.getElementById('tour-welcome');
      const complete = document.getElementById('tour-complete');
      const overlay  = document.getElementById('transit-tour-root');

      if (welcome)  { welcome.style.display  = 'none'; }
      if (complete) { complete.style.display = 'none'; }
      if (overlay)  { overlay.style.display  = 'none'; }
    },

    /** Show the completion / celebration screen */
    showCompletion() {
      hideTooltip();
      hideSpotlight();
      completeTour();

      const complete = document.getElementById('tour-complete');
      if (complete) {
        complete.classList.remove('hidden');
        launchConfetti('confetti-burst-complete');
      }
    },

    /** Dismiss completion and go to dashboard */
    finish() {
      const overlay = document.getElementById('transit-tour-root');
      if (overlay) overlay.style.display = 'none';
      window.location.href = 'index.html';
    },

    /** Manually trigger the tour (e.g., from Profile "Retake Tour" button) */
    retake() {
      localStorage.setItem(STORAGE_KEY_NEW_USER, 'true');
      sessionStorage.removeItem(STORAGE_KEY_DONE);
      window.location.href = 'index.html';
    },
  };

  // ──────────────────────────────────────────────────────────────────────────
  // BOOT — decide whether to show tour
  // ──────────────────────────────────────────────────────────────────────────
  function boot() {
    const page        = currentPage();
    const newUser     = isNewUser();
    const tourActive  = isTourActive();

    if (!newUser && !tourActive) return; // Nothing to do

    buildTourDOM();

    // Populate user's first name in welcome screen
    const userName = localStorage.getItem('spt-profile-name') || '';
    const firstName = userName.split(' ')[0] || 'there';
    const nameEl = document.getElementById('tour-user-name');
    if (nameEl) nameEl.textContent = firstName;

    if (newUser && !tourActive && page === 'index.html') {
      // Show welcome screen after cinematic intro (if present) fades out
      const delay = sessionStorage.getItem('spt-intro-shown') ? 400 : 1200;
      setTimeout(() => {
        const welcome = document.getElementById('tour-welcome');
        if (welcome) {
          launchConfetti('confetti-burst');
          welcome.style.display = 'flex';
        }
      }, delay);
    } else if (tourActive) {
      // Resuming mid-tour on a new page: wait for DOM, then show the step
      const globalStep = getGlobalStep();
      const step       = TOUR_STEPS[globalStep];

      if (step && step.page === page) {
        // Fade out transition overlay first
        const transition = document.getElementById('tour-transition');
        setTimeout(() => {
          if (transition) transition.classList.remove('visible');
          // Wait a tick for DOM to fully render before measuring positions
          setTimeout(() => showStep(globalStep), 350);
        }, 250);
      } else if (step) {
        // Wrong page — navigate correctly
        navigateToPage(step.page, globalStep, step.module);
      }
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Re-position spotlight on scroll/resize
  // ──────────────────────────────────────────────────────────────────────────
  function onScrollResize() {
    if (!isTourActive()) return;
    const globalStep = getGlobalStep();
    const step       = TOUR_STEPS[globalStep];
    if (!step || step.page !== currentPage()) return;

    const selectors = step.selector.split(', ');
    let el = null;
    for (const sel of selectors) {
      el = document.querySelector(sel.trim());
      if (el) break;
    }
    if (el && el !== document.body) {
      positionSpotlight(el, step.padding || 12);
      positionTooltip(el, step.position || 'bottom');
    }
  }

  window.addEventListener('scroll', onScrollResize, { passive: true });
  window.addEventListener('resize', onScrollResize);

  // Boot after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    setTimeout(boot, 100);
  }
})();
