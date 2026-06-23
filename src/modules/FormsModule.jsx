import React, { useState } from 'react';
import { getForms } from '../api/ghlApi';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '11px',
        opacity: copied ? 1 : 0.5,
        color: copied ? 'var(--emerald-light)' : 'inherit',
        marginLeft: '4px',
        padding: '0 2px',
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle',
      }}
      title="Copy to clipboard"
    >
      {copied ? '✓' : '📋'}
    </button>
  );
}

function FormCard({ form }) {
  return (
    <div className="data-card">
      <div className="data-card-header">
        <div className="data-card-avatar" style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.15))',
          border: '1px solid rgba(99,102,241,0.25)',
          fontSize: 20
        }}>
          📋
        </div>
        <div>
          <div className="data-card-title">{form.name || 'Unnamed Form'}</div>
          <div className="data-card-subtitle">{form.fieldCount ?? 0} fields</div>
        </div>
      </div>
      <div className="data-card-fields">
        {form.description && (
          <div className="data-field">
            <span className="data-field-key">📝 Desc</span>
            <span className="data-field-value">{form.description.slice(0, 60)}…</span>
          </div>
        )}
        {form.steps?.length > 0 && (
          <div className="data-field">
            <span className="data-field-key">🪜 Steps</span>
            <span className="data-field-value">{form.steps.length}</span>
          </div>
        )}
        <div className="data-field">
          <span className="data-field-key">🆔 ID</span>
          <span className="data-field-value" style={{ fontSize: 11, opacity: 0.5, display: 'flex', alignItems: 'center' }}>
            {form.id}
            <CopyButton text={form.id} />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function FormsModule({ locationId, token, isConnected }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('cards');

  const forms = data?.forms || [];

  async function fetchData() {
    if (!isConnected) return;
    setLoading(true); setError(null); setData(null);
    try { setData(await getForms(locationId, token)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="module-controls">
        <button className={`btn-fetch ${loading ? 'loading' : ''}`} onClick={fetchData} disabled={loading || !isConnected}>
          {loading ? <><div className="spinner" /> Fetching…</> : '⚡ Fetch Forms'}
        </button>
      </div>

      {error && <div className="error-box"><span className="error-box-icon">⚠️</span><div><strong>Error:</strong> {error}</div></div>}

      {data && (
        <div className="result-area">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="result-count">✅ <span>{forms.length}</span> forms</div>
            <div className="result-tabs">
              <button className={`result-tab ${tab === 'cards' ? 'active' : ''}`} onClick={() => setTab('cards')}>✦ Cards</button>
              <button className={`result-tab ${tab === 'json' ? 'active' : ''}`} onClick={() => setTab('json')}>{'{ }'} JSON</button>
            </div>
          </div>
          {tab === 'cards' ? (
            forms.length > 0 ? (
              <div className="data-cards">
                {forms.map((f, i) => <FormCard key={f.id || i} form={f} />)}
              </div>
            ) : <div className="empty-state"><div className="empty-state-icon">📋</div><p>No forms found</p></div>
          ) : (
            <div className="json-viewer"><pre>{JSON.stringify(data, null, 2)}</pre></div>
          )}
        </div>
      )}
    </div>
  );
}
