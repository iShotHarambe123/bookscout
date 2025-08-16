/**
 * Render home page header with subject chips
 * @param {HTMLElement} container
 * @param {Object} [opts]
 * @param {string} [opts.kicker="Discover, decide, read"]
 * @param {string} [opts.title="Find your next book"]
 * @param {string} [opts.tagline="Open Library + Wikipedia author insights, in one fast place."]
 * @param {string[]} [opts.chips=["Fantasy","Mystery","Romance","Science Fiction","History"]]
 * @param {(chip: string) => void} [opts.onSearch]
 */
export function renderHomeHeader(
  container,
  {
    kicker = "Discover, decide, read",
    title = "Find your next book",
    tagline = "Open Library + Wikipedia author insights, in one fast place.",
    chips = ["Fantasy", "Mystery", "Romance", "Science Fiction", "History"],
    onSearch,
  } = {}
) {
  container.innerHTML = `
    <div class="home-header__copy">
      <p class="home-header__kicker">${kicker}</p>
      <h2 class="home-header__title">${title}</h2>
      <p class="home-header__tagline">${tagline}</p>
      <div class="chiprow">
        ${chips.map(s => `<button class="chip" data-chip="${s}">${s}</button>`).join("")}
      </div>
    </div>
  `;

  container.querySelectorAll("[data-chip]").forEach(btn => {
    btn.addEventListener("click", () => onSearch && onSearch(btn.dataset.chip));
  });
}