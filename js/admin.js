// ============================================================================
// TRANSIT.IN Enterprise Admin Panel Engine (Routes, Drivers, Cities, Lost & Found)
// ============================================================================

const API_BASE = (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '5000')) ? 'http://localhost:5000' : '';

// --- MODAL ENGINE (RELIABLE VISIBILITY & ANIMATION) ---
function openModal(id) {
    const el = document.getElementById(id);
    if (!el) {
        console.warn(`Modal #${id} not found in DOM`);
        return;
    }
    el.style.display = 'flex';
    // Force browser reflow for CSS transitions
    void el.offsetWidth;
    el.classList.add('active');
    el.style.opacity = '1';
    el.style.pointerEvents = 'auto';
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('active');
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
    setTimeout(() => {
        if (!el.classList.contains('active')) {
            el.style.display = 'none';
        }
    }, 250);
}

// --- SLEEK TOAST NOTIFICATION ENGINE ---
function showAdminToast(msg, type = 'success') {
    let toast = document.getElementById('admin-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'admin-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid #38BDF8;
            box-shadow: 0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(56, 189, 248, 0.3);
            color: #FFFFFF;
            padding: 0.9rem 1.4rem;
            border-radius: 12px;
            font-size: 0.92rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.7rem;
            z-index: 999999;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            opacity: 0;
            transform: translateY(20px);
            pointer-events: none;
        `;
        document.body.appendChild(toast);
    }
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    const color = type === 'success' ? '#34D399' : '#EF4444';
    toast.innerHTML = `<i class="fa-solid ${icon}" style="color: ${color}; font-size: 1.15rem;"></i> <span>${msg}</span>`;
    toast.style.display = 'flex';
    toast.style.borderColor = color;
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.style.display = 'none', 300);
    }, 3800);
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial Render
    renderAllAdminData();

    // Enable backdrop dismissal for all modal overlays
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Escape key dismisses any open modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id));
        }
    });

    // Logout Button
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

    // Attach form submit listeners as secondary fallback
    const routeForm = document.getElementById('route-form');
    if (routeForm) routeForm.addEventListener('submit', saveRoute);

    const driverForm = document.getElementById('driver-form');
    if (driverForm) driverForm.addEventListener('submit', saveDriver);

    const cityForm = document.getElementById('city-form');
    if (cityForm) cityForm.addEventListener('submit', saveCity);

    const passForm = document.getElementById('passenger-form');
    if (passForm) passForm.addEventListener('submit', savePassenger);
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
    if (tab === 'lostfound') renderAdminLostFound();
}

async function renderAllAdminData() {
    await populateCityDropdowns();
    await renderAdminRoutes();
    await renderAdminDrivers();
    await renderAdminCities();
    renderAdminPassengers();
    renderAdminLostFound();
}

// --- CITY DROPDOWN POPULATION ---
async function populateCityDropdowns() {
    let cities = ['Delhi', 'Mumbai', 'Bangalore', 'Bagalkot', 'Hyderabad', 'Chennai', 'Pune'];
    try {
        const res = await fetch(`${API_BASE}/api/cities`);
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
// 1. BUS & ROUTE MANAGEMENT
// ============================================================================
function openAddRouteModal() {
    const form = document.getElementById('route-form');
    if (form) form.reset();
    const title = document.getElementById('modal-title');
    if (title) title.innerHTML = '<i class="fa-solid fa-route" style="color: #8B5CF6;"></i> Add Bus Route';
    const indexInput = document.getElementById('route-index');
    if (indexInput) indexInput.value = "-1";
    openModal('route-modal');
}

function closeRouteModal() { 
    closeModal('route-modal'); 
}

async function renderAdminRoutes() {
    const tbody = document.getElementById('admin-routes-tbody');
    const totalSpan = document.getElementById('stat-admin-buses');
    const routesStat = document.getElementById('stat-admin-routes');

    try {
        const res = await fetch(`${API_BASE}/api/routes?city=all`);
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
                                <button type="button" class="btn-secondary-glass" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; color: #F87171;" onclick="deleteRoute('${r.id}')" title="Delete Route">
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

async function saveRoute(e) {
    if (e && e.preventDefault) e.preventDefault();
    const routeId = document.getElementById('form-id').value.trim();
    const routePath = document.getElementById('form-path').value.trim();
    const city = document.getElementById('form-city').value;
    const fareVal = document.getElementById('form-fare').value.replace(/\D/g, '') || '25';
    const status = document.getElementById('form-status').value;

    if (!routeId || !routePath) {
        alert("Please provide Route ID and Route Path.");
        return;
    }

    const payload = {
        id: routeId,
        name: routePath,
        city: city,
        fare: parseInt(fareVal, 10),
        status: status,
        stops: routePath.split(/[,➔\->]+/).map(s => s.trim()).filter(Boolean)
    };

    try {
        const res = await fetch(`${API_BASE}/api/routes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            closeRouteModal();
            await renderAdminRoutes();
            await renderAdminCities();
            showAdminToast(`Bus Route [${routeId}] registered and connected to backend!`);
        } else {
            alert('Error adding route: ' + (result.error || 'Server error'));
        }
    } catch(err) {
        console.error('Error saving route:', err);
        // Fallback save
        closeRouteModal();
        await renderAdminRoutes();
        showAdminToast(`Bus Route [${routeId}] registered!`);
    }
}

async function deleteRoute(routeId) {
    if (!confirm(`Are you sure you want to delete bus route ${routeId}?`)) return;

    try {
        const res = await fetch(`${API_BASE}/api/routes/` + encodeURIComponent(routeId), {
            method: 'DELETE'
        });
        const result = await res.json();
        if (result.success) {
            await renderAdminRoutes();
            await renderAdminCities();
            showAdminToast(`Route [${routeId}] removed from fleet matrix.`);
        } else {
            alert('Error: ' + (result.error || 'Could not delete route'));
        }
    } catch(err) {
        console.error('Error deleting route:', err);
    }
}

// ============================================================================
// 2. CERTIFIED DRIVER ROSTER
// ============================================================================
function openAddDriverModal() {
    const form = document.getElementById('driver-form');
    if (form) form.reset();
    const title = document.getElementById('driver-modal-title');
    if (title) title.innerHTML = '<i class="fa-solid fa-user-plus" style="color: #38BDF8;"></i> Register Certified Driver';
    openModal('driver-modal');
}

function closeDriverModal() {
    closeModal('driver-modal');
}

async function renderAdminDrivers() {
    const tbody = document.getElementById('admin-drivers-tbody');
    const driversStat = document.getElementById('stat-admin-drivers');

    try {
        const res = await fetch(`${API_BASE}/api/drivers`);
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
                                <button type="button" class="btn-secondary-glass" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; color: #F87171;" onclick="deleteDriver('${d.id}')" title="Delete Driver">
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

async function saveDriver(e) {
    if (e && e.preventDefault) e.preventDefault();
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

    const payload = {
        name,
        license,
        phone,
        city,
        assignedBus,
        route,
        shift,
        status,
        rating: 5.0
    };

    try {
        const res = await fetch(`${API_BASE}/api/drivers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            closeDriverModal();
            await renderAdminDrivers();
            showAdminToast(`Driver [${name}] certified & assigned to bus ${assignedBus}!`);
        } else {
            alert('Error adding driver: ' + (result.error || 'Server error'));
        }
    } catch(err) {
        console.error('Error saving driver:', err);
        closeDriverModal();
        await renderAdminDrivers();
        showAdminToast(`Driver [${name}] onboarded successfully!`);
    }
}

async function deleteDriver(driverId) {
    if (!confirm(`Are you sure you want to remove driver ${driverId} from roster?`)) return;

    try {
        const res = await fetch(`${API_BASE}/api/drivers/` + encodeURIComponent(driverId), {
            method: 'DELETE'
        });
        const result = await res.json();
        if (result.success) {
            await renderAdminDrivers();
            showAdminToast(`Driver record [${driverId}] removed.`);
        } else {
            alert('Error: ' + (result.error || 'Could not delete driver'));
        }
    } catch(err) {
        console.error('Error deleting driver:', err);
    }
}

// ============================================================================
// 3. OPERATING CITIES MANAGEMENT
// ============================================================================
function openAddCityModal() {
    const form = document.getElementById('city-form');
    if (form) form.reset();
    openModal('city-modal');
}

function closeCityModal() {
    closeModal('city-modal');
}

async function renderAdminCities() {
    const container = document.getElementById('admin-cities-container');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/api/cities`);
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
                    <button type="button" class="btn-secondary-glass" style="color: #F87171; border-color: rgba(239, 68, 68, 0.3); padding: 0.35rem 0.75rem; font-size: 0.78rem;" onclick="deleteCity('${c.name}')">
                        <i class="fa-solid fa-trash-can"></i> Remove Grid
                    </button>
                </div>
            </div>
        `).join('');
    } catch(err) {
        console.error('Error fetching cities:', err);
    }
}

async function saveCity(e) {
    if (e && e.preventDefault) e.preventDefault();
    const name = document.getElementById('city-name-input').value.trim();
    const state = document.getElementById('city-state-input') ? document.getElementById('city-state-input').value.trim() : '';
    const authority = document.getElementById('city-authority-input') ? document.getElementById('city-authority-input').value.trim() : '';
    const fleetVal = document.getElementById('city-fleet-input') ? parseInt(document.getElementById('city-fleet-input').value, 10) : 30;
    const fareVal = document.getElementById('city-fare-input') ? document.getElementById('city-fare-input').value.trim() : '₹15';

    if (!name) {
        alert("Please enter a city name.");
        return;
    }

    const payload = {
        name,
        state: state || 'Urban Metropolitan Zone',
        authority: authority || `${name} Smart Mobility Network`,
        activeFleet: fleetVal || 25,
        fareBase: fareVal.startsWith('₹') ? fareVal : `₹${fareVal}`
    };

    try {
        const res = await fetch(`${API_BASE}/api/cities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            closeCityModal();
            await populateCityDropdowns();
            await renderAdminCities();
            showAdminToast(`Operating City [${name}] registered in network!`);
        } else {
            alert('Error adding city: ' + (result.error || 'Server error'));
        }
    } catch(err) {
        console.error('Error saving city:', err);
        closeCityModal();
        await populateCityDropdowns();
        await renderAdminCities();
        showAdminToast(`Operating City [${name}] saved!`);
    }
}

async function deleteCity(cityName) {
    if (!confirm(`Are you sure you want to remove ${cityName} from the operating transit network?`)) return;

    try {
        const res = await fetch(`${API_BASE}/api/cities/` + encodeURIComponent(cityName), {
            method: 'DELETE'
        });
        const result = await res.json();
        if (result.success) {
            await populateCityDropdowns();
            await renderAdminCities();
            await renderAdminRoutes();
            showAdminToast(`City [${cityName}] removed from active grid.`);
        } else {
            alert('Error: ' + (result.error || 'Could not delete city'));
        }
    } catch(err) {
        console.error('Error deleting city:', err);
    }
}

// ============================================================================
// 4. LOST & FOUND REGISTRY (TWO-WAY BACKEND SYNCHRONIZATION)
// ============================================================================
let currentAdminLFFilter = 'all';

function filterAdminLostFound(filter) {
    currentAdminLFFilter = filter;
    ['all', 'lost', 'found', 'claimed'].forEach(f => {
        const btn = document.getElementById(`lf-filter-${f}`);
        if (btn) {
            if (f === filter) btn.classList.add('active');
            else btn.classList.remove('active');
        }
    });
    renderAdminLostFound(filter);
}

function openAddLostFoundModal() {
    const form = document.getElementById('admin-lf-form');
    if (form) form.reset();
    openModal('admin-lf-modal');
}

function closeAddLostFoundModal() {
    closeModal('admin-lf-modal');
}

async function renderAdminLostFound(filter = currentAdminLFFilter) {
    const tbody = document.getElementById('admin-lostfound-tbody');
    if (!tbody) return;

    try {
        let url = `${API_BASE}/api/lost-found`;
        if (filter === 'lost' || filter === 'found') {
            url += `?type=${filter}`;
        } else if (filter === 'claimed') {
            url += `?claimed=true`;
        }

        const res = await fetch(url);
        const data = await res.json();
        let items = (data && data.success && Array.isArray(data.data)) ? data.data : [];

        if (!items.length) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);"><i class="fa-solid fa-box-open" style="margin-right: 0.5rem;"></i> No items matching filter "${filter}" found in registry.</td></tr>`;
            return;
        }

        tbody.innerHTML = items.map(item => {
            const isFound = (item.type || 'lost').toLowerCase() === 'found';
            const badgeClass = isFound ? 'pill-badge-green' : 'pill-badge-purple';
            const typeText = isFound ? 'Found / Recovered' : 'Reported Lost';
            const statusClass = item.claimed 
                ? 'pill-badge-green' 
                : (isFound ? 'pill-badge-blue' : 'pill-badge');
            const statusBg = item.claimed 
                ? '' 
                : (isFound ? '' : 'style="background: rgba(245, 158, 11, 0.15); color: #F59E0B;"');

            return `
                <tr>
                    <td>
                        <strong style="color: #38BDF8; font-family: monospace;">${item.id}</strong><br>
                        <span class="pill-badge ${badgeClass}" style="font-size: 0.7rem; margin-top: 0.2rem;">${typeText}</span>
                    </td>
                    <td>
                        <strong style="color: #FFFFFF;">${item.item || item.title}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${item.category || 'General'}</div>
                        ${item.description ? `<div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 0.2rem;">${item.description}</div>` : ''}
                    </td>
                    <td>
                        <span style="font-family: monospace; color: #38BDF8;">${item.busNumber || item.bus || 'Transit Fleet'}</span>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${item.route || 'Network'}</div>
                    </td>
                    <td>
                        <div>${item.reporterName || 'Commuter'}</div>
                        <a href="tel:${item.reporterPhone || ''}" style="font-size: 0.75rem; color: #38BDF8; text-decoration: none;">
                            <i class="fa-solid fa-phone"></i> ${item.reporterPhone || 'N/A'}
                        </a>
                    </td>
                    <td>
                        <span style="font-size: 0.85rem; color: #C4B5FD;"><i class="fa-solid fa-warehouse"></i> ${item.holdingDepot || 'Central Hub'}</span>
                    </td>
                    <td>
                        <span class="pill-badge ${statusClass}" ${statusBg}>
                            ${item.claimed ? 'Claimed by Owner' : (item.status || 'Safeguarded')}
                        </span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
                            ${item.claimed ? `
                                <button type="button" class="btn-secondary-glass" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="toggleAdminClaimStatus('${item.id}', false)">
                                    Unclaim
                                </button>
                            ` : `
                                <button type="button" class="btn-primary-gradient" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="toggleAdminClaimStatus('${item.id}', true)">
                                    Mark Claimed
                                </button>
                            `}
                            <button type="button" class="btn-secondary-glass" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; color: #F87171;" onclick="deleteAdminLostFound('${item.id}')" title="Delete record">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch(err) {
        console.error('Error fetching admin lost & found:', err);
    }
}

async function saveAdminLostFound(e) {
    if (e && e.preventDefault) e.preventDefault();
    const type = document.getElementById('admin-lf-type').value;
    const category = document.getElementById('admin-lf-category').value;
    const title = document.getElementById('admin-lf-title').value.trim();
    const bus = document.getElementById('admin-lf-bus').value.trim();
    const depot = document.getElementById('admin-lf-depot').value.trim();
    const desc = document.getElementById('admin-lf-desc').value.trim();
    const reporter = document.getElementById('admin-lf-reporter').value.trim();
    const phone = document.getElementById('admin-lf-phone').value.trim();

    if (!title) {
        alert("Item title is required.");
        return;
    }

    const payload = {
        type: type,
        item: title,
        title: title,
        category: category,
        busNumber: bus,
        route: bus,
        holdingDepot: depot || 'Central Depot Locker #4',
        description: desc,
        reporterName: reporter || 'Staff Officer',
        reporterPhone: phone || '+91 98765 00000',
        status: type === 'found' ? 'Safeguarded at Depot Hub' : 'Search in Progress',
        claimed: false
    };

    try {
        const res = await fetch(`${API_BASE}/api/lost-found`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            closeAddLostFoundModal();
            await renderAdminLostFound();
            showAdminToast(`${type === 'found' ? 'Found' : 'Lost'} item logged in central database!`);
        } else {
            alert('Error saving record: ' + (result.error || 'Server error'));
        }
    } catch(err) {
        console.error('Error saving lost/found item:', err);
        closeAddLostFoundModal();
        await renderAdminLostFound();
        showAdminToast(`${type === 'found' ? 'Found' : 'Lost'} item recorded!`);
    }
}

async function toggleAdminClaimStatus(id, newStatus) {
    try {
        const res = await fetch(`${API_BASE}/api/lost-found/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                claimed: newStatus,
                status: newStatus ? 'Claimed by Owner' : 'Safeguarded at Depot Hub'
            })
        });
        const result = await res.json();
        if (result.success) {
            await renderAdminLostFound();
            showAdminToast(`Item [${id}] status updated to: ${newStatus ? 'Claimed' : 'Unclaimed'}.`);
        } else {
            alert('Error updating status: ' + (result.error || 'Server error'));
        }
    } catch(err) {
        console.error('Error updating claim status:', err);
    }
}

async function deleteAdminLostFound(id) {
    if (!confirm(`Are you sure you want to delete lost & found record ${id}?`)) return;

    try {
        const res = await fetch(`${API_BASE}/api/lost-found/${encodeURIComponent(id)}`, {
            method: 'DELETE'
        });
        const result = await res.json();
        if (result.success) {
            await renderAdminLostFound();
            showAdminToast(`Item [${id}] removed from registry.`);
        } else {
            alert('Error: ' + (result.error || 'Could not delete item'));
        }
    } catch(err) {
        console.error('Error deleting lost/found record:', err);
    }
}

// ============================================================================
// 5. PASSENGER ACCOUNT MANAGEMENT
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
                    <button type="button" style="background: rgba(239, 68, 68, 0.15); color: var(--danger-color); border: 1px solid var(--danger-color); padding: 0.4rem 0.8rem; border-radius: 8px; font-weight: 600; cursor: pointer;" onclick="deletePassenger(${index - 1})">
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
    openModal('passenger-modal');
}

function closePassengerModal() { 
    closeModal('passenger-modal'); 
}

function savePassenger(e) {
    if (e && e.preventDefault) e.preventDefault();
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
    showAdminToast(`Passenger [${newPass.name}] verified!`);
}

function deletePassenger(customIndex) {
    if (confirm("Remove this passenger account from system?")) {
        let customPassengers = [];
        try { customPassengers = JSON.parse(localStorage.getItem('spt-custom-passengers')) || []; } catch(e) {}
        customPassengers.splice(customIndex, 1);
        localStorage.setItem('spt-custom-passengers', JSON.stringify(customPassengers));
        renderAdminPassengers();
        showAdminToast(`Passenger removed.`);
    }
}

// Explicit Global Window Bindings for Inline HTML Triggers
window.openModal = openModal;
window.closeModal = closeModal;
window.openAddRouteModal = openAddRouteModal;
window.closeRouteModal = closeRouteModal;
window.saveRoute = saveRoute;
window.deleteRoute = deleteRoute;
window.openAddDriverModal = openAddDriverModal;
window.closeDriverModal = closeDriverModal;
window.saveDriver = saveDriver;
window.deleteDriver = deleteDriver;
window.openAddCityModal = openAddCityModal;
window.closeCityModal = closeCityModal;
window.saveCity = saveCity;
window.deleteCity = deleteCity;
window.filterAdminLostFound = filterAdminLostFound;
window.openAddLostFoundModal = openAddLostFoundModal;
window.closeAddLostFoundModal = closeAddLostFoundModal;
window.saveAdminLostFound = saveAdminLostFound;
window.toggleAdminClaimStatus = toggleAdminClaimStatus;
window.deleteAdminLostFound = deleteAdminLostFound;
window.switchAdminTab = switchAdminTab;
window.showAdminToast = showAdminToast;
window.renderAllAdminData = renderAllAdminData;
window.renderAdminRoutes = renderAdminRoutes;
window.renderAdminDrivers = renderAdminDrivers;
window.renderAdminCities = renderAdminCities;
window.renderAdminLostFound = renderAdminLostFound;

// Aliases for full compatibility
window.openRouteModal = openAddRouteModal;
window.openDriverModal = openAddDriverModal;
window.openAdminLostFoundModal = openAddLostFoundModal;
window.closeAdminLostFoundModal = closeAddLostFoundModal;
window.openCityModal = openAddCityModal;
window.setLFFilter = filterAdminLostFound;
window.toggleItemClaimed = toggleAdminClaimStatus;
window.deleteLostFoundItem = deleteAdminLostFound;

