// Live Tracking Map and Simulation Logic

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check URL parameters for specific route (e.g., tracking.html?route=10A)
    const urlParams = new URLSearchParams(window.location.search);
    const routeId = urlParams.get('route') || '10A';
    
    const titleEl = document.getElementById('tracking-route-title');
    if(titleEl) titleEl.textContent = `Route ${routeId} Tracking`;

    // 2. Initialize Leaflet Map
    const map = L.map('map-container').setView([40.7128, -74.0060], 13); // Default to NYC coordinates

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
    }).addTo(map);

    // 3. Define a mock route (array of lat/lng coordinates)
    const routeCoordinates = [
        [40.7128, -74.0060], // Start
        [40.7135, -74.0050],
        [40.7145, -74.0045],
        [40.7158, -74.0035],
        [40.7168, -74.0020],
        [40.7180, -74.0010],
        [40.7195, -74.0005],
        [40.7205, -73.9990],
        [40.7220, -73.9975], // End
    ];

    // Draw the route line on the map
    const routeLine = L.polyline(routeCoordinates, {
        color: '#3b82f6', // var(--accent-color)
        weight: 5,
        opacity: 0.7
    }).addTo(map);

    // Fit map bounds to the route
    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

    // 4. Create custom bus icon
    const busIcon = L.divIcon({
        className: 'custom-bus-icon',
        html: '<div style="background-color: #3b82f6; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 14px;"><i class="fa-solid fa-bus"></i></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    // Add Stop Markers
    L.circleMarker(routeCoordinates[0], { color: 'green', radius: 6 }).addTo(map).bindPopup("Start Stop");
    L.circleMarker(routeCoordinates[routeCoordinates.length - 1], { color: 'red', radius: 6 }).addTo(map).bindPopup("End Stop");

    // Initialize bus marker at starting position
    let currentPointIndex = 0;
    const busMarker = L.marker(routeCoordinates[currentPointIndex], { icon: busIcon }).addTo(map);

    // 5. Simulation Logic using setInterval
    const etaDisplay = document.getElementById('eta-display');
    let baseEtaSeconds = 300; // 5 minutes

    const simulationInterval = setInterval(() => {
        // Move to next point
        currentPointIndex++;
        
        // Loop back to start if end is reached
        if (currentPointIndex >= routeCoordinates.length) {
            currentPointIndex = 0;
            baseEtaSeconds = 300; // Reset ETA
        }

        // Update marker position
        const nextPos = routeCoordinates[currentPointIndex];
        busMarker.setLatLng(nextPos);
        
        // Optionally pan map to follow bus
        // map.panTo(nextPos);

        // Update ETA Display
        baseEtaSeconds -= 15; // simulate time passing faster between points
        if(baseEtaSeconds < 0) baseEtaSeconds = 0;
        
        const minutes = Math.floor(baseEtaSeconds / 60);
        const seconds = baseEtaSeconds % 60;
        
        if (etaDisplay) {
            etaDisplay.innerHTML = `<i class="fa-solid fa-clock"></i> ETA: ${minutes}m ${seconds}s`;
            
            // Change color if getting close
            if (minutes === 0) {
                etaDisplay.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
                etaDisplay.style.color = 'var(--warning-color)';
                etaDisplay.innerHTML = `<i class="fa-solid fa-bell"></i> Arriving Now`;
            } else {
                etaDisplay.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                etaDisplay.style.color = 'var(--success-color)';
            }
        }
    }, 2000); // Update every 2 seconds for visibility

    // Clean up interval if navigating away (handled by browser on full reload, but good practice if making it SPA later)
    window.addEventListener('unload', () => {
        clearInterval(simulationInterval);
    });
});
