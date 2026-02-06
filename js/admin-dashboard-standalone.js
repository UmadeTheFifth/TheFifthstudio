/* ===================================
   ADMIN DASHBOARD - SEPARATE GALLERIES
   ================================== */

(function() {
    'use strict';

    let currentPortfolioFile = null;
    let currentPortfolioDataURL = null;

    // Get/Save functions
    const getClients = () => JSON.parse(localStorage.getItem('studioClients') || '[]');
    const saveClients = (clients) => localStorage.setItem('studioClients', JSON.stringify(clients));
    const getPortfolio = () => JSON.parse(localStorage.getItem('companyPortfolio') || '[]');
    const savePortfolio = (portfolio) => localStorage.setItem('companyPortfolio', JSON.stringify(portfolio));

    // Initialize demo data
    const initializeDemoData = () => {
        if (getClients().length === 0) {
            const demoClients = [
                {
                    id: 'client1',
                    name: 'John Doe',
                    email: 'john.doe@email.com',
                    password: 'password123',
                    sessionType: 'Wedding',
                    sessionDate: '2024-12-15',
                    gallery: [],
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'client2',
                    name: 'Sarah Smith',
                    email: 'sarah.smith@email.com',
                    password: 'password456',
                    sessionType: 'Portrait',
                    sessionDate: '2025-01-02',
                    gallery: [],
                    createdAt: new Date().toISOString()
                }
            ];
            saveClients(demoClients);
        }
    };

    // Navigation
    const setupNavigation = () => {
        const navItems = document.querySelectorAll('.admin-nav-item');
        const sections = document.querySelectorAll('.admin-section');
        
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const sectionId = item.dataset.section + '-section';
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                sections.forEach(section => section.classList.remove('active'));
                document.getElementById(sectionId)?.classList.add('active');
                
                // Load data when switching sections
                if (sectionId === 'portfolio-section') loadPortfolioAdmin();
            });
        });
    };

    // Load clients
    const loadClients = () => {
        const clientsGrid = document.getElementById('clientsGrid');
        const uploadClient = document.getElementById('uploadClient');
        
        if (!clientsGrid) return;
        
        const clients = getClients();
        clientsGrid.innerHTML = '';
        
        if (uploadClient) {
            uploadClient.innerHTML = '<option value="">Choose a client...</option>';
        }
        
        if (clients.length === 0) {
            clientsGrid.innerHTML = '<p style="text-align: center; color: var(--muted-text); padding: 3rem;">No clients yet. Add your first client to get started.</p>';
            return;
        }
        
        clients.forEach((client) => {
            const card = createClientCard(client);
            clientsGrid.appendChild(card);
            
            if (uploadClient) {
                const option = document.createElement('option');
                option.value = client.id;
                option.textContent = `${client.name} (${client.gallery?.length || 0} images)`;
                uploadClient.appendChild(option);
            }
        });
    };

    // Create client card
    const createClientCard = (client) => {
        const card = document.createElement('div');
        card.className = 'client-card';
        card.innerHTML = `
            <div class="client-card-header">
                <div class="client-info">
                    <h3>${client.name}</h3>
                    <p>${client.email}</p>
                    <p style="font-size: 0.85rem; margin-top: 0.5rem;">${client.sessionType || 'N/A'}</p>
                </div>
                <div class="client-actions">
                    <button class="icon-btn" onclick="viewClientGallery('${client.id}')" title="View Gallery">👁️</button>
                    <button class="icon-btn" onclick="deleteClient('${client.id}')" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="client-stats">
                <div class="stat-item">
                    <span class="stat-value">${client.gallery?.length || 0}</span>
                    <span class="stat-label">Private Images</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${client.sessionDate || 'N/A'}</span>
                    <span class="stat-label">Session Date</span>
                </div>
            </div>
        `;
        return card;
    };

    // Add client
    const setupAddClient = () => {
        const addClientBtn = document.getElementById('addClientBtn');
        const modal = document.getElementById('addClientModal');
        const closeBtn = document.getElementById('closeAddClientModal');
        const cancelBtn = document.getElementById('cancelAddClient');
        const form = document.getElementById('addClientForm');
        
        addClientBtn?.addEventListener('click', () => modal.classList.add('active'));
        
        [closeBtn, cancelBtn].forEach(btn => {
            btn?.addEventListener('click', () => {
                modal.classList.remove('active');
                form.reset();
            });
        });
        
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const clients = getClients();
            const newClient = {
                id: 'client' + Date.now(),
                name: document.getElementById('clientName').value,
                email: document.getElementById('clientEmail').value,
                password: document.getElementById('clientPassword').value,
                sessionType: document.getElementById('sessionType').value,
                sessionDate: document.getElementById('sessionDate').value,
                gallery: [],
                createdAt: new Date().toISOString()
            };
            
            clients.push(newClient);
            saveClients(clients);
            
            alert('✅ Client added successfully!');
            modal.classList.remove('active');
            form.reset();
            loadClients();
        });
    };

    // CLIENT GALLERY UPLOAD (Private, per client)
    const setupClientUpload = () => {
        const uploadZone = document.getElementById('clientUploadZone');
        const fileInput = document.getElementById('clientFileInput');
        
        uploadZone?.addEventListener('click', () => fileInput.click());
        
        uploadZone?.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('drag-over');
        });
        
        uploadZone?.addEventListener('dragleave', () => {
            uploadZone.classList.remove('drag-over');
        });
        
        uploadZone?.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('drag-over');
            handleClientFileUpload(Array.from(e.dataTransfer.files));
        });
        
        fileInput?.addEventListener('change', (e) => {
            handleClientFileUpload(Array.from(e.target.files));
        });
    };

    const handleClientFileUpload = (files) => {
        const clientId = document.getElementById('uploadClient').value;
        
        if (!clientId) {
            alert('⚠️ Please select a client first.');
            return;
        }
        
        const clients = getClients();
        const client = clients.find(c => c.id === clientId);
        
        if (!client) {
            alert('❌ Client not found.');
            return;
        }
        
        const progressContainer = document.getElementById('clientUploadProgress');
        const progressFill = document.getElementById('clientProgressFill');
        const progressText = document.getElementById('clientProgressText');
        const uploadedFiles = document.getElementById('clientUploadedFiles');
        
        progressContainer.style.display = 'block';
        uploadedFiles.innerHTML = '';
        
        let uploaded = 0;
        const total = files.length;
        
        files.forEach((file) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                client.gallery.push({
                    type: file.type.startsWith('video') ? 'video' : 'image',
                    url: e.target.result,
                    filename: file.name,
                    uploadedAt: new Date().toISOString()
                });
                
                uploaded++;
                progressFill.style.width = (uploaded / total * 100) + '%';
                progressText.textContent = `Uploading to ${client.name}'s gallery... ${uploaded}/${total}`;
                
                const preview = document.createElement('div');
                preview.className = 'uploaded-file';
                preview.innerHTML = file.type.startsWith('image') 
                    ? `<img src="${e.target.result}" alt="${file.name}">`
                    : `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:var(--secondary-bg);">📹</div>`;
                uploadedFiles.appendChild(preview);
                
                if (uploaded === total) {
                    saveClients(clients);
                    progressText.textContent = `✅ Successfully uploaded ${total} file(s) to ${client.name}'s private gallery!`;
                    setTimeout(() => {
                        progressContainer.style.display = 'none';
                        progressFill.style.width = '0%';
                    }, 3000);
                    loadClients();
                }
            };
            
            reader.readAsDataURL(file);
        });
    };

    // COMPANY PORTFOLIO UPLOAD (Public)
    const setupPortfolioUpload = () => {
        const uploadZone = document.getElementById('portfolioUploadZone');
        const fileInput = document.getElementById('portfolioFileInput');
        const form = document.getElementById('portfolioForm');
        const addBtn = document.getElementById('addToPortfolioBtn');
        const cancelBtn = document.getElementById('cancelPortfolioBtn');
        
        uploadZone?.addEventListener('click', () => fileInput.click());
        
        fileInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                currentPortfolioFile = file;
                currentPortfolioDataURL = event.target.result;
                form.style.display = 'block';
                uploadZone.style.display = 'none';
            };
            reader.readAsDataURL(file);
        });
        
        addBtn?.addEventListener('click', () => {
            const title = document.getElementById('portfolioTitle').value;
            const category = document.getElementById('portfolioCategory').value;
            
            if (!title || !category) {
                alert('⚠️ Please enter both title and category.');
                return;
            }
            
            const portfolio = getPortfolio();
            portfolio.push({
                id: 'port' + Date.now(),
                title: title,
                category: category,
                type: currentPortfolioFile.type.startsWith('video') ? 'video' : 'image',
                url: currentPortfolioDataURL,
                thumbnail: currentPortfolioDataURL,
                uploadedAt: new Date().toISOString()
            });
            
            savePortfolio(portfolio);
            alert('✅ Added to company portfolio!');
            
            // Reset
            form.style.display = 'none';
            uploadZone.style.display = 'block';
            document.getElementById('portfolioTitle').value = '';
            document.getElementById('portfolioCategory').value = '';
            currentPortfolioFile = null;
            currentPortfolioDataURL = null;
            fileInput.value = '';
            
            loadPortfolioAdmin();
            if (window.PortfolioManager) window.PortfolioManager.refresh();
        });
        
        cancelBtn?.addEventListener('click', () => {
            form.style.display = 'none';
            uploadZone.style.display = 'block';
            currentPortfolioFile = null;
            currentPortfolioDataURL = null;
            fileInput.value = '';
        });
    };

    const loadPortfolioAdmin = () => {
        const grid = document.getElementById('portfolioGridAdmin');
        if (!grid) return;
        
        const portfolio = getPortfolio();
        grid.innerHTML = '';
        
        if (portfolio.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: var(--muted-text); padding: 3rem;">No portfolio images yet. Upload your first image!</p>';
            return;
        }
        
        portfolio.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'carousel-image-item';
            div.innerHTML = `
                <img src="${item.thumbnail || item.url}" alt="${item.title}">
                <div class="portfolio-info">
                    <strong>${item.title}</strong>
                    <p>${item.category}</p>
                </div>
                <div class="carousel-image-actions">
                    <button onclick="deletePortfolioItem('${item.id}')" title="Delete">🗑️</button>
                </div>
            `;
            grid.appendChild(div);
        });
    };

    // Setup settings
    const setupSettings = () => {
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        
        saveSettingsBtn?.addEventListener('click', () => {
            const settings = {
                studioName: document.getElementById('studioName').value,
                contactEmail: document.getElementById('contactEmail').value,
                contactPhone: document.getElementById('contactPhone').value
            };
            
            localStorage.setItem('studioSettings', JSON.stringify(settings));
            alert('✅ Settings saved successfully!');
        });
        
        const settings = JSON.parse(localStorage.getItem('studioSettings') || '{}');
        if (settings.studioName) document.getElementById('studioName').value = settings.studioName;
        if (settings.contactEmail) document.getElementById('contactEmail').value = settings.contactEmail;
        if (settings.contactPhone) document.getElementById('contactPhone').value = settings.contactPhone;
    };

    // Global functions
    window.viewClientGallery = (clientId) => {
        const clients = getClients();
        const client = clients.find(c => c.id === clientId);
        
        if (!client) {
            alert('Client not found.');
            return;
        }
        
        const modal = document.getElementById('viewClientModal');
        const title = document.getElementById('viewClientTitle');
        const gallery = document.getElementById('clientGalleryGrid');
        
        title.textContent = `${client.name}'s Private Gallery`;
        gallery.innerHTML = '';
        
        if (client.gallery.length === 0) {
            gallery.innerHTML = '<p style="text-align: center; padding: 3rem; color: var(--muted-text);">No images uploaded yet.</p>';
        } else {
            client.gallery.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'gallery-image-item';
                div.innerHTML = item.type === 'image' 
                    ? `<img src="${item.url}" alt="${item.filename}">
                       <button class="file-remove" onclick="removeClientImage('${clientId}', ${index})">&times;</button>`
                    : `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:var(--secondary-bg);">📹</div>
                       <button class="file-remove" onclick="removeClientImage('${clientId}', ${index})">&times;</button>`;
                gallery.appendChild(div);
            });
        }
        
        modal.classList.add('active');
        document.getElementById('closeViewClientModal').onclick = () => modal.classList.remove('active');
    };

    window.deleteClient = (clientId) => {
        if (confirm('⚠️ Are you sure? This will delete the client and all their private images.')) {
            const clients = getClients();
            saveClients(clients.filter(c => c.id !== clientId));
            alert('✅ Client deleted.');
            loadClients();
        }
    };

    window.removeClientImage = (clientId, imageIndex) => {
        const clients = getClients();
        const client = clients.find(c => c.id === clientId);
        
        if (client) {
            client.gallery.splice(imageIndex, 1);
            saveClients(clients);
            viewClientGallery(clientId);
            loadClients();
        }
    };

    window.deletePortfolioItem = (id) => {
        if (confirm('Delete this portfolio image?')) {
            const portfolio = getPortfolio();
            savePortfolio(portfolio.filter(item => item.id !== id));
            loadPortfolioAdmin();
            if (window.PortfolioManager) window.PortfolioManager.refresh();
            alert('✅ Portfolio image deleted.');
        }
    };

    // Initialize
    const init = () => {
        initializeDemoData();
        setupNavigation();
        loadClients();
        setupAddClient();
        setupClientUpload();
        setupPortfolioUpload();
        setupSettings();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();