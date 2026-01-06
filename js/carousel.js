/* ===================================
   PREMIUM IMAGE CAROUSEL
   ================================== */

(function() {
    'use strict';

    let currentSlide = 0;
    let slides = [];
    let autoPlayInterval;
    const autoPlayDelay = 5000; // 5 seconds

    // Initialize carousel
    const initCarousel = () => {
        const track = document.getElementById('carouselTrack');
        const dotsContainer = document.getElementById('carouselDots');
        
        if (!track || !dotsContainer) return;

        slides = Array.from(track.children);
        
        // Create dots
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'carousel-dot';
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        // Setup navigation
        setupNavigation();
        
        // Start autoplay
        startAutoPlay();

        // Pause on hover
        const carouselContainer = document.querySelector('.carousel-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', stopAutoPlay);
            carouselContainer.addEventListener('mouseleave', startAutoPlay);
        }
    };

    // Setup navigation buttons
    const setupNavigation = () => {
        const prevBtn = document.getElementById('carouselPrev');
        const nextBtn = document.getElementById('carouselNext');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                goToSlide(currentSlide - 1);
                stopAutoPlay();
                startAutoPlay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                goToSlide(currentSlide + 1);
                stopAutoPlay();
                startAutoPlay();
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                goToSlide(currentSlide - 1);
                stopAutoPlay();
                startAutoPlay();
            } else if (e.key === 'ArrowRight') {
                goToSlide(currentSlide + 1);
                stopAutoPlay();
                startAutoPlay();
            }
        });
    };

    // Go to specific slide
    const goToSlide = (index) => {
        const track = document.getElementById('carouselTrack');
        if (!track) return;

        // Wrap around
        if (index < 0) {
            index = slides.length - 1;
        } else if (index >= slides.length) {
            index = 0;
        }

        currentSlide = index;

        // Move track
        const translateX = -currentSlide * 100;
        track.style.transform = `translateX(${translateX}%)`;

        // Update dots
        updateDots();
    };

    // Update active dot
    const updateDots = () => {
        const dots = document.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            if (index === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    };

    // Start autoplay
    const startAutoPlay = () => {
        stopAutoPlay();
        autoPlayInterval = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, autoPlayDelay);
    };

    // Stop autoplay
    const stopAutoPlay = () => {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    };

    // Touch support for mobile
    const setupTouchSupport = () => {
        const track = document.getElementById('carouselTrack');
        if (!track) return;

        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        const handleSwipe = () => {
            if (touchStartX - touchEndX > 50) {
                // Swipe left
                goToSlide(currentSlide + 1);
            } else if (touchEndX - touchStartX > 50) {
                // Swipe right
                goToSlide(currentSlide - 1);
            }
            stopAutoPlay();
            startAutoPlay();
        };
    };

    // Initialize when DOM is ready
    const init = () => {
        // Only run on pages with carousel
        if (!document.getElementById('carouselTrack')) return;

        initCarousel();
        setupTouchSupport();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();