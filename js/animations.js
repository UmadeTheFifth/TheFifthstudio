/* ===================================
   PREMIUM ANIMATIONS & TRANSITIONS
   ================================== */

(function() {
    'use strict';

    // Enhanced intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
    };

    // Callback for intersection observer
    const observerCallback = (entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add stagger delay for multiple items
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 50);
                
                observer.unobserve(entry.target);
            }
        });
    };

    // Create observer instance
    const createObserver = () => {
        return new IntersectionObserver(observerCallback, observerOptions);
    };

    // Setup scroll animations
    const setupScrollAnimations = () => {
        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            document.querySelectorAll('.animate-on-scroll, .animate-fade-in').forEach(el => {
                el.classList.add('visible');
            });
            return;
        }

        const observer = createObserver();

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    };

    // Inject premium animation styles
    const injectAnimationStyles = () => {
        if (document.getElementById('premium-animation-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'premium-animation-styles';
        style.textContent = `
            /* Fade In Animation */
            .animate-fade-in {
                opacity: 0;
                animation: premiumFadeIn 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            }

            @keyframes premiumFadeIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Scroll Reveal Animation */
            .animate-on-scroll {
                opacity: 0;
                transform: translateY(40px);
                transition: opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                            transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            .animate-on-scroll.visible {
                opacity: 1;
                transform: translateY(0);
            }

            /* Image Hover Effects */
            .gallery-item img,
            .about-image img,
            .team-photo img {
                transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                            filter 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            .gallery-item:hover img,
            .about-image:hover img,
            .team-photo:hover img {
                transform: scale(1.05);
                filter: brightness(1.05);
            }

            /* Button Ripple Effect */
            .btn {
                position: relative;
                overflow: hidden;
            }

            .btn::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: translate(-50%, -50%);
                transition: width 0.6s, height 0.6s;
            }

            .btn:active::after {
                width: 300px;
                height: 300px;
            }

            /* Page Transition */
            body {
                opacity: 0;
                animation: pageLoad 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            }

            @keyframes pageLoad {
                to {
                    opacity: 1;
                }
            }

            /* Smooth Image Load */
            img {
                opacity: 0;
                transition: opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            img.loaded {
                opacity: 1;
            }

            /* Respect reduced motion preference */
            @media (prefers-reduced-motion: reduce) {
                .animate-fade-in,
                .animate-on-scroll,
                body,
                img {
                    animation: none !important;
                    transition: none !important;
                    opacity: 1 !important;
                    transform: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    };

    // Lazy loading for images with fade-in
    const setupImageLoading = () => {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            if (img.complete) {
                img.classList.add('loaded');
            } else {
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                });
            }
        });

        // Observer for lazy loading
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    };

    // Smooth scroll for anchor links
    const setupSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    const navbarHeight = document.getElementById('navbar')?.offsetHeight || 0;
                    const targetPosition = targetElement.offsetTop - navbarHeight - 30;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    };

    // Parallax effect for hero section
    const setupParallaxEffect = () => {
        const hero = document.querySelector('.hero');
        
        if (!hero) return;
        
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        let ticking = false;

        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const heroHeight = hero.offsetHeight;
            
            if (scrolled < heroHeight) {
                const parallaxSpeed = 0.4;
                hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
            }
            
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });
    };

    // Add hover animations to cards
    const setupHoverEffects = () => {
        const cards = document.querySelectorAll('.service-card, .gallery-item, .team-member');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            });
        });
    };

    // Stagger animation for grid items
    const setupStaggerAnimations = () => {
        const grids = document.querySelectorAll('.gallery-grid, .services-grid, .team-grid');
        
        grids.forEach(grid => {
            const items = grid.querySelectorAll('.animate-on-scroll');
            items.forEach((item, index) => {
                item.style.transitionDelay = `${index * 0.08}s`;
            });
        });
    };

    // Add entrance animation to hero content
    const setupHeroAnimation = () => {
        const heroContent = document.querySelector('.hero-content');
        if (!heroContent) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        setTimeout(() => {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 300);
    };

    // Performance optimization: Debounce
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // Initialize all animations
    const init = () => {
        // Inject animation styles
        injectAnimationStyles();
        
        // Setup scroll animations
        setupScrollAnimations();
        
        // Setup image loading
        setupImageLoading();
        
        // Setup smooth scroll
        setupSmoothScroll();
        
        // Setup parallax
        setupParallaxEffect();
        
        // Setup hover effects
        setupHoverEffects();
        
        // Setup stagger animations
        setupStaggerAnimations();
        
        // Setup hero animation
        setupHeroAnimation();
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-observe elements when new content is loaded
    window.addEventListener('load', () => {
        setupScrollAnimations();
        setupImageLoading();
    });
})();