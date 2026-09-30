import React from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import UrlDetails from './pages/UrlDetails.jsx';
import Analytics from './pages/Analytics.jsx';
import NotFound from './pages/NotFound.jsx';
import { useAuth } from './context/AuthContext.jsx';

// Minimal inline guard for now. This will be replaced by
// components/auth/ProtectedRoute.jsx in phase 3 (loading state while
// status === 'checking', consistent redirect-to-login for every private page).
function RequireAuth({ children }) {
  const { status, isAuthenticated } = useAuth();
  if (status === 'checking') return <p>Loading…</p>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <main>
      <nav>
        <h2>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 15L15 9M10.5 6.5L12 5a3.5 3.5 0 0 1 5 5l-1.5 1.5M13.5 17.5L12 19a3.5 3.5 0 0 1-5-5l1.5-1.5" />
          </svg>
          AI URL Shortener
        </h2>
        <span className="spacer" />
        <Link to="/"><button className="secondary">Home</button></Link>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard"><button className="secondary">My links</button></Link>
            <button className="secondary" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <Link to="/login"><button className="secondary">Log in</button></Link>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onDone={() => navigate('/dashboard')} />} />
        <Route path="/register" element={<Register onDone={() => navigate('/dashboard')} />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/urls/:id" element={<RequireAuth><UrlDetails /></RequireAuth>} />
        <Route path="/analytics/:id" element={<RequireAuth><Analytics /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}
