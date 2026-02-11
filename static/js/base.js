// ============================================
// TezShare - Advanced JavaScript
// ============================================

class TezShareApp {
  constructor() {
    this.init();
  }

  init() {
    this.initThemeToggle();
    this.initCustomCursor();
    this.initMobileMenu();
    this.initScrollEffects();
    this.initSmoothScroll();
    this.initParticles();
    this.initScrollToTop();
    this.initAnimationsOnScroll();
    this.initParallaxOrbs();
    this.initUserMenuDropdown();
    this.initPageTransitions();
  }

  // ============================================
  // Theme Toggle
  // ============================================
  initThemeToggle() {
    // Load saved theme
    const savedTheme = localStorage.getItem("theme") || "dark";
    if (savedTheme === "light") {
      document.body.classList.add("light-theme");
    }

    // Desktop theme toggle
    const themeToggle = document.querySelector(".theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        this.toggleTheme();
      });
    }

    // Mobile theme toggle
    const mobileThemeToggle = document.querySelector(".mobile-theme-toggle");
    if (mobileThemeToggle) {
      mobileThemeToggle.addEventListener("click", () => {
        this.toggleTheme();
      });

      // Update mobile toggle text
      this.updateMobileToggleText(mobileThemeToggle);
    }
  }

  toggleTheme() {
    const body = document.body;
    const isLight = body.classList.toggle("light-theme");

    // Save theme preference
    localStorage.setItem("theme", isLight ? "light" : "dark");

    // Update mobile toggle text
    const mobileToggle = document.querySelector(".mobile-theme-toggle");
    if (mobileToggle) {
      this.updateMobileToggleText(mobileToggle);
    }

    // Recreate particles with new colors
    this.updateParticlesColor();

    // Add animation to theme change
    this.animateThemeChange();
  }

  updateMobileToggleText(toggle) {
    const isLight = document.body.classList.contains("light-theme");
    const icon = toggle.querySelector("i");
    const text = toggle.querySelector("span");

    if (isLight) {
      icon.className = "fas fa-sun";
      text.textContent = "Светлая тема";
    } else {
      icon.className = "fas fa-moon";
      text.textContent = "Тёмная тема";
    }
  }

  updateParticlesColor() {
    // This will be called when particles are drawn
    // The color is already handled in the draw method
  }

  animateThemeChange() {
    // Add ripple effect on theme change
    const ripple = document.createElement("div");
    ripple.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: ${document.body.classList.contains("light-theme") ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"};
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 99999;
            animation: rippleEffect 0.8s ease-out forwards;
        `;

    document.body.appendChild(ripple);

    setTimeout(() => ripple.remove(), 800);
  }

  // ============================================
  // Custom Cursor
  // ============================================
  initCustomCursor() {
    if (window.innerWidth <= 1024) return;

    const cursorDot = document.querySelector("[data-cursor-dot]");
    const cursorOutline = document.querySelector("[data-cursor-outline]");

    if (!cursorDot || !cursorOutline) return;

    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    // Smooth outline follow
    const animateOutline = () => {
      const distX = mouseX - outlineX;
      const distY = mouseY - outlineY;

      outlineX += distX * 0.15;
      outlineY += distY * 0.15;

      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;

      requestAnimationFrame(animateOutline);
    };

    animateOutline();

    // Cursor hover effects
    const hoverElements = document.querySelectorAll(
      "a, button, .glass-card, [data-cursor-hover]",
    );
    hoverElements.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursorOutline.style.width = "60px";
        cursorOutline.style.height = "60px";
        cursorOutline.style.borderColor = "var(--primary-400)";
      });

      el.addEventListener("mouseleave", () => {
        cursorOutline.style.width = "40px";
        cursorOutline.style.height = "40px";
        cursorOutline.style.borderColor = "var(--primary-500)";
      });
    });
  }

  // ============================================
  // Mobile Menu
  // ============================================
  initMobileMenu() {
    const menuToggle = document.querySelector(".mobile-menu-toggle");
    const menuOverlay = document.querySelector(".mobile-menu-overlay");
    const body = document.body;

    if (!menuToggle || !menuOverlay) return;

    const toggleMenu = () => {
      menuToggle.classList.toggle("active");
      menuOverlay.classList.toggle("active");
      body.style.overflow = menuOverlay.classList.contains("active")
        ? "hidden"
        : "";
    };

    menuToggle.addEventListener("click", toggleMenu);

    // Close on link click
    const mobileLinks = menuOverlay.querySelectorAll("a");
    mobileLinks.forEach((link) => {
      link.addEventListener("click", toggleMenu);
    });

    // Close on overlay click
    menuOverlay.addEventListener("click", (e) => {
      if (e.target === menuOverlay) {
        toggleMenu();
      }
    });
  }

  // ============================================
  // Scroll Effects
  // ============================================
  initScrollEffects() {
    const header = document.querySelector(".header");
    let lastScroll = 0;

    const handleScroll = () => {
      const currentScroll = window.pageYOffset;

      // Add scrolled class
      if (currentScroll > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }

      // Hide/show header on scroll
      if (currentScroll > lastScroll && currentScroll > 200) {
        header.style.transform = "translateY(-100%)";
      } else {
        header.style.transform = "translateY(0)";
      }

      lastScroll = currentScroll;
    };

    window.addEventListener("scroll", this.throttle(handleScroll, 100));
  }

  // ============================================
  // Smooth Scroll
  // ============================================
  initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href === "#" || href === "#!") return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const headerHeight = document.querySelector(".header").offsetHeight;
        const targetPosition =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      });
    });
  }

  // ============================================
  // Particles Animation
  // ============================================
  initParticles() {
    const canvas = document.getElementById("particles-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        const isLight = document.body.classList.contains("light-theme");
        const color = isLight ? "99, 102, 241" : "99, 102, 241";
        ctx.fillStyle = `rgba(${color}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const createParticles = () => {
      const particleCount = Math.min(window.innerWidth / 10, 100);
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const connectParticles = () => {
      const isLight = document.body.classList.contains("light-theme");
      const color = isLight ? "99, 102, 241" : "99, 102, 241";

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const opacity = isLight ? 0.08 : 0.1;
            ctx.strokeStyle = `rgba(${color}, ${opacity * (1 - distance / 120)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    createParticles();
    animate();

    // Pause animation when tab is not visible
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        animate();
      }
    });
  }

  // ============================================
  // Scroll to Top Button
  // ============================================
  initScrollToTop() {
    const scrollBtn = document.querySelector(".scroll-to-top");
    if (!scrollBtn) return;

    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 500) {
        scrollBtn.classList.add("visible");
      } else {
        scrollBtn.classList.remove("visible");
      }
    });

    scrollBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // ============================================
  // Animations on Scroll
  // ============================================
  initAnimationsOnScroll() {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.animateDelay || 0;
          setTimeout(() => {
            entry.target.classList.add("animate-in");
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll("[data-animate]");
    animatedElements.forEach((element) => {
      observer.observe(element);
    });
  }

  // ============================================
  // Parallax Orbs on Mouse Move
  // ============================================
  initParallaxOrbs() {
    const orbs = document.querySelectorAll(".gradient-orb");
    if (orbs.length === 0) return;

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
    });

    const updateOrbs = () => {
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      orbs.forEach((orb, index) => {
        const speed = (index + 1) * 20;
        const x = targetX * speed;
        const y = targetY * speed;

        orb.style.transform = `translate(${x}px, ${y}px)`;
      });

      requestAnimationFrame(updateOrbs);
    };

    updateOrbs();
  }

  // ============================================
  // User Menu Dropdown
  // ============================================
  initUserMenuDropdown() {
    const userMenu = document.querySelector(".user-menu");
    if (!userMenu) return;

    const userAvatar = userMenu.querySelector(".user-avatar");
    const userDropdown = userMenu.querySelector(".user-dropdown");

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!userMenu.contains(e.target)) {
        userDropdown.style.opacity = "0";
        userDropdown.style.visibility = "hidden";
        userDropdown.style.transform = "translateY(-10px)";
      }
    });
  }

  // ============================================
  // Page Transitions
  // ============================================
  initPageTransitions() {
    // Add fade-in animation to page load
    document.body.style.opacity = "0";
    window.addEventListener("load", () => {
      setTimeout(() => {
        document.body.style.transition = "opacity 0.6s ease";
        document.body.style.opacity = "1";
      }, 100);
    });
  }

  // ============================================
  // Utility Functions
  // ============================================
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}

// ============================================
// Notification System
// ============================================

class NotificationManager {
  constructor() {
    this.container = this.createContainer();
  }

  createContainer() {
    const container = document.createElement("div");
    container.className = "notification-container";
    container.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 10001;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
    document.body.appendChild(container);
    return container;
  }

  show(message, type = "info", duration = 4000) {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;

    const colors = {
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#3b82f6",
    };

    notification.style.cssText = `
            background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            max-width: 350px;
        `;

    const icons = {
      success: '<i class="fas fa-check-circle"></i>',
      error: '<i class="fas fa-exclamation-circle"></i>',
      warning: '<i class="fas fa-exclamation-triangle"></i>',
      info: '<i class="fas fa-info-circle"></i>',
    };

    notification.innerHTML = `
            ${icons[type] || icons.info}
            <span>${message}</span>
        `;

    this.container.appendChild(notification);

    setTimeout(() => {
      notification.style.animation =
        "slideOutRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
      setTimeout(() => notification.remove(), 400);
    }, duration);
  }
}

// ============================================
// Initialize App
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  const app = new TezShareApp();
  const notifications = new NotificationManager();

  // Expose globally
  window.TezShare = {
    app,
    notify: (message, type, duration) =>
      notifications.show(message, type, duration),
  };
});

// ============================================
// Add Animation Keyframes
// ============================================

const style = document.createElement("style");
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

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .animate-in {
        animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(40px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Loading animation */
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    /* Shimmer effect */
    @keyframes shimmer {
        0% {
            background-position: -1000px 0;
        }
        100% {
            background-position: 1000px 0;
        }
    }

    /* Ripple effect for theme change */
    @keyframes rippleEffect {
        from {
            width: 0;
            height: 0;
            opacity: 1;
        }
        to {
            width: 3000px;
            height: 3000px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
