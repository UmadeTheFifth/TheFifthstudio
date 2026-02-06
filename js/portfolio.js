/* ===================================
   COMPANY PORTFOLIO GALLERY
   ================================== */

(function() {
    'use strict';

    let portfolioItems = [];
    let filteredItems = [];
    let currentImageIndex = 0;
    let currentCategory = 'all';

    // Load portfolio from localStorage
    const loadPortfolio = () => {
        const portfolio = localStorage.getItem('companyPortfolio');
        portfolioItems = portfolio ? JSON.parse(portfolio) : [];

        if (portfolioItems.length === 0) {
            // Initialize with demo data
            portfolioItems = [
                {
                    id: 'port1',
                    title: 'Elegant Wedding Ceremony',
                    category: 'weddings',
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
                    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400'
                },
                {
                    id: 'port2',
                    title: 'Professional Portrait',
                    category: 'portraits',
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800',
                    thumbnail: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400'
                },
                {
                    id: 'port3',
                    title: 'Corporate Event',
                    category: 'events',
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
                    thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400'
                },
                {
                    id: 'port4',
                    title: 'Fashion Editorial',
                    category: 'editorial',
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
                    thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400'
                },
                {
                    id: 'port5',
                    title: 'Product Photography',
                    category: 'commercial',
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
                    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
                },
                {
                    id: 'port6',
                    title: 'Reception Celebration',
                    category: 'weddings',
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
                    thumbnail: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400'
                }
            ];
            savePortfolio();
        }

        filterPortfolio('all');
    };

    // Save portfolio to localStorage
    const savePortfolio = () => {
        localStorage.setItem('companyPortfolio', JSON.stringify(portfolioItems));
    };

    // Filter portfolio by category
    const filterPortfolio = (category) => {
        currentCategory = category;
        
        if (category === 'all') {
            filteredItems = [...portfolioItems];
        } else {
            filteredItems = portfolioItems.filter(item => item.category === category);
        }

        renderPortfolio();
        updateFilterButtons();
    };

    // Render portfolio grid
    const renderPortfolio = () => {
        const portfolioGrid = document.getElementById('portfolioGrid');
        const portfolioEmpty = document.getElementById('portfolioEmpty');

        if (!portfolioGrid) return;

        portfolioGrid.innerHTML = '';

        if (filteredItems.length === 0) {
            portfolioGrid.style.display = 'none';
            if (portfolioEmpty) portfolioEmpty.style.display = 'block';
            return;
        }

        portfolioGrid.style.display = 'grid';
        if (portfolioEmpty) portfolioEmpty.style.display = 'none';

        filteredItems.forEach((item, index) => {
            const portfolioItem = createPortfolioItem(item, index);
            portfolioGrid.appendChild(portfolioItem);
        });
    };

    // Create portfolio item
    const createPortfolioItem = (item, index) => {
        const div = document.createElement('div');
        div.className = 'gallery-item animate-on-scroll';
        div.dataset.index = index;
        div.dataset.category = item.category;
        div.style.animationDelay = `${index * 0.05}s`;

        if (item.type === 'video') {
            div.innerHTML = `
                <video src="${item.url}" style="width:100%;height:100%;object-fit:cover;"></video>
                <div class="gallery-item-overlay">
                    <h3>${item.title}</h3>
                    <p>${formatCategory(item.category)}</p>
                </div>
                <div class="gallery-item-type">Video</div>
            `;
        } else {
            div.innerHTML = `
                <img src="${item.thumbnail || item.url}" alt="${item.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
                <div class="gallery-item-overlay">
                    <h3>${item.title}</h3>
                    <p>${formatCategory(item.category)}</p>
                </div>
                <div class="gallery-item-type">Photo</div>
            `;
        }

        div.addEventListener('click', () => openLightbox(index));

        return div;
    };

    // Format category name
    const formatCategory = (category) => {
        return category.charAt(0).toUpperCase() + category.slice(1);
    };

    // Update filter button states
    const updateFilterButtons = () => {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            if (btn.dataset.category === currentCategory) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };

    // Setup filter buttons
    const setupFilters = () => {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                filterPortfolio(category);
            });
        });
    };

    // Open lightbox
    const openLightbox = (index) => {
        currentImageIndex = index;
        const item = filteredItems[index];
        
        const lightbox = document.getElementById('lightbox');
        const lightboxImage = document.getElementById('lightboxImage');
        const lightboxVideo = document.getElementById('lightboxVideo');
        const lightboxTitle = document.getElementById('lightboxTitle');
        const lightboxCategory = document.getElementById('lightboxCategory');
        const counter = document.getElementById('lightboxCounter');

        if (!lightbox) return;

        // Update content
        lightboxImage.style.display = 'none';
        lightboxVideo.style.display = 'none';

        if (item.type === 'video') {
            lightboxVideo.style.display = 'block';
            lightboxVideo.querySelector('source').src = item.url;
            lightboxVideo.load();
        } else {
            lightboxImage.style.display = 'block';
            lightboxImage.src = item.url;
            lightboxImage.alt = item.title;
        }

        lightboxTitle.textContent = item.title;
        lightboxCategory.textContent = formatCategory(item.category);
        counter.textContent = `${index + 1} / ${filteredItems.length}`;

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // Close lightbox
    const closeLightbox = () => {
        const lightbox = document.getElementById('lightbox');
        const lightboxVideo = document.getElementById('lightboxVideo');
        
        if (!lightbox) return;
        
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        
        if (lightboxVideo.style.display === 'block') {
            lightboxVideo.pause();
        }
    };

    // Navigate lightbox
    const navigateLightbox = (direction) => {
        currentImageIndex += direction;
        
        if (currentImageIndex < 0) {
            currentImageIndex = filteredItems.length - 1;
        } else if (currentImageIndex >= filteredItems.length) {
            currentImageIndex = 0;
        }
        
        openLightbox(currentImageIndex);
    };

    // Setup event listeners
    const setupEventListeners = () => {
        // Lightbox controls
        document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
        document.getElementById('lightboxPrev')?.addEventListener('click', () => navigateLightbox(-1));
        document.getElementById('lightboxNext')?.addEventListener('click', () => navigateLightbox(1));

        // Close lightbox on background click
        document.getElementById('lightbox')?.addEventListener('click', (e) => {
            if (e.target.id === 'lightbox') {
                closeLightbox();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const lightbox = document.getElementById('lightbox');
            if (lightbox?.classList.contains('active')) {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') navigateLightbox(-1);
                if (e.key === 'ArrowRight') navigateLightbox(1);
            }
        });
    };

    // Add CSS for portfolio
    const injectPortfolioStyles = () => {
        if (document.getElementById('portfolio-styles')) return;

        const style = document.createElement('style');
        style.id = 'portfolio-styles';
        style.textContent = `
            .portfolio-filters {
                padding: 3rem 0 2rem;
                background-color: var(--secondary-bg);
            }

            .filter-buttons {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }

            .filter-btn {
                padding: 0.75rem 2rem;
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 50px;
                cursor: pointer;
                transition: all 0.3s var(--transition-smooth);
                font-family: var(--font-heading);
                font-size: 0.9rem;
                letter-spacing: 0.05em;
                text-transform: uppercase;
                color: var(--secondary-text);
            }

            .filter-btn:hover {
                background: var(--primary-color);
                color: #ffffff;
                border-color: var(--primary-color);
                transform: translateY(-2px);
            }

            .filter-btn.active {
                background: var(--primary-color);
                color: #ffffff;
                border-color: var(--primary-color);
            }

            .portfolio-section {
                padding: 5rem 0;
            }

            .portfolio-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 2rem;
            }

            .gallery-item-overlay {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
                padding: 2rem 1.5rem 1.5rem;
                transform: translateY(100%);
                transition: transform 0.4s var(--transition-smooth);
                color: #ffffff;
            }

            .gallery-item:hover .gallery-item-overlay {
                transform: translateY(0);
            }

            .gallery-item-overlay h3 {
                font-size: 1.1rem;
                margin-bottom: 0.25rem;
                color: #ffffff;
            }

            .gallery-item-overlay p {
                font-size: 0.85rem;
                opacity: 0.9;
                margin: 0;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .lightbox-details {
                text-align: center;
            }

            .lightbox-details h3 {
                color: #ffffff;
                margin-bottom: 0.5rem;
            }

            .lightbox-details p {
                color: rgba(255,255,255,0.8);
                font-size: 0.9rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin: 0;
            }

            .lightbox-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 2rem;
            }

            @media (max-width: 768px) {
                .portfolio-grid {
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .filter-buttons {
                    gap: 0.5rem;
                }

                .filter-btn {
                    padding: 0.625rem 1.5rem;
                    font-size: 0.85rem;
                }

                .lightbox-info {
                    flex-direction: column-reverse;
                    gap: 1rem;
                }
            }
        `;
        document.head.appendChild(style);
    };

    // Initialize
    const init = () => {
        if (!window.location.pathname.includes('portfolio.html')) return;

        injectPortfolioStyles();
        loadPortfolio();
        setupFilters();
        setupEventListeners();
    };

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for admin use
    window.PortfolioManager = {
        getPortfolio: () => portfolioItems,
        addItem: (item) => {
            portfolioItems.push({
                id: 'port' + Date.now(),
                ...item,
                uploadedAt: new Date().toISOString()
            });
            savePortfolio();
            loadPortfolio();
        },
        removeItem: (id) => {
            portfolioItems = portfolioItems.filter(item => item.id !== id);
            savePortfolio();
            loadPortfolio();
        },
        refresh: () => loadPortfolio()
    };
})();