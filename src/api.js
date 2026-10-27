
// Vite proxies /api locally; Nginx provides the same route in production.
const BASE = '/api';


async function handle(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    if (res.status === 401 && !res.url.endsWith('/auth/login')) {
      window.dispatchEvent(new Event('auth-expired'));
    }
    throw new Error(err.detail || 'Request failed');
  }
  if (res.status === 204) return null;
  return res.json();
}

function json(body) {
  return {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export const api = {
  me: () => fetch(`${BASE}/auth/me`).then(handle),
  login: (data) => fetch(`${BASE}/auth/login`, { method: 'POST', ...json(data) }).then(handle),
  logout: () => fetch(`${BASE}/auth/logout`, { method: 'POST' }).then(handle),
  // ---- todos ----
  list: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.completed !== undefined) params.set('completed', filters.completed);
    if (filters.urgency) params.set('urgency', filters.urgency);
    if (filters.category_id != null) params.set('category_id', filters.category_id);
    if (filters.overdue) params.set('overdue', 'true');
    const qs = params.toString();
    return fetch(`${BASE}/todos${qs ? '?' + qs : ''}`).then(handle);
  },
  get: (id) => fetch(`${BASE}/todos/${id}`).then(handle),
  create: (data) =>
    fetch(`${BASE}/todos`, { method: 'POST', ...json(data) }).then(handle),
  update: (id, data) =>
    fetch(`${BASE}/todos/${id}`, { method: 'PATCH', ...json(data) }).then(handle),
  remove: (id) =>
    fetch(`${BASE}/todos/${id}`, { method: 'DELETE' }).then(handle),

  // ---- categories ----
  listCategories: () => fetch(`${BASE}/categories`).then(handle),
  createCategory: (data) =>
    fetch(`${BASE}/categories`, { method: 'POST', ...json(data) }).then(handle),
  updateCategory: (id, data) =>
    fetch(`${BASE}/categories/${id}`, { method: 'PATCH', ...json(data) }).then(handle),
  removeCategory: (id) =>
    fetch(`${BASE}/categories/${id}`, { method: 'DELETE' }).then(handle),
};
