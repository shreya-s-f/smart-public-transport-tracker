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

    // Auth: Inject Logout Button
    const navActions = document.querySelector('.nav-actions');
    if (navActions && !window.location.pathname.endsWith('login.html')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'theme-toggle';
        logoutBtn.style.color = 'var(--danger-color)';
        logoutBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i>';
        logoutBtn.title = 'Logout';
        
        logoutBtn.addEventListener('click', () => {
            if(confirm("Are you sure you want to log out?")) {
                localStorage.removeItem('spt-authenticated');
                window.location.href = 'login.html';
            }
        });
        
        navActions.insertBefore(logoutBtn, navActions.firstChild);
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
    
    // Set City Background in Hero
    const heroSection = document.getElementById('hero-section');
    if(heroSection) {
        if(savedCity === 'Delhi') heroSection.style.backgroundImage = "url('https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1000&auto=format&fit=crop')";
        if(savedCity === 'Mumbai') heroSection.style.backgroundImage = "url('https://images.unsplash.com/photo-1522262590532-a991489a0253?q=80&w=1000&auto=format&fit=crop')";
        if(savedCity === 'Bangalore') heroSection.style.backgroundImage = "url('https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1000&auto=format&fit=crop')";
    }
    
    citySelectors.forEach(selector => {
        // Set initial value
        selector.value = savedCity;
        
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
                }, 1000);
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
            'Delhi': ['507', 'GL-23', '390', 'Airport Express'],
            'Mumbai': ['BEST 301', 'AC-10', 'C-71', 'Bandra Local'],
            'Bangalore': ['V-500D', 'KIA-9', '335E', 'Silk Board']
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

});

// Utility to get random ETA for demo purposes
function getRandomETA(min = 2, max = 25) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
