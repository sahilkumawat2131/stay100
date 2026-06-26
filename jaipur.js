/**
 * StayPremium - Production Architecture Control Pipeline Engine (jaipur.js)
 * Enhanced with Dynamic Isolated Template Header-Footer Loaders & Multi-Option View States Filters
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Global Production Parameter Configuration Variables Mapping Node
const firebaseConfig = {
    apiKey: "AIzaSyCfa9vnSViGViHteH0xY3zZgTIl7P22EV8",
    authDomain: "impstaff-93232.firebaseapp.com",
    databaseURL: "https://impstaff-93232-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "impstaff-93232",
    storageBucket: "impstaff-93232.firebasestorage.app",
    messagingSenderId: "384617941707",
    appId: "1:384617941707:web:26a59adb8472371d0ee94e"
};

// Pipeline State Machine Variable Cache Allocation Storage
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let cloudMasterRecords = [];
const IMMUTABLE_TARGET_CITY = "jaipur"; // Strict localized locking string sequence token

// Multi-Option Dynamic State Control Directives Setup Block Matrix
let stateFilters = {
    searchQuery: "",
    localArea: "all",
    maxBudget: 30000,
    spaceType: "all",
    genderType: "all",
    checkedAmenities: [] // Collection array tracking live flag parameters constraints
};

document.addEventListener("DOMContentLoaded", () => {
    // 1. Fire Dynamic Structural Layout Components Injector Operations
    injectDynamicGlobalHeader();
    injectDynamicGlobalFooter();

    // 2. Mobile Responsive Sliding Control Drawer Layer System Event Map Wiring
    setupResponsiveDrawerInteraction();

    // 3. Establish Interactive Control Node Events Listeners Wireframes System
    registerPipelineInterfaceTriggers();

    // 4. Connect Core Cloud Database Stream Tracking Synchronization Task
    initializeCloudSyncPipeline();
});

/**
 * Loads and injects the global shared component structure asynchronously dynamically.
 */
function injectDynamicGlobalHeader() {
    const headerContainer = document.getElementById('dynamic-global-header');
    if (!headerContainer) return;

    // Header component structural model string definition injection simulation
    headerContainer.innerHTML = `
        <header style="background:#fff; border-bottom:1px solid rgba(0,0,0,0.06); padding:15px 4%; display:flex; justify-content:space-between; align-items:center;">
            <a href="index.html" style="font-size:20px; font-weight:800; color:#800020; text-decoration:none; display:flex; align-items:center; gap:6px;">
                <i class="fa-solid fa-hotel"></i> StayPremium
            </a>
            <nav style="display:flex; gap:20px; font-size:14px; font-weight:700;">
                <a href="pg.html" style="color:#0f172a; text-decoration:none;">All Cities</a>
                <a href="#" style="color:#800020; text-decoration:none;">Jaipur Hub</a>
                <a href="#" style="color:#0f172a; text-decoration:none;">Rooms</a>
            </nav>
        </header>
    `;
}

function injectDynamicGlobalFooter() {
    const footerContainer = document.getElementById('dynamic-global-footer');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
        <footer style="background:#0f172a; color:#94a3b8; padding:40px 4% 20px; margin-top:50px; font-size:13.5px; border-radius:24px 24px 0 0;">
            <div style="display:flex; flex-wrap:wrap; justify-content:between; gap:30px; margin-bottom:30px;">
                <div style="flex:1; min-width:250px;">
                    <h3 style="color:#fff; font-size:16px; margin-bottom:12px;">StayPremium Realestate Corp.</h3>
                    <p style="line-height:1.6;">Providing verified luxury spaces across Jaipur and metro areas with direct owner contact matching algorithms.</p>
                </div>
            </div>
            <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:20px; text-align:center; font-weight:600;">
                &copy; 2026 StayPremium Pipeline Engine. All Cloud Data Sync Protected.
            </div>
        </footer>
    `;
}

/**
 * Configures the responsive drawer sliding mechanics logic rules layout actions
 */
function setupResponsiveDrawerInteraction() {
    const drawerNode = document.getElementById('core-filter-drawer');
    const openBtn = document.getElementById('mobile-drawer-open-btn');
    const closeBtn = document.getElementById('filter-close-trigger');
    const applyBtn = document.getElementById('filter-apply-trigger');

    // Drawer activation toggle procedures map block
    if (openBtn && drawerNode) {
        openBtn.addEventListener('click', () => drawerNode.classList.add('drawer-visible-open'));
    }
    
    const dismissDrawer = () => {
        if(drawerNode) drawerNode.classList.remove('drawer-visible-open');
    };

    if (closeBtn) closeBtn.addEventListener('click', dismissDrawer);
    if (applyBtn) applyBtn.addEventListener('click', () => {
        applyFiltersAndRenderPipeline();
        dismissDrawer();
    });
}

/**
 * Hooks elements and parameters mapping definitions directly.
 */
function registerPipelineInterfaceTriggers() {
    // Text search input query mapping processing flow rules
    const textSearchNode = document.getElementById('pg-search-input');
    if (textSearchNode) {
        textSearchNode.addEventListener('input', (e) => {
            stateFilters.searchQuery = e.target.value.toLowerCase().trim();
            applyFiltersAndRenderPipeline();
        });
    }

    // Local Area selection zone input trigger point
    const areaDropdownNode = document.getElementById('filter-local-area');
    if (areaDropdownNode) {
        areaDropdownNode.addEventListener('change', (e) => {
            stateFilters.localArea = e.target.value.toLowerCase().trim();
            applyFiltersAndRenderPipeline();
        });
    }

    // Budget range threshold adjustment change handler engine tracking logic rules
    const budgetSliderNode = document.getElementById('filter-budget-range');
    const budgetBadgeNode = document.getElementById('budget-cap-badge');
    if (budgetSliderNode) {
        budgetSliderNode.addEventListener('input', (e) => {
            const currentSelectedValue = parseInt(e.target.value);
            stateFilters.maxBudget = currentSelectedValue;
            if(budgetBadgeNode) {
                budgetBadgeNode.innerText = `₹${currentSelectedValue.toLocaleString('en-IN')}`;
            }
            applyFiltersAndRenderPipeline();
        });
    }

    // Space subtype click tag arrays loop configuration maps setup execution routines
    document.querySelectorAll('.type-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.type-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            stateFilters.spaceType = btn.getAttribute('data-type');
            applyFiltersAndRenderPipeline();
        });
    });

    // Gender filter click routing setup flow sequences parameters
    document.querySelectorAll('.gender-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.gender-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            stateFilters.genderType = btn.getAttribute('data-gender');
            applyFiltersAndRenderPipeline();
        });
    });

    // Multi-option checkbox amenity flags registration handlers loop processing block arrays
    document.querySelectorAll('.amenity-checkbox-flag').forEach(chk => {
        chk.addEventListener('change', () => {
            let activeCheckedList = [];
            document.querySelectorAll('.amenity-checkbox-flag').forEach(item => {
                if(item.checked) activeCheckedList.push(item.value);
            });
            stateFilters.checkedAmenities = activeCheckedList;
            applyFiltersAndRenderPipeline();
        });
    });

    // Global filtering system variable reset processing mechanism loop logic mapping parameters
    const resetTriggerBtn = document.getElementById('filter-reset-trigger');
    if (resetTriggerBtn) {
        resetTriggerBtn.addEventListener('click', () => {
            stateFilters.searchQuery = "";
            stateFilters.localArea = "all";
            stateFilters.maxBudget = 30000;
            stateFilters.spaceType = "all";
            stateFilters.genderType = "all";
            stateFilters.checkedAmenities = [];

            // Structural UI elements default values resetting sequences flow parameters execution
            if(textSearchNode) textSearchNode.value = "";
            if(areaDropdownNode) areaDropdownNode.value = "all";
            if(budgetSliderNode) {
                budgetSliderNode.value = 30000;
                if(budgetBadgeNode) budgetBadgeNode.innerText = "₹30,000";
            }
            
            document.querySelectorAll('.type-filter').forEach(b => b.classList.remove('active'));
            const defaultTypeBtn = document.querySelector('.type-filter[data-type="all"]');
            if(defaultTypeBtn) defaultTypeBtn.classList.add('active');

            document.querySelectorAll('.gender-filter').forEach(b => b.classList.remove('active'));
            const defaultGenderBtn = document.querySelector('.gender-filter[data-gender="all"]');
            if(defaultGenderBtn) defaultGenderBtn.classList.add('active');

            document.querySelectorAll('.amenity-checkbox-flag').forEach(item => item.checked = false);

            applyFiltersAndRenderPipeline();
        });
    }

    // Voice recognition search logic setup framework module activation initialization handler routines
    setupVoiceRecognitionEnginePipeline();
}

/**
 * Orchestrates HTML5 Speech recognition processing mechanisms
 */
function setupVoiceRecognitionEnginePipeline() {
    const voiceTrigger = document.getElementById('voice-search-trigger');
    const inputNode = document.getElementById('pg-search-input');
    
    if (!voiceTrigger || !inputNode) return;

    const SpeechRecognitionEngine = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionEngine) {
        voiceTrigger.style.display = 'none'; // Suppress view node context if browser platform mismatch exists
        return;
    }

    const voiceRecognizerInstance = new SpeechRecognitionEngine();
    voiceRecognizerInstance.continuous = false;
    voiceRecognizerInstance.lang = 'en-IN'; // Indian phonetics language optimization matching criteria setup
    voiceRecognizerInstance.interimResults = false;

    voiceTrigger.addEventListener('click', () => {
        try {
            voiceRecognizerInstance.start();
        } catch(e) { console.log("Recognition lifecycle conflict bypassed: ", e); }
    });

    voiceRecognizerInstance.onstart = () => voiceTrigger.classList.add('listening-active');
    voiceRecognizerInstance.onend = () => voiceTrigger.classList.remove('listening-active');
    voiceRecognizerInstance.onerror = () => voiceTrigger.classList.remove('listening-active');
    
    voiceRecognizerInstance.onresult = (event) => {
        const structuralTranscribedText = event.results[0][0].transcript.toLowerCase().replace(/[.]/g, "").trim();
        inputNode.value = structuralTranscribedText;
        stateFilters.searchQuery = structuralTranscribedText;
        applyFiltersAndRenderPipeline();
    };
}

/**
 * Handles Realtime Synchronous Data Collection Streaming from Live Fire Realtime Endpoint Node Cloud references.
 */
function initializeCloudSyncPipeline() {
    const recordsDatabaseReferenceNode = ref(database, 'properties');
    onValue(recordsDatabaseReferenceNode, (snapshot) => {
        const structuralPayloadReceived = snapshot.val();
        if (structuralPayloadReceived) {
            // Map keys and lock to target city pipeline parameter straight out of database loop array stack
            cloudMasterRecords = Object.keys(structuralPayloadReceived).map(recordId => ({
                id: recordId,
                ...structuralPayloadReceived[recordId]
            })).filter(entryItem => (entryItem.city || "").toLowerCase().trim() === IMMUTABLE_TARGET_CITY);
            
            applyFiltersAndRenderPipeline();
        } else {
            renderEmptyStateLayoutPlaceholder();
        }
    }, (error) => {
        console.error("Critical Synchronization Fault encountered from backend stream node mapping stack pipeline: ", error);
    });
}

/**
 * Compiles compound conditions dynamically and pushes matching output arrays into view render layer nodes loop structures.
 */
function applyFiltersAndRenderPipeline() {
    const gridTargetContainer = document.getElementById('pg-cards-container');
    const headingTargetTextNode = document.getElementById('listings-heading');
    
    if (!gridTargetContainer) return;

    const localSavedProfileListingsArray = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];

    // --- EXECUTE HIGH-VELOCITY RECURSIVE COMPOUND FILTERING ENGINE STEPS ---
    const computationalFilteredOutputDatasetArray = cloudMasterRecords.filter(itemRecord => {
        
        // Context Option 1: Search Query string lookup check validation block
        if (stateFilters.searchQuery !== "") {
            const validationMatchName = (itemRecord.name || itemRecord.title || "").toLowerCase().includes(stateFilters.searchQuery);
            const validationMatchArea = (itemRecord.area || itemRecord.location || "").toLowerCase().includes(stateFilters.searchQuery);
            if (!validationMatchName && !validationMatchArea) return false;
        }

        // Context Option 2: Localized area option drop validation processing sequence map check
        if (stateFilters.localArea !== "all") {
            const entryTargetAreaValueString = (itemRecord.area || itemRecord.location || "").toLowerCase().trim();
            if (!entryTargetAreaValueString.includes(stateFilters.localArea)) return false;
        }

        // Context Option 3: Cap Numeric maximum rental evaluation parameter constraint
        const targetNormalizedPricingParam = parseInt(itemRecord.price || itemRecord.rent || 0);
        if (targetNormalizedPricingParam > stateFilters.maxBudget) return false;

        // Context Option 4: Structural Space Category and configurations matching setup routing rules
        if (stateFilters.spaceType !== "all") {
            const assetCategoryStr = (itemRecord.category || "").toLowerCase().trim();
            const assetSubtypeStr = (itemRecord.subType || itemRecord.sharingType || "").toLowerCase().trim();
            
            if (stateFilters.spaceType === "pg" || stateFilters.spaceType === "room") {
                if (assetCategoryStr !== stateFilters.spaceType) return false;
            } else {
                if (assetSubtypeStr !== stateFilters.spaceType && assetCategoryStr !== stateFilters.spaceType) return false;
            }
        }

        // Context Option 5: Demographic Gender restriction protocol checks alignment block parameters
        if (stateFilters.genderType !== "all") {
            const recordGenderStringToken = (itemRecord.gender || itemRecord.targetGender || "").toLowerCase().trim();
            if (recordGenderStringToken !== stateFilters.genderType) return false;
        }

        // Context Option 6: Loop through requested structural checkbox dynamic feature tags collections array maps list
        if (stateFilters.checkedAmenities.length > 0) {
            for (let filterFlagItem of stateFilters.checkedAmenities) {
                if (filterFlagItem === "furnished" && itemRecord.furnished !== true && itemRecord.furnishing !== "fully") return false;
                if (filterFlagItem === "lift" && itemRecord.lift !== true && itemRecord.elevator !== true) return false;
                if (filterFlagItem === "ground" && parseInt(itemRecord.floor || itemRecord.floorNumber) !== 0 && (itemRecord.floor || "").toLowerCase() !== "ground") return false;
                if (filterFlagItem === "ac" && itemRecord.ac !== true && itemRecord.airConditioner !== true) return false;
                if (filterFlagItem === "food" && itemRecord.food !== true && itemRecord.mealsIncluded !== true) return false;
            }
        }

        return true; // Property meets all conditions
    });

    // Dynamic Heading synchronization counter value string update invocation block point
    if (headingTargetTextNode) {
        headingTargetTextNode.innerText = `Results for Jaipur (${computationalFilteredOutputDatasetArray.length} Properties Found)`;
    }

    // Dynamic runtime interface badge pill generation method execution call mapping routing rules
    populateActiveBadgesInterfaceRow();

    // Verification check for dataset counts block
    if (computationalFilteredOutputDatasetArray.length === 0) {
        renderEmptyStateLayoutPlaceholder();
        return;
    }

    // Direct stream compilation mapping output grid view arrays nodes loop tracking compilation block rules
    if (window.PropertyCardComponent && typeof window.PropertyCardComponent.render === 'function') {
        gridTargetContainer.innerHTML = computationalFilteredOutputDatasetArray.map(propertyAssetItem => {
            return window.PropertyCardComponent.render(propertyAssetItem, localSavedProfileListingsArray);
        }).join('');
        
        // Re-trigger dynamic sliders engine lifecycle initialization checks map arrays definitions points
        if(window.PropertyCardComponent.initializeSwipers && typeof window.PropertyCardComponent.initializeSwipers === 'function') {
            window.PropertyCardComponent.initializeSwipers();
        }
    } else {
        // Fallback UI rendering structural matrix setup configuration pipeline engine model
        gridTargetContainer.innerHTML = computationalFilteredOutputDatasetArray.map(item => {
            return `
                <div class="property-card" data-view-id="${item.id}" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.04); border:1px solid rgba(0,0,0,0.05); position:relative;">
                    <img src="${item.image || item.imageUrl || 'https://via.placeholder.com/400x250'}" style="width:100%; height:210px; object-fit:cover; display:block;">
                    <div style="padding:18px;">
                        <h4 style="margin:0 0 8px 0; font-size:16.5px; color:#0f172a; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name || item.title}</h4>
                        <p style="margin:0 0 14px 0; font-size:13px; color:#64748b; font-weight:500;"><i class="fa-solid fa-location-dot" style="color:#800020; margin-right:4px;"></i> ${item.location || item.area || 'Jaipur City'}</p>
                        <div style="display:flex; justify-content:between; align-items:center; border-top:1px solid #f1f5f9; padding-top:14px;">
                            <span style="font-weight:800; color:#800020; font-size:17px;">₹${(item.price || item.rent).toLocaleString('en-IN')}<span style="font-size:12px; color:#64748b; font-weight:500;">/mo</span></span>
                            <span style="background:#f1f5f9; padding:5px 10px; border-radius:6px; font-size:11px; font-weight:700; color:#334155; text-transform:uppercase; letter-spacing:0.5px;">${item.category || 'Luxury'}</span>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }
}

/**
 * Visualizes active filtering pill indicators dynamically below the header control matrix.
 */
function populateActiveBadgesInterfaceRow() {
    const runtimeBadgesContainer = document.getElementById('active-badges-runtime-container');
    if (!runtimeBadgesContainer) return;

    let systemActiveBadgeStringsArray = [];

    if (stateFilters.localArea !== "all") systemActiveBadgeStringsArray.push(`Area: ${stateFilters.localArea}`);
    if (stateFilters.maxBudget < 30000) systemActiveBadgeStringsArray.push(`Max: ₹${stateFilters.maxBudget}`);
    if (stateFilters.spaceType !== "all") systemActiveBadgeStringsArray.push(`Type: ${stateFilters.spaceType.toUpperCase()}`);
    if (stateFilters.genderType !== "all") systemActiveBadgeStringsArray.push(`Gender: ${stateFilters.genderType}`);
    
    if (stateFilters.checkedAmenities.length > 0) {
        stateFilters.checkedAmenities.forEach(flag => systemActiveBadgeStringsArray.push(`Feature: ${flag}`));
    }

    if (systemActiveBadgeStringsArray.length === 0) {
        runtimeBadgesContainer.innerHTML = "";
        return;
    }

    runtimeBadgesContainer.innerHTML = systemActiveBadgeStringsArray.map(badgeLabelText => {
        return `
            <div class="badge-pill-item">
                <span>${badgeLabelText}</span>
            </div>`;
    }).join('');
}

/**
 * Renders standardized blank states messages inside targeted template interfaces loops blocks.
 */
function renderEmptyStateLayoutPlaceholder() {
    const gridTargetContainer = document.getElementById('pg-cards-container');
    if(gridTargetContainer) {
        gridTargetContainer.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:60px 20px; background:#ffffff; border-radius:20px; border:1px solid rgba(15,23,42,0.06); box-shadow:0 10px 30px rgba(0,0,0,0.01);">
                <i class="fa-solid fa-building-circle-xmark" style="font-size:44px; color:#cbd5e1; margin-bottom:15px; display:block;"></i>
                <h3 style="color:#0f172a; margin:0 0 6px 0; font-size:18px; font-weight:800;">No Matching Spaces Live</h3>
                <p style="color:#64748b; margin:0; font-size:14px; font-weight:500;">Koi bhi property aapke selected premium filters aur boundaries se match nahi ho rahi hai. Kripya constraints ko adjust karein.</p>
            </div>`;
    }
}