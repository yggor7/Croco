// CROCO BRASSEUR - Main JavaScript

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS animations
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100,
        easing: 'ease-out-cubic'
    });

    // Initialize all functions
    initLoader();
    initNavigation();
    initMobileMenu();
    initSmoothScroll();
    loadGalleryImages(); // Load gallery images from database
    initShowcaseSlideshow(); // Load showcase slideshow on homepage
    initPageHeroSlideshow(); // Load hero slideshow on pages like Menu
    initFAQ();
    initScrollAnimations();
    setActiveNavLink();
});

// ========================================
// LOADER
// ========================================

function initLoader() {
    const loader = document.querySelector('.loader');
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 1000);
    });
}

// ========================================
// NAVIGATION
// ========================================

function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Sticky navbar on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Active nav link on scroll (only for index.html with sections)
    const sections = document.querySelectorAll('section[id]');
    
    if (sections.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                
                if (window.scrollY >= (sectionTop - 200)) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes(current)) {
                    link.classList.add('active');
                }
            });
        });
    }
}

// ========================================
// ACTIVE PAGE DETECTION
// ========================================

function setActiveNavLink() {
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPath = link.getAttribute('href');
        
        // Check if current page matches the link
        if (currentPage.includes('menu.html') && linkPath.includes('menu.html')) {
            link.classList.add('active');
        } else if (currentPage.includes('events.html') && linkPath.includes('events.html')) {
            link.classList.add('active');
        } else if ((currentPage === '/' || currentPage.includes('index.html') || currentPage.endsWith('/')) && linkPath.includes('#accueil')) {
            link.classList.add('active');
        }
    });
}

// ========================================
// MOBILE MENU
// ========================================

function initMobileMenu() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// ========================================
// SMOOTH SCROLL
// ========================================

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========================================
// LOAD GALLERY IMAGES FROM DATABASE
// ========================================

async function loadGalleryImages() {
    try {
        const response = await fetch('http://localhost:3000/api/gallery?actif=true');
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            const galleryGrid = document.querySelector('.gallery-grid');
            if (!galleryGrid) return; // Exit if gallery grid not found on this page

            // Clear existing gallery items
            galleryGrid.innerHTML = '';

            // Add images from database
            data.data.forEach(image => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.setAttribute('data-category', image.category);
                galleryItem.innerHTML = `
                    <img src="${image.filepath}" alt="${image.titre}">
                    <div class="gallery-overlay">
                        <i class="fas fa-search-plus"></i>
                        <p>${image.titre}</p>
                    </div>
                `;
                galleryGrid.appendChild(galleryItem);
            });

            // Initialize gallery filters after loading images
            initGalleryFilters();
        }
    } catch (error) {
        console.error('Error loading gallery images:', error);
        // If there's an error, initialize filters with existing HTML images
        initGalleryFilters();
    }
}

// ========================================
// SHOWCASE SLIDESHOW (Homepage)
// ========================================

async function initShowcaseSlideshow() {
    try {
        const response = await fetch('http://localhost:3000/api/gallery?actif=true');
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            // Group images by category
            const imagesByCategory = {
                interieur: [],
                beers: [],
                food: []
            };

            data.data.forEach(image => {
                if (imagesByCategory[image.category]) {
                    imagesByCategory[image.category].push(image.filepath);
                }
            });

            // Start slideshow for each showcase item
            document.querySelectorAll('.showcase-item').forEach(item => {
                const category = item.getAttribute('data-category');
                const sliderContainer = item.querySelector('.showcase-slider');

                if (category && imagesByCategory[category] && imagesByCategory[category].length > 0) {
                    const images = imagesByCategory[category];
                    let currentIndex = 0;

                    // Create slider items
                    images.forEach((imagePath, index) => {
                        const sliderItem = document.createElement('div');
                        sliderItem.className = 'showcase-slider-item';
                        if (index === 0) sliderItem.classList.add('active'); // First image is active
                        sliderItem.style.backgroundImage = `url('${imagePath}')`;
                        sliderContainer.appendChild(sliderItem);
                    });

                    const sliderItems = sliderContainer.querySelectorAll('.showcase-slider-item');

                    // Auto-fade every 5 seconds (comme The Century Bar)
                    setInterval(() => {
                        // Remove active from current
                        sliderItems[currentIndex].classList.remove('active');

                        // Move to next
                        currentIndex = (currentIndex + 1) % images.length;

                        // Add active to new current
                        sliderItems[currentIndex].classList.add('active');
                    }, 5000);
                }
            });
        }
    } catch (error) {
        console.error('Error loading showcase slideshow:', error);
    }
}

// ========================================
// PAGE HERO SLIDESHOW (for Menu, etc.)
// ========================================

async function initPageHeroSlideshow() {
    try {
        const heroSection = document.querySelector('.page-hero[data-category]');
        if (!heroSection) return; // Exit if no hero with data-category

        const category = heroSection.getAttribute('data-category');
        const sliderContainer = heroSection.querySelector('.hero-slider');
        if (!sliderContainer) return;

        const response = await fetch('http://localhost:3000/api/gallery?actif=true');
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            // Filter images by category
            const categoryImages = data.data
                .filter(image => image.category === category)
                .map(image => image.filepath);

            if (categoryImages.length > 0) {
                let currentIndex = 0;

                // Create slider items
                categoryImages.forEach((imagePath, index) => {
                    const sliderItem = document.createElement('div');
                    sliderItem.className = 'hero-slider-item';
                    if (index === 0) sliderItem.classList.add('active');
                    sliderItem.style.backgroundImage = `url('${imagePath}')`;
                    sliderContainer.appendChild(sliderItem);
                });

                const sliderItems = sliderContainer.querySelectorAll('.hero-slider-item');

                // Auto-fade every 5 seconds
                setInterval(() => {
                    sliderItems[currentIndex].classList.remove('active');
                    currentIndex = (currentIndex + 1) % categoryImages.length;
                    sliderItems[currentIndex].classList.add('active');
                }, 5000);
            }
        }
    } catch (error) {
        console.error('Error loading page hero slideshow:', error);
    }
}

// ========================================
// GALLERY FILTERS
// ========================================

function initGalleryFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');

                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Gallery lightbox (simple implementation)
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgSrc = item.querySelector('img').src;
            openLightbox(imgSrc);
        });
    });
}

function openLightbox(imgSrc) {
    // Create lightbox element
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <span class="lightbox-close">&times;</span>
            <img src="${imgSrc}" alt="Gallery Image">
        </div>
    `;
    
    // Add lightbox styles
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.95);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    const content = lightbox.querySelector('.lightbox-content');
    content.style.cssText = `
        position: relative;
        max-width: 90%;
        max-height: 90%;
    `;
    
    const img = lightbox.querySelector('img');
    img.style.cssText = `
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
    `;
    
    const closeBtn = lightbox.querySelector('.lightbox-close');
    closeBtn.style.cssText = `
        position: absolute;
        top: -40px;
        right: 0;
        font-size: 40px;
        color: white;
        cursor: pointer;
        font-weight: 300;
    `;
    
    document.body.appendChild(lightbox);
    
    // Close lightbox
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(lightbox);
    });
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            document.body.removeChild(lightbox);
        }
    });
}

// ========================================
// FAQ ACCORDION
// ========================================

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });
}

// ========================================
// SCROLL ANIMATIONS
// ========================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
}

// ========================================
// FORM VALIDATION
// ========================================

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\+\-\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 8;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 20px 30px;
        background: ${type === 'success' ? '#2E5339' : '#e74c3c'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ========================================
// MENU TABS (if needed)
// ========================================

const menuTabs = document.querySelectorAll('.tab-btn');
if (menuTabs.length > 0) {
    menuTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and content
            menuTabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// ========================================
// DATE VALIDATION FOR RESERVATION
// ========================================

const dateInput = document.getElementById('date');
if (dateInput) {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    
    // Set maximum date to 3 months from now
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    dateInput.setAttribute('max', maxDate.toISOString().split('T')[0]);
}

// ========================================
// LAZY LOADING IMAGES
// ========================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => imageObserver.observe(img));
}

// ========================================
// CUSTOM CURSOR - LUXURY INTERACTIVE
// ========================================

function initCustomCursor() {
    // Check if device supports hover (not touch device)
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        // Create cursor arrow element
        const cursorArrow = document.createElement('div');
        cursorArrow.className = 'cursor-arrow';
        cursorArrow.innerHTML = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4 L4 20 L9 15 L13 23 L15 22 L11 14 L19 14 Z"/>
            </svg>
        `;

        // Create glow effect
        const cursorGlow = document.createElement('div');
        cursorGlow.className = 'cursor-glow';

        // Create gold trailing ring
        const cursorTrail = document.createElement('div');
        cursorTrail.className = 'cursor-trail';

        // Create white outer ring
        const cursorOuterRing = document.createElement('div');
        cursorOuterRing.className = 'cursor-outer-ring';

        document.body.appendChild(cursorArrow);
        document.body.appendChild(cursorGlow);
        document.body.appendChild(cursorTrail);
        document.body.appendChild(cursorOuterRing);

        // Track mouse position
        let mouseX = 0;
        let mouseY = 0;
        let arrowX = 0;
        let arrowY = 0;
        let glowX = 0;
        let glowY = 0;
        let trailX = 0;
        let trailY = 0;
        let outerRingX = 0;
        let outerRingY = 0;

        // Update mouse position
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Smooth cursor animation with different speeds
        function animateCursor() {
            // Arrow follows fastest (most responsive)
            const arrowLag = 0.35;
            arrowX += (mouseX - arrowX) * arrowLag;
            arrowY += (mouseY - arrowY) * arrowLag;
            cursorArrow.style.left = arrowX + 'px';
            cursorArrow.style.top = arrowY + 'px';

            // Glow follows medium speed
            const glowLag = 0.20;
            glowX += (mouseX - glowX) * glowLag;
            glowY += (mouseY - glowY) * glowLag;
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';

            // Gold trail follows medium-slow
            const trailLag = 0.15;
            trailX += (mouseX - trailX) * trailLag;
            trailY += (mouseY - trailY) * trailLag;
            cursorTrail.style.left = trailX + 'px';
            cursorTrail.style.top = trailY + 'px';

            // White outer ring follows slowest (creates lag effect)
            const outerRingLag = 0.08;
            outerRingX += (mouseX - outerRingX) * outerRingLag;
            outerRingY += (mouseY - outerRingY) * outerRingLag;
            cursorOuterRing.style.left = outerRingX + 'px';
            cursorOuterRing.style.top = outerRingY + 'px';

            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover effects
        const hoverElements = document.querySelectorAll('a, button, .btn, .filter-btn, .gallery-item, .nav-link, input, select, textarea, .faq-question, .menu-item, .beer-card, .event-card, .weekly-event-card, .showcase-item, .reservation-btn, .map-info-card');

        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorArrow.classList.add('hover');
                cursorGlow.classList.add('hover');
                cursorTrail.classList.add('hover');
                cursorOuterRing.classList.add('hover');
            });

            el.addEventListener('mouseleave', () => {
                cursorArrow.classList.remove('hover');
                cursorGlow.classList.remove('hover');
                cursorTrail.classList.remove('hover');
                cursorOuterRing.classList.remove('hover');
            });
        });

        // Click effect
        document.addEventListener('mousedown', () => {
            cursorArrow.classList.add('click');
            cursorGlow.classList.add('click');
        });

        document.addEventListener('mouseup', () => {
            cursorArrow.classList.remove('click');
            cursorGlow.classList.remove('click');
        });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            cursorArrow.style.opacity = '0';
            cursorGlow.style.opacity = '0';
            cursorTrail.style.opacity = '0';
            cursorOuterRing.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            cursorArrow.style.opacity = '1';
            cursorGlow.style.opacity = '0.6';
            cursorTrail.style.opacity = '0.8';
            cursorOuterRing.style.opacity = '0.6';
        });
    }
}

// Initialize custom cursor
document.addEventListener('DOMContentLoaded', initCustomCursor);

// ========================================
// CONSOLE MESSAGE
// ========================================

console.log('%c🐊 Le Croco Brasseur', 'font-size: 20px; font-weight: bold; color: #2E5339;');
console.log('%cWebsite by Croco Brasseur Team', 'font-size: 12px; color: #D4A94E;');
console.log('%cWhere Bujumbura Meets the World', 'font-size: 12px; color: #888;');