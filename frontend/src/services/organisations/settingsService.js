import api from './api';

export const settingsApi = {
  // Organization settings endpoints
  get: () => api.get('/organisations/settings/'),
  update: (data) => api.patch('/organisations/settings/', data),
  updateNotificationSettings: (data) => api.patch('/organisations/settings/notifications/', data),
  updateSecuritySettings: (data) => api.patch('/organisations/settings/security/', data),
  updateBillingSettings: (data) => api.patch('/organisations/settings/billing/', data),
  
  // API Key management
  getApiKeys: () => api.get('/organisations/settings/api-keys/'),
  createApiKey: (data) => api.post('/organisations/settings/api-keys/', data),
  deleteApiKey: (id) => api.delete(`/organisations/settings/api-keys/${id}/`),
};
