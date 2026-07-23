import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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
const db = getDatabase(app);

const CLOUDINARY_CLOUD_NAME = "dxt42tn4c"; 
const CLOUDINARY_UPLOAD_PRESET = "sahilkumawat"; 

let localPropertiesCache = {};

const targetNavs = document.querySelectorAll('.sidebar-item, .mobile-nav-item');
const viewPanels = document.querySelectorAll('.panel-view');

targetNavs.forEach(navNode => {
    navNode.addEventListener('click', function() {
        const activeId = this.getAttribute('data-target');
        if (activeId) {
            switchNavigationTabs(activeId);
        }
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

async function processCloudinaryFileUpload(fileObject) {
    if (!fileObject) return null;
    const dataForm = new FormData();
    dataForm.append("file", fileObject);
    dataForm.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    
    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: dataForm
        });
        const parsedJson = await response.json();
        if(parsedJson.secure_url) {
            return parsedJson.secure_url;
        } else {
            console.error("Cloudinary Engine Rejection:", parsedJson);
            return null;
        }
    } catch (err) {
        console.error("Cloudinary Network Error:", err);
        return null;
    }
}

window.injectGalleryField = function(existingUrl = "") {
    const container = document.getElementById('gallery-repeater-root');
    const wrappingBlock = document.createElement('div');
    wrappingBlock.className = 'repeater-box';
    wrappingBlock.innerHTML = `
        <input type="file" class="gallery-file-field" accept="image/*" data-existing="${existingUrl}">
        ${existingUrl ? `<img src="${existingUrl}" class="img-preview-bubble">` : ''}
        <button type="button" class="btn-small btn-remove" onclick="this.parentElement.remove()"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(wrappingBlock);
};

window.fireNoticeToast = function(message) {
    const toast = document.getElementById('center-toast');
    if (!toast) return;
    toast.innerHTML = message;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
};

onValue(ref(db, 'properties'), (snapshot) => {
    const data = snapshot.val() || {};
    localPropertiesCache = data;
    const totalCount = Object.keys(data).length;
    const badgeCount = document.getElementById('sidebar-count');
    if (badgeCount) badgeCount.innerText = totalCount;
});

const propertyPayloadForm = document.getElementById('property-payload-form');
if (propertyPayloadForm) {
    propertyPayloadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = document.getElementById('p-submit-btn');
        const editId = document.getElementById('p-edit-target-id').value;
        
        btn.disabled = true;
        const textElement = document.getElementById('submit-btn-text');
        if (textElement) textElement.innerText = "Processing Assets via Cloudinary...";

        const heroFileField = document.getElementById('p-hero-file').files[0];
        let uploadedHeroUrl = document.getElementById('p-existing-hero-url').value;

        if (heroFileField) {
            const cloudUrl = await processCloudinaryFileUpload(heroFileField);
            if (cloudUrl) {
                uploadedHeroUrl = cloudUrl;
            } else {
                fireNoticeToast("❌ Cover Asset upload crashed on Cloudinary server.");
                btn.disabled = false;
                if (textElement) textElement.innerText = "Deploy Asset Node System";
                return;
            }
        }

        if (!uploadedHeroUrl) {
            fireNoticeToast("⚠️ Primary Spatial Thumbnail File is required.");
            btn.disabled = false;
            if (textElement) textElement.innerText = "Deploy Asset Node System";
            return;
        }

        const imagesCluster = [uploadedHeroUrl];
        const genericFileFields = document.querySelectorAll('.gallery-file-field');
        
        for (let node of genericFileFields) {
            const localizedFile = node.files[0];
            const preExistingUrl = node.getAttribute('data-existing');
            
            if (localizedFile) {
                const dynamicCloudUrl = await processCloudinaryFileUpload(localizedFile);
                if(dynamicCloudUrl) imagesCluster.push(dynamicCloudUrl);
            } else if (preExistingUrl && preExistingUrl.trim() !== "") {
                imagesCluster.push(preExistingUrl);
            }
        }

        const targetCategory = document.getElementById('p-category').value;
        const targetSharing = document.getElementById('p-sharing').value;
        const basePrice = parseFloat(document.getElementById('p-price').value) || 0;
        const rawMrp = parseFloat(document.getElementById('p-mrp').value) || 0;
        const depositAmount = parseFloat(document.getElementById('p-deposit').value) || 0;
        const localArea = document.getElementById('p-area').value.trim();
        const localCity = document.getElementById('p-city').value.trim();
        
        let savedPostedDate = "May 30, 2026";
        if (editId && localPropertiesCache[editId] && localPropertiesCache[editId].postedDate) {
            savedPostedDate = localPropertiesCache[editId].postedDate;
        } else {
            const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
            savedPostedDate = new Date().toLocaleDateString('en-US', dateOptions);
        }

        const amenitiesArray = [];
        if(document.getElementById('v-wifi').checked) amenitiesArray.push("Wifi");
        if(document.getElementById('v-ac').checked) amenitiesArray.push("AC Attached");
        if(document.getElementById('v-food').checked) amenitiesArray.push("Food Included");
        if(document.getElementById('v-gym').checked) amenitiesArray.push("Gym");
        if(document.getElementById('v-power').checked) amenitiesArray.push("Power Backup");
        if(document.getElementById('v-laundry').checked) amenitiesArray.push("Laundry");

        let currentOperationRef;
        let propertyUniqueId;

        if(editId && editId !== "") {
            propertyUniqueId = editId;
            currentOperationRef = ref(db, `properties/${propertyUniqueId}`);
        } else {
            const targetRef = ref(db, 'properties');
            const pushedNode = push(targetRef);
            propertyUniqueId = pushedNode.key;
            currentOperationRef = pushedNode;
        }

        const propertySchemaPayload = {
            id: propertyUniqueId,
            category: targetCategory,
            type: targetCategory,
            name: document.getElementById('p-name').value.trim(),
            title: document.getElementById('p-name').value.trim(),
            description: document.getElementById('p-desc').value.trim(),
            aboutProperty: document.getElementById('p-desc').value.trim(),
            houseRules: document.getElementById('p-rules').value.trim(),
            price: basePrice,
            rent: basePrice,
            currentPrice: basePrice,
            mrp: rawMrp,
            originalPrice: rawMrp,
            deposit: depositAmount,
            badge: document.getElementById('p-badge').value.trim(),
            sharingType: targetSharing,
            furnishing: document.getElementById('p-furnishing').value,
            genderType: document.getElementById('p-gender').value,
            availableFrom: document.getElementById('p-available-from').value.trim(),
            suitableFor: document.getElementById('p-suitable-for').value.trim(),
            
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
            minimumContract: document.getElementById('p-contract').value.trim(),
            earlyLeavingCharges: document.getElementById('p-leaving-charges').value.trim(),
            propertyAge: document.getElementById('p-age').value.trim(),

            location: `${localArea}, ${localCity}`,
            area: localArea,
            city: localCity,
            mapLink: document.getElementById('p-map').value.trim(),
            
            image: uploadedHeroUrl,
            imageUrl: uploadedHeroUrl,
            allImages: imagesCluster,
            
            amenities: amenitiesArray,
            wifi: document.getElementById('v-wifi').checked,
            ac: document.getElementById('v-ac').checked,
            food: document.getElementById('v-food').checked,
            
            postedBy: document.getElementById('p-posted-by').value,
            postedDate: savedPostedDate,
            ownerName: document.getElementById('p-owner-name').value.trim(),
            ownerPhone: document.getElementById('p-owner-phone').value.trim(),
            rating: "4.8",
            reviewsCount: 22
        };

        set(currentOperationRef, propertySchemaPayload)
            .then(() => {
                fireNoticeToast(editId ? "⚡ Property Node Synchronized Completely!" : "🎉 New Living Asset Deployed Successfully Live!");
                terminateFormEditMode();
                if(editId) switchNavigationTabs('properties-panel');
            })
            .catch(err => { console.error(err); fireNoticeToast("❌ Realtime writing process failed."); })
            .finally(() => {
                btn.disabled = false;
                if (textElement) textElement.innerText = "Deploy Asset Node System";
            });
    });
}

window.fetchLivePropertiesStream = function() {
    const terminal = document.getElementById('live-properties-terminal');
    if (!terminal) return;
    
    onValue(ref(db, 'properties'), (snapshot) => {
        const data = snapshot.val();
        if(!data || Object.keys(data).length === 0) {
            terminal.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:40px; grid-column: 1/-1;">No live property data logs inside endpoints.</div>`;
            return;
        }

        terminal.innerHTML = "";
        Object.keys(data).forEach(key => {
            const prop = data[key];
            const card = document.createElement('div');
            card.className = 'prop-preview-card';
            card.innerHTML = `
                <div class="prop-img-box">
                    <img src="${prop.image || prop.imageUrl || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'}" alt="Space thumbnail">
                    ${prop.badge ? `<span class="prop-badge-ui">${prop.badge}</span>` : ''}
                    <span class="prop-cat-ui">${prop.category || 'Unit'}</span>
                    <span class="prop-gender-badge"><i class="fa-solid fa-user-group"></i> ${prop.genderType || 'Both'}</span>
                </div>
                <div class="prop-details-box">
                    <div>
                        <h3 class="prop-title-ui">${prop.name || prop.title || 'Untitled Asset Space'}</h3>
                        <div class="prop-loc-ui"><i class="fa-solid fa-location-dot"></i> ${prop.location || 'Location Sync N/A'}</div>
                        
                        <div class="card-spec-tags">
                            <span class="spec-tag"><i class="fa-solid fa-bed"></i> ${prop.sharingType || 'Bed Setup'}</span>
                            <span class="spec-tag"><i class="fa-solid fa-couch"></i> ${prop.furnishing || 'Furnished'}</span>
                            <span class="spec-tag"><i class="fa-solid fa-calendar-check"></i> From: ${prop.availableFrom || 'Immediate'}</span>
                        </div>

                        <div class="card-info-chips">
                            <div><strong>Config:</strong> ${prop.roomsCount || '1 Room'}, ${prop.bathroomsCount || '1 Bath'}, ${prop.balconiesCount || '0 Balcony'}</div>
                            <div><strong>Deposit:</strong> ₹${prop.deposit || 0}</div>
                            <div style="font-size:11px; color:var(--text-muted); margin-top:3px;">Posted By: ${prop.postedBy || 'Owner'} on ${prop.postedDate || 'May 30, 2026'}</div>
                        </div>
                    </div>
                    <div>
                        <div class="price-flex-row">
                            <div>
                                <span class="price-current">₹${prop.price || prop.rent || 0}/mo</span>
                                ${prop.mrp ? `<span class="price-mrp">₹${prop.mrp}</span>` : ''}
                            </div>
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

window.triggerPropertyFormEdit = function(targetKey) {
    const nodeData = localPropertiesCache[targetKey];
    if(!nodeData) return;

    document.getElementById('p-edit-target-id').value = targetKey;
    document.getElementById('p-existing-hero-url').value = nodeData.image || "";
    
    document.getElementById('form-main-heading').innerText = "Modify Living Asset Node";
    document.getElementById('form-sub-heading').innerText = `Updating live configuration tree blocks for target node ID: ${targetKey}`;
    document.getElementById('edit-mode-indicator').style.display = 'flex';
    
    const textElement = document.getElementById('submit-btn-text');
    if (textElement) textElement.innerText = "Apply Structure Updates Live";

    document.getElementById('p-name').value = nodeData.name || nodeData.title || "";
    document.getElementById('p-category').value = nodeData.category || "pg";
    document.getElementById('p-sharing').value = nodeData.sharingType || "Double Sharing";
    document.getElementById('p-furnishing').value = nodeData.furnishing || "Fully Furnished";
    document.getElementById('p-gender').value = nodeData.genderType || "Both";
    document.getElementById('p-available-from').value = nodeData.availableFrom || "Immediate";
    document.getElementById('p-suitable-for').value = nodeData.suitableFor || "Working Professionals, Students";
    document.getElementById('p-desc').value = nodeData.description || nodeData.aboutProperty || "";
    document.getElementById('p-rules').value = nodeData.houseRules || "";
    
    document.getElementById('p-price').value = nodeData.price || nodeData.rent || "";
    document.getElementById('p-mrp').value = nodeData.mrp || "";
    document.getElementById('p-deposit').value = nodeData.deposit || "";
    document.getElementById('p-badge').value = nodeData.badge || "";
    
    document.getElementById('p-contract').value = nodeData.minimumContract || "6 Months";
    document.getElementById('p-leaving-charges').value = nodeData.earlyLeavingCharges || "1 month(s) of rent";
    document.getElementById('p-age').value = nodeData.propertyAge || "1 to 5 Year Old";

    document.getElementById('p-count-rooms').value = nodeData.roomsCount || "1 Room";
    document.getElementById('p-count-bathrooms').value = nodeData.bathroomsCount || "1 Bathroom";
    document.getElementById('p-count-balconies').value = nodeData.balconiesCount || "2 Balconies";
    document.getElementById('p-type-meta').value = nodeData.propertyTypeMeta || "Studio Apartment";
    
    document.getElementById('p-floor').value = nodeData.floorNumber || "1st of 4 Floors";
    document.getElementById('p-flooring-type').value = nodeData.flooring || "Ceramic";
    document.getElementById('p-parking').value = nodeData.parking || "1 Open";
    document.getElementById('p-power-backup').value = nodeData.powerBackup || "None";
    document.getElementById('p-attached-bathroom').value = nodeData.attachedBathroom || "Yes";
    document.getElementById('p-attached-balcony').value = nodeData.attachedBalcony || "No";

    document.getElementById('p-city').value = nodeData.city || "";
    document.getElementById('p-area').value = nodeData.area || "";
    document.getElementById('p-map').value = nodeData.mapLink || "";
    
    document.getElementById('p-posted-by').value = nodeData.postedBy || "Owner";
    document.getElementById('p-owner-name').value = nodeData.ownerName || "";
    document.getElementById('p-owner-phone').value = nodeData.ownerPhone || "";

    if (nodeData.image) {
        document.getElementById('hero-preview-hook').innerHTML = `<img src="${nodeData.image}" class="img-preview-bubble"> <br><small style="color:var(--text-muted)">Active Cover Asset</small>`;
    }

    const am = nodeData.amenities || [];
    document.getElementById('v-wifi').checked = am.includes("Wifi") || !!nodeData.wifi;
    document.getElementById('v-ac').checked = am.includes("AC Attached") || !!nodeData.ac;
    document.getElementById('v-food').checked = am.includes("Food Included") || !!nodeData.food;
    document.getElementById('v-gym').checked = am.includes("Gym");
    document.getElementById('v-power').checked = am.includes("Power Backup");
    document.getElementById('v-laundry').checked = am.includes("Laundry");

    const dynamicContainer = document.getElementById('gallery-repeater-root');
    dynamicContainer.innerHTML = "";
    if(nodeData.allImages && nodeData.allImages.length > 1) {
        nodeData.allImages.slice(1).forEach(url => {
            injectGalleryField(url);
        });
    }
    if(dynamicContainer.innerHTML === "") injectGalleryField();

    switchNavigationTabs('deployment-panel');
};

window.terminateFormEditMode = function() {
    document.getElementById('p-edit-target-id').value = "";
    document.getElementById('p-existing-hero-url').value = "";
    const previewHook = document.getElementById('hero-preview-hook');
    if (previewHook) previewHook.innerHTML = "";
    
    document.getElementById('form-main-heading').innerText = "Deploy Living Asset Nodes";
    document.getElementById('form-sub-heading').innerText = "Real-time Cloudinary image processing configuration system framework for listed clusters.";
    document.getElementById('edit-mode-indicator').style.display = 'none';
    
    const textElement = document.getElementById('submit-btn-text');
    if (textElement) {
        textElement.innerText = "Deploy Asset Node System";
    }
    
    const formRef = document.getElementById('property-payload-form');
    if (formRef) formRef.reset();
    
    const repeaterRoot = document.getElementById('gallery-repeater-root');
    if (repeaterRoot) {
        repeaterRoot.innerHTML = `
            <div class="repeater-box">
                <input type="file" class="gallery-file-field" accept="image/*">
                <button type="button" class="btn-small btn-add" onclick="injectGalleryField()"><i class="fa-solid fa-plus"></i></button>
            </div>
        `;
    }
};

window.triggerPropertyDeletion = function(targetKey) {
    const confirmation = confirm("⚠️ CRITICAL ACTION:\n\nAre you absolutely sure you want to delete this property live from the database?");
    if(!confirmation) return;

    remove(ref(db, `properties/${targetKey}`))
        .then(() => fireNoticeToast("🗑️ Record deleted successfully!"))
        .catch(() => fireNoticeToast("❌ Deletion process failed."));
};

const globalInquiriesTracker = ref(db, 'inquiries');
const roomInquiriesTracker = ref(db, 'room_inquiries');

function synchronizeUnifiedInbox() {
    onValue(globalInquiriesTracker, (snapshot) => {
        const normalData = snapshot.val();
        onValue(roomInquiriesTracker, (roomSnapshot) => {
            const roomData = roomSnapshot.val();
            let compiledInquiries = [];

            if(normalData) {
                Object.keys(normalData).forEach(key => {
                    compiledInquiries.push({ ...normalData[key], originType: 'PG / Shared Hub' });
                });
            }
            if(roomData) {
                Object.keys(roomData).forEach(key => {
                    compiledInquiries.push({
                        ...roomData[key],
                        originType: 'Independent Room Unit',
                        propertyName: roomData[key].roomName,
                        propertyLocation: roomData[key].roomLocation
                    });
                });
            }

            compiledInquiries.sort((x, y) => new Date(y.timestamp) - new Date(x.timestamp));
            renderInboxCards(compiledInquiries);
        });
    });
}

function renderInboxCards(inquiriesList) {
    const inboxTerminal = document.getElementById('inbox-cards-terminal');
    if(!inboxTerminal) return;

    if(inquiriesList.length === 0) {
        inboxTerminal.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:40px;">No leads captured inside logs.</div>`;
        return;
    }

    inboxTerminal.innerHTML = "";
    inquiriesList.forEach(item => {
        const cleanDate = item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A';
        const textMessage = `Hello ${item.clientName}, Thank you for your interest in *${item.propertyName || 'Property'}* listed with StayPremium. Let us know how we can proceed with your onboarding.`;
        const encodedWhatsAppURI = `https://wa.me/91${item.clientPhone}?text=${encodeURIComponent(textMessage)}`;

        const cardBlock = document.createElement('div');
        cardBlock.className = 'inbox-card';
        cardBlock.innerHTML = `
            <span class="badge-type">${item.originType}</span>
            <h3 style="font-size:16px; font-weight:700; max-width:80%; margin-bottom:4px;">${item.clientName}</h3>
            <div class="inbox-meta">
                <span><i class="fa-solid fa-phone"></i> +91 ${item.clientPhone}</span>
                <span><i class="fa-solid fa-envelope"></i> ${item.userEmail || 'No Email'}</span>
                <span><i class="fa-solid fa-clock"></i> ${cleanDate}</span>
            </div>
            <div style="font-size:13px; font-weight:600; color:var(--olive); margin-top:8px;">
                <i class="fa-solid fa-building"></i> Target Space: ${item.propertyName || 'N/A'} (${item.propertyLocation || 'N/A'})
            </div>
            <div class="msg-text">
                <strong>Client Remark:</strong> "${item.message || 'No structural remarks added.'}"
            </div>
            <div class="response-box">
                <a href="${encodedWhatsAppURI}" target="_blank" class="btn-whatsapp">
                    <i class="fa-brands fa-whatsapp"></i> Chat via WhatsApp
                </a>
            </div>
        `;
        inboxTerminal.appendChild(cardBlock);
    });
}

synchronizeUnifiedInbox();

window.deployBannerMatrixNode = async function() {
    const bannerFile = document.getElementById('b-img-file').files[0];
    if(!bannerFile) { fireNoticeToast("⚠️ Banner local image file selection required."); return; }

    const bBtn = document.getElementById('b-submit-btn');
    bBtn.disabled = true;
    bBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading Image to Cloudinary...`;

    const cloudBannerUrl = await processCloudinaryFileUpload(bannerFile);
    if(!cloudBannerUrl) {
        fireNoticeToast("❌ Upload crashed on Cloudinary server.");
        bBtn.disabled = false;
        bBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Synchronize Banner Sequence`;
        return;
    }

    const targetNode = ref(db, 'banners');
    const bannerPushNode = push(targetNode);

    const bannerPayload = {
        id: bannerPushNode.key,
        image: cloudBannerUrl,
        title: document.getElementById('b-title').value.trim() || "Stay100%Coliving Spaces",
        subtitle: document.getElementById('b-subtitle').value.trim() || "Verified 100% Spaces",
        link: document.getElementById('b-link').value.trim() || "#"
    };

    set(bannerPushNode, bannerPayload)
        .then(() => {
            fireNoticeToast("⚡ Cloudinary Slider Element Synced Successfully!");
            document.getElementById('b-img-file').value = "";
            document.getElementById('b-title').value = "";
            document.getElementById('b-subtitle').value = "";
            document.getElementById('b-link').value = "";
        })
        .catch(() => fireNoticeToast("❌ Database write failure."))
        .finally(() => {
            bBtn.disabled = false;
            bBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Synchronize Banner Sequence`;
        });
};