import React from 'react';

// Consistent error copy across the app (CLAUDE.md section 19: never show raw
// backend stack traces). Pass a short, human message; developer detail belongs in logs.
export default function ErrorMessage({ message = "Something went wrong. Please try again.", onRetry }) {
  return (
    <div className="err" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button className="secondary" style={{ marginLeft: 10 }} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
