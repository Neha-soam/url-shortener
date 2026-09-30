import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myUrls, removeUrl } from '../services/urlService.js';
import RiskBadge from '../components/RiskBadge.jsx';

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setStatus('loading');
    myUrls()
      .then((u) => { setUrls(u); setStatus('ready'); })
      .catch(() => setStatus('error'));
  };
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    setBusyId(id);
    try { await removeUrl(id); load(); }
    finally { setBusyId(null); }
  };

  if (status === 'loading') return <p>Loading your links…</p>;
  if (status === 'error') return <p className="err">We couldn't load your links. Please try again.</p>;
  if (!urls.length) return <div className="empty-state">No links yet. Create one from the Home page.</div>;

  return (
    <>
      {urls.map((u) => (
        <div className="card" key={u.id}>
          <p className="result-url" style={{ marginBottom: 4 }}>{u.shortUrl}</p>
          <p className="meta" style={{ marginBottom: 8 }}>{u.originalUrl}</p>
          <RiskBadge classification={u.classification} />
          <div className="row" style={{ marginTop: 12 }}>
            <Link to={`/urls/${u.id}`}><button className="secondary">View</button></Link>
            <Link to={`/analytics/${u.id}`}><button className="secondary">Analytics ({u.clicks})</button></Link>
            <button className="secondary" onClick={() => del(u.id)} disabled={busyId === u.id}>
              {busyId === u.id ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
