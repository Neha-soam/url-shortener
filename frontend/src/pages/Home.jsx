import React, { useState } from 'react';
import UrlForm from '../components/UrlForm.jsx';
import RiskBadge from '../components/RiskBadge.jsx';

export default function Home() {
  const [result, setResult] = useState(null);
  return (
    <>
      <div className="intro">
        <h1>Shorten a link</h1>
        <p>Every link is checked for phishing risk before it's created.</p>
      </div>
      <UrlForm onCreated={setResult} />
      {result && (
        <div className="card">
          <p className="result-url">
            <a href={result.shortUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>{result.shortUrl}</a>
          </p>
          <RiskBadge classification={result.classification} />
        </div>
      )}
    </>
  );
}
