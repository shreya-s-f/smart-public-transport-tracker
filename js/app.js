// Global App Logic & Utility Functions

document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Initialization
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // Check local storage for theme preference
    const savedTheme = localStorage.getItem('spt-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('spt-theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        if (theme === 'dark') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }

    // 2. Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');

    // Auth: Inject Logout Button & Admin Nav Link
    const navActions = document.querySelector('.nav-actions');
    const userRole = localStorage.getItem('spt-user-role') || 'passenger';
    const navLinksContainer = document.getElementById('nav-links');

    if (navLinksContainer && userRole === 'admin' && !document.getElementById('admin-nav-item')) {
        const adminLink = document.createElement('a');
        adminLink.id = 'admin-nav-item';
        adminLink.href = 'admin.html';
        adminLink.style.color = 'var(--warning-color)';
        adminLink.style.fontWeight = '700';
        if (window.location.pathname.endsWith('admin.html')) adminLink.className = 'active';
        adminLink.innerHTML = '<i class="fa-solid fa-user-shield"></i> Admin Panel';
        navLinksContainer.appendChild(adminLink);
    }

    if (navActions && !window.location.pathname.endsWith('login.html')) {
        if (!document.getElementById('header-logout-btn')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'header-logout-btn';
            logoutBtn.className = 'theme-toggle';
            logoutBtn.style.color = 'var(--danger-color)';
            logoutBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i>';
            logoutBtn.title = 'Logout';
            
            logoutBtn.addEventListener('click', () => {
                if(confirm("Are you sure you want to log out?")) {
                    localStorage.removeItem('spt-authenticated');
                    localStorage.removeItem('spt-user-role');
                    window.location.href = 'login.html';
                }
            });
            
            navActions.insertBefore(logoutBtn, navActions.firstChild);
        }
    }

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            const icon = mobileBtn.querySelector('i');
            if(navLinks.classList.contains('show')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // 3. Highlight active nav link based on current URL
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navAnchors = document.querySelectorAll('.nav-links a');
    
    navAnchors.forEach(a => {
        const href = a.getAttribute('href');
        if (href === currentPage) {
            a.classList.add('active');
        } else {
            a.classList.remove('active');
        }
    });

    // 4. City Selection Logic (Pan-India)
    const citySelectors = document.querySelectorAll('.city-selector');
    const savedCity = localStorage.getItem('spt-city') || 'Delhi';

    // Load custom cities added by Admin
    let customCities = [];
    try { customCities = JSON.parse(localStorage.getItem('spt-custom-cities')) || []; } catch(e) {}
    const defaultCityList = ['Delhi', 'Mumbai', 'Bangalore', 'Bagalkot', 'Hyderabad', 'Chennai', 'Pune'];
    const allCities = [...new Set([...defaultCityList, ...customCities])];

    citySelectors.forEach(selector => {
        // Populate options
        const currentVal = selector.value || savedCity;
        selector.innerHTML = allCities.map(c => `<option value="${c}">${c}</option>`).join('');
        selector.value = allCities.includes(currentVal) ? currentVal : allCities[0];
        
        // Listen for changes
        selector.addEventListener('change', (e) => {
            const newCity = e.target.value;
            localStorage.setItem('spt-city', newCity);
            
            // Show Loading Skeleton Overlay
            const loader = document.getElementById('city-loader');
            const loaderText = document.getElementById('loader-text');
            if (loader && loaderText) {
                loaderText.textContent = `Loading ${newCity}...`;
                loader.style.opacity = '1';
                loader.style.pointerEvents = 'auto';
                
                setTimeout(() => {
                    window.location.reload();
                }, 600);
            } else {
                window.location.reload();
            }
        });
    });

    // 5. Smart Search Autocomplete
    const globalSearch = document.getElementById('global-search');
    const searchSuggestions = document.getElementById('search-suggestions');
    if (globalSearch && searchSuggestions) {
        let recentSearches = JSON.parse(localStorage.getItem('spt-recent-searches')) || [];
        
        const popularRoutes = {
            'Delhi': ['507', 'Airport-Exp', 'GL-23', '390', 'Metro-F1'],
            'Mumbai': ['BEST-301', 'AC-10', 'C-71', 'BEST-42'],
            'Bangalore': ['V-500D', 'KIA-9', '335E', 'G-4'],
            'Bagalkot': ['BGK-01', 'Navanagar', 'College Cross', 'BGK-02', 'Badami'],
            'Hyderabad': ['TSRTC-100M', 'Pushpak-Airport', '216-IT'],
            'Chennai': ['MTC-23C', 'MTC-570'],
            'Pune': ['Rainbow-102', 'Hinjawadi-348']
        };

        globalSearch.addEventListener('focus', () => {
            renderSuggestions();
            searchSuggestions.style.display = 'block';
        });

        // Hide when clicking outside
        document.addEventListener('click', (e) => {
            if (!globalSearch.contains(e.target) && !searchSuggestions.contains(e.target)) {
                searchSuggestions.style.display = 'none';
            }
        });

        globalSearch.addEventListener('input', (e) => {
            renderSuggestions(e.target.value);
        });

        function renderSuggestions(filter = '') {
            searchSuggestions.innerHTML = '';
            const cityRoutes = popularRoutes[savedCity] || popularRoutes['Delhi'];
            
            // Add Recent Searches
            if (recentSearches.length > 0 && !filter) {
                const title = document.createElement('div');
                title.style = 'padding: 0.5rem 1rem; font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase;';
                title.textContent = 'Recent Searches';
                searchSuggestions.appendChild(title);

                recentSearches.slice(0, 3).forEach(term => {
                    const item = document.createElement('div');
                    item.className = 'suggestion-item';
                    item.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> ${term}`;
                    item.onclick = () => selectSearch(term);
                    searchSuggestions.appendChild(item);
                });
            }

            // Add Popular/Filtered Routes
            const title = document.createElement('div');
            title.style = 'padding: 0.5rem 1rem; font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; margin-top: 0.5rem;';
            title.textContent = filter ? 'Matching Routes' : 'Popular in ' + savedCity;
            searchSuggestions.appendChild(title);

            const matches = cityRoutes.filter(r => r.toLowerCase().includes(filter.toLowerCase()));
            
            if(matches.length === 0) {
                const item = document.createElement('div');
                item.style = 'padding: 0.5rem 1rem; color: var(--text-secondary);';
                item.textContent = 'No matches found';
                searchSuggestions.appendChild(item);
            } else {
                matches.forEach(term => {
                    const item = document.createElement('div');
                    item.className = 'suggestion-item';
                    item.innerHTML = `<i class="fa-solid fa-bus"></i> ${term}`;
                    item.onclick = () => selectSearch(term);
                    searchSuggestions.appendChild(item);
                });
            }
        }

        function selectSearch(term) {
            globalSearch.value = term;
            searchSuggestions.style.display = 'none';
            
            // Save to recent
            recentSearches = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5);
            localStorage.setItem('spt-recent-searches', JSON.stringify(recentSearches));
            
            window.location.href = `routes.html?search=${encodeURIComponent(term)}`;
        }
    }

    // 6. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply reveal to all glass cards that don't already have fade-in-up
    document.querySelectorAll('.glass-card:not(.animate-fade-in-up)').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
    // Also observe all route items if they exist
    setTimeout(() => {
        document.querySelectorAll('.route-item').forEach(el => {
            if(!el.classList.contains('animate-fade-in-up')){
                el.classList.add('reveal');
                observer.observe(el);
            }
        });
    }, 500);

    // 7. Inject 24/7 SOS Emergency Safety Shield Floating Button & Modal
    injectSafetyHub();

});

// Utility to get random ETA for demo purposes
function getRandomETA(min = 2, max = 25) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// ============================================================================
// GLOBAL TOAST NOTIFICATION SYSTEM
// ============================================================================
function showSptToast(message, type = 'info') {
    let toast = document.getElementById('spt-global-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'spt-global-toast';
        toast.className = 'spt-toast';
        document.body.appendChild(toast);
    }

    const iconMap = {
        success: 'fa-circle-check',
        error: 'fa-triangle-exclamation',
        warning: 'fa-circle-exclamation',
        info: 'fa-circle-info'
    };

    const colorMap = {
        success: 'var(--success-color)',
        error: 'var(--danger-color)',
        warning: 'var(--warning-color)',
        info: 'var(--accent-color)'
    };

    toast.style.borderColor = colorMap[type] || 'var(--accent-color)';
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <i class="fa-solid ${iconMap[type] || 'fa-circle-info'}" style="color: ${colorMap[type] || 'var(--accent-color)'}; font-size: 1.2rem;"></i>
            <span style="font-size: 0.95rem; font-weight: 500; color: var(--text-primary);">${message}</span>
        </div>
    `;

    toast.classList.add('active');
    if (window.sptToastTimeout) clearTimeout(window.sptToastTimeout);
    window.sptToastTimeout = setTimeout(() => {
        toast.classList.remove('active');
    }, 4000);
}

// ============================================================================
// 24/7 PAN-INDIA SOS SAFETY SHIELD & LIVE TRIP SHARING
// ============================================================================
let sirenAudioCtx = null;
let sirenOscillator = null;
let sirenGain = null;
let sirenInterval = null;

function injectSafetyHub() {
    // Only inject if not already present
    if (document.getElementById('floating-sos-btn')) return;

    // 1. Floating SOS Trigger Button
    const sosBtn = document.createElement('button');
    sosBtn.id = 'floating-sos-btn';
    sosBtn.className = 'floating-sos-btn';
    sosBtn.setAttribute('aria-label', '24/7 Emergency SOS & Safety Shield');
    sosBtn.innerHTML = `
        <i class="fa-solid fa-shield-heart" style="font-size: 1.1rem;"></i>
        <span>SOS &amp; Safety</span>
    `;
    sosBtn.onclick = openSafetyModal;
    document.body.appendChild(sosBtn);

    // 2. Safety Modal Container
    const modal = document.createElement('div');
    modal.id = 'safety-shield-modal';
    modal.className = 'booking-modal-overlay';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="booking-modal-card glass-card animate-zoom-in" style="max-width: 600px; padding: 1.8rem; border: 1px solid rgba(239, 68, 68, 0.4); box-shadow: 0 10px 40px rgba(239, 68, 68, 0.25);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.2rem;">
                <div style="display: flex; align-items: center; gap: 0.8rem;">
                    <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(239, 68, 68, 0.15); color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                        <i class="fa-solid fa-shield-halved"></i>
                    </div>
                    <div>
                        <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-primary); margin: 0;">Transit.IN Safety Shield</h3>
                        <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0;">Pan-India 24/7 Emergency SOS &amp; Live Trip Sharing</p>
                    </div>
                </div>
                <button onclick="closeSafetyModal()" style="background: transparent; border: none; font-size: 1.4rem; color: var(--text-secondary); cursor: pointer; padding: 0.2rem 0.5rem;">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <!-- Emergency Distress Siren Beacon -->
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 14px; padding: 1.2rem; text-align: center; margin-bottom: 1.3rem;">
                <h4 style="color: #ef4444; font-size: 1.05rem; margin-bottom: 0.4rem;">
                    <i class="fa-solid fa-triangle-exclamation"></i> Instant Distress Panic Beacon
                </h4>
                <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 1rem;">
                    Press in case of an immediate emergency. Sounds an audible distress alarm and broadcasts simulated GPS distress coordinates.
                </p>
                <div style="display: flex; gap: 0.6rem; justify-content: center; flex-wrap: wrap;">
                    <button id="siren-start-btn" onclick="toggleEmergencySiren()" class="btn-primary" style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); font-weight: 700; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);">
                        <i class="fa-solid fa-bell"></i> <span id="siren-btn-text">Sound Emergency Alarm</span>
                    </button>
                    <button onclick="simulatePoliceDispatch()" class="sim-btn" style="border-color: rgba(239, 68, 68, 0.4); color: #ef4444;">
                        <i class="fa-solid fa-tower-broadcast"></i> Alert Transit Police
                    </button>
                </div>
                <div id="siren-alert-status" style="margin-top: 0.6rem; font-size: 0.82rem; color: #ef4444; font-weight: 600; display: none;"></div>
            </div>

            <!-- Live Trip Sharing -->
            <div style="background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 14px; padding: 1.2rem; margin-bottom: 1.3rem;">
                <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fa-solid fa-share-nodes" style="color: var(--accent-color);"></i> Share Live Transit Journey
                </h4>
                <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.9rem;">
                    Send your real-time vehicle route, current stop, and estimated arrival time to family or trusted contacts.
                </p>
                <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
                    <button onclick="shareTripViaWhatsApp()" class="btn-primary" style="background: #25D366; font-size: 0.85rem; padding: 0.5rem 1rem;">
                        <i class="fa-brands fa-whatsapp"></i> Share on WhatsApp
                    </button>
                    <button onclick="copyTripTrackingLink()" class="sim-btn" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
                        <i class="fa-solid fa-copy"></i> Copy Live Link
                    </button>
                    <button onclick="shareTripViaSMS()" class="sim-btn" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
                        <i class="fa-solid fa-comment-sms"></i> SMS Link
                    </button>
                </div>
            </div>

            <!-- Pan-India Helplines Quick Dial -->
            <div>
                <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.6rem; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.5px;">
                    <i class="fa-solid fa-phone-volume" style="color: var(--success-color);"></i> Pan-India 24/7 Helplines (Toll-Free)
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.6rem;">
                    <a href="tel:112" style="text-decoration: none; display: flex; flex-direction: column; align-items: center; padding: 0.6rem; border-radius: 10px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); color: var(--accent-color); transition: transform 0.2s;">
                        <span style="font-size: 1.1rem; font-weight: 800;">112</span>
                        <span style="font-size: 0.72rem; color: var(--text-secondary);">National Emergency</span>
                    </a>
                    <a href="tel:1091" style="text-decoration: none; display: flex; flex-direction: column; align-items: center; padding: 0.6rem; border-radius: 10px; background: rgba(236, 72, 153, 0.1); border: 1px solid rgba(236, 72, 153, 0.2); color: #ec4899; transition: transform 0.2s;">
                        <span style="font-size: 1.1rem; font-weight: 800;">1091</span>
                        <span style="font-size: 0.72rem; color: var(--text-secondary);">Women Helpline</span>
                    </a>
                    <a href="tel:1512" style="text-decoration: none; display: flex; flex-direction: column; align-items: center; padding: 0.6rem; border-radius: 10px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); color: var(--warning-color); transition: transform 0.2s;">
                        <span style="font-size: 1.1rem; font-weight: 800;">1512</span>
                        <span style="font-size: 0.72rem; color: var(--text-secondary);">Transit / Railway Police</span>
                    </a>
                    <a href="tel:108" style="text-decoration: none; display: flex; flex-direction: column; align-items: center; padding: 0.6rem; border-radius: 10px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: var(--success-color); transition: transform 0.2s;">
                        <span style="font-size: 1.1rem; font-weight: 800;">108</span>
                        <span style="font-size: 0.72rem; color: var(--text-secondary);">Medical Ambulance</span>
                    </a>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Close when clicking overlay backdrop
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeSafetyModal();
    });
}

function openSafetyModal() {
    const modal = document.getElementById('safety-shield-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeSafetyModal() {
    const modal = document.getElementById('safety-shield-modal');
    if (modal) {
        modal.style.display = 'none';
        stopEmergencySiren();
    }
}

function toggleEmergencySiren() {
    if (sirenInterval) {
        stopEmergencySiren();
    } else {
        startEmergencySiren();
    }
}

function startEmergencySiren() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) {
            alert('Emergency siren started (Audio synthesis not supported by this browser).');
            return;
        }

        sirenAudioCtx = new AudioCtx();
        sirenOscillator = sirenAudioCtx.createOscillator();
        sirenGain = sirenAudioCtx.createGain();

        sirenOscillator.type = 'sawtooth';
        sirenOscillator.frequency.setValueAtTime(700, sirenAudioCtx.currentTime);
        sirenGain.gain.setValueAtTime(0.3, sirenAudioCtx.currentTime);

        sirenOscillator.connect(sirenGain);
        sirenGain.connect(sirenAudioCtx.destination);
        sirenOscillator.start();

        let highPitch = false;
        sirenInterval = setInterval(() => {
            if (!sirenOscillator || !sirenAudioCtx) return;
            const targetFreq = highPitch ? 1100 : 700;
            sirenOscillator.frequency.setTargetAtTime(targetFreq, sirenAudioCtx.currentTime, 0.08);
            highPitch = !highPitch;
        }, 350);

        // UI Feedback
        const btnText = document.getElementById('siren-btn-text');
        const alertStatus = document.getElementById('siren-alert-status');
        if (btnText) btnText.textContent = 'Silence Siren';
        if (alertStatus) {
            alertStatus.style.display = 'block';
            alertStatus.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> SIREN ACTIVE &bull; Flash alert broadcasting...';
        }

        document.body.style.boxShadow = 'inset 0 0 40px rgba(239, 68, 68, 0.7)';
        showSptToast('Emergency Distress Siren Triggered! Stay safe.', 'error');
    } catch (e) {
        console.warn('Audio siren error:', e);
    }
}

function stopEmergencySiren() {
    if (sirenInterval) {
        clearInterval(sirenInterval);
        sirenInterval = null;
    }
    if (sirenOscillator) {
        try { sirenOscillator.stop(); sirenOscillator.disconnect(); } catch (e) {}
        sirenOscillator = null;
    }
    if (sirenAudioCtx) {
        try { sirenAudioCtx.close(); } catch (e) {}
        sirenAudioCtx = null;
    }

    const btnText = document.getElementById('siren-btn-text');
    const alertStatus = document.getElementById('siren-alert-status');
    if (btnText) btnText.textContent = 'Sound Emergency Alarm';
    if (alertStatus) alertStatus.style.display = 'none';

    document.body.style.boxShadow = 'none';
}

function simulatePoliceDispatch() {
    const city = localStorage.getItem('spt-city') || 'Delhi';
    showSptToast(`🚨 Distress coordinates transmitted to ${city} Transit Police Control Room. Patrol unit alerted.`, 'error');
}

function getShareableTripText() {
    const city = localStorage.getItem('spt-city') || 'Delhi';
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const trackingUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'tracking.html';
    return `🚨 Transit.IN Live Trip Shield\nI am currently traveling via Public Transit in ${city} (${time}).\nTrack my live vehicle location here: ${trackingUrl}\nStay connected with me!`;
}

function shareTripViaWhatsApp() {
    const text = encodeURIComponent(getShareableTripText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}

function shareTripViaSMS() {
    const text = encodeURIComponent(getShareableTripText());
    window.location.href = `sms:?body=${text}`;
}

function copyTripTrackingLink() {
    const text = getShareableTripText();
    navigator.clipboard.writeText(text).then(() => {
        showSptToast('Live trip tracking link copied to clipboard!', 'success');
    }).catch(() => {
        showSptToast('Copied live trip details to clipboard.', 'success');
    });
}
