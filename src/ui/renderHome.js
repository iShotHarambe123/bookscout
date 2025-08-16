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

/**
 * Render author of the day card
 * @param {HTMLElement} container
 * @param {Object} params
 * @param {string} params.name
 * @param {import('../app.js').WikiSummary|null|undefined} params.wiki
 * @param {(name: string) => void} params.onSearchAuthor
 */
export function renderAuthorCard(container, { name, wiki, onSearchAuthor }) {
  const img = wiki?.thumbnail?.source || "";
  const desc = wiki?.description || "";
  const extract = wiki?.extract || "No biography available.";
  const link =
    wiki?.content_urls?.desktop?.page ||
    `https://en.wikipedia.org/wiki/${encodeURIComponent((name || "").replace(/\s+/g, "_"))}`;

  container.innerHTML = `
    <article class="author-day">
      <div class="author-day__media">${img ? `<img alt="${name}" src="${img}">` : `<div class="avatar"></div>`}</div>
      <div class="author-day__body">
        <h3 class="author-day__eyebrow">Author of the Day</h3>
        <h2 class="author-day__name">${name || "Unknown author"}</h2>
        <p class="muted">${desc}</p>
        <p>${extract}</p>
        <div class="author-day__actions">
          <button class="btn btn--primary" id="author-search">Search this author</button>
          <a class="btn btn--ghost" href="${link}" target="_blank" rel="noreferrer">Open on Wikipedia</a>
        </div>
      </div>
    </article>
  `;
  container.querySelector("#author-search").addEventListener("click", () => onSearchAuthor(name));
}