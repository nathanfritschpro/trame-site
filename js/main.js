/* ============ TRAME — JS principal v5 ============ */

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

  // ---- Engagements — stacking cards : scale + opacity des cards derrière
  const stackCards = document.querySelectorAll('.stack .stack-card');
  if (stackCards.length) {
    const spacing = 24;
    const baseTop = 100;
    const updateStack = () => {
      stackCards.forEach((card, i) => {
        // Combien de cards suivantes ont atteint leur position sticky ?
        let behind = 0;
        for (let j = i + 1; j < stackCards.length; j++) {
          const jRect = stackCards[j].getBoundingClientRect();
          const jTargetTop = baseTop + j * spacing;
          if (jRect.top <= jTargetTop + 8) behind++;
        }
        const scale = Math.max(0.88, 1 - behind * 0.04);
        card.style.setProperty('--scale', scale.toFixed(3));
      });
    };
    window.addEventListener('scroll', updateStack, { passive: true });
    window.addEventListener('resize', updateStack, { passive: true });
    updateStack();
  }

  // ---- Curseur custom (desktop uniquement, respecte reduced-motion)
  const supportsCursor =
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (supportsCursor) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);
    document.body.classList.add('has-cursor');

    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let cx = x, cy = y;
    let raf = 0;

    const tick = () => {
      cx += (x - cx) * 0.28;
      cy += (y - cy) * 0.28;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener('mousemove', (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!cursor.classList.contains('is-ready')) cursor.classList.add('is-ready');
    }, { passive: true });

    window.addEventListener('mouseleave', () => cursor.classList.remove('is-ready'));
    window.addEventListener('mouseenter', () => cursor.classList.add('is-ready'));

    // Hover state sur les éléments interactifs
    const hoverSelector = 'a, button, input[type="submit"], input[type="button"], [role="button"], .project-window, .service-card, .formule, .stack-card';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverSelector)) cursor.classList.add('is-hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverSelector)) cursor.classList.remove('is-hover');
    });
  }

  // ---- Année dynamique dans le footer
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
