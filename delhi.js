/**
 * StayPremium - Production Architecture Control Pipeline Engine (delhi.js)
 * Enhanced with Dynamic Isolated Template Header-Footer Loaders & Multi-Option View States Filters
 * Exact Replica Alignment with Jaipur Architecture Layout
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCfa9vnSViGViHteH0xY3zZgTIl7P22EV8",
    authDomain: "impstaff-93232.firebaseapp.com",
    databaseURL: "https://impstaff-93232-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "impstaff-93232",
    storageBucket: "impstaff-93232.firebasestorage.app",
    messagingSenderId: "384617941707",
    appId: "1:384617941707:web:26a59adb8472371d0ee94e"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let cloudMasterRecords = [];
const IMMUTABLE_TARGET_CITY = "delhi"; // Locked to Delhi

let stateFilters = {
    searchQuery: "",
    localArea: "all",
    maxBudget: 30000,
    spaceType: "all",
    genderType: "all",
    checkedAmenities: []
};

document.addEventListener("DOMContentLoaded", () => {
    injectDynamicGlobalHeader();
    injectDynamicGlobalFooter();
    setupResponsiveDrawerInteraction();
    registerPipelineInterfaceTriggers();
    initializeCloudSyncPipeline();
});

function injectDynamicGlobalHeader() {
    const headerContainer = document.getElementById('dynamic-global-header');
    if (!headerContainer) return;

    headerContainer.innerHTML = `
        <header style="background:#fff; border-bottom:1px solid rgba(0,0,0,0.06); padding:15px 4%; display:flex; justify-content:space-between; align-items:center;">
            <a href="index.html" style="font-size:20px; font-weight:800; color:#800020; text-decoration:none; display:flex; align-items:center; gap:6px;">
                <i class="fa-solid fa-hotel"></i> StayPremium
            </a>
            <nav style="display:flex; gap:20px; font-size:14px; font-weight:700;">
                <a href="pg.html" style="color:#0f172a; text-decoration:none;">All Cities</a>
                <a href="#" style="color:#800020; text-decoration:none;">Delhi Hub</a>
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
                    <p style="line-height:1.6;">Providing verified luxury spaces across Delhi and NCR areas with direct owner contact matching algorithms.</p>
                </div>
            </div>
            <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:20px; text-align:center; font-weight:600;">
                &copy; 2026 StayPremium Pipeline Engine. All Cloud Data Sync Protected.
            </div>
        </footer>
    `;
}

function setupResponsiveDrawerInteraction() {
    const drawerNode = document.getElementById('core-filter-drawer');
    const openBtn = document.getElementById('mobile-drawer-open-btn');
    const closeBtn = document.getElementById('filter-close-trigger');
    const applyBtn = document.getElementById('filter-apply-trigger');

    if (openBtn && drawerNode) {
        openBtn.addEventListener('click', () => drawerNode.classList.add('drawer-visible-open'));
    }
    const dismissDrawer = () => { if(drawerNode) drawerNode.classList.remove('drawer-visible-open'); };
    if (closeBtn) closeBtn.addEventListener('click', dismissDrawer);
    if (applyBtn) applyBtn.addEventListener('click', () => { applyFiltersAndRenderPipeline(); dismissDrawer(); });
}

function registerPipelineInterfaceTriggers() {
    const textSearchNode = document.getElementById('pg-search-input');
    if (textSearchNode) {
        textSearchNode.addEventListener('input', (e) => {
            stateFilters.searchQuery = e.target.value.toLowerCase().trim();
            applyFiltersAndRenderPipeline();
        });
    }

    const areaDropdownNode = document.getElementById('filter-local-area');
    if (areaDropdownNode) {
        areaDropdownNode.addEventListener('change', (e) => {
            stateFilters.localArea = e.target.value.toLowerCase().trim();
            applyFiltersAndRenderPipeline();
        });
    }

    const budgetSliderNode = document.getElementById('filter-budget-range');
    const budgetBadgeNode = document.getElementById('budget-cap-badge');
    if (budgetSliderNode) {
        budgetSliderNode.addEventListener('input', (e) => {
            const currentSelectedValue = parseInt(e.target.value);
            stateFilters.maxBudget = currentSelectedValue;
            if(budgetBadgeNode) budgetBadgeNode.innerText = `₹${currentSelectedValue.toLocaleString('en-IN')}`;
            applyFiltersAndRenderPipeline();
        });
    }

    document.querySelectorAll('.type-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.type-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            stateFilters.spaceType = btn.getAttribute('data-type');
            applyFiltersAndRenderPipeline();
        });
    });

    document.querySelectorAll('.gender-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.gender-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            stateFilters.genderType = btn.getAttribute('data-gender');
            applyFiltersAndRenderPipeline();
        });
    });

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

    const resetTriggerBtn = document.getElementById('filter-reset-trigger');
    if (resetTriggerBtn) {
        resetTriggerBtn.addEventListener('click', () => {
            stateFilters.searchQuery = ""; stateFilters.localArea = "all"; stateFilters.maxBudget = 30000;
            stateFilters.spaceType = "all"; stateFilters.genderType = "all"; stateFilters.checkedAmenities = [];

            if(textSearchNode) textSearchNode.value = "";
            if(areaDropdownNode) areaDropdownNode.value = "all";
            if(budgetSliderNode) { budgetSliderNode.value = 30000; if(budgetBadgeNode) budgetBadgeNode.innerText = "₹30,000"; }
            document.querySelectorAll('.type-filter').forEach(b => b.classList.remove('active'));
            const dT = document.querySelector('.type-filter[data-type="all"]'); if(dT) dT.classList.add('active');
            document.querySelectorAll('.gender-filter').forEach(b => b.classList.remove('active'));
            const dG = document.querySelector('.gender-filter[data-gender="all"]'); if(dG) dG.classList.add('active');
            document.querySelectorAll('.amenity-checkbox-flag').forEach(item => item.checked = false);
            applyFiltersAndRenderPipeline();
        });
    }
    setupVoiceRecognitionEnginePipeline();
}

function setupVoiceRecognitionEnginePipeline() {
    const voiceTrigger = document.getElementById('voice-search-trigger');
    const inputNode = document.getElementById('pg-search-input');
    if (!voiceTrigger || !inputNode) return;
    const SpeechRecognitionEngine = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionEngine) { voiceTrigger.style.display = 'none'; return; }
    const voiceRecognizerInstance = new SpeechRecognitionEngine();
    voiceRecognizerInstance.continuous = false; voiceRecognizerInstance.lang = 'en-IN';
    voiceTrigger.addEventListener('click', () => { try { voiceRecognizerInstance.start(); } catch(e){} });
    voiceRecognizerInstance.onstart = () => voiceTrigger.classList.add('listening-active');
    voiceRecognizerInstance.onend = () => voiceTrigger.classList.remove('listening-active');
    voiceRecognizerInstance.onresult = (event) => {
        const text = event.results[0][0].transcript.toLowerCase().replace(/[.]/g, "").trim();
        inputNode.value = text; stateFilters.searchQuery = text; applyFiltersAndRenderPipeline();
    };
}

function initializeCloudSyncPipeline() {
    const recordsRef = ref(database, 'properties');
    onValue(recordsRef, (snapshot) => {
        const payload = snapshot.val();
        if (payload) {
            cloudMasterRecords = Object.keys(payload).map(id => ({ id, ...payload[id] }))
                .filter(item => (item.city || "").toLowerCase().trim() === IMMUTABLE_TARGET_CITY);
            applyFiltersAndRenderPipeline();
        } else { renderEmptyStateLayoutPlaceholder(); }
    });
}

function applyFiltersAndRenderPipeline() {
    const gridTargetContainer = document.getElementById('pg-cards-container');
    const headingTargetTextNode = document.getElementById('listings-heading');
    if (!gridTargetContainer) return;
    const localSaved = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];

    const filtered = cloudMasterRecords.filter(itemRecord => {
        if (stateFilters.searchQuery !== "") {
            const mN = (itemRecord.name || itemRecord.title || "").toLowerCase().includes(stateFilters.searchQuery);
            const mA = (itemRecord.area || itemRecord.location || "").toLowerCase().includes(stateFilters.searchQuery);
            if (!mN && !mA) return false;
        }
        if (stateFilters.localArea !== "all" && !(itemRecord.area || itemRecord.location || "").toLowerCase().trim().includes(stateFilters.localArea)) return false;
        if (parseInt(itemRecord.price || itemRecord.rent || 0) > stateFilters.maxBudget) return false;
        if (stateFilters.spaceType !== "all") {
            const cat = (itemRecord.category || "").toLowerCase().trim();
            const sub = (itemRecord.subType || itemRecord.sharingType || "").toLowerCase().trim();
            if (stateFilters.spaceType === "pg" || stateFilters.spaceType === "room") { if (cat !== stateFilters.spaceType) return false; }
            else { if (sub !== stateFilters.spaceType && cat !== stateFilters.spaceType) return false; }
        }
        if (stateFilters.genderType !== "all" && (itemRecord.gender || itemRecord.targetGender || "").toLowerCase().trim() !== stateFilters.genderType) return false;
        if (stateFilters.checkedAmenities.length > 0) {
            for (let f of stateFilters.checkedAmenities) {
                if (f === "furnished" && itemRecord.furnished !== true && itemRecord.furnishing !== "fully") return false;
                if (f === "lift" && itemRecord.lift !== true && itemRecord.elevator !== true) return false;
                if (f === "ground" && parseInt(itemRecord.floor || itemRecord.floorNumber) !== 0 && (itemRecord.floor || "").toLowerCase() !== "ground") return false;
                if (f === "ac" && itemRecord.ac !== true && itemRecord.airConditioner !== true) return false;
                if (f === "food" && itemRecord.food !== true && itemRecord.mealsIncluded !== true) return false;
            }
        }
        return true;
    });

    if (headingTargetTextNode) headingTargetTextNode.innerText = `Results for Delhi (${filtered.length} Properties Found)`;
    populateActiveBadgesInterfaceRow();
    if (filtered.length === 0) { renderEmptyStateLayoutPlaceholder(); return; }

    if (window.PropertyCardComponent && typeof window.PropertyCardComponent.render === 'function') {
        gridTargetContainer.innerHTML = filtered.map(item => window.PropertyCardComponent.render(item, localSaved)).join('');
        if(window.PropertyCardComponent.initializeSwipers) window.PropertyCardComponent.initializeSwipers();
    } else {
        gridTargetContainer.innerHTML = filtered.map(item => `
            <div class="property-card" style="background:#ffffff; border-radius:16px; overflow:hidden; padding:18px; border:1px solid rgba(0,0,0,0.05);">
                <h4>${item.name || item.title}</h4><p>${item.location || item.area || 'Delhi'}</p>
                <span>₹${(item.price || item.rent).toLocaleString('en-IN')}/mo</span>
            </div>`).join('');
    }
}

function populateActiveBadgesInterfaceRow() {
    const container = document.getElementById('active-badges-runtime-container'); if (!container) return;
    let badges = [];
    if (stateFilters.localArea !== "all") badges.push(`Area: ${stateFilters.localArea}`);
    if (stateFilters.maxBudget < 30000) badges.push(`Max: ₹${stateFilters.maxBudget}`);
    if (stateFilters.spaceType !== "all") badges.push(`Type: ${stateFilters.spaceType.toUpperCase()}`);
    if (stateFilters.genderType !== "all") badges.push(`Gender: ${stateFilters.genderType}`);
    stateFilters.checkedAmenities.forEach(f => badges.push(`Feature: ${f}`));
    if (badges.length === 0) { container.innerHTML = ""; return; }
    container.innerHTML = badges.map(b => `<div class="badge-pill-item"><span>${b}</span></div>`).join('');
}

function renderEmptyStateLayoutPlaceholder() {
    const container = document.getElementById('pg-cards-container');
    if(container) container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:60px 20px;"><h3 style="font-weight:800;">No Matching Spaces Live</h3><p>Koi bhi property aapke selected premium filters se match nahi ho rahi hai.</p></div>`;
}