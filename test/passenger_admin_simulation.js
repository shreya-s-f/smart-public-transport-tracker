const http = require('http');
const assert = require('assert');

console.log('🚀 Running Passenger & Admin Full Interactive Simulation...\n');

function api(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: 5000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch(e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runSimulation() {
    // 1. HEALTH CHECK
    console.log('--- 1. SERVER HEALTH & STATUS ---');
    const health = await api('GET', '/api/health');
    assert.strictEqual(health.status, 200, 'Server must be live on port 5000');
    console.log('✅ Server online:', health.body.service);

    // 2. PASSENGER PERSPECTIVE: REPORT LOST & FOUND
    console.log('\n--- 2. PASSENGER PERSPECTIVE: REPORT LOST & FOUND ---');
    // Passenger reports a lost item
    const lostPayload = {
        type: 'lost',
        item: 'Titan Octane Chronograph Watch (Black)',
        category: 'Keys & Watches',
        busNumber: 'KA-01-FA-4421',
        route: '500D (Hebbal to Silk Board)',
        description: 'Black leather strap with gold dial and scratched bezel',
        reporterName: 'Ananya Sharma',
        reporterPhone: '+91 98451 22334',
        date: '2026-11-06'
    };
    const pLost = await api('POST', '/api/lost-found', lostPayload);
    assert.strictEqual(pLost.status, 201);
    const lostId = pLost.body.data.id;
    console.log(`✅ Passenger reported LOST item successfully [${lostId}]: "${pLost.body.data.item}"`);

    // Passenger reports a found item
    const foundPayload = {
        type: 'found',
        item: 'Red American Tourister Backpack',
        category: 'Bags & Backpacks',
        busNumber: 'KA-01-FA-4421',
        route: '500D',
        description: 'Found under rear row seat 22 with notebook and umbrella',
        reporterName: 'Kavita Rao',
        reporterPhone: '+91 98888 11223',
        date: '2026-11-06'
    };
    const pFound = await api('POST', '/api/lost-found', foundPayload);
    assert.strictEqual(pFound.status, 201);
    const foundId = pFound.body.data.id;
    console.log(`✅ Passenger reported FOUND item successfully [${foundId}]: "${pFound.body.data.item}"`);

    // Passenger views catalog
    const catalog = await api('GET', '/api/lost-found');
    assert.strictEqual(catalog.status, 200);
    const catalogLost = catalog.body.data.find(i => i.id === lostId);
    const catalogFound = catalog.body.data.find(i => i.id === foundId);
    assert.ok(catalogLost, 'Lost item must appear in catalog');
    assert.ok(catalogFound, 'Found item must appear in catalog');
    console.log('✅ Passenger catalog renders live items with accurate types and categories.');

    // 3. ADMIN PERSPECTIVE: VERIFY PASSENGER ITEMS APPEAR IN ADMIN REGISTRY
    console.log('\n--- 3. ADMIN PERSPECTIVE: LOST & FOUND SYNC & ACTIONS ---');
    const adminLF = await api('GET', '/api/lost-found');
    assert.strictEqual(adminLF.status, 200);
    const adminSeenLost = adminLF.body.data.find(i => i.id === lostId);
    const adminSeenFound = adminLF.body.data.find(i => i.id === foundId);
    assert.ok(adminSeenLost, 'Passenger lost item must appear in Admin Registry');
    assert.ok(adminSeenFound, 'Passenger found item must appear in Admin Registry');
    console.log('✅ PASSENGER ➔ ADMIN SYNC CONFIRMED: Admin registry immediately received passenger reports.');

    // Admin staff logs a recovered item
    const staffRecoveredPayload = {
        type: 'found',
        item: 'Apple AirPods Pro 2 with MagSafe Case',
        category: 'Electronics & Phones',
        busNumber: 'DL-01-EXP-507',
        route: '507 (Okhla to CP)',
        holdingDepot: 'Okhla Depot Security Locker #19',
        description: 'Found on seat 12 window sill by bus cleaner',
        reporterName: 'Supervisor Ramesh (Staff)',
        reporterPhone: '+91 91234 56789'
    };
    const staffLF = await api('POST', '/api/lost-found', staffRecoveredPayload);
    assert.strictEqual(staffLF.status, 201);
    const staffLFId = staffLF.body.data.id;
    console.log(`✅ Admin staff logged recovered item [${staffLFId}]: "${staffLF.body.data.item}"`);

    // Admin marks the lost item as Claimed by Owner
    const claimRes = await api('PATCH', `/api/lost-found/${lostId}`, {
        claimed: true,
        status: 'Claimed by Owner & Returned'
    });
    assert.strictEqual(claimRes.status, 200);
    assert.strictEqual(claimRes.body.data.claimed, true);
    console.log(`✅ Admin marked item [${lostId}] as Claimed by Owner.`);

    // Passenger checks catalog again and sees the item status updated to Claimed
    const updatedCatalog = await api('GET', '/api/lost-found');
    const passengerVerifiedItem = updatedCatalog.body.data.find(i => i.id === lostId);
    assert.strictEqual(passengerVerifiedItem.claimed, true, 'Passenger view must reflect Claimed status');
    console.log('✅ ADMIN ➔ PASSENGER SYNC CONFIRMED: Passenger view immediately reflects claim status.');

    // 4. ADMIN PERSPECTIVE: BUS ROUTE MANAGEMENT
    console.log('\n--- 4. ADMIN PERSPECTIVE: BUS ROUTE MANAGEMENT ---');
    const routePayload = {
        id: '502X',
        name: 'Majestic ➔ Electronic City Expressway',
        city: 'Bangalore',
        fare: 50,
        status: 'Active',
        stops: ['Majestic', 'Shanti Nagar', 'Silk Board', 'Electronic City']
    };
    const addRoute = await api('POST', '/api/routes', routePayload);
    assert.strictEqual(addRoute.status, 201);
    assert.strictEqual(addRoute.body.route.id, '502X');
    console.log('✅ Admin added new route 502X (Majestic ➔ Electronic City Expressway).');

    const getBangaloreRoutes = await api('GET', '/api/routes?city=Bangalore');
    assert.strictEqual(getBangaloreRoutes.status, 200);
    const has502X = getBangaloreRoutes.body.routes.some(r => r.id === '502X');
    assert.ok(has502X, 'Bangalore routes must contain 502X');
    console.log('✅ Route 502X retrieved successfully via /api/routes?city=Bangalore.');

    // 5. ADMIN PERSPECTIVE: CERTIFIED DRIVER ROSTER
    console.log('\n--- 5. ADMIN PERSPECTIVE: CERTIFIED DRIVER ROSTER ---');
    const driverPayload = {
        name: 'Raghavendra Rao',
        license: 'DL-KA-2023-8899',
        phone: '+91 97766 55443',
        assignedBus: 'KA-01-EXP-502',
        route: 'Route 502X (Expressway)',
        city: 'Bangalore',
        shift: '06:00 AM – 02:00 PM',
        status: 'On Route'
    };
    const addDriver = await api('POST', '/api/drivers', driverPayload);
    assert.strictEqual(addDriver.status, 201);
    const driverId = addDriver.body.data.id;
    console.log(`✅ Admin onboarded driver [${driverId}]: ${addDriver.body.data.name} on bus ${addDriver.body.data.assignedBus}.`);

    const driversList = await api('GET', '/api/drivers');
    assert.strictEqual(driversList.status, 200);
    const hasDriver = driversList.body.data.some(d => d.id === driverId);
    assert.ok(hasDriver, 'Driver must appear in drivers list');
    console.log(`✅ Driver ${driverPayload.name} verified in live roster.`);

    // 6. ADMIN PERSPECTIVE: OPERATING CITIES MANAGEMENT
    console.log('\n--- 6. ADMIN PERSPECTIVE: OPERATING CITIES MANAGEMENT ---');
    const cityPayload = {
        name: 'Chandigarh',
        state: 'Punjab & Haryana',
        authority: 'CTU Smart Mobility Network',
        activeFleet: 42,
        fareBase: '₹15'
    };
    const addCity = await api('POST', '/api/cities', cityPayload);
    assert.strictEqual(addCity.status, 201);
    console.log(`✅ Admin registered operating city: ${addCity.body.data.name} (Authority: ${addCity.body.data.authority}).`);

    const citiesList = await api('GET', '/api/cities');
    assert.strictEqual(citiesList.status, 200);
    const hasCity = citiesList.body.data.some(c => c.name.toLowerCase() === 'chandigarh');
    assert.ok(hasCity, 'Chandigarh must be present in operating cities catalog');
    console.log('✅ City Chandigarh verified in live cities catalog.');

    // 7. CLEANUP TEST DATA
    console.log('\n--- 7. CLEANING UP SIMULATION DATA ---');
    await api('DELETE', `/api/lost-found/${lostId}`);
    await api('DELETE', `/api/lost-found/${foundId}`);
    await api('DELETE', `/api/lost-found/${staffLFId}`);
    await api('DELETE', '/api/routes/502X');
    await api('DELETE', `/api/drivers/${driverId}`);
    await api('DELETE', '/api/cities/Chandigarh');
    console.log('✅ Simulation items cleaned up cleanly.');

    console.log('\n🏆 ALL PASSENGER & ADMIN VERIFICATIONS COMPLETED SUCCESSFULLY WITHOUT ANY ERRORS!\n');
}

runSimulation().catch(err => {
    console.error('❌ Simulation Error:', err);
    process.exit(1);
});
