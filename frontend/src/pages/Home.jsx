import React, { useState } from 'react';
import UrlForm from '../components/UrlForm.jsx';
import RiskBadge from '../components/RiskBadge.jsx';

export default function Home() {
  const [result, setResult] = useState(null);
  return (
    <>
      <UrlForm onCreated={setResult} />
      {result && (
        <div className="card">
          <p>Short URL: <a href={result.shortUrl} target="_blank" rel="noreferrer">{result.shortUrl}</a></p>
          <RiskBadge classification={result.classification} />
        </div>
      )}
    </>
  );
}
