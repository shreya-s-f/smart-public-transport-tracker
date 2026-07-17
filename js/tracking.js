// Live Tracking Map and Simulation Logic - Pan India

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const routeId = urlParams.get('route') || 'Default';
    
    const currentCity = localStorage.getItem('spt-city') || 'Delhi';
    
    const titleEl = document.getElementById('tracking-route-title');
    const pathEl = document.getElementById('tracking-route-path');
    
    if(titleEl) titleEl.textContent = `Route ${routeId} Tracking`;
    if(pathEl) pathEl.textContent = `Operating in ${currentCity}`;

    // Define Base Coordinates for Indian Cities
    const cityCoords = {
        'Delhi': [28.6304, 77.2177], // Connaught Place
        'Mumbai': [18.9400, 72.8353], // CSMT / South Mumbai
        'Bangalore': [12.9716, 77.5946] // MG Road
    };
    
    const baseLatLng = cityCoords[currentCity] || cityCoords['Delhi'];

    // Initialize Leaflet Map
    const map = L.map('map-container').setView(baseLatLng, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
    }).addTo(map);

    // Generate a simulated route starting from the base coordinate
    // Moving roughly 0.002 degrees per step
    const routeCoordinates = [];
    let curLat = baseLatLng[0];
    let curLng = baseLatLng[1];
    
    for(let i=0; i<10; i++) {
        routeCoordinates.push([curLat, curLng]);
        curLat += (Math.random() * 0.004) - 0.001;
        curLng += (Math.random() * 0.004) - 0.001;
    }

    // Draw the route line on the map
    const routeLine = L.polyline(routeCoordinates, {
        color: '#3b82f6',
        weight: 5,
        opacity: 0.7
    }).addTo(map);

    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

    // Custom bus icon with Pulse effect
    const busIcon = L.divIcon({
        className: 'custom-bus-icon',
        html: '<div style="background-color: #3b82f6; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.5); font-size: 16px; animation: pulseEffect 2s infinite;"><i class="fa-solid fa-bus"></i></div>',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
    });

    L.circleMarker(routeCoordinates[0], { color: 'green', radius: 8, fillOpacity: 0.8 }).addTo(map).bindPopup("Start Stop");
    L.circleMarker(routeCoordinates[routeCoordinates.length - 1], { color: 'red', radius: 8, fillOpacity: 0.8 }).addTo(map).bindPopup("End Stop");

    let currentPointIndex = 0;
    const busMarker = L.marker(routeCoordinates[currentPointIndex], { icon: busIcon }).addTo(map);

    const etaDisplay = document.getElementById('eta-display');
    let baseEtaSeconds = 300; 

    const simulationInterval = setInterval(() => {
        currentPointIndex++;
        if (currentPointIndex >= routeCoordinates.length) {
            currentPointIndex = 0;
            baseEtaSeconds = 300; 
        }

        const nextPos = routeCoordinates[currentPointIndex];
        
        // Smoothly pan map to follow bus if it gets near edges
        if(currentPointIndex % 3 === 0) {
            map.panTo(nextPos, {animate: true, duration: 1});
        }
        
        busMarker.setLatLng(nextPos);
        
        baseEtaSeconds -= 15; 
        if(baseEtaSeconds < 0) baseEtaSeconds = 0;
        
        const minutes = Math.floor(baseEtaSeconds / 60);
        const seconds = baseEtaSeconds % 60;
        
        if (etaDisplay) {
            etaDisplay.innerHTML = `<i class="fa-solid fa-clock"></i> ETA: ${minutes}m ${seconds}s`;
            
            if (minutes === 0) {
                etaDisplay.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
                etaDisplay.style.color = 'var(--warning-color)';
                etaDisplay.innerHTML = `<i class="fa-solid fa-bell"></i> Arriving Now`;
            } else {
                etaDisplay.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                etaDisplay.style.color = 'var(--success-color)';
            }
        }
    }, 2000); 

    window.addEventListener('unload', () => {
        clearInterval(simulationInterval);
    });
});
