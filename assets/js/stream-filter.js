// stream-filter.js

// ------------ helpers ------------
function djb2(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
  return h >>> 0;
}

// slugify to match Jekyll's slugify (enough for our keys)
function slugify(s) {
  return (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")    // strip accents
    .replace(/[^a-z0-9]+/g, "-")        // non-alnum -> dash
    .replace(/^-+|-+$/g, "");           // trim dashes
}

// color variables for a chip
function setChipVars(el, type) {
  const key = (el.getAttribute("data-key") || el.textContent || "").trim().toLowerCase();
  if (!key) return;
  const hue = djb2(key) % 360;

  let s, l, borderL, fg;
  if (type === "cat") {
    s = 45; l = 82; borderL = Math.max(60, l - 12);
    fg = "#fff"; // categories: white text
  } else {
    s = 75; l = 55; borderL = Math.max(35, l - 15);
    fg = l > 60 ? "#111" : "#fff";
  }

  el.style.setProperty("--chip-bg", `hsl(${hue} ${s}% ${l}%)`);
  el.style.setProperty("--chip-border", `hsl(${hue} ${s}% ${borderL}%)`);
  el.style.setProperty("--chip-fg", fg);
  el.dataset.colored = "yes";
}

// get checked keys (slug) for a taxonomy type
function getChecked(type) {
  return Array.from(document.querySelectorAll(`.filter-chip[data-filter="${type}"] input:checked`))
    .map(cb => cb.closest(".filter-chip"))
    .filter(Boolean)
    .map(lbl => lbl.dataset.key)        // already slugified in HTML
    .filter(Boolean);
}

// apply filters to stream cards
function applyFilters() {
  const catsSel = getChecked("cat");
  const tagsSel = getChecked("tag");

  document.querySelectorAll("#stream .stream-card").forEach(card => {
    const cats = (card.dataset.cats || "").split(/\s+/).filter(Boolean).map(slugify);
    const tags = (card.dataset.tags || "").split(/\s+/).filter(Boolean).map(slugify);

    const catOK = catsSel.length === 0 || catsSel.some(k => cats.includes(k));
    const tagOK = tagsSel.length === 0 || tagsSel.some(k => tags.includes(k));

    card.style.display = (catOK && tagOK) ? "" : "none";
  });
}

// keep label state attribute in sync (for CSS states if you add any)
function wireCheckedState() {
  document.querySelectorAll(".filter-chip input[type='checkbox']").forEach(input => {
    const label = input.closest(".filter-chip");
    if (!label) return;
    const sync = () => label.setAttribute("data-checked", input.checked ? "true" : "false");
    input.addEventListener("change", sync);
    sync();
  });
}

// ------------ init ------------
document.addEventListener("DOMContentLoaded", () => {
  // Colorize all chips (left rail + stream)
  document.querySelectorAll(".filter-chip, .taxonomy-item").forEach(el => {
    const type = el.dataset.filter || "cat";
    setChipVars(el, type);
  });

  // Initial filter (no chips checked = show all)
  applyFilters();
  wireCheckedState();

  // Listen for changes on checkboxes
  document.addEventListener("change", e => {
    if (e.target.matches(".filter-chip input[type='checkbox']")) {
      applyFilters();
    }
  });

  // Clear button
  document.addEventListener("click", e => {
    if (e.target && e.target.id === "clear-filters") {
      document.querySelectorAll(".filter-chip input[type='checkbox']:checked").forEach(cb => (cb.checked = false));
      wireCheckedState();
      applyFilters();
    }
  });
});
