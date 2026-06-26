/**
 * StayPremium - Dynamic UI Layout Component Engine (Professional Edition V2.5)
 * Upgraded with High-Fidelity Architectural SVG City Line-Art & Premium Color Variables
 * Optimized Multi-Tab SEO Matrix, Unified Viewport Toggle Mechanics & Shimmering Free Property List Button
 */

// --- 1. GLOBAL COMPONENTS STYLING (CSS Injection) ---
const injectGlobalStyles = () => {
    if (document.getElementById('staypremium-core-styles')) return;

    const styleElement = document.createElement('style');
    styleElement.id = 'staypremium-core-styles';
    styleElement.textContent = `
        /* ========================================================================= */
        /* FLUTTER ENGINE TOKENS (NATIVE APP LOOK & FEEL)                           */
        /* ========================================================================= */
        :root {
            --primary-olive: #556b2f;
            --mehrum: #800020;
            --theme-teal: #1abc9c;
            --text-black: #0f172a; 
            --text-gray: #64748b;  
            --white: #ffffff;
            --footer-bg: #0f172a; 
            
            --hover-transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            --premium-bezier: cubic-bezier(0.32, 0.94, 0.6, 1); 
            --shadow-premium: 0 12px 32px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(0,0,0,0.02);
            --dark-charcoal: #0f172a;
            
            --radius-pill: 100px;
            --radius-sheet: 24px;
            --radius-item: 14px;
        }

        /* Pure Native Fluid Typography Reset & Layout Guard */
        body {
            margin: 0;
            padding: 0;
            padding-top: 88px; 
            -webkit-tap-highlight-color: transparent; 
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        /* Desktop Navigation Premium Styles */
        .desktop-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: var(--primary-olive);
            padding: 0 6%;
            position: fixed; 
            top: 0;
            left: 0;
            right: 0;
            height: 56px; 
            z-index: 9999; 
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px); 
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .desktop-header .header-left-zone {
            display: flex;
            align-items: center;
            gap: 20px;
            height: 100%;
        }

        .desktop-header .logo-link {
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            transition: var(--hover-transition);
        }
        
        .desktop-header .logo-link:hover {
            transform: scale(0.98); 
            opacity: 0.9;
        }

        /* Premium City Selector Trigger Button */
        .city-picker-trigger {
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 7px 14px;
            border-radius: var(--radius-pill);
            color: var(--white);
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: var(--hover-transition);
        }

        .city-picker-trigger:hover {
            background: rgba(255, 255, 255, 0.18);
            border-color: rgba(255, 255, 255, 0.25);
        }

        .city-picker-trigger:active {
            transform: scale(0.96); 
        }

        #current-city-icon-display {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 16px;
            color: var(--white);
        }

        #current-city-icon-display svg {
            width: 100%;
            height: 100%;
        }

        .desktop-header .header-center {
            display: flex;
            align-items: center;
            gap: 4px;
            height: 100%;
        }

        .desktop-header .header-center a {
            color: rgba(255, 255, 255, 0.75);
            text-decoration: none;
            margin: 0 10px;
            font-weight: 600;
            font-size: 13.5px;
            letter-spacing: -0.1px;
            position: relative;
            padding: 6px 0;
            transition: var(--hover-transition);
        }

        .desktop-header .header-center a::after {
            content: '';
            position: absolute;
            bottom: -6px;
            left: 0;
            width: 100%;
            height: 3px;
            background-color: var(--white);
            transform: scaleX(0);
            transform-origin: center; 
            transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            border-radius: 2px;
        }

        .desktop-header .header-center a:hover,
        .desktop-header .header-center a.active {
            color: var(--white);
        }

        .desktop-header .header-center a:hover::after,
        .desktop-header .header-center a.active::after {
            transform: scaleX(1);
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 16px;
            height: 100%;
        }

        /* --- UPGRADED LIST YOUR PROPERTY BUTTON SYSTEM --- */
        .list-property-btn {
            display: inline-flex;
            align-items: center;
            position: relative;
            padding: 8px 18px;
            background-color: var(--white);
            color: var(--text-black);
            font-size: 13px;
            font-weight: 700;
            text-decoration: none;
            border-radius: var(--radius-pill);
            transition: var(--hover-transition);
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .list-property-btn:hover {
            background-color: #f8fafc;
            border-color: #cbd5e1;
            transform: translateY(-1px);
        }

        .list-property-btn:active {
            transform: scale(0.96);
        }

        /* Free Green Badge with Reflection Glint Effect */
        .free-badge {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
            color: var(--white);
            font-size: 10px;
            font-weight: 800;
            padding: 2px 7px;
            border-radius: 4px;
            margin-left: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            position: relative;
            overflow: hidden;
            display: inline-block;
            box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
        }

        .free-badge::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -150%;
            width: 50%;
            height: 200%;
            background: linear-gradient(
                90deg,
                rgba(255, 255, 255, 0) 0%,
                rgba(255, 255, 255, 0.4) 30%,
                rgba(255, 255, 255, 0.7) 50%,
                rgba(255, 255, 255, 0.4) 70%,
                rgba(255, 255, 255, 0) 100%
            );
            transform: rotate(25deg);
            animation: flutterGlint 3.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes flutterGlint {
            0% { left: -150%; }
            15% { left: 150%; }
            100% { left: 150%; }
        }

        .profile-dp-link {
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            border-radius: 50%;
            transition: var(--hover-transition);
        }

        .profile-dp-link:active {
            transform: scale(0.93);
        }

        .profile-dp img {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            border: 1.5px solid rgba(255, 255, 255, 0.9);
            object-fit: cover;
            display: block;
        }

        /* --- PREMIUM CITY OVERLAY SYSTEM --- */
        .city-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(12px); 
            -webkit-backdrop-filter: blur(12px);
            z-index: 10000; 
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s var(--premium-bezier);
        }

        .city-modal-overlay.open {
            opacity: 1;
            pointer-events: auto;
        }

        .city-modal-card {
            background: var(--white);
            width: 90%;
            max-width: 760px;
            border-radius: var(--radius-sheet);
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16);
            overflow: hidden;
            position: relative;
            transform: scale(0.95) translateY(10px);
            opacity: 0;
            transition: transform 0.35s var(--premium-bezier), opacity 0.25s ease;
        }

        .city-modal-overlay.open .city-modal-card {
            transform: scale(1) translateY(0);
            opacity: 1;
        }

        .city-modal-header {
            padding: 20px 28px;
            background: var(--white); 
            color: var(--text-black);
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #f1f5f9;
        }

        .city-modal-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: -0.3px;
        }

        .city-modal-close {
            background: #f1f5f9;
            border: none;
            color: var(--text-gray);
            font-size: 14px;
            cursor: pointer;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: var(--hover-transition);
        }

        .city-modal-close:hover {
            background: #e2e8f0;
            color: var(--text-black);
        }

        .city-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));
            gap: 16px;
            padding: 28px;
            max-height: 440px;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
        }

        .city-grid::-webkit-scrollbar { width: 5px; }
        .city-grid::-webkit-scrollbar-track { background: transparent; }
        .city-grid::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

        .city-card-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 16px 12px;
            border: 1px solid #f1f5f9;
            border-radius: var(--radius-item);
            cursor: pointer;
            transition: var(--hover-transition);
            text-align: center;
            background: #ffffff;
        }

        .city-card-item:hover {
            border-color: var(--theme-teal);
            background: rgba(26, 188, 156, 0.02);
        }

        .city-card-item:active {
            transform: scale(0.96); 
        }

        .city-card-item.selected {
            border-color: var(--mehrum);
            background: rgba(128, 0, 32, 0.04);
            font-weight: 700;
        }

        .city-icon-frame {
            width: 56px;
            height: 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            color: var(--text-black);
            border-radius: 50%;
            margin-bottom: 10px;
            border: 1px solid #f1f5f9;
            transition: var(--hover-transition);
        }

        .city-icon-frame svg {
            width: 30px;
            height: 30px;
            stroke-width: 2;
            fill: none;
        }

        .city-card-item:hover .city-icon-frame {
            background: #ffffff;
            color: var(--theme-teal);
            box-shadow: 0 4px 12px rgba(26, 188, 156, 0.15);
        }

        .city-card-item.selected .city-icon-frame {
            background: var(--mehrum);
            color: var(--white);
            border-color: var(--mehrum);
        }

        .city-name-lbl {
            font-size: 13px;
            font-weight: 600;
            color: var(--dark-charcoal);
        }

        /* FOOTER MODULE MAIN STYLING */
        .main-desktop-footer {
            background-color: var(--footer-bg);
            color: var(--white);
            position: relative;
            padding: 60px 6% 30px 6%;
            margin-top: 60px;
            overflow: hidden;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .footer-landscape-art {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: auto;
            opacity: 0.04;
            pointer-events: none;
            z-index: 1;
        }

        .footer-grid-container {
            position: relative;
            z-index: 2;
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1.5fr;
            gap: 32px;
            max-width: 1300px;
            margin: 0 auto;
        }

        .footer-brand-column p { color: var(--text-gray); font-size: 13.5px; line-height: 1.6; margin-bottom: 16px; }
        .footer-social-icons { display: flex; gap: 12px; }
        .footer-social-icons a { color: var(--white); background: rgba(255,255,255,0.05); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: var(--hover-transition); text-decoration: none; }
        
        .fb-link:hover { background-color: #4f46e5 !important; }
        .insta-link:hover { background-color: #e1306c !important; }
        .x-link:hover { background-color: #1da1f2 !important; }
        .ln-link:hover { background-color: #0077b5 !important; }

        .footer-bottom-bar { position: relative; z-index: 2; border-top: 1px solid rgba(255, 255, 255, 0.05); margin-top: 40px; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-gray); max-width: 1300px; margin-left: auto; margin-right: auto; }

        /* --- FLUTTER BOTTOM NAVIGATION BAR STRUCT --- */
        .mobile-bottom-nav {
            display: none;
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 64px;
            background: rgba(255, 255, 255, 0.94);
            box-shadow: 0 -10px 30px rgba(15, 23, 42, 0.04);
            justify-content: space-around;
            align-items: center;
            padding-bottom: env(safe-area-inset-bottom, 0px); 
            z-index: 9999;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-top: 1px solid rgba(241, 245, 249, 0.8);
        }

        .nav-item { 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            text-decoration: none; 
            color: #94a3b8; 
            font-size: 10.5px; 
            font-weight: 700; 
            transition: var(--hover-transition); 
            gap: 2px;
            position: relative;
            padding: 4px 12px;
        }
        .nav-item i { font-size: 18px; }
        .nav-item:active { transform: scale(0.9); }
        .nav-item.active { color: var(--mehrum); }

        /* --- RESPONSIVE ADJUSTMENTS --- */
        @media (max-width: 768px) {
            body {
                padding-top: 76px; 
                padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
            }
            .desktop-header .header-center { display: none; }
            .list-property-btn { display: none !important; }
            .mobile-bottom-nav { display: flex; }
            .desktop-header { 
                padding: 0 20px; 
                height: 52px; 
            }
            
            .city-modal-overlay {
                align-items: flex-end; 
            }
            .city-modal-card { 
                width: 100%; 
                max-width: 100%;
                border-radius: var(--radius-sheet) var(--radius-sheet) 0 0; 
                transform: translateY(100%); 
                transition: transform 0.42s cubic-bezier(0.16, 1, 0.3, 1);
                padding-bottom: env(safe-area-inset-bottom, 12px);
            }
            
            .city-modal-card::before {
                content: '';
                display: block;
                width: 36px;
                height: 4px;
                background: #e2e8f0;
                border-radius: var(--radius-pill);
                margin: 10px auto 0 auto;
            }

            .city-modal-header {
                padding: 14px 20px 10px 20px;
                border-bottom: none;
            }
            .city-grid { 
                grid-template-columns: repeat(3, 1fr); 
                padding: 12px 16px 24px 16px; 
                gap: 10px; 
            }
            .city-card-item {
                padding: 12px 8px;
                border-radius: 12px;
            }
            .city-icon-frame {
                width: 48px;
                height: 48px;
                margin-bottom: 6px;
            }
            .city-icon-frame svg { width: 24px; height: 24px; }
            .city-name-lbl { font-size: 11.5px; }

            .main-desktop-footer { display: none; }
            .main-desktop-footer.show { display: block !important; opacity: 1 !important; }
            .footer-grid-container { grid-template-columns: 1fr; gap: 20px; }
            .footer-landscape-art { display: none; }
        }
    `;
    
    document.head.appendChild(styleElement);
};

// --- 2. LAYOUT ENGINE CONTROLLER CLASS ---
class LayoutEngine {
    constructor() {
        this.currentActivePage = "home";
        
        // Architectural Line Art Vector Database 
        this.availableCities = [
            {
                id: "all",
                name: "All Cities",
                icon: `<svg viewBox="0 0 64 64" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="22" cy="22" r="14" fill="none"/>
                    <circle cx="42" cy="42" r="14" fill="none"/>
                    <path d="M32 14v4M14 32h4M46 32h4M32 46v4" />
                </svg>`
            },
            { 
                id: "bangalore", 
                name: "Bangalore", 
                icon: `<svg viewBox="0 0 64 64" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 60V24l12-10 12 10v36M12 60h40M26 34h12v12H26zM20 24H10v36h10M44 24h10v36h4M32 14V8" />
                </svg>` 
            },
            { 
                id: "chennai", 
                name: "Chennai", 
                icon: `<svg viewBox="0 0 64 64" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 60V20l16-12 16 12v40M32 8v52M20 32h24M20 44h24" />
                </svg>` 
            },
            { 
                id: "delhi", 
                name: "Delhi", 
                icon: `<svg viewBox="0 0 64 64" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 60V34c0-10 8-18 18-18s18 8 18 18v26M32 16V6M10 60h44M22 60V42h20v18" />
                </svg>` 
            },
            { 
                id: "gurgaon", 
                name: "Gurgaon", 
                icon: `<svg viewBox="0 0 64 64" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 60V10h22v50M38 26h14v34M24 18h6M24 28h6M24 38h6" />
                </svg>` 
            },
            { 
                id: "hyderabad", 
                name: "Hyderabad", 
                icon: `<svg viewBox="0 0 64 64" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 60V26h8v34M44 60V26h8v34M20 34c0-8 5-14 12-14s12 6 12 14M16 26V12M48 26V12" />
                </svg>` 
            },
            { 
                id: "jaipur", 
                name: "Jaipur", 
                icon: `<svg viewBox="0 0 64 64" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 60V32l8-10 8 10v28M36 60V32l8-10 8 10v28M24 22h16M20 60h24" />
                </svg>` 
            },
            { 
                id: "kolkata", 
                name: "Kolkata", 
                icon: `<svg viewBox="0 0 64 64" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 60V22c0-5 4-9 9-9h18c5 0 9 4 9 9v38M22 28h20M22 40h20" />
                </svg>` 
            },
            { 
                id: "mumbai", 
                name: "Mumbai", 
                icon: `<svg viewBox="0 0 64 64" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 60V32l22-16 22 16v24M18 42h28M18 50h28" />
                </svg>` 
            },
            { 
                id: "noida", 
                name: "Noida", 
                icon: `<svg viewBox="0 0 64 64" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 60V6h14v54M36 60V18h14v42M20 14h2M20 24h2M42 28h2M42 38h2" />
                </svg>` 
            },
            { 
                id: "pune", 
                name: "Pune", 
                icon: `<svg viewBox="0 0 64 64" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 60L32 10l12 50M10 60h44M24 36h16" />
                </svg>` 
            },
            { 
                id: "udaipur", 
                name: "Udaipur", 
                icon: `<svg viewBox="0 0 64 64" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 60C12 40 20 28 32 28s20 12 20 32M20 28V16h24v12M32 16V8" />
                </svg>` 
            }
        ];
        this.selectedCity = localStorage.getItem('staypremium_selected_city') || "all";
        injectGlobalStyles();
    }

    init(activePageContext) {
        this.currentActivePage = activePageContext || "home";
        this.injectHeader();
        this.injectFooter();
        this.injectCityModal();
        this.applyActiveStates();
        this.attachCitySystemListeners();
        this.applyCityClientSideFilter();
    }

    injectHeader() {
        const container = document.getElementById('dynamic-header-container');
        if (!container) return;

        const currentCityObj = this.availableCities.find(c => c.id === this.selectedCity) || this.availableCities[0];

        container.innerHTML = `
            <header class="desktop-header">
                <div class="header-left-zone">
                    <a href="index.html" class="logo-link">
                        <img src="assets/stay100.png" alt="Stay100% Logo" class="logo-image" style="height: 40px; width: auto; object-fit: contain;">
                    </a>
                    <button class="city-picker-trigger" id="global-city-selector-btn">
                        <span id="current-city-icon-display">${currentCityObj.icon}</span>
                        <span id="current-city-name-display" style="margin-left: 5px;">${currentCityObj.name}</span>
                        <i class="fa-solid fa-chevron-down" style="margin-left: 4px;"></i>
                    </button>
                </div>
                <nav class="header-center">
                    <a href="index.html" class="nav-link-item" data-page="home">HOME</a>
                    <a href="pg.html" class="nav-link-item" data-page="pg">PG's</a>
                    <a href="room.html" class="nav-link-item" data-page="rooms">FLAT'S</a>
                    <a href="aboutus.html" class="nav-link-item" data-page="about">ABOUT US</a>
                    <a href="ourservices.html" class="nav-link-item" data-page="services">OUR SERVICE</a>
                </nav>
                <div class="header-right">
                    <a href="vendor-registration.html" class="list-property-btn">
                        List Your Property
                        <span class="free-badge">FREE</span>
                    </a>
                    
                    <a href="profile.html" class="profile-dp-link" title="View Profile">
                        <div class="profile-dp">
                            <img id="user-google-dp" src="https://cdn-icons-png.flaticon.com/512/3177/3177440.png" alt="Profile" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3177/3177440.png'">
                        </div>
                    </a>
                </div>
            </header>
        `;
    }

    injectFooter() {
        // --- 1. PREMIUM CSS ARCHITECTURE INJECTION ---
        if (!document.getElementById('staypremium-footer-extended-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'staypremium-footer-extended-styles';
            styleElement.textContent = `
                /* Core Variables Matrix */
                :root {
                    --footer-dark-bg: #0b0f19;
                    --footer-glass-border: rgba(255, 255, 255, 0.08);
                    --footer-text-muted: #94a3b8;
                    --footer-accent-color: #800020; /* Mehrum Accent */
                    --footer-interactive-indigo: #4f46e5;
                    --footer-transition-smooth: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* Toggle Section Engine */
                .footer-toggle-wrapper {
                    text-align: center;
                    margin-bottom: 24px;
                }
                .btn-footer-toggle {
                    cursor: pointer;
                    padding: 10px 24px;
                    border-radius: 100px;
                    border: 1px solid var(--footer-glass-border);
                    background: var(--footer-interactive-indigo);
                    color: #ffffff;
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    letter-spacing: 0.3px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
                    transition: var(--footer-transition-smooth);
                }
                .btn-footer-toggle:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
                    background: #4338ca;
                }

                /* Column Headers & List Item Styling */
                .footer-column h4 {
                    color: #ffffff;
                    font-size: 16px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    margin: 0 0 20px 0;
                    text-transform: uppercase;
                    position: relative;
                    padding-bottom: 8px;
                }
                .footer-column h4::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 24px;
                    height: 2px;
                    background: var(--footer-accent-color);
                }
                .footer-links-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .footer-links-list li {
                    margin-bottom: 12px;
                }
                .footer-links-list a {
                    color: var(--footer-text-muted);
                    text-decoration: none;
                    font-size: 14px;
                    transition: var(--footer-transition-smooth);
                }
                .footer-links-list a:hover {
                    color: #ffffff;
                    padding-left: 4px;
                }
                .footer-address-info p {
                    color: var(--footer-text-muted);
                    font-size: 14px;
                    line-height: 1.6;
                    margin: 0 0 12px 0;
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                }
                .footer-address-info i {
                    color: var(--footer-accent-color);
                    font-size: 14px;
                    margin-top: 4px;
                }

                /* NoBroker-Style Professional Tab Engine CSS */
                .footer-seo-tabs-container {
                    max-width: 1280px;
                    margin: 40px auto 20px auto;
                    padding: 0 40px;
                }
                .seo-tabs-nav {
                    display: flex;
                    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
                    margin-bottom: 24px;
                    gap: 4px;
                }
                .seo-tab-trigger {
                    background: transparent;
                    border: none;
                    color: var(--footer-text-muted);
                    padding: 12px 24px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--footer-transition-smooth);
                    position: relative;
                    bottom: -2px;
                    border-bottom: 3px solid transparent;
                }
                .seo-tab-trigger.active-tab {
                    color: #ffffff;
                    border-bottom: 3px solid var(--footer-interactive-indigo);
                    background: rgba(255, 255, 255, 0.02);
                }
                .seo-tab-panel {
                    display: none;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 30px;
                }
                .seo-tab-panel.active-panel {
                    display: grid;
                }
                .seo-column-group h5 {
                    color: #ffffff;
                    font-size: 13.5px;
                    font-weight: 600;
                    margin: 0 0 14px 0;
                    padding-bottom: 6px;
                    border-bottom: 1px dashed rgba(255,255,255,0.1);
                    letter-spacing: 0.3px;
                }
                .seo-links-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .seo-links-list a {
                    color: var(--footer-text-muted);
                    text-decoration: none;
                    font-size: 12.5px;
                    line-height: 1.5;
                    transition: var(--footer-transition-smooth);
                }
                .seo-links-list a:hover {
                    color: #ffffff;
                    text-shadow: 0 0 1px rgba(255,255,255,0.5);
                    padding-left: 2px;
                }

                @media (max-width: 1024px) {
                    .seo-tab-panel {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 24px;
                    }
                }
                @media (max-width: 640px) {
                    .seo-tab-panel {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                    .seo-tabs-nav {
                        flex-direction: column;
                        gap: 0;
                        border-bottom: none;
                    }
                    .seo-tab-trigger {
                        border-bottom: 1px solid rgba(255,255,255,0.05);
                        text-align: left;
                        padding: 10px 12px;
                    }
                    .seo-tab-trigger.active-tab {
                        border-bottom: 1px solid var(--footer-interactive-indigo);
                        border-left: 3px solid var(--footer-interactive-indigo);
                    }
                    .footer-seo-tabs-container {
                        padding-left: 24px;
                        padding-right: 24px;
                    }
                }
            `;
            document.head.appendChild(styleElement);
        }

// --- 2. MOBILE BOTTOM NAVIGATION SYSTEM ---
const mobileContainer = document.getElementById('dynamic-footer-container');
if (mobileContainer) {
    mobileContainer.innerHTML = `
        <nav class="mobile-bottom-nav">
            <a href="index.html" class="nav-item" data-page="home"><i class="fa-solid fa-house"></i><span>Home</span></a>
            <a href="pg.html" class="nav-item" data-page="pg"><i class="fa-solid fa-hotel"></i><span>PG's</span></a>
            <a href="room.html" class="nav-item" data-page="rooms"><i class="fa-solid fa-bed"></i><span>Flats</span></a>
            <a href="profile.html" class="nav-item" data-page="profile"><i class="fa-solid fa-user"></i><span>Profile</span></a>
        </nav>
    `;
}

// --- 3. DESKTOP LANDSCAPE FOOTER INJECTION WITH UPDATED SEMANTICS ---
const desktopFooterContainer = document.getElementById('dynamic-desktop-footer-container');
if (desktopFooterContainer) {
    desktopFooterContainer.innerHTML = `
        <div class="footer-toggle-wrapper">
            <button id="btn-global-footer-toggle" class="btn-footer-toggle">
                <i class="fa-solid fa-circle-chevron-down" id="toggle-icon" style="transition: transform 0.3s ease;"></i> 
                <span id="toggle-text">Show Full Directory</span>
            </button>
        </div>

        <footer id="staypremium-core-footer" class="main-desktop-footer" style="display: none; opacity: 0; transition: opacity 0.3s ease;">
            <svg class="footer-landscape-art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" preserveAspectRatio="none">
                <path d="M-50,400 L200,180 L450,320 L750,110 L1100,340 L1250,220 L1250,400 Z" fill="none" stroke="#ffffff" stroke-width="1.5" />
                <path d="M50,400 L380,230 L600,340 L900,160 L1250,390 Z" fill="none" stroke="#ffffff" stroke-width="1" stroke-dasharray="5,5" />
                <g transform="translate(150, 220) scale(0.85)">
                    <polygon points="120,40 40,110 200,110" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/>
                    <rect x="55" y="110" width="130" height="90" fill="none" stroke="#ffffff" stroke-width="2" />
                    <rect x="100" y="145" width="40" height="55" fill="none" stroke="#ffffff" stroke-width="2" />
                    <circle cx="132" cy="172" r="2" fill="#ffffff" />
                </g>
                <line x1="0" y1="398" x2="1200" y2="398" stroke="#ffffff" stroke-width="3" />
            </svg>

            <div class="footer-grid-container">
                <div class="footer-brand-column">
                    <a href="index.html" class="footer-logo-link">
                        <img src="assets/stay100-1.png" alt="Stay100% Logo" style="height: 52px; width: auto; object-fit: contain;" />
                    </a>
                    <p>Experience ultra-premium co-living environments with verified properties, automated maintenance pipelines, and verified room allocation architectures tailored globally.</p>
                    <div class="footer-social-icons">
                        <a href="https://facebook.com" target="_blank" class="fb-link"><i class="fa-brands fa-facebook-f"></i></a>
                        <a href="https://instagram.com" target="_blank" class="insta-link"><i class="fa-brands fa-instagram"></i></a>
                        <a href="https://twitter.com" target="_blank" class="x-link"><i class="fa-brands fa-x-twitter"></i></a>
                        <a href="https://linkedin.com" target="_blank" class="ln-link"><i class="fa-brands fa-linkedin-in"></i></a>
                    </div>
                </div>
                
                <div class="footer-column">
                    <h4>Company</h4>
                    <ul class="footer-links-list">
                        <li><a href="aboutus.html">About Corporate Group</a></li>
                        <li><a href="ecosystem.html">Premium Ecosystem</a></li>
                        <li><a href="privacy-policy.html">Privacy Policy</a></li>
                        <li><a href="terms.html">Terms & Conditions</a></li>
                        <li><a href="faqs.html">Faq's</a></li>
                    </ul>
                </div>
                
                <div class="footer-column">
                    <h4>Partners</h4>
                    <ul class="footer-links-list">
                        <li><a href="admin.html">Admin Hub</a></li>
                        <li><a href="corporate.html">Corporate Tie-ups</a></li>
                    </ul>
                </div>
                
                <div class="footer-column">
                    <h4>Contact Info</h4>
                    <div class="footer-address-info">
                        <p><i class="fa-solid fa-location-dot"></i> <span>Plot 45, Sector 12, Mansarovar Main Road, Jaipur, Rajasthan, 302020</span></p>
                        <p><i class="fa-solid fa-phone"></i> <span>+91 98765 43210</span></p>
                        <p><i class="fa-solid fa-envelope"></i> <span>supportstay100@gmail.com</span></p>
                    </div>
                </div>
            </div>

            <div class="footer-seo-tabs-container">
                <div class="seo-tabs-nav">
                    <button class="seo-tab-trigger active-tab" data-target="panel-flats-rent">Flats for Rent</button>
                    <button class="seo-tab-trigger" data-target="panel-pg-hostels">PG / Hostels</button>
                    <button class="seo-tab-trigger" data-target="panel-flatmates">Flatmates</button>
                </div>

                <div class="seo-tabs-content-body">
                    
                    <div id="panel-flats-rent" class="seo-tab-panel active-panel">
                        <div class="seo-column-group">
                            <h5>Flats for Rent in Jaipur</h5>
                            <div class="seo-links-list">
                                <a href="jaipur.html?type=flat&area=mansarovar">Flats in Mansarovar Main Road</a>
                                <a href="jaipur.html?type=flat&area=gopalpura">1 & 2 BHK in Gopalpura Bypass</a>
                                <a href="jaipur.html?type=flat&area=malviyanagar">Furnished Apartments Malviya Nagar</a>
                                <a href="jaipur.html?type=flat&area=station">Rental Rooms near Jaipur Junction</a>
                                <a href="jaipur.html?type=flat&budget=10k">Budget Rental Flats under 10k</a>
                            </div>
                        </div>
                        <div class="seo-column-group">
                            <h5>Flats for Rent in Delhi NCR</h5>
                            <div class="seo-links-list">
                                <a href="delhi.html?type=flat&area=rajindernagar">UPSC Hub Flats Old Rajinder Nagar</a>
                                <a href="delhi.html?type=flat&area=laxminagar">1 BHK Apartments in Laxmi Nagar</a>
                                <a href="delhi.html?type=flat&area=northcampus">Student Flats near DU North Campus</a>
                                <a href="delhi.html?type=flat&area=satyaniketan">Studio Flats in Satya Niketan</a>
                                <a href="delhi.html?type=flat&area=ndls">Properties near New Delhi Station</a>
                            </div>
                        </div>
                        <div class="seo-column-group">
                            <h5>Flats for Rent in Gurugram</h5>
                            <div class="seo-links-list">
                                <a href="gurugram.html?type=flat&area=cybercity">Corporate Suites near Cyber City</a>
                                <a href="gurugram.html?type=flat&area=sector48">Luxury 2 BHK Sector 48 Sohna Road</a>
                                <a href="gurugram.html?type=flat&area=hudacity">Studio Rooms near Millennium Metro</a>
                                <a href="gurugram.html?type=flat&area=sector21">Managed Flat Systems Sector 21</a>
                                <a href="gurugram.html?type=flat&budget=15k">Premium Flats under 15k</a>
                            </div>
                        </div>
                        <div class="seo-column-group">
                            <h5>Flats for Rent in Noida</h5>
                            <div class="seo-links-list">
                                <a href="noida.html?type=flat&area=sector62">IT Park Linked Flats Sector 62</a>
                                <a href="noida.html?type=flat&area=sector15">Metro Walk Apartments Sector 15</a>
                                <a href="noida.html?type=flat&area=knowledgepark">Greater Noida Knowledge Park Units</a>
                                <a href="noida.html?type=flat&area=amity">Independent Stays near Amity</a>
                                <a href="noida.html?type=flat&budget=12k">Fully Furnished Flats under 12k</a>
                            </div>
                        </div>
                    </div>

                    <div id="panel-pg-hostels" class="seo-tab-panel">
                        <div class="seo-column-group">
                            <h5>PG / Hostels in Mumbai</h5>
                            <div class="seo-links-list">
                                <a href="mumbai.html?type=pg&area=andheri">Executive Co-living in Andheri West</a>
                                <a href="mumbai.html?type=pg&area=powai">IIT Tech Circle PG in Powai</a>
                                <a href="mumbai.html?type=pg&area=bandra">Premium Single Rooms Bandra Complex</a>
                                <a href="mumbai.html?type=pg&area=csmt">Working Hostels near CSMT Station</a>
                                <a href="mumbai.html?type=pg&budget=12k">Managed Spaces under 12k</a>
                            </div>
                        </div>
                        <div class="seo-column-group">
                            <h5>PG / Hostels in Pune</h5>
                            <div class="seo-links-list">
                                <a href="index.html?location=pune&type=pg&area=hinjewadi">Hinjewadi Infotech Phase 1-3 PG</a>
                                <a href="index.html?location=pune&type=pg&area=vimannagar">Symbiosis Student Rooms Viman Nagar</a>
                                <a href="index.html?location=pune&type=pg&area=kothrud">Single Sharing Stays in Kothrud</a>
                                <a href="index.html?location=pune&type=pg&area=punestation">Hostel Rooms near Pune Junction</a>
                                <a href="index.html?location=pune&type=pg&facility=food">Premium Food Attached PG Pune</a>
                            </div>
                        </div>
                        <div class="seo-column-group">
                            <h5>PG / Hostels in Hyderabad</h5>
                            <div class="seo-links-list">
                                <a href="hyderabad.html?type=pg&area=hitechcity">Luxury Co-living near HITEC City</a>
                                <a href="hyderabad.html?type=pg&area=gachibowli">Professional Suites Gachibowli</a>
                                <a href="hyderabad.html?type=pg&area=ameerpet">Coaching Area Rooms Ameerpet Hub</a>
                                <a href="hyderabad.html?type=pg&area=secunderabad">Hostels near Secunderabad Station</a>
                                <a href="hyderabad.html?type=pg&budget=6k">Sharing Room Systems under 6k</a>
                            </div>
                        </div>
                        <div class="seo-column-group">
                            <h5>Institutional Student Hubs</h5>
                            <div class="seo-links-list">
                                <a href="jaipur.html?type=pg&landmark=coaching">PG near Allen & Resonance Jaipur</a>
                                <a href="lucknow.html?type=pg">Student Hostels in Lucknow</a>
                                <a href="chandigarh.html?type=pg">Premium Stays in Chandigarh Sector Hubs</a>
                                <a href="index.html?location=udaipur&type=pg">Luxury Student Rooms Udaipur</a>
                                <a href="chennai.html?type=pg">Hostels near Chennai Central Station</a>
                                <a href="index.html?location=kolkata&type=pg">Premium Co-living Stays in Kolkata</a>
                            </div>
                        </div>
                    </div>

                    <div id="panel-flatmates" class="seo-tab-panel">
                        <div class="seo-column-group">
                            <h5>Flatmates in Metro Zones</h5>
                            <div class="seo-links-list">
                                <a href="bangalore.html?type=flatmate">Shared Rooms in Bangalore (HSR & Koramangala)</a>
                                <a href="mumbai.html?type=flatmate">Male/Female Room Sharing Mumbai West</a>
                                <a href="delhi.html?type=flatmate">UPSC Roommates Sharing Delhi NCR</a>
                                <a href="index.html?type=flatmate&location=pune">Pre-occupied 2 BHK Room sharing Pune</a>
                            </div>
                        </div>
                        <div class="seo-column-group">
                            <h5>Configurations Directory</h5>
                            <div class="seo-links-list">
                                <a href="index.html?gender=girls">Girls Only Premium Shared Spaces</a>
                                <a href="index.html?gender=boys">Boys Executive Co-living Flatmates</a>
                                <a href="index.html?sharing=single">Single Occupancy Private Rooms</a>
                                <a href="index.html?sharing=double">Double Sharing Corporate Setup</a>
                                <a href="index.html?verified=true">Zero-Deposit Verified Rental Networks</a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div class="footer-bottom-bar">
                <div>© 2026 Stay100% All Rights Reserved. Conceptualized by Stay100% Enterprise Network. Dedicated to delivering 100% transparent rental solutions across India.</div>
            </div>
        </footer>
    `;

        
            // --- 4. UNIFIED INTERACTIVE TOGGLE LOGIC FOR DESKTOP & MOBILE ---
            const toggleButton = document.getElementById('btn-global-footer-toggle');
            const footerElement = document.getElementById('staypremium-core-footer');
            const toggleIcon = document.getElementById('toggle-icon');
            const toggleText = document.getElementById('toggle-text');

            if (toggleButton && footerElement) {
                toggleButton.addEventListener('click', () => {
                    const isMobile = window.innerWidth <= 768;

                    if (isMobile) {
                        const isHidden = !footerElement.classList.contains('show');
                        if (isHidden) {
                            footerElement.classList.add('show');
                            toggleButton.innerHTML = `<i class="fa-solid fa-circle-chevron-up" style="margin-right: 4px;"></i> Hide Full Directory`;
                            footerElement.scrollIntoView({ behavior: 'smooth' });
                        } else {
                            footerElement.classList.remove('show');
                            toggleButton.innerHTML = `<i class="fa-solid fa-circle-chevron-down" style="margin-right: 4px;"></i> Show Full Directory`;
                        }
                    } else {
                        if (footerElement.style.display === 'none' || footerElement.style.display === '') {
                            footerElement.style.display = 'block';
                            setTimeout(() => {
                                footerElement.style.opacity = '1';
                            }, 10);
                            if (toggleText) toggleText.innerText = 'Hide Full Directory';
                            if (toggleIcon) toggleIcon.style.transform = 'rotate(180deg)';
                        } else {
                            footerElement.style.opacity = '0';
                            setTimeout(() => {
                                footerElement.style.display = 'none';
                            }, 300);
                            if (toggleText) toggleText.innerText = 'Show Full Directory';
                            if (toggleIcon) toggleIcon.style.transform = 'rotate(0deg)';
                        }
                    }
                });
            }

            // --- 5. NO-BROKER MULTI-TAB NAVIGATION ROUTER ENGINE ---
            const tabTriggers = desktopFooterContainer.querySelectorAll('.seo-tab-trigger');
            const tabPanels = desktopFooterContainer.querySelectorAll('.seo-tab-panel');

            tabTriggers.forEach(trigger => {
                trigger.addEventListener('click', (e) => {
                    const targetId = e.target.getAttribute('data-target');

                    tabTriggers.forEach(t => t.classList.remove('active-tab'));
                    tabPanels.forEach(p => p.classList.remove('active-panel'));

                    e.target.classList.add('active-tab');
                    const targetPanel = document.getElementById(targetId);
                    if (targetPanel) {
                        targetPanel.classList.add('active-panel');
                    }
                });
            });
        }
    }

    injectCityModal() {
        let modalOverlay = document.getElementById('staypremium-city-modal');
        if (modalOverlay) modalOverlay.remove();

        modalOverlay = document.createElement('div');
        modalOverlay.id = 'staypremium-city-modal';
        modalOverlay.className = 'city-modal-overlay';

        let cityCardsHTML = '';
        this.availableCities.forEach(city => {
            const isSelected = city.id === this.selectedCity ? 'selected' : '';
            cityCardsHTML += `
                <div class="city-card-item ${isSelected}" data-cityid="${city.id}">
                    <div class="city-icon-frame">${city.icon}</div>
                    <div class="city-name-lbl">${city.name}</div>
                </div>
            `;
        });

        modalOverlay.innerHTML = `
            <div class="city-modal-card">
                <div class="city-modal-header">
                    <h3>Select Your City</h3>
                    <button class="city-modal-close" id="city-modal-close-btn">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="city-grid">
                    ${cityCardsHTML}
                </div>
            </div>
        `;
        document.body.appendChild(modalOverlay);
    }

    attachCitySystemListeners() {
        const triggerBtn = document.getElementById('global-city-selector-btn');
        const modalOverlay = document.getElementById('staypremium-city-modal');
        const closeBtn = document.getElementById('city-modal-close-btn');
        const cityCards = document.querySelectorAll('.city-card-item');

        if (triggerBtn && modalOverlay) {
            triggerBtn.addEventListener('click', () => {
                document.querySelectorAll('.city-card-item').forEach(card => {
                    card.classList.toggle('selected', card.dataset.cityid === this.selectedCity);
                });
                modalOverlay.classList.add('open');
                const chevron = triggerBtn.querySelector('.fa-chevron-down');
                if (chevron) chevron.style.transform = 'rotate(180deg)';
            });
        }

        const closeModalFunc = () => {
            if (modalOverlay) modalOverlay.classList.remove('open');
            if (triggerBtn) {
                const chevron = triggerBtn.querySelector('.fa-chevron-down');
                if (chevron) chevron.style.transform = 'rotate(0deg)';
            }
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModalFunc);
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) closeModalFunc();
            });
        }

        cityCards.forEach(card => {
            card.addEventListener('click', () => {
                const targetCityId = card.dataset.cityid;
                this.selectedCity = targetCityId;
                localStorage.setItem('staypremium_selected_city', targetCityId);

                const selectedCityObj = this.availableCities.find(c => c.id === targetCityId);
                if (selectedCityObj) {
                    document.getElementById('current-city-icon-display').innerHTML = selectedCityObj.icon;
                    document.getElementById('current-city-name-display').textContent = selectedCityObj.name;
                }

                document.querySelectorAll('.city-card-item').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');

                setTimeout(() => {
                    closeModalFunc();
                    this.applyCityClientSideFilter();
                }, 180);

                window.dispatchEvent(new CustomEvent('cityChanged', { detail: { cityId: targetCityId } }));
            });
        });
    }

    applyCityClientSideFilter() {
        const propertyCards = document.querySelectorAll('[data-city]');
        propertyCards.forEach(card => {
            if (this.selectedCity === "all" || card.dataset.city.toLowerCase() === this.selectedCity.toLowerCase()) {
                card.style.display = ''; 
                card.style.opacity = '1';
            } else {
                card.style.display = 'none'; 
            }
        });
    }

    applyActiveStates() {
        const desktopLinks = document.querySelectorAll('.nav-link-item');
        desktopLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === this.currentActivePage);
        });

        const mobileLinks = document.querySelectorAll('.nav-item');
        mobileLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === this.currentActivePage);
        });
    }
}

// Global window instantiation block 
window.LayoutEngine = new LayoutEngine();

document.addEventListener('DOMContentLoaded', () => {
    if (!window.customPageContextSet) {
        window.LayoutEngine.init("home");
    }
});