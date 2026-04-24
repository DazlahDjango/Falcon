import api from './api';

export const organisationApi = {
  // ============================================================
  // CRUD Operations
  // ============================================================
  
  /**
   * Get all organisations (Admin only)
   * @param {Object} params - Query parameters (page, limit, search, status, sector)
   */
  getAll: (params) => api.get('/organisations/', { params }),
  
  /**
   * Get organisation by ID
   * @param {string} id - Organisation UUID
   */
  getById: (id) => api.get(`/organisations/${id}/`),
  
  /**
   * Get current user's organisation
   */
  getCurrent: () => api.get('/organisations/current/'),
  
  /**
   * Create a new organisation
   * @param {Object} data - Organisation data
   */
  create: (data) => api.post('/organisations/', data),
  
  /**
   * Update organisation
   * @param {string} id - Organisation UUID
   * @param {Object} data - Updated organisation data
   */
  update: (id, data) => api.patch(`/organisations/${id}/`, data),
  
  /**
   * Delete organisation (Admin only)
   * @param {string} id - Organisation UUID
   */
  delete: (id) => api.delete(`/organisations/${id}/`),
  
  // ============================================================
  // Registration & Onboarding
  // ============================================================
  
  /**
   * Register a new organisation (public endpoint)
   * @param {Object} data - Registration data
   */
  register: (data) => api.post('/organisations/register/', data),
  
  /**
   * Complete organisation onboarding
   * @param {string} id - Organisation UUID
   * @param {Object} data - Onboarding data
   */
  completeOnboarding: (id, data) => api.post(`/organisations/${id}/onboarding/complete/`, data),
  
  /**
   * Get onboarding status
   * @param {string} id - Organisation UUID
   */
  getOnboardingStatus: (id) => api.get(`/organisations/${id}/onboarding/status/`),
  
  // ============================================================
  // Admin Actions
  // ============================================================
  
  /**
   * Approve pending organisation (Admin only)
   * @param {string} id - Organisation UUID
   */
  approve: (id) => api.post(`/organisations/${id}/approve/`),
  
  /**
   * Reject organisation (Admin only)
   * @param {string} id - Organisation UUID
   * @param {string} reason - Rejection reason
   */
  reject: (id, reason) => api.post(`/organisations/${id}/reject/`, { reason }),
  
  /**
   * Suspend organisation (Admin only)
   * @param {string} id - Organisation UUID
   * @param {string} reason - Suspension reason
   */
  suspend: (id, reason) => api.post(`/organisations/${id}/suspend/`, { reason }),
  
  /**
   * Activate suspended organisation (Admin only)
   * @param {string} id - Organisation UUID
   */
  activate: (id) => api.post(`/organisations/${id}/activate/`),
  
  /**
   * Submit organisation for review (Admin only)
   * @param {string} id - Organisation UUID
   * @param {string} notes - Review notes
   */
  submitReview: (id, notes) => api.post(`/organisations/${id}/review/`, { notes }),
  
  // ============================================================
  // Logo Management
  // ============================================================
  
  /**
   * Upload organisation logo
   * @param {File} file - Image file
   */
  uploadLogo: (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post('/organisations/logo/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  /**
   * Remove organisation logo
   */
  removeLogo: () => api.delete('/organisations/logo/'),
  
  // ============================================================
  // Statistics & Analytics
  // ============================================================
  
  /**
   * Get organisation statistics
   * @param {string} id - Organisation UUID
   */
  getStats: (id) => api.get(`/organisations/${id}/stats/`),
  
  /**
   * Get organisation usage metrics
   * @param {string} id - Organisation UUID
   */
  getUsage: (id) => api.get(`/organisations/${id}/usage/`),
  
  /**
   * Get overall organisation overview
   */
  getOverview: () => api.get('/organisations/overview/'),
  
  /**
   * Get organisation activity timeline
   * @param {string} id - Organisation UUID
   * @param {Object} params - Query parameters
   */
  getActivity: (id, params) => api.get(`/organisations/${id}/activity/`, { params }),

  /**
   * Get organisation hierarchy (user reporting structure)
   * @param {string} id - Organisation UUID
   */
  getHierarchy: (id) => api.get(`/organisations/${id}/hierarchy/`),
};

// ============================================================
// Contacts API
// ============================================================

export const contactApi = {
  getAll: (params) => api.get('/organisations/contacts/', { params }),
  getById: (id) => api.get(`/organisations/contacts/${id}/`),
  create: (data) => api.post('/organisations/contacts/', data),
  update: (id, data) => api.patch(`/organisations/contacts/${id}/`, data),
  delete: (id) => api.delete(`/organisations/contacts/${id}/`),
  setPrimary: (id) => api.post(`/organisations/contacts/${id}/set_primary/`),
};

// ============================================================
// Import/Export API
// ============================================================

export const exportApi = {
  exportData: (params) => api.get('/organisations/export/', { params, responseType: 'blob' }),
};

export const importApi = {
  preview: (formData) => api.post('/organisations/import/preview/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  confirm: (formData) => api.post('/organisations/import/confirm/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ============================================================
// Workflows & Approvals API
// ============================================================

export const approvalApi = {
  getRequests: (params) => api.get('/organisations/approvals/', { params }),
  getById: (id) => api.get(`/organisations/approvals/${id}/`),
  approve: (id, data) => api.post(`/organisations/approvals/${id}/approve/`, data),
  reject: (id, data) => api.post(`/organisations/approvals/${id}/reject/`, data),
  requestChanges: (id, data) => api.post(`/organisations/approvals/${id}/request_changes/`, data),
};

// ============================================================
// API Tokens API
// ============================================================

export const apiTokenApi = {
  getAll: (params) => api.get('/organisations/settings/api-keys/', { params }),
  create: (data) => api.post('/organisations/settings/api-keys/', data),
  revoke: (id) => api.delete(`/organisations/settings/api-keys/${id}/`),
};

// ============================================================
// Auth & MFA API
// ============================================================

export const authApi = {
  getMFAStatus: () => api.get('/auth/mfa/status/'),
  setupMFA: () => api.post('/auth/mfa/setup/'),
  verifyMFA: (data) => api.post('/auth/mfa/verify/'),
  disableMFA: () => api.post('/auth/mfa/disable/'),
  regenerateBackupCodes: () => api.post('/auth/mfa/codes/regenerate/'),
};
