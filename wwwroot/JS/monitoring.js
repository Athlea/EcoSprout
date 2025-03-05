import { database } from "./firebase.js";
import { ref, set, update, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", function () {
    console.log("Monitoring page loaded.");

    // Get elements safely
    const autoWaterToggle = document.getElementById("autoWaterToggle");
    const waterNowButton = document.querySelector(".watering-controls button");
    const tempElement = document.querySelector(".data-value"); // Temperature
    const moistureElement = document.querySelector(".data-card:nth-child(2) .data-value"); // Soil Moisture
    const waterDate = document.getElementById("waterDate");
    const waterTime = document.getElementById("waterTime");
    const waterDuration = document.getElementById("waterDuration");

    // Ensure elements exist before proceeding
    if (!autoWaterToggle || !waterNowButton || !tempElement || !moistureElement || !waterDate || !waterTime || !waterDuration) {
        console.error("One or more elements not found in the DOM.");
        return;
    }

    // Firebase references
    const autoWaterRef = ref(database, "settings/autoWater/enabled");
    const tempRef = ref(database, "sensors/temperature");
    const moistureRef = ref(database, "sensors/moisture");
    const waterNowRef = ref(database, "control/waterNow");

    // Function to enable/disable manual controls based on auto mode
    function updateControlState() {
        const isAuto = autoWaterToggle.checked;

        waterDate.disabled = isAuto;
        waterTime.disabled = isAuto;
        waterDuration.disabled = isAuto;
        waterNowButton.disabled = isAuto;
    }

    // Auto-watering toggle switch event
    autoWaterToggle.addEventListener("change", () => {
        console.log("Auto water toggled:", autoWaterToggle.checked);

        update(autoWaterRef, { enabled: autoWaterToggle.checked })
            .then(() => console.log("Database updated successfully!"))
            .catch((error) => console.error("Error updating database:", error));

        // Update UI control states when toggled
        updateControlState();
    });

    // Manual watering button event
    waterNowButton.addEventListener("click", () => {
        const date = waterDate.value;
        const time = waterTime.value;
        const duration = waterDuration.value;

        if (!date || !time || !duration) {
            alert("No input");
            return;
        }

        update(waterNowRef, { trigger: true, date: date, time: time, duration: duration })
            .then(() => console.log(`Manual watering scheduled on ${date} at ${time} for ${duration} minutes.`))
            .catch((error) => console.error("Error triggering manual watering:", error));
        
        alert(`Manual watering scheduled on ${date} at ${time} for ${duration} minutes.`);
    });

    // Fetch sensor data from Firebase
    function fetchSensorData() {
        onValue(tempRef, (snapshot) => {
            if (snapshot.exists()) {
                tempElement.textContent = `${snapshot.val()}°C`;
            } else {
                console.warn("Temperature data not found in Firebase.");
            }
        });

        onValue(moistureRef, (snapshot) => {
            if (snapshot.exists()) {
                moistureElement.textContent = `${snapshot.val()}%`;
            } else {
                console.warn("Soil moisture data not found in Firebase.");
            }
        });

        onValue(autoWaterRef, (snapshot) => {
            if (snapshot.exists()) {
                autoWaterToggle.checked = snapshot.val();
                updateControlState(); // Ensure controls match the database state
            }
        });
    }

    // Run functions on page load
    updateControlState(); // Ensure controls are correct on load
    fetchSensorData();
});
