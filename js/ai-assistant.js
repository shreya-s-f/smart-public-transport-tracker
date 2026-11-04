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
        <button class="transit-ai-chip" data-query="How to reach Airport?">
          <i class="fa-solid fa-plane-departure"></i> Airport Routes
        </button>
        <button class="transit-ai-chip" data-query="What is Daily Pass price?">
          <i class="fa-solid fa-ticket"></i> Daily Pass Fare
        </button>
        <button class="transit-ai-chip" data-query="Emergency Helplines">
          <i class="fa-solid fa-shield-heart"></i> Safety SOS
        </button>
        <button class="transit-ai-chip" data-query="How to book digital pass?">
          <i class="fa-solid fa-qrcode"></i> Digital QR Pass
        </button>
      </div>

      <!-- Footer Input Controls -->
      <div class="transit-ai-footer">
        <div class="transit-ai-input-wrap">
          <input 
            type="text" 
            class="transit-ai-input" 
            id="transit-ai-input" 
            placeholder="Ask about live buses, routes, fares, passes..." 
            autocomplete="off"
          />
          <button class="transit-ai-mic-btn" id="transit-ai-mic-btn" title="Speak your query">
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
      <p>👋 Hello! I am your <strong>Transit.IN AI Assistant</strong>.</p>
      <p>I can help you track active buses in real-time, compute ticket fares, find nearby routes, book digital passes, and activate emergency helplines.</p>
      <div class="transit-ai-card-attachment">
        <div class="transit-ai-card-title">
          <i class="fa-solid fa-satellite-dish" style="color: #38BDF8;"></i> Live Transit Matrix Active
        </div>
        <div class="transit-ai-card-row">
          <span>Active Fleet Buses:</span>
          <strong style="color: #34D399;">1,840+ Units</strong>
        </div>
        <div class="transit-ai-card-row">
          <span>Network Reliability:</span>
          <strong style="color: #38BDF8;">99.4% On-Time</strong>
        </div>
      </div>
    `;

    const actions = `
      <a href="tracking.html" class="transit-ai-action-btn"><i class="fa-solid fa-map-location-dot"></i> Live Map</a>
      <a href="booking.html" class="transit-ai-action-btn"><i class="fa-solid fa-ticket"></i> Book Ticket</a>
      <a href="safety.html" class="transit-ai-action-btn" style="color: #F87171; border-color: rgba(239,68,68,0.4);"><i class="fa-solid fa-shield-heart"></i> Safety SOS</a>
    `;

    appendMessage('assistant', welcomeHtml, actions);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. INTELLIGENT TRANSIT NLP ENGINE
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
    }, 450);
  }

  function processNLPQuery(rawQuery) {
    const q = rawQuery.toLowerCase().trim();

    // 1. Live Bus Location / Specific Bus Query (e.g., 500D, 335E, KIAS-9, 500A, 201R)
    for (const bus of TRANSIT_KB.buses) {
      if (q.includes(bus.id.toLowerCase())) {
        const html = `
          <p>📍 <strong>${bus.name}</strong> is currently active!</p>
          <div class="transit-ai-card-attachment">
            <div class="transit-ai-card-title">
              <i class="fa-solid fa-bus-simple" style="color: #38BDF8;"></i> Live Vehicle Telemetry
            </div>
            <div class="transit-ai-card-row">
              <span>Current Location:</span>
              <strong style="color: #FFFFFF;">${bus.loc}</strong>
            </div>
            <div class="transit-ai-card-row">
              <span>Next Approaching Stop:</span>
              <strong style="color: #C4B5FD;">${bus.nextStop} (in ${bus.eta})</strong>
            </div>
            <div class="transit-ai-card-row">
              <span>Live Speed:</span>
              <span class="transit-ai-badge-pill">${bus.speed}</span>
            </div>
            <div class="transit-ai-card-row">
              <span>Passenger Occupancy:</span>
              <span style="color: #34D399; font-weight: 600;">${bus.occupancy}</span>
            </div>
          </div>
        `;
        const actions = `
          <a href="tracking.html" class="transit-ai-action-btn"><i class="fa-solid fa-crosshairs"></i> Track on Live Map</a>
          <a href="booking.html" class="transit-ai-action-btn"><i class="fa-solid fa-chair"></i> Book Seat on ${bus.id}</a>
        `;
        const speechText = `Bus ${bus.id} is currently at ${bus.loc}, arriving at ${bus.nextStop} in approximately ${bus.eta}. Occupancy is ${bus.occupancy}.`;
        return { html, actions, speechText };
      }
    }

    // 2. Airport Transit Routes
    if (q.includes('airport') || q.includes('kias') || q.includes('vayu vajra')) {
      const html = `
        <p>✈️ <strong>Airport Transit Services (Vayu Vajra)</strong>:</p>
        <p>Airport buses operate 24/7 on dedicated express corridors with luggage racks and free high-speed onboard Wi-Fi.</p>
        <div class="transit-ai-card-attachment">
          <div class="transit-ai-card-title">
            <i class="fa-solid fa-plane" style="color: #38BDF8;"></i> Route KIAS-9 (Kempegowda BS ↔ Airport)
          </div>
          <div class="transit-ai-card-row"><span>Headway:</span><strong>Every 15 mins</strong></div>
          <div class="transit-ai-card-row"><span>Fare:</span><strong>₹240 (All inclusive)</strong></div>
          <div class="transit-ai-card-row"><span>Travel Time:</span><strong>~60 mins via Hebbal Expressway</strong></div>
        </div>
      `;
      const actions = `
        <a href="tracking.html" class="transit-ai-action-btn"><i class="fa-solid fa-location-dot"></i> Track Airport Buses</a>
        <a href="booking.html" class="transit-ai-action-btn"><i class="fa-solid fa-ticket"></i> Book Airport Pass</a>
      `;
      const speechText = `Airport buses run 24/7 every 15 minutes. Route KIAS-9 from Kempegowda Bus Station takes approximately 60 minutes with a fare of 240 rupees.`;
      return { html, actions, speechText };
    }

    // 3. Fares, Passes & Ticket Pricing
    if (q.includes('fare') || q.includes('price') || q.includes('pass') || q.includes('ticket') || q.includes('cost')) {
      const html = `
        <p>🎫 <strong>Transit.IN Fare & Pass Structure</strong>:</p>
        <div class="transit-ai-card-attachment">
          <div class="transit-ai-card-row">
            <span>Single Journey:</span>
            <strong>${TRANSIT_KB.fares.single}</strong>
          </div>
          <div class="transit-ai-card-row">
            <span>Daily All-City Pass:</span>
            <strong style="color: #34D399;">${TRANSIT_KB.fares.dailyPass}</strong>
          </div>
          <div class="transit-ai-card-row">
            <span>Monthly Pass:</span>
            <strong style="color: #38BDF8;">${TRANSIT_KB.fares.monthlyPass}</strong>
          </div>
        </div>
        <p style="font-size: 0.8rem; color: #94A3B8; margin-top: 0.4rem;">All tickets generate an encrypted <strong>Holographic QR Pass</strong> on your phone with instant onboard tap-and-go validation.</p>
      `;
      const actions = `
        <a href="booking.html" class="transit-ai-action-btn"><i class="fa-solid fa-credit-card"></i> Buy Pass Online</a>
        <a href="profile.html" class="transit-ai-action-btn"><i class="fa-solid fa-wallet"></i> My Wallet</a>
      `;
      const speechText = `Single bus fares range from 15 to 45 rupees. A Daily Unlimited Transit Pass costs 70 rupees, and monthly passes start at 350 rupees for students.`;
      return { html, actions, speechText };
    }

    // 4. Safety, Emergency SOS, Police, Helplines
    if (q.includes('safety') || q.includes('sos') || q.includes('emergency') || q.includes('police') || q.includes('help') || q.includes('danger') || q.includes('women')) {
      const html = `
        <p>🛡️ <strong>Safety Shield & Emergency SOS Command</strong>:</p>
        <p>If you feel unsafe or observe an incident, trigger our instant distress siren or call toll-free responder lines:</p>
        <div class="transit-ai-card-attachment" style="border-color: rgba(239, 68, 68, 0.4);">
          ${TRANSIT_KB.helplines.map(h => `
            <div class="transit-ai-card-row" style="margin-bottom: 0.25rem;">
              <span>${h.name}:</span>
              <a href="tel:${h.num}" style="color: #F87171; font-weight: 700; text-decoration: none;"><i class="fa-solid fa-phone"></i> ${h.num}</a>
            </div>
          `).join('')}
        </div>
      `;
      const actions = `
        <a href="safety.html" class="transit-ai-action-btn" style="color: #EF4444; border-color: rgba(239,68,68,0.5);"><i class="fa-solid fa-triangle-exclamation"></i> Open Safety Shield</a>
        <a href="safety.html" class="transit-ai-action-btn"><i class="fa-solid fa-share-nodes"></i> Share Live Journey</a>
      `;
      const speechText = `Emergency responders are available 24/7. Call 112 for national emergency, 1091 for women helpline, or 1512 for transit police. You can also press the emergency SOS alarm on the Safety page.`;
      return { html, actions, speechText };
    }

    // 5. Timetable & Schedule Timings
    if (q.includes('timetable') || q.includes('time') || q.includes('schedule') || q.includes('morning') || q.includes('night') || q.includes('first bus') || q.includes('last bus')) {
      const html = `
        <p>⏰ <strong>Official Service Timetables</strong>:</p>
        <p>• <strong>Morning Early Runs:</strong> First bus starts at <strong>05:00 AM</strong> from all major depots.</p>
        <p>• <strong>Peak Headway:</strong> Every <strong>4–8 minutes</strong> during rush hours (08:00–11:00 AM, 05:00–09:00 PM).</p>
        <p>• <strong>Night Corridors:</strong> Night Owl lines operate until <strong>01:30 AM</strong> connecting railway terminals, hospitals, and airport routes.</p>
      `;
      const actions = `
        <a href="timetable.html" class="transit-ai-action-btn"><i class="fa-solid fa-calendar-days"></i> Browse Full Timetable</a>
        <a href="routes.html" class="transit-ai-action-btn"><i class="fa-solid fa-route"></i> Route Directory</a>
      `;
      const speechText = `Early morning bus service begins at 5 AM. During peak hours, buses arrive every 4 to 8 minutes, with night services operating until 1:30 AM.`;
      return { html, actions, speechText };
    }

    // 6. Routes & Navigation
    if (q.includes('route') || q.includes('reach') || q.includes('how to go') || q.includes('from') || q.includes('majestic') || q.includes('whitefield') || q.includes('silk board')) {
      const html = `
        <p>🗺️ <strong>Intermodal Route Recommendations</strong>:</p>
        <p>Use our smart journey planner to find optimal direct corridors with lowest travel time and live vehicle tracking:</p>
        <div class="transit-ai-card-attachment">
          <div class="transit-ai-card-row"><span>Majestic ↔ Whitefield:</span><strong>Route 335E (Every 8m)</strong></div>
          <div class="transit-ai-card-row"><span>Hebbal ↔ Silk Board:</span><strong>Route 500D (Every 5m)</strong></div>
          <div class="transit-ai-card-row"><span>City Station ↔ Airport:</span><strong>Route KIAS-9 (Every 15m)</strong></div>
        </div>
      `;
      const actions = `
        <a href="routes.html" class="transit-ai-action-btn"><i class="fa-solid fa-magnifying-glass"></i> Route Directory</a>
        <a href="index.html#journey-planner-container" class="transit-ai-action-btn"><i class="fa-solid fa-compass"></i> Open Journey Planner</a>
      `;
      const speechText = `You can search and plan optimal routes in our Route Directory. Popular routes include 335E to Whitefield, 500D along the Outer Ring Road, and KIAS-9 to the Airport.`;
      return { html, actions, speechText };
    }

    // 7. General Greetings & Help
    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('who are you') || q.includes('namaste')) {
      const html = `
        <p>👋 Hello! I am <strong>Transit.IN AI Assistant</strong>, your real-time companion for city mobility.</p>
        <p>You can ask me:</p>
        <p>• <em>"Where is Bus 500D right now?"</em><br>• <em>"How much is a daily bus pass?"</em><br>• <em>"Fastest route to Airport"</em><br>• <em>"Emergency helpline numbers"</em></p>
      `;
      const actions = `
        <button class="transit-ai-action-btn" onclick="document.getElementById('transit-ai-input').value='Where is Bus 500D?'; document.getElementById('transit-ai-send-btn').click();">Track Bus 500D</button>
        <button class="transit-ai-action-btn" onclick="document.getElementById('transit-ai-input').value='What is Daily Pass price?'; document.getElementById('transit-ai-send-btn').click();">Pass Prices</button>
      `;
      const speechText = `Hello! I am your Transit.IN AI Assistant. How can I help you travel smarter today?`;
      return { html, actions, speechText };
    }

    // 8. Default Intelligent Fallback
    const html = `
      <p>I understand you're asking about <strong>"${escapeHTML(rawQuery)}"</strong>.</p>
      <p>Here are quick actions you can take across the platform right now:</p>
      <div class="transit-ai-card-attachment">
        <div class="transit-ai-card-title"><i class="fa-solid fa-lightbulb" style="color: #F59E0B;"></i> Suggested Actions</div>
        <div class="transit-ai-card-row"><span>Live GPS Radar:</span><strong>tracking.html</strong></div>
        <div class="transit-ai-card-row"><span>Paperless Pass Booking:</span><strong>booking.html</strong></div>
        <div class="transit-ai-card-row"><span>Emergency SOS:</span><strong>safety.html</strong></div>
      </div>
    `;
    const actions = `
      <a href="tracking.html" class="transit-ai-action-btn"><i class="fa-solid fa-map-location-dot"></i> Live Tracking</a>
      <a href="routes.html" class="transit-ai-action-btn"><i class="fa-solid fa-route"></i> All Routes</a>
      <a href="booking.html" class="transit-ai-action-btn"><i class="fa-solid fa-ticket"></i> Book Ticket</a>
    `;
    const speechText = `I have provided helpful links for your query. You can inspect live tracking, search bus routes, or book tickets online.`;
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
