import React, { useState, useEffect } from 'react';
import { createContact, createConversation, searchConversations, getConversationMessages, sendConversationMessage, getContacts } from '../api/ghlApi';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      type="button"
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

export default function ConversationsModule({ locationId, token, isConnected }) {
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'create-contact', or 'existing-contact'
  
  // Responsive window state
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 992 : false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Create Contact form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Existing Contact state
  const [existingContactId, setExistingContactId] = useState('');

  // Search Conversations state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchContactId, setSearchContactId] = useState('');
  const [searchLimit, setSearchLimit] = useState('20');
  const [searchSort, setSearchSort] = useState('desc');
  const [startAfterDate, setStartAfterDate] = useState('');
  const [startAfterId, setStartAfterId] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [groupByContact, setGroupByContact] = useState(true);

  // Search response data & pagination history
  const [searchData, setSearchData] = useState(null);
  const [pageHistory, setPageHistory] = useState([]); // Array of { startAfterDate, startAfterId }

  // Active chat thread state
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorMessages, setErrorMessages] = useState(null);

  // Composer state
  const [composeText, setComposeText] = useState('');
  const [composeType, setComposeType] = useState('SMS');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Status & output for creation flows
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [jsonTab, setJsonTab] = useState('summary'); // 'summary' or 'json'

  // Pre-fetched Contact Map for Name Resolution & Message debugging
  const [contactsMap, setContactsMap] = useState({});
  const [rawMessagesResponse, setRawMessagesResponse] = useState(null);
  const [rightTab, setRightTab] = useState('chat'); // 'chat' or 'json'

  const loadContactsMap = async () => {
    if (!isConnected || !locationId || !token) return;
    try {
      const res = await getContacts(locationId, token, '', 100);
      if (res && res.contacts) {
        const map = {};
        res.contacts.forEach(c => {
          if (c && c.id) {
            map[c.id] = [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email || c.phone || 'Unnamed Contact';
          }
        });
        setContactsMap(map);
      }
    } catch (e) {
      console.error("Failed to load contacts map:", e);
    }
  };

  useEffect(() => {
    if (isConnected && locationId && token) {
      loadContactsMap();
    }
  }, [isConnected, locationId, token]);

  const getContactName = (conv) => {
    if (!conv) return 'Unknown Contact';
    if (conv.contactName) return conv.contactName;
    if (conv.contact?.name) return conv.contact.name;
    const nameFromContact = conv.contact ? [conv.contact.firstName, conv.contact.lastName].filter(Boolean).join(' ') : '';
    if (nameFromContact) return nameFromContact;
    if (contactsMap[conv.contactId]) return contactsMap[conv.contactId];
    return conv.contactId || 'Unknown Contact';
  };

  const handleCreateContactAndConversation = async (e) => {
    e.preventDefault();
    if (!isConnected) return;
    if (!firstName.trim() || !lastName.trim()) {
      setError("First Name and Last Name are required.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Step 1: Create Contact
      const contactPayload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      };
      const contactRes = await createContact(locationId, token, contactPayload);
      const contact = contactRes.contact || contactRes;
      const contactId = contact.id;

      if (!contactId) {
        throw new Error("Failed to retrieve ID from newly created contact.");
      }

      // Step 2: Create Conversation
      const conversationRes = await createConversation(locationId, token, contactId);

      setResult({
        flow: 'create-contact',
        contact,
        conversation: conversationRes.conversation || conversationRes,
        rawContactResponse: contactRes,
        rawConversationResponse: conversationRes,
      });

      // Clear form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
    } catch (err) {
      setError(err.message || "An error occurred during creation flow.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversationFromExisting = async (e) => {
    e.preventDefault();
    if (!isConnected) return;
    if (!existingContactId.trim()) {
      setError("Contact ID is required.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const conversationRes = await createConversation(locationId, token, existingContactId.trim());
      setResult({
        flow: 'existing-contact',
        contactId: existingContactId.trim(),
        conversation: conversationRes.conversation || conversationRes,
        rawConversationResponse: conversationRes,
      });
      setExistingContactId('');
    } catch (err) {
      setError(err.message || "An error occurred starting conversation.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Conversations (Search)
  const handleSearchConversations = async (cursorParams = null) => {
    if (!isConnected) return;
    setLoading(true);
    setError(null);
    setSelectedConversation(null);
    setMessages([]);
    try {
      const params = {
        limit: searchLimit,
        sort: searchSort,
        contactId: searchContactId.trim() || undefined,
        query: searchQuery.trim() || undefined,
      };

      if (cursorParams) {
        if (cursorParams.startAfterDate) params.startAfterDate = cursorParams.startAfterDate;
        if (cursorParams.startAfterId) params.startAfterId = cursorParams.startAfterId;
      } else {
        // First page search: clear cursor parameters and history
        if (startAfterDate.trim()) params.startAfterDate = startAfterDate.trim();
        if (startAfterId.trim()) params.startAfterId = startAfterId.trim();
        setPageHistory([]);
      }

      const data = await searchConversations(locationId, token, params);
      setSearchData(data);
    } catch (err) {
      setError(err.message || "Failed to search conversations.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch message history for selected thread
  const fetchMessages = async (conv) => {
    if (!isConnected || !conv) return;
    setSelectedConversation(conv);
    setLoadingMessages(true);
    setErrorMessages(null);
    setMessages([]);
    setRawMessagesResponse(null);
    try {
      const res = await getConversationMessages(conv.id, token, locationId);
      setRawMessagesResponse(res);
      const msgsArray = res && Array.isArray(res.messages) ? res.messages : (Array.isArray(res) ? res : []);
      setMessages(msgsArray);
    } catch (err) {
      setErrorMessages(err.message || "Failed to load message thread details.");
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!isConnected || !selectedConversation || !composeText.trim()) return;
    setSendingMessage(true);
    try {
      const payload = {
        conversationId: selectedConversation.id,
        type: composeType,
        content: composeText.trim(),
        status: 'delivered',
      };
      await sendConversationMessage(token, payload);
      setComposeText('');
      // Reload message history
      const res = await getConversationMessages(selectedConversation.id, token, locationId);
      setRawMessagesResponse(res);
      const msgsArray = res && Array.isArray(res.messages) ? res.messages : (Array.isArray(res) ? res : []);
      setMessages(msgsArray);
    } catch (err) {
      setErrorMessages(err.message || "Failed to send outgoing message.");
    } finally {
      setSendingMessage(false);
    }
  };

  // Next Page logic
  const handleNextPage = () => {
    if (!searchData || !searchData.conversations || searchData.conversations.length === 0) return;
    
    // Save current page cursor details to history so we can navigate back
    const currentCursor = {
      startAfterDate: pageHistory.length > 0 ? pageHistory[pageHistory.length - 1].nextDate : startAfterDate,
      startAfterId: pageHistory.length > 0 ? pageHistory[pageHistory.length - 1].nextId : startAfterId,
    };

    // Extract next cursor from response metadata, or fallback to last item in results
    const lastItem = searchData.conversations[searchData.conversations.length - 1];
    const nextDate = searchData.pagination?.startAfterDate || lastItem.lastMessageDate || lastItem.dateAdded;
    const nextId = searchData.pagination?.startAfterId || lastItem.id;

    if (!nextDate && !nextId) return;

    setPageHistory([...pageHistory, { ...currentCursor, nextDate, nextId }]);
    handleSearchConversations({ startAfterDate: nextDate, startAfterId: nextId });
  };

  // Previous Page logic
  const handlePrevPage = () => {
    if (pageHistory.length === 0) return;
    const newHistory = [...pageHistory];
    newHistory.pop(); // Remove current page from history
    setPageHistory(newHistory);

    const prevCursor = newHistory.length > 0 ? {
      startAfterDate: newHistory[newHistory.length - 1].nextDate,
      startAfterId: newHistory[newHistory.length - 1].nextId
    } : null; // First page is null (uses input query state)

    handleSearchConversations(prevCursor);
  };
  // Helper to group conversations by contact ID
  const getGroupedConversations = () => {
    if (!searchData || !Array.isArray(searchData.conversations)) return {};
    return searchData.conversations.reduce((acc, conv) => {
      if (!conv) return acc;
      const cid = conv.contactId || 'Unknown Contact';
      if (!acc[cid]) acc[cid] = [];
      acc[cid].push(conv);
      return acc;
    }, {});
  };
  const grouped = getGroupedConversations();
  const groupedKeys = Object.keys(grouped);

  // Helper to group messages by date
  const groupMessagesByDate = (msgs) => {
    if (!Array.isArray(msgs)) return {};
    return msgs.reduce((acc, msg) => {
      if (!msg) return acc;
      try {
        const dateVal = msg.dateAdded || msg.date || Date.now();
        const dateStr = new Date(dateVal).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(msg);
      } catch (e) {
        console.error("Error formatting date for message:", msg, e);
      }
      return acc;
    }, {});
  };

  const groupedMsgs = groupMessagesByDate(messages);
  const dateKeys = Object.keys(groupedMsgs);

  // Sub-components for Left and Right columns to keep rendering organized
  const renderLeftColumn = () => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
      <div style={{ padding: 14, borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Inbox Threads</span>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={groupByContact}
            onChange={e => setGroupByContact(e.target.checked)}
            style={{ accentColor: 'var(--violet)' }}
          />
          Group Contacts
        </label>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {groupByContact ? (
          groupedKeys.length > 0 ? (
            groupedKeys.map((cid) => {
              const isSelectedGroup = selectedConversation && grouped[cid].some(c => c.id === selectedConversation.id);
              return (
                <div
                  key={cid}
                  style={{
                    borderRadius: 12,
                    background: isSelectedGroup ? 'rgba(124, 58, 237, 0.1)' : 'rgba(255,255,255,0.02)',
                    border: isSelectedGroup ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid var(--glass-border)',
                    padding: 12,
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0, color: 'var(--violet-light)' }}>
                      👤
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {getContactName(grouped[cid][0])} ({grouped[cid].length})
                      </div>
                      <div style={{ fontSize: 10, opacity: 0.5, fontFamily: 'JetBrains Mono', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                        Contact ID: {cid.substring(0, 8)}…
                        <CopyButton text={cid} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {grouped[cid].map(conv => {
                      const isSel = selectedConversation && selectedConversation.id === conv.id;
                      return (
                        <div
                          key={conv.id}
                          onClick={() => fetchMessages(conv)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            background: isSel ? 'rgba(124, 58, 237, 0.25)' : 'rgba(0,0,0,0.2)',
                            border: isSel ? '1px solid rgba(124, 58, 237, 0.5)' : '1px solid transparent',
                            transition: 'all 0.2s',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                            <span style={{ opacity: 0.5 }}>ID: {conv.id ? conv.id.substring(0, 8) : '—'}…</span>
                            <span style={{ color: 'var(--cyan-light)' }}>{conv.type}</span>
                          </div>
                          <div style={{ fontSize: 11, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: isSel ? '#fff' : 'var(--text-secondary)' }}>
                            {conv.lastMessageBody || '[No messages]'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: 20, textAlign: 'center', opacity: 0.5, fontSize: 12 }}>No threads found.</div>
          )
        ) : (
          searchData && Array.isArray(searchData.conversations) && searchData.conversations.length > 0 ? (
            searchData.conversations.map((conv) => {
              if (!conv) return null;
              const isSel = selectedConversation && selectedConversation.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => fetchMessages(conv)}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    cursor: 'pointer',
                    background: isSel ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255,255,255,0.02)',
                    border: isSel ? '1px solid rgba(124, 58, 237, 0.4)' : '1px solid var(--glass-border)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>
                      💬
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {getContactName(conv)}
                      </div>
                      <div style={{ fontSize: 10, opacity: 0.5, display: 'flex', alignItems: 'center' }}>
                        Contact ID: {conv.contactId ? conv.contactId.substring(0, 8) : '—'}…
                        {conv.contactId && <CopyButton text={conv.contactId} />}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                    {conv.lastMessageBody || '[No messages]'}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: 20, textAlign: 'center', opacity: 0.5, fontSize: 12 }}>No threads found.</div>
          )
        )}
      </div>
    </div>
  );

  const renderRightColumn = () => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(0,0,0,0.15)', minWidth: 0 }}>
      {selectedConversation ? (
        <>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                {isMobile && (
                  <button
                    onClick={() => setSelectedConversation(null)}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 6,
                      color: 'var(--violet-light)',
                      fontSize: 11,
                      cursor: 'pointer',
                      padding: '4px 8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    ← Back
                  </button>
                )}
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>💬 {getContactName(selectedConversation)}</span>
                {selectedConversation.type && (
                  <span className="tag-chip" style={{ background: 'rgba(6,182,212,0.12)', color: 'var(--cyan-light)', fontSize: 10 }}>
                    {selectedConversation.type}
                  </span>
                )}
                {selectedConversation.unreadCount > 0 && (
                  <span className="tag-chip" style={{ background: 'rgba(244,63,94,0.18)', color: 'var(--rose-light)', fontSize: 10 }}>
                    {selectedConversation.unreadCount} unread
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--border-radius-sm)', padding: 3, alignItems: 'center' }}>
                <button
                  type="button"
                  className={`result-tab ${rightTab === 'chat' ? 'active' : ''}`}
                  onClick={() => setRightTab('chat')}
                  style={{ padding: '4px 10px', fontSize: 11, border: 'none', background: 'transparent', cursor: 'pointer' }}
                >
                  ✦ Chat
                </button>
                <button
                  type="button"
                  className={`result-tab ${rightTab === 'json' ? 'active' : ''}`}
                  onClick={() => setRightTab('json')}
                  style={{ padding: '4px 10px', fontSize: 11, border: 'none', background: 'transparent', cursor: 'pointer' }}
                >
                  {'{ }'} Raw JSON
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 11, opacity: 0.5 }}>
              <div>
                Thread ID: {selectedConversation.id}
                <CopyButton text={selectedConversation.id} />
              </div>
              <div>
                Contact ID: {selectedConversation.contactId}
                <CopyButton text={selectedConversation.contactId} />
              </div>
            </div>
          </div>
          {/* Messages List Area / Raw JSON Viewer */}
          {rightTab === 'json' ? (
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              <div className="json-viewer">
                <pre>{JSON.stringify(rawMessagesResponse, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {loadingMessages ? (
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <div className="spinner" style={{ marginRight: 8 }} /> Loading conversation transcript…
                </div>
              ) : errorMessages ? (
                <div className="error-box">
                  <span className="error-box-icon">⚠️</span>
                  <div><strong>Error:</strong> {errorMessages}</div>
                </div>
              ) : messages.length === 0 ? (
                <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: 0.5 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                  <div>No messages found in this thread. Use the composer below to start.</div>
                </div>
              ) : (
                dateKeys.map(dateStr => (
                  <div key={dateStr} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    
                    {/* Date Separator */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px 0' }}>
                      <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', padding: '3px 12px', borderRadius: 20, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {dateStr}
                      </span>
                    </div>

                    {/* Chronological messages */}
                    {groupedMsgs[dateStr].map((msg, mIdx) => {
                      if (!msg) return null;
                      const isOut = msg.direction === 'outbound';
                      return (
                        <div
                          key={msg.id || mIdx}
                          style={{
                            alignSelf: isOut ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isOut ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2, padding: '0 4px' }}>
                            {isOut ? 'You (Outbound)' : 'Contact (Inbound)'} • {msg.type || 'SMS'}
                          </div>
                          
                          <div
                            style={{
                              padding: '10px 14px',
                              borderRadius: isOut ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                              background: isOut
                                ? 'linear-gradient(135deg, rgba(124,58,237,0.7), rgba(99,102,241,0.7))'
                                : 'rgba(255, 255, 255, 0.05)',
                              border: isOut
                                ? '1px solid rgba(124, 58, 237, 0.3)'
                                : '1px solid rgba(255, 255, 255, 0.05)',
                              boxShadow: isOut ? '0 4px 15px rgba(124,58,237,0.15)' : 'none',
                              color: isOut ? '#fff' : 'var(--text-secondary)',
                              fontSize: 13,
                              lineHeight: 1.4,
                              wordBreak: 'break-word',
                            }}
                          >
                            {typeof msg.body === 'object' 
                              ? (msg.body?.text || JSON.stringify(msg.body)) 
                              : (msg.body || '[Empty message]')}
                          </div>

                          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2, padding: '0 4px', display: 'flex', gap: 6 }}>
                            <span>
                              {(() => {
                                try {
                                  const d = new Date(msg.dateAdded || Date.now());
                                  return isNaN(d.getTime()) ? '—' : d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                                } catch (e) {
                                  return '—';
                                }
                              })()}
                            </span>
                            {msg.status && (
                              <span>• {msg.status}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          )}
          {/* Chat Footer / Composer */}
          <form onSubmit={handleSendMessage} style={{ padding: 12, borderTop: '1px solid var(--glass-border)', display: 'flex', gap: 8, background: 'rgba(0,0,0,0.2)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="input-group" style={{ flex: '0 0 auto', width: 90, marginBottom: 0, minWidth: 'auto' }}>
              <select
                className="module-input"
                value={composeType}
                onChange={e => setComposeType(e.target.value)}
                style={{ padding: '8px', fontSize: 12, height: 38, cursor: 'pointer' }}
              >
                <option value="SMS">💬 SMS</option>
                <option value="Email">📧 Mail</option>
                <option value="WhatsApp">🟢 WA</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <input
                className="module-input"
                placeholder="Type a message..."
                value={composeText}
                onChange={e => setComposeText(e.target.value)}
                disabled={sendingMessage}
                style={{ height: 38, padding: '8px 12px' }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={sendingMessage || !composeText.trim()}
              className="btn-fetch"
              style={{
                height: 38,
                padding: '0 16px',
                alignSelf: 'center',
                borderRadius: 'var(--border-radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                margin: 0,
              }}
            >
              {sendingMessage ? <div className="spinner" /> : '⚡ Send'}
            </button>
          </form>
        </>
      ) : (
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: 0.5, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>💬</div>
          <div style={{ fontSize: 14 }}>Select a thread from the list on the left to view message history</div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid var(--glass-border)', paddingBottom: 10, flexWrap: 'wrap' }}>
        <button
          className={`result-tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => { setActiveTab('search'); setError(null); setResult(null); }}
          style={{ padding: '8px 16px', borderRadius: 8 }}
        >
          🔍 Search / List Conversations
        </button>
        <button
          className={`result-tab ${activeTab === 'create-contact' ? 'active' : ''}`}
          onClick={() => { setActiveTab('create-contact'); setError(null); setResult(null); }}
          style={{ padding: '8px 16px', borderRadius: 8 }}
        >
          👤 Create & Start
        </button>
        <button
          className={`result-tab ${activeTab === 'existing-contact' ? 'active' : ''}`}
          onClick={() => { setActiveTab('existing-contact'); setError(null); setResult(null); }}
          style={{ padding: '8px 16px', borderRadius: 8 }}
        >
          💬 Start with Contact ID
        </button>
      </div>

      {activeTab === 'create-contact' && (
        <form onSubmit={handleCreateContactAndConversation} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>First Name *</label>
              <input
                className="module-input"
                placeholder="John"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                disabled={loading || !isConnected}
                required
              />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Last Name *</label>
              <input
                className="module-input"
                placeholder="Doe"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                disabled={loading || !isConnected}
                required
              />
            </div>
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input
              className="module-input"
              type="email"
              placeholder="john.doe@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading || !isConnected}
            />
          </div>
          <div className="input-group">
            <label>Phone Number</label>
            <input
              className="module-input"
              placeholder="+1234567890"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              disabled={loading || !isConnected}
            />
          </div>

          <button
            type="submit"
            className={`btn-fetch ${loading ? 'loading' : ''}`}
            style={{ width: 'fit-content', marginTop: 8 }}
            disabled={loading || !isConnected}
          >
            {loading ? <><div className="spinner" /> Creating Flow…</> : '👤 Create Contact & Conversation'}
          </button>
        </form>
      )}

      {activeTab === 'existing-contact' && (
        <form onSubmit={handleCreateConversationFromExisting} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
          <div className="input-group">
            <label>Contact ID *</label>
            <input
              className="module-input"
              placeholder="Paste existing Contact ID (e.g. n3Ld9z2K...)"
              value={existingContactId}
              onChange={e => setExistingContactId(e.target.value)}
              disabled={loading || !isConnected}
              required
            />
          </div>

          <button
            type="submit"
            className={`btn-fetch ${loading ? 'loading' : ''}`}
            style={{ width: 'fit-content', marginTop: 8 }}
            disabled={loading || !isConnected}
          >
            {loading ? <><div className="spinner" /> Starting…</> : '💬 Start Conversation'}
          </button>
        </form>
      )}

      {activeTab === 'search' && (
        <div>
          <div className="module-controls" style={{ gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="input-group" style={{ flex: '2 1 200px' }}>
              <label>Search Query</label>
              <input
                className="module-input"
                placeholder="Search messages content…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchConversations()}
              />
            </div>
            <div className="input-group" style={{ flex: '1 1 180px' }}>
              <label>Contact ID Filter</label>
              <input
                className="module-input"
                placeholder="Optional Contact ID…"
                value={searchContactId}
                onChange={e => setSearchContactId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchConversations()}
              />
            </div>
            <div className="input-group" style={{ maxWidth: 90 }}>
              <label>Limit</label>
              <input
                className="module-input"
                type="number"
                min="1"
                max="100"
                value={searchLimit}
                onChange={e => setSearchLimit(e.target.value)}
              />
            </div>
            <div className="input-group" style={{ maxWidth: 100 }}>
              <label>Sort</label>
              <select
                className="module-input"
                value={searchSort}
                onChange={e => setSearchSort(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="desc">Newest</option>
                <option value="asc">Oldest</option>
              </select>
            </div>
            <button
              className={`btn-fetch ${loading ? 'loading' : ''}`}
              onClick={() => handleSearchConversations()}
              disabled={loading || !isConnected}
              style={{ alignSelf: 'flex-end' }}
            >
              {loading ? <><div className="spinner" /> Fetching…</> : '⚡ Fetch Conversations'}
            </button>
          </div>

          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{ cursor: 'pointer', fontSize: 12, color: 'var(--violet-light)', textDecoration: 'underline', userSelect: 'none' }}
              >
                {showAdvanced ? 'Hide Advanced Pagination Cursors' : 'Show Advanced Pagination Cursors'}
              </span>
            </div>

            {showAdvanced && (
              <div style={{ display: 'flex', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 10 }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Start After Date (Cursor)</label>
                  <input
                    className="module-input"
                    placeholder="e.g. 2026-06-22T18:00:00.000Z"
                    value={startAfterDate}
                    onChange={e => setStartAfterDate(e.target.value)}
                  />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Start After ID (Cursor)</label>
                  <input
                    className="module-input"
                    placeholder="e.g. 5f483b276..."
                    value={startAfterId}
                    onChange={e => setStartAfterId(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="error-box" style={{ marginTop: 20 }}>
          <span className="error-box-icon">⚠️</span>
          <div><strong>Error:</strong> {error}</div>
        </div>
      )}

      {/* Overview Create/Start flow result view */}
      {activeTab !== 'search' && result && (
        <div className="result-area" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="result-count">
              🎉 Conversation Created Successfully
            </div>
            <div className="result-tabs">
              <button className={`result-tab ${jsonTab === 'summary' ? 'active' : ''}`} onClick={() => setJsonTab('summary')}>✦ Summary</button>
              <button className={`result-tab ${jsonTab === 'json' ? 'active' : ''}`} onClick={() => setJsonTab('json')}>{'{ }'} Raw Response</button>
            </div>
          </div>

          {jsonTab === 'summary' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {result.flow === 'create-contact' && result.contact && (
                <div className="data-card" style={{ maxWidth: '100%', marginBottom: 10 }}>
                  <div className="data-card-header">
                    <div className="data-card-avatar" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                      👤
                    </div>
                    <div>
                      <div className="data-card-title">
                        {[result.contact.firstName, result.contact.lastName].filter(Boolean).join(' ') || 'Created Contact'}
                      </div>
                      <div className="data-card-subtitle">
                        {result.contact.email || 'No email'}
                      </div>
                    </div>
                  </div>
                  <div className="data-card-fields">
                    {result.contact.phone && (
                      <div className="data-field">
                        <span className="data-field-key">📱 Phone</span>
                        <span className="data-field-value">{result.contact.phone}</span>
                      </div>
                    )}
                    <div className="data-field">
                      <span className="data-field-key">🆔 Contact ID</span>
                      <span className="data-field-value" style={{ fontSize: 11, opacity: 0.8, display: 'flex', alignItems: 'center' }}>
                        {result.contact.id}
                        <CopyButton text={result.contact.id} />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="data-card" style={{ maxWidth: '100%', border: '1px solid rgba(6,182,212,0.3)', background: 'rgba(6,182,212,0.02)' }}>
                <div className="data-card-header">
                  <div className="data-card-avatar" style={{ background: 'linear-gradient(135deg, #06b6d4, #0284c7)' }}>
                    💬
                  </div>
                  <div>
                    <div className="data-card-title">Conversation Record</div>
                    <div className="data-card-subtitle">Active Thread</div>
                  </div>
                </div>
                <div className="data-card-fields">
                  <div className="data-field">
                    <span className="data-field-key">🆔 Conversation ID</span>
                    <span className="data-field-value" style={{ fontSize: 11, opacity: 0.9, fontWeight: 'bold', display: 'flex', alignItems: 'center', color: 'var(--cyan-light)' }}>
                      {result.conversation.id || result.conversation.conversationId || 'N/A'}
                      {(result.conversation.id || result.conversation.conversationId) && <CopyButton text={result.conversation.id || result.conversation.conversationId} />}
                    </span>
                  </div>
                  {result.conversation.status && (
                    <div className="data-field">
                      <span className="data-field-key">⚡ Status</span>
                      <span className="data-field-value">
                        <span className="tag-chip" style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)', color: 'var(--emerald-light)' }}>
                          {result.conversation.status}
                        </span>
                      </span>
                    </div>
                  )}
                  {result.flow === 'existing-contact' && (
                    <div className="data-field">
                      <span className="data-field-key">👤 Associated Contact ID</span>
                      <span className="data-field-value" style={{ fontSize: 11, opacity: 0.8, display: 'flex', alignItems: 'center' }}>
                        {result.contactId}
                        <CopyButton text={result.contactId} />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="json-viewer">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Search results view with Responsive Split Pane Chat View */}
      {activeTab === 'search' && searchData && (
        <div className="result-area" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="result-count">
              ✅ Found <span>{searchData.conversations?.length || 0}</span> conversations
            </div>
            <div className="result-tabs">
              <button className={`result-tab ${jsonTab === 'summary' ? 'active' : ''}`} onClick={() => setJsonTab('summary')}>✦ Interactive Chat</button>
              <button className={`result-tab ${jsonTab === 'json' ? 'active' : ''}`} onClick={() => setJsonTab('json')}>{'{ }'} Raw JSON</button>
            </div>
          </div>

          {jsonTab === 'summary' ? (
            <div style={{ display: 'flex', gap: 20, marginTop: 16, height: 600, border: '1px solid var(--glass-border)', borderRadius: 16, background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
              {isMobile ? (
                // Mobile layout: render either left sidebar or right chat thread
                !selectedConversation ? (
                  renderLeftColumn()
                ) : (
                  renderRightColumn()
                )
              ) : (
                // Desktop layout: side-by-side split pane
                <>
                  <div style={{ width: '35%', minWidth: 280, maxWidth: 400, borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {renderLeftColumn()}
                  </div>
                  {renderRightColumn()}
                </>
              )}
            </div>
          ) : (
            <div className="json-viewer">
              <pre>{JSON.stringify(searchData, null, 2)}</pre>
            </div>
          )}

          {/* Pagination Controls */}
          {searchData.conversations && searchData.conversations.length > 0 && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, borderTop: '1px solid var(--glass-border)', paddingTop: 16 }}>
              <button
                className="result-tab"
                onClick={handlePrevPage}
                disabled={pageHistory.length === 0}
                style={{ padding: '8px 20px', borderRadius: 8, cursor: pageHistory.length === 0 ? 'not-allowed' : 'pointer', opacity: pageHistory.length === 0 ? 0.4 : 1 }}
              >
                ← Previous Page
              </button>
              <button
                className="result-tab"
                onClick={handleNextPage}
                disabled={searchData.conversations.length < parseInt(searchLimit)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  cursor: searchData.conversations.length < parseInt(searchLimit) ? 'not-allowed' : 'pointer',
                  opacity: searchData.conversations.length < parseInt(searchLimit) ? 0.4 : 1
                }}
              >
                Next Page →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
