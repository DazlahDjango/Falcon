import api from './api';

export const teamApi = {
  // ============================================================
  // CRUD Operations
  // ============================================================
  
  /**
   * Get all teams
   * @param {Object} params - Query parameters (department, search)
   */
  getAll: (params) => api.get('/organisations/teams/', { params }),
  
  /**
   * Get team by ID
   * @param {string} id - Team UUID
   */
  getById: (id) => api.get(`/organisations/teams/${id}/`),
  
  /**
   * Create a new team
   * @param {Object} data - Team data
   */
  create: (data) => api.post('/organisations/teams/', data),
  
  /**
   * Update team
   * @param {string} id - Team UUID
   * @param {Object} data - Updated team data
   */
  update: (id, data) => api.patch(`/organisations/teams/${id}/`, data),
  
  /**
   * Delete team
   * @param {string} id - Team UUID
   */
  delete: (id) => api.delete(`/organisations/teams/${id}/`),
  
  // ============================================================
  // Members
  // ============================================================
  
  /**
   * Get team members
   * @param {string} id - Team UUID
   */
  getMembers: (id) => api.get(`/organisations/teams/${id}/members/`),
  
  /**
   * Add member to team
   * @param {string} id - Team UUID
   * @param {string} userId - User UUID
   */
  addMember: (id, userId) => api.post(`/organisations/teams/${id}/members/`, { user_id: userId }),
  
  /**
   * Bulk add members
   * @param {string} id - Team UUID
   * @param {Array} userIds - Array of user UUIDs
   */
  addMembers: (id, userIds) => api.post(`/organisations/teams/${id}/members/bulk/`, { user_ids: userIds }),
  
  /**
   * Remove member from team
   * @param {string} id - Team UUID
   * @param {string} userId - User UUID
   */
  removeMember: (id, userId) => api.delete(`/organisations/teams/${id}/members/${userId}/`),
  
  /**
   * Update member role in team
   * @param {string} id - Team UUID
   * @param {string} userId - User UUID
   * @param {string} role - Member role
   */
  updateMemberRole: (id, userId, role) => api.patch(`/organisations/teams/${id}/members/${userId}/`, { role }),
  
  // ============================================================
  // Team Lead
  // ============================================================
  
  /**
   * Set team lead
   * @param {string} id - Team UUID
   * @param {string} userId - User UUID
   */
  setTeamLead: (id, userId) => api.post(`/organisations/teams/${id}/set-lead/`, { user_id: userId }),
  
  /**
   * Remove team lead
   * @param {string} id - Team UUID
   */
  removeTeamLead: (id) => api.delete(`/organisations/teams/${id}/lead/`),
  
  // ============================================================
  // Statistics
  // ============================================================
  
  /**
   * Get team statistics
   * @param {string} id - Team UUID
   */
  getStats: (id) => api.get(`/organisations/teams/${id}/stats/`),
  
  /**
   * Get team performance
   * @param {string} id - Team UUID
   * @param {Object} params - Query parameters
   */
  getPerformance: (id, params) => api.get(`/organisations/teams/${id}/performance/`, { params }),
};