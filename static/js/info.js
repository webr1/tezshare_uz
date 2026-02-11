// ============================================
// Info Page JavaScript
// ============================================

class InfoPage {
    constructor() {
        this.init();
    }

    init() {
        this.initFAQAccordion();
        this.initSmoothScroll();
        this.initQuickNav();
        this.initAnimations();
    }

    // ============================================
// FAQ Accordion
// ============================================
initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (!question || !answer) return;
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                if (otherAnswer) {
                    otherAnswer.style.maxHeight = null;
                }
            });

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
}
    // ============================================
    // Smooth Scroll
    // ============================================
    initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#' || href === '#!') return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();

                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + 
                                     window.pageYOffset - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            });
        });
    }

    // ============================================
    // Quick Navigation Active State
    // ============================================
    initQuickNav() {
        const sections = document.querySelectorAll('.content-section');
        const navItems = document.querySelectorAll('.nav-item');

        const observerOptions = {
            threshold: 0.3,
            rootMargin: '-100px 0px -50% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    
                    // Remove active class from all nav items
                    navItems.forEach(item => {
                        item.classList.remove('active');
                    });

                    // Add active class to corresponding nav item
                    const activeNav = document.querySelector(`.nav-item[href="#${id}"]`);
                    if (activeNav) {
                        activeNav.classList.add('active');
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

    // ============================================
    // Animations
    // ============================================
    initAnimations() {
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

        const animatedElements = document.querySelectorAll('.content-section');
        animatedElements.forEach(el => observer.observe(el));
    }
}

// ============================================
// Copy Text Helper
// ============================================

function copyText(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Скопировано!', 'success');
        });
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            showNotification('Скопировано!', 'success');
        } catch (err) {
            showNotification('Ошибка копирования', 'error');
        }
        
        document.body.removeChild(textarea);
    }
}

// ============================================
// Notification System
// ============================================

function showNotification(message, type = 'info') {
    const existing = document.querySelectorAll('.toast-notification');
    existing.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `toast-notification toast-${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// Styles
// ============================================

const style = document.createElement('style');
style.textContent = `
    .nav-item.active {
        background: var(--primary-500);
        color: var(--white);
        border-color: var(--primary-500);
    }

    .nav-item.active i {
        color: var(--white);
    }

    .toast-notification {
        position: fixed;
        top: 2rem;
        right: 2rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        background: var(--glass-bg);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        backdrop-filter: blur(20px);
        box-shadow: var(--shadow-xl);
        font-weight: 600;
        z-index: 9999;
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.3s ease-out;
    }

    .toast-notification.show {
        opacity: 1;
        transform: translateX(0);
    }

    .toast-success {
        border-color: var(--accent-green);
        color: var(--accent-green);
    }

    .toast-error {
        border-color: #ef4444;
        color: #ef4444;
    }

    .toast-notification i {
        font-size: 1.2rem;
    }

    @media (max-width: 768px) {
        .toast-notification {
            top: auto;
            bottom: 2rem;
            right: 1rem;
            left: 1rem;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const infoPage = new InfoPage();
    
    // Expose globally
    window.InfoPage = infoPage;
    window.copyText = copyText;
});