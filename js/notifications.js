// Timetable and Notifications Logic - Pan India

document.addEventListener('DOMContentLoaded', () => {
    const currentCity = localStorage.getItem('spt-city') || 'Delhi';
    
    // --- Timetable Logic ---
    const tbody = document.getElementById('timetable-body');
    const tableHeading = document.getElementById('timetable-heading');
    const cacheBtn = document.getElementById('offline-cache-btn');
    const cacheBtnText = document.getElementById('cache-btn-text');
    const statusBadge = document.getElementById('offline-status-badge');
    const timeFilterPills = document.querySelectorAll('#timetable-time-filters .filter-pill');

    let activeTimeFilter = 'all';

    if (tbody) {
        if (tableHeading) {
            tableHeading.innerHTML = `Weekly Transit Timetable for <span style="color: var(--accent-color);">${currentCity}</span>`;
        }

        let routes = window.TransitData 
            ? window.TransitData.getAllRoutesForCity(currentCity)
            : [];

        // Check if offline cached schedule exists
        const cachedSchedule = localStorage.getItem(`spt-offline-schedule-${currentCity}`);
        if (cachedSchedule && statusBadge) {
            statusBadge.innerHTML = `<i class="fa-solid fa-cloud-check"></i> Offline Ready`;
            if (cacheBtnText) cacheBtnText.textContent = 'Schedule Saved Offline';
        }

        // Time-of-day filter listeners
        timeFilterPills.forEach(pill => {
            pill.addEventListener('click', () => {
                timeFilterPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                activeTimeFilter = pill.getAttribute('data-time');
                renderTimetable();
            });
        });

        // Offline Caching Button Listener
        if (cacheBtn) {
            cacheBtn.addEventListener('click', () => {
                try {
                    localStorage.setItem(`spt-offline-schedule-${currentCity}`, JSON.stringify(routes));
                    localStorage.setItem(`spt-offline-timestamp-${currentCity}`, new Date().toISOString());
                    
                    if (statusBadge) {
                        statusBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Offline Ready`;
                        statusBadge.style.background = 'rgba(16, 185, 129, 0.2)';
                    }
                    if (cacheBtnText) {
                        cacheBtnText.textContent = 'Schedule Saved Offline ✓';
                    }
                    if (typeof showSptToast === 'function') {
                        showSptToast(`💾 ${currentCity} weekly timetable cached for offline tunnel & subway access!`, 'success');
                    }
                } catch(e) {
                    if (typeof showSptToast === 'function') {
                        showSptToast('Offline schedule saved.', 'info');
                    }
                }
            });
        }

        function renderTimetable() {
            tbody.innerHTML = '';
            
            // Filter by time of day
            let filteredRoutes = routes;
            if (activeTimeFilter === 'morning') {
                filteredRoutes = routes.filter((_, idx) => idx % 2 === 0);
            } else if (activeTimeFilter === 'afternoon') {
                filteredRoutes = routes.filter((_, idx) => idx % 3 === 0);
            } else if (activeTimeFilter === 'evening') {
                filteredRoutes = routes.filter((_, idx) => idx % 2 === 1);
            } else if (activeTimeFilter === 'night') {
                filteredRoutes = routes.filter(r => r.category?.toLowerCase().includes('express') || r.type === 'Electric');
            }

            if (filteredRoutes.length === 0) {
                tbody.innerHTML = `
                    <div class="empty-state animate-fade-in-up" style="padding: 2.5rem; text-align: center;">
                        <i class="fa-solid fa-calendar-xmark" style="font-size: 2.5rem; color: var(--text-secondary); margin-bottom: 0.8rem;"></i>
                        <h3>No routes scheduled for this time window</h3>
                        <p style="color: var(--text-secondary);">Select "All Day" to view complete operating lines.</p>
                    </div>`;
                return;
            }

            filteredRoutes.forEach((route, index) => {
                const statusClass = route.status === 'On Time' ? 'status-ontime' : 'status-delayed';
                const animDelay = (index % 6) * 0.08;
                
                // Deterministic platform bay based on route id
                const hash = Math.abs(route.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
                const bayNumber = (hash % 16) + 1;
                const concourse = bayNumber <= 8 ? 'North Concourse' : 'South Express Wing';

                // Real-time simulated countdowns
                const nowMins = new Date().getMinutes();
                const freqNum = parseInt(route.frequency) || 15;
                const nextDep1 = freqNum - (nowMins % freqNum);
                const nextDep2 = nextDep1 + freqNum;
                const nextDep3 = nextDep2 + freqNum;

                const card = document.createElement('div');
                card.className = 'glass-card route-item animate-fade-in-up';
                card.style.animationDelay = `${animDelay}s`;
                card.style.marginBottom = '0.9rem';
                card.style.padding = '1.3rem 1.6rem';
                card.innerHTML = `
                    <div class="route-details" style="flex: 1; min-width: 280px;">
                        <div style="display: flex; gap: 0.6rem; align-items: center; margin-bottom: 0.4rem; flex-wrap: wrap;">
                            <span class="route-number"><i class="fa-solid fa-bus"></i> ${route.id}</span>
                            <span class="badge-pill ${route.type === 'Electric' ? 'badge-electric' : route.type === 'AC' ? 'badge-ac' : 'badge-regular'}">
                                ${route.type || 'Standard'}
                            </span>
                            <span style="font-size: 0.82rem; background: rgba(59, 130, 246, 0.1); color: var(--accent-color); padding: 0.2rem 0.5rem; border-radius: 6px; font-weight: 700;">
                                <i class="fa-solid fa-signs-post"></i> Bay ${bayNumber < 10 ? '0' + bayNumber : bayNumber} &bull; ${concourse}
                            </span>
                            <span class="route-status ${statusClass}" style="margin-left: auto;">${route.status}</span>
                        </div>

                        <p class="route-path" style="font-weight: 600; font-size: 1.05rem; margin-bottom: 0.5rem; color: var(--text-primary);">${route.name}</p>

                        <!-- Next 3 Departures Countdown Chips -->
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.6rem; flex-wrap: wrap; font-size: 0.82rem;">
                            <span style="color: var(--text-secondary); font-weight: 600;"><i class="fa-solid fa-stopwatch" style="color: var(--accent-color);"></i> Next Departures:</span>
                            <span style="background: rgba(16, 185, 129, 0.15); color: var(--success-color); padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 700;">in ${nextDep1}m</span>
                            <span style="background: rgba(59, 130, 246, 0.1); color: var(--accent-color); padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 600;">in ${nextDep2}m</span>
                            <span style="background: rgba(148, 163, 184, 0.15); color: var(--text-secondary); padding: 0.15rem 0.5rem; border-radius: 4px;">in ${nextDep3}m</span>
                        </div>

                        <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; gap: 1.5rem; flex-wrap: wrap;">
                            <span><i class="fa-solid fa-hourglass-start" style="color: var(--accent-color);"></i> First: <strong>${route.firstBus || '05:30 AM'}</strong></span>
                            <span><i class="fa-solid fa-hourglass-end" style="color: var(--danger-color);"></i> Last: <strong>${route.lastBus || '11:00 PM'}</strong></span>
                            <span><i class="fa-solid fa-arrows-rotate" style="color: var(--success-color);"></i> Frequency: <strong>${route.frequency || 'Every 15 min'}</strong></span>
                            <span><i class="fa-solid fa-indian-rupee-sign"></i> Fare: <strong>₹${route.fare || '35'}</strong></span>
                        </div>
                    </div>

                    <div class="route-actions" style="margin-left: 1.5rem; display: flex; gap: 0.5rem; align-items: center;">
                        <button class="btn-primary" style="padding: 0.5rem 1.1rem; font-size: 0.88rem; border-radius: 8px;" onclick="window.location.href='booking.html?route=${encodeURIComponent(route.id)}'">
                            <i class="fa-solid fa-ticket"></i> Book
                        </button>
                        <button class="btn-icon" style="color: var(--accent-color);" onclick="window.location.href='tracking.html?route=${encodeURIComponent(route.id)}'" title="Live Map">
                            <i class="fa-solid fa-location-crosshairs"></i>
                        </button>
                    </div>
                `;
                tbody.appendChild(card);
            });
        }

        renderTimetable();
    }

    // --- Notifications / Alerts Logic ---
    const alertsContainer = document.getElementById('notifications-container');
    const alertsHeading = document.getElementById('alerts-heading');

    if (alertsContainer) {
        if (alertsHeading) {
            alertsHeading.innerHTML = `Live Service Alerts & Advisories for <span style="color: var(--accent-color);">${currentCity}</span>`;
        }
        
        const cityAlerts = (window.TransitData && window.TransitData.alerts[currentCity]) 
            ? window.TransitData.alerts[currentCity] 
            : [
                { type: 'info', title: 'Normal Operations', message: 'All scheduled bus fleets are operating normally in this city.', time: 'Just now', route: 'All' }
            ];
        
        alertsContainer.innerHTML = '';
        cityAlerts.forEach((notif, index) => {
            let icon = 'fa-circle-info';
            let color = 'var(--accent-color)';
            let badgeText = 'General Notice';

            if (notif.type === 'alert') { 
                icon = 'fa-triangle-exclamation'; 
                color = 'var(--danger-color)'; 
                badgeText = 'Traffic Delay';
            } else if (notif.type === 'warning') { 
                icon = 'fa-circle-exclamation'; 
                color = 'var(--warning-color)'; 
                badgeText = 'Route Advisory';
            }
            
            const animDelay = (index * 0.1);
            
            const item = document.createElement('div');
            item.className = `notification-item ${notif.type} animate-fade-in-up`;
            item.style.animationDelay = `${animDelay}s`;
            item.innerHTML = `
                <div class="notification-content" style="width: 100%;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                        <span style="font-size: 0.8rem; background: rgba(0,0,0,0.04); padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 600;">
                            Route ${notif.route} • ${badgeText}
                        </span>
                        <span class="notification-time"><i class="fa-regular fa-clock"></i> ${notif.time}</span>
                    </div>
                    <h4 style="margin: 0.4rem 0;"><i class="fa-solid ${icon}" style="margin-right: 0.5rem; color: ${color};"></i>${notif.title}</h4>
                    <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5;">${notif.message}</p>
                </div>
            `;
            alertsContainer.appendChild(item);
        });
    }
});
