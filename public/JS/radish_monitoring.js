import { database } from "./firebase.js"
import { ref, set, onValue, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js"

// ✅ Log Watering History with sequential IDs
async function logWatering(pump, duration, mode, customTime = null, customDate = null) {
  const historyRef = ref(database, `wateringHistory/radish`)
  const countRef = ref(database, `wateringHistory/radish/count`)

  // Create a new Date object for consistent date handling
  const currentDate = new Date()

  try {
    // Get the current count
    const countSnapshot = await get(countRef)
    let count = 1

    if (countSnapshot.exists()) {
      count = countSnapshot.val() + 1
    }

    // Update the count
    await set(countRef, count)

    // Create the entry with sequential ID
    const entryRef = ref(database, `wateringHistory/radish/entry${count}`)

    const newEntry = {
      date: customDate || currentDate.toLocaleDateString(),
      time: customTime || currentDate.toLocaleTimeString(),
      duration: duration,
      mode: mode,
      timestamp: Date.now(),
      id: count, // Store the numerical ID for reference
    }

    // Set the entry with the sequential ID
    await set(entryRef, newEntry)
    console.log(`Watering logged for Radish: ${duration} min (${mode}) as entry${count}`)
  } catch (error) {
    console.error("Error logging watering:", error)
  }
}

function fetchWateringHistory() {
  const historyRef = ref(database, `wateringHistory/radish`)
  const historyTableBody = document.getElementById("historyTableBody")

  if (!historyTableBody) {
    console.error("History table body element not found")
    return
  }

  onValue(historyRef, (snapshot) => {
    if (snapshot.exists()) {
      historyTableBody.innerHTML = "" // Clear previous entries

      const historyData = snapshot.val()

      // Filter out entries (they start with "entry") and exclude the count field
      const entries = Object.entries(historyData)
        .filter(([key]) => key.startsWith("entry"))
        .map(([key, value]) => ({ key, ...value }))
        // Sort by ID in descending order (newest first)
        .sort((a, b) => {
          if (a.id && b.id) {
            return b.id - a.id // Newest first
          }
          return 0
        })

      entries.forEach((entry) => {
        const row = document.createElement("tr")
        row.innerHTML = `
          <td>${entry.date}</td>
          <td>${entry.time}</td>
          <td>${entry.duration} min</td>
          <td>${entry.mode}</td>
        `
        historyTableBody.appendChild(row)
      })
    } else {
      historyTableBody.innerHTML = "<tr><td colspan='4'>No watering history found.</td></tr>"
    }
  })
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Monitoring page loaded.")

  const autoWaterToggle = document.getElementById("autoWaterToggle")
  const waterNowButton = document.querySelector(".watering-controls button")
  const tempElement = document.getElementById("tempValue")
  const moistureElement = document.getElementById("moistureValue")
  const tempStatus = document.getElementById("tempStatus")
  const moistureStatus = document.getElementById("moistureStatus")
  const waterDate = document.getElementById("waterDate")
  const waterTime = document.getElementById("waterTime")
  const waterDuration = document.getElementById("waterDuration")

  if (
    !autoWaterToggle ||
    !waterNowButton ||
    !tempElement ||
    !moistureElement ||
    !tempStatus ||
    !moistureStatus ||
    !waterDate ||
    !waterTime ||
    !waterDuration
  ) {
    console.error("One or more elements not found in the DOM.")
    return
  }

  // ✅ Firebase Paths
  const autoWaterRef = {
    duration: ref(database, "settings/autoWater/pump2/duration"),
    enabled: ref(database, "settings/autoWater/pump2/enabled"),
    moistureThreshold: ref(database, "settings/autoWater/pump2/moistureThreshold"),
    temperatureThreshold: ref(database, "settings/autoWater/pump2/temperatureThreshold"),
  }

  const tempRef = ref(database, "sensors/latest/temperature/sensor2")
  const moistureRef = ref(database, "sensors/latest/moisture/sensor2")

  const waterNowRef = {
    enabled: ref(database, "settings/manualWater/pump2/enabled"),
    schedule: {
      time: ref(database, "settings/manualWater/pump2/schedule/time"),
      date: ref(database, "settings/manualWater/pump2/schedule/date"),
      duration: ref(database, "settings/manualWater/pump2/schedule/duration"),
    },
    status: ref(database, "settings/manualWater/pump2/status"),
    switch: ref(database, "settings/manualWater/pump2/switch"),
  }

  function updateControlState() {
    const isAuto = autoWaterToggle.checked
    waterDate.disabled = isAuto
    waterTime.disabled = isAuto
    waterDuration.disabled = isAuto
    waterNowButton.disabled = isAuto
  }

  // ✅ Auto-Watering Toggle Logic
  autoWaterToggle.addEventListener("change", () => {
    const isAutoWaterEnabled = autoWaterToggle.checked

    console.log("Auto water toggled:", isAutoWaterEnabled)

    set(autoWaterRef.enabled, isAutoWaterEnabled)
      .then(() => console.log("Auto-watering status updated successfully!"))
      .catch((error) => console.error("Error updating auto-watering status:", error))

    // If auto-watering is OFF, enable manual watering
    if (!isAutoWaterEnabled) {
      set(waterNowRef.enabled, true)
        .then(() => console.log("Manual watering enabled (Auto OFF)"))
        .catch((error) => console.error("Error enabling manual watering:", error))
    }

    // ✅ Log Auto-Watering Activation
    if (isAutoWaterEnabled) {
      onValue(autoWaterRef.duration, (snapshot) => {
        if (snapshot.exists()) {
          logWatering("pump2", snapshot.val(), "Auto")
        }
      })
    }

    updateControlState()
  })

  // ✅ Manual Watering Logic
  waterNowButton.addEventListener("click", async () => {
    const date = waterDate.value
    const time = waterTime.value
    const duration = waterDuration.value

    if (!date || !time || !duration) {
      alert("Please enter all manual watering details.")
      return
    }

    try {
      // Update manual watering schedule in Firebase
      await set(waterNowRef.schedule.date, date)
      console.log("Date updated successfully")

      await set(waterNowRef.schedule.time, time)
      console.log("Time updated successfully")

      await set(waterNowRef.schedule.duration, duration)
      console.log("Duration updated successfully")

      // Enable manual watering and trigger it
      await set(waterNowRef.enabled, true)
      console.log("Manual watering enabled")

      await set(waterNowRef.switch, true) // Ensures manual watering starts
      console.log("Manual watering triggered")

      alert(`Manual watering scheduled on ${date} at ${time} for ${duration} minutes.`)

      // ✅ Log Watering Event with the selected date and time
      const selectedDate = new Date(date)
      const formattedDate = selectedDate.toLocaleDateString()

      // Format the time to match the auto watering format (with AM/PM)
      let formattedTime = time
      if (time.indexOf("AM") === -1 && time.indexOf("PM") === -1) {
        // Convert 24-hour format to 12-hour format with AM/PM
        const timeParts = time.split(":")
        let hours = Number.parseInt(timeParts[0], 10)
        const minutes = timeParts[1]
        const ampm = hours >= 12 ? "PM" : "AM"
        hours = hours % 12
        hours = hours ? hours : 12 // Convert 0 to 12
        formattedTime = `${hours}:${minutes} ${ampm}`
      }

      // Log the manual watering with the selected time and date
      await logWatering("pump2", duration, "Manual", formattedTime, formattedDate)
    } catch (error) {
      console.error("Error during manual watering setup:", error)
    }
  })

  function updateStatus(value, min, max, statusElement, type) {
    if (type === "moisture") {
      if (value < min) {
        statusElement.textContent = "Too Dry"
        statusElement.classList.remove("optimal", "critical")
        statusElement.classList.add("warning")
      } else if (value > max) {
        statusElement.textContent = "Too Wet"
        statusElement.classList.remove("optimal", "warning")
        statusElement.classList.add("critical")
      } else {
        statusElement.textContent = "Optimal"
        statusElement.classList.remove("warning", "crtical")
        statusElement.classList.add("optimal")
      }
    } else if (type === "temperature") {
      if (value < min) {
        statusElement.textContent = "Too Hot"
        statusElement.classList.remove("optimal", "warning")
        statusElement.classList.add("warning")
      } else if (value > max) {
        statusElement.textContent = "Too Cold"
        statusElement.classList.remove("optimal", "warning")
        statusElement.classList.add("critical")
      } else {
        statusElement.textContent = "Optimal"
        statusElement.classList.remove("warning", "crtical")
        statusElement.classList.add("optimal")
      }
    }
  }

  function fetchSensorData() {
    onValue(tempRef, (snapshot) => {
      if (snapshot.exists()) {
        const temp = Math.trunc(snapshot.val())
        tempElement.textContent = `${temp}°C`
        updateStatus(temp, 20, 30, tempStatus, "temperature")
      }
    })

    onValue(moistureRef, (snapshot) => {
      if (snapshot.exists()) {
        const rawMoisture = snapshot.val()
        const moisturePercentage = Math.round((rawMoisture * 99) / 1023 + 1)
        moistureElement.textContent = `${moisturePercentage}%`
        updateStatus(moisturePercentage, 41, 80, moistureStatus, "moisture")
      }
    })

    // ✅ Fetch Auto-Watering Status
    onValue(autoWaterRef.enabled, (snapshot) => {
      if (snapshot.exists()) {
        const isAutoWaterEnabled = snapshot.val()
        console.log("Auto Watering Status:", isAutoWaterEnabled)
        autoWaterToggle.checked = isAutoWaterEnabled
        updateControlState()
      } else {
        console.warn("Auto-watering data not found in Firebase.")
      }
    })

    // ✅ Fetch Manual Watering Schedule
    onValue(waterNowRef.schedule.date, (snapshot) => {
      if (snapshot.exists()) {
        waterDate.value = snapshot.val()
      }
    })

    onValue(waterNowRef.schedule.time, (snapshot) => {
      if (snapshot.exists()) {
        waterTime.value = snapshot.val()
      }
    })

    onValue(waterNowRef.schedule.duration, (snapshot) => {
      if (snapshot.exists()) {
        waterDuration.value = snapshot.val()
      }
    })

    // ✅ Fetch Manual Watering Status
    onValue(waterNowRef.enabled, (snapshot) => {
      if (snapshot.exists()) {
        console.log("Manual Watering Enabled:", snapshot.val())
      }
    })
  }

  updateControlState()
  fetchSensorData()
  fetchWateringHistory() // Add this line to fetch watering history
})

