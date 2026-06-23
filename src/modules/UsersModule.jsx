import React, { useState, useEffect } from 'react';
import { getUsers } from '../api/ghlApi';

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

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function UserCard({ user, idx }) {
  const gradients = [
    'linear-gradient(135deg, #7c3aed, #4f46e5)',
    'linear-gradient(135deg, #06b6d4, #0284c7)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #f43f5e, #e11d48)',
    'linear-gradient(135deg, #8b5cf6, #6366f1)',
  ];
  const name = user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unknown';
  return (
    <div className="data-card">
      <div className="data-card-header">
        <div className="data-card-avatar" style={{ background: gradients[idx % gradients.length] }}>
          {user.profilePhoto
            ? <img src={user.profilePhoto} alt={name} style={{ width: '100%', height: '100%', borderRadius: 10, objectFit: 'cover' }} />
            : getInitials(name)
          }
        </div>
        <div>
          <div className="data-card-title">{name}</div>
          <div className="data-card-subtitle">{user.role || 'User'}</div>
        </div>
      </div>
      <div className="data-card-fields">
        {user.email && (
          <div className="data-field">
            <span className="data-field-key">📧 Email</span>
            <span className="data-field-value">{user.email}</span>
          </div>
        )}
        {user.phone && (
          <div className="data-field">
            <span className="data-field-key">📱 Phone</span>
            <span className="data-field-value">{user.phone}</span>
          </div>
        )}
        {user.type && (
          <div className="data-field">
            <span className="data-field-key">🔖 Type</span>
            <span className="data-field-value">
              <span className="tag-chip" style={{ background: 'rgba(6,182,212,0.12)', borderColor: 'rgba(6,182,212,0.25)', color: 'var(--cyan-light)' }}>
                {user.type}
              </span>
            </span>
          </div>
        )}
        <div className="data-field">
          <span className="data-field-key">🆔 ID</span>
          <span className="data-field-value" style={{ fontSize: 11, opacity: 0.5, display: 'flex', alignItems: 'center' }}>
            {user.id}
            <CopyButton text={user.id} />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function UsersModule({ locationId, companyId, token, isConnected }) {
  const [inputCompanyId, setInputCompanyId] = useState(companyId || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('cards');

  useEffect(() => {
    if (companyId) {
      setInputCompanyId(companyId);
    }
  }, [companyId]);

  const users = data?.users || [];

  async function fetchData() {
    if (!isConnected) return;
    if (!inputCompanyId.trim()) {
      setError("Company ID is required. Please enter or verify your Agency-level Company ID.");
      return;
    }
    setLoading(true); setError(null); setData(null);
    try { setData(await getUsers(locationId, inputCompanyId.trim(), token)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="module-controls">
        <div className="input-group" style={{ maxWidth: 300 }}>
          <label>Company ID (Agency Level)</label>
          <input
            className="module-input"
            placeholder="Enter Company ID if not auto-loaded…"
            value={inputCompanyId}
            onChange={e => setInputCompanyId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchData()}
          />
        </div>
        <button className={`btn-fetch ${loading ? 'loading' : ''}`} onClick={fetchData} disabled={loading || !isConnected}>
          {loading ? <><div className="spinner" /> Fetching…</> : '⚡ Fetch Users'}
        </button>
      </div>

      {error && <div className="error-box"><span className="error-box-icon">⚠️</span><div><strong>Error:</strong> {error}</div></div>}

      {data && (
        <div className="result-area">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="result-count">✅ <span>{users.length}</span> users</div>
            <div className="result-tabs">
              <button className={`result-tab ${tab === 'cards' ? 'active' : ''}`} onClick={() => setTab('cards')}>✦ Cards</button>
              <button className={`result-tab ${tab === 'json' ? 'active' : ''}`} onClick={() => setTab('json')}>{'{ }'} JSON</button>
            </div>
          </div>
          {tab === 'cards' ? (
            users.length > 0 ? (
              <div className="data-cards">
                {users.map((u, i) => <UserCard key={u.id || i} user={u} idx={i} />)}
              </div>
            ) : <div className="empty-state"><div className="empty-state-icon">👥</div><p>No users found</p></div>
          ) : (
            <div className="json-viewer"><pre>{JSON.stringify(data, null, 2)}</pre></div>
          )}
        </div>
      )}
    </div>
  );
}
