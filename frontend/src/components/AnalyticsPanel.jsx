import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../services/analyticsService.js';
import Loading from './Loading.jsx';
import ErrorMessage from './ErrorMessage.jsx';

const List = ({ title, items }) => (
  <div><b>{title}</b><ul>{items.map((i) => <li key={i.label}>{i.label}: {i.count}</li>)}</ul></div>
);

export default function AnalyticsPanel({ urlId }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');

  const load = () => {
    setStatus('loading');
    getAnalytics(urlId).then((d) => { setData(d); setStatus('ready'); }).catch(() => setStatus('error'));
  };
  useEffect(() => { load(); }, [urlId]);

  if (status === 'loading') return <Loading label="Loading analytics…" />;
  if (status === 'error') return <ErrorMessage message="We couldn't load analytics for this link." onRetry={load} />;

  return (
    <div>
      <p><b>{data.totalClicks}</b> clicks in the last {data.rangeDays} days</p>
      <List title="Clicks per day" items={data.clicksOverTime.map((d) => ({ label: d.date, count: d.count }))} />
      <List title="Devices" items={data.devices} />
      <List title="Browsers" items={data.browsers} />
      <List title="Referrers" items={data.referrers} />
    </div>
  );
}
