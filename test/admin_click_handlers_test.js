const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Verifying Admin Interactive Click Handlers & Modals...');

const adminHtml = fs.readFileSync(path.join(__dirname, '..', 'admin.html'), 'utf8');
const adminJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'admin.js'), 'utf8');

// 1. Verify buttons from user screenshots exist and have exact onclick handlers
console.log('▶ TEST 1: Verifying Action Buttons in admin.html');
assert(adminHtml.includes("onclick=\"openModal('route-modal')\"") || adminHtml.includes("onclick=\"openAddRouteModal()\""), 'Add Route button must have click handler');
console.log('  ✅ "+ Add New Bus Route" button click handler verified.');

assert(adminHtml.includes("onclick=\"openModal('driver-modal')\"") || adminHtml.includes("onclick=\"openAddDriverModal()\"") || adminHtml.includes("onclick=\"openDriverModal()\""), 'Register Driver button must have click handler');
console.log('  ✅ "+ Register Driver" button click handler verified.');

assert(adminHtml.includes("onclick=\"openModal('admin-lf-modal')\"") || adminHtml.includes("onclick=\"openAddLostFoundModal()\"") || adminHtml.includes("onclick=\"openAdminLostFoundModal()\""), 'Log Custody Item button must have click handler');
console.log('  ✅ "+ Log Custody Item" button click handler verified.');

assert(adminHtml.includes("onclick=\"openModal('city-modal')\"") || adminHtml.includes("onclick=\"openAddCityModal()\""), 'Add Operating City button must have click handler');
console.log('  ✅ "+ Add Operating City" button click handler verified.');

// 2. Verify Lost & Found Filter Tabs from user screenshot
console.log('▶ TEST 2: Verifying Lost & Found Filter Tabs in admin.html');
assert(adminHtml.includes("onclick=\"filterAdminLostFound('all')\""), 'Filter tab "All Items" must have click handler');
assert(adminHtml.includes("onclick=\"filterAdminLostFound('lost')\""), 'Filter tab "Reported Lost" must have click handler');
assert(adminHtml.includes("onclick=\"filterAdminLostFound('found')\""), 'Filter tab "Found / Recovered" must have click handler');
assert(adminHtml.includes("onclick=\"filterAdminLostFound('claimed')\""), 'Filter tab "Claimed" must have click handler');
console.log('  ✅ All 4 Lost & Found Filter tabs ("All Items", "Reported Lost", "Found / Recovered", "Claimed") verified.');

// 3. Verify Modals have id and active overlay CSS
console.log('▶ TEST 3: Verifying Modal Overlays and CSS');
['route-modal', 'driver-modal', 'admin-lf-modal', 'city-modal'].forEach(id => {
    assert(adminHtml.includes(`id="${id}"`), `Modal with id="${id}" must exist in admin.html`);
    console.log(`  ✅ Modal #${id} verified in DOM.`);
});
assert(adminHtml.includes('.modal-overlay.active'), '.modal-overlay.active CSS rule must exist in admin.html');
console.log('  ✅ Modal overlay active styling verified.');

// 4. Verify Functions and Window Bindings in js/admin.js
console.log('▶ TEST 4: Verifying Functions in js/admin.js');
const requiredWindowBindings = [
    'openModal',
    'closeModal',
    'openAddRouteModal',
    'openRouteModal',
    'closeRouteModal',
    'openAddDriverModal',
    'openDriverModal',
    'closeDriverModal',
    'openAddLostFoundModal',
    'openAdminLostFoundModal',
    'closeAddLostFoundModal',
    'closeAdminLostFoundModal',
    'openAddCityModal',
    'openCityModal',
    'closeCityModal',
    'filterAdminLostFound',
    'setLFFilter',
    'saveRoute',
    'saveDriver',
    'saveCity',
    'saveAdminLostFound',
    'deleteRoute',
    'deleteDriver',
    'deleteCity',
    'toggleAdminClaimStatus',
    'toggleItemClaimed',
    'deleteAdminLostFound',
    'deleteLostFoundItem'
];

requiredWindowBindings.forEach(fn => {
    assert(adminJs.includes(`window.${fn}`), `Function window.${fn} must be exposed on window in js/admin.js`);
    console.log(`  ✅ window.${fn} verified in js/admin.js`);
});

// 5. Verify forms prevent default GET navigation
console.log('▶ TEST 5: Verifying Form Submissions');
assert(adminHtml.includes('onsubmit="saveRoute(event); return false;"'), 'Route form must have safe onsubmit');
assert(adminHtml.includes('onsubmit="saveDriver(event); return false;"'), 'Driver form must have safe onsubmit');
assert(adminHtml.includes('onsubmit="saveCity(event); return false;"'), 'City form must have safe onsubmit');
assert(adminHtml.includes('onsubmit="saveAdminLostFound(event); return false;"'), 'Lost & Found form must have safe onsubmit');
console.log('  ✅ Form onsubmit handlers preventing default reload verified.');

console.log('\n🎉 ALL ADMIN CLICK HANDLER & MODAL ENGINE CHECKS PASSED WITH 100% SUCCESS!');
