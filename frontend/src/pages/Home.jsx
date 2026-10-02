import React, { useState } from 'react';
import UrlForm from '../components/UrlForm.jsx';
import RiskBadge from '../components/RiskBadge.jsx';
import ReachabilityBadge from '../components/ReachabilityBadge.jsx';

export default function Home() {
  const [result, setResult] = useState(null);
  return (
    <>
      <div className="intro">
        <h1>Shorten a link</h1>
        <p>Every link is checked for phishing risk and destination reachability before it's created.</p>
      </div>
      <UrlForm onCreated={setResult} />
      {result && (
        <div className="card">
          <p className="result-url">
            <a href={result.shortUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>{result.shortUrl}</a>
          </p>
          <div className="row" style={{ gap: 6 }}>
            <RiskBadge classification={result.classification} />
            <ReachabilityBadge reachability={result.reachability} />
          </div>
        </div>
      )}
    </>
  );
}
