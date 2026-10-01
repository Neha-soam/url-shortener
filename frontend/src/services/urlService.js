// Response shape verified against backend/src/controllers/urlController.js
// present(doc): { id, shortCode, shortUrl, originalUrl, classification, clicks, expiresAt, createdAt }
import { apiFetch } from './http.js';

// body: { url, customAlias?, expiresInDays? } -- matches docs/api.md POST /api/urls
export async function shorten(body) {
  return apiFetch('/urls', { method: 'POST', body: JSON.stringify(body) });
}

export async function myUrls() {
  return apiFetch('/urls');
}

export async function removeUrl(id) {
  return apiFetch(`/urls/${id}`, { method: 'DELETE' }); // 204 -> apiFetch returns null
}

// NOTE: the backend has no GET /api/urls/:id endpoint -- only list, delete and
// analytics (verified against backend/src/routes/urlRoutes.js). Until it does,
// "load one URL" is derived by filtering the list. Every caller goes through
// this one function, so adding a real endpoint later is a one-line change here.
// On this backend, a URL that doesn't exist OR isn't yours both come back as
// 404 from the owning endpoints (never 403) -- see deleteUrl() in
// backend/src/services/urlService.js.
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
