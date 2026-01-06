/* ===================================
   THEME TOGGLE FUNCTIONALITY
   ================================== */

(function() {
    'use strict';

    // Get stored theme or default to light
    const getStoredTheme = () => localStorage.getItem('theme') || 'light';
    
    // Store theme preference
    const setStoredTheme = (theme) => localStorage.setItem('theme', theme);
    
    // Apply theme to document
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
    };
    
    // Update theme toggle icon
    const updateThemeIcon = (theme) => {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    };
    
    // Toggle between themes
    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        applyTheme(newTheme);
        setStoredTheme(newTheme);
    };
    
    // Initialize theme on page load
    const initTheme = () => {
        const storedTheme = getStoredTheme();
        applyTheme(storedTheme);
    };
    
    // Set up event listener
    const setupThemeToggle = () => {
        const themeToggleBtn = document.getElementById('themeToggle');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', toggleTheme);
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initTheme();
            setupThemeToggle();
        });
    } else {
        initTheme();
        setupThemeToggle();
    }
})();