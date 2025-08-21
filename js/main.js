/**
 * Main JavaScript functionality for Blue Excellent Painting website
 */

(function () {
  "use strict";

  // DOM Content Loaded Event
  document.addEventListener("DOMContentLoaded", function () {
    initializeAOS();
    initializeNavbar();
    initializeSmoothScrolling();
    initializeCounters();
    initializeScrollAnimations();
    initializeModalHandlers();
    initializeFormHandlers();
    initializeParallaxEffect();
    // initializeTypingEffect();
    initializeIntersectionObserver();
    initializeLazyLoading();
    initializeTooltips();
    initializeCopyToClipboard();
    initializeReadingProgress();
    initializeKeyboardNavigation();
    initializePerformanceMonitoring();
    initializeErrorHandling();
  });

  /**
   * Initialize AOS (Animate On Scroll) library
   */
  function initializeAOS() {
    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 800,
        easing: "ease-out-cubic",
        once: true,
        offset: 50,
        delay: 100,
        disable: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        startEvent: 'DOMContentLoaded',
        useClassNames: false,
        disableMutationObserver: false,
        debounceDelay: 50,
        throttleDelay: 99,
      });
    }
  }

  /**
   * Initialize navbar scroll behavior
   */
  function initializeNavbar() {
    const navbar = document.getElementById("mainNav");
    
    if (!navbar) return;

    // Navbar scroll behavior
    let lastScrollTop = 0;
    
    window.addEventListener("scroll", throttle(function () {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Add scrolled class
      if (scrollTop > 100) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
      
      // Hide/show navbar on scroll (optional)
      if (scrollTop > lastScrollTop && scrollTop > 500) {
        navbar.style.transform = "translateY(-100%)";
      } else {
        navbar.style.transform = "translateY(0)";
      }
      
      lastScrollTop = scrollTop;
    }, 16));

    // Mobile menu close on link click
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
    const navbarCollapse = document.querySelector(".navbar-collapse");

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (navbarCollapse && navbarCollapse.classList.contains("show")) {
          const bsCollapse = new bootstrap.Collapse(navbarCollapse);
          bsCollapse.hide();
        }
      });
    });

    // Active nav link highlighting
    updateActiveNavLink();
    window.addEventListener("scroll", throttle(updateActiveNavLink, 100));
  }

  /**
   * Update active navigation link based on scroll position
   */
  function updateActiveNavLink() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link[href^='#']");
    
    let currentSection = "";
    const scrollTop = window.pageYOffset + 150;

    sections.forEach(function(section) {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
        currentSection = section.id;
      }
    });

    navLinks.forEach(function(link) {
      link.classList.remove("active");
      const href = link.getAttribute("href");
      if (href === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
  }

  /**
   * Initialize smooth scrolling for anchor links
   */
  function initializeSmoothScrolling() {
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

    smoothScrollLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          const navbar = document.getElementById("mainNav");
          const navbarHeight = navbar ? navbar.offsetHeight : 80;
          const offsetTop = targetElement.offsetTop - navbarHeight;

          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });

          // Track scroll click
          trackEvent("navigation_click", {
            target_section: targetId.replace("#", ""),
            source: "navbar",
          });
        }
      });
    });
  }

/**
 * Initialize animated counters
 */
    function initializeCounters() {
    // CHANGE THIS LINE - exclude elements with "no-animation" class
    const counters = document.querySelectorAll('[id$="-counter"], .stat-number:not(.no-animation), .counter');
    
    const counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
        });
    }, {
        threshold: 0.5,
        rootMargin: "0px 0px -10% 0px"
    });

    counters.forEach(function (counter) {
        counterObserver.observe(counter);
    });
    }

  /**
   * Animate counter from 0 to target value
   */
  function animateCounter(element) {
    const text = element.textContent || element.innerText;
    const target = parseInt(text.replace(/[^0-9]/g, "")) || 0;
    
    if (target === 0) return;
    
    const duration = 2000;
    const startTime = performance.now();
    const startValue = 0;

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out-cubic)
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (target - startValue) * easeOutCubic);

      // Format the number based on original text
      if (text.includes("%")) {
        element.textContent = currentValue + "%";
      } else if (text.includes("+")) {
        element.textContent = currentValue + "+";
      } else if (text.includes("k")) {
        element.textContent = (currentValue / 1000).toFixed(1) + "k";
      } else {
        element.textContent = currentValue.toLocaleString();
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        // Add completion animation
        element.classList.add("animate-counter");
        setTimeout(() => element.classList.remove("animate-counter"), 300);
      }
    }

    requestAnimationFrame(updateCounter);
  }

  /**
   * Initialize scroll-triggered animations
   */
  function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll(
      ".scroll-animate, .fade-in, .slide-in-left, .slide-in-right, .zoom-in"
    );

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible", "in-view");
            
            // Add staggered animation for child elements
            const children = entry.target.querySelectorAll(".stagger");
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add("visible");
              }, index * 100);
            });
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -5% 0px",
      }
    );

    animatedElements.forEach(function (element) {
      observer.observe(element);
    });
  }

  /**
   * Initialize modal event handlers
   */
  function initializeModalHandlers() {
    const modals = document.querySelectorAll(".modal");

    modals.forEach(function (modal) {
      modal.addEventListener("show.bs.modal", function (e) {
        // Track modal view
        const modalId = this.id;
        trackEvent("modal_view", { 
          modal_id: modalId,
          trigger: e.relatedTarget?.textContent || "unknown"
        });

        // Add entrance animation
        const modalDialog = this.querySelector(".modal-dialog");
        if (modalDialog) {
          modalDialog.classList.add("modal-enter");
        }
      });

      modal.addEventListener("hide.bs.modal", function () {
        // Add exit animation
        const modalDialog = this.querySelector(".modal-dialog");
        if (modalDialog) {
          modalDialog.classList.remove("modal-enter");
          modalDialog.classList.add("modal-exit");
        }
      });

      modal.addEventListener("hidden.bs.modal", function () {
        // Clean up animation classes
        const modalDialog = this.querySelector(".modal-dialog");
        if (modalDialog) {
          modalDialog.classList.remove("modal-exit");
        }
      });
    });
  }

  /**
   * Initialize form handlers
   */
  function initializeFormHandlers() {
    const forms = document.querySelectorAll("form");

    forms.forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        
        // Remove previous error states
        clearFormErrors(form);
        
        // Validate form
        if (validateForm(form)) {
          submitForm(form);
        }
      });

      // Real-time validation
      const inputs = form.querySelectorAll("input, textarea, select");
      inputs.forEach(input => {
        input.addEventListener("blur", () => validateField(input));
        input.addEventListener("input", () => {
          if (input.classList.contains("error")) {
            validateField(input);
          }
        });
      });
    });

    // Phone number formatting
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
      input.addEventListener("input", formatPhoneNumber);
    });
  }

  /**
   * Format phone number input
   */
  function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 6) {
      value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
    } else if (value.length >= 3) {
      value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    }
    e.target.value = value;
  }

  /**
   * Validate form inputs
   */
  function validateForm(form) {
    const inputs = form.querySelectorAll("input[required], textarea[required], select[required]");
    let isValid = true;

    inputs.forEach(function (input) {
      if (!validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Validate individual field
   */
  function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = "";

    // Check if required field is empty
    if (field.hasAttribute("required") && !value) {
      isValid = false;
      message = "This field is required";
    }
    
    // Email validation
    else if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        message = "Please enter a valid email address";
      }
    }
    
    // Phone validation
    else if (field.type === "tel" && value) {
      const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$/;
      if (!phoneRegex.test(value)) {
        isValid = false;
        message = "Please enter a valid phone number";
      }
    }

    // Update field state
    if (isValid) {
      clearFieldError(field);
      field.classList.add("success");
    } else {
      showFieldError(field, message);
      field.classList.remove("success");
    }

    return isValid;
  }

  /**
   * Show field error message
   */
  function showFieldError(field, message) {
    clearFieldError(field);

    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

    field.classList.add("error");
    field.parentNode.appendChild(errorDiv);
  }

  /**
   * Clear field error message
   */
  function clearFieldError(field) {
    field.classList.remove("error");
    const existingError = field.parentNode.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }
  }

  /**
   * Clear all form errors
   */
  function clearFormErrors(form) {
    const errorFields = form.querySelectorAll(".error");
    const errorMessages = form.querySelectorAll(".error-message");
    
    errorFields.forEach(field => field.classList.remove("error"));
    errorMessages.forEach(message => message.remove());
  }

  /**
   * Submit form data
   */
  function submitForm(form) {
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;

    // Show loading state
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner me-2"></span>Sending...';
      submitButton.classList.add("loading");
    }

    // Track form submission
    trackEvent("form_submit", {
      form_id: form.id || "quote_form",
      service_type: formData.get("serviceType") || "unknown"
    });

    // Simulate form submission (replace with actual endpoint)
    setTimeout(function () {
      // Success state
      showNotification("Thank you! We'll contact you within 24 hours.", "success");
      form.reset();
      
      // Reset button
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
        submitButton.classList.remove("loading");
      }

      // Track successful submission
      trackEvent("form_submit_success", {
        form_id: form.id || "quote_form"
      });

      // Scroll to confirmation or redirect
      setTimeout(() => {
        window.location.hash = "#thank-you";
      }, 2000);

    }, 2000);
  }

  /**
   * Initialize parallax scrolling effect
   */
  function initializeParallaxEffect() {
    const parallaxElements = document.querySelectorAll(".parallax, [data-parallax]");

    if (parallaxElements.length === 0) return;

    // Check if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const updateParallax = throttle(function() {
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach(function (element) {
        const speed = parseFloat(element.dataset.parallax) || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    }, 16);

    window.addEventListener("scroll", updateParallax);
  }

  /**
   * Initialize typing effect for hero text
   */
  function startTypingAnimation(element) {
    const text = element.textContent;
    const speed = parseInt(element.dataset.speed) || 100;
    
    element.textContent = "";
    element.style.borderRight = "3px solid var(--accent-color)";
    element.style.minHeight = "1.2em";

    let i = 0;
    const timer = setInterval(function () {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(timer);
        // Remove cursor after typing is complete
        setTimeout(() => {
          element.style.borderRight = "none";
        }, 1000);
      }
    }, speed);
  }

  /**
   * Initialize intersection observer for various animations
   */
  function initializeIntersectionObserver() {
    // Gallery hover effects
    const galleryItems = document.querySelectorAll(".before-after-card");
    galleryItems.forEach(item => {
      item.addEventListener("mouseenter", function() {
        this.classList.add("hover-active");
      });
      
      item.addEventListener("mouseleave", function() {
        this.classList.remove("hover-active");
      });
    });

    // Service card interactions
    const serviceCards = document.querySelectorAll(".service-card");
    serviceCards.forEach(card => {
      card.addEventListener("click", function() {
        const serviceName = this.querySelector("h4").textContent;
        trackEvent("service_card_click", {
          service_name: serviceName
        });
      });
    });

    // Testimonial card interactions
    const testimonialCards = document.querySelectorAll(".testimonial-card");
    testimonialCards.forEach(card => {
      card.addEventListener("mouseenter", function() {
        this.style.transform = "translateY(-10px) scale(1.02)";
      });
      
      card.addEventListener("mouseleave", function() {
        this.style.transform = "translateY(0) scale(1)";
      });
    });
  }

  /**
   * Initialize lazy loading for images
   */
  function initializeLazyLoading() {
    const images = document.querySelectorAll("img[data-src], img[loading='lazy']");

    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // Add loading class
            img.classList.add("lazy-image");
            
            // Load the image
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
            }
            
            img.onload = function() {
              img.classList.remove("lazy-image");
              img.classList.add("animate-fade-in");
            };
            
            img.onerror = function() {
              img.classList.remove("lazy-image");
              img.alt = "Image failed to load";
            };
            
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: "50px 0px"
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for older browsers
      images.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
        }
      });
    }
  }

  /**
   * Initialize tooltip functionality
   */
  function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    
    if (typeof bootstrap !== "undefined" && bootstrap.Tooltip) {
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
          trigger: 'hover focus',
          animation: true,
          delay: { show: 300, hide: 100 }
        });
      });
    }

    // Custom tooltips for form fields
    const formFields = document.querySelectorAll("input, textarea, select");
    formFields.forEach(field => {
      if (field.title) {
        field.addEventListener("focus", function() {
          showCustomTooltip(this, this.title);
        });
        
        field.addEventListener("blur", function() {
          hideCustomTooltip(this);
        });
      }
    });
  }

  /**
   * Show custom tooltip
   */
  function showCustomTooltip(element, text) {
    const tooltip = document.createElement("div");
    tooltip.className = "custom-tooltip";
    tooltip.textContent = text;
    
    element.parentNode.style.position = "relative";
    element.parentNode.appendChild(tooltip);
    
    // Position tooltip
    const rect = element.getBoundingClientRect();
    const parentRect = element.parentNode.getBoundingClientRect();
    
    tooltip.style.position = "absolute";
    tooltip.style.bottom = "100%";
    tooltip.style.left = "0";
    tooltip.style.marginBottom = "5px";
  }

  /**
   * Hide custom tooltip
   */
  function hideCustomTooltip(element) {
    const tooltip = element.parentNode.querySelector(".custom-tooltip");
    if (tooltip) {
      tooltip.remove();
    }
  }

  /**
   * Initialize copy to clipboard functionality
   */
  function initializeCopyToClipboard() {
    const copyButtons = document.querySelectorAll("[data-copy]");

    copyButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const textToCopy = this.dataset.copy || window.location.href;

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard
            .writeText(textToCopy)
            .then(function () {
              showNotification("Link copied to clipboard!", "success");
              trackEvent("copy_link", { method: "clipboard_api" });
            })
            .catch(function () {
              fallbackCopyToClipboard(textToCopy);
            });
        } else {
          fallbackCopyToClipboard(textToCopy);
        }
      });
    });
  }

  /**
   * Fallback copy to clipboard for older browsers
   */
  function fallbackCopyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand("copy");
      showNotification("Link copied to clipboard!", "success");
      trackEvent("copy_link", { method: "execCommand" });
    } catch (err) {
      showNotification("Failed to copy link. Please copy manually.", "error");
    }
    
    document.body.removeChild(textArea);
  }

  /**
   * Initialize reading progress indicator
   */
  function initializeReadingProgress() {
    // Only show on blog pages or long content
    const mainContent = document.querySelector(".service-article, .blog-article, main");
    if (!mainContent) return;

    const progressBar = document.createElement("div");
    progressBar.className = "reading-progress";
    progressBar.innerHTML = '<div class="reading-progress-fill"></div>';
    
    // Add styles
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: rgba(0, 0, 0, 0.1);
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    const fill = progressBar.querySelector(".reading-progress-fill");
    fill.style.cssText = `
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
      transition: width 0.3s ease;
    `;

    document.body.appendChild(progressBar);

    window.addEventListener("scroll", throttle(function () {
      const scrollTop = window.pageYOffset;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);

      // Show progress bar after scrolling past hero
      if (scrollTop > 200) {
        progressBar.style.opacity = "1";
      } else {
        progressBar.style.opacity = "0";
      }

      fill.style.width = scrollPercent + "%";
    }, 16));
  }

  /**
   * Initialize keyboard navigation
   */
  function initializeKeyboardNavigation() {
    document.addEventListener("keydown", function (e) {
      // ESC key closes modals
      if (e.key === "Escape") {
        const openModal = document.querySelector(".modal.show");
        if (openModal) {
          const bsModal = bootstrap.Modal.getInstance(openModal);
          if (bsModal) bsModal.hide();
        }
        
        // Close notifications
        const notifications = document.querySelectorAll(".notification-toast");
        notifications.forEach(notification => notification.remove());
      }

      // Ctrl + Enter submits forms
      if (e.ctrlKey && e.key === "Enter") {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === "TEXTAREA" || activeElement.tagName === "INPUT")) {
          const form = activeElement.closest("form");
          if (form) {
            form.dispatchEvent(new Event("submit"));
          }
        }
      }

      // Arrow keys for section navigation
      if (e.key === "ArrowDown" && e.ctrlKey) {
        e.preventDefault();
        navigateToNextSection();
      }

      if (e.key === "ArrowUp" && e.ctrlKey) {
        e.preventDefault();
        navigateToPreviousSection();
      }
    });

    // Focus management for modals
    document.addEventListener("show.bs.modal", function(e) {
      const modal = e.target;
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        setTimeout(() => focusableElements[0].focus(), 100);
      }
    });
  }

  /**
   * Navigate to next section
   */
  function navigateToNextSection() {
    const sections = document.querySelectorAll("section[id]");
    const currentScrollY = window.pageYOffset + 100;
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const sectionTop = section.offsetTop;

      if (sectionTop > currentScrollY) {
        scrollToSection(section);
        break;
      }
    }
  }

  /**
   * Navigate to previous section
   */
  function navigateToPreviousSection() {
    const sections = document.querySelectorAll("section[id]");
    const currentScrollY = window.pageYOffset + 100;

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const sectionTop = section.offsetTop;

      if (sectionTop < currentScrollY) {
        scrollToSection(section);
        break;
      }
    }
  }

  /**
   * Scroll to section smoothly
   */
  function scrollToSection(section) {
    const navbar = document.getElementById("mainNav");
    const navbarHeight = navbar ? navbar.offsetHeight : 80;
    
    window.scrollTo({
      top: section.offsetTop - navbarHeight,
      behavior: "smooth"
    });
    
    trackEvent("keyboard_navigation", {
      target_section: section.id
    });
  }

  /**
   * Initialize performance monitoring
   */
  function initializePerformanceMonitoring() {
    // Monitor page load time
    window.addEventListener("load", function () {
      setTimeout(() => {
        const navigation = performance.getEntriesByType("navigation")[0];
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.fetchStart;
          
          trackEvent("page_performance", {
            load_time: Math.round(loadTime),
            dom_content_loaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
            first_paint: getFirstPaintTime(),
          });
        }
      }, 0);
    });

    // Monitor Core Web Vitals if available
    if ('web-vital' in window) {
      try {
        getCLS(sendToAnalytics);
        getFID(sendToAnalytics);
        getFCP(sendToAnalytics);
        getLCP(sendToAnalytics);
        getTTFB(sendToAnalytics);
      } catch (e) {
        console.log("Web Vitals not available");
      }
    }

    // Monitor scroll performance
    let lastScrollTime = performance.now();
    window.addEventListener("scroll", throttle(function() {
      const currentTime = performance.now();
      const scrollDelta = currentTime - lastScrollTime;
      
      if (scrollDelta > 16.67) { // More than 60fps
        console.warn("Slow scroll detected:", scrollDelta);
      }
      
      lastScrollTime = currentTime;
    }, 100));
  }

  /**
   * Get first paint time
   */
  function getFirstPaintTime() {
    const paintEntries = performance.getEntriesByType("paint");
    const firstPaint = paintEntries.find(entry => entry.name === "first-paint");
    return firstPaint ? Math.round(firstPaint.startTime) : null;
  }

  /**
   * Send performance data to analytics
   */
  function sendToAnalytics(metric) {
    trackEvent("web_vital", {
      name: metric.name,
      value: Math.round(metric.value),
      delta: Math.round(metric.delta),
      id: metric.id,
    });
  }

  /**
   * Initialize error handling
   */
  function initializeErrorHandling() {
    // Global error handler
    // window.addEventListener("error", function (e) {
    //   console.error("JavaScript Error:", e.error);
      
    //   trackEvent("javascript_error", {
    //     message: e.message,
    //     filename: e.filename,
    //     lineno: e.lineno,
    //     colno: e.colno,
    //     stack: e.error?.stack?.substring(0, 500), // Limit stack trace size
    //   });
      
    //   // Show user-friendly error for critical failures
    //   if (e.message.includes("Critical") || e.filename.includes("main.js")) {
    //     showNotification("Something went wrong. Please refresh the page.", "error");
    //   }
    // });

    // Unhandled promise rejection handler
    window.addEventListener("unhandledrejection", function (e) {
      console.error("Unhandled Promise Rejection:", e.reason);
      
      trackEvent("promise_rejection", {
        reason: e.reason?.toString?.() || "Unknown error",
        stack: e.reason?.stack?.substring(0, 500),
      });
    });

    // Network error detection
    window.addEventListener("offline", function() {
      showNotification("You're offline. Some features may not work.", "warning", 0);
    });

    window.addEventListener("online", function() {
      showNotification("You're back online!", "success");
    });
  }

  /**
   * Show notification message
   */
  function showNotification(message, type = "info", duration = 5000) {
    const notification = document.createElement("div");
    notification.className = `notification-toast alert alert-${type} notification-enter`;
    
    const iconMap = {
      success: "fas fa-check-circle",
      error: "fas fa-exclamation-circle", 
      warning: "fas fa-exclamation-triangle",
      info: "fas fa-info-circle"
    };

    notification.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="${iconMap[type] || iconMap.info} me-2"></i>
        <span class="flex-grow-1">${message}</span>
        <button type="button" class="btn-close ms-2" onclick="this.parentElement.parentElement.remove()"></button>
      </div>
    `;

    // Add styles for notification
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      max-width: 400px;
      border: none;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Auto remove after duration (if not 0)
    if (duration > 0) {
      setTimeout(function () {
        if (notification.parentNode) {
          notification.classList.add("notification-exit");
          setTimeout(() => notification.remove(), 300);
        }
      }, duration);
    }

    // Track notification
    trackEvent("notification_shown", {
      type: type,
      message: message.substring(0, 100)
    });

    return notification;
  }

  /**
   * Track events for analytics
   */
  function trackEvent(eventName, parameters = {}) {
    // Google Analytics 4
    if (typeof gtag !== "undefined") {
      gtag("event", eventName, {
        ...parameters,
        timestamp: new Date().toISOString()
      });
    }

    // Facebook Pixel
    if (typeof fbq !== "undefined") {
      fbq("track", eventName, parameters);
    }

    // Custom analytics
    if (window.customAnalytics && typeof window.customAnalytics.track === "function") {
      window.customAnalytics.track(eventName, parameters);
    }

    // Console log for development
    if (window.location.hostname === "localhost" || window.location.hostname.includes("dev")) {
      console.log("Analytics Event:", eventName, parameters);
    }
  }

/**
 * Initialize quote request tracking
 */
function initializeQuoteTracking() {
  // FIX: Replace invalid selector
  const quoteButtons = document.querySelectorAll('a[href="#contact"], .btn[href="#contact"]');
  // REMOVE: .btn:contains("Quote") - this is not valid CSS
  
  quoteButtons.forEach(button => {
    button.addEventListener("click", function() {
      trackEvent("quote_button_click", {
        button_text: this.textContent.trim(),
        location: getButtonLocation(this)
      });
    });
  });

  // Track phone number clicks
  const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
  phoneLinks.forEach(link => {
    link.addEventListener("click", function() {
      trackEvent("phone_click", {
        phone_number: this.href.replace("tel:", ""),
        location: getButtonLocation(this)
      });
    });
  });

  // Track email clicks
  const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
  emailLinks.forEach(link => {
    link.addEventListener("click", function() {
      trackEvent("email_click", {
        email: this.href.replace("mailto:", ""),
        location: getButtonLocation(this)
      });
    });
  });
}

  /**
   * Get button location context
   */
  function getButtonLocation(element) {
    const section = element.closest("section");
    return section?.id || "unknown";
  }

  /**
   * Initialize view tracking
   */
  function initializeViewTracking() {
    // Track section views
    const sections = document.querySelectorAll("section[id]");
    const sectionObserver = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          trackEvent("section_view", {
            section_id: entry.target.id,
            section_name: entry.target.querySelector("h1, h2")?.textContent || entry.target.id
          });
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: "0px 0px -20% 0px"
    });

    sections.forEach(section => sectionObserver.observe(section));

    // Track gallery interactions
    const galleryImages = document.querySelectorAll(".gallery-image, .before-after-card");
    galleryImages.forEach((image, index) => {
      image.addEventListener("click", function() {
        trackEvent("gallery_interaction", {
          image_index: index,
          image_alt: this.alt || "unknown"
        });
      });
    });

    // Track service interest
    const serviceCards = document.querySelectorAll(".service-card");
    serviceCards.forEach(card => {
      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const serviceName = card.querySelector("h4")?.textContent;
            trackEvent("service_interest", {
              service_name: serviceName,
              view_duration: Date.now() - entry.time
            });
            observer.unobserve(card);
          }
        });
      }, { threshold: 0.8 });
      
      observer.observe(card);
    });
  }

  /**
   * Initialize scroll depth tracking
   */
  function initializeScrollDepthTracking() {
    let maxScrollDepth = 0;
    const milestones = [25, 50, 75, 90, 100];
    const tracked = new Set();

    window.addEventListener("scroll", throttle(function() {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      const scrollDepth = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        
        milestones.forEach(milestone => {
          if (scrollDepth >= milestone && !tracked.has(milestone)) {
            tracked.add(milestone);
            trackEvent("scroll_depth", {
              depth_percentage: milestone,
              page_height: documentHeight,
              viewport_height: windowHeight
            });
          }
        });
      }
    }, 1000));
  }

  /**
   * Initialize session tracking
   */
  function initializeSessionTracking() {
    const sessionStart = Date.now();
    let lastActivity = sessionStart;
    
    // Track session duration
    window.addEventListener("beforeunload", function() {
      const sessionDuration = Date.now() - sessionStart;
      const idleTime = Date.now() - lastActivity;
      
      trackEvent("session_end", {
        duration: Math.round(sessionDuration / 1000),
        idle_time: Math.round(idleTime / 1000),
        page_url: window.location.href
      });
    });

    // Update activity timestamp
    const activityEvents = ["click", "scroll", "keydown", "mousemove", "touchstart"];
    activityEvents.forEach(event => {
      document.addEventListener(event, throttle(() => {
        lastActivity = Date.now();
      }, 5000));
    });

    // Track returning visitors
    const isReturning = localStorage.getItem("blue_excellent_visited");
    if (!isReturning) {
      localStorage.setItem("blue_excellent_visited", "true");
      trackEvent("new_visitor", {
        first_visit: new Date().toISOString()
      });
    } else {
      trackEvent("returning_visitor", {
        last_visit: localStorage.getItem("blue_excellent_last_visit")
      });
    }
    
    localStorage.setItem("blue_excellent_last_visit", new Date().toISOString());
  }

  /**
   * Utility functions
   */
  
  /**
   * Throttle function for performance
   */
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Debounce function for performance
   */
  function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
      const context = this;
      const args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  /**
   * Initialize theme detection
   */
  function initializeThemeDetection() {
    // Detect user's color scheme preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    
    function handleThemeChange(e) {
      trackEvent("theme_preference", {
        prefers_dark: e.matches,
        timestamp: new Date().toISOString()
      });
      
      // Apply theme-specific adjustments if needed
      if (e.matches) {
        document.body.classList.add("dark-mode-preferred");
      } else {
        document.body.classList.remove("dark-mode-preferred");
      }
    }
    
    handleThemeChange(prefersDark);
    prefersDark.addListener(handleThemeChange);
  }

  /**
   * Initialize device detection
   */
  function initializeDeviceDetection() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth > 768;
    const isDesktop = !isMobile && !isTablet;
    
    document.body.classList.add(
      isMobile ? "device-mobile" : 
      isTablet ? "device-tablet" : 
      "device-desktop"
    );
    
    trackEvent("device_detection", {
      is_mobile: isMobile,
      is_tablet: isTablet,
      is_desktop: isDesktop,
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
      user_agent: navigator.userAgent.substring(0, 200)
    });
  }

  /**
   * Initialize connection quality detection
   */
  function initializeConnectionDetection() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      trackEvent("connection_info", {
        effective_type: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        save_data: connection.saveData
      });
      
      // Adjust features based on connection
      if (connection.effectiveType === "slow-2g" || connection.saveData) {
        document.body.classList.add("slow-connection");
        // Disable non-essential animations
        document.documentElement.style.setProperty("--animation-duration", "0.1s");
      }
    }
  }

  /**
   * Initialize on page load
   */
  window.addEventListener("load", function() {
    initializeQuoteTracking();
    initializeViewTracking();
    initializeScrollDepthTracking();
    initializeSessionTracking();
    initializeThemeDetection();
    initializeDeviceDetection();
    initializeConnectionDetection();
  });

  // Service Worker registration for PWA capabilities
  // if ("serviceWorker" in navigator && "PushManager" in window) {
  //   window.addEventListener("load", function() {
  //     navigator.serviceWorker
  //       .register("/sw.js")
  //       .then(function(registration) {
  //         console.log("ServiceWorker registration successful");
  //         trackEvent("service_worker_registered", {
  //           scope: registration.scope
  //         });
  //       })
  //       .catch(function(err) {
  //         console.log("ServiceWorker registration failed", err);
  //         trackEvent("service_worker_error", {
  //           error: err.toString()
  //         });
  //       });
  //   });
  // }

  /**
   * Initialize typing effect for hero text
   */
  function initializeTypingEffect() {
    const typingElements = document.querySelectorAll('[data-typing]');
    
    if (typingElements.length === 0) return;
    
    typingElements.forEach(element => {
      startTypingAnimation(element);
    });
  }

  function startTypingAnimation(element) {
    const text = element.textContent;
    const speed = parseInt(element.dataset.speed) || 100;
    
    element.textContent = "";
    element.style.borderRight = "3px solid var(--accent-color)";
    element.style.minHeight = "1.2em";

    let i = 0;
    const timer = setInterval(function () {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(timer);
        // Remove cursor after typing is complete
        setTimeout(() => {
          element.style.borderRight = "none";
        }, 1000);
      }
    }, speed);
  }

  // Expose utility functions globally
  window.BlueExcellentPainting = {
    showNotification: showNotification,
    trackEvent: trackEvent,
    animateCounter: animateCounter,
    formatPhoneNumber: formatPhoneNumber,
    validateField: validateField,
    throttle: throttle,
    debounce: debounce
  };

  // Initialize critical functions immediately
  // initializeErrorHandling();

})();

// Polyfills and fallbacks
(function() {
  // Intersection Observer polyfill check
  if (!('IntersectionObserver' in window)) {
    console.warn("IntersectionObserver not supported, loading polyfill...");
    
    // Simple fallback
    window.IntersectionObserver = function(callback, options) {
      return {
        observe: function(element) {
          setTimeout(() => {
            callback([{ isIntersecting: true, target: element }]);
          }, 100);
        },
        unobserve: function() {},
        disconnect: function() {}
      };
    };
  }

  // RequestAnimationFrame polyfill
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      return setTimeout(callback, 16);
    };
  }

  // CustomEvent polyfill for IE
  if (typeof window.CustomEvent !== "function") {
    function CustomEvent(event, params) {
      params = params || { bubbles: false, cancelable: false, detail: undefined };
      const evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    }
    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
  }
})();