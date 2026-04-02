import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle token refresh
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
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Organisation API
export const organisationApi = {
  register: (data) => api.post('/organisations/register/', data),
  getAll: (params) => api.get('/organisations/organisations/', { params }),
  getOne: (id) => api.get(`/organisations/organisations/${id}/`),
  update: (id, data) => api.patch(`/organisations/organisations/${id}/`, data),
  delete: (id) => api.delete(`/organisations/organisations/${id}/`),
  getCurrent: () => api.get('/organisations/tenants/current/'),
};

// Department API
export const departmentApi = {
  getAll: (params) => api.get('/organisations/departments/', { params }),
  getOne: (id) => api.get(`/organisations/departments/${id}/`),
  create: (data) => api.post('/organisations/departments/', data),
  update: (id, data) => api.patch(`/organisations/departments/${id}/`, data),
  delete: (id) => api.delete(`/organisations/departments/${id}/`),
};

// Position API
export const positionApi = {
  getAll: (params) => api.get('/organisations/positions/', { params }),
  getOne: (id) => api.get(`/organisations/positions/${id}/`),
  create: (data) => api.post('/organisations/positions/', data),
  update: (id, data) => api.patch(`/organisations/positions/${id}/`, data),
  delete: (id) => api.delete(`/organisations/positions/${id}/`),
};

// Team API
export const teamApi = {
  getAll: (params) => api.get('/organisations/teams/', { params }),
  getOne: (id) => api.get(`/organisations/teams/${id}/`),
  create: (data) => api.post('/organisations/teams/', data),
  update: (id, data) => api.patch(`/organisations/teams/${id}/`, data),
  delete: (id) => api.delete(`/organisations/teams/${id}/`),
};

// Location API
export const locationApi = {
  getAll: (params) => api.get('/organisations/locations/', { params }),
  getOne: (id) => api.get(`/organisations/locations/${id}/`),
  create: (data) => api.post('/organisations/locations/', data),
  update: (id, data) => api.patch(`/organisations/locations/${id}/`, data),
  delete: (id) => api.delete(`/organisations/locations/${id}/`),
};

// Document API
export const documentApi = {
  getAll: (params) => api.get('/organisations/documents/', { params }),
  getOne: (id) => api.get(`/organisations/documents/${id}/`),
  create: (data) => api.post('/organisations/documents/', data),
  update: (id, data) => api.patch(`/organisations/documents/${id}/`, data),
  delete: (id) => api.delete(`/organisations/documents/${id}/`),
};

// Subscription API
export const subscriptionApi = {
  getPlans: () => api.get('/organisations/plans/'),
  getSubscription: () => api.get('/organisations/subscriptions/'),
  createSubscription: (data) => api.post('/organisations/subscriptions/', data),
  updateSubscription: (id, data) => api.patch(`/organisations/subscriptions/${id}/`, data),
  cancelSubscription: (id) => api.delete(`/organisations/subscriptions/${id}/`),
};

// Settings API
export const settingsApi = {
  getSettings: () => api.get('/organisations/settings/'),
  updateSettings: (data) => api.patch('/organisations/settings/', data),
  getBranding: () => api.get('/organisations/branding/'),
  updateBranding: (data) => api.patch('/organisations/branding/', data),
};

// Domain API
export const domainApi = {
  getAll: () => api.get('/organisations/domains/'),
  create: (data) => api.post('/organisations/domains/', data),
  update: (id, data) => api.patch(`/organisations/domains/${id}/`, data),
  delete: (id) => api.delete(`/organisations/domains/${id}/`),
  verify: (id) => api.post(`/organisations/domains/${id}/verify/`),
};

// Contact API
export const contactApi = {
  getAll: () => api.get('/organisations/contacts/'),
  create: (data) => api.post('/organisations/contacts/', data), 
  update: (id, data) => api.patch(`/organisations/contacts/${id}/`, data),
  delete: (id) => api.delete(`/organisations/contacts/${id}/`),
};

export default api;