// Pan-India Timetable Engine with Platform Bays and Departure Countdown

document.addEventListener('DOMContentLoaded', () => {
    const timetableContainer = document.getElementById('timetable-body');
    const timeFilters = document.querySelectorAll('#timetable-time-filters .filter-pill');
    const offlineBtn = document.getElementById('offline-cache-btn');
    const offlineBadge = document.getElementById('offline-status-badge');
    const heading = document.getElementById('timetable-heading');

    const currentCity = localStorage.getItem('spt-city') || 'Delhi';
    if (heading) {
        heading.innerHTML = `Weekly Transit Schedule &bull; <span style="color: var(--accent-color);">${currentCity}</span>`;
    }

    const routes = window.TransitData ? window.TransitData.getAllRoutesForCity(currentCity) : [];
    let activeTimeFilter = 'all';

    // Time filter listeners
    timeFilters.forEach(pill => {
        pill.addEventListener('click', () => {
            timeFilters.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeTimeFilter = pill.getAttribute('data-time');
            renderTimetable();
        });
    });

    // Offline caching listener
    if (offlineBtn) {
        offlineBtn.addEventListener('click', () => {
            localStorage.setItem('spt-cached-schedule-' + currentCity, JSON.stringify(routes));
            if (offlineBadge) {
                offlineBadge.innerHTML = '<i class="fa-solid fa-cloud-check"></i> Schedule Cached Offline';
                offlineBadge.style.color = '#34d399';
            }
            if (window.TransitInteractions) {
                TransitInteractions.showToast('Schedule successfully stored for offline viewing', 'success');
            } else {
                alert('Schedule for ' + currentCity + ' cached locally for offline travel!');
            }
        });
    }

    function getPlatformBay(id) {
        const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        return 'Bay ' + ((hash % 12) + 1);
    }

    function renderTimetable() {
        if (!timetableContainer) return;
        timetableContainer.innerHTML = '';

        if (routes.length === 0) {
            timetableContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-calendar-xmark"></i>
                    <h3>No timetable available</h3>
                    <p>No active schedules found for ${currentCity}.</p>
                </div>`;
            return;
        }

        routes.forEach((route, index) => {
            const bay = getPlatformBay(route.id);
            const firstBus = route.firstBus || '05:30 AM';
            const lastBus = route.lastBus || '11:00 PM';
            const freq = route.frequency || 'Every 12 min';

            // Calculate live departure countdown (simulated 3-18 mins)
            const remainingMins = ((index * 3 + 4) % 15) + 2;

            const card = document.createElement('div');
            card.className = 'glass-card route-item animate-fade-in-up';
            card.style.animationDelay = `${(index % 5) * 0.08}s`;
            card.style.padding = '1.2rem 1.4rem';
            card.style.marginBottom = '0.9rem';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div style="flex: 1; min-width: 240px;">
                        <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem; flex-wrap: wrap;">
                            <span class="route-number"><i class="fa-solid fa-bus"></i> ${route.id}</span>
                            <span style="font-size: 0.78rem; font-weight: 700; background: rgba(139, 92, 246, 0.15); color: #8B5CF6; padding: 0.2rem 0.6rem; border-radius: 8px;">
                                <i class="fa-solid fa-signs-post"></i> ${bay}
                            </span>
                            <span style="font-size: 0.78rem; font-weight: 700; background: rgba(56, 189, 248, 0.15); color: #38BDF8; padding: 0.2rem 0.6rem; border-radius: 8px;">
                                ${route.type || 'Standard'}
                            </span>
                            <span style="font-size: 0.82rem; color: #34D399; font-weight: 600;">
                                <i class="fa-solid fa-clock-rotate-left"></i> In ${remainingMins}m
                            </span>
                        </div>
                        <div style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.3rem;">
                            ${route.name}
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; gap: 1rem; flex-wrap: wrap;">
                            <span><i class="fa-regular fa-clock"></i> First: <strong>${firstBus}</strong></span>
                            <span><i class="fa-regular fa-moon"></i> Last: <strong>${lastBus}</strong></span>
                            <span><i class="fa-solid fa-arrows-rotate" style="color: var(--accent-color);"></i> ${freq}</span>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 0.6rem; align-items: center;">
                        <a href="tracking.html?route=${encodeURIComponent(route.id)}" class="btn-secondary-glass" style="padding: 0.5rem 1rem; font-size: 0.84rem; text-decoration: none;">
                            <i class="fa-solid fa-location-crosshairs"></i> Track Live
                        </a>
                        <a href="booking.html?route=${encodeURIComponent(route.id)}" class="btn-primary-gradient" style="padding: 0.5rem 1rem; font-size: 0.84rem; text-decoration: none;">
                            <i class="fa-solid fa-ticket"></i> Book
                        </a>
                    </div>
                </div>
            `;
            timetableContainer.appendChild(card);
        });
    }

    renderTimetable();
});
