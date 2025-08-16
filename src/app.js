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

import { searchBooks } from "./services/openlibrary.js";
import { skeletonCard, notify } from "./ui/components.js";
import { renderResults } from "./ui/renderResults.js";
import { debounce } from "./utils/utils.js";

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

  if (showSaved) {
    savedStatus.textContent = "Your shelf is empty.";
  }
  if (showHome && !homeLoaded) {
    homeHeader.innerHTML = `
      <div class="home-header__copy">
        <p class="home-header__kicker">Discover, decide, read</p>
        <h2 class="home-header__title">Find your next book</h2>
        <p class="home-header__tagline">Open Library + Wikipedia author insights, in one fast place.</p>
      </div>
    `;
    homeLoaded = true;
  }
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

/**
 * Add or remove book from shelf and show notification
 * @param {Book} book
 */
function onToggleShelf(book) {
  // Placeholder
  notify("Shelf functionality coming soon!");
}

/**
 * Open book details modal with author info
 * @param {Book} book
 */
async function onOpenBook(book) {
  // Placeholder
  notify(`Opening details for "${book.title || "Unknown book"}"`);
}