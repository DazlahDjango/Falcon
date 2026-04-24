// Organisation Quota Service
// Handles organisation quota management and limits

import api from './api';

export const quotaApi = {
  // Get current organisation quota usage
  getCurrent: () => api.get('/organisations/quota/current/'),

  // Get quota limits
  getLimits: () => api.get('/organisations/quota/limits/'),

  // Update quota limits (admin only)
  updateLimits: (data) => api.patch('/organisations/quota/limits/', data),

  // Check quota before operation
  checkQuota: (resource, amount = 1) => api.post('/organisations/quota/check/', { resource, amount }),

  // Get quota usage history
  getHistory: (params) => api.get('/organisations/quota/history/', { params }),

  // Request quota increase
  requestIncrease: (data) => api.post('/organisations/quota/request-increase/', data),
};

export default quotaApi;