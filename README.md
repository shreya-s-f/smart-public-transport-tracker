# 🚍 TRANSIT.IN – Smart Public Transport Tracker

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/Version-3.2.0-purple.svg)
![Cities](https://img.shields.io/badge/Cities-7%20Indian%20Cities-orange.svg)
![UI](https://img.shields.io/badge/UI-Modern%20Glassmorphism-blueviolet.svg)
![Author](https://img.shields.io/badge/Author-Shreya%20Fakirapur-blue.svg)

**TRANSIT.IN** is a smart public transport tracking system designed to make travelling easier, safer, and more convenient.

It helps passengers track buses, check arrival times, manage digital bus passes, report problems, and get emergency support.

It also helps transport administrators manage buses, drivers, routes, and passenger complaints from one place.

**Tagline:** *Smarter Journeys. Connected Cities.*

---

## 🎨 Design and Branding

TRANSIT.IN uses a modern and attractive design with glass effects, smooth animations, and a dark theme.

### Colour Theme

- **Deep Navy:** `#10172A` – Main background colour.
- **Midnight:** `#080D20` – Dark background.
- **Purple:** `#8B5CF6` – Main brand colour.
- **Electric Blue:** `#38BDF8` – Used for live tracking and highlights.
- **Lavender:** `#C4B5FD` – Used for text and small highlights.
- **Soft Grey:** `#94A3B8` – Used for secondary text.
- **Dark Grey:** `#1E293B` – Used for cards and backgrounds.

### Fonts Used

- **Space Grotesk:** Website logo.
- **Sora:** Main headings.
- **Inter:** Normal text and forms.
- **Orbitron:** Speed, timers, and live tracking numbers.
- **Urbanist:** Dashboard and control sections.

---

## 🚀 Main Features and Modules

### 1. 🎬 Animated Intro Screen (`TransitIntro`)

When users open the website, they first see an animated introduction.

Features:
- Dark background with glowing purple and blue effects.
- Animated transport radar with a bus and location icon.
- The TRANSIT.IN logo appears with a letter-by-letter animation.
- Animated tagline: "SMARTER JOURNEYS. CONNECTED CITIES."
- Skip Intro option.
- The intro is shown only once per browser session.
- Supports users who prefer reduced animations.

### 2. 🚏 Main Website (`index.html`)

The main page introduces the platform and its features.

Features:

- **Live Radar:** Shows a radar animation with transport information.
- **GPS Tracking:** Helps passengers track bus locations.
- **AI Arrival Prediction:** Shows estimated bus arrival times.
- **Voice Assistant:** Helps passengers find routes using voice commands.
- **QR Bus Pass:** Provides digital passes for easy boarding.
- **Emergency Support:** Gives passengers quick access to safety features.
- **Fleet Management:** Helps administrators manage buses and drivers.
- **How It Works:** Explains the system through four simple steps.
- **Customer Reviews:** Displays passenger feedback.
- **FAQ Section:** Answers common questions about fares, passes, and other services.

### 3. 👤 Passenger Dashboard (`profile.html`)

The passenger dashboard allows users to manage their accounts and travel information.

**Main sections:**

**A. Dashboard and Trips**
- View personal travel information.
- Access digital bus passes.
- Check previous trips.
- Use quick passenger support options.

**B. Account Settings**
- Update personal information.
- Add or manage payment methods.
- Add money to the transit wallet (+₹100, +₹250, +₹500).
- Manage notification settings.
- Control privacy and two-factor authentication settings.

**C. Help and Support**
- Read frequently asked questions.
- Submit complaints and support requests.
- Give feedback and ratings.
- Learn about Transit+ membership.

**D. Passenger Safety**
- Send emergency SOS alerts.
- Share live trip locations through WhatsApp or SMS.
- Play an emergency siren.
- Access emergency contact numbers:
  - Police: 112
  - Women Helpline: 1091
  - Road Accident Emergency: 1512
  - Ambulance: 108

### 4. 🏢 Admin Dashboard (`admin.html`)

The admin dashboard helps transport administrators manage the complete transport system.

Features:

- **Bus Management:** View and manage buses.
- **Live Fleet Tracking:** Check bus locations and current status.
- **Bus Status:** Identify active buses, buses under maintenance, and buses travelling on the wrong route.
- **Driver Management:** View driver details, working hours, and assigned buses.
- **Maintenance Management:** Check vehicle health and identify possible maintenance problems.
- **Complaint Management:** View and respond to passenger complaints.
- **Lost and Found:** Manage items lost by passengers and help them claim their belongings.

### 5. 🎙️ Multilingual Voice Assistant (`js/voice-assistant.js`)

TRANSIT.IN includes a voice assistant that helps passengers use the website through voice commands.

Features:
- Floating microphone button.
- Animated sound waves while listening.
- Supports English, Hindi, and regional language phrases.
- Converts voice commands into text.
- Gives spoken answers and route information.
- Provides important transport announcements.

**Example voice commands:**
- "Where is route 500D?"
- "What is the fare to the airport?"
- "Show my bus pass."

---

## 📡 REST API and Database

The backend is managed using `server.js`. It provides APIs to connect the website with the server and database.

| API Endpoint | Method | Purpose |
|---|---|---|
| `/api/health` | GET | Checks whether the server is working. |
| `/api/profile` | GET / POST | Gets and saves passenger details. |
| `/api/trips` | GET / POST | Gets and saves trip history. |
| `/api/wallet` | GET / POST | Manages wallet balance and recharges. |
| `/api/routes` | GET | Displays available bus routes and stops. |
| `/api/track/:id` | GET | Gets bus location and passenger information. |
| `/api/complaints` | GET / POST / PATCH | Manages passenger complaints. |
| `/api/lost-found` | GET / POST / PATCH | Manages lost and found items. |
| `/api/maintenance` | GET / POST | Manages bus maintenance information. |
| `/api/safety/sos` | POST | Sends emergency alerts with GPS location. |
| `/api/alerts` | GET / POST | Manages traffic, weather, and travel alerts. |

---

## ⚡ Installation and Setup

Follow these steps to run the project on your computer.

### Requirements

- Node.js version 18 or above.
- A modern web browser such as Chrome, Firefox, or Safari.
- Internet connection.

### Step 1: Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/shreya-s-f/smart-public-transport-tracker.git
```

Move into the project folder:

```bash
cd smart-public-transport-tracker
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start the Server

```bash
npm start
```

The server will start at:

`http://localhost:5000`

### Step 4: Demo Login Details

**Passenger Account**
- Email: `shreya.f@example.com`
- Password: `password123`

**Admin Account**
- Email: `admin@transit`
- Password: `admin123`

These accounts are provided for testing the passenger and admin dashboards.

### Keyboard Shortcuts

| Shortcut | Function |
|---|---|
| `Ctrl + K` / `Cmd + K` | Opens the search menu. |
| `Alt + S` | Opens the emergency SOS section. |
| `Alt + V` | Activates the voice assistant. |

---

## 🌍 Pan-India Transit Coverage

TRANSIT.IN is designed to support public transport services across seven Indian cities.

### 1. Delhi
- DTC and Airport Express.
- Connaught Place, Okhla, IGI Terminal 3, Anand Vihar.

### 2. Mumbai
- BEST and Coastal services.
- CSMT, Bandra Kurla Complex, Nariman Point, Andheri.

### 3. Bangalore
- BMTC and Vayu Vajra.
- Hebbal, Manyata, Silk Board, Whitefield ITPL, KIA Airport.

### 4. Bagalkot
- NWKRTC and City Bus Services.
- Navanagar, Old Bus Stand, Vidyagiri, Medical College.

### 5. Hyderabad
- TSRTC and Hitec City feeder services.
- Secunderabad, Hitec City, Charminar, Gachibowli.

### 6. Chennai
- MTC and Coastal services.
- Central Railway, Marina Beach, OMR, Guindy.

### 7. Pune
- PMPML and Rainbow BRTS.
- Swargate, Pune Station, Hinjewadi IT Park, Kothrud.

---

## 📄 License and Credits

This project was developed by **Shreya Fakirapur** in 2026.

It is released under the **MIT License**.

---

⭐ If you like this project, consider giving it a star on GitHub!

**GitHub Repository:** https://github.com/shreya-s-f/smart-public-transport-tracker
