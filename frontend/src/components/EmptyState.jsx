import React from 'react';

// e.g. <EmptyState message="No links yet." action={<Link to="/">Create one</Link>} />
export default function EmptyState({ message, action }) {
  return (
    <div className="empty-state">
      <p style={{ margin: action ? '0 0 12px' : 0 }}>{message}</p>
      {action}
    </div>
  );
}
