/* ===================================
   NAVBAR FUNCTIONALITY
   ================================== */

(function() {
    'use strict';

    let lastScrollTop = 0;
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    // Hamburger menu toggle
    const toggleMenu = () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    };

    // Close menu when clicking outside
    const closeMenuOnClickOutside = (e) => {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !hamburger.contains(e.target)) {
            toggleMenu();
        }
    };

    // Close menu when clicking on a link
    const closeMenuOnLinkClick = () => {
        if (navMenu.classList.contains('active')) {
            toggleMenu();
        }
    };

    // Navbar scroll effect
    const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove scrolled class
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    };

    // Initialize navbar functionality
    const init = () => {
        // Hamburger menu
        if (hamburger) {
            hamburger.addEventListener('click', toggleMenu);
        }

        // Close menu on outside click
        document.addEventListener('click', closeMenuOnClickOutside);

        // Close menu on link click
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', closeMenuOnLinkClick);
        });

        // Scroll effect
        window.addEventListener('scroll', handleScroll);
        
        // Initial check
        handleScroll();

        // Update login/logout button based on auth status
        updateAuthButton();
    };

    // Update login/logout button
    const updateAuthButton = () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        const loginLink = document.querySelector('.login-link');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (currentUser && logoutBtn) {
            // User is logged in - show logout on gallery page
            return;
        }
        
        if (!currentUser && loginLink) {
            // User is not logged in - show login
            return;
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();