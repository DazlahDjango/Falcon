import api from './api';

export const kpiApi = {
  // ============================================================
  // CRUD Operations
  // ============================================================
  
  /**
   * Get all KPIs
   * @param {Object} params - Query parameters (department, owner, status, search)
   */
  getAll: (params) => api.get('/kpis/', { params }),
  
  /**
   * Get KPI by ID
   * @param {string} id - KPI UUID
   */
  getById: (id) => api.get(`/kpis/${id}/`),
  
  /**
   * Create a new KPI
   * @param {Object} data - KPI data
   */
  create: (data) => api.post('/kpis/', data),
  
  /**
   * Update KPI
   * @param {string} id - KPI UUID
   * @param {Object} data - Updated KPI data
   */
  update: (id, data) => api.patch(`/kpis/${id}/`, data),
  
  /**
   * Delete KPI
   * @param {string} id - KPI UUID
   */
  delete: (id) => api.delete(`/kpis/${id}/`),
  
  // ============================================================
  // KPI Data Entry
  // ============================================================
  
  /**
   * Submit actual value for KPI
   * @param {string} id - KPI UUID
   * @param {Object} data - Actual value data (value, period, notes)
   */
  submitActual: (id, data) => api.post(`/kpis/${id}/actuals/`, data),
  
  /**
   * Get KPI actuals history
   * @param {string} id - KPI UUID
   * @param {Object} params - Query parameters (period, year)
   */
  getActuals: (id, params) => api.get(`/kpis/${id}/actuals/`, { params }),
  
  /**
   * Get KPI performance history
   * @param {string} id - KPI UUID
   * @param {Object} params - Query parameters
   */
  getHistory: (id, params) => api.get(`/kpis/${id}/history/`, { params }),
  
  // ============================================================
  // Reports & Analytics
  // ============================================================
  
  /**
   * Get KPI overview dashboard
   * @param {Object} params - Query parameters
   */
  getOverview: (params) => api.get('/kpis/overview/', { params }),
  
  /**
   * Get detailed KPI report
   * @param {Object} params - Report parameters
   */
  getReport: (params) => api.get('/kpis/report/', { params }),
  
  /**
   * Get performance trend data
   * @param {Object} params - Query parameters (period, department)
   */
  getPerformanceTrend: (params) => api.get('/kpis/performance-trend/', { params }),
  
  /**
   * Export KPI report
   * @param {Object} params - Export parameters
   */
  exportReport: (params) => api.get('/kpis/report/export/', { params, responseType: 'blob' }),
  
  // ============================================================
  // Approvals
  // ============================================================
  
  /**
   * Submit KPI for approval
   * @param {string} id - KPI UUID
   */
  submitForApproval: (id) => api.post(`/kpis/${id}/submit-approval/`),
  
  /**
   * Approve KPI
   * @param {string} id - KPI UUID
   * @param {string} comment - Approval comment
   */
  approve: (id, comment) => api.post(`/kpis/${id}/approve/`, { comment }),
  
  /**
   * Reject KPI
   * @param {string} id - KPI UUID
   * @param {string} comment - Rejection reason
   */
  reject: (id, comment) => api.post(`/kpis/${id}/reject/`, { comment }),
  
  /**
   * Request changes to KPI
   * @param {string} id - KPI UUID
   * @param {string} comment - Change request details
   */
  requestChanges: (id, comment) => api.post(`/kpis/${id}/request-changes/`, { comment }),
  
  // ============================================================
  // Dashboard
  // ============================================================
  
  /**
   * Get KPI dashboard data
   */
  getDashboardData: () => api.get('/kpis/dashboard/'),
  
  /**
   * Get department KPI summary
   */
  getDepartmentSummary: () => api.get('/kpis/department-summary/'),
};