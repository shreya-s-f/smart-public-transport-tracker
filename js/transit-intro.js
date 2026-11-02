/**
 * TRANSIT.IN — Cinematic Animated Intro Controller
 * Specs:
 * - Runs once per browser session via sessionStorage ('transit_intro_seen')
 * - Supports instant skip via "Skip Intro" button or keyboard Esc
 * - Reduced motion friendly
 * - Exposes window.replayTransitIntro() for interactive preview
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'transit_intro_seen';
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Check if intro has already run this session
  if (sessionStorage.getItem(STORAGE_KEY)) {
    return;
  }

  function createIntroDOM() {
    const screen = document.createElement('div');
    screen.id = 'transit-intro-screen';
    screen.setAttribute('role', 'dialog');
    screen.setAttribute('aria-label', 'Transit.IN Cinematic Introduction');

    screen.innerHTML = `
      <!-- Ambient Gradient Waves -->
      <div class="intro-ambient-waves"></div>
      
      <!-- Subtle Futuristic City Skyline -->
      <div class="intro-skyline"></div>

      <!-- Skip Button -->
      <button class="intro-skip-btn" id="introSkipBtn" title="Skip Intro (Esc)">
        <span>Skip</span>
        <i class="fa-solid fa-forward-step" style="font-size: 0.75rem;"></i>
      </button>

      <!-- Center Stage -->
      <div class="intro-stage">
        <!-- Transportation Beacon -->
        <div class="intro-beacon-wrapper">
          <div class="intro-beacon-ring"></div>
          <div class="intro-beacon-ring"></div>
          <div class="intro-beacon-core">
            <i class="fa-solid fa-bus-simple"></i>
          </div>
        </div>

        <!-- TRANSIT.IN Logo with Letter-by-Letter Animation -->
        <div class="intro-logo" id="introLogo">
          <span class="intro-char" style="animation-delay: 0.1s">T</span>
          <span class="intro-char" style="animation-delay: 0.16s">R</span>
          <span class="intro-char" style="animation-delay: 0.22s">A</span>
          <span class="intro-char" style="animation-delay: 0.28s">N</span>
          <span class="intro-char" style="animation-delay: 0.34s">S</span>
          <span class="intro-char" style="animation-delay: 0.40s">I</span>
          <span class="intro-char" style="animation-delay: 0.46s">T</span>
          <span class="intro-dot intro-char" style="animation-delay: 0.52s">.</span>
          <span class="intro-char" style="animation-delay: 0.58s">I</span>
          <span class="intro-char" style="animation-delay: 0.64s">N</span>
          <div class="intro-light-sweep"></div>
        </div>

        <!-- Tagline -->
        <div class="intro-tagline">
          Smarter Journeys. Connected Cities.
        </div>

        <!-- Animated Route Line -->
        <div class="intro-route-line-wrap">
          <svg class="intro-route-svg" viewBox="0 0 260 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="introRouteGrad" x1="0" y1="0" x2="260" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#8B5CF6"/>
                <stop offset="50%" stop-color="#38BDF8"/>
                <stop offset="100%" stop-color="#C4B5FD"/>
              </linearGradient>
            </defs>
            <path class="intro-route-track" d="M10 14 H250"/>
            <path class="intro-route-animated" d="M10 14 H250"/>
            <circle class="intro-stop-node" cx="15" cy="14" r="4.5"/>
            <circle class="intro-stop-node" cx="95" cy="14" r="3.5"/>
            <circle class="intro-stop-node" cx="175" cy="14" r="3.5"/>
            <circle class="intro-stop-node" cx="245" cy="14" r="5" fill="#C4B5FD"/>
          </svg>
        </div>

        <!-- Loading Progress Bar -->
        <div class="intro-progress-container">
          <div class="intro-progress-track">
            <div class="intro-progress-bar" id="introProgressBar"></div>
          </div>
          <div class="intro-progress-status">
            <span class="intro-progress-text" id="introProgressText">INITIALIZING TELEMETRY...</span>
            <span id="introPercent">0%</span>
          </div>
        </div>
      </div>
    `;

    document.body.prepend(screen);
    return screen;
  }

  function startIntroSequence() {
    const screen = createIntroDOM();
    const skipBtn = document.getElementById('introSkipBtn');
    const progressBar = document.getElementById('introProgressBar');
    const percentEl = document.getElementById('introPercent');
    const statusText = document.getElementById('introProgressText');

    let progress = 0;
    let finished = false;

    const exitIntro = () => {
      if (finished) return;
      finished = true;
      sessionStorage.setItem(STORAGE_KEY, 'true');
      screen.classList.add('intro-exit');
      setTimeout(() => {
        if (screen && screen.parentNode) {
          screen.parentNode.removeChild(screen);
        }
      }, 850);
    };

    if (skipBtn) {
      skipBtn.addEventListener('click', exitIntro);
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') exitIntro();
    });

    if (REDUCED_MOTION) {
      setTimeout(exitIntro, 600);
      return;
    }

    const statuses = [
      { at: 20, text: 'SYNCING GPS SATELLITES...' },
      { at: 50, text: 'LOADING NEURAL FLEET RADAR...' },
      { at: 80, text: 'CONNECTING METRO SMART MATRIX...' },
      { at: 98, text: 'READY FOR COMMUTE' }
    ];

    const timer = setInterval(() => {
      progress += Math.floor(Math.random() * 4) + 2;
      if (progress > 100) progress = 100;

      if (progressBar) progressBar.style.width = progress + '%';
      if (percentEl) percentEl.textContent = progress + '%';

      const matched = statuses.find(s => progress >= s.at && progress < s.at + 25);
      if (matched && statusText) {
        statusText.textContent = matched.text;
      }

      if (progress >= 100) {
        clearInterval(timer);
        setTimeout(exitIntro, 500);
      }
    }, 45);
  }

  // Allow manual replay from UI / console
  window.replayTransitIntro = function () {
    sessionStorage.removeItem(STORAGE_KEY);
    startIntroSequence();
  };

  // Run on initial page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startIntroSequence);
  } else {
    startIntroSequence();
  }
})();
