// Pages/components call THIS file, never fetch() and never the mock directly.
// Swap real <-> mock in one place (CLAUDE.md section 28: "replace the service
// implementation rather than rewriting every component").
import { apiFetch } from './http.js';
import * as mock from './mock/authService.mock.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

async function realLogin(email, password) {
  return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

async function realRegister(email, password) {
  return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
}

// Response shape (real or mock): { token, user: { id, email } }
export const login = USE_MOCK ? mock.login : realLogin;
export const register = USE_MOCK ? mock.register : realRegister;
