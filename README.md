# Transit.IN (Smart Public Transport Tracker)

Transit.IN is a responsive, modern web application designed to track public transport across India's major cities (Delhi, Mumbai, and Bangalore). It features live departure boards, route analytics dashboards, and a complete e-ticket booking system.

## 🚀 Features

*   **Pan-India Tracking:** Toggle instantly between Delhi, Mumbai, and Bangalore. Route data, timetables, and alerts switch dynamically.
*   **Live Map Tracking:** Built with Leaflet.js, featuring a pulsing bus icon simulating real-time movement across actual city coordinates.
*   **Dashboard & Analytics:** A modern dashboard utilizing `Chart.js` for ridership trends, along with a counting animation for live stats.
*   **Smart Booking System:** Seamless e-ticket booking with dynamic fare calculation, a simulated payment gateway, and integration with EmailJS for real email receipts.
*   **Digital Tickets:** View generated tickets in your profile and download them directly as a PDF via `html2pdf.js`.
*   **Modern UI:** Glassmorphism design, dark mode toggle, smooth CSS animations, and autocomplete smart search.

## 📁 Project Structure

```text
Transit.IN/
├── css/
│   └── style.css            # Custom CSS properties, animations, and responsive layouts
├── js/
│   ├── app.js               # Global logic, city selection, dark mode, animations, smart search
│   ├── booking.js           # Ticket generation, fake payment modal, EmailJS integration
│   ├── notifications.js     # Pan-India dynamic timetables and system alerts
│   ├── routes.js            # Pan-India route listing, smart search filtering, and favorites
│   └── tracking.js          # Leaflet map logic, coordinate rendering, and ETA calculation
├── index.html               # Main Dashboard & Analytics
├── booking.html             # E-Ticket Booking Page
├── notifications.html       # System Alerts Page
├── profile.html             # User Profile & Downloadable E-Tickets
├── routes.html              # Route Discovery Page
├── timetable.html           # Weekly Schedules
└── README.md                # Project Documentation
```

## 🛠️ Built With

*   HTML5 / CSS3 / Vanilla JavaScript
*   [Leaflet.js](https://leafletjs.com/) (Maps & Tracking)
*   [Chart.js](https://www.chartjs.org/) (Analytics)
*   [EmailJS](https://www.emailjs.com/) (Real Email Notifications)
*   [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) (PDF Ticket Downloads)
*   [FontAwesome](https://fontawesome.com/) (Icons)

## 💡 Resume Summary

> **Developed a responsive Smart Public Transport Tracker covering major Indian cities, featuring live departure boards, route analytics dashboards, and a multi-step e-ticket booking system using HTML, CSS, JavaScript, and Chart.js.**
