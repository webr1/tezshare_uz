// ============================================
// Home Page JavaScript
// ============================================

class HomePage {
  constructor() {
    this.init();
  }

  init() {
    this.initCodeForm();
    this.initCodeInput();
    this.initAnimations();
    this.initCounters();
  }

  // ============================================
  // Code Form Handler
  // ============================================
  initCodeForm() {
    const codeForm = document.getElementById("codeForm");
    const codeInput = document.getElementById("shortCode");

    if (!codeForm || !codeInput) return;

    codeForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const code = codeInput.value.trim().toUpperCase();

      if (code.length !== 6) {
        this.showError("Код должен содержать 6 символов");
        return;
      }

      // Show loading state
      const submitButton = codeForm.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;

      submitButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> <span>Поиск...</span>';
      submitButton.disabled = true;

      // Redirect to search
      window.location.href = window.location.pathname + "?code=" + code;
    });
  }

  // ============================================
  // Code Input Enhancement
  // ============================================
  initCodeInput() {
    const codeInput = document.getElementById("shortCode");
    if (!codeInput) return;

    // Auto uppercase and format
    codeInput.addEventListener("input", (e) => {
      let value = e.target.value.toUpperCase();

      // Remove non-alphanumeric characters
      value = value.replace(/[^A-Z0-9]/g, "");

      // Limit to 6 characters
      if (value.length > 6) {
        value = value.substring(0, 6);
      }

      e.target.value = value;

      // Add success animation when complete
      if (value.length === 6) {
        codeInput.classList.add("complete");
        this.animateCodeComplete();
      } else {
        codeInput.classList.remove("complete");
      }
    });

    // Paste handler
    codeInput.addEventListener("paste", (e) => {
      e.preventDefault();
      const pastedText = (e.clipboardData || window.clipboardData)
        .getData("text")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .substring(0, 6);

      codeInput.value = pastedText;

      if (pastedText.length === 6) {
        codeInput.classList.add("complete");
        this.animateCodeComplete();
      }
    });

    // Focus animation
    codeInput.addEventListener("focus", () => {
      const wrapper = codeInput.closest(".code-input-wrapper");
      if (wrapper) {
        wrapper.classList.add("focused");
      }
    });

    codeInput.addEventListener("blur", () => {
      const wrapper = codeInput.closest(".code-input-wrapper");
      if (wrapper) {
        wrapper.classList.remove("focused");
      }
    });
  }

  animateCodeComplete() {
    const codeInput = document.getElementById("shortCode");
    if (!codeInput) return;

    // Add ripple effect
    const ripple = document.createElement("div");
    ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 10px;
            height: 10px;
            background: var(--primary-500);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            animation: ripple 0.6s ease-out;
        `;

    codeInput.parentElement.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    // Show success notification
    if (window.TezShare && window.TezShare.notify) {
      window.TezShare.notify("Код введен!", "success", 2000);
    }
  }

  showError(message) {
    const errorDiv = document.querySelector(".error-message");

    if (errorDiv) {
      errorDiv.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
            `;
    } else {
      // Create error message
      const codeForm = document.getElementById("codeForm");
      const newError = document.createElement("div");
      newError.className = "error-message";
      newError.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
            `;

      const submitButton = codeForm.querySelector('button[type="submit"]');
      codeForm.insertBefore(newError, submitButton);

      // Remove after 3 seconds
      setTimeout(() => newError.remove(), 3000);
    }
  }

  // ============================================
  // Animations
  // ============================================
  initAnimations() {
    // Add hover effect to action cards
    const actionCards = document.querySelectorAll(".action-card");
    actionCards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        this.animateCardParticles(card);
      });
    });

    // Animate floating cards
    this.animateFloatingCards();
  }

  animateCardParticles(card) {
    const particles = card.querySelectorAll(".icon-particles span");
    particles.forEach((particle, index) => {
      setTimeout(() => {
        particle.style.animation = "particleFloat 3s ease-out";
      }, index * 100);
    });
  }

  animateFloatingCards() {
    const floatingCards = document.querySelectorAll(".floating-card");

    floatingCards.forEach((card, index) => {
      // Add random rotation
      const randomRotation = Math.random() * 10 - 5;
      card.style.transform = `rotate(${randomRotation}deg)`;

      // Add hover effect
      card.addEventListener("mouseenter", () => {
        card.style.transform = `rotate(0deg) scale(1.05)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = `rotate(${randomRotation}deg) scale(1)`;
      });
    });
  }

  // ============================================
  // Counter Animation
  // ============================================
  initCounters() {
    const observerOptions = {
      threshold: 0.5,
      rootMargin: "0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          !entry.target.classList.contains("counted")
        ) {
          entry.target.classList.add("counted");
          this.animateCounter(entry.target);
        }
      });
    }, observerOptions);

    const statNumbers = document.querySelectorAll(".stat-number");
    statNumbers.forEach((stat) => observer.observe(stat));
  }

  animateCounter(element) {
    const text = element.textContent;
    const hasNumber = /\d+/.test(text);

    if (!hasNumber) return;

    const number = parseInt(text.match(/\d+/)[0]);
    const suffix = text.replace(/\d+/, "");
    const duration = 2000;
    const steps = 60;
    const increment = number / steps;
    const stepDuration = duration / steps;

    let current = 0;

    const timer = setInterval(() => {
      current += increment;

      if (current >= number) {
        element.textContent = number + suffix;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current) + suffix;
      }
    }, stepDuration);
  }
}

// ============================================
// Keyboard Shortcuts
// ============================================

function initKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Focus code input on '/' key
    if (e.key === "/" && !e.target.matches("input, textarea")) {
      e.preventDefault();
      const codeInput = document.getElementById("shortCode");
      if (codeInput) {
        codeInput.focus();
      }
    }

    // Submit on Enter when code is complete
    if (e.key === "Enter" && e.target.id === "shortCode") {
      const codeInput = e.target;
      if (codeInput.value.length === 6) {
        document.getElementById("codeForm").dispatchEvent(new Event("submit"));
      }
    }
  });
}

// ============================================
// Smooth Scroll for CTA buttons
// ============================================

function initSmoothScrollLinks() {
  const ctaLinks = document.querySelectorAll('a[href^="#"]');

  ctaLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href === "#" || href === "#!") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });
}

// ============================================
// Add Ripple CSS Animation
// ============================================

const style = document.createElement("style");
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

    .code-input.complete {
        border-color: var(--accent-green);
        background: rgba(16, 185, 129, 0.05);
    }

    .code-input-wrapper.focused .code-input {
        transform: scale(1.02);
    }

    /* Particle float animation already defined in CSS */
`;
document.head.appendChild(style);

// ============================================
// Initialize
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  const homePage = new HomePage();
  initKeyboardShortcuts();
  initSmoothScrollLinks();

  // Expose globally
  window.HomePage = homePage;
});

// ============================================
// Helper: Copy code to clipboard
// ============================================

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      if (window.TezShare && window.TezShare.notify) {
        window.TezShare.notify("Код скопирован!", "success");
      }
    });
  } else {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    if (window.TezShare && window.TezShare.notify) {
      window.TezShare.notify("Код скопирован!", "success");
    }
  }
}

// Expose helper function
window.copyToClipboard = copyToClipboard;
