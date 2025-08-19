(function () {
  /* =========================================================
     FILTERING: show/hide cards when checkboxes are toggled
     ========================================================= */
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

  /* =========================================================
     COLORIZER: dynamic pastel/vibrant pills based on text
     ========================================================= */
  function djb2(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
    return h >>> 0;
  }

  function setChipVars(el, type) {
    const key = (el.getAttribute('data-key') || el.textContent || '').trim().toLowerCase();
    const hash = djb2(key);
    const hue = hash % 360;

    if (type === 'cat') {
      // Categories = pastel
      const s = 28;
      const l = 95;
      const borderL = Math.max(80, l - 12);
      el.style.setProperty('--chip-h', hue);
      el.style.setProperty('--chip-s', s);
      el.style.setProperty('--chip-l', l);
      el.style.setProperty('--chip-border-l', borderL);
      el.style.setProperty('--chip-fg', '#28323f'); // dark text for pastels
    } else {
      // Tags = vibrant
      const s = 75;
      const l = 55;
      const borderL = Math.max(35, l - 15);
      el.style.setProperty('--chip-h', hue);
      el.style.setProperty('--chip-s', s);
      el.style.setProperty('--chip-l', l);
      el.style.setProperty('--chip-border-l', borderL);
      const isLight = l > 60;
      el.style.setProperty('--chip-fg', isLight ? '#111' : '#fff');
    }
  }

  function colorize() {
    // Left rail labels
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

    // Stream chips
    document.querySelectorAll('.taxonomy-item').forEach(el => {
      const type = el.getAttribute('data-filter') || 'cat';
      setChipVars(el, type);
    });
  }

  /* =========================================================
     INIT: run filters + colorizer on load
     ========================================================= */
  document.addEventListener('DOMContentLoaded', () => {
    applyFilters();
    colorize();
  });
})();
