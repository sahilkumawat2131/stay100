/**
 * StayPremium - Premium User Profile System Lifecycle (Modularized Component Engine)
 * Synchronized with unified storage mapping layout pointers.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// --- FIREBASE CONFIGURATION ---
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

document.addEventListener('DOMContentLoaded', () => {

    // Harmonized storage keys pointing cleanly to staypremium authentication state inputs[cite: 1]
    const currentSessionUID = localStorage.getItem('staypremium_uid') || localStorage.getItem('stay100_uid'); 
    const sessionName = localStorage.getItem('staypremium_name') || localStorage.getItem('stay100_name');
    const sessionEmail = localStorage.getItem('staypremium_email') || localStorage.getItem('stay100_email'); 
    const sessionPhone = localStorage.getItem('staypremium_phone') || localStorage.getItem('stay100_phone');

    // --- 1. AUTH RECOVERY & AUTO FILL ENGINE ---
    function handleProfileAutoFillEngine() {
        if (!currentSessionUID) {
            alert("Session expired or user not logged in. Redirecting to login...");
            window.location.href = 'login.html';
            return;
        }

        const idNode = document.getElementById('display-user-id');
        const nameNode = document.getElementById('display-user-name');
        const emailNode = document.getElementById('display-user-email');
        const phoneNode = document.getElementById('display-user-phone');

        if (idNode) idNode.innerText = currentSessionUID;
        if (nameNode) nameNode.innerText = sessionName || "StayPremium Resident";
        if (emailNode) emailNode.innerText = (sessionEmail && sessionEmail !== 'N/A') ? sessionEmail : "No Email Linked";
        if (phoneNode) phoneNode.innerText = (sessionPhone && sessionPhone !== 'N/A') ? sessionPhone : "No Phone Linked";
    }

    handleProfileAutoFillEngine();

    // --- 2. SMOOTH INTERACTIVE INTERFACE TABS NAVIGATION ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            button.classList.add('active');
            const targetPanelId = button.dataset.target;
            const targetPanel = document.getElementById(targetPanelId);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });

    // --- 3. RETRIEVE USER INQUIRIES ---
    const inquiriesContainer = document.getElementById('inquiries-list-container');
    const inquiriesNodeRef = ref(db, 'inquiries');

    onValue(inquiriesNodeRef, (snapshot) => {
        if (!inquiriesContainer) return;
        inquiriesContainer.innerHTML = '';

        const data = snapshot.val();
        if (data) {
            // Evaluates standard structural variations across dynamic inquiry contexts
            const recordsList = Object.values(data).filter(item => 
                item && (item.userId === currentSessionUID || 
                item.userUid === currentSessionUID || 
                item.uid === currentSessionUID)
            );
            
            if (recordsList.length > 0) {
                recordsList.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

                inquiriesContainer.innerHTML = recordsList.map(item => {
                    const formattedDate = item.timestamp ? new Date(item.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                    }) : (item.date || 'Just Now');

                    const isVerifiedInquiry = item.verified === true || item.isVerified === true;

                    return `
                        <div class="item-card" style="display: flex; flex-direction: column; gap: 12px; text-align: left;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%; gap: 16px;">
                                <div class="item-info-left">
                                    <h4 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 600; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                                        ${item.propertyName || 'Premium Space Inquiry'}
                                    </h4>
                                    <p style="margin: 0; font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 6px;">
                                        <i class="fa-solid fa-clock"></i> Sent: ${formattedDate}
                                    </p>
                                </div>
                                <div style="display: flex; gap: 6px; align-items: center;">
                                    ${isVerifiedInquiry ? `<div class="status-indicator verified" style="background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;"><i class="fa-solid fa-circle-check"></i> Verified</div>` : ''}
                                    <div class="status-indicator pending">Processing</div>
                                </div>
                            </div>
                            ${item.message ? `
                                <div style="background: #f8fafc; padding: 12px 16px; border-radius: 10px; border-left: 3px solid var(--brand-accent); margin-top: 4px;">
                                    <p style="margin: 0; font-size: 13px; color: #475569; font-style: italic; line-height: 1.5;">"${item.message}"</p>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('');
            } else {
                inquiriesContainer.innerHTML = `<div class="panel-loader" style="color: #64748b;">No active inquiries submitted by you yet.</div>`;
            }
        } else {
            inquiriesContainer.innerHTML = `<div class="panel-loader" style="color: #64748b;">No active inquiries submitted yet.</div>`;
        }
    });

    // --- 4. RETRIEVE USER SAVED PROPERTIES ---
    const savedContainer = document.getElementById('saved-list-container');
    const userSavedRef = ref(db, `users_saved/${currentSessionUID}`);

    onValue(userSavedRef, (snapshot) => {
        if (!savedContainer) return;
        savedContainer.innerHTML = '';

        const data = snapshot.val();
        if (data) {
            const savedItems = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            savedContainer.className = "listings-grid"; 

            savedContainer.innerHTML = savedItems.map(item => {
                const originalPrice = item.mrp || item.originalPrice || 0;
                const currentPrice = item.price || item.currentPrice || item.rent || 0;

                let displayBadgeHTML = '';
                if (item.badge) {
                    displayBadgeHTML = `<div class="discount-badge" style="position: absolute; top: 12px; left: 12px; background: var(--brand-accent); color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">${item.badge}</div>`;
                } else if (item.verified === true || item.isVerified === true) {
                    displayBadgeHTML = `<div class="verified-badge" style="position: absolute; top: 12px; left: 12px; background: #0ea5e9; color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 4px;"><i class="fa-solid fa-circle-check"></i> Verified</div>`;
                }

                return `
                    <article class="room-card target-profile-card" data-id="${item.id}" style="text-align: left; background: var(--surface-card); border-radius: 16px; overflow: hidden; border: 1px solid var(--border-token); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                        <div class="card-image-box" style="position: relative; height: 170px; background: #cbd5e1;">
                            <img src="${item.image || item.imageUrl || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'}" alt="${item.name || item.title}" style="width:100%; height:100%; object-fit:cover;">
                            ${displayBadgeHTML}
                        </div>
                        <div class="card-content" style="padding: 16px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
                            <div>
                                <div class="price-row" style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                                    ${originalPrice ? `<span class="original-price" style="text-decoration: line-through; color: var(--text-muted); font-size: 13px;">₹${originalPrice.toLocaleString('en-IN')}</span>` : ''}
                                    <span class="current-price" style="font-size: 17px; font-weight: 700; color: var(--text-main);">₹${currentPrice.toLocaleString('en-IN')}/mo</span>
                                </div>
                                <h3 class="room-title" style="font-size: 15px; font-weight: 600; margin: 0 0 6px 0; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name || item.title}</h3>
                                <div class="location-info" style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted);">
                                    <i class="fa-solid fa-location-dot" style="color: var(--brand-accent);"></i>
                                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.location || 'Premium Area'}</span>
                                </div>
                            </div>
                            <div class="card-actions" style="display: flex; gap: 8px; margin-top: auto;">
                                <button class="btn-view-space" data-id="${item.id}" style="flex: 2; padding: 10px; background: var(--brand-accent); border: none; color: white; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; transition: var(--transition-smooth);">View Space</button>
                                <button class="btn-share-space" data-id="${item.id}" data-name="${item.name || item.title}" style="flex: 1; padding: 10px; background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; border-radius: 8px; cursor: pointer;" title="Share Space"><i class="fa-solid fa-share-nodes"></i></button>
                                <button class="btn-remove-bookmark" data-id="${item.id}" style="flex: 1; padding: 10px; background: #fee2e2; border: 1px solid #fecaca; color: #ef4444; border-radius: 8px; cursor: pointer;" title="Remove Bookmark"><i class="fa-solid fa-trash-can"></i></button>
                            </div>
                        </div>
                    </article>
                `;
            }).join('');

            bindSavedCardInteractiveActions();

        } else {
            savedContainer.className = "panel-list-grid";
            savedContainer.innerHTML = `<div class="panel-loader" style="color: #64748b;">Your premium bookmarks vault is empty.</div>`;
        }
    });

    // --- 5. INTERACTIVE ACTIONS BINDING MAP ---
    function bindSavedCardInteractiveActions() {
        document.querySelectorAll('.btn-view-space').forEach(btn => {
            btn.onclick = () => { window.location.href = `details.html?id=${btn.dataset.id}`; };
        });

        document.querySelectorAll('.btn-share-space').forEach(btn => {
            btn.onclick = () => {
                const targetUrl = `${window.location.origin}/details.html?id=${btn.dataset.id}`;
                if (navigator.share) {
                    navigator.share({
                        title: btn.dataset.name,
                        text: `Check out this premium space verified on Stay100!`,
                        url: targetUrl
                    }).catch(e => console.error(e));
                } else {
                    navigator.clipboard.writeText(targetUrl).then(() => {
                        alert("🔗 Link copied to clipboard via profile dashboard context!");
                    });
                }
            };
        });

        document.querySelectorAll('.btn-remove-bookmark').forEach(btn => {
            btn.onclick = () => {
                const targetId = btn.dataset.id;
                if(confirm("Remove this property from your saved bookmarks vault?")) {
                    const specificNodeRef = ref(db, `users_saved/${currentSessionUID}/${targetId}`);
                    remove(specificNodeRef).then(() => {
                        try {
                            let localList = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || JSON.parse(localStorage.getItem('stay100_saved_properties')) || [];
                            localList = localList.filter(id => id !== targetId);
                            localStorage.setItem('staypremium_saved_properties', JSON.stringify(localList));
                            localStorage.setItem('stay100_saved_properties', JSON.stringify(localList));
                        } catch(err) { console.error(err); }
                    });
                }
            };
        });
    }

    // --- 6. SECURE LOGOUT PIPELINE ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to log out?")) {
                // Clear state tracking parameters cleanly[cite: 1]
                localStorage.removeItem('staypremium_uid');
                localStorage.removeItem('staypremium_name');
                localStorage.removeItem('staypremium_phone');
                localStorage.removeItem('staypremium_email');
                localStorage.removeItem('staypremium_saved_properties');

                localStorage.removeItem('stay100_uid');
                localStorage.removeItem('stay100_name');
                localStorage.removeItem('stay100_phone');
                localStorage.removeItem('stay100_email');
                localStorage.removeItem('stay100_saved_properties');
                
                // Remove specific vendor plans cache if allocated[cite: 1]
                if (currentSessionUID) {
                    localStorage.removeItem(`stay100_plan_${currentSessionUID}`);
                    localStorage.removeItem(`stay100_start_${currentSessionUID}`);
                }

                window.location.href = 'login.html';
            }
        });
    }
});