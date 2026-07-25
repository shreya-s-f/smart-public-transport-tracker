// Pan-India Routes Data and Logic

const cityRoutesData = {
    'Delhi': [
        { id: '507', path: 'Okhla ➔ Connaught Place', status: 'On Time', stops: 14 },
        { id: 'GL-23', path: 'Gurgaon ➔ Airport T3', status: '5m Delay', stops: 8 },
        { id: '390', path: 'Mayur Vihar ➔ AIIMS', status: 'On Time', stops: 12 },
        { id: 'Metro Feeder 1', path: 'Saket Metro ➔ Malviya Nagar', status: 'On Time', stops: 4 },
    ],
    'Mumbai': [
        { id: 'BEST 301', path: 'Bandra Station ➔ Juhu Beach', status: 'On Time', stops: 10 },
        { id: 'AC-10', path: 'Andheri ➔ BKC', status: '15m Delay', stops: 15 },
        { id: 'C-71', path: 'Colaba ➔ CSMT', status: 'On Time', stops: 6 },
        { id: 'BEST 42', path: 'Dadar ➔ Worli Sea Face', status: 'On Time', stops: 7 },
    ],
    'Bangalore': [
        { id: 'V-500D', path: 'Silk Board ➔ Hebbal', status: 'Heavy Traffic', stops: 20 },
        { id: 'KIA-9', path: 'Majestic ➔ Airport', status: 'On Time', stops: 5 },
        { id: '335E', path: 'Kempagowda ➔ Whitefield', status: '10m Delay', stops: 22 },
        { id: 'Metro Feeder', path: 'Indiranagar ➔ Domlur', status: 'On Time', stops: 4 },
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('route-list-container');
    const searchInput = document.getElementById('route-search');
    
    // Get city from global storage
    const currentCity = localStorage.getItem('spt-city') || 'Delhi';
    const routesData = cityRoutesData[currentCity] || cityRoutesData['Delhi'];
    
    // Handle Auto-Search from Dashboard
    const urlParams = new URLSearchParams(window.location.search);
    const initialSearch = urlParams.get('search') || '';
    
    // Update heading
    const heading = document.getElementById('routes-heading');
    if (heading) heading.innerHTML = `Available Routes in <span style="color: var(--accent-color);">${currentCity}</span>`;

    if (container) {
        if (searchInput) {
            searchInput.placeholder = `Search routes in ${currentCity} (e.g. ${routesData[0].id})`;
            if (initialSearch) {
                searchInput.value = initialSearch;
            }
            
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = routesData.filter(r => 
                    r.id.toLowerCase().includes(term) || 
                    r.path.toLowerCase().includes(term)
                );
                renderRoutes(filtered);
            });
            
            // Initial render
            const term = initialSearch.toLowerCase();
            const filtered = routesData.filter(r => 
                r.id.toLowerCase().includes(term) || 
                r.path.toLowerCase().includes(term)
            );
            renderRoutes(filtered);
        } else {
            renderRoutes(routesData);
        }
    }

    function renderRoutes(routes) {
        container.innerHTML = '';
        
        if (routes.length === 0) {
            container.innerHTML = `
            <div class="empty-state animate-fade-in-up">
                <i class="fa-solid fa-bus-slash"></i>
                <h3>No routes found</h3>
                <p>We couldn't find any active buses for your search.</p>
            </div>`;
            return;
        }

        // Get favorites from local storage
        let favorites = [];
        try { favorites = JSON.parse(localStorage.getItem('spt-favorites')) || []; } catch (e) {}

        routes.forEach((route, index) => {
            const isFav = favorites.includes(route.id);
            const statusClass = route.status === 'On Time' ? 'status-ontime' : 'status-delayed';
            const heartClass = isFav ? 'fa-solid favorite-active' : 'fa-regular';
            
            // Add animation delay based on index
            const animDelay = (index % 5) * 0.1;
            
            const card = document.createElement('div');
            card.className = 'glass-card route-item animate-fade-in-up';
            card.style.animationDelay = `${animDelay}s`;
            card.innerHTML = `
                <div class="route-details">
                    <span class="route-number"><i class="fa-solid fa-bus"></i> ${route.id}</span>
                    <span class="route-path">${route.path}</span>
                    <span style="font-size: 0.85rem; color: var(--text-secondary);"><i class="fa-solid fa-map-pin"></i> ${route.stops} Stops</span>
                </div>
                <div class="route-actions" style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.8rem;">
                    <span class="route-status ${statusClass}">${route.status}</span>
                    <div style="display: flex; gap: 0.5rem; margin-top: 0.2rem; align-items: center;">
                        <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem; border-radius: 8px;" onclick="window.location.href='booking.html?route=${encodeURIComponent(route.id)}'">
                            Book
                        </button>
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

        document.querySelectorAll('.fav-btn').forEach(btn => btn.addEventListener('click', handleFavoriteToggle));
        document.querySelectorAll('.track-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                window.location.href = `tracking.html?route=${encodeURIComponent(id)}`;
            });
        });
    }

    function handleFavoriteToggle(e) {
        const btn = e.currentTarget;
        const icon = btn.querySelector('i');
        const routeId = btn.getAttribute('data-id');
        
        let favorites = [];
        try { favorites = JSON.parse(localStorage.getItem('spt-favorites')) || []; } catch (err) {}
        
        if (favorites.includes(routeId)) {
            favorites = favorites.filter(id => id !== routeId);
            icon.classList.remove('fa-solid', 'favorite-active');
            icon.classList.add('fa-regular');
        } else {
            favorites.push(routeId);
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid', 'favorite-active');
        }
        localStorage.setItem('spt-favorites', JSON.stringify(favorites));
    }
});
