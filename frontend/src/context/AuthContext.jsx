// Centralized auth state (CLAUDE.md sections 9, 10, 25).
// Single source of truth for "is someone logged in" -- pages/components
// must read this instead of touching tokenStore or services directly.
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';
import { getToken, setToken as persistToken, clearToken } from '../services/tokenStore.js';
import { registerUnauthorizedHandler } from '../services/http.js';
import { decodeJwtPayload, isTokenExpired } from '../services/jwt.js';

const AuthContext = createContext(null);

// 'checking' -> 'authenticated' | 'unauthenticated' (section 9's startup flow).
// ProtectedRoute shows a loading state while status === 'checking' instead of
// redirecting immediately, to avoid flicker-redirecting a logged-in user.
export function AuthProvider({ children }) {
  const [status, setStatus] = useState('checking');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Client-side check only: reads the token's own exp claim, no network
    // round trip. This catches the common case (token expired while the tab
    // was closed) instantly. It CANNOT catch server-side revocation (e.g. an
    // admin invalidating a token early) -- that still relies on any real
    // request later coming back 401, which registerUnauthorizedHandler below
    // handles. A backend GET /api/auth/me would close this gap fully; add it
    // there if/when the backend exposes one.
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      const payload = decodeJwtPayload(token); // backend signs { id, email } -- see authController.js
      setUser({ id: payload?.id, email: payload?.email });
      setStatus('authenticated');
    } else {
      if (token) clearToken(); // stale/expired -- don't keep sending a token we know is dead
      setStatus('unauthenticated');
    }

    registerUnauthorizedHandler(() => {
      clearToken();
      setUser(null);
      setStatus('unauthenticated');
    });
  }, []);

  const login = async (email, password) => {
    const { token, user: u } = await authService.login(email, password);
    persistToken(token);
    setUser(u);
    setStatus('authenticated');
  };

  // Sends the OTP email. Does NOT change auth state -- no account/session
  // exists yet until verifyRegistration succeeds.
  const startRegistration = (email, password) => authService.startRegistration(email, password);

  const verifyRegistration = async (email, otp) => {
    const { token, user: u } = await authService.verifyRegistration(email, otp);
    persistToken(token);
    setUser(u);
    setStatus('authenticated');
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setStatus('unauthenticated');
  };

  const value = useMemo(
    () => ({ status, user, isAuthenticated: status === 'authenticated', login, startRegistration, verifyRegistration, logout }),
    [status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
