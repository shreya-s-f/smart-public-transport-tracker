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

// Supported Cities Route Catalog Seed
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

// Persistent Database Collections
db.routes = db.routes || cityRoutesCatalog;

db.drivers = db.drivers || [
    { id: 'DRV-441', name: 'Ramesh Kumar', license: 'DL-KA-2018-9941', phone: '+91 98765 43210', assignedBus: 'KA-01-F-2024', route: '500A (Electric)', city: 'Bangalore', shift: '06:00 AM – 02:00 PM', rating: 4.9, status: 'On Route' },
    { id: 'DRV-108', name: 'Suresh Patil', license: 'DL-KA-2016-1108', phone: '+91 98765 43211', assignedBus: 'KA-29-B-5510', route: 'BGK-01 (City Shuttle)', city: 'Bagalkot', shift: '08:00 AM – 04:00 PM', rating: 5.0, status: 'On Route' },
    { id: 'DRV-309', name: 'Devendra Singh', license: 'DL-DL-2019-3309', phone: '+91 98765 43212', assignedBus: 'DL-01-A-4412', route: '507 (Express)', city: 'Delhi', shift: '02:00 PM – 10:00 PM', rating: 4.8, status: 'Scheduled' },
    { id: 'DRV-512', name: 'Anand Shinde', license: 'DL-MH-2020-5512', phone: '+91 98765 43213', assignedBus: 'MH-02-B-9910', route: 'BEST-301 (Coastal)', city: 'Mumbai', shift: '06:00 AM – 02:00 PM', rating: 4.9, status: 'On Route' },
    { id: 'DRV-220', name: 'Karthik Rao', license: 'DL-TN-2017-8820', phone: '+91 98765 43214', assignedBus: 'TN-01-G-3390', route: 'MTC-23C (Metro)', city: 'Chennai', shift: '10:00 AM – 06:00 PM', rating: 4.7, status: 'Scheduled' }
];

db.cities = db.cities || [
    { name: 'Delhi', state: 'National Capital Territory', activeFleet: 84, routesCount: 12, status: 'Active', authority: 'DTC / DIMTS', fareBase: '₹15' },
    { name: 'Mumbai', state: 'Maharashtra', activeFleet: 72, routesCount: 10, status: 'Active', authority: 'BEST Undertaking', fareBase: '₹20' },
    { name: 'Bangalore', state: 'Karnataka', activeFleet: 90, routesCount: 14, status: 'Active', authority: 'BMTC Volvo & EV', fareBase: '₹25' },
    { name: 'Bagalkot', state: 'Karnataka', activeFleet: 28, routesCount: 6, status: 'Active', authority: 'NWKRTC Smart City', fareBase: '₹10' },
    { name: 'Hyderabad', state: 'Telangana', activeFleet: 65, routesCount: 9, status: 'Active', authority: 'TSRTC Pushpak', fareBase: '₹20' },
    { name: 'Chennai', state: 'Tamil Nadu', activeFleet: 58, routesCount: 8, status: 'Active', authority: 'MTC Express & EV', fareBase: '₹15' },
    { name: 'Pune', state: 'Maharashtra', activeFleet: 48, routesCount: 7, status: 'Active', authority: 'PMPML Rainbow BRTS', fareBase: '₹15' }
];

const defaultLostFoundSeed = [
    {
        id: 'LF-2026-114',
        type: 'lost',
        item: 'Black Dell ThinkPad Laptop Bag',
        category: 'Bags & Backpacks',
        busNumber: 'KA-01-FA-4421',
        route: '500D (Hebbal to Silk Board)',
        location: 'Rear Row Seat 28',
        description: 'Contains charger, notebook and company ID badge.',
        reporterName: 'Aditya Verma',
        reporterPhone: '+91 98451 22334',
        holdingDepot: 'Majestic Depot Locker #12',
        status: 'Safeguarded at Depot Hub',
        claimed: false,
        date: '2026-11-02'
    },
    {
        id: 'LF-2026-115',
        type: 'found',
        item: 'Titan Automatic Men Watch (Silver)',
        category: 'Keys & Watches',
        busNumber: 'DL-01-EXP-507',
        route: 'Route 507 (Delhi Okhla to CP)',
        location: 'Found on window sill seat 12',
        description: 'Silver steel strap Titan watch found during evening sweep.',
        reporterName: 'Driver Devendra Singh (Staff)',
        reporterPhone: '+91 91234 56789',
        holdingDepot: 'Okhla Depot Security Desk',
        status: 'Safeguarded at Depot Hub',
        claimed: false,
        date: '2026-11-03'
    },
    {
        id: 'LF-2026-098',
        type: 'lost',
        item: 'Brown Leather Fossil Wallet',
        category: 'Wallets & Identity Cards',
        busNumber: 'MH-01-BT-301',
        route: 'BEST-301 (CSMT to BKC)',
        location: 'Near middle exit door',
        description: 'Brown Fossil wallet with driving license and SBI metro debit card.',
        reporterName: 'Rohit Kulkarni',
        reporterPhone: '+91 99200 44556',
        holdingDepot: 'Dadar Depot Office',
        status: 'Claimed by Owner',
        claimed: true,
        date: '2026-11-01'
    },
    {
        id: 'LF-2026-116',
        type: 'found',
        item: 'Boat Airdopes Wireless Earbuds (Black case)',
        category: 'Electronics & Phones',
        busNumber: 'KA-29-B-5510',
        route: 'BGK-01 (Bagalkot Navanagar to Bus Stand)',
        location: 'Under seat 4',
        description: 'Black charging case with both wireless earbuds inside.',
        reporterName: 'Conductor Basavaraj (Staff)',
        reporterPhone: '+91 98800 11223',
        holdingDepot: 'Bagalkot Old Bus Stand Control Room',
        status: 'Safeguarded at Depot Hub',
        claimed: false,
        date: '2026-11-04'
    }
];

if (!Array.isArray(db.lostFound) || !db.lostFound.length || !db.lostFound[0].type) {
    db.lostFound = defaultLostFoundSeed;
}
save();

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

// ============================================================================
// TRANSIT NETWORK MANAGEMENT: ROUTES, DRIVERS & CITIES
// ============================================================================

// Routes Catalog & Management
app.get('/api/routes', (req, res) => {
    const cityQuery = req.query.city;
    if (cityQuery && cityQuery.toLowerCase() !== 'all') {
        const foundCity = Object.keys(db.routes || {}).find(c => c.toLowerCase() === cityQuery.toLowerCase());
        const routes = (foundCity && db.routes[foundCity]) ? db.routes[foundCity] : (db.routes['Delhi'] || []);
        return res.json({
            success: true,
            city: foundCity || cityQuery,
            count: routes.length,
            routes: routes.map(r => ({ ...r, city: foundCity || cityQuery }))
        });
    }

    // Return all routes aggregated across all operating cities
    const allRoutes = [];
    for (const [cityName, rList] of Object.entries(db.routes || {})) {
        if (Array.isArray(rList)) {
            rList.forEach(r => allRoutes.push({ ...r, city: cityName }));
        }
    }
    res.json({
        success: true,
        city: 'all',
        count: allRoutes.length,
        routes: allRoutes
    });
});

app.get('/api/routes/:id', (req, res) => {
    const routeId = String(req.params.id).trim().toLowerCase();
    let found = null;
    for (const [cityName, rList] of Object.entries(db.routes || {})) {
        if (Array.isArray(rList)) {
            const r = rList.find(x => String(x.id).toLowerCase() === routeId);
            if (r) {
                found = { ...r, city: cityName };
                break;
            }
        }
    }
    if (found) {
        res.json({ success: true, route: found });
    } else {
        res.status(404).json({ success: false, error: `Route ${req.params.id} not found` });
    }
});

app.post('/api/routes', (req, res) => {
    const { id, name, city, type, category, fare, frequency, stops, status, firstBus, lastBus } = req.body || {};
    if (!id || !name) {
        return res.status(400).json({ success: false, error: 'Route ID and Route Name/Path are required' });
    }
    const targetCity = (city || 'Delhi').trim();
    if (!db.routes) db.routes = {};
    if (!db.routes[targetCity]) {
        db.routes[targetCity] = [];
    }

    let parsedStops = [];
    if (Array.isArray(stops)) {
        parsedStops = stops;
    } else if (typeof stops === 'string' && stops.trim()) {
        parsedStops = stops.split(/[,➔\->]+/).map(s => s.trim()).filter(Boolean);
    }
    if (!parsedStops.length) {
        parsedStops = [name];
    }

    const newRoute = {
        id: String(id).trim(),
        name: String(name).trim(),
        type: type || 'Electric',
        category: category || 'Standard',
        stops: parsedStops,
        fare: Number(fare) || 25,
        frequency: frequency || 'Every 15 min',
        status: status || 'On Time',
        firstBus: firstBus || '06:00 AM',
        lastBus: lastBus || '10:30 PM',
        city: targetCity
    };

    const existingIndex = db.routes[targetCity].findIndex(r => String(r.id).toLowerCase() === String(id).toLowerCase());
    if (existingIndex >= 0) {
        db.routes[targetCity][existingIndex] = { ...db.routes[targetCity][existingIndex], ...newRoute };
    } else {
        db.routes[targetCity].push(newRoute);
    }

    // Update routesCount for the city if registered in db.cities
    if (Array.isArray(db.cities)) {
        const cityRecord = db.cities.find(c => c.name.toLowerCase() === targetCity.toLowerCase());
        if (cityRecord) {
            cityRecord.routesCount = db.routes[targetCity].length;
        }
    }

    save();
    res.status(201).json({ success: true, message: 'Route registered successfully', route: newRoute });
});

app.delete('/api/routes/:id', (req, res) => {
    const routeId = String(req.params.id).trim().toLowerCase();
    let deleted = false;
    let foundCity = null;

    if (db.routes) {
        for (const [cityName, rList] of Object.entries(db.routes)) {
            if (Array.isArray(rList)) {
                const idx = rList.findIndex(r => String(r.id).toLowerCase() === routeId);
                if (idx >= 0) {
                    rList.splice(idx, 1);
                    deleted = true;
                    foundCity = cityName;
                    break;
                }
            }
        }
    }

    if (deleted) {
        if (foundCity && Array.isArray(db.cities)) {
            const cityRecord = db.cities.find(c => c.name.toLowerCase() === foundCity.toLowerCase());
            if (cityRecord) {
                cityRecord.routesCount = db.routes[foundCity].length;
            }
        }
        save();
        return res.json({ success: true, message: `Route ${req.params.id} removed successfully` });
    }
    return res.status(404).json({ success: false, error: `Route ${req.params.id} not found` });
});

// Drivers Management Endpoints
app.get('/api/drivers', (req, res) => {
    res.json({ success: true, count: (db.drivers || []).length, data: db.drivers || [] });
});

app.post('/api/drivers', (req, res) => {
    const { name, license, phone, assignedBus, route, city, shift, rating, status } = req.body || {};
    if (!name || !String(name).trim()) {
        return res.status(400).json({ success: false, error: 'Driver full name is required' });
    }
    const driverCity = city || 'Delhi';
    const newDriver = {
        id: req.body.id || ('DRV-' + Math.floor(100 + Math.random() * 900)),
        name: String(name).trim(),
        license: license || `DL-${driverCity.slice(0, 2).toUpperCase()}-2024-${Math.floor(1000 + Math.random() * 9000)}`,
        phone: phone || '+91 98765 43210',
        assignedBus: assignedBus || 'IN-01-EB-1001',
        route: route || 'City Express Line',
        city: driverCity,
        shift: shift || '06:00 AM – 02:00 PM',
        rating: Number(rating) || 5.0,
        status: status || 'On Route'
    };

    if (!Array.isArray(db.drivers)) db.drivers = [];
    db.drivers.unshift(newDriver);
    save();
    res.status(201).json({ success: true, message: 'Driver onboarded successfully', data: newDriver });
});

app.patch('/api/drivers/:id', (req, res) => {
    if (!Array.isArray(db.drivers)) db.drivers = [];
    const driver = db.drivers.find(d => String(d.id).toLowerCase() === String(req.params.id).toLowerCase());
    if (!driver) return res.status(404).json({ success: false, error: 'Driver record not found' });
    for (const field of ['name', 'license', 'phone', 'assignedBus', 'route', 'city', 'shift', 'rating', 'status']) {
        if (req.body[field] !== undefined) driver[field] = req.body[field];
    }
    save();
    res.json({ success: true, message: 'Driver details updated', data: driver });
});

app.delete('/api/drivers/:id', (req, res) => {
    if (!Array.isArray(db.drivers)) db.drivers = [];
    const idx = db.drivers.findIndex(d => String(d.id).toLowerCase() === String(req.params.id).toLowerCase());
    if (idx >= 0) {
        const removed = db.drivers.splice(idx, 1)[0];
        save();
        return res.json({ success: true, message: `Driver ${removed.name} deleted successfully`, data: removed });
    }
    res.status(404).json({ success: false, error: 'Driver not found' });
});

// Operating Cities Endpoints
app.get('/api/cities', (req, res) => {
    res.json({ success: true, count: (db.cities || []).length, data: db.cities || [] });
});

app.post('/api/cities', (req, res) => {
    const { name, state, activeFleet, routesCount, status, authority, fareBase } = req.body || {};
    if (!name || !String(name).trim()) {
        return res.status(400).json({ success: false, error: 'City name is required' });
    }
    const cityName = String(name).trim();
    if (!Array.isArray(db.cities)) db.cities = [];
    if (!db.routes) db.routes = {};
    if (!db.routes[cityName]) {
        db.routes[cityName] = [];
    }

    const existingIdx = db.cities.findIndex(c => c.name.toLowerCase() === cityName.toLowerCase());
    const cityRecord = {
        name: cityName,
        state: state || 'Urban Metropolitan Zone',
        activeFleet: Number(activeFleet) || 25,
        routesCount: Number(routesCount) || db.routes[cityName].length || 1,
        status: status || 'Active',
        authority: authority || `${cityName} Smart Transport Authority`,
        fareBase: fareBase || '₹15'
    };

    if (existingIdx >= 0) {
        db.cities[existingIdx] = { ...db.cities[existingIdx], ...cityRecord };
    } else {
        db.cities.push(cityRecord);
    }
    save();
    res.status(201).json({ success: true, message: 'City registered successfully', data: cityRecord });
});

app.delete('/api/cities/:name', (req, res) => {
    if (!Array.isArray(db.cities)) db.cities = [];
    const cityName = String(req.params.name).trim().toLowerCase();
    const idx = db.cities.findIndex(c => c.name.toLowerCase() === cityName);
    if (idx >= 0) {
        const removed = db.cities.splice(idx, 1)[0];
        // Also remove city routes if present
        if (db.routes && db.routes[removed.name]) {
            delete db.routes[removed.name];
        }
        save();
        return res.json({ success: true, message: `City ${removed.name} removed from operating network`, data: removed });
    }
    res.status(404).json({ success: false, error: 'City not found' });
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
    let list = Array.isArray(db.lostFound) ? [...db.lostFound] : [];
    if (req.query.type && req.query.type !== 'all') {
        const queryType = req.query.type.toLowerCase();
        list = list.filter(item => (item.type || 'lost').toLowerCase() === queryType);
    }
    if (req.query.claimed !== undefined) {
        const isClaimed = req.query.claimed === 'true';
        list = list.filter(item => item.claimed === isClaimed);
    }
    res.json({ success: true, count: list.length, data: list });
});

app.post('/api/lost-found', (req, res) => {
    const b = req.body || {};
    const itemTitle = (b.item || b.title || '').trim();
    if (!itemTitle) {
        return res.status(400).json({ success: false, error: 'Item description/title is required' });
    }
    const type = (b.type || 'lost').toLowerCase();
    const newLF = {
        id: b.id || ('LF-' + Date.now().toString().slice(-4)),
        type: type === 'found' ? 'found' : 'lost',
        item: itemTitle,
        category: b.category || 'Personal Belongings',
        busNumber: b.busNumber || b.bus || 'N/A',
        route: b.route || 'City Transit',
        location: b.location || (b.bus ? `Bus ${b.bus}` : 'Transit Vehicle / Terminal'),
        description: b.description || b.desc || 'Reported via smart portal',
        reporterName: b.reporterName || b.commuter || (b.phone ? `Commuter (${b.phone})` : 'Commuter'),
        reporterPhone: b.reporterPhone || b.phone || '+91 98765 00000',
        holdingDepot: b.holdingDepot || (type === 'found' ? 'Central Station Depot Office' : 'Not Recovered Yet'),
        status: b.status || (type === 'found' ? 'Safeguarded at Depot Hub' : 'Search in Progress'),
        claimed: b.claimed === true || false,
        date: b.date || new Date().toISOString().split('T')[0]
    };

    if (!Array.isArray(db.lostFound)) db.lostFound = [];
    db.lostFound.unshift(newLF);
    save();
    res.status(201).json({
        success: true,
        message: `${type === 'found' ? 'Found' : 'Lost'} item logged successfully`,
        data: newLF
    });
});

app.patch('/api/lost-found/:id', (req, res) => {
    if (!Array.isArray(db.lostFound)) db.lostFound = [];
    const item = db.lostFound.find(l => String(l.id).toLowerCase() === String(req.params.id).toLowerCase());
    if (!item) return res.status(404).json({ success: false, error: 'Item record not found' });
    if (req.body.claimed !== undefined) item.claimed = req.body.claimed;
    if (req.body.status) item.status = req.body.status;
    if (req.body.holdingDepot) item.holdingDepot = req.body.holdingDepot;
    if (req.body.location) item.location = req.body.location;
    save();
    res.json({ success: true, message: 'Lost item status updated', data: item });
});

app.delete('/api/lost-found/:id', (req, res) => {
    if (!Array.isArray(db.lostFound)) db.lostFound = [];
    const idx = db.lostFound.findIndex(l => String(l.id).toLowerCase() === String(req.params.id).toLowerCase());
    if (idx >= 0) {
        const removed = db.lostFound.splice(idx, 1)[0];
        save();
        return res.json({ success: true, message: `Item ${removed.item} removed from repository`, data: removed });
    }
    res.status(404).json({ success: false, error: 'Item not found' });
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
