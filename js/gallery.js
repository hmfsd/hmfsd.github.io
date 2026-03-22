/* ============================================================
   gallery.js — Gallery & Lightbox for HMF website
   Powers photo galleries, flyer galleries, and lightbox overlay.
   Supports keyboard, touch/swipe, auto-cycle, and mobile.
   ============================================================ */

/* ----------------------------------------------------------
   Gallery class
   ---------------------------------------------------------- */

class Gallery {
  /**
   * @param {HTMLElement} containerEl - Element containing .gallery__preview, .gallery__grid, .gallery__arrows
   * @param {Object} options
   * @param {number} options.autoInterval - Auto-cycle interval in ms (default 4000)
   * @param {string} options.aspectRatio - Aspect ratio for preview ('16/9' or '1/1')
   */
  constructor(containerEl, options = {}) {
    this.container = containerEl;
    this.options = {
      autoInterval: options.autoInterval || 4000,
      aspectRatio: options.aspectRatio || '16/9',
    };

    // DOM references
    this.preview = containerEl.querySelector('.gallery__preview');
    this.grid = containerEl.querySelector('.gallery__grid');
    this.arrows = containerEl.querySelector('.gallery__arrows');
    this.dotsContainer = containerEl.querySelector('.gallery__dots');

    // State
    this.items = [];
    this.currentIndex = 0;
    this.autoTimer = null;
    this.isUserControlled = false;

    // Bind keyboard handler for this gallery instance
    this._onKeydown = this._onKeydown.bind(this);
    this._isMobile = window.innerWidth < 768;

    // Listen for resize to update mobile status
    window.addEventListener('resize', () => {
      this._isMobile = window.innerWidth < 768;
    });

    // Set up keyboard navigation
    document.addEventListener('keydown', this._onKeydown);

    // Set up arrow buttons if present
    this._initArrows();
  }

  /* ----------------------------------------------------------
     loadItems — Populate gallery from an array of {src, alt}
     ---------------------------------------------------------- */

  loadItems(items) {
    this.items = items;
    this.currentIndex = 0;

    // Build the thumbnail grid
    this._renderGrid();

    // Build dots if container exists
    if (this.dotsContainer) {
      this._renderDots();
    }

    // Show the first item in the preview
    if (items.length > 0) {
      this._initPreview();
      this.showItem(0);
    }
  }

  /* ----------------------------------------------------------
     showItem — Display item at given index with crossfade
     ---------------------------------------------------------- */

  showItem(index) {
    if (index < 0 || index >= this.items.length) return;
    this.currentIndex = index;

    const item = this.items[index];

    // Update preview with crossfade
    if (this.preview) {
      const img = this.preview.querySelector('.gallery__preview-img');
      if (img) {
        // Fade out
        img.style.opacity = '0';

        // After transition, swap src and fade in
        setTimeout(() => {
          img.src = item.src;
          img.alt = item.alt;
          img.style.opacity = '1';
        }, 250);
      }
    }

    // Update active thumbnail
    this._updateActiveThumbnail(index);

    // Update dots
    this._updateActiveDot(index);
  }

  /* ----------------------------------------------------------
     next / prev — Navigate forward/backward with wrap-around
     ---------------------------------------------------------- */

  next() {
    const nextIndex = (this.currentIndex + 1) % this.items.length;
    this.showItem(nextIndex);
  }

  prev() {
    const prevIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.showItem(prevIndex);
  }

  /* ----------------------------------------------------------
     Auto-cycle controls
     ---------------------------------------------------------- */

  startAuto() {
    if (this.isUserControlled || this.items.length <= 1) return;
    this.stopAuto();
    this.autoTimer = setInterval(() => this.next(), this.options.autoInterval);
  }

  stopAuto() {
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
    this.isUserControlled = true;
  }

  /* ----------------------------------------------------------
     handleUserInteraction — Stop auto-cycle and show item
     ---------------------------------------------------------- */

  handleUserInteraction(index) {
    this.stopAuto();
    this.showItem(index);
  }

  /* ----------------------------------------------------------
     Private: Initialize preview area
     ---------------------------------------------------------- */

  _initPreview() {
    if (!this.preview) return;

    // Set aspect ratio via CSS custom property
    this.preview.style.aspectRatio = this.options.aspectRatio;
    if (this.options.aspectRatio === '1/1') {
      this.preview.classList.add('gallery__preview--square');
    }

    // Create the preview image if it doesn't exist
    let img = this.preview.querySelector('.gallery__preview-img');
    if (!img) {
      img = document.createElement('img');
      img.classList.add('gallery__preview-img');
      img.style.transition = 'opacity 0.25s ease';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      this.preview.appendChild(img);
    }
  }

  /* ----------------------------------------------------------
     Private: Render thumbnail grid
     ---------------------------------------------------------- */

  _renderGrid() {
    if (!this.grid) return;
    this.grid.innerHTML = '';

    this.items.forEach((item, index) => {
      const thumb = document.createElement('div');
      thumb.classList.add('gallery__thumb');

      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt;
      img.loading = 'lazy';

      thumb.appendChild(img);

      // Click handler
      thumb.addEventListener('click', () => {
        if (this._isMobile) {
          // On mobile, open lightbox instead of swapping preview
          const lightbox = new Lightbox();
          lightbox.open(this.items, index);
        } else {
          this.handleUserInteraction(index);
        }
      });

      this.grid.appendChild(thumb);
    });
  }

  /* ----------------------------------------------------------
     Private: Update active thumbnail highlight
     ---------------------------------------------------------- */

  _updateActiveThumbnail(index) {
    if (!this.grid) return;
    const thumbs = this.grid.querySelectorAll('.gallery__thumb');
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
  }

  /* ----------------------------------------------------------
     Private: Render dots (for mini gallery on home page)
     ---------------------------------------------------------- */

  _renderDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';

    this.items.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.classList.add('gallery__dot');
      dot.setAttribute('aria-label', `Show photo ${index + 1}`);

      dot.addEventListener('click', () => {
        this.handleUserInteraction(index);
      });

      this.dotsContainer.appendChild(dot);
    });
  }

  /* ----------------------------------------------------------
     Private: Update active dot
     ---------------------------------------------------------- */

  _updateActiveDot(index) {
    if (!this.dotsContainer) return;
    const dots = this.dotsContainer.querySelectorAll('.gallery__dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  /* ----------------------------------------------------------
     Private: Initialize arrow navigation
     ---------------------------------------------------------- */

  _initArrows() {
    if (!this.arrows) return;

    const prevBtn = this.arrows.querySelector('.gallery__arrow--prev');
    const nextBtn = this.arrows.querySelector('.gallery__arrow--next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.stopAuto();
        this.prev();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.stopAuto();
        this.next();
      });
    }
  }

  /* ----------------------------------------------------------
     Private: Keyboard navigation (only when gallery is visible)
     ---------------------------------------------------------- */

  _onKeydown(e) {
    // Only respond if the gallery is in the viewport
    if (!this._isInViewport()) return;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.stopAuto();
      this.prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.stopAuto();
      this.next();
    }
  }

  /* ----------------------------------------------------------
     Private: Check if gallery container is in viewport
     ---------------------------------------------------------- */

  _isInViewport() {
    const rect = this.container.getBoundingClientRect();
    return (
      rect.top < window.innerHeight &&
      rect.bottom > 0
    );
  }

  /* ----------------------------------------------------------
     Cleanup — Remove event listeners
     ---------------------------------------------------------- */

  destroy() {
    this.stopAuto();
    document.removeEventListener('keydown', this._onKeydown);
  }
}


/* ----------------------------------------------------------
   Lightbox class
   Full-screen overlay for viewing images at full size.
   Supports keyboard, touch/swipe, click-outside-to-close.
   ---------------------------------------------------------- */

class Lightbox {
  constructor() {
    this.overlay = null;
    this.items = [];
    this.currentIndex = 0;
    this.touchStartX = 0;

    // Bind handlers for cleanup
    this._onKeydown = this._onKeydown.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
  }

  /* ----------------------------------------------------------
     open — Create and show lightbox with given items
     ---------------------------------------------------------- */

  open(items, startIndex = 0) {
    this.items = items;
    this.currentIndex = startIndex;

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.classList.add('lightbox');

    // Build lightbox HTML
    this.overlay.innerHTML = `
      <button class="lightbox__close" aria-label="Close lightbox">&times;</button>
      <button class="lightbox__arrow lightbox__arrow--prev" aria-label="Previous image">&#8249;</button>
      <div class="lightbox__image-wrap">
        <img class="lightbox__img" src="" alt="" />
      </div>
      <button class="lightbox__arrow lightbox__arrow--next" aria-label="Next image">&#8250;</button>
    `;

    document.body.appendChild(this.overlay);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Show starting image
    this._updateImage();

    // Attach event listeners
    this._attachListeners();

    // Trigger open animation (allow DOM render first)
    requestAnimationFrame(() => {
      this.overlay.classList.add('active');
    });
  }

  /* ----------------------------------------------------------
     close — Hide and remove lightbox
     ---------------------------------------------------------- */

  close() {
    if (!this.overlay) return;

    // Remove event listeners
    this._detachListeners();

    // Restore body scroll
    document.body.style.overflow = '';

    // Remove from DOM
    this.overlay.remove();
    this.overlay = null;
  }

  /* ----------------------------------------------------------
     next / prev — Navigate within lightbox
     ---------------------------------------------------------- */

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this._updateImage();
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this._updateImage();
  }

  /* ----------------------------------------------------------
     Private: Update the displayed image
     ---------------------------------------------------------- */

  _updateImage() {
    if (!this.overlay) return;
    const img = this.overlay.querySelector('.lightbox__img');
    const item = this.items[this.currentIndex];
    if (img && item) {
      img.src = item.src;
      img.alt = item.alt;
    }
  }

  /* ----------------------------------------------------------
     Private: Attach all event listeners
     ---------------------------------------------------------- */

  _attachListeners() {
    // Close button
    const closeBtn = this.overlay.querySelector('.lightbox__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Arrow buttons
    const prevBtn = this.overlay.querySelector('.lightbox__arrow--prev');
    const nextBtn = this.overlay.querySelector('.lightbox__arrow--next');
    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());

    // Click outside image to close
    const imageWrap = this.overlay.querySelector('.lightbox__image-wrap');
    this.overlay.addEventListener('click', (e) => {
      // Close if click is directly on the overlay (not on buttons or image)
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', this._onKeydown);

    // Touch/swipe support
    this.overlay.addEventListener('touchstart', this._onTouchStart, { passive: true });
    this.overlay.addEventListener('touchend', this._onTouchEnd, { passive: true });
  }

  /* ----------------------------------------------------------
     Private: Detach all event listeners
     ---------------------------------------------------------- */

  _detachListeners() {
    document.removeEventListener('keydown', this._onKeydown);

    if (this.overlay) {
      this.overlay.removeEventListener('touchstart', this._onTouchStart);
      this.overlay.removeEventListener('touchend', this._onTouchEnd);
    }
  }

  /* ----------------------------------------------------------
     Private: Keyboard handler
     ---------------------------------------------------------- */

  _onKeydown(e) {
    if (e.key === 'Escape') {
      this.close();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.next();
    }
  }

  /* ----------------------------------------------------------
     Private: Touch handlers for swipe gestures
     Swipe left = next, swipe right = prev. Threshold: 50px.
     ---------------------------------------------------------- */

  _onTouchStart(e) {
    this.touchStartX = e.changedTouches[0].clientX;
  }

  _onTouchEnd(e) {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - this.touchStartX;

    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        // Swiped left → next
        this.next();
      } else {
        // Swiped right → prev
        this.prev();
      }
    }
  }
}


/* ----------------------------------------------------------
   Export globally
   ---------------------------------------------------------- */

window.Gallery = Gallery;
window.Lightbox = Lightbox;
