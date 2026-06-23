import React, { useState } from 'react';
import { getCustomFields } from '../api/ghlApi';

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

const TYPE_ICONS = {
  TEXT: '📝',
  LARGE_TEXT: '📄',
  NUMERICAL: '🔢',
  PHONE: '📱',
  MONETORY: '💰',
  CHECKBOX: '☑️',
  SINGLE_OPTIONS: '⚪',
  MULTIPLE_OPTIONS: '🔵',
  FLOAT: '🔣',
  TIME: '🕐',
  DATE: '📅',
  FILE_UPLOAD: '📁',
  SIGNATURE: '✍️',
  LIST: '📋',
  RADIO: '🔘',
};

function FieldCard({ field }) {
  return (
    <div className="data-card">
      <div className="data-card-header" style={{ alignItems: 'flex-start' }}>
        <div
          className="data-card-avatar"
          style={{ background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.25)', fontSize: 18, marginTop: 2, flexShrink: 0 }}
        >
          {TYPE_ICONS[field.dataType] || '🔤'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="data-card-title" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{field.name}</div>
          <div className="data-card-subtitle">{field.dataType}</div>
        </div>
      </div>
      <div className="data-card-fields">
        {field.fieldKey && (
          <div className="data-field">
            <span className="data-field-key">🔑 Key</span>
            <span className="data-field-value" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, display: 'flex', alignItems: 'center' }}>
              {field.fieldKey}
              <CopyButton text={field.fieldKey} />
            </span>
          </div>
        )}
        {field.placeholder && (
          <div className="data-field">
            <span className="data-field-key">💬 Hint</span>
            <span className="data-field-value">{field.placeholder}</span>
          </div>
        )}
        {field.picklistOptions?.length > 0 && (
          <div className="data-field" style={{ flexDirection: 'column', gap: 4 }}>
            <span className="data-field-key">📋 Options</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {field.picklistOptions.map((opt, i) => (
                <span key={i} className="tag-chip" style={{ background: 'rgba(6,182,212,0.1)', borderColor: 'rgba(6,182,212,0.2)', color: 'var(--cyan-light)' }}>
                  {opt}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="data-field">
          <span className="data-field-key">📍 Pos</span>
          <span className="data-field-value">{field.position ?? '—'}</span>
        </div>
        <div className="data-field">
          <span className="data-field-key">🆔 ID</span>
          <span className="data-field-value" style={{ fontSize: 11, opacity: 0.6, display: 'flex', alignItems: 'center' }}>
            {field.id}
            <CopyButton text={field.id} />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CustomFieldsModule({ locationId, token, isConnected }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('cards');
  const [filterType, setFilterType] = useState('');

  const all = data?.customFields || [];
  const filtered = filterType ? all.filter(f => f.dataType === filterType) : all;
  const types = [...new Set(all.map(f => f.dataType).filter(Boolean))];

  async function fetchData() {
    if (!isConnected) return;
    setLoading(true); setError(null); setData(null);
    try { setData(await getCustomFields(locationId, token)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="module-controls">
        {types.length > 0 && (
          <div className="input-group" style={{ maxWidth: 200 }}>
            <label>Filter by Type</label>
            <select className="module-input" value={filterType} onChange={e => setFilterType(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.04)', cursor: 'pointer' }}>
              <option value="">All Types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}
        <button className={`btn-fetch ${loading ? 'loading' : ''}`} onClick={fetchData} disabled={loading || !isConnected}>
          {loading ? <><div className="spinner" /> Fetching…</> : '⚡ Fetch Custom Fields'}
        </button>
      </div>

      {error && <div className="error-box"><span className="error-box-icon">⚠️</span><div><strong>Error:</strong> {error}</div></div>}

      {data && (
        <div className="result-area">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="result-count">✅ <span>{filtered.length}</span> fields {filterType ? `(${filterType})` : ''}</div>
            <div className="result-tabs">
              <button className={`result-tab ${tab === 'cards' ? 'active' : ''}`} onClick={() => setTab('cards')}>✦ Cards</button>
              <button className={`result-tab ${tab === 'json' ? 'active' : ''}`} onClick={() => setTab('json')}>{'{ }'} JSON</button>
            </div>
          </div>
          {tab === 'cards' ? (
            filtered.length > 0 ? (
              <div className="data-cards">
                {filtered.map((f, i) => <FieldCard key={f.id || i} field={f} />)}
              </div>
            ) : <div className="empty-state"><div className="empty-state-icon">🔤</div><p>No custom fields found</p></div>
          ) : (
            <div className="json-viewer"><pre>{JSON.stringify(data, null, 2)}</pre></div>
          )}
        </div>
      )}
    </div>
  );
}
