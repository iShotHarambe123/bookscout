import { renderBookGrid } from "./components.js";

/**
 * Render search results
 * @param {Object} params
 * @param {HTMLElement} params.grid
 * @param {HTMLElement} params.statusEl
 * @param {Array<import('../app.js').Book>} params.books
 * @param {(book: import('../app.js').Book) => void} params.onOpen
 * @param {(book: import('../app.js').Book) => void} params.onToggleShelf
 */
export function renderResults({ grid, statusEl, books, onOpen, onToggleShelf }) {
  renderBookGrid(grid, statusEl, books, "No results found.", onOpen, onToggleShelf);
}