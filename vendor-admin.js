/**
 * StayPremium - Unified Property Card UI Component Engine (Upgraded Version)
 * Extended with Desktop & Mobile Support for "Recommended", "Popular", "Latest Rent", and "Trending".
 * Integrated with 4K Property Video uploads via Cloudinary & Runtime Schema.
 * Fully Upgraded with 99Acres Fields, Premium Field Configurations, Address Specs & Details Sync Layer.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getDatabase, ref, push, set, onValue, remove, query, orderByChild, equalTo 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { 
    getAuth, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase Configuration Block
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

// Instantiation Block
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Cloudinary CDN Configuration
const CLOUDINARY_CLOUD_NAME = "dxt42tn4c"; 
const CLOUDINARY_UPLOAD_PRESET = "sahilkumawat"; 

// Global Memory Caches
let currentVendorId = null;
let localPropertiesCache = {};

// Navigation Event Handlers Routing Logic 
const targetNavs = document.querySelectorAll('.sidebar-item, .mobile-nav-item');
const viewPanels = document.querySelectorAll('.panel-view');

targetNavs.forEach(navNode => {
    navNode.addEventListener('click', function() {
        const activeId = this.getAttribute('data-target');
        switchNavigationTabs(activeId);
    });
});

function switchNavigationTabs(activeId) {
    targetNavs.forEach(item => item.classList.remove('active'));
    viewPanels.forEach(panel => panel.classList.remove('active'));

    document.querySelectorAll(`[data-target="${activeId}"]`).forEach(n => n.classList.add('active'));
    const destinationPanel = document.getElementById(activeId);
    if(destinationPanel) destinationPanel.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Global UI Custom Alert System
window.fireNoticeToast = function(message) {
    const toast = document.getElementById('center-toast');
    if (!toast) return alert(message);
    toast.innerHTML = message;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
};

// Binary Media Storage Handler Engine (Cloudinary Adaptive for Images & Videos)
async function processCloudinaryFileUpload(fileObject) {
    if (!fileObject) return null;
    const dataForm = new FormData();
    dataForm.append("file", fileObject);
    dataForm.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    
    // Auto-detect routing endpoint depending on file signature type
    const resourceType = fileObject.type.startsWith('video/') ? 'video' : 'image';
    
    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
            method: "POST",
            body: dataForm
        });
        const parsedJson = await response.json();
        return parsedJson.secure_url || null;
    } catch (err) {
        console.error("Cloudinary Transmission Error Node:", err);
        return null;
    }
}

// Inject Extra Multi-Image Dynamic File Nodes
window.injectGalleryField = function(existingUrl = "") {
    const container = document.getElementById('gallery-repeater-root');
    if (!container) return;
    const wrappingBlock = document.createElement('div');
    wrappingBlock.className = 'repeater-box';
    wrappingBlock.innerHTML = `
        <input type="file" class="gallery-file-field" accept="image/*" data-existing="${existingUrl}">
        ${existingUrl ? `<img src="${existingUrl}" class="img-preview-bubble" style="width:50px; height:40px; object-fit:cover; border-radius:4px;">` : ''}
        <button type="button" class="btn-small btn-remove" onclick="this.parentElement.remove()"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(wrappingBlock);
};

// Runtime validation monitoring for 30 seconds video limits 
document.getElementById('p-video-file')?.addEventListener('change', function(e) {
    const videoFile = e.target.files[0];
    if (videoFile) {
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';
        videoElement.onloadedmetadata = function() {
            window.URL.revokeObjectURL(videoElement.src);
            if (videoElement.duration > 31) { 
                fireNoticeToast("⚠️ Video length 30 seconds se zyada nahi honi chahiye.");
                document.getElementById('p-video-file').value = ""; // Reset file selector
            }
        };
        videoElement.src = URL.createObjectURL(videoFile);
    }
});

// Real-time Event Listener for Dynamic Category Toggle (Apartment -> Flat Type)
document.getElementById('p-category')?.addEventListener('change', function() {
    const flatTypeWrapper = document.getElementById('flat-type-wrapper');
    if (flatTypeWrapper) {
        if (this.value.toLowerCase() === 'apartment' || this.value.toLowerCase() === 'apartments') {
            flatTypeWrapper.style.display = 'block';
        } else {
            flatTypeWrapper.style.display = 'none';
            document.getElementById('p-flat-type').value = ""; // Reset value if hidden
        }
    }
});

// Create / Modify Structural Payload Logic Database Entry Channel
document.getElementById('property-payload-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!currentVendorId) return fireNoticeToast("❌ Action Aborted: Active vendor signature missing.");

    const btn = document.getElementById('p-submit-btn');
    const editId = document.getElementById('p-edit-target-id').value;
    const textElement = document.getElementById('submit-btn-text');
    
    btn.disabled = true;
    if (textElement) textElement.innerText = "Uploading Media Nodes...";

    // 1. Process Primary Thumbnail
    const heroFileField = document.getElementById('p-hero-file').files[0];
    let uploadedHeroUrl = document.getElementById('p-existing-hero-url').value;

    if (heroFileField) {
        const cloudUrl = await processCloudinaryFileUpload(heroFileField);
        if (cloudUrl) uploadedHeroUrl = cloudUrl;
        else {
            fireNoticeToast("❌ Main Image upload failed.");
            btn.disabled = false;
            if (textElement) textElement.innerText = "Deploy Asset Node System";
            return;
        }
    }

    if (!uploadedHeroUrl) {
        fireNoticeToast("⚠️ Primary Thumbnail is mandatory.");
        btn.disabled = false;
        if (textElement) textElement.innerText = "Deploy Asset Node System";
        return;
    }

    // 2. Process Property Video Upload Node (4K Format pipeline)
    const propertyVideoField = document.getElementById('p-video-file')?.files[0];
    let uploadedVideoUrl = document.getElementById('p-existing-video-url')?.value || "";

    if (propertyVideoField) {
        if (textElement) textElement.innerText = "Processing 4K Property Video Node...";
        const videoCloudUrl = await processCloudinaryFileUpload(propertyVideoField);
        if (videoCloudUrl) {
            uploadedVideoUrl = videoCloudUrl;
        } else {
            fireNoticeToast("❌ Video pipeline parsing dropped. Saving fallback parameters.");
        }
    }

    // 3. Process Secondary Multi-Image Stream Clusters
    const imagesCluster = [uploadedHeroUrl];
    const genericFileFields = document.querySelectorAll('.gallery-file-field');
    
    for (let node of genericFileFields) {
        const localizedFile = node.files[0];
        const preExistingUrl = node.getAttribute('data-existing');
        if (localizedFile) {
            const dynamicCloudUrl = await processCloudinaryFileUpload(localizedFile);
            if(dynamicCloudUrl) imagesCluster.push(dynamicCloudUrl);
        } else if (preExistingUrl) {
            imagesCluster.push(preExistingUrl);
        }
    }

  const targetCategory = document.getElementById('p-category').value;
    const basePrice = parseFloat(document.getElementById('p-price').value) || 0;
    const rawMrp = parseFloat(document.getElementById('p-mrp').value) || 0;
    
    let savedPostedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Sahi Logic: Default false rahega (Agar vendor verified nahi hai toh unverified rahega)
    let isPropertyVerified = false; 

    // Agar property pehle se database me hai aur uska status check karna hai (Edit mode me)
    if (editId && localPropertiesCache[editId]) {
        if (localPropertiesCache[editId].postedDate) {
            savedPostedDate = localPropertiesCache[editId].postedDate;
        }
        if (localPropertiesCache[editId].isVerified !== undefined) {
            isPropertyVerified = localPropertiesCache[editId].isVerified;
        }
    } else {
        // Nayi property ke liye: Agar aapke paas vendor ki profile ka verification variable hai (jaise: currentVendorVerified)
        // toh aap yahan likh sakte hain: isPropertyVerified = currentVendorVerified || false;
        // Abhi ke liye naye vendors ki property hamesha pehle check/unverified (false) hi submit hogi.
        isPropertyVerified = false;
    }
    // Amenities Capture Pipeline
    const amenitiesArray = [];
    if(document.getElementById('v-wifi')?.checked) amenitiesArray.push("High Speed Wi-Fi");
    if(document.getElementById('v-ac')?.checked) amenitiesArray.push("Air Conditioner");
    if(document.getElementById('v-food')?.checked) amenitiesArray.push("Homely Food");
    if(document.getElementById('v-power')?.checked) amenitiesArray.push("Power Backup");
    if(document.getElementById('v-laundry')?.checked) amenitiesArray.push("Laundry Unit");
    if(document.getElementById('v-gym')?.checked) amenitiesArray.push("GYM Access");
    if(document.getElementById('v-geyser')?.checked) amenitiesArray.push("24x7 Geyser");
    if(document.getElementById('v-fridge')?.checked) amenitiesArray.push("Shared Refrigerator");
    if(document.getElementById('v-cctv')?.checked) amenitiesArray.push("CCTV Security");
    if(document.getElementById('v-security')?.checked) amenitiesArray.push("24/7 Guard");
    if(document.getElementById('v-ro')?.checked) amenitiesArray.push("RO Drinking Water");
    if(document.getElementById('v-housekeeping')?.checked) amenitiesArray.push("Daily Housekeeping");
    if(document.getElementById('v-parking')?.checked) amenitiesArray.push("Vehicle Parking");
    if(document.getElementById('v-tv')?.checked) amenitiesArray.push("Smart TV / Lounge");
    if(document.getElementById('v-elevator')?.checked) amenitiesArray.push("Lift / Elevator");

    let currentOperationRef = editId ? ref(db, `properties/${editId}`) : push(ref(db, 'properties'));
    const propertyUniqueId = editId || currentOperationRef.key;

    const propertySchemaPayload = {
        id: propertyUniqueId,
        vendorId: currentVendorId, 
        uid: currentVendorId, 
        userId: currentVendorId,
        category: targetCategory,
        type: targetCategory,
        flatType: targetCategory.toLowerCase() === 'apartment' ? document.getElementById('p-flat-type').value : "",
        name: document.getElementById('p-name').value.trim(),
        title: document.getElementById('p-name').value.trim(),
        description: document.getElementById('p-desc').value.trim(),
        houseRules: document.getElementById('p-rules').value.trim(),
        price: basePrice,
        rent: basePrice,
        currentPrice: basePrice,
        mrp: rawMrp,
        originalPrice: rawMrp,
        deposit: parseFloat(document.getElementById('p-deposit').value) || 0,
        badge: document.getElementById('p-badge').value.trim(),
        sharingType: document.getElementById('p-sharing').value,
        furnishing: document.getElementById('p-furnishing').value,
        genderType: document.getElementById('p-gender').value,
        suitableForGender: document.getElementById('p-gender').value,
        availableFrom: document.getElementById('p-available-from')?.value.trim() || "Immediate",
        suitableFor: document.getElementById('p-suitable-for')?.value.trim() || "",
        
        roomsCount: document.getElementById('p-count-rooms').value.trim(),
        bathroomsCount: document.getElementById('p-count-bathrooms').value.trim(),
        balconiesCount: document.getElementById('p-count-balconies').value.trim(),
        propertyTypeMeta: document.getElementById('p-type-meta').value.trim(),
        floorNumber: document.getElementById('p-floor').value.trim(),
        flooring: document.getElementById('p-flooring-type').value.trim(),
        parking: document.getElementById('p-parking').value.trim(),
        powerBackup: document.getElementById('p-power-backup').value.trim(),
        attachedBathroom: document.getElementById('p-attached-bathroom').value,
        attachedBalcony: document.getElementById('p-attached-balcony').value,
        
        // Premium 99Acres Dynamic Properties Mappings
        minimumContract: document.getElementById('p-contract')?.value.trim() || "",
        earlyLeavingCharges: document.getElementById('p-leaving-charges')?.value.trim() || "",
        noticePeriod: document.getElementById('p-notice-period')?.value.trim() || "",
        gateClosingTime: document.getElementById('p-gate-time')?.value.trim() || "",
        electricityPolicy: document.getElementById('p-electricity-rules')?.value.trim() || "",
        mealsConfig: document.getElementById('p-meal-type')?.value.trim() || "",
        propertyAge: document.getElementById('p-age').value.trim(),

        // Address Field Mappings Sync
        address: document.getElementById('p-address').value.trim(),
        fullAddress: document.getElementById('p-address').value.trim(),
        location: `${document.getElementById('p-area').value.trim()}, ${document.getElementById('p-city').value.trim()}`,
        area: document.getElementById('p-area').value.trim(),
        city: document.getElementById('p-city').value.trim(),
        googleMapsEmbedUrl: document.getElementById('p-map').value.trim(), 
        mapLink: document.getElementById('p-map').value.trim(),
        
        image: uploadedHeroUrl,
        imageUrl: uploadedHeroUrl,
        videoUrl: uploadedVideoUrl, 
        allImages: imagesCluster,
        amenities: amenitiesArray,
        
        isVerified: isPropertyVerified, 
        postedBy: "Vendor Partner",
        postedDate: savedPostedDate,
        ownerName: document.getElementById('p-owner-name').value.trim(),
        ownerPhone: document.getElementById('p-owner-phone').value.trim(),
        rating: "4.5",
        reviewsCount: 12
    };

    set(currentOperationRef, propertySchemaPayload)
        .then(() => {
            fireNoticeToast("⚡ Database operation sync successful!");
            terminateFormEditMode();
            switchNavigationTabs('properties-panel');
        })
        .catch(() => fireNoticeToast("❌ Realtime communication error."))
        .finally(() => {
            btn.disabled = false;
            if (textElement) textElement.innerText = "Deploy Asset Node System";
        });
});

// Live Data Engine Render System
window.fetchLivePropertiesStream = function() {
    const terminal = document.getElementById('live-properties-terminal');
    if (!terminal || !currentVendorId) return;
    
    const isolatedVendorQuery = query(
        ref(db, 'properties'),
        orderByChild('vendorId'),
        equalTo(currentVendorId)
    );
    
    onValue(isolatedVendorQuery, (snapshot) => {
        const data = snapshot.val() || {};
        localPropertiesCache = data;
        
        const countElement = document.getElementById('sidebar-count');
        if(countElement) countElement.innerText = Object.keys(data).length;

        if(Object.keys(data).length === 0) {
            terminal.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:40px; grid-column:1/-1;">Aapke vendor subscription par koi assets active nahi hain.</div>`;
            return;
        }

        terminal.innerHTML = "";
        Object.keys(data).forEach(key => {
            const prop = data[key];
            const card = document.createElement('div');
            card.className = 'prop-preview-card';
            card.innerHTML = `
                <div class="prop-img-box">
                    <img src="${prop.image || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'}" alt="Property space image">
                    ${prop.badge ? `<span class="prop-badge-ui">${prop.badge}</span>` : ''}
                    <span class="prop-cat-ui">${prop.category} ${prop.flatType ? `(${prop.flatType})` : ''}</span>
                    ${prop.videoUrl ? `<span class="prop-video-indicator-ui" style="position:absolute; bottom:8px; right:8px; background:rgba(0,0,0,0.7); color:#fff; padding:2px 6px; font-size:10px; border-radius:4px;"><i class="fa-solid fa-video"></i> 4K Video</span>` : ''}
                </div>
                <div class="prop-details-box">
                    <div>
                        <h3 class="prop-title-ui">${prop.name} ${prop.isVerified ? '<span class="verified-badge-inline" style="color: #1d4ed8; font-size: 14px; margin-left: 4px;"><i class="fa-solid fa-circle-check"></i> Verified</span>' : ''}</h3>
                        <div class="prop-loc-ui"><i class="fa-solid fa-location-dot"></i> ${prop.location}</div>
                        <div class="card-spec-tags">
                            <span class="spec-tag">${prop.sharingType}</span>
                            <span class="spec-tag">${prop.furnishing}</span>
                            <span class="spec-tag">${prop.genderType} Only</span>
                        </div>
                    </div>
                    <div>
                        <div class="price-flex-row">
                            <span class="price-current">₹${prop.price}/mo</span>
                            ${prop.mrp ? `<span class="price-mrp">₹${prop.mrp}</span>` : ''}
                        </div>
                        <div class="card-actions-wrapper">
                            <button type="button" class="btn-edit-node" onclick="triggerPropertyFormEdit('${key}')"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                            <button type="button" class="btn-delete-node" onclick="triggerPropertyDeletion('${key}')"><i class="fa-solid fa-trash-can"></i> Delete</button>
                        </div>
                    </div>
                </div>
            `;
            terminal.appendChild(card);
        });
    });
};

// Form Interface State Control Engine (Bi-Directional Mapping Data Sync)
window.triggerPropertyFormEdit = function(targetKey) {
    const nodeData = localPropertiesCache[targetKey];
    if(!nodeData) return;

    document.getElementById('p-edit-target-id').value = targetKey;
    document.getElementById('p-existing-hero-url').value = nodeData.image || "";
    
    // Video Rehydration Target Binding
    if (document.getElementById('p-existing-video-url')) {
        document.getElementById('p-existing-video-url').value = nodeData.videoUrl || "";
    }
    
    document.getElementById('edit-mode-alert').style.display = "flex";
    document.getElementById('form-main-heading').innerText = "Modify Current Property Config";
    document.getElementById('submit-btn-text').innerText = "Save Synchronized Changes";

    document.getElementById('p-name').value = nodeData.name || "";
    
    const targetCat = nodeData.category || "pg";
    document.getElementById('p-category').value = targetCat;
    
    // Dynamic Dropdown handling during edit actions
    const flatWrapper = document.getElementById('flat-type-wrapper');
    if(flatWrapper) {
        if(targetCat.toLowerCase() === 'apartment' || targetCat.toLowerCase() === 'apartments') {
            flatWrapper.style.display = "block";
            document.getElementById('p-flat-type').value = nodeData.flatType || "";
        } else {
            flatWrapper.style.display = "none";
            document.getElementById('p-flat-type').value = "";
        }
    }

    document.getElementById('p-sharing').value = nodeData.sharingType || "Single Sharing";
    document.getElementById('p-furnishing').value = nodeData.furnishing || "Fully Furnished";
    document.getElementById('p-gender').value = nodeData.genderType || "Both";
    document.getElementById('p-available-from').value = nodeData.availableFrom || "Immediate";
    document.getElementById('p-suitable-for').value = nodeData.suitableFor || "";
    
    document.getElementById('p-price').value = nodeData.price || "";
    document.getElementById('p-mrp').value = nodeData.mrp || "";
    document.getElementById('p-deposit').value = nodeData.deposit || "";
    
    document.getElementById('p-area').value = nodeData.area || "";
    document.getElementById('p-city').value = nodeData.city || "";
    document.getElementById('p-map').value = nodeData.googleMapsEmbedUrl || nodeData.mapLink || "";
    document.getElementById('p-address').value = nodeData.address || nodeData.fullAddress || "";
    
    document.getElementById('p-count-rooms').value = nodeData.roomsCount || "";
    document.getElementById('p-count-bathrooms').value = nodeData.bathroomsCount || "";
    document.getElementById('p-count-balconies').value = nodeData.balconiesCount || "";
    document.getElementById('p-floor').value = nodeData.floorNumber || "";
    document.getElementById('p-age').value = nodeData.propertyAge || "";
    document.getElementById('p-flooring-type').value = nodeData.flooring || "";
    document.getElementById('p-parking').value = nodeData.parking || "";
    document.getElementById('p-power-backup').value = nodeData.powerBackup || "";
    document.getElementById('p-attached-bathroom').value = nodeData.attachedBathroom || "Yes";
    document.getElementById('p-attached-balcony').value = nodeData.attachedBalcony || "No";

    // Premium 99Acres Data Rehydration Engine
    document.getElementById('p-contract').value = nodeData.minimumContract || "";
    document.getElementById('p-leaving-charges').value = nodeData.earlyLeavingCharges || "";
    document.getElementById('p-notice-period').value = nodeData.noticePeriod || "";
    document.getElementById('p-gate-time').value = nodeData.gateClosingTime || "";
    document.getElementById('p-electricity-rules').value = nodeData.electricityPolicy || "";
    document.getElementById('p-meal-type').value = nodeData.mealsConfig || "";

    document.getElementById('p-owner-name').value = nodeData.ownerName || "";
    document.getElementById('p-owner-phone').value = nodeData.ownerPhone || "";
    document.getElementById('p-type-meta').value = nodeData.propertyTypeMeta || "";
    document.getElementById('p-badge').value = nodeData.badge || "";
    document.getElementById('p-desc').value = nodeData.description || "";
    document.getElementById('p-rules').value = nodeData.houseRules || "";

    // Gallery Images Pipeline Rehydration Loop
    const container = document.getElementById('gallery-repeater-root');
    if (container) {
        container.innerHTML = ""; // Wipe default
        const existingImages = nodeData.allImages || [];
        if(existingImages.length > 1) {
            for(let i = 1; i < existingImages.length; i++) {
                window.injectGalleryField(existingImages[i]);
            }
        }
    }

    // Amenities State Rehydration
    const currentAmenities = nodeData.amenities || [];
    document.getElementById('v-wifi').checked = currentAmenities.includes("High Speed Wi-Fi");
    document.getElementById('v-ac').checked = currentAmenities.includes("Air Conditioner");
    document.getElementById('v-food').checked = currentAmenities.includes("Homely Food");
    document.getElementById('v-power').checked = currentAmenities.includes("Power Backup");
    document.getElementById('v-laundry').checked = currentAmenities.includes("Laundry Unit");
    document.getElementById('v-gym').checked = currentAmenities.includes("GYM Access");
    document.getElementById('v-geyser').checked = currentAmenities.includes("24x7 Geyser");
    document.getElementById('v-fridge').checked = currentAmenities.includes("Shared Refrigerator");
    document.getElementById('v-cctv').checked = currentAmenities.includes("CCTV Security");
    document.getElementById('v-security').checked = currentAmenities.includes("24/7 Guard");
    document.getElementById('v-ro').checked = currentAmenities.includes("RO Drinking Water");
    document.getElementById('v-housekeeping').checked = currentAmenities.includes("Daily Housekeeping");
    document.getElementById('v-parking').checked = currentAmenities.includes("Vehicle Parking");
    document.getElementById('v-tv').checked = currentAmenities.includes("Smart TV / Lounge");
    document.getElementById('v-elevator').checked = currentAmenities.includes("Lift / Elevator");

    switchNavigationTabs('deployment-panel');
};

window.terminateFormEditMode = function() {
    document.getElementById('p-edit-target-id').value = "";
    document.getElementById('p-existing-hero-url').value = "";
    if (document.getElementById('p-existing-video-url')) {
        document.getElementById('p-existing-video-url').value = "";
    }
    document.getElementById('edit-mode-alert').style.display = "none";
    document.getElementById('property-payload-form').reset();
    
    const flatWrapper = document.getElementById('flat-type-wrapper');
    if(flatWrapper) flatWrapper.style.display = "none";

    const checkboxes = ["wifi", "ac", "food", "power", "laundry", "gym", "geyser", "fridge", "cctv", "security", "ro", "housekeeping", "parking", "tv", "elevator"];
    checkboxes.forEach(key => {
        const el = document.getElementById(`v-${key}`);
        if(el) el.checked = false;
    });

    const container = document.getElementById('gallery-repeater-root');
    if (container) {
        container.innerHTML = `
            <div class="repeater-box">
                <input type="file" class="gallery-file-field" accept="image/*">
                <button type="button" class="btn-small btn-add" onclick="injectGalleryField()"><i class="fa-solid fa-plus"></i></button>
            </div>
        `;
    }

    document.getElementById('form-main-heading').innerText = "Deploy New Living Asset";
    document.getElementById('submit-btn-text').innerText = "Deploy Asset Node System";
};

window.triggerPropertyDeletion = function(targetKey) {
    if(confirm("🗑️ Permanent action alert! Are you sure you want to delete this property?")) {
        remove(ref(db, `properties/${targetKey}`))
            .then(() => fireNoticeToast("🗑️ Node item wiped out successfully."))
            .catch(() => fireNoticeToast("❌ Deletion rejected."));
    }
};

// Lead Pipeline Inbox Sync Engine
window.synchronizeUnifiedInbox = function() {
    onValue(ref(db, 'inquiries'), (snapshot) => {
        const inboxTerminal = document.getElementById('inbox-cards-terminal');
        if (!inboxTerminal) return;

        const data = snapshot.val() || {};
        let filteredLeads = [];

        Object.keys(data).forEach(key => {
            const item = data[key];
            if (item.vendorId === currentVendorId || localPropertiesCache[item.propertyId]) {
                filteredLeads.push(item);
            }
        });

        if(filteredLeads.length === 0) {
            inboxTerminal.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:40px;">Aapki spaces par koi queries generate nahi hui hain.</div>`;
            return;
        }

        inboxTerminal.innerHTML = "";
        filteredLeads.forEach(lead => {
            const cleanDate = lead.timestamp ? new Date(lead.timestamp).toLocaleString() : 'N/A';
            const msgBody = `Hello ${lead.clientName}, Thank you for your inquiry regarding our listing "${lead.propertyName || 'Property'}". Let's process your booking details.`;
            const waLink = `https://wa.me/91${lead.clientPhone}?text=${encodeURIComponent(msgBody)}`;

            const leadCard = document.createElement('div');
            leadCard.className = 'inbox-card';
            leadCard.innerHTML = `
                <span class="badge-type">Verified Lead</span>
                <h3>${lead.clientName}</h3>
                <div class="inbox-meta">
                    <span><i class="fa-solid fa-phone"></i> +91 ${lead.clientPhone}</span>
                    <span><i class="fa-solid fa-clock"></i> ${cleanDate}</span>
                </div>
                <div style="font-size:13px; font-weight:700; color:var(--olive); margin-bottom:8px;">Target Unit: ${lead.propertyName || 'N/A'}</div>
                <p class="msg-text">"${lead.clientMessage || lead.message || 'No specific remarks written.'}"</p>
                <div class="response-box">
                    <a href="${waLink}" target="_blank" class="btn-whatsapp"><i class="fa-brands fa-whatsapp"></i> Initiate WhatsApp Sync</a>
                </div>
            `;
            inboxTerminal.appendChild(leadCard);
        });
    });
};

// Global Interceptor session handler
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentVendorId = user.uid; 
        console.log("🔒 Access Granted! UID:", currentVendorId);
        fetchLivePropertiesStream();
        window.synchronizeUnifiedInbox();
    } else {
        currentVendorId = null;
        console.warn("🚨 Session mismatched! Redirecting.");
        window.location.href = "vendor-registration.html"; 
    }
});

window.triggerVendorSystemLogout = function() {
    if(confirm("Are you sure you want to log out from the system?")) {
        signOut(auth).then(() => { window.location.href = "vendor-registration.html"; });
    }
};