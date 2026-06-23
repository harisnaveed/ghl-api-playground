import React, { useState } from 'react';
import { getCustomValues } from '../api/ghlApi';

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

function ValueCard({ customValue }) {
  return (
    <div className="data-card">
      <div className="data-card-header" style={{ alignItems: 'flex-start' }}>
        <div
          className="data-card-avatar"
          style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.25)', fontSize: 18, marginTop: 2, flexShrink: 0 }}
        >
          💎
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="data-card-title" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
            {customValue.name || 'Unnamed Custom Value'}
          </div>
          <div className="data-card-subtitle" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, wordBreak: 'break-all', whiteSpace: 'normal', marginTop: 4 }}>
            {customValue.fieldKey}
          </div>
        </div>
      </div>
      <div className="data-card-fields">
        <div className="data-field" style={{ flexDirection: 'column', gap: 4, alignItems: 'stretch' }}>
          <span className="data-field-key">📄 Value</span>
          <div style={{
            background: 'rgba(0,0,0,0.2)',
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid var(--glass-border)',
            fontSize: 12,
            color: 'var(--text-secondary)',
            wordBreak: 'break-all',
            minHeight: 32,
          }}>
            {customValue.value !== undefined && customValue.value !== null ? String(customValue.value) : <span style={{ opacity: 0.4 }}>— Empty —</span>}
          </div>
        </div>
        <div className="data-field">
          <span className="data-field-key">🆔 ID</span>
          <span className="data-field-value" style={{ fontSize: 11, opacity: 0.6, display: 'flex', alignItems: 'center' }}>
            {customValue.id}
            <CopyButton text={customValue.id} />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CustomValuesModule({ locationId, token, isConnected }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('cards');
  const [search, setSearch] = useState('');

  const all = data?.customValues || [];
  const filtered = search
    ? all.filter(
        v =>
          (v.name && v.name.toLowerCase().includes(search.toLowerCase())) ||
          (v.fieldKey && v.fieldKey.toLowerCase().includes(search.toLowerCase()))
      )
    : all;

  async function fetchData() {
    if (!isConnected) return;
    setLoading(true); setError(null); setData(null);
    try {
      setData(await getCustomValues(locationId, token));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="module-controls">
        <div className="input-group" style={{ maxWidth: 240 }}>
          <label>Search Custom Values</label>
          <input
            className="module-input"
            placeholder="Filter by name or key…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className={`btn-fetch ${loading ? 'loading' : ''}`} onClick={fetchData} disabled={loading || !isConnected}>
          {loading ? <><div className="spinner" /> Fetching…</> : '⚡ Fetch Custom Values'}
        </button>
      </div>

      {error && <div className="error-box"><span className="error-box-icon">⚠️</span><div><strong>Error:</strong> {error}</div></div>}

      {data && (
        <div className="result-area">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="result-count">
              ✅ Found <span>{filtered.length}</span> custom values
            </div>
            <div className="result-tabs">
              <button className={`result-tab ${tab === 'cards' ? 'active' : ''}`} onClick={() => setTab('cards')}>✦ Cards</button>
              <button className={`result-tab ${tab === 'json' ? 'active' : ''}`} onClick={() => setTab('json')}>{'{ }'} JSON</button>
            </div>
          </div>
          {tab === 'cards' ? (
            filtered.length > 0 ? (
              <div className="data-cards">
                {filtered.map((val, i) => <ValueCard key={val.id || i} customValue={val} />)}
              </div>
            ) : <div className="empty-state"><div className="empty-state-icon">💎</div><p>No custom values found</p></div>
          ) : (
            <div className="json-viewer"><pre>{JSON.stringify(data, null, 2)}</pre></div>
          )}
        </div>
      )}
    </div>
  );
}
