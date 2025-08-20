// stream-filter.js
document.addEventListener("DOMContentLoaded", () => {
  const chips = document.querySelectorAll(".filter-chip, .taxonomy-item");
  chips.forEach(el => {
    setChipVars(el, el.dataset.filter);
  });
});

function setChipVars(el, type) {
  const key = (el.getAttribute("data-key") || el.textContent || "").trim().toLowerCase();
  if (!key) return;

  // simple hash function -> hue
  const djb2 = s => {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) + h) + s.charCodeAt(i);
    }
    return h >>> 0;
  };

  const hue = djb2(key) % 360;

  let s, l, borderL, fg;
  if (type === "cat") {
    s = 45;
    l = 82;
    borderL = Math.max(60, l - 12);
    fg = "#fff"; // categories always white text
  } else {
    s = 75;
    l = 55;
    borderL = Math.max(35, l - 15);
    fg = l > 60 ? "#111" : "#fff";
  }

  el.style.setProperty("--chip-bg", `hsl(${hue} ${s}% ${l}%)`);
  el.style.setProperty("--chip-border", `hsl(${hue} ${s}% ${borderL}%)`);
  el.style.setProperty("--chip-fg", fg);
  el.dataset.colored = "yes";
}

// --- Filtering logic ---
document.addEventListener("change", e => {
  if (!e.target.matches(".filter-chip input[type='checkbox']")) return;

  const checkedCats = [...document.querySelectorAll(
    '.filter-chip[data-filter="cat"] input:checked'
  )].map(cb => cb.value);

  const checkedTags = [...document.querySelectorAll(
    '.filter-chip[data-filter="tag"] input:checked'
  )].map(cb => cb.value);

  // For each stream card, check if it matches
  document.querySelectorAll("#stream .stream-card").forEach(card => {
    const cardCats = (card.dataset.cats || "").split(",");
    const cardTags = (card.dataset.tags || "").split(",");

    const catMatch = checkedCats.length === 0 || checkedCats.some(c => cardCats.includes(c));
    const tagMatch = checkedTags.length === 0 || checkedTags.some(t => cardTags.includes(t));

    card.style.display = (catMatch && tagMatch) ? "" : "none";
  });
});
