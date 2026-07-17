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
    
    citySelectors.forEach(selector => {
        // Set initial value
        selector.value = savedCity;
        
        // Listen for changes
        selector.addEventListener('change', (e) => {
            const newCity = e.target.value;
            localStorage.setItem('spt-city', newCity);
            
            // Reload page to fetch new city data in specific scripts (routes.js, tracking.js, etc.)
            window.location.reload();
        });
    });
});

// Utility to get random ETA for demo purposes
function getRandomETA(min = 2, max = 25) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
