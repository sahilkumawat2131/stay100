/**
 * StayPremium - Unified Authentication & Session Engine
 * Handshaking directly with index.js via standardized storage mapping pointers.
 */

// --- INITIALIZATION ---
const firebaseConfig = {
  apiKey: "AIzaSyCcStFHPf5AOCZgqMCWq9T7nd4lFXAcA8M",
  authDomain: "stay100-31316.firebaseapp.com",
  databaseURL: "https://stay100-31316-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stay100-31316",
  storageBucket: "stay100-31316.firebasestorage.app",
  messagingSenderId: "91816784620",
  appId: "1:91816784620:web:45cbf9baa3808fc580ebc9",
  measurementId: "G-4J40FKKDNT"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// Global Toast Notification Utility (Synced with system theme)
function showAuthToast(message, isSuccess = true) {
    const activeToast = document.getElementById('auth-system-toast');
    if (activeToast) activeToast.remove();

    const container = document.createElement('div');
    container.id = 'auth-system-toast';
    container.innerHTML = `
        <div style="
            position: fixed; top: 20px; right: 20px;
            background: ${isSuccess ? '#2e7d32' : '#800020'}; color: #ffffff; padding: 12px 24px;
            border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: sans-serif;
            font-size: 14px; font-weight: 600; z-index: 100000; display: flex; align-items: center; gap: 8px;
            opacity: 0; transform: translateY(-20px); transition: all 0.3s ease;
        ">
            <i class="fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(container);
    const inner = container.querySelector('div');

    setTimeout(() => {
        inner.style.opacity = '1';
        inner.style.transform = 'translateY(0)';
    }, 50);

    setTimeout(() => {
        inner.style.opacity = '0';
        inner.style.transform = 'translateY(-20px)';
        setTimeout(() => container.remove(), 300);
    }, 3000);
}

// --- CORE AUTH PIPELINE ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. TAB SWITCHING ENGINE
    const loginTabBtn = document.getElementById('toggle-login-tab');
    const registerTabBtn = document.getElementById('toggle-register-tab');
    const loginPanel = document.getElementById('login-panel');
    const registerPanel = document.getElementById('register-panel');

    if (loginTabBtn && registerTabBtn) {
        loginTabBtn.addEventListener('click', () => {
            loginTabBtn.classList.add('active');
            registerTabBtn.classList.remove('active');
            loginPanel.classList.add('active');
            registerPanel.classList.remove('active');
        });

        registerTabBtn.addEventListener('click', () => {
            registerTabBtn.classList.add('active');
            loginTabBtn.classList.remove('active');
            registerPanel.classList.add('active');
            loginPanel.classList.remove('active');
        });
    }

    // 2. LOGIN HANDLER
    const loginForm = document.getElementById('email-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const phoneInput = document.getElementById('login-phone').value.trim();
            const passwordInput = document.getElementById('login-password').value;

            if (!phoneInput || !passwordInput) {
                showAuthToast("Please fill in all security fields.", false);
                return;
            }

            // Query Firebase users node by phone number index
            db.ref('users').orderByChild('phone').equalTo(phoneInput).once('value')
                .then((snapshot) => {
                    if (!snapshot.exists()) {
                        showAuthToast("No user account matching this number exists.", false);
                        return;
                    }

                    let userData = null;
                    let userId = null;

                    // Extract the singular user payload
                    snapshot.forEach((childSnapshot) => {
                        userId = childSnapshot.key;
                        userData = childSnapshot.val();
                    });

                    // Validate matching password context
                    if (userData && userData.password === passwordInput) {
                        // Establish synchronized local keys
                        localStorage.setItem('stay100_uid', userId);
                        localStorage.setItem('stay100_name', userData.name || "User Node");
                        localStorage.setItem('stay100_phone', phoneInput);

                        // If user has vendor plan allocations, push details to LocalStorage mapping
                        if (userData.planType && userData.planStartDate) {
                            localStorage.setItem(`stay100_plan_${userId}`, userData.planType);
                            localStorage.setItem(`stay100_start_${userId}`, userData.planStartDate);
                        }

                        showAuthToast("Access Authorized! Entering dashboard...", true);
                        
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1200);
                    } else {
                        showAuthToast("Invalid credential string matched. Try again.", false);
                    }
                })
                .catch((err) => {
                    console.error("Auth transaction runtime error: ", err);
                    showAuthToast("Server processing anomaly. Please retry later.", false);
                });
        });
    }

    // 3. REGISTRATION HANDLER
    const registerForm = document.getElementById('email-register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const fullName = document.getElementById('register-name').value.trim();
            const phoneNumber = document.getElementById('register-phone').value.trim();
            const newPassword = document.getElementById('register-password').value;

            if (!fullName || !phoneNumber || !newPassword) {
                showAuthToast("All fields are mandatory.", false);
                return;
            }

            if (phoneNumber.length !== 10 || isNaN(phoneNumber)) {
                showAuthToast("Please input a valid 10-digit smartphone sequence.", false);
                return;
            }

            // Check if account node space already exists
            db.ref('users').orderByChild('phone').equalTo(phoneNumber).once('value')
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        showAuthToast("An account already belongs to this phone sequence.", false);
                        return;
                    }

                    // Build user payload structure
                    const newUserRef = db.ref('users').push();
                    const newUserId = newUserRef.key;
                    const timestamp = Date.now();

                    const userPayload = {
                        name: fullName,
                        phone: phoneNumber,
                        password: newPassword,
                        createdAt: timestamp,
                        role: "user" 
                    };

                    newUserRef.set(userPayload)
                        .then(() => {
                            // Automatically provision localized auth matrix pointers
                            localStorage.setItem('stay100_uid', newUserId);
                            localStorage.setItem('stay100_name', fullName);
                            localStorage.setItem('stay100_phone', phoneNumber);

                            showAuthToast("Profile verified! Welcome to Stay100%.", true);
                            
                            setTimeout(() => {
                                window.location.href = 'index.html';
                            }, 1200);
                        });
                })
                .catch((err) => {
                    console.error("Registration write operation failure: ", err);
                    showAuthToast("Critical storage error. Registration postponed.", false);
                });
        });
    }

    // 4. LOGOUT MECHANISM
    const logoutBtn = document.getElementById('logout-action-trigger');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetUID = localStorage.getItem('stay100_uid');
            
            if (targetUID) {
                localStorage.removeItem(`stay100_plan_${targetUID}`);
                localStorage.removeItem(`stay100_start_${targetUID}`);
            }

            // Purge core stay100 state keys completely
            localStorage.removeItem('stay100_uid');
            localStorage.removeItem('stay100_name');
            localStorage.removeItem('stay100_phone');

            showAuthToast("Session terminated. Reverting entry profile.", true);
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        });
    }
});

// --- HELPER SESSION SECURE HOOKS ---
window.checkActiveAuthSession = function() {
    return !!localStorage.getItem('stay100_uid');
};

window.getAuthenticatedUserMetadata = function() {
    return {
        uid: localStorage.getItem('stay100_uid'),
        name: localStorage.getItem('stay100_name'),
        phone: localStorage.getItem('stay100_phone')
    };
};