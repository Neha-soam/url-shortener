// Pages/components call THIS file, never fetch() directly.
// Response shapes verified against backend/src/controllers/authController.js.
import { apiFetch } from './http.js';

export async function login(email, password) {
  return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

// Two-step registration: startRegistration sends an OTP email and creates
// NO account yet -- { message, expiresInMinutes }. verifyRegistration
// creates the account and logs in, same shape as login(): { token, user }.
export async function startRegistration(email, password) {
  return apiFetch('/auth/register/start', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function verifyRegistration(email, otp) {
  return apiFetch('/auth/register/verify', { method: 'POST', body: JSON.stringify({ email, otp }) });
}
