(function () {
  function djb2(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
    return h >>> 0;
  }

  function setChipVars(el, type) {
    const key = (el.getAttribute('data-key') || el.textContent || '').trim().toLowerCase();
    if (!key) return;
    const hue = djb2(key) % 360;

    // categories = pastel, tags = vibrant
    let s, l, borderL, fg;
    if (type === 'cat') {
      s = 45; l = 82; borderL = Math.max(60, l - 12); fg = '#1a1a1a';
    } else {
      s = 75; l = 55; borderL = Math.max(35, l - 15); fg = l > 60 ? '#111' : '#fff';
    }

    // Push *ready-to-use* HSL strings (no % arithmetic left for CSS)
    el.style.setProperty('--chip-bg', `hsl(${hue} ${s}% ${l}%)`);
    el.style.setProperty('--chip-border', `hsl(${hue} ${s}% ${borderL}%)`);
    el.style.setProperty('--chip-fg', fg);
    el.setAttribute('data-colored', 'yes');
  }

  function colorizeAll() {
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

    document.querySelectorAll('.taxonomy-item').forEach(el => {
      const type = el.getAttribute('data-filter') || 'cat';
      setChipVars(el, type);
    });
  }

  // Filtering (unchanged)
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

  document.addEventListener('DOMContentLoaded', () => {
    applyFilters();
    colorizeAll();
  });
})();
