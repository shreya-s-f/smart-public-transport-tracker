// Booking Logic, Payment Simulation, and EmailJS

const cityRoutesData = {
    'Delhi': [
        { id: '507', path: 'Okhla ➔ Connaught Place', fare: 40 },
        { id: 'GL-23', path: 'Gurgaon ➔ Airport T3', fare: 100 },
        { id: '390', path: 'Mayur Vihar ➔ AIIMS', fare: 30 },
        { id: 'Metro Feeder 1', path: 'Saket Metro ➔ Malviya Nagar', fare: 15 },
    ],
    'Mumbai': [
        { id: 'BEST 301', path: 'Bandra Station ➔ Juhu Beach', fare: 20 },
        { id: 'AC-10', path: 'Andheri ➔ BKC', fare: 60 },
        { id: 'C-71', path: 'Colaba ➔ CSMT', fare: 15 },
        { id: 'BEST 42', path: 'Dadar ➔ Worli Sea Face', fare: 25 },
    ],
    'Bangalore': [
        { id: 'V-500D', path: 'Silk Board ➔ Hebbal', fare: 90 },
        { id: 'KIA-9', path: 'Majestic ➔ Airport', fare: 250 },
        { id: '335E', path: 'Kempagowda ➔ Whitefield', fare: 80 },
        { id: 'Metro Feeder', path: 'Indiranagar ➔ Domlur', fare: 15 },
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize EmailJS 
    // WARNING FOR USER: Replace 'YOUR_PUBLIC_KEY' with your actual EmailJS Public Key
    try {
        emailjs.init("YOUR_PUBLIC_KEY"); 
    } catch (e) {
        console.log("EmailJS not initialized yet. Needs API key.");
    }

    const currentCity = localStorage.getItem('spt-city') || 'Delhi';
    const routeSelect = document.getElementById('route-select');
    const passCount = document.getElementById('pass-count');
    
    // Auto-select route if coming from routes page
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedRoute = urlParams.get('route');

    // Populate routes dropdown
    const cityRoutes = cityRoutesData[currentCity] || cityRoutesData['Delhi'];
    cityRoutes.forEach(r => {
        const option = document.createElement('option');
        option.value = r.id;
        option.setAttribute('data-fare', r.fare);
        option.textContent = `${r.id} (${r.path})`;
        if(r.id === preselectedRoute) option.selected = true;
        routeSelect.appendChild(option);
    });

    // Set today as default date
    const dateInput = document.getElementById('journey-date');
    if(dateInput) dateInput.valueAsDate = new Date();

    // 2. Fare Calculation
    function updateFare() {
        const selectedOption = routeSelect.options[routeSelect.selectedIndex];
        if(!selectedOption) return;
        
        const baseFare = parseInt(selectedOption.getAttribute('data-fare'));
        const count = parseInt(passCount.value) || 1;
        
        const totalBase = baseFare * count;
        const convenience = 5;
        const totalAmount = totalBase + convenience;

        document.getElementById('summary-count').textContent = count;
        document.getElementById('summary-base').textContent = `₹${totalBase.toFixed(2)}`;
        document.getElementById('summary-total').textContent = `₹${totalAmount.toFixed(2)}`;
        document.getElementById('modal-amount').textContent = `₹${totalAmount.toFixed(2)}`;
    }

    routeSelect.addEventListener('change', updateFare);
    passCount.addEventListener('input', updateFare);
    updateFare();

    // 3. Payment Modal Logic
    const payBtn = document.getElementById('pay-btn');
    const modal = document.getElementById('payment-modal');
    const closeModal = document.getElementById('close-modal');
    const confirmPayBtn = document.getElementById('confirm-pay-btn');

    payBtn.addEventListener('click', () => {
        // Validate form
        const name = document.getElementById('pass-name').value;
        const email = document.getElementById('pass-email').value;
        
        if(!name || !email) {
            alert("Please enter passenger name and email.");
            return;
        }
        
        modal.classList.add('active');
    });

    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    confirmPayBtn.addEventListener('click', () => {
        // Step 1 to Step 2 (Processing)
        document.getElementById('payment-step-1').style.display = 'none';
        document.getElementById('payment-step-2').style.display = 'block';

        setTimeout(() => {
            // Processing finished
            document.getElementById('payment-step-2').style.display = 'none';
            document.getElementById('payment-step-3').style.display = 'block';
            
            processBookingSuccess();
        }, 2000);
    });

    function processBookingSuccess() {
        const name = document.getElementById('pass-name').value;
        const email = document.getElementById('pass-email').value;
        const route = routeSelect.value;
        const date = document.getElementById('journey-date').value;
        const count = passCount.value;
        const total = document.getElementById('summary-total').textContent;

        // Save Ticket to LocalStorage
        const ticket = {
            id: 'TKT-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            city: currentCity,
            route: route,
            date: date,
            passengers: count,
            name: name,
            total: total,
            status: 'Confirmed'
        };

        let tickets = [];
        try { tickets = JSON.parse(localStorage.getItem('spt-tickets')) || []; } catch(e){}
        tickets.push(ticket);
        localStorage.setItem('spt-tickets', JSON.stringify(tickets));

        // Attempt EmailJS Send
        const emailStatusText = document.getElementById('email-status-text');
        
        // EmailJS Parameters template
        const templateParams = {
            to_name: name,
            to_email: email,
            ticket_id: ticket.id,
            route: ticket.route,
            date: ticket.date,
            total: ticket.total
        };

        // NOTE FOR USER: Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID'
        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                emailStatusText.innerHTML = `Email successfully sent to <strong>${email}</strong>!`;
            }, function(error) {
                console.log('FAILED...', error);
                // Graceful fallback if keys aren't set up yet
                emailStatusText.innerHTML = `<span style="color: var(--warning-color);"><i class="fa-solid fa-circle-exclamation"></i> Simulated Success. Configure EmailJS API keys in booking.js to send real emails to ${email}.</span>`;
            });
    }
});
