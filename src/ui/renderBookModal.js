import { coverUrl } from "../services/openlibrary.js";
import { isOnShelf } from "../state/store.js";

/**
 * Render book details modal
 * @param {Object} params
 * @param {HTMLElement} params.modalTitle
 * @param {HTMLElement} params.modalContent
 * @param {HTMLElement} params.modalFooter
 * @param {Object} params.book
 * @param {Object} params.work
 * @param {Object} params.author
 * @param {Object} params.wiki
 * @param {Function} params.onToggleShelf
 * @param {Function} params.onOpenSubject
 */
export function renderBookModal({ modalTitle, modalContent, modalFooter, book, work, author, wiki, onToggleShelf, onOpenSubject }) {
  modalTitle.textContent = book.title || work?.title || "Book";

  const onShelf = isOnShelf(book.workKey);
  const desc = work?.description || "No description available.";
  const subjects = Array.isArray(work?.subjects) ? work.subjects.slice(0, 12) : (book.subjects || []);

  const authorName = author?.name || book.author || "";
  const wikiImg = wiki?.thumbnail?.source;

  modalContent.innerHTML = `
    <div class="bookdetail">
      <div class="bookdetail__media">
        <img class="bookdetail__cover" alt="${book.title} cover" src="${coverUrl(book.cover, "L")}" />
      </div>
      <div class="bookdetail__body">
        <div class="bookdetail__meta">
          <p class="author">${authorName || "Unknown author"}</p>
          ${book.year ? `<p class="year">First published: ${book.year}</p>` : ""}
          ${book.edition_count ? `<p class="editions">Editions: ${book.edition_count}</p>` : ""}
        </div>
        <div class="bookdetail__desc">${escapeHtml(desc)}</div>
        ${subjects.length ? `<div class="bookdetail__subjects">${subjects.map(s => `<button class="chip" data-subject="${s}">${s}</button>`).join("")}</div>` : ""}
        <div class="authorcard">
          <div class="authorcard__img">${wikiImg ? `<img alt="${authorName}" src="${wikiImg}"/>` : "<div class=\"avatar\"></div>"}</div>
          <div class="authorcard__body">
            <h4>${authorName || "Author"}</h4>
            <p class="muted">${wiki?.description || ""}</p>
            <p>${wiki?.extract || ""}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const updateModalButton = () => {
    const currentOnShelf = isOnShelf(book.workKey);
    const modalToggleBtn = modalFooter.querySelector("#modal-toggle-shelf");
    if (modalToggleBtn) {
      modalToggleBtn.textContent = currentOnShelf ? "Remove from shelf" : "Add to shelf";
    }
  };

  modalFooter.innerHTML = `
    <button id="modal-toggle-shelf" class="btn btn--primary"></button>
    <a class="btn btn--ghost" href="https://openlibrary.org/${work?.key || ("/works/" + book.workKey)}" target="_blank" rel="noreferrer">View on Open Library</a>
  `;

  updateModalButton();

  modalFooter.querySelector("#modal-toggle-shelf").addEventListener("click", () => {
    onToggleShelf(book);
    updateModalButton();
  });

  modalContent.querySelectorAll("[data-subject]").forEach(btn => {
    btn.addEventListener("click", () => onOpenSubject(btn.dataset.subject));
  });
}

/**
 * Escape HTML characters
 * @param {*} str
 */
function escapeHtml(str) {
  return String(str).replace(/[&<>\"']/g, s => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[s]));
}