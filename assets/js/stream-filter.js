(function () {
  function vals(sel) { return Array.from(document.querySelectorAll(sel + ':checked')).map(i => i.value); }
  function apply() {
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
    if (e.target.matches('.cat-filter, .tag-filter')) apply();
  });
  document.addEventListener('click', e => {
    if (e.target && e.target.id === 'clear-filters') {
      document.querySelectorAll('.cat-filter:checked, .tag-filter:checked').forEach(i => i.checked = false);
      apply();
    }
  });
  document.addEventListener('DOMContentLoaded', apply);
})();
