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
    const autoWaterRef = {
        duration: ref(database, "settings/autoWater/pump3/duration"),
        enabled: ref(database, "settings/autoWater/pump3/enabled"),
        moistureThreshold: ref(database, "settings/autoWater/pump3/moistureThreshold"),
        temperatureThreshold: ref(database, "settings/autoWater/pump3/temperatureThreshold")
    };
 
    const tempRef = ref(database, "sensors/latest/temperature/sensor3");
    const moistureRef = ref(database, "sensors/latest/moisture/sensor3");
 
    const waterNowRef = {
        enabled: ref(database, "settings/manualWater/pump3/enabled"),
        schedule: {
            time: ref(database, "settings/manualWater/pump3/schedule/time"),
            date: ref(database, "settings/manualWater/pump3/schedule/date"),
            duration: ref(database, "settings/manualWater/pump3/schedule/duration")
        },
        status: ref(database, "settings/manualWater/pump3/status"),
        switch: ref(database, "settings/manualWater/pump3/switch")
    };
 
    function updateControlState() {
        const isAuto = autoWaterToggle.checked;
        waterDate.disabled = isAuto;
        waterTime.disabled = isAuto;
        waterDuration.disabled = isAuto;
        waterNowButton.disabled = isAuto;
    }
 
    // ✅ Auto-Watering Toggle Logic
    autoWaterToggle.addEventListener("change", () => {
        const isAutoWaterEnabled = autoWaterToggle.checked;
 
        console.log("Auto water toggled:", isAutoWaterEnabled);
 
        set(autoWaterRef.enabled, isAutoWaterEnabled)
            .then(() => console.log("Auto-watering status updated successfully!"))
            .catch((error) => console.error("Error updating auto-watering status:", error));
 
        // If auto-watering is OFF, enable manual watering
        if (!isAutoWaterEnabled) {
            set(waterNowRef.enabled, true)
                .then(() => console.log("Manual watering enabled (Auto OFF)"))
                .catch((error) => console.error("Error enabling manual watering:", error));
        }
 
        updateControlState();
    });
 
    // ✅ Manual Watering Logic
    waterNowButton.addEventListener("click", () => {
        const date = waterDate.value;
        const time = waterTime.value;
        const duration = waterDuration.value;
 
        if (!date || !time || !duration) {
            alert("Please enter all manual watering details.");
            return;
        }
 
        // Update manual watering schedule in Firebase
        set(waterNowRef.schedule.date, date)
            .then(() => console.log("Date updated successfully"))
            .catch((error) => console.error("Error updating date:", error));
 
        set(waterNowRef.schedule.time, time)
            .then(() => console.log("Time updated successfully"))
            .catch((error) => console.error("Error updating time:", error));
 
        set(waterNowRef.schedule.duration, duration)
            .then(() => console.log("Duration updated successfully"))
            .catch((error) => console.error("Error updating duration:", error));
 
        // Enable manual watering and trigger it
        set(waterNowRef.enabled, true)
            .then(() => console.log("Manual watering enabled"))
            .catch((error) => console.error("Error enabling manual watering:", error));
 
        set(waterNowRef.switch, true) // Ensures manual watering starts
            .then(() => console.log("Manual watering triggered"))
            .catch((error) => console.error("Error triggering manual watering:", error));
 
        alert(`Manual watering scheduled on ${date} at ${time} for ${duration} minutes.`);
    });
 
    function updateStatus(value, min, max, statusElement, type) {
        if (type === "moisture") {
            if (value < min) {
                statusElement.textContent = "Too Dry";
                statusElement.classList.remove("optimal", "critical");
                statusElement.classList.add("warning");
            } else if (value > max) {
                statusElement.textContent = "Too Wet";
                statusElement.classList.remove("optimal", "warning");
                statusElement.classList.add("critical");
            } else {
                statusElement.textContent = "Optimal";
                statusElement.classList.remove("warning", "crtical");
                statusElement.classList.add("optimal");
            }
        } else if (type === "temperature") {
            if (value < min) {
                statusElement.textContent = "Too Hot";
                statusElement.classList.remove("optimal", "warning");
                statusElement.classList.add("warning");
            } else if (value > max) {
                statusElement.textContent = "Too Cold";
                statusElement.classList.remove("optimal", "warning");
                statusElement.classList.add("critical");
            } else {
                statusElement.textContent = "Optimal";
                statusElement.classList.remove("warning", "crtical");
                statusElement.classList.add("optimal");
            }
        }
    }
 
    function fetchSensorData() {
        onValue(tempRef, (snapshot) => {
            if (snapshot.exists()) {
                let temp = Math.trunc(snapshot.val());
                tempElement.textContent = `${temp}°C`;
                updateStatus(temp, 20, 30, tempStatus, "temperature");
            }
        });

        onValue(moistureRef, (snapshot) => {
            if (snapshot.exists()) {
                const rawMoisture = snapshot.val();
                const moisturePercentage = Math.round((rawMoisture * 99) / 1023 + 1);
                moistureElement.textContent = `${moisturePercentage}%`;
                updateStatus(moisturePercentage, 41, 80, moistureStatus, "moisture");
            }

        });
 
        // ✅ Fetch Auto-Watering Status
        onValue(autoWaterRef.enabled, (snapshot) => {
            if (snapshot.exists()) {
                const isAutoWaterEnabled = snapshot.val();
                console.log("Auto Watering Status:", isAutoWaterEnabled);
                autoWaterToggle.checked = isAutoWaterEnabled;
                updateControlState();
            } else {
                console.warn("Auto-watering data not found in Firebase.");
            }
        });
 
        // ✅ Fetch Manual Watering Schedule
        onValue(waterNowRef.schedule.date, (snapshot) => {
            if (snapshot.exists()) {
                waterDate.value = snapshot.val();
            }
        });
 
        onValue(waterNowRef.schedule.time, (snapshot) => {
            if (snapshot.exists()) {
                waterTime.value = snapshot.val();
            }
        });
 
        onValue(waterNowRef.schedule.duration, (snapshot) => {
            if (snapshot.exists()) {
                waterDuration.value = snapshot.val();
            }
        });
 
        // ✅ Fetch Manual Watering Status
        onValue(waterNowRef.enabled, (snapshot) => {
            if (snapshot.exists()) {
                console.log("Manual Watering Enabled:", snapshot.val());
            }
        });
    }
 
    updateControlState();
    fetchSensorData();
});
 