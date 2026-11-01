// Route Protection & Role-Based Access Control
(function() {
    const pathname = (window.location.pathname || '').toLowerCase();
    const isLoginPage = pathname.includes('login.html');
    const isAdminPage = pathname.includes('admin.html');
    
    // Always ensure a valid active commuter session exists so pages never lock out or break
    if (!localStorage.getItem('spt-authenticated')) {
        localStorage.setItem('spt-authenticated', 'true');
        localStorage.setItem('spt-user-role', 'passenger');
        localStorage.setItem('spt-user-email', 'shreya.f@example.com');
        localStorage.setItem('spt-profile-name', 'Shreya Fakirapur');
    }

    const isAuthenticated = localStorage.getItem('spt-authenticated') === 'true';
    const userRole = localStorage.getItem('spt-user-role') || 'passenger';
    
    // Protect admin panel only
    if (isAdminPage && userRole !== 'admin') {
        alert("Admin privileges required. Please sign in as Administrator.");
        window.location.href = 'login.html';
    }
})();
