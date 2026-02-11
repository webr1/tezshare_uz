// ============================================
// Verification Page JavaScript
// ============================================

class VerifyCodePage {
    constructor() {
        this.timeLeft = 60;
        this.timerInterval = null;
        this.init();
    }

    init() {
        this.initCodeInput();
        this.initResendTimer();
        this.initForm();
        this.focusCodeInput();
    }

    // ============================================
    // Code Input Handler
    // ============================================
    initCodeInput() {
        const codeInput = document.querySelector('.code-input');
        if (!codeInput) return;

        // Auto uppercase and format
        codeInput.addEventListener('input', (e) => {
            let value = e.target.value.toUpperCase();
            
            // Remove non-alphanumeric characters
            value = value.replace(/[^A-Z0-9]/g, '');

            // Limit to 6 characters
            if (value.length > 6) {
                value = value.substring(0, 6);
            }

            e.target.value = value;

            // Add complete animation when filled
            if (value.length === 6) {
                codeInput.classList.add('complete');
                this.animateCodeComplete();
                // Auto-submit after a brief delay
                setTimeout(() => {
                    const form = document.getElementById('verifyForm');
                    if (form) {
                        form.dispatchEvent(new Event('submit', { cancelable: true }));
                    }
                }, 300);
            } else {
                codeInput.classList.remove('complete');
            }
        });

        // Paste handler
        codeInput.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData)
                .getData('text')
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .substring(0, 6);

            codeInput.value = pastedText;

            if (pastedText.length === 6) {
                codeInput.classList.add('complete');
                this.animateCodeComplete();
                // Auto-submit
                setTimeout(() => {
                    const form = document.getElementById('verifyForm');
                    if (form) {
                        form.dispatchEvent(new Event('submit', { cancelable: true }));
                    }
                }, 300);
            }
        });

        // Focus animation
        codeInput.addEventListener('focus', () => {
            const wrapper = codeInput.closest('.input-wrapper');
            if (wrapper) {
                wrapper.classList.add('focused');
            }
        });

        codeInput.addEventListener('blur', () => {
            const wrapper = codeInput.closest('.input-wrapper');
            if (wrapper) {
                wrapper.classList.remove('focused');
            }
        });
    }

    animateCodeComplete() {
        const codeInput = document.querySelector('.code-input');
        if (!codeInput) return;

        // Add ripple effect
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 10px;
            height: 10px;
            background: var(--accent-green);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            animation: ripple 0.6s ease-out;
        `;

        codeInput.parentElement.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    // ============================================
    // Resend Timer
    // ============================================
    initResendTimer() {
        const secondsSpan = document.getElementById('seconds');
        const resendLink = document.getElementById('resendLink');
        const resendText = document.getElementById('resendText');

        if (!secondsSpan || !resendLink) return;

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            secondsSpan.textContent = this.timeLeft;

            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                resendLink.classList.remove('disabled');
                resendText.innerHTML = '<span>Отправить код повторно</span>';
            }
        }, 1000);

        // Block click while timer is running
        resendLink.addEventListener('click', (e) => {
            if (resendLink.classList.contains('disabled')) {
                e.preventDefault();
                this.showNotification('Подождите завершения таймера', 'info');
            } else {
                // Show loading state
                resendLink.innerHTML = `
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Отправка...</span>
                `;
                // The actual resend will be handled by the href
            }
        });
    }

    // ============================================
    // Form Handler
    // ============================================
    initForm() {
        const form = document.getElementById('verifyForm');
        const submitBtn = document.getElementById('submitBtn');

        if (!form) return;

        form.addEventListener('submit', (e) => {
            const codeInput = document.querySelector('.code-input');
            
            if (codeInput && codeInput.value.length !== 6) {
                e.preventDefault();
                this.showNotification('Введите 6-значный код', 'error');
                codeInput.focus();
                return;
            }

            // Show loading state
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
                submitBtn.querySelector('span').textContent = 'Проверка кода...';
            }
        });
    }

    // ============================================
    // Helper Methods
    // ============================================
    focusCodeInput() {
        const codeInput = document.querySelector('.code-input');
        if (codeInput) {
            setTimeout(() => {
                codeInput.focus();
            }, 300);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `error-message message-${type}`;
        
        const icon = type === 'error' ? 'exclamation-circle' : 
                     type === 'success' ? 'check-circle' : 'info-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;

        // Insert before form
        const form = document.getElementById('verifyForm');
        if (form) {
            form.parentElement.insertBefore(notification, form);

            // Remove after 3 seconds
            setTimeout(() => {
                notification.style.animation = 'slideOutUp 0.4s ease-out';
                setTimeout(() => notification.remove(), 400);
            }, 3000);
        }
    }
}

// ============================================
// Keyboard Shortcuts
// ============================================

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Focus code input on any alphanumeric key
        if (!e.target.matches('input') && /^[a-z0-9]$/i.test(e.key)) {
            e.preventDefault();
            const codeInput = document.querySelector('.code-input');
            if (codeInput) {
                codeInput.focus();
                codeInput.value += e.key.toUpperCase();
                codeInput.dispatchEvent(new Event('input'));
            }
        }

        // Clear input on Escape
        if (e.key === 'Escape') {
            const codeInput = document.querySelector('.code-input');
            if (codeInput) {
                codeInput.value = '';
                codeInput.classList.remove('complete');
                codeInput.focus();
            }
        }
    });
}

// ============================================
// Additional Animations
// ============================================

const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        from {
            width: 10px;
            height: 10px;
            opacity: 1;
        }
        to {
            width: 300px;
            height: 300px;
            opacity: 0;
        }
    }

    @keyframes slideOutUp {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }

    .input-wrapper.focused {
        transform: scale(1.01);
    }

    .message-info {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.3);
        color: var(--primary-500);
    }
`;
document.head.appendChild(style);

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const verifyPage = new VerifyCodePage();
    initKeyboardShortcuts();

    // Expose globally
    window.VerifyCodePage = verifyPage;
});

// ============================================
// Auto-focus on load
// ============================================

window.addEventListener('load', () => {
    const codeInput = document.querySelector('.code-input');
    if (codeInput) {
        codeInput.focus();
    }
});