// src/lib/api.ts
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.PUBLIC_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const { origin, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }

    return `${origin.replace(/\/$/, '')}/api`;
  }

  return 'http://localhost:8000';
};

const API_URL = getApiBaseUrl();

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

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (parseError) {
    throw new Error('No se pudo interpretar la respuesta del servidor');
  }
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

export const inventoryPermissions = {
  list: async () => {
    return fetchAPI('/inventory/permissions');
  },

  create: async (data: { email: string; notes?: string | null }) => {
    return fetchAPI('/inventory/permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  remove: async (id: string) => {
    return fetchAPI(`/inventory/permissions/${id}`, {
      method: 'DELETE',
    });
  },

  check: async () => {
    return fetchAPI('/inventory/permissions/check');
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

// Administración global
export const admin = {
  listUsers: async () => {
    return fetchAPI('/admin/users');
  },

  createUser: async (data: {
    nombre: string;
    email: string;
    password: string;
    rol: string;
    org_unit_id?: string | null;
    activo?: boolean;
  }) => {
    return fetchAPI('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateUser: async (userId: string, data: Partial<{
    nombre: string;
    rol: string;
    org_unit_id: string | null;
    activo: boolean;
    password: string;
  }>) => {
    return fetchAPI(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  listOrgUnits: async () => {
    return fetchAPI('/admin/org-units');
  },
};
