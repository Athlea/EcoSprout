import { auth, database } from "./firebase.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.getElementById("registerButton").addEventListener("click", function (event) {
    event.preventDefault();

    // Get user input
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validate fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        alert("All fields are required!");
        return;
    }
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    // Register user
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("User registered:", user);

            // Store user info in database
            return set(ref(database, "users/" + user.uid), {
                firstName: firstName,
                lastName: lastName,
                email: email
            });
        })
        .then(() => {
            alert("Registration successful!");
            window.location.href = "login.html";
        })
        .catch((error) => {
            console.error("Error:", error);
            alert(error.message);
        });
});
