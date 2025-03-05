// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB7_LUAdQPk-koxkRS721u-U2tBeAmKngo",
  authDomain: "ecosprout-6173d.firebaseapp.com",
  databaseURL: "https://ecosprout-6173d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ecosprout-6173d",
  storageBucket: "ecosprout-6173d.firebasestorage.app",
  messagingSenderId: "32089107450",
  appId: "1:32089107450:web:650f57a7308afac3bc5243",
  measurementId: "G-TH2QLS6BMX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database  = getDatabase(app);

export { database};
