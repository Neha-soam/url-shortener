import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getUrlById, removeUrl } from '../services/urlService.js';
import RiskBadge from '../components/RiskBadge.jsx';

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString() : '—');

export default function UrlDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [url, setUrl] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | not-found | error
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    getUrlById(id)
      .then((u) => { if (!cancelled) { setUrl(u); setStatus('ready'); } })
      .catch((e) => { if (!cancelled) setStatus(e.status === 404 ? 'not-found' : 'error'); });
    return () => { cancelled = true; };
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removeUrl(id);
      navigate('/dashboard');
    } catch {
      setDeleting(false);
      // A 403 here means the backend disagrees this URL is ours -- surface it, don't pretend it worked.
      setStatus('error');
    }
  };

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'not-found') return <div className="empty-state">This link doesn't exist or isn't yours.</div>;
  if (status === 'error') return <p className="err">We couldn't load this link. Please try again.</p>;

  return (
    <div className="card">
      <p className="field-label" style={{ marginBottom: 4 }}>Short URL</p>
      <p className="result-url"><a href={url.shortUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>{url.shortUrl}</a></p>

      <p className="field-label" style={{ marginBottom: 4, marginTop: 16 }}>Destination</p>
      <p className="meta" style={{ wordBreak: 'break-all' }}>{url.originalUrl}</p>

      <div className="row" style={{ marginTop: 16 }}>
        <RiskBadge classification={url.classification} />
      </div>

      <div className="row" style={{ marginTop: 16, gap: 24 }}>
        <div><span className="field-label">Clicks</span>{url.clicks}</div>
        <div><span className="field-label">Created</span>{fmtDate(url.createdAt)}</div>
        <div><span className="field-label">Expires</span>{fmtDate(url.expiresAt)}</div>
      </div>

      <div className="row" style={{ marginTop: 20 }}>
        <Link to={`/analytics/${url.id}`}><button className="secondary">View analytics</button></Link>
        <button className="secondary" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
