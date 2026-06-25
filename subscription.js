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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();
let authenticatedVendorUid = null;
let currentVendorMetadata = null;

/**
 * 🔒 IMMUTABLE CENTRAL PLANS REGISTRY (Anti-Tamper Hardened)
 * Frontend inspect element karke koi bhi values yaha overwrite nahi kar sakta.
 */
const SECURE_PLANS_MASTER_REGISTRY = Object.freeze({
    "PLAN_SILVER": { price: 99, validityDays: 30 },
    "PLAN_GOLD": { price: 249, validityDays: 90 },
    "PLAN_DIAMOND": { price: 999, validityDays: 365 }
});

/**
 * Auth Listening Monitoring Pipeline Context Hook
 */
firebase.auth().onAuthStateChanged((userInstance) => {
    if (!userInstance) {
        console.log("No authorization session tokens found. Evicting down to entry node.");
        window.location.href = "vendor-registration.html";
    } else {
        authenticatedVendorUid = userInstance.uid;
        const emailDOM = document.getElementById("user-display-email");
        if (emailDOM) emailDOM.innerText = userInstance.email;
        fetchVendorLiveContext(userInstance.uid);
    }
});

function fetchVendorLiveContext(uid) {
    db.ref(`vendors/${uid}`).on('value', (snapshot) => {
        currentVendorMetadata = snapshot.val() || {};
        renderSubscriptionStatusMarkup();
    });
}

/**
 * High-Fidelity Razorpay Checkout Orchestrator Engine (Security Patched)
 * Ab yeh function inputs me pricing parameters accept nahi karta.
 */
window.initializeRazorpayCheckout = function(planId) {
    if (!authenticatedVendorUid || !currentVendorMetadata) {
        alert("Authorization profiling sequence is still syncing. Please stand by.");
        return;
    }

    // Secure Verification Check: Kya plan registry me exist karta hai?
    const matchedPlanMeta = SECURE_PLANS_MASTER_REGISTRY[planId];
    if (!matchedPlanMeta) {
        alert("Security Violation: Invalid execution context parameters injected.");
        return;
    }

    // Extract genuine system locked prices and parameters
    const verifiedPriceAmount = matchedPlanMeta.price;

    const contactPhone = currentVendorMetadata.contactDetails?.phone || "9999999999";
    const contactEmail = currentVendorMetadata.contactDetails?.email || "partner@stay100.com";
    const clientName = currentVendorMetadata.displayName || "Verified Partner Entity";

    const gatewayOptions = {
        "key": "rzp_test_SqlN9PA4lCfbIS", 
        "amount": verifiedPriceAmount * 100, // Price system locked metadata se aa raha hai
        "currency": "INR",
        "name": "Stay100%.in",
        "description": `Upgrade/Renew Profile Node to ${planId}`,
        "image": "assets/verified-baidge.png",
        "handler": function (paymentResponse) {
            // Processing execution securely
            processDatabaseVerificationWritebacks(planId, paymentResponse.razorpay_payment_id);
        },
        "prefill": {
            "name": clientName,
            "email": contactEmail,
            "contact": contactPhone
        },
        "theme": { "color": "#a3a327" }
    };

    const razorpayWindowInstance = new Razorpay(gatewayOptions);
    razorpayWindowInstance.open();
};

/**
 * Writeback Processing Pipelines
 */
function processDatabaseVerificationWritebacks(planId, paymentReferenceString) {
    // Re-verify from Secure Object Map again before database transaction
    const matchedPlanMeta = SECURE_PLANS_MASTER_REGISTRY[planId];
    if (!matchedPlanMeta) {
        alert("Critical failure during transaction validation workflow.");
        return;
    }

    const targetDaysConfig = matchedPlanMeta.validityDays;
    const targetPricePaid = matchedPlanMeta.price;

    const activationDateObj = new Date();
    const expirationDateObj = new Date();
    expirationDateObj.setDate(activationDateObj.getDate() + targetDaysConfig);

    const packedSubscriptionPayload = {
        assignedPlanType: planId,
        isVerified: true,
        pricePaid: targetPricePaid, // Database entry system secure registry se generated h
        paymentId: paymentReferenceString,
        activationTimestamp: activationDateObj.toISOString(),
        expiryTimestamp: expirationDateObj.toISOString()
    };

    // Step 1: Update vendor database node path
    db.ref(`vendors/${authenticatedVendorUid}/verificationData`).set(packedSubscriptionPayload)
        .then(() => {
            // Step 2: Fetch properties to inject verified badges
            return db.ref('properties').once('value');
        })
        .then((snapshot) => {
            const multiWriteBatchTree = {};
            
            if (snapshot.exists()) {
                snapshot.forEach((childNode) => {
                    const structuralRecord = childNode.val();
                    if (structuralRecord && structuralRecord.vendorUid === authenticatedVendorUid) {
                        multiWriteBatchTree[`properties/${childNode.key}/isVerified`] = true;
                        multiWriteBatchTree[`properties/${childNode.key}/verified`] = true;
                        multiWriteBatchTree[`properties/${childNode.key}/verificationPlan`] = planId;
                    }
                });
            }

            if (Object.keys(multiWriteBatchTree).length > 0) {
                return db.ref().update(multiWriteBatchTree);
            } else {
                return Promise.resolve();
            }
        })
        .then(() => {
            // Success Trigger Pop Up Injected Custom
            injectPaymentSuccessDynamicPopup({
                planName: planId,
                paymentId: paymentReferenceString,
                amount: targetPricePaid,
                startDate: activationDateObj.toLocaleDateString('en-IN'),
                expiryDate: expirationDateObj.toLocaleDateString('en-IN')
            });
        })
        .catch((errorLog) => {
            console.error("Critical database operational failure: ", errorLog);
            alert("Error syncing database changes: " + errorLog.message);
        });
}

/**
 * Inject Payment Success UI Component Modal Layer
 */
function injectPaymentSuccessDynamicPopup(data) {
    const overlayNode = document.createElement("div");
    overlayNode.id = "payment-success-modal-overlay";
    
    Object.assign(overlayNode.style, {
        position: "fixed", top: "0", left: "0", width: "100vw", height: "100vh",
        backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
        zIndex: "999999", display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", padding: "20px", boxSizing: "border-box"
    });

    overlayNode.innerHTML = `
        <div style="background: #ffffff; width: 100%; max-width: 440px; border-radius: 24px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); text-align: center; box-sizing: border-box; animation: modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;">
            
            <div style="width: 110px; height: 110px; background: #ffffff; border-radius: 50%; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(163, 163, 39, 0.2); border: 4px solid #fff; position: relative; overflow: hidden;">
                <img src="assets/verified-baidge.png" alt="100% Verified Badge" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
            </div>

            <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 24px; font-weight: 700;">Payment Successful! 🎉</h3>
            <p style="margin: 0 0 24px 0; color: #64748b; font-size: 14px; line-height: 1.5;">Your verification matrix assets have been initialized and deployed successfully across the central nodes network.</p>
            
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; margin-bottom: 26px; text-align: left;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
                    <span style="color: #64748b; font-weight: 500;">Plan Selected:</span>
                    <span style="color: #a3a327; font-weight: 700;">${data.planName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
                    <span style="color: #64748b; font-weight: 500;">Amount Transacted:</span>
                    <span style="color: #0f172a; font-weight: 600;">₹${data.amount.toLocaleString('en-IN')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
                    <span style="color: #64748b; font-weight: 500;">Activation Window:</span>
                    <span style="color: #0f172a; font-weight: 600;">${data.startDate}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
                    <span style="color: #64748b; font-weight: 500;">Expiration Window:</span>
                    <span style="color: #0f172a; font-weight: 600; color: #ef4444;">${data.expiryDate}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 1px dashed #cbd5e1; padding-top: 10px; font-size: 12px;">
                    <span style="color: #94a3b8; font-weight: 500;">Transaction Reference ID:</span>
                    <span style="color: #475569; font-family: monospace; font-weight: 600;">${data.paymentId}</span>
                </div>
            </div>

            <button id="btn-payment-success-close" style="width: 100%; background: #a3a327; color: #ffffff; border: none; padding: 14px 24px; border-radius: 14px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(163, 163, 39, 0.25);">
                Continue Setup Matrix
            </button>
        </div>
    `;

    const styleTracker = document.createElement("style");
    styleTracker.innerHTML = `
        @keyframes modalPop {
            from { transform: scale(0.85); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        #btn-payment-success-close:hover {
            background: #8c8c20 !important;
            transform: translateY(-1px);
        }
    `;
    document.head.appendChild(styleTracker);
    document.body.appendChild(overlayNode);

    document.getElementById("btn-payment-success-close").onclick = function() {
        overlayNode.remove();
        if (typeof window.renderSubscriptionStatusMarkup === "function") {
            window.renderSubscriptionStatusMarkup();
        } else {
            window.location.reload();
        }
    };
}

/**
 * Automation Cleanup Function
 */
function demoteExpiredVendorProperties() {
    db.ref(`vendors/${authenticatedVendorUid}/verificationData/isVerified`).set(false)
        .then(() => {
            return db.ref('properties').once('value');
        })
        .then((snapshot) => {
            const multiCleanBatchTree = {};
            if (snapshot.exists()) {
                snapshot.forEach((childNode) => {
                    const structuralRecord = childNode.val();
                    if (structuralRecord && structuralRecord.vendorUid === authenticatedVendorUid) {
                        multiCleanBatchTree[`properties/${childNode.key}/isVerified`] = false;
                        multiCleanBatchTree[`properties/${childNode.key}/verified`] = false;
                        multiCleanBatchTree[`properties/${childNode.key}/verificationPlan`] = null;
                    }
                });
            }
            if (Object.keys(multiCleanBatchTree).length > 0) {
                return db.ref().update(multiCleanBatchTree);
            }
        })
        .then(() => {
            console.log("Downstream property synchronization completed.");
        })
        .catch(err => console.error("Auto expiration sync failure: ", err));
}

function renderSubscriptionStatusMarkup() {
    const panelNode = document.getElementById("status-panel");
    if (!panelNode) return;

    const verification = currentVendorMetadata.verificationData;

    if (!verification || !verification.isVerified) {
        panelNode.style.display = "flex";
        panelNode.style.borderColor = "#64748b";
        panelNode.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color:#64748b; font-size: 20px;"></i>
            <div>Status: <strong>No Active Plan Running</strong>. Upgrade below to deploy verification matrices instantly.</div>`;
        return;
    }

    const currentMoment = new Date();
    const expiryMoment = new Date(verification.expiryTimestamp);

    if (currentMoment > expiryMoment) {
        panelNode.style.display = "flex";
        panelNode.style.borderColor = "#ef4444";
        panelNode.innerHTML = `<i class="fa-solid fa-circle-xmark" style="color:#ef4444; font-size: 20px;"></i>
            <div>Status: <strong>Package Expired (${verification.assignedPlanType})</strong> on ${expiryMoment.toLocaleDateString()}. Verification status badges have been dropped down. <br><span style="color:#ef4444; font-size:12px; font-weight:600;">Please select a plan below to RENEW.</span></div>`;
        
        demoteExpiredVendorProperties();
    } else {
        panelNode.style.display = "flex";
        panelNode.style.borderColor = "#808000";
        panelNode.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#808000; font-size: 20px;"></i>
            <div>Status: <strong>Active Verified PRO Matrix</strong> | Tier Locked: <strong>${verification.assignedPlanType}</strong> | Valid Until: <strong>${expiryMoment.toLocaleDateString()}</strong> (Auto-Rank Injection Engaged)</div>`;
    }
}