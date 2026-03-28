/* ============================================
   SAFFRON TABLE — navigation.js
   Handles: sticky navbar, hamburger menu,
   mobile overlay, active links, scroll effects
   ============================================ */

(function () {
  'use strict';

  /* ── DOM References ── */
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const mobileLinks = mobileOverlay ? mobileOverlay.querySelectorAll('a') : [];
  const body = document.body;

  /* ── Sticky Navbar on Scroll ── */
  function handleScroll() {
    if (!navbar) return;
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run on load

  /* ── Hamburger Toggle ── */
  function openMenu() {
    hamburger.classList.add('open');
    mobileOverlay.classList.add('open');
    mobileOverlay.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    body.style.overflow = 'hidden';
    // Focus first link for keyboard nav
    if (mobileLinks[0]) {
      setTimeout(() => mobileLinks[0].focus(), 350);
    }
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileOverlay.classList.remove('open');
    mobileOverlay.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
    hamburger.focus();
  }

  function toggleMenu() {
    const isOpen = hamburger.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleMenu);
  }

  /* ── Close menu on link click ── */
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* ── Keyboard: Escape closes menu ── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileOverlay && mobileOverlay.classList.contains('open')) {
      closeMenu();
    }
  });

  /* ── Keyboard: Tab trap in mobile menu ── */
  if (mobileOverlay) {
    mobileOverlay.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(mobileOverlay.querySelectorAll('a, button'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ── Active Link Highlight ── */
  function setActiveLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-overlay a');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  setActiveLink();

  /* ── Scroll Reveal Animation ── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── Counter Animation (for stats) ── */
  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1600;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * ease) + (el.dataset.suffix || '');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('[data-target]').forEach(el => {
    counterObserver.observe(el);
  });

  /* ── Lazy Load Images ── */
  const lazyImages = document.querySelectorAll('img.img-lazy[data-src]');
  if ('IntersectionObserver' in window) {
    const lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.addEventListener('load', () => img.classList.add('loaded'));
          lazyObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    lazyImages.forEach(img => lazyObserver.observe(img));
  } else {
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.classList.add('loaded');
    });
  }

})();
