# Transit.IN &bull; Smart Public Transport Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-3.0.0-green.svg)](https://github.com/shreya-s-f/smart-public-transport-tracker)
[![Coverage](https://img.shields.io/badge/Cities-7%20Pan--India%20Metros-orange.svg)](#-pan-india-transit-coverage)
[![UI: Glassmorphism](https://img.shields.io/badge/UI-Ultra%20Glassmorphism%20%26%20Animations-purple.svg)](#-design-system--animations)
[![Author](https://img.shields.io/badge/Author-Shreya%20Fakirapur-blueviolet.svg)](https://www.linkedin.com/in/shreya-fakirapur-557388324)

**Transit.IN** is an enterprise-grade, high-performance mobility and public transit platform engineered for commuters across India. Built with clean, modern Vanilla HTML5, CSS3, and JavaScript, the platform delivers zero-dependency real-time vehicle telemetry, turn-by-turn road curvature calculations via OSRM, smart intermodal journey planning, 24/7 SOS commuter safety shields, interactive seat floorplans, offline timetable caching, and crowdsourced disruption reporting.

---

## 🌟 What's New in Version 3.0.0

Designed and architected by a Senior Principal Mobility Developer, Transit.IN v3.0 introduces a comprehensive suite of interactive features, fluid glassmorphism animations, and commuter-centric intelligence:

1. **🎠 Interactive Glass Slides Feature Showcase (Hero Carousel)**
   - Multi-slide panoramic showcase with glass specular reflections, smooth slide transitions, and automatic rotation with hover/touch pause.
   - Quick search input, metro city switcher pills, and direct CTA deep-links.

2. **🧭 Smart Intermodal Journey Planner (A-to-B Multi-Hop)**
   - Intelligent route finder with 180° animated stop-swap button.
   - Real-time itinerary breakdown: walking directions, bus boardings, crowd occupancy meter, platform bay, and travel duration.
   - One-click shortcuts to track the planned vehicle live on the GPS map or book e-tickets instantly.

3. **🛡️ Pan-India 24/7 Emergency SOS & Live Trip Sharing Hub**
   - Floating safety beacon accessible globally across all application pages.
   - Synthesizes an audible distress siren (700Hz–1100Hz frequency sweep) using HTML5 Web Audio API without external audio dependencies.
   - Generates live GPS journey tracking links with one-tap sharing directly to WhatsApp, SMS, or clipboard.
   - Instant direct dialing for national emergency helplines: **112** (National Emergency), **1091** (Women Helpline), **1512** (Transit Police), and **108** (Ambulance).

4. **📡 Live Vehicle Telemetry Drawer & Audio Approach Chimes**
   - Live telemetry card displaying vehicle registration plates (e.g. `DL-01-EB-8492`), certified pilot ratings (`Vikram Singh ⭐ 4.95`), and low-floor electric bus specs.
   - Real-time crowd occupancy progress bar (Low, Moderate, High Crowding with seats remaining).
   - Airport/Metro-style dual-tone audio approach chime (D5 -> A5 tone) synthesized in real-time when the vehicle approaches your stop.

5. **🪑 Interactive Seat Floorplan & Pass Savings Calculator**
   - Visual 24-seat bus cabin floorplan with realistic window, aisle, ladies-priority, and senior-accessible seats.
   - Automatic seat assignment synchronized with passenger count.
   - Commuter Pass Savings Calculator comparing **Single Journey** vs **Unlimited Day Pass (₹80)** vs **30-Day Monthly Pass (₹1,200)**.
   - Holographic animated digital QR pass with dynamic anti-fraud security timestamp.

6. **🗺️ Route Explorer with Glass Filters & Stop Interchange Drawer**
   - Glass category filters: All, Electric Fleet, AC Express, Airport Lines, Metro Feeder, and **⭐ Pinned Favorites**.
   - Expandable stop sequence accordion for each line displaying numbered stops, interchange badges (Metro, Airport, Railway), and direct "Board Here" shortcuts.

7. **🚇 Offline Schedule Caching & Platform Bay Indicators**
   - One-click offline caching of full metro schedules into browser storage for underground subway and low-connectivity tunnels.
   - Time-of-day tabs: All Day, Morning Peak (06:00 - 10:00), Midday, Evening Rush (16:00 - 21:00), and Night Owl.
   - Terminal platform bay indicator (e.g. `Bay 04 • North Concourse`).

8. **🌦️ Weather & Monsoon Commute Risk Index & Delay Reporting**
   - Real-time weather and road condition advisory for Indian metros (clear skies, coastal showers, monsoon waterlogging, and traffic impact).
   - Crowdsourced commuter incident broadcast system with local persistence and community verification indicators.

---

## 🎨 Design System & Animations

Transit.IN features a refined **Ultra-Glassmorphism** visual language crafted for both Dark and Light themes:

* **Glass Tokens:** `backdrop-filter: blur(14px)`, specular borders `rgba(255, 255, 255, 0.12)`, and luminous ambient glows.
* **Keyframe Choreography:**
  - `floatSlow`: Gentle floating elevation for interactive cards.
  - `shimmerSlide`: Holographic light sweep across contactless passes.
  - `radarPulse`: Concentric wave radar emission for live GPS vehicles.
  - `sosBeacon`: Pulsing emergency safety shield ring.
  - `zoomInGlass`: Fluid modal entrance with scale and backdrop fade.
* **Theme Integrity:** Full support for dark and light modes, preserving contrast, readability, and WCAG accessibility standards.

---

## 🇮🇳 Pan-India Transit Coverage (7 Major Cities)

* **Bengaluru:** BMTC (AC Express 500D, 356CW, V-500D), KIA Airport Shuttles, and Namma Metro Purple & Green lines.
* **Bagalkot:** NWKRTC City Shuttles (Navanagar to College Cross, Railway Station, Vidyagiri, BVVS Campus).
* **Delhi:** DTC Electric buses, ISBT Kashmiri Gate routes, and Delhi Metro Airport Express.
* **Mumbai:** BEST double-decker electric buses, CSMT to BKC shuttles, and Suburban local corridors.
* **Hyderabad:** TSRTC AC Express, Secunderabad to Hitec City (Cyber Towers), and Hyderabad Metro.
* **Chennai:** MTC city buses and Chennai Metro Blue & Green corridors.
* **Pune:** PMPML Rainbow BRTS priority corridors (Swargate to Hinjawadi Phase 3).

---

## 📁 Repository Structure

```text
smart-public-transport-tracker/
├── css/
│   └── style.css            # Responsive layout, CSS design tokens, glass carousel, keyframes
├── js/
│   ├── app.js               # Global app controller, SOS Safety Shield, siren audio, toast system
│   ├── auth.js              # Authentication guards, session persistence, role-based helpers
│   ├── booking.js           # Seat picker floorplan, pass savings calculator, holographic QR pass
│   ├── notifications.js     # Offline timetable caching, time-of-day filters, weather advisory
│   ├── routes.js            # Route search, favorites pinning, stop sequence interchange drawer
│   ├── tracking.js          # Leaflet GPS map, OSRM road routing, telemetry drawer, audio chime
│   └── transit-data.js      # Comprehensive route dataset for 7 Indian metro regions
├── index.html               # Main Dashboard, Glass Carousel, Journey Planner, Live Departures
├── booking.html             # E-Ticket & Pass Booking Portal with Seat Selection Floorplan
├── notifications.html       # Weather & Disruption Feed with Crowdsourced Incident Reporting
├── profile.html             # Commuter Profile, Digital Wallet, Settings & Help Modals
├── routes.html              # Pan-India Route Finder with Stop Interchange Drawer
├── timetable.html           # Weekly Schedules with Offline Caching & Platform Bays
├── login.html               # User Signup, Login & Email OTP Verification
├── admin.html               # Transit Authority Admin Portal
└── README.md                # System Architecture & Documentation
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Core** | Clean Semantic HTML5, CSS3 Custom Properties (Design Tokens), Vanilla JavaScript (ES6+) |
| **Audio Synthesis** | HTML5 Web Audio API (Synthesized sirens & approach chimes, zero external MP3s) |
| **Mapping & Geospatial** | [Leaflet.js](https://leafletjs.com/), OpenStreetMap Tiles, [OSRM API](http://project-osrm.org/) |
| **Data Visualization** | [Chart.js](https://www.chartjs.org/) (Commute Analytics & Trends) |
| **PDF Generation** | [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) (Vector PDF Ticket Passes) |
| **Iconography & Fonts** | [Font Awesome 6.4](https://fontawesome.com/), Google Fonts (Inter, Caveat) |
| **Data Persistence** | Browser `localStorage` (Zero external database required for client deployment) |

---

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shreya-s-f/smart-public-transport-tracker.git
   cd smart-public-transport-tracker
   ```

2. **Run locally:**
   Since Transit.IN is built with pure Vanilla web technologies, no build tools or package managers (`npm`/`yarn`) are required:
   * Simply double click `index.html` to open in any modern browser (Chrome, Edge, Firefox, Safari).
   * Or use a local development server such as Python:
     ```bash
     python -m http.server 8000
     ```
   * Open `http://localhost:8000` in your browser.

---

## 👩‍💻 Author & Credits

* **Developer:** **Shreya Fakirapur**
* **GitHub:** [@shreya-s-f](https://github.com/shreya-s-f)
* **LinkedIn:** [Shreya Fakirapur](https://www.linkedin.com/in/shreya-fakirapur-557388324)

---

Developed with ❤️ for public transit commuters across India &bull; Transit.IN &copy; 2026
