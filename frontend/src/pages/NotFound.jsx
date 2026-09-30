import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="empty-state" style={{ marginTop: 40 }}>
      <p style={{ marginBottom: 12 }}>We couldn't find that page.</p>
      <Link to="/"><button className="secondary">Back to home</button></Link>
    </div>
  );
}
