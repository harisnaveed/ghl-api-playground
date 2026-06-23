const BASE = '/api';
const VERSION = 'v3';

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    Version: VERSION,
    'Content-Type': 'application/json',
  };
}

async function request(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// ─── Location ───
export const getLocation = (locationId, token) =>
  request(`${BASE}/locations/${locationId}`, { headers: headers(token) });

// ─── Contacts ───
export const getContacts = (locationId, token, query = '', limit = 20) =>
  request(
    `${BASE}/contacts/?locationId=${locationId}&limit=${limit}${query ? `&query=${encodeURIComponent(query)}` : ''}`,
    { headers: headers(token) }
  );

// ─── Opportunities ───
export const getOpportunities = (locationId, token, query = '', limit = 20) =>
  request(
    `${BASE}/opportunities/search?locationId=${locationId}&limit=${limit}${query ? `&q=${encodeURIComponent(query)}` : ''}`,
    { headers: headers(token) }
  );

// ─── Pipelines ───
export const getPipelines = (locationId, token) =>
  request(`${BASE}/opportunities/pipelines?locationId=${locationId}`, {
    headers: headers(token),
  });

// ─── Calendars ───
export const getCalendars = (locationId, token) =>
  request(`${BASE}/calendars/?locationId=${locationId}`, { headers: headers(token) });

// ─── Custom Fields ───
export const getCustomFields = (locationId, token) =>
  request(`${BASE}/locations/${locationId}/customFields`, { headers: headers(token) });

// ─── Custom Values ───
export const getCustomValues = (locationId, token) =>
  request(`${BASE}/locations/${locationId}/customValues`, { headers: headers(token) });

// ─── Tags ───
export const getTags = (locationId, token) =>
  request(`${BASE}/locations/${locationId}/tags`, { headers: headers(token) });

// ─── Users ───
export const getUsers = (locationId, companyId, token) =>
  request(
    `${BASE}/users/search?companyId=${companyId}${locationId ? `&locationId=${locationId}` : ''}`,
    { headers: headers(token) }
  );

// ─── Workflows ───
export const getWorkflows = (locationId, token) =>
  request(`${BASE}/workflows/?locationId=${locationId}`, { headers: headers(token) });

// ─── Surveys ───
export const getSurveys = (locationId, token) =>
  request(`${BASE}/surveys?locationId=${locationId}`, { headers: headers(token) });

// ─── Forms ───
export const getForms = (locationId, token) =>
  request(`${BASE}/forms/?locationId=${locationId}`, { headers: headers(token) });

// ─── Conversations ───
export const createContact = (locationId, token, data) =>
  request(`${BASE}/contacts/`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ ...data, locationId }),
  });

export const createConversation = (locationId, token, contactId) =>
  request(`${BASE}/conversations/`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ contactId, locationId }),
  });

export const searchConversations = (locationId, token, params = {}) => {
  const queryParts = [`locationId=${locationId}`];
  if (params.limit) queryParts.push(`limit=${params.limit}`);
  if (params.contactId) queryParts.push(`contactId=${params.contactId}`);
  if (params.query) queryParts.push(`query=${encodeURIComponent(params.query)}`);
  if (params.sort) queryParts.push(`sort=${params.sort}`);
  if (params.startAfterDate) queryParts.push(`startAfterDate=${encodeURIComponent(params.startAfterDate)}`);
  if (params.startAfterId) queryParts.push(`startAfterId=${encodeURIComponent(params.startAfterId)}`);

  return request(`${BASE}/conversations/search?${queryParts.join('&')}`, {
    headers: headers(token),
  });
};

export const getConversationMessages = (conversationId, token, locationId = '') => {
  const query = locationId ? `?locationId=${locationId}` : '';
  return request(`${BASE}/conversations/${conversationId}/messages${query}`, { headers: headers(token) });
};

export const sendConversationMessage = (token, data) =>
  request(`${BASE}/conversations/messages`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(data),
  });
