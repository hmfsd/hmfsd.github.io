/* ============================================================
   main.js — Main application logic for HMF website
   Handles scroll animations, page initialization, data loading,
   and dynamic content rendering.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     Scroll animations — IntersectionObserver for .fade-in
     Adds .visible class when element enters viewport.
     ---------------------------------------------------------- */

  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.fade-in').forEach((el) => {
    fadeObserver.observe(el);
  });

  // Helper to observe dynamically added fade-in elements
  function observeNewFadeIns(container) {
    if (!container) return;
    container.querySelectorAll('.fade-in').forEach((el) => {
      fadeObserver.observe(el);
    });
  }

  /* ----------------------------------------------------------
     fetchJSON helper — Load and parse a JSON file
     ---------------------------------------------------------- */

  async function fetchJSON(path) {
    const response = await fetch(path);
    return response.json();
  }

  /* ----------------------------------------------------------
     isUpcoming — Determine if an event date is today or future
     ---------------------------------------------------------- */

  function isUpcoming(dateISO) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateISO + 'T23:59:59');
    return eventDate >= today;
  }

  /* ----------------------------------------------------------
     Bio expand/collapse — Event delegation
     Toggles .expanded on parent .card--bio when
     .card--bio__expand is clicked.
     ---------------------------------------------------------- */

  document.addEventListener('click', (e) => {
    const expandBtn = e.target.closest('.card--bio__expand');
    if (!expandBtn) return;

    const card = expandBtn.closest('.card--bio');
    if (!card) return;

    const expanded = card.classList.toggle('expanded');
    expandBtn.textContent = expanded ? 'Close \u2191' : 'Read full bio \u2193';
  });

  /* ----------------------------------------------------------
     HOME PAGE — Initialize if .hero exists
     ---------------------------------------------------------- */

  if (document.querySelector('.hero')) {
    initHomePage();
  }

  /* ----------------------------------------------------------
     EVENTS PAGE — Initialize if #events-page exists
     ---------------------------------------------------------- */

  if (document.getElementById('events-page')) {
    initEventsPage();
  }

  /* ----------------------------------------------------------
     RESIDENTS PAGE — Initialize if #residents-page exists
     ---------------------------------------------------------- */

  if (document.getElementById('residents-page')) {
    initResidentsPage();
  }

  /* ----------------------------------------------------------
     GUESTS PAGE — Initialize if #guests-page exists
     ---------------------------------------------------------- */

  if (document.getElementById('guests-page') || document.getElementById('guests-container')) {
    initGuestsPage();
  }

  /* ----------------------------------------------------------
     BLOG PAGE — Initialize if #blog-page exists
     ---------------------------------------------------------- */

  if (document.getElementById('blog-page')) {
    initBlogPage();
  }

  /* ----------------------------------------------------------
     PHOTOS PAGE — Initialize if #photos-page exists
     ---------------------------------------------------------- */

  if (document.getElementById('photos-page')) {
    initPhotosPage();
  }

  /* ============================================================
     PAGE INITIALIZERS
     ============================================================ */

  /* ----------------------------------------------------------
     Home Page
     - Load first upcoming event and display it
     - Load photos and init mini gallery with auto-cycle
     ---------------------------------------------------------- */

  async function initHomePage() {
    // Load and display featured + upcoming events
    try {
      const events = await fetchJSON('data/events.json');
      const allUpcoming = events.filter((ev) => isUpcoming(ev.dateISO));
      const featured = allUpcoming.filter((ev) => ev.featured);
      const upcoming = allUpcoming.slice(0, 3);

      const featuredSection = document.getElementById('featured-section');
      const featuredContainer = document.getElementById('featured-events');
      if (featured.length > 0 && featuredContainer && featuredSection) {
        featuredContainer.innerHTML = featured.map((ev) => renderEventCard(ev)).join('');
        featuredSection.style.display = '';
        observeNewFadeIns(featuredContainer);
      }

      const upcomingSection = document.getElementById('upcoming-events');
      if (upcoming.length > 0 && upcomingSection) {
        upcomingSection.innerHTML = upcoming.map((ev) => renderEventCard(ev)).join('');
        upcomingSection.style.display = '';
        observeNewFadeIns(upcomingSection);
      } else if (upcomingSection) {
        upcomingSection.style.display = 'none';
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    }

    // Load photos and init mini gallery
    try {
      const photos = await fetchJSON('data/photos.json');
      const galleryContainer = document.querySelector('.home-gallery');

      if (galleryContainer && photos.length > 0) {
        const gallery = new Gallery(galleryContainer, {
          autoInterval: 4000,
          aspectRatio: '16/9',
        });
        gallery.loadItems(photos);
        gallery.startAuto();
      }
    } catch (err) {
      console.error('Failed to load photos:', err);
    }
  }

  /* ----------------------------------------------------------
     Events Page
     - Split events into upcoming and past
     - Render upcoming as event cards
     - Render past events as flyer gallery (1:1 aspect)
     ---------------------------------------------------------- */

  async function initEventsPage() {
    try {
      const events = await fetchJSON('data/events.json');

      const allUpcoming = events.filter((ev) => isUpcoming(ev.dateISO));
      const featured = allUpcoming.filter((ev) => ev.featured);
      const upcoming = allUpcoming;
      const past = events.filter((ev) => !isUpcoming(ev.dateISO));

      // Render featured events
      const featuredSection = document.getElementById('featured-section');
      const featuredContainer = document.getElementById('featured-events');
      if (featured.length > 0 && featuredContainer && featuredSection) {
        featuredContainer.innerHTML = featured.map((ev) => renderEventCard(ev)).join('');
        featuredSection.style.display = '';
        observeNewFadeIns(featuredContainer);
      }

      // Render upcoming events
      const upcomingContainer = document.getElementById('upcoming-events');
      if (upcomingContainer) {
        if (upcoming.length === 0) {
          upcomingContainer.innerHTML = '<p class="text-center">Check back soon for our next event.</p>';
        } else {
          upcomingContainer.innerHTML = upcoming.map((ev) => renderEventCard(ev)).join('');
          observeNewFadeIns(upcomingContainer);
        }
      }

      // Render past events as flyer gallery
      const pastContainer = document.getElementById('past-events');
      if (pastContainer && past.length > 0) {
        const flyerItems = past
          .filter((ev) => ev.flyer)
          .map((ev) => ({
            src: ev.flyer,
            alt: `Flyer for ${ev.title} — ${ev.date}`,
          }));

        if (flyerItems.length > 0) {
          const gallery = new Gallery(pastContainer, {
            autoInterval: 4000,
            aspectRatio: '1/1',
          });
          gallery.loadItems(flyerItems);
          gallery.startAuto();
        }
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  }

  /* ----------------------------------------------------------
     Residents Page
     - Load residents data
     - Render the founder card and resident bio cards
     ---------------------------------------------------------- */

  async function initResidentsPage() {
    try {
      const residents = await fetchJSON('data/residents.json');
      const container = document.querySelector('#residents-page .grid-2');
      if (!container) return;

      container.innerHTML = residents.map((resident) => renderBioCard(resident)).join('');
      observeNewFadeIns(container);
    } catch (err) {
      console.error('Failed to load residents:', err);
    }
  }

  /* ----------------------------------------------------------
     Guests Page
     - Load guests data
     - Render guest cards in a 3-column grid
     ---------------------------------------------------------- */

  async function initGuestsPage() {
    try {
      const guests = await fetchJSON('data/guests.json');
      const container = document.querySelector('#guests-page .grid-3') || document.getElementById('guests-container');
      if (!container) return;

      container.innerHTML = guests.map((guest) => renderGuestCard(guest)).join('');
      observeNewFadeIns(container);
    } catch (err) {
      console.error('Failed to load guests:', err);
    }
  }

  /* ----------------------------------------------------------
     Photos Page
     - Load photos data
     - Initialize full gallery with auto-cycle
     - On mobile, thumbnail click opens Lightbox
     ---------------------------------------------------------- */

  async function initPhotosPage() {
    try {
      const photos = await fetchJSON('data/photos.json');
      const galleryContainer = document.querySelector('#photos-page .gallery');
      if (!galleryContainer || photos.length === 0) return;

      const gallery = new Gallery(galleryContainer, {
        autoInterval: 4000,
        aspectRatio: '16/9',
      });
      gallery.loadItems(photos);
      gallery.startAuto();
    } catch (err) {
      console.error('Failed to load photos:', err);
    }
  }

  /* ============================================================
     RENDER HELPERS — Build HTML strings for dynamic content
     ============================================================ */

  /* ----------------------------------------------------------
     renderEventCard — Upcoming event card with flyer and links
     ---------------------------------------------------------- */

  function renderEventCard(event) {
    const links = [];
    const fbIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right:6px;flex-shrink:0;"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;
    const raIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right:6px;flex-shrink:0;"><text x="2" y="17" font-size="14" font-weight="700" font-family="Arial,sans-serif">RA</text></svg>`;
    const ticketIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="margin-right:4px;flex-shrink:0;"><path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 0 1 0 4v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 1 0-4zM13 17.5h-2v-2h2v2zm0-4.5h-2v-2h2v2zm0-4.5h-2v-2h2v2z"/></svg>`;
    if (event.ra && event.featured) {
      links.push(`<a href="${event.ra}" class="btn btn--ra-primary" target="_blank" rel="noopener noreferrer"><span class="ra-top">${ticketIcon}${raIcon}Resident Advisor</span><span class="ra-subtitle">(Buy Tickets)</span></a>`);
    } else if (event.ra) {
      links.push(`<a href="${event.ra}" class="btn btn--outline" target="_blank" rel="noopener noreferrer">${raIcon}Resident Advisor</a>`);
    }
    if (event.facebook) {
      links.push(`<a href="${event.facebook}" class="btn btn--outline" target="_blank" rel="noopener noreferrer">${fbIcon}Facebook Event</a>`);
    }

    return `
      <div class="card card--event fade-in">
        ${event.flyer ? `<img class="card--event__flyer" src="${event.flyer}" alt="Flyer for ${event.title}" loading="lazy" />` : ''}
        <div class="card--event__info">
          <h3 class="card--event__title">${event.title}</h3>
          <p class="card--event__date">${event.date}</p>
          <p class="card--event__venue">${event.venue}</p>
          ${links.length > 0 ? `<div class="card--event__links">${links.join('')}</div>` : ''}
        </div>
      </div>
    `;
  }

  /* ----------------------------------------------------------
     renderBioCard — Resident bio card with expand/collapse
     ---------------------------------------------------------- */

  function renderBioCard(resident) {
    const discography = resident.discography
      ? `<ul class="card--bio__discography">
           ${resident.discography.map((item) => `<li>${item}</li>`).join('')}
         </ul>`
      : '';

    return `
      <div class="card card--bio fade-in">
        <img class="card--bio__photo" src="${resident.photo}" alt="${resident.name}" loading="lazy" />
        <div class="card--bio__content">
          <h3 class="card--bio__name">${resident.name}</h3>
          <p class="card--bio__role">${resident.role}</p>
          <p class="card--bio__short">${resident.shortBio}</p>
          <div class="card--bio__full">
            <p>${resident.fullBio}</p>
            ${discography}
          </div>
          <button class="card--bio__expand">Read full bio \u2193</button>
        </div>
      </div>
    `;
  }

  /* ----------------------------------------------------------
     renderGuestCard — Guest artist card
     ---------------------------------------------------------- */

  function renderGuestCard(guest) {
    return `
      <div class="card card--guest fade-in">
        ${guest.photo ? `<img class="card--guest__photo" src="${guest.photo}" alt="${guest.name}" loading="lazy" />` : `<div class="card--guest__photo" style="background:var(--bg-hover);display:flex;align-items:center;justify-content:center;color:var(--text-faint);font-size:24px;font-weight:700;">${guest.name.charAt(0)}</div>`}
        <div class="card--guest__content">
          <h3 class="card--guest__name">${guest.name}</h3>
          ${guest.credential ? guest.credential.split(' · ').map(c => `<p class="card--guest__credential">${c}</p>`).join('') : ''}
          <p class="card--guest__bio">${guest.bio}</p>
        </div>
      </div>
    `;
  }

  /* ----------------------------------------------------------
     initBlogPage — Load posts and render them
     ---------------------------------------------------------- */

  async function initBlogPage() {
    try {
      const posts = await fetchJSON('data/posts.json');
      const container = document.getElementById('blog-posts');
      if (!container) return;

      if (posts.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;">No posts yet. Check back soon!</p>';
        return;
      }

      // Sort newest first
      posts.sort((a, b) => b.dateISO.localeCompare(a.dateISO));
      container.innerHTML = posts.map((post) => renderBlogPost(post)).join('');
      observeNewFadeIns(container);
    } catch (err) {
      console.error('Failed to load blog posts:', err);
    }
  }

  /* ----------------------------------------------------------
     renderBlogPost — Blog post card with expand/collapse
     ---------------------------------------------------------- */

  function renderBlogPost(post) {
    const authorLine = post.author ? `<p class="card--blog__author">By ${post.author}</p>` : '';
    const bodyImage = post.image ? `<img class="card--blog__body-image" src="${post.image}" alt="${post.title}" />` : '';
    return `
      <div class="card card--blog fade-in">
        ${post.image ? `<img class="card--blog__image" src="${post.image}" alt="${post.title}" loading="lazy" />` : ''}
        <div class="card--blog__content">
          <h3 class="card--blog__title">${post.title}</h3>
          ${authorLine}
          <p class="card--blog__date">${post.date}</p>
          <p class="card--blog__excerpt">${post.excerpt}</p>
          <div class="card--blog__body" style="display:none;">
            ${bodyImage}
            <p>${post.body}</p>
          </div>
          <button class="card--blog__toggle" onclick="
            const card = this.closest('.card--blog');
            const body = this.previousElementSibling;
            const excerpt = this.previousElementSibling.previousElementSibling;
            const thumb = card.querySelector('.card--blog__image');
            if (body.style.display === 'none') {
              body.style.display = 'block';
              excerpt.style.display = 'none';
              if (thumb) thumb.style.display = 'none';
              card.classList.add('expanded');
              this.textContent = 'Close';
            } else {
              body.style.display = 'none';
              excerpt.style.display = 'block';
              if (thumb) thumb.style.display = '';
              card.classList.remove('expanded');
              this.textContent = 'Read more';
            }
          ">Read more</button>
        </div>
      </div>
    `;
  }

});
