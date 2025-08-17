/**
 * Open Library API helpers
 *
 * @typedef {Object} Book
 * @property {string} workKey
 * @property {string=} title
 * @property {string=} author
 * @property {number=} year
 * @property {number|string=} cover
 * @property {number=} edition_count
 * @property {Array<string>=} subjects
 *
 * @typedef {Object} Work
 * @property {string} key
 * @property {string=} title
 * @property {string=} description
 * @property {Array<Object>=} authors
 * @property {Array<string>=} subjects
 */

const OL = "https://openlibrary.org";

/**
 * Build cover URL from cover ID
 * @param {number|string} coverId
 * @param {('S'|'M'|'L')} [size="M"]
 */
export const coverUrl = (coverId, size = "M") =>
  coverId ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`
          : `https://via.placeholder.com/256x384?text=No+Cover`;

/**
 * Map API response to Book object
 * @param {any} doc
 * @param {boolean} isWork
 */
function mapToBook(doc, isWork = false) {
  if (isWork) {
    return {
      workKey: (doc.key || "").replace("/works/", ""),
      title: doc.title,
      author: Array.isArray(doc.authors) && doc.authors[0]?.name ? doc.authors[0].name : "",
      year: doc.first_publish_year,
      cover: doc.cover_id,
      edition_count: doc.edition_count,
      subjects: Array.isArray(doc.subject) ? doc.subject.slice(0, 3) : []
    };
  }
  
  return {
    workKey: (doc.key || "").replace("/works/", ""),
    title: doc.title,
    author: Array.isArray(doc.author_name) ? doc.author_name[0] : doc.author_name,
    year: doc.first_publish_year,
    cover: doc.cover_i,
    edition_count: doc.edition_count,
    subjects: Array.isArray(doc.subject) ? doc.subject.slice(0, 3) : []
  };
}

/**
 * Search for books
 * @param {string} q
 * @param {number} [limit=20]
 */
export async function searchBooks(q, limit = 20) {
  const url = new URL(`${OL}/search.json`);
  url.searchParams.set("q", q);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("fields", [
    "key",
    "title",
    "author_name",
    "first_publish_year",
    "cover_i",
    "edition_count",
    "subject"
  ].join(","));

  const res = await fetch(url);
  if (!res.ok) throw new Error("Open Library search failed");
  const json = await res.json();

  return (json.docs || []).map(doc => mapToBook(doc));
}

/**
 * Get work details by key
 * @param {string} workKey
 */
export async function getWork(workKey) {
  const key = workKey.startsWith("/works/") ? workKey : `/works/${workKey}`;
  const res = await fetch(`${OL}${key}.json`);
  if (!res.ok) throw new Error("Open Library work fetch failed");
  const json = await res.json();

  const description = typeof json.description === "string"
    ? json.description
    : (json.description?.value || "");

  let authors = [];
  if (Array.isArray(json.authors)) {
    authors = json.authors.map(a => ({
      key: a.author?.key,
      name: a.name
    }));
  }

  return { ...json, description, authors };
}

/**
 * Get author info by key
 * @param {string} authorKey
 */
export async function getAuthor(authorKey) {
  const res = await fetch(`${OL}${authorKey}.json`);
  if (!res.ok) throw new Error("Open Library author fetch failed");
  const json = await res.json();
  return json;
}

/**
 * Get books by subject
 * @param {string} subject
 * @param {number} [limit=12]
 */
export async function getBySubject(subject, limit = 12) {
  const slug = encodeURIComponent(subject.toLowerCase().replace(/\s+/g, "_"));
  const url = `https://openlibrary.org/subjects/${slug}.json?limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Open Library subject fetch failed");
  const json = await res.json();
  const works = Array.isArray(json.works) ? json.works : [];
  return works.map(w => mapToBook(w, true));
}