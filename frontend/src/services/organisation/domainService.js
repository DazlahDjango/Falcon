import api from './api';

export const domainApi = {
  // ============================================================
  // CRUD Operations
  // ============================================================
  
  /**
   * Get all domains
   */
  getAll: () => api.get('/organisations/domains/'),
  
  /**
   * Get domain by ID
   * @param {string} id - Domain UUID
   */
  getById: (id) => api.get(`/organisations/domains/${id}/`),
  
  /**
   * Create a new domain
   * @param {Object} data - Domain data
   */
  create: (data) => api.post('/organisations/domains/', data),
  
  /**
   * Update domain
   * @param {string} id - Domain UUID
   * @param {Object} data - Updated domain data
   */
  update: (id, data) => api.patch(`/organisations/domains/${id}/`, data),
  
  /**
   * Delete domain
   * @param {string} id - Domain UUID
   */
  delete: (id) => api.delete(`/organisations/domains/${id}/`),
  
  // ============================================================
  // Verification
  // ============================================================
  
  /**
   * Verify domain ownership
   * @param {string} id - Domain UUID
   */
  verify: (id) => api.post(`/organisations/domains/${id}/verify/`),
  
  /**
   * Get verification status
   * @param {string} id - Domain UUID
   */
  getVerificationStatus: (id) => api.get(`/organisations/domains/${id}/verification-status/`),
  
  /**
   * Get DNS instructions for verification
   * @param {string} id - Domain UUID
   */
  getDNSInstructions: (id) => api.get(`/organisations/domains/${id}/dns-instructions/`),
  
  // ============================================================
  // SSL Management
  // ============================================================
  
  /**
   * Get SSL certificate status
   * @param {string} id - Domain UUID
   */
  getSSLStatus: (id) => api.get(`/organisations/domains/${id}/ssl-status/`),
  
  /**
   * Renew SSL certificate
   * @param {string} id - Domain UUID
   */
  renewSSL: (id) => api.post(`/organisations/domains/${id}/renew-ssl/`),
  
  // ============================================================
  // Primary Domain
  // ============================================================
  
  /**
   * Set domain as primary
   * @param {string} id - Domain UUID
   */
  setPrimary: (id) => api.post(`/organisations/domains/${id}/set-primary/`),
};