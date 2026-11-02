/**
 * TRANSIT.IN — Multilingual Voice Assistant (TransitVoice)
 * Powered by Web Speech Recognition & Speech Synthesis APIs
 * Languages supported: English (en-IN), Hindi (hi-IN), Kannada (kn-IN), Marathi (mr-IN), Tamil (ta-IN)
 */

(function () {
  'use strict';

  let recognition = null;
  let isListening = false;
  let currentLang = 'en-IN';

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function initVoiceDOM() {
    // 1. Floating Action Button
    const fab = document.createElement('button');
    fab.className = 'transit-voice-fab';
    fab.id = 'transitVoiceFab';
    fab.setAttribute('aria-label', 'Open Multilingual Voice Assistant');
    fab.setAttribute('title', 'Voice Transit Assistant');
    fab.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    document.body.appendChild(fab);

    // 2. Modal Overlay
    const modal = document.createElement('div');
    modal.className = 'voice-modal-backdrop';
    modal.id = 'voiceAssistantModal';
    modal.innerHTML = `
      <div class="voice-assistant-card" role="dialog" aria-modal="true">
        <button type="button" id="closeVoiceModalBtn" style="position: absolute; top: 1.2rem; right: 1.2rem; background: transparent; border: none; font-size: 1.3rem; color: #94A3B8; cursor: pointer;">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <span class="pill-badge pill-badge-purple" style="margin-bottom: 0.8rem;">
          <i class="fa-solid fa-satellite-dish"></i> TRANSITVOICE AI
        </span>

        <h3 style="margin: 0 0 0.4rem 0; font-size: 1.35rem; color: #FFFFFF; font-family: 'Sora', sans-serif;">
          Multilingual Transit Assistant
        </h3>
        <p style="color: #94A3B8; font-size: 0.85rem; margin: 0 0 1rem 0;">
          Speak in your preferred language to check live bus ETAs, search routes, or trigger alerts.
        </p>

        <!-- Language Selector -->
        <div class="voice-lang-bar">
          <button class="voice-lang-chip active" data-lang="en-IN">English (India)</button>
          <button class="voice-lang-chip" data-lang="hi-IN">हिन्दी (Hindi)</button>
          <button class="voice-lang-chip" data-lang="kn-IN">ಕನ್ನಡ (Kannada)</button>
          <button class="voice-lang-chip" data-lang="mr-IN">मराठी (Marathi)</button>
          <button class="voice-lang-chip" data-lang="ta-IN">தமிழ் (Tamil)</button>
        </div>

        <!-- Sound Wave Visualizer -->
        <div class="voice-visualizer" id="voiceVisualizer">
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
        </div>

        <!-- Transcript & Response Box -->
        <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 14px; padding: 1.1rem; text-align: left; min-height: 80px; margin-bottom: 1rem;">
          <div style="font-size: 0.75rem; color: #38BDF8; font-family: monospace; margin-bottom: 0.3rem;">HEARD INPUT:</div>
          <div id="voiceTranscriptText" style="color: #FFFFFF; font-size: 0.95rem; font-weight: 500; margin-bottom: 0.6rem;">
            "Tap microphone and speak your destination..."
          </div>
          <div style="font-size: 0.75rem; color: #C4B5FD; font-family: monospace; margin-bottom: 0.3rem;">ASSISTANT RESPONSE:</div>
          <div id="voiceResponseText" style="color: #34D399; font-size: 0.9rem; font-weight: 600;">
            Ready to assist. Say "Where is bus 500A" or "Open live tracking".
          </div>
        </div>

        <!-- Mic Control Button -->
        <button type="button" class="btn-primary-gradient" id="toggleVoiceRecordBtn" style="padding: 0.75rem 2rem; font-size: 1rem; width: 100%;">
          <i class="fa-solid fa-microphone"></i> <span id="recordBtnLabel">Start Listening</span>
        </button>

        <!-- Suggested Prompt Chips -->
        <div class="voice-prompts-row">
          <button class="voice-prompt-chip" onclick="window.runSimulatedVoiceQuery('Where is bus 500A?')">"Where is bus 500A?"</button>
          <button class="voice-prompt-chip" onclick="window.runSimulatedVoiceQuery('Open live tracking map')">"Open live tracking"</button>
          <button class="voice-prompt-chip" onclick="window.runSimulatedVoiceQuery('Book digital QR pass')">"Book digital pass"</button>
          <button class="voice-prompt-chip" onclick="window.runSimulatedVoiceQuery('Activate emergency SOS safety')">"Safety SOS"</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    setupVoiceEvents(fab, modal);
  }

  function setupVoiceEvents(fab, modal) {
    const closeBtn = document.getElementById('closeVoiceModalBtn');
    const recordBtn = document.getElementById('toggleVoiceRecordBtn');
    const recordLabel = document.getElementById('recordBtnLabel');
    const visualizer = document.getElementById('voiceVisualizer');
    const transcriptEl = document.getElementById('voiceTranscriptText');
    const responseEl = document.getElementById('voiceResponseText');

    fab.addEventListener('click', () => {
      modal.classList.add('active');
      startRecognition();
    });

    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      stopRecognition();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        stopRecognition();
      }
    });

    recordBtn.addEventListener('click', () => {
      if (isListening) {
        stopRecognition();
      } else {
        startRecognition();
      }
    });

    // Language Chips
    document.querySelectorAll('.voice-lang-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.voice-lang-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentLang = chip.dataset.lang;
        if (isListening) {
          stopRecognition();
          startRecognition();
        }
      });
    });

    function startRecognition() {
      if (!SpeechRecognition) {
        transcriptEl.textContent = 'Voice recognition is not supported in this browser. Please use the quick prompt buttons below.';
        return;
      }

      try {
        recognition = new SpeechRecognition();
        recognition.lang = currentLang;
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
          isListening = true;
          fab.classList.add('listening');
          visualizer.classList.add('active');
          recordLabel.textContent = 'Listening... Speak now';
          transcriptEl.textContent = 'Listening to your voice in ' + currentLang + '...';
        };

        recognition.onresult = (event) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          transcriptEl.textContent = `"${transcript}"`;

          if (event.results[current].isFinal) {
            processVoiceQuery(transcript);
          }
        };

        recognition.onerror = (event) => {
          console.warn('Speech error:', event.error);
          stopRecognition();
        };

        recognition.onend = () => {
          stopRecognition();
        };

        recognition.start();
      } catch (err) {
        console.warn('Failed to start speech recognition:', err);
        stopRecognition();
      }
    }

    function stopRecognition() {
      isListening = false;
      fab.classList.remove('listening');
      visualizer.classList.remove('active');
      recordLabel.textContent = 'Start Listening';
      if (recognition) {
        try { recognition.stop(); } catch (e) {}
      }
    }
  }

  function processVoiceQuery(query) {
    const q = query.toLowerCase();
    const transcriptEl = document.getElementById('voiceTranscriptText');
    const responseEl = document.getElementById('voiceResponseText');

    let reply = '';
    let action = null;

    if (q.includes('500a') || q.includes('500') || q.includes('bus')) {
      reply = 'Route 500A is currently near Silk Board Junction. Predicted arrival is in 4 minutes with 99% confidence.';
    } else if (q.includes('track') || q.includes('map') || q.includes('live')) {
      reply = 'Opening live GPS tracking radar with OSRM telemetry.';
      action = () => window.location.href = 'tracking.html';
    } else if (q.includes('safety') || q.includes('sos') || q.includes('emergency')) {
      reply = 'Opening Transit.IN 24/7 Safety Shield and Emergency Helplines.';
      action = () => window.location.href = 'safety.html';
    } else if (q.includes('ticket') || q.includes('pass') || q.includes('book')) {
      reply = 'Directing to digital contactless QR pass and ticketing portal.';
      action = () => window.location.href = 'booking.html';
    } else if (q.includes('profile') || q.includes('wallet') || q.includes('account')) {
      reply = 'Opening commuter profile and transit wallet.';
      action = () => window.location.href = 'profile.html';
    } else if (q.includes('route') || q.includes('find') || q.includes('stop')) {
      reply = 'Searching Transit route network for your destination.';
      action = () => window.location.href = 'routes.html';
    } else {
      reply = `Recognized query "${query}". All 7 metro transit grids are running on-time with zero critical alerts.`;
    }

    if (responseEl) responseEl.textContent = reply;

    // Speak reply via SpeechSynthesis
    speakText(reply);

    if (action) {
      setTimeout(action, 2200);
    }
  }

  function speakText(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = currentLang;
      window.speechSynthesis.speak(utterance);
    }
  }

  window.runSimulatedVoiceQuery = function (query) {
    const transcriptEl = document.getElementById('voiceTranscriptText');
    if (transcriptEl) transcriptEl.textContent = `"${query}"`;
    processVoiceQuery(query);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVoiceDOM);
  } else {
    initVoiceDOM();
  }
})();
