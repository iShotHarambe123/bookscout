/**
 * BookScout main app - connects routing, search, modals, and theme switching
 *
 * @typedef {Object} Book
 * @property {string} workKey
 * @property {string=} title
 * @property {string=} author
 * @property {number=} year
 * @property {number|string=} cover
 * @property {number=} edition_count
 * @property {string[]=} subjects
 *
 * @typedef {Object} Work
 * @property {string} key
 * @property {string=} title
 * @property {string=} description
 * @property {{key?: string, name?: string}[]=} authors
 * @property {string[]=} subjects
 *
 * @typedef {Object} Author
 * @property {string=} name
 * @property {string=} key
 *
 * @typedef {Object} WikiSummary
 * @property {string} title
 * @property {string=} description
 * @property {string=} extract
 * @property {{source: string}=} thumbnail
 * @property {{desktop?: {page?: string}}=} content_urls
 */

import "./scss/main.scss";
import MicroModal from "micromodal";

import { searchBooks, getWork, getAuthor } from "./services/openlibrary.js";
import { getAuthorSummary } from "./services/wikipedia.js";
import { loadShelf, saveShelf, toggleOnShelf } from "./state/store.js";
import { skeletonCard, notify } from "./ui/components.js";
import { renderResults } from "./ui/renderResults.js";
import { renderBookModal } from "./ui/renderBookModal.js";
import { renderShelf } from "./ui/renderShelf.js";
import { debounce } from "./utils/utils.js";
import { renderHomeHeader } from "./ui/renderHome.js";

/** @type {HTMLInputElement} */ const searchInput   = /** @type {any} */(document.querySelector("#search-input"));
/** @type {HTMLElement} */      const resultsGrid   = document.querySelector("#results");
/** @type {HTMLElement} */      const resultsStatus = document.querySelector("#results-status");
/** @type {HTMLElement} */      const savedGrid     = document.querySelector("#saved-grid");
/** @type {HTMLElement} */      const savedStatus   = document.querySelector("#saved-status");
/** @type {HTMLElement} */      const viewSearch    = document.querySelector("#view-search");
/** @type {HTMLElement} */      const viewSaved     = document.querySelector("#view-saved");
/** @type {HTMLElement} */      const viewHome      = document.querySelector("#view-home");
/** @type {HTMLElement} */      const homeHeader    = document.querySelector("#home-header");
/** @type {HTMLElement} */      const homeAuthor    = document.querySelector("#home-author");
/** @type {HTMLElement} */      const homeRails     = document.querySelector("#home-rails");
/** @type {HTMLElement} */      const themeToggle   = document.querySelector("#theme-toggle");
/** @type {HTMLElement|null} */ const themeEmoji    = document.querySelector("#theme-emoji");

const THEME_KEY = "bookscout:theme";

/**
 * Apply theme and save preference
 * @param {"light"|"dark"} t
 */
const applyTheme = (t) => {
  document.documentElement.setAttribute("data-theme", t);
  themeToggle.setAttribute("aria-pressed", String(t === "dark"));
  localStorage.setItem(THEME_KEY, t);
  if (themeEmoji) themeEmoji.textContent = t === "dark" ? "🌙" : "☀️";
};

applyTheme(localStorage.getItem(THEME_KEY) || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
});

MicroModal.init({ awaitOpenAnimation: true, awaitCloseAnimation: true, disableScroll: true });

let homeLoaded = false;

/**
 * Switch between views based on URL hash
 */
function route() {
  const hash = location.hash || "#home";
  const showHome   = hash === "#home";
  const showSaved  = hash === "#saved";
  const showSearch = hash === "#search";

  viewHome.hidden   = !showHome;   viewHome.classList.toggle("view--active", showHome);
  viewSaved.hidden  = !showSaved;  viewSaved.classList.toggle("view--active", showSaved);
  viewSearch.hidden = !showSearch; viewSearch.classList.toggle("view--active", showSearch);

  document.querySelectorAll(".nav-link").forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === hash);
  });

  if (showSaved) renderShelf(savedGrid, savedStatus, { onOpen: onOpenBook, onToggleShelf });
  if (showHome && !homeLoaded) loadHome();
}
window.addEventListener("hashchange", route);
route();

/** Navigate to search and perform search */
function navigateToSearch(query) {
  searchInput.value = query;
  location.hash = "#search";
  doSearch(query);
}

/** Switch to search view when user interacts with search input */
function ensureSearchView() { if ((location.hash || "#home") !== "#search") location.hash = "#search"; }

searchInput.addEventListener("focus", ensureSearchView);
searchInput.addEventListener("mousedown", ensureSearchView);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { ensureSearchView(); const q = searchInput.value.trim(); if (q.length >= 2) doSearch(q); }
});
searchInput.addEventListener("input", debounce((e) => doSearch(/** @type {HTMLInputElement} */(e.target).value), 300));

/**
 * Search books and show results
 * @param {string} q
 */
const doSearch = async (q) => {
  const query = q.trim();
  resultsGrid.innerHTML = "";
  resultsStatus.textContent = "";
  if (query.length < 2) { resultsStatus.textContent = "Type at least 2 characters to search."; return; }

  resultsGrid.append(...Array.from({ length: 8 }, () => skeletonCard()));
  try {
    const data = await searchBooks(query, 24);
    renderResults({ grid: resultsGrid, statusEl: resultsStatus, books: data, onOpen: onOpenBook, onToggleShelf });
  } catch (err) {
    console.error(err);
    resultsGrid.innerHTML = "";
    resultsStatus.textContent = "Something went wrong. Please try again.";
  }
};

loadShelf();

/**
 * Add or remove book from shelf and show notification
 * @param {Book} book
 */
function onToggleShelf(book) {
  const added = toggleOnShelf(book);
  saveShelf();
  notify(added ? "Added to your shelf" : "Removed from your shelf");
  if ((location.hash || "#home") === "#saved") renderShelf(savedGrid, savedStatus, { onOpen: onOpenBook, onToggleShelf });
}

/**
 * Open book details modal with author info
 * @param {Book} book
 */
async function onOpenBook(book) {
  const modalTitle = document.getElementById("modal-title");
  const modalContent = document.getElementById("modal-content");
  const modalFooter = document.getElementById("modal-footer");

  modalTitle.textContent = book.title || "Book details";
  modalContent.innerHTML = "<div class=\"modal-loading\">Loading details…</div>";
  modalFooter.innerHTML = "";
  MicroModal.show("modal-book");

  try {
    /** @type {Work} */
    const work = await getWork(book.workKey);
    let authorName = book.author || (Array.isArray(work?.authors) && work.authors[0]?.name) || "";
    /** @type {Author|null} */
    let authorObj = null;
    if (Array.isArray(work?.authors) && work.authors[0]?.author?.key) {
      authorObj = await getAuthor(work.authors[0].author.key);
      authorName = authorObj?.name || authorName;
    }
    /** @type {WikiSummary|null} */
    const wiki = authorName ? await getAuthorSummary(authorName) : null;

    renderBookModal({
      modalTitle, modalContent, modalFooter, book, work, author: authorObj, wiki,
      onToggleShelf,
      onOpenSubject: navigateToSearch
    });
  } catch (e) {
    console.error(e);
    modalContent.innerHTML = "<p class=\"error\">Could not load details.</p>";
  }
}

/** Load home page content */
async function loadHome() {
  try {
    renderHomeHeader(homeHeader, { onSearch: navigateToSearch });
    homeLoaded = true;
  } catch (e) {
    console.error(e);
    homeRails.innerHTML = `<p class="status">Couldn't load home content.</p>`;
  }
}

window.addEventListener("bookscout:open",   (e) => onOpenBook(/** @type {CustomEvent} */(e).detail.book));
window.addEventListener("bookscout:toggle", (e) => onToggleShelf(/** @type {CustomEvent} */(e).detail.book));