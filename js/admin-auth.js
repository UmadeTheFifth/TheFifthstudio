/* ===================================
   ADMIN AUTHENTICATION
   ================================== */

import { auth } from '../firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Check if user is admin
const checkAdminStatus = async (user) => {
    if (!user) return false;
    
    // Get custom claims or check Firestore for admin role
    const idTokenResult = await user.getIdTokenResult();
    return idTokenResult.claims.admin === true || user.email.includes('admin');
};

// Protect admin pages
const protectAdminPage = () => {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('admin.html') || currentPath.includes('admin-login.html')) {
        onAuthStateChanged(auth, async (user) => {
            if (currentPath.includes('admin.html')) {
                // Admin dashboard - require authentication
                if (!user) {
                    window.location.href = 'admin-login.html';
                    return;
                }
                
                const isAdmin = await checkAdminStatus(user);
                if (!isAdmin) {
                    alert('Access denied. Admin privileges required.');
                    await signOut(auth);
                    window.location.href = 'admin-login.html';
                }
            } else if (currentPath.includes('admin-login.html')) {
                // Admin login page - redirect if already logged in
                if (user) {
                    const isAdmin = await checkAdminStatus(user);
                    if (isAdmin) {
                        window.location.href = 'admin.html';
                    }
                }
            }
        });
    }
};

// Handle admin login
const handleAdminLogin = () => {
    const loginForm = document.getElementById('adminLoginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
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
        
        try {
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Signing in...';
            submitBtn.disabled = true;
            
            // Sign in with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Check admin status
            const isAdmin = await checkAdminStatus(user);
            
            if (!isAdmin) {
                await signOut(auth);
                throw new Error('Access denied. This account does not have admin privileges.');
            }
            
            // Success
            loginMessage.textContent = 'Login successful! Redirecting...';
            loginMessage.className = 'form-message success';
            loginMessage.style.display = 'block';
            
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
            
        } catch (error) {
            console.error('Login error:', error);
            
            let errorMessage = 'Login failed. Please check your credentials.';
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No admin account found with this email.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed attempts. Please try again later.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            loginMessage.textContent = errorMessage;
            loginMessage.className = 'form-message error';
            loginMessage.style.display = 'block';
            
            // Reset button
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Sign In to Dashboard';
            submitBtn.disabled = false;
        }
    });
};

// Handle admin logout
const handleAdminLogout = () => {
    const logoutBtn = document.getElementById('adminLogout');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (confirm('Are you sure you want to logout?')) {
            try {
                await signOut(auth);
                window.location.href = 'admin-login.html';
            } catch (error) {
                console.error('Logout error:', error);
                alert('Error logging out. Please try again.');
            }
        }
    });
};

// Display current admin info
const displayAdminInfo = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const adminName = document.getElementById('adminName');
            const adminEmail = document.getElementById('adminEmail');
            const settingsEmail = document.getElementById('settingsEmail');
            
            if (adminName) {
                adminName.textContent = user.displayName || 'Admin';
            }
            if (adminEmail) {
                adminEmail.textContent = user.email;
            }
            if (settingsEmail) {
                settingsEmail.value = user.email;
            }
        }
    });
};

// Initialize
const init = () => {
    protectAdminPage();
    handleAdminLogin();
    handleAdminLogout();
    displayAdminInfo();
};

// Run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export functions
export { checkAdminStatus };