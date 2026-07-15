import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, update, push, child } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase App Configuration Instance Core
const firebaseConfig = {
  apiKey: "AIzaSyCcStFHPf5AOCZgqMCWq9T7nd4lFXAcA8M",
  authDomain: "stay100-31316.firebaseapp.com",
  databaseURL: "https://stay100-31316-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stay100-31316"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

let masterCityRecords = [];
let activeFilter = "all";
const currentSessionUID = localStorage.getItem('staypremium_uid') || null;

document.addEventListener('DOMContentLoaded', () => {
    initRealtimeDatabaseStream();
    initFilterControls();
    initSearchEngine();
    initVoiceRecognitionEngine();
    initGlobalActionDelegator();
    initInquiryFormEngine();
});

/**
 * 1. Dynamic Realtime Synchronization Stream via Firebase
 */
function initRealtimeDatabaseStream() {
    const propertiesNodeRef = ref(database, 'properties');
    const container = document.getElementById('pg-cards-container');

    onValue(propertiesNodeRef, (snapshot) => {
        try {
            const rawPayload = snapshot.val();
            if (rawPayload) {
                masterCityRecords = Object.keys(rawPayload).map(key => ({
                    id: key,
                    ...rawPayload[key]
                })).filter(item => item.city && item.city.toLowerCase() === 'jaipur');
                
                renderJaipurGrid();
            } else {
                if (container) {
                    container.innerHTML = '<div class="loader-text">No properties currently deployed in Jaipur.</div>';
                }
            }
        } catch (error) {
            console.error("Database streaming matrix failure:", error);
            if (container) {
                container.innerHTML = '<div class="loader-text" style="color:#dc2626;">Failed to stream synchronized assets.</div>';
            }
        }
    }, (error) => {
        console.error("Firebase Read Permission Cancelled:", error);
    });
}

/**
 * 2. Filter Activation Controls Engine
 */
function initFilterControls() {
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
            const target = e.target.closest('.filter-tag');
            target.classList.add('active');
            activeFilter = target.dataset.type.toLowerCase();
            renderJaipurGrid();
        });
    });
}

/**
 * 3. Text Search Engine Implementation
 */
function initSearchEngine() {
    const searchInput = document.getElementById('pg-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            renderJaipurGrid();
        }, 250));
    }
}

/**
 * 4. Web Speech API Voice Recognition Integration
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
        searchInput.placeholder = "Listening attentively to search criteria...";
    };

    recognition.onend = () => {
        voiceBtn.classList.remove('listening');
        searchInput.placeholder = "Search Jaipur PGs, flats, hostels...";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        renderJaipurGrid();
    };

    recognition.onerror = (err) => {
        console.error("Speech Recognition Engine Fault:", err);
        voiceBtn.classList.remove('listening');
    };
}

/**
 * 5. Functional Processing Layout Matrix Grid Pipeline
 */
function renderJaipurGrid() {
    const container = document.getElementById('pg-cards-container');
    const keyword = document.getElementById('pg-search-input')?.value.toLowerCase().trim() || "";
    const savedList = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || [];
    
    if (!container) return;

    const filtered = masterCityRecords.filter(p => {
        const titleMatch = (p.name || "").toLowerCase().includes(keyword);
        const locationMatch = (p.location || "").toLowerCase().includes(keyword);
        const matchesSearch = titleMatch || locationMatch;
        
        if (!matchesSearch) return false;
        if (activeFilter === "all") return true;
        
        // Context-aware dynamic normalization
        const propertyType = (p.type || "").toLowerCase();
        const sharingType = (p.sharingType || "").toLowerCase();
        
        if (activeFilter === "rooms") return propertyType === 'room' || propertyType === 'pg';
        if (activeFilter === "flats") return propertyType === 'flat' || propertyType === 'house';
        if (activeFilter === "single sharing") return sharingType.includes('single') || p.sharing === 1;
        if (activeFilter === "food included") return p.food === true || p.mess === true || String(p.amenities).toLowerCase().includes('food');
        if (activeFilter === "ac") return p.ac === true || String(p.amenities).toLowerCase().includes('ac');
        
        return true;
    });

    if (window.PropertyCardComponent) {
        container.innerHTML = filtered.length > 0 
            ? filtered.map(item => window.PropertyCardComponent.render(item, savedList)).join('')
            : `<div class="loader-text">No verified properties matching "${keyword}" found in Jaipur.</div>`;
            
        if (typeof window.PropertyCardComponent.initAutoswipe === 'function') {
            window.PropertyCardComponent.initAutoswipe();
        }
    }
}

/**
 * 6. Global Event Delegation Handling (Clicks, Saves, Inquiry Intercepts)
 */
function initGlobalActionDelegator() {
    const cardGrid = document.getElementById('pg-cards-container');
    if (!cardGrid) return;

    cardGrid.addEventListener('click', (e) => {
        const saveBtn = e.target.closest('[data-save-id]');
        const inqBtn = e.target.closest('[data-inquiry-id]');
        const card = e.target.closest('[data-view-id]');

        if (saveBtn) {
            e.preventDefault();
            e.stopPropagation();
            handleSaveAction(saveBtn.dataset.saveId, saveBtn.querySelector('i'));
        } 
        else if (inqBtn) {
            e.preventDefault();
            e.stopPropagation();
            openInquiryModal(inqBtn.dataset.inquiryId);
        } 
        else if (card) {
            window.location.href = `details.html?id=${card.dataset.viewId}`;
        }
    });
}

/**
 * 7. Bookmark Save Management Node Operation
 */
function handleSaveAction(propertyId, iconElement) {
    if (!currentSessionUID) {
        alert("Authentication required. Please access the portal login area to save target configurations.");
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
    
    // Asynchronously push metadata telemetry synchronization to user account table matrix
    const userSaveRef = ref(database, `users/${currentSessionUID}/savedProperties`);
    update(userSaveRef, { [propertyId]: !isSaved }).catch(err => {
        console.warn("Telemetry synchronization deferred:", err);
    });
}

/**
 * 8. Core Multi-Channel Inquiry System Operations
 */
function openInquiryModal(id) {
    const property = masterCityRecords.find(p => p.id === id);
    if (!property) return;
    
    const modal = document.getElementById('inquiry-modal');
    if (modal) {
        document.getElementById('inq-prop-id').value = id;
        document.getElementById('inq-prop-name').value = property.name || "Premium Stay Node";
        modal.style.display = 'flex';
    } else {
        alert("Inquiry infrastructure execution parameters uninitialized.");
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
            userUid: currentSessionUID || "anonymous_lead",
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
            console.error("Failed to commit database entry transaction:", error);
            alert("Data commitment connection breakdown. Please try again.");
        }
    });
}

/**
 * Optimization Helper Matrix: Debounce Module logic
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