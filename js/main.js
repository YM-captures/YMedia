(() => {
  'use strict';

  const doc = document;
  const root = doc.documentElement;
  const body = doc.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const qs = (selector, scope = doc) => scope.querySelector(selector);
  const qsa = (selector, scope = doc) => [...scope.querySelectorAll(selector)];

  // Year
  const year = qs('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  // Preloader: fast, once per session, and never blocks reduced-motion users.
  const preloader = qs('.preloader');
  const counter = qs('.preloader__counter span');
  const track = qs('.preloader__track span');
  let preloaderDone = false;

  const closePreloader = () => {
    if (!preloader || preloaderDone) return;
    preloaderDone = true;
    preloader.classList.add('is-hidden');
    try { sessionStorage.setItem('ym-preloaded', '1'); } catch (_) { /* storage may be blocked */ }
    window.setTimeout(() => preloader.remove(), 850);
  };

  const alreadyLoaded = (() => {
    try { return sessionStorage.getItem('ym-preloaded') === '1'; } catch (_) { return false; }
  })();

  if (!preloader || reduceMotion || alreadyLoaded) {
    if (preloader) preloader.remove();
    preloaderDone = true;
  } else {
    const start = performance.now();
    const duration = 950;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * 100);
      if (counter) counter.textContent = String(value).padStart(2, '0');
      if (track) track.style.width = `${value}%`;
      if (progress < 1) requestAnimationFrame(tick);
      else window.setTimeout(closePreloader, 170);
    };
    requestAnimationFrame(tick);
    window.setTimeout(closePreloader, 1800); // hard safety cap
  }

  // Mobile menu
  const menuButton = qs('.menu-toggle');
  const mobileMenu = qs('.mobile-menu');
  let previousFocus = null;

  const setMenu = (open) => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
    mobileMenu.classList.toggle('is-open', open);
    body.classList.toggle('menu-open', open);
    if (open) {
      previousFocus = doc.activeElement;
      window.setTimeout(() => qs('a', mobileMenu)?.focus(), 250);
    } else if (previousFocus instanceof HTMLElement) {
      previousFocus.focus({ preventScroll: true });
    }
  };

  menuButton?.addEventListener('click', () => {
    setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
  });
  qsa('a', mobileMenu || doc).forEach((link) => link.addEventListener('click', () => setMenu(false)));
  doc.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') setMenu(false);
  });

  // Header behaviour and progress, kept lightweight and passive.
  const header = qs('[data-header]');
  const progressBar = qs('.page-progress span');
  let lastScroll = window.scrollY;
  let ticking = false;

  const updateScrollUI = () => {
    const current = window.scrollY;
    const max = Math.max(1, doc.documentElement.scrollHeight - window.innerHeight);
    if (progressBar) progressBar.style.width = `${Math.min(100, (current / max) * 100)}%`;
    if (header) {
      header.classList.toggle('is-scrolled', current > 40);
      const movingDown = current > lastScroll && current > 260;
      header.classList.toggle('is-hidden', movingDown && menuButton?.getAttribute('aria-expanded') !== 'true');
    }
    lastScroll = current;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScrollUI);
    }
  }, { passive: true });
  updateScrollUI();

  // Custom cursor: desktop only, fully removed for touch and reduced motion.
  const cursor = qs('.cursor');
  if (cursor && canHover && !reduceMotion) {
    const cursorText = qs('span', cursor);
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener('pointermove', (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
    }, { passive: true });

    const renderCursor = () => {
      currentX += (targetX - currentX) * 0.2;
      currentY += (targetY - currentY) * 0.2;
      cursor.style.transform = `translate3d(${currentX}px,${currentY}px,0) translate(-50%,-50%) scale(${cursor.classList.contains('is-active') ? 1 : .28})`;
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    qsa('[data-cursor]').forEach((element) => {
      element.addEventListener('pointerenter', () => {
        cursor.classList.add('is-active');
        if (cursorText) cursorText.textContent = element.dataset.cursor || 'Voir';
      });
      element.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));
    });
  } else if (cursor) {
    cursor.remove();
  }

  // Magnetic controls, pointer-safe.
  if (canHover && !reduceMotion) {
    qsa('.magnetic').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - (rect.left + rect.width / 2);
        const y = event.clientY - (rect.top + rect.height / 2);
        element.style.transform = `translate(${x * .12}px,${y * .12}px)`;
      });
      element.addEventListener('pointerleave', () => {
        element.style.transform = '';
      });
    });
  }

  // Newsletter interface only: no network request is made.
  const form = qs('.newsletter-form');
  const email = qs('#email');
  const message = qs('.newsletter-form__message');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!(email instanceof HTMLInputElement) || !message) return;
    message.classList.remove('is-error', 'is-success');
    if (!email.value.trim() || !email.validity.valid) {
      message.textContent = 'Saisissez une adresse e-mail valide.';
      message.classList.add('is-error');
      email.focus();
      return;
    }
    message.textContent = 'Merci — votre adresse est validée dans cette démonstration. Aucun envoi n’a été effectué.';
    message.classList.add('is-success');
    form.reset();
  });

  // Video placeholder: explains its status instead of opening a broken player.
  const playButton = qs('.play-button');
  const filmStatus = qs('.film__status');
  playButton?.addEventListener('click', () => {
    filmStatus?.classList.add('is-visible');
    window.setTimeout(() => filmStatus?.classList.remove('is-visible'), 2600);
  });

  // Lightweight reveal fallback (also used if GSAP CDN is unavailable).
  const revealTargets = qsa('.text-reveal, .section-heading, .story, .mini-story, .film__stage, .universes__header, .universe-card, .archives__header, .merch__header, .merch-shot, .newsletter__content');
  revealTargets.forEach((el) => el.setAttribute('data-reveal', ''));

  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  // Initialise motion system after deferred libraries have had a chance to load.
  window.addEventListener('load', () => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    const Lenis = window.Lenis;
    let lenis = null;

    if (reduceMotion || !gsap || !ScrollTrigger) {
      revealTargets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    if (Lenis) {
      lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1,
        syncTouch: false,
        anchors: false
      });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    // Smooth internal anchors while retaining native hash semantics.
    qsa('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const target = qs(targetId);
        if (!target) return;
        if (lenis) {
          event.preventDefault();
          lenis.scrollTo(target, { offset: -64, duration: 1.15 });
          history.replaceState(null, '', targetId);
        }
      });
    });

    // Hero entrance and depth.
    gsap.set('.hero__line > span', { yPercent: 115 });
    gsap.set('.hero__logo, .hero__meta, .hero__topline', { opacity: 0, y: 22 });
    const heroTimeline = gsap.timeline({ delay: preloaderDone ? .1 : 1.05 });
    heroTimeline
      .to('.hero__line > span', { yPercent: 0, duration: 1.15, stagger: .12, ease: 'power4.out' })
      .to('.hero__logo', { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }, '<.2')
      .to('.hero__meta, .hero__topline', { opacity: 1, y: 0, duration: .75, stagger: .06, ease: 'power3.out' }, '<.25');

    gsap.to('.hero__media img', {
      yPercent: 8,
      scale: 1.09,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero__content', {
      yPercent: 17,
      opacity: .22,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: '35% top', end: 'bottom top', scrub: true }
    });

    // Manifesto and story objects.
    gsap.from('.manifesto__facts > div', {
      y: 36,
      opacity: 0,
      duration: .75,
      stagger: .12,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.manifesto__facts', start: 'top 82%' }
    });
    qsa('.story__icon').forEach((icon) => {
      gsap.to(icon, {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: { trigger: icon.closest('.story'), start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    });
    qsa('.mini-story__visual img').forEach((icon, index) => {
      gsap.fromTo(icon, { rotation: index % 2 ? 8 : -8 }, {
        rotation: index % 2 ? -5 : 5,
        ease: 'none',
        scrollTrigger: { trigger: icon.closest('.mini-story'), start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    });

    // Film image drift.
    gsap.to('.film__stage > img', {
      yPercent: 7,
      ease: 'none',
      scrollTrigger: { trigger: '.film__stage', start: 'top bottom', end: 'bottom top', scrub: 1 }
    });

    // Universe cards cascade.
    gsap.from('.universe-card', {
      y: 60,
      opacity: 0,
      duration: .7,
      stagger: .08,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.universe-grid', start: 'top 82%' }
    });

    // Horizontal archive only on sufficiently wide pointer layouts.
    ScrollTrigger.matchMedia({
      '(min-width: 641px)': () => {
        const viewport = qs('.archives__viewport');
        const trackEl = qs('.archives__track');
        if (!viewport || !trackEl) return undefined;
        const distance = () => Math.max(0, trackEl.scrollWidth - window.innerWidth);
        const tween = gsap.to(trackEl, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: viewport,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1
          }
        });
        return () => tween.kill();
      }
    });

    // Merch image masks and subtle opposing parallax.
    qsa('.merch-shot img').forEach((image, index) => {
      gsap.fromTo(image, { clipPath: 'inset(9% 0 9% 0)', yPercent: index % 2 ? 4 : -3 }, {
        clipPath: 'inset(0% 0 0% 0)',
        yPercent: index % 2 ? -3 : 3,
        ease: 'none',
        scrollTrigger: { trigger: image.closest('.merch-shot'), start: 'top 92%', end: 'bottom 20%', scrub: .8 }
      });
    });

    // Popup grows into the viewport while its image breathes.
    gsap.fromTo('.popup__frame', { scale: .74, borderRadius: '1.4rem' }, {
      scale: 1.04,
      borderRadius: '0rem',
      ease: 'none',
      scrollTrigger: { trigger: '.popup', start: 'top bottom', end: 'bottom bottom', scrub: 1 }
    });
    gsap.fromTo('.popup__frame > img', { scale: 1.12 }, {
      scale: 1,
      ease: 'none',
      scrollTrigger: { trigger: '.popup', start: 'top bottom', end: 'bottom bottom', scrub: 1 }
    });

    // Newsletter icon follows the section instead of an endless decorative spin.
    gsap.to('.newsletter__icon img', {
      yPercent: -22,
      rotation: 4,
      ease: 'none',
      scrollTrigger: { trigger: '.newsletter', start: 'top bottom', end: 'bottom top', scrub: 1 }
    });

    // Refresh once all imagery and fonts have settled.
    const refresh = () => ScrollTrigger.refresh(true);
    const imagePromises = qsa('img').map((img) => img.complete ? Promise.resolve() : new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    }));
    Promise.all(imagePromises).then(refresh);
    if (doc.fonts?.ready) doc.fonts.ready.then(refresh);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(refresh, 180);
    }, { passive: true });
  }, { once: true });
})();
