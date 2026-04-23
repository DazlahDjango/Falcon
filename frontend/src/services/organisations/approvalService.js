// Organisation Approval Service
// Handles workflow approvals and approval requests

import api from './api';

export const approvalApi = {
  // Get approval requests
  getAll: (params) => api.get('/organisations/approvals/', { params }),

  // Get approval request by ID
  getById: (id) => api.get(`/organisations/approvals/${id}/`),

  // Create approval request
  create: (data) => api.post('/organisations/approvals/', data),

  // Update approval request
  update: (id, data) => api.patch(`/organisations/approvals/${id}/`, data),

  // Approve request
  approve: (id, data) => api.post(`/organisations/approvals/${id}/approve/`, data),

  // Reject request
  reject: (id, data) => api.post(`/organisations/approvals/${id}/reject/`, data),

  // Get approval history
  getHistory: (id) => api.get(`/organisations/approvals/${id}/history/`),

  // Get pending approvals for current user
  getPending: () => api.get('/organisations/approvals/pending/'),

  // Bulk approve/reject
  bulkAction: (data) => api.post('/organisations/approvals/bulk-action/', data),
};

export default approvalApi;