import { auth } from "./firebase.js"; 
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
    console.log("Login script loaded");

    // Get the login form
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            console.log("Login attempt:", email);

            // ✅ Use imported `auth` for authentication
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    console.log("Login successful");
                    localStorage.setItem('ecosproutLoggedIn', 'true');
                    window.location.href = '/home';
                })
                .catch((error) => {
                    console.error("Login failed:", error);
                    alert('Invalid credentials. Please try again.');
                });
        });
    }

    // Check if user is logged in on protected pages
    const currentPath = window.location.pathname;
    const isLoggedIn = localStorage.getItem('ecosproutLoggedIn') === 'true';

    const protectedPages = ['/home', '/monitoring', '/reports', '/monitoring/baby-carrots', '/monitoring/radish', '/monitoring/lettuce'];

    if (protectedPages.some(page => currentPath.startsWith(page)) && !isLoggedIn) {
        console.log("Access denied, redirecting to login");
        window.location.href = '/';
    }

    // Handle logout
    const logoutButton = document.querySelector('.nav-button');
    if (logoutButton && logoutButton.textContent.includes('Log Out')) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Logging out");

            signOut(auth).then(() => {
                localStorage.removeItem('ecosproutLoggedIn');
                window.location.href = '/';
            }).catch((error) => {
                console.error("Logout failed:", error);
            });
        });
    }
});
