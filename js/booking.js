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

    // ========================================================================
    // PASS TYPE SELECTION & SAVINGS LOGIC
    // ========================================================================
    let currentPassType = 'single';
    const passRadioButtons = document.querySelectorAll('input[name="pass-type"]');
    const passLabels = document.querySelectorAll('.pass-option-label');

    passRadioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentPassType = e.target.value;
            passLabels.forEach(lbl => {
                const r = lbl.querySelector('input');
                if (r && r.checked) {
                    lbl.style.border = '2px solid var(--accent-color)';
                    lbl.style.background = 'rgba(59, 130, 246, 0.12)';
                } else {
                    lbl.style.border = '1px solid var(--card-border)';
                    lbl.style.background = 'var(--card-bg)';
                }
            });
            updateFare();
        });
    });

    // ========================================================================
    // INTERACTIVE BUS CABIN SEAT SELECTION FLOORPLAN
    // ========================================================================
    let selectedSeats = ['1A'];
    const seatGridContainer = document.getElementById('bus-seat-grid');
    const selectedSeatsBadge = document.getElementById('selected-seats-badge');
    const summarySeatsEl = document.getElementById('summary-seats');

    function initSeatGrid() {
        if (!seatGridContainer) return;
        seatGridContainer.innerHTML = '';

        const currentRouteId = routeSelect ? routeSelect.value : '507';
        const hash = Math.abs(currentRouteId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
        // Pseudo-random booked seats
        const bookedSeatNumbers = new Set([
            `${(hash % 4) + 2}B`,
            `${((hash + 1) % 4) + 2}D`,
            `${((hash + 2) % 4) + 2}A`
        ]);

        const rows = 6;
        const cols = ['A', 'B', 'AISLE', 'C', 'D'];

        // Ensure default selected seats count matches passCount
        const count = parseInt(passCount ? passCount.value : 1) || 1;
        selectedSeats = [];
        for (let r = 1; r <= rows; r++) {
            ['A', 'B', 'C', 'D'].forEach(c => {
                const sId = `${r}${c}`;
                if (selectedSeats.length < count && !bookedSeatNumbers.has(sId)) {
                    selectedSeats.push(sId);
                }
            });
        }
        updateSeatsUI();

        for (let r = 1; r <= rows; r++) {
            cols.forEach(col => {
                if (col === 'AISLE') {
                    const aisle = document.createElement('div');
                    aisle.style.fontSize = '0.65rem';
                    aisle.style.color = 'var(--text-secondary)';
                    aisle.style.textAlign = 'center';
                    aisle.textContent = r;
                    seatGridContainer.appendChild(aisle);
                } else {
                    const seatId = `${r}${col}`;
                    const isBooked = bookedSeatNumbers.has(seatId);
                    const isLadies = (r === 1 && (col === 'A' || col === 'B'));
                    const isSenior = (r === 1 && (col === 'C' || col === 'D'));

                    const seatBtn = document.createElement('button');
                    seatBtn.type = 'button';
                    seatBtn.className = 'bus-seat-btn';
                    seatBtn.id = `seat-${seatId}`;
                    seatBtn.setAttribute('data-seat', seatId);
                    seatBtn.style.padding = '0.5rem 0.2rem';
                    seatBtn.style.borderRadius = '8px';
                    seatBtn.style.fontSize = '0.75rem';
                    seatBtn.style.fontWeight = '700';
                    seatBtn.style.border = '1px solid var(--card-border)';
                    seatBtn.style.cursor = isBooked ? 'not-allowed' : 'pointer';
                    seatBtn.style.transition = 'all 0.2s';
                    seatBtn.title = isBooked ? 'Seat Booked' : isLadies ? 'Women Priority Seat' : isSenior ? 'Senior Priority Seat' : 'Available Seat';

                    if (isBooked) {
                        seatBtn.style.background = 'rgba(148, 163, 184, 0.2)';
                        seatBtn.style.color = 'var(--text-secondary)';
                        seatBtn.disabled = true;
                        seatBtn.innerHTML = `<i class="fa-solid fa-ban"></i>`;
                    } else if (selectedSeats.includes(seatId)) {
                        seatBtn.style.background = 'var(--accent-color)';
                        seatBtn.style.borderColor = 'var(--accent-color)';
                        seatBtn.style.color = '#ffffff';
                        seatBtn.innerHTML = `${seatId} <i class="fa-solid fa-check" style="font-size: 0.65rem;"></i>`;
                    } else if (isLadies) {
                        seatBtn.style.background = 'rgba(236, 72, 153, 0.15)';
                        seatBtn.style.borderColor = '#ec4899';
                        seatBtn.style.color = '#ec4899';
                        seatBtn.innerHTML = `<i class="fa-solid fa-person-dress" style="font-size: 0.7rem;"></i> ${seatId}`;
                    } else if (isSenior) {
                        seatBtn.style.background = 'rgba(245, 158, 11, 0.15)';
                        seatBtn.style.borderColor = 'var(--warning-color)';
                        seatBtn.style.color = 'var(--warning-color)';
                        seatBtn.innerHTML = `<i class="fa-solid fa-wheelchair" style="font-size: 0.7rem;"></i> ${seatId}`;
                    } else {
                        seatBtn.style.background = 'rgba(59, 130, 246, 0.1)';
                        seatBtn.style.color = 'var(--accent-color)';
                        seatBtn.textContent = seatId;
                    }

                    if (!isBooked) {
                        seatBtn.addEventListener('click', () => handleSeatClick(seatId));
                    }

                    seatGridContainer.appendChild(seatBtn);
                }
            });
        }
    }

    function handleSeatClick(seatId) {
        const allowedCount = parseInt(passCount ? passCount.value : 1) || 1;
        const idx = selectedSeats.indexOf(seatId);

        if (idx !== -1) {
            // Already selected, deselect if more than 1
            if (selectedSeats.length > 1) {
                selectedSeats.splice(idx, 1);
            }
        } else {
            // Add seat, shift oldest if exceeding allowed count
            if (selectedSeats.length >= allowedCount) {
                selectedSeats.shift();
            }
            selectedSeats.push(seatId);
        }
        initSeatGrid();
        updateSeatsUI();
    }

    function updateSeatsUI() {
        const text = selectedSeats.join(', ') || '1A';
        if (selectedSeatsBadge) selectedSeatsBadge.textContent = `Selected: Seat ${text}`;
        if (summarySeatsEl) summarySeatsEl.textContent = text;
    }

    // Fare Calculation
    function updateFare() {
        if (!routeSelect) return;
        const selectedOption = routeSelect.options[routeSelect.selectedIndex];
        if (!selectedOption) return;
        
        const rawFare = selectedOption.getAttribute('data-fare');
        const singleBaseFare = parseInt(String(rawFare).replace(/\D/g, '')) || 35;
        const count = parseInt(passCount ? passCount.value : 1) || 1;
        
        let unitFare = singleBaseFare;
        let convenience = 5;
        let passLabelText = 'Single Journey';
        let savingsText = 'Standard commute rate applied. Switch to Day Pass to save more!';

        if (currentPassType === 'day') {
            unitFare = 80;
            passLabelText = 'Unlimited 1-Day Transit Pass';
            savingsText = '🎉 Unlimited 24h metro & bus access across city. Save ~₹60 vs multiple tickets!';
        } else if (currentPassType === 'monthly') {
            unitFare = 1200;
            convenience = 0; // Free convenience fee on monthly pass!
            passLabelText = 'Monthly All-Access Commuter Pass';
            savingsText = '🌟 30-Day unlimited travel on all lines + priority boarding. Saved ₹800!';
        }

        const totalBase = unitFare * count;
        const totalAmount = totalBase + convenience;

        const summaryCount = document.getElementById('summary-count');
        const summaryBase = document.getElementById('summary-base');
        const summaryTotal = document.getElementById('summary-total');
        const modalAmount = document.getElementById('modal-amount');
        const summaryPassType = document.getElementById('summary-pass-type');
        const savingsBadgeText = document.getElementById('savings-badge-text');
        const btnPayAmount = document.getElementById('btn-pay-amount');

        if (summaryCount) summaryCount.textContent = count;
        if (summaryPassType) summaryPassType.textContent = passLabelText;
        if (summaryBase) summaryBase.textContent = `₹${totalBase.toFixed(2)}`;
        if (summaryTotal) summaryTotal.textContent = `₹${totalAmount.toFixed(2)}`;
        if (modalAmount) modalAmount.textContent = `₹${totalAmount.toFixed(2)}`;
        if (btnPayAmount) btnPayAmount.textContent = `₹${totalAmount.toFixed(2)}`;
        if (savingsBadgeText) savingsBadgeText.textContent = savingsText;
    }

    if (passCount) {
        passCount.addEventListener('input', () => {
            initSeatGrid();
            updateFare();
        });
    }

    // Initial setup of stops, seats & fare
    updateStopsDropdown();
    initSeatGrid();
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
            }, 1500);
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
        const seatsText = selectedSeats.join(', ') || '1A';

        // Generate Digital Ticket
        const ticket = {
            id: 'TKT-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            city: currentCity,
            route: route,
            passType: currentPassType,
            boarding: boarding,
            drop: drop,
            seat: seatsText,
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

        // Render Holographic Digital Pass with Dynamic Anti-Fraud Watermark
        const holoContainer = document.getElementById('holographic-qr-container');
        if (holoContainer) {
            const qrData = encodeURIComponent(`TRANSIT-IN|${ticket.id}|${ticket.route}|${ticket.seat}|${ticket.date}|${ticket.total}`);
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=4&data=${qrData}`;

            holoContainer.innerHTML = `
                <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95)); border: 2px solid rgba(59, 130, 246, 0.5); border-radius: 16px; padding: 1.4rem; text-align: center; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.25);">
                    <!-- Holographic Iridescent Shimmer Sweep -->
                    <div style="position: absolute; top: 0; left: -100%; width: 200%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); animation: shimmerSlide 3s infinite linear; pointer-events: none;"></div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(255,255,255,0.15); padding-bottom: 0.6rem; margin-bottom: 0.8rem;">
                        <span style="font-weight: 800; color: var(--accent-color); font-size: 0.95rem;"><i class="fa-solid fa-bus"></i> Transit.IN Digital Pass</span>
                        <span class="route-status status-ontime" style="font-size: 0.72rem;">Verified Active</span>
                    </div>

                    <!-- QR Code -->
                    <div style="background: #ffffff; border-radius: 12px; padding: 0.6rem; display: inline-block; margin-bottom: 0.8rem; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                        <img src="${qrUrl}" alt="Digital QR Pass" style="width: 120px; height: 120px; display: block;">
                    </div>

                    <!-- Dynamic Live Validation Anti-Fraud Counter -->
                    <div style="font-family: monospace; font-size: 0.78rem; color: #10b981; margin-bottom: 0.6rem; letter-spacing: 0.5px;">
                        <i class="fa-solid fa-fingerprint"></i> SECURE TOKEN: <span id="holo-anti-fraud-token">${ticket.id}-${Date.now().toString().slice(-4)}</span>
                    </div>

                    <!-- Ticket Core Details -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; text-align: left; font-size: 0.82rem; background: rgba(0,0,0,0.2); padding: 0.6rem 0.8rem; border-radius: 8px;">
                        <div>
                            <span style="color: var(--text-secondary); display: block; font-size: 0.72rem;">Route / Line:</span>
                            <strong style="color: var(--text-primary);">${ticket.route}</strong>
                        </div>
                        <div>
                            <span style="color: var(--text-secondary); display: block; font-size: 0.72rem;">Assigned Seat(s):</span>
                            <strong style="color: var(--accent-color);">${ticket.seat}</strong>
                        </div>
                        <div>
                            <span style="color: var(--text-secondary); display: block; font-size: 0.72rem;">Passenger:</span>
                            <strong style="color: var(--text-primary);">${ticket.name}</strong>
                        </div>
                        <div>
                            <span style="color: var(--text-secondary); display: block; font-size: 0.72rem;">Amount Paid:</span>
                            <strong style="color: var(--success-color);">${ticket.total}</strong>
                        </div>
                    </div>
                </div>
            `;
        }

        // Feedback
        const emailStatusText = document.getElementById('email-status-text');
        if (emailStatusText) {
            emailStatusText.innerHTML = `<span style="color: var(--success-color);"><i class="fa-solid fa-circle-check"></i> E-Ticket pass generated successfully! Booking ID: <strong>${ticket.id}</strong>.</span>`;
        }

        if (typeof showSptToast === 'function') {
            showSptToast(`🎉 Ticket ${ticket.id} confirmed! Seat: ${ticket.seat}`, 'success');
        }

        // EmailJS attempt
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
