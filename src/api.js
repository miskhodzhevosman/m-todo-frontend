const BASE = '/api';

async function handle(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  list: (completed) => {
    const qs = completed === undefined ? '' : `?completed=${completed}`;
    return fetch(`${BASE}/todos${qs}`).then(handle);
  },
  create: (data) =>
    fetch(`${BASE}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handle),
  update: (id, data) =>
    fetch(`${BASE}/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handle),
  remove: (id) =>
    fetch(`${BASE}/todos/${id}`, { method: 'DELETE' }).then(handle),
};
