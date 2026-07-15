/**
 * StayPremium - Advanced Realtime Data Management & AI Suggestion Pipeline
 * Purely Filtering PG Category & Organizing into Dynamic Matrices
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

// Data Matrices States
let masterPGRecords = [];
let selectedActiveTagFilter = "all";
let currentSessionUID = localStorage.getItem('staypremium_uid') || null;
let currentSelectedCity = localStorage.getItem('staypremium_selected_city') || "all";

// AI Autocomplete Keywords List
const aiKeywordsList = [
    { text: "Food Included", type: "amenity", matches: ["food", "mess", "khana", "meals"] },
    { text: "AC Available", type: "amenity", matches: ["ac", "air conditioner", "cooler"] },
    { text: "Single Sharing", type: "room", matches: ["single", "1 sharing", "alone", "private"] },
    { text: "Double Sharing", type: "room", matches: ["double", "2 sharing", "shared"] },
    { text: "Triple Sharing", type: "room", matches: ["triple", "3 sharing"] },
    { text: "Fully Furnished", type: "furnishing", matches: ["furnished", "luxury", "bed"] },
    { text: "Low Budget Spaces", type: "budget", matches: ["budget", "cheap", "low price", "affordable"] }
];

// Tracking Live Authentication Context
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentSessionUID = user.uid;
        localStorage.setItem('staypremium_uid', user.uid);
    }
    renderStructuredPGLayout();
});

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('pg-search-input');
    const voiceBtn = document.getElementById('voice-search-trigger');
    const filterTags = document.querySelectorAll('.filter-tag');
    const aiDropdown = document.getElementById('ai-autocomplete-dropdown');

    // Create and Insert Modular Modal Element Dynamically
    setupInquiryModalMarkup();

    // CONNECT TO FIREBASE & ENFORCE STRICT "PG" FILTER
    const propertiesNodeRef = ref(database, 'properties');
    onValue(propertiesNodeRef, (snapshot) => {
        const rawPayload = snapshot.val();
        if(rawPayload) {
            // STRICT EXTRACTION FILTER FOR CATEGORY "PG" ONLY
            masterPGRecords = Object.keys(rawPayload).map(key => ({ id: key, ...rawPayload[key] }))
                                      .filter(item => item.category && item.category.toLowerCase() === 'pg');
            renderStructuredPGLayout();
        }
    });

    // Realtime Keyboard Evaluation Listener
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            handleAIAutocompleteDiagnostics(e.target.value);
            renderStructuredPGLayout();
        });

        // Tap to reveal all tags inside autocomplete suggestion bank
        searchInput.addEventListener('focus', () => {
            handleAIAutocompleteDiagnostics(searchInput.value || "");
        });
    }

    // Dismiss Suggestion Lists if user clicks outside
    document.addEventListener('click', (e) => {
        if (aiDropdown && !searchInput.contains(e.target) && !aiDropdown.contains(e.target)) {
            aiDropdown.style.display = 'none';
        }
    });

    // Filter Navigation Tags Pipeline Click Bindings
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            selectedActiveTagFilter = tag.dataset.type;
            renderStructuredPGLayout();
        });
    });

    // Voice Engine Integration Loop
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
                searchInput.value = e.results[0][0].transcript;
                searchInput.placeholder = "Search premium PGs by area, landmark, budget...";
                renderStructuredPGLayout();
            };
        } else { voiceBtn.style.display = 'none'; }
    }
});

// AI ENGINE: SMART AUTOSUGGEST CONFIGURATION DROPDOWN
function handleAIAutocompleteDiagnostics(typedPhrase) {
    const dropdown = document.getElementById('ai-autocomplete-dropdown');
    if (!dropdown) return;

    const term = typedPhrase.toLowerCase().trim();
    
    // If input is clean/empty, show top trending contextual tags as baseline suggestions
    const filteredKeywords = aiKeywordsList.filter(item => {
        if(term === "") return true; // Show all on empty click context
        return item.text.toLowerCase().includes(term) || item.matches.some(m => m.includes(term));
    });

    if (filteredKeywords.length === 0) {
        dropdown.style.display = 'none';
        return;
    }

    dropdown.innerHTML = filteredKeywords.map(keyword => `
        <div class="ai-dropdown-item" data-value="${keyword.text}">
            <i class="fa-solid fa-wand-magic-sparkles" style="color:#800020;"></i>
            <span>${keyword.text}</span>
            <span class="badge-type">${keyword.type}</span>
        </div>
    `).join('');

    dropdown.style.display = 'block';

    // Click interceptors for dropdown tags
    dropdown.querySelectorAll('.ai-dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            const chosenVal = item.getAttribute('data-value');
            const searchInput = document.getElementById('pg-search-input');
            searchInput.value = chosenVal;
            dropdown.style.display = 'none';
            
            // Map the selected string directly to target specific filter elements tags
            mapKeywordToActiveFilterTags(chosenVal);
            renderStructuredPGLayout();
        });
    });
}

function mapKeywordToActiveFilterTags(value) {
    const filterTags = document.querySelectorAll('.filter-tag');
    let targetType = "all";

    if (value.includes("Food")) targetType = "food included";
    else if (value.includes("AC")) targetType = "ac";
    else if (value.includes("Single")) targetType = "single room";
    else if (value.includes("Double")) targetType = "double sharing";
    else if (value.includes("Triple")) targetType = "triple sharing";
    else if (value.includes("Fully")) targetType = "fully furnished";
    else if (value.includes("Budget")) targetType = "budget";

    filterTags.forEach(t => {
        t.classList.remove('active');
        if(t.dataset.type === targetType) t.classList.add('active');
    });
    selectedActiveTagFilter = targetType;
}

// COMPREHENSIVE COMPONENT-BASED MATRIX RENDERING PIPELINE
function renderStructuredPGLayout() {
    const queryInput = document.getElementById('pg-search-input');
    const keywordStr = queryInput ? queryInput.value.toLowerCase().trim() : '';
    const savedList = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];
    currentSelectedCity = (localStorage.getItem('staypremium_selected_city') || "all").toLowerCase().trim();

    // 1. Core Filtration Logic Applied across data streams
    let compiledPGList = masterPGRecords.filter(post => {
        // Enforce city selection rules
        const propertyCity = (post.city || "").toLowerCase().trim();
        if (currentSelectedCity !== "all" && currentSelectedCity !== "all cities" && currentSelectedCity !== "") {
            if (propertyCity !== currentSelectedCity) return false;
        }

        // Apply input string search tags lookup values
        const nameMatch = (post.name || post.title || "").toLowerCase().includes(keywordStr);
        const areaMatch = (post.area || post.location || "").toLowerCase().includes(keywordStr);
        const searchValidity = nameMatch || areaMatch || keywordStr === "";

        if(!searchValidity) return false;

        // Apply Active Filter Badges Rules Matrix
        const filterTypeNormalized = selectedActiveTagFilter.toLowerCase().trim();
        if(filterTypeNormalized === "all") return true;
        if(filterTypeNormalized === "single room") return post.sharingType && post.sharingType.toLowerCase().includes('single');
        if(filterTypeNormalized === "double sharing") return post.sharingType && post.sharingType.toLowerCase().includes('double');
        if(filterTypeNormalized === "triple sharing") return post.sharingType && post.sharingType.toLowerCase().includes('triple');
        if(filterTypeNormalized === "fully furnished") return post.furnishedType && post.furnishedType.toLowerCase().includes('fully');
        if(filterTypeNormalized === "food included") return post.food === true || post.mess === true || post.foodIncluded === true;
        if(filterTypeNormalized === "ac") return post.ac === true || post.airConditioner === true;
        if(filterTypeNormalized === "budget") return parseInt(post.price || post.rent || 0, 10) <= 8000;
        
        return true;
    });

    // Capture specific Grid Targets Nodes Elements
    const gridTrending = document.getElementById('grid-trending');
    const gridPreferred = document.getElementById('grid-preferred');
    const gridRecommended = document.getElementById('grid-recommended');
    const gridLatest = document.getElementById('grid-latest');

    // Section Display Wrapper References
    const wrapTrending = document.getElementById('sec-trending-wrapper');
    const wrapPreferred = document.getElementById('sec-preferred-wrapper');
    const wrapLatest = document.getElementById('sec-latest-wrapper');

    // Clear grids to prevent residual injection nodes duplication
    gridTrending.innerHTML = '';
    gridPreferred.innerHTML = '';
    gridRecommended.innerHTML = '';
    gridLatest.innerHTML = '';

    if (compiledPGList.length === 0) {
        gridRecommended.innerHTML = `
            <div style="grid-column:1/-1; display:flex; flex-direction:column; align-items:center; padding:50px 20px; text-align:center; width:100%;">
                <i class="fa-solid fa-folder-open" style="font-size:48px; color:#cbd5e1; margin-bottom:15px;"></i>
                <h4 style="margin:0; color:#475569;">No Premium PG Spaces match the criteria.</h4>
            </div>`;
        wrapTrending.style.display = 'none';
        wrapPreferred.style.display = 'none';
        wrapLatest.style.display = 'none';
        return;
    }

    // Distribute item segments systematically across array nodes structures
    compiledPGList.forEach((item, index) => {
        const cardMarkup = buildPGCardItemString(item, savedList);
        
        // 1. Trending Sections Rule Matrix: Items with maximum views
        if (item.viewsCount > 150 || index === 0 || item.trending === true) {
            wrapTrending.style.display = 'block';
            gridTrending.insertAdjacentHTML('beforeend', cardMarkup);
        }
        
        // 2. Stay100% Preferred Section Rules Matrix: Super Verified Vendors
        if (item.preferred === true || item.rating >= 4.7) {
            wrapPreferred.style.display = 'block';
            gridPreferred.insertAdjacentHTML('beforeend', cardMarkup);
        }

        // 3. Latest Arrivals Section Rules Matrix: Added recently
        if (index <= 2 || item.isNew === true) {
            wrapLatest.style.display = 'block';
            gridLatest.insertAdjacentHTML('beforeend', cardMarkup);
        }

        // 4. Default Base List Stream Engine Container (Recommended Panel ALWAYS Visible)
        gridRecommended.insertAdjacentHTML('beforeend', cardMarkup);
    });

    bindInteractiveCardDelegates();
}

// MODULAR SUB-ASSEMBLY STYLING MATRIX INSERTER ENGINE
function buildPGCardItemString(item, savedList) {
    const isSaved = savedList.includes(item.id);
    const displaySharing = item.sharingType ? `${item.sharingType} Sharing` : 'Premium Sharing';
    const displayFurnished = item.furnishedType ? `${item.furnishedType}` : 'Furnished';
    const foodStatus = (item.food || item.mess) ? 'Food Inc.' : 'No Food';
    const acStatus = item.ac ? 'AC Room' : 'Non-AC';
    
    // Dynamic Badge Color Config Tree
    let badgeText = "Stay100% Verified";
    let badgeBg = "#10b981"; 
    
    if (item.viewsCount > 150 || item.trending) { badgeText = "TRENDING NOW"; badgeBg = "#ef4444"; }
    else if (item.preferred) { badgeText = "STAY100% PREFERRED"; badgeBg = "#f59e0b"; }

    return `
        <div class="pg-card" data-view-id="${item.id}">
            <button class="card-save-btn ${isSaved ? 'active' : ''}" data-save-id="${item.id}">
                <i class="fa-${isSaved ? 'solid' : 'regular'} fa-heart"></i>
            </button>
            <div class="card-image-box">
                <span class="dynamic-section-badge" style="background:${badgeBg};">${badgeText}</span>
                <img src="${item.image || item.imageUrl || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=500&q=80'}" alt="PG Room View">
            </div>
            <div class="card-content">
                <div class="price-row">
                    <span class="current-price">₹${item.price || item.rent || 'N/A'}</span>
                    <span class="price-period">/ month</span>
                </div>
                <h4 class="pg-title">${item.name || item.title || 'Premium Accommodation'}</h4>
                <div class="location-info">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>${item.location || item.area || 'Premium Zone Area'}</span>
                </div>
                
                <div class="amenities-box">
                    <span class="amenity-tag"><i class="fa-solid fa-user-group"></i> ${displaySharing}</span>
                    <span class="amenity-tag"><i class="fa-solid fa-couch"></i> ${displayFurnished}</span>
                    <span class="amenity-tag"><i class="fa-solid fa-snowflake"></i> ${acStatus}</span>
                    <span class="amenity-tag"><i class="fa-solid fa-utensils"></i> ${foodStatus}</span>
                </div>

                <div class="card-actions">
                    <button class="btn-details" data-nav-id="${item.id}">View Details</button>
                    <button class="btn-inquiry" data-inquiry-id="${item.id}">Book Inquire</button>
                </div>
            </div>
        </div>
    `;
}

// BIND INTERACTIVE ACTIONS TO DYNAMIC GRAPHICAL CARDS
function bindInteractiveCardDelegates() {
    const masterContainer = document.getElementById('pg-sections-master-wrapper');
    if (!masterContainer) return;

    // Remove legacy events to prevent duplicate event triggering
    masterContainer.removeAttribute('data-attached');

    masterContainer.onclick = (e) => {
        const viewCard = e.target.closest('[data-view-id]');
        const saveBtn = e.target.closest('[data-save-id]');
        const inqBtn = e.target.closest('[data-inquiry-id]');
        const navBtn = e.target.closest('[data-nav-id]');

        if (saveBtn) {
            e.stopPropagation();
            handleDatabaseSaveProcess(saveBtn.getAttribute('data-save-id'));
            return;
        }

        if (inqBtn) {
            e.stopPropagation();
            openInquiryModalDisplay(inqBtn.getAttribute('data-inquiry-id'));
            return;
        }

        if (navBtn || viewCard) {
            const finalId = navBtn ? navBtn.getAttribute('data-nav-id') : viewCard.getAttribute('data-view-id');
            window.location.href = `details.html?id=${finalId}`;
        }
    };
}

// SAVES BOOKMARKS TO FIREBASE VAULT AND SYNC LOCAL STORAGE
function handleDatabaseSaveProcess(id) {
    if(!currentSessionUID) {
        alert("Authentication required. Please log in first.");
        window.location.href = 'login.html';
        return;
    }
    let savedList = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];
    const index = savedList.indexOf(id);
    const nodeRef = ref(database, `users_saved/${currentSessionUID}/${id}`);

    if (index === -1) {
        set(nodeRef, { id: id, timestamp: Date.now() }).then(() => {
            savedList.push(id);
            localStorage.setItem('staypremium_saved_properties', JSON.stringify(savedList));
            renderStructuredPGLayout();
        });
    } else {
        remove(nodeRef).then(() => {
            savedList = savedList.filter(item => item !== id);
            localStorage.setItem('staypremium_saved_properties', JSON.stringify(savedList));
            renderStructuredPGLayout();
        });
    }
}

// INQUIRY MODAL DISPLAY SYSTEM CONTROL
function setupInquiryModalMarkup() {
    if(document.getElementById('inquiry-modal')) return;
    const modalHTML = `
        <div id="inquiry-modal" class="inq-modal-overlay" style="display:none;">
            <div class="inq-modal-card">
                <div style="background:#800020; color:#fff; padding:15px 20px; display:flex; justify-content:between; align-items:center;">
                    <h3 style="margin:0; font-size:16px;">Instant Slots Booking Hub</h3>
                    <span id="close-inq-modal" style="cursor:pointer; font-size:20px; font-weight:bold; margin-left:auto;">&times;</span>
                </div>
                <form id="inquiry-form" style="padding:20px; display:flex; flex-direction:column; gap:12px;">
                    <input type="hidden" id="inq-prop-id">
                    <input type="text" id="inq-client-name" placeholder="Your Full Name" required style="padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
                    <input type="tel" id="inq-client-phone" placeholder="10-Digit Phone" required style="padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
                    <textarea id="inq-client-msg" placeholder="Write requirements (e.g. food preference, shifting date...)" rows="3" style="padding:10px; border:1px solid #cbd5e1; border-radius:8px; resize:none;"></textarea>
                    <button type="submit" style="background:#800020; color:#fff; border:none; padding:12px; border-radius:8px; font-weight:700; cursor:pointer;">Submit Booking Lead</button>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('inquiry-modal');
    document.getElementById('close-inq-modal').onclick = () => modal.style.display = 'none';
    document.getElementById('inquiry-form').onsubmit = (e) => {
        e.preventDefault();
        commitInquiryToCloudDatabase();
    };
}

function openInquiryModalDisplay(id) {
    if(!currentSessionUID) {
        alert("Please Login to send inquiries.");
        window.location.href = "login.html";
        return;
    }
    document.getElementById('inq-prop-id').value = id;
    document.getElementById('inquiry-modal').style.display = 'flex';
}

function commitInquiryToCloudDatabase() {
    const propId = document.getElementById('inq-prop-id').value;
    const name = document.getElementById('inq-client-name').value;
    const phone = document.getElementById('inq-client-phone').value;
    const msg = document.getElementById('inq-client-msg').value;

    const newInqRef = push(ref(database, 'inquiries'));
    const payload = {
        inquiryId: newInqRef.key,
        propertyId: propId,
        clientName: name,
        clientPhone: phone,
        clientMessage: msg,
        userId: currentSessionUID,
        timestamp: Date.now()
    };

    set(newInqRef, payload).then(() => {
        alert("Inquiry Dispatched Successfully!");
        document.getElementById('inquiry-modal').style.display = 'none';
        document.getElementById('inquiry-form').reset();
    });
}