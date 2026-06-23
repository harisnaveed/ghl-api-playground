import React, { useState } from 'react';
import { getCalendars } from '../api/ghlApi';

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

function CalendarCard({ cal, idx }) {
  const colors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#6366f1'];
  const color = cal.eventColor || colors[idx % colors.length];
  return (
    <div className="data-card">
      <div className="data-card-header">
        <div
          className="data-card-avatar"
          style={{ background: `linear-gradient(135deg, ${color}cc, ${color}66)`, border: `1px solid ${color}44`, fontSize: 20 }}
        >
          📅
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="data-card-title">{cal.name || 'Unnamed Calendar'}</div>
          <div className="data-card-subtitle">{cal.calendarType || 'Standard'}</div>
        </div>
      </div>
      <div className="data-card-fields">
        {cal.description && (
          <div className="data-field">
            <span className="data-field-key">📝 Desc</span>
            <span className="data-field-value" style={{ opacity: 0.8 }}>{cal.description.slice(0, 80)}{cal.description.length > 80 ? '…' : ''}</span>
          </div>
        )}
        {cal.slug && (
          <div className="data-field">
            <span className="data-field-key">🔗 Slug</span>
            <span className="data-field-value" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{cal.slug}</span>
          </div>
        )}
        {cal.eventTitle && (
          <div className="data-field">
            <span className="data-field-key">📌 Title</span>
            <span className="data-field-value">{cal.eventTitle}</span>
          </div>
        )}
        {cal.slotDuration && (
          <div className="data-field">
            <span className="data-field-key">⏱ Slot</span>
            <span className="data-field-value">{cal.slotDuration} min</span>
          </div>
        )}
        <div className="data-field">
          <span className="data-field-key">🎨 Color</span>
          <span className="data-field-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
            {color}
          </span>
        </div>
        <div className="data-field">
          <span className="data-field-key">🆔 ID</span>
          <span className="data-field-value" style={{ fontSize: 11, opacity: 0.5, display: 'flex', alignItems: 'center' }}>
            {cal.id}
            <CopyButton text={cal.id} />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CalendarsModule({ locationId, token, isConnected }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('cards');

  const calendars = data?.calendars || [];

  async function fetchData() {
    if (!isConnected) return;
    setLoading(true); setError(null); setData(null);
    try { setData(await getCalendars(locationId, token)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="module-controls">
        <button className={`btn-fetch ${loading ? 'loading' : ''}`} onClick={fetchData} disabled={loading || !isConnected}>
          {loading ? <><div className="spinner" /> Fetching…</> : '⚡ Fetch Calendars'}
        </button>
      </div>

      {error && <div className="error-box"><span className="error-box-icon">⚠️</span><div><strong>Error:</strong> {error}</div></div>}

      {data && (
        <div className="result-area">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="result-count">✅ <span>{calendars.length}</span> calendars</div>
            <div className="result-tabs">
              <button className={`result-tab ${tab === 'cards' ? 'active' : ''}`} onClick={() => setTab('cards')}>✦ Cards</button>
              <button className={`result-tab ${tab === 'json' ? 'active' : ''}`} onClick={() => setTab('json')}>{'{ }'} JSON</button>
            </div>
          </div>
          {tab === 'cards' ? (
            calendars.length > 0 ? (
              <div className="data-cards">
                {calendars.map((c, i) => <CalendarCard key={c.id || i} cal={c} idx={i} />)}
              </div>
            ) : <div className="empty-state"><div className="empty-state-icon">📅</div><p>No calendars found</p></div>
          ) : (
            <div className="json-viewer"><pre>{JSON.stringify(data, null, 2)}</pre></div>
          )}
        </div>
      )}
    </div>
  );
}
