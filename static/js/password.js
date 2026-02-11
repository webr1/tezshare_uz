// ============================================
// Password Page JavaScript
// ============================================

class PasswordPage {
    constructor() {
        this.init();
    }

    init() {
        this.initForm();
        this.initPasswordToggle();
        this.addKeyboardShortcuts();
    }

    // ============================================
    // Form Handling
    // ============================================
    initForm() {
        const form = document.getElementById('passwordForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            this.handleSubmit(e);
        });

        // Auto-focus on password input
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            setTimeout(() => {
                passwordInput.focus();
            }, 300);
        }
    }

    handleSubmit(e) {
        const submitBtn = document.getElementById('submitBtn');
        const passwordInput = document.getElementById('password');

        if (!passwordInput.value.trim()) {
            e.preventDefault();
            this.showError('Введите пароль');
            passwordInput.focus();
            return;
        }

        // Show loading state
        if (submitBtn) {
            const originalHTML = submitBtn.innerHTML;
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner"></i> <span>Проверка...</span>';

            // Store original HTML for potential error handling
            submitBtn.dataset.originalHtml = originalHTML;
        }

        // Form will submit naturally
    }

    showError(message) {
        // Check if error message already exists
        let errorDiv = document.querySelector('.error-message');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `
                <div class="error-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="error-content">
                    <div class="error-text">${message}</div>
                </div>
            `;

            const form = document.querySelector('.password-form');
            if (form) {
                form.insertBefore(errorDiv, form.firstChild);
            }
        } else {
            errorDiv.querySelector('.error-text').textContent = message;
        }

        // Shake animation
        errorDiv.style.animation = 'none';
        setTimeout(() => {
            errorDiv.style.animation = 'shake 0.5s, slideIn 0.4s';
        }, 10);
    }

    // ============================================
    // Password Toggle
    // ============================================
    initPasswordToggle() {
        const toggleBtn = document.querySelector('.toggle-password');
        if (!toggleBtn) return;

        // Handled by global function
    }

    // ============================================
    // Keyboard Shortcuts
    // ============================================
    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Enter to submit
            if (e.key === 'Enter' && e.target.id === 'password') {
                e.preventDefault();
                document.getElementById('passwordForm').dispatchEvent(new Event('submit'));
            }

            // Escape to clear
            if (e.key === 'Escape') {
                const passwordInput = document.getElementById('password');
                if (passwordInput) {
                    passwordInput.value = '';
                    passwordInput.focus();
                }
            }
        });
    }
}

// ============================================
// Toggle Password Visibility
// ============================================

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (!passwordInput || !eyeIcon) return;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        eyeIcon.className = 'fas fa-eye';
    }
}

// ============================================
// Attempt Counter Display
// ============================================

function updateAttemptsDisplay() {
    const errorText = document.querySelector('.error-text');
    if (!errorText) return;

    const text = errorText.textContent;
    const match = text.match(/Осталось попыток: (\d+)/);
    
    if (match) {
        const remaining = parseInt(match[1]);
        
        // Add visual warning for low attempts
        const errorMessage = document.querySelector('.error-message');
        if (errorMessage) {
            if (remaining <= 2) {
                errorMessage.style.borderColor = 'rgba(239, 68, 68, 0.8)';
                errorMessage.style.background = 'rgba(239, 68, 68, 0.15)';
            }
        }

        // Show notification
        if (window.TezShare && window.TezShare.notify) {
            const severity = remaining <= 2 ? 'error' : 'warning';
            window.TezShare.notify(`Осталось попыток: ${remaining}`, severity);
        }
    }
}

// ============================================
// Auto-clear password on error
// ============================================

function clearPasswordOnError() {
    const errorMessage = document.querySelector('.error-message');
    if (errorMessage) {
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            // Clear password after showing error
            setTimeout(() => {
                passwordInput.value = '';
                passwordInput.focus();
            }, 1500);
        }
    }
}

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const passwordPage = new PasswordPage();
    
    // Update attempts display if error exists
    updateAttemptsDisplay();
    
    // Clear password on error
    clearPasswordOnError();
    
    // Expose globally
    window.PasswordPage = passwordPage;
    window.togglePasswordVisibility = togglePasswordVisibility;
    
    console.log('Password page initialized');
});

// ============================================
// Add animations to input
// ============================================

const style = document.createElement('style');
style.textContent = `
    @keyframes inputFocus {
        from {
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
        }
        to {
            box-shadow: 0 0 0 8px rgba(245, 158, 11, 0);
        }
    }

    .password-input:focus {
        animation: inputFocus 0.6s ease-out;
    }
`;
document.head.appendChild(style);