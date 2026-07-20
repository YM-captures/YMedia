/* ==========================================================================
   YM MEDIA — main.js
   Preloader, curseur, navigation, Lenis + GSAP ScrollTrigger, micro-interactions
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var hasGSAP = typeof gsap !== 'undefined';

  if (hasGSAP && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ------------------------------------------------------------------ */
  /* 1. PRELOADER                                                        */
  /* ------------------------------------------------------------------ */
  function initPreloader() {
    var preloader = document.getElementById('preloader');
    var bar = document.getElementById('preloaderBar');
    var count = document.getElementById('preloaderCount');
    if (!preloader) return Promise.resolve();

    return new Promise(function (resolve) {
      if (reduceMotion) {
        preloader.style.display = 'none';
        resolve();
        return;
      }

      var progress = 0;
      var target = 0;
      var imgs = document.querySelectorAll('img');
      var total = imgs.length || 1;
      var loaded = 0;

      function onAssetDone() {
        loaded++;
        target = Math.min(100, Math.round((loaded / total) * 100));
      }

      imgs.forEach(function (img) {
        if (img.complete) {
          onAssetDone();
        } else {
          img.addEventListener('load', onAssetDone, { once: true });
          img.addEventListener('error', onAssetDone, { once: true });
        }
      });

      // Minimum visible duration + progress tween safety net
      var startTime = Date.now();
      var raf;

      function tick() {
        progress += (target - progress) * 0.14;
        var elapsed = Date.now() - startTime;
        var displayed = Math.min(99, Math.round(progress));
        if (elapsed > 1800) displayed = 100; // safety cap

        bar.style.width = displayed + '%';
        count.textContent = displayed + '%';

        if (displayed >= 100 && elapsed > 500) {
          finish();
        } else {
          raf = requestAnimationFrame(tick);
        }
      }

      function finish() {
        cancelAnimationFrame(raf);
        bar.style.width = '100%';
        count.textContent = '100%';
        if (hasGSAP) {
          gsap.to(preloader, {
            yPercent: -100,
            duration: 0.85,
            ease: 'power4.inOut',
            delay: 0.15,
            onComplete: function () {
              preloader.style.display = 'none';
              document.body.classList.add('is-loaded');
              resolve();
            }
          });
        } else {
          preloader.style.transition = 'transform .6s ease';
          preloader.style.transform = 'translateY(-100%)';
          setTimeout(function () {
            preloader.style.display = 'none';
            resolve();
          }, 650);
        }
      }

      raf = requestAnimationFrame(tick);

      // absolute fallback: never block more than 3.2s
      setTimeout(finish, 3200);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 2. CUSTOM CURSOR                                                     */
  /* ------------------------------------------------------------------ */
  function initCursor() {
    if (isTouch || reduceMotion) return;
    var cursor = document.getElementById('cursor');
    var label = document.getElementById('cursorLabel');
    if (!cursor || !label) return;

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var cx = mx, cy = my;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
    });

    function loop() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      label.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)' + (label.classList.contains('is-active') ? ' scale(1)' : ' scale(0)');
      requestAnimationFrame(loop);
    }
    loop();

    var interactiveSelectors = 'a, button, .reportage__media, .film-card, .archive-track, .universe-card';
    document.querySelectorAll(interactiveSelectors).forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursor.style.width = '46px';
        cursor.style.height = '46px';
        var text = el.getAttribute('data-cursor-label');
        if (!text) {
          if (el.classList.contains('film-card')) text = 'Lire';
          else if (el.classList.contains('reportage__media')) text = 'Voir';
          else if (el.classList.contains('archive-track')) text = 'Drag';
          else text = '';
        }
        if (text) {
          label.textContent = text;
          label.classList.add('is-active');
        }
      });
      el.addEventListener('mouseleave', function () {
        cursor.style.width = '14px';
        cursor.style.height = '14px';
        label.classList.remove('is-active');
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 3. NAVIGATION (scroll behaviour + mobile menu)                      */
  /* ------------------------------------------------------------------ */
  function initNav() {
    var header = document.getElementById('siteHeader');
    var toggle = document.getElementById('navToggle');
    var mobileMenu = document.getElementById('mobileMenu');
    var lastY = window.scrollY;
    var ticking = false;

    function onScroll() {
      var y = window.scrollY;
      if (y > 40) header.classList.add('is-scrolled'); else header.classList.remove('is-scrolled');

      if (y > lastY && y > 200 && !mobileMenu.classList.contains('is-open')) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });

    if (toggle && mobileMenu) {
      toggle.addEventListener('click', function () {
        var isOpen = mobileMenu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.documentElement.classList.toggle('no-scroll', isOpen);
        toggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
        if (window.lenisInstance) {
          isOpen ? window.lenisInstance.stop() : window.lenisInstance.start();
        }
      });

      mobileMenu.querySelectorAll('.mobile-link').forEach(function (link) {
        link.addEventListener('click', function () {
          mobileMenu.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          document.documentElement.classList.remove('no-scroll');
          if (window.lenisInstance) window.lenisInstance.start();
        });
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
          mobileMenu.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          document.documentElement.classList.remove('no-scroll');
          if (window.lenisInstance) window.lenisInstance.start();
        }
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* 4. SMOOTH SCROLL — Lenis + GSAP ScrollTrigger sync                  */
  /* ------------------------------------------------------------------ */
  function initSmoothScroll() {
    if (reduceMotion || typeof Lenis === 'undefined') return null;

    var lenis = new Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2
    });

    window.lenisInstance = lenis;

    if (hasGSAP && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    return lenis;
  }

  /* Smooth anchor scrolling for in-page nav links */
  function initAnchorLinks(lenis) {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var hash = link.getAttribute('href');
        if (hash.length < 2) return;
        var target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: -70, duration: 1.3 });
        } else {
          target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 5. SCROLL REVEALS                                                    */
  /* ------------------------------------------------------------------ */
  function initReveals() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (reduceMotion || !hasGSAP) {
      items.forEach(function (el) { el.style.opacity = 1; });
      return;
    }

    items.forEach(function (el) {
      var type = el.getAttribute('data-reveal-type') || 'up';
      var delay = parseFloat(el.getAttribute('data-reveal-delay')) || 0;
      var fromVars = { opacity: 0 };

      if (type === 'up') fromVars.y = 50;
      if (type === 'scale') { fromVars.scale = 1.06; fromVars.opacity = 0; }
      if (type === 'fade') fromVars.y = 12;

      gsap.set(el, fromVars);

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: function () {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.1,
            delay: delay,
            ease: 'power3.out'
          });
        }
      });
    });
  }

  /* Hero entrance timeline */
  function initHeroTimeline() {
    if (reduceMotion || !hasGSAP) return;
    var lines = document.querySelectorAll('#heroTitle .line span');
    var heroImg = document.querySelector('#heroMedia img');

    gsap.set(lines, { yPercent: 110 });
    var tl = gsap.timeline({ delay: 0.3 });
    tl.to(heroImg, { scale: 1, duration: 1.6, ease: 'power2.out' }, 0)
      .to(lines, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.09 }, 0.15);
  }

  /* Hero parallax on scroll */
  function initHeroParallax() {
    if (reduceMotion || !hasGSAP || typeof ScrollTrigger === 'undefined') return;
    var heroImg = document.querySelector('#heroMedia img');
    var hero = document.querySelector('.hero');
    if (!heroImg || !hero) return;

    gsap.to(heroImg, {
      yPercent: 14,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  /* Parallax for feature/popup full-bleed images */
  function initMediaParallax() {
    if (reduceMotion || !hasGSAP || typeof ScrollTrigger === 'undefined') return;
    document.querySelectorAll('.feature-story__media img, .popup__media img').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('section'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 6. MANIFESTO — word-by-word colour reveal tied to scroll             */
  /* ------------------------------------------------------------------ */
  function initManifesto() {
    var textEl = document.getElementById('manifestoText');
    if (!textEl) return;

    // Wrap words (preserving existing inline accent spans)
    var walker = document.createTreeWalker(textEl, NodeFilter.SHOW_TEXT, null);
    var textNodes = [];
    var node;
    while ((node = walker.nextNode())) textNodes.push(node);

    textNodes.forEach(function (tn) {
      var words = tn.textContent.split(/(\s+)/);
      var frag = document.createDocumentFragment();
      words.forEach(function (w) {
        if (w.trim() === '') {
          frag.appendChild(document.createTextNode(w));
        } else {
          var span = document.createElement('span');
          span.className = 'word';
          span.textContent = w;
          frag.appendChild(span);
        }
      });
      tn.parentNode.replaceChild(frag, tn);
    });

    var words = textEl.querySelectorAll('.word');
    if (!words.length) return;

    if (reduceMotion || !hasGSAP || typeof ScrollTrigger === 'undefined') {
      words.forEach(function (w) { w.classList.add('is-active'); });
      return;
    }

    ScrollTrigger.create({
      trigger: textEl,
      start: 'top 75%',
      end: 'bottom 60%',
      scrub: 0.4,
      onUpdate: function (self) {
        var activeCount = Math.round(self.progress * words.length);
        words.forEach(function (w, i) {
          w.classList.toggle('is-active', i < activeCount);
        });
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* 7. STAT COUNTERS                                                     */
  /* ------------------------------------------------------------------ */
  function initCounters() {
    var stats = document.querySelectorAll('[data-count-to]');
    if (!stats.length) return;

    stats.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count-to'), 10) || 0;

      if (reduceMotion || !hasGSAP || typeof ScrollTrigger === 'undefined') {
        el.textContent = target;
        return;
      }

      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: function () {
          var obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.6,
            ease: 'power2.out',
            onUpdate: function () { el.textContent = Math.round(obj.val); }
          });
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 8. ARCHIVE HORIZONTAL DRAG SCROLL                                    */
  /* ------------------------------------------------------------------ */
  function initArchiveDrag() {
    var track = document.getElementById('archiveTrack');
    if (!track) return;

    var isDown = false, startX, scrollLeft;

    track.addEventListener('pointerdown', function (e) {
      isDown = true;
      track.setPointerCapture(e.pointerId);
      startX = e.clientX;
      scrollLeft = track.scrollLeft;
    });
    track.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      var dx = e.clientX - startX;
      track.scrollLeft = scrollLeft - dx;
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (evt) {
      track.addEventListener(evt, function () { isDown = false; });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 9. NEWSLETTER FORM (client-side only, no real submission)           */
  /* ------------------------------------------------------------------ */
  function initNewsletterForm() {
    var form = document.getElementById('newsletterForm');
    var success = document.getElementById('newsletterSuccess');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('newsletterEmail');
      if (!email.checkValidity()) {
        email.reportValidity();
        return;
      }
      success.classList.add('is-visible');
      form.reset();
      success.focus && success.focus();
    });
  }

  /* ------------------------------------------------------------------ */
  /* 10. MAGNETIC BUTTONS                                                 */
  /* ------------------------------------------------------------------ */
  function initMagnetic() {
    if (isTouch || reduceMotion || !hasGSAP) return;
    document.querySelectorAll('.btn, .film-card__play').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        gsap.to(el, { x: x * 0.28, y: y * 0.28, duration: 0.4, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* INIT                                                                 */
  /* ------------------------------------------------------------------ */
  document.documentElement.classList.add('js-ready');

  initPreloader().then(function () {
    var lenis = initSmoothScroll();
    initAnchorLinks(lenis);
    initHeroTimeline();
    initHeroParallax();
    initMediaParallax();
    initReveals();
    initManifesto();
    initCounters();
    initMagnetic();

    if (hasGSAP && typeof ScrollTrigger !== 'undefined') {
      // Refresh once fonts/images have fully settled
      window.addEventListener('load', function () {
        ScrollTrigger.refresh();
      });
      setTimeout(function () { ScrollTrigger.refresh(); }, 600);
    }
  });

  // These do not depend on the preloader promise
  initNav();
  initCursor();
  initArchiveDrag();
  initNewsletterForm();

  window.addEventListener('resize', function () {
    if (hasGSAP && typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });
})();
