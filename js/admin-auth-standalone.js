/* ===================================
   STANDALONE ADMIN AUTHENTICATION
   (Use this before Firebase setup)
   ================================== */

(function() {
    'use strict';

    // Demo admin accounts (REPLACE WITH FIREBASE IN PRODUCTION)
    const adminDatabase = {
        admins: [
            {
                id: 'admin1',
                name: 'Studio Admin',
                email: 'admin@studio.com',
                password: 'Admin123!',
                role: 'admin'
            },
            {
                id: 'admin2',
                name: 'Super Admin',
                email: 'superadmin@studio.com',
                password: 'SuperAdmin123!',
                role: 'superadmin'
            }
        ]
    };

    // Get current admin from localStorage
    const getCurrentAdmin = () => {
        const adminString = localStorage.getItem('currentAdmin');
        return adminString ? JSON.parse(adminString) : null;
    };

    // Set current admin in localStorage
    const setCurrentAdmin = (admin) => {
        localStorage.setItem('currentAdmin', JSON.stringify(admin));
    };

    // Clear current admin (logout)
    const clearCurrentAdmin = () => {
        localStorage.removeItem('currentAdmin');
    };

    // Check if user is admin
    const isAdmin = () => {
        return getCurrentAdmin() !== null;
    };

    // Authenticate admin
    const authenticateAdmin = (email, password) => {
        const admin = adminDatabase.admins.find(
            a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
        );
        
        if (admin) {
            // Remove password from stored object
            const { password: _, ...adminWithoutPassword } = admin;
            return adminWithoutPassword;
        }
        
        return null;
    };

    // Protect admin pages
    const protectAdminPage = () => {
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('admin.html')) {
            // Admin dashboard - require authentication
            if (!isAdmin()) {
                window.location.href = 'admin-login.html';
            } else {
                // Display admin info
                displayAdminInfo();
            }
        } else if (currentPath.includes('admin-login.html')) {
            // Admin login page - redirect if already logged in
            if (isAdmin()) {
                window.location.href = 'admin.html';
            }
        }
    };

    // Handle admin login
    const handleAdminLogin = () => {
        const loginForm = document.getElementById('adminLoginForm');
        if (!loginForm) return;

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
            document.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
            
            const email = document.getElementById('adminLoginEmail').value.trim();
            const password = document.getElementById('adminLoginPassword').value;
            const loginMessage = document.getElementById('loginMessage');
            
            // Validate
            if (!email || !password) {
                loginMessage.textContent = 'Please enter both email and password.';
                loginMessage.className = 'form-message error';
                loginMessage.style.display = 'block';
                return;
            }
            
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Signing in...';
            submitBtn.disabled = true;
            
            // Attempt authentication
            const admin = authenticateAdmin(email, password);
            
            if (admin) {
                // Store admin data
                setCurrentAdmin(admin);
                
                // Success
                loginMessage.textContent = 'Login successful! Redirecting...';
                loginMessage.className = 'form-message success';
                loginMessage.style.display = 'block';
                
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                // Failed
                loginMessage.textContent = 'Invalid email or password. Please check your credentials.';
                loginMessage.className = 'form-message error';
                loginMessage.style.display = 'block';
                
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    };

    // Handle admin logout
    const handleAdminLogout = () => {
        const logoutBtn = document.getElementById('adminLogout');
        if (!logoutBtn) return;

        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (confirm('Are you sure you want to logout?')) {
                clearCurrentAdmin();
                window.location.href = 'admin-login.html';
            }
        });
    };

    // Display current admin info
    const displayAdminInfo = () => {
        const admin = getCurrentAdmin();
        if (!admin) return;

        const adminName = document.getElementById('adminName');
        const adminEmail = document.getElementById('adminEmail');
        const settingsEmail = document.getElementById('settingsEmail');
        
        if (adminName) {
            adminName.textContent = admin.name || 'Admin';
        }
        if (adminEmail) {
            adminEmail.textContent = admin.email;
        }
        if (settingsEmail) {
            settingsEmail.value = admin.email;
        }
    };

    // Initialize
    const init = () => {
        protectAdminPage();
        handleAdminLogin();
        handleAdminLogout();
    };

    // Run on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for use in other scripts
    window.AdminAuth = {
        getCurrentAdmin,
        isAdmin,
        logout: () => {
            clearCurrentAdmin();
            window.location.href = 'admin-login.html';
        }
    };
})();