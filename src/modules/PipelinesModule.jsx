import React, { useState } from 'react';
import { getPipelines } from '../api/ghlApi';

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

function PipelineCard({ pipeline, idx }) {
  const gradients = [
    'linear-gradient(135deg, #7c3aed, #6366f1)',
    'linear-gradient(135deg, #06b6d4, #0284c7)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
  ];
  const stages = pipeline.stages || [];

  return (
    <div className="data-card" style={{ gridColumn: '1 / -1' }}>
      <div className="data-card-header" style={{ marginBottom: 14 }}>
        <div className="data-card-avatar" style={{ background: gradients[idx % gradients.length], fontSize: 20 }}>
          🔀
        </div>
        <div>
          <div className="data-card-title">{pipeline.name}</div>
          <div className="data-card-subtitle">{stages.length} stages</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', padding: '3px 8px', background: 'rgba(0,0,0,0.3)', borderRadius: 6 }}>
          {pipeline.id}
          <CopyButton text={pipeline.id} />
        </div>
      </div>

      {stages.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
          {stages.map((stage, i) => (
            <div key={stage.id || i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--glass-border)',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--text-secondary)',
            }}>
              <span style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: gradients[idx % gradients.length],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
                color: 'white',
                flexShrink: 0,
              }}>
                {i + 1}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 600 }}>{stage.name}</span>
                <span style={{ fontSize: 9, opacity: 0.5, fontFamily: 'JetBrains Mono, monospace', display: 'flex', alignItems: 'center' }}>
                  ID: {stage.id}
                  <CopyButton text={stage.id} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PipelinesModule({ locationId, token, isConnected }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('cards');

  const pipelines = data?.pipelines || [];

  async function fetchData() {
    if (!isConnected) return;
    setLoading(true); setError(null); setData(null);
    try { setData(await getPipelines(locationId, token)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="module-controls">
        <button className={`btn-fetch ${loading ? 'loading' : ''}`} onClick={fetchData} disabled={loading || !isConnected}>
          {loading ? <><div className="spinner" /> Fetching…</> : '⚡ Fetch Pipelines'}
        </button>
      </div>

      {error && <div className="error-box"><span className="error-box-icon">⚠️</span><div><strong>Error:</strong> {error}</div></div>}

      {data && (
        <div className="result-area">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="result-count">✅ <span>{pipelines.length}</span> pipelines</div>
            <div className="result-tabs">
              <button className={`result-tab ${tab === 'cards' ? 'active' : ''}`} onClick={() => setTab('cards')}>✦ Cards</button>
              <button className={`result-tab ${tab === 'json' ? 'active' : ''}`} onClick={() => setTab('json')}>{'{ }'} JSON</button>
            </div>
          </div>
          {tab === 'cards' ? (
            pipelines.length > 0 ? (
              <div className="data-cards" style={{ gridTemplateColumns: '1fr' }}>
                {pipelines.map((p, i) => <PipelineCard key={p.id || i} pipeline={p} idx={i} />)}
              </div>
            ) : <div className="empty-state"><div className="empty-state-icon">🔀</div><p>No pipelines found</p></div>
          ) : (
            <div className="json-viewer"><pre>{JSON.stringify(data, null, 2)}</pre></div>
          )}
        </div>
      )}
    </div>
  );
}
