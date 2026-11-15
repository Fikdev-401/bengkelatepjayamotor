const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
const TOKEN_KEY = 'ajm_admin_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  }

  const string = query.toString();
  return string ? `?${string}` : '';
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
  }

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    if (response.status === 401 && auth) {
      clearToken();
      window.dispatchEvent(new Event('ajm:auth-expired'));
    }

    const error = new Error(payload.message || 'Terjadi kesalahan. Silakan coba lagi.');
    error.status = response.status;
    throw error;
  }

  return payload;
}

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/auth/me', { auth: true }),
  getServices: () => request('/services'),
  createOrder: (payload) => request('/orders', { method: 'POST', body: payload }),
  trackOrder: (code) => request(`/orders/track/${encodeURIComponent(code)}`),

  admin: {
    getStats: () => request('/admin/stats', { auth: true }),
    getOrders: (params) => request(`/admin/orders${buildQuery(params)}`, { auth: true }),
    getOrder: (id) => request(`/admin/orders/${id}`, { auth: true }),
    updateOrder: (id, payload) =>
      request(`/admin/orders/${id}`, { method: 'PATCH', body: payload, auth: true }),
    getServices: () => request('/admin/services', { auth: true }),
    createService: (payload) =>
      request('/admin/services', { method: 'POST', body: payload, auth: true }),
    updateService: (id, payload) =>
      request(`/admin/services/${id}`, { method: 'PUT', body: payload, auth: true }),
    deleteService: (id) =>
      request(`/admin/services/${id}`, { method: 'DELETE', auth: true }),
  },
};
