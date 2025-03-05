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
            
            // Use Firebase Authentication to sign in
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Signed in
                    console.log("Login successful");
                    localStorage.setItem('ecosproutLoggedIn', 'true');
                    window.location.href = '/home';
                })
                .catch((error) => {
                    console.error("Login failed:", error);
                    alert('Invalid credentials. Please try again.');
                });
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
            firebase.auth().signOut().then(() => {
                localStorage.removeItem('ecosproutLoggedIn');
                window.location.href = '/';
            });
        });
    }
}); 