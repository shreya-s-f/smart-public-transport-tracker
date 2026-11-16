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

    // --- Weather Advisory & Commute Risk Advisor ---
    const weatherCard = document.getElementById('weather-advisory-card');
    if (weatherCard) {
        const cityWeather = {
            'Delhi': { temp: '31°C', sky: 'Clear Skies', risk: 'Low Delay Risk', status: 'Normal Flow', advice: 'Road conditions favorable across transit corridors. Ring Road flow steady.', icon: 'fa-sun', color: '#f59e0b' },
            'Mumbai': { temp: '28°C', sky: 'Passing Showers', risk: 'Moderate Delay Risk', status: 'Wet Road Alert', advice: 'Coastal Road spray & Western Express Highway moderate congestion (+5 min).', icon: 'fa-cloud-rain', color: '#3b82f6' },
            'Bangalore': { temp: '24°C', sky: 'Pleasant & Overcast', risk: 'Silk Board Jam', status: 'Peak Congestion', advice: 'Silk Board to Outer Ring Road heavy peak hour traffic. Allow 12 extra mins.', icon: 'fa-cloud', color: '#f59e0b' },
            'Bagalkot': { temp: '29°C', sky: 'Sunny', risk: 'Zero Delay', status: 'Clear Corridors', advice: 'Navanagar to Vidyagiri sector running strictly on scheduled timetable.', icon: 'fa-sun', color: '#10b981' },
            'Hyderabad': { temp: '30°C', sky: 'Sunny & Warm', risk: 'Low Delay Risk', status: 'Normal Flow', advice: 'Hitec City feeder lines on time. Outer Ring Road clear.', icon: 'fa-sun', color: '#f59e0b' },
            'Chennai': { temp: '32°C', sky: 'Humid Breeze', risk: 'Moderate Coastal Breeze', status: 'Normal Flow', advice: 'OMR IT Corridor & Anna Salai running on schedule.', icon: 'fa-wind', color: '#10b981' },
            'Pune': { temp: '26°C', sky: 'Mild Breeze', risk: 'Hinjawadi Congestion', status: 'Moderate Flow', advice: 'Shivajinagar to Hinjawadi Phase 1 experiencing light peak rush.', icon: 'fa-cloud-sun', color: '#f59e0b' }
        };

        const w = cityWeather[currentCity] || cityWeather['Delhi'];
        const iconEl = document.getElementById('weather-icon-container');
        const headEl = document.getElementById('weather-headline');
        const badgeEl = document.getElementById('weather-risk-badge');
        const adviceEl = document.getElementById('weather-commute-advice');

        if (iconEl) iconEl.innerHTML = `<i class="fa-solid ${w.icon}" style="color: ${w.color};"></i>`;
        if (headEl) headEl.textContent = `${w.temp} ${w.sky} • ${w.risk}`;
        if (badgeEl) {
            badgeEl.textContent = w.status;
            badgeEl.className = 'route-status ' + (w.status.includes('Congestion') || w.status.includes('Alert') ? 'status-delayed' : 'status-ontime');
        }
        if (adviceEl) adviceEl.textContent = w.advice;
    }

    // --- Notifications / Alerts Logic ---
    const alertsContainer = document.getElementById('notifications-container');
    const alertsHeading = document.getElementById('alerts-heading');

    if (alertsContainer) {
        if (alertsHeading) {
            alertsHeading.innerHTML = `Live Service Alerts &amp; Advisories for <span style="color: var(--accent-color);">${currentCity}</span>`;
        }

        const API_BASE = (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '5000')) ? 'http://localhost:5000' : '';
        const subscriberEmail = localStorage.getItem('spt-subscriber-email') || '';

        async function loadAndRenderAlerts() {
            let backendAlerts = [];
            let subscriberAlerts = [];

            // 1. Fetch live system & broadcast alerts from backend
            try {
                const res = await fetch(`${API_BASE}/api/alerts?city=${encodeURIComponent(currentCity)}`);
                const data = await res.json();
                if (data && data.success && Array.isArray(data.alerts)) {
                    backendAlerts = data.alerts;
                }
            } catch(e) {
                console.warn('Backend alerts offline fallback:', e);
            }

            // 2. Fetch subscriber inbox notifications if subscribed
            if (subscriberEmail) {
                try {
                    const resSub = await fetch(`${API_BASE}/api/subscribers/notifications?email=${encodeURIComponent(subscriberEmail)}&city=${encodeURIComponent(currentCity)}`);
                    const dataSub = await resSub.json();
                    if (dataSub && dataSub.success && Array.isArray(dataSub.data)) {
                        subscriberAlerts = dataSub.data;
                    }
                } catch(e) {
                    console.warn('Subscriber notifications offline fallback:', e);
                }
            }

            // 3. Fallback baseline alerts
            const officialAlerts = (window.TransitData && window.TransitData.alerts[currentCity]) 
                ? window.TransitData.alerts[currentCity] 
                : [
                    { type: 'info', title: 'Normal Operations', message: 'All scheduled bus fleets are operating normally in this city.', time: 'Just now', route: 'All' }
                ];

            // 4. Retrieve local crowdsourced alerts
            let crowdsourcedReports = [];
            try {
                crowdsourcedReports = JSON.parse(localStorage.getItem(`spt-crowdsourced-${currentCity}`)) || [];
            } catch(e) {}

            // Combine and deduplicate
            const seen = new Set();
            const allAlerts = [];

            // Subscriber personal alerts first
            subscriberAlerts.forEach(a => {
                const k = (a.title || '') + (a.message || '');
                if (!seen.has(k)) { seen.add(k); allAlerts.push({ ...a, isSubscriberAlert: true }); }
            });

            // Crowdsourced & local
            crowdsourcedReports.forEach(a => {
                const k = (a.title || '') + (a.message || '');
                if (!seen.has(k)) { seen.add(k); allAlerts.push(a); }
            });

            // Backend live alerts
            backendAlerts.forEach(a => {
                const k = (a.title || '') + (a.message || '');
                if (!seen.has(k)) { seen.add(k); allAlerts.push(a); }
            });

            // Baseline official
            officialAlerts.forEach(a => {
                const k = (a.title || '') + (a.message || '');
                if (!seen.has(k)) { seen.add(k); allAlerts.push(a); }
            });

            renderAlertsList(allAlerts);
        }

        function renderAlertsList(alerts) {
            alertsContainer.innerHTML = '';

            // Render subscription status pill banner at top
            const subBanner = document.createElement('div');
            subBanner.style.cssText = 'padding: 0.9rem 1.2rem; border-radius: 12px; margin-bottom: 1.2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.8rem; background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25);';
            
            if (subscriberEmail) {
                subBanner.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <i class="fa-solid fa-envelope-circle-check" style="color: #34D399; font-size: 1.2rem;"></i>
                        <div>
                            <strong style="color: #FFFFFF; font-size: 0.9rem;">Service Alerts Subscribed: <span style="color: #38BDF8;">${subscriberEmail}</span></strong>
                            <div style="font-size: 0.78rem; color: var(--text-secondary);">Receiving live delay pings &amp; diversions for ${currentCity}.</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                        <button id="view-notif-outbox-btn" class="btn-secondary-glass" style="padding: 0.35rem 0.8rem; font-size: 0.78rem; color: #38BDF8; border-color: rgba(56,189,248,0.3);">
                            <i class="fa-solid fa-envelope-open-text"></i> Email Outbox
                        </button>
                        <button id="toggle-sub-btn" class="btn-secondary-glass" style="padding: 0.35rem 0.8rem; font-size: 0.78rem; color: #F87171; border-color: rgba(239,68,68,0.3);">
                            <i class="fa-solid fa-bell-slash"></i> Unsubscribe
                        </button>
                    </div>
                `;
            } else {
                subBanner.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <i class="fa-solid fa-bell" style="color: #F59E0B; font-size: 1.2rem;"></i>
                        <div>
                            <strong style="color: #FFFFFF; font-size: 0.9rem;">Get Real-Time Service Alerts in Your Inbox</strong>
                            <div style="font-size: 0.78rem; color: var(--text-secondary);">Stay updated on road diversions, traffic delays &amp; emergency broadcasts.</div>
                        </div>
                    </div>
                    <form id="inline-sub-form" style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                        <input type="email" id="inline-sub-email" placeholder="you@example.com" required style="padding: 0.4rem 0.8rem; border-radius: 8px; border: 1px solid var(--card-border); background: rgba(0,0,0,0.2); color: #fff; font-size: 0.85rem;">
                        <button type="submit" class="btn-primary" style="padding: 0.4rem 0.9rem; font-size: 0.82rem; background: linear-gradient(135deg, #38BDF8 0%, #3B82F6 100%);">
                            Subscribe
                        </button>
                    </form>
                `;
            }
            alertsContainer.appendChild(subBanner);

            // Bind Outbox Viewer
            const outboxBtn = document.getElementById('view-notif-outbox-btn');
            if (outboxBtn) {
                outboxBtn.onclick = () => {
                    openSubscriberOutboxModal(subscriberEmail);
                };
            }

            // Bind inline subscription events
            const toggleSubBtn = document.getElementById('toggle-sub-btn');
            if (toggleSubBtn) {
                toggleSubBtn.onclick = async () => {
                    if (confirm(`Unsubscribe ${subscriberEmail} from ${currentCity} service alerts?`)) {
                        try {
                            await fetch(`${API_BASE}/api/subscribers/${encodeURIComponent(subscriberEmail)}`, { method: 'DELETE' });
                        } catch(e){}
                        localStorage.removeItem('spt-subscriber-email');
                        localStorage.removeItem('spt-subscriber-active');
                        if (typeof showSptToast === 'function') showSptToast('Unsubscribed from service alerts.', 'info');
                        loadAndRenderAlerts();
                    }
                };
            }

            const inlineSubForm = document.getElementById('inline-sub-form');
            if (inlineSubForm) {
                inlineSubForm.onsubmit = async (e) => {
                    e.preventDefault();
                    const emInput = document.getElementById('inline-sub-email');
                    const em = emInput ? emInput.value.trim() : '';
                    if (!em) return;
                    try {
                        const res = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: em, city: currentCity })
                        });
                        const data = await res.json();
                        if (data && data.success) {
                            localStorage.setItem('spt-subscriber-email', em);
                            localStorage.setItem('spt-subscriber-active', 'true');
                            if (typeof showSptToast === 'function') {
                                if (data.emailSent) {
                                    showSptToast(`🎉 Alert email sent to ${em}! Check your inbox.`, 'success');
                                } else {
                                    showSptToast(`Subscribed! Service alert created & staged in Outbox for ${em}`, 'success');
                                }
                            }
                            loadAndRenderAlerts();
                            openSubscriberOutboxModal(em);
                        }
                    } catch(err) {
                        localStorage.setItem('spt-subscriber-email', em);
                        loadAndRenderAlerts();
                    }
                };
            }

            // Render Alert Cards
            alerts.forEach((notif, index) => {
                let icon = 'fa-circle-info';
                let color = 'var(--accent-color)';
                let badgeText = notif.isCrowdsourced ? 'Commuter Broadcast' : (notif.isSubscriberAlert ? 'Inbox Service Alert' : 'General Notice');

                if (notif.type === 'alert' || notif.type === 'traffic' || notif.type === 'breakdown') { 
                    icon = 'fa-triangle-exclamation'; 
                    color = 'var(--danger-color)'; 
                    badgeText = notif.isCrowdsourced ? 'Commuter Report: Traffic' : 'Traffic Delay';
                } else if (notif.type === 'warning' || notif.type === 'diversion' || notif.type === 'waterlog') { 
                    icon = 'fa-circle-exclamation'; 
                    color = 'var(--warning-color)'; 
                    badgeText = notif.isCrowdsourced ? 'Commuter Advisory' : 'Route Diversion';
                }

                if (notif.isSubscriberAlert) {
                    icon = 'fa-envelope-open-text';
                    color = '#38BDF8';
                }
                
                const animDelay = (index * 0.06);
                const verifiedBadge = notif.isCrowdsourced 
                    ? `<span style="font-size: 0.72rem; color: var(--success-color); font-weight: 600; margin-left: 0.5rem;"><i class="fa-solid fa-user-check"></i> Verified by commuters</span>` 
                    : (notif.isSubscriberAlert ? `<span style="font-size: 0.72rem; color: #38BDF8; font-weight: 600; margin-left: 0.5rem;"><i class="fa-solid fa-inbox"></i> Delivered to Inbox</span>` : '');
                
                const item = document.createElement('div');
                item.className = `notification-item ${notif.type || 'info'} animate-fade-in-up`;
                item.style.animationDelay = `${animDelay}s`;
                item.style.marginBottom = '0.9rem';
                item.innerHTML = `
                    <div class="notification-content" style="width: 100%;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem; flex-wrap: wrap; gap: 0.4rem;">
                            <span style="font-size: 0.8rem; background: rgba(0,0,0,0.04); padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 600;">
                                Route ${notif.route || 'Network'} &bull; ${badgeText} ${verifiedBadge}
                            </span>
                            <span class="notification-time"><i class="fa-regular fa-clock"></i> ${notif.time || 'Just now'}</span>
                        </div>
                        <h4 style="margin: 0.4rem 0;"><i class="fa-solid ${icon}" style="margin-right: 0.5rem; color: ${color};"></i>${notif.title}</h4>
                        <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5; margin-bottom: 0;">${notif.message}</p>
                    </div>
                `;
                alertsContainer.appendChild(item);
            });
        }

        loadAndRenderAlerts();

        // Incident Report Form Submission
        const reportForm = document.getElementById('report-incident-form');
        if (reportForm) {
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const route = document.getElementById('report-route').value.trim();
                const type = document.getElementById('report-type').value;
                const location = document.getElementById('report-location').value.trim();
                const notes = document.getElementById('report-notes').value.trim();

                const newReport = {
                    type: type === 'traffic' || type === 'breakdown' ? 'alert' : 'warning',
                    title: `${type.toUpperCase()}: ${location}`,
                    message: notes,
                    time: 'Just now',
                    route: route,
                    isCrowdsourced: true
                };

                let savedReports = [];
                try {
                    savedReports = JSON.parse(localStorage.getItem(`spt-crowdsourced-${currentCity}`)) || [];
                } catch(e) {}
                savedReports.unshift(newReport);
                localStorage.setItem(`spt-crowdsourced-${currentCity}`, JSON.stringify(savedReports));

                // Dispatch to Backend REST API
                try {
                    fetch('/api/alerts/report', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            city: currentCity,
                            route: route,
                            type: type,
                            location: location,
                            notes: notes
                        })
                    }).catch(() => {});
                } catch(e) {}

                closeReportDelayModal();
                if (typeof showSptToast === 'function') {
                    showSptToast(`📢 Incident broadcast submitted for Route ${route}! Thank you for keeping commuters safe.`, 'success');
                }
                setTimeout(() => window.location.reload(), 1200);
            });
        }
    }
});

// Modal Global Functions
function openReportDelayModal() {
    const modal = document.getElementById('report-delay-modal');
    if (modal) modal.classList.add('active');
}

function closeReportDelayModal() {
    const modal = document.getElementById('report-delay-modal');
    if (modal) modal.classList.remove('active');
}

// Outbox & Dispatched Alerts Modal for Subscribers
async function openSubscriberOutboxModal(email) {
    let modal = document.getElementById('subscriber-outbox-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'subscriber-outbox-modal';
        modal.style.cssText = 'position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); padding: 1.5rem;';
        document.body.appendChild(modal);
    }

    const currentCity = localStorage.getItem('spt-city') || 'Delhi';
    const subEmail = email || localStorage.getItem('spt-subscriber-email') || '';

    modal.innerHTML = `
        <div style="background: #1e293b; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 16px; max-width: 760px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            <div style="padding: 1.2rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.6);">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
                        <i class="fa-solid fa-inbox"></i>
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 1.1rem; color: #ffffff;">Dispatched Email Alerts Outbox</h3>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Recipients &bull; Delivery Status &bull; Email Previews</div>
                    </div>
                </div>
                <button id="close-notif-outbox-modal" style="background: transparent; border: none; color: #94a3b8; font-size: 1.3rem; cursor: pointer; padding: 0.2rem 0.5rem;">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div style="flex: 1; overflow-y: auto; padding: 1.2rem 1.5rem;" id="outbox-modal-content">
                <div style="text-align: center; padding: 2rem; color: #94a3b8;">
                    <i class="fa-solid fa-spinner fa-spin"></i> Loading dispatched emails...
                </div>
            </div>
            <div style="padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.6);">
                <span style="font-size: 0.8rem; color: var(--text-secondary);">Subscribed: <strong style="color: #38bdf8;">${subEmail || 'None'}</strong></span>
                <button id="close-notif-outbox-btn" class="btn-primary" style="padding: 0.45rem 1.2rem; font-size: 0.82rem;">Close</button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
    const close = () => { modal.style.display = 'none'; };
    document.getElementById('close-notif-outbox-modal').onclick = close;
    document.getElementById('close-notif-outbox-btn').onclick = close;
    modal.onclick = (e) => { if (e.target === modal) close(); };

    // Fetch Outbox
    try {
        const API = (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '5000')) ? 'http://localhost:5000' : '';
        const res = await fetch(`${API}/api/email/outbox`);
        const data = await res.json();
        const emails = (data && data.success && Array.isArray(data.data)) ? data.data : [];
        const contentDiv = document.getElementById('outbox-modal-content');

        if (!emails.length) {
            contentDiv.innerHTML = `
                <div style="text-align: center; padding: 2.5rem; color: #94a3b8;">
                    <i class="fa-solid fa-envelope-open" style="font-size: 2.2rem; color: #64748b; margin-bottom: 0.8rem;"></i>
                    <h4>No Service Alert Emails Dispatched Yet</h4>
                    <p style="font-size: 0.85rem;">Subscribe on the homepage to generate automated delay &amp; route bulletins.</p>
                </div>
            `;
            return;
        }

        contentDiv.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                ${emails.map(e => `
                    <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.8rem;">
                        <div style="flex: 1; min-width: 250px;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem;">
                                <strong style="color: #ffffff; font-size: 0.9rem;">${e.subject || 'Transit Alert'}</strong>
                                ${e.delivered 
                                    ? '<span style="font-size: 0.7rem; background: rgba(16,185,129,0.2); color: #34d399; padding: 0.15rem 0.5rem; border-radius: 4px;">Delivered (SMTP)</span>' 
                                    : '<span style="font-size: 0.7rem; background: rgba(245,158,11,0.2); color: #fbbf24; padding: 0.15rem 0.5rem; border-radius: 4px;">Outbox Staged</span>'}
                            </div>
                            <div style="font-size: 0.78rem; color: var(--text-secondary);">
                                To: <span style="color: #38bdf8;">${e.to}</span> &bull; ${new Date(e.sentAt).toLocaleString('en-IN')} &bull; City: ${e.city || 'All'}
                            </div>
                        </div>
                        <button onclick="previewOutboxEmail('${e.id}')" class="btn-secondary-glass" style="padding: 0.35rem 0.8rem; font-size: 0.78rem; color: #38bdf8; border-color: rgba(56,189,248,0.3);">
                            <i class="fa-solid fa-eye"></i> View HTML
                        </button>
                    </div>
                `).join('')}
            </div>
            <div id="outbox-email-detail-view" style="display: none; margin-top: 1.2rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.2rem;">
                <h4 style="margin: 0 0 0.6rem 0; color: #38bdf8;">HTML Email Render</h4>
                <div style="border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15); background: #fff;">
                    <iframe id="outbox-detail-frame" style="width: 100%; height: 350px; border: none; display: block;"></iframe>
                </div>
            </div>
        `;
    } catch (err) {
        document.getElementById('outbox-modal-content').innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #f87171;">
                Failed to load outbox: ${err.message}
            </div>
        `;
    }
}

window.previewOutboxEmail = async function(id) {
    try {
        const API = (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '5000')) ? 'http://localhost:5000' : '';
        const res = await fetch(`${API}/api/email/outbox/${id}`);
        const data = await res.json();
        if (data && data.success && data.data) {
            const detailView = document.getElementById('outbox-email-detail-view');
            const frame = document.getElementById('outbox-detail-frame');
            if (detailView && frame) {
                detailView.style.display = 'block';
                frame.contentWindow.document.open();
                frame.contentWindow.document.write(data.data.html || `<p>${data.data.text}</p>`);
                frame.contentWindow.document.close();
                detailView.scrollIntoView({ behavior: 'smooth' });
            }
        }
    } catch(e) {}
};
