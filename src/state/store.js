/**
 * Local shelf state using localStorage
 *
 * @typedef {Object} ShelfItem
 * @property {string} workKey
 * @property {string=} title
 * @property {string=} author
 * @property {number=} year
 * @property {number|string=} cover
 */

const SHELF_KEY = "bookscout:shelf";
/** @type {ShelfItem[]} */
let shelf = [];

/** Load shelf from localStorage */
export function loadShelf() {
  try {
    shelf = JSON.parse(localStorage.getItem(SHELF_KEY) || "[]");
  } catch {
    shelf = [];
  }
  return shelf;
}

/** Save shelf to localStorage */
export function saveShelf() {
  try {
    localStorage.setItem(SHELF_KEY, JSON.stringify(shelf));
  } catch {}
}

/** Get current shelf */
export function getShelf() { return shelf; }

/**
 * Check if book is on shelf
 * @param {string} workKey
 */
export function isOnShelf(workKey) {
  return shelf.some(b => b.workKey === workKey);
}

/**
 * Add or remove book from shelf
 * @param {import('../app.js').Book} book
 */
export function toggleOnShelf(book) {
  const idx = shelf.findIndex(b => b.workKey === book.workKey);
  if (idx >= 0) {
    shelf.splice(idx, 1);
    return false;
  } else {
    shelf.unshift({
      workKey: book.workKey,
      title: book.title,
      author: book.author,
      year: book.year,
      cover: book.cover
    });
    return true;
  }
}