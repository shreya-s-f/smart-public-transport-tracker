// Live Tracking Map, Realistic Multi-Stop Simulation, Controls & Smart Geocoder

const landmarkCoordinates = {
    'navanagar': [16.1620, 75.6580],
    'college cross': [16.1835, 75.6905],
    'vidyagiri': [16.1785, 75.6830],
    'gaddanakeri': [16.1720, 75.6720],
    'bagalkot': [16.1793, 75.6999],
    'badami': [15.9180, 75.6760],
    'ilkal': [15.9610, 76.1180],
    'mudhol': [16.3400, 75.2800],
    'jamkhandi': [16.5000, 75.3000],
    'hubli': [15.3647, 75.1240],
    'hubballi': [15.3647, 75.1240],
    'dharwad': [15.4589, 75.0078],
    'belgaum': [15.8497, 74.4977],
    'belagavi': [15.8497, 74.4977],
    'mysore': [12.2958, 76.6394],
    'mysuru': [12.2958, 76.6394],
    'mangalore': [12.9141, 74.8560],
    'delhi': [28.6304, 77.2177],
    'mumbai': [18.9400, 72.8353],
    'bangalore': [12.9716, 77.5946],
    'hyderabad': [17.3850, 78.4867],
    'chennai': [13.0827, 80.2707],
    'pune': [18.5204, 73.8567]
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof L === 'undefined') {
        console.error('Leaflet.js library failed to load.');
        const container = document.getElementById('map-container');
        if (container) container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;"><p>Leaflet failed to load.</p></div>';
        return;
    }

    const currentCity = localStorage.getItem('spt-city') || 'Delhi';
    const allRoutes = window.TransitData 
        ? window.TransitData.getAllRoutesForCity(currentCity)
        : [];

    const urlParams = new URLSearchParams(window.location.search);
    let selectedRouteId = urlParams.get('route') || (allRoutes[0] ? allRoutes[0].id : '507');

    let currentRoute = allRoutes.find(r => r.id.toLowerCase() === selectedRouteId.toLowerCase()) || allRoutes[0] || {
        id: '507',
        name: 'Okhla Phase 1 to Connaught Place',
        type: 'AC',
        category: 'Express',
        stops: ['Okhla Phase 1', 'Nehru Place', 'Moolchand', 'Lajpat Nagar', 'India Gate', 'Connaught Place'],
        fare: 40
    };

    // UI Elements
    const titleEl = document.getElementById('tracking-route-title');
    const pathEl = document.getElementById('tracking-route-path');
    const badgeEl = document.getElementById('route-type-badge');
    const etaDisplay = document.getElementById('eta-display');
    const routeSwitcher = document.getElementById('route-switcher');
    const bookBtn = document.getElementById('book-this-bus-btn');
    const stopsContainer = document.getElementById('stops-timeline-container');
    const activeStopIndicator = document.getElementById('active-stop-indicator');
    
    // Sim Control Elements
    const playPauseBtn = document.getElementById('sim-play-pause-btn');
    const resetBtn = document.getElementById('sim-reset-btn');
    const speedBtn = document.getElementById('sim-speed-btn');
    const speedVal = document.getElementById('sim-speed-val');
    const distVal = document.getElementById('sim-dist-val');

    // Populate In-Page Route Switcher Dropdown
    if (routeSwitcher) {
        routeSwitcher.innerHTML = allRoutes.map(r => 
            `<option value="${r.id}" ${r.id.toLowerCase() === currentRoute.id.toLowerCase() ? 'selected' : ''}>${r.id} (${r.name.length > 28 ? r.name.substring(0, 28) + '...' : r.name})</option>`
        ).join('');

        routeSwitcher.addEventListener('change', (e) => {
            const nextRoute = allRoutes.find(r => r.id === e.target.value);
            if (nextRoute) {
                currentRoute = nextRoute;
                initRouteTracking(currentRoute);
            }
        });
    }

    if (bookBtn) {
        bookBtn.addEventListener('click', () => {
            window.location.href = `booking.html?route=${encodeURIComponent(currentRoute.id)}`;
        });
    }

    // Initialize Map with clean initial view
    const cityBaseCoords = (window.TransitData && window.TransitData.cityCoordinates[currentCity]) 
        || landmarkCoordinates[currentCity.toLowerCase()]
        || [16.1793, 75.6999];
        
    const map = L.map('map-container').setView(cityBaseCoords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
    }).addTo(map);

    setTimeout(() => map.invalidateSize(), 300);
    window.addEventListener('resize', () => map.invalidateSize());

    // Map layer references to clean up on route switch
    let routeLine = null;
    let stopMarkers = [];
    let busMarker = null;
    let simulationTimer = null;
    let isPlaying = true;
    let simSpeedMultiplier = 1;
    let waypoints = [];
    let currentWaypointIdx = 0;
    let totalDistanceKm = 8.4;

    function resolveSmartRouteCoordinates(route, city) {
        // 1. If explicit coordinates exist in data, use them
        if (route.coordinates && route.coordinates.length >= 2) {
            return route.coordinates;
        }

        // 2. Check route name and stops against landmark dictionary
        const combinedText = `${route.name} ${(route.stops || []).join(' ')} ${city}`.toLowerCase();
        
        let startPoint = null;
        let endPoint = null;

        // Check if Navanagar and College Cross are mentioned
        if (combinedText.includes('navanagar') && combinedText.includes('college cross')) {
            startPoint = landmarkCoordinates['navanagar'];
            endPoint = landmarkCoordinates['college cross'];
        } else {
            // Find any matched landmarks in order
            for (const [name, pt] of Object.entries(landmarkCoordinates)) {
                if (combinedText.includes(name)) {
                    if (!startPoint) {
                        startPoint = pt;
                    } else if (!endPoint && (Math.abs(startPoint[0] - pt[0]) > 0.003 || Math.abs(startPoint[1] - pt[1]) > 0.003)) {
                        endPoint = pt;
                    }
                }
            }
        }

        const cityBase = (window.TransitData && window.TransitData.cityCoordinates[city])
            || landmarkCoordinates[city.toLowerCase()]
            || [16.1793, 75.6999];

        if (!startPoint) startPoint = cityBase;
        if (!endPoint) {
            endPoint = [startPoint[0] + 0.018, startPoint[1] + 0.024];
        }

        // Build 5 intermediate points between start and end
        const pts = [startPoint];
        const count = 5;
        for (let i = 1; i <= count; i++) {
            const frac = i / (count + 1);
            pts.push([
                startPoint[0] + ((endPoint[0] - startPoint[0]) * frac) + (Math.sin(i * 1.3) * 0.0012),
                startPoint[1] + ((endPoint[1] - startPoint[1]) * frac) + (Math.cos(i * 1.3) * 0.0012)
            ]);
        }
        pts.push(endPoint);
        return pts;
    }

    async function initRouteTracking(route) {
        // Clear previous layers & timer
        if (simulationTimer) clearInterval(simulationTimer);
        if (routeLine) map.removeLayer(routeLine);
        stopMarkers.forEach(m => map.removeLayer(m));
        stopMarkers = [];
        if (busMarker) map.removeLayer(busMarker);

        // Update Top Bar
        if (titleEl) titleEl.textContent = `Route ${route.id} Live Tracking`;
        if (pathEl) pathEl.textContent = `${route.name} • ${currentCity}`;
        if (badgeEl) {
            badgeEl.className = 'badge-pill ' + (route.type === 'Electric' ? 'badge-electric' : route.type === 'AC' ? 'badge-ac' : 'badge-express');
            badgeEl.innerHTML = `<i class="fa-solid ${route.type === 'Electric' ? 'fa-bolt' : 'fa-snowflake'}"></i> ${route.type || 'Standard'} • ${route.category || 'Transit'}`;
        }

        // Resolve Coordinates using Smart Resolver
        const rawCoords = resolveSmartRouteCoordinates(route, currentCity);

        // Interpolate smooth step-by-step waypoints
        waypoints = [];
        for (let i = 0; i < rawCoords.length - 1; i++) {
            const p1 = rawCoords[i];
            const p2 = rawCoords[i + 1];
            const steps = 4;
            for (let s = 0; s < steps; s++) {
                const lat = p1[0] + ((p2[0] - p1[0]) * (s / steps));
                const lng = p1[1] + ((p2[1] - p1[1]) * (s / steps));
                waypoints.push([lat, lng]);
            }
        }
        waypoints.push(rawCoords[rawCoords.length - 1]);

        currentWaypointIdx = 0;
        totalDistanceKm = (waypoints.length * 0.42).toFixed(1);

        // Draw Route Line
        routeLine = L.polyline(waypoints, {
            color: '#2563eb',
            weight: 6,
            opacity: 0.85,
            lineCap: 'round',
            lineJoin: 'round'
        }).addTo(map);

        // Center map directly on the real bounds
        map.fitBounds(routeLine.getBounds(), { padding: [60, 60], maxZoom: 15 });

        // Place Stop Markers
        const stopsList = route.stops || ['Origin', 'Intermediate', 'Destination'];
        const numStops = stopsList.length;

        stopsList.forEach((stopName, idx) => {
            const waypointIndex = Math.min(
                Math.floor((idx / (numStops - 1 || 1)) * (waypoints.length - 1)),
                waypoints.length - 1
            );
            const pt = waypoints[waypointIndex];
            const isStart = idx === 0;
            const isEnd = idx === numStops - 1;
            const markerColor = isStart ? '#10b981' : isEnd ? '#ef4444' : '#3b82f6';

            const marker = L.circleMarker(pt, {
                color: markerColor,
                fillColor: markerColor,
                radius: isStart || isEnd ? 8 : 6,
                fillOpacity: 0.9,
                weight: 2
            }).addTo(map).bindPopup(`<strong>Stop ${idx + 1}:</strong> ${stopName}<br><span style="font-size:0.8rem;color:#64748b;">Route ${route.id}</span>`);
            stopMarkers.push(marker);
        });

        // Bus Icon
        const busIcon = L.divIcon({
            className: 'custom-bus-icon',
            html: '<div style="background-color: #2563eb; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.7); font-size: 17px; animation: pulseEffect 1.8s infinite;"><i class="fa-solid fa-bus"></i></div>',
            iconSize: [38, 38],
            iconAnchor: [19, 19]
        });

        busMarker = L.marker(waypoints[0], { icon: busIcon }).addTo(map);
        busMarker.bindPopup(`<strong>Bus ${route.id} (${route.type})</strong><br>Status: In Service`);

        // Render Stop Timeline Sidebar
        renderTimeline(route, 0);

        // Start Simulation Loop
        startSimulationTimer();
    }

    function renderTimeline(route, activeIdx) {
        if (!stopsContainer) return;
        const stopsList = route.stops || ['Origin', 'Destination'];
        const totalWaypoints = waypoints.length;
        const currentProgress = activeIdx / (totalWaypoints - 1 || 1);
        const approxStopIdx = Math.min(Math.floor(currentProgress * stopsList.length), stopsList.length - 1);

        stopsContainer.innerHTML = '';
        stopsList.forEach((stop, i) => {
            const isPassed = i < approxStopIdx;
            const isActive = i === approxStopIdx;
            const isUpcoming = i > approxStopIdx;

            const nodeClass = isPassed ? 'passed' : isActive ? 'active' : 'upcoming';
            const etaMins = Math.max(1, (i - approxStopIdx) * 3);
            const etaText = isPassed ? '<span style="color:#10b981;">Passed</span>' : isActive ? '<span style="color:#3b82f6;font-weight:700;">Approaching</span>' : `in ~${etaMins}m`;

            const el = document.createElement('div');
            el.className = `stop-node ${nodeClass}`;
            el.innerHTML = `
                <div class="stop-bullet"></div>
                <div class="stop-info">
                    <span class="stop-name">${stop}</span>
                    <span class="stop-eta">${etaText}</span>
                </div>
            `;
            stopsContainer.appendChild(el);
        });

        if (activeStopIndicator) {
            activeStopIndicator.textContent = `Approaching: ${stopsList[approxStopIdx] || 'Next Stop'}`;
        }
    }

    function startSimulationTimer() {
        if (simulationTimer) clearInterval(simulationTimer);
        const interval = Math.max(500, Math.floor(1800 / simSpeedMultiplier));

        simulationTimer = setInterval(() => {
            if (!isPlaying) return;

            currentWaypointIdx++;
            if (currentWaypointIdx >= waypoints.length) {
                currentWaypointIdx = 0; // Loop route seamlessly
            }

            const pt = waypoints[currentWaypointIdx];
            busMarker.setLatLng(pt);

            // Update Remaining Distance & Speed
            const remainingRatio = (waypoints.length - currentWaypointIdx) / waypoints.length;
            const remKm = (totalDistanceKm * remainingRatio).toFixed(1);
            if (distVal) distVal.textContent = `${remKm} km`;

            const speed = (32 + Math.floor(Math.sin(currentWaypointIdx) * 8) + (simSpeedMultiplier * 4));
            if (speedVal) speedVal.textContent = `${speed} km/h`;

            // Update ETA Display
            const totalRemainingSecs = Math.round(remainingRatio * 600);
            const m = Math.floor(totalRemainingSecs / 60);
            const s = totalRemainingSecs % 60;

            if (etaDisplay) {
                if (m === 0 && s < 25) {
                    etaDisplay.innerHTML = `<i class="fa-solid fa-bell"></i> Arriving at Final Stop`;
                    etaDisplay.style.background = 'rgba(245, 158, 11, 0.15)';
                    etaDisplay.style.color = 'var(--warning-color)';
                } else {
                    etaDisplay.innerHTML = `<i class="fa-solid fa-clock"></i> ETA: ${m}m ${s < 10 ? '0' + s : s}s`;
                    etaDisplay.style.background = 'rgba(16, 185, 129, 0.1)';
                    etaDisplay.style.color = 'var(--success-color)';
                }
            }

            // Update Timeline highlight
            renderTimeline(currentRoute, currentWaypointIdx);

        }, interval);
    }

    // Play/Pause Listener
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            playPauseBtn.innerHTML = isPlaying 
                ? '<i class="fa-solid fa-pause"></i> Pause' 
                : '<i class="fa-solid fa-play"></i> Resume';
        });
    }

    // Reset Listener
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            currentWaypointIdx = 0;
            if (busMarker && waypoints[0]) busMarker.setLatLng(waypoints[0]);
            renderTimeline(currentRoute, 0);
        });
    }

    // Speed Multiplier Listener
    if (speedBtn) {
        speedBtn.addEventListener('click', () => {
            simSpeedMultiplier = simSpeedMultiplier === 1 ? 2 : simSpeedMultiplier === 2 ? 3 : 1;
            speedBtn.innerHTML = `<i class="fa-solid fa-forward-step"></i> Speed: ${simSpeedMultiplier}x`;
            startSimulationTimer();
        });
    }

    // Initialize first load
    initRouteTracking(currentRoute);

    window.addEventListener('beforeunload', () => {
        if (simulationTimer) clearInterval(simulationTimer);
    });
});
