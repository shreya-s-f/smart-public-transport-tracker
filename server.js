/**
 * Transit.IN - Enterprise Mobility REST API & Static Web Server
 * Built with native Node.js (Zero-Dependency)
 * Run: node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = __dirname;

// In-Memory Database Store (with sample seed data)
const db = {
    users: [
        {
            name: "Shreya Fakirapur",
            email: "shreya.f@example.com",
            phone: "+91 98765 43210",
            city: "Delhi",
            role: "passenger",
            password: "password123",
            createdAt: new Date().toISOString()
        },
        {
            name: "Transit Admin",
            email: "admin@transit.in",
            phone: "+91 99999 88888",
            city: "Delhi",
            role: "admin",
            password: "admin",
            createdAt: new Date().toISOString()
        }
    ],
    tickets: [],
    incidentReports: [],
    sosDistressLogs: [],
    customRoutes: []
};

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

// MIME types for static assets
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
    '.pdf': 'application/pdf'
};

// Helper: parse JSON body from request
function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                resolve({});
            }
        });
        req.on('error', err => reject(err));
    });
}

// Helper: send JSON response
function sendJson(res, statusCode, data) {
    const jsonStr = JSON.stringify(data);
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(jsonStr),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(jsonStr);
}

// Create HTTP Server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
        });
        res.end();
        return;
    }

    // ========================================================================
    // BACKEND REST API ENDPOINTS
    // ========================================================================

    // 1. Health & Server Status Check
    if (pathname === '/api/health' && method === 'GET') {
        return sendJson(res, 200, {
            status: "online",
            connected: true,
            server: "Transit.IN Enterprise Mobility Backend API",
            version: "3.0.0",
            uptimeSeconds: Math.round(process.uptime()),
            timestamp: new Date().toISOString(),
            port: PORT,
            activeCities: Object.keys(cityRoutesCatalog),
            totalUsersRegistered: db.users.length,
            totalBookingsCount: db.tickets.length
        });
    }

    // 2. Get Routes (by City or All)
    if (pathname === '/api/routes' && method === 'GET') {
        const city = parsedUrl.query.city || 'Delhi';
        const routes = cityRoutesCatalog[city] || cityRoutesCatalog['Delhi'];
        return sendJson(res, 200, {
            success: true,
            city: city,
            count: routes.length,
            routes: routes
        });
    }

    // 3. Get Route by ID
    if (pathname.startsWith('/api/routes/') && method === 'GET') {
        const routeId = decodeURIComponent(pathname.replace('/api/routes/', ''));
        let found = null;
        for (const city of Object.keys(cityRoutesCatalog)) {
            const r = cityRoutesCatalog[city].find(x => x.id.toLowerCase() === routeId.toLowerCase());
            if (r) {
                found = { ...r, city };
                break;
            }
        }
        if (found) {
            return sendJson(res, 200, { success: true, route: found });
        } else {
            return sendJson(res, 404, { success: false, error: `Route ${routeId} not found` });
        }
    }

    // 4. Live Vehicle Telemetry & GPS Stream
    if (pathname.startsWith('/api/track/') && method === 'GET') {
        const routeId = decodeURIComponent(pathname.replace('/api/track/', ''));
        const hash = Math.abs(routeId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
        const occupancy = 35 + (hash % 50);
        return sendJson(res, 200, {
            success: true,
            routeId: routeId,
            telemetry: {
                vehicleReg: `IN-01-EB-${1000 + (hash % 8999)}`,
                pilot: "Vikram Singh (Rating: 4.95 ⭐)",
                speedKmH: 38 + (hash % 8),
                crowdOccupancy: occupancy,
                crowdStatus: occupancy > 75 ? 'Crowded' : occupancy > 45 ? 'Moderate' : 'Seats Available',
                seatsAvailable: Math.max(2, Math.round(48 * (1 - occupancy / 100))),
                gpsSignal: "Active Real-Time Stream",
                lastPing: new Date().toISOString()
            }
        });
    }

    // 5. Auth: Login
    if (pathname === '/api/auth/login' && method === 'POST') {
        const payload = await parseRequestBody(req);
        const user = db.users.find(u => u.email.toLowerCase() === (payload.email || '').toLowerCase());
        
        if (user && user.password === payload.password) {
            return sendJson(res, 200, {
                success: true,
                message: "Authentication successful",
                token: "JWT-TOKEN-" + Math.random().toString(36).substr(2, 10).toUpperCase(),
                user: {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    city: user.city || 'Delhi',
                    phone: user.phone
                }
            });
        } else {
            // Permissive fallback for passenger demo
            if (payload.role !== 'admin' && payload.email) {
                return sendJson(res, 200, {
                    success: true,
                    message: "Welcome commuter (demo verified)",
                    token: "JWT-COMMUTER-DEMO",
                    user: {
                        name: payload.email.split('@')[0],
                        email: payload.email,
                        role: "passenger",
                        city: "Delhi"
                    }
                });
            }
            return sendJson(res, 401, { success: false, error: "Invalid credentials. Please verify your email and password." });
        }
    }

    // 6. Auth: Signup
    if (pathname === '/api/auth/signup' && method === 'POST') {
        const payload = await parseRequestBody(req);
        if (!payload.email || !payload.name) {
            return sendJson(res, 400, { success: false, error: "Name and email are required" });
        }

        const existing = db.users.find(u => u.email.toLowerCase() === payload.email.toLowerCase());
        if (existing) {
            return sendJson(res, 409, { success: false, error: "An account with this email already exists" });
        }

        const newUser = {
            name: payload.name,
            email: payload.email,
            phone: payload.phone || '+91 98765 43210',
            city: payload.city || 'Delhi',
            role: payload.role || 'passenger',
            password: payload.password || 'password123',
            createdAt: new Date().toISOString()
        };
        db.users.push(newUser);

        return sendJson(res, 201, {
            success: true,
            message: "User registered successfully",
            user: { name: newUser.name, email: newUser.email, role: newUser.role, city: newUser.city }
        });
    }

    // 7. Auth: Email OTP Dispatch & Verification
    if (pathname === '/api/auth/send-otp' && method === 'POST') {
        const payload = await parseRequestBody(req);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        return sendJson(res, 200, {
            success: true,
            message: `OTP dispatched to ${payload.email}`,
            otp: otp, // Returned for simulated offline display
            validitySeconds: 300
        });
    }

    // 8. Book Ticket
    if (pathname === '/api/tickets/book' && method === 'POST') {
        const payload = await parseRequestBody(req);
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
            name: payload.name || 'Commuter',
            email: payload.email || 'commuter@example.com',
            total: payload.total || '₹45.00',
            status: 'Confirmed',
            bookedAt: new Date().toISOString()
        };
        db.tickets.push(newTicket);

        return sendJson(res, 201, {
            success: true,
            message: "E-Ticket created and confirmed",
            ticket: newTicket
        });
    }

    // 9. Get User Tickets
    if (pathname === '/api/tickets' && method === 'GET') {
        const email = parsedUrl.query.email;
        const results = email 
            ? db.tickets.filter(t => t.email.toLowerCase() === email.toLowerCase())
            : db.tickets;
        return sendJson(res, 200, { success: true, count: results.length, tickets: results });
    }

    // 10. Commuter Service Alerts & Crowdsourced Reporting
    if (pathname === '/api/alerts' && method === 'GET') {
        const city = parsedUrl.query.city || 'Delhi';
        const sampleAlerts = [
            { type: 'info', title: 'Normal Operations', message: `All scheduled bus fleets are operating normally in ${city}.`, time: 'Just now', route: 'All Network' },
            { type: 'warning', title: 'Peak Rush Congestion', message: 'Moderate traffic delay (+8m) on main arterial corridors.', time: '12 min ago', route: 'Primary Lines' }
        ];
        const crowdsourced = db.incidentReports.filter(r => (r.city || 'Delhi').toLowerCase() === city.toLowerCase());
        return sendJson(res, 200, { success: true, city: city, alerts: [...crowdsourced, ...sampleAlerts] });
    }

    if (pathname === '/api/alerts/report' && method === 'POST') {
        const payload = await parseRequestBody(req);
        const report = {
            id: 'REP-' + Date.now().toString().slice(-4),
            route: payload.route || 'Line',
            type: payload.type || 'traffic',
            title: payload.title || 'Commuter Incident',
            message: payload.message || 'Reported delay',
            location: payload.location || 'Roadway',
            city: payload.city || 'Delhi',
            time: 'Just now',
            isCrowdsourced: true,
            reportedAt: new Date().toISOString()
        };
        db.incidentReports.unshift(report);
        return sendJson(res, 201, { success: true, message: "Report broadcasted to commuters", report: report });
    }

    // 11. Safety SOS Distress Logging
    if (pathname === '/api/safety/sos' && method === 'POST') {
        const payload = await parseRequestBody(req);
        const distressLog = {
            id: 'SOS-' + Date.now(),
            city: payload.city || 'Delhi',
            route: payload.route || 'Transit',
            timestamp: new Date().toISOString(),
            status: 'DISPATCHED_TO_CONTROL_ROOM'
        };
        db.sosDistressLogs.push(distressLog);
        return sendJson(res, 200, {
            success: true,
            message: `🚨 Emergency Beacon Transmitted. ${payload.city || 'Delhi'} Transit Police Control Room Alerted.`,
            dispatchId: distressLog.id
        });
    }

    // 12. City Weather Advisory
    if (pathname === '/api/weather' && method === 'GET') {
        const city = parsedUrl.query.city || 'Delhi';
        return sendJson(res, 200, {
            success: true,
            city: city,
            temperature: '28°C',
            condition: 'Clear to Partly Cloudy',
            delayRisk: 'Low (0-4 min)',
            roadVisibility: '8.5 km',
            waterlogging: 'None Reported'
        });
    }

    // ========================================================================
    // STATIC FILE SERVING
    // ========================================================================
    let safePath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') {
        safePath = '/index.html';
    }

    const filePath = path.join(PUBLIC_DIR, safePath);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Not a file, return 404
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<h1>404 - Not Found</h1><p>The requested file ${safePath} was not found on Transit.IN.</p><a href="/">Return to Dashboard</a>`);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, must-revalidate'
        });

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚆 Transit.IN Enterprise Mobility Server is RUNNING!`);
    console.log(`🔗 Local Web App:     http://localhost:${PORT}/index.html`);
    console.log(`🔗 Backend Health:    http://localhost:${PORT}/api/health`);
    console.log(`🔗 Routes REST API:   http://localhost:${PORT}/api/routes?city=Delhi`);
    console.log(`📡 Backend Status:    CONNECTED & READY FOR REQUESTS`);
    console.log(`=======================================================`);
});
