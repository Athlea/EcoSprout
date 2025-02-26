// Main JavaScript file for EcoSprout website

document.addEventListener('DOMContentLoaded', function() {
    console.log("Document loaded, initializing scripts...");
    // Navigation handling
    setupNavigation();
    
    // Login popup functionality
    setupLoginPopup();
    
    // Login form handling
    setupLoginForm();
});

function setupNavigation() {
    console.log("Setting up navigation...");
    
    // Fix Home link
    const homeLinks = document.querySelectorAll('a[href="~/"]');
    homeLinks.forEach(link => {
        link.setAttribute('href', '/');
    });
    
    // Fix About Us links
    const aboutLinks = document.querySelectorAll('a[href="~/about-us"]');
    aboutLinks.forEach(link => {
        link.setAttribute('href', '/about-us');
    });
    
    // Fix Offers links
    const offerLinks = document.querySelectorAll('a[href="~/#offers"], a[href="~/offers"]');
    offerLinks.forEach(link => {
        link.setAttribute('href', '/offers');
    });
    
    // Handle buttons with onclick attributes that might be using ~/ paths
    document.querySelectorAll('button.learn-more').forEach(button => {
        const onclickAttr = button.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes('~/')) {
            const newOnclick = onclickAttr.replace('~/', '/');
            button.setAttribute('onclick', newOnclick);
        }
    });
}

function setupLoginPopup() {
    console.log("Setting up login popup...");
    const loginButton = document.querySelector('.nav-button');
    const loginPopup = document.getElementById('loginPopup');
    const closePopup = document.querySelector('.close-popup');
    
    if (!loginButton) console.error("Login button not found");
    if (!loginPopup) console.error("Login popup not found");
    if (!closePopup) console.error("Close popup button not found");
    
    if (loginButton && loginPopup && closePopup) {
        console.log("All login elements found, attaching event listeners");
        
        // Login button
        loginButton.addEventListener('click', function(e) {
            console.log("Login button clicked");
            e.preventDefault();
            loginPopup.style.display = 'flex';
        });
        
        // Close button
        closePopup.addEventListener('click', function() {
            console.log("Close button clicked");
            loginPopup.style.display = 'none';
        });
        
        // Click outside to close
        window.addEventListener('click', function(e) {
            if (e.target === loginPopup) {
                console.log("Clicked outside popup");
                loginPopup.style.display = 'none';
            }
        });
    }
}

function setupLoginForm() {
    console.log("Setting up login form");
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
} 