/**
 * StayPremium - Enterprise Architecture Control Engine (jaipur.js)
 * Enhanced with Dynamic Analytics Counters, Full Multi-Tier Filters, Working State Machine & Local Language Search Engine
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, push, set, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Enterprise Firebase Configuration
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

// Application State Initialization
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

let masterPGRecords = [];
let currentUser = null;
let currentSessionUID = localStorage.getItem('staypremium_uid') || null;
let currentSelectedCity = "jaipur";

// Multilayer Active Filters State Object
let filterStates = {
    searchKeyword: "",
    localArea: "all",
    maxBudget: 30000,
    spaceType: "all",
    targetGender: "all",
    amenities: [] // Dynamic tags array like ['furnished', 'ac', etc.]
};

/**
 * SOLID LOCAL LANGUAGE & DIALECT TRANSLATION MAPPER (Hinglish / Local Search Engine)
 * Automatically parses conversational keywords into structured data attributes.
 */
function parseLocalLanguageQuery(rawQueryString) {
    const text = rawQueryString.toLowerCase().trim();
    if (!text) return;

    // 1. Demographic / Gender Context Mapping
    if (/\b(boys|boy|ladko|ladka|gents|gent|male|पुरुष)\b/.test(text)) {
        filterStates.targetGender = "boys";
        syncVisualTags('.gender-filter', 'boys');
    } else if (/\b(girls|girl|ladkiyo|ladki|ladies|lady|female|महिला)\b/.test(text)) {
        filterStates.targetGender = "girls";
        syncVisualTags('.gender-filter', 'girls');
    } else if (/\b(unisex|co-living|dono|family|couple|coliving)\b/.test(text)) {
        filterStates.targetGender = "unisex";
        syncVisualTags('.gender-filter', 'unisex');
    }

    // 2. Space / Configuration Type Mapping
    if (/\b(1\s*bhk|one\s*bhk)\b/.test(text)) {
        filterStates.spaceType = "1bhk";
        syncVisualTags('.type-filter', '1bhk');
    } else if (/\b(2\s*bhk|two\s*bhk)\b/.test(text)) {
        filterStates.spaceType = "2bhk";
        syncVisualTags('.type-filter', '2bhk');
    } else if (/\b(3\s*bhk|three\s*bhk)\b/.test(text)) {
        filterStates.spaceType = "3bhk";
        syncVisualTags('.type-filter', '3bhk');
    } else if (/\b(1\s*rk|studio|one\s*rk)\b/.test(text)) {
        filterStates.spaceType = "1rk";
        syncVisualTags('.type-filter', '1rk');
    } else if (/\b(pg|hostel|paying\s*guest|p\s*g)\b/.test(text)) {
        filterStates.spaceType = "pg";
        syncVisualTags('.type-filter', 'pg');
    } else if (/\b(room|kamra|single|private|ek\s*akela)\b/.test(text) && !/bhk|rk/.test(text)) {
        filterStates.spaceType = "room";
        syncVisualTags('.type-filter', 'room');
    }

    // 3. Hotspot Area Zone Auto-Selection Mapping
    const areaSelect = document.getElementById('filter-local-area');
    const areas = ['malviya nagar', 'mansarovar', 'vaishali nagar', 'c-scheme', 'jagatpura', 'pratap nagar', 'sitapura'];
    for (let area of areas) {
        if (text.includes(area) || text.includes(area.replace(" ", ""))) {
            filterStates.localArea = area;
            if (areaSelect) areaSelect.value = area;
            break;
        }
    }

    // 4. Local Pricing Intent Filters (Sasta, Premium, Low Budget, Luxury)
    const budgetSlider = document.getElementById('filter-budget-range');
    const budgetBadge = document.getElementById('budget-cap-badge');
    
    if (/\b(sasta|low\s*budget|kam\s*paisa|cheap|budget\s*friendly|economical)\b/.test(text)) {
        filterStates.maxBudget = 7000;
        if (budgetSlider) budgetSlider.value = 7000;
        if (budgetBadge) budgetBadge.innerText = "₹7,000";
    } else if (/\b(premium|luxury| वीआईपी |vip|expensive|high\s*end|best)\b/.test(text)) {
        filterStates.maxBudget = 30000;
        if (budgetSlider) budgetSlider.value = 30000;
        if (budgetBadge) budgetBadge.innerText = "₹30,000+ Luxury";
    }

    // 5. Amenities Intercept Arrays
    let runtimeCheckboxes = Array.from(document.querySelectorAll('.amenity-checkbox-flag'));
    
    if (/\b(ac|air\s*conditioner|cooler|thandee)\b/.test(text)) {
        toggleCheckboxState(runtimeCheckboxes, 'ac', true);
    }
    if (/\b(food|khana|mess|tiffin|meals|lunch|dinner)\b/.test(text)) {
        toggleCheckboxState(runtimeCheckboxes, 'food', true);
    }
    if (/\b(furnished|well\s*furnished|vip\s*room|sofa|bed)\b/.test(text)) {
        toggleCheckboxState(runtimeCheckboxes, 'furnished', true);
    }
}

// Helper utility to sync UI component triggers visually
function syncVisualTags(selector, targetDataType) {
    const nodes = document.querySelectorAll(selector);
    nodes.forEach(node => {
        if (node.dataset.type === targetDataType || node.dataset.gender === targetDataType) {
            node.classList.add('active');
        } else {
            node.classList.remove('active');
        }
    });
}

// Helper utility to manage state arrays flags checkbox components
function toggleCheckboxState(checkboxElements, targetValue, assertState) {
    const targetBox = checkboxElements.find(box => box.value === targetValue);
    if (targetBox) {
        targetBox.checked = assertState;
        if (assertState && !filterStates.amenities.includes(targetValue)) {
            filterStates.amenities.push(targetValue);
        }
    }
}

// Authentication Context Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        currentSessionUID = user.uid;
        localStorage.setItem('staypremium_uid', user.uid);
    } else {
        currentUser = null;
        currentSessionUID = localStorage.getItem('staypremium_uid') || null;
    }
    renderPGDataViewGrid();
});

// DOM Event Initialization
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('pg-search-input');
    const voiceBtn = document.getElementById('voice-search-trigger');
    const areaSelect = document.getElementById('filter-local-area');
    const budgetSlider = document.getElementById('filter-budget-range');
    const budgetBadge = document.getElementById('budget-cap-badge');
    const typeTags = document.querySelectorAll('.type-filter');
    const genderTags = document.querySelectorAll('.gender-filter');
    const amenityCheckboxes = document.querySelectorAll('.amenity-checkbox-flag');
    const resetFiltersBtn = document.getElementById('filter-reset-trigger');

    // Realtime Database Stream Pipeline
    const propertiesNodeRef = ref(database, 'properties');
    onValue(propertiesNodeRef, (snapshot) => {
        const rawPayload = snapshot.val();
        if(rawPayload) {
            masterPGRecords = Object.keys(rawPayload).map(key => ({ id: key, ...rawPayload[key] }))
                                           .filter(item => item.category && item.category.toLowerCase() === 'pg');
            renderPGDataViewGrid();
        } else {
            masterPGRecords = [];
            renderPGDataViewGrid();
        }
    });

    // 1. Live Text Search Controller with Embedded Local NLP Core
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const rawValue = searchInput.value;
            filterStates.searchKeyword = rawValue.toLowerCase().trim();
            
            // Evaluates local expressions dynamically during type execution
            parseLocalLanguageQuery(rawValue);
            renderPGDataViewGrid();
        });
    }

    // 2. Area Zone Dropdown Listener
    if (areaSelect) {
        areaSelect.addEventListener('change', () => {
            filterStates.localArea = areaSelect.value.toLowerCase().trim();
            renderPGDataViewGrid();
        });
    }

    // 3. Dynamic Budget Range Slider Action
    if (budgetSlider && budgetBadge) {
        budgetSlider.addEventListener('input', () => {
            const currentVal = parseInt(budgetSlider.value);
            filterStates.maxBudget = currentVal;
            budgetBadge.innerText = currentVal >= 30000 ? "₹30,000+" : `₹${currentVal.toLocaleString('en-IN')}`;
            renderPGDataViewGrid();
        });
    }

    // 4. Space Arrangement Typology Matrix Tags Click Handler
    typeTags.forEach(tag => {
        tag.addEventListener('click', () => {
            typeTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            filterStates.spaceType = tag.dataset.type.toLowerCase().trim();
            renderPGDataViewGrid();
        });
    });

    // 5. Demographics/Gender Targets Tags Matrix Click Handler
    genderTags.forEach(tag => {
        tag.addEventListener('click', () => {
            genderTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            filterStates.targetGender = tag.dataset.gender.toLowerCase().trim();
            renderPGDataViewGrid();
        });
    });

    // 6. Multi-Option Amenities Checkboxes Interceptor Array Map
    amenityCheckboxes.forEach(box => {
        box.addEventListener('change', () => {
            let selectedFlags = [];
            amenityCheckboxes.forEach(cb => {
                if(cb.checked) selectedFlags.push(cb.value.toLowerCase());
            });
            filterStates.amenities = selectedFlags;
            renderPGDataViewGrid();
        });
    });

    // 7. Master Reset Filters Pipeline Action Block
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            filterStates = { searchKeyword: "", localArea: "all", maxBudget: 30000, spaceType: "all", targetGender: "all", amenities: [] };
            if(searchInput) searchInput.value = "";
            if(areaSelect) areaSelect.value = "all";
            if(budgetSlider) budgetSlider.value = 30000;
            if(budgetBadge) budgetBadge.innerText = "₹30,000";
            
            typeTags.forEach(t => t.classList.remove('active'));
            if(typeTags[0]) typeTags[0].classList.add('active');
            
            genderTags.forEach(t => t.classList.remove('active'));
            if(genderTags[0]) genderTags[0].classList.add('active');
            
            amenityCheckboxes.forEach(cb => cb.checked = false);
            
            renderPGDataViewGrid();
        });
    }

    // Multilingual Native Voice Speech Recognition Implementation Core
    if (voiceBtn && searchInput) {
        const SpeechSetup = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechSetup) {
            const SpeechEngineInstance = new SpeechSetup();
            SpeechEngineInstance.continuous = false;
            // Configured to interpret dual locale inputs natively
            SpeechEngineInstance.lang = 'hi-IN'; 

            voiceBtn.onclick = () => {
                SpeechEngineInstance.start();
                searchInput.placeholder = "Aapki voice search live listen kar rahe hain...";
            };
            SpeechEngineInstance.onresult = (e) => {
                const vocalResultText = e.results[0][0].transcript;
                searchInput.value = vocalResultText;
                filterStates.searchKeyword = vocalResultText.toLowerCase().trim();
                
                // Route vocal stream data into NLP engine directly
                parseLocalLanguageQuery(vocalResultText);
                searchInput.placeholder = "Search premium PGs by name, area or landmark...";
                renderPGDataViewGrid();
            };
        } else {
            voiceBtn.style.display = 'none';
        }
    }
});

// Primary Rendering Engine Matrix
function renderPGDataViewGrid() {
    const container = document.getElementById('pg-cards-container');
    if(!container) return;

    const savedList = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];

    // Step A: Filter properties solely matching active city (Jaipur)
    let evaluatedResultGrid = masterPGRecords.filter(post => {
        const propertyCity = (post.city || "").toLowerCase().trim();
        return propertyCity === currentSelectedCity;
    });

    // Step B: Multi-Tier Matrix Evaluation Filtering Loop Logic
    evaluatedResultGrid = evaluatedResultGrid.filter(post => {
        // 1. Text Search verification (Name, Location, Area description matching)
        if(filterStates.searchKeyword !== "") {
            const nameMatch = (post.name || post.title || "").toLowerCase().includes(filterStates.searchKeyword);
            const areaMatch = (post.area || post.location || "").toLowerCase().includes(filterStates.searchKeyword);
            const descriptionMatch = (post.description || "").toLowerCase().includes(filterStates.searchKeyword);
            const sharingTypeMatch = (post.sharingType || "").toLowerCase().includes(filterStates.searchKeyword);
            const amenitiesStringMatch = (post.amenities || []).join(',').toLowerCase().includes(filterStates.searchKeyword);
            
            // Extended local expressions support inside standard dataset parameters matching loop
            if(!nameMatch && !areaMatch && !amenitiesStringMatch && !descriptionMatch && !sharingTypeMatch) return false;
        }

        // 2. Zone/Local Area Selection mapping validation
        if(filterStates.localArea !== "all") {
            const currentZone = (post.area || post.location || "").toLowerCase();
            if(!currentZone.includes(filterStates.localArea)) return false;
        }

        // 3. Maximum Monthly Budget constraint loop checks
        const rentAmount = parseInt(post.price || post.rent || 0);
        if(rentAmount > filterStates.maxBudget) return false;

        // 4. Space Arrangement typology matching
        if(filterStates.spaceType !== "all") {
            const targetType = filterStates.spaceType;
            const sharingStr = (post.sharingType || "").toLowerCase();
            const categoryStr = (post.category || "").toLowerCase();
            
            if(targetType === "room" && !sharingStr.includes("single")) return false;
            if(targetType === "pg" && categoryStr !== "pg") return false;
            if(targetType === "1rk" && !sharingStr.includes("1rk") && !sharingStr.includes("studio")) return false;
            if(targetType === "1bhk" && !sharingStr.includes("1bhk")) return false;
            if(targetType === "2bhk" && !sharingStr.includes("2bhk")) return false;
            if(targetType === "3bhk" && !sharingStr.includes("3bhk")) return false;
        }

        // 5. Gender demographic profile evaluation
        if(filterStates.targetGender !== "all") {
            const postGender = (post.gender || post.genderType || post.targetGender || "").toLowerCase();
            if(filterStates.targetGender === "boys" && !postGender.includes("boy") && !postGender.includes("male") && !postGender.includes("gent")) return false;
            if(filterStates.targetGender === "girls" && !postGender.includes("girl") && !postGender.includes("female") && !postGender.includes("ladie")) return false;
            if(filterStates.targetGender === "unisex" && !postGender.includes("unisex") && !postGender.includes("co-living")) return false;
        }

        // 6. Premium Amenities Multi-Flags array conditional looping logic
        if(filterStates.amenities.length > 0) {
            const postAmenitiesArr = (post.amenities || []).map(a => a.toLowerCase());
            const facilityStr = (post.facility || "").toLowerCase();
            const furnishStr = (post.furnishedType || "").toLowerCase();

            for(let flag of filterStates.amenities) {
                if(flag === 'furnished' && !furnishStr.includes('fully') && !furnishStr.includes('semi')) return false;
                if(flag === 'ac' && !postAmenitiesArr.includes('ac') && !post.ac) return false;
                if(flag === 'food' && !facilityStr.includes('food') && !post.food && !post.mess) return false;
                if(flag === 'lift' && !facilityStr.includes('lift') && !postAmenitiesArr.includes('lift') && !post.lift) return false;
            }
        }

        return true;
    });

    // Dynamic global header title counter update configuration mapping
    const headingNode = document.getElementById('listings-heading');
    if (headingNode) {
        headingNode.innerHTML = `Stay100 Accommodations in Jaipur(Raj.) <span style="font-size: 15px; font-weight: 500; color: #64748b; background: #f1f5f9; padding: 4px 10px; border-radius: 20px; margin-left: 10px; vertical-align: middle;">${evaluatedResultGrid.length} Spaces Available</span>`;
    }

    // Empty Asset Fallback Structure Rendering Pipeline Control logic block
    if(evaluatedResultGrid.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1; display:flex; flex-direction:column; align-items:center; padding:60px 20px; background:#fff; border-radius:16px; text-align:center; width: 100%; box-sizing: border-box; max-width: 600px; margin: 30px auto; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                <h3 style="margin:0 0 6px 0; font-size:22px; color:#1e293b; font-weight:700;">No Matching Spaces Found</h3>
                <p style="margin:0; font-size:14px; color:#64748b; max-width:400px; line-height:1.5;">Modify search keywords or adjust structural filter segments to display premium rooms.</p>
            </div>
        `;
        updateActiveFilterBadgesUi();
        return;
    }

    // High Performance Injection Render System Loop Pipeline
    if (window.PropertyCardComponent && typeof window.PropertyCardComponent.render === 'function') {
        container.innerHTML = evaluatedResultGrid.map(item => {
            let labelBadge = item.badge || "Premium Room";
            const structuralRenderClone = { ...item, badge: labelBadge, badgeText: labelBadge, tag: labelBadge, isVerified: false };
            return window.PropertyCardComponent.render(structuralRenderClone, savedList);
        }).join('');

        if (typeof window.PropertyCardComponent.initAutoswipe === 'function') {
            window.PropertyCardComponent.initAutoswipe();
        }
    } else {
        // Fallback Resilient Layout Template Frame Card Structure Injection
        container.innerHTML = evaluatedResultGrid.map(item => {
            const isSaved = savedList.includes(item.id);
            return `
                <div class="property-card" data-view-id="${item.id}" style="position:relative; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.05); cursor:pointer;">
                    <img src="${item.image || item.imageUrl || 'https://via.placeholder.com/400x250'}" style="width:100%; height:200px; object-fit:cover;">
                    <div style="padding:16px;">
                        <h4 style="margin:0 0 8px 0; font-size:16px; color:#1e293b; font-weight:700;">${item.name || item.title || 'Premium Space'}</h4>
                        <p style="margin:0 0 8px 0; font-size:13px; color:#64748b;"><i class="fa-solid fa-location-dot"></i> ${item.location || item.area || 'Jaipur Zone'}</p>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 15px;">
                            <span style="font-weight:700; color:#800020; font-size:16px;">₹${item.price || item.rent || 'N/A'}/mo</span>
                            <button style="background:#800020; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600;">View Details</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateActiveFilterBadgesUi();
}

// Render Secondary Dynamic Badges System Runtime Map UI Controller
function updateActiveFilterBadgesUi() {
    const runtimeBadgesContainer = document.getElementById('active-badges-runtime-container');
    if(!runtimeBadgesContainer) return;

    let systemActiveBadgeStringsArray = [];
    
    if(filterStates.searchKeyword !== "") systemActiveBadgeStringsArray.push(`Keyword: ${filterStates.searchKeyword}`);
    if(filterStates.localArea !== "all") systemActiveBadgeStringsArray.push(`Area: ${filterStates.localArea}`);
    if(filterStates.maxBudget < 30000) systemActiveBadgeStringsArray.push(`Budget Under: ₹${filterStates.maxBudget}`);
    if(filterStates.spaceType !== "all") systemActiveBadgeStringsArray.push(`Type: ${filterStates.spaceType}`);
    if(filterStates.targetGender !== "all") systemActiveBadgeStringsArray.push(`Gender: ${filterStates.targetGender}`);
    
    filterStates.amenities.forEach(flag => systemActiveBadgeStringsArray.push(`Feature: ${flag.toUpperCase()}`));

    if (systemActiveBadgeStringsArray.length === 0) {
        runtimeBadgesContainer.innerHTML = "";
        return;
    }

    runtimeBadgesContainer.innerHTML = systemActiveBadgeStringsArray.map(badgeLabelText => {
        return `
            <div class="badge-pill-item" style="background:#e2e8f0; color:#334155; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:600; font-family:inherit; display:inline-flex; align-items:center;">
                <span>${badgeLabelText}</span>
            </div>`;
    }).join('');
}