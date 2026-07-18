import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, update, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase Architecture Instantiation Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCcStFHPf5AOCZgqMCWq9T7nd4lFXAcA8M",
    authDomain: "stay100-31316.firebaseapp.com",
    databaseURL: "https://stay100-31316-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "stay100-31316"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Operational Data Pipeline State Matrix Variables
let masterDatasetPool = [];
let targetRouteCity = "jaipur"; // Fallback target city assignment context bound global variable
let currentSessionUID = localStorage.getItem('staypremium_uid') || null;

// Dynamic Multi-City Content Matrix Object for SEO Optimization Routing Map
const multiCitySEOProfiles = {
    jaipur: { title: "Premium Properties in Jaipur", desc: "Discover best-verified rooms, houses, and PGs across Malviya Nagar, Vaishali Nagar, and Mansarovar, Jaipur.", localAreaMeta: "Jaipur, known for its deep historical baseline heritage, is seeing skyrocketing scaling growth across technical tech clusters. Locating accommodations near Malviya Nagar, GT, or Sitapura industrial zones provides premium walkability access matrices." },
    mumbai: { title: "Verified Properties for Rent in Mumbai", desc: "Premium flats, flatshares, and co-living studio assets for rent in Andheri, Bandra, and Thane, Mumbai.", localAreaMeta: "Navigating Mumbai real estate demands strict alignment with proximity to train lines. Our verified spaces in Andheri West, Powai, and Lower Parel eliminate arbitrary broker middleman costs entirely." },
    delhi: { title: "Luxury Managed Accommodations in Delhi", desc: "Verified rental hubs, student single rooms, and co-living facilities in South Extension, Karol Bagh, and North Campus.", localAreaMeta: "Rentals near University structures or prominent metro connectivity paths in Delhi allow highly optimized travel routines. Explore fully-furnished assets mapped near Laxmi Nagar, Connaught Place, and Hauz Khas." },
    gurugram: { title: "Premium Corporate Housing in Gurugram", desc: "High-end flats, studio spaces, and working professional PGs in Cyber City, Golf Course Road, Sector 45, Gurugram.", localAreaMeta: "Gurugram's commercial office sprawl around DLF Cybercity and Sector 21 requires proximity accommodations. Streamline tracking options offering zero security deposit options with high-speed fiber." },
    noida: { title: "Affordable Modern Rentals in Noida", desc: "Verified flats, studio apartments, and co-living spaces near Sector 62, Sector 15, and Knowledge Park, Noida.", localAreaMeta: "Noida presents highly structural wide road configurations with tech sectors. Discover properties optimized near Sector 62 IT Parks, fully loaded with modern automation and regular backup electrical power pipelines." },
    pune: { title: "Co-Living & Studio Rentals in Pune", desc: "Verified student rooms and luxury working professional suites in Viman Nagar, Hinjawadi, and Kothrud, Pune.", localAreaMeta: "Hinjawadi IT parks and Viman Nagar student lounges form the energetic center of Pune layout. Find accommodation properties emphasizing deep communal spaces and attached mess configurations." },
    hyderabad: { title: "Executive PGs & Flats for Rent in Hyderabad", desc: "Premium co-living spaces, rooms, and flats near Gachibowli, HITEC City, and Madhapur, Hyderabad.", localAreaMeta: "Hyderabad IT corridors require reliable access pipelines. Our modern listings around Jubilee Hills, Madhapur, and Kondapur deliver absolute compliance with absolute zero broker engagement pipelines." },
    bangluru: { title: "Tech-Hub Accommodations in Bengaluru", desc: "Top-tier co-living spaces, independent flats, and serviced suites in Koramangala, Indiranagar, and HSR Layout.", localAreaMeta: "Bengaluru (Bangalore) presents the premier technology sector in India. Secure verified property listings in Marathahalli, Whitefield, and Electronic City mapped to dynamic target requirements." }
};

document.addEventListener('DOMContentLoaded', () => {
    extractURLRouterStateParameters();
    initLayoutComponentStateInteractions();
    initRealtimeDatabaseStream();
    initSearchEngine();
    initVoiceRecognitionEngine();
    initGlobalActionDelegator();
    initInquiryFormEngine();
});

/**
 * URL Parameter Routing Context Engine 
 */
function extractURLRouterStateParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for queries like ?city=bangluru
    let cityParam = urlParams.get('city');
    
    // Fallback parser step if user searches a direct natural phrase string query parameter pattern like: ?search=flat+on+rent+in+bengluru
    const searchString = urlParams.get('search') || urlParams.get('q') || "";
    if (!cityParam && searchString) {
        const queryLower = searchString.toLowerCase();
        for (const cityKey of Object.keys(multiCitySEOProfiles)) {
            if (queryLower.includes(cityKey) || (cityKey === 'bangluru' && queryLower.includes('bangalore'))) {
                cityParam = cityKey;
                break;
            }
        }
        // Extract filter state configuration matches directly from query search syntax patterns
        if (queryLower.includes('flat') || queryLower.includes('house')) {
            document.querySelector('[data-filter-type="type"][data-value="flat"]')?.classList.add('active');
            document.querySelector('[data-filter-type="type"][data-value="all"]')?.classList.remove('active');
        }
    }

    if (cityParam) {
        // Normalize naming patterns for Bangalore
        if (cityParam.toLowerCase() === 'bangalore') cityParam = 'bangluru';
        targetRouteCity = cityParam.toLowerCase();
    }

    compileDynamicSEOMetadataPipeline();
}

/**
 * High-Authority Dynamic Injection SEO Engine Configuration Matrix
 */
function compileDynamicSEOMetadataPipeline() {
    const profile = multiCitySEOProfiles[targetRouteCity] || multiCitySEOProfiles['jaipur'];
    
    // DOM UI Interpolation Updates
    document.title = `${profile.title} | Stay100% Verified Rentals`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', profile.desc);

    document.getElementById('current-city-label').textContent = targetRouteCity.toUpperCase();
    document.getElementById('dynamic-main-heading').textContent = profile.title;
    document.getElementById('dynamic-subheading').textContent = profile.desc;

    const seoBlock = document.getElementById('seo-area-profile');
    if (seoBlock) {
        seoBlock.style.display = "block";
        seoBlock.innerHTML = `
            <h3>Living Guide & Neighborhood Insights in ${targetRouteCity.toUpperCase()}</h3>
            <p>${profile.localAreaMeta}</p>
            <small style="color:var(--text-muted); display:block; margin-top:10px;"><i class="fa-solid fa-shield-halved"></i> All properties listed are subjected to rigorous identity and structural verification protocols.</small>
        `;
    }

    // Dynamic Generation of Google Local Business/Collection Graph Schema Architecture
    const schemaNode = document.getElementById('seo-schema-graph');
    if (schemaNode) {
        const structuralSchemaPayload = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": profile.title,
            "description": profile.desc,
            "url": window.location.href,
            "numberOfItems": masterDatasetPool.length || 10
        };
        schemaNode.textContent = JSON.stringify(structuralSchemaPayload);
    }
}

/**
 * Mobile Sliding Sidebar Drawer Component Layout Matrix Controls Controller
 */
function initLayoutComponentStateInteractions() {
    const sidebar = document.getElementById('filters-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const toggleBtn = document.getElementById('sidebar-toggle-trigger');
    const closeBtn = document.getElementById('sidebar-close-trigger');
    const applyBtn = document.getElementById('filter-apply-trigger');
    const resetBtn = document.getElementById('filter-reset-trigger');
    const priceSlider = document.getElementById('price-range-control');
    const priceLabel = document.getElementById('price-slider-label');

    function openPanel() {
        sidebar.classList.add('open-panel-active');
        backdrop.classList.add('visible-overlay-active');
    }

    function closePanel() {
        sidebar.classList.remove('open-panel-active');
        backdrop.classList.remove('visible-overlay-active');
    }

    if(toggleBtn) toggleBtn.addEventListener('click', openPanel);
    if(closeBtn) closeBtn.addEventListener('click', closePanel);
    if(backdrop) backdrop.addEventListener('click', closePanel);
    if(applyBtn) applyBtn.addEventListener('click', () => { executeFilteredPipelineRender(); closePanel(); });

    if(priceSlider && priceLabel) {
        priceSlider.addEventListener('input', (e) => {
            priceLabel.textContent = `₹${parseInt(e.target.value).toLocaleString('en-IN')}`;
        });
    }

    // Inline Attribute selection matrix event bindings toggler
    document.querySelectorAll('.filter-tag-stack .filter-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
            const parent = e.target.parentElement;
            parent.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            if (window.innerWidth > 991) {
                executeFilteredPipelineRender(); // Live render updates on desktop viewports instantly
            }
        });
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.querySelectorAll('.filter-tag-stack .filter-tag').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('[data-value="all"]').forEach(t => t.classList.add('active'));
            document.querySelectorAll('.custom-checkbox-row input').forEach(i => i.checked = false);
            if (priceSlider) {
                priceSlider.value = 50000;
                priceLabel.textContent = `₹50,000`;
            }
            executeFilteredPipelineRender();
            if (window.innerWidth <= 991) closePanel();
        });
    }
}

/**
 * Core Firebase Realtime Synchronization Telemetry Data Stream Interface
 */
function initRealtimeDatabaseStream() {
    const propertiesNodeRef = ref(database, 'properties');
    const container = document.getElementById('pg-cards-container');

    onValue(propertiesNodeRef, (snapshot) => {
        try {
            const rawPayload = snapshot.val();
            if (rawPayload) {
                // Dynamic Multi-City Mapping Transformer & Normalizer Step
                masterDatasetPool = Object.keys(rawPayload).map(key => ({
                    id: key,
                    ...rawPayload[key]
                }));
                
                executeFilteredPipelineRender();
                compileDynamicSEOMetadataPipeline(); // Dynamic call re-trigger updating item totals counts mapping
            } else {
                if (container) {
                    container.innerHTML = '<div class="loader-text">No active verified properties found in this location sector zone.</div>';
                }
            }
        } catch (error) {
            console.error("Critical parsing error within Database engine context:", error);
            if (container) {
                container.innerHTML = '<div class="loader-text" style="color:#dc2626;">System error rendering live sync pipeline assets.</div>';
            }
        }
    }, (error) => {
        console.error("Firebase Security Context Access Revoked:", error);
    });
}

/**
 * Filter Execution Grid Pipelines Engine (Main Search Context & Sidebar Intersections Grid Layout Mapping)
 */
function executeFilteredPipelineRender() {
    const container = document.getElementById('pg-cards-container');
    const recommendationsContainer = document.getElementById('recommendations-cards-container');
    const keyword = document.getElementById('pg-search-input')?.value.toLowerCase().trim() || "";
    const savedList = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];

    if (!container) return;

    // 1. Gather active UI filter parameter node values state constraints map
    const typeFilter = document.querySelector('[data-filter-type="type"].active')?.dataset.value || "all";
    const sharingFilter = document.querySelector('[data-filter-type="sharing"].active')?.dataset.value || null;
    const priceCeiling = parseInt(document.getElementById('price-range-control')?.value || 50000);
    
    const acRequired = document.querySelector('[data-filter-type="amenities"][data-value="ac"]')?.checked;
    const foodRequired = document.querySelector('[data-filter-type="amenities"][data-value="food"]')?.checked;

    // 2. Compute Segmented Core City filtering logic array matching URL dynamic variable allocation
    const targetCityMatchPool = masterDatasetPool.filter(item => {
        if (!item.city) return false;
        let normalizedCity = item.city.toLowerCase().trim();
        if (normalizedCity === 'bangalore') normalizedCity = 'bangluru';
        return normalizedCity === targetRouteCity;
    });

    // 3. Process primary filtered parameters matching user exact explicit constraints configuration layout matrix bounds
    const primaryFilteredResult = targetCityMatchPool.filter(p => {
        // String text inputs logic match constraints mappings array
        const nameMatch = (p.name || "").toLowerCase().includes(keyword);
        const locationMatch = (p.location || "").toLowerCase().includes(keyword);
        if (!nameMatch && !locationMatch) return false;

        // Accommodation Category structural filtering mapping
        if (typeFilter !== "all") {
            const propType = (p.type || "").toLowerCase();
            if (typeFilter === "room" && (propType !== "room" && propType !== "pg")) return false;
            if (typeFilter === "flat" && (propType !== "flat" && propType !== "house")) return false;
        }

        // Occupancy operational mode constraint matching filter
        if (sharingFilter) {
            const pSharing = String(p.sharingType || "").toLowerCase();
            if (sharingFilter === "single" && (!pSharing.includes("single") && p.sharing !== 1)) return false;
            if (sharingFilter === "multiple" && (pSharing.includes("single") || p.sharing === 1)) return false;
        }

        // Budgetary constraints filters mapping
        if (p.price && parseInt(p.price) > priceCeiling) return false;

        // Amenities arrays boolean switches checks pipelines mapping targets
        if (acRequired && (!p.ac && !String(p.amenities).toLowerCase().includes('ac'))) return false;
        if (foodRequired && (!p.food && !p.mess && !String(p.amenities).toLowerCase().includes('food'))) return false;

        return true;
    });

    // 4. Render main Grid View layout matrix matching target output element nodes
    if (primaryFilteredResult.length > 0) {
        container.innerHTML = primaryFilteredResult.map(item => window.PropertyCardComponent.render(item, savedList)).join('');
    } else {
        container.innerHTML = `<div class="loader-text">No verified properties match your advanced search filters in ${targetRouteCity.toUpperCase()}.</div>`;
    }

    // 5. Generate dynamically weighted Cross-Sell Recommendation Engine Cards output array list metrics map
    // Recommendations logic engine grabs properties from the pool that either don't match the current criteria fully or are located in nearby sectors
    const recommendationPool = masterDatasetPool
        .filter(item => {
            let itemCity = (item.city || "").toLowerCase().trim();
            if (itemCity === 'bangalore') itemCity = 'bangluru';
            // Include alternative items from the same city not visible in search, or alternative properties from adjacent nodes
            return !primaryFilteredResult.some(r => r.id === item.id) && (itemCity === targetRouteCity || item.featured === true);
        })
        .slice(0, 3); // Constrain output to exact maximum structural limit layout matrix 3 grid assets

    if (recommendationsContainer) {
        if (recommendationPool.length > 0) {
            recommendationsContainer.innerHTML = recommendationPool.map(item => window.PropertyCardComponent.render(item, savedList)).join('');
        } else {
            // High converting generic fallback engine allocation matrix context strategy
            const backupFallbacks = masterDatasetPool.slice(0, 3);
            recommendationsContainer.innerHTML = backupFallbacks.map(item => window.PropertyCardComponent.render(item, savedList)).join('');
        }
    }

    // Initialize custom carousels if present within external dynamic property components layers maps structure
    if (window.PropertyCardComponent && typeof window.PropertyCardComponent.initAutoswipe === 'function') {
        window.PropertyCardComponent.initAutoswipe();
    }
}

/**
 * Standard Text Input Search Debouncing Hooks Integration Engine Block
 */
function initSearchEngine() {
    const searchInput = document.getElementById('pg-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            executeFilteredPipelineRender();
        }, 250));
    }
}

/**
 * Web Speech Recognition Implementation Engine Pipelines Interface Mapping
 */
function initVoiceRecognitionEngine() {
    const voiceBtn = document.getElementById('voice-search-trigger');
    const searchInput = document.getElementById('pg-search-input');
    
    if (!voiceBtn || !searchInput) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        voiceBtn.style.display = 'none';
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    voiceBtn.addEventListener('click', () => {
        if (voiceBtn.classList.contains('listening')) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

    recognition.onstart = () => {
        voiceBtn.classList.add('listening');
        searchInput.placeholder = "Listening continuously to voice command criteria parameters...";
    };

    recognition.onend = () => {
        voiceBtn.classList.remove('listening');
        searchInput.placeholder = "Search spaces by locality, building name, landmark...";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        executeFilteredPipelineRender();
    };

    recognition.onerror = (err) => {
        console.error("Voice Speech Hardware processing error encountered:", err);
        voiceBtn.classList.remove('listening');
    };
}

/**
 * Global Event Delegation UI Capture Interception Pipelines Mapping Node
 */
function initGlobalActionDelegator() {
    // Intercept clicks on both primary grid views and dynamic recommendation drawers wrappers
    const setupDelegator = (elementId) => {
        const grid = document.getElementById(elementId);
        if (!grid) return;

        grid.addEventListener('click', (e) => {
            const saveBtn = e.target.closest('[data-save-id]');
            const inqBtn = e.target.closest('[data-inquiry-id]');
            const card = e.target.closest('[data-view-id]');

            if (saveBtn) {
                e.preventDefault(); e.stopPropagation();
                handleSaveAction(saveBtn.dataset.saveId, saveBtn.querySelector('i'));
            } 
            else if (inqBtn) {
                e.preventDefault(); e.stopPropagation();
                openInquiryModal(inqBtn.dataset.inquiryId);
            } 
            else if (card) {
                window.location.href = `details.html?id=${card.dataset.viewId}`;
            }
        });
    };

    setupDelegator('pg-cards-container');
    setupDelegator('recommendations-cards-container');
}

/**
 * Session Bookmarking & Realtime Synchronization Telemetry Operations Logic
 */
function handleSaveAction(propertyId, iconElement) {
    if (!currentSessionUID) {
        alert("Authentication required. Please log in to your Stay100% portal dashboard profile to bookmark parameters.");
        return;
    }

    let savedList = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];
    const isSaved = savedList.includes(propertyId);

    if (isSaved) {
        savedList = savedList.filter(id => id !== propertyId);
        if(iconElement) {
            iconElement.className = "fa-regular fa-heart";
            iconElement.style.color = "#666";
        }
    } else {
        savedList.push(propertyId);
        if(iconElement) {
            iconElement.className = "fa-solid fa-heart";
            iconElement.style.color = "#dc2626";
        }
    }

    localStorage.setItem('staypremium_saved_properties', JSON.stringify(savedList));
    
    const userSaveRef = ref(database, `users/${currentSessionUID}/savedProperties`);
    update(userSaveRef, { [propertyId]: !isSaved }).catch(err => {
        console.warn("Local storage pipeline synchronized. Server synchronization queued deferred:", err);
    });
}

/**
 * Dynamic Lead Acquisition Inquiry Modular Interface Implementation System Operations
 */
function openInquiryModal(id) {
    const property = masterDatasetPool.find(p => p.id === id);
    if (!property) return;
    
    const modal = document.getElementById('inquiry-modal');
    if (modal) {
        document.getElementById('inq-prop-id').value = id;
        document.getElementById('inq-prop-name').value = property.name || "Stay100% Premium Space Node Cluster Asset";
        modal.style.display = 'flex';
    }
}

window.closeInquiryModal = function() {
    const modal = document.getElementById('inquiry-modal');
    if (modal) modal.style.display = 'none';
};

function initInquiryFormEngine() {
    const form = document.getElementById('modal-inquiry-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const propertyId = document.getElementById('inq-prop-id').value;
        const messageText = document.getElementById('inq-user-message').value.trim();
        
        const inquiryPayload = {
            propertyId: propertyId,
            propertyName: document.getElementById('inq-prop-name').value,
            userUid: currentSessionUID || "anonymous_lead_pipeline_node",
            message: messageText,
            timestamp: Date.now()
        };

        try {
            const newInquiryRef = push(ref(database, 'inquiries'));
            await update(newInquiryRef, inquiryPayload);
            alert("Your corporate verification inquiry payload has been uploaded successfully!");
            form.reset();
            window.closeInquiryModal();
        } catch (error) {
            console.error("Transaction write error processing database persistence queue execution:", error);
            alert("Data commitment connection breakdown. Please retry execution process.");
        }
    });
}

/**
 * Optimization Performance Strategy Hook Utilities: Execution Frame Window Debounce Module
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}