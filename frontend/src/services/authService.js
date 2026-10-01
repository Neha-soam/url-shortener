// Pages/components call THIS file, never fetch() directly.
// Response shape verified against backend/src/controllers/authController.js:
// { token, user: { id, email } } for both register (201) and login (200).
import { apiFetch } from './http.js';

export async function login(email, password) {
  return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function register(email, password) {
  return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
}
