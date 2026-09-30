import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUrlById } from '../services/urlService.js';
import AnalyticsPanel from '../components/AnalyticsPanel.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Analytics() {
  const { id } = useParams();
  const [url, setUrl] = useState(null);
  const [status, setStatus] = useState('loading');

  const load = () => {
    setStatus('loading');
    getUrlById(id)
      .then((u) => { setUrl(u); setStatus('ready'); })
      .catch((e) => setStatus(e.status === 404 ? 'not-found' : 'error'));
  };
  useEffect(() => { load(); }, [id]);

  if (status === 'loading') return <Loading />;
  if (status === 'not-found') return <EmptyState message="This link doesn't exist or isn't yours." />;
  if (status === 'error') return <ErrorMessage message="We couldn't load this link." onRetry={load} />;

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
