/* =====================================================================
   Router — roteamento por hash (#/rota/param?query)
   ===================================================================== */
export function parseHash() {
  const raw = (location.hash || '#/').replace(/^#/, '');
  const [path, qs] = raw.split('?');
  const parts = path.split('/').filter(Boolean); // ['produto','handle']
  const query = {};
  new URLSearchParams(qs || '').forEach((v, k) => { query[k] = v; });
  return { parts, query, path };
}

const routes = [];
export function route(pattern, handler) { routes.push({ pattern: pattern.split('/').filter(Boolean), handler }); }

function match(parts, pattern) {
  if (pattern.length !== parts.length) return null;
  const params = {};
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i].startsWith(':')) params[pattern[i].slice(1)] = decodeURIComponent(parts[i]);
    else if (pattern[i] !== parts[i]) return null;
  }
  return params;
}

let notFound = () => {};
export const setNotFound = (fn) => { notFound = fn; };

export function resolve() {
  const { parts, query } = parseHash();
  for (const r of routes) {
    const params = match(parts, r.pattern);
    if (params) { window.scrollTo(0, 0); return r.handler({ params, query }); }
  }
  window.scrollTo(0, 0);
  notFound();
}

export function startRouter() {
  window.addEventListener('hashchange', resolve);
  resolve();
}
