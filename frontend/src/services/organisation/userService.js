import api from './api';

export const userApi = {
  // ============================================================
  // CRUD Operations
  // ============================================================
  
  /**
   * Get all users in organisation
   * @param {Object} params - Query parameters (page, limit, search, role, department)
   */
  getAll: (params) => api.get('/accounts/users/', { params }),
  
  /**
   * Get user by ID
   * @param {string} id - User UUID
   */
  getById: (id) => api.get(`/accounts/users/${id}/`),
  
  /**
   * Get current logged-in user
   */
  getCurrent: () => api.get('/accounts/users/current/'),
  
  /**
   * Create a new user
   * @param {Object} data - User data
   */
  create: (data) => api.post('/accounts/users/', data),
  
  /**
   * Update user
   * @param {string} id - User UUID
   * @param {Object} data - Updated user data
   */
  update: (id, data) => api.patch(`/accounts/users/${id}/`, data),
  
  /**
   * Delete user
   * @param {string} id - User UUID
   */
  delete: (id) => api.delete(`/accounts/users/${id}/`),
  
  // ============================================================
  // Invitations
  // ============================================================
  
  /**
   * Invite new user to organisation
   * @param {Object} data - Invitation data (email, name, role, department)
   */
  invite: (data) => api.post('/accounts/users/invite/', data),
  
  /**
   * Resend invitation email
   * @param {string} id - User UUID
   */
  resendInvite: (id) => api.post(`/accounts/users/${id}/resend-invite/`),
  
  /**
   * Cancel pending invitation
   * @param {string} id - User UUID
   */
  cancelInvite: (id) => api.post(`/accounts/users/${id}/cancel-invite/`),
  
  // ============================================================
  // Role Management
  // ============================================================
  
  /**
   * Update user role
   * @param {string} id - User UUID
   * @param {string} role - New role (admin, manager, staff, viewer)
   */
  updateRole: (id, role) => api.patch(`/accounts/users/${id}/role/`, { role }),
  
  /**
   * Get all available roles
   */
  getRoles: () => api.get('/accounts/roles/'),
  
  // ============================================================
  // Status Management
  // ============================================================
  
  /**
   * Activate user account
   * @param {string} id - User UUID
   */
  activate: (id) => api.post(`/accounts/users/${id}/activate/`),
  
  /**
   * Deactivate user account
   * @param {string} id - User UUID
   */
  deactivate: (id) => api.post(`/accounts/users/${id}/deactivate/`),
  
  /**
   * Toggle user active status
   * @param {string} id - User UUID
   */
  toggleStatus: (id) => api.post(`/accounts/users/${id}/toggle-status/`),
  
  // ============================================================
  // Password Management
  // ============================================================
  
  /**
   * Change user password (admin)
   * @param {string} id - User UUID
   * @param {Object} data - Password data
   */
  changePassword: (id, data) => api.post(`/accounts/users/${id}/change-password/`, data),
  
  /**
   * Request password reset
   * @param {string} email - User email
   */
  resetPassword: (email) => api.post('/accounts/users/reset-password/', { email }),
  
  // ============================================================
  // Activity & Reports
  // ============================================================
  
  /**
   * Get user activity log
   * @param {string} id - User UUID
   * @param {Object} params - Query parameters
   */
  getActivity: (id, params) => api.get(`/accounts/users/${id}/activity/`, { params }),
  
  /**
   * Get user activity report
   * @param {Object} params - Report parameters
   */
  getActivityReport: (params) => api.get('/accounts/users/activity-report/', { params }),
  
  /**
   * Export user activity report
   * @param {Object} params - Export parameters
   */
  exportActivityReport: (params) => api.get('/accounts/users/activity-report/export/', { 
    params, 
    responseType: 'blob' 
  }),
};

// ============================================================
// Roles API
// ============================================================

export const roleApi = {
  getAll: () => api.get('/accounts/roles/'),
  getById: (id) => api.get(`/accounts/roles/${id}/`),
};