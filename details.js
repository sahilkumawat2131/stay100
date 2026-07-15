/**
 * STAY100% (Formerly StayPremium) - Independent Property & Room Details Logic Controller Engine
 * Upgraded Version - Enhanced Property Fields, Premium Unified Verified Badge & Upgraded Facility Matrix
 * Extended with Inline Auto-Play Property Video Node Support inside Carousel Track before Image Sequences.
 * Bug Fix: Stabilized Amenities Grid Show More / Center Modal Popup View Toggling System.
 * Advanced Features: 99Acres Premium Layout Matrix Mapping, Complex Address Blocks & Automated Search String SEO Mask.
 * FIX: Redirection link corrected in Horizontal Recommendation Card to fix broken clicks.
 */

// --- 1. FIREBASE INITIALIZATION MATRIX ---
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

// Global Dynamic Variables Stack State
let activePropertySlugId = "";
let targetPropertyObject = null;
let activeSliderPositionIndex = 0;
let chosenFormInputStarRatingValue = 0;
let completePropertiesPoolSnapshot = [];
let detectedTargetNodeBranch = "properties"; 
let currentActiveLiveRef = null;
let globalGeneratedFacilitiesArray = [];
let globalVerifiedVendorsMap = {}; // Tracks vendor verification statuses globally for cards
let isAmenitiesExpandedState = false; // Tracks explicit local toggle state for show more logic

// On DOM Core System Initialized
document.addEventListener('DOMContentLoaded', () => {
    // Execution of Pure Clean URL Rewrite Execution Sequence to mask details.html parameters
    enforceCleanSeoRoutingStructure();

    if (window.LayoutEngine) {
        window.customPageContextSet = true;
        window.LayoutEngine.init("pg");
    }

    injectResponsiveAndBadgeStyles();

    const urlQueryReader = new URLSearchParams(window.location.search);
    activePropertySlugId = urlQueryReader.get('id');
    
    if (activePropertySlugId) {
        registerRecentPropertyFootprint(activePropertySlugId);
        resolveDynamicNodeBranchAndFetch(activePropertySlugId);
    } else {
        console.error("No Property ID configuration found in dynamic routing URL parameters.");
        loadLocalMockPropertyDataPackage();
    }
    bindInteractiveUIElements();
    updateSaveButtonUI(); 
});

/**
 * SEO Engine URL Router Mask Optimization Rule
 * Converts raw dirty routing configurations like 'details.html?id=xyz' into search optimized structures locally.
 */
function enforceCleanSeoRoutingStructure() {
    const currentPath = window.location.pathname;
    if (currentPath.endsWith('.html')) {
        const structuralCleanPath = currentPath.replace('.html', '');
        // Rewrite location history without firing hard reload browser loops
        window.history.replaceState(null, '', structuralCleanPath + window.location.search);
    }
}

// Layout alignments aur premium badge visual animations head me inject karne ke liye function
function injectResponsiveAndBadgeStyles() {
    if (document.getElementById('staypremium-details-upgraded-styles')) return;
    
    const styleNode = document.createElement("style");
    styleNode.id = 'staypremium-details-upgraded-styles';
    styleNode.innerHTML = `
        /* Premium Badge Holding Core Box */
        .premium-verified-container {
            position: relative;
            display: inline-block;
            vertical-align: middle;
            margin-left: 6px;
            width: 18px;
            height: 18px; 
            border-radius: 50%;
            overflow: hidden;
            transform: translateY(-2px);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        }

        /* Clear Rendering Engine for Badge Vector */
        .premium-verified-badge {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }

        /* 3D Realistic Sunlight Sweep Element */
        .sunlight-reflection-sweep {
            position: absolute;
            top: -50%;
            left: -150%;
            width: 50%;
            height: 200%;
            background: linear-gradient(
                90deg, 
                rgba(255, 255, 255, 0) 0%, 
                rgba(255, 255, 255, 0.45) 30%, 
                rgba(255, 255, 255, 0.75) 50%, 
                rgba(255, 255, 255, 0.45) 70%, 
                rgba(255, 255, 255, 0) 100%
            );
            transform: rotate(25deg);
            animation: professionalGlint 4s infinite ease-in-out;
        }

        @keyframes professionalGlint {
            0% { left: -150%; }
            18% { left: 150%; }
            100% { left: 150%; }
        }

        /* Facility Item Animation and Smooth Injections */
        .facility-item-node {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #f8fafc;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #f1f5f9;
            transition: all 0.25s ease;
        }
        .facility-item-node:hover {
            background: #f1f5f9;
            transform: translateY(-1px);
        }

        /* Contact Options Wrapper & Action Buttons */
        .action-communication-wrap {
            display: flex;
            gap: 12px;
            margin-top: 15px;
            width: 100%;
        }

        .btn-comm-call {
            flex: 1;
            background: #4f46e5;
            color: #ffffff;
            font-weight: 700;
            padding: 12px 20px;
            border-radius: 8px;
            border: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s ease;
            box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1);
        }
        .btn-comm-call:hover {
            background: #4338ca;
        }

        .btn-comm-whatsapp {
            flex: 1;
            background: #25d366;
            color: #ffffff;
            font-weight: 700;
            padding: 12px 20px;
            border-radius: 8px;
            border: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s ease;
            box-shadow: 0 4px 6px -1px rgba(37, 211, 102, 0.1);
        }
        .btn-comm-whatsapp:hover {
            background: #20ba5a;
        }

        /* Responsive Overrides for Call and WhatsApp Button Mobile Overlay Layout */
        @media (max-width: 768px) {
            .action-communication-wrap {
                position: fixed !important;
                bottom: 16px !important;
                right: 16px !important;
                left: 16px !important;
                z-index: 99999 !important;
                width: auto !important;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(8px);
                padding: 10px;
                border-radius: 16px;
                box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.1), 0 10px 25px rgba(0, 0, 0, 0.05) !important;
                margin-top: 0 !important;
            }
            .btn-comm-call, .btn-comm-whatsapp {
                padding: 14px 16px !important;
                border-radius: 10px !important;
                font-size: 15px !important;
            }
            body {
                padding-bottom: 100px !important;
            }
        }
    `;
    document.head.appendChild(styleNode);
}

// --- 2. MULTI-NODE DYNAMIC AUTO SCANNER ENGINE ---
const resolveDynamicNodeBranchAndFetch = (targetId) => {
    db.ref(`properties/${targetId}`).once('value')
        .then((snapshot) => {
            if (snapshot.exists()) {
                detectedTargetNodeBranch = "properties";
                attachLiveSynchronizedDataStream("properties", targetId);
            } else {
                detectedTargetNodeBranch = "rooms";
                attachLiveSynchronizedDataStream("rooms", targetId);
            }
        })
        .catch(err => {
            console.error("Branch resolution failed, falling back to properties:", err);
            attachLiveSynchronizedDataStream("properties", targetId);
        });
};

const attachLiveSynchronizedDataStream = (branchPath, targetId) => {
    if (currentActiveLiveRef) {
        currentActiveLiveRef.off();
    }

    currentActiveLiveRef = db.ref(`${branchPath}/${targetId}`);
    currentActiveLiveRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            if (branchPath === "properties") {
                attachLiveSynchronizedDataStream("room", targetId);
            } else {
                loadLocalMockPropertyDataPackage();
            }
            return;
        }
        targetPropertyObject = data;
        verifyVendorSubscriptionAndRender();
    });
};

const fetchAllPropertiesSnapshotEngine = () => {
    db.ref(detectedTargetNodeBranch).once('value', (snapshot) => {
        const globalData = snapshot.val();
        if (globalData) {
            completePropertiesPoolSnapshot = Object.keys(globalData).map(key => ({ id: key, ...globalData[key] }));
            
            // Map unique vendor IDs to fetch verification info for cards
            const vendorFetchPromises = completePropertiesPoolSnapshot.map(prop => {
                const vendorUid = prop.uid || prop.userId || null;
                const directVerified = prop.isVerified === true || prop.isVerified === "true" || prop.verified === true || prop.verified === "true" || prop.isVendorVerified === true;
                
                if (vendorUid && !globalVerifiedVendorsMap[vendorUid]) {
                    return db.ref(`vendors/${vendorUid}/verificationData`).once('value').then(vSnap => {
                        const vData = vSnap.val();
                        globalVerifiedVendorsMap[vendorUid] = directVerified || (vData && vData.isVerified === true);
                    });
                } else if (vendorUid) {
                    if (directVerified) globalVerifiedVendorsMap[vendorUid] = true;
                }
                return Promise.resolve();
            });

            Promise.all(vendorFetchPromises).then(() => {
                renderSimilarPropertiesEngine();
                renderRecentlyViewedPropertiesEngine();
            });
        }
    });
};

// --- SUBSCRIPTION CHECK FOR VERIFIED BADGE LINKAGE ---
const verifyVendorSubscriptionAndRender = () => {
    const directVerified = targetPropertyObject.isVerified === true || targetPropertyObject.isVerified === "true" || targetPropertyObject.verified === true || targetPropertyObject.verified === "true" || targetPropertyObject.isVendorVerified === true;
    const vendorUid = targetPropertyObject.uid || targetPropertyObject.userId || null;
    
    if (directVerified) {
        renderPropertyDataToDOMViewGrid(true);
        fetchAllPropertiesSnapshotEngine();
    } else if (vendorUid) {
        db.ref(`vendors/${vendorUid}/verificationData`).once('value', (snapshot) => {
            const verification = snapshot.val();
            const isVerified = verification && verification.isVerified === true;
            renderPropertyDataToDOMViewGrid(isVerified);
            fetchAllPropertiesSnapshotEngine();
        });
    } else {
        renderPropertyDataToDOMViewGrid(false);
        fetchAllPropertiesSnapshotEngine();
    }
};

// --- Helper for Verified Badge Image Template Layout ---
const getVerifiedBadgeMarkup = (isVerified) => {
    if (!isVerified) return "";
    return `
        <span class="premium-verified-container" title="Stay100% Certified Property Listing">
            <img src="assets/verified-baidge.png" alt="Stay100% Verified" class="premium-verified-badge">
            <span class="sunlight-reflection-sweep"></span>
        </span>`;
};

// --- 3. DOM RENDERING INJECTION ENGINE ---
const renderPropertyDataToDOMViewGrid = (isVerified = false) => {
    if (!targetPropertyObject) return;

    const propertyTitle = targetPropertyObject.name || targetPropertyObject.title || "Premium Co-Living Space";
    const baseOriginalPrice = targetPropertyObject.mrp || targetPropertyObject.originalPrice || targetPropertyObject.price || 0;
    const baseCurrentPrice = targetPropertyObject.price || targetPropertyObject.currentPrice || 0;
    
    // Core SEO parameters tracking extracted safely from system properties
    const locCity = targetPropertyObject.city || "Jaipur";
    const locArea = targetPropertyObject.area || targetPropertyObject.localArea || "Mansarovar";
    const targetGender = targetPropertyObject.genderType || "Boys";
    const parsedShortPrice = Math.round(baseCurrentPrice / 1000);

    // DYNAMIC INJECTION RULE: Google Optimization indexing syntax structure mapping rules
    const targetSeoTitle = `65+ PGs for ${targetGender} in ${locArea} ${locCity} under ${parsedShortPrice}k | STAY100%`;
    document.title = targetSeoTitle;
    
    // Update structural header metadata targets globally for crawling bots
    const headDescription = document.querySelector('meta[name="description"]');
    if (headDescription) {
        headDescription.setAttribute("content", `Find verified flat listings. Best PGs for ${targetGender} in ${locArea} ${locCity} under ${baseCurrentPrice}/mo. Equipped with high speed Wi-Fi, Food, AC & Power Backup.`);
    }

    const updateText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };

    const titleLabel = document.getElementById('lbl-title');
    if (titleLabel) {
        titleLabel.innerHTML = `<span>${propertyTitle}</span> ${getVerifiedBadgeMarkup(isVerified)}`;
    }

    // Dynamic Address Binding Logic Blocks
    // 1. Full Address Text Configuration
    const cleanFullAddressText = targetPropertyObject.address || `${targetPropertyObject.landmark || 'Near Metro Station'}, ${locArea}, ${locCity}, Rajasthan`;

    // 2. Google Maps Search Redirect URL Compilation
    const googleMapsNavUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanFullAddressText)}`;

    // 3. Address layout element configuration with direction route injection
    const fullAddressWithDirectionHTML = `
        <span style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: color 0.2s;" 
              onclick="window.open('${googleMapsNavUrl}', '_blank', 'noopener,noreferrer');"
              onmouseenter="this.querySelector('i').style.opacity='0.8'" 
              onmouseleave="this.querySelector('i').style.opacity='1'">
            <span>${cleanFullAddressText}</span>
            <i class="fa-solid fa-diamond-turn-right" style="color: #808000; font-size: 14px;" title="Get Directions"></i>
        </span>
    `;

    // 4. Update address nodes inside active layouts
    updateText('lbl-location', `${locArea}, ${locCity}`);

    const addressElement = document.getElementById('lbl-full-address');
    if (addressElement) {
        addressElement.innerHTML = fullAddressWithDirectionHTML;
    } else {
        updateText('lbl-full-address', cleanFullAddressText);
    }
    updateText('lbl-orig-price', baseOriginalPrice ? `₹${baseOriginalPrice.toLocaleString('en-IN')}` : '');
    updateText('lbl-curr-price', `₹${baseCurrentPrice.toLocaleString('en-IN')}/mo`);
    updateText('lbl-description', targetPropertyObject.description || "Premium architectural living setup spaces.");
    updateText('lbl-owner-name', targetPropertyObject.ownerName || "Management Desk Support");
    
    updateText('lbl-deposit-details', targetPropertyObject.deposit ? `₹${targetPropertyObject.deposit.toLocaleString('en-IN')}` : 'Contact Vendor');
    updateText('lbl-available-for', targetPropertyObject.genderType || targetPropertyObject.suitableForGender || targetPropertyObject.availableFor || "Boys / Girls / Both");
    updateText('lbl-available-from', targetPropertyObject.availableFrom || "Immediate");
    updateText('lbl-posted-by-on', `Posted by ${targetPropertyObject.postedBy || 'Owner'} on ${targetPropertyObject.postedDate || 'May 30, 2026'}`);
    
    updateText('lbl-config-rooms', targetPropertyObject.roomsCount || targetPropertyObject.roomConfig || "1 Room");
    updateText('lbl-config-bathrooms', targetPropertyObject.bathroomsCount || targetPropertyObject.bathroomConfig || "1 Bathroom");
    updateText('lbl-config-balconies', targetPropertyObject.balconiesCount || targetPropertyObject.balconyConfig || "2 Balconies");
    
    updateText('lbl-house-rules', targetPropertyObject.houseRules || "Standard disciplined premises norms apply.");
    updateText('lbl-about-property', targetPropertyObject.aboutProperty || targetPropertyObject.description || "No metadata provided.");
    
    updateText('lbl-spec-property-type', targetPropertyObject.propertyTypeMeta || targetPropertyObject.propertyType || "Studio Apartment");
    updateText('lbl-spec-balconies', targetPropertyObject.balconiesCount || targetPropertyObject.balconyCount || "2");
    updateText('lbl-spec-floor-number', targetPropertyObject.floorNumber || "1st of 4 Floors");
    updateText('lbl-spec-flooring', targetPropertyObject.flooring || targetPropertyObject.flooringType || "Ceramic");
    updateText('lbl-spec-suitable-for', targetPropertyObject.suitableFor || "Working Professionals, Students");
    
    updateText('lbl-spec-parking', targetPropertyObject.parking || targetPropertyObject.parkingSpace || "1 Open");
    updateText('lbl-spec-contract', targetPropertyObject.minimumContract || targetPropertyObject.contractDuration || "6 Months");
    updateText('lbl-spec-early-leaving', targetPropertyObject.earlyLeavingCharges || "1 month(s) of rent");
    updateText('lbl-spec-attached-bathroom', targetPropertyObject.attachedBathroom || "Yes");
    updateText('lbl-spec-attached-balcony', targetPropertyObject.attachedBalcony || "No");
    updateText('lbl-spec-power-backup', targetPropertyObject.powerBackup || "None");
    updateText('lbl-spec-property-age', targetPropertyObject.propertyAge || "1 to 5 Year Old");

    // Dynamic Extra Parameters for 99Acres Feel
    if (targetPropertyObject.noticePeriod) updateText('lbl-spec-notice-period', targetPropertyObject.noticePeriod);
    if (targetPropertyObject.gateClosingTime) updateText('lbl-spec-gate-time', targetPropertyObject.gateClosingTime);
    if (targetPropertyObject.electricityPolicy) updateText('lbl-spec-electricity-rules', targetPropertyObject.electricityPolicy);
    if (targetPropertyObject.mealsConfig) updateText('lbl-spec-meal-type', targetPropertyObject.mealsConfig);

    // Google Maps Iframe Injector Logic Block
    const mapWrapper = document.getElementById('map-iframe-wrapper');
    const mapContainerBox = document.getElementById('map-visualization-box');
    if (mapWrapper && mapContainerBox && targetPropertyObject.googleMapsEmbedUrl) {
        mapWrapper.innerHTML = `<iframe src="${targetPropertyObject.googleMapsEmbedUrl}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
        mapContainerBox.style.display = "block";
    }

    // --- RESTRUCTURED CONTACT BUTTON LAYOUT MATRIX ---
    // Target action container box dynamically or restructure previous call element setup
    let phoneBtn = document.getElementById('btn-owner-phone');
    if (phoneBtn) {
        let commWrap = document.getElementById('comm-action-group-wrapper');
        if (!commWrap) {
            commWrap = document.createElement('div');
            commWrap.id = 'comm-action-group-wrapper';
            commWrap.className = 'action-communication-wrap';
            phoneBtn.parentNode.insertBefore(commWrap, phoneBtn);
        }
        
        // Assemble highly clean authenticated, responsive Call and WhatsApp elements 
        commWrap.innerHTML = `
            <a href="javascript:void(0);" onclick="triggerSecureCall()" class="btn-comm-call" id="btn-owner-phone">
                <i class="fa-solid fa-phone"></i> Call Vendor
            </a>
            <a href="javascript:void(0);" onclick="triggerSecureWhatsApp()" class="btn-comm-whatsapp" id="btn-owner-whatsapp">
                <i class="fa-brands fa-whatsapp" style="font-size:18px;"></i> WhatsApp
            </a>
        `;
        // Safely remove redundant legacy isolated button if detached
        if (phoneBtn.parentNode && phoneBtn.parentNode !== commWrap) {
            phoneBtn.remove();
        }
    }
    
    const savingsAmt = baseOriginalPrice - baseCurrentPrice;
    const offerBadge = document.getElementById('lbl-offer-text');
    if (offerBadge) {
        if (savingsAmt > 0) {
            offerBadge.innerHTML = `<i class="fa-solid fa-gift"></i> Absolute Instant Deal! You save flat ₹${savingsAmt.toLocaleString('en-IN')} on monthly slot lock-ins!`;
            offerBadge.style.display = "block";
        } else {
            offerBadge.style.display = "none";
        }
    }

    // --- IMAGES & VIDEO CAROUSEL RENDER PIPELINE ---
    const track = document.getElementById('image-slider-track');
    if (track) {
        let slidesHTMLArray = [];
        
        // 1. First inject autoplaying visual video feeds if hosted online
        if (targetPropertyObject.videoUrl && targetPropertyObject.videoUrl.trim() !== "") {
            slidesHTMLArray.push(`
                <div class="slide-unit" style="min-width:100%; width:100%; flex-shrink:0; position:relative; background:#000; display:flex; align-items:center; justify-content:center; height:56.25vw; max-height:500px; min-height:250px; overflow:hidden;">
                    <video src="${targetPropertyObject.videoUrl}" autoplay muted loop playsinline preload="auto" style="width:100%; height:100%; object-fit:contain; position:relative; z-index:2; display:block;"></video>
                    <div style="position:absolute; top:12px; left:12px; z-index:3; background:rgba(15,23,42,0.75); color:#fff; font-size:11px; padding:4px 8px; border-radius:4px; font-weight:700; display:flex; align-items:center; gap:5px;">
                        <i class="fa-solid fa-video" style="color:#ef4444;"></i> PROPERTY VIDEO
                    </div>
                </div>
            `);
        }

        // 2. Process sequential property photography assets
        let imagesList = [];
        if (targetPropertyObject.allImages) {
            imagesList = Array.isArray(targetPropertyObject.allImages) 
                ? targetPropertyObject.allImages 
                : Object.values(targetPropertyObject.allImages);
        } else if (targetPropertyObject.image || targetPropertyObject.imageUrl) {
            imagesList = [targetPropertyObject.image || targetPropertyObject.imageUrl];
        } else {
            imagesList = ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'];
        }

        imagesList = imagesList.filter(src => src && typeof src === 'string' && src.trim() !== "");

        imagesList.forEach(src => {
            let optimizedSrc = src;
            if (src.includes('unsplash.com')) {
                optimizedSrc = src.split('?')[0] + "?auto=format&fit=crop&w=2560&q=100"; 
            }
            slidesHTMLArray.push(`
                <div class="slide-unit" style="min-width:100%; width:100%; flex-shrink:0; position:relative; background:#0f172a; display:flex; align-items:center; justify-content:center; height:56.25vw; max-height:500px; min-height:250px; overflow:hidden;">
                    <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:#cbd5e1; font-size:48px; pointer-events:none; z-index:1; display:flex; flex-direction:column; align-items:center; gap:4px;">
                        <i class="fa-regular fa-image" style="opacity:0.2;"></i>
                        <span style="font-size:12px; font-weight:700; letter-spacing:1px; opacity:0.15;">STAY100%</span>
                    </div>
                    <img src="${optimizedSrc}" alt="Gallery Asset" style="width:100%; height:100%; object-fit:contain; position:relative; z-index:2; display:block;">
                </div>
            `);
        });
        
        track.innerHTML = slidesHTMLArray.join('');
        activeSliderPositionIndex = 0;
        track.style.transform = `translateX(0%)`;
    }

    // --- COMPLETE UPGRADED DYNAMIC AMENITIES MATRIX PACK ---
    globalGeneratedFacilitiesArray = [];
    const facilityIconMap = {
        "wifi": { text: "High Speed Wi-Fi", icon: "fa-wifi" },
        "ac": { text: "Air Conditioner", icon: "fa-snowflake" },
        "food": { text: "Homely Food", icon: "fa-utensils" },
        "power": { text: "Power Backup", icon: "fa-bolt" },
        "laundry": { text: "Laundry Unit", icon: "fa-shirt" },
        "gym": { text: "GYM Access", icon: "fa-dumbbell" },
        "geyser": { text: "24x7 Geyser", icon: "fa-temperature-three-quarters" },
        "fridge": { text: "Shared Refrigerator", icon: "fa-refrigerator" },
        "cctv": { text: "CCTV Security", icon: "fa-video" },
        "security": { text: "24/7 Guard", icon: "fa-shield-halved" },
        "ro": { text: "RO Drinking Water", icon: "fa-faucet-drip" },
        "housekeeping": { text: "Daily Housekeeping", icon: "fa-broom" },
        "parking": { text: "Vehicle Parking", icon: "fa-car" },
        "tv": { text: "Smart TV / Lounge", icon: "fa-tv" },
        "elevator": { text: "Lift / Elevator", icon: "fa-elevator" }
    };

    // --- EXTRACT TRUE ACTIVATED AMENITIES ---
    Object.keys(facilityIconMap).forEach(key => {
        let dataHasIt = targetPropertyObject[key] === true || targetPropertyObject[key] === "true";
        if (!dataHasIt && targetPropertyObject.amenities) {
            const arrayVal = Array.isArray(targetPropertyObject.amenities) ? targetPropertyObject.amenities : Object.values(targetPropertyObject.amenities);
            dataHasIt = arrayVal.some(val => String(val).toLowerCase().replace(/[\s-]/g, '').includes(key));
        }
        if (dataHasIt) {
            globalGeneratedFacilitiesArray.push(facilityIconMap[key]);
        }
    });

    // Fallback sync strategy for raw schemas
    if (globalGeneratedFacilitiesArray.length === 0) {
        if (targetPropertyObject.amenities) {
            const rawAmenities = Array.isArray(targetPropertyObject.amenities) ? targetPropertyObject.amenities : Object.values(targetPropertyObject.amenities);
            rawAmenities.forEach(item => {
                let matchedIcon = "fa-circle-check";
                Object.keys(facilityIconMap).forEach(k => {
                    if (String(item).toLowerCase().includes(k)) matchedIcon = facilityIconMap[k].icon;
                });
                globalGeneratedFacilitiesArray.push({ text: item, icon: matchedIcon });
            });
        } else {
            ["wifi", "ac", "security", "housekeeping"].forEach(k => globalGeneratedFacilitiesArray.push(facilityIconMap[k]));
        }
    }

    // Trigger optimized fresh render grid matching state
    renderAmenitiesGridMatrix();
    if (typeof updateReviewsUIRenderBlocks === 'function') updateReviewsUIRenderBlocks();
};

// --- AUTHENTICATED COMMUNICATION TRIGGERS ---
function triggerSecureCall() {
    const currentSessionUID = localStorage.getItem('staypremium_uid');
    if (!currentSessionUID) {
        alert("🔒 Access Protected! Please sign in to verify your account and contact the owner.");
        window.location.href = 'login.html';
        return;
    }
    if (targetPropertyObject && targetPropertyObject.ownerPhone) {
        window.location.href = `tel:${targetPropertyObject.ownerPhone}`;
    } else {
        alert("Owner phone contact detail is unavailable at this moment.");
    }
}

function triggerSecureWhatsApp() {
    const currentSessionUID = localStorage.getItem('staypremium_uid');
    if (!currentSessionUID) {
        alert("🔒 Access Protected! Please sign in to verify your account and contact the owner on WhatsApp.");
        window.location.href = 'login.html';
        return;
    }
    if (targetPropertyObject && targetPropertyObject.ownerPhone) {
        const propTitle = targetPropertyObject.name || targetPropertyObject.title || "Premium Co-Living Space";
        const propPrice = targetPropertyObject.price || targetPropertyObject.currentPrice || 0;
        const propGender = targetPropertyObject.genderType || "Boys/Girls";
        const propLocation = targetPropertyObject.area || "Mansarovar";
        const cleanUrl = window.location.href;

        // Structured, highly converting text fallback template message
        const compiledMessageText = `Hi, I tried calling you regarding your listing: *${propTitle}* (${propGender} PG in ${propLocation}) listed on STAY100% at ₹${propPrice.toLocaleString('en-IN')}/mo.\n\nI couldn't reach you over the call. Please share if this space is still available for booking.\n\nListing link: ${cleanUrl}`;
        
        const cleanPhoneNo = targetPropertyObject.ownerPhone.replace(/[^0-9]/g, '');
        // Append dynamic international dialing parameter safely
        const targetWhatsAppNumber = cleanPhoneNo.length === 10 ? `91${cleanPhoneNo}` : cleanPhoneNo;

        window.open(`https://wa.me/${targetWhatsAppNumber}?text=${encodeURIComponent(compiledMessageText)}`, '_blank');
    } else {
        alert("Owner WhatsApp contact detail is unavailable at this moment.");
    }
}

// --- CORRECTED & IMMUTABLE AMENITIES RENDERING MATRIX ENGINE ---
const renderAmenitiesGridMatrix = () => {
    const facGrid = document.getElementById('amenities-collapsible-grid');
    if (!facGrid) return;

    const facilitiesList = globalGeneratedFacilitiesArray || [];
    // Always list top 6 elements inside plain preview baseline
    const initialPreviewLimit = 6;
    let itemsToRender = facilitiesList.slice(0, initialPreviewLimit);

    // Grid nodes update
    facGrid.innerHTML = itemsToRender.map(item => `
        <div class="facility-item-node">
            <i class="fa-solid ${item.icon || 'fa-circle-check'}" style="color: #4f46e5; font-size: 16px;"></i> 
            <span style="font-size: 14px; font-weight: 600; color: #334155;">${item.text}</span>
        </div>
    `).join('');
};

// POPUP INTERACTIVE ACTIONS SYSTEM CONTROL INJECTIONS
const toggleCentralAmenitiesModalPopup = (showFlag) => {
    const mask = document.getElementById('amenities-popup-mask');
    const modalTargetGrid = document.getElementById('modal-amenities-target-row');
    
    if (!mask || !modalTargetGrid) return;
    
    if (showFlag) {
        const facilitiesList = globalGeneratedFacilitiesArray || [];
        modalTargetGrid.innerHTML = facilitiesList.map(item => `
            <div class="facility-item-node" style="box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <i class="fa-solid ${item.icon || 'fa-circle-check'}" style="color: #4f46e5; font-size: 18px;"></i> 
                <span style="font-size: 14px; font-weight: 600; color: #1e293b;">${item.text}</span>
            </div>
        `).join('');
        mask.classList.add('modal-open');
    } else {
        mask.classList.remove('modal-open');
    }
};

// --- 4. CAROUSEL LAYER INTERACTIVE LOGIC CORE ---
const shiftSliderStep = (dir) => {
    const track = document.getElementById('image-slider-track');
    if (!track || !track.children.length) return;
    const maxElements = track.children.length;
    
    activeSliderPositionIndex = (activeSliderPositionIndex + dir + maxElements) % maxElements;
    track.style.transform = `translateX(-${activeSliderPositionIndex * 100}%)`;
    
    // Video play state sync on carousel change
    Array.from(track.children).forEach((slide, idx) => {
        const video = slide.querySelector('video');
        if (video) {
            if (idx === activeSliderPositionIndex) {
                video.currentTime = 0;
                video.play().catch(e => console.log('Playback deferred:', e));
            } else {
                video.pause();
            }
        }
    });
};

// --- 5. EVENT BINDING HOOKS CONFIGURATION ---
const bindInteractiveUIElements = () => {
    const bindClick = (id, callback) => {
        const el = document.getElementById(id);
        if (el) el.onclick = callback;
    };

    bindClick('btn-slide-prev', () => shiftSliderStep(-1));
    bindClick('btn-slide-next', () => shiftSliderStep(1));

    // Refactored dynamic click interceptor hook for explicit "Show More Modal Popup" functionality
    bindClick('btn-facilities-expand', () => toggleCentralAmenitiesModalPopup(true));
    bindClick('btn-popup-close', () => toggleCentralAmenitiesModalPopup(false));
    
    // Close modal when user clicks outside the core template container body box
    const maskElement = document.getElementById('amenities-popup-mask');
    if (maskElement) {
        maskElement.onclick = (e) => {
            if (e.target === maskElement) toggleCentralAmenitiesModalPopup(false);
        };
    }

    const shareBtn = document.getElementById('btn-share-whatsapp') || document.getElementById('btn-share-property');
    if (shareBtn) shareBtn.onclick = executeWebSharePipeline;

    const saveBtn = document.getElementById('btn-save-toggle') || document.getElementById('btn-save-property');
    if (saveBtn) saveBtn.onclick = toggleSavePropertyWishlist;

    const inquiryForm = document.getElementById('frm-instant-inquiry');
    if (inquiryForm) {
        const cachedName = localStorage.getItem('staypremium_name');
        const cachedPhone = localStorage.getItem('staypremium_phone');
        if (cachedName && document.getElementById('inq-name')) document.getElementById('inq-name').value = cachedName;
        if (cachedPhone && document.getElementById('inq-phone')) document.getElementById('inq-phone').value = cachedPhone;

        inquiryForm.onsubmit = (event) => {
            event.preventDefault();
            const currentSessionUID = localStorage.getItem('staypremium_uid');
            if (!currentSessionUID) {
                alert("Session expired! Please login first to submit an inquiry.");
                window.location.href = 'login.html';
                return;
            }

            const submitButton = inquiryForm.querySelector('button[type="submit"]');
            if (submitButton) submitButton.disabled = true;

            const clientMessageVal = document.getElementById('inq-message').value.trim();
            const timestampNow = Date.now();
            const propertyNameStr = targetPropertyObject ? (targetPropertyObject.name || targetPropertyObject.title) : "Premium Space Inquiry";

            const inquiryDataPacket = {
                propertyId: activePropertySlugId,
                propertyBranchNode: detectedTargetNodeBranch,
                propertyName: propertyNameStr,
                clientName: document.getElementById('inq-name').value.trim(),
                clientPhone: document.getElementById('inq-phone').value.trim(),
                clientMessage: clientMessageVal,
                userId: currentSessionUID, 
                timestamp: timestampNow,
                date: new Date(timestampNow).toLocaleString('en-IN')
            };

            Promise.all([
                db.ref('leads_inquiries').push().set(inquiryDataPacket),
                db.ref('inquiries').push().set(inquiryDataPacket)
            ]).then(() => {
                if (submitButton) submitButton.disabled = false;
                showCenterToasterAlert("🎉 Inquiry Submitted Successfully! Track it on your profile dashboard.");
                document.getElementById('inq-message').value = '';
            }).catch((err) => {
                if (submitButton) submitButton.disabled = false;
                alert(`Sync failed: ${err.message}`);
            });
        };
    }

    const stars = document.querySelectorAll('#star-input-group i');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            chosenFormInputStarRatingValue = parseInt(star.dataset.index);
            stars.forEach((s, idx) => {
                s.classList.toggle('active', idx < chosenFormInputStarRatingValue);
            });
        });
    });

    bindClick('btn-submit-review', publishLiveUserReview);
};

// --- TOASTER ALERT ENGINE ---
const showCenterToasterAlert = (message) => {
    let toaster = document.getElementById('staypremium-center-toaster');
    if (!toaster) {
        toaster = document.createElement('div');
        toaster.id = 'staypremium-center-toaster';
        Object.assign(toaster.style, {
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%) scale(0.9)',
            background: 'rgba(15, 23, 42, 0.95)', color: '#ffffff',
            padding: '16px 28px', borderRadius: '12px', fontSize: '15px',
            fontWeight: '600', textAlign: 'center', zIndex: '999999',
            opacity: '0', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            backdropFilter: 'blur(4px)', maxWidth: '90%', width: '400px', display: 'none'
        });
        document.body.appendChild(toaster);
    }
    toaster.innerText = message;
    toaster.style.display = 'block';
    setTimeout(() => { toaster.style.opacity = '1'; toaster.style.transform = 'translate(-50%, -50%) scale(1)'; }, 50);
    setTimeout(() => {
        toaster.style.opacity = '0'; toaster.style.transform = 'translate(-50%, -50%) scale(0.9)';
        setTimeout(() => { toaster.style.display = 'none'; }, 300);
    }, 3500);
};

// --- 6. ADVANCED DYNAMIC WEB SHARE SYSTEM ENGINE ---
const executeWebSharePipeline = () => {
    const shareTitle = targetPropertyObject ? (targetPropertyObject.name || targetPropertyObject.title) : "STAY100% Space";
    const shareUrl = window.location.href;
    if (navigator.share) {
        navigator.share({ title: shareTitle, text: `Check out this space on STAY100%!`, url: shareUrl });
    } else {
        navigator.clipboard.writeText(shareUrl)
            .then(() => showCenterToasterAlert("🔗 Link copied to clipboard!"))
            .catch(() => alert("Failed to copy link."));
    }
};

// --- 7. DATABASE BOOKMARKS/WISHLIST ENGINE ---
const toggleSavePropertyWishlist = () => {
    if (!activePropertySlugId || !targetPropertyObject) return;
    const currentSessionUID = localStorage.getItem('staypremium_uid');
    if (!currentSessionUID) {
        alert("Authentication required. Please log in to bookmark spaces.");
        window.location.href = 'login.html';
        return;
    }

    let savedList = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];
    const index = savedList.indexOf(activePropertySlugId);
    const userSavedRefNode = db.ref(`users_saved/${currentSessionUID}/${activePropertySlugId}`);

    if (index === -1) {
        const cardData = {
            id: activePropertySlugId,
            name: targetPropertyObject.name || "Premium Space",
            price: targetPropertyObject.price || 0,
            location: targetPropertyObject.location || "Premium Area",
            image: targetPropertyObject.image || (targetPropertyObject.allImages ? Object.values(targetPropertyObject.allImages)[0] : "")
        };
        userSavedRefNode.set(cardData).then(() => {
            savedList.push(activePropertySlugId);
            localStorage.setItem('staypremium_saved_properties', JSON.stringify(savedList));
            showCenterToasterAlert("Saved!");
        });
    } else {
        userSavedRefNode.remove().then(() => {
            savedList = savedList.filter(id => id !== activePropertySlugId);
            localStorage.setItem('staypremium_saved_properties', JSON.stringify(savedList));
            showCenterToasterAlert("Removed .");
        });
    }
};

const updateSaveButtonUI = () => {
    const saveBtn = document.getElementById('btn-save-toggle') || document.getElementById('btn-save-property');
    if (!saveBtn || !activePropertySlugId) return;
    const currentSessionUID = localStorage.getItem('staypremium_uid');
    if (!currentSessionUID) return;

    db.ref(`users_saved/${currentSessionUID}/${activePropertySlugId}`).on('value', (snapshot) => {
        if (snapshot.exists()) {
            saveBtn.innerHTML = `<i class="fa-solid fa-bookmark" style="color: #ef4444;"></i>`;
            saveBtn.style.background = "#fee2e2";
        } else {
            saveBtn.innerHTML = `<i class="fa-regular fa-bookmark"></i>`;
            saveBtn.style.background = "";
        }
    });
};

// --- 8. RECOMMENDATIONS CARD PIPELINE ---
const renderSimilarPropertiesEngine = () => {
    const container = document.getElementById('similar-properties-container');
    if (!container) return;

    const matchesList = completePropertiesPoolSnapshot.filter(item => 
        item.id !== activePropertySlugId && 
        ((item.category && targetPropertyObject.category && item.category === targetPropertyObject.category) || 
         (item.sharingType && targetPropertyObject.sharingType && item.sharingType === targetPropertyObject.sharingType))
    ).slice(0, 4);

    if (matchesList.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#64748b; font-size:14px; padding:20px;">No typical matching assets inside vicinity currently pooled.</p>`;
        return;
    }
    container.innerHTML = matchesList.map(prop => generateHorizontalRecommendationCard(prop)).join('');
};

const registerRecentPropertyFootprint = (propertyId) => {
    let footprints = JSON.parse(localStorage.getItem('staypremium_history_footprints')) || [];
    footprints = footprints.filter(id => id !== propertyId);
    footprints.unshift(propertyId);
    localStorage.setItem('staypremium_history_footprints', JSON.stringify(footprints.slice(0, 6)));
};

const renderRecentlyViewedPropertiesEngine = () => {
    const container = document.getElementById('recently-viewed-container');
    if (!container) return;
    const historyIds = JSON.parse(localStorage.getItem('staypremium_history_footprints')) || [];
    const targetedHistoryIds = historyIds.filter(id => id !== activePropertySlugId);

    if (targetedHistoryIds.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#64748b; font-size:14px; padding:20px;">Your exploration history matrix maps are empty.</p>`;
        return;
    }

    db.ref(detectedTargetNodeBranch).once('value', (snap) => {
        const masterRecords = snap.val() || {};
        const payload = targetedHistoryIds.map(id => masterRecords[id] ? { id: id, ...masterRecords[id] } : null).filter(Boolean).slice(0, 4);
        container.innerHTML = payload.map(prop => generateHorizontalRecommendationCard(prop)).join('');
    });
};

const generateHorizontalRecommendationCard = (item) => {
    const displayCardTitle = item.name || item.title || "Premium Space";
    const displayCardPrice = item.price || item.currentPrice || 0;
    const displayCardTag = item.genderType || item.suitableForGender || item.availableFor || "Boys/Girls";
    const depositAmount = item.deposit ? `₹${item.deposit.toLocaleString('en-IN')}` : "None";
    
    const directVerified = item.isVerified === true || item.isVerified === "true" || item.verified === true || item.verified === "true" || item.isVendorVerified === true;
    const vendorUid = item.uid || item.userId || null;
    const isVendorVerified = directVerified || (vendorUid ? (globalVerifiedVendorsMap[vendorUid] === true) : false);
    
    let starsHtmlStr = "";
    if (item.reviews) {
        const reviewObjects = Object.values(item.reviews);
        const calculatedAvg = Math.round(reviewObjects.reduce((acc, c) => acc + (c.rating || 0), 0) / reviewObjects.length);
        for (let i = 1; i <= 5; i++) {
            starsHtmlStr += `<i class="fa-solid fa-star" style="color: ${i <= calculatedAvg ? '#f59e0b' : '#cbd5e1'}; font-size: 11px; margin-right:1px;"></i>`;
        }
    } else {
        const staticFallbackRating = item.rating && !isNaN(item.rating) ? Math.round(item.rating) : 4; 
        for (let i = 1; i <= 5; i++) {
            starsHtmlStr += `<i class="fa-solid fa-star" style="color: ${i <= staticFallbackRating ? '#f59e0b' : '#cbd5e1'}; font-size: 11px; margin-right:1px;"></i>`;
        }
    }
    
    let cardImageSrc = item.image || item.imageUrl || (item.allImages ? Object.values(item.allImages)[0] : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af');
    if (cardImageSrc.includes('unsplash.com')) {
        cardImageSrc = cardImageSrc.split('?')[0] + "?auto=format&fit=crop&w=800&q=90";
    }

    return `
        <div class="mini-property-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.03); padding-bottom: 4px; cursor:pointer;" onclick="window.location.href='details.html?id=${item.id}'">
            <div style="width:100%; height:160px; background:#0f172a; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                <img src="${cardImageSrc}" alt="${displayCardTitle}" style="width:100%; height:100%; object-fit:contain; display:block;">
            </div>
            <div style="padding:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <div class="live-card-stars-wrapper" style="display:flex; align-items:center;">${starsHtmlStr}</div>
                    <span style="font-size:10px; background:#eeebff; padding:2px 6px; border-radius:4px; font-weight:700; color:#4f46e5;">${displayCardTag}</span>
                </div>
                <h5 style="margin:0 0 4px 0; font-size:15px; font-weight:700; color:#0f172a; text-overflow:ellipsis; white-space:nowrap; overflow:hidden; display:flex; align-items:center; gap:2px;">
                    <span style="text-overflow:ellipsis; overflow:hidden; white-space:nowrap; flex:1;">${displayCardTitle}</span>
                    ${getVerifiedBadgeMarkup(isVendorVerified)}
                </h5>
                <p style="margin:0 0 8px 0; font-size:12px; color:#64748b;"><i class="fa-solid fa-location-dot"></i> ${item.location || 'Jaipur'}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #e2e8f0; padding-top:8px; margin-top:4px;">
                    <span style="font-weight:700; color:#808000; font-size:13px;">₹${displayCardPrice.toLocaleString('en-IN')}/mo</span>
                    <span style="font-size:11px; color:#64748b;">Dep: <b>${depositAmount}</b></span>
                </div>
            </div>
        </div>
    `;
};

// --- 9. PUBLIC REVIEW ENGINE OPERATIONS ---
const publishLiveUserReview = () => {
    if (chosenFormInputStarRatingValue === 0) { alert("Please allocate a rating index value via stars first!"); return; }
    const commentText = document.getElementById('txt-review-comment').value.trim();
    if (!commentText) { alert("Please input public feedback review text description!"); return; }

    const generatedReviewObjectNode = {
        username: localStorage.getItem('staypremium_name') || "Verified User",
        userDp: "https://cdn-icons-png.flaticon.com/512/3177/3177440.png",
        rating: chosenFormInputStarRatingValue,
        comment: commentText,
        timestamp: Date.now()
    };

    db.ref(`${detectedTargetNodeBranch}/${activePropertySlugId}/reviews`).push(generatedReviewObjectNode, (err) => {
        if (!err) {
            showCenterToasterAlert("⭐ Review metrics linked up globally successfully!");
            document.getElementById('txt-review-comment').value = "";
            chosenFormInputStarRatingValue = 0;
            document.querySelectorAll('#star-input-group i').forEach(s => s.classList.remove('active'));
        }
    });
};

const updateReviewsUIRenderBlocks = () => {
    const targetContainer = document.getElementById('reviews-output-container');
    if (!targetContainer) return;
    
    const revObjSource = targetPropertyObject.reviews || {};
    const reviewsArray = Object.values(revObjSource);
    const initialRating = targetPropertyObject.rating || "New";

    const ratingNumEl = document.getElementById('lbl-summary-rating-num');
    const countTextEl = document.getElementById('lbl-summary-count-text');
    const summaryStarsEl = document.getElementById('lbl-summary-stars');

    if (reviewsArray.length === 0) {
        targetContainer.innerHTML = `<p style="color:#64748b; font-size:14px; text-align:center; padding:15px;">Be the first one to write a dynamic premium review verification data package!</p>`;
        if (ratingNumEl) ratingNumEl.innerText = initialRating;
        return;
    }

    let cumulativeRatingSum = 0;
    const outputHTMLStrings = reviewsArray.map(rev => {
        cumulativeRatingSum += rev.rating;
        let generatedStarsHtml = "";
        for (let i = 1; i <= 5; i++) generatedStarsHtml += `<i class="fa-solid fa-star" style="color:${i <= rev.rating ? '#f59e0b' : '#cbd5e1'}; font-size:12px;"></i>`;

        return `
            <div class="review-post-node" style="border-bottom:1px solid #e2e8f0; padding:15px 0;">
                <div class="review-user-meta" style="display:flex; align-items:center; gap:10px;">
                    <img src="${rev.userDp}" alt="DP" style="width:35px; height:35px; border-radius:50%;">
                    <div>
                        <div style="font-weight:600; font-size:14px;">${rev.username}</div>
                        <div style="margin-top:2px;">${generatedStarsHtml}</div>
                    </div>
                </div>
                <p style="margin:8px 0 0 0; font-size:14px; color:#475569; line-height:1.5;">${rev.comment}</p>
            </div>
        `;
    }).join('');

    const computedAvg = (cumulativeRatingSum / reviewsArray.length).toFixed(1);
    if (ratingNumEl) ratingNumEl.innerText = computedAvg;
    if (countTextEl) countTextEl.innerText = `${reviewsArray.length} verified reviews`;
    
    if (summaryStarsEl) {
        let avgStarsHtml = "";
        for (let i = 1; i <= 5; i++) avgStarsHtml += `<i class="fa-solid fa-star" style="color:${i <= Math.round(computedAvg) ? '#f59e0b' : '#cbd5e1'};"></i>`;
        summaryStarsEl.innerHTML = avgStarsHtml;
    }
    targetContainer.innerHTML = outputHTMLStrings;
};

// --- 10. FALLBACK MOCK DATA DATA MATRIX ---
const loadLocalMockPropertyDataPackage = () => {
    targetPropertyObject = {
        name: "Stanza Living Boston House (Fallback Spec)",
        location: "Mansarovar, Jaipur",
        address: "Plot 45, Near Mansarovar Metro Station, Jaipur, Rajasthan - 302020",
        googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.8971638166415!2d75.7591653!3d26.8447814!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db5da1e2d4f87%3A0x6a053c8c7c9ad0b!2sMansarovar%2C%20Jaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1700000000000",
        mrp: 12000,
        price: 6800,
        deposit: 6800,
        city: "Jaipur",
        area: "Mansarovar",
        genderType: "Boys",
        suitableForGender: "Working Professionals, Students (Boys)",
        availableFrom: "Immediate",
        postedBy: "Owner",
        postedDate: "May 30, 2026",
        roomsCount: "1 Room",
        bathroomsCount: "1 Bathroom",
        balconiesCount: "2 Balconies",
        houseRules: "No late-night parties, entry permitted till 11 PM, clean premises.",
        aboutProperty: "A state-of-the-art premium studio apartment built for corporate executives and students looking for high-class living ecosystems with zero disturbances.",
        propertyTypeMeta: "Studio Apartment",
        floorNumber: "1st of 4 Floors",
        flooring: "Ceramic",
        suitableFor: "Working Professionals, Students",
        parking: "1 Open",
        minimumContract: "6 Months",
        earlyLeavingCharges: "1 month(s) of rent",
        attachedBathroom: "Yes",
        attachedBalcony: "No",
        powerBackup: "None",
        propertyAge: "1 to 5 Year Old",
        noticePeriod: "1 Month",
        gateClosingTime: "11:00 PM",
        electricityPolicy: "₹8 Per Unit Metered Consumption",
        mealsConfig: "Pure Vegetarian Breakfast & Dinner Included",
        ownerName: "Amit Choudhary (Premium Partner)",
        ownerPhone: "+919876543210",
        wifi: true,
        ac: true,
        food: true,
        security: true,
        amenities: ["Wifi", "AC Attached", "Food Included", "Power Backup", "Security", "Laundry Unit", "CCTV Security", "RO Drinking Water"],
        allImages: [
            "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"
        ]
    };
    verifyVendorSubscriptionAndRender();
};