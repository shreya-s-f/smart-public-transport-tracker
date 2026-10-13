// Live Tracking Map and Simulation Logic - Pan India

const cityRoutesData = {
    'Delhi': [
        { id: '507', path: 'Okhla ➔ Connaught Place' },
        { id: 'GL-23', path: 'Gurgaon ➔ Airport T3' },
        { id: '390', path: 'Mayur Vihar ➔ AIIMS' },
        { id: 'Metro Feeder 1', path: 'Saket Metro ➔ Malviya Nagar' }
    ],
    'Mumbai': [
        { id: 'BEST 301', path: 'Bandra Station ➔ Juhu Beach' },
        { id: 'AC-10', path: 'Andheri ➔ BKC' },
        { id: 'C-71', path: 'Colaba ➔ CSMT' },
        { id: 'BEST 42', path: 'Dadar ➔ Worli Sea Face' }
    ],
    'Bangalore': [
        { id: 'V-500D', path: 'Silk Board ➔ Hebbal' },
        { id: 'KIA-9', path: 'Majestic ➔ Airport' },
        { id: '335E', path: 'Kempagowda ➔ Whitefield' },
        { id: 'Metro Feeder', path: 'Indiranagar ➔ Domlur' }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof L === 'undefined') {
        console.error('Leaflet.js library failed to load.');
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-secondary);"><p>Map could not be loaded. Please check your internet connection.</p></div>';
        }
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const routeId = urlParams.get('route');
    const currentCity = localStorage.getItem('spt-city') || 'Delhi';

    // Collect all routes for current city (defaults + custom)
    let customRoutes = [];
    try {
        const allCustom = JSON.parse(localStorage.getItem('spt-custom-routes')) || [];
        customRoutes = allCustom.filter(r => r.city === currentCity);
    } catch(e) {}

    const defaultRoutes = cityRoutesData[currentCity] || cityRoutesData['Delhi'];
    const allRoutes = [...customRoutes, ...defaultRoutes];

    // Find the requested route or fallback to the first available route
    let matchedRoute = null;
    if (routeId && routeId !== 'Default') {
        matchedRoute = allRoutes.find(r => r.id.toLowerCase() === routeId.toLowerCase());
    }
    if (!matchedRoute && allRoutes.length > 0) {
        matchedRoute = allRoutes[0];
    }
    if (!matchedRoute) {
        matchedRoute = { id: '507', path: 'Connaught Place ➔ Okhla' };
    }

    const titleEl = document.getElementById('tracking-route-title');
    const pathEl = document.getElementById('tracking-route-path');
    
    if (titleEl) titleEl.textContent = `Route ${matchedRoute.id} Tracking`;
    if (pathEl) pathEl.textContent = `${matchedRoute.path} (${currentCity})`;

    // Base Coordinates for Indian Cities
    const cityCoords = {
        'Delhi': [28.6304, 77.2177],      // Connaught Place
        'Mumbai': [18.9400, 72.8353],     // CSMT / South Mumbai
        'Bangalore': [12.9716, 77.5946],  // MG Road
        'Hyderabad': [17.3850, 78.4867],
        'Chennai': [13.0827, 80.2707],
        'Kolkata': [22.5726, 88.3639],
        'Pune': [18.5204, 73.8567]
    };
    
    const baseLatLng = cityCoords[currentCity] || cityCoords['Delhi'];

    // Initialize Leaflet Map
    const map = L.map('map-container').setView(baseLatLng, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
    }).addTo(map);

    // Invalidate map size after DOM animations settle
    setTimeout(() => {
        map.invalidateSize();
    }, 250);
    window.addEventListener('resize', () => {
        map.invalidateSize();
    });

    // Generate a smooth simulated route with 10 sequential waypoints
    const routeCoordinates = [];
    let curLat = baseLatLng[0];
    let curLng = baseLatLng[1];
    
    // Create gentle deterministic direction so the route is a clean line
    const latStep = 0.0018;
    const lngStep = 0.0022;

    for (let i = 0; i < 10; i++) {
        routeCoordinates.push([
            curLat + (i * latStep) + (Math.sin(i) * 0.0006),
            curLng + (i * lngStep) + (Math.cos(i) * 0.0006)
        ]);
    }

    // Draw the route path polyline on the map
    const routeLine = L.polyline(routeCoordinates, {
        color: '#3b82f6',
        weight: 6,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round'
    }).addTo(map);

    map.fitBounds(routeLine.getBounds(), { padding: [60, 60] });

    // Custom bus icon with Pulse effect
    const busIcon = L.divIcon({
        className: 'custom-bus-icon',
        html: '<div style="background-color: #2563eb; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.6); font-size: 16px; animation: pulseEffect 2s infinite;"><i class="fa-solid fa-bus"></i></div>',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
    });

    // Parse origin and destination for stop markers
    const stops = matchedRoute.path.split(/\s*➔\s*|\s*->\s*/);
    const startStopName = stops[0] || 'Origin Station';
    const endStopName = stops[1] || 'Destination';

    const startMarker = L.circleMarker(routeCoordinates[0], {
        color: '#10b981',
        fillColor: '#10b981',
        radius: 8,
        fillOpacity: 0.9,
        weight: 2
    }).addTo(map).bindPopup(`<strong>Start:</strong> ${startStopName}`);

    const endMarker = L.circleMarker(routeCoordinates[routeCoordinates.length - 1], {
        color: '#ef4444',
        fillColor: '#ef4444',
        radius: 8,
        fillOpacity: 0.9,
        weight: 2
    }).addTo(map).bindPopup(`<strong>End:</strong> ${endStopName}`);

    // Live Moving Bus Marker
    let currentPointIndex = 0;
    const busMarker = L.marker(routeCoordinates[currentPointIndex], { icon: busIcon }).addTo(map);
    busMarker.bindPopup(`<strong>Bus ${matchedRoute.id}</strong><br>Status: In Transit`);

    const etaDisplay = document.getElementById('eta-display');
    let baseEtaSeconds = 300; 

    const simulationInterval = setInterval(() => {
        currentPointIndex++;
        if (currentPointIndex >= routeCoordinates.length) {
            currentPointIndex = 0;
            baseEtaSeconds = 300; 
        }

        const nextPos = routeCoordinates[currentPointIndex];
        busMarker.setLatLng(nextPos);
        
        baseEtaSeconds -= 15; 
        if (baseEtaSeconds < 0) baseEtaSeconds = 0;
        
        const minutes = Math.floor(baseEtaSeconds / 60);
        const seconds = baseEtaSeconds % 60;
        
        if (etaDisplay) {
            etaDisplay.innerHTML = `<i class="fa-solid fa-clock"></i> ETA: ${minutes}m ${seconds}s`;
            
            if (minutes === 0) {
                etaDisplay.style.backgroundColor = 'rgba(245, 158, 11, 0.15)';
                etaDisplay.style.color = 'var(--warning-color)';
                etaDisplay.innerHTML = `<i class="fa-solid fa-bell"></i> Arriving Now`;
            } else {
                etaDisplay.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                etaDisplay.style.color = 'var(--success-color)';
            }
        }
    }, 2000); 

    window.addEventListener('beforeunload', () => {
        clearInterval(simulationInterval);
    });
});
