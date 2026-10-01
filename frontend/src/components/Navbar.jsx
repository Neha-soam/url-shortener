import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// NavLink (not Link) so the current page gets aria-current="page" automatically
// -- screen readers announce it, and the CSS active-state hooks off it too.
export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav>
      <NavLink to="/" end style={{ color: 'inherit', textDecoration: 'none' }}>
        <h2>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
            <path d="M9 15L15 9M10.5 6.5L12 5a3.5 3.5 0 0 1 5 5l-1.5 1.5M13.5 17.5L12 19a3.5 3.5 0 0 1-5-5l1.5-1.5" />
          </svg>
          AI URL Shortener
        </h2>
      </NavLink>
      <span className="spacer" />
      <NavLink to="/" end className="secondary">Home</NavLink>
      {isAuthenticated ? (
        <>
          <NavLink to="/dashboard" className="secondary">My links</NavLink>
          <button className="secondary" onClick={handleLogout}>Log out</button>
        </>
      ) : (
        <NavLink to="/login" className="secondary">Log in</NavLink>
      )}
    </nav>
  );
}
