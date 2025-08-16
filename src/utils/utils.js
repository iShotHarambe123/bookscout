/**
 * Debounce function calls
 * @template {(...args:any[]) => any} F
 * @param {F} fn
 * @param {number} [wait=300]
 */
export function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(null, args), wait);
  };
}