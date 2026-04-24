import api from './api';

export const auditApi = {
  // ============================================================
  // Audit Logs
  // ============================================================
  
  /**
   * Get all audit logs
   * @param {Object} params - Query parameters (page, limit, action, user, start_date, end_date)
   */
  getAll: (params) => api.get('/organisations/audit-logs/', { params }),
  
  /**
   * Get audit log by ID
   * @param {string} id - Audit log UUID
   */
  getById: (id) => api.get(`/organisations/audit-logs/${id}/`),
  
  /**
   * Get audit statistics
   */
  getStats: () => api.get('/organisations/audit-logs/stats/'),
  
  /**
   * Export audit logs
   * @param {Object} params - Export parameters (format, date_range, action, user)
   */
  export: (params) => api.get('/organisations/audit-logs/export/', { params, responseType: 'blob' }),
  
  // ============================================================
  // Filtered Queries
  // ============================================================
  
  /**
   * Get logs by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   */
  getByDateRange: (startDate, endDate) => api.get('/organisations/audit-logs/', { 
    params: { start_date: startDate, end_date: endDate } 
  }),
  
  /**
   * Get logs by user
   * @param {string} userId - User UUID
   */
  getByUser: (userId) => api.get('/organisations/audit-logs/', { params: { user_id: userId } }),
  
  /**
   * Get logs by action type
   * @param {string} action - Action type (created, updated, deleted, etc.)
   */
  getByAction: (action) => api.get('/organisations/audit-logs/', { params: { action } }),
  
  /**
   * Get logs by model name
   * @param {string} modelName - Model name (organisation, user, department, etc.)
   */
  getByModel: (modelName) => api.get('/organisations/audit-logs/', { params: { model_name: modelName } }),
  
  // ============================================================
  // Retention Policy
  // ============================================================
  
  /**
   * Get audit log retention policy
   */
  getRetentionPolicy: () => api.get('/organisations/audit-logs/retention-policy/'),
  
  /**
   * Update retention policy
   * @param {number} days - Number of days to retain logs
   */
  updateRetentionPolicy: (days) => api.patch('/organisations/audit-logs/retention-policy/', { retention_days: days }),
};