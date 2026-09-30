import React, { useEffect, useState } from 'react';
import { myUrls, removeUrl } from '../services/urlService.js';
import UrlCard from '../components/UrlCard.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [busyId, setBusyId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const showToast = useToast();

  const load = () => {
    setStatus('loading');
    myUrls()
      .then((u) => { setUrls(u); setStatus('ready'); })
      .catch(() => setStatus('error'));
  };
  useEffect(() => { load(); }, []);

  const confirmDelete = async () => {
    const id = confirmId;
    setConfirmId(null);
    setBusyId(id);
    try {
      await removeUrl(id);
      showToast('Link deleted');
      load();
    } catch {
      showToast('Could not delete this link', 'error');
    } finally {
      setBusyId(null);
    }
  };

  if (status === 'loading') return <Loading label="Loading your links…" />;
  if (status === 'error') return <ErrorMessage message="We couldn't load your links." onRetry={load} />;
  if (!urls.length) return <EmptyState message="No links yet. Create one from the Home page." />;

  return (
    <>
      {urls.map((u) => (
        <UrlCard key={u.id} url={u} onRequestDelete={setConfirmId} deleting={busyId === u.id} />
      ))}
      <Modal
        open={Boolean(confirmId)}
        onClose={() => setConfirmId(null)}
        title="Delete this link?"
        footer={
          <>
            <button className="secondary" onClick={() => setConfirmId(null)}>Cancel</button>
            <button onClick={confirmDelete}>Delete</button>
          </>
        }
      >
        This can't be undone. The short link will stop working immediately.
      </Modal>
    </>
  );
}
