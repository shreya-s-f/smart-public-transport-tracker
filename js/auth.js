// This script runs BEFORE the DOM loads to prevent page flickering
(function() {
    // Check if we are already on the login page to prevent infinite redirect loops
    const isLoginPage = window.location.pathname.endsWith('login.html');
    
    // Check local storage for auth token
    const isAuthenticated = localStorage.getItem('spt-authenticated') === 'true';
    
    if (!isAuthenticated && !isLoginPage) {
        // Not logged in and trying to access a protected page
        window.location.replace('login.html');
    } else if (isAuthenticated && isLoginPage) {
        // Already logged in and trying to access the login page
        window.location.replace('index.html');
    }
})();
