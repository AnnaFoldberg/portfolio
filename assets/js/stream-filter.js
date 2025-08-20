// stream-filter.js

function slugify(s) {
  return (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// fixed palette for categories
const categoryPalette = [
  { bg: "hsl(210, 70%, 50%)", border: "hsl(210, 70%, 40%)", fg: "#fff" }, // blue
  { bg: "hsl(140, 60%, 40%)", border: "hsl(140, 60%, 30%)", fg: "#fff" }, // green
  { bg: "hsl(0, 70%, 50%)",   border: "hsl(0, 70%, 40%)",   fg: "#fff" }, // red
  { bg: "hsl(45, 90%, 55%)",  border: "hsl(45, 90%, 45%)",  fg: "#000" }  // yellow
];

// djb2 hash (for tags only)
function djb2(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
  return h >>> 0;
}

function setChipVars(el, type, index = 0) {
  const key = el.dataset.key || el.textContent;
  if (!key) return;

  if (type === "cat") {
    // pick one of the 4 fixed category colors
    const c = categoryPalette[index % categoryPalette.length];
    el.style.setProperty("--chip-bg", c.bg);
    el.style.setProperty("--chip-border", c.border);
    el.style.setProperty("--chip-fg", c.fg);
  } else {
    // TAGS = pastel from hash
    const hue = djb2(key) % 360;
    const s = 40;
    const l = 90;
    const borderL = Math.max(70, l - 10);
    el.style.setProperty("--chip-bg", `hsl(${hue}, ${s}%, ${l}%)`);
    el.style.setProperty("--chip-border", `hsl(${hue}, ${s}%, ${borderL}%)`);
    el.style.setProperty("--chip-fg", "#1a1a1a");
  }
  el.dataset.colored = "yes";
}

// filtering logic unchanged
function getChecked(type) {
  return Array.from(document.querySelectorAll(`.filter-chip[data-filter="${type}"] input:checked`))
    .map(cb => cb.closest(".filter-chip"))
    .filter(Boolean)
    .map(lbl => lbl.dataset.key)
    .filter(Boolean);
}

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

function wireCheckedState() {
  document.querySelectorAll(".filter-chip input[type='checkbox']").forEach(input => {
    const label = input.closest(".filter-chip");
    if (!label) return;
    const sync = () => label.setAttribute("data-checked", input.checked ? "true" : "false");
    input.addEventListener("change", sync);
    sync();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Apply palette to categories in left rail
  document.querySelectorAll(".filter-chip[data-filter='cat']").forEach((el, i) => setChipVars(el, "cat", i));
  // Tags (left rail + in-stream)
  document.querySelectorAll(".filter-chip[data-filter='tag'], .taxonomy-item[data-filter='tag']").forEach(el => setChipVars(el, "tag"));

  applyFilters();
  wireCheckedState();

  document.addEventListener("change", e => {
    if (e.target.matches(".filter-chip input[type='checkbox']")) applyFilters();
  });

  document.addEventListener("click", e => {
    if (e.target && e.target.id === "clear-filters") {
      document.querySelectorAll(".filter-chip input[type='checkbox']:checked").forEach(cb => (cb.checked = false));
      wireCheckedState();
      applyFilters();
    }
  });
});
