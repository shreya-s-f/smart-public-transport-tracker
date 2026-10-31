// Pan-India Routes Data and Interactive Explorer Logic

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('route-list-container');
    const searchInput = document.getElementById('route-search');
    const counterBadge = document.getElementById('route-counter-badge');
    const heading = document.getElementById('routes-heading');
    const filterPills = document.querySelectorAll('.filter-pill');

    const currentCity = localStorage.getItem('spt-city') || 'Delhi';
    
    // Retrieve all routes using centralized TransitData (includes custom routes from Admin)
    const routesData = window.TransitData 
        ? window.TransitData.getAllRoutesForCity(currentCity)
        : [];

    let activeFilter = 'all';

    // Handle Auto-Search from Dashboard query params
    const urlParams = new URLSearchParams(window.location.search);
    const initialSearch = urlParams.get('search') || '';

    if (heading) {
        heading.innerHTML = `Available Routes in <span style="color: var(--accent-color);">${currentCity}</span>`;
    }

    // Filter pill click listener
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeFilter = pill.getAttribute('data-category');
            filterAndRender();
        });
    });

    if (searchInput) {
        searchInput.placeholder = `Search routes in ${currentCity} by number, stop or area (e.g. ${routesData[0]?.id || '507'})...`;
        if (initialSearch) {
            searchInput.value = initialSearch;
        }

        searchInput.addEventListener('input', () => {
            filterAndRender();
        });
    }

    function filterAndRender() {
        const term = (searchInput ? searchInput.value : '').toLowerCase().trim();

        const filtered = routesData.filter(r => {
            const matchesSearch = !term || 
                r.id.toLowerCase().includes(term) ||
                (r.name && r.name.toLowerCase().includes(term)) ||
                (r.stops && r.stops.some(s => s.toLowerCase().includes(term))) ||
                (r.category && r.category.toLowerCase().includes(term));

            let matchesCategory = true;
            if (activeFilter === 'favorites') {
                let favs = [];
                try { favs = JSON.parse(localStorage.getItem('spt-favorites')) || []; } catch(e){}
                matchesCategory = favs.includes(r.id);
            } else if (activeFilter === 'electric') {
                matchesCategory = r.type === 'Electric' || (r.category && r.category.toLowerCase().includes('electric'));
            } else if (activeFilter === 'ac') {
                matchesCategory = r.type === 'AC' || (r.category && r.category.toLowerCase().includes('ac'));
            } else if (activeFilter === 'airport') {
                matchesCategory = (r.category && r.category.toLowerCase().includes('airport')) || r.id.toLowerCase().includes('airport') || r.id.toLowerCase().includes('kia');
            } else if (activeFilter === 'feeder') {
                matchesCategory = (r.category && r.category.toLowerCase().includes('feeder')) || r.id.toLowerCase().includes('metro');
            }

            return matchesSearch && matchesCategory;
        });

        renderRoutes(filtered);
    }

    function renderRoutes(routes) {
        if (!container) return;
        container.innerHTML = '';

        if (counterBadge) {
            counterBadge.textContent = `Showing ${routes.length} of ${routesData.length} routes in ${currentCity}`;
        }

        if (routes.length === 0) {
            container.innerHTML = `
            <div class="empty-state animate-fade-in-up">
                <i class="fa-solid fa-bus-slash"></i>
                <h3>No routes found ${activeFilter === 'favorites' ? 'in your Pinned Favorites' : `for "${searchInput ? searchInput.value : ''}"`}</h3>
                <p>${activeFilter === 'favorites' ? 'Click the heart icon on any route to pin it to your favorites for quick access.' : 'Try searching another bus number, stop name, or switch category filter.'}</p>
            </div>`;
            return;
        }

        let favorites = [];
        try { favorites = JSON.parse(localStorage.getItem('spt-favorites')) || []; } catch (e) {}

        routes.forEach((route, index) => {
            const isFav = favorites.includes(route.id);
            const statusClass = route.status === 'On Time' ? 'status-ontime' : 'status-delayed';
            const heartClass = isFav ? 'fa-solid favorite-active' : 'fa-regular';
            const animDelay = (index % 6) * 0.08;

            let badgeClass = 'badge-regular';
            let badgeIcon = 'fa-bus';
            if (route.type === 'Electric') { badgeClass = 'badge-electric'; badgeIcon = 'fa-bolt'; }
            else if (route.type === 'AC') { badgeClass = 'badge-ac'; badgeIcon = 'fa-snowflake'; }
            else if (route.category?.toLowerCase().includes('airport')) { badgeClass = 'badge-express'; badgeIcon = 'fa-plane'; }

            const stopsList = route.stops || (route.name ? route.name.split(/\s*➔\s*|\s*->\s*/) : ['Origin', 'Destination']);
            const stopsCount = stopsList.length;
            const stopsSummary = stopsList.length > 2 
                ? `${stopsList[0]} ➔ ${stopsList[1]} ➔ ... ➔ ${stopsList[stopsList.length - 1]}`
                : route.name;

            // Generate stops sequence list for the drawer
            const stopsDrawerHtml = stopsList.map((stop, sIdx) => {
                const isInterchange = /metro|airport|junction|terminal|railway|station|cross/i.test(stop);
                const interchangeTag = isInterchange 
                    ? `<span style="font-size: 0.7rem; background: rgba(139, 92, 246, 0.15); color: #8b5cf6; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 600;"><i class="fa-solid fa-shuffle"></i> Interchange</span>` 
                    : '';
                return `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.45rem 0.6rem; border-radius: 6px; background: rgba(15, 23, 42, 0.03); margin-bottom: 0.3rem;">
                        <div style="display: flex; align-items: center; gap: 0.6rem;">
                            <span style="font-size: 0.72rem; font-weight: 700; width: 22px; height: 22px; border-radius: 50%; background: var(--card-border); display: flex; align-items: center; justify-content: center; color: var(--text-secondary);">${sIdx + 1}</span>
                            <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-primary);">${stop}</span>
                            ${interchangeTag}
                        </div>
                        <a href="booking.html?route=${encodeURIComponent(route.id)}&boarding=${encodeURIComponent(stop)}" style="font-size: 0.75rem; color: var(--accent-color); text-decoration: none; font-weight: 600;">
                            Board Here <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                `;
            }).join('');

            const card = document.createElement('div');
            card.className = 'glass-card route-item animate-fade-in-up';
            card.style.animationDelay = `${animDelay}s`;
            card.style.padding = '1.25rem 1.5rem';
            card.style.marginBottom = '0.9rem';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                    <div class="route-details" style="flex: 1; min-width: 260px;">
                        <div style="display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.4rem;">
                            <span class="route-number"><i class="fa-solid fa-bus-simple"></i> ${route.id}</span>
                            <span class="badge-pill ${badgeClass}"><i class="fa-solid ${badgeIcon}"></i> ${route.type || 'Standard'}</span>
                            <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 500;">${route.category || 'Transit Line'}</span>
                            <span class="route-status ${statusClass}">${route.status}</span>
                        </div>

                        <p class="route-path" style="font-weight: 600; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.4rem;">
                            ${route.name}
                        </p>

                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                            <i class="fa-solid fa-route" style="color: var(--accent-color);"></i>
                            <span>${stopsSummary}</span>
                            <span style="background: rgba(0,0,0,0.04); padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 600;">${stopsCount} Stops</span>
                        </div>

                        <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; gap: 1.2rem; flex-wrap: wrap;">
                            <span><i class="fa-solid fa-indian-rupee-sign" style="color: var(--success-color);"></i> <strong>₹${route.fare}</strong> Fare</span>
                            <span><i class="fa-solid fa-arrows-rotate" style="color: var(--accent-color);"></i> ${route.frequency || 'Every 15 min'}</span>
                            <span><i class="fa-regular fa-clock"></i> ${route.firstBus || '05:30 AM'} - ${route.lastBus || '11:00 PM'}</span>
                        </div>
                    </div>

                    <div class="route-actions" style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.6rem; min-width: 140px;">
                        <div style="display: flex; gap: 0.5rem; align-items: center; width: 100%; justify-content: flex-end;">
                            <button class="btn-primary" style="padding: 0.5rem 1.1rem; font-size: 0.88rem; border-radius: 8px; display: inline-flex; align-items: center; gap: 0.4rem;" onclick="window.location.href='booking.html?route=${encodeURIComponent(route.id)}'">
                                <i class="fa-solid fa-ticket"></i> Book
                            </button>
                            <button class="btn-icon track-btn" data-id="${route.id}" title="Track Live Map">
                                <i class="fa-solid fa-location-crosshairs" style="color: var(--accent-color);"></i>
                            </button>
                            <button class="btn-icon fav-btn" data-id="${route.id}" title="Pin to Favorites">
                                <i class="${heartClass} fa-heart"></i>
                            </button>
                        </div>

                        <!-- Toggle Stops Accordion Button -->
                        <button class="sim-btn toggle-stops-btn" data-route-id="${route.id}" style="font-size: 0.78rem; padding: 0.35rem 0.75rem; border-radius: 6px;">
                            <i class="fa-solid fa-list-ol"></i> <span id="stops-toggle-txt-${route.id}">View ${stopsCount} Stops</span>
                        </button>
                    </div>
                </div>

                <!-- Expandable Stops & Interchange Drawer -->
                <div id="stops-drawer-${route.id}" style="display: none; margin-top: 1rem; padding-top: 0.8rem; border-top: 1px dashed var(--card-border);" class="animate-fade-in-up">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                        <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">
                            <i class="fa-solid fa-signs-post" style="color: var(--accent-color);"></i> Complete Stop Sequence &amp; Metro Connections
                        </span>
                        <span style="font-size: 0.75rem; color: var(--text-secondary);">First bus: ${route.firstBus || '05:30 AM'}</span>
                    </div>
                    <div style="max-height: 220px; overflow-y: auto; padding-right: 0.3rem;">
                        ${stopsDrawerHtml}
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Favorite & Track listeners
        document.querySelectorAll('.fav-btn').forEach(btn => btn.addEventListener('click', handleFavoriteToggle));
        document.querySelectorAll('.track-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                window.location.href = `tracking.html?route=${encodeURIComponent(id)}`;
            });
        });

        // Toggle Stops Drawer listeners
        document.querySelectorAll('.toggle-stops-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rId = e.currentTarget.getAttribute('data-route-id');
                const drawer = document.getElementById(`stops-drawer-${rId}`);
                const txt = document.getElementById(`stops-toggle-txt-${rId}`);
                if (!drawer) return;

                if (drawer.style.display === 'none') {
                    drawer.style.display = 'block';
                    if (txt) txt.textContent = 'Hide Stops';
                    e.currentTarget.style.color = 'var(--accent-color)';
                } else {
                    drawer.style.display = 'none';
                    if (txt) txt.textContent = `View Stops`;
                    e.currentTarget.style.color = 'inherit';
                }
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
            if (typeof showSptToast === 'function') {
                showSptToast(`Removed Route ${routeId} from Pinned Favorites`, 'info');
            }
            if (activeFilter === 'favorites') {
                filterAndRender();
            }
        } else {
            favorites.push(routeId);
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid', 'favorite-active');
            if (typeof showSptToast === 'function') {
                showSptToast(`⭐ Route ${routeId} pinned to Favorites!`, 'success');
            }
        }
        localStorage.setItem('spt-favorites', JSON.stringify(favorites));
    }

    // Initial render
    filterAndRender();
});
