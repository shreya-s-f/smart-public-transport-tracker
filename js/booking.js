// Smart E-Ticket Booking, Stop Selection, and Payment Simulation

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize EmailJS safely
    try {
        if (typeof emailjs !== 'undefined') {
            emailjs.init("YOUR_PUBLIC_KEY"); 
        }
    } catch (e) {
        console.log("EmailJS initialized in simulation mode.");
    }

    const currentCity = localStorage.getItem('spt-city') || 'Delhi';
    const routeSelect = document.getElementById('route-select');
    const boardingSelect = document.getElementById('boarding-select');
    const dropSelect = document.getElementById('drop-select');
    const passCount = document.getElementById('pass-count');
    const nameInput = document.getElementById('pass-name');
    const emailInput = document.getElementById('pass-email');
    const dateInput = document.getElementById('journey-date');

    // Auto-fill logged in user info if available
    try {
        const profile = JSON.parse(localStorage.getItem('spt-user-profile-data'));
        if (profile) {
            if (nameInput && profile.name) nameInput.value = profile.name;
            if (emailInput && profile.email) emailInput.value = profile.email;
        } else {
            const savedName = localStorage.getItem('spt-profile-name');
            if (nameInput && savedName) nameInput.value = savedName;
        }
    } catch(e) {}

    // Auto-select route if coming from routes or tracking page
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedRoute = urlParams.get('route');

    // Load All Routes for City (Default + Custom from Admin)
    const cityRoutes = window.TransitData 
        ? window.TransitData.getAllRoutesForCity(currentCity)
        : [];

    if (routeSelect) {
        routeSelect.innerHTML = '';
        cityRoutes.forEach(r => {
            const option = document.createElement('option');
            option.value = r.id;
            option.setAttribute('data-fare', r.fare || 35);
            option.textContent = `${r.id} (${r.name || r.path})`;
            if (preselectedRoute && r.id.toLowerCase() === preselectedRoute.toLowerCase()) {
                option.selected = true;
            }
            routeSelect.appendChild(option);
        });

        // Listen for route changes to update stops
        routeSelect.addEventListener('change', () => {
            updateStopsDropdown();
            updateFare();
        });
    }

    // Set today as default date
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    function updateStopsDropdown() {
        if (!routeSelect || !boardingSelect || !dropSelect) return;
        const selectedId = routeSelect.value;
        const currentRoute = cityRoutes.find(r => r.id === selectedId) || cityRoutes[0];
        if (!currentRoute) return;

        const stops = currentRoute.stops && currentRoute.stops.length >= 2 
            ? currentRoute.stops 
            : (currentRoute.name ? currentRoute.name.split(/\s*➔\s*|\s*->\s*/) : ['Station A', 'Station B']);

        boardingSelect.innerHTML = stops.slice(0, stops.length - 1).map((s, i) => 
            `<option value="${s}" ${i === 0 ? 'selected' : ''}>${s}</option>`
        ).join('');

        dropSelect.innerHTML = stops.slice(1).map((s, i) => 
            `<option value="${s}" ${i === stops.length - 2 ? 'selected' : ''}>${s}</option>`
        ).join('');
    }

    // Fare Calculation
    function updateFare() {
        if (!routeSelect) return;
        const selectedOption = routeSelect.options[routeSelect.selectedIndex];
        if (!selectedOption) return;
        
        const rawFare = selectedOption.getAttribute('data-fare');
        const baseFare = parseInt(String(rawFare).replace(/\D/g, '')) || 35;
        const count = parseInt(passCount ? passCount.value : 1) || 1;
        
        const totalBase = baseFare * count;
        const convenience = 5;
        const totalAmount = totalBase + convenience;

        const summaryCount = document.getElementById('summary-count');
        const summaryBase = document.getElementById('summary-base');
        const summaryTotal = document.getElementById('summary-total');
        const modalAmount = document.getElementById('modal-amount');

        if (summaryCount) summaryCount.textContent = count;
        if (summaryBase) summaryBase.textContent = `₹${totalBase.toFixed(2)}`;
        if (summaryTotal) summaryTotal.textContent = `₹${totalAmount.toFixed(2)}`;
        if (modalAmount) modalAmount.textContent = `₹${totalAmount.toFixed(2)}`;
    }

    if (passCount) {
        passCount.addEventListener('input', updateFare);
    }

    // Initial setup of stops & fare
    updateStopsDropdown();
    updateFare();

    // Payment Modal Simulation
    const payBtn = document.getElementById('pay-btn');
    const modal = document.getElementById('payment-modal');
    const closeModal = document.getElementById('close-modal');
    const confirmPayBtn = document.getElementById('confirm-pay-btn');

    if (payBtn) {
        payBtn.addEventListener('click', () => {
            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            
            if (!name || !email) {
                alert("Please enter passenger name and email address to receive your e-ticket.");
                if (nameInput && !name) nameInput.focus();
                return;
            }
            
            if (modal) modal.classList.add('active');
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            if (modal) modal.classList.remove('active');
        });
    }

    if (confirmPayBtn) {
        confirmPayBtn.addEventListener('click', () => {
            const step1 = document.getElementById('payment-step-1');
            const step2 = document.getElementById('payment-step-2');
            const step3 = document.getElementById('payment-step-3');

            if (step1) step1.style.display = 'none';
            if (step2) step2.style.display = 'block';

            setTimeout(() => {
                if (step2) step2.style.display = 'none';
                if (step3) step3.style.display = 'block';
                processBookingSuccess();
            }, 1600);
        });
    }

    function processBookingSuccess() {
        const name = nameInput ? nameInput.value.trim() : 'Passenger';
        const email = emailInput ? emailInput.value.trim() : 'passenger@gmail.com';
        const route = routeSelect ? routeSelect.value : '507';
        const date = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
        const count = passCount ? passCount.value : 1;
        const totalEl = document.getElementById('summary-total');
        const total = totalEl ? totalEl.textContent : '₹45.00';

        const boarding = boardingSelect ? boardingSelect.value : 'Origin';
        const drop = dropSelect ? dropSelect.value : 'Destination';

        // Generate Digital Ticket
        const ticket = {
            id: 'TKT-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            city: currentCity,
            route: route,
            boarding: boarding,
            drop: drop,
            seat: Math.floor(Math.random() * 38) + 1 + ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
            date: date,
            passengers: count,
            name: name,
            total: total,
            status: 'Confirmed',
            bookedAt: new Date().toLocaleString()
        };

        let tickets = [];
        try { tickets = JSON.parse(localStorage.getItem('spt-tickets')) || []; } catch(e){}
        tickets.push(ticket);
        localStorage.setItem('spt-tickets', JSON.stringify(tickets));

        // Attempt EmailJS Send (with graceful fallback)
        const emailStatusText = document.getElementById('email-status-text');
        if (emailStatusText) {
            emailStatusText.innerHTML = `<span style="color: var(--success-color);"><i class="fa-solid fa-circle-check"></i> E-Ticket generated successfully! Booking ID: <strong>${ticket.id}</strong>. Ready to download in Profile.</span>`;
        }

        try {
            if (typeof emailjs !== 'undefined') {
                emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
                    to_name: name,
                    to_email: email,
                    ticket_id: ticket.id,
                    route: ticket.route,
                    date: ticket.date,
                    total: ticket.total
                }).catch(() => {});
            }
        } catch(e) {}
    }
});
