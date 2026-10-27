# Transit.IN &bull; Smart Public Transport Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-2.6.0-green.svg)](https://github.com/shreya-s-f/smart-public-transport-tracker)
[![Coverage](https://img.shields.io/badge/Cities-7%20Pan--India%20Metros-orange.svg)](#-pan-india-transit-coverage)
[![Author](https://img.shields.io/badge/Author-Shreya%20Fakirapur-blueviolet.svg)](https://www.linkedin.com/in/shreya-fakirapur-557388324)

**Transit.IN** is an intelligent, high-performance web platform designed to streamline and elevate the public transit experience across India. It provides live vehicle radar tracking, turn-by-turn road curvature calculations via OSRM, dynamic schedule timetables, contactless digital QR passes, and comprehensive commuter account services.

---

## 🚀 Key Features & Architectural Modules

### 1. 🗺️ Real-Time GPS Tracking & Road Curvature Routing
* **OpenStreetMap & Leaflet.js:** High-precision interactive maps with responsive vector markers and smooth panning.
* **OSRM (Open Source Routing Machine) Engine:** Generates true turn-by-turn road curves along actual Indian road corridors instead of straight line approximations.
* **Live Telemetry Simulation:** Simulates bus and metro arrivals with real-time coordinate streaming, distance to stops, and dynamic ETA calculations.

### 2. 🇮🇳 Pan-India Transit Coverage (7 Major Cities)
* **Bengaluru:** BMTC (AC Express 500D, 356CW, V-500D), KIA Airport Shuttles, and Namma Metro Purple & Green lines.
* **Bagalkot:** NWKRTC City Shuttles (Navanagar to College Cross, Railway Station, Vidyagiri, BVVS Campus).
* **Delhi:** DTC Electric buses, ISBT Kashmiri Gate routes, and Delhi Metro Airport Express.
* **Mumbai:** BEST double-decker electric buses, CSMT to BKC shuttles, and Suburban local corridors.
* **Hyderabad:** TSRTC AC Express, Secunderabad to Hitec City (Cyber Towers), and Hyderabad Metro.
* **Chennai:** MTC city buses and Chennai Metro Blue & Green corridors.
* **Pune:** PMPML Rainbow BRTS priority corridors (Swargate to Hinjawadi Phase 3).

### 3. 👤 End-to-End Commuter Profile & Settings Center
The interactive commuter profile page (`profile.html`) features a panoramic sunset transit banner, customizable avatar upload/removal, KPI travel statistics (Total Trips, Cities Visited, CO₂ Saved, Commuter Rating), and dynamic modal centers:

#### **Account Settings**
* **Personal Information:** Edit commuter name, verified email, phone number, primary operating city, commuter category (Student, Senior Citizen, Daily Commuter), emergency contact name and phone, and bio with instant `localStorage` synchronization.
* **Payment Methods & Digital Transit Wallet:**
  * Virtual NFC transit smart card (`8821 •••• •••• 4920`).
  * Instant balance recharges (`+₹100`, `+₹200`, `+₹500`, or custom amount).
  * UPI AutoPay (`shreya@oksbi`) and RuPay NCMC contactless card integration.
  * Real-time wallet ledger logging debits, fare deductions, and credit recharges.
* **Notification Preferences Center:**
  * Toggles for Bus Delays (>5 mins late), Approaching Stop alarms (2 stops away), Pass Expiry/Cashback offers, Email Invoices, and Emergency Advisories.
  * Direct one-click shortcut to the comprehensive Alerts & Advisories Board.
* **Privacy & Security Suite:**
  * In-modal password update form with validation.
  * Two-Factor Authentication (Email OTP) toggle.
  * High-precision GPS location privacy toggle.
  * Commuter route anonymization control.
  * Active device session manager with "Terminate Other Sessions" capability.
  * One-click route search history purge.

#### **Quick Links**
* **Help & Support Desk:**
  * 24/7 National Toll-Free Helpline (`1800-425-TRANSIT` / `1800-425-8726`), WhatsApp desk, and dedicated support email.
  * Interactive accordion FAQs covering GPS tracking accuracy, QR validation, and tier-2 city support.
  * "Raise a Support Ticket" form generating unique ticket IDs (e.g. `TKT-8219`) saved to client-side storage.
* **Interactive Commuter Feedback:**
  * 5-star rating selector with reactive emotional feedback indicators.
  * Category dropdown (GPS Accuracy, Bus Punctuality, Ticket Booking, UI Design, Route Suggestions).
  * Real-time community review feed displaying submitted commuter experiences.
* **About Transit+:**
  * Architecture breakdown, platform version (`v2.6.0`), and developer credentials with direct links to GitHub and LinkedIn.
* **Session Sign Out:**
  * Elegant confirmation modal with smooth credential state clearing and transition to `login.html`.

### 4. 🎫 Contactless Ticket Booking & Digital QR Passes
* Fast route selection with dynamic distance and fare computation.
* Instant QR pass generation and downloadable PDF passes via `html2pdf.js`.
* Seamless integration with client-side booking store.

### 5. 🔐 Robust Client-Side Authentication & Verification
* Dedicated login and signup forms (`login.html`) with password strength validation.
* Email verification with 6-digit OTP security simulation.
* Role-based access control (Commuter vs Admin Portal).

---

## 📁 Repository Structure

```text
smart-public-transport-tracker/
├── css/
│   └── style.css            # Responsive layout, CSS variables (Dark/Light themes), glassmorphism
├── js/
│   ├── app.js               # City selector, dark/light theme toggle, telemetry animations, search
│   ├── auth.js              # Authentication guards, session validators, role helpers
│   ├── booking.js           # Ticket booking calculations, simulated payment gateway, PDF export
│   ├── notifications.js     # Timetables, delay alerts, and live disruption monitors
│   ├── routes.js            # Pan-India route listing, stop filters, and favorites management
│   ├── tracking.js          # Leaflet map logic, coordinate streaming, and OSRM road routes
│   └── transit-data.js      # Comprehensive route dataset for 7 Indian metro regions
├── index.html               # Main Dashboard, Live Departure Boards & Analytics
├── booking.html             # E-Ticket & Commuter Pass Booking Portal
├── notifications.html       # Live Transit Advisories & Disruption Board
├── profile.html             # Commuter Profile, Digital Wallet, Settings & Help Modals
├── routes.html              # Pan-India Route Finder & Stop Exploration
├── timetable.html           # Comprehensive Weekly Schedules
├── login.html               # User Signup, Login & Email OTP Verification
├── admin.html               # Transit Authority Admin Portal
└── README.md                # System Architecture & Documentation
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Core** | Clean Semantic HTML5, CSS3 Custom Properties (Design Tokens), Vanilla JavaScript (ES6+) |
| **Mapping & Geospatial** | [Leaflet.js](https://leafletjs.com/), OpenStreetMap Tiles, [OSRM API](http://project-osrm.org/) |
| **Data Visualization** | [Chart.js](https://www.chartjs.org/) (Commute Analytics & Trends) |
| **PDF Generation** | [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) (Vector PDF Ticket Passes) |
| **Iconography & Fonts** | [Font Awesome 6.4](https://fontawesome.com/), Google Fonts (Inter) |
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
   * Or use a local development server such as VS Code's "Live Server" extension or Python:
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

## 📄 License

This project is licensed under the [MIT License](LICENSE).
