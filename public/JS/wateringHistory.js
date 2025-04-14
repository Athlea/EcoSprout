import { getDatabase, ref, get, set } from "firebase/database"

export async function logWatering(pump, duration, mode) {
  const db = getDatabase()

  const crops = {
    pump1: "baby_carrots",
    pump2: "radish",
    pump3: "lettuce",
  }

  const crop = crops[pump]
  if (!crop) {
    console.error("Invalid pump selected.")
    return
  }

  const historyRef = ref(db, `wateringHistory/${crop}`)
  const countRef = ref(db, `wateringHistory/${crop}/count`)

  try {
    // Get the current count
    const countSnapshot = await get(countRef)
    let count = 1

    if (countSnapshot.exists()) {
      count = countSnapshot.val() + 1
    }

    // Update the count
    await set(countRef, count)

    // Create a proper date object to ensure correct date handling
    const currentDate = new Date()

    const newEntry = {
      date: currentDate.toLocaleDateString(),
      time: currentDate.toLocaleTimeString(),
      duration,
      mode,
      timestamp: Date.now(),
      id: count, // Store the numerical ID for reference
    }

    // Create the entry with sequential ID
    const entryRef = ref(db, `wateringHistory/${crop}/entry${count}`)

    // Set the entry with the sequential ID
    await set(entryRef, newEntry)
    console.log(`Watering logged for ${crop}: ${duration} min (${mode}) as entry${count}`)
  } catch (error) {
    console.error("Error logging watering:", error)
  }
}

