import React, { useState } from 'react';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { isLoggedIn, setToken } from './services/api.js';

export default function App() {
  const [page, setPage] = useState('home');
  const [, force] = useState(0);
  const logout = () => { setToken(null); setPage('home'); force((n) => n + 1); };

  return (
    <main>
      <nav>
        <h2 style={{ margin: 0 }}>🔗 AI URL Shortener</h2>
        <span className="spacer" />
        <button className="secondary" onClick={() => setPage('home')}>Home</button>
        {isLoggedIn() ? (
          <>
            <button className="secondary" onClick={() => setPage('dashboard')}>My links</button>
            <button className="secondary" onClick={logout}>Log out</button>
          </>
        ) : (
          <button className="secondary" onClick={() => setPage('login')}>Log in</button>
        )}
      </nav>
      {page === 'home' && <Home />}
      {page === 'login' && <Login onDone={() => setPage('dashboard')} />}
      {page === 'dashboard' && (isLoggedIn() ? <Dashboard /> : <Login onDone={() => setPage('dashboard')} />)}
    </main>
  );
}
