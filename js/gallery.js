/* ============================================
   SAFFRON TABLE — gallery.js
   Handles: filter tabs, lightbox with keyboard nav
   ============================================ */

(function () {
  'use strict';

  /* ── Gallery Filter ── */
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const filter = this.dataset.filter;

      galleryItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = '';
          setTimeout(() => { item.style.opacity = '1'; }, 10);
        } else {
          item.style.opacity = '0';
          setTimeout(() => { item.style.display = 'none'; }, 280);
        }
      });
    });
  });

  /* ── Lightbox ── */
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightbox-content');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  if (!lightbox) return;

  let currentIndex = 0;
  let items = [];

  function buildItemList() {
    items = Array.from(document.querySelectorAll('.gallery-item:not([style*="display: none"])'));
  }

  function openLightbox(index) {
    buildItemList();
    currentIndex = index;
    showSlide(currentIndex);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (items[currentIndex]) {
      items[currentIndex].focus();
    }
  }

  function showSlide(index) {
    if (!items[index]) return;
    const item = items[index];
    const caption = item.dataset.caption || 'Gallery Image';
    const imgSrc = item.dataset.full || item.dataset.src || null;

    if (lightboxContent) {
      if (imgSrc) {
        lightboxContent.innerHTML = `<img class="lightbox-img" src="${escapeHtml(imgSrc)}" alt="${escapeHtml(caption)}" />`;
      } else {
        lightboxContent.innerHTML = `
          <div class="lightbox-placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>${escapeHtml(caption)}</span>
          </div>`;
      }
    }

    if (lightboxCaption) lightboxCaption.textContent = caption;

    // Update nav button states
    if (lightboxPrev) lightboxPrev.disabled = index === 0;
    if (lightboxNext) lightboxNext.disabled = index === items.length - 1;
  }

  function prev() {
    if (currentIndex > 0) {
      currentIndex--;
      showSlide(currentIndex);
    }
  }

  function next() {
    if (currentIndex < items.length - 1) {
      currentIndex++;
      showSlide(currentIndex);
    }
  }

  /* ── Sanitize helper ── */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ── Open on gallery item click/enter ── */
  galleryItems.forEach((item, i) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', item.dataset.caption || 'View image');

    item.addEventListener('click', () => {
      buildItemList();
      const visibleIndex = items.indexOf(item);
      if (visibleIndex !== -1) openLightbox(visibleIndex);
    });

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        buildItemList();
        const visibleIndex = items.indexOf(item);
        if (visibleIndex !== -1) openLightbox(visibleIndex);
      }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prev);
  if (lightboxNext) lightboxNext.addEventListener('click', next);

  /* ── Keyboard navigation ── */
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  /* ── Click outside to close ── */
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

})();
