/* ===================================
   AUTHENTICATION SYSTEM
   ================================== */

(function() {
    'use strict';

    // Client database (simulates clients.json)
    const clientsDatabase = {
        clients: [
            {
                id: 1,
                name: "John Doe",
                email: "john.doe@email.com",
                password: "password123",
                gallery: [
                    { type: "image", url: "Wedding_001", title: "Wedding Ceremony" },
                    { type: "image", url: "Wedding_002", title: "Reception" },
                    { type: "image", url: "Wedding_003", title: "First Dance" },
                    { type: "image", url: "Wedding_004", title: "Family Portrait" },
                    { type: "video", url: "Wedding_Highlights", title: "Wedding Highlights Video" }
                ]
            },
            {
                id: 2,
                name: "Sarah Smith",
                email: "sarah.smith@email.com",
                password: "password456",
                gallery: [
                    { type: "image", url: "Portrait_001", title: "Studio Portrait 1" },
                    { type: "image", url: "Portrait_002", title: "Studio Portrait 2" },
                    { type: "image", url: "Portrait_003", title: "Outdoor Portrait" },
                    { type: "image", url: "Portrait_004", title: "Family Group" }
                ]
            },
            {
                id: 3,
                name: "Mike Johnson",
                email: "mike.johnson@email.com",
                password: "password789",
                gallery: [
                    { type: "image", url: "Event_001", title: "Corporate Event" },
                    { type: "image", url: "Event_002", title: "Keynote Speaker" },
                    { type: "image", url: "Event_003", title: "Team Photo" },
                    { type: "video", url: "Event_Recap", title: "Event Recap Video" },
                    { type: "image", url: "Event_004", title: "Networking Session" },
                    { type: "image", url: "Event_005", title: "Award Ceremony" }
                ]
            }
        ]
    };

    // Get current user from localStorage
    const getCurrentUser = () => {
        const userString = localStorage.getItem('currentUser');
        return userString ? JSON.parse(userString) : null;
    };

    // Set current user in localStorage
    const setCurrentUser = (user) => {
        localStorage.setItem('currentUser', JSON.stringify(user));
    };

    // Clear current user (logout)
    const clearCurrentUser = () => {
        localStorage.removeItem('currentUser');
    };

    // Authenticate user
    const authenticateUser = (email, password) => {
        const client = clientsDatabase.clients.find(
            c => c.email.toLowerCase() === email.toLowerCase() && c.password === password
        );
        
        if (client) {
            // Remove password from stored user object
            const { password: _, ...userWithoutPassword } = client;
            return userWithoutPassword;
        }
        
        return null;
    };

    // Check if user is authenticated
    const isAuthenticated = () => {
        return getCurrentUser() !== null;
    };

    // Protect gallery page
    const protectGalleryPage = () => {
        // Check if we're on the gallery page
        if (window.location.pathname.includes('gallery.html')) {
            if (!isAuthenticated()) {
                // Redirect to login page
                window.location.href = 'login.html';
            }
        }
    };

    // Handle login form submission
    const handleLoginSubmit = (e) => {
        e.preventDefault();
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-group input').forEach(el => el.classList.remove('error'));
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Validate
        let isValid = true;
        
        if (!email) {
            showError('email', 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError('email', 'Please enter a valid email');
            isValid = false;
        }
        
        if (!password) {
            showError('password', 'Password is required');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Attempt authentication
        const user = authenticateUser(email, password);
        
        if (user) {
            // Store user data
            setCurrentUser(user);
            
            // Show success message
            const loginMessage = document.getElementById('loginMessage');
            loginMessage.textContent = 'Login successful! Redirecting to your gallery...';
            loginMessage.className = 'form-message success';
            loginMessage.style.display = 'block';
            
            // Redirect to gallery after short delay
            setTimeout(() => {
                window.location.href = 'gallery.html';
            }, 1000);
        } else {
            // Show error message
            const loginMessage = document.getElementById('loginMessage');
            loginMessage.textContent = 'Invalid email or password. Please try again.';
            loginMessage.className = 'form-message error';
            loginMessage.style.display = 'block';
        }
    };

    // Handle logout
    const handleLogout = () => {
        clearCurrentUser();
        window.location.href = 'login.html';
    };

    // Show error message
    const showError = (fieldId, message) => {
        const field = document.getElementById(`login${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`);
        const errorElement = document.getElementById(`${fieldId}Error`);
        if (field) field.classList.add('error');
        if (errorElement) errorElement.textContent = message;
    };

    // Validate email format
    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Initialize authentication
    const init = () => {
        // Protect gallery page
        protectGalleryPage();
        
        // Setup login form if on login page
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLoginSubmit);
        }
        
        // Setup logout button if on gallery page
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    handleLogout();
                }
            });
        }
        
        // Display user name on gallery page
        if (window.location.pathname.includes('gallery.html')) {
            const user = getCurrentUser();
            if (user) {
                const clientNameElement = document.getElementById('clientName');
                if (clientNameElement) {
                    clientNameElement.textContent = user.name;
                }
            }
        }
    };

    // Export auth functions for use in other scripts
    window.StudioAuth = {
        getCurrentUser,
        isAuthenticated,
        logout: handleLogout
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();