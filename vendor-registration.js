// --- CENTRAL ENVIRONMENT FIREBASE INITIALIZATION ---
const firebaseConfig = {
    apiKey: "AIzaSyCfa9vnSViGViHteH0xY3zZgTIl7P22EV8",
    authDomain: "impstaff-93232.firebaseapp.com",
    databaseURL: "https://impstaff-93232-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "impstaff-93232",
    storageBucket: "impstaff-93232.firebasestorage.app",
    messagingSenderId: "384617941707",
    appId: "1:384617941707:web:26a59adb8472371d0ee94e"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

// Dynamic Internal Memory Buffer to cache data between Step 1 and Step 2
let temporaryRegistrationFormCache = null;

// Global Router Session Guard System
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Checking if the account document is already active in Realtime Database
        firebase.database().ref(`vendors/${user.uid}`).once('value')
            .then((snapshot) => {
                if (snapshot.exists()) {
                    // Scenario A: User is already registered completely -> Skip forms, send straight to dashboard
                    window.location.href = "vendor-profile.html";
                } else if (temporaryRegistrationFormCache) {
                    // Scenario B: User just completed Step 1 and now authenticated Step 2 -> Save structural node record
                    commitVendorDataToCloudDatabase(user);
                } else {
                    // Scenario C: Rogue login with no structural payload -> Force profile data filling
                    alert("No partner node registration details found. Please complete Step 1 first.");
                    firebase.auth().signOut();
                    toggleViewMode('REGISTER');
                }
            });
    }
});

/**
 * Handles Step 1 UI Transitions after validation confirmation mapping routines
 */
function transitionToStep2(event) {
    event.preventDefault();

    // Capture Multiple Checkbox Data Arrays
    const checkboxNodes = document.querySelectorAll('input[name="propDealType"]:checked');
    let dynamicPropertyDealsArray = [];
    checkboxNodes.forEach(node => dynamicPropertyDealsArray.push(node.value));

    if (dynamicPropertyDealsArray.length === 0) {
        alert("Please select at least one Property Type category context you deal in.");
        return;
    }

    // Build temporary registration object schema cache
    temporaryRegistrationFormCache = {
        displayName: document.getElementById("fullName").value.trim(),
        vendorSegmentClassification: document.querySelector('input[name="vendorType"]:checked').value,
        contactDetails: {
            email: document.getElementById("vendorEmail").value.trim(),
            phone: document.getElementById("vendorPhone").value.trim()
        },
        businessProfile: {
            agencyTitle: document.getElementById("companyName").value.trim() || "Individual/Direct",
            baseCity: document.getElementById("operatingCity").value,
            localitiesCoverage: document.getElementById("operatingLocalities").value.trim().split(',').map(item => item.trim()),
            operationalNicheCategories: dynamicPropertyDealsArray,
            fullPhysicalAddress: document.getElementById("businessAddress").value.trim()
        },
        legalKYC: {
            reraRegistrationId: document.getElementById("reraNumber").value.trim() || "NOT_PROVIDED",
            taxPANIdentification: document.getElementById("gstNumber").value.trim()
        }
    };

    // Transition Wizards step nodes UI classes
    document.getElementById("step1Form").classList.remove("active");
    document.getElementById("step2AuthView").classList.add("active");
    document.getElementById("badgeStep1").classList.remove("active");
    document.getElementById("badgeStep2").classList.add("active");
}

/**
 * Master controller method to orchestrate Firebase RTDB saving matrices
 */
function commitVendorDataToCloudDatabase(userAuthInstance) {
    // Inject dynamic verification system structures along with auth metadata logs
    const unifiedPayload = {
        uid: userAuthInstance.uid,
        displayName: temporaryRegistrationFormCache.displayName,
        accountRole: "VENDOR",
        vendorSegmentClassification: temporaryRegistrationFormCache.vendorSegmentClassification,
        contactDetails: {
            ...temporaryRegistrationFormCache.contactDetails,
            authEmailLinked: userAuthInstance.email || "OAuth Linked Access Route"
        },
        businessProfile: temporaryRegistrationFormCache.businessProfile,
        legalKYC: temporaryRegistrationFormCache.legalKYC,
        profileImage: userAuthInstance.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png", // Fallback system dynamic default DP asset URL
        verificationData: {
            isVerified: false,
            assignedPlanType: "FREE_TIER_TRIAL",
            badgeReferenceAsset: "NONE",
            planExpiry: 0
        },
        accountCreationTimestamp: Date.now()
    };

    // Commit directly into Realtime Database instance parameters node mappings
    firebase.database().ref(`vendors/${userAuthInstance.uid}`).set(unifiedPayload)
        .then(() => {
            temporaryRegistrationFormCache = null; // Purge storage buffer memory
            window.location.href = "vendor-profile.html";
        })
        .catch(err => alert("Error syncing data nodes pipeline configurations: " + err.message));
}

// ================= AUTHENTICATION ACTIONS LOGIC =================

function handleGoogleAuthLink() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch(err => alert(err.message));
}

function handleEmailPasswordRegistration() {
    const emailInput = document.getElementById("vendorEmail").value.trim();
    const passInput = document.getElementById("registerPassword").value;

    if (passInput.length < 6) return alert("Password length configuration should exceed 6 elements.");
    
    firebase.auth().createUserWithEmailAndPassword(emailInput, passInput).catch(err => alert(err.message));
}

function handleDirectEmailLogin() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    
    if(!email || !password) return alert("Please complete authentication input fields parameters.");

    firebase.auth().signInWithEmailAndPassword(email, password).catch(err => alert(err.message));
}

/**
 * Master view toggle logic wrapper mapping layouts contexts components
 */
function toggleViewMode(targetMode) {
    if (targetMode === 'LOGIN') {
        document.getElementById("registrationWizardView").style.display = "none";
        document.getElementById("directLoginView").style.display = "block";
        document.getElementById("stepIndicatorContainer").style.display = "none";
        document.getElementById("main-panel-title").innerText = "Vendor Terminal Access";
    } else {
        document.getElementById("registrationWizardView").style.display = "block";
        document.getElementById("directLoginView").style.display = "none";
        document.getElementById("stepIndicatorContainer").style.display = "flex";
        document.getElementById("main-panel-title").innerText = "Stay100% Partner Network";
        
        // Reset steps parameters alignment context mapping routine rules loops
        document.getElementById("step1Form").classList.add("active");
        document.getElementById("step2AuthView").classList.remove("active");
        document.getElementById("badgeStep1").classList.add("active");
        document.getElementById("badgeStep2").classList.remove("active");
    }
}