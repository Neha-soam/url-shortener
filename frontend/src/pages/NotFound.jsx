import React from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';

export default function NotFound() {
  return (
    <div style={{ marginTop: 40 }}>
      <EmptyState
        message="We couldn't find that page."
        action={<Link to="/"><button className="secondary">Back to home</button></Link>}
      />
    </div>
  );
}
