document.addEventListener('DOMContentLoaded', () => {
    // --- STICKY HEADER & NAVBAR SCROLL EFFECT ---
    const header = document.querySelector('.header');
    const scrollThreshold = 50;

    const toggleHeaderClass = () => {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    };

    window.addEventListener('scroll', toggleHeaderClass);
    toggleHeaderClass(); // Initial check

    // --- MOBILE MENU TOGGLE ---
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    const toggleMobileMenu = () => {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    };

    const closeMobileMenu = () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    };

    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', closeMobileMenu);
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // --- ACTIVE NAVIGATION HIGHLIGHTING ---
    const activePage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        // Match base name or default to index.html
        if (activePage === linkPath || (activePage === '' && linkPath === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // --- SCROLL REVEAL ANIMATIONS (IntersectionObserver) ---
    const revealElements = document.querySelectorAll('.reveal-hidden');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    observer.unobserve(entry.target); // Stop observing once revealed
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add('reveal-visible'));
    }

    // --- STATISTICS COUNTER ANIMATION ---
    const statsSection = document.querySelector('.about-stats, .intro-badge');
    const counters = document.querySelectorAll('.stat-num, .intro-badge-years');

    if (counters.length > 0 && 'IntersectionObserver' in window) {
        const countTo = (counter) => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            let count = 0;
            const duration = 2000; // 2 seconds
            const speed = target / (duration / 16); // ~60fps

            const updateCount = () => {
                count += speed;
                if (count < target) {
                    counter.innerText = Math.floor(count);
                    requestAnimationFrame(updateCount);
                } else {
                    counter.innerText = target + (counter.getAttribute('data-suffix') || '');
                }
            };
            updateCount();
        };

        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    counters.forEach(counter => countTo(counter));
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        if (statsSection) {
            statsObserver.observe(statsSection);
        } else {
            // If the section isn't found but counters exist, trigger them anyway
            counters.forEach(counter => {
                const target = counter.getAttribute('data-target');
                counter.innerText = target + (counter.getAttribute('data-suffix') || '');
            });
        }
    }

    // --- TESTIMONIALS CAROUSEL ---
    const testimonialSlider = document.querySelector('.testimonials-slider');
    const testimonialContainer = document.querySelector('.testimonials-container');
    const slides = document.querySelectorAll('.testimonial-slide');
    const dotContainer = document.querySelector('.testimonial-dots');

    if (testimonialContainer && slides.length > 0) {
        let currentSlide = 0;
        let slideInterval;
        const intervalTime = 6000; // 6 seconds

        // Create dots dynamically
        slides.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.classList.add('testimonial-dot');
            if (idx === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                goToSlide(idx);
                resetInterval();
            });
            dotContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.testimonial-dot');

        const goToSlide = (n) => {
            testimonialContainer.style.transform = `translateX(-${n * 100}%)`;
            dots.forEach(d => d.classList.remove('active'));
            dots[n].classList.add('active');
            currentSlide = n;
        };

        const nextSlide = () => {
            let next = (currentSlide + 1) % slides.length;
            goToSlide(next);
        };

        const startInterval = () => {
            slideInterval = setInterval(nextSlide, intervalTime);
        };

        const resetInterval = () => {
            clearInterval(slideInterval);
            startInterval();
        };

        startInterval();

        // Support Swipe Gestures on Mobile
        let startX = 0;
        let endX = 0;

        testimonialSlider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });

        testimonialSlider.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            handleSwipe();
        }, { passive: true });

        const handleSwipe = () => {
            const threshold = 50;
            if (startX - endX > threshold) {
                // Swipe Left -> Next
                let next = (currentSlide + 1) % slides.length;
                goToSlide(next);
                resetInterval();
            } else if (endX - startX > threshold) {
                // Swipe Right -> Prev
                let prev = (currentSlide - 1 + slides.length) % slides.length;
                goToSlide(prev);
                resetInterval();
            }
        };
    }

    // --- SAFARI DETAIL DRAWER (ACCORDION EXPANDER) ---
    const safariItems = document.querySelectorAll('.safari-detail-item');

    safariItems.forEach(item => {
        const headerBtn = item.querySelector('.safari-detail-header');
        const drawer = item.querySelector('.safari-drawer-content');

        headerBtn.addEventListener('click', (e) => {
            // Don't trigger if clicked on an actual CTA button inside the header
            if (e.target.closest('.btn') || e.target.closest('a')) {
                return;
            }

            const isActive = item.classList.contains('active');

            // Close all other safari drawers
            safariItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.safari-drawer-content').style.maxHeight = '0px';
                }
            });

            if (isActive) {
                item.classList.remove('active');
                drawer.style.maxHeight = '0px';
            } else {
                item.classList.add('active');
                drawer.style.maxHeight = drawer.scrollHeight + 'px';
                // Adjust height dynamically after opening to handle rendering changes
                setTimeout(() => {
                    if (item.classList.contains('active')) {
                        drawer.style.maxHeight = 'none';
                    }
                }, 500);

                // Scroll item header into view smoothly
                setTimeout(() => {
                    item.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            }
        });
    });

    // --- STANDARD FAQ ACCORDIONS (Inside Safari Details or Global Page) ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            if (isActive) {
                item.classList.remove('active');
                answer.style.maxHeight = '0px';
            } else {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // --- CONTACT FORM REAL-TIME VALIDATION & PROCESSING ---
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');

    if (contactForm) {
        const inputs = contactForm.querySelectorAll('.form-control');

        // Floating label backup state check
        inputs.forEach(input => {
            // Check initial state
            if (input.value !== '') {
                input.placeholder = ''; // Clear placeholder if value exists
            }
        });

        // Validation Rules
        const validators = {
            name: (val) => {
                if (!val.trim()) return 'Name is required.';
                if (val.trim().length < 3) return 'Name must be at least 3 characters.';
                return '';
            },
            email: (val) => {
                if (!val.trim()) return 'Email address is required.';
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!regex.test(val.trim())) return 'Please enter a valid email address.';
                return '';
            },
            phone: (val) => {
                if (!val.trim()) return 'Phone number is required.';
                if (val.trim().length < 8) return 'Please enter a valid phone number.';
                return '';
            },
            message: (val) => {
                if (!val.trim()) return 'Message content is required.';
                if (val.trim().length < 10) return 'Message must be at least 10 characters long.';
                return '';
            }
        };

        const validateField = (input) => {
            const fieldName = input.id;
            const errorElement = document.getElementById(`${fieldName}Error`);
            if (!errorElement || !validators[fieldName]) return true;

            const errorMessage = validators[fieldName](input.value);
            if (errorMessage) {
                errorElement.innerText = errorMessage;
                errorElement.style.display = 'block';
                input.style.borderColor = '#f44336';
                return false;
            } else {
                errorElement.style.display = 'none';
                input.style.borderColor = 'var(--color-light-gray)';
                return true;
            }
        };

        // Validate on blur or input
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                const errorElement = document.getElementById(`${input.id}Error`);
                if (errorElement && errorElement.style.display === 'block') {
                    validateField(input);
                }
            });
        });

        // Submit processing
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isFormValid = true;

            inputs.forEach(input => {
                const isValid = validateField(input);
                if (!isValid) isFormValid = false;
            });

            if (isFormValid) {
                // Collect Form Data
                const formData = {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    subject: document.getElementById('subject')?.value || 'General Inquiry',
                    message: document.getElementById('message').value
                };

                // Premium loading state indicator
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = `Sending inquiry... <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`;

                // Mock API Delay
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;

                    // Display success animation
                    contactForm.style.display = 'none';
                    successMessage.style.display = 'block';
                    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    // Form success trigger - optional deep link WhatsApp prompt if they want
                    console.log('Form successfully submitted:', formData);
                }, 1500);
            }
        });
    }
});

// Spin Animation helper in JS style
const styleElement = document.createElement('style');
styleElement.innerHTML = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
.no-scroll {
    overflow: hidden;
}
`;
document.head.appendChild(styleElement);
