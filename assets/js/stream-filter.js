// stream-filter.js

/* ========== helpers ========== */
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

function djb2(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
  return h >>> 0;
}

/* ========== tag colors only ========== */
function setTagVars(el) {
  const key = (el.getAttribute("data-key") || el.textContent || "").trim().toLowerCase();
  if (!key) return;

  const hue = djb2(key) % 360;
  const s = 40, l = 90;
  const borderL = Math.max(70, l - 10);
  const textL = Math.max(0, borderL - 50); // much darker text

  el.style.setProperty("--chip-bg", `hsl(${hue} ${s}% ${l}%)`);
  el.style.setProperty("--chip-border", `hsl(${hue} ${s}% ${borderL}%)`);
  el.style.setProperty("--chip-fg", `hsl(${hue} ${s}% ${textL}%)`);
  el.dataset.colored = "yes";
}

/* ========== filtering ========== */
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

/* ========== init ========== */
document.addEventListener("DOMContentLoaded", () => {
  // Tags (pastel palette only)
  document.querySelectorAll(".filter-chip[data-filter='tag'], .taxonomy-item[data-filter='tag']")
    .forEach(setTagVars);

  applyFilters();
  wireCheckedState();

  document.addEventListener("change", e => {
    if (e.target.matches(".filter-chip input[type='checkbox']")) applyFilters();
  });

  document.addEventListener("click", e => {
    if (e.target && e.target.id === "clear-filters") {
      document.querySelectorAll(".filter-chip input[type='checkbox']:checked")
        .forEach(cb => (cb.checked = false));
      wireCheckedState();
      applyFilters();
    }
  });
});
