// Client-side JWT payload reader. This does NOT verify the signature --
// it only reads the (public, base64) payload so the UI can show the right
// screen instantly on load, without waiting on a network round trip.
// The backend remains the source of truth: every real request still goes
// through apiFetch, which the backend validates and can reject with 401/403
// regardless of what this local decode says (see http.js).

export function decodeJwtPayload(token) {
  try {
    const [, payloadB64] = token.split('.');
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true; // no exp claim -> treat as untrustworthy, not "forever valid"
  return Date.now() >= payload.exp * 1000;
}
