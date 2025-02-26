document.addEventListener('DOMContentLoaded', function() {
    console.log("Login script loaded");
    
    // Get the login form
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            console.log("Login attempt:", email);
            
            // Simple credential check
            if (email === 'ecosprout@cit' && password === '12345') {
                console.log("Login successful");
                // Store login state in localStorage
                localStorage.setItem('ecosproutLoggedIn', 'true');
                // Redirect to home page
                window.location.href = '/home';
            } else {
                console.log("Login failed");
                alert('Invalid credentials. Please try again.');
            }
        });
    }
    
    // Check if user is logged in on protected pages
    const currentPath = window.location.pathname;
    const isLoggedIn = localStorage.getItem('ecosproutLoggedIn') === 'true';
    
    // List of protected pages
    const protectedPages = ['/home', '/monitoring', '/reports', '/monitoring/baby-carrots', '/monitoring/radish', '/monitoring/lettuce'];
    
    // If on a protected page and not logged in, redirect to landing
    if (protectedPages.some(page => currentPath.startsWith(page)) && !isLoggedIn) {
        console.log("Access denied, redirecting to login");
        window.location.href = '/';
    }
    
    // Handle logout button
    const logoutButton = document.querySelector('.nav-button');
    if (logoutButton && logoutButton.textContent.includes('Log Out')) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Logging out");
            localStorage.removeItem('ecosproutLoggedIn');
            window.location.href = '/';
        });
    }
}); 