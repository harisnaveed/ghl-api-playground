import React, { useState } from 'react';
import { getContacts } from '../api/ghlApi';

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

const GRADIENT_COLORS = [
  'linear-gradient(135deg, #7c3aed, #4f46e5)',
  'linear-gradient(135deg, #06b6d4, #0284c7)',
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #f43f5e, #e11d48)',
  'linear-gradient(135deg, #8b5cf6, #7c3aed)',
];

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function ContactCard({ contact, idx }) {
  const gradient = GRADIENT_COLORS[idx % GRADIENT_COLORS.length];
  const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'No Name';
  return (
    <div className="data-card">
      <div className="data-card-header">
        <div className="data-card-avatar" style={{ background: gradient }}>
          {getInitials(name)}
        </div>
        <div>
          <div className="data-card-title">{name}</div>
          <div className="data-card-subtitle">{contact.email || 'No email'}</div>
        </div>
      </div>
      <div className="data-card-fields">
        {contact.phone && (
          <div className="data-field">
            <span className="data-field-key">📱 Phone</span>
            <span className="data-field-value">{contact.phone}</span>
          </div>
        )}
        {contact.address1 && (
          <div className="data-field">
            <span className="data-field-key">📍 Addr</span>
            <span className="data-field-value">{contact.address1}, {contact.city}</span>
          </div>
        )}
        {contact.source && (
          <div className="data-field">
            <span className="data-field-key">🔗 Source</span>
            <span className="data-field-value">{contact.source}</span>
          </div>
        )}
        {contact.tags?.length > 0 && (
          <div className="data-field" style={{ flexDirection: 'column', gap: 4 }}>
            <span className="data-field-key">🏷️ Tags</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {contact.tags.map(tag => (
                <span key={tag} className="tag-chip">{tag}</span>
              ))}
            </div>
          </div>
        )}
        <div className="data-field">
          <span className="data-field-key">🆔 ID</span>
          <span className="data-field-value" style={{ fontSize: 11, opacity: 0.6, display: 'flex', alignItems: 'center' }}>
            {contact.id}
            <CopyButton text={contact.id} />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ContactsModule({ locationId, token, isConnected }) {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState('20');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('cards');

  const contacts = data?.contacts || [];

  async function fetchContacts() {
    if (!isConnected) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await getContacts(locationId, token, query, parseInt(limit));
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="module-controls">
        <div className="input-group" style={{ maxWidth: 300 }}>
          <label>Search Query</label>
          <input
            className="module-input"
            placeholder="Name, email, phone…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchContacts()}
          />
        </div>
        <div className="input-group" style={{ maxWidth: 100 }}>
          <label>Limit</label>
          <input
            className="module-input"
            type="number"
            min="1"
            max="100"
            value={limit}
            onChange={e => setLimit(e.target.value)}
          />
        </div>
        <button
          className={`btn-fetch ${loading ? 'loading' : ''}`}
          onClick={fetchContacts}
          disabled={loading || !isConnected}
        >
          {loading ? <><div className="spinner" /> Fetching…</> : '⚡ Fetch Contacts'}
        </button>
      </div>

      {error && (
        <div className="error-box">
          <span className="error-box-icon">⚠️</span>
          <div><strong>Error:</strong> {error}</div>
        </div>
      )}

      {data && (
        <div className="result-area">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="result-count">
              ✅ Found <span>{contacts.length}</span> contacts
              {data.total ? ` of ${data.total} total` : ''}
            </div>
            <div className="result-tabs">
              <button className={`result-tab ${tab === 'cards' ? 'active' : ''}`} onClick={() => setTab('cards')}>✦ Cards</button>
              <button className={`result-tab ${tab === 'json' ? 'active' : ''}`} onClick={() => setTab('json')}>{'{ }'} JSON</button>
            </div>
          </div>

          {tab === 'cards' ? (
            contacts.length > 0 ? (
              <div className="data-cards">
                {contacts.map((c, i) => <ContactCard key={c.id || i} contact={c} idx={i} />)}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">👤</div>
                <p>No contacts found</p>
              </div>
            )
          ) : (
            <div className="json-viewer">
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
