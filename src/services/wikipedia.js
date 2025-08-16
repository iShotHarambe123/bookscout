/**
 * Get author summary from Wikipedia
 * @param {string} name
 */
export async function getAuthorSummary(name) {
  if (!name) return null;
  const title = encodeURIComponent(name.replace(/\s+/g, "_"));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;
  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.type === "disambiguation") return null;
    return json;
  } catch (e) {
    console.warn("Wikipedia fetch failed", e);
    return null;
  }
}