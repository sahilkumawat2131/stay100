/**
 * StayPremium - Advanced Realtime Data Management & Speech Recognition Pipeline (pg.js)
 * Cleaned & Synchronized Production Version with Enhanced Filtering Systems
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, push, set, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase Configuration
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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Global Variables Stack State
let masterPGRecords = [];
let selectedActiveTagFilter = "all";
let currentUser = null;
let currentSessionUID = localStorage.getItem('staypremium_uid') || null;

// Realtime Selected Localized City Hook
let currentSelectedCity = localStorage.getItem('staypremium_selected_city') || "delhi";

// Track Live Auth Context State Change
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

// GLOBAL CUSTOM CITY INTERCEPTOR PIPELINE
window.addEventListener('cityChanged', (e) => {
    if (e.detail && e.detail.cityId) {
        currentSelectedCity = e.detail.cityId;
        renderPGDataViewGrid();
    }
});

// CENTERED TOAST NOTIFICATION GENERATOR
function showCenteredToast(htmlMessage) {
    let container = document.getElementById('toast-center-box-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-center-box-container';
        Object.assign(container.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(0.9)',
            background: 'rgba(15, 23, 42, 0.98)',
            color: '#ffffff',
            padding: '16px 28px',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: '15px',
            fontWeight: '600',
            textAlign: 'center',
            zIndex: '999999',
            opacity: '0',
            transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            pointerEvents: 'none',
            maxWidth: '85%',
            width: '380px'
        });
        document.body.appendChild(container);
    }
    
    container.innerHTML = htmlMessage;
    container.style.display = 'block';
    
    setTimeout(() => {
        container.style.opacity = '1';
        container.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 40);

    setTimeout(() => {
        container.style.opacity = '0';
        container.style.transform = 'translate(-50%, -50%) scale(0.9)';
        setTimeout(() => { container.style.display = 'none'; }, 250);
    }, 3200);
}

// Dom System Initialized Listener Tree
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('pg-search-input');
    const voiceBtn = document.getElementById('voice-search-trigger');
    const filterTags = document.querySelectorAll('.filter-tag');

    // Attach dynamic overlay Inquiry layout view modal directly structure code safely
    const modalMarkupInq = `
        <div id="inquiry-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.6); z-index:99999; justify-content:center; align-items:center; padding:20px; font-family:'Plus Jakarta Sans',sans-serif;">
            <div style="background:#ffffff; width:100%; max-width:440px; border-radius:16px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation: fadeIn 0.2s ease;">
                <div style="background:#b91c1c; color:#ffffff; padding:18px 20px; display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; font-size:17px; font-weight:700;"><i class="fa-solid fa-paper-plane"></i> Secure Slot Inquiry</h3>
                    <span id="close-inquiry-modal" style="cursor:pointer; font-size:24px; font-weight:bold; line-height:1;">&times;</span>
                </div>
                <form id="inquiry-form" style="padding:20px; display:flex; flex-direction:column; gap:14px; box-sizing:border-box;">
                    <input type="hidden" id="inq-prop-id">
                    <input type="hidden" id="inq-prop-name">
                    <input type="hidden" id="inq-prop-location">
                    <div>
                        <label style="display:block; font-size:13px; font-weight:600; color:#475569; margin-bottom:5px;">Full Name</label>
                        <input type="text" id="inq-client-name" required style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; outline:none; box-sizing:border-box;">
                    </div>
                    <div>
                        <label style="display:block; font-size:13px; font-weight:600; color:#475569; margin-bottom:5px;">Mobile Number</label>
                        <input type="tel" id="inq-client-phone" required pattern="[0-9]{10}" placeholder="10-digit primary number" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; outline:none; box-sizing:border-box;">
                    </div>
                    <div>
                        <label style="display:block; font-size:13px; font-weight:600; color:#475569; margin-bottom:5px;">Requirement Message</label>
                        <textarea id="inq-client-msg" rows="3" placeholder="Food choices, single/double sharing preference or shifting date details..." style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; outline:none; resize:none; box-sizing:border-box;"></textarea>
                    </div>
                    <button type="submit" style="width:100%; padding:12px; background:#b91c1c; color:#ffffff; border:none; border-radius:8px; font-weight:600; cursor:pointer; margin-top:5px;">Submit Inquiry Packet</button>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalMarkupInq);

    const inqModalBox = document.getElementById('inquiry-modal');
    const closeInqBox = document.getElementById('close-inquiry-modal');
    const formInqObj = document.getElementById('inquiry-form');

    if(closeInqBox) closeInqBox.onclick = () => { inqModalBox.style.display = 'none'; };
    window.addEventListener('click', (e) => { if(e.target === inqModalBox) inqModalBox.style.display = 'none'; });

    if(formInqObj) {
        if(localStorage.getItem('staypremium_name')) document.getElementById('inq-client-name').value = localStorage.getItem('staypremium_name');
        if(localStorage.getItem('staypremium_phone')) document.getElementById('inq-client-phone').value = localStorage.getItem('staypremium_phone');

        formInqObj.onsubmit = (event) => {
            event.preventDefault();
            commitInquiryPayloadCloud();
        };
    }

    // STREAM CONNECTOR NODE: DATABASE FETCH POOL
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

    if (searchInput) searchInput.addEventListener('input', renderPGDataViewGrid);

    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            selectedActiveTagFilter = tag.dataset.type;
            renderPGDataViewGrid();
        });
    });

    // Voice Processing Speech Recognition API Loop Configuration Hooks
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
                const vocalResultText = e.results[0][0].transcript;
                searchInput.value = vocalResultText;
                searchInput.placeholder = "Search premium PGs by name, area or landmark...";
                renderPGDataViewGrid();
            };
            SpeechEngineInstance.onerror = () => {
                searchInput.placeholder = "Vocal sound signature verification tracing crashed.";
            };
        } else {
            voiceBtn.style.display = 'none';
        }
    }
});

// CORE RENDERING MATRIX PIPELINE
function renderPGDataViewGrid() {
    const container = document.getElementById('pg-cards-container');
    if(!container) return;

    const queryInput = document.getElementById('pg-search-input');
    const keywordStr = queryInput ? queryInput.value.toLowerCase().trim() : '';
    const savedList = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];

    // Local Storage Reactive City Verification Fallback (Normalized)
    currentSelectedCity = (localStorage.getItem('staypremium_selected_city') || "all").toLowerCase().trim();

    // DYNAMIC HEADING LOGIC FOR FILTERS
    const headingNode = document.getElementById('listings-heading');
    if (headingNode) {
        let headingParts = [];

        if (selectedActiveTagFilter && selectedActiveTagFilter !== "all") {
            headingParts.push(selectedActiveTagFilter);
        }

        headingParts.push("PGs");

        if (currentSelectedCity && currentSelectedCity !== "all" && currentSelectedCity !== "all cities") {
            const formattedCity = currentSelectedCity.charAt(0).toUpperCase() + currentSelectedCity.slice(1);
            headingParts.push(`in ${formattedCity}`);
        }

        const totalText = headingParts.join(' ');
        if (totalText === "PGs" || (selectedActiveTagFilter === "all" && (currentSelectedCity === "all" || currentSelectedCity === "all cities"))) {
            headingNode.innerText = "Recommended Spaces";
        } else {
            headingNode.innerText = `Results for ${totalText}`;
        }
    }

    // GLOBAL RANKING & VIEWS CALCULATION ENGINE
    const cityBasedRecords = masterPGRecords.filter(post => {
        const propertyCity = (post.city || "").toLowerCase().trim();
        if (currentSelectedCity !== "all" && currentSelectedCity !== "all cities" && currentSelectedCity !== "") {
            return propertyCity === currentSelectedCity;
        }
        return true;
    });

    const sortedGlobalViews = [...cityBasedRecords].sort((a, b) => {
        const viewsA = parseInt(a.viewsCount || a.views || 0, 10);
        const viewsB = parseInt(b.viewsCount || b.views || 0, 10);
        return viewsB - viewsA;
    });

    const topRank1Id = sortedGlobalViews[0] && parseInt(sortedGlobalViews[0].viewsCount || sortedGlobalViews[0].views || 0, 10) > 0 ? sortedGlobalViews[0].id : null;
    const topRank2Id = sortedGlobalViews[1] && parseInt(sortedGlobalViews[1].viewsCount || sortedGlobalViews[1].views || 0, 10) > 0 ? sortedGlobalViews[1].id : null;

    // EVALUATE COMPLETE INTERACTIVE FILTERS
    const evaluatedResultGrid = cityBasedRecords.filter(post => {
        const nameMatch = (post.name || post.title || "").toLowerCase().includes(keywordStr);
        const areaMatch = (post.area || post.location || "").toLowerCase().includes(keywordStr);
        const searchValidity = nameMatch || areaMatch;

        if(!searchValidity) return false;

        const filterTypeNormalized = selectedActiveTagFilter.toLowerCase().trim();

        if(filterTypeNormalized === "all") return true;
        
        // SHARING TYPE FILTERS
        if(filterTypeNormalized === "single room") return post.sharingType && post.sharingType.toLowerCase().includes('single');
        if(filterTypeNormalized === "double sharing") return post.sharingType && post.sharingType.toLowerCase().includes('double');
        if(filterTypeNormalized === "triple sharing") return post.sharingType && post.sharingType.toLowerCase().includes('triple');
        
        // FURNISHED TYPE FILTERS
        if(filterTypeNormalized === "fully furnished") return post.furnishedType && post.furnishedType.toLowerCase().includes('fully');
        if(filterTypeNormalized === "semi furnished") return post.furnishedType && post.furnishedType.toLowerCase().includes('semi');
        
        // AMENITIES FILTERS
        if(filterTypeNormalized === "food included") return post.food === true || post.mess === true || post.foodIncluded === true;
        if(filterTypeNormalized === "ac") return post.ac === true || post.airConditioner === true;
        
        return true;
    });

    // ORIGINAL EMPTY SCREEN FALLBACK ENGINE WITH PROPER GRAPHIC LAYOUT
    if(evaluatedResultGrid.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1; display:flex; flex-direction:column; align-items:center; padding:60px 20px; background:#fff; border-radius:16px; text-align:center; width: 100%; box-sizing: border-box; max-width: 600px; margin: 30px auto; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                <img src="assets/stay100.png" alt="No Results" style="width: 100%; max-width: 280px; height: auto; margin-bottom: 25px; filter: drop-shadow(0px 8px 16px rgba(0,0,0,0.08));" onerror="this.src='https://via.placeholder.com/280x180?text=No+Assets+Found'">
                <h3 style="margin:0 0 6px 0; font-size:22px; color:#1e293b; font-weight:700;">No Matching Assets Found</h3>
                <p style="margin:0; font-size:14px; color:#64748b; max-width:400px; line-height:1.5;">Alter keywords or cycle matching filtration blocks to acquire active PG spaces in this zone.</p>
            </div>
        `;
        return;
    }

    // DYNAMIC RENDER PIPELINE VIA COMPONENT COMPATIBILITY
    if (window.PropertyCardComponent && typeof window.PropertyCardComponent.render === 'function') {
        container.innerHTML = evaluatedResultGrid.map(item => {
            let isVerifiedVendorProperty = (item.isVerified === true || item.verified === true || item.verificationPlan);
            let labelBadge = item.badge || "Premium PG";

            if (item.id === topRank1Id) {
                labelBadge = "Most Viewed Rank 1";
            } else if (item.id === topRank2Id) {
                labelBadge = "Most Viewed Rank 2";
            } else if (isVerifiedVendorProperty) {
                labelBadge = "Verified Space";
            }

            const structuralRenderClone = {
                ...item,
                badge: labelBadge,
                badgeText: labelBadge,
                tag: labelBadge,
                isVerified: isVerifiedVendorProperty
            };

            return window.PropertyCardComponent.render(structuralRenderClone, savedList);
        }).join('');

        // AUTO-SWIPER METHOD EXECUTION TO PREVENT EMPTY SLIDERS OR BROKEN CLICKS
        if (typeof window.PropertyCardComponent.initAutoswipe === 'function') {
            window.PropertyCardComponent.initAutoswipe();
        }
    } else {
        // Dynamic Fallback UI rendering pattern to safeguard structural system fields dynamically
        container.innerHTML = evaluatedResultGrid.map(item => {
            const isSaved = savedList.includes(item.id);
            const displaySharing = item.sharingType ? `${item.sharingType.charAt(0).toUpperCase() + item.sharingType.slice(1)} Sharing` : 'Standard Sharing';
            const displayFurnished = item.furnishedType ? `${item.furnishedType.charAt(0).toUpperCase() + item.furnishedType.slice(1)} Furnished` : 'Furnished';
            const foodStatus = (item.food || item.mess) ? 'Food Included' : 'Food Not Included';
            const acStatus = item.ac ? 'AC Available' : 'Non-AC';

            return `
                <div class="property-card" data-view-id="${item.id}" style="position:relative; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.05); cursor:pointer;">
                    <img src="${item.image || item.imageUrl || 'https://via.placeholder.com/400x250'}" style="width:100%; height:200px; object-fit:cover;">
                    <div style="padding:16px;">
                        <h4 style="margin:0 0 8px 0; font-size:16px; color:#1e293b; font-weight:700;">${item.name || item.title || 'Premium Accommodation'}</h4>
                        <p style="margin:0 0 8px 0; font-size:13px; color:#64748b;"><i class="fa-solid fa-location-dot"></i> ${item.location || item.area || 'Premium Location'}</p>
                        
                        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">
                            <span style="font-size:11px; background:#f1f5f9; color:#475569; padding:3px 8px; border-radius:4px; font-weight:500;">${displaySharing}</span>
                            <span style="font-size:11px; background:#f1f5f9; color:#475569; padding:3px 8px; border-radius:4px; font-weight:500;">${displayFurnished}</span>
                            <span style="font-size:11px; background:#f1f5f9; color:#475569; padding:3px 8px; border-radius:4px; font-weight:500;">${acStatus}</span>
                            <span style="font-size:11px; background:#f1f5f9; color:#475569; padding:3px 8px; border-radius:4px; font-weight:500;">${foodStatus}</span>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-weight:700; color:#b91c1c; font-size:16px;">₹${item.price || item.rent || 'N/A'}/mo</span>
                            <div style="display:flex; gap:8px; margin-left:auto;">
                                <button data-save-id="${item.id}" style="background:none; border:none; cursor:pointer; font-size:18px; color:${isSaved ? '#ef4444' : '#cbd5e1'}"><i class="fa-${isSaved ? 'solid' : 'regular'} fa-heart"></i></button>
                                <button data-inquiry-id="${item.id}" style="background:#b91c1c; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;">Inquire</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // RUN-TIME DIRECT DOM OVERRIDE INTERCEPTOR (CRITICAL FORCE PATCH)
    setTimeout(() => {
        evaluatedResultGrid.forEach(item => {
            const cardDOM = container.querySelector(`[data-view-id="${item.id}"]`);
            if (cardDOM) {
                let badgeHTMLText = "";
                let badgeBgColor = "#64748b"; 
                let isVerifiedVendorProperty = (item.isVerified === true || item.verified === true || item.verificationPlan);

                if (item.id === topRank1Id) {
                    badgeHTMLText = "<i class='fa-solid fa-fire'></i> Most Viewed Rank 1";
                    badgeBgColor = "#dc2626"; 
                } else if (item.id === topRank2Id) {
                    badgeHTMLText = "<i class='fa-solid fa-bolt'></i> Most Viewed Rank 2";
                    badgeBgColor = "#ea580c"; 
                } else if (isVerifiedVendorProperty) {
                    badgeHTMLText = "<i class='fa-solid fa-circle-check'></i> Verified Space";
                    badgeBgColor = "#16a34a"; 
                }

                if (badgeHTMLText !== "") {
                    let badgeElement = cardDOM.querySelector('.card-badge, .badge, .property-tag, .tag, [class*="badge"], [class*="tag"]');
                    
                    if (badgeElement) {
                        badgeElement.innerHTML = badgeHTMLText;
                        badgeElement.style.background = badgeBgColor;
                        badgeElement.style.color = "#ffffff";
                    } else {
                        const injectBadgeNode = document.createElement('div');
                        Object.assign(injectBadgeNode.style, {
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            background: badgeBgColor,
                            color: '#ffffff',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            zIndex: '10',
                            fontFamily: '"Plus Jakarta Sans", sans-serif',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                        });
                        injectBadgeNode.innerHTML = badgeHTMLText;
                        cardDOM.style.position = 'relative';
                        cardDOM.appendChild(injectBadgeNode);
                    }
                }
            }
        });
    }, 50);
}

// Global Event Delegate Interceptors
const cardsContainer = document.getElementById('pg-cards-container');
if (cardsContainer) {
    cardsContainer.addEventListener('click', (event) => {
        const viewHandle = event.target.closest('[data-view-id]');
        const inquiryHandle = event.target.closest('[data-inquiry-id]');
        const saveHandle = event.target.closest('[data-save-id]');

        if(saveHandle || inquiryHandle) {
            return; 
        }

        if(viewHandle) {
            const id = viewHandle.getAttribute('data-view-id');
            window.location.href = `details.html?id=${id}`;
        }
    });

    // Handle Bookmark Actions Separately
    cardsContainer.addEventListener('click', (event) => {
        const saveHandle = event.target.closest('[data-save-id]');
        if(saveHandle) {
            event.preventDefault();
            event.stopPropagation();

            if(!currentSessionUID) {
                showCenteredToast("<i class='fa-solid fa-lock' style='color:#ea580c; margin-right:6px;'></i> Authentication required. Please log in.");
                setTimeout(() => { window.location.href = 'login.html'; }, 1200);
                return;
            }

            const targetPropId = saveHandle.getAttribute('data-save-id');
            const targetPostObj = masterPGRecords.find(p => p.id === targetPropId);
            if(!targetPostObj) return;

            let savedList = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];
            const index = savedList.indexOf(targetPropId);
            const userSavedRefNode = ref(database, `users_saved/${currentSessionUID}/${targetPropId}`);

            if(index === -1) {
                const cardDataSnapshot = {
                    id: targetPropId,
                    name: targetPostObj.name || targetPostObj.title || "Premium PG",
                    title: targetPostObj.name || targetPostObj.title || "Premium PG",
                    price: targetPostObj.price || targetPostObj.rent || 0,
                    mrp: targetPostObj.mrp || 0,
                    location: targetPostObj.location || targetPostObj.area || "Premium Area",
                    image: targetPostObj.image || targetPostObj.imageUrl || "",
                    badge: targetPostObj.badge || "PG"
                };

                set(userSavedRefNode, cardDataSnapshot).then(() => {
                    if(!savedList.includes(targetPropId)) savedList.push(targetPropId);
                    localStorage.setItem('staypremium_saved_properties', JSON.stringify(savedList));
                    showCenteredToast("<i class='fa-solid fa-heart' style='color:#ef4444; margin-right:6px;'></i> Added to Premium Bookmarks Vault!");
                    renderPGDataViewGrid();
                });
            } else {
                remove(userSavedRefNode).then(() => {
                    savedList = savedList.filter(id => id !== targetPropId);
                    localStorage.setItem('staypremium_saved_properties', JSON.stringify(savedList));
                    showCenteredToast("<i class='fa-solid fa-heart-crack' style='color:#64748b; margin-right:6px;'></i> Removed from Bookmarks Vault.");
                    renderPGDataViewGrid();
                });
            }
        }
    });

    // Handle Inquiry View Modal Open Logic Trigger
    cardsContainer.addEventListener('click', (event) => {
        const inquiryHandle = event.target.closest('[data-inquiry-id]');
        if(inquiryHandle) {
            event.preventDefault();
            event.stopPropagation();

            if(!currentSessionUID) {
                showCenteredToast("<i class='fa-solid fa-circle-xmark' style='color:#ef4444; margin-right:5px;'></i> Access Denied! Please login to dispatch inquiries.");
                setTimeout(() => { window.location.href = 'login.html'; }, 1200);
                return;
            }

            const targetPropId = inquiryHandle.getAttribute('data-inquiry-id');
            const targetPostObj = masterPGRecords.find(p => p.id === targetPropId);
            if(!targetPostObj) return;

            document.getElementById('inq-prop-id').value = targetPropId;
            document.getElementById('inq-prop-name').value = targetPostObj.name || targetPostObj.title || "Premium PG";
            document.getElementById('inq-prop-location').value = targetPostObj.location || targetPostObj.area || "";
            
            document.getElementById('inquiry-modal').style.setProperty('display', 'flex', 'important');
        }
    });
}

// Submit Inquiry Request Packet To Realtime Node Locations
function commitInquiryPayloadCloud() {
    const propertyId = document.getElementById('inq-prop-id').value;
    const propertyName = document.getElementById('inq-prop-name').value;
    const propertyLocation = document.getElementById('inq-prop-location').value;
    const clientName = document.getElementById('inq-client-name').value.trim();
    const clientPhone = document.getElementById('inq-client-phone').value.trim();
    const clientMsg = document.getElementById('inq-client-msg').value.trim();

    if(!propertyId || !clientName || !clientPhone) {
        showCenteredToast("<i class='fa-solid fa-triangle-exclamation' style='color:#f59e0b; margin-right:6px;'></i> Form parameters verification incomplete.");
        return;
    }

    const globalInquiryNodeRef = ref(database, 'inquiries');
    const newInquiryPushNode = push(globalInquiryNodeRef);
    const generatedInquiryId = newInquiryPushNode.key;

    const timestampNow = Date.now();

    const inquiryPayload = {
        inquiryId: generatedInquiryId,
        propertyId: propertyId,
        propertyBranchNode: "properties",
        propertyName: propertyName,
        propertyLocation: propertyLocation,
        userId: currentSessionUID,
        userUid: currentSessionUID,
        uid: currentSessionUID,
        clientName: clientName,
        clientPhone: clientPhone,
        clientMessage: clientMsg,
        message: clientMsg,
        timestamp: timestampNow,
        date: new Date(timestampNow).toLocaleString('en-IN')
    };

    const leadsRefNode = ref(database, `leads_inquiries/${generatedInquiryId}`);

    Promise.all([
        set(newInquiryPushNode, inquiryPayload),
        set(leadsRefNode, inquiryPayload)
    ])
    .then(() => {
        const recentInquiriesRef = ref(database, `users/${currentSessionUID}/recentInquiries/${generatedInquiryId}`);
        const myInquiriesRef = ref(database, `users/${currentSessionUID}/myInquiries/${generatedInquiryId}`);
        
        const profilePayload = {
            inquiryId: generatedInquiryId,
            propertyId: propertyId,
            propertyName: propertyName,
            propertyLocation: propertyLocation,
            timestamp: timestampNow,
            date: inquiryPayload.date
        };

        return Promise.all([
            set(recentInquiriesRef, profilePayload),
            set(myInquiriesRef, profilePayload)
        ]);
    })
    .then(() => {
        showCenteredToast(`<i class='fa-solid fa-circle-check' style='color:#10b981; margin-right:6px;'></i> Success! Inquiry for <b>${propertyName}</b> saved to dashboard.`);
        document.getElementById('inquiry-modal').style.display = 'none';
        
        const formObj = document.getElementById('inquiry-form');
        if(formObj) {
            formObj.reset();
            if(localStorage.getItem('staypremium_name')) document.getElementById('inq-client-name').value = localStorage.getItem('staypremium_name');
            if(localStorage.getItem('staypremium_phone')) document.getElementById('inq-client-phone').value = localStorage.getItem('staypremium_phone');
        }
    })
    .catch((err) => {
        console.error("Critical database sync error: ", err);
        showCenteredToast("<i class='fa-solid fa-circle-xmark' style='color:#ef4444; margin-right:6px;'></i> Cloud write operation synchronization failed.");
    });
}