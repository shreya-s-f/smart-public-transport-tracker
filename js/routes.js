// Routes Data and Logic

const routesData = [
    { id: '10A', path: 'Downtown ➔ Tech Park', status: 'On Time', stops: 12 },
    { id: '42', path: 'Central Station ➔ Airport', status: '5m Delay', stops: 8 },
    { id: '15B', path: 'University ➔ North Mall', status: 'On Time', stops: 15 },
    { id: '8', path: 'City Center ➔ Harbor', status: 'On Time', stops: 6 },
    { id: '99', path: 'Westside ➔ Eastside Express', status: '12m Delay', stops: 4 },
    { id: '21', path: 'Hospital ➔ Old Town', status: 'On Time', stops: 9 },
];

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('route-list-container');
    const searchInput = document.getElementById('route-search');
    
    if (container) {
        renderRoutes(routesData);

        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = routesData.filter(r => 
                    r.id.toLowerCase().includes(term) || 
                    r.path.toLowerCase().includes(term)
                );
                renderRoutes(filtered);
            });
        }
    }

    function renderRoutes(routes) {
        container.innerHTML = '';
        
        if (routes.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No routes found matching your search.</p>';
            return;
        }

        // Get favorites from local storage
        let favorites = [];
        try {
            favorites = JSON.parse(localStorage.getItem('spt-favorites')) || [];
        } catch (e) {
            console.error("Could not parse favorites");
        }

        routes.forEach(route => {
            const isFav = favorites.includes(route.id);
            const statusClass = route.status === 'On Time' ? 'status-ontime' : 'status-delayed';
            const heartClass = isFav ? 'fa-solid favorite-active' : 'fa-regular';
            
            const card = document.createElement('div');
            card.className = 'glass-card route-item';
            card.innerHTML = `
                <div class="route-details">
                    <span class="route-number">Route ${route.id}</span>
                    <span class="route-path">${route.path}</span>
                    <span style="font-size: 0.85rem; color: var(--text-secondary);"><i class="fa-solid fa-map-pin"></i> ${route.stops} Stops</span>
                </div>
                <div class="route-actions" style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
                    <span class="route-status ${statusClass}">${route.status}</span>
                    <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                        <button class="btn-icon track-btn" data-id="${route.id}" title="Track Bus">
                            <i class="fa-solid fa-location-crosshairs"></i>
                        </button>
                        <button class="btn-icon fav-btn" data-id="${route.id}" title="Toggle Favorite">
                            <i class="${heartClass} fa-heart"></i>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Add event listeners for new buttons
        document.querySelectorAll('.fav-btn').forEach(btn => {
            btn.addEventListener('click', handleFavoriteToggle);
        });

        document.querySelectorAll('.track-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                window.location.href = `tracking.html?route=${id}`;
            });
        });
    }

    function handleFavoriteToggle(e) {
        const btn = e.currentTarget;
        const icon = btn.querySelector('i');
        const routeId = btn.getAttribute('data-id');
        
        let favorites = [];
        try {
            favorites = JSON.parse(localStorage.getItem('spt-favorites')) || [];
        } catch (err) {}
        
        if (favorites.includes(routeId)) {
            // Remove
            favorites = favorites.filter(id => id !== routeId);
            icon.classList.remove('fa-solid', 'favorite-active');
            icon.classList.add('fa-regular');
        } else {
            // Add
            favorites.push(routeId);
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid', 'favorite-active');
        }
        
        localStorage.setItem('spt-favorites', JSON.stringify(favorites));
    }
});
