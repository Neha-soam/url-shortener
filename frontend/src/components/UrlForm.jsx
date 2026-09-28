import React, { useState } from 'react';
import { shorten } from '../services/api.js';

export default function UrlForm({ onCreated }) {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [days, setDays] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(''); setBusy(true);
    try {
      const body = { url };
      if (alias) body.customAlias = alias;
      if (days) body.expiresInDays = Number(days);
      onCreated(await shorten(body));
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="card">
      <div className="row"><input placeholder="https://long-url.example/..." value={url} onChange={(e) => setUrl(e.target.value)} /></div>
      <div className="row">
        <input placeholder="Custom alias (optional)" value={alias} onChange={(e) => setAlias(e.target.value)} />
        <input placeholder="Expires in days (optional)" type="number" min="1" max="365" value={days} onChange={(e) => setDays(e.target.value)} />
      </div>
      <button onClick={submit} disabled={busy || !url}>{busy ? 'Shortening…' : 'Shorten'}</button>
      {error && <p className="err">{error}</p>}
    </div>
  );
}
