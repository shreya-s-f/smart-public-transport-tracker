// Route Protection & Role-Based Access Control
(function() {
    const isLoginPage = window.location.pathname.endsWith('login.html');
    const isAdminPage = window.location.pathname.endsWith('admin.html');
    
    const isAuthenticated = localStorage.getItem('spt-authenticated') === 'true';
    const userRole = localStorage.getItem('spt-user-role') || 'passenger';
    
    if (!isAuthenticated && !isLoginPage) {
        // Not logged in -> Redirect to login page
        window.location.replace('login.html');
    } else if (isAuthenticated && isLoginPage) {
        // Logged in & visiting login page -> Redirect to dashboard or admin panel
        if (userRole === 'admin') {
            window.location.replace('admin.html');
        } else {
            window.location.replace('index.html');
        }
    } else if (isAuthenticated && isAdminPage && userRole !== 'admin') {
        // Non-admin trying to access admin page -> Block & redirect
        alert("Access Denied: Admin privileges required.");
        window.location.replace('index.html');
    }
})();
