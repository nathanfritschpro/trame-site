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

  // ---- Decoupage des titres en mots (doit tourner AVANT le reveal)
  // Chaque mot devient <span class="rw"><i>mot</i></span> : le span porte le
  // masque (overflow), le <i> porte le mouvement. Les <br> et les <span>
  // interieurs sont conserves tels quels.
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const splitWords = (root, step) => {
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          if (!child.nodeValue.trim()) return;
          const frag = document.createDocumentFragment();
          // On capture les separateurs pour garder les espaces d'origine
          child.nodeValue.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
              return;
            }
            const mask = document.createElement('span');
            mask.className = 'rw';
            const inner = document.createElement('i');
            inner.textContent = part;
            // Decalage plafonne : un titre long ne doit pas trainer
            inner.style.setProperty('--rw-d', Math.min(i * step, 0.66).toFixed(3) + 's');
            i++;
            mask.appendChild(inner);
            frag.appendChild(mask);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    };
    walk(root);
    if (i > 0) root.classList.add('has-words', 'words-ready');
    return i;
  };

  if (motionOK) {
    document.querySelectorAll('h2.reveal').forEach((h) => {
      if (h.closest('[data-nosplit], .preloader')) return;
      // Structures complexes : le reveal classique fait deja le travail
      if (h.querySelector('br, img, svg, a, button')) return;
      if (h.textContent.trim().split(/\s+/).length > 18) return;
      splitWords(h, 0.055);
    });
  }

  // ---- Intro du hero : elle se joue au chargement, pas au scroll
  // Sans ca les elements du hero sont deja dans le viewport, donc reveles
  // instantanement par l'observer : on ne verrait jamais l'animation.
  // Le hero, c'est le bloc d'arrivee qui porte le h1 de la page
  const heroRoot = [...document.querySelectorAll(
    '.hero-v8, .page-hero, .portfolio-hero, .contact-side'
  )].find((el) => el.querySelector('h1'));
  const heroSkip = new Set();

  if (heroRoot && motionOK) {
    heroRoot.classList.add('hero-intro');

    const heroEls = [...heroRoot.querySelectorAll('.reveal')];
    const heroTitle = heroRoot.querySelector('h1');

    // Le titre joue mot a mot ; le reste glisse, en cascade
    let rank = 0;
    heroEls.forEach((el) => {
      heroSkip.add(el);
      el.classList.remove('reveal', 'reveal-delay-1', 'reveal-delay-2',
                          'reveal-delay-3', 'reveal-delay-4');
      if (el === heroTitle) {
        splitWords(el, 0.06);
      } else {
        el.classList.add('hi-item');
        rank++;
        el.style.setProperty('--hi-d', (0.22 + rank * 0.11).toFixed(2) + 's');
      }
    });

    // Un h1 sans .reveal doit quand meme jouer, sinon il reste fige pendant
    // que tout le reste du hero s'anime autour de lui
    if (heroTitle && !heroEls.includes(heroTitle)) splitWords(heroTitle, 0.06);

    // Les vignettes sont au-dessus du titre : elles entrent en premier, sinon
    // le regard descend puis doit remonter
    const tiles = heroRoot.querySelector('.hero-tiles');
    if (tiles) {
      tiles.classList.add('hi-item', 'hi-item--tiles');
      tiles.style.setProperty('--hi-d', '0.04s');
    }

    let started = false;
    const startHero = () => {
      if (started) return;
      started = true;
      heroRoot.classList.add('hero-in');
    };

    if (document.getElementById('preloader')) {
      // Le preloader previent quand son voile se leve. Filet de securite au
      // cas ou ce script ne repondrait pas : le hero ne doit jamais rester
      // invisible.
      document.addEventListener('vera:intro-done', startHero);
      setTimeout(startHero, 3000);
    } else {
      requestAnimationFrame(() => requestAnimationFrame(startHero));
    }
  }

  // ---- Reveal on scroll (IntersectionObserver + filet de securite au scroll)
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    // Les elements pas encore reveles. Un scroll tres rapide peut faire sauter
    // une notification de l'observer : on garde une verification manuelle en
    // secours, sinon un titre reste invisible pour de bon.
    const pending = new Set();

    const show = (el) => {
      el.classList.add('is-visible');
      pending.delete(el);
      io.unobserve(el);
    };

    const revealIfInView = (el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
        show(el);
        return true;
      }
      return false;
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) show(entry.target);
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0 });

    let sweeping = false;
    const sweep = () => {
      sweeping = false;
      pending.forEach(revealIfInView);
      if (!pending.size) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    };
    const onScroll = () => {
      if (sweeping) return;
      sweeping = true;
      requestAnimationFrame(sweep);
    };

    revealEls.forEach(el => {
      if (heroSkip.has(el)) return;
      pending.add(el);
      io.observe(el);
      revealIfInView(el);
    });

    if (pending.size) {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
    }
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
  //      Défaut = light, dark = opt-in via data-theme="dark"
  const applyTheme = (t) => {
    if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0F1520' : '#F7F5EE');
    try { localStorage.setItem('vera-theme', t); } catch(e) {}
  };
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      applyTheme(cur === 'dark' ? 'light' : 'dark');
    });
  });
})();
