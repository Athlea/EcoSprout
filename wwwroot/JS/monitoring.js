document.addEventListener('DOMContentLoaded', function() {
    console.log("Monitoring script loaded");
    
    // Check if Firebase is initialized
    if (typeof firebase !== 'undefined') {
        console.log("Firebase is available");
        
        // Get real-time data for temperature and moisture
        const plantId = getCurrentPlantId();
        if (plantId) {
            setupFirebaseListeners(plantId);
        }
    } else {
        console.error("Firebase is not available. Make sure to include Firebase scripts.");
    }
    
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
            
            // Update Firebase with auto setting
            if (typeof firebase !== 'undefined') {
                const plantId = getCurrentPlantId();
                if (plantId) {
                    firebase.database().ref('plants/' + plantId + '/autoWater').set(isAutoEnabled);
                }
            }
        });
    }
    
    // Handle Water Now button
    if (waterNowButton) {
        waterNowButton.addEventListener('click', function() {
            if (!this.disabled) {
                const plantId = getCurrentPlantId();
                const duration = waterDuration ? parseInt(waterDuration.value) : 5;
                
                if (plantId && typeof firebase !== 'undefined') {
                    // Add watering event to Firebase
                    const wateringRef = firebase.database().ref('plants/' + plantId + '/watering');
                    wateringRef.push({
                        date: new Date().toLocaleDateString(),
                        time: new Date().toLocaleTimeString(),
                        duration: duration,
                        mode: 'Manual'
                    });
                    
                    alert(`Watering ${plantId} for ${duration} minutes`);
                }
            }
        });
    }
    
    // Set default values for date and time inputs
    if (waterDate) {
        const today = new Date();
        waterDate.valueAsDate = today;
    }
    
    if (waterTime) {
        const now = new Date();
        waterTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
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
            if (typeof firebase !== 'undefined') {
                firebase.auth().signOut();
            }
            localStorage.removeItem('ecosproutLoggedIn');
            window.location.href = '/';
        });
    }
});

// Helper function to get the current plant ID from the URL
function getCurrentPlantId() {
    const path = window.location.pathname;
    
    if (path.includes('/baby-carrots')) {
        return 'baby-carrots';
    } else if (path.includes('/radish')) {
        return 'radish';
    } else if (path.includes('/lettuce')) {
        return 'lettuce';
    }
    
    return null;
}

// Set up Firebase real-time listeners for plant data
function setupFirebaseListeners(plantId) {
    // Listen for temperature updates
    firebase.database().ref('plants/' + plantId + '/temperature').on('value', (snapshot) => {
        const temperature = snapshot.val();
        if (temperature !== null) {
            // Update UI with temperature
            const tempElement = document.querySelector('.data-card:nth-child(1) .data-value');
            if (tempElement) {
                tempElement.textContent = `${temperature}°C`;
                
                // Update status based on temperature
                const statusElement = document.querySelector('.data-card:nth-child(1) .data-status');
                if (statusElement) {
                    statusElement.textContent = getTemperatureStatus(temperature);
                    statusElement.className = 'data-status ' + getTemperatureStatusClass(temperature);
                }
            }
        }
    });
    
    // Listen for moisture updates
    firebase.database().ref('plants/' + plantId + '/moisture').on('value', (snapshot) => {
        const moisture = snapshot.val();
        if (moisture !== null) {
            // Update UI with moisture
            const moistureElement = document.querySelector('.data-card:nth-child(2) .data-value');
            if (moistureElement) {
                moistureElement.textContent = `${moisture}%`;
                
                // Update status based on moisture
                const statusElement = document.querySelector('.data-card:nth-child(2) .data-status');
                if (statusElement) {
                    statusElement.textContent = getMoistureStatus(moisture);
                    statusElement.className = 'data-status ' + getMoistureStatusClass(moisture);
                }
            }
        }
    });
    
    // Listen for auto water setting
    firebase.database().ref('plants/' + plantId + '/autoWater').on('value', (snapshot) => {
        const autoWater = snapshot.val();
        if (autoWater !== null) {
            const autoToggle = document.getElementById('autoWaterToggle');
            if (autoToggle) {
                autoToggle.checked = autoWater;
                
                // Update disabled state of controls
                const waterDate = document.getElementById('waterDate');
                const waterTime = document.getElementById('waterTime');
                const waterDuration = document.getElementById('waterDuration');
                const waterNowButton = document.querySelector('.water-now-button');
                
                if (waterDate) waterDate.disabled = autoWater;
                if (waterTime) waterTime.disabled = autoWater;
                if (waterDuration) waterDuration.disabled = autoWater;
                if (waterNowButton) waterNowButton.disabled = autoWater;
            }
        }
    });
    
    // Listen for watering history updates
    firebase.database().ref('plants/' + plantId + '/watering').on('value', (snapshot) => {
        const watering = snapshot.val();
        if (watering) {
            updateWateringHistory(watering);
        }
    });
}

// Helper functions for determining status text and class
function getTemperatureStatus(temp) {
    if (temp >= 18 && temp <= 26) return 'Optimal';
    if (temp > 26 && temp <= 30) return 'Warning: High';
    if (temp < 18 && temp >= 12) return 'Warning: Low';
    return 'Critical';
}

function getTemperatureStatusClass(temp) {
    if (temp >= 18 && temp <= 26) return 'optimal';
    if (temp > 26 && temp <= 30) return 'warning';
    if (temp < 18 && temp >= 12) return 'warning';
    return 'critical';
}

function getMoistureStatus(moisture) {
    if (moisture >= 60 && moisture <= 80) return 'Optimal';
    if (moisture > 80 && moisture <= 90) return 'Warning: High';
    if (moisture < 60 && moisture >= 40) return 'Warning: Low';
    return 'Critical';
}

function getMoistureStatusClass(moisture) {
    if (moisture >= 60 && moisture <= 80) return 'optimal';
    if (moisture > 80 && moisture <= 90) return 'warning';
    if (moisture < 60 && moisture >= 40) return 'warning';
    return 'critical';
}

// Update watering history table
function updateWateringHistory(wateringData) {
    const historyTableBody = document.querySelector('.history-table tbody');
    if (!historyTableBody) return;
    
    // Clear existing rows
    historyTableBody.innerHTML = '';
    
    // Convert object to array and sort by date/time (newest first)
    const wateringArray = Object.keys(wateringData).map(key => {
        return {
            id: key,
            ...wateringData[key]
        };
    }).sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateB - dateA;
    });
    
    // Add rows to table (limit to most recent 10 events)
    wateringArray.slice(0, 10).forEach(event => {
        const row = document.createElement('tr');
        
        const dateCell = document.createElement('td');
        dateCell.textContent = event.date;
        
        const timeCell = document.createElement('td');
        timeCell.textContent = event.time;
        
        const durationCell = document.createElement('td');
        durationCell.textContent = event.duration + ' minutes';
        
        const modeCell = document.createElement('td');
        modeCell.textContent = event.mode;
        
        row.appendChild(dateCell);
        row.appendChild(timeCell);
        row.appendChild(durationCell);
        row.appendChild(modeCell);
        
        historyTableBody.appendChild(row);
    });
} 