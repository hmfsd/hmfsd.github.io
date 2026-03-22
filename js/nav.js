/* ============================================================
   nav.js — Navigation behavior for HMF website
   Handles sticky nav transitions, hamburger menu, active page
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const nav = document.querySelector('.nav');
  if (!nav) return;

  const hamburger = nav.querySelector('.nav__hamburger');
  const navLinks = nav.querySelectorAll('.nav__link');
  const hero = document.querySelector('.hero');

  /* ----------------------------------------------------------
     Sticky nav transition
     On home page (hero exists): nav starts transparent, becomes
     solid after scrolling past 100px. On sub-pages: always solid.
     ---------------------------------------------------------- */

  const isHomePage = !!hero;

  if (isHomePage) {
    // Start transparent on home page
    nav.classList.add('nav--transparent');

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;

      if (scrollY > 100) {
        nav.classList.add('nav--solid');
        nav.classList.remove('nav--transparent');
      } else {
        nav.classList.remove('nav--solid');
        nav.classList.add('nav--transparent');
      }
    };

    // Run once on load in case page is already scrolled
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
  } else {
    // Sub-pages always have solid nav
    nav.classList.add('nav--solid');
    nav.classList.remove('nav--transparent');
  }

  /* ----------------------------------------------------------
     Hamburger toggle
     Click the hamburger button to open/close mobile menu.
     Clicking a nav link also closes the menu.
     ---------------------------------------------------------- */

  const mobileNav = document.querySelector('.nav__mobile');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('active');
      nav.classList.toggle('nav--open');
    });
  }

  // Close menu when a nav link is clicked (both desktop and mobile)
  const allNavLinks = document.querySelectorAll('.nav__link');
  allNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (mobileNav) mobileNav.classList.remove('active');
      nav.classList.remove('nav--open');
    });
  });

  /* ----------------------------------------------------------
     Active page highlighting
     Match current pathname against nav link hrefs and add
     .active class to the matching link.
     ---------------------------------------------------------- */

  const currentPath = window.location.pathname;

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Normalize paths for comparison
    const linkPath = href.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    const normalizedCurrent = currentPath.replace(/\/index\.html$/, '/').replace(/\.html$/, '');

    // Exact match or home page match
    if (linkPath === normalizedCurrent) {
      link.classList.add('active');
    } else if (linkPath === '/' && (normalizedCurrent === '' || normalizedCurrent === '/index')) {
      link.classList.add('active');
    }
  });

});
