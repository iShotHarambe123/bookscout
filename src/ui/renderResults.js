import { renderBookGrid } from "./components.js";

/**
 * Render search results
 * @param {Object} params
 * @param {HTMLElement} params.grid
 * @param {HTMLElement} params.statusEl
 * @param {Array<Object>} params.books
 * @param {Function} params.onOpen
 * @param {Function} params.onToggleShelf
 */
export function renderResults({ grid, statusEl, books, onOpen, onToggleShelf }) {
  renderBookGrid(grid, statusEl, books, "No results found.", onOpen, onToggleShelf);
}