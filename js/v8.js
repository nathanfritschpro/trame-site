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

/* ============================================================
   V8.65 · Banniere cookies RGPD (informative, dans le theme)
   ============================================================ */
/* ============ V8.75 · Consentement cookies + Microsoft Clarity ============ */
/* Clarity (statistiques de visite, cartes de chaleur, enregistrements de
   session) n'est charge QUE si le visiteur clique sur "Accepter".
   Choix memorise : 13 mois si accepte, 6 mois si refuse (recommandations CNIL).
   Pour activer : renseigner l'identifiant du projet Clarity ci-dessous. */
(function consent(){
  const CLARITY_ID = 'yv6l0locea';
  const KEY = 'vs-consent';
  const KEEP = { accepted: 395, refused: 182 }; // jours

  const read = () => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!v || !KEEP[v.choice]) return null;
      if (Date.now() - v.at > KEEP[v.choice] * 864e5) return null;
      return v.choice;
    } catch (e) { return null; }
  };
  const save = (choice) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ choice, at: Date.now() }));
      localStorage.removeItem('vs-cookies-dismissed');
    } catch (e) {}
  };

  let clarityLoaded = false;
  const loadClarity = () => {
    if (clarityLoaded || !CLARITY_ID) return;
    clarityLoaded = true;
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
    window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
  };
  const stopClarity = () => {
    if (window.clarity) { try { window.clarity('consent', false); } catch (e) {} }
    // Efface les cookies Clarity deja deposes
    ['_clck', '_clsk', 'CLID', 'ANONCHK', 'MR', 'MUID', 'SM'].forEach((n) => {
      const host = location.hostname.replace(/^www\./, '');
      [host, '.' + host, ''].forEach((d) => {
        document.cookie = n + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
      });
    });
  };

  let banner = null;
  const close = () => {
    if (!banner) return;
    const b = banner;
    banner = null;
    b.classList.remove('is-visible');
    b.classList.add('is-dismissed');
    setTimeout(() => b.remove(), 380);
  };
  const open = () => {
    if (banner) return;
    banner = document.createElement('div');
    banner.className = 'cookies-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Choix des cookies');
    banner.innerHTML = `
      <div class="cb-inner">
        <div class="cb-body">
          <span class="cb-eyebrow">◆ Cookies</span>
          <p><strong>Nous aimerions mesurer l'audience du site</strong> (pages vues, temps passé, parcours de navigation) avec Microsoft Clarity, pour l'améliorer. Aucun cookie publicitaire. Ces cookies ne sont déposés qu'avec votre accord.</p>
        </div>
        <div class="cb-actions">
          <a href="/politique-de-confidentialite.html#cookies" class="cb-link">En savoir plus</a>
          <button type="button" class="cb-refuse">Refuser</button>
          <button type="button" class="cb-accept">
            <span>Accepter</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
          </button>
        </div>
      </div>`;
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner && banner.classList.add('is-visible'));
    banner.querySelector('.cb-accept').addEventListener('click', () => {
      save('accepted'); loadClarity(); close();
    });
    banner.querySelector('.cb-refuse').addEventListener('click', () => {
      save('refused'); stopClarity(); close();
    });
  };

  // Lien "Gerer les cookies" en bas de chaque page (retirer son accord aussi
  // facilement qu'on l'a donne)
  document.querySelectorAll('.footer-bottom > span:last-child').forEach((span) => {
    span.insertAdjacentHTML('beforeend', ' · <a href="#" class="cb-manage">Gérer les cookies</a>');
  });
  document.addEventListener('click', (e) => {
    const t = e.target.closest('.cb-manage');
    if (!t) return;
    e.preventDefault();
    open();
  });

  const choice = read();
  if (choice === 'accepted') loadClarity();
  else if (!choice) open();
})();

/* ============ V8.72 · Motion design : heros qui se dissout, 3D, magnetisme ============ */
/* Le heros, la barre de lecture et la profondeur des mots geants sont animes
   par le navigateur lui-meme (animations liees au scroll, sur la carte
   graphique) : aucun calcul JavaScript pendant le defilement, donc fluide
   meme sur telephone. Un repli JS allege existe pour les navigateurs anciens. */
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const desktop = window.matchMedia('(min-width: 901px)');
  const scrollDriven = window.CSS && CSS.supports('animation-timeline: scroll()');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const docTop = (el) => {
    let y = 0;
    for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
    return y;
  };

  // ---- Barre de progression de lecture
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  // ---- Heros : on mesure une fois, le navigateur anime ensuite
  const hero = document.querySelector('.hero-v8');
  const heroIndex = hero && hero.querySelector('.hero-index');
  const layers = [];
  if (hero && heroIndex) {
    [
      ['.hero-tiles', 0.55, true],
      ['.hero-v8-eyebrow', 0.5],
      ['.hero-v8-title', 0.45],
      ['.hero-v8-sub', 0.38],
      ['.hero-v8-ctas', 0.3],
    ].forEach(([sel, k, isTiles]) => {
      const el = hero.querySelector(sel);
      if (el) layers.push({ el, k, isTiles: !!isTiles, end: 1 });
    });
    if (scrollDriven) hero.classList.add('hero-sd');
  }

  const measureHero = () => {
    if (!layers.length) return;
    const indexTop = docTop(heroIndex);
    const cap = Math.max(120, indexTop - 170);
    layers.forEach((l) => {
      const bottom = docTop(l.el) + l.el.offsetHeight;
      const gap = Math.max(40, indexTop - bottom);
      l.end = Math.round(Math.min(cap, Math.max(110, (gap - 12) / l.k)));
      l.el.style.setProperty('--hd-e', `${l.end}px`);
      l.el.style.setProperty('--hd-y', `${Math.round(l.k * l.end)}px`);
    });
  };

  // Repli (navigateurs sans animations liees au scroll) : transform + opacite seulement
  const fallbackHero = (s) => {
    layers.forEach((l) => {
      const st = l.el.style;
      if (s <= 0) { st.translate = st.scale = st.opacity = st.visibility = st.rotate = ''; return; }
      const p = clamp(s / l.end, 0, 1);
      const fade = clamp((p - 0.15) / 0.85, 0, 1);
      st.translate = `0 ${(l.k * Math.min(s, l.end)).toFixed(1)}px`;
      st.scale = (1 - p * (l.isTiles ? 0.14 : 0.06)).toFixed(4);
      if (l.isTiles) st.rotate = `x ${(p * 22).toFixed(2)}deg`;
      if (hero.classList.contains('hero-settled')) st.opacity = (1 - fade).toFixed(3);
      st.visibility = p >= 1 ? 'hidden' : '';
    });
  };

  // ---- Vignettes du heros : inclinaison 3D qui suit le curseur (desktop)
  const tilesBox = hero && hero.querySelector('.hero-tiles');
  const tiles = hero ? [...hero.querySelectorAll('.hero-tile')] : [];
  const tileDepth = [16, -12, 20, -14];
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  if (hero) {
    hero.addEventListener('pointermove', (e) => {
      if (!finePointer.matches) return;
      const r = hero.getBoundingClientRect();
      ptr.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ptr.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      kick();
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { ptr.tx = 0; ptr.ty = 0; kick(); });
  }
  const renderPointer = () => {
    if (!tilesBox) return;
    if (hero.classList.contains('hero-settled')) {
      tilesBox.style.transform = (Math.abs(ptr.x) + Math.abs(ptr.y) < 0.001)
        ? '' : `rotateX(${(-ptr.y * 5).toFixed(2)}deg) rotateY(${(ptr.x * 7).toFixed(2)}deg)`;
    }
    tiles.forEach((t, i) => {
      const d = tileDepth[i % tileDepth.length];
      t.style.translate = `${(ptr.x * d).toFixed(1)}px ${(ptr.y * d * 0.6).toFixed(1)}px`;
    });
  };

  // ---- Lignes de services : la lumiere suit le curseur
  hero && hero.querySelectorAll('.hero-index-row').forEach((row) => {
    row.addEventListener('pointermove', (e) => {
      const r = row.getBoundingClientRect();
      row.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    }, { passive: true });
  });

  // ---- Bandeau croise : accelere et se plie avec la vitesse (souris uniquement,
  // sur telephone on laisse le defilement natif tranquille)
  const band = document.querySelector('.promises-band');
  let bandVisible = false;
  let bandAnims = [];
  if (band && finePointer.matches && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      bandVisible = e.isIntersecting;
      if (bandVisible && band.getAnimations) {
        bandAnims = [...band.querySelectorAll('.promises-track-2')].flatMap((t) => t.getAnimations());
      }
    }, { rootMargin: '100px 0px' }).observe(band);
  }
  let vel = 0;
  let skew = 0;
  const renderBand = () => {
    if (!bandVisible) return;
    skew += (clamp(vel * 0.06, -2.2, 2.2) - skew) * 0.12;
    band.style.setProperty('--skew', `${skew.toFixed(3)}deg`);
    const rate = 1 + Math.min(Math.abs(vel) * 0.12, 5);
    bandAnims.forEach((a) => { a.playbackRate = rate; });
  };

  // ---- Boucle : ne tourne que si quelque chose bouge (et jamais pour le heros
  // quand le navigateur l'anime lui-meme)
  let lastY = window.scrollY;
  let raf = 0;
  let idle = 0;
  const frame = () => {
    raf = 0;
    const s = window.scrollY;
    vel += ((s - lastY) - vel) * 0.25;
    lastY = s;

    if (!scrollDriven) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--sp', max > 0 ? (s / max).toFixed(4) : '0');
      fallbackHero(s);
    }
    ptr.x += (ptr.tx - ptr.x) * 0.1;
    ptr.y += (ptr.ty - ptr.y) * 0.1;
    renderPointer();
    renderBand();

    const moving = Math.abs(vel) > 0.05 || Math.abs(skew) > 0.01
      || Math.abs(ptr.tx - ptr.x) > 0.001 || Math.abs(ptr.ty - ptr.y) > 0.001;
    idle = moving ? 0 : idle + 1;
    if (idle < 4) raf = requestAnimationFrame(frame);
  };
  function kick() { if (!raf) { idle = 0; raf = requestAnimationFrame(frame); } }

  const needsScrollLoop = !scrollDriven || (band && finePointer.matches);
  if (needsScrollLoop) window.addEventListener('scroll', kick, { passive: true });
  let rz = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => { measureHero(); kick(); }, 150);
  });
  window.addEventListener('load', () => { measureHero(); kick(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measureHero(); kick(); });
  if (hero) new MutationObserver(kick).observe(hero, { attributes: true, attributeFilter: ['class'] });
  measureHero();
  kick();

  // ---- Inclinaison 3D qui suit le curseur (desktop uniquement)
  const tilt = (card, target, maxX, maxY, glare) => {
    let tr = 0;
    card.addEventListener('pointermove', (e) => {
      if (!finePointer.matches || !desktop.matches) return;
      const r = target.getBoundingClientRect();
      const px = clamp((e.clientX - r.left) / r.width, 0, 1);
      const py = clamp((e.clientY - r.top) / r.height, 0, 1);
      if (tr) cancelAnimationFrame(tr);
      tr = requestAnimationFrame(() => {
        target.classList.add('is-tilting');
        target.style.setProperty('--ry', `${((px - 0.5) * 2 * maxY).toFixed(2)}deg`);
        target.style.setProperty('--rx', `${((0.5 - py) * 2 * maxX).toFixed(2)}deg`);
        if (glare) {
          target.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
          target.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
        }
      });
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      if (tr) cancelAnimationFrame(tr);
      target.classList.remove('is-tilting');
    });
  };
  document.querySelectorAll('.work-card').forEach((card) => {
    const m = card.querySelector('.work-mockup');
    if (m) tilt(card, m, 5, 7, false);
  });
  document.querySelectorAll('.offer-card').forEach((c) => tilt(c, c, 4, 5, true));

  // ---- Boutons magnetiques
  document.querySelectorAll('.btn-primary, .btn-ghost.btn-lg, .nav-insta, .fs-btn').forEach((btn) => {
    let tx = 0, ty = 0, x = 0, y = 0, loop = 0;
    const step = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      btn.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
      if (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) loop = requestAnimationFrame(step);
      else {
        loop = 0;
        if (tx === 0 && ty === 0) btn.style.translate = '';
      }
    };
    const go = () => { if (!loop) loop = requestAnimationFrame(step); };
    btn.addEventListener('pointermove', (e) => {
      if (!finePointer.matches) return;
      const r = btn.getBoundingClientRect();
      tx = clamp((e.clientX - (r.left + r.width / 2)) * 0.28, -10, 10);
      ty = clamp((e.clientY - (r.top + r.height / 2)) * 0.35, -7, 7);
      go();
    }, { passive: true });
    btn.addEventListener('pointerleave', () => { tx = 0; ty = 0; go(); });
  });
})();

/* ============ V8.77 · Videos : lecture a l'ecran, son, visionneuse ============ */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const safePlay = (v) => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };

  // Videos des pages (carte NFC, motion design) : lecture quand visibles
  const pageVids = [...document.querySelectorAll('video[data-inview]:not(.reel-video)')];
  if (reduce) pageVids.forEach((v) => { v.controls = true; });
  else if (pageVids.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => (isIntersecting ? safePlay(target) : target.pause()));
    }, { threshold: 0.35 });
    pageVids.forEach((v) => io.observe(v));
  }

  // Bande qui defile : seules les vignettes a l'ecran tournent (verifie 3x/s)
  const band = document.querySelector('.reels-band');
  if (band && !reduce) {
    const reels = [...band.querySelectorAll('.reel-video')];
    let timer = 0;
    const tick = () => {
      const vw = window.innerWidth;
      reels.forEach((v) => {
        const r = v.getBoundingClientRect();
        const on = r.right > -80 && r.left < vw + 80;
        if (on && v.paused) safePlay(v);
        else if (!on && !v.paused) v.pause();
      });
    };
    const start = () => { if (!timer) { tick(); timer = setInterval(tick, 330); } };
    const stop = () => { clearInterval(timer); timer = 0; reels.forEach((v) => v.pause()); };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: '150px 0px' }).observe(band);
    } else start();
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  }

  // Bouton son : un seul son a la fois
  const setSound = (btn, on) => {
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Couper le son' : 'Activer le son');
  };
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.vs-sound');
    if (!btn) return;
    e.preventDefault();
    const v = btn.parentElement.querySelector('video');
    if (!v) return;
    const turnOn = v.muted;
    document.querySelectorAll('.vs-sound').forEach((b) => {
      const o = b.parentElement.querySelector('video');
      if (o && o !== v) { o.muted = true; setSound(b, false); }
    });
    v.muted = !turnOn;
    if (turnOn) safePlay(v);
    setSound(btn, turnOn);
  });

  // Visionneuse : un clic sur une vignette ouvre la video en grand, avec le son
  const reelBtns = document.querySelectorAll('.reel[data-full]');
  if (reelBtns.length && typeof HTMLDialogElement === 'function') {
    const dlg = document.createElement('dialog');
    dlg.className = 'reel-lightbox';
    dlg.setAttribute('aria-label', 'Lecture de la vidéo');
    dlg.innerHTML = '<button type="button" class="rl-close" aria-label="Fermer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button><video controls playsinline></video>';
    document.body.appendChild(dlg);
    const lv = dlg.querySelector('video');
    const close = () => { lv.pause(); lv.removeAttribute('src'); lv.load(); if (dlg.open) dlg.close(); };
    dlg.querySelector('.rl-close').addEventListener('click', close);
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    reelBtns.forEach((b) => b.addEventListener('click', () => {
      lv.src = b.dataset.full;
      lv.poster = b.dataset.poster || '';
      lv.muted = false;
      dlg.showModal();
      safePlay(lv);
    }));
  }
})();
