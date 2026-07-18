/**
 * StayPremium - Advanced Realtime Data Management & AI Suggestion Pipeline
 * Purely Filtering PG Category & Organizing into Dynamic Matrices
 * Updated to synchronize property card models with index.js and profile.js structural engine
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

    // [शुरुआती लोड] जब तक Firebase डेटा नहीं दे देता, स्क्रीन पर लोगो एनीमेशन दिखाएं
    showInitialLogoLoader();

    // CONNECT TO FIREBASE & ENFORCE STRICT "PG" FILTER
    const propertiesNodeRef = ref(database, 'properties');
    onValue(propertiesNodeRef, (snapshot) => {
        const rawPayload = snapshot.val();
        if(rawPayload) {
            // STRICT EXTRACTION FILTER FOR CATEGORY "PG" ONLY
            masterPGRecords = Object.keys(rawPayload).map(key => ({ id: key, ...rawPayload[key] }))
                                              .filter(item => item.category && item.category.toLowerCase() === 'pg');
            
            // डेटा आते ही एनीमेशन रुक जाएगा और लिस्ट दिख जाएगी
            renderStructuredPGLayout();
        } else {
            // अगर डेटा बिल्कुल खाली हो
            renderStructuredPGLayout();
        }
    });

    // Realtime Keyboard Evaluation Listener
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            handleAIAutocompleteDiagnostics(e.target.value);
            renderStructuredPGLayout();
        });

        searchInput.addEventListener('focus', () => {
            handleAIAutocompleteDiagnostics(searchInput.value || "");
        });
    }

    document.addEventListener('click', (e) => {
        if (aiDropdown && !searchInput.contains(e.target) && !aiDropdown.contains(e.target)) {
            aiDropdown.style.display = 'none';
        }
    });

    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            selectedActiveTagFilter = tag.dataset.type;
            renderStructuredPGLayout();
        });
    });

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

// [नया फंक्शन] ग्रिड्स में प्रारंभिक लोडर सेट करने के लिए
function showInitialLogoLoader() {
    const gridRecommended = document.getElementById('grid-recommended');
    if (!gridRecommended) return;

    const loaderHTML = `
        <div class="firebase-loading-wrapper" style="grid-column: 1 / -1; width:100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; text-align: center;">
            <div class="logo-animation-container">
                <img src="/assets/vendor logo.png" alt="Loading..." class="pulse-logo" style="width: 85px; height: auto; margin-bottom: 18px;">
            </div>
            <div class="loading-bar-container" style="width: 140px; height: 4px; background: #f3f4f6; border-radius: 10px; overflow: hidden; position: relative;">
                <div class="loading-bar-fill" style="position: absolute; width: 50%; height: 100%; background: #800020; border-radius: 10px; animation: loadingSlide 1.5s infinite ease-in-out;"></div>
            </div>
            <p style="color: #6b7280; font-size: 13px; font-weight: 500; margin-top: 14px; font-family: sans-serif; letter-spacing: 0.5px;">Loading Stay100%...</p>
        </div>
    `;
    gridRecommended.innerHTML = loaderHTML;
}

// AI ENGINE: SMART AUTOSUGGEST CONFIGURATION DROPDOWN
function handleAIAutocompleteDiagnostics(typedPhrase) {
    const dropdown = document.getElementById('ai-autocomplete-dropdown');
    if (!dropdown) return;

    const term = typedPhrase.toLowerCase().trim();
    
    const filteredKeywords = aiKeywordsList.filter(item => {
        if(term === "") return true; 
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

    dropdown.querySelectorAll('.ai-dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            const chosenVal = item.getAttribute('data-value');
            const searchInput = document.getElementById('pg-search-input');
            searchInput.value = chosenVal;
            dropdown.style.display = 'none';
            
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

// COMPREHENSIVE COMPONENT-BASED MATRIX RENDELINE
function renderStructuredPGLayout() {
    const queryInput = document.getElementById('pg-search-input');
    const keywordStr = queryInput ? queryInput.value.toLowerCase().trim() : '';
    const savedList = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];
    currentSelectedCity = (localStorage.getItem('staypremium_selected_city') || "all").toLowerCase().trim();

    // 1. Core Filtration Logic
    let compiledPGList = masterPGRecords.filter(post => {
        const propertyCity = (post.city || "").toLowerCase().trim();
        if (currentSelectedCity !== "all" && currentSelectedCity !== "all cities" && currentSelectedCity !== "") {
            if (propertyCity !== currentSelectedCity) return false;
        }

        const nameMatch = (post.name || post.title || "").toLowerCase().includes(keywordStr);
        const areaMatch = (post.area || post.location || "").toLowerCase().includes(keywordStr);
        const searchValidity = nameMatch || areaMatch || keywordStr === "";

        if(!searchValidity) return false;

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

    const gridTrending = document.getElementById('grid-trending');
    const gridPreferred = document.getElementById('grid-preferred');
    const gridRecommended = document.getElementById('grid-recommended');
    const gridLatest = document.getElementById('grid-latest');

    const wrapTrending = document.getElementById('sec-trending-wrapper');
    const wrapPreferred = document.getElementById('sec-preferred-wrapper');
    const wrapLatest = document.getElementById('sec-latest-wrapper');

    if (!gridTrending || !gridPreferred || !gridRecommended || !gridLatest) return;

    gridTrending.innerHTML = '';
    gridPreferred.innerHTML = '';
    gridRecommended.innerHTML = '';
    gridLatest.innerHTML = '';

    if (compiledPGList.length === 0) {
        gridRecommended.innerHTML = `
            <div style="grid-column:1/-1; display:flex; flex-direction:column; align-items:center; padding:50px 20px; text-align:center; width:100%; font-family:sans-serif;">
                <i class="fa-solid fa-folder-open" style="font-size:48px; color:#cbd5e1; margin-bottom:15px;"></i>
                <h4 style="margin:0; color:#475569;">No Premium PG Spaces match the criteria.</h4>
            </div>`;
        if(wrapTrending) wrapTrending.style.display = 'none';
        if(wrapPreferred) wrapPreferred.style.display = 'none';
        if(wrapLatest) wrapLatest.style.display = 'none';
        return;
    }

    compiledPGList.forEach((item, index) => {
        const cardMarkup = buildPGCardItemString(item, savedList);
        
        if (wrapTrending && (item.viewsCount > 150 || index === 0 || item.trending === true)) {
            wrapTrending.style.display = 'block';
            gridTrending.insertAdjacentHTML('beforeend', cardMarkup);
        }
        
        if (wrapPreferred && (item.preferred === true || item.rating >= 4.7)) {
            wrapPreferred.style.display = 'block';
            gridPreferred.insertAdjacentHTML('beforeend', cardMarkup);
        }

        if (wrapLatest && (index <= 2 || item.isNew === true)) {
            wrapLatest.style.display = 'block';
            gridLatest.insertAdjacentHTML('beforeend', cardMarkup);
        }

        gridRecommended.insertAdjacentHTML('beforeend', cardMarkup);
    });

    bindInteractiveCardDelegates();
}

// MODULAR SUB-ASSEMBLY STYLING MATRIX INSERTER ENGINE (With Auto-Sliding Progress Dots Animation)
function buildPGCardItemString(item, savedList) {
    const isSaved = savedList.includes(item.id);
    
    // 1. Gender Formatting & Badges
    let genderSuffix = '';
    const cleanGender = (item.gender || "").toLowerCase().trim();
    if (cleanGender === "boys" || cleanGender === "boy") {
        genderSuffix = " for Boys";
    } else if (cleanGender === "girls" || cleanGender === "girl") {
        genderSuffix = " for Girls";
    }

    // 2. Amenities Tag Generation
    let amenitiesHTML = '';
    if (item.food || item.mess || item.foodIncluded) {
        amenitiesHTML += `<span style="background: #f1f5f9; color: #334155; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;"><i class="fa-solid fa-utensils"></i> Food</span>`;
    }
    if (item.parking) {
        amenitiesHTML += `<span style="background: #f1f5f9; color: #334155; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;"><i class="fa-solid fa-car"></i> Parking</span>`;
    }
    if (!amenitiesHTML) {
        amenitiesHTML = `
            <span style="background: #f1f5f9; color: #334155; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;"><i class="fa-solid fa-utensils"></i> Food</span>
            <span style="background: #f1f5f9; color: #334155; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;"><i class="fa-solid fa-car"></i> Parking</span>
        `;
    }

    const fakeViews = item.viewsCount || Math.floor(Math.random() * 30) + 15;
    const fakeCalls = Math.floor(fakeViews * 0.6) || 12;

    // CSS Keyframes Animation and Style Injector for Auto-sliding dots indicator
    if (!document.getElementById('autoslide-keyframes')) {
        const styleSheet = document.createElement("style");
        styleSheet.id = "autoslide-keyframes";
        styleSheet.innerText = `
            @keyframes dotSequence {
                0%, 20% { width: 16px; background: #ffffff; border-radius: 3px; }
                25%, 95% { width: 5px; background: rgba(255,255,255,0.4); border-radius: 50%; }
            }
            @keyframes dotSequenceTwo {
                0%, 20% { width: 5px; background: rgba(255,255,255,0.4); border-radius: 50%; }
                25%, 45% { width: 16px; background: #ffffff; border-radius: 3px; }
                50%, 95% { width: 5px; background: rgba(255,255,255,0.4); border-radius: 50%; }
            }
            @keyframes dotSequenceThree {
                0%, 45% { width: 5px; background: rgba(255,255,255,0.4); border-radius: 50%; }
                50%, 70% { width: 16px; background: #ffffff; border-radius: 3px; }
                75%, 95% { width: 5px; background: rgba(255,255,255,0.4); border-radius: 50%; }
            }
        `;
        document.head.appendChild(styleSheet);
    }

    return `
        <div class="property-card" style="background: #ffffff; border-radius: 20px; padding: 16px; box-shadow: 0 4px 18px rgba(0,0,0,0.06); border: 1px solid #f1f5f9; position: relative; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            
            <!-- Image Area Wrapper -->
            <div class="card-image-box" style="width: 100%; height: 240px; border-radius: 14px; overflow: hidden; position: relative; margin-bottom: 16px;">
                <img src="${item.image || item.imageUrl || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=500&q=80'}" alt="PG Room View" style="width: 100%; height: 100%; object-fit: cover;">
                
                <!-- Top Left Category Tag -->
                <span style="position: absolute; top: 12px; left: 12px; background: rgba(15, 23, 42, 0.85); color: #ffffff; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;">PG</span>
                
                <!-- Top Right Bookmark/Save Trigger -->
                <button class="card-save-btn ${isSaved ? 'active' : ''}" data-save-id="${item.id}" style="position: absolute; top: 12px; right: 12px; background: #ffffff; border: none; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                    <i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark" style="color: ${isSaved ? '#800020' : '#334155'}; font-size: 16px;"></i>
                </button>

                <!-- Bottom Left Image Count Overlay -->
                <span style="position: absolute; bottom: 12px; left: 12px; background: rgba(15, 23, 42, 0.65); color: #ffffff; padding: 4px 8px; border-radius: 6px; font-size: 12px; display: flex; align-items: center; gap: 6px;">
                    <i class="fa-regular fa-image"></i> 7
                </span>

                <!-- Bottom Image Slider Dot Indicator Ticker -->
                <div style="position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 4px; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 10px; align-items: center;">
                    <span style="height: 5px; animation: dotSequence 8s infinite ease-in-out;"></span>
                    <span style="height: 5px; animation: dotSequenceTwo 8s infinite ease-in-out;"></span>
                    <span style="height: 5px; animation: dotSequenceThree 8s infinite ease-in-out;"></span>
                    <span style="width: 5px; height: 5px; background: rgba(255,255,255,0.4); border-radius: 50%;"></span>
                    <span style="width: 5px; height: 5px; background: rgba(255,255,255,0.4); border-radius: 50%;"></span>
                </div>
            </div>

            <!-- Pricing Model Box -->
            <div style="font-weight: 700; color: #859400; font-size: 22px; margin-bottom: 8px; font-family: sans-serif;">
                ₹${item.price || item.rent || '5000'}<span style="font-size: 16px; font-weight: 600; color: #859400;">/mo</span>
            </div>

            <!-- Main Heading Structural Component -->
            <h4 style="margin: 0 0 8px 0; font-size: 18px; color: #0f172a; font-weight: 700; line-height: 1.3;">
                ${item.name || item.title || 'Premium Accommodation'}${genderSuffix}
            </h4>

            <!-- Rating Interface Block -->
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-size: 14px;">
                <i class="fa-solid fa-star" style="color: #eab308;"></i>
                <span style="font-weight: 700; color: #eab308;">${item.rating || '4.5'}</span>
                <span style="color: #64748b;">(${item.reviewsCount || '12'} reviews)</span>
            </div>

            <!-- Geographic Geolocation Metric Placement -->
            <p style="color: #475569; font-size: 14px; margin: 0 0 16px 0; font-weight: 500; display: flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-location-dot" style="color: #16a34a;"></i> ${item.location || item.area || 'Tonk Road'}, ${item.city || 'Jaipur'}
            </p>

            <!-- Amenities Tags Wrapper Layout Container -->
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
                ${amenitiesHTML}
            </div>

            <!-- Live Performance Analytics Metrics Dashboard Border Container -->
            <div style="border: 1px dashed #cbd5e1; border-radius: 12px; padding: 10px 12px; background: #fafafa; margin-bottom: 20px; font-size: 13px; color: #334155;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; margin-right: 4px;">
                        <span style="width: 20px; height: 20px; border-radius: 50%; background: #cbd5e1; border: 1.5px solid #fff; display: inline-block; background-image: url('https://i.pravatar.cc/100?img=1'); background-size: cover;"></span>
                        <span style="width: 20px; height: 20px; border-radius: 50%; background: #cbd5e1; border: 1.5px solid #fff; display: inline-block; margin-left: -6px; background-image: url('https://i.pravatar.cc/100?img=2'); background-size: cover;"></span>
                        <span style="width: 20px; height: 20px; border-radius: 50%; background: #cbd5e1; border: 1.5px solid #fff; display: inline-block; margin-left: -6px; background-image: url('https://i.pravatar.cc/100?img=3'); background-size: cover;"></span>
                    </div>
                    <span><strong>${fakeViews} users</strong> viewed in last week</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
                    <span style="background: #dcfce7; color: #16a34a; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 4px;">
                        <span style="width: 6px; height: 6px; background: #16a34a; border-radius: 50%; display: inline-block;"></span> Live
                    </span>
                    <span style="display: flex; align-items: center; gap: 4px;"><i class="fa-solid fa-phone" style="color: #16a34a;"></i> <strong>${fakeCalls} users</strong> called this property</span>
                </div>
            </div>

            <!-- Action Button Triggers Blueprint Layout -->
            <div class="card-actions" style="display: flex; gap: 12px;">
                <button data-view-id="${item.id}" style="flex: 1; padding: 12px; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 14px; transition: all 0.2s;">View Details</button>
                <button data-inquiry-id="${item.id}" style="flex: 1; padding: 12px; border: none; background: #800020; color: #ffffff; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 14px; transition: background 0.2s;">Inquiry Now</button>
            </div>
        </div>
    `;
}

// BIND INTERACTIVE ACTIONS TO DYNAMIC GRAPHICAL CARDS
function bindInteractiveCardDelegates() {
    const masterContainer = document.getElementById('pg-sections-master-wrapper');
    if (!masterContainer) return;

    masterContainer.onclick = (e) => {
        const viewCard = e.target.closest('[data-view-id]');
        const saveBtn = e.target.closest('[data-save-id]');
        const inqBtn = e.target.closest('[data-inquiry-id]');

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

        if (viewCard) {
            const finalId = viewCard.getAttribute('data-view-id');
            window.location.href = `details.html?id=${finalId}`;
        }
    };
}

// FIXED: SAVES BOOKMARKS AND ENTIRE PROPERTY CARD ENTITIES TO FIREBASE AND STAYS IN SYNC WITH LOCAL STORAGE
function handleDatabaseSaveProcess(id) {
    let savedList = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];
    const index = savedList.indexOf(id);
    const matchedObj = masterPGRecords.find(p => p.id === id);
    if (!matchedObj) return;

    if (currentSessionUID) {
        const nodeRef = ref(database, `users_saved/${currentSessionUID}/${id}`);
        if (index === -1) {
            // Persist absolute structural properties configuration parameters so profile.js reads complete object variables
            set(nodeRef, {
                id: matchedObj.id,
                name: matchedObj.name || matchedObj.title || "Premium Listing",
                price: matchedObj.price || matchedObj.rent || 0,
                location: matchedObj.location || matchedObj.area || "",
                city: matchedObj.city || "",
                category: matchedObj.category || "PG",
                image: matchedObj.image || matchedObj.imageUrl || "",
                rating: matchedObj.rating || "4.5"
            });
        } else {
            remove(nodeRef);
        }
    }

    if (index === -1) {
        savedList.push(id);
    } else {
        savedList = savedList.filter(item => item !== id);
    }
    
    // Save to unified local storage matrix namespace
    localStorage.setItem('staypremium_saved_properties', JSON.stringify(savedList));
    renderStructuredPGLayout();
}

// INQUIRY MODAL DISPLAY SYSTEM CONTROL
function setupInquiryModalMarkup() {
    if(document.getElementById('inquiry-modal')) return;
    const modalHTML = `
        <div id="inquiry-modal" class="inq-modal-overlay" style="display:none; font-family:sans-serif; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; justify-content:center; align-items:center; padding:15px;">
            <div class="inq-modal-card" style="background:#ffffff; width:100%; max-width:440px; border-radius:16px; overflow:hidden; box-shadow:0 12px 28px rgba(0,0,0,0.25);">
                <div style="background:#800020; color:#fff; padding:18px; display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; font-size:17px; color:#fff;"><i class="fa-solid fa-paper-plane"></i> Instant Slots Booking Hub</h3>
                    <span id="close-inq-modal" style="cursor:pointer; font-size:24px; font-weight:bold; color:#fff;">&times;</span>
                </div>
                <form id="inquiry-form" style="padding:20px; display:flex; flex-direction:column; gap:14px;">
                    <input type="hidden" id="inq-prop-id">
                    <div>
                        <label style="display:block; font-size:12px; font-weight:600; color:#666; margin-bottom:4px;">Full Name</label>
                        <input type="text" id="inq-client-name" placeholder="Your Full Name" required style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; font-weight:600; color:#666; margin-bottom:4px;">Mobile Number</label>
                        <input type="tel" id="inq-client-phone" placeholder="10-Digit Phone" required pattern="[0-9]{10}" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; font-weight:600; color:#666; margin-bottom:4px;">Your Message Requirement</label>
                        <textarea id="inq-client-msg" placeholder="Write requirements (e.g. food preference, shifting date...)" rows="3" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; resize:none;"></textarea>
                    </div>
                    <button type="submit" style="background:#800020; color:#fff; border:none; padding:12px; border-radius:8px; font-weight:700; cursor:pointer; width:100%; font-size:15px;">Submit Booking Lead</button>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('inquiry-modal');
    document.getElementById('close-inq-modal').onclick = () => modal.style.display = 'none';
    
    window.addEventListener('click', (e) => { 
        if (e.target === modal) modal.style.display = 'none'; 
    });

    document.getElementById('inquiry-form').onsubmit = (e) => {
        e.preventDefault();
        commitInquiryToCloudDatabase();
    };
}

function openInquiryModalDisplay(id) {
    if(!currentSessionUID) {
        alert("Authentication required. Please log in first.");
        window.location.href = "login.html";
        return;
    }
    document.getElementById('inq-prop-id').value = id;
    
    if(localStorage.getItem('staypremium_name')) document.getElementById('inq-client-name').value = localStorage.getItem('staypremium_name');
    if(localStorage.getItem('staypremium_phone')) document.getElementById('inq-client-phone').value = localStorage.getItem('staypremium_phone');
    
    document.getElementById('inquiry-modal').style.display = 'flex';
}

function commitInquiryToCloudDatabase() {
    const propId = document.getElementById('inq-prop-id').value;
    const name = document.getElementById('inq-client-name').value;
    const phone = document.getElementById('inq-client-phone').value;
    const msg = document.getElementById('inq-client-msg').value;

    const currentTargetObject = masterPGRecords.find(p => p.id === propId);
    const resolvedTitle = currentTargetObject ? (currentTargetObject.name || currentTargetObject.title) : "Premium Listing Inquiry";
    const absoluteTimestamp = Date.now();

    const payload = {
        propertyId: propId,
        propertyName: resolvedTitle,
        clientName: name,
        clientPhone: phone,
        message: msg,
        userId: currentSessionUID || "anonymous_lead",
        timestamp: absoluteTimestamp,
        date: new Date(absoluteTimestamp).toLocaleString('en-IN')
    };

    const newInqRef = push(ref(database, 'inquiries'));
    const newLeadRef = push(ref(database, 'leads_inquiries'));

    Promise.all([
        set(newInqRef, payload),
        set(newLeadRef, payload)
    ]).then(() => {
        alert("Inquiry Dispatched Successfully!");
        document.getElementById('inquiry-modal').style.display = 'none';
        document.getElementById('inquiry-form').reset();
    }).catch(err => {
        console.error("Database writing operational failure:", err);
    });
}