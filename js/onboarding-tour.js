/**
 * TRANSIT.IN — Premium First-Time User Onboarding Tour System (v2 Comprehensive)
 * ==============================================================================
 * - Full tour covering ALL 10 modules & 40 distinct features across the platform
 * - Cinematic welcome overlay on first-time signup (spt-is-new-user flag)
 * - Spotlight with animated breathing purple/blue glow
 * - Responsive tooltip on desktop/tablet & native bottom-sheet on mobile (<=520px)
 * - Multi-page navigation persistence via sessionStorage
 * - Keyboard navigation (Left/Right arrows, Escape, Enter)
 * - Celebratory completion modal with confetti cannon
 * - Retake Tour trigger available anytime from Commuter Profile or console
 */

(function () {
  'use strict';

  // ──────────────────────────────────────────────────────────────────────────
  // COMPLETE TOUR STEPS — All 10 Modules & 40 Specific Platform Features
  // ──────────────────────────────────────────────────────────────────────────
  const TOUR_STEPS = [
    // ══════════════════════════════════════════════════════════════════════════
    // MODULE 1: DASHBOARD (index.html)
    // ══════════════════════════════════════════════════════════════════════════
    {
      page: 'index.html',
      selector: '.navbar',
      title: 'Unified Navigation Command Bar',
      desc: 'Your <strong>top-middle floating navigation bar</strong> links all 10 transit modules seamlessly. Switch between Dashboard, Routes, Live Tracking, Booking, Safety, and AI Voice with one tap.',
      module: 'Global Nav',
      icon: 'fa-compass',
      position: 'bottom',
      padding: 10,
      pills: ['Unified Bar', 'All 10 Modules', 'Zero Clutter']
    },
    {
      page: 'index.html',
      selector: '.hero-saas-section',
      title: 'Smart City Transit Hub',
      desc: 'Welcome to your <strong>central intelligence portal</strong>. Here you get live fleet overviews, route predictions, active alerts, and immediate access to citywide mobility services.',
      module: 'Dashboard',
      icon: 'fa-gauge-high',
      position: 'bottom',
      padding: 16,
      pills: ['Real-Time Hub', 'AI Powered', 'SaaS Grade']
    },
    {
      page: 'index.html',
      selector: '.hero-cta-group',
      title: 'Instant Action Triggers',
      desc: 'Jump straight into action: Launch <strong>Explore Live Tracking</strong> for interactive GPS maps or click <strong>Get Started</strong> to instantly book a ride or schedule a trip.',
      module: 'Dashboard',
      icon: 'fa-bolt',
      position: 'top',
      padding: 12,
      pills: ['Live Radar', 'One-Click Ride', 'Fast Access']
    },
    {
      page: 'index.html',
      selector: '.hero-metrics-bar',
      title: 'Real-Time City Fleet Metrics',
      desc: 'Live telemetry stream showing <strong>1,840+ Active Buses</strong>, <strong>99.4% Arrival Accuracy</strong>, <strong>7 Transit Hubs</strong>, and over <strong>120,000 daily commuters</strong> connected.',
      module: 'Dashboard',
      icon: 'fa-chart-line',
      position: 'top',
      padding: 12,
      pills: ['1,840+ Fleet', '99.4% On-Time', '120k Commuters']
    },
    {
      page: 'index.html',
      selector: '#heroInteractiveRadar, .hero-radar-card',
      title: 'Interactive Fleet Radar',
      desc: 'Watch active transit vehicles sweep across your city radius in real-time. Hover or tap to inspect vehicle telemetry, bus IDs, and instantaneous passenger occupancy.',
      module: 'Dashboard',
      icon: 'fa-satellite-dish',
      position: 'top',
      padding: 14,
      pills: ['Sweeping Radar', 'Live Telemetry', 'Vehicle Proximity']
    },
    {
      page: 'index.html',
      selector: '.transit-ticker',
      title: 'Live Network Status Ticker',
      desc: 'Continuous real-time ticker broadcasting live route delays, weather advisories, platform changes, and maintenance alerts across all metropolitan lines.',
      module: 'Dashboard',
      icon: 'fa-bullhorn',
      position: 'bottom',
      padding: 8,
      pills: ['Live Newsfeed', 'Delay Alerts', '24/7 Updates']
    },
    {
      page: 'index.html',
      selector: '#main-hero-carousel, .glass-carousel-wrapper',
      title: 'Feature Showcase Carousel',
      desc: 'Explore the 4 core pillars of TRANSIT.IN: <strong>GPS Fleet Tracking</strong>, <strong>Smart Journey Planning</strong>, <strong>Safety Shield SOS</strong>, and <strong>QR Bus Passes</strong>.',
      module: 'Dashboard',
      icon: 'fa-layer-group',
      position: 'bottom',
      padding: 14,
      pills: ['4 Pillars', 'Interactive Slides', 'Feature Deep-Dive']
    },
    {
      page: 'index.html',
      selector: '#journey-planner-container, .journey-planner-card',
      title: 'Smart Intermodal Journey Planner',
      desc: 'Plan point-to-point journeys across city lines. Enter your origin and destination to receive optimized multi-modal routes, exact walking times, and lowest fares.',
      module: 'Dashboard',
      icon: 'fa-map-signs',
      position: 'center',
      padding: 16,
      pills: ['Optimal Route', 'Multi-Modal', 'Fare Calculation']
    },
    {
      page: 'index.html',
      selector: '.dashboard-grid',
      title: 'Transit Analytics & Health',
      desc: 'Comprehensive performance metrics tracking on-time reliability, active lines, total passenger volume, and estimated metric tons of CO2 offset through public transit.',
      module: 'Dashboard',
      icon: 'fa-leaf',
      position: 'top',
      padding: 16,
      pills: ['Eco Impact', 'On-Time Rates', 'Fleet Volume']
    },
    {
      page: 'index.html',
      selector: '.departure-board-table, #departure-board-tbody',
      title: 'Live Departure Board',
      desc: 'Digital station board showing upcoming arrivals with live countdown timers, platform numbers, destination badges, and real-time crowd status.',
      module: 'Dashboard',
      icon: 'fa-clock',
      position: 'center',
      padding: 16,
      pills: ['Live Countdown', 'Platform Numbers', 'Crowd Levels']
    },
    {
      page: 'index.html',
      selector: '#ridershipChart, .charts-container',
      title: 'Ridership & Fleet Analytics',
      desc: 'Dynamic interactive charts visualizing weekly ridership trends, peak transit hours, route congestion index, and predictive AI demand modeling.',
      module: 'Dashboard',
      icon: 'fa-chart-area',
      position: 'center',
      padding: 16,
      pills: ['Peak Hours', 'Weekly Trends', 'Demand Prediction']
    },
    {
      page: 'index.html',
      selector: '#features-bento, .bento-grid',
      title: 'Bento Grid Capabilities',
      desc: 'Modular showcase detailing our 5 technological pillars: <strong>Sub-second GPS</strong>, <strong>AI Arrival Engine</strong>, <strong>Encrypted QR Passes</strong>, <strong>Safety Beacon</strong>, and <strong>Eco Drive</strong>.',
      module: 'Dashboard',
      icon: 'fa-cubes',
      position: 'top',
      padding: 16,
      pills: ['Modular Tech', 'High Availability', 'Sub-second Sync']
    },
    {
      page: 'index.html',
      selector: '#how-it-works, .steps-process-grid',
      title: 'How TRANSIT.IN Works',
      desc: 'A simple 4-step workflow: <strong>1. Search & Plan</strong>, <strong>2. Track in Real-Time</strong>, <strong>3. Scan Holographic QR Pass</strong>, and <strong>4. Arrive Safely</strong> at your stop.',
      module: 'Dashboard',
      icon: 'fa-route',
      position: 'top',
      padding: 16,
      pills: ['4 Simple Steps', 'Instant Commute', 'Zero Paper']
    },

    // ══════════════════════════════════════════════════════════════════════════
    // MODULE 2: ROUTES DIRECTORY (routes.html)
    // ══════════════════════════════════════════════════════════════════════════
    {
      page: 'routes.html',
      selector: '.navbar',
      title: 'Citywide Routes Directory',
      desc: 'Browse, search, and inspect the entire metropolitan bus network with detailed stop sequences, schedules, frequency charts, and fare stages.',
      module: 'Routes',
      icon: 'fa-route',
      position: 'bottom',
      padding: 10,
      pills: ['All Routes', 'Stop Sequences', 'Fare Stages']
    },
    {
      page: 'routes.html',
      selector: '#route-search, .search-box, input[type="text"], main',
      title: 'Instant Route Search & Filter',
      desc: 'Filter city routes instantly by route code (e.g., 500D, 335E), major landmarks, terminal points, or express bus services.',
      module: 'Routes',
      icon: 'fa-magnifying-glass',
      position: 'bottom',
      padding: 14,
      pills: ['Instant Search', 'Bus Numbers', 'Express Routes']
    },
    {
      page: 'routes.html',
      selector: '.route-card, .route-list, main',
      title: 'Interactive Route Cards',
      desc: 'Each card shows operating hours, average headway frequency (e.g. every 8 mins), distance, price, and a direct button to track active buses on that line.',
      module: 'Routes',
      icon: 'fa-id-card',
      position: 'center',
      padding: 16,
      pills: ['Headway Times', 'Stop Breakdown', 'Track Line']
    },

    // ══════════════════════════════════════════════════════════════════════════
    // MODULE 3: LIVE TRACKING (tracking.html)
    // ══════════════════════════════════════════════════════════════════════════
    {
      page: 'tracking.html',
      selector: '.navbar',
      title: 'Live Telemetry Command',
      desc: 'You are now inside the <strong>Live GPS Fleet Tracking</strong> module. Every vehicle on this map updates position continuously with sub-second accuracy.',
      module: 'Live Tracking',
      icon: 'fa-location-dot',
      position: 'bottom',
      padding: 10,
      pills: ['Live GPS', 'Sub-second Sync', 'Map View']
    },
    {
      page: 'tracking.html',
      selector: '#map, .map-container, main',
      title: 'Interactive Fleet Map',
      desc: 'Interactive map displaying moving bus icons, planned polylines, and upcoming stop markers. Click any bus icon to see its registration, speed, and ETA.',
      module: 'Live Tracking',
      icon: 'fa-map-location-dot',
      position: 'center',
      padding: 20,
      pills: ['Smooth Polylines', 'Vehicle Speed', 'Live ETA']
    },
    {
      page: 'tracking.html',
      selector: '.tracking-controls, .bus-info-card, .sidebar, main',
      title: 'Bus Telemetry & Occupancy',
      desc: 'Inspect real-time vehicle passenger occupancy (e.g., 65% Full - Seats Available), driver ID, next 3 stops, and delay offsets before boarding.',
      module: 'Live Tracking',
      icon: 'fa-users',
      position: 'center',
      padding: 16,
      pills: ['Seat Occupancy', 'Delay Offsets', 'Next 3 Stops']
    },

    // ══════════════════════════════════════════════════════════════════════════
    // MODULE 4: TIMETABLE & SCHEDULES (timetable.html)
    // ══════════════════════════════════════════════════════════════════════════
    {
      page: 'timetable.html',
      selector: '.navbar',
      title: 'Master Schedule Browser',
      desc: 'Never miss a ride. Access the complete official transit timetable across morning, peak-rush, evening, and late-night operational schedules.',
      module: 'Timetable',
      icon: 'fa-calendar-days',
      position: 'bottom',
      padding: 10,
      pills: ['Official Schedules', 'Peak Hours', 'Night Service']
    },
    {
      page: 'timetable.html',
      selector: 'main, .timetable-container, table, .schedule-card',
      title: 'Station Departure Grid',
      desc: 'Search any route or station name to inspect precise timetables with scheduled vs predicted arrival times, terminal bay allocations, and holiday schedules.',
      module: 'Timetable',
      icon: 'fa-table-list',
      position: 'center',
      padding: 18,
      pills: ['Terminal Bays', 'Weekend Service', 'Instant Search']
    },

    // ══════════════════════════════════════════════════════════════════════════
    // MODULE 5: TICKETING & DIGITAL BUS PASS (booking.html)
    // ══════════════════════════════════════════════════════════════════════════
    {
      page: 'booking.html',
      selector: '.navbar',
      title: 'Smart Paperless Ticketing',
      desc: 'Book single ride tickets, day explorer passes, or monthly student/commuter passes directly from your phone. No physical queues or cash required.',
      module: 'Booking',
      icon: 'fa-ticket',
      position: 'bottom',
      padding: 10,
      pills: ['100% Digital', 'Instant Passes', 'Wallet Ready']
    },
    {
      page: 'booking.html',
      selector: '#booking-form, .booking-form-card, main',
      title: 'Ride Selection Form',
      desc: 'Select your originating bus station, destination terminal, travel date, and preferred bus category (AC Electric, Non-AC Express, Airport Volvo).',
      module: 'Booking',
      icon: 'fa-pen-to-square',
      position: 'center',
      padding: 16,
      pills: ['Electric AC', 'Express Volvo', 'Date Picker']
    },
    {
      page: 'booking.html',
      selector: '#bus-seat-grid, .seat-selection-container, main',
      title: 'Interactive Seat Picker',
      desc: 'Choose your exact seat in advance! View window vs aisle seating, reserved ladies & senior citizen spots, and real-time available seats in green.',
      module: 'Booking',
      icon: 'fa-chair',
      position: 'center',
      padding: 18,
      pills: ['Window/Aisle', 'Priority Seats', 'Live Selection']
    },
    {
      page: 'booking.html',
      selector: '.pass-option-label, .pass-types, main',
      title: 'Pass Type Tier Selector',
      desc: 'Switch between <strong>Single Journey</strong>, <strong>Daily All-City Pass (₹70)</strong>, or <strong>Monthly Unlimited Pass</strong> for maximum savings.',
      module: 'Booking',
      icon: 'fa-tag',
      position: 'center',
      padding: 16,
      pills: ['Single Ride', 'Daily Pass', 'Monthly Pass']
    },
    {
      page: 'booking.html',
      selector: '#pay-btn, .fare-summary, .checkout-btn, main',
      title: 'Instant Fare Checkout',
      desc: 'Review base fare, transit taxes, applied promotional coupons, and tap to pay using Transit Wallet, UPI, Cards, or Net Banking.',
      module: 'Booking',
      icon: 'fa-credit-card',
      position: 'top',
      padding: 16,
      pills: ['UPI & Cards', 'Instant Receipt', 'Coupons']
    },
    {
      page: 'booking.html',
      selector: '#holographic-qr-container, .qr-container, main',
      title: 'Holographic QR Digital Pass',
      desc: 'Your ticket generates an encrypted, animated holographic QR code with anti-fraud watermark. Hold it up to the onboard validator or conductor scanner for zero-contact entry.',
      module: 'Booking',
      icon: 'fa-qrcode',
      position: 'center',
      padding: 20,
      pills: ['Encrypted QR', 'Zero-Contact Scan', 'Anti-Counterfeit']
    },

    // ══════════════════════════════════════════════════════════════════════════
    // MODULE 6: NOTIFICATIONS & ALERTS (notifications.html)
    // ══════════════════════════════════════════════════════════════════════════
    {
      page: 'notifications.html',
      selector: '.navbar',
      title: 'Smart Alerts Notification Hub',
      desc: 'Your personal notification nerve center. Stay informed on route detours, emergency broadcasts, fare promotions, and schedule revisions in real-time.',
      module: 'Alerts',
      icon: 'fa-bell',
      position: 'bottom',
      padding: 10,
      pills: ['Instant Push', 'Route Detours', 'System Alerts']
    },
    {
      page: 'notifications.html',
      selector: 'main, .notification-list, .alert-feed',
      title: 'Filtered Broadcast Feed',
      desc: 'Categorize alerts by Delays, Maintenance, Safety, and Bookings. Mark items as read, clear history, or set custom SMS/WhatsApp notifications for your regular bus lines.',
      module: 'Alerts',
      icon: 'fa-filter',
      position: 'center',
      padding: 18,
      pills: ['Category Filter', 'SMS & WhatsApp', 'Mark as Read']
    },

    // ══════════════════════════════════════════════════════════════════════════
    // MODULE 7: SAFETY SHIELD & EMERGENCY SOS (safety.html)
    // ══════════════════════════════════════════════════════════════════════════
    {
      page: 'safety.html',
      selector: '.navbar',
      title: 'Transit Safety Shield Hub',
      desc: 'Commuter safety is our highest priority. The Safety Shield provides 24/7 emergency response, silent distress beacons, and one-tap family journey sharing.',
      module: 'Safety Shield',
      icon: 'fa-shield-halved',
      position: 'bottom',
      padding: 10,
      pills: ['24/7 Security', 'Pan-India SOS', 'Live Trip Share']
    },
    {
      page: 'safety.html',
      selector: '.beacon-box, .panic-btn-container, main',
      title: 'Instant Distress Panic Beacon',
      desc: 'In case of danger, press <strong>Sound Emergency Alarm</strong> to trigger an audible high-decibel siren and broadcast simulated GPS distress coordinates to transit police.',
      module: 'Safety Shield',
      icon: 'fa-triangle-exclamation',
      position: 'center',
      padding: 18,
      pills: ['High-Decibel Siren', 'GPS Broadcast', 'Instant Dispatch']
    },
    {
      page: 'safety.html',
      selector: '.share-journey, .share-section, main',
      title: 'Live Journey Sharing',
      desc: 'Share your real-time vehicle route, current stop, and live ETA with your family or friends via WhatsApp or SMS so they can watch you travel safely in real-time.',
      module: 'Safety Shield',
      icon: 'fa-share-nodes',
      position: 'center',
      padding: 16,
      pills: ['WhatsApp Share', 'SMS Live Link', 'Family Safety']
    },
    {
      page: 'safety.html',
      selector: '.helplines-grid, .helpline-cards, main',
      title: 'Pan-India 24/7 Toll-Free Helplines',
      desc: 'Direct one-touch phone dials for emergency responders: <strong>112</strong> (National Emergency), <strong>1091</strong> (Women Helpline), <strong>1512</strong> (Railway & Transit Police), and <strong>108</strong> (Ambulance).',
      module: 'Safety Shield',
      icon: 'fa-phone-volume',
      position: 'center',
      padding: 16,
      pills: ['112 National SOS', '1091 Women', '1512 Transit Police']
    },

    // ══════════════════════════════════════════════════════════════════════════
    // MODULE 8: VOICE TRANSIT ASSISTANT (voice.html)
    // ══════════════════════════════════════════════════════════════════════════
    {
      page: 'voice.html',
      selector: '.navbar',
      title: 'Multilingual AI Voice Assistant',
      desc: 'Experience hands-free transit navigation. Speak naturally in English, Hindi, or regional languages to query buses, check arrival times, or book tickets.',
      module: 'Voice AI',
      icon: 'fa-microphone-lines',
      position: 'bottom',
      padding: 10,
      pills: ['Hands-Free', 'Multilingual', 'Speech-to-Text']
    },
    {
      page: 'voice.html',
      selector: '#voice-mic-btn, .mic-wrapper, main',
      title: 'Microphone & Live Audio Waveform',
      desc: 'Tap the glowing microphone button and speak your query. Real-time audio waveform visualizer confirms input and delivers fast neural voice responses.',
      module: 'Voice AI',
      icon: 'fa-microphone',
      position: 'center',
      padding: 18,
      pills: ['One-Tap Mic', 'Audio Waveform', 'Neural Speech']
    },
    {
      page: 'voice.html',
      selector: '.quick-prompts, .prompt-chips, main',
      title: 'Instant Voice Quick Prompts',
      desc: 'Tap suggested prompt chips like <em>"Where is Bus 500D?"</em>, <em>"Next bus to Airport?"</em>, or <em>"Book a ticket to Central Station"</em> to test AI queries with one click.',
      module: 'Voice AI',
      icon: 'fa-wand-magic-sparkles',
      position: 'center',
      padding: 16,
      pills: ['Quick Prompts', 'Instant Answers', 'Natural Dialogue']
    },

    // ══════════════════════════════════════════════════════════════════════════
    // MODULE 9: FLEET ADMIN DASHBOARD (admin.html)
    // ══════════════════════════════════════════════════════════════════════════
    {
      page: 'admin.html',
      selector: '.navbar',
      title: 'Fleet Authority Command',
      desc: 'Transit controllers and administrators manage vehicles, drivers, route detours, emergency incidents, and passenger feedback from this secure portal.',
      module: 'Admin Fleet',
      icon: 'fa-sliders',
      position: 'bottom',
      padding: 10,
      pills: ['Authority Portal', 'Fleet Control', 'Emergency Desk']
    },
    {
      page: 'admin.html',
      selector: 'main, .admin-container, .admin-grid',
      title: 'Fleet Operations & Incident Desk',
      desc: 'Real-time telemetry tables, driver duty allocations, automated maintenance health alerts, and instant complaint resolution workflows.',
      module: 'Admin Fleet',
      icon: 'fa-wrench',
      position: 'center',
      padding: 18,
      pills: ['Duty Allocations', 'Vehicle Health', 'Complaint Desk']
    },

    // ══════════════════════════════════════════════════════════════════════════
    // MODULE 10: COMMUTER PROFILE & SETTINGS (profile.html)
    // ══════════════════════════════════════════════════════════════════════════
    {
      page: 'profile.html',
      selector: '.navbar',
      title: 'Your Commuter Profile',
      desc: 'Manage your personal traveler identity, saved home and work locations, linked payment methods, and account security preferences.',
      module: 'Profile',
      icon: 'fa-user-gear',
      position: 'bottom',
      padding: 10,
      pills: ['Identity', 'Saved Locations', 'Preferences']
    },
    {
      page: 'profile.html',
      selector: '.profile-header, .user-card, main',
      title: 'Commuter Wallet & Active Passes',
      desc: 'Check your digital transit pass validity, recharge your Transit.IN cash wallet, and review full travel history with downloadable GST tax invoices.',
      module: 'Profile',
      icon: 'fa-wallet',
      position: 'center',
      padding: 16,
      pills: ['Pass Validity', 'Wallet Balance', 'GST Invoices']
    },
    {
      page: 'profile.html',
      selector: '#retake-tour-card, .retake-tour-box, main',
      title: 'Retake Guided Tour Anytime',
      desc: 'You can replay this full interactive tour at any time by clicking <strong>Take Interactive Tour</strong> on your profile page, or by pressing <strong>Shift + ?</strong>.',
      module: 'Profile',
      icon: 'fa-circle-play',
      position: 'center',
      padding: 18,
      pills: ['Always Available', 'Shift + ? Shortcut', '10 Modules']
    }
  ];

  // Storage keys
  const STORAGE_KEY_ACTIVE    = 'transit-tour-active';
  const STORAGE_KEY_STEP      = 'transit-tour-step';
  const STORAGE_KEY_NEW_USER  = 'spt-is-new-user';
  const STORAGE_KEY_DONE      = 'transit-tour-done';

  let currentStepIndex = 0;
  let overlayEl = null;
  let spotlightEl = null;
  let tooltipEl = null;

  // ──────────────────────────────────────────────────────────────────────────
  // HELPER FUNCTIONS
  // ──────────────────────────────────────────────────────────────────────────
  function getCurrentPageName() {
    const path = window.location.pathname;
    const segments = path.split('/');
    let page = segments[segments.length - 1] || 'index.html';
    if (!page.includes('.html')) page = 'index.html';
    return page;
  }

  function isMobile() {
    return window.innerWidth <= 520;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DOM ELEMENT BUILDERS
  // ──────────────────────────────────────────────────────────────────────────
  function ensureTourDOMElements() {
    if (!document.getElementById('tour-overlay')) {
      overlayEl = document.createElement('div');
      overlayEl.id = 'tour-overlay';
      overlayEl.className = 'tour-overlay hidden';
      document.body.appendChild(overlayEl);
    } else {
      overlayEl = document.getElementById('tour-overlay');
    }

    if (!document.getElementById('tour-spotlight')) {
      spotlightEl = document.createElement('div');
      spotlightEl.id = 'tour-spotlight';
      spotlightEl.className = 'tour-spotlight';
      spotlightEl.style.display = 'none';
      document.body.appendChild(spotlightEl);
    } else {
      spotlightEl = document.getElementById('tour-spotlight');
    }

    if (!document.getElementById('tour-tooltip')) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'tour-tooltip';
      tooltipEl.className = 'tour-tooltip';
      tooltipEl.style.display = 'none';
      tooltipEl.innerHTML = `
        <div class="tour-arrow" id="tour-arrow"></div>
        <div class="tour-header">
          <div class="tour-header-meta">
            <span class="tour-page-badge" id="tour-page-badge">
              <i class="fa-solid fa-compass"></i>
              <span id="tour-badge-text">Dashboard</span>
            </span>
            <span class="tour-step-counter" id="tour-step-counter">Step 1 of ${TOUR_STEPS.length}</span>
          </div>
          <button class="tour-close-btn" id="tour-close-btn" title="Skip Tour (Esc)">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="tour-progress-bar-track">
          <div class="tour-progress-bar-fill" id="tour-progress-fill" style="width: 2%;"></div>
        </div>
        <div class="tour-body">
          <h3 class="tour-title" id="tour-title"></h3>
          <p class="tour-desc" id="tour-desc"></p>
          <div class="tour-feat-pills" id="tour-feat-pills"></div>
        </div>
        <div class="tour-actions">
          <button class="tour-skip-link" id="tour-skip-link">Skip Tour</button>
          <div class="tour-btn-group">
            <button class="tour-btn-prev" id="tour-btn-prev">
              <i class="fa-solid fa-arrow-left"></i> Prev
            </button>
            <button class="tour-btn-next" id="tour-btn-next">
              Next <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(tooltipEl);

      // Event handlers
      document.getElementById('tour-close-btn').addEventListener('click', stopTour);
      document.getElementById('tour-skip-link').addEventListener('click', stopTour);
      document.getElementById('tour-btn-prev').addEventListener('click', prevStep);
      document.getElementById('tour-btn-next').addEventListener('click', nextStep);
    } else {
      tooltipEl = document.getElementById('tour-tooltip');
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SHOW WELCOME MODAL (TRIGGERED ON FIRST SIGNUP)
  // ──────────────────────────────────────────────────────────────────────────
  function showWelcomeModal() {
    if (document.getElementById('tour-welcome-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'tour-welcome-modal';
    modal.className = 'tour-welcome-overlay';
    modal.innerHTML = `
      <div class="tour-welcome-card">
        <div class="tour-welcome-icon-glow">
          <i class="fa-solid fa-bus-simple"></i>
        </div>
        <span class="tour-welcome-badge">Welcome to TRANSIT.IN</span>
        <h2 class="tour-welcome-title">Smarter Journeys. <span>Connected Cities.</span></h2>
        <p class="tour-welcome-desc">
          Your account is ready! Take a 2-minute interactive tour to explore all <strong>10 modules</strong>, 
          real-time GPS fleet tracking, AI arrival predictions, digital QR passes, and the Safety Shield.
        </p>
        <div class="tour-features-preview">
          <div class="tour-feat-card">
            <i class="fa-solid fa-map-location-dot"></i>
            <div class="tour-feat-card-text">
              <span class="tour-feat-card-title">Live GPS Radar</span>
              <span class="tour-feat-card-sub">Sub-second fleet tracking</span>
            </div>
          </div>
          <div class="tour-feat-card">
            <i class="fa-solid fa-qrcode"></i>
            <div class="tour-feat-card-text">
              <span class="tour-feat-card-title">Digital QR Passes</span>
              <span class="tour-feat-card-sub">Zero-contact paperless ticketing</span>
            </div>
          </div>
          <div class="tour-feat-card">
            <i class="fa-solid fa-shield-halved"></i>
            <div class="tour-feat-card-text">
              <span class="tour-feat-card-title">Safety Shield</span>
              <span class="tour-feat-card-sub">SOS beacon & live trip share</span>
            </div>
          </div>
          <div class="tour-feat-card">
            <i class="fa-solid fa-microphone"></i>
            <div class="tour-feat-card-text">
              <span class="tour-feat-card-title">Voice Transit AI</span>
              <span class="tour-feat-card-sub">Natural multilingual assistance</span>
            </div>
          </div>
        </div>
        <div class="tour-welcome-actions">
          <button class="tour-start-btn" id="tour-welcome-start-btn">
            <i class="fa-solid fa-play"></i> Start Interactive Tour
          </button>
          <button class="tour-skip-all-btn" id="tour-welcome-skip-btn">
            Skip & Explore on My Own
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('tour-welcome-start-btn').addEventListener('click', () => {
      modal.remove();
      startTourFromBeginning();
    });

    document.getElementById('tour-welcome-skip-btn').addEventListener('click', () => {
      modal.remove();
      localStorage.removeItem(STORAGE_KEY_NEW_USER);
      localStorage.setItem(STORAGE_KEY_DONE, 'true');
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SHOW COMPLETION MODAL (WITH CONFETTI)
  // ──────────────────────────────────────────────────────────────────────────
  function showCompletionModal() {
    stopTourCleanly();
    localStorage.removeItem(STORAGE_KEY_NEW_USER);
    localStorage.setItem(STORAGE_KEY_DONE, 'true');

    // Launch confetti shower
    launchConfetti();

    const modal = document.createElement('div');
    modal.id = 'tour-completion-modal';
    modal.className = 'tour-complete-overlay';
    modal.innerHTML = `
      <div class="tour-complete-card">
        <div class="tour-complete-badge">
          <i class="fa-solid fa-check"></i>
        </div>
        <h2 class="tour-complete-title">You're All Set to Travel Smarter!</h2>
        <p class="tour-complete-desc">
          You've explored all <strong>10 modules</strong> and core features of TRANSIT.IN.
          You're ready to track buses in real-time, purchase digital QR passes, and travel with peace of mind.
        </p>
        <div class="tour-complete-stats">
          <div class="tour-stat-item">
            <span class="tour-stat-number">10</span>
            <span class="tour-stat-label">Modules</span>
          </div>
          <div class="tour-stat-item">
            <span class="tour-stat-number">40</span>
            <span class="tour-stat-label">Features</span>
          </div>
          <div class="tour-stat-item">
            <span class="tour-stat-number">100%</span>
            <span class="tour-stat-label">Toured</span>
          </div>
        </div>
        <button class="tour-go-btn" id="tour-complete-go-btn">
          <i class="fa-solid fa-house"></i> Go to Dashboard
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('tour-complete-go-btn').addEventListener('click', () => {
      modal.remove();
      window.location.href = 'index.html';
    });
  }

  function launchConfetti() {
    const colors = ['#8B5CF6', '#38BDF8', '#C4B5FD', '#10B981', '#F59E0B', '#EF4444'];
    for (let i = 0; i < 48; i++) {
      const piece = document.createElement('div');
      piece.className = 'tour-confetti';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (2 + Math.random() * 2) + 's';
      piece.style.animationDelay = (Math.random() * 0.8) + 's';
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 4500);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SHOW TRANSITION TOAST WHEN SWITCHING PAGES
  // ──────────────────────────────────────────────────────────────────────────
  function showTransitionToast(nextModuleName) {
    const toast = document.createElement('div');
    toast.className = 'tour-transition-toast';
    toast.innerHTML = `
      <i class="fa-solid fa-bus-simple tour-transition-bus"></i>
      <span>Loading <strong>${nextModuleName}</strong> Module...</span>
    `;
    document.body.appendChild(toast);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TOUR CORE ENGINE
  // ──────────────────────────────────────────────────────────────────────────
  function startTourFromBeginning() {
    sessionStorage.setItem(STORAGE_KEY_ACTIVE, 'true');
    sessionStorage.setItem(STORAGE_KEY_STEP, '0');
    currentStepIndex = 0;

    const currentPage = getCurrentPageName();
    const firstStep = TOUR_STEPS[0];

    if (currentPage !== firstStep.page) {
      showTransitionToast(firstStep.module);
      window.location.href = firstStep.page;
    } else {
      renderStep(0);
    }
  }

  function renderStep(index) {
    if (index >= TOUR_STEPS.length) {
      showCompletionModal();
      return;
    }

    if (index < 0) index = 0;
    currentStepIndex = index;
    sessionStorage.setItem(STORAGE_KEY_STEP, index.toString());

    const step = TOUR_STEPS[index];
    const currentPage = getCurrentPageName();

    // If step belongs to another page, navigate there smoothly
    if (step.page !== currentPage) {
      showTransitionToast(step.module);
      setTimeout(() => {
        window.location.href = step.page;
      }, 350);
      return;
    }

    ensureTourDOMElements();

    // Activate overlay
    overlayEl.className = 'tour-overlay active';

    // Find target element with fallback selectors
    let targetEl = null;
    const selectors = step.selector.split(',').map(s => s.trim());
    for (const sel of selectors) {
      const found = document.querySelector(sel);
      if (found && found.offsetParent !== null) { // visible
        targetEl = found;
        break;
      }
    }

    // Ultimate fallback if selector not matched
    if (!targetEl) {
      targetEl = document.querySelector('main') || document.body;
    }

    // Scroll element into view smoothly
    if (targetEl !== document.body) {
      targetEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }

    // Small delay to allow smooth scrolling to settle
    setTimeout(() => {
      updateSpotlight(targetEl, step.padding || 12);
      updateTooltip(step, targetEl, index);
    }, 280);
  }

  function updateSpotlight(el, padding) {
    if (!spotlightEl) return;

    if (el === document.body) {
      // Center spotlight
      spotlightEl.style.display = 'none';
      return;
    }

    const rect = el.getBoundingClientRect();
    const pad = padding || 12;

    spotlightEl.style.display = 'block';
    spotlightEl.style.top = Math.max(0, rect.top - pad) + 'px';
    spotlightEl.style.left = Math.max(0, rect.left - pad) + 'px';
    spotlightEl.style.width = Math.min(window.innerWidth, rect.width + pad * 2) + 'px';
    spotlightEl.style.height = Math.min(window.innerHeight, rect.height + pad * 2) + 'px';
  }

  function updateTooltip(step, targetEl, index) {
    if (!tooltipEl) return;

    // Update text and counters
    document.getElementById('tour-badge-text').textContent = step.module;
    document.getElementById('tour-step-counter').textContent = `Step ${index + 1} of ${TOUR_STEPS.length}`;
    document.getElementById('tour-title').innerHTML = `
      <i class="fa-solid ${step.icon || 'fa-compass'}"></i> ${step.title}
    `;
    document.getElementById('tour-desc').innerHTML = step.desc;

    // Feature chips
    const pillsContainer = document.getElementById('tour-feat-pills');
    pillsContainer.innerHTML = '';
    if (step.pills && step.pills.length) {
      step.pills.forEach((pillText, i) => {
        const pill = document.createElement('span');
        pill.className = `tour-feat-pill ${i === 0 ? 'accent' : ''}`;
        pill.textContent = pillText;
        pillsContainer.appendChild(pill);
      });
    }

    // Progress bar fill percentage
    const fillPercent = Math.round(((index + 1) / TOUR_STEPS.length) * 100);
    document.getElementById('tour-progress-fill').style.width = `${fillPercent}%`;

    // Button states
    const prevBtn = document.getElementById('tour-btn-prev');
    const nextBtn = document.getElementById('tour-btn-next');
    prevBtn.disabled = (index === 0);

    const isLastStep = (index === TOUR_STEPS.length - 1);
    nextBtn.innerHTML = isLastStep
      ? `Finish <i class="fa-solid fa-flag-checkered"></i>`
      : `Next <i class="fa-solid fa-arrow-right"></i>`;

    // Positioning
    tooltipEl.style.display = 'block';

    if (isMobile()) {
      // Mobile bottom-sheet layout handled via CSS
      tooltipEl.setAttribute('data-position', 'mobile-bottom');
      return;
    }

    // Desktop/Tablet Positioning
    positionTooltip(targetEl, step.position || 'bottom');
  }

  function positionTooltip(targetEl, preferredPos) {
    const tooltipRect = tooltipEl.getBoundingClientRect();
    const arrowEl = document.getElementById('tour-arrow');

    if (targetEl === document.body || preferredPos === 'center') {
      tooltipEl.style.top = '50%';
      tooltipEl.style.left = '50%';
      tooltipEl.style.transform = 'translate(-50%, -50%)';
      tooltipEl.setAttribute('data-position', 'center');
      if (arrowEl) arrowEl.style.display = 'none';
      return;
    }

    if (arrowEl) arrowEl.style.display = 'block';
    const targetRect = targetEl.getBoundingClientRect();
    const margin = 16;
    let top = 0;
    let left = 0;
    let actualPos = preferredPos;

    if (preferredPos === 'bottom') {
      top = targetRect.bottom + margin;
      left = targetRect.left + (targetRect.width / 2) - 40;
      // If overflows bottom of viewport, flip to top
      if (top + tooltipRect.height > window.innerHeight - 20) {
        actualPos = 'top';
        top = targetRect.top - tooltipRect.height - margin;
      }
    } else if (preferredPos === 'top') {
      top = targetRect.top - tooltipRect.height - margin;
      left = targetRect.left + (targetRect.width / 2) - 40;
      // If overflows top of viewport, flip to bottom
      if (top < 20) {
        actualPos = 'bottom';
        top = targetRect.bottom + margin;
      }
    } else {
      top = targetRect.bottom + margin;
      left = targetRect.left;
    }

    // Clamp horizontally inside viewport
    const minLeft = 16;
    const maxLeft = window.innerWidth - tooltipRect.width - 16;
    left = Math.max(minLeft, Math.min(left, maxLeft));

    // Clamp vertically inside viewport
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipRect.height - 16));

    tooltipEl.style.top = `${top}px`;
    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.transform = 'none';
    tooltipEl.setAttribute('data-position', actualPos);
  }

  function nextStep() {
    renderStep(currentStepIndex + 1);
  }

  function prevStep() {
    if (currentStepIndex > 0) {
      renderStep(currentStepIndex - 1);
    }
  }

  function stopTourCleanly() {
    sessionStorage.removeItem(STORAGE_KEY_ACTIVE);
    sessionStorage.removeItem(STORAGE_KEY_STEP);
    if (overlayEl) overlayEl.className = 'tour-overlay hidden';
    if (spotlightEl) spotlightEl.style.display = 'none';
    if (tooltipEl) tooltipEl.style.display = 'none';
  }

  function stopTour() {
    stopTourCleanly();
    localStorage.removeItem(STORAGE_KEY_NEW_USER);
    localStorage.setItem(STORAGE_KEY_DONE, 'true');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // KEYBOARD NAVIGATION
  // ──────────────────────────────────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    const isTourActive = sessionStorage.getItem(STORAGE_KEY_ACTIVE) === 'true';
    if (!isTourActive) {
      // Shift + ? shortcut to launch tour from any page
      if (e.shiftKey && (e.key === '?' || e.key === '/')) {
        startTourFromBeginning();
      }
      return;
    }

    if (e.key === 'Escape') {
      stopTour();
    } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
      nextStep();
    } else if (e.key === 'ArrowLeft') {
      prevStep();
    }
  });

  // Handle window resize dynamically
  window.addEventListener('resize', () => {
    if (sessionStorage.getItem(STORAGE_KEY_ACTIVE) === 'true') {
      renderStep(currentStepIndex);
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // GLOBAL API EXPOSURE
  // ──────────────────────────────────────────────────────────────────────────
  window.startTransitTour = function () {
    startTourFromBeginning();
  };

  window.TransitTour = {
    start: startTourFromBeginning,
    retake: startTourFromBeginning,
    stop: stopTour
  };

  // ──────────────────────────────────────────────────────────────────────────
  // AUTO-INITIALIZATION ON PAGE LOAD
  // ──────────────────────────────────────────────────────────────────────────
  function init() {
    const isTourActive = sessionStorage.getItem(STORAGE_KEY_ACTIVE) === 'true';
    const isNewUser = localStorage.getItem(STORAGE_KEY_NEW_USER) === 'true';
    const tourDone = localStorage.getItem(STORAGE_KEY_DONE) === 'true';

    // 1. If tour is already in progress across pages
    if (isTourActive) {
      const savedStep = parseInt(sessionStorage.getItem(STORAGE_KEY_STEP) || '0', 10);
      setTimeout(() => renderStep(savedStep), 350);
      return;
    }

    // 2. If user just signed up for the first time
    if (isNewUser && !tourDone) {
      setTimeout(() => showWelcomeModal(), 700);
      return;
    }

    // 3. Connect Retake Tour button on profile.html if present
    const retakeBtn = document.getElementById('retake-tour-btn') ||
                      document.querySelector('[data-action="retake-tour"]');
    if (retakeBtn) {
      retakeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        startTourFromBeginning();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
