// --- CENTRAL ENVIRONMENT FIREBASE CONFIGURATION CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyCfa9vnSViGViHteH0xY3zZgTIl7P22EV8",
    authDomain: "impstaff-93232.firebaseapp.com",
    databaseURL: "https://impstaff-93232-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "impstaff-93232",
    storageBucket: "impstaff-93232.firebasestorage.app",
    messagingSenderId: "384617941707",
    appId: "1:384617941707:web:26a59adb8472371d0ee94e"
};

// Guard initialization loops instantiation context rules to protect duplication crash
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

/**
 * State Management Route Guard Session Monitor System Listener Pipeline
 */
firebase.auth().onAuthStateChanged((userInstance) => {
    if (!userInstance) {
        console.log("No authorization session tokens found. Evicting context down to entry node.");
        // Condition: User logged out -> directly redirect to authorization entry node page
        window.location.href = "vendor-registration.html";
    } else {
        // Identity tracking pipeline setup execution
        fetchVendorRealtimeMetadata(userInstance.uid);
    }
});

/**
 * Main parser module routine downloading objects nodes directly out from Firebase
 */
function fetchVendorRealtimeMetadata(uid) {
    firebase.database().ref(`vendors/${uid}`).once('value')
        .then((snapshot) => {
            const serverSidePayload = snapshot.val();
            
            if (!serverSidePayload) {
                console.warn("No active database record structure matched under current profile entry identification index.");
                return;
            }

            // Target mapping and text insertion engine routines inside the DOM Node parameters
            if (serverSidePayload.profileImage) {
                document.getElementById("vendorDisplayDp").src = serverSidePayload.profileImage;
            } else if (serverSidePayload.contactDetails && serverSidePayload.contactDetails.email) {
                // Generates programmatic fallback avatar based on corporate mail identity parameter tracking rules
                document.getElementById("vendorDisplayDp").src = `https://ui-avatars.com/api/?name=${encodeURIComponent(serverSidePayload.displayName || "Partner")}&background=556b2f&color=fff&bold=true`;
            }
            
            document.getElementById("dashDisplayName").firstChild.textContent = (serverSidePayload.displayName || "Partner Node") + " ";
            document.getElementById("dashUid").innerText = serverSidePayload.uid || uid;
            document.getElementById("dashSegment").innerText = serverSidePayload.vendorSegmentClassification || "Broker/Partner Entity";
            document.getElementById("dashPlan").innerText = serverSidePayload.verificationData?.assignedPlanType || "FREE_TRIAL";
            document.getElementById("dashEmail").innerText = serverSidePayload.contactDetails?.email || "Not Configured";
            document.getElementById("dashPhone").innerText = serverSidePayload.contactDetails?.phone || "Not Linked";
            document.getElementById("dashCity").innerText = serverSidePayload.businessProfile?.baseCity || "Not Provided";
            
            // Safe mapping context data formatting rules parameters
            const panGstString = serverSidePayload.legalKYC?.taxPANIdentification || "Verification Missing";
            document.getElementById("dashKyc").innerText = `Active status Identity: ${panGstString}`;
            
            // Resolving localities mapping arrays tracking checks conditions configurations loop systems arrays
            if (serverSidePayload.businessProfile && serverSidePayload.businessProfile.localitiesCoverage) {
                if (Array.isArray(serverSidePayload.businessProfile.localitiesCoverage)) {
                    document.getElementById("dashLocalities").innerText = serverSidePayload.businessProfile.localitiesCoverage.join(', ');
                } else {
                    document.getElementById("dashLocalities").innerText = serverSidePayload.businessProfile.localitiesCoverage;
                }
            } else {
                document.getElementById("dashLocalities").innerText = "Not Configured";
            }
            
            document.getElementById("dashAddress").innerText = serverSidePayload.businessProfile?.fullPhysicalAddress || "No Physical Coordinates Provided";

            // Conditional Verified status icon activation metrics logic checker engine
            if (serverSidePayload.verificationData && serverSidePayload.verificationData.isVerified) {
                document.getElementById("verifiedBadge").style.display = "inline-block";
            } else {
                document.getElementById("verifiedBadge").style.display = "none";
            }
        })
        .catch((errorLogsDump) => {
            console.error("Critical failure during downloading records pipelines maps values down from RTDB: ", errorLogsDump);
        });
}

/**
 * Purges dynamic local active memory authentication context rules tracker sessions flags
 */
function triggerSignOutSession() {
    firebase.auth().signOut()
        .then(() => {
            console.log("Authorization tracking token revoked successfully.");
            window.location.href = "vendor-registration.html";
        })
        .catch((errLogs) => {
            console.error("Authentication termination pipeline encountered operational tracking logs dump error:", errLogs);
            alert("Error during clearing active connection pipelines: " + errLogs.message);
        });
}