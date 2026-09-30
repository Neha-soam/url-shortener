import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getUrlById, removeUrl } from '../services/urlService.js';
import RiskBadge from '../components/RiskBadge.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString() : '—');

export default function UrlDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const [url, setUrl] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | not-found | error
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = () => {
    setStatus('loading');
    getUrlById(id)
      .then((u) => { setUrl(u); setStatus('ready'); })
      .catch((e) => setStatus(e.status === 404 ? 'not-found' : 'error'));
  };
  useEffect(() => { load(); }, [id]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(url.shortUrl); showToast('Short URL copied'); }
    catch { showToast('Could not copy — copy it manually', 'error'); }
  };

  const confirmDelete = async () => {
    setConfirmOpen(false);
    setDeleting(true);
    try {
      await removeUrl(id);
      showToast('Link deleted');
      navigate('/dashboard');
    } catch {
      setDeleting(false);
      showToast('Could not delete this link', 'error'); // 403 owner-mismatch lands here too -- don't pretend it worked
    }
  };

  if (status === 'loading') return <Loading />;
  if (status === 'not-found') return <EmptyState message="This link doesn't exist or isn't yours." />;
  if (status === 'error') return <ErrorMessage message="We couldn't load this link." onRetry={load} />;

  return (
    <div className="card">
      <p className="field-label" style={{ marginBottom: 4 }}>Short URL</p>
      <p className="result-url">{url.shortUrl}</p>

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
        <button className="secondary" onClick={copy}>Copy link</button>
        <button className="secondary" onClick={() => setConfirmOpen(true)} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete this link?"
        footer={
          <>
            <button className="secondary" onClick={() => setConfirmOpen(false)}>Cancel</button>
            <button onClick={confirmDelete}>Delete</button>
          </>
        }
      >
        This can't be undone. The short link will stop working immediately.
      </Modal>
    </div>
  );
}
