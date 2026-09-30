// One place that knows how to talk to the backend (CLAUDE.md section 6/10).
// Pages/components must never call fetch() directly -- go through a
// service (authService/urlService/analyticsService), which goes through this.

import { getToken } from './tokenStore.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Set by AuthContext at startup so a 401 anywhere can clear auth state
// centrally, instead of every component handling it separately.
let unauthorizedHandler = null;
export const registerUnauthorizedHandler = (fn) => { unauthorizedHandler = fn; };

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    unauthorizedHandler?.(); // "authentication is no longer valid" -- section 13
  }

  if (res.status === 204) return null;

  let body = null;
  try { body = await res.json(); } catch { /* empty/non-JSON body is fine */ }

  if (!res.ok) {
    // Never surface raw backend error text (section 19); callers show their own copy.
    throw new ApiError(res.status, body?.error || `Request failed (${res.status})`, body?.details);
  }
  return body;
}
