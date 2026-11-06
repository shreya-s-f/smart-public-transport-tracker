// Admin Panel JavaScript Logic (Routes, Drivers, Operating Cities, Fleet & Telemetry)

document.addEventListener('DOMContentLoaded', () => {
    // Initial Render
    renderAllAdminData();

    // Logout Event
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm("Log out of Admin Management System?")) {
                localStorage.removeItem('spt-authenticated');
                localStorage.removeItem('spt-user-role');
                window.location.href = 'login.html';
            }
        });
    }

    // Route Form Listener
    const routeForm = document.getElementById('route-form');
    if (routeForm) {
        routeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveRoute();
        });
    }

    // Driver Form Listener
    const driverForm = document.getElementById('driver-form');
    if (driverForm) {
        driverForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveDriver();
        });
    }

    // City Form Listener
    const cityForm = document.getElementById('city-form');
    if (cityForm) {
        cityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveCity();
        });
    }

    // Passenger Form Listener
    const passForm = document.getElementById('passenger-form');
    if (passForm) {
        passForm.addEventListener('submit', (e) => {
            e.preventDefault();
            savePassenger();
        });
    }
});

// --- TAB SWITCHING LOGIC ---
function switchAdminTab(tab) {
    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
    const targetBtn = document.getElementById(`tab-${tab}`);
    if (targetBtn) targetBtn.classList.add('active');

    const sections = ['buses', 'drivers', 'maintenance', 'complaints', 'lostfound', 'cities'];
    sections.forEach(s => {
        const el = document.getElementById(`section-${s}`);
        if (el) el.style.display = s === tab ? 'block' : 'none';
    });

    if (tab === 'buses') renderAdminRoutes();
    if (tab === 'drivers') renderAdminDrivers();
    if (tab === 'cities') renderAdminCities();
    if (tab === 'lostfound' && typeof renderAdminLostFound === 'function') renderAdminLostFound();
}

async function renderAllAdminData() {
    await populateCityDropdowns();
    await renderAdminRoutes();
    await renderAdminDrivers();
    await renderAdminCities();
    renderAdminPassengers();
    if (typeof renderAdminLostFound === 'function') {
        renderAdminLostFound();
    }
}

// --- CITY DROPDOWN POPULATION ---
async function populateCityDropdowns() {
    let cities = ['Delhi', 'Mumbai', 'Bangalore', 'Bagalkot', 'Hyderabad', 'Chennai', 'Pune'];
    try {
        const res = await fetch('/api/cities');
        const data = await res.json();
        if (data && data.success && Array.isArray(data.data) && data.data.length) {
            cities = data.data.map(c => c.name);
        }
    } catch(err) {
        console.warn('Fallback to local cities catalog:', err);
    }

    const routeSelect = document.getElementById('form-city');
    const driverSelect = document.getElementById('driver-form-city');
    const passSelect = document.getElementById('pass-city-input');

    const options = cities.map(c => `<option value="${c}">${c}</option>`).join('');
    if (routeSelect) routeSelect.innerHTML = options;
    if (driverSelect) driverSelect.innerHTML = options;
    if (passSelect) passSelect.innerHTML = options;

    const cityStat = document.getElementById('stat-admin-cities');
    if (cityStat) cityStat.textContent = cities.length;
}

// ============================================================================
// 1. BUS & ROUTE MANAGEMENT (CONNECTED TO BACKEND /api/routes)
// ============================================================================
async function renderAdminRoutes() {
    const tbody = document.getElementById('admin-routes-tbody');
    const totalSpan = document.getElementById('stat-admin-buses');
    const routesStat = document.getElementById('stat-admin-routes');

    try {
        const res = await fetch('/api/routes?city=all');
        const data = await res.json();
        const routes = (data && data.success && Array.isArray(data.routes)) ? data.routes : [];

        if (totalSpan) totalSpan.textContent = `${routes.length} / 90`;
        if (routesStat) routesStat.textContent = routes.length;

        if (tbody) {
            if (!routes.length) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-muted);">No routes configured in network. Click "Add New Bus Route" to create one.</td></tr>`;
                return;
            }

            tbody.innerHTML = routes.map((r) => {
                const stopsDisplay = Array.isArray(r.stops) && r.stops.length > 1 
                    ? `${r.stops[0]} ➔ ${r.stops[r.stops.length - 1]}`
                    : (r.name || r.path || 'Corridor');
                const hashVal = Math.abs(String(r.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
                const vehPlate = r.veh || `IN-${(r.city || 'DL').slice(0, 2).toUpperCase()}-EB-${1000 + (hashVal % 8999)}`;
                const occ = 35 + (hashVal % 50);
                const occLabel = occ > 75 ? 'Crowded' : occ > 45 ? 'Moderate' : 'Seats Available';

                return `
                    <tr>
                        <td>
                            <strong style="color: #8B5CF6; font-size: 1rem;">${r.id}</strong>
                            <div style="font-size: 0.72rem; color: var(--text-muted);">${r.type || 'Electric'} &bull; ${r.frequency || '15m'}</div>
                        </td>
                        <td><span style="font-family: monospace; color: #38BDF8;">${vehPlate}</span></td>
                        <td>
                            <strong>${r.name || r.path}</strong>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${stopsDisplay}</div>
                        </td>
                        <td><span class="pill-badge pill-badge-purple" style="font-size: 0.72rem;">${r.city || 'Transit Grid'}</span></td>
                        <td>
                            <span style="font-size: 0.85rem; color: #FFFFFF;">${occ}%</span>
                            <span style="font-size: 0.75rem; color: var(--text-muted);">(${occLabel})</span>
                        </td>
                        <td>
                            <span class="pill-badge ${r.status === 'Delayed' ? 'pill-badge-purple' : 'pill-badge-green'}">
                                ${r.status || 'Active'}
                            </span>
                        </td>
                        <td>
                            <div style="display: flex; gap: 0.4rem; align-items: center;">
                                <a href="tracking.html?route=${encodeURIComponent(r.id)}" class="btn-secondary-glass" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; text-decoration: none;" title="Track Live">
                                    <i class="fa-solid fa-satellite-dish"></i>
                                </a>
                                <button class="btn-secondary-glass" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; color: #F87171;" onclick="deleteRoute('${r.id}')" title="Delete Route">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (err) {
        console.error('Error fetching routes:', err);
    }
}

function openAddRouteModal() {
    document.getElementById('modal-title').textContent = "Add Bus Route";
    document.getElementById('route-index').value = "-1";
    document.getElementById('route-form').reset();
    document.getElementById('route-modal').style.display = 'flex';
}

function closeRouteModal() { 
    document.getElementById('route-modal').style.display = 'none'; 
}

async function saveRoute() {
    const routeId = document.getElementById('form-id').value.trim();
    const routePath = document.getElementById('form-path').value.trim();
    const city = document.getElementById('form-city').value;
    const fareVal = document.getElementById('form-fare').value.replace(/\D/g, '') || '25';
    const status = document.getElementById('form-status').value;

    if (!routeId || !routePath) {
        alert("Please provide Route ID and Route Path.");
        return;
    }

    try {
        const res = await fetch('/api/routes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: routeId,
                name: routePath,
                city: city,
                fare: parseInt(fareVal, 10),
                status: status,
                stops: routePath.split(/[,➔\->]+/).map(s => s.trim()).filter(Boolean)
            })
        });
        const result = await res.json();
        if (result.success) {
            closeRouteModal();
            await renderAdminRoutes();
            await renderAdminCities();
        } else {
            alert('Error adding route: ' + (result.error || 'Server error'));
        }
    } catch(err) {
        console.error('Error saving route:', err);
        alert('Failed to connect to backend server.');
    }
}

async function deleteRoute(routeId) {
    if (!confirm(`Are you sure you want to delete bus route ${routeId}?`)) return;

    try {
        const res = await fetch('/api/routes/' + encodeURIComponent(routeId), {
            method: 'DELETE'
        });
        const result = await res.json();
        if (result.success) {
            await renderAdminRoutes();
            await renderAdminCities();
        } else {
            alert('Error: ' + (result.error || 'Could not delete route'));
        }
    } catch(err) {
        console.error('Error deleting route:', err);
    }
}

// ============================================================================
// 2. CERTIFIED DRIVER ROSTER (CONNECTED TO BACKEND /api/drivers)
// ============================================================================
function openAddDriverModal() {
    const form = document.getElementById('driver-form');
    if (form) form.reset();
    const title = document.getElementById('driver-modal-title');
    if (title) title.innerHTML = '<i class="fa-solid fa-user-plus" style="color: #38BDF8;"></i> Register Certified Driver';
    const modal = document.getElementById('driver-modal');
    if (modal) modal.style.display = 'flex';
}

function closeDriverModal() {
    const modal = document.getElementById('driver-modal');
    if (modal) modal.style.display = 'none';
}

async function renderAdminDrivers() {
    const tbody = document.getElementById('admin-drivers-tbody');
    const driversStat = document.getElementById('stat-admin-drivers');

    try {
        const res = await fetch('/api/drivers');
        const data = await res.json();
        const drivers = (data && data.success && Array.isArray(data.data)) ? data.data : [];

        if (driversStat) driversStat.textContent = drivers.length;

        if (tbody) {
            if (!drivers.length) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-muted);">No drivers registered. Click "Register Driver" to onboard one.</td></tr>`;
                return;
            }

            tbody.innerHTML = drivers.map(d => {
                const statusBadge = d.status === 'On Route' 
                    ? 'pill-badge-green' 
                    : (d.status === 'Scheduled' ? 'pill-badge-blue' : 'pill-badge-purple');

                return `
                    <tr>
                        <td>
                            <strong>${d.name}</strong>
                            <div style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">Badge: ${d.id || d.license}</div>
                        </td>
                        <td><span style="font-family: monospace; color: #38BDF8; font-weight: 600;">${d.assignedBus || 'Unassigned'}</span></td>
                        <td>
                            <strong>${d.route || 'General Route'}</strong>
                            <div style="font-size: 0.72rem; color: var(--text-muted);">${d.city || 'Metro Grid'}</div>
                        </td>
                        <td><span style="font-size: 0.85rem; color: #FFFFFF;">${d.shift || '08:00 AM – 04:00 PM'}</span></td>
                        <td><span style="color: #F59E0B;"><i class="fa-solid fa-star"></i> ${d.rating || 5.0} / 5</span></td>
                        <td><span class="pill-badge ${statusBadge}">${d.status || 'Active'}</span></td>
                        <td>
                            <div style="display: flex; gap: 0.4rem; align-items: center;">
                                <a href="tel:${d.phone || '+919876543210'}" class="btn-secondary-glass" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; text-decoration: none;" title="Call Driver">
                                    <i class="fa-solid fa-phone"></i>
                                </a>
                                <button class="btn-secondary-glass" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; color: #F87171;" onclick="deleteDriver('${d.id}')" title="Delete Driver">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch(err) {
        console.error('Error fetching drivers:', err);
    }
}

async function saveDriver() {
    const name = document.getElementById('driver-form-name').value.trim();
    const license = document.getElementById('driver-form-license').value.trim();
    const phone = document.getElementById('driver-form-phone').value.trim();
    const city = document.getElementById('driver-form-city').value;
    const assignedBus = document.getElementById('driver-form-bus').value.trim();
    const route = document.getElementById('driver-form-route').value.trim();
    const shift = document.getElementById('driver-form-shift').value;
    const status = document.getElementById('driver-form-status').value;

    if (!name) {
        alert("Driver name is required.");
        return;
    }

    try {
        const res = await fetch('/api/drivers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                license,
                phone,
                city,
                assignedBus,
                route,
                shift,
                status,
                rating: 5.0
            })
        });
        const result = await res.json();
        if (result.success) {
            closeDriverModal();
            await renderAdminDrivers();
        } else {
            alert('Error adding driver: ' + (result.error || 'Server error'));
        }
    } catch(err) {
        console.error('Error saving driver:', err);
        alert('Failed to connect to backend server.');
    }
}

async function deleteDriver(driverId) {
    if (!confirm(`Are you sure you want to remove driver ${driverId} from roster?`)) return;

    try {
        const res = await fetch('/api/drivers/' + encodeURIComponent(driverId), {
            method: 'DELETE'
        });
        const result = await res.json();
        if (result.success) {
            await renderAdminDrivers();
        } else {
            alert('Error: ' + (result.error || 'Could not delete driver'));
        }
    } catch(err) {
        console.error('Error deleting driver:', err);
    }
}

// ============================================================================
// 3. OPERATING CITIES MANAGEMENT (CONNECTED TO BACKEND /api/cities)
// ============================================================================
function openAddCityModal() {
    const form = document.getElementById('city-form');
    if (form) form.reset();
    const modal = document.getElementById('city-modal');
    if (modal) modal.style.display = 'flex';
}

function closeCityModal() {
    const modal = document.getElementById('city-modal');
    if (modal) modal.style.display = 'none';
}

async function renderAdminCities() {
    const container = document.getElementById('admin-cities-container');
    if (!container) return;

    try {
        const res = await fetch('/api/cities');
        const data = await res.json();
        const cities = (data && data.success && Array.isArray(data.data)) ? data.data : [];

        container.innerHTML = cities.map(c => `
            <div class="glass-card route-item animate-fade-in-up" style="display: flex; flex-direction: column; gap: 0.8rem; padding: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <div style="font-size: 1.2rem; font-weight: 700; color: #FFFFFF; font-family: var(--font-heading);">
                            <i class="fa-solid fa-city" style="color: #10B981; margin-right: 0.4rem;"></i> ${c.name}
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">${c.state || 'Urban Metropolitan Zone'}</div>
                    </div>
                    <span class="pill-badge pill-badge-green" style="font-size: 0.72rem;">${c.status || 'Active'}</span>
                </div>
                
                <div style="font-size: 0.78rem; color: #C4B5FD; background: rgba(139, 92, 246, 0.1); padding: 0.4rem 0.6rem; border-radius: 6px;">
                    <i class="fa-solid fa-building-columns"></i> ${c.authority || `${c.name} Smart Transit Authority`}
                </div>

                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; color: var(--text-secondary); border-top: 1px solid var(--card-border); padding-top: 0.6rem;">
                    <span><i class="fa-solid fa-bus-simple" style="color: #38BDF8;"></i> Fleet: <strong>${c.activeFleet || 20}</strong></span>
                    <span><i class="fa-solid fa-route" style="color: #F59E0B;"></i> Routes: <strong>${c.routesCount || 1}</strong></span>
                    <span><i class="fa-solid fa-ticket" style="color: #34D399;"></i> Fare: <strong>${c.fareBase || '₹15'}</strong></span>
                </div>

                <div style="display: flex; justify-content: flex-end; margin-top: 0.4rem;">
                    <button class="btn-secondary-glass" style="color: #F87171; border-color: rgba(239, 68, 68, 0.3); padding: 0.35rem 0.75rem; font-size: 0.78rem;" onclick="deleteCity('${c.name}')">
                        <i class="fa-solid fa-trash-can"></i> Remove Grid
                    </button>
                </div>
            </div>
        `).join('');
    } catch(err) {
        console.error('Error fetching cities:', err);
    }
}

async function saveCity() {
    const name = document.getElementById('city-name-input').value.trim();
    const state = document.getElementById('city-state-input') ? document.getElementById('city-state-input').value.trim() : '';
    const authority = document.getElementById('city-authority-input') ? document.getElementById('city-authority-input').value.trim() : '';
    const fleetVal = document.getElementById('city-fleet-input') ? parseInt(document.getElementById('city-fleet-input').value, 10) : 30;
    const fareVal = document.getElementById('city-fare-input') ? document.getElementById('city-fare-input').value.trim() : '₹15';

    if (!name) {
        alert("Please enter a city name.");
        return;
    }

    try {
        const res = await fetch('/api/cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                state: state || 'Urban Metropolitan Zone',
                authority: authority || `${name} Smart Mobility Network`,
                activeFleet: fleetVal || 25,
                fareBase: fareVal.startsWith('₹') ? fareVal : `₹${fareVal}`
            })
        });
        const result = await res.json();
        if (result.success) {
            closeCityModal();
            await populateCityDropdowns();
            await renderAdminCities();
        } else {
            alert('Error adding city: ' + (result.error || 'Server error'));
        }
    } catch(err) {
        console.error('Error saving city:', err);
        alert('Failed to connect to backend server.');
    }
}

async function deleteCity(cityName) {
    if (!confirm(`Are you sure you want to remove ${cityName} from the operating transit network?`)) return;

    try {
        const res = await fetch('/api/cities/' + encodeURIComponent(cityName), {
            method: 'DELETE'
        });
        const result = await res.json();
        if (result.success) {
            await populateCityDropdowns();
            await renderAdminCities();
            await renderAdminRoutes();
        } else {
            alert('Error: ' + (result.error || 'Could not delete city'));
        }
    } catch(err) {
        console.error('Error deleting city:', err);
    }
}

// ============================================================================
// 4. PASSENGER ACCOUNT MANAGEMENT
// ============================================================================
function getPassengers() {
    let list = [
        { name: 'Shreya', email: 'shreya@gmail.com', phone: '+91 98765 43210', city: 'Delhi' }
    ];
    try {
        const activeProfile = JSON.parse(localStorage.getItem('spt-user-profile-data'));
        if (activeProfile) list[0] = activeProfile;
    } catch(e) {}

    try {
        const customPassengers = JSON.parse(localStorage.getItem('spt-custom-passengers')) || [];
        list = [...list, ...customPassengers];
    } catch(e) {}

    return list;
}

function renderAdminPassengers() {
    const container = document.getElementById('admin-passengers-container');
    const totalStat = document.getElementById('stat-admin-passengers');
    if (!container) return;

    const passengers = getPassengers();
    if (totalStat) totalStat.textContent = passengers.length;

    container.innerHTML = '';
    passengers.forEach((pass, index) => {
        const card = document.createElement('div');
        card.className = 'glass-card route-item animate-fade-in-up';
        card.innerHTML = `
            <div class="route-details" style="flex: 1;">
                <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.3rem;">
                    <span class="route-number"><i class="fa-solid fa-user"></i> ${pass.name}</span>
                    <span class="route-status status-ontime" style="font-size: 0.75rem;">Verified Passenger</span>
                </div>
                <div style="font-size: 0.9rem; color: var(--text-secondary); display: flex; gap: 1.5rem; margin-top: 0.5rem; flex-wrap: wrap;">
                    <span><i class="fa-solid fa-envelope"></i> ${pass.email}</span>
                    <span><i class="fa-solid fa-phone"></i> ${pass.phone}</span>
                    <span><i class="fa-solid fa-city"></i> ${pass.city}</span>
                </div>
            </div>
            <div class="route-actions">
                ${index > 0 ? `
                    <button style="background: rgba(239, 68, 68, 0.15); color: var(--danger-color); border: 1px solid var(--danger-color); padding: 0.4rem 0.8rem; border-radius: 8px; font-weight: 600; cursor: pointer;" onclick="deletePassenger(${index - 1})">
                        <i class="fa-solid fa-user-xmark"></i> Remove Account
                    </button>
                ` : `<span style="font-size: 0.8rem; color: var(--text-secondary);">Active Profile</span>`}
            </div>
        `;
        container.appendChild(card);
    });
}

function openAddPassengerModal() {
    const form = document.getElementById('passenger-form');
    if (form) form.reset();
    const modal = document.getElementById('passenger-modal');
    if (modal) modal.style.display = 'flex';
}
function closePassengerModal() { 
    const modal = document.getElementById('passenger-modal');
    if (modal) modal.style.display = 'none'; 
}

function savePassenger() {
    const newPass = {
        name: document.getElementById('pass-name-input').value.trim(),
        email: document.getElementById('pass-email-input').value.trim(),
        phone: document.getElementById('pass-phone-input').value.trim(),
        city: document.getElementById('pass-city-input').value
    };

    let customPassengers = [];
    try { customPassengers = JSON.parse(localStorage.getItem('spt-custom-passengers')) || []; } catch(e) {}
    customPassengers.push(newPass);

    localStorage.setItem('spt-custom-passengers', JSON.stringify(customPassengers));
    renderAdminPassengers();
    closePassengerModal();
}

function deletePassenger(customIndex) {
    if (confirm("Remove this passenger account from system?")) {
        let customPassengers = [];
        try { customPassengers = JSON.parse(localStorage.getItem('spt-custom-passengers')) || []; } catch(e) {}
        customPassengers.splice(customIndex, 1);
        localStorage.setItem('spt-custom-passengers', JSON.stringify(customPassengers));
        renderAdminPassengers();
    }
}
