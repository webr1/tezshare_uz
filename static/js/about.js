// ============================================
// About Page JavaScript
// ============================================

class AboutPage {
    constructor() {
        this.init();
    }

    init() {
        this.initAnimations();
        this.initCardCopy();
        this.initSupportButton();
    }

    // ============================================
    // Animations
    // ============================================
    initAnimations() {
        // Animate elements on scroll
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

        const animatedElements = document.querySelectorAll('.info-card, .feature-box, .support-card');
        animatedElements.forEach(el => observer.observe(el));
    }

    // ============================================
    // Card Number Copy
    // ============================================
    initCardCopy() {
        const paymentCard = document.querySelector('.payment-card');
        if (!paymentCard) return;

        // Make card number copyable
        const cardNumber = paymentCard.querySelector('.card-number');
        if (cardNumber) {
            cardNumber.style.cursor = 'pointer';
            cardNumber.title = 'Нажмите, чтобы скопировать';

            cardNumber.addEventListener('click', () => {
                const number = cardNumber.textContent.replace(/\s/g, '');
                this.copyToClipboard(number);
            });

            // Add hover effect
            cardNumber.addEventListener('mouseenter', () => {
                cardNumber.style.transform = 'scale(1.05)';
                cardNumber.style.color = '#ffd54f';
            });

            cardNumber.addEventListener('mouseleave', () => {
                cardNumber.style.transform = 'scale(1)';
                cardNumber.style.color = '#ffffff';
            });
        }
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Номер карты скопирован!', 'success');
            }).catch(() => {
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    }

    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('Номер карты скопирован!', 'success');
        } catch (err) {
            this.showNotification('Ошибка копирования', 'error');
        }
        
        document.body.removeChild(textarea);
    }

    // ============================================
    // Support Button
    // ============================================
    initSupportButton() {
        const supportButton = document.querySelector('.support-button');
        if (!supportButton) return;

        supportButton.addEventListener('click', (e) => {
            // Add click animation
            supportButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                supportButton.style.transform = '';
            }, 100);

            // Track click (optional analytics)
            this.trackSupportClick();
        });
    }

    trackSupportClick() {
        // Optional: Add analytics tracking here
        console.log('Support button clicked');
    }

    // ============================================
    // Notification System
    // ============================================
    showNotification(message, type = 'info') {
        // Remove existing notifications
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

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// ============================================
// Parallax Effect on Card
// ============================================

function initCardParallax() {
    const paymentCard = document.querySelector('.payment-card');
    if (!paymentCard) return;

    paymentCard.addEventListener('mousemove', (e) => {
        const rect = paymentCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        paymentCard.style.transform = `
            perspective(1000px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            translateY(-10px)
        `;
    });

    paymentCard.addEventListener('mouseleave', () => {
        paymentCard.style.transform = '';
    });
}

// ============================================
// Styles for Notifications
// ============================================

const style = document.createElement('style');
style.textContent = `
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
    const aboutPage = new AboutPage();
    initCardParallax();
    
    // Expose globally
    window.AboutPage = aboutPage;
});