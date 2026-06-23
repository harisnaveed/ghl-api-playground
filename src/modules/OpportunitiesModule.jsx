import React, { useState } from 'react';
import { getOpportunities } from '../api/ghlApi';

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

function statusClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'won') return 'status-won';
  if (s === 'lost') return 'status-lost';
  if (s === 'abandoned') return 'status-abandoned';
  return 'status-open';
}

function statusEmoji(status) {
  const s = (status || '').toLowerCase();
  if (s === 'won') return '🏆';
  if (s === 'lost') return '❌';
  if (s === 'abandoned') return '⚠️';
  return '🔵';
}

function formatMoney(val) {
  if (!val && val !== 0) return '—';
  return `$${Number(val).toLocaleString()}`;
}

function OppCard({ opp, idx }) {
  const gradients = [
    'linear-gradient(135deg, #7c3aed, #4f46e5)',
    'linear-gradient(135deg, #06b6d4, #0ea5e9)',
    'linear-gradient(135deg, #10b981, #14b8a6)',
    'linear-gradient(135deg, #f59e0b, #f97316)',
  ];
  return (
    <div className="data-card">
      <div className="data-card-header">
        <div
          className="data-card-avatar"
          style={{ background: gradients[idx % gradients.length], fontSize: 18 }}
        >
          💼
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="data-card-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {opp.name || 'Unnamed Opportunity'}
          </div>
          <span className={`status-badge ${statusClass(opp.status)}`}>
            {statusEmoji(opp.status)} {opp.status || 'open'}
          </span>
        </div>
      </div>
      <div className="data-card-fields">
        <div className="data-field">
          <span className="data-field-key">💰 Value</span>
          <span className="data-field-value" style={{ color: 'var(--emerald-light)', fontWeight: 600 }}>
            {formatMoney(opp.monetaryValue)}
          </span>
        </div>
        {opp.pipelineName && (
          <div className="data-field">
            <span className="data-field-key">🔀 Pipeline</span>
            <span className="data-field-value">{opp.pipelineName}</span>
          </div>
        )}
        {opp.pipelineStageName && (
          <div className="data-field">
            <span className="data-field-key">📌 Stage</span>
            <span className="data-field-value">{opp.pipelineStageName}</span>
          </div>
        )}
        {opp.contact?.name && (
          <div className="data-field">
            <span className="data-field-key">👤 Contact</span>
            <span className="data-field-value">{opp.contact.name}</span>
          </div>
        )}
        {opp.assignedTo && (
          <div className="data-field">
            <span className="data-field-key">🧑 Owner</span>
            <span className="data-field-value">{opp.assignedTo}</span>
          </div>
        )}
        {opp.closeDate && (
          <div className="data-field">
            <span className="data-field-key">📅 Close</span>
            <span className="data-field-value">{new Date(opp.closeDate).toLocaleDateString()}</span>
          </div>
        )}
        <div className="data-field">
          <span className="data-field-key">🆔 ID</span>
          <span className="data-field-value" style={{ fontSize: 11, opacity: 0.6, display: 'flex', alignItems: 'center' }}>
            {opp.id}
            <CopyButton text={opp.id} />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function OpportunitiesModule({ locationId, token, isConnected }) {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState('20');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('cards');

  const opps = data?.opportunities || [];
  const totalValue = opps.reduce((sum, o) => sum + (Number(o.monetaryValue) || 0), 0);

  async function fetchData() {
    if (!isConnected) return;
    setLoading(true); setError(null); setData(null);
    try {
      const res = await getOpportunities(locationId, token, query, parseInt(limit));
      setData(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="module-controls">
        <div className="input-group" style={{ maxWidth: 280 }}>
          <label>Search</label>
          <input className="module-input" placeholder="Opportunity name…" value={query}
            onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchData()} />
        </div>
        <div className="input-group" style={{ maxWidth: 100 }}>
          <label>Limit</label>
          <input className="module-input" type="number" min="1" max="100" value={limit}
            onChange={e => setLimit(e.target.value)} />
        </div>
        <button className={`btn-fetch ${loading ? 'loading' : ''}`} onClick={fetchData} disabled={loading || !isConnected}>
          {loading ? <><div className="spinner" /> Fetching…</> : '⚡ Fetch Opportunities'}
        </button>
      </div>

      {error && <div className="error-box"><span className="error-box-icon">⚠️</span><div><strong>Error:</strong> {error}</div></div>}

      {data && (
        <div className="result-area">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div className="result-count">✅ <span>{opps.length}</span> opportunities</div>
              {totalValue > 0 && (
                <div className="result-count" style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}>
                  💰 Total: <span style={{ color: 'var(--emerald-light)' }}>${totalValue.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="result-tabs">
              <button className={`result-tab ${tab === 'cards' ? 'active' : ''}`} onClick={() => setTab('cards')}>✦ Cards</button>
              <button className={`result-tab ${tab === 'json' ? 'active' : ''}`} onClick={() => setTab('json')}>{'{ }'} JSON</button>
            </div>
          </div>
          {tab === 'cards' ? (
            opps.length > 0 ? (
              <div className="data-cards">
                {opps.map((o, i) => <OppCard key={o.id || i} opp={o} idx={i} />)}
              </div>
            ) : <div className="empty-state"><div className="empty-state-icon">💼</div><p>No opportunities found</p></div>
          ) : (
            <div className="json-viewer"><pre>{JSON.stringify(data, null, 2)}</pre></div>
          )}
        </div>
      )}
    </div>
  );
}
