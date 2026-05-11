/**
 * tools.js
 * 1. Countdown timer to the wedding date
 * 2. Cross-platform parallax (CSS fixed on desktop, JS transform on mobile/tablet)
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
   * 1. COUNTDOWN TIMER
   * ───────────────────────────────────────────────────────────── */
  var countDownDate = new Date('June 28, 2026 17:00:00').getTime();

  function pad(n, digits) {
    return String(n).padStart(digits || 2, '0');
  }

  function updateTimer() {
    var now      = Date.now();
    var distance = countDownDate - now;

    var elDays    = document.getElementById('days');
    var elHours   = document.getElementById('hours');
    var elMinutes = document.getElementById('minutes');
    var elSeconds = document.getElementById('seconds');

    // Guard: elements may not exist on every page
    if (!elDays) return;

    if (distance <= 0) {
      elDays.textContent    = '000';
      elHours.textContent   = '00';
      elMinutes.textContent = '00';
      elSeconds.textContent = '00';
      clearInterval(timerInterval);
      return;
    }

    elDays.textContent    = pad(Math.floor(distance / 86400000), 3);
    elHours.textContent   = pad(Math.floor((distance % 86400000) / 3600000));
    elMinutes.textContent = pad(Math.floor((distance % 3600000)  / 60000));
    elSeconds.textContent = pad(Math.floor((distance % 60000)    / 1000));
  }

  var timerInterval = setInterval(updateTimer, 1000);
  updateTimer(); // run immediately so there's no 1-second blank


  /* ─────────────────────────────────────────────────────────────
   * 2. PARALLAX ENGINE
   *
   * Strategy:
   *   - Desktop (>1024 px): CSS background-attachment:fixed handles it.
   *   - Mobile/tablet: We move a .parallax-bg child element with
   *     transform: translateY() on scroll.  This avoids the known
   *     iOS/Android bug where background-attachment:fixed either
   *     doesn't work or zooms the image unexpectedly.
   * ───────────────────────────────────────────────────────────── */

  var isMobileParallax = false;
  var parallaxSections = [];

  function isTouch() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    );
  }

  function detectMode() {
    // Use JS parallax for touch devices OR narrow screens
    isMobileParallax = isTouch() || window.innerWidth <= 1024;
  }

  function collectSections() {
    parallaxSections = Array.from(
      document.querySelectorAll(
        '.section-parallax-banner-one, ' +
        '.section-parallax-banner-two, ' +
        '.section-parallax-banner-outfit, ' +
        '.section-parallax-banner-three'
      )
    ).map(function (section) {
      // Find or create a .parallax-bg child
      var bg = section.querySelector('.parallax-bg');
      if (!bg) {
        bg = document.createElement('div');
        bg.className = 'parallax-bg';
        section.insertBefore(bg, section.firstChild);
      }
      return { section: section, bg: bg };
    });
  }

  /**
   * Parallax factor: how much the bg moves relative to scroll.
   * 0.25 = bg moves at 25% of scroll speed (creates the depth illusion).
   * The .parallax-bg is oversized with inset: -30% 0 so there is always
   * enough image to cover the section even after shifting.
   */
  var PARALLAX_FACTOR = 0.25;

  function updateParallax() {
    if (!isMobileParallax) return;

    var scrollY = window.pageYOffset;
    var vh = window.innerHeight;

    parallaxSections.forEach(function (item) {
      var rect       = item.section.getBoundingClientRect();
      var sectionTop = rect.top + scrollY;

      // Skip sections far outside the viewport (performance)
      if (rect.bottom < -vh || rect.top > vh * 2) return;

      // Distance the section's top has scrolled past the viewport top.
      // When the section is exactly at the top of the viewport, offset = 0.
      // As the user scrolls down, offset becomes positive → bg moves up
      // more slowly than the page = classic parallax depth effect.
      var offset = (scrollY - sectionTop) * PARALLAX_FACTOR;

      // The .parallax-bg has inset: -30% 0, giving 30% extra height on each
      // side. Clamp so we never exceed that budget (keeps image covering section).
      var budget = item.section.offsetHeight * 0.28;
      offset = Math.max(-budget, Math.min(budget, offset));

      item.bg.style.transform = 'translateY(' + offset + 'px)';
    });
  }

  // Throttle scroll handler with rAF
  var rafPending = false;
  function onScroll() {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(function () {
        updateParallax();
        rafPending = false;
      });
    }
  }

  function onResize() {
    detectMode();
    if (!isMobileParallax) {
      // Reset any inline transforms when switching back to desktop
      parallaxSections.forEach(function (item) {
        item.bg.style.transform = '';
      });
    }
  }

  function initParallax() {
    detectMode();
    collectSections();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    updateParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParallax);
  } else {
    initParallax();
  }

})();
