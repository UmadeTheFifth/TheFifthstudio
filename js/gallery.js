/* ===================================
   GALLERY FUNCTIONALITY
   ================================== */

(function() {
    'use strict';

    let galleryItems = [];
    let currentImageIndex = 0;
    let isSelectionMode = false;
    let selectedItems = [];

    // Load gallery items for current user
    const loadGalleryItems = () => {
        const user = window.StudioAuth?.getCurrentUser();
        
        if (!user || !user.gallery) {
            showEmptyGallery();
            return;
        }

        galleryItems = user.gallery.map((item, index) => ({
            ...item,
            index,
            id: `gallery-item-${index}`
        }));

        if (galleryItems.length === 0) {
            showEmptyGallery();
        } else {
            renderGallery();
        }
    };

    // Show empty gallery message
    const showEmptyGallery = () => {
        document.getElementById('galleryGrid').style.display = 'none';
        document.getElementById('galleryEmpty').style.display = 'block';
    };

    // Render gallery grid
    const renderGallery = () => {
        const galleryGrid = document.getElementById('galleryGrid');
        galleryGrid.innerHTML = '';

        galleryItems.forEach((item, index) => {
            const galleryItem = createGalleryItem(item, index);
            galleryGrid.appendChild(galleryItem);
        });
    };

    // Create gallery item element
    const createGalleryItem = (item, index) => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.dataset.index = index;
        div.dataset.type = item.type;

        // Create placeholder content
        const placeholder = document.createElement('div');
        placeholder.className = 'gallery-placeholder';
        
        const icon = document.createElement('span');
        icon.className = 'placeholder-icon';
        icon.textContent = item.type === 'video' ? '🎥' : '📷';
        
        const title = document.createElement('p');
        title.textContent = item.title;
        
        placeholder.appendChild(icon);
        placeholder.appendChild(title);
        div.appendChild(placeholder);

        // Add type badge
        const typeBadge = document.createElement('div');
        typeBadge.className = 'gallery-item-type';
        typeBadge.textContent = item.type === 'video' ? 'Video' : 'Photo';
        div.appendChild(typeBadge);

        // Add checkbox for selection mode
        const checkbox = document.createElement('div');
        checkbox.className = 'gallery-item-checkbox';
        div.appendChild(checkbox);

        // Add click handler
        div.addEventListener('click', (e) => {
            if (isSelectionMode) {
                toggleItemSelection(index);
            } else {
                openLightbox(index);
            }
        });

        return div;
    };

    // Open lightbox
    const openLightbox = (index) => {
        currentImageIndex = index;
        const item = galleryItems[index];
        
        const lightbox = document.getElementById('lightbox');
        const lightboxImage = document.getElementById('lightboxImage');
        const lightboxVideo = document.getElementById('lightboxVideo');
        const counter = document.getElementById('lightboxCounter');

        // Hide both initially
        lightboxImage.style.display = 'none';
        lightboxVideo.style.display = 'none';

        if (item.type === 'video') {
            lightboxVideo.style.display = 'block';
            lightboxVideo.querySelector('source').src = `assets/videos/${item.url}.mp4`;
            lightboxVideo.load();
        } else {
            lightboxImage.style.display = 'block';
            lightboxImage.src = `assets/images/${item.url}.jpg`;
            lightboxImage.alt = item.title;
        }

        counter.textContent = `${index + 1} / ${galleryItems.length}`;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // Close lightbox
    const closeLightbox = () => {
        const lightbox = document.getElementById('lightbox');
        const lightboxVideo = document.getElementById('lightboxVideo');
        
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        
        // Pause video if playing
        if (lightboxVideo.style.display === 'block') {
            lightboxVideo.pause();
        }
    };

    // Navigate lightbox
    const navigateLightbox = (direction) => {
        currentImageIndex += direction;
        
        if (currentImageIndex < 0) {
            currentImageIndex = galleryItems.length - 1;
        } else if (currentImageIndex >= galleryItems.length) {
            currentImageIndex = 0;
        }
        
        openLightbox(currentImageIndex);
    };

    // Download current item from lightbox
    const downloadCurrentItem = () => {
        const item = galleryItems[currentImageIndex];
        alert(`Download initiated for: ${item.title}\n\nIn a production environment, this would download the file.`);
    };

    // Toggle selection mode
    const toggleSelectionMode = () => {
        isSelectionMode = !isSelectionMode;
        selectedItems = [];
        
        const galleryControls = document.getElementById('galleryControls');
        const selectModeBtn = document.getElementById('selectModeBtn');
        
        if (isSelectionMode) {
            galleryControls.style.display = 'block';
            selectModeBtn.textContent = 'Cancel Selection';
            selectModeBtn.classList.remove('btn-secondary');
            selectModeBtn.classList.add('btn-outline');
            
            // Add selectable class to all items
            document.querySelectorAll('.gallery-item').forEach(item => {
                item.classList.add('selectable');
            });
        } else {
            galleryControls.style.display = 'none';
            selectModeBtn.textContent = 'Select Multiple';
            selectModeBtn.classList.remove('btn-outline');
            selectModeBtn.classList.add('btn-secondary');
            
            // Remove selectable class from all items
            document.querySelectorAll('.gallery-item').forEach(item => {
                item.classList.remove('selectable', 'selected');
            });
        }
        
        updateSelectionCount();
    };

    // Toggle item selection
    const toggleItemSelection = (index) => {
        const itemElement = document.querySelector(`[data-index="${index}"]`);
        
        if (selectedItems.includes(index)) {
            selectedItems = selectedItems.filter(i => i !== index);
            itemElement.classList.remove('selected');
        } else {
            selectedItems.push(index);
            itemElement.classList.add('selected');
        }
        
        updateSelectionCount();
    };

    // Select all items
    const selectAll = () => {
        selectedItems = galleryItems.map((_, index) => index);
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.classList.add('selected');
        });
        updateSelectionCount();
    };

    // Deselect all items
    const deselectAll = () => {
        selectedItems = [];
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.classList.remove('selected');
        });
        updateSelectionCount();
    };

    // Update selection count
    const updateSelectionCount = () => {
        const countElement = document.getElementById('selectionCount');
        countElement.textContent = `${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''} selected`;
    };

    // Download selected items
    const downloadSelected = () => {
        if (selectedItems.length === 0) {
            alert('Please select at least one item to download.');
            return;
        }
        
        const itemNames = selectedItems.map(i => galleryItems[i].title).join('\n');
        alert(`Download initiated for ${selectedItems.length} items:\n\n${itemNames}\n\nIn a production environment, these files would be downloaded as a ZIP.`);
        
        toggleSelectionMode();
    };

    // Download all items
    const downloadAll = () => {
        if (confirm(`Download all ${galleryItems.length} items from your gallery?`)) {
            alert(`Download initiated for all ${galleryItems.length} items.\n\nIn a production environment, this would download a ZIP file with all your media.`);
        }
    };

    // Setup event listeners
    const setupEventListeners = () => {
        // Lightbox controls
        document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
        document.getElementById('lightboxPrev')?.addEventListener('click', () => navigateLightbox(-1));
        document.getElementById('lightboxNext')?.addEventListener('click', () => navigateLightbox(1));
        document.getElementById('lightboxDownload')?.addEventListener('click', downloadCurrentItem);

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

        // Gallery controls
        document.getElementById('selectModeBtn')?.addEventListener('click', toggleSelectionMode);
        document.getElementById('downloadAllBtn')?.addEventListener('click', downloadAll);
        document.getElementById('selectAllBtn')?.addEventListener('click', selectAll);
        document.getElementById('deselectAllBtn')?.addEventListener('click', deselectAll);
        document.getElementById('downloadSelectedBtn')?.addEventListener('click', downloadSelected);
        document.getElementById('cancelSelectBtn')?.addEventListener('click', toggleSelectionMode);
    };

    // Initialize gallery
    const init = () => {
        // Only run on gallery page
        if (!window.location.pathname.includes('gallery.html')) {
            return;
        }

        loadGalleryItems();
        setupEventListeners();
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();