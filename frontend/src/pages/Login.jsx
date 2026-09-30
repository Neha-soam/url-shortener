import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// States per CLAUDE.md section 12: idle / submitting / success / invalid credentials / server error / network error
export default function Login({ onDone }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('submitting');
    try {
      await login(email, password);
      setStatus('success');
      onDone();
    } catch (err) {
      // 401 -> "invalid credentials"; anything else -> generic server/network message.
      setError(err.status === 401 ? 'Invalid email or password.' : err.message || 'Something went wrong. Please try again.');
      setStatus('idle');
    }
  };

  return (
    <div className="card" style={{ maxWidth: 380 }}>
      <h1 style={{ fontSize: 18, margin: '0 0 16px' }}>Log in</h1>
      <form onSubmit={submit}>
        <div className="row">
          <div style={{ flex: 1 }}>
            <label className="field-label" htmlFor="email">Email</label>
            <input id="email" type="email" required autoComplete="email"
                   value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div className="row">
          <div style={{ flex: 1 }}>
            <label className="field-label" htmlFor="password">Password</label>
            <input id="password" type="password" required autoComplete="current-password"
                   value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Logging in…' : 'Log in'}
        </button>
        {error && <p className="err" role="alert">{error}</p>}
      </form>
      <p className="meta" style={{ marginTop: 16 }}>
        No account? <Link to="/register" style={{ color: 'var(--accent)' }}>Register</Link>
      </p>
    </div>
  );
}
