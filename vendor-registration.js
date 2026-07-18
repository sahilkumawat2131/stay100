// --- CENTRAL ENVIRONMENT FIREBASE INITIALIZATION ---
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

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

// Dynamic Local Memory Buffer to cache step states
let temporaryRegistrationFormCache = null;

// Global Router Session Guard System
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Checking if the account document is already active in Realtime Database
        firebase.database().ref(`vendors/${user.uid}`).once('value')
            .then((snapshot) => {
                if (snapshot.exists()) {
                    // Scenario A: Already registered completely -> Skip forms, send straight to profile dashboard
                    window.location.href = "vendor-profile.html";
                } else if (temporaryRegistrationFormCache) {
                    // Scenario B: User just completed Step 1 and now authenticated Step 2 -> Save structural node record
                    commitVendorDataToCloudDatabase(user);
                } else {
                    // Scenario C: Rogue login attempt with no cached registration data -> Force registration view
                    alert("No partner data matched. Please complete Step 1 registration first.");
                    firebase.auth().signOut();
                    toggleViewMode('REGISTER');
                }
            });
    }
});

/**
 * Handles Step 1 Transitions after strict validation and T&C authorization check
 */
function transitionToStep2(event) {
    event.preventDefault();

    // Checkbox Validation Check (Axis-Style Gate)
    const tclCheck = document.getElementById("step1TermsCheck");
    if (!tclCheck || !tclCheck.checked) {
        alert("Please accept the Terms & Conditions declaration to continue authorization registration.");
        return;
    }

    // Capture Multiple Checkbox Data Arrays
    const checkboxNodes = document.querySelectorAll('input[name="propDealType"]:checked');
    let dynamicPropertyDealsArray = [];
    checkboxNodes.forEach(node => dynamicPropertyDealsArray.push(node.value));

    if (dynamicPropertyDealsArray.length === 0) {
        alert("Please select at least one Property Type category context you deal in.");
        return;
    }

    // Build cached payload map array structure
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

    // Transition wizard element views 
    document.getElementById("step1Form").classList.remove("active");
    document.getElementById("step2AuthView").classList.add("active");
    document.getElementById("badgeStep1").classList.remove("active");
    document.getElementById("badgeStep2").classList.add("active");
    
    // Smooth scroll inside form panel component for desktop tracking engine
    const formPanel = document.querySelector('.main-form-panel');
    if(formPanel) formPanel.scrollTop = 0;
}

/**
 * Syncs structural payloads to cloud database parameters
 */
function commitVendorDataToCloudDatabase(userAuthInstance) {
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
        profileImage: userAuthInstance.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png", 
        verificationData: {
            isVerified: false,
            assignedPlanType: "FREE_TIER_TRIAL",
            badgeReferenceAsset: "NONE",
            planExpiry: 0
        },
        accountCreationTimestamp: Date.now()
    };

    // Commit cleanly to Realtime Database
    firebase.database().ref(`vendors/${userAuthInstance.uid}`).set(unifiedPayload)
        .then(() => {
            temporaryRegistrationFormCache = null; // Clear local instance cache
            window.location.href = "vendor-profile.html";
        })
        .catch(err => alert("Error syncing data nodes pipeline: " + err.message));
}

// ================= AUTHENTICATION ACTIONS LOGIC =================

function handleGoogleAuthLink() {
    // If user is inside Step 2, run a programmatic check on the secondary Axis T&C checkbox
    const step2Visible = document.getElementById("step2AuthView").classList.contains("active");
    if (step2Visible) {
        const sc2 = document.getElementById("step2TermsCheck");
        if(!sc2 || !sc2.checked) {
            alert("Please acknowledge the Platform User Agreement checkbox before authenticating.");
            return;
        }
    }

    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch(err => alert(err.message));
}

function handleEmailPasswordRegistration() {
    const emailInput = document.getElementById("vendorEmail").value.trim();
    const passInput = document.getElementById("registerPassword").value;
    const sc2 = document.getElementById("step2TermsCheck");

    if(!sc2 || !sc2.checked) {
        alert("Please check and accept the Platform User Agreement to create an account.");
        return;
    }

    if (passInput.length < 6) {
        alert("Password length configuration should exceed 6 elements.");
        return;
    }
    
    firebase.auth().createUserWithEmailAndPassword(emailInput, passInput).catch(err => alert(err.message));
}

function handleDirectEmailLogin() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    
    if(!email || !password) {
        alert("Please complete authentication input fields parameters.");
        return;
    }

    firebase.auth().signInWithEmailAndPassword(email, password).catch(err => alert(err.message));
}

/**
 * Toggles interface presentation profiles dynamically
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
        
        // Reset steps back to step 1 cleanly
        document.getElementById("step1Form").classList.add("active");
        document.getElementById("step2AuthView").classList.remove("active");
        document.getElementById("badgeStep1").classList.add("active");
        document.getElementById("badgeStep2").classList.remove("active");
    }
}