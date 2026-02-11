// ============================================
// Coming Soon Page JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initAnimations();
    initProgressBar();
});

// ============================================
// Animations
// ============================================
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(el => observer.observe(el));
}

// ============================================
// Progress Bar Animation
// ============================================
function initProgressBar() {
    const progressFill = document.querySelector('.progress-fill');
    
    if (progressFill) {
        setTimeout(() => {
            progressFill.style.width = progressFill.style.width;
        }, 500);
    }
}