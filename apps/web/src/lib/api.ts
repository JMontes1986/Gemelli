// src/lib/api.ts
const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000';

// Helper para hacer requests autenticados
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth
export const auth = {
  login: async (email: string, password: string) => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  getProfile: async () => {
    return fetchAPI('/auth/profile');
  },
};

// Devices
export const devices = {
  list: async (params?: { estado?: string; tipo?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchAPI(`/inventory/devices${query ? `?${query}` : ''}`);
  },
  
  get: async (id: string) => {
    return fetchAPI(`/inventory/devices/${id}/cv`);
  },
  
  create: async (data: any) => {
    return fetchAPI('/inventory/devices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  update: async (id: string, data: any) => {
    return fetchAPI(`/inventory/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Tickets
export const tickets = {
  list: async (params?: { estado?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchAPI(`/tickets${query ? `?${query}` : ''}`);
  },
  
  get: async (id: string) => {
    return fetchAPI(`/tickets/${id}`);
  },
  
  create: async (data: any) => {
    return fetchAPI('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  update: async (id: string, data: any) => {
    return fetchAPI(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  addComment: async (id: string, comentario: string) => {
    return fetchAPI(`/tickets/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ ticket_id: id, comentario }),
    });
  },
};

// Dashboard
export const dashboard = {
  getMetrics: async () => {
    return fetchAPI('/dashboard/metrics');
  },
};

// Backups
export const backups = {
  list: async (deviceId?: string) => {
    const query = deviceId ? `?device_id=${deviceId}` : '';
    return fetchAPI(`/backups${query}`);
  },
};
