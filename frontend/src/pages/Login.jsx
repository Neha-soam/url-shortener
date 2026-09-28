import React, { useState } from 'react';
import { login, register, setToken } from '../services/api.js';

export default function Login({ onDone }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const go = (fn) => async () => {
    setError('');
    try { setToken((await fn(email, password)).token); onDone(); } catch (e) { setError(e.message); }
  };

  return (
    <div className="card">
      <div className="row"><input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="row"><input placeholder="Password (min 8 chars)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      <div className="row"><button onClick={go(login)}>Log in</button><button className="secondary" onClick={go(register)}>Register</button></div>
      {error && <p className="err">{error}</p>}
    </div>
  );
}
