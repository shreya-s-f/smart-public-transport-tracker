// Notifications Data and Logic

const notificationsData = [
    {
        id: 1,
        type: 'alert', // alert, warning, info
        title: 'Route 42 - Major Delay',
        message: 'Expect delays up to 15 minutes due to heavy traffic on Central Avenue.',
        time: '10 mins ago',
        route: '42'
    },
    {
        id: 2,
        type: 'warning',
        title: 'Stop Relocation',
        message: 'The University Campus stop has been moved 50 meters north due to construction.',
        time: '1 hour ago',
        route: '15B'
    },
    {
        id: 3,
        type: 'info',
        title: 'Weekend Schedule Active',
        message: 'All routes are now operating on the weekend schedule.',
        time: '5 hours ago',
        route: 'All'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('notifications-container');
    
    if (container) {
        renderNotifications(notificationsData);
    }
    
    function renderNotifications(notifications) {
        container.innerHTML = '';
        
        notifications.forEach(notif => {
            let icon = 'fa-info-circle';
            if(notif.type === 'alert') icon = 'fa-triangle-exclamation';
            if(notif.type === 'warning') icon = 'fa-circle-exclamation';
            
            const item = document.createElement('div');
            item.className = `notification-item ${notif.type}`;
            
            item.innerHTML = `
                <div class="notification-content">
                    <div class="notification-time">${notif.time} &bull; Route ${notif.route}</div>
                    <h4><i class="fa-solid ${icon}" style="margin-right: 0.5rem; color: ${getColorForType(notif.type)}"></i>${notif.title}</h4>
                    <p style="color: var(--text-secondary); font-size: 0.95rem;">${notif.message}</p>
                </div>
            `;
            
            container.appendChild(item);
        });
    }
    
    function getColorForType(type) {
        if(type === 'alert') return 'var(--danger-color)';
        if(type === 'warning') return 'var(--warning-color)';
        return 'var(--accent-color)'; // info
    }
});
