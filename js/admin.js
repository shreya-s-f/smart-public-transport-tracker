// Admin Route Management JavaScript Logic

document.addEventListener('DOMContentLoaded', () => {
    renderAdminRoutes();

    // Form Submit Event
    const form = document.getElementById('route-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveRoute();
        });
    }
});

function getCustomRoutes() {
    try {
        return JSON.parse(localStorage.getItem('spt-custom-routes')) || [];
    } catch(e) {
        return [];
    }
}

function saveCustomRoutes(routes) {
    localStorage.setItem('spt-custom-routes', JSON.stringify(routes));
    renderAdminRoutes();
}

function renderAdminRoutes() {
    const container = document.getElementById('admin-routes-container');
    const totalSpan = document.getElementById('admin-total-custom');
    if (!container) return;

    const customRoutes = getCustomRoutes();
    if (totalSpan) totalSpan.textContent = customRoutes.length;

    if (customRoutes.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No custom routes created yet. Click <strong>"Add New Route"</strong> to create one!</p>
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

function openAddModal() {
    document.getElementById('modal-title').textContent = "Add Bus Route";
    document.getElementById('route-index').value = "-1";
    document.getElementById('route-form').reset();
    document.getElementById('route-modal').style.display = 'flex';
}

function closeRouteModal() {
    document.getElementById('route-modal').style.display = 'none';
}

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
    document.getElementById('form-first').value = route.first || '06:00 AM';
    document.getElementById('form-last').value = route.last || '10:00 PM';

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
        last: document.getElementById('form-last').value.trim() || '10:00 PM',
        freq: 'Every 15 mins'
    };

    let customRoutes = getCustomRoutes();
    if (index >= 0 && index < customRoutes.length) {
        customRoutes[index] = newRoute;
    } else {
        customRoutes.push(newRoute);
    }

    saveCustomRoutes(customRoutes);
    closeRouteModal();
}

function deleteRoute(index) {
    if (confirm("Are you sure you want to delete this bus route?")) {
        let customRoutes = getCustomRoutes();
        customRoutes.splice(index, 1);
        saveCustomRoutes(customRoutes);
    }
}
