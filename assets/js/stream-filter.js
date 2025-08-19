(function () {
  /* =========================
     FILTERING (unchanged)
     ========================= */
  function vals(sel) {
    return Array.from(document.querySelectorAll(sel + ':checked')).map(i => i.value);
  }
  function applyFilters() {
    const cats = vals('.cat-filter');
    const tags = vals('.tag-filter');
    document.querySelectorAll('#stream .stream-card').forEach(card => {
      const cc = (card.getAttribute('data-cats') || '').split(/\s+/).filter(Boolean);
      const tt = (card.getAttribute('data-tags') || '').split(/\s+/).filter(Boolean);
      const catOK = !cats.length || cats.some(c => cc.includes(c));
      const tagOK = !tags.length || tags.some(t => tt.includes(t));
      card.style.display = (catOK && tagOK) ? '' : 'none';
    });
  }
  document.addEventListener('change', e => {
    if (e.target.matches('.cat-filter, .tag-filter')) applyFilters();
  });
  document.addEventListener('click', e => {
    if (e.target && e.target.id === 'clear-filters') {
      document.querySelectorAll('.cat-filter:checked, .tag-filter:checked').forEach(i => i.checked = false);
      applyFilters();
    }
  });

  /* =========================
     COLORIZER (unified)
     ========================= */
  function djb2(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
    return h >>> 0;
  }

  function setChipVars(el, type, keyRaw) {
    const key = (keyRaw || el.getAttribute('data-key') || el.textContent || "").trim().toLowerCase();
    if (!key) return;
    const hue = djb2(key) % 360;

    // Category = pastel; Tag = vibrant
    let s, l, borderL, fg;
    if (type === 'cat') {
      s = 28; l = 95; borderL = Math.max(80, l - 12); fg = '#28323f';
    } else {
      s = 75; l = 55; borderL = Math.max(35, l - 15); fg = l > 60 ? '#111' : '#fff';
    }

    el.style.setProperty('--chip-h', hue);
    el.style.setProperty('--chip-s', s);
    el.style.setProperty('--chip-l', l);
    el.style.setProperty('--chip-border-l', borderL);
    el.style.setProperty('--chip-fg', fg);
  }

  // Upgrade plain anchors rendered by Minimal Mistakes / jekyll-archives
  function upgradeLegacyTaxonomyAnchors() {
    const sel = [
      '.page__taxonomy a[rel="tag"]',
      '.taxonomy__tags a', '.taxonomy-tags a', '.tags a',
      '.taxonomy__categories a', '.taxonomy-categories a', '.categories a'
    ].join(', ');

    document.querySelectorAll(sel).forEach(a => {
      // Skip if already upgraded
      if (a.classList.contains('taxonomy-item')) return;

      const text = (a.textContent || '').trim();
      const href = (a.getAttribute('href') || '').toLowerCase();
      const type =
        (a.getAttribute('rel') || '').toLowerCase() === 'tag' || href.includes('/tags/') ? 'tag'
        : href.includes('/categories/') ? 'cat'
        : 'tag';

      a.classList.add('taxonomy-item');
      a.setAttribute('data-filter', type);
      a.setAttribute('data-key', text.toLowerCase().replace(/\s+/g, '-'));
    });
  }

  function colorizeAll() {
    // Left rail chips (labels)
    document.querySelectorAll('.filter-chip').forEach(el => {
      const type = el.getAttribute('data-filter') || 'cat';
      setChipVars(el, type);
      const input = el.querySelector('input[type="checkbox"]');
      if (input) {
        const sync = () => el.setAttribute('data-checked', input.checked ? 'true' : 'false');
        input.addEventListener('change', sync);
        sync();
      }
    });

    // Stream chips (our list items)
    document.querySelectorAll('.taxonomy-item').forEach(el => {
      const type = el.getAttribute('data-filter') || 'cat';
      setChipVars(el, type);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyFilters();
    upgradeLegacyTaxonomyAnchors();
    colorizeAll();
  });
})();
