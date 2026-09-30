// Centralized token storage. Nothing else in the app should touch
// localStorage directly for the auth token (see CLAUDE.md section 10).
//
// NOTE: localStorage is readable by any script on the page (XSS risk).
// If/when the backend switches to HTTP-only cookies, this file is the
// only place that needs to change — services/context stay the same.

const KEY = 'token';

export const getToken = () => localStorage.getItem(KEY);

export const setToken = (token) => {
  if (token) localStorage.setItem(KEY, token);
  else localStorage.removeItem(KEY);
};

export const clearToken = () => localStorage.removeItem(KEY);
