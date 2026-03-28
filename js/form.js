/* ============================================
   SAFFRON TABLE — form.js
   Contact form: validation + Formspree POST
   ============================================ */

(function () {
  'use strict';

  const form = document.getElementById('contact-form');
  if (!form) return;

  const statusEl = document.getElementById('form-status');
  const submitBtn = form.querySelector('[type="submit"]');
  const submitText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
  const submitSpinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;

  /* ── Sanitize: strip tags from user input ── */
  function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = String(str).trim();
    return div.textContent;
  }

  /* ── Validators ── */
  const validators = {
    name: (v) => v.trim().length >= 2 ? '' : 'Please enter your full name (at least 2 characters).',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
    phone: (v) => {
      if (!v.trim()) return ''; // optional
      return /^[+\d\s\-().]{7,20}$/.test(v.trim()) ? '' : 'Please enter a valid phone number.';
    },
    subject: (v) => v ? '' : 'Please select a subject.',
    message: (v) => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters.',
  };

  /* ── Field validation ── */
  function validateField(input) {
    const name = input.name;
    const validate = validators[name];
    if (!validate) return true;
    const error = validate(input.value);
    const group = input.closest('.form-group');
    const errorEl = group ? group.querySelector('.error-msg') : null;

    if (error) {
      group && group.classList.add('has-error');
      input.classList.add('error');
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) errorEl.textContent = error;
      return false;
    } else {
      group && group.classList.remove('has-error');
      input.classList.remove('error');
      input.setAttribute('aria-invalid', 'false');
      if (errorEl) errorEl.textContent = '';
      return true;
    }
  }

  /* ── Validate all fields ── */
  function validateForm() {
    const fields = form.querySelectorAll('input, textarea, select');
    let valid = true;
    fields.forEach(field => {
      if (!validateField(field)) valid = false;
    });
    return valid;
  }

  /* ── Inline validation on blur ── */
  form.querySelectorAll('input, textarea, select').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      // Clear error as soon as they start fixing it
      const group = input.closest('.form-group');
      if (group && group.classList.contains('has-error')) validateField(input);
    });
  });

  /* ── Show status message ── */
  function showStatus(type, message) {
    if (!statusEl) return;
    statusEl.className = 'form-status ' + type;
    const icon = type === 'success'
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/></svg>`;
    statusEl.innerHTML = icon + `<span>${message}</span>`;
    statusEl.style.display = 'flex';
    statusEl.setAttribute('role', 'alert');
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideStatus() {
    if (statusEl) {
      statusEl.style.display = 'none';
      statusEl.className = 'form-status';
    }
  }

  /* ── Loading state ── */
  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    if (submitText) submitText.textContent = loading ? 'Sending…' : 'Send Message';
    if (submitSpinner) submitSpinner.style.display = loading ? 'inline-block' : 'none';
  }

  /* ── Honey pot (spam prevention) ── */
  // Form should have a hidden field named "_gotcha" — Formspree ignores bots that fill it

  /* ── Submit handler ── */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideStatus();

    if (!validateForm()) {
      // Focus first error
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    setLoading(true);

    const formData = new FormData(form);

    // Sanitize all text fields before sending
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        formData.set(key, sanitize(value));
      }
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        showStatus('success', 'Thank you! Your message has been sent. We\'ll get back to you within 24 hours.');
        form.reset();
        // Remove any validation states after reset
        form.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
        form.querySelectorAll('.error').forEach(f => f.classList.remove('error'));
      } else {
        const data = await response.json().catch(() => ({}));
        if (data.errors) {
          showStatus('error', data.errors.map(err => err.message).join('. '));
        } else {
          showStatus('error', 'Something went wrong. Please try again or contact us directly.');
        }
      }
    } catch (err) {
      showStatus('error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  });

  /* ── Menu page tab switching ── */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const menuPanels = document.querySelectorAll('.menu-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      menuPanels.forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      const target = document.getElementById(this.dataset.tab);
      if (target) target.classList.add('active');
    });

    btn.addEventListener('keydown', function (e) {
      const tabs = Array.from(tabBtns);
      const idx = tabs.indexOf(this);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        tabs[(idx + 1) % tabs.length].click();
        tabs[(idx + 1) % tabs.length].focus();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        tabs[(idx - 1 + tabs.length) % tabs.length].click();
        tabs[(idx - 1 + tabs.length) % tabs.length].focus();
      }
    });
  });

  /* ── Menu page category filter ── */
  const catBtns = document.querySelectorAll('.cat-btn');
  catBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      catBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

})();
