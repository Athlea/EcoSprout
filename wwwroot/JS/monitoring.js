document.addEventListener('DOMContentLoaded', function() {
    console.log("Monitoring script loaded");
    
    // Auto water toggle functionality
    const autoWaterToggle = document.getElementById('autoWaterToggle');
    const waterDate = document.getElementById('waterDate');
    const waterTime = document.getElementById('waterTime');
    const waterDuration = document.getElementById('waterDuration');
    const waterNowButton = document.querySelector('.water-now-button');
    
    if (autoWaterToggle) {
        autoWaterToggle.addEventListener('change', function() {
            const isAutoEnabled = this.checked;
            console.log("Auto water toggled:", isAutoEnabled);
            
            // Enable/disable manual controls based on auto setting
            if (waterDate) waterDate.disabled = isAutoEnabled;
            if (waterTime) waterTime.disabled = isAutoEnabled;
            if (waterDuration) waterDuration.disabled = isAutoEnabled;
            if (waterNowButton) waterNowButton.disabled = isAutoEnabled;
        });
    }
    
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('ecosproutLoggedIn') === 'true';
    if (!isLoggedIn) {
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