/**
 * API Client for VCD Archive
 * Drop-in replacement for base44 client interface
 */

const API_BASE = 'http://localhost:4000/api';

// Token management
function getToken(): string | null {
  return localStorage.getItem('vcd_token');
}

function setToken(token: string): void {
  localStorage.setItem('vcd_token', token);
}

function clearToken(): void {
  localStorage.removeItem('vcd_token');
}

// Fetch wrapper with auth
async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth methods
const auth = {
  async me() {
    return apiFetch('/auth/me');
  },

  async login(email: string, password: string) {
    const result = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (result.token) {
      setToken(result.token);
    }
    return result.user;
  },

  logout() {
    apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
    clearToken();
    window.location.reload();
  },

  redirectToLogin() {
    // For local development, show a simple login prompt
    const email = prompt('Email:');
    const password = prompt('Password:');
    if (email && password) {
      auth.login(email, password)
        .then(() => window.location.reload())
        .catch(err => alert('Login failed: ' + err.message));
    }
  }
};

// Entity helpers factory
function createEntityApi(endpoint: string) {
  return {
    async filter(params: Record<string, any> = {}) {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value));
        }
      });
      const queryString = query.toString();
      return apiFetch(`${endpoint}${queryString ? '?' + queryString : ''}`);
    },

    async list(sort?: string, limit?: number) {
      const params: Record<string, string> = {};
      if (sort) params.sort = sort;
      if (limit) params.limit = String(limit);
      const query = new URLSearchParams(params).toString();
      return apiFetch(`${endpoint}${query ? '?' + query : ''}`);
    },

    async create(data: Record<string, any>) {
      return apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async update(id: string, data: Record<string, any>) {
      return apiFetch(`${endpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    async delete(id: string) {
      return apiFetch(`${endpoint}/${id}`, {
        method: 'DELETE'
      });
    },

    async bulkCreate(items: Record<string, any>[]) {
      return apiFetch(`${endpoint}/bulk`, {
        method: 'POST',
        body: JSON.stringify(items)
      });
    }
  };
}

// Entities
const entities = {
  Release: createEntityApi('/releases'),
  UserCollection: createEntityApi('/user-collection'),
  PublisherLogo: createEntityApi('/publisher-logos')
};

// Integrations (file upload)
const integrations = {
  Core: {
    async UploadFile({ file }: { file: File }): Promise<{ file_url: string }> {
      const token = getToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      // Convert relative URL to absolute
      return {
        file_url: result.file_url.startsWith('http')
          ? result.file_url
          : `http://localhost:4000${result.file_url}`
      };
    }
  }
};

// Export as base44-compatible interface
export const base44 = {
  auth,
  entities,
  integrations
};

export default base44;
