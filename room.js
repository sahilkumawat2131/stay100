/**
 * StayPremium - Realtime Database Management & Interactive Processing Pipeline (room.js)
 * Completely Optimized Search Engine, Multi-Keyword Filters and Live GPS Geo-Location Tracking
 * Highly Verified & Refactored Version with URL Deep-Link Indexing Engine
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, push, set, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// --- Firebase Sync Config Engine ---
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

// Initialize App Instances securely via Modern Web SDK
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Global Variables Stack State
let masterRoomRecords = [];
let selectedActiveTagFilter = "all";
let currentUser = null;
let currentSessionUID = localStorage.getItem('staypremium_uid') || null;

// User Live Location Metadata State
let userLatitude = null;
let userLongitude = null;
let isNearMeActive = false;

// URL Deep-Link Parameters Map State
let urlParamsFilter = {
    location: null,
    type: null,
    area: null,
    budget: null
};

// --- Extract Dynamic URL Parameters for SEO Navigation ---
function extractURLRoutingParameters() {
    const searchParams = new URLSearchParams(window.location.search);
    urlParamsFilter.location = searchParams.get('location') ? searchParams.get('location').toLowerCase().trim() : null;
    urlParamsFilter.type = searchParams.get('type') ? searchParams.get('type').toLowerCase().trim() : null;
    urlParamsFilter.area = searchParams.get('area') ? searchParams.get('area').toLowerCase().trim() : null;
    urlParamsFilter.budget = searchParams.get('budget') ? parseFloat(searchParams.get('budget')) : null;

    // Trigger AI filters active state matching URL type configuration
    if (urlParamsFilter.type) {
        selectedActiveTagFilter = urlParamsFilter.type;
        const targetTag = document.querySelector(`.filter-tag[data-type="${urlParamsFilter.type}"]`);
        if (targetTag) {
            document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
            targetTag.classList.add('active');
        }
    }
}

// Track Live Auth Context State Change
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        currentSessionUID = user.uid;
        localStorage.setItem('staypremium_uid', user.uid);
    } else {
        currentUser = null;
        currentSessionUID = localStorage.getItem('staypremium_uid') || null;
    }
    renderRoomDataViewGrid();
});

// --- Haversine Formula: GPS Location Distance Calculation Logic ---
function calculateDistanceKM(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371; // Earth's Radius in KM
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
}

// --- CENTERED TOAST NOTIFICATION GENERATOR ---
function showCenteredToast(htmlMessage) {
    let container = document.getElementById('toast-center-box-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-center-box-container';
        Object.assign(container.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(0.9)',
            background: 'rgba(15, 23, 42, 0.98)',
            color: '#ffffff',
            padding: '16px 28px',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: '15px',
            fontWeight: '600',
            textAlign: 'center',
            zIndex: '999999',
            opacity: '0',
            transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            pointerEvents: 'none',
            maxWidth: '85%',
            width: '380px'
        });
        document.body.appendChild(container);
    }
    
    container.innerHTML = htmlMessage;
    container.style.display = 'block';
    
    setTimeout(() => {
        container.style.opacity = '1';
        container.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 40);

    setTimeout(() => {
        container.style.opacity = '0';
        container.style.transform = 'translate(-50%, -50%) scale(0.9)';
        setTimeout(() => { container.style.display = 'none'; }, 250);
    }, 3200);
}

// Dom System Initialized Listener Tree
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('room-search-input');
    const voiceBtn = document.getElementById('voice-search-trigger');
    const filterTags = document.querySelectorAll('.filter-tag');
    const nearMeBtn = document.getElementById('near-me-gps-trigger');

    // Parse Deep links variables on startup
    extractURLRoutingParameters();

    // City Switcher Live Tracing
    window.addEventListener('staypremium_city_changed', () => {
        // Clear matrix URL filters if header city switches manually to prevent overlap
        urlParamsFilter = { location: null, type: null, area: null, budget: null };
        renderRoomDataViewGrid();
    });

    const inqModalBox = document.getElementById('room-inquiry-modal');
    const closeInqBox = document.getElementById('close-inquiry-modal');
    const formInqObj = document.getElementById('room-inquiry-form');

    if(closeInqBox) closeInqBox.onclick = () => { inqModalBox.style.display = 'none'; };
    window.addEventListener('click', (e) => { if(e.target === inqModalBox) inqModalBox.style.display = 'none'; });

    if(formInqObj) {
        if(localStorage.getItem('staypremium_name')) document.getElementById('inq-client-name').value = localStorage.getItem('staypremium_name');
        if(localStorage.getItem('staypremium_phone')) document.getElementById('inq-client-phone').value = localStorage.getItem('staypremium_phone');

        formInqObj.onsubmit = (event) => {
            event.preventDefault();
            commitInquiryPayloadCloud();
        };
    }

    // --- 🌍 INTEGRATION: GEOLOCATION API FOR NEAR ME SEARCH ---
    if (nearMeBtn) {
        nearMeBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                showCenteredToast("<i class='fa-solid fa-triangle-exclamation' style='color:#ef4444;'></i> Geolocation is not supported by your browser.");
                return;
            }

            if (isNearMeActive) {
                isNearMeActive = false;
                nearMeBtn.style.background = "#800020";
                nearMeBtn.querySelector('span').innerText = "Near Me";
                showCenteredToast("Live location sorting turned off.");
                renderRoomDataViewGrid();
                return;
            }

            nearMeBtn.querySelector('span').innerText = "Locating...";
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLatitude = position.coords.latitude;
                    userLongitude = position.coords.longitude;
                    isNearMeActive = true;
                    
                    nearMeBtn.style.background = "#10b981"; 
                    nearMeBtn.querySelector('span').innerText = "Active Nearby";
                    showCenteredToast("<i class='fa-solid fa-location-dot' style='color:#10b981; margin-right:5px;'></i> GPS Connected! Displaying nearest flats first.");
                    renderRoomDataViewGrid();
                },
                (error) => {
                    console.error("GPS Error Trace: ", error);
                    nearMeBtn.querySelector('span').innerText = "Near Me";
                    isNearMeActive = false;
                    showCenteredToast("<i class='fa-solid fa-circle-xmark' style='color:#ef4444; margin-right:5px;'></i> Please enable GPS Location permissions.");
                },
                { enableHighAccuracy: true, timeout: 8000 }
            );
        });
    }

    // --- DATABASE POOL LOAD PIPELINE (UNFILTERED SECURE RETRIEVAL) ---
    const propertiesNodeRef = ref(database, 'properties');
    onValue(propertiesNodeRef, (snapshot) => {
        const rawPayload = snapshot.val();
        if(rawPayload) {
            masterRoomRecords = Object.keys(rawPayload).map(key => ({ id: key, ...rawPayload[key] }));
            renderRoomDataViewGrid();
        } else {
            masterRoomRecords = [];
            renderRoomDataViewGrid();
        }
    });

    if (searchInput) searchInput.addEventListener('input', () => {
        // Reset dynamic directory state if user interacts with search bar typing manually
        urlParamsFilter = { location: null, type: null, area: null, budget: null };
        renderRoomDataViewGrid();
    });

    // Filter Navigation Click Listener Matrix
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            selectedActiveTagFilter = tag.dataset.type; 
            // Clear parameter routes context on explicit click navigation updates
            urlParamsFilter.type = null;
            renderRoomDataViewGrid();
        });
    });

    // Voice Processing Speech Recognition Hook Loop
    if (voiceBtn && searchInput) {
        const SpeechSetup = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechSetup) {
            const SpeechEngineInstance = new SpeechSetup();
            SpeechEngineInstance.continuous = false;
            SpeechEngineInstance.lang = 'en-IN';

            voiceBtn.onclick = () => {
                SpeechEngineInstance.start();
                searchInput.placeholder = "Listening live to search query...";
            };
            SpeechEngineInstance.onresult = (e) => {
                const vocalResultText = e.results[0][0].transcript;
                searchInput.value = vocalResultText;
                searchInput.placeholder = "Search premium flats by area, sector, landlord or flat type...";
                urlParamsFilter = { location: null, type: null, area: null, budget: null };
                renderRoomDataViewGrid();
            };
            SpeechEngineInstance.onerror = () => {
                searchInput.placeholder = "Vocal sound signature tracing crashed.";
            };
        } else {
            voiceBtn.style.display = 'none';
        }
    }
});

// --- CORE RENDERING MATRIX PIPELINE ---
function renderRoomDataViewGrid() {
    const container = document.getElementById('room-cards-container');
    if(!container) return;

    const queryInput = document.getElementById('room-search-input');
    const keywordStr = queryInput ? queryInput.value.toLowerCase().trim() : '';
    const savedList = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];
    const activeSelectedCity = (localStorage.getItem('staypremium_selected_city') || "all").toLowerCase().trim();

    // 🚀 STAGE 1: FILTERING STACK PIPELINE WITH FOOTER ROUTING INTERCEPT
    let processedResultPool = masterRoomRecords.filter(post => {
        const titleText = (post.name || post.title || "").toLowerCase();
        const locationText = (post.area || post.location || "").toLowerCase();
        const tagText = (post.type || "").toLowerCase();
        const flatTypeText = (post.flatType || "").toLowerCase();
        const categoryText = (post.category || "").toLowerCase();
        const propertyCityRaw = (post.city || "").toLowerCase().trim();
        const propertyPrice = parseFloat(post.price || post.rent || 0);

        // Layer 1: Strict Flat Entity Structure Evaluation Loop
        const isFlatStructure = titleText.includes('1rk') || titleText.includes('1r k') || tagText.includes('1rk') || flatTypeText.includes('1rk') ||
                                titleText.includes('1bhk') || titleText.includes('1 bhk') || tagText.includes('1bhk') || flatTypeText.includes('1bhk') ||
                                titleText.includes('2bhk') || titleText.includes('2 bhk') || tagText.includes('2bhk') || flatTypeText.includes('2bhk') ||
                                titleText.includes('3bhk') || titleText.includes('3 bhk') || tagText.includes('3bhk') || flatTypeText.includes('3bhk') ||
                                titleText.includes('4bhk') || titleText.includes('4 bhk') || tagText.includes('4bhk') || flatTypeText.includes('4bhk') ||
                                categoryText.includes('flat') || tagText.includes('flat') || flatTypeText.includes('flat') || 
                                categoryText.includes('room') || tagText.includes('room') || flatTypeText.includes('room');
        
        if (!isFlatStructure) return false;

        // Layer 2: INTERCEPT -> SEO Directory Footer Links Configuration Mapping
        if (urlParamsFilter.location && propertyCityRaw !== urlParamsFilter.location) return false;
        if (urlParamsFilter.area && !locationText.includes(urlParamsFilter.area)) return false;
        if (urlParamsFilter.budget && propertyPrice > urlParamsFilter.budget) return false;

        // Layer 3: Selected City Sync Layer (Fallback when directory links are clean)
        if (!urlParamsFilter.location && activeSelectedCity !== "all" && activeSelectedCity !== "all cities" && activeSelectedCity !== "") {
            if (propertyCityRaw !== activeSelectedCity) return false;
        }

        // Layer 4: Advanced Keyword Multi-Index Search
        if (keywordStr !== '') {
            const searchValidity = titleText.includes(keywordStr) || locationText.includes(keywordStr) || 
                                   tagText.includes(keywordStr) || flatTypeText.includes(keywordStr) || 
                                   categoryText.includes(keywordStr) || propertyCityRaw.includes(keywordStr);
            if (!searchValidity) return false;
        }

        // Layer 5: AI Tag Selection Configuration Tracker 
        const normFilter = selectedActiveTagFilter.toLowerCase().trim();
        if (normFilter !== "all") {
            if (normFilter === "1rk") {
                return tagText.includes('1rk') || titleText.includes('1rk') || flatTypeText.includes('1rk') || titleText.includes('1r k');
            }
            if (normFilter === "1bhk") {
                return tagText.includes('1bhk') || titleText.includes('1bhk') || flatTypeText.includes('1bhk') || titleText.includes('1 bhk');
            }
            if (normFilter === "2bhk") {
                return tagText.includes('2bhk') || titleText.includes('2bhk') || flatTypeText.includes('2bhk') || titleText.includes('2 bhk');
            }
            if (normFilter === "3bhk") {
                return tagText.includes('3bhk') || titleText.includes('3bhk') || flatTypeText.includes('3bhk') || titleText.includes('3 bhk');
            }
            if (normFilter === "4bhk") {
                return tagText.includes('4bhk') || titleText.includes('4bhk') || flatTypeText.includes('4bhk') || titleText.includes('4 bhk');
            }
            if (normFilter === "furnished") {
                return post.furnished === true || String(post.furnished).toLowerCase() === 'true' ||
                       tagText.includes('furnished') || titleText.includes('furnished') || flatTypeText.includes('furnished');
            }
        }

        return true;
    });

    // 🚀 STAGE 2: LIVE GPS DISTANCE SORTING ENGINE (IF NEAR ME ENABLED)
    if (isNearMeActive && userLatitude && userLongitude) {
        processedResultPool.forEach(post => {
            const propLat = parseFloat(post.lat || post.latitude);
            const propLon = parseFloat(post.lng || post.longitude || post.long);
            
            if (propLat && propLon) {
                post._calculatedDistance = calculateDistanceKM(userLatitude, userLongitude, propLat, propLon);
            } else {
                post._calculatedDistance = 999999; 
            }
        });

        // Sort pool ascending (Nearest first)
        processedResultPool.sort((a, b) => a._calculatedDistance - b._calculatedDistance);
    }

    // 🚀 STAGE 3: INTERACTIVE DYNAMIC DOM RE-INJECTION
    if(processedResultPool.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1; display:flex; flex-direction:column; align-items:center; padding:60px 20px; background:#fff; border-radius:16px; text-align:center; width: 100%; box-sizing: border-box; max-width: 600px; margin: 30px auto; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                <img src="assets/stay100.png" alt="No Results" style="width: 100%; max-width: 280px; height: auto; margin-bottom: 25px; filter: drop-shadow(0px 8px 16px rgba(0,0,0,0.08));">
                <h3 style="margin:0 0 6px 0; font-size:22px; color:#1e293b; font-weight:700;">No Matching Premium Flats</h3>
                <p style="margin:0; font-size:14px; color:#64748b; max-width:400px; line-height:1.5;">Modify search terms or disable dynamic deep-link targets to view properties.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = processedResultPool.map(item => {
        return window.PropertyCardComponent.render(item, savedList);
    }).join('');

    // LIFECYCLE HOOK TRIGGER: Init Autoswipe on sliders nodes
    if (window.PropertyCardComponent && typeof window.PropertyCardComponent.initAutoswipe === 'function') {
        setTimeout(() => {
            window.PropertyCardComponent.initAutoswipe();
        }, 80);
    }
}

// Global Event Delegate Interceptors (Click Processing Engine)
const cardsContainer = document.getElementById('room-cards-container');
if (cardsContainer) {
    cardsContainer.addEventListener('click', (event) => {
        const viewHandle = event.target.closest('[data-view-id]');
        const inquiryHandle = event.target.closest('[data-inquiry-id]');
        const saveHandle = event.target.closest('[data-save-id]');

        if(viewHandle && !event.target.closest('.carousel-nav-arrow') && !event.target.closest('.carousel-dot-bubble') && !event.target.closest('[data-save-id]') && !event.target.closest('[data-inquiry-id]')) {
            const id = viewHandle.getAttribute('data-view-id');
            window.location.href = `details.html?id=${id}`;
        }

        // --- BOOKMARK CONTROLLER ENGINE NODE ---
        if(saveHandle) {
            event.preventDefault();
            event.stopPropagation();

            if(!currentSessionUID) {
                alert("Authentication required. Please log in to bookmark premium spaces.");
                window.location.href = 'login.html';
                return;
            }

            const targetPropId = saveHandle.getAttribute('data-save-id');
            const targetPostObj = masterRoomRecords.find(p => p.id === targetPropId);
            if(!targetPostObj) return;

            let savedList = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];
            const index = savedList.indexOf(targetPropId);
            const userSavedRefNode = ref(database, `users_saved/${currentSessionUID}/${targetPropId}`);

            if(index === -1) {
                const cardDataSnapshot = {
                    id: targetPropId,
                    name: targetPostObj.name || targetPostObj.title || "Premium Flat",
                    title: targetPostObj.name || targetPostObj.title || "Premium Flat",
                    price: targetPostObj.price || targetPostObj.rent || 0,
                    mrp: targetPostObj.mrp || 0,
                    location: targetPostObj.location || targetPostObj.area || "Premium Location",
                    image: targetPostObj.image || targetPostObj.imageUrl || "",
                    badge: targetPostObj.badge || "Flat"
                };

                set(userSavedRefNode, cardDataSnapshot).then(() => {
                    if(!savedList.includes(targetPropId)) savedList.push(targetPropId);
                    localStorage.setItem('staypremium_saved_properties', JSON.stringify(savedList));
                    showCenteredToast("<i class='fa-solid fa-heart' style='color:#ef4444; margin-right:6px;'></i> Added to Premium Bookmarks Vault!");
                    renderRoomDataViewGrid();
                });
            } else {
                remove(userSavedRefNode).then(() => {
                    savedList = savedList.filter(id => id !== targetPropId);
                    localStorage.setItem('staypremium_saved_properties', JSON.stringify(savedList));
                    showCenteredToast("<i class='fa-solid fa-heart-broken' style='color:#64748b; margin-right:6px;'></i> Removed from Bookmarks Vault.");
                    renderRoomDataViewGrid();
                });
            }
        }

        // --- LIVE INQUIRY POPUP CAPTURE CONTROLLER ---
        if(inquiryHandle) {
            event.preventDefault();
            event.stopPropagation();
            
            if(!currentSessionUID) {
                showCenteredToast("<i class='fa-solid fa-circle-xmark' style='color:#ef4444; margin-right:5px;'></i> Access Denied! Please login to dispatch inquiries.");
                setTimeout(() => { window.location.href = 'login.html'; }, 1200);
                return;
            }

            const targetPropId = inquiryHandle.getAttribute('data-inquiry-id');
            const targetPostObj = masterRoomRecords.find(p => p.id === targetPropId);
            if(!targetPostObj) return;

            document.getElementById('inq-prop-id').value = targetPropId;
            document.getElementById('inq-prop-name').value = targetPostObj.name || targetPostObj.title || "Premium Space";
            document.getElementById('inq-prop-location').value = targetPostObj.location || targetPostObj.area || "";
            
            document.getElementById('room-inquiry-modal').style.setProperty('display', 'flex', 'important');
        }
    });
}

// Submit Inquiry Request Packet To Realtime Node Locations
function commitInquiryPayloadCloud() {
    const propertyId = document.getElementById('inq-prop-id').value;
    const propertyName = document.getElementById('inq-prop-name').value;
    const propertyLocation = document.getElementById('inq-prop-location').value;
    const clientName = document.getElementById('inq-client-name').value.trim();
    const clientPhone = document.getElementById('inq-client-phone').value.trim();
    const clientMsg = document.getElementById('inq-client-msg').value.trim();

    const globalInquiryNodeRef = ref(database, 'inquiries');
    const newInquiryPushNode = push(globalInquiryNodeRef);
    const generatedInquiryId = newInquiryPushNode.key;

    const timestampNow = Date.now();

    const inquiryPayload = {
        inquiryId: generatedInquiryId,
        propertyId: propertyId,
        propertyBranchNode: "properties",
        propertyName: propertyName,
        propertyLocation: propertyLocation,
        userId: currentSessionUID,
        userUid: currentSessionUID,
        uid: currentSessionUID,
        clientName: clientName,
        clientPhone: clientPhone,
        clientMessage: clientMsg,
        message: clientMsg,
        timestamp: timestampNow,
        date: new Date(timestampNow).toLocaleString('en-IN'),
        category: "Flats"
    };

    const leadsRefNode = ref(database, `leads_inquiries/${generatedInquiryId}`);

    Promise.all([
        set(newInquiryPushNode, inquiryPayload),
        set(leadsRefNode, inquiryPayload)
    ])
    .then(() => {
        const recentInquiriesRef = ref(database, `users/${currentSessionUID}/recentInquiries/${generatedInquiryId}`);
        const myInquiriesRef = ref(database, `users/${currentSessionUID}/myInquiries/${generatedInquiryId}`);
        
        const profilePayload = {
            inquiryId: generatedInquiryId,
            propertyId: propertyId,
            propertyName: propertyName,
            propertyLocation: propertyLocation,
            timestamp: timestampNow,
            date: inquiryPayload.date
        };

        return Promise.all([
            set(recentInquiriesRef, profilePayload),
            set(myInquiriesRef, profilePayload)
        ]);
    })
    .then(() => {
        showCenteredToast(`<i class='fa-solid fa-circle-check' style='color:#10b981; margin-right:6px;'></i> Success! Inquiry for <b>${propertyName}</b> saved to dashboard.`);
        document.getElementById('room-inquiry-modal').style.display = 'none';
        
        const formObj = document.getElementById('room-inquiry-form');
        if(formObj) {
            formObj.reset();
            if(localStorage.getItem('staypremium_name')) document.getElementById('inq-client-name').value = localStorage.getItem('staypremium_name');
            if(localStorage.getItem('staypremium_phone')) document.getElementById('inq-client-phone').value = localStorage.getItem('staypremium_phone');
        }
    })
    .catch((err) => {
        console.error("Critical database sync error: ", err);
        showCenteredToast("<i class='fa-solid fa-circle-xmark' style='color:#ef4444; margin-right:6px;'></i> Cloud write operation synchronization failed.");
    });
}