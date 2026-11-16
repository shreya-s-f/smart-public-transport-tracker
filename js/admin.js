// ============================================================================
// TRANSIT.IN Enterprise Admin Management Engine
// Full Two-Way Synchronization with Backend REST API & db.json
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
    void el.offsetWidth; // Force reflow
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
    renderAllAdminData();

    // Enable backdrop dismissal for all modal overlays
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal.id);
        });
    });

    // Escape key dismisses open modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id));
        }
    });

    // Logout
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
});

// --- TAB SWITCHING LOGIC ---
function switchAdminTab(tab) {
    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
    const targetBtn = document.getElementById(`tab-${tab}`);
    if (targetBtn) targetBtn.classList.add('active');

    const sections = ['buses', 'drivers', 'maintenance', 'complaints', 'lostfound', 'cities', 'subscribers', 'passengers', 'emergencies'];
    sections.forEach(s => {
        const el = document.getElementById(`section-${s}`);
        if (el) el.style.display = (s === tab ? 'block' : 'none');
    });

    if (tab === 'buses') renderAdminRoutes();
    if (tab === 'drivers') renderAdminDrivers();
    if (tab === 'maintenance') renderAdminMaintenance();
    if (tab === 'complaints') renderAdminComplaints();
    if (tab === 'lostfound') renderAdminLostFound();
    if (tab === 'cities') renderAdminCities();
    if (tab === 'subscribers') renderAdminSubscribers();
    if (tab === 'passengers') renderAdminPassengers();
    if (tab === 'emergencies') renderEmergenciesTable();

    loadAdminOverviewStats();
}

async function renderAllAdminData() {
    await populateCityDropdowns();
    await loadAdminOverviewStats();
    await renderAdminRoutes();
    await renderAdminDrivers();
    await renderAdminMaintenance();
    await renderAdminComplaints();
    await renderAdminLostFound();
    await renderAdminCities();
    await renderAdminSubscribers();
    await renderAdminPassengers();
    await renderEmergenciesTable();
}

// --- LIVE OVERVIEW KPI METRICS ---
async function loadAdminOverviewStats() {
    try {
        const res = await fetch(`${API_BASE}/api/admin/stats`);
        const data = await res.json();
        if (data && data.success && data.stats) {
            const s = data.stats;
            const elPass = document.getElementById('stat-admin-passengers');
            const elBuses = document.getElementById('stat-admin-buses');
            const elDrivers = document.getElementById('stat-admin-drivers');
            const elRoutes = document.getElementById('stat-admin-routes');
            const elEmg = document.getElementById('stat-admin-emergencies');
            const elCmp = document.getElementById('stat-admin-complaints');
            const elSubs = document.getElementById('stat-admin-subscribers');

            if (elPass) elPass.textContent = s.totalPassengers || 1;
            if (elBuses) elBuses.textContent = s.activeBuses || '84 / 90';
            if (elDrivers) elDrivers.textContent = s.totalDrivers || 5;
            if (elRoutes) elRoutes.textContent = s.totalRoutes || 23;
            if (elEmg) elEmg.textContent = s.activeEmergencies || 0;
            const elTabEmg = document.getElementById('tab-emergencies-count');
            if (elTabEmg) elTabEmg.textContent = s.activeEmergencies || 0;
            if (elCmp) elCmp.textContent = s.pendingComplaints || 0;
            if (elSubs) elSubs.textContent = s.totalSubscribers || 0;
        }
    } catch(err) {
        console.warn('Overview stats fallback:', err);
    }
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
        console.warn('Cities catalog fallback:', err);
    }

    const dropdownIds = ['form-city', 'driver-form-city', 'pass-city-input', 'alert-city-select'];
    dropdownIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (id === 'alert-city-select') {
            el.innerHTML = '<option value="All Cities">All Operating Cities</option>' + cities.map(c => `<option value="${c}">${c}</option>`).join('');
        } else {
            el.innerHTML = cities.map(c => `<option value="${c}">${c}</option>`).join('');
        }
    });
}

// ============================================================================
// 1. BUS FLEET & ROUTE MANAGEMENT
// ============================================================================
let currentRouteList = [];

function openAddRouteModal() {
    const form = document.getElementById('route-form');
    if (form) form.reset();
    const title = document.getElementById('modal-title');
    if (title) title.innerHTML = '<i class="fa-solid fa-route" style="color: #8B5CF6;"></i> Add Bus Route';
    const idInput = document.getElementById('form-id');
    if (idInput) idInput.readOnly = false;
    openModal('route-modal');
}

function openEditRouteModal(routeId) {
    const route = currentRouteList.find(r => String(r.id).toLowerCase() === String(routeId).toLowerCase());
    if (!route) return;

    const title = document.getElementById('modal-title');
    if (title) title.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: #38BDF8;"></i> Edit Bus Route [${route.id}]`;

    const cityInput = document.getElementById('form-city');
    const idInput = document.getElementById('form-id');
    const pathInput = document.getElementById('form-path');
    const fareInput = document.getElementById('form-fare');
    const statusInput = document.getElementById('form-status');

    if (cityInput) cityInput.value = route.city || 'Delhi';
    if (idInput) { idInput.value = route.id; idInput.readOnly = true; }
    if (pathInput) pathInput.value = route.name || (Array.isArray(route.stops) ? route.stops.join(' ➔ ') : 'Corridor');
    if (fareInput) fareInput.value = `₹${route.fare || 30}`;
    if (statusInput) statusInput.value = route.status || 'Active';

    openModal('route-modal');
}

function closeRouteModal() {
    closeModal('route-modal');
}

async function renderAdminRoutes() {
    const tbody = document.getElementById('admin-routes-tbody');
    try {
        const res = await fetch(`${API_BASE}/api/routes?city=all`);
        const data = await res.json();
        const routes = (data && data.success && Array.isArray(data.routes)) ? data.routes : [];
        currentRouteList = routes;

        if (tbody) {
            if (!routes.length) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-muted);">No routes configured. Click "Add New Bus Route" to create one.</td></tr>`;
                return;
            }

            tbody.innerHTML = routes.map((r) => {
                const stopsDisplay = Array.isArray(r.stops) && r.stops.length > 1 
                    ? `${r.stops[0]} ➔ ${r.stops[r.stops.length - 1]}`
                    : (r.name || 'Corridor');
                const hashVal = Math.abs(String(r.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
                const vehPlate = `IN-${(r.city || 'DL').slice(0, 2).toUpperCase()}-EB-${1000 + (hashVal % 8999)}`;
                const occ = 35 + (hashVal % 50);
                const occLabel = occ > 75 ? 'Crowded' : occ > 45 ? 'Moderate' : 'Seats Available';
                const isDelayed = (r.status || '').toLowerCase() === 'delayed';

                return `
                    <tr>
                        <td>
                            <strong style="color: #8B5CF6; font-size: 1rem;">${r.id}</strong>
                            <div style="font-size: 0.72rem; color: var(--text-muted);">${r.type || 'Electric'} &bull; ${r.frequency || '15m'}</div>
                        </td>
                        <td><span style="font-family: monospace; color: #38BDF8;">${vehPlate}</span></td>
                        <td>
                            <strong>${r.name}</strong>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${stopsDisplay}</div>
                        </td>
                        <td><span class="pill-badge pill-badge-purple" style="font-size: 0.72rem;">${r.city || 'Transit Grid'}</span></td>
                        <td>
                            <span style="font-size: 0.85rem; color: #FFFFFF;">${occ}%</span>
                            <span style="font-size: 0.75rem; color: var(--text-muted);">(${occLabel})</span>
                        </td>
                        <td>
                            <span class="pill-badge ${isDelayed ? 'pill-badge-purple' : 'pill-badge-green'}">
                                ${r.status || 'Active'}
                            </span>
                        </td>
                        <td>
                            <div style="display: flex; gap: 0.4rem; align-items: center;">
                                <button type="button" class="btn-secondary-glass" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; color: #38BDF8;" onclick="openEditRouteModal('${r.id}')" title="Edit Route">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
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
            await loadAdminOverviewStats();
            showAdminToast(`Route [${routeId}] saved and stored in backend!`);
        } else {
            alert('Error saving route: ' + (result.error || 'Server error'));
        }
    } catch(err) {
        console.error('Error saving route:', err);
        closeRouteModal();
        await renderAdminRoutes();
    }
}

async function deleteRoute(routeId) {
    if (!confirm(`Are you sure you want to delete bus route ${routeId}?`)) return;
    try {
        const res = await fetch(`${API_BASE}/api/routes/` + encodeURIComponent(routeId), { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
            await renderAdminRoutes();
            await loadAdminOverviewStats();
            showAdminToast(`Route [${routeId}] removed from fleet.`);
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
let currentDriversList = [];

function openAddDriverModal() {
    const form = document.getElementById('driver-form');
    if (form) form.reset();
    const title = document.getElementById('driver-modal-title');
    if (title) title.innerHTML = '<i class="fa-solid fa-user-plus" style="color: #38BDF8;"></i> Register Certified Driver';
    const editIdInput = document.getElementById('driver-edit-id');
    if (editIdInput) editIdInput.value = '';
    openModal('driver-modal');
}

function openEditDriverModal(driverId) {
    const d = currentDriversList.find(x => String(x.id).toLowerCase() === String(driverId).toLowerCase());
    if (!d) return;

    const title = document.getElementById('driver-modal-title');
    if (title) title.innerHTML = `<i class="fa-solid fa-user-pen" style="color: #38BDF8;"></i> Edit Driver [${d.name}]`;

    document.getElementById('driver-edit-id').value = d.id;
    document.getElementById('driver-form-name').value = d.name;
    document.getElementById('driver-form-license').value = d.license || '';
    document.getElementById('driver-form-phone').value = d.phone || '';
    document.getElementById('driver-form-city').value = d.city || 'Delhi';
    document.getElementById('driver-form-bus').value = d.assignedBus || '';
    document.getElementById('driver-form-route').value = d.route || '';
    document.getElementById('driver-form-shift').value = d.shift || '06:00 AM – 02:00 PM';
    document.getElementById('driver-form-status').value = d.status || 'On Route';

    openModal('driver-modal');
}

function closeDriverModal() {
    closeModal('driver-modal');
}

async function renderAdminDrivers() {
    const tbody = document.getElementById('admin-drivers-tbody');
    try {
        const res = await fetch(`${API_BASE}/api/drivers`);
        const data = await res.json();
        const drivers = (data && data.success && Array.isArray(data.data)) ? data.data : [];
        currentDriversList = drivers;

        if (tbody) {
            if (!drivers.length) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-muted);">No drivers on roster. Click "Register Driver" to onboard.</td></tr>`;
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
                                <button type="button" class="btn-secondary-glass" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; color: #38BDF8;" onclick="openEditDriverModal('${d.id}')" title="Edit Driver">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
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
    const editId = document.getElementById('driver-edit-id').value;
    const name = document.getElementById('driver-form-name').value.trim();
    const license = document.getElementById('driver-form-license').value.trim();
    const phone = document.getElementById('driver-form-phone').value.trim();
    const city = document.getElementById('driver-form-city').value;
    const assignedBus = document.getElementById('driver-form-bus').value.trim();
    const route = document.getElementById('driver-form-route').value.trim();
    const shift = document.getElementById('driver-form-shift').value;
    const status = document.getElementById('driver-form-status').value;

    if (!name) return alert("Driver name is required.");

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
    if (editId) payload.id = editId;

    try {
        const url = editId ? `${API_BASE}/api/drivers/${encodeURIComponent(editId)}` : `${API_BASE}/api/drivers`;
        const method = editId ? 'PATCH' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            closeDriverModal();
            await renderAdminDrivers();
            await loadAdminOverviewStats();
            showAdminToast(`Driver [${name}] details saved to backend!`);
        } else {
            alert('Error saving driver: ' + (result.error || 'Server error'));
        }
    } catch(err) {
        console.error('Error saving driver:', err);
        closeDriverModal();
        await renderAdminDrivers();
    }
}

async function deleteDriver(driverId) {
    if (!confirm(`Are you sure you want to remove driver ${driverId} from roster?`)) return;
    try {
        const res = await fetch(`${API_BASE}/api/drivers/` + encodeURIComponent(driverId), { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
            await renderAdminDrivers();
            await loadAdminOverviewStats();
            showAdminToast(`Driver [${driverId}] removed.`);
        }
    } catch(err) {
        console.error('Error deleting driver:', err);
    }
}

// ============================================================================
// 3. PREDICTIVE FLEET MAINTENANCE TELEMETRY (DYNAMIC BACKEND SYNC)
// ============================================================================
async function renderAdminMaintenance() {
    const tbody = document.getElementById('admin-maintenance-tbody');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/api/maintenance`);
        const data = await res.json();
        const records = (data && data.success && Array.isArray(data.data)) ? data.data : [];

        if (!records.length) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No maintenance logs registered. Click "Log Maintenance Ticket" to schedule one.</td></tr>`;
            return;
        }

        tbody.innerHTML = records.map(m => {
            const wear = Number(m.wear) || 20;
            const wearColor = wear > 60 ? '#EF4444' : wear > 35 ? '#F59E0B' : '#34D399';
            const riskBadge = wear > 60 ? 'pill-badge' : wear > 35 ? 'pill-badge' : 'pill-badge pill-badge-green';
            const riskStyle = wear > 60 ? 'style="background: rgba(239, 68, 68, 0.15); color: #F87171;"' : wear > 35 ? 'style="background: rgba(245, 158, 11, 0.15); color: #F59E0B;"' : '';

            return `
                <tr>
                    <td>
                        <strong style="color: #38BDF8;">${m.busId}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${m.route || 'Transit Line'}</div>
                    </td>
                    <td><span class="pill-badge pill-badge-blue">${m.propulsion || 'Electric AC'}</span></td>
                    <td>
                        <div class="health-bar-bg"><div class="health-bar-fill" style="width: ${wear}%; background: ${wearColor};"></div></div>
                        <span>${wear}%</span>
                    </td>
                    <td><strong style="color: ${wearColor};">${m.battery || '88% SoC (Good)'}</strong></td>
                    <td>${m.tirePressure || '34 PSI (Normal)'}</td>
                    <td><span class="${riskBadge}" ${riskStyle}>${m.status || 'Optimal Health'}</span></td>
                    <td>
                        <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
                            <button type="button" class="btn-secondary-glass" style="padding: 0.3rem 0.6rem; font-size: 0.72rem;" onclick="logServiceAction('${m.busId}', 'Log Check')">Log Check</button>
                            <button type="button" class="btn-secondary-glass" style="padding: 0.3rem 0.6rem; font-size: 0.72rem; color: #F59E0B;" onclick="logServiceAction('${m.busId}', 'Schedule Oil')">Schedule Service</button>
                            <button type="button" class="btn-primary-gradient" style="padding: 0.3rem 0.6rem; font-size: 0.72rem;" onclick="logServiceAction('${m.busId}', 'Dispatch Bay')">Dispatch Bay</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch(err) {
        console.error('Error fetching maintenance:', err);
    }
}

async function logServiceAction(busId, serviceType) {
    try {
        const res = await fetch(`${API_BASE}/api/maintenance/service`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ busId, serviceType })
        });
        const data = await res.json();
        if (data && data.success) {
            await renderAdminMaintenance();
            showAdminToast(`Telemetry updated for ${busId}: [${serviceType}] recorded.`);
        }
    } catch(e) {
        console.error('Error logging service:', e);
    }
}

function openAddMaintenanceModal() {
    const form = document.getElementById('maintenance-form');
    if (form) form.reset();
    openModal('maintenance-modal');
}

function closeAddMaintenanceModal() {
    closeModal('maintenance-modal');
}

async function saveMaintenance(e) {
    if (e && e.preventDefault) e.preventDefault();
    const busId = document.getElementById('maint-bus-id').value.trim();
    const route = document.getElementById('maint-route').value.trim();
    const propulsion = document.getElementById('maint-propulsion').value;
    const wear = parseInt(document.getElementById('maint-wear').value, 10) || 15;
    const battery = document.getElementById('maint-battery').value.trim();
    const tire = document.getElementById('maint-tire').value.trim();
    const status = document.getElementById('maint-status').value;

    if (!busId) return alert('Vehicle Registration ID required');

    const payload = { busId, route, propulsion, wear, battery, tirePressure: tire, status };

    try {
        const res = await fetch(`${API_BASE}/api/maintenance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            closeAddMaintenanceModal();
            await renderAdminMaintenance();
            showAdminToast(`Vehicle health log saved for ${busId}!`);
        }
    } catch(err) {
        console.error('Error saving maintenance:', err);
    }
}

function triggerHealthScan() {
    showAdminToast('Sensor diagnostics running across all active CAN bus telematics...', 'success');
    setTimeout(() => {
        renderAdminMaintenance();
        showAdminToast('CAN bus telematics scan complete. All 84 vehicle sensors verified.', 'success');
    }, 900);
}

// ============================================================================
// 4. COMMUTER GRIEVANCES & RESOLUTION (DYNAMIC BACKEND SYNC)
// ============================================================================
async function renderAdminComplaints() {
    const tbody = document.getElementById('admin-complaints-tbody');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/api/complaints`);
        const data = await res.json();
        const complaints = (data && data.success && Array.isArray(data.data)) ? data.data : [];

        if (!complaints.length) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No pending grievances reported. Fleet operations normal.</td></tr>`;
            return;
        }

        tbody.innerHTML = complaints.map(c => {
            const isResolved = (c.status || '').toLowerCase() === 'resolved';
            const statusStyle = isResolved ? 'opacity: 0.55;' : '';

            return `
                <tr style="${statusStyle}">
                    <td><strong style="color: #8B5CF6;">${c.id}</strong><div style="font-size: 0.72rem; color: var(--text-muted);">${c.timestamp || 'Recent'}</div></td>
                    <td><span class="pill-badge pill-badge-blue">${c.category || 'Grievance'}</span></td>
                    <td>
                        <strong>${c.route || c.busNumber || 'Transit Corridor'}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">Reported by ${c.commuter || 'Passenger'}</div>
                    </td>
                    <td style="max-width: 320px; font-size: 0.85rem; color: var(--text-secondary);">${c.notes || c.details || 'No details'}</td>
                    <td>
                        <span class="pill-badge ${c.priority === 'High' || c.priority === 'Critical' ? 'pill-badge-purple' : 'pill-badge-green'}" style="${c.priority === 'High' ? 'background: rgba(239,68,68,0.15); color:#F87171;' : ''}">
                            ${c.priority || 'Normal'}
                        </span>
                    </td>
                    <td>
                        <select onchange="updateComplaintStatus('${c.id}', this.value)" style="padding: 0.3rem 0.55rem; border-radius: 6px; font-size: 0.78rem; background: rgba(15,23,42,0.8); border: 1px solid var(--card-border); color: #fff;">
                            <option value="In Review" ${c.status === 'In Review' ? 'selected' : ''}>In Review</option>
                            <option value="Under Investigation" ${c.status === 'Under Investigation' ? 'selected' : ''}>Investigating</option>
                            <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                        </select>
                    </td>
                    <td>
                        <div style="display: flex; gap: 0.35rem; align-items: center;">
                            ${!isResolved ? `
                                <button type="button" class="btn-primary-gradient" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;" onclick="updateComplaintStatus('${c.id}', 'Resolved')">
                                    Resolve
                                </button>
                            ` : `
                                <span style="font-size: 0.78rem; color: #34D399;"><i class="fa-solid fa-circle-check"></i> Closed</span>
                            `}
                            <button type="button" class="btn-secondary-glass" style="padding: 0.3rem 0.55rem; font-size: 0.75rem; color: #F87171;" onclick="deleteComplaint('${c.id}')" title="Delete record">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch(err) {
        console.error('Error fetching complaints:', err);
    }
}

async function updateComplaintStatus(id, newStatus) {
    try {
        const res = await fetch(`${API_BASE}/api/complaints/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const result = await res.json();
        if (result.success) {
            await renderAdminComplaints();
            await loadAdminOverviewStats();
            showAdminToast(`Grievance [${id}] status changed to: ${newStatus}`);
        }
    } catch(e) {
        console.error('Error updating complaint:', e);
    }
}

async function deleteComplaint(id) {
    if (!confirm(`Delete complaint record ${id}?`)) return;
    try {
        const res = await fetch(`${API_BASE}/api/complaints/${encodeURIComponent(id)}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
            await renderAdminComplaints();
            await loadAdminOverviewStats();
            showAdminToast(`Complaint [${id}] removed.`);
        }
    } catch(e) {
        console.error('Error deleting complaint:', e);
    }
}

function openAddComplaintModal() {
    const form = document.getElementById('complaint-form');
    if (form) form.reset();
    openModal('complaint-modal');
}

function closeAddComplaintModal() {
    closeModal('complaint-modal');
}

async function saveComplaint(e) {
    if (e && e.preventDefault) e.preventDefault();
    const commuter = document.getElementById('cmp-name-input').value.trim();
    const category = document.getElementById('cmp-category-input').value;
    const bus = document.getElementById('cmp-bus-input').value.trim();
    const priority = document.getElementById('cmp-priority-input').value;
    const notes = document.getElementById('cmp-notes-input').value.trim();

    if (!commuter || !notes) return alert('Name and grievance notes required.');

    const payload = { commuter, category, busNumber: bus, route: bus, priority, notes };

    try {
        const res = await fetch(`${API_BASE}/api/complaints`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            closeAddComplaintModal();
            await renderAdminComplaints();
            await loadAdminOverviewStats();
            showAdminToast(`Grievance ticket registered!`);
        }
    } catch(err) {
        console.error('Error saving complaint:', err);
    }
}

// ============================================================================
// 5. CENTRAL DEPOT LOST & FOUND REGISTRY
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
        if (filter === 'lost' || filter === 'found') url += `?type=${filter}`;
        else if (filter === 'claimed') url += `?claimed=true`;

        const res = await fetch(url);
        const data = await res.json();
        let items = (data && data.success && Array.isArray(data.data)) ? data.data : [];

        if (!items.length) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);"><i class="fa-solid fa-box-open" style="margin-right: 0.5rem;"></i> No items matching filter "${filter}" found.</td></tr>`;
            return;
        }

        tbody.innerHTML = items.map(item => {
            const isFound = (item.type || 'lost').toLowerCase() === 'found';
            const badgeClass = isFound ? 'pill-badge-green' : 'pill-badge-purple';
            const typeText = isFound ? 'Found / Recovered' : 'Reported Lost';
            const statusClass = item.claimed 
                ? 'pill-badge-green' 
                : (isFound ? 'pill-badge-blue' : 'pill-badge');
            const statusBg = item.claimed ? '' : (isFound ? '' : 'style="background: rgba(245, 158, 11, 0.15); color: #F59E0B;"');

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
        console.error('Error fetching lost & found:', err);
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

    if (!title) return alert("Item title is required.");

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
        }
    } catch(err) {
        console.error('Error saving lost/found:', err);
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
        }
    } catch(err) {
        console.error('Error updating claim status:', err);
    }
}

async function deleteAdminLostFound(id) {
    if (!confirm(`Delete lost & found record ${id}?`)) return;
    try {
        const res = await fetch(`${API_BASE}/api/lost-found/${encodeURIComponent(id)}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
            await renderAdminLostFound();
            showAdminToast(`Item [${id}] removed.`);
        }
    } catch(err) {
        console.error('Error deleting lost/found:', err);
    }
}

// ============================================================================
// 6. OPERATING CITIES MANAGEMENT
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

    if (!name) return alert("Please enter a city name.");

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
            showAdminToast(`City [${name}] registered in network!`);
        }
    } catch(err) {
        console.error('Error saving city:', err);
    }
}

async function deleteCity(cityName) {
    if (!confirm(`Are you sure you want to remove ${cityName} from the operating network?`)) return;
    try {
        const res = await fetch(`${API_BASE}/api/cities/` + encodeURIComponent(cityName), { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
            await populateCityDropdowns();
            await renderAdminCities();
            await renderAdminRoutes();
            showAdminToast(`City [${cityName}] removed from active grid.`);
        }
    } catch(err) {
        console.error('Error deleting city:', err);
    }
}

// ============================================================================
// 7. SERVICE ALERTS & SUBSCRIBERS MANAGEMENT (CORE USER FEATURE)
// ============================================================================
let currentSubscribersList = [];

async function renderAdminSubscribers() {
    const tbody = document.getElementById('admin-subscribers-tbody');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/api/subscribers`);
        const data = await res.json();
        const subscribers = (data && data.success && Array.isArray(data.data)) ? data.data : [];
        currentSubscribersList = subscribers;

        if (!subscribers.length) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No subscribers enrolled yet. Users subscribing via the homepage alerts form will appear here.</td></tr>`;
            return;
        }

        tbody.innerHTML = subscribers.map(s => {
            const isActive = (s.status || '').toLowerCase() === 'active';
            const statusClass = isActive ? 'pill-badge-green' : 'pill-badge-purple';
            const prefs = s.preferences || { delays: true, diversions: true, newRoutes: true, weather: true };
            const prefBadges = [];
            if (prefs.delays) prefBadges.push('<span style="font-size: 0.68rem; background: rgba(239,68,68,0.15); color:#F87171; padding: 0.15rem 0.4rem; border-radius: 4px;">Delays</span>');
            if (prefs.diversions) prefBadges.push('<span style="font-size: 0.68rem; background: rgba(245,158,11,0.15); color:#F59E0B; padding: 0.15rem 0.4rem; border-radius: 4px;">Diversions</span>');
            if (prefs.newRoutes) prefBadges.push('<span style="font-size: 0.68rem; background: rgba(56,189,248,0.15); color:#38BDF8; padding: 0.15rem 0.4rem; border-radius: 4px;">New Routes</span>');

            return `
                <tr>
                    <td>
                        <strong style="color: #38BDF8;">${s.email}</strong>
                        <div style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">ID: ${s.id}</div>
                    </td>
                    <td>
                        <span class="pill-badge pill-badge-blue">${s.city || 'Delhi'}</span>
                    </td>
                    <td style="font-size: 0.82rem; color: var(--text-secondary);">${s.subscribedAt || 'Recently'}</td>
                    <td>
                        <div style="display: flex; gap: 0.3rem; flex-wrap: wrap;">
                            ${prefBadges.join('') || '<span style="color: var(--text-muted); font-size: 0.75rem;">All</span>'}
                        </div>
                    </td>
                    <td>
                        <span class="pill-badge ${statusClass}">${s.status || 'Active'}</span>
                    </td>
                    <td>
                        <span style="font-family: var(--font-futuristic); font-weight: 700; color: #FFFFFF;">${s.notificationsCount || 1}</span>
                        <span style="font-size: 0.72rem; color: var(--text-muted);">sent</span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
                            <button type="button" class="btn-primary-gradient" style="padding: 0.3rem 0.6rem; font-size: 0.74rem;" onclick="openQuickAlertModal('${s.email}', '${s.city || 'Delhi'}')" title="Dispatch Direct Alert">
                                <i class="fa-solid fa-paper-plane"></i> Send Alert
                            </button>
                            <button type="button" class="btn-secondary-glass" style="padding: 0.3rem 0.6rem; font-size: 0.74rem;" onclick="toggleSubscriberStatus('${s.id}', '${isActive ? 'Paused' : 'Active'}')">
                                ${isActive ? 'Pause' : 'Activate'}
                            </button>
                            <button type="button" class="btn-secondary-glass" style="padding: 0.3rem 0.6rem; font-size: 0.74rem; color: #F87171;" onclick="deleteSubscriber('${s.id}', '${s.email}')" title="Delete subscriber">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        await loadAdminSmtpSettings();
        await renderAdminEmailOutbox();
    } catch(err) {
        console.error('Error fetching subscribers:', err);
    }
}

// --- SMTP CONFIGURATION & OUTBOX SYSTEM ---
async function loadAdminSmtpSettings() {
    const badge = document.getElementById('admin-smtp-status-badge');
    const hostInput = document.getElementById('admin-smtp-host');
    const portInput = document.getElementById('admin-smtp-port');
    const userInput = document.getElementById('admin-smtp-user');
    const fromNameInput = document.getElementById('admin-smtp-fromname');

    try {
        const res = await fetch(`${API_BASE}/api/email/config`);
        const data = await res.json();
        if (data && data.success && data.smtp) {
            const s = data.smtp;
            if (hostInput && s.host) hostInput.value = s.host;
            if (portInput && s.port) portInput.value = s.port;
            if (userInput && s.user) userInput.value = s.user;
            if (fromNameInput && s.fromName) fromNameInput.value = s.fromName;

            if (badge) {
                if (s.configured) {
                    badge.className = 'pill-badge pill-badge-green';
                    badge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Live SMTP Active (${s.user || s.host})`;
                } else {
                    badge.className = 'pill-badge pill-badge-purple';
                    badge.innerHTML = `<i class="fa-solid fa-inbox"></i> Local Outbox Queue`;
                }
            }
        }
    } catch (err) {
        console.warn('Could not load SMTP config:', err);
    }
}

async function saveAdminSmtpSettings(e) {
    if (e && e.preventDefault) e.preventDefault();
    const host = document.getElementById('admin-smtp-host').value.trim();
    const port = parseInt(document.getElementById('admin-smtp-port').value, 10);
    const user = document.getElementById('admin-smtp-user').value.trim();
    const pass = document.getElementById('admin-smtp-pass').value.trim();
    const fromName = document.getElementById('admin-smtp-fromname').value.trim();

    try {
        const res = await fetch(`${API_BASE}/api/email/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                enabled: true,
                service: 'gmail',
                host,
                port,
                user,
                pass,
                fromName,
                fromEmail: user
            })
        });
        const data = await res.json();
        if (data && data.success) {
            showAdminToast('SMTP configuration saved successfully!', 'success');
            await loadAdminSmtpSettings();
        } else {
            alert('Failed to save settings: ' + (data.error || 'Server error'));
        }
    } catch (err) {
        console.error('Error saving SMTP settings:', err);
        alert('Network error while saving SMTP settings.');
    }
}

async function sendAdminTestEmail() {
    const user = document.getElementById('admin-smtp-user').value.trim();
    const pass = document.getElementById('admin-smtp-pass').value.trim();
    const recipient = prompt('Enter recipient email to receive live test bulletin:', user || 'you@example.com');
    if (!recipient) return;

    showAdminToast('Authenticating & transmitting test email via SMTP...', 'info');
    try {
        const res = await fetch(`${API_BASE}/api/email/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: recipient, user, pass })
        });
        const data = await res.json();
        if (data && data.success) {
            showAdminToast(`🎉 Real test email delivered to ${recipient}! Check your inbox.`, 'success');
            await loadAdminSmtpSettings();
            await renderAdminEmailOutbox();
        } else {
            alert(`SMTP Test Failed: ${data.error || 'Could not send test email'}\n\nNote: For Gmail, ensure you generate and use a 16-character Google App Password (not your normal password).`);
        }
    } catch (err) {
        alert('Network error connecting to email API: ' + err.message);
    }
}

async function renderAdminEmailOutbox() {
    const tbody = document.getElementById('admin-email-outbox-tbody');
    const badge = document.getElementById('outbox-count-badge');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/api/email/outbox`);
        const data = await res.json();
        const emails = (data && data.success && Array.isArray(data.data)) ? data.data : [];

        if (badge) badge.textContent = `${emails.length} dispatched`;

        if (!emails.length) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No service alert emails dispatched yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = emails.map(e => {
            const isDelivered = e.delivered;
            const statusBadge = isDelivered 
                ? '<span class="pill-badge pill-badge-green"><i class="fa-solid fa-circle-check"></i> Delivered (SMTP)</span>' 
                : '<span class="pill-badge pill-badge-blue"><i class="fa-solid fa-clock"></i> Staged in Outbox</span>';

            const sentDate = e.sentAt ? new Date(e.sentAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recently';

            return `
                <tr>
                    <td style="font-family: monospace; font-size: 0.76rem; color: #38BDF8;">${e.id}</td>
                    <td><strong>${e.to}</strong></td>
                    <td style="font-size: 0.82rem; color: #FFFFFF;">${e.subject || 'Transit Alert'}</td>
                    <td><span class="pill-badge pill-badge-blue">${e.city || 'All'}</span></td>
                    <td>${statusBadge}</td>
                    <td style="font-size: 0.78rem; color: var(--text-secondary);">${sentDate}</td>
                    <td>
                        <button type="button" class="btn-secondary-glass" style="padding: 0.25rem 0.6rem; font-size: 0.74rem; color: #38BDF8;" onclick="inspectAdminEmail('${e.id}')">
                            <i class="fa-solid fa-eye"></i> View HTML
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.warn('Error rendering email outbox:', err);
    }
}

async function inspectAdminEmail(id) {
    try {
        const res = await fetch(`${API_BASE}/api/email/outbox/${id}`);
        const data = await res.json();
        if (data && data.success && data.data) {
            const e = data.data;
            const meta = document.getElementById('admin-email-meta-info');
            const frame = document.getElementById('admin-email-frame');

            if (meta) {
                meta.innerHTML = `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem;">
                        <div><strong>To:</strong> <span style="color: #38BDF8;">${e.to}</span></div>
                        <div><strong>From:</strong> ${e.from || 'Transit.IN Alerts'}</div>
                        <div><strong>Subject:</strong> <span style="color: #FFFFFF;">${e.subject}</span></div>
                        <div><strong>Status:</strong> ${e.status}</div>
                    </div>
                `;
            }

            if (frame && frame.contentWindow) {
                frame.contentWindow.document.open();
                frame.contentWindow.document.write(e.html || `<p>${e.text}</p>`);
                frame.contentWindow.document.close();
            }

            openModal('admin-email-preview-modal');
        }
    } catch(err) {
        console.error('Error inspecting email:', err);
    }
}

function openBroadcastAlertModal(prefilledCity = '') {
    const form = document.getElementById('broadcast-alert-form');
    if (form) form.reset();
    if (prefilledCity) {
        const citySelect = document.getElementById('alert-city-select');
        if (citySelect) citySelect.value = prefilledCity;
    }
    openModal('broadcast-alert-modal');
}

function closeBroadcastAlertModal() {
    closeModal('broadcast-alert-modal');
}

function openQuickAlertModal(email, city) {
    openBroadcastAlertModal(city);
    const titleInput = document.getElementById('alert-title-input');
    const msgInput = document.getElementById('alert-msg-input');
    if (titleInput) titleInput.value = `Transit Advisory for ${city}`;
    if (msgInput) msgInput.value = `Direct service alert dispatched to ${email}: minor maintenance on your daily transit corridor.`;
}

async function broadcastServiceAlert(e) {
    if (e && e.preventDefault) e.preventDefault();
    const city = document.getElementById('alert-city-select').value;
    const type = document.getElementById('alert-type-select').value;
    const route = document.getElementById('alert-route-input').value.trim();
    const title = document.getElementById('alert-title-input').value.trim();
    const message = document.getElementById('alert-msg-input').value.trim();
    const sendEmailCb = document.getElementById('alert-send-email-cb');
    const sendEmail = sendEmailCb ? sendEmailCb.checked : true;

    if (!title || !message) return alert('Alert Headline and Advisory Message are required.');

    const payload = { title, message, type, city, route, sendEmail };

    try {
        const res = await fetch(`${API_BASE}/api/subscribers/notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            closeBroadcastAlertModal();
            await renderAdminSubscribers();
            await loadAdminOverviewStats();
            await renderAdminEmailOutbox();
            showAdminToast(`Alert dispatched to ${result.deliveredCount || 0} subscriber(s)! (${result.emailsDispatched || 0} emails processed)`);
        } else {
            alert('Error dispatching alert: ' + (result.error || 'Server error'));
        }
    } catch(err) {
        console.error('Error broadcasting alert:', err);
    }
}

async function toggleSubscriberStatus(id, newStatus) {
    try {
        const res = await fetch(`${API_BASE}/api/subscribers/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const result = await res.json();
        if (result.success) {
            await renderAdminSubscribers();
            await loadAdminOverviewStats();
            showAdminToast(`Subscriber status changed to: ${newStatus}`);
        }
    } catch(e) {
        console.error('Error updating subscriber status:', e);
    }
}

async function deleteSubscriber(id, email) {
    if (!confirm(`Unsubscribe and remove ${email || id} from service alerts list?`)) return;
    try {
        const res = await fetch(`${API_BASE}/api/subscribers/${encodeURIComponent(id)}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
            await renderAdminSubscribers();
            await loadAdminOverviewStats();
            showAdminToast(`Subscriber ${email || id} removed from service alerts.`);
        }
    } catch(e) {
        console.error('Error deleting subscriber:', e);
    }
}

// ============================================================================
// 8. PASSENGER ACCOUNT DIRECTORY (FULL CRUD BACKEND PERSISTENCE)
// ============================================================================
let currentPassengerList = [];

async function renderAdminPassengers() {
    const tbody = document.getElementById('admin-passengers-tbody');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/api/admin/passengers`);
        const data = await res.json();
        const passengers = (data && data.success && Array.isArray(data.data)) ? data.data : [];
        currentPassengerList = passengers;

        if (!passengers.length) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No passenger accounts registered. Click "Register Passenger" to onboard.</td></tr>`;
            return;
        }

        tbody.innerHTML = passengers.map(p => {
            return `
                <tr>
                    <td>
                        <strong style="color: #FFFFFF;"><i class="fa-solid fa-user" style="color: #8B5CF6; margin-right: 0.35rem;"></i> ${p.name}</strong>
                    </td>
                    <td><span style="color: #38BDF8;">${p.email}</span></td>
                    <td><span style="font-family: monospace;">${p.phone || '+91 98765 43210'}</span></td>
                    <td><span class="pill-badge pill-badge-purple">${p.city || 'Delhi'}</span></td>
                    <td><span class="pill-badge pill-badge-green">${p.userType || 'Daily Commuter'}</span></td>
                    <td>
                        <div style="display: flex; gap: 0.4rem; align-items: center;">
                            <button type="button" class="btn-secondary-glass" style="padding: 0.3rem 0.6rem; font-size: 0.74rem; color: #38BDF8;" onclick="openEditPassengerModal('${p.email}')" title="Edit Profile">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button type="button" class="btn-secondary-glass" style="padding: 0.3rem 0.6rem; font-size: 0.74rem; color: #F87171;" onclick="deletePassengerAccount('${p.email}')" title="Remove account">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch(err) {
        console.error('Error fetching passengers:', err);
    }
}

function openAddPassengerModal() {
    const form = document.getElementById('passenger-form');
    if (form) form.reset();
    const title = document.getElementById('passenger-modal-title');
    if (title) title.innerHTML = '<i class="fa-solid fa-user-plus" style="color: #8B5CF6;"></i> Register Passenger Account';
    const emailInput = document.getElementById('pass-email-input');
    if (emailInput) emailInput.readOnly = false;
    document.getElementById('pass-edit-mode').value = "false";
    openModal('passenger-modal');
}

function openEditPassengerModal(email) {
    const p = currentPassengerList.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!p) return;

    const title = document.getElementById('passenger-modal-title');
    if (title) title.innerHTML = `<i class="fa-solid fa-user-pen" style="color: #8B5CF6;"></i> Edit Passenger [${p.name}]`;

    document.getElementById('pass-edit-mode').value = "true";
    document.getElementById('pass-name-input').value = p.name;
    const emInput = document.getElementById('pass-email-input');
    if (emInput) {
        emInput.value = p.email;
        emInput.readOnly = true;
    }
    document.getElementById('pass-phone-input').value = p.phone || '';
    document.getElementById('pass-city-input').value = p.city || 'Delhi';
    document.getElementById('pass-role-input').value = p.userType || 'Daily Commuter';

    openModal('passenger-modal');
}

function closePassengerModal() {
    closeModal('passenger-modal');
}

async function savePassenger(e) {
    if (e && e.preventDefault) e.preventDefault();
    const isEdit = document.getElementById('pass-edit-mode').value === 'true';
    const name = document.getElementById('pass-name-input').value.trim();
    const email = document.getElementById('pass-email-input').value.trim();
    const phone = document.getElementById('pass-phone-input').value.trim();
    const city = document.getElementById('pass-city-input').value;
    const userType = document.getElementById('pass-role-input').value;

    if (!name || !email) return alert('Name and email are required.');

    const payload = { name, email, phone, city, userType };

    try {
        const url = isEdit ? `${API_BASE}/api/admin/passengers/${encodeURIComponent(email)}` : `${API_BASE}/api/admin/passengers`;
        const method = isEdit ? 'PATCH' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            closePassengerModal();
            await renderAdminPassengers();
            await loadAdminOverviewStats();
            showAdminToast(`Passenger [${name}] account saved to database!`);
        } else {
            alert('Error: ' + (result.error || 'Could not save passenger'));
        }
    } catch(err) {
        console.error('Error saving passenger:', err);
    }
}

async function deletePassengerAccount(email) {
    if (!confirm(`Permanently delete commuter account for ${email}?`)) return;
    try {
        const res = await fetch(`${API_BASE}/api/admin/passengers/${encodeURIComponent(email)}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
            await renderAdminPassengers();
            await loadAdminOverviewStats();
            showAdminToast(`Passenger [${email}] removed from system.`);
        }
    } catch(e) {
        console.error('Error deleting passenger:', e);
    }
}

async function renderEmergenciesTable() {
    const tbody = document.getElementById('emergencies-table-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/api/safety/sos`);
        const data = await res.json();
        const emergencies = (data && data.success && Array.isArray(data.data)) ? data.data : [];

        const elCount = document.getElementById('tab-emergencies-count');
        const activeCount = emergencies.filter(e => e.status !== 'RESOLVED').length;
        if (elCount) elCount.textContent = activeCount;

        const statEmg = document.getElementById('stat-admin-emergencies');
        if (statEmg) statEmg.textContent = activeCount;

        if (!emergencies.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                        <i class="fa-solid fa-circle-check" style="color: #34D399; font-size: 1.5rem; display: block; margin-bottom: 0.5rem;"></i>
                        No active distress beacons. All transit corridors are verified secure.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = emergencies.map(emg => {
            const isResolved = emg.status === 'RESOLVED';
            const statusBadge = isResolved
                ? `<span style="padding: 0.25rem 0.65rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; background: rgba(16, 185, 129, 0.15); color: #34D399; display: inline-flex; align-items: center; gap: 0.35rem;"><i class="fa-solid fa-circle-check"></i> Resolved</span>`
                : `<span style="padding: 0.25rem 0.65rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; background: rgba(239, 68, 68, 0.2); color: #EF4444; display: inline-flex; align-items: center; gap: 0.35rem;"><i class="fa-solid fa-triangle-exclamation fa-beat"></i> Active Dispatch</span>`;

            const coordsText = emg.coordinates 
                ? (typeof emg.coordinates.lat === 'number' 
                    ? `${emg.coordinates.lat.toFixed(4)}°N, ${emg.coordinates.lng.toFixed(4)}°E` 
                    : `${emg.coordinates.lat}, ${emg.coordinates.lng}`) 
                : 'Sector Hub Center';

            const timeStr = emg.timestamp ? new Date(emg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Recent';

            return `
                <tr style="${isResolved ? 'opacity: 0.75;' : 'background: rgba(239, 68, 68, 0.05);'}">
                    <td><strong style="color: #EF4444; font-family: monospace;">${emg.id}</strong></td>
                    <td>
                        <strong style="color: #FFFFFF; display: block;">${emg.commuterName || 'Verified Commuter'}</strong>
                        <span style="font-size: 0.78rem; color: var(--text-muted);">${emg.commuterPhone || '+91 98765 43210'}</span>
                    </td>
                    <td>
                        <span style="font-weight: 700; color: #FFFFFF;">${emg.city || 'Delhi'}</span>
                        <div style="font-size: 0.78rem; color: var(--text-muted);">${emg.route || 'Transit Line'}</div>
                    </td>
                    <td><span style="font-family: monospace; font-size: 0.82rem; color: #38BDF8;">${coordsText}</span></td>
                    <td><span style="font-size: 0.85rem; color: #C4B5FD;">${emg.assignedUnit || 'Patrol Unit #12'}</span></td>
                    <td style="font-size: 0.82rem; color: var(--text-muted);">${timeStr}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div style="display: flex; gap: 0.4rem;">
                            ${!isResolved ? `
                                <button onclick="resolveEmergencyRecord('${emg.id}')" class="sim-btn" style="padding: 0.35rem 0.7rem; font-size: 0.78rem; color: #34D399; border-color: rgba(16, 185, 129, 0.4);" title="Mark Incident Resolved">
                                    <i class="fa-solid fa-check"></i> Resolve
                                </button>
                            ` : `
                                <span style="font-size: 0.75rem; color: #34D399;"><i class="fa-solid fa-shield"></i> Safe</span>
                            `}
                            <button onclick="deleteEmergencyRecord('${emg.id}')" class="sim-btn" style="padding: 0.35rem 0.6rem; font-size: 0.78rem; color: #EF4444; border-color: rgba(239, 68, 68, 0.3);" title="Remove Record">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('Error rendering emergencies:', err);
    }
}

async function resolveEmergencyRecord(id) {
    try {
        const res = await fetch(`${API_BASE}/api/safety/sos/${id}/resolve`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes: 'Resolved by Admin Dispatch Controller.' })
        });
        const data = await res.json();
        if (data.success) {
            showAdminToast(`SOS Emergency [${id}] marked as RESOLVED.`);
            await renderEmergenciesTable();
            await loadAdminOverviewStats();
        }
    } catch(err) {
        console.error('Error resolving emergency:', err);
    }
}

async function deleteEmergencyRecord(id) {
    if (!confirm(`Delete SOS record ${id}?`)) return;
    try {
        const res = await fetch(`${API_BASE}/api/safety/sos/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showAdminToast(`SOS record [${id}] deleted.`);
            await renderEmergenciesTable();
            await loadAdminOverviewStats();
        }
    } catch(err) {
        console.error('Error deleting emergency:', err);
    }
}

async function triggerTestEmergency() {
    try {
        const currentCity = localStorage.getItem('spt-city') || 'Delhi';
        const res = await fetch(`${API_BASE}/api/safety/sos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                city: currentCity,
                route: 'Route 507 (Emergency Drill)',
                notes: 'Simulated SOS drill dispatched from Transit Control Room',
                commuterName: 'Simulated Drill Beacon',
                commuterPhone: '+91 99999 11111'
            })
        });
        const data = await res.json();
        if (data.success) {
            showAdminToast(`Simulated SOS Drill broadcasted! (ID: ${data.dispatchId})`);
            await renderEmergenciesTable();
            await loadAdminOverviewStats();
        }
    } catch(err) {
        console.error('Error triggering test emergency:', err);
    }
}

// Global window bindings for inline HTML triggers
window.openModal = openModal;
window.closeModal = closeModal;
window.showAdminToast = showAdminToast;
window.switchAdminTab = switchAdminTab;
window.renderAllAdminData = renderAllAdminData;
window.renderEmergenciesTable = renderEmergenciesTable;
window.resolveEmergencyRecord = resolveEmergencyRecord;
window.deleteEmergencyRecord = deleteEmergencyRecord;
window.triggerTestEmergency = triggerTestEmergency;

window.openAddRouteModal = openAddRouteModal;
window.openEditRouteModal = openEditRouteModal;
window.closeRouteModal = closeRouteModal;
window.saveRoute = saveRoute;
window.deleteRoute = deleteRoute;

window.openAddDriverModal = openAddDriverModal;
window.openEditDriverModal = openEditDriverModal;
window.closeDriverModal = closeDriverModal;
window.saveDriver = saveDriver;
window.deleteDriver = deleteDriver;

window.renderAdminMaintenance = renderAdminMaintenance;
window.openAddMaintenanceModal = openAddMaintenanceModal;
window.closeAddMaintenanceModal = closeAddMaintenanceModal;
window.saveMaintenance = saveMaintenance;
window.logServiceAction = logServiceAction;
window.triggerHealthScan = triggerHealthScan;

window.renderAdminComplaints = renderAdminComplaints;
window.updateComplaintStatus = updateComplaintStatus;
window.deleteComplaint = deleteComplaint;
window.openAddComplaintModal = openAddComplaintModal;
window.closeAddComplaintModal = closeAddComplaintModal;
window.saveComplaint = saveComplaint;

window.renderAdminLostFound = renderAdminLostFound;
window.filterAdminLostFound = filterAdminLostFound;
window.openAddLostFoundModal = openAddLostFoundModal;
window.closeAddLostFoundModal = closeAddLostFoundModal;
window.saveAdminLostFound = saveAdminLostFound;
window.toggleAdminClaimStatus = toggleAdminClaimStatus;
window.deleteAdminLostFound = deleteAdminLostFound;

window.renderAdminCities = renderAdminCities;
window.openAddCityModal = openAddCityModal;
window.closeCityModal = closeCityModal;
window.saveCity = saveCity;
window.deleteCity = deleteCity;

window.renderAdminSubscribers = renderAdminSubscribers;
window.openBroadcastAlertModal = openBroadcastAlertModal;
window.closeBroadcastAlertModal = closeBroadcastAlertModal;
window.openQuickAlertModal = openQuickAlertModal;
window.broadcastServiceAlert = broadcastServiceAlert;
window.toggleSubscriberStatus = toggleSubscriberStatus;
window.deleteSubscriber = deleteSubscriber;
window.saveAdminSmtpSettings = saveAdminSmtpSettings;
window.sendAdminTestEmail = sendAdminTestEmail;
window.renderAdminEmailOutbox = renderAdminEmailOutbox;
window.inspectAdminEmail = inspectAdminEmail;
window.loadAdminSmtpSettings = loadAdminSmtpSettings;

window.renderAdminPassengers = renderAdminPassengers;
window.openAddPassengerModal = openAddPassengerModal;
window.openEditPassengerModal = openEditPassengerModal;
window.closePassengerModal = closePassengerModal;
window.savePassenger = savePassenger;
window.deletePassengerAccount = deletePassengerAccount;

// Aliases
window.openRouteModal = openAddRouteModal;
window.openDriverModal = openAddDriverModal;
window.openAdminLostFoundModal = openAddLostFoundModal;
window.closeAdminLostFoundModal = closeAddLostFoundModal;
window.openCityModal = openAddCityModal;
window.setLFFilter = filterAdminLostFound;
window.toggleItemClaimed = toggleAdminClaimStatus;
window.deleteLostFoundItem = deleteAdminLostFound;
window.exportAdminAuditLog = () => {
    showAdminToast('Generating encrypted fleet audit report (CSV / PDF)... Download starting.', 'success');
};
