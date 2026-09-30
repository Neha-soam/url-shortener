import React from 'react';

export default function RiskBadge({ classification }) {
  if (!classification) return null;
  const { scanStatus, isMalicious, riskScore, modelVersion, explanation } = classification;

  if (scanStatus !== 'scanned') return <span className="badge neutral">Not scanned</span>;

  return (
    <div>
      <span className={`badge ${isMalicious ? 'risk' : 'safe'}`}>
        {isMalicious ? 'Suspicious' : 'Looks safe'}
      </span>{' '}
      <span className="meta">risk {riskScore} · model {modelVersion}</span>
      {explanation?.length > 0 && (
        <ul className="explanation">{explanation.map((e) => <li key={e}>{e}</li>)}</ul>
      )}
    </div>
  );
}
