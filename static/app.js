/* ==========================================================================
   SHANMUKHA FASHIONS - COMPLETE APPLICATION SCRIPT (VANILLA JS)
   ========================================================================== */

// 1. Core State & Curated Catalog Database
const APP_STATE = {
    currentView: 'home',
    cart: [],
    wishlist: [],
    filters: {
        department: 'all',
        category: 'all',
        maxPrice: 10000,
        searchQuery: ''
    },
    sortBy: 'featured',
    adminLoggedIn: false
};

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag]));
}

// Initializing Product Database API URL
const DB_URL = "/api/products";

// Fallback luxury default products (Original list)
const DEFAULT_PRODUCTS = [
    {
        id: "p1",
        title: "Cashmere Wool Overcoat",
        department: "mens",
        category: "Outerwear",
        price: 340.00,
        rating: 4.9,
        reviewsCount: 42,
        tag: "Bestseller",
        stock: 3,
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop"
        ],
        desc: "Tailored to perfection, our signature Cashmere Wool Overcoat boasts double-faced structure, premium horn buttons, and a silhouette designed to command attention while insulating maximum comfort.",
        details: "90% Organic Wool, 10% Cashmere. Horn button closure. Dual internal breast pockets. Dry clean only. Tailored fit.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: "p2",
        title: "Bespoke Italian Silk Shirt",
        department: "mens",
        category: "Tops",
        price: 180.00,
        rating: 4.8,
        reviewsCount: 29,
        tag: "New",
        stock: 8,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop"
        ],
        desc: "Luminous, light, and tailored to fall elegantly. Woven from 100% fine Italian mulberry silk, this button-down features a gold-tone neck accent and classic barrel cuffs.",
        details: "100% Italian Mulberry Silk. Pearl buttons. Semi-spread collar. Dry clean only. Fitted cut.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: "p3",
        title: "Tailored Wool Trousers",
        department: "mens",
        category: "Bottoms",
        price: 160.00,
        rating: 4.7,
        reviewsCount: 31,
        tag: "",
        stock: 5,
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop"
        ],
        desc: "Designed with an adjustable side tab waist regulator and clean pressed pleats, these trousers represent the apex of refined business wear.",
        details: "100% Fine Merino Wool. Adjustable brass buckle side tabs. Double welt back pockets. Regular fit.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: "p4",
        title: "Linen Summer Blazer",
        department: "mens",
        category: "Outerwear",
        price: 260.00,
        rating: 4.6,
        reviewsCount: 18,
        tag: "Classic",
        stock: 4,
        image: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop"
        ],
        desc: "A lightweight unstructured jacket constructed from pure Belgian flax linen. Perfect for summer weddings, evening drapes, and weekend luxury.",
        details: "100% Belgian Linen. Unlined structure. Two patch pockets. Double vents. Classic fit.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: "p5",
        title: "Mulberry Silk Wrap Dress",
        department: "womens",
        category: "Tops",
        price: 290.00,
        rating: 4.9,
        reviewsCount: 56,
        tag: "Atelier",
        stock: 2,
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop"
        ],
        desc: "Graceful fluid drapes contour the frame in our premium wrap dress. Highlighted by elegant sleeve pleats and a luxurious gold-tipped waist sash tie.",
        details: "100% Pure Mulberry Silk. Wrap sash waist closure. Elegant bishop sleeves. Hand wash cold. Regular fluid drape.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: "p6",
        title: "Double-Breasted Trench Coat",
        department: "womens",
        category: "Outerwear",
        price: 320.00,
        rating: 4.9,
        reviewsCount: 38,
        tag: "Bestseller",
        stock: 4,
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600&auto=format&fit=crop"
        ],
        desc: "Protect against wind and elements in elevated style. This weather-resistant cotton-gabardine trench includes detailed epaulettes, deep gold buckles, and a structured collar.",
        details: "100% Cotton Gabardine, Satin Lined. Water-resistant. D-ring waist belt. Dry clean only. Oversized drape.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: "p7",
        title: "Cashmere Ribbed Knitwear",
        department: "womens",
        category: "Tops",
        price: 210.00,
        rating: 4.8,
        reviewsCount: 47,
        tag: "Soft Touch",
        stock: 9,
        image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600&auto=format&fit=crop"
        ],
        desc: "Meticulously ribbed knit sweater featuring an elegant funnel neck. Soft-touch insulation utilizing 100% fine Mongolian cashmere.",
        details: "100% Mongolian Cashmere. Ribbed collar, cuffs, and hem. Dry clean only. Classic regular fit.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: "p8",
        title: "Pleated Crepe Skirt",
        department: "womens",
        category: "Bottoms",
        price: 150.00,
        rating: 4.7,
        reviewsCount: 22,
        tag: "",
        stock: 6,
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop"
        ],
        desc: "Sharp accordion pleating adds structured movement. Created in a high-waisted fluid crepe fabric with a hidden luxury side zipper.",
        details: "70% Triacetate, 30% Polyester. Side invisible zipper. Regular midi length. Dry clean recommended.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: "p9",
        title: "Organic Cotton Knit Jumper",
        department: "kids",
        category: "Tops",
        price: 90.00,
        rating: 4.8,
        reviewsCount: 15,
        tag: "Soft Knit",
        stock: 5,
        image: "https://images.unsplash.com/photo-1621451537084-482c730e374a?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1621451537084-482c730e374a?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop"
        ],
        desc: "Super-soft organic knit cotton jumper. Features wood buttons at the neck seam for comfortable wear, hypoallergenic and dye-free organic fibers.",
        details: "100% Organic GOTS Certified Cotton. Natural wood buttons. Machine washable. Age-based standard sizing.",
        sizes: ["2Y", "4Y", "6Y", "8Y"]
    },
    {
        id: "p10",
        title: "Denim Buttoned Jacket",
        department: "kids",
        category: "Outerwear",
        price: 110.00,
        rating: 4.9,
        reviewsCount: 19,
        tag: "Sturdy",
        stock: 3,
        image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop"
        ],
        desc: "Heavy-grade premium indigo denim jacket. Built to endure playful adventure while maintaining double stitched luxury structure.",
        details: "100% Premium Cotton Denim. Indigo copper hardware. Snap front fasteners. Machine washable.",
        sizes: ["2Y", "4Y", "6Y", "8Y"]
    },
    {
        id: "p11",
        title: "Linen Pocket Overalls",
        department: "kids",
        category: "Bottoms",
        price: 95.00,
        rating: 4.6,
        reviewsCount: 12,
        tag: "Summer Air",
        stock: 7,
        image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=600&auto=format&fit=crop"
        ],
        desc: "Breathable and extremely playful flax linen overalls featuring deep front cargo pockets. Pre-washed for maximum soft touch on delicate skin.",
        details: "100% Pre-washed Flax Linen. Adjustable button shoulder straps. Machine wash cold.",
        sizes: ["2Y", "4Y", "6Y", "8Y"]
    },
    {
        id: "p12",
        title: "Tiered Cotton Summer Dress",
        department: "kids",
        category: "Tops",
        price: 85.00,
        rating: 4.7,
        reviewsCount: 14,
        tag: "New Arrivals",
        stock: 2,
        image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=600&auto=format&fit=crop"
        ],
        desc: "A gorgeous airy dress constructed in tier panels. Finished with detailed gold embroidery borders around the cuffs and neck hem.",
        details: "100% Fine Organic Cotton Voile. Back keyhole enclosure. Machine wash delicate.",
        sizes: ["2Y", "4Y", "6Y", "8Y"]
    }
];

// Store loaded products in memory
let PRODUCTS = [];

// Database Sync Functions
async function loadProductsFromDb() {
    try {
        const res = await fetch(DB_URL);
        if (res.ok) {
            PRODUCTS = await res.json();
            console.log("Successfully loaded products from local SQLite database.");
        }
    } catch (e) {
        console.error("Could not connect to local database:", e);
    }
}

async function publishProductsToDb() {
    alert("Success! Your products are stored directly in your secure cloud database. All updates are live instantly!");
}

async function resetDbProducts() {
    if (confirm("Are you sure you want to reset your inventory back to the 12 default luxury garments? All custom items will be deleted.")) {
        try {
            const res = await fetch('/api/products/reset', { method: 'POST', headers: { 'X-Admin-Key': localStorage.getItem('adminKey') || '' } });
            if (res.ok) {
                await loadProductsFromDb();
                renderCatalog();
                renderHomeFeatured();
                renderCategoryFilters();
                alert("Catalog successfully reset to factory defaults and synced to the cloud!");
            }
        } catch (e) {
            alert("Inventory reset failed.");
            console.error(e);
        }
    }
}

// 2. Application Init & Event Handlers
document.addEventListener("DOMContentLoaded", async () => {
    // Load products from remote server first (falls back to localStorage if offline/empty)
    await loadProductsFromDb();

    // Initialize Icons
    lucide.createIcons();
    
    // Initial Render of Featured Products
    renderHomeFeatured();
    
    // Initial Render of Sidebar Category Filters
    renderCategoryFilters();

    // Render Full Catalog
    renderCatalog();

    // Window scroll navigation sticky shrink
    window.addEventListener("scroll", () => {
        const header = document.querySelector(".main-header");
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    // Populate Size Advisor initially
    calculateAdvisorSize();
});

// ==========================================================================
// 3. Navigation View Manager
// ==========================================================================
function navigateTo(viewName) {
    APP_STATE.currentView = viewName;

    // Toggle nav active links
    document.querySelectorAll(".desktop-nav .nav-link").forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${viewName}` || (viewName === 'home' && link.getAttribute("href") === '#home')) {
            link.classList.add("active");
        }
    });

    // Toggle active view sections
    document.querySelectorAll(".view-section").forEach(sec => {
        sec.classList.remove("active");
    });

    const activeSec = document.getElementById(`${viewName}-view`);
    if (activeSec) {
        activeSec.classList.add("active");
        window.scrollTo(0,0);
    }
}

function scrollToCollections() {
    const el = document.getElementById("collections-section");
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
    }
}

// ==========================================================================
// 4. Product Catalog Display Logic
// ==========================================================================
function renderHomeFeatured() {
    // Show Bestsellers / New arrivals on homepage
    const homeGrid = document.getElementById("home-featured-grid");
    if (!homeGrid) return;

    // Filter to show 4 items with tags
    const featuredItems = PRODUCTS.filter(p => p.tag !== "").slice(0, 4);

    homeGrid.innerHTML = featuredItems.map(p => getProductCardHTML(p)).join('');
    lucide.createIcons();
}

function getProductCardHTML(product) {
    const isWishlisted = APP_STATE.wishlist.includes(product.id);
    const wishClass = isWishlisted ? 'active' : '';
    const ratingStars = '<i data-lucide="star"></i>'.repeat(Math.floor(product.rating));
    
    // Check if store owner is logged in to append delete controls
    const adminDeleteButton = APP_STATE.adminLoggedIn ? `
        <div style="display:flex; gap:0.5rem; margin-top:0.8rem; padding-top:0.7rem; border-top:1px solid #e0e0e0;">
            <button class="btn" onclick="event.stopPropagation(); openEditForm('${product.id.replace(/'/g, "\\'")  }')" style="flex:1; background:#2563EB; border:2px solid #1d4ed8; color:#fff; font-size:0.75rem; font-weight:700; padding:0.45rem; border-radius:6px; cursor:pointer;">
                <i data-lucide="edit" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:3px;"></i> Edit
            </button>
            <button class="btn" onclick="event.stopPropagation(); adminDeleteProduct('${product.id.replace(/'/g, "\\'")  }')" style="flex:1; background:#DC2626; border:2px solid #b91c1c; color:#fff; font-size:0.75rem; font-weight:700; padding:0.45rem; border-radius:6px; cursor:pointer;">
                <i data-lucide="trash-2" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:3px;"></i> Delete
            </button>
        </div>
    ` : '';
    
    const mrp = parseFloat(product.mrp);
    const price = parseFloat(product.price);
    let discountBadge = '';
    if (mrp && mrp > price) {
        const pct = Math.round(((mrp - price) / mrp) * 100);
        discountBadge = `${pct}% OFF`;
    }
    
    return `
        <div class="product-card" data-id="${product.id}">
            ${product.tag ? `<span class="card-tag">${product.tag}</span>` : ''}
            <button class="card-wishlist-toggle ${wishClass}" onclick="toggleWishlistState('${encodeURIComponent(product.id)}')" title="Add to Wishlist">
                <i data-lucide="heart"></i>
            </button>
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.title}" class="product-img">
                <div class="product-card-overlay">
                    <button class="card-btn" onclick="openProductQuickView('${encodeURIComponent(product.id)}')">
                        <i data-lucide="eye"></i> Quick View
                    </button>
                    <button class="card-btn add-cart-btn" onclick="quickAddToCart('${encodeURIComponent(product.id)}')">
                        <i data-lucide="shopping-bag"></i> Buy Now
                    </button>
                </div>
            </div>
            <div class="product-info" onclick="openProductQuickView('${encodeURIComponent(product.id)}')" style="cursor:pointer;">
                <span class="product-dept-lbl">${product.department === 'mens' ? 'Menswear' : product.department === 'womens' ? 'Ladieswear' : 'Kidswear'} • ${product.category}</span>
                <h3 class="product-title">${product.title}</h3>
            <div class="product-card-bottom">
                    ${discountBadge ? `
                        <div style="display:flex; flex-direction:column; gap:2px;">
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span class="product-price" style="color:var(--text-primary);">&#8377;${price.toFixed(0)}</span>
                                <span style="font-size:0.75rem; text-decoration:line-through; color:var(--text-secondary);">&#8377;${mrp.toFixed(0)}</span>
                            </div>
                            <span style="font-size:0.7rem; font-weight:700; color:#fff; background:#D62F2F; border-radius:3px; padding:1px 5px; letter-spacing:0.03em;">${discountBadge}</span>
                        </div>
                    ` : `<span class="product-price">&#8377;${price.toFixed(2)}</span>`}
                    <div class="product-rating">
                        ${ratingStars}
                        <span>(${product.reviewsCount})</span>
                    </div>
                </div>
                ${adminDeleteButton}
            </div>
        </div>
    `;
}

// Render dynamic category filter options on side menu based on chosen department
function renderCategoryFilters() {
    const categoryContainer = document.getElementById("category-type-filters");
    if (!categoryContainer) return;

    // Get unique categories for active department
    let availableCategories = [];
    if (APP_STATE.filters.department === 'all') {
        availableCategories = [...new Set(PRODUCTS.map(p => p.category))];
    } else {
        availableCategories = [...new Set(PRODUCTS.filter(p => p.department === APP_STATE.filters.department).map(p => p.category))];
    }

    categoryContainer.innerHTML = `
        <label class="custom-checkbox">
            <input type="radio" name="cat-filter" value="all" checked onchange="handleCatChange('all')">
            <span class="check-mark"></span> All Categories
        </label>
        ${availableCategories.map(cat => `
            <label class="custom-checkbox">
                <input type="radio" name="cat-filter" value="${cat}" onchange="handleCatChange('${cat}')">
                <span class="check-mark"></span> ${cat}
            </label>
        `).join('')}
    `;
}

// Render full curated wardrobe catalog inside Shop
function renderCatalog() {
    const catalogGrid = document.getElementById("catalog-products-grid");
    const emptyState = document.getElementById("catalog-empty-state");
    const resultsLabel = document.getElementById("catalog-count-label");
    if (!catalogGrid) return;

    // Filter catalog products
    let filtered = PRODUCTS.filter(p => {
        // Department Filter
        if (APP_STATE.filters.department !== 'all' && p.department !== APP_STATE.filters.department) {
            return false;
        }
        // Category type Filter
        if (APP_STATE.filters.category !== 'all' && p.category !== APP_STATE.filters.category) {
            return false;
        }
        // Price Filter
        if (p.price > APP_STATE.filters.maxPrice) {
            return false;
        }
        // Search Query Filter
        if (APP_STATE.filters.searchQuery) {
            const query = APP_STATE.filters.searchQuery.toLowerCase();
            return p.title.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
        }
        return true;
    });

    // Sorting
    if (APP_STATE.sortBy === 'price-asc') {
        filtered.sort((a,b) => a.price - b.price);
    } else if (APP_STATE.sortBy === 'price-desc') {
        filtered.sort((a,b) => b.price - a.price);
    } // Default isfeatured/database order

    // Render results
    resultsLabel.textContent = `Showing ${filtered.length} elegant garments`;

    if (filtered.length === 0) {
        catalogGrid.style.display = 'none';
        emptyState.classList.add("active");
    } else {
        catalogGrid.style.display = 'grid';
        emptyState.classList.remove("active");
        catalogGrid.innerHTML = filtered.map(p => getProductCardHTML(p)).join('');
    }

    renderActiveChips();
    lucide.createIcons();
}

// Render active filter tag chips
function renderActiveChips() {
    const chipContainer = document.getElementById("active-chips");
    if (!chipContainer) return;

    let chips = [];
    if (APP_STATE.filters.department !== 'all') {
        chips.push({ key: 'department', label: `Dept: ${APP_STATE.filters.department === 'mens' ? 'Menswear' : APP_STATE.filters.department === 'womens' ? 'Ladieswear' : 'Kidswear'}` });
    }
    if (APP_STATE.filters.category !== 'all') {
        chips.push({ key: 'category', label: `Cat: ${APP_STATE.filters.category}` });
    }
    if (APP_STATE.filters.maxPrice < 10000) {
        chips.push({ key: 'price', label: `Under ₹${APP_STATE.filters.maxPrice}` });
    }
    if (APP_STATE.filters.searchQuery) {
        chips.push({ key: 'search', label: `Search: "${APP_STATE.filters.searchQuery}"` });
    }

    chipContainer.innerHTML = chips.map(chip => `
        <div class="filter-chip" onclick="removeFilterChip('${chip.key}')">
            ${chip.label} <i data-lucide="x"></i>
        </div>
    `).join('');
}

function removeFilterChip(key) {
    if (key === 'department') {
        APP_STATE.filters.department = 'all';
        // Update header selection & sidebar radio selection
        document.getElementById("header-dept-select").value = 'all';
        const radio = document.querySelector(`input[name="dept-filter"][value="all"]`);
        if (radio) radio.checked = true;
        renderCategoryFilters();
    } else if (key === 'category') {
        APP_STATE.filters.category = 'all';
        const radio = document.querySelector(`input[name="cat-filter"][value="all"]`);
        if (radio) radio.checked = true;
    } else if (key === 'price') {
        APP_STATE.filters.maxPrice = 10000;
        document.getElementById("price-range-input").value = 10000;
        document.getElementById("price-max-val").textContent = '₹10000';
    } else if (key === 'search') {
        APP_STATE.filters.searchQuery = '';
        document.getElementById("search-input").value = '';
    }
    renderCatalog();
}

// Handle Sidebar Filter modifications
function handleFilterChange() {
    // 1. Department Value
    const activeDeptRadio = document.querySelector('input[name="dept-filter"]:checked');
    const prevDept = APP_STATE.filters.department;
    APP_STATE.filters.department = activeDeptRadio ? activeDeptRadio.value : 'all';

    // Update Header department search dropdown to match
    document.getElementById("header-dept-select").value = APP_STATE.filters.department;

    if (prevDept !== APP_STATE.filters.department) {
        // Redraw categories since department changed
        APP_STATE.filters.category = 'all';
        renderCategoryFilters();
    }

    // 2. Sort Value
    APP_STATE.sortBy = document.getElementById("sort-select").value;

    renderCatalog();
}

function handleCatChange(value) {
    APP_STATE.filters.category = value;
    renderCatalog();
}

function handlePriceSlider(val) {
    document.getElementById("price-max-val").textContent = `₹${val}`;
    APP_STATE.filters.maxPrice = parseFloat(val);
}

function handleSearch(val) {
    APP_STATE.filters.searchQuery = val.trim();
    // Auto-navigate to shop if search typed from home view
    if (APP_STATE.currentView !== 'shop') {
        navigateTo('shop');
    }
    renderCatalog();
}

function handleHeaderDeptChange() {
    const val = document.getElementById("header-dept-select").value;
    APP_STATE.filters.department = val;

    // Check matching radio in sidebar
    const radio = document.querySelector(`input[name="dept-filter"][value="${val}"]`);
    if (radio) radio.checked = true;

    // Redraw sidebar filters
    APP_STATE.filters.category = 'all';
    renderCategoryFilters();
    
    navigateTo('shop');
    renderCatalog();
}

function filterDepartment(dept) {
    APP_STATE.filters.department = dept;
    document.getElementById("header-dept-select").value = dept;
    const radio = document.querySelector(`input[name="dept-filter"][value="${dept}"]`);
    if (radio) radio.checked = true;

    APP_STATE.filters.category = 'all';
    renderCategoryFilters();
    navigateTo('shop');
    renderCatalog();
}

function clearAllFilters() {
    APP_STATE.filters.department = 'all';
    APP_STATE.filters.category = 'all';
    APP_STATE.filters.maxPrice = 10000;
    APP_STATE.filters.searchQuery = '';
    APP_STATE.sortBy = 'featured';

    document.getElementById("header-dept-select").value = 'all';
    document.getElementById("search-input").value = '';
    document.getElementById("sort-select").value = 'featured';
    
    const deptRadio = document.querySelector('input[name="dept-filter"][value="all"]');
    if (deptRadio) deptRadio.checked = true;
    
    document.getElementById("price-range-input").value = 10000;
    document.getElementById("price-max-val").textContent = '₹10000';

    renderCategoryFilters();
    renderCatalog();
}

// ==========================================================================
// 5. Cart & Wishlist Drawers Controller
// ==========================================================================
function toggleCart(show) {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-drawer-overlay");
    if (show) {
        renderCartDrawer();
        drawer.classList.add("active");
        overlay.classList.add("active");
    } else {
        drawer.classList.remove("active");
        overlay.classList.remove("active");
    }
}

function toggleWishlist(show) {
    const drawer = document.getElementById("wishlist-drawer");
    const overlay = document.getElementById("wishlist-drawer-overlay");
    if (show) {
        renderWishlistDrawer();
        drawer.classList.add("active");
        overlay.classList.add("active");
    } else {
        drawer.classList.remove("active");
        overlay.classList.remove("active");
    }
}

function toggleSizeAdvisor(show) {
    const drawer = document.getElementById("size-advisor-drawer");
    const overlay = document.getElementById("size-advisor-overlay");
    if (show) {
        drawer.classList.add("active");
        overlay.classList.add("active");
    } else {
        drawer.classList.remove("active");
        overlay.classList.remove("active");
    }
}

// Live Sizing advisor smart formula
function calculateAdvisorSize() {
    const height = parseFloat(document.getElementById("advisor-height-input").value);
    const weight = parseFloat(document.getElementById("advisor-weight-input").value);
    const fitStyle = document.getElementById("advisor-fit-select").value;

    document.getElementById("advisor-height-display").textContent = height;
    document.getElementById("advisor-weight-display").textContent = weight;

    // Smart formula based on metrics
    let baseVal = weight / (height / 100);
    let size = "M";

    if (baseVal < 32) {
        size = "XS";
    } else if (baseVal < 38) {
        size = "S";
    } else if (baseVal < 44) {
        size = "M";
    } else if (baseVal < 49) {
        size = "L";
    } else if (baseVal < 55) {
        size = "XL";
    } else {
        size = "XXL";
    }

    // Shift sizing based on user fit style choice
    const adultSizes = ["XS", "S", "M", "L", "XL", "XXL"];
    let sizeIndex = adultSizes.indexOf(size);

    if (fitStyle === 'fitted') {
        sizeIndex = Math.max(0, sizeIndex - 1);
    } else if (fitStyle === 'oversized') {
        sizeIndex = Math.min(adultSizes.length - 1, sizeIndex + 1);
    }

    document.getElementById("recommended-size-output").textContent = adultSizes[sizeIndex];
}

// Shopping Cart Core Logic
function quickAddToCart(productId) {
    const p = PRODUCTS.find(prod => prod.id === productId);
    const chosenSize = p.sizes[0]; // Default to first size available (e.g. S)
    addToCart(productId, chosenSize);
}

function addToCart(productId, size) {
    const p = PRODUCTS.find(prod => prod.id === productId);
    
    // Check if item already exists in cart with matching size
    const existing = APP_STATE.cart.find(item => item.product.id === productId && item.size === size);

    if (existing) {
        existing.qty += 1;
    } else {
        APP_STATE.cart.push({ product: p, size: size, qty: 1 });
    }

    updateCartCounts();
    toggleCart(true); // Slide drawer open for luxurious visual feedback
}

function updateCartQty(productId, size, offset) {
    const item = APP_STATE.cart.find(item => item.product.id === productId && item.size === size);
    if (item) {
        item.qty += offset;
        if (item.qty <= 0) {
            removeCartItem(productId, size);
            return;
        }
    }
    updateCartCounts();
    renderCartDrawer();
}

function removeCartItem(productId, size) {
    APP_STATE.cart = APP_STATE.cart.filter(item => !(item.product.id === productId && item.size === size));
    updateCartCounts();
    renderCartDrawer();
}

function updateCartCounts() {
    const count = APP_STATE.cart.reduce((total, item) => total + item.qty, 0);
    const subtotal = APP_STATE.cart.reduce((total, item) => total + (item.product.price * item.qty), 0);

    // Update nav icons
    document.getElementById("cart-count").textContent = count;
    document.getElementById("header-cart-total").textContent = `₹${subtotal.toFixed(2)}`;

    // Update drawers count label
    document.getElementById("cart-drawer-count").textContent = count;
}

function renderCartDrawer() {
    const container = document.getElementById("cart-items-container");
    const emptyState = document.getElementById("cart-empty-state");
    const footer = document.getElementById("cart-footer");

    if (APP_STATE.cart.length === 0) {
        container.style.display = 'none';
        footer.style.display = 'none';
        emptyState.classList.add("active");
    } else {
        container.style.display = 'block';
        footer.style.display = 'flex';
        emptyState.classList.remove("active");

        const subtotal = APP_STATE.cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
        document.getElementById("cart-subtotal").textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById("cart-total").textContent = `₹${subtotal.toFixed(2)}`;

        container.innerHTML = APP_STATE.cart.map(item => `
            <div class="cart-item">
                <img src="${item.product.image}" alt="${item.product.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.product.title}</h4>
                    <span class="cart-item-meta">Size: <strong>${item.size}</strong></span>
                    <span class="cart-item-price">₹${item.product.price.toFixed(2)}</span>
                    <div class="cart-item-actions">
                        <div class="quantity-controller">
                            <button class="qty-btn" onclick="updateCartQty('${item.product.id}', '${item.size}', -1)"><i data-lucide="minus" style="width:12px;height:12px;"></i></button>
                            <span class="qty-val">${item.qty}</span>
                            <button class="qty-btn" onclick="updateCartQty('${item.product.id}', '${item.size}', 1)"><i data-lucide="plus" style="width:12px;height:12px;"></i></button>
                        </div>
                        <button class="remove-cart-item-btn" onclick="removeCartItem('${item.product.id}', '${item.size}')">
                            <i data-lucide="trash-2" style="width:14px;height:14px;"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        lucide.createIcons();
    }
}

// Wishlist Logic
function toggleWishlistState(productId) {
    const index = APP_STATE.wishlist.indexOf(productId);
    if (index === -1) {
        APP_STATE.wishlist.push(productId);
    } else {
        APP_STATE.wishlist.splice(index, 1);
    }

    // Refresh active views to update heart toggle icons styling
    renderCatalog();
    renderHomeFeatured();

    // Update wishlist navbar badge count
    const count = APP_STATE.wishlist.length;
    document.getElementById("wishlist-count").textContent = count;
    document.getElementById("wishlist-drawer-count").textContent = count;
    
    const headerHeart = document.getElementById("wishlist-btn-icon");
    if (count > 0) {
        headerHeart.classList.add("filled");
        headerHeart.setAttribute("fill", "#ff4757");
        headerHeart.style.color = "#ff4757";
    } else {
        headerHeart.classList.remove("filled");
        headerHeart.setAttribute("fill", "none");
        headerHeart.style.color = "currentColor";
    }
}

function renderWishlistDrawer() {
    const container = document.getElementById("wishlist-items-container");
    const emptyState = document.getElementById("wishlist-empty-state");

    if (APP_STATE.wishlist.length === 0) {
        container.style.display = 'none';
        emptyState.classList.add("active");
    } else {
        container.style.display = 'block';
        emptyState.classList.remove("active");

        const wishlistedItems = PRODUCTS.filter(p => APP_STATE.wishlist.includes(p.id));

        container.innerHTML = wishlistedItems.map(item => `
            <div class="wishlist-item">
                <img src="${item.image}" alt="${item.title}" class="wishlist-item-image">
                <div class="wishlist-item-details">
                    <h4 class="wishlist-item-title">${item.title}</h4>
                    ${(item.mrp && item.mrp > item.price) ? `
                        <div style="display:flex;align-items:center;gap:6px;">
                            <span class="wishlist-item-price">&#8377;${item.price.toFixed(2)}</span>
                            <span style="font-size:0.75rem;text-decoration:line-through;color:var(--text-secondary);">&#8377;${item.mrp.toFixed(2)}</span>
                            <span style="font-size:0.68rem;font-weight:700;color:#fff;background:#D62F2F;border-radius:3px;padding:1px 4px;">-${Math.round((item.mrp - item.price) / item.mrp * 100)}%</span>
                        </div>
                    ` : `<span class="wishlist-item-price">&#8377;${item.price.toFixed(2)}</span>`}
                </div>
                <div class="wishlist-item-actions">
                    <button class="wishlist-add-cart-btn" onclick="toggleWishlist(false); quickAddToCart('${item.id}')">Add Bag</button>
                    <button class="wishlist-remove-btn" onclick="toggleWishlistState('${item.id}'); renderWishlistDrawer();">Delete</button>
                </div>
            </div>
        `).join('');

        lucide.createIcons();
    }
}

// ==========================================================================
// 6. Product Quick View Modal System
// ==========================================================================
let activeModalProductId = "";

function openProductQuickView(productId) {
    activeModalProductId = productId;
    const p = PRODUCTS.find(prod => prod.id === productId);
    if (!p) return;

    const overlay = document.getElementById("product-modal-overlay");
    const container = document.getElementById("product-modal-details");

    const isWishlisted = APP_STATE.wishlist.includes(p.id);
    const wishText = isWishlisted ? 'Wishlisted ✓' : 'Add to Wishlist';

    const stars = '<i data-lucide="star"></i>'.repeat(Math.floor(p.rating));

    // Compile dynamic sizes selector
    const sizeSelectHTML = p.sizes.map((s, idx) => `
        <label class="size-option-label">
            <input type="radio" name="modal-sizes" value="${s}" ${idx === 0 ? 'checked' : ''}>
            <span class="size-box">${s}</span>
        </label>
    `).join('');

    // Dynamic Images & Thumbnails layout
    const thumbnailsHTML = p.images.map((img, idx) => `
        <img src="${img}" class="thumb-img ${idx === 0 ? 'active' : ''}" onclick="switchModalMainImage('${img}', this)" alt="Thumbnail ${idx}">
    `).join('');

    container.innerHTML = `
        <!-- Image Area -->
        <div class="modal-img-area">
            <div class="modal-main-img-wrapper">
                <img src="${p.image}" class="modal-main-img" id="modal-main-image-viewport" alt="${p.title}">
            </div>
            ${p.images.length > 1 ? `<div class="modal-thumbnails">${thumbnailsHTML}</div>` : ''}
        </div>

        <!-- Details Info Area -->
        <div class="modal-details-area">
            <span class="product-dept-lbl">${p.department === 'mens' ? 'Menswear' : p.department === 'womens' ? 'Ladieswear' : 'Kidswear'} Wardrobe</span>
            <h1 class="modal-title">${p.title}</h1>
            
            <div class="modal-price-rating">
                ${(p.mrp && p.mrp > p.price) ? `
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        <div style="display:flex; align-items:baseline; gap:10px;">
                            <span class="modal-price" style="color:var(--text-primary);">&#8377;${p.price.toFixed(2)}</span>
                            <span style="font-size:0.9rem; text-decoration:line-through; color:var(--text-secondary);">MRP &#8377;${p.mrp.toFixed(2)}</span>
                        </div>
                        <span style="font-size:0.78rem; font-weight:700; color:#fff; background:#D62F2F; border-radius:4px; padding:2px 8px; display:inline-block; letter-spacing:0.04em;">YOU SAVE &#8377;${(p.mrp - p.price).toFixed(2)} (${Math.round((p.mrp - p.price) / p.mrp * 100)}% OFF)</span>
                    </div>
                ` : `<span class="modal-price">&#8377;${p.price.toFixed(2)}</span>`}
                <div class="product-rating">
                    ${stars}
                    <span>(${p.reviewsCount} reviews)</span>
                </div>
            </div>

            <p class="modal-desc">${p.desc}</p>

            ${p.stock <= 3 ? `
                <div class="limited-stock-alert">
                    <i data-lucide="alert-triangle"></i>
                    <span>Only ${p.stock} units remaining in stock. Order bespoke cut sizing today.</span>
                </div>
            ` : ''}

            <!-- Size Selector -->
            <div>
                <h4 class="size-select-title">Select Sizing</h4>
                <div class="modal-size-selector">
                    ${sizeSelectHTML}
                </div>
            </div>

            <!-- CTA Actions -->
            <div class="modal-cta-buttons">
                <button class="btn btn-primary" onclick="submitModalAddToCart()">
                    <i data-lucide="shopping-bag"></i> Add To Bag
                </button>
                <button class="btn btn-secondary" onclick="toggleWishlistState('${p.id}'); updateModalWishlistBtn();">
                    <i data-lucide="heart" id="modal-wish-icon"></i> <span id="modal-wish-txt">${wishText}</span>
                </button>
            </div>

            <!-- Accordion Details tabs -->
            <div class="modal-tabs">
                <div class="tab-accordion">
                    <div class="tab-header" onclick="toggleModalAccordion('material')">Fabric & Design Detail <i data-lucide="chevron-down"></i></div>
                    <div class="tab-body" id="modal-acc-material">
                        <p>${p.details}</p>
                    </div>
                </div>
                <div class="tab-accordion">
                    <div class="tab-header" onclick="toggleModalAccordion('shipping')">Complimentary Delivery <i data-lucide="chevron-down"></i></div>
                    <div class="tab-body" id="modal-acc-shipping">
                        <p>Enjoy signature gold-packaged tracked express shipping. Delivered within 2-4 business days. Lifetime complimentary size customization and tailoring support is included.</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    overlay.classList.add("active");
    lucide.createIcons();
    updateModalWishlistBtn();
}

function closeProductModal() {
    document.getElementById("product-modal-overlay").classList.remove("active");
}

function switchModalMainImage(imgUrl, thumbEl) {
    document.getElementById("modal-main-image-viewport").src = imgUrl;
    document.querySelectorAll(".thumb-img").forEach(el => el.classList.remove("active"));
    thumbEl.classList.add("active");
}

function toggleModalAccordion(name) {
    const el = document.getElementById(`modal-acc-${name}`);
    const isOpen = el.classList.contains("active");

    // Close all first
    document.querySelectorAll(".tab-body").forEach(body => body.classList.remove("active"));

    if (!isOpen) {
        el.classList.add("active");
    }
}

function updateModalWishlistBtn() {
    const wishIcon = document.getElementById("modal-wish-icon");
    const wishTxt = document.getElementById("modal-wish-txt");
    if (!wishIcon || !activeModalProductId) return;

    const isWishlisted = APP_STATE.wishlist.includes(activeModalProductId);
    if (isWishlisted) {
        wishIcon.setAttribute("fill", "#ff4757");
        wishIcon.style.color = "#ff4757";
        wishTxt.textContent = "Wishlisted ✓";
    } else {
        wishIcon.setAttribute("fill", "none");
        wishIcon.style.color = "currentColor";
        wishTxt.textContent = "Add to Wishlist";
    }
}

function submitModalAddToCart() {
    const checkedRadio = document.querySelector('input[name="modal-sizes"]:checked');
    if (!checkedRadio) return;

    const size = checkedRadio.value;
    addToCart(activeModalProductId, size);
    closeProductModal();
}

// ==========================================================================
// 7. Simulated Premium Checkout Pipeline
// ==========================================================================
let checkoutCurrentStep = 1;

function openCheckout() {
    if (APP_STATE.cart.length === 0) {
        alert("Your cart is empty. Please add items to begin checkout.");
        return;
    }
    
    // Close cart drawer first
    toggleCart(false);

    // Setup visual summary
    renderCheckoutSummary();

    // Pre-fill phone if customer is logged in
    const phone = localStorage.getItem("customerPhone");
    if (phone) {
        const phoneInput = document.getElementById("shipping-phone");
        if (phoneInput && !phoneInput.value) {
            phoneInput.value = phone;
        }
    }

    const overlay = document.getElementById("checkout-modal-overlay");
    overlay.classList.add("active");

    goToStep(1);
}

function closeCheckout() {
    document.getElementById("checkout-modal-overlay").classList.remove("active");
}

function renderCheckoutSummary() {
    const container = document.getElementById("checkout-summary-items");
    const subtotal = APP_STATE.cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);

    document.getElementById("checkout-subtotal").textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById("checkout-grandtotal").textContent = `₹${subtotal.toFixed(2)}`;

    container.innerHTML = APP_STATE.cart.map(item => `
        <div class="checkout-summary-item">
            <img src="${item.product.image}" class="checkout-summary-img" alt="${item.product.title}">
            <div class="checkout-summary-info">
                <h4 class="checkout-summary-title">${item.product.title}</h4>
                <span class="checkout-summary-meta">Size: ${item.size} • Qty: ${item.qty}</span>
                <span class="checkout-summary-price">₹${(item.product.price * item.qty).toFixed(2)}</span>
            </div>
        </div>
    `).join('');
}

function goToStep(stepNum) {
    checkoutCurrentStep = stepNum;

    // Toggle active form panel
    document.querySelectorAll(".checkout-step-panel").forEach(panel => {
        panel.classList.remove("active");
    });
    document.getElementById(`checkout-step-${stepNum}`).classList.add("active");

    // Toggle active heading labels
    document.querySelectorAll(".checkout-steps .step").forEach((el, idx) => {
        el.classList.remove("active");
        if (idx + 1 === stepNum) {
            el.classList.add("active");
        }
    });
}

let checkoutShippingDetails = {};

function handleShippingSubmit(event) {
    event.preventDefault();
    
    // Gather details for confirmation review
    const firstName = document.getElementById("shipping-first-name").value;
    const lastName = document.getElementById("shipping-last-name").value;
    const phone = document.getElementById("shipping-phone").value;
    const email = document.getElementById("shipping-email").value;
    const address = document.getElementById("shipping-address").value;
    const city = document.getElementById("shipping-city").value;
    const zip = document.getElementById("shipping-zip").value;
    
    checkoutShippingDetails = {
        firstName,
        lastName,
        phone,
        email,
        address,
        city,
        zip
    };
    
    document.getElementById("review-shipping-summary").textContent = `${firstName} ${lastName}, ${address}, ${city} ${zip}`;
    document.getElementById("review-phone-summary").textContent = phone;

    goToStep(2);
}

// Place SQLite order and fire visual fireworks confetti
function submitFinalOrder() {
    const btn = document.getElementById("place-order-btn");
    btn.classList.add("loading");
    btn.disabled = true;

    // Generate a real order reference and order details for database persistence
    const orderRef = "#SF-2026-" + Math.random().toString(36).substring(2, 7).toUpperCase();
    const subtotal = APP_STATE.cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);

    const orderData = {
        order_id: orderRef,
        customer_name: `${checkoutShippingDetails.firstName} ${checkoutShippingDetails.lastName}`,
        customer_phone: checkoutShippingDetails.phone,
        delivery_address: `${checkoutShippingDetails.address}, ${checkoutShippingDetails.city}, ${checkoutShippingDetails.zip} (Email: ${checkoutShippingDetails.email})`,
        order_details: APP_STATE.cart.map(item => ({
            product_id: item.product.id,
            size: item.size,
            qty: item.qty
        }))
    };

    // Send order to SQLite via backend API
    fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    })
    .then(res => res.json())
    .then(data => {
        btn.classList.remove("loading");
        btn.disabled = false;
        
        if (data.success) {
            // Hide stepper header links
            document.querySelector(".checkout-steps").style.display = 'none';

            // Update successful visual details
            document.querySelector(".success-order-panel strong").textContent = orderRef;

            // Swap to Success panel
            document.querySelectorAll(".checkout-step-panel").forEach(p => p.classList.remove("active"));
            document.getElementById("checkout-success-panel").classList.add("active");

            // Clear cart shopping state since purchased
            APP_STATE.cart = [];
            updateCartCounts();
            renderCartDrawer();

            // Launch celebratory confetti visual effects
            triggerLuxuryConfetti();
        } else {
            alert("Error placing order: " + data.message);
        }
    })
    .catch(err => {
        btn.classList.remove("loading");
        btn.disabled = false;
        alert("Failed to submit order. Please try again.");
        console.error(err);
    });
}

// Generate premium custom CSS confetti particles
function triggerLuxuryConfetti() {
    const overlay = document.getElementById("confetti-canvas-overlay");
    overlay.style.display = "block";
    overlay.innerHTML = "";

    const goldColors = ["#C5A880", "#E6C280", "#8C7355", "#F5F5F3", "#FFFFFF"];

    for (let i = 0; i < 90; i++) {
        const particle = document.createElement("div");
        particle.className = "confetti-particle";
        
        // Random particle variables
        const left = Math.random() * 100;
        const color = goldColors[Math.floor(Math.random() * goldColors.length)];
        const delay = Math.random() * 2.5;
        const duration = 2 + Math.random() * 3;
        const rotate = Math.random() * 360;

        particle.style.left = `${left}%`;
        particle.style.backgroundColor = color;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.transform = `rotate(${rotate}deg)`;

        overlay.appendChild(particle);
    }

    // Clean up animation elements after completion
    setTimeout(() => {
        overlay.style.display = "none";
        overlay.innerHTML = "";
    }, 6000);
}

// ==========================================================================
// 8. Footer Newsletters & Extra Polish
// ==========================================================================
function handleNewsletterSubscribe(event) {
    event.preventDefault();
    const input = event.target.querySelector("input");
    input.value = "";
    
    const successLbl = document.getElementById("newsletter-success-state");
    successLbl.style.display = "flex";

    setTimeout(() => {
        successLbl.style.display = "none";
    }, 4500);
}

// ==========================================================================
// 9. Owner Portal & Dynamic Admin Controls (Persists in localStorage)
// ==========================================================================
function toggleAdminPanel(show) {
    const drawer = document.getElementById("admin-drawer");
    const overlay = document.getElementById("admin-drawer-overlay");
    if (show) {
        drawer.classList.add("active");
        overlay.classList.add("active");
        renderAdminOrders();
    } else {
        drawer.classList.remove("active");
        overlay.classList.remove("active");
    }
}

async function handleAdminLogin(event) {
    event.preventDefault();
    const pin = document.getElementById("admin-pin-input").value;
    const errorEl = document.getElementById("admin-login-error");
    errorEl.style.display = "none";

    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin })
        });
        const data = await res.json();

        if (data.success) {
            APP_STATE.adminLoggedIn = true;

            // Toggle visual screens — MUST be flex (sidebar layout)
            document.getElementById("admin-login-screen").style.display = "none";
            document.getElementById("admin-dashboard-screen").style.display = "flex";
            document.getElementById("admin-nav-bar").style.display = "flex";

            // Load data immediately
            loadStats();
            renderAdminOrders();
            renderAdminProductList();

            // Redraw catalog to show delete buttons
            renderCatalog();
            renderHomeFeatured();

            // Reset login input
            document.getElementById("admin-pin-input").value = "";
        } else {
            errorEl.textContent = "Invalid Access Key. Please try again.";
            errorEl.style.display = "block";
        }
    } catch (e) {
        errorEl.textContent = "Server error. Please try again.";
        errorEl.style.display = "block";
        console.error(e);
    }
}

function handleAdminLogout() {
    APP_STATE.adminLoggedIn = false;
    
    // Toggle visual screens
    document.getElementById("admin-login-screen").style.display = "block";
    document.getElementById("admin-dashboard-screen").style.display = "none";
    document.getElementById("admin-nav-bar").style.display = "none";
    
    // Redraw catalog to remove "Delete Garment" buttons
    renderCatalog();
    renderHomeFeatured();
}

function switchAdminTab(tabName) {
    // Hide all contents
    document.querySelectorAll('.admin-tab-content').forEach(el => el.style.display = 'none');
    // Remove active class from all nav buttons
    document.querySelectorAll('.admin-nav-btn').forEach(el => el.classList.remove('active'));

    // Show selected content and set active class
    const contentId = `admin-tab-${tabName}-content`;
    const btnId = `btn-admin-tab-${tabName}`;
    
    const contentEl = document.getElementById(contentId);
    const btnEl = document.getElementById(btnId);
    if (contentEl) contentEl.style.display = 'block';
    if (btnEl) btnEl.classList.add('active');

    // Trigger data loading
    if (tabName === 'stats') {
        loadStats();
    } else if (tabName === 'orders') {
        renderAdminOrders();
    } else if (tabName === 'products') {
        renderAdminProductList();
    } else if (tabName === 'analytics') {
        loadAnalytics();
    }
}

async function renderAdminOrders() {
    const container = document.getElementById("admin-orders-list-container");
    if (!container) return;

    try {
        const res = await fetch('/api/orders', { method: 'GET' });
        if (!res.ok) throw new Error("Could not fetch orders");
        const orders = await res.json();

        if (orders.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 0; color:var(--text-secondary); font-size:0.85rem;">
                    <i data-lucide="package" style="width:32px;height:32px;margin-bottom:0.5rem;color:var(--text-muted);"></i>
                    <p>No orders placed on your store yet.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        container.innerHTML = orders.map(order => {
            const isDelivered = order.status === 'Delivered';
            const statusColor = isDelivered ? '#2E7D32' : '#B12704';
            
            return `
            <div style="background-color:var(--bg-tertiary); border:1px solid var(--border-soft); padding:1rem; border-radius:4px; font-size:0.8rem; display:flex; flex-direction:column; gap:0.4rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-soft); padding-bottom:0.4rem; margin-bottom:0.4rem;">
                    <span style="font-weight:700; color:var(--color-orange-dark);">${escapeHTML(order.order_id)}</span>
                    <span style="color:var(--text-secondary); font-size:0.75rem;">Status: <strong style="color:${statusColor};">${escapeHTML(order.status)}</strong></span>
                </div>
                <p><strong>Customer:</strong> ${escapeHTML(order.customer_name)}</p>
                <p><strong>Phone:</strong> ${escapeHTML(order.customer_phone)}</p>
                <p><strong>Delivery Address:</strong> ${escapeHTML(order.delivery_address)}</p>
                <div style="background-color:var(--bg-secondary); padding:0.5rem; border-radius:3px; margin:0.3rem 0;">
                    <p style="font-weight:700; border-bottom:1px solid #EEE; padding-bottom:0.2rem; margin-bottom:0.2rem; font-size:0.75rem;">Items Purchased:</p>
                    <ul style="list-style:none; padding-left:0; display:flex; flex-direction:column; gap:0.25rem;">
                        ${order.order_details.map(item => `
                            <li style="display:flex; justify-content:space-between;">
                                <span>${escapeHTML(item.title)} (Size: ${escapeHTML(item.size)}) x ${item.qty}</span>
                                <span>₹${(item.price * item.qty).toFixed(2)}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-weight:700; border-top:1px solid var(--border-soft); padding-top:0.4rem; margin-top:0.4rem;">
                    <span>Grand Total:</span>
                    <span style="color:var(--color-orange-dark); font-size:0.95rem;">₹${order.total_amount.toFixed(2)}</span>
                </div>
                ${!isDelivered ? `
                <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
                    <button class="btn btn-outline" onclick="fulfillOrder('${order.order_id}')" style="flex:1; padding:0.3rem; font-size:0.75rem; background-color:#FFF3E0; border-color:#FFB74D; color:#E65100; font-weight:700; border-radius:3px;">
                        Mark as Delivered
                    </button>
                </div>
                ` : `
                <div style="display:flex; gap:0.5rem; margin-top:0.5rem; justify-content:center; align-items:center; background-color:#E8F5E9; border:1px solid #81C784; padding:0.3rem; border-radius:3px; color:#2E7D32; font-weight:700; font-size:0.75rem;">
                    ✓ Delivered
                </div>
                `}
            </div>
            `;
        }).join('');

        lucide.createIcons();
    } catch (e) {
        console.error(e);
        container.innerHTML = `<p style="color:red; text-align:center; font-size:0.8rem;">Failed to fetch orders.</p>`;
    }
}

async function fulfillOrder(orderId) {
    try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/fulfill`, { method: 'PUT' });
        if (res.ok) {
            alert("Order marked as delivered successfully!");
            renderAdminOrders();
        }
    } catch (e) {
        console.error("Fulfillment toggle failed:", e);
    }
}

async function clearAllOrders() {
    if (confirm("Are you sure you want to clear your entire order history from the cloud database? This cannot be undone.")) {
        try {
            const res = await fetch('/api/orders/clear', { method: 'POST' });
            if (res.ok) {
                renderAdminOrders();
            }
        } catch (e) {
            console.error(e);
        }
    }
}

async function handleAdminAddProduct(event) {
    event.preventDefault();
    
    const title = document.getElementById("admin-add-title").value;
    const dept = document.getElementById("admin-add-dept").value;
    const category = document.getElementById("admin-add-category").value;
    const mrpRaw = document.getElementById("admin-add-mrp").value;
    const mrp = mrpRaw ? parseFloat(mrpRaw) : null;
    const price = parseFloat(document.getElementById("admin-add-price").value);
    const stock = parseInt(document.getElementById("admin-add-stock").value);
    const desc = document.getElementById("admin-add-desc").value;
    const details = document.getElementById("admin-add-details").value;
    const imageFile = document.getElementById("productImage").files[0];
    const imageUrl = document.getElementById("productImageUrl") ? document.getElementById("productImageUrl").value.trim() : '';
    
    // Require either a file OR a URL
    if (!imageFile && !imageUrl) {
        alert("Please either upload a garment image file OR paste an image URL.");
        return;
    }
    
    if (mrp && mrp <= price) {
        alert("MRP must be greater than the Selling Price to show a discount. Leave MRP blank if there's no discount.");
        return;
    }

    const hasSizesEl = document.querySelector('input[name="hasSizes"]:checked');
    const hasSizes = hasSizesEl ? hasSizesEl.value : 'no';
    const sizesVal = hasSizes === 'yes' ? document.getElementById('productSizes').value : '';

    try {
        let res;

        if (imageFile) {
            // Use FormData for file upload (goes to Cloudinary)
            const formData = new FormData();
            formData.append('title', title);
            formData.append('department', dept);
            formData.append('category', category);
            if (mrp) formData.append('mrp', mrp);
            formData.append('price', price);
            formData.append('stock', stock);
            formData.append('desc', desc);
            formData.append('details', details);
            formData.append('productImage', imageFile);
            formData.append('sizes', sizesVal);
            res = await fetch('/api/products', { method: 'POST', body: formData });
        } else {
            // Use JSON with image URL directly
            res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, department: dept, category, mrp, price, stock, desc, details, sizes: sizesVal, image: imageUrl })
            });
        }

        const data = await res.json();
        
        if (data.success) {
            document.getElementById("admin-add-form").reset();
            await loadProductsFromDb();
            renderCatalog();
            renderHomeFeatured();
            renderCategoryFilters();
            alert("'" + title + "' has been successfully published to your secure cloud catalog!");
            switchAdminTab('orders');
        } else {
            alert("Failed to publish: " + data.message);
        }
    } catch (e) {
        console.error(e);
        alert("Error connecting to server to add product.");
    }
}

async function adminDeleteProduct(productId) {
    if (confirm("Are you sure you want to delete this garment from your secure cloud catalog? This will take it off the shelves immediately.")) {
        try {
            const res = await fetch(`/api/products/${encodeURIComponent(productId)}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                await loadProductsFromDb();
                renderCatalog();
                renderHomeFeatured();
                renderCategoryFilters();
            } else {
                alert("Failed to delete: " + data.message);
            }
        } catch (e) {
            console.error(e);
            alert("Error connecting to server to delete product.");
        }
    }
}

// ==========================================================================
// 10. Customer Portal / Login / Track Order Functions
// ==========================================================================
function openLoginModal() {
    const overlay = document.getElementById("login-modal-overlay");
    if (!overlay) return;
    
    overlay.classList.add("active");
    
    const phone = localStorage.getItem("customerPhone");
    if (phone) {
        // Already logged in
        document.getElementById("login-form-container").style.display = "none";
        document.getElementById("logged-in-container").style.display = "block";
        document.getElementById("logged-in-phone").textContent = phone;
        fetchCustomerOrders(phone);
    } else {
        // Show login form
        document.getElementById("login-form-container").style.display = "block";
        document.getElementById("logged-in-container").style.display = "none";
        document.getElementById("customer-phone-input").value = "";
        document.getElementById("customer-password-input").value = "";
        document.getElementById("customer-login-error").style.display = "none";
    }
}

function closeLoginModal() {
    const overlay = document.getElementById("login-modal-overlay");
    if (overlay) {
        overlay.classList.remove("active");
    }
}

async function handleCustomerLogin(event) {
    event.preventDefault();
    const phone = document.getElementById("customer-phone-input").value.trim();
    const password = document.getElementById("customer-password-input").value;
    const action = document.getElementById("login-action-type").value;
    const errorEl = document.getElementById("customer-login-error");
    
    if (!phone || !password) {
        errorEl.textContent = "Please fill in all fields.";
        errorEl.style.display = "block";
        return;
    }
    
    errorEl.style.display = "none";
    
    try {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ phone_number: phone, password: password, action: action })
        });
        
        const data = await res.json();
        
        if (data.success) {
            localStorage.setItem("customerPhone", phone);
            
            // Switch view
            document.getElementById("login-form-container").style.display = "none";
            document.getElementById("logged-in-container").style.display = "block";
            document.getElementById("logged-in-phone").textContent = phone;
            
            // Fetch past orders immediately
            await fetchCustomerOrders(phone);
        } else {
            errorEl.textContent = data.message || "Login failed.";
            errorEl.style.display = "block";
        }
    } catch (e) {
        console.error(e);
        errorEl.textContent = "Error connecting to server.";
        errorEl.style.display = "block";
    }
}

async function fetchCustomerOrders(phone) {
    const resultsContainer = document.getElementById("customer-orders-results");
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `<div style="text-align: center; padding: 1rem;"><span class="spinner" style="display: inline-block; position: static; margin: 0;"></span> Retrieving orders...</div>`;
    
    try {
        const res = await fetch(`/api/my/orders`);
        if (!res.ok) throw new Error("Server error fetching tracked orders.");
        
        const orders = await res.json();
        
        if (orders.length === 0) {
            resultsContainer.innerHTML = `
                <div style="text-align: center; padding: 1.5rem 0; color: var(--text-secondary);">
                    <i data-lucide="info" style="width: 24px; height: 24px; margin-bottom: 0.5rem; color: var(--text-muted);"></i>
                    <p style="font-size: 0.85rem;">No orders placed yet for phone number: <strong>${phone}</strong></p>
                </div>
            `;
            lucide.createIcons();
            return;
        }
        
        resultsContainer.innerHTML = orders.map(order => {
            const isDelivered = order.status === 'Delivered';
            const statusLabel = isDelivered ? 'Delivered ✓' : 'Processing ⏳';
            const statusColor = isDelivered ? '#2E7D32' : '#B12704';
            const estDeliveryHTML = (!isDelivered && order.estimated_delivery) ? `
                <div style="font-size: 0.75rem; color: var(--color-orange-dark); font-weight: 700; margin-top: 0.2rem;">
                    Expected Delivery: ${order.estimated_delivery}
                </div>
            ` : '';
            
            return `
            <div style="background-color: var(--bg-tertiary); border: 1px solid var(--border-soft); padding: 1rem; border-radius: 4px; font-size: 0.8rem; display: flex; flex-direction: column; gap: 0.4rem; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-soft); padding-bottom: 0.4rem; margin-bottom: 0.4rem;">
                    <span style="font-weight: 700; color: var(--color-orange-dark);">${escapeHTML(order.order_id)}</span>
                    <span style="font-size: 0.75rem; font-weight: 700; color: ${statusColor};">
                        ${statusLabel}
                    </span>
                </div>
                ${estDeliveryHTML}
                <div style="background-color: var(--bg-secondary); padding: 0.5rem; border-radius: 3px; margin: 0.3rem 0;">
                    <ul style="list-style: none; padding-left: 0; display: flex; flex-direction: column; gap: 0.25rem;">
                        ${order.order_details.map(item => `
                            <li style="display: flex; justify-content: space-between;">
                                <span>${escapeHTML(item.title)} (Size: ${escapeHTML(item.size)}) x ${item.qty}</span>
                                <span>₹${(item.price * item.qty).toFixed(2)}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 700; border-top: 1px solid var(--border-soft); padding-top: 0.4rem; margin-top: 0.4rem;">
                    <span>Total Payment:</span>
                    <span style="color: var(--color-orange-dark); font-size: 0.95rem;">₹${order.total_amount.toFixed(2)}</span>
                </div>
            </div>
            `;
        }).join('');
        
        lucide.createIcons();
    } catch (e) {
        console.error(e);
        resultsContainer.innerHTML = `<p style="color: red; text-align: center; font-size: 0.8rem;">Failed to retrieve orders. Please try again later.</p>`;
    }
}

function handleCustomerLogout() {
    localStorage.removeItem("customerPhone");
    
    // Switch view back to login form
    document.getElementById("login-form-container").style.display = "block";
    document.getElementById("logged-in-container").style.display = "none";
    document.getElementById("customer-phone-input").value = "";
    document.getElementById("customer-password-input").value = "";
    document.getElementById("customer-login-error").style.display = "none";
}

function switchLoginTab(mode) {
    const btnSignin = document.getElementById("btn-login-tab-signin");
    const btnSignup = document.getElementById("btn-login-tab-signup");
    const actionInput = document.getElementById("login-action-type");
    const explainerText = document.getElementById("login-explainer-text");
    const submitBtn = document.getElementById("customer-login-submit-btn");
    
    if (mode === 'signin') {
        btnSignin.classList.add("active");
        btnSignin.style.borderBottom = "2px solid var(--amazon-blue)";
        btnSignin.style.color = "var(--text-primary)";
        
        btnSignup.classList.remove("active");
        btnSignup.style.borderBottom = "none";
        btnSignup.style.color = "var(--text-secondary)";
        
        actionInput.value = "signin";
        explainerText.textContent = "Sign in to your customer account using your phone number and password.";
        submitBtn.textContent = "Sign In";
    } else {
        btnSignup.classList.add("active");
        btnSignup.style.borderBottom = "2px solid var(--amazon-blue)";
        btnSignup.style.color = "var(--text-primary)";
        
        btnSignin.classList.remove("active");
        btnSignin.style.borderBottom = "none";
        btnSignin.style.color = "var(--text-secondary)";
        
        actionInput.value = "signup";
        explainerText.textContent = "Create a new account to track orders and save your delivery details.";
        submitBtn.textContent = "Create Account";
    }
    
    // Clear errors when switching
    document.getElementById("customer-login-error").style.display = "none";
}



// Add Sizes Toggle Listener
document.addEventListener('DOMContentLoaded', () => {
    const hasSizesRadios = document.querySelectorAll('input[name="hasSizes"]');
    const sizesContainer = document.getElementById('sizesInputContainer');
    const sizesInput = document.getElementById('productSizes');
    if (hasSizesRadios.length > 0) {
        hasSizesRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'yes') {
                    sizesContainer.classList.remove('hidden');
                } else {
                    sizesContainer.classList.add('hidden');
                    sizesInput.value = '';
                }
            });
        });
    }
});

// ==========================================================================
// 11. Admin Features (Stats, Analytics, Export, Modals)
// ==========================================================================

async function loadStats() {
    try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        if(data.success) {
            document.getElementById('stat-revenue').textContent = `₹${data.data.revenue.toFixed(2)}`;
            document.getElementById('stat-total-orders').textContent = data.data.total_orders;
            document.getElementById('stat-today-orders').textContent = data.data.today_orders;
            document.getElementById('stat-low-stock').textContent = data.data.low_stock_items;
        }
    } catch (e) {
        console.error("Failed to load stats:", e);
    }
}

let revenueChartInstance, ordersChartInstance, statusChartInstance;
async function loadAnalytics() {
    try {
        const [analyticsRes, ordersRes] = await Promise.all([
            fetch('/api/analytics'),
            fetch('/api/orders')
        ]);
        const analyticsData = await analyticsRes.json();
        const orders = await ordersRes.json();

        // ── Business Math ──────────────────────────────────────────────
        // Total Revenue = sum of all order amounts
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

        // Average Order Value (AOV) = Total Revenue / Number of Orders
        const totalOrderCount = orders.length;
        const aov = totalOrderCount > 0 ? (totalRevenue / totalOrderCount) : 0;

        // Delivered Rate = Delivered Orders / Total Orders × 100
        const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
        const deliveryRate = totalOrderCount > 0 ? ((deliveredCount / totalOrderCount) * 100).toFixed(1) : 0;

        // Top Selling Items — count quantity of each product across all orders
        const productSales = {};
        orders.forEach(o => {
            (o.order_details || []).forEach(item => {
                if (!productSales[item.title]) productSales[item.title] = { qty: 0, revenue: 0 };
                productSales[item.title].qty += item.qty || 1;
                productSales[item.title].revenue += (item.price || 0) * (item.qty || 1);
            });
        });
        const topProducts = Object.entries(productSales)
            .sort((a, b) => b[1].qty - a[1].qty)
            .slice(0, 5);

        // ── Update KPI Cards ───────────────────────────────────────────
        document.getElementById('kpi-revenue').textContent = `₹${totalRevenue.toFixed(2)}`;
        document.getElementById('kpi-aov').textContent = `₹${aov.toFixed(2)}`;
        document.getElementById('kpi-orders').textContent = totalOrderCount;
        document.getElementById('kpi-delivery-rate').textContent = `${deliveryRate}%`;

        // ── Top Products List ──────────────────────────────────────────
        const topEl = document.getElementById('kpi-top-products');
        if (topEl) {
            topEl.innerHTML = topProducts.length === 0
                ? '<p style="color:var(--text-secondary); font-size:0.8rem;">No sales data yet.</p>'
                : topProducts.map(([name, data], i) => `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:0.4rem 0; border-bottom:1px solid var(--border-soft); font-size:0.8rem;">
                        <span><strong>#${i+1}</strong> ${escapeHTML(name)}</span>
                        <span style="color:var(--text-secondary);">${data.qty} sold · ₹${data.revenue.toFixed(0)}</span>
                    </div>`).join('');
        }

        // ── Charts ─────────────────────────────────────────────────────
        // Use real data if available, else show mock monthly data so chart is never blank
        const MOCK_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        let labels, revData, ordData, statuses;

        if (analyticsData.success && analyticsData.data.dates && analyticsData.data.dates.length > 0) {
            labels  = analyticsData.data.dates;
            revData = analyticsData.data.revenue;
            ordData = analyticsData.data.orders;
            statuses = analyticsData.data.statuses;
        } else {
            // Fallback: show last 6 months with sample trend so chart is visible
            const now = new Date();
            labels   = Array.from({length:6}, (_,i) => MOCK_MONTHS[(now.getMonth()-5+i+12)%12]);
            revData  = [0, 0, 0, 0, 0, 0];
            ordData  = [0, 0, 0, 0, 0, 0];
            statuses = { Pending: 0, Delivered: 0 };
        }

        // Revenue Line Chart
        const revCanvas = document.getElementById('revenueChart');
        revCanvas.style.height = '180px';
        if (revenueChartInstance) revenueChartInstance.destroy();
        revenueChartInstance = new Chart(revCanvas.getContext('2d'), {
            type: 'line',
            data: { labels, datasets: [{
                label: 'Revenue (₹)', data: revData,
                borderColor: '#0d9488', backgroundColor: 'rgba(13,148,136,0.1)',
                fill: true, tension: 0.4, pointRadius: 4,
                pointBackgroundColor: '#0d9488', borderWidth: 3
            }]},
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ' ₹' + ctx.parsed.y.toFixed(2) } } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#6b7280' } },
                    y: { beginAtZero: true, grid: { color: '#f0f0f0' }, ticks: { color: '#6b7280', callback: v => '₹'+v } }
                }
            }
        });

        // Orders Bar Chart
        const ordCanvas = document.getElementById('ordersChart');
        ordCanvas.style.height = '180px';
        if (ordersChartInstance) ordersChartInstance.destroy();
        ordersChartInstance = new Chart(ordCanvas.getContext('2d'), {
            type: 'bar',
            data: { labels, datasets: [{
                label: 'Orders', data: ordData,
                backgroundColor: 'rgba(37,99,235,0.75)', borderRadius: 5, borderWidth: 0
            }]},
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#6b7280' } },
                    y: { beginAtZero: true, grid: { color: '#f0f0f0' }, ticks: { stepSize: 1, color: '#6b7280' } }
                }
            }
        });

        // Status Doughnut
        const statCanvas = document.getElementById('statusChart');
        statCanvas.style.height = '150px';
        if (statusChartInstance) statusChartInstance.destroy();
        const statusLabels = Object.keys(statuses);
        const statusValues = Object.values(statuses);
        statusChartInstance = new Chart(statCanvas.getContext('2d'), {
            type: 'doughnut',
            data: { labels: statusLabels, datasets: [{ data: statusValues.length ? statusValues : [1], backgroundColor: statusValues.length ? ['#FFB74D','#81C784','#e74c3c'] : ['#e5e7eb'] }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 10 } } }
            }
        });

    } catch (e) {
        console.error('Failed to load analytics:', e);
    }
}

let pendingConfirmAction = null;
function showConfirmModal(action) {
    pendingConfirmAction = action;
    const modal = document.getElementById('confirm-modal-overlay');
    const title = document.getElementById('confirm-title');
    const msg = document.getElementById('confirm-message');
    const icon = document.getElementById('confirm-icon');
    const inputWrap = document.getElementById('confirm-input-wrapper');
    const btn = document.getElementById('confirm-action-btn');

    inputWrap.style.display = 'none';
    document.getElementById('confirm-keyword-input').value = '';

    if (action === 'publish') {
        icon.innerHTML = '☁️';
        title.textContent = 'Publish to Cloud';
        msg.textContent = 'This will sync all local changes to the live cloud database. Continue?';
        btn.textContent = 'Publish';
        btn.className = 'btn btn-primary';
    } else if (action === 'reset') {
        icon.innerHTML = '⚠️';
        title.textContent = 'Factory Reset';
        msg.textContent = 'This will delete all custom products and restore default luxury garments. Type RESET to confirm.';
        inputWrap.style.display = 'block';
        btn.textContent = 'Reset Store';
        btn.className = 'btn btn-primary';
        btn.style.backgroundColor = '#ff4d4d';
    } else if (action === 'clear-orders') {
        icon.innerHTML = '🗑️';
        title.textContent = 'Clear Orders';
        msg.textContent = 'This will permanently delete all order history. Type CLEAR to confirm.';
        inputWrap.style.display = 'block';
        document.getElementById('confirm-keyword-input').placeholder = 'Type CLEAR to confirm';
        btn.textContent = 'Clear History';
        btn.className = 'btn btn-primary';
        btn.style.backgroundColor = '#ff4d4d';
    }

    modal.style.display = 'flex';
}

function closeConfirmModal() {
    document.getElementById('confirm-modal-overlay').style.display = 'none';
    pendingConfirmAction = null;
}

const confirmBtn = document.getElementById('confirm-action-btn');
if(confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
        const input = document.getElementById('confirm-keyword-input').value.trim();
        if (pendingConfirmAction === 'reset' && input !== 'RESET') return alert('Type RESET to confirm.');
        if (pendingConfirmAction === 'clear-orders' && input !== 'CLEAR') return alert('Type CLEAR to confirm.');

        closeConfirmModal();

        if (pendingConfirmAction === 'publish') {
            publishProductsToDb();
        } else if (pendingConfirmAction === 'reset') {
            await resetDbProducts();
        } else if (pendingConfirmAction === 'clear-orders') {
            await fetch('/api/orders/clear', { method: 'POST' });
            renderAdminOrders();
        }
    });
}

function showExportModal() {
    document.getElementById('export-modal-overlay').style.display = 'flex';
}
function closeExportModal() {
    document.getElementById('export-modal-overlay').style.display = 'none';
}
function executeExportCSV() {
    const start = document.getElementById('export-start-date').value;
    const end = document.getElementById('export-end-date').value;
    let url = '/api/orders/export';
    if(start && end) url += `?start_date=${start}&end_date=${end}`;
    window.location.href = url;
    closeExportModal();
}

function openEditForm(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) {
        alert('Could not find product to edit. Please refresh the page.');
        return;
    }
    
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-product-title').value = product.title;
    document.getElementById('edit-product-price').value = product.price;
    document.getElementById('edit-product-stock').value = product.stock;
    document.getElementById('edit-product-dept').value = product.department;
    document.getElementById('edit-product-desc').value = product.desc || '';
    
    const catSelect = document.getElementById('edit-product-category');
    catSelect.innerHTML = '';
    const allCats = ['Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Footwear', 'Ethnic Wear'];
    if (!allCats.includes(product.category)) allCats.push(product.category);
    allCats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        if (c === product.category) opt.selected = true;
        catSelect.appendChild(opt);
    });

    // Show the modal as flex
    document.getElementById('edit-product-modal-overlay').style.display = 'flex';
}

function closeEditProductModal() {
    document.getElementById('edit-product-modal-overlay').style.display = 'none';
}

async function handleEditProductSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-product-id').value;
    const body = {
        title: document.getElementById('edit-product-title').value,
        price: parseFloat(document.getElementById('edit-product-price').value),
        stock: parseInt(document.getElementById('edit-product-stock').value),
        department: document.getElementById('edit-product-dept').value,
        category: document.getElementById('edit-product-category').value,
        desc: document.getElementById('edit-product-desc').value,
        details: document.getElementById('edit-product-details') ? document.getElementById('edit-product-details').value : '',
        sizes: document.getElementById('edit-product-sizes') ? document.getElementById('edit-product-sizes').value : ''
    };

    try {
        const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
            closeEditProductModal();
            await loadProductsFromDb();
            renderCatalog();
            renderHomeFeatured();
            renderAdminProductList();
            alert('Garment updated successfully!');
        } else {
            alert('Failed to update: ' + data.message);
        }
    } catch(e) {
        console.error(e);
        alert('Error saving changes.');
    }
}

