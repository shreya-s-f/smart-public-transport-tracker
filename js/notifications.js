// Timetable and Notifications Data - Pan India

const cityTimetableData = {
    'Delhi': [
        { stop: 'Connaught Place', first: '06:00 AM', last: '11:30 PM', freq: 'Every 15 mins', status: 'Active' },
        { stop: 'India Gate', first: '06:10 AM', last: '11:40 PM', freq: 'Every 15 mins', status: 'Active' },
        { stop: 'AIIMS', first: '06:25 AM', last: '11:55 PM', freq: 'Every 15 mins', status: 'Minor Delays' },
        { stop: 'Okhla', first: '06:40 AM', last: '12:10 AM', freq: 'Every 15 mins', status: 'Active' },
    ],
    'Mumbai': [
        { stop: 'CSMT', first: '05:30 AM', last: '11:00 PM', freq: 'Every 10 mins', status: 'Active' },
        { stop: 'Marine Drive', first: '05:45 AM', last: '11:15 PM', freq: 'Every 10 mins', status: 'Active' },
        { stop: 'Worli Sea Face', first: '06:00 AM', last: '11:30 PM', freq: 'Every 10 mins', status: 'Active' },
        { stop: 'Bandra', first: '06:20 AM', last: '11:50 PM', freq: 'Every 10 mins', status: 'Minor Delays' },
    ],
    'Bangalore': [
        { stop: 'Majestic (KBS)', first: '05:00 AM', last: '11:30 PM', freq: 'Every 20 mins', status: 'Active' },
        { stop: 'Corporation', first: '05:15 AM', last: '11:45 PM', freq: 'Every 20 mins', status: 'Heavy Traffic' },
        { stop: 'Silk Board', first: '05:40 AM', last: '12:00 AM', freq: 'Every 30 mins', status: 'Heavy Traffic' },
        { stop: 'Electronic City', first: '06:10 AM', last: '12:30 AM', freq: 'Every 30 mins', status: 'Active' },
    ]
};

const cityAlertsData = {
    'Delhi': [
        { type: 'alert', title: 'Route 507 - Major Delay', message: 'Expect delays up to 15 minutes due to heavy traffic near AIIMS.', time: '10 mins ago', route: '507' },
        { type: 'warning', title: 'Stop Relocation', message: 'The India Gate stop has been moved 50 meters north due to VIP movement.', time: '1 hour ago', route: 'All' },
    ],
    'Mumbai': [
        { type: 'alert', title: 'BEST 301 - Waterlogging', message: 'Service suspended temporarily due to waterlogging in Dadar.', time: '20 mins ago', route: '301' },
        { type: 'warning', title: 'AC-10 Rerouted', message: 'Buses rerouted via Sea Link due to roadwork in Bandra.', time: '2 hours ago', route: 'AC-10' },
    ],
    'Bangalore': [
        { type: 'alert', title: 'Silk Board Traffic', message: 'Severe traffic congestion at Silk Board junction. All V-500 series buses delayed by 45 mins.', time: 'Just now', route: 'V-500D' },
        { type: 'info', title: 'Weekend Schedule Active', message: 'BMTC is operating on a weekend schedule today.', time: '5 hours ago', route: 'All' },
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    const currentCity = localStorage.getItem('spt-city') || 'Delhi';
    
    // --- Timetable Logic ---
    const tbody = document.getElementById('timetable-body');
    const tableHeading = document.getElementById('timetable-heading');
    
    if (tbody) {
        if (tableHeading) tableHeading.innerHTML = `Weekly Schedule for <span style="color: var(--accent-color);">${currentCity}</span>`;
        const data = cityTimetableData[currentCity] || cityTimetableData['Delhi'];
        
        tbody.innerHTML = '';
        data.forEach((row, index) => {
            const statusClass = row.status === 'Active' ? 'status-ontime' : 'status-delayed';
            const animDelay = (index * 0.1);
            
            const card = document.createElement('div');
            card.className = 'glass-card route-item animate-fade-in-up';
            card.style.animationDelay = `${animDelay}s`;
            card.innerHTML = `
                <div class="route-details" style="flex: 1;">
                    <span class="route-number" style="display: block; margin-bottom: 0.5rem;"><i class="fa-solid fa-map-pin"></i> ${row.stop}</span>
                    <span style="font-size: 0.9rem; color: var(--text-secondary); display: flex; gap: 1rem; align-items: center;">
                        <span><i class="fa-solid fa-hourglass-start"></i> First: ${row.first}</span>
                        <span><i class="fa-solid fa-hourglass-end"></i> Last: ${row.last}</span>
                        <span><i class="fa-solid fa-clock-rotate-left"></i> ${row.freq}</span>
                    </span>
                </div>
                <div class="route-actions" style="margin-left: 1rem;">
                    <span class="route-status ${statusClass}">${row.status}</span>
                </div>
            `;
            tbody.appendChild(card);
        });
    }

    // --- Notifications Logic ---
    const alertsContainer = document.getElementById('notifications-container');
    const alertsHeading = document.getElementById('alerts-heading');

    if (alertsContainer) {
        if(alertsHeading) alertsHeading.innerHTML = `System Alerts for <span style="color: var(--accent-color);">${currentCity}</span>`;
        const data = cityAlertsData[currentCity] || cityAlertsData['Delhi'];
        
        alertsContainer.innerHTML = '';
        data.forEach((notif, index) => {
            let icon = 'fa-info-circle';
            let color = 'var(--accent-color)';
            if(notif.type === 'alert') { icon = 'fa-triangle-exclamation'; color = 'var(--danger-color)'; }
            if(notif.type === 'warning') { icon = 'fa-circle-exclamation'; color = 'var(--warning-color)'; }
            
            const animDelay = (index * 0.1);
            
            const item = document.createElement('div');
            item.className = `notification-item ${notif.type} animate-fade-in-up`;
            item.style.animationDelay = `${animDelay}s`;
            item.innerHTML = `
                <div class="notification-content">
                    <div class="notification-time">${notif.time} &bull; Route ${notif.route}</div>
                    <h4><i class="fa-solid ${icon}" style="margin-right: 0.5rem; color: ${color}"></i>${notif.title}</h4>
                    <p style="color: var(--text-secondary); font-size: 0.95rem;">${notif.message}</p>
                </div>
            `;
            alertsContainer.appendChild(item);
        });
    }
});
