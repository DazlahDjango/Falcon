import api from './api';

export const positionApi = {
  // ============================================================
  // CRUD Operations
  // ============================================================
  
  /**
   * Get all positions
   * @param {Object} params - Query parameters (department, level, is_management)
   */
  getAll: (params) => api.get('/organisations/positions/', { params }),
  
  /**
   * Get position by ID
   * @param {string} id - Position UUID
   */
  getById: (id) => api.get(`/organisations/positions/${id}/`),
  
  /**
   * Create a new position
   * @param {Object} data - Position data
   */
  create: (data) => api.post('/organisations/positions/', data),
  
  /**
   * Update position
   * @param {string} id - Position UUID
   * @param {Object} data - Updated position data
   */
  update: (id, data) => api.patch(`/organisations/positions/${id}/`, data),
  
  /**
   * Delete position
   * @param {string} id - Position UUID
   */
  delete: (id) => api.delete(`/organisations/positions/${id}/`),
  
  // ============================================================
  // Hierarchy
  // ============================================================
  
  /**
   * Get position hierarchy (reporting structure)
   */
  getHierarchy: () => api.get('/organisations/positions/hierarchy/'),
  
  /**
   * Get reporting line for a position
   * @param {string} id - Position UUID
   */
  getReportingLine: (id) => api.get(`/organisations/positions/${id}/reporting-line/`),
  
  /**
   * Get subordinates for a position
   * @param {string} id - Position UUID
   */
  getSubordinates: (id) => api.get(`/organisations/positions/${id}/subordinates/`),
  
  /**
   * Update reporting relationship
   * @param {string} id - Position UUID
   * @param {string} reportsToId - Position UUID this position reports to
   */
  updateReportingTo: (id, reportsToId) => api.patch(`/organisations/positions/${id}/reporting-to/`, { reports_to: reportsToId }),
  
  // ============================================================
  // Filters
  // ============================================================
  
  /**
   * Get positions by department
   * @param {string} departmentId - Department UUID
   */
  getByDepartment: (departmentId) => api.get(`/organisations/positions/?department=${departmentId}`),
  
  /**
   * Get positions by level
   * @param {number} level - Hierarchy level (1-8)
   */
  getByLevel: (level) => api.get(`/organisations/positions/?level=${level}`),
  
  /**
   * Get management positions
   */
  getManagement: () => api.get('/organisations/positions/?is_management=true'),
  
  // ============================================================
  // Statistics
  // ============================================================
  
  /**
   * Get position statistics
   * @param {string} id - Position UUID
   */
  getStats: (id) => api.get(`/organisations/positions/${id}/stats/`),
};