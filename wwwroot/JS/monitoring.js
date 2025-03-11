import { database } from "./firebase.js";
import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
 
document.addEventListener("DOMContentLoaded", function () {
    console.log("Monitoring page loaded.");
 
    const autoWaterToggle = document.getElementById("autoWaterToggle");
    const waterNowButton = document.querySelector(".watering-controls button");
    const tempElement = document.getElementById("tempValue");
    const moistureElement = document.getElementById("moistureValue");
    const tempStatus = document.getElementById("tempStatus");
    const moistureStatus = document.getElementById("moistureStatus");
    const waterDate = document.getElementById("waterDate");
    const waterTime = document.getElementById("waterTime");
    const waterDuration = document.getElementById("waterDuration");
 
    if (!autoWaterToggle || !waterNowButton || !tempElement || !moistureElement || !tempStatus || !moistureStatus || !waterDate || !waterTime || !waterDuration) {
        console.error("One or more elements not found in the DOM.");
        return;
    }
 
    // ✅ Firebase Paths
    const autoWaterRef = ref(database, "settings/autoWater/pump1");
    const tempRef = ref(database, "sensors/latest/temperature/sensor1");
    const moistureRef = ref(database, "sensors/latest/moisture/sensor1");
    const waterNowRef = ref(database, "control/waterNow");
 
    function updateControlState() {
        const isAuto = autoWaterToggle.checked;
        waterDate.disabled = isAuto;
        waterTime.disabled = isAuto;
        waterDuration.disabled = isAuto;
        waterNowButton.disabled = isAuto;
    }
 
    autoWaterToggle.addEventListener("change", () => {
        console.log("Auto water toggled:", autoWaterToggle.checked);
        set(autoWaterRef, autoWaterToggle.checked)
            .then(() => console.log("Auto-watering status updated successfully!"))
            .catch((error) => console.error("Error updating auto-watering status:", error));
        updateControlState();
    });
 
    waterNowButton.addEventListener("click", () => {
        const date = waterDate.value;
        const time = waterTime.value;
        const duration = waterDuration.value;
 
        if (!date || !time || !duration) {
            alert("Please enter all manual watering details.");
            return;
        }
 
        set(waterNowRef, { trigger: true, date, time, duration })
            .then(() => console.log(`Manual watering scheduled on ${date} at ${time} for ${duration} minutes.`))
            .catch((error) => console.error("Error triggering manual watering:", error));
 
        alert(`Manual watering scheduled on ${date} at ${time} for ${duration} minutes.`);
    });
 
    function updateStatus(value, min, max, statusElement) {
        if (value < min || value > max) {
            statusElement.textContent = "Not Optimal";
            statusElement.classList.remove("optimal");
            statusElement.classList.add("not-optimal");
        } else {
            statusElement.textContent = "Optimal";
            statusElement.classList.remove("not-optimal");
            statusElement.classList.add("optimal");
        }
    }
 
    function fetchSensorData() {
        onValue(tempRef, (snapshot) => {
            if (snapshot.exists()) {
                const temp = snapshot.val();
                console.log("New Temperature:", temp);
                tempElement.textContent = `${temp}°C`;
                updateStatus(temp, 20, 30, tempStatus);
            } else {
                console.warn("Temperature data not found in Firebase.");
            }
        });
 
        onValue(moistureRef, (snapshot) => {
            if (snapshot.exists()) {
                const rawMoisture = snapshot.val(); // Get raw sensor value (0-1023)
                const moisturePercentage = Math.round((rawMoisture * 99) / 1023 + 1); // Convert to 1-100%
                
                console.log(`Raw Moisture: ${rawMoisture}, Converted: ${moisturePercentage}%`);
                moistureElement.textContent = `${moisturePercentage}%`;
                
                updateStatus(moisturePercentage, 41, 80, moistureStatus); // Check if moisture is optimal
            } else {
                console.warn("Soil moisture data not found in Firebase.");
            }
        });
 
        onValue(autoWaterRef, (snapshot) => {
            if (snapshot.exists()) {
                const isAutoWaterEnabled = snapshot.val();
                console.log("Auto Watering Status:", isAutoWaterEnabled);
                autoWaterToggle.checked = isAutoWaterEnabled;
                updateControlState();
            } else {
                console.warn("Auto-watering data not found in Firebase.");
            }
        });
    }
 
    updateControlState();
    fetchSensorData();
});