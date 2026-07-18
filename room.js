/**
 * StayPremium - Premium PG & Realtime Multi-Filter Database Engine (room.js)
 * Fully Fixed, Interconnected, and Production Ready
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, push, set, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// --- FIREBASE INITIALIZATION ENGINE ---
const firebaseConfig = {
  apiKey: "AIzaSyCcStFHPf5AOCZgqMCWq9T7nd4lFXAcA8M",
  authDomain: "stay100-31316.firebaseapp.com",
  databaseURL: "https://stay100-31316-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stay100-31316",
  storageBucket: "stay100-31316.firebasestorage.app",
  messagingSenderId: "91816784620",
  appId: "1:91816784620:web:45cbf9baa3808fc580ebc9"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// --- GLOBAL RUNTIME STORAGE MATRIX STATES ---
let masterRoomRecords = [];
let selectedActiveTagFilter = "all";
let currentSessionUID = localStorage.getItem('staypremium_uid') || null;

let userLatitude = null;
let userLongitude = null;
let isNearMeActive = false;
let renderDebounceTimeout = null;

// --- AUTHENTICATION STREAM HANDLER ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentSessionUID = user.uid;
        localStorage.setItem('staypremium_uid', user.uid);
        if (user.displayName) localStorage.setItem('staypremium_name', user.displayName);
        if (user.email) localStorage.setItem('staypremium_email', user.email);
        if (user.phoneNumber) localStorage.setItem('staypremium_phone', user.phoneNumber);
    }
    renderRoomDataViewGrid();
});

// --- CORE INTERFACE MOUNT ENTRYPOINT (DOM Lifecycle) ---
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('room-search-input');
    const voiceBtn = document.getElementById('voice-search-trigger');
    const filterTags = document.querySelectorAll('.filter-tag');
    const nearMeBtn = document.getElementById('near-me-gps-trigger');
    
    // Side Filter UI Hooks
    const showFilterBtn = document.getElementById('showFilterBtn');
    const hideFilterBtn = document.getElementById('hideFilterBtn');
    const sidebarPanel = document.getElementById('sidebarFilterPanel');
    const budgetSlider = document.getElementById('budgetRangeSlider');
    const sliderLabel = document.getElementById('sliderValueLabel');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');

    // Setup Modals dynamically
    setupInquiryModalMarkup();

    // Toggle Sidebar Filters Panel (Desktop & Mobile)
    if (showFilterBtn && sidebarPanel) {
        showFilterBtn.addEventListener('click', () => {
            sidebarPanel.classList.toggle('hidden'); 
            sidebarPanel.classList.toggle('active'); 
        });
    }
    if (hideFilterBtn && sidebarPanel) {
        hideFilterBtn.addEventListener('click', () => {
            sidebarPanel.classList.add('hidden');
            sidebarPanel.classList.remove('active');
        });
    }

    // Live Slider Display Hook
    if (budgetSlider && sliderLabel) {
        budgetSlider.addEventListener('input', (e) => {
            sliderLabel.innerText = `₹${parseInt(e.target.value).toLocaleString('en-IN')}`;
            debouncedRenderGrid();
        });
    }

    // Reset All System Filters
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            document.querySelectorAll('.prop-type-filter, .sharing-filter, .furnish-filter, .amenity-filter').forEach(el => el.checked = false);
            if(budgetSlider) budgetSlider.value = 60000;
            if(sliderLabel) sliderLabel.innerText = "₹60,000";
            
            const allGenderRadio = document.querySelector('[name="genderPref"][value="all"]');
            if (allGenderRadio) allGenderRadio.checked = true;
            
            selectedActiveTagFilter = "all";
            filterTags.forEach(t => t.classList.remove('active'));
            if (filterTags[0]) filterTags[0].classList.add('active');

            debouncedRenderGrid();
        });
    }

    // Attach Event Listeners to all Checkboxes / Radio Inputs in Sidebar
    document.querySelectorAll('.prop-type-filter, .sharing-filter, .furnish-filter, .amenity-filter').forEach(element => {
        element.addEventListener('change', debouncedRenderGrid);
    });
    document.getElementsByName('genderPref').forEach(radio => {
        radio.addEventListener('change', debouncedRenderGrid);
    });

    // Near Me GPS Tracking Engine
    if (nearMeBtn) {
        nearMeBtn.addEventListener('click', () => {
            if (isNearMeActive) {
                isNearMeActive = false;
                nearMeBtn.style.background = "#800020";
                nearMeBtn.querySelector('span').innerText = "Near Me";
                debouncedRenderGrid();
                return;
            }
            navigator.geolocation.getCurrentPosition((pos) => {
                userLatitude = pos.coords.latitude;
                userLongitude = pos.coords.longitude;
                isNearMeActive = true;
                nearMeBtn.style.background = "#10b981";
                nearMeBtn.querySelector('span').innerText = "Nearby Active";
                debouncedRenderGrid();
            }, (err) => {
                alert("Location access denied or unavailable.");
                console.warn(err);
            });
        });
    }

    // Initialize Shimmer Loading View
    showInitialRoomLoader();

    // Firebase Data Capture Node Stream
    const propertiesNodeRef = ref(database, 'properties');
    onValue(propertiesNodeRef, (snapshot) => {
        const rawPayload = snapshot.val();
        if(rawPayload) {
            masterRoomRecords = Object.keys(rawPayload).map(key => ({ id: key, ...rawPayload[key] }));
        }
        renderRoomDataViewGrid();
    }, (error) => {
        console.error("Firebase database runtime error: ", error);
        renderRoomDataViewGrid();
    });

    if (searchInput) {
        searchInput.addEventListener('input', debouncedRenderGrid);
    }

    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            selectedActiveTagFilter = tag.dataset.type || "all";
            debouncedRenderGrid();
        });
    });

    // Attach high-performance global delegated execution triggers once
    bindInteractiveCardDelegates();
});

// --- DEBOUNCE ACCELERATOR ENGINE ---
function debouncedRenderGrid() {
    clearTimeout(renderDebounceTimeout);
    renderDebounceTimeout = setTimeout(renderRoomDataViewGrid, 250);
}

// --- SHIMMER INTERFACE LOADER ---
function showInitialRoomLoader() {
    const container = document.getElementById('room-cards-container');
    if (!container) return;

    container.innerHTML = `
        <div class="firebase-loading-wrapper" style="grid-column: 1 / -1; width:100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 20px; text-align: center;">
            <div class="logo-animation-container">
                <img src="/assets/vendor logo.png" alt="Loading..." class="pulse-logo" style="width: 85px; height: auto; margin-bottom: 18px;" onerror="this.src='https://placehold.co/85x85?text=Stay100'">
            </div>
            <div class="loading-bar-container" style="width: 140px; height: 4px; background: #f3f4f6; border-radius: 10px; overflow: hidden; position: relative;">
                <div class="loading-bar-fill" style="position: absolute; width: 50%; height: 100%; background: #800020; border-radius: 10px; animation: loadingSlide 1.5s infinite ease-in-out;"></div>
            </div>
            <p style="color: #6b7280; font-size: 13px; font-weight: 500; margin-top: 14px; font-family: sans-serif; letter-spacing: 0.5px;">Loading Premium Spaces...</p>
        </div>
    `;
}

// --- LOCAL LANGUAGE & HINGLISH PARSER DICTIONARY ---
function processSmartSearchDictionary(queryStr) {
    let output = queryStr.toLowerCase().trim();
    if(output.includes("ladko ke liye") || output.includes("boys pg") || output.includes("boy pg")) output += " boys";
    if(output.includes("ladkio ke liye") || output.includes("girls pg") || output.includes("girl pg") || output.includes("larki")) output += " girls";
    if(output.includes("sasta") || output.includes("low price")) output += " budget";
    if(output.includes("akela kamra")) output += " single room";
    if(output.includes("khana") || output.includes("mess")) output += " food";
    return output;
}

// --- MAIN RENDER PIPELINE INTEGRATION ---
function renderRoomDataViewGrid() {
    const container = document.getElementById('room-cards-container');
    if(!container) return;

    const queryInput = document.getElementById('room-search-input');
    const rawSearchText = queryInput ? queryInput.value : '';
    const keywordStr = processSmartSearchDictionary(rawSearchText);
    
    const maxBudget = parseFloat(document.getElementById('budgetRangeSlider')?.value || 60000);
    const selectedGender = document.querySelector('input[name="genderPref"]:checked')?.value || "all";
    
    const checkedTypes = Array.from(document.querySelectorAll('.prop-type-filter:checked')).map(el => el.value.toLowerCase());
    const checkedSharing = Array.from(document.querySelectorAll('.sharing-filter:checked')).map(el => el.value.toLowerCase());
    const checkedFurnishing = Array.from(document.querySelectorAll('.furnish-filter:checked')).map(el => el.value.toLowerCase());
    const checkedAmenities = Array.from(document.querySelectorAll('.amenity-filter:checked')).map(el => el.value.toLowerCase());

    const savedList = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];

    let processedResultPool = masterRoomRecords.filter(post => {
        const title = (post.name || post.title || "").toLowerCase();
        const location = (post.area || post.location || "").toLowerCase();
        const type = (post.type || post.category || "").toLowerCase();
        const price = parseFloat(post.price || post.rent || 0);
        const genderAllowed = (post.gender || "all").toLowerCase();
        const furnishStatus = (post.furnishing || post.furnishedType || "").toLowerCase();
        const description = (post.desc || post.description || "").toLowerCase();
        const amnsList = Array.isArray(post.amenities) ? post.amenities.map(a => a.toLowerCase()) : [];

        // 1. Budget Filter
        if (price > maxBudget) return false;

        // 2. Gender Preference Filter
        if (selectedGender !== "all" && genderAllowed !== "all" && genderAllowed !== selectedGender) return false;

        // 3. Dynamic Property Type Filter
        if (checkedTypes.length > 0) {
            const matchType = checkedTypes.some(t => type.includes(t) || title.includes(t));
            if (!matchType) return false;
        }

        // 4. Sharing Options Filter
        if (checkedSharing.length > 0) {
            const matchSharing = checkedSharing.some(s => type.includes(s) || title.includes(s) || description.includes(s) || (post.sharingType && post.sharingType.toLowerCase().includes(s)));
            if (!matchSharing) return false;
        }

        // 5. Furnishing Status Check
        if (checkedFurnishing.length > 0) {
            const matchFurnish = checkedFurnishing.some(f => furnishStatus.includes(f) || title.includes(f));
            if (!matchFurnish) return false;
        }

        // 6. Amenities Evaluation
        if (checkedAmenities.length > 0) {
            const hasAllAmns = checkedAmenities.every(a => amnsList.includes(a) || description.includes(a) || (post[a] === true));
            if (!hasAllAmns) return false;
        }

        // 7. Quick Filter Header Tags Layer
        if (selectedActiveTagFilter !== "all") {
            const filterNorm = selectedActiveTagFilter.toLowerCase().trim();
            if (filterNorm === "furnished" || filterNorm === "fully furnished") {
                if (!title.includes("furnished") && !furnishStatus.includes("fully")) return false;
            } else {
                if (!type.includes(filterNorm) && !title.includes(filterNorm) && !description.includes(filterNorm)) return false;
            }
        }

        // 8. Geolocation Distance Check (Max 5 KM Limit)
        if (isNearMeActive && userLatitude && userLongitude) {
            const propLat = parseFloat(post.lat || post.latitude);
            const propLng = parseFloat(post.lng || post.longitude);
            
            if (!propLat || !propLng) return false;

            // Haversine Calculation Formula
            const R = 6371; 
            const dLat = (propLat - userLatitude) * Math.PI / 180;
            const dLng = (propLng - userLongitude) * Math.PI / 180;
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(userLatitude * Math.PI / 180) * Math.cos(propLat * Math.PI / 180) * 
                Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c; 

            if (distance > 5) return false; 
        }

        // 9. Smart Dynamic Search Text Processor
        if (keywordStr !== '') {
            const matchSearch = title.includes(keywordStr) || location.includes(keywordStr) || 
                                type.includes(keywordStr) || description.includes(keywordStr);
            if (!matchSearch) return false;
        }

        return true;
    });

    // Inject compiled DOM payload strings
    if(processedResultPool.length === 0) {
        container.innerHTML = `<div class="loader-text" style="grid-column:1/-1; text-align:center; padding:50px; color:#6b7280; font-family:sans-serif; font-size:15px; font-weight:500;">Oops! Koi matching flat ya PG nahi mila. Filter reset karke dekhein.</div>`;
        return;
    }

    container.innerHTML = processedResultPool.map(item => {
        if (window.PropertyCardComponent && typeof window.PropertyCardComponent.render === 'function') {
            return window.PropertyCardComponent.render(item, savedList);
        } else {
            return buildRoomCardItemFallbackString(item, savedList);
        }
    }).join('');

    if (window.PropertyCardComponent && typeof window.PropertyCardComponent.initAutoswipe === 'function') {
        window.PropertyCardComponent.initAutoswipe();
    }
}

// --- BACKUP INTERFACE CARD STRINGS COMPILER ---
function buildRoomCardItemFallbackString(item, savedList) {
    const isSaved = savedList.includes(item.id);
    return `
        <div class="property-card" style="background:#fff; border-radius:16px; padding:16px; box-shadow:0 4px 12px rgba(0,0,0,0.05); border:1px solid #e2e8f0; font-family:sans-serif;">
            <div style="position:relative; height:180px; border-radius:12px; overflow:hidden; margin-bottom:12px;">
                <img src="${item.image || item.imageUrl || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500'}" style="width:100%; height:100%; object-fit:cover;">
                <button data-save-id="${item.id}" style="position:absolute; top:10px; right:10px; width:36px; height:36px; border-radius:50%; background:#fff; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.15);">
                    <i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark" style="color:${isSaved ? '#800020' : '#475569'};"></i>
                </button>
            </div>
            <h3 style="margin:0 0 6px 0; font-size:16px; color:#1e293b;">${item.name || item.title || 'Premium Room/Flat'}</h3>
            <p style="margin:0 0 12px 0; color:#64748b; font-size:13px;"><i class="fa-solid fa-location-dot"></i> ${item.location || item.area || 'Premium Zone'}</p>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:700; color:#800020; font-size:18px;">₹${item.price || item.rent}/mo</span>
                <div style="display:flex; gap:6px;">
                    <button data-view-id="${item.id}" style="padding:6px 12px; font-size:12px; border:1px solid #cbd5e1; border-radius:6px; background:#fff; cursor:pointer; font-weight:600;">Details</button>
                    <button data-inquiry-id="${item.id}" style="padding:6px 12px; font-size:12px; border:none; border-radius:6px; background:#800020; color:#fff; cursor:pointer; font-weight:600;">Book Now</button>
                </div>
            </div>
        </div>
    `;
}

// --- CONSOLIDATED GLOBAL DELEGATION ROUTER ---
function bindInteractiveCardDelegates() {
    const container = document.getElementById('room-cards-container');
    if (!container || container.getAttribute('data-events-bound') === 'true') return;

    container.setAttribute('data-events-bound', 'true');

    container.addEventListener('click', (e) => {
        const target = e.target;
        
        const viewBtn = target.closest('[data-view-id]');
        const inqBtn = target.closest('[data-inquiry-id]');
        const saveBtn = target.closest('[data-save-id]');

        if (saveBtn) {
            e.preventDefault();
            e.stopPropagation();
            handleDatabaseSaveProcess(saveBtn.getAttribute('data-save-id'));
            return;
        }

        if (inqBtn) {
            e.preventDefault();
            e.stopPropagation();
            openInquiryModalDisplay(inqBtn.getAttribute('data-inquiry-id'));
            return;
        }

        if (viewBtn) {
            e.preventDefault();
            window.location.href = `details.html?id=${viewBtn.getAttribute('data-view-id')}`;
        }
    });
}

// --- CLOUD BOOKMARKS SYNCHRONIZATION VAULT ---
function handleDatabaseSaveProcess(id) {
    let savedList = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];
    const index = savedList.indexOf(id);
    const matchedObj = masterRoomRecords.find(p => p.id === id);
    if (!matchedObj) return;

    if (currentSessionUID) {
        const nodeRef = ref(database, `users_saved/${currentSessionUID}/${id}`);
        if (index === -1) {
            set(nodeRef, { 
                id: id, 
                name: matchedObj.name || matchedObj.title || "Premium Space", 
                price: matchedObj.price || matchedObj.rent || 0,
                image: matchedObj.image || matchedObj.imageUrl || '',
                location: matchedObj.location || matchedObj.area || 'Premium Area',
                badge: matchedObj.badge || '',
                verified: matchedObj.verified || false
            });
        } else {
            remove(nodeRef);
        }
    }

    if (index === -1) {
        savedList.push(id);
    } else {
        savedList.splice(index, 1);
    }
    localStorage.setItem('staypremium_saved_properties', JSON.stringify(savedList));
    renderRoomDataViewGrid();
}

// --- INQUIRY SUBMISSION LEAD MANAGEMENT CONTROLLER ---
function setupInquiryModalMarkup() {
    if (document.getElementById('inquiry-modal')) return;
    const modalHTML = `
        <div id="inquiry-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; justify-content:center; align-items:center; padding:15px;">
            <div style="background:#ffffff; width:100%; max-width:400px; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.25);">
                <div style="background:#800020; color:#fff; padding:15px; display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; font-size:16px; color:#fff;">Instant Booking Hub</h3>
                    <span id="close-inq-modal" style="cursor:pointer; font-size:22px; font-weight:bold; color:#fff;">&times;</span>
                </div>
                <form id="inquiry-form" style="padding:20px; display:flex; flex-direction:column; gap:12px;">
                    <input type="hidden" id="inq-prop-id">
                    <div>
                        <input type="text" id="inq-client-name" placeholder="Your Full Name" required style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box;">
                    </div>
                    <div>
                        <input type="tel" id="inq-client-phone" placeholder="10-Digit Mobile" required pattern="[0-9]{10}" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box;">
                    </div>
                    <div>
                        <textarea id="inq-client-msg" placeholder="Any specific instructions..." rows="3" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; resize:none; box-sizing:border-box;"></textarea>
                    </div>
                    <button type="submit" style="background:#800020; color:#fff; border:none; padding:10px; border-radius:6px; font-weight:700; cursor:pointer;">Submit Booking Details</button>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('inquiry-modal');
    const closeBtn = document.getElementById('close-inq-modal');
    const form = document.getElementById('inquiry-form');

    if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            commitInquiryToCloudDatabase();
        };
    }
}

function openInquiryModalDisplay(id) {
    if (!currentSessionUID) {
        alert("Authentication required. Please log in first.");
        window.location.href = "login.html";
        return;
    }
    
    document.getElementById('inq-prop-id').value = id;
    const modal = document.getElementById('inquiry-modal');
    if (modal) modal.style.display = 'flex';
}

function commitInquiryToCloudDatabase() {
    const propId = document.getElementById('inq-prop-id').value;
    const name = document.getElementById('inq-client-name').value;
    const phone = document.getElementById('inq-client-phone').value;
    const msg = document.getElementById('inq-client-msg').value;

    const currentTargetObject = masterRoomRecords.find(p => p.id === propId);
    const resolvedTitle = currentTargetObject ? (currentTargetObject.name || currentTargetObject.title) : "Premium Listing Inquiry";

    const payload = {
        propertyId: propId,
        propertyName: resolvedTitle,
        clientName: name,
        clientPhone: phone,
        message: msg,
        userId: currentSessionUID || "anonymous_lead",
        timestamp: Date.now(),
        date: new Date().toLocaleString('en-IN')
    };

    Promise.all([
        set(push(ref(database, 'inquiries')), payload),
        set(push(ref(database, 'leads_inquiries')), payload)
    ]).then(() => {
        alert("Inquiry Sent Successfully!");
        document.getElementById('inquiry-modal').style.display = 'none';
        document.getElementById('inquiry-form').reset();
    }).catch(err => {
        console.error("Database error:", err);
    });
}