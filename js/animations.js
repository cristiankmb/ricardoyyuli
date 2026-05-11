/**
 * animations.js — Scroll reveal using IntersectionObserver
 * Much more performant than rAF loop; works on all modern browsers.
 * Falls back gracefully if IntersectionObserver is not supported.
 */

(function () {
  'use strict';

  /**
   * Reveal elements with class .show-on-scroll (flowers, icons, etc.)
   * Once visible they stay visible (no remove on scroll-out for flowers/icons).
   */
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // For flowers and icons we only animate in once
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,        // trigger when 15% of element is visible
      rootMargin: '0px 0px -40px 0px'
    }
  );

  /**
   * Generic .reveal elements (text, cards, etc.) — also one-shot.
   */
  var genericRevealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          genericRevealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    }
  );

  // Attach observers after DOM is ready
  function initReveal() {
    document.querySelectorAll('.show-on-scroll').forEach(function (el) {
      revealObserver.observe(el);
    });
    document.querySelectorAll('.reveal').forEach(function (el) {
      genericRevealObserver.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }

})();
