import React, { useState, useCallback } from 'react';
import './index.css';
import { getLocation } from './api/ghlApi';
import ContactsModule from './modules/ContactsModule';
import OpportunitiesModule from './modules/OpportunitiesModule';
import CalendarsModule from './modules/CalendarsModule';
import PipelinesModule from './modules/PipelinesModule';
import CustomFieldsModule from './modules/CustomFieldsModule';
import CustomValuesModule from './modules/CustomValuesModule';
import TagsModule from './modules/TagsModule';
import UsersModule from './modules/UsersModule';
import WorkflowsModule from './modules/WorkflowsModule';
import FormsModule from './modules/FormsModule';
import ConversationsModule from './modules/ConversationsModule';

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

// ─── Navigation Config ───────────────────────────────────────────
const NAV_ITEMS = [
  {
    group: 'Core',
    items: [
      { id: 'overview', label: 'Overview', icon: '⬡', desc: 'Dashboard & location info' },
    ],
  },
  {
    group: 'CRM',
    items: [
      { id: 'contacts', label: 'Contacts', icon: '👤', desc: 'Browse contacts', method: 'GET', endpoint: '/contacts' },
      { id: 'opportunities', label: 'Opportunities', icon: '💼', desc: 'Sales pipeline deals', method: 'GET', endpoint: '/opportunities/search' },
      { id: 'pipelines', label: 'Pipelines', icon: '🔀', desc: 'Pipeline stages', method: 'GET', endpoint: '/opportunities/pipelines' },
      { id: 'conversations', label: 'Conversations', icon: '💬', desc: 'Search and create conversations', method: 'GET/POST', endpoint: '/conversations/search' },
    ],
  },
  {
    group: 'Marketing',
    items: [
      { id: 'calendars', label: 'Calendars', icon: '📅', desc: 'Booking calendars', method: 'GET', endpoint: '/calendars/' },
      { id: 'workflows', label: 'Workflows', icon: '⚡', desc: 'Automation workflows', method: 'GET', endpoint: '/workflows/' },
      { id: 'forms', label: 'Forms', icon: '📋', desc: 'Landing page forms', method: 'GET', endpoint: '/forms/' },
    ],
  },
  {
    group: 'Settings',
    items: [
      { id: 'custom-fields', label: 'Custom Fields', icon: '🔤', desc: 'Contact custom fields', method: 'GET', endpoint: '/locations/:locationId/customFields' },
      { id: 'custom-values', label: 'Custom Values', icon: '💎', desc: 'Location custom values', method: 'GET', endpoint: '/locations/:locationId/customValues' },
      { id: 'tags', label: 'Tags', icon: '🏷️', desc: 'Contact tags', method: 'GET', endpoint: '/locations/:locationId/tags' },
      { id: 'users', label: 'Users', icon: '👥', desc: 'Team members', method: 'GET', endpoint: '/users/search' },
    ],
  },
];

// ─── Sidebar ─────────────────────────────────────────────────────
function Sidebar({ activeId, onSelect, isConnected, locationName, isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="sidebar-logo-inner">
          <div className="sidebar-logo-icon">🚀</div>
          <div className="sidebar-logo-text">
            <h1>GHL Platform</h1>
            <p>API Dashboard</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="sidebar-close-btn"
          title="Close Navigation Menu"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--glass-border)',
            borderRadius: '50%',
            width: 28,
            height: 28,
            cursor: 'pointer',
            color: 'var(--rose-light)',
            display: 'none', // Show/hide using media queries
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            transition: 'all 0.2s',
          }}
        >
          ✕
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(group => (
          <div key={group.group}>
            <div className="sidebar-section-label">{group.group}</div>
            {group.items.map(item => (
              <div
                key={item.id}
                className={`nav-item ${activeId === item.id ? 'active' : ''}`}
                onClick={() => onSelect(item.id)}
              >
                <div className="nav-item-icon">{item.icon}</div>
                {item.label}
                {item.method && (
                  <span className={`nav-item-badge`} style={{
                    background: item.method === 'POST' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                    color: item.method === 'POST' ? 'var(--amber-light)' : 'var(--emerald-light)',
                    border: item.method === 'POST' ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(16,185,129,0.3)',
                  }}>
                    {item.method}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <div className={`status-dot ${isConnected ? '' : 'inactive'}`} />
          <div className="status-text">
            {isConnected ? (locationName || 'Connected') : 'Not connected'}
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Module Wrapper Card ──────────────────────────────────────────
function ModuleCard({ item, isConnected, locationId, token }) {
  const [expanded, setExpanded] = useState(false);

  const MODULE_MAP = {
    contacts: ContactsModule,
    opportunities: OpportunitiesModule,
    pipelines: PipelinesModule,
    calendars: CalendarsModule,
    'custom-fields': CustomFieldsModule,
    'custom-values': CustomValuesModule,
    tags: TagsModule,
    users: UsersModule,
    workflows: WorkflowsModule,
    forms: FormsModule,
    conversations: ConversationsModule,
  };

  const ICON_BG = {
    contacts: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(99,102,241,0.15))',
    opportunities: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.1))',
    pipelines: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(99,102,241,0.1))',
    calendars: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(244,63,94,0.1))',
    workflows: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(244,63,94,0.1))',
    forms: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.1))',
    'custom-fields': 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(99,102,241,0.1))',
    'custom-values': 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(244,63,94,0.1))',
    tags: 'linear-gradient(135deg, rgba(244,63,94,0.18), rgba(245,158,11,0.1))',
    users: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(16,185,129,0.1))',
    conversations: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(124,58,237,0.15))',
  };

  const ModuleComponent = MODULE_MAP[item.id];

  return (
    <div className={`module-card ${expanded ? 'expanded' : ''}`}>
      <div className="module-card-header" onClick={() => setExpanded(e => !e)}>
        <div className="module-header-icon" style={{ background: ICON_BG[item.id] || 'var(--glass-bg)' }}>
          {item.icon}
        </div>
        <div className="module-header-info">
          <h3>{item.label}</h3>
          <p>{item.desc}</p>
          {item.endpoint && (
            <div className="endpoint-pill">
              <span style={{ fontSize: 9, opacity: 0.6 }}>services.leadconnectorhq.com</span>
              {item.endpoint}
            </div>
          )}
        </div>
        <div className="module-header-meta">
          {item.method && (
            <span className={`method-badge ${item.method === 'POST' ? 'method-post' : 'method-get'}`}>
              {item.method}
            </span>
          )}
          <span className="expand-icon">⌄</span>
        </div>
      </div>

      {expanded && (
        <div className="module-body">
          {!isConnected && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 10,
              fontSize: 13,
              color: 'var(--amber-light)',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              ⚠️ Enter your Location ID and Bearer Token above to fetch data.
            </div>
          )}
          {ModuleComponent && (
            <ModuleComponent locationId={locationId} token={token} isConnected={isConnected} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Overview Page ────────────────────────────────────────────────
function OverviewPage({ locationId, token, isConnected, locationData, locLoading, locError }) {
  const STAT_CARDS = [
    { label: 'Contacts', icon: '👤', color: '#7c3aed', gradient: 'linear-gradient(90deg, #7c3aed, #4f46e5)', iconBg: 'rgba(124,58,237,0.15)' },
    { label: 'Opportunities', icon: '💼', color: '#10b981', gradient: 'linear-gradient(90deg, #10b981, #06b6d4)', iconBg: 'rgba(16,185,129,0.15)' },
    { label: 'Pipelines', icon: '🔀', color: '#06b6d4', gradient: 'linear-gradient(90deg, #06b6d4, #6366f1)', iconBg: 'rgba(6,182,212,0.15)' },
    { label: 'Calendars', icon: '📅', color: '#f59e0b', gradient: 'linear-gradient(90deg, #f59e0b, #f43f5e)', iconBg: 'rgba(245,158,11,0.15)' },
    { label: 'Workflows', icon: '⚡', color: '#f43f5e', gradient: 'linear-gradient(90deg, #8b5cf6, #f43f5e)', iconBg: 'rgba(244,63,94,0.15)' },
    { label: 'Users', icon: '👥', color: '#6366f1', gradient: 'linear-gradient(90deg, #6366f1, #7c3aed)', iconBg: 'rgba(99,102,241,0.15)' },
  ];

  if (!isConnected) {
    return (
      <div className="welcome-screen">
        <div className="welcome-icon">🚀</div>
        <h2>GHL API Dashboard</h2>
        <p>Enter your GoHighLevel Location ID and Bearer Token in the top bar to get started exploring your platform data.</p>
        <div className="welcome-steps">
          {[
            { num: 1, text: 'Paste your Location ID' },
            { num: 2, text: 'Add your Bearer Token' },
            { num: 3, text: 'Hit Connect & explore!' },
          ].map(s => (
            <div className="welcome-step" key={s.num}>
              <div className="welcome-step-num">{s.num}</div>
              {s.text}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          🔒 Your credentials are stored in session only and never sent to any third-party server.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Location Info */}
      {locLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0', color: 'var(--text-muted)', marginBottom: 20 }}>
          <div className="spinner" />
          <span>Loading location info…</span>
        </div>
      )}
      {locError && (
        <div className="error-box" style={{ marginBottom: 20 }}>
          <span className="error-box-icon">⚠️</span>
          <div><strong>Location Error:</strong> {locError}</div>
        </div>
      )}
      {locationData && (
        <div className="location-info-card">
          <div className="location-avatar">🏢</div>
          <div className="location-details">
            <h3>{locationData.name || locationId}</h3>
            <p>{locationData.email || ''} {locationData.phone ? `• ${locationData.phone}` : ''}</p>
            {(locationData.address || locationData.city) && (
              <p style={{ marginTop: 2 }}>
                📍 {[locationData.address, locationData.city, locationData.state, locationData.country].filter(Boolean).join(', ')}
              </p>
            )}
            <div className="location-meta-chips">
              {locationData.timezone && <div className="meta-chip">🕐 {locationData.timezone}</div>}
              {locationData.website && <div className="meta-chip">🌐 {locationData.website.replace(/^https?:\/\//, '')}</div>}
              {locationData.plan?.name && <div className="meta-chip">💎 {locationData.plan.name}</div>}
              <div className="meta-chip" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, display: 'flex', alignItems: 'center' }}>
                🆔 {locationId}
                <CopyButton text={locationId} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="dashboard-header">
        <h2>API Modules</h2>
        <p>Click any module below to expand and fetch data from the GHL API</p>
      </div>

      <div className="stats-grid">
        {STAT_CARDS.map(card => (
          <div key={card.label} className="stat-card" style={{ '--card-gradient': card.gradient, '--icon-bg': card.iconBg }}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-value" style={{ color: card.color, fontSize: 20, fontWeight: 700 }}>{card.label}</div>
            <div className="stat-label">Click in sidebar →</div>
          </div>
        ))}
      </div>

      {/* Quick Info */}
      <div style={{ marginTop: 8 }}>
        <div className="section-title">API Endpoint Reference</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {NAV_ITEMS.flatMap(g => g.items.filter(i => i.endpoint)).map(item => (
            <div key={item.id} style={{
              padding: '12px 16px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 3 }}>{item.label}</div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  <span style={{
                    fontSize: 9,
                    padding: '1px 5px',
                    borderRadius: 4,
                    background: item.method === 'POST' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.12)',
                    color: item.method === 'POST' ? 'var(--amber-light)' : 'var(--emerald-light)',
                    marginRight: 4,
                  }}>{item.method}</span>
                  {item.endpoint}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Module Page ──────────────────────────────────────────────────
function ModulePage({ groupId, locationId, token, isConnected, companyId }) {
  const allItems = NAV_ITEMS.flatMap(g => g.items);
  const item = allItems.find(i => i.id === groupId);
  if (!item) return null;

  return (
    <div>
      <div className="dashboard-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>{item.icon}</span> {item.label}
        </h2>
        <p>{item.desc}</p>
        {groupId === 'conversations' ? (
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="method-badge method-get" style={{ marginRight: 8 }}>GET</span>
              <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-muted)', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: 6 }}>
                services.leadconnectorhq.com/conversations/search
              </code>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="method-badge method-post" style={{ marginRight: 8 }}>POST</span>
              <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-muted)', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: 6 }}>
                services.leadconnectorhq.com/conversations/
              </code>
            </div>
          </div>
        ) : item.endpoint && (
          <div style={{ marginTop: 6 }}>
            <span className={`method-badge ${item.method === 'POST' ? 'method-post' : 'method-get'}`} style={{ marginRight: 8 }}>
              {item.method}
            </span>
            <code style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              color: 'var(--text-muted)',
              background: 'rgba(0,0,0,0.3)',
              padding: '2px 8px',
              borderRadius: 6,
            }}>
              services.leadconnectorhq.com{item.endpoint}
            </code>
          </div>
        )}
      </div>

      <div className="module-card expanded" style={{ borderColor: 'rgba(124,58,237,0.2)' }}>
        <div className="module-body">
          {!isConnected && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 10,
              fontSize: 13,
              color: 'var(--amber-light)',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              ⚠️ Enter your Location ID and Bearer Token in the top bar to fetch data.
            </div>
          )}
          {groupId === 'contacts' && <ContactsModule locationId={locationId} token={token} isConnected={isConnected} />}
          {groupId === 'opportunities' && <OpportunitiesModule locationId={locationId} token={token} isConnected={isConnected} />}
          {groupId === 'pipelines' && <PipelinesModule locationId={locationId} token={token} isConnected={isConnected} />}
          {groupId === 'calendars' && <CalendarsModule locationId={locationId} token={token} isConnected={isConnected} />}
          {groupId === 'custom-fields' && <CustomFieldsModule locationId={locationId} token={token} isConnected={isConnected} />}
          {groupId === 'custom-values' && <CustomValuesModule locationId={locationId} token={token} isConnected={isConnected} />}
          {groupId === 'tags' && <TagsModule locationId={locationId} token={token} isConnected={isConnected} />}
          {groupId === 'users' && <UsersModule locationId={locationId} companyId={companyId} token={token} isConnected={isConnected} />}
          {groupId === 'workflows' && <WorkflowsModule locationId={locationId} token={token} isConnected={isConnected} />}
          {groupId === 'forms' && <FormsModule locationId={locationId} token={token} isConnected={isConnected} />}
          {groupId === 'conversations' && <ConversationsModule locationId={locationId} token={token} isConnected={isConnected} />}
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────
export default function App() {
  const [locationId, setLocationId] = useState(() => sessionStorage.getItem('ghl_loc') || '');
  const [token, setToken] = useState(() => sessionStorage.getItem('ghl_tok') || '');
  const [inputLoc, setInputLoc] = useState(() => sessionStorage.getItem('ghl_loc') || '');
  const [inputTok, setInputTok] = useState(() => sessionStorage.getItem('ghl_tok') || '');
  const [companyId, setCompanyId] = useState(() => sessionStorage.getItem('ghl_company') || '');
  const [isConnected, setIsConnected] = useState(() => !!(sessionStorage.getItem('ghl_loc') && sessionStorage.getItem('ghl_tok')));
  const [activePage, setActivePage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState(null);
  const [locationName, setLocationName] = useState(() => sessionStorage.getItem('ghl_name') || '');

  const connect = useCallback(async () => {
    if (!inputLoc.trim() || !inputTok.trim()) return;
    const loc = inputLoc.trim();
    const tok = inputTok.trim();
    setLocationId(loc);
    setToken(tok);
    setIsConnected(true);
    sessionStorage.setItem('ghl_loc', loc);
    sessionStorage.setItem('ghl_tok', tok);

    // Fetch location info
    setLocLoading(true);
    setLocError(null);
    setLocationData(null);
    try {
      const res = await getLocation(loc, tok);
      const loc_data = res.location || res;
      setLocationData(loc_data);
      setLocationName(loc_data.name || loc);
      sessionStorage.setItem('ghl_name', loc_data.name || loc);
      if (loc_data.companyId) {
        setCompanyId(loc_data.companyId);
        sessionStorage.setItem('ghl_company', loc_data.companyId);
      }
    } catch (e) {
      setLocError(e.message);
    } finally {
      setLocLoading(false);
    }
  }, [inputLoc, inputTok]);

  const disconnect = () => {
    setLocationId(''); setToken('');
    setInputLoc(''); setInputTok('');
    setCompanyId('');
    setIsConnected(false); setLocationData(null);
    locationData && setLocationName(''); setLocError(null);
    sessionStorage.clear();
    setActivePage('overview');
  };

  const allItems = NAV_ITEMS.flatMap(g => g.items);
  const currentItem = allItems.find(i => i.id === activePage);

  return (
    <>
      {/* Animated Background */}
      <div className="app-bg">
        <div className="app-bg-mid" />
      </div>

      <div className="app-layout">
        {/* Sidebar */}
        <Sidebar
          activeId={activePage}
          onSelect={(pageId) => {
            setActivePage(pageId);
            setSidebarOpen(false);
          }}
          isConnected={isConnected}
          locationName={locationName}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main */}
        <main className="main-content">
          {/* Topbar */}
          <header className="topbar">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hamburger-btn"
              title="Open Navigation Menu"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '6px 12px',
                cursor: 'pointer',
                color: 'white',
                fontSize: 16,
                display: 'none', // Show/hide using media queries
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                marginRight: 10,
              }}
            >
              ☰
            </button>
            <div className="topbar-title">
              <h2>{currentItem ? `${currentItem.icon} ${currentItem.label}` : '⬡ Overview'}</h2>
              <p>GoHighLevel Platform API Manager</p>
            </div>

            <div className="credential-bar">
              <div className="cred-input-wrap" style={{ maxWidth: 180 }}>
                <span className="cred-input-icon">🆔</span>
                <input
                  className="cred-input"
                  placeholder="Location ID"
                  value={inputLoc}
                  onChange={e => setInputLoc(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && connect()}
                  spellCheck={false}
                />
              </div>
              <div className="cred-input-wrap" style={{ maxWidth: 240 }}>
                <span className="cred-input-icon">🔑</span>
                <input
                  className="cred-input"
                  type="password"
                  placeholder="Bearer Token"
                  value={inputTok}
                  onChange={e => setInputTok(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && connect()}
                  spellCheck={false}
                />
              </div>
              {isConnected ? (
                <button
                  className="btn-connect"
                  onClick={disconnect}
                  style={{ background: 'rgba(244,63,94,0.2)', border: '1px solid rgba(244,63,94,0.3)', boxShadow: 'none' }}
                >
                  ✕ Disconnect
                </button>
              ) : (
                <button
                  className="btn-connect"
                  onClick={connect}
                  disabled={!inputLoc.trim() || !inputTok.trim()}
                >
                  ⚡ Connect
                </button>
              )}
            </div>
          </header>

          {/* Page */}
          <div className="page-content">
            {activePage === 'overview' ? (
              <OverviewPage
                locationId={locationId}
                token={token}
                isConnected={isConnected}
                locationData={locationData}
                locLoading={locLoading}
                locError={locError}
              />
            ) : (
              <ModulePage
                groupId={activePage}
                locationId={locationId}
                token={token}
                isConnected={isConnected}
                companyId={companyId}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
