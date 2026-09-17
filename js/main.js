/* ============ TRAME · JS principal v5 ============ */

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

  // ---- Mobile nav accordéons (Services + Portfolio)
  document.querySelectorAll('.mobile-nav-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // ---- Desktop nav dropdowns (accessibilité clavier + click sur touch)
  document.querySelectorAll('.nav-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      // Ferme les autres dropdowns d'abord
      document.querySelectorAll('.nav-toggle[aria-expanded="true"]').forEach(t => {
        if (t !== toggle) t.setAttribute('aria-expanded', 'false');
      });
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
  });
  // Ferme les dropdowns au click extérieur
  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-toggle[aria-expanded="true"]').forEach(t => t.setAttribute('aria-expanded', 'false'));
  });
  // Ferme au Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-toggle[aria-expanded="true"]').forEach(t => {
        t.setAttribute('aria-expanded', 'false');
        t.focus();
      });
    }
  });

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

  // ---- Engagements · deck-flip pinned scroll
  const deckSection = document.querySelector('.engagements-pin');
  const deckStage = deckSection && deckSection.querySelector('.deck-stage');
  const deckCards = deckStage ? deckStage.querySelectorAll('.deck-card') : [];
  const deckDots = deckSection ? deckSection.querySelectorAll('.deck-dot') : [];

  if (deckSection && deckCards.length) {
    const mobileMQ = window.matchMedia('(max-width: 900px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const applyLayout = (activeIdx) => {
      deckCards.forEach((card, i) => {
        const d = i - activeIdx;
        if (d < 0) {
          // Carte envolée : dégage franchement vers le haut-gauche avec rotation forte
          card.style.transform = 'translate(-140%, -70%) rotate(-24deg) scale(0.9)';
          card.style.opacity = '0';
          card.style.zIndex = '0';
        } else {
          // d = 0 : active, devant. d > 0 : cartes du deck derrière, fanées.
          const offX = d * 22;
          const offY = d * -14;
          const rot = d * 5;
          const scale = Math.max(0.86, 1 - d * 0.05);
          card.style.transform = `translate(${offX}px, ${offY}px) rotate(${rot}deg) scale(${scale})`;
          card.style.opacity = '1';
          card.style.zIndex = String(20 - d);
        }
      });
      deckDots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === activeIdx);
        dot.classList.toggle('is-past', i < activeIdx);
      });
      deckStage.dataset.active = String(activeIdx);
    };

    let currentActive = -1;
    const updateDeck = () => {
      // Sur mobile ou reduced-motion : tout à plat, pas de scroll-jack
      if (mobileMQ.matches || reducedMotion.matches) {
        deckCards.forEach(card => {
          card.style.transform = '';
          card.style.opacity = '';
          card.style.zIndex = '';
        });
        return;
      }
      const rect = deckSection.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return;
      const rawProgress = -rect.top / total;
      const progress = Math.max(0, Math.min(0.9999, rawProgress));
      // (deckCards.length + 1) zones : 4 cartes actives + 1 zone "deck vide" à la fin.
      // Ex : progress 0-20% = active 0, 20-40% = 1, ..., 80-100% = 4 (toutes parties).
      const active = Math.min(deckCards.length, Math.floor(progress * (deckCards.length + 1)));
      if (active !== currentActive) {
        currentActive = active;
        applyLayout(active);
      }
    };

    window.addEventListener('scroll', updateDeck, { passive: true });
    window.addEventListener('resize', updateDeck, { passive: true });
    mobileMQ.addEventListener('change', updateDeck);
    updateDeck();
    // Force layout initial même si on n'a pas scrollé
    if (!mobileMQ.matches && !reducedMotion.matches) applyLayout(0);
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
    const hoverSelector = 'a, button, input[type="submit"], input[type="button"], [role="button"], .project-window, .service-card, .formule, .deck-card';
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

  // ---- Theme toggle (clair / sombre) avec persistance localStorage
  const applyTheme = (t) => {
    if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'light' ? '#F7F8FB' : '#0F1520');
    try { localStorage.setItem('vera-theme', t); } catch(e) {}
  };
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      applyTheme(cur === 'light' ? 'dark' : 'light');
    });
  });
})();
