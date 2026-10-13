// Live Tracking Map - Real Pan-India Geocoding, Real OSRM Road Routing & Simulation

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
    'mangaluru': [12.9141, 74.8560],
    'delhi': [28.6304, 77.2177],
    'mumbai': [18.9400, 72.8353],
    'bangalore': [12.9716, 77.5946],
    'hyderabad': [17.3850, 78.4867],
    'chennai': [13.0827, 80.2707],
    'pune': [18.5204, 73.8567],
    'kolkata': [22.5726, 88.3639],
    'lucknow': [26.8467, 80.9462],
    'jaipur': [26.9124, 75.7873],
    'ahmedabad': [23.0225, 72.5714],
    'chandigarh': [30.7333, 76.7794],
    'kochi': [9.9312, 76.2673]
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

    // Pan-India Custom Route Form
    const panIndiaForm = document.getElementById('pan-india-search-form');
    const originInput = document.getElementById('custom-origin-input');
    const destInput = document.getElementById('custom-dest-input');

    // Populate In-Page Presets Dropdown
    if (routeSwitcher) {
        routeSwitcher.innerHTML = allRoutes.map(r => 
            `<option value="${r.id}" ${r.id.toLowerCase() === currentRoute.id.toLowerCase() ? 'selected' : ''}>${r.id} (${r.name.length > 25 ? r.name.substring(0, 25) + '...' : r.name})</option>`
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

    // Initialize Leaflet Map
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

    // --- Geocoding Function (Local dictionary + OpenStreetMap Nominatim API) ---
    async function geocodeLocation(query, fallbackCity = '') {
        const clean = query.toLowerCase().trim();
        
        // 1. Check local landmark dictionary
        for (const [name, coord] of Object.entries(landmarkCoordinates)) {
            if (clean.includes(name)) {
                return coord;
            }
        }

        // 2. Query OpenStreetMap Nominatim Live Geocoding API (Restricted to India)
        try {
            const fullQuery = clean.includes('india') ? clean : `${clean}, ${fallbackCity || currentCity}, India`;
            const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&limit=1&q=${encodeURIComponent(fullQuery)}`, {
                headers: { 'Accept': 'application/json' }
            });
            const data = await resp.json();
            if (data && data.length > 0) {
                return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
        } catch (e) {
            console.log('Online geocoder request failed, falling back.');
        }

        // Fallback to city base
        return (window.TransitData && window.TransitData.cityCoordinates[currentCity]) 
            || landmarkCoordinates[currentCity.toLowerCase()] 
            || [16.1793, 75.6999];
    }

    // --- OSRM Real Road Routing Engine ---
    async function fetchRealRoadRoute(p1, p2) {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${p1[1]},${p1[0]};${p2[1]},${p2[0]}?overview=full&geometries=geojson`;
            const resp = await fetch(url);
            const data = await resp.json();
            if (data && data.routes && data.routes.length > 0) {
                const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                const distKm = (data.routes[0].distance / 1000).toFixed(1);
                return { coordinates: coords, distanceKm: distKm };
            }
        } catch(e) {
            console.log('OSRM routing unavailable, generating road curve fallback.');
        }

        // Fallback smooth road trajectory
        const pts = [];
        const count = 20;
        for (let i = 0; i <= count; i++) {
            const frac = i / count;
            pts.push([
                p1[0] + ((p2[0] - p1[0]) * frac) + (Math.sin(i * 0.5) * 0.0012),
                p1[1] + ((p2[1] - p1[1]) * frac) + (Math.cos(i * 0.5) * 0.0012)
            ]);
        }
        return { coordinates: pts, distanceKm: (count * 0.35).toFixed(1) };
    }

    // --- Route Tracking Initialization ---
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

        let rawPoints = [];
        let fetchedDistance = 0;

        // If coordinates already provided (e.g. Navanagar to College Cross), attempt real OSRM turn-by-turn road route
        if (route.coordinates && route.coordinates.length >= 2) {
            const startPt = route.coordinates[0];
            const endPt = route.coordinates[route.coordinates.length - 1];
            const osrmResult = await fetchRealRoadRoute(startPt, endPt);
            rawPoints = osrmResult.coordinates.length > 5 ? osrmResult.coordinates : route.coordinates;
            fetchedDistance = osrmResult.distanceKm;
        } else {
            // Geocode start & end stops
            const stops = route.stops || (route.name ? route.name.split(/\s*➔\s*|\s*->\s*/) : ['Origin', 'Destination']);
            const p1 = await geocodeLocation(stops[0], currentCity);
            const p2 = await geocodeLocation(stops[stops.length - 1], currentCity);
            const osrmResult = await fetchRealRoadRoute(p1, p2);
            rawPoints = osrmResult.coordinates;
            fetchedDistance = osrmResult.distanceKm;
        }

        waypoints = rawPoints;
        currentWaypointIdx = 0;
        totalDistanceKm = fetchedDistance || (waypoints.length * 0.15).toFixed(1);

        // Draw Real Turn-by-Turn Road Line on OpenStreetMap
        routeLine = L.polyline(waypoints, {
            color: '#2563eb',
            weight: 6,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round'
        }).addTo(map);

        // Zoom map smoothly to encompass the exact real road
        map.fitBounds(routeLine.getBounds(), { padding: [50, 50], maxZoom: 16 });

        // Place Stop Markers
        const stopsList = route.stops || (route.name ? route.name.split(/\s*➔\s*|\s*->\s*/) : ['Origin', 'Destination']);
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

        // Custom Pulsing Bus Marker
        const busIcon = L.divIcon({
            className: 'custom-bus-icon',
            html: '<div style="background-color: #2563eb; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.7); font-size: 17px; animation: pulseEffect 1.8s infinite;"><i class="fa-solid fa-bus"></i></div>',
            iconSize: [38, 38],
            iconAnchor: [19, 19]
        });

        busMarker = L.marker(waypoints[0], { icon: busIcon }).addTo(map);
        busMarker.bindPopup(`<strong>Bus ${route.id}</strong><br>Live GPS Signal: Connected`);

        // Render Stop Timeline Sidebar
        renderTimeline(route, 0);

        // Start Live Movement
        startSimulationTimer();
    }

    // --- Timeline Renderer ---
    function renderTimeline(route, activeIdx) {
        if (!stopsContainer) return;
        const stopsList = route.stops || (route.name ? route.name.split(/\s*➔\s*|\s*->\s*/) : ['Origin', 'Destination']);
        const totalWaypoints = waypoints.length;
        const currentProgress = activeIdx / (totalWaypoints - 1 || 1);
        const approxStopIdx = Math.min(Math.floor(currentProgress * stopsList.length), stopsList.length - 1);

        stopsContainer.innerHTML = '';
        stopsList.forEach((stop, i) => {
            const isPassed = i < approxStopIdx;
            const isActive = i === approxStopIdx;

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

    // --- Simulation Timer ---
    function startSimulationTimer() {
        if (simulationTimer) clearInterval(simulationTimer);
        const interval = Math.max(300, Math.floor(1200 / simSpeedMultiplier));

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

            const speed = (32 + Math.floor(Math.sin(currentWaypointIdx * 0.4) * 8) + (simSpeedMultiplier * 3));
            if (speedVal) speedVal.textContent = `${speed} km/h`;

            // Update Dynamic ETA
            const totalRemainingSecs = Math.round(remainingRatio * (totalDistanceKm * 80));
            const m = Math.floor(totalRemainingSecs / 60);
            const s = totalRemainingSecs % 60;

            if (etaDisplay) {
                if (m === 0 && s < 20) {
                    etaDisplay.innerHTML = `<i class="fa-solid fa-bell"></i> Arriving at Destination`;
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

    // --- Pan-India Custom Route Submission Handler ---
    if (panIndiaForm) {
        panIndiaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const originText = originInput.value.trim();
            const destText = destInput.value.trim();
            if (!originText || !destText) return;

            const submitBtn = panIndiaForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Geocoding & Routing...';

            const p1 = await geocodeLocation(originText);
            const p2 = await geocodeLocation(destText);

            const osrmResult = await fetchRealRoadRoute(p1, p2);

            const customRouteObj = {
                id: 'CUSTOM-LIVE',
                name: `${originText} to ${destText}`,
                type: 'Electric',
                category: 'On-Demand Route',
                stops: [originText, 'Midway Junction', destText],
                coordinates: osrmResult.coordinates,
                fare: Math.max(15, Math.round(osrmResult.distanceKm * 4.5))
            };

            currentRoute = customRouteObj;
            await initRouteTracking(customRouteObj);

            if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-diamond-turn-right"></i> Plot Real Road';
        });
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

    // Initial load
    initRouteTracking(currentRoute);

    window.addEventListener('beforeunload', () => {
        if (simulationTimer) clearInterval(simulationTimer);
    });
});
