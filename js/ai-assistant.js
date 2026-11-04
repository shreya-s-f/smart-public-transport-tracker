/**
 * TRANSIT.IN — Premium Bottom-Right Conversational AI Assistant (TransitAI)
 * =========================================================================
 * - Floating glassmorphic bubble & chat interface anchored at bottom-right corner
 * - Natural Language Transit Knowledge Engine (live tracking, routes, fares, safety)
 * - Dynamic Rich HTML Response Cards with interactive transit badges
 * - Speech-to-Text & Neural Text-to-Speech integration
 * - Quick suggestion chips and deep linking to platform modules
 */

(function () {
  'use strict';

  // ──────────────────────────────────────────────────────────────────────────
  // 1. TRANSIT KNOWLEDGE BASE
  // ──────────────────────────────────────────────────────────────────────────
  const TRANSIT_KB = {
    buses: [
      { id: '500D', name: 'Route 500D (Hebbal ↔ Central Silk Board)', loc: 'Marathahalli Bridge', nextStop: 'Kadubeesanahalli', eta: '3 mins', speed: '42 km/h', occupancy: '62% (Seats Available)', type: 'AC Electric' },
      { id: '335E', name: 'Route 335E (Kempegowda BS ↔ ITPL Whitefield)', loc: 'HAL Main Gate', nextStop: 'Marathahalli Junction', eta: '5 mins', speed: '36 km/h', occupancy: '78% (Few Seats Left)', type: 'Volvo Club Class' },
      { id: 'KIAS-9', name: 'Route KIAS-9 (Kempegowda Bus Station ↔ Airport)', loc: 'Hebbal Flyover', nextStop: 'Yelahanka Bypass', eta: '8 mins', speed: '55 km/h', occupancy: '45% (Ample Seats)', type: 'Airport Vayu Vajra' },
      { id: '500A', name: 'Route 500A (Banashankari ↔ Tin Factory)', loc: 'BTM Layout 2nd Stage', nextStop: 'Silk Board Junction', eta: '2 mins', speed: '28 km/h', occupancy: '85% (Standing Only)', type: 'Express Electric' },
      { id: '201R', name: 'Route 201R (Kengeri Satellite ↔ Domlur)', loc: 'South End Circle', nextStop: 'Jayanagar 4th Block', eta: '4 mins', speed: '32 km/h', occupancy: '54% (Seats Available)', type: 'Standard Non-AC' },
      { id: 'BGK-01', name: 'Route BGK-01 (Vidyagiri ↔ Bagalkot Old Bus Stand)', loc: 'Navanagar Circle', nextStop: 'Sector 25 Bus Stop', eta: '3 mins', speed: '35 km/h', occupancy: '50% (Seats Available)', type: 'City Commuter' }
    ],
    fares: {
      single: '₹15 to ₹45 depending on distance/stages (Electric AC starts at ₹25)',
      dailyPass: '₹70 (Unlimited rides across all standard & express city buses for 24 hours)',
      monthlyPass: '₹1,050 for General Commuters, ₹350 for Students with valid institutional ID'
    },
    helplines: [
      { name: 'National Emergency', num: '112', desc: 'Central Police, Fire & Emergency Response' },
      { name: 'Women Helpline', num: '1091', desc: '24/7 Dedicated Women Security Cell' },
      { name: 'Transit / Railway Police', num: '1512', desc: 'Onboard & Station Transit Security' },
      { name: 'Medical Ambulance', num: '108', desc: 'Emergency Trauma Care Dispatch' }
    ]
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 2. STATE MANAGEMENT
  // ──────────────────────────────────────────────────────────────────────────
  let isOpen = false;
  let isMinimized = false;
  let isSpeechEnabled = true;
  let recognition = null;
  let isListening = false;

  let windowEl = null;
  let fabEl = null;
  let messagesContainer = null;
  let inputEl = null;
  let micBtn = null;
  let speechBtn = null;

  // ──────────────────────────────────────────────────────────────────────────
  // 3. DOM INJECTION
  // ──────────────────────────────────────────────────────────────────────────
  function injectAssistantDOM() {
    if (document.getElementById('transit-ai-fab-container')) return;

    // 1. Floating Bottom-Right Launcher
    const fabContainer = document.createElement('div');
    fabContainer.className = 'transit-ai-fab-container';
    fabContainer.id = 'transit-ai-fab-container';
    fabContainer.innerHTML = `
      <div class="transit-ai-fab-pill" id="transit-ai-pill" title="Click to ask Transit AI">
        <i class="fa-solid fa-wand-magic-sparkles pill-sparkle"></i>
        <span>Need Help? Ask Transit AI</span>
      </div>
      <button class="transit-ai-fab-btn" id="transit-ai-fab-btn" aria-label="Open Transit AI Assistant" title="Open Transit AI Assistant">
        <i class="fa-solid fa-robot" id="transit-ai-fab-icon"></i>
        <span class="transit-ai-online-dot"></span>
      </button>
    `;
    document.body.appendChild(fabContainer);

    // 2. Chat Window Container
    const win = document.createElement('div');
    win.className = 'transit-ai-window';
    win.id = 'transit-ai-window';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', 'Transit AI Chat Assistant');
    win.innerHTML = `
      <!-- Header -->
      <div class="transit-ai-header">
        <div class="transit-ai-header-left">
          <div class="transit-ai-avatar">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <div class="transit-ai-meta">
            <h4 class="transit-ai-title">Transit.IN AI Assistant</h4>
            <div class="transit-ai-status-row">
              <span class="transit-ai-pulse-dot"></span>
              <span id="transit-ai-status-text">Online · Telemetry Connected</span>
            </div>
          </div>
        </div>
        <div class="transit-ai-header-actions">
          <button class="transit-ai-btn-icon active" id="transit-ai-speech-toggle" title="Toggle AI Voice Speech Output">
            <i class="fa-solid fa-volume-high"></i>
          </button>
          <button class="transit-ai-btn-icon" id="transit-ai-minimize-btn" title="Minimize Window">
            <i class="fa-solid fa-window-minimize"></i>
          </button>
          <button class="transit-ai-btn-icon close-btn" id="transit-ai-close-btn" title="Close Assistant">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- Message Stream -->
      <div class="transit-ai-body" id="transit-ai-messages"></div>

      <!-- Quick Suggestion Chips -->
      <div class="transit-ai-quick-chips" id="transit-ai-chips">
        <button class="transit-ai-chip" data-query="Where is Bus 500D?">
          <i class="fa-solid fa-location-crosshairs"></i> Where is Bus 500D?
        </button>
        <button class="transit-ai-chip" data-query="How much is a bus pass?">
          <i class="fa-solid fa-ticket"></i> Ticket &amp; Pass Prices
        </button>
        <button class="transit-ai-chip" data-query="How to reach the Airport?">
          <i class="fa-solid fa-plane-departure"></i> Airport Express Buses
        </button>
        <button class="transit-ai-chip" data-query="Emergency helpline numbers">
          <i class="fa-solid fa-shield-heart"></i> Emergency Helplines
        </button>
        <button class="transit-ai-chip" data-query="How to use digital QR pass?">
          <i class="fa-solid fa-qrcode"></i> How QR Pass Works
        </button>
        <button class="transit-ai-chip" data-query="Bus timings &amp; schedule">
          <i class="fa-solid fa-clock"></i> Bus Operating Hours
        </button>
      </div>

      <!-- Footer Input Controls -->
      <div class="transit-ai-footer">
        <div class="transit-ai-input-wrap">
          <input 
            type="text" 
            class="transit-ai-input" 
            id="transit-ai-input" 
            placeholder="Ask in simple words (e.g. Bus 500D, pass price, airport)..." 
            autocomplete="off"
          />
          <button class="transit-ai-mic-btn" id="transit-ai-mic-btn" title="Speak your query in simple English">
            <i class="fa-solid fa-microphone"></i>
          </button>
        </div>
        <button class="transit-ai-send-btn" id="transit-ai-send-btn" title="Send message">
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    `;
    document.body.appendChild(win);

    // Cache elements
    windowEl = win;
    fabEl = document.getElementById('transit-ai-fab-btn');
    messagesContainer = document.getElementById('transit-ai-messages');
    inputEl = document.getElementById('transit-ai-input');
    micBtn = document.getElementById('transit-ai-mic-btn');
    speechBtn = document.getElementById('transit-ai-speech-toggle');

    // Attach Event Listeners
    fabEl.addEventListener('click', toggleAssistant);
    document.getElementById('transit-ai-pill').addEventListener('click', openAssistant);
    document.getElementById('transit-ai-close-btn').addEventListener('click', closeAssistant);
    document.getElementById('transit-ai-minimize-btn').addEventListener('click', toggleMinimize);
    speechBtn.addEventListener('click', toggleSpeech);

    document.getElementById('transit-ai-send-btn').addEventListener('click', handleUserSend);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleUserSend();
      }
    });

    // Delegate chips click
    document.getElementById('transit-ai-chips').addEventListener('click', (e) => {
      const chip = e.target.closest('.transit-ai-chip');
      if (chip && chip.dataset.query) {
        inputEl.value = chip.dataset.query;
        handleUserSend();
      }
    });

    // Delegate message action buttons click & deep linking
    messagesContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.transit-ai-action-btn');
      if (!btn) return;

      const action = btn.dataset.action;
      const targetVal = btn.dataset.val;

      if (action === 'track-bus') {
        sessionStorage.setItem('spt-selected-bus', targetVal || '500D');
        if (window.location.pathname.includes('tracking.html')) {
          if (typeof window.selectBusForTracking === 'function') {
            window.selectBusForTracking(targetVal);
          }
          closeAssistant();
        } else {
          window.location.href = 'tracking.html';
        }
      } else if (action === 'book-route') {
        sessionStorage.setItem('spt-booking-route', targetVal || '500D');
        if (window.location.pathname.includes('booking.html')) {
          const routeSelect = document.getElementById('route-select');
          if (routeSelect && targetVal) {
            routeSelect.value = targetVal;
            routeSelect.dispatchEvent(new Event('change'));
          }
          closeAssistant();
        } else {
          window.location.href = 'booking.html';
        }
      } else if (action === 'trigger-sos') {
        if (window.location.pathname.includes('safety.html')) {
          const beacon = document.querySelector('.beacon-box, #panic-btn');
          if (beacon) beacon.scrollIntoView({ behavior: 'smooth' });
          closeAssistant();
        } else {
          window.location.href = 'safety.html';
        }
      } else if (action === 'open-tour') {
        closeAssistant();
        if (window.TransitTour && typeof window.TransitTour.startPassenger === 'function') {
          window.TransitTour.startPassenger();
        }
      } else if (action === 'fill-query') {
        inputEl.value = targetVal || '';
        handleUserSend();
      }
    });

    // Render Welcome Message on First Load
    sendWelcomeMessage();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. WINDOW TOGGLE & DISPLAY LOGIC
  // ──────────────────────────────────────────────────────────────────────────
  function openAssistant() {
    isOpen = true;
    isMinimized = false;
    windowEl.classList.add('open');
    windowEl.classList.remove('minimized');
    fabEl.classList.add('active');
    fabEl.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    setTimeout(() => inputEl.focus(), 300);
  }

  function closeAssistant() {
    isOpen = false;
    windowEl.classList.remove('open');
    fabEl.classList.remove('active');
    fabEl.innerHTML = '<i class="fa-solid fa-robot"></i><span class="transit-ai-online-dot"></span>';
  }

  function toggleAssistant() {
    if (isOpen) {
      closeAssistant();
    } else {
      openAssistant();
    }
  }

  function toggleMinimize() {
    isMinimized = !isMinimized;
    windowEl.classList.toggle('minimized', isMinimized);
    const minBtn = document.getElementById('transit-ai-minimize-btn');
    minBtn.innerHTML = isMinimized
      ? '<i class="fa-solid fa-window-maximize"></i>'
      : '<i class="fa-solid fa-window-minimize"></i>';
  }

  function toggleSpeech() {
    isSpeechEnabled = !isSpeechEnabled;
    speechBtn.classList.toggle('active', isSpeechEnabled);
    speechBtn.innerHTML = isSpeechEnabled
      ? '<i class="fa-solid fa-volume-high"></i>'
      : '<i class="fa-solid fa-volume-xmark"></i>';
    speechBtn.title = isSpeechEnabled ? 'AI Voice Output Enabled' : 'AI Voice Output Muted';
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. MESSAGE STREAM & TYPING
  // ──────────────────────────────────────────────────────────────────────────
  function appendMessage(sender, htmlContent, actionButtonsHtml) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgEl = document.createElement('div');
    msgEl.className = `transit-ai-msg ${sender}`;

    let actionsMarkup = '';
    if (actionButtonsHtml) {
      actionsMarkup = `<div class="transit-ai-actions-wrap">${actionButtonsHtml}</div>`;
    }

    msgEl.innerHTML = `
      <div class="transit-ai-bubble">
        ${htmlContent}
        ${actionsMarkup}
      </div>
      <span class="transit-ai-time">${timeStr}</span>
    `;

    messagesContainer.appendChild(msgEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTypingIndicator() {
    const id = 'transit-ai-typing-indicator';
    if (document.getElementById(id)) return;

    const typingEl = document.createElement('div');
    typingEl.id = id;
    typingEl.className = 'transit-ai-msg assistant';
    typingEl.innerHTML = `
      <div class="transit-ai-bubble transit-ai-typing">
        <span class="transit-ai-dot"></span>
        <span class="transit-ai-dot"></span>
        <span class="transit-ai-dot"></span>
      </div>
    `;
    messagesContainer.appendChild(typingEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideTypingIndicator() {
    const el = document.getElementById('transit-ai-typing-indicator');
    if (el) el.remove();
  }

  function sendWelcomeMessage() {
    const welcomeHtml = `
      <p>Hello! Welcome to <strong>Transit.IN</strong>. I am your smart travel assistant.</p>
      <p>I am here to help you travel easily across the city. You can ask me anything about live bus locations, ticket fares, passes, or emergency help.</p>
      <div class="transit-ai-card-attachment">
        <div class="transit-ai-card-title">
          <i class="fa-solid fa-circle-check" style="color: #10B981;"></i> City Transit Status
        </div>
        <div class="transit-ai-card-row">
          <span>Active Buses on Road:</span>
          <strong style="color: #10B981;">1,840+ Buses Running</strong>
        </div>
        <div class="transit-ai-card-row">
          <span>On-Time Arrival:</span>
          <strong style="color: #38BDF8;">99.4% On Schedule</strong>
        </div>
      </div>
      <p style="font-size: 0.8rem; color: #94A3B8; margin-top: 0.4rem;">Tap any quick option below or type your question in simple words.</p>
    `;

    const actions = `
      <button class="transit-ai-action-btn" data-action="track-bus" data-val="500D"><i class="fa-solid fa-map-location-dot"></i> Live Map</button>
      <a href="booking.html" class="transit-ai-action-btn"><i class="fa-solid fa-ticket"></i> Buy Bus Pass</a>
      <button class="transit-ai-action-btn" data-action="trigger-sos" style="color: #F87171; border-color: rgba(239,68,68,0.4);"><i class="fa-solid fa-shield-heart"></i> Safety SOS</button>
      <button class="transit-ai-action-btn" data-action="open-tour" style="color: #C4B5FD;"><i class="fa-solid fa-play"></i> Guided Tour</button>
    `;

    appendMessage('assistant', welcomeHtml, actions);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. INTELLIGENT TRANSIT NLP ENGINE (PROFESSIONAL & SIMPLE ENGLISH)
  // ──────────────────────────────────────────────────────────────────────────
  function handleUserSend() {
    const query = inputEl.value.trim();
    if (!query) return;

    inputEl.value = '';
    appendMessage('user', `<p>${escapeHTML(query)}</p>`);
    playUiChime('send');

    showTypingIndicator();

    setTimeout(() => {
      hideTypingIndicator();
      const response = processNLPQuery(query);
      appendMessage('assistant', response.html, response.actions);
      playUiChime('receive');

      // Voice synthesis read-aloud
      if (isSpeechEnabled && response.speechText) {
        speakResponse(response.speechText);
      }
    }, 400);
  }

  function processNLPQuery(rawQuery) {
    const q = rawQuery.toLowerCase().trim();

    // 1. Live Bus Location / Specific Bus Tracking (e.g. 500D, 335E, KIAS-9, 500A, 201R, BGK-01)
    for (const bus of TRANSIT_KB.buses) {
      if (q.includes(bus.id.toLowerCase())) {
        const html = `
          <p>Here is the live status for <strong>${bus.name}</strong>:</p>
          <div class="transit-ai-card-attachment">
            <div class="transit-ai-card-title">
              <i class="fa-solid fa-bus-simple" style="color: #38BDF8;"></i> Live Bus Location
            </div>
            <div class="transit-ai-card-row">
              <span>Current location:</span>
              <strong style="color: #FFFFFF;">${bus.loc}</strong>
            </div>
            <div class="transit-ai-card-row">
              <span>Next approaching stop:</span>
              <strong style="color: #C4B5FD;">${bus.nextStop} (Arrives in ${bus.eta})</strong>
            </div>
            <div class="transit-ai-card-row">
              <span>Current speed:</span>
              <span class="transit-ai-badge-pill">${bus.speed}</span>
            </div>
            <div class="transit-ai-card-row">
              <span>Seat availability:</span>
              <span style="color: #34D399; font-weight: 600;">${bus.occupancy}</span>
            </div>
          </div>
        `;
        const actions = `
          <button class="transit-ai-action-btn" data-action="track-bus" data-val="${bus.id}"><i class="fa-solid fa-crosshairs"></i> Track on Live Map</button>
          <button class="transit-ai-action-btn" data-action="book-route" data-val="${bus.id}"><i class="fa-solid fa-chair"></i> Book Seat on ${bus.id}</button>
        `;
        const speechText = `Bus ${bus.id} is currently at ${bus.loc}. It will reach ${bus.nextStop} in ${bus.eta}. Seats are available.`;
        return { html, actions, speechText };
      }
    }

    // 2. Airport Transit Routes (KIAS-9 Vayu Vajra)
    if (q.includes('airport') || q.includes('kias') || q.includes('flight') || q.includes('vayu vajra')) {
      const html = `
        <p>Here is the easiest way to reach the <strong>Airport</strong>:</p>
        <div class="transit-ai-card-attachment">
          <div class="transit-ai-card-title">
            <i class="fa-solid fa-plane" style="color: #38BDF8;"></i> Airport Express Bus (KIAS-9)
          </div>
          <div class="transit-ai-card-row"><span>Starting point:</span><strong>Kempegowda Bus Station (Majestic)</strong></div>
          <div class="transit-ai-card-row"><span>Destination:</span><strong>Airport Terminal 1 &amp; 2</strong></div>
          <div class="transit-ai-card-row"><span>Bus frequency:</span><strong>Leaves every 15 minutes</strong></div>
          <div class="transit-ai-card-row"><span>Ticket price:</span><strong>₹240 per person</strong></div>
          <div class="transit-ai-card-row"><span>Travel time:</span><strong>Around 60 minutes</strong></div>
        </div>
        <p style="font-size: 0.82rem; color: #94A3B8; margin-top: 0.4rem;">
          These are air-conditioned Volvo buses with luggage space and free Wi-Fi, running 24 hours every day.
        </p>
      `;
      const actions = `
        <a href="tracking.html" class="transit-ai-action-btn"><i class="fa-solid fa-location-dot"></i> View Airport Buses</a>
        <a href="booking.html" class="transit-ai-action-btn"><i class="fa-solid fa-ticket"></i> Book Airport Pass</a>
      `;
      const speechText = `Airport express buses run 24 hours a day. Route KIAS-9 leaves every 15 minutes from Majestic, costs 240 rupees, and takes around 60 minutes.`;
      return { html, actions, speechText };
    }

    // 3. Fares, Passes & Ticket Pricing
    if (q.includes('fare') || q.includes('price') || q.includes('pass') || q.includes('ticket') || q.includes('cost') || q.includes('rate') || q.includes('how much')) {
      const html = `
        <p>Here is the simple price guide for bus tickets and passes:</p>
        <div class="transit-ai-card-attachment">
          <div class="transit-ai-card-row">
            <span>Single Ride:</span>
            <strong>₹15 to ₹45 (depends on distance)</strong>
          </div>
          <div class="transit-ai-card-row">
            <span>Daily All-City Pass:</span>
            <strong style="color: #34D399;">₹70 (Unlimited rides all day)</strong>
          </div>
          <div class="transit-ai-card-row">
            <span>Monthly Student Pass:</span>
            <strong style="color: #38BDF8;">₹350 per month</strong>
          </div>
          <div class="transit-ai-card-row">
            <span>Monthly Regular Pass:</span>
            <strong style="color: #C4B5FD;">₹1,050 per month</strong>
          </div>
        </div>
        <p style="font-size: 0.82rem; color: #94A3B8; margin-top: 0.4rem;">
          All passes are digital. You can buy them online and show the QR code on your phone to board.
        </p>
      `;
      const actions = `
        <a href="booking.html" class="transit-ai-action-btn"><i class="fa-solid fa-credit-card"></i> Buy Pass Online</a>
        <a href="profile.html" class="transit-ai-action-btn"><i class="fa-solid fa-wallet"></i> Check My Wallet</a>
      `;
      const speechText = `Single bus tickets start at 15 rupees. An all-day pass costs 70 rupees for unlimited rides, and a student monthly pass is 350 rupees.`;
      return { html, actions, speechText };
    }

    // 4. How to Use Digital QR Bus Pass
    if (q.includes('qr') || q.includes('digital pass') || q.includes('how to use') || q.includes('scan') || q.includes('board')) {
      const html = `
        <p>Using your <strong>Digital Bus Pass</strong> is quick and easy in 3 steps:</p>
        <div class="transit-ai-card-attachment">
          <div class="transit-ai-card-row"><span>Step 1:</span><strong>Select your route or pass type online</strong></div>
          <div class="transit-ai-card-row"><span>Step 2:</span><strong>Pay securely using UPI, Card, or Wallet</strong></div>
          <div class="transit-ai-card-row"><span>Step 3:</span><strong>Show your QR pass on your phone screen to board</strong></div>
        </div>
        <p style="font-size: 0.82rem; color: #94A3B8; margin-top: 0.4rem;">
          Your digital pass is stored in your Profile so you can open it at any time, even without an active internet connection.
        </p>
      `;
      const actions = `
        <a href="booking.html" class="transit-ai-action-btn"><i class="fa-solid fa-qrcode"></i> Buy Digital QR Pass</a>
        <a href="profile.html" class="transit-ai-action-btn"><i class="fa-solid fa-id-card"></i> View My Saved Pass</a>
      `;
      const speechText = `To use a digital pass, buy it online, open the QR code on your phone, and show it to the bus conductor to board. It works even offline.`;
      return { html, actions, speechText };
    }

    // 5. Safety, Emergency SOS, Police, Helplines
    if (q.includes('safety') || q.includes('sos') || q.includes('emergency') || q.includes('police') || q.includes('help') || q.includes('danger') || q.includes('women') || q.includes('ambulance')) {
      const html = `
        <p>Your safety is our top priority. For immediate help, call any of these toll-free numbers 24/7:</p>
        <div class="transit-ai-card-attachment" style="border-color: rgba(239, 68, 68, 0.4);">
          <div class="transit-ai-card-row" style="margin-bottom: 0.35rem;">
            <span>National Police &amp; Emergency:</span>
            <a href="tel:112" style="color: #F87171; font-weight: 700; text-decoration: none;"><i class="fa-solid fa-phone"></i> 112</a>
          </div>
          <div class="transit-ai-card-row" style="margin-bottom: 0.35rem;">
            <span>Women Safety Helpline:</span>
            <a href="tel:1091" style="color: #F87171; font-weight: 700; text-decoration: none;"><i class="fa-solid fa-phone"></i> 1091</a>
          </div>
          <div class="transit-ai-card-row" style="margin-bottom: 0.35rem;">
            <span>Transit &amp; Railway Police:</span>
            <a href="tel:1512" style="color: #F87171; font-weight: 700; text-decoration: none;"><i class="fa-solid fa-phone"></i> 1512</a>
          </div>
          <div class="transit-ai-card-row">
            <span>Medical Ambulance:</span>
            <a href="tel:108" style="color: #F87171; font-weight: 700; text-decoration: none;"><i class="fa-solid fa-phone"></i> 108</a>
          </div>
        </div>
        <p style="font-size: 0.82rem; color: #94A3B8; margin-top: 0.4rem;">
          You can also tap below to share your live location with family via WhatsApp or sound the emergency alarm.
        </p>
      `;
      const actions = `
        <button class="transit-ai-action-btn" data-action="trigger-sos" style="color: #EF4444; border-color: rgba(239,68,68,0.5);"><i class="fa-solid fa-triangle-exclamation"></i> Open Safety Shield</button>
        <a href="safety.html" class="transit-ai-action-btn"><i class="fa-solid fa-share-nodes"></i> Share Live Location</a>
      `;
      const speechText = `Emergency helplines are free and available 24 hours. Call 112 for national emergency, 1091 for women helpline, or 1512 for transit police. You can also trigger the emergency SOS alarm on the Safety page.`;
      return { html, actions, speechText };
    }

    // 6. Timetable & Schedule Timings
    if (q.includes('timetable') || q.includes('time') || q.includes('schedule') || q.includes('morning') || q.includes('night') || q.includes('first bus') || q.includes('last bus') || q.includes('hours')) {
      const html = `
        <p>Here are the standard bus service hours:</p>
        <div class="transit-ai-card-attachment">
          <div class="transit-ai-card-row"><span>First bus in the morning:</span><strong>05:00 AM</strong></div>
          <div class="transit-ai-card-row"><span>Morning rush (8 AM – 11 AM):</span><strong>Every 4 to 8 minutes</strong></div>
          <div class="transit-ai-card-row"><span>Evening rush (5 PM – 9 PM):</span><strong>Every 4 to 8 minutes</strong></div>
          <div class="transit-ai-card-row"><span>Regular afternoon hours:</span><strong>Every 10 to 15 minutes</strong></div>
          <div class="transit-ai-card-row"><span>Night bus service:</span><strong>Runs until 01:30 AM on major routes</strong></div>
        </div>
      `;
      const actions = `
        <a href="timetable.html" class="transit-ai-action-btn"><i class="fa-solid fa-calendar-days"></i> Open Bus Timetable</a>
        <a href="routes.html" class="transit-ai-action-btn"><i class="fa-solid fa-route"></i> Browse All Routes</a>
      `;
      const speechText = `The first bus leaves at 5 AM. During rush hours, buses arrive every 4 to 8 minutes, and night services run until 1:30 AM.`;
      return { html, actions, speechText };
    }

    // 7. Routes & Recommendations
    if (q.includes('route') || q.includes('reach') || q.includes('how to go') || q.includes('from') || q.includes('to') || q.includes('majestic') || q.includes('whitefield') || q.includes('silk board') || q.includes('bagalkot') || q.includes('delhi')) {
      const html = `
        <p>Here are the recommended direct routes across the city:</p>
        <div class="transit-ai-card-attachment">
          <div class="transit-ai-card-row"><span>Majestic ↔ Whitefield:</span><strong>Route 335E (Every 8 mins)</strong></div>
          <div class="transit-ai-card-row"><span>Hebbal ↔ Central Silk Board:</span><strong>Route 500D (Every 5 mins)</strong></div>
          <div class="transit-ai-card-row"><span>City Station ↔ Airport:</span><strong>Route KIAS-9 (Every 15 mins)</strong></div>
          <div class="transit-ai-card-row"><span>Navanagar ↔ Old Bus Stand:</span><strong>Route BGK-01 (Every 10 mins)</strong></div>
        </div>
      `;
      const actions = `
        <a href="routes.html" class="transit-ai-action-btn"><i class="fa-solid fa-magnifying-glass"></i> Search All Routes</a>
        <a href="index.html#journey-planner-container" class="transit-ai-action-btn"><i class="fa-solid fa-compass"></i> Plan My Journey</a>
      `;
      const speechText = `You can search and plan any route in our Route Directory. Popular direct routes include 335E to Whitefield, 500D across the Outer Ring Road, and KIAS-9 to the airport.`;
      return { html, actions, speechText };
    }

    // 8. General Greetings
    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('who are you') || q.includes('good morning') || q.includes('good evening') || q.includes('namaste')) {
      const html = `
        <p>Hello! Welcome to <strong>Transit.IN</strong>. How may I help you with your journey today?</p>
        <p>You can ask me simple questions like:</p>
        <p>• <em>"Where is Bus 500D right now?"</em><br>• <em>"How much is an all-day bus pass?"</em><br>• <em>"How do I reach the airport?"</em><br>• <em>"Show emergency helpline numbers"</em></p>
      `;
      const actions = `
        <button class="transit-ai-action-btn" data-action="track-bus" data-val="500D"><i class="fa-solid fa-location-crosshairs"></i> Where is Bus 500D?</button>
        <button class="transit-ai-action-btn" data-action="fill-query" data-val="How much is a bus pass?"><i class="fa-solid fa-ticket"></i> Pass Prices</button>
        <button class="transit-ai-action-btn" data-action="fill-query" data-val="How to reach the Airport?"><i class="fa-solid fa-plane"></i> Airport Route</button>
      `;
      const speechText = `Hello! Welcome to Transit.IN. How can I help you travel today?`;
      return { html, actions, speechText };
    }

    // 9. Polite Thank You
    if (q.includes('thank') || q.includes('thanks') || q.includes('great') || q.includes('good') || q.includes('awesome')) {
      const html = `
        <p>You are very welcome! 😊</p>
        <p>I am always here to assist you. Have a safe, comfortable, and pleasant journey with <strong>Transit.IN</strong>!</p>
      `;
      const actions = `
        <a href="tracking.html" class="transit-ai-action-btn"><i class="fa-solid fa-map-location-dot"></i> View Live Map</a>
        <a href="booking.html" class="transit-ai-action-btn"><i class="fa-solid fa-ticket"></i> Book a Ticket</a>
      `;
      const speechText = `You are very welcome! Have a safe and pleasant journey.`;
      return { html, actions, speechText };
    }

    // 10. Default Helpful Fallback
    const html = `
      <p>Thank you for asking. I am here to help you travel smoothly across the city.</p>
      <p>Here are the quickest ways to find what you need:</p>
      <div class="transit-ai-card-attachment">
        <div class="transit-ai-card-title"><i class="fa-solid fa-circle-question" style="color: #38BDF8;"></i> Quick Assistance</div>
        <div class="transit-ai-card-row"><span>Want to see where buses are?</span><strong style="color: #38BDF8;">Check Live Map</strong></div>
        <div class="transit-ai-card-row"><span>Need to buy a ticket or pass?</span><strong style="color: #34D399;">Buy Bus Pass</strong></div>
        <div class="transit-ai-card-row"><span>Need emergency or safety help?</span><strong style="color: #F87171;">Safety Shield</strong></div>
      </div>
    `;
    const actions = `
      <a href="tracking.html" class="transit-ai-action-btn"><i class="fa-solid fa-map-location-dot"></i> Live Map</a>
      <a href="routes.html" class="transit-ai-action-btn"><i class="fa-solid fa-route"></i> All Routes</a>
      <a href="booking.html" class="transit-ai-action-btn"><i class="fa-solid fa-ticket"></i> Buy Pass</a>
    `;
    const speechText = `I am here to help you. You can inspect live buses on the map, look up routes, or buy tickets online.`;
    return { html, actions, speechText };
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7. SPEECH SYNTHESIS, WEB AUDIO & SPEECH-TO-TEXT (STT/TTS)
  // ──────────────────────────────────────────────────────────────────────────
  let audioCtx = null;

  function playUiChime(type) {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      if (type === 'send') {
        // High soft beep
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'receive') {
        // Futuristic two-tone chime
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      }
    } catch (e) {
      // AudioContext unavailable or blocked
    }
  }

  function speakResponse(text) {
    if (!isSpeechEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.02;
      utterance.pitch = 1.0;
      utterance.lang = 'en-IN';

      // Pick best English voice if available
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India'));
      if (indianVoice) utterance.voice = indianVoice;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  function showWaveform() {
    const inputWrap = document.querySelector('.transit-ai-input-wrap');
    if (!inputWrap || document.getElementById('transit-ai-waveform')) return;

    const wave = document.createElement('div');
    wave.id = 'transit-ai-waveform';
    wave.className = 'transit-ai-waveform-overlay';
    wave.innerHTML = `
      <div class="transit-ai-wave-bar"></div>
      <div class="transit-ai-wave-bar"></div>
      <div class="transit-ai-wave-bar"></div>
      <div class="transit-ai-wave-bar"></div>
      <div class="transit-ai-wave-bar"></div>
      <span style="font-size: 0.76rem; color: #38BDF8; font-weight: 600; margin-left: 6px;">Listening...</span>
    `;
    inputWrap.appendChild(wave);
  }

  function hideWaveform() {
    const wave = document.getElementById('transit-ai-waveform');
    if (wave) wave.remove();
  }

  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (micBtn) micBtn.style.display = 'none';
      return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      isListening = true;
      micBtn.classList.add('listening');
      micBtn.title = 'Listening... Speak your destination or bus number';
      showWaveform();
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        inputEl.value = transcript;
        hideWaveform();
        handleUserSend();
      }
    };

    recognition.onerror = () => {
      isListening = false;
      micBtn.classList.remove('listening');
      hideWaveform();
    };

    recognition.onend = () => {
      isListening = false;
      micBtn.classList.remove('listening');
      micBtn.title = 'Speak your query';
      hideWaveform();
    };

    micBtn.addEventListener('click', () => {
      if (!recognition) return;
      if (isListening) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (e) {
          console.warn('Speech recognition start failed:', e);
        }
      }
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 8. GLOBAL API EXPOSURE
  // ──────────────────────────────────────────────────────────────────────────
  window.TransitAI = {
    open: openAssistant,
    close: closeAssistant,
    toggle: toggleAssistant,
    ask: function (query) {
      openAssistant();
      inputEl.value = query;
      handleUserSend();
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 9. INITIALIZATION
  // ──────────────────────────────────────────────────────────────────────────
  function init() {
    injectAssistantDOM();
    initSpeechRecognition();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
