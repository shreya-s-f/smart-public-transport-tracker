// Admin Panel JavaScript Logic (Buses, Cities, Passengers)

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

    // Form Event Listeners
    const routeForm = document.getElementById('route-form');
    if (routeForm) {
        routeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveRoute();
        });
    }

    const cityForm = document.getElementById('city-form');
    if (cityForm) {
        cityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveCity();
        });
    }

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
    document.getElementById(`tab-${tab}`).classList.add('active');

    document.getElementById('section-buses').style.display = tab === 'buses' ? 'block' : 'none';
    document.getElementById('section-cities').style.display = tab === 'cities' ? 'block' : 'none';
    document.getElementById('section-passengers').style.display = tab === 'passengers' ? 'block' : 'none';
}

function renderAllAdminData() {
    populateCityDropdowns();
    renderAdminRoutes();
    renderAdminCities();
    renderAdminPassengers();
}

// --- CITY HELPERS ---
function getCities() {
    const defaultCities = ['Delhi', 'Mumbai', 'Bangalore'];
    let customCities = [];
    try { customCities = JSON.parse(localStorage.getItem('spt-custom-cities')) || []; } catch(e) {}
    return [...new Set([...defaultCities, ...customCities])];
}

function populateCityDropdowns() {
    const cities = getCities();
    const routeSelect = document.getElementById('form-city');
    const passSelect = document.getElementById('pass-city-input');

    if (routeSelect) {
        routeSelect.innerHTML = cities.map(c => `<option value="${c}">${c}</option>`).join('');
    }
    if (passSelect) {
        passSelect.innerHTML = cities.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    const cityStat = document.getElementById('stat-admin-cities');
    if (cityStat) cityStat.textContent = cities.length;
}

// --- 1. BUS & ROUTE MANAGEMENT ---
function getCustomRoutes() {
    try { return JSON.parse(localStorage.getItem('spt-custom-routes')) || []; } catch(e) { return []; }
}

function renderAdminRoutes() {
    const container = document.getElementById('admin-routes-container');
    const totalSpan = document.getElementById('stat-admin-buses');
    if (!container) return;

    const customRoutes = getCustomRoutes();
    if (totalSpan) totalSpan.textContent = customRoutes.length;

    if (customRoutes.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fa-solid fa-bus-slash" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No custom bus routes created yet. Click <strong>"Add New Route"</strong> to create one!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    customRoutes.forEach((route, index) => {
        const card = document.createElement('div');
        card.className = 'glass-card route-item animate-fade-in-up';
        card.innerHTML = `
            <div class="route-details" style="flex: 1;">
                <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.3rem;">
                    <span class="route-number">${route.id}</span>
                    <span style="font-size: 0.8rem; background: rgba(59, 130, 246, 0.1); color: var(--accent-color); padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 600;">${route.city}</span>
                    <span class="route-status ${route.status === 'Active' ? 'status-ontime' : 'status-delayed'}">${route.status}</span>
                </div>
                <p class="route-path" style="margin-bottom: 0.5rem;">${route.path}</p>
                <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; gap: 1rem;">
                    <span><i class="fa-solid fa-tag"></i> ${route.fare}</span>
                    <span><i class="fa-solid fa-clock"></i> ${route.first || '06:00 AM'} - ${route.last || '10:00 PM'}</span>
                </div>
            </div>
            <div class="route-actions" style="display: flex; gap: 0.5rem;">
                <button class="btn-primary" style="padding: 0.5rem 0.8rem; font-size: 0.85rem;" onclick="editRoute(${index})">
                    <i class="fa-solid fa-pen-to-square"></i> Edit
                </button>
                <button style="background: rgba(239, 68, 68, 0.15); color: var(--danger-color); border: 1px solid var(--danger-color); padding: 0.5rem 0.8rem; border-radius: 8px; font-weight: 600; cursor: pointer;" onclick="deleteRoute(${index})">
                    <i class="fa-solid fa-trash-can"></i> Delete
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function openAddRouteModal() {
    document.getElementById('modal-title').textContent = "Add Bus Route";
    document.getElementById('route-index').value = "-1";
    document.getElementById('route-form').reset();
    document.getElementById('route-modal').style.display = 'flex';
}

function closeRouteModal() { document.getElementById('route-modal').style.display = 'none'; }

function editRoute(index) {
    const customRoutes = getCustomRoutes();
    const route = customRoutes[index];
    if (!route) return;

    document.getElementById('modal-title').textContent = "Edit Bus Route";
    document.getElementById('route-index').value = index;
    document.getElementById('form-city').value = route.city || 'Delhi';
    document.getElementById('form-id').value = route.id;
    document.getElementById('form-path').value = route.path;
    document.getElementById('form-fare').value = route.fare || '₹30';
    document.getElementById('form-status').value = route.status || 'Active';

    document.getElementById('route-modal').style.display = 'flex';
}

function saveRoute() {
    const index = parseInt(document.getElementById('route-index').value);
    const newRoute = {
        city: document.getElementById('form-city').value,
        id: document.getElementById('form-id').value.trim(),
        path: document.getElementById('form-path').value.trim(),
        fare: document.getElementById('form-fare').value.trim(),
        status: document.getElementById('form-status').value,
        first: document.getElementById('form-first').value.trim() || '06:00 AM',
        last: document.getElementById('form-last').value.trim() || '10:00 PM'
    };

    let customRoutes = getCustomRoutes();
    if (index >= 0 && index < customRoutes.length) {
        customRoutes[index] = newRoute;
    } else {
        customRoutes.push(newRoute);
    }

    localStorage.setItem('spt-custom-routes', JSON.stringify(customRoutes));
    renderAdminRoutes();
    closeRouteModal();
}

function deleteRoute(index) {
    if (confirm("Delete this bus route?")) {
        let customRoutes = getCustomRoutes();
        customRoutes.splice(index, 1);
        localStorage.setItem('spt-custom-routes', JSON.stringify(customRoutes));
        renderAdminRoutes();
    }
}

// --- 2. CITY MANAGEMENT ---
function renderAdminCities() {
    const container = document.getElementById('admin-cities-container');
    if (!container) return;

    let customCities = [];
    try { customCities = JSON.parse(localStorage.getItem('spt-custom-cities')) || []; } catch(e) {}

    const allCities = getCities();

    container.innerHTML = '';
    allCities.forEach(city => {
        const isCustom = customCities.includes(city);
        const card = document.createElement('div');
        card.className = 'glass-card route-item animate-fade-in-up';
        card.innerHTML = `
            <div class="route-details" style="flex: 1;">
                <span class="route-number"><i class="fa-solid fa-city"></i> ${city}</span>
                <span style="font-size: 0.85rem; color: var(--text-secondary);">${isCustom ? 'Custom Added City' : 'Default Primary Operating Hub'}</span>
            </div>
            <div class="route-actions">
                ${isCustom ? `
                    <button style="background: rgba(239, 68, 68, 0.15); color: var(--danger-color); border: 1px solid var(--danger-color); padding: 0.4rem 0.8rem; border-radius: 8px; font-weight: 600; cursor: pointer;" onclick="deleteCity('${city}')">
                        <i class="fa-solid fa-trash-can"></i> Remove City
                    </button>
                ` : `<span class="route-status status-ontime">Default City</span>`}
            </div>
        `;
        container.appendChild(card);
    });
}

function openAddCityModal() {
    document.getElementById('city-form').reset();
    document.getElementById('city-modal').style.display = 'flex';
}
function closeCityModal() { document.getElementById('city-modal').style.display = 'none'; }

function saveCity() {
    const cityName = document.getElementById('city-name-input').value.trim();
    if (!cityName) return;

    let customCities = [];
    try { customCities = JSON.parse(localStorage.getItem('spt-custom-cities')) || []; } catch(e) {}

    if (!customCities.includes(cityName) && !['Delhi', 'Mumbai', 'Bangalore'].includes(cityName)) {
        customCities.push(cityName);
        localStorage.setItem('spt-custom-cities', JSON.stringify(customCities));
    }

    renderAllAdminData();
    closeCityModal();
}

function deleteCity(city) {
    if (confirm(`Remove city ${city} from system?`)) {
        let customCities = [];
        try { customCities = JSON.parse(localStorage.getItem('spt-custom-cities')) || []; } catch(e) {}
        customCities = customCities.filter(c => c !== city);
        localStorage.setItem('spt-custom-cities', JSON.stringify(customCities));
        renderAllAdminData();
    }
}

// --- 3. PASSENGER ACCOUNT MANAGEMENT ---
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
    document.getElementById('passenger-form').reset();
    document.getElementById('passenger-modal').style.display = 'flex';
}
function closePassengerModal() { document.getElementById('passenger-modal').style.display = 'none'; }

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
