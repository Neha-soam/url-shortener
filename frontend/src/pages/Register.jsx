import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

// States per CLAUDE.md section 12: idle / submitting / validation error / server error / success
export default function Register({ onDone }) {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation is UX only -- the backend re-validates and remains authoritative (section 3).
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setStatus('submitting');
    try {
      await register(email, password);
      setStatus('success');
      onDone();
    } catch (err) {
      setError(err.status === 409 ? 'That email is already registered.' : err.message || 'Something went wrong. Please try again.');
      setStatus('idle');
    }
  };

  return (
    <div className="card" style={{ maxWidth: 380 }}>
      <h1 style={{ fontSize: 18, margin: '0 0 16px' }}>Create an account</h1>
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
            <label className="field-label" htmlFor="password">Password (min 8 characters)</label>
            <input id="password" type="password" required minLength={8} autoComplete="new-password"
                   value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <div className="row">
          <div style={{ flex: 1 }}>
            <label className="field-label" htmlFor="confirm">Confirm password</label>
            <input id="confirm" type="password" required autoComplete="new-password"
                   value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
        </div>
        <button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Creating account…' : 'Register'}
        </button>
        {error && <ErrorMessage message={error} />}
      </form>
      <p className="meta" style={{ marginTop: 16 }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Log in</Link>
      </p>
    </div>
  );
}
