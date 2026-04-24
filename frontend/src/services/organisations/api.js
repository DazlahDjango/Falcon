import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ============================================================
// Axios Client (for the app)
// ============================================================
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        localStorage.setItem('access_token', response.data.access);
        api.defaults.headers.common.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ============================================================
// Feature Flags API
// ============================================================

export const featureFlagApi = {
  getAll: (params) => api.get('/organisations/feature-flags/', { params }),
  getById: (id) => api.get(`/organisations/feature-flags/${id}/`),
  create: (data) => api.post('/organisations/feature-flags/', data),
  update: (id, data) => api.patch(`/organisations/feature-flags/${id}/`, data),
  delete: (id) => api.delete(`/organisations/feature-flags/${id}/`),
  enable: (id) => api.post(`/organisations/feature-flags/${id}/enable/`),
  disable: (id) => api.post(`/organisations/feature-flags/${id}/disable/`),
};

// ============================================================
// Quota API
// ============================================================

export const quotaApi = {
  getAll: (params) => api.get('/organisations/quotas/', { params }),
  getById: (id) => api.get(`/organisations/quotas/${id}/`),
  create: (data) => api.post('/organisations/quotas/', data),
  update: (id, data) => api.patch(`/organisations/quotas/${id}/`, data),
  delete: (id) => api.delete(`/organisations/quotas/${id}/`),
  getUsage: (id) => api.get(`/organisations/quotas/${id}/usage/`),
  getHistory: (id, params) => api.get(`/organisations/quotas/${id}/history/`, { params }),
};

// ============================================================
// Plan API
// ============================================================

export const planApi = {
  getAll: (params) => api.get('/organisations/plans/', { params }),
  getById: (id) => api.get(`/organisations/plans/${id}/`),
  create: (data) => api.post('/organisations/plans/', data),
  update: (id, data) => api.patch(`/organisations/plans/${id}/`, data),
  delete: (id) => api.delete(`/organisations/plans/${id}/`),
  subscribe: (id, data) => api.post(`/organisations/plans/${id}/subscribe/`, data),
  cancel: (id) => api.post(`/organisations/plans/${id}/cancel/`),
  getFeatures: (id) => api.get(`/organisations/plans/${id}/features/`),
};

// ============================================================
// Contact API
// ============================================================

export const contactApi = {
  getAll: (params) => api.get('/organisations/contacts/', { params }),
  getById: (id) => api.get(`/organisations/contacts/${id}/`),
  create: (data) => api.post('/organisations/contacts/', data),
  update: (id, data) => api.patch(`/organisations/contacts/${id}/`, data),
  delete: (id) => api.delete(`/organisations/contacts/${id}/`),
  import: (data) => api.post('/organisations/contacts/import/', data),
  export: (params) => api.get('/organisations/contacts/export/', { params }),
};

// Alias for backward compatibility
export const fetchContacts = contactApi.getAll;