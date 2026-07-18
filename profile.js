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

// --- CUSTOM SYSTEM NOTIFICATIONS ENGINE ---

// 1. Center Notification Toast
function showCenterToast(message, isSuccess = true) {
    const activeToast = document.getElementById('profile-system-toast');
    if (activeToast) activeToast.remove();

    const container = document.createElement('div');
    container.id = 'profile-system-toast';
    container.innerHTML = `
        <div style="
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            background: ${isSuccess ? '#1e293b' : '#800020'}; color: #ffffff; padding: 16px 32px;
            border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); font-family: sans-serif;
            font-size: 15px; font-weight: 600; z-index: 100000; display: flex; align-items: center; gap: 12px;
            opacity: 0; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        ">
            <i class="fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-circle-xmark'}" style="color: ${isSuccess ? '#38bdf8' : '#fda4af'}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(container);
    const inner = container.querySelector('div');

    setTimeout(() => {
        inner.style.opacity = '1';
        inner.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 50);

    setTimeout(() => {
        inner.style.opacity = '0';
        inner.style.transform = 'translate(-50%, -50%) scale(0.95)';
        setTimeout(() => container.remove(), 250);
    }, 2500);
}

// 2. Center Confirmation Modal Container
function showCenterConfirmModal(title, message, onConfirm) {
    const activeModal = document.getElementById('profile-confirm-modal');
    if (activeModal) activeModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'profile-confirm-modal';
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center;
        z-index: 99999; opacity: 0; transition: opacity 0.2s ease;
    `;

    overlay.innerHTML = `
        <div style="
            background: #ffffff; padding: 28px; border-radius: 16px;
            width: 90%; max-width: 400px; text-align: center;
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
            transform: scale(0.9); transition: transform 0.2s ease;
            font-family: 'Plus Jakarta Sans', sans-serif;
        ">
            <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #0f172a; font-weight: 700;">${title}</h3>
            <p style="margin: 0 0 24px 0; font-size: 14px; color: #64748b; line-height: 1.5;">${message}</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="modal-cancel-btn" style="flex: 1; padding: 10px 16px; background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px;">Cancel</button>
                <button id="modal-confirm-btn" style="flex: 1; padding: 10px 16px; background: #ef4444; border: none; color: #ffffff; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px;">Log Out</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    const box = overlay.querySelector('div');

    setTimeout(() => {
        overlay.style.opacity = '1';
        box.style.transform = 'scale(1)';
    }, 50);

    const closeModal = () => {
        overlay.style.opacity = '0';
        box.style.transform = 'scale(0.9)';
        setTimeout(() => overlay.remove(), 200);
    };

    overlay.querySelector('#modal-cancel-btn').onclick = closeModal;
    overlay.querySelector('#modal-confirm-btn').onclick = () => {
        closeModal();
        onConfirm();
    };
}


document.addEventListener('DOMContentLoaded', () => {

    // Harmonized storage keys pointing cleanly to staypremium authentication state inputs
    const currentSessionUID = localStorage.getItem('staypremium_uid') || localStorage.getItem('stay100_uid'); 
    const sessionName = localStorage.getItem('staypremium_name') || localStorage.getItem('stay100_name');
    const sessionEmail = localStorage.getItem('staypremium_email') || localStorage.getItem('stay100_email'); 
    const sessionPhone = localStorage.getItem('staypremium_phone') || localStorage.getItem('stay100_phone');

    // --- 1. AUTH RECOVERY & AUTO FILL ENGINE ---
    function handleProfileAutoFillEngine() {
        if (!currentSessionUID) {
            showCenterToast("Session expired. Redirecting to login...", false);
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
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
                        showCenterToast("🔗 Link copied to clipboard!", true);
                    });
                }
            };
        });

        document.querySelectorAll('.btn-remove-bookmark').forEach(btn => {
            btn.onclick = () => {
                const targetId = btn.dataset.id;
                
                showCenterConfirmModal(
                    "Remove Bookmark?",
                    "Are you sure you want to remove this property from your saved bookmarks vault?",
                    () => {
                        const specificNodeRef = ref(db, `users_saved/${currentSessionUID}/${targetId}`);
                        remove(specificNodeRef).then(() => {
                            try {
                                let localList = JSON.parse(localStorage.getItem('staypremium_saved_properties')) || JSON.parse(localStorage.getItem('stay100_saved_properties')) || [];
                                localList = localList.filter(id => id !== targetId);
                                localStorage.setItem('staypremium_saved_properties', JSON.stringify(localList));
                                localStorage.setItem('stay100_saved_properties', JSON.stringify(localList));
                                showCenterToast("Bookmark removed successfully.", true);
                            } catch(err) { console.error(err); }
                        });
                    }
                );
            };
        });
    }

    // --- 6. SECURE LOGOUT PIPELINE ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            showCenterConfirmModal(
                "Confirm Logout", 
                "Are you sure you want to log out of your session?", 
                () => {
                    // Clear state tracking parameters cleanly
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
                    
                    // Remove specific vendor plans cache if allocated
                    if (currentSessionUID) {
                        localStorage.removeItem(`stay100_plan_${currentSessionUID}`);
                        localStorage.removeItem(`stay100_start_${currentSessionUID}`);
                    }

                    showCenterToast("Session terminated. Reverting entry profile...", true);

                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                }
            );
        });
    }
});