/* ============ TRAME — JS principal v4 ============ */

(() => {
  // ---- Header : ajouter .scrolled après un peu de scroll
  const header = document.querySelector('.header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Burger menu mobile
  const burger = document.querySelector('.burger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }

  // ---- Reveal on scroll (IntersectionObserver)
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const revealIfInView = (el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
        el.classList.add('is-visible');
        return true;
      }
      return false;
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0 });

    revealEls.forEach(el => {
      if (revealIfInView(el)) return;
      io.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // ---- Engagements — scroll-pinned stacking cards
  const stackOuter = document.querySelector('.engagements-stack-outer');
  const slides = document.querySelectorAll('.engagement-slide');
  const progressDots = document.querySelectorAll('.engagements-progress span');

  if (stackOuter && slides.length) {
    const updateStack = () => {
      const rect = stackOuter.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return;
      const raw = -rect.top / total;
      const progress = Math.max(0, Math.min(0.999, raw));
      const activeIndex = Math.floor(progress * slides.length);

      slides.forEach((slide, i) => {
        slide.classList.remove('is-active', 'is-exit');
        if (i === activeIndex) slide.classList.add('is-active');
        else if (i < activeIndex) slide.classList.add('is-exit');
      });
      progressDots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === activeIndex);
      });
    };
    window.addEventListener('scroll', updateStack, { passive: true });
    window.addEventListener('resize', updateStack, { passive: true });
    updateStack();
  }

  // ---- Année dynamique dans le footer
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
