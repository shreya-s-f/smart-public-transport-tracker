/**
 * Transit.IN - Enterprise Mobility REST API & Static Web Server
 * Built with Express & CORS
 * Run: node server.js   (http://localhost:5000)
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = __dirname;

// Middleware
app.use(cors());
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true }));

// Persistent DB
const FILE = path.join(__dirname, 'db.json');
const db = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : { users: {}, feedback: [] };
const save = () => {
    try {
        fs.writeFileSync(FILE, JSON.stringify(db, null, 2), 'utf8');
    } catch (err) {
        console.error('Error saving db.json:', err);
    }
};

const rid = p => p + '-' + crypto.randomInt(1000, 9999);
const hash = (pw, salt = crypto.randomBytes(16).toString('hex')) => ({
    salt,
    h: crypto.scryptSync(pw, salt, 32).toString('hex')
});

const newUser = email => ({
    profile: {
        name: email.split('@')[0],
        email,
        phone: '+91 98765 43210',
        city: 'Bengaluru',
        location: 'Bengaluru, India',
        userType: 'Daily Commuter',
        emergencyName: 'Emergency Contact',
        emergencyPhone: '+91 91234 56789',
        bio: 'Transit.IN regular commuter exploring sustainable and electric public transport.',
        avatar: null,
        emailVerified: true
    },
    wallet: { balance: 480, upiId: 'shreya@okhdfcbank', methods: ['•••• 4242'], transactions: [] },
    trips: [],
    tickets: [],
    password: null,
    otherSessions: 1,
    settings: {
        notifications: { delays: true, arrival: true, offers: true, email: true, emergency: true },
        security: { twoFactor: true, highGps: true, anonymize: true }
    }
});

// Seed default user if not exists
if (!db.users['shreya.f@example.com']) {
    db.users['shreya.f@example.com'] = newUser('shreya.f@example.com');
    save();
}


db.complaints = db.complaints || [
    { id: 'CMP-2026-9041', commuter: 'Shreya F', category: 'AC Temperature', busNumber: 'KA-01-FA-4421', status: 'In Review', priority: 'Medium', timestamp: '2026-11-02 11:20 AM', notes: 'Cabin temperature reported warm on Route 500D.' },
    { id: 'CMP-2026-8812', commuter: 'Aditya V', category: 'Rash Driving', busNumber: 'DL-01-EXP-507', status: 'Under Investigation', priority: 'High', timestamp: '2026-11-02 09:45 AM', notes: 'Speeding reported on Ring Road curve.' }
];

db.lostFound = db.lostFound || [
    { id: 'LF-2026-114', item: 'Black Dell Laptop Bag', busNumber: 'KA-01-FA-4421', route: '500D (Hebbal to Silk Board)', status: 'Safeguarded at Depot 4', claimed: false, date: '2026-11-02' },
    { id: 'LF-2026-098', item: 'Titan Automatic Wristwatch', busNumber: 'MH-01-BT-301', route: 'BEST-301 (CSMT to BKC)', status: 'Claimed by Owner', claimed: true, date: '2026-11-01' }
];

db.maintenance = db.maintenance || [
    { busId: 'KA-01-FA-4421', route: '500D', healthScore: 92, batteryBrake: 'Brake Pad Wear 22%', nextService: 'In 14 days', status: 'Healthy' },
    { busId: 'DL-01-EXP-507', route: '507', healthScore: 78, batteryBrake: 'Coolant Flow Low', nextService: 'In 3 days', status: 'Attention Needed' },
    { busId: 'MH-01-BT-301', route: 'BEST-301', healthScore: 96, batteryBrake: 'Battery Cell 98%', nextService: 'In 28 days', status: 'Optimal' }
];

// In-Memory Seed Data for Global Platform
const globalTickets = [];
const incidentReports = [];
const sosDistressLogs = [];

// Supported Cities Route Catalog
const cityRoutesCatalog = {
    'Delhi': [
        { id: '507', name: 'Okhla Phase 1 ➔ Connaught Place', type: 'Electric', category: 'Express', stops: ['Okhla Phase 1', 'Nehru Place', 'Moolchand', 'Lajpat Nagar', 'India Gate', 'Connaught Place'], fare: 40, frequency: 'Every 10 min', status: 'On Time', firstBus: '05:30 AM', lastBus: '11:15 PM' },
        { id: 'Airport-Exp', name: 'New Delhi Railway Station ➔ IGI Terminal 3', type: 'AC', category: 'Airport Express', stops: ['New Delhi Station', 'Shivaji Stadium', 'Dhaula Kuan', 'Delhi Aerocity', 'IGI Airport T3'], fare: 60, frequency: 'Every 8 min', status: 'On Time', firstBus: '04:45 AM', lastBus: '11:45 PM' },
        { id: 'GL-23', name: 'ISBT Kashmiri Gate ➔ Anand Vihar ISBT', type: 'Electric', category: 'Metro Feeder', stops: ['Kashmiri Gate', 'Red Fort', 'Delhi Gate', 'Preet Vihar', 'Anand Vihar'], fare: 25, frequency: 'Every 12 min', status: 'On Time', firstBus: '06:00 AM', lastBus: '10:30 PM' },
        { id: '390', name: 'Mayur Vihar Phase 1 ➔ Central Secretariat', type: 'AC', category: 'City Express', stops: ['Mayur Vihar 1', 'Akshardham', 'Indraprastha', 'Mandi House', 'Central Secretariat'], fare: 35, frequency: 'Every 15 min', status: 'Delayed', firstBus: '06:15 AM', lastBus: '10:45 PM' },
        { id: 'Metro-F1', name: 'Hauz Khas Metro ➔ Saket City Center', type: 'Electric', category: 'Metro Feeder', stops: ['Hauz Khas', 'IIT Gate', 'Panchsheel Park', 'Saket Metro', 'Select Citywalk'], fare: 15, frequency: 'Every 7 min', status: 'On Time', firstBus: '06:00 AM', lastBus: '11:00 PM' }
    ],
    'Mumbai': [
        { id: 'BEST-301', name: 'CSMT ➔ Bandra Kurla Complex (BKC)', type: 'Electric', category: 'Express', stops: ['CSMT Station', 'Byculla', 'Dadar TT', 'Sion Circle', 'BKC Diamond Market'], fare: 35, frequency: 'Every 10 min', status: 'On Time', firstBus: '05:45 AM', lastBus: '11:30 PM' },
        { id: 'AC-10', name: 'Colaba Bus Station ➔ Worli Seaface', type: 'AC', category: 'Coastal Express', stops: ['Colaba', 'Regal Cinema', 'Nariman Point', 'Marine Drive', 'Haji Ali', 'Worli Seaface'], fare: 45, frequency: 'Every 12 min', status: 'On Time', firstBus: '06:00 AM', lastBus: '11:00 PM' },
        { id: 'C-71', name: 'Andheri East Station ➔ SEEPZ / Powai', type: 'Electric', category: 'IT Feeder', stops: ['Andheri East', 'Chakala Metro', 'MIDC Central Road', 'SEEPZ Gate 1', 'Powai Lake'], fare: 20, frequency: 'Every 8 min', status: 'On Time', firstBus: '06:30 AM', lastBus: '10:45 PM' },
        { id: 'BEST-42', name: 'Borivali Station West ➔ Thane Station West', type: 'Standard', category: 'Suburban Link', stops: ['Borivali West', 'National Park', 'Ghodbunder Road', 'Kapurbawdi', 'Thane Station'], fare: 50, frequency: 'Every 15 min', status: 'Delayed', firstBus: '05:30 AM', lastBus: '11:00 PM' }
    ],
    'Bangalore': [
        { id: 'V-500D', name: 'Hebbal Flyover ➔ Central Silk Board', type: 'AC', category: 'Outer Ring Road Volvo', stops: ['Hebbal', 'Nagawara', 'Manyata Tech Park', 'Marathahalli', 'Bellandur', 'HSR Layout', 'Silk Board'], fare: 55, frequency: 'Every 8 min', status: 'On Time', firstBus: '05:30 AM', lastBus: '11:30 PM' },
        { id: 'KIA-9', name: 'Kempegowda Bus Station (Majestic) ➔ KIA Airport', type: 'AC', category: 'Airport Express', stops: ['Majestic', 'Mekhri Circle', 'Hebbal', 'Yelahanka Bypass', 'KIA Airport Terminal 1 & 2'], fare: 260, frequency: 'Every 15 min', status: 'On Time', firstBus: '24 Hours', lastBus: '24 Hours' },
        { id: '335E', name: 'Majestic ➔ Whitefield ITPL', type: 'Electric', category: 'IT Express', stops: ['Majestic', 'Corporation', 'Domlur', 'HAL Main Gate', 'Marathahalli', 'Kundalahalli', 'ITPL'], fare: 50, frequency: 'Every 10 min', status: 'Delayed', firstBus: '06:00 AM', lastBus: '10:45 PM' },
        { id: 'G-4', name: 'Brigade Road / MG Road ➔ Bannerghatta National Park', type: 'Electric', category: 'City Corridor', stops: ['MG Road Metro', 'Dairy Circle', 'Jayadeva Hospital', 'IIM Bangalore', 'Gottigere', 'Bannerghatta Zoo'], fare: 40, frequency: 'Every 12 min', status: 'On Time', firstBus: '06:30 AM', lastBus: '09:30 PM' }
    ],
    'Bagalkot': [
        { id: 'BGK-01', name: 'Navanagar Bus Stand ➔ Old Bagalkot Bus Stand', type: 'Electric', category: 'City Shuttle', stops: ['Navanagar Sector 1', 'DC Office Complex', 'Kallolli Cross', 'Vidyagiri Circle', 'Railway Station', 'Old Bus Stand'], fare: 15, frequency: 'Every 10 min', status: 'On Time', firstBus: '06:00 AM', lastBus: '10:00 PM' },
        { id: 'BGK-02', name: 'Navanagar ➔ Kerur / Badami Heritage Route', type: 'Standard', category: 'Heritage Express', stops: ['Navanagar Sector 25', 'Muchakhandi Cross', 'Gaddanakeri Cross', 'Badami Caves Junction', 'Kerur Bus Stand'], fare: 30, frequency: 'Every 20 min', status: 'On Time', firstBus: '06:30 AM', lastBus: '09:30 PM' },
        { id: 'BGK-03', name: 'Vidyagiri Campus ➔ BVVS Engineering College Circle', type: 'Electric', category: 'Student Shuttle', stops: ['Vidyagiri Bus Stop', 'Hunasikatti Layout', 'Basaveshwar Hospital', 'BVVS Engineering Campus'], fare: 10, frequency: 'Every 8 min', status: 'On Time', firstBus: '07:30 AM', lastBus: '08:00 PM' }
    ],
    'Hyderabad': [
        { id: 'TSRTC-100M', name: 'Secunderabad Station ➔ Hitec City Cyber Towers', type: 'AC', category: 'IT Express', stops: ['Secunderabad', 'Paradise', 'Begumpet', 'Panjagutta', 'Jubilee Hills', 'Madhapur', 'Cyber Towers'], fare: 45, frequency: 'Every 10 min', status: 'On Time', firstBus: '05:45 AM', lastBus: '11:15 PM' },
        { id: 'Pushpak-Airport', name: 'JBS Jubilee Bus Station ➔ RGIA Shamshabad Airport', type: 'AC', category: 'Airport Luxury', stops: ['JBS', 'Secunderabad', 'Tarnaka', 'LB Nagar', 'RGIA Airport'], fare: 250, frequency: 'Every 20 min', status: 'On Time', firstBus: '24 Hours', lastBus: '24 Hours' },
        { id: '216-IT', name: 'Mehdipatnam ➔ Gachibowli Financial District', type: 'Electric', category: 'Green Corridor', stops: ['Mehdipatnam', 'Tolichowki', 'Shaikpet Dargah', 'Gachibowli Stadium', 'Wipro Circle'], fare: 35, frequency: 'Every 12 min', status: 'On Time', firstBus: '06:15 AM', lastBus: '10:30 PM' }
    ],
    'Chennai': [
        { id: 'MTC-23C', name: 'Ayanavaram ➔ Besant Nagar Beach', type: 'Electric', category: 'Metro Corridor', stops: ['Ayanavaram', 'Kilpauk Medical College', 'Thousand Lights', 'Adyar Signal', 'Besant Nagar'], fare: 30, frequency: 'Every 12 min', status: 'On Time', firstBus: '05:30 AM', lastBus: '10:45 PM' },
        { id: 'MTC-570', name: 'CMBT Koyambedu ➔ Siruseri IT Park (OMR)', type: 'AC', category: 'OMR Express', stops: ['CMBT', 'Ashok Nagar', 'Guindy', 'Tidel Park', 'Sholinganallur', 'Siruseri IT Park'], fare: 55, frequency: 'Every 10 min', status: 'Delayed', firstBus: '06:00 AM', lastBus: '11:00 PM' }
    ],
    'Pune': [
        { id: 'Rainbow-102', name: 'Katraj Bus Terminal ➔ Swargate BRTS Hub', type: 'Electric', category: 'BRTS Priority', stops: ['Katraj', 'Dhankawadi', 'Padmavati', 'Swargate Terminal'], fare: 20, frequency: 'Every 6 min', status: 'On Time', firstBus: '05:30 AM', lastBus: '11:30 PM' },
        { id: 'Hinjawadi-348', name: 'Pune Railway Station ➔ Hinjawadi Phase 3', type: 'AC', category: 'IT Express', stops: ['Pune Station', 'Shivajinagar', 'Aundh', 'Wakad Bridge', 'Hinjawadi Phase 1', 'Phase 3 Circle'], fare: 50, frequency: 'Every 10 min', status: 'On Time', firstBus: '06:00 AM', lastBus: '11:00 PM' }
    ]
};

// Response Helpers
const ok = (res, d = { ok: true }) => { save(); res.json(d); };
const bad = (res, m, c = 400) => res.status(c).json({ error: m });

// Commuter Authentication & Context Middleware
const commuterContext = (req, res, next) => {
    let email = (req.header('x-user-email') || req.query.email || '').trim().toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        email = 'shreya.f@example.com';
    }
    if (!db.users[email]) {
        db.users[email] = newUser(email);
        save();
    }
    req.u = db.users[email];
    next();
};

// ============================================================================
// PROFILE & ACCOUNT ENDPOINTS (from profile-backend.js / extracted server.js)
// ============================================================================

app.get('/api/profile', commuterContext, (req, res) => res.json(req.u.profile));

app.put('/api/profile', commuterContext, (req, res) => {
    const b = req.body, p = req.u.profile;
    if (!b.name || !String(b.name).trim()) return bad(res, 'Name is required');
    if (!/^\S+@\S+\.\S+$/.test(b.email || '')) return bad(res, 'Enter a valid email');
    for (const k of ['name', 'email', 'phone', 'city', 'userType', 'location', 'emergencyName', 'emergencyPhone', 'bio']) {
        if (b[k] !== undefined) p[k] = String(b[k]).slice(0, 300);
    }
    ok(res, p);
});

app.put('/api/profile/avatar', commuterContext, (req, res) => {
    const a = req.body.avatar;
    if (!/^data:image\/(png|jpe?g|webp|gif);base64,/.test(a || '')) return bad(res, 'Invalid image');
    req.u.profile.avatar = a;
    ok(res, req.u.profile);
});

app.delete('/api/profile/avatar', commuterContext, (req, res) => {
    req.u.profile.avatar = null;
    ok(res, req.u.profile);
});

// Trips
app.get('/api/trips', commuterContext, (req, res) => res.json(req.u.trips));

app.post('/api/trips/seed', commuterContext, (req, res) => {
    if (!req.u.trips.length && Array.isArray(req.body)) {
        req.u.trips = req.body.slice(0, 50);
    }
    ok(res, req.u.trips);
});

// Wallet
app.get('/api/wallet', commuterContext, (req, res) => res.json(req.u.wallet));

app.post('/api/wallet/recharge', commuterContext, (req, res) => {
    const a = Number(req.body.amount);
    if (!(a > 0) || a > 10000) return bad(res, 'Enter an amount between ₹1 and ₹10,000');
    const w = req.u.wallet;
    w.balance = +(w.balance + a).toFixed(2);
    w.transactions.unshift({
        id: rid('TXN'),
        desc: 'Instant Wallet Recharge (UPI/Card)',
        amount: a,
        date: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        type: 'credit'
    });
    w.transactions = w.transactions.slice(0, 50);
    ok(res, w);
});

app.post('/api/wallet/methods', commuterContext, (req, res) => {
    const v = String(req.body.value || '').trim();
    if (!v) return bad(res, 'Enter a UPI ID or card number');
    const w = req.u.wallet;
    if (v.includes('@')) {
        w.upiId = v;
    } else if (/^\d{12,19}$/.test(v.replace(/\s/g, ''))) {
        w.methods.push('•••• ' + v.replace(/\s/g, '').slice(-4));
    } else {
        return bad(res, 'Not a valid UPI ID or card number');
    }
    ok(res, w);
});

// Settings (Notifications & Security)
for (const k of ['notifications', 'security']) {
    app.get('/api/settings/' + k, commuterContext, (req, res) => res.json(req.u.settings[k]));
    app.put('/api/settings/' + k, commuterContext, (req, res) => {
        for (const f of Object.keys(req.u.settings[k])) {
            if (typeof req.body[f] === 'boolean') req.u.settings[k][f] = req.body[f];
        }
        ok(res, req.u.settings[k]);
    });
}

app.post('/api/security/password', commuterContext, (req, res) => {
    const { current, next } = req.body, u = req.u;
    if (!next || next.length < 6) return bad(res, 'Password must be at least 6 characters');
    if (u.password && hash(current || '', u.password.salt).h !== u.password.h) {
        return bad(res, 'Current password is incorrect', 401);
    }
    u.password = hash(next);
    ok(res);
});

app.post('/api/security/sessions/terminate', commuterContext, (req, res) => {
    req.u.otherSessions = 0;
    ok(res);
});

app.delete('/api/history', commuterContext, (req, res) => ok(res));

// Support Tickets & Community Feedback
app.get('/api/tickets', commuterContext, (req, res) => res.json(req.u.tickets));

app.post('/api/tickets', commuterContext, (req, res) => {
    const { category, route, description } = req.body;
    if (!category || !route || !description) return bad(res, 'All fields are required');
    const t = {
        id: rid('TKT'),
        category,
        route,
        description: String(description).slice(0, 1000),
        status: 'Under Review',
        createdAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    req.u.tickets.unshift(t);
    ok(res, t);
});

app.get('/api/feedback', (req, res) => res.json(db.feedback.slice(0, 20)));

app.post('/api/feedback', (req, res) => {
    const { stars, category, author, comment } = req.body;
    if (!(stars >= 1 && stars <= 5) || !comment) return bad(res, 'Rating and comment are required');
    const f = {
        id: rid('REV'),
        stars: +stars,
        category,
        author: String(author || 'Commuter').slice(0, 60),
        comment: String(comment).slice(0, 500),
        date: 'Just Now'
    };
    db.feedback.unshift(f);
    ok(res, f);
});

app.post('/api/auth/logout', (req, res) => ok(res));

// ============================================================================
// CORE TRANSIT PLATFORM REST API ENDPOINTS
// ============================================================================

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        status: "online",
        connected: true,
        server: "Transit.IN Enterprise Mobility Backend API",
        version: "3.5.0",
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        port: PORT,
        activeCities: Object.keys(cityRoutesCatalog),
        totalUsersRegistered: Object.keys(db.users).length,
        totalFeedbackReviews: db.feedback.length
    });
});

// Routes Catalog
app.get('/api/routes', (req, res) => {
    const city = req.query.city || 'Delhi';
    const routes = cityRoutesCatalog[city] || cityRoutesCatalog['Delhi'];
    res.json({
        success: true,
        city: city,
        count: routes.length,
        routes: routes
    });
});

app.get('/api/routes/:id', (req, res) => {
    const routeId = req.params.id;
    let found = null;
    for (const city of Object.keys(cityRoutesCatalog)) {
        const r = cityRoutesCatalog[city].find(x => x.id.toLowerCase() === routeId.toLowerCase());
        if (r) {
            found = { ...r, city };
            break;
        }
    }
    if (found) {
        res.json({ success: true, route: found });
    } else {
        res.status(404).json({ success: false, error: `Route ${routeId} not found` });
    }
});

// Live GPS Telemetry
app.get('/api/track/:id', (req, res) => {
    const routeId = req.params.id;
    const hashVal = Math.abs(routeId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
    const occupancy = 35 + (hashVal % 50);
    res.json({
        success: true,
        routeId: routeId,
        telemetry: {
            vehicleReg: `IN-01-EB-${1000 + (hashVal % 8999)}`,
            pilot: "Vikram Singh (Rating: 4.95 ⭐)",
            speedKmH: 38 + (hashVal % 8),
            crowdOccupancy: occupancy,
            crowdStatus: occupancy > 75 ? 'Crowded' : occupancy > 45 ? 'Moderate' : 'Seats Available',
            seatsAvailable: Math.max(2, Math.round(48 * (1 - occupancy / 100))),
            gpsSignal: "Active Real-Time Stream",
            lastPing: new Date().toISOString()
        }
    });
});

// Auth Login
app.post('/api/auth/login', (req, res) => {
    const { email, password, role } = req.body;
    const em = (email || '').trim().toLowerCase();
    const user = db.users[em];

    if (user && user.password && user.password.h) {
        if (hash(password, user.password.salt).h === user.password.h) {
            return res.json({
                success: true,
                message: "Authentication successful",
                token: "JWT-TOKEN-" + Math.random().toString(36).substr(2, 10).toUpperCase(),
                user: user.profile
            });
        }
    }

    // Permissive demo login for commuters
    if (role !== 'admin' && em) {
        if (!db.users[em]) {
            db.users[em] = newUser(em);
            save();
        }
        return res.json({
            success: true,
            message: "Welcome commuter (demo verified)",
            token: "JWT-COMMUTER-DEMO",
            user: db.users[em].profile
        });
    }

    res.status(401).json({ success: false, error: "Invalid credentials. Please verify your email and password." });
});

// Auth Signup
app.post('/api/auth/signup', (req, res) => {
    const { name, email, password, phone, city } = req.body;
    if (!email || !name) return bad(res, "Name and email are required");
    const em = email.trim().toLowerCase();
    if (db.users[em]) return res.status(409).json({ success: false, error: "An account with this email already exists" });

    const u = newUser(em);
    u.profile.name = name;
    if (phone) u.profile.phone = phone;
    if (city) u.profile.city = city;
    if (password) u.password = hash(password);
    db.users[em] = u;
    save();

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: u.profile
    });
});

// Auth OTP
app.post('/api/auth/send-otp', (req, res) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    res.json({
        success: true,
        message: `OTP dispatched to ${req.body.email || 'user'}`,
        otp: otp,
        validitySeconds: 300
    });
});

// Book Ticket
app.post('/api/tickets/book', commuterContext, (req, res) => {
    const payload = req.body;
    const ticketId = 'TKT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const newTicket = {
        id: ticketId,
        city: payload.city || 'Delhi',
        route: payload.route || '507',
        passType: payload.passType || 'single',
        boarding: payload.boarding || 'Origin',
        drop: payload.drop || 'Destination',
        seat: payload.seat || '1A',
        passengers: payload.passengers || 1,
        name: payload.name || req.u.profile.name,
        email: payload.email || req.u.profile.email,
        total: payload.total || '₹45.00',
        status: 'Confirmed',
        bookedAt: new Date().toISOString()
    };
    globalTickets.push(newTicket);
    req.u.trips.unshift({
        id: newTicket.id,
        route: newTicket.route,
        city: newTicket.city,
        date: 'Today',
        fare: newTicket.total,
        status: 'Completed',
        from: newTicket.boarding,
        to: newTicket.drop
    });
    save();

    res.status(201).json({
        success: true,
        message: "E-Ticket created and confirmed",
        ticket: newTicket
    });
});

// Alerts
app.get('/api/alerts', (req, res) => {
    const city = req.query.city || 'Delhi';
    const sampleAlerts = [
        { type: 'info', title: 'Normal Operations', message: `All scheduled bus fleets are operating normally in ${city}.`, time: 'Just now', route: 'All Network' },
        { type: 'warning', title: 'Peak Rush Congestion', message: 'Moderate traffic delay (+8m) on main arterial corridors.', time: '12 min ago', route: 'Primary Lines' }
    ];
    const crowdsourced = incidentReports.filter(r => (r.city || 'Delhi').toLowerCase() === city.toLowerCase());
    res.json({ success: true, city: city, alerts: [...crowdsourced, ...sampleAlerts] });
});

app.post('/api/alerts/report', (req, res) => {
    const report = {
        id: 'REP-' + Date.now().toString().slice(-4),
        route: req.body.route || 'Line',
        type: req.body.type || 'traffic',
        title: req.body.title || 'Commuter Incident',
        message: req.body.message || 'Reported delay',
        location: req.body.location || 'Roadway',
        city: req.body.city || 'Delhi',
        time: 'Just now',
        isCrowdsourced: true,
        reportedAt: new Date().toISOString()
    };
    incidentReports.unshift(report);
    res.status(201).json({ success: true, message: "Report broadcasted to commuters", report: report });
});

// Emergency SOS
app.post('/api/safety/sos', (req, res) => {
    const distressLog = {
        id: 'SOS-' + Date.now(),
        city: req.body.city || 'Delhi',
        route: req.body.route || 'Transit',
        timestamp: new Date().toISOString(),
        status: 'DISPATCHED_TO_CONTROL_ROOM'
    };
    sosDistressLogs.push(distressLog);
    res.json({
        success: true,
        message: `🚨 Emergency Beacon Transmitted. ${req.body.city || 'Delhi'} Transit Police Control Room Alerted.`,
        dispatchId: distressLog.id
    });
});

// Weather
app.get('/api/weather', (req, res) => {
    const city = req.query.city || 'Delhi';
    res.json({
        success: true,
        city: city,
        temperature: '28°C',
        condition: 'Clear to Partly Cloudy',
        delayRisk: 'Low (0-4 min)',
        roadVisibility: '8.5 km',
        waterlogging: 'None Reported'
    });
});

// ============================================================================

// ============================================================================
// COMPLAINTS & GRIEVANCE ENDPOINTS
// ============================================================================
app.get('/api/complaints', (req, res) => {
    res.json({ success: true, count: db.complaints.length, data: db.complaints });
});

app.post('/api/complaints', (req, res) => {
    const { category, busNumber, notes, commuter } = req.body || {};
    const newComplaint = {
        id: 'CMP-' + Date.now().toString().slice(-4),
        commuter: commuter || 'Commuter',
        category: category || 'General Grievance',
        busNumber: busNumber || 'Unspecified',
        status: 'Submitted',
        priority: 'Normal',
        timestamp: new Date().toLocaleString(),
        notes: notes || 'No details provided'
    };
    db.complaints.unshift(newComplaint);
    save();
    res.status(201).json({ success: true, message: 'Complaint filed successfully', data: newComplaint });
});

app.patch('/api/complaints/:id', (req, res) => {
    const item = db.complaints.find(c => c.id === req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Complaint not found' });
    if (req.body.status) item.status = req.body.status;
    if (req.body.priority) item.priority = req.body.priority;
    save();
    res.json({ success: true, message: 'Complaint updated', data: item });
});

// ============================================================================
// LOST & FOUND REPOSITORY ENDPOINTS
// ============================================================================
app.get('/api/lost-found', (req, res) => {
    res.json({ success: true, count: db.lostFound.length, data: db.lostFound });
});

app.post('/api/lost-found', (req, res) => {
    const { item, busNumber, route } = req.body || {};
    const newLF = {
        id: 'LF-' + Date.now().toString().slice(-4),
        item: item || 'Unspecified Item',
        busNumber: busNumber || 'N/A',
        route: route || 'N/A',
        status: 'Safeguarded at Depot Hub',
        claimed: false,
        date: new Date().toISOString().split('T')[0]
    };
    db.lostFound.unshift(newLF);
    save();
    res.status(201).json({ success: true, message: 'Lost property registered', data: newLF });
});

app.patch('/api/lost-found/:id', (req, res) => {
    const item = db.lostFound.find(l => l.id === req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Record not found' });
    if (req.body.claimed !== undefined) item.claimed = req.body.claimed;
    if (req.body.status) item.status = req.body.status;
    save();
    res.json({ success: true, message: 'Lost item status updated', data: item });
});

// ============================================================================
// PREDICTIVE FLEET MAINTENANCE ENDPOINTS
// ============================================================================
app.get('/api/maintenance', (req, res) => {
    res.json({ success: true, count: db.maintenance.length, data: db.maintenance });
});

app.post('/api/maintenance', (req, res) => {
    const record = req.body;
    if (!record || !record.busId) return res.status(400).json({ success: false, error: 'busId required' });
    const existing = db.maintenance.findIndex(m => m.busId === record.busId);
    if (existing >= 0) {
        db.maintenance[existing] = { ...db.maintenance[existing], ...record };
    } else {
        db.maintenance.unshift(record);
    }
    save();
    res.json({ success: true, message: 'Maintenance record saved', data: record });
});

// STATIC FILE SERVING
// ============================================================================

app.use(express.static(PUBLIC_DIR, {
    maxAge: 0,
    etag: false
}));

app.use((req, res) => {
    const target = path.join(PUBLIC_DIR, req.path);
    if (fs.existsSync(target) && fs.statSync(target).isFile()) {
        return res.sendFile(target);
    }
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚆 Transit.IN Enterprise Mobility Server is RUNNING!`);
    console.log(`🔗 Local Web App:     http://localhost:${PORT}/index.html`);
    console.log(`🔗 Profile Dashboard: http://localhost:${PORT}/profile.html`);
    console.log(`🔗 Backend Health:    http://localhost:${PORT}/api/health`);
    console.log(`🔗 Profile REST API:  http://localhost:${PORT}/api/profile`);
    console.log(`📡 Backend Status:    CONNECTED & PERSISTING TO db.json`);
    console.log(`=======================================================`);
});
