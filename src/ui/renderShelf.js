import { getShelf } from "../state/store.js";
import { renderBookGrid } from "./components.js";

/**
 * Render saved books shelf
 * @param {HTMLElement} grid
 * @param {HTMLElement} statusEl
 * @param {Object} [handlers]
 */
export function renderShelf(grid, statusEl, { onOpen, onToggleShelf } = {}) {
  const books = getShelf();
  const message = books.length === 1 ? "1 saved book." : `${books.length} saved books.`;
  renderBookGrid(grid, statusEl, books, "Your shelf is empty.", onOpen, onToggleShelf);
  if (books.length) statusEl.textContent = message;
}