/**
 * StayPremium - Enhanced Realtime Engine (Next-Gen Production Build with AI Search & Inline Ads)
 * Features Auto-sliding Interactive Center Banner Matrix, Category Filters Sync & Global City Selector Linkage
 * Integrated with PropertyCardComponent Dynamic Autoswipe Loop Handler
 */

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

// Check if app initialization is pending
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// Application State Parameters
let allPosts = [];
let currentCategory = 'all';

// --- UNIFIED SYSTEM AUTH POINTER MATRIX ---
let currentSessionUID = localStorage.getItem('stay100_uid') || localStorage.getItem('staypremium_uid') || null;

// --- GLOBAL FILTER STATE MATRIX ---
window.filterState = {
    maxBudget: Infinity,
    area: "",
    gender: "all",
    sharingType: [],     
    furnishing: [],      
    foodIncluded: false, 
    verifiedOnly: false, 
    recentlyPosted: false, 
    nearbyHubs: []       
};

// Toast Notification Subsystem
window.showCenterToast = function(message, isSuccess = true) {
    const activeToast = document.getElementById('staypremium-center-toast');
    if (activeToast) activeToast.remove();

    const container = document.createElement('div');
    container.id = 'staypremium-center-toast';
    container.innerHTML = `
        <div style="
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9);
            background: ${isSuccess ? '#2e7d32' : '#800020'}; color: #ffffff; padding: 14px 28px;
            border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); font-family: sans-serif;
            font-size: 15px; font-weight: 600; z-index: 10000; text-align: center; opacity: 0;
            transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); pointer-events: none;
            display: flex; align-items: center; gap: 8px;
        ">
            <i class="fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(container);
    const inner = container.querySelector('div');

    setTimeout(() => {
        inner.style.opacity = '1';
        inner.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 40);

    setTimeout(() => {
        inner.style.opacity = '0';
        inner.style.transform = 'translate(-50%, -50%) scale(0.9)';
        setTimeout(() => container.remove(), 250);
    }, 2800);
};

// VENDOR VERIFICATION ENGINE
function checkVendorVerification(vendorId) {
    if (!vendorId) return false;
    const planType = localStorage.getItem(`stay100_plan_${vendorId}`);
    const startDateStr = localStorage.getItem(`stay100_start_${vendorId}`); 
    
    if (!planType || !startDateStr) return false;

    const activationDate = new Date(startDateStr);
    const currentDate = new Date(); 
    
    let activeWindowDays = 0;
    if (planType === "99") activeWindowDays = 30;
    if (planType === "249") activeWindowDays = 90;
    if (planType === "999") activeWindowDays = 365;

    const expirationTimeline = new Date(activationDate);
    expirationTimeline.setDate(expirationTimeline.getDate() + activeWindowDays);

    if (currentDate > expirationTimeline) {
        localStorage.removeItem(`stay100_plan_${vendorId}`);
        localStorage.removeItem(`stay100_start_${vendorId}`);
        return false;
    }
    return true;
}

function updateUserProfileUI() {
    const profileNameContainer = document.getElementById('user-profile-name-target'); 
    if (profileNameContainer && currentSessionUID) {
        const isVerified = checkVendorVerification(currentSessionUID);
        const currentName = localStorage.getItem('stay100_name') || localStorage.getItem('staypremium_name') || "User Node";
        if (isVerified) {
            profileNameContainer.innerHTML = `${currentName} <span style="background:#1da1f2; color:#fff; padding:2px 6px; border-radius:50px; font-size:11px; margin-left:5px;"><i class="fa-solid fa-badge-check"></i> Stay100% Verified</span>`;
        } else {
            profileNameContainer.innerHTML = currentName;
        }
    }
}

// --- FILTER CORE SYNC ENGINE ---
window.syncAndRenderFilters = function() {
    const dBudget = document.getElementById('filter-budget')?.value;
    window.filterState.maxBudget = dBudget ? parseFloat(dBudget) : Infinity;

    window.filterState.area = document.getElementById('filter-locality')?.value?.toLowerCase().trim() || "";
    
    const genderActive = document.querySelector('input[name="desktop-gender"]:checked') || document.querySelector('input[name="mobile-gender"]:checked');
    window.filterState.gender = (genderActive && genderActive.value) ? genderActive.value : "all";

    window.filterState.sharingType = [];
    document.querySelectorAll('.filter-sharing:checked, .m-filter-sharing:checked').forEach(cb => {
        if(!window.filterState.sharingType.includes(cb.value)) {
            window.filterState.sharingType.push(cb.value);
        }
    });

    window.filterState.furnishing = [];
    document.querySelectorAll('.filter-furnishing:checked, .m-filter-furnishing:checked').forEach(cb => {
        if(!window.filterState.furnishing.includes(cb.value)) {
            window.filterState.furnishing.push(cb.value);
        }
    });

    window.filterState.foodIncluded = document.getElementById('filter-food')?.checked || document.getElementById('m-filter-food')?.checked || false;

    window.filterState.nearbyHubs = [];
    document.querySelectorAll('.filter-landmark:checked, .m-filter-landmark:checked').forEach(cb => {
        if(!window.filterState.nearbyHubs.includes(cb.value)) {
            window.filterState.nearbyHubs.push(cb.value);
        }
    });

    window.filterState.verifiedOnly = document.getElementById('filter-verified')?.checked || document.getElementById('m-filter-verified')?.checked || false;
    window.filterState.recentlyPosted = document.getElementById('filter-recent')?.checked || document.getElementById('m-filter-recent')?.checked || false;

    renderActiveFilterChips();
    if (typeof window.renderPostsDataPipeline === 'function') {
        window.renderPostsDataPipeline();
    }
};

function renderActiveFilterChips() {
    const container = document.getElementById('desktop-active-chips');
    if (!container) return;
    container.innerHTML = '';

    const createChip = (label, removeActionCallback) => {
        const chip = document.createElement('div');
        chip.className = 'filter-chip';
        chip.style.cssText = "display: inline-flex; align-items: center; gap: 6px; background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 4px 10px; border-radius: 50px; font-size: 12px; font-weight: 500; cursor: pointer;";
        chip.innerHTML = `${label} <i class="fa-solid fa-xmark"></i>`;
        chip.querySelector('i').addEventListener('click', () => {
            removeActionCallback();
            window.syncAndRenderFilters(); 
        });
        container.appendChild(chip);
    };

    if (window.filterState.maxBudget !== Infinity) {
        createChip(`Max ₹${window.filterState.maxBudget}`, () => {
            const el = document.getElementById('filter-budget'); if(el) el.value = '';
            const mel = document.getElementById('m-filter-budget'); if(mel) mel.value = '';
        });
    }

    if (window.filterState.area !== "") {
        createChip(`Area: ${window.filterState.area}`, () => {
            const el = document.getElementById('filter-locality'); if(el) el.value = '';
            const mel = document.getElementById('m-filter-locality'); if(mel) mel.value = '';
        });
    }

    if (window.filterState.gender && window.filterState.gender !== "all") {
        createChip(`Gender: ${window.filterState.gender}`, () => {
            document.querySelectorAll('input[name="desktop-gender"], input[name="mobile-gender"]').forEach(rb => rb.checked = false);
        });
    }

    window.filterState.sharingType.forEach(val => {
        createChip(`Sharing: ${val}`, () => {
            document.querySelectorAll(`.filter-sharing[value="${val}"], .m-filter-sharing[value="${val}"]`).forEach(cb => cb.checked = false);
        });
    });

    window.filterState.furnishing.forEach(val => {
        createChip(`Furnishing: ${val}`, () => {
            document.querySelectorAll(`.filter-furnishing[value="${val}"], .m-filter-furnishing[value="${val}"]`).forEach(cb => cb.checked = false);
        });
    });

    if (window.filterState.foodIncluded) {
        createChip("Homely Food Included", () => {
            const el = document.getElementById('filter-food'); if(el) el.checked = false;
            const mel = document.getElementById('m-filter-food'); if(mel) mel.checked = false;
        });
    }

    window.filterState.nearbyHubs.forEach(val => {
        createChip(`Hub: ${val.replace('near-', '')}`, () => {
            document.querySelectorAll(`.filter-landmark[value="${val}"], .m-filter-landmark[value="${val}"]`).forEach(cb => cb.checked = false);
        });
    });

    if (window.filterState.verifiedOnly) {
        createChip("Verified ✓", () => {
            const el = document.getElementById('filter-verified'); if(el) el.checked = false;
            const mel = document.getElementById('m-filter-verified'); if(mel) mel.checked = false;
        });
    }

    if (window.filterState.recentlyPosted) {
        createChip("Recent ⏱", () => {
            const el = document.getElementById('filter-recent'); if(el) el.checked = false;
            const mel = document.getElementById('m-filter-recent'); if(mel) mel.checked = false;
        });
    }
}

window.clearAllFilters = function() {
    const budget = document.getElementById('filter-budget'); if(budget) budget.value = '';
    const locality = document.getElementById('filter-locality'); if(locality) locality.value = '';
    const mBudget = document.getElementById('m-filter-budget'); if(mBudget) mBudget.value = '';
    const mLocality = document.getElementById('m-filter-locality'); if(mLocality) mLocality.value = '';

    document.querySelectorAll('input[name="desktop-gender"], input[name="mobile-gender"]').forEach(r => r.checked = false);
    document.querySelectorAll('.filter-sharing, .m-filter-sharing, .filter-furnishing, .m-filter-furnishing, .filter-landmark, .m-filter-landmark').forEach(c => c.checked = false);
    
    const food = document.getElementById('filter-food'); if(food) food.checked = false;
    const mFood = document.getElementById('m-filter-food'); if(mFood) mFood.checked = false;
    const verified = document.getElementById('filter-verified'); if(verified) verified.checked = false;
    const mVerified = document.getElementById('m-filter-verified'); if(mVerified) mVerified.checked = false;
    const recent = document.getElementById('filter-recent'); if(recent) recent.checked = false;
    const mRecent = document.getElementById('m-filter-recent'); if(mRecent) mRecent.checked = false;

    window.filterState = { maxBudget: Infinity, area: "", gender: "all", sharingType: [], furnishing: [], foodIncluded: false, verifiedOnly: false, recentlyPosted: false, nearbyHubs: [] };
    
    renderActiveFilterChips();
    window.renderPostsDataPipeline();
};

function getEmptyStateHTML(searchSummary = "") {
    return `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center; max-width: 600px; margin: 30px auto;">
            <div style="width: 80px; height: 80px; background: #fee2e2; color: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; margin-bottom: 20px;">
                <i class="fa-solid fa-magnifying-glass-minus"></i>
            </div>
            <h3 style="margin: 0 0 8px 0; color: #1e293b; font-family: sans-serif; font-size: 22px; font-weight: 700;">No Results Found</h3>
            ${searchSummary ? `<p style="margin: 0 0 12px 0; color: #800020; font-family: sans-serif; font-size: 15px; font-weight: 600;">${searchSummary}</p>` : ''}
            <p style="margin: 0 0 20px 0; color: #64748b; font-family: sans-serif; font-size: 14px; line-height: 1.5; max-width: 400px;">We couldn't find any properties matching your criteria. Try widening your options, changing locations, or adjusting the filters!</p>
            <button onclick="window.clearAllFilters()" style="background: #800020; color: #ffffff; border: none; padding: 12px 24px; font-size: 14px; font-weight: 600; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.2s; box-shadow: 0 4px 12px rgba(128,0,32,0.2);">
                <i class="fa-solid fa-filter-circle-xmark"></i> Clear All Filters
            </button>
        </div>
    `;
}

function parseAndApplyUrlFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    if (!window.filterState) window.filterState = {};
    
    const locationParam = urlParams.get('location');
    if (locationParam) {
        localStorage.setItem('staypremium_selected_city', locationParam.toLowerCase().trim());
        const headerCityLabel = document.getElementById('current-city-label') || document.getElementById('current-city-name-display');
        if (headerCityLabel) {
            headerCityLabel.innerText = locationParam.charAt(0).toUpperCase() + locationParam.slice(1);
        }
        window.dispatchEvent(new CustomEvent('cityChanged', { detail: { cityId: locationParam.toLowerCase().trim() } }));
    }

    const typeParam = urlParams.get('type');
    if (typeParam) {
        currentCategory = typeParam.toLowerCase().trim();
        document.querySelectorAll('.category-card').forEach(card => {
            if (card.dataset.category === currentCategory) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    const areaParam = urlParams.get('area');
    if (areaParam) {
        window.filterState.area = areaParam.toLowerCase().trim();
        const el = document.getElementById('filter-locality'); if (el) el.value = areaParam;
        const mel = document.getElementById('m-filter-locality'); if (mel) mel.value = areaParam;
    }

    const budgetParam = urlParams.get('budget');
    if (budgetParam) {
        let cleanBudget = parseFloat(budgetParam.replace('k', '')) * 1000;
        if (!isNaN(cleanBudget)) {
            window.filterState.maxBudget = cleanBudget;
            const el = document.getElementById('filter-budget'); if (el) el.value = cleanBudget;
            const mel = document.getElementById('m-filter-budget'); if (mel) mel.value = cleanBudget;
        }
    }

    const genderParam = urlParams.get('gender');
    if (genderParam) {
        const cleanGender = genderParam.toLowerCase().trim();
        window.filterState.gender = cleanGender;
        document.querySelectorAll(`input[name="desktop-gender"][value="${cleanGender}"], input[name="mobile-gender"][value="${cleanGender}"]`).forEach(rb => rb.checked = true);
    }

    const sharingParam = urlParams.get('sharing');
    if (sharingParam) {
        const cleanSharing = sharingParam.toLowerCase().trim();
        window.filterState.sharingType = [cleanSharing];
        document.querySelectorAll(`.filter-sharing[value="${cleanSharing}"], .m-filter-sharing[value="${cleanSharing}"]`).forEach(cb => cb.checked = true);
    }

    const verifiedParam = urlParams.get('verified');
    if (verifiedParam === 'true') {
        window.filterState.verifiedOnly = true;
        const el = document.getElementById('filter-verified'); if (el) el.checked = true;
        const mel = document.getElementById('m-filter-verified'); if (mel) mel.checked = true;
    }

    const landmarkParam = urlParams.get('landmark');
    if (landmarkParam) {
        const cleanLandmark = landmarkParam.toLowerCase().trim();
        let matchedHubValue = cleanLandmark.startsWith('near-') ? cleanLandmark : "near-" + cleanLandmark;
        window.filterState.nearbyHubs = [matchedHubValue];
        document.querySelectorAll(`.filter-landmark[value="${matchedHubValue}"], .m-filter-landmark[value="${cleanLandmark}"]`).forEach(cb => cb.checked = true);
    }

    if (typeof renderActiveFilterChips === "function") {
        renderActiveFilterChips();
    }
}

// --- NATIVE SMART MAPPING / CASUAL LOCAL LANGUAGE DICTIONARY ---
const AI_NLP_DICTIONARY = {
    localities: ["mansarovar", "malviya nagar", "tonk road", "jagatpura", "raja park", "c scheme", "vaishali nagar", "sanganer", "pratap nagar", "sodala", "gopalpura"],
    hubs: {
        coaching: ["coaching", "allen", "fiitjee", "resonance", "pw", "physics wallah", "institutes", "classes", "padhai"],
        college: ["college", "university", "school", "mnit", "inifd", "amity", "jecrc"],
        hospital: ["hospital", "fortis", "ehcc", "sms", "doctor", "medical"],
        office: ["office", "wipro", "hub", "infosys", "corporate", "sitapura", "mahindra world city"]
    },
    gender: {
        boys: ["boys", "boy", "male", "ladke", "ladko"],
        girls: ["girls", "girl", "female", "ladki", "ladkiyo", "working women"],
        unisex: ["unisex", "family", "both", "couple", "sabke liye"]
    }
};

// --- DATA FILTERING PIPELINE ENGINE (UPGRADED WITH INTUITY AI SEARCH ENGINE & DYNAMIC COUNTERS) ---
window.renderPostsDataPipeline = function() {
    let listingsGrid = document.getElementById('listings-container') || document.getElementById('properties-container-target');
    if (!listingsGrid) return;
    
    // Skeleton Loading Implementation
    listingsGrid.innerHTML = `
        <div class="site-loading-wrapper" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center;">
            <div class="logo-animation-container">
                <img src="/assets/vendor logo.png" alt="Loading..." class="pulse-logo" style="width: 80px; height: auto; margin-bottom: 15px;" onerror="this.src='https://placehold.co/80x80?text=Stay100'">
            </div>
            <div class="loading-bar-container" style="width: 140px; height: 4px; background: #f3f4f6; border-radius: 10px; overflow: hidden; position: relative;">
                <div class="loading-bar-fill" style="position: absolute; width: 50%; height: 100%; background: #800020; border-radius: 10px; animation: loadingSlide 1.5s infinite ease-in-out;"></div>
            </div>
            <p style="color: #6b7280; font-size: 13px; font-weight: 500; margin-top: 12px; font-family: sans-serif; letter-spacing: 0.5px;">Loading Stay100%...</p>
        </div>
    `;

    setTimeout(() => {
        listingsGrid.innerHTML = "";

        const searchInput = document.getElementById('search-input') || document.getElementById('filter-locality');
        const rawSearchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
        
        const activeSelectedGlobalCity = (localStorage.getItem('staypremium_selected_city') || "all").toLowerCase().trim();

        // --- 1. LOCAL SEARCH COOPERATIVE ENGINE ---
        let aiExtractedState = {
            detectedArea: "",
            detectedGender: "all",
            detectedHubs: [],
            budgetLimit: Infinity
        };

        const activeDictionary = typeof AI_NLP_DICTIONARY !== 'undefined' ? AI_NLP_DICTIONARY : { localities: [], hubs: {}, gender: {} };

        if (rawSearchQuery.length > 2) {
            if(activeDictionary.localities) {
                activeDictionary.localities.forEach(loc => {
                    if (rawSearchQuery.includes(loc.toLowerCase())) aiExtractedState.detectedArea = loc.toLowerCase();
                });
            }

            if(activeDictionary.hubs) {
                Object.keys(activeDictionary.hubs).forEach(hubKey => {
                    activeDictionary.hubs[hubKey].forEach(alias => {
                        if (rawSearchQuery.includes(alias.toLowerCase())) {
                            if (!aiExtractedState.detectedHubs.includes(hubKey)) {
                                aiExtractedState.detectedHubs.push(hubKey);
                            }
                        }
                    });
                });
            }

            if(activeDictionary.gender) {
                Object.keys(activeDictionary.gender).forEach(genderKey => {
                    activeDictionary.gender[genderKey].forEach(alias => {
                        if (rawSearchQuery.includes(alias.toLowerCase())) aiExtractedState.detectedGender = genderKey;
                    });
                });
            }

            const budgetMatches = rawSearchQuery.match(/(?:under|below|around|₹|price|\bsabse sasta\b)\s?(\d+)(k)?/i);
            if (budgetMatches) {
                let parsedVal = parseFloat(budgetMatches[1]);
                if (budgetMatches[2] || parsedVal < 100) parsedVal = parsedVal * 1000; 
                aiExtractedState.budgetLimit = parsedVal;
            }
        }

        // --- 2. RUN EXTRACTION FILTER MATCHES PIPELINE ---
        const locallySavedItems = JSON.parse(localStorage.getItem('stay100_saved_properties')) || JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];
        const globalFilterMaxBudget = window.filterState && window.filterState.maxBudget ? parseFloat(window.filterState.maxBudget) : Infinity;
        const globalFilterArea = window.filterState && window.filterState.area ? window.filterState.area.toLowerCase().trim() : "";

        const postsArraySource = typeof allPosts !== 'undefined' ? allPosts : [];

        let filteredOutputs = postsArraySource.filter(item => {
            const title = (item.name || item.title || "").toLowerCase();
            const placement = (item.location || item.area || "").toLowerCase();
            const itemCityNode = (item.city || "").toLowerCase().trim();
            const baseCategory = (item.category || "").toLowerCase().trim();
            const itemGender = (item.gender || "").toLowerCase().trim();
            const itemTags = Array.isArray(item.tags) ? item.tags.map(t => t.toLowerCase()) : [];
            const itemPrice = parseFloat(item.price || item.rent || item.budget || 0);

            let matchesGlobalCity = false;
            if (activeSelectedGlobalCity === "all" || activeSelectedGlobalCity === "all cities" || activeSelectedGlobalCity === "") {
                matchesGlobalCity = true;
            } else if (itemCityNode !== "") {
                matchesGlobalCity = (itemCityNode === activeSelectedGlobalCity || activeSelectedGlobalCity.includes(itemCityNode));
            } else {
                matchesGlobalCity = placement.includes(activeSelectedGlobalCity) || title.includes(activeSelectedGlobalCity);
            }
            if (!matchesGlobalCity) return false;

            if (rawSearchQuery && !aiExtractedState.detectedArea && aiExtractedState.detectedHubs.length === 0 && aiExtractedState.detectedGender === "all") {
                const isPlainMatch = title.includes(rawSearchQuery) || placement.includes(rawSearchQuery) || itemCityNode.includes(rawSearchQuery);
                if (!isPlainMatch) return false;
            }

            if (aiExtractedState.detectedArea && !placement.includes(aiExtractedState.detectedArea) && !title.includes(aiExtractedState.detectedArea)) {
                return false;
            }

            if (globalFilterArea !== "" && !placement.includes(globalFilterArea)) {
                return false;
            }

            if (aiExtractedState.detectedGender !== "all" && itemGender !== aiExtractedState.detectedGender && !title.includes(aiExtractedState.detectedGender)) {
                return false;
            }

            const finalMaxBudgetLimit = Math.min(aiExtractedState.budgetLimit, globalFilterMaxBudget);
            if (itemPrice > finalMaxBudgetLimit) {
                return false;
            }

            if (aiExtractedState.detectedHubs.length > 0) {
                let matchedHub = aiExtractedState.detectedHubs.some(hub => {
                    if (hub === "coaching" || hub === "college") {
                        return title.includes("coaching") || title.includes("allen") || title.includes("college") || title.includes("university") || !!item.nearSchool || itemTags.includes("near school");
                    }
                    if (hub === "hospital") return title.includes("hospital") || !!item.nearHospital || itemTags.includes("near hospital");
                    if (hub === "office") return title.includes("office") || title.includes("it park") || !!item.nearOffice || itemTags.includes("near office");
                    return false;
                });
                if (!matchedHub) return false;
            }

            if (typeof currentCategory !== 'undefined' && currentCategory !== 'all' && currentCategory !== '') {
                if (currentCategory === 'pg' && baseCategory !== 'pg' && baseCategory !== 'hostel') return false;
                if (currentCategory === 'flat' && baseCategory !== 'flat' && baseCategory !== 'apartment') return false;
            }

            return true;
        });

        // --- 3. SCORING AND SORTING ---
        let scoredOutputs = filteredOutputs.map(post => {
            const isVendorVerified = (typeof checkVendorVerification === "function" && checkVendorVerification(post.vendorId || post.userId)) || post.isVerified === true;
            let sortingScore = (post.views || 0) + (isVendorVerified ? 100000 : 0);
            if (post.timestamp) sortingScore += post.timestamp / 1000000;
            return { ...post, isVendorVerified, sortingScore };
        });
        scoredOutputs.sort((a, b) => b.sortingScore - a.sortingScore);

        let finalDisplayItems = [...scoredOutputs];

        // --- CONSTRUCT DYNAMIC STRING TEXT FOR SEARCH / FILTER RESULTS ---
        let displaySearchTags = [];
        if (currentCategory && currentCategory !== 'all') displaySearchTags.push(currentCategory.toUpperCase());
        if (rawSearchQuery) displaySearchTags.push(`"${rawSearchQuery}"`);
        if (globalFilterArea) displaySearchTags.push(globalFilterArea);
        
        let targetCityText = activeSelectedGlobalCity !== "all" ? activeSelectedGlobalCity : "All Cities";
        let finalQueryPhrase = displaySearchTags.length > 0 ? displaySearchTags.join(' in ') + ` in ${targetCityText}` : `properties in ${targetCityText}`;
        let resultSummaryString = `Results for ${finalQueryPhrase}: ${finalDisplayItems.length} property found`;

        if (finalDisplayItems.length === 0) {
            listingsGrid.innerHTML = getEmptyStateHTML(resultSummaryString.replace("0 property found", "No property found"));
            return;
        }

        let finalGridHTML = "";
        
        // Dynamic Counter Banner Inject
        finalGridHTML += `
            <div class="filter-results-counter-banner" style="grid-column: 1/-1; background: #f8fafc; border: 1px solid #e2e8f0; color: #1e293b; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; font-weight: 600; font-size: 14px; display: flex; align-items: center; justify-content: space-between; font-family: sans-serif; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <span style="display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-list-check" style="color: #800020;"></i> ${resultSummaryString}</span>
                <span style="font-size: 11px; background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 20px;">Stay100% Live Engine</span>
            </div>
        `;

        // --- 4. DYNAMIC SPONSORED ADS BANNERS ---
        const adBannersData = [
            { image: "/assets/sponsored.png", url: "https://www.stay100.in/pg.html", alt: "Premium Managed Stays" },
            { image: "/assets/sponsored_2.png", url: "https://www.stay100.in/pg.html", alt: "Luxury Villa Offers" },
            { image: "/assets/sponsored_3.png", url: "https://www.stay100.in/pg.html", alt: "Exclusive Holiday Deals" }
        ];

        let adCounter = 0;

        // --- 5. INJECT HTML CARDS ---
        finalDisplayItems.forEach((post, idx) => {
            if (idx > 0 && idx % 3 === 0 && adCounter < adBannersData.length) {
                const currentAd = adBannersData[adCounter];
                finalGridHTML += `
                    <div class="inline-advertisement-card" style="grid-column: 1 / -1; width: 100%; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.04); margin: 25px 0; cursor: pointer; position: relative;" onclick="window.open('${currentAd.url}', '_blank')">
                        <div style="position: absolute; top: 16px; left: 16px; background: rgba(255, 255, 255, 0.85); color: #1a1a1a; padding: 6px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; border-radius: 30px; letter-spacing: 1px; backdrop-filter: blur(8px); z-index: 10; font-family: sans-serif;">Sponsored</div>
                        <img src="${currentAd.image}" alt="${currentAd.alt}" style="width: 100%; height: auto; display: block; object-fit: cover;">
                    </div>
                `;
                adCounter++; 
            }

            let genderIconHTML = '';
            const cleanGender = (post.gender || "").toLowerCase().trim();
            if (cleanGender === "boys" || cleanGender === "boy") {
                genderIconHTML = '<span class="gender-tag boys" style="background:#e0f2fe; color:#0369a1; padding:4px 8px; border-radius:6px; font-size:12px; font-weight:600;"><i class="fa-solid fa-mars"></i> Boys</span>';
            } else if (cleanGender === "girls" || cleanGender === "girl") {
                genderIconHTML = '<span class="gender-tag girls" style="background:#fce7f3; color:#b7064f; padding:4px 8px; border-radius:6px; font-size:12px; font-weight:600;"><i class="fa-solid fa-venus"></i> Girls</span>';
            } else {
                genderIconHTML = '<span class="gender-tag unisex" style="background:#f3f4f6; color:#374151; padding:4px 8px; border-radius:6px; font-size:12px; font-weight:600;"><i class="fa-solid fa-genderless"></i> Unisex</span>';
            }

            if (window.PropertyCardComponent && typeof window.PropertyCardComponent.render === "function") {
                let generatedCard = window.PropertyCardComponent.render(post, locallySavedItems);
                if (generatedCard.includes('</div>')) {
                    generatedCard = generatedCard.replace('</h3>', `</h3> <div style="margin-top: 5px; display:inline-block;">${genderIconHTML}</div>`);
                }
                finalGridHTML += generatedCard;
            } else {
                finalGridHTML += `
                    <div class="property-card" style="background:#fff; border-radius:12px; padding:15px; box-shadow:0 4px 12px rgba(0,0,0,0.08); position:relative; font-family: sans-serif;">
                        <div style="position:absolute; top:12px; left:12px; z-index:10;">${genderIconHTML}</div>
                        <h4 style="margin:40px 0 5px 0; font-size:17px;">${post.name || post.title}</h4>
                        <p style="color:#666; font-size:13px; margin:0 0 10px 0;"><i class="fa-solid fa-location-dot"></i> ${post.location || post.area}</p>
                        <div style="font-weight:700; color:#800020; font-size:16px;">₹${post.price || post.rent}/mo</div>
                        <button data-view-id="${post.id}" style="margin-top:10px; width:100%; padding:8px; border:none; background:#800020; color:#fff; border-radius:6px; cursor:pointer;">View Details</button>
                    </div>
                `;
            }
        });

        listingsGrid.innerHTML = finalGridHTML;
        
        if (window.PropertyCardComponent && typeof window.PropertyCardComponent.initAutoswipe === 'function') {
            window.PropertyCardComponent.initAutoswipe();
        }

        if (typeof renderAuxiliaryDataSections === "function") {
            renderAuxiliaryDataSections();
        }
    }, 400); 
};

function renderAuxiliaryDataSections() {
    let listingsGrid = document.getElementById('listings-container') || document.getElementById('properties-container-target');
    let mainContainerEl = listingsGrid?.parentElement;
    if (!mainContainerEl) return;

    let operationalWrapper = document.getElementById('stay100-auxiliary-wrapper');
    if (operationalWrapper) operationalWrapper.remove();

    const auxContainer = document.createElement('div');
    auxContainer.id = "stay100-auxiliary-wrapper";
    auxContainer.style.cssText = "margin-top: 50px; display: flex; flex-direction: column; gap: 40px; width: 100%; font-family: sans-serif; grid-column: 1 / -1;";

    const postsSource = typeof allPosts !== 'undefined' ? allPosts : [];
    const latestListings = [...postsSource].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 4);
    const recommendedListings = [...postsSource].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);

    const generateRowCards = (list) => {
        if (list.length === 0) return `<p style="color:#666; font-size:14px;">No verified entries in this structural category.</p>`;
        return list.map(item => `
            <div onclick="window.location.href='details.html?id=${item.id}'" style="background:#fff; border: 1px solid #e2e8f0; border-radius:12px; padding:16px; min-width:260px; flex:1; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.03); transition: transform 0.2s;">
                <h5 style="margin:0 0 6px 0; font-size:15px; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name || item.title}</h5>
                <p style="margin:0 0 10px 0; font-size:12px; color:#64748b;"><i class="fa-solid fa-location-dot"></i> ${item.area || item.location || "Jaipur"}</p>
                <div style="font-weight:700; color:#800020; font-size:15px;">₹${item.price || item.rent}<span style="font-size:11px; font-weight:400; color:#64748b;">/mo</span></div>
            </div>
        `).join('');
    };

    auxContainer.innerHTML = `
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <div>
            <h3 style="font-size:20px; font-weight:700; color:#1e293b; margin-bottom:15px; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-star" style="color:#eab308;"></i> Recommended Properties</h3>
            <div style="display:flex; gap:20px; overflow-x:auto; padding-bottom:10px;">${generateRowCards(recommendedListings)}</div>
        </div>
        <div>
            <h3 style="font-size:20px; font-weight:700; color:#1e293b; margin-bottom:15px; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-clock-rotate-left" style="color:#0284c7;"></i> Latest Premium Listings</h3>
            <div style="display:flex; gap:20px; overflow-x:auto; padding-bottom:10px;">${generateRowCards(latestListings)}</div>
        </div>
    `;

    mainContainerEl.appendChild(auxContainer);
}

// --- INITIALIZE & ATTACH EVENTS ON EXECUTION ---
document.addEventListener('DOMContentLoaded', () => {
    currentSessionUID = localStorage.getItem('stay100_uid') || localStorage.getItem('staypremium_uid') || null;
    updateUserProfileUI();
    parseAndApplyUrlFilters();
    
    document.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('change', window.syncAndRenderFilters);
        element.addEventListener('input', window.syncAndRenderFilters);
    });

    const listingsGrid = document.getElementById('listings-container') || document.getElementById('properties-container-target');
    const filterBtn = document.getElementById('filter-btn');
    const filterModal = document.getElementById('filter-modal');
    const closeModal = document.querySelector('.close-modal');
    const voiceBtn = document.getElementById('voice-search-btn');
    const searchInput = document.getElementById('search-input');
    const categoryCards = document.querySelectorAll('.category-card');

    const sidebar = document.querySelector(".desktop-filters-sidebar");
    if (sidebar) {
        sidebar.classList.add("collapsed");
        document.body.classList.add("filter-hidden");
    }

    const toggleDesktopBtn = document.getElementById("toggle-filter-btn");
    if (toggleDesktopBtn) {
        toggleDesktopBtn.addEventListener("click", () => {
            sidebar.classList.add("collapsed");
            document.body.classList.add("filter-hidden");
        });
    }

    const floatingShowBtn = document.createElement("button");
    floatingShowBtn.className = "show-filter-floating-btn";
    floatingShowBtn.innerHTML = "🔍 Show Filters";
    floatingShowBtn.style.cssText = "position: fixed; left: 20px; bottom: 80px; z-index: 999; background: #800020; color: #fff; border: none; padding: 12px 20px; border-radius: 30px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.2); cursor: pointer; display: none;";
    document.body.appendChild(floatingShowBtn);

    const checkFloatingButtonVisibility = () => {
        if (window.innerWidth > 992 && document.body.classList.contains("filter-hidden")) {
            floatingShowBtn.style.display = "block";
        } else {
            floatingShowBtn.style.display = "none";
        }
    };
    
    setTimeout(checkFloatingButtonVisibility, 100);
    window.addEventListener("resize", checkFloatingButtonVisibility);

    floatingShowBtn.addEventListener("click", () => {
        if (sidebar) {
            sidebar.classList.remove("collapsed");
            document.body.classList.remove("filter-hidden");
            floatingShowBtn.style.display = "none";
        }
    });

    if (filterModal) {
        const bodyTarget = document.getElementById('mobile-filter-body-container');
        if (bodyTarget) {
            bodyTarget.innerHTML = `
                <div class="filter-group">
                    <h4>Budget (Max)</h4>
                    <select class="filter-select" id="m-filter-budget">
                        <option value="">Any Budget</option>
                        <option value="5000">Under ₹5,000</option>
                        <option value="10000">Under ₹10,000</option>
                        <option value="15000">Under ₹15,000</option>
                        <option value="20000">Under ₹20,000</option>
                    </select>
                </div>
                <div class="filter-group">
                    <h4>Gender / Room Type</h4>
                    <div class="filter-options">
                        <label><input type="radio" name="mobile-gender" value="boys"> Boys Only</label>
                        <label><input type="radio" name="mobile-gender" value="girls"> Girls Only</label>
                        <label><input type="radio" name="mobile-gender" value="unisex"> Unisex / Family</label>
                    </div>
                </div>
                <div class="filter-group">
                    <h4>Locality / Area</h4>
                    <input type="text" class="filter-input" id="m-filter-locality" placeholder="e.g., Mansarovar, Malviya Nagar">
                </div>
                <div class="filter-group">
                    <h4>Sharing Type</h4>
                    <div class="filter-options">
                        <label><input type="checkbox" class="m-filter-sharing" value="single"> Private Room / Single</label>
                        <label><input type="checkbox" class="m-filter-sharing" value="double"> 2 Sharing / Double</label>
                        <label><input type="checkbox" class="m-filter-sharing" value="triple"> 3 Sharing / Triple</label>
                    </div>
                </div>
                <div class="filter-group">
                    <h4>Furnishing</h4>
                    <div class="filter-options">
                        <label><input type="checkbox" class="m-filter-furnishing" value="unfurnished"> Unfurnished</label>
                        <label><input type="checkbox" class="m-filter-furnishing" value="semi-furnished"> Semi-Furnished</label>
                        <label><input type="checkbox" class="m-filter-furnishing" value="fully-furnished"> Fully Furnished</label>
                    </div>
                </div>
                <div class="filter-group">
                    <h4>Food Services</h4>
                    <div class="filter-options">
                        <label><input type="checkbox" id="m-filter-food" value="food-included"> Food Included</label>
                    </div>
                </div>
                <div class="filter-group">
                    <h4>Nearby Hubs & Transit</h4>
                    <div class="filter-options">
                        <label><input type="checkbox" class="m-filter-landmark" value="near-school"> Near Schools/Colleges</label>
                        <label><input type="checkbox" class="m-filter-landmark" value="near-hospital"> Near Hospitals</label>
                        <label><input type="checkbox" class="m-filter-landmark" value="near-office"> Near Corporate Offices</label>
                    </div>
                </div>
                <div class="filter-group">
                    <h4>Quick Filters</h4>
                    <div class="filter-options">
                        <label><input type="checkbox" id="m-filter-verified" value="verified"> Verified Properties Only</label>
                        <label><input type="checkbox" id="m-filter-recent" value="recent"> Recently Posted</label>
                    </div>
                </div>
            `;
        }
    }

    const bindSyncEvents = () => {
        document.getElementById('filter-budget')?.addEventListener('change', (e) => {
            const mel = document.getElementById('m-filter-budget'); if(mel) mel.value = e.target.value;
            window.syncAndRenderFilters();
        });
        document.getElementById('m-filter-budget')?.addEventListener('change', (e) => {
            const del = document.getElementById('filter-budget'); if(del) del.value = e.target.value;
            window.syncAndRenderFilters();
        });

        document.getElementById('filter-locality')?.addEventListener('input', (e) => {
            const mel = document.getElementById('m-filter-locality'); if(mel) mel.value = e.target.value;
            window.syncAndRenderFilters();
        });
        document.getElementById('m-filter-locality')?.addEventListener('input', (e) => {
            const del = document.getElementById('filter-locality'); if(del) del.value = e.target.value;
            window.syncAndRenderFilters();
        });

        document.querySelectorAll('input[name="desktop-gender"]').forEach(r => {
            r.addEventListener('change', () => {
                const match = document.querySelector(`input[name="mobile-gender"][value="${r.value}"]`);
                if(match) match.checked = true;
                window.syncAndRenderFilters();
            });
        });
        document.querySelectorAll('input[name="mobile-gender"]').forEach(r => {
            r.addEventListener('change', () => {
                const match = document.querySelector(`input[name="desktop-gender"][value="${r.value}"]`);
                if(match) match.checked = true;
                window.syncAndRenderFilters();
            });
        });

        const syncCheckboxClasses = (desktopClass, mobileClass) => {
            document.addEventListener('change', (e) => {
                if (e.target.classList.contains(desktopClass)) {
                    const matchedVal = e.target.value;
                    const mCB = document.querySelector(`.${mobileClass}[value="${matchedVal}"]`);
                    if(mCB) mCB.checked = e.target.checked;
                    window.syncAndRenderFilters();
                }
                if (e.target.classList.contains(mobileClass)) {
                    const matchedVal = e.target.value;
                    const dCB = document.querySelector(`.${desktopClass}[value="${matchedVal}"]`);
                    if(dCB) dCB.checked = e.target.checked;
                    window.syncAndRenderFilters();
                }
            });
        };

        syncCheckboxClasses('filter-sharing', 'm-filter-sharing');
        syncCheckboxClasses('filter-furnishing', 'm-filter-furnishing');
        syncCheckboxClasses('filter-landmark', 'm-filter-landmark');

        const bindIdSync = (dId, mId) => {
            document.getElementById(dId)?.addEventListener('change', (e) => {
                const target = document.getElementById(mId); if(target) target.checked = e.target.checked;
                window.syncAndRenderFilters();
            });
            document.getElementById(mId)?.addEventListener('change', (e) => {
                const target = document.getElementById(dId); if(target) target.checked = e.target.checked;
                window.syncAndRenderFilters();
            });
        };

        bindIdSync('filter-food', 'm-filter-food');
        bindIdSync('filter-verified', 'm-filter-verified');
        bindIdSync('filter-recent', 'm-filter-recent');
    };

    bindSyncEvents();

    window.applyFilters = function() {
        if(filterModal) filterModal.style.display = 'none';
        window.syncAndRenderFilters();
    };

    window.addEventListener('cityChanged', () => {
        window.renderPostsDataPipeline();
    });

    const inquiryOverlayHtml = `
        <div id="inquiry-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; justify-content:center; align-items:center; padding:15px;">
            <div style="background:#ffffff; width:100%; max-width:440px; border-radius:16px; overflow:hidden; box-shadow:0 12px 28px rgba(0,0,0,0.25);">
                <div style="background:#800020; color:#ffffff; padding:18px; display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; font-size:17px; color:#ffffff;"><i class="fa-solid fa-paper-plane"></i> Book Custom Inquiry</h3>
                    <span id="close-inquiry" style="cursor:pointer; font-size:24px; font-weight:bold;">&times;</span>
                </div>
                <form id="inquiry-form" style="padding:20px; display:flex; flex-direction:column; gap:14px;">
                    <input type="hidden" id="inquiry-property-id">
                    <div>
                        <label style="display:block; font-size:12px; font-weight:600; color:#666;">Full Name</label>
                        <input type="text" id="inquiry-name" required style="width:100%; padding:10px; border:1px solid #ccc; border-radius:8px;">
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; font-weight:600; color:#666;">Mobile Number</label>
                        <input type="tel" id="inquiry-phone" required pattern="[0-9]{10}" placeholder="10-digit number" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:8px;">
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; font-weight:600; color:#666;">Your Message Requirement</label>
                        <textarea id="inquiry-msg" rows="3" placeholder="Sharing preference..." style="width:100%; padding:10px; border:1px solid #ccc; border-radius:8px; resize:none;"></textarea>
                    </div>
                    <button type="submit" class="btn-mehrum" style="width:100%; padding:12px; font-size:15px; border-radius: 8px; border:none; background:#800020; color:#fff; cursor:pointer;">Send Secure Application</button>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', inquiryOverlayHtml);

    const inqModal = document.getElementById('inquiry-modal');
    const closeInqBtn = document.getElementById('close-inquiry');
    const inqForm = document.getElementById('inquiry-form');

    if (closeInqBtn) closeInqBtn.addEventListener('click', () => inqModal.style.display = 'none');

    if (inqForm) {
        if(localStorage.getItem('stay100_name')) document.getElementById('inquiry-name').value = localStorage.getItem('stay100_name');
        if(localStorage.getItem('stay100_phone')) document.getElementById('inquiry-phone').value = localStorage.getItem('stay100_phone');
        
        inqForm.addEventListener('submit', (e) => {
            e.preventDefault();
            executeInquirySubmission();
        });
    }

    if (listingsGrid) {
        listingsGrid.addEventListener('click', (e) => {
            const targetViewBtn = e.target.closest('[data-view-id]');
            const targetInquiryBtn = e.target.closest('[data-inquiry-id]');
            const targetSaveBtn = e.target.closest('[data-save-id]');

            if (targetViewBtn) {
                const targetPropId = targetViewBtn.getAttribute('data-view-id');
                const postObject = allPosts.find(p => p.id === targetPropId);
                if (postObject) {
                    db.ref(`properties/${targetPropId}/views`).set((postObject.views || 0) + 1);
                }
                window.location.href = `details.html?id=${targetPropId}`;
            }

            if (targetSaveBtn) {
                e.preventDefault(); e.stopPropagation();

                const targetPropId = targetSaveBtn.getAttribute('data-save-id');
                const matchedObj = allPosts.find(p => p.id === targetPropId);
                if (!matchedObj) return;

                let bookmarkArray = JSON.parse(localStorage.getItem('stay100_saved_properties')) || JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];
                const pointerIdx = bookmarkArray.indexOf(targetPropId);

                if (currentSessionUID) {
                    const userNodeReference = db.ref(`users_saved/${currentSessionUID}/${targetPropId}`);
                    if (pointerIdx === -1) {
                        userNodeReference.set({ 
                            id: targetPropId, 
                            name: matchedObj.name || matchedObj.title, 
                            price: matchedObj.price || matchedObj.rent || 0, 
                            location: matchedObj.location || matchedObj.area || "",
                            image: matchedObj.image || matchedObj.imageUrl || ""
                        });
                    } else {
                        userNodeReference.remove();
                    }
                }

                if (pointerIdx === -1) {
                    bookmarkArray.push(targetPropId); 
                    localStorage.setItem('stay100_saved_properties', JSON.stringify(bookmarkArray));
                    localStorage.setItem('staypremium_saved_properties', JSON.stringify(bookmarkArray));
                    window.showCenterToast("Saved!");
                } else {
                    bookmarkArray = bookmarkArray.filter(id => id !== targetPropId); 
                    localStorage.setItem('stay100_saved_properties', JSON.stringify(bookmarkArray));
                    localStorage.setItem('staypremium_saved_properties', JSON.stringify(bookmarkArray));
                    window.showCenterToast("Removed.");
                }
                window.renderPostsDataPipeline();
            }

            if (targetInquiryBtn) {
                if (!currentSessionUID) { window.showCenterToast("Authentication Required: Redirecting to Login...", false); setTimeout(() => window.location.href = 'login.html', 1000); return; }
                document.getElementById('inquiry-property-id').value = targetInquiryBtn.getAttribute('data-inquiry-id');
                if (inqModal) inqModal.style.display = 'flex';
            }
        });
    }

    if (searchInput) searchInput.addEventListener('input', window.renderPostsDataPipeline);

    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentCategory = card.dataset.category;
            window.renderPostsDataPipeline();
        });
    });

    if (voiceBtn && searchInput) {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            if (!document.getElementById('premium-voice-ui-styles')) {
                const voiceStyle = document.createElement('style');
                voiceStyle.id = 'premium-voice-ui-styles';
                voiceStyle.innerHTML = `
                    .google-voice-overlay {
                        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                        background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(12px);
                        display: flex; flex-direction: column; align-items: center; justify-content: center;
                        z-index: 99999; opacity: 0; pointer-events: none; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .google-voice-overlay.active { opacity: 1; pointer-events: auto; }
                    .voice-popup-box { text-align: center; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
                    .voice-status-title { font-size: 24px; font-weight: 600; color: #f8fafc; margin-bottom: 8px; }
                    .voice-transcript-live { font-size: 16px; color: #94a3b8; font-style: italic; min-height: 24px; margin-bottom: 40px; max-width: 80%; margin-left: auto; margin-right: auto; }
                    .voice-pulse-container { position: relative; width: 90px; height: 90px; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
                    .voice-mic-ball { width: 70px; height: 70px; background: linear-gradient(135deg, #800020, #a31d3f); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(128, 0, 32, 0.4); z-index: 5; cursor: pointer; }
                    .voice-mic-ball i { color: #ffffff; font-size: 28px; }
                    .pulse-ring { position: absolute; width: 100%; height: 100%; background: rgba(128, 0, 32, 0.3); border-radius: 50%; z-index: 1; animation: googlePulseEffect 2s infinite ease-out; }
                    .pulse-ring-2 { animation-delay: 0.6s; }
                    .pulse-ring-3 { animation-delay: 1.2s; }
                    @keyframes googlePulseEffect { 0% { transform: scale(1); opacity: 0.9; } 100% { transform: scale(2.4); opacity: 0; } }
                    .voice-cancel-btn { margin-top: 50px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; padding: 10px 24px; border-radius: 24px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
                    .voice-cancel-btn:hover { background: rgba(255, 255, 255, 0.2); color: #fff; }
                `;
                document.head.appendChild(voiceStyle);
            }

            if (!document.getElementById('google-voice-popup-modal')) {
                const modalDiv = document.createElement('div');
                modalDiv.id = 'google-voice-popup-modal';
                modalDiv.className = 'google-voice-overlay';
                modalDiv.innerHTML = `
                    <div class="voice-popup-box">
                        <div class="voice-status-title" id="v-status">Listening Live...</div>
                        <div class="voice-transcript-live" id="v-transcript">Speak now...</div>
                        <div class="voice-pulse-container">
                            <div class="pulse-ring"></div>
                            <div class="pulse-ring pulse-ring-2"></div>
                            <div class="pulse-ring pulse-ring-3"></div>
                            <div class="voice-mic-ball"><i class="fa-solid fa-microphone"></i></div>
                        </div>
                        <button class="voice-cancel-btn" id="v-cancel-btn">Cancel</button>
                    </div>
                `;
                document.body.appendChild(modalDiv);
            }

            const SpeechEngine = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognizerInstance = new SpeechEngine();
            
            recognizerInstance.lang = 'en-IN';
            recognizerInstance.interimResults = true; 
            recognizerInstance.maxAlternatives = 1;

            const voiceOverlay = document.getElementById('google-voice-popup-modal');
            const vStatus = document.getElementById('v-status');
            const vTranscript = document.getElementById('v-transcript');
            const vCancelBtn = document.getElementById('v-cancel-btn');

            voiceBtn.addEventListener('click', (e) => {
                e.preventDefault();
                voiceOverlay.classList.add('active');
                vStatus.innerText = "Listening Live...";
                vTranscript.innerText = "Listening for speech input...";
                try {
                    recognizerInstance.start();
                } catch(err) { console.log("Instance active bypass."); }
            });

            recognizerInstance.onresult = (evt) => {
                const currentTranscript = evt.results[0][0].transcript;
                vTranscript.innerText = `"${currentTranscript}"`;
                
                if (evt.results[0].isFinal) {
                    searchInput.value = currentTranscript;
                    vStatus.innerText = "Recognized!";
                    setTimeout(() => {
                        voiceOverlay.classList.remove('active');
                        window.renderPostsDataPipeline(); 
                    }, 600);
                }
            };

            recognizerInstance.onerror = (evt) => {
                vStatus.innerText = "Speech not recognized...";
                vTranscript.innerText = "Please try again or type manually.";
                setTimeout(() => voiceOverlay.classList.remove('active'), 1800);
            };

            recognizerInstance.onend = () => {
                setTimeout(() => {
                    if(voiceOverlay.classList.contains('active') && vStatus.innerText === "Listening Live...") {
                        voiceOverlay.classList.remove('active');
                    }
                }, 4000);
            };

            vCancelBtn.addEventListener('click', () => {
                recognizerInstance.abort();
                voiceOverlay.classList.remove('active');
            });

        } else {
            voiceBtn.style.display = 'none';
        }
    }

    if (filterBtn) filterBtn.addEventListener('click', () => { if(filterModal) filterModal.style.display = 'flex'; });
    if (closeModal) closeModal.addEventListener('click', () => { if(filterModal) filterModal.style.display = 'none'; });
    
    window.addEventListener('click', (e) => { 
        if (e.target === filterModal) filterModal.style.display = 'none'; 
        if (e.target === inqModal) inqModal.style.display = 'none'; 
    });
});

db.ref('properties').on('value', (snapshot) => {
    const response = snapshot.val();
    allPosts = response ? Object.keys(response).map(key => ({ id: key, views: 0, ...response[key] })) : [];
    window.renderPostsDataPipeline(); 
});

db.ref('banners').on('value', (snapshot) => {
    const rawData = snapshot.val();
    const bannersContainer = document.getElementById('dynamic-banners-container');
    if (bannersContainer) {
        let parsedBanners = [];
        if (rawData) {
            parsedBanners = Object.values(rawData);
            if (parsedBanners.length > 3) {
                parsedBanners = parsedBanners.slice(-3).reverse();
            } else {
                parsedBanners = parsedBanners.reverse();
            }
        }
        if (parsedBanners.length === 0) {
            parsedBanners = [
                { link: "#", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1600&q=80" },
                { link: "#", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80" },
                { link: "#", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80" }
            ];
        }
        generateBannerSlidesLayout(parsedBanners);
    }
});

function optimizeCloudinaryUrl(url) {
    if (!url || !url.includes("cloudinary.com")) return url;
    if (url.includes("/upload/")) {
        return url.replace("/upload/", "/upload/f_auto,q_auto:best/");
    }
    return url;
}

function generateBannerSlidesLayout(banners) {
    const bannersContainer = document.getElementById('dynamic-banners-container');
    if (!bannersContainer) return;

    if (!document.getElementById('slider-core-styles')) {
        const styleSheet = document.createElement("style");
        styleSheet.id = "slider-core-styles";
        styleSheet.innerText = `
            .slider-wrapper-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; background: #111827; z-index: 1; }
            .dynamic-banner-slide { display: none; width: 100%; height: 100%; text-decoration: none; background-position: center center; background-repeat: no-repeat; transition: opacity 0.7s ease-in-out; opacity: 0; }
            .dynamic-banner-slide.active { display: block !important; opacity: 1; }
            @media (min-width: 768px) { .dynamic-banner-slide { background-size: cover; } }
            @media (max-width: 767px) { .dynamic-banner-slide { background-size: 100% 100%; } }
        `;
        document.head.appendChild(styleSheet);
    }

    let finalHtml = '';
    banners.forEach((item, index) => {
        const activeClass = index === 0 ? 'active' : '';
        const desktopUrl = optimizeCloudinaryUrl(item.desktopImage || item.image);
        const mobileUrl = optimizeCloudinaryUrl(item.mobileImage || item.image);
        const clickRedirectUrl = item.link || '#';
        const isMobile = window.innerWidth < 768;
        const currentBgImage = isMobile ? mobileUrl : desktopUrl;

        finalHtml += `
            <a href="${clickRedirectUrl}" 
               class="dynamic-banner-slide ${activeClass}" 
               data-mobile-bg="${mobileUrl}" 
               data-desktop-bg="${desktopUrl}"
               style="background-image: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.15)), url('${currentBgImage}');">
            </a>
        `;
    });

    bannersContainer.innerHTML = finalHtml;
    initializeAutomaticBannerEngine();
}

let bannerTimer = null;
function initializeAutomaticBannerEngine() {
    if (bannerTimer) clearInterval(bannerTimer);
    const slides = document.querySelectorAll('.dynamic-banner-slide');
    if (slides.length <= 1) return; 

    let currentSlideIndex = 0;
    bannerTimer = setInterval(() => {
        if(slides[currentSlideIndex]) slides[currentSlideIndex].classList.remove('active');
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        if(slides[currentSlideIndex]) slides[currentSlideIndex].classList.add('active');
    }, 4500); 

    window.removeEventListener('resize', handleSliderResize); 
    window.addEventListener('resize', handleSliderResize);
}

function handleSliderResize() {
    const slides = document.querySelectorAll('.dynamic-banner-slide');
    const isMobile = window.innerWidth < 768;
    slides.forEach(slide => {
        const targetBg = isMobile ? slide.getAttribute('data-mobile-bg') : slide.getAttribute('data-desktop-bg');
        slide.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.2)), url('${targetBg}')`;
    });
}