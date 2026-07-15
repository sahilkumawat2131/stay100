/**
 * StayPremium - Premium PG & Realtime Multi-Filter Database Engine (room.js)
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, push, set, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

let masterRoomRecords = [];
let selectedActiveTagFilter = "all";
let currentUser = null;
let currentSessionUID = localStorage.getItem('staypremium_uid') || null;

let userLatitude = null;
let userLongitude = null;
let isNearMeActive = false;

// DOM Lifecycle Engine
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

    // Hide / Show Side Filter Engine Core
    if (showFilterBtn && sidebarPanel) {
        showFilterBtn.addEventListener('click', () => {
            sidebarPanel.classList.toggle('hidden'); // Desktop Toggle
            sidebarPanel.classList.toggle('active'); // Mobile Drawer Open
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
            renderRoomDataViewGrid();
        });
    }

    // Reset All System Filters
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            document.querySelectorAll('.prop-type-filter, .sharing-filter, .furnish-filter, .amenity-filter').forEach(el => el.checked = false);
            if(budgetSlider) budgetSlider.value = 60000;
            if(sliderLabel) sliderLabel.innerText = "₹60,000";
            document.querySelector('[name="genderPref"][value="all"]').checked = true;
            renderRoomDataViewGrid();
        });
    }

    // Attach Event Listeners to all Input Fields in Sidebar
    document.querySelectorAll('.prop-type-filter, .sharing-filter, .furnish-filter, .amenity-filter, name="genderPref"').forEach(element => {
        element.addEventListener('change', renderRoomDataViewGrid);
    });
    document.getElementsByName('genderPref').forEach(radio => radio.addEventListener('change', renderRoomDataViewGrid));

    // Near Me GPS Tracking Engine
    if (nearMeBtn) {
        nearMeBtn.addEventListener('click', () => {
            if (isNearMeActive) {
                isNearMeActive = false;
                nearMeBtn.style.background = "#800020";
                nearMeBtn.querySelector('span').innerText = "Near Me";
                renderRoomDataViewGrid();
                return;
            }
            navigator.geolocation.getCurrentPosition((pos) => {
                userLatitude = pos.coords.latitude;
                userLongitude = pos.coords.longitude;
                isNearMeActive = true;
                nearMeBtn.style.background = "#10b981";
                nearMeBtn.querySelector('span').innerText = "Nearby Active";
                renderRoomDataViewGrid();
            });
        });
    }

    // Firebase Data Capture Node
    const propertiesNodeRef = ref(database, 'properties');
    onValue(propertiesNodeRef, (snapshot) => {
        const rawPayload = snapshot.val();
        if(rawPayload) {
            masterRoomRecords = Object.keys(rawPayload).map(key => ({ id: key, ...rawPayload[key] }));
            renderRoomDataViewGrid();
        }
    });

    if (searchInput) searchInput.addEventListener('input', renderRoomDataViewGrid);

    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            selectedActiveTagFilter = tag.dataset.type;
            renderRoomDataViewGrid();
        });
    });
});

// --- LOCAL LANGUAGE & HINGLISH PARSER DICTIONARY ---
function processSmartSearchDictionary(queryStr) {
    let output = queryStr.toLowerCase().trim();
    
    // Hinglish Mapping Rules
    if(output.includes("ladko ke liye") || output.includes("boy pg")) output += " boys";
    if(output.includes("ladkio ke liye") || output.includes("girl pg") || output.includes("larki")) output += " girls";
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
    
    // Capture Sidebar States Live
    const maxBudget = parseFloat(document.getElementById('budgetRangeSlider')?.value || 60000);
    const selectedGender = document.querySelector('input[name="genderPref"]:checked')?.value || "all";
    
    const checkedTypes = Array.from(document.querySelectorAll('.prop-type-filter:checked')).map(el => el.value);
    const checkedSharing = Array.from(document.querySelectorAll('.sharing-filter:checked')).map(el => el.value);
    const checkedFurnishing = Array.from(document.querySelectorAll('.furnish-filter:checked')).map(el => el.value);
    const checkedAmenities = Array.from(document.querySelectorAll('.amenity-filter:checked')).map(el => el.value);

    let processedResultPool = masterRoomRecords.filter(post => {
        const title = (post.name || post.title || "").toLowerCase();
        const location = (post.area || post.location || "").toLowerCase();
        const type = (post.type || "").toLowerCase();
        const price = parseFloat(post.price || post.rent || 0);
        const genderAllowed = (post.gender || "all").toLowerCase();
        const furnishStatus = (post.furnishing || "").toLowerCase();
        const description = (post.desc || post.description || "").toLowerCase();
        const amnsList = Array.isArray(post.amenities) ? post.amenities.map(a => a.toLowerCase()) : [];

        // 1. Budget Filter
        if (price > maxBudget) return false;

        // 2. Gender Preference Filter
        if (selectedGender !== "all" && genderAllowed !== "all" && genderAllowed !== selectedGender) return false;

        // 3. BHK/Property Type Sidebar Dynamic Checkbox Array
        if (checkedTypes.length > 0) {
            const matchType = checkedTypes.some(t => type.includes(t) || title.includes(t));
            if (!matchType) return false;
        }

        // 4. PG Sharing Options Filter
        if (checkedSharing.length > 0) {
            const matchSharing = checkedSharing.some(s => type.includes(s) || title.includes(s) || description.includes(s));
            if (!matchSharing) return false;
        }

        // 5. Furnishing Status Check
        if (checkedFurnishing.length > 0) {
            const matchFurnish = checkedFurnishing.some(f => furnishStatus.includes(f) || title.includes(f));
            if (!matchFurnish) return false;
        }

        // 6. Amenities Checklist Evaluation Loop
        if (checkedAmenities.length > 0) {
            const hasAllAmns = checkedAmenities.every(a => amnsList.includes(a) || description.includes(a));
            if (!hasAllAmns) return false;
        }

        // 7. AI Header Badges Quick Filter Tags Layer
        if (selectedActiveTagFilter !== "all") {
            if (selectedActiveTagFilter === "furnished" && !title.includes("furnished") && furnishStatus !== "fully") return false;
            if (selectedActiveTagFilter !== "furnished" && !type.includes(selectedActiveTagFilter) && !title.includes(selectedActiveTagFilter)) return false;
        }

        // 8. Smart Dynamic Search Text Processing Engine
        if (keywordStr !== '') {
            const matchSearch = title.includes(keywordStr) || location.includes(keywordStr) || 
                                type.includes(keywordStr) || description.includes(keywordStr);
            if (!matchSearch) return false;
        }

        return true;
    });

    // Dynamic Render View DOM Injector
    if(processedResultPool.length === 0) {
        container.innerHTML = `<div class="loader-text">Oops! Koi matching flat ya PG nahi mila. Filter reset karke dekhein.</div>`;
        return;
    }

    const savedList = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];
    container.innerHTML = processedResultPool.map(item => window.PropertyCardComponent.render(item, savedList)).join('');
}