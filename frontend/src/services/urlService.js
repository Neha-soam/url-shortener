import { apiFetch } from './http.js';
import * as mock from './mock/urlService.mock.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// body: { url, customAlias?, expiresInDays? } -- matches docs/api.md POST /api/urls
async function realShorten(body) {
  return apiFetch('/urls', { method: 'POST', body: JSON.stringify(body) });
}

async function realMyUrls() {
  return apiFetch('/urls');
}

async function realRemoveUrl(id) {
  return apiFetch(`/urls/${id}`, { method: 'DELETE' });
}

export const shorten = USE_MOCK ? mock.shorten : realShorten;
export const myUrls = USE_MOCK ? mock.myUrls : realMyUrls;
export const removeUrl = USE_MOCK ? mock.removeUrl : realRemoveUrl;

// NOTE: the backend (docs/api.md) has no GET /api/urls/:id endpoint yet --
// only list, delete and analytics. Until it does, "load one URL" is derived
// by filtering the list. Swap this for a dedicated backend call once that
// endpoint exists; every caller here goes through this one function so
// that's a one-line change later.
export async function getUrlById(id) {
  const all = await myUrls();
  const found = all.find((u) => u.id === id);
  if (!found) {
    const err = new Error('URL not found');
    err.status = 404;
    throw err;
  }
  return found;
}
