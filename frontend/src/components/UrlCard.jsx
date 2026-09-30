import React from 'react';
import { Link } from 'react-router-dom';
import RiskBadge from './RiskBadge.jsx';
import { useToast } from './Toast.jsx';

export default function UrlCard({ url, onRequestDelete, deleting }) {
  const showToast = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url.shortUrl);
      showToast('Short URL copied');
    } catch {
      showToast('Could not copy — copy it manually', 'error');
    }
  };

  return (
    <div className="card">
      <p className="result-url" style={{ marginBottom: 4 }}>{url.shortUrl}</p>
      <p className="meta" style={{ marginBottom: 8 }}>{url.originalUrl}</p>
      <RiskBadge classification={url.classification} />
      <div className="row" style={{ marginTop: 12 }}>
        <Link to={`/urls/${url.id}`}><button className="secondary">View</button></Link>
        <Link to={`/analytics/${url.id}`}><button className="secondary">Analytics ({url.clicks})</button></Link>
        <button className="secondary" onClick={copy}>Copy</button>
        <button className="secondary" onClick={() => onRequestDelete(url.id)} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
