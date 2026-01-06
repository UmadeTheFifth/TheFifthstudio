/* ===================================
   MAIN APPLICATION LOGIC
   ================================== */

(function() {
    'use strict';

    // Global app state
    const StudioApp = {
        version: '1.0.0',
        initialized: false
    };

    // Console welcome message
    const showWelcomeMessage = () => {
        console.log(
            '%c Studio Photography & Videography ',
            'background: #8b6f47; color: white; font-size: 16px; padding: 10px; border-radius: 5px;'
        );
        console.log(`Version: ${StudioApp.version}`);
        console.log('Website by Studio Development Team');
    };

    // Check browser compatibility
    const checkBrowserCompatibility = () => {
        const features = {
            localStorage: typeof(Storage) !== 'undefined',
            intersectionObserver: 'IntersectionObserver' in window,
            fetch: 'fetch' in window
        };

        const unsupported = Object.entries(features)
            .filter(([key, value]) => !value)
            .map(([key]) => key);

        if (unsupported.length > 0) {
            console.warn('Some features may not work:', unsupported.join(', '));
        }

        return unsupported.length === 0;
    };

    // Setup global error handling
    const setupErrorHandling = () => {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            
            // In production, you might want to send this to an error tracking service
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
        });
    };

    // Setup performance monitoring (optional)
    const setupPerformanceMonitoring = () => {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const perfData = performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                
                console.log(`Page load time: ${pageLoadTime}ms`);
            });
        }
    };

    // Add active link highlighting based on current page
    const highlightActiveNavLink = () => {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            
            // Remove existing active class
            link.classList.remove('active');
            
            // Add active class if paths match
            if (currentPath.includes(linkPath) || 
                (currentPath === '/' && linkPath.includes('index.html'))) {
                link.classList.add('active');
            }
        });
    };

    // Setup FAQ accordion functionality
    const setupFAQAccordion = () => {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', function() {
                const faqItem = this.parentElement;
                const isActive = faqItem.classList.contains('active');
                
                // Close all FAQ items
                document.querySelectorAll('.faq-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    faqItem.classList.add('active');
                }
            });
        });
    };

    // Add help section styles
    const injectHelpStyles = () => {
        const existingStyle = document.getElementById('help-section-styles');
        if (existingStyle) return;

        const style = document.createElement('style');
        style.id = 'help-section-styles';
        style.textContent = `
            .help-quick-links {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
                margin-bottom: 3rem;
            }

            .help-link-card {
                background-color: var(--card-bg);
                padding: 2rem;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 4px 12px var(--shadow-light);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                text-decoration: none;
                display: block;
            }

            .help-link-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 24px var(--shadow-medium);
            }

            .help-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }

            .help-link-card h3 {
                margin-bottom: 0.5rem;
                color: var(--primary-text);
            }

            .help-link-card p {
                color: var(--secondary-text);
                margin: 0;
            }

            .help-section {
                margin-bottom: 4rem;
            }

            .help-note {
                background-color: var(--secondary-bg);
                padding: 1.5rem;
                border-radius: 8px;
                border-left: 4px solid var(--primary-color);
                margin-top: 2rem;
            }

            .step-guide {
                display: flex;
                flex-direction: column;
                gap: 2rem;
                margin-top: 2rem;
            }

            .step-item {
                display: flex;
                gap: 2rem;
                align-items: start;
            }

            .step-number {
                width: 50px;
                height: 50px;
                background-color: var(--primary-color);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                font-weight: bold;
                flex-shrink: 0;
            }

            .step-content h3 {
                margin-bottom: 0.75rem;
            }

            .faq-container {
                max-width: 900px;
                margin: 0 auto;
            }

            .faq-item {
                background-color: var(--card-bg);
                border-radius: 12px;
                margin-bottom: 1rem;
                box-shadow: 0 2px 8px var(--shadow-light);
                overflow: hidden;
            }

            .faq-question {
                width: 100%;
                background: none;
                border: none;
                padding: 1.5rem;
                text-align: left;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--primary-text);
                transition: background-color 0.3s ease;
            }

            .faq-question:hover {
                background-color: var(--secondary-bg);
            }

            .faq-toggle {
                font-size: 1.5rem;
                color: var(--primary-color);
                transition: transform 0.3s ease;
            }

            .faq-item.active .faq-toggle {
                transform: rotate(45deg);
            }

            .faq-answer {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease, padding 0.3s ease;
            }

            .faq-item.active .faq-answer {
                max-height: 500px;
                padding: 0 1.5rem 1.5rem;
            }

            .faq-answer p {
                margin: 0;
                line-height: 1.8;
            }

            .download-guide {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 2rem;
                margin-top: 2rem;
            }

            .download-method {
                background-color: var(--card-bg);
                padding: 2rem;
                border-radius: 12px;
                box-shadow: 0 4px 12px var(--shadow-light);
            }

            .download-method h3 {
                margin-bottom: 1rem;
                color: var(--primary-color);
            }

            .download-method ol {
                padding-left: 1.5rem;
            }

            .download-method li {
                margin-bottom: 0.75rem;
                color: var(--secondary-text);
            }

            .support-section {
                text-align: center;
            }

            .support-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 2rem;
                margin-top: 3rem;
            }

            .support-card {
                background-color: var(--card-bg);
                padding: 2.5rem;
                border-radius: 12px;
                box-shadow: 0 4px 16px var(--shadow-light);
            }

            .support-icon {
                font-size: 3.5rem;
                margin-bottom: 1.5rem;
            }

            .support-card h3 {
                margin-bottom: 1rem;
            }

            .support-card p {
                margin-bottom: 1.5rem;
                color: var(--secondary-text);
            }

            .support-card small {
                display: block;
                margin-top: 0.5rem;
                color: var(--muted-text);
                font-size: 0.9rem;
            }

            .mission-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 2rem;
                margin-top: 3rem;
            }

            .mission-card {
                background-color: var(--card-bg);
                padding: 2.5rem;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 4px 16px var(--shadow-light);
            }

            .mission-icon {
                font-size: 3.5rem;
                margin-bottom: 1.5rem;
            }

            .approach-list {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
                margin-top: 2rem;
            }

            .approach-item h4 {
                margin-bottom: 0.5rem;
                color: var(--primary-color);
            }

            .approach-item p {
                margin: 0;
            }

            .team-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 2.5rem;
                margin-top: 3rem;
            }

            .team-member {
                text-align: center;
            }

            .team-photo {
                margin-bottom: 1.5rem;
                border-radius: 12px;
                overflow: hidden;
            }

            .team-role {
                color: var(--primary-color);
                font-weight: 600;
                margin-bottom: 1rem;
            }

            .team-bio {
                color: var(--secondary-text);
            }

            @media (max-width: 768px) {
                .step-item {
                    flex-direction: column;
                    gap: 1rem;
                }

                .step-number {
                    width: 40px;
                    height: 40px;
                    font-size: 1.25rem;
                }
            }
        `;
        document.head.appendChild(style);
    };

    // Initialize the application
    const init = () => {
        if (StudioApp.initialized) return;

        // Show welcome message
        showWelcomeMessage();

        // Check browser compatibility
        checkBrowserCompatibility();

        // Setup error handling
        setupErrorHandling();

        // Setup performance monitoring
        setupPerformanceMonitoring();

        // Highlight active nav link
        highlightActiveNavLink();

        // Setup FAQ accordion
        setupFAQAccordion();

        // Inject help section styles
        injectHelpStyles();

        // Mark as initialized
        StudioApp.initialized = true;

        console.log('✓ Studio App Initialized');
    };

    // Make app globally available
    window.StudioApp = StudioApp;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();