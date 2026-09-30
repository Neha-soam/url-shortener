import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUrlById } from '../services/urlService.js';
import AnalyticsPanel from '../components/AnalyticsPanel.jsx';

export default function Analytics() {
  const { id } = useParams();
  const [url, setUrl] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    getUrlById(id)
      .then((u) => { if (!cancelled) { setUrl(u); setStatus('ready'); } })
      .catch((e) => { if (!cancelled) setStatus(e.status === 404 ? 'not-found' : 'error'); });
    return () => { cancelled = true; };
  }, [id]);

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'not-found') return <div className="empty-state">This link doesn't exist or isn't yours.</div>;
  if (status === 'error') return <p className="err">We couldn't load this link. Please try again.</p>;

  return (
    <>
      <p className="meta" style={{ marginBottom: 8 }}>
        <Link to={`/urls/${id}`} style={{ color: 'var(--accent)' }}>&larr; back to link</Link>
      </p>
      <div className="intro" style={{ margin: '8px 0 20px' }}>
        <h1 style={{ fontSize: 18 }}>Analytics for {url.shortCode}</h1>
        <p className="meta">{url.originalUrl}</p>
      </div>
      <div className="card">
        <AnalyticsPanel urlId={id} />
      </div>
    </>
  );
}
