// One place that knows how to talk to the backend (CLAUDE.md section 6/10).
// Pages/components must never call fetch() directly -- go through a
// service (authService/urlService/analyticsService), which goes through this.
//
// Phase 4: 401 vs 403 are handled HERE, once, instead of every component
// re-implementing "is this a session problem or a permissions problem".

import { getToken } from './tokenStore.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Registered by AuthContext: clears stale auth state on a real session-expiry 401.
let unauthorizedHandler = null;
export const registerUnauthorizedHandler = (fn) => { unauthorizedHandler = fn; };

// Registered once from App.jsx (via useToast) so this file can surface a
// message without importing React/Toast directly. Optional: if nothing is
// registered yet, we just skip the notification -- the thrown ApiError still
// carries a usable .message for the caller to show itself.
let notifier = null;
export const registerNotifier = (fn) => { notifier = fn; };

// Friendly fallback copy for when the backend didn't send a specific error
// string. Real backend messages (e.g. "Alias already in use") always win.
const DEFAULT_MESSAGES = {
  400: 'That request was invalid. Please check the form and try again.',
  401: 'You need to log in to do that.',
  403: "You don't have permission to do that.",
  404: 'Not found.',
  409: 'That already exists.',
  429: 'Too many requests. Please slow down and try again.',
  500: 'Something went wrong on our end. Please try again.',
};

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const hadToken = Boolean(token);

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    // fetch() itself threw: DNS/offline/CORS, not an HTTP error response at all.
    throw new ApiError(0, 'Network error. Please check your connection and try again.');
  }

  if (res.status === 401 && hadToken) {
    // A request that DID carry a token got rejected -> the session itself is
    // no longer valid (expired/revoked). This is the real "log out" case.
    // A 401 with NO token (e.g. a wrong password on /auth/login) is not a
    // session event -- that's just this endpoint's normal rejection, and the
    // calling page (Login/Register) already shows its own message for it.
    unauthorizedHandler?.();
    notifier?.('Your session has expired. Please log in again.', 'error');
  } else if (res.status === 403) {
    // Authenticated, but not allowed to do this specific thing. Do NOT log
    // the user out for this -- only 401 means "your session is invalid".
    notifier?.("You don't have permission to do that.", 'error');
  }

  if (res.status === 204) return null;

  let body = null;
  try { body = await res.json(); } catch { /* empty/non-JSON body is fine */ }

  if (!res.ok) {
    // Never surface raw backend error text (section 19) beyond what the
    // backend explicitly chose to send in `error`.
    const message = body?.error || DEFAULT_MESSAGES[res.status] || `Request failed (${res.status})`;
    throw new ApiError(res.status, message, body?.details);
  }
  return body;
}
