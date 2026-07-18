/* ==========================================================================
   YM MEDIA — main.js
   Lenis smooth scroll + GSAP/ScrollTrigger orchestration.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- PRELOADER ---------- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    gsap.to(preloader, {
      opacity: 0, duration: .6, delay: .4, ease: 'power2.out',
      onComplete: () => { preloader.style.display = 'none'; playHeroIntro(); }
    });
  });
  // fallback in case load fires very fast / already loaded
  setTimeout(() => {
    if (preloader && preloader.style.display !== 'none') {
      gsap.to(preloader, { opacity:0, duration:.6, onComplete:()=>{ preloader.style.display='none'; playHeroIntro(); } });
    }
  }, 2500);

  /* ---------- LENIS SMOOTH SCROLL ---------- */
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // anchor links respect lenis
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        lenis.scrollTo(id, { offset: 0, duration: 1.4 });
        mobileMenu.classList.remove('is-open');
      }
    });
  });

  /* ---------- CURSOR ---------- */
  const cursor = document.getElementById('cursorDot');
  window.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: .5, ease: 'power3.out' });
  });
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
  });

  /* ---------- NAV: solid on scroll + burger ---------- */
  const nav = document.getElementById('siteNav');
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
      if (self.scroll() > 80) nav.classList.add('is-solid');
      else nav.classList.remove('is-solid');
    }
  });

  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  burger.addEventListener('click', () => mobileMenu.classList.toggle('is-open'));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('is-open')));

  /* ---------- HERO INTRO ---------- */
  function playHeroIntro(){
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.hero__media img', { scale: 1, duration: 2.2, ease: 'power2.out' }, 0)
      .to('.hero__eyebrow', { opacity: 1, y: 0, duration: .9 }, .3)
      .from('.hero__title .word', {
        yPercent: 120, opacity: 0, duration: 1, stagger: .04, ease: 'power4.out'
      }, .45)
      .to('.hero__tagline', { opacity: 1, y: 0, duration: .8 }, '-=.3')
      .from('.hero__scroll', { opacity: 0, duration: .8 }, '-=.4')
      .from('.hero__stamp', { opacity: 0, scale: .6, duration: 1 }, '-=1.2');
  }

  /* ---------- PARALLAX IMAGES ---------- */
  gsap.utils.toArray('.parallax-img').forEach(img => {
    gsap.fromTo(img, { yPercent: -8, scale: 1.2 }, {
      yPercent: 8, scale: 1.2, ease: 'none',
      scrollTrigger: { trigger: img.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ---------- MANIFESTO reveal ---------- */
  gsap.from('.manifesto__eyebrow', {
    opacity: 0, y: 20, duration: .8,
    scrollTrigger: { trigger: '.manifesto', start: 'top 75%' }
  });
  gsap.from('.manifesto__text', {
    opacity: 0, y: 40, duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.manifesto', start: 'top 70%' }
  });
  gsap.from('.manifesto__stats .stat', {
    opacity: 0, y: 30, duration: .8, stagger: .12,
    scrollTrigger: { trigger: '.manifesto__stats', start: 'top 85%' }
  });

  /* ---------- COUNTERS ---------- */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target, duration: 1.8, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.val); }
        });
      }
    });
  });

  /* ---------- FEATURE sections reveal ---------- */
  gsap.utils.toArray('.feature').forEach(sec => {
    const frame = sec.querySelector('.feature__frame');
    if (!frame) return;
    gsap.from(frame.children, {
      opacity: 0, y: 36, duration: .9, stagger: .08, ease: 'power3.out',
      scrollTrigger: { trigger: sec, start: 'top 65%' }
    });
  });

  /* ---------- CATEGORIES reveal ---------- */
  gsap.from('.categories__title', {
    opacity: 0, y: 30, duration: .9,
    scrollTrigger: { trigger: '.categories', start: 'top 75%' }
  });
  gsap.from('.cat-card', {
    opacity: 0, y: 50, duration: .8, stagger: .1, ease: 'power3.out',
    scrollTrigger: { trigger: '.categories__grid', start: 'top 85%' }
  });

  /* ---------- FILM section ---------- */
  gsap.from('.film__content > *', {
    opacity: 0, y: 30, duration: .9, stagger: .1,
    scrollTrigger: { trigger: '.film', start: 'top 60%' }
  });
  document.getElementById('filmPlay').addEventListener('click', () => {
    alert('La lecture du film serait lancée ici — démo statique.');
  });

  /* ---------- STAMP CARDS reveal ---------- */
  gsap.from('.archives__title, .archives__sub', {
    opacity: 0, y: 30, duration: .9, stagger: .1,
    scrollTrigger: { trigger: '.archives', start: 'top 75%' }
  });
  gsap.from('.stamp-card', {
    opacity: 0, y: 60, rotate: 0, duration: .9, stagger: .08, ease: 'power3.out',
    scrollTrigger: { trigger: '.stamps-grid', start: 'top 85%' }
  });
  gsap.from('.archives__more', {
    opacity: 0, y: 20, duration: .8,
    scrollTrigger: { trigger: '.archives__more', start: 'top 95%' }
  });

  /* ---------- QUOTE ---------- */
  gsap.from('.quote__stamp, .quote__text, .quote__author', {
    opacity: 0, y: 24, duration: .9, stagger: .12,
    scrollTrigger: { trigger: '.quote', start: 'top 70%' }
  });

  /* ---------- NEWSLETTER ---------- */
  gsap.from('.newsletter__inner > *', {
    opacity: 0, y: 26, duration: .8, stagger: .08,
    scrollTrigger: { trigger: '.newsletter', start: 'top 75%' }
  });

  const form = document.getElementById('newsletterForm');
  const note = document.getElementById('newsletterNote');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    note.textContent = 'Merci — ton premier reportage arrive dimanche.';
    form.reset();
  });

  /* ---------- FOOTER ---------- */
  gsap.from('.footer__logo', {
    opacity: 0, y: 30, duration: 1,
    scrollTrigger: { trigger: '.footer', start: 'top 85%' }
  });

  /* refresh ScrollTrigger once images load (heights change) */
  window.addEventListener('load', () => ScrollTrigger.refresh());
});
