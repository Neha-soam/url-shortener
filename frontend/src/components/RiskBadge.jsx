import React from 'react';

export default function RiskBadge({ classification }) {
  if (!classification) return null;
  const { scanStatus, isMalicious, riskScore, modelVersion, explanation } = classification;
  if (scanStatus !== 'scanned') return <span className="badge" style={{ background: '#6b7280' }}>Not scanned</span>;
  return (
    <div>
      <span className="badge" style={{ background: isMalicious ? '#dc2626' : '#16a34a' }}>
        {isMalicious ? 'Suspicious' : 'Looks safe'}
      </span>{' '}
      <small>risk {riskScore} · model {modelVersion}</small>
      {explanation?.length > 0 && <ul>{explanation.map((e) => <li key={e}>{e}</li>)}</ul>}
    </div>
  );
}
