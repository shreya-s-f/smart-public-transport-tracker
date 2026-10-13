// Timetable and Notifications Logic - Pan India

document.addEventListener('DOMContentLoaded', () => {
    const currentCity = localStorage.getItem('spt-city') || 'Delhi';
    
    // --- Timetable Logic ---
    const tbody = document.getElementById('timetable-body');
    const tableHeading = document.getElementById('timetable-heading');
    
    if (tbody) {
        if (tableHeading) {
            tableHeading.innerHTML = `Weekly Transit Timetable for <span style="color: var(--accent-color);">${currentCity}</span>`;
        }

        const routes = window.TransitData 
            ? window.TransitData.getAllRoutesForCity(currentCity)
            : [];
        
        tbody.innerHTML = '';
        if (routes.length === 0) {
            tbody.innerHTML = '<div class="empty-state"><p>No timetables available for this city.</p></div>';
        } else {
            routes.forEach((route, index) => {
                const statusClass = route.status === 'On Time' ? 'status-ontime' : 'status-delayed';
                const animDelay = (index % 6) * 0.08;
                
                const card = document.createElement('div');
                card.className = 'glass-card route-item animate-fade-in-up';
                card.style.animationDelay = `${animDelay}s`;
                card.style.marginBottom = '0.8rem';
                card.style.padding = '1.2rem 1.5rem';
                card.innerHTML = `
                    <div class="route-details" style="flex: 1;">
                        <div style="display: flex; gap: 0.6rem; align-items: center; margin-bottom: 0.4rem; flex-wrap: wrap;">
                            <span class="route-number"><i class="fa-solid fa-bus"></i> ${route.id}</span>
                            <span class="badge-pill ${route.type === 'Electric' ? 'badge-electric' : route.type === 'AC' ? 'badge-ac' : 'badge-regular'}">
                                ${route.type || 'Standard'}
                            </span>
                            <span style="font-size: 0.85rem; color: var(--text-secondary);">${route.category || 'Line'}</span>
                            <span class="route-status ${statusClass}" style="margin-left: auto;">${route.status}</span>
                        </div>

                        <p class="route-path" style="font-weight: 600; font-size: 1rem; margin-bottom: 0.5rem;">${route.name}</p>

                        <div style="font-size: 0.88rem; color: var(--text-secondary); display: flex; gap: 1.5rem; flex-wrap: wrap;">
                            <span><i class="fa-solid fa-hourglass-start" style="color: var(--accent-color);"></i> First Bus: <strong>${route.firstBus || '05:30 AM'}</strong></span>
                            <span><i class="fa-solid fa-hourglass-end" style="color: var(--danger-color);"></i> Last Bus: <strong>${route.lastBus || '11:00 PM'}</strong></span>
                            <span><i class="fa-solid fa-arrows-rotate" style="color: var(--success-color);"></i> Freq: <strong>${route.frequency || 'Every 15 min'}</strong></span>
                            <span><i class="fa-solid fa-indian-rupee-sign"></i> Fare: <strong>₹${route.fare || '35'}</strong></span>
                        </div>
                    </div>

                    <div class="route-actions" style="margin-left: 1.5rem; display: flex; gap: 0.5rem; align-items: center;">
                        <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="window.location.href='booking.html?route=${encodeURIComponent(route.id)}'">
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
