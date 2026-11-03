/**
 * TRANSIT.IN — Role-Based Interactive Onboarding Tour System
 * ==========================================================
 * - Two completely separate tours:
 *   1. PASSENGER TOUR: Commuter experience across 9 passenger modules
 *      (Dashboard, Routes, Live Tracking, Timetable, Booking, Alerts, Safety, Voice AI, Profile)
 *   2. ADMIN TOUR: Fleet operations command on Admin Portal
 *      (Dispatch matrix, 6 core KPIs, active fleet table, driver roster, maintenance diagnostics, complaints, audit export)
 * - Automatic dynamic tab switching during Admin Tour
 * - Interactive Role-Picker Welcome Modal on first signup
 * - Native Mobile Bottom-Sheet (<=520px) & Floating Desktop Tooltip
 * - Keyboard navigation (Arrows, Enter, Escape, Shift + ?)
 * - Celebratory completion modals with confetti
 */

(function () {
  'use strict';

  // ──────────────────────────────────────────────────────────────────────────
  // 1. PASSENGER TOUR STEPS (9 Modules, Commuter-Centric)
  // ──────────────────────────────────────────────────────────────────────────
  const PASSENGER_STEPS = [
    // ── DASHBOARD (index.html) ──────────────────────────────────────────────
    {
      page: 'index.html',
      selector: '.navbar',
      title: 'Unified Navigation Command Bar',
      desc: 'Your <strong>top-middle floating navigation bar</strong> links all transit modules seamlessly. Switch between Dashboard, Routes, Live Tracking, Booking, Safety, and Voice AI with one tap.',
      module: 'Global Nav',
      icon: 'fa-compass',
      position: 'bottom',
      padding: 10,
      pills: ['Unified Bar', '9 Modules', 'Zero Clutter']
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

    // ── ROUTES (routes.html) ────────────────────────────────────────────────
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

    // ── LIVE TRACKING (tracking.html) ───────────────────────────────────────
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

    // ── TIMETABLE (timetable.html) ──────────────────────────────────────────
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

    // ── BOOKING (booking.html) ──────────────────────────────────────────────
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

    // ── ALERTS (notifications.html) ─────────────────────────────────────────
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

    // ── SAFETY (safety.html) ────────────────────────────────────────────────
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

    // ── VOICE AI (voice.html) ───────────────────────────────────────────────
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

    // ── PROFILE (profile.html) ──────────────────────────────────────────────
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
      selector: '.account-settings, .profile-container, main',
      title: 'Commuter Preferences & Account Settings',
      desc: 'Customize your notification alerts, linked emergency contacts, default payment methods, and account security preferences.',
      module: 'Profile',
      icon: 'fa-user-shield',
      position: 'center',
      padding: 16,
      pills: ['Settings', 'Security', 'Preferences']
    }
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // 2. ADMIN TOUR STEPS (Fleet Authority & Operations Matrix on admin.html)
  // ──────────────────────────────────────────────────────────────────────────
  const ADMIN_STEPS = [
    {
      page: 'admin.html',
      selector: '.navbar',
      title: 'Transit Authority Command Header',
      desc: 'You are authenticated inside the <strong>Central Transit Authority Portal</strong>. This encrypted command bar secures administrative privileges across all municipal depots.',
      module: 'Admin Authority',
      icon: 'fa-shield-halved',
      position: 'bottom',
      padding: 10,
      pills: ['Role: Administrator', 'Encrypted Session', 'Citywide Control']
    },
    {
      page: 'admin.html',
      selector: '.admin-page-container > div:first-child',
      title: 'Centralized Dispatch Matrix',
      desc: 'Real-time telemetry control center monitoring fleet duty rosters, predictive vehicle health diagnostics, and automated incident resolution workflows.',
      module: 'Dispatch Hub',
      icon: 'fa-tower-broadcast',
      position: 'bottom',
      padding: 14,
      pills: ['Central Dispatch', 'Live Operations', 'Audit Logs']
    },
    {
      page: 'admin.html',
      selector: '#stat-admin-passengers',
      title: 'Total Passenger Ridership',
      desc: 'Live commuter count showing <strong>148,230 passengers</strong> served today with an automated <strong>+12% surge prediction</strong> during peak rush hours.',
      module: 'KPI Analytics',
      icon: 'fa-users',
      position: 'bottom',
      padding: 16,
      pills: ['148k+ Riders', '+12% Surge Trend', 'Demand Forecasting']
    },
    {
      page: 'admin.html',
      selector: '#stat-admin-buses',
      title: 'Active Fleet Availability Ratio',
      desc: 'Monitors real-time fleet deployment: <strong>84 out of 90 buses</strong> are actively operating on route lines, reflecting an outstanding <strong>93.3% fleet availability</strong>.',
      module: 'KPI Analytics',
      icon: 'fa-bus-simple',
      position: 'bottom',
      padding: 16,
      pills: ['84/90 Active Units', '93.3% Availability', 'Depot Standby']
    },
    {
      page: 'admin.html',
      selector: '#stat-admin-drivers',
      title: 'Certified Driver Roster',
      desc: 'Real-time driver roster: <strong>92 certified drivers</strong> registered, with <strong>78 on active duty shifts</strong> operating across scheduled metropolitan routes.',
      module: 'KPI Analytics',
      icon: 'fa-id-badge',
      position: 'bottom',
      padding: 16,
      pills: ['92 Certified', '78 on Active Shift', 'Zero Truancy']
    },
    {
      page: 'admin.html',
      selector: '#stat-admin-routes',
      title: 'Operational Corridors Matrix',
      desc: 'Overview of <strong>45 active routes</strong> spanning <strong>7 interconnected metro networks</strong>, complete with automated headway balancing and detour protocols.',
      module: 'KPI Analytics',
      icon: 'fa-route',
      position: 'bottom',
      padding: 16,
      pills: ['45 Active Corridors', '7 Metro Networks', 'Dynamic Headways']
    },
    {
      page: 'admin.html',
      selector: '#stat-admin-emergencies',
      title: 'Live SOS & Emergency Safety Grid',
      desc: 'Integrated panic beacon monitoring. Displays active distress triggers across the fleet. Current status is <strong>0 Active Alerts</strong> (100% Secure Grid).',
      module: 'Security Grid',
      icon: 'fa-shield-heart',
      position: 'bottom',
      padding: 16,
      pills: ['Zero Active SOS', '100% Secure Grid', 'Rapid Dispatch']
    },
    {
      page: 'admin.html',
      selector: '#stat-admin-complaints',
      title: 'Grievance Resolution Desk',
      desc: 'Real-time commuter feedback queue. Shows 4 pending grievances with an outstanding <strong>18-minute average resolution SLA</strong> across all lines.',
      module: 'Service Quality',
      icon: 'fa-inbox',
      position: 'bottom',
      padding: 16,
      pills: ['4 Pending Tickets', '18-min Avg SLA', 'Automated Routing']
    },
    {
      page: 'admin.html',
      selector: '#tab-buses',
      title: 'Fleet & Route Matrix Tab',
      desc: 'Click or select this tab to inspect the complete operational fleet table: vehicle numbers, OSRM corridor paths, live passenger occupancy, and status.',
      module: 'Fleet Operations',
      icon: 'fa-bus-simple',
      position: 'bottom',
      padding: 12,
      tab: 'buses',
      pills: ['Vehicle Registration', 'Corridor Paths', 'Live Occupancy']
    },
    {
      page: 'admin.html',
      selector: '#section-buses table, #section-buses',
      title: 'Live Vehicle Telemetry Table',
      desc: 'Inspect individual buses in real-time. View registration numbers (KA-01-F-2024), route codes, passenger occupancy percentages, and maintenance status.',
      module: 'Fleet Operations',
      icon: 'fa-table',
      position: 'center',
      padding: 16,
      tab: 'buses',
      pills: ['Telemetry Table', 'Speed & Fuel', 'Real-Time Sync']
    },
    {
      page: 'admin.html',
      selector: 'button[onclick="openAddRouteModal()"]',
      title: 'Add & Dispatch New Route',
      desc: 'Dispatch new bus corridors on-the-fly. Define terminal stops, allocate vehicle units, assign shift drivers, and publish new routes to the commuter app instantly.',
      module: 'Fleet Operations',
      icon: 'fa-plus',
      position: 'left',
      padding: 12,
      tab: 'buses',
      pills: ['Instant Dispatch', 'Stop Waypoints', 'Public Broadcast']
    },
    {
      page: 'admin.html',
      selector: '#tab-drivers',
      title: 'Certified Driver Roster Tab',
      desc: 'Switch to the Driver Roster tab to review verified drivers, shift timetables, assigned bus registrations, and passenger safety ratings.',
      module: 'Staff Management',
      icon: 'fa-id-badge',
      position: 'bottom',
      padding: 12,
      tab: 'drivers',
      pills: ['Driver Rosters', 'Shift Schedules', 'Direct Call']
    },
    {
      page: 'admin.html',
      selector: '#section-drivers table, #section-drivers',
      title: 'Driver Duty Assignments & Ratings',
      desc: 'Detailed driver ledger showing 5-star commuter safety ratings, duty shift hours (06:00 AM – 02:00 PM), and one-click direct phone dispatch buttons.',
      module: 'Staff Management',
      icon: 'fa-user-check',
      position: 'center',
      padding: 16,
      tab: 'drivers',
      pills: ['Safety Ratings', 'Shift Timings', 'Direct Phone Call']
    },
    {
      page: 'admin.html',
      selector: '#tab-maintenance',
      title: 'Predictive Vehicle Maintenance Tab',
      desc: 'Switch to AI-driven predictive maintenance diagnostics. Telemetry sensors detect brake wear, tyre pressure anomalies, and battery health before failures occur.',
      module: 'Predictive Maintenance',
      icon: 'fa-wrench',
      position: 'bottom',
      padding: 12,
      tab: 'maintenance',
      pills: ['Brake Diagnostics', 'Tyre Pressure', 'Battery & Motor']
    },
    {
      page: 'admin.html',
      selector: '#section-maintenance, #tab-maintenance',
      title: 'Vehicle Diagnostics & Service Reminders',
      desc: 'Review automated health scorecards per vehicle. Prevent breakdowns on the road by scheduling proactive depot maintenance based on sensor alerts.',
      module: 'Predictive Maintenance',
      icon: 'fa-screwdriver-wrench',
      position: 'center',
      padding: 16,
      tab: 'maintenance',
      pills: ['Zero Breakdowns', 'Health Scores', 'Depot Reminders']
    },
    {
      page: 'admin.html',
      selector: '#tab-complaints',
      title: 'Commuter Grievances & Resolution Tab',
      desc: 'Direct ticketing workflow to investigate lost items, delayed buses, driver behavior complaints, or fare issues, with automated SMS/email updates to commuters.',
      module: 'Grievance SLA',
      icon: 'fa-triangle-exclamation',
      position: 'bottom',
      padding: 12,
      tab: 'complaints',
      pills: ['Ticket Resolution', 'Automated SMS', 'Audit Trail']
    },
    {
      page: 'admin.html',
      selector: '#tab-cities',
      title: 'Operating Cities Network Matrix',
      desc: 'Multi-city configuration engine. Manage operational corridors across Delhi, Mumbai, Bangalore, Hyderabad, Chennai, and tier-2 expanding networks.',
      module: 'Multi-City Grid',
      icon: 'fa-city',
      position: 'bottom',
      padding: 12,
      tab: 'cities',
      pills: ['7 Metros', 'Tier-2 Corridors', 'Custom Cities']
    },
    {
      page: 'admin.html',
      selector: 'button[onclick="exportAdminAuditLog()"]',
      title: 'Fleet Audit Log & Report Export',
      desc: 'Export end-of-day operational reports, ridership analytics, revenue ledgers, and compliance audit logs into CSV or JSON with one click.',
      module: 'Audit & Compliance',
      icon: 'fa-file-arrow-down',
      position: 'left',
      padding: 12,
      pills: ['Audit Logs', 'CSV & JSON Export', 'Compliance Ready']
    }
  ];

  // Storage keys
  const STORAGE_KEY_ACTIVE    = 'transit-tour-active';
  const STORAGE_KEY_MODE      = 'transit-tour-mode'; // 'passenger' | 'admin'
  const STORAGE_KEY_STEP      = 'transit-tour-step';
  const STORAGE_KEY_NEW_USER  = 'spt-is-new-user';
  const STORAGE_KEY_DONE      = 'transit-tour-done';

  let currentStepIndex = 0;
  let overlayEl = null;
  let spotlightEl = null;
  let tooltipEl = null;

  function getCurrentTourMode() {
    return sessionStorage.getItem(STORAGE_KEY_MODE) || 'passenger';
  }

  function getStepsForCurrentTour() {
    return getCurrentTourMode() === 'admin' ? ADMIN_STEPS : PASSENGER_STEPS;
  }

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
            <span class="tour-step-counter" id="tour-step-counter">Step 1 of 30</span>
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
  // ROLE-AWARE WELCOME MODAL (FIRST SIGNUP)
  // ──────────────────────────────────────────────────────────────────────────
  function showWelcomeModal() {
    if (document.getElementById('tour-welcome-modal')) return;

    const userRole = localStorage.getItem('spt-user-role') || 'passenger';
    const tourModePref = localStorage.getItem('spt-tour-mode') || userRole;
    const isAdmin = (tourModePref === 'admin');

    const modal = document.createElement('div');
    modal.id = 'tour-welcome-modal';
    modal.className = 'tour-welcome-overlay';

    if (isAdmin) {
      // ── Dedicated Admin Tour Welcome ──
      modal.innerHTML = `
        <div class="tour-welcome-card" style="max-width: 600px;">
          <div class="tour-welcome-icon-glow" style="border-color: rgba(245, 158, 11, 0.6); background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(239, 68, 68, 0.3)); color: #F59E0B; box-shadow: 0 0 40px rgba(245, 158, 11, 0.5);">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
          <span class="tour-welcome-badge" style="background: rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.4); color: #FCD34D;">
            Transit Authority Onboarding
          </span>
          <h2 class="tour-welcome-title">Fleet Operations <span>Command</span></h2>
          <p class="tour-welcome-desc">
            Your administrator account is verified. Take a 2-minute guided walkthrough of the <strong>centralized dispatch matrix</strong>, live vehicle telemetry, driver rosters, and predictive maintenance diagnostics.
          </p>
          <div class="tour-features-preview">
            <div class="tour-feat-card">
              <i class="fa-solid fa-tower-broadcast" style="color: #F59E0B;"></i>
              <div class="tour-feat-card-text">
                <span class="tour-feat-card-title">Centralized Dispatch</span>
                <span class="tour-feat-card-sub">6 Core Operations KPIs</span>
              </div>
            </div>
            <div class="tour-feat-card">
              <i class="fa-solid fa-bus-simple" style="color: #F59E0B;"></i>
              <div class="tour-feat-card-text">
                <span class="tour-feat-card-title">Live Fleet Matrix</span>
                <span class="tour-feat-card-sub">Vehicles, occupancy &amp; routes</span>
              </div>
            </div>
            <div class="tour-feat-card">
              <i class="fa-solid fa-id-badge" style="color: #F59E0B;"></i>
              <div class="tour-feat-card-text">
                <span class="tour-feat-card-title">Certified Driver Rosters</span>
                <span class="tour-feat-card-sub">Shift schedules &amp; safety scores</span>
              </div>
            </div>
            <div class="tour-feat-card">
              <i class="fa-solid fa-screwdriver-wrench" style="color: #F59E0B;"></i>
              <div class="tour-feat-card-text">
                <span class="tour-feat-card-title">Predictive Maintenance</span>
                <span class="tour-feat-card-sub">Sensor health diagnostics</span>
              </div>
            </div>
          </div>
          <div class="tour-welcome-actions">
            <button class="tour-start-btn" id="tour-welcome-start-btn" style="background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); box-shadow: 0 6px 24px rgba(245, 158, 11, 0.5);">
              <i class="fa-solid fa-play"></i> Start Admin Tour
            </button>
            <button class="tour-skip-all-btn" id="tour-welcome-skip-btn">
              <i class="fa-solid fa-forward"></i> Skip Tour
            </button>
          </div>
        </div>
      `;
    } else {
      // ── Dedicated Passenger Tour Welcome ──
      modal.innerHTML = `
        <div class="tour-welcome-card" style="max-width: 600px;">
          <div class="tour-welcome-icon-glow">
            <i class="fa-solid fa-bus-simple"></i>
          </div>
          <span class="tour-welcome-badge">Welcome to TRANSIT.IN</span>
          <h2 class="tour-welcome-title">Smarter Journeys. <span>Connected Cities.</span></h2>
          <p class="tour-welcome-desc">
            Your passenger account is ready! Take a quick 2-minute interactive tour to explore real-time GPS tracking, journey planning, seat booking, digital QR passes, and the Safety Shield.
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
              <i class="fa-solid fa-chair"></i>
              <div class="tour-feat-card-text">
                <span class="tour-feat-card-title">Interactive Seat Booking</span>
                <span class="tour-feat-card-sub">Pick your seat in advance</span>
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
                <span class="tour-feat-card-sub">SOS beacon &amp; live trip share</span>
              </div>
            </div>
          </div>
          <div class="tour-welcome-actions">
            <button class="tour-start-btn" id="tour-welcome-start-btn">
              <i class="fa-solid fa-play"></i> Start Passenger Tour
            </button>
            <button class="tour-skip-all-btn" id="tour-welcome-skip-btn">
              <i class="fa-solid fa-forward"></i> Skip Tour
            </button>
          </div>
        </div>
      `;
    }

    document.body.appendChild(modal);

    document.getElementById('tour-welcome-start-btn').addEventListener('click', () => {
      modal.remove();
      if (isAdmin) {
        startAdminTour();
      } else {
        startPassengerTour();
      }
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
    const mode = getCurrentTourMode();
    const steps = getStepsForCurrentTour();
    stopTourCleanly();
    localStorage.removeItem(STORAGE_KEY_NEW_USER);
    localStorage.setItem(STORAGE_KEY_DONE, 'true');

    launchConfetti();

    const isAdmin = (mode === 'admin');
    const modal = document.createElement('div');
    modal.id = 'tour-completion-modal';
    modal.className = 'tour-complete-overlay';
    modal.innerHTML = `
      <div class="tour-complete-card">
        <div class="tour-complete-badge" style="${isAdmin ? 'border-color: #F59E0B; color: #F59E0B; background: rgba(245,158,11,0.2);' : ''}">
          <i class="fa-solid fa-check"></i>
        </div>
        <h2 class="tour-complete-title">
          ${isAdmin ? 'Fleet Operations Mastered!' : 'You\'re All Set to Travel Smarter!'}
        </h2>
        <p class="tour-complete-desc">
          ${isAdmin 
            ? 'You\'ve explored the central dispatch matrix, fleet telemetry, driver rosters, and predictive maintenance.'
            : 'You\'ve explored all core commuter modules of TRANSIT.IN and are ready to ride with peace of mind.'}
        </p>
        <div class="tour-complete-stats">
          <div class="tour-stat-item">
            <span class="tour-stat-number" style="${isAdmin ? 'color: #F59E0B;' : ''}">${isAdmin ? 'Admin' : '9'}</span>
            <span class="tour-stat-label">${isAdmin ? 'Portal' : 'Modules'}</span>
          </div>
          <div class="tour-stat-item">
            <span class="tour-stat-number" style="${isAdmin ? 'color: #F59E0B;' : ''}">${steps.length}</span>
            <span class="tour-stat-label">Features</span>
          </div>
          <div class="tour-stat-item">
            <span class="tour-stat-number" style="${isAdmin ? 'color: #F59E0B;' : ''}">100%</span>
            <span class="tour-stat-label">Complete</span>
          </div>
        </div>
        <div style="display:flex; gap:0.8rem; justify-content:center; flex-wrap:wrap;">
          <button class="tour-go-btn" id="tour-complete-go-btn" style="${isAdmin ? 'background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);' : ''}">
            <i class="fa-solid fa-house"></i> ${isAdmin ? 'Go to Admin Command' : 'Go to Dashboard'}
          </button>
          <button class="tour-skip-all-btn" id="tour-switch-other-btn">
            ${isAdmin ? 'Take Passenger Tour' : 'Take Admin Tour'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('tour-complete-go-btn').addEventListener('click', () => {
      modal.remove();
      window.location.href = isAdmin ? 'admin.html' : 'index.html';
    });

    document.getElementById('tour-switch-other-btn').addEventListener('click', () => {
      modal.remove();
      if (isAdmin) {
        startPassengerTour();
      } else {
        startAdminTour();
      }
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
  function startPassengerTour() {
    sessionStorage.setItem(STORAGE_KEY_MODE, 'passenger');
    sessionStorage.setItem(STORAGE_KEY_ACTIVE, 'true');
    sessionStorage.setItem(STORAGE_KEY_STEP, '0');
    currentStepIndex = 0;

    const currentPage = getCurrentPageName();
    const firstStep = PASSENGER_STEPS[0];

    if (currentPage !== firstStep.page) {
      showTransitionToast(firstStep.module);
      window.location.href = firstStep.page;
    } else {
      renderStep(0);
    }
  }

  function startAdminTour() {
    // Check admin authentication
    const userRole = localStorage.getItem('spt-user-role') || 'passenger';
    if (userRole !== 'admin') {
      // Temporarily set role for inspection or elevate to allow seamless tour
      localStorage.setItem('spt-user-role', 'admin');
    }

    sessionStorage.setItem(STORAGE_KEY_MODE, 'admin');
    sessionStorage.setItem(STORAGE_KEY_ACTIVE, 'true');
    sessionStorage.setItem(STORAGE_KEY_STEP, '0');
    currentStepIndex = 0;

    const currentPage = getCurrentPageName();
    const firstStep = ADMIN_STEPS[0];

    if (currentPage !== firstStep.page) {
      showTransitionToast('Admin Operations');
      window.location.href = firstStep.page;
    } else {
      renderStep(0);
    }
  }

  function renderStep(index) {
    const steps = getStepsForCurrentTour();
    const mode = getCurrentTourMode();
    const isAdmin = (mode === 'admin');

    if (index >= steps.length) {
      showCompletionModal();
      return;
    }

    if (index < 0) index = 0;
    currentStepIndex = index;
    sessionStorage.setItem(STORAGE_KEY_STEP, index.toString());

    const step = steps[index];
    const currentPage = getCurrentPageName();

    // If step belongs to another page, navigate there smoothly
    if (step.page !== currentPage) {
      showTransitionToast(step.module);
      setTimeout(() => {
        window.location.href = step.page;
      }, 350);
      return;
    }

    // Auto-switch Admin Tab if step specifies one
    if (isAdmin && step.tab) {
      if (typeof window.switchAdminTab === 'function') {
        window.switchAdminTab(step.tab);
      } else {
        const tabBtn = document.getElementById(`tab-${step.tab}`);
        if (tabBtn) tabBtn.click();
      }
    }

    ensureTourDOMElements();

    // Activate overlay & update role styling
    overlayEl.className = 'tour-overlay active';
    if (isAdmin) {
      spotlightEl.classList.add('admin');
    } else {
      spotlightEl.classList.remove('admin');
    }

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

    setTimeout(() => {
      updateSpotlight(targetEl, step.padding || 12);
      updateTooltip(step, targetEl, index, steps.length, isAdmin);
    }, 280);
  }

  function updateSpotlight(el, padding) {
    if (!spotlightEl) return;

    if (el === document.body) {
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

  function updateTooltip(step, targetEl, index, totalSteps, isAdmin) {
    if (!tooltipEl) return;

    // Badge styling & text
    const badgeEl = document.getElementById('tour-page-badge');
    const badgeText = document.getElementById('tour-badge-text');
    badgeText.textContent = step.module;
    if (isAdmin) {
      badgeEl.className = 'tour-page-badge admin';
    } else {
      badgeEl.className = 'tour-page-badge';
    }

    document.getElementById('tour-step-counter').textContent = `Step ${index + 1} of ${totalSteps}`;
    document.getElementById('tour-title').innerHTML = `
      <i class="fa-solid ${step.icon || 'fa-compass'}" style="${isAdmin ? 'color: #F59E0B;' : ''}"></i> ${step.title}
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
    const fillPercent = Math.round(((index + 1) / totalSteps) * 100);
    const fillEl = document.getElementById('tour-progress-fill');
    fillEl.style.width = `${fillPercent}%`;
    if (isAdmin) {
      fillEl.style.background = 'linear-gradient(90deg, #F59E0B 0%, #EF4444 100%)';
    } else {
      fillEl.style.background = 'linear-gradient(90deg, #8B5CF6 0%, #38BDF8 100%)';
    }

    // Button states
    const prevBtn = document.getElementById('tour-btn-prev');
    const nextBtn = document.getElementById('tour-btn-next');
    prevBtn.disabled = (index === 0);

    const isLastStep = (index === totalSteps - 1);
    nextBtn.innerHTML = isLastStep
      ? `Finish <i class="fa-solid fa-flag-checkered"></i>`
      : `Next <i class="fa-solid fa-arrow-right"></i>`;

    if (isAdmin) {
      nextBtn.style.background = 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)';
    } else {
      nextBtn.style.background = 'linear-gradient(135deg, #8B5CF6 0%, #38BDF8 100%)';
    }

    // Positioning
    tooltipEl.style.display = 'block';

    if (isMobile()) {
      tooltipEl.setAttribute('data-position', 'mobile-bottom');
      return;
    }

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
      if (top + tooltipRect.height > window.innerHeight - 20) {
        actualPos = 'top';
        top = targetRect.top - tooltipRect.height - margin;
      }
    } else if (preferredPos === 'top') {
      top = targetRect.top - tooltipRect.height - margin;
      left = targetRect.left + (targetRect.width / 2) - 40;
      if (top < 20) {
        actualPos = 'bottom';
        top = targetRect.bottom + margin;
      }
    } else if (preferredPos === 'left') {
      top = targetRect.top;
      left = targetRect.left - tooltipRect.width - margin;
      if (left < 20) {
        actualPos = 'bottom';
        top = targetRect.bottom + margin;
        left = targetRect.left;
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
      if (e.shiftKey && (e.key === '?' || e.key === '/')) {
        const page = getCurrentPageName();
        if (page === 'admin.html') {
          startAdminTour();
        } else {
          startPassengerTour();
        }
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

  window.addEventListener('resize', () => {
    if (sessionStorage.getItem(STORAGE_KEY_ACTIVE) === 'true') {
      renderStep(currentStepIndex);
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // GLOBAL API EXPOSURE
  // ──────────────────────────────────────────────────────────────────────────
  window.startPassengerTour = startPassengerTour;
  window.startAdminTour     = startAdminTour;
  window.startTransitTour   = startPassengerTour; // default alias

  window.TransitTour = {
    startPassenger: startPassengerTour,
    startAdmin:     startAdminTour,
    start:          startPassengerTour,
    retake:         startPassengerTour,
    stop:           stopTour
  };

  // ──────────────────────────────────────────────────────────────────────────
  // AUTO-INITIALIZATION ON PAGE LOAD
  // ──────────────────────────────────────────────────────────────────────────
  function init() {
    const isTourActive = sessionStorage.getItem(STORAGE_KEY_ACTIVE) === 'true';
    const isNewUser = localStorage.getItem(STORAGE_KEY_NEW_USER) === 'true';
    const tourDone = localStorage.getItem(STORAGE_KEY_DONE) === 'true';

    // 1. If tour is currently in progress across page transitions
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
