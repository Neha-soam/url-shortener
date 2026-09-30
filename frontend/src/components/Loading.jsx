import React from 'react';

// One place for the loading visual so every page looks the same while fetching.
export default function Loading({ label = 'Loading…' }) {
  return (
    <div className="loading-row" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
