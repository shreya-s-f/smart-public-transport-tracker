const http = require('http');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { app, db } = require('../server.js');

console.log('🧪 Starting Admin & Lost & Found End-to-End Integration Tests...\n');

// Helper to make HTTP requests
function request(server, method, path, data = null) {
    return new Promise((resolve, reject) => {
        const address = server.address();
        const options = {
            hostname: '127.0.0.1',
            port: address.port,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(body);
                } catch (e) {
                    parsed = body;
                }
                resolve({ status: res.statusCode, data: parsed });
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    const server = http.createServer(app);
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    console.log(`📡 In-process test server running on port ${port}\n`);

    try {
        // --- TEST 1: Bus Route Management ---
        console.log('▶ TEST 1: Bus Route Management (POST, GET, DELETE)');
        const newRoute = {
            id: 'TEST-99X',
            name: 'Koramangala ➔ Whitefield Tech Corridor',
            city: 'Bangalore',
            fare: 45,
            status: 'Active',
            stops: ['Koramangala', 'Domlur', 'Marathahalli', 'Whitefield']
        };

        const createRouteRes = await request(server, 'POST', '/api/routes', newRoute);
        assert.strictEqual(createRouteRes.status, 201, 'POST /api/routes should return 201');
        assert.strictEqual(createRouteRes.data.success, true);
        assert.strictEqual(createRouteRes.data.route.id, 'TEST-99X');

        const getRouteRes = await request(server, 'GET', '/api/routes/TEST-99X');
        assert.strictEqual(getRouteRes.status, 200, 'GET /api/routes/:id should return 200');
        assert.strictEqual(getRouteRes.data.route.id, 'TEST-99X');

        const getAllRoutesRes = await request(server, 'GET', '/api/routes?city=all');
        assert.strictEqual(getAllRoutesRes.status, 200);
        const foundInAll = getAllRoutesRes.data.routes.some(r => r.id === 'TEST-99X');
        assert.strictEqual(foundInAll, true, 'Created route must be present in all routes list');

        const deleteRouteRes = await request(server, 'DELETE', '/api/routes/TEST-99X');
        assert.strictEqual(deleteRouteRes.status, 200, 'DELETE /api/routes/:id should return 200');
        console.log('  ✅ Bus Route Management APIs verified successfully.');

        // --- TEST 2: Certified Driver Management ---
        console.log('\n▶ TEST 2: Certified Driver Management (POST, GET, PATCH, DELETE)');
        const newDriver = {
            name: 'Vijay Patil',
            license: 'DL-KA-2024-9988',
            phone: '+91 99887 76655',
            assignedBus: 'KA-01-EXP-9900',
            route: '500A (Electric)',
            city: 'Bangalore',
            shift: '06:00 AM – 02:00 PM',
            status: 'On Route'
        };

        const createDriverRes = await request(server, 'POST', '/api/drivers', newDriver);
        assert.strictEqual(createDriverRes.status, 201, 'POST /api/drivers should return 201');
        assert.strictEqual(createDriverRes.data.success, true);
        const createdDriverId = createDriverRes.data.data.id;
        assert.ok(createdDriverId, 'Driver should have generated ID');

        const getDriversRes = await request(server, 'GET', '/api/drivers');
        assert.strictEqual(getDriversRes.status, 200);
        const foundDriver = getDriversRes.data.data.some(d => d.id === createdDriverId);
        assert.strictEqual(foundDriver, true, 'Onboarded driver must be present in list');

        const patchDriverRes = await request(server, 'PATCH', `/api/drivers/${createdDriverId}`, { status: 'Off Duty' });
        assert.strictEqual(patchDriverRes.status, 200);
        assert.strictEqual(patchDriverRes.data.data.status, 'Off Duty');

        const deleteDriverRes = await request(server, 'DELETE', `/api/drivers/${createdDriverId}`);
        assert.strictEqual(deleteDriverRes.status, 200);
        console.log('  ✅ Driver Management APIs verified successfully.');

        // --- TEST 3: Operating Cities Management ---
        console.log('\n▶ TEST 3: Operating Cities Management (POST, GET, DELETE)');
        const newCity = {
            name: 'Kochi',
            state: 'Kerala',
            activeFleet: 35,
            routesCount: 5,
            authority: 'Kochi Smart Metro Bus Service',
            fareBase: '₹12'
        };

        const createCityRes = await request(server, 'POST', '/api/cities', newCity);
        assert.strictEqual(createCityRes.status, 201, 'POST /api/cities should return 201');
        assert.strictEqual(createCityRes.data.success, true);

        const getCitiesRes = await request(server, 'GET', '/api/cities');
        assert.strictEqual(getCitiesRes.status, 200);
        const foundCity = getCitiesRes.data.data.some(c => c.name.toLowerCase() === 'kochi');
        assert.strictEqual(foundCity, true, 'Added city must be present in cities list');

        const deleteCityRes = await request(server, 'DELETE', '/api/cities/Kochi');
        assert.strictEqual(deleteCityRes.status, 200);
        console.log('  ✅ Operating Cities Management APIs verified successfully.');

        // --- TEST 4: Lost & Found Real-Time Synchronization ---
        console.log('\n▶ TEST 4: Lost & Found Real-Time Synchronization (Passenger & Admin)');
        
        // 4a: Passenger logs a lost item
        const passengerLostItem = {
            id: 'LF-TEST-LOST-1',
            type: 'lost',
            item: 'Blue HP Pavilion Laptop Charger',
            category: 'Electronics & Phones',
            busNumber: 'KA-01-FA-4421',
            route: '500D (Hebbal to Silk Board)',
            location: 'Front Row Seat 4',
            description: 'Original blue tip 65W HP charger',
            reporterName: 'Ananya Sharma',
            reporterPhone: '+91 98450 11223'
        };

        const postLostRes = await request(server, 'POST', '/api/lost-found', passengerLostItem);
        assert.strictEqual(postLostRes.status, 201, 'Passenger lost item should be created');
        assert.strictEqual(postLostRes.data.data.type, 'lost');

        // 4b: Staff logs a recovered/found item
        const staffFoundItem = {
            id: 'LF-TEST-FOUND-2',
            type: 'found',
            item: 'Fastrack Silver Analog Watch',
            category: 'Keys & Watches',
            busNumber: 'DL-01-EXP-507',
            route: '507 (Okhla to CP)',
            holdingDepot: 'Okhla Depot Security Locker #3',
            description: 'Found under middle aisle seat',
            reporterName: 'Conductor basavaraj',
            reporterPhone: '+91 91234 99887'
        };

        const postFoundRes = await request(server, 'POST', '/api/lost-found', staffFoundItem);
        assert.strictEqual(postFoundRes.status, 201, 'Staff found item should be created');
        assert.strictEqual(postFoundRes.data.data.type, 'found');

        // 4c: Admin queries all items and filtered items
        const getAllLFRes = await request(server, 'GET', '/api/lost-found');
        assert.strictEqual(getAllLFRes.status, 200);
        const hasLostItem = getAllLFRes.data.data.some(i => i.id === 'LF-TEST-LOST-1');
        const hasFoundItem = getAllLFRes.data.data.some(i => i.id === 'LF-TEST-FOUND-2');
        assert.strictEqual(hasLostItem, true, 'Passenger lost item must be visible in admin registry');
        assert.strictEqual(hasFoundItem, true, 'Staff recovered item must be visible in admin registry');

        // 4d: Admin filters by type
        const getFoundLFRes = await request(server, 'GET', '/api/lost-found?type=found');
        assert.strictEqual(getFoundLFRes.status, 200);
        assert.strictEqual(getFoundLFRes.data.data.every(i => i.type === 'found'), true);

        // 4e: Commuter/Admin claims the found item
        const claimRes = await request(server, 'PATCH', '/api/lost-found/LF-TEST-FOUND-2', {
            claimed: true,
            status: 'Claimed by Owner'
        });
        assert.strictEqual(claimRes.status, 200);
        assert.strictEqual(claimRes.data.data.claimed, true);

        // 4f: Verify claimed filter
        const getClaimedLFRes = await request(server, 'GET', '/api/lost-found?claimed=true');
        assert.strictEqual(getClaimedLFRes.status, 200);
        const isClaimedInList = getClaimedLFRes.data.data.some(i => i.id === 'LF-TEST-FOUND-2');
        assert.strictEqual(isClaimedInList, true);

        // Cleanup test items
        await request(server, 'DELETE', '/api/lost-found/LF-TEST-LOST-1');
        await request(server, 'DELETE', '/api/lost-found/LF-TEST-FOUND-2');
        console.log('  ✅ Lost & Found Two-Way Synchronization verified successfully.');

        // --- TEST 5: UI Elements & Script Integration ---
        console.log('\n▶ TEST 5: UI Elements in admin.html and profile.html');
        const adminHtml = fs.readFileSync(path.join(__dirname, '..', 'admin.html'), 'utf8');
        assert.ok(adminHtml.includes('id="driver-modal"'), 'admin.html must contain driver-modal');
        assert.ok(adminHtml.includes('id="admin-lf-modal"'), 'admin.html must contain admin-lf-modal');
        assert.ok(adminHtml.includes('id="section-lostfound"'), 'admin.html must contain section-lostfound');
        assert.ok(adminHtml.includes('id="admin-lostfound-tbody"'), 'admin.html must contain admin-lostfound-tbody');
        assert.ok(adminHtml.includes('id="admin-drivers-tbody"'), 'admin.html must contain admin-drivers-tbody');
        assert.ok(adminHtml.includes('id="admin-cities-container"'), 'admin.html must contain admin-cities-container');

        const profileHtml = fs.readFileSync(path.join(__dirname, '..', 'profile.html'), 'utf8');
        assert.ok(profileHtml.includes('loadLostFoundCatalog'), 'profile.html must include loadLostFoundCatalog');
        assert.ok(profileHtml.includes('handleLostFoundSubmit'), 'profile.html must include handleLostFoundSubmit');
        assert.ok(profileHtml.includes('claimLostItem'), 'profile.html must include claimLostItem');
        assert.ok(profileHtml.includes('id="lf-catalog-list"'), 'profile.html must include lf-catalog-list');
        console.log('  ✅ UI Modals and Dynamic Table IDs verified successfully.');

        console.log('\n🎉 ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS!\n');
    } finally {
        server.close();
    }
}

runTests().catch(err => {
    console.error('❌ Integration Test Failure:', err);
    process.exit(1);
});
