// ============================================
// TezShare - Complete Login Page JavaScript
// To'liq Tayyor Kod - Copy/Paste qiling
// ============================================

class CompleteLoginPage {
    constructor() {
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.createFloatingElements();
        this.initForm();
        this.initInputEffects();
        this.initGoogleButton();
        this.initMessages();
        this.initKeyboardShortcuts();
        this.initParticles();
        console.log('✅ TezShare Login Page Initialized');
    }

    // ============================================
    // Floating Background Elements
    // ============================================
    createFloatingElements() {
        const section = document.querySelector('.login-section');
        if (!section) return;

        for (let i = 0; i < 10; i++) {
            const shape = document.createElement('div');
            const size = Math.random() * 100 + 50;
            const left = Math.random() * 100;
            const animationDuration = Math.random() * 20 + 10;
            const delay = Math.random() * 5;

            shape.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: linear-gradient(135deg, 
                    rgba(102, 126, 234, 0.1) 0%, 
                    rgba(118, 75, 162, 0.1) 100%);
                border-radius: ${Math.random() > 0.5 ? '50%' : '20px'};
                left: ${left}%;
                top: ${Math.random() * 100}%;
                filter: blur(40px);
                animation: floatShape ${animationDuration}s ease-in-out ${delay}s infinite;
                pointer-events: none;
                z-index: 1;
            `;

            section.appendChild(shape);
        }
    }

    // ============================================
    // Form Handling
    // ============================================
    initForm() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            const button = form.querySelector('.login-button');
            if (button) {
                this.showLoadingState(button);
            }
        });
    }

    showLoadingState(button) {
        button.classList.add('loading');
        button.disabled = true;
        this.createRipple(button);
    }

    // ============================================
    // Input Effects
    // ============================================
    initInputEffects() {
        const inputs = document.querySelectorAll('.form-input');

        inputs.forEach(input => {
            input.addEventListener('focus', () => this.onInputFocus(input));
            input.addEventListener('blur', () => this.onInputBlur(input));
            input.addEventListener('input', () => this.onInputChange(input));

            if (input.value.trim()) {
                input.classList.add('filled');
            }
        });
    }

    onInputFocus(input) {
        const wrapper = input.closest('.input-wrapper');
        if (wrapper) {
            wrapper.classList.add('focused');
            this.createFocusGlow(wrapper);
        }
    }

    onInputBlur(input) {
        const wrapper = input.closest('.input-wrapper');
        if (wrapper) {
            wrapper.classList.remove('focused');
            
            if (input.value.trim()) {
                this.validateInput(input);
            } else {
                input.classList.remove('filled', 'valid', 'invalid');
            }
        }
    }

    onInputChange(input) {
        if (input.value.trim()) {
            input.classList.add('filled');
        } else {
            input.classList.remove('filled');
        }

        input.style.transform = 'scale(1.01)';
        setTimeout(() => {
            input.style.transform = 'scale(1)';
        }, 100);
    }

    validateInput(input) {
        if (input.validity.valid && input.value.trim()) {
            input.classList.add('valid');
            input.classList.remove('invalid');
            this.showValidationIcon(input, 'valid');
        } else if (!input.validity.valid && input.value.trim()) {
            input.classList.add('invalid');
            input.classList.remove('valid');
            this.showValidationIcon(input, 'invalid');
        }
    }

    showValidationIcon(input, type) {
        const wrapper = input.closest('.input-wrapper');
        if (!wrapper) return;

        const existingIcon = wrapper.querySelector('.validation-icon');
        if (existingIcon) existingIcon.remove();

        const icon = document.createElement('div');
        icon.className = 'validation-icon';
        icon.innerHTML = type === 'valid' 
            ? '<i class="fas fa-check-circle"></i>' 
            : '<i class="fas fa-exclamation-circle"></i>';
        
        icon.style.cssText = `
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%) scale(0);
            color: ${type === 'valid' ? '#43e97b' : '#f5576c'};
            font-size: 1.2rem;
            animation: iconPop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        `;

        wrapper.appendChild(icon);
    }

    createFocusGlow(wrapper) {
        const glow = document.createElement('div');
        glow.style.cssText = `
            position: absolute;
            inset: -2px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 15px;
            filter: blur(10px);
            opacity: 0;
            animation: glowFade 0.5s ease-out;
            pointer-events: none;
            z-index: -1;
        `;

        wrapper.appendChild(glow);
        setTimeout(() => glow.remove(), 500);
    }

    // ============================================
    // GOOGLE BUTTON - TO'LIQ ISHLAYDI
    // ============================================
    initGoogleButton() {
        const button = document.querySelector('.google-button');
        if (!button) {
            console.warn('⚠️ Google button not found');
            return;
        }

        // Click event
        button.addEventListener('click', (e) => this.handleGoogleClick(e, button));

        // Hover effects
        button.addEventListener('mouseenter', () => this.handleGoogleHover(button));
        button.addEventListener('mouseleave', () => this.handleGoogleLeave(button));

        // Keyboard
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });

        console.log('✅ Google button initialized');
    }

    handleGoogleClick(event, button) {
        event.preventDefault();

        // Ripple effect
        this.createRipple(button, event);

        // Loading state
        button.classList.add('loading');
        button.setAttribute('aria-busy', 'true');

        const textElement = button.querySelector('.google-button-text');
        const originalText = textElement ? textElement.textContent : '';
        
        if (textElement) {
            textElement.setAttribute('data-original-text', originalText);
            textElement.textContent = 'Yuklanmoqda...';
        }

        // Navigate
        const href = button.getAttribute('href');
        setTimeout(() => {
            if (href) {
                window.location.href = href;
            } else {
                console.error('❌ No href found on Google button');
                button.classList.remove('loading');
                button.setAttribute('aria-busy', 'false');
                if (textElement) {
                    textElement.textContent = originalText;
                }
            }
        }, 300);
    }

    handleGoogleHover(button) {
        button.style.transform = 'translateY(-1px) scale(1.01)';
    }

    handleGoogleLeave(button) {
        button.style.transform = 'translateY(0) scale(1)';
    }

    // ============================================
    // Ripple Effect
    // ============================================
    createRipple(element, event = null) {
        const ripple = document.createElement('span');
        ripple.classList.add('google-button-ripple');
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        
        let x, y;
        if (event) {
            x = event.clientX - rect.left - size / 2;
            y = event.clientY - rect.top - size / 2;
        } else {
            x = rect.width / 2 - size / 2;
            y = rect.height / 2 - size / 2;
        }

        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    // ============================================
    // Messages
    // ============================================
    initMessages() {
        const messages = document.querySelectorAll('.message');
        
        messages.forEach((message, index) => {
            message.style.animationDelay = `${index * 0.1}s`;

            const closeBtn = this.createCloseButton();
            closeBtn.addEventListener('click', () => this.dismissMessage(message));
            message.appendChild(closeBtn);

            if (message.classList.contains('message-success')) {
                setTimeout(() => this.dismissMessage(message), 5000);
            }
        });
    }

    createCloseButton() {
        const button = document.createElement('button');
        button.innerHTML = '<i class="fas fa-times"></i>';
        button.style.cssText = `
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            padding: 0.5rem;
            margin-left: auto;
            opacity: 0.6;
            transition: all 0.3s ease;
            border-radius: 8px;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.opacity = '1';
            button.style.transform = 'rotate(90deg)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.opacity = '0.6';
            button.style.transform = 'rotate(0deg)';
        });

        return button;
    }

    dismissMessage(message) {
        message.style.animation = 'messageSlideOut 0.4s ease-out';
        setTimeout(() => message.remove(), 400);
    }

    // ============================================
    // Keyboard Shortcuts
    // ============================================
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                const firstInput = document.querySelector('.form-input');
                if (firstInput) firstInput.focus();
            }

            if (e.ctrlKey && e.key === 'Enter') {
                const form = document.getElementById('loginForm');
                if (form) form.requestSubmit();
            }

            if (e.key === 'Escape') {
                document.activeElement?.blur();
            }
        });
    }

    // ============================================
    // Particles
    // ============================================
    initParticles() {
        const card = document.querySelector('.login-card');
        if (!card) return;

        setInterval(() => {
            this.createParticle(card);
        }, 2000);
    }

    createParticle(container) {
        const particle = document.createElement('div');
        const size = Math.random() * 5 + 2;
        const startX = Math.random() * 100;
        const duration = Math.random() * 3 + 2;

        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            bottom: 0;
            left: ${startX}%;
            opacity: 0;
            pointer-events: none;
            animation: particleRise ${duration}s ease-out;
            box-shadow: 0 0 ${size * 2}px rgba(102, 126, 234, 0.5);
        `;

        container.appendChild(particle);
        setTimeout(() => particle.remove(), duration * 1000);
    }
}

// ============================================
// Additional Styles (Dynamic)
// ============================================
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes floatShape {
        0%, 100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.3;
        }
        25% {
            transform: translate(30px, -30px) rotate(90deg);
            opacity: 0.5;
        }
        50% {
            transform: translate(0, -60px) rotate(180deg);
            opacity: 0.3;
        }
        75% {
            transform: translate(-30px, -30px) rotate(270deg);
            opacity: 0.5;
        }
    }

    @keyframes glowFade {
        0% { opacity: 0; }
        50% { opacity: 0.5; }
        100% { opacity: 0; }
    }

    @keyframes iconPop {
        0% {
            transform: translateY(-50%) scale(0);
        }
        50% {
            transform: translateY(-50%) scale(1.2);
        }
        100% {
            transform: translateY(-50%) scale(1);
        }
    }

    @keyframes messageSlideOut {
        to {
            opacity: 0;
            transform: translateX(30px);
        }
    }

    @keyframes particleRise {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 0.8;
        }
        90% {
            opacity: 0.2;
        }
        100% {
            transform: translateY(-300px) rotate(360deg);
            opacity: 0;
        }
    }

    .form-input.valid {
        border-color: #43e97b !important;
    }

    .form-input.invalid {
        border-color: #f5576c !important;
        animation: inputShake 0.4s ease;
    }

    @keyframes inputShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(additionalStyles);

// ============================================
// Page Load Effect
// ============================================
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-out';
        document.body.style.opacity = '1';
    }, 100);
});

// ============================================
// Initialize Everything
// ============================================
const tezShareLogin = new CompleteLoginPage();

// Make available globally
window.TezShareLogin = tezShareLogin;