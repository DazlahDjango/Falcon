import api from './api';

export const departmentApi = {
  // ============================================================
  // CRUD Operations
  // ============================================================
  
  /**
   * Get all departments
   * @param {Object} params - Query parameters (organisation, parent, search)
   */
  getAll: (params) => api.get('/organisations/departments/', { params }),
  
  /**
   * Get department by ID
   * @param {string} id - Department UUID
   */
  getById: (id) => api.get(`/organisations/departments/${id}/`),
  
  /**
   * Create a new department
   * @param {Object} data - Department data
   */
  create: (data) => api.post('/organisations/departments/', data),
  
  /**
   * Update department
   * @param {string} id - Department UUID
   * @param {Object} data - Updated department data
   */
  update: (id, data) => api.patch(`/organisations/departments/${id}/`, data),
  
  /**
   * Delete department
   * @param {string} id - Department UUID
   */
  delete: (id) => api.delete(`/organisations/departments/${id}/`),
  
  // ============================================================
  // Hierarchy
  // ============================================================
  
  /**
   * Get department tree (hierarchy)
   */
  getTree: () => api.get('/organisations/departments/tree/'),
  
  /**
   * Get sub-departments
   * @param {string} id - Parent department UUID
   */
  getSubDepartments: (id) => api.get(`/organisations/departments/${id}/sub-departments/`),
  
  /**
   * Get department ancestors
   * @param {string} id - Department UUID
   */
  getAncestors: (id) => api.get(`/organisations/departments/${id}/ancestors/`),
  
  /**
   * Get department descendants
   * @param {string} id - Department UUID
   */
  getDescendants: (id) => api.get(`/organisations/departments/${id}/descendants/`),
  
  /**
   * Move department to new parent
   * @param {string} id - Department UUID
   * @param {string} newParentId - New parent department UUID
   */
  moveDepartment: (id, newParentId) => api.patch(`/organisations/departments/${id}/move/`, { parent_id: newParentId }),
  
  // ============================================================
  // Members
  // ============================================================
  
  /**
   * Get department members
   * @param {string} id - Department UUID
   */
  getMembers: (id) => api.get(`/organisations/departments/${id}/members/`),
  
  /**
   * Add member to department
   * @param {string} id - Department UUID
   * @param {string} userId - User UUID
   * @param {string} role - User role in department
   */
  addMember: (id, userId, role) => api.post(`/organisations/departments/${id}/members/`, { user_id: userId, role }),
  
  /**
   * Remove member from department
   * @param {string} id - Department UUID
   * @param {string} userId - User UUID
   */
  removeMember: (id, userId) => api.delete(`/organisations/departments/${id}/members/${userId}/`),
  
  /**
   * Bulk add members
   * @param {string} id - Department UUID
   * @param {Array} userIds - Array of user UUIDs
   */
  addMembers: (id, userIds) => api.post(`/organisations/departments/${id}/members/bulk/`, { user_ids: userIds }),
  
  // ============================================================
  // Manager
  // ============================================================
  
  /**
   * Set department manager
   * @param {string} id - Department UUID
   * @param {string} userId - User UUID
   */
  setManager: (id, userId) => api.post(`/organisations/departments/${id}/set-manager/`, { user_id: userId }),
  
  /**
   * Remove department manager
   * @param {string} id - Department UUID
   */
  removeManager: (id) => api.delete(`/organisations/departments/${id}/manager/`),
  
  // ============================================================
  // Statistics
  // ============================================================
  
  /**
   * Get department statistics
   * @param {string} id - Department UUID
   */
  getStats: (id) => api.get(`/organisations/departments/${id}/stats/`),
  
  /**
   * Get department performance
   * @param {string} id - Department UUID
   * @param {Object} params - Query parameters (period, year)
   */
  getPerformance: (id, params) => api.get(`/organisations/departments/${id}/performance/`, { params }),
};