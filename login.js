/**
 * StayPremium - Dual Context Auth Router Pipeline (Login & Registration Account System)
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword,
    createUserWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCfa9vnSViGViHteH0xY3zZgTIl7P22EV8",
  authDomain: "impstaff-93232.firebaseapp.com",
  databaseURL: "https://impstaff-93232-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "impstaff-93232",
  storageBucket: "impstaff-93232.firebasestorage.app",
  messagingSenderId: "384617941707",
  appId: "1:384617941707:web:26a59adb8472371d0ee94e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let phoneConfirmationTracker = null;

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SLIDING TABS SCREEN NAVIGATION INTERFACE ---
    const tabLogin = document.getElementById('toggle-login-tab');
    const tabRegister = document.getElementById('toggle-register-tab');
    const panelLogin = document.getElementById('login-panel');
    const panelRegister = document.getElementById('register-panel');

    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        panelLogin.classList.add('active');
        panelRegister.classList.remove('active');
    });

    tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        panelRegister.classList.add('active');
        panelLogin.classList.remove('active');
    });

    // --- 2. REGISTRATION CONTROLLER ENGINE (CREATE ACCOUNT) ---
    const registerForm = document.getElementById('email-register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value.trim();
            const phone = document.getElementById('register-phone').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;

            createUserWithEmailAndPassword(auth, email, password)
                .then((result) => syncUserDataPipeline(result.user, name, phone))
                .catch(err => alert("Registration Failed: " + err.message));
        });
    }

    // --- 3. LOGIN CONTROLLER ENGINE (SIGN IN) ---
    const loginForm = document.getElementById('email-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            signInWithEmailAndPassword(auth, email, password)
                .then((result) => syncUserDataPipeline(result.user, email.split('@')[0], 'N/A'))
                .catch(err => alert("Login Failed: " + err.message));
        });
    }

    // --- 4. GOOGLE INTERCEPT AUTH POPUP TRIGGER ---
    const googleAuthBtn = document.getElementById('google-auth-btn');
    if (googleAuthBtn) {
        googleAuthBtn.addEventListener('click', () => {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider)
                .then((result) => syncUserDataPipeline(result.user, result.user.displayName, result.user.phoneNumber || 'N/A'))
                .catch(err => alert("Google Identity Authentication Interrupted: " + err.message));
        });
    }

    // --- 5. PHONE SMS ENGINE LAYER WITH INVISIBLE RECAPTCHA ---
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible' });

    const sendOtpBtn = document.getElementById('send-otp-btn');
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', () => {
            const num = document.getElementById('login-phone').value.trim();
            if (num.length !== 10) return alert("Enter structural 10-digit sequence.");

            signInWithPhoneNumber(auth, `+91${num}`, window.recaptchaVerifier)
                .then((confirmationResult) => {
                    phoneConfirmationTracker = confirmationResult;
                    document.getElementById('phone-field-block').style.display = 'none';
                    document.getElementById('otp-field-block').style.display = 'block';
                })
                .catch(err => alert("OTP dispatch failure structural fault: " + err.message));
        });
    }

    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', () => {
            const code = document.getElementById('login-otp').value.trim();
            if (code.length !== 6) return alert("OTP consists of exactly 6 digits.");

            if (phoneConfirmationTracker) {
                phoneConfirmationTracker.confirm(code)
                    .then((result) => syncUserDataPipeline(result.user, "Mobile Verified Resident", result.user.phoneNumber))
                    .catch(() => alert("Verification code rejection framework alert."));
            }
        });
    }

    // --- 6. REALTIME CLOUD SYNC & 11-DIGIT AUTO GENERATION LAYER ---
    function syncUserDataPipeline(user, targetName, targetPhone) {
        const idPattern = '0123456789';
        let custom11DigitUID = '';
        for (let i = 0; i < 11; i++) {
            custom11DigitUID += idPattern.charAt(Math.floor(Math.random() * idPattern.length));
        }

        const userPackage = {
            uid: custom11DigitUID,
            firebaseUid: user.uid,
            name: targetName || "Premium Resident",
            email: user.email || "N/A",
            phone: targetPhone || "N/A",
            timestamp: new Date().toISOString()
        };

        // Profile pages parsing acceleration setup parameters mapping cache
        localStorage.setItem('staypremium_uid', custom11DigitUID);
        localStorage.setItem('staypremium_name', userPackage.name);
        localStorage.setItem('staypremium_email', userPackage.email);
        localStorage.setItem('staypremium_phone', userPackage.phone);

        // RTDB Path Generation Node `/users/{uid}` mapping block execution
        set(ref(db, 'users/' + user.uid), userPackage)
            .then(() => window.location.href = 'profile.html')
            .catch(() => window.location.href = 'profile.html');
    }
});