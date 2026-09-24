/* ============ Vera Studio · V8 (preloader, smart-hide, before/after slider, hero tiles auto) ============ */

(() => {
  // ---- GHOST TEXT · les mots geants bougent au scroll, direction alternee section apres section
  const ghosts = document.querySelectorAll('.works-ghost-text');
  if (ghosts.length) {
    const pairs = [];
    ghosts.forEach((el, i) => {
      const scope = el.closest('.works-head--v3') || el.closest('[data-ghost-scope]')
                 || el.closest('.method') || el.closest('.before-after') || el.closest('.offer')
                 || el.parentElement;
      // Direction : gauche->droite pour les rangs pairs, droite->gauche pour les impairs.
      // data-ghost-dir="rtl" ou "ltr" sur le .works-ghost-text peut forcer manuellement.
      const forced = el.dataset.ghostDir;
      const dir = forced === 'rtl' ? -1 : forced === 'ltr' ? 1 : (i % 2 === 0 ? 1 : -1);
      if (scope) pairs.push({ el, scope, dir });
    });
    let ticking = false;
    const updateGhosts = () => {
      const viewportH = window.innerHeight;
      pairs.forEach(({ el, scope, dir }) => {
        const rect = scope.getBoundingClientRect();
        // Skip hors viewport pour ne pas forcer un layout inutile
        if (rect.bottom < -80 || rect.top > viewportH + 80) return;
        const totalDistance = viewportH + rect.height;
        const traveled = viewportH - rect.top;
        const progress = Math.max(0, Math.min(1, traveled / totalDistance));
        const shiftPct = dir * (-30 + progress * 60);
        el.style.setProperty('--ghost-shift', `${shiftPct}%`);
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateGhosts);
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', updateGhosts, { passive: true });
    updateGhosts();
  }

  // ---- HERO TILES · charge les captures reelles si elles existent
  const heroShots = document.querySelectorAll('.ht-shot[data-project]');
  heroShots.forEach(shot => {
    const slug = shot.dataset.project;
    const src = `/assets/tiles/${slug}-ordi.jpg`;
    const probe = new Image();
    probe.onload = () => shot.classList.add('has-shot');
    probe.onerror = () => { /* fake reste visible */ };
    probe.src = src;
  });

  const reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ---- PRELOADER (2s la première fois par session)
  const preloader = document.getElementById('preloader');
  if (preloader) {
    // Le hero attend ce signal pour jouer son entree (voir main.js).
    // Deux frames d'attente pour laisser main.js finir sa mise en place : au
    // refresh, ce bloc s'execute dans la meme tache que lui.
    const introDone = () => requestAnimationFrame(() => requestAnimationFrame(
      () => document.dispatchEvent(new CustomEvent('vera:intro-done'))
    ));

    const seen = sessionStorage.getItem('vera-intro-seen');
    if (seen || reducedMotionMQ.matches) {
      preloader.classList.add('is-done');
      introDone();
      setTimeout(() => preloader.remove(), 100);
    } else {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        preloader.classList.add('is-done');
        document.body.style.overflow = '';
        try { sessionStorage.setItem('vera-intro-seen', '1'); } catch(e) {}
        // Le hero demarre pendant que le voile s'efface : les deux mouvements
        // se chevauchent au lieu de s'enchainer platement
        setTimeout(introDone, 180);
        setTimeout(() => preloader.remove(), 700);
      }, 1800);
    }
  }

  // ---- HEADER SMART-HIDE
  const header = document.getElementById('site-header');
  if (header) {
    let lastY = 0;
    let ticking = false;
    const SHOW_THRESHOLD = 4;   // remonter d'au moins 4px pour réafficher
    const HIDE_THRESHOLD = 60;  // ne pas cacher avant 60px scrolled
    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 20);
      if (y > HIDE_THRESHOLD && y > lastY + 2) {
        // Scroll vers le bas
        header.classList.add('is-hidden');
      } else if (y < lastY - SHOW_THRESHOLD || y < HIDE_THRESHOLD) {
        // Scroll vers le haut ou près du sommet
        header.classList.remove('is-hidden');
      }
      lastY = y;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
  }

  // ---- AVANT/APRÈS SLIDER
  const sliders = document.querySelectorAll('.ba-slider[data-slider]');
  sliders.forEach(slider => {
    const handle = slider.querySelector('.ba-handle');
    if (!handle) return;
    let dragging = false;

    const setPos = (px) => {
      const rect = slider.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, ((px - rect.left) / rect.width) * 100));
      slider.style.setProperty('--slider-pos', pct + '%');
      handle.setAttribute('aria-valuenow', Math.round(pct));
    };

    const onPointerDown = (e) => {
      dragging = true;
      slider.classList.add('is-dragging');
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPos(x);
      e.preventDefault();
    };
    const onPointerMove = (e) => {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPos(x);
    };
    const onPointerUp = () => {
      dragging = false;
      slider.classList.remove('is-dragging');
    };

    slider.addEventListener('mousedown', onPointerDown);
    slider.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    // Clavier
    handle.addEventListener('keydown', (e) => {
      const rect = slider.getBoundingClientRect();
      const cur = parseFloat(slider.style.getPropertyValue('--slider-pos') || '50');
      let next = cur;
      if (e.key === 'ArrowLeft')  next = Math.max(0, cur - 5);
      if (e.key === 'ArrowRight') next = Math.min(100, cur + 5);
      if (e.key === 'Home')       next = 0;
      if (e.key === 'End')        next = 100;
      if (next !== cur) {
        slider.style.setProperty('--slider-pos', next + '%');
        handle.setAttribute('aria-valuenow', Math.round(next));
        e.preventDefault();
      }
    });
  });
})();

/* ============ V8.20 · METHODE · la ligne se dessine au rythme du scroll ============ */
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const timeline = document.querySelector('.method--v3 .method-timeline');
  if (!timeline) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const rect = timeline.getBoundingClientRect();
    if (rect.bottom < -120 || rect.top > window.innerHeight + 120) return;
    const readLine = window.innerHeight * 0.8;
    const p = (readLine - rect.top) / Math.max(rect.height, 1);
    timeline.style.setProperty('--mt-p', Math.min(1, Math.max(0, p)).toFixed(4));
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

/* ============================================================
   V8.37 · Method tabs (Sites / Apps / SEO)
   ============================================================ */
(function methodTabs(){
  const tabs = document.querySelectorAll('.method-tab[data-mtab]');
  const timelines = document.querySelectorAll('.method-timeline[data-mtimeline]');
  if (!tabs.length || !timelines.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.mtab;
      tabs.forEach(t => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      timelines.forEach(tl => {
        const match = tl.dataset.mtimeline === target;
        tl.classList.toggle('is-active', match);
        if (match) {
          tl.removeAttribute('hidden');
        } else {
          tl.setAttribute('hidden', '');
        }
      });
    });
  });
})();

/* ============================================================
   V8.47 · Mobile : centrer Sites (featured) au chargement du carousel
   ============================================================ */
(function offerCarousel(){
  const trio = document.querySelector('.offer-trio');
  if (!trio) return;
  const featured = trio.querySelector('.offer-card--featured');
  if (!featured) return;
  const centerIt = () => {
    if (window.innerWidth > 720) {
      trio.scrollLeft = 0;
      return;
    }
    // Attendre layout, puis positionner featured au centre
    const trioRect = trio.getBoundingClientRect();
    const cardRect = featured.getBoundingClientRect();
    const currentLeft = trio.scrollLeft;
    const target = currentLeft + cardRect.left - trioRect.left - (trioRect.width - cardRect.width) / 2;
    trio.scrollTo({ left: target, behavior: 'instant' in trio.scrollTo ? 'instant' : 'auto' });
  };
  requestAnimationFrame(centerIt);
  window.addEventListener('resize', centerIt);
})();

/* ============================================================
   V8.47 · Work-cards cliquables (utile mobile surtout)
   Delegue le clic vers le lien .work-domain de la meme carte.
   ============================================================ */
(function workCardsClickable(){
  document.querySelectorAll('.work-card').forEach(card => {
    const link = card.querySelector('.work-domain');
    if (!link) return;
    card.addEventListener('click', (e) => {
      // Si un lien direct a ete clique, laisser faire
      if (e.target.closest('a')) return;
      const href = link.getAttribute('href');
      if (href) window.location.href = href;
    });
  });
})();
