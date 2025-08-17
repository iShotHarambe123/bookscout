import { coverUrl } from "../services/openlibrary.js";
import { isOnShelf } from "../state/store.js";

/**
 * Create DOM element
 * @param {string} tag
 * @param {Object=} props
 * @param {...*} children
 */
export function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  for (const child of children) {
    if (child == null) continue;
    node.append(child.nodeType ? child : document.createTextNode(child));
  }
  return node;
}

/**
 * Get emoji icon by name
 * @param {string} name
 */
export function icon(name) {
  const map = { add: "➕", remove: "➖", open: "📖", star: "⭐" };
  return map[name] || "";
}

/** Create loading skeleton card */
export function skeletonCard() {
  const card = el("article", { className: "card card--skeleton" });
  card.innerHTML = `
    <div class="card__cover skeleton"></div>
    <div class="card__body">
      <div class="line skeleton" style="width: 70%"></div>
      <div class="line skeleton" style="width: 50%"></div>
    </div>`;
  return card;
}

/**
 * Create book card with action buttons
 * @param {Object} book
 * @param {Object} handlers
 */
export function bookCard(book, { onOpen, onToggleShelf }) {
  const card = el("article", { className: "card" });
  const subjects = (book.subjects || []).slice(0, 3);

  const updateToggleButton = () => {
    const onShelf = isOnShelf(book.workKey);
    const toggleBtn = card.querySelector(".toggle");
    if (toggleBtn) {
      toggleBtn.textContent = onShelf ? "Remove" : "Add";
    }
  };

  card.innerHTML = `
    <button class="card__coverbtn" aria-label="Open details">
      <img class="card__cover" loading="lazy" alt="${book.title || "Book cover"}"
           src="${coverUrl(book.cover, "L")}"/>
    </button>
    <div class="card__body">
      <h3 class="card__title">${book.title || "Untitled"}</h3>
      <p class="card__meta">${book.author ? book.author : "Unknown author"}${book.year ? ` • ${book.year}` : ""}</p>
      <div class="card__tags">
        ${subjects.map(s => `<span class="tag">${s}</span>`).join("")}
      </div>
      <div class="card__actions">
        <button class="btn btn--ghost btn--sm open">${icon("open")} Details</button>
        <button class="btn btn--primary btn--sm toggle"></button>
      </div>
    </div>`;

  updateToggleButton();

  card.querySelector(".open").addEventListener("click", () => onOpen(book));
  card.querySelector(".card__coverbtn").addEventListener("click", () => onOpen(book));
  card.querySelector(".toggle").addEventListener("click", () => {
    onToggleShelf(book);
    updateToggleButton();
  });

  return card;
}

/**
 * Render book grid with status
 * @param {HTMLElement} grid
 * @param {HTMLElement} statusEl
 * @param {Array<Object>} books
 * @param {string} emptyMessage
 * @param {Function} onOpen
 * @param {Function} onToggleShelf
 */
export function renderBookGrid(grid, statusEl, books, emptyMessage, onOpen, onToggleShelf) {
  grid.innerHTML = "";
  if (!books.length) {
    statusEl.textContent = emptyMessage;
    return;
  }
  
  const frag = document.createDocumentFragment();
  for (const b of books) frag.appendChild(bookCard(b, { onOpen, onToggleShelf }));
  grid.appendChild(frag);
  statusEl.textContent = `${books.length} ${books.length === 1 ? "result" : "results"}.`;
}

/**
 * Show toast notification
 * @param {string} text
 */
export function notify(text) {
  const toast = el("div", { className: "toast", role: "status" }, text);
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => toast.classList.remove("show"), 2000);
  setTimeout(() => toast.remove(), 2600);
}