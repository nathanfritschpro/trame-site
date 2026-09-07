/* ============ TRAME · Portfolio filtres par service ============ */

(() => {
  const grid = document.getElementById('portfolio-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.project-card'));
  const buttons = Array.from(document.querySelectorAll('.filter-btn'));
  const countEl = document.getElementById('filter-count');
  const emptyEl = document.getElementById('portfolio-empty');

  const applyFilter = (filter, updateURL = true) => {
    let visible = 0;
    cards.forEach(card => {
      const tags = (card.dataset.tags || '').split(/\s+/);
      const match = filter === 'all' || tags.includes(filter);
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    });

    buttons.forEach(b => b.classList.toggle('is-active', b.dataset.filter === filter));
    if (countEl) countEl.textContent = String(visible);

    if (emptyEl) {
      emptyEl.hidden = visible !== 0;
      grid.hidden = visible === 0;
    }

    if (updateURL) {
      const url = new URL(window.location.href);
      if (filter === 'all') url.searchParams.delete('filter');
      else url.searchParams.set('filter', filter);
      history.replaceState({}, '', url);
    }
  };

  buttons.forEach(btn => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
  });

  // Filtre initial depuis ?filter=xxx
  const initial = new URL(window.location.href).searchParams.get('filter') || 'all';
  const validFilters = ['all', 'sites', 'photo', 'video', 'applications'];
  applyFilter(validFilters.includes(initial) ? initial : 'all', false);
})();
