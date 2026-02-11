// ============================================
// My Uploads Page JavaScript
// ============================================

class MyUploadsPage {
    constructor() {
        this.init();
    }

    init() {
        this.initAnimations();
        this.initFileCards();
    }

    // ============================================
    // Animations
    // ============================================
    initAnimations() {
        // Animate cards on scroll
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

        const fileCards = document.querySelectorAll('.file-card');
        fileCards.forEach(card => observer.observe(card));
    }

    // ============================================
    // File Card Interactions
    // ============================================
    initFileCards() {
        const fileCards = document.querySelectorAll('.file-card');

        fileCards.forEach(card => {
            // Add hover effect
            card.addEventListener('mouseenter', () => {
                this.animateCardHover(card);
            });
        });
    }

    animateCardHover(card) {
        const icon = card.querySelector('.file-icon');
        if (icon) {
            icon.style.transform = 'scale(1.1) rotate(-5deg)';
            setTimeout(() => {
                icon.style.transform = '';
            }, 300);
        }
    }
}

// ============================================
// Copy Code Function
// ============================================

function copyCode(code, batchId) {
    const button = event.currentTarget;
    const originalContent = button.innerHTML;

    // Copy to clipboard
    if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
            // Success feedback
            button.classList.add('copied');
            button.innerHTML = '<i class="fas fa-check"></i>';

            // Show notification
            showNotification('Код скопирован!', 'success');

            // Reset button after 2 seconds
            setTimeout(() => {
                button.classList.remove('copied');
                button.innerHTML = originalContent;
            }, 2000);
        }).catch(() => {
            fallbackCopy(code);
        });
    } else {
        fallbackCopy(code);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Код скопирован!', 'success');
    } catch (err) {
        showNotification('Ошибка копирования', 'error');
    }
    
    document.body.removeChild(textarea);
}

// ============================================
// Share Upload Function
// ============================================

function shareUpload(code) {
    const shareUrl = `${window.location.origin}/?code=${code}`;
    const shareText = `Скачайте мои файлы с помощью кода: ${code}`;

    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: 'TezShare - Обмен файлами',
            text: shareText,
            url: shareUrl
        }).catch(() => {
            // If user cancels, do nothing
        });
    } else {
        // Fallback: copy link to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl).then(() => {
                showNotification('Ссылка скопирована!', 'success');
            });
        } else {
            // Show share modal
            showShareModal(code, shareUrl);
        }
    }
}

function showShareModal(code, url) {
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.innerHTML = `
        <div class="share-modal-content">
            <div class="share-modal-header">
                <h3>Поделиться загрузкой</h3>
                <button class="close-modal" onclick="this.closest('.share-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="share-modal-body">
                <div class="share-code">
                    <label>Код:</label>
                    <div class="code-display">
                        <span>${code}</span>
                        <button onclick="copyCode('${code}', 0)">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
                <div class="share-link">
                    <label>Ссылка:</label>
                    <div class="link-display">
                        <input type="text" value="${url}" readonly>
                        <button onclick="copyToClipboard('${url}')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Ссылка скопирована!', 'success');
        });
    }
}

// ============================================
// Notification System
// ============================================

function showNotification(message, type = 'info') {
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

// ============================================
// Styles for Notifications and Modal
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

    .toast-info {
        border-color: var(--primary-500);
        color: var(--primary-500);
    }

    .toast-notification i {
        font-size: 1.2rem;
    }

    .share-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
        animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .share-modal-content {
        background: var(--glass-bg);
        border: 1px solid var(--border-color);
        border-radius: 20px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        backdrop-filter: blur(20px);
        box-shadow: var(--shadow-xl);
        animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
        from {
            transform: translateY(50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .share-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .share-modal-header h3 {
        font-family: "Space Grotesk", sans-serif;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
    }

    .close-modal {
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
        transition: color 0.2s;
    }

    .close-modal:hover {
        color: var(--primary-500);
    }

    .share-code,
    .share-link {
        margin-bottom: 1.5rem;
    }

    .share-code label,
    .share-link label {
        display: block;
        font-weight: 600;
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
    }

    .code-display,
    .link-display {
        display: flex;
        gap: 0.5rem;
    }

    .code-display span {
        flex: 1;
        padding: 1rem;
        background: var(--bg-secondary);
        border: 2px solid var(--border-color);
        border-radius: 10px;
        font-family: "Space Grotesk", monospace;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--primary-500);
        text-align: center;
    }

    .link-display input {
        flex: 1;
        padding: 1rem;
        background: var(--bg-secondary);
        border: 2px solid var(--border-color);
        border-radius: 10px;
        color: var(--text-primary);
        font-family: inherit;
    }

    .code-display button,
    .link-display button {
        padding: 1rem;
        background: var(--primary-500);
        border: none;
        border-radius: 10px;
        color: var(--white);
        cursor: pointer;
        transition: all 0.2s;
    }

    .code-display button:hover,
    .link-display button:hover {
        background: var(--primary-600);
        transform: scale(1.05);
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
    const myUploadsPage = new MyUploadsPage();
    
    // Expose globally
    window.MyUploadsPage = myUploadsPage;
});