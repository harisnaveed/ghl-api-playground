import React, { useState } from 'react';
import { getTags } from '../api/ghlApi';

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
        fontSize: '10px',
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

const TAG_COLORS = [
  { bg: 'rgba(124, 58, 237, 0.15)', border: 'rgba(124, 58, 237, 0.3)', text: 'var(--violet-light)' },
  { bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.3)', text: 'var(--cyan-light)' },
  { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', text: 'var(--emerald-light)' },
  { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', text: 'var(--amber-light)' },
  { bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.3)', text: 'var(--rose-light)' },
  { bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.3)', text: '#a5b4fc' },
];

export default function TagsModule({ locationId, token, isConnected }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('cards');

  const all = data?.tags || [];
  const filtered = search ? all.filter(t => t.name?.toLowerCase().includes(search.toLowerCase())) : all;

  async function fetchData() {
    if (!isConnected) return;
    setLoading(true); setError(null); setData(null);
    try { setData(await getTags(locationId, token)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="module-controls">
        {all.length > 0 && (
          <div className="input-group" style={{ maxWidth: 240 }}>
            <label>Search Tags</label>
            <input className="module-input" placeholder="Filter…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        )}
        <button className={`btn-fetch ${loading ? 'loading' : ''}`} onClick={fetchData} disabled={loading || !isConnected}>
          {loading ? <><div className="spinner" /> Fetching…</> : '⚡ Fetch Tags'}
        </button>
      </div>

      {error && <div className="error-box"><span className="error-box-icon">⚠️</span><div><strong>Error:</strong> {error}</div></div>}

      {data && (
        <div className="result-area">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="result-count">✅ <span>{filtered.length}</span> tags</div>
            <div className="result-tabs">
              <button className={`result-tab ${tab === 'cards' ? 'active' : ''}`} onClick={() => setTab('cards')}>✦ Cloud</button>
              <button className={`result-tab ${tab === 'json' ? 'active' : ''}`} onClick={() => setTab('json')}>{'{ }'} JSON</button>
            </div>
          </div>
          {tab === 'cards' ? (
            filtered.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '8px 0' }}>
                {filtered.map((tag, i) => {
                  const c = TAG_COLORS[i % TAG_COLORS.length];
                  return (
                    <div
                      key={tag.id || i}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '10px 16px',
                        background: c.bg,
                        border: `1px solid ${c.border}`,
                        borderRadius: 16,
                        color: c.text,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'default',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = `0 4px 16px ${c.border}`; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 600 }}>🏷️ {tag.name}</span>
                        <span style={{ fontSize: 10, opacity: 0.5, fontFamily: 'JetBrains Mono, monospace', display: 'flex', alignItems: 'center', gap: 2 }}>
                          ID: {tag.id}
                          <CopyButton text={tag.id} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <div className="empty-state"><div className="empty-state-icon">🏷️</div><p>No tags found</p></div>
          ) : (
            <div className="json-viewer"><pre>{JSON.stringify(data, null, 2)}</pre></div>
          )}
        </div>
      )}
    </div>
  );
}
