import React, { useEffect, useState } from 'react';
import { myUrls, removeUrl } from '../services/api.js';
import RiskBadge from '../components/RiskBadge.jsx';
import AnalyticsPanel from '../components/AnalyticsPanel.jsx';

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [open, setOpen] = useState(null);
  const [error, setError] = useState('');
  const load = () => myUrls().then(setUrls).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const del = async (id) => { await removeUrl(id); if (open === id) setOpen(null); load(); };

  return (
    <>
      {error && <p className="err">{error}</p>}
      {urls.map((u) => (
        <div className="card" key={u.id}>
          <b>{u.shortUrl}</b> → <small>{u.originalUrl}</small>
          <RiskBadge classification={u.classification} />
          <div className="row" style={{ marginTop: 8 }}>
            <button className="secondary" onClick={() => setOpen(open === u.id ? null : u.id)}>Analytics ({u.clicks})</button>
            <button className="secondary" onClick={() => del(u.id)}>Delete</button>
          </div>
          {open === u.id && <AnalyticsPanel urlId={u.id} />}
        </div>
      ))}
      {!urls.length && !error && <p>No links yet. Create some on the Home tab while logged in.</p>}
    </>
  );
}
