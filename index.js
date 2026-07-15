/**
 * StayPremium - Enhanced Realtime Engine (Next-Gen Production Build)
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
let vendorsSubscriptionData = {}; 
let currentCategory = 'all';
let currentSessionUID = localStorage.getItem('stay100%_uid') || null;

// --- GLOBAL FILTER STATE MATRIX ---
window.filterState = {
    maxBudget: Infinity,
    area: "all",
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
        const currentName = localStorage.getItem('staypremium_name') || "User Node";
        if (isVerified) {
            profileNameContainer.innerHTML = `${currentName} <span style="background:#1da1f2; color:#fff; padding:2px 6px; border-radius:50px; font-size:11px; margin-left:5px;"><i class="fa-solid fa-badge-check"></i> Stay100% Verified</span>`;
        } else {
            profileNameContainer.innerHTML = currentName;
        }
    }
}

// --- FILTER CORE SYNC ENGINE ---
window.syncAndRenderFilters = function() {
    // 1. Budget Filter Sync
    const dBudget = document.getElementById('filter-budget')?.value;
    window.filterState.maxBudget = dBudget ? parseFloat(dBudget) : Infinity;

    // 2. Locality/Area Filter Sync
    window.filterState.area = document.getElementById('filter-locality')?.value?.toLowerCase().trim() || "";
    
    // 3. Gender Filter Sync
    const genderActive = document.querySelector('input[name="desktop-gender"]:checked') || document.getElementById('filter-gender');
    window.filterState.gender = (genderActive && genderActive.value) ? genderActive.value : "all";

    // 4. Sharing Type Array Sync
    window.filterState.sharingType = [];
    document.querySelectorAll('.filter-sharing:checked, .m-filter-sharing:checked').forEach(cb => {
        if(!window.filterState.sharingType.includes(cb.value)) {
            window.filterState.sharingType.push(cb.value);
        }
    });

    // 5. Furnishing Status Array Sync
    window.filterState.furnishing = [];
    document.querySelectorAll('.filter-furnishing:checked, .m-filter-furnishing:checked').forEach(cb => {
        if(!window.filterState.furnishing.includes(cb.value)) {
            window.filterState.furnishing.push(cb.value);
        }
    });

    // 6. Food Included / Mess Status
    window.filterState.foodIncluded = document.getElementById('filter-food')?.checked || document.getElementById('m-filter-food')?.checked || false;

    // 7. Nearby Hubs / Landmarks Checklist
    window.filterState.nearbyHubs = [];
    document.querySelectorAll('.filter-landmark:checked, .m-filter-landmark:checked').forEach(cb => {
        if(!window.filterState.nearbyHubs.includes(cb.value)) {
            window.filterState.nearbyHubs.push(cb.value);
        }
    });

    // 8. Verification & Recently Posted Flags
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
            const el = document.getElementById('filter-gender'); if(el) el.value = 'all';
            const mel = document.getElementById('m-filter-gender'); if(mel) mel.value = 'all';
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

// --- EMPTY STATE RENDERING TEMPLATE ---
function getEmptyStateHTML() {
    return `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center; max-width: 600px; margin: 30px auto;">
            <img src="assets/stay100.png" alt="No Results" style="width: 100%; max-width: 280px; height: auto; margin-bottom: 25px; filter: drop-shadow(0px 8px 16px rgba(0,0,0,0.08));">
            <h3 style="margin: 0 0 8px 0; color: #1e293b; font-family: sans-serif; font-size: 22px; font-weight: 700;">No Matching Spaces Found</h3>
            <p style="margin: 0 0 20px 0; color: #64748b; font-family: sans-serif; font-size: 14px; line-height: 1.5; max-width: 400px;">We couldn't find any properties matching your selected filters. Try widening your budget or clearing some filters to explore more options!</p>
            <button onclick="window.clearAllFilters()" style="background: #800020; color: #ffffff; border: none; padding: 12px 24px; font-size: 14px; font-weight: 600; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.2s; box-shadow: 0 4px 12px rgba(128,0,32,0.2);">
                <i class="fa-solid fa-filter-circle-xmark"></i> Clear All Filters
            </button>
        </div>
    `;
}

// --- PARSE URL PARAMETERS AND INJECT INTO STATE FIXED ---
function parseAndApplyUrlFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Global filterState structure safety check
    if (!window.filterState) window.filterState = {};
    
    // 1. City Linkage
    const locationParam = urlParams.get('location');
    if (locationParam) {
        localStorage.setItem('staypremium_selected_city', locationParam.toLowerCase().trim());
        const headerCityLabel = document.getElementById('current-city-label');
        if (headerCityLabel) {
            headerCityLabel.innerText = locationParam.charAt(0).toUpperCase() + locationParam.slice(1);
        }
        window.dispatchEvent(new Event('cityChanged'));
    }

    // 2. Category Tab Linkage
    const typeParam = urlParams.get('type');
    if (typeParam) {
        const currentCategory = typeParam.toLowerCase().trim();
        document.querySelectorAll('.category-card').forEach(card => {
            if (card.dataset.category === currentCategory) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    // 3. Locality / Area Ingest
    const areaParam = urlParams.get('area');
    if (areaParam) {
        window.filterState.area = areaParam.toLowerCase().trim();
        const el = document.getElementById('filter-locality'); if (el) el.value = areaParam;
        const mel = document.getElementById('m-filter-locality'); if (mel) mel.value = areaParam;
    }

    // 4. Budget Param Parsing (e.g., 10k, 12k, 15k)
    const budgetParam = urlParams.get('budget');
    if (budgetParam) {
        let cleanBudget = parseFloat(budgetParam.replace('k', '')) * 1000;
        if (!isNaN(cleanBudget)) {
            window.filterState.maxBudget = cleanBudget;
            const el = document.getElementById('filter-budget'); if (el) el.value = cleanBudget;
            const mel = document.getElementById('m-filter-budget'); if (mel) mel.value = cleanBudget;
        }
    }

    // 5. Gender Param
    const genderParam = urlParams.get('gender');
    if (genderParam) {
        const cleanGender = genderParam.toLowerCase().trim();
        window.filterState.gender = cleanGender;
        document.querySelectorAll(`input[name="desktop-gender"][value="${cleanGender}"], input[name="mobile-gender"][value="${cleanGender}"]`).forEach(rb => rb.checked = true);
        const el = document.getElementById('filter-gender'); if (el) el.value = cleanGender;
    }

    // 6. Sharing Param
    const sharingParam = urlParams.get('sharing');
    if (sharingParam) {
        const cleanSharing = sharingParam.toLowerCase().trim();
        window.filterState.sharingType = [cleanSharing];
        document.querySelectorAll(`.filter-sharing[value="${cleanSharing}"], .m-filter-sharing[value="${cleanSharing}"]`).forEach(cb => cb.checked = true);
    }

    // 7. Verified Badge Param
    const verifiedParam = urlParams.get('verified');
    if (verifiedParam === 'true') {
        window.filterState.verifiedOnly = true;
        const el = document.getElementById('filter-verified'); if (el) el.checked = true;
        const mel = document.getElementById('m-filter-verified'); if (mel) mel.checked = true;
    }

    // 8. Institutional Landmark Hubs Mapping
    const landmarkParam = urlParams.get('landmark');
    if (landmarkParam) {
        const cleanLandmark = landmarkParam.toLowerCase().trim();
        // Mobile desktop targets mapping wrapper logic
        let matchedHubValue = cleanLandmark.startsWith('near-') ? cleanLandmark : "near-" + cleanLandmark;
        
        // Mobile markup uses direct strings like "coaching" / "metro" directly
        window.filterState.nearbyHubs = [matchedHubValue];
        
        // Select selectors smoothly
        document.querySelectorAll(`.filter-landmark[value="${matchedHubValue}"], .m-filter-landmark[value="${cleanLandmark}"]`).forEach(cb => cb.checked = true);
    }

    // Call chip renderer safely if defined
    if (typeof renderActiveFilterChips === "function") {
        renderActiveFilterChips();
    }
}

// --- DATA FILTERING PIPELINE ENGINE ---
window.renderPostsDataPipeline = function() {
    const listingsGrid = document.getElementById('listings-container');
    if (!listingsGrid) return;
    listingsGrid.innerHTML = '';
    
    const searchInput = document.getElementById('search-input');
    const searchKeyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const activeSelectedGlobalCity = (localStorage.getItem('staypremium_selected_city') || "all").toLowerCase().trim();

    // --- DYNAMIC HEADING LOGIC ---
    const headingNode = document.getElementById('listings-heading');
    if (headingNode) {
        let headingParts = [];
        
        if (window.filterState && window.filterState.gender && window.filterState.gender !== "all") {
            headingParts.push(window.filterState.gender.charAt(0).toUpperCase() + window.filterState.gender.slice(1));
        }
        
        if (typeof currentCategory !== 'undefined' && currentCategory && currentCategory !== 'all') {
            let catText = currentCategory === 'pg' ? "PGs" : currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1) + "s";
            headingParts.push(catText);
        } else {
            headingParts.push("Spaces"); 
        }
        
        let activeLocation = "";
        if (window.filterState && window.filterState.area) {
            activeLocation = window.filterState.area;
        } else if (activeSelectedGlobalCity && activeSelectedGlobalCity !== 'all' && activeSelectedGlobalCity !== 'all cities') {
            activeLocation = activeSelectedGlobalCity;
        }
        
        if (activeLocation) {
            headingParts.push(`in ${activeLocation.charAt(0).toUpperCase() + activeLocation.slice(1)}`);
        }

        const totalText = headingParts.join(' ');
        if (totalText === "Spaces" || totalText === "Spaces in all") {
            headingNode.innerText = "Stay100% Spaces";
        } else {
            headingNode.innerText = `Results for ${totalText}`;
        }
    }

    if (allPosts.length === 0) {
        listingsGrid.innerHTML = getEmptyStateHTML();
        return;
    }

    const locallySavedItems = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];

    let filteredOutputs = allPosts.filter(item => {
        const title = (item.name || item.title || "").toLowerCase();
        const placement = (item.location || item.area || "").toLowerCase();
        const itemCityNode = (item.city || "").toLowerCase().trim();
        const baseCategory = (item.category || "").toLowerCase().trim();
        const itemGender = (item.gender || "").toLowerCase().trim();
        const itemTags = Array.isArray(item.tags) ? item.tags.map(t => t.toLowerCase()) : [];

        // Global City Logic Filter Match
        let matchesGlobalCity = false;
        if (activeSelectedGlobalCity === "all" || activeSelectedGlobalCity === "all cities" || activeSelectedGlobalCity === "") {
            matchesGlobalCity = true;
        } else if (itemCityNode !== "") {
            matchesGlobalCity = (itemCityNode === activeSelectedGlobalCity || activeSelectedGlobalCity.includes(itemCityNode) || itemCityNode.includes(activeSelectedGlobalCity));
        } else {
            matchesGlobalCity = placement.includes(activeSelectedGlobalCity) || title.includes(activeSelectedGlobalCity);
        }

        // Live Input Keyword Search Match
        const isSearchMatch = !searchKeyword || title.includes(searchKeyword) || placement.includes(searchKeyword);
        
        // Category Sync Layout Configuration Validation
        let isCategoryMatch = false;
        if (currentCategory === 'all' || currentCategory === '') { 
            isCategoryMatch = true;
        } else if (currentCategory === 'flatmate') {
            isCategoryMatch = (baseCategory === 'flatmate' || title.includes('flatmate') || title.includes('sharing') || title.includes('roommate'));
        } else if (currentCategory === 'pg') {
            isCategoryMatch = (baseCategory === 'pg' || title.includes('pg') || baseCategory === 'hostel');
        } else if (currentCategory === 'flat') {
            isCategoryMatch = (baseCategory === 'flat' || baseCategory === 'apartment' || title.includes('bhk') || title.includes('flat'));
        } else if (currentCategory === 'room') {
            isCategoryMatch = (baseCategory === 'room' || baseCategory === 'single room' || title.includes('room'));
        }

        // Deep Filters Criteria
        const itemPrice = parseFloat(item.price || item.rent || 0);
        const checkMaxBudget = itemPrice <= window.filterState.maxBudget;
        
        const checkArea = window.filterState.area === "" || 
                            (item.area && item.area.toLowerCase().includes(window.filterState.area)) || 
                            placement.includes(window.filterState.area);
        
        let checkGender = true;
        if(window.filterState.gender && window.filterState.gender !== "all") {
            checkGender = (itemGender === window.filterState.gender || title.includes(window.filterState.gender));
        }

        let checkSharing = true;
        if (window.filterState.sharingType.length > 0) {
            checkSharing = window.filterState.sharingType.some(type => {
                const itemSharingStr = (item.sharingType || "").toLowerCase();
                return itemSharingStr.includes(type) || title.includes(type);
            });
        }

        let checkFurnishing = true;
        if (window.filterState.furnishing.length > 0) {
            checkFurnishing = window.filterState.furnishing.some(furnishOpt => {
                const itemFurnishingStr = (item.furnishing || "").toLowerCase().replace('-', '').replace(' ', '');
                const cleanOpt = furnishOpt.replace('-', '').replace(' ', '');
                return itemFurnishingStr.includes(cleanOpt);
            });
        }

        let checkFood = true;
        if (window.filterState.foodIncluded) {
            checkFood = (item.foodIncluded === true || item.mess === true || title.includes('food') || title.includes('mess') || itemTags.includes('food included'));
        }

        let checkLandmarks = true;
        if (window.filterState.nearbyHubs.length > 0) {
            checkLandmarks = window.filterState.nearbyHubs.some(hub => {
                if (hub === 'near-school' || hub === 'coaching') return title.includes('college') || title.includes('school') || title.includes('coaching') || title.includes('allen') || itemTags.includes('near school') || !!item.nearSchool;
                if (hub === 'near-hospital') return title.includes('hospital') || itemTags.includes('near hospital') || !!item.nearHospital;
                if (hub === 'near-office') return title.includes('office') || title.includes('hub') || itemTags.includes('near office') || !!item.nearOffice;
                return false;
            });
        }

        let checkVerifiedOnly = true;
        if (window.filterState.verifiedOnly) {
            checkVerifiedOnly = (item.isVerified === true || checkVendorVerification(item.vendorId || item.userId));
        }

        return matchesGlobalCity && isSearchMatch && isCategoryMatch && checkMaxBudget && checkArea && checkGender && checkSharing && checkFurnishing && checkFood && checkLandmarks && checkVerifiedOnly;
    });

    let scoredOutputs = filteredOutputs.map(post => {
        const isVendorVerified = checkVendorVerification(post.vendorId || post.userId) || post.isVerified === true;
        let sortingScore = (post.views || 0) + (isVendorVerified ? 100000 : 0);
        
        if (window.filterState.recentlyPosted && post.timestamp) {
            sortingScore += post.timestamp / 1000000;
        }
        return { ...post, isVendorVerified, sortingScore };
    });

    scoredOutputs.sort((a, b) => b.sortingScore - a.sortingScore);

    if (typeof renderPosts === "function" && document.getElementById('postContainer')) {
        renderPosts(scoredOutputs);
        return;
    }

    if (scoredOutputs.length === 0) {
        listingsGrid.innerHTML = getEmptyStateHTML();
        return;
    }

    listingsGrid.innerHTML = scoredOutputs.map(post => {
        return window.PropertyCardComponent.render(post, locallySavedItems);
    }).join('');

    if (window.PropertyCardComponent && typeof window.PropertyCardComponent.initAutoswipe === 'function') {
        setTimeout(() => { window.PropertyCardComponent.initAutoswipe(); }, 50);
    }
};

function renderPosts(postsToRender) {
    const postContainer = document.getElementById('postContainer');
    if (!postContainer) return;
    postContainer.innerHTML = '';

    if (postsToRender.length === 0) {
        postContainer.innerHTML = getEmptyStateHTML();
        return;
    }

    const locallySavedItems = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];
    postsToRender.forEach(post => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = window.PropertyCardComponent.render(post, locallySavedItems);
        postContainer.appendChild(wrapper.firstElementChild);
    });

    if (window.PropertyCardComponent && typeof window.PropertyCardComponent.initAutoswipe === 'function') {
        setTimeout(() => { window.PropertyCardComponent.initAutoswipe(); }, 50);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Sync current session UID securely
    currentSessionUID = localStorage.getItem('stay100%_uid') || null;
    if (typeof updateUserProfileUI === 'function') updateUserProfileUI();

    // --- TOP LEVEL DOM ELEMENT DECLARATIONS ---
    const listingsGrid = document.getElementById('listings-container');
    const filterBtn = document.getElementById('filter-btn');
    const filterModal = document.getElementById('filter-modal');
    const closeModal = document.querySelector('.close-modal');
    const voiceBtn = document.getElementById('voice-search-btn');
    const searchInput = document.getElementById('search-input');
    const categoryCards = document.querySelectorAll('.category-card');

    // --- MOBILE BOTTOM NAVIGATION SYSTEM INJECTION ---
    const mobileContainer = document.getElementById('dynamic-footer-container');
    if (mobileContainer) {
        mobileContainer.innerHTML = `
            <nav class="mobile-bottom-nav">
                <a href="index.html" class="nav-item" data-page="home"><i class="fa-solid fa-house"></i><span>Home</span></a>
                <a href="pg.html" class="nav-item" data-page="pg"><i class="fa-solid fa-hotel"></i><span>PG's</span></a>
                <a href="room.html" class="nav-item" data-page="rooms"><i class="fa-solid fa-bed"></i><span>Rooms</span></a>
                <a href="profile.html" class="nav-item" data-page="profile"><i class="fa-solid fa-user"></i><span>Profile</span></a>
            </nav>
        `;
    }

    // --- DESKTOP FOOTER SYSTEM INJECTION WITH SEO LINK SYNC ---
    const desktopFooterContainer = document.getElementById('dynamic-desktop-footer-container');
    if (desktopFooterContainer) {
        desktopFooterContainer.innerHTML = `
            <div class="footer-toggle-wrapper">
                <button id="btn-global-footer-toggle" class="btn-footer-toggle">
                    <i class="fa-solid fa-circle-chevron-down" id="toggle-icon" style="transition: transform 0.3s ease;"></i> 
                    <span id="toggle-text">Show Full Directory</span>
                </button>
            </div>

            <footer id="staypremium-core-footer" class="main-desktop-footer" style="display: none; opacity: 0; transition: opacity 0.3s ease;">
                <svg class="footer-landscape-art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" preserveAspectRatio="none">
                    <path d="M-50,400 L200,180 L450,320 L750,110 L1100,340 L1250,220 L1250,400 Z" fill="none" stroke="#ffffff" stroke-width="1.5" />
                    <path d="M50,400 L380,230 L600,340 L900,160 L1250,390 Z" fill="none" stroke="#ffffff" stroke-width="1" stroke-dasharray="5,5" />
                    <g transform="translate(150, 220) scale(0.85)">
                        <polygon points="120,40 40,110 200,110" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/>
                        <rect x="55" y="110" width="130" height="90" fill="none" stroke="#ffffff" stroke-width="2" />
                        <rect x="100" y="145" width="40" height="55" fill="none" stroke="#ffffff" stroke-width="2" />
                        <circle cx="132" cy="172" r="2" fill="#ffffff" />
                    </g>
                    <line x1="0" y1="398" x2="1200" y2="398" stroke="#ffffff" stroke-width="3" />
                </svg>

                <div class="footer-grid-container">
                    <div class="footer-brand-column">
                        <a href="index.html" class="footer-logo-link">
                            <img src="assets/stay100-1.png" alt="Stay100% Logo" style="height: 52px; width: auto; object-fit: contain;" />
                        </a>
                        <p>Experience ultra-premium co-living environments with verified properties, automated maintenance pipelines, and verified room allocation architectures tailored globally.</p>
                        <div class="footer-social-icons">
                            <a href="https://facebook.com" target="_blank" class="fb-link"><i class="fa-brands fa-facebook-f"></i></a>
                            <a href="https://instagram.com" target="_blank" class="insta-link"><i class="fa-brands fa-instagram"></i></a>
                            <a href="https://twitter.com" target="_blank" class="x-link"><i class="fa-brands fa-x-twitter"></i></a>
                            <a href="https://linkedin.com" target="_blank" class="ln-link"><i class="fa-brands fa-linkedin-in"></i></a>
                        </div>
                    </div>
                    
                    <div class="footer-column">
                        <h4>Company</h4>
                        <ul class="footer-links-list">
                            <li><a href="aboutus.html">About Corporate Group</a></li>
                            <li><a href="ecosystem.html">Premium Ecosystem</a></li>
                            <li><a href="privacy-policy.html">Privacy Policy</a></li>
                            <li><a href="terms.html">Terms & Conditions</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-column">
                        <h4>Partners</h4>
                        <ul class="footer-links-list">
                            <li><a href="admin.html">Admin Hub</a></li>
                            <li><a href="corporate.html">Corporate Tie-ups</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-column">
                        <h4>Contact Info</h4>
                        <div class="footer-address-info">
                            <p><i class="fa-solid fa-location-dot"></i> <span>Plot 45, Sector 12, Mansarovar Main Road, Jaipur, Rajasthan, 302020</span></p>
                            <p><i class="fa-solid fa-phone"></i> <span>+91 98765 43210</span></p>
                            <p><i class="fa-solid fa-envelope"></i> <span>support@staypremium.in</span></p>
                        </div>
                    </div>
                </div>

                <div class="footer-seo-tabs-container">
                    <div class="seo-tabs-nav">
                        <button class="seo-tab-trigger active-tab" data-target="panel-north-west-cities">North & West Directory</button>
                        <button class="seo-tab-trigger" data-target="panel-south-cities">South Metro Directory</button>
                        <button class="seo-tab-trigger" data-target="panel-flatmates">Configurations & Trust</button>
                    </div>

                    <div class="seo-tabs-content-body">
                        <div id="panel-north-west-cities" class="seo-tab-panel active-panel">
                            <div class="seo-column-group">
                                <h5>Jaipur</h5>
                                <div class="seo-links-list">
                                    <a href="jaipur.html?type=flat&area=mansarovar">Flats in Mansarovar Main Road</a>
                                    <a href="jaipur.html?type=flat&area=gopalpura">1 & 2 BHK in Gopalpura Bypass</a>
                                    <a href="jaipur.html?type=flat&area=malviyanagar">Furnished Apartments Malviya Nagar</a>
                                    <a href="jaipur.html?type=flat&area=station">Rental Rooms near Jaipur Junction</a>
                                    <a href="jaipur.html?type=flat&budget=10k">Budget Rental Flats under 10k</a>
                                </div>
                            </div>
                            <div class="seo-column-group">
                                <h5>Delhi NCR</h5>
                                <div class="seo-links-list">
                                    <a href="delhi.html?type=flat&area=rajindernagar">UPSC Hub Flats Old Rajinder Nagar</a>
                                    <a href="delhi.html?type=flat&area=laxminagar">1 BHK Apartments in Laxmi Nagar</a>
                                    <a href="delhi.html?type=flat&area=northcampus">Student Flats near DU North Campus</a>
                                    <a href="delhi.html?type=flat&area=satyaniketan">Studio Flats in Satya Niketan</a>
                                    <a href="delhi.html?type=flat&area=ndls">Properties near New Delhi Station</a>
                                </div>
                            </div>
                            <div class="seo-column-group">
                                <h5>Gurugram</h5>
                                <div class="seo-links-list">
                                    <a href="gurugram.html?type=flat&area=cybercity">Corporate Suites near Cyber City</a>
                                    <a href="gurugram.html?type=flat&area=sector48">Luxury 2 BHK Sector 48 Sohna Road</a>
                                    <a href="gurugram.html?type=flat&area=hudacity">Studio Rooms near Millennium Metro</a>
                                    <a href="gurugram.html?type=flat&area=sector21">Managed Flat Systems Sector 21</a>
                                    <a href="gurugram.html?type=flat&budget=15k">Premium Flats under 15k</a>
                                </div>
                            </div>
                            <div class="seo-column-group">
                                <h5>Noida</h5>
                                <div class="seo-links-list">
                                    <a href="noida.html?type=flat&area=sector62">IT Park Linked Flats Sector 62</a>
                                    <a href="noida.html?type=flat&area=sector15">Metro Walk Apartments Sector 15</a>
                                    <a href="noida.html?type=flat&area=knowledgepark">Greater Noida Knowledge Park Units</a>
                                    <a href="noida.html?type=flat&area=amity">Independent Stays near Amity</a>
                                    <a href="noida.html?type=flat&budget=12k">Fully Furnished Flats under 12k</a>
                                </div>
                            </div>
                            <div class="seo-column-group">
                                <h5>Mumbai & Pune</h5>
                                <div class="seo-links-list">
                                    <a href="mumbai.html?type=pg&area=andheri">Executive Co-living in Andheri West</a>
                                    <a href="mumbai.html?type=pg&area=powai">IIT Tech Circle PG in Powai</a>
                                    <a href="pune.html?type=pg&area=hinjewadi">Hinjewadi Infotech Phase 1-3 PG</a>
                                    <a href="pune.html?type=pg&area=vimannagar">Symbiosis Student Rooms Viman Nagar</a>
                                    <a href="pune.html?type=pg&facility=food">Premium Food Attached PG Pune</a>
                                </div>
                            </div>
                        </div>

                        <div id="panel-south-cities" class="seo-tab-panel">
                            <div class="seo-column-group">
                                <h5>Bangalore</h5>
                                <div class="seo-links-list">
                                    <a href="bengluru.html?type=flat&area=hsrlayout">Premium 1 & 2 BHK HSR Layout</a>
                                    <a href="bengluru.html?type=pg&area=koramangala">Luxury Tech Co-living Koramangala</a>
                                    <a href="bengluru.html?type=flatmate&area=indiranagar">Shared Roommate Systems Indiranagar</a>
                                    <a href="bengluru.html?type=flat&area=marathahalli">IT Corridor Rental Flats Marathahalli</a>
                                    <a href="bengluru.html?type=flat&budget=15k">Fully Furnished Units under 15k</a>
                                </div>
                            </div>
                            <div class="seo-column-group">
                                <h5>Hyderabad</h5>
                                <div class="seo-links-list">
                                    <a href="hyderabad.html?type=pg&area=hitechcity">Luxury Co-living near HITEC City</a>
                                    <a href="hyderabad.html?type=pg&area=gachibowli">Professional Suites Gachibowli</a>
                                    <a href="hyderabad.html?type=pg&area=ameerpet">Coaching Area Rooms Ameerpet Hub</a>
                                    <a href="hyderabad.html?type=flat&area=madhapur">Managed Studio Flats Madhapur</a>
                                    <a href="hyderabad.html?type=pg&budget=6k">Sharing Room Systems under 6k</a>
                                </div>
                            </div>
                            <div class="seo-column-group">
                                <h5>Chennai</h5>
                                <div class="seo-links-list">
                                    <a href="chennai.html?type=flat&area=omr">IT Highway Rooms OMR Road</a>
                                    <a href="chennai.html?type=pg&area=adyar">Student Co-living Hostels Adyar</a>
                                    <a href="chennai.html?type=flat&area=velachery">1 & 2 BHK Apartments Velachery</a>
                                    <a href="chennai.html?type=pg&area=anna-nagar">Executive Staying Units Anna Nagar</a>
                                    <a href="chennai.html?type=flat&budget=10k">Budget Rental Rooms under 10k</a>
                                </div>
                            </div>
                        </div>

                        <div id="panel-flatmates" class="seo-tab-panel">
                            <div class="seo-column-group">
                                <h5>Configurations Directory</h5>
                                <div class="seo-links-list">
                                    <a href="index.html?gender=girls">Girls Only Premium Shared Spaces</a>
                                    <a href="index.html?gender=boys">Boys Executive Co-living Flatmates</a>
                                    <a href="index.html?sharing=single">Single Occupancy Private Rooms</a>
                                    <a href="index.html?sharing=double">Double Sharing Corporate Setup</a>
                                    <a href="index.html?verified=true">Zero-Deposit Verified Rental Networks</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="footer-bottom-bar">
                    <div>© 2026 Stay100% All Rights Reserved. Conceptualized by Stay100% Enterprise Network.</div>
                </div>
            </footer>
        `;
    
        // --- FOOTER TOGGLE ATTACHMENT ---
        const toggleBtn = document.getElementById('btn-global-footer-toggle');
        const footerCore = document.getElementById('staypremium-core-footer');
        const toggleIcon = document.getElementById('toggle-icon');
        const toggleText = document.getElementById('toggle-text');

        if (toggleBtn && footerCore) {
            toggleBtn.addEventListener('click', function() {
                if (footerCore.style.display === 'none' || footerCore.style.display === '') {
                    footerCore.style.display = 'block';
                    setTimeout(() => { footerCore.style.opacity = '1'; }, 10);
                    if(toggleIcon) toggleIcon.style.transform = 'rotate(180deg)';
                    if(toggleText) toggleText.innerText = 'Hide Directory';
                } else {
                    footerCore.style.opacity = '0';
                    footerCore.addEventListener('transitionend', function handler() {
                        footerCore.style.display = 'none';
                        footerCore.removeEventListener('transitionend', handler);
                    }, { once: true });
                    if(toggleIcon) toggleIcon.style.transform = 'rotate(0deg)';
                    if(toggleText) toggleText.innerText = 'Show Full Directory';
                }
            });
        }

        // --- SEO TABS LOGIC ---
        const tabButtons = document.querySelectorAll('.seo-tab-trigger');
        const tabPanels = document.querySelectorAll('.seo-tab-panel');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                tabButtons.forEach(b => b.classList.remove('active-tab'));
                tabPanels.forEach(p => p.classList.remove('active-panel'));
                this.classList.add('active-tab');
                const targetId = this.getAttribute('data-target');
                const targetPanel = document.getElementById(targetId);
                if(targetPanel) targetPanel.classList.add('active-panel');
            });
        });
    }

    // --- DYNAMIC MOBILE FILTER POPUP INJECTION ---
    if (filterModal) {
        const bodyTarget = document.getElementById('mobile-filter-body-container') || filterModal.querySelector('.modal-body');
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
                        <label><input type="checkbox" class="m-filter-landmark" value="metro"> Near Metro Station</label>
                        <label><input type="checkbox" class="m-filter-landmark" value="railway"> Near Railway Station</label>
                        <label><input type="checkbox" class="m-filter-landmark" value="coaching"> Near Coaching Institutes (Allen/Reso etc.)</label>
                        <label><input type="checkbox" class="m-filter-landmark" value="college"> Near Colleges / Universities</label>
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

    // --- BIND SYNC EVENTS ---
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
            document.querySelectorAll('.' + desktopClass).forEach(cb => {
                cb.addEventListener('change', () => {
                    const mCB = document.querySelector(`.${mobileClass}[value="${cb.value}"]`);
                    if(mCB) mCB.checked = cb.checked;
                    window.syncAndRenderFilters();
                });
            });
            document.querySelectorAll('.' + mobileClass).forEach(cb => {
                cb.addEventListener('change', () => {
                    const dCB = document.querySelector(`.${desktopClass}[value="${cb.value}"]`);
                    if(dCB) dCB.checked = cb.checked;
                    window.syncAndRenderFilters();
                });
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

    // --- URL FILTERS ENGINE ---
    parseAndApplyUrlFilters();

    if (window.LayoutEngine) {
        window.LayoutEngine.applyCityClientSideFilter = () => {
            if (typeof window.renderPostsDataPipeline === 'function') window.renderPostsDataPipeline();
        };
    }

    window.addEventListener('cityChanged', () => {
        if (typeof window.renderPostsDataPipeline === 'function') window.renderPostsDataPipeline();
    });

    // --- INQUIRY MODAL ELEMENT ---
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
                    <button type="submit" class="btn-mehrum" style="width:100%; padding:12px; font-size:15px;">Send Secure Application</button>
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
        if(localStorage.getItem('staypremium_name')) document.getElementById('inquiry-name').value = localStorage.getItem('staypremium_name');
        if(localStorage.getItem('staypremium_phone')) document.getElementById('inquiry-phone').value = localStorage.getItem('staypremium_phone');
        
        inqForm.addEventListener('submit', (e) => {
            e.preventDefault();
            executeInquirySubmission();
        });
    }

    // --- LISTINGS GRID EVENT DELEGATION ---
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
                if (!currentSessionUID) { alert("Please log in to bookmark spaces."); window.location.href = 'login.html'; return; }

                const targetPropId = targetSaveBtn.getAttribute('data-save-id');
                const matchedObj = allPosts.find(p => p.id === targetPropId);
                if (!matchedObj) return;

                let bookmarkArray = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];
                const pointerIdx = bookmarkArray.indexOf(targetPropId);
                const userNodeReference = db.ref(`users_saved/${currentSessionUID}/${targetPropId}`);

                if (pointerIdx === -1) {
                    userNodeReference.set({ id: targetPropId, name: matchedObj.name || matchedObj.title, price: matchedObj.price || 0, location: matchedObj.location || "" }).then(() => {
                        bookmarkArray.push(targetPropId); localStorage.setItem('staypremium_saved_properties', JSON.stringify(bookmarkArray));
                        window.showCenterToast("❤️ Space Bookmarked Safely!"); window.renderPostsDataPipeline();
                    });
                } else {
                    userNodeReference.remove().then(() => {
                        bookmarkArray = bookmarkArray.filter(id => id !== targetPropId); localStorage.setItem('staypremium_saved_properties', JSON.stringify(bookmarkArray));
                        window.showCenterToast("💔 Space Removed from Dashboard."); window.renderPostsDataPipeline();
                    });
                }
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
            const SpeechEngine = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognizerInstance = new SpeechEngine();
            recognizerInstance.lang = 'en-IN';
            voiceBtn.addEventListener('click', () => { recognizerInstance.start(); searchInput.placeholder = "Listening live..."; });
            recognizerInstance.onresult = (evt) => { searchInput.value = evt.results[0][0].transcript; window.renderPostsDataPipeline(); };
        } else { voiceBtn.style.display = 'none'; }
    }

    if (filterBtn) filterBtn.addEventListener('click', () => { if(filterModal) filterModal.style.display = 'flex'; });
    if (closeModal) closeModal.addEventListener('click', () => { if(filterModal) filterModal.style.display = 'none'; });
    
    window.addEventListener('click', (e) => { 
        if (e.target === filterModal) filterModal.style.display = 'none'; 
        if (e.target === inqModal) inqModal.style.display = 'none'; 
    });
});

// --- REALTIME DATA FETCH STREAM FROM FIREBASE ---
db.ref('properties').on('value', (snapshot) => {
    const response = snapshot.val();
    allPosts = response ? Object.keys(response).map(key => ({ id: key, views: 0, ...response[key] })) : [];
    window.renderPostsDataPipeline(); 
});

// --- BANNERS ATTACHMENT REALTIME MATRIX ---
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

// CLOUDINARY OPTIMIZER
function optimizeCloudinaryUrl(url) {
    if (!url || !url.includes("cloudinary.com")) return url;
    if (url.includes("/upload/")) {
        return url.replace("/upload/", "/upload/f_auto,q_auto:best/");
    }
    return url;
}

// Banner Layout Generator
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
            @media (min-width: 768px) {
                .dynamic-banner-slide { background-size: cover; }
            }
            @media (max-width: 767px) {
                .dynamic-banner-slide { background-size: 100% 100%; } 
            }
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

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    if (!searchInput) return;

    const keywords = [
        "Search Jaipur Properties",
        "Search Gurugram Apartments",
        "Search Premium Rooms",
        "Search Luxury Flats",
        "Search Villas",
        "Search Commercial Spaces"
    ];

    let word = 0;
    let letter = 0;
    let deleting = false;
    let cursor = true;

    setInterval(() => {
        cursor = !cursor;
    }, 500);

    function animate() {
        let text = keywords[word];

        if (!deleting) {
            letter++;
            if (letter >= text.length) {
                deleting = true;
                setTimeout(animate, 1800);
                return;
            }
        } else {
            letter--;
            if (letter <= 0) {
                deleting = false;
                word = (word + 1) % keywords.length;
            }
        }

        searchInput.placeholder = text.substring(0, letter) + (cursor ? "|" : "");
        setTimeout(animate, deleting ? 40 : 70);
    }

    animate();
});

function executeInquirySubmission() {
    if (!currentSessionUID) return;
    const itemPropId = document.getElementById('inquiry-property-id').value;
    const clientNameInput = document.getElementById('inquiry-name').value.trim();
    const clientPhoneInput = document.getElementById('inquiry-phone').value.trim();
    const clientMsgInput = document.getElementById('inquiry-msg').value.trim();

    const currentTargetObject = allPosts.find(p => p.id === itemPropId);
    const resolvedTitle = currentTargetObject ? (currentTargetObject.name || currentTargetObject.title) : "Premium Listing Inquiry";
    const absoluteTimestamp = Date.now();

    const structuredPayload = {
        propertyId: itemPropId, propertyName: resolvedTitle, clientName: clientNameInput, clientPhone: clientPhoneInput, message: clientMsgInput, userId: currentSessionUID, timestamp: absoluteTimestamp, date: new Date(absoluteTimestamp).toLocaleString('en-IN')
    };

    Promise.all([
        db.ref('leads_inquiries').push().set(structuredPayload),
        db.ref('inquiries').push().set(structuredPayload)
    ]).then(() => {
        window.showCenterToast(`🎉 Application Transferred!`);
        document.getElementById('inquiry-modal').style.display = 'none';
        document.getElementById('inquiry-form').reset();
    });
}

function openStay100MembershipPortal() {
    const mainViewContainer = document.getElementById('listings-container');
    if (!mainViewContainer) return;

    if (!currentSessionUID) {
        window.showCenterToast("Please login first to view vendor portal details.", false);
        return;
    }

    mainViewContainer.style.display = 'block'; 
    mainViewContainer.innerHTML = `
        <div style="padding:30px; text-align:center; font-family:sans-serif; background:#ffffff; border-radius:16px; box-shadow:0 8px 24px rgba(0,0,0,0.12); border:1px solid #eaeaea; max-width:800px; margin:20px auto;">
            <h2 style="color:#800020; margin-bottom:10px;"><i class="fa-solid fa-gem"></i> Join Stay100% Premium Vendor Club</h2>
            <p style="color:#555; font-size:14px; margin-bottom:25px;">Activate your Premium Verification badge to instantly push your property rankings to the top queue layout!</p>
            
            <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:20px; margin-bottom:25px;">
                <div style="border:1px solid #ccc; border-radius:12px; padding:20px; width:200px; background:#fafafa; text-align:center; transition:transform 0.2s;">
                    <h4 style="margin:0 0 10px 0;">Monthly Plan</h4>
                    <h2 style="color:#2e7d32; margin:10px 0;">₹99<span style="font-size:13px; color:#666;"> / month</span></h2>
                    <p style="font-size:11px; color:#888; min-height:30px;">Valid for exactly 30 Days</p>
                    <button onclick="processMembershipPlanPurchase('99')" style="background:#800020; color:#fff; border:none; padding:10px; width:100%; border-radius:6px; font-weight:bold; cursor:pointer;">Select Plan</button>
                </div>
                <div style="border:2px solid #0288d1; border-radius:12px; padding:20px; width:200px; background:#e1f5fe; text-align:center; position:relative; transform: scale(1.05);">
                    <span style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#0288d1; color:#fff; font-size:9px; padding:2px 8px; border-radius:10px; font-weight:bold;">POPULAR</span>
                    <h4 style="margin:10px 0 10px 0;">Quarterly Plan</h4>
                    <h2 style="color:#2e7d32; margin:10px 0;">₹249<span style="font-size:13px; color:#666;"> / 3 mo</span></h2>
                    <p style="font-size:11px; color:#888; min-height:30px;">Valid for exactly 90 Days</p>
                    <button onclick="processMembershipPlanPurchase('249')" style="background:#0288d1; color:#fff; border:none; padding:10px; width:100%; border-radius:6px; font-weight:bold; cursor:pointer;">Select Plan</button>
                </div>
                <div style="border:1px solid #ccc; border-radius:12px; padding:20px; width:200px; background:#fafafa; text-align:center; transition:transform 0.2s;">
                    <h4 style="margin:0 0 10px 0;">Annual Plan</h4>
                    <h2 style="color:#2e7d32; margin:10px 0;">₹999<span style="font-size:13px; color:#666;"> / year</span></h2>
                    <p style="font-size:11px; color:#888; min-height:30px;">Valid for 365 Days</p>
                    <button onclick="processMembershipPlanPurchase('999')" style="background:#800020; color:#fff; border:none; padding:10px; width:100%; border-radius:6px; font-weight:bold; cursor:pointer;">Select Plan</button>
                </div>
            </div>
            <button onclick="window.location.reload()" style="background:#6c757d; color:#fff; border:none; padding:8px 20px; border-radius:6px; cursor:pointer;">← Back to Home Marketplace</button>
        </div>
    `;
}

function processMembershipPlanPurchase(planAmount) {
    window.showCenterToast(`Opening Secure Gateway for Amount ₹${planAmount}...`);
    setTimeout(() => {
        const timestampDateStr = new Date().toISOString().split('T')[0]; 
        localStorage.setItem(`stay100_plan_${currentSessionUID}`, planAmount);
        localStorage.setItem(`stay100_start_${currentSessionUID}`, timestampDateStr);
        window.showCenterToast("🎉 Payment Confirmed! Stay100% Verification Badge Live.");
        updateUserProfileUI();
        window.location.reload();
    }, 1500);
}