import api from './api';

export const planApi = {
  // ============================================================
  // Plans
  // ============================================================

  /**
   * Get all subscription plans
   */
  list: () => api.get('/organisations/plans/'),

  /**
   * Get plan by ID
   * @param {string} id - Plan UUID
   */
  getById: (id) => api.get(`/organisations/plans/${id}/`),

  /**
   * Get plan comparison
   */
  getComparison: () => api.get('/organisations/plans/comparison/'),

  /**
   * Subscribe to a plan
   * @param {string} planId - Plan UUID
   * @param {Object} data - Subscription data
   */
  subscribe: (planId, data) => api.post(`/organisations/plans/${planId}/subscribe/`, data),

  /**
   * Get plan features
   * @param {string} id - Plan UUID
   */
  getFeatures: (id) => api.get(`/organisations/plans/${id}/features/`),
};