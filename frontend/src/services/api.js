let token = localStorage.getItem('token'); // fine here: this is a normal browser app, not a Claude artifact

export const setToken = (t) => { token = t; t ? localStorage.setItem('token', t) : localStorage.removeItem('token'); };
export const isLoggedIn = () => Boolean(token);

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const shorten = (body) => request('/urls', { method: 'POST', body: JSON.stringify(body) });
export const myUrls = () => request('/urls');
export const removeUrl = (id) => request(`/urls/${id}`, { method: 'DELETE' });
export const analytics = (id) => request(`/urls/${id}/analytics`);
export const login = (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const register = (email, password) => request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
