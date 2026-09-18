/* ============ Vera Studio · V8 (preloader, smart-hide, before/after slider, hero tiles auto) ============ */

(() => {
  // ---- GHOST TEXT · "realisations" bouge horizontalement selon le scroll
  const ghost = document.getElementById('works-ghost');
  if (ghost) {
    const section = ghost.closest('.works-head--v3');
    if (section) {
      let ticking = false;
      const updateGhost = () => {
        const rect = section.getBoundingClientRect();
        const viewportH = window.innerHeight;
        // progress : 0 quand la section entre dans le viewport, 1 quand elle en sort par le haut
        const totalDistance = viewportH + rect.height;
        const traveled = viewportH - rect.top;
        const progress = Math.max(0, Math.min(1, traveled / totalDistance));
        // Deplace de -30% (a droite) a +30% (encore plus a gauche) selon le scroll
        const shiftPct = -30 + progress * 60;
        ghost.style.setProperty('--ghost-shift', `${shiftPct}%`);
        ticking = false;
      };
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(updateGhost);
          ticking = true;
        }
      }, { passive: true });
      updateGhost();
    }
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
    // La "ligne de lecture" : le trait suit l'oeil, un peu sous le milieu
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
