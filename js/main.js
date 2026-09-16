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

  // ============================================================
  //  POLISH · animations et micro-interactions
  // ============================================================
  const reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fineMQ = window.matchMedia('(hover: hover) and (pointer: fine)');
  const isFine = () => fineMQ.matches && !reducedMotionMQ.matches;

  // ---- SPLIT · révélation mot-à-mot du H1 hero au chargement
  const splitTargets = document.querySelectorAll('h1.hero-h1--compact, h1.hero-h1--split, h1.hero-h1--stack, .page-hero h1');
  splitTargets.forEach(h1 => {
    if (h1.dataset.split === 'done') return;
    // Ne split que les nœuds text directs (garde les <span>, <br>, <strong>)
    const wrap = (node) => {
      Array.from(node.childNodes).forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          const words = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          words.forEach(w => {
            if (/^\s+$/.test(w)) {
              frag.appendChild(document.createTextNode(w));
            } else if (w.length) {
              const span = document.createElement('span');
              span.className = 'word-reveal';
              span.textContent = w;
              frag.appendChild(span);
            }
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === Node.ELEMENT_NODE && !child.classList.contains('word-reveal')) {
          wrap(child);
        }
      });
    };
    wrap(h1);
    h1.dataset.split = 'done';
    // Stagger via CSS var --i
    const words = h1.querySelectorAll('.word-reveal');
    words.forEach((w, i) => w.style.setProperty('--i', i));
    requestAnimationFrame(() => h1.classList.add('is-split'));
  });

  // ---- COUNTERS · nombres qui se comptent en entrant dans le viewport
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        counterIO.unobserve(el);
        const end = parseFloat(el.dataset.count);
        const dur = parseInt(el.dataset.countDuration || '1400', 10);
        const suffix = el.dataset.countSuffix || '';
        const decimals = parseInt(el.dataset.countDecimals || '0', 10);
        if (reducedMotionMQ.matches) {
          el.textContent = end.toFixed(decimals) + suffix;
          return;
        }
        const start = performance.now();
        const easeOut = t => 1 - Math.pow(1 - t, 3);
        const step = (now) => {
          const t = Math.min(1, (now - start) / dur);
          const v = end * easeOut(t);
          el.textContent = v.toFixed(decimals) + suffix;
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    counters.forEach(c => counterIO.observe(c));
  }

  // ---- MAGNETIC · boutons qui attirent doucement le curseur
  if (isFine()) {
    const magnets = document.querySelectorAll('.btn-primary, .float-cta, .btn.btn-ghost');
    magnets.forEach(el => {
      el.classList.add('is-magnetic');
      const strength = el.classList.contains('float-cta') ? 0.35 : 0.22;
      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.setProperty('--mx', `${dx * strength}px`);
        el.style.setProperty('--my', `${dy * strength}px`);
      };
      const reset = () => {
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
      };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', reset);
    });
  }

  // ---- TILT · cartes qui inclinent légèrement selon la position du curseur
  if (isFine()) {
    const tilts = document.querySelectorAll('.pricing-card, .formule, .project-window, .service-card, .team-member, .avantage, .expertise-card');
    tilts.forEach(card => {
      card.classList.add('is-tilt');
      const max = 6; // degrés
      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * max;
        const ry = (px - 0.5) * max;
        card.style.setProperty('--rx', `${rx}deg`);
        card.style.setProperty('--ry', `${ry}deg`);
        card.style.setProperty('--sx', `${(px * 100).toFixed(1)}%`);
        card.style.setProperty('--sy', `${(py * 100).toFixed(1)}%`);
      };
      const reset = () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', reset);
    });
  }

  // ---- PARALLAX · fond du hero qui bouge doucement au scroll
  const heroBg = document.querySelector('.hero-orb, .hero-parallax');
  if (heroBg && !reducedMotionMQ.matches) {
    const onScrollParallax = () => {
      const y = window.scrollY;
      if (y > 900) return;
      heroBg.style.transform = `translate3d(0, ${y * 0.25}px, 0)`;
    };
    window.addEventListener('scroll', onScrollParallax, { passive: true });
    onScrollParallax();
  }

  // ---- REVEAL variants · applique une classe unique .reveal-in quand tout devient visible
  //      (utilisé par les nouvelles variantes fade-left/right/scale/blur)
  const variantEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur');
  if (variantEls.length && 'IntersectionObserver' in window) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          vio.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    variantEls.forEach(el => vio.observe(el));
  }
})();
