import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav>
      <Link to="/" style={{ color: 'inherit' }}>
        <h2>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 15L15 9M10.5 6.5L12 5a3.5 3.5 0 0 1 5 5l-1.5 1.5M13.5 17.5L12 19a3.5 3.5 0 0 1-5-5l1.5-1.5" />
          </svg>
          AI URL Shortener
        </h2>
      </Link>
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
  );
}
