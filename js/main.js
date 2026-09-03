/* ============ TRAME — JS principal ============ */

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
    // Réveler immédiatement ce qui est déjà dans le viewport (au-dessus du fold)
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
      if (revealIfInView(el)) return;   // au-dessus du fold : révélé de suite
      io.observe(el);                    // sinon : observer au scroll
    });
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // ---- Curseur custom (desktop uniquement)
  const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;
  if (!isTouch) {
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(ring);

    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    let visible = false;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) { ring.classList.add('visible'); visible = true; }
    });
    document.addEventListener('mouseleave', () => { ring.classList.remove('visible'); visible = false; });
    document.addEventListener('mouseenter', () => { ring.classList.add('visible'); visible = true; });

    const raf = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    // Hover states — agrandir sur les liens/boutons
    document.querySelectorAll('a, button, .project-row').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover-target'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover-target'));
    });
  }

  // ---- Année dynamique dans le footer
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
