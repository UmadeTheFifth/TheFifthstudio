/* ===================================
   FIREBASE-POWERED GALLERY
   ================================== */

import { auth, db, storage } from '../firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    collection, 
    query, 
    where, 
    getDocs,
    doc,
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
    ref, 
    getDownloadURL 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

let galleryItems = [];
let currentImageIndex = 0;
let isSelectionMode = false;
let selectedItems = [];
let currentClientId = null;

// Check authentication and load gallery
const initGallery = () => {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            // No user logged in - redirect to login
            window.location.href = 'login.html';
            return;
        }

        // Get client data from Firestore
        const clientEmail = user.email;
        await loadClientGallery(clientEmail);
    });
};

// Load client gallery from Firestore
const loadClientGallery = async (email) => {
    try {
        // Query Firestore for client by email
        const q = query(
            collection(db, 'clients'), 
            where('email', '==', email)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            showEmptyGallery();
            return;
        }

        // Get client document
        const clientDoc = querySnapshot.docs[0];
        currentClientId = clientDoc.id;
        const clientData = clientDoc.data();

        // Update client name
        const clientNameElement = document.getElementById('clientName');
        if (clientNameElement) {
            clientNameElement.textContent = clientData.name || 'Guest';
        }

        // Load gallery items
        if (clientData.gallery && clientData.gallery.length > 0) {
            galleryItems = clientData.gallery.map((item, index) => ({
                ...item,
                index,
                id: `gallery-item-${index}`
            }));
            renderGallery();
        } else {
            showEmptyGallery();
        }

    } catch (error) {
        console.error('Error loading gallery:', error);
        showEmptyGallery();
        alert('Error loading your gallery. Please try logging in again.');
    }
};

// Show empty gallery message
const showEmptyGallery = () => {
    const galleryGrid = document.getElementById('galleryGrid');
    const galleryEmpty = document.getElementById('galleryEmpty');
    
    if (galleryGrid) galleryGrid.style.display = 'none';
    if (galleryEmpty) galleryEmpty.style.display = 'block';
};

// Render gallery grid
const renderGallery = () => {
    const galleryGrid = document.getElementById('galleryGrid');
    const galleryEmpty = document.getElementById('galleryEmpty');
    
    if (!galleryGrid) return;

    galleryGrid.innerHTML = '';
    galleryGrid.style.display = 'grid';
    if (galleryEmpty) galleryEmpty.style.display = 'none';

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

    // Create image/video element
    if (item.type === 'video') {
        const video = document.createElement('video');
        video.src = item.url;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        div.appendChild(video);
    } else {
        const img = document.createElement('img');
        img.src = item.url;
        img.alt = item.filename || 'Gallery image';
        img.loading = 'lazy';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        
        // Add error handler for broken images
        img.onerror = () => {
            const placeholder = document.createElement('div');
            placeholder.className = 'gallery-placeholder';
            placeholder.innerHTML = `
                <span class="placeholder-icon">—</span>
                <p>Image unavailable</p>
            `;
            div.innerHTML = '';
            div.appendChild(placeholder);
        };
        
        div.appendChild(img);
    }

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

    if (!lightbox) return;

    // Hide both initially
    lightboxImage.style.display = 'none';
    lightboxVideo.style.display = 'none';

    if (item.type === 'video') {
        lightboxVideo.style.display = 'block';
        lightboxVideo.querySelector('source').src = item.url;
        lightboxVideo.load();
    } else {
        lightboxImage.style.display = 'block';
        lightboxImage.src = item.url;
        lightboxImage.alt = item.filename || 'Gallery image';
    }

    counter.textContent = `${index + 1} / ${galleryItems.length}`;
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
const downloadCurrentItem = async () => {
    const item = galleryItems[currentImageIndex];
    
    try {
        // Fetch the image
        const response = await fetch(item.url);
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.filename || `image-${currentImageIndex + 1}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download error:', error);
        alert('Error downloading file. Please try again.');
    }
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
    if (countElement) {
        countElement.textContent = `${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''} selected`;
    }
};

// Download selected items
const downloadSelected = async () => {
    if (selectedItems.length === 0) {
        alert('Please select at least one item to download.');
        return;
    }
    
    // Download each selected item
    for (const index of selectedItems) {
        const item = galleryItems[index];
        
        try {
            const response = await fetch(item.url);
            const blob = await response.blob();
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = item.filename || `image-${index + 1}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            console.error('Download error:', error);
        }
    }
    
    alert(`Downloaded ${selectedItems.length} items successfully!`);
    toggleSelectionMode();
};

// Download all items
const downloadAll = async () => {
    if (!confirm(`Download all ${galleryItems.length} items from your gallery?`)) {
        return;
    }
    
    for (let i = 0; i < galleryItems.length; i++) {
        const item = galleryItems[i];
        
        try {
            const response = await fetch(item.url);
            const blob = await response.blob();
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = item.filename || `image-${i + 1}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            console.error('Download error:', error);
        }
    }
    
    alert(`Downloaded all ${galleryItems.length} items successfully!`);
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
    
    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            const { signOut } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
            await signOut(auth);
            window.location.href = 'login.html';
        }
    });
};

// Initialize gallery
const init = () => {
    // Only run on gallery page
    if (!window.location.pathname.includes('gallery.html')) {
        return;
    }

    setupEventListeners();
    initGallery();
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}