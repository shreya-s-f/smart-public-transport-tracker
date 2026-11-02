# TRANSIT.IN &bull; Smart Public Transport Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-3.2.0-purple.svg)](https://github.com/shreya-s-f/smart-public-transport-tracker)
[![Coverage](https://img.shields.io/badge/Cities-7%20Pan--India%20Metros-orange.svg)](#-pan-india-transit-coverage)
[![UI: Futuristic Glassmorphism](https://img.shields.io/badge/UI-Futuristic%20Glass%20%26%20SaaS-blueviolet.svg)](#-official-brand-identity)
[![Author](https://img.shields.io/badge/Author-Shreya%20Fakirapur-blue.svg)](https://www.linkedin.com/in/shreya-fakirapur-557388324)

**TRANSIT.IN** is a commercial SaaS-grade public transit and intelligent fleet mobility platform engineered for cities across India. Combining turn-by-turn road curvature calculations via OSRM, real-time GPS telemetry, AI arrival predictions, biometric passenger pass issuance, and comprehensive fleet orchestration, Transit.IN delivers an intuitive, futuristic transit ecosystem.

> **Tagline:** *Smarter Journeys. Connected Cities.*

---

## 🎨 Official Brand Identity & Design System

- **Deep Navy:** `#10172A` &bull; Primary atmospheric canvas
- **Midnight:** `#080D20` &bull; Viewport & backdrop depth
- **Primary Purple:** `#8B5CF6` &bull; Brand aura, primary glowing elements
- **Electric Blue:** `#38BDF8` &bull; Active telematics, routes & live tracking
- **Lavender:** `#C4B5FD` &bull; Secondary text, subtitles & accents
- **Soft Grey:** `#94A3B8` &bull; Form labels, timestamps & secondary icons
- **Dark Grey:** `#1E293B` &bull; Glass surface backdrops & frosted borders

### Typography Architecture
- **Space Grotesk:** Main logo `TRANSIT.IN` with glowing purple-blue accent and distinctive dot.
- **Sora:** Section headings, dashboard cards, and hero displays.
- **Inter:** Body copy, timetable grids, and interactive forms.
- **Orbitron:** Telematics metrics, vehicle speeds, countdown timers, and wallet balances.
- **Urbanist:** Passenger hubs, driver telemetry badges, and admin controls.

---

## 🚀 Key Modules & System Architecture

### 1. 🎬 Cinematic Animated Intro Screen (`TransitIntro`)
- Full-screen deep navy backdrop with animated purple/blue glowing ambient gradient waves.
- Center transportation radar reveal with glowing vehicle and location beacon.
- Letter-by-letter reveal of `TRANSIT.IN` accompanied by high-velocity light-sweep animation.
- Animated route line trace beneath official tagline: *"SMARTER JOURNEYS. CONNECTED CITIES."*
- Session-gated via `sessionStorage` with instant "Skip Intro" option and reduced-motion fallback.

### 2. 🚏 Commercial SaaS Landing Page (`index.html`)
- **Hero Radar Display:** Live pulsing radar sweep with real-time transit metrics and vehicle counter.
- **Interactive Bento Grid:** 6 high-impact capability showcases:
  - Turn-by-Turn GPS Radar Tracking
  - AI Punctuality & Confidence Matrix
  - Multilingual Voice Route Guide
  - Holographic QR Boarding Passes
  - 24/7 Pan-India SOS Safety Shield
  - Enterprise Fleet & Grievance Central
- **Dynamic How-It-Works Workflow:** Interactive 4-step rider progression with live state transitions.
- **Testimonial Marquee:** Verified commuter reviews across 7 Indian metropolitan hubs.
- **Interactive FAQ Accordion:** Instant answers regarding fares, concessions, passes, and EV charging.

### 3. 👤 Passenger Dashboard Hub (`profile.html`)
- **Panoramic Cover Banner & Avatar Studio:** Profile picture selector, real-time bio preview, and verified badges.
- **Tabbed Navigation Bar:**
  - **Dashboard & Trips:** Contactless transit pass card, commuter care quick actions, and filterable trip history.
  - **Account Settings:** Personal Information editor, Payment Methods & Transit Wallet top-up (+₹100, +₹250, +₹500), Notification Preferences toggles, and Privacy & 2FA controls.
  - **Quick Links & Care:** Commuter FAQ articles, Grievance / Ticket submission, 5-Star Feedback rating, and About Transit+ membership perks.
  - **Safety Shield Hub:** Instant Distress Panic Beacon with synthesized audible siren, Police Control Room dispatch, WhatsApp/SMS live trip sharing, and clickable 24/7 helplines (**112**, **1091**, **1512**, **108**).

### 4. 🏢 Centralized Fleet Management Admin Portal (`admin.html`)
- **Fleet Control Radar:** Real-time operational map with status tags (`Active`, `Maintenance`, `Off Route`).
- **Driver Roster & Shift Allocator:** Active pilot duty hours, vehicle assignments, and license validity tracker.
- **Predictive Maintenance Telemetry:** AI health index, brake pad wear sensors, and battery coolant indicators.
- **Grievance Resolution Desk:** Live ticket resolver for passenger complaints and lost-and-found property claims.

### 5. 🎙️ Multilingual TransitVoice AI Assistant (`js/voice-assistant.js`)
- Interactive floating microphone button with pulsing soundwave visualizer.
- Speech Recognition supporting English, Hindi, and regional phrases (*"Where is route 500D?", "How much is fare to Airport?", "Show my pass"*).
- Web Speech Synthesis with audible route directions and high-priority transit announcements.

---

## 📡 REST API & Persistence Layer (`server.js`)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | GET | System health, uptime, and database persistence status |
| `/api/profile` | GET / POST | Commuter profile, bio, emergency contact, and location |
| `/api/trips` | GET / POST | Commuter trip history and recent journey logs |
| `/api/wallet` | GET / POST | Transit wallet balance, fast recharge, and ledger |
| `/api/routes` | GET | Pan-India route catalog with stop coordinates |
| `/api/track/:id` | GET | Real-time vehicle telemetry, coordinates, and occupancy |
| `/api/complaints` | GET / POST / PATCH | Grievance submission and admin resolution workflow |
| `/api/lost-found` | GET / POST / PATCH | Passenger lost items registry and depot claim tracking |
| `/api/maintenance` | GET / POST | Fleet vehicle health scores and service alerts |
| `/api/safety/sos` | POST | Emergency distress beacon dispatch with GPS coordinates |
| `/api/alerts` | GET / POST | Crowdsourced disruption reports and weather advisories |

---

## ⚡ Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher.
- Modern Chromium, Safari, or Firefox browser.

### 1. Clone & Setup
```bash
git clone https://github.com/shreya-s-f/smart-public-transport-tracker.git
cd smart-public-transport-tracker
npm install
```

### 2. Launch Server
```bash
npm start
# Server starts on http://localhost:5000
```

### 3. Demo Role Accounts
- **Passenger:** `shreya.f@example.com` / `password123` &rarr; Navigates to Commuter Hub
- **Fleet Admin:** `admin@transit` / `admin123` &rarr; Navigates to Admin Portal (`admin.html`)

### 4. Global Keyboard Shortcuts
- `Ctrl + K` (or `Cmd + K`): Opens universal spotlight search command palette across all pages.
- `Alt + S`: Launches 24/7 Safety Shield panic modal.
- `Alt + V`: Activates Multilingual TransitVoice Assistant.

---

## 🌍 Pan-India Transit Coverage
1. **Delhi (DTC & Airport Express)** &bull; Connaught Place, Okhla, IGI Terminal 3, Anand Vihar.
2. **Mumbai (BEST & Coastal)** &bull; CSMT, Bandra Kurla Complex (BKC), Nariman Point, Andheri.
3. **Bangalore (BMTC & Vayu Vajra)** &bull; Hebbal, Manyata, Silk Board, Whitefield ITPL, KIA Airport.
4. **Bagalkot (NWKRTC & City Hub)** &bull; Navanagar, Old Bus Stand, Vidyagiri, Medical College.
5. **Hyderabad (TSRTC & Hitec Feeder)** &bull; Secunderabad, Hitec City, Charminar, Gachibowli.
6. **Chennai (MTC & Coastal Express)** &bull; Central Railway, Marina Beach, OMR IT Corridor, Guindy.
7. **Pune (PMPML & Rainbow BRTS)** &bull; Swargate, Pune Station, Hinjewadi IT Park, Kothrud.

---

## 📄 License & Credits
Developed with &hearts; by **Shreya Fakirapur** &copy; 2026. Released under the [MIT License](LICENSE).
