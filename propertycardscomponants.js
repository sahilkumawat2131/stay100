/**
 * StayPremium - Unified Property Card UI Component Engine (Upgraded & Verified Version)
 * Extended with Desktop & Mobile Support for "Recommended", "Popular", "Latest Rent", and "Trending".
 * Upgraded with Inline 4K Auto-Play Property Video Node Support before Image Sequences.
 */

// Global Property Card Component Module
window.PropertyCardComponent = {
    // Registered interval map for background memory cleaning of active autoswipers
    _activeSwipers: new Map(),

    /**
     * Component ke default aur upgraded CSS styles ko document head me inject karta hai (Sirf ek baar)
     */
    injectStyles: function() {
        if (document.getElementById('staypremium-card-core-styles')) return;

        const styleBlock = document.createElement('style');
        styleBlock.id = 'staypremium-card-core-styles';
        styleBlock.innerHTML = `
            /* ========================================================================= */
            /* PREMIUM CORE DESIGN TOKENS (GLOBAL VARIABLES FOR EASY CUSTOMIZATION)       */
            /* ========================================================================= */
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

            :root {
                --primary-burgundy: #800020;
                --primary-olive: #808000;
                --text-main: #0f172a;
                --text-muted: #64748b;
                --bg-slate: #f1f5f9;
                --border-color: #e2e8f0;
                --radius-lg: 16px;
                --radius-md: 8px;
                --shadow-sm: 0 4px 12px rgba(15, 23, 42, 0.05);
                --shadow-lg: 0 16px 36px rgba(15, 23, 42, 0.12);
                --transition-smooth: all 0.35s cubic-bezier(0.25, 1, 0.5, 1);
            }

            /* Property Card Base Blueprint - Upgraded Fluid Scale */
            .property-card {
                background: #ffffff;
                border-radius: var(--radius-lg);
                overflow: hidden;
                box-shadow: var(--shadow-sm);
                transition: var(--transition-smooth);
                display: flex;
                flex-direction: column;
                height: 100%;
                border: 1px solid var(--border-color);
                font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
                isolation: isolate; /* Creates local stacking context for badges */
            }
            .property-card:hover {
                transform: translateY(-6px);
                box-shadow: var(--shadow-lg);
                border-color: #cbd5e1;
            }
            
            /* Advanced Multi-Image/Video Carousel Track Structure */
            .image-container {
                position: relative;
                width: 100%;
                padding-top: 65%; /* 16:10 Aspect Ratio Wrapper */
                background: var(--bg-slate);
                overflow: hidden;
            }

            /* Gradient Scrim Overlay for ultimate contrast readability */
            .image-container::after {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.5) 100%);
                z-index: 1;
                pointer-events: none;
            }

            .carousel-viewport-track {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); /* Ultra luxury easing */
            }
            .carousel-slide-node {
                min-width: 100%;
                height: 100%;
                position: relative;
            }
            .carousel-slide-node img, .carousel-slide-node video {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transform: scale(1);
                transition: transform 0.7s ease;
            }
            .property-card:hover .carousel-slide-node img, .property-card:hover .carousel-slide-node video {
                transform: scale(1.03); /* Subtle cinematic zoom on hover */
            }
            
            /* Carousel Navigation Arrow Overlays */
            .carousel-nav-arrow {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                color: #1e293b;
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 5;
                font-size: 12px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.15);
                opacity: 0;
                transition: var(--transition-smooth);
            }
            .image-container:hover .carousel-nav-arrow {
                opacity: 1;
            }
            .carousel-nav-arrow:hover {
                background: #ffffff;
                color: #000000;
                transform: translateY(-50%) scale(1.1);
            }
            .arrow-prev-left { left: 12px; }
            .arrow-next-right { right: 12px; }

            /* Carousel Bottom Dots Indicators */
            .carousel-dots-indicator-bar {
                position: absolute;
                bottom: 12px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 6px;
                z-index: 6;
                background: rgba(15, 23, 42, 0.4);
                padding: 5px 10px;
                border-radius: 20px;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                border: 1px solid rgba(255,255,255,0.1);
            }
            .carousel-dot-bubble {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.4);
                transition: var(--transition-smooth);
                cursor: pointer;
            }
            .carousel-dot-bubble.active-slide {
                background: #ffffff;
                width: 16px;
                border-radius: 4px;
            }

            /* Dynamic Overlay Badge Layout System */
            .offer-badge {
                position: absolute;
                top: 12px;
                background: #ef4444;
                color: #ffffff;
                padding: 5px 10px;
                font-size: 10px;
                font-weight: 800;
                border-radius: 6px;
                z-index: 2;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }

            /* PROPERTY TYPE LEFT SIDE BADGE SPECIFICATION */
            .property-type-tag-left-badge {
                position: absolute;
                top: 12px;
                left: 12px;
                z-index: 10;
                background: #0f172a;
                color: #ffffff;
                font-size: 11px;
                font-weight: 800;
                padding: 5px 10px;
                border-radius: 6px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.25);
                border: 1px solid rgba(255,255,255,0.15);
                font-family: 'Plus Jakarta Sans', sans-serif;
            }

            /* Floating Save Interaction Trigger */
            .card-save-trigger {
                position: absolute;
                top: 12px;
                right: 12px;
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 4;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                transition: var(--transition-smooth);
            }
            .card-save-trigger:hover {
                background: #ffffff;
                transform: scale(1.08);
            }
            .card-save-trigger:active {
                transform: scale(0.92);
            }

            /* Views Live Counter Overlay */
            .views-counter-pill {
                position: absolute;
                bottom: 12px;
                left: 12px;
                background: rgba(15, 23, 42, 0.8);
                color: #ffffff;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 5px;
                z-index: 2;
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            /* Card Content Layout Hierarchy */
            .card-details {
                padding: 18px;
                display: flex;
                flex-direction: column;
                flex-grow: 1;
                gap: 6px;
            }
            .price-row {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 8px;
            }
            .final-price {
                font-size: 20px;
                font-weight: 800;
                color: var(--primary-olive);
                letter-spacing: -0.5px;
            }
            .mrp {
                font-size: 14px;
                color: var(--text-muted);
                text-decoration: line-through;
            }
            .saved-text {
                font-size: 11px;
                background: #f0fdf4;
                color: #16a34a;
                padding: 2px 8px;
                border-radius: 4px;
                font-weight: 700;
                border: 1px solid rgba(22, 163, 74, 0.1);
            }
            .property-name {
                margin: 4px 0 2px 0;
                font-size: 16px;
                font-weight: 700;
                color: var(--text-main);
                line-height: 1.4;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            .rating-row {
                color: #ffb300;
                font-size: 13px;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            .review-count {
                color: var(--text-muted);
                font-size: 12px;
                font-weight: 400;
            }
            .location-text {
                font-size: 13px;
                color: #475569;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            .map-link {
                font-size: 12px;
                color: #0288d1;
                text-decoration: none;
                font-weight: 600;
                width: fit-content;
                transition: color 0.2s;
            }
            .map-link:hover {
                color: #01579b;
                text-decoration: underline;
            }

            /* Amenities Micro Chips Grid */
            .facilities-grid {
                margin-top: auto;
                padding-top: 14px;
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }
            .amenity-tag {
                background: var(--bg-slate);
                color: #334155;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 12px;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                font-weight: 600;
                border: 1px solid rgba(0, 0, 0, 0.02);
            }

            /* Action Controls Layout Matrix */
            .card-actions {
                margin-top: 14px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }
            .card-actions button {
                padding: 11px;
                font-size: 13.5px;
                font-weight: 700;
                border-radius: var(--radius-md);
                cursor: pointer;
                border: none;
                transition: var(--transition-smooth);
            }
            .btn-card-outline {
                background: #ffffff;
                color: #475569;
                border: 1px solid #cbd5e1 !important;
            }
            .btn-card-outline:hover {
                background: var(--bg-slate);
                color: var(--text-main);
                border-color: #94a3b8 !important;
            }
            .btn-card-mehrum {
                background: var(--primary-burgundy);
                color: #ffffff;
                box-shadow: 0 4px 12px rgba(128, 0, 32, 0.15);
            }
            .btn-card-mehrum:hover {
                opacity: 0.95;
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(128, 0, 32, 0.25);
            }

            /* Shimmer Premium Glint Verification Badge Effect */
            .premium-verified-container {
                position: relative;
                display: inline-block;
                vertical-align: middle;
                margin-left: 6px;
                width: 18px;
                height: 18px; 
                border-radius: 50%;
                overflow: hidden;
                transform: translateY(-2px);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .premium-verified-badge {
                width: 100%;
                height: 100%;
                object-fit: contain;
                display: block;
            }
            .sunlight-reflection-sweep {
                position: absolute;
                top: -50%;
                left: -150%;
                width: 50%;
                height: 200%;
                background: linear-gradient(
                    90deg, 
                    rgba(255, 255, 255, 0) 0%, 
                    rgba(255, 255, 255, 0.5) 30%, 
                    rgba(255, 255, 255, 0.8) 50%, 
                    rgba(255, 255, 255, 0.5) 70%, 
                    rgba(255, 255, 255, 0) 100%
                );
                transform: rotate(25deg);
                animation: professionalGlint 3.5s infinite ease-in-out;
            }
            @keyframes professionalGlint {
                0% { left: -150%; }
                20% { left: 150%; }
                100% { left: 150%; }
            }

            /* ========================================================================= */
            /* UPGRADED LANDSCAPE SLIDER SYSTEM (DESKTOP FLEX-TRACK LAYOUT)              */
            /* ========================================================================= */
            .staypremium-desktop-section {
                display: block;
                margin: 40px 0;
                padding: 0 15px;
            }
            .section-header-title {
                font-size: 26px;
                font-weight: 800;
                color: var(--text-main);
                margin-bottom: 24px;
                display: flex;
                align-items: center;
                gap: 10px;
                letter-spacing: -0.5px;
            }
            .landscape-viewport-wrapper {
                position: relative;
                overflow: hidden;
                width: 100%;
            }
            .landscape-scroll-track {
                display: flex;
                gap: 24px;
                overflow-x: auto;
                scroll-behavior: smooth;
                padding: 10px 4px 20px 4px;
                scrollbar-width: none;
            }
            .landscape-scroll-track::-webkit-scrollbar {
                display: none;
            }

            /* Elite Horizontal Card Design */
            .premium-landscape-card {
                flex: 0 0 620px; /* Slightly widened for better horizontal breathing space */
                display: flex;
                background: #ffffff;
                border-radius: var(--radius-lg);
                overflow: hidden;
                border: 1px solid var(--border-color);
                box-shadow: var(--shadow-sm);
                transition: var(--transition-smooth);
            }
            .premium-landscape-card:hover {
                transform: translateY(-4px) scale(1.01);
                box-shadow: var(--shadow-lg);
                border-color: #cbd5e1;
            }
            .premium-landscape-card .image-container {
                width: 42%;
                padding-top: 0;
                height: auto;
                min-height: 260px;
            }
            .premium-landscape-card .property-type-tag-left-badge {
                font-size: 10px;
                padding: 4px 8px;
                border-radius: 5px;
            }
            .premium-landscape-card .card-details {
                width: 58%;
                padding: 20px;
            }

            /* Responsive Breakpoint Matrix */
            @media (max-width: 768px) {
                .premium-landscape-card {
                    flex: 0 0 340px;
                    flex-direction: column;
                }
                .premium-landscape-card .image-container {
                    width: 100%;
                    padding-top: 65%;
                    min-height: auto;
                }
                .premium-landscape-card .card-details {
                    width: 100%;
                }
            }
            
            .landscape-nav-btn {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: #ffffff;
                border: 1px solid var(--border-color);
                width: 46px;
                height: 46px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10;
                box-shadow: 0 6px 16px rgba(0,0,0,0.08);
                transition: var(--transition-smooth);
                color: var(--text-main);
                font-size: 16px;
            }
            .landscape-nav-btn:hover {
                background: var(--text-main);
                color: #ffffff;
                border-color: var(--text-main);
                box-shadow: 0 8px 20px rgba(15, 23, 42, 0.2);
            }
            .landscape-nav-btn:active {
                transform: translateY(-50%) scale(0.95);
            }
            .landscape-prev { left: 8px; }
            .landscape-next { right: 8px; }
            
            /* Modern Vibrant Gradients for dynamic tags */
            .tag-latest-rent { background: linear-gradient(135deg, #008080, #004d4d) !important; }
            .tag-trending { background: linear-gradient(135deg, #ff4500, #cc3700) !important; }
            .tag-recommended { background: linear-gradient(135deg, #4f46e5, #3730a3) !important; }
            .tag-popular { background: linear-gradient(135deg, #db2777, #a21caf) !important; }
        `;
        document.head.appendChild(styleBlock);
    },

    
    render: function(post, savedItemsList = []) {
        this.injectStyles();
        const heading = post.name || post.title || "Premium Rental Space";
        const currentRent = post.price || post.rent || "Contact Host";
        const microLoc = post.location || post.area || "Location details pending";
        
        let baseImg = post.image || post.imageUrl || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af";
        if (baseImg.includes("unsplash.com") && !baseImg.includes("q=")) {
            baseImg = `${baseImg.split('?')[0]}?auto=format&fit=crop&w=600&q=90`;
        }

        let imagesArray = post.allImages || [baseImg];
        if (!Array.isArray(imagesArray)) imagesArray = [imagesArray];
        imagesArray = imagesArray.map(url => {
            if (typeof url === 'string' && url.includes("unsplash.com") && !url.includes("q=")) {
                return `${url.split('?')[0]}?auto=format&fit=crop&w=600&q=90`;
            }
            return url;
        });

        const rawCityNode = (post.city || post.location || "global").toLowerCase().trim();
        const deltaSavings = (post.mrp || 0) - (parseInt(currentRent) || 0);
        const isBookmarked = savedItemsList.includes(post.id);
        const isVerified = post.isVerified === true || post.isVerified === "true" || post.verified === true || post.verified === "true" || post.isVendorVerified === true;
        
        const inlineVerificationBadge = isVerified 
            ? `<div class="premium-verified-container" 
                style="position: relative; display: inline-block; cursor: pointer;"
                onmouseenter="this.querySelector('.badge-hover-tooltip').style.display='block'"
                onmouseleave="this.querySelector('.badge-hover-tooltip').style.display='none'">
               
               <img src="assets/verified-baidge.png" alt="Stay100% Verified" class="premium-verified-badge" style="display: block;">
               <span class="sunlight-reflection-sweep"></span>
               
               <div class="badge-hover-tooltip" style="
                   display: none;
                   position: absolute;
                   bottom: 125%;
                   left: 50%;
                   transform: translateX(-50%);
                   background-color: rgba(0, 0, 0, 0.85);
                   color: #fff;
                   padding: 6px 12px;
                   border-radius: 4px;
                   font-size: 13px;
                   font-family: sans-serif;
                   white-space: nowrap;
                   z-index: 999;
                   box-shadow: 0 4px 6px rgba(0,0,0,0.1);
               ">
                   <span>Verified Badge.</span>
                   <a href="#" onclick="openVerificationPopup(event)" style="
                       color: #00d2ff;
                       text-decoration: underline;
                       margin-left: 6px;
                   ">Learn more</a>
               </div>
           </div>` 
            : '';

        let amenitiesHTML = '';
        if (post.wifi || (Array.isArray(post.amenities) && post.amenities.includes("High Speed Wi-Fi"))) amenitiesHTML += `<span class="amenity-tag"><i class="fa-solid fa-wifi"></i> Wifi</span>`;
        if (post.ac || (Array.isArray(post.amenities) && post.amenities.includes("Air Conditioner"))) amenitiesHTML += `<span class="amenity-tag"><i class="fa-solid fa-snowflake"></i> AC</span>`;
        if (post.food || post.mess || post.foodIncluded || (Array.isArray(post.amenities) && post.amenities.includes("Homely Food"))) amenitiesHTML += `<span class="amenity-tag"><i class="fa-solid fa-utensils"></i> Food</span>`;
        if (post.parking || (Array.isArray(post.amenities) && post.amenities.includes("Vehicle Parking"))) amenitiesHTML += `<span class="amenity-tag"><i class="fa-solid fa-car"></i> Parking</span>`;

        let slidesHTML = '';
        let dotsHTML = '';
        let mediaNodeCount = 0;

        if (post.videoUrl && post.videoUrl.trim() !== "") {
            slidesHTML += `
                <div class="carousel-slide-node" data-media-type="video">
                    <video src="${post.videoUrl}" autoplay muted loop playsinline preload="auto" width="100%" height="100%"></video>
                </div>
            `;
            dotsHTML += `<span class="carousel-dot-bubble active-slide" data-target-idx="0"><i class="fa-solid fa-play" style="font-size:5px; vertical-align:middle; display:block; text-align:center; line-height:6px; color:#fff;"></i></span>`;
            mediaNodeCount++;
        }

        imagesArray.forEach((imgUrl, idx) => {
            const calculatedIndex = mediaNodeCount;
            slidesHTML += `
                <div class="carousel-slide-node" data-media-type="image">
                    <img src="${imgUrl}" alt="${heading} view image" loading="${calculatedIndex === 0 ? 'eager' : 'lazy'}">
                </div>
            `;
            const isFirstNodeTotal = calculatedIndex === 0;
            dotsHTML += `<span class="carousel-dot-bubble ${isFirstNodeTotal ? 'active-slide' : ''}" data-target-idx="${calculatedIndex}"></span>`;
            mediaNodeCount++;
        });

        const sliderInstanceKey = `slider-${post.id.replace(/[^a-zA-Z0-9]/g, '')}`;

        function determineNormalizedPropertyType(postObject) {
            let configTag = "";
            const titleStr = (postObject.name || postObject.title || "").toLowerCase();
            const flatTypeStr = (postObject.flatType || "").toLowerCase();
            const typeStr = (postObject.type || "").toLowerCase();
            const categoryStr = (postObject.category || "").toLowerCase();

            if (flatTypeStr.includes("1rk") || titleStr.includes("1rk") || titleStr.includes("1r k") || typeStr.includes("1rk")) {
                configTag = "1 RK";
            } else if (flatTypeStr.includes("1bhk") || titleStr.includes("1bhk") || titleStr.includes("1 bhk") || typeStr.includes("1bhk")) {
                configTag = "1 BHK";
            } else if (flatTypeStr.includes("2bhk") || titleStr.includes("2bhk") || titleStr.includes("2 bhk") || typeStr.includes("2bhk")) {
                configTag = "2 BHK";
            } else if (flatTypeStr.includes("3bhk") || titleStr.includes("3bhk") || titleStr.includes("3 bhk") || typeStr.includes("3bhk")) {
                configTag = "3 BHK";
            } else if (flatTypeStr.includes("4bhk") || titleStr.includes("4bhk") || titleStr.includes("4 bhk") || typeStr.includes("4bhk")) {
                configTag = "4 BHK";
            }

            let furnishingTag = "";
            if (postObject.furnished === true || String(postObject.furnished).toLowerCase() === 'true' || titleStr.includes("fully furnished") || flatTypeStr.includes("fully furnished") || typeStr.includes("fully furnished")) {
                furnishingTag = "Fully Furnished";
            } else if (titleStr.includes("furnished") || flatTypeStr.includes("furnished") || typeStr.includes("furnished") || categoryStr.includes("furnished")) {
                furnishingTag = "Furnished";
            }

            if (configTag && furnishingTag) return `${configTag} • ${furnishingTag}`;
            if (configTag) return configTag;
            if (furnishingTag) return furnishingTag;

            if (categoryStr.includes("flat") || typeStr.includes("flat") || titleStr.includes("flat") || flatTypeStr.includes("flat")) {
                return "PREMIUM FLAT";
            } else if (categoryStr.includes("room") || typeStr.includes("room") || titleStr.includes("room") || flatTypeStr.includes("room")) {
                return "PREMIUM ROOM";
            }

            return (postObject.flatType || postObject.category || postObject.type || "PREMIUM SPACE").toUpperCase();
        }

        const calculatedPropertyType = determineNormalizedPropertyType(post);

        return `
            <div class="property-card" data-city="${rawCityNode}" id="card-root-${sliderInstanceKey}">
                <div class="image-container" id="${sliderInstanceKey}">
                    <span class="property-type-tag-left-badge">${calculatedPropertyType}</span>
                    ${post.badge ? `<span class="offer-badge" style="right: 12px; left: auto;">${post.badge}</span>` : ''}
                    <button class="card-save-trigger" data-save-id="${post.id}" style="background:${isBookmarked ? '#fee2e2' : 'rgba(255,255,255,0.9)'};">
                        <i class="${isBookmarked ? 'fa-solid' : 'fa-regular'} fa-bookmark" style="font-size:15px; color:${isBookmarked ? '#ef4444' : '#475569'};"></i>
                    </button>
                    <div class="carousel-viewport-track">${slidesHTML}</div>
                    ${mediaNodeCount > 1 ? `
                        <button class="carousel-nav-arrow arrow-prev-left" type="button"><i class="fa-solid fa-chevron-left"></i></button>
                        <button class="carousel-nav-arrow arrow-next-right" type="button"><i class="fa-solid fa-chevron-right"></i></button>
                        <div class="carousel-dots-indicator-bar">${dotsHTML}</div>
                    ` : ''}
                    <div class="views-counter-pill">
                        <i class="fa-solid fa-eye" style="color:#00bcd4;"></i>
                        <span>${post.views || 0}</span>
                    </div>
                </div>
                <div class="card-details">
                    <div class="price-row">
                        ${post.mrp ? `<span class="mrp">₹${post.mrp}</span>` : ''}
                        <span class="final-price">₹${currentRent}/mo</span>
                        ${deltaSavings > 0 ? `<span class="saved-text">Saved ₹${deltaSavings}</span>` : ''}
                    </div>
                    <h4 class="property-name"><span>${heading}</span>${inlineVerificationBadge}</h4>
                    <div class="rating-row">
                        <i class="fa-solid fa-star"></i> ${post.rating || '4.4'} 
                        <span class="review-count">(${post.reviewsCount || 0} reviews)</span>
                    </div>
                    
                    <p class="location-text" onclick="PropertyCardComponent.openLocationNavigation(event, '${encodeURIComponent(microLoc)}')">
                        <i class="fa-solid fa-location-dot" style="color:#556b2f;"></i> 
                        <span>${microLoc}</span>
                    </p>
                    
                    <div class="facilities-grid">${amenitiesHTML}</div>
                    <div class="card-actions">
                        <button class="btn-card-outline" data-view-id="${post.id}">View Details</button>
                        <button class="btn-card-mehrum" data-inquiry-id="${post.id}">Inquiry Now</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * UNIQUE ELITE RENDER ENGINE FOR LANDSCAPE ROW CARDS
     */
    renderLandscapeCard: function(post, customBadgeType, savedItemsList = []) {
        this.injectStyles();
        const heading = post.name || post.title || "Premium Rental Space";
        const currentRent = post.price || post.rent || "Contact Host";
        const microLoc = post.location || post.area || "Location details pending";
        const isBookmarked = savedItemsList.includes(post.id);
        
        let baseImg = post.image || post.imageUrl || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af";
        let imagesArray = post.allImages || [baseImg];
        if (!Array.isArray(imagesArray)) imagesArray = [imagesArray];

        let slidesHTML = '';
        let mediaNodeCount = 0;

        if (post.videoUrl && post.videoUrl.trim() !== "") {
            slidesHTML += `
                <div class="carousel-slide-node" data-media-type="video">
                    <video src="${post.videoUrl}" autoplay muted loop playsinline preload="auto" width="100%" height="100%"></video>
                </div>
            `;
            mediaNodeCount++;
        }

        imagesArray.forEach((imgUrl) => {
            slidesHTML += `
                <div class="carousel-slide-node" data-media-type="image">
                    <img src="${imgUrl}" alt="${heading}">
                </div>
            `;
            mediaNodeCount++;
        });

        const sliderInstanceKey = `slider-landscape-${post.id.replace(/[^a-zA-Z0-9]/g, '')}`;
        
        let badgeClass = 'tag-latest-rent';
        let badgeLabel = 'New Launch';
        if (customBadgeType === 'TRENDING') { badgeClass = 'tag-trending'; badgeLabel = 'Trending 🔥'; }
        else if (customBadgeType === 'RECOMMENDED') { badgeClass = 'tag-recommended'; badgeLabel = 'Recommended 🌟'; }
        else if (customBadgeType === 'POPULAR') { badgeClass = 'tag-popular'; badgeLabel = 'Popular ✨'; }

        function determineNormalizedPropertyType(postObject) {
            let configTag = "";
            const titleStr = (postObject.name || postObject.title || "").toLowerCase();
            const flatTypeStr = (postObject.flatType || "").toLowerCase();
            const typeStr = (postObject.type || "").toLowerCase();
            const categoryStr = (postObject.category || "").toLowerCase();

            if (flatTypeStr.includes("1rk") || titleStr.includes("1rk") || titleStr.includes("1r k") || typeStr.includes("1rk")) {
                configTag = "1 RK";
            } else if (flatTypeStr.includes("1bhk") || titleStr.includes("1bhk") || titleStr.includes("1 bhk") || typeStr.includes("1bhk")) {
                configTag = "1 BHK";
            } else if (flatTypeStr.includes("2bhk") || titleStr.includes("2bhk") || titleStr.includes("2 bhk") || typeStr.includes("2bhk")) {
                configTag = "2 BHK";
            } else if (flatTypeStr.includes("3bhk") || titleStr.includes("3bhk") || titleStr.includes("3 bhk") || typeStr.includes("3bhk")) {
                configTag = "3 BHK";
            } else if (flatTypeStr.includes("4bhk") || titleStr.includes("4bhk") || titleStr.includes("4 bhk") || typeStr.includes("4bhk")) {
                configTag = "4 BHK";
            }

            let furnishingTag = "";
            if (postObject.furnished === true || String(postObject.furnished).toLowerCase() === 'true' || titleStr.includes("fully furnished") || flatTypeStr.includes("fully furnished") || typeStr.includes("fully furnished")) {
                furnishingTag = "Fully Furnished";
            } else if (titleStr.includes("furnished") || flatTypeStr.includes("furnished") || typeStr.includes("furnished") || categoryStr.includes("furnished")) {
                furnishingTag = "Furnished";
            }

            if (configTag && furnishingTag) return `${configTag} • ${furnishingTag}`;
            if (configTag) return configTag;
            if (furnishingTag) return furnishingTag;

            if (categoryStr.includes("flat") || typeStr.includes("flat") || titleStr.includes("flat") || flatTypeStr.includes("flat")) {
                return "PREMIUM FLAT";
            } else if (categoryStr.includes("room") || typeStr.includes("room") || titleStr.includes("room") || flatTypeStr.includes("room")) {
                return "PREMIUM ROOM";
            }

            return (postObject.flatType || postObject.category || postObject.type || "PREMIUM SPACE").toUpperCase();
        }

        const calculatedPropertyType = determineNormalizedPropertyType(post);

        return `
            <div class="premium-landscape-card" id="card-root-${sliderInstanceKey}">
                <div class="image-container" id="${sliderInstanceKey}">
                    <span class="property-type-tag-left-badge">${calculatedPropertyType}</span>
                    <span class="offer-badge ${badgeClass}" style="right: 12px; left: auto;">${badgeLabel}</span>
                    <button class="card-save-trigger" data-save-id="${post.id}" style="background:${isBookmarked ? '#fee2e2' : 'rgba(255,255,255,0.9)'};">
                        <i class="${isBookmarked ? 'fa-solid' : 'fa-regular'} fa-bookmark" style="color:${isBookmarked ? '#ef4444' : '#475569'};"></i>
                    </button>
                    <div class="carousel-viewport-track">${slidesHTML}</div>
                    ${mediaNodeCount > 1 ? `
                        <button class="carousel-nav-arrow arrow-prev-left" type="button"><i class="fa-solid fa-chevron-left"></i></button>
                        <button class="carousel-nav-arrow arrow-next-right" type="button"><i class="fa-solid fa-chevron-right"></i></button>
                    ` : ''}
                    <div class="views-counter-pill">
                        <i class="fa-solid fa-eye" style="color:#00bcd4;"></i>
                        <span>${post.views || 0} Views ${post.videoUrl ? '• 🎥 Video' : ''}</span>
                    </div>
                </div>
                <div class="card-details">
                    <div>
                        <div class="price-row">
                            <span class="final-price">₹${currentRent}/mo</span>
                        </div>
                        <h4 class="property-name" style="margin-top: 4px;">${heading}</h4>
                        <div class="rating-row">
                            <i class="fa-solid fa-star"></i> ${post.rating || '4.5'}
                        </div>
                        
                        <p class="location-text" style="margin-top: 6px;" onclick="PropertyCardComponent.openLocationNavigation(event, '${encodeURIComponent(microLoc)}')">
                            <i class="fa-solid fa-location-dot"></i> ${microLoc}
                        </p>
                        
                    </div>
                    <div class="card-actions">
                        <button class="btn-card-outline" data-view-id="${post.id}">Details</button>
                        <button class="btn-card-mehrum" data-inquiry-id="${post.id}">Inquiry</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * COMPILER SECTION HTML GENERATOR
     */
    generateLandscapeSectionHTML: function(sectionTitle, propertiesList, modeType = 'LATEST', savedItemsList = []) {
        if(!propertiesList || propertiesList.length === 0) return '';
        
        let processedPool = [...propertiesList];
        
        if(modeType === 'LATEST') {
            processedPool.sort((a,b) => (parseInt(a.price || a.rent || 0) - parseInt(b.price || b.rent || 0)));
        } else if(modeType === 'TRENDING') {
            processedPool.sort((a,b) => (parseInt(b.views || 0) - parseInt(a.views || 0)));
        } else if(modeType === 'RECOMMENDED') {
            processedPool.sort((a,b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
        } else if(modeType === 'POPULAR') {
            processedPool.sort((a,b) => parseInt(b.reviewsCount || 0) - parseInt(a.reviewsCount || 0));
        }

        const uniqueTrackId = `track-container-${modeType.toLowerCase()}`;
        let landscapeCardsHTML = '';
        
        processedPool.forEach(property => {
            landscapeCardsHTML += this.renderLandscapeCard(property, modeType, savedItemsList);
        });

        return `
            <div class="staypremium-desktop-section">
                <h3 class="section-header-title">
                    ${modeType === 'RECOMMENDED' ? '🌟' : modeType === 'POPULAR' ? '✨' : modeType === 'LATEST' ? '💎' : '🔥'} ${sectionTitle}
                </h3>
                <div class="landscape-viewport-wrapper">
                    <button class="landscape-nav-btn landscape-prev" onclick="document.getElementById('${uniqueTrackId}').scrollLeft -= 500"><i class="fa-solid fa-chevron-left"></i></button>
                    <div class="landscape-scroll-track" id="${uniqueTrackId}">
                        ${landscapeCardsHTML}
                    </div>
                    <button class="landscape-nav-btn landscape-next" onclick="document.getElementById('${uniqueTrackId}').scrollLeft += 500"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
            </div>
        `;
    },

    /**
     * RUN-TIME IMAGE/VIDEO SLIDER CONTROLLER
     */
    initAutoswipe: function() {
        const structuralContainers = document.querySelectorAll('.image-container[id^="slider-"]');
        
        structuralContainers.forEach(container => {
            if(container.getAttribute('data-slider-mounted') === 'true') return;
            container.setAttribute('data-slider-mounted', 'true');

            const trackingTrack = container.querySelector('.carousel-viewport-track');
            const totalSlidesCount = container.querySelectorAll('.carousel-slide-node').length;
            if(!trackingTrack || totalSlidesCount <= 1) return;

            let structuralActiveIndex = 0;
            let autoswipeEngineInterval = null;

            function shiftToTargetIndex(targetIdx) {
                if(targetIdx >= totalSlidesCount) structuralActiveIndex = 0;
                else if(targetIdx < 0) structuralActiveIndex = totalSlidesCount - 1;
                else structuralActiveIndex = targetIdx;

                trackingTrack.style.transform = `translateX(-${structuralActiveIndex * 100}%)`;
                
                const dotsNodes = container.querySelectorAll('.carousel-dot-bubble');
                dotsNodes.forEach((dot, dIdx) => {
                    if(dIdx === structuralActiveIndex) {
                        dot.classList.add('active-slide');
                    } else {
                        dot.classList.remove('active-slide');
                    }
                });

                const currentSlideNode = container.querySelectorAll('.carousel-slide-node')[structuralActiveIndex];
                if (currentSlideNode && currentSlideNode.getAttribute('data-media-type') === 'video') {
                    const videoTag = currentSlideNode.querySelector('video');
                    if (videoTag) {
                        videoTag.currentTime = 0;
                        videoTag.play().catch(e => console.log('Autoplay deferred:', e));
                        breakTimerLoop();
                    }
                } else {
                    initializeTimerLoop();
                }
            }

            function initializeTimerLoop() {
                const currentSlideNode = container.querySelectorAll('.carousel-slide-node')[structuralActiveIndex];
                if (currentSlideNode && currentSlideNode.getAttribute('data-media-type') === 'video') return;

                if(autoswipeEngineInterval) clearInterval(autoswipeEngineInterval);
                autoswipeEngineInterval = setInterval(() => {
                    shiftToTargetIndex(structuralActiveIndex + 1);
                }, 3500);
            }

            function breakTimerLoop() {
                if(autoswipeEngineInterval) clearInterval(autoswipeEngineInterval);
            }

            container.querySelector('.arrow-next-right')?.addEventListener('click', (e) => {
                e.stopPropagation();
                shiftToTargetIndex(structuralActiveIndex + 1);
            });

            container.querySelector('.arrow-prev-left')?.addEventListener('click', (e) => {
                e.stopPropagation();
                shiftToTargetIndex(structuralActiveIndex - 1);
            });

            container.querySelectorAll('.carousel-dot-bubble').forEach(dot => {
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const indexingTarget = parseInt(dot.getAttribute('data-target-idx'));
                    shiftToTargetIndex(indexingTarget);
                });
            });

            container.addEventListener('mouseenter', breakTimerLoop);
            container.addEventListener('mouseleave', initializeTimerLoop);

            const initialNode = container.querySelectorAll('.carousel-slide-node')[0];
            if (initialNode && initialNode.getAttribute('data-media-type') === 'video') {
                const video = initialNode.querySelector('video');
                if(video) video.play().catch(err => console.log(err));
            } else {
                initializeTimerLoop();
            }
            
            window.PropertyCardComponent._activeSwipers.set(container.id, autoswipeEngineInterval);
        });
    }
};

// Make sure the globally referenced window context is correct
window.PropertyCardComponent = PropertyCardComponent;