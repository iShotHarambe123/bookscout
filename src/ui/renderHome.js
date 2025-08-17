import { bookCard } from "./components.js";
/**
 * Render home page header with subject chips
 * @param {HTMLElement} container
 * @param {Object} [opts]
 * @param {string} [opts.kicker="Discover, decide, read"]
 * @param {string} [opts.title="Find your next book"]
 * @param {string} [opts.tagline="Open Library + Wikipedia author insights, in one fast place."]
 * @param {Array<string>} [opts.chips=["Fantasy","Mystery","Romance","Science Fiction","History"]]
 * @param {Function} [opts.onSearch]
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
 * @param {Object} params.wiki
 * @param {Function} params.onSearchAuthor
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

/**
 * Render responsive book carousel
 * @param {HTMLElement} container
 * @param {Object} params
 * @param {string} params.title
 * @param {Array<Object>} params.books
 * @param {Function} params.onOpen
 * @param {Function} params.onToggleShelf
 */
export function renderCarousel(container, { title, books, onOpen, onToggleShelf }) {
  const sec = document.createElement("section");
  sec.className = "home-carousel";
  sec.setAttribute("role", "region");
  sec.setAttribute("aria-label", title);
  sec.innerHTML = `
    <header class="home-carousel__header">
      <h3 class="home-carousel__title">${title}</h3>
    </header>
    <div class="home-carousel__viewport">
      <button class="carousel__arrow is-prev" aria-label="Previous"></button>
      <div class="home-carousel__track"></div>
      <button class="carousel__arrow is-next" aria-label="Next"></button>
    </div>
  `;
  const track  = sec.querySelector(".home-carousel__track");
  const btnPrev = sec.querySelector(".carousel__arrow.is-prev");
  const btnNext = sec.querySelector(".carousel__arrow.is-next");
  container.appendChild(sec);

  let index = 0;
  let perView = computePerView();

  function computePerView() {
    const w = window.innerWidth;
    if (w < 480) return 1;
    if (w < 768) return 2;
    if (w < 1024) return 3;
    return 4;
  }

  function draw() {
    const start = index;
    const end = Math.min(start + perView, books.length);
    const slice = books.slice(start, end);

    track.style.setProperty("--cards", String(perView));
    track.innerHTML = "";
    const frag = document.createDocumentFragment();
    for (const b of slice) frag.appendChild(bookCard(b, { onOpen, onToggleShelf }));
    track.appendChild(frag);

    btnPrev.disabled = start <= 0;
    btnNext.disabled = end >= books.length;
  }

  function page(dir) {
    const step = perView;
    const maxStart = Math.max(0, books.length - perView);
    index = Math.min(maxStart, Math.max(0, index + dir * step));
    draw();
  }

  btnPrev.addEventListener("click", () => page(-1));
  btnNext.addEventListener("click", () => page(1));

  window.addEventListener("resize", () => {
    const next = computePerView();
    if (next !== perView) {
      index = Math.floor(index / next) * next;
      perView = next;
      draw();
    }
  }, { passive: true });

  draw();
}