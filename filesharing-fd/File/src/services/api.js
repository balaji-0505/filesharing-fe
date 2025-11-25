const BASE = '';

const getToken = () => localStorage.getItem('authToken');

const jsonHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {})
});

export const userApi = {
  async register(username, email, password) {
    const res = await fetch(`${BASE}/register`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  }
};

export const authApi = {
  async login(email, password) {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: new URLSearchParams({ email, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },
  async register(name, email, password) {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: new URLSearchParams({ name, email, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Register failed');
    return data;
  }
};

export const filesApi = {
  async list() {
    const res = await fetch(`${BASE}/api/files`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Failed to list files');
    return res.json();
  },
  async upload(file, folderId) {
    const form = new FormData();
    form.append('file', file);
    if (folderId) form.append('folderId', String(folderId));
    const res = await fetch(`${BASE}/api/files`, { method: 'POST', body: form, headers: { Authorization: `Bearer ${getToken()}` } });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },
  async update(id, { name, isStarred }) {
    const params = new URLSearchParams();
    if (name != null) params.append('name', name);
    if (isStarred != null) params.append('starred', String(!!isStarred));
    const res = await fetch(`${BASE}/api/files/${id}?${params.toString()}`, { method: 'PATCH', headers: { Authorization: `Bearer ${getToken()}` } });
    if (!res.ok) throw new Error('Update failed');
    return res.json();
  },
  async remove(id) {
    const res = await fetch(`${BASE}/api/files/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
    if (!res.ok) throw new Error('Delete failed');
  },
  downloadUrl(id) {
    return `${BASE}/api/files/${id}/download`;
  }
};

export const foldersApi = {
  async list() {
    const res = await fetch(`${BASE}/api/folders`, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (!res.ok) throw new Error('Failed to list folders');
    return res.json();
  },
  async create(name, parentId) {
    const params = new URLSearchParams({ name });
    if (parentId) params.append('parentId', String(parentId));
    const res = await fetch(`${BASE}/api/folders?${params.toString()}`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` } });
    if (!res.ok) throw new Error('Create folder failed');
    return res.json();
  },
  async rename(id, name) {
    const params = new URLSearchParams({ name });
    const res = await fetch(`${BASE}/api/folders/${id}?${params.toString()}`, { method: 'PATCH', headers: { Authorization: `Bearer ${getToken()}` } });
    if (!res.ok) throw new Error('Rename failed');
    return res.json();
  },
  async remove(id) {
    const res = await fetch(`${BASE}/api/folders/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
    if (!res.ok) throw new Error('Delete folder failed');
  }
};

export const sharesApi = {
  async list() {
    const res = await fetch(`${BASE}/api/shares`, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (!res.ok) throw new Error('Failed to list shares');
    return res.json();
  },
  async create({ fileId, shareType, permissions, expiryEpochMs, password, createdBy }) {
    const params = new URLSearchParams({ fileId: String(fileId), shareType });
    if (permissions && permissions.length) params.append('permissions', permissions.join(','));
    if (expiryEpochMs) params.append('expiryEpochMs', String(expiryEpochMs));
    if (password) params.append('password', password);
    if (createdBy) params.append('createdBy', createdBy);
    const res = await fetch(`${BASE}/api/shares?${params.toString()}`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` } });
    if (!res.ok) throw new Error('Create share failed');
    return res.json();
  },
  async update(id, { shareType, permissions, expiryEpochMs, password }) {
    const params = new URLSearchParams();
    if (shareType) params.append('shareType', shareType);
    if (permissions && permissions.length) params.append('permissions', permissions.join(','));
    if (expiryEpochMs) params.append('expiryEpochMs', String(expiryEpochMs));
    if (password) params.append('password', password);
    const res = await fetch(`${BASE}/api/shares/${id}?${params.toString()}`, { method: 'PATCH', headers: { Authorization: `Bearer ${getToken()}` } });
    if (!res.ok) throw new Error('Update share failed');
    return res.json();
  },
  async remove(id) {
    const res = await fetch(`${BASE}/api/shares/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
    if (!res.ok) throw new Error('Delete share failed');
  }
};

export const passhareApi = {
  async createSession() {
    const url = `${BASE}/api/passhare/sessions`;
    const token = getToken();
    console.log('Creating session at:', url);
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const errorMsg = data.error || `Failed to create session (${res.status} ${res.statusText})`;
      console.error('Create session failed:', res.status, data);
      throw new Error(errorMsg);
    }
    return res.json();
  },
  async joinSession(code) {
    const params = new URLSearchParams({ code });
    const res = await fetch(`${BASE}/api/passhare/sessions/join?${params.toString()}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to join session');
    }
    return res.json();
  },
  async getSession(sessionId) {
    const res = await fetch(`${BASE}/api/passhare/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Failed to get session');
    return res.json();
  },
  async shareFile(sessionId, fileId) {
    const params = new URLSearchParams({ fileId: String(fileId) });
    const res = await fetch(`${BASE}/api/passhare/sessions/${sessionId}/files?${params.toString()}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to share file');
    }
    return res.json();
  },
  async getSessionFiles(sessionId) {
    const res = await fetch(`${BASE}/api/passhare/sessions/${sessionId}/files`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Failed to get session files');
    return res.json();
  },
  async getSessionParticipants(sessionId) {
    const res = await fetch(`${BASE}/api/passhare/sessions/${sessionId}/participants`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Failed to get participants');
    return res.json();
  },
  async leaveSession(sessionId) {
    const res = await fetch(`${BASE}/api/passhare/sessions/${sessionId}/leave`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to leave session');
    }
    return res.json();
  },
  async endSession(sessionId) {
    const res = await fetch(`${BASE}/api/passhare/sessions/${sessionId}/end`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to end session');
    }
    return res.json();
  },
  async removeSharedFile(sessionId, sessionFileId) {
    const res = await fetch(`${BASE}/api/passhare/sessions/${sessionId}/files/${sessionFileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to remove file');
    }
    return res.json();
  },
  downloadSessionFileUrl(sessionId, sessionFileId) {
    return `${BASE}/api/passhare/sessions/${sessionId}/files/${sessionFileId}/download`;
  }
};