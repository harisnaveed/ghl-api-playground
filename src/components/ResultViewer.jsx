import React, { useState } from 'react';

export default function ResultViewer({ data, loading, error }) {
  const [tab, setTab] = useState('cards');

  if (loading) {
    return (
      <div className="result-area">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0', color: 'var(--text-muted)' }}>
          <div className="spinner" />
          <span style={{ fontSize: 13 }}>Fetching from GHL API…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result-area">
        <div className="error-box">
          <span className="error-box-icon">⚠️</span>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 3 }}>API Error</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const jsonStr = JSON.stringify(data, null, 2);

  return (
    <div className="result-area">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="result-tabs">
          <button
            className={`result-tab ${tab === 'cards' ? 'active' : ''}`}
            onClick={() => setTab('cards')}
          >
            ✦ Cards
          </button>
          <button
            className={`result-tab ${tab === 'json' ? 'active' : ''}`}
            onClick={() => setTab('json')}
          >
            {'{ }'} Raw JSON
          </button>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(jsonStr)}
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 8,
            color: 'var(--text-muted)',
            fontSize: 11,
            padding: '4px 10px',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.target.style.color = 'var(--violet-light)')}
          onMouseLeave={e => (e.target.style.color = 'var(--text-muted)')}
        >
          📋 Copy JSON
        </button>
      </div>

      {tab === 'json' ? (
        <div className="json-viewer">
          <pre>{jsonStr}</pre>
        </div>
      ) : (
        <div className="json-viewer">
          <pre>{jsonStr}</pre>
        </div>
      )}
    </div>
  );
}
