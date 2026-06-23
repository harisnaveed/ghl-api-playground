import React, { useState } from 'react';
import { getWorkflows } from '../api/ghlApi';

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

function WorkflowCard({ wf, idx }) {
  const statusColors = {
    published: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', text: 'var(--emerald-light)', icon: '🟢' },
    draft: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: 'var(--amber-light)', icon: '🟡' },
    inactive: { bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', text: 'var(--text-muted)', icon: '⚪' },
  };
  const st = statusColors[wf.status?.toLowerCase()] || statusColors.inactive;

  return (
    <div className="data-card">
      <div className="data-card-header">
        <div className="data-card-avatar" style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.15))',
          border: '1px solid rgba(124,58,237,0.2)',
          fontSize: 20
        }}>
          ⚡
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="data-card-title">{wf.name || 'Unnamed Workflow'}</div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: st.bg, border: `1px solid ${st.border}`, color: st.text
          }}>
            {st.icon} {wf.status || 'unknown'}
          </span>
        </div>
      </div>
      <div className="data-card-fields">
        {wf.createdAt && (
          <div className="data-field">
            <span className="data-field-key">📅 Created</span>
            <span className="data-field-value">{new Date(wf.createdAt).toLocaleDateString()}</span>
          </div>
        )}
        {wf.updatedAt && (
          <div className="data-field">
            <span className="data-field-key">🔄 Updated</span>
            <span className="data-field-value">{new Date(wf.updatedAt).toLocaleDateString()}</span>
          </div>
        )}
        <div className="data-field">
          <span className="data-field-key">🆔 ID</span>
          <span className="data-field-value" style={{ fontSize: 11, opacity: 0.5, display: 'flex', alignItems: 'center' }}>
            {wf.id}
            <CopyButton text={wf.id} />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowsModule({ locationId, token, isConnected }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('cards');

  const workflows = data?.workflows || [];
  const published = workflows.filter(w => w.status?.toLowerCase() === 'published').length;

  async function fetchData() {
    if (!isConnected) return;
    setLoading(true); setError(null); setData(null);
    try { setData(await getWorkflows(locationId, token)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="module-controls">
        <button className={`btn-fetch ${loading ? 'loading' : ''}`} onClick={fetchData} disabled={loading || !isConnected}>
          {loading ? <><div className="spinner" /> Fetching…</> : '⚡ Fetch Workflows'}
        </button>
      </div>

      {error && <div className="error-box"><span className="error-box-icon">⚠️</span><div><strong>Error:</strong> {error}</div></div>}

      {data && (
        <div className="result-area">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="result-count">✅ <span>{workflows.length}</span> workflows</div>
              {published > 0 && <div className="result-count" style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}>🟢 <span style={{ color: 'var(--emerald-light)' }}>{published}</span> published</div>}
            </div>
            <div className="result-tabs">
              <button className={`result-tab ${tab === 'cards' ? 'active' : ''}`} onClick={() => setTab('cards')}>✦ Cards</button>
              <button className={`result-tab ${tab === 'json' ? 'active' : ''}`} onClick={() => setTab('json')}>{'{ }'} JSON</button>
            </div>
          </div>
          {tab === 'cards' ? (
            workflows.length > 0 ? (
              <div className="data-cards">
                {workflows.map((w, i) => <WorkflowCard key={w.id || i} wf={w} idx={i} />)}
              </div>
            ) : <div className="empty-state"><div className="empty-state-icon">⚡</div><p>No workflows found</p></div>
          ) : (
            <div className="json-viewer"><pre>{JSON.stringify(data, null, 2)}</pre></div>
          )}
        </div>
      )}
    </div>
  );
}
