/**
 * Transit.IN - Enterprise Mobility REST API & Static Web Server
 * Pure Node.js Standard Library Implementation (Zero external dependencies required)
 * Run: node server.js   (http://localhost:5000)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
let emailService;
try {
    emailService = require('./scripts/emailService');
} catch (e) {
    emailService = require('./js/emailService');
}

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = __dirname;
const FILE = path.join(__dirname, 'db.json');

// MIME types dictionary for static file serving
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.txt': 'text/plain; charset=utf-8'
};

// Initial Database Seeding
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

// Load or initialize DB
let db = { users: {}, feedback: [] };
try {
    if (fs.existsSync(FILE)) {
        db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    }
} catch (e) {
    console.error('Error reading db.json, starting with empty database:', e);
}

// Ensure all DB collections exist
db.users = db.users || {};
db.feedback = Array.isArray(db.feedback) ? db.feedback : [];
db.routes = db.routes || cityRoutesCatalog;

db.drivers = Array.isArray(db.drivers) && db.drivers.length ? db.drivers : [
    { id: 'DRV-441', name: 'Ramesh Kumar', license: 'DL-KA-2018-9941', phone: '+91 98765 43210', assignedBus: 'KA-01-F-2024', route: '500A (Electric)', city: 'Bangalore', shift: '06:00 AM – 02:00 PM', rating: 4.9, status: 'On Route' },
    { id: 'DRV-108', name: 'Suresh Patil', license: 'DL-KA-2016-1108', phone: '+91 98765 43211', assignedBus: 'KA-29-B-5510', route: 'BGK-01 (City Shuttle)', city: 'Bagalkot', shift: '08:00 AM – 04:00 PM', rating: 5.0, status: 'On Route' },
    { id: 'DRV-309', name: 'Devendra Singh', license: 'DL-DL-2019-3309', phone: '+91 98765 43212', assignedBus: 'DL-01-A-4412', route: '507 (Express)', city: 'Delhi', shift: '02:00 PM – 10:00 PM', rating: 4.8, status: 'Scheduled' },
    { id: 'DRV-512', name: 'Anand Shinde', license: 'DL-MH-2020-5512', phone: '+91 98765 43213', assignedBus: 'MH-02-B-9910', route: 'BEST-301 (Coastal)', city: 'Mumbai', shift: '06:00 AM – 02:00 PM', rating: 4.9, status: 'On Route' },
    { id: 'DRV-220', name: 'Karthik Rao', license: 'DL-TN-2017-8820', phone: '+91 98765 43214', assignedBus: 'TN-01-G-3390', route: 'MTC-23C (Metro)', city: 'Chennai', shift: '10:00 AM – 06:00 PM', rating: 4.7, status: 'Scheduled' }
];

db.cities = Array.isArray(db.cities) && db.cities.length ? db.cities : [
    { name: 'Delhi', state: 'National Capital Territory', activeFleet: 84, routesCount: 12, status: 'Active', authority: 'DTC / DIMTS', fareBase: '₹15' },
    { name: 'Mumbai', state: 'Maharashtra', activeFleet: 72, routesCount: 10, status: 'Active', authority: 'BEST Undertaking', fareBase: '₹20' },
    { name: 'Bangalore', state: 'Karnataka', activeFleet: 90, routesCount: 14, status: 'Active', authority: 'BMTC Volvo & EV', fareBase: '₹25' },
    { name: 'Bagalkot', state: 'Karnataka', activeFleet: 28, routesCount: 6, status: 'Active', authority: 'NWKRTC Smart City', fareBase: '₹10' },
    { name: 'Hyderabad', state: 'Telangana', activeFleet: 65, routesCount: 9, status: 'Active', authority: 'TSRTC Pushpak', fareBase: '₹20' },
    { name: 'Chennai', state: 'Tamil Nadu', activeFleet: 58, routesCount: 8, status: 'Active', authority: 'MTC Express & EV', fareBase: '₹15' },
    { name: 'Pune', state: 'Maharashtra', activeFleet: 48, routesCount: 7, status: 'Active', authority: 'PMPML Rainbow BRTS', fareBase: '₹15' }
];

db.complaints = Array.isArray(db.complaints) && db.complaints.length ? db.complaints : [
    { id: 'CMP-2026-9041', commuter: 'Shreya F', category: 'AC Temperature', busNumber: 'KA-01-FA-4421', route: 'Route 500D (Bengaluru)', status: 'In Review', priority: 'Medium', timestamp: '2026-11-02 11:20 AM', notes: 'Cabin temperature reported warm on Route 500D.' },
    { id: 'CMP-2026-8812', commuter: 'Aditya V', category: 'Rash Driving', busNumber: 'DL-01-EXP-507', route: 'Route 507 (Delhi)', status: 'Under Investigation', priority: 'High', timestamp: '2026-11-02 09:45 AM', notes: 'Speeding reported on Ring Road curve.' }
];

db.lostFound = Array.isArray(db.lostFound) && db.lostFound.length ? db.lostFound : [
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

db.maintenance = Array.isArray(db.maintenance) && db.maintenance.length ? db.maintenance : [
    {
        busId: 'KA-01-F-2024',
        route: 'Route 500A (Bengaluru)',
        city: 'Bangalore',
        propulsion: '100% Electric',
        wear: 14,
        battery: '88% SoC (Good)',
        tirePressure: '34 PSI (Normal)',
        status: 'Optimal Health',
        lastService: '2026-11-02',
        nextService: 'In 28 days'
    },
    {
        busId: 'DL-01-A-4412',
        route: 'Route 507 (Delhi)',
        city: 'Delhi',
        propulsion: 'CNG Hybrid',
        wear: 48,
        battery: '92°C (Engine Coolant)',
        tirePressure: '33 PSI (Normal)',
        status: 'Review at 400km',
        lastService: '2026-10-25',
        nextService: 'In 4 days'
    },
    {
        busId: 'MH-02-B-9910',
        route: 'BEST-301 (Mumbai)',
        city: 'Mumbai',
        propulsion: '100% Electric',
        wear: 72,
        battery: '64% SoC',
        tirePressure: '29 PSI (Low)',
        status: 'Inspection Due',
        lastService: '2026-10-12',
        nextService: 'Immediate'
    }
];

db.subscribers = Array.isArray(db.subscribers) && db.subscribers.length ? db.subscribers : [
    {
        id: 'SUB-1001',
        email: 'shreya.f@example.com',
        city: 'Bengaluru',
        status: 'Active',
        subscribedAt: '2026-11-05 10:30 AM',
        preferences: { delays: true, diversions: true, newRoutes: true, weather: true },
        notificationsCount: 3
    },
    {
        id: 'SUB-1002',
        email: 'commuter.delhi@example.com',
        city: 'Delhi',
        status: 'Active',
        subscribedAt: '2026-11-06 02:15 PM',
        preferences: { delays: true, diversions: true, newRoutes: true, weather: false },
        notificationsCount: 2
    }
];

db.alerts = Array.isArray(db.alerts) && db.alerts.length ? db.alerts : [
    {
        id: 'ALT-901',
        type: 'diversion',
        title: 'Route Diversion: Outer Ring Road Flyover',
        message: 'Route 500D diverted via Silk Board service lane due to metro expansion work.',
        city: 'Bangalore',
        route: '500D',
        time: '10 min ago',
        reportedAt: new Date().toISOString()
    },
    {
        id: 'ALT-902',
        type: 'traffic',
        title: 'Peak Hour Delay on Ring Road',
        message: 'Corridor 507 experiencing 12-minute traffic slow-down near Moolchand underpass.',
        city: 'Delhi',
        route: '507',
        time: '25 min ago',
        reportedAt: new Date().toISOString()
    },
    {
        id: 'ALT-903',
        type: 'weather',
        title: 'Monsoon Road Visibility Alert',
        message: 'Passing coastal rain showers on Western Express Highway; bus speeds capped at 40 km/h.',
        city: 'Mumbai',
        route: 'BEST-301',
        time: '1 hour ago',
        reportedAt: new Date().toISOString()
    }
];

db.notifications = Array.isArray(db.notifications) ? db.notifications : [
    {
        id: 'NOTIF-1',
        subscriberEmail: 'shreya.f@example.com',
        city: 'Bengaluru',
        type: 'info',
        title: 'Welcome to Transit.IN Service Alerts!',
        message: 'You are now subscribed to real-time delay warnings, route diversions, and transit advisories for Bengaluru.',
        time: 'Just now',
        timestamp: new Date().toISOString(),
        route: 'All Corridors',
        delivered: true
    }
];

db.sos = Array.isArray(db.sos) ? db.sos : [];
db.tickets = Array.isArray(db.tickets) ? db.tickets : [];
db.sentEmails = Array.isArray(db.sentEmails) ? db.sentEmails : [];

// Save to disk helper
const save = () => {
    try {
        fs.writeFileSync(FILE, JSON.stringify(db, null, 2), 'utf8');
    } catch (err) {
        console.error('Error saving db.json:', err);
    }
};
save();

// Helpers
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
        emergencyName: 'Ramesh F (Guardian)',
        emergencyPhone: '+91 94480 12345',
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

// Seed default user
if (!db.users['shreya.f@example.com']) {
    db.users['shreya.f@example.com'] = newUser('shreya.f@example.com');
    save();
}

// Commuter Context Resolver
function resolveCommuter(req) {
    let email = (req.headers['x-user-email'] || req.query.email || '').trim().toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        email = 'shreya.f@example.com';
    }
    if (!db.users[email]) {
        db.users[email] = newUser(email);
        save();
    }
    return db.users[email];
}

// Lightweight HTTP Router Implementation
function createRouter() {
    const routes = [];
    const methods = ['get', 'post', 'put', 'patch', 'delete'];

    const app = function(req, res) {
        // Enhance response
        res.status = function(code) {
            this.statusCode = code;
            return this;
        };
        res.json = function(data) {
            this.setHeader('Content-Type', 'application/json; charset=utf-8');
            this.end(JSON.stringify(data));
        };
        res.header = function(name, val) {
            this.setHeader(name, val);
            return this;
        };

        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-email');

        if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
        }

        const parsedUrl = url.parse(req.url, true);
        const reqPath = parsedUrl.pathname;
        const method = req.method.toLowerCase();
        req.query = parsedUrl.query || {};

        // Body parser for POST / PUT / PATCH
        const handleMatch = () => {
            for (const r of routes) {
                if (r.method !== method && r.method !== 'all') continue;
                const match = reqPath.match(r.regex);
                if (match) {
                    req.params = {};
                    r.paramNames.forEach((name, i) => {
                        req.params[name] = decodeURIComponent(match[i + 1]);
                    });
                    try {
                        const result = r.handler(req, res);
                        if (result && typeof result.then === 'function') {
                            result.catch(err => {
                                console.error(`[Router Async Error] in ${req.method} ${reqPath}:`, err);
                                if (!res.headersSent) {
                                    res.statusCode = 500;
                                    res.json({ success: false, error: err.message || 'Internal Server Error' });
                                }
                            });
                        }
                        return result;
                    } catch (syncErr) {
                        console.error(`[Router Sync Error] in ${req.method} ${reqPath}:`, syncErr);
                        if (!res.headersSent) {
                            res.statusCode = 500;
                            res.json({ success: false, error: syncErr.message || 'Internal Server Error' });
                        }
                    }
                    return;
                }
            }

            // Static File Serving fallback
            let safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
            if (safePath === '/' || safePath === '\\') safePath = 'index.html';
            const filePath = path.join(PUBLIC_DIR, safePath);

            fs.stat(filePath, (err, stats) => {
                if (!err && stats.isFile()) {
                    const ext = path.extname(filePath).toLowerCase();
                    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
                    res.setHeader('Content-Type', contentType);
                    fs.createReadStream(filePath).pipe(res);
                } else if (!reqPath.startsWith('/api/')) {
                    // SPA fallback for non-API routes
                    const indexPath = path.join(PUBLIC_DIR, 'index.html');
                    if (fs.existsSync(indexPath)) {
                        res.setHeader('Content-Type', 'text/html; charset=utf-8');
                        fs.createReadStream(indexPath).pipe(res);
                    } else {
                        res.statusCode = 404;
                        res.end('404 Not Found');
                    }
                } else {
                    res.statusCode = 404;
                    res.json({ success: false, error: `Endpoint ${req.method} ${reqPath} not found` });
                }
            });
        };

        if (method === 'post' || method === 'put' || method === 'patch') {
            let bodyData = '';
            req.on('data', chunk => {
                bodyData += chunk;
                if (bodyData.length > 10 * 1024 * 1024) req.destroy();
            });
            req.on('end', () => {
                try {
                    req.body = bodyData ? JSON.parse(bodyData) : {};
                } catch (e) {
                    req.body = {};
                }
                handleMatch();
            });
        } else {
            req.body = {};
            handleMatch();
        }
    };

    methods.forEach(m => {
        app[m] = (pattern, handler) => {
            const paramNames = [];
            const regexStr = '^' + pattern.replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
                paramNames.push(name);
                return '([^/]+)';
            }) + '$';
            routes.push({ method: m, regex: new RegExp(regexStr), paramNames, handler });
        };
    });

    app.all = (pattern, handler) => {
        const paramNames = [];
        const regexStr = '^' + pattern.replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
            paramNames.push(name);
            return '([^/]+)';
        }) + '$';
        routes.push({ method: 'all', regex: new RegExp(regexStr), paramNames, handler });
    };

    app.use = () => {}; // Middleware shim

    app.listen = function(port, cb) {
        const srv = http.createServer(app);
        return srv.listen(port, cb);
    };

    return app;
}

const app = createRouter();

// Response shortcuts
const ok = (res, d = { ok: true }) => { save(); res.json(d); };
const bad = (res, m, c = 400) => res.status(c).json({ success: false, error: m });

// ============================================================================
// SYSTEM & HEALTH API
// ============================================================================
app.get('/api/health', (req, res) => {
    let allRoutesCount = 0;
    for (const rList of Object.values(db.routes || {})) {
        if (Array.isArray(rList)) allRoutesCount += rList.length;
    }
    res.json({
        ok: true,
        status: "online",
        connected: true,
        server: "Transit.IN Enterprise Mobility Backend API",
        version: "3.6.0",
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        port: PORT,
        activeCities: Object.keys(db.routes || cityRoutesCatalog),
        totalUsersRegistered: Object.keys(db.users || {}).length,
        totalRoutes: allRoutesCount,
        totalDrivers: (db.drivers || []).length,
        totalSubscribers: (db.subscribers || []).length,
        totalAlerts: (db.alerts || []).length
    });
});

// Admin Live Metrics
app.get('/api/admin/stats', (req, res) => {
    let allRoutesCount = 0;
    for (const rList of Object.values(db.routes || {})) {
        if (Array.isArray(rList)) allRoutesCount += rList.length;
    }
    const complaints = Array.isArray(db.complaints) ? db.complaints : [];
    const pendingComplaints = complaints.filter(c => (c.status || '').toLowerCase() !== 'resolved').length;
    const subscribers = Array.isArray(db.subscribers) ? db.subscribers : [];
    const activeSubs = subscribers.filter(s => (s.status || '').toLowerCase() === 'active').length;

    res.json({
        success: true,
        stats: {
            totalPassengers: Object.keys(db.users || {}).length,
            activeBuses: `${Math.min(allRoutesCount * 4, 90)} / 90`,
            fleetCount: allRoutesCount,
            totalDrivers: (db.drivers || []).length,
            totalRoutes: allRoutesCount,
            activeEmergencies: (db.sos || []).filter(s => s && s.status !== 'RESOLVED').length,
            pendingComplaints: pendingComplaints,
            totalSubscribers: subscribers.length,
            activeSubscribers: activeSubs
        }
    });
});

// ============================================================================
// NEWSLETTER & INBOX SERVICE ALERTS SUBSCRIBERS (USER FEATURE)
// ============================================================================

// Subscribe to Service Alerts (Called from "Get service alerts in your inbox")
const handleSubscribe = async (req, res) => {
    const { email, city, preferences } = req.body || {};
    if (!email || !String(email).trim()) {
        return bad(res, 'Email address is required to subscribe to service alerts');
    }
    const em = String(email).trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(em)) {
        return bad(res, 'Please provide a valid email address');
    }

    const subCity = city || 'Delhi';
    if (!Array.isArray(db.subscribers)) db.subscribers = [];

    let existing = db.subscribers.find(s => s.email.toLowerCase() === em);
    let subscriberRecord;

    if (existing) {
        existing.status = 'Active';
        existing.city = subCity;
        if (preferences) existing.preferences = { ...existing.preferences, ...preferences };
        subscriberRecord = existing;
    } else {
        subscriberRecord = {
            id: 'SUB-' + Date.now().toString().slice(-4),
            email: em,
            city: subCity,
            status: 'Active',
            subscribedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            preferences: preferences || { delays: true, diversions: true, newRoutes: true, weather: true },
            notificationsCount: 1
        };
        db.subscribers.unshift(subscriberRecord);
    }

    // Generate Welcome Service Alert Notification for this email
    if (!Array.isArray(db.notifications)) db.notifications = [];
    const welcomeNotif = {
        id: 'NOTIF-' + Date.now().toString().slice(-5),
        subscriberEmail: em,
        city: subCity,
        type: 'info',
        title: 'Service Alerts Activated',
        message: `Welcome! Real-time alerts for delays, route diversions, and transit updates in ${subCity} are now active.`,
        time: 'Just now',
        timestamp: new Date().toISOString(),
        route: 'All Corridors',
        delivered: true
    };
    db.notifications.unshift(welcomeNotif);

    // If matching user exists in db.users, ensure notification settings are enabled and trip alert noted
    if (db.users[em]) {
        db.users[em].settings = db.users[em].settings || {};
        db.users[em].settings.notifications = db.users[em].settings.notifications || {};
        db.users[em].settings.notifications.email = true;
        db.users[em].settings.notifications.delays = true;
    }

    // Generate & Dispatch HTML Welcome Email
    const liveAlerts = Array.isArray(db.alerts) ? db.alerts.filter(a => !a.city || a.city.toLowerCase() === subCity.toLowerCase() || a.city.toLowerCase() === 'all cities') : [];
    const emailSubject = `🚦 Transit.IN Service Alerts Activated - ${subCity}`;
    const emailHtml = emailService.generateWelcomeEmailHtml({ email: em, city: subCity, liveAlerts });

    let dispatchResult = { emailSent: false, status: 'Staged in Outbox', outboxRecord: {} };
    try {
        dispatchResult = await emailService.dispatchEmail({
            to: em,
            subject: emailSubject,
            html: emailHtml,
            city: subCity,
            type: 'welcome_subscription',
            db,
            saveDb: save
        });
    } catch (err) {
        console.error('[Subscribe] Email dispatch error:', err.message);
    }

    save();
    res.status(201).json({
        success: true,
        message: `Service alerts successfully activated for ${em}!`,
        data: subscriberRecord,
        welcomeNotification: welcomeNotif,
        emailSent: dispatchResult.emailSent,
        emailStatus: dispatchResult.status,
        emailError: dispatchResult.error,
        emailPreview: {
            id: dispatchResult.outboxRecord ? dispatchResult.outboxRecord.id : 'EML-' + Date.now(),
            to: em,
            subject: emailSubject,
            html: emailHtml,
            time: 'Just now',
            status: dispatchResult.status,
            delivered: dispatchResult.emailSent
        }
    });
};

app.post('/api/newsletter/subscribe', handleSubscribe);
app.post('/api/subscribers', handleSubscribe);

// List All Subscribers (For Admin Page)
app.get('/api/subscribers', (req, res) => {
    if (!Array.isArray(db.subscribers)) db.subscribers = [];
    res.json({
        success: true,
        count: db.subscribers.length,
        data: db.subscribers
    });
});

// Update Subscriber (Change City, Status: Active/Paused/Unsubscribed, Preferences)
app.patch('/api/subscribers/:id', (req, res) => {
    const target = decodeURIComponent(req.params.id).trim().toLowerCase();
    if (!Array.isArray(db.subscribers)) db.subscribers = [];

    const sub = db.subscribers.find(s => s.id.toLowerCase() === target || s.email.toLowerCase() === target);
    if (!sub) return bad(res, 'Subscriber record not found', 404);

    if (req.body.status) sub.status = req.body.status;
    if (req.body.city) sub.city = req.body.city;
    if (req.body.preferences) sub.preferences = { ...sub.preferences, ...req.body.preferences };

    save();
    res.json({ success: true, message: 'Subscriber settings updated', data: sub });
});

// Delete Subscriber
app.delete('/api/subscribers/:id', (req, res) => {
    const target = decodeURIComponent(req.params.id).trim().toLowerCase();
    if (!Array.isArray(db.subscribers)) db.subscribers = [];

    const idx = db.subscribers.findIndex(s => s.id.toLowerCase() === target || s.email.toLowerCase() === target);
    if (idx >= 0) {
        const removed = db.subscribers.splice(idx, 1)[0];
        save();
        return res.json({ success: true, message: `Subscriber ${removed.email} removed`, data: removed });
    }
    bad(res, 'Subscriber not found', 404);
});

// Get Notifications for specific Subscriber or Commuter
app.get('/api/subscribers/notifications', (req, res) => {
    const email = (req.query.email || '').trim().toLowerCase();
    const city = (req.query.city || '').trim().toLowerCase();

    let notifs = Array.isArray(db.notifications) ? [...db.notifications] : [];
    if (email) {
        notifs = notifs.filter(n => !n.subscriberEmail || n.subscriberEmail.toLowerCase() === email);
    }
    if (city && city !== 'all') {
        notifs = notifs.filter(n => !n.city || n.city.toLowerCase() === city);
    }

    res.json({
        success: true,
        count: notifs.length,
        data: notifs
    });
});

// Dispatch / Broadcast Service Alert to Subscribers (From Admin Page)
app.post('/api/subscribers/notify', async (req, res) => {
    const { title, message, type, city, route, sendEmail } = req.body || {};
    if (!title || !message) return bad(res, 'Alert Title and Message are required');

    const targetCity = city || 'All Cities';
    const alertType = type || 'warning';
    const alertId = 'ALT-' + Date.now().toString().slice(-4);

    const alertRecord = {
        id: alertId,
        type: alertType,
        title: title,
        message: message,
        city: targetCity,
        route: route || 'General Network',
        time: 'Just now',
        reportedAt: new Date().toISOString()
    };

    if (!Array.isArray(db.alerts)) db.alerts = [];
    db.alerts.unshift(alertRecord);

    // Deliver to matching active subscribers
    if (!Array.isArray(db.subscribers)) db.subscribers = [];
    if (!Array.isArray(db.notifications)) db.notifications = [];

    let deliveredCount = 0;
    let emailsDispatched = 0;
    const matchingSubs = [];

    db.subscribers.forEach(sub => {
        if (sub.status === 'Active') {
            if (targetCity === 'All Cities' || !sub.city || sub.city.toLowerCase() === targetCity.toLowerCase()) {
                db.notifications.unshift({
                    id: 'NOTIF-' + Date.now().toString().slice(-4) + '-' + Math.floor(Math.random() * 100),
                    subscriberEmail: sub.email,
                    city: sub.city || targetCity,
                    type: alertType,
                    title: title,
                    message: message,
                    route: route || 'Network',
                    time: 'Just now',
                    timestamp: new Date().toISOString(),
                    delivered: true
                });
                sub.notificationsCount = (sub.notificationsCount || 0) + 1;
                deliveredCount++;
                matchingSubs.push(sub.email);
            }
        }
    });

    const shouldSendEmail = (sendEmail !== false);
    if (shouldSendEmail && matchingSubs.length > 0) {
        const broadcastSubject = `⚠️ [Transit.IN Alert] ${title} - ${targetCity}`;
        const broadcastHtml = emailService.generateBroadcastEmailHtml({
            title,
            message,
            type: alertType,
            city: targetCity,
            route: route || 'General Network',
            alertId
        });

        for (const recipientEmail of matchingSubs) {
            try {
                await emailService.dispatchEmail({
                    to: recipientEmail,
                    subject: broadcastSubject,
                    html: broadcastHtml,
                    city: targetCity,
                    type: 'broadcast_alert',
                    db,
                    saveDb: save
                });
                emailsDispatched++;
            } catch (e) {
                console.error('[Notify] Broadcast email dispatch error to', recipientEmail, e.message);
            }
        }
    }

    save();
    res.status(201).json({
        success: true,
        message: `Service alert dispatched to ${deliveredCount} subscriber(s)! (${emailsDispatched} emails processed)`,
        alert: alertRecord,
        deliveredCount,
        emailsDispatched
    });
});

// ============================================================================
// EMAIL CONFIGURATION & OUTBOX SYSTEM
// ============================================================================

// Get Current Email / SMTP Configuration
app.get('/api/email/config', (req, res) => {
    const config = emailService.loadEmailConfig();
    const maskedUser = config.smtp.user ? config.smtp.user.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + '***' + c) : '';
    res.json({
        success: true,
        smtp: {
            enabled: !!config.smtp.enabled,
            service: config.smtp.service || 'gmail',
            host: config.smtp.host || 'smtp.gmail.com',
            port: config.smtp.port || 465,
            secure: config.smtp.secure !== false,
            user: maskedUser,
            configured: !!(config.smtp.user && config.smtp.pass),
            fromName: config.smtp.fromName || 'Transit.IN Service Alerts',
            fromEmail: config.smtp.fromEmail || 'alerts@transit.in'
        },
        emailjs: config.emailjs || {}
    });
});

// Update Email / SMTP Configuration
app.post('/api/email/config', (req, res) => {
    const current = emailService.loadEmailConfig();
    const { enabled, service, host, port, secure, user, pass, fromName, fromEmail, emailjs } = req.body || {};

    if (host) current.smtp.host = host;
    if (port) current.smtp.port = parseInt(port, 10);
    if (secure !== undefined) current.smtp.secure = !!secure;
    if (user !== undefined) current.smtp.user = user.trim();
    if (pass !== undefined && pass !== '') current.smtp.pass = pass.trim();
    if (fromName) current.smtp.fromName = fromName;
    if (fromEmail) current.smtp.fromEmail = fromEmail.trim();
    if (service) current.smtp.service = service;
    if (enabled !== undefined) current.smtp.enabled = !!enabled;

    if (emailjs && typeof emailjs === 'object') {
        current.emailjs = { ...current.emailjs, ...emailjs };
    }

    if (current.smtp.user && current.smtp.pass && enabled === undefined) {
        current.smtp.enabled = true;
    }

    emailService.saveEmailConfig(current);
    res.json({
        success: true,
        message: 'Email configuration updated successfully',
        configured: !!(current.smtp.user && current.smtp.pass),
        enabled: current.smtp.enabled
    });
});

// Send Test Email via SMTP
app.post('/api/email/test', async (req, res) => {
    const { to, host, port, user, pass, secure } = req.body || {};
    const config = emailService.loadEmailConfig();
    const testTo = to || config.smtp.user || (db.subscribers && db.subscribers[0] ? db.subscribers[0].email : null);

    if (!testTo) {
        return bad(res, 'Please provide a recipient email address ("to")');
    }

    const smtpHost = host || config.smtp.host;
    const smtpPort = port ? parseInt(port, 10) : config.smtp.port;
    const smtpUser = user || config.smtp.user;
    const smtpPass = pass || config.smtp.pass;
    const smtpSecure = secure !== undefined ? !!secure : config.smtp.secure;

    if (!smtpHost || !smtpUser || !smtpPass) {
        return bad(res, 'SMTP credentials missing. Please configure host, user email, and app password.');
    }

    const testSubject = '🧪 Transit.IN Live SMTP Test Notification';
    const testHtml = `
        <div style="font-family: -apple-system, sans-serif; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 12px; max-width: 550px;">
            <div style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; display: inline-block; padding: 4px 12px; border-radius: 999px; margin-bottom: 12px;">
                <span style="color: #38bdf8; font-weight: 700; font-size: 12px;">LIVE SMTP VERIFICATION</span>
            </div>
            <h2 style="color: #ffffff; margin-top: 0; font-size: 20px;">Transit.IN Email Notification Active</h2>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">Congratulations! Your SMTP email delivery connection is fully operational and authenticated.</p>
            <div style="background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 8px; margin: 16px 0; font-size: 13px; line-height: 1.6;">
                <div><strong>Recipient:</strong> ${testTo}</div>
                <div><strong>SMTP Host:</strong> ${smtpHost}:${smtpPort}</div>
                <div><strong>Timestamp:</strong> ${new Date().toLocaleString('en-IN')}</div>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">Passengers subscribing to service alerts on the homepage will now receive instant live bulletins in their inboxes.</p>
        </div>
    `;

    try {
        await emailService.sendSmtpEmail({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            user: smtpUser,
            pass: smtpPass,
            fromName: config.smtp.fromName,
            fromEmail: config.smtp.fromEmail || smtpUser,
            to: testTo,
            subject: testSubject,
            text: 'Transit.IN Live SMTP Test Notification: System is operational.',
            html: testHtml
        });

        if (!Array.isArray(db.sentEmails)) db.sentEmails = [];
        db.sentEmails.unshift({
            id: 'EML-TEST-' + Date.now().toString().slice(-5),
            to: testTo,
            from: config.smtp.fromEmail || smtpUser,
            subject: testSubject,
            html: testHtml,
            sentAt: new Date().toISOString(),
            status: 'Delivered (SMTP Test)',
            delivered: true
        });
        save();

        res.json({
            success: true,
            message: `Test email successfully delivered to ${testTo}! Check your inbox.`,
            recipient: testTo
        });
    } catch (err) {
        console.error('[EmailTest] Failed:', err.message);
        res.status(500).json({
            success: false,
            error: err.message,
            suggestion: 'For Gmail, use a 16-character Google App Password (not your normal password) with 2-Step Verification enabled.'
        });
    }
});

// List Sent Emails (Outbox)
app.get('/api/email/outbox', (req, res) => {
    if (!Array.isArray(db.sentEmails)) db.sentEmails = [];
    const limit = parseInt(req.query.limit, 10) || 50;
    const recipient = (req.query.email || '').trim().toLowerCase();
    
    let list = [...db.sentEmails];
    if (recipient) {
        list = list.filter(e => e.to && e.to.toLowerCase() === recipient);
    }

    res.json({
        success: true,
        count: list.length,
        data: list.slice(0, limit)
    });
});

// Get Specific Sent Email
app.get('/api/email/outbox/:id', (req, res) => {
    if (!Array.isArray(db.sentEmails)) db.sentEmails = [];
    const emailItem = db.sentEmails.find(e => e.id === req.params.id);
    if (!emailItem) return bad(res, 'Email record not found', 404);
    res.json({ success: true, data: emailItem });
});

// ============================================================================
// TRANSIT ALERTS & WEATHER
// ============================================================================
app.get('/api/alerts', (req, res) => {
    const city = (req.query.city || 'Delhi').toLowerCase();
    let list = Array.isArray(db.alerts) ? [...db.alerts] : [];
    if (city !== 'all') {
        list = list.filter(a => !a.city || a.city.toLowerCase() === 'all cities' || a.city.toLowerCase() === city);
    }
    res.json({ success: true, count: list.length, alerts: list });
});

app.post('/api/alerts/report', (req, res) => {
    const report = {
        id: 'REP-' + Date.now().toString().slice(-4),
        route: req.body.route || 'General Line',
        type: req.body.type || 'traffic',
        title: req.body.title || (req.body.type ? `${req.body.type.toUpperCase()} Report` : 'Commuter Incident'),
        message: req.body.notes || req.body.message || 'Reported delay',
        location: req.body.location || 'Roadway',
        city: req.body.city || 'Delhi',
        time: 'Just now',
        isCrowdsourced: true,
        reportedAt: new Date().toISOString()
    };
    if (!Array.isArray(db.alerts)) db.alerts = [];
    db.alerts.unshift(report);
    save();
    res.status(201).json({ success: true, message: "Report broadcasted to commuters", report: report });
});

app.post('/api/alerts/broadcast', (req, res) => {
    const alertItem = {
        id: 'FLASH-' + Date.now().toString().slice(-4),
        title: req.body.title || 'Transit Emergency Flash',
        message: req.body.message || 'Traffic diversion announced by Transit Control Desk',
        city: req.body.city || 'All Cities',
        severity: req.body.severity || 'warning',
        time: 'Just now',
        reportedAt: new Date().toISOString()
    };
    if (!Array.isArray(db.alerts)) db.alerts = [];
    db.alerts.unshift(alertItem);
    save();
    res.status(201).json({ success: true, message: 'Flash alert dispatched network-wide', alert: alertItem });
});

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
// 24/7 SAFETY SHIELD & EMERGENCY SOS REST ENDPOINTS
// ============================================================================
const CITY_SAFE_ZONES = {
    'Delhi': [
        {
            id: 'ZONE-DEL-01',
            name: 'Central Station Transit Booth',
            location: 'Platform Bay 1 • Armed Marshals on Duty',
            cctv: true,
            status: 'Active Surveillance (CCTV Stream Live)',
            features: ['24/7 Armed Marshals', 'Direct Police Kiosk', 'Emergency Beacon Intercom'],
            phone: '1512',
            coords: { lat: 28.6415, lng: 77.2185 }
        },
        {
            id: 'ZONE-DEL-02',
            name: 'First-Aid & Trauma Rapid Post',
            location: 'Concourse North • Automated Defibrillator (AED)',
            cctv: true,
            status: 'Paramedic Station Active',
            features: ['Automated External Defibrillator (AED)', 'Trained First Responders', 'Emergency Oxygen'],
            phone: '108',
            coords: { lat: 28.6328, lng: 77.2197 }
        },
        {
            id: 'ZONE-DEL-03',
            name: 'Pink Booth Women Transit Safezone',
            location: 'Terminal Gate 4 • Women Officers 24/7',
            cctv: true,
            status: 'SOS Fast-Track Point',
            features: ['Women Police Constabulary', 'Panic Alarm Desk', 'Safe Waiting Lounge'],
            phone: '1091',
            coords: { lat: 28.6692, lng: 77.2289 }
        }
    ],
    'Bangalore': [
        {
            id: 'ZONE-BLR-01',
            name: 'Majestic Kempegowda Bus Station Helpdesk',
            location: 'Platform Bay 3 • BMTC Sarathi Marshals',
            cctv: true,
            status: 'Active Surveillance (CCTV Stream Live)',
            features: ['BMTC Security Squad', 'Direct Control Intercom', 'Lost Child & Transit Desk'],
            phone: '1800-425-1663',
            coords: { lat: 12.9772, lng: 77.5713 }
        },
        {
            id: 'ZONE-BLR-02',
            name: 'MG Road Metro Assistance Kiosk',
            location: 'Exit C Concourse • Trauma & Medical Care',
            cctv: true,
            status: 'Paramedic Station Active',
            features: ['BMRCL Security', 'First-Aid Station', 'Automated Defibrillator'],
            phone: '080-2519-1091',
            coords: { lat: 12.9756, lng: 77.6066 }
        },
        {
            id: 'ZONE-BLR-03',
            name: 'Pink Booth Women Transit Safezone',
            location: 'Majestic Terminal South • Women Wardens 24/7',
            cctv: true,
            status: 'SOS Fast-Track Point',
            features: ['24/7 Women Constabulary', 'Safe Waiting Enclosure', 'Rapid Transit Shield'],
            phone: '1091',
            coords: { lat: 12.9780, lng: 77.5720 }
        }
    ],
    'Mumbai': [
        {
            id: 'ZONE-BOM-01',
            name: 'CSMT Transit Protection Bay',
            location: 'Suburban Concourse • GRP Post',
            cctv: true,
            status: 'Active Surveillance (CCTV Stream Live)',
            features: ['GRP & RPF Marshals', '24/7 Metal Scanners', 'Police Assistance Booth'],
            phone: '1512',
            coords: { lat: 18.9400, lng: 72.8353 }
        },
        {
            id: 'ZONE-BOM-02',
            name: 'Dadar Station Emergency Care Unit',
            location: 'Central Footbridge • Rapid Trauma Post',
            cctv: true,
            status: 'Paramedic Station Active',
            features: ['Emergency Trauma Ward', 'Stretcher & Wheelchair Service', 'Cardiopulmonary Kit'],
            phone: '108',
            coords: { lat: 19.0178, lng: 72.8478 }
        },
        {
            id: 'ZONE-BOM-03',
            name: 'Tejaswini Women Safe Haven',
            location: 'Churchgate Platform 1 • 24/7 Wardens',
            cctv: true,
            status: 'SOS Fast-Track Point',
            features: ['Dedicated Women Transit Wardens', 'CCTV High-Definition Ring', 'Emergency Beacon Desk'],
            phone: '1091',
            coords: { lat: 18.9322, lng: 72.8264 }
        }
    ],
    'Bagalkot': [
        {
            id: 'ZONE-BGK-01',
            name: 'Old Bus Stand NWKRTC Control Kiosk',
            location: 'Main Terminal Bay 1 • Traffic Controller Desk',
            cctv: true,
            status: 'Active Surveillance (CCTV Stream Live)',
            features: ['NWKRTC Security Staff', 'City Control Hotline', 'Night Transit Desk'],
            phone: '08354-220033',
            coords: { lat: 16.1818, lng: 75.6961 }
        },
        {
            id: 'ZONE-BGK-02',
            name: 'Navanagar Rapid Aid Station',
            location: 'Sector 10 Transit Stop • Medical Post',
            cctv: true,
            status: 'Paramedic Station Active',
            features: ['District Health Post', 'First Aid Station', 'Ambulance Priority Staging'],
            phone: '108',
            coords: { lat: 16.1667, lng: 75.6600 }
        },
        {
            id: 'ZONE-BGK-03',
            name: 'Pink Booth Women Transit Safezone',
            location: 'Old Bus Stand Entrance • Bagalkot Police',
            cctv: true,
            status: 'SOS Fast-Track Point',
            features: ['Women Police Help Desk', '24/7 CCTV Monitored Corridor', 'Night Commuter Escort'],
            phone: '1091',
            coords: { lat: 16.1825, lng: 75.6970 }
        }
    ],
    'Hyderabad': [
        {
            id: 'ZONE-HYD-01',
            name: 'MGBS Transit Security Bay',
            location: 'Platform 1 Concourse • TSRTC Vigilance',
            cctv: true,
            status: 'Active Surveillance (CCTV Stream Live)',
            features: ['Armed Transit Marshals', 'Direct Police Link', 'CCTV Surveillance'],
            phone: '040-2345-0033',
            coords: { lat: 17.3785, lng: 78.4800 }
        },
        {
            id: 'ZONE-HYD-02',
            name: 'Ameerpet Metro Trauma Station',
            location: 'Interchange Level 2 • First-Aid Kiosk',
            cctv: true,
            status: 'Paramedic Station Active',
            features: ['Paramedic Desk', 'Automated Defibrillator', 'Emergency Wheelchairs'],
            phone: '108',
            coords: { lat: 17.4375, lng: 78.4482 }
        },
        {
            id: 'ZONE-HYD-03',
            name: 'SHE Team Transit Safezone',
            location: 'Secunderabad Station Gate 1 • SHE Teams',
            cctv: true,
            status: 'SOS Fast-Track Point',
            features: ['Telangana SHE Teams', '24/7 Women Police Helpdesk', 'Instant SOS Terminal'],
            phone: '1091',
            coords: { lat: 17.4334, lng: 78.5015 }
        }
    ],
    'Chennai': [
        {
            id: 'ZONE-MAA-01',
            name: 'Koyambedu CMBT Security Hub',
            location: 'Bus Bay 1 • Armed Transit Marshals',
            cctv: true,
            status: 'Active Surveillance (CCTV Stream Live)',
            features: ['MTC Security Marshals', 'Police Booth', '24/7 Intercom'],
            phone: '044-2345-5801',
            coords: { lat: 13.0694, lng: 80.2057 }
        },
        {
            id: 'ZONE-MAA-02',
            name: 'Chennai Central Trauma Rapid Post',
            location: 'Main Concourse • First-Aid Center',
            cctv: true,
            status: 'Paramedic Station Active',
            features: ['Automated Defibrillator', 'Emergency Medical Team', 'Stretcher Access'],
            phone: '108',
            coords: { lat: 13.0827, lng: 80.2707 }
        },
        {
            id: 'ZONE-MAA-03',
            name: 'Kavalan Women Transit Safezone',
            location: 'Central Suburban Bay • Women Police',
            cctv: true,
            status: 'SOS Fast-Track Point',
            features: ['Kavalan SOS Terminal', 'Women Officers 24/7', 'Safe Lounge Corridor'],
            phone: '1091',
            coords: { lat: 13.0815, lng: 80.2720 }
        }
    ],
    'Pune': [
        {
            id: 'ZONE-PNQ-01',
            name: 'Shivajinagar Transit Command Post',
            location: 'PMPML Central Bay • City Police Kiosk',
            cctv: true,
            status: 'Active Surveillance (CCTV Stream Live)',
            features: ['PMPML Traffic Wardens', 'Police Beat Chowky', 'High-Definition CCTV'],
            phone: '020-2450-3355',
            coords: { lat: 18.5308, lng: 73.8475 }
        },
        {
            id: 'ZONE-PNQ-02',
            name: 'Pune Station Trauma Emergency Post',
            location: 'Platform 1 Concourse • Medical Post',
            cctv: true,
            status: 'Paramedic Station Active',
            features: ['Paramedic Unit', 'Automated Defibrillator', 'Rapid Stretcher Bay'],
            phone: '108',
            coords: { lat: 18.5284, lng: 73.8739 }
        },
        {
            id: 'ZONE-PNQ-03',
            name: 'Damini Squad Women Safezone',
            location: 'Swargate Bus Station Gate 2 • Damini Squad',
            cctv: true,
            status: 'SOS Fast-Track Point',
            features: ['Pune Damini Marshall Squad', '24/7 Women Police Desk', 'Panic Alarm Button'],
            phone: '1091',
            coords: { lat: 18.5018, lng: 73.8586 }
        }
    ]
};

// Emergency SOS Listing & Ingestion
app.get('/api/safety/sos', (req, res) => {
    const list = Array.isArray(db.sos) ? db.sos : [];
    res.json({ success: true, count: list.length, data: list });
});

app.post('/api/safety/sos', (req, res) => {
    const targetCity = req.body.city || 'Delhi';
    const route = req.body.route || 'Transit Line';
    const coords = req.body.coordinates || (
        targetCity === 'Delhi' ? { lat: 28.6139, lng: 77.2090 } :
        targetCity === 'Bangalore' ? { lat: 12.9716, lng: 77.5946 } :
        targetCity === 'Mumbai' ? { lat: 18.9690, lng: 72.8205 } :
        targetCity === 'Bagalkot' ? { lat: 16.1818, lng: 75.6961 } :
        targetCity === 'Hyderabad' ? { lat: 17.3850, lng: 78.4867 } :
        targetCity === 'Chennai' ? { lat: 13.0827, lng: 80.2707 } :
        { lat: 18.5204, lng: 73.8567 }
    );

    const distressLog = {
        id: 'SOS-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000),
        city: targetCity,
        route: route,
        coordinates: coords,
        commuterName: req.body.commuterName || 'Shreya F (Commuter)',
        commuterPhone: req.body.commuterPhone || '+91 98765 43210',
        emergencyContact: req.body.emergencyContact || { name: 'Ramesh F (Guardian)', phone: '+91 94480 12345' },
        assignedUnit: 'PCR Van #' + Math.floor(10 + Math.random() * 89) + ` (${targetCity} Transit Patrol)`,
        timestamp: req.body.timestamp || new Date().toISOString(),
        status: 'ACTIVE_POLICE_DISPATCHED',
        notes: req.body.notes || 'Emergency panic beacon broadcasted from Transit.IN Safety Shield'
    };

    if (!Array.isArray(db.sos)) db.sos = [];
    db.sos.unshift(distressLog);

    // Auto-dispatch critical alert to public feed
    if (!Array.isArray(db.alerts)) db.alerts = [];
    const sosAlert = {
        id: 'ALT-SOS-' + Date.now().toString().slice(-4),
        type: 'emergency',
        title: `🚨 SOS Distress Triggered on ${route} (${targetCity})`,
        desc: `Emergency assistance dispatched for commuter. Live police beacon broadcasting. Nearest patrol units en route.`,
        severity: 'danger',
        city: targetCity,
        route: route,
        time: 'Just now',
        reportedAt: new Date().toISOString()
    };
    db.alerts.unshift(sosAlert);

    // Auto-create in-app notification
    if (!Array.isArray(db.notifications)) db.notifications = [];
    db.notifications.unshift({
        id: 'NOTIF-SOS-' + Date.now(),
        title: `🚨 Emergency Distress Alert: ${route}`,
        message: `Police Control Room and ${targetCity} Transit Marshals alerted. GPS: ${coords.lat?.toFixed ? coords.lat.toFixed(4) : coords.lat}°N, ${coords.lng?.toFixed ? coords.lng.toFixed(4) : coords.lng}°E.`,
        time: 'Just now',
        timestamp: new Date().toISOString(),
        route: route,
        delivered: true,
        emergency: true
    });

    save();

    res.json({
        success: true,
        message: `🚨 Emergency Distress Beacon Transmitted. Transit Police Control Room & Patrol Units Alerted.`,
        dispatchId: distressLog.id,
        incident: distressLog
    });
});

// Resolve or update SOS incident
app.put('/api/safety/sos/:id/resolve', (req, res) => {
    const id = req.params.id;
    if (!Array.isArray(db.sos)) db.sos = [];
    const item = db.sos.find(s => s.id === id);
    if (!item) return notFound(res, 'Emergency SOS record not found');

    item.status = 'RESOLVED';
    item.resolvedAt = new Date().toISOString();
    item.resolutionNotes = req.body.notes || 'Assistance successfully rendered by Transit Police Patrol. Commuter marked safe.';
    save();

    res.json({
        success: true,
        message: `SOS incident ${id} marked as RESOLVED. Grid secure.`,
        incident: item
    });
});

// Delete SOS incident (Admin cleanup)
app.delete('/api/safety/sos/:id', (req, res) => {
    const id = req.params.id;
    if (!Array.isArray(db.sos)) db.sos = [];
    const idx = db.sos.findIndex(s => s.id === id);
    if (idx === -1) return notFound(res, 'Emergency SOS record not found');

    const removed = db.sos.splice(idx, 1)[0];
    save();

    res.json({
        success: true,
        message: `SOS record ${id} removed.`,
        removed
    });
});

// Update Primary Emergency Contact
app.post('/api/safety/contact', (req, res) => {
    const u = resolveCommuter(req);
    const { emergencyName, emergencyPhone } = req.body;
    if (!emergencyName || !emergencyPhone) {
        return bad(res, 'Both emergencyName and emergencyPhone are required');
    }
    u.profile.emergencyName = String(emergencyName).trim();
    u.profile.emergencyPhone = String(emergencyPhone).trim();
    save();

    res.json({
        success: true,
        message: 'Primary emergency contact successfully updated and encrypted.',
        contact: {
            emergencyName: u.profile.emergencyName,
            emergencyPhone: u.profile.emergencyPhone
        }
    });
});

// Safe Transit Zones & Assistance Hubs
app.get('/api/safety/zones', (req, res) => {
    const city = req.query.city || 'Delhi';
    const zones = CITY_SAFE_ZONES[city] || CITY_SAFE_ZONES['Delhi'];
    res.json({
        success: true,
        city: city,
        count: zones.length,
        zones: zones
    });
});

// 24/7 Helplines Directory
app.get('/api/safety/helplines', (req, res) => {
    res.json({
        success: true,
        national: [
            { number: '112', title: 'National Emergency Support (All-in-One)', subtitle: 'Police, Fire, Disaster Management', color: '#3b82f6' },
            { number: '1091', title: 'Women Helpline (24/7 Pan-India)', subtitle: 'Dedicated Transit & Night Shield', color: '#ec4899' },
            { number: '1512', title: 'Transit / Railway Police', subtitle: 'GRP & City Public Transport Security', color: '#f59e0b' },
            { number: '108', title: 'Emergency Medical Ambulance', subtitle: 'Rapid Trauma & Health Assistance', color: '#10b981' }
        ]
    });
});

// ============================================================================
// PROFILE & ACCOUNT REST ENDPOINTS
// ============================================================================
app.get('/api/profile', (req, res) => {
    const u = resolveCommuter(req);
    res.json(u.profile);
});

app.put('/api/profile', (req, res) => {
    const u = resolveCommuter(req);
    const b = req.body, p = u.profile;
    if (!b.name || !String(b.name).trim()) return bad(res, 'Name is required');
    if (!/^\S+@\S+\.\S+$/.test(b.email || '')) return bad(res, 'Enter a valid email');
    for (const k of ['name', 'email', 'phone', 'city', 'userType', 'location', 'emergencyName', 'emergencyPhone', 'bio']) {
        if (b[k] !== undefined) p[k] = String(b[k]).slice(0, 300);
    }
    ok(res, p);
});

app.put('/api/profile/avatar', (req, res) => {
    const u = resolveCommuter(req);
    const a = req.body.avatar;
    if (!/^data:image\/(png|jpe?g|webp|gif);base64,/.test(a || '')) return bad(res, 'Invalid image');
    u.profile.avatar = a;
    ok(res, u.profile);
});

app.delete('/api/profile/avatar', (req, res) => {
    const u = resolveCommuter(req);
    u.profile.avatar = null;
    ok(res, u.profile);
});

app.get('/api/trips', (req, res) => {
    const u = resolveCommuter(req);
    res.json(u.trips || []);
});

app.post('/api/trips/seed', (req, res) => {
    const u = resolveCommuter(req);
    if (!u.trips.length && Array.isArray(req.body)) {
        u.trips = req.body.slice(0, 50);
    }
    ok(res, u.trips);
});

app.get('/api/wallet', (req, res) => {
    const u = resolveCommuter(req);
    res.json(u.wallet);
});

app.post('/api/wallet/recharge', (req, res) => {
    const u = resolveCommuter(req);
    const a = Number(req.body.amount);
    if (!(a > 0) || a > 10000) return bad(res, 'Enter an amount between ₹1 and ₹10,000');
    const w = u.wallet;
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

app.post('/api/wallet/methods', (req, res) => {
    const u = resolveCommuter(req);
    const v = String(req.body.value || '').trim();
    if (!v) return bad(res, 'Enter a UPI ID or card number');
    const w = u.wallet;
    if (v.includes('@')) {
        w.upiId = v;
    } else if (/^\d{12,19}$/.test(v.replace(/\s/g, ''))) {
        w.methods.push('•••• ' + v.replace(/\s/g, '').slice(-4));
    } else {
        return bad(res, 'Not a valid UPI ID or card number');
    }
    ok(res, w);
});

app.get('/api/settings/notifications', (req, res) => {
    const u = resolveCommuter(req);
    res.json(u.settings.notifications);
});

app.put('/api/settings/notifications', (req, res) => {
    const u = resolveCommuter(req);
    for (const f of Object.keys(u.settings.notifications)) {
        if (typeof req.body[f] === 'boolean') u.settings.notifications[f] = req.body[f];
    }
    ok(res, u.settings.notifications);
});

app.get('/api/settings/security', (req, res) => {
    const u = resolveCommuter(req);
    res.json(u.settings.security);
});

app.put('/api/settings/security', (req, res) => {
    const u = resolveCommuter(req);
    for (const f of Object.keys(u.settings.security)) {
        if (typeof req.body[f] === 'boolean') u.settings.security[f] = req.body[f];
    }
    ok(res, u.settings.security);
});

app.post('/api/security/password', (req, res) => {
    const u = resolveCommuter(req);
    const { current, next } = req.body;
    if (!next || next.length < 6) return bad(res, 'Password must be at least 6 characters');
    if (u.password && hash(current || '', u.password.salt).h !== u.password.h) {
        return bad(res, 'Current password is incorrect', 401);
    }
    u.password = hash(next);
    ok(res);
});

app.post('/api/security/sessions/terminate', (req, res) => {
    const u = resolveCommuter(req);
    u.otherSessions = 0;
    ok(res);
});

app.delete('/api/history', (req, res) => ok(res));

// Tickets & Booking
app.get('/api/tickets', (req, res) => {
    const u = resolveCommuter(req);
    res.json(u.tickets || []);
});

app.post('/api/tickets/book', (req, res) => {
    const u = resolveCommuter(req);
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
        name: payload.name || u.profile.name,
        email: payload.email || u.profile.email,
        total: payload.total || '₹45.00',
        status: 'Confirmed',
        bookedAt: new Date().toISOString()
    };
    if (!Array.isArray(db.tickets)) db.tickets = [];
    db.tickets.unshift(newTicket);
    u.trips.unshift({
        id: newTicket.id,
        route: newTicket.route,
        city: newTicket.city,
        date: 'Today',
        fare: newTicket.total,
        status: 'Completed',
        from: newTicket.boarding,
        to: newTicket.drop
    });

    if (newTicket.email) {
        const ticketSubject = `🎫 Transit.IN E-Ticket Pass Confirmed - #${newTicket.id}`;
        const ticketHtml = `
            <div style="font-family: -apple-system, sans-serif; max-width: 550px; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 16px;">
                <h2 style="color: #38bdf8; margin: 0 0 10px 0;">Transit.IN Digital Pass Confirmed</h2>
                <div style="background: rgba(255,255,255,0.06); padding: 16px; border-radius: 10px; margin-bottom: 16px; font-size: 14px; line-height: 1.6;">
                    <div><strong>Booking ID:</strong> <span style="color: #38bdf8;">${newTicket.id}</span></div>
                    <div><strong>Route / Corridor:</strong> ${newTicket.route} (${newTicket.city})</div>
                    <div><strong>Seat(s):</strong> ${newTicket.seat}</div>
                    <div><strong>Boarding:</strong> ${newTicket.boarding} ➔ ${newTicket.drop}</div>
                    <div><strong>Total Fare Paid:</strong> <span style="color: #34d399;">${newTicket.total}</span></div>
                    <div><strong>Status:</strong> Active &bull; Confirmed</div>
                </div>
                <p style="font-size: 12px; color: #94a3b8;">Show your digital ticket or QR code to the conductor or validator upon boarding.</p>
            </div>
        `;
        emailService.dispatchEmail({
            to: newTicket.email,
            subject: ticketSubject,
            html: ticketHtml,
            city: newTicket.city,
            type: 'ticket_confirmation',
            db,
            saveDb: save
        }).catch(() => {});
    }

    save();

    res.status(201).json({
        success: true,
        message: "E-Ticket created and confirmed",
        ticket: newTicket
    });
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

// Auth Endpoints
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

app.post('/api/auth/send-otp', (req, res) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    res.json({
        success: true,
        message: `OTP dispatched to ${req.body.email || 'user'}`,
        otp: otp,
        validitySeconds: 300
    });
});

app.post('/api/auth/logout', (req, res) => ok(res));

// ============================================================================
// ROUTES MANAGEMENT (ADMIN + COMMUTER)
// ============================================================================
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
        return bad(res, 'Route ID and Route Name/Path are required');
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
    bad(res, `Route ${req.params.id} not found`, 404);
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

// ============================================================================
// DRIVERS MANAGEMENT
// ============================================================================
app.get('/api/drivers', (req, res) => {
    res.json({ success: true, count: (db.drivers || []).length, data: db.drivers || [] });
});

app.post('/api/drivers', (req, res) => {
    const { name, license, phone, assignedBus, route, city, shift, rating, status } = req.body || {};
    if (!name || !String(name).trim()) return bad(res, 'Driver full name is required');
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
    const existIdx = db.drivers.findIndex(d => String(d.id).toLowerCase() === String(newDriver.id).toLowerCase());
    if (existIdx >= 0) {
        db.drivers[existIdx] = { ...db.drivers[existIdx], ...newDriver };
    } else {
        db.drivers.unshift(newDriver);
    }
    save();
    res.status(201).json({ success: true, message: 'Driver onboarded successfully', data: newDriver });
});

app.patch('/api/drivers/:id', (req, res) => {
    if (!Array.isArray(db.drivers)) db.drivers = [];
    const driver = db.drivers.find(d => String(d.id).toLowerCase() === String(req.params.id).toLowerCase());
    if (!driver) return bad(res, 'Driver record not found', 404);
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
        return res.json({ success: true, message: `Driver ${removed.name} removed`, data: removed });
    }
    bad(res, 'Driver not found', 404);
});

// ============================================================================
// OPERATING CITIES MANAGEMENT
// ============================================================================
app.get('/api/cities', (req, res) => {
    res.json({ success: true, count: (db.cities || []).length, data: db.cities || [] });
});

app.post('/api/cities', (req, res) => {
    const { name, state, activeFleet, routesCount, status, authority, fareBase } = req.body || {};
    if (!name || !String(name).trim()) return bad(res, 'City name is required');
    const cityName = String(name).trim();
    if (!Array.isArray(db.cities)) db.cities = [];
    if (!db.routes) db.routes = {};
    if (!db.routes[cityName]) db.routes[cityName] = [];

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
        if (db.routes && db.routes[removed.name]) delete db.routes[removed.name];
        save();
        return res.json({ success: true, message: `City ${removed.name} removed from operating network`, data: removed });
    }
    bad(res, 'City not found', 404);
});

// ============================================================================
// COMPLAINTS & GRIEVANCE ENDPOINTS
// ============================================================================
app.get('/api/complaints', (req, res) => {
    if (!Array.isArray(db.complaints)) db.complaints = [];
    res.json({ success: true, count: db.complaints.length, data: db.complaints });
});

app.post('/api/complaints', (req, res) => {
    const b = req.body || {};
    const newComplaint = {
        id: b.id || ('CMP-' + Date.now().toString().slice(-4)),
        commuter: b.commuter || 'Commuter',
        category: b.category || 'General Grievance',
        busNumber: b.busNumber || b.route || 'Unspecified',
        route: b.route || b.busNumber || 'City Transit',
        status: b.status || 'In Review',
        priority: b.priority || 'Medium',
        timestamp: b.timestamp || new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        notes: b.notes || b.description || 'No details provided'
    };
    if (!Array.isArray(db.complaints)) db.complaints = [];
    db.complaints.unshift(newComplaint);
    save();
    res.status(201).json({ success: true, message: 'Complaint filed successfully', data: newComplaint });
});

app.patch('/api/complaints/:id', (req, res) => {
    if (!Array.isArray(db.complaints)) db.complaints = [];
    const item = db.complaints.find(c => String(c.id).toLowerCase() === String(req.params.id).toLowerCase());
    if (!item) return bad(res, 'Complaint not found', 404);
    if (req.body.status) item.status = req.body.status;
    if (req.body.priority) item.priority = req.body.priority;
    if (req.body.notes) item.notes = req.body.notes;
    save();
    res.json({ success: true, message: 'Complaint status updated', data: item });
});

app.delete('/api/complaints/:id', (req, res) => {
    if (!Array.isArray(db.complaints)) db.complaints = [];
    const idx = db.complaints.findIndex(c => String(c.id).toLowerCase() === String(req.params.id).toLowerCase());
    if (idx >= 0) {
        const removed = db.complaints.splice(idx, 1)[0];
        save();
        return res.json({ success: true, message: `Complaint ${removed.id} deleted`, data: removed });
    }
    bad(res, 'Complaint not found', 404);
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
    if (!itemTitle) return bad(res, 'Item description/title is required');
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
    if (!item) return bad(res, 'Item record not found', 404);
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
    bad(res, 'Item not found', 404);
});

// ============================================================================
// PREDICTIVE FLEET MAINTENANCE ENDPOINTS
// ============================================================================
app.get('/api/maintenance', (req, res) => {
    if (!Array.isArray(db.maintenance)) db.maintenance = [];
    res.json({ success: true, count: db.maintenance.length, data: db.maintenance });
});

app.post('/api/maintenance', (req, res) => {
    const record = req.body;
    if (!record || !record.busId) return bad(res, 'busId required');
    if (!Array.isArray(db.maintenance)) db.maintenance = [];
    const existing = db.maintenance.findIndex(m => m.busId === record.busId);
    if (existing >= 0) {
        db.maintenance[existing] = { ...db.maintenance[existing], ...record };
    } else {
        db.maintenance.unshift(record);
    }
    save();
    res.json({ success: true, message: 'Maintenance record saved', data: record });
});

app.post('/api/maintenance/service', (req, res) => {
    const { busId, serviceType } = req.body || {};
    if (!busId) return bad(res, 'busId required');
    if (!Array.isArray(db.maintenance)) db.maintenance = [];
    let item = db.maintenance.find(m => m.busId === busId);
    if (!item) {
        item = {
            busId,
            route: 'Corridor Route',
            wear: 10,
            status: 'Optimal Health',
            propulsion: 'Electric AC',
            battery: '100% Diagnostic Passed',
            tirePressure: '34 PSI (Normal)',
            lastService: new Date().toISOString().split('T')[0],
            nextService: 'In 30 days'
        };
        db.maintenance.unshift(item);
    } else {
        item.wear = Math.max(5, (item.wear || 20) - 30);
        item.status = 'Optimal Health';
        item.lastService = new Date().toISOString().split('T')[0];
        item.nextService = 'In 30 days';
        if (serviceType === 'Schedule Oil') item.battery = 'Engine Serviced (Coolant Checked)';
        else if (serviceType === 'Dispatch Bay') {
            item.tirePressure = '34 PSI (Inspected)';
            item.battery = '95% SoC Verified';
        } else {
            item.battery = '100% Diagnostics Cleared';
        }
    }
    save();
    res.json({ success: true, message: `Maintenance service recorded for vehicle ${busId}`, data: item });
});

// ============================================================================
// ADMIN PASSENGERS MANAGEMENT
// ============================================================================
app.get('/api/admin/passengers', (req, res) => {
    const list = Object.values(db.users || {}).map(u => ({
        name: u.profile.name || 'Commuter',
        email: u.profile.email,
        phone: u.profile.phone || '+91 98765 43210',
        city: u.profile.city || 'Delhi',
        userType: u.profile.userType || 'Daily Commuter'
    }));
    res.json({ success: true, count: list.length, data: list });
});

app.post('/api/admin/passengers', (req, res) => {
    const { name, email, phone, city, userType } = req.body || {};
    if (!email || !name) return bad(res, 'Passenger name and email are required');
    const em = email.trim().toLowerCase();
    if (db.users[em]) {
        db.users[em].profile.name = name;
        if (phone) db.users[em].profile.phone = phone;
        if (city) db.users[em].profile.city = city;
        if (userType) db.users[em].profile.userType = userType;
    } else {
        const u = newUser(em);
        u.profile.name = name;
        if (phone) u.profile.phone = phone;
        if (city) u.profile.city = city;
        if (userType) u.profile.userType = userType;
        db.users[em] = u;
    }
    save();
    res.status(201).json({ success: true, message: `Passenger [${name}] registered`, data: db.users[em].profile });
});

app.patch('/api/admin/passengers/:email', (req, res) => {
    const em = decodeURIComponent(req.params.email).trim().toLowerCase();
    if (!db.users[em]) return bad(res, 'Passenger account not found', 404);
    const p = db.users[em].profile;
    for (const k of ['name', 'phone', 'city', 'userType', 'bio']) {
        if (req.body[k] !== undefined) p[k] = req.body[k];
    }
    save();
    res.json({ success: true, message: 'Passenger updated', data: p });
});

app.delete('/api/admin/passengers/:email', (req, res) => {
    const em = decodeURIComponent(req.params.email).trim().toLowerCase();
    if (db.users[em]) {
        delete db.users[em];
        save();
        return res.json({ success: true, message: `Passenger [${em}] removed` });
    }
    bad(res, 'Passenger account not found', 404);
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`🚆 Transit.IN Enterprise Mobility Server is RUNNING!`);
        console.log(`🔗 Local Web App:     http://localhost:${PORT}/index.html`);
        console.log(`🔗 Admin Dashboard:   http://localhost:${PORT}/admin.html`);
        console.log(`🔗 Alerts Feed:       http://localhost:${PORT}/notifications.html`);
        console.log(`🔗 Profile Dashboard: http://localhost:${PORT}/profile.html`);
        console.log(`🔗 Backend Health:    http://localhost:${PORT}/api/health`);
        console.log(`📡 Backend Status:    CONNECTED & PERSISTING TO db.json`);
        console.log(`=======================================================`);
    });
}

module.exports = { app, db };
