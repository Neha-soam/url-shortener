import React, { useState } from 'react';
import { shorten } from '../services/urlService.js';
import { useToast } from './Toast.jsx';
import ErrorMessage from './ErrorMessage.jsx';

export default function UrlForm({ onCreated }) {
  const showToast = useToast();
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
      const doc = await shorten(body);
      showToast('Short link created');
      onCreated(doc);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="card">
      <div className="row">
        <div style={{ flex: 1 }}>
          <label className="field-label" htmlFor="url">URL to shorten</label>
          <input id="url" placeholder="https://long-url.example/..." value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
      </div>
      <div className="row">
        <div style={{ flex: 1 }}>
          <label className="field-label" htmlFor="alias">Custom alias (optional)</label>
          <input id="alias" placeholder="my-link" value={alias} onChange={(e) => setAlias(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="field-label" htmlFor="days">Expires in days (optional)</label>
          <input id="days" placeholder="e.g. 7" type="number" min="1" max="365" value={days} onChange={(e) => setDays(e.target.value)} />
        </div>
      </div>
      <button onClick={submit} disabled={busy || !url}>{busy ? 'Shortening…' : 'Shorten'}</button>
      {error && <ErrorMessage message={error} />}
    </div>
  );
}
