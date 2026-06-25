/**
 * StayPremium - Premium UI Layout Component Engine (Next-Gen Edition)
 * File Name: header.js (Re-engineered Production Build with Ultra-Smooth City Dropdown)
 * Added "All Cities" capability for global filtering.
 */

// --- 1. CORE COMPONENT STYLING (Optimized CSS Injector) ---
const injectGlobalStyles = () => {
    if (document.getElementById('staypremium-core-styles')) return;

    const styleElement = document.createElement('style');
    styleElement.id = 'staypremium-core-styles';
    styleElement.textContent = `
        :root {
            --brand-olive: #556b2f;
            --brand-mehrum: #800020;
            --dark-charcoal: #111827;
            --muted-slate: #4b5563;
            --pure-white: #ffffff;
            --bg-glass: rgba(255, 255, 255, 0.85);
            --smooth-bezier: cubic-bezier(0.4, 0, 0.2, 1);
            --premium-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
            --shadow-sm: 0 2px 8px rgba(0,0,0,0.04);
            --shadow-md: 0 10px 30px rgba(0,0,0,0.08);
            --shadow-premium: 0 20px 40px rgba(0, 0, 0, 0.12);
        }

        /* Desktop Header Core Architecture */
        .desktop-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: var(--brand-olive);
            padding: 14px 6%;
            position: sticky;
            top: 0;
            z-index: 2000;
            box-shadow: var(--shadow-md);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            transition: all 0.3s var(--smooth-bezier);
        }

        .header-left-zone {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .desktop-header .logo-link {
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: transform 0.2s var(--smooth-bezier);
        }
        
        .desktop-header .logo-link:hover {
            transform: scale(1.02);
        }

        .desktop-header .logo-text {
            color: var(--pure-white);
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.75px;
            font-family: 'Poppins', sans-serif;
        }

        /* Premium City Picker Button */
        .city-picker-trigger {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 6px 14px;
            border-radius: 50px;
            color: var(--pure-white);
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.25s var(--premium-bounce);
        }

        .city-picker-trigger:hover {
            background: rgba(255, 255, 255, 0.22);
            border-color: rgba(255, 255, 255, 0.4);
            transform: translateY(-1px);
        }

        .city-picker-trigger i.fa-chevron-down {
            font-size: 10px;
            transition: transform 0.3s var(--premium-bounce);
        }

        /* Central Navigation Menu */
        .desktop-header .header-center {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .desktop-header .header-center a {
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            padding: 8px 16px;
            font-weight: 600;
            font-size: 14px;
            letter-spacing: 0.25px;
            border-radius: 6px;
            position: relative;
            transition: all 0.25s var(--smooth-bezier);
        }

        /* Smart Underline & Glow Indicator */
        .desktop-header .header-center a::after {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 16px;
            right: 16px;
            height: 3px;
            background-color: var(--pure-white);
            transform: scaleX(0);
            transform-origin: right;
            transition: transform 0.3s var(--smooth-bezier);
            border-radius: 4px;
        }

        .desktop-header .header-center a:hover {
            color: var(--pure-white);
            background-color: rgba(255, 255, 255, 0.1);
        }

        .desktop-header .header-center a.active {
            color: var(--pure-white);
            font-weight: 700;
        }

        .desktop-header .header-center a:hover::after,
        .desktop-header .header-center a.active::after {
            transform: scaleX(1);
            transform-origin: left;
        }

        /* --- PREMIUM CITY SELECTOR OVERLAY DROP-DOWN --- */
        .city-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .city-modal-overlay.open {
            opacity: 1;
            pointer-events: auto;
        }

        .city-modal-card {
            background: var(--pure-white);
            width: 95%;
            max-width: 680px;
            border-radius: 20px;
            box-shadow: var(--shadow-premium);
            overflow: hidden;
            transform: scale(0.92) translateY(15px);
            opacity: 0;
            transition: transform 0.4s var(--premium-bounce), opacity 0.3s ease;
        }

        .city-modal-overlay.open .city-modal-card {
            transform: scale(1) translateY(0);
            opacity: 1;
        }

        .city-modal-header {
            padding: 20px 28px;
            background: linear-gradient(135deg, var(--brand-olive), #6b8e23);
            color: var(--pure-white);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .city-modal-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 700;
        }

        .city-modal-close {
            background: rgba(255, 255, 255, 0.15);
            border: none;
            color: var(--pure-white);
            font-size: 16px;
            cursor: pointer;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
        }

        .city-modal-close:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: rotate(90deg);
        }

        .city-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
            gap: 14px;
            padding: 28px;
            max-height: 380px;
            overflow-y: auto;
        }

        .city-card-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 14px 8px;
            border: 1.5px solid #f1f5f9;
            border-radius: 14px;
            cursor: pointer;
            transition: all 0.25s var(--premium-bounce);
            text-align: center;
            background: #ffffff;
        }

        .city-card-item:hover {
            border-color: var(--brand-olive);
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(85, 107, 47, 0.08);
        }

        .city-card-item.selected {
            border-color: var(--brand-mehrum);
            background: rgba(128, 0, 32, 0.03);
            box-shadow: 0 0 0 1px var(--brand-mehrum);
        }

        .city-icon-frame {
            font-size: 28px;
            margin-bottom: 8px;
            transition: transform 0.3s var(--premium-bounce);
        }

        .city-card-item:hover .city-icon-frame {
            transform: scale(1.15);
        }

        .city-name-lbl {
            font-size: 13px;
            font-weight: 700;
            color: var(--dark-charcoal);
        }

        /* Profile DP Action Engine */
        .profile-wrapper {
            position: relative;
            display: inline-block;
        }

        .profile-dp-link {
            text-decoration: none;
            display: block;
            border-radius: 50%;
            padding: 2px;
            background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,1));
            transition: transform 0.3s var(--smooth-bezier);
        }

        .profile-dp-link:hover {
            transform: rotate(5deg) scale(1.05);
        }

        .profile-dp-link img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            display: block;
            background-color: #f3f4f6;
        }

        /* Mobile Responsive Bottom Sheet Nav */
        .mobile-bottom-nav {
            display: none;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: var(--pure-white);
            box-shadow: 0 -4px 24px rgba(0,0,0,0.06);
            justify-content: space-around;
            align-items: center;
            padding: 8px 0 calc(8px + env(safe-area-inset-bottom, 0px));
            z-index: 2500;
            border-top: 1px solid #f3f4f6;
        }

        .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            color: var(--muted-slate);
            font-size: 11px;
            font-weight: 600;
            width: 64px;
            height: 48px;
            border-radius: 8px;
            gap: 4px;
            transition: all 0.25s var(--smooth-bezier);
        }

        .nav-item i {
            font-size: 20px;
            transition: transform 0.25s var(--smooth-bezier);
        }

        .nav-item:active {
            transform: scale(0.92);
        }

        .nav-item.active {
            color: var(--brand-mehrum);
            background-color: rgba(128, 0, 32, 0.05);
        }
        
        .nav-item.active i {
            transform: translateY(-2px) scale(1.05);
        }

        /* --- MOBILE UPGRADE MATRIX (CLEANED & ALIGNED) --- */
        @media (max-width: 768px) {
            .desktop-header {
                padding: 16px 12px 12px 12px; /* Uniform standard space Allocation */
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .header-left-zone {
                gap: 0px; /* Purani automatic gap reset kari */
                flex-grow: 1;
                display: flex;
                align-items: center;
                justify-content: space-between; /* Space balanced distribution */
            }

            /* 1. Logo Position Adjustments (Thoda Left aur Niche) */
            .desktop-header .logo-link {
                margin-left: -6px;  /* Bilkul safe left edge positioning */
                margin-top: 6px;    /* Top bar border se thoda niche adjustment */
            }

            /* 2. City Selector Adjustments (Thoda Right aur Niche) */
            .city-picker-trigger {
                padding: 6px 12px;   /* Clean touch target proportions */
                font-size: 12px;
                margin-right: 14px;  /* Profile Avatar icon se perfectly safe right-gap */
                margin-top: 6px;     /* Logo ke parallel center line par niche align karne ke liye */
            }

            .desktop-header .header-center {
                display: none;
            }

            .mobile-bottom-nav {
                display: flex;
            }

            body {
                padding-bottom: 64px;
            }

            .city-modal-card {
                position: fixed;
                bottom: 0;
                border-radius: 20px 20px 0 0;
                width: 100%;
                transform: translateY(100%);
                transition: transform 0.4s cubic-bezier(0.32, 0.94, 0.6, 1);
            }

            .city-modal-overlay.open .city-modal-card {
                transform: translateY(0);
            }

            .city-grid {
                grid-template-columns: repeat(3, 1fr);
                padding: 20px;
            }
        }
    `;
    document.head.appendChild(styleElement);
};

// --- 2. LAYOUT ENGINE SYSTEM CONTROLLER ---
class LayoutEngine {
    constructor() {
        this.currentActivePage = "home";
        this.hasBooted = false;

        this.availableCities = [
            { id: "all", name: "All Cities", icon: "🌍" },
            { id: "jaipur", name: "Jaipur", icon: "🏛️" }, 
            { id: "delhi", name: "Delhi", icon: "🕌" }, 
            { id: "gurugram", name: "Gurugram", icon: "🏢" },
            { id: "udaipur", name: "Udaipur", icon: "🏰" },
            { id: "mumbai", name: "Mumbai", icon: "⚓" }, 
            { id: "pune", name: "Pune", icon: "⛰️" },
            { id: "bengluru", name: "Bengaluru", icon: "💻" },
            { id: "hydrabad", name: "Hyderabad", icon: "💎" },
            { id: "lucknow", name: "Lucknow", icon: "🕌" },
            { id: "noida", name: "Noida", icon: "🎛️" },
            { id: "mohali", name: "Mohali", icon: "🏏" },
            { id: "chandigarh", name: "Chandigarh", icon: "🧱" },
            { id: "kolkata", name: "Kolkata", icon: "🌉" },
            { id: "chennai", name: "Chennai", icon: "🌊" }
        ];

        this.selectedCity = localStorage.getItem('staypremium_selected_city') || "all";
        injectGlobalStyles();
    }

    init(explicitContext = null) {
        if (this.hasBooted && !explicitContext) return;

        this.evaluateRoutingContext(explicitContext);
        this.renderHeaderDOM();
        this.renderFooterDOM();
        this.renderCityModalDOM();
        this.synchronizeUIPipeline();
        this.attachCityDropdownEvents();
        
        this.hasBooted = true;
    }

    evaluateRoutingContext(overrideContext) {
        const path = window.location.pathname.toLowerCase();
        
        if (overrideContext) {
            this.currentActivePage = overrideContext;
            return;
        }

        if (path.includes('home.html') || path.endsWith('/')) {
            this.currentActivePage = "index.html";
        } else if (path.includes('pg.html') || path.includes('details.html')) {
            this.currentActivePage = "pg";
        } else if (path.includes('room.html')) {
            this.currentActivePage = "rooms";
        } else if (path.includes('saved.html')) {
            this.currentActivePage = "saved";
        } else if (path.includes('profile.html')) {
            this.currentActivePage = "profile";
        } else if (path.includes('aboutus.html') || path.includes('about.html')) {
            this.currentActivePage = "about";
        } else if (path.includes('ourservices.html') || path.includes('services.html')) {
            this.currentActivePage = "services";
        } else {
            this.currentActivePage = "index";
        }
    }

    renderHeaderDOM() {
        const headerContainer = document.getElementById('dynamic-header-container');
        if (!headerContainer) return;

        const activeCityObj = this.availableCities.find(c => c.id === this.selectedCity) || this.availableCities[0];

        headerContainer.innerHTML = `
            <header class="desktop-header">
                <div class="header-left-zone">
                    <a href="index.html" class="logo-link" style="display: inline-flex; align-items: center;">
                        <img src="assets/stay100.png" alt="Stay100% Logo"class="logo-image" style="height: 60px; width: auto; object-fit: contain; margin-top: 6px; margin-left: -10px;" />
                    </a>
                    <button class="city-picker-trigger" id="global-city-selector-btn">
                        <span id="current-city-icon-display">${activeCityObj.icon}</span>
                        <span id="current-city-name-display">${activeCityObj.name}</span>
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                </div>
                <nav class="header-center">
                    <a href="index.html" class="nav-link-item" data-page="home">HOME</a>
                    <a href="pg.html" class="nav-link-item" data-page="pg">PG's</a>
                    <a href="room.html" class="nav-link-item" data-page="rooms">ROOMS</a>
                    <a href="aboutus.html" class="nav-link-item" data-page="about">ABOUT US</a>
                    <a href="ourservices.html" class="nav-link-item" data-page="services">OUR SERVICE</a>
                </nav>
                <div class="header-right">
                    <div class="profile-wrapper">
                        <a href="profile.html" class="profile-dp-link" title="User Profile">
                            <img id="global-user-dp" src="https://cdn-icons-png.flaticon.com/512/3177/3177440.png" alt="Profile" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3177/3177440.png'">
                        </a>
                    </div>
                </div>
            </header>
        `;
    }

    renderCityModalDOM() {
        let modalOverlay = document.getElementById('staypremium-city-modal');
        if (modalOverlay) modalOverlay.remove();

        modalOverlay = document.createElement('div');
        modalOverlay.id = 'staypremium-city-modal';
        modalOverlay.className = 'city-modal-overlay';

        let gridHTML = '';
        this.availableCities.forEach(city => {
            const isSelected = city.id === this.selectedCity ? 'selected' : '';
            gridHTML += `
                <div class="city-card-item ${isSelected}" data-cityid="${city.id}">
                    <div class="city-icon-frame">${city.icon}</div>
                    <div class="city-name-lbl">${city.name}</div>
                </div>
            `;
        });

        modalOverlay.innerHTML = `
            <div class="city-modal-card">
                <div class="city-modal-header">
                    <h3>Select Your City Blueprint</h3>
                    <button class="city-modal-close" id="city-modal-close-btn">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="city-grid">
                    ${gridHTML}
                </div>
            </div>
        `;
        document.body.appendChild(modalOverlay);
    }

    attachCityDropdownEvents() {
        const triggerBtn = document.getElementById('global-city-selector-btn');
        const modalOverlay = document.getElementById('staypremium-city-modal');
        const closeBtn = document.getElementById('city-modal-close-btn');
        const cityCards = document.querySelectorAll('.city-card-item');

        if (triggerBtn && modalOverlay) {
            triggerBtn.addEventListener('click', () => {
                modalOverlay.classList.add('open');
                triggerBtn.querySelector('.fa-chevron-down').style.transform = 'rotate(180deg)';
            });
        }

        const closeModal = () => {
            if (modalOverlay) modalOverlay.classList.remove('open');
            if (triggerBtn) triggerBtn.querySelector('.fa-chevron-down').style.transform = 'rotate(0deg)';
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) closeModal();
            });
        }

        cityCards.forEach(card => {
            card.addEventListener('click', () => {
                const cityId = card.dataset.cityid;
                this.selectedCity = cityId;
                localStorage.setItem('staypremium_selected_city', cityId);

                const cityObj = this.availableCities.find(c => c.id === cityId);
                if (cityObj) {
                    document.getElementById('current-city-icon-display').textContent = cityObj.icon;
                    document.getElementById('current-city-name-display').textContent = cityObj.name;
                }

                document.querySelectorAll('.city-card-item').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');

                setTimeout(() => {
                    closeModal();
                    this.applyCityClientFilter();
                }, 180);

                window.dispatchEvent(new CustomEvent('cityChanged', { detail: { cityId } }));
            });
        });
    }

    applyCityClientFilter() {
        const structuralCards = document.querySelectorAll('[data-city]');
        structuralCards.forEach(card => {
            if (this.selectedCity === "all" || card.dataset.city.toLowerCase() === this.selectedCity.toLowerCase()) {
                card.style.display = '';
                card.style.opacity = '1';
            } else {
                card.style.display = 'none';
            }
        });
    }

    renderFooterDOM() {
        const footerContainer = document.getElementById('dynamic-footer-container');
        if (!footerContainer) return;

        footerContainer.innerHTML = `
            <nav class="mobile-bottom-nav">
                <a href="index.html" class="nav-item" data-page="home">
                    <i class="fa-solid fa-house"></i>
                    <span>Home</span>
                </a>
                <a href="pg.html" class="nav-item" data-page="pg">
                    <i class="fa-solid fa-hotel"></i>
                    <span>PG's</span>
                </a>
                <a href="room.html" class="nav-item" data-page="rooms">
                    <i class="fa-solid fa-bed"></i>
                    <span>Rooms</span>
                </a>
                <a href="saved.html" class="nav-item" data-page="saved">
                    <i class="fa-solid fa-bookmark"></i>
                    <span>Saved</span>
                </a>
                <a href="profile.html" class="nav-item" data-page="profile">
                    <i class="fa-solid fa-user"></i>
                    <span>Profile</span>
                </a>
            </nav>
        `;
    }

    synchronizeUIPipeline() {
        const desktopTargets = document.querySelectorAll('.nav-link-item');
        desktopTargets.forEach(el => {
            el.classList.toggle('active', el.dataset.page === this.currentActivePage);
        });

        const mobileTargets = document.querySelectorAll('.nav-item');
        mobileTargets.forEach(el => {
            el.classList.toggle('active', el.dataset.page === this.currentActivePage);
        });
        this.applyCityClientFilter();
    }
}

// Global Core Registry Allocation
window.LayoutEngine = new LayoutEngine();

// Automated self-starting triggers
document.addEventListener('DOMContentLoaded', () => {
    window.LayoutEngine.init();
});