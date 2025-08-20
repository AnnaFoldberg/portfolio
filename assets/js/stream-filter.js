function setChipVars(el, type) {
  const key = (el.getAttribute('data-key') || el.textContent || '').trim().toLowerCase();
  if (!key) return;
  const djb2 = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i); return h >>> 0; };
  const hue = djb2(key) % 360;

  // categories = pastel, tags = vibrant
  let s, l, borderL, fg;
  if (type === 'cat') {
    s = 45; l = 82; borderL = Math.max(60, l - 12);
    fg = '#fff';               // <-- force categories to white text
  } else {
    s = 75; l = 55; borderL = Math.max(35, l - 15);
    fg = l > 60 ? '#111' : '#fff';
  }

  // ready-to-use CSS vars (no % concatenation in CSS)
  el.style.setProperty('--chip-bg', `hsl(${hue} ${s}% ${l}%)`);
  el.style.setProperty('--chip-border', `hsl(${hue} ${s}% ${borderL}%)`);
  el.style.setProperty('--chip-fg', fg);
  el.setAttribute('data-colored', 'yes');
}
