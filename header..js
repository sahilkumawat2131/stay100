/**
 * StayPremium - Premium UI Layout Component Engine with App-Like Page Transitions
 */

const injectGlobalStyles = () => {
    if (document.getElementById('staypremium-core-styles')) return;

    const styleElement = document.createElement('style');
    styleElement.id = 'staypremium-core-styles';
    styleElement.textContent = `
        :root {
            --brand-olive: #556B2F;
            --brand-olive-light: #6b8e23;
            --brand-maroon: #800020;
            --dark-charcoal: #111827;
            --muted-slate: #4b5563;
            --pure-white: #ffffff;
            --smooth-bezier: cubic-bezier(0.4, 0, 0.2, 1);
            --premium-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
            --shadow-md: 0 10px 30px rgba(0,0,0,0.08);
            --shadow-premium: 0 20px 40px rgba(0, 0, 0, 0.12);
        }

        /* --- NATIVE APP-LIKE PAGE TRANSITION ANIMATION --- */
        body {
            opacity: 1;
            transform: translateY(0);
            transition: opacity 0.35s ease-out, transform 0.35s ease-out;
        }

        body.page-transitioning {
            opacity: 0;
            transform: translateY(12px);
        }

        /* Desktop Header Core */
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
        }

        .header-left-zone { display: flex; align-items: center; gap: 24px; }

        .desktop-header .logo-link {
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            padding: 4px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .desktop-header .logo-image {
            height: 52px;
            width: auto;
            object-fit: contain;
        }

        .city-picker-trigger {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 50px;
            color: var(--pure-white);
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
        }

        .desktop-header .header-center { display: flex; align-items: center; gap: 6px; }

        .desktop-header .header-center a {
            color: rgba(255, 255, 255, 0.92);
            text-decoration: none;
            padding: 10px 18px;
            font-weight: 600;
            font-size: 13.5px;
            border-radius: 50px;
            position: relative;
            overflow: hidden;
            z-index: 1;
            transition: color 0.3s ease;
        }

        .desktop-header .header-center a::before {
            content: '';
            position: absolute;
            bottom: 0; left: 50%;
            width: 0%; height: 0%;
            background-color: var(--brand-maroon);
            border-radius: 50px;
            z-index: -1;
            transform: translateX(-50%);
            transition: width 0.4s ease, height 0.4s ease;
        }

        .desktop-header .header-center a:hover::before,
        .desktop-header .header-center a.active::before {
            width: 100%; height: 100%;
        }

        .header-right-zone { display: flex; align-items: center; gap: 16px; }

        .stay-post-property-btn {
            display: inline-flex;
            align-items: center;
            gap: 9px;
            background: linear-gradient(135deg, #ffffff 0%, #fef3c7 100%);
            color: #92400e;
            padding: 9px 20px;
            border-radius: 50px;
            font-size: 13px;
            font-weight: 700;
            text-decoration: none;
            border: 1.5px solid #f59e0b;
        }

        /* Mobile Bottom Nav with Shining Logo */
        .mobile-bottom-nav {
            display: none;
            position: fixed;
            bottom: 0; left: 0; right: 0;
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
            width: 64px; height: 48px;
            border-radius: 8px;
            gap: 4px;
        }

        .nav-item i { font-size: 20px; }
        .nav-item.active { color: var(--brand-maroon); background-color: rgba(128, 0, 32, 0.05); }

        .logo-shine-wrapper {
            position: relative;
            width: 28px; height: 28px;
            border-radius: 50%;
            overflow: hidden;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #ffffff;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 1);
        }

        .animated-logo { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }

        .logo-shine-wrapper::after {
            content: '';
            position: absolute;
            top: -50%; left: -150%;
            width: 50%; height: 200%;
            background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%);
            transform: rotate(30deg);
            animation: logoShineEffect 3s infinite ease-in-out;
        }

        @keyframes logoShineEffect {
            0% { left: -150%; }
            30% { left: 150%; }
            100% { left: 150%; }
        }

        @media (max-width: 768px) {
            .desktop-header { padding: 12px; }
            .desktop-header .header-center { display: none; }
            .stay-post-property-btn span { display: none; }
            .mobile-bottom-nav { display: flex; }
            body { padding-bottom: 64px; }
        }
    `;
    document.head.appendChild(styleElement);
};

class LayoutEngine {
    constructor() {
        this.currentActivePage = "home";
        this.availableCities = [
            { id: "all", name: "All Cities", icon: "🌍" },
            { id: "jaipur", name: "Jaipur", icon: "🏛️" }, 
            { id: "delhi", name: "Delhi", icon: "🕌" }, 
            { id: "gurugram", name: "Gurugram", icon: "🏢" }
        ];
        this.selectedCity = localStorage.getItem('staypremium_selected_city') || "all";
        injectGlobalStyles();
    }

    init(explicitContext = null) {
        this.evaluateRoutingContext(explicitContext);
        this.renderHeaderDOM();
        this.renderFooterDOM();
        this.synchronizeUIPipeline();
        this.initPageTransitions();
    }

    evaluateRoutingContext(overrideContext) {
        const path = window.location.pathname.toLowerCase();
        if (overrideContext) {
            this.currentActivePage = overrideContext;
            return;
        }
        if (path.includes('pg.html')) this.currentActivePage = "pg";
        else if (path.includes('room.html')) this.currentActivePage = "rooms";
        else if (path.includes('saved.html')) this.currentActivePage = "saved";
        else if (path.includes('profile.html')) this.currentActivePage = "profile";
        else this.currentActivePage = "home";
    }

    renderHeaderDOM() {
        const container = document.getElementById('dynamic-header-container');
        if (!container) return;
        container.innerHTML = `
            <header class="desktop-header">
                <div class="header-left-zone">
                    <a href="index.html" class="logo-link">
                        <img src="assets/stay100.png" alt="Logo" class="logo-image">
                    </a>
                </div>
                <nav class="header-center">
                    <a href="index.html" class="nav-link-item" data-page="home">HOME</a>
                    <a href="pg.html" class="nav-link-item" data-page="pg">PG's</a>
                    <a href="room.html" class="nav-link-item" data-page="rooms">ROOMS</a>
                </nav>
                <div class="header-right-zone">
                    <a href="post-property.html" class="stay-post-property-btn">
                        <i class="fa-solid fa-circle-plus"></i>
                        <span>Post Property</span>
                    </a>
                </div>
            </header>
        `;
    }

    renderFooterDOM() {
        const container = document.getElementById('dynamic-footer-container');
        if (!container) return;
        container.innerHTML = `
            <nav class="mobile-bottom-nav">
                <a href="index.html" class="nav-item" data-page="home">
                    <div class="logo-shine-wrapper">
                        <img src="assets/dp.png" alt="Home" class="animated-logo">
                    </div>
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
                <a href="profile.html" class="nav-item" data-page="profile">
                    <i class="fa-solid fa-user"></i>
                    <span>Profile</span>
                </a>
            </nav>
        `;
    }

    synchronizeUIPipeline() {
        document.querySelectorAll('.nav-link-item, .nav-item').forEach(el => {
            el.classList.toggle('active', el.dataset.page === this.currentActivePage);
        });
    }

    // --- App-like Transition Handler ---
    initPageTransitions() {
        // Page load hone par fade-in animation ke liye class remove karein
        setTimeout(() => {
            document.body.classList.remove('page-transitioning');
        }, 50);

        // Saare internal links par click intercept karein
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            // Agar link valid hai, external ya anchor (#) nahi hai, toh smooth transition trigger karein
            if (href && !href.startsWith('http') && !href.startsWith('#') && !link.hasAttribute('target')) {
                e.preventDefault();
                document.body.classList.add('page-transitioning');
                setTimeout(() => {
                    window.location.href = href;
                }, 300); // Animation duration ke sath match karega
            }
        });
    }
}

window.LayoutEngine = new LayoutEngine();
document.addEventListener('DOMContentLoaded', () => {
    window.LayoutEngine.init();
});