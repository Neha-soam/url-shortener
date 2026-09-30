// Centralized auth state (CLAUDE.md sections 9, 10, 25).
// Single source of truth for "is someone logged in" -- pages/components
// must read this instead of touching tokenStore or services directly.
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';
import { getToken, setToken as persistToken, clearToken } from '../services/tokenStore.js';
import { registerUnauthorizedHandler } from '../services/http.js';

const AuthContext = createContext(null);

// 'checking' -> 'authenticated' | 'unauthenticated' (section 9's startup flow).
// ProtectedRoute (phase 3) will show a loading state while status === 'checking'
// instead of redirecting immediately, to avoid flicker-redirecting logged-in users.
export function AuthProvider({ children }) {
  const [status, setStatus] = useState('checking');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // TODO(backend integration): once the backend exposes a current-user /
    // token-verify endpoint, call it here instead of trusting stored-token
    // presence alone (section 9: "do not assume a user is authenticated
    // merely because a client-side token exists").
    const token = getToken();
    setStatus(token ? 'authenticated' : 'unauthenticated');

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

  const register = async (email, password) => {
    const { token, user: u } = await authService.register(email, password);
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
    () => ({ status, user, isAuthenticated: status === 'authenticated', login, register, logout }),
    [status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
