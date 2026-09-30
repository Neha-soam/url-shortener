import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loading from './Loading.jsx';

// CLAUDE.md section 11: don't redirect before auth-state restoration finishes --
// that's what causes a flash-redirect-to-login on every page refresh for a
// logged-in user. Show a loading state while status === 'checking' instead.
export default function ProtectedRoute({ children }) {
  const { status, isAuthenticated } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <Loading label="Checking your session…" />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
