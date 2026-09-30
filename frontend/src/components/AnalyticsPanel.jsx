import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../services/analyticsService.js';

const List = ({ title, items }) => (
  <div><b>{title}</b><ul>{items.map((i) => <li key={i.label}>{i.label}: {i.count}</li>)}</ul></div>
);

export default function AnalyticsPanel({ urlId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { getAnalytics(urlId).then(setData).catch((e) => setError(e.message)); }, [urlId]);
  if (error) return <p className="err">{error}</p>;
  if (!data) return <p>Loading…</p>;
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
