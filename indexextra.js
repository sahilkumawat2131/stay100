document.addEventListener("DOMContentLoaded", () => {
    // --- POPUP SYSTEM ---
    const popup = document.createElement('div');
    popup.className = 'property-popup-bubble';
    popup.innerHTML = `
        <div class="popup-message-content">
            <div class="popup-avatar">
                <img src="assets/dp.png" alt="Stay100% Logo Ecosystem Support Avatar">
            </div>
            <div class="popup-bubble-text">
                <p>Hey! Want to grow your business?</p>
                <a href="vendor-registration.html" class="popup-action-btn">
                    List Your Property <span class="popup-free-badge">FREE</span>
                </a>
            </div>
            <button class="popup-close-x" onclick="this.parentElement.parentElement.classList.remove('show')" aria-label="Dismiss Popup Dialog">&times;</button>
        </div>
    `;
    document.body.appendChild(popup);

    function triggerPopup() {
        popup.classList.add('show');
        setTimeout(() => {
            popup.classList.remove('show');
        }, 6000); 
    }
    setTimeout(triggerPopup, 15000);
    setInterval(triggerPopup, 15000);

    // --- FOOTER INTERACTION LOGIC ---
    const toggleBtn = document.getElementById('btn-global-footer-toggle');
    const coreFooter = document.getElementById('staypremium-core-footer');
    const toggleIcon = document.getElementById('toggle-icon');
    const toggleText = document.getElementById('toggle-text');

    if (toggleBtn && coreFooter) {
        toggleBtn.addEventListener('click', () => {
            if (coreFooter.style.display === 'none' || coreFooter.style.display === '') {
                coreFooter.style.display = 'block';
                setTimeout(() => { coreFooter.style.opacity = '1'; }, 10);
                toggleIcon.style.transform = 'rotate(180deg)';
                toggleText.textContent = 'Hide Full Directory';
            } else {
                coreFooter.style.opacity = '0';
                setTimeout(() => { coreFooter.style.display = 'none'; }, 300);
                toggleIcon.style.transform = 'rotate(0deg)';
                toggleText.textContent = 'Show Full Directory';
            }
        });
    }

    // --- SEO TABS TOGGLE SYSTEM ---
    const tabTriggers = document.querySelectorAll('.seo-tab-trigger');
    const tabPanels = document.querySelectorAll('.seo-tab-panel');

    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            tabTriggers.forEach(t => t.classList.remove('active-tab'));
            tabPanels.forEach(p => p.classList.remove('active-panel'));

            trigger.classList.add('active-tab');
            const targetId = trigger.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active-panel');
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 1. SYSTEM DIALOG / FRAUD ALERT POPUP LOGIC
    // ==========================================
    const alertModal = document.getElementById("fraud-alert-modal");
    const closeAlertBtn = document.getElementById("close-alert-btn");

    if (sessionStorage.getItem("fraudAlertDismissed") === "true") {
        alertModal.style.setProperty("display", "none", "important");
    } else {
        alertModal.style.setProperty("display", "flex", "important");
    }

    closeAlertBtn.addEventListener("click", function () {
        alertModal.style.setProperty("display", "none", "important");
        sessionStorage.setItem("fraudAlertDismissed", "true");
    });


    // ==========================================
    // 2. LIVE LOCATION SEARCH SYSTEM WITH HEADING UPGRADE
    // ==========================================
    const locationBtn = document.getElementById("location-search-btn");
    const searchInput = document.getElementById("search-input");
    const listingsHeading = document.getElementById("listings-heading");

    locationBtn.addEventListener("click", function () {
        if (navigator.geolocation) {
            searchInput.value = "";
            searchInput.placeholder = "Fetching your live location...";
            
            navigator.geolocation.getCurrentPosition(
                async function (position) {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const addressData = await response.json();
                        
                        if (addressData && addressData.display_name) {
                            const locationText = addressData.address.suburb || 
                                                 addressData.address.neighbourhood || 
                                                 addressData.address.city_district || 
                                                 addressData.address.city || 
                                                 addressData.display_name;

                            searchInput.value = locationText;
                            searchInput.placeholder = "Search by area, location or PG name...";
                            
                            // --- DYNAMIC HEADING UPDATE ON GPS SUCCESS ---
                            if (listingsHeading) {
                                listingsHeading.innerHTML = `Results for Near Me: "<span style="color: #800020;">${locationText}</span>"`;
                            }
                            
                            // Dispatch an input event to automatically trigger the filter processing logic in index.js
                            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                            
                        } else {
                            const fallbackCoords = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                            searchInput.value = fallbackCoords;
                            
                            if (listingsHeading) {
                                listingsHeading.innerHTML = `Results for GPS Coordinates: "<span style="color: #800020;">${fallbackCoords}</span>"`;
                            }
                            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    } catch (apiError) {
                        console.error("Geocoding failed:", apiError);
                        const fallbackCoords = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                        searchInput.value = fallbackCoords;
                        
                        if (listingsHeading) {
                            listingsHeading.innerHTML = `Results for GPS Coordinates: "<span style="color: #800020;">${fallbackCoords}</span>"`;
                        }
                        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                },
                function (locationError) {
                    searchInput.placeholder = "Search by area, location or PG name...";
                    if (locationError.code === locationError.PERMISSION_DENIED) {
                        alert("Location access denied. Please enable location permissions or type manually.");
                    } else {
                        alert("Unable to retrieve location. Please type manually.");
                    }
                },
                { enableHighAccuracy: true, timeout: 8000 }
            );
        } else {
            alert("Your browser does not support live location services.");
        }
    });
});